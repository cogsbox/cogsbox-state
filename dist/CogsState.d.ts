import { CogsPlugin } from './plugins';
import { CSSProperties, RefObject } from 'react';
import { GenericObject } from './utility.js';
import { ValidationError, ValidationSeverity, ValidationStatus, ComponentsType } from './store.js';

import * as z3 from 'zod/v3';
import * as z4 from 'zod/v4';
export type Prettify<T> = T extends any ? {
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
    virtualState: StateObject<T>;
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
    $inputProps: {
        ref?: React.RefObject<any>;
        value?: T extends boolean ? never : T;
        onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
        onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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
    $stream: <T = Prettify<InferArrayElement<TShape>>, R = T>(options?: StreamOptions<T, R>) => StreamHandle<T>;
    $findWith: findWithFuncType<Prettify<InferArrayElement<TShape>>>;
    $index: (index: number) => StateObject<Prettify<InferArrayElement<TShape>>> & {
        $insert: InsertTypeObj<Prettify<InferArrayElement<TShape>>>;
        $cut: CutFunctionType<TShape>;
        $_index: number;
    } & EndType<Prettify<InferArrayElement<TShape>>>;
    $insert: InsertType<Prettify<InferArrayElement<TShape>>>;
    $cut: CutFunctionType<TShape>;
    $cutSelected: () => void;
    $cutByValue: (value: string | number | boolean) => void;
    $toggleByValue: (value: string | number | boolean) => void;
    $stateSort: (compareFn: (a: Prettify<InferArrayElement<TShape>>, b: Prettify<InferArrayElement<TShape>>) => number) => ArrayEndType<TShape>;
    $useVirtualView: (options: VirtualViewOptions) => VirtualStateObjectResult<Prettify<InferArrayElement<TShape>>[]>;
    $stateList: (callbackfn: (setter: StateObject<Prettify<InferArrayElement<TShape>>>, index: number, arraySetter: StateObject<TShape>) => void) => any;
    $stateMap: <U>(callbackfn: (setter: StateObject<Prettify<InferArrayElement<TShape>>>, index: number, arraySetter: StateObject<TShape>) => U) => U[];
    $stateFlattenOn: <K extends keyof Prettify<InferArrayElement<TShape>>>(field: K) => StateObject<InferArrayElement<Prettify<InferArrayElement<TShape>>[K]>[]>;
    $uniqueInsert: (payload: InsertParams<Prettify<InferArrayElement<TShape>>>, fields?: (keyof Prettify<InferArrayElement<TShape>>)[], onMatch?: (existingItem: any) => any) => void;
    $stateFind: (callbackfn: (value: Prettify<InferArrayElement<TShape>>, index: number) => boolean) => StateObject<Prettify<InferArrayElement<TShape>>> | undefined;
    $stateFilter: (callbackfn: (value: Prettify<InferArrayElement<TShape>>, index: number) => void) => ArrayEndType<TShape>;
    $getSelected: () => StateObject<Prettify<InferArrayElement<TShape>>> | undefined;
    $clearSelected: () => void;
    $getSelectedIndex: () => number;
    $last: () => StateObject<Prettify<InferArrayElement<TShape>>> | undefined;
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
type EffectFunction<T, R> = (state: T, deps: any[]) => R;
export type EndType<T, IsArrayElement = false> = {
    $getPluginMetaData: (pluginName: string) => Record<string, any>;
    $addPluginMetaData: (key: string, data: Record<string, any>) => void;
    $removePluginMetaData: (key: string) => void;
    $useFocusedFormElement: () => {
        path: string[];
        ref: React.RefObject<any>;
    } | null;
    $addZodValidation: (errors: ValidationError[], source?: 'client' | 'sync_engine' | 'api') => void;
    $clearZodValidation: (paths?: string[]) => void;
    $applyOperation: (operation: UpdateTypeDetail, metaData?: Record<string, any>) => void;
    $applyJsonPatch: (patches: any[]) => void;
    $update: UpdateType<T>;
    $_path: string[];
    $_stateKey: string;
    $isolate: (renderFn: (state: StateObject<T>) => React.ReactNode) => JSX.Element;
    $formElement: (control: FormControl<T>, opts?: FormOptsType) => JSX.Element;
    $get: () => T;
    $$get: () => T;
    $$derive: <R>(fn: EffectFunction<T, R>) => R;
    $_status: 'fresh' | 'dirty' | 'synced' | 'restored' | 'unknown';
    $getStatus: () => 'fresh' | 'dirty' | 'synced' | 'restored' | 'unknown';
    $showValidationErrors: () => string[];
    $setValidation: (ctx: string) => void;
    $removeValidation: (ctx: string) => void;
    $ignoreFields: (fields: string[]) => StateObject<T>;
    $isSelected: boolean;
    $setSelected: (value: boolean) => void;
    $toggleSelected: () => void;
    $formInput: {
        setDisabled: (isDisabled: boolean) => void;
        focus: () => void;
        blur: () => void;
        scrollIntoView: (options?: ScrollIntoViewOptions) => void;
        click: () => void;
        selectText: () => void;
    };
    $removeStorage: () => void;
    $sync: () => void;
    $validationWrapper: ({ children, hideMessage, }: {
        children: React.ReactNode;
        hideMessage?: boolean;
    }) => JSX.Element;
    $lastSynced?: SyncInfo;
} & (IsArrayElement extends true ? {
    $cutThis: () => void;
} : {});
export type StateObject<T> = (T extends any[] ? ArrayEndType<T> : T extends Record<string, unknown> | object ? {
    [K in keyof T]-?: StateObject<T[K]>;
} : T extends string | number | boolean | null ? EndType<T, true> : never) & EndType<T, true> & {
    $toggle: T extends boolean ? () => void : never;
    $_componentId: string | null;
    $getComponents: () => ComponentsType;
    $_initialState: T;
    $updateInitialState: (newState: T | null) => {
        fetchId: (field: keyof T) => string | number;
    };
    $initializeAndMergeShadowState: (newState: any | null) => void;
    $_isLoading: boolean;
    $_serverState: T;
    $revertToInitialState: (obj?: {
        validationKey?: string;
    }) => T;
    $middleware: (middles: ({ updateLog, update, }: {
        updateLog: UpdateTypeDetail[] | undefined;
        update: UpdateTypeDetail;
    }) => void) => void;
    $getLocalStorage: (key: string) => LocalStorageData<T> | null;
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
    itemId?: string;
    insertAfterId?: string;
    metaData?: Record<string, any>;
};
export type ReactivityUnion = 'none' | 'component' | 'deps' | 'all';
export type ReactivityType = 'none' | 'component' | 'deps' | 'all' | Array<Prettify<'none' | 'component' | 'deps' | 'all'>>;
type ValidationOptionsType = {
    key?: string;
    zodSchemaV3?: z3.ZodType<any, any, any>;
    zodSchemaV4?: z4.ZodType<any, any, any>;
    onBlur?: 'error' | 'warning';
    onChange?: 'error' | 'warning';
    blockSync?: boolean;
};
type SyncOptionsType<TApiParams> = {
    apiParams: TApiParams;
    stateKey?: string;
    stateRoom: number | string | (({ clientId }: {
        clientId: string;
    }) => string | null);
    connect?: boolean;
    inMemoryState?: boolean;
};
export type CreateStateOptionsType<T extends unknown = unknown, TPluginOptions = {}> = {
    formElements?: FormsElementsType<T>;
    validation?: ValidationOptionsType;
    plugins?: CogsPlugin<string, T, TPluginOptions>[];
};
export type OptionsType<T extends unknown = unknown, TApiParams = never> = CreateStateOptionsType & {
    log?: boolean;
    componentId?: string;
    syncOptions?: SyncOptionsType<TApiParams>;
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
    middleware?: ({ update }: {
        update: UpdateTypeDetail;
    }) => void;
    localStorage?: {
        key: string | ((state: T) => string);
        onChange?: (state: T) => void;
    };
    reactiveDeps?: (state: T) => any[] | true;
    reactiveType?: ReactivityType;
    syncUpdate?: Partial<UpdateTypeDetail>;
    defaultState?: T;
    dependencies?: any[];
};
type FormsElementsType<T> = {
    validation?: (options: {
        children: React.ReactNode;
        status: ValidationStatus;
        severity: ValidationSeverity;
        hasErrors: boolean;
        hasWarnings: boolean;
        allErrors: ValidationError[];
        path: string[];
        message?: string;
        getData?: () => T;
    }) => React.ReactNode;
    syncRender?: (options: {
        children: React.ReactNode;
        time: number;
        data?: T;
        key?: string;
    }) => React.ReactNode;
};
export type CogsInitialState<T> = {
    initialState: T;
} | CreateStateOptionsType<T>;
export type TransformedStateType<T> = {
    [P in keyof T]: T[P] extends CogsInitialState<infer U> ? U : T[P];
};
export declare function addStateOptions<T>(initialState: T, options: CreateStateOptionsType<T>): {
    initialState: T;
    _addStateOptions: boolean;
    formElements?: FormsElementsType<T> | undefined;
    validation?: ValidationOptionsType;
    plugins?: CogsPlugin<string, T, {}>[] | undefined;
};
export type PluginData = {
    plugin: CogsPlugin<any, any, any>;
    options: any;
    hookData?: any;
};
export declare const createCogsState: <State extends Record<string, unknown>, TPlugins extends readonly CogsPlugin<string, State, any, any>[] = []>(initialState: State, opt?: {
    formElements?: FormsElementsType<State>;
    validation?: ValidationOptionsType;
    plugins?: TPlugins;
}) => {
    useCogsState: <StateKey extends keyof State>(stateKey: StateKey, options?: CreateStateOptionsType<unknown, {}> & {
        log?: boolean;
        componentId?: string;
        syncOptions?: SyncOptionsType<never> | undefined;
        serverState?: {
            id?: string | number;
            data?: TransformedStateType<State>[StateKey] | undefined;
            status?: "pending" | "error" | "success" | "loading";
            timestamp?: number;
            merge?: boolean | {
                strategy: "append" | "prepend" | "diff";
                key?: string;
            };
        } | undefined;
        sync?: {
            action: (state: TransformedStateType<State>[StateKey]) => Promise<{
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
        } | undefined;
        middleware?: ({ update }: {
            update: UpdateTypeDetail;
        }) => void;
        localStorage?: {
            key: string | ((state: TransformedStateType<State>[StateKey]) => string);
            onChange?: ((state: TransformedStateType<State>[StateKey]) => void) | undefined;
        } | undefined;
        reactiveDeps?: ((state: TransformedStateType<State>[StateKey]) => any[] | true) | undefined;
        reactiveType?: ReactivityType;
        syncUpdate?: Partial<UpdateTypeDetail>;
        defaultState?: TransformedStateType<State>[StateKey] | undefined;
        dependencies?: any[];
    } & { [PName in keyof { [K_1 in TPlugins[number] as K_1["name"]]?: (K_1 extends CogsPlugin<string, State, infer O, any> ? O : never) | undefined; }]?: ({ [K_1 in TPlugins[number] as K_1["name"]]?: (K_1 extends CogsPlugin<string, State, infer O, any> ? O : never) | undefined; }[PName] extends infer P ? P extends Record<string, any> ? { [K_2 in keyof P]: P[K_2] extends {
        __key: "keyed";
        map: infer TMap;
    } ? StateKey extends keyof TMap ? TMap[StateKey] : never : P[K_2]; } : P : never) | undefined; } extends infer T ? { [K in keyof T]: T[K]; } : never) => StateObject<TransformedStateType<State>[StateKey]>;
    setCogsOptions: <StateKey extends keyof State>(stateKey: StateKey, options: OptionsType<TransformedStateType<State>[StateKey]>) => void;
};
type LocalStorageData<T> = {
    state: T;
    lastUpdated: number;
    lastSyncedWithServer?: number;
    baseServerState?: T;
    stateSource?: 'default' | 'server' | 'localStorage';
};
export declare function useCogsStateFn<TStateObject extends unknown>(stateObject: TStateObject, { stateKey, localStorage, formElements, reactiveDeps, reactiveType, componentId, defaultState, syncUpdate, dependencies, serverState, }?: {
    stateKey?: string;
    componentId?: string;
    defaultState?: TStateObject;
    syncOptions?: SyncOptionsType<any>;
} & OptionsType<TStateObject>): StateObject<TStateObject>;
type MetaData = {
    arrayViews?: {
        [arrayPath: string]: string[];
    };
    transforms?: Array<{
        type: 'filter' | 'sort';
        fn: Function;
        path: string[];
    }>;
    serverStateIsUpStream?: boolean;
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