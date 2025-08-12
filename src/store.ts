import { create } from 'zustand';
import { ulid } from 'ulid';
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

export type ValidationError = {
  source: 'client' | 'sync_engine' | 'api';
  message: string;
  severity: 'warning' | 'error';
  code?: string;
};

export type ValidationState = {
  status: ValidationStatus;
  errors: ValidationError[];
  lastValidated?: number;
  validatedValue?: any;
};

export type ShadowMetadata = {
  id?: string;
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
  lastUpdated?: number;
  signals?: Array<{
    instanceId: string;
    parentId: string;
    position: number;
    effect?: string;
  }>;
  mapWrappers?: Array<{
    instanceId: string;
    path: string[];
    componentId: string;
    meta?: any;
    mapFn: (setter: any, index: number, arraySetter: any) => ReactNode;
    containerRef: HTMLDivElement | null;
    rebuildStateShape: any;
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
  value?: any;
  _meta?: ShadowMetadata;
  [key: string]: any;
};

export type CogsGlobalState = {
  // NEW shadow store
  shadowStateStore: Map<string, ShadowNode>;
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
  ) => void;
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

export function buildShadowNode(value: any): ShadowNode {
  if (value === null || typeof value !== 'object') {
    return { value };
  }

  if (Array.isArray(value)) {
    const arrayNode: ShadowNode = { _meta: { arrayKeys: [] } };
    const idKeys: string[] = [];

    value.forEach((item) => {
      const itemId = `id:${ulid()}`;
      arrayNode[itemId] = buildShadowNode(item);
      idKeys.push(itemId);
    });

    arrayNode._meta!.arrayKeys = idKeys;
    return arrayNode;
  }

  if (value.constructor === Object) {
    const objectNode: ShadowNode = { _meta: {} };
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        objectNode[key] = buildShadowNode(value[key]);
      }
    }
    return objectNode;
  }

  return { value };
}

