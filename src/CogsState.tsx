"use client";

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
} from "react";
import { createRoot } from "react-dom/client";
import {
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
import { useInView } from "react-intersection-observer";

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
      index: number,
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
    payload: InsertParams<InferArrayElement<TShape>>,
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
export type InsertParams<S> =
  | S
  | ((prevState: { state: S; uuid: string }) => S);
export type UpdateType<T> = (
  payload: UpdateArg<T>,
  opts?: UpdateOpts<T>
) => void;

export type InsertType<T> = (
  payload: InsertParams<T>,
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
type EffectiveSetStateArg<
  T,
  UpdateType extends "update" | "insert" | "cut",
> = UpdateType extends "insert"
  ? T extends any[]
    ? InsertParams<InferArrayElement<T>>
    : never
  : UpdateArg<T>;

// Then update your EffectiveSetState type
type EffectiveSetState<TStateObject> = (
  newStateOrFunction:
    | EffectiveSetStateArg<TStateObject, "update">
    | EffectiveSetStateArg<TStateObject, "insert">,
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
      deps: reactiveDeps
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
          const pathParts = fullPath.split(".");
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
    updateObj: { updateType: "insert" | "cut" | "update" },
    validationKey?: string
  ) => {
    const fullPath = [thisKey, ...path].join("."); // This is the full path to the state slice
    if (Array.isArray(path)) {
      const pathKey = `${thisKey}-${path.join(".")}`;
      componentUpdatesRef.current.add(pathKey);
    }
    const store = getGlobalStore.getState();

    setState(thisKey, (prevValue: TStateObject) => {
      const shadowMeta = store.getShadowMetadata(thisKey, path);
      const nestedShadowValue = store.getShadowValue(fullPath) as TStateObject;

      const payload = (
        updateObj.updateType === "insert" && isFunction(newStateOrFunction)
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
        status: "new" as const,
        oldValue: nestedShadowValue,
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

      // Update in effectiveSetState for insert handling:
      if (updateObj.updateType === "insert") {
        getGlobalStore.getState().notifyPathSubscribers(fullPath);
        const arrayMeta = store.getShadowMetadata(thisKey, path);

        if (arrayMeta?.mapWrappers && arrayMeta.mapWrappers.length > 0) {
          const sourceArrayKeys =
            store.getShadowMetadata(thisKey, path)?.arrayKeys || [];
          const newItemKey = sourceArrayKeys[sourceArrayKeys.length - 1]!;
          const newItemValue = store.getShadowValue(newItemKey);
          const fullSourceArray = store.getShadowValue(
            [thisKey, ...path].join(".")
          );

          if (!newItemKey || newItemValue === undefined) return;

          arrayMeta.mapWrappers.forEach((wrapper) => {
            let shouldRender = false;
            let localIndex = -1;

            // --- THE FIX IS HERE ---
            // Check if the wrapper has an array of filter functions.
            if (wrapper.meta?.filterFns && wrapper.meta.filterFns.length > 0) {
              // Test if the new item passes EVERY filter in the chain.
              if (
                wrapper.meta.filterFns.every((fn: any) => fn(newItemValue, -1))
              ) {
                shouldRender = true;
                localIndex = (wrapper.meta.validIds || []).length;
              }
            } else {
              // It's an unfiltered map, so it should always render the new item.
              shouldRender = true;
              localIndex = sourceArrayKeys.length - 1;
            }

            if (!shouldRender) {
              return; // Skip this wrapper, the item doesn't belong.
            }

            if (wrapper.containerRef && wrapper.containerRef.isConnected) {
              const itemElement = document.createElement("div");
              itemElement.setAttribute("data-item-path", newItemKey);
              wrapper.containerRef.appendChild(itemElement);

              const root = createRoot(itemElement);
              const componentId = uuidv4();
              const itemPath = newItemKey.split(".").slice(1);

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
                  localIndex: localIndex,
                  arraySetter: arraySetter,
                  rebuildStateShape: wrapper.rebuildStateShape,
                  renderFn: wrapper.mapFn,
                })
              );
            }
          });
        }
      }

      if (updateObj.updateType === "cut") {
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

      const newState = store.getShadowValue(thisKey);

      const rootMeta = store.getShadowMetadata(thisKey, []);
      const notifiedComponents = new Set<string>();

      // Handle "all" reactive components first
      if (rootMeta?.components) {
        rootMeta.components.forEach((component, componentId) => {
          const reactiveTypes = Array.isArray(component.reactiveType)
            ? component.reactiveType
            : [component.reactiveType || "component"];

          if (reactiveTypes.includes("all")) {
            component.forceUpdate();
            notifiedComponents.add(componentId);
          }
        });
      }

      // Direct lookup for components at THIS path
      const pathMeta = store.getShadowMetadata(thisKey, path);
      if (pathMeta?.pathComponents) {
        pathMeta.pathComponents.forEach((componentId) => {
          if (!notifiedComponents.has(componentId)) {
            const component = rootMeta?.components?.get(componentId);
            if (component) {
              const reactiveTypes = Array.isArray(component.reactiveType)
                ? component.reactiveType
                : [component.reactiveType || "component"];

              if (component && !reactiveTypes.includes("none")) {
                component.forceUpdate();
                notifiedComponents.add(componentId);
              }
            }
          }
        });
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

type MetaData = {
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
  filterFns?: Array<(value: any, index: number) => boolean>;
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
    !(
      Array.isArray(component.reactiveType)
        ? component.reactiveType
        : [component.reactiveType]
    ).includes("component")
  ) {
    return;
  }

  const pathKey = [stateKey, ...dependencyPath].join(".");

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
        if (prop === "_rebuildStateShape") {
          return rebuildStateShape;
        }
        const baseObjProps = Object.getOwnPropertyNames(baseObj);
        if (baseObjProps.includes(prop) && path.length === 0) {
          return (baseObj as any)[prop];
        }
        // ^--------- END OF FIX ---------^

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
              registerComponentDependency(stateKey, componentId, [
                ...path,
                "getSelected",
              ]);

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

              return rebuildStateShape({
                currentState: value,
                path: selectedItemKey.split(".").slice(1) as string[],
                componentId: componentId!,
              });
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
          if (prop === "clearSelected") {
            return () => {
              getGlobalStore.getState().clearSelectedIndex({ stateKey, path });
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
                scrollStickTolerance = 100,
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
              const setInitialSCrollDone = useRef(false);
              const lastItemId = useRef<any>(null);
              // Subscribe to shadow state updates
              getGlobalStore.getState().subscribeToPath(stateKeyPathKey, () => {
                setShadowUpdateTrigger((prev) => prev + 1);
              });

              const sourceArray = getGlobalStore
                .getState()
                .getShadowValue(stateKeyPathKey) as any[];
              const totalCount = sourceArray.length;

              const initialTotalHeight = totalCount * itemHeight;
              const shadowArray = getGlobalStore
                .getState()
                .getShadowMetadata(stateKey, path);
              const orderedIds = shadowArray?.arrayKeys || [];

              const { calcedTotalHeight, positions, lastItem } = useMemo(() => {
                let height = 0;
                let positions: number[] = [];
                let lastItem = null;
                for (let id of orderedIds) {
                  const itemMeta = getGlobalStore
                    .getState()
                    .getShadowMetadata(stateKey, id.split(".").slice(1));

                  let measuredHeight =
                    itemMeta?.virtualizer?.itemHeight || itemHeight;
                  lastItem = itemMeta;
                  positions.push(height);
                  height += measuredHeight;
                }
                lastItemId.current = orderedIds[totalCount - 1];
                return { calcedTotalHeight: height, positions, lastItem };
              }, [shadowUpdateTrigger, itemHeight]);
              const totalHeight = calcedTotalHeight ?? initialTotalHeight;
              // Helper to scroll to last item using stored ref
              const scrollToLastItem = () => {
                if (
                  !shadowArray ||
                  (shadowArray && shadowArray?.arrayKeys?.length === 0)
                ) {
                  return false;
                }
                const maxAttempts = 50; // 5 seconds total
                let attempts = 0;
                const findAndScroll = () => {
                  const shadowStore = getGlobalStore
                    .getState()
                    .getShadowMetadata(
                      stateKey,
                      lastItemId.current.split(".").slice(1)
                    );

                  if (shadowStore?.virtualizer?.domRef) {
                    const element = shadowStore.virtualizer.domRef;
                    if (element) {
                      const container = containerRef.current!;
                      container.scrollTo({
                        top: container.scrollHeight,
                        behavior: "smooth",
                      });

                      return true;
                    }
                  }
                  return false;
                };

                const intervalId = setInterval(() => {
                  attempts++;
                  if (findAndScroll() || attempts >= maxAttempts) {
                    clearInterval(intervalId);
                  }
                }, 100);
                return false;
              };

              // Always handle scroll to update range
              useEffect(() => {
                const container = containerRef.current;
                if (!container || positions.length === 0) return;
                const handleScroll = () => {
                  const { scrollTop, clientHeight, scrollHeight } = container;
                  const scrollBottom = scrollTop + clientHeight;
                  let endIndex = totalCount - 1;
                  // If we're near the bottom, just show items to the end
                  const nearBottom =
                    scrollHeight - scrollBottom < itemHeight * 2;

                  // Binary search for first visible item
                  let startIndex = 0;
                  let left = 0;
                  let right = positions.length - 1;

                  while (left <= right) {
                    const mid = Math.floor((left + right) / 2);
                    const itemTop = positions[mid]!;
                    const itemBottom = positions[mid + 1] || totalHeight;

                    if (itemBottom < scrollTop) {
                      left = mid + 1;
                    } else if (itemTop > scrollTop) {
                      right = mid - 1;
                    } else {
                      startIndex = mid;
                      break;
                    }
                  }

                  if (nearBottom) {
                    // If near bottom, include all remaining items
                    endIndex = totalCount - 1;
                  } else {
                    // Binary search for last visible item
                    left = startIndex;
                    right = Math.min(positions.length - 1, totalCount - 1);

                    while (left <= right) {
                      const mid = Math.floor((left + right) / 2);
                      const itemTop = positions[mid] || mid * itemHeight;

                      if (itemTop <= scrollBottom) {
                        endIndex = mid;
                        left = mid + 1;
                      } else {
                        right = mid - 1;
                      }
                    }
                  }

                  // Apply overscan
                  startIndex = Math.max(0, startIndex - overscan);
                  endIndex = Math.min(totalCount - 1, endIndex + overscan);

                  setRange({ startIndex, endIndex });
                };
                handleScroll();
                container.addEventListener("scroll", handleScroll, {
                  passive: true,
                });

                return () => {
                  container.removeEventListener("scroll", handleScroll);
                };
              }, [positions, totalCount, shadowUpdateTrigger, totalHeight]);

              useEffect(() => {
                if (!stickToBottom || totalCount === 0) return;

                const container = containerRef.current;
                if (!container) return;

                const hasNewItems = totalCount > previousCountRef.current;

                const nearBottom =
                  container.scrollHeight - container.scrollTop <=
                  container.clientHeight + scrollStickTolerance;
                if (hasNewItems && stickToBottom && nearBottom) {
                  scrollToLastItem();
                  previousCountRef.current = totalCount;
                }

                const initalScroll = () => {
                  const { scrollTop, scrollHeight, clientHeight } = container;
                  const distanceFromBottom =
                    scrollHeight - scrollTop - clientHeight;
                  wasAtBottomRef.current = distanceFromBottom < 8;

                  if (
                    !wasAtBottomRef.current &&
                    !setInitialSCrollDone.current
                  ) {
                    // If the list is NOT at the bottom after scrolling
                    container.scrollTop = container.scrollHeight;
                    wasAtBottomRef.current = true;

                    if (lastItem?.virtualizer?.domRef) {
                      const element = lastItem.virtualizer.domRef as any;

                      if (element) {
                        const rect = element.getBoundingClientRect();
                        const isInView =
                          rect.top >= 0 &&
                          rect.left >= 0 &&
                          rect.bottom <=
                            (window.innerHeight ||
                              document.documentElement.clientHeight) &&
                          rect.right <=
                            (window.innerWidth ||
                              document.documentElement.clientWidth);

                        if (isInView) {
                          setInitialSCrollDone.current = true;
                          //  previousCountRef.current = totalCount;
                        }
                      }
                    }
                  }
                };
                if (!setInitialSCrollDone.current) initalScroll();
              }, [
                positions,
                totalCount,
                itemHeight,
                overscan,
                stickToBottom,
                lastItem,
              ]);

              const scrollToBottom = useCallback(() => {
                wasAtBottomRef.current = true;
                userHasScrolledAwayRef.current = false;
                const scrolled = scrollToLastItem();
                if (!scrolled && containerRef.current) {
                  containerRef.current.scrollTop =
                    containerRef.current.scrollHeight;
                }
              }, []);
              const scrollToIndex = useCallback(
                (index: number, behavior: ScrollBehavior = "smooth") => {
                  const container = containerRef.current;
                  if (!container) return;

                  const isLastItem = index === totalCount - 1;

                  // --- Special Case: The Last Item ---
                  if (isLastItem) {
                    // For the last item, scrollIntoView can fail. The most reliable method
                    // is to scroll the parent container to its maximum scroll height.
                    container.scrollTo({
                      top: container.scrollHeight,
                      behavior: behavior,
                    });
                    return; // We're done.
                  }

                  // --- Standard Case: All Other Items ---
                  // For all other items, we find the ref and use scrollIntoView.
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
                    // 'center' gives a better user experience for items in the middle of the list.
                    element.scrollIntoView({
                      behavior: behavior,
                      block: "center",
                    });
                  } else if (positions[index] !== undefined) {
                    // Fallback if the ref isn't available for some reason.
                    container.scrollTo({
                      top: positions[index],
                      behavior,
                    });
                  }
                },
                [positions, stateKey, path, totalCount] // Add totalCount to the dependencies
              );
              // Create virtual state
              const virtualState = useMemo(() => {
                const start = Math.max(0, range.startIndex);

                const end = Math.min(totalCount, range.endIndex + 1);
                //
                const orderedIds = shadowArray?.arrayKeys || [];

                const slicedArray = sourceArray.slice(start, end);
                const slicedIds = orderedIds.slice(start, end);

                return rebuildStateShape({
                  currentState: slicedArray as any,
                  path,
                  componentId: componentId!,
                  meta: {
                    ...meta,
                    validIds: slicedIds,
                  },
                });
              }, [range.startIndex, range.endIndex, sourceArray, totalCount]);

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
                throw new Error("No array keys found for mapping");
              }
              const arraySetter = rebuildStateShape({
                currentState: shadowValue as any,
                path,
                componentId: componentId!,
                meta,
              });

              return shadowValue.map((item, index) => {
                const itemPath = arrayKeys[index]?.split(".").slice(1);
                const itemSetter = rebuildStateShape({
                  currentState: item,
                  path: itemPath as any,
                  componentId: componentId!,
                  meta,
                });

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

              return rebuildStateShape({
                currentState: filteredArray as any,
                path,
                componentId: componentId!,
                meta: {
                  ...meta,
                  validIds: newValidIds,

                  filterFns: [...(meta?.filterFns || []), callbackfn],
                },
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
              const arraySetter = rebuildStateShape({
                currentState: currentState,
                path,
                componentId: componentId!,
                meta,
              });

              return arrayToMap.map((item, index) => {
                const itemId = itemIdsForCurrentArray[index] || `id:${item.id}`;
                const finalPath = [...path, itemId];
                const setter = rebuildStateShape({
                  currentState: item,
                  path: finalPath,
                  componentId: componentId!,
                  meta,
                });

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
                proxy: {
                  _stateKey: stateKey,
                  _path: path,
                  _mapFn: callbackfn,
                  _meta: meta,
                },
                rebuildStateShape,
              });
          }
          if (prop === "stateList") {
            return (
              callbackfn: (
                value: any,
                setter: any,
                index: number,
                array: any,
                arraySetter: any
              ) => ReactNode
            ) => {
              const [render, forceUpdate] = useState(1);
              const arrayToMap = getGlobalStore
                .getState()
                .getShadowValue(stateKeyPathKey, meta?.validIds);

              if (!Array.isArray(arrayToMap)) {
                return null;
              }
              getGlobalStore.getState().subscribeToPath(stateKeyPathKey, () => {
                forceUpdate((p) => p + 1);
              });
              const itemKeysForCurrentView =
                meta?.validIds ||
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys ||
                [];

              const arraySetter = rebuildStateShape({
                currentState: arrayToMap as any,
                path,
                componentId: componentId!,
                meta,
              });

              return arrayToMap.map((item, localIndex) => {
                const itemKey = itemKeysForCurrentView[localIndex];

                if (!itemKey) {
                  return null;
                }
                const itemComponentId = uuidv4();

                const itemPath = itemKey.split(".").slice(1);
                const setter = rebuildStateShape({
                  currentState: item,
                  path: itemPath,
                  componentId: itemComponentId!,
                  meta,
                });

                return createElement(MemoizedCogsItemWrapper, {
                  key: itemKey,
                  stateKey,
                  itemComponentId,
                  itemPath,
                  localIndex,
                  arraySetter, // Pass the array's setter
                  rebuildStateShape, // Pass the function that creates new proxies
                  renderFn: callbackfn, // Pass the render function itself, not its result
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
              return rebuildStateShape({
                currentState: flattenedResults as any,
                path: [...path, "[*]", fieldName],
                componentId: componentId!,
                meta,
              });
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
              const state = rebuildStateShape({
                currentState: value,
                path: itemId.split(".").slice(1) as string[],
                componentId: componentId!,
                meta,
              });
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
              return rebuildStateShape({
                currentState: lastValue,
                path: newPath,
                componentId: componentId!,
                meta,
              });
            };
          }
          if (prop === "insert") {
            return (
              payload: InsertParams<InferArrayElement<T>>,
              index?: number
            ) => {
              invalidateCachePath(path);
              effectiveSetState(payload as any, path, { updateType: "insert" });
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

              const pathForCut = fullIdToCut.split(".").slice(1);
              effectiveSetState(currentState, pathForCut, {
                updateType: "cut",
              });
            };
          }
          if (prop === "cutSelected") {
            return () => {
              const validKeys =
                meta?.validIds ??
                getGlobalStore.getState().getShadowMetadata(stateKey, path)
                  ?.arrayKeys;

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
                ?.split(".")
                .slice(1);

              effectiveSetState(currentState, pathForCut!, {
                updateType: "cut",
              });
            };
          }
          if (prop === "cutByValue") {
            return (value: string | number | boolean) => {
              const arrayKeys = getGlobalStore
                .getState()
                .getShadowMetadata(stateKey, path)?.arrayKeys;

              if (!arrayKeys) return;

              // Find the item ID that matches the value
              let targetItemId = null;
              for (const itemId of arrayKeys) {
                const itemValue = getGlobalStore
                  .getState()
                  .getShadowValue(itemId);
                if (itemValue === value) {
                  targetItemId = itemId;
                  break;
                }
              }

              if (targetItemId) {
                effectiveSetState(
                  value as any,
                  targetItemId.split(".").slice(1),
                  { updateType: "cut" }
                );
              }
            };
          }

          if (prop === "toggleByValue") {
            return (value: string | number | boolean) => {
              const arrayKeys = getGlobalStore
                .getState()
                .getShadowMetadata(stateKey, path)?.arrayKeys;

              if (!arrayKeys) return;

              // Find if item exists
              let existingItemId = null;
              for (const itemId of arrayKeys) {
                const itemValue = getGlobalStore
                  .getState()
                  .getShadowValue(itemId);
                if (itemValue === value) {
                  existingItemId = itemId;
                  break;
                }
              }

              if (existingItemId) {
                // Item exists, cut it
                effectiveSetState(
                  value as any,
                  existingItemId.split(".").slice(1),
                  { updateType: "cut" }
                );
              } else {
                // Item doesn't exist, insert it
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

              return rebuildStateShape({
                currentState: filteredArray as any,
                path,
                componentId: componentId!,
                meta: {
                  validIds: newValidIds,
                },
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

              return rebuildStateShape({
                currentState: itemsWithIds.map((i) => i.item) as any,
                path,
                componentId: componentId!,
                meta: {
                  validIds: itemsWithIds.map((i) => i.key) as string[],
                },
              });
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

              return rebuildStateShape({
                currentState: value as any,
                path: foundPath,
                componentId: componentId!,
                meta,
              });
            };
          }
        }

        if (prop === "cut") {
          let shadowValue = getGlobalStore
            .getState()
            .getShadowValue(path.join("."));

          return () => {
            effectiveSetState(shadowValue, path, { updateType: "cut" });
          };
        }

        if (prop === "get") {
          return () => {
            registerComponentDependency(stateKey, componentId, path);
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

          registerComponentDependency(stateKey, componentId, [
            ...path,
            "selected",
          ]);
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
        const notifySelectionComponents = (
          stateKey: string,
          parentPath: string[],
          currentSelected: string | undefined
        ) => {
          const store = getGlobalStore.getState();
          const rootMeta = store.getShadowMetadata(stateKey, []);
          const notifiedComponents = new Set<string>();

          // Handle "all" reactive components first
          if (rootMeta?.components) {
            rootMeta.components.forEach((component, componentId) => {
              const reactiveTypes = Array.isArray(component.reactiveType)
                ? component.reactiveType
                : [component.reactiveType || "component"];

              if (reactiveTypes.includes("all")) {
                component.forceUpdate();
                notifiedComponents.add(componentId);
              }
            });
          }

          store
            .getShadowMetadata(stateKey, [...parentPath, "getSelected"])
            ?.pathComponents?.forEach((componentId) => {
              const thisComp = rootMeta?.components?.get(componentId);
              thisComp?.forceUpdate();
            });

          const parentMeta = store.getShadowMetadata(stateKey, parentPath);
          for (let arrayKey of parentMeta?.arrayKeys || []) {
            const key = arrayKey + ".selected";
            const selectedItem = store.getShadowMetadata(
              stateKey,
              key.split(".").slice(1)
            );
            if (arrayKey == currentSelected) {
              selectedItem?.pathComponents?.forEach((componentId) => {
                const thisComp = rootMeta?.components?.get(componentId);
                thisComp?.forceUpdate();
              });
            }
          }
        };

        // Then use it in both:
        if (prop === "setSelected") {
          return (value: boolean) => {
            const parentPath = path.slice(0, -1);
            const fullParentKey = stateKey + "." + parentPath.join(".");
            const fullItemKey = stateKey + "." + path.join(".");

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

        if (prop === "toggleSelected") {
          return () => {
            const parentPath = path.slice(0, -1);
            const fullParentKey = stateKey + "." + parentPath.join(".");
            const fullItemKey = stateKey + "." + path.join(".");

            const currentSelected = getGlobalStore
              .getState()
              .selectedIndicesMap.get(fullParentKey);

            notifySelectionComponents(stateKey, parentPath, currentSelected);

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
        if (prop === "_componentId") {
          return componentId;
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

          if (prop === "getComponents")
            return () =>
              getGlobalStore.getState().stateComponents.get(stateKey);
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
      value: any,
      setter: any,
      index: number,
      array: any[],
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
        [proxy._stateKey, ...proxy._path].join("."),
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
      const itemElement = document.createElement("div");

      itemElement.setAttribute("data-item-path", itemKey);
      container.appendChild(itemElement);

      const root = createRoot(itemElement);
      rootsMapRef.current.set(itemKey, root);

      const itemPath = itemKey.split(".").slice(1) as string[];

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
const MemoizedCogsItemWrapper = memo(
  CogsItemWrapper,
  (prevProps, nextProps) => {
    // Only re-render if the item path or key changed
    return (
      prevProps.itemPath.join(".") === nextProps.itemPath.join(".") &&
      prevProps.stateKey === nextProps.stateKey &&
      prevProps.itemComponentId === nextProps.itemComponentId
    );
  }
);
function CogsItemWrapper({
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
    value: any,
    setter: any,
    index: number,
    array: any,
    arraySetter: any
  ) => React.ReactNode;
}) {
  const [, forceUpdate] = useState({});
  const { ref, inView, entry } = useInView();
  const elementRef = useRef<HTMLDivElement | null>(null);
  const lastReportedHeight = useRef<number | null>(null);

  // Proper way to merge refs
  const setRefs = useCallback(
    (element: HTMLDivElement | null) => {
      // Set your own ref
      elementRef.current = element;

      // Call measureRef (it's a callback function from useMeasure)
      ref(element);
    },
    [ref]
  );

  useEffect(() => {
    const currentItemMetadata = getGlobalStore
      .getState()
      .getShadowMetadata(stateKey, itemPath);
    const existingItemHeight = currentItemMetadata?.virtualizer?.itemHeight;

    if (
      entry?.target instanceof HTMLElement &&
      entry.target.offsetHeight > 0 &&
      entry.target.offsetHeight !== lastReportedHeight.current &&
      entry.target.offsetHeight !== existingItemHeight
    ) {
      lastReportedHeight.current = entry.target.offsetHeight;
      getGlobalStore.getState().setShadowMetadata(stateKey, itemPath, {
        virtualizer: {
          itemHeight: entry.target.offsetHeight,
          domRef: elementRef.current,
        },
      });
      const arrayPath = itemPath.slice(0, -1); // Remove the item ID
      const arrayPathKey = [stateKey, ...arrayPath].join(".");

      getGlobalStore.getState().notifyPathSubscribers(arrayPathKey);
    }
  }, [entry, stateKey, itemPath]);
  const fullComponentId = `${stateKey}////${itemComponentId}`;
  const stateEntry = getGlobalStore.getState().getShadowMetadata(stateKey, []);

  if (!stateEntry?.components?.has(fullComponentId)) {
    stateEntry?.components?.set(fullComponentId, {
      forceUpdate: () => forceUpdate({}),
      paths: new Set(), // <--- THE FIX
      reactiveType: ["component"],
    });
  }

  useLayoutEffect(() => {
    return () => {
      cleanupComponentRegistration(stateKey, fullComponentId);
    };
    // The itemPath is no longer needed as a dependency for this effect
  }, [stateKey, itemComponentId]);
  const fullItemPath = [stateKey, ...itemPath].join(".");
  const itemValue = getGlobalStore.getState().getShadowValue(fullItemPath);

  // If the item was deleted from the store, it might be null.
  if (itemValue === undefined) {
    return null;
  }

  const arrayValue = arraySetter.get();

  // Re-create the specific proxy for this item with the latest data.
  const itemSetter = rebuildStateShape({
    currentState: itemValue,
    path: itemPath,
    componentId: itemComponentId,
  });
  const children = renderFn(
    itemValue,
    itemSetter,
    localIndex,
    arrayValue,
    arraySetter
  );

  return (
    <div ref={setRefs} onClick={() => forceUpdate({})}>
      {children}
    </div>
  );
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
      const pathParts = fullPath.split(".");
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
