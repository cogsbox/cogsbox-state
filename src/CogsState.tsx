"use client";
import {
  createElement,
  startTransition,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
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
import type { UseMutationResult } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { ZodArray, ZodObject, type ZodRawShape } from "zod";

import { formRefStore, getGlobalStore, type ComponentsType } from "./store.js";
import { useCogsConfig } from "./CogsStateClient.js";

type Prettify<T> = { [K in keyof T]: T[K] } & {};

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
export type PushArgs<U> = (
  update:
    | Prettify<U>
    | ((prevState: NonNullable<Prettify<U>>[]) => NonNullable<Prettify<U>>),
  opts?: UpdateOpts<U>
) => void;

type CutFunctionType = (
  index?: number,
  options?: { waitForSync?: boolean }
) => void;

export type InferArrayElement<T> = T extends (infer U)[] ? U : never;

export type ArrayEndType<TShape extends unknown> = {
  findWith: findWithFuncType<InferArrayElement<TShape>>;
  index: (index: number) => StateObject<InferArrayElement<TShape>> & {
    insert: PushArgs<InferArrayElement<TShape>>;
    cut: CutFunctionType;
    _index: number;
  } & EndType<InferArrayElement<TShape>>;
  insert: PushArgs<InferArrayElement<TShape>>;
  cut: CutFunctionType;
  cutByValue: (value: string | number | boolean) => void;
  toggleByValue: (value: string | number | boolean) => void;
  stateSort: (
    compareFn: (
      a: InferArrayElement<TShape>,
      b: InferArrayElement<TShape>
    ) => number
  ) => ArrayEndType<TShape>;

  stateMapNoRender: (
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
    payload: UpdateArg<InferArrayElement<TShape>>,
    fields?: (keyof InferArrayElement<TShape>)[],
    onMatch?: (existingItem: any) => any
  ) => void;
  stateFilter: (
    callbackfn: (value: InferArrayElement<TShape>, index: number) => void
  ) => ArrayEndType<TShape>;
  getSelected: () => StateObject<InferArrayElement<TShape>> | undefined;
  getSelectedIndex: () => number;
} & EndType<TShape> & {
    [K in keyof (any[] extends infer T ? T : never)]: never;
  };

export type UpdateType<T> = (
  payload: UpdateArg<Prettify<T>>,
  opts?: UpdateOpts<T>
) => void;
export type FormOptsType = {
  key?: string;
  validation?: {
    hideMessage?: boolean;
    message?: string;
    stretch?: boolean;
    props?: GenericObject;
    disable?: boolean;
  };
  formElements?: boolean;
  debounceTime?: number;
  stateServerDifferences?: string[][];
};

export type FormControl<T> = (obj: FormElementParams<T>) => JSX.Element;

export type UpdateArg<S> = S | ((prevState: S) => S);
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
type EffectFunction<T, R> = (state: T) => R;
export type EndType<T, IsArrayElement = false> = {
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
  getFormRef: () => React.RefObject<any> | undefined;
  removeStorage: () => void;
  validationWrapper: ({
    children,
    hideMessage,
  }: {
    children: React.ReactNode;
    hideMessage?: boolean;
  }) => JSX.Element;
  lastSynced?: SyncInfo;
} & (IsArrayElement extends true ? { cut: () => void } : {}) & {
    [K in keyof (any extends infer T ? T : never)]: never;
  };

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
  newStateOrFunction:
    | TStateObject
    | ((prevState: TStateObject) => TStateObject),
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
  zodSchema?: ZodObject<ZodRawShape> | ZodArray<ZodObject<ZodRawShape>>;
  onBlur?: boolean;
};

