import React, { useEffect, useRef, useState } from 'react';
import { pluginStore } from './pluginStore';
import { getGlobalStore } from './store';
import { isDeepEqual } from './utility';
import type { UpdateTypeDetail } from './CogsState';

export function PluginRunner({ children }: { children: React.ReactNode }) {
  const [, forceUpdate] = useState({});
  const lastProcessedOptionsRef = useRef<Map<string, any>>(new Map());

  // Subscribe to the store to re-render when plugins or options are registered
  useEffect(() => {
    const unsubscribe = pluginStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const state = pluginStore.getState();

  // --- PHASE 1: Run hooks and collect results for this render ---
  const hookResults = new Map<string, any>();
  state.pluginOptions.forEach((pluginMap, stateKey) => {
    const stateHandler = state.stateHandlers.get(stateKey);
    if (!stateHandler) return;

    state.registeredPlugins.forEach((plugin) => {
      const options = pluginMap.get(plugin.name);
      if (options === undefined) return;

      if (plugin.useHook) {
        const configKey = `${stateKey}:${plugin.name}`;
        const context = {
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
        };
        const hookResult = plugin.useHook(context, options);
        hookResults.set(configKey, hookResult);
      }
    });
  });

  // Use refs to give the long-lived update handler access to the latest data
  const stateRef = useRef(state);
  stateRef.current = state;
  const hookResultsRef = useRef(hookResults);
  hookResultsRef.current = hookResults;

  // --- PHASE 2: Set up listeners for onUpdate and transformState ---
  useEffect(() => {
    // This effect runs only on mount to set up the update listener
    const handleUpdate = (update: UpdateTypeDetail) => {
      const currentState = stateRef.current;
      const currentHookResults = hookResultsRef.current;
      const { stateKey } = update;

      const stateHandler = currentState.stateHandlers.get(stateKey);
      const pluginMap = currentState.pluginOptions.get(stateKey);

      if (!stateHandler || !pluginMap) return;

      currentState.registeredPlugins.forEach((plugin) => {
        if (plugin.onUpdate && pluginMap.has(plugin.name)) {
          const options = pluginMap.get(plugin.name);
          const configKey = `${stateKey}:${plugin.name}`;
          const hookData = currentHookResults.get(configKey);

          plugin.onUpdate(stateKey, update, options, hookData);
        }
      });
    };

    const unsubscribe = pluginStore.getState().subscribeToUpdates(handleUpdate);
    return unsubscribe;
  }, []); // Empty dependency array ensures this runs only once

  // --- PHASE 3: Run transformState when options change ---
  // This logic runs on every render to check if options have changed
  state.pluginOptions.forEach((pluginMap, stateKey) => {
    const stateHandler = state.stateHandlers.get(stateKey);
    if (!stateHandler) return;

    state.registeredPlugins.forEach((plugin) => {
      if (plugin.transformState) {
        const options = pluginMap.get(plugin.name);
        if (options === undefined) return;

        const configKey = `${stateKey}:${plugin.name}`;
        const lastOptions = lastProcessedOptionsRef.current.get(configKey);

        if (!isDeepEqual(options, lastOptions)) {
          const context = {
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
          };
          const hookData = hookResults.get(configKey);
          plugin.transformState(context, options, hookData);
          lastProcessedOptionsRef.current.set(configKey, options);
        }
      }
    });
  });

  return <>{children}</>;
}
