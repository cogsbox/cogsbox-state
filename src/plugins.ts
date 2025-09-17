import { z } from 'zod';
import type React from 'react';
import { StateObject, UpdateTypeDetail } from './CogsState';
import { getGlobalStore } from './store';

type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type KeyedTypes<TMap extends Record<string, any>> = {
  __key: 'keyed';
  map: { [K in keyof TMap]: TMap[K] };
};

export const keyedSchema = <TMap extends Record<string, any>>() =>
  z.object({
    __key: z.literal('keyed'),
    map: z.any(),
  }) as z.ZodType<KeyedTypes<TMap>>;

// Helpers: turn a zod object shape into its inferred value shape
type InferZodObject<T extends Record<string, z.ZodTypeAny>> = {
  [K in keyof T]: z.infer<T[K]>;
};
export type InferPerKeyValueMap<
  TMap extends Record<string, Record<string, z.ZodTypeAny>>,
> = {
  [K in keyof TMap]: InferZodObject<TMap[K]>;
};

// Deconstructed cogs methods (no TState)
type DeconstructedCogsMethods<TStateSlice = any> = {
  initialiseState: (data: TStateSlice) => void;
  applyOperation: (patch: any, meta?: { dontUpdate?: boolean }) => void;
  addZodErrors: (errors: any[]) => void;
  getState: () => TStateSlice;
  setOptions: (options: any) => void;
};

export function toDeconstructedMethods(stateHandler: StateObject<any>) {
  return {
    initialiseState: (data: any) => {
      stateHandler.$initializeAndMergeShadowState(data);
    },
    applyOperation: (patch: any, meta?: { dontUpdate?: boolean }) =>
      stateHandler.$applyOperation(patch, meta),
    addZodErrors: (errors: any[]) => stateHandler.$addZodValidation(errors),
    getState: () => stateHandler.$get(),
    setOptions: (opts: any) => {
      stateHandler.$setOptions(opts);
    },
  };
}

// Simplified: All params use the same TFieldMetaData type
export type UseHookParams<
  TOptions,
  TPluginMetaData,
  TFieldMetaData,
  TStateSlice = any,
> = DeconstructedCogsMethods<TStateSlice> & {
  stateKey: string;

  getPluginMetaData: () => TPluginMetaData | undefined;
  setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
  removePluginMetaData: () => void;

  getFieldMetaData: (path: string[]) => TFieldMetaData | undefined;
  setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) => void;
  removeFieldMetaData: (path: string[]) => void;

  options: TOptions;
  pluginName: string;
  isInitialMount: boolean;
};

export type TransformStateParams<
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
  TStateSlice = any,
> = DeconstructedCogsMethods<TStateSlice> & {
  stateKey: string;

  getPluginMetaData: () => TPluginMetaData | undefined;
  setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
  removePluginMetaData: () => void;

  getFieldMetaData: (path: string[]) => TFieldMetaData | undefined;
  setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) => void;
  removeFieldMetaData: (path: string[]) => void;

  options: TOptions;
  hookData?: THookReturn;
  previousState?: TStateSlice;
  isInitialTransform: boolean;
  pluginName: string;
};

export type OnUpdateParams<
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
  TStateSlice = any,
> = DeconstructedCogsMethods<TStateSlice> & {
  stateKey: string;

  getPluginMetaData: () => TPluginMetaData | undefined;
  setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
  removePluginMetaData: () => void;

  getFieldMetaData: (path: string[]) => TFieldMetaData | undefined;
  setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) => void;
  removeFieldMetaData: (path: string[]) => void;

  update: UpdateTypeDetail;
  path?: string[];

  options: TOptions;
  hookData?: THookReturn;

  previousValue?: any;
  nextValue?: any;
  updateSource?: 'user' | 'plugin' | 'system';

  pluginName: string;
};

export type OnFormUpdateParams<
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
  TStateSlice = any,
> = DeconstructedCogsMethods<TStateSlice> & {
  stateKey: string;

  getPluginMetaData: () => TPluginMetaData | undefined;
  setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
  removePluginMetaData: () => void;

  getFieldMetaData: (path: string[]) => TFieldMetaData | undefined;
  setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) => void;
  removeFieldMetaData: (path: string[]) => void;

  path: string[];
  event: {
    type: 'focus' | 'blur' | 'input';
    value?: any;
    path: string[];
  };

  options: TOptions;
  hookData?: THookReturn;

  formState?: 'pristine' | 'dirty' | 'submitting' | 'submitted';
  pluginName: string;
};

export type FormWrapperParams<
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
  TStateSlice = any,
