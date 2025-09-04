import { UpdateTypeDetail, StateObject } from './CogsState';

export type KeyedTypes<TMap extends Record<string, any>> = {
    __key: 'keyed';
    map: {
        [K in keyof TMap]: TMap[K];
    };
};
export type PluginContext<TState, TMetaData> = {
    [K in keyof TState]: {
        stateKey: K;
        cogsState: StateObject<TState[K]>;
        getPluginMetaData: () => TMetaData | undefined;
        /** Sets/merges the metadata for this plugin at the current state path */
        setPluginMetaData: (data: Partial<TMetaData>) => void;
        /** Removes all metadata for this plugin at the current state path */
        removePluginMetaData: () => void;
    };
}[keyof TState];
export type CogsPlugin<TName extends string, TState = any, TOptions = any, THookReturn = any, TPluginMetaData = any> = {
    name: TName;
    useHook?: (context: PluginContext<TState, TPluginMetaData>, options: TOptions) => THookReturn;
    transformState?: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, hook?: THookReturn) => void;
    onUpdate?: (stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn) => void;
    onFormUpdate?: (stateKey: keyof TState, event: {
        type: 'focus' | 'blur' | 'input';
        path: string;
        value?: any;
    }, options: TOptions, hook?: THookReturn) => void;
    formWrapper?: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, hook?: THookReturn) => React.ReactNode;
};
export type ExtractPluginOptions<TPlugins extends readonly CogsPlugin<any, any, any>[]> = {
    [P in TPlugins[number] as P['name']]?: P extends CogsPlugin<any, infer O, any> ? O : never;
};
export declare function createPluginContext<TState extends Record<string, any>, TOptions = unknown, TPluginMetaData extends Record<string, any> = {}>(): {
    createPlugin: <TName extends string>(name: TName) => {
        name: TName;
        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
        onFormUpdate?: ((stateKey: keyof TState, event: {
            type: "focus" | "blur" | "input";
            path: string;
            value?: any;
        }, options: TOptions, hook?: undefined) => void) | undefined;
        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
    } & {
        transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
            name: TName;
            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
            onFormUpdate?: ((stateKey: keyof TState, event: {
                type: "focus" | "blur" | "input";
                path: string;
                value?: any;
            }, options: TOptions, hook?: undefined) => void) | undefined;
            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
        } & {
            onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                type: "focus" | "blur" | "input";
                path: string;
                value?: any;
            }, options: TOptions, ...args: never) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        };
    } & {
        onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
            name: TName;
            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
            onFormUpdate?: ((stateKey: keyof TState, event: {
                type: "focus" | "blur" | "input";
                path: string;
                value?: any;
            }, options: TOptions, hook?: undefined) => void) | undefined;
            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
        } & {
            transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                type: "focus" | "blur" | "input";
                path: string;
                value?: any;
            }, options: TOptions, ...args: never) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        };
    } & {
        onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
            type: "focus" | "blur" | "input";
            path: string;
            value?: any;
        }, options: TOptions, ...args: never) => void): {
            name: TName;
            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
            onFormUpdate?: ((stateKey: keyof TState, event: {
                type: "focus" | "blur" | "input";
                path: string;
                value?: any;
            }, options: TOptions, hook?: undefined) => void) | undefined;
            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
        } & {
            transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        };
    } & {
        formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => React.ReactNode): {
            name: TName;
            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
            onFormUpdate?: ((stateKey: keyof TState, event: {
                type: "focus" | "blur" | "input";
                path: string;
                value?: any;
            }, options: TOptions, hook?: undefined) => void) | undefined;
            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
        } & {
            transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                type: "focus" | "blur" | "input";
                path: string;
                value?: any;
            }, options: TOptions, ...args: never) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            } & {
                onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: never) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: never) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => never) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: undefined) => React.ReactNode) | undefined;
                    };
                };
            };
        };
    } & {
        useHook<THookReturn>(hookFn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions) => THookReturn): {
            name: TName;
            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
            onFormUpdate?: ((stateKey: keyof TState, event: {
                type: "focus" | "blur" | "input";
                path: string;
                value?: any;
            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
        } & {
            transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
            } & {
                onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            };
        } & {
            onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            };
        } & {
            onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                type: "focus" | "blur" | "input";
                path: string;
                value?: any;
            }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            };
        } & {
            formWrapper(fn: (element: React.ReactNode, context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => React.ReactNode): {
                name: TName;
                useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                onFormUpdate?: ((stateKey: keyof TState, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
            } & {
                transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                onFormUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, event: {
                    type: "focus" | "blur" | "input";
                    path: string;
                    value?: any;
                }, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                    name: TName;
                    useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                    transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    onFormUpdate?: ((stateKey: keyof TState, event: {
                        type: "focus" | "blur" | "input";
                        path: string;
                        value?: any;
                    }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                    formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                } & {
                    transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    onUpdate(fn: (context: PluginContext<TState, TPluginMetaData>, update: UpdateTypeDetail, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                        name: TName;
                        useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                        transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        onFormUpdate?: ((stateKey: keyof TState, event: {
                            type: "focus" | "blur" | "input";
                            path: string;
                            value?: any;
                        }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                        formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                    } & {
                        transformState(fn: (context: PluginContext<TState, TPluginMetaData>, options: TOptions, ...args: THookReturn extends never ? [] : [hookData: THookReturn]) => void): {
                            name: TName;
                            useHook?: ((context: PluginContext<TState, any>, options: TOptions) => THookReturn) | undefined;
                            transformState?: ((context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onUpdate?: ((stateKey: keyof TState, update: UpdateTypeDetail, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            onFormUpdate?: ((stateKey: keyof TState, event: {
                                type: "focus" | "blur" | "input";
                                path: string;
                                value?: any;
                            }, options: TOptions, hook?: THookReturn | undefined) => void) | undefined;
                            formWrapper?: ((element: React.ReactNode, context: PluginContext<TState, any>, options: TOptions, hook?: THookReturn | undefined) => React.ReactNode) | undefined;
                        };
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=plugins.d.ts.map