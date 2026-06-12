import { z } from 'zod';
import type { ReactNode, RefObject } from 'react';
import { StateObject, UpdateTypeDetail } from './CogsState';
import {
  getGlobalStore,
  getAllFieldElements,
  setAllFieldsDisabled,
} from './store';
import { ClientActivityEvent } from './pluginStore';

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
  element: ReactNode;
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
  TInitialState extends Record<string, unknown> = {},
> = {
  name: TName;

  initialState?: () => TInitialState;

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
  ) => ReactNode;

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
// --- EXTRACTED BUILDER TYPES (Solves TS7056 Serialization Error) ---

export type PluginTransformFn<
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
> = (
  params: TransformStateParams<
    TOptions,
    THookReturn,
    TPluginMetaData,
    TFieldMetaData,
    any
  >
) => void;

export type PluginUpdateFn<
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
> = (
  params: OnUpdateParams<
    TOptions,
    THookReturn,
    TPluginMetaData,
    TFieldMetaData,
    any
  >
) => void;

export type PluginFormUpdateFn<
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
> = (
  params: OnFormUpdateParams<
    TOptions,
    THookReturn,
    TPluginMetaData,
    TFieldMetaData,
    any
  >
) => void;

export type PluginFormWrapperFn<
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
> = (
  params: FormWrapperParams<
    TOptions,
    THookReturn,
    TPluginMetaData,
    TFieldMetaData,
    any
  >
) => ReactNode;

export type CogsPluginBuilder<
  TName extends string,
  TOptions,
  TPluginMetaData,
  TFieldMetaData,
  THookReturn,
  TChainMethods extends ChainMethodDefinitions,
  HasTransform extends boolean,
  HasUpdate extends boolean,
  HasFormUpdate extends boolean,
  HasMethods extends boolean,
  HasWrapper extends boolean,
  HasInitialState extends boolean,
  TInitialState extends Record<string, unknown> = {},
> = Prettify<
  CogsPlugin<
    TName,
    TOptions,
    THookReturn,
    TPluginMetaData,
    TFieldMetaData,
    TChainMethods,
    TInitialState
  >
> &
  (HasTransform extends true
    ? {}
    : {
        transformState(
          fn: PluginTransformFn<
            TOptions,
            THookReturn,
            TPluginMetaData,
            TFieldMetaData
          >
        ): CogsPluginBuilder<
          TName,
          TOptions,
          TPluginMetaData,
          TFieldMetaData,
          THookReturn,
          TChainMethods,
          true,
          HasUpdate,
          HasFormUpdate,
          HasMethods,
          HasWrapper,
          HasInitialState,
          TInitialState
        >;
      }) &
  (HasUpdate extends true
    ? {}
    : {
        onUpdate(
          fn: PluginUpdateFn<
            TOptions,
            THookReturn,
            TPluginMetaData,
            TFieldMetaData
          >
        ): CogsPluginBuilder<
          TName,
          TOptions,
          TPluginMetaData,
          TFieldMetaData,
          THookReturn,
          TChainMethods,
          HasTransform,
          true,
          HasFormUpdate,
          HasMethods,
          HasWrapper,
          HasInitialState,
          TInitialState
        >;
      }) &
  (HasFormUpdate extends true
    ? {}
    : {
        onFormUpdate(
          fn: PluginFormUpdateFn<
            TOptions,
            THookReturn,
            TPluginMetaData,
            TFieldMetaData
          >
        ): CogsPluginBuilder<
          TName,
          TOptions,
          TPluginMetaData,
          TFieldMetaData,
          THookReturn,
          TChainMethods,
          HasTransform,
          HasUpdate,
          true,
          HasMethods,
          HasWrapper,
          HasInitialState,
          TInitialState
        >;
      }) &
  (HasMethods extends true
    ? {}
    : {
        methods<TNextMethods extends ChainMethodDefinitions>(
          fn: (helpers: MethodsBuilderParams) => TNextMethods
        ): CogsPluginBuilder<
          TName,
          TOptions,
          TPluginMetaData,
          TFieldMetaData,
          THookReturn,
          TNextMethods,
          HasTransform,
          HasUpdate,
          HasFormUpdate,
          true,
          HasWrapper,
          HasInitialState,
          TInitialState
        >;
      }) &
  (HasWrapper extends true
    ? {}
    : {
        formWrapper(
          fn: PluginFormWrapperFn<
            TOptions,
            THookReturn,
            TPluginMetaData,
            TFieldMetaData
          >
        ): CogsPluginBuilder<
          TName,
          TOptions,
          TPluginMetaData,
          TFieldMetaData,
          THookReturn,
          TChainMethods,
          HasTransform,
          HasUpdate,
          HasFormUpdate,
          HasMethods,
          true,
          HasInitialState,
          TInitialState
        >;
      }) &
  (HasInitialState extends true
    ? {}
    : {
        initialState<TNewState extends Record<string, unknown>>(
          fn: () => TNewState
        ): CogsPluginBuilder<
          TName,
          TOptions,
          TPluginMetaData,
          TFieldMetaData,
          THookReturn,
          TChainMethods,
          HasTransform,
          HasUpdate,
          HasFormUpdate,
          HasMethods,
          HasWrapper,
          true,
          TNewState
        >;
      });

