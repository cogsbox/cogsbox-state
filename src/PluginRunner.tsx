import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useReducer,
  useSyncExternalStore,
} from 'react';
import { ClientActivityEvent, pluginStore } from './pluginStore';
import { isDeepEqual } from './utility';
import {
  createMetadataContext,
  createScopedMetadataContext,
  toDeconstructedMethods,
} from './plugins';
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
    plugin: CogsPlugin<any, any, any, any, any>;
    options: any;
    stateHandler: StateObject<any>;
  }) => {
    const [isInitialMount, setIsInitialMount] = useState(true);
    const metadataContext = useMemo(
      () => createMetadataContext(stateKey, plugin.name),
      [stateKey, plugin.name]
    );

    const deconstructed = useMemo(
      () => toDeconstructedMethods(stateHandler),
      [stateHandler]
    );

    const hookContext = useMemo(
      () => ({
        stateKey,
        pluginName: plugin.name,
        isInitialMount,
        options,
        ...deconstructed,
        ...metadataContext,
      }),
      [
        stateKey,
        plugin.name,
        isInitialMount,
        options,
        deconstructed,
        metadataContext,
      ]
    );

    const hookData = plugin.useHook ? plugin.useHook(hookContext) : undefined;

    useEffect(() => {
      setIsInitialMount(false);
    }, []);

    useEffect(() => {
      if (plugin.useHook) setHookResult(stateKey, plugin.name, hookData);
      else removeHookResult(stateKey, plugin.name);
      return () => removeHookResult(stateKey, plugin.name);
    }, [stateKey, plugin.name, !!plugin.useHook, hookData]);

    const lastProcessedOptionsRef = useRef<any>();
    const [isInitialTransform, setIsInitialTransform] = useState(true);

    useEffect(() => {
      if (plugin.transformState) {
        if (!isDeepEqual(options, lastProcessedOptionsRef.current)) {
          plugin.transformState({
            stateKey,
            pluginName: plugin.name,
            options,
            hookData,
            isInitialTransform,
            ...deconstructed,
            ...metadataContext,
          });
          lastProcessedOptionsRef.current = options;
          setIsInitialTransform(false);
        }
      }
    }, [
      stateKey,
      plugin,
      options,
      hookData,
      isInitialTransform,
      deconstructed,
      metadataContext,
    ]);

    const hookDataRef = useRef(hookData);
    hookDataRef.current = hookData;

    useEffect(() => {
      if (!plugin.onUpdate) return;

      const handleUpdate = (update: UpdateTypeDetail) => {
        if (update.stateKey === stateKey) {
          const scopedMetadata = createScopedMetadataContext(
            stateKey,
            plugin.name,
            update.path
          );

          plugin.onUpdate!({
            stateKey,
            pluginName: plugin.name,
            update,
            path: update.path,
            options,
            hookData: hookDataRef.current,
            ...deconstructed,
            ...scopedMetadata,
          });
        }
      };

      const unsubscribe = pluginStore
        .getState()
        .subscribeToUpdates(handleUpdate);
      return unsubscribe;
    }, [stateKey, plugin, options, deconstructed]);

    useEffect(() => {
      if (!plugin.onFormUpdate) return;

      const handleFormUpdate = (event: ClientActivityEvent) => {
        if (event.stateKey === stateKey) {
          const scopedMetadata = createScopedMetadataContext(
            stateKey,
            plugin.name,
            event.path
          );

          plugin.onFormUpdate!({
            stateKey,
            pluginName: plugin.name,
            path: event.path,
            event: event,
            options,
            hookData: hookDataRef.current,
            ...deconstructed,
            ...scopedMetadata,
          });
        }
      };

      const unsubscribe = pluginStore
        .getState()
        .subscribeToFormUpdates(handleFormUpdate);
      return unsubscribe;
    }, [stateKey, plugin, options, deconstructed]);

    return null;
  }
);

/**
 * Serializes the current plugin configuration into a stable snapshot string.
 * This is used by useSyncExternalStore to detect when the set of active
 * plugin instances changes.
 */
function getPluginSnapshot(): string {
  const { pluginOptions, stateHandlers, registeredPlugins } =
    pluginStore.getState();

  const entries: string[] = [];

  pluginOptions.forEach((pluginMap, stateKey) => {
    if (!stateHandlers.has(stateKey)) return;
    pluginMap.forEach((options, pluginName) => {
      if (registeredPlugins.some((p) => p.name === pluginName)) {
        entries.push(`${stateKey}:${pluginName}`);
      }
    });
  });

  return entries.sort().join('|');
}

/**
 * Builds the list of plugin instance descriptors from the store.
 */
function getPluginInstances(): Array<{
  key: string;
  stateKey: string;
  plugin: CogsPlugin<any, any, any, any, any>;
  options: any;
  stateHandler: StateObject<any>;
}> {
  const { pluginOptions, stateHandlers, registeredPlugins } =
    pluginStore.getState();

  const instances: Array<{
    key: string;
    stateKey: string;
    plugin: CogsPlugin<any, any, any, any, any>;
    options: any;
    stateHandler: StateObject<any>;
  }> = [];

  pluginOptions.forEach((pluginMap, stateKey) => {
    const stateHandler = stateHandlers.get(stateKey);
    if (!stateHandler) return;

    pluginMap.forEach((options, pluginName) => {
      const plugin = registeredPlugins.find((p) => p.name === pluginName);
      if (!plugin) return;

      instances.push({
        key: `${stateKey}:${pluginName}`,
        stateKey,
        plugin,
        options,
        stateHandler,
      });
    });
  });

  return instances;
}

/**
 * The main orchestrator component. It reads from the central pluginStore
 * and renders a `PluginInstance` controller for each active plugin.
 *
 * Uses useSyncExternalStore for reliable, tear-free reads from the
 * zustand store, ensuring React always sees a consistent snapshot.
 */
export function PluginRunner({ children }: { children: React.ReactNode }) {
  // Use useSyncExternalStore for reliable subscription to the plugin store.
  // The snapshot string changes whenever the set of active plugins changes,
  // which triggers a re-render.
  const snapshot = useSyncExternalStore(
    pluginStore.subscribe,
    getPluginSnapshot,
    getPluginSnapshot // SSR fallback
  );

  // Derive the actual instances to render. This is memoized on the snapshot
  // string so we only rebuild when the plugin set actually changes.
  const instances = useMemo(() => getPluginInstances(), [snapshot]);

  return (
    <>
      {instances.map((instance) => (
        <PluginInstance
          key={instance.key}
          stateKey={instance.stateKey}
          plugin={instance.plugin}
          options={instance.options}
          stateHandler={instance.stateHandler}
        />
      ))}
      {children}
    </>
  );
}
