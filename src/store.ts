import { create } from 'zustand';
import { ulid } from 'ulid';
import type {
  OptionsType,
  ReactivityType,
  SyncInfo,
  UpdateTypeDetail,
} from './CogsState.js';

import { startTransition, type ReactNode } from 'react';

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

export type ValidationStatus =
  | 'NOT_VALIDATED' // Never run
  | 'VALIDATING' // Currently running
  | 'VALID' // Passed
  | 'INVALID'; // Failed

export type ValidationError = {
  source: 'client' | 'sync_engine' | 'api';
  message: string;
  severity: 'warning' | 'error'; // warning = gentle, error = blocking
  code?: string; // Optional error code
};

export type ValidationState = {
  status: ValidationStatus;
  errors: ValidationError[];
  lastValidated?: number;
  validatedValue?: any; // Value when last validated
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
  value?: any;

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
  | { type: 'ITEMHEIGHT'; itemKey: string; height: number }
  | { type: 'RELOAD'; path: string };

type ShadowValueNEW = {
  value: any;
  // Metadata that can exist on any value
  signals?: Array<{
    instanceId: string;
    parentId: string;
    position: number;
    effect?: string;
  }>;
  validation?: ValidationState;
  virtualizer?: {
    itemHeight?: number;
    domRef?: HTMLElement | null;
  };
  pathComponents?: Set<string>;
};

type ShadowObjectNEW = {
  [key: string]: ShadowValueNEW | ShadowObjectNEW | ShadowArrayNEW;
};

type ShadowArrayNEW = {
  [key: `id:${string}`]: ShadowValueNEW | ShadowObjectNEW | ShadowArrayNEW;
  // Array-specific metadata
  arrayKeys: string[];
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
};

type ShadowRootNEW = ShadowObjectNEW | ShadowArrayNEW;

export type CogsGlobalState = {
  // NEW shadow store
  shadowStateStore: Map<string, ShadowRootNEW>;

  // NEW functions
  initializeShadowState: (key: string, initialState: any) => void;
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
  // These method signatures stay the same

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
  addStateLog: (updates: UpdateTypeDetail[]) => void;

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

// ✅ CHANGE 1: Add `arrayKeys` to the list of recognized metadata keys.
export const METADATA_KEYS = new Set([
  'arrayKeys',
  'components',
  'signals',
  'mapWrappers',
  'pathComponents',
  'validation',
  'features',
  'virtualizer',
  'transformCaches',
  'lastServerSync',
  'stateSource',
  'baseServerState',
  'isDirty',
]);

/**
 * The single source of truth for converting a regular JS value/object
 * into the shadow state tree format.
 */
// ✅ CHANGE 2: `buildShadowNode` now correctly handles all arrays.
export function buildShadowNode(value: any): any {
  // Primitives and null are wrapped.
  if (value === null || typeof value !== 'object') {
    return { value };
  }

  // Arrays are converted to an object with id-keyed children and an `arrayKeys` metadata property.
  if (Array.isArray(value)) {
    const arrayNode: any = { arrayKeys: [] }; // Initialize with arrayKeys
    const idKeys: string[] = [];
    value.forEach((item) => {
      const itemId = `id:${ulid()}`;
      arrayNode[itemId] = buildShadowNode(item); // Recurse for each item
      idKeys.push(itemId);
    });
    arrayNode.arrayKeys = idKeys; // Set the final ordered keys
    return arrayNode;
  }

  // Plain objects are recursively processed.
  if (value.constructor === Object) {
    const objectNode: any = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        objectNode[key] = buildShadowNode(value[key]); // Recurse for each property
      }
    }
    return objectNode;
  }

  // Fallback for other object types (Date, etc.) - treat them as primitives.
  return { value };
}
export const getGlobalStore = create<CogsGlobalState>((set, get) => ({
  // Add to CogsGlobalState in store.ts

  shadowStateStore: new Map<string, ShadowRootNEW>(),
  initializeShadowState: (key: string, initialState: any) => {
    set((state) => {
      const newShadowStoreNEW = new Map(state.shadowStateStore);
      const existingRoot =
        newShadowStoreNEW.get(key) || newShadowStoreNEW.get(`[${key}`);
      let preservedMetadata: any = {};
      if (existingRoot) {
        const {
          components,
          features,
          lastServerSync,
          stateSource,
          baseServerState,
        } = existingRoot as any;
        if (components) preservedMetadata.components = components;
        if (features) preservedMetadata.features = features;
        if (lastServerSync) preservedMetadata.lastServerSync = lastServerSync;
        if (stateSource) preservedMetadata.stateSource = stateSource;
        if (baseServerState)
          preservedMetadata.baseServerState = baseServerState;
      }
      newShadowStoreNEW.delete(key);
      newShadowStoreNEW.delete(`[${key}`);

      const newRoot = buildShadowNode(initialState);
      Object.assign(newRoot, preservedMetadata);

      const storageKey = Array.isArray(initialState) ? `[${key}` : key;
      newShadowStoreNEW.set(storageKey, newRoot);
      console.log('sssssssssssssssssssssssssssss', newShadowStoreNEW);
      return { shadowStateStore: newShadowStoreNEW };
    });
  },
  getShadowMetadata: (key: string, path: string[]) => {
    const store = get().shadowStateStore;
    let current: any = store.get(key) || store.get(`[${key}`);

    if (!current) return undefined;
    if (path.length === 0) return current;

    // Correctly traverses the nested object property by property.
    for (const segment of path) {
      if (typeof current !== 'object' || current === null) return undefined;
      current = current[segment];
      if (current === undefined) return undefined;
    }
    return current;
  },
  setShadowMetadata: (key: string, path: string[], metadata: any) => {
    set((state) => {
      const newStore = new Map(state.shadowStateStore);
      const rootKey = newStore.has(`[${key}`) ? `[${key}` : key;
      let root = newStore.get(rootKey);

      if (!root) {
        root = {};
        newStore.set(rootKey, root);
      }

      const clonedRoot: any = { ...root };
      newStore.set(rootKey, clonedRoot);

      if (path.length === 0) {
        Object.assign(clonedRoot, metadata);
      } else {
        let current = clonedRoot;
        const parentPath = path.slice(0, -1);

        for (const segment of parentPath) {
          const nextNode = current[segment] || {};
          current[segment] = { ...nextNode }; // Clone for immutability
          current = current[segment];
        }

        const lastSegment = path[path.length - 1]!;
        const existingNode = current[lastSegment] || {};
        current[lastSegment] = { ...existingNode, ...metadata }; // Merge metadata
      }

      return { shadowStateStore: newStore };
    });
  },

  getShadowValue: (
    key: string,
    path: string[],
    validArrayIds?: string[],
    log?: boolean
  ) => {
    const node = get().getShadowMetadata(key, path);

    if (node === null || node === undefined) return undefined;
    if (log) {
      console.log('getShadowValue', key, path, node);
    }
    const nodeKeys = Object.keys(node);

    const isPrimitiveWrapper =
      Object.prototype.hasOwnProperty.call(node, 'value') &&
      nodeKeys.every((k) => k === 'value' || METADATA_KEYS.has(k));
    if (log) {
      console.log('isPrimitiveWrapper', isPrimitiveWrapper);
    }
    if (isPrimitiveWrapper) return node.value;

    // A node is an array if it has the `arrayKeys` metadata property.
    const isArrayNode = Object.prototype.hasOwnProperty.call(node, 'arrayKeys');
    if (log) {
      console.log('isArrayNode', isArrayNode);
    }
    if (isArrayNode) {
      // Use the ordered list from `validArrayIds` (for filtered views) or the node's own `arrayKeys`.
      const keysToIterate =
        validArrayIds !== undefined && validArrayIds.length > 0
          ? validArrayIds
          : (node as any).arrayKeys;

      if (log) {
        console.log('keysToIterate', keysToIterate);
      }
      return keysToIterate.map((itemKey: string) =>
        get().getShadowValue(key, [...path, itemKey])
      );
    }

    const result: any = {};
    for (const propKey of nodeKeys) {
      if (!METADATA_KEYS.has(propKey) && !propKey.startsWith('id:')) {
        result[propKey] = get().getShadowValue(key, [...path, propKey]);
      }
    }
    return result;
  },

  updateShadowAtPath: (key: string, path: string[], newValue: any) => {
    set((state) => {
      const newStore = new Map(state.shadowStateStore);
      const rootKey = newStore.has(`[${key}`) ? `[${key}` : key;
      let root = newStore.get(rootKey);

      if (!root) return state;

      const clonedRoot: any = { ...root };
      newStore.set(rootKey, clonedRoot);

      if (path.length === 0) {
        const newRootStructure = buildShadowNode(newValue);
        for (const metaKey in clonedRoot) {
          if (METADATA_KEYS.has(metaKey)) {
            newRootStructure[metaKey] = clonedRoot[metaKey];
          }
        }
        newStore.set(rootKey, newRootStructure);
      } else {
        let current = clonedRoot;
        const parentPath = path.slice(0, -1);
        for (const segment of parentPath) {
          current[segment] = { ...current[segment] };
          current = current[segment];
        }

        const lastSegment = path[path.length - 1]!;
        const existingNode = current[lastSegment] || {};
        const newNodeStructure = buildShadowNode(newValue);
        // This merge is critical: it preserves metadata (like pathComponents) during an update.
        current[lastSegment] = { ...existingNode, ...newNodeStructure };
      }

      get().notifyPathSubscribers([key, ...path].join('.'), {
        type: 'UPDATE',
        newValue,
      });
      return { shadowStateStore: newStore };
    });
  },

  insertShadowArrayElement: (
    key: string,
    arrayPath: string[],
    newItem: any,
    index?: number
  ) => {
    set((state) => {
      // Get the array node. We need a mutable reference for this transaction.
      const arrayNode = get().getShadowMetadata(key, arrayPath);
      if (!arrayNode) {
        console.error(
          `Array not found at path: ${[key, ...arrayPath].join('.')}`
        );
        return state;
      }
      const newItemId = `id:${ulid()}`;
      // Add the new item's data to the node
      arrayNode[newItemId as keyof typeof arrayNode] = buildShadowNode(newItem);

      // Update the `arrayKeys` metadata to include the new item ID in the correct position
      const currentKeys = (arrayNode.arrayKeys as string[]) || [];
      const newKeys = [...currentKeys];
      if (index !== undefined && index >= 0 && index <= newKeys.length) {
        newKeys.splice(index, 0, newItemId);
      } else {
        newKeys.push(newItemId);
      }
      arrayNode.arrayKeys = newKeys;
      get().setShadowMetadata(key, arrayPath, arrayNode);
      const arrayKey = [key, ...arrayPath].join('.');
      get().notifyPathSubscribers(arrayKey, {
        type: 'INSERT',
        path: arrayKey,
        itemKey: `${arrayKey}.${newItemId}`,
        index: index ?? newKeys.length - 1,
      });

      // `setShadowMetadata` handles the state update, so we return an empty object.
      return {};
    });
  },

  // ✅ CHANGE 5: `removeShadowArrayElement` now updates the `arrayKeys` metadata.
  removeShadowArrayElement: (key: string, itemPath: string[]) => {
    set((state) => {
      if (itemPath.length === 0) {
        console.error('Cannot remove root');
        return state;
      }

      const arrayPath = itemPath.slice(0, -1);
      const itemId = itemPath[itemPath.length - 1];

      if (!itemId?.startsWith('id:')) {
        console.error('Invalid item ID for removal:', itemId);
        return state;
      }

      const arrayNode = get().getShadowMetadata(key, arrayPath);

      if (!arrayNode) {
        console.error(
          `Array not found at path: ${[key, ...arrayPath].join('.')}`
        );
        return state;
      }

      // Delete the item's data from the node
      delete arrayNode[itemId as keyof typeof arrayNode];

      // Also remove the item's ID from the `arrayKeys` metadata
      if (Array.isArray(arrayNode.arrayKeys)) {
        arrayNode.arrayKeys = arrayNode.arrayKeys.filter((k) => k !== itemId);
      }

      // Persist the modified array node back to the store
      get().setShadowMetadata(key, arrayPath, arrayNode);

      const arrayKey = [key, ...arrayPath].join('.');
      get().notifyPathSubscribers(arrayKey, {
        type: 'REMOVE',
        path: arrayKey,
        itemKey: `${arrayKey}.${itemId}`,
      });

      // `setShadowMetadata` handles the state update
      return {};
    });
  },
  addPathComponent: (stateKey, dependencyPath, fullComponentId) => {
    const node = get().getShadowMetadata(stateKey, dependencyPath) || {};

    const newPathComponents = new Set(node.pathComponents);
    newPathComponents.add(fullComponentId);
    get().setShadowMetadata(stateKey, dependencyPath, {
      pathComponents: newPathComponents,
    });

    // --- Part 2: Update the component's own list of paths it subscribes to ---
    const rootNode = get().getShadowMetadata(stateKey, []);
    if (rootNode?.components) {
      const component = rootNode.components.get(fullComponentId);
      if (component) {
        const fullPathKey = [stateKey, ...dependencyPath].join('.');
        const newPaths = new Set(component.paths);
        newPaths.add(fullPathKey);
        const newComponentRegistration = { ...component, paths: newPaths };
        const newComponentsMap = new Map(rootNode.components);
        newComponentsMap.set(fullComponentId, newComponentRegistration);
        get().setShadowMetadata(stateKey, [], {
          components: newComponentsMap,
        });
      }
    }
  },
  registerComponent: (stateKey, fullComponentId, registration) => {
    // Get metadata from the NEW store.
    const rootMeta = get().getShadowMetadata(stateKey, []);
    const components = new Map(rootMeta?.components);

    components.set(fullComponentId, registration);

    // Set the updated components map back onto the root node of the NEW store.
    get().setShadowMetadata(stateKey, [], { components });
  },
  // Replace the old unregisterComponent with this corrected version
  unregisterComponent: (stateKey, fullComponentId) => {
    // Get metadata from the NEW store.
    const rootMeta = get().getShadowMetadata(stateKey, []);

    if (!rootMeta?.components) {
      return; // Nothing to do
    }

    const components = new Map(rootMeta.components);
    const wasDeleted = components.delete(fullComponentId);

    // Only update state if something was actually deleted
    if (wasDeleted) {
      // Set the updated components map back onto the root node of the NEW store.
      get().setShadowMetadata(stateKey, [], { components });
    }
  },

  markAsDirty: (key: string, path: string[], options = { bubble: true }) => {
    set((state) => {
      // 1. Setup: Get the new store, find the root, and clone it to begin the update.
      const newShadowStoreNEW = new Map(state.shadowStateStore);
      const rootKey = newShadowStoreNEW.has(`[${key}`) ? `[${key}` : key;
      const root = newShadowStoreNEW.get(rootKey);

      // Abort if the root state object doesn't exist.
      if (!root) {
        console.error(`State with key "${key}" not found for markAsDirty.`);
        return state;
      }

      const clonedRoot: any = { ...root };
      newShadowStoreNEW.set(rootKey, clonedRoot);

      // 2. This helper function translates your original `setDirty` logic.
      //    It operates on the single `clonedRoot` object.
      //    It returns 'true' if the node was already dirty, to stop the bubble.
      const setDirtyOnNode = (pathToMark: string[]): boolean => {
        // A. First, just navigate to the node to check its status without modifying anything.
        let nodeToCheck = clonedRoot;
        for (const segment of pathToMark) {
          if (!nodeToCheck[segment]) {
            // Path doesn't exist, so we can't mark it. Stop the process.
            return true;
          }
          nodeToCheck = nodeToCheck[segment];
        }

        // B. If it's already dirty, we don't need to do anything else. Signal to stop bubbling.
        if (nodeToCheck.isDirty === true) {
          return true;
        }

        // C. If it's NOT dirty, we now traverse again, this time cloning each
        //    node on the path to ensure an immutable update.
        let mutator = clonedRoot;
        for (const segment of pathToMark) {
          mutator[segment] = { ...mutator[segment] }; // This is the crucial clone.
          mutator = mutator[segment];
        }

        // D. Set the flag on the final, cloned node.
        mutator.isDirty = true;
        return false; // Signal that the state was changed.
      };

      // 3. Execute the logic, identical to your original function's structure.

      // Mark the target path first.
      setDirtyOnNode(path);

      // Bubble up the change if requested.
      if (options.bubble) {
        let parentPath = [...path];
        while (parentPath.length > 0) {
          parentPath.pop();
          const wasParentAlreadyDirty = setDirtyOnNode(parentPath);
          // If the parent was already dirty, all of its ancestors are also dirty,
          // so we can stop bubbling.
          if (wasParentAlreadyDirty) {
            break;
          }
        }
      }

      // 4. Return the new state object containing the fully modified root.
      return { shadowStateStore: newShadowStoreNEW };
    });
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
  addStateLog: (updates) => {
    if (!updates || updates.length === 0) {
      return;
    }
    set((state) => {
      const newLog = new Map(state.stateLog);

      // Group all updates by their stateKey
      const logsGroupedByKey = new Map<string, UpdateTypeDetail[]>();
      for (const update of updates) {
        if (!logsGroupedByKey.has(update.stateKey)) {
          logsGroupedByKey.set(update.stateKey, []);
        }
        logsGroupedByKey.get(update.stateKey)!.push(update);
      }

      // Process each group efficiently
      for (const [key, batchOfUpdates] of logsGroupedByKey.entries()) {
        // Copy the map for this key only ONCE
        const newStateLogForKey = new Map(newLog.get(key));

        // Apply all updates for this key in a fast loop
        for (const update of batchOfUpdates) {
          const uniquePathKey = JSON.stringify(update.path);
          newStateLogForKey.set(uniquePathKey, { ...update });
        }

        newLog.set(key, newStateLogForKey);
      }

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
