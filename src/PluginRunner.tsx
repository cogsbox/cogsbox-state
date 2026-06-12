import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useRef,
  useSyncExternalStore,
  type ReactNode,
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
    plugin: CogsPlugin<any, any, any, any, any, any, any>;
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

    useLayoutEffect(() => {
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
          // Create a new, SCOPED context for this specific path
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

      const handleFormUpdate = (
        event: ClientActivityEvent // Use the proper type
      ) => {
        if (event.stateKey === stateKey) {
          // Create a new, SCOPED context for this specific path
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
            ...scopedMetadata, // <-- Use the new scoped context
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
 * The main orchestrator component. It reads from the central pluginStore
 * and renders a `PluginInstance` controller for each active plugin.
 */
export function PluginRunner({ children }: { children: ReactNode }) {
  const { pluginOptions, stateHandlers, registeredPlugins } =
    useSyncExternalStore(
      pluginStore.subscribe,
      () => pluginStore.getState(),
      () => pluginStore.getState()
    );

  const pluginNeedsRunner = (
    plugin: CogsPlugin<any, any, any, any, any, any, any>
  ) =>
    !!(
      plugin.useHook ||
      plugin.transformState ||
      plugin.onUpdate ||
      plugin.onFormUpdate
    );

  return (
    <>
      {Array.from(stateHandlers.entries()).flatMap(([stateKey, stateHandler]) =>
        registeredPlugins.filter(pluginNeedsRunner).map((plugin) => {
          const options =
            pluginOptions.get(stateKey)?.get(plugin.name) ?? {};

          return (
            <PluginInstance
              key={`${stateKey}:${plugin.name}`}
              stateKey={stateKey}
              plugin={plugin}
              options={options}
              stateHandler={stateHandler}
            />
          );
        })
      )}

      {children}
    </>
  );
}
