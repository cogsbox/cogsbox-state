import { StateObject, UpdateTypeDetail } from './CogsState';
import { CogsPlugin } from './plugins';

export type ClientActivityEvent = {
    stateKey: string;
    path: string[];
    timestamp: number;
    duration?: number;
} & ({
    activityType: 'focus';
    details: {
        cursorPosition?: number;
    };
} | {
    activityType: 'blur';
    details: {
        duration: number;
    };
} | {
    activityType: 'input';
    details: {
        value: any;
        inputLength?: number;
        isComposing?: boolean;
        isPasting?: boolean;
        keystrokeCount?: number;
    };
} | {
    activityType: 'select';
    details: {
        selectionStart: number;
        selectionEnd: number;
        selectedText?: string;
    };
} | {
    activityType: 'hover_enter';
    details: {
        cursorPosition?: number;
    };
} | {
    activityType: 'hover_exit';
    details: {
        duration: number;
    };
} | {
    activityType: 'scroll';
    details: {
        scrollTop: number;
        scrollLeft: number;
    };
} | {
    activityType: 'cursor_move';
    details: {
        cursorPosition: number;
    };
});
type PluginRegistryStore = {
    stateHandlers: Map<string, StateObject<any>>;
    registerStateHandler: (stateKey: string, handler: StateObject<any>) => void;
    registeredPlugins: readonly CogsPlugin<any, any, any, any, any>[];
    setRegisteredPlugins: (plugins: readonly CogsPlugin<any, any, any, any, any>[]) => void;
    pluginOptions: Map<string, Map<string, any>>;
    setPluginOptionsForState: (stateKey: string, pluginOptions: Record<string, any>) => void;
    getPluginConfigsForState: (stateKey: string) => Array<{
        plugin: CogsPlugin<any, any, any, any, any>;
        options: any;
    }>;
    updateSubscribers: Set<(update: UpdateTypeDetail) => void>;
    subscribeToUpdates: (callback: (update: UpdateTypeDetail) => void) => () => void;
    notifyUpdate: (update: UpdateTypeDetail) => void;
    formUpdateSubscribers: Set<(event: ClientActivityEvent) => void>;
    subscribeToFormUpdates: (callback: (event: ClientActivityEvent) => void) => () => void;
    notifyFormUpdate: (event: ClientActivityEvent) => void;
    hookResults: Map<string, Map<string, any>>;
    setHookResult: (stateKey: string, pluginName: string, data: any) => void;
    getHookResult: (stateKey: string, pluginName: string) => any | undefined;
    removeHookResult: (stateKey: string, pluginName: string) => void;
};
export declare const pluginStore: import('zustand').UseBoundStore<import('zustand').StoreApi<PluginRegistryStore>>;
export {};
//# sourceMappingURL=pluginStore.d.ts.map