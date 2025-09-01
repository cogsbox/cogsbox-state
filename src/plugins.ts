import { UpdateTypeDetail, StateObject } from './CogsState';

// Plugin type definition

// Plugin type definition - NO CHANGES NEEDED HERE
export type CogsPlugin<
  TState extends unknown = any,
  TOptions = any,
  THookReturn = any,
> = {
  useHook?: (state: StateObject<TState>, options: TOptions) => THookReturn;
  transformState?: (
    state: StateObject<TState>,
    options: TOptions,
    hookData?: THookReturn
  ) => void;
  onUpdate?: (
    update: UpdateTypeDetail,
    options: TOptions,
    hookData?: THookReturn
  ) => void;
};

// Plugin runtime data
export type PluginData = {
  plugin: CogsPlugin;
  options: any;
  hookData?: any;
};

// ===================================================================
// CORRECTED PLUGIN BUILDER
// ===================================================================
export function createPluginWrapper<TState extends Record<string, any>>() {
  return {
    createPlugin<TOptions>() {
      const createBuilder = <THookReturn = never>(
        // The hook function is now correctly typed with TState
        hookFn?: (state: StateObject<TState>, options: TOptions) => THookReturn
      ) => ({
        // The <TState> generic is REMOVED from transformState
        transformState(
          transformFn: (
            state: StateObject<TState>, // <-- This is now correctly inferred
            options: TOptions,
            ...args: THookReturn extends never ? [] : [hookData: THookReturn]
          ) => void
        ) {
          return {
            onUpdate(
              updateHandler: (
                update: UpdateTypeDetail,
                options: TOptions,
                ...args: THookReturn extends never
                  ? []
                  : [hookData: THookReturn]
              ) => void
              // The return type is now fully typed
            ) {
              const plugin: CogsPlugin<TState, TOptions, THookReturn> = {
                transformState: (state, options, hookData?) =>
                  transformFn(
                    state,
                    options,
                    ...((hookData !== undefined ? [hookData] : []) as any)
                  ),
                onUpdate: (update, options, hookData?) =>
                  updateHandler(
                    update,
                    options,
                    ...((hookData !== undefined ? [hookData] : []) as any)
                  ),
              };

              if (hookFn) {
                plugin.useHook = hookFn;
              }

              return plugin;
            },
          };
        },
      });

      return {
        useHook<THookReturn>(
          // The hook function is now correctly typed with TState
          hookFn: (state: StateObject<TState>, options: TOptions) => THookReturn
        ) {
          return createBuilder(hookFn);
        },
        ...createBuilder(),
      };
    },
  };
}
const test = createPluginWrapper<{ test: 'fsdafsdfds' }>()
  .createPlugin<{
    test: string;
    test2: number;
  }>()
  .useHook((state, options) => {
    console.log('test', state, options);
    return { thisishoojoy: () => true };
  })
  .transformState((state, options, hookData) => {
    console.log('test', state, options, hookData);

    hookData.thisishoojoy();
    return state;
  })
  .onUpdate((update, options, hookData) => {
    console.log('test', update, options, hookData);
  });
