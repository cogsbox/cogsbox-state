'use client';

import {
  createElement,
  memo,
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createRoot } from 'react-dom/client';
import {
  debounce,
  getDifferences,
  isArray,
  isFunction,
  type GenericObject,
} from './utility.js';
import { ValidationWrapper } from './Functions.js';
import { isDeepEqual, transformStateFunc } from './utility.js';
import superjson from 'superjson';
import { v4 as uuidv4 } from 'uuid';

import {
  formRefStore,
  getGlobalStore,
  ValidationStatus,
  type ComponentsType,
} from './store.js';
import { useCogsConfig } from './CogsStateClient.js';
import { Operation } from 'fast-json-patch';
import { useInView } from 'react-intersection-observer';
import * as z3 from 'zod/v3';
import * as z4 from 'zod/v4';
import z from 'zod';

type Prettify<T> = T extends any ? { [K in keyof T]: T[K] } : never;

export type VirtualViewOptions = {
  itemHeight?: number;
  overscan?: number;
  stickToBottom?: boolean;
  dependencies?: any[];
  scrollStickTolerance?: number;
};

// The result now returns a real StateObject
export type VirtualStateObjectResult<T extends any[]> = {
  /**
   * A new, fully-functional StateObject that represents the virtualized slice.
   * You can use `.get()`, `.stateMap()`, `.insert()`, `.cut()` etc. on this object.
   */

  virtualState: StateObject<T>;
  /**
   * Props to be spread onto your DOM elements to enable virtualization.
   */
  virtualizerProps: {
    outer: { ref: RefObject<HTMLDivElement>; style: CSSProperties };
    inner: { style: CSSProperties };
    list: { style: CSSProperties };
  };
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
};

export type SyncInfo = {
  timeStamp: number;
  userId: number;
};

export type FormElementParams<T> = StateObject<T> & {
  inputProps: {
    ref?: React.RefObject<any>;
    value?: T extends boolean ? never : T;
    onChange?: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onBlur?: () => void;
  };
};

export type StateKeys = string;

type findWithFuncType<U> = (
  thisKey: keyof U,
  thisValue: U[keyof U]
) => EndType<U> & StateObject<U>;

type CutFunctionType<T> = (
  index?: number,
  options?: { waitForSync?: boolean }
) => StateObject<T>;

export type InferArrayElement<T> = T extends (infer U)[] ? U : never;
type ArraySpecificPrototypeKeys =
  | 'concat'
  | 'copyWithin'
  | 'fill'
  | 'find'
  | 'findIndex'
  | 'flat'
  | 'flatMap'
  | 'includes'
  | 'indexOf'
  | 'join'
  | 'keys'
  | 'lastIndexOf'
  | 'map'
  | 'pop'
  | 'push'
  | 'reduce'
  | 'reduceRight'
  | 'reverse'
  | 'shift'
  | 'slice'
  | 'some'
  | 'sort'
  | 'splice'
  | 'unshift'
  | 'values'
  | 'entries'
  | 'every'
  | 'filter'
  | 'forEach'
  | 'with';
export type StreamOptions<T, R = T> = {
  bufferSize?: number;
  flushInterval?: number;
  bufferStrategy?: 'sliding' | 'dropping' | 'accumulate';
  store?: (buffer: T[]) => R | R[];
  onFlush?: (buffer: T[]) => void;
};

export type StreamHandle<T> = {
  write: (data: T) => void;
  writeMany: (data: T[]) => void;
  flush: () => void;
  close: () => void;
  pause: () => void;
  resume: () => void;
};
export type ArrayEndType<TShape extends unknown> = {
  stream: <T = Prettify<InferArrayElement<TShape>>, R = T>(
    options?: StreamOptions<T, R>
  ) => StreamHandle<T>;
  findWith: findWithFuncType<Prettify<InferArrayElement<TShape>>>;
  index: (index: number) => StateObject<Prettify<InferArrayElement<TShape>>> & {
    insert: InsertTypeObj<Prettify<InferArrayElement<TShape>>>;
    cut: CutFunctionType<TShape>;
    _index: number;
  } & EndType<Prettify<InferArrayElement<TShape>>>;
  insert: InsertType<Prettify<InferArrayElement<TShape>>>;
  cut: CutFunctionType<TShape>;
  cutSelected: () => void;
  cutByValue: (value: string | number | boolean) => void;
  toggleByValue: (value: string | number | boolean) => void;
  stateSort: (
    compareFn: (
      a: Prettify<InferArrayElement<TShape>>,
      b: Prettify<InferArrayElement<TShape>>
    ) => number
  ) => ArrayEndType<TShape>;
  useVirtualView: (
    options: VirtualViewOptions
  ) => VirtualStateObjectResult<Prettify<InferArrayElement<TShape>>[]>;

  stateList: (
    callbackfn: (
      setter: StateObject<Prettify<InferArrayElement<TShape>>>,
      index: number,
      arraySetter: StateObject<TShape>
    ) => void
  ) => any;
  stateMap: <U>(
    callbackfn: (
      setter: StateObject<Prettify<InferArrayElement<TShape>>>,
      index: number,
      arraySetter: StateObject<TShape>
    ) => U
  ) => U[];
  $stateMap: (
    callbackfn: (
      setter: StateObject<Prettify<InferArrayElement<TShape>>>,
      index: number,
      arraySetter: StateObject<TShape>
    ) => void
  ) => any;
  stateFlattenOn: <K extends keyof Prettify<InferArrayElement<TShape>>>(
    field: K
  ) => StateObject<InferArrayElement<Prettify<InferArrayElement<TShape>>[K]>[]>;
  uniqueInsert: (
    payload: InsertParams<Prettify<InferArrayElement<TShape>>>,
    fields?: (keyof Prettify<InferArrayElement<TShape>>)[],
    onMatch?: (existingItem: any) => any
  ) => void;
  stateFind: (
    callbackfn: (
      value: Prettify<InferArrayElement<TShape>>,
      index: number
    ) => boolean
  ) => StateObject<Prettify<InferArrayElement<TShape>>> | undefined;
  stateFilter: (
    callbackfn: (
      value: Prettify<InferArrayElement<TShape>>,
      index: number
    ) => void
  ) => ArrayEndType<TShape>;
  getSelected: () =>
    | StateObject<Prettify<InferArrayElement<TShape>>>
    | undefined;
  clearSelected: () => void;
  getSelectedIndex: () => number;
  last: () => StateObject<Prettify<InferArrayElement<TShape>>> | undefined;
} & EndType<TShape>;

export type FormOptsType = {
  validation?: {
    hideMessage?: boolean;
    message?: string;

    props?: GenericObject;
    disable?: boolean;
  };

  debounceTime?: number;
  sync?: {
    allowInvalidValues?: boolean; // default: false
  };
};

export type FormControl<T> = (obj: FormElementParams<T>) => JSX.Element;

export type UpdateArg<S> = S | ((prevState: S) => S);
export type InsertParams<S> =
  | S
  | ((prevState: { state: S; uuid: string }) => S);
export type UpdateType<T> = (payload: UpdateArg<T>) => { synced: () => void };

export type InsertType<T> = (payload: InsertParams<T>, index?: number) => void;
export type InsertTypeObj<T> = (payload: InsertParams<T>) => void;
export type ValidationError = {
  path: (string | number)[];
  message: string;
};
type EffectFunction<T, R> = (state: T, deps: any[]) => R;
export type EndType<T, IsArrayElement = false> = {
  addValidation: (errors: ValidationError[]) => void;
  applyJsonPatch: (patches: any[]) => void;
  update: UpdateType<T>;
  _path: string[];
  _stateKey: string;
  formElement: (control: FormControl<T>, opts?: FormOptsType) => JSX.Element;
  get: () => T;
  getState: () => T;
  $get: () => T;
  $derive: <R>(fn: EffectFunction<T, R>) => R;

  _status: 'fresh' | 'dirty' | 'synced' | 'restored' | 'unknown';
  getStatus: () => 'fresh' | 'dirty' | 'synced' | 'restored' | 'unknown';

  showValidationErrors: () => string[];
  setValidation: (ctx: string) => void;
  removeValidation: (ctx: string) => void;
  ignoreFields: (fields: string[]) => StateObject<T>;
  isSelected: boolean;
  setSelected: (value: boolean) => void;
  toggleSelected: () => void;
  getFormRef: () => React.RefObject<any> | undefined;
  removeStorage: () => void;
  sync: () => void;
  validationWrapper: ({
    children,
    hideMessage,
  }: {
    children: React.ReactNode;
    hideMessage?: boolean;
  }) => JSX.Element;
  lastSynced?: SyncInfo;
} & (IsArrayElement extends true ? { cut: () => void } : {});

export type StateObject<T> = (T extends any[]
  ? ArrayEndType<T>
  : T extends Record<string, unknown> | object
    ? { [K in keyof T]-?: StateObject<T[K]> }
    : T extends string | number | boolean | null
      ? EndType<T, true>
      : never) &
  EndType<T, true> & {
    toggle: T extends boolean ? () => void : never;
    getAllFormRefs: () => Map<string, React.RefObject<any>>;
    _componentId: string | null;
    getComponents: () => ComponentsType;
    validateZodSchema: () => void;
    _initialState: T;
    updateInitialState: (newState: T | null) => {
      fetchId: (field: keyof T) => string | number;
    };
    _isLoading: boolean;
    _serverState: T;
    revertToInitialState: (obj?: { validationKey?: string }) => T;
    getDifferences: () => string[];
    middleware: (
      middles: ({
        updateLog,
        update,
      }: {
        updateLog: UpdateTypeDetail[] | undefined;
        update: UpdateTypeDetail;
      }) => void
    ) => void;

    getLocalStorage: (key: string) => LocalStorageData<T> | null;
  };

export type CogsUpdate<T extends unknown> = UpdateType<T>;
type EffectiveSetStateArg<
  T,
  UpdateType extends 'update' | 'insert' | 'cut',
> = UpdateType extends 'insert'
  ? T extends any[]
    ? InsertParams<InferArrayElement<T>>
    : never
  : UpdateArg<T>;
type UpdateOptions = {
  updateType: 'insert' | 'cut' | 'update';

  sync?: boolean;
};
type EffectiveSetState<TStateObject> = (
  newStateOrFunction:
    | EffectiveSetStateArg<TStateObject, 'update'>
    | EffectiveSetStateArg<TStateObject, 'insert'>,
  path: string[],
  updateObj: UpdateOptions,
  validationKey?: string
) => void;

export type UpdateTypeDetail = {
  timeStamp: number;
  stateKey: string;
  updateType: 'update' | 'insert' | 'cut';
  path: string[];
  status: 'new' | 'sent' | 'synced';
  oldValue: any;
  newValue: any;
  userId?: number;
};

export type ReactivityUnion = 'none' | 'component' | 'deps' | 'all';
export type ReactivityType =
  | 'none'
  | 'component'
  | 'deps'
  | 'all'
  | Array<Prettify<'none' | 'component' | 'deps' | 'all'>>;

// Define the return type of the sync hook locally
type SyncApi = {
  updateState: (data: { operation: any }) => void;
  connected: boolean;
  clientId: string | null;
  subscribers: string[];
};
type ValidationOptionsType = {
  key?: string;
  zodSchemaV3?: z3.ZodType<any, any, any>;
  zodSchemaV4?: z4.ZodType<any, any, any>;

  onBlur?: boolean;
};
export type OptionsType<T extends unknown = unknown, TApiParams = never> = {
  log?: boolean;
  componentId?: string;
  cogsSync?: (stateObject: StateObject<T>) => SyncApi;
  validation?: ValidationOptionsType;

  serverState?: {
    id?: string | number;
    data?: T;
    status?: 'pending' | 'error' | 'success' | 'loading';
    timestamp?: number;
    merge?:
      | boolean
      | {
          strategy: 'append' | 'prepend' | 'diff';
          key?: string; // For diff strategy - which field to use as unique identifier
        };
  };
  sync?: {
    action: (state: T) => Promise<{
      success: boolean;
      data?: any;
      error?: any;
      errors?: Array<{
        path: (string | number)[];
        message: string;
      }>;
    }>;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  };
  middleware?: ({
    updateLog,
    update,
  }: {
    updateLog: UpdateTypeDetail[] | undefined;
    update: UpdateTypeDetail;
  }) => void;

  modifyState?: (state: T) => T;
  localStorage?: {
    key: string | ((state: T) => string);
    onChange?: (state: T) => void;
  };
  formElements?: FormsElementsType<T>;

  reactiveDeps?: (state: T) => any[] | true;
  reactiveType?: ReactivityType;
  syncUpdate?: Partial<UpdateTypeDetail>;

  defaultState?: T;
  apiParams?: TApiParams;
  dependencies?: any[];
};

export type SyncRenderOptions<T extends unknown = unknown> = {
  children: React.ReactNode;
  time: number;
  data?: T;
  key?: string;
};

type FormsElementsType<T> = {
  validation?: (options: {
    children: React.ReactNode;
    status: ValidationStatus; // Instead of 'active' boolean

    path: string[];
    message?: string;
    data?: T;
    key?: string;
  }) => React.ReactNode;
  syncRender?: (options: SyncRenderOptions<T>) => React.ReactNode;
};

export type InitialStateInnerType<T extends unknown = unknown> = {
  initialState: T;
} & OptionsType<T>;

export type InitialStateType<T> = {
  [key: string]: InitialStateInnerType<T>;
};

export type AllStateTypes<T extends unknown> = Record<string, T>;

export type CogsInitialState<T> = {
  initialState: T;
  formElements?: FormsElementsType<T>;
};

export type TransformedStateType<T> = {
  [P in keyof T]: T[P] extends CogsInitialState<infer U> ? U : T[P];
};

function setAndMergeOptions(stateKey: string, newOptions: OptionsType<any>) {
  const getInitialOptions = getGlobalStore.getState().getInitialOptions;
  const setInitialStateOptions =
    getGlobalStore.getState().setInitialStateOptions;

  const initialOptions = getInitialOptions(stateKey as string) || {};

  setInitialStateOptions(stateKey as string, {
    ...initialOptions,
    ...newOptions,
  });
}

function setOptions<StateKey, Opt>({
  stateKey,
  options,
  initialOptionsPart,
}: {
  stateKey: StateKey;
  options?: OptionsType<any>;
  initialOptionsPart: Record<string, any>;
}) {
  const initialOptions = getInitialOptions(stateKey as string) || {};
  const initialOptionsPartState = initialOptionsPart[stateKey as string] || {};
  const setInitialStateOptions =
    getGlobalStore.getState().setInitialStateOptions;
  const mergedOptions = { ...initialOptionsPartState, ...initialOptions };

  let needToAdd = false;
  if (options) {
    for (const key in options) {
      if (!mergedOptions.hasOwnProperty(key)) {
        needToAdd = true;
        mergedOptions[key] = options[key as keyof typeof options];
      } else {
        if (
          key == 'localStorage' &&
          options[key] &&
          mergedOptions[key].key !== options[key]?.key
        ) {
          needToAdd = true;
          mergedOptions[key] = options[key];
        }
        if (
          key == 'defaultState' &&
          options[key] &&
          mergedOptions[key] !== options[key] &&
          !isDeepEqual(mergedOptions[key], options[key])
        ) {
          needToAdd = true;
          mergedOptions[key] = options[key];
        }
      }
    }
  }

  if (needToAdd) {
    setInitialStateOptions(stateKey as string, mergedOptions);
  }
}
export function addStateOptions<T extends unknown>(
  initialState: T,
  { formElements, validation }: OptionsType<T>
) {
  return { initialState: initialState, formElements, validation } as T;
}
type UseCogsStateHook<
  T extends Record<string, any>,
  apiParams extends Record<string, any> = never,
> = <StateKey extends keyof TransformedStateType<T>>(
  stateKey: StateKey,
  options?: Prettify<
    OptionsType<TransformedStateType<T>[StateKey]> & { apiParams?: apiParams }
  >
) => StateObject<TransformedStateType<T>[StateKey]>;

// Define the type for the options setter using the Transformed state
type SetCogsOptionsFunc<T extends Record<string, any>> = <
  StateKey extends keyof TransformedStateType<T>,
>(
  stateKey: StateKey,
  options: OptionsType<TransformedStateType<T>[StateKey]>
) => void;

// Define the final API object shape
type CogsApi<
  T extends Record<string, any>,
  apiParams extends Record<string, any> = never,
