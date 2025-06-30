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
import {
  cutFunc,
  FormControlComponent,
  pushFunc,
  updateFn,
  ValidationWrapper,
} from "./Functions.js";
import { isDeepEqual, transformStateFunc } from "./utility.js";
import superjson from "superjson";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { formRefStore, getGlobalStore, type ComponentsType } from "./store.js";
import { useCogsConfig } from "./CogsStateClient.js";
import { applyPatch } from "fast-json-patch";
import useMeasure from "react-use-measure";
import { ulid } from "ulid";

type Prettify<T> = { [K in keyof T]: T[K] } & {};

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
export type ReactivityType = "none" | "component" | "deps" | "all";

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
  reactiveType?: ReactivityType[] | ReactivityType;
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

  // Extract state parts and options using transformStateFunc
  const [statePart, initialOptionsPart] =
    transformStateFunc<State>(newInitialState);

  // Apply global formElements as defaults to each state key's options
  if (
    Object.keys(initialOptionsPart).length > 0 ||
    (opt && Object.keys(opt).length > 0)
  ) {
    Object.keys(initialOptionsPart).forEach((key) => {
      // Get the existing options for this state key
      initialOptionsPart[key] = initialOptionsPart[key] || {};

      initialOptionsPart[key].formElements = {
        ...opt?.formElements, // Global defaults first
        ...opt?.validation,
        ...(initialOptionsPart[key].formElements || {}), // State-specific overrides
      };
      const existingOptions = getInitialOptions(key);

      if (!existingOptions) {
        getGlobalStore
          .getState()
          .setInitialStateOptions(key, initialOptionsPart[key]);
      }
    });
  }

  getGlobalStore.getState().setInitialStates(statePart);
  getGlobalStore.getState().setCreatedState(statePart);
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
  const stateEntry = getGlobalStore.getState().stateComponents.get(thisKey);
  if (!stateEntry) return;

  // Batch component updates
  const updates = new Set<() => void>();
  stateEntry.components.forEach((component) => {
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
  const stateEntry = getGlobalStore.getState().stateComponents.get(stateKey);
  if (stateEntry) {
    const fullComponentId = `${stateKey}////${componentId}`;
    const component = stateEntry.components.get(fullComponentId);
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
const getUpdateValues = (
  updateType: string,
  prevValue: any,
  payload: any,
  path: string[]
) => {
  switch (updateType) {
    case "update":
      return {
        oldValue: getNestedValue(prevValue, path),
        newValue: getNestedValue(payload, path),
      };
    case "insert":
      return {
        oldValue: null, // or undefined
        newValue: getNestedValue(payload, path),
      };
    case "cut":
      return {
        oldValue: getNestedValue(prevValue, path),
        newValue: null, // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
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
    const stateEntry = getGlobalStore
      .getState()
      .stateComponents.get(thisKey) || {
      components: new Map(),
    };

    stateEntry.components.set(componentKey, {
      forceUpdate: () => forceUpdate({}),
      paths: new Set(),
      deps: [],
      depsFunction: reactiveDeps || undefined,
      reactiveType: reactiveType ?? ["component", "deps"],
    });

    getGlobalStore.getState().stateComponents.set(thisKey, stateEntry);
    //need to force update to create the stateUpdates references
    forceUpdate({});
    return () => {
      if (stateEntry) {
        stateEntry.components.delete(componentKey);
        if (stateEntry.components.size === 0) {
          getGlobalStore.getState().stateComponents.delete(thisKey);
        }
      }
    };
  }, []);

  const effectiveSetState = (
    newStateOrFunction: UpdateArg<TStateObject>,
    path: string[],
    updateObj: { updateType: "insert" | "cut" | "update" },
    validationKey?: string
  ) => {
    if (Array.isArray(path)) {
      const pathKey = `${thisKey}-${path.join(".")}`;
      componentUpdatesRef.current.add(pathKey);
    }
    const store = getGlobalStore.getState();

    setState(thisKey, (prevValue: TStateObject) => {
      const payload = isFunction<TStateObject>(newStateOrFunction)
        ? newStateOrFunction(prevValue as TStateObject)
        : newStateOrFunction;

      const signalId = `${thisKey}-${path.join(".")}`;
      if (signalId) {
        let isArrayOperation = false;
        let elements = store.signalDomElements.get(signalId);

        if (
          (!elements || elements.size === 0) &&
          (updateObj.updateType === "insert" || updateObj.updateType === "cut")
        ) {
          // Remove last segment (index) from path
          const arrayPath = path.slice(0, -1);
          const arrayValue = getNestedValue(payload, arrayPath);
          // If it's an array, use that path for signal
          if (Array.isArray(arrayValue)) {
            isArrayOperation = true;
            const arraySignalId = `${thisKey}-${arrayPath.join(".")}`;
            elements = store.signalDomElements.get(arraySignalId);
          }
        }

        if (elements) {
          const newValue = isArrayOperation
            ? getNestedValue(payload, path.slice(0, -1))
            : getNestedValue(payload, path);
          elements.forEach(({ parentId, position, effect }) => {
            const parent = document.querySelector(
              `[data-parent-id="${parentId}"]`
            );
            if (parent) {
              const childNodes = Array.from(parent.childNodes);
              if (childNodes[position]) {
                const displayValue = effect
                  ? new Function("state", `return (${effect})(state)`)(newValue)
                  : newValue;
                childNodes[position].textContent = String(displayValue);
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

      const stateEntry = store.stateComponents.get(thisKey);
      if (stateEntry) {
        const changedPaths = getDifferences(prevValue, payload);
        const changedPathsSet = new Set(changedPaths);
        const primaryPathToCheck =
          updateObj.updateType === "update"
            ? path.join(".")
            : path.slice(0, -1).join(".") || "";

        for (const [
          componentKey,
          component,
        ] of stateEntry.components.entries()) {
          let shouldUpdate = false;
          const reactiveTypes = Array.isArray(component.reactiveType)
            ? component.reactiveType
            : [component.reactiveType || "component"];

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
              const depsResult = component.depsFunction(payload);
              let depsChanged = false;
              if (typeof depsResult === "boolean") {
                if (depsResult) depsChanged = true;
              } else if (!isDeepEqual(component.deps, depsResult)) {
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
      const timeStamp = Date.now();

      let { oldValue, newValue } = getUpdateValues(
        updateObj.updateType,
        prevValue,
        payload,
        path
      );
      const newUpdate = {
        timeStamp,
        stateKey: thisKey,
        path,
        updateType: updateObj.updateType,
        status: "new" as const,
        oldValue,
        newValue,
      } satisfies UpdateTypeDetail;

      switch (updateObj.updateType) {
        case "insert": {
          const parentPath = path.slice(0, -1);
          const idSegment = path[path.length - 1]!; // e.g., 'id:xyz'
          const targetId = idSegment.split(":")[1];
          const newArray = getNestedValue(payload, parentPath);

          newValue = newArray.find((item: any) => item.id == targetId);
          oldValue = null;

          store.insertShadowArrayElement(thisKey, parentPath, newValue);
          break;
        }

        case "cut": {
          oldValue = getNestedValue(prevValue, path);
          newValue = null;

          store.removeShadowArrayElement(thisKey, path);
          break;
        }

        case "update": {
          oldValue = getNestedValue(prevValue, path);
          newValue = getNestedValue(payload, path);

          const shadowPath = path.map((p, i) => {
            const currentSubPath = path.slice(0, i + 1);
            const subValue = getNestedValue(payload, currentSubPath);
            return subValue?.id ? `id:${subValue.id}` : p;
          });
          store.updateShadowAtPath(thisKey, shadowPath, newValue);
          break;
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

      return payload;
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
    const pathKey = path.join(".");
    for (const [key] of shapeCache) {
      if (key === pathKey || key.startsWith(pathKey + ".")) {
        shapeCache.delete(key);
      }
    }
    stateVersion++;
  };

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
        removeValidationError(init?.key);
      }

      if (obj?.validationKey) {
        removeValidationError(obj.validationKey);
      }

      const initialState =
        getGlobalStore.getState().initialStateGlobal[stateKey];
      getGlobalStore.getState().initializeShadowState(stateKey, initialState);
      getGlobalStore.getState().clearSelectedIndexesForState(stateKey);
      shapeCache.clear();
      stateVersion++;

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
        .stateComponents.get(stateKey);
      if (stateEntry) {
        stateEntry.components.forEach((component) => {
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
          .stateComponents.get(stateKey);

        if (stateEntry) {
          stateEntry.components.forEach((component) => {
            component.forceUpdate();
          });
        }
      });

      return {
        fetchId: (field: keyof T) => newUpdaterState.get()[field],
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

  function getOrderedIds(arrayPath: string[]): string[] | null {
    const arrayKey = [stateKey, ...arrayPath].join(".");
    const arrayMeta = getGlobalStore.getState().shadowStateStore.get(arrayKey);
    return arrayMeta?.arrayKeys || null;
  }

  function rebuildStateShape(
    currentState: T,
    path: string[] = [],
    meta?: {
      validIds?: string[];
    }
  ): any {
    const cacheKey = path.map(String).join(".");
    const cachedEntry = shapeCache.get(cacheKey);

    type CallableStateObject<T> = {
      (): T;
    } & {
      [key: string]: any;
    };

    const baseFunction = function () {
      return getGlobalStore().getNestedState(stateKey, path);
    } as unknown as CallableStateObject<T>;

    Object.keys(baseObj).forEach((key) => {
      (baseFunction as any)[key] = (baseObj as any)[key];
    });

    const handler = {
      apply(target: any, thisArg: any, args: any[]) {
        return getGlobalStore().getNestedState(stateKey, path);
      },

      get(target: any, prop: string) {
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
          !prop.startsWith("$") &&
          prop !== "stateMapNoRender" &&
          !mutationMethods.has(prop)
        ) {
          const fullComponentId = `${stateKey}////${componentId}`;
          const stateEntry = getGlobalStore
            .getState()
            .stateComponents.get(stateKey);

          if (stateEntry) {
            const component = stateEntry.components.get(fullComponentId);
            if (component && !component.paths.has("")) {
              const currentPath = path.join(".");
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
              if (needsAdd) {
                component.paths.add(currentPath);
              }
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
          const initialStateAtPath = getNestedValue(initialState, path);
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
            const initialStateAtPath = getNestedValue(initialState, path);
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
              const selectedIndex = getGlobalStore
                .getState()
                .getSelectedIndex(stateKey, path.join("."));
              if (selectedIndex === undefined) return undefined;

              const sourceArray = getGlobalStore
                .getState()
                .getNestedState(stateKey, path) as any[];
              if (!sourceArray || selectedIndex >= sourceArray.length)
                return undefined;

              const selectedItem = sourceArray[selectedIndex];
              const itemId = `id:${selectedItem.id}`;

              return rebuildStateShape(selectedItem, [...path, itemId], meta);
            };
          }
          if (prop === "clearSelected") {
            return () => {
              getGlobalStore.getState().clearSelectedIndex({ stateKey, path });
            };
          }
          if (prop === "getSelectedIndex") {
            return () => {
              const globallySelectedIndex = getGlobalStore
                .getState()
                .getSelectedIndex(stateKey, path.join("."));
              if (globallySelectedIndex === undefined) return -1;

              if (meta?.validIds) {
                const sourceIds = getOrderedIds(path) || [];
                const selectedItemId = sourceIds[globallySelectedIndex];
                if (!selectedItemId) return -1;
                const localIndex = meta.validIds.indexOf(selectedItemId);
                return localIndex;
              }

              return globallySelectedIndex;
            };
          }
          // Replace the entire 'if (prop === "useVirtualView")' block with this
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
              const orderedIds = getOrderedIds(path);

              // Subscribe to shadow state updates for dynamic height changes
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

              // Calculate total height and individual item positions
              const { totalHeight, positions } = useMemo(() => {
                let height = 0;
                const pos: number[] = [];
                for (let i = 0; i < totalCount; i++) {
                  pos[i] = height;
                  const itemId = orderedIds?.[i];
                  if (itemId) {
                    const itemPath = [...path, itemId];
                    const itemMeta = getGlobalStore
                      .getState()
                      .getShadowMetadata(stateKey, itemPath);
                    const measuredHeight = itemMeta?.virtualizer?.itemHeight;
                    height += measuredHeight || itemHeight;
                  } else {
                    height += itemHeight;
                  }
                }
                return { totalHeight: height, positions: pos };
              }, [
                totalCount,
                stateKey,
                path.join("."),
                itemHeight,
                shadowUpdateTrigger,
                orderedIds,
              ]);

              // Create the virtual state object
              const virtualState = useMemo(() => {
                const start = Math.max(0, range.startIndex);
                const end = Math.min(totalCount, range.endIndex);
                // The sliced array is the `currentState` for the new proxy
                const slicedArray = sourceArray.slice(start, end);
                // The `validIds` for the new proxy are the sliced IDs
                const slicedIds = orderedIds?.slice(start, end);

                return rebuildStateShape(slicedArray as any, path, {
                  ...meta,
                  validIds: slicedIds,
                });
              }, [
                range.startIndex,
                range.endIndex,
                sourceArray,
                totalCount,
                orderedIds,
              ]);

              const scrollToLastItem = useCallback(() => {
                const lastIndex = totalCount - 1;
                if (lastIndex >= 0 && orderedIds?.[lastIndex]) {
                  const lastItemId = orderedIds[lastIndex];
                  const lastItemPath = [...path, lastItemId];
                  const lastItemMeta = getGlobalStore
                    .getState()
                    .getShadowMetadata(stateKey, lastItemPath);
                  if (lastItemMeta?.virtualizer?.domRef) {
                    const element = lastItemMeta.virtualizer.domRef;
                    if (element?.scrollIntoView) {
                      element.scrollIntoView({
                        behavior: "auto",
                        block: "end",
                      });
                      return true;
                    }
                  }
                }
                return false;
              }, [stateKey, path, totalCount, orderedIds]);

              useEffect(() => {
                if (!stickToBottom || totalCount === 0) return;
                const hasNewItems = totalCount > previousCountRef.current;
                if (
                  hasNewItems &&
                  wasAtBottomRef.current &&
                  !userHasScrolledAwayRef.current
                ) {
                  setTimeout(() => scrollToIndex(totalCount - 1, "smooth"), 50);
                }
                previousCountRef.current = totalCount;
              }, [totalCount, stickToBottom]);

              useEffect(() => {
                const container = containerRef.current;
                if (!container) return;

                const handleScroll = () => {
                  const { scrollTop, scrollHeight, clientHeight } = container;
                  const distanceFromBottom =
                    scrollHeight - scrollTop - clientHeight;
                  wasAtBottomRef.current = distanceFromBottom < 5;
                  if (distanceFromBottom > 100)
                    userHasScrolledAwayRef.current = true;
                  if (distanceFromBottom < 5)
                    userHasScrolledAwayRef.current = false;

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
                handleScroll(); // Initial check
                return () =>
                  container.removeEventListener("scroll", handleScroll);
              }, [positions, totalCount, itemHeight, overscan, stickToBottom]);

              const scrollToBottom = useCallback(() => {
                wasAtBottomRef.current = true;
                userHasScrolledAwayRef.current = false;
                if (!scrollToLastItem() && containerRef.current) {
                  containerRef.current.scrollTop =
                    containerRef.current.scrollHeight;
                }
              }, [scrollToLastItem]);

              const scrollToIndex = useCallback(
                (index: number, behavior: ScrollBehavior = "smooth") => {
                  const container = containerRef.current;
                  if (!container) return;
                  const top = positions[index];
                  if (top !== undefined) {
                    container.scrollTo({ top, behavior });
                  }
                },
                [positions]
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
              const arrayToMap = currentState as any[];
              const itemIdsForCurrentArray =
                meta?.validIds || getOrderedIds(path) || [];
              const arraySetter = rebuildStateShape(currentState, path, meta);

              return arrayToMap.map((item, index) => {
                const itemId = itemIdsForCurrentArray[index] || `id:${item.id}`;
                const itemPath = [...path, itemId];
                const itemSetter = rebuildStateShape(item, itemPath, meta);
                return callbackfn(
                  item,
                  itemSetter,
                  index,
                  currentState,
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
              const itemIdsForCurrentArray =
                meta?.validIds || getOrderedIds(path) || [];
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
              const arrayToMap = currentState as any[];
              if (!Array.isArray(arrayToMap)) return null;

              const itemIdsForCurrentArray =
                meta?.validIds || getOrderedIds(path) || [];
              const sourceIds = getOrderedIds(path) || [];
              const arraySetter = rebuildStateShape(
                arrayToMap as any,
                path,
                meta
              );

              return arrayToMap.map((item, localIndex) => {
                const itemId =
                  itemIdsForCurrentArray[localIndex] || `id:${item.id}`;
                const originalIndex = sourceIds.indexOf(itemId);
                const finalPath = [...path, itemId];
                const setter = rebuildStateShape(item, finalPath, meta);
                const itemComponentId = `${componentId}-${path.join(".")}-${itemId}`;

                return createElement(CogsItemWrapper, {
                  key: itemId,
                  stateKey,
                  itemComponentId,
                  itemPath: finalPath,
                  children: callbackfn(
                    item,
                    setter,
                    { localIndex, originalIndex },
                    arrayToMap as any,
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
              const idList = meta?.validIds || getOrderedIds(path);
              const itemId = idList?.[index];

              if (!itemId) {
                return rebuildStateShape(undefined as T, [
                  ...path,
                  index.toString(),
                ]);
              }

              const sourceArray = getGlobalStore
                .getState()
                .getNestedState(stateKey, path) as any[];
              const itemData = sourceArray.find(
                (item) => `id:${item.id}` === itemId
              );

              const itemPath = [...path, itemId];
              return rebuildStateShape(itemData, itemPath, meta);
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
            return (payload: UpdateArg<T>) => {
              invalidateCachePath(path);
              pushFunc(effectiveSetState, payload, path, stateKey);
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
                pushFunc(effectiveSetState, newValue, path, stateKey);
              } else if (onMatch && matchedItem) {
                const updatedItem = onMatch(matchedItem);
                const updatedArray = currentArray.map((item) =>
                  isDeepEqual(item, matchedItem) ? updatedItem : item
                );
                invalidateCachePath(path);
                updateFn(effectiveSetState, updatedArray as any, path);
              }
            };
          }
          if (prop === "cut") {
            return (index: number, options?: { waitForSync?: boolean }) => {
              if (options?.waitForSync) return;
              invalidateCachePath(path);
              cutFunc(effectiveSetState, path, stateKey, index);
              return rebuildStateShape(
                getGlobalStore.getState().getNestedState(stateKey, path),
                path
              );
            };
          }
          if (prop === "cutByValue") {
            return (value: string | number | boolean) => {
              const index = currentState.findIndex((item) => item === value);
              if (index > -1) cutFunc(effectiveSetState, path, stateKey, index);
            };
          }
          if (prop === "toggleByValue") {
            return (value: string | number | boolean) => {
              const index = currentState.findIndex((item) => item === value);
              if (index > -1) {
                cutFunc(effectiveSetState, path, stateKey, index);
              } else {
                pushFunc(effectiveSetState, value as any, path, stateKey);
              }
            };
          }
          if (prop === "stateFilter") {
            return (callbackfn: (value: any, index: number) => boolean) => {
              const sourceIds = meta?.validIds || getOrderedIds(path) || [];
              const sourceArray = getGlobalStore
                .getState()
                .getNestedState(stateKey, path) as any[];
              const sourceMap = new Map(
                sourceArray.map((item) => [`id:${item.id}`, item])
              );

              const newValidIds: string[] = [];
              const newFilteredArray: any[] = [];

              sourceIds.forEach((id, index) => {
                const item = sourceMap.get(id);
                if (item && callbackfn(item, index)) {
                  newValidIds.push(id);
                  newFilteredArray.push(item);
                }
              });

              return rebuildStateShape(newFilteredArray as any, path, {
                validIds: newValidIds,
              });
            };
          }
          if (prop === "stateSort") {
            return (compareFn: (a: any, b: any) => number) => {
              const sourceArray = currentState as any[];
              const itemsWithIds = sourceArray.map((item) => ({
                item,
                id: `id:${item.id}`,
              }));
              itemsWithIds.sort((a, b) => compareFn(a.item, b.item));
              const sortedArray = itemsWithIds.map((d) => d.item);
              const newValidIds = itemsWithIds.map((d) => d.id);
              return rebuildStateShape(sortedArray as any, path, {
                validIds: newValidIds,
              });
            };
          }
          if (prop === "findWith") {
            return (thisKey: keyof InferArrayElement<T>, thisValue: any) => {
              const foundItem = (currentState as any[]).find(
                (item) => item[thisKey] === thisValue
              );
              if (!foundItem) return undefined;
              const itemId = `id:${foundItem.id}`;
              const finalPath = [...path, itemId];
              return rebuildStateShape(foundItem, finalPath, meta);
            };
          }
        }
        const lastPathElement = path[path.length - 1];
        if (!isNaN(Number(lastPathElement))) {
          const parentPath = path.slice(0, -1);
          const parentValue = getGlobalStore
            .getState()
            .getNestedState(stateKey, parentPath);
          if (Array.isArray(parentValue) && prop === "cut") {
            return () =>
              cutFunc(
                effectiveSetState,
                parentPath,
                stateKey,
                Number(lastPathElement)
              );
          }
        }
        if (prop === "get") {
          return () => {
            // Check if this proxy represents a derived array.
            // A derived array proxy has `meta.validIds` AND its `currentState` is an array.
            if (meta?.validIds && Array.isArray(currentState)) {
              // It IS a derived array proxy. Reconstruct it to ensure freshness.
              const sourceArray = getGlobalStore
                .getState()
                .getNestedState(stateKey, path) as any[];
              if (!Array.isArray(sourceArray)) return [];

              const sourceMap = new Map(
                sourceArray.map((item: any) => [`id:${item.id}`, item])
              );

              return meta.validIds
                .map((id) => sourceMap.get(id))
                .filter(Boolean);
            }

            // For all other cases (non-derived arrays, single items, properties),
            // the standard lookup is correct.
            return getGlobalStore.getState().getNestedState(stateKey, path);
          };
        }
        if (prop === "$derive") {
          return (fn: any) =>
            $cogsSignal({
              _stateKey: stateKey,
              _path: path,
              _effect: fn.toString(),
            });
        }
        if (prop === "$get") {
          return () => $cogsSignal({ _stateKey: stateKey, _path: path });
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
          const parentKey = parentPath.join(".");
          if (
            Array.isArray(
              getGlobalStore.getState().getNestedState(stateKey, parentPath)
            )
          ) {
            const itemId = path[path.length - 1];
            const orderedIds = getOrderedIds(parentPath);
            const thisIndex = orderedIds?.indexOf(itemId!);
            return (
              thisIndex ===
              getGlobalStore.getState().getSelectedIndex(stateKey, parentKey)
            );
          }
          return undefined;
        }
        if (prop === "setSelected") {
          return (value: boolean) => {
            const parentPath = path.slice(0, -1);
            const itemId = path[path.length - 1];
            const orderedIds = getOrderedIds(parentPath);
            const thisIndex = orderedIds?.indexOf(itemId!);

            if (thisIndex === undefined || thisIndex === -1) return;

            const parentKey = parentPath.join(".");
            getGlobalStore
              .getState()
              .setSelectedIndex(
                stateKey,
                parentKey,
                value ? thisIndex : undefined
              );
            const nested = getGlobalStore
              .getState()
              .getNestedState(stateKey, [...parentPath]);
            updateFn(effectiveSetState, nested, parentPath);
            invalidateCachePath(parentPath);
          };
        }
        if (prop === "toggleSelected") {
          return () => {
            const parentPath = path.slice(0, -1);
            const itemId = path[path.length - 1];
            const orderedIds = getOrderedIds(parentPath);
            const thisIndex = orderedIds?.indexOf(itemId!);
            if (thisIndex === undefined || thisIndex === -1) return;

            const parentKey = parentPath.join(".");
            const selectedIndex = getGlobalStore
              .getState()
              .getSelectedIndex(stateKey, parentKey);
            getGlobalStore
              .getState()
              .setSelectedIndex(
                stateKey,
                parentKey,
                selectedIndex === thisIndex ? undefined : thisIndex
              );

            const nested = getGlobalStore
              .getState()
              .getNestedState(stateKey, [...parentPath]);
            updateFn(effectiveSetState, nested, parentPath);
            invalidateCachePath(parentPath);
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
              const currentState =
                getGlobalStore.getState().cogsStateStore[stateKey];
              const newState = applyPatch(currentState, patches).newDocument;
              updateGlobalState(
                stateKey,
                getGlobalStore.getState().initialStateGlobal[stateKey],
                newState,
                effectiveSetState,
                componentId,
                sessionId
              );
              notifyComponents(stateKey); // Simplified notification
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
          if (prop === "_initialState")
            return getGlobalStore.getState().initialStateGlobal[stateKey];
          if (prop === "_serverState")
            return getGlobalStore.getState().serverState[stateKey];
          if (prop === "_isLoading")
            return getGlobalStore.getState().isLoadingGlobal[stateKey];
          if (prop === "revertToInitialState")
            return baseObj.revertToInitialState;
          if (prop === "updateInitialState") return baseObj.updateInitialState;
          if (prop === "removeValidation") return baseObj.removeValidation;
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
        if (prop === "_isServerSynced") return baseObj._isServerSynced;
        if (prop === "update") {
          return (payload: UpdateArg<T>, opts?: UpdateOpts<T>) => {
            if (opts?.debounce) {
              debounce(() => {
                updateFn(effectiveSetState, payload, path, "");
                const newValue = getGlobalStore
                  .getState()
                  .getNestedState(stateKey, path);
                if (opts?.afterUpdate) opts.afterUpdate(newValue);
              }, opts.debounce);
            } else {
              updateFn(effectiveSetState, payload, path, "");
              const newValue = getGlobalStore
                .getState()
                .getNestedState(stateKey, path);
              if (opts?.afterUpdate) opts.afterUpdate(newValue);
            }
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

  return rebuildStateShape(
    getGlobalStore.getState().getNestedState(stateKey, [])
  );
}

export function $cogsSignal(proxy: {
  _path: string[];
  _stateKey: string;
  _effect?: string;
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
    meta?: { validIds?: string[] }
  ) => any;
}) {
  const value = getGlobalStore().getNestedState(proxy._stateKey, proxy._path);
  if (!Array.isArray(value)) return null;

  const arraySetter = rebuildStateShape(
    value,
    proxy._path
  ) as ArrayEndType<any>;
  return arraySetter.stateMapNoRender(
    (item, setter, index, array, arraySetter) => {
      return proxy._mapFn(item, setter, index, array, arraySetter);
    }
  );
}

function SignalRenderer({
  proxy,
}: {
  proxy: {
    _path: string[];
    _stateKey: string;
    _effect?: string;
  };
}) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const signalId = `${proxy._stateKey}-${proxy._path.join(".")}`;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !element.parentElement) return;

    const parentElement = element.parentElement;
    const childNodes = Array.from(parentElement.childNodes);
    const position = childNodes.indexOf(element);

    let parentId = parentElement.getAttribute("data-parent-id");
    if (!parentId) {
      parentId = `parent-${crypto.randomUUID()}`;
      parentElement.setAttribute("data-parent-id", parentId);
    }

    const instanceId = `instance-${crypto.randomUUID()}`;
    const elementInfo = {
      instanceId,
      parentId,
      position,
      effect: proxy._effect,
    };

    getGlobalStore.getState().addSignalElement(signalId, elementInfo);

    const value = getGlobalStore
      .getState()
      .getNestedState(proxy._stateKey, proxy._path);
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
  }, [proxy._stateKey, proxy._path.join("."), proxy._effect]);

  return createElement("span", {
    ref: elementRef,
    style: { display: "none" },
    "data-signal-id": signalId,
  });
}

export function $cogsSignalStore(proxy: {
  _path: string[];
  _stateKey: string;
}) {
  const value = useSyncExternalStore(
    (notify) => {
      const stateEntry = getGlobalStore
        .getState()
        .stateComponents.get(proxy._stateKey) || { components: new Map() };
      stateEntry.components.set(proxy._stateKey, {
        forceUpdate: notify,
        paths: new Set([proxy._path.join(".")]),
      });
      getGlobalStore
        .getState()
        .stateComponents.set(proxy._stateKey, stateEntry);
      return () => stateEntry.components.delete(proxy._stateKey);
    },
    () => getGlobalStore.getState().getNestedState(proxy._stateKey, proxy._path)
  );
  return createElement("text", {}, String(value));
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
      .stateComponents.get(stateKey) || { components: new Map() };
    stateEntry.components.set(fullComponentId, {
      forceUpdate: () => forceUpdate({}),
      paths: new Set([itemPath.join(".")]),
    });
    getGlobalStore.getState().stateComponents.set(stateKey, stateEntry);
    return () => {
      const currentEntry = getGlobalStore
        .getState()
        .stateComponents.get(stateKey);
      if (currentEntry) currentEntry.components.delete(fullComponentId);
    };
  }, [stateKey, itemComponentId, itemPath.join(".")]);

  return <div ref={setRefs}>{children}</div>;
}