> = {
  element: React.ReactNode;
  path: string[];
  stateKey: string;
  options: TOptions;
  hookData?: THookReturn;
  fieldType?: string;
  wrapperDepth?: number;

  // Deconstructed methods
  initialiseState: (data: TStateSlice) => void;
  applyOperation: (patch: any, meta?: { dontUpdate?: boolean }) => void;
  addZodErrors: (errors: any[]) => void;
  getState: () => TStateSlice;
  setOptions: (options: any) => void;

  getPluginMetaData: () => TPluginMetaData | undefined;
  setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
  removePluginMetaData: () => void;

  getFieldMetaData: (path: string[]) => TFieldMetaData | undefined;
  setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) => void;
  removeFieldMetaData: (path: string[]) => void;

  pluginName: string;
};

// Unified plugin definition
export type CogsPlugin<
  TName extends string,
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
> = {
  name: TName;

  useHook?: (
    params: UseHookParams<TOptions, TPluginMetaData, TFieldMetaData, any>
  ) => THookReturn;

  transformState?: (
    params: TransformStateParams<
      TOptions,
      THookReturn,
      TPluginMetaData,
      TFieldMetaData,
      any
    >
  ) => void;

  onUpdate?: (
    params: OnUpdateParams<
      TOptions,
      THookReturn,
      TPluginMetaData,
      TFieldMetaData,
      any
    >
  ) => void;

  onFormUpdate?: (
    params: OnFormUpdateParams<
      TOptions,
      THookReturn,
      TPluginMetaData,
      TFieldMetaData,
      any
    >
  ) => void;

  formWrapper?: (
    params: FormWrapperParams<
      TOptions,
      THookReturn,
      TPluginMetaData,
      TFieldMetaData,
      any
    >
  ) => React.ReactNode;
};

// Extract plugin options helper
export type ExtractPluginOptions<
  TPlugins extends readonly CogsPlugin<any, any, any, any, any>[],
> = {
  [P in TPlugins[number] as P['name']]?: P extends CogsPlugin<
    any,
    infer O,
    any,
    any,
    any
  >
    ? O
    : never;
};

// Metadata helpers
export function createMetadataContext<TPluginMetaData, TFieldMetaData>(
  stateKey: string,
  pluginName: string
) {
  return {
    getPluginMetaData: (): TPluginMetaData | undefined =>
      getGlobalStore
        .getState()
        .getPluginMetaDataMap(stateKey, [])
        ?.get(pluginName) as TPluginMetaData | undefined,

    setPluginMetaData: (data: Partial<TPluginMetaData>) =>
      getGlobalStore
        .getState()
        .setPluginMetaData(stateKey, [], pluginName, data),

    removePluginMetaData: () =>
      getGlobalStore.getState().removePluginMetaData(stateKey, [], pluginName),

    getFieldMetaData: (path: string[]): TFieldMetaData | undefined =>
      getGlobalStore
        .getState()
        .getPluginMetaDataMap(stateKey, path)
        ?.get(pluginName) as TFieldMetaData | undefined,

    setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) =>
      getGlobalStore
        .getState()
        .setPluginMetaData(stateKey, path, pluginName, data),

    removeFieldMetaData: (path: string[]) =>
      getGlobalStore
        .getState()
        .removePluginMetaData(stateKey, path, pluginName),
  };
}

type ZodObjOutput<T extends z.ZodObject<any>> = {
  [K in keyof T['shape']]: z.output<T['shape'][K]>;
};
type OutputOf<T extends z.ZodTypeAny> =
  T extends z.ZodObject<any> ? ZodObjOutput<T> : z.output<T>;

export function createPluginContext<
  O extends z.ZodTypeAny,
  PM extends z.ZodTypeAny | undefined = undefined,
  FM extends z.ZodTypeAny | undefined = undefined,
