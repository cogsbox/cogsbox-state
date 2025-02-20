import { OptionsType, StateKeys, SyncActionsType, SyncInfo, UpdateTypeDetail } from './CogsState.js';

type StateUpdater<StateValue> = StateValue | ((prevValue: StateValue) => StateValue);
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
export type CogsGlobalState = {
    updaterState: {
        [key: string]: any;
    };
    initialStateOptions: {
        [key: string]: OptionsType;
    };
    cogsStateStore: {
        [key: string]: StateValue;
    };
    isLoadingGlobal: {
        [key: string]: boolean;
    };
    initialStateGlobal: {
        [key: string]: StateValue;
    };
    validationErrors: Map<string, string[]>;
    serverState: {
        [key: string]: StateValue;
    };
    serverSyncActions: {
        [key: string]: SyncActionsType<any>;
    };
    serverSyncLog: {
        [key: string]: SyncLogType[];
    };
    serverSideOrNot: {
        [key: string]: boolean;
    };
    setServerSyncLog: (key: string, newValue: SyncLogType) => void;
    setServerSideOrNot: (key: string, value: boolean) => void;
    getServerSideOrNot: (key: string) => boolean | undefined;
    setServerState: <StateKey extends StateKeys>(key: StateKey, value: StateValue) => void;
    getThisLocalUpdate: (key: string) => UpdateTypeDetail[] | undefined;
    setServerSyncActions: (key: string, value: SyncActionsType<any>) => void;
    addValidationError: (path: string, message: string) => void;
    getValidationErrors: (path: string) => string[];
    updateInitialStateGlobal: (key: string, newState: StateValue) => void;
    getInitialOptions: (key: string) => OptionsType | undefined;
    getUpdaterState: (key: string) => StateUpdater<StateValue>;
    setUpdaterState: (key: string, newUpdater: any) => void;
    getKeyState: <StateKey extends StateKeys>(key: StateKey) => StateValue;
    getNestedState: <StateKey extends StateKeys>(key: StateKey, path: string[]) => StateValue;
    setState: <StateKey extends StateKeys>(key: StateKey, value: StateUpdater<StateValue>) => void;
    setInitialStates: (initialState: StateValue) => void;
    stateLog: {
        [key: string]: UpdateTypeDetail[];
    };
    setStateLog: (key: string, updater: (prevUpdates: UpdateTypeDetail[]) => UpdateTypeDetail[]) => void;
    setIsLoadingGlobal: (key: string, value: boolean) => void;
    setInitialStateOptions: (key: string, value: OptionsType) => void;
    removeValidationError: (path: string) => void;
    signalDomElements: Map<string, Set<{
        instanceId: string;
        parentId: string;
        position: number;
    }>>;
    addSignalElement: (signalId: string, elementInfo: {
        instanceId: string;
        parentId: string;
        position: number;
    }) => void;
    removeSignalElement: (signalId: string, instanceId: string) => void;
    reRenderTriggerPrevValue: Record<string, any>;
    reactiveDeps: Record<string, {
        deps: any[];
        updaters: Set<() => void>;
        depsFunction: ((state: any) => any[] | true) | null;
    }>;
    setReactiveDeps: (key: string, record: {
        deps: any[];
        updaters: Set<() => void>;
        depsFunction: ((state: any) => any[] | true) | null;
    }) => void;
    deleteReactiveDeps: (key: string) => void;
    subscribe: (listener: () => void) => () => void;
    stateComponents: Map<string, {
        components: Map<string, {
            forceUpdate: () => void;
            paths: Set<string>;
            deps?: any[];
            depsFunction?: (state: any) => any[] | true;
        }>;
    }>;
    syncInfoStore: Map<string, SyncInfo>;
    setSyncInfo: (key: string, syncInfo: SyncInfo) => void;
    getSyncInfo: (key: string) => SyncInfo | null;
};
export declare const getGlobalStore: import('zustand').UseBoundStore<import('zustand').StoreApi<CogsGlobalState>>;
export {};
