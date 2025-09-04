import { StateObject, UpdateTypeDetail } from './CogsState';
import { CogsPlugin } from './plugins';

type PluginRegistryStore = {
    stateHandlers: Map<string, StateObject<any>>;
    registerStateHandler: (stateKey: string, handler: StateObject<any>) => void;
    registeredPlugins: readonly CogsPlugin<any, any, any, any>[];
    setRegisteredPlugins: (plugins: readonly CogsPlugin<any, any, any, any>[]) => void;
    pluginOptions: Map<string, Map<string, any>>;
    setPluginOptionsForState: (stateKey: string, pluginOptions: Record<string, any>) => void;
    getPluginConfigsForState: (stateKey: string) => Array<{
        plugin: CogsPlugin<any, any, any, any>;
        options: any;
    }>;
    updateSubscribers: Set<(update: UpdateTypeDetail) => void>;
    subscribeToUpdates: (callback: (update: UpdateTypeDetail) => void) => () => void;
    notifyUpdate: (update: UpdateTypeDetail) => void;
    formUpdateSubscribers: Set<(event: {
        stateKey: string;
        type: 'focus' | 'blur' | 'input';
        path: string;
        value?: any;
    }) => void>;
    subscribeToFormUpdates: (callback: (event: {
        stateKey: string;
        type: 'focus' | 'blur' | 'input';
        path: string;
        value?: any;
    }) => void) => () => void;
    notifyFormUpdate: (event: {
        stateKey: string;
        type: 'focus' | 'blur' | 'input';
        path: string;
        value?: any;
    }) => void;
};
export declare const pluginStore: import('zustand').UseBoundStore<import('zustand').StoreApi<PluginRegistryStore>>;
export {};
//# sourceMappingURL=pluginStore.d.ts.map