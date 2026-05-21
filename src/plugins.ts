import { z } from 'zod';
import type React from 'react';
import { StateObject, UpdateTypeDetail } from './CogsState';
import {
  getGlobalStore,
  getAllFieldElements,
  setAllFieldsDisabled,
} from './store';
import { ClientActivityEvent } from './pluginStore';
import { RefObject } from 'react';

type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type ChainMethodTarget =
  | 'any'
  | 'array'
  | 'object'
  | 'primitive'
  | 'boolean';

export type ChainMethodContext<TOptions = any, THookReturn = any> = {
  stateKey: string;
  path: string[];
  pluginName: string;
  options: TOptions | undefined;
  hookData?: THookReturn;
  $get: () => any;
  $update: (payload: any) => { synced: () => void };
  $applyOperation: (operation: any, metaData?: Record<string, any>) => void;
  getFieldMetaData: () => any;
  setFieldMetaData: (data: Record<string, any>) => void;
  removeFieldMetaData: () => void;
  getFieldRefs: () => RefObject<any>[];
  getFieldElements: () => HTMLElement[];
  setFieldDisabled: (disabled: boolean) => void;
};

export type ChainMethodHandler = (
  ctx: ChainMethodContext<any, any>,
  ...args: any[]
) => any;

export type ChainMethodDefinition<
  THandler extends ChainMethodHandler = ChainMethodHandler,
> = {
  target: ChainMethodTarget;
  pathPattern?: string[];
  handler: THandler;
};

export type ChainMethodDefinitions = Record<string, ChainMethodDefinition<any>>;

type ChainMethodCallable<THandler> = THandler extends (
  ctx: any,
  ...args: infer TArgs
) => infer TReturn
  ? (...args: TArgs) => TReturn
  : never;

export type ChainMethodCallables<TMethods> = {
  [K in keyof TMethods]: TMethods[K] extends ChainMethodDefinition<infer TFn>
    ? ChainMethodCallable<TFn>
    : never;
};

export type KeyedTypes<TMap extends Record<string, any>> = {
  __key: 'keyed';
  map: TMap;
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
  initialiseShadowState: (data: any) => void;
  applyOperation: (patch: any, meta?: { dontUpdate?: boolean }) => void;
  addZodErrors: (errors: any[]) => void;
  getState: () => TStateSlice;
  setOptions: (options: any) => void;
};

