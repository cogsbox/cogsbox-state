import { UpdateTypeDetail, StateObject } from './CogsState';

export type CogsPlugin<TState extends unknown = any, TOptions = any, THookReturn = any> = {
    useHook?: (state: StateObject<TState>, options: TOptions) => THookReturn;
    transformState?: (state: StateObject<TState>, options: TOptions, hookData?: THookReturn) => void;
    onUpdate?: (update: UpdateTypeDetail, options: TOptions, hookData?: THookReturn) => void;
};
export type PluginData = {
    plugin: CogsPlugin;
    options: any;
    hookData?: any;
};
export declare function createPluginWrapper<TState extends Record<string, any>>(): {
    createPlugin<TOptions>(): {
        transformState(transformFn: (state: StateObject<TState>, options: TOptions, ...args: never) => void): {
            onUpdate(updateHandler: (update: UpdateTypeDetail, options: TOptions, ...args: never) => void): CogsPlugin<TState, TOptions, never>;
        };
        useHook<THookReturn>(hookFn: (state: StateObject<TState>, options: TOptions) => THookReturn): {
            transformState(transformFn: (state: StateObject<TState>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                onUpdate(updateHandler: (update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): CogsPlugin<TState, TOptions, THookReturn>;
            };
        };
    };
};
//# sourceMappingURL=plugins.d.ts.map