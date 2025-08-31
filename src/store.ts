import { create } from 'zustand';

import type {
  OptionsType,
  ReactivityType,
  SyncInfo,
  UpdateTypeDetail,
} from './CogsState.js';

import { type ReactNode } from 'react';

export type FreshValuesObject = {
  pathsToValues?: string[];
  prevValue?: any;
  newValue?: any;
  timeStamp: number;
};

type StateValue = any;

export type TrieNode = {
  subscribers: Set<string>;
  children: Map<string, TrieNode>;
};

export type FormRefStoreState = {
  formRefs: Map<string, React.RefObject<any>>;
  registerFormRef: (id: string, ref: React.RefObject<any>) => void;
  getFormRef: (id: string) => React.RefObject<any> | undefined;
  removeFormRef: (id: string) => void;
  getFormRefsByStateKey: (
    stateKey: string
  ) => Map<string, React.RefObject<any>>;
};

export const formRefStore = create<FormRefStoreState>((set, get) => ({
  formRefs: new Map(),

  registerFormRef: (id, ref) =>
    set((state) => {
      const newRefs = new Map(state.formRefs);
      newRefs.set(id, ref);
      return { formRefs: newRefs };
    }),

  getFormRef: (id) => get().formRefs.get(id),

  removeFormRef: (id) =>
    set((state) => {
      const newRefs = new Map(state.formRefs);
      newRefs.delete(id);
      return { formRefs: newRefs };
    }),

  getFormRefsByStateKey: (stateKey) => {
    const allRefs = get().formRefs;
    const stateKeyPrefix = stateKey + '.';
    const filteredRefs = new Map();

    allRefs.forEach((ref, id) => {
      if (id.startsWith(stateKeyPrefix) || id === stateKey) {
        filteredRefs.set(id, ref);
      }
    });

    return filteredRefs;
  },
}));
export type ComponentsType = {
  components?: Map<
    string,
    {
      forceUpdate: () => void;
      paths: Set<string>;
      deps?: any[];
      prevDeps?: any[];
      depsFunction?: (state: any) => any[] | true;
      reactiveType: ReactivityType[] | ReactivityType;
    }
  >;
};

export type ValidationStatus =
  | 'NOT_VALIDATED'
  | 'VALIDATING'
  | 'VALID'
  | 'INVALID';
export type ValidationSeverity = 'warning' | 'error' | undefined;
export type ValidationError = {
  source: 'client' | 'sync_engine' | 'api';
  message: string;
  severity: ValidationSeverity;
  code?: string;
};

export type ValidationState = {
  status: ValidationStatus;
  errors: ValidationError[];
  lastValidated?: number;
  validatedValue?: any;
};
export type TypeInfo = {
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | 'array'
    | 'object'
    | 'date'
    | 'unknown';
  schema: any; // Store the actual Zod schema object
  source: 'sync' | 'zod4' | 'zod3' | 'runtime' | 'default';
  default: any;
  nullable?: boolean;
  optional?: boolean;
};

// Update ShadowMetadata to include typeInfo
export type ShadowMetadata = {
  value?: any;
  syncArrayIdPrefix?: string;
  id?: string;
  typeInfo?: TypeInfo;
  stateSource?: 'default' | 'server' | 'localStorage';
  lastServerSync?: number;
  isDirty?: boolean;
  baseServerState?: any;
  arrayKeys?: string[];
  fields?: Record<string, any>;
  virtualizer?: {
    itemHeight?: number;
    domRef?: HTMLElement | null;
  };
  syncInfo?: { status: string };
  validation?: ValidationState;
  features?: {
    syncEnabled: boolean;
    validationEnabled: boolean;
    localStorageEnabled: boolean;
  };
  signals?: Array<{
    instanceId: string;
    parentId: string;
    position: number;
    effect?: string;
  }>;

  transformCaches?: Map<
    string,
    {
      validIds: string[];
      computedAt: number;
      transforms: Array<{ type: 'filter' | 'sort'; fn: Function }>;
    }
  >;
  pathComponents?: Set<string>;
  streams?: Map<
    string,
    {
      buffer: any[];
      flushTimer: NodeJS.Timeout | null;
    }
  >;
} & ComponentsType;

type ShadowNode = {
  _meta?: ShadowMetadata;
  [key: string]: any;
};

