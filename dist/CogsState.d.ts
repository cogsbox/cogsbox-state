import { ChainMethodCallables, CogsPlugin } from './plugins';
import { ChangeEvent, FocusEvent, JSX, ReactNode, RefObject } from 'react';
import { GenericObject } from './utility.js';
import { ValidationError, ValidationSeverity, ValidationStatus, ComponentsType } from './store.js';
import { ZodType } from 'zod/v4';

import * as z3 from 'zod/v3';
export type Prettify<T> = T extends any ? {
    [K in keyof T]: T[K];
} : never;
export type ValidationFieldSummary = {
    status: ValidationStatus;
    severity: ValidationSeverity;
    hasErrors: boolean;
    hasWarnings: boolean;
    message: string;
    errors: string[];
    warnings: string[];
    allErrors: Array<ValidationError & {
        path: string[];
    }>;
    path: string[];
    getData: () => unknown;
};
type ValidationSummaryArray = ValidationFieldSummary[];
export type FormElementParams<T> = StateObject<T> & {
    $inputProps: {
        ref?: RefObject<any>;
        value?: T extends boolean ? never : T;
        onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
        onBlur?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    };
    status: ValidationStatus;
    severity: ValidationSeverity;
    hasErrors: boolean;
    hasWarnings: boolean;
    allErrors: ValidationError[];
    message: string;
    getData: () => T;
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
    $clearZodValidationPaths: (paths: string[][]) => void;
    $clearValidation: (paths?: string[]) => void;
    $applyOperation: (operation: UpdateTypeDetail, metaData?: Record<string, any>) => void;
    $applyJsonPatch: (patches: any[]) => void;
    $update: UpdateType<T>;
    $_path: string[];
    $_stateKey: string;
    $isolate: {
        (renderFn: (state: StateObject<T, TPlugins>) => ReactNode): JSX.Element;
        (dependencies: any[], renderFn: (state: StateObject<T, TPlugins>) => ReactNode): JSX.Element;
    };
    $formElement: (control: FormControl<T>, opts?: PerPathFormOptsType<T, TPlugins>) => JSX.Element;
    $get: () => T;
    $$get: () => T;
    $$derive: <R>(fn: EffectFunction<T, R>) => R;
    $showValidationErrors: () => string[];
    $validationErrors: {
        (): ValidationSummaryArray;
        <K extends Extract<keyof NonNullable<T>, string>>(keys: readonly K[]): ValidationSummaryArray;
    };
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
    $validationWrapper: ({ children, hideMessage, }: {
        children: ReactNode;
        hideMessage?: boolean;
    }) => JSX.Element;
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
    $validate: {
        (): {
            success: boolean;
            data?: T;
            error?: any;
        };
        <K extends Extract<keyof NonNullable<T>, string>>(keys: readonly K[]): {
            success: boolean;
            results: Array<{
                key: K;
                path: string[];
                success: boolean;
                data?: unknown;
                error?: any;
            }>;
        };
    };
    $_componentId: string | null;
    $getComponents: () => ComponentsType;
    $_initialState: T;
    $updateInitialState: (newState: T | null) => {
        fetchId: (field: keyof NonNullable<T>) => string | number;
    };
    $initializeAndMergeShadowState: (newState: any | null) => void;
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
export type CreateStateOptionsType<T extends unknown = unknown, TPlugins extends readonly CogsPlugin<any, any, any, any, any, any, any>[] = []> = {
    formElements?: FormsElementsType<T, TPlugins>;
    validation?: ValidationOptionsType;
    plugins?: TPlugins;
};
export type OptionsType<T extends unknown = unknown, TApiParams = never> = CreateStateOptionsType & {
    log?: boolean;
    componentId?: string;
    middleware?: ({ update }: {
        update: UpdateTypeDetail;
    }) => void;
    localStorage?: {
        key: string | ((state: T) => string);
        onChange?: (state: T) => void;
    };
    reactiveDeps?: (state: T) => any[] | true;
    reactiveType?: ReactivityType;
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
        children: ReactNode;
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
    }) => ReactNode;
    syncRender?: (options: {
        children: ReactNode;
        time: number;
        data?: TState;
        key?: string;
    }) => ReactNode;
};
export type PluginData = {
    plugin: CogsPlugin<any, any, any, any, any, any, any>;
    options: any;
    hookData?: any;
};
type AnyCogsPlugin = CogsPlugin<string, any, any, any, any, any, any>;
type ExtractPluginOptions<T> = T extends {
    useHook?: (params: {
        options: infer O;
    }) => any;
} ? O : T extends CogsPlugin<string, infer O, any, any, any, any, any> ? O : never;
type PluginOptionsMap<TPlugins extends readonly AnyCogsPlugin[]> = {
    [K in TPlugins[number] as K['name']]?: ExtractPluginOptions<K>;
};
type ExtractPluginState<T> = T extends {
    initialState?: () => infer S;
} ? S extends object ? S : {} : T extends CogsPlugin<string, any, any, any, any, any, infer S> ? S extends object ? S : {} : {};
type PluginStates<TPlugins extends readonly AnyCogsPlugin[]> = UnionToIntersection<ExtractPluginState<TPlugins[number]>> extends infer S ? S extends object ? S : {} : {};
type KnownKeys<T> = string extends keyof T ? never : number extends keyof T ? never : symbol extends keyof T ? never : keyof T;
type MergeInitialState<State extends object, PluginState extends object> = Prettify<State & {
    [K in keyof PluginState as K extends KnownKeys<State> ? never : K]: PluginState[K];
}>;
type CogsFullState<State extends object, TPlugins extends readonly AnyCogsPlugin[]> = MergeInitialState<State, PluginStates<TPlugins>>;
type CleanIntersection<T> = T extends object ? {
    [K in keyof T]: T[K];
} : T;
type KeyedKeys<P> = {
    [K in keyof P]-?: NonNullable<P[K]> extends {
        __key: 'keyed';
        map: any;
    } ? K : never;
}[keyof P];
type PluginOptionEntry<P, StateKey extends PropertyKey> = P extends undefined ? never : P extends Record<string, any> ? Prettify<Partial<Pick<P, Exclude<keyof P, KeyedKeys<P>>>> & {
    [K in KeyedKeys<P> as StateKey extends keyof NonNullable<P[K]>['map'] ? NonNullable<P[K]>['map'][StateKey] extends undefined ? never : keyof NonNullable<P[K]>['map'][StateKey] extends never ? never : K : never]: CleanIntersection<StateKey extends keyof NonNullable<P[K]>['map'] ? NonNullable<P[K]>['map'][StateKey] : never>;
}> : P extends object ? Partial<P> extends P ? Partial<P> : P : P;
type PluginOptionsForState<PluginOptions, StateKey extends PropertyKey> = {
    [PName in keyof PluginOptions as PluginOptions[PName] extends undefined ? never : PName]?: PluginOptionEntry<PluginOptions[PName], StateKey>;
};
type UseCogsStateOptions<StateSlice, PluginOptions, StateKey extends PropertyKey> = Prettify<OptionsType<StateSlice, never> & PluginOptionsForState<PluginOptions, StateKey>>;
type CreateCogsStateReturn<State extends object, TPlugins extends readonly AnyCogsPlugin[]> = {
    useCogsState: <StateKey extends keyof CogsFullState<State, TPlugins>>(stateKey: StateKey, options?: UseCogsStateOptions<CogsFullState<State, TPlugins>[StateKey], PluginOptionsMap<TPlugins>, StateKey>) => StateObject<CogsFullState<State, TPlugins>[StateKey], TPlugins>;
    setCogsOptionsByKey: <StateKey extends keyof CogsFullState<State, TPlugins>>(stateKey: StateKey, options: CreateStateOptionsType<CogsFullState<State, TPlugins>[StateKey], TPlugins> & Omit<OptionsType<CogsFullState<State, TPlugins>[StateKey]>, keyof CreateStateOptionsType>) => void;
    setCogsOptions: (globalOptions: CreateStateOptionsType<unknown, TPlugins> & Omit<OptionsType<unknown>, keyof CreateStateOptionsType>) => void;
};
export declare const createCogsState: <State extends object, const TPlugins extends readonly CogsPlugin<string, any, any, any, any, any, any>[] = []>(initialState: State, opt?: {
    plugins?: TPlugins;
    formElements?: FormsElementsType<State, TPlugins>;
    validation?: ValidationOptionsType;
}) => CreateCogsStateReturn<State, TPlugins>;
type LocalStorageData<T> = {
    state: T;
    lastUpdated: number;
    lastSyncedWithServer?: number;
};
export declare function useCogsStateFn<TStateObject extends unknown, const TPlugins extends readonly CogsPlugin<any, any, any, any, any, any, any>[] = []>(stateObject: TStateObject, { stateKey, localStorage, formElements, reactiveDeps, reactiveType, componentId, defaultState, dependencies, }?: {
    stateKey?: string;
    componentId?: string;
    defaultState?: TStateObject;
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