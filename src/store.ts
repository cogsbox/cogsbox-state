import { create } from "zustand";
import { ulid } from "ulid";
import type {
  OptionsType,
  ReactivityType,
  StateKeys,
  SyncActionsType,
  SyncInfo,
  UpdateTypeDetail,
} from "./CogsState.js";

import type { ReactNode } from "react";

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
    const stateKeyPrefix = stateKey + ".";
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
      depsFunction?: (state: any) => any[] | true;
      reactiveType: ReactivityType[] | ReactivityType;
    }
  >;
};
export type ShadowMetadata = {
  id?: string;
  arrayKeys?: string[];
  objectKeys?: string[];
  fields?: Record<string, any>;
  virtualizer?: {
    itemHeight?: number;
    domRef?: HTMLElement | null;
  };
  syncInfo?: { status: string };
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
      transforms: Array<{ type: "filter" | "sort"; fn: Function }>;
    }
  >;
  pathComponents?: Set<string>;
} & ComponentsType;

export type CogsGlobalState = {
  // --- Shadow State and Subscription System ---
  shadowStateStore: Map<string, ShadowMetadata>;

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
  setShadowValue: (key: string, value: any, validArrayIds?: string[]) => any;
  getShadowMetadata: (
    key: string,
    path: string[]
  ) => ShadowMetadata | undefined;
  setShadowMetadata: (
    key: string,
    path: string[],
    metadata: Omit<ShadowMetadata, "id">
  ) => void;
  setTransformCache: (
    key: string,
    path: string[],
    cacheKey: string,
    cacheData: any
  ) => void;

  pathSubscribers: Map<string, Set<() => void>>;
  subscribeToPath: (path: string, callback: () => void) => () => void; // Returns an unsubscribe function
  notifyPathSubscribers: (updatedPath: string) => void;

  selectedIndicesMap: Map<string, string>; // stateKey -> (parentPath -> selectedIndex)
  getSelectedIndex: (stateKey: string, validArrayIds?: string[]) => number;
  setSelectedIndex: (key: string, itemKey: string) => void;
  clearSelectedIndex: ({
    stateKey,
    path,
  }: {
    stateKey: string;
    path: string[];
  }) => void;
  clearSelectedIndexesForState: (stateKey: string) => void;

  // --- Core State and Updaters ---
  updaterState: { [key: string]: any };
  initialStateOptions: { [key: string]: OptionsType };
  cogsStateStore: { [key: string]: StateValue };
  isLoadingGlobal: { [key: string]: boolean };
  initialStateGlobal: { [key: string]: StateValue };
  iniitialCreatedState: { [key: string]: StateValue };
  serverState: { [key: string]: StateValue };

  getUpdaterState: (key: string) => StateUpdater<StateValue>;
  setUpdaterState: (key: string, newUpdater: any) => void;
  getKeyState: <StateKey extends StateKeys>(key: StateKey) => StateValue;
  getNestedState: <StateKey extends StateKeys>(
    key: StateKey,
    path: string[]
  ) => StateValue;
  setState: <StateKey extends StateKeys>(
    key: StateKey,
    value: StateUpdater<StateValue>
  ) => void;
  setInitialStates: (initialState: StateValue) => void;
  setCreatedState: (initialState: StateValue) => void;
  updateInitialStateGlobal: (key: string, newState: StateValue) => void;
  updateInitialCreatedState: (key: string, newState: StateValue) => void;
  setIsLoadingGlobal: (key: string, value: boolean) => void;
  setServerState: <StateKey extends StateKeys>(
    key: StateKey,
    value: StateValue
  ) => void;
  getInitialOptions: (key: string) => OptionsType | undefined;
  setInitialStateOptions: (key: string, value: OptionsType) => void;

  // --- Validation ---
  validationErrors: Map<string, string[]>;
  addValidationError: (path: string, message: string) => void;
  getValidationErrors: (path: string) => string[];
  removeValidationError: (path: string) => void;

  // --- Server Sync and Logging ---
  serverSyncActions: { [key: string]: SyncActionsType<any> };
  serverSyncLog: { [key: string]: SyncLogType[] };
  stateLog: { [key: string]: UpdateTypeDetail[] };
  syncInfoStore: Map<string, SyncInfo>;
  serverSideOrNot: { [key: string]: boolean };
  setServerSyncLog: (key: string, newValue: SyncLogType) => void;
  setServerSideOrNot: (key: string, value: boolean) => void;
  getServerSideOrNot: (key: string) => boolean | undefined;
  getThisLocalUpdate: (key: string) => UpdateTypeDetail[] | undefined;
  setServerSyncActions: (key: string, value: SyncActionsType<any>) => void;
  setStateLog: (
    key: string,
    updater: (prevUpdates: UpdateTypeDetail[]) => UpdateTypeDetail[]
  ) => void;
  setSyncInfo: (key: string, syncInfo: SyncInfo) => void;
  getSyncInfo: (key: string) => SyncInfo | null;

  // --- Component and DOM Integration ---
  signalDomElements: Map<
    string,
    Set<{
      instanceId: string;
      parentId: string;
      position: number;
      effect?: string;
      map?: string;
    }>
  >;
  addSignalElement: (
    signalId: string,
    elementInfo: {
      instanceId: string;
      parentId: string;
      position: number;
      effect?: string;
      map?: string;
    }
  ) => void;
  removeSignalElement: (signalId: string, instanceId: string) => void;
  stateComponents: Map<string, ComponentsType>;

  // --- Deprecated/Legacy (Review for removal) ---
  reRenderTriggerPrevValue: Record<string, any>;
  reactiveDeps: Record<
    string,
    {
      deps: any[];
      updaters: Set<() => void>;
      depsFunction: ((state: any) => any[] | true) | null;
    }
  >;
  setReactiveDeps: (
    key: string,
    record: {
      deps: any[];
      updaters: Set<() => void>;
      depsFunction: ((state: any) => any[] | true) | null;
    }
  ) => void;
  deleteReactiveDeps: (key: string) => void;
  subscribe: (listener: () => void) => () => void;
};

export const getGlobalStore = create<CogsGlobalState>((set, get) => ({
  shadowStateStore: new Map(),
  pathSubscribers: new Map(),

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

  notifyPathSubscribers: (updatedPath) => {
    const subscribers = get().pathSubscribers;

    // Perform a direct, exact lookup. No loop.
    const subs = subscribers.get(updatedPath);

    // If we found subscribers for the exact path, notify them.
    if (subs) {
      subs.forEach((callback) => callback());
    }
  },
  initializeShadowState: (key: string, initialState: any) => {
    // Get the existing shadow store
    const existingShadowStore = new Map(get().shadowStateStore);
    console.log("existingShadowStore", existingShadowStore);
    const processValue = (value: any, path: string[]) => {
      const nodeKey = [key, ...path].join(".");

      if (Array.isArray(value)) {
        const childIds: string[] = [];

        // First, collect all IDs
        value.forEach((item) => {
          const itemId = `id:${ulid()}`;
          childIds.push(nodeKey + "." + itemId);
        });

        // Set the array metadata FIRST
        existingShadowStore.set(nodeKey, { arrayKeys: childIds });

        // THEN process each item
        value.forEach((item, index) => {
          const itemId = childIds[index]!.split(".").pop(); // Extract just the id:xxx part
          processValue(item, [...path!, itemId!]);
        });
      } else if (typeof value === "object" && value !== null) {
        const fields = Object.fromEntries(
          Object.keys(value).map((k) => [k, nodeKey + "." + k])
        );
        existingShadowStore.set(nodeKey, { fields });

        Object.keys(value).forEach((k) => {
          processValue(value[k], [...path, k]);
        });
      } else {
        // Primitive value - store with value property
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
  setShadowValue: (key: string, value: any, validArrayIds?: string[]) => {
    const shadowMeta = get().shadowStateStore.get(key);

    // For primitive values, set directly
    if (shadowMeta?.value !== undefined || !shadowMeta) {
      get().shadowStateStore.set(key, { value });

      return;
    }

    // For arrays
    if (shadowMeta.arrayKeys) {
      const arrayKeys = validArrayIds ?? shadowMeta.arrayKeys;

      // Update array metadata
      get().shadowStateStore.set(key, {
        ...shadowMeta,
        arrayKeys: arrayKeys,
      });

      // Update each array item
      value.forEach((item: any, index: number) => {
        const itemKey = arrayKeys[index]!;
        if (typeof item === "object") {
          // For object items, update their fields
          const itemMeta = get().shadowStateStore.get(itemKey);
          if (itemMeta?.fields) {
            Object.entries(item).forEach(([fieldKey, fieldValue]) => {
              const fieldPath = itemMeta.fields![fieldKey];
              if (fieldPath) {
                get().shadowStateStore.set(fieldPath as string, {
                  value: fieldValue,
                });
              }
            });
          }
        } else {
          // For primitive items
          get().shadowStateStore.set(itemKey, { value: item });
        }
      });
      return;
    }

    // For objects with fields
    if (shadowMeta.fields) {
      Object.entries(value).forEach(([fieldKey, fieldValue]) => {
        const fieldPath = shadowMeta.fields![fieldKey];
        if (fieldPath) {
          get().shadowStateStore.set(fieldPath as string, {
            value: fieldValue,
          });
        }
      });
      return;
    }
    get().notifyPathSubscribers(key);
  },
  getShadowMetadata: (
    key: string,
    path: string[],
    validArrayIds?: string[]
  ) => {
    const fullKey = [key, ...path].join(".");
    let data = get().shadowStateStore.get(fullKey);

    return get().shadowStateStore.get(fullKey);
  },

  setShadowMetadata: (key: string, path: string[], metadata: any) => {
    const fullKey = [key, ...path].join(".");
    const newShadowStore = new Map(get().shadowStateStore);
    const existing = newShadowStore.get(fullKey) || { id: ulid() };
    newShadowStore.set(fullKey, { ...existing, ...metadata });
    set({ shadowStateStore: newShadowStore });

    if (metadata.virtualizer?.itemHeight) {
      get().notifyPathSubscribers(fullKey);
    }
  },
  setTransformCache: (
    key: string,
    path: string[],
    cacheKey: string,
    cacheData: any
  ) => {
    const fullKey = [key, ...path].join(".");
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
    const arrayKey = [key, ...arrayPath].join(".");
    const parentMeta = newShadowStore.get(arrayKey);

    if (!parentMeta || !parentMeta.arrayKeys) return;

    // Generate the ID if it doesn't have one

    const newItemId = `id:${ulid()}`;
    const fullItemKey = arrayKey + "." + newItemId;

    // Just add to the end (or at a specific index if provided)
    const newArrayKeys = [...parentMeta.arrayKeys];
    newArrayKeys.push(fullItemKey); // Or use splice if you have an index
    newShadowStore.set(arrayKey, { ...parentMeta, arrayKeys: newArrayKeys });

    // Process the new item - but use the correct logic
    const processNewItem = (value: any, path: string[]) => {
      const nodeKey = [key, ...path].join(".");

      if (Array.isArray(value)) {
        // Handle arrays...
      } else if (typeof value === "object" && value !== null) {
        // Create fields mapping
        const fields = Object.fromEntries(
          Object.keys(value).map((k) => [k, nodeKey + "." + k])
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
    get().notifyPathSubscribers(arrayKey);
  },
  removeShadowArrayElement: (key: string, itemPath: string[]) => {
    const newShadowStore = new Map(get().shadowStateStore);

    // Get the full item key (e.g., "stateKey.products.id:xxx")
    const itemKey = [key, ...itemPath].join(".");

    // Extract parent path and item ID
    const parentPath = itemPath.slice(0, -1);
    const parentKey = [key, ...parentPath].join(".");
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
        const prefixToDelete = itemKey + ".";
        for (const k of Array.from(newShadowStore.keys())) {
          if (k === itemKey || k.startsWith(prefixToDelete)) {
            newShadowStore.delete(k);
          }
        }
      }
    }

    set({ shadowStateStore: newShadowStore });

    get().notifyPathSubscribers(parentKey);
  },
  updateShadowAtPath: (key, path, newValue) => {
    const newShadowStore = new Map(get().shadowStateStore);
    const fullKey = [key, ...path].join(".");

    // This is the recursive function that does the real work.
    const updateValue = (currentKey: string, valueToSet: any) => {
      const meta = newShadowStore.get(currentKey);

      // Case 1: The value to set is an object (but not an array).
      // We must traverse its keys and update children, not replace the object itself.
      if (
        typeof valueToSet === "object" &&
        valueToSet !== null &&
        !Array.isArray(valueToSet)
      ) {
        // This is the crucial fix.
        // We must find the metadata for this object to know its children's paths.
        if (meta && meta.fields) {
          // For each key in the new partial object (e.g., 'name', 'price')...
          for (const fieldKey in valueToSet) {
            if (Object.prototype.hasOwnProperty.call(valueToSet, fieldKey)) {
              const childPath = meta.fields[fieldKey];
              const childValue = valueToSet[fieldKey];

              // ...if a child path exists in the metadata, recursively call updateValue on it.
              if (childPath) {
                updateValue(childPath as string, childValue);
              } else {
                // NOTE: This logic ignores keys in the update object that don't exist in the state.
                // A more advanced implementation might add new shadow nodes here.
              }
            }
          }
        } else {
          // This is a recovery path. If told to update an object but it has no fields metadata,
          // we fall back to the old (and potentially destructive) behavior, but with a warning.
          console.warn(
            `Attempted to update an object at ${currentKey}, but no 'fields' metadata was found. Replacing the value directly.`
          );
          const existing = newShadowStore.get(currentKey) || {};
          newShadowStore.set(currentKey, { ...existing, value: valueToSet });
        }
      }
      // Case 2: The value is a primitive (or an array, which we treat as a single value).
      // This is the base case for the recursion.
      else {
        const existing = newShadowStore.get(currentKey) || {};
        // Only update the 'value' property, preserving other metadata like 'signals' or 'components'.
        newShadowStore.set(currentKey, { ...existing, value: valueToSet });
      }
    };

    // Start the recursive update process from the top-level key for this update.
    updateValue(fullKey, newValue);

    // Set the new shadow store in state.
    set({ shadowStateStore: newShadowStore });
    get().notifyPathSubscribers(fullKey);
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
        newMap.set(arrayKey, itemKey);
      }

      return {
        ...state,
        selectedIndicesMap: newMap,
      };
    });
  },
  clearSelectedIndex: ({
    stateKey,
    path,
  }: {
    stateKey: string;
    path: string[];
  }): void => {
    set((state) => {
      const newMap = new Map(state.selectedIndicesMap);
      const fullPath = [stateKey, ...path].join(".");
      newMap.delete(fullPath);
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
  stateComponents: new Map(),
  subscribe: (listener: () => void) => {
    // zustand's subscribe returns an unsubscribe function
    return get().subscribe(listener);
  },

  reactiveDeps: {},
  setReactiveDeps: (key, record) =>
    set((state) => ({
      ...state,
      reactiveDeps: {
        ...state.reactiveDeps,
        [key]: record,
      },
    })),
  deleteReactiveDeps: (key) =>
    set((state) => {
      const { [key]: _, ...rest } = state.reactiveDeps;
      return {
        ...state,
        reactiveDeps: rest,
      };
    }),

  reRenderTriggerPrevValue: {},
  signalDomElements: new Map(),
  addSignalElement: (
    signalId: string,
    elementInfo: { instanceId: string; parentId: string; position: number }
  ) => {
    const current = get().signalDomElements;
    if (!current.has(signalId)) {
      current.set(signalId, new Set());
    }
    current.get(signalId)!.add(elementInfo);

    set({ signalDomElements: new Map(current) }); // Create new reference to trigger update
  },
  removeSignalElement: (signalId: string, instanceId: string) => {
    const current = get().signalDomElements;
    const elements = current.get(signalId);
    if (elements) {
      elements.forEach((el) => {
        if (el.instanceId === instanceId) {
          elements.delete(el);
        }
      });
    }
    set({ signalDomElements: new Map(current) });
  },
  initialStateOptions: {},
  updaterState: {},
  stateTimeline: {},
  cogsStateStore: {},
  stateLog: {},
  isLoadingGlobal: {},

  initialStateGlobal: {},
  iniitialCreatedState: {},
  updateInitialCreatedState: (key, newState) => {
    set((prev) => ({
      iniitialCreatedState: {
        ...prev.iniitialCreatedState,
        [key]: newState,
      },
    }));
  },

  validationErrors: new Map(),

  serverState: {},

  serverSyncActions: {},

  serverSyncLog: {},
  serverSideOrNot: {},
  setServerSyncLog: (key, newValue) => {
    set((state) => ({
      serverSyncLog: {
        ...state.serverSyncLog,
        [key]: [...(state.serverSyncLog[key] ?? []), newValue],
      },
    }));
  },
  setServerSideOrNot: (key, value) => {
    set((state) => ({
      serverSideOrNot: {
        ...state.serverSideOrNot,
        [key]: value,
      },
    }));
  },
  getServerSideOrNot: (key) => {
    return get().serverSideOrNot[key];
  },

  getThisLocalUpdate: (key: string) => {
    return get().stateLog[key];
  },
  setServerState: <StateKey extends StateKeys>(
    key: StateKey,
    value: StateValue
  ) => {
    set((prev) => ({
      serverState: {
        ...prev.serverState,
        [key]: value,
      },
    }));
  },

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
  setIsLoadingGlobal: (key: string, value: boolean) => {
    set((prev) => ({
      isLoadingGlobal: {
        ...prev.isLoadingGlobal,
        [key]: value,
      },
    }));
  },
  setServerSyncActions: (key: string, value: SyncActionsType<any>) => {
    set((prev) => ({
      serverSyncActions: {
        ...prev.serverSyncActions,
        [key]: value,
      },
    }));
  },
  addValidationError: (path, message) => {
    console.log("addValidationError---");
    set((prev) => {
      const updatedErrors = new Map(prev.validationErrors);
      const existingMessages = updatedErrors.get(path) || [];
      console.log("addValidationError", path, message, existingMessages);
      // Append the new message instead of replacing
      updatedErrors.set(path, [...existingMessages, message]);
      return { validationErrors: updatedErrors };
    });
  },
  removeValidationError: (path) => {
    set((prev) => {
      const updatedErrors = new Map(prev.validationErrors);

      let doSomething = false;
      const pathArray = path.split(".");
      Array.from(updatedErrors.keys()).forEach((key) => {
        const keyArray = key.split(".");
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
    const pathArray = path.split(".");

    // Helper to check if an index matches either a wildcard or is in an array of indices
    const isIndexMatch = (pathSegment: string, keySegment: string) => {
      if (pathSegment === "[*]") return true;
      if (Array.isArray(pathSegment)) {
        return pathSegment.includes(parseInt(keySegment));
      }
      return pathSegment === keySegment;
    };

    Array.from(valErrors.keys()).forEach((key) => {
      const keyArray = key.split(".");
      if (keyArray.length >= pathArray.length) {
        let match = true;
        for (let i = 0; i < pathArray.length; i++) {
          const pathSegment = pathArray[i];
          const keySegment = keyArray[i]!;

          // If current path segment is a number or [*], we need special handling
          if (pathSegment === "[*]" || Array.isArray(pathSegment)) {
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
  getNestedState: (key: string, path: string[]) => {
    const rootState = get().cogsStateStore[key];

    const resolvePath = (obj: any, pathArray: string[]): any => {
      if (pathArray.length === 0 || obj === undefined) {
        return obj;
      }

      const currentSegment = pathArray[0];
      const remainingPath = pathArray.slice(1);

      // FIX: Handle ID-based array access like 'id:xyz'
      if (
        Array.isArray(obj) &&
        typeof currentSegment === "string" &&
        currentSegment.startsWith("id:")
      ) {
        const targetId = currentSegment.split(":")[1];
        const foundItem = obj.find(
          (item) => item && String(item.id) === targetId
        );
        return resolvePath(foundItem, remainingPath);
      }

      // Handle wildcard array access: '[*]'
      if (currentSegment === "[*]") {
        if (!Array.isArray(obj)) {
          console.warn("Asterisk notation used on non-array value");
          return undefined;
        }
        if (remainingPath.length === 0) return obj;
        const results = obj.map((item) => resolvePath(item, remainingPath));
        return Array.isArray(results[0]) ? results.flat() : results;
      }

      // Handle standard object property access and numeric array indices
      const nextObj = obj[currentSegment as keyof typeof obj];
      return resolvePath(nextObj, remainingPath);
    };

    return resolvePath(rootState, path);
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
  getUpdaterState: (key) => {
    return get().updaterState[key];
  },
  setUpdaterState: (key, newUpdater) => {
    const current = get().updaterState;

    if (!key || !newUpdater) return;

    set({ updaterState: { ...(current ?? {}), [key]: newUpdater } });
  },
  getKeyState: <StateKey extends StateKeys>(key: StateKey) => {
    return get().cogsStateStore[key];
  },

  setState: <StateKey extends StateKeys>(key: StateKey, value: StateValue) => {
    set((prev) => {
      return {
        cogsStateStore: {
          ...prev.cogsStateStore,
          [key]:
            typeof value === "function"
              ? value(prev.cogsStateStore[key])
              : value,
        },
      };
    });
  },
  setInitialStates: <StateKey extends StateKeys>(initialState: StateValue) => {
    set((prev) => ({
      cogsStateStore: {
        ...prev.cogsStateStore,
        ...initialState,
      },
    }));
  },
  setCreatedState: (initialState: StateValue) => {
    set((prev) => ({
      iniitialCreatedState: {
        ...prev.cogsStateStore,
        ...initialState,
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
