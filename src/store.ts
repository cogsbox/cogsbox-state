import { create } from 'zustand';

import type {
  OptionsType,
  ReactivityType,
  SyncInfo,
  UpdateTypeDetail,
} from './CogsState.js';

export type FreshValuesObject = {
  pathsToValues?: string[];
  prevValue?: any;
  newValue?: any;
  timeStamp: number;
};

type StateValue = any;
export type FormEventType = {
  type: 'focus' | 'blur' | 'input';
  value?: any;
  path: string[];
};
export type TrieNode = {
  subscribers: Set<string>;
  children: Map<string, TrieNode>;
};

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

export type UIState = {
  isFocused?: boolean;
  isTouched?: boolean;
  isHovered?: boolean;
};

// Update ShadowMetadata to include typeInfo
export type ShadowMetadata = {
  value?: any;

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
  pluginMetaData?: Map<string, Record<string, any>>;
  formRef?: React.RefObject<any>;
  focusedElement?: { path: string[]; ref: React.RefObject<any> } | null;
} & ComponentsType;

type ShadowNode = {
  _meta?: ShadowMetadata;
  [key: string]: any;
};

export type CogsGlobalState = {
  getPluginMetaDataMap: (
    key: string,
    path: string[]
  ) => Map<string, Record<string, any>> | undefined;
  setPluginMetaData: (
    key: string,
    path: string[],
    pluginName: string,
    data: Record<string, any>
  ) => void;
  removePluginMetaData: (
    key: string,
    path: string[],
    pluginName: string
  ) => void;
  setTransformCache: (
    key: string,
    path: string[],
    cacheKey: string,
    cacheData: any
  ) => void;
  initializeAndMergeShadowState: (key: string, initialState: any) => void;
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
    newItems: any
  ) => void;
  insertShadowArrayElement: (
    key: string,
    arrayPath: string[],
    newItem: any,
    index?: number,
    itemId?: string
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

  let current = schema;
  let isNullable = false;
  let isOptional = false;
  let defaultValue: any = undefined;
  let hasDefault = false;

  // This loop will now correctly navigate through any wrappers AND unions.
  for (let i = 0; i < 20; i++) {
    // Added a safety break for complex schemas
    const def = current?.def || current?._def;
    if (!def) break;

    const typeIdentifier = def.typeName || def.type || current._type;

    // --- START: THE CRITICAL FIX FOR ZodUnion ---
    if (typeIdentifier === 'ZodUnion' || typeIdentifier === 'union') {
      if (def.options && def.options.length > 0) {
        current = def.options[0]; // Proceed by analyzing the FIRST option of the union
        continue; // Restart the loop with the new schema
      } else {
        break; // Union with no options, cannot determine type
      }
    }
    // --- END: THE CRITICAL FIX ---

    if (typeIdentifier === 'ZodOptional' || typeIdentifier === 'optional') {
      isOptional = true;
    } else if (
      typeIdentifier === 'ZodNullable' ||
      typeIdentifier === 'nullable'
    ) {
      isNullable = true;
    } else if (
      typeIdentifier === 'ZodDefault' ||
      typeIdentifier === 'default'
    ) {
      hasDefault = true;
      defaultValue =
        typeof def.defaultValue === 'function'
          ? def.defaultValue()
          : def.defaultValue;
    } else if (
      typeIdentifier !== 'ZodEffects' &&
      typeIdentifier !== 'effects'
    ) {
      // This is not a wrapper we need to unwrap further, so we can exit the loop.
      break;
    }

    const nextSchema = def.innerType || def.schema || current._inner;
    if (!nextSchema || nextSchema === current) {
      break; // Reached the end or a recursive schema
    }
    current = nextSchema;
  }

  const baseSchema = current;
  const baseDef = baseSchema?.def || baseSchema?._def;
  const baseType = baseDef?.typeName || baseDef?.type || baseSchema?._type;

  if (baseType === 'ZodNumber' || baseType === 'number') {
    return {
      type: 'number',
      schema: schema,
      source,
      default: hasDefault ? defaultValue : 0,
      nullable: isNullable,
      optional: isOptional,
    };
  }
  if (baseType === 'ZodString' || baseType === 'string') {
    return {
      type: 'string',
      schema: schema,
      source,
      default: hasDefault ? defaultValue : '',
      nullable: isNullable,
      optional: isOptional,
    };
  }
  if (baseType === 'ZodBoolean' || baseType === 'boolean') {
    return {
      type: 'boolean',
      schema: schema,
      source,
      default: hasDefault ? defaultValue : false,
      nullable: isNullable,
      optional: isOptional,
    };
  }
  if (baseType === 'ZodArray' || baseType === 'array') {
    return {
      type: 'array',
      schema: schema,
      source,
      default: hasDefault ? defaultValue : [],
      nullable: isNullable,
      optional: isOptional,
    };
  }
  if (baseType === 'ZodObject' || baseType === 'object') {
    return {
      type: 'object',
      schema: schema,
      source,
      default: hasDefault ? defaultValue : {},
      nullable: isNullable,
      optional: isOptional,
    };
  }
  if (baseType === 'ZodDate' || baseType === 'date') {
    return {
      type: 'date',
      schema: schema,
      source,
      default: hasDefault ? defaultValue : new Date(),
      nullable: isNullable,
      optional: isOptional,
    };
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

export function buildShadowNode(
  stateKey: string,
  value: any,
  context?: BuildContext
): ShadowNode {
  // Handle null/undefined/primitives (This part is already correct)
  if (value === null || value === undefined || typeof value !== 'object') {
    const node: ShadowNode = { _meta: { value } };
    node._meta!.typeInfo = getTypeInfoForPath(value, context);
    return node;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    // 1. Create the node for the array.
    const node: ShadowNode = { _meta: { arrayKeys: [] } };

    // 2. Get the type info for the array itself ONCE, right at the start.
    node._meta!.typeInfo = getTypeInfoForPath(value, context);

    // 3. THEN, recursively process the children.
    value.forEach((item, index) => {
      const itemId = generateId(stateKey);
      const itemContext = context
        ? {
            ...context,
            path: [...context.path, index.toString()],
          }
        : undefined;

      node[itemId] = buildShadowNode(stateKey, item, itemContext);
      node._meta!.arrayKeys!.push(itemId);
    });

    return node;
  }

  // Handle objects
  if (value.constructor === Object) {
    // 1. Create the node for the object.
    const node: ShadowNode = { _meta: {} };

    // 2. Get the type info for the object itself ONCE, right at the start.
    node._meta!.typeInfo = getTypeInfoForPath(value, context);

    // 3. THEN, recursively process the children.
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const propContext = context
          ? {
              ...context,
              path: [...context.path, key],
            }
          : undefined;

        node[key] = buildShadowNode(stateKey, value[key], propContext);
      }
    }

    return node;
  }

  // Fallback for other object types (Date, class instances, etc.)
  return {
    _meta: {
      value: value,
      typeInfo: getTypeFromValue(value),
    },
  };
}

