import { UpdateTypeDetail, StateObject } from './CogsState';

export type KeyedTypes<TMap extends Record<string, any>> = {
    __key: 'keyed';
    map: {
        [K in keyof TMap]: TMap[K];
    };
};
/**
 * Base context available to all plugin methods.
 * Provides access to state and metadata storage at both root and path levels.
 */
type BaseContext<TState, TKey extends keyof TState, TPluginMetaData, TFieldMetaData> = {
    /** The key identifying which state this plugin is operating on */
    stateKey: TKey;
    /** The root-level state object with all Cogs state methods ($update, $get, etc.) */
    cogsState: StateObject<TState[TKey]>;
    /**
     * Get plugin metadata stored at the root level (path: []).
     * Use for plugin-wide state like sessionIds, feature flags, etc.
     * @returns The plugin's root metadata or undefined if not set
     */
    getPluginMetaData: () => TPluginMetaData | undefined;
    /**
     * Set plugin metadata at the root level (path: []).
     * Merges with existing metadata.
     * @param data - Partial metadata to merge with existing root metadata
     */
    setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
    /**
     * Remove all plugin metadata at the root level.
     * Clears all root-level plugin state.
     */
    removePluginMetaData: () => void;
    /**
     * Get plugin metadata stored at a specific path.
     * Use for field-specific state like validation errors, sync versions per path.
     * @param path - The state path to get metadata from (e.g., ['users', '0', 'email'])
     * @returns The metadata at that path or undefined if not set
     */
    getFieldMetaData: (path: string[]) => TFieldMetaData | undefined;
    /**
     * Set plugin metadata at a specific path.
     * Merges with existing metadata at that path.
     * @param path - The state path to store metadata at (e.g., ['users', '0', 'email'])
     * @param data - Partial metadata to merge with existing metadata at path
     */
    setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) => void;
    /**
     * Remove plugin metadata at a specific path.
     * Clears all metadata for this plugin at the specified path.
     * @param path - The state path to remove metadata from
     */
    removeFieldMetaData: (path: string[]) => void;
};
/**
 * Parameters passed to the useHook method.
 * Called once when plugin is initialized to set up React hooks.
 */
export type UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData> = {
    [K in keyof TState]: BaseContext<TState, K, TPluginMetaData, TFieldMetaData> & {
        /**
         * Plugin-specific options passed when registering the plugin.
         * @example { syncEnabled: true, debounceMs: 500 }
         */
        options: TOptions;
        /**
         * The name identifier of this plugin.
         * Useful for debugging or conditional logic.
         */
        pluginName: string;
        /**
         * True on the very first mount, false on all subsequent renders.
         * Use to run initialization logic only once.
         */
        isInitialMount: boolean;
    };
}[keyof TState];
/**
 * Parameters passed to the transformState method.
 * Called to transform/modify state based on plugin logic.
 */
export type TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData> = {
    [K in keyof TState]: BaseContext<TState, K, TPluginMetaData, TFieldMetaData> & {
        /** Plugin-specific options */
        options: TOptions;
        /**
         * Data returned from useHook if defined.
         * Will be undefined if plugin has no useHook.
         */
        hookData?: THookReturn;
        /**
         * The state value before this transformation.
         * Useful for computing deltas or conditional transforms.
         */
        previousState?: TState[K];
        /**
         * True on the first transform call, false on subsequent calls.
         * Use to differentiate initial setup from updates.
         */
        isInitialTransform: boolean;
    };
}[keyof TState];
/**
 * Parameters passed to the onUpdate method.
 * Called whenever state is updated through any mechanism.
 */
export type OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData> = {
    [K in keyof TState]: BaseContext<TState, K, TPluginMetaData, TFieldMetaData> & {
        /**
         * The update operation details including type, path, and value.
         * Contains all information about what changed.
         */
        update: UpdateTypeDetail;
        /**
         * The path that was updated (extracted from update.path for convenience).
         * @example ['users', '0', 'name'] for updating a user's name
         */
        path?: string[];
        /** Plugin-specific options */
        options: TOptions;
        /**
         * Data returned from useHook if defined.
         * Will be undefined if plugin has no useHook.
         */
        hookData?: THookReturn;
        /**
         * The value at this path before the update.
         * Undefined if path didn't exist before.
         */
        previousValue?: any;
        /**
         * The value at this path after the update.
         * The current value at the updated path.
         */
        nextValue?: any;
        /**
         * Where this update originated from.
         * 'user' = user interaction, 'plugin' = plugin code, 'system' = framework
         */
        updateSource?: 'user' | 'plugin' | 'system';
    };
}[keyof TState];
/**
 * Parameters passed to the onFormUpdate method.
 * Called for form-specific events (focus, blur, input).
 */