> = {
  useCogsState: UseCogsStateHook<T, apiParams>;
  setCogsOptions: SetCogsOptionsFunc<T>;
};
export const createCogsState = <State extends Record<StateKeys, unknown>>(
  initialState: State,
  opt?: {
    formElements?: FormsElementsType<State>;
    validation?: ValidationOptionsType;
    __fromSyncSchema?: boolean;
    __syncNotifications?: Record<string, Function>;
    __apiParamsMap?: Record<string, any>; // Add this
  }
) => {
  let newInitialState = initialState;

  const [statePart, initialOptionsPart] =
    transformStateFunc<State>(newInitialState);

  // Store notifications if provided
  if (opt?.__fromSyncSchema && opt?.__syncNotifications) {
    getGlobalStore
      .getState()
      .setInitialStateOptions('__notifications', opt.__syncNotifications);
  }

  // Store apiParams map if provided
  if (opt?.__fromSyncSchema && opt?.__apiParamsMap) {
    getGlobalStore
      .getState()
      .setInitialStateOptions('__apiParamsMap', opt.__apiParamsMap);
  }

  // ... rest of your existing createCogsState code unchanged ...

  Object.keys(statePart).forEach((key) => {
    let existingOptions = initialOptionsPart[key] || {};

    const mergedOptions: any = {
      ...existingOptions,
    };

    if (opt?.formElements) {
      mergedOptions.formElements = {
        ...opt.formElements,
        ...(existingOptions.formElements || {}),
      };
    }

    if (opt?.validation) {
      mergedOptions.validation = {
        ...opt.validation,
        ...(existingOptions.validation || {}),
      };

      if (opt.validation.key && !existingOptions.validation?.key) {
        mergedOptions.validation.key = `${opt.validation.key}.${key}`;
      }
    }

    if (Object.keys(mergedOptions).length > 0) {
      const existingGlobalOptions = getInitialOptions(key);

      if (!existingGlobalOptions) {
        getGlobalStore.getState().setInitialStateOptions(key, mergedOptions);
      } else {
        // Merge with existing global options
        getGlobalStore.getState().setInitialStateOptions(key, {
          ...existingGlobalOptions,
          ...mergedOptions,
        });
      }
    }
  });

  Object.keys(statePart).forEach((key) => {
    getGlobalStore.getState().initializeShadowState(key, statePart[key]);
  });

  type StateKeys = keyof typeof statePart;

  const useCogsState = <StateKey extends StateKeys>(
    stateKey: StateKey,
    options?: Prettify<OptionsType<(typeof statePart)[StateKey]>>
  ) => {
    const [componentId] = useState(options?.componentId ?? uuidv4());
    const apiParamsSchema = opt?.__apiParamsMap?.[stateKey as string];

    // Merge apiParams into options
    const enhancedOptions = {
      ...options,
      apiParamsSchema, // Add the schema here
    } as any;

    setOptions({
      stateKey,
      options: enhancedOptions,
      initialOptionsPart,
    });
    const thiState =
      getGlobalStore.getState().getShadowValue(stateKey as string) ||
      statePart[stateKey as string];
    const partialState = options?.modifyState
      ? options.modifyState(thiState)
      : thiState;

    const updater = useCogsStateFn<(typeof statePart)[StateKey]>(partialState, {
      stateKey: stateKey as string,
      syncUpdate: options?.syncUpdate,
      componentId,
      localStorage: options?.localStorage,
      middleware: options?.middleware,
      reactiveType: options?.reactiveType,
      reactiveDeps: options?.reactiveDeps,
      defaultState: options?.defaultState as any,
      dependencies: options?.dependencies,
      serverState: options?.serverState,
    });

    return updater;
  };

  function setCogsOptions<StateKey extends StateKeys>(
    stateKey: StateKey,
    options: OptionsType<(typeof statePart)[StateKey]>
  ) {
    setOptions({ stateKey, options, initialOptionsPart });

    if (options.localStorage) {
      loadAndApplyLocalStorage(stateKey as string, options);
    }

    notifyComponents(stateKey as string);
  }

  return { useCogsState, setCogsOptions } as CogsApi<State>;
};

export function createCogsStateFromSync<
  TSyncSchema extends {
    schemas: Record<
      string,
      {
        schemas: { defaultValues: any };
        apiParamsSchema?: any; // This contains the zod schema for params
        [key: string]: any;
      }
    >;
    notifications: Record<string, any>;
  },
>(
  syncSchema: TSyncSchema
): CogsApi<
  {
    [K in keyof TSyncSchema['schemas']]: TSyncSchema['schemas'][K]['schemas']['defaultValues'];
  },
  {
    [K in keyof TSyncSchema['schemas']]: TSyncSchema['schemas'][K]['apiParamsSchema'] extends z.ZodObject<any>
      ? z.infer<TSyncSchema['schemas'][K]['apiParamsSchema']>
      : never;
  }[keyof TSyncSchema['schemas']]
> {
  const schemas = syncSchema.schemas;
  const initialState: any = {};
  const apiParamsMap: any = {};

  // Extract defaultValues AND apiParams from each entry
  for (const key in schemas) {
    const entry = schemas[key];
    initialState[key] = entry?.schemas?.defaultValues || {};

    // Store the apiParamsSchema for each key
    if (entry?.apiParamsSchema) {
      apiParamsMap[key] = entry.apiParamsSchema;
    }
  }

  // Pass the sync schema metadata to createCogsState
  return createCogsState(initialState, {
    __fromSyncSchema: true,
    __syncNotifications: syncSchema.notifications,
    __apiParamsMap: apiParamsMap, // Pass the apiParams schemas
  }) as any;
}

const {
  getInitialOptions,
  getValidationErrors,
  setStateLog,
  updateInitialStateGlobal,
  addValidationError,
  removeValidationError,
} = getGlobalStore.getState();
const saveToLocalStorage = <T,>(
  state: T,
  thisKey: string,
  currentInitialOptions: any,
  sessionId?: string,
  lastSyncedWithServer?: number
) => {
  if (currentInitialOptions?.log) {
    console.log(
      'saving to localstorage',
      thisKey,
      currentInitialOptions.localStorage?.key,
      sessionId
    );
  }

  const key = isFunction(currentInitialOptions?.localStorage?.key)
    ? currentInitialOptions.localStorage?.key(state)
    : currentInitialOptions?.localStorage?.key;

  if (key && sessionId) {
    const storageKey = `${sessionId}-${thisKey}-${key}`;

    // Get existing data to preserve lastSyncedWithServer if not explicitly updating it
    let existingLastSynced: number | undefined;
    try {
      const existing = loadFromLocalStorage(storageKey);
      existingLastSynced = existing?.lastSyncedWithServer;
    } catch {
      // Ignore errors, will use undefined
    }
    const shadowMeta = getGlobalStore.getState().getShadowMetadata(thisKey, []);

    const data: LocalStorageData<T> = {
      state,
      lastUpdated: Date.now(),
      lastSyncedWithServer: lastSyncedWithServer ?? existingLastSynced,
      stateSource: shadowMeta?.stateSource,
      baseServerState: shadowMeta?.baseServerState,
    };

    // Use SuperJSON serialize to get the json part only
    const superJsonResult = superjson.serialize(data);
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(superJsonResult.json)
    );
  }
};

