import React, { useEffect, useMemo, useState, useRef, useReducer } from 'react';
import { pluginStore } from './pluginStore';
import { isDeepEqual } from './utility';
import { createMetadataContext } from './plugins';
import type { CogsPlugin } from './plugins';
import type { StateObject, UpdateTypeDetail } from './CogsState';

const { setHookResult, removeHookResult } = pluginStore.getState();

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
    const [isInitialMount, setIsInitialMount] = useState(true);

    // Create metadata context
    const metadataContext = useMemo(
      () => createMetadataContext(stateKey, plugin.name),
      [stateKey, plugin.name]
    );

    // Create the full context for useHook
    const hookContext = useMemo(
      () => ({
        stateKey,
        cogsState: stateHandler,
        ...metadataContext,
        options,
        pluginName: plugin.name,
        isInitialMount,
      }),
      [
        stateKey,
        stateHandler,
        metadataContext,
        options,
        plugin.name,
        isInitialMount,
      ]
    );

    // Call the plugin's hook
    const hookData = plugin.useHook ? plugin.useHook(hookContext) : undefined;

    useEffect(() => {
      setIsInitialMount(false);
    }, []);

    useEffect(() => {
      if (plugin.useHook) setHookResult(stateKey, plugin.name, hookData);
      else removeHookResult(stateKey, plugin.name);
      return () => removeHookResult(stateKey, plugin.name);
    }, [stateKey, plugin.name, !!plugin.useHook, hookData]);

    // Handle transformState
    const lastProcessedOptionsRef = useRef<any>();
    const [isInitialTransform, setIsInitialTransform] = useState(true);

    useEffect(() => {
      if (plugin.transformState) {
        if (!isDeepEqual(options, lastProcessedOptionsRef.current)) {
          plugin.transformState({
            stateKey,
            cogsState: stateHandler,
            ...metadataContext,
            options,
            hookData,
            isInitialTransform,
          });
          lastProcessedOptionsRef.current = options;
          setIsInitialTransform(false);
        }
      }
    }, [
      stateKey,
      stateHandler,
      metadataContext,
      plugin,
      options,
      hookData,
      isInitialTransform,
    ]);

    // Handle onUpdate
    const hookDataRef = useRef(hookData);
    hookDataRef.current = hookData;

    useEffect(() => {
      if (!plugin.onUpdate) return;

      const handleUpdate = (update: UpdateTypeDetail) => {
        if (update.stateKey === stateKey) {
          plugin.onUpdate!({
            stateKey,
            cogsState: stateHandler,
            ...metadataContext,
            update,
            path: update.path,
            options,
            hookData: hookDataRef.current,
          });
        }
      };

      const unsubscribe = pluginStore
        .getState()
        .subscribeToUpdates(handleUpdate);
      return unsubscribe;
    }, [stateKey, stateHandler, metadataContext, plugin, options]);

    // Handle onFormUpdate
    useEffect(() => {
      if (!plugin.onFormUpdate) return;

      const handleFormUpdate = (event: {
        stateKey: string;
        type: 'focus' | 'blur' | 'input';
        path: string;
        value?: any;
      }) => {
        if (event.stateKey === stateKey) {
          const path = event.path.split('.');
          plugin.onFormUpdate!({
            stateKey,
            cogsState: stateHandler,
            ...metadataContext,
            path,
            event: {
              type: event.type,
              value: event.value,
            },
            options,
            hookData: hookDataRef.current,
          });
        }
      };

      const unsubscribe = pluginStore
        .getState()
        .subscribeToFormUpdates(handleFormUpdate);
      return unsubscribe;
    }, [stateKey, stateHandler, metadataContext, plugin, options]);

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
