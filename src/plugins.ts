import { UpdateTypeDetail, StateObject, PluginData } from './CogsState';
import { useState, useEffect } from 'react';
import { getGlobalStore } from './store';
type Prettify<T> = { [K in keyof T]: T[K] } & {};

// Your refined, more explicit version.
export type KeyedTypes<TMap extends Record<string, any>> = {
  __key: 'keyed';
  map: { [K in keyof TMap]: TMap[K] };
};

/**
 * Base context available to all plugin methods.
 * Provides access to state and metadata storage at both root and path levels.
 */
type BaseContext<
  TState,
  TKey extends keyof TState,
  TPluginMetaData,
  TFieldMetaData,
> = {
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
  [K in keyof TState]: BaseContext<
    TState,
    K,
    TPluginMetaData,
    TFieldMetaData
  > & {
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
export type TransformStateParams<
  TState,
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
> = {
  [K in keyof TState]: BaseContext<
    TState,
    K,
    TPluginMetaData,
    TFieldMetaData
  > & {
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
export type OnUpdateParams<
  TState,
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
> = {
  [K in keyof TState]: BaseContext<
    TState,
    K,
    TPluginMetaData,
    TFieldMetaData
  > & {
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
export type OnFormUpdateParams<
  TState,
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
> = {
  [K in keyof TState]: BaseContext<
    TState,
    K,
    TPluginMetaData,
    TFieldMetaData
  > & {
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
export type FormWrapperParams<
  TState,
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
> = {
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
export type CogsPlugin<
  TName extends string,
  TState = any,
  TOptions = any,
  THookReturn = any,
  TPluginMetaData = any,
  TFieldMetaData = any,
> = {
  /** Unique identifier for this plugin */
  name: TName;

  /**
   * Hook method for React integration.
   * Called once on mount to set up hooks, subscriptions, etc.
   */
  useHook?: (
    params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>
  ) => THookReturn;

  /**
   * Transform state on initialization or when options change.
   * Use for setting default values, initial sync, etc.
   */
  transformState?: (
    params: TransformStateParams<
      TState,
      TOptions,
      THookReturn,
      TPluginMetaData,
      TFieldMetaData
    >
  ) => void;

  /**
   * React to any state updates.
   * Called after state changes for side effects, sync, logging, etc.
   */
  onUpdate?: (
    params: OnUpdateParams<
      TState,
      TOptions,
      THookReturn,
      TPluginMetaData,
      TFieldMetaData
    >
  ) => void;

  /**
   * Handle form-specific events.
   * Called for focus, blur, and input events on form fields.
   */
  onFormUpdate?: (
    params: OnFormUpdateParams<
      TState,
      TOptions,
      THookReturn,
      TPluginMetaData,
      TFieldMetaData
    >
  ) => void;

  /**
   * Wrap form elements with additional UI.
   * Returns enhanced element with validation messages, loading states, etc.
   */
  formWrapper?: (
    params: FormWrapperParams<
      TState,
      TOptions,
      THookReturn,
      TPluginMetaData,
      TFieldMetaData
    >
  ) => React.ReactNode;
};

/**
 * Extract plugin options type from a tuple of plugins.
 * Creates a mapped type of plugin names to their options.
 */
export type ExtractPluginOptions<
  TPlugins extends readonly CogsPlugin<any, any, any>[],
> = {
  [P in TPlugins[number] as P['name']]?: P extends CogsPlugin<
    any,
    any,
    infer O,
    any
  >
    ? O
    : never;
};

export function createMetadataContext<TPluginMetaData, TFieldMetaData>(
  stateKey: string,
  pluginName: string
) {
  return {
    // Root metadata functions
    getPluginMetaData: (): TPluginMetaData | undefined =>
      getGlobalStore
        .getState()
        .getPluginMetaDataMap(stateKey, [])
        ?.get(pluginName) as TPluginMetaData | undefined,

    setPluginMetaData: (data: Partial<TPluginMetaData>) =>
      getGlobalStore
        .getState()
        .setPluginMetaData(stateKey, [], pluginName, data),

    removePluginMetaData: () =>
      getGlobalStore.getState().removePluginMetaData(stateKey, [], pluginName),

    // Field metadata functions
    getFieldMetaData: (path: string[]): TFieldMetaData | undefined =>
      getGlobalStore
        .getState()
        .getPluginMetaDataMap(stateKey, path)
        ?.get(pluginName) as TFieldMetaData | undefined,

    setFieldMetaData: (path: string[], data: Partial<TFieldMetaData>) =>
      getGlobalStore
        .getState()
        .setPluginMetaData(stateKey, path, pluginName, data),

    removeFieldMetaData: (path: string[]) =>
      getGlobalStore
        .getState()
        .removePluginMetaData(stateKey, path, pluginName),
  };
}

/**
 * Create a plugin context factory for a specific state shape.
 * @param TState - The shape of your application state
 * @param TOptions - Common options type for all plugins
 * @param TPluginMetaData - Type for root-level plugin metadata
 * @param TFieldMetaData - Type for field-level plugin metadata
 */
export function createPluginContext<
  TState extends Record<string, any>,
  TOptions = unknown,
  TPluginMetaData extends Record<string, any> = {},
  TFieldMetaData extends Record<string, any> = {},
>() {
  /**
   * Create a new plugin with the given name.
   * Returns a fluent API for defining plugin behavior.
   * @param name - Unique identifier for this plugin
   */
  function createPlugin<TName extends string>(name: TName) {
    // Helper types for optional hook data
    type HookArgs<THookReturn> = THookReturn extends never
      ? []
      : [hookData: THookReturn];

    // Method type signatures
    type TransformFn<THookReturn> = (
      params: TransformStateParams<
        TState,
        TOptions,
        THookReturn,
        TPluginMetaData,
        TFieldMetaData
      >
    ) => void;

    type UpdateFn<THookReturn> = (
      params: OnUpdateParams<
        TState,
        TOptions,
        THookReturn,
        TPluginMetaData,
        TFieldMetaData
      >
    ) => void;

    type FormUpdateFn<THookReturn> = (
      params: OnFormUpdateParams<
        TState,
        TOptions,
        THookReturn,
        TPluginMetaData,
        TFieldMetaData
      >
    ) => void;

    type FormWrapperFn<THookReturn> = (
      params: FormWrapperParams<
        TState,
        TOptions,
        THookReturn,
        TPluginMetaData,
        TFieldMetaData
      >
    ) => React.ReactNode;

    type Plugin<THookReturn> = Prettify<
      CogsPlugin<
        TName,
        TState,
        TOptions,
        THookReturn,
        TPluginMetaData,
        TFieldMetaData
      >
    >;

    // Runtime object factory
    const createPluginObject = <THookReturn = never>(
      hookFn?: (
        params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>
      ) => THookReturn,
      transformFn?: TransformFn<THookReturn>,
      updateHandler?: UpdateFn<THookReturn>,
      formUpdateHandler?: FormUpdateFn<THookReturn>,
      formWrapper?: FormWrapperFn<THookReturn>
    ): Plugin<THookReturn> => {
      return {
        name,
        useHook: hookFn as any,
        transformState: transformFn as any,
        onUpdate: updateHandler as any,
        onFormUpdate: formUpdateHandler as any,
        formWrapper: formWrapper as any,
      };
    };

    // Fluent API return type with conditional methods
    type BuildRet<
      THookReturn,
      HasTransform extends boolean,
      HasUpdate extends boolean,
      HasFormUpdate extends boolean,
      HasWrapper extends boolean,
    > = Plugin<THookReturn> &
      (HasTransform extends true
        ? {}
        : {
            /** Define state transformation logic */
            transformState(
              fn: TransformFn<THookReturn>
            ): BuildRet<
              THookReturn,
              true,
              HasUpdate,
              HasFormUpdate,
              HasWrapper
            >;
          }) &
      (HasUpdate extends true
        ? {}
        : {
            /** React to state updates */
            onUpdate(
              fn: UpdateFn<THookReturn>
            ): BuildRet<
              THookReturn,
              HasTransform,
              true,
              HasFormUpdate,
              HasWrapper
            >;
          }) &
      (HasFormUpdate extends true
        ? {}
        : {
            /** Handle form events */
            onFormUpdate(
              fn: FormUpdateFn<THookReturn>
            ): BuildRet<THookReturn, HasTransform, HasUpdate, true, HasWrapper>;
          }) &
      (HasWrapper extends true
        ? {}
        : {
            /** Wrap form elements */
            formWrapper(
              fn: FormWrapperFn<THookReturn>
            ): BuildRet<
              THookReturn,
              HasTransform,
              HasUpdate,
              HasFormUpdate,
              true
            >;
          });

    // Builder function with type tracking
    function createBuilder<
      THookReturn = never,
      HasTransform extends boolean = false,
      HasUpdate extends boolean = false,
      HasFormUpdate extends boolean = false,
      HasWrapper extends boolean = false,
    >(
      hookFn?: (
        params: UseHookParams<TState, TOptions, TPluginMetaData, TFieldMetaData>
      ) => THookReturn,
      transformFn?: TransformFn<THookReturn>,
      updateHandler?: UpdateFn<THookReturn>,
      formUpdateHandler?: FormUpdateFn<THookReturn>,
      formWrapper?: FormWrapperFn<THookReturn>
    ): BuildRet<
      THookReturn,
      HasTransform,
      HasUpdate,
      HasFormUpdate,
      HasWrapper
    > {
      const plugin = createPluginObject<THookReturn>(
        hookFn,
        transformFn,
        updateHandler,
        formUpdateHandler,
        formWrapper
      );

      // Attach only the remaining chain methods
      const methods = {} as Partial<
        BuildRet<
          THookReturn,
          HasTransform,
          HasUpdate,
          HasFormUpdate,
          HasWrapper
        >
      >;

      if (!transformFn) {
        (methods as any).transformState = (fn: TransformFn<THookReturn>) =>
          createBuilder<
            THookReturn,
            true,
            HasUpdate,
            HasFormUpdate,
            HasWrapper
          >(hookFn, fn, updateHandler, formUpdateHandler, formWrapper);
      }

      if (!updateHandler) {
        (methods as any).onUpdate = (fn: UpdateFn<THookReturn>) =>
          createBuilder<
            THookReturn,
            HasTransform,
            true,
            HasFormUpdate,
            HasWrapper
          >(hookFn, transformFn, fn, formUpdateHandler, formWrapper);
      }

      if (!formUpdateHandler) {
        (methods as any).onFormUpdate = (fn: FormUpdateFn<THookReturn>) =>
          createBuilder<THookReturn, HasTransform, HasUpdate, true, HasWrapper>(
            hookFn,
            transformFn,
            updateHandler,
            fn,
            formWrapper
          );
      }

      if (!formWrapper) {
        (methods as any).formWrapper = (fn: FormWrapperFn<THookReturn>) =>
          createBuilder<
            THookReturn,
            HasTransform,
            HasUpdate,
            HasFormUpdate,
            true
          >(hookFn, transformFn, updateHandler, formUpdateHandler, fn);
      }

      return Object.assign(plugin, methods) as BuildRet<
        THookReturn,
        HasTransform,
        HasUpdate,
        HasFormUpdate,
        HasWrapper
      >;
    }

    // Starting point with all methods available
    const start = Object.assign(
      createBuilder<never, false, false, false, false>(),
      {
        /**
         * Define a React hook for this plugin.
         * Sets up subscriptions, state, and returns data for other methods.
         */
        useHook<THookReturn>(
          hookFn: (
            params: UseHookParams<
              TState,
              TOptions,
              TPluginMetaData,
              TFieldMetaData
            >
          ) => THookReturn
        ) {
          return createBuilder<THookReturn, false, false, false, false>(hookFn);
        },
      }
    ) as BuildRet<never, false, false, false, false> & {
      useHook<THookReturn>(
        hookFn: (
          params: UseHookParams<
            TState,
            TOptions,
            TPluginMetaData,
            TFieldMetaData
          >
        ) => THookReturn
      ): BuildRet<THookReturn, false, false, false, false>;
    };

    return start;
  }

  return { createPlugin };
}

// --- DEMO USAGE ---

type MyGlobalState = {
  user: { test: string; email: string };
  address: { city: string; country: string };
};

type MyPluginMetaData = {
  lastUpdated?: Date;
  updateCount?: number;
  sessionId?: string;
  stateVersion?: string;
};

type MyFieldMetaData = {
  status?: 'VALID' | 'INVALID' | 'NOT_VALIDATED';
  errors?: Array<{ message: string; severity: 'error' | 'warning' }>;
  touched?: boolean;
  syncVersion?: string;
};

const { createPlugin } = createPluginContext<
  MyGlobalState,
  { id: string; syncEnabled?: boolean },
  MyPluginMetaData,
  MyFieldMetaData
>();

// Example: Analytics plugin with root metadata
const analyticsPlugin = createPlugin('analyticsPlugin').transformState(
  ({ stateKey, cogsState, setPluginMetaData }) => {
    if (stateKey === 'user') {
      cogsState.$update({ test: 'This works!', email: 'test@example.com' });
      setPluginMetaData({ lastUpdated: new Date() });
    }
  }
);

// // Example: Validation plugin with field metadata
// const validationPlugin = createPlugin('validation')
//   .onFormUpdate(({ path, event, setFieldMetaData, cogsState }) => {
//     if (event.type === 'blur') {
//       const value = cogsState.$get(path);

//       if (path[path.length - 1] === 'email') {
//         const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
//         // Store validation state at the specific field path
//         setFieldMetaData(path, {
//           status: isValid ? 'VALID' : 'INVALID',
//           errors: isValid ? [] : [{ message: 'Invalid email format', severity: 'error' }],
//           touched: true
//         });
//       }
//     }
//   })
//   .formWrapper(({ element, path, getFieldMetaData }) => {
//     // Get metadata for this specific field
//     const fieldMeta = getFieldMetaData(path);

//     return (
//       <div className="field-wrapper">
//         {element}
//         {fieldMeta?.status === 'INVALID' && fieldMeta?.touched && (
//           <div className="error-message">
//             {fieldMeta.errors?.[0]?.message}
//           </div>
//         )}
//       </div>
//     );
//   });

// Example: Sync plugin with both root and field metadata
const syncPlugin = createPlugin('sync')
  .useHook(({ setPluginMetaData, setFieldMetaData, cogsState }) => {
    // Store session at root
    const sessionId = 'session-123';
    setPluginMetaData({ sessionId });

    // Store sync versions at specific paths
    setFieldMetaData(['user'], { syncVersion: 'v1.0' });
    setFieldMetaData(['address'], { syncVersion: 'v1.1' });

    return { sessionId };
  })
  .onUpdate(({ path, update, getFieldMetaData, setFieldMetaData }) => {
    if (path) {
      // Update sync version for the changed path
      const currentVersion = getFieldMetaData(path)?.syncVersion || 'v0';
      const newVersion = `v${parseInt(currentVersion.slice(1)) + 1}`;
      setFieldMetaData(path, { syncVersion: newVersion });
    }
  });
