"use client";

import {
  createElement,
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

import {
  debounce,
  getDifferences,
  getNestedValue,
  isFunction,
  type GenericObject,
} from "./utility.js";
import { FormControlComponent, ValidationWrapper } from "./Functions.js";
import { isDeepEqual, transformStateFunc } from "./utility.js";
import superjson from "superjson";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { formRefStore, getGlobalStore, type ComponentsType } from "./store.js";
import { useCogsConfig } from "./CogsStateClient.js";
import { applyPatch } from "fast-json-patch";
import useMeasure from "react-use-measure";

type Prettify<T> = T extends any ? { [K in keyof T]: T[K] } : never;

export type VirtualViewOptions = {
  itemHeight?: number;
  overscan?: number;
  stickToBottom?: boolean;
  dependencies?: any[];
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

export type ServerSyncStatus = {
  isFresh: boolean;
  isFreshTime: number;
  isStale: boolean;
  isStaleTime: number;
  isSyncing: boolean;
  isSyncingTime: number;
};

export type SyncInfo = {
  timeStamp: number;
  userId: number;
};

export type FormElementParams<T> = {
  get: () => T;

  set: UpdateType<T>;
  syncStatus: (SyncInfo & { date: Date }) | null;
  path: string[];
  validationErrors: () => string[];
  addValidationError: (message?: string) => void;

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
    | ((prevState: NonNullable<Prettify<U>>[]) => NonNullable<Prettify<U>>),
  opts?: UpdateOpts<U>
) => StateObject<T>;

type CutFunctionType<T> = (
  index?: number,
  options?: { waitForSync?: boolean }
) => StateObject<T>;

export type InferArrayElement<T> = T extends (infer U)[] ? U : never;
type ArraySpecificPrototypeKeys =
  | "concat"
  | "copyWithin"
  | "fill"
  | "find"
  | "findIndex"
  | "flat"
  | "flatMap"
  | "includes"
  | "indexOf"
  | "join"
  | "keys"
  | "lastIndexOf"
  | "map"
  | "pop"
  | "push"
  | "reduce"
  | "reduceRight"
  | "reverse"
  | "shift"
  | "slice"
  | "some"
  | "sort"
  | "splice"
  | "unshift"
  | "values"
  | "entries"
  | "every"
  | "filter"
  | "forEach"
  | "with";

export type ArrayEndType<TShape extends unknown> = {
  findWith: findWithFuncType<InferArrayElement<TShape>>;
  index: (index: number) => StateObject<InferArrayElement<TShape>> & {
    insert: PushArgs<InferArrayElement<TShape>, TShape>;
    cut: CutFunctionType<TShape>;
    _index: number;
  } & EndType<InferArrayElement<TShape>>;
  insert: PushArgs<InferArrayElement<TShape>, TShape>;
  cut: CutFunctionType<TShape>;
  cutByValue: (value: string | number | boolean) => void;
  toggleByValue: (value: string | number | boolean) => void;
  stateSort: (
    compareFn: (
      a: InferArrayElement<TShape>,
      b: InferArrayElement<TShape>
    ) => number
  ) => ArrayEndType<TShape>;
  useVirtualView: (
    options: VirtualViewOptions
  ) => VirtualStateObjectResult<InferArrayElement<TShape>[]>;

  stateMapNoRender: (
    callbackfn: (
      value: InferArrayElement<TShape>,
      setter: StateObject<InferArrayElement<TShape>>,
      index: number,
      array: TShape,
      arraySetter: StateObject<TShape>
    ) => void
  ) => any;
  stateList: (
    callbackfn: (
      value: InferArrayElement<TShape>,
      setter: StateObject<InferArrayElement<TShape>>,
      index: { localIndex: number; originalIndex: number },
      array: TShape,
      arraySetter: StateObject<TShape>
    ) => void
  ) => any;
  stateMap: (
    callbackfn: (
      value: InferArrayElement<TShape>,
      setter: StateObject<InferArrayElement<TShape>>,
      index: number,
      array: TShape,
      arraySetter: StateObject<TShape>
    ) => void
  ) => any;
  $stateMap: (
    callbackfn: (
      value: InferArrayElement<TShape>,
      setter: StateObject<InferArrayElement<TShape>>,
      index: number,
      array: TShape,
      arraySetter: StateObject<TShape>
    ) => void
  ) => any;
  stateFlattenOn: <K extends keyof InferArrayElement<TShape>>(
    field: K
  ) => StateObject<InferArrayElement<InferArrayElement<TShape>[K]>[]>;
  uniqueInsert: (
    payload: UpdateArg<InferArrayElement<TShape>>,
    fields?: (keyof InferArrayElement<TShape>)[],
    onMatch?: (existingItem: any) => any
  ) => void;
  stateFind: (
    callbackfn: (value: InferArrayElement<TShape>, index: number) => boolean
  ) => StateObject<InferArrayElement<TShape>> | undefined;
  stateFilter: (
    callbackfn: (value: InferArrayElement<TShape>, index: number) => void
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

export type UpdateType<T> = (
  payload: UpdateArg<T>,
  opts?: UpdateOpts<T>
) => void;

export type UpdateOpts<T> = {
  afterUpdate?: (state: T) => void;
  debounce?: number;
};
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
type EffectFunction<T, R> = (state: T) => R;
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
  _status: "fresh" | "stale" | "synced";
  getStatus: () => "fresh" | "stale";

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

export type EffectiveSetState<TStateObject> = (
  newStateOrFunction: UpdateArg<TStateObject>,
  path: string[],
  updateObj: { updateType: "update" | "insert" | "cut" },
  validationKey?: string,
  opts?: UpdateOpts<TStateObject>
) => void;

export type UpdateTypeDetail = {
  timeStamp: number;
  stateKey: string;
  updateType: "update" | "insert" | "cut";
  path: string[];
  status: "new" | "sent" | "synced";
  oldValue: any;
  newValue: any;
  userId?: number;
};

export type ActionsType<T> = {
  type: "onChange";
  action: ({ state, actionType }: { state: T; actionType: string }) => void;
  debounce?: number;
}[];

type ArrayToObject<T extends string[]> = Record<T[number], string>;
type CookieType<T> = {
  timeStamp: number;
  value: T;
  cookieName: string;
  OnUnMountCookie?: Boolean;
};
export type CogsCookiesType<T extends string[] = string[]> = CookieType<
  ArrayToObject<T>
>;
export type ReactivityUnion = "none" | "component" | "deps" | "all";
export type ReactivityType =
  | "none"
  | "component"
  | "deps"
  | "all"
  | Array<Prettify<"none" | "component" | "deps" | "all">>;

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
  enableServerState?: boolean;
  serverState?: {
    id?: string | number;
    data?: T;
    status?: "pending" | "error" | "success";
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
  enabledSync?: (state: T) => boolean;
  reactiveDeps?: (state: T) => any[] | true;
  reactiveType?: ReactivityType;
  syncUpdate?: Partial<UpdateTypeDetail>;

  initialState?: T;
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
    | "success"
    | "waiting"
    | "rolledBack"
    | "error"
    | "cancelled"
    | "failed";
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
          key == "localStorage" &&
          options[key] &&
          mergedOptions[key].key !== options[key]?.key
        ) {
          needToAdd = true;
          mergedOptions[key] = options[key];
        }
        if (
          key == "initialState" &&
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
  console.log("initialState", initialState);
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

  console.log("opt", opt, "initialOptionsPart", initialOptionsPart);
  console.log(
    "Final options check:",
    Object.keys(statePart).map((key) => ({
      key,
      options: getInitialOptions(key),
    }))
  );

  getGlobalStore.getState().setInitialStates(statePart);
  getGlobalStore.getState().setCreatedState(statePart);

  Object.keys(statePart).forEach((key) => {
    console.log("initializeShadowState", key, statePart[key]);
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
        enabledSync: options?.enabledSync,
        reactiveType: options?.reactiveType,
        reactiveDeps: options?.reactiveDeps,
        initialState: options?.initialState as any,
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
  setServerSyncActions,
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
      "saving to localstorage",
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

    const data: LocalStorageData<T> = {
      state,
      lastUpdated: Date.now(),
      lastSyncedWithServer: lastSyncedWithServer ?? existingLastSynced,
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
    console.error("Error loading from localStorage:", error);
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
  baseServerState?: T; // Add this to track what server state our changes are based on
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
        : [component.reactiveType || "component"]
      : null;
    if (!reactiveTypes?.includes("none")) {
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
        : [component.reactiveType || "component"]
      : null;

    // Skip if reactivity is disabled
    if (reactiveTypes?.includes("none")) {
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
    initialState,
    syncUpdate,
    dependencies,
    serverState,
  }: {
    stateKey?: string;
    componentId?: string;
    initialState?: TStateObject;
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
      const syncKey = `${syncUpdate.stateKey}:${syncUpdate.path.join(".")}`;
      getGlobalStore.getState().setSyncInfo(syncKey, {
        timeStamp: syncUpdate.timeStamp!,
        userId: syncUpdate.userId!,
      });
    }
  }, [syncUpdate]);
  useEffect(() => {
    // Only proceed if initialState is provided
    if (initialState) {
      setAndMergeOptions(thisKey as string, {
        initialState,
      });

      const options = latestInitialOptionsRef.current;
      const hasServerId = options?.serverState?.id !== undefined;
      const hasServerData =
        hasServerId &&
        options?.serverState?.status === "success" &&
        options?.serverState?.data;

      const currentGloballyStoredInitialState =
        getGlobalStore.getState().initialStateGlobal[thisKey];

      const initialStateChanged =
        (currentGloballyStoredInitialState &&
          !isDeepEqual(currentGloballyStoredInitialState, initialState)) ||
        !currentGloballyStoredInitialState;

      if (!initialStateChanged && !hasServerData) {
        return;
      }

      let localData = null;
      const localkey = isFunction(options?.localStorage?.key)
        ? options?.localStorage?.key(initialState)
        : options?.localStorage?.key;

      if (localkey && sessionId) {
        localData = loadFromLocalStorage(`${sessionId}-${thisKey}-${localkey}`);
      }

      let newState = initialState;
      let isFromServer = false;

      const serverTimestamp = hasServerData ? Date.now() : 0;
      const localTimestamp = localData?.lastUpdated || 0;
      const lastSyncTimestamp = localData?.lastSyncedWithServer || 0;

      if (hasServerData && serverTimestamp > localTimestamp) {
        newState = options.serverState!.data!;
        isFromServer = true;
      } else if (localData && localTimestamp > lastSyncTimestamp) {
        newState = localData.state;
        if (options?.localStorage?.onChange) {
          options?.localStorage?.onChange(newState);
        }
      }
      getGlobalStore.getState().initializeShadowState(thisKey, initialState);
      // Update the global state
      updateGlobalState(
        thisKey,
        initialState,
        newState,
        effectiveSetState,
        componentIdRef.current,
        sessionId
      );

      // Save to localStorage if we used server data
      if (isFromServer && localkey && sessionId) {
        saveToLocalStorage(newState, thisKey, options, sessionId, Date.now());
      }

      // Notify components of the change
      notifyComponents(thisKey);

      const reactiveTypes = Array.isArray(reactiveType)
        ? reactiveType
        : [reactiveType || "component"];

      if (!reactiveTypes.includes("none")) {
        forceUpdate({});
      }
    }
  }, [
    initialState,
    serverState?.status,
    serverState?.data,
    ...(dependencies || []),
  ]);
  useLayoutEffect(() => {
    if (noStateKey) {
      setAndMergeOptions(thisKey as string, {
        serverSync,
        formElements,
        initialState,
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
      reactiveType: reactiveType ?? ["component", "deps"],
      paths: new Set(),
      depsFunction: reactiveDeps || undefined,
      lastDeps: reactiveDeps
        ? reactiveDeps(getGlobalStore.getState().cogsStateStore[thisKey])
        : [],
    });

    getGlobalStore.getState().setShadowMetadata(thisKey, [], {
      ...rootMeta,
      components,
    });

    forceUpdate({});

    return () => {
      // Cleanup: remove component from shadow metadata
      const meta = getGlobalStore.getState().getShadowMetadata(thisKey, []);
      if (meta?.components) {
        meta.components.delete(componentKey);
        getGlobalStore.getState().setShadowMetadata(thisKey, [], meta);
      }
    };
  }, []);

  const effectiveSetState = (
    newStateOrFunction: UpdateArg<TStateObject>,
    path: string[],
    updateObj: { updateType: "insert" | "cut" | "update" },
    validationKey?: string
  ) => {
    const fullPath = [thisKey, ...path].join(".");
    if (Array.isArray(path)) {
      const pathKey = `${thisKey}-${path.join(".")}`;
      componentUpdatesRef.current.add(pathKey);
    }
    const store = getGlobalStore.getState();
    console.log("888888888888888888888888", path);
    setState(thisKey, (prevValue: TStateObject) => {
      const shadowMeta = store.getShadowMetadata(thisKey, path);
      const nestedShadowVlaue = store.getShadowValue(fullPath);
      const payload = isFunction<TStateObject>(newStateOrFunction)
        ? newStateOrFunction(nestedShadowVlaue)
        : newStateOrFunction;
      console.log(
        "kkkkkkkkkkkkkkkkkkkkkkkkkkkkk nestedShadowVlaue",
        nestedShadowVlaue
      );

      const timeStamp = Date.now();

      const newUpdate = {
        timeStamp,
        stateKey: thisKey,
        path,
        updateType: updateObj.updateType,
        status: "new" as const,
        oldValue: nestedShadowVlaue,
        newValue: payload,
      } satisfies UpdateTypeDetail;

      switch (updateObj.updateType) {
        case "insert": {
          store.insertShadowArrayElement(thisKey, path, newUpdate.newValue);
          break;
        }
        case "cut": {
          store.removeShadowArrayElement(thisKey, path);
          break;
        }
        case "update": {
          store.updateShadowAtPath(thisKey, path, newUpdate.newValue);
          break;
        }
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
                    "state",
                    `return (${effect})(state)`
                  )(updatedShadowValue);
                } catch (err) {
                  console.error("Error evaluating effect function:", err);
                  displayValue = updatedShadowValue;
                }
              }

              if (
                displayValue !== null &&
                displayValue !== undefined &&
                typeof displayValue === "object"
              ) {
                displayValue = JSON.stringify(displayValue);
              }

              childNodes[position].textContent = String(displayValue ?? "");
            }
          }
        });
      }
      if (updateObj.updateType === "insert") {
        // Move this to AFTER the switch statement that inserts
        const arrayMeta = store.getShadowMetadata(thisKey, path);

        if (arrayMeta?.mapWrappers && arrayMeta.mapWrappers.length > 0) {
          const updatedArray = store.getShadowValue(
            [thisKey, ...path].join(".")
          );
          const arrayKeys =
            store.getShadowMetadata(thisKey, path)?.arrayKeys || [];
          console.log(
            "arravvvvvvvvvvvvvvvvvvvssssssssssssssssssssvvvvyKeys",

            arrayKeys,
            updatedArray
          );
          // Find the new item (should be the last one after insert)
          const newIndex = arrayKeys.length - 1;
          const newItemKey = arrayKeys[newIndex]!;
          const itemId = newItemKey.split(".").pop(); // FIX: Extract just id:xxx
          const newItem = updatedArray[newIndex];

          arrayMeta.mapWrappers.forEach((wrapper) => {
            if (wrapper.containerRef && wrapper.containerRef.isConnected) {
              // Create element for new item
              const itemElement = document.createElement("div");
              itemElement.setAttribute("data-item-path", newItemKey); // Keep full key for data attr
              wrapper.containerRef.appendChild(itemElement);

              // Render the new item
              const root = createRoot(itemElement);
              const tempProxy = createProxyHandler(
                thisKey,
                effectiveSetState,
                componentId!,
                sessionId
              );
              console.log(
                "patddddddddddddddddddddddh",
                path,
                "rebuildStateShape",
                tempProxy
              );
              const rebuildStateShape = (tempProxy as any)._rebuildStateShape; //why does thgis pass the path in ntot it as ["_rebuildStateShape"]

              // Now use it
              const itemPath = newItemKey.split(".").slice(1);
              const itemSetter = rebuildStateShape(newItem, itemPath);

              const arraySetter = rebuildStateShape(updatedArray, path);

              const reactElement = wrapper.mapFn(
                newItem,
                itemSetter,
                newIndex,
                updatedArray,
                arraySetter
              );

              root.render(reactElement);
            }
          });
        }
      }

      if (updateObj.updateType === "cut") {
        // For cut, path includes the item ID like ['todoArray', 'id:xxx']
        const arrayPath = path.slice(0, -1); // Remove the item ID

        const arrayMeta = store.getShadowMetadata(thisKey, arrayPath);
        console.log(
          store.shadowStateStore,
          "999999999999999999999999999999999999999",
          thisKey,
          arrayPath
        );
        if (arrayMeta?.mapWrappers && arrayMeta.mapWrappers.length > 0) {
          arrayMeta.mapWrappers.forEach((wrapper) => {
            if (wrapper.containerRef && wrapper.containerRef.isConnected) {
              // Find and remove the element
              const fullPath = [thisKey, ...path].join(".");

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
        updateObj.updateType === "update" &&
        (validationKey || latestInitialOptionsRef.current?.validation?.key) &&
        path
      ) {
        removeValidationError(
          (validationKey || latestInitialOptionsRef.current?.validation?.key) +
            "." +
            path.join(".")
        );
      }
      const arrayWithoutIndex = path.slice(0, path.length - 1);
      if (
        updateObj.updateType === "cut" &&
        latestInitialOptionsRef.current?.validation?.key
      ) {
        removeValidationError(
          latestInitialOptionsRef.current?.validation?.key +
            "." +
            arrayWithoutIndex.join(".")
        );
      }
      if (
        updateObj.updateType === "insert" &&
        latestInitialOptionsRef.current?.validation?.key
      ) {
        const getValidation = getValidationErrors(
          latestInitialOptionsRef.current?.validation?.key +
            "." +
            arrayWithoutIndex.join(".")
        );

        getValidation.filter((k) => {
          let length = k?.split(".").length;
          const v = ""; // Placeholder as `v` is not used from getValidationErrors

          if (
            k == arrayWithoutIndex.join(".") &&
            length == arrayWithoutIndex.length - 1
          ) {
            let newKey = k + "." + arrayWithoutIndex;
            removeValidationError(k!);
            addValidationError(newKey, v!);
          }
        });
      }

      // Get the root shadow metadata where components are stored
      const shadowMetaRoort = store.getShadowMetadata(thisKey, []);
      if (shadowMetaRoort?.components) {
        const changedPaths = getDifferences(prevValue, payload);
        const changedPathsSet = new Set(changedPaths);
        const primaryPathToCheck =
          updateObj.updateType === "update"
            ? path.join(".")
            : path.slice(0, -1).join(".") || "";

        for (const [
          componentKey,
          component,
        ] of shadowMetaRoort.components.entries()) {
          let shouldUpdate = false;
          const reactiveTypes = Array.isArray(component.reactiveType)
            ? component.reactiveType
            : [component.reactiveType || "component"];

          console.log("reactiveTypes", reactiveTypes, componentKey, thisKey);

          if (reactiveTypes.includes("none")) continue;
          if (reactiveTypes.includes("all")) {
            component.forceUpdate();
            continue;
          }

          if (reactiveTypes.includes("component")) {
            if (
              component.paths.has(primaryPathToCheck) ||
              component.paths.has("")
            ) {
              shouldUpdate = true;
            }

            if (!shouldUpdate) {
              for (const changedPath of changedPathsSet) {
                let currentPathToCheck = changedPath;
                while (true) {
                  if (component.paths.has(currentPathToCheck)) {
                    shouldUpdate = true;
                    break;
                  }
                  const lastDotIndex = currentPathToCheck.lastIndexOf(".");
                  if (lastDotIndex !== -1) {
                    const parentPath = currentPathToCheck.substring(
                      0,
                      lastDotIndex
                    );
                    if (
                      !isNaN(
                        Number(currentPathToCheck.substring(lastDotIndex + 1))
                      )
                    ) {
                      if (component.paths.has(parentPath)) {
                        shouldUpdate = true;
                        break;
                      }
                    }
                    currentPathToCheck = parentPath;
                  } else {
                    currentPathToCheck = "";
                  }
                  if (currentPathToCheck === "") {
                    break;
                  }
                }
                if (shouldUpdate) break;
              }
            }
          }

          if (!shouldUpdate && reactiveTypes.includes("deps")) {
            if (component.depsFunction) {
              const fullState = store.getNestedState(thisKey, []); //onyl works 2 times
              const depsResult = component.depsFunction(fullState);
              console.log(
                "deps changed for",
                componentKey,
                component,
                "reactiveTypesssssssssssssssssssssssss1111",
                fullState,
                depsResult
              );
              let depsChanged = false;
              if (typeof depsResult === "boolean") {
                if (depsResult) depsChanged = true;
              } else if (!isDeepEqual(component.deps, depsResult)) {
                console.log(
                  "deps changed for",
                  componentKey,
                  "reactiveTypesssssssssssssssssssssssss222",
                  component.deps,
                  isDeepEqual(component.deps, depsResult)
                );
                component.deps = depsResult;
                depsChanged = true;
              }
              if (depsChanged) {
                shouldUpdate = true;
              }
            }
          }
          if (shouldUpdate) {
            component.forceUpdate();
          }
        }
      }

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
      if (latestInitialOptionsRef.current?.serverSync) {
        const serverStateStore = store.serverState[thisKey];
        const serverSync = latestInitialOptionsRef.current?.serverSync;
        setServerSyncActions(thisKey, {
          syncKey:
            typeof serverSync.syncKey == "string"
              ? serverSync.syncKey
              : serverSync.syncKey({ state: payload }),
          rollBackState: serverStateStore,
          actionTimeStamp: Date.now() + (serverSync.debounce ?? 3000),
          status: "waiting",
        });
      }

      return store.getShadowValue(thisKey);
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

type MetaData = {
  validIds?: string[];
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
  console.log("componentId", componentId);
  const invalidateCachePath = (path: string[]) => {
    const pathKey = path.join(".");
    for (const [key] of shapeCache) {
      if (key === pathKey || key.startsWith(pathKey + ".")) {
        shapeCache.delete(key);
      }
    }
    stateVersion++;
  };

  function rebuildStateShape(
    currentState: T,
    path: string[] = [],
    meta?: MetaData
  ): any {
    const cacheKey = path.map(String).join(".");
    const stateKeyPathKey = [stateKey, ...path].join(".");

    currentState = getGlobalStore
      .getState()
      .getShadowValue(stateKeyPathKey, meta?.validIds);

    type CallableStateObject<T> = {
      (): T;
    } & {
      [key: string]: any;
    };
    console.log(currentState, "currentState", stateKey, path);
    const baseFunction = function () {
      return getGlobalStore().getNestedState(stateKey, path);
    } as unknown as CallableStateObject<T>;

    // We attach baseObj properties *inside* the get trap now to avoid recursion
    // This is a placeholder for the proxy.

    const handler = {
      apply(target: any, thisArg: any, args: any[]) {
        return getGlobalStore().getNestedState(stateKey, path);
      },

      get(target: any, prop: string) {
        // V--------- THE CRUCIAL FIX IS HERE ---------V
        // This handles requests for internal functions on the proxy,
        // returning the function itself instead of treating it as state.
        if (prop === "_rebuildStateShape") {
          return rebuildStateShape;
        }
        const baseObjProps = Object.getOwnPropertyNames(baseObj);
        if (baseObjProps.includes(prop) && path.length === 0) {
          return (baseObj as any)[prop];
        }
        // ^--------- END OF FIX ---------^

        const mutationMethods = new Set([
          "insert",
          "cut",
          "cutByValue",
          "toggleByValue",
          "uniqueInsert",
          "update",
          "applyJsonPatch",
          "setSelected",
          "toggleSelected",
          "clearSelected",
          "sync",
          "validateZodSchema",
          "revertToInitialState",
          "updateInitialState",
          "removeValidation",
          "setValidation",
          "removeStorage",
          "middleware",
          "_componentId",
          "_stateKey",
          "getComponents",
        ]);

        if (
          prop !== "then" &&
          typeof prop === "string" &&
          !prop.startsWith("$") &&
          prop !== "stateMapNoRender" &&
          !mutationMethods.has(prop)
        ) {
          const fullComponentId = `${stateKey}////${componentId}`;

          const rootMeta = getGlobalStore
            .getState()
            .getShadowMetadata(stateKey, []);
          const component = rootMeta?.components?.get(fullComponentId);

          if (component) {
            const currentPath = [...path, prop].join(".");

            let needsAdd = true;
            for (const existingPath of component.paths) {
              if (
                currentPath.startsWith(existingPath) &&
                (currentPath === existingPath ||
                  currentPath[existingPath.length] === ".")
              ) {
                needsAdd = false;
                break;
              }
            }
            if (needsAdd && rootMeta) {
              component.paths.add(currentPath);
              getGlobalStore
                .getState()
                .setShadowMetadata(stateKey, [], rootMeta);
            }
          }
        }
        if (prop === "getDifferences") {
          return () =>
            getDifferences(
              getGlobalStore.getState().cogsStateStore[stateKey],
              getGlobalStore.getState().initialStateGlobal[stateKey]
            );
        }
        if (prop === "sync" && path.length === 0) {
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
                  const errorPath = [validationKey, ...error.path].join(".");
                  getGlobalStore
                    .getState()
                    .addValidationError(errorPath, error.message);
                });
                notifyComponents(stateKey);
              }

              if (response?.success && sync.onSuccess)
                sync.onSuccess(response.data);
              else if (!response?.success && sync.onError)
                sync.onError(response.error);

              return response;
            } catch (error) {
              if (sync.onError) sync.onError(error);
              return { success: false, error };
            }
          };
        }
        if (prop === "_status") {
          const thisReactiveState = getGlobalStore
            .getState()
            .getNestedState(stateKey, path);
          const initialState =
            getGlobalStore.getState().initialStateGlobal[stateKey];
          const initialStateAtPath = getNestedValue(
            initialState,
            path,
            stateKey!
          );
          return isDeepEqual(thisReactiveState, initialStateAtPath)
            ? "fresh"
            : "stale";
        }
        if (prop === "getStatus") {
          return function () {
            const thisReactiveState = getGlobalStore().getNestedState(
              stateKey,
              path
            );
            const initialState =
              getGlobalStore.getState().initialStateGlobal[stateKey];
            const initialStateAtPath = getNestedValue(
              initialState,
              path,
              stateKey!
            );
            return isDeepEqual(thisReactiveState, initialStateAtPath)
              ? "fresh"
              : "stale";
          };
        }
        if (prop === "removeStorage") {
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
        if (prop === "showValidationErrors") {
          return () => {
            const init = getGlobalStore
              .getState()
              .getInitialOptions(stateKey)?.validation;
            if (!init?.key) throw new Error("Validation key not found");
            return getGlobalStore
              .getState()
              .getValidationErrors(init.key + "." + path.join("."));
          };
        }
        if (Array.isArray(currentState)) {
          if (prop === "getSelected") {
            return () => {
              const fullKey = stateKey + "." + path.join(".");
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

              return rebuildStateShape(
                value,
                selectedItemKey.split(".").slice(1) as string[],
                meta
              );
            };
          }
          if (prop === "clearSelected") {
            return () => {
              getGlobalStore.getState().clearSelectedIndex({ stateKey, path });
            };
          }
          if (prop === "getSelectedIndex") {
            return () => {
              const selectedIndex = getGlobalStore
                .getState()
                .getSelectedIndex(
                  stateKey + "." + path.join("."),
                  meta?.validIds
                );

              return selectedIndex;
            };
          }
          if (prop === "useVirtualView") {
            return (
              options: VirtualViewOptions
            ): VirtualStateObjectResult<any[]> => {
              const {
                itemHeight = 50,
                overscan = 6,
                stickToBottom = false,
                dependencies = [],
              } = options;

              const containerRef = useRef<HTMLDivElement | null>(null);
              const [range, setRange] = useState({
                startIndex: 0,
                endIndex: 10,
              });
              const [shadowUpdateTrigger, setShadowUpdateTrigger] = useState(0);
              const wasAtBottomRef = useRef(true);
              const userHasScrolledAwayRef = useRef(false);
              const previousCountRef = useRef(0);
              const lastRangeRef = useRef(range);

              useEffect(() => {
                const unsubscribe = getGlobalStore
                  .getState()
                  .subscribeToShadowState(stateKey, () => {
                    setShadowUpdateTrigger((prev) => prev + 1);
                  });
                return unsubscribe;
              }, [stateKey]);

              const sourceArray = getGlobalStore().getNestedState(
                stateKey,
                path
              ) as any[];
              const totalCount = sourceArray.length;

              const { totalHeight, positions } = useMemo(() => {
                const arrayMeta = getGlobalStore
                  .getState()
                  .getShadowMetadata(stateKey, path);
                const orderedIds = arrayMeta?.arrayKeys || [];
                let height = 0;
                const pos: number[] = [];
                for (let i = 0; i < totalCount; i++) {
                  pos[i] = height;
                  const itemId = orderedIds[i];
                  let measuredHeight = itemHeight;
                  if (itemId) {
                    const itemMeta = getGlobalStore
                      .getState()
                      .getShadowMetadata(stateKey, [...path, itemId]);
                    measuredHeight =
                      itemMeta?.virtualizer?.itemHeight || itemHeight;
                  }
                  height += measuredHeight;
                }
                return { totalHeight: height, positions: pos };
              }, [
                totalCount,
                stateKey,
                path.join("."),
                itemHeight,
                shadowUpdateTrigger,
              ]);

              const virtualState = useMemo(() => {
                const start = Math.max(0, range.startIndex);
                const end = Math.min(totalCount, range.endIndex);

                const arrayMeta = getGlobalStore
                  .getState()
                  .getShadowMetadata(stateKey, path);
                const orderedIds = arrayMeta?.arrayKeys || [];

                const slicedArray = sourceArray.slice(start, end);
                const slicedIds = orderedIds.slice(start, end);

                return rebuildStateShape(slicedArray as any, path, {
                  ...meta,
                  validIds: slicedIds,
                });
              }, [range.startIndex, range.endIndex, sourceArray, totalCount]);

              const scrollToLastItem = useCallback(() => {
                const shadowArray = getGlobalStore
                  .getState()
                  .getShadowMetadata(stateKey, path);
                if (
                  !shadowArray ||
                  (shadowArray && shadowArray?.arrayKeys?.length === 0)
                ) {
                  return false;
                }
                const lastIndex = totalCount - 1;
                const lastKkey = [...path, shadowArray.arrayKeys![lastIndex]!];
                if (lastIndex >= 0) {
                  const lastItemData = getGlobalStore
                    .getState()
                    .getShadowMetadata(stateKey, lastKkey);
                  if (lastItemData?.virtualizer?.domRef) {
                    const element = lastItemData.virtualizer.domRef;
                    if (element && element.scrollIntoView) {
                      element.scrollIntoView({
                        behavior: "auto",
                        block: "end",
                        inline: "nearest",
                      });
                      return true;
                    }
                  }
                }
                return false;
              }, [stateKey, path, totalCount]);

              useEffect(() => {
                if (!stickToBottom || totalCount === 0) return;

                const hasNewItems = totalCount > previousCountRef.current;
                const isInitialLoad =
                  previousCountRef.current === 0 && totalCount > 0;

                if (
                  (hasNewItems || isInitialLoad) &&
                  wasAtBottomRef.current &&
                  !userHasScrolledAwayRef.current
                ) {
                  const visibleCount = Math.ceil(
                    (containerRef.current?.clientHeight || 0) / itemHeight
                  );
                  const newRange = {
                    startIndex: Math.max(
                      0,
                      totalCount - visibleCount - overscan
                    ),
                    endIndex: totalCount,
                  };

                  setRange(newRange);

                  const timeoutId = setTimeout(() => {
                    scrollToIndex(totalCount - 1, "smooth");
                  }, 50);
                  return () => clearTimeout(timeoutId);
                }

                previousCountRef.current = totalCount;
              }, [totalCount, itemHeight, overscan]);

              useEffect(() => {
                const container = containerRef.current;
                if (!container) return;

                const handleScroll = () => {
                  const { scrollTop, scrollHeight, clientHeight } = container;
                  const distanceFromBottom =
                    scrollHeight - scrollTop - clientHeight;

                  wasAtBottomRef.current = distanceFromBottom < 5;

                  if (distanceFromBottom > 100) {
                    userHasScrolledAwayRef.current = true;
                  }

                  if (distanceFromBottom < 5) {
                    userHasScrolledAwayRef.current = false;
                  }

                  let startIndex = 0;
                  for (let i = 0; i < positions.length; i++) {
                    if (positions[i]! > scrollTop - itemHeight * overscan) {
                      startIndex = Math.max(0, i - 1);
                      break;
                    }
                  }

                  let endIndex = startIndex;
                  const viewportEnd = scrollTop + clientHeight;
                  for (let i = startIndex; i < positions.length; i++) {
                    if (positions[i]! > viewportEnd + itemHeight * overscan) {
                      break;
                    }
                    endIndex = i;
                  }

                  const newStartIndex = Math.max(0, startIndex);
                  const newEndIndex = Math.min(
                    totalCount,
                    endIndex + 1 + overscan
                  );

                  if (
                    newStartIndex !== lastRangeRef.current.startIndex ||
                    newEndIndex !== lastRangeRef.current.endIndex
                  ) {
                    lastRangeRef.current = {
                      startIndex: newStartIndex,
                      endIndex: newEndIndex,
                    };
                    setRange({
                      startIndex: newStartIndex,
                      endIndex: newEndIndex,
                    });
                  }
                };

                container.addEventListener("scroll", handleScroll, {
                  passive: true,
                });

                if (
                  stickToBottom &&
                  totalCount > 0 &&
                  !userHasScrolledAwayRef.current
                ) {
                  const { scrollTop } = container;
                  if (scrollTop === 0) {
                    container.scrollTop = container.scrollHeight;
                    wasAtBottomRef.current = true;
                  }
                }

                handleScroll();

                return () => {
                  container.removeEventListener("scroll", handleScroll);
                };
              }, [positions, totalCount, itemHeight, overscan, stickToBottom]);

              const scrollToBottom = useCallback(() => {
                wasAtBottomRef.current = true;
                userHasScrolledAwayRef.current = false;
                const scrolled = scrollToLastItem();
                if (!scrolled && containerRef.current) {
                  containerRef.current.scrollTop =
                    containerRef.current.scrollHeight;
                }
              }, [scrollToLastItem]);

              const scrollToIndex = useCallback(
                (index: number, behavior: ScrollBehavior = "smooth") => {
                  const container = containerRef.current;
                  if (!container) return;

                  const isLastItem = index === totalCount - 1;

                  if (isLastItem) {
                    container.scrollTo({
                      top: container.scrollHeight,
                      behavior: behavior,
                    });
                    return;
                  }

                  const arrayMeta = getGlobalStore
                    .getState()
                    .getShadowMetadata(stateKey, path);
                  const orderedIds = arrayMeta?.arrayKeys || [];
                  const itemId = orderedIds[index];
                  let element: HTMLElement | null | undefined = undefined;

                  if (itemId) {
                    const itemMeta = getGlobalStore
                      .getState()
                      .getShadowMetadata(stateKey, [...path, itemId]);
                    element = itemMeta?.virtualizer?.domRef;
                  }

                  if (element) {
                    element.scrollIntoView({
                      behavior: behavior,
                      block: "center",
                    });
                  } else if (positions[index] !== undefined) {
                    container.scrollTo({
                      top: positions[index],
                      behavior,
                    });
                  }
                },
                [positions, stateKey, path, totalCount]
              );

              const virtualizerProps = {
                outer: {
                  ref: containerRef,
                  style: { overflowY: "auto" as const, height: "100%" },
                },
                inner: {
                  style: {
                    height: `${totalHeight}px`,
                    position: "relative" as const,
                  },
                },
                list: {
                  style: {
                    transform: `translateY(${positions[range.startIndex] || 0}px)`,
                  },
                },
              };

              return {
                virtualState,
                virtualizerProps,
                scrollToBottom,
                scrollToIndex,
              };
            };
          }

          if (prop === "stateMap") {
            return (
              callbackfn: (
                value: any,
                setter: any,
                index: number,
                array: any,
                arraySetter: any
              ) => void
            ) => {
              const arrayKeys =
                meta?.validIds ??
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys;

              const shadowValue = getGlobalStore().getShadowValue(
                stateKeyPathKey,
                meta?.validIds
              ) as any[];
              if (!arrayKeys) {
                throw new Error("No array keys found for mapping");
              }
              const arraySetter = rebuildStateShape(
                shadowValue as any,
                path,
                meta
              );

              return shadowValue.map((item, index) => {
                const itemPath = arrayKeys[index]?.split(".").slice(1);
                const itemSetter = rebuildStateShape(
                  item,
                  itemPath as any,
                  meta
                );

                return callbackfn(
                  item,
                  itemSetter,
                  index,
                  shadowValue,
                  arraySetter
                );
              });
            };
          }
          if (prop === "stateMapNoRender") {
            return (
              callbackfn: (
                value: any,
                setter: any,
                index: number,
                array: any,
                arraySetter: any
              ) => void
            ) => {
              const arrayToMap = currentState as any[];
              const itemIdsForCurrentArray = meta?.validIds || [];
              const arraySetter = rebuildStateShape(currentState, path, meta);

              return arrayToMap.map((item, index) => {
                const itemId = itemIdsForCurrentArray[index] || `id:${item.id}`;
                const finalPath = [...path, itemId];
                const setter = rebuildStateShape(item, finalPath, meta);
                return callbackfn(
                  item,
                  setter,
                  index,
                  currentState,
                  arraySetter
                );
              });
            };
          }
          if (prop === "$stateMap") {
            return (callbackfn: any) =>
              createElement(SignalMapRenderer, {
                proxy: { _stateKey: stateKey, _path: path, _mapFn: callbackfn },
                rebuildStateShape,
              });
          }
          if (prop === "stateList") {
            return (
              callbackfn: (
                value: any,
                setter: any,
                index: { localIndex: number; originalIndex: number },
                array: any,
                arraySetter: any
              ) => ReactNode
            ) => {
              const arrayToMap = getGlobalStore().getShadowValue(
                stateKeyPathKey,
                meta?.validIds
              ) as any[];
              if (!Array.isArray(arrayToMap)) {
                return null;
              }

              const itemKeysForCurrentView =
                meta?.validIds ||
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys ||
                [];

              const sourceItemKeys =
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys || [];

              const arraySetter = rebuildStateShape(
                arrayToMap as any,
                path,
                meta
              );

              return arrayToMap.map((item, localIndex) => {
                const itemKey = itemKeysForCurrentView[localIndex];

                if (!itemKey) {
                  return null;
                }

                const itemPath = itemKey.split(".").slice(1);
                const setter = rebuildStateShape(item, itemPath, meta);

                const originalIndex = sourceItemKeys.indexOf(itemKey);
                const itemComponentId = `${componentId}-${itemKey}`;

                return createElement(CogsItemWrapper, {
                  key: itemKey,
                  stateKey,
                  itemComponentId,
                  itemPath: itemPath,
                  children: callbackfn(
                    item,
                    setter,
                    { localIndex, originalIndex },
                    arrayToMap,
                    arraySetter
                  ),
                });
              });
            };
          }
          if (prop === "stateFlattenOn") {
            return (fieldName: string) => {
              const arrayToMap = currentState as any[];
              shapeCache.clear();
              stateVersion++;
              const flattenedResults = arrayToMap.flatMap(
                (val: any) => val[fieldName] ?? []
              );
              return rebuildStateShape(
                flattenedResults as any,
                [...path, "[*]", fieldName],
                meta
              );
            };
          }
          if (prop === "index") {
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
              const state = rebuildStateShape(
                value,
                itemId.split(".").slice(1) as string[],
                meta
              );
              return state;
            };
          }
          if (prop === "last") {
            return () => {
              const currentArray = getGlobalStore
                .getState()
                .getNestedState(stateKey, path) as any[];
              if (currentArray.length === 0) return undefined;
              const lastIndex = currentArray.length - 1;
              const lastValue = currentArray[lastIndex];
              const newPath = [...path, lastIndex.toString()];
              return rebuildStateShape(lastValue, newPath);
            };
          }
          if (prop === "insert") {
            return (payload: UpdateArg<T>, index?: number) => {
              invalidateCachePath(path);
              effectiveSetState(payload, path, { updateType: "insert" });
              return rebuildStateShape(
                getGlobalStore.getState().getNestedState(stateKey, path),
                path
              );
            };
          }
          if (prop === "uniqueInsert") {
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
                effectiveSetState(newValue, path, { updateType: "insert" });
              } else if (onMatch && matchedItem) {
                const updatedItem = onMatch(matchedItem);
                const updatedArray = currentArray.map((item) =>
                  isDeepEqual(item, matchedItem) ? updatedItem : item
                );
                invalidateCachePath(path);
                effectiveSetState(updatedArray as any, path, {
                  updateType: "update",
                });
              }
            };
          }
          if (prop === "cut") {
            const lastPathElement = path[path.length - 1];
            if (lastPathElement?.startsWith("id:")) {
              return () => {
                const parentPath = path.slice(0, -1);
                invalidateCachePath(path);
                effectiveSetState(currentState, parentPath, {
                  updateType: "cut",
                });
              };
            }
          }
          if (prop === "cutByValue") {
            return (value: string | number | boolean) => {
              const index = getGlobalStore
                .getState()
                .getShadowValue(stateKeyPathKey)
                .findIndex((item: any) => item === value);
              if (index > -1)
                effectiveSetState(value as any, path, { updateType: "cut" });
            };
          }
          if (prop === "toggleByValue") {
            return (value: string | number | boolean) => {
              const index = getGlobalStore
                .getState()
                .getShadowValue(stateKeyPathKey)
                .findIndex((item: any) => item === value);
              if (index > -1) {
                effectiveSetState(value as any, path, { updateType: "cut" });
              } else {
                effectiveSetState(value as any, path, { updateType: "insert" });
              }
            };
          }
          if (prop === "stateFilter") {
            return (callbackfn: (value: any, index: number) => boolean) => {
              const arrayKeys =
                meta?.validIds ??
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys;

              if (!arrayKeys) {
                throw new Error("No array keys found for filtering.");
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

              return rebuildStateShape(filteredArray as any, path, {
                validIds: newValidIds,
              });
            };
          }
          if (prop === "stateSort") {
            return (compareFn: (a: any, b: any) => number) => {
              const arrayKeys =
                meta?.validIds ??
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys;
              if (!arrayKeys) {
                throw new Error("No array keys found for sorting");
              }
              const itemsWithIds = currentState.map((item, index) => ({
                item,
                key: arrayKeys[index],
              }));

              itemsWithIds
                .sort((a, b) => compareFn(a.item, b.item))
                .filter(Boolean);

              return rebuildStateShape(
                itemsWithIds.map((i) => i.item) as any,
                path,
                { validIds: itemsWithIds.map((i) => i.key) as string[] }
              );
            };
          }

          if (prop === "findWith") {
            return (
              searchKey: keyof InferArrayElement<T>,
              searchValue: any
            ) => {
              const arrayKeys = getGlobalStore
                .getState()
                .getShadowMetadata(stateKey, path)?.arrayKeys;

              if (!arrayKeys) {
                throw new Error("No array keys found for sorting");
              }

              let value = null;
              let foundPath: string[] = [];

              for (const fullPath of arrayKeys) {
                let shadowValue = getGlobalStore
                  .getState()
                  .getShadowValue(fullPath, meta?.validIds);
                if (shadowValue && shadowValue[searchKey] === searchValue) {
                  value = shadowValue;
                  foundPath = fullPath.split(".").slice(1);
                  break;
                }
              }

              return rebuildStateShape(value as any, foundPath, meta);
            };
          }
        }
        const lastPathElement = path[path.length - 1];
        if (
          prop === "cut" &&
          typeof lastPathElement === "string" &&
          lastPathElement.startsWith("id:")
        ) {
          let shadowValue = getGlobalStore
            .getState()
            .getShadowValue(path.join("."));

          return () => {
            effectiveSetState(shadowValue, path, { updateType: "cut" });
          };
        }

        if (prop === "get") {
          return () => {
            return getGlobalStore
              .getState()
              .getShadowValue(stateKeyPathKey, meta?.validIds);
          };
        }
        if (prop === "$derive") {
          return (fn: any) =>
            $cogsSignal({
              _stateKey: stateKey,
              _path: path,
              _effect: fn.toString(),
              _meta: meta,
            });
        }
        if (prop === "$get") {
          return () =>
            $cogsSignal({ _stateKey: stateKey, _path: path, _meta: meta });
        }
        if (prop === "lastSynced") {
          const syncKey = `${stateKey}:${path.join(".")}`;
          return getGlobalStore.getState().getSyncInfo(syncKey);
        }
        if (prop == "getLocalStorage") {
          return (key: string) =>
            loadFromLocalStorage(sessionId + "-" + stateKey + "-" + key);
        }
        if (prop === "_selected") {
          const parentPath = path.slice(0, -1);
          if (
            Array.isArray(
              getGlobalStore.getState().getNestedState(stateKey, parentPath)
            )
          ) {
            const itemId = path[path.length - 1];
            const fullParentKey = stateKey + "." + parentPath.join(".");
            const selectedItemKey = getGlobalStore
              .getState()
              .selectedIndicesMap.get(fullParentKey);
            const fullItemKey = stateKey + "." + path.join(".");
            return selectedItemKey === fullItemKey;
          }
          return undefined;
        }
        if (prop === "setSelected") {
          return (value: boolean) => {
            const parentPath = path.slice(0, -1);
            const parentKey = parentPath.join(".");
            const fullParentKey = stateKey + "." + parentKey;
            const fullItemKey = stateKey + "." + path.join(".");

            if (value) {
              getGlobalStore
                .getState()
                .setSelectedIndex(fullParentKey, fullItemKey);
            } else {
              getGlobalStore
                .getState()
                .clearSelectedIndex({ stateKey, path: parentPath });
            }
          };
        }
        if (prop === "toggleSelected") {
          return () => {
            const parentPath = path.slice(0, -1);
            const parentKey = parentPath.join(".");
            const fullParentKey = stateKey + "." + parentKey;
            const fullItemKey = stateKey + "." + path.join(".");

            const currentSelected = getGlobalStore
              .getState()
              .selectedIndicesMap.get(fullParentKey);

            if (currentSelected === fullItemKey) {
              getGlobalStore
                .getState()
                .clearSelectedIndex({ stateKey, path: parentPath });
            } else {
              getGlobalStore
                .getState()
                .setSelectedIndex(fullParentKey, fullItemKey);
            }
          };
        }
        if (path.length == 0) {
          if (prop === "addValidation") {
            return (errors: ValidationError[]) => {
              const init = getGlobalStore
                .getState()
                .getInitialOptions(stateKey)?.validation;
              if (!init?.key) throw new Error("Validation key not found");
              removeValidationError(init.key);
              errors.forEach((error) => {
                const fullErrorPath = [init.key, ...error.path].join(".");
                addValidationError(fullErrorPath, error.message);
              });
              notifyComponents(stateKey);
            };
          }
          if (prop === "applyJsonPatch") {
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
          if (prop === "validateZodSchema") {
            return () => {
              const init = getGlobalStore
                .getState()
                .getInitialOptions(stateKey)?.validation;
              if (!init?.zodSchema || !init?.key)
                throw new Error("Zod schema or validation key not found");

              removeValidationError(init.key);
              const thisObject =
                getGlobalStore.getState().cogsStateStore[stateKey];
              const result = init.zodSchema.safeParse(thisObject);

              if (!result.success) {
                result.error.errors.forEach((error) => {
                  const fullErrorPath = [init.key, ...error.path].join(".");
                  addValidationError(fullErrorPath, error.message);
                });
                notifyComponents(stateKey);
                return false;
              }
              return true;
            };
          }

          if (prop === "_componentId") return componentId;
          if (prop === "getComponents")
            return () => getGlobalStore().stateComponents.get(stateKey);
          if (prop === "getAllFormRefs")
            return () =>
              formRefStore.getState().getFormRefsByStateKey(stateKey);
        }
        if (prop === "getFormRef") {
          return () =>
            formRefStore.getState().getFormRef(stateKey + "." + path.join("."));
        }
        if (prop === "validationWrapper") {
          return ({
            children,
            hideMessage,
          }: {
            children: React.ReactNode;
            hideMessage?: boolean;
          }) => (
            <ValidationWrapper
              formOpts={
                hideMessage ? { validation: { message: "" } } : undefined
              }
              path={path}
              stateKey={stateKey}
            >
              {children}
            </ValidationWrapper>
          );
        }
        if (prop === "_stateKey") return stateKey;
        if (prop === "_path") return path;
        if (prop === "update") {
          return (payload: UpdateArg<T>, opts?: UpdateOpts<T>) => {
            effectiveSetState(payload as any, path, { updateType: "update" });
            invalidateCachePath(path);
          };
        }
        if (prop === "formElement") {
          return (child: FormControl<T>, formOpts?: FormOptsType) => (
            <FormControlComponent<T>
              setState={effectiveSetState}
              stateKey={stateKey}
              path={path}
              child={child}
              formOpts={formOpts}
            />
          );
        }

        const nextPath = [...path, prop];
        const nextValue = getGlobalStore
          .getState()
          .getNestedState(stateKey, nextPath);
        return rebuildStateShape(nextValue, nextPath, meta);
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

      const initialState =
        getGlobalStore.getState().initialStateGlobal[stateKey];

      getGlobalStore.getState().clearSelectedIndexesForState(stateKey);
      shapeCache.clear();
      stateVersion++;
      getGlobalStore.getState().initializeShadowState(stateKey, initialState);
      const newProxy = rebuildStateShape(initialState, []);
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

  return rebuildStateShape(
    getGlobalStore.getState().getNestedState(stateKey, [])
  );
}

export function $cogsSignal(proxy: {
  _path: string[];
  _stateKey: string;
  _effect?: string;

  _meta?: MetaData;
}) {
  return createElement(SignalRenderer, { proxy });
}

import { createRoot } from "react-dom/client";

function SignalMapRenderer({
  proxy,
  rebuildStateShape,
}: {
  proxy: {
    _stateKey: string;
    _path: string[];
    _meta?: MetaData;
    _mapFn: (
      value: any,
      setter: any,
      index: number,
      array: any[],
      arraySetter: any
    ) => ReactNode;
  };
  rebuildStateShape: (
    currentState: any,
    path: string[],
    meta?: MetaData
  ) => any;
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
        [proxy._stateKey, ...proxy._path].join("."),
        proxy._meta?.validIds
      ) as any[];

    if (!Array.isArray(value)) return;

    const arrayMeta = getGlobalStore
      .getState()
      .getShadowMetadata(proxy._stateKey, proxy._path);
    const arrayKeys = arrayMeta?.arrayKeys || [];

    value.forEach((item, index) => {
      const itemKey = arrayKeys[index]!;

      const itemElement = document.createElement("div");

      itemElement.setAttribute("data-item-path", itemKey);

      container.appendChild(itemElement);

      const root = createRoot(itemElement);
      rootsMapRef.current.set(itemKey, root);

      const itemSetter = rebuildStateShape(
        item,
        itemKey.split(".").slice(1) as string[],
        proxy._meta
      );
      const arraySetter = rebuildStateShape(
        value,
        [proxy._stateKey, ...proxy._path],
        proxy._meta
      );
      console.log(
        "valuevaluevaluevaluevaluevaluevaluevaluevalue",
        arraySetter.get(),
        Array.isArray(value),
        proxy._path,
        [proxy._stateKey, ...proxy._path].join(".")
      );
      const reactElement = proxy._mapFn(
        item,
        itemSetter,
        index,
        value,
        arraySetter
      );

      root.render(reactElement);
    });
  };

  return <div ref={containerRef} data-map-container={instanceIdRef.current} />;
}

// Helper to render React element to actual DOM
function renderReactElementToDOM(
  reactElement: ReactNode,
  targetElement: HTMLElement
) {
  // This is the tricky part - you need to convert JSX to actual DOM
  // For now, use ReactDOM.render or a similar approach
  // This is where the magic happens to bypass React's reconciliation
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
  const signalId = `${proxy._stateKey}-${proxy._path.join(".")}`;
  const value = getGlobalStore
    .getState()
    .getShadowValue(
      [proxy._stateKey, ...proxy._path].join("."),
      proxy._meta?.validIds
    );

  // Setup effect - runs only once
  useEffect(() => {
    const element = elementRef.current;
    if (!element || isSetupRef.current) return;

    const timeoutId = setTimeout(() => {
      if (!element.parentElement) {
        console.warn("Parent element not found for signal", signalId);
        return;
      }

      const parentElement = element.parentElement;
      const childNodes = Array.from(parentElement.childNodes);
      const position = childNodes.indexOf(element);

      let parentId = parentElement.getAttribute("data-parent-id");
      if (!parentId) {
        parentId = `parent-${crypto.randomUUID()}`;
        parentElement.setAttribute("data-parent-id", parentId);
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
            "state",
            `return (${proxy._effect})(state)`
          )(value);
        } catch (err) {
          console.error("Error evaluating effect function:", err);
        }
      }

      if (displayValue !== null && typeof displayValue === "object") {
        displayValue = JSON.stringify(displayValue);
      }

      const textNode = document.createTextNode(String(displayValue));
      element.replaceWith(textNode);
      isSetupRef.current = true;
    }, 0);

    // Cleanup only on unmount
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
  }, []); // Empty deps - only run once

  return createElement("span", {
    ref: elementRef,
    style: { display: "contents" },
    "data-signal-id": signalId,
  });
}

function CogsItemWrapper({
  stateKey,
  itemComponentId,
  itemPath,
  children,
}: {
  stateKey: string;
  itemComponentId: string;
  itemPath: string[];
  formOpts?: FormOptsType;
  children: React.ReactNode;
}) {
  const [, forceUpdate] = useState({});
  const [measureRef, bounds] = useMeasure();
  const elementRef = useRef<HTMLDivElement | null>(null);
  const lastReportedHeight = useRef<number | null>(null);

  const setRefs = useCallback(
    (element: HTMLDivElement | null) => {
      measureRef(element);
      elementRef.current = element;
    },
    [measureRef]
  );

  useEffect(() => {
    if (bounds.height > 0 && bounds.height !== lastReportedHeight.current) {
      lastReportedHeight.current = bounds.height;
      getGlobalStore.getState().setShadowMetadata(stateKey, itemPath, {
        virtualizer: { itemHeight: bounds.height, domRef: elementRef.current },
      });
    }
  }, [bounds.height, stateKey, itemPath]);

  useLayoutEffect(() => {
    const fullComponentId = `${stateKey}////${itemComponentId}`;
    const stateEntry = getGlobalStore
      .getState()
      .getShadowMetadata(stateKey, []);
    stateEntry?.components?.set(fullComponentId, {
      forceUpdate: () => forceUpdate({}),
      paths: new Set([itemPath.join(".")]),
      reactiveType: ["component"],
    });

    return () => {
      const stateEntry = getGlobalStore
        .getState()
        .getShadowMetadata(stateKey, []);
      if (stateEntry) stateEntry?.components?.delete(fullComponentId);
    };
  }, [stateKey, itemComponentId, itemPath.join(".")]);

  return <div ref={setRefs}>{children}</div>;
}