const loadFromLocalStorage = (localStorageKey: string) => {
  if (!localStorageKey) return null;

  try {
    const storedData = window.localStorage.getItem(localStorageKey);
    if (!storedData) return null;

    // Parse the json part back normally
    const parsedData = JSON.parse(storedData);

    return parsedData;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};
const loadAndApplyLocalStorage = (stateKey: string, options: any) => {
  const currentState = getGlobalStore.getState().getShadowValue(stateKey);
  const { sessionId } = useCogsConfig();
  const localkey = isFunction(options?.localStorage?.key)
    ? options.localStorage.key(currentState)
    : options?.localStorage?.key;

  if (localkey && sessionId) {
    const localData = loadFromLocalStorage(
      `${sessionId}-${stateKey}-${localkey}`
    );

    if (
      localData &&
      localData.lastUpdated > (localData.lastSyncedWithServer || 0)
    ) {
      notifyComponents(stateKey);
      return true;
    }
  }
  return false;
};

type LocalStorageData<T> = {
  state: T;
  lastUpdated: number;
  lastSyncedWithServer?: number;
  baseServerState?: T; // Keep reference to what server state this is based on
  stateSource?: 'default' | 'server' | 'localStorage'; // Track origin
};

const notifyComponents = (thisKey: string) => {
  const stateEntry = getGlobalStore.getState().getShadowMetadata(thisKey, []);
  if (!stateEntry) return;

  // Batch component updates
  const updates = new Set<() => void>();
  stateEntry?.components?.forEach((component) => {
    const reactiveTypes = component
      ? Array.isArray(component.reactiveType)
        ? component.reactiveType
        : [component.reactiveType || 'component']
      : null;
    if (!reactiveTypes?.includes('none')) {
      updates.add(() => component.forceUpdate());
    }
  });

  // Schedule updates in the next tick to allow batching
  queueMicrotask(() => {
    updates.forEach((update) => update());
  });
};

export const notifyComponent = (stateKey: string, componentId: string) => {
  const stateEntry = getGlobalStore.getState().getShadowMetadata(stateKey, []);
  if (stateEntry) {
    const fullComponentId = `${stateKey}////${componentId}`;
    const component = stateEntry?.components?.get(fullComponentId);
    const reactiveTypes = component
      ? Array.isArray(component.reactiveType)
        ? component.reactiveType
        : [component.reactiveType || 'component']
      : null;

    // Skip if reactivity is disabled
    if (reactiveTypes?.includes('none')) {
      return;
    }

    if (component) {
      // Force an update to ensure the current value is saved

      component.forceUpdate();
    }
  }
};
function markEntireStateAsServerSynced(
  stateKey: string,
  path: string[],
  data: any,
  timestamp: number
) {
  const store = getGlobalStore.getState();

  // Mark current path as synced
  const currentMeta = store.getShadowMetadata(stateKey, path);
  store.setShadowMetadata(stateKey, path, {
    ...currentMeta,
    isDirty: false,
    stateSource: 'server',
    lastServerSync: timestamp || Date.now(),
  });

  // If it's an array, mark each item as synced
  if (Array.isArray(data)) {
    const arrayMeta = store.getShadowMetadata(stateKey, path);
    if (arrayMeta?.arrayKeys) {
      arrayMeta.arrayKeys.forEach((itemKey, index) => {
        const itemPath = itemKey.split('.').slice(1);
        const itemData = data[index];
        if (itemData !== undefined) {
          markEntireStateAsServerSynced(
            stateKey,
            itemPath,
            itemData,
            timestamp
          );
        }
      });
    }
  }
  // If it's an object, mark each field as synced
  else if (data && typeof data === 'object' && data.constructor === Object) {
    Object.keys(data).forEach((key) => {
      const fieldPath = [...path, key];
      const fieldData = data[key];
      markEntireStateAsServerSynced(stateKey, fieldPath, fieldData, timestamp);
    });
  }
}

const _notifySubscribedComponents = (
  stateKey: string,
  path: string[],
  updateType: 'update' | 'insert' | 'cut',
  oldValue: any,
  newValue: any
) => {
  const store = getGlobalStore.getState();
  const rootMeta = store.getShadowMetadata(stateKey, []);
  if (!rootMeta?.components) {
    return;
  }

  const notifiedComponents = new Set<string>();
  const shadowMeta = store.getShadowMetadata(stateKey, path);

  // --- PASS 1: Notify specific subscribers based on update type ---

  if (updateType === 'update') {
    if (shadowMeta?.pathComponents) {
      shadowMeta.pathComponents.forEach((componentId) => {
        if (notifiedComponents.has(componentId)) return;
        const component = rootMeta.components?.get(componentId);
        if (component) {
          const reactiveTypes = Array.isArray(component.reactiveType)
            ? component.reactiveType
            : [component.reactiveType || 'component'];
          if (!reactiveTypes.includes('none')) {
            component.forceUpdate();
            notifiedComponents.add(componentId);
          }
        }
      });
    }

    if (
      newValue &&
      typeof newValue === 'object' &&
      !isArray(newValue) &&
      oldValue &&
      typeof oldValue === 'object' &&
      !isArray(oldValue)
    ) {
      const changedSubPaths = getDifferences(newValue, oldValue);
      changedSubPaths.forEach((subPathString) => {
        const subPath = subPathString.split('.');
        const fullSubPath = [...path, ...subPath];
        const subPathMeta = store.getShadowMetadata(stateKey, fullSubPath);
        if (subPathMeta?.pathComponents) {
          subPathMeta.pathComponents.forEach((componentId) => {
            if (notifiedComponents.has(componentId)) return;
            const component = rootMeta.components?.get(componentId);
            if (component) {
              const reactiveTypes = Array.isArray(component.reactiveType)
                ? component.reactiveType
                : [component.reactiveType || 'component'];
              if (!reactiveTypes.includes('none')) {
                component.forceUpdate();
                notifiedComponents.add(componentId);
              }
            }
          });
        }
      });
    }
  } else if (updateType === 'insert' || updateType === 'cut') {
    const parentArrayPath = updateType === 'insert' ? path : path.slice(0, -1);
    const parentMeta = store.getShadowMetadata(stateKey, parentArrayPath);
    if (parentMeta?.pathComponents) {
      parentMeta.pathComponents.forEach((componentId) => {
        if (!notifiedComponents.has(componentId)) {
          const component = rootMeta.components?.get(componentId);
          if (component) {
            component.forceUpdate();
            notifiedComponents.add(componentId);
          }
        }
      });
    }
  }

  // --- PASS 2: Notify global subscribers ('all', 'deps') ---

  rootMeta.components.forEach((component, componentId) => {
    if (notifiedComponents.has(componentId)) {
      return;
    }

    const reactiveTypes = Array.isArray(component.reactiveType)
      ? component.reactiveType
      : [component.reactiveType || 'component'];

    if (reactiveTypes.includes('all')) {
      component.forceUpdate();
      notifiedComponents.add(componentId);
      return;
    }

    if (reactiveTypes.includes('deps')) {
      if (component.depsFunction) {
        const currentState = store.getShadowValue(stateKey);
        const newDeps = component.depsFunction(currentState);
        let shouldUpdate = false;
        if (newDeps === true || !isDeepEqual(component.prevDeps, newDeps)) {
          if (Array.isArray(newDeps)) component.prevDeps = newDeps;
          shouldUpdate = true;
        }
        if (shouldUpdate) {
          component.forceUpdate();
          notifiedComponents.add(componentId);
        }
      }
    }
  });
};

export function useCogsStateFn<TStateObject extends unknown>(
  stateObject: TStateObject,
  {
    stateKey,

    localStorage,
    formElements,
    reactiveDeps,
    reactiveType,
    componentId,
    defaultState,
    syncUpdate,
    dependencies,
    serverState,
    apiParamsSchema,
  }: {
    stateKey?: string;
    componentId?: string;
    defaultState?: TStateObject;
    apiParamsSchema?: z.ZodObject<any>; // Add this type
  } & OptionsType<TStateObject> = {}
) {
  const [reactiveForce, forceUpdate] = useState({}); //this is the key to reactivity
  const { sessionId } = useCogsConfig();

  let noStateKey = stateKey ? false : true;
  const [thisKey] = useState(stateKey ?? uuidv4());
  const stateLog = getGlobalStore.getState().stateLog[thisKey];
  const componentUpdatesRef = useRef(new Set<string>());
  const componentIdRef = useRef(componentId ?? uuidv4());
  const latestInitialOptionsRef = useRef<OptionsType<TStateObject> | null>(
    null
  );
  latestInitialOptionsRef.current = (getInitialOptions(thisKey as string) ??
    null) as OptionsType<TStateObject> | null;

  useEffect(() => {
    if (syncUpdate && syncUpdate.stateKey === thisKey && syncUpdate.path?.[0]) {
      // Update the actual state value

      // Create combined key and update sync info
      const syncKey = `${syncUpdate.stateKey}:${syncUpdate.path.join('.')}`;
      getGlobalStore.getState().setSyncInfo(syncKey, {
        timeStamp: syncUpdate.timeStamp!,
        userId: syncUpdate.userId!,
      });
    }
  }, [syncUpdate]);

  const resolveInitialState = useCallback(
    (
      overrideOptions?: OptionsType<TStateObject>
    ): {
      value: TStateObject;
      source: 'default' | 'server' | 'localStorage';
      timestamp: number;
    } => {
      // If we pass in options, use them. Otherwise, get from the global store.
      const optionsToUse = overrideOptions
        ? { ...getInitialOptions(thisKey as string), ...overrideOptions }
        : getInitialOptions(thisKey as string);

      const currentOptions = optionsToUse;
      const finalDefaultState =
        currentOptions?.defaultState || defaultState || stateObject;

      // 1. Check server state
      const hasValidServerData =
        currentOptions?.serverState?.status === 'success' &&
        currentOptions?.serverState?.data !== undefined;

      if (hasValidServerData) {
        return {
          value: currentOptions.serverState!.data! as any,
          source: 'server',
          timestamp: currentOptions.serverState!.timestamp || Date.now(),
        };
      }
      // 2. Check localStorage
      if (currentOptions?.localStorage?.key && sessionId) {
        const localKey = isFunction(currentOptions.localStorage.key)
          ? currentOptions.localStorage.key(finalDefaultState)
          : currentOptions.localStorage.key;

        const localData = loadFromLocalStorage(
          `${sessionId}-${thisKey}-${localKey}`
        );

        if (
          localData &&
          localData.lastUpdated > (currentOptions?.serverState?.timestamp || 0)
        ) {
          return {
            value: localData.state,
            source: 'localStorage',
            timestamp: localData.lastUpdated,
          };
        }
      }

      // 3. Use default state
      return {
        value: finalDefaultState || (stateObject as any),
        source: 'default',
        timestamp: Date.now(),
      };
    },
    [thisKey, defaultState, stateObject, sessionId]
  );

  // Effect 1: When this component's serverState prop changes, broadcast it
  useEffect(() => {
    getGlobalStore.getState().setServerStateUpdate(thisKey, serverState);
  }, [serverState, thisKey]);

  // Effect 2: Listen for server state updates from ANY component
  useEffect(() => {
    const unsubscribe = getGlobalStore
      .getState()
      .subscribeToPath(thisKey, (event) => {
        if (event?.type === 'SERVER_STATE_UPDATE') {
          const serverStateData = event.serverState;

          if (
            serverStateData?.status === 'success' &&
            serverStateData.data !== undefined
          ) {
            const newOptions = { serverState: serverStateData };
            setAndMergeOptions(thisKey, newOptions);

            const mergeConfig =
              typeof serverStateData.merge === 'object'
                ? serverStateData.merge
                : serverStateData.merge === true
                  ? { strategy: 'append' }
                  : null;

            const currentState = getGlobalStore
              .getState()
              .getShadowValue(thisKey);
            const incomingData = serverStateData.data;

            if (
              mergeConfig &&
              Array.isArray(currentState) &&
              Array.isArray(incomingData)
            ) {
              const keyField = mergeConfig.key || 'id';
              const existingIds = new Set(
                currentState.map((item: any) => item[keyField])
              );

              const newUniqueItems = incomingData.filter((item: any) => {
                return !existingIds.has(item[keyField]);
              });

              if (newUniqueItems.length > 0) {
                newUniqueItems.forEach((item) => {
                  getGlobalStore
                    .getState()
                    .insertShadowArrayElement(thisKey, [], item);

                  // MARK NEW SERVER ITEMS AS SYNCED
                  const arrayMeta = getGlobalStore
                    .getState()
                    .getShadowMetadata(thisKey, []);

                  if (arrayMeta?.arrayKeys) {
                    const newItemKey =
                      arrayMeta.arrayKeys[arrayMeta.arrayKeys.length - 1];
                    if (newItemKey) {
                      const newItemPath = newItemKey.split('.').slice(1);

                      // Mark the new server item as synced, not dirty
                      getGlobalStore
                        .getState()
                        .setShadowMetadata(thisKey, newItemPath, {
                          isDirty: false,
                          stateSource: 'server',
                          lastServerSync:
                            serverStateData.timestamp || Date.now(),
                        });

                      // Also mark all its child fields as synced if it's an object
                      const itemValue = getGlobalStore
                        .getState()
                        .getShadowValue(newItemKey);
                      if (
                        itemValue &&
                        typeof itemValue === 'object' &&
                        !Array.isArray(itemValue)
                      ) {
                        Object.keys(itemValue).forEach((fieldKey) => {
                          const fieldPath = [...newItemPath, fieldKey];
                          getGlobalStore
                            .getState()
                            .setShadowMetadata(thisKey, fieldPath, {
                              isDirty: false,
                              stateSource: 'server',
                              lastServerSync:
                                serverStateData.timestamp || Date.now(),
                            });
                        });
                      }
                    }
                  }
                });
              }
            } else {
              // For replace strategy or initial load
              getGlobalStore
                .getState()
                .initializeShadowState(thisKey, incomingData);

              // Mark the entire state tree as synced from server
              markEntireStateAsServerSynced(
                thisKey,
                [],
                incomingData,
                serverStateData.timestamp
              );
            }

            const meta = getGlobalStore
              .getState()
              .getShadowMetadata(thisKey, []);
            getGlobalStore.getState().setShadowMetadata(thisKey, [], {
              ...meta,
              stateSource: 'server',
              lastServerSync: serverStateData.timestamp || Date.now(),
              isDirty: false,
            });
          }
        }
      });

    return unsubscribe;
  }, [thisKey, resolveInitialState]);

  useEffect(() => {
    const existingMeta = getGlobalStore
      .getState()
      .getShadowMetadata(thisKey, []);
    if (existingMeta && existingMeta.stateSource) {
      return; // Already initialized, bail out.
    }

    const options = getInitialOptions(thisKey as string);

    if (options?.defaultState !== undefined || defaultState !== undefined) {
      const finalDefaultState = options?.defaultState || defaultState;

      // Only set defaultState if it's not already set
      if (!options?.defaultState) {
        setAndMergeOptions(thisKey as string, {
          defaultState: finalDefaultState,
        });
      }

      const { value: resolvedState, source, timestamp } = resolveInitialState();

      getGlobalStore.getState().initializeShadowState(thisKey, resolvedState);

      // Set shadow metadata with the correct source info
      getGlobalStore.getState().setShadowMetadata(thisKey, [], {
        stateSource: source,
        lastServerSync: source === 'server' ? timestamp : undefined,
        isDirty: false,
        baseServerState: source === 'server' ? resolvedState : undefined,
      });

      notifyComponents(thisKey);
    }
  }, [thisKey, ...(dependencies || [])]);
  useLayoutEffect(() => {
    if (noStateKey) {
      setAndMergeOptions(thisKey as string, {
        formElements,
        defaultState,
        localStorage,
        middleware: latestInitialOptionsRef.current?.middleware,
      });
    }

    const componentKey = `${thisKey}////${componentIdRef.current}`;

    // Register component in shadow metadata at root level
    const rootMeta = getGlobalStore.getState().getShadowMetadata(thisKey, []);
    const components = rootMeta?.components || new Map();

    components.set(componentKey, {
      forceUpdate: () => forceUpdate({}),
      reactiveType: reactiveType ?? ['component', 'deps'],
      paths: new Set(),
      depsFunction: reactiveDeps || undefined,
      deps: reactiveDeps
        ? reactiveDeps(getGlobalStore.getState().getShadowValue(thisKey))
        : [],
      prevDeps: reactiveDeps // Initialize prevDeps with the same initial value
        ? reactiveDeps(getGlobalStore.getState().getShadowValue(thisKey))
        : [],
    });

    getGlobalStore.getState().setShadowMetadata(thisKey, [], {
      ...rootMeta,
      components,
    });
    forceUpdate({});
    return () => {
      const meta = getGlobalStore.getState().getShadowMetadata(thisKey, []);
      const component = meta?.components?.get(componentKey);

      // Remove from each path we registered to
      if (component?.paths) {
        component.paths.forEach((fullPath) => {
          // fullPath is like "todos.0.name", need to split and remove stateKey
          const pathParts = fullPath.split('.');
          const path = pathParts.slice(1); // Remove stateKey part

          const pathMeta = getGlobalStore
            .getState()
            .getShadowMetadata(thisKey, path);
          if (pathMeta?.pathComponents) {
            // Optionally clean up empty Sets

            if (pathMeta.pathComponents.size === 0) {
              delete pathMeta.pathComponents;
              getGlobalStore
                .getState()
                .setShadowMetadata(thisKey, path, pathMeta);
            }
          }
        });
      }

      // Remove from root components
      if (meta?.components) {
        getGlobalStore.getState().setShadowMetadata(thisKey, [], meta);
      }
    };
  }, []);

  const syncApiRef = useRef<SyncApi | null>(null);
  const effectiveSetState = (
    newStateOrFunction: UpdateArg<TStateObject> | InsertParams<TStateObject>,
    path: string[],
    updateObj: UpdateOptions
  ) => {
    const fullPath = [thisKey, ...path].join('.');
    if (Array.isArray(path)) {
      const pathKey = `${thisKey}-${path.join('.')}`;
      componentUpdatesRef.current.add(pathKey);
    }
    const store = getGlobalStore.getState();

    // FETCH ONCE at the beginning
    const shadowMeta = store.getShadowMetadata(thisKey, path);
    const nestedShadowValue = store.getShadowValue(fullPath) as TStateObject;

    const payload = (
      updateObj.updateType === 'insert' && isFunction(newStateOrFunction)
        ? newStateOrFunction({ state: nestedShadowValue, uuid: uuidv4() })
        : isFunction(newStateOrFunction)
          ? newStateOrFunction(nestedShadowValue)
          : newStateOrFunction
    ) as TStateObject;

    const timeStamp = Date.now();

    const newUpdate = {
      timeStamp,
      stateKey: thisKey,
      path,
      updateType: updateObj.updateType,
      status: 'new' as const,
      oldValue: nestedShadowValue,
      newValue: payload,
    } satisfies UpdateTypeDetail;

    // Perform the update
    switch (updateObj.updateType) {
      case 'insert': {
        store.insertShadowArrayElement(thisKey, path, newUpdate.newValue);
        // The array at `path` has been modified. Mark it AND all its parents as dirty.
        store.markAsDirty(thisKey, path, { bubble: true });

        // ALSO mark the newly inserted item itself as dirty
        // Get the new item's path and mark it as dirty
        const arrayMeta = store.getShadowMetadata(thisKey, path);
        if (arrayMeta?.arrayKeys) {
          const newItemKey =
            arrayMeta.arrayKeys[arrayMeta.arrayKeys.length - 1];
          if (newItemKey) {
            const newItemPath = newItemKey.split('.').slice(1); // Remove stateKey
            store.markAsDirty(thisKey, newItemPath, { bubble: false });
          }
        }
        break;
      }
      case 'cut': {
        const parentArrayPath = path.slice(0, -1);

        store.removeShadowArrayElement(thisKey, path);
        store.markAsDirty(thisKey, parentArrayPath, { bubble: true });
        break;
      }
      case 'update': {
        store.updateShadowAtPath(thisKey, path, newUpdate.newValue);
        store.markAsDirty(thisKey, path, { bubble: true });
        break;
      }
    }
    const shouldSync = updateObj.sync !== false;

    if (shouldSync && syncApiRef.current && syncApiRef.current.connected) {
      syncApiRef.current.updateState({ operation: newUpdate });
    }
    // Handle signals - reuse shadowMeta from the beginning
    if (shadowMeta?.signals && shadowMeta.signals.length > 0) {
      // Use updatedShadowValue if we need the new value, otherwise use payload
      const displayValue = updateObj.updateType === 'cut' ? null : payload;

      shadowMeta.signals.forEach(({ parentId, position, effect }) => {
        const parent = document.querySelector(`[data-parent-id="${parentId}"]`);
        if (parent) {
          const childNodes = Array.from(parent.childNodes);
          if (childNodes[position]) {
            let finalDisplayValue = displayValue;
            if (effect && displayValue !== null) {
              try {
                finalDisplayValue = new Function(
                  'state',
                  `return (${effect})(state)`
                )(displayValue);
              } catch (err) {
                console.error('Error evaluating effect function:', err);
              }
            }

            if (
              finalDisplayValue !== null &&
              finalDisplayValue !== undefined &&
              typeof finalDisplayValue === 'object'
            ) {
              finalDisplayValue = JSON.stringify(finalDisplayValue) as any;
            }

            childNodes[position].textContent = String(finalDisplayValue ?? '');
          }
        }
      });
    }

    // Update in effectiveSetState for insert handling:
    if (updateObj.updateType === 'insert') {
      // Use shadowMeta from beginning if it's an array
      if (shadowMeta?.mapWrappers && shadowMeta.mapWrappers.length > 0) {
        // Get fresh array keys after insert
        const sourceArrayKeys =
          store.getShadowMetadata(thisKey, path)?.arrayKeys || [];
        const newItemKey = sourceArrayKeys[sourceArrayKeys.length - 1]!;
        const newItemValue = store.getShadowValue(newItemKey);
        const fullSourceArray = store.getShadowValue(
          [thisKey, ...path].join('.')
        );

        if (!newItemKey || newItemValue === undefined) return;

        shadowMeta.mapWrappers.forEach((wrapper) => {
          let shouldRender = true;
          let insertPosition = -1;

          // Check if wrapper has transforms
          if (wrapper.meta?.transforms && wrapper.meta.transforms.length > 0) {
            // Check if new item passes all filters
            for (const transform of wrapper.meta.transforms) {
              if (transform.type === 'filter') {
                if (!transform.fn(newItemValue, -1)) {
                  shouldRender = false;
                  break;
                }
              }
            }

            if (shouldRender) {
              // Get current valid keys by applying transforms
              const currentValidKeys = applyTransforms(
                thisKey,
                path,
                wrapper.meta.transforms
              );

              // Find where to insert based on sort
              const sortTransform = wrapper.meta.transforms.find(
                (t: any) => t.type === 'sort'
              );
              if (sortTransform) {
                // Add new item to the list and sort to find position
                const allItems = currentValidKeys.map((key) => ({
                  key,
                  value: store.getShadowValue(key),
                }));

                allItems.push({ key: newItemKey, value: newItemValue });
                allItems.sort((a, b) => sortTransform.fn(a.value, b.value));

                insertPosition = allItems.findIndex(
                  (item) => item.key === newItemKey
                );
              } else {
                // No sort, insert at end
                insertPosition = currentValidKeys.length;
              }
            }
          } else {
            // No transforms, always render at end
            shouldRender = true;
            insertPosition = sourceArrayKeys.length - 1;
          }

          if (!shouldRender) {
            return; // Skip this wrapper, item doesn't pass filters
          }

          if (wrapper.containerRef && wrapper.containerRef.isConnected) {
            const itemElement = document.createElement('div');
            itemElement.setAttribute('data-item-path', newItemKey);

            // Insert at correct position
            const children = Array.from(wrapper.containerRef.children);
            if (insertPosition >= 0 && insertPosition < children.length) {
              wrapper.containerRef.insertBefore(
                itemElement,
                children[insertPosition]!
              );
            } else {
              wrapper.containerRef.appendChild(itemElement);
            }

            const root = createRoot(itemElement);
            const componentId = uuidv4();
            const itemPath = newItemKey.split('.').slice(1);

            const arraySetter = wrapper.rebuildStateShape({
              path: wrapper.path,
              currentState: fullSourceArray,
              componentId: wrapper.componentId,
              meta: wrapper.meta,
            });

            root.render(
              createElement(MemoizedCogsItemWrapper, {
                stateKey: thisKey,
                itemComponentId: componentId,
                itemPath: itemPath,
                localIndex: insertPosition,
                arraySetter: arraySetter,
                rebuildStateShape: wrapper.rebuildStateShape,
                renderFn: wrapper.mapFn,
              })
            );
          }
        });
      }
    }
    if (updateObj.updateType === 'cut') {
      const arrayPath = path.slice(0, -1);
      const arrayMeta = store.getShadowMetadata(thisKey, arrayPath);

      if (arrayMeta?.mapWrappers && arrayMeta.mapWrappers.length > 0) {
        arrayMeta.mapWrappers.forEach((wrapper) => {
          if (wrapper.containerRef && wrapper.containerRef.isConnected) {
            const elementToRemove = wrapper.containerRef.querySelector(
              `[data-item-path="${fullPath}"]`
            );
            if (elementToRemove) {
              elementToRemove.remove();
            }
          }
        });
      }
    }

    // Assumes `isDeepEqual` is available in this scope.
    // Assumes `isDeepEqual` is available in this scope.

    const newState = getGlobalStore.getState().getShadowValue(thisKey);
    const rootMeta = getGlobalStore.getState().getShadowMetadata(thisKey, []);
    const notifiedComponents = new Set<string>();
    console.log(
      'rootMeta',
      thisKey,
      getGlobalStore.getState().shadowStateStore
    );
    if (!rootMeta?.components) {
      return newState;
    }

    // --- PASS 1: Notify specific subscribers based on update type ---

    if (updateObj.updateType === 'update') {
      // --- Bubble-up Notification ---
      // When a nested property changes, notify components listening at that exact path,
      // and also "bubble up" to notify components listening on parent paths.
      // e.g., an update to `user.address.street` notifies listeners of `street`, `address`, and `user`.
      let currentPath = [...path]; // Create a mutable copy of the path

      while (true) {
        const currentPathMeta = store.getShadowMetadata(thisKey, currentPath);

        if (currentPathMeta?.pathComponents) {
          currentPathMeta.pathComponents.forEach((componentId) => {
            if (notifiedComponents.has(componentId)) {
              return; // Avoid sending redundant notifications
            }
            const component = rootMeta.components?.get(componentId);
            if (component) {
              const reactiveTypes = Array.isArray(component.reactiveType)
                ? component.reactiveType
                : [component.reactiveType || 'component'];

              // This notification logic applies to components that depend on object structures.
              if (!reactiveTypes.includes('none')) {
                component.forceUpdate();
                notifiedComponents.add(componentId);
              }
            }
          });
        }

        if (currentPath.length === 0) {
          break; // We've reached the root, stop bubbling.
        }
        currentPath.pop(); // Go up one level for the next iteration.
      }

      // ADDITIONALLY, if the payload is an object, perform a deep-check and
      // notify any components that are subscribed to specific sub-paths that changed.
      if (
        payload &&
        typeof payload === 'object' &&
        !isArray(payload) &&
        nestedShadowValue &&
        typeof nestedShadowValue === 'object' &&
        !isArray(nestedShadowValue)
      ) {
        // Get a list of dot-separated paths that have changed (e.g., ['name', 'address.city'])
        const changedSubPaths = getDifferences(payload, nestedShadowValue);

        changedSubPaths.forEach((subPathString) => {
          const subPath = subPathString.split('.');
          const fullSubPath = [...path, ...subPath];

          // Get the metadata (and subscribers) for this specific nested path
          const subPathMeta = store.getShadowMetadata(thisKey, fullSubPath);
          if (subPathMeta?.pathComponents) {
            subPathMeta.pathComponents.forEach((componentId) => {
              // Avoid sending a redundant update
              if (notifiedComponents.has(componentId)) {
                return;
              }
              const component = rootMeta.components?.get(componentId);
              if (component) {
                const reactiveTypes = Array.isArray(component.reactiveType)
                  ? component.reactiveType
                  : [component.reactiveType || 'component'];

                if (!reactiveTypes.includes('none')) {
                  component.forceUpdate();
                  notifiedComponents.add(componentId);
                }
              }
            });
          }
        });
      }
    } else if (
      updateObj.updateType === 'insert' ||
      updateObj.updateType === 'cut'
    ) {
      // For array structural changes, notify components listening to the parent array.
      const parentArrayPath =
        updateObj.updateType === 'insert' ? path : path.slice(0, -1);

      const parentMeta = store.getShadowMetadata(thisKey, parentArrayPath);

      // Handle signal updates for array length, etc.
      if (parentMeta?.signals && parentMeta.signals.length > 0) {
        const parentFullPath = [thisKey, ...parentArrayPath].join('.');
        const parentValue = store.getShadowValue(parentFullPath);

        parentMeta.signals.forEach(({ parentId, position, effect }) => {
          const parent = document.querySelector(
            `[data-parent-id="${parentId}"]`
          );
          if (parent) {
            const childNodes = Array.from(parent.childNodes);
            if (childNodes[position]) {
              let displayValue = parentValue;
              if (effect) {
                try {
                  displayValue = new Function(
                    'state',
                    `return (${effect})(state)`
                  )(parentValue);
                } catch (err) {
                  console.error('Error evaluating effect function:', err);
                  displayValue = parentValue;
                }
              }

              if (
                displayValue !== null &&
                displayValue !== undefined &&
                typeof displayValue === 'object'
              ) {
                displayValue = JSON.stringify(displayValue);
              }

              childNodes[position].textContent = String(displayValue ?? '');
            }
          }
        });
      }

      // Notify components subscribed to the array itself.
      if (parentMeta?.pathComponents) {
        parentMeta.pathComponents.forEach((componentId) => {
          if (!notifiedComponents.has(componentId)) {
            const component = rootMeta.components?.get(componentId);
            if (component) {
              component.forceUpdate();
              notifiedComponents.add(componentId);
            }
          }
        });
      }
    }

    rootMeta.components.forEach((component, componentId) => {
      if (notifiedComponents.has(componentId)) {
        return;
      }

      const reactiveTypes = Array.isArray(component.reactiveType)
        ? component.reactiveType
        : [component.reactiveType || 'component'];

      if (reactiveTypes.includes('all')) {
        component.forceUpdate();
        notifiedComponents.add(componentId);
        return;
      }

      if (reactiveTypes.includes('deps')) {
        if (component.depsFunction) {
          const currentState = store.getShadowValue(thisKey);
          const newDeps = component.depsFunction(currentState);
          let shouldUpdate = false;

          if (newDeps === true) {
            shouldUpdate = true;
          } else if (Array.isArray(newDeps)) {
            if (!isDeepEqual(component.prevDeps, newDeps)) {
              component.prevDeps = newDeps;
              shouldUpdate = true;
            }
          }

          if (shouldUpdate) {
            component.forceUpdate();
            notifiedComponents.add(componentId);
          }
        }
      }
    });
    notifiedComponents.clear();
    setStateLog(thisKey, (prevLogs) => {
      const logs = [...(prevLogs ?? []), newUpdate];
      const aggregatedLogs = new Map<string, typeof newUpdate>();

      logs.forEach((log) => {
        const uniqueKey = `${log.stateKey}:${JSON.stringify(log.path)}`;
        const existing = aggregatedLogs.get(uniqueKey);

        if (existing) {
          existing.timeStamp = Math.max(existing.timeStamp, log.timeStamp);
          existing.newValue = log.newValue;
          existing.oldValue = existing.oldValue ?? log.oldValue;
          existing.updateType = log.updateType;
        } else {
          aggregatedLogs.set(uniqueKey, { ...(log as any) });
        }
      });

      return Array.from(aggregatedLogs.values());
    });

    saveToLocalStorage(
      payload,
      thisKey,
      latestInitialOptionsRef.current,
      sessionId
    );

    if (latestInitialOptionsRef.current?.middleware) {
      latestInitialOptionsRef.current!.middleware({
        updateLog: stateLog,
        update: newUpdate,
      });
    }

    return newState;
  };

  if (!getGlobalStore.getState().initialStateGlobal[thisKey]) {
    updateInitialStateGlobal(thisKey, stateObject);
  }

  const updaterFinal = useMemo(() => {
    return createProxyHandler<TStateObject>(
      thisKey,
      effectiveSetState,
      componentIdRef.current,
      sessionId
    );
  }, [thisKey, sessionId]);

  const cogsSyncFn = latestInitialOptionsRef.current?.cogsSync;
  if (cogsSyncFn) {
    syncApiRef.current = cogsSyncFn(updaterFinal);
  }

  return updaterFinal;
}

export type MetaData = {
  /**
   * An array of the full, unique string IDs (e.g., `"stateKey.arrayName.id:123"`)
   * of the items that belong to the current derived "view" of an array.
   * This is the primary mechanism for tracking the state of filtered or sorted lists.
   *
   * - `stateFilter` populates this with only the IDs of items that passed the filter.
   * - `stateSort` reorders this list to match the new sort order.
   * - All subsequent chained operations (like `.get()`, `.index()`, or `.cut()`)
   *   MUST consult this list first to know which items they apply to and in what order.
   */
  validIds?: string[];

  /**
   * An array of the actual filter functions that have been applied in a chain.
   * This is primarily used by reactive renderers like `$stateMap` to make predictions.
   *
   * For example, when a new item is inserted into the original source array, a
   * `$stateMap` renderer on a filtered view can use these functions to test if the
   * newly inserted item should be dynamically rendered in its view.
   */
  transforms?: Array<{
    type: 'filter' | 'sort';
    fn: Function;
  }>;
};

function hashTransforms(transforms: any[]) {
  if (!transforms || transforms.length === 0) {
    return '';
  }
  // This creates a string representation of the transforms AND their dependencies.
  // Example: "filter['red']sort['score','asc']"
  return transforms
    .map(
      (transform) =>
        // Safely stringify dependencies. An empty array becomes '[]'.
        `${transform.type}${JSON.stringify(transform.dependencies || [])}`
    )
    .join('');
}
const applyTransforms = (
  stateKey: string,
  path: string[],
  transforms?: Array<{ type: 'filter' | 'sort'; fn: Function }>
): string[] => {
  let arrayKeys =
    getGlobalStore.getState().getShadowMetadata(stateKey, path)?.arrayKeys ||
    [];

  if (!transforms || transforms.length === 0) {
    return arrayKeys;
  }

  let itemsWithKeys = arrayKeys.map((key) => ({
    key,
    value: getGlobalStore.getState().getShadowValue(key),
  }));

  for (const transform of transforms) {
    if (transform.type === 'filter') {
      itemsWithKeys = itemsWithKeys.filter(({ value }, index) =>
        transform.fn(value, index)
      );
    } else if (transform.type === 'sort') {
      itemsWithKeys.sort((a, b) => transform.fn(a.value, b.value));
    }
  }

  return itemsWithKeys.map(({ key }) => key);
};
const registerComponentDependency = (
  stateKey: string,
  componentId: string,
  dependencyPath: string[]
) => {
  const fullComponentId = `${stateKey}////${componentId}`;
  const { addPathComponent, getShadowMetadata } = getGlobalStore.getState();

  // First, check if the component should even be registered.
  // This check is safe to do outside the setter.
  const rootMeta = getShadowMetadata(stateKey, []);
  const component = rootMeta?.components?.get(fullComponentId);

  if (
    !component ||
    component.reactiveType === 'none' ||
    !(
      Array.isArray(component.reactiveType)
        ? component.reactiveType
        : [component.reactiveType]
    ).includes('component')
  ) {
    return;
  }

  // Now, call the single, safe, atomic function to perform the update.
  addPathComponent(stateKey, dependencyPath, fullComponentId);
};
const notifySelectionComponents = (
  stateKey: string,
  parentPath: string[],
  currentSelected?: string | undefined
) => {
  const store = getGlobalStore.getState();
  const rootMeta = store.getShadowMetadata(stateKey, []);
  const notifiedComponents = new Set<string>();

  // Handle "all" reactive components first
  if (rootMeta?.components) {
    rootMeta.components.forEach((component, componentId) => {
      const reactiveTypes = Array.isArray(component.reactiveType)
        ? component.reactiveType
        : [component.reactiveType || 'component'];

      if (reactiveTypes.includes('all')) {
        component.forceUpdate();
        notifiedComponents.add(componentId);
      }
    });
  }

  store
    .getShadowMetadata(stateKey, [...parentPath, 'getSelected'])
    ?.pathComponents?.forEach((componentId) => {
      const thisComp = rootMeta?.components?.get(componentId);
      thisComp?.forceUpdate();
    });

  const parentMeta = store.getShadowMetadata(stateKey, parentPath);
  for (let arrayKey of parentMeta?.arrayKeys || []) {
    const key = arrayKey + '.selected';
    const selectedItem = store.getShadowMetadata(
      stateKey,
      key.split('.').slice(1)
    );
    if (arrayKey == currentSelected) {
      selectedItem?.pathComponents?.forEach((componentId) => {
        const thisComp = rootMeta?.components?.get(componentId);
        thisComp?.forceUpdate();
      });
    }
  }
};
function createProxyHandler<T>(
  stateKey: string,
  effectiveSetState: EffectiveSetState<T>,
  componentId: string,
  sessionId?: string
): StateObject<T> {
  type CacheEntry = {
    proxy: any;
    stateVersion: number;
  };

  const shapeCache = new Map<string, CacheEntry>();
  let stateVersion = 0;

  const invalidateCachePath = (path: string[]) => {
    const pathKey = path.join('.');
    for (const [key] of shapeCache) {
      if (key === pathKey || key.startsWith(pathKey + '.')) {
        shapeCache.delete(key);
      }
    }
    stateVersion++;
  };

  function rebuildStateShape({
    currentState,
    path = [],
    meta,
    componentId,
  }: {
    currentState: T;
    path: string[];
    componentId: string;
    meta?: MetaData;
  }): any {
    const cacheKey = path.map(String).join('.');
    const stateKeyPathKey = [stateKey, ...path].join('.');

    currentState = getGlobalStore
      .getState()
      .getShadowValue(stateKeyPathKey, meta?.validIds);

    type CallableStateObject<T> = {
      (): T;
    } & {
      [key: string]: any;
    };

    const baseFunction = function () {
      return getGlobalStore().getShadowValue(stateKey, path);
    } as unknown as CallableStateObject<T>;

    // We attach baseObj properties *inside* the get trap now to avoid recursion
    // This is a placeholder for the proxy.

    const handler = {
      apply(target: any, thisArg: any, args: any[]) {
        //return getGlobalStore().getShadowValue(stateKey, path);
      },

      get(target: any, prop: string) {
        // V--------- THE CRUCIAL FIX IS HERE ---------V
        // This handles requests for internal functions on the proxy,
        // returning the function itself instead of treating it as state.
        if (prop === '_rebuildStateShape') {
          return rebuildStateShape;
        }
        const baseObjProps = Object.getOwnPropertyNames(baseObj);
        if (baseObjProps.includes(prop) && path.length === 0) {
          return (baseObj as any)[prop];
        }
        // ^--------- END OF FIX ---------^

        if (prop === 'getDifferences') {
          return () => {
            const shadowMeta = getGlobalStore
              .getState()
              .getShadowMetadata(stateKey, []);
            const currentState = getGlobalStore
              .getState()
              .getShadowValue(stateKey);

            // Use the appropriate base state for comparison
            let baseState;
            if (
              shadowMeta?.stateSource === 'server' &&
              shadowMeta.baseServerState
            ) {
              baseState = shadowMeta.baseServerState;
            } else {
              baseState =
                getGlobalStore.getState().initialStateGlobal[stateKey];
            }

            return getDifferences(currentState, baseState);
          };
        }
        if (prop === 'sync' && path.length === 0) {
          return async function () {
            const options = getGlobalStore
              .getState()
              .getInitialOptions(stateKey);
            const sync = options?.sync;

            if (!sync) {
              console.error(`No mutation defined for state key "${stateKey}"`);
              return { success: false, error: `No mutation defined` };
            }

            const state = getGlobalStore
              .getState()
              .getShadowValue(stateKey, []);
            const validationKey = options?.validation?.key;

            try {
              const response = await sync.action(state);
              if (
                response &&
                !response.success &&
                response.errors &&
                validationKey
              ) {
                getGlobalStore.getState().removeValidationError(validationKey);
                response.errors.forEach((error) => {
                  const errorPath = [validationKey, ...error.path].join('.');
                  getGlobalStore
                    .getState()
                    .addValidationError(errorPath, error.message);
                });
                notifyComponents(stateKey);
              }

              if (response?.success) {
                // Mark as synced and not dirty
                const shadowMeta = getGlobalStore
                  .getState()
                  .getShadowMetadata(stateKey, []);
                getGlobalStore.getState().setShadowMetadata(stateKey, [], {
                  ...shadowMeta,
                  isDirty: false,
                  lastServerSync: Date.now(),
                  stateSource: 'server',
                  baseServerState: state, // Update base server state
                });

                if (sync.onSuccess) {
                  sync.onSuccess(response.data);
                }
              } else if (!response?.success && sync.onError)
                sync.onError(response.error);

              return response;
            } catch (error) {
              if (sync.onError) sync.onError(error);
              return { success: false, error };
            }
          };
        }
        // Fixed getStatus function in createProxyHandler
        if (prop === '_status' || prop === 'getStatus') {
          const getStatusFunc = () => {
            const shadowMeta = getGlobalStore
              .getState()
              .getShadowMetadata(stateKey, path);
            const value = getGlobalStore
              .getState()
              .getShadowValue(stateKeyPathKey);

            // Priority 1: Explicitly dirty items
            if (shadowMeta?.isDirty === true) {
              return 'dirty';
            }

            // Priority 2: Explicitly synced items (isDirty: false)
            if (shadowMeta?.isDirty === false) {
              return 'synced';
            }

            // Priority 3: Items from server source (should be synced even without explicit isDirty flag)
            if (shadowMeta?.stateSource === 'server') {
              return 'synced';
            }

            // Priority 4: Items restored from localStorage
            if (shadowMeta?.stateSource === 'localStorage') {
              return 'restored';
            }

            // Priority 5: Items from default/initial state
            if (shadowMeta?.stateSource === 'default') {
              return 'fresh';
            }

            // Priority 6: Check if this is part of initial server load
            // Look up the tree to see if parent has server source
            const rootMeta = getGlobalStore
              .getState()
              .getShadowMetadata(stateKey, []);
            if (rootMeta?.stateSource === 'server' && !shadowMeta?.isDirty) {
              return 'synced';
            }

            // Priority 7: If no metadata exists but value exists, it's probably fresh
            if (value !== undefined && !shadowMeta) {
              return 'fresh';
            }

            // Fallback
            return 'unknown';
          };

          return prop === '_status' ? getStatusFunc() : getStatusFunc;
        }
        if (prop === 'removeStorage') {
          return () => {
            const initialState =
              getGlobalStore.getState().initialStateGlobal[stateKey];
            const initalOptionsGet = getInitialOptions(stateKey as string);
            const localKey = isFunction(initalOptionsGet?.localStorage?.key)
              ? initalOptionsGet.localStorage.key(initialState)
              : initalOptionsGet?.localStorage?.key;
            const storageKey = `${sessionId}-${stateKey}-${localKey}`;
            if (storageKey) localStorage.removeItem(storageKey);
          };
        }
        if (prop === 'showValidationErrors') {
          return () => {
            const meta = getGlobalStore
              .getState()
              .getShadowMetadata(stateKey, path);
            if (
              meta?.validation?.status === 'VALIDATION_FAILED' &&
              meta.validation.message
            ) {
              return [meta.validation.message];
            }
            return [];
          };
        }
        if (Array.isArray(currentState)) {
          if (prop === 'getSelected') {
            return () => {
              const fullKey = stateKey + '.' + path.join('.');
              registerComponentDependency(stateKey, componentId, [
                ...path,
                'getSelected',
              ]);

              const selectedIndicesMap =
                getGlobalStore.getState().selectedIndicesMap;
              if (!selectedIndicesMap || !selectedIndicesMap.has(fullKey)) {
                return undefined;
              }

              const selectedItemKey = selectedIndicesMap.get(fullKey)!;
              if (meta?.validIds) {
                if (!meta.validIds.includes(selectedItemKey)) {
                  return undefined;
                }
              }

              const value = getGlobalStore
                .getState()
                .getShadowValue(selectedItemKey);

              if (!value) {
                return undefined;
              }

              return rebuildStateShape({
                currentState: value,
                path: selectedItemKey.split('.').slice(1) as string[],
                componentId: componentId!,
              });
            };
          }
          if (prop === 'getSelectedIndex') {
            return () => {
              const selectedIndex = getGlobalStore
                .getState()
                .getSelectedIndex(
                  stateKey + '.' + path.join('.'),
                  meta?.validIds
                );

              return selectedIndex;
            };
          }
          if (prop === 'clearSelected') {
            notifySelectionComponents(stateKey, path);
            return () => {
              getGlobalStore.getState().clearSelectedIndex({
                arrayKey: stateKey + '.' + path.join('.'),
              });
            };
          }

          if (prop === 'useVirtualView') {
            return (
              options: VirtualViewOptions
            ): VirtualStateObjectResult<any[]> => {
              const {
                itemHeight = 50,
                overscan = 6,
                stickToBottom = false,
                scrollStickTolerance = 75,
              } = options;

              const containerRef = useRef<HTMLDivElement | null>(null);
              const [range, setRange] = useState({
                startIndex: 0,
                endIndex: 10,
              });
              const [rerender, forceUpdate] = useState({});
              const initialScrollRef = useRef(true);

              // Scroll state management
              const scrollStateRef = useRef({
                isUserScrolling: false,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: true,
              });

              // Measurement cache
              const measurementCache = useRef(
                new Map<string, { height: number; offset: number }>()
              );

              // Separate effect for handling rerender updates
              useLayoutEffect(() => {
                if (
                  !stickToBottom ||
                  !containerRef.current ||
                  scrollStateRef.current.isUserScrolling
                )
                  return;

                const container = containerRef.current;
                container.scrollTo({
                  top: container.scrollHeight,
                  behavior: initialScrollRef.current ? 'instant' : 'smooth',
                });
              }, [rerender, stickToBottom]);

              const arrayKeys =
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys || [];

              // Calculate total height and offsets
              const { totalHeight, itemOffsets } = useMemo(() => {
                let runningOffset = 0;
                const offsets = new Map<
                  string,
                  { height: number; offset: number }
                >();
                const allItemKeys =
                  getGlobalStore.getState().getShadowMetadata(stateKey, path)
                    ?.arrayKeys || [];

                allItemKeys.forEach((itemKey) => {
                  const itemPath = itemKey.split('.').slice(1);
                  const measuredHeight =
                    getGlobalStore
                      .getState()
                      .getShadowMetadata(stateKey, itemPath)?.virtualizer
                      ?.itemHeight || itemHeight;

                  offsets.set(itemKey, {
                    height: measuredHeight,
                    offset: runningOffset,
                  });

                  runningOffset += measuredHeight;
                });

                measurementCache.current = offsets;
                return { totalHeight: runningOffset, itemOffsets: offsets };
              }, [arrayKeys.length, itemHeight]);

              // Improved initial positioning effect
              useLayoutEffect(() => {
                if (
                  stickToBottom &&
                  arrayKeys.length > 0 &&
                  containerRef.current &&
                  !scrollStateRef.current.isUserScrolling &&
                  initialScrollRef.current
                ) {
                  const container = containerRef.current;

                  // Wait for container to have dimensions
                  const waitForContainer = () => {
                    if (container.clientHeight > 0) {
                      const visibleCount = Math.ceil(
                        container.clientHeight / itemHeight
                      );
                      const endIndex = arrayKeys.length - 1;
                      const startIndex = Math.max(
                        0,
                        endIndex - visibleCount - overscan
                      );

                      setRange({ startIndex, endIndex });

                      // Ensure scroll after range is set
                      requestAnimationFrame(() => {
                        scrollToBottom('instant');
                        initialScrollRef.current = false; // Mark initial scroll as done
                      });
                    } else {
                      // Container not ready, try again
                      requestAnimationFrame(waitForContainer);
                    }
                  };

                  waitForContainer();
                }
              }, [arrayKeys.length, stickToBottom, itemHeight, overscan]);

              // Combined scroll handler
              const handleScroll = useCallback(() => {
                const container = containerRef.current;
                if (!container) return;

                const currentScrollTop = container.scrollTop;
                const { scrollHeight, clientHeight } = container;
                const scrollState = scrollStateRef.current;

                // Check if user is near bottom
                const distanceFromBottom =
                  scrollHeight - (currentScrollTop + clientHeight);
                const wasNearBottom = scrollState.isNearBottom;
                scrollState.isNearBottom =
                  distanceFromBottom <= scrollStickTolerance;

                // Detect scroll direction
                if (currentScrollTop < scrollState.lastScrollTop) {
                  // User scrolled up
                  scrollState.scrollUpCount++;

                  if (scrollState.scrollUpCount > 3 && wasNearBottom) {
                    // User has deliberately scrolled away from bottom
                    scrollState.isUserScrolling = true;
                    console.log('User scrolled away from bottom');
                  }
                } else if (scrollState.isNearBottom) {
                  // Reset if we're back near the bottom
                  scrollState.isUserScrolling = false;
                  scrollState.scrollUpCount = 0;
                }

                scrollState.lastScrollTop = currentScrollTop;

                // Update visible range
                let newStartIndex = 0;
                for (let i = 0; i < arrayKeys.length; i++) {
                  const itemKey = arrayKeys[i];
                  const item = measurementCache.current.get(itemKey!);
                  if (item && item.offset + item.height > currentScrollTop) {
                    newStartIndex = i;
                    break;
                  }
                }

                // Only update if range actually changed
                if (newStartIndex !== range.startIndex) {
                  const visibleCount = Math.ceil(clientHeight / itemHeight);
                  setRange({
                    startIndex: Math.max(0, newStartIndex - overscan),
                    endIndex: Math.min(
                      arrayKeys.length - 1,
                      newStartIndex + visibleCount + overscan
                    ),
                  });
                }
              }, [
                arrayKeys.length,
                range.startIndex,
                itemHeight,
                overscan,
                scrollStickTolerance,
              ]);

              // Set up scroll listener
              useEffect(() => {
                const container = containerRef.current;
                if (!container || !stickToBottom) return;

                container.addEventListener('scroll', handleScroll, {
                  passive: true,
                });

                return () => {
                  container.removeEventListener('scroll', handleScroll);
                };
              }, [handleScroll, stickToBottom]);
              const scrollToBottom = useCallback(
                (behavior: ScrollBehavior = 'smooth') => {
                  const container = containerRef.current;
                  if (!container) return;

                  // Reset scroll state
                  scrollStateRef.current.isUserScrolling = false;
                  scrollStateRef.current.isNearBottom = true;
                  scrollStateRef.current.scrollUpCount = 0;

                  const performScroll = () => {
                    // Multiple attempts to ensure we hit the bottom
                    const attemptScroll = (attempts = 0) => {
                      if (attempts > 5) return; // Prevent infinite loops

                      const currentHeight = container.scrollHeight;
                      const currentScroll = container.scrollTop;
                      const clientHeight = container.clientHeight;

                      // Check if we're already at the bottom
                      if (currentScroll + clientHeight >= currentHeight - 1) {
                        return;
                      }

                      container.scrollTo({
                        top: currentHeight,
                        behavior: behavior,
                      });

                      // In slow environments, check again after a short delay
                      setTimeout(() => {
                        const newHeight = container.scrollHeight;
                        const newScroll = container.scrollTop;

                        // If height changed or we're not at bottom, try again
                        if (
                          newHeight !== currentHeight ||
                          newScroll + clientHeight < newHeight - 1
                        ) {
                          attemptScroll(attempts + 1);
                        }
                      }, 50);
                    };

                    attemptScroll();
                  };

                  // Use requestIdleCallback for better performance in slow environments
                  if ('requestIdleCallback' in window) {
                    requestIdleCallback(performScroll, { timeout: 100 });
                  } else {
                    // Fallback to rAF chain
                    requestAnimationFrame(() => {
                      requestAnimationFrame(performScroll);
                    });
                  }
                },
                []
              );
              // Auto-scroll to bottom when new content arrives
              // Consolidated auto-scroll effect with debouncing
              useEffect(() => {
                if (!stickToBottom || !containerRef.current) return;

                const container = containerRef.current;
                const scrollState = scrollStateRef.current;

                // Debounced scroll function
                let scrollTimeout: NodeJS.Timeout;
                const debouncedScrollToBottom = () => {
                  clearTimeout(scrollTimeout);
                  scrollTimeout = setTimeout(() => {
                    if (
                      !scrollState.isUserScrolling &&
                      scrollState.isNearBottom
                    ) {
                      scrollToBottom(
                        initialScrollRef.current ? 'instant' : 'smooth'
                      );
                    }
                  }, 100);
                };

                // Single MutationObserver for all DOM changes
                const observer = new MutationObserver(() => {
                  if (!scrollState.isUserScrolling) {
                    debouncedScrollToBottom();
                  }
                });

                observer.observe(container, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  attributeFilter: ['style', 'class'], // More specific than just 'height'
                });

                // Handle image loads with event delegation
                const handleImageLoad = (e: Event) => {
                  if (
                    e.target instanceof HTMLImageElement &&
                    !scrollState.isUserScrolling
                  ) {
                    debouncedScrollToBottom();
                  }
                };

                container.addEventListener('load', handleImageLoad, true);

                // Initial scroll with proper timing
                if (initialScrollRef.current) {
                  // For initial load, wait for next tick to ensure DOM is ready
                  setTimeout(() => {
                    scrollToBottom('instant');
                  }, 0);
                } else {
                  debouncedScrollToBottom();
                }

                return () => {
                  clearTimeout(scrollTimeout);
                  observer.disconnect();
                  container.removeEventListener('load', handleImageLoad, true);
                };
              }, [stickToBottom, arrayKeys.length, scrollToBottom]);
              // Create virtual state
              const virtualState = useMemo(() => {
                const store = getGlobalStore.getState();
                const sourceArray = store.getShadowValue(
                  [stateKey, ...path].join('.')
                ) as any[];
                const currentKeys =
                  store.getShadowMetadata(stateKey, path)?.arrayKeys || [];

                const slicedArray = sourceArray.slice(
                  range.startIndex,
                  range.endIndex + 1
                );
                const slicedIds = currentKeys.slice(
                  range.startIndex,
                  range.endIndex + 1
                );

                return rebuildStateShape({
                  currentState: slicedArray as any,
                  path,
                  componentId: componentId!,
                  meta: { ...meta, validIds: slicedIds },
                });
              }, [range.startIndex, range.endIndex, arrayKeys.length]);

              return {
                virtualState,
                virtualizerProps: {
                  outer: {
                    ref: containerRef,
                    style: {
                      overflowY: 'auto',
                      height: '100%',
                      position: 'relative',
                    },
                  },
                  inner: {
                    style: {
                      height: `${totalHeight}px`,
                      position: 'relative',
                    },
                  },
                  list: {
                    style: {
                      transform: `translateY(${
                        measurementCache.current.get(
                          arrayKeys[range.startIndex]!
                        )?.offset || 0
                      }px)`,
                    },
                  },
                },
                scrollToBottom,
                scrollToIndex: (
                  index: number,
                  behavior: ScrollBehavior = 'smooth'
                ) => {
                  if (containerRef.current && arrayKeys[index]) {
                    const offset =
                      measurementCache.current.get(arrayKeys[index]!)?.offset ||
                      0;
                    containerRef.current.scrollTo({ top: offset, behavior });
                  }
                },
              };
            };
          }
          if (prop === 'stateMap') {
            return (
              callbackfn: (
                setter: any,
                index: number,

                arraySetter: any
              ) => void
            ) => {
              const [arrayKeys, setArrayKeys] = useState<any>(
                meta?.validIds ??
                  getGlobalStore.getState().getShadowMetadata(stateKey, path)
                    ?.arrayKeys
              );
              // getGlobalStore.getState().subscribeToPath(stateKeyPathKey, () => {
              //   console.log(
              //     "stateKeyPathKeyccccccccccccccccc",
              //     stateKeyPathKey
              //   );
              //   setArrayKeys(
              //     getGlobalStore.getState().getShadowMetadata(stateKey, path)
              //   );
              // });

              const shadowValue = getGlobalStore
                .getState()
                .getShadowValue(stateKeyPathKey, meta?.validIds) as any[];
              if (!arrayKeys) {
                throw new Error('No array keys found for mapping');
              }
              const arraySetter = rebuildStateShape({
                currentState: shadowValue as any,
                path,
                componentId: componentId!,
                meta,
              });

              return shadowValue.map((item, index) => {
                const itemPath = arrayKeys[index]?.split('.').slice(1);
                const itemSetter = rebuildStateShape({
                  currentState: item,
                  path: itemPath as any,
                  componentId: componentId!,
                  meta,
                });

                return callbackfn(
                  itemSetter,
                  index,

                  arraySetter
                );
              });
            };
          }

          if (prop === '$stateMap') {
            return (callbackfn: any) =>
              createElement(SignalMapRenderer, {
                proxy: {
                  _stateKey: stateKey,
                  _path: path,
                  _mapFn: callbackfn,
                  _meta: meta,
                },
                rebuildStateShape,
              });
          } // In createProxyHandler -> handler -> get -> if (Array.isArray(currentState))

          if (prop === 'stateFind') {
            return (
              callbackfn: (value: any, index: number) => boolean
            ): StateObject<any> | undefined => {
              // 1. Use the correct set of keys: filtered/sorted from meta, or all keys from the store.
              const arrayKeys =
                meta?.validIds ??
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys;

              if (!arrayKeys) {
                return undefined;
              }

              // 2. Iterate through the keys, get the value for each, and run the callback.
              for (let i = 0; i < arrayKeys.length; i++) {
                const itemKey = arrayKeys[i];
                if (!itemKey) continue; // Safety check

                const itemValue = getGlobalStore
                  .getState()
                  .getShadowValue(itemKey);

                // 3. If the callback returns true, we've found our item.
                if (callbackfn(itemValue, i)) {
                  // Get the item's path relative to the stateKey (e.g., ['messages', '42'] -> ['42'])
                  const itemPath = itemKey.split('.').slice(1);

                  // 4. Rebuild a new, fully functional StateObject for just that item and return it.
                  return rebuildStateShape({
                    currentState: itemValue,
                    path: itemPath,
                    componentId: componentId,
                    meta, // Pass along meta for potential further chaining
                  });
                }
              }

              // 5. If the loop finishes without finding anything, return undefined.
              return undefined;
            };
          }
          if (prop === 'stateFilter') {
            return (callbackfn: (value: any, index: number) => boolean) => {
              const arrayKeys =
                meta?.validIds ??
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys;

              if (!arrayKeys) {
                throw new Error('No array keys found for filtering.');
              }

              const newValidIds: string[] = [];
              const filteredArray = currentState.filter(
                (val: any, index: number) => {
                  const didPass = callbackfn(val, index);
                  if (didPass) {
                    newValidIds.push(arrayKeys[index]!);
                    return true;
                  }
                  return false;
                }
              );

              return rebuildStateShape({
                currentState: filteredArray as any,
                path,
                componentId: componentId!,
                meta: {
                  validIds: newValidIds,
                  transforms: [
                    ...(meta?.transforms || []),
                    {
                      type: 'filter',
                      fn: callbackfn,
                    },
                  ],
                },
              });
            };
          }
          if (prop === 'stateSort') {
            return (compareFn: (a: any, b: any) => number) => {
              const arrayKeys =
                meta?.validIds ??
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys;
              if (!arrayKeys) {
                throw new Error('No array keys found for sorting');
              }
              const itemsWithIds = currentState.map((item, index) => ({
                item,
                key: arrayKeys[index],
              }));

              itemsWithIds
                .sort((a, b) => compareFn(a.item, b.item))
                .filter(Boolean);

              return rebuildStateShape({
                currentState: itemsWithIds.map((i) => i.item) as any,
                path,
                componentId: componentId!,
                meta: {
                  validIds: itemsWithIds.map((i) => i.key) as string[],
                  transforms: [
                    ...(meta?.transforms || []),
                    { type: 'sort', fn: compareFn },
                  ],
                },
              });
            };
          }
          // In createProxyHandler, inside the get trap where you have other array methods:
          if (prop === 'stream') {
            return function <U = InferArrayElement<T>, R = U>(
              options: StreamOptions<U, R> = {}
            ): StreamHandle<U> {
              const {
                bufferSize = 100,
                flushInterval = 100,
                bufferStrategy = 'accumulate',
                store,
                onFlush,
              } = options;

              let buffer: U[] = [];
              let isPaused = false;
              let flushTimer: NodeJS.Timeout | null = null;

              const addToBuffer = (item: U) => {
                if (isPaused) return;

                if (
                  bufferStrategy === 'sliding' &&
                  buffer.length >= bufferSize
                ) {
                  buffer.shift();
                } else if (
                  bufferStrategy === 'dropping' &&
                  buffer.length >= bufferSize
                ) {
                  return;
                }

                buffer.push(item);

                if (buffer.length >= bufferSize) {
                  flushBuffer();
                }
              };

              const flushBuffer = () => {
                if (buffer.length === 0) return;

                const toFlush = [...buffer];
                buffer = [];

                if (store) {
                  const result = store(toFlush);
                  if (result !== undefined) {
                    const items = Array.isArray(result) ? result : [result];
                    items.forEach((item) => {
                      effectiveSetState(item as any, path, {
                        updateType: 'insert',
                      });
                    });
                  }
                } else {
                  toFlush.forEach((item) => {
                    effectiveSetState(item as any, path, {
                      updateType: 'insert',
                    });
                  });
                }

                onFlush?.(toFlush);
              };

              if (flushInterval > 0) {
                flushTimer = setInterval(flushBuffer, flushInterval);
              }

              const streamId = uuidv4();
              const currentMeta =
                getGlobalStore.getState().getShadowMetadata(stateKey, path) ||
                {};
              const streams = currentMeta.streams || new Map();
              streams.set(streamId, { buffer, flushTimer });

              getGlobalStore.getState().setShadowMetadata(stateKey, path, {
                ...currentMeta,
                streams,
              });

              return {
                write: (data: U) => addToBuffer(data),
                writeMany: (data: U[]) => data.forEach(addToBuffer),
                flush: () => flushBuffer(),
                pause: () => {
                  isPaused = true;
                },
                resume: () => {
                  isPaused = false;
                  if (buffer.length > 0) flushBuffer();
                },
                close: () => {
                  flushBuffer();
                  if (flushTimer) clearInterval(flushTimer);

                  const meta = getGlobalStore
                    .getState()
                    .getShadowMetadata(stateKey, path);
                  if (meta?.streams) {
                    meta.streams.delete(streamId);
                  }
                },
              };
            };
          }

          if (prop === 'stateList') {
            return (
              callbackfn: (
                setter: any,
                index: number,
                arraySetter: any
              ) => ReactNode
            ) => {
              const StateListWrapper = () => {
                const componentIdsRef = useRef<Map<string, string>>(new Map());

                const cacheKey =
                  meta?.transforms && meta.transforms.length > 0
                    ? `${componentId}-${hashTransforms(meta.transforms)}`
                    : `${componentId}-base`;

                const [updateTrigger, forceUpdate] = useState({});

                const { validIds, arrayValues } = useMemo(() => {
                  const cached = getGlobalStore
                    .getState()
                    .getShadowMetadata(stateKey, path)
                    ?.transformCaches?.get(cacheKey);

                  let freshValidIds: string[];

                  if (cached && cached.validIds) {
                    freshValidIds = cached.validIds;
                  } else {
                    freshValidIds = applyTransforms(
                      stateKey,
                      path,
                      meta?.transforms
                    );

                    getGlobalStore
                      .getState()
                      .setTransformCache(stateKey, path, cacheKey, {
                        validIds: freshValidIds,
                        computedAt: Date.now(),
                        transforms: meta?.transforms || [],
                      });
                  }

                  const freshValues = getGlobalStore
                    .getState()
                    .getShadowValue(stateKeyPathKey, freshValidIds);

                  return {
                    validIds: freshValidIds,
                    arrayValues: freshValues || [],
                  };
                }, [cacheKey, updateTrigger]);

                useEffect(() => {
                  const unsubscribe = getGlobalStore
                    .getState()
                    .subscribeToPath(stateKeyPathKey, (e) => {
                      // A data change has occurred for the source array.

                      if (e.type === 'GET_SELECTED') {
                        return;
                      }
                      const shadowMeta = getGlobalStore
                        .getState()
                        .getShadowMetadata(stateKey, path);

                      const caches = shadowMeta?.transformCaches;
                      if (caches) {
                        // Iterate over ALL keys in the cache map.
                        for (const key of caches.keys()) {
                          // If the key belongs to this component instance, delete it.
                          // This purges caches for 'sort by name', 'sort by score', etc.
                          if (key.startsWith(componentId)) {
                            caches.delete(key);
                          }
                        }
                      }

                      if (
                        e.type === 'INSERT' ||
                        e.type === 'REMOVE' ||
                        e.type === 'CLEAR_SELECTION'
                      ) {
                        forceUpdate({});
                      }
                    });

                  return () => {
                    unsubscribe();
                  };

                  // This effect's logic now depends on the componentId to perform the purge.
                }, [componentId, stateKeyPathKey]);

                if (!Array.isArray(arrayValues)) {
                  return null;
                }

                const arraySetter = rebuildStateShape({
                  currentState: arrayValues as any,
                  path,
                  componentId: componentId!,
                  meta: {
                    ...meta,
                    validIds: validIds,
                  },
                });

                return (
                  <>
                    {arrayValues.map((item, localIndex) => {
                      const itemKey = validIds[localIndex];

                      if (!itemKey) {
                        return null;
                      }

                      let itemComponentId =
                        componentIdsRef.current.get(itemKey);
                      if (!itemComponentId) {
                        itemComponentId = uuidv4();
                        componentIdsRef.current.set(itemKey, itemComponentId);
                      }

                      const itemPath = itemKey.split('.').slice(1);

                      return createElement(MemoizedCogsItemWrapper, {
                        key: itemKey,
                        stateKey,
                        itemComponentId,
                        itemPath,
                        localIndex,
                        arraySetter,
                        rebuildStateShape,
                        renderFn: callbackfn,
                      });
                    })}
                  </>
                );
              };

              return <StateListWrapper />;
            };
          }
          if (prop === 'stateFlattenOn') {
            return (fieldName: string) => {
              const arrayToMap = currentState as any[];
              shapeCache.clear();
              stateVersion++;
              const flattenedResults = arrayToMap.flatMap(
                (val: any) => val[fieldName] ?? []
              );
              return rebuildStateShape({
                currentState: flattenedResults as any,
                path: [...path, '[*]', fieldName],
                componentId: componentId!,
                meta,
              });
            };
          }
          if (prop === 'index') {
            return (index: number) => {
              const arrayKeys = getGlobalStore
                .getState()
                .getShadowMetadata(stateKey, path)
                ?.arrayKeys?.filter(
                  (key) =>
                    !meta?.validIds ||
                    (meta?.validIds && meta?.validIds?.includes(key))
                );
              const itemId = arrayKeys?.[index];
              if (!itemId) return undefined;
              const value = getGlobalStore
                .getState()
                .getShadowValue(itemId, meta?.validIds);
              const state = rebuildStateShape({
                currentState: value,
                path: itemId.split('.').slice(1) as string[],
                componentId: componentId!,
                meta,
              });
              return state;
            };
          }
          if (prop === 'last') {
            return () => {
              const currentArray = getGlobalStore
                .getState()
                .getShadowValue(stateKey, path) as any[];
              if (currentArray.length === 0) return undefined;
              const lastIndex = currentArray.length - 1;
              const lastValue = currentArray[lastIndex];
              const newPath = [...path, lastIndex.toString()];
              return rebuildStateShape({
                currentState: lastValue,
                path: newPath,
                componentId: componentId!,
                meta,
              });
            };
          }
          if (prop === 'insert') {
            return (
              payload: InsertParams<InferArrayElement<T>>,
              index?: number
            ) => {
              effectiveSetState(payload as any, path, { updateType: 'insert' });
              return rebuildStateShape({
                currentState: getGlobalStore
                  .getState()
                  .getShadowValue(stateKey, path),
                path,
                componentId: componentId!,
                meta,
              });
            };
          }
          if (prop === 'uniqueInsert') {
            return (
              payload: UpdateArg<T>,
              fields?: (keyof InferArrayElement<T>)[],
              onMatch?: (existingItem: any) => any
            ) => {
              const currentArray = getGlobalStore
                .getState()
                .getShadowValue(stateKey, path) as any[];
              const newValue = isFunction<T>(payload)
                ? payload(currentArray as any)
                : (payload as any);

              let matchedItem: any = null;
              const isUnique = !currentArray.some((item) => {
                const isMatch = fields
                  ? fields.every((field) =>
                      isDeepEqual(item[field], newValue[field])
                    )
                  : isDeepEqual(item, newValue);
                if (isMatch) matchedItem = item;
                return isMatch;
              });

              if (isUnique) {
                invalidateCachePath(path);
                effectiveSetState(newValue, path, { updateType: 'insert' });
              } else if (onMatch && matchedItem) {
                const updatedItem = onMatch(matchedItem);
                const updatedArray = currentArray.map((item) =>
                  isDeepEqual(item, matchedItem) ? updatedItem : item
                );
                invalidateCachePath(path);
                effectiveSetState(updatedArray as any, path, {
                  updateType: 'update',
                });
              }
            };
          }

          if (prop === 'cut') {
            return (index?: number, options?: { waitForSync?: boolean }) => {
              const validKeys =
                meta?.validIds ??
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys;

              if (!validKeys || validKeys.length === 0) return;

              const indexToCut =
                index == -1
                  ? validKeys.length - 1
                  : index !== undefined
                    ? index
                    : validKeys.length - 1;

              const fullIdToCut = validKeys[indexToCut];
              if (!fullIdToCut) return; // Index out of bounds

              const pathForCut = fullIdToCut.split('.').slice(1);
              effectiveSetState(currentState, pathForCut, {
                updateType: 'cut',
              });
            };
          }
          if (prop === 'cutSelected') {
            return () => {
              const validKeys = applyTransforms(
                stateKey,
                path,
                meta?.transforms
              );

              if (!validKeys || validKeys.length === 0) return;

              const indexKeyToCut = getGlobalStore
                .getState()
                .selectedIndicesMap.get(stateKeyPathKey);

              let indexToCut = validKeys.findIndex(
                (key) => key === indexKeyToCut
              );

              const pathForCut = validKeys[
                indexToCut == -1 ? validKeys.length - 1 : indexToCut
              ]
                ?.split('.')
                .slice(1);
              getGlobalStore
                .getState()
                .clearSelectedIndex({ arrayKey: stateKeyPathKey });
              const parentPath = pathForCut?.slice(0, -1)!;
              notifySelectionComponents(stateKey, parentPath);
              effectiveSetState(currentState, pathForCut!, {
                updateType: 'cut',
              });
            };
          }
          if (prop === 'cutByValue') {
            return (value: string | number | boolean) => {
              // Step 1: Get the list of all unique keys for the current view.
              const arrayMeta = getGlobalStore
                .getState()
                .getShadowMetadata(stateKey, path);
              const relevantKeys = meta?.validIds ?? arrayMeta?.arrayKeys;

              if (!relevantKeys) return;

              let keyToCut: string | null = null;

              // Step 2: Iterate through the KEYS, get the value for each, and find the match.
              for (const key of relevantKeys) {
                const itemValue = getGlobalStore.getState().getShadowValue(key);
                if (itemValue === value) {
                  keyToCut = key;
                  break; // We found the key, no need to search further.
                }
              }

              // Step 3: If we found a matching key, use it to perform the cut.
              if (keyToCut) {
                const itemPath = keyToCut.split('.').slice(1);
                effectiveSetState(null as any, itemPath, { updateType: 'cut' });
              }
            };
          }

          if (prop === 'toggleByValue') {
            return (value: string | number | boolean) => {
              // Step 1: Get the list of all unique keys for the current view.
              const arrayMeta = getGlobalStore
                .getState()
                .getShadowMetadata(stateKey, path);
              const relevantKeys = meta?.validIds ?? arrayMeta?.arrayKeys;

              if (!relevantKeys) return;

              let keyToCut: string | null = null;

              // Step 2: Iterate through the KEYS to find the one matching the value. This is the robust way.
              for (const key of relevantKeys) {
                const itemValue = getGlobalStore.getState().getShadowValue(key);
                console.log('itemValue sdasdasdasd', itemValue);
                if (itemValue === value) {
                  keyToCut = key;
                  break; // Found it!
                }
              }
              console.log('itemValue keyToCut', keyToCut);
              // Step 3: Act based on whether the key was found.
              if (keyToCut) {
                // Item exists, so we CUT it using its *actual* key.
                const itemPath = keyToCut.split('.').slice(1);
                console.log('itemValue keyToCut', keyToCut);
                effectiveSetState(value as any, itemPath, {
                  updateType: 'cut',
                });
              } else {
                // Item does not exist, so we INSERT it.
                effectiveSetState(value as any, path, { updateType: 'insert' });
              }
            };
          }
          if (prop === 'findWith') {
            return (
              searchKey: keyof InferArrayElement<T>,
              searchValue: any
            ) => {
              const arrayKeys = getGlobalStore
                .getState()
                .getShadowMetadata(stateKey, path)?.arrayKeys;

              if (!arrayKeys) {
                throw new Error('No array keys found for sorting');
              }

              let value = null;
              let foundPath: string[] = [];

              for (const fullPath of arrayKeys) {
                let shadowValue = getGlobalStore
                  .getState()
                  .getShadowValue(fullPath, meta?.validIds);
                if (shadowValue && shadowValue[searchKey] === searchValue) {
                  value = shadowValue;
                  foundPath = fullPath.split('.').slice(1);
                  break;
                }
              }

              return rebuildStateShape({
                currentState: value as any,
                path: foundPath,
                componentId: componentId!,
                meta,
              });
            };
          }
        }

        if (prop === 'cut') {
          let shadowValue = getGlobalStore
            .getState()
            .getShadowValue(path.join('.'));

          return () => {
            effectiveSetState(shadowValue, path, { updateType: 'cut' });
          };
        }

        if (prop === 'get') {
          return () => {
            registerComponentDependency(stateKey, componentId, path);
            return getGlobalStore
              .getState()
              .getShadowValue(stateKeyPathKey, meta?.validIds);
          };
        }
        if (prop === 'getState') {
          return () => {
            return getGlobalStore
              .getState()
              .getShadowValue(stateKeyPathKey, meta?.validIds);
          };
        }

        if (prop === '$derive') {
          return (fn: any) =>
            $cogsSignal({
              _stateKey: stateKey,
              _path: path,
              _effect: fn.toString(),
              _meta: meta,
            });
        }
        // in CogsState.ts -> createProxyHandler -> handler -> get

        if (prop === '$get') {
          return () =>
            $cogsSignal({ _stateKey: stateKey, _path: path, _meta: meta });
        }
        if (prop === 'lastSynced') {
          const syncKey = `${stateKey}:${path.join('.')}`;
          return getGlobalStore.getState().getSyncInfo(syncKey);
        }
        if (prop == 'getLocalStorage') {
          return (key: string) =>
            loadFromLocalStorage(sessionId + '-' + stateKey + '-' + key);
        }

        if (prop === 'isSelected') {
          const parentPath = [stateKey, ...path].slice(0, -1);
          notifySelectionComponents(stateKey, path, undefined);
          if (
            Array.isArray(
              getGlobalStore
                .getState()
                .getShadowValue(parentPath.join('.'), meta?.validIds)
            )
          ) {
            const itemId = path[path.length - 1];
            const fullParentKey = parentPath.join('.');

            const selectedItemKey = getGlobalStore
              .getState()
              .selectedIndicesMap.get(fullParentKey);

            const fullItemKey = stateKey + '.' + path.join('.');

            return selectedItemKey === fullItemKey;
          }
          return undefined;
        }

        // Then use it in both:
        if (prop === 'setSelected') {
          return (value: boolean) => {
            const parentPath = path.slice(0, -1);
            const fullParentKey = stateKey + '.' + parentPath.join('.');
            const fullItemKey = stateKey + '.' + path.join('.');

            notifySelectionComponents(stateKey, parentPath, undefined);

            const selectedIndex = getGlobalStore
              .getState()
              .selectedIndicesMap.get(fullParentKey);

            if (value) {
              getGlobalStore
                .getState()
                .setSelectedIndex(fullParentKey, fullItemKey);
            }
          };
        }

        if (prop === 'toggleSelected') {
          return () => {
            const parentPath = path.slice(0, -1);
            const fullParentKey = stateKey + '.' + parentPath.join('.');
            const fullItemKey = stateKey + '.' + path.join('.');

            const currentSelected = getGlobalStore
              .getState()
              .selectedIndicesMap.get(fullParentKey);

            if (currentSelected === fullItemKey) {
              getGlobalStore
                .getState()
                .clearSelectedIndex({ arrayKey: fullParentKey });
            } else {
              getGlobalStore
                .getState()
                .setSelectedIndex(fullParentKey, fullItemKey);
            }
          };
        }
        if (prop === '_componentId') {
          return componentId;
        }
        if (path.length == 0) {
          if (prop === 'addValidation') {
            return (errors: ValidationError[]) => {
              const init = getGlobalStore
                .getState()
                .getInitialOptions(stateKey)?.validation;
              if (!init?.key) throw new Error('Validation key not found');
              removeValidationError(init.key);
              errors.forEach((error) => {
                const fullErrorPath = [init.key, ...error.path].join('.');
                addValidationError(fullErrorPath, error.message);
              });
              notifyComponents(stateKey);
            };
          }
          if (prop === 'applyJsonPatch') {
            return (patches: Operation[]) => {
              const store = getGlobalStore.getState();
              const rootMeta = store.getShadowMetadata(stateKey, []);
              if (!rootMeta?.components) return;

              const convertPath = (jsonPath: string): string[] => {
                if (!jsonPath || jsonPath === '/') return [];
                return jsonPath
                  .split('/')
                  .slice(1)
                  .map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
              };

              const notifiedComponents = new Set<string>();

              for (const patch of patches) {
                const relativePath = convertPath(patch.path);

                switch (patch.op) {
                  case 'add':
                  case 'replace': {
                    const { value } = patch as {
                      op: 'add' | 'replace';
                      path: string;
                      value: any;
                    };
                    store.updateShadowAtPath(stateKey, relativePath, value);
                    store.markAsDirty(stateKey, relativePath, { bubble: true });

                    // Bubble up - notify components at this path and all parent paths
                    let currentPath = [...relativePath];
                    while (true) {
                      const pathMeta = store.getShadowMetadata(
                        stateKey,
                        currentPath
                      );
                      console.log('pathMeta', pathMeta);
                      if (pathMeta?.pathComponents) {
                        pathMeta.pathComponents.forEach((componentId) => {
                          if (!notifiedComponents.has(componentId)) {
                            const component =
                              rootMeta.components?.get(componentId);
                            if (component) {
                              component.forceUpdate();
                              notifiedComponents.add(componentId);
                            }
                          }
                        });
                      }

                      if (currentPath.length === 0) break;
                      currentPath.pop(); // Go up one level
                    }
                    break;
                  }
                  case 'remove': {
                    const parentPath = relativePath.slice(0, -1);
                    store.removeShadowArrayElement(stateKey, relativePath);
                    store.markAsDirty(stateKey, parentPath, { bubble: true });

                    // Bubble up from parent path
                    let currentPath = [...parentPath];
                    while (true) {
                      const pathMeta = store.getShadowMetadata(
                        stateKey,
                        currentPath
                      );
                      if (pathMeta?.pathComponents) {
                        pathMeta.pathComponents.forEach((componentId) => {
                          if (!notifiedComponents.has(componentId)) {
                            const component =
                              rootMeta.components?.get(componentId);
                            if (component) {
                              component.forceUpdate();
                              notifiedComponents.add(componentId);
                            }
                          }
                        });
                      }

                      if (currentPath.length === 0) break;
                      currentPath.pop();
                    }
                    break;
                  }
                }
              }
            };
          }
          if (prop === 'validateZodSchema') {
            return () => {
              const init = getGlobalStore
                .getState()
                .getInitialOptions(stateKey)?.validation;

              // UPDATED: Select v4 schema, with a fallback to v3
              const zodSchema = init?.zodSchemaV4 || init?.zodSchemaV3;

              if (!zodSchema || !init?.key) {
                throw new Error(
                  'Zod schema (v3 or v4) or validation key not found'
                );
              }

              removeValidationError(init.key);
              const thisObject = getGlobalStore
                .getState()
                .getShadowValue(stateKey);

              // Use the selected schema for parsing
              const result = zodSchema.safeParse(thisObject);

              if (!result.success) {
                // This logic already handles both v3 and v4 error types correctly
                if ('issues' in result.error) {
                  // Zod v4 error
                  result.error.issues.forEach((error) => {
                    const fullErrorPath = [init.key, ...error.path].join('.');
                    addValidationError(fullErrorPath, error.message);
                  });
                } else {
                  // Zod v3 error
                  (result.error as any).errors.forEach((error: any) => {
                    const fullErrorPath = [init.key, ...error.path].join('.');
                    addValidationError(fullErrorPath, error.message);
                  });
                }

                notifyComponents(stateKey);
                return false;
              }
              return true;
            };
          }

          if (prop === 'getComponents')
            return () =>
              getGlobalStore.getState().getShadowMetadata(stateKey, [])
                ?.components;
          if (prop === 'getAllFormRefs')
            return () =>
              formRefStore.getState().getFormRefsByStateKey(stateKey);
        }
        if (prop === 'getFormRef') {
          return () =>
            formRefStore.getState().getFormRef(stateKey + '.' + path.join('.'));
        }
        if (prop === 'validationWrapper') {
          return ({
            children,
            hideMessage,
          }: {
            children: React.ReactNode;
            hideMessage?: boolean;
          }) => (
            <ValidationWrapper
              formOpts={
                hideMessage ? { validation: { message: '' } } : undefined
              }
              path={path}
              stateKey={stateKey}
            >
              {children}
            </ValidationWrapper>
          );
        }
        if (prop === '_stateKey') return stateKey;
        if (prop === '_path') return path;
        if (prop === 'update') {
          return (payload: UpdateArg<T>) => {
            // Step 1: This is the same. It performs the data update.
            effectiveSetState(payload as any, path, { updateType: 'update' });

            return {
              /**
               * Marks this specific item, which was just updated, as 'synced' (not dirty).
               */
              synced: () => {
                // This function "remembers" the path of the item that was just updated.
                const shadowMeta = getGlobalStore
                  .getState()
                  .getShadowMetadata(stateKey, path);

                // It updates ONLY the metadata for that specific item.
                getGlobalStore.getState().setShadowMetadata(stateKey, path, {
                  ...shadowMeta,
                  isDirty: false, // EXPLICITLY set to false, not just undefined
                  stateSource: 'server', // Mark as coming from server
                  lastServerSync: Date.now(), // Add timestamp
                });

                // Force a re-render for components watching this path
                const fullPath = [stateKey, ...path].join('.');
                getGlobalStore.getState().notifyPathSubscribers(fullPath, {
                  type: 'SYNC_STATUS_CHANGE',
                  isDirty: false,
                });
              },
            };
          };
        }

        if (prop === 'toggle') {
          const currentValueAtPath = getGlobalStore
            .getState()
            .getShadowValue([stateKey, ...path].join('.'));

          console.log('currentValueAtPath', currentValueAtPath);
          if (typeof currentState != 'boolean') {
            throw new Error('toggle() can only be used on boolean values');
          }
          return () => {
            effectiveSetState(!currentValueAtPath as any, path, {
              updateType: 'update',
            });
          };
        }
        if (prop === 'formElement') {
          return (child: FormControl<T>, formOpts?: FormOptsType) => {
            return (
              <FormElementWrapper
                stateKey={stateKey}
                path={path}
                rebuildStateShape={rebuildStateShape}
                setState={effectiveSetState}
                formOpts={formOpts}
                renderFn={child as any}
              />
            );
          };
        }
        const nextPath = [...path, prop];
        const nextValue = getGlobalStore
          .getState()
          .getShadowValue(stateKey, nextPath);
        return rebuildStateShape({
          currentState: nextValue,
          path: nextPath,
          componentId: componentId!,
          meta,
        });
      },
    };

    const proxyInstance = new Proxy(baseFunction, handler);
    shapeCache.set(cacheKey, {
      proxy: proxyInstance,
      stateVersion: stateVersion,
    });
    return proxyInstance;
  }

  const baseObj = {
    removeValidation: (obj?: { validationKey?: string }) => {
      if (obj?.validationKey) {
        removeValidationError(obj.validationKey);
      }
    },
    revertToInitialState: (obj?: { validationKey?: string }) => {
      const init = getGlobalStore
        .getState()
        .getInitialOptions(stateKey)?.validation;
      if (init?.key) {
        removeValidationError(init.key);
      }

      if (obj?.validationKey) {
        removeValidationError(obj.validationKey);
      }

      const shadowMeta = getGlobalStore
        .getState()
        .getShadowMetadata(stateKey, []);
      let revertState;

      if (shadowMeta?.stateSource === 'server' && shadowMeta.baseServerState) {
        // Revert to last known server state
        revertState = shadowMeta.baseServerState;
      } else {
        // Revert to initial/default state
        revertState = getGlobalStore.getState().initialStateGlobal[stateKey];
      }
      const initialState =
        getGlobalStore.getState().initialStateGlobal[stateKey];

      getGlobalStore.getState().clearSelectedIndexesForState(stateKey);
      shapeCache.clear();
      stateVersion++;
      getGlobalStore.getState().initializeShadowState(stateKey, initialState);
      const newProxy = rebuildStateShape({
        currentState: initialState,
        path: [],
        componentId: componentId!,
      });
      const initalOptionsGet = getInitialOptions(stateKey as string);
      const localKey = isFunction(initalOptionsGet?.localStorage?.key)
        ? initalOptionsGet?.localStorage?.key(initialState)
        : initalOptionsGet?.localStorage?.key;

      const storageKey = `${sessionId}-${stateKey}-${localKey}`;

      if (storageKey) {
        localStorage.removeItem(storageKey);
      }

      const stateEntry = getGlobalStore
        .getState()
        .getShadowMetadata(stateKey, []);
      if (stateEntry) {
        stateEntry?.components?.forEach((component) => {
          component.forceUpdate();
        });
      }

      return initialState;
    },
    updateInitialState: (newState: T) => {
      shapeCache.clear();
      stateVersion++;

      const newUpdaterState = createProxyHandler(
        stateKey,
        effectiveSetState,
        componentId,
        sessionId
      );
      const initialState =
        getGlobalStore.getState().initialStateGlobal[stateKey];
      const initalOptionsGet = getInitialOptions(stateKey as string);
      const localKey = isFunction(initalOptionsGet?.localStorage?.key)
        ? initalOptionsGet?.localStorage?.key(initialState)
        : initalOptionsGet?.localStorage?.key;

      const storageKey = `${sessionId}-${stateKey}-${localKey}`;

      if (localStorage.getItem(storageKey)) {
        localStorage.removeItem(storageKey);
      }
      startTransition(() => {
        updateInitialStateGlobal(stateKey, newState);
        getGlobalStore.getState().initializeShadowState(stateKey, newState);

        const stateEntry = getGlobalStore
          .getState()
          .getShadowMetadata(stateKey, []);

        if (stateEntry) {
          stateEntry?.components?.forEach((component) => {
            component.forceUpdate();
          });
        }
      });

      return {
        fetchId: (field: keyof T) => (newUpdaterState.get() as any)[field],
      };
    },
  };
  const returnShape = rebuildStateShape({
    currentState: getGlobalStore.getState().getShadowValue(stateKey, []),
    componentId,
    path: [],
  });

  return returnShape;
}

