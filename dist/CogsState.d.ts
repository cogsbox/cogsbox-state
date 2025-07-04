import { CSSProperties, RefObject } from 'react';
import { GenericObject } from './utility.js';
import { z } from 'zod';
import { ComponentsType } from './store.js';

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
export type VirtualViewOptions = {
    itemHeight?: number;
    overscan?: number;
    stickToBottom?: boolean;
    dependencies?: any[];
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
export type ServerSyncStatus = {
    isFresh: boolean;
    isFreshTime: number;
    isStale: boolean;
    isStaleTime: number;
    isSyncing: boolean;
    isSyncingTime: number;
};
export type SyncInfo = {
    timeStamp: number;
    userId: number;
};
export type FormElementParams<T> = {
    get: () => T;
    set: UpdateType<T>;
    syncStatus: (SyncInfo & {
        date: Date;
    }) | null;
    path: string[];
    validationErrors: () => string[];
    addValidationError: (message?: string) => void;
    inputProps: {
        ref?: React.RefObject<any>;
        value?: T extends boolean ? never : T;
        onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
        onBlur?: () => void;
    };
};
export type StateKeys = string;
type findWithFuncType<U> = (thisKey: keyof U, thisValue: U[keyof U]) => EndType<U> & StateObject<U>;
export type PushArgs<U, T> = (update: Prettify<U> | ((prevState: NonNullable<Prettify<U>>[]) => NonNullable<Prettify<U>>), opts?: UpdateOpts<U>) => StateObject<T>;
type CutFunctionType<T> = (index?: number, options?: {
    waitForSync?: boolean;
}) => StateObject<T>;
export type InferArrayElement<T> = T extends (infer U)[] ? U : never;
export type ArrayEndType<TShape extends unknown> = {
    findWith: findWithFuncType<InferArrayElement<TShape>>;
    index: (index: number) => StateObject<InferArrayElement<TShape>> & {
        insert: PushArgs<InferArrayElement<TShape>, TShape>;
        cut: CutFunctionType<TShape>;
        _index: number;
    } & EndType<InferArrayElement<TShape>>;
    insert: PushArgs<InferArrayElement<TShape>, TShape>;
    cut: CutFunctionType<TShape>;
    cutByValue: (value: string | number | boolean) => void;
    toggleByValue: (value: string | number | boolean) => void;
    stateSort: (compareFn: (a: InferArrayElement<TShape>, b: InferArrayElement<TShape>) => number) => ArrayEndType<TShape>;
    useVirtualView: (options: VirtualViewOptions) => VirtualStateObjectResult<InferArrayElement<TShape>[]>;
    stateMapNoRender: (callbackfn: (value: InferArrayElement<TShape>, setter: StateObject<InferArrayElement<TShape>>, index: number, array: TShape, arraySetter: StateObject<TShape>) => void) => any;
    stateList: (callbackfn: (value: InferArrayElement<TShape>, setter: StateObject<InferArrayElement<TShape>>, index: {
        localIndex: number;
        originalIndex: number;
    }, array: TShape, arraySetter: StateObject<TShape>) => void) => any;
    stateMap: (callbackfn: (value: InferArrayElement<TShape>, setter: StateObject<InferArrayElement<TShape>>, index: number, array: TShape, arraySetter: StateObject<TShape>) => void) => any;
    $stateMap: (callbackfn: (value: InferArrayElement<TShape>, setter: StateObject<InferArrayElement<TShape>>, index: number, array: TShape, arraySetter: StateObject<TShape>) => void) => any;
    stateFlattenOn: <K extends keyof InferArrayElement<TShape>>(field: K) => StateObject<InferArrayElement<InferArrayElement<TShape>[K]>[]>;
    uniqueInsert: (payload: UpdateArg<InferArrayElement<TShape>>, fields?: (keyof InferArrayElement<TShape>)[], onMatch?: (existingItem: any) => any) => void;
    stateFind: (callbackfn: (value: InferArrayElement<TShape>, index: number) => boolean) => StateObject<InferArrayElement<TShape>> | undefined;
    stateFilter: (callbackfn: (value: InferArrayElement<TShape>, index: number) => void) => ArrayEndType<TShape>;
    getSelected: () => StateObject<InferArrayElement<TShape>> | undefined;
    clearSelected: () => void;
    getSelectedIndex: () => number;
    last: () => StateObject<InferArrayElement<TShape>> | undefined;
} & EndType<TShape>;
export type FormOptsType = {
    validation?: {
        hideMessage?: boolean;
        message?: string;
        stretch?: boolean;
        props?: GenericObject;
        disable?: boolean;
    };
    debounceTime?: number;
};
export type FormControl<T> = (obj: FormElementParams<T>) => JSX.Element;
export type UpdateArg<S> = S | ((prevState: S) => S);
export type UpdateType<T> = (payload: UpdateArg<T>, opts?: UpdateOpts<T>) => void;
export type UpdateOpts<T> = {
    afterUpdate?: (state: T) => void;
    debounce?: number;
};
export type ObjectEndType<T> = EndType<T> & {
    [K in keyof T]-?: ObjectEndType<T[K]>;
} & {
    stateObject: (callbackfn: (value: T, setter: StateObject<T>) => void) => any;
    delete: () => void;
};
export type ValidationError = {
    path: (string | number)[];
    message: string;
};
type EffectFunction<T, R> = (state: T) => R;
export type EndType<T, IsArrayElement = false> = {
    addValidation: (errors: ValidationError[]) => void;
    applyJsonPatch: (patches: any[]) => void;
    update: UpdateType<T>;
    _path: string[];
    _stateKey: string;
    formElement: (control: FormControl<T>, opts?: FormOptsType) => JSX.Element;
    get: () => T;
    $get: () => T;
    $derive: <R>(fn: EffectFunction<T, R>) => R;
    _status: "fresh" | "stale" | "synced";
    getStatus: () => "fresh" | "stale";
    showValidationErrors: () => string[];
    setValidation: (ctx: string) => void;
    removeValidation: (ctx: string) => void;
    ignoreFields: (fields: string[]) => StateObject<T>;
    _selected: boolean;
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
} & ObjectEndType<T> : T extends string | number | boolean | null ? T : never) & EndType<T, true> & {
    getAllFormRefs: () => Map<string, React.RefObject<any>>;
    _componentId: string | null;
    getComponents: () => ComponentsType;
    validateZodSchema: () => void;
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
    _isServerSynced: () => boolean;
    getLocalStorage: (key: string) => LocalStorageData<T> | null;
};
export type CogsUpdate<T extends unknown> = UpdateType<T>;
export type EffectiveSetState<TStateObject> = (newStateOrFunction: UpdateArg<TStateObject>, path: string[], updateObj: {
    updateType: "update" | "insert" | "cut";
}, validationKey?: string, opts?: UpdateOpts<TStateObject>) => void;
export type UpdateTypeDetail = {
    timeStamp: number;
    stateKey: string;
    updateType: "update" | "insert" | "cut";
    path: string[];
    status: "new" | "sent" | "synced";
    oldValue: any;
    newValue: any;
    userId?: number;
};
export type ActionsType<T> = {
    type: "onChange";
    action: ({ state, actionType }: {
        state: T;
        actionType: string;
    }) => void;
    debounce?: number;
}[];
type ArrayToObject<T extends string[]> = Record<T[number], string>;
type CookieType<T> = {
    timeStamp: number;
    value: T;
    cookieName: string;
    OnUnMountCookie?: Boolean;
};
export type CogsCookiesType<T extends string[] = string[]> = CookieType<ArrayToObject<T>>;
export type ReactivityType = "none" | "component" | "deps" | "all";
type ValidationOptionsType = {
    key?: string;
    zodSchema?: z.ZodTypeAny;
    onBlur?: boolean;
};
export type OptionsType<T extends unknown = unknown> = {
    log?: boolean;
    componentId?: string;
    serverSync?: ServerSyncType<T>;
    validation?: ValidationOptionsType;
    enableServerState?: boolean;
    serverState?: {
        id?: string | number;
        data?: T;
        status?: "pending" | "error" | "success";
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
    formElements?: FormsElementsType;
    enabledSync?: (state: T) => boolean;
    reactiveDeps?: (state: T) => any[] | true;
    reactiveType?: ReactivityType[] | ReactivityType;
    syncUpdate?: Partial<UpdateTypeDetail>;
    initialState?: T;
    dependencies?: any[];
};
export type ServerSyncType<T> = {
    testKey?: string;
    syncKey: (({ state }: {
        state: T;
    }) => string) | string;
    syncFunction: ({ state }: {
        state: T;
    }) => void;
    debounce?: number;
    snapshot?: {
        name: (({ state }: {
            state: T;
        }) => string) | string;
        stateKeys: StateKeys[];
        currentUrl: string;
        currentParams?: URLSearchParams;
    };
};
export type SyncActionsType<T> = {
    syncKey: string;
    rollBackState?: T;
    actionTimeStamp: number;
    retryCount?: number;
    status: "success" | "waiting" | "rolledBack" | "error" | "cancelled" | "failed";
    snapshot?: {
        name: string;
        stateKeys: StateKeys[];
        currentUrl: string;
        currentParams?: URLSearchParams;
    };
};
export type ValidationWrapperOptions<T extends unknown = unknown> = {
    children: React.ReactNode;
    active: boolean;
    stretch?: boolean;
    path: string[];
    message?: string;
    data?: T;
    key?: string;
};
export type SyncRenderOptions<T extends unknown = unknown> = {
    children: React.ReactNode;
    time: number;
    data?: T;
    key?: string;
};
type FormsElementsType<T extends unknown = unknown> = {
    validation?: (options: ValidationWrapperOptions<T>) => React.ReactNode;
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
export declare const createCogsState: <State extends Record<StateKeys, unknown>>(initialState: State, opt?: {
    formElements?: FormsElementsType;
    validation?: ValidationOptionsType;
}) => {
    useCogsState: <StateKey extends keyof State>(stateKey: StateKey, options?: OptionsType<TransformedStateType<State>[StateKey]>) => StateObject<TransformedStateType<State>[StateKey]>;
    setCogsOptions: <StateKey extends keyof State>(stateKey: StateKey, options: OptionsType<TransformedStateType<State>[StateKey]>) => void;
};
type LocalStorageData<T> = {
    state: T;
    lastUpdated: number;
    lastSyncedWithServer?: number;
    baseServerState?: T;
};
export declare const notifyComponent: (stateKey: string, componentId: string) => void;
export declare function useCogsStateFn<TStateObject extends unknown>(stateObject: TStateObject, { stateKey, serverSync, localStorage, formElements, reactiveDeps, reactiveType, componentId, initialState, syncUpdate, dependencies, serverState, }?: {
    stateKey?: string;
    componentId?: string;
    initialState?: TStateObject;
} & OptionsType<TStateObject>): [TStateObject, StateObject<TStateObject>];
export declare function $cogsSignal(proxy: {
    _path: string[];
    _stateKey: string;
    _effect?: string;
}): import('react').FunctionComponentElement<{
    proxy: {
        _path: string[];
        _stateKey: string;
        _effect?: string;
    };
}>;
export declare function $cogsSignalStore(proxy: {
    _path: string[];
    _stateKey: string;
}): import('react').ReactSVGElement;
export {};
