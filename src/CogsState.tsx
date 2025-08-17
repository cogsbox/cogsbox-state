'use client';

import {
  createElement,
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

import {
  getDifferences,
  isArray,
  isFunction,
  type GenericObject,
} from './utility.js';
import {
  FormElementWrapper,
  IsolatedComponentWrapper,
  MemoizedCogsItemWrapper,
  ValidationWrapper,
} from './Components.js';
import { isDeepEqual, transformStateFunc } from './utility.js';
import superjson from 'superjson';
import { v4 as uuidv4 } from 'uuid';

import {
  formRefStore,
  getGlobalStore,
  ValidationError,
  ValidationSeverity,
  ValidationStatus,
  type ComponentsType,
} from './store.js';
import { useCogsConfig } from './CogsStateClient.js';
import { Operation } from 'fast-json-patch';

import * as z3 from 'zod/v3';
import * as z4 from 'zod/v4';

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
  virtualState: StateObject<T>;
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
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
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
  $stream: <T = Prettify<InferArrayElement<TShape>>, R = T>(
    options?: StreamOptions<T, R>
  ) => StreamHandle<T>;
  $findWith: findWithFuncType<Prettify<InferArrayElement<TShape>>>;
  $index: (index: number) => StateObject<
    Prettify<InferArrayElement<TShape>>
  > & {
    $insert: InsertTypeObj<Prettify<InferArrayElement<TShape>>>;
    $cut: CutFunctionType<TShape>;
    $_index: number;
  } & EndType<Prettify<InferArrayElement<TShape>>>;
  $insert: InsertType<Prettify<InferArrayElement<TShape>>>;
  $cut: CutFunctionType<TShape>;
  $cutSelected: () => void;
  $cutByValue: (value: string | number | boolean) => void;
  $toggleByValue: (value: string | number | boolean) => void;
  $stateSort: (
    compareFn: (
      a: Prettify<InferArrayElement<TShape>>,
      b: Prettify<InferArrayElement<TShape>>
    ) => number
  ) => ArrayEndType<TShape>;
  $useVirtualView: (
    options: VirtualViewOptions
  ) => VirtualStateObjectResult<Prettify<InferArrayElement<TShape>>[]>;

  $stateList: (
    callbackfn: (
      setter: StateObject<Prettify<InferArrayElement<TShape>>>,
      index: number,
      arraySetter: StateObject<TShape>
    ) => void
  ) => any;
  $stateMap: <U>(
    callbackfn: (
      setter: StateObject<Prettify<InferArrayElement<TShape>>>,
      index: number,
      arraySetter: StateObject<TShape>
    ) => U
  ) => U[];

  $stateFlattenOn: <K extends keyof Prettify<InferArrayElement<TShape>>>(
    field: K
  ) => StateObject<InferArrayElement<Prettify<InferArrayElement<TShape>>[K]>[]>;
  $uniqueInsert: (
    payload: InsertParams<Prettify<InferArrayElement<TShape>>>,
    fields?: (keyof Prettify<InferArrayElement<TShape>>)[],
    onMatch?: (existingItem: any) => any
  ) => void;
  $stateFind: (
    callbackfn: (
      value: Prettify<InferArrayElement<TShape>>,
      index: number
    ) => boolean
  ) => StateObject<Prettify<InferArrayElement<TShape>>> | undefined;
  $stateFilter: (
    callbackfn: (
      value: Prettify<InferArrayElement<TShape>>,
      index: number
    ) => void
  ) => ArrayEndType<TShape>;
  $getSelected: () =>
    | StateObject<Prettify<InferArrayElement<TShape>>>
    | undefined;
  $clearSelected: () => void;
  $getSelectedIndex: () => number;
  $last: () => StateObject<Prettify<InferArrayElement<TShape>>> | undefined;
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

type EffectFunction<T, R> = (state: T, deps: any[]) => R;
export type EndType<T, IsArrayElement = false> = {
  $addZodValidation: (errors: ValidationError[]) => void;
  $clearZodValidation: (paths?: string[]) => void;
  $applyJsonPatch: (patches: any[]) => void;
  $update: UpdateType<T>;
  $_path: string[];
  $_stateKey: string;
  $isolate: (
    renderFn: (state: StateObject<T>) => React.ReactNode
  ) => JSX.Element;
  $formElement: (control: FormControl<T>, opts?: FormOptsType) => JSX.Element;
  $get: () => T;
  $$get: () => T;
  $$derive: <R>(fn: EffectFunction<T, R>) => R;
  $_status: 'fresh' | 'dirty' | 'synced' | 'restored' | 'unknown';
  $getStatus: () => 'fresh' | 'dirty' | 'synced' | 'restored' | 'unknown';
  $showValidationErrors: () => string[];
  $setValidation: (ctx: string) => void;
  $removeValidation: (ctx: string) => void;
  $ignoreFields: (fields: string[]) => StateObject<T>;
  $isSelected: boolean;
  $setSelected: (value: boolean) => void;
  $toggleSelected: () => void;
  $getFormRef: () => React.RefObject<any> | undefined;
  $removeStorage: () => void;
  $sync: () => void;
  $validationWrapper: ({
    children,
    hideMessage,
  }: {
    children: React.ReactNode;
    hideMessage?: boolean;
  }) => JSX.Element;
  $lastSynced?: SyncInfo;
} & (IsArrayElement extends true ? { $cutThis: () => void } : {});

export type StateObject<T> = (T extends any[]
  ? ArrayEndType<T>
  : T extends Record<string, unknown> | object
    ? { [K in keyof T]-?: StateObject<T[K]> }
    : T extends string | number | boolean | null
      ? EndType<T, true>
      : never) &
  EndType<T, true> & {
    $toggle: T extends boolean ? () => void : never;
    $getAllFormRefs: () => Map<string, React.RefObject<any>>;
    $_componentId: string | null;
    $getComponents: () => ComponentsType;

    $_initialState: T;
    $updateInitialState: (newState: T | null) => {
      fetchId: (field: keyof T) => string | number;
    };
    $_isLoading: boolean;
    $_serverState: T;
    $revertToInitialState: (obj?: { validationKey?: string }) => T;

    $middleware: (
      middles: ({
        updateLog,
        update,
      }: {
        updateLog: UpdateTypeDetail[] | undefined;
        update: UpdateTypeDetail;
      }) => void
    ) => void;

    $getLocalStorage: (key: string) => LocalStorageData<T> | null;
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
    | EffectiveSetStateArg<TStateObject, 'insert'>
    | null,
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
type UseSyncType<T> = (state: T, a: SyncOptionsType<any>) => SyncApi;
type SyncOptionsType<TApiParams> = {
  apiParams: TApiParams;
  stateKey?: string;
  stateRoom:
    | number
    | string
    | (({ clientId }: { clientId: string }) => string | null);
  connect?: boolean;
  inMemoryState?: boolean;
};
export type OptionsType<T extends unknown = unknown, TApiParams = never> = {
  log?: boolean;
  componentId?: string;
  syncOptions?: SyncOptionsType<TApiParams>;

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
          key?: string;
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
  middleware?: ({ update }: { update: UpdateTypeDetail }) => void;

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
    status: ValidationStatus;
    severity: ValidationSeverity;
    hasErrors: boolean;
    hasWarnings: boolean;
    allErrors: ValidationError[];

    path: string[];
    message?: string;
    getData?: () => T;
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

const {
  getInitialOptions,
  updateInitialStateGlobal,
  getShadowMetadata,
  setShadowMetadata,
  getShadowValue,
  initializeShadowState,
  updateShadowAtPath,
  insertShadowArrayElement,
  insertManyShadowArrayElements,
  removeShadowArrayElement,
  setInitialStateOptions,
  setServerStateUpdate,
  markAsDirty,
  addPathComponent,
  clearSelectedIndexesForState,
  addStateLog,
  setSyncInfo,
  clearSelectedIndex,
  getSyncInfo,
  notifyPathSubscribers,
  // Note: The old functions are no longer imported under their original names
} = getGlobalStore.getState();
function getArrayData(stateKey: string, path: string[], meta?: MetaData) {
  const shadowMeta = getShadowMetadata(stateKey, path);
  const isArray = !!shadowMeta?.arrayKeys;

  if (!isArray) {
    const value = getGlobalStore.getState().getShadowValue(stateKey, path);
    return { isArray: false, value, keys: [] };
  }
  const arrayPathKey = path.length > 0 ? path.join('.') : 'root';
  const viewIds = meta?.arrayViews?.[arrayPathKey] ?? shadowMeta.arrayKeys;

  // FIX: If the derived view is empty, return an empty array and keys.
  if (Array.isArray(viewIds) && viewIds.length === 0) {
    return { isArray: true, value: [], keys: [] };
  }

  const value = getGlobalStore
    .getState()
    .getShadowValue(stateKey, path, viewIds);

  return { isArray: true, value, keys: viewIds ?? [] };
}

function findArrayItem(
  array: any[],
  keys: string[],
  predicate: (item: any, index: number) => boolean
): { key: string; index: number; value: any } | null {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      const key = keys[i];
      if (key) {
        return { key, index: i, value: array[i] };
      }
    }
  }
  return null;
}

function setAndMergeOptions(stateKey: string, newOptions: OptionsType<any>) {
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

  // Always preserve syncOptions if it exists in mergedOptions but not in options
  if (
    mergedOptions.syncOptions &&
    (!options || !options.hasOwnProperty('syncOptions'))
  ) {
    needToAdd = true;
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

// Define the type for the options setter using the Transformed state
type SetCogsOptionsFunc<T extends Record<string, any>> = <
  StateKey extends keyof TransformedStateType<T>,
>(
  stateKey: StateKey,
  options: OptionsType<TransformedStateType<T>[StateKey]>
) => void;

export const createCogsState = <State extends Record<StateKeys, unknown>>(
  initialState: State,
  opt?: {
    formElements?: FormsElementsType<State>;
    validation?: ValidationOptionsType;
    __fromSyncSchema?: boolean;
    __syncNotifications?: Record<string, Function>;
    __apiParamsMap?: Record<string, any>;
    __useSync?: UseSyncType<State>;
    __syncSchemas?: Record<string, any>;
  }
) => {
  let newInitialState = initialState;
  const [statePart, initialOptionsPart] =
    transformStateFunc<State>(newInitialState);

  if (opt?.__fromSyncSchema && opt?.__syncNotifications) {
    getGlobalStore
      .getState()
      .setInitialStateOptions('__notifications', opt.__syncNotifications);
  }

  if (opt?.__fromSyncSchema && opt?.__apiParamsMap) {
    getGlobalStore
      .getState()
      .setInitialStateOptions('__apiParamsMap', opt.__apiParamsMap);
  }

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
    if (opt?.__syncSchemas?.[key]?.schemas?.validation) {
      mergedOptions.validation = {
        zodSchemaV4: opt.__syncSchemas[key].schemas.validation,
        ...existingOptions.validation,
      };
    }
    if (Object.keys(mergedOptions).length > 0) {
      const existingGlobalOptions = getInitialOptions(key);

      if (!existingGlobalOptions) {
        setInitialStateOptions(key, mergedOptions);
      } else {
        // Merge with existing global options
        setInitialStateOptions(key, {
          ...existingGlobalOptions,
          ...mergedOptions,
        });
      }
    }
  });

  Object.keys(statePart).forEach((key) => {
    initializeShadowState(key, statePart[key]);
  });

  type StateKeys = keyof typeof statePart;

  const useCogsState = <StateKey extends StateKeys>(
    stateKey: StateKey,
    options?: Prettify<OptionsType<(typeof statePart)[StateKey]>>
  ) => {
    const [componentId] = useState(options?.componentId ?? uuidv4());

    setOptions({
      stateKey,
      options,
      initialOptionsPart,
    });
    const thiState =
      getShadowValue(stateKey as string, []) || statePart[stateKey as string];
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
      syncOptions: options?.syncOptions,
      __useSync: opt?.__useSync as UseSyncType<(typeof statePart)[StateKey]>,
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

  return { useCogsState, setCogsOptions } as CogsApi<State, never>;
};
type UseCogsStateHook<
  T extends Record<string, any>,
  TApiParamsMap extends Record<string, any> = never,
> = <StateKey extends keyof TransformedStateType<T> & string>(
  stateKey: StateKey,
  options?: [TApiParamsMap] extends [never]
    ? // When TApiParamsMap is never (no sync)
      Prettify<OptionsType<TransformedStateType<T>[StateKey]>>
    : // When TApiParamsMap exists (sync enabled)
      StateKey extends keyof TApiParamsMap
      ? Prettify<
          OptionsType<
            TransformedStateType<T>[StateKey],
            TApiParamsMap[StateKey]
          > & {
            syncOptions: Prettify<SyncOptionsType<TApiParamsMap[StateKey]>>;
          }
        >
      : Prettify<OptionsType<TransformedStateType<T>[StateKey]>>
) => StateObject<TransformedStateType<T>[StateKey]>;

// Update CogsApi to default to never instead of Record<string, never>
type CogsApi<
  T extends Record<string, any>,
  TApiParamsMap extends Record<string, any> = never,
> = {
  useCogsState: UseCogsStateHook<T, TApiParamsMap>;
  setCogsOptions: SetCogsOptionsFunc<T>;
};
type GetParamType<SchemaEntry> = SchemaEntry extends {
  api?: { queryData?: { _paramType?: infer P } };
}
  ? P
  : never;

export function createCogsStateFromSync<
  TSyncSchema extends {
    schemas: Record<
      string,
      {
        schemas: { defaultValues: any };
        api?: {
          queryData?: any;
        };
        [key: string]: any;
      }
    >;
    notifications: Record<string, any>;
  },
>(
  syncSchema: TSyncSchema,
  useSync: UseSyncType<any>
): CogsApi<
  {
    [K in keyof TSyncSchema['schemas']]: TSyncSchema['schemas'][K]['schemas']['defaultValues'];
  },
  {
    [K in keyof TSyncSchema['schemas']]: GetParamType<
      TSyncSchema['schemas'][K]
    >;
  }
> {
  const schemas = syncSchema.schemas;
  const initialState: any = {};
  const apiParamsMap: any = {};

  // Extract defaultValues AND apiParams from each entry
  for (const key in schemas) {
    const entry = schemas[key];
    initialState[key] = entry?.schemas?.defaultValues || {};

    // Extract apiParams from the api.queryData._paramType
    if (entry?.api?.queryData?._paramType) {
      apiParamsMap[key] = entry.api.queryData._paramType;
    }
  }

  return createCogsState(initialState, {
    __fromSyncSchema: true,
    __syncNotifications: syncSchema.notifications,
    __apiParamsMap: apiParamsMap,
    __useSync: useSync,
    __syncSchemas: schemas,
  }) as any;
}

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
    const shadowMeta = getShadowMetadata(thisKey, []);

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
  const currentState = getShadowValue(stateKey, []);
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
  const stateEntry = getShadowMetadata(thisKey, []);
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

function markEntireStateAsServerSynced(
  stateKey: string,
  path: string[],
  data: any,
  timestamp: number
) {
  // Mark current path as synced
  const currentMeta = getShadowMetadata(stateKey, path);
  setShadowMetadata(stateKey, path, {
    ...currentMeta,
    isDirty: false,
    stateSource: 'server',
    lastServerSync: timestamp || Date.now(),
  });

  // If it's an array, mark each item as synced
  if (Array.isArray(data)) {
    const arrayMeta = getShadowMetadata(stateKey, path);
    if (arrayMeta?.arrayKeys) {
      arrayMeta.arrayKeys.forEach((itemKey, index) => {
        // Fix: Don't split the itemKey, just use it directly
        const itemPath = [...path, itemKey];
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
// 5. Batch queue
let updateBatchQueue: any[] = [];
let isFlushScheduled = false;

function scheduleFlush() {
  if (!isFlushScheduled) {
    isFlushScheduled = true;
    queueMicrotask(flushQueue);
  }
}
function handleUpdate(
  stateKey: string,
  path: string[],
  payload: any
): { type: 'update'; oldValue: any; newValue: any; shadowMeta: any } {
  // ✅ FIX: Get the old value before the update.
  const oldValue = getGlobalStore.getState().getShadowValue(stateKey, path);

  const newValue = isFunction(payload) ? payload(oldValue) : payload;

  // ✅ FIX: The new `updateShadowAtPath` handles metadata preservation automatically.
  // The manual loop has been removed.
  updateShadowAtPath(stateKey, path, newValue);

  markAsDirty(stateKey, path, { bubble: true });

  // Return the metadata of the node *after* the update.
  const newShadowMeta = getShadowMetadata(stateKey, path);

  return {
    type: 'update',
    oldValue: oldValue,
    newValue,
    shadowMeta: newShadowMeta,
  };
}
// 2. Update signals
function updateSignals(shadowMeta: any, displayValue: any) {
  if (!shadowMeta?.signals?.length) return;

  shadowMeta.signals.forEach(({ parentId, position, effect }: any) => {
    const parent = document.querySelector(`[data-parent-id="${parentId}"]`);
    if (!parent) return;

    const childNodes = Array.from(parent.childNodes);
    if (!childNodes[position]) return;

    let finalDisplayValue = displayValue;
    if (effect && displayValue !== null) {
      try {
        finalDisplayValue = new Function('state', `return (${effect})(state)`)(
          displayValue
        );
      } catch (err) {
        console.error('Error evaluating effect function:', err);
      }
    }

    if (finalDisplayValue !== null && typeof finalDisplayValue === 'object') {
      finalDisplayValue = JSON.stringify(finalDisplayValue);
    }

    childNodes[position].textContent = String(finalDisplayValue ?? '');
  });
}

function getComponentNotifications(
  stateKey: string,
  path: string[],
  result: any
): Set<any> {
  const rootMeta = getShadowMetadata(stateKey, []);

  if (!rootMeta?.components) {
    return new Set();
  }

  const componentsToNotify = new Set<any>();

  // --- PASS 1: Notify specific subscribers based on update type ---

  if (result.type === 'update') {
    // --- Bubble-up Notification ---
    // An update to `user.address.street` notifies listeners of `street`, `address`, and `user`.
    let currentPath = [...path];
    while (true) {
      const pathMeta = getShadowMetadata(stateKey, currentPath);

      if (pathMeta?.pathComponents) {
        pathMeta.pathComponents.forEach((componentId: string) => {
          const component = rootMeta.components?.get(componentId);
          // NEW: Add component to the set instead of calling forceUpdate()
          if (component) {
            const reactiveTypes = Array.isArray(component.reactiveType)
              ? component.reactiveType
              : [component.reactiveType || 'component'];
            if (!reactiveTypes.includes('none')) {
              componentsToNotify.add(component);
            }
          }
        });
      }

      if (currentPath.length === 0) break;
      currentPath.pop(); // Go up one level
    }

    // --- Deep Object Change Notification ---
    // If the new value is an object, notify components subscribed to sub-paths that changed.
    if (
      result.newValue &&
      typeof result.newValue === 'object' &&
      !isArray(result.newValue)
    ) {
      const changedSubPaths = getDifferences(result.newValue, result.oldValue);

      changedSubPaths.forEach((subPathString: string) => {
        const subPath = subPathString.split('.');
        const fullSubPath = [...path, ...subPath];
        const subPathMeta = getShadowMetadata(stateKey, fullSubPath);

        if (subPathMeta?.pathComponents) {
          subPathMeta.pathComponents.forEach((componentId: string) => {
            const component = rootMeta.components?.get(componentId);
            // NEW: Add component to the set
            if (component) {
              const reactiveTypes = Array.isArray(component.reactiveType)
                ? component.reactiveType
                : [component.reactiveType || 'component'];
              if (!reactiveTypes.includes('none')) {
                componentsToNotify.add(component);
              }
            }
          });
        }
      });
    }
  } else if (result.type === 'insert' || result.type === 'cut') {
    // For array structural changes (add/remove), notify components listening to the parent array.
    const parentArrayPath = result.type === 'insert' ? path : path.slice(0, -1);
    const parentMeta = getShadowMetadata(stateKey, parentArrayPath);

    if (parentMeta?.pathComponents) {
      parentMeta.pathComponents.forEach((componentId: string) => {
        const component = rootMeta.components?.get(componentId);
        // NEW: Add component to the set
        if (component) {
          componentsToNotify.add(component);
        }
      });
    }
  }

  // --- PASS 2: Handle 'all' and 'deps' reactivity types ---
  // Iterate over all components for this stateKey that haven't been notified yet.
  rootMeta.components.forEach((component, componentId) => {
    // If we've already added this component, skip it.
    if (componentsToNotify.has(component)) {
      return;
    }

    const reactiveTypes = Array.isArray(component.reactiveType)
      ? component.reactiveType
      : [component.reactiveType || 'component'];

    if (reactiveTypes.includes('all')) {
      componentsToNotify.add(component);
    } else if (reactiveTypes.includes('deps') && component.depsFunction) {
      const currentState = getShadowValue(stateKey, []);
      const newDeps = component.depsFunction(currentState);

      if (
        newDeps === true ||
        (Array.isArray(newDeps) && !isDeepEqual(component.prevDeps, newDeps))
      ) {
        component.prevDeps = newDeps as any; // Update the dependencies for the next check
        componentsToNotify.add(component);
      }
    }
  });

  return componentsToNotify;
}

function handleInsert(
  stateKey: string,
  path: string[],
  payload: any
): { type: 'insert'; newValue: any; shadowMeta: any } {
  let newValue;
  if (isFunction(payload)) {
    const { value: currentValue } = getScopedData(stateKey, path);
    newValue = payload({ state: currentValue, uuid: uuidv4() });
  } else {
    newValue = payload;
  }

  insertShadowArrayElement(stateKey, path, newValue);
  markAsDirty(stateKey, path, { bubble: true });

  const updatedMeta = getShadowMetadata(stateKey, path);
  if (updatedMeta?.arrayKeys) {
    const newItemKey = updatedMeta.arrayKeys[updatedMeta.arrayKeys.length - 1];
    if (newItemKey) {
      const newItemPath = newItemKey.split('.').slice(1);
      markAsDirty(stateKey, newItemPath, { bubble: false });
    }
  }

  return { type: 'insert', newValue, shadowMeta: updatedMeta };
}

function handleCut(
  stateKey: string,
  path: string[]
): { type: 'cut'; oldValue: any; parentPath: string[] } {
  const parentArrayPath = path.slice(0, -1);
  const oldValue = getShadowValue(stateKey, path);
  removeShadowArrayElement(stateKey, path);
  markAsDirty(stateKey, parentArrayPath, { bubble: true });
  return { type: 'cut', oldValue: oldValue, parentPath: parentArrayPath };
}

function flushQueue() {
  const allComponentsToNotify = new Set<any>();
  const signalUpdates: { shadowMeta: any; displayValue: any }[] = [];

  const logsToAdd: UpdateTypeDetail[] = [];

  for (const item of updateBatchQueue) {
    if (item.status && item.updateType) {
      logsToAdd.push(item as UpdateTypeDetail);
      continue;
    }

    const result = item;

    const displayValue = result.type === 'cut' ? null : result.newValue;
    if (result.shadowMeta?.signals?.length > 0) {
      signalUpdates.push({ shadowMeta: result.shadowMeta, displayValue });
    }

    const componentNotifications = getComponentNotifications(
      result.stateKey,
      result.path,
      result
    );

    componentNotifications.forEach((component) => {
      allComponentsToNotify.add(component);
    });
  }

  if (logsToAdd.length > 0) {
    addStateLog(logsToAdd);
  }

  signalUpdates.forEach(({ shadowMeta, displayValue }) => {
    updateSignals(shadowMeta, displayValue);
  });

  allComponentsToNotify.forEach((component) => {
    component.forceUpdate();
  });

  // --- Step 3: CLEANUP ---
  // Clear the queue for the next batch of updates.
  updateBatchQueue = [];
  isFlushScheduled = false;
}

function createEffectiveSetState<T>(
  thisKey: string,
  syncApiRef: React.MutableRefObject<any>,
  sessionId: string | undefined,
  latestInitialOptionsRef: React.MutableRefObject<OptionsType<T> | null>
): EffectiveSetState<T> {
  // The returned function is the core setter that gets called by all state operations.
  // It is now much simpler, delegating all work to the executeUpdate function.
  return (newStateOrFunction, path, updateObj, validationKey?) => {
    executeUpdate(thisKey, path, newStateOrFunction, updateObj);
  };

  // This inner function handles the logic for a single state update.
  function executeUpdate(
    stateKey: string,
    path: string[],
    payload: any,
    options: UpdateOptions
  ) {
    // --- Step 1: Execute the core state change (Synchronous & Fast) ---
    // This part modifies the in-memory state representation immediately.
    let result: any;
    switch (options.updateType) {
      case 'update':
        result = handleUpdate(stateKey, path, payload);
        break;
      case 'insert':
        result = handleInsert(stateKey, path, payload);
        break;
      case 'cut':
        result = handleCut(stateKey, path);
        break;
    }

    result.stateKey = stateKey;
    result.path = path;
    updateBatchQueue.push(result);
    scheduleFlush();

    const newUpdate: UpdateTypeDetail = {
      timeStamp: Date.now(),
      stateKey,
      path,
      updateType: options.updateType,
      status: 'new',
      oldValue: result.oldValue,
      newValue: result.newValue ?? null,
    };

    updateBatchQueue.push(newUpdate);

    if (result.newValue !== undefined) {
      saveToLocalStorage(
        result.newValue,
        stateKey,
        latestInitialOptionsRef.current,
        sessionId
      );
    }

    if (latestInitialOptionsRef.current?.middleware) {
      latestInitialOptionsRef.current.middleware({ update: newUpdate });
    }

    if (options.sync !== false && syncApiRef.current?.connected) {
      syncApiRef.current.updateState({ operation: newUpdate });
    }
  }
}

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
    __useSync,
  }: {
    stateKey?: string;
    componentId?: string;
    defaultState?: TStateObject;
    __useSync?: UseSyncType<TStateObject>;
    syncOptions?: SyncOptionsType<any>;
  } & OptionsType<TStateObject> = {}
) {
  const [reactiveForce, forceUpdate] = useState({}); //this is the key to reactivity
  const { sessionId } = useCogsConfig();
  let noStateKey = stateKey ? false : true;
  const [thisKey] = useState(stateKey ?? uuidv4());
  const componentIdRef = useRef(componentId ?? uuidv4());
  const latestInitialOptionsRef = useRef<OptionsType<TStateObject> | null>(
    null
  );
  latestInitialOptionsRef.current = (getInitialOptions(thisKey as string) ??
    null) as OptionsType<TStateObject> | null;

  useEffect(() => {
    if (syncUpdate && syncUpdate.stateKey === thisKey && syncUpdate.path?.[0]) {
      const syncKey = `${syncUpdate.stateKey}:${syncUpdate.path.join('.')}`;
      setSyncInfo(syncKey, {
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
    setServerStateUpdate(thisKey, serverState);
  }, [serverState, thisKey]);

  // Effect 2: Listen for server state updates from ANY component
  useEffect(() => {
    const unsubscribe = getGlobalStore
      .getState()
      .subscribeToPath(thisKey, (event) => {
        if (event?.type === 'SERVER_STATE_UPDATE') {
          const serverStateData = event.serverState;

          if (
            serverStateData?.status !== 'success' ||
            serverStateData.data === undefined
          ) {
            return; // Ignore if no valid data
          }

          setAndMergeOptions(thisKey, { serverState: serverStateData });

          const mergeConfig =
            typeof serverStateData.merge === 'object'
              ? serverStateData.merge
              : serverStateData.merge === true
                ? { strategy: 'append' }
                : null;

          const currentState = getShadowValue(thisKey, []);
          const incomingData = serverStateData.data;

          if (
            mergeConfig &&
            mergeConfig.strategy === 'append' &&
            'key' in mergeConfig && // Type guard for key
            Array.isArray(currentState) &&
            Array.isArray(incomingData)
          ) {
            const keyField = mergeConfig.key;
            if (!keyField) {
              console.error(
                "CogsState: Merge strategy 'append' requires a 'key' field."
              );
              return;
            }

            const existingIds = new Set(
              currentState.map((item: any) => item[keyField])
            );

            const newUniqueItems = incomingData.filter(
              (item: any) => !existingIds.has(item[keyField])
            );

            if (newUniqueItems.length > 0) {
              insertManyShadowArrayElements(thisKey, [], newUniqueItems);
            }

            // Mark the entire final state as synced
            const finalState = getShadowValue(thisKey, []);
            markEntireStateAsServerSynced(
              thisKey,
              [],
              finalState,
              serverStateData.timestamp
            );
          } else {
            // This handles the "replace" strategy (initial load)
            initializeShadowState(thisKey, incomingData);

            markEntireStateAsServerSynced(
              thisKey,
              [],
              incomingData,
              serverStateData.timestamp
            );
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

    const features = {
      syncEnabled: !!cogsSyncFn && !!syncOpt,
      validationEnabled: !!(
        options?.validation?.zodSchemaV4 || options?.validation?.zodSchemaV3
      ),
      localStorageEnabled: !!options?.localStorage?.key,
    };
    setShadowMetadata(thisKey, [], {
      ...existingMeta,
      features,
    });
    if (options?.defaultState !== undefined || defaultState !== undefined) {
      const finalDefaultState = options?.defaultState || defaultState;

      // Only set defaultState if it's not already set
      if (!options?.defaultState) {
        setAndMergeOptions(thisKey as string, {
          defaultState: finalDefaultState,
        });
      }

      const { value: resolvedState, source, timestamp } = resolveInitialState();

      initializeShadowState(thisKey, resolvedState);

      // Set shadow metadata with the correct source info
      setShadowMetadata(thisKey, [], {
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
    const rootMeta = getShadowMetadata(thisKey, []);
    const components = rootMeta?.components || new Map();

    components.set(componentKey, {
      forceUpdate: () => forceUpdate({}),
      reactiveType: reactiveType ?? ['component'],
      paths: new Set(),
      depsFunction: reactiveDeps || undefined,
      deps: reactiveDeps ? reactiveDeps(getShadowValue(thisKey, [])) : [],
      prevDeps: reactiveDeps // Initialize prevDeps with the same initial value
        ? reactiveDeps(getShadowValue(thisKey, []))
        : [],
    });

    setShadowMetadata(thisKey, [], {
      ...rootMeta,
      components,
    });
    forceUpdate({});
    return () => {
      const meta = getShadowMetadata(thisKey, []);
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
        setShadowMetadata(thisKey, [], meta);
      }
    };
  }, []);

  const syncApiRef = useRef<SyncApi | null>(null);
  const effectiveSetState = createEffectiveSetState(
    thisKey,
    syncApiRef,
    sessionId,
    latestInitialOptionsRef
  );

  if (!getGlobalStore.getState().initialStateGlobal[thisKey]) {
    updateInitialStateGlobal(thisKey, stateObject);
  }

  const updaterFinal = useMemo(() => {
    const handler = createProxyHandler<TStateObject>(
      thisKey,
      effectiveSetState,
      componentIdRef.current,
      sessionId
    );

    return handler;
  }, [thisKey, sessionId]);

  const cogsSyncFn = __useSync;
  const syncOpt = latestInitialOptionsRef.current?.syncOptions;

  if (cogsSyncFn) {
    syncApiRef.current = cogsSyncFn(
      updaterFinal as any,
      syncOpt ?? ({} as any)
    );
  }

  return updaterFinal;
}

type MetaData = {
  // Map array paths to their filtered/sorted ID order
  arrayViews?: {
    [arrayPath: string]: string[]; // e.g. { "todos": ["id:xxx", "id:yyy"], "todos.id:xxx.subtasks": ["id:aaa"] }
  };
  transforms?: Array<{
    type: 'filter' | 'sort';
    fn: Function;
    path: string[]; // Which array this transform applies to
  }>;
  serverStateIsUpStream?: boolean;
};

const applyTransforms = (
  stateKey: string,
  path: string[],
  meta?: MetaData
): string[] => {
  let ids = getShadowMetadata(stateKey, path)?.arrayKeys || [];
  const transforms = meta?.transforms;
  if (!transforms || transforms.length === 0) {
    return ids;
  }

  // Apply each transform using just IDs
  for (const transform of transforms) {
    if (transform.type === 'filter') {
      const filtered: any[] = [];
      ids.forEach((id, index) => {
        const value = getShadowValue(stateKey, [...path, id]);

        if (transform.fn(value, index)) {
          filtered.push(id);
        }
      });
      ids = filtered;
    } else if (transform.type === 'sort') {
      ids.sort((a, b) => {
        const aValue = getShadowValue(stateKey, [...path, a]);
        const bValue = getShadowValue(stateKey, [...path, b]);
        return transform.fn(aValue, bValue);
      });
    }
  }

  return ids;
};
const registerComponentDependency = (
  stateKey: string,
  componentId: string,
  dependencyPath: string[]
) => {
  const fullComponentId = `${stateKey}////${componentId}`;

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

  addPathComponent(stateKey, dependencyPath, fullComponentId);
};
const notifySelectionComponents = (
  stateKey: string,
  parentPath: string[],
  currentSelected?: string | undefined
) => {
  const rootMeta = getShadowMetadata(stateKey, []);
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

  getShadowMetadata(stateKey, [
    ...parentPath,
    'getSelected',
  ])?.pathComponents?.forEach((componentId) => {
    const thisComp = rootMeta?.components?.get(componentId);
    thisComp?.forceUpdate();
  });

  const parentMeta = getShadowMetadata(stateKey, parentPath);
  for (let arrayKey of parentMeta?.arrayKeys || []) {
    const key = arrayKey + '.selected';
    const selectedItem = getShadowMetadata(stateKey, key.split('.').slice(1));
    if (arrayKey == currentSelected) {
      selectedItem?.pathComponents?.forEach((componentId) => {
        const thisComp = rootMeta?.components?.get(componentId);
        thisComp?.forceUpdate();
      });
    }
  }
};
function getScopedData(stateKey: string, path: string[], meta?: MetaData) {
  const shadowMeta = getShadowMetadata(stateKey, path);
  const arrayPathKey = path.length > 0 ? path.join('.') : 'root';
  const arrayKeys = meta?.arrayViews?.[arrayPathKey];

  // FIX: If the derived view is empty, return an empty array directly.
  if (Array.isArray(arrayKeys) && arrayKeys.length === 0) {
    return {
      shadowMeta,
      value: [],
      arrayKeys: shadowMeta?.arrayKeys,
    };
  }

  const value = getShadowValue(stateKey, path, arrayKeys);

  return {
    shadowMeta,
    value,
    arrayKeys: shadowMeta?.arrayKeys,
  };
}

function createProxyHandler<T>(
  stateKey: string,
  effectiveSetState: EffectiveSetState<T>,
  outerComponentId: string,
  sessionId?: string
): StateObject<T> {
  const proxyCache = new Map<string, any>();
  let stateVersion = 0;

  function rebuildStateShape({
    path = [],
    meta,
    componentId,
  }: {
    path: string[];
    componentId: string;
    meta?: MetaData;
  }): any {
    const derivationSignature = meta
      ? JSON.stringify(meta.arrayViews || meta.transforms)
      : '';
    const cacheKey =
      path.join('.') + ':' + componentId + ':' + derivationSignature;
    if (proxyCache.has(cacheKey)) {
      return proxyCache.get(cacheKey);
    }
    const stateKeyPathKey = [stateKey, ...path].join('.');

    // We attach baseObj properties *inside* the get trap now to avoid recursion
    // This is a placeholder for the proxy.

    const handler = {
      get(target: any, prop: string) {
        if (path.length === 0 && prop in rootLevelMethods) {
          return rootLevelMethods[prop as keyof typeof rootLevelMethods];
        }
        if (!prop.startsWith('$')) {
          const nextPath = [...path, prop];
          return rebuildStateShape({
            path: nextPath,
            componentId: componentId!,
            meta,
          });
        }
        if (prop === '$_rebuildStateShape') {
          return rebuildStateShape;
        }

        if (prop === '$sync' && path.length === 0) {
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
                //  getGlobalStore.getState().removeValidationError(validationKey);
                // response.errors.forEach((error) => {
                //   const errorPath = [validationKey, ...error.path].join('.');
                //   getGlobalStore
                //     .getState()
                //     .addValidationError(errorPath, error.message);
                // });
                //   notifyComponents(stateKey);
              }

              if (response?.success) {
                // Mark as synced and not dirty
                const shadowMeta = getGlobalStore
                  .getState()
                  .getShadowMetadata(stateKey, []);
                setShadowMetadata(stateKey, [], {
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
        if (prop === '$_status' || prop === '$getStatus') {
          const getStatusFunc = () => {
            // ✅ Use the optimized helper to get all data in one efficient call
            const { shadowMeta, value } = getScopedData(stateKey, path, meta);

            // Priority 1: Explicitly dirty items. This is the most important status.
            if (shadowMeta?.isDirty === true) {
              return 'dirty';
            }

            // ✅ Priority 2: Synced items. This condition is now cleaner.
            // An item is considered synced if it came from the server OR was explicitly
            // marked as not dirty (isDirty: false), covering all sync-related cases.
            if (
              shadowMeta?.stateSource === 'server' ||
              shadowMeta?.isDirty === false
            ) {
              return 'synced';
            }

            // Priority 3: Items restored from localStorage.
            if (shadowMeta?.stateSource === 'localStorage') {
              return 'restored';
            }

            // Priority 4: Items from default/initial state.
            if (shadowMeta?.stateSource === 'default') {
              return 'fresh';
            }

            // ✅ REMOVED the redundant "root" check. The item's own `stateSource` is sufficient.

            // Priority 5: A value exists but has no metadata. This is a fallback.
            if (value !== undefined && !shadowMeta) {
              return 'fresh';
            }

            // Fallback if no other condition is met.
            return 'unknown';
          };

          // This part remains the same
          return prop === '$_status' ? getStatusFunc() : getStatusFunc;
        }
        if (prop === '$removeStorage') {
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
        if (prop === '$showValidationErrors') {
          return () => {
            const { shadowMeta } = getScopedData(stateKey, path, meta);
            if (
              shadowMeta?.validation?.status === 'INVALID' &&
              shadowMeta.validation.errors.length > 0
            ) {
              // Return only error-severity messages (not warnings)
              return shadowMeta.validation.errors
                .filter((err) => err.severity === 'error')
                .map((err) => err.message);
            }
            return [];
          };
        }

        if (prop === '$getSelected') {
          return () => {
            const arrayKey = [stateKey, ...path].join('.');
            registerComponentDependency(stateKey, componentId, [
              ...path,
              'getSelected',
            ]);

            const selectedItemKey = getGlobalStore
              .getState()
              .selectedIndicesMap.get(arrayKey);
            if (!selectedItemKey) {
              return undefined;
            }

            const viewKey = path.join('.');
            const currentViewIds = meta?.arrayViews?.[viewKey];
            const selectedItemId = selectedItemKey.split('.').pop();

            // FIX: Only return the selected item if it exists in the current filtered/sorted view.
            if (currentViewIds && !currentViewIds.includes(selectedItemId!)) {
              return undefined;
            }

            const value = getShadowValue(
              stateKey,
              selectedItemKey.split('.').slice(1)
            );
            if (value === undefined) {
              return undefined;
            }

            return rebuildStateShape({
              path: selectedItemKey.split('.').slice(1) as string[],
              componentId: componentId!,
              meta,
            });
          };
        }
        if (prop === '$getSelectedIndex') {
          return () => {
            // Key for the array in the global selection map (e.g., "myState.products")
            const arrayKey = stateKey + '.' + path.join('.');
            // Key for this specific view in the meta object (e.g., "products")
            const viewKey = path.join('.');

            // Get the full path of the selected item (e.g., "myState.products.id:abc")
            const selectedItemKey = getGlobalStore
              .getState()
              .selectedIndicesMap.get(arrayKey);

            if (!selectedItemKey) {
              return -1; // Nothing is selected for this array.
            }

            // Get the list of item IDs for the current filtered/sorted view.
            const { keys: viewIds } = getArrayData(stateKey, path, meta);

            if (!viewIds) {
              return -1; // Should not happen if it's an array, but a safe guard.
            }

            // FIX: Extract just the ID from the full selected item path.
            const selectedId = selectedItemKey.split('.').pop();

            // Return the index of that ID within the current view's list of IDs.
            return (viewIds as string[]).indexOf(selectedId as string);
          };
        }
        if (prop === '$clearSelected') {
          notifySelectionComponents(stateKey, path);
          return () => {
            clearSelectedIndex({
              arrayKey: stateKey + '.' + path.join('.'),
            });
          };
        }

        if (prop === '$useVirtualView') {
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

            useEffect(() => {
              const interval = setInterval(() => {
                forceUpdate({});
              }, 1000);
              return () => clearInterval(interval);
            }, []);

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
            const { keys: arrayKeys } = getArrayData(stateKey, path, meta);

            // Subscribe to state changes like stateList does
            useEffect(() => {
              const stateKeyPathKey = [stateKey, ...path].join('.');
              const unsubscribe = getGlobalStore
                .getState()
                .subscribeToPath(stateKeyPathKey, (e) => {
                  if (e.type === 'GET_SELECTED') {
                    return;
                  }
                  if (e.type === 'SERVER_STATE_UPDATE') {
                    //  forceUpdate({});
                  }
                });

              return () => {
                unsubscribe();
              };
            }, [componentId, stateKey, path.join('.')]);

            // YOUR ORIGINAL INITIAL POSITIONING - KEEPING EXACTLY AS IS
            useLayoutEffect(() => {
              if (
                stickToBottom &&
                arrayKeys.length > 0 &&
                containerRef.current &&
                !scrollStateRef.current.isUserScrolling &&
                initialScrollRef.current
              ) {
                const container = containerRef.current;

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

                    requestAnimationFrame(() => {
                      scrollToBottom('instant');
                      initialScrollRef.current = false;
                    });
                  } else {
                    requestAnimationFrame(waitForContainer);
                  }
                };

                waitForContainer();
              }
            }, [arrayKeys.length, stickToBottom, itemHeight, overscan]);

            const rangeRef = useRef(range);
            useLayoutEffect(() => {
              rangeRef.current = range;
            }, [range]);

            const arrayKeysRef = useRef(arrayKeys);
            useLayoutEffect(() => {
              arrayKeysRef.current = arrayKeys;
            }, [arrayKeys]);

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
              console.log(
                'hadnlescroll ',
                measurementCache.current,
                newStartIndex,
                range
              );
              // Only update if range actually changed
              if (newStartIndex !== range.startIndex && range.startIndex != 0) {
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
              if (!container) return;

              container.addEventListener('scroll', handleScroll, {
                passive: true,
              });
              return () => {
                container.removeEventListener('scroll', handleScroll);
              };
            }, [handleScroll, stickToBottom]);

            // YOUR ORIGINAL SCROLL TO BOTTOM FUNCTION - KEEPING EXACTLY AS IS
            const scrollToBottom = useCallback(
              (behavior: ScrollBehavior = 'smooth') => {
                const container = containerRef.current;
                if (!container) return;

                scrollStateRef.current.isUserScrolling = false;
                scrollStateRef.current.isNearBottom = true;
                scrollStateRef.current.scrollUpCount = 0;

                const performScroll = () => {
                  const attemptScroll = (attempts = 0) => {
                    if (attempts > 5) return;

                    const currentHeight = container.scrollHeight;
                    const currentScroll = container.scrollTop;
                    const clientHeight = container.clientHeight;

                    if (currentScroll + clientHeight >= currentHeight - 1) {
                      return;
                    }

                    container.scrollTo({
                      top: currentHeight,
                      behavior: behavior,
                    });

                    setTimeout(() => {
                      const newHeight = container.scrollHeight;
                      const newScroll = container.scrollTop;

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

                if ('requestIdleCallback' in window) {
                  requestIdleCallback(performScroll, { timeout: 100 });
                } else {
                  requestAnimationFrame(() => {
                    requestAnimationFrame(performScroll);
                  });
                }
              },
              []
            );

            // YOUR ORIGINAL AUTO-SCROLL EFFECTS - KEEPING ALL OF THEM
            useEffect(() => {
              if (!stickToBottom || !containerRef.current) return;

              const container = containerRef.current;
              const scrollState = scrollStateRef.current;

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

              const observer = new MutationObserver(() => {
                if (!scrollState.isUserScrolling) {
                  debouncedScrollToBottom();
                }
              });

              observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class'],
              });

              if (initialScrollRef.current) {
                setTimeout(() => {
                  scrollToBottom('instant');
                }, 0);
              } else {
                debouncedScrollToBottom();
              }

              return () => {
                clearTimeout(scrollTimeout);
                observer.disconnect();
              };
            }, [stickToBottom, arrayKeys.length, scrollToBottom]);

            // Create virtual state - NO NEED to get values, only IDs!
            const virtualState = useMemo(() => {
              // 2. Physically slice the corresponding keys.
              const slicedKeys = Array.isArray(arrayKeys)
                ? arrayKeys.slice(range.startIndex, range.endIndex + 1)
                : [];

              // Use the same keying as getArrayData (empty string for root)
              const arrayPath = path.length > 0 ? path.join('.') : 'root';
              return rebuildStateShape({
                path,
                componentId: componentId!,
                meta: {
                  ...meta,
                  arrayViews: { [arrayPath]: slicedKeys },
                  serverStateIsUpStream: true,
                },
              });
            }, [range.startIndex, range.endIndex, arrayKeys, meta]);

            return {
              virtualState,
              virtualizerProps: {
                outer: {
                  ref: containerRef,
                  style: {
                    overflowY: 'auto' as const,
                    height: '100%',
                    position: 'relative' as const,
                  },
                },
                inner: {
                  style: {
                    position: 'relative' as const,
                  },
                },
                list: {
                  style: {
                    transform: `translateY(${
                      measurementCache.current.get(arrayKeys[range.startIndex]!)
                        ?.offset || 0
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
        if (prop === '$stateMap') {
          return (
            callbackfn: (setter: any, index: number, arraySetter: any) => void
          ) => {
            // FIX: Use getArrayData to reliably get both the value and the keys of the current view.
            const { value: shadowValue, keys: arrayKeys } = getArrayData(
              stateKey,
              path,
              meta
            );

            if (!arrayKeys || !Array.isArray(shadowValue)) {
              return []; // It's valid to map over an empty array.
            }

            const arraySetter = rebuildStateShape({
              path,
              componentId: componentId!,
              meta,
            });

            return shadowValue.map((_item, index) => {
              const itemKey = arrayKeys[index];
              if (!itemKey) return undefined;

              // FIX: Construct the correct path to the item in the original store.
              // The path is the array's path plus the specific item's unique key.
              const itemPath = [...path, itemKey];

              const itemSetter = rebuildStateShape({
                path: itemPath, // This now correctly points to the item in the shadow store.
                componentId: componentId!,
                meta,
              });

              return callbackfn(itemSetter, index, arraySetter);
            });
          };
        }

        if (prop === '$stateFilter') {
          return (callbackfn: (value: any, index: number) => boolean) => {
            const arrayPathKey = path.length > 0 ? path.join('.') : 'root';

            // ✅ FIX: Get keys from `getArrayData` which correctly resolves them from meta or the full list.
            const { keys: currentViewIds, value: array } = getArrayData(
              stateKey,
              path,
              meta
            );

            if (!Array.isArray(array)) {
              throw new Error('stateFilter can only be used on arrays');
            }

            // Filter the array and collect the IDs of the items that pass
            const filteredIds: string[] = [];
            array.forEach((item, index) => {
              if (callbackfn(item, index)) {
                // currentViewIds[index] is the original ID before filtering
                const id = currentViewIds[index];
                if (id) {
                  filteredIds.push(id);
                }
              }
            });

            // The rest is the same...
            return rebuildStateShape({
              path,
              componentId: componentId!,
              meta: {
                ...meta,
                arrayViews: {
                  ...(meta?.arrayViews || {}),
                  [arrayPathKey]: filteredIds,
                },
                transforms: [
                  ...(meta?.transforms || []),
                  { type: 'filter', fn: callbackfn, path },
                ],
              },
            });
          };
        }
        if (prop === '$stateSort') {
          return (compareFn: (a: any, b: any) => number) => {
            const arrayPathKey = path.length > 0 ? path.join('.') : 'root';

            // FIX: Use the more robust `getArrayData` which always correctly resolves the keys for a view.
            const { value: currentArray, keys: currentViewIds } = getArrayData(
              stateKey,
              path,
              meta
            );

            if (!Array.isArray(currentArray) || !currentViewIds) {
              throw new Error('No array keys found for sorting');
            }

            // ... (rest of the function is the same and now works)
            const itemsWithIds = currentArray.map((item, index) => ({
              item,
              key: currentViewIds[index],
            }));
            itemsWithIds.sort((a, b) => compareFn(a.item, b.item));
            const sortedIds = itemsWithIds.map((i) => i.key as string);

            return rebuildStateShape({
              path,
              componentId: componentId!,
              meta: {
                ...meta,
                arrayViews: {
                  ...(meta?.arrayViews || {}),
                  [arrayPathKey]: sortedIds,
                },
                transforms: [
                  ...(meta?.transforms || []),
                  { type: 'sort', fn: compareFn, path },
                ],
              },
            });
          };
        }
        // In createProxyHandler, inside the get trap where you have other array methods:
        if (prop === '$stream') {
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

              if (bufferStrategy === 'sliding' && buffer.length >= bufferSize) {
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
            const currentMeta = getShadowMetadata(stateKey, path) || {};
            const streams = currentMeta.streams || new Map();
            streams.set(streamId, { buffer, flushTimer });

            setShadowMetadata(stateKey, path, {
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

        if (prop === '$stateList') {
          return (
            callbackfn: (
              setter: any,
              index: number,
              arraySetter: any
            ) => ReactNode
          ) => {
            const StateListWrapper = () => {
              const componentIdsRef = useRef<Map<string, string>>(new Map());

              const [updateTrigger, forceUpdate] = useState({});

              const arrayPathKey = path.length > 0 ? path.join('.') : 'root';

              const validIds = applyTransforms(stateKey, path, meta);

              // Memoize the updated meta to prevent creating new objects on every render
              const updatedMeta = useMemo(() => {
                return {
                  ...meta,
                  arrayViews: {
                    ...(meta?.arrayViews || {}),
                    [arrayPathKey]: validIds,
                  },
                };
              }, [meta, arrayPathKey, validIds]);

              // Now use the updated meta when getting array data
              const { value: arrayValues } = getArrayData(
                stateKey,
                path,
                updatedMeta
              );

              useEffect(() => {
                const unsubscribe = getGlobalStore
                  .getState()
                  .subscribeToPath(stateKeyPathKey, (e) => {
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
                      e.type === 'INSERT_MANY' ||
                      e.type === 'REMOVE' ||
                      e.type === 'CLEAR_SELECTION' ||
                      (e.type === 'SERVER_STATE_UPDATE' &&
                        !meta?.serverStateIsUpStream)
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

              // Continue using updatedMeta for the rest of your logic instead of meta
              const arraySetter = rebuildStateShape({
                path,
                componentId: componentId!,
                meta: updatedMeta, // Use updated meta here
              });

              const returnValue = arrayValues.map((item, localIndex) => {
                const itemKey = validIds[localIndex];

                if (!itemKey) {
                  return null;
                }

                let itemComponentId = componentIdsRef.current.get(itemKey);
                if (!itemComponentId) {
                  itemComponentId = uuidv4();
                  componentIdsRef.current.set(itemKey, itemComponentId);
                }

                const itemPath = [...path, itemKey];

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
              });

              return <>{returnValue}</>;
            };

            return <StateListWrapper />;
          };
        }
        if (prop === '$stateFlattenOn') {
          return (fieldName: string) => {
            // FIX: Get the definitive list of IDs for the current view from meta.arrayViews.
            const arrayPathKey = path.length > 0 ? path.join('.') : 'root';
            const viewIds = meta?.arrayViews?.[arrayPathKey];

            const currentState = getGlobalStore
              .getState()
              .getShadowValue(stateKey, path, viewIds);

            if (!Array.isArray(currentState)) return [];

            stateVersion++;

            return rebuildStateShape({
              path: [...path, '[*]', fieldName],
              componentId: componentId!,
              meta,
            });
          };
        }
        if (prop === '$index') {
          return (index: number) => {
            const arrayPathKey = path.length > 0 ? path.join('.') : 'root';
            const viewIds = meta?.arrayViews?.[arrayPathKey];

            if (viewIds) {
              const itemId = viewIds[index];
              if (!itemId) return undefined;
              return rebuildStateShape({
                path: [...path, itemId],
                componentId: componentId!,
                meta,
              });
            }

            // ✅ FIX: Get the metadata and use the `arrayKeys` property.
            const shadowMeta = getShadowMetadata(stateKey, path);
            if (!shadowMeta?.arrayKeys) return undefined;

            const itemId = shadowMeta.arrayKeys[index];
            if (!itemId) return undefined;

            return rebuildStateShape({
              path: [...path, itemId],
              componentId: componentId!,
              meta,
            });
          };
        }
        if (prop === '$last') {
          return () => {
            const { keys: currentViewIds } = getArrayData(stateKey, path, meta);
            if (!currentViewIds || currentViewIds.length === 0) {
              return undefined;
            }
            const lastItemKey = currentViewIds[currentViewIds.length - 1];

            if (!lastItemKey) {
              return undefined;
            }
            const newPath = [...path, lastItemKey];

            return rebuildStateShape({
              path: newPath,
              componentId: componentId!,
              meta,
            });
          };
        }
        if (prop === '$insert') {
          return (
            payload: InsertParams<InferArrayElement<T>>,
            index?: number
          ) => {
            effectiveSetState(payload as any, path, { updateType: 'insert' });
          };
        }
        if (prop === '$uniqueInsert') {
          return (
            payload: UpdateArg<T>,
            fields?: (keyof InferArrayElement<T>)[],
            onMatch?: (existingItem: any) => any
          ) => {
            const { value: currentArray } = getScopedData(
              stateKey,
              path,
              meta
            ) as {
              value: any[];
            };
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
              effectiveSetState(newValue, path, { updateType: 'insert' });
            } else if (onMatch && matchedItem) {
              const updatedItem = onMatch(matchedItem);
              const updatedArray = currentArray.map((item) =>
                isDeepEqual(item, matchedItem) ? updatedItem : item
              );

              effectiveSetState(updatedArray as any, path, {
                updateType: 'update',
              });
            }
          };
        }
        if (prop === '$cut') {
          return (index?: number, options?: { waitForSync?: boolean }) => {
            const shadowMeta = getShadowMetadata(stateKey, path);
            if (!shadowMeta?.arrayKeys || shadowMeta.arrayKeys.length === 0)
              return;

            const indexToCut =
              index === -1
                ? shadowMeta.arrayKeys.length - 1
                : index !== undefined
                  ? index
                  : shadowMeta.arrayKeys.length - 1;

            const idToCut = shadowMeta.arrayKeys[indexToCut];
            if (!idToCut) return;

            effectiveSetState(null, [...path, idToCut], {
              updateType: 'cut',
            });
          };
        }
        if (prop === '$cutSelected') {
          return () => {
            const arrayKey = [stateKey, ...path].join('.');

            const { keys: currentViewIds } = getArrayData(stateKey, path, meta);
            if (!currentViewIds || currentViewIds.length === 0) {
              return;
            }
            const selectedItemKey = getGlobalStore
              .getState()
              .selectedIndicesMap.get(arrayKey);

            if (!selectedItemKey) {
              return;
            }
            const selectedId = selectedItemKey.split('.').pop() as string;

            if (!(currentViewIds as any[]).includes(selectedId!)) {
              return;
            }
            const pathForCut = selectedItemKey.split('.').slice(1);
            getGlobalStore.getState().clearSelectedIndex({ arrayKey });

            const parentPath = pathForCut.slice(0, -1);
            notifySelectionComponents(stateKey, parentPath);

            effectiveSetState(null, pathForCut, {
              updateType: 'cut',
            });
          };
        }
        if (prop === '$cutByValue') {
          return (value: string | number | boolean) => {
            const {
              isArray,
              value: array,
              keys,
            } = getArrayData(stateKey, path, meta);

            if (!isArray) return;

            const found = findArrayItem(array, keys, (item) => item === value);
            if (found) {
              effectiveSetState(null, [...path, found.key], {
                updateType: 'cut',
              });
            }
          };
        }

        if (prop === '$toggleByValue') {
          return (value: string | number | boolean) => {
            const {
              isArray,
              value: array,
              keys,
            } = getArrayData(stateKey, path, meta);

            if (!isArray) return;

            const found = findArrayItem(array, keys, (item) => item === value);

            if (found) {
              const pathForItem = [...path, found.key];

              effectiveSetState(null, pathForItem, {
                updateType: 'cut',
              });
            } else {
              effectiveSetState(value as any, path, { updateType: 'insert' });
            }
          };
        }
        if (prop === '$findWith') {
          return (searchKey: string, searchValue: any) => {
            const { isArray, value, keys } = getArrayData(stateKey, path, meta);

            if (!isArray) {
              throw new Error('findWith can only be used on arrays');
            }

            const found = findArrayItem(
              value,
              keys,
              (item) => item?.[searchKey] === searchValue
            );

            if (found) {
              return rebuildStateShape({
                path: [...path, found.key],
                componentId: componentId!,
                meta,
              });
            }

            return rebuildStateShape({
              path: [...path, `not_found_${uuidv4()}`],
              componentId: componentId!,
              meta,
            });
          };
        }
        if (prop === '$cutThis') {
          const { value: shadowValue } = getScopedData(stateKey, path, meta);
          const parentPath = path.slice(0, -1);
          notifySelectionComponents(stateKey, parentPath);
          return () => {
            effectiveSetState(shadowValue, path, { updateType: 'cut' });
          };
        }

        if (prop === '$get') {
          return () => {
            registerComponentDependency(stateKey, componentId, path);
            const { value } = getScopedData(stateKey, path, meta);
            return value;
          };
        }

        if (prop === '$$derive') {
          return (fn: any) =>
            $cogsSignal({
              _stateKey: stateKey,
              _path: path,
              _effect: fn.toString(),
              _meta: meta,
            });
        }

        if (prop === '$$get') {
          return () =>
            $cogsSignal({ _stateKey: stateKey, _path: path, _meta: meta });
        }
        if (prop === '$lastSynced') {
          const syncKey = `${stateKey}:${path.join('.')}`;
          return getSyncInfo(syncKey);
        }
        if (prop == 'getLocalStorage') {
          return (key: string) =>
            loadFromLocalStorage(sessionId + '-' + stateKey + '-' + key);
        }
        if (prop === '$isSelected') {
          const parentPathArray = path.slice(0, -1);
          const parentMeta = getShadowMetadata(stateKey, parentPathArray);

          if (parentMeta?.arrayKeys) {
            const fullParentKey = stateKey + '.' + parentPathArray.join('.');
            const selectedItemKey = getGlobalStore
              .getState()
              .selectedIndicesMap.get(fullParentKey);

            const fullItemKey = stateKey + '.' + path.join('.');

            return selectedItemKey === fullItemKey;
          }
          return undefined;
        }

        if (prop === '$setSelected') {
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

        if (prop === '$toggleSelected') {
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
            notifySelectionComponents(stateKey, parentPath);
          };
        }
        if (prop === '$_componentId') {
          return componentId;
        }
        if (path.length == 0) {
          if (prop === '$addZodValidation') {
            return (zodErrors: any[]) => {
              zodErrors.forEach((error) => {
                const currentMeta =
                  getGlobalStore
                    .getState()
                    .getShadowMetadata(stateKey, error.path) || {};

                getGlobalStore
                  .getState()
                  .setShadowMetadata(stateKey, error.path, {
                    ...currentMeta,
                    validation: {
                      status: 'INVALID',
                      errors: [
                        {
                          source: 'client',
                          message: error.message,
                          severity: 'error',
                          code: error.code,
                        },
                      ],
                      lastValidated: Date.now(),
                      validatedValue: undefined,
                    },
                  });
              });
            };
          }
          if (prop === '$clearZodValidation') {
            return (path?: string[]) => {
              if (!path) {
                throw new Error('clearZodValidation requires a path');
              }

              const currentMeta = getShadowMetadata(stateKey, path) || {};

              setShadowMetadata(stateKey, path, {
                ...currentMeta,
                validation: {
                  status: 'NOT_VALIDATED',
                  errors: [],
                  lastValidated: Date.now(),
                },
              });
            };
          }
          if (prop === '$applyJsonPatch') {
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

          if (prop === '$getComponents')
            return () => getShadowMetadata(stateKey, [])?.components;
          if (prop === '$getAllFormRefs')
            return () =>
              formRefStore.getState().getFormRefsByStateKey(stateKey);
        }
        if (prop === '$getFormRef') {
          return () =>
            formRefStore.getState().getFormRef(stateKey + '.' + path.join('.'));
        }
        if (prop === '$validationWrapper') {
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
        if (prop === '$_stateKey') return stateKey;
        if (prop === '$_path') return path;
        if (prop === '$update') {
          return (payload: UpdateArg<T>) => {
            effectiveSetState(payload as any, path, { updateType: 'update' });

            return {
              synced: () => {
                const shadowMeta = getGlobalStore
                  .getState()
                  .getShadowMetadata(stateKey, path);

                // Update the metadata for this specific path
                setShadowMetadata(stateKey, path, {
                  ...shadowMeta,
                  isDirty: false,
                  stateSource: 'server',
                  lastServerSync: Date.now(),
                });

                // Notify any components that might be subscribed to the sync status
                const fullPath = [stateKey, ...path].join('.');
                notifyPathSubscribers(fullPath, {
                  type: 'SYNC_STATUS_CHANGE',
                  isDirty: false,
                });
              },
            };
          };
        }
        if (prop === '$toggle') {
          const { value: currentValueAtPath } = getScopedData(
            stateKey,
            path,
            meta
          );

          if (typeof currentValueAtPath != 'boolean') {
            throw new Error('toggle() can only be used on boolean values');
          }
          return () => {
            effectiveSetState(!currentValueAtPath as any, path, {
              updateType: 'update',
            });
          };
        }
        if (prop === '$isolate') {
          return (renderFn: (state: any) => React.ReactNode) => {
            return (
              <IsolatedComponentWrapper
                stateKey={stateKey}
                path={path}
                rebuildStateShape={rebuildStateShape}
                renderFn={renderFn}
              />
            );
          };
        }
        if (prop === '$formElement') {
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
        return rebuildStateShape({
          path: nextPath,
          componentId: componentId!,
          meta,
        });
      },
    };

    const proxyInstance = new Proxy({}, handler);
    proxyCache.set(cacheKey, proxyInstance);

    return proxyInstance;
  }

  const rootLevelMethods = {
    $revertToInitialState: (obj?: { validationKey?: string }) => {
      const shadowMeta = getGlobalStore
        .getState()
        .getShadowMetadata(stateKey, []);
      let revertState;

      // Determine the correct state to revert to (same logic as before)
      if (shadowMeta?.stateSource === 'server' && shadowMeta.baseServerState) {
        revertState = shadowMeta.baseServerState;
      } else {
        revertState = getGlobalStore.getState().initialStateGlobal[stateKey];
      }

      // Perform necessary cleanup
      clearSelectedIndexesForState(stateKey);

      // FIX 1: Use the IMMEDIATE, SYNCHRONOUS state reset function.
      // This is what your tests expect for a clean slate.
      initializeShadowState(stateKey, revertState);

      // Rebuild the proxy's internal shape after the reset
      rebuildStateShape({
        path: [],
        componentId: outerComponentId!,
      });

      // Handle localStorage side-effects
      const initalOptionsGet = getInitialOptions(stateKey as string);
      const localKey = isFunction(initalOptionsGet?.localStorage?.key)
        ? initalOptionsGet?.localStorage?.key(revertState)
        : initalOptionsGet?.localStorage?.key;
      const storageKey = `${sessionId}-${stateKey}-${localKey}`;
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }

      // FIX 2: Use the library's BATCHED notification system instead of a manual forceUpdate loop.
      // This fixes the original infinite loop bug safely.
      notifyComponents(stateKey);

      return revertState;
    },
    $updateInitialState: (newState: T) => {
      stateVersion++;

      const newUpdaterState = createProxyHandler(
        stateKey,
        effectiveSetState,
        outerComponentId,
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
        initializeShadowState(stateKey, newState);
        // initializeShadowStateNEW(stateKey, newState);

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
        fetchId: (field: keyof T) => (newUpdaterState.$get() as any)[field],
      };
    },
  };

  const returnShape = rebuildStateShape({
    componentId: outerComponentId,
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

  const arrayPathKey = proxy._path.length > 0 ? proxy._path.join('.') : 'root';
  const viewIds = proxy._meta?.arrayViews?.[arrayPathKey];

  const value = getShadowValue(proxy._stateKey, proxy._path, viewIds);

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