export function $cogsSignal(proxy: {
  _path: string[];
  _stateKey: string;
  _effect?: string;

  _meta?: MetaData;
}) {
  return createElement(SignalRenderer, { proxy });
}

function SignalMapRenderer({
  proxy,
  rebuildStateShape,
}: {
  proxy: {
    _stateKey: string;
    _path: string[];
    _meta?: MetaData;
    _mapFn: (
      setter: any,
      index: number,

      arraySetter: any
    ) => ReactNode;
  };
  rebuildStateShape: (stuff: {
    currentState: any;
    path: string[];
    componentId: string;
    meta?: MetaData;
  }) => any;
}): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceIdRef = useRef<string>(`map-${crypto.randomUUID()}`);
  const isSetupRef = useRef(false);
  const rootsMapRef = useRef<Map<string, any>>(new Map());

  // Setup effect - store the map function in shadow metadata
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isSetupRef.current) return;

    const timeoutId = setTimeout(() => {
      // Store map wrapper in metadata
      const currentMeta =
        getGlobalStore
          .getState()
          .getShadowMetadata(proxy._stateKey, proxy._path) || {};

      const mapWrappers = currentMeta.mapWrappers || [];
      mapWrappers.push({
        instanceId: instanceIdRef.current,
        mapFn: proxy._mapFn,
        containerRef: container,
        rebuildStateShape: rebuildStateShape,
        path: proxy._path,
        componentId: instanceIdRef.current,
        meta: proxy._meta,
      });

      getGlobalStore
        .getState()
        .setShadowMetadata(proxy._stateKey, proxy._path, {
          ...currentMeta,
          mapWrappers,
        });

      isSetupRef.current = true;

      // Initial render
      renderInitialItems();
    }, 0);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (instanceIdRef.current) {
        const currentMeta =
          getGlobalStore
            .getState()
            .getShadowMetadata(proxy._stateKey, proxy._path) || {};
        if (currentMeta.mapWrappers) {
          currentMeta.mapWrappers = currentMeta.mapWrappers.filter(
            (w) => w.instanceId !== instanceIdRef.current
          );
          getGlobalStore
            .getState()
            .setShadowMetadata(proxy._stateKey, proxy._path, currentMeta);
        }
      }
      rootsMapRef.current.forEach((root) => root.unmount());
    };
  }, []);

  const renderInitialItems = () => {
    const container = containerRef.current;
    if (!container) return;

    const value = getGlobalStore
      .getState()
      .getShadowValue(
        [proxy._stateKey, ...proxy._path].join('.'),
        proxy._meta?.validIds
      ) as any[];

    if (!Array.isArray(value)) return;

    // --- BUG FIX IS HERE ---
    // Prioritize the filtered IDs from the meta object, just like the regular `stateMap`.
    // This ensures the keys match the filtered data.
    const arrayKeys =
      proxy._meta?.validIds ??
      getGlobalStore.getState().getShadowMetadata(proxy._stateKey, proxy._path)
        ?.arrayKeys ??
      [];
    // --- END OF FIX ---

    const arraySetter = rebuildStateShape({
      currentState: value,
      path: proxy._path,
      componentId: instanceIdRef.current,
      meta: proxy._meta,
    });

    value.forEach((item, index) => {
      const itemKey = arrayKeys[index]!; // Now this will be the correct key for the filtered item
      if (!itemKey) return; // Safeguard if there's a mismatch

      const itemComponentId = uuidv4();
      const itemElement = document.createElement('div');

      itemElement.setAttribute('data-item-path', itemKey);
      container.appendChild(itemElement);

      const root = createRoot(itemElement);
      rootsMapRef.current.set(itemKey, root);

      const itemPath = itemKey.split('.').slice(1) as string[];

      // Render CogsItemWrapper instead of direct render
      root.render(
        createElement(MemoizedCogsItemWrapper, {
          stateKey: proxy._stateKey,
          itemComponentId: itemComponentId,
          itemPath: itemPath,
          localIndex: index,
          arraySetter: arraySetter,
          rebuildStateShape: rebuildStateShape,
          renderFn: proxy._mapFn,
        })
      );
    });
  };

  return <div ref={containerRef} data-map-container={instanceIdRef.current} />;
}

