import { create } from 'zustand';
import type { PluginData, StateObject, UpdateTypeDetail } from './CogsState';
import type { CogsPlugin } from './plugins';

type PluginRegistryStore = {
  stateHandlers: Map<string, StateObject<any>>; // stateKey -> handler
  registerStateHandler: (stateKey: string, handler: StateObject<any>) => void;
  registeredPlugins: readonly CogsPlugin<any, any, any, any>[];
  setRegisteredPlugins: (
    plugins: readonly CogsPlugin<any, any, any, any>[]
  ) => void;

  // Store options keyed by stateKey and pluginName
  pluginOptions: Map<string, Map<string, any>>; // stateKey -> pluginName -> options
  setPluginOptionsForState: (
    stateKey: string,
    pluginOptions: Record<string, any>
  ) => void;

  // Get all plugin configs for a specific stateKey
  getPluginConfigsForState: (stateKey: string) => Array<{
    plugin: CogsPlugin<any, any, any, any>;
    options: any;
  }>;
  updateSubscribers: Set<(update: UpdateTypeDetail) => void>;
  subscribeToUpdates: (
    callback: (update: UpdateTypeDetail) => void
  ) => () => void;
  notifyUpdate: (update: UpdateTypeDetail) => void;
  formUpdateSubscribers: Set<
    (event: {
      stateKey: string;
      type: 'focus' | 'blur' | 'input';
      path: string;
      value?: any;
    }) => void
  >;
  subscribeToFormUpdates: (
    callback: (event: {
      stateKey: string;
      type: 'focus' | 'blur' | 'input';
      path: string;
      value?: any;
    }) => void
  ) => () => void;
  notifyFormUpdate: (event: {
    stateKey: string;
    type: 'focus' | 'blur' | 'input';
    path: string;
    value?: any;
  }) => void;
  hookResults: Map<string, Map<string, any>>; // stateKey -> pluginName -> hook
  setHookResult: (stateKey: string, pluginName: string, data: any) => void;
  getHookResult: (stateKey: string, pluginName: string) => any | undefined;
  removeHookResult: (stateKey: string, pluginName: string) => void;
};

export const pluginStore = create<PluginRegistryStore>((set, get) => ({
  stateHandlers: new Map(),
  registerStateHandler: (stateKey, handler) =>
    set((state) => {
      const newMap = new Map(state.stateHandlers);
      newMap.set(stateKey, handler);
      console.log('addign handler', stateKey, handler);
      return { stateHandlers: newMap };
    }),
  registeredPlugins: [],
  pluginOptions: new Map(),

  setRegisteredPlugins: (plugins) => set({ registeredPlugins: plugins }),

  setPluginOptionsForState: (stateKey, pluginOptions) =>
    set((state) => {
      const newMap = new Map(state.pluginOptions);
      const statePluginMap = new Map();

      // Store each plugin's options
      Object.entries(pluginOptions).forEach(([pluginName, options]) => {
        // Only store if this is actually a registered plugin
        if (state.registeredPlugins.some((p) => p.name === pluginName)) {
          statePluginMap.set(pluginName, options);
        }
      });

      if (statePluginMap.size > 0) {
        newMap.set(stateKey, statePluginMap);
      }

      return { pluginOptions: newMap };
    }),

  getPluginConfigsForState: (stateKey) => {
    const state = get();
    const stateOptions = state.pluginOptions.get(stateKey);
    if (!stateOptions) return [];

    return state.registeredPlugins
      .map((plugin) => {
        const options = stateOptions.get(plugin.name);
        if (options !== undefined) {
          return { plugin, options };
        }
        return null;
      })
      .filter(Boolean) as Array<{
      plugin: CogsPlugin<any, any, any, any>;
      options: any;
    }>;
  },
  updateSubscribers: new Set(),
  subscribeToUpdates: (callback) => {
    const subscribers = get().updateSubscribers;
    subscribers.add(callback);
    // Return an unsubscribe function
    return () => {
      get().updateSubscribers.delete(callback);
    };
  },
  notifyUpdate: (update) => {
    // Call all registered subscribers with the update details
    get().updateSubscribers.forEach((callback) => callback(update));
  },
  formUpdateSubscribers: new Set(),
  subscribeToFormUpdates: (callback) => {
    const subscribers = get().formUpdateSubscribers;
    subscribers.add(callback);
    return () => {
      get().formUpdateSubscribers.delete(callback);
    };
  },
  notifyFormUpdate: (event) => {
    get().formUpdateSubscribers.forEach((callback) => callback(event));
  },
  hookResults: new Map(),

  setHookResult: (stateKey, pluginName, data) =>
    set((state) => {
      const next = new Map(state.hookResults);
      const byPlugin = new Map(next.get(stateKey) ?? new Map());
      if (data === undefined) byPlugin.delete(pluginName);
      else byPlugin.set(pluginName, data);
      if (byPlugin.size > 0) next.set(stateKey, byPlugin);
      else next.delete(stateKey);
      return { hookResults: next };
    }),

  getHookResult: (stateKey, pluginName) =>
    get().hookResults.get(stateKey)?.get(pluginName),

  removeHookResult: (stateKey, pluginName) =>
    set((state) => {
      const next = new Map(state.hookResults);
      const byPlugin = new Map(next.get(stateKey) ?? new Map());
      byPlugin.delete(pluginName);
      if (byPlugin.size > 0) next.set(stateKey, byPlugin);
      else next.delete(stateKey);
      return { hookResults: next };
    }),
}));