export type CogsGlobalState = {
  setTransformCache: (
    key: string,
    path: string[],
    cacheKey: string,
    cacheData: any
  ) => void;
  initializeShadowState: (key: string, initialState: any) => void;
  getShadowNode: (key: string, path: string[]) => ShadowNode | undefined;
  getShadowMetadata: (
    key: string,
    path: string[]
  ) => ShadowMetadata | undefined;

  setShadowMetadata: (key: string, path: string[], metadata: any) => void;
  getShadowValue: (
    key: string,
    path: string[],
    validArrayIds?: string[],
    log?: boolean
  ) => any;
  updateShadowAtPath: (key: string, path: string[], newValue: any) => void;
  insertManyShadowArrayElements: (
    key: string,
    arrayPath: string[],
    newItems: any[],
    index?: number
  ) => void;
  addItemsToArrayNode: (
    key: string,
    arrayPath: string[],
    newItems: any,
    newKeys: string[]
  ) => void;
  insertShadowArrayElement: (
    key: string,
    arrayPath: string[],
    newItem: any,
    index?: number
  ) => string;
  removeShadowArrayElement: (key: string, itemPath: string[]) => void;
  registerComponent: (
    stateKey: string,
    componentId: string,
    registration: any
  ) => void;
  unregisterComponent: (stateKey: string, componentId: string) => void;
  addPathComponent: (
    stateKey: string,
    dependencyPath: string[],
    fullComponentId: string
  ) => void;
  markAsDirty: (
    key: string,
    path: string[],
    options: { bubble: boolean }
  ) => void;

  pathSubscribers: Map<string, Set<(newValue: any) => void>>;
  subscribeToPath: (
    path: string,
    callback: (newValue: any) => void
  ) => () => void;
  notifyPathSubscribers: (updatedPath: string, newValue: any) => void;

  selectedIndicesMap: Map<string, string>; // stateKey -> (parentPath -> selectedIndex)
  getSelectedIndex: (stateKey: string, validArrayIds?: string[]) => number;
  setSelectedIndex: (key: string, itemKey: string) => void;
  clearSelectedIndex: ({ arrayKey }: { arrayKey: string }) => void;
  clearSelectedIndexesForState: (stateKey: string) => void;

  initialStateOptions: { [key: string]: OptionsType };
  initialStateGlobal: { [key: string]: StateValue };
  updateInitialStateGlobal: (key: string, newState: StateValue) => void;

  getInitialOptions: (key: string) => OptionsType | undefined;
  setInitialStateOptions: (key: string, value: OptionsType) => void;

  serverStateUpdates: Map<
    string,
    {
      data: any;
      status: 'loading' | 'success' | 'error';
      timestamp: number;
    }
  >;

  setServerStateUpdate: (key: string, serverState: any) => void;

  stateLog: Map<string, Map<string, UpdateTypeDetail>>;
  syncInfoStore: Map<string, SyncInfo>;
  addStateLog: (updates: UpdateTypeDetail[]) => void;

  setSyncInfo: (key: string, syncInfo: SyncInfo) => void;
  getSyncInfo: (key: string) => SyncInfo | null;
};

function getTypeFromZodSchema(
  schema: any,
  source: 'zod4' | 'zod3' | 'sync' = 'zod4'
): TypeInfo | null {
  if (!schema) return null;

  let baseSchema = schema;
  let isNullable = false;
  let isOptional = false;
  let defaultValue: any = undefined;
  let hasDefault = false;

  // Zod v4 unwrapping
  if (schema._def) {
    let current = schema;

    // Keep unwrapping until we get to the base type
    while (current._def) {
      const typeName = current._def.typeName;

      if (typeName === 'ZodOptional') {
        isOptional = true;
        current = current._def.innerType || current.unwrap();
      } else if (typeName === 'ZodNullable') {
        isNullable = true;
        current = current._def.innerType || current.unwrap();
      } else if (typeName === 'ZodDefault') {
        hasDefault = true;
        defaultValue = current._def.defaultValue();
        current = current._def.innerType;
      } else if (typeName === 'ZodEffects') {
        // Handle .refine(), .transform() etc
        current = current._def.schema;
      } else {
        // We've reached the base type
        break;
      }
    }

    baseSchema = current;
    const typeName = baseSchema._def?.typeName;

    if (typeName === 'ZodNumber') {
      return {
        type: 'number',
        schema: schema, // Store the original schema with wrappers
        source,
        default: hasDefault ? defaultValue : 0,
        nullable: isNullable,
        optional: isOptional,
      };
    } else if (typeName === 'ZodString') {
      return {
        type: 'string',
        schema: schema,
        source,
        default: hasDefault ? defaultValue : '',
        nullable: isNullable,
        optional: isOptional,
      };
    } else if (typeName === 'ZodBoolean') {
      return {
        type: 'boolean',
        schema: schema,
        source,
        default: hasDefault ? defaultValue : false,
        nullable: isNullable,
        optional: isOptional,
      };
    } else if (typeName === 'ZodArray') {
      return {
        type: 'array',
        schema: schema,
        source,
        default: hasDefault ? defaultValue : [],
        nullable: isNullable,
        optional: isOptional,
      };
    } else if (typeName === 'ZodObject') {
      return {
        type: 'object',
        schema: schema,
        source,
        default: hasDefault ? defaultValue : {},
        nullable: isNullable,
        optional: isOptional,
      };
    } else if (typeName === 'ZodDate') {
      return {
        type: 'date',
        schema: schema,
        source,
        default: hasDefault ? defaultValue : new Date(),
        nullable: isNullable,
        optional: isOptional,
      };
    }
  }

  // Zod v3 unwrapping
  if (schema._type) {
    let current = schema;

    // Check for wrappers in v3
    while (current) {
      if (current._type === 'optional') {
        isOptional = true;
        current = current._def?.innerType || current._inner;
      } else if (current._type === 'nullable') {
        isNullable = true;
        current = current._def?.innerType || current._inner;
      } else if (current._def?.defaultValue !== undefined) {
        hasDefault = true;
        defaultValue =
          typeof current._def.defaultValue === 'function'
            ? current._def.defaultValue()
            : current._def.defaultValue;
        break;
      } else {
        break;
      }
    }

    baseSchema = current;

    if (baseSchema._type === 'number') {
      return {
        type: 'number',
        schema: schema,
        source,
        default: hasDefault ? defaultValue : 0,
        nullable: isNullable,
        optional: isOptional,
      };
    } else if (baseSchema._type === 'string') {
      return {
        type: 'string',
        schema: schema,
        source,
        default: hasDefault ? defaultValue : '',
        nullable: isNullable,
        optional: isOptional,
      };
    } else if (baseSchema._type === 'boolean') {
      return {
        type: 'boolean',
        schema: schema,
        source,
        default: hasDefault ? defaultValue : false,
        nullable: isNullable,
        optional: isOptional,
      };
    } else if (baseSchema._type === 'array') {
      return {
        type: 'array',
        schema: schema,
        source,
        default: hasDefault ? defaultValue : [],
        nullable: isNullable,
        optional: isOptional,
      };
    } else if (baseSchema._type === 'object') {
      return {
        type: 'object',
        schema: schema,
        source,
        default: hasDefault ? defaultValue : {},
        nullable: isNullable,
        optional: isOptional,
      };
    } else if (baseSchema._type === 'date') {
      return {
        type: 'date',
        schema: schema,
        source,
        default: hasDefault ? defaultValue : new Date(),
        nullable: isNullable,
        optional: isOptional,
      };
    }
  }

  return null;
}

