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
type OutputOf<T extends z.ZodTypeAny> = Prettify<z.output<T>>;
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

    type Plugin<THookReturn> = Prettify<
      CogsPlugin<TName, Options, THookReturn, PluginMetaData, FieldMetaData>
    >;

    const createPluginObject = <THookReturn = never>(
      hookFn?: (
        params: UseHookParams<Options, PluginMetaData, FieldMetaData>
      ) => THookReturn,
      transformFn?: TransformFn<THookReturn>,
      updateHandler?: UpdateFn<THookReturn>,
      formUpdateHandler?: FormUpdateFn<THookReturn>
    ): Plugin<THookReturn> => {
      return {
        name,
        useHook: hookFn as any,
        transformState: transformFn as any,
        onUpdate: updateHandler as any,
        onFormUpdate: formUpdateHandler as any,
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
      formUpdateHandler?: FormUpdateFn<THookReturn>
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
        formUpdateHandler
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
          >(hookFn, fn, updateHandler, formUpdateHandler);
      }
      if (!updateHandler) {
        (methods as any).onUpdate = (fn: UpdateFn<THookReturn>) =>
          createBuilder<
            THookReturn,
            HasTransform,
            true,
            HasFormUpdate,
            HasWrapper
          >(hookFn, transformFn, fn, formUpdateHandler);
      }
      if (!formUpdateHandler) {
        (methods as any).onFormUpdate = (fn: FormUpdateFn<THookReturn>) =>
          createBuilder<THookReturn, HasTransform, HasUpdate, true, HasWrapper>(
            hookFn,
            transformFn,
            updateHandler,
            fn
          );
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
