import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { pluginStore } from './pluginStore';
import { getGlobalStore } from './store';
import { isDeepEqual } from './utility';
import type { CogsPlugin, PluginContext } from './plugins';

import type { StateObject, UpdateTypeDetail } from './CogsState';

/**
 * An invisible "controller" component that manages the lifecycle for a SINGLE plugin instance.
 * Its only job is to correctly call the plugin's hooks and effects.
 * By isolating each plugin here, we guarantee the Rules of Hooks are followed.
 */
const PluginInstance = React.memo(
  ({
    stateKey,
    plugin,
    options,
    stateHandler,
  }: {
    stateKey: string;
    plugin: CogsPlugin<any, any, any, any>;
    options: any;
    stateHandler: StateObject<any>;
  }) => {
    // 1. Create a stable context object for the hooks.
    const context = useMemo<PluginContext<any, any>>(
      () => ({
        stateKey,
        cogsState: stateHandler,
        getPluginMetaData: () =>
          getGlobalStore
            .getState()
            .getPluginMetaDataMap(stateKey, [])
            ?.get(plugin.name),
        setPluginMetaData: (data: any) =>
          getGlobalStore
            .getState()
            .setPluginMetaData(stateKey, plugin.name, data),
        removePluginMetaData: () =>
          getGlobalStore
            .getState()
            .removePluginMetaData(stateKey, [], plugin.name),
      }),
      [stateKey, stateHandler, plugin.name]
    );

    // 2. Call the plugin's hook at the top level of this component. This is the main fix.
    const hookData = plugin.useHook
      ? plugin.useHook(context, options)
      : undefined;

    // 3. Handle `transformState`. This effect runs ONLY when the plugin's options change.
    const lastProcessedOptionsRef = useRef<any>();
    useEffect(() => {
      if (plugin.transformState) {
        // Use deep equality to prevent re-running for objects with the same value.
        if (!isDeepEqual(options, lastProcessedOptionsRef.current)) {
          plugin.transformState(context, options, hookData);
          lastProcessedOptionsRef.current = options;
        }
      }
    }, [context, plugin, options, hookData]); // Dependencies ensure this logic is re-evaluated correctly.

    // 4. Handle `onUpdate`. This effect subscribes to the global update bus.
    const hookDataRef = useRef(hookData);
    hookDataRef.current = hookData; // Keep the ref updated with the latest hookData on every render.

    useEffect(() => {
      if (!plugin.onUpdate) {
        return; // Do nothing if the plugin doesn't have this method.
      }

      const handleUpdate = (update: UpdateTypeDetail) => {
        // We only care about updates for the stateKey this instance is responsible for.
        if (update.stateKey === stateKey) {
          // As you corrected, the first param is just the stateKey.
          // We read from the ref to ensure the callback uses the LATEST hookData
          // without needing to re-subscribe on every render.
          plugin.onUpdate!(stateKey, update, options, hookDataRef.current);
        }
      };

      const unsubscribe = pluginStore
        .getState()
        .subscribeToUpdates(handleUpdate);
      return unsubscribe; // React will call this cleanup function when the component unmounts.
    }, [stateKey, plugin, options, context]); // The dependencies are stable and correctly manage the subscription lifecycle.

    // This component renders nothing to the DOM.
    return null;
  }
);

/**
 * The main orchestrator component. It reads from the central pluginStore
 * and renders a `PluginInstance` controller for each active plugin.
 */
export function PluginRunner({ children }: { children: React.ReactNode }) {
  // A simple way to force a re-render when the store changes.
  const [, forceUpdate] = useReducer((c) => c + 1, 0);

  // Subscribe to the store. When plugins or their options are added/removed,
  // this component will re-render to update the list of PluginInstances.
  useEffect(() => {
    const unsubscribe = pluginStore.subscribe(forceUpdate);
    return unsubscribe;
  }, []);

  const { pluginOptions, stateHandlers, registeredPlugins } =
    pluginStore.getState();

  return (
    <>
      {/*
        This declarative mapping is the core of the solution.
        React will now manage adding and removing `PluginInstance` components
        as the application state changes, ensuring hooks are handled safely.
      */}
      {Array.from(pluginOptions.entries()).map(([stateKey, pluginMap]) => {
        const stateHandler = stateHandlers.get(stateKey);
        if (!stateHandler) {
          return null; // Don't render a runner if the state handler isn't ready.
        }

        return Array.from(pluginMap.entries()).map(([pluginName, options]) => {
          const plugin = registeredPlugins.find((p) => p.name === pluginName);
          if (!plugin) {
            return null; // Don't render if the plugin is not in the registered list.
          }

          // Render a dedicated, memoized controller for this specific plugin configuration.
          return (
            <PluginInstance
              key={`${stateKey}:${pluginName}`}
              stateKey={stateKey}
              plugin={plugin}
              options={options}
              stateHandler={stateHandler}
            />
          );
        });
      })}
      {children}
    </>
  );
}