export function toDeconstructedMethods(stateHandler: StateObject<any>) {
  return {
    initialiseState: (data: any) => {
      stateHandler.$update(data);
    },
    initialiseShadowState: (data: any) => {
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
type ScopedMetadataMethods<TFieldMetaData> = {
  getFieldMetaData: () => TFieldMetaData | undefined;
  setFieldMetaData: (data: Partial<TFieldMetaData>) => void;
  removeFieldMetaData: () => void;
  getFieldRefs: () => RefObject<any>[];
  getFieldElements: () => HTMLElement[];
  setFieldDisabled: (disabled: boolean) => void;
};

// These are the existing global methods that still require a path.
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
// Simplified: All params use the same TFieldMetaData type
export type UseHookParams<
  TOptions,
  TPluginMetaData,
  TFieldMetaData,
  TStateSlice = any,
> = DeconstructedCogsMethods<TStateSlice> &
  GlobalMetadataMethods<TFieldMetaData> & {
    stateKey: string;

    getPluginMetaData: () => TPluginMetaData | undefined;
    setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
    removePluginMetaData: () => void;

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
> = DeconstructedCogsMethods<TStateSlice> &
  GlobalMetadataMethods<TFieldMetaData> & {
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

export type OnUpdateParams<
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
  TStateSlice = any,
> = DeconstructedCogsMethods<TStateSlice> &
  ScopedMetadataMethods<TFieldMetaData> & {
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
export type OnFormUpdateParams<
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
  TStateSlice = any,
> = DeconstructedCogsMethods<TStateSlice> &
  ScopedMetadataMethods<TFieldMetaData> & {
    stateKey: string;

    getPluginMetaData: () => TPluginMetaData | undefined;
    setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
    removePluginMetaData: () => void;

    path: string[];
    event: ClientActivityEvent; // Update this to use the full event type

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
> = ScopedMetadataMethods<TFieldMetaData> & {
  element: React.ReactNode;
  path: string[];
  stateKey: string;
  options: TOptions;
  hookData?: THookReturn;
  fieldType?: string;
  wrapperDepth?: number;

  // Deconstructed methods
  initialiseState: (data: TStateSlice) => void;
  initialiseShadowState: (data: any) => void;
  applyOperation: (patch: any, meta?: { dontUpdate?: boolean }) => void;
  addZodErrors: (errors: any[]) => void;
  getState: () => TStateSlice;
  setOptions: (options: any) => void;

  getPluginMetaData: () => TPluginMetaData | undefined;
  setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
  removePluginMetaData: () => void;

  pluginName: string;
};

// Unified plugin definition
export type CogsPlugin<
  TName extends string,
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
  TChainMethods extends ChainMethodDefinitions = {},
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

  chainMethods?: TChainMethods;
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
    getFieldRefs: (path: string[]): RefObject<any>[] => {
      const meta = getGlobalStore.getState().getShadowMetadata(stateKey, path);
      if (!meta?.clientActivityState?.elements) return [];
      const refs: RefObject<any>[] = [];
      meta.clientActivityState.elements.forEach((entry: any) => {
        if (entry.domRef?.current) refs.push(entry.domRef);
      });
      return refs;
    },

    getFieldElements: (path: string[]): HTMLElement[] => {
      const meta = getGlobalStore.getState().getShadowMetadata(stateKey, path);
      if (!meta?.clientActivityState?.elements) return [];
      const elements: HTMLElement[] = [];
      meta.clientActivityState.elements.forEach((entry: any) => {
        if (entry.domRef?.current) elements.push(entry.domRef.current);
      });
      return elements;
    },

    setFieldDisabled: (path: string[], disabled: boolean) => {
      const meta = getGlobalStore.getState().getShadowMetadata(stateKey, path);
      if (!meta?.clientActivityState?.elements) return;
      meta.clientActivityState.elements.forEach((entry: any) => {
        const el = entry.domRef?.current;
        if (!el) return;
        if ('disabled' in el) el.disabled = disabled;
        else {
          el.style.pointerEvents = disabled ? 'none' : '';
          el.setAttribute('aria-disabled', String(disabled));
        }
      });
    },
    getAllFieldElements: (): HTMLElement[] => {
      return getAllFieldElements(stateKey);
    },

    setAllFieldsDisabled: (disabled: boolean): void =>
      setAllFieldsDisabled(stateKey, disabled),
  };
}

export function createScopedMetadataContext<TPluginMetaData, TFieldMetaData>(
  stateKey: string,
  pluginName: string,
  path: string[]
) {
  const globalContext = createMetadataContext<TPluginMetaData, TFieldMetaData>(
    stateKey,
    pluginName
  );

  return {
    ...globalContext,
    getFieldMetaData: (): TFieldMetaData | undefined =>
      globalContext.getFieldMetaData(path),
    setFieldMetaData: (data: Partial<TFieldMetaData>) =>
      globalContext.setFieldMetaData(path, data),
    removeFieldMetaData: () => globalContext.removeFieldMetaData(path),

    // NEW: Direct access to the DOM refs for this field
    getFieldRefs: (): RefObject<any>[] => {
      const meta = getGlobalStore.getState().getShadowMetadata(stateKey, path);
      if (!meta?.clientActivityState?.elements) return [];
      const refs: RefObject<any>[] = [];
      meta.clientActivityState.elements.forEach((entry: any) => {
        if (entry.domRef?.current) {
          refs.push(entry.domRef);
        }
      });
      return refs;
    },

    getFieldElements: (): HTMLElement[] => {
      const meta = getGlobalStore.getState().getShadowMetadata(stateKey, path);
      if (!meta?.clientActivityState?.elements) return [];
      const elements: HTMLElement[] = [];
      meta.clientActivityState.elements.forEach((entry: any) => {
        if (entry.domRef?.current) {
          elements.push(entry.domRef.current);
        }
      });
      return elements;
    },

    setFieldDisabled: (disabled: boolean) => {
      const meta = getGlobalStore.getState().getShadowMetadata(stateKey, path);
      if (!meta?.clientActivityState?.elements) return;
      meta.clientActivityState.elements.forEach((entry: any) => {
        const el = entry.domRef?.current;
        if (!el) return;
        if ('disabled' in el) {
          el.disabled = disabled;
        } else {
          el.style.pointerEvents = disabled ? 'none' : '';
          el.setAttribute('aria-disabled', String(disabled));
        }
      });
    },
  };
}
// Add this type export - derives from what createScopedMetadataContext returns
export type ScopedMetadataContext<TFieldMetaData = any> = {
  getFieldMetaData: () => TFieldMetaData | undefined;
  setFieldMetaData: (data: Partial<TFieldMetaData>) => void;
  removeFieldMetaData: () => void;
};

// Type for a single plugin's API entry in ValidationWrapper
export type PluginApiEntry<THookData = any, TFieldMetaData = any> = {
  hookData: THookData | undefined;
} & ScopedMetadataContext<TFieldMetaData>;

// Type for the entire plugins API object passed to validation render prop
export type PluginsApi = Record<string, PluginApiEntry>;
type ZodObjOutput<T extends z.ZodObject<any>> = {
  [K in keyof T['shape']]: z.output<T['shape'][K]>;
};
type OutputOf<T extends z.ZodTypeAny> =
  T extends z.ZodObject<any> ? Prettify<ZodObjOutput<T>> : z.output<T>;

type MethodFactory = <THandler extends ChainMethodHandler>(
  handler: THandler
) => ChainMethodDefinition<THandler>;

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

const createMethodDefinition =
  (target: ChainMethodTarget, pathPattern?: string[]): MethodFactory =>
  (handler) => ({
    target,
    pathPattern,
    handler,
  });

const createPathRecorder = () => {
  const path: string[] = [];

  const recorder = new Proxy(
    {},
    {
      get(_target, prop) {
        if (typeof prop !== 'string') return recorder;
        if (prop === 'then') return undefined;
        path.push(prop === '$' ? '*' : prop);
        return recorder;
      },
    }
  );

  return { recorder, path };
};

const createMethodsBuilderParams = (): MethodsBuilderParams => {
  const path = (selector: (state: any) => any): PathMethodFactory => {
    const { recorder, path: pathPattern } = createPathRecorder();
    selector(recorder);

    const base = createMethodDefinition(
      'any',
      pathPattern
    ) as PathMethodFactory;
    base.array = createMethodDefinition('array', pathPattern);
    base.object = createMethodDefinition('object', pathPattern);
    base.primitive = createMethodDefinition('primitive', pathPattern);
    base.boolean = createMethodDefinition('boolean', pathPattern);
    base.field = createMethodDefinition('any', pathPattern);

    return base;
  };

  return {
    path,
    array: createMethodDefinition('array'),
    object: createMethodDefinition('object'),
    primitive: createMethodDefinition('primitive'),
    boolean: createMethodDefinition('boolean'),
    field: createMethodDefinition('any'),
  };
};

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

    type Plugin<
      THookReturn,
      TChainMethods extends ChainMethodDefinitions = {},
    > = Prettify<
      CogsPlugin<
        TName,
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData,
        TChainMethods
      >
    >;

    const createPluginObject = <
      THookReturn = never,
      TChainMethods extends ChainMethodDefinitions = {},
    >(
      hookFn?: (
        params: UseHookParams<Options, PluginMetaData, FieldMetaData>
      ) => THookReturn,
      transformFn?: TransformFn<THookReturn>,
      updateHandler?: UpdateFn<THookReturn>,
      formUpdateHandler?: FormUpdateFn<THookReturn>,
      chainMethods?: TChainMethods
    ): Plugin<THookReturn, TChainMethods> => {
      return {
        name,
        useHook: hookFn as any,
        transformState: transformFn as any,
        onUpdate: updateHandler as any,
        onFormUpdate: formUpdateHandler as any,
        chainMethods,
      };
    };

    type BuildRet<
      THookReturn,
      TChainMethods extends ChainMethodDefinitions,
      HasTransform extends boolean,
      HasUpdate extends boolean,
      HasFormUpdate extends boolean,
      HasMethods extends boolean,
      HasWrapper extends boolean,
    > = Plugin<THookReturn, TChainMethods> &
      (HasTransform extends true
        ? {}
        : {
            transformState(
              fn: TransformFn<THookReturn>
            ): BuildRet<
              THookReturn,
              TChainMethods,
              true,
              HasUpdate,
              HasFormUpdate,
              HasMethods,
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
              TChainMethods,
              HasTransform,
              true,
              HasFormUpdate,
              HasMethods,
              HasWrapper
            >;
          }) &
      (HasFormUpdate extends true
        ? {}
        : {
            onFormUpdate(
              fn: FormUpdateFn<THookReturn>
            ): BuildRet<
              THookReturn,
              TChainMethods,
              HasTransform,
              HasUpdate,
              true,
              HasMethods,
              HasWrapper
            >;
          }) &
      (HasMethods extends true
        ? {}
        : {
            methods<TNextMethods extends ChainMethodDefinitions>(
              fn: (helpers: MethodsBuilderParams) => TNextMethods
            ): BuildRet<
              THookReturn,
              TNextMethods,
              HasTransform,
              HasUpdate,
              HasFormUpdate,
              true,
              HasWrapper
            >;
          });

    function createBuilder<
      THookReturn = never,
      TChainMethods extends ChainMethodDefinitions = {},
      HasTransform extends boolean = false,
      HasUpdate extends boolean = false,
      HasFormUpdate extends boolean = false,
      HasMethods extends boolean = false,
      HasWrapper extends boolean = false,
    >(
      hookFn?: (
        params: UseHookParams<Options, PluginMetaData, FieldMetaData>
      ) => THookReturn,
      transformFn?: TransformFn<THookReturn>,
      updateHandler?: UpdateFn<THookReturn>,
      formUpdateHandler?: FormUpdateFn<THookReturn>,
      chainMethods?: TChainMethods
    ): BuildRet<
      THookReturn,
      TChainMethods,
      HasTransform,
      HasUpdate,
      HasFormUpdate,
      HasMethods,
      HasWrapper
    > {
      const plugin = createPluginObject<THookReturn, TChainMethods>(
        hookFn,
        transformFn,
        updateHandler,
        formUpdateHandler,
        chainMethods
      );

      const methods = {} as Partial<
        BuildRet<
          THookReturn,
          TChainMethods,
          HasTransform,
          HasUpdate,
          HasFormUpdate,
          HasMethods,
          HasWrapper
        >
      >;

      if (!transformFn) {
        (methods as any).transformState = (fn: TransformFn<THookReturn>) =>
          createBuilder<
            THookReturn,
            TChainMethods,
            true,
            HasUpdate,
            HasFormUpdate,
            HasMethods,
            HasWrapper
          >(hookFn, fn, updateHandler, formUpdateHandler, chainMethods);
      }
      if (!updateHandler) {
        (methods as any).onUpdate = (fn: UpdateFn<THookReturn>) =>
          createBuilder<
            THookReturn,
            TChainMethods,
            HasTransform,
            true,
            HasFormUpdate,
            HasMethods,
            HasWrapper
          >(hookFn, transformFn, fn, formUpdateHandler, chainMethods);
      }
      if (!formUpdateHandler) {
        (methods as any).onFormUpdate = (fn: FormUpdateFn<THookReturn>) =>
          createBuilder<
            THookReturn,
            TChainMethods,
            HasTransform,
            HasUpdate,
            true,
            HasMethods,
            HasWrapper
          >(hookFn, transformFn, updateHandler, fn, chainMethods);
      }
      if (!chainMethods) {
        (methods as any).methods = <
          TNextMethods extends ChainMethodDefinitions,
        >(
          fn: (helpers: MethodsBuilderParams) => TNextMethods
        ) =>
          createBuilder<
            THookReturn,
            TNextMethods,
            HasTransform,
            HasUpdate,
            HasFormUpdate,
            true,
            HasWrapper
          >(
            hookFn,
            transformFn,
            updateHandler,
            formUpdateHandler,
            fn(createMethodsBuilderParams())
          );
      }

      return Object.assign(plugin, methods) as BuildRet<
        THookReturn,
        TChainMethods,
        HasTransform,
        HasUpdate,
        HasFormUpdate,
        HasMethods,
        HasWrapper
      >;
    }

    const start = Object.assign(
      createBuilder<never, {}, false, false, false, false, false>(),
      {
        useHook<THookReturn>(
          hookFn: (
            params: UseHookParams<Options, PluginMetaData, FieldMetaData>
          ) => THookReturn
        ) {
          return createBuilder<
            THookReturn,
            {},
            false,
            false,
            false,
            false,
            false
          >(hookFn);
        },
      }
    ) as BuildRet<never, {}, false, false, false, false, false> & {
      useHook<THookReturn>(
        hookFn: (
          params: UseHookParams<Options, PluginMetaData, FieldMetaData>
        ) => THookReturn
      ): BuildRet<THookReturn, {}, false, false, false, false, false>;
    };

    return start;
  }

  return { createPlugin };
}