// Helper function to get type info (extracted for clarity)
function getTypeInfoForPath(value: any, context?: BuildContext): TypeInfo {
  if (context) {
    // Try to get schema-based type info
    let typeInfo: TypeInfo | null = null;

    if (context.schemas.zodV4) {
      const schema =
        context.path.length === 0
          ? context.schemas.zodV4
          : getSchemaAtPath(context.schemas.zodV4, context.path);
      if (schema) {
        typeInfo = getTypeFromZodSchema(schema, 'zod4');
      }
    }

    if (!typeInfo && context.schemas.zodV3) {
      const schema =
        context.path.length === 0
          ? context.schemas.zodV3
          : getSchemaAtPath(context.schemas.zodV3, context.path);
      if (schema) {
        typeInfo = getTypeFromZodSchema(schema, 'zod3');
      }
    }

    if (!typeInfo && context.schemas.sync?.[context.stateKey]) {
      typeInfo = getTypeFromValue(value);
      typeInfo.source = 'sync';
    }

    if (typeInfo) return typeInfo;
  }

  return getTypeFromValue(value);
}

export function updateShadowTypeInfo(
  stateKey: string,
  rootSchema: any,
  source: 'zod4' | 'zod3'
) {
  const rootNode =
    shadowStateStore.get(stateKey) || shadowStateStore.get(`[${stateKey}`);
  if (!rootNode) return;

  function updateNodeTypeInfo(node: any, path: string[]) {
    if (!node || typeof node !== 'object') return;
    const fieldSchema = getSchemaAtPath(rootSchema, path);

    if (fieldSchema) {
      const typeInfo = getTypeFromZodSchema(fieldSchema, source);
      if (typeInfo) {
        if (!node._meta) node._meta = {};
        node._meta.typeInfo = {
          ...typeInfo,
          schema: fieldSchema,
        };
      }
    }

    // Recursively update children
    if (node._meta?.arrayKeys) {
      node._meta.arrayKeys.forEach((itemKey: string) => {
        if (node[itemKey]) {
          updateNodeTypeInfo(node[itemKey], [...path, '0']); // Use index 0 for array item schema
        }
      });
    } else if (!node._meta?.hasOwnProperty('value')) {
      // It's an object - update each property
      Object.keys(node).forEach((key) => {
        if (key !== '_meta') {
          updateNodeTypeInfo(node[key], [...path, key]);
        }
      });
    }
  }

  updateNodeTypeInfo(rootNode, []);
}

