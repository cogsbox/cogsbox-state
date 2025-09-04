import { UpdateTypeDetail, StateObject, PluginData } from './CogsState';
import { useState, useEffect } from 'react';
type Prettify<T> = { [K in keyof T]: T[K] } & {};

// Your refined, more explicit version.
export type KeyedTypes<TMap extends Record<string, any>> = {
  __key: 'keyed';
  map: { [K in keyof TMap]: TMap[K] };
};
export type PluginContext<TState, TMetaData> = {
  [K in keyof TState]: {
    stateKey: K;
    cogsState: StateObject<TState[K]>;
    getPluginMetaData: () => TMetaData | undefined;
    /** Sets/merges the metadata for this plugin at the current state path */
    setPluginMetaData: (data: Partial<TMetaData>) => void;
    /** Removes all metadata for this plugin at the current state path */
    removePluginMetaData: () => void;
  };
}[keyof TState];

export type CogsPlugin<
  TName extends string,
  TState = any,
  TOptions = any,
  THookReturn = any,
  TPluginMetaData = any,
> = {
  name: TName;
  useHook?: (
    context: PluginContext<TState, TPluginMetaData>,
    options: TOptions
  ) => THookReturn;
  transformState?: (
    context: PluginContext<TState, TPluginMetaData>,
    options: TOptions,
    hook?: THookReturn
  ) => void;
  onUpdate?: (
    stateKey: keyof TState,
    update: UpdateTypeDetail,
    options: TOptions,
    hook?: THookReturn
  ) => void;
  onFormUpdate?: (
    stateKey: keyof TState,
    event: { type: 'focus' | 'blur' | 'input'; path: string; value?: any },
    options: TOptions,
    hook?: THookReturn
  ) => void;
  formWrapper?: (
    element: React.ReactNode,
    context: PluginContext<TState, TPluginMetaData>,
    options: TOptions,
    hook?: THookReturn
  ) => React.ReactNode;
};

export type ExtractPluginOptions<
  TPlugins extends readonly CogsPlugin<any, any, any>[],
> = {
  [P in TPlugins[number] as P['name']]?: P extends CogsPlugin<any, infer O, any>
    ? O
    : never;
};
export function createPluginContext<
  TState extends Record<string, any>,
  TOptions = unknown,
  TPluginMetaData extends Record<string, any> = {},
>() {
  function createPlugin<TName extends string>(name: TName) {
    // Helpers
    type HookArgs<THookReturn> = THookReturn extends never
      ? []
      : [hookData: THookReturn];

    type TransformFn<THookReturn> = (
      context: PluginContext<TState, TPluginMetaData>,
      options: TOptions,
      ...args: HookArgs<THookReturn>
    ) => void;

    type UpdateFn<THookReturn> = (
      context: PluginContext<TState, TPluginMetaData>,
      update: UpdateTypeDetail,
      options: TOptions,
      ...args: HookArgs<THookReturn>
    ) => void;

    type FormUpdateFn<THookReturn> = (
      context: PluginContext<TState, TPluginMetaData>,
      event: { type: 'focus' | 'blur' | 'input'; path: string; value?: any },
      options: TOptions,
      ...args: HookArgs<THookReturn>
    ) => void;

    type FormWrapperFn<THookReturn> = (
      element: React.ReactNode,
      context: PluginContext<TState, TPluginMetaData>,
      options: TOptions,
      ...args: HookArgs<THookReturn>
    ) => React.ReactNode;

    type Plugin<THookReturn> = Prettify<
      CogsPlugin<TName, TState, TOptions, THookReturn>
    >;

    // Your runtime object factory (unchanged behavior)
    const createPluginObject = <THookReturn = never>(
      hookFn?: (
        context: PluginContext<TState, TPluginMetaData>,
        options: TOptions
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

    // Typed fluent API result
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

    // Single builder: keeps runtime exactly the same, improves types only
    function createBuilder<
      THookReturn = never,
      HasTransform extends boolean = false,
      HasUpdate extends boolean = false,
      HasFormUpdate extends boolean = false,
      HasWrapper extends boolean = false,
    >(
      hookFn?: (
        context: PluginContext<TState, TPluginMetaData>,
        options: TOptions
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

      // Attach only the remaining chain methods (typed)
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

    // Base fluent object + typed useHook that flips THookReturn
    const start = Object.assign(
      createBuilder<never, false, false, false, false>(),
      {
        useHook<THookReturn>(
          hookFn: (
            context: PluginContext<TState, TPluginMetaData>,
            options: TOptions
          ) => THookReturn
        ) {
          return createBuilder<THookReturn, false, false, false, false>(hookFn);
        },
      }
    ) as BuildRet<never, false, false, false, false> & {
      useHook<THookReturn>(
        hookFn: (
          context: PluginContext<TState, TPluginMetaData>,
          options: TOptions
        ) => THookReturn
      ): BuildRet<THookReturn, false, false, false, false>;
    };

    return start;
  }

  return { createPlugin };
}
// --- DEMO USAGE - ALL THESE NOW WORK ---

type MyGlobalState = {
  user: { test: string };
  address: { city: string; country: string };
};

const { createPlugin } = createPluginContext<MyGlobalState, { id: string }>();

// Works with just transformState (no onUpdate required!)
const analyticsPlugin = createPlugin('analyticsPlugin').transformState(
  ({ stateKey, cogsState }, opts) => {
    if (stateKey === 'user') {
      cogsState.$update({ test: 'This works!' });
    }
    if (stateKey === 'address') {
      cogsState.$update({ city: 'London', country: 'UK' });
    }
  }
);

// Works with all three methods
const fullPlugin = createPlugin('fullPlugin')
  .useHook(({ stateKey, cogsState }, options) => {
    const [updateCount, setUpdateCount] = useState(0);
    return {
      count: updateCount,
      increment: () => setUpdateCount((c) => c + 1),
    };
  })
  .transformState(({ stateKey, cogsState }, options, hookData) => {
    if (hookData) {
      console.log(
        `[Logger] RENDER: Key '${stateKey}' has been updated ${hookData.count} times.`
      );
    }
  })
  .onUpdate(({ stateKey, cogsState }, update, options, hookData) => {
    if (hookData) {
      console.log(`[Logger] UPDATE: Key '${stateKey}' just changed.`);
      hookData.increment();
    }
  });

// Works with just useHook
const hookOnlyPlugin = createPlugin('hookOnly').useHook((context, options) => {
  return { id: 'test' };
});

// Works with no methods at all (though not very useful)
const emptyPlugin = createPlugin('empty');
