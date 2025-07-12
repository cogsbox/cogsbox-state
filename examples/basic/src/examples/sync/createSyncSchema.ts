import {
  createSchema,
  Schema,
  type SQLType,
  type RelationType,
  RelationConfig,
} from 'cogsbox-shape';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import { SerializedQuery, TypedQueryBuilder } from './notificationBuilder';

type SerializableFieldMetadata = {
  type: 'field';
  sql: SQLType;
};

type SerializableRelationMetadata = {
  type: 'relation';
  relationType: RelationType;
  fromKey: string;
  toKey: string;
  schema: SerializableSchemaMetadata;
};

type SerializableSchemaMetadata = {
  _tableName: string;
  primaryKey: string | null;
  fields: Record<string, SerializableFieldMetadata>;
  relations: Record<string, SerializableRelationMetadata>;
};
// REPLACE your old serializeSchemaMetadata function with this one.
function serializeSchemaMetadata(
  schema: Schema<any>
): SerializableSchemaMetadata {
  const fields: Record<string, SerializableFieldMetadata> = {};
  const relations: Record<string, SerializableRelationMetadata> = {};
  let primaryKey: string | null = null;

  for (const key in schema) {
    if (key === '_tableName' || key.startsWith('__')) continue;

    const definition = (schema as any)[key];

    if (definition && definition.config && definition.config.sql) {
      const sqlConfig = definition.config.sql;

      if (
        typeof sqlConfig === 'object' &&
        ['hasMany', 'hasOne', 'belongsTo', 'manyToMany'].includes(
          sqlConfig.type
        )
      ) {
        // This is a relation builder. We will handle its `toKey` in the calling function.
        // We just need to know its shape here.
        const relation = sqlConfig as RelationConfig<any>;
        relations[key] = {
          type: 'relation',
          relationType: relation.type as any,
          fromKey: relation.fromKey,
          // The `toKey` will be populated by the caller using the Proxy.
          // We put a placeholder here.
          toKey: '__to_be_replaced__',
          schema: serializeSchemaMetadata(relation.schema()),
        };
      } else {
        // It's a regular field builder.
        fields[key] = { type: 'field', sql: sqlConfig };
        if (sqlConfig.pk === true) {
          if (primaryKey)
            console.warn(
              `[cogsbox-shape] Multiple primary keys found. Using last one: '${key}'.`
            );
          primaryKey = key;
        }
      }
    }
  }

  return { _tableName: schema._tableName, primaryKey, fields, relations };
}
type NotificationFunction<TState, TContext, TReturn> = (
  state: TState,
  context: TContext
) => TReturn | null;

// Helper type to extract the return type from notification functions
// type ExtractNotificationReturnTypes<T> = {
//   [K in keyof T]: T[K] extends NotificationFunction<any, any, infer R>
//     ? R
//     : never;
// };

type ExtractClientType<T extends { _tableName: string }> = ReturnType<
  typeof createSchema<T>
>['clientSchema']['_type'];

// Update the ProcessedSyncSchemaEntry type
export type ProcessedSyncSchemaEntry<T extends { _tableName: string }> = {
  rawSchema: T;
  schemas: ReturnType<typeof createSchema<T>>;
  validate: (data: unknown) => z.SafeParseReturnType<any, any>;
  validateClient: (data: unknown) => z.SafeParseReturnType<any, any>;
  notificationChannelsBuilder?: Record<
    string,
    SerializedQuery<ExtractClientType<T>>
  >;
  notificationFunctions?: Record<string, NotificationFunction<any, any, any>>;
  serializable: {
    key: string;
    validationJsonSchema: object;
    clientJsonSchema: object;
    metadata: SerializableSchemaMetadata;
  };
};

export type ProcessedSyncSchemaMap<
  T extends Record<string, { _tableName: string }>,
> = {
  [K in keyof T]: ProcessedSyncSchemaEntry<T[K]>;
};