/**
 * Reliably unwraps a Zod schema to its core type, handling modifiers
 * from both Zod v3 and modern Zod.
 */
function unwrapSchema(schema: any): any {
  let current = schema;
  while (current) {
    // Version-agnostic way to get the definition object
    const def = current.def || current._def;

    // VITAL FIX: Check for `def.type` (like in your log), `def.typeName` (modern Zod), and `_type` (zod v3)
    const typeIdentifier = def?.typeName || def?.type || current._type;

    if (
      typeIdentifier === 'ZodOptional' ||
      typeIdentifier === 'optional' ||
      typeIdentifier === 'ZodNullable' ||
      typeIdentifier === 'nullable' ||
      typeIdentifier === 'ZodDefault' ||
      typeIdentifier === 'default' ||
      typeIdentifier === 'ZodEffects' ||
      typeIdentifier === 'effects'
    ) {
      // Get the inner schema, supporting multiple internal structures
      current =
        def.innerType || def.schema || current._inner || current.unwrap?.();
    } else {
      break; // Reached the base schema
    }
  }
  return current;
}

/**
 * Helper function to get a nested schema at a specific path,
 * correctly handling both Zod v3 and modern Zod internals.
 */
function getSchemaAtPath(schema: any, path: string[]): any {
  if (!schema) return null;
  if (path.length === 0) return schema;

  let currentSchema = schema;

  for (const segment of path) {
    const containerSchema = unwrapSchema(currentSchema);
    if (!containerSchema) return null;

    const def = containerSchema.def || containerSchema._def;

    // VITAL FIX: Check for `def.type` as you discovered.
    const typeIdentifier = def?.typeName || def?.type || containerSchema._type;

    if (typeIdentifier === 'ZodObject' || typeIdentifier === 'object') {
      // VITAL FIX: Check for `shape` inside `def` first, then on the schema itself.
      const shape =
        def?.shape || containerSchema.shape || containerSchema._shape;
      currentSchema = shape?.[segment];
    } else if (typeIdentifier === 'ZodArray' || typeIdentifier === 'array') {
      // For arrays, the next schema is always the element's schema.
      currentSchema = containerSchema.element || def?.type;
    } else {
      return null; // Not a container, cannot traverse deeper.
    }

    if (!currentSchema) {
      return null; // Path segment does not exist in the schema.
    }
  }

  return currentSchema;
}
export const shadowStateStore = new Map<string, ShadowNode>();
let globalCounter = 0;
const instanceId = Date.now().toString(36);

