import { ChainMethodCallables, CogsPlugin } from './plugins';
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
export type InferArrayElement<T> = NonNullable<T> extends (infer U)[] ? U : never;
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
export type PerPathFormOptsType<TState, TPlugins extends readonly CogsPlugin<any, any, any, any, any, any, any>[] = []> = Omit<FormOptsType, 'formElements'> & {
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
export type EndType<T, TPlugins extends readonly CogsPlugin<any, any, any, any, any, any, any>[] = []> = {
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
    $setRaw: (value: T) => void;
    $sync: () => void;
    $validationWrapper: ({ children, hideMessage, }: {
        children: React.ReactNode;
        hideMessage?: boolean;
    }) => JSX.Element;
    $lastSynced?: SyncInfo;
};
export type ArrayElementState<TElement, TParentArray, TPlugins extends readonly CogsPlugin<any, any, any, any, any, any, any>[] = []> = StateObject<TElement, TPlugins> & ArrayElementExtras<TParentArray>;
export type ArrayEndType<TShape extends unknown, TPlugins extends readonly CogsPlugin<any, any, any, any, any, any, any>[]> = {
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
export type StateObject<T, TPlugins extends readonly CogsPlugin<any, any, any, any, any, any, any>[] = []> = {
    (): T;
    (newValue: T | ((prev: T) => T)): void;
} & ([NonNullable<T>] extends [any[]] ? ArrayEndType<T, TPlugins> : [NonNullable<T>] extends [Record<string, unknown> | object] ? {
    [K in keyof NonNullable<T>]-?: StateObject<NonNullable<T>[K], TPlugins>;
} : {}) & // Fallback to {} since we intersect EndType below anyway
EndType<T, TPlugins> & {
    $toggle: NonNullable<T> extends boolean ? () => void : never;
    $validate: () => {
        success: boolean;
        data?: T;
        error?: any;
    };
    $_componentId: string | null;
    $getComponents: () => ComponentsType;
    $_initialState: T;
    $updateInitialState: (newState: T | null) => {
        fetchId: (field: keyof NonNullable<T>) => string | number;
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
} & PluginChainMethodCallables<TPlugins>;
export type CogsUpdate<T extends unknown> = UpdateType<T>;
type UnionToIntersection<T> = (T extends any ? (arg: T) => void : never) extends (arg: infer I) => void ? I : never;
type PluginChainMethodCallables<TPlugins extends readonly CogsPlugin<any, any, any, any, any, any, any>[]> = UnionToIntersection<TPlugins[number] extends CogsPlugin<any, any, any, any, any, infer TMethods> ? ChainMethodCallables<TMethods> : {}>;
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
export type CreateStateOptionsType<T extends unknown = unknown, TPlugins extends readonly CogsPlugin<any, any, any, any, any, any, any>[] = []> = {
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
export type FormsElementsType<TState, TPlugins extends readonly CogsPlugin<any, any, any, any, any, any, any>[] = []> = {
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
export type PluginData = {
    plugin: CogsPlugin<any, any, any, any, any, any, any>;
    options: any;
    hookData?: any;
};
export declare const createCogsState: <State extends Record<string, unknown>, const TPlugins extends readonly CogsPlugin<string, any, any, any, any, any, any>[] = []>(initialState: State, opt?: {
    plugins?: TPlugins;
    formElements?: FormsElementsType<State, TPlugins>;
    validation?: ValidationOptionsType;
}) => {
    useCogsState: <StateKey extends keyof Prettify<State & { [K in keyof (((TPlugins[number] extends infer T ? T extends TPlugins[number] ? T extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_1 ? T_1 extends (TPlugins[number] extends infer T_2 ? T_2 extends TPlugins[number] ? T_2 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_2 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_1 extends any ? (k: T_1) => void : never : never : never) extends (k: infer I) => void ? I : never) as K extends keyof State ? never : K]: (((TPlugins[number] extends infer T_3 ? T_3 extends TPlugins[number] ? T_3 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_3 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_4 ? T_4 extends (TPlugins[number] extends infer T_5 ? T_5 extends TPlugins[number] ? T_5 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_5 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_4 extends any ? (k: T_4) => void : never : never : never) extends (k: infer I) => void ? I : never)[K]; }>>(stateKey: StateKey, options?: Prettify<OptionsType<Prettify<State & { [K in keyof (((TPlugins[number] extends infer T_3 ? T_3 extends TPlugins[number] ? T_3 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_3 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_4 ? T_4 extends (TPlugins[number] extends infer T_5 ? T_5 extends TPlugins[number] ? T_5 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_5 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_4 extends any ? (k: T_4) => void : never : never : never) extends (k: infer I) => void ? I : never) as K extends keyof State ? never : K]: (((TPlugins[number] extends infer T_6 ? T_6 extends TPlugins[number] ? T_6 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_6 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_7 ? T_7 extends (TPlugins[number] extends infer T_8 ? T_8 extends TPlugins[number] ? T_8 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_8 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_7 extends any ? (k: T_7) => void : never : never : never) extends (k: infer I) => void ? I : never)[K]; }>[StateKey], never> & { [PName in keyof { [K_1 in TPlugins[number] as K_1["name"]]?: (K_1 extends {
        useHook?: (params: {
            options: infer O;
        }) => any;
    } ? O : K_1 extends CogsPlugin<string, infer O_1, any, any, any, any, any> ? O_1 : never) | undefined; }]?: { [K_1 in TPlugins[number] as K_1["name"]]?: (K_1 extends {
        useHook?: (params: {
            options: infer O;
        }) => any;
    } ? O : K_1 extends CogsPlugin<string, infer O_1, any, any, any, any, any> ? O_1 : never) | undefined; }[PName] extends infer P ? P extends Record<string, any> ? Prettify<Partial<Pick<P, Exclude<keyof P, { [K_2 in keyof P]-?: NonNullable<P[K_2]> extends {
        __key: "keyed";
        map: any;
    } ? K_2 : never; }[keyof P]>>> & { [K_3 in { [K_2 in keyof P]-?: NonNullable<P[K_2]> extends {
        __key: "keyed";
        map: any;
    } ? K_2 : never; }[keyof P] as StateKey extends keyof NonNullable<P[K_3]>["map"] ? NonNullable<P[K_3]>["map"][StateKey] extends undefined ? never : keyof NonNullable<P[K_3]>["map"][StateKey] extends never ? never : K_3 : never]: (StateKey extends keyof NonNullable<P[K_3]>["map"] ? NonNullable<P[K_3]>["map"][StateKey] : never) extends infer T_6 ? T_6 extends (StateKey extends keyof NonNullable<P[K_3]>["map"] ? NonNullable<P[K_3]>["map"][StateKey] : never) ? T_6 extends object ? { [K_4 in keyof T_6]: T_6[K_4]; } : T_6 : never : never; }> : P : never; }>) => StateObject<Prettify<State & { [K in keyof (((TPlugins[number] extends infer T_6 ? T_6 extends TPlugins[number] ? T_6 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_6 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_7 ? T_7 extends (TPlugins[number] extends infer T_8 ? T_8 extends TPlugins[number] ? T_8 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_8 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_7 extends any ? (k: T_7) => void : never : never : never) extends (k: infer I) => void ? I : never) as K extends keyof State ? never : K]: (((TPlugins[number] extends infer T_9 ? T_9 extends TPlugins[number] ? T_9 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_9 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_10 ? T_10 extends (TPlugins[number] extends infer T_11 ? T_11 extends TPlugins[number] ? T_11 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_11 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_10 extends any ? (k: T_10) => void : never : never : never) extends (k: infer I) => void ? I : never)[K]; }>[StateKey]>;
    setCogsOptionsByKey: <StateKey extends keyof Prettify<State & { [K in keyof (((TPlugins[number] extends infer T ? T extends TPlugins[number] ? T extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_1 ? T_1 extends (TPlugins[number] extends infer T_2 ? T_2 extends TPlugins[number] ? T_2 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_2 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_1 extends any ? (k: T_1) => void : never : never : never) extends (k: infer I) => void ? I : never) as K extends keyof State ? never : K]: (((TPlugins[number] extends infer T_3 ? T_3 extends TPlugins[number] ? T_3 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_3 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_4 ? T_4 extends (TPlugins[number] extends infer T_5 ? T_5 extends TPlugins[number] ? T_5 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_5 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_4 extends any ? (k: T_4) => void : never : never : never) extends (k: infer I) => void ? I : never)[K]; }>>(stateKey: StateKey, options: CreateStateOptionsType<Prettify<State & { [K in keyof (((TPlugins[number] extends infer T_3 ? T_3 extends TPlugins[number] ? T_3 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_3 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_4 ? T_4 extends (TPlugins[number] extends infer T_5 ? T_5 extends TPlugins[number] ? T_5 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_5 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_4 extends any ? (k: T_4) => void : never : never : never) extends (k: infer I) => void ? I : never) as K extends keyof State ? never : K]: (((TPlugins[number] extends infer T_6 ? T_6 extends TPlugins[number] ? T_6 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_6 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_7 ? T_7 extends (TPlugins[number] extends infer T_8 ? T_8 extends TPlugins[number] ? T_8 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_8 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_7 extends any ? (k: T_7) => void : never : never : never) extends (k: infer I) => void ? I : never)[K]; }>[StateKey], TPlugins> & Omit<OptionsType<Prettify<State & { [K in keyof (((TPlugins[number] extends infer T_6 ? T_6 extends TPlugins[number] ? T_6 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_6 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_7 ? T_7 extends (TPlugins[number] extends infer T_8 ? T_8 extends TPlugins[number] ? T_8 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_8 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_7 extends any ? (k: T_7) => void : never : never : never) extends (k: infer I) => void ? I : never) as K extends keyof State ? never : K]: (((TPlugins[number] extends infer T_9 ? T_9 extends TPlugins[number] ? T_9 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_9 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) extends infer T_10 ? T_10 extends (TPlugins[number] extends infer T_11 ? T_11 extends TPlugins[number] ? T_11 extends CogsPlugin<string, any, any, any, any, any, infer S extends Record<string, unknown>> ? S extends Record<string, unknown> ? S : {} : T_11 extends {
        initialState?: () => infer S_1;
    } ? S_1 extends Record<string, unknown> ? S_1 : {} : {} : never : never) ? T_10 extends any ? (k: T_10) => void : never : never : never) extends (k: infer I) => void ? I : never)[K]; }>[StateKey]>, keyof CreateStateOptionsType>) => void;
    setCogsOptions: (globalOptions: CreateStateOptionsType<unknown, TPlugins> & Omit<OptionsType<unknown>, keyof CreateStateOptionsType>) => void;
};
type LocalStorageData<T> = {
    state: T;
    lastUpdated: number;
    lastSyncedWithServer?: number;
    baseServerState?: T;
    stateSource?: 'default' | 'server' | 'localStorage';
};
export declare function useCogsStateFn<TStateObject extends unknown, const TPlugins extends readonly CogsPlugin<any, any, any, any, any, any, any>[] = []>(stateObject: TStateObject, { stateKey, localStorage, formElements, reactiveDeps, reactiveType, componentId, defaultState, dependencies, serverState, }?: {
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