function SignalRenderer({
  proxy,
}: {
  proxy: {
    _path: string[];
    _stateKey: string;
    _effect?: string;
    _meta?: MetaData;
  };
}) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const instanceIdRef = useRef<string | null>(null);
  const isSetupRef = useRef(false);
  const signalId = `${proxy._stateKey}-${proxy._path.join('.')}`;
  const value = getGlobalStore
    .getState()
    .getShadowValue(
      [proxy._stateKey, ...proxy._path].join('.'),
      proxy._meta?.validIds
    );

  // Setup effect - runs only once
  useEffect(() => {
    const element = elementRef.current;
    if (!element || isSetupRef.current) return;

    const timeoutId = setTimeout(() => {
      if (!element.parentElement) {
        console.warn('Parent element not found for signal', signalId);
        return;
      }

      const parentElement = element.parentElement;
      const childNodes = Array.from(parentElement.childNodes);
      const position = childNodes.indexOf(element);

      let parentId = parentElement.getAttribute('data-parent-id');
      if (!parentId) {
        parentId = `parent-${crypto.randomUUID()}`;
        parentElement.setAttribute('data-parent-id', parentId);
      }

      instanceIdRef.current = `instance-${crypto.randomUUID()}`;

      // Store signal info in shadow metadata
      const currentMeta =
        getGlobalStore
          .getState()
          .getShadowMetadata(proxy._stateKey, proxy._path) || {};
      const signals = currentMeta.signals || [];
      signals.push({
        instanceId: instanceIdRef.current,
        parentId,
        position,
        effect: proxy._effect,
      });

      getGlobalStore
        .getState()
        .setShadowMetadata(proxy._stateKey, proxy._path, {
          ...currentMeta,
          signals,
        });

      let displayValue = value;
      if (proxy._effect) {
        try {
          displayValue = new Function(
            'state',
            `return (${proxy._effect})(state)`
          )(value);
        } catch (err) {
          console.error('Error evaluating effect function:', err);
        }
      }

      if (displayValue !== null && typeof displayValue === 'object') {
        displayValue = JSON.stringify(displayValue);
      }
      const textNode = document.createTextNode(String(displayValue ?? ''));
      element.replaceWith(textNode);
      isSetupRef.current = true;
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (instanceIdRef.current) {
        const currentMeta =
          getGlobalStore
            .getState()
            .getShadowMetadata(proxy._stateKey, proxy._path) || {};
        if (currentMeta.signals) {
          currentMeta.signals = currentMeta.signals.filter(
            (s) => s.instanceId !== instanceIdRef.current
          );
          getGlobalStore
            .getState()
            .setShadowMetadata(proxy._stateKey, proxy._path, currentMeta);
        }
      }
    };
  }, []);

  return createElement('span', {
    ref: elementRef,
    style: { display: 'contents' },
    'data-signal-id': signalId,
  });
}

