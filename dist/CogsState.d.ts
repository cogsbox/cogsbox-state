import { CogsPlugin } from './plugins';
import { GenericObject } from './utility.js';
import { ValidationError, ValidationSeverity, ValidationStatus, ComponentsType } from './store.js';
import { ZodType } from 'zod/v4';

import * as z3 from 'zod/v3';
export type Prettify<T> = T extends any ? {
    [K in keyof T]: T[K];
} : never;
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
type CutFunctionType<T> = (index?: number, options?: {
    waitForSync?: boolean;
}) => StateObject<T>;
export type InferArrayElement<T> = T extends (infer U)[] ? U : never;
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
export type PerPathFormOptsType<TState, TPlugins extends readonly CogsPlugin<any, any, any, any, any>[] = []> = Omit<FormOptsType, 'formElements'> & {
    formElements?: FormsElementsType<TState, TPlugins>;
};
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
export type ArrayElementExtras<TParentArray = unknown> = {
    $cutThis: () => void;
    $_index: number;
};
export type EndType<T, TPlugins extends readonly CogsPlugin<any, any, any, any, any>[] = []> = {
    $getPluginMetaData: (pluginName: string) => Record<string, any>;
    $addPluginMetaData: (key: string, data: Record<string, any>) => void;
    $removePluginMetaData: (key: string) => void;
    $setOptions: (options: OptionsType<T>) => void;
    $addZodValidation: (errors: ValidationError[], source?: 'client' | 'sync_engine' | 'api') => void;
    $clearValidation: (paths?: string[]) => void;
    $applyOperation: (operation: UpdateTypeDetail, metaData?: Record<string, any>) => void;
    $applyJsonPatch: (patches: any[]) => void;
    $update: UpdateType<T>;
    $_path: string[];
    $_stateKey: string;
    $isolate: {
        (renderFn: (state: StateObject<T, TPlugins>) => React.ReactNode): JSX.Element;
        (dependencies: any[], renderFn: (state: StateObject<T, TPlugins>) => React.ReactNode): JSX.Element;
    };
    $formElement: (control: FormControl<T>, opts?: PerPathFormOptsType<T, TPlugins>) => JSX.Element;
    $get: () => T;
    $$get: () => T;
    $$derive: <R>(fn: EffectFunction<T, R>) => R;
    $_status: 'fresh' | 'dirty' | 'synced' | 'restored' | 'unknown';
    $getStatus: () => 'fresh' | 'dirty' | 'synced' | 'restored' | 'unknown';
    $showValidationErrors: () => string[];
    $setValidation: (ctx: string) => void;
    $removeValidation: (ctx: string) => void;
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
};
export type ArrayElementState<TElement, TParentArray, TPlugins extends readonly CogsPlugin<any, any, any, any, any>[] = []> = StateObject<TElement, TPlugins> & ArrayElementExtras<TParentArray>;
export type ArrayEndType<TShape extends unknown, TPlugins extends readonly CogsPlugin<any, any, any, any, any>[]> = {
    (): TShape;
    (newValue: TShape | ((prev: TShape) => TShape)): void;
    $findWith: <K extends keyof Prettify<InferArrayElement<TShape>>>(key: K, value: Prettify<InferArrayElement<TShape>>[K]) => ArrayElementState<Prettify<InferArrayElement<TShape>>, TShape, TPlugins> | undefined;
    $index: (index: number) => ArrayElementState<Prettify<InferArrayElement<TShape>>, TShape, TPlugins>;
    $insert: InsertType<Prettify<InferArrayElement<TShape>>>;
    $insertMany: (payload: InferArrayElement<TShape>[]) => void;
    $cut: CutFunctionType<TShape>;
    $cutSelected: () => void;
    $cutByValue: (value: string | number | boolean) => void;
    $toggleByValue: (value: string | number | boolean) => void;
    $sort: (compareFn: (a: Prettify<InferArrayElement<TShape>>, b: Prettify<InferArrayElement<TShape>>) => number) => StateObject<TShape, TPlugins>;
    $list: (callbackfn: (setter: ArrayElementState<Prettify<InferArrayElement<TShape>>, TShape, TPlugins>, index: number, arraySetter: StateObject<TShape, TPlugins>) => void) => any;
    $map: <U>(callbackfn: (setter: ArrayElementState<Prettify<InferArrayElement<TShape>>, TShape, TPlugins>, index: number, arraySetter: StateObject<TShape, TPlugins>) => U) => U[];
    $stateFlattenOn: <K extends keyof Prettify<InferArrayElement<TShape>>>(field: K) => StateObject<InferArrayElement<Prettify<InferArrayElement<TShape>>[K]>[], TPlugins>;
    $uniqueInsert: (payload: InsertParams<Prettify<InferArrayElement<TShape>>>, fields?: (keyof Prettify<InferArrayElement<TShape>>)[], onMatch?: (existingItem: any) => any) => void;
    $find: (callbackfn: (value: Prettify<InferArrayElement<TShape>>, index: number) => boolean) => ArrayElementState<Prettify<InferArrayElement<TShape>>, TShape, TPlugins> | undefined;
    $filter: (callbackfn: (value: Prettify<InferArrayElement<TShape>>, index: number) => boolean) => StateObject<TShape, TPlugins>;
    $getSelected: () => ArrayElementState<Prettify<InferArrayElement<TShape>>, TShape, TPlugins> | undefined;
    $clearSelected: () => void;
    $getSelectedIndex: () => number;
    $last: () => ArrayElementState<Prettify<InferArrayElement<TShape>>, TShape, TPlugins> | undefined;
} & EndType<TShape, TPlugins>;
export type StateObject<T, TPlugins extends readonly CogsPlugin<any, any, any, any, any>[] = []> = {
    (): T;
    (newValue: T | ((prev: T) => T)): void;
} & (T extends any[] ? ArrayEndType<T, TPlugins> : T extends Record<string, unknown> | object ? {
    [K in keyof T]-?: StateObject<T[K], TPlugins>;
} : EndType<T, TPlugins>) & // primitives just get EndType
EndType<T, TPlugins> & {
    $toggle: T extends boolean ? () => void : never;
    $validate: () => {
        success: boolean;
        data?: T;
        error?: any;
    };
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
    updateType: 'update' | 'insert' | 'cut' | 'insert_many';
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
    zodSchemaV4?: ZodType;
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
export type CreateStateOptionsType<T extends unknown = unknown, TPlugins extends readonly CogsPlugin<any, any, any, any, any>[] = []> = {
    formElements?: FormsElementsType<T, TPlugins>;
    validation?: ValidationOptionsType;
    plugins?: TPlugins;
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
type ScopedPluginApi<THookReturn, TFieldMetaData> = {
    hookData: THookReturn;
    getFieldMetaData: () => TFieldMetaData | undefined;
    setFieldMetaData: (data: Partial<TFieldMetaData>) => void;
};
export type FormsElementsType<TState, TPlugins extends readonly CogsPlugin<any, any, any, any, any>[] = []> = {
    validation?: (options: {
        children: React.ReactNode;
        status: ValidationStatus;
        severity: ValidationSeverity;
        hasErrors: boolean;
        hasWarnings: boolean;
        allErrors: ValidationError[];
        path: string[];
        message?: string;
        getData?: () => TState;
        plugins: {
            [P in TPlugins[number] as P['name']]: P extends CogsPlugin<any, any, infer THookReturn, any, infer TFieldMetaData> ? ScopedPluginApi<THookReturn, TFieldMetaData> : never;
        };
    }) => React.ReactNode;
    syncRender?: (options: {
        children: React.ReactNode;
        time: number;
        data?: TState;
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
    formElements?: FormsElementsType<T, []> | undefined;
    validation?: ValidationOptionsType;
    plugins?: [] | undefined;
};
export type PluginData = {
    plugin: CogsPlugin<any, any, any, any, any>;
    options: any;
    hookData?: any;
};
export declare const createCogsState: <State extends Record<string, unknown>, const TPlugins extends readonly CogsPlugin<string, any, any, any, any>[] = []>(initialState: State, opt?: {
    plugins?: TPlugins;
    formElements?: FormsElementsType<State, TPlugins>;
    validation?: ValidationOptionsType;
}) => {
    useCogsState: <StateKey extends keyof State>(stateKey: StateKey, options?: CreateStateOptionsType<unknown, []> & {
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
    } & { [PName in keyof { [K_1 in TPlugins[number] as K_1["name"]]?: (K_1 extends {
        useHook?: (params: {
            options: infer O;
        }) => any;
    } ? O : K_1 extends CogsPlugin<string, infer O_1, any, any, any> ? O_1 : never) | undefined; }]?: ({ [K_1 in TPlugins[number] as K_1["name"]]?: (K_1 extends {
        useHook?: (params: {
            options: infer O;
        }) => any;
    } ? O : K_1 extends CogsPlugin<string, infer O_1, any, any, any> ? O_1 : never) | undefined; }[PName] extends infer P ? P extends Record<string, any> ? { [K_3 in keyof P as NonNullable<P[K_3]> extends {
        __key: "keyed";
        map: any;
    } ? never : K_3]: P[K_3]; } & { [K_4 in keyof P as NonNullable<P[K_4]> extends {
        __key: "keyed";
        map: any;
    } ? StateKey extends keyof NonNullable<P[K_4]>["map"] ? NonNullable<P[K_4]>["map"][StateKey] extends undefined ? never : keyof NonNullable<P[K_4]>["map"][StateKey] extends never ? never : K_4 : never : never]: (NonNullable<P[K_4]> extends {
        __key: "keyed";
        map: any;
    } ? StateKey extends keyof NonNullable<P[K_4]>["map"] ? NonNullable<P[K_4]>["map"][StateKey] : never : never) extends infer T_2 ? T_2 extends (NonNullable<P[K_4]> extends {
        __key: "keyed";
        map: any;
    } ? StateKey extends keyof NonNullable<P[K_4]>["map"] ? NonNullable<P[K_4]>["map"][StateKey] : never : never) ? T_2 extends object ? { [K_5 in keyof T_2]: T_2[K_5]; } : T_2 : never : never; } extends infer T_1 ? { [K_2 in keyof T_1]: T_1[K_2]; } : never : P : never) | undefined; } extends infer T ? { [K in keyof T]: T[K]; } : never) => StateObject<TransformedStateType<State>[StateKey], TPlugins>;
    setCogsOptionsByKey: <StateKey extends keyof State>(stateKey: StateKey, options: CreateStateOptionsType<TransformedStateType<State>[StateKey], TPlugins> & Omit<OptionsType<TransformedStateType<State>[StateKey]>, keyof CreateStateOptionsType>) => void;
    setCogsOptions: (globalOptions: CreateStateOptionsType<unknown, TPlugins> & Omit<OptionsType<unknown>, keyof CreateStateOptionsType>) => void;
};
type LocalStorageData<T> = {
    state: T;
    lastUpdated: number;
    lastSyncedWithServer?: number;
    baseServerState?: T;
    stateSource?: 'default' | 'server' | 'localStorage';
};
export declare function useCogsStateFn<TStateObject extends unknown, const TPlugins extends readonly CogsPlugin<any, any, any, any, any>[]>(stateObject: TStateObject, { stateKey, localStorage, formElements, reactiveDeps, reactiveType, componentId, defaultState, dependencies, serverState, }?: {
    stateKey?: string;
    componentId?: string;
    defaultState?: TStateObject;
    syncOptions?: SyncOptionsType<any>;
} & OptionsType<TStateObject>): StateObject<TStateObject, TPlugins>;
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