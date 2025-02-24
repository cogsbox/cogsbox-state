import { GenericObject } from './utility.js';
import { UseMutationResult } from '@tanstack/react-query';
import { ZodObject, ZodRawShape } from 'zod';

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
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
export type FormElementParmas<T> = {
    get: () => T;
    set: UpdateType<T>;
    syncStatus: (SyncInfo & {
        date: Date;
    }) | null;
    path: string[];
    validationErrors: () => string[];
    inputProps: {
        value?: T;
        onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    };
};
export type StateKeys = string;
type findWithFuncType<U> = (thisKey: keyof U, thisValue: U[keyof U]) => EndType<U> & StateObject<U>;
export type PushArgs<U> = (update: Prettify<U> | ((prevState: NonNullable<Prettify<U>>[]) => NonNullable<Prettify<U>>), opts?: UpdateOpts<U>) => void;
type CutFunctionType = (index?: number, options?: {
    waitForSync?: boolean;
}) => void;
export type InferArrayElement<T> = T extends (infer U)[] ? U : never;
export type ArrayEndType<TShape extends unknown> = {
    findWith: findWithFuncType<InferArrayElement<TShape>>;
    index: (index: number) => StateObject<InferArrayElement<TShape>> & {
        insert: PushArgs<InferArrayElement<TShape>>;
        cut: CutFunctionType;
        _index: number;
    } & EndType<InferArrayElement<TShape>>;
    insert: PushArgs<InferArrayElement<TShape>>;
    cut: CutFunctionType;
    stateMapNoRender: (callbackfn: (value: InferArrayElement<TShape>, setter: StateObject<InferArrayElement<TShape>>, index: number, array: TShape, arraySetter: StateObject<TShape>) => void) => any;
    stateMap: (callbackfn: (value: InferArrayElement<TShape>, setter: StateObject<InferArrayElement<TShape>>, index: number, array: TShape, arraySetter: StateObject<TShape>) => void) => any;
    $stateMap: (callbackfn: (value: InferArrayElement<TShape>, setter: StateObject<InferArrayElement<TShape>>, index: number, array: TShape, arraySetter: StateObject<TShape>) => void) => any;
    stateFlattenOn: <K extends keyof InferArrayElement<TShape>>(field: K) => StateObject<InferArrayElement<InferArrayElement<TShape>[K]>[]>;
    uniqueInsert: (payload: UpdateArg<InferArrayElement<TShape>>, fields?: (keyof InferArrayElement<TShape>)[], onMatch?: (existingItem: any) => any) => void;
    stateFilter: (callbackfn: (value: InferArrayElement<TShape>, index: number) => void) => ArrayEndType<TShape>;
    getSelected: () => StateObject<InferArrayElement<TShape>> | undefined;
} & EndType<TShape> & {
    [K in keyof (any[] extends infer T ? T : never)]: never;
};
export type UpdateType<T> = (payload: UpdateArg<Prettify<T>>, opts?: UpdateOpts<T>) => void;
export type FormOptsType = {
    key?: string;
    validation?: {
        message?: string;
        stretch?: boolean;
        props?: GenericObject;
        disable?: boolean;
    };
    formElements?: boolean;
    debounceTime?: number;
    stateServerDifferences?: string[][];
};
export type FormControl<T> = (obj: FormElementParmas<T>) => JSX.Element;
export type UpdateArg<S> = S | ((prevState: S) => S);
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
type EffectFunction<T, R> = (state: T) => R;
export type EndType<T, IsArrayElement = false> = {
    update: UpdateType<T>;
    _path: string[];
    _stateKey: string;
    formElement: (validationKey: string, control: FormControl<T>, opts?: FormOptsType) => JSX.Element;
    get: () => T;
    $get: () => T;
    $derive: <R>(fn: EffectFunction<T, R>) => R;
    _status: "fresh" | "stale" | "synced";
    showValidationErrors: (ctx: string) => string[];
    setValidation: (ctx: string) => void;
    removeValidation: (ctx: string) => void;
    ignoreFields: (fields: string[]) => StateObject<T>;
    _selected: boolean;
    setSelected: (value: boolean) => void;
    validationWrapper: ({ children, hideMessage, }: {
        children: React.ReactNode;
        hideMessage?: boolean;
    }) => JSX.Element;
    lastSynced?: SyncInfo;
} & (IsArrayElement extends true ? {
    cut: () => void;
} : {}) & {
    [K in keyof (any extends infer T ? T : never)]: never;
};
export type StateObject<T> = (T extends any[] ? ArrayEndType<T> : T extends Record<string, unknown> | object ? {
    [K in keyof T]-?: StateObject<T[K]>;
} & ObjectEndType<T> : T extends string | number | boolean | null ? T : never) & EndType<T, true> & {
    _componentId: string | null;
    _initialState: T;
    updateInitialState: (newState: T | null) => {
        fetchId: (field: keyof T) => string | number;
    };
    _isLoading: boolean;
    _serverState: T;
    revertToInitialState: (obj?: {
        validationKey?: string;
    }) => void;
    middleware: (middles: ({ updateLog, update, }: {
        updateLog: UpdateTypeDetail[] | undefined;
        update: UpdateTypeDetail;
    }) => void) => void;
    _isServerSynced: () => boolean;
    getLocalStorage: (key: string) => LocalStorageData<T> | null;
};
export type CogsUpdate<T extends unknown> = UpdateType<T>;
export type EffectiveSetState<TStateObject> = (newStateOrFunction: TStateObject | ((prevState: TStateObject) => TStateObject), path: string[], updateObj: {
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
export type OptionsType<T extends unknown = unknown> = {
    serverSync?: ServerSyncType<T>;
    validationKey?: string;
    enableServerState?: boolean;
    middleware?: ({ updateLog, update, }: {
        updateLog: UpdateTypeDetail[] | undefined;
        update: UpdateTypeDetail;
    }) => void;
    zodSchema?: ZodObject<ZodRawShape>;
    modifyState?: (state: T) => T;
    localStorage?: {
        key: string | ((state: T) => string);
    };
    formElements?: FormsElementsType;
    enabledSync?: (state: T) => boolean;
    reactiveDeps?: (state: T) => any[] | true;
    reactiveType?: ReactivityType[] | ReactivityType;
    syncUpdate?: Partial<UpdateTypeDetail>;
    initState?: {
        localStorageKey?: string;
        ctx?: Record<string, any>;
        initialState: T;
        dependencies?: any[];
    };
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
    mutation: UseMutationResult<any, unknown, any, unknown>;
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
export type FunctionsToPassDownType = {
    getValidationErrors: (pathArray: string) => string[];
    removeValidationError: (path: string) => void;
};
export type AllStateTypes<T extends unknown> = Record<string, T>;
export type CogsInitialState<T> = {
    initialState: T;
    formElements?: FormsElementsType<T>;
};
export type TransformedStateType<T> = {
    [P in keyof T]: T[P] extends CogsInitialState<infer U> ? U : T[P];
};
export declare function addStateOptions<T extends unknown>(initialState: T, { formElements, zodSchema }: OptionsType<T>): T;
export declare const createCogsState: <State extends Record<string, unknown>>(initialState: State, opts?: {
    reRenderType?: "get" | "state" | "none";
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
export declare function useCogsStateFn<TStateObject extends unknown>(stateObject: TStateObject, { stateKey, serverSync, zodSchema, localStorage, formElements, middleware, reactiveDeps, reactiveType, componentId, initState, syncUpdate, }?: {
    stateKey?: string;
    componentId?: string;
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
