import { UpdateTypeDetail, StateObject, PluginData } from './CogsState';

export type KeyedTypes<TMap extends Record<string, any>> = {
    __key: 'keyed';
    map: {
        [K in keyof TMap]: TMap[K];
    };
};
type PluginContext<TState> = {
    [K in keyof TState]: {
        stateKey: K;
        cogsState: StateObject<TState[K]>;
    };
}[keyof TState];
export type CogsPlugin<TName extends string, TState = any, TOptions = any, THookReturn = any> = {
    name: TName;
    useHook?: (context: PluginContext<TState>, options: TOptions) => THookReturn;
    transformState?: (context: PluginContext<TState>, options: TOptions, hook?: THookReturn) => void;
    onUpdate?: (stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn) => void;
};
export type ExtractPluginOptions<TPlugins extends readonly CogsPlugin<any, any, any>[]> = {
    [P in TPlugins[number] as P['name']]?: P extends CogsPlugin<any, infer O, any> ? O : never;
};
export declare function createPluginContext<TState extends Record<string, any>, TOptions = unknown>(): {
    createPlugin: <TName extends string>(name: TName) => {
        name: TName;
        useHook?: ((context: PluginContext<TState>, options: TOptions) => any) | undefined;
        transformState?: ((context: PluginContext<TState>, options: TOptions, hook?: any) => void) | undefined;
        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: any) => void) | undefined;
    } & {
        useHook<THookReturn>(hookFn: (context: PluginContext<TState>, options: TOptions) => THookReturn): {
            name: TName;
            useHook?: ((context: PluginContext<TState>, options: TOptions) => THookReturn) | undefined;
            transformState?: ((context: PluginContext<TState>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
        } & {
            transformState(transformFn: (context: PluginContext<TState>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState>, options: TOptions) => THookReturn) | undefined;
                transformState?: ((context: PluginContext<TState>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
            } & {
                onUpdate(updateHandler: (context: PluginContext<TState>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                };
            };
            onUpdate(updateHandler: (context: PluginContext<TState>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState>, options: TOptions) => THookReturn) | undefined;
                transformState?: ((context: PluginContext<TState>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
            };
        };
        transformState(transformFn: (context: PluginContext<TState>, options: TOptions) => void): {
            name: TName;
            useHook?: ((context: PluginContext<TState>, options: TOptions) => any) | undefined;
            transformState?: ((context: PluginContext<TState>, options: TOptions, hook?: any) => void) | undefined;
            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: any) => void) | undefined;
        } & {
            onUpdate(updateHandler: (context: PluginContext<TState>, update: UpdateTypeDetail, options: TOptions) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState>, options: TOptions) => any) | undefined;
                transformState?: ((context: PluginContext<TState>, options: TOptions, hook?: any) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: any) => void) | undefined;
            };
        };
        onUpdate(updateHandler: (context: PluginContext<TState>, update: UpdateTypeDetail, options: TOptions) => void): {
            name: TName;
            useHook?: ((context: PluginContext<TState>, options: TOptions) => any) | undefined;
            transformState?: ((context: PluginContext<TState>, options: TOptions, hook?: any) => void) | undefined;
            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: any) => void) | undefined;
        };
    };
};
export declare const PluginExecutor: ({ plugin, pluginOptions, cogsContext, pluginDataRef, }: {
    plugin: CogsPlugin<any, any, any, any>;
    pluginOptions: any;
    cogsContext: PluginContext<any>;
    pluginDataRef: React.MutableRefObject<PluginData[]>;
}) => null;
export {};
//# sourceMappingURL=plugins.d.ts.map