export type OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData> = {
    [K in keyof TState]: BaseContext<TState, K, TPluginMetaData, TFieldMetaData> & {
        /**
         * Path to the form field that triggered this event.
         * @example ['user', 'email'] for an email input field
         */
        path: string[];
        /**
         * The form event details.
         * type: 'focus' | 'blur' | 'input' - the type of form event
         * value: The current value of the form field (for input events)
         */
        event: {
            /** Type of form interaction */
            type: 'focus' | 'blur' | 'input';
            /** Current field value (primarily for input events) */
            value?: any;
            /** Current field path (primarily for input events) */
            path: string[];
        };
        /** Plugin-specific options */
        options: TOptions;
        /**
         * Data returned from useHook if defined.
         * Will be undefined if plugin has no useHook.
         */
        hookData?: THookReturn;
        /**
         * Additional field metadata like validation rules, field type, etc.
         * Can be used to customize behavior per field.
         */
        fieldMetadata?: any;
        /**
         * Current state of the form.
         * Useful for conditional logic based on form lifecycle.
         */
        formState?: 'pristine' | 'dirty' | 'submitting' | 'submitted';
    };
}[keyof TState];
/**
 * Parameters passed to the formWrapper method.
 * Used to wrap form elements with additional UI/behavior.
 */
export type FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData> = {
    [K in keyof TState]: {
        /**
         * The form element to wrap (input, select, textarea, etc.).
         * This is the actual React element that will be enhanced.
         */
        element: React.ReactNode;
        /**
         * Path to this specific form field.
         * @example ['address', 'street'] for a street address input
         */
        path: string[];
        /** The state key this form field belongs to */
        stateKey: K;
        /** Root-level state object with all Cogs methods */
        cogsState: StateObject<TState[K]>;
        /**
         * Get plugin metadata stored at the root level (path: []).
         * Use for plugin-wide state.
         * @returns The plugin's root metadata or undefined
         */
        getPluginMetaData: () => TPluginMetaData | undefined;
        /**
         * Set plugin metadata at the root level (path: []).
         * @param data - Partial metadata to merge with existing
         */
        setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
        /** Remove all plugin metadata at the root level */
        removePluginMetaData: () => void;
        /**
         * Get plugin metadata for this specific field.
         * @param path - The field path (must be explicitly provided)
         * @returns The field metadata or undefined
         */
        getFieldMetaData: (path: string[]) => TFieldMetaData | undefined;
        /**
         * Set plugin metadata for this specific field.
         * @param path - The field path (must be explicitly provided)
         * @param data - Partial metadata to merge
         */
        setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) => void;
        /**
         * Remove plugin metadata for this specific field.
         * @param path - The field path to clear
         */
        removeFieldMetaData: (path: string[]) => void;
        /** Plugin-specific options */
        options: TOptions;
        /**
         * Data returned from useHook if defined.
         * Will be undefined if plugin has no useHook.
         */
        hookData?: THookReturn;
        /**
         * Type of form field (text, number, email, etc.).
         * Can be used to apply type-specific wrapping logic.
         */
        fieldType?: string;
        /**
         * Depth of wrapper nesting for this field.
         * Useful when multiple plugins wrap the same field.
         */
        wrapperDepth?: number;
    };
}[keyof TState];
/**
 * Plugin type definition.
 * Represents a complete plugin with all its lifecycle methods.
 */
export type CogsPlugin<TName extends string, TState = any, TOptions = any, THookReturn = any, TPluginMetaData = any, TFieldMetaData = any> = {
    /** Unique identifier for this plugin */
    name: TName;
    /**
     * Hook method for React integration.
     * Called once on mount to set up hooks, subscriptions, etc.
     */
    useHook?: (params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn;
    /**
     * Transform state on initialization or when options change.
     * Use for setting default values, initial sync, etc.
     */
    transformState?: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void;
    /**
     * React to any state updates.
     * Called after state changes for side effects, sync, logging, etc.
     */
    onUpdate?: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void;
    /**
     * Handle form-specific events.
     * Called for focus, blur, and input events on form fields.
     */
    onFormUpdate?: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void;
    /**
     * Wrap form elements with additional UI.
     * Returns enhanced element with validation messages, loading states, etc.
     */
    formWrapper?: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode;
};
/**
 * Extract plugin options type from a tuple of plugins.
 * Creates a mapped type of plugin names to their options.
 */
export type ExtractPluginOptions<TPlugins extends readonly CogsPlugin<any, any, any>[]> = {
    [P in TPlugins[number] as P['name']]?: P extends CogsPlugin<any, any, infer O, any> ? O : never;
};
export declare function createMetadataContext<TPluginMetaData, TFieldMetaData>(stateKey: string, pluginName: string): {
    getPluginMetaData: () => TPluginMetaData | undefined;
    setPluginMetaData: (data: Partial<TPluginMetaData>) => void;
    removePluginMetaData: () => void;
    getFieldMetaData: (path: string[]) => TFieldMetaData | undefined;
    setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) => void;
    removeFieldMetaData: (path: string[]) => void;
};
/**
 * Create a plugin context factory for a specific state shape.
 * @param TState - The shape of your application state
 * @param TOptions - Common options type for all plugins
 * @param TPluginMetaData - Type for root-level plugin metadata
 * @param TFieldMetaData - Type for field-level plugin metadata
 */