export type CreatePluginStart<
  TName extends string,
  TOptions,
  TPluginMetaData,
  TFieldMetaData,
> = CogsPluginBuilder<
  TName,
  TOptions,
  TPluginMetaData,
  TFieldMetaData,
  never,
  {},
  false,
  false,
  false,
  false,
  false,
  false,
  {}
> & {
  useHook<THookReturn>(
    hookFn: (
      params: UseHookParams<TOptions, TPluginMetaData, TFieldMetaData, any>
    ) => THookReturn
  ): CogsPluginBuilder<
    TName,
    TOptions,
    TPluginMetaData,
    TFieldMetaData,
    THookReturn,
    {},
    false,
    false,
    false,
    false,
    false,
    false,
    {}
  >;
  initialState<TNewState extends Record<string, unknown>>(
    fn: () => TNewState
  ): CogsPluginBuilder<
    TName,
    TOptions,
    TPluginMetaData,
    TFieldMetaData,
    never,
    {},
    false,
    false,
    false,
    false,
    false,
    true,
    TNewState
  >;
};

// --- UPDATED EXPLICIT CONTEXT ---

export function createPluginContext<
  O extends z.ZodTypeAny | undefined = undefined,
  PM extends z.ZodTypeAny | undefined = undefined,
  FM extends z.ZodTypeAny | undefined = undefined,
