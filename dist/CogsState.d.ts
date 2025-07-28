import { CSSProperties, RefObject } from 'react';
import { GenericObject } from './utility.js';
import { ValidationStatus, ComponentsType } from './store.js';

import * as z3 from 'zod/v3';
import * as z4 from 'zod/v4';
type Prettify<T> = T extends any ? {
    [K in keyof T]: T[K];
} : never;
export type VirtualViewOptions = {
    itemHeight?: number;
    overscan?: number;
    stickToBottom?: boolean;
    dependencies?: any[];
    scrollStickTolerance?: number;
};
export type VirtualStateObjectResult<T extends any[]> = {
    /**
     * A new, fully-functional StateObject that represents the virtualized slice.
     * You can use `.get()`, `.stateMap()`, `.insert()`, `.cut()` etc. on this object.
     */
    virtualState: StateObject<T>;
    /**
     * Props to be spread onto your DOM elements to enable virtualization.
     */
    virtualizerProps: {
        outer: {
            ref: RefObject<HTMLDivElement>;
            style: CSSProperties;
        };
        inner: {
            style: CSSProperties;
        };
        list: {
            style: CSSProperties;
        };
    };
    scrollToBottom: (behavior?: ScrollBehavior) => void;
    scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
};
export type SyncInfo = {
    timeStamp: number;
    userId: number;
};
export type FormElementParams<T> = StateObject<T> & {
    inputProps: {
        ref?: React.RefObject<any>;
        value?: T extends boolean ? never : T;
        onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
        onBlur?: () => void;
    };
};
export type StateKeys = string;
type findWithFuncType<U> = (thisKey: keyof U, thisValue: U[keyof U]) => EndType<U> & StateObject<U>;
type CutFunctionType<T> = (index?: number, options?: {
    waitForSync?: boolean;
}) => StateObject<T>;
export type InferArrayElement<T> = T extends (infer U)[] ? U : never;
export type StreamOptions<T, R = T> = {
    bufferSize?: number;
    flushInterval?: number;
    bufferStrategy?: 'sliding' | 'dropping' | 'accumulate';
    store?: (buffer: T[]) => R | R[];
    onFlush?: (buffer: T[]) => void;
};
export type StreamHandle<T> = {
    write: (data: T) => void;
    writeMany: (data: T[]) => void;
    flush: () => void;
    close: () => void;
    pause: () => void;
    resume: () => void;
};
export type ArrayEndType<TShape extends unknown> = {
    stream: <T = Prettify<InferArrayElement<TShape>>, R = T>(options?: StreamOptions<T, R>) => StreamHandle<T>;
    findWith: findWithFuncType<Prettify<InferArrayElement<TShape>>>;
    index: (index: number) => StateObject<Prettify<InferArrayElement<TShape>>> & {
        insert: InsertTypeObj<Prettify<InferArrayElement<TShape>>>;
        cut: CutFunctionType<TShape>;
        _index: number;
    } & EndType<Prettify<InferArrayElement<TShape>>>;
    insert: InsertType<Prettify<InferArrayElement<TShape>>>;
    cut: CutFunctionType<TShape>;
    cutSelected: () => void;
    cutByValue: (value: string | number | boolean) => void;
    toggleByValue: (value: string | number | boolean) => void;
    stateSort: (compareFn: (a: Prettify<InferArrayElement<TShape>>, b: Prettify<InferArrayElement<TShape>>) => number) => ArrayEndType<TShape>;
    useVirtualView: (options: VirtualViewOptions) => VirtualStateObjectResult<Prettify<InferArrayElement<TShape>>[]>;
    stateList: (callbackfn: (setter: StateObject<Prettify<InferArrayElement<TShape>>>, index: number, arraySetter: StateObject<TShape>) => void) => any;
    stateMap: <U>(callbackfn: (setter: StateObject<Prettify<InferArrayElement<TShape>>>, index: number, arraySetter: StateObject<TShape>) => U) => U[];
    $stateMap: (callbackfn: (setter: StateObject<Prettify<InferArrayElement<TShape>>>, index: number, arraySetter: StateObject<TShape>) => void) => any;
    stateFlattenOn: <K extends keyof Prettify<InferArrayElement<TShape>>>(field: K) => StateObject<InferArrayElement<Prettify<InferArrayElement<TShape>>[K]>[]>;
    uniqueInsert: (payload: InsertParams<Prettify<InferArrayElement<TShape>>>, fields?: (keyof Prettify<InferArrayElement<TShape>>)[], onMatch?: (existingItem: any) => any) => void;
    stateFind: (callbackfn: (value: Prettify<InferArrayElement<TShape>>, index: number) => boolean) => StateObject<Prettify<InferArrayElement<TShape>>> | undefined;
    stateFilter: (callbackfn: (value: Prettify<InferArrayElement<TShape>>, index: number) => void) => ArrayEndType<TShape>;
    getSelected: () => StateObject<Prettify<InferArrayElement<TShape>>> | undefined;
    clearSelected: () => void;
    getSelectedIndex: () => number;
    last: () => StateObject<Prettify<InferArrayElement<TShape>>> | undefined;
} & EndType<TShape>;
export type FormOptsType = {
    validation?: {
        hideMessage?: boolean;
        message?: string;
        props?: GenericObject;
        disable?: boolean;
    };
    debounceTime?: number;
    sync?: {
        allowInvalidValues?: boolean;
    };
};
export type FormControl<T> = (obj: FormElementParams<T>) => JSX.Element;
export type UpdateArg<S> = S | ((prevState: S) => S);
export type InsertParams<S> = S | ((prevState: {
    state: S;
    uuid: string;
}) => S);
export type UpdateType<T> = (payload: UpdateArg<T>) => {
    synced: () => void;
};
export type InsertType<T> = (payload: InsertParams<T>, index?: number) => void;
export type InsertTypeObj<T> = (payload: InsertParams<T>) => void;
export type ValidationError = {
    path: (string | number)[];
    message: string;
};
type EffectFunction<T, R> = (state: T, deps: any[]) => R;
export type EndType<T, IsArrayElement = false> = {
    addZodValidation: (errors: ValidationError[]) => void;
    clearZodValidation: (paths?: string[]) => void;
    applyJsonPatch: (patches: any[]) => void;
    update: UpdateType<T>;
    _path: string[];
    _stateKey: string;
    formElement: (control: FormControl<T>, opts?: FormOptsType) => JSX.Element;
    get: () => T;
    getState: () => T;
    $get: () => T;
    $derive: <R>(fn: EffectFunction<T, R>) => R;
    _status: 'fresh' | 'dirty' | 'synced' | 'restored' | 'unknown';
    getStatus: () => 'fresh' | 'dirty' | 'synced' | 'restored' | 'unknown';
    showValidationErrors: () => string[];
    setValidation: (ctx: string) => void;
    removeValidation: (ctx: string) => void;
    ignoreFields: (fields: string[]) => StateObject<T>;
    isSelected: boolean;
    setSelected: (value: boolean) => void;
    toggleSelected: () => void;
    getFormRef: () => React.RefObject<any> | undefined;
    removeStorage: () => void;
    sync: () => void;
    validationWrapper: ({ children, hideMessage, }: {
        children: React.ReactNode;
        hideMessage?: boolean;
    }) => JSX.Element;
    lastSynced?: SyncInfo;
} & (IsArrayElement extends true ? {
    cut: () => void;
} : {});
export type StateObject<T> = (T extends any[] ? ArrayEndType<T> : T extends Record<string, unknown> | object ? {
    [K in keyof T]-?: StateObject<T[K]>;
} : T extends string | number | boolean | null ? EndType<T, true> : never) & EndType<T, true> & {
    toggle: T extends boolean ? () => void : never;
    getAllFormRefs: () => Map<string, React.RefObject<any>>;
    _componentId: string | null;
    getComponents: () => ComponentsType;
    _initialState: T;
    updateInitialState: (newState: T | null) => {
        fetchId: (field: keyof T) => string | number;
    };
    _isLoading: boolean;
    _serverState: T;
    revertToInitialState: (obj?: {
        validationKey?: string;
    }) => T;
    getDifferences: () => string[];
    middleware: (middles: ({ updateLog, update, }: {
        updateLog: UpdateTypeDetail[] | undefined;
        update: UpdateTypeDetail;
    }) => void) => void;
    getLocalStorage: (key: string) => LocalStorageData<T> | null;
};
export type CogsUpdate<T extends unknown> = UpdateType<T>;
export type UpdateTypeDetail = {
    timeStamp: number;
    stateKey: string;
    updateType: 'update' | 'insert' | 'cut';
    path: string[];
    status: 'new' | 'sent' | 'synced';
    oldValue: any;
    newValue: any;
    userId?: number;
};
export type ReactivityUnion = 'none' | 'component' | 'deps' | 'all';
export type ReactivityType = 'none' | 'component' | 'deps' | 'all' | Array<Prettify<'none' | 'component' | 'deps' | 'all'>>;
type SyncApi = {
    updateState: (data: {
        operation: any;
    }) => void;
    connected: boolean;
    clientId: string | null;
    subscribers: string[];
};
type ValidationOptionsType = {
    key?: string;
    zodSchemaV3?: z3.ZodType<any, any, any>;
    zodSchemaV4?: z4.ZodType<any, any, any>;
    onBlur?: boolean;
};
type UseSyncType<T> = (state: T, a: SyncOptionsType<any>) => SyncApi;
type SyncOptionsType<TApiParams> = {
    apiParams: TApiParams;
    stateKey?: string;
    stateRoom: number | string | (({ clientId }: {
        clientId: string;
    }) => string | null);
    connect?: boolean;
    inMemoryState?: boolean;
};
export type OptionsType<T extends unknown = unknown, TApiParams = never> = {
    log?: boolean;
    componentId?: string;
    syncOptions?: SyncOptionsType<TApiParams>;
    validation?: ValidationOptionsType;
    serverState?: {
        id?: string | number;
        data?: T;
        status?: 'pending' | 'error' | 'success' | 'loading';
        timestamp?: number;
        merge?: boolean | {
            strategy: 'append' | 'prepend' | 'diff';
            key?: string;
        };
    };
    sync?: {
        action: (state: T) => Promise<{
            success: boolean;
            data?: any;
            error?: any;
            errors?: Array<{
                path: (string | number)[];
                message: string;
            }>;
        }>;
        onSuccess?: (data: any) => void;
        onError?: (error: any) => void;
    };
    middleware?: ({ updateLog, update, }: {
        updateLog: UpdateTypeDetail[] | undefined;
        update: UpdateTypeDetail;
    }) => void;
    modifyState?: (state: T) => T;
    localStorage?: {
        key: string | ((state: T) => string);
        onChange?: (state: T) => void;
    };
    formElements?: FormsElementsType<T>;
    reactiveDeps?: (state: T) => any[] | true;
    reactiveType?: ReactivityType;
    syncUpdate?: Partial<UpdateTypeDetail>;
    defaultState?: T;
    dependencies?: any[];
};
export type SyncRenderOptions<T extends unknown = unknown> = {
    children: React.ReactNode;
    time: number;
    data?: T;
    key?: string;
};
type FormsElementsType<T> = {
    validation?: (options: {
        children: React.ReactNode;
        status: ValidationStatus;
        path: string[];
        message?: string;
        data?: T;
        key?: string;
    }) => React.ReactNode;
    syncRender?: (options: SyncRenderOptions<T>) => React.ReactNode;
};
export type InitialStateInnerType<T extends unknown = unknown> = {
    initialState: T;
} & OptionsType<T>;
export type InitialStateType<T> = {
    [key: string]: InitialStateInnerType<T>;
};
export type AllStateTypes<T extends unknown> = Record<string, T>;
export type CogsInitialState<T> = {
    initialState: T;
    formElements?: FormsElementsType<T>;
};
export type TransformedStateType<T> = {
    [P in keyof T]: T[P] extends CogsInitialState<infer U> ? U : T[P];
};
export declare function addStateOptions<T extends unknown>(initialState: T, { formElements, validation }: OptionsType<T>): T;
type SetCogsOptionsFunc<T extends Record<string, any>> = <StateKey extends keyof TransformedStateType<T>>(stateKey: StateKey, options: OptionsType<TransformedStateType<T>[StateKey]>) => void;
export declare const createCogsState: <State extends Record<StateKeys, unknown>>(initialState: State, opt?: {
    formElements?: FormsElementsType<State>;
    validation?: ValidationOptionsType;
    __fromSyncSchema?: boolean;
    __syncNotifications?: Record<string, Function>;
    __apiParamsMap?: Record<string, any>;
    __useSync?: UseSyncType<State>;
    __syncSchemas?: Record<string, any>;
}) => CogsApi<State, never>;
type UseCogsStateHook<T extends Record<string, any>, TApiParamsMap extends Record<string, any> = never> = <StateKey extends keyof TransformedStateType<T> & string>(stateKey: StateKey, options?: [TApiParamsMap] extends [never] ? Prettify<OptionsType<TransformedStateType<T>[StateKey]>> : StateKey extends keyof TApiParamsMap ? Prettify<OptionsType<TransformedStateType<T>[StateKey], TApiParamsMap[StateKey]> & {
    syncOptions: Prettify<SyncOptionsType<TApiParamsMap[StateKey]>>;
}> : Prettify<OptionsType<TransformedStateType<T>[StateKey]>>) => StateObject<TransformedStateType<T>[StateKey]>;
type CogsApi<T extends Record<string, any>, TApiParamsMap extends Record<string, any> = never> = {
    useCogsState: UseCogsStateHook<T, TApiParamsMap>;
    setCogsOptions: SetCogsOptionsFunc<T>;
};
type GetParamType<SchemaEntry> = SchemaEntry extends {
    api?: {
        queryData?: {
            _paramType?: infer P;
        };
    };
} ? P : never;
export declare function createCogsStateFromSync<TSyncSchema extends {
    schemas: Record<string, {
        schemas: {
            defaultValues: any;
        };
        api?: {
            queryData?: any;
        };
        [key: string]: any;
    }>;
    notifications: Record<string, any>;
}>(syncSchema: TSyncSchema, useSync: UseSyncType<any>): CogsApi<{
    [K in keyof TSyncSchema['schemas']]: TSyncSchema['schemas'][K]['schemas']['defaultValues'];
}, {
    [K in keyof TSyncSchema['schemas']]: GetParamType<TSyncSchema['schemas'][K]>;
}>;
type LocalStorageData<T> = {
    state: T;
    lastUpdated: number;
    lastSyncedWithServer?: number;
    baseServerState?: T;
    stateSource?: 'default' | 'server' | 'localStorage';
};
export declare const notifyComponent: (stateKey: string, componentId: string) => void;
export declare function useCogsStateFn<TStateObject extends unknown>(stateObject: TStateObject, { stateKey, localStorage, formElements, reactiveDeps, reactiveType, componentId, defaultState, syncUpdate, dependencies, serverState, __useSync, syncOptions, }?: {
    stateKey?: string;
    componentId?: string;
    defaultState?: TStateObject;
    __useSync?: UseSyncType<TStateObject>;
    syncOptions?: SyncOptionsType<any>;
} & OptionsType<TStateObject>): StateObject<TStateObject>;
export type MetaData = {
    /**
     * An array of the full, unique string IDs (e.g., `"stateKey.arrayName.id:123"`)
     * of the items that belong to the current derived "view" of an array.
     * This is the primary mechanism for tracking the state of filtered or sorted lists.
     *
     * - `stateFilter` populates this with only the IDs of items that passed the filter.
     * - `stateSort` reorders this list to match the new sort order.
     * - All subsequent chained operations (like `.get()`, `.index()`, or `.cut()`)
     *   MUST consult this list first to know which items they apply to and in what order.
     */
    validIds?: string[];
    /**
     * An array of the actual filter functions that have been applied in a chain.
     * This is primarily used by reactive renderers like `$stateMap` to make predictions.
     *
     * For example, when a new item is inserted into the original source array, a
     * `$stateMap` renderer on a filtered view can use these functions to test if the
     * newly inserted item should be dynamically rendered in its view.
     */
    transforms?: Array<{
        type: 'filter' | 'sort';
        fn: Function;
    }>;
};
export declare function $cogsSignal(proxy: {
    _path: string[];
    _stateKey: string;
    _effect?: string;
    _meta?: MetaData;
}): import('react').FunctionComponentElement<{
    proxy: {
        _path: string[];
        _stateKey: string;
        _effect?: string;
        _meta?: MetaData;
    };
}>;
export {};
//# sourceMappingURL=CogsState.d.ts.map