import { create } from 'zustand';
import { ulid } from 'ulid';
import type {
  OptionsType,
  ReactivityType,
  StateKeys,
  SyncInfo,
  UpdateTypeDetail,
} from './CogsState.js';

import type { ReactNode } from 'react';

type StateUpdater<StateValue> =
  | StateValue
  | ((prevValue: StateValue) => StateValue);

export type FreshValuesObject = {
  pathsToValues?: string[];
  prevValue?: any;
  newValue?: any;
  timeStamp: number;
};

type SyncLogType = {
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
  // New method to get all refs for a stateKey
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

  // Get all refs that start with the stateKey prefix
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
  lastUpdated?: number;
  value?: any;
  classSignals?: Array<{
    // <-- ADD THIS BLOCK
    id: string;
    effect: string;
    lastClasses: string;
    deps: any[];
  }>;
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
    mapFn: (
      setter: any,
      index: number,

      arraySetter: any
    ) => ReactNode;
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
export type CogsEvent =
  | { type: 'INSERT'; path: string; itemKey: string; index: number }
  | { type: 'REMOVE'; path: string; itemKey: string }
  | { type: 'UPDATE'; path: string; newValue: any }
  | { type: 'ITEMHEIGHT'; itemKey: string; height: number } // For full re-initializations (e.g., when a component is removed)
  | { type: 'RELOAD'; path: string }; // For full re-initializations
export type CogsGlobalState = {
  // --- Shadow State and Subscription System ---
  shadowStateStore: Map<string, ShadowMetadata>;
  markAsDirty: (
    key: string,
    path: string[],
    options: { bubble: boolean }
  ) => void;
  // These method signatures stay the same
  initializeShadowState: (key: string, initialState: any) => void;
  updateShadowAtPath: (key: string, path: string[], newValue: any) => void;
  insertShadowArrayElement: (
    key: string,
    arrayPath: string[],
    newItem: any
  ) => void;
  removeShadowArrayElement: (key: string, arrayPath: string[]) => void;
  getShadowValue: (
    key: string,

    validArrayIds?: string[]
  ) => any;

  getShadowMetadata: (
    key: string,
    path: string[]
  ) => ShadowMetadata | undefined;
  setShadowMetadata: (
    key: string,
    path: string[],
    metadata: Omit<ShadowMetadata, 'id'>
  ) => void;
  setTransformCache: (
    key: string,
    path: string[],
    cacheKey: string,
    cacheData: any
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

  // --- Core State and Updaters ---

  initialStateOptions: { [key: string]: OptionsType };

  initialStateGlobal: { [key: string]: StateValue };

  updateInitialStateGlobal: (key: string, newState: StateValue) => void;

  getInitialOptions: (key: string) => OptionsType | undefined;
  setInitialStateOptions: (key: string, value: OptionsType) => void;

  // --- Validation ---
  validationErrors: Map<string, string[]>;
  addValidationError: (path: string, message: string) => void;
  getValidationErrors: (path: string) => string[];
  removeValidationError: (path: string) => void;

  // --- Server Sync and Logging ---

  serverStateUpdates: Map<
    string,
    {
      data: any;
      status: 'loading' | 'success' | 'error';
      timestamp: number;
    }
  >;

  setServerStateUpdate: (key: string, serverState: any) => void;

  stateLog: { [key: string]: UpdateTypeDetail[] };
  syncInfoStore: Map<string, SyncInfo>;

  setStateLog: (
    key: string,
    updater: (prevUpdates: UpdateTypeDetail[]) => UpdateTypeDetail[]
  ) => void;
  setSyncInfo: (key: string, syncInfo: SyncInfo) => void;
  getSyncInfo: (key: string) => SyncInfo | null;
};
const isSimpleObject = (value: any): boolean => {
  if (value === null || typeof value !== 'object') return false;

  // Handle special cases that should be treated as primitives
  if (
    value instanceof Uint8Array ||
    value instanceof Int8Array ||
    value instanceof Uint16Array ||
    value instanceof Int16Array ||
    value instanceof Uint32Array ||
    value instanceof Int32Array ||
    value instanceof Float32Array ||
    value instanceof Float64Array ||
    value instanceof ArrayBuffer ||
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set
  ) {
    return false; // Treat as primitive
  }

  // Arrays and plain objects are complex
  return Array.isArray(value) || value.constructor === Object;
};
export const getGlobalStore = create<CogsGlobalState>((set, get) => ({
  markAsDirty: (key: string, path: string[], options = { bubble: true }) => {
    const newShadowStore = new Map(get().shadowStateStore);
    let changed = false;

    // This function marks a single path as dirty if it was previously synced.
    const setDirty = (currentPath: string[]) => {
      const fullKey = [key, ...currentPath].join('.');
      const meta = newShadowStore.get(fullKey);

      // We only mark something as dirty if it was previously synced from the server.
      // We also check `isDirty !== true` to avoid redundant updates.
      if (meta && meta.stateSource === 'server' && meta.isDirty !== true) {
        newShadowStore.set(fullKey, { ...meta, isDirty: true });
        changed = true;
      }
    };

    // 1. Mark the target path itself as dirty.
    setDirty(path);

    // 2. If `bubble` is true, walk up the path and mark all parents as dirty.
    if (options.bubble) {
      let parentPath = [...path];
      while (parentPath.length > 0) {
        parentPath.pop();
        setDirty(parentPath);
      }
    }

    // Only update the global state if something actually changed.
    if (changed) {
      set({ shadowStateStore: newShadowStore });
    }
  },
  serverStateUpdates: new Map(),
  setServerStateUpdate: (key, serverState) => {
    set((state) => {
      const newMap = new Map(state.serverStateUpdates);
      newMap.set(key, serverState);
      return { serverStateUpdates: newMap };
    });

    // Notify all subscribers for this key
    get().notifyPathSubscribers(key, {
      type: 'SERVER_STATE_UPDATE',
      serverState,
    });
  },
  shadowStateStore: new Map(),
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
    // <-- Now accepts newValue
    const subscribers = get().pathSubscribers;
    const subs = subscribers.get(updatedPath);

    if (subs) {
      // Pass the newValue to every callback
      subs.forEach((callback) => callback(newValue));
    }
  },
  initializeShadowState: (key: string, initialState: any) => {
    const existingShadowStore = new Map(get().shadowStateStore);

    const processValue = (value: any, path: string[]) => {
      const nodeKey = [key, ...path].join('.');

      if (Array.isArray(value)) {
        // Handle arrays as before
        const childIds: string[] = [];

        value.forEach((item) => {
          const itemId = `id:${ulid()}`;
          childIds.push(nodeKey + '.' + itemId);
        });

        existingShadowStore.set(nodeKey, { arrayKeys: childIds });

        value.forEach((item, index) => {
          const itemId = childIds[index]!.split('.').pop();
          processValue(item, [...path!, itemId!]);
        });
      } else if (isSimpleObject(value)) {
        // Only create field mappings for simple objects
        const fields = Object.fromEntries(
          Object.keys(value).map((k) => [k, nodeKey + '.' + k])
        );
        existingShadowStore.set(nodeKey, { fields });

        Object.keys(value).forEach((k) => {
          processValue(value[k], [...path, k]);
        });
      } else {
        // Treat everything else (including Uint8Array) as primitive values
        existingShadowStore.set(nodeKey, { value });
      }
    };

    processValue(initialState, []);
    set({ shadowStateStore: existingShadowStore });
  },

  getShadowValue: (fullKey: string, validArrayIds?: string[]) => {
    const shadowMeta = get().shadowStateStore.get(fullKey);

    // If no metadata found, return undefined
    if (!shadowMeta) {
      return undefined;
    }

    // For primitive values, return the value
    if (shadowMeta.value !== undefined) {
      return shadowMeta.value;
    }

    // For arrays, reconstruct with possible validArrayIds
    if (shadowMeta.arrayKeys) {
      const arrayKeys = validArrayIds ?? shadowMeta.arrayKeys;
      const items = arrayKeys.map((itemKey) => {
        // RECURSIVELY call getShadowValue for each item
        return get().getShadowValue(itemKey);
      });
      return items;
    }

    // For objects with fields, reconstruct object
    if (shadowMeta.fields) {
      const reconstructedObject: any = {};
      Object.entries(shadowMeta.fields).forEach(([key, fieldPath]) => {
        // RECURSIVELY call getShadowValue for each field
        reconstructedObject[key] = get().getShadowValue(fieldPath as string);
      });
      return reconstructedObject;
    }

    return undefined;
  },
  getShadowMetadata: (
    key: string,
    path: string[],
    validArrayIds?: string[]
  ) => {
    const fullKey = [key, ...path].join('.');
    let data = get().shadowStateStore.get(fullKey);

    return get().shadowStateStore.get(fullKey);
  },

  setShadowMetadata: (key: string, path: string[], metadata: any) => {
    const fullKey = [key, ...path].join('.');
    const newShadowStore = new Map(get().shadowStateStore);
    const existing = newShadowStore.get(fullKey) || { id: ulid() };
    newShadowStore.set(fullKey, { ...existing, ...metadata });
    set({ shadowStateStore: newShadowStore });

    if (metadata.virtualizer?.itemHeight) {
      get().notifyPathSubscribers(fullKey, get().getShadowValue(fullKey));
    }
  },
  setTransformCache: (
    key: string,
    path: string[],
    cacheKey: string,
    cacheData: any
  ) => {
    const fullKey = [key, ...path].join('.');
    const newShadowStore = new Map(get().shadowStateStore);
    const existing = newShadowStore.get(fullKey) || {};

    // Initialize transformCaches if it doesn't exist
    if (!existing.transformCaches) {
      existing.transformCaches = new Map();
    }

    // Update just the specific cache entry
    existing.transformCaches.set(cacheKey, cacheData);

    // Update shadow store WITHOUT notifying path subscribers
    newShadowStore.set(fullKey, existing);
    set({ shadowStateStore: newShadowStore });

    // Don't call notifyPathSubscribers here - cache updates shouldn't trigger renders
  },
  insertShadowArrayElement: (
    key: string,
    arrayPath: string[],
    newItem: any
  ) => {
    const newShadowStore = new Map(get().shadowStateStore);
    const arrayKey = [key, ...arrayPath].join('.');
    const parentMeta = newShadowStore.get(arrayKey);
    console.log('parentMetaparentMetaparentMeta', parentMeta);
    if (!parentMeta || !parentMeta.arrayKeys) return;

    // Generate the ID if it doesn't have one

    const newItemId = `id:${ulid()}`;
    const fullItemKey = arrayKey + '.' + newItemId;

    // Just add to the end (or at a specific index if provided)
    const newArrayKeys = [...parentMeta.arrayKeys];
    newArrayKeys.push(fullItemKey); // Or use splice if you have an index
    newShadowStore.set(arrayKey, { ...parentMeta, arrayKeys: newArrayKeys });

    // Process the new item - but use the correct logic
    const processNewItem = (value: any, path: string[]) => {
      const nodeKey = [key, ...path].join('.');

      if (Array.isArray(value)) {
        // Handle arrays...
      } else if (typeof value === 'object' && value !== null) {
        // Create fields mapping
        const fields = Object.fromEntries(
          Object.keys(value).map((k) => [k, nodeKey + '.' + k])
        );
        newShadowStore.set(nodeKey, { fields });

        // Process each field
        Object.entries(value).forEach(([k, v]) => {
          processNewItem(v, [...path, k]);
        });
      } else {
        // Primitive value
        newShadowStore.set(nodeKey, { value });
      }
    };

    processNewItem(newItem, [...arrayPath, newItemId]);
    set({ shadowStateStore: newShadowStore });
    get().notifyPathSubscribers(arrayKey, {
      type: 'INSERT',
      path: arrayKey,
      itemKey: fullItemKey,
    });
  },
  removeShadowArrayElement: (key: string, itemPath: string[]) => {
    const newShadowStore = new Map(get().shadowStateStore);

    // Get the full item key (e.g., "stateKey.products.id:xxx")
    const itemKey = [key, ...itemPath].join('.');

    // Extract parent path and item ID
    const parentPath = itemPath.slice(0, -1);
    const parentKey = [key, ...parentPath].join('.');
    const itemIdToRemove = itemPath[itemPath.length - 1];

    // Get parent metadata
    const parentMeta = newShadowStore.get(parentKey);

    if (parentMeta && parentMeta.arrayKeys) {
      // Find the index of the item to remove
      const indexToRemove = parentMeta.arrayKeys.findIndex(
        (arrayItemKey) => arrayItemKey === itemKey
      );

      if (indexToRemove !== -1) {
        // Create new array keys with the item removed
        const newArrayKeys = parentMeta.arrayKeys.filter(
          (arrayItemKey) => arrayItemKey !== itemKey
        );

        // Update parent with new array keys
        newShadowStore.set(parentKey, {
          ...parentMeta,
          arrayKeys: newArrayKeys,
        });

        // Delete all data associated with the removed item
        const prefixToDelete = itemKey + '.';
        for (const k of Array.from(newShadowStore.keys())) {
          if (k === itemKey || k.startsWith(prefixToDelete)) {
            newShadowStore.delete(k);
          }
        }
      }
    }

    set({ shadowStateStore: newShadowStore });

    get().notifyPathSubscribers(parentKey, {
      type: 'REMOVE',
      path: parentKey,
      itemKey: itemKey, // The exact ID of the removed item
    });
  },
  updateShadowAtPath: (key, path, newValue) => {
    const newShadowStore = new Map(get().shadowStateStore);
    const fullKey = [key, ...path].join('.');

    const updateValue = (currentKey: string, valueToSet: any) => {
      const meta = newShadowStore.get(currentKey);

      // If it's a simple object with fields, update recursively
      if (isSimpleObject(valueToSet) && meta && meta.fields) {
        for (const fieldKey in valueToSet) {
          if (Object.prototype.hasOwnProperty.call(valueToSet, fieldKey)) {
            const childPath = meta.fields[fieldKey];
            const childValue = valueToSet[fieldKey];

            if (childPath) {
              updateValue(childPath as string, childValue);
            }
          }
        }
      } else {
        // For primitives (including Uint8Array), just replace the value
        // This gives you useState-like behavior
        const existing = newShadowStore.get(currentKey) || {};
        newShadowStore.set(currentKey, { ...existing, value: valueToSet });
      }
    };

    updateValue(fullKey, newValue);
    set({ shadowStateStore: newShadowStore });
    get().notifyPathSubscribers(fullKey, newValue);
  },
  selectedIndicesMap: new Map<string, string>(),
  getSelectedIndex: (arrayKey: string, validIds?: string[]): number => {
    const itemKey = get().selectedIndicesMap.get(arrayKey);

    if (!itemKey) return -1;

    // Use validIds if provided (for filtered views), otherwise use all arrayKeys
    const arrayKeys =
      validIds ||
      getGlobalStore.getState().getShadowMetadata(arrayKey, [])?.arrayKeys;

    if (!arrayKeys) return -1;

    return arrayKeys.indexOf(itemKey);
  },

  setSelectedIndex: (arrayKey: string, itemKey: string | undefined) => {
    set((state) => {
      const newMap = state.selectedIndicesMap;

      if (itemKey === undefined) {
        newMap.delete(arrayKey);
      } else {
        if (newMap.has(arrayKey)) {
          get().notifyPathSubscribers(newMap.get(arrayKey)!, {
            type: 'THIS_UNSELECTED',
          });
        }
        newMap.set(arrayKey, itemKey);
        console.log('ggggggggggggggggggggggggggggggggggg', itemKey);
        get().notifyPathSubscribers(itemKey, {
          type: 'THIS_SELECTED',
        });
      }
      get().notifyPathSubscribers(arrayKey, {
        type: 'GET_SELECTED',
      });
      return {
        ...state,
        selectedIndicesMap: newMap,
      };
    });
  },
  clearSelectedIndex: ({ arrayKey }: { arrayKey: string }): void => {
    set((state) => {
      console.log('clearSelectedIndex', arrayKey, state.selectedIndicesMap);
      const newMap = state.selectedIndicesMap;

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
  clearSelectedIndexesForState: (stateKey: string) => {
    set((state) => {
      const newOuterMap = new Map(state.selectedIndicesMap);
      const changed = newOuterMap.delete(stateKey);
      if (changed) {
        console.log(
          `Cleared selected indices map entry for stateKey: ${stateKey}`
        );
        return { selectedIndicesMap: newOuterMap };
      } else {
        return {};
      }
    });
  },

  initialStateOptions: {},

  stateTimeline: {},
  cogsStateStore: {},
  stateLog: {},

  initialStateGlobal: {},

  validationErrors: new Map(),

  setStateLog: (
    key: string,
    updater: (prevUpdates: UpdateTypeDetail[]) => UpdateTypeDetail[]
  ) => {
    set((prev) => {
      const currentUpdates = prev.stateLog[key] ?? [];
      const newUpdates = updater(currentUpdates);
      return {
        stateLog: {
          ...prev.stateLog,
          [key]: newUpdates,
        },
      };
    });
  },

  addValidationError: (path, message) => {
    console.log('addValidationError---');
    set((prev) => {
      const updatedErrors = new Map(prev.validationErrors);
      const existingMessages = updatedErrors.get(path) || [];
      console.log('addValidationError', path, message, existingMessages);
      // Append the new message instead of replacing
      updatedErrors.set(path, [...existingMessages, message]);
      return { validationErrors: updatedErrors };
    });
  },
  removeValidationError: (path) => {
    set((prev) => {
      const updatedErrors = new Map(prev.validationErrors);

      let doSomething = false;
      const pathArray = path.split('.');
      Array.from(updatedErrors.keys()).forEach((key) => {
        const keyArray = key.split('.');
        if (keyArray.length >= pathArray.length) {
          let match = true;
          for (let i = 0; i < pathArray.length; i++) {
            if (keyArray[i] !== pathArray[i]) {
              match = false;
              break;
            }
          }

          if (match) {
            doSomething = true;
            updatedErrors.delete(key);
          }
        }
      });

      return doSomething ? { validationErrors: updatedErrors } : prev;
    });
  },
  getValidationErrors: (path: string) => {
    const errors: string[] = [];
    const valErrors = get().validationErrors;
    const pathArray = path.split('.');

    // Helper to check if an index matches either a wildcard or is in an array of indices
    const isIndexMatch = (pathSegment: string, keySegment: string) => {
      if (pathSegment === '[*]') return true;
      if (Array.isArray(pathSegment)) {
        return pathSegment.includes(parseInt(keySegment));
      }
      return pathSegment === keySegment;
    };

    Array.from(valErrors.keys()).forEach((key) => {
      const keyArray = key.split('.');
      if (keyArray.length >= pathArray.length) {
        let match = true;
        for (let i = 0; i < pathArray.length; i++) {
          const pathSegment = pathArray[i];
          const keySegment = keyArray[i]!;

          // If current path segment is a number or [*], we need special handling
          if (pathSegment === '[*]' || Array.isArray(pathSegment)) {
            // Key segment should be a number if we're using [*] or array indices
            const keyIndex = parseInt(keySegment);
            if (isNaN(keyIndex)) {
              match = false;
              break;
            }

            if (!isIndexMatch(pathSegment, keySegment)) {
              match = false;
              break;
            }
          } else if (pathSegment !== keySegment) {
            match = false;
            break;
          }
        }

        if (match) {
          const errorMessages = valErrors.get(key);
          if (errorMessages) {
            errors.push(...errorMessages);
          }
        }
      }
    });

    return errors;
  },
  getInitialOptions: (key) => {
    return get().initialStateOptions[key];
  },

  setInitialStateOptions: (key, value) => {
    set((prev) => ({
      initialStateOptions: {
        ...prev.initialStateOptions,
        [key]: value,
      },
    }));
  },
  updateInitialStateGlobal: (key, newState) => {
    set((prev) => ({
      initialStateGlobal: {
        ...prev.initialStateGlobal,
        [key]: newState,
      },
    }));
  },

  syncInfoStore: new Map<string, SyncInfo>(),
  setSyncInfo: (key: string, syncInfo: SyncInfo) =>
    set((state) => {
      const newMap = new Map(state.syncInfoStore);
      newMap.set(key, syncInfo);
      return { ...state, syncInfoStore: newMap };
    }),
  getSyncInfo: (key: string) => get().syncInfoStore.get(key) || null,
}));
