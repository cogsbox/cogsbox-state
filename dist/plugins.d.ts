import { z } from 'zod';
import { ReactNode, RefObject } from 'react';
import { StateObject, UpdateTypeDetail } from './CogsState';
import { ClientActivityEvent } from './pluginStore';

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
export type ChainMethodTarget = 'any' | 'array' | 'object' | 'primitive' | 'boolean';
export type ChainMethodContext<TOptions = any, THookReturn = any> = {
    stateKey: string;
    path: string[];
    pluginName: string;
    options: TOptions | undefined;
    hookData?: THookReturn;
    $get: () => any;
    $update: (payload: any) => {
        synced: () => void;
    };
    $applyOperation: (operation: any, metaData?: Record<string, any>) => void;
    getFieldMetaData: () => any;
    setFieldMetaData: (data: Record<string, any>) => void;
    removeFieldMetaData: () => void;
    getFieldRefs: () => RefObject<any>[];
    getFieldElements: () => HTMLElement[];
    setFieldDisabled: (disabled: boolean) => void;
};
export type ChainMethodHandler = (ctx: ChainMethodContext<any, any>, ...args: any[]) => any;
export type ChainMethodDefinition<THandler extends ChainMethodHandler = ChainMethodHandler> = {
    target: ChainMethodTarget;
    pathPattern?: string[];
    handler: THandler;
};
export type ChainMethodDefinitions = Record<string, ChainMethodDefinition<any>>;
type ChainMethodCallable<THandler> = THandler extends (ctx: any, ...args: infer TArgs) => infer TReturn ? (...args: TArgs) => TReturn : never;
export type ChainMethodCallables<TMethods> = {
    [K in keyof TMethods as K extends string ? `$${K}` : never]: TMethods[K] extends ChainMethodDefinition<infer TFn> ? ChainMethodCallable<TFn> : never;
};
export type KeyedTypes<TMap extends Record<string, any>> = {
    __key: 'keyed';
    map: TMap;
};
export declare const keyedSchema: <TMap extends Record<string, any>>() => z.ZodType<KeyedTypes<TMap>>;
type InferZodObject<T extends Record<string, z.ZodTypeAny>> = {
    [K in keyof T]: z.infer<T[K]>;
};
export type InferPerKeyValueMap<TMap extends Record<string, Record<string, z.ZodTypeAny>>> = {
    [K in keyof TMap]: InferZodObject<TMap[K]>;
};
type DeconstructedCogsMethods<TStateSlice = any> = {
    initialiseState: (data: TStateSlice) => void;
    initialiseShadowState: (data: any) => void;
    applyOperation: (patch: any, meta?: {
        dontUpdate?: boolean;
    }) => void;
    addZodErrors: (errors: any[]) => void;
    clearZodErrors: (paths: string[][]) => void;
    getState: () => TStateSlice;
    setOptions: (options: any) => void;
};
export declare function toDeconstructedMethods(stateHandler: StateObject<any>): {
    initialiseState: (data: any) => void;
    initialiseShadowState: (data: any) => void;
    applyOperation: (patch: any, meta?: {
        dontUpdate?: boolean;
    }) => void;
    addZodErrors: (errors: any[]) => void;
    clearZodErrors: (paths: string[][]) => void;
    getState: () => any;
    setOptions: (opts: any) => void;
};
type ScopedMetadataMethods<TFieldMetaData> = {
    getFieldMetaData: () => TFieldMetaData | undefined;
    setFieldMetaData: (data: Partial<TFieldMetaData>) => void;
    removeFieldMetaData: () => void;
    getFieldRefs: () => RefObject<any>[];
    getFieldElements: () => HTMLElement[];
    setFieldDisabled: (disabled: boolean) => void;
};
type GlobalMetadataMethods<TFieldMetaData> = {
    getFieldMetaData: (path: string[]) => TFieldMetaData | undefined;
    setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) => void;
    removeFieldMetaData: (path: string[]) => void;
    getFieldRefs: (path: string[]) => RefObject<any>[];
    getFieldElements: (path: string[]) => HTMLElement[];
    setFieldDisabled: (path: string[], disabled: boolean) => void;
    getAllFieldElements: () => HTMLElement[];
    setAllFieldsDisabled: (disabled: boolean) => void;
};
export type UseHookParams<TOptions, TPluginMetaData, TFieldMetaData, TStateSlice = any> = DeconstructedCogsMethods<TStateSlice> & GlobalMetadataMethods<TFieldMetaData> & {
    stateKey: string;
    getPluginMetaData: () => TPluginMetaData | undefined;
    setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
    removePluginMetaData: () => void;
    options: TOptions;
    pluginName: string;
    isInitialMount: boolean;
};
export type TransformStateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, TStateSlice = any> = DeconstructedCogsMethods<TStateSlice> & GlobalMetadataMethods<TFieldMetaData> & {
    stateKey: string;
    getPluginMetaData: () => TPluginMetaData | undefined;
    setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
    removePluginMetaData: () => void;
    options: TOptions;
    hookData?: THookReturn;
    previousState?: TStateSlice;
    isInitialTransform: boolean;
    pluginName: string;
};
export type OnUpdateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, TStateSlice = any> = DeconstructedCogsMethods<TStateSlice> & ScopedMetadataMethods<TFieldMetaData> & {
    stateKey: string;
    getPluginMetaData: () => TPluginMetaData | undefined;
    setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
    removePluginMetaData: () => void;
    update: UpdateTypeDetail;
    path?: string[];
    options: TOptions;
    hookData?: THookReturn;
    previousValue?: any;
    nextValue?: any;
    updateSource?: 'user' | 'plugin' | 'system';
    pluginName: string;
};
export type OnFormUpdateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, TStateSlice = any> = DeconstructedCogsMethods<TStateSlice> & ScopedMetadataMethods<TFieldMetaData> & {
    stateKey: string;
    getPluginMetaData: () => TPluginMetaData | undefined;
    setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
    removePluginMetaData: () => void;
    path: string[];
    event: ClientActivityEvent;
    options: TOptions;
    hookData?: THookReturn;
    formState?: 'pristine' | 'dirty' | 'submitting' | 'submitted';
    pluginName: string;
};
export type FormWrapperParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, TStateSlice = any> = ScopedMetadataMethods<TFieldMetaData> & {
    element: ReactNode;
    path: string[];
    stateKey: string;
    options: TOptions;
    hookData?: THookReturn;
    fieldType?: string;
    wrapperDepth?: number;
    initialiseState: (data: TStateSlice) => void;
    initialiseShadowState: (data: any) => void;
    applyOperation: (patch: any, meta?: {
        dontUpdate?: boolean;
    }) => void;
    addZodErrors: (errors: any[]) => void;
    getState: () => TStateSlice;
    setOptions: (options: any) => void;
    getPluginMetaData: () => TPluginMetaData | undefined;
    setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
    removePluginMetaData: () => void;
    pluginName: string;
};
export type CogsPlugin<TName extends string, TOptions, THookReturn, TPluginMetaData, TFieldMetaData, TChainMethods extends ChainMethodDefinitions = {}, TInitialState extends Record<string, unknown> = {}> = {
    name: TName;
    initialState?: () => TInitialState;
    useHook?: (params: UseHookParams<TOptions, TPluginMetaData, TFieldMetaData, any>) => THookReturn;
    transformState?: (params: TransformStateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => void;
    onUpdate?: (params: OnUpdateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => void;
    onFormUpdate?: (params: OnFormUpdateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => void;
    formWrapper?: (params: FormWrapperParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => ReactNode;
    chainMethods?: TChainMethods;
};
export declare function createMetadataContext<TPluginMetaData, TFieldMetaData>(stateKey: string, pluginName: string): {
    getPluginMetaData: () => TPluginMetaData | undefined;
    setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
    removePluginMetaData: () => void;
    getFieldMetaData: (path: string[]) => TFieldMetaData | undefined;
    setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) => void;
    removeFieldMetaData: (path: string[]) => void;
    getFieldRefs: (path: string[]) => RefObject<any>[];
    getFieldElements: (path: string[]) => HTMLElement[];
    setFieldDisabled: (path: string[], disabled: boolean) => void;
    getAllFieldElements: () => HTMLElement[];
    setAllFieldsDisabled: (disabled: boolean) => void;
};
export declare function createScopedMetadataContext<TPluginMetaData, TFieldMetaData>(stateKey: string, pluginName: string, path: string[]): {
    getFieldMetaData: () => TFieldMetaData | undefined;
    setFieldMetaData: (data: Partial<TFieldMetaData>) => void;
    removeFieldMetaData: () => void;
    getFieldRefs: () => RefObject<any>[];
    getFieldElements: () => HTMLElement[];
    setFieldDisabled: (disabled: boolean) => void;
    getPluginMetaData: () => TPluginMetaData | undefined;
    setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
    removePluginMetaData: () => void;
    getAllFieldElements: () => HTMLElement[];
    setAllFieldsDisabled: (disabled: boolean) => void;
};
export type ScopedMetadataContext<TFieldMetaData = any> = {
    getFieldMetaData: () => TFieldMetaData | undefined;
    setFieldMetaData: (data: Partial<TFieldMetaData>) => void;
    removeFieldMetaData: () => void;
};
export type PluginApiEntry<THookData = any, TFieldMetaData = any> = {
    hookData: THookData | undefined;
} & ScopedMetadataContext<TFieldMetaData>;
export type PluginsApi = Record<string, PluginApiEntry>;
type ZodObjOutput<T extends z.ZodObject<any>> = {
    [K in keyof T['shape']]: z.output<T['shape'][K]>;
};
type OutputOf<T extends z.ZodTypeAny> = T extends z.ZodObject<any> ? Prettify<ZodObjOutput<T>> : z.output<T>;
type MethodFactory = <TArgs extends any[], TReturn>(handler: (ctx: ChainMethodContext<any, any>, ...args: TArgs) => TReturn) => ChainMethodDefinition<(ctx: ChainMethodContext<any, any>, ...args: TArgs) => TReturn>;
type PathMethodFactory = MethodFactory & {
    array: MethodFactory;
    object: MethodFactory;
    primitive: MethodFactory;
    boolean: MethodFactory;
    field: MethodFactory;
};
type MethodsBuilderParams = {
    path: (selector: (state: any) => any) => PathMethodFactory;
    array: MethodFactory;
    object: MethodFactory;
    primitive: MethodFactory;
    boolean: MethodFactory;
    field: MethodFactory;
};
export type PluginTransformFn<TOptions, THookReturn, TPluginMetaData, TFieldMetaData> = (params: TransformStateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => void;
export type PluginUpdateFn<TOptions, THookReturn, TPluginMetaData, TFieldMetaData> = (params: OnUpdateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => void;
export type PluginFormUpdateFn<TOptions, THookReturn, TPluginMetaData, TFieldMetaData> = (params: OnFormUpdateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => void;
export type PluginFormWrapperFn<TOptions, THookReturn, TPluginMetaData, TFieldMetaData> = (params: FormWrapperParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => ReactNode;
export type CogsPluginBuilder<TName extends string, TOptions, TPluginMetaData, TFieldMetaData, THookReturn, TChainMethods extends ChainMethodDefinitions, HasTransform extends boolean, HasUpdate extends boolean, HasFormUpdate extends boolean, HasMethods extends boolean, HasWrapper extends boolean, HasInitialState extends boolean, TInitialState extends Record<string, unknown> = {}> = Prettify<CogsPlugin<TName, TOptions, THookReturn, TPluginMetaData, TFieldMetaData, TChainMethods, TInitialState>> & (HasTransform extends true ? {} : {
    transformState(fn: PluginTransformFn<TOptions, THookReturn, TPluginMetaData, TFieldMetaData>): CogsPluginBuilder<TName, TOptions, TPluginMetaData, TFieldMetaData, THookReturn, TChainMethods, true, HasUpdate, HasFormUpdate, HasMethods, HasWrapper, HasInitialState, TInitialState>;
}) & (HasUpdate extends true ? {} : {
    onUpdate(fn: PluginUpdateFn<TOptions, THookReturn, TPluginMetaData, TFieldMetaData>): CogsPluginBuilder<TName, TOptions, TPluginMetaData, TFieldMetaData, THookReturn, TChainMethods, HasTransform, true, HasFormUpdate, HasMethods, HasWrapper, HasInitialState, TInitialState>;
}) & (HasFormUpdate extends true ? {} : {
    onFormUpdate(fn: PluginFormUpdateFn<TOptions, THookReturn, TPluginMetaData, TFieldMetaData>): CogsPluginBuilder<TName, TOptions, TPluginMetaData, TFieldMetaData, THookReturn, TChainMethods, HasTransform, HasUpdate, true, HasMethods, HasWrapper, HasInitialState, TInitialState>;
}) & (HasMethods extends true ? {} : {
    methods<TNextMethods extends ChainMethodDefinitions>(fn: (helpers: MethodsBuilderParams) => TNextMethods): CogsPluginBuilder<TName, TOptions, TPluginMetaData, TFieldMetaData, THookReturn, TNextMethods, HasTransform, HasUpdate, HasFormUpdate, true, HasWrapper, HasInitialState, TInitialState>;
}) & (HasWrapper extends true ? {} : {
    formWrapper(fn: PluginFormWrapperFn<TOptions, THookReturn, TPluginMetaData, TFieldMetaData>): CogsPluginBuilder<TName, TOptions, TPluginMetaData, TFieldMetaData, THookReturn, TChainMethods, HasTransform, HasUpdate, HasFormUpdate, HasMethods, true, HasInitialState, TInitialState>;
}) & (HasInitialState extends true ? {} : {
    initialState<TNewState extends Record<string, unknown>>(fn: () => TNewState): CogsPluginBuilder<TName, TOptions, TPluginMetaData, TFieldMetaData, THookReturn, TChainMethods, HasTransform, HasUpdate, HasFormUpdate, HasMethods, HasWrapper, true, TNewState>;
});
export type CreatePluginStart<TName extends string, TOptions, TPluginMetaData, TFieldMetaData> = CogsPluginBuilder<TName, TOptions, TPluginMetaData, TFieldMetaData, never, {}, false, false, false, false, false, false, {}> & {
    useHook<THookReturn>(hookFn: (params: UseHookParams<TOptions, TPluginMetaData, TFieldMetaData, any>) => THookReturn): CogsPluginBuilder<TName, TOptions, TPluginMetaData, TFieldMetaData, THookReturn, {}, false, false, false, false, false, false, {}>;
    initialState<TNewState extends Record<string, unknown>>(fn: () => TNewState): CogsPluginBuilder<TName, TOptions, TPluginMetaData, TFieldMetaData, never, {}, false, false, false, false, false, true, TNewState>;
};
export declare function createPluginContext<O extends z.ZodTypeAny | undefined = undefined, PM extends z.ZodTypeAny | undefined = undefined, FM extends z.ZodTypeAny | undefined = undefined>(schemas?: {
    options?: O;
    pluginMetaData?: PM;
    fieldMetaData?: FM;
}): {
    createPlugin: <TName extends string>(name: TName) => CreatePluginStart<TName, O extends z.ZodTypeAny ? OutputOf<O> : undefined, PM extends z.ZodTypeAny ? OutputOf<PM> : unknown, FM extends z.ZodTypeAny ? OutputOf<FM> : unknown>;
};
export {};
//# sourceMappingURL=plugins.d.ts.map