// Helper to get type info from runtime value
function getTypeFromValue(value: any): TypeInfo {
  if (value === null) {
    return {
      type: 'unknown',
      schema: null,
      source: 'default',
      default: null,
      nullable: true,
    };
  }

  if (value === undefined) {
    return {
      type: 'unknown',
      schema: null,
      source: 'default',
      default: undefined,
      optional: true,
    };
  }

  const valueType = typeof value;

  if (valueType === 'number') {
    return { type: 'number', schema: null, source: 'runtime', default: value };
  } else if (valueType === 'string') {
    return { type: 'string', schema: null, source: 'runtime', default: value };
  } else if (valueType === 'boolean') {
    return { type: 'boolean', schema: null, source: 'runtime', default: value };
  } else if (Array.isArray(value)) {
    return { type: 'array', schema: null, source: 'runtime', default: [] };
  } else if (value instanceof Date) {
    return { type: 'date', schema: null, source: 'runtime', default: value };
  } else if (valueType === 'object') {
    return { type: 'object', schema: null, source: 'runtime', default: {} };
  }

  return { type: 'unknown', schema: null, source: 'runtime', default: value };
}
type BuildContext = {
  stateKey: string;
  path: string[];
  schemas: {
    sync?: any;
    zodV4?: any;
    zodV3?: any;
  };
};
// Update buildShadowNode to use the new schema storage
export function buildShadowNode(
  stateKey: string,
  value: any,
  context?: BuildContext
): ShadowNode {
  // For primitive values
  if (value === null || value === undefined || typeof value !== 'object') {
    const node: ShadowNode = { _meta: {} };
    node._meta!.value = value;
    if (context) {
      let typeInfo: TypeInfo | null = null;

      // 1. Try to get type from sync schema
      if (context.schemas.sync && context.schemas.sync[context.stateKey]) {
        const syncEntry = context.schemas.sync[context.stateKey];
        if (syncEntry.schemas?.validation) {
          // Navigate to the field in the validation schema
          let fieldSchema = syncEntry.schemas.validation;
          for (const segment of context.path) {
            if (fieldSchema?.shape) {
              fieldSchema = fieldSchema.shape[segment];
            } else if (fieldSchema?._def?.shape) {
              fieldSchema = fieldSchema._def.shape()[segment];
            }
          }

          if (fieldSchema) {
            typeInfo = getTypeFromZodSchema(fieldSchema, 'sync');
            if (typeInfo) {
              // Use the default from sync schema if available
              if (syncEntry.schemas.defaults) {
                let defaultValue = syncEntry.schemas.defaults;
                for (const segment of context.path) {
                  if (defaultValue && typeof defaultValue === 'object') {
                    defaultValue = defaultValue[segment];
                  }
                }
                if (defaultValue !== undefined) {
                  typeInfo.default = defaultValue;
                  // If no value provided and not optional, use the default
                  if (
                    (value === undefined || value === null) &&
                    !typeInfo.optional
                  ) {
                    node._meta!.value = defaultValue;
                  }
                }
              }
            }
          }
        }
      }

      // 2. If no sync schema, try Zod v4
      if (!typeInfo && context.schemas.zodV4) {
        let fieldSchema = context.schemas.zodV4;
        for (const segment of context.path) {
          if (fieldSchema?.shape) {
            fieldSchema = fieldSchema.shape[segment];
          } else if (fieldSchema?._def?.shape) {
            fieldSchema = fieldSchema._def.shape()[segment];
          }
        }

        if (fieldSchema) {
          typeInfo = getTypeFromZodSchema(fieldSchema, 'zod4');
          if (typeInfo && (value === undefined || value === null)) {
            // Only use default if the field is not optional/nullable
            if (!typeInfo.optional && !typeInfo.nullable) {
              node.value = typeInfo.default;
            }
          }
        }
      }

      // 3. If no Zod v4, try Zod v3
      if (!typeInfo && context.schemas.zodV3) {
        let fieldSchema = context.schemas.zodV3;
        for (const segment of context.path) {
          if (fieldSchema?.shape) {
            fieldSchema = fieldSchema.shape[segment];
          } else if (fieldSchema?._shape) {
            fieldSchema = fieldSchema._shape[segment];
          }
        }

        if (fieldSchema) {
          typeInfo = getTypeFromZodSchema(fieldSchema, 'zod3');
          if (typeInfo && (value === undefined || value === null)) {
            // Only use default if the field is not optional/nullable
            if (!typeInfo.optional && !typeInfo.nullable) {
              node.value = typeInfo.default;
            }
          }
        }
      }

      // 4. Fall back to runtime type
      if (!typeInfo) {
        typeInfo = getTypeFromValue(node._meta!.value);
      }

      // Store the type info
      if (typeInfo) {
        if (!node._meta) node._meta = {};
        node._meta.typeInfo = typeInfo;
      }
    } else {
      // No context, just use runtime type
      const typeInfo = getTypeFromValue(value);
      if (!node._meta) node._meta = {};
      node._meta.typeInfo = typeInfo;
    }

    return node;
  }

  // For arrays
  if (Array.isArray(value)) {
    const arrayNode: ShadowNode = { _meta: { arrayKeys: [] } };
    const idKeys: string[] = [];

    value.forEach((item, index) => {
      const itemId = `${generateId(stateKey)}`;
      // Pass context down for array items
      const itemContext = context
        ? {
            ...context,
            path: [...context.path, index.toString()],
          }
        : undefined;
      arrayNode[itemId] = buildShadowNode(stateKey, item, itemContext);
      idKeys.push(itemId);
    });

    arrayNode._meta!.arrayKeys = idKeys;
    if (context) {
      // Try to get the array schema
      let arraySchema = null;

      if (context.schemas.zodV4) {
        let fieldSchema = context.schemas.zodV4;
        for (const segment of context.path) {
          if (fieldSchema?.shape) {
            fieldSchema = fieldSchema.shape[segment];
          } else if (fieldSchema?._def?.shape) {
            fieldSchema = fieldSchema._def.shape()[segment];
          }
        }
        arraySchema = fieldSchema;
      }

      arrayNode._meta!.typeInfo = {
        type: 'array',
        schema: arraySchema,
        source: arraySchema ? 'zod4' : 'runtime',
        default: [],
      };
    }
    return arrayNode;
  }

  // For objects
  if (value.constructor === Object) {
    const objectNode: ShadowNode = { _meta: {} };
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        // Pass context down for object properties
        const propContext = context
          ? {
              ...context,
              path: [...context.path, key],
            }
          : undefined;
        objectNode[key] = buildShadowNode(stateKey, value[key], propContext);
      }
    }
    if (context) {
      // Try to get the object schema
      let objectSchema = null;

      if (context.schemas.zodV4) {
        let fieldSchema = context.schemas.zodV4;
        for (const segment of context.path) {
          if (fieldSchema?.shape) {
            fieldSchema = fieldSchema.shape[segment];
          } else if (fieldSchema?._def?.shape) {
            fieldSchema = fieldSchema._def.shape()[segment];
          }
        }
        objectSchema = fieldSchema;
      }

      objectNode._meta!.typeInfo = {
        type: 'object',
        schema: objectSchema,
        source: objectSchema ? 'zod4' : 'runtime',
        default: {},
      };
    }
    return objectNode;
  }

  return { value };
}