export function createSyncContext<TContext>() {
  return function createSyncSchemaWithContext<
    T extends Record<string, { _tableName: string }>,
  >(config: {
    [K in keyof T]: {
      schema: T[K];
      validation?: (
        schema: ReturnType<typeof createSchema<T[K]>>['validationSchema']
      ) => z.ZodSchema;
      client?: (
        schema: ReturnType<typeof createSchema<T[K]>>['clientSchema']
      ) => z.ZodSchema;
      notificationChannelsBuilder?: Record<
        string,
        (
          queryBuilder: TypedQueryBuilder<ExtractClientType<T[K]>>
        ) => SerializedQuery<ExtractClientType<T[K]>>
      >;
      notificationChannels?: Record<
        string,
        NotificationFunction<ExtractClientType<T[K]>, TContext, any>
      >;
    };
  }): ProcessedSyncSchemaMap<T> {
    return createSyncSchema(config);
  };
}

export function createSyncSchema<
  T extends Record<string, { _tableName: string }>,
  TContext = any,
>(config: {
  [K in keyof T]: {
    schema: T[K];
    validation?: (
      schema: ReturnType<typeof createSchema<T[K]>>['validationSchema']
    ) => z.ZodSchema;
    client?: (
      schema: ReturnType<typeof createSchema<T[K]>>['clientSchema']
    ) => z.ZodSchema;
    notificationChannelsBuilder?: Record<
      string,
      (
        queryBuilder: TypedQueryBuilder<ExtractClientType<T[K]>>
      ) => SerializedQuery<ExtractClientType<T[K]>>
    >;
    notificationChannels?: Record<
      string,
      NotificationFunction<ExtractClientType<T[K]>, TContext, any>
    >;
  };
}): ProcessedSyncSchemaMap<T> {
  const processedOutput = {} as ProcessedSyncSchemaMap<T>;

  for (const key in config) {
    const entry = (config as any)[key];

    // The Zod schemas are built first
    const { sqlSchema, clientSchema, validationSchema, defaultValues } =
      createSchema(entry.schema);
    const finalValidationSchema = entry.validation
      ? entry.validation(validationSchema)
      : validationSchema;
    const finalClientSchema = entry.client
      ? entry.client(clientSchema)
      : clientSchema;

    // The JSON schemas are derived from the final Zod schemas
    const validationJsonSchema = zodToJsonSchema(finalValidationSchema, {
      target: 'jsonSchema7',
      $refStrategy: 'none',
    });
    const clientJsonSchema = zodToJsonSchema(finalClientSchema, {
      target: 'jsonSchema7',
      $refStrategy: 'none',
    });

    // The metadata is serialized using our new, robust function
    const metadata = serializeSchemaMetadata(entry.schema);

    // Process notification channels if provided
    let processedNotificationBuilder:
      | Record<string, SerializedQuery<any>>
      | undefined;
    if (entry.notificationChannelsBuilder) {
      processedNotificationBuilder = {};
      for (const channelName in entry.notificationChannelsBuilder) {
        const channelBuilder = entry.notificationChannelsBuilder[channelName];
        const queryBuilder = new TypedQueryBuilder<
          ExtractClientType<T[typeof key]>
        >(entry.schema._tableName);
        processedNotificationBuilder[channelName] =
          channelBuilder(queryBuilder);
      }
    }
    let processedNotificationFunctions:
      | Record<string, NotificationFunction<any, any, any>>
      | undefined;

    if (entry.notificationChannels) {
      processedNotificationFunctions = {};

      for (const channelName in entry.notificationChannels) {
        const notificationFn = entry.notificationChannels[channelName];
        processedNotificationFunctions[channelName] = notificationFn;
      }
    }

    // The final entry is assembled
    (processedOutput as any)[key] = {
      rawSchema: entry.schema,
      schemas: {
        sql: sqlSchema,
        client: clientSchema,
        validation: validationSchema,
        defaults: defaultValues,
      },
      validate: (data: unknown) => finalValidationSchema.safeParse(data),
      validateClient: (data: unknown) => finalClientSchema.safeParse(data),
      notificationChannelsBuilder: processedNotificationBuilder,
      notificationFunctions: processedNotificationFunctions,
      serializable: {
        key,
        validationJsonSchema,
        clientJsonSchema,
        metadata,
      },
    };
  }

  return processedOutput;
}
