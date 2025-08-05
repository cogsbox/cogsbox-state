import { create } from 'zustand';
import { ulid } from 'ulid';
import type {
  OptionsType,
  ReactivityType,
  StateKeys,
  SyncInfo,
  UpdateTypeDetail,
} from './CogsState.js';

import { startTransition, type ReactNode } from 'react';

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
  validation?: ValidationState;
  lastUpdated?: number;
  value?: any;
  classSignals?: Array<{
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

export type ValidationStatus =
  | 'PRISTINE' // Untouched, matches initial state.
  | 'DIRTY' // Changed, but no validation run yet.
  | 'VALID_LIVE' // Valid while typing.
  | 'INVALID_LIVE' // Gentle error during typing.
  | 'VALIDATION_FAILED' // Hard error on blur/submit.
  | 'VALID_PENDING_SYNC' // Passed validation, ready for sync.
  | 'SYNCING' // Actively being sent to the server.
  | 'SYNCED' // Server confirmed success.
  | 'SYNC_FAILED'; // Server rejected the data.

export type ValidationState = {
  status: ValidationStatus;
  message?: string;
  lastValidated?: number;
  validatedValue?: any;
};
export type CogsEvent =
  | { type: 'INSERT'; path: string; itemKey: string; index: number }
  | { type: 'REMOVE'; path: string; itemKey: string }
  | { type: 'UPDATE'; path: string; newValue: any }
  | { type: 'ITEMHEIGHT'; itemKey: string; height: number }
  | { type: 'RELOAD'; path: string };
export type CogsGlobalState = {
  updateQueue: Set<() => void>;
  isFlushScheduled: boolean;

  flushUpdates: () => void;

  // --- Shadow State and Subscription System ---
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
  addStateLog: (key: string, update: UpdateTypeDetail) => void;

  setSyncInfo: (key: string, syncInfo: SyncInfo) => void;
  getSyncInfo: (key: string) => SyncInfo | null;
};
const isSimpleObject = (value: any): boolean => {
  // Most common cases first
  if (value === null || typeof value !== 'object') return false;

  // Arrays are simple objects
  if (Array.isArray(value)) return true;

  // Plain objects second most common
  if (value.constructor === Object) return true;

  // Everything else is not simple
  return false;
};
export const getGlobalStore = create<CogsGlobalState>((set, get) => ({
  updateQueue: new Set<() => void>(),
  // A flag to ensure we only schedule the flush once per event-loop tick.
  isFlushScheduled: false,

  // This function is called by queueMicrotask to execute all queued updates.
  flushUpdates: () => {
    const { updateQueue } = get();

    if (updateQueue.size > 0) {
      startTransition(() => {
        updateQueue.forEach((updateFn) => updateFn());
      });
    }

    // Clear the queue and reset the flag for the next event loop tick.
    set({ updateQueue: new Set(), isFlushScheduled: false });
  },
  addPathComponent: (stateKey, dependencyPath, fullComponentId) => {
    set((state) => {
      const newShadowStore = new Map(state.shadowStateStore);
      const dependencyKey = [stateKey, ...dependencyPath].join('.');

      // --- Part 1: Update the path's own metadata ---
      const pathMeta = newShadowStore.get(dependencyKey) || {};
      // Create a *new* Set to ensure immutability
      const pathComponents = new Set(pathMeta.pathComponents);
      pathComponents.add(fullComponentId);
      // Update the metadata for the specific path
      newShadowStore.set(dependencyKey, { ...pathMeta, pathComponents });

      // --- Part 2: Update the component's own list of paths ---
      const rootMeta = newShadowStore.get(stateKey) || {};
      const component = rootMeta.components?.get(fullComponentId);

      // If the component exists, update its `paths` set immutably
      if (component) {
        const newPaths = new Set(component.paths);
        newPaths.add(dependencyKey);

        const newComponentRegistration = { ...component, paths: newPaths };
        const newComponentsMap = new Map(rootMeta.components);
        newComponentsMap.set(fullComponentId, newComponentRegistration);

        // Update the root metadata with the new components map
        newShadowStore.set(stateKey, {
          ...rootMeta,
          components: newComponentsMap,
        });
      }

      // Return the final, updated state
      return { shadowStateStore: newShadowStore };
    });
  },
  registerComponent: (stateKey, fullComponentId, registration) => {
    set((state) => {
      const newShadowStore = new Map(state.shadowStateStore);
      const rootMeta = newShadowStore.get(stateKey) || {};
      const components = new Map(rootMeta.components);
      components.set(fullComponentId, registration);
      newShadowStore.set(stateKey, { ...rootMeta, components });
      return { shadowStateStore: newShadowStore };
    });
  },

  unregisterComponent: (stateKey, fullComponentId) => {
    set((state) => {
      const newShadowStore = new Map(state.shadowStateStore);
      const rootMeta = newShadowStore.get(stateKey);
      if (!rootMeta?.components) {
        return state; // Return original state, no change needed
      }

      const components = new Map(rootMeta.components);
      const wasDeleted = components.delete(fullComponentId);

      // Only update state if something was actually deleted
      if (wasDeleted) {
        newShadowStore.set(stateKey, { ...rootMeta, components });
        return { shadowStateStore: newShadowStore };
      }

      return state; // Nothing changed
    });
  },
  markAsDirty: (key: string, path: string[], options = { bubble: true }) => {
    const { shadowStateStore } = get();
    const updates = new Map<string, ShadowMetadata>();

    const setDirty = (currentPath: string[]) => {
      const fullKey = [key, ...currentPath].join('.');
      const meta = shadowStateStore.get(fullKey) || {};

      // If already dirty, no need to update
      if (meta.isDirty === true) {
        return true; // Return true to indicate parent is dirty
      }

      updates.set(fullKey, { ...meta, isDirty: true });
      return false; // Not previously dirty
    };

    // Mark the target path
    setDirty(path);

    // Bubble up if requested
    if (options.bubble) {
      let parentPath = [...path];
      while (parentPath.length > 0) {
        parentPath.pop();
        const wasDirty = setDirty(parentPath);
        if (wasDirty) {
          break; // Stop bubbling if parent was already dirty
        }
      }
    }

    // Apply all updates at once
    if (updates.size > 0) {
      set((state) => {
        updates.forEach((meta, key) => {
          state.shadowStateStore.set(key, meta);
        });
        return state;
      });
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
  getShadowNode: (key: string) => get().shadowStateStore.get(key),
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

  initializeShadowState: (key: string, initialState: any) => {
    set((state) => {
      // 1. Make a copy of the current store to modify it
      const newShadowStore = new Map(state.shadowStateStore);
      console.log('initializeShadowState');
      // 2. PRESERVE the existing components map before doing anything else
      const existingRootMeta = newShadowStore.get(key);
      const preservedComponents = existingRootMeta?.components;

      // 3. Wipe all old shadow entries for this state key
      const prefixToDelete = key + '.';
      for (const k of Array.from(newShadowStore.keys())) {
        if (k === key || k.startsWith(prefixToDelete)) {
          newShadowStore.delete(k);
        }
      }

      // 4. Run your original logic to rebuild the state tree from scratch
      const processValue = (value: any, path: string[]) => {
        const nodeKey = [key, ...path].join('.');

        if (Array.isArray(value)) {
          const childIds: string[] = [];
          value.forEach(() => {
            const itemId = `id:${ulid()}`;
            childIds.push(nodeKey + '.' + itemId);
          });
          newShadowStore.set(nodeKey, { arrayKeys: childIds });
          value.forEach((item, index) => {
            const itemId = childIds[index]!.split('.').pop();
            processValue(item, [...path!, itemId!]);
          });
        } else if (isSimpleObject(value)) {
          const fields = Object.fromEntries(
            Object.keys(value).map((k) => [k, nodeKey + '.' + k])
          );
          newShadowStore.set(nodeKey, { fields });
          Object.keys(value).forEach((k) => {
            processValue(value[k], [...path, k]);
          });
        } else {
          newShadowStore.set(nodeKey, { value });
        }
      };
      processValue(initialState, []);

      // 5. RESTORE the preserved components map onto the new root metadata
      if (preservedComponents) {
        const newRootMeta = newShadowStore.get(key) || {};
        newShadowStore.set(key, {
          ...newRootMeta,
          components: preservedComponents,
        });
      }

      // 6. Return the completely updated state
      return { shadowStateStore: newShadowStore };
    });
  },

  getShadowValue: (fullKey: string, validArrayIds?: string[]) => {
    const memo = new Map<string, any>();
    const reconstruct = (keyToBuild: string, ids?: string[]): any => {
      if (memo.has(keyToBuild)) {
        return memo.get(keyToBuild);
      }

      const shadowMeta = get().shadowStateStore.get(keyToBuild);
      if (!shadowMeta) {
        return undefined;
      }

      if (shadowMeta.value !== undefined) {
        return shadowMeta.value;
      }

      let result: any; // The value we are about to build.

      if (shadowMeta.arrayKeys) {
        const keys = ids ?? shadowMeta.arrayKeys;
        result = [];
        memo.set(keyToBuild, result);
        keys.forEach((itemKey) => {
          result.push(reconstruct(itemKey));
        });
      } else if (shadowMeta.fields) {
        result = {};
        memo.set(keyToBuild, result);
        Object.entries(shadowMeta.fields).forEach(([key, fieldPath]) => {
          result[key] = reconstruct(fieldPath as string);
        });
      } else {
        result = undefined;
      }

      // Return the final, fully populated result.
      return result;
    };

    // Start the process by calling the inner function on the root key.
    return reconstruct(fullKey, validArrayIds);
  },
  getShadowMetadata: (key: string, path: string[]) => {
    const fullKey = [key, ...path].join('.');

    return get().shadowStateStore.get(fullKey);
  },

  setShadowMetadata: (key, path, metadata) => {
    const fullKey = [key, ...path].join('.');
    const existingMeta = get().shadowStateStore.get(fullKey);

    // --- THIS IS THE TRAP ---
    // If the existing metadata HAS a components map, but the NEW metadata DOES NOT,
    // it means we are about to wipe it out. This is the bug.
    if (existingMeta?.components && !metadata.components) {
      console.group(
        '%c🚨 RACE CONDITION DETECTED! 🚨',
        'color: red; font-size: 18px; font-weight: bold;'
      );
      console.error(
        `An overwrite is about to happen on stateKey: "${key}" at path: [${path.join(', ')}]`
      );
      console.log(
        'The EXISTING metadata had a components map:',
        existingMeta.components
      );
      console.log(
        'The NEW metadata is trying to save WITHOUT a components map:',
        metadata
      );
      console.log(
        '%cStack trace to the function that caused this overwrite:',
        'font-weight: bold;'
      );
      console.trace(); // This prints the call stack, leading you to the bad code.
      console.groupEnd();
    }
    // --- END OF TRAP ---

    const newShadowStore = new Map(get().shadowStateStore);
    const finalMeta = { ...(existingMeta || {}), ...metadata };
    newShadowStore.set(fullKey, finalMeta);
    set({ shadowStateStore: newShadowStore });
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

    if (!parentMeta || !parentMeta.arrayKeys) return;

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
    const fullKey = [key, ...path].join('.');

    // Optimization: Only update if value actually changed
    const existingMeta = get().shadowStateStore.get(fullKey);
    if (existingMeta?.value === newValue && !isSimpleObject(newValue)) {
      return; // Skip update for unchanged primitives
    }

    // CHANGE: Don't clone the entire Map, just update in place
    set((state) => {
      const store = state.shadowStateStore;

      if (!isSimpleObject(newValue)) {
        const meta = store.get(fullKey) || {};
        store.set(fullKey, { ...meta, value: newValue });
      } else {
        // Handle objects by iterating
        const processObject = (currentPath: string[], objectToSet: any) => {
          const currentFullKey = [key, ...currentPath].join('.');
          const meta = store.get(currentFullKey);

          if (meta && meta.fields) {
            for (const fieldKey in objectToSet) {
              if (Object.prototype.hasOwnProperty.call(objectToSet, fieldKey)) {
                const childValue = objectToSet[fieldKey];
                const childFullPath = meta.fields[fieldKey];

                if (childFullPath) {
                  if (isSimpleObject(childValue)) {
                    processObject(
                      childFullPath.split('.').slice(1),
                      childValue
                    );
                  } else {
                    const existingChildMeta = store.get(childFullPath) || {};
                    store.set(childFullPath, {
                      ...existingChildMeta,
                      value: childValue,
                    });
                  }
                }
              }
            }
          }
        };

        processObject(path, newValue);
      }

      // Only notify after all changes are made
      get().notifyPathSubscribers(fullKey, { type: 'UPDATE', newValue });

      // Return same reference if using Zustand's immer middleware
      return state;
    });
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
      const newMap = state.selectedIndicesMap;
      const acutalKey = newMap.get(arrayKey);
      if (acutalKey) {
        get().notifyPathSubscribers(acutalKey, {
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
  clearSelectedIndexesForState: (stateKey: string) => {
    set((state) => {
      const newOuterMap = new Map(state.selectedIndicesMap);
      const changed = newOuterMap.delete(stateKey);
      if (changed) {
        return { selectedIndicesMap: newOuterMap };
      } else {
        return {};
      }
    });
  },

  initialStateOptions: {},

  stateTimeline: {},
  cogsStateStore: {},
  stateLog: new Map(),

  initialStateGlobal: {},

  validationErrors: new Map(),
  addStateLog: (key, update) => {
    set((state) => {
      const newLog = new Map(state.stateLog);
      const stateLogForKey = new Map(newLog.get(key));
      const uniquePathKey = JSON.stringify(update.path);

      const existing = stateLogForKey.get(uniquePathKey);
      if (existing) {
        // If an update for this path already exists, just modify it. (Fast)
        existing.newValue = update.newValue;
        existing.timeStamp = update.timeStamp;
      } else {
        // Otherwise, add the new update. (Fast)
        stateLogForKey.set(uniquePathKey, { ...update });
      }

      newLog.set(key, stateLogForKey);
      return { stateLog: newLog };
    });
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
