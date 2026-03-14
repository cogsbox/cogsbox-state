import { z } from 'zod';
import { default as React, RefObject } from 'react';
import { StateObject, UpdateTypeDetail } from './CogsState';
import { ClientActivityEvent } from './pluginStore';

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
export type KeyedTypes<TMap extends Record<string, any>> = {
    __key: 'keyed';
    map: {
        [K in keyof TMap]: TMap[K];
    };
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
    element: React.ReactNode;
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
export type CogsPlugin<TName extends string, TOptions, THookReturn, TPluginMetaData, TFieldMetaData> = {
    name: TName;
    useHook?: (params: UseHookParams<TOptions, TPluginMetaData, TFieldMetaData, any>) => THookReturn;
    transformState?: (params: TransformStateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => void;
    onUpdate?: (params: OnUpdateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => void;
    onFormUpdate?: (params: OnFormUpdateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => void;
    formWrapper?: (params: FormWrapperParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData, any>) => React.ReactNode;
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
export declare function createPluginContext<O extends z.ZodTypeAny, PM extends z.ZodTypeAny | undefined = undefined, FM extends z.ZodTypeAny | undefined = undefined>(schemas: {
    options: O;
    pluginMetaData?: PM;
    fieldMetaData?: FM;
}): {
    createPlugin: <TName extends string>(name: TName) => {
        name: TName;
        useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
        transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
        onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
        onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
        formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
    } & {
        transformState(fn: (params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
            name: TName;
            useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
            transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
        } & {
            onUpdate(fn: (params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
            } & {
                onFormUpdate(fn: (params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                };
            };
        } & {
            onFormUpdate(fn: (params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
            } & {
                onUpdate(fn: (params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                };
            };
        };
    } & {
        onUpdate(fn: (params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
            name: TName;
            useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
            transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
        } & {
            transformState(fn: (params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
            } & {
                onFormUpdate(fn: (params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                };
            };
        } & {
            onFormUpdate(fn: (params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                };
            };
        };
    } & {
        onFormUpdate(fn: (params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
            name: TName;
            useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
            transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
        } & {
            transformState(fn: (params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
            } & {
                onUpdate(fn: (params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                };
            };
        } & {
            onUpdate(fn: (params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, never, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                };
            };
        };
    } & {
        useHook<THookReturn>(hookFn: (params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown>) => THookReturn): {
            name: TName;
            useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
            transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
            formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
        } & {
            transformState(fn: (params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
            } & {
                onUpdate(fn: (params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                } & {
                    onFormUpdate(fn: (params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                onFormUpdate(fn: (params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            onUpdate(fn: (params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                } & {
                    onFormUpdate(fn: (params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                onFormUpdate(fn: (params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            onFormUpdate(fn: (params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                onUpdate(fn: (params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<OutputOf<O>, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<OutputOf<O>, THookReturn, PM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<PM> : unknown, FM extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>> ? OutputOf<FM> : unknown, any>) => React.ReactNode) | undefined;
                    };
                };
            };
        };
    };
};
export {};
//# sourceMappingURL=plugins.d.ts.map