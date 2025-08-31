import { OptionsType, ReactivityType, SyncInfo, UpdateTypeDetail } from './CogsState.js';

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
    getFormRefsByStateKey: (stateKey: string) => Map<string, React.RefObject<any>>;
};
export declare const formRefStore: import('zustand').UseBoundStore<import('zustand').StoreApi<FormRefStoreState>>;
export type ComponentsType = {
    components?: Map<string, {
        forceUpdate: () => void;
        paths: Set<string>;
        deps?: any[];
        prevDeps?: any[];
        depsFunction?: (state: any) => any[] | true;
        reactiveType: ReactivityType[] | ReactivityType;
    }>;
};
export type ValidationStatus = 'NOT_VALIDATED' | 'VALIDATING' | 'VALID' | 'INVALID';
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
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'unknown';
    schema: any;
    source: 'sync' | 'zod4' | 'zod3' | 'runtime' | 'default';
    default: any;
    nullable?: boolean;
    optional?: boolean;
};
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
    syncInfo?: {
        status: string;
    };
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
    transformCaches?: Map<string, {
        validIds: string[];
        computedAt: number;
        transforms: Array<{
            type: 'filter' | 'sort';
            fn: Function;
        }>;
    }>;
    pathComponents?: Set<string>;
    streams?: Map<string, {
        buffer: any[];
        flushTimer: NodeJS.Timeout | null;
    }>;
} & ComponentsType;
type ShadowNode = {
    _meta?: ShadowMetadata;
    [key: string]: any;
};
export type CogsGlobalState = {
    setTransformCache: (key: string, path: string[], cacheKey: string, cacheData: any) => void;
    initializeShadowState: (key: string, initialState: any) => void;
    getShadowNode: (key: string, path: string[]) => ShadowNode | undefined;
    getShadowMetadata: (key: string, path: string[]) => ShadowMetadata | undefined;
    setShadowMetadata: (key: string, path: string[], metadata: any) => void;
    getShadowValue: (key: string, path: string[], validArrayIds?: string[], log?: boolean) => any;
    updateShadowAtPath: (key: string, path: string[], newValue: any) => void;
    insertManyShadowArrayElements: (key: string, arrayPath: string[], newItems: any[], index?: number) => void;
    addItemsToArrayNode: (key: string, arrayPath: string[], newItems: any, newKeys: string[]) => void;
    insertShadowArrayElement: (key: string, arrayPath: string[], newItem: any, index?: number) => string;
    removeShadowArrayElement: (key: string, itemPath: string[]) => void;
    registerComponent: (stateKey: string, componentId: string, registration: any) => void;
    unregisterComponent: (stateKey: string, componentId: string) => void;
    addPathComponent: (stateKey: string, dependencyPath: string[], fullComponentId: string) => void;
    markAsDirty: (key: string, path: string[], options: {
        bubble: boolean;
    }) => void;
    pathSubscribers: Map<string, Set<(newValue: any) => void>>;
    subscribeToPath: (path: string, callback: (newValue: any) => void) => () => void;
    notifyPathSubscribers: (updatedPath: string, newValue: any) => void;
    selectedIndicesMap: Map<string, string>;
    getSelectedIndex: (stateKey: string, validArrayIds?: string[]) => number;
    setSelectedIndex: (key: string, itemKey: string) => void;
    clearSelectedIndex: ({ arrayKey }: {
        arrayKey: string;
    }) => void;
    clearSelectedIndexesForState: (stateKey: string) => void;
    initialStateOptions: {
        [key: string]: OptionsType;
    };
    initialStateGlobal: {
        [key: string]: StateValue;
    };
    updateInitialStateGlobal: (key: string, newState: StateValue) => void;
    getInitialOptions: (key: string) => OptionsType | undefined;
    setInitialStateOptions: (key: string, value: OptionsType) => void;
    serverStateUpdates: Map<string, {
        data: any;
        status: 'loading' | 'success' | 'error';
        timestamp: number;
    }>;
    setServerStateUpdate: (key: string, serverState: any) => void;
    stateLog: Map<string, Map<string, UpdateTypeDetail>>;
    syncInfoStore: Map<string, SyncInfo>;
    addStateLog: (updates: UpdateTypeDetail[]) => void;
    setSyncInfo: (key: string, syncInfo: SyncInfo) => void;
    getSyncInfo: (key: string) => SyncInfo | null;
};
type BuildContext = {
    stateKey: string;
    path: string[];
    schemas: {
        sync?: any;
        zodV4?: any;
        zodV3?: any;
    };
};
export declare function buildShadowNode(stateKey: string, value: any, context?: BuildContext): ShadowNode;
export declare function generateId(stateKey: string): string;
export declare const getGlobalStore: import('zustand').UseBoundStore<import('zustand').StoreApi<CogsGlobalState>>;
export {};
//# sourceMappingURL=store.d.ts.map