>(schemas?: {
  options?: O;
  pluginMetaData?: PM;
  fieldMetaData?: FM;
}): {
  // EXPLICIT RETURN ANNOTATION STOPS TS FROM SERIALIZING
  createPlugin: <TName extends string>(
    name: TName
  ) => CreatePluginStart<
    TName,
    O extends z.ZodTypeAny ? OutputOf<O> : undefined,
    PM extends z.ZodTypeAny ? OutputOf<PM> : unknown,
    FM extends z.ZodTypeAny ? OutputOf<FM> : unknown
  >;
} {
  type Options = O extends z.ZodTypeAny ? OutputOf<O> : undefined;
  type PluginMetaData = PM extends z.ZodTypeAny ? OutputOf<PM> : unknown;
  type FieldMetaData = FM extends z.ZodTypeAny ? OutputOf<FM> : unknown;

  function createPlugin<TName extends string>(name: TName) {
    type Builder<
      THookReturn,
      TChainMethods extends ChainMethodDefinitions,
      HT extends boolean,
      HU extends boolean,
      HFU extends boolean,
      HM extends boolean,
      HW extends boolean,
      HI extends boolean,
      TInitialState extends Record<string, unknown> = {},
    > = CogsPluginBuilder<
      TName,
      Options,
      PluginMetaData,
      FieldMetaData,
      THookReturn,
      TChainMethods,
      HT,
      HU,
      HFU,
      HM,
      HW,
      HI,
      TInitialState
    >;

    const createPluginObject = <
      THookReturn = never,
      TChainMethods extends ChainMethodDefinitions = {},
      TInitialState extends Record<string, unknown> = {},
    >(
      hookFn?: (
        params: UseHookParams<Options, PluginMetaData, FieldMetaData, any>
      ) => THookReturn,
      transformFn?: PluginTransformFn<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >,
      updateHandler?: PluginUpdateFn<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >,
      formUpdateHandler?: PluginFormUpdateFn<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >,
      chainMethods?: TChainMethods,
      initialStateFn?: () => TInitialState,
      wrapperFn?: PluginFormWrapperFn<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >
    ): Prettify<
      CogsPlugin<
        TName,
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData,
        TChainMethods,
        TInitialState
      >
    > => {
      return {
        name,
        initialState: initialStateFn,
        useHook: hookFn as any,
        transformState: transformFn as any,
        onUpdate: updateHandler as any,
        onFormUpdate: formUpdateHandler as any,
        formWrapper: wrapperFn as any,
        chainMethods,
      };
    };

    function createBuilder<
      THookReturn = never,
      TChainMethods extends ChainMethodDefinitions = {},
      HasTransform extends boolean = false,
      HasUpdate extends boolean = false,
      HasFormUpdate extends boolean = false,
      HasMethods extends boolean = false,
      HasWrapper extends boolean = false,
      HasInitialState extends boolean = false,
      TInitialState extends Record<string, unknown> = {},
    >(
      hookFn?: (
        params: UseHookParams<Options, PluginMetaData, FieldMetaData, any>
      ) => THookReturn,
      transformFn?: PluginTransformFn<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >,
      updateHandler?: PluginUpdateFn<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >,
      formUpdateHandler?: PluginFormUpdateFn<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >,
      chainMethods?: TChainMethods,
      initialStateFn?: () => TInitialState,
      wrapperFn?: PluginFormWrapperFn<
        Options,
        THookReturn,
        PluginMetaData,
        FieldMetaData
      >
    ): Builder<
      THookReturn,
      TChainMethods,
      HasTransform,
      HasUpdate,
      HasFormUpdate,
      HasMethods,
      HasWrapper,
      HasInitialState,
      TInitialState
    > {
      const plugin = createPluginObject<THookReturn, TChainMethods, TInitialState>(
        hookFn,
        transformFn,
        updateHandler,
        formUpdateHandler,
        chainMethods,
        initialStateFn,
        wrapperFn
      );

      const methods = {} as Partial<
        Builder<
          THookReturn,
          TChainMethods,
          HasTransform,
          HasUpdate,
          HasFormUpdate,
          HasMethods,
          HasWrapper,
          HasInitialState,
          TInitialState
        >
      >;

      if (!transformFn) {
        (methods as any).transformState = (
          fn: PluginTransformFn<
            Options,
            THookReturn,
            PluginMetaData,
            FieldMetaData
          >
        ) =>
          createBuilder<
            THookReturn,
            TChainMethods,
            true,
            HasUpdate,
            HasFormUpdate,
            HasMethods,
            HasWrapper,
            HasInitialState,
            TInitialState
          >(
            hookFn,
            fn,
            updateHandler,
            formUpdateHandler,
            chainMethods,
            initialStateFn,
            wrapperFn
          );
      }
      if (!updateHandler) {
        (methods as any).onUpdate = (
          fn: PluginUpdateFn<
            Options,
            THookReturn,
            PluginMetaData,
            FieldMetaData
          >
        ) =>
          createBuilder<
            THookReturn,
            TChainMethods,
            HasTransform,
            true,
            HasFormUpdate,
            HasMethods,
            HasWrapper,
            HasInitialState,
            TInitialState
          >(
            hookFn,
            transformFn,
            fn,
            formUpdateHandler,
            chainMethods,
            initialStateFn,
            wrapperFn
          );
      }
      if (!formUpdateHandler) {
        (methods as any).onFormUpdate = (
          fn: PluginFormUpdateFn<
            Options,
            THookReturn,
            PluginMetaData,
            FieldMetaData
          >
        ) =>
          createBuilder<
            THookReturn,
            TChainMethods,
            HasTransform,
            HasUpdate,
            true,
            HasMethods,
            HasWrapper,
            HasInitialState,
            TInitialState
          >(
            hookFn,
            transformFn,
            updateHandler,
            fn,
            chainMethods,
            initialStateFn,
            wrapperFn
          );
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
            HasWrapper,
            HasInitialState,
            TInitialState
          >(
            hookFn,
            transformFn,
            updateHandler,
            formUpdateHandler,
            fn(createMethodsBuilderParams()),
            initialStateFn,
            wrapperFn
          );
      }
      if (!initialStateFn) {
        (methods as any).initialState = <TNewState extends Record<string, unknown>>(fn: () => TNewState) =>
          createBuilder<
            THookReturn,
            TChainMethods,
            HasTransform,
            HasUpdate,
            HasFormUpdate,
            HasMethods,
            HasWrapper,
            true,
            TNewState
          >(
            hookFn,
            transformFn,
            updateHandler,
            formUpdateHandler,
            chainMethods,
            fn,
            wrapperFn
          );
      }
      if (!wrapperFn) {
        (methods as any).formWrapper = (
          fn: PluginFormWrapperFn<
            Options,
            THookReturn,
            PluginMetaData,
            FieldMetaData
          >
        ) =>
          createBuilder<
            THookReturn,
            TChainMethods,
            HasTransform,
            HasUpdate,
            HasFormUpdate,
            HasMethods,
            true,
            HasInitialState,
            TInitialState
          >(
            hookFn,
            transformFn,
            updateHandler,
            formUpdateHandler,
            chainMethods,
            initialStateFn,
            fn
          );
      }

      return Object.assign(plugin, methods) as Builder<
        THookReturn,
        TChainMethods,
        HasTransform,
        HasUpdate,
        HasFormUpdate,
        HasMethods,
        HasWrapper,
        HasInitialState,
        TInitialState
      >;
    }

    const start = Object.assign(
      createBuilder<never, {}, false, false, false, false, false, false, {}>(),
      {
        useHook<THookReturn>(
          hookFn: (
            params: UseHookParams<Options, PluginMetaData, FieldMetaData, any>
          ) => THookReturn
        ) {
          return createBuilder<
            THookReturn,
            {},
            false,
            false,
            false,
            false,
            false,
            false,
            {}
          >(hookFn);
        },
        initialState<TNewState extends Record<string, unknown>>(fn: () => TNewState) {
          return createBuilder<
            never,
            {},
            false,
            false,
            false,
            false,
            false,
            true,
            TNewState
          >(undefined, undefined, undefined, undefined, undefined, fn);
        },
      }
    ) as CreatePluginStart<TName, Options, PluginMetaData, FieldMetaData>;

    return start;
  }

  return { createPlugin };
}