export const getGlobalStore = create<CogsGlobalState>((set, get) => ({
  shadowStateStore: new Map<string, ShadowNode>(),

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
    set((state) => {
      const newShadowStore = new Map(state.shadowStateStore);

      // Get existing metadata more efficiently
      const existingRoot =
        newShadowStore.get(key) || newShadowStore.get(`[${key}`);

      // Only preserve necessary metadata
      let preservedMetadata: Partial<ShadowMetadata> | undefined;
      if (existingRoot?._meta) {
        const {
          components,
          features,
          lastServerSync,
          stateSource,
          baseServerState,
        } = existingRoot._meta;

        // Only create object if we have something to preserve
        if (
          components ||
          features ||
          lastServerSync ||
          stateSource ||
          baseServerState
        ) {
          preservedMetadata = {};
          if (components) preservedMetadata.components = components;
          if (features) preservedMetadata.features = features;
          if (lastServerSync) preservedMetadata.lastServerSync = lastServerSync;
          if (stateSource) preservedMetadata.stateSource = stateSource;
          if (baseServerState)
            preservedMetadata.baseServerState = baseServerState;
        }
      }

      // Clear old entries
      newShadowStore.delete(key);
      newShadowStore.delete(`[${key}`);

      // Build new state
      const newRoot = buildShadowNode(initialState);

      // Only merge metadata if needed
      if (preservedMetadata) {
        if (!newRoot._meta) newRoot._meta = {};
        Object.assign(newRoot._meta, preservedMetadata);
      }

      // Use correct key based on type
      const storageKey = Array.isArray(initialState) ? `[${key}` : key;
      newShadowStore.set(storageKey, newRoot);

      return { shadowStateStore: newShadowStore };
    });
  },

  getShadowNode: (key: string, path: string[]): ShadowNode | undefined => {
    const store = get().shadowStateStore;

    // Fast path for root access (common case)
    if (path.length === 0) {
      return store.get(key) || store.get(`[${key}`);
    }

    let current: any = store.get(key) || store.get(`[${key}`);
    if (!current) return undefined;

    // Use for loop instead of for...of for better performance
    for (let i = 0; i < path.length; i++) {
      if (typeof current !== 'object' || current === null) return undefined;
      current = current[path[i]!];
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
    set((state) => {
      const newStore = new Map(state.shadowStateStore);
      const rootKey = newStore.has(`[${key}`) ? `[${key}` : key;
      let root = newStore.get(rootKey);

      if (!root) {
        // Create root only if needed
        root = { _meta: newMetadata };
        newStore.set(rootKey, root);
        return { shadowStateStore: newStore };
      }

      // Special case for root metadata (common)
      if (path.length === 0) {
        const clonedRoot = { ...root };
        clonedRoot._meta = { ...(root._meta || {}), ...newMetadata };
        newStore.set(rootKey, clonedRoot);
        return { shadowStateStore: newStore };
      }

      // Clone path - optimized to only clone what changes
      const clonedRoot: any = { ...root };
      newStore.set(rootKey, clonedRoot);

      let current = clonedRoot;
      for (let i = 0; i < path.length; i++) {
        const segment = path[i]!;
        // Only clone if exists, create minimal object otherwise
        if (current[segment]) {
          current[segment] = { ...current[segment] };
        } else {
          current[segment] =
            i === path.length - 1
              ? { _meta: {} } // Last segment, prepare for metadata
              : {}; // Intermediate segment
        }
        current = current[segment];
      }

      // Merge metadata efficiently
      current._meta = current._meta
        ? { ...current._meta, ...newMetadata }
        : newMetadata;

      return { shadowStateStore: newStore };
    });
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

    // Check if it's a primitive wrapper - must match original logic exactly
    const isPrimitiveWrapper =
      Object.prototype.hasOwnProperty.call(node, 'value') &&
      nodeKeys.every((k) => k === 'value' || k === '_meta');

    if (isPrimitiveWrapper) {
      return node.value;
    }

    // Array check - more efficient with early check
    const isArrayNode =
      node._meta &&
      Object.prototype.hasOwnProperty.call(node._meta, 'arrayKeys');

    if (isArrayNode) {
      const keysToIterate =
        validArrayIds !== undefined && validArrayIds.length > 0
          ? validArrayIds
          : node._meta!.arrayKeys!;

      // Pre-allocate array for better performance
      const result = new Array(keysToIterate.length);
      for (let i = 0; i < keysToIterate.length; i++) {
        result[i] = get().getShadowValue(key, [...path, keysToIterate[i]!]);
      }
      return result;
    }

    // Object reconstruction - optimized with for...in
    const result: any = {};
    for (const propKey in node) {
      if (
        propKey !== '_meta' &&
        !propKey.startsWith('id:') &&
        Object.prototype.hasOwnProperty.call(node, propKey)
      ) {
        result[propKey] = get().getShadowValue(key, [...path, propKey]);
      }
    }
    return result;
  },

  updateShadowAtPath: (key, path, newValue) => {
    set((state) => {
      const newStore = new Map(state.shadowStateStore);
      const rootKey = newStore.has(`[${key}`) ? `[${key}` : key;
      let root = newStore.get(rootKey);
      if (!root) return state;

      // Clone the root and navigate to target
      const clonedRoot: any = { ...root };
      newStore.set(rootKey, clonedRoot);

      // For root-level updates (path.length === 0)
      if (path.length === 0) {
        const oldMeta = root._meta;
        const newRoot = buildShadowNode(newValue);
        if (oldMeta) {
          newRoot._meta = { ...oldMeta, ...(newRoot._meta || {}) };
        }
        newStore.set(rootKey, newRoot);

        get().notifyPathSubscribers(key, {
          type: 'UPDATE',
          newValue,
        });
        return { shadowStateStore: newStore };
      }

      // Navigate to parent of target, cloning only what we need
      let current = clonedRoot;
      const pathLength = path.length;

      for (let i = 0; i < pathLength - 1; i++) {
        const segment = path[i]!;
        current[segment] = current[segment] ? { ...current[segment] } : {};
        current = current[segment];
      }

      const lastSegment = path[pathLength - 1]!;
      const targetNode = current[lastSegment];

      // FAST PATH: Primitives, null, undefined, or arrays (no merge needed)
      if (
        newValue === null ||
        newValue === undefined ||
        typeof newValue !== 'object' ||
        Array.isArray(newValue) ||
        !targetNode ||
        Array.isArray(targetNode._meta?.arrayKeys)
      ) {
        // Simple replacement - just preserve metadata
        const oldMeta = targetNode?._meta;
        const newNode = buildShadowNode(newValue);
        if (oldMeta) {
          if (newNode._meta) {
            newNode._meta = { ...oldMeta, ...newNode._meta };
          } else {
            newNode._meta = oldMeta;
          }
        }
        current[lastSegment] = newNode;
      }
      // MERGE PATH: Only for object-to-object updates
      else {
        const mergedNode = { ...targetNode };
        current[lastSegment] = mergedNode;

        // Preserve metadata
        if (targetNode._meta) {
          mergedNode._meta = targetNode._meta;
        }

        // Build a Set for O(1) lookups
        const newKeysSet = new Set(Object.keys(newValue));

        // Remove old keys not in newValue (single pass)
        for (const key in mergedNode) {
          if (key !== '_meta' && !newKeysSet.has(key)) {
            delete mergedNode[key];
          }
        }

        // Add/update new keys (single pass)
        for (const key of newKeysSet) {
          mergedNode[key] = buildShadowNode(newValue[key]);
        }
      }

      get().notifyPathSubscribers([key, ...path].join('.'), {
        type: 'UPDATE',
        newValue,
      });

      return { shadowStateStore: newStore };
    });
  },
  addItemsToArrayNode: (key, arrayPath, newItems, newKeys) => {
    set((state) => {
      const newStore = new Map(state.shadowStateStore);
      const rootKey = newStore.has(`[${key}`) ? `[${key}` : key;
      let root = newStore.get(rootKey);
      if (!root) {
        console.error('Root not found for state key:', key);
        return state;
      }

      const clonedRoot = { ...root };
      newStore.set(rootKey, clonedRoot);

      let current = clonedRoot;
      for (const segment of arrayPath) {
        const nextNode = current[segment] || {};
        current[segment] = { ...nextNode };
        current = current[segment];
      }

      Object.assign(current, newItems);
      current._meta = { ...(current._meta || {}), arrayKeys: newKeys };

      return { shadowStateStore: newStore };
    });
  },

  insertShadowArrayElement: (key, arrayPath, newItem, index) => {
    const arrayNode = get().getShadowNode(key, arrayPath);
    if (!arrayNode?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[key, ...arrayPath].join('.')}`
      );
      return;
    }

    const newItemId = `id:${ulid()}`;
    const itemsToAdd = { [newItemId]: buildShadowNode(newItem) };

    const currentKeys = arrayNode._meta.arrayKeys;
    const newKeys = [...currentKeys];
    const insertionPoint =
      index !== undefined && index >= 0 && index <= newKeys.length
        ? index
        : newKeys.length;
    newKeys.splice(insertionPoint, 0, newItemId);

    get().addItemsToArrayNode(key, arrayPath, itemsToAdd, newKeys);

    const arrayKey = [key, ...arrayPath].join('.');
    get().notifyPathSubscribers(arrayKey, {
      type: 'INSERT',
      path: arrayKey,
      itemKey: `${arrayKey}.${newItemId}`,
      index: insertionPoint,
    });
  },
  insertManyShadowArrayElements: (
    key: string,
    arrayPath: string[],
    newItems: any[],
    index?: number
  ) => {
    if (!newItems || newItems.length === 0) return;

    const arrayNode = get().getShadowNode(key, arrayPath);
    if (!arrayNode?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[key, ...arrayPath].join('.')}`
      );
      return;
    }

    // Pre-allocate objects for better performance
    const itemsToAdd: Record<string, any> = Object.create(null);
    const newIds = new Array(newItems.length);

    // Generate all IDs and build nodes in one pass
    for (let i = 0; i < newItems.length; i++) {
      const newItemId = `id:${ulid()}`;
      newIds[i] = newItemId;
      itemsToAdd[newItemId] = buildShadowNode(newItems[i]);
    }

    // Efficient array concatenation
    const currentKeys = arrayNode._meta.arrayKeys;
    const insertionPoint =
      index !== undefined && index >= 0 && index <= currentKeys.length
        ? index
        : currentKeys.length;

    // Use spread operator for better performance with small arrays
    // For large arrays, consider using concat
    const finalKeys = [
      ...currentKeys.slice(0, insertionPoint),
      ...newIds,
      ...currentKeys.slice(insertionPoint),
    ];

    get().addItemsToArrayNode(key, arrayPath, itemsToAdd, finalKeys);

    // Single notification
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

    const newKeys = arrayNode._meta.arrayKeys.filter((k) => k !== itemId);
    delete arrayNode[itemId];

    get().setShadowMetadata(key, arrayPath, { arrayKeys: newKeys });

    const arrayKey = [key, ...arrayPath].join('.');
    get().notifyPathSubscribers(arrayKey, {
      type: 'REMOVE',
      path: arrayKey,
      itemKey: `${arrayKey}.${itemId}`,
    });
  },

  addPathComponent: (
    stateKey: string,
    dependencyPath: string[],
    fullComponentId: string
  ) => {
    const metadata = get().getShadowMetadata(stateKey, dependencyPath) || {};

    // Only clone and update if component not already added
    if (!metadata.pathComponents?.has(fullComponentId)) {
      const newPathComponents = new Set(metadata.pathComponents);
      newPathComponents.add(fullComponentId);

      get().setShadowMetadata(stateKey, dependencyPath, {
        pathComponents: newPathComponents,
      });

      // Update component's paths
      const rootMeta = get().getShadowMetadata(stateKey, []);
      if (rootMeta?.components) {
        const component = rootMeta.components.get(fullComponentId);
        if (
          component &&
          !component.paths.has([stateKey, ...dependencyPath].join('.'))
        ) {
          const newPaths = new Set(component.paths);
          const fullPathKey = [stateKey, ...dependencyPath].join('.');
          newPaths.add(fullPathKey);

          const newComponentsMap = new Map(rootMeta.components);
          newComponentsMap.set(fullComponentId, {
            ...component,
            paths: newPaths,
          });
          get().setShadowMetadata(stateKey, [], {
            components: newComponentsMap,
          });
        }
      }
    }
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
      const newMap = new Map(state.selectedIndicesMap); // CREATE A NEW MAP!

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
      const newMap = new Map(state.selectedIndicesMap); // CREATE A NEW MAP!
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
