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
  getNestedValue,
  isArray,
  isFunction,
  type GenericObject,
} from './utility.js';
import { ValidationWrapper } from './Functions.js';
import { isDeepEqual, transformStateFunc } from './utility.js';
import superjson from 'superjson';
import { v4 as uuidv4 } from 'uuid';
import { array, z } from 'zod';

import {
  formRefStore,
  getGlobalStore,
  type CogsEvent,
  type ComponentsType,
} from './store.js';
import { useCogsConfig } from './CogsStateClient.js';
import { applyPatch } from 'fast-json-patch';
import { useInView } from 'react-intersection-observer';

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
export type PushArgs<U, T> = (
  update:
    | Prettify<U>
    | ((prevState: NonNullable<Prettify<U>>[]) => NonNullable<Prettify<U>>)
) => StateObject<T>;

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
  store?: (buffer: T[]) => R | R[]; // Transform buffer into what gets stored
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
  stream: <T = InferArrayElement<TShape>, R = T>(
    options?: StreamOptions<T, R>
  ) => StreamHandle<T>;
  findWith: findWithFuncType<InferArrayElement<TShape>>;
  index: (index: number) => StateObject<InferArrayElement<TShape>> & {
    insert: InsertType<InferArrayElement<TShape>>;
    cut: CutFunctionType<TShape>;
    _index: number;
  } & EndType<InferArrayElement<TShape>>;
  insert: InsertType<InferArrayElement<TShape>>;
  cut: CutFunctionType<TShape>;
  cutSelected: () => void;
  cutByValue: (value: string | number | boolean) => void;
  toggleByValue: (value: string | number | boolean) => void;
  stateSort: (
    compareFn: (
      a: InferArrayElement<TShape>,
      b: InferArrayElement<TShape>
    ) => number,
    deps?: any[]
  ) => ArrayEndType<TShape>;
  useVirtualView: (
    options: VirtualViewOptions
  ) => VirtualStateObjectResult<InferArrayElement<TShape>[]>;

  stateList: (
    callbackfn: (
      setter: StateObject<InferArrayElement<TShape>>,
      index: number,

      arraySetter: StateObject<TShape>
    ) => void
  ) => any;
  stateMap: <U>(
    callbackfn: (
      setter: StateObject<InferArrayElement<TShape>>,
      index: number,
      arraySetter: StateObject<TShape>
    ) => U
  ) => U[];
  $stateMap: (
    callbackfn: (
      setter: StateObject<InferArrayElement<TShape>>,
      index: number,

      arraySetter: StateObject<TShape>
    ) => void
  ) => any;
  stateFlattenOn: <K extends keyof InferArrayElement<TShape>>(
    field: K
  ) => StateObject<InferArrayElement<InferArrayElement<TShape>[K]>[]>;
  uniqueInsert: (
    payload: InsertParams<InferArrayElement<TShape>>,
    fields?: (keyof InferArrayElement<TShape>)[],
    onMatch?: (existingItem: any) => any
  ) => void;
  stateFind: (
    callbackfn: (value: InferArrayElement<TShape>, index: number) => boolean
  ) => StateObject<InferArrayElement<TShape>> | undefined;
  stateFilter: (
    callbackfn: (value: InferArrayElement<TShape>, index: number) => void,
    deps?: any[]
  ) => ArrayEndType<TShape>;
  getSelected: () => StateObject<InferArrayElement<TShape>> | undefined;
  clearSelected: () => void;
  getSelectedIndex: () => number;
  last: () => StateObject<InferArrayElement<TShape>> | undefined;
} & EndType<TShape>;

export type FormOptsType = {
  validation?: {
    hideMessage?: boolean;
    message?: string;
    stretch?: boolean;
    props?: GenericObject;
    disable?: boolean;
  };

  debounceTime?: number;
};

export type FormControl<T> = (obj: FormElementParams<T>) => JSX.Element;

export type UpdateArg<S> = S | ((prevState: S) => S);
export type InsertParams<S> =
  | S
  | ((prevState: { state: S; uuid: string }) => S);
export type UpdateType<T> = (payload: UpdateArg<T>) => void;

export type InsertType<T> = (payload: InsertParams<T>) => void;

export type ObjectEndType<T> = EndType<T> & {
  [K in keyof T]-?: ObjectEndType<T[K]>;
} & {
  stateObject: (callbackfn: (value: T, setter: StateObject<T>) => void) => any;
  delete: () => void;
};
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
  $get: () => T;
  $derive: <R>(fn: EffectFunction<T, R>) => R;
  $deriveClass: <R>(fn: EffectFunction<T, R>, deps?: any[]) => R;
  _status: 'fresh' | 'stale' | 'synced';
  getStatus: () => 'fresh' | 'stale';

  showValidationErrors: () => string[];
  setValidation: (ctx: string) => void;
  removeValidation: (ctx: string) => void;
  ignoreFields: (fields: string[]) => StateObject<T>;
  _selected: boolean;
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
    ? { [K in keyof T]-?: StateObject<T[K]> } & ObjectEndType<T>
    : T extends string | number | boolean | null
      ? T
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
    _isServerSynced: () => boolean;
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