export function generateId(stateKey: string): string {
  const prefix = 'local';

  return `id:${prefix}_${instanceId}_${(globalCounter++).toString(36)}`;
}
export const getGlobalStore = create<CogsGlobalState>((set, get) => ({
  getPluginMetaDataMap: (
    key: string,
    path: string[]
  ): Map<string, Record<string, any>> | undefined => {
    const metadata = get().getShadowMetadata(key, path);
    return metadata?.pluginMetaData;
  },

  setPluginMetaData: (
    key: string,
    path: string[], // ADD THIS PARAMETER
    pluginName: string,
    data: Record<string, any>
  ) => {
    const metadata = get().getShadowMetadata(key, path) || {}; // Use the path!
    const pluginMetaData = new Map(metadata.pluginMetaData || []);
    const existingData = pluginMetaData.get(pluginName) || {};
    pluginMetaData.set(pluginName, { ...existingData, ...data });
    get().setShadowMetadata(key, path, { ...metadata, pluginMetaData });
    get().notifyPathSubscribers([key, ...path].join('.'), {
      type: 'METADATA_UPDATE',
    });
  },
  removePluginMetaData: (key: string, path: string[], pluginName: string) => {
    const metadata = get().getShadowMetadata(key, path);
    if (!metadata?.pluginMetaData) return;
    const pluginMetaData = new Map(metadata.pluginMetaData);
    pluginMetaData.delete(pluginName);
    get().setShadowMetadata(key, path, { ...metadata, pluginMetaData });
  },

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
  // Replace your entire `initializeAndMergeShadowState` function with this one.

  initializeAndMergeShadowState: (key: string, shadowState: any) => {
    const isArrayState = shadowState?._meta?.arrayKeys !== undefined;
    const storageKey = isArrayState ? `[${key}` : key;

    const existingRoot =
      shadowStateStore.get(storageKey) ||
      shadowStateStore.get(key) ||
      shadowStateStore.get(`[${key}`);

    // --- THIS LOGIC IS RESTORED ---
    // This is vital for preserving component registrations and other top-level
    // metadata across a full merge/replace, which is why removing it was a mistake.
    let preservedMetadata: Partial<ShadowMetadata> = {};
    if (existingRoot?._meta) {
      const {
        components,
        features,
        lastServerSync,
        stateSource,
        baseServerState,
        pathComponents,
        signals,
        validation,
      } = existingRoot._meta;

      if (components) preservedMetadata.components = components;
      if (features) preservedMetadata.features = features;
      if (lastServerSync) preservedMetadata.lastServerSync = lastServerSync;
      if (stateSource) preservedMetadata.stateSource = stateSource;
      if (baseServerState) preservedMetadata.baseServerState = baseServerState;
      if (pathComponents) preservedMetadata.pathComponents = pathComponents;
      if (signals) preservedMetadata.signals = signals;
      if (validation) preservedMetadata.validation = validation;
    }
    function deepMergeShadowNodes(target: ShadowNode, source: ShadowNode) {
      // --- START: CORRECTED, MORE ROBUST METADATA MERGE ---
      if (source._meta || target._meta) {
        const existingMeta = target._meta || {};
        const sourceMeta = source._meta || {};

        // Combine metadata, letting the source overwrite simple, top-level properties.
        const newMeta = { ...existingMeta, ...sourceMeta };

        // CRITICAL FIX: Now, explicitly check and preserve the complex, valuable
        // objects from the existing state if the incoming source state doesn't have
        // an equally good or better version.

        // 1. Preserve rich TypeInfo (with a schema) over a simple runtime one.
        if (existingMeta.typeInfo?.schema && !sourceMeta.typeInfo?.schema) {
          newMeta.typeInfo = existingMeta.typeInfo;
        }

        // 2. Preserve the existing validation state, which is computed and stored on the target.
        // A source built from a plain object will never have this.
        if (existingMeta.validation && !sourceMeta.validation) {
          newMeta.validation = existingMeta.validation;
        }

        // 3. Preserve component registrations, which only exist on the live target state.
        if (existingMeta.components) {
          newMeta.components = existingMeta.components;
        }

        target._meta = newMeta;
      }
      // --- END: CORRECTED METADATA MERGE ---

      // 2. Handle the node's data (primitive, array, or object).
      if (source._meta?.hasOwnProperty('value')) {
        // Source is a primitive. Clear any old child properties from target.
        for (const key in target) {
          if (key !== '_meta') delete target[key];
        }
        return; // Done with this branch
      }

      // Synchronize the data structure based on the source.
      const sourceKeys = new Set(
        Object.keys(source).filter((k) => k !== '_meta')
      );
      const targetKeys = new Set(
        Object.keys(target).filter((k) => k !== '_meta')
      );

      // Delete keys that are in the target but no longer in the source.
      for (const key of targetKeys) {
        if (!sourceKeys.has(key)) {
          delete target[key];
        }
      }

      // Recursively merge or add keys from the source.
      for (const key of sourceKeys) {
        const sourceValue = source[key];
        const targetValue = target[key];
        if (
          targetValue &&
          typeof targetValue === 'object' &&
          sourceValue &&
          typeof sourceValue === 'object'
        ) {
          deepMergeShadowNodes(targetValue, sourceValue); // Recurse for objects
        } else {
          target[key] = sourceValue; // Add new or replace primitive/node
        }
      }
    }
    // --- THIS IS YOUR ORIGINAL, CORRECT MAIN LOGIC ---
    if (existingRoot) {
      // Merge the new shadow state into the existing one
      deepMergeShadowNodes(existingRoot, shadowState);
      // Restore preserved metadata
      if (!existingRoot._meta) existingRoot._meta = {};
      Object.assign(existingRoot._meta, preservedMetadata);
      shadowStateStore.set(storageKey, existingRoot);
    } else {
      // The logic for when no state exists yet
      if (preservedMetadata && Object.keys(preservedMetadata).length > 0) {
        if (!shadowState._meta) shadowState._meta = {};
        Object.assign(shadowState._meta, preservedMetadata);
      }
      shadowStateStore.set(storageKey, shadowState);
    }

    // As your logs show, this part works. It runs AFTER the merge to apply schemas.
    const options = get().getInitialOptions(key);
    const hasSchema =
      options?.validation?.zodSchemaV4 || options?.validation?.zodSchemaV3;
    if (hasSchema) {
      if (options.validation?.zodSchemaV4) {
        updateShadowTypeInfo(key, options.validation.zodSchemaV4, 'zod4');
      } else if (options.validation?.zodSchemaV3) {
        updateShadowTypeInfo(key, options.validation.zodSchemaV3, 'zod3');
      }
    }

    // Cleanup logic is restored
    if (storageKey === key) {
      shadowStateStore.delete(`[${key}`);
    } else {
      shadowStateStore.delete(key);
    }
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
  getShadowValue: (key: string, path: string[], validArrayIds?: string[]) => {
    const startNode = get().getShadowNode(key, path);

    // If the path is invalid or leads nowhere, return undefined immediately.
    if (!startNode) {
      return undefined;
    }

    // --- High-Performance Iterative Materializer ---

    // A single root object to hold the final, materialized result.
    const rootResult: any = {};

    // Stack to manage the traversal without recursion.
    // Each item is [shadowNode, parentObjectInResult, keyToSetOnParent]
    const stack: [ShadowNode, any, string | number][] = [
      [startNode, rootResult, 'final'],
    ];

    while (stack.length > 0) {
      const [currentNode, parentResult, resultKey] = stack.pop()!;

      // 1. Handle primitive values
      if (currentNode._meta?.hasOwnProperty('value')) {
        parentResult[resultKey] = currentNode._meta.value;
        continue; // Done with this branch
      }

      // 2. Handle arrays
      if (currentNode._meta?.arrayKeys) {
        const keysToIterate = validArrayIds || currentNode._meta.arrayKeys;
        const newArray: any[] = [];
        parentResult[resultKey] = newArray;

        // Push children onto the stack in reverse order to process them from 0 to N
        for (let i = keysToIterate.length - 1; i >= 0; i--) {
          const itemKey = keysToIterate[i]!;
          if (currentNode[itemKey]) {
            // The child's result will be placed at index `i` in `newArray`
            stack.push([currentNode[itemKey], newArray, i]);
          }
        }
        continue; // Done with this branch
      }

      // 3. Handle objects
      const newObject: any = {};
      parentResult[resultKey] = newObject;

      const objectKeys = Object.keys(currentNode);
      // Push children onto the stack (order doesn't matter for objects)
      for (const propKey of objectKeys) {
        if (propKey !== '_meta') {
          // The child's result will be set as a property on `newObject`
          stack.push([currentNode[propKey], newObject, propKey]);
        }
      }
    }

    return rootResult.final;
  },
  updateShadowAtPath: (key, path, newValue) => {
    const rootKey = shadowStateStore.has(`[${key}`) ? `[${key}` : key;
    let root = shadowStateStore.get(rootKey);
    if (!root) return;

    let parentNode = root;
    for (let i = 0; i < path.length - 1; i++) {
      if (!parentNode[path[i]!]) {
        parentNode[path[i]!] = {};
      }
      parentNode = parentNode[path[i]!];
    }
    const targetNode =
      path.length === 0 ? parentNode : parentNode[path[path.length - 1]!];

    // This function is now defined inside to close over 'key' and 'path' for context
    function intelligentMerge(
      nodeToUpdate: any,
      plainValue: any,
      currentPath: string[]
    ) {
      // 1. Handle primitives (but NOT arrays)
      if (
        typeof plainValue !== 'object' ||
        plainValue === null ||
        plainValue instanceof Date
      ) {
        const oldMeta = nodeToUpdate._meta || {};
        // Clear all child properties
        for (const prop in nodeToUpdate) {
          if (prop !== '_meta') delete nodeToUpdate[prop];
        }
        // Set the new primitive value, preserving metadata
        nodeToUpdate._meta = { ...oldMeta, value: plainValue };
        return;
      }

      // 2. Handle Arrays INTELLIGENTLY
      if (Array.isArray(plainValue)) {
        // Ensure the target is a shadow array node
        if (!nodeToUpdate._meta) nodeToUpdate._meta = {};
        if (!nodeToUpdate._meta.arrayKeys) nodeToUpdate._meta.arrayKeys = [];

        const existingKeys = nodeToUpdate._meta.arrayKeys;
        const newValues = plainValue;

        const updatedKeys: string[] = [];

        // Merge existing items and add new items
        for (let i = 0; i < newValues.length; i++) {
          const newItemValue = newValues[i]!;
          if (i < existingKeys.length) {
            // Merge into existing item, preserving its key and metadata
            const existingKey = existingKeys[i]!;
            intelligentMerge(nodeToUpdate[existingKey], newItemValue, [
              ...currentPath,
              existingKey,
            ]);
            updatedKeys.push(existingKey);
          } else {
            // Add a new item
            const newItemId = generateId(key);
            const options = get().getInitialOptions(key);
            // Build the new node WITH proper context to get schema info
            const itemContext: BuildContext = {
              stateKey: key,
              path: [...currentPath, '0'], // Use '0' for array element schema lookup
              schemas: {
                zodV4: options?.validation?.zodSchemaV4,
                zodV3: options?.validation?.zodSchemaV3,
              },
            };
            nodeToUpdate[newItemId] = buildShadowNode(
              key,
              newItemValue,
              itemContext
            );
            updatedKeys.push(newItemId);
          }
        }

        // Remove deleted items
        if (existingKeys.length > newValues.length) {
          const keysToDelete = existingKeys.slice(newValues.length);
          keysToDelete.forEach((keyToDelete: string) => {
            delete nodeToUpdate[keyToDelete];
          });
        }

        // Update the keys array to reflect the new state
        nodeToUpdate._meta.arrayKeys = updatedKeys;
        return;
      }

      // 3. Handle Objects
      const plainValueKeys = new Set(Object.keys(plainValue));
      if (nodeToUpdate._meta?.hasOwnProperty('value')) {
        // transitioning from primitive to object, clear the value
        delete nodeToUpdate._meta.value;
      }

      for (const propKey of plainValueKeys) {
        const childValue = plainValue[propKey];
        if (nodeToUpdate[propKey]) {
          intelligentMerge(nodeToUpdate[propKey], childValue, [
            ...currentPath,
            propKey,
          ]);
        } else {
          const options = get().getInitialOptions(key);
          const itemContext: BuildContext = {
            stateKey: key,
            path: [...currentPath, propKey],
            schemas: {
              zodV4: options?.validation?.zodSchemaV4,
              zodV3: options?.validation?.zodSchemaV3,
            },
          };
          nodeToUpdate[propKey] = buildShadowNode(key, childValue, itemContext);
        }
      }

      // Delete keys that no longer exist
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

    if (!targetNode) {
      parentNode[path[path.length - 1]!] = buildShadowNode(key, newValue); // Build fresh if no target
    } else {
      intelligentMerge(targetNode, newValue, path); // Use the new intelligent merge
    }

    get().notifyPathSubscribers([key, ...path].join('.'), {
      type: 'UPDATE',
      newValue,
    });
  },
  addItemsToArrayNode: (key, arrayPath, newItems) => {
    const rootKey = shadowStateStore.has(`[${key}`) ? `[${key}` : key;
    let root = shadowStateStore.get(rootKey);
    if (!root) {
      console.error('Root not found for state key:', key);
      return;
    }

    let current = root;
    for (const segment of arrayPath) {
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment];
    }

    Object.assign(current, newItems);
  },
  insertShadowArrayElement: (key, arrayPath, newItem, index, itemId) => {
    const arrayNode = get().getShadowNode(key, arrayPath);
    if (!arrayNode?._meta?.arrayKeys) {
      throw new Error(
        `Array not found at path: ${[key, ...arrayPath].join('.')}`
      );
    }
    console.log('OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
    const newItemId = itemId || `${generateId(key)}`;

    // BUILD AND ADD the node directly - no need for addItemsToArrayNode
    arrayNode[newItemId] = buildShadowNode(key, newItem);

    // Mutate the array directly
    const currentKeys = arrayNode._meta.arrayKeys;
    const insertionPoint =
      index !== undefined && index >= 0 && index <= currentKeys.length
        ? index
        : currentKeys.length;

    if (insertionPoint >= currentKeys.length) {
      currentKeys.push(newItemId);
    } else {
      currentKeys.splice(insertionPoint, 0, newItemId);
    }

    // Skip addItemsToArrayNode entirely - we already did everything it does!

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

    const newIds: string[] = [];

    // Build and add items directly
    newItems.forEach((item) => {
      const newItemId = `${generateId(key)}`;
      newIds.push(newItemId);
      arrayNode[newItemId] = buildShadowNode(key, item); // ADD DIRECTLY!
    });

    // Mutate the keys array
    const currentKeys = arrayNode._meta.arrayKeys;
    const insertionPoint =
      index !== undefined && index >= 0 && index <= currentKeys.length
        ? index
        : currentKeys.length;

    if (insertionPoint >= currentKeys.length) {
      currentKeys.push(...newIds);
    } else {
      currentKeys.splice(insertionPoint, 0, ...newIds);
    }

    // NO addItemsToArrayNode call needed!

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
    // Start at the root node once.
    let rootNode = get().getShadowNode(key, []);
    if (!rootNode) return;

    // Navigate to the target node once.
    let currentNode = rootNode;
    for (const segment of path) {
      currentNode = currentNode[segment];
      if (!currentNode) return; // Path doesn't exist, nothing to mark.
    }

    // Mark the target node as dirty.
    if (!currentNode._meta) currentNode._meta = {};
    currentNode._meta.isDirty = true;

    // If bubbling is disabled, we are done.
    if (!options.bubble) return;

    // Efficiently bubble up using the path segments.
    let parentNode = rootNode;
    for (let i = 0; i < path.length; i++) {
      // The current node in the loop is the parent of the next one.
      if (parentNode._meta?.isDirty) {
        // Optimization: If a parent is already dirty, all of its ancestors are too.
        // We can stop bubbling immediately.
        return;
      }
      if (!parentNode._meta) parentNode._meta = {};
      parentNode._meta.isDirty = true;
      parentNode = parentNode[path[i]!];
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
