import { UpdateTypeDetail, StateObject } from './CogsState';
import { useState } from 'react';

// --- The Core Solution: A Discriminated Union for Context ---

type PluginContext<TState> = {
  [K in keyof TState]: {
    stateKey: K;
    cogsState: StateObject<TState[K]>;
  };
}[keyof TState];

export type CogsPlugin<TState = any, TOptions = any, THookReturn = any> = {
  name: string;
  useHook?: (context: PluginContext<TState>, options: TOptions) => THookReturn;
  transformState?: (
    context: PluginContext<TState>,
    options: TOptions,
    hook?: THookReturn
  ) => void;
  onUpdate?: (
    stateKey: keyof TState,
    update: UpdateTypeDetail,
    options: TOptions,
    hook?: THookReturn
  ) => void;
};

export type ExtractPluginOptions<
  TPlugins extends readonly CogsPlugin<any, any, any>[],
> = {
  [P in TPlugins[number] as P['name']]?: P extends CogsPlugin<any, infer O, any>
    ? O
    : never;
};

export type PluginInstance<TState = any, TOptions = any, THookReturn = any> = {
  plugin: CogsPlugin<TState, TOptions, THookReturn>;
  options: TOptions;
};

// The improved builder that makes onUpdate optional
export function createPluginContext<
  TState extends Record<string, any> = any,
>() {
  function createPlugin<TOptions = any>(name: string) {
    // Helper to create the final plugin object
    const createPluginObject = <THookReturn = any>(
      hookFn?: (
        context: PluginContext<TState>,
        options: TOptions
      ) => THookReturn,
      transformFn?: (
        context: PluginContext<TState>,
        options: TOptions,
        ...args: THookReturn extends never ? [] : [hookData: THookReturn]
      ) => void,
      updateHandler?: (
        context: PluginContext<TState>,
        update: UpdateTypeDetail,
        options: TOptions,
        ...args: THookReturn extends never ? [] : [hookData: THookReturn]
      ) => void
    ): CogsPlugin<TState, TOptions, THookReturn> => {
      return {
        name,
        useHook: hookFn as any,
        transformState: transformFn as any,
        onUpdate: updateHandler as any,
      };
    };

    const make = <THookReturn = never>(
      hookFn?: (
        context: PluginContext<TState>,
        options: TOptions
      ) => THookReturn
    ) => {
      // Return the plugin directly if no methods are chained
      const plugin = createPluginObject<THookReturn>(hookFn);

      return Object.assign(plugin, {
        transformState(
          transformFn: (
            context: PluginContext<TState>,
            options: TOptions,
            ...args: THookReturn extends never ? [] : [hookData: THookReturn]
          ) => void
        ) {
          // Create plugin with transform, still allowing optional onUpdate
          const pluginWithTransform = createPluginObject<THookReturn>(
            hookFn,
            transformFn
          );

          return Object.assign(pluginWithTransform, {
            onUpdate(
              updateHandler: (
                context: PluginContext<TState>,
                update: UpdateTypeDetail,
                options: TOptions,
                ...args: THookReturn extends never
                  ? []
                  : [hookData: THookReturn]
              ) => void
            ) {
              return createPluginObject<THookReturn>(
                hookFn,
                transformFn,
                updateHandler
              );
            },
          });
        },
        onUpdate(
          updateHandler: (
            context: PluginContext<TState>,
            update: UpdateTypeDetail,
            options: TOptions,
            ...args: THookReturn extends never ? [] : [hookData: THookReturn]
          ) => void
        ) {
          return createPluginObject<THookReturn>(
            hookFn,
            undefined,
            updateHandler
          );
        },
      });
    };

    // For starting without useHook
    const basePlugin = createPluginObject();

    return Object.assign(basePlugin, {
      useHook<THookReturn>(
        hookFn: (
          context: PluginContext<TState>,
          options: TOptions
        ) => THookReturn
      ) {
        return make<THookReturn>(hookFn);
      },
      transformState(
        transformFn: (context: PluginContext<TState>, options: TOptions) => void
      ) {
        const pluginWithTransform = createPluginObject(
          undefined,
          transformFn as any
        );

        return Object.assign(pluginWithTransform, {
          onUpdate(
            updateHandler: (
              context: PluginContext<TState>,
              update: UpdateTypeDetail,
              options: TOptions
            ) => void
          ) {
            return createPluginObject(
              undefined,
              transformFn as any,
              updateHandler as any
            );
          },
        });
      },
      onUpdate(
        updateHandler: (
          context: PluginContext<TState>,
          update: UpdateTypeDetail,
          options: TOptions
        ) => void
      ) {
        return createPluginObject(undefined, undefined, updateHandler as any);
      },
    });
  }

  return { createPlugin };
}

// --- DEMO USAGE - ALL THESE NOW WORK ---

type MyGlobalState = {
  user: { test: string };
  address: { city: string; country: string };
};

const { createPlugin } = createPluginContext<MyGlobalState>();

// Works with just transformState (no onUpdate required!)
const analyticsPlugin = createPlugin<{ id: string }>(
  'analyticsPlugin'
).transformState(({ stateKey, cogsState }, opts) => {
  if (stateKey === 'user') {
    cogsState.$update({ test: 'This works!' });
  }
  if (stateKey === 'address') {
    cogsState.$update({ city: 'London', country: 'UK' });
  }
});

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