const MemoizedCogsItemWrapper = memo(
  ListItemWrapper,
  (prevProps, nextProps) => {
    // Re-render if any of these change:
    return (
      prevProps.itemPath.join('.') === nextProps.itemPath.join('.') &&
      prevProps.stateKey === nextProps.stateKey &&
      prevProps.itemComponentId === nextProps.itemComponentId &&
      prevProps.localIndex === nextProps.localIndex
    );
  }
);

const useImageLoaded = (ref: RefObject<HTMLElement>): boolean => {
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (!ref.current) {
      setLoaded(true);
      return;
    }

    const images = Array.from(ref.current.querySelectorAll('img'));

    // If there are no images, we are "loaded" immediately.
    if (images.length === 0) {
      setLoaded(true);
      return;
    }

    let loadedCount = 0;
    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        setLoaded(true);
      }
    };

    images.forEach((image) => {
      if (image.complete) {
        handleImageLoad();
      } else {
        image.addEventListener('load', handleImageLoad);
        image.addEventListener('error', handleImageLoad);
      }
    });

    return () => {
      images.forEach((image) => {
        image.removeEventListener('load', handleImageLoad);
        image.removeEventListener('error', handleImageLoad);
      });
    };
  }, [ref.current]);

  return loaded;
};

function ListItemWrapper({
  stateKey,
  itemComponentId,
  itemPath,
  localIndex,
  arraySetter,
  rebuildStateShape,
  renderFn,
}: {
  stateKey: string;
  itemComponentId: string;
  itemPath: string[];
  localIndex: number;
  arraySetter: any;

  rebuildStateShape: (options: {
    currentState: any;
    path: string[];
    componentId: string;
    meta?: any;
  }) => any;
  renderFn: (
    setter: any,
    index: number,

    arraySetter: any
  ) => React.ReactNode;
}) {
  const [, forceUpdate] = useState({});
  const { ref: inViewRef, inView } = useInView();
  const elementRef = useRef<HTMLDivElement | null>(null);

  const imagesLoaded = useImageLoaded(elementRef);
  const hasReportedInitialHeight = useRef(false);
  const fullKey = [stateKey, ...itemPath].join('.');
  useRegisterComponent(stateKey, itemComponentId, forceUpdate);

  const setRefs = useCallback(
    (element: HTMLDivElement | null) => {
      elementRef.current = element;
      inViewRef(element); // This is the ref from useInView
    },
    [inViewRef]
  );

  useEffect(() => {
    getGlobalStore.getState().subscribeToPath(fullKey, (e) => {
      forceUpdate({});
    });
  }, []);
  useEffect(() => {
    if (!inView || !imagesLoaded || hasReportedInitialHeight.current) {
      return;
    }

    const element = elementRef.current;
    if (element && element.offsetHeight > 0) {
      hasReportedInitialHeight.current = true;
      const newHeight = element.offsetHeight;

      getGlobalStore.getState().setShadowMetadata(stateKey, itemPath, {
        virtualizer: {
          itemHeight: newHeight,
          domRef: element,
        },
      });

      const arrayPath = itemPath.slice(0, -1);
      const arrayPathKey = [stateKey, ...arrayPath].join('.');
      getGlobalStore.getState().notifyPathSubscribers(arrayPathKey, {
        type: 'ITEMHEIGHT',
        itemKey: itemPath.join('.'),

        ref: elementRef.current,
      });
    }
  }, [inView, imagesLoaded, stateKey, itemPath]);

  const fullItemPath = [stateKey, ...itemPath].join('.');
  const itemValue = getGlobalStore.getState().getShadowValue(fullItemPath);

  if (itemValue === undefined) {
    return null;
  }

  const itemSetter = rebuildStateShape({
    currentState: itemValue,
    path: itemPath,
    componentId: itemComponentId,
  });
  const children = renderFn(itemSetter, localIndex, arraySetter);

  return <div ref={setRefs}>{children}</div>;
}