export declare function createPluginContext<TState extends Record<string, any>, TOptions = unknown, TPluginMetaData extends Record<string, any> = {}, TFieldMetaData extends Record<string, any> = {}>(): {
    createPlugin: <TName extends string>(name: TName) => {
        name: TName;
        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
    } & {
        /** Define state transformation logic */
        transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
            name: TName;
            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
            transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
        } & {
            /** React to state updates */
            onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** Handle form events */
                onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** Wrap form elements */
                formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            /** Handle form events */
            onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** React to state updates */
                onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** Wrap form elements */
                formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            /** Wrap form elements */
            formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** React to state updates */
                onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** Handle form events */
                onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        };
    } & {
        /** React to state updates */
        onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
            name: TName;
            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
            transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
        } & {
            /** Define state transformation logic */
            transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** Handle form events */
                onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** Wrap form elements */
                formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            /** Handle form events */
            onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** Define state transformation logic */
                transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** Wrap form elements */
                formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            /** Wrap form elements */
            formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** Define state transformation logic */
                transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** Handle form events */
                onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        };
    } & {
        /** Handle form events */
        onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
            name: TName;
            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
            transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
        } & {
            /** Define state transformation logic */
            transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** React to state updates */
                onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** Wrap form elements */
                formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            /** React to state updates */
            onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** Define state transformation logic */
                transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** Wrap form elements */
                formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            /** Wrap form elements */
            formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** Define state transformation logic */
                transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** React to state updates */
                onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        };
    } & {
        /** Wrap form elements */
        formWrapper(fn: (params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
            name: TName;
            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
            transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
        } & {
            /** Define state transformation logic */
            transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** React to state updates */
                onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** Handle form events */
                onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            /** React to state updates */
            onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** Define state transformation logic */
                transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** Handle form events */
                onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        } & {
            /** Handle form events */
            onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** Define state transformation logic */
                transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            } & {
                /** React to state updates */
                onUpdate(fn: (params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => never) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, never, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    };
                };
            };
        };
    } & {
        useHook<THookReturn>(hookFn: (params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn): {
            name: TName;
            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
        } & {
            /** Define state transformation logic */
            transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** React to state updates */
                onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Wrap form elements */
                        formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Handle form events */
                        onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                /** Handle form events */
                onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Wrap form elements */
                        formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** React to state updates */
                        onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                /** Wrap form elements */
                formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Handle form events */
                        onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** React to state updates */
                        onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            };
        } & {
            /** React to state updates */
            onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** Define state transformation logic */
                transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Wrap form elements */
                        formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Handle form events */
                        onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                /** Handle form events */
                onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Wrap form elements */
                        formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Define state transformation logic */
                        transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                /** Wrap form elements */
                formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Handle form events */
                        onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Define state transformation logic */
                        transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            };
        } & {
            /** Handle form events */
            onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** Define state transformation logic */
                transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Wrap form elements */
                        formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** React to state updates */
                        onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                /** React to state updates */
                onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Wrap form elements */
                        formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** Wrap form elements */
                    formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Define state transformation logic */
                        transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                /** Wrap form elements */
                formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** React to state updates */
                        onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Define state transformation logic */
                        transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            };
        } & {
            /** Wrap form elements */
            formWrapper(fn: (params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode): {
                name: TName;
                useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
            } & {
                /** Define state transformation logic */
                transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Handle form events */
                        onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** React to state updates */
                        onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                /** React to state updates */
                onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Handle form events */
                        onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** Handle form events */
                    onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Define state transformation logic */
                        transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            } & {
                /** Handle form events */
                onFormUpdate(fn: (params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                    name: TName;
                    useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                    transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                    formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                } & {
                    /** Define state transformation logic */
                    transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** React to state updates */
                        onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                } & {
                    /** React to state updates */
                    onUpdate(fn: (params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                        name: TName;
                        useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                        transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                        formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                    } & {
                        /** Define state transformation logic */
                        transformState(fn: (params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void): {
                            name: TName;
                            useHook?: ((params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>) => THookReturn) | undefined;
                            transformState?: ((params: TransformStateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onUpdate?: ((params: OnUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            onFormUpdate?: ((params: OnFormUpdateParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => void) | undefined;
                            formWrapper?: ((params: FormWrapperParams<TState, TOptions, THookReturn, TPluginMetaData, TFieldMetaData>) => React.ReactNode) | undefined;
                        };
                    };
                };
            };
        };
    };
};
export {};
//# sourceMappingURL=plugins.d.ts.map