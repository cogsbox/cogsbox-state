import { create } from "zustand";
import type {
  OptionsType,
  ReactivityType,
  StateKeys,
  SyncActionsType,
  SyncInfo,
  UpdateTypeDetail,
} from "./CogsState.js";

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

export type ComponentsType = {
  components: Map<
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
export type CogsGlobalState = {
  selectedIndicesMap: Map<string, Map<string, number>>; // stateKey -> (parentPath -> selectedIndex)

  // Add these new methods
  getSelectedIndex: (
    stateKey: string,
    parentPath: string
  ) => number | undefined;
  setSelectedIndex: (
    stateKey: string,
    parentPath: string,
    index: number | undefined
  ) => void;
  clearSelectedIndexesForState: (stateKey: string) => void;
  updaterState: { [key: string]: any };
  initialStateOptions: { [key: string]: OptionsType };
  cogsStateStore: { [key: string]: StateValue };
  isLoadingGlobal: { [key: string]: boolean };

  initialStateGlobal: { [key: string]: StateValue };
  iniitialCreatedState: { [key: string]: StateValue };
  validationErrors: Map<string, string[]>;

  serverState: { [key: string]: StateValue };
  serverSyncActions: { [key: string]: SyncActionsType<any> };

  serverSyncLog: { [key: string]: SyncLogType[] };
  serverSideOrNot: { [key: string]: boolean };
  setServerSyncLog: (key: string, newValue: SyncLogType) => void;

  setServerSideOrNot: (key: string, value: boolean) => void;
  getServerSideOrNot: (key: string) => boolean | undefined;
  setServerState: <StateKey extends StateKeys>(
    key: StateKey,
    value: StateValue
  ) => void;

  getThisLocalUpdate: (key: string) => UpdateTypeDetail[] | undefined;
  setServerSyncActions: (key: string, value: SyncActionsType<any>) => void;
  addValidationError: (path: string, message: string) => void;
  getValidationErrors: (path: string) => string[];
  updateInitialStateGlobal: (key: string, newState: StateValue) => void;
  updateInitialCreatedState: (key: string, newState: StateValue) => void;
  getInitialOptions: (key: string) => OptionsType | undefined;
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
  stateLog: { [key: string]: UpdateTypeDetail[] };
  setStateLog: (
    key: string,
    updater: (prevUpdates: UpdateTypeDetail[]) => UpdateTypeDetail[]
  ) => void;
  setIsLoadingGlobal: (key: string, value: boolean) => void;

  setInitialStateOptions: (key: string, value: OptionsType) => void;
  removeValidationError: (path: string) => void;
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

  stateComponents: Map<string, ComponentsType>;
  syncInfoStore: Map<string, SyncInfo>;
  setSyncInfo: (key: string, syncInfo: SyncInfo) => void;
  getSyncInfo: (key: string) => SyncInfo | null;
};

export const getGlobalStore = create<CogsGlobalState>((set, get) => ({
  selectedIndicesMap: new Map<string, Map<string, number>>(),

  // Add the new methods
  getSelectedIndex: (stateKey: string, parentPath: string) => {
    const stateMap = get().selectedIndicesMap.get(stateKey);
    if (!stateMap) return undefined;
    return stateMap.get(parentPath);
  },

  setSelectedIndex: (
    stateKey: string,
    parentPath: string,
    index: number | undefined
  ) => {
    set((state) => {
      const newMap = new Map(state.selectedIndicesMap);
      let stateMap = newMap.get(stateKey);

      if (!stateMap) {
        stateMap = new Map<string, number>();
        newMap.set(stateKey, stateMap);
      }

      if (index === undefined) {
        stateMap.delete(parentPath);
      } else {
        stateMap.set(parentPath, index);
      }

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

    const getValueWithAsterisk = (obj: any, pathArray: string[]): any => {
      if (pathArray.length === 0) return obj;

      const currentPath = pathArray[0];
      const remainingPath = pathArray.slice(1);

      if (currentPath === "[*]") {
        if (!Array.isArray(obj)) {
          console.warn("Asterisk notation used on non-array value");
          return undefined;
        }

        if (remainingPath.length === 0) return obj;

        // Get result for each array item
        const results = obj.map((item) =>
          getValueWithAsterisk(item, remainingPath)
        );

        // If the next path segment exists and returns arrays, flatten them
        if (Array.isArray(results[0])) {
          return results.flat();
        }

        return results;
      }

      const value = obj[currentPath as keyof typeof obj];
      if (value === undefined) return undefined;

      return getValueWithAsterisk(value, remainingPath);
    };

    // This will still get the value but we need to make it reactive only to specific paths
    return getValueWithAsterisk(rootState, path);
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