function FormElementWrapper({
  stateKey,
  path,
  rebuildStateShape,
  renderFn,
  formOpts,
  setState,
}: {
  stateKey: string;
  path: string[];
  rebuildStateShape: (options: {
    currentState: any;
    path: string[];
    componentId: string;
    meta?: any;
  }) => any;
  renderFn: (params: FormElementParams<any>) => React.ReactNode;
  formOpts?: FormOptsType;
  setState: any;
}) {
  const [componentId] = useState(() => uuidv4());
  const [, forceUpdate] = useState({});

  const stateKeyPathKey = [stateKey, ...path].join('.');
  useRegisterComponent(stateKey, componentId, forceUpdate);
  const globalStateValue = getGlobalStore
    .getState()
    .getShadowValue(stateKeyPathKey);
  const [localValue, setLocalValue] = useState<any>(globalStateValue);
  const isCurrentlyDebouncing = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      !isCurrentlyDebouncing.current &&
      !isDeepEqual(globalStateValue, localValue)
    ) {
      setLocalValue(globalStateValue);
    }
  }, [globalStateValue]);

  useEffect(() => {
    const unsubscribe = getGlobalStore
      .getState()
      .subscribeToPath(stateKeyPathKey, (newValue) => {
        if (!isCurrentlyDebouncing.current && localValue !== newValue) {
          forceUpdate({});
        }
      });
    return () => {
      unsubscribe();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        isCurrentlyDebouncing.current = false;
      }
    };
  }, []);

  const debouncedUpdate = useCallback(
    (newValue: any) => {
      const currentType = typeof globalStateValue;
      if (currentType === 'number' && typeof newValue === 'string') {
        newValue = newValue === '' ? 0 : Number(newValue);
      }
      setLocalValue(newValue);
      isCurrentlyDebouncing.current = true;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      const debounceTime = formOpts?.debounceTime ?? 200;

      debounceTimeoutRef.current = setTimeout(() => {
        isCurrentlyDebouncing.current = false;

        // Update state
        setState(newValue, path, { updateType: 'update' });

        // Perform LIVE validation (gentle)
        const { getInitialOptions, setShadowMetadata, getShadowMetadata } =
          getGlobalStore.getState();
        const validationOptions = getInitialOptions(stateKey)?.validation;
        const zodSchema =
          validationOptions?.zodSchemaV4 || validationOptions?.zodSchemaV3;

        if (zodSchema) {
          const fullState = getGlobalStore.getState().getShadowValue(stateKey);
          const result = zodSchema.safeParse(fullState);

          const currentMeta = getShadowMetadata(stateKey, path) || {};

          if (!result.success) {
            const errors =
              'issues' in result.error
                ? result.error.issues
                : (result.error as any).errors;
            const pathErrors = errors.filter(
              (error: any) =>
                JSON.stringify(error.path) === JSON.stringify(path)
            );

            if (pathErrors.length > 0) {
              setShadowMetadata(stateKey, path, {
                ...currentMeta,
                validation: {
                  status: 'INVALID_LIVE',
                  message: pathErrors[0]?.message,
                  validatedValue: newValue,
                },
              });
            } else {
              // This field has no errors - clear validation
              setShadowMetadata(stateKey, path, {
                ...currentMeta,
                validation: {
                  status: 'VALID_LIVE',
                  validatedValue: newValue,
                },
              });
            }
          } else {
            // Validation passed - clear any existing errors
            setShadowMetadata(stateKey, path, {
              ...currentMeta,
              validation: {
                status: 'VALID_LIVE',
                validatedValue: newValue,
              },
            });
          }
        }
      }, debounceTime);
      forceUpdate({});
    },
    [setState, path, formOpts?.debounceTime, stateKey]
  );

  // --- NEW onBlur HANDLER ---
  // This replaces the old commented-out method with a modern approach.
  const handleBlur = useCallback(async () => {
    console.log('handleBlur triggered');

    // Commit any pending changes
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
      isCurrentlyDebouncing.current = false;
      setState(localValue, path, { updateType: 'update' });
    }

    const { getInitialOptions } = getGlobalStore.getState();
    const validationOptions = getInitialOptions(stateKey)?.validation;
    const zodSchema =
      validationOptions?.zodSchemaV4 || validationOptions?.zodSchemaV3;

    if (!zodSchema) return;

    // Get the full path including stateKey

    // Update validation state to "validating"
    const currentMeta = getGlobalStore
      .getState()
      .getShadowMetadata(stateKey, path);
    getGlobalStore.getState().setShadowMetadata(stateKey, path, {
      ...currentMeta,
      validation: {
        status: 'DIRTY',
        validatedValue: localValue,
      },
    });

    // Validate full state
    const fullState = getGlobalStore.getState().getShadowValue(stateKey);
    const result = zodSchema.safeParse(fullState);
    console.log('result ', result);
    if (!result.success) {
      const errors =
        'issues' in result.error
          ? result.error.issues
          : (result.error as any).errors;

      console.log('All validation errors:', errors);
      console.log('Current blur path:', path);

      // Find errors for this specific path
      const pathErrors = errors.filter((error: any) => {
        console.log('Processing error:', error);

        // For array paths, we need to translate indices to ULIDs
        if (path.some((p) => p.startsWith('id:'))) {
          console.log('Detected array path with ULID');

          // This is an array item path like ["id:xyz", "name"]
          const parentPath = path[0]!.startsWith('id:')
            ? []
            : path.slice(0, -1);

          console.log('Parent path:', parentPath);

          const arrayMeta = getGlobalStore
            .getState()
            .getShadowMetadata(stateKey, parentPath);

          console.log('Array metadata:', arrayMeta);

          if (arrayMeta?.arrayKeys) {
            const itemKey = [stateKey, ...path.slice(0, -1)].join('.');
            const itemIndex = arrayMeta.arrayKeys.indexOf(itemKey);

            console.log('Item key:', itemKey, 'Index:', itemIndex);

            // Compare with Zod path
            const zodPath = [...parentPath, itemIndex, ...path.slice(-1)];
            const match =
              JSON.stringify(error.path) === JSON.stringify(zodPath);

            console.log('Zod path comparison:', {
              zodPath,
              errorPath: error.path,
              match,
            });
            return match;
          }
        }

        const directMatch = JSON.stringify(error.path) === JSON.stringify(path);
        console.log('Direct path comparison:', {
          errorPath: error.path,
          currentPath: path,
          match: directMatch,
        });
        return directMatch;
      });

      console.log('Filtered path errors:', pathErrors);
      // Update shadow metadata with validation result
      getGlobalStore.getState().setShadowMetadata(stateKey, path, {
        ...currentMeta,
        validation: {
          status: 'VALIDATION_FAILED',
          message: pathErrors[0]?.message,
          validatedValue: localValue,
        },
      });
    } else {
      // Validation passed
      getGlobalStore.getState().setShadowMetadata(stateKey, path, {
        ...currentMeta,
        validation: {
          status: 'VALID_PENDING_SYNC',
          validatedValue: localValue,
        },
      });
    }
    forceUpdate({});
  }, [stateKey, path, localValue, setState]);

  const baseState = rebuildStateShape({
    currentState: globalStateValue,
    path: path,
    componentId: componentId,
  });

  const stateWithInputProps = new Proxy(baseState, {
    get(target, prop) {
      if (prop === 'inputProps') {
        return {
          value: localValue ?? '',
          onChange: (e: any) => {
            debouncedUpdate(e.target.value);
          },
          // 5. Wire the new onBlur handler to the input props.
          onBlur: handleBlur,
          ref: formRefStore
            .getState()
            .getFormRef(stateKey + '.' + path.join('.')),
        };
      }

      return target[prop];
    },
  });

  return (
    <ValidationWrapper formOpts={formOpts} path={path} stateKey={stateKey}>
      {renderFn(stateWithInputProps)}
    </ValidationWrapper>
  );
}
function useRegisterComponent(
  stateKey: string,
  componentId: string,
  forceUpdate: (o: object) => void
) {
  const fullComponentId = `${stateKey}////${componentId}`;

  useLayoutEffect(() => {
    const { registerComponent, unregisterComponent } =
      getGlobalStore.getState();

    // Call the safe, centralized function to register
    registerComponent(stateKey, fullComponentId, {
      forceUpdate: () => forceUpdate({}),
      paths: new Set(),
      reactiveType: ['component'],
    });

    // The cleanup now calls the safe, centralized unregister function
    return () => {
      unregisterComponent(stateKey, fullComponentId);
    };
  }, [stateKey, fullComponentId]); // Dependencies are stable and correct
}