// Then update your EffectiveSetState type
type EffectiveSetState<TStateObject> = (
  newStateOrFunction:
    | EffectiveSetStateArg<TStateObject, 'update'>
    | EffectiveSetStateArg<TStateObject, 'insert'>,
  path: string[],
  updateObj: { updateType: 'update' | 'insert' | 'cut' },
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

type ValidationOptionsType = {
  key?: string;
  zodSchema?: z.ZodTypeAny;
  onBlur?: boolean;
};

export type OptionsType<T extends unknown = unknown> = {
  log?: boolean;
  componentId?: string;
  serverSync?: ServerSyncType<T>;
  validation?: ValidationOptionsType;

  serverState?: {
    id?: string | number;
    data?: T;
    status?: 'pending' | 'error' | 'success';
    timestamp?: number;
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
  formElements?: FormsElementsType;

  reactiveDeps?: (state: T) => any[] | true;
  reactiveType?: ReactivityType;
  syncUpdate?: Partial<UpdateTypeDetail>;

  defaultState?: T;
  dependencies?: any[];
};
export type ServerSyncType<T> = {
  testKey?: string;
  syncKey: (({ state }: { state: T }) => string) | string;
  syncFunction: ({ state }: { state: T }) => void;
  debounce?: number;

  snapshot?: {
    name: (({ state }: { state: T }) => string) | string;
    stateKeys: StateKeys[];
    currentUrl: string;
    currentParams?: URLSearchParams;
  };
};

export type SyncActionsType<T> = {
  syncKey: string;

  rollBackState?: T;
  actionTimeStamp: number;
  retryCount?: number;
  status:
    | 'success'
    | 'waiting'
    | 'rolledBack'
    | 'error'
    | 'cancelled'
    | 'failed';
  snapshot?: {
    name: string;
    stateKeys: StateKeys[];
    currentUrl: string;
    currentParams?: URLSearchParams;
  };
};

export type ValidationWrapperOptions<T extends unknown = unknown> = {
  children: React.ReactNode;
  active: boolean;
  stretch?: boolean;
  path: string[];
  message?: string;
  data?: T;
  key?: string;
};
export type SyncRenderOptions<T extends unknown = unknown> = {
  children: React.ReactNode;
  time: number;
  data?: T;
  key?: string;
};

type FormsElementsType<T extends unknown = unknown> = {
  validation?: (options: ValidationWrapperOptions<T>) => React.ReactNode;
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

// Fix for the setOptions function
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
          mergedOptions[key] !== options[key] && // Different references
          !isDeepEqual(mergedOptions[key], options[key]) // And different values
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
export const createCogsState = <State extends Record<StateKeys, unknown>>(
  initialState: State,
  opt?: { formElements?: FormsElementsType; validation?: ValidationOptionsType }
) => {
  let newInitialState = initialState;
  console.log('initialState', initialState);
  // Extract state parts and options using transformStateFunc
  const [statePart, initialOptionsPart] =
    transformStateFunc<State>(newInitialState);

  // Apply global options to each state key
  Object.keys(statePart).forEach((key) => {
    // Get existing options for this state key (from addStateOptions pattern)
    let existingOptions = initialOptionsPart[key] || {};

    // Create the merged options object
    const mergedOptions: any = {
      // Start with existing options (from addStateOptions)
      ...existingOptions,
    };

    // Apply global formElements
    if (opt?.formElements) {
      mergedOptions.formElements = {
        ...opt.formElements, // Global defaults first
        ...(existingOptions.formElements || {}), // State-specific overrides
      };
    }

    // Apply global validation - this is the key fix
    if (opt?.validation) {
      mergedOptions.validation = {
        ...opt.validation, // Global validation first
        ...(existingOptions.validation || {}), // State-specific overrides
      };

      // If global validation has a key and state doesn't have one, use the state key
      if (opt.validation.key && !existingOptions.validation?.key) {
        mergedOptions.validation.key = `${opt.validation.key}.${key}`;
      }
    }

    // Only set if we have options to set
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

  getGlobalStore.getState().setInitialStates(statePart);
  getGlobalStore.getState().setCreatedState(statePart);

  Object.keys(statePart).forEach((key) => {
    getGlobalStore.getState().initializeShadowState(key, statePart[key]);
  });

  type StateKeys = keyof typeof statePart;

  const useCogsState = <StateKey extends StateKeys>(
    stateKey: StateKey,
    options?: OptionsType<(typeof statePart)[StateKey]>
  ) => {
    const [componentId] = useState(options?.componentId ?? uuidv4());

    setOptions({
      stateKey,
      options,
      initialOptionsPart,
    });

    const thiState =
      getGlobalStore.getState().cogsStateStore[stateKey as string] ||
      statePart[stateKey as string];
    const partialState = options?.modifyState
      ? options.modifyState(thiState)
      : thiState;

    const [state, updater] = useCogsStateFn<(typeof statePart)[StateKey]>(
      partialState,
      {
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
      }
    );

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

  return { useCogsState, setCogsOptions };
};

const {
  setUpdaterState,
  setState,
  getInitialOptions,
  getKeyState,
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
  const currentState = getGlobalStore.getState().cogsStateStore[stateKey];
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
      setState(stateKey, localData.state);

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

const updateGlobalState = (
  thisKey: string,
  initialState: any,
  newState: any,
  effectiveSetState: EffectiveSetState<any>,
  componentId: string,
  sessionId?: string
) => {
  // Update all global state at once
  const updates = {
    initialState: initialState,
    updaterState: createProxyHandler(
      thisKey,
      effectiveSetState,
      componentId,
      sessionId
    ),
    state: newState,
  };

  updateInitialStateGlobal(thisKey, updates.initialState);
  setUpdaterState(thisKey, updates.updaterState);
  setState(thisKey, updates.state);
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

export function useCogsStateFn<TStateObject extends unknown>(
  stateObject: TStateObject,
  {
    stateKey,
    serverSync,
    localStorage,
    formElements,
    reactiveDeps,
    reactiveType,
    componentId,
    defaultState,
    syncUpdate,
    dependencies,
    serverState,
  }: {
    stateKey?: string;
    componentId?: string;
    defaultState?: TStateObject;
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
      setState(thisKey, (prevState: any) => ({
        ...prevState,
        [syncUpdate.path![0]!]: syncUpdate.newValue,
      }));

      // Create combined key and update sync info
      const syncKey = `${syncUpdate.stateKey}:${syncUpdate.path.join('.')}`;
      getGlobalStore.getState().setSyncInfo(syncKey, {
        timeStamp: syncUpdate.timeStamp!,
        userId: syncUpdate.userId!,
      });
    }
  }, [syncUpdate]);

  useEffect(() => {
    const options = latestInitialOptionsRef.current;
    // Only proceed if defaultState is provided
    if (options?.defaultState !== undefined) {
      setAndMergeOptions(thisKey as string, {
        defaultState: options.defaultState,
      });

      const currentOptions = latestInitialOptionsRef.current;

      // Resolve the initial state based on priority
      const resolveInitialState = (): {
        value: TStateObject;
        source: 'default' | 'server' | 'localStorage';
        timestamp: number;
      } => {
        // 1. Check server state
        const hasValidServerData =
          currentOptions?.serverState?.status === 'success' &&
          currentOptions?.serverState?.data !== undefined;

        if (hasValidServerData) {
          return {
            value: currentOptions.serverState!.data!,
            source: 'server',
            timestamp: currentOptions.serverState!.timestamp || Date.now(),
          };
        }

        // 2. Check localStorage
        if (currentOptions?.localStorage?.key && sessionId) {
          const localKey = isFunction(currentOptions.localStorage.key)
            ? currentOptions.localStorage.key(options.defaultState)
            : currentOptions.localStorage.key;

          const localData = loadFromLocalStorage(
            `${sessionId}-${thisKey}-${localKey}`
          );

          if (
            localData &&
            localData.lastUpdated >
              (currentOptions?.serverState?.timestamp || 0)
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
          value: options.defaultState as TStateObject,
          source: 'default',
          timestamp: Date.now(),
        };
      };

      const { value: newState, source, timestamp } = resolveInitialState();

      // Initialize shadow state with metadata
      getGlobalStore
        .getState()
        .initializeShadowState(thisKey, options.defaultState);

      // Set shadow metadata with source info
      getGlobalStore.getState().setShadowMetadata(thisKey, [], {
        stateSource: source,
        lastServerSync: source === 'server' ? timestamp : undefined,
        isDirty: false,
        baseServerState: source === 'server' ? newState : undefined,
      });

      // Update global state
      updateGlobalState(
        thisKey,
        options.defaultState, // Always use defaultState as the "initial"
        newState, // This is what we actually use
        effectiveSetState,
        componentIdRef.current,
        sessionId
      );

      // Save to localStorage if we used server data
      if (
        source === 'server' &&
        currentOptions?.localStorage?.key &&
        sessionId
      ) {
        saveToLocalStorage(
          newState,
          thisKey,
          currentOptions,
          sessionId,
          timestamp
        );
      }

      // Notify components
      notifyComponents(thisKey);

      const reactiveTypes = Array.isArray(reactiveType)
        ? reactiveType
        : [reactiveType || 'component'];

      if (!reactiveTypes.includes('none')) {
        forceUpdate({});
      }
    }
  }, [
    latestInitialOptionsRef.current?.defaultState, // Changed from initialState
    serverState?.status,
    serverState?.data,
    serverState?.timestamp, // NEW
    ...(dependencies || []),
  ]);
  useLayoutEffect(() => {
    if (noStateKey) {
      setAndMergeOptions(thisKey as string, {
        serverSync,
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

  const effectiveSetState = (
    newStateOrFunction: UpdateArg<TStateObject> | InsertParams<TStateObject>,
    path: string[],
    updateObj: { updateType: 'insert' | 'cut' | 'update' },
    validationKey?: string
  ) => {
    const fullPath = [thisKey, ...path].join('.'); // This is the full path to the state slice
    if (Array.isArray(path)) {
      const pathKey = `${thisKey}-${path.join('.')}`;
      componentUpdatesRef.current.add(pathKey);
    }
    const store = getGlobalStore.getState();

    setState(thisKey, (prevValue: TStateObject) => {
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

      switch (updateObj.updateType) {
        case 'insert': {
          store.insertShadowArrayElement(thisKey, path, newUpdate.newValue);
          break;
        }
        case 'cut': {
          store.removeShadowArrayElement(thisKey, path);
          break;
        }
        case 'update': {
          store.updateShadowAtPath(thisKey, path, newUpdate.newValue);
          break;
        }
      }

      const updatedShadowMeta = store.getShadowMetadata(
        thisKey,
        updateObj.updateType === 'insert' ? path : path.slice(0, -1)
      );
      if (updatedShadowMeta && updatedShadowMeta.stateSource === 'server') {
        store.setShadowMetadata(thisKey, [], {
          ...updatedShadowMeta,
          isDirty: true,
        });
      }
      const updatedShadowValue = store.getShadowValue(
        [
          thisKey,
          ...(updateObj.updateType === 'insert' ? path : path.slice(0, -1)),
        ].join('.')
      );

      // Only proceed if the underlying array has actually changed.
      if (updatedShadowMeta?.classSignals) {
        // Use .map() to create a NEW array of signals. This is the immutable fix.
        const newClassSignals = updatedShadowMeta.classSignals.map(
          (signal: any) => {
            let newClasses = '';
            let oldClasses = signal.lastClasses;

            try {
              // Re-run the derivation function with its specific dependencies
              const effectFn = new Function(
                'state',
                'deps',
                `return (${signal.effect})(state, deps)`
              );

              newClasses = effectFn(updatedShadowValue, signal.deps); //updatedShadowValue

              // Only touch the DOM if the calculated classes have actually changed
              // In effectiveSetState where you update classSignals
              if (newClasses !== oldClasses) {
                const elements = document.querySelectorAll(`.${signal.id}`);
                elements.forEach((element: Element) => {
                  // Remove old classes
                  if (oldClasses) {
                    const oldClassesArray = oldClasses
                      .split(' ')
                      .filter(Boolean);
                    if (oldClassesArray.length > 0) {
                      element.classList.remove(...oldClassesArray);
                    }
                  }

                  // Force React to re-process this element
                  const onClick = (element as any).onclick;
                  if (onClick) {
                    (element as any).onclick = null;
                    queueMicrotask(() => {
                      (element as any).onclick = onClick;
                    });
                  }

                  // Add new classes
                  const newClassesArray = newClasses.split(' ').filter(Boolean);
                  if (newClassesArray.length > 0) {
                    element.classList.add(...newClassesArray);
                  }
                });
              }
            } catch (e) {
              console.error('Error in deriveClass update:', e);
            }

            // Return a new object for the new array, with the updated `lastClasses`
            return { ...signal, lastClasses: newClasses };
          }
        );

        // Persist the metadata with the NEW array. This guarantees the change is saved.
        store.setShadowMetadata(thisKey, path, {
          ...updatedShadowMeta,
          classSignals: newClassSignals,
        });
      }
      // Only process signals if they exist
      if (shadowMeta?.signals && shadowMeta.signals.length > 0) {
        // Get the updated value from shadow store
        const updatedShadowValue = store.getShadowValue(fullPath);

        shadowMeta.signals.forEach(({ parentId, position, effect }) => {
          const parent = document.querySelector(
            `[data-parent-id="${parentId}"]`
          );
          if (parent) {
            const childNodes = Array.from(parent.childNodes);
            if (childNodes[position]) {
              let displayValue = updatedShadowValue;
              if (effect) {
                try {
                  displayValue = new Function(
                    'state',
                    `return (${effect})(state)`
                  )(updatedShadowValue);
                } catch (err) {
                  console.error('Error evaluating effect function:', err);
                  displayValue = updatedShadowValue;
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

      // Update in effectiveSetState for insert handling:
      if (updateObj.updateType === 'insert') {
        getGlobalStore.getState().notifyPathSubscribers(fullPath, payload);
        const arrayMeta = store.getShadowMetadata(thisKey, path);

        if (arrayMeta?.mapWrappers && arrayMeta.mapWrappers.length > 0) {
          const sourceArrayKeys =
            store.getShadowMetadata(thisKey, path)?.arrayKeys || [];
          const newItemKey = sourceArrayKeys[sourceArrayKeys.length - 1]!;
          const newItemValue = store.getShadowValue(newItemKey);
          const fullSourceArray = store.getShadowValue(
            [thisKey, ...path].join('.')
          );

          if (!newItemKey || newItemValue === undefined) return;

          arrayMeta.mapWrappers.forEach((wrapper) => {
            let shouldRender = true;
            let insertPosition = -1;

            // Check if wrapper has transforms
            if (
              wrapper.meta?.transforms &&
              wrapper.meta.transforms.length > 0
            ) {
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
        // For cut, path includes the item ID like ['todoArray', 'id:xxx']
        const arrayPath = path.slice(0, -1); // Remove the item ID

        const arrayMeta = store.getShadowMetadata(thisKey, arrayPath);

        if (arrayMeta?.mapWrappers && arrayMeta.mapWrappers.length > 0) {
          arrayMeta.mapWrappers.forEach((wrapper) => {
            if (wrapper.containerRef && wrapper.containerRef.isConnected) {
              // Find and remove the element

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

      if (
        updateObj.updateType === 'update' &&
        (validationKey || latestInitialOptionsRef.current?.validation?.key) &&
        path
      ) {
        removeValidationError(
          (validationKey || latestInitialOptionsRef.current?.validation?.key) +
            '.' +
            path.join('.')
        );
      }
      const arrayWithoutIndex = path.slice(0, path.length - 1);
      if (
        updateObj.updateType === 'cut' &&
        latestInitialOptionsRef.current?.validation?.key
      ) {
        removeValidationError(
          latestInitialOptionsRef.current?.validation?.key +
            '.' +
            arrayWithoutIndex.join('.')
        );
      }
      if (
        updateObj.updateType === 'insert' &&
        latestInitialOptionsRef.current?.validation?.key
      ) {
        const getValidation = getValidationErrors(
          latestInitialOptionsRef.current?.validation?.key +
            '.' +
            arrayWithoutIndex.join('.')
        );

        getValidation.filter((k) => {
          let length = k?.split('.').length;
          const v = ''; // Placeholder as `v` is not used from getValidationErrors

          if (
            k == arrayWithoutIndex.join('.') &&
            length == arrayWithoutIndex.length - 1
          ) {
            let newKey = k + '.' + arrayWithoutIndex;
            removeValidationError(k!);
            addValidationError(newKey, v!);
          }
        });
      }
      // Assumes `isDeepEqual` is available in this scope.

      const newState = store.getShadowValue(thisKey);
      const rootMeta = store.getShadowMetadata(thisKey, []);
      const notifiedComponents = new Set<string>();

      if (!rootMeta?.components) {
        return; // No components to notify, exit early.
      }

      // --- PASS 1: High-Performance Path-Specific Updates ---
      // This is the fastest check and handles the most common case. We do it first.
      const pathMeta = store.getShadowMetadata(thisKey, path);
      if (pathMeta?.pathComponents) {
        pathMeta.pathComponents.forEach((componentId) => {
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
      if (updateObj.updateType === 'insert' || updateObj.updateType === 'cut') {
        // For 'insert', the path is the array path. For 'cut', it's the item path.
        const parentArrayPath =
          updateObj.updateType === 'insert' ? path : path.slice(0, -1); // Get parent path by removing the item ID

        const parentMeta = store.getShadowMetadata(thisKey, parentArrayPath);

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

        if (parentMeta?.pathComponents) {
          parentMeta.pathComponents.forEach((componentId) => {
            // Check if we've already notified this component to prevent redundant updates
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

      // --- PASS 2: Single Global Loop for 'all' and 'deps' ---
      // Now iterate just ONCE over all components to handle the global cases.
      rootMeta.components.forEach((component, componentId) => {
        // CRITICAL: Skip any component that was already updated by the fast path.
        if (notifiedComponents.has(componentId)) {
          return; // equivalent to 'continue'
        }

        const reactiveTypes = Array.isArray(component.reactiveType)
          ? component.reactiveType
          : [component.reactiveType || 'component'];

        // Check for 'all' first, as it's the strongest condition and needs no further work.
        if (reactiveTypes.includes('all')) {
          component.forceUpdate();
          notifiedComponents.add(componentId);
          return; // We're done with this component, no need to check 'deps'.
        }

        // If not 'all', check for 'deps'. This is now an `else if` condition in spirit.
        if (reactiveTypes.includes('deps')) {
          if (component.depsFunction) {
            const currentState = store.getShadowValue(thisKey);
            const newDeps = component.depsFunction(currentState);
            let shouldUpdate = false;
            console.log('newDeps', componentId, component, newDeps);
            // Case 1: The function returned `true` explicitly.
            if (newDeps === true) {
              shouldUpdate = true;
            }
            // Case 2: The function returned a dependency array.
            else if (Array.isArray(newDeps)) {
              // Compare against the PREVIOUS deps, not component.deps
              if (!isDeepEqual(component.prevDeps, newDeps)) {
                // The dependencies have changed, update the stored value for the next check.
                component.prevDeps = newDeps;
                shouldUpdate = true;
              }
            }
            console.log(
              'newDeps shouldUpdate',
              componentId,
              shouldUpdate,
              notifiedComponents
            );
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
    });
  };
  if (!getGlobalStore.getState().updaterState[thisKey]) {
    setUpdaterState(
      thisKey,
      createProxyHandler(
        thisKey,
        effectiveSetState,
        componentIdRef.current,
        sessionId
      )
    );
    if (!getGlobalStore.getState().cogsStateStore[thisKey]) {
      setState(thisKey, stateObject);
    }
    if (!getGlobalStore.getState().initialStateGlobal[thisKey]) {
      updateInitialStateGlobal(thisKey, stateObject);
    }
  }

  const updaterFinal = useMemo(() => {
    return createProxyHandler<TStateObject>(
      thisKey,
      effectiveSetState,
      componentIdRef.current,
      sessionId
    );
  }, [thisKey, sessionId]);

  return [getKeyState(thisKey), updaterFinal] as [
    TStateObject,
    StateObject<TStateObject>,
  ];
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
    dependencies?: any[];
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
  const rootMeta = getGlobalStore.getState().getShadowMetadata(stateKey, []);
  const component = rootMeta?.components?.get(fullComponentId);

  if (
    !component ||
    component.reactiveType == 'none' ||
    !(
      Array.isArray(component.reactiveType)
        ? component.reactiveType
        : [component.reactiveType]
    ).includes('component')
  ) {
    return;
  }

  const pathKey = [stateKey, ...dependencyPath].join('.');

  // Add to component's paths (existing logic)
  component.paths.add(pathKey);

  // NEW: Also store componentId at the path level
  const pathMeta =
    getGlobalStore.getState().getShadowMetadata(stateKey, dependencyPath) || {};
  const pathComponents = pathMeta.pathComponents || new Set<string>();
  pathComponents.add(fullComponentId);
  // console.log(
  //   "pathComponents",
  //   pathMeta,
  //   pathComponents,
  //   stateKey,
  //   componentId,
  //   dependencyPath
  // );
  getGlobalStore.getState().setShadowMetadata(stateKey, dependencyPath, {
    ...pathMeta,
    pathComponents,
  });
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
      return getGlobalStore().getNestedState(stateKey, path);
    } as unknown as CallableStateObject<T>;

    // We attach baseObj properties *inside* the get trap now to avoid recursion
    // This is a placeholder for the proxy.

    const handler = {
      apply(target: any, thisArg: any, args: any[]) {
        //return getGlobalStore().getNestedState(stateKey, path);
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
            const currentState =
              getGlobalStore.getState().cogsStateStore[stateKey];

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
              .getNestedState(stateKey, []);
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
        if (prop === '_status' || prop === 'getStatus') {
          const getStatusFunc = () => {
            const shadowMeta = getGlobalStore
              .getState()
              .getShadowMetadata(stateKey, []);

            if (shadowMeta?.stateSource === 'server' && !shadowMeta.isDirty) {
              return 'synced';
            } else if (shadowMeta?.isDirty) {
              return 'dirty';
            } else if (shadowMeta?.stateSource === 'localStorage') {
              return 'restored';
            } else if (shadowMeta?.stateSource === 'default') {
              return 'fresh';
            }
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
            const init = getGlobalStore
              .getState()
              .getInitialOptions(stateKey)?.validation;
            if (!init?.key) throw new Error('Validation key not found');
            return getGlobalStore
              .getState()
              .getValidationErrors(init.key + '.' + path.join('.'));
          };
        }
        if (Array.isArray(currentState)) {
          if (prop === 'getSelected') {
            return () => {
              registerComponentDependency(stateKey, componentId, [
                ...path,
                'getSelected',
              ]);

              const fullKey = stateKey + '.' + path.join('.');
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
              } = options;
              const initialScrollRef = useRef(true);
              const containerRef = useRef<HTMLDivElement | null>(null);
              const [range, setRange] = useState({
                startIndex: 0,
                endIndex: 10,
              });
              // Inside useVirtualView, near the top
              const measurementCache = useRef(
                new Map<string, { height: number; offset: number }>()
              );

              const mutationObserverRef = useRef<MutationObserver | null>(null);
              // Calculate total height based on actual array length
              const arrayKeys =
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys || [];

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
                  // Get the REAL measured height from metadata, or use the prop as an estimate
                  const itemPath = itemKey.split('.').slice(1);
                  const measuredHeight =
                    getGlobalStore
                      .getState()
                      .getShadowMetadata(stateKey, itemPath)?.virtualizer
                      ?.itemHeight || itemHeight; // Use real height or fallback to estimate

                  offsets.set(itemKey, {
                    height: measuredHeight,
                    offset: runningOffset,
                  });

                  runningOffset += measuredHeight;
                });

                measurementCache.current = offsets; // Keep the ref updated
                return { totalHeight: runningOffset, itemOffsets: offsets };
              }, [arrayKeys]);

              // Always show the last N items when stickToBottom is true
              useLayoutEffect(() => {
                if (
                  !scrolledFromBottomConfirmed.current &&
                  stickToBottom &&
                  arrayKeys.length > 0 &&
                  containerRef.current
                ) {
                  const visibleCount = Math.ceil(
                    (containerRef.current.clientHeight || 500) / itemHeight
                  );
                  const endIndex = arrayKeys.length - 1;
                  const startIndex = Math.max(
                    0,
                    endIndex - visibleCount - overscan
                  );
                  //  setRange({ startIndex, endIndex });
                }
              }, [arrayKeys.length, stickToBottom, totalHeight]);

              const userHasScrolledUpCountRef = useRef(0);
              const lastScrollTopRef = useRef(0);
              const scrolledFromBottomConfirmed = useRef(false);

              useEffect(() => {
                if (!stickToBottom || !containerRef.current) return;
                const container = containerRef.current;

                const handleScroll = () => {
                  const currentScrollTop = container.scrollTop;
                  let newStartIndex = 0;
                  // A negative delta means the user scrolled up.
                  if (currentScrollTop < lastScrollTopRef.current) {
                    userHasScrolledUpCountRef.current++;
                  }
                  if (userHasScrolledUpCountRef.current > 5) {
                    userHasScrolledUpCountRef.current = 0;
                    scrolledFromBottomConfirmed.current = true;
                  }

                  if (
                    container.scrollHeight - 10 <
                    container.scrollTop + container.clientHeight
                  ) {
                    scrolledFromBottomConfirmed.current = false;
                  }

                  // This is a simple linear search. For very long lists, binary search is faster,
                  // but this is much easier to implement and often fast enough.
                  for (let i = 0; i < arrayKeys.length; i++) {
                    const itemKey = arrayKeys[i];
                    const item = measurementCache.current.get(itemKey!);
                    if (item && item.offset + item.height > currentScrollTop) {
                      newStartIndex = i;
                      break;
                    }
                  }

                  // Only update state if the range has actually changed
                  if (newStartIndex !== range.startIndex) {
                    const visibleCount = Math.ceil(
                      container.clientHeight / itemHeight
                    ); // Use estimate for visible count
                    setRange({
                      startIndex: Math.max(0, newStartIndex - overscan),
                      endIndex: Math.min(
                        arrayKeys.length - 1,
                        newStartIndex + visibleCount + overscan
                      ),
                    });
                  }

                  lastScrollTopRef.current = currentScrollTop;
                };

                container.addEventListener('scroll', handleScroll, {
                  passive: true,
                });
                return () =>
                  container.removeEventListener('scroll', handleScroll);
              }, [stickToBottom]);

              useEffect(() => {
                if (!stickToBottom || !containerRef.current) return;

                const container = containerRef.current;

                // Function to scroll to bottom
                const scrollToBottom = () => {
                  if (
                    !scrolledFromBottomConfirmed.current &&
                    container.scrollHeight + 30 >
                      container.scrollTop + container.clientHeight
                  ) {
                    container.scrollTo({
                      top: container.scrollHeight,
                      behavior: initialScrollRef.current ? 'instant' : 'smooth',
                    });
                  }
                };

                // Create observer that watches for any DOM changes
                const debouncedScrollToBottom = debounce(scrollToBottom, 300);

                // Create observer that calls our debounced function
                mutationObserverRef.current = new MutationObserver(() => {
                  debouncedScrollToBottom();
                });

                // Watch for changes in the container and all its children
                mutationObserverRef.current.observe(container, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  attributeFilter: ['height', 'src'], // Watch for height changes and image src
                });

                // Also listen for image load events on any images
                const handleImageLoad = () => scrollToBottom();

                container.addEventListener('load', handleImageLoad, true); // Use capture to catch all image loads

                // Initial scroll
                scrollToBottom();

                return () => {
                  mutationObserverRef.current?.disconnect();
                  container.removeEventListener('load', handleImageLoad, true);
                };
              }, [stickToBottom]);

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
                scrollToBottom: () => {
                  if (containerRef.current) {
                    containerRef.current.scrollTop =
                      containerRef.current.scrollHeight;
                  }
                },
                scrollToIndex: () => {},
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
          }
          if (prop === 'stateFilter') {
            return (
              callbackfn: (value: any, index: number) => boolean,
              deps?: any[]
            ) => {
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
                      dependencies: deps || [],
                    },
                  ],
                },
              });
            };
          }
          if (prop === 'stateSort') {
            return (compareFn: (a: any, b: any) => number, deps?: any[]) => {
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
                    { type: 'sort', fn: compareFn, dependencies: deps || [] },
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

                      // Finally, force the re-render.
                      forceUpdate({});
                    });

                  return unsubscribe;
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
                .getNestedState(stateKey, path) as any[];
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
              invalidateCachePath(path);

              effectiveSetState(payload as any, path, { updateType: 'insert' });
              return rebuildStateShape({
                currentState: getGlobalStore
                  .getState()
                  .getNestedState(stateKey, path),
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
                .getNestedState(stateKey, path) as any[];
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
              const baseArrayKeys =
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys || [];
              const validKeys = applyTransforms(
                stateKey,
                path,
                meta?.transforms
              );
              console.log('validKeys', validKeys);
              if (!validKeys || validKeys.length === 0) return;

              const indexKeyToCut = getGlobalStore
                .getState()
                .selectedIndicesMap.get(stateKeyPathKey);

              let indexToCut = validKeys.findIndex(
                (key) => key === indexKeyToCut
              );
              console.log('indexToCut', indexToCut);
              const pathForCut = validKeys[
                indexToCut == -1 ? validKeys.length - 1 : indexToCut
              ]
                ?.split('.')
                .slice(1);
              console.log('pathForCut', pathForCut);
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

        if (prop === '$deriveClass') {
          // The function signature is correct: it accepts the function and its deps
          return (fn: (state: T, deps: any[]) => string, deps: any[] = []) => {
            const uniqueId = `cogs-cls-${uuidv4()}`;
            const store = getGlobalStore.getState();
            const stateKeyPathKey = [stateKey, ...path].join('.');
            const currentValue = store.getShadowValue(
              stateKeyPathKey,
              meta?.validIds
            );
            console.log('dsazdasdasdasdasd', currentValue);
            let initialClasses = '';
            try {
              // THIS IS THE CRITICAL FIX:
              // We must construct and execute the function with its dependencies, even on the first run.
              const initialExecFn = new Function(
                'state',
                'deps',
                `return (${fn.toString()})(state, deps)`
              );
              initialClasses = initialExecFn(currentValue, deps); // Pass deps here
            } catch (e) {
              console.error('Error in initial deriveClass execution:', e);
            }

            // The rest of the logic remains the same. We store the stringified
            // function and the deps array for later updates.
            const currentMeta = store.getShadowMetadata(stateKey, path) || {};
            const classSignals = currentMeta.classSignals || [];
            classSignals.push({
              id: uniqueId,
              effect: fn.toString(), // Store the original stringified function
              lastClasses: initialClasses,
              deps: deps, // Store the dependencies
            });

            store.setShadowMetadata(stateKey, path, {
              ...currentMeta,
              classSignals,
            });
            console.log(
              '`${uniqueId} ${initialClasses}`.trim()',
              `${uniqueId} ${initialClasses}`.trim()
            );
            return `${uniqueId} ${initialClasses}`.trim();
          };
        }
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
        if (prop === '_selected') {
          const parentPath = path.slice(0, -1);

          registerComponentDependency(stateKey, componentId, [
            ...path,
            'selected',
          ]);
          if (
            Array.isArray(
              getGlobalStore.getState().getNestedState(stateKey, parentPath)
            )
          ) {
            const itemId = path[path.length - 1];
            const fullParentKey = stateKey + '.' + parentPath.join('.');
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

            const selectedIndex = getGlobalStore
              .getState()
              .selectedIndicesMap.get(fullParentKey);

            notifySelectionComponents(stateKey, parentPath, selectedIndex);

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

            notifySelectionComponents(stateKey, parentPath, currentSelected);

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
            return (patches: any[]) => {
              const currentState = getGlobalStore
                .getState()
                .getShadowValue(stateKeyPathKey, meta?.validIds);
              const newState = applyPatch(currentState, patches).newDocument;
              updateGlobalState(
                stateKey,
                getGlobalStore.getState().initialStateGlobal[stateKey],
                newState,
                effectiveSetState,
                componentId,
                sessionId
              );
              notifyComponents(stateKey);
            };
          }
          if (prop === 'validateZodSchema') {
            return () => {
              const init = getGlobalStore
                .getState()
                .getInitialOptions(stateKey)?.validation;
              if (!init?.zodSchema || !init?.key)
                throw new Error('Zod schema or validation key not found');

              removeValidationError(init.key);
              const thisObject =
                getGlobalStore.getState().cogsStateStore[stateKey];
              const result = init.zodSchema.safeParse(thisObject);

              if (!result.success) {
                result.error.errors.forEach((error) => {
                  const fullErrorPath = [init.key, ...error.path].join('.');
                  addValidationError(fullErrorPath, error.message);
                });
                notifyComponents(stateKey);
                return false;
              }
              return true;
            };
          }

          if (prop === 'getComponents')
            return () =>
              getGlobalStore.getState().stateComponents.get(stateKey);
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
            effectiveSetState(payload as any, path, { updateType: 'update' });
            invalidateCachePath(path);
          };
        }
        if (prop === 'toggle') {
          const currentValueAtPath = getGlobalStore
            .getState()
            .getShadowValue([stateKey, ...path].join('.'));
          if (typeof currentState != 'boolean') {
            throw new Error('toggle() can only be used on boolean values');
          }
          return () => {
            console.log('toggle', stateKey, componentId, [...path]);

            effectiveSetState(!currentValueAtPath as any, path, {
              updateType: 'update',
            });
          };
        }
        if (prop === 'formElement') {
          return (child: FormControl<T>, formOpts?: FormOptsType) => {
            if (isArray(currentState)) {
              //   return <></>;
            }
            return (
              <ValidationWrapper
                formOpts={formOpts}
                path={path}
                stateKey={stateKey}
              >
                <FormElementWrapper
                  stateKey={stateKey}
                  path={path}
                  rebuildStateShape={rebuildStateShape}
                  setState={effectiveSetState}
                  formOpts={formOpts}
                  renderFn={child}
                />
              </ValidationWrapper>
            );
          };
        }
        const nextPath = [...path, prop];
        const nextValue = getGlobalStore
          .getState()
          .getNestedState(stateKey, nextPath);
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

      setUpdaterState(stateKey, newProxy);
      setState(stateKey, initialState);
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
        setUpdaterState(stateKey, newUpdaterState);
        setState(stateKey, newState);
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
    _initialState: getGlobalStore.getState().initialStateGlobal[stateKey],
    _serverState: getGlobalStore.getState().serverState[stateKey],
    _isLoading: getGlobalStore.getState().isLoadingGlobal[stateKey],
    _isServerSynced: () => {
      const serverState = getGlobalStore.getState().serverState[stateKey];
      return Boolean(
        serverState && isDeepEqual(serverState, getKeyState(stateKey))
      );
    },
  };
  const returnShape = rebuildStateShape({
    currentState: getGlobalStore.getState().getNestedState(stateKey, []),
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

// in your state manager file...

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
      // If the image is already complete (e.g., cached), count it immediately.
      if (image.complete) {
        handleImageLoad();
      } else {
        image.addEventListener('load', handleImageLoad);
        image.addEventListener('error', handleImageLoad); // Also count errors as "loaded"
      }
    });

    // Cleanup function
    return () => {
      images.forEach((image) => {
        image.removeEventListener('load', handleImageLoad);
        image.removeEventListener('error', handleImageLoad);
      });
    };
  }, [ref.current]); // Rerun if the ref's element changes

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
  arraySetter: any; // The proxy for the whole array

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
  const { ref: inViewRef, inView } = useInView(); // Renamed to avoid conflict
  const elementRef = useRef<HTMLDivElement | null>(null);
  const lastReportedHeight = useRef<number | null>(null);

  // ANNOTATION: The two key hooks for the fix.
  const imagesLoaded = useImageLoaded(elementRef); // Our new hook
  const hasReportedInitialHeight = useRef(false); // A flag to prevent re-reporting

  // Proper way to merge refs
  const setRefs = useCallback(
    (element: HTMLDivElement | null) => {
      elementRef.current = element;
      inViewRef(element); // This is the ref from useInView
    },
    [inViewRef]
  );

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

  // ... rest of the component is unchanged ...
  const fullComponentId = `${stateKey}////${itemComponentId}`;
  const stateEntry = getGlobalStore.getState().getShadowMetadata(stateKey, []);

  if (!stateEntry?.components?.has(fullComponentId)) {
    stateEntry?.components?.set(fullComponentId, {
      forceUpdate: () => forceUpdate({}),
      paths: new Set(),
      reactiveType: ['component'],
    });
  }

  useLayoutEffect(() => {
    return () => {
      cleanupComponentRegistration(stateKey, fullComponentId);
    };
  }, [stateKey, itemComponentId]);

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
const cleanupComponentRegistration = (
  stateKey: string,
  componentId: string
) => {
  const rootMeta = getGlobalStore.getState().getShadowMetadata(stateKey, []);
  const component = rootMeta?.components?.get(componentId);

  // Remove from all registered paths
  if (component?.paths) {
    component.paths.forEach((fullPath) => {
      const pathParts = fullPath.split('.');
      const path = pathParts.slice(1);

      const pathMeta = getGlobalStore
        .getState()
        .getShadowMetadata(stateKey, path);

      if (pathMeta?.pathComponents) {
        pathMeta.pathComponents.delete(componentId);
        if (pathMeta.pathComponents.size === 0) {
          delete pathMeta.pathComponents;
          getGlobalStore.getState().setShadowMetadata(stateKey, path, pathMeta);
        }
      }
    });
  }

  // Remove from root components
  if (rootMeta?.components) {
    rootMeta.components.delete(componentId);
    getGlobalStore.getState().setShadowMetadata(stateKey, [], rootMeta);
  }
};
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

  const fullComponentId = `${stateKey}////${componentId}`;
  const stateKeyPathKey = [stateKey, ...path].join('.');

  // Register component
  useLayoutEffect(() => {
    const rootMeta = getGlobalStore.getState().getShadowMetadata(stateKey, []);
    const components = rootMeta?.components || new Map();

    components.set(fullComponentId, {
      forceUpdate: () => forceUpdate({}),
      paths: new Set(),
      reactiveType: ['component'],
    });

    getGlobalStore.getState().setShadowMetadata(stateKey, [], {
      ...rootMeta,
      components,
    });

    return () => {
      cleanupComponentRegistration(stateKey, fullComponentId);
    };
  }, [stateKey, componentId]);

  // Form state management
  const globalStateValue = getGlobalStore
    .getState()
    .getShadowValue(stateKeyPathKey);
  const [localValue, setLocalValue] = useState<any>(globalStateValue);
  const isCurrentlyDebouncing = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local value with global state when not debouncing
  useEffect(() => {
    if (
      !isCurrentlyDebouncing.current &&
      !isDeepEqual(globalStateValue, localValue)
    ) {
      setLocalValue(globalStateValue);
    }
  }, [globalStateValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    const unsubscribe = getGlobalStore
      .getState()
      .subscribeToPath(stateKeyPathKey, (newValue) => {
        forceUpdate({});
      });
    return () => {
      unsubscribe();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        isCurrentlyDebouncing.current = false;
      }
    };
  }, []);

  // Single debounced update function
  const debouncedUpdate = useCallback(
    (newValue: any) => {
      setLocalValue(newValue);
      isCurrentlyDebouncing.current = true;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      const debounceTime = formOpts?.debounceTime ?? 200;

      debounceTimeoutRef.current = setTimeout(() => {
        isCurrentlyDebouncing.current = false;
        setState(newValue, path, { updateType: 'update' });
      }, debounceTime);
    },
    [setState, path, formOpts?.debounceTime]
  );

  // Force immediate update (for onBlur)
  const immediateUpdate = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      isCurrentlyDebouncing.current = false;
      setState(localValue, path, { updateType: 'update' });
    }
  }, [setState, path, localValue]);

  const baseState = rebuildStateShape({
    currentState: globalStateValue,
    path: path,
    componentId: componentId,
  });

  // Extend with inputProps
  const stateWithInputProps = new Proxy(baseState, {
    get(target, prop) {
      if (prop === 'inputProps') {
        return {
          value: localValue ?? '',
          onChange: (e: any) => {
            debouncedUpdate(e.target.value);
          },
          onBlur: immediateUpdate,
          ref: formRefStore
            .getState()
            .getFormRef(stateKey + '.' + path.join('.')),
        };
      }

      return target[prop];
    },
  });

  return <>{renderFn(stateWithInputProps)}</>;
}
