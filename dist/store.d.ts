import { OptionsType, ReactivityType, StateKeys, SyncActionsType, SyncInfo, UpdateTypeDetail } from './CogsState.js';

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
export type TrieNode = {
    subscribers: Set<string>;
    children: Map<string, TrieNode>;
};
export type ComponentsType = {
    components: Map<string, {
        forceUpdate: () => void;
        paths: Set<string>;
        deps?: any[];
        depsFunction?: (state: any) => any[] | true;
        reactiveType: ReactivityType[] | ReactivityType;
    }>;
};
export type FormRefStoreState = {
    formRefs: Map<string, React.RefObject<any>>;
    registerFormRef: (id: string, ref: React.RefObject<any>) => void;
    getFormRef: (id: string) => React.RefObject<any> | undefined;
    removeFormRef: (id: string) => void;
    getFormRefsByStateKey: (stateKey: string) => Map<string, React.RefObject<any>>;
};
export declare const formRefStore: import('zustand').UseBoundStore<import('zustand').StoreApi<FormRefStoreState>>;
export type ShadowMetadata = {
    id: string;
    arrayKeys?: string[];
    virtualizer?: {
        itemHeight?: number;
        domRef?: HTMLElement | null;
    };
    syncInfo?: {
        status: string;
    };
    lastUpdated?: number;
};
export type CogsGlobalState = {
    shadowStateStore: Map<string, ShadowMetadata>;
    initializeShadowState: (key: string, initialState: any) => void;
    updateShadowAtPath: (key: string, path: string[], newValue: any) => void;
    insertShadowArrayElement: (key: string, arrayPath: string[], newItem: any) => void;
    removeShadowArrayElement: (key: string, arrayPath: string[]) => void;
    getShadowMetadata: (key: string, path: string[]) => ShadowMetadata | undefined;
    setShadowMetadata: (key: string, path: string[], metadata: Omit<ShadowMetadata, "id">) => void;
    shadowStateSubscribers: Map<string, Set<() => void>>;
    subscribeToShadowState: (key: string, callback: () => void) => () => void;
    selectedIndicesMap: Map<string, Map<string, number>>;
    getSelectedIndex: (stateKey: string, parentPath: string) => number | undefined;
    setSelectedIndex: (stateKey: string, parentPath: string, index: number | undefined) => void;
    clearSelectedIndex: ({ stateKey, path, }: {
        stateKey: string;
        path: string[];
    }) => void;
    clearSelectedIndexesForState: (stateKey: string) => void;
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
    iniitialCreatedState: {
        [key: string]: StateValue;
    };
    serverState: {
        [key: string]: StateValue;
    };
    getUpdaterState: (key: string) => StateUpdater<StateValue>;
    setUpdaterState: (key: string, newUpdater: any) => void;
    getKeyState: <StateKey extends StateKeys>(key: StateKey) => StateValue;
    getNestedState: <StateKey extends StateKeys>(key: StateKey, path: string[]) => StateValue;
    setState: <StateKey extends StateKeys>(key: StateKey, value: StateUpdater<StateValue>) => void;
    setInitialStates: (initialState: StateValue) => void;
    setCreatedState: (initialState: StateValue) => void;
    updateInitialStateGlobal: (key: string, newState: StateValue) => void;
    updateInitialCreatedState: (key: string, newState: StateValue) => void;
    setIsLoadingGlobal: (key: string, value: boolean) => void;
    setServerState: <StateKey extends StateKeys>(key: StateKey, value: StateValue) => void;
    getInitialOptions: (key: string) => OptionsType | undefined;
    setInitialStateOptions: (key: string, value: OptionsType) => void;
    validationErrors: Map<string, string[]>;
    addValidationError: (path: string, message: string) => void;
    getValidationErrors: (path: string) => string[];
    removeValidationError: (path: string) => void;
    serverSyncActions: {
        [key: string]: SyncActionsType<any>;
    };
    serverSyncLog: {
        [key: string]: SyncLogType[];
    };
    stateLog: {
        [key: string]: UpdateTypeDetail[];
    };
    syncInfoStore: Map<string, SyncInfo>;
    serverSideOrNot: {
        [key: string]: boolean;
    };
    setServerSyncLog: (key: string, newValue: SyncLogType) => void;
    setServerSideOrNot: (key: string, value: boolean) => void;
    getServerSideOrNot: (key: string) => boolean | undefined;
    getThisLocalUpdate: (key: string) => UpdateTypeDetail[] | undefined;
    setServerSyncActions: (key: string, value: SyncActionsType<any>) => void;
    setStateLog: (key: string, updater: (prevUpdates: UpdateTypeDetail[]) => UpdateTypeDetail[]) => void;
    setSyncInfo: (key: string, syncInfo: SyncInfo) => void;
    getSyncInfo: (key: string) => SyncInfo | null;
    signalDomElements: Map<string, Set<{
        instanceId: string;
        parentId: string;
        position: number;
        effect?: string;
        map?: string;
    }>>;
    addSignalElement: (signalId: string, elementInfo: {
        instanceId: string;
        parentId: string;
        position: number;
        effect?: string;
        map?: string;
    }) => void;
    removeSignalElement: (signalId: string, instanceId: string) => void;
    stateComponents: Map<string, ComponentsType>;
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
};
export declare const getGlobalStore: import('zustand').UseBoundStore<import('zustand').StoreApi<CogsGlobalState>>;
export {};