// store.ts - Replace the shadow store methods with mutable versions
// store.ts - Replace the shadow store methods with mutable versions

// Module-level mutable store
const shadowStateStore = new Map<string, ShadowNode>();
let globalCounter = 0;

export function generateId(stateKey: string): string {
  const rootMeta = getGlobalStore.getState().getShadowMetadata(stateKey, []);
  const prefix = rootMeta?.syncArrayIdPrefix || 'local';
  return `id:${prefix}_${(globalCounter++).toString(36)}`;
}
export const getGlobalStore = create<CogsGlobalState>((set, get) => ({
  // Remove shadowStateStore from Zustand state

  setTransformCache: (
    key: string,
    path: string[],
    cacheKey: string,
    cacheData: any
  ) => {
    const metadata = get().getShadowMetadata(key, path) || {};
    if (!metadata.transformCaches) {
      metadata.transformCaches = new Map();
    }
    metadata.transformCaches.set(cacheKey, cacheData);
    get().setShadowMetadata(key, path, {
      transformCaches: metadata.transformCaches,
    });
  },

  initializeShadowState: (key: string, initialState: any) => {
    const existingRoot =
      shadowStateStore.get(key) || shadowStateStore.get(`[${key}`);
    let preservedMetadata: Partial<ShadowMetadata> = {};

    if (existingRoot?._meta) {
      const {
        components,
        features,
        lastServerSync,
        stateSource,
        baseServerState,
      } = existingRoot._meta;
      if (components) preservedMetadata.components = components;
      if (features) preservedMetadata.features = features;
      if (lastServerSync) preservedMetadata.lastServerSync = lastServerSync;
      if (stateSource) preservedMetadata.stateSource = stateSource;
      if (baseServerState) preservedMetadata.baseServerState = baseServerState;
    }

    shadowStateStore.delete(key);
    shadowStateStore.delete(`[${key}`);

    // Get all available schemas for this state
    const options = get().getInitialOptions(key);
    const syncSchemas = get().getInitialOptions('__syncSchemas');

    const context: BuildContext = {
      stateKey: key,
      path: [],
      schemas: {
        sync: syncSchemas,
        zodV4: options?.validation?.zodSchemaV4,
        zodV3: options?.validation?.zodSchemaV3,
      },
    };

    // Build with context so type info is stored
    const newRoot = buildShadowNode(key, initialState, context);

    if (!newRoot._meta) newRoot._meta = {};
    Object.assign(newRoot._meta, preservedMetadata);

    const storageKey = Array.isArray(initialState) ? `[${key}` : key;
    shadowStateStore.set(storageKey, newRoot);
  },
  getShadowNode: (key: string, path: string[]): ShadowNode | undefined => {
    let current: any =
      shadowStateStore.get(key) || shadowStateStore.get(`[${key}`);
    if (!current) return undefined;
    if (path.length === 0) return current;

    for (const segment of path) {
      if (typeof current !== 'object' || current === null) return undefined;
      current = current[segment];
      if (current === undefined) return undefined;
    }
    return current;
  },

  getShadowMetadata: (
    key: string,
    path: string[]
  ): ShadowMetadata | undefined => {
    const node = get().getShadowNode(key, path);
    return node?._meta;
  },

  setShadowMetadata: (
    key: string,
    path: string[],
    newMetadata: Partial<ShadowMetadata>
  ) => {
    // Direct mutation - no cloning!
    const rootKey = shadowStateStore.has(`[${key}`) ? `[${key}` : key;
    let root = shadowStateStore.get(rootKey);

    if (!root) {
      root = { _meta: newMetadata };
      shadowStateStore.set(rootKey, root);
      return;
    }

    // Navigate to target without cloning
    let current = root;
    for (const segment of path) {
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment];
    }

    // Mutate metadata directly
    if (!current._meta) {
      current._meta = {};
    }
    Object.assign(current._meta, newMetadata);
  },

  getShadowValue: (
    key: string,
    path: string[],
    validArrayIds?: string[],
    log?: boolean
  ) => {
    const node = get().getShadowNode(key, path);

    if (node === null || node === undefined) return undefined;

    const nodeKeys = Object.keys(node);

    if (
      node._meta &&
      Object.prototype.hasOwnProperty.call(node._meta, 'value') &&
      nodeKeys.length === 1 &&
      nodeKeys[0] === '_meta'
    ) {
      return node._meta.value;
    }

    const isArrayNode =
      node._meta &&
      Object.prototype.hasOwnProperty.call(node._meta, 'arrayKeys');
    if (isArrayNode) {
      const keysToIterate =
        validArrayIds !== undefined && validArrayIds.length > 0
          ? validArrayIds
          : node._meta!.arrayKeys!;

      return keysToIterate.map((itemKey: string) =>
        get().getShadowValue(key, [...path, itemKey])
      );
    }

    const result: any = {};
    for (const propKey of nodeKeys) {
      if (propKey !== '_meta' && !propKey.startsWith('id:')) {
        result[propKey] = get().getShadowValue(key, [...path, propKey]);
      }
    }
    return result;
  },

  updateShadowAtPath: (key, path, newValue) => {
    // NO MORE set() wrapper - direct mutation!
    const rootKey = shadowStateStore.has(`[${key}`) ? `[${key}` : key;
    let root = shadowStateStore.get(rootKey);
    if (!root) return;

    // Navigate to parent without cloning
    let parentNode = root;
    for (let i = 0; i < path.length - 1; i++) {
      if (!parentNode[path[i]!]) {
        parentNode[path[i]!] = {};
      }
      parentNode = parentNode[path[i]!];
    }

    const targetNode =
      path.length === 0 ? parentNode : parentNode[path[path.length - 1]!];

    if (!targetNode) {
      parentNode[path[path.length - 1]!] = buildShadowNode(key, newValue);
      get().notifyPathSubscribers([key, ...path].join('.'), {
        type: 'UPDATE',
        newValue,
      });
      return;
    }

    function intelligentMerge(nodeToUpdate: any, plainValue: any) {
      if (
        typeof plainValue !== 'object' ||
        plainValue === null ||
        Array.isArray(plainValue)
      ) {
        const oldMeta = nodeToUpdate._meta;
        // Clear existing properties
        for (const key in nodeToUpdate) {
          if (key !== '_meta') delete nodeToUpdate[key];
        }
        const newNode = buildShadowNode(key, plainValue);
        Object.assign(nodeToUpdate, newNode);
        if (oldMeta) {
          nodeToUpdate._meta = { ...oldMeta, ...(nodeToUpdate._meta || {}) };
        }
        return;
      }

      const plainValueKeys = new Set(Object.keys(plainValue));

      for (const propKey of plainValueKeys) {
        const childValue = plainValue[propKey];
        if (nodeToUpdate[propKey]) {
          intelligentMerge(nodeToUpdate[propKey], childValue);
        } else {
          nodeToUpdate[propKey] = buildShadowNode(key, childValue);
        }
      }

      for (const nodeKey in nodeToUpdate) {
        if (
          nodeKey === '_meta' ||
          !Object.prototype.hasOwnProperty.call(nodeToUpdate, nodeKey)
        )
          continue;

        if (!plainValueKeys.has(nodeKey)) {
          delete nodeToUpdate[nodeKey];
        }
      }
    }

    intelligentMerge(targetNode, newValue);

    get().notifyPathSubscribers([key, ...path].join('.'), {
      type: 'UPDATE',
      newValue,
    });
  },

  addItemsToArrayNode: (key, arrayPath, newItems, newKeys) => {
    // Direct mutation - no cloning!
    const rootKey = shadowStateStore.has(`[${key}`) ? `[${key}` : key;
    let root = shadowStateStore.get(rootKey);
    if (!root) {
      console.error('Root not found for state key:', key);
      return;
    }

    // Navigate without cloning
    let current = root;
    for (const segment of arrayPath) {
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment];
    }

    // Mutate directly
    Object.assign(current, newItems);
    if (!current._meta) current._meta = {};
    current._meta.arrayKeys = newKeys; // Direct assignment!
  },

  insertShadowArrayElement: (key, arrayPath, newItem, index) => {
    const arrayNode = get().getShadowNode(key, arrayPath);
    if (!arrayNode?._meta?.arrayKeys) {
      throw new Error(
        `Array not found at path: ${[key, ...arrayPath].join('.')}`
      );
    }

    const newItemId = `${generateId(key)}`;
    const itemsToAdd = { [newItemId]: buildShadowNode(key, newItem) };

    // Mutate the array directly
    const currentKeys = arrayNode._meta.arrayKeys;
    const insertionPoint =
      index !== undefined && index >= 0 && index <= currentKeys.length
        ? index
        : currentKeys.length;

    if (insertionPoint >= currentKeys.length) {
      currentKeys.push(newItemId); // O(1)
    } else {
      currentKeys.splice(insertionPoint, 0, newItemId); // O(n) only for middle
    }

    // Pass the mutated array
    get().addItemsToArrayNode(key, arrayPath, itemsToAdd, currentKeys);

    const arrayKey = [key, ...arrayPath].join('.');
    get().notifyPathSubscribers(arrayKey, {
      type: 'INSERT',
      path: arrayKey,
      itemKey: `${arrayKey}.${newItemId}`,
      index: insertionPoint,
    });

    return newItemId;
  },

  insertManyShadowArrayElements: (key, arrayPath, newItems, index) => {
    if (!newItems || newItems.length === 0) {
      return;
    }

    const arrayNode = get().getShadowNode(key, arrayPath);
    if (!arrayNode?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[key, ...arrayPath].join('.')}`
      );
      return;
    }

    const itemsToAdd: Record<string, any> = {};
    const newIds: string[] = [];

    newItems.forEach((item) => {
      const newItemId = `${generateId(key)}`;
      newIds.push(newItemId);
      itemsToAdd[newItemId] = buildShadowNode(key, item);
    });

    // Mutate directly
    const currentKeys = arrayNode._meta.arrayKeys;
    const insertionPoint =
      index !== undefined && index >= 0 && index <= currentKeys.length
        ? index
        : currentKeys.length;

    if (insertionPoint >= currentKeys.length) {
      currentKeys.push(...newIds); // O(k) where k is items being added
    } else {
      currentKeys.splice(insertionPoint, 0, ...newIds); // O(n + k)
    }

    get().addItemsToArrayNode(key, arrayPath, itemsToAdd, currentKeys);

    const arrayKey = [key, ...arrayPath].join('.');
    get().notifyPathSubscribers(arrayKey, {
      type: 'INSERT_MANY',
      path: arrayKey,
      count: newItems.length,
      index: insertionPoint,
    });
  },

  removeShadowArrayElement: (key, itemPath) => {
    if (itemPath.length === 0) return;

    const arrayPath = itemPath.slice(0, -1);
    const itemId = itemPath[itemPath.length - 1];
    if (!itemId?.startsWith('id:')) return;

    const arrayNode = get().getShadowNode(key, arrayPath);
    if (!arrayNode?._meta?.arrayKeys) return;

    // Mutate directly
    const currentKeys = arrayNode._meta.arrayKeys;
    const indexToRemove = currentKeys.indexOf(itemId);

    if (indexToRemove === -1) return;

    // O(1) for removing from end
    if (indexToRemove === currentKeys.length - 1) {
      currentKeys.pop();
    }
    // O(n) for removing from beginning or middle
    else if (indexToRemove === 0) {
      currentKeys.shift();
    } else {
      currentKeys.splice(indexToRemove, 1);
    }

    // Delete the actual item
    delete arrayNode[itemId];

    // No need to update metadata - already mutated!

    const arrayKey = [key, ...arrayPath].join('.');
    get().notifyPathSubscribers(arrayKey, {
      type: 'REMOVE',
      path: arrayKey,
      itemKey: `${arrayKey}.${itemId}`,
    });
  },

  registerComponent: (stateKey, fullComponentId, registration) => {
    const rootMeta = get().getShadowMetadata(stateKey, []) || {};
    const components = new Map(rootMeta.components);
    components.set(fullComponentId, registration);
    get().setShadowMetadata(stateKey, [], { components });
  },

  unregisterComponent: (stateKey, fullComponentId) => {
    const rootMeta = get().getShadowMetadata(stateKey, []);
    if (!rootMeta?.components) return;
    const components = new Map(rootMeta.components);
    if (components.delete(fullComponentId)) {
      get().setShadowMetadata(stateKey, [], { components });
    }
  },

  addPathComponent: (stateKey, dependencyPath, fullComponentId) => {
    const metadata = get().getShadowMetadata(stateKey, dependencyPath) || {};
    const newPathComponents = new Set(metadata.pathComponents);
    newPathComponents.add(fullComponentId);
    get().setShadowMetadata(stateKey, dependencyPath, {
      pathComponents: newPathComponents,
    });

    const rootMeta = get().getShadowMetadata(stateKey, []);
    if (rootMeta?.components) {
      const component = rootMeta.components.get(fullComponentId);
      if (component) {
        const fullPathKey = [stateKey, ...dependencyPath].join('.');
        const newPaths = new Set(component.paths);
        newPaths.add(fullPathKey);
        const newComponentRegistration = { ...component, paths: newPaths };
        const newComponentsMap = new Map(rootMeta.components);
        newComponentsMap.set(fullComponentId, newComponentRegistration);
        get().setShadowMetadata(stateKey, [], { components: newComponentsMap });
      }
    }
  },

  markAsDirty: (key, path, options = { bubble: true }) => {
    const setDirtyOnPath = (pathToMark: string[]) => {
      const node = get().getShadowNode(key, pathToMark);
      if (node?._meta?.isDirty) {
        return true;
      }
      get().setShadowMetadata(key, pathToMark, { isDirty: true });
      return false;
    };

    setDirtyOnPath(path);

    if (options.bubble) {
      let parentPath = [...path];
      while (parentPath.length > 0) {
        parentPath.pop();
        if (setDirtyOnPath(parentPath)) {
          break;
        }
      }
    }
  },

  // Keep these in Zustand as they need React reactivity
  serverStateUpdates: new Map(),
  setServerStateUpdate: (key, serverState) => {
    set((state) => ({
      serverStateUpdates: new Map(state.serverStateUpdates).set(
        key,
        serverState
      ),
    }));
    get().notifyPathSubscribers(key, {
      type: 'SERVER_STATE_UPDATE',
      serverState,
    });
  },

  pathSubscribers: new Map<string, Set<(newValue: any) => void>>(),
  subscribeToPath: (path, callback) => {
    const subscribers = get().pathSubscribers;
    const subsForPath = subscribers.get(path) || new Set();
    subsForPath.add(callback);
    subscribers.set(path, subsForPath);

    return () => {
      const currentSubs = get().pathSubscribers.get(path);
      if (currentSubs) {
        currentSubs.delete(callback);
        if (currentSubs.size === 0) {
          get().pathSubscribers.delete(path);
        }
      }
    };
  },

  notifyPathSubscribers: (updatedPath, newValue) => {
    const subscribers = get().pathSubscribers;
    const subs = subscribers.get(updatedPath);
    if (subs) {
      subs.forEach((callback) => callback(newValue));
    }
  },

  selectedIndicesMap: new Map<string, string>(),
  getSelectedIndex: (arrayKey, validIds) => {
    const itemKey = get().selectedIndicesMap.get(arrayKey);
    if (!itemKey) return -1;

    const arrayMeta = get().getShadowMetadata(
      arrayKey.split('.')[0]!,
      arrayKey.split('.').slice(1)
    );
    const arrayKeys = validIds || arrayMeta?.arrayKeys;

    return arrayKeys ? arrayKeys.indexOf(itemKey) : -1;
  },

  setSelectedIndex: (arrayKey: string, itemKey: string | undefined) => {
    set((state) => {
      const newMap = new Map(state.selectedIndicesMap);

      if (itemKey === undefined) {
        newMap.delete(arrayKey);
      } else {
        if (newMap.has(arrayKey)) {
          get().notifyPathSubscribers(newMap.get(arrayKey)!, {
            type: 'THIS_UNSELECTED',
          });
        }
        newMap.set(arrayKey, itemKey);
        get().notifyPathSubscribers(itemKey, { type: 'THIS_SELECTED' });
      }

      get().notifyPathSubscribers(arrayKey, { type: 'GET_SELECTED' });

      return {
        ...state,
        selectedIndicesMap: newMap,
      };
    });
  },

  clearSelectedIndex: ({ arrayKey }: { arrayKey: string }): void => {
    set((state) => {
      const newMap = new Map(state.selectedIndicesMap);
      const actualKey = newMap.get(arrayKey);
      if (actualKey) {
        get().notifyPathSubscribers(actualKey, {
          type: 'CLEAR_SELECTION',
        });
      }

      newMap.delete(arrayKey);
      get().notifyPathSubscribers(arrayKey, {
        type: 'CLEAR_SELECTION',
      });
      return {
        ...state,
        selectedIndicesMap: newMap,
      };
    });
  },

  clearSelectedIndexesForState: (stateKey) => {
    set((state) => {
      const newMap = new Map(state.selectedIndicesMap);
      let changed = false;
      for (const key of newMap.keys()) {
        if (key === stateKey || key.startsWith(stateKey + '.')) {
          newMap.delete(key);
          changed = true;
        }
      }
      return changed ? { selectedIndicesMap: newMap } : {};
    });
  },

  initialStateOptions: {},
  stateLog: new Map(),
  initialStateGlobal: {},

  addStateLog: (updates) => {
    if (!updates || updates.length === 0) return;
    set((state) => {
      const newLog = new Map(state.stateLog);
      const logsGroupedByKey = new Map<string, UpdateTypeDetail[]>();
      for (const update of updates) {
        const group = logsGroupedByKey.get(update.stateKey) || [];
        group.push(update);
        logsGroupedByKey.set(update.stateKey, group);
      }
      for (const [key, batchOfUpdates] of logsGroupedByKey.entries()) {
        const newStateLogForKey = new Map(newLog.get(key));
        for (const update of batchOfUpdates) {
          newStateLogForKey.set(JSON.stringify(update.path), { ...update });
        }
        newLog.set(key, newStateLogForKey);
      }
      return { stateLog: newLog };
    });
  },

  getInitialOptions: (key) => get().initialStateOptions[key],
  setInitialStateOptions: (key, value) => {
    set((prev) => ({
      initialStateOptions: { ...prev.initialStateOptions, [key]: value },
    }));
  },

  updateInitialStateGlobal: (key, newState) => {
    set((prev) => ({
      initialStateGlobal: { ...prev.initialStateGlobal, [key]: newState },
    }));
  },

  syncInfoStore: new Map<string, SyncInfo>(),
  setSyncInfo: (key, syncInfo) =>
    set((state) => {
      const newMap = new Map(state.syncInfoStore);
      newMap.set(key, syncInfo);
      return { syncInfoStore: newMap };
    }),
  getSyncInfo: (key) => get().syncInfoStore.get(key) || null,
}));