export type OptionsType<T extends unknown = unknown> = {
  log?: boolean;
  componentId?: string;
  serverSync?: ServerSyncType<T>;
  validation?: ValidationOptionsType;
  enableServerState?: boolean;
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
  dependencies?: any[]; // Just like useEffect dependencies
};
export type ServerSyncType<T> = {
  testKey?: string;
  syncKey: (({ state }: { state: T }) => string) | string;
  syncFunction: ({ state }: { state: T }) => void;
  debounce?: number;
  mutation: UseMutationResult<any, unknown, any, unknown>;
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
          mergedOptions[key] !== options[key]
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

export const createCogsState = <State extends Record<string, unknown>>(
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
        initialState: options?.initialState,
        dependencies: options?.dependencies,
      }
    );

    return updater;
  };

  function setCogsOptions<StateKey extends StateKeys>(
    stateKey: StateKey,
    options: OptionsType<(typeof statePart)[StateKey]>
  ) {
    setOptions({ stateKey, options, initialOptionsPart });
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

const loadFromLocalStorage = (localStorageKey: string) => {
  if (!localStorageKey) return null;

  try {
    const storedData = window.localStorage.getItem(localStorageKey);
    if (!storedData) return null;

    const parsedData = JSON.parse(storedData);

    return parsedData;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

const saveToLocalStorage = <T,>(
  state: T,
  thisKey: string,
  currentInitialOptions: any,
  sessionId?: string
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
    const data: LocalStorageData<T> = {
      state,
      lastUpdated: Date.now(),
      lastSyncedWithServer:
        getGlobalStore.getState().serverSyncLog[thisKey]?.[0]?.timeStamp,
      baseServerState: getGlobalStore.getState().serverState[thisKey],
    };

    const storageKey = `${sessionId}-${thisKey}-${key}`;

    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }
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

export function useCogsStateFn<TStateObject extends unknown>(
  stateObject: TStateObject,
  {
    stateKey,
    serverSync,
    localStorage,
    formElements,
    middleware,
    reactiveDeps,
    reactiveType,
    componentId,
    initialState,
    syncUpdate,
    dependencies,
  }: {
    stateKey?: string;
    componentId?: string;
  } & OptionsType<TStateObject> = {}
) {
  const [reactiveForce, forceUpdate] = useState({}); //this is the key to reactivity
  const { sessionId } = useCogsConfig();

  let noStateKey = stateKey ? false : true;
  const [thisKey] = useState(stateKey ?? uuidv4());
  const stateLog = getGlobalStore.getState().stateLog[thisKey];
  const componentUpdatesRef = useRef(new Set<string>());
  const componentIdRef = useRef(componentId ?? uuidv4());
  const latestInitialOptionsRef = useRef<any>(null);
  latestInitialOptionsRef.current = getInitialOptions(thisKey as string);

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
    if (initialState) {
      setAndMergeOptions(thisKey as string, {
        initialState,
      });
    }

    const options = latestInitialOptionsRef.current;
    let localData = null;

    const localkey = isFunction(options?.localStorage?.key)
      ? options?.localStorage?.key(initialState)
      : options?.localStorage?.key;

    console.log("newoptions", options);
    console.log("localkey", localkey);
    console.log("initialState", initialState);

    if (localkey && sessionId) {
      localData = loadFromLocalStorage(
        sessionId + "-" + thisKey + "-" + localkey
      );
    }
    const createdState =
      getGlobalStore.getState().iniitialCreatedState[thisKey];
    console.log("createdState - intiual", createdState, initialState);
    let newState = null;
    let loadingLocalData = false;

    if (initialState) {
      newState = initialState;

      if (localData) {
        if (localData.lastUpdated > (localData.lastSyncedWithServer || 0)) {
          newState = localData.state;
          if (options?.localStorage?.onChange) {
            options?.localStorage?.onChange(newState);
          }
        }
      }
      console.log("newState thius is newstate", newState);

      updateGlobalState(
        thisKey,
        initialState,
        newState,
        effectiveSetState,
        componentIdRef.current,
        sessionId
      );

      notifyComponents(thisKey);

      const reactiveTypes = Array.isArray(reactiveType)
        ? reactiveType
        : [reactiveType || "component"];
      console.log("reactiveTypes.............................", reactiveTypes);
      if (!reactiveTypes.includes("none")) {
        forceUpdate({});
      }
    }
  }, [initialState, ...(dependencies || [])]);

  useLayoutEffect(() => {
    if (noStateKey) {
      setAndMergeOptions(thisKey as string, {
        serverSync,
        formElements,
        initialState,
        localStorage,
        middleware,
      });
    }

    const depsKey = `${thisKey}////${componentIdRef.current}`;
    const stateEntry = getGlobalStore
      .getState()
      .stateComponents.get(thisKey) || {
      components: new Map(),
    };

    stateEntry.components.set(depsKey, {
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
      const depsKey = `${thisKey}////${componentIdRef.current}`;

      if (stateEntry) {
        stateEntry.components.delete(depsKey);
        if (stateEntry.components.size === 0) {
          getGlobalStore.getState().stateComponents.delete(thisKey);
        }
      }
    };
  }, []);

  const effectiveSetState = (
    newStateOrFunction:
      | TStateObject
      | ((prevState: TStateObject) => TStateObject),
    path: string[],
    updateObj: { updateType: "insert" | "cut" | "update" },
    validationKey?: string
  ) => {
    if (Array.isArray(path)) {
      const pathKey = `${thisKey}-${path.join(".")}`;
      componentUpdatesRef.current.add(pathKey);
    }
    setState(thisKey, (prevValue: TStateObject) => {
      const payload = isFunction<TStateObject>(newStateOrFunction)
        ? newStateOrFunction(prevValue as TStateObject)
        : newStateOrFunction;

      const signalId = `${thisKey}-${path.join(".")}`;
      if (signalId) {
        let isArrayOperation = false;
        let elements = getGlobalStore
          .getState()
          .signalDomElements.get(signalId);

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
            elements = getGlobalStore
              .getState()
              .signalDomElements.get(arraySignalId);
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
        (validationKey || latestInitialOptionsRef.current?.validationKey) &&
        path
      ) {
        removeValidationError(
          (validationKey || latestInitialOptionsRef.current?.validationKey) +
            "." +
            path.join(".")
        );
      }
      const arrayWithoutIndex = path.slice(0, path.length - 1);
      if (
        updateObj.updateType === "cut" &&
        latestInitialOptionsRef.current?.validationKey
      ) {
        removeValidationError(
          latestInitialOptionsRef.current?.validationKey +
            "." +
            arrayWithoutIndex.join(".")
        );
      }
      if (
        updateObj.updateType === "insert" &&
        latestInitialOptionsRef.current?.validationKey
      ) {
        let getValidation = getValidationErrors(
          latestInitialOptionsRef.current?.validationKey +
            "." +
            arrayWithoutIndex.join(".")
        );

        //TODO this is untested its supposed to cahnge teh validation errors alreaady stored when a new entry is push

        getValidation.filter(([k, v]) => {
          let length = k?.split(".").length;

          if (
            k == arrayWithoutIndex.join(".") &&
            length == arrayWithoutIndex.length - 1
          ) {
            //   console.log(length, pathWithoutIndex.length);
            let newKey = k + "." + arrayWithoutIndex;
            removeValidationError(k!);
            addValidationError(newKey, v!);
          }
        });
      }

      const oldValue = getNestedValue(prevValue, path);
      const newValue = getNestedValue(payload, path);
      const pathToCheck =
        updateObj.updateType === "update"
          ? path.join(".")
          : [...path].slice(0, -1).join(".");
      const stateEntry = getGlobalStore.getState().stateComponents.get(thisKey);
      console.log(
        "pathetocaheck.............................",
        pathToCheck,
        stateEntry
      );
      if (stateEntry) {
        for (const [key, component] of stateEntry.components.entries()) {
          let shouldUpdate = false;
          const reactiveTypes = Array.isArray(component.reactiveType)
            ? component.reactiveType
            : [component.reactiveType || "component"];
          console.log("component.............................", key, component);
          // Skip if reactivity is disabled
          if (reactiveTypes.includes("none")) {
            continue;
          }

          // Force update if "all" is specified
          if (reactiveTypes.includes("all")) {
            component.forceUpdate();

            continue;
          }

          // Check component-level path reactivity
          if (reactiveTypes.includes("component")) {
            console.log(
              "component.............................includes(component1111",
              key,
              component.paths,
              pathToCheck
            );
            if (
              component.paths &&
              (component.paths.has(pathToCheck) || component.paths.has(""))
            ) {
              console.log(
                "component.............................includes(component22222",
                key,
                component
              );
              shouldUpdate = true;
            }
          }

          // Check dependency-based reactivity
          if (!shouldUpdate && reactiveTypes.includes("deps")) {
            console.log(
              "component.............................includes(deps",
              key,
              component
            );
            if (component.depsFunction) {
              const depsResult = component.depsFunction(payload);
              console.log(
                "depsResult.............................includes(deps",
                component.deps,
                depsResult
              );
              if (typeof depsResult === "boolean") {
                if (depsResult) {
                  shouldUpdate = true;
                }
              } else if (!isDeepEqual(component.deps, depsResult)) {
                component.deps = depsResult;
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

      const newUpdate = {
        timeStamp,
        stateKey: thisKey,
        path,
        updateType: updateObj.updateType,
        status: "new" as const,
        oldValue,
        newValue,
      } satisfies UpdateTypeDetail;

      setStateLog(thisKey, (prevLogs) => {
        const logs = [...(prevLogs ?? []), newUpdate];

        // Aggregate the updates by stateKey and path
        const aggregatedLogs = logs.reduce((acc, log) => {
          const uniqueKey = `${log.stateKey}:${JSON.stringify(log.path)}`;
          const existing = acc.get(uniqueKey);

          if (existing) {
            // Update the existing entry with the most recent details
            existing.timeStamp = Math.max(existing.timeStamp, log.timeStamp);
            existing.newValue = log.newValue; // Overwrite with the latest value
            existing.oldValue = existing.oldValue ?? log.oldValue; // Retain the initial oldValue
            existing.updateType = log.updateType; // Update to the most recent type
          } else {
            // Add the log if no existing match is found
            acc.set(uniqueKey, { ...(log as any) });
          }

          return acc;
        }, new Map<string, typeof newUpdate>());

        // Convert the aggregated map back to an array
        return Array.from(aggregatedLogs.values());
      });

      saveToLocalStorage(
        payload,
        thisKey,
        latestInitialOptionsRef.current,
        sessionId
      );

      if (middleware) {
        middleware({
          updateLog: stateLog,
          update: newUpdate,
        });
      }
      if (latestInitialOptionsRef.current?.serverSync) {
        const serverStateStore = getGlobalStore.getState().serverState[thisKey];
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
    // Create proxy with baseObject as target
    return createProxyHandler<TStateObject>(
      thisKey,
      effectiveSetState,
      componentIdRef.current,
      sessionId
    );
  }, [thisKey]);

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
  // ADDED: Enhanced cache with versioning
  type CacheEntry = {
    proxy: any;
    stateVersion: number;
  };
  const shapeCache = new Map<string, CacheEntry>();
  let stateVersion = 0;

  // ADDED: Cache invalidation helper
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

      getGlobalStore.getState().clearSelectedIndexesForState(stateKey);
      // ADDED: Clear cache on revert
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
      // ADDED: Clear cache on initial state update
      shapeCache.clear();
      stateVersion++;

      const newUpdaterState = createProxyHandler(
        stateKey,
        effectiveSetState,
        componentId,
        sessionId
      );
      startTransition(() => {
        updateInitialStateGlobal(stateKey, newState);
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

  function rebuildStateShape(
    currentState: T,
    path: string[] = [],
    meta?: { filtered?: string[][]; validIndices?: number[] }
  ): any {
    const cacheKey = path.map(String).join(".");

    // MODIFIED: Cache check with version
    const cachedEntry = shapeCache.get(cacheKey);
    // if (cachedEntry?.stateVersion === stateVersion) {
    //     return cachedEntry.proxy;
    // }
    type CallableStateObject<T> = {
      (): T;
    } & {
      [key: string]: any;
    };

    const baseFunction = function () {
      return getGlobalStore().getNestedState(stateKey, path);
    } as unknown as CallableStateObject<T>;

    // Copy properties from baseObj to the function with type assertion
    Object.keys(baseObj).forEach((key) => {
      (baseFunction as any)[key] = (baseObj as any)[key];
    });

    const handler = {
      apply(target: any, thisArg: any, args: any[]) {
        console.log(
          `PROXY APPLY TRAP HIT: stateKey=${stateKey}, path=${path.join(".")}`
        ); // <--- ADD LOGGING
        console.trace("Apply trap stack trace");
        return getGlobalStore().getNestedState(stateKey, path);
      },

      get(target: any, prop: string) {
        if (
          prop !== "then" &&
          !prop.startsWith("$") &&
          prop !== "stateMapNoRender"
        ) {
          const currentPath = path.join(".");
          const fullComponentId = `${stateKey}////${componentId}`;

          const stateEntry = getGlobalStore
            .getState()
            .stateComponents.get(stateKey);

          if (stateEntry) {
            const component = stateEntry.components.get(fullComponentId);

            if (component) {
              // Only add paths for non-root or specifically for get() at root
              if (path.length > 0 || prop === "get") {
                component.paths.add(currentPath);
              }
            } else {
            }
          }
        }
        if (prop === "_status") {
          // Get current state at this path (non-reactive version)
          const thisReactiveState = getGlobalStore
            .getState()
            .getNestedState(stateKey, path);

          // Get initial state at this path
          const initialState =
            getGlobalStore.getState().initialStateGlobal[stateKey];
          const initialStateAtPath = getNestedValue(initialState, path);

          // Simply compare current state with initial state
          if (isDeepEqual(thisReactiveState, initialStateAtPath)) {
            return "fresh"; // Matches initial state
          } else {
            return "stale"; // Different from initial state
          }
        }
        if (prop === "getStatus") {
          return function () {
            // Get current state at this path (reactive version)
            const thisReactiveState = getGlobalStore().getNestedState(
              stateKey,
              path
            );

            // Get initial state at this path
            const initialState =
              getGlobalStore.getState().initialStateGlobal[stateKey];
            const initialStateAtPath = getNestedValue(initialState, path);
            // Simply compare current state with initial state
            if (isDeepEqual(thisReactiveState, initialStateAtPath)) {
              return "fresh"; // Matches initial state
            } else {
              return "stale"; // Different from initial state
            }
          };
        }
        if (prop === "removeStorage") {
          return () => {
            const initialState =
              getGlobalStore.getState().initialStateGlobal[stateKey];
            const initalOptionsGet = getInitialOptions(stateKey as string);
            const localKey = isFunction(initalOptionsGet?.localStorage?.key)
              ? initalOptionsGet?.localStorage?.key(initialState)
              : initalOptionsGet?.localStorage?.key;

            const storageKey = `${sessionId}-${stateKey}-${localKey}`;
            console.log("removing storage", storageKey);
            if (storageKey) {
              localStorage.removeItem(storageKey);
            }
          };
        }
        if (prop === "showValidationErrors") {
          return () => {
            const init = getGlobalStore
              .getState()
              .getInitialOptions(stateKey)?.validation;

            if (!init?.key) {
              throw new Error("Validation key not found");
            }
            const errors = getGlobalStore
              .getState()
              .getValidationErrors(init.key + "." + path.join("."));

            return errors;
          };
        }
        if (Array.isArray(currentState)) {
          if (prop === "getSelected") {
            return () => {
              const selectedIndex = getGlobalStore
                .getState()
                .getSelectedIndex(stateKey, path.join("."));
              if (selectedIndex === undefined) return undefined;
              return rebuildStateShape(
                currentState[selectedIndex],
                [...path, selectedIndex.toString()],
                meta
              );
            };
          }
          if (prop === "getSelectedIndex") {
            return () => {
              const selectedIndex = getGlobalStore
                .getState()
                .getSelectedIndex(stateKey, path.join("."));

              return selectedIndex ?? -1;
            };
          }
          if (prop === "stateSort") {
            return (
              compareFn: (
                a: InferArrayElement<T>,
                b: InferArrayElement<T>
              ) => number
            ) => {
              const currentArray = getGlobalStore
                .getState()
                .getNestedState(stateKey, path) as any[];

              // Create a shallow copy with original indices
              const arrayCopy = currentArray.map((v: any, i: number) => ({
                ...v,
                __origIndex: i.toString(),
              }));

              // Sort the copy using the provided compare function
              const sortedArray = [...arrayCopy].sort(compareFn);

              // ADDED: Clear cache for sort operation
              shapeCache.clear();
              stateVersion++;

              // Return the sorted array with state objects
              return rebuildStateShape(sortedArray as any, path, {
                filtered: [...(meta?.filtered || []), path],
                validIndices: sortedArray.map((item) =>
                  parseInt(item.__origIndex as string)
                ),
              });
            };
          }
          if (prop === "stateMap" || prop === "stateMapNoRender") {
            return (
              callbackfn: (
                value: InferArrayElement<T>,
                setter: StateObject<InferArrayElement<T>>,
                index: number,
                array: T,
                arraySetter: StateObject<T>
              ) => void
            ) => {
              const isFiltered = meta?.filtered?.some(
                (p) => p.join(".") === path.join(".")
              );
              const arrayToMap = isFiltered
                ? currentState
                : getGlobalStore.getState().getNestedState(stateKey, path);

              if (prop !== "stateMapNoRender") {
                shapeCache.clear();
                stateVersion++;
              }

              return arrayToMap.map((val: any, index: number) => {
                const thisIndex =
                  isFiltered && val.__origIndex ? val.__origIndex : index;
                const elementProxy = rebuildStateShape(
                  val,
                  [...path, thisIndex.toString()],
                  meta
                );
                return callbackfn(
                  val,
                  elementProxy,
                  index,
                  currentState as any,
                  rebuildStateShape(currentState as any, path, meta)
                );
              });
            };
          }
          if (prop === "$stateMap") {
            return (
              callbackfn: (
                value: InferArrayElement<T>,
                setter: StateObject<InferArrayElement<T>>,
                index: number,
                array: T,
                arraySetter: StateObject<T>
              ) => void
            ) => {
              return createElement(SignalMapRenderer, {
                proxy: {
                  _stateKey: stateKey,
                  _path: path,
                  _mapFn: callbackfn as any, // Pass the actual function, not string
                },

                rebuildStateShape,
              });
            };
          }
          if (prop === "stateFlattenOn") {
            return (fieldName: string) => {
              const isFiltered = meta?.filtered?.some(
                (p) => p.join(".") === path.join(".")
              );
              const arrayToMap = isFiltered
                ? currentState
                : getGlobalStore.getState().getNestedState(stateKey, path);

              // ADDED: Clear shape cache for flattening operation
              shapeCache.clear();
              stateVersion++;

              const flattenedResults = arrayToMap.flatMap(
                (val: any, index: number) => {
                  return val[fieldName] ?? [];
                }
              );

              return rebuildStateShape(
                flattenedResults,
                [...path, "[*]", fieldName],
                meta
              );
            };
          }

          if (prop === "findWith") {
            return (
              thisKey: keyof InferArrayElement<T>,
              thisValue: InferArrayElement<T>[keyof InferArrayElement<T>]
            ) => {
              const foundIndex = currentState.findIndex(
                (obj: any) => obj[thisKey] === thisValue
              );
              if (foundIndex === -1) return undefined;
              const foundValue = currentState[foundIndex];
              const newPath = [...path, foundIndex.toString()];
              // console.log(
              //     "findWithfindWithfindWithfindWith",
              //     stateKey,
              //     foundValue,
              //     newPath,
              // );
              shapeCache.clear();
              stateVersion++;

              // ADDED: Clear cache for find operation
              shapeCache.clear();
              stateVersion++;
              // Try returning without spread
              return rebuildStateShape(foundValue, newPath);
            };
          }

          if (prop === "index") {
            return (index: number) => {
              const indexValue = currentState[index];
              return rebuildStateShape(indexValue, [...path, index.toString()]);
            };
          }

          if (prop === "insert") {
            return (payload: UpdateArg<T>) => {
              // ADDED: Invalidate cache on insert
              invalidateCachePath(path);
              pushFunc(effectiveSetState, payload, path, stateKey);
              return rebuildStateShape(
                getGlobalStore.getState().cogsStateStore[stateKey],
                []
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
                if (fields) {
                  const isMatch = fields.every((field) =>
                    isDeepEqual(item[field], newValue[field])
                  );
                  if (isMatch) {
                    matchedItem = item;
                  }
                  return isMatch;
                }
                const isMatch = isDeepEqual(item, newValue);
                if (isMatch) {
                  matchedItem = item;
                }
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
              // ADDED: Invalidate cache on cut
              invalidateCachePath(path);
              cutFunc(effectiveSetState, path, stateKey, index);
            };
          }
          if (prop === "cutByValue") {
            return (value: string | number | boolean) => {
              for (let index = 0; index < currentState.length; index++) {
                if (currentState[index] === value) {
                  cutFunc(effectiveSetState, path, stateKey, index);
                }
              }
            };
          }
          if (prop === "toggleByValue") {
            return (value: string | number | boolean) => {
              const index = currentState.findIndex((item) => item === value);
              if (index > -1) {
                // Value exists, so cut it
                cutFunc(effectiveSetState, path, stateKey, index);
              } else {
                // Value doesn't exist, so insert it
                pushFunc(effectiveSetState, value as any, path, stateKey);
              }
            };
          }

          if (prop === "stateFilter") {
            return (
              callbackfn: (
                value: InferArrayElement<T>,
                index: number
              ) => boolean
            ) => {
              const newVal = currentState.map((v: any, i: number) => ({
                ...v,
                __origIndex: i.toString(),
              }));

              const validIndices: number[] = [];
              const filteredArray: Array<InferArrayElement<T>> = [];

              for (let i = 0; i < newVal.length; i++) {
                if (callbackfn(newVal[i], i)) {
                  validIndices.push(i);
                  filteredArray.push(newVal[i]);
                }
              }

              // ADDED: Clear cache for filter operation
              shapeCache.clear();
              stateVersion++;

              // Always include validIndices, even if it's an empty array
              return rebuildStateShape(filteredArray as any, path, {
                filtered: [...(meta?.filtered || []), path],
                validIndices: validIndices, // Always pass validIndices, even if empty
              });
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
          return () => getGlobalStore.getState().getNestedState(stateKey, path);
        }
        if (prop === "$derive") {
          return (fn: any) =>
            $cogsSignal({
              _stateKey: stateKey,
              _path: path,
              _effect: fn.toString(),
            });
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
          return () =>
            $cogsSignal({
              _stateKey: stateKey,
              _path: path,
            });
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
          const parent = getGlobalStore
            .getState()
            .getNestedState(stateKey, parentPath);
          if (Array.isArray(parent)) {
            const currentIndex = Number(path[path.length - 1]);
            return (
              currentIndex ===
              getGlobalStore.getState().getSelectedIndex(stateKey, parentKey)
            );
          }
          return undefined;
        }
        if (prop === "setSelected") {
          return (value: boolean) => {
            const parentPath = path.slice(0, -1);
            const thisIndex = Number(path[path.length - 1]);
            const parentKey = parentPath.join(".");

            if (value) {
              getGlobalStore
                .getState()
                .setSelectedIndex(stateKey, parentKey, thisIndex);
            } else {
              getGlobalStore
                .getState()
                .setSelectedIndex(stateKey, parentKey, undefined);
            }

            const nested = getGlobalStore
              .getState()
              .getNestedState(stateKey, [...parentPath]);
            updateFn(effectiveSetState, nested, parentPath);

            // Invalidate cache for this path
            invalidateCachePath(parentPath);
          };
        }
        if (path.length == 0) {
          if (prop === "validateZodSchema") {
            return () => {
              const init = getGlobalStore
                .getState()
                .getInitialOptions(stateKey)?.validation;
              const addValidationError =
                getGlobalStore.getState().addValidationError;

              if (!init?.zodSchema) {
                throw new Error("Zod schema not found");
              }

              if (!init?.key) {
                throw new Error("Validation key not found");
              }
              removeValidationError(init.key);
              const thisObject =
                getGlobalStore.getState().cogsStateStore[stateKey];

              try {
                // First clear any existing validation errors for this schema
                // This ensures we don't have stale errors
                const existingErrors = getGlobalStore
                  .getState()
                  .getValidationErrors(init.key);
                if (existingErrors && existingErrors.length > 0) {
                  existingErrors.forEach(([errorPath]) => {
                    if (errorPath && errorPath.startsWith(init.key!)) {
                      removeValidationError(errorPath);
                    }
                  });
                }

                // Attempt to validate with Zod
                const result = init.zodSchema.safeParse(thisObject);

                if (!result.success) {
                  // Process Zod errors and add them to the validation store
                  const zodErrors = result.error.errors;

                  zodErrors.forEach((error) => {
                    const errorPath = error.path;
                    const errorMessage = error.message;

                    // Build the full path for the validation error
                    // Format: validationKey.path.to.field
                    const fullErrorPath = [init.key, ...errorPath].join(".");

                    // Add the error to the store
                    addValidationError(fullErrorPath, errorMessage);
                  });

                  notifyComponents(stateKey);

                  return false;
                }

                return true;
              } catch (error) {
                console.error("Zod schema validation failed", error);
                return false;
              }
            };
          }
          if (prop === "_componentId") return componentId;
          if (prop === "getComponents") {
            return () => getGlobalStore().stateComponents.get(stateKey);
          }
          if (prop === "getAllFormRefs") {
            return () => {
              return formRefStore.getState().getFormRefsByStateKey(stateKey);
            };
          }

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
          return () => {
            return formRefStore
              .getState()
              .getFormRef(stateKey + "." + path.join("."));
          };
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
              validationKey={
                getGlobalStore.getState().getInitialOptions(stateKey)
                  ?.validation?.key || ""
              }
              stateKey={stateKey}
              validIndices={meta?.validIndices}
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
            // ADDED: Invalidate cache on update
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
          return (child: FormControl<T>, formOpts?: FormOptsType) => {
            return (
              <FormControlComponent<T>
                setState={effectiveSetState}
                stateKey={stateKey}
                path={path}
                child={child}
                formOpts={formOpts}
              />
            );
          };
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
    meta?: { filtered?: string[][]; validIndices?: number[] }
  ) => any;
}) {
  const value = getGlobalStore().getNestedState(proxy._stateKey, proxy._path);

  if (!Array.isArray(value)) {
    return null;
  }
  const arraySetter = rebuildStateShape(
    value,
    proxy._path
  ) as ArrayEndType<any>;
  // Use existing global state management
  return arraySetter.stateMapNoRender(
    (item, setter, index, value, arraysetter) => {
      // Execute map function in React context with existing state/proxies
      return proxy._mapFn(item, setter, index, value, arraysetter);
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

    // Get the raw value from the store
    const value = getGlobalStore
      .getState()
      .getNestedState(proxy._stateKey, proxy._path);

    let displayValue;
    if (proxy._effect) {
      try {
        displayValue = new Function(
          "state",
          `return (${proxy._effect})(state)`
        )(value);
      } catch (err) {
        console.error("Error evaluating effect function during mount:", err);
        displayValue = value; // Fallback to raw value
      }
    } else {
      displayValue = value;
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
        .stateComponents.get(proxy._stateKey) || {
        components: new Map(),
      };
      stateEntry.components.set(proxy._stateKey, {
        forceUpdate: notify,
        paths: new Set([proxy._path.join(".")]),
      });
      return () => stateEntry.components.delete(proxy._stateKey);
    },
    () => getGlobalStore.getState().getNestedState(proxy._stateKey, proxy._path)
  );
  return createElement("text", {}, String(value));
}