>(schemas: { options: O; pluginMetaData?: PM; fieldMetaData?: FM }) {
  // Crucial: compute from the generic params, not from an object-indexed optional type
  type Options = OutputOf<O>;
  type PluginMetaData = PM extends z.ZodTypeAny ? OutputOf<PM> : unknown;
  type FieldMetaData = FM extends z.ZodTypeAny ? OutputOf<FM> : unknown;

  function createPlugin<TName extends string>(name: TName) {
    type TransformFn<THookReturn> = (
      params: TransformStateParams<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >
    ) => void;

    type UpdateFn<THookReturn> = (
      params: OnUpdateParams<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >
    ) => void;

    type FormUpdateFn<THookReturn> = (
      params: OnFormUpdateParams<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >
    ) => void;

    type FormWrapperFn<THookReturn> = (
      params: FormWrapperParams<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >
    ) => React.ReactNode;

    type Plugin<THookReturn> = Prettify<
      CogsPlugin<TName, Options, THookReturn, PluginMetaData, FieldMetaData>
    >;

    const createPluginObject = <THookReturn = never>(
      hookFn?: (
        params: UseHookParams<Options, PluginMetaData, FieldMetaData>
      ) => THookReturn,
      transformFn?: TransformFn<THookReturn>,
      updateHandler?: UpdateFn<THookReturn>,
      formUpdateHandler?: FormUpdateFn<THookReturn>,
      formWrapper?: FormWrapperFn<THookReturn>
    ): Plugin<THookReturn> => {
      return {
        name,
        useHook: hookFn as any,
        transformState: transformFn as any,
        onUpdate: updateHandler as any,
        onFormUpdate: formUpdateHandler as any,
        formWrapper: formWrapper as any,
      };
    };

    type BuildRet<
      THookReturn,
      HasTransform extends boolean,
      HasUpdate extends boolean,
      HasFormUpdate extends boolean,
      HasWrapper extends boolean,
    > = Plugin<THookReturn> &
      (HasTransform extends true
        ? {}
        : {
            transformState(
              fn: TransformFn<THookReturn>
            ): BuildRet<
              THookReturn,
              true,
              HasUpdate,
              HasFormUpdate,
              HasWrapper
            >;
          }) &
      (HasUpdate extends true
        ? {}
        : {
            onUpdate(
              fn: UpdateFn<THookReturn>
            ): BuildRet<
              THookReturn,
              HasTransform,
              true,
              HasFormUpdate,
              HasWrapper
            >;
          }) &
      (HasFormUpdate extends true
        ? {}
        : {
            onFormUpdate(
              fn: FormUpdateFn<THookReturn>
            ): BuildRet<THookReturn, HasTransform, HasUpdate, true, HasWrapper>;
          }) &
      (HasWrapper extends true
        ? {}
        : {
            formWrapper(
              fn: FormWrapperFn<THookReturn>
            ): BuildRet<
              THookReturn,
              HasTransform,
              HasUpdate,
              HasFormUpdate,
              true
            >;
          });

    function createBuilder<
      THookReturn = never,
      HasTransform extends boolean = false,
      HasUpdate extends boolean = false,
      HasFormUpdate extends boolean = false,
      HasWrapper extends boolean = false,
    >(
      hookFn?: (
        params: UseHookParams<Options, PluginMetaData, FieldMetaData>
      ) => THookReturn,
      transformFn?: TransformFn<THookReturn>,
      updateHandler?: UpdateFn<THookReturn>,
      formUpdateHandler?: FormUpdateFn<THookReturn>,
      formWrapper?: FormWrapperFn<THookReturn>
    ): BuildRet<
      THookReturn,
      HasTransform,
      HasUpdate,
      HasFormUpdate,
      HasWrapper
    > {
      const plugin = createPluginObject<THookReturn>(
        hookFn,
        transformFn,
        updateHandler,
        formUpdateHandler,
        formWrapper
      );

      const methods = {} as Partial<
        BuildRet<
          THookReturn,
          HasTransform,
          HasUpdate,
          HasFormUpdate,
          HasWrapper
        >
      >;

      if (!transformFn) {
        (methods as any).transformState = (fn: TransformFn<THookReturn>) =>
          createBuilder<
            THookReturn,
            true,
            HasUpdate,
            HasFormUpdate,
            HasWrapper
          >(hookFn, fn, updateHandler, formUpdateHandler, formWrapper);
      }
      if (!updateHandler) {
        (methods as any).onUpdate = (fn: UpdateFn<THookReturn>) =>
          createBuilder<
            THookReturn,
            HasTransform,
            true,
            HasFormUpdate,
            HasWrapper
          >(hookFn, transformFn, fn, formUpdateHandler, formWrapper);
      }
      if (!formUpdateHandler) {
        (methods as any).onFormUpdate = (fn: FormUpdateFn<THookReturn>) =>
          createBuilder<THookReturn, HasTransform, HasUpdate, true, HasWrapper>(
            hookFn,
            transformFn,
            updateHandler,
            fn,
            formWrapper
          );
      }
      if (!formWrapper) {
        (methods as any).formWrapper = (fn: FormWrapperFn<THookReturn>) =>
          createBuilder<
            THookReturn,
            HasTransform,
            HasUpdate,
            HasFormUpdate,
            true
          >(hookFn, transformFn, updateHandler, formUpdateHandler, fn);
      }

      return Object.assign(plugin, methods) as BuildRet<
        THookReturn,
        HasTransform,
        HasUpdate,
        HasFormUpdate,
        HasWrapper
      >;
    }

    const start = Object.assign(
      createBuilder<never, false, false, false, false>(),
      {
        useHook<THookReturn>(
          hookFn: (
            params: UseHookParams<Options, PluginMetaData, FieldMetaData>
          ) => THookReturn
        ) {
          return createBuilder<THookReturn, false, false, false, false>(hookFn);
        },
      }
    ) as BuildRet<never, false, false, false, false> & {
      useHook<THookReturn>(
        hookFn: (
          params: UseHookParams<Options, PluginMetaData, FieldMetaData>
        ) => THookReturn
      ): BuildRet<THookReturn, false, false, false, false>;
    };

    return start;
  }

  return { createPlugin };
}
