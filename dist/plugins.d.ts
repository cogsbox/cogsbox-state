import { UpdateTypeDetail, StateObject } from './CogsState';

type PluginContext<TState> = {
    [K in keyof TState]: {
        stateKey: K;
        cogsState: StateObject<TState[K]>;
    };
}[keyof TState];
export type CogsPlugin<TState = any, TOptions = any, THookReturn = any> = {
    name: string;
    useHook?: (context: PluginContext<TState>, options: TOptions) => THookReturn;
    transformState?: (context: PluginContext<TState>, options: TOptions, hook?: THookReturn) => void;
    onUpdate?: (stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn) => void;
};
export type ExtractPluginOptions<TPlugins extends readonly CogsPlugin<any, any, any>[]> = {
    [P in TPlugins[number] as P['name']]?: P extends CogsPlugin<any, infer O, any> ? O : never;
};
export type PluginInstance<TState = any, TOptions = any, THookReturn = any> = {
    plugin: CogsPlugin<TState, TOptions, THookReturn>;
    options: TOptions;
};
export declare function createPluginContext<TState extends Record<string, any> = any>(): {
    createPlugin: <TOptions = any>(name: string) => CogsPlugin<TState, TOptions, any> & {
        useHook<THookReturn>(hookFn: (context: PluginContext<TState>, options: TOptions) => THookReturn): CogsPlugin<TState, TOptions, THookReturn> & {
            transformState(transformFn: (context: PluginContext<TState>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): CogsPlugin<TState, TOptions, THookReturn> & {
                onUpdate(updateHandler: (context: PluginContext<TState>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): CogsPlugin<TState, TOptions, THookReturn>;
            };
            onUpdate(updateHandler: (context: PluginContext<TState>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): CogsPlugin<TState, TOptions, THookReturn>;
        };
        transformState(transformFn: (context: PluginContext<TState>, options: TOptions) => void): CogsPlugin<TState, TOptions, any> & {
            onUpdate(updateHandler: (context: PluginContext<TState>, update: UpdateTypeDetail, options: TOptions) => void): CogsPlugin<TState, TOptions, any>;
        };
        onUpdate(updateHandler: (context: PluginContext<TState>, update: UpdateTypeDetail, options: TOptions) => void): CogsPlugin<TState, TOptions, any>;
    };
};
export {};
//# sourceMappingURL=plugins.d.ts.map