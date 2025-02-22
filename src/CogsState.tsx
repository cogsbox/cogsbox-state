"use client";
import {
    createElement,
    startTransition,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";

import { getNestedValue, isFunction, type GenericObject } from "./utility.js";
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
import { ZodObject, type ZodRawShape } from "zod";

import { getGlobalStore } from "./store.js";
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

export type FormElementParmas<T> = {
    get: () => T;

    set: UpdateType<T>;
    syncStatus: (SyncInfo & { date: Date }) | null;
    path: string[];
    validationErrors: () => string[];

    inputProps: {
        value?: T;
        onChange?: (
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => void;
    };
};

export type StateKeys = string;

type findWithFuncType<U> = (
    thisKey: keyof U,
    thisValue: U[keyof U],
) => EndType<U> & { upsert: UpdateType<U>; cut: () => void } & StateObject<U>;
export type PushArgs<U> = (
    update:
        | Prettify<U>
        | ((prevState: NonNullable<Prettify<U>>[]) => NonNullable<Prettify<U>>),
    opts?: UpdateOpts,
) => void;
export interface GlobalState<T, K extends keyof T = keyof T> {
    getKeyState: () => T;
    setState: (newState: T | ((previousState: T) => T)) => void;
    key: K;
}
type CutFunctionType = (
    index?: number,
    options?: { waitForSync?: boolean },
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
    stateEach: (
        callbackfn: (
            value: InferArrayElement<TShape>,
            setter: StateObject<InferArrayElement<TShape>>,
            index: number,
            array: TShape,
            arraySetter: StateObject<TShape>,
        ) => void,
    ) => any;
    stateFlattenOn: <K extends keyof InferArrayElement<TShape>>(
        field: K,
    ) => StateObject<InferArrayElement<InferArrayElement<TShape>[K]>[]>;
    uniqueInsert: (
        payload: UpdateArg<InferArrayElement<TShape>>,
        fields?: (keyof InferArrayElement<TShape>)[],
    ) => void;
    stateFilter: (
        callbackfn: (value: InferArrayElement<TShape>, index: number) => void,
    ) => ArrayEndType<TShape>;
    getSelected: () => StateObject<InferArrayElement<TShape>> | undefined;
} & EndType<TShape> & {
        [K in keyof (any[] extends infer T ? T : never)]: never;
    };

export type UpdateType<T> = (
    payload: UpdateArg<Prettify<T>>,
    opts?: UpdateOpts,
) => void;
export type FormOptsType = {
    key?: string;
    validation?: {
        message?: string;
        stretch?: boolean;
        props?: GenericObject;
        disable?: boolean;
    };
    formElements?: boolean;
    debounceTime?: number;
    stateServerDifferences?: string[][];
};

export type FormControl<T> = (obj: FormElementParmas<T>) => JSX.Element;

export type UpdateArg<S> = S | ((prevState: S) => S);
export type UpdateOpts = {
    timelineLabel?: string;
    timeLineMessage?: string;
    validate?: boolean;
};
export type ObjectEndType<T> = EndType<T> & {
    [K in keyof T]-?: ObjectEndType<T[K]>;
} & {
    stateObject: (
        callbackfn: (value: T, setter: StateObject<T>) => void,
    ) => any;
    delete: () => void;
};

export type EndType<T> = {
    update: UpdateType<T>;
    _path: string[];
    _stateKey: string;
    formElement: (
        validationKey: string,
        control: FormControl<T>,
        opts?: FormOptsType,
    ) => JSX.Element;
    get: () => T;

    $get: () => T;
    _status: "fresh" | "stale" | "synced";
    showValidationErrors: (ctx: string) => string[];
    setValidation: (ctx: string) => void;
    removeValidation: (ctx: string) => void;
    ignoreFields: (fields: string[]) => StateObject<T>;
    _selected: boolean; // New field for selection state
    setSelected: (value: boolean) => void; // New method to update selection
    validationWrapper: ({
        children,
        hideMessage,
    }: {
        children: React.ReactNode;
        hideMessage?: boolean;
    }) => JSX.Element;
    lastSynced?: SyncInfo;
} & {
    [K in keyof (any extends infer T ? T : never)]: never;
};
export type StateObject<T> = (T extends any[]
    ? ArrayEndType<T>
    : T extends Record<string, unknown> | object
      ? { [K in keyof T]-?: StateObject<T[K]> } & ObjectEndType<T>
      : T extends string | number | boolean | null
        ? T
        : never) &
    EndType<T> & {
        _componentId: string | null;
        _initialState: T;
        updateInitialState: (newState: T | null) => {
            fetchId: (field: keyof T) => string | number;
        };
        _isLoading: boolean;
        _serverState: T;
        revertToInitialState: (obj?: { validationKey?: string }) => void;
        middleware: (
            middles: ({
                updateLog,
                update,
            }: {
                updateLog: UpdateTypeDetail[] | undefined;
                update: UpdateTypeDetail;
            }) => void,
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
    opts?: UpdateOpts,
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

//let globalStoreInstance: ReturnType<typeof getGlobalStore> | null = null;

// export const getGlobalStore = <State extends GenericObject | GenericObject[]>(initialState?: State) => {
//     if (!globalStoreInstance) {
//         globalStoreInstance = cogStateGlobalStore(initialState ?? {});
//     }
//     return globalStoreInstance;
// };

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

export type OptionsType<T extends unknown = unknown> = {
    serverSync?: ServerSyncType<T>;
    validationKey?: string;
    enableServerState?: boolean;
    middleware?: ({
        updateLog,
        update,
    }: {
        updateLog: UpdateTypeDetail[] | undefined;
        update: UpdateTypeDetail;
    }) => void;

    zodSchema?: ZodObject<ZodRawShape>;
    modifyState?: (state: T) => T;
    localStorage?: { key: string | ((state: T) => string) };
    formElements?: FormsElementsType;
    enabledSync?: (state: T) => boolean;
    reactiveDeps?: (state: T) => any[] | true;
    syncUpdate?: Partial<UpdateTypeDetail>;
    initState?: {
        localStorageKey?: string;
        ctx?: Record<string, any>;
        initialState: T;
        dependencies?: any[]; // Just like useEffect dependencies
    };
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
export type FunctionsToPassDownType = {
    getValidationErrors: (pathArray: string) => string[];
    removeValidationError: (path: string) => void;
};

export type AllStateTypes<T extends unknown> = Record<string, T>;

export type CogsInitialState<T> = {
    initialState: T;
    formElements?: FormsElementsType<T>;
};

export type TransformedStateType<T> = {
    [P in keyof T]: T[P] extends CogsInitialState<infer U> ? U : T[P];
};

export function addStateOptions<T extends unknown>(
    initialState: T,
    { formElements, zodSchema }: OptionsType<T>,
) {
    return { initialState: initialState, formElements, zodSchema } as T;
}

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
    options?: Opt;
    initialOptionsPart: Record<string, any>;
}) {
    const initialOptions = getInitialOptions(stateKey as string) || {};
    const initialOptionsPartState =
        initialOptionsPart[stateKey as string] || {};
    const setInitialStateOptions =
        getGlobalStore.getState().setInitialStateOptions;
    const mergedOptions = { ...initialOptionsPartState, ...initialOptions };

    let needToAdd = false;
    if (options) {
        for (const key in options) {
            if (!mergedOptions.hasOwnProperty(key)) {
                needToAdd = true;
                mergedOptions[key] = options[key as keyof typeof options];
            }
        }
    }
    if (needToAdd) {
        setInitialStateOptions(stateKey as string, mergedOptions);
    }
}

export const createCogsState = <State extends Record<string, unknown>>(
    initialState: State,
) => {
    let newInitialState = initialState;

    const [statePart, initialOptionsPart] =
        transformStateFunc<State>(newInitialState);

    getGlobalStore.getState().setInitialStates(statePart);
    type StateKeys = keyof typeof statePart;

    const useCogsState = <StateKey extends StateKeys>(
        stateKey: StateKey,
        options?: OptionsType<(typeof statePart)[StateKey]>,
    ) => {
        const [componentId] = useState(uuidv4());
        setOptions({ stateKey, options, initialOptionsPart });

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
                reactiveDeps: options?.reactiveDeps,
                initState: options?.initState,
            },
        );

        return updater;
    };

    function setCogsOptions<StateKey extends StateKeys>(
        stateKey: StateKey,
        options: OptionsType<(typeof statePart)[StateKey]>,
    ) {
        setOptions({ stateKey, options, initialOptionsPart });
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
    sessionId?: string,
) => {
    if (currentInitialOptions?.initState) {
        const data: LocalStorageData<T> = {
            state,
            lastUpdated: Date.now(),
            lastSyncedWithServer:
                getGlobalStore.getState().serverSyncLog[thisKey]?.[0]
                    ?.timeStamp,
            baseServerState: getGlobalStore.getState().serverState[thisKey],
        };

        const storageKey = currentInitialOptions.initState
            ? `${sessionId}-${thisKey}-${currentInitialOptions.initState.localStorageKey}`
            : thisKey;

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
    sessionId?: string,
) => {
    // Update all global state at once
    const updates = {
        initialState: initialState,
        updaterState: createProxyHandler(
            thisKey,
            effectiveSetState,
            componentId,
            sessionId,
        ),
        state: newState,
    };

    startTransition(() => {
        updateInitialStateGlobal(thisKey, updates.initialState);
        setUpdaterState(thisKey, updates.updaterState);
        setState(thisKey, updates.state);
    });
};

const notifyComponents = (thisKey: string) => {
    const stateEntry = getGlobalStore.getState().stateComponents.get(thisKey);
    if (!stateEntry) return;

    // Batch component updates
    const updates = new Set<() => void>();
    stateEntry.components.forEach((component) => {
        updates.add(() => component.forceUpdate());
    });

    // Schedule updates in the next tick to allow batching
    queueMicrotask(() => {
        startTransition(() => {
            updates.forEach((update) => update());
        });
    });
};

export function useCogsStateFn<TStateObject extends unknown>(
    stateObject: TStateObject,
    {
        stateKey,
        serverSync,
        zodSchema,
        localStorage,
        formElements,
        middleware,
        reactiveDeps,
        componentId,
        initState,
        syncUpdate,
    }: {
        stateKey?: string;
        componentId?: string;
    } & OptionsType<TStateObject> = {},
) {
    const [reactiveForce, forceUpdate] = useState({}); //this is the key to reactivity
    const { sessionId } = useCogsConfig();

    let noStateKey = stateKey ? false : true;
    const [thisKey] = useState(stateKey ?? uuidv4());
    const stateLog = getGlobalStore.getState().stateLog[thisKey];
    const componentUpdatesRef = useRef(new Set<string>());
    const componentIdRef = useRef(componentId ?? uuidv4());
    const latestInitialOptionsRef = useRef<any>(null);
    latestInitialOptionsRef.current = getInitialOptions(thisKey as string); //i have to do this for it to work
    useEffect(() => {
        if (
            syncUpdate &&
            syncUpdate.stateKey === thisKey &&
            syncUpdate.path?.[0]
        ) {
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
        setAndMergeOptions(thisKey as string, {
            initState,
        });
        const localData = loadFromLocalStorage(
            sessionId + "-" + thisKey + "-" + initState?.localStorageKey,
        );
        let newState = null;
        if (initState?.initialState) {
            newState = initState?.initialState;

            if (localData) {
                if (
                    localData.lastUpdated >
                    (localData.lastSyncedWithServer || 0)
                ) {
                    newState = localData.state;
                }
            }
            updateGlobalState(
                thisKey,
                initState?.initialState,
                newState,
                effectiveSetState,
                componentIdRef.current,
                sessionId,
            );
        }
        notifyComponents(thisKey);
    }, [initState?.localStorageKey, ...(initState?.dependencies || [])]);

    useEffect(() => {
        if (noStateKey) {
            setAndMergeOptions(thisKey as string, {
                serverSync,
                formElements,
                zodSchema,
                initState,
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
        console.log("stateEntry", stateEntry);
        stateEntry.components.set(depsKey, {
            forceUpdate: () => forceUpdate({}),
            paths: new Set(),
            deps: [],
            depsFunction: reactiveDeps || undefined,
        });

        getGlobalStore.getState().stateComponents.set(thisKey, stateEntry);
        console.log(
            "   getGlobalStore.getState().stateComponent",
            getGlobalStore.getState().stateComponents,
        );
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
        validationKey?: string,
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
                const elements = getGlobalStore
                    .getState()
                    .signalDomElements.get(signalId);
                //   console.log("elements", elements);
                if (elements) {
                    const newValue = getNestedValue(payload, path);
                    elements.forEach(({ parentId, position }) => {
                        const parent = document.querySelector(
                            `[data-parent-id="${parentId}"]`,
                        );
                        if (parent) {
                            const childNodes = Array.from(parent.childNodes);
                            if (childNodes[position]) {
                                childNodes[position].textContent =
                                    String(newValue);
                            }
                        }
                    });
                }
            }
            if (
                updateObj.updateType === "update" &&
                (validationKey ||
                    latestInitialOptionsRef.current?.validationKey) &&
                path
            ) {
                removeValidationError(
                    (validationKey ||
                        latestInitialOptionsRef.current?.validationKey) +
                        "." +
                        path.join("."),
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
                        arrayWithoutIndex.join("."),
                );
            }
            if (
                updateObj.updateType === "insert" &&
                latestInitialOptionsRef.current?.validationKey
            ) {
                let getValidation = getValidationErrors(
                    latestInitialOptionsRef.current?.validationKey +
                        "." +
                        arrayWithoutIndex.join("."),
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
            const stateEntry = getGlobalStore
                .getState()
                .stateComponents.get(thisKey);
            console.log("stateEntry", stateEntry);
            if (stateEntry) {
                for (const [
                    key,
                    component,
                ] of stateEntry.components.entries()) {
                    if (
                        component.depsFunction ||
                        (component.paths && component.paths.has(pathToCheck))
                    ) {
                        if (component.depsFunction) {
                            const depsResult = component.depsFunction(payload);

                            if (typeof depsResult === "boolean") {
                                if (depsResult) {
                                    component.forceUpdate();
                                }
                            } else if (
                                !isDeepEqual(component.deps, depsResult)
                            ) {
                                component.deps = depsResult;
                                component.forceUpdate();
                            }
                        } else {
                            component.forceUpdate();
                        }
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
                        existing.timeStamp = Math.max(
                            existing.timeStamp,
                            log.timeStamp,
                        );
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
                sessionId,
            );

            if (middleware) {
                middleware({ updateLog: stateLog, update: newUpdate });
            }
            if (latestInitialOptionsRef.current?.serverSync) {
                const serverStateStore =
                    getGlobalStore.getState().serverState[thisKey];
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
        console.log("Initializing state for", thisKey, stateObject); // Debug log
        setUpdaterState(
            thisKey,
            createProxyHandler(
                thisKey,
                effectiveSetState,
                componentIdRef.current,
                sessionId,
            ),
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
            sessionId,
        );
    }, [thisKey]);

    return [getKeyState(thisKey), updaterFinal] as [
        TStateObject,
        StateObject<TStateObject>,
    ];
}

function SignalRenderer({
    proxy,
}: {
    proxy: { _path: string[]; _stateKey: string };
}) {
    const elementRef = useRef<HTMLSpanElement>(null);
    const signalId = `${proxy._stateKey}-${proxy._path.join(".")}`;

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !element.parentElement) {
            console.log("No element or parent");
            return;
        }

        const parentElement = element.parentElement;
        const childNodes = Array.from(parentElement.childNodes);
        const position = childNodes.indexOf(element);

        // Get or create parent ID
        let parentId = parentElement.getAttribute("data-parent-id");
        if (!parentId) {
            parentId = `parent-${crypto.randomUUID()}`;
            parentElement.setAttribute("data-parent-id", parentId);
        }

        const instanceId = `instance-${crypto.randomUUID()}`;
        const elementInfo = { instanceId, parentId, position };

        getGlobalStore.getState().addSignalElement(signalId, elementInfo);

        const textNode = document.createTextNode(
            String(
                getGlobalStore
                    .getState()
                    .getNestedState(proxy._stateKey, proxy._path),
            ),
        );
        element.replaceWith(textNode);
    }, [proxy._stateKey, proxy._path.join(".")]);

    return createElement("span", {
        ref: elementRef,
        style: { display: "none" },
    });
}

function createProxyHandler<T>(
    stateKey: string,
    effectiveSetState: EffectiveSetState<T>,
    componentId: string,
    sessionId?: string,
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

    const selectedIndexMap = new Map<string, number>();

    const baseObj = {
        removeValidation: (obj?: { validationKey?: string }) => {
            if (obj?.validationKey) {
                removeValidationError(obj.validationKey);
            }
        },

        revertToInitialState: (obj?: { validationKey?: string }) => {
            if (obj?.validationKey) {
                removeValidationError(obj.validationKey);
            }

            const initialState =
                getGlobalStore.getState().initialStateGlobal[stateKey];

            // ADDED: Clear cache on revert
            shapeCache.clear();
            stateVersion++;

            const newProxy = rebuildStateShape(initialState, []);

            startTransition(() => {
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
                const initalOptionsGet = getInitialOptions(stateKey as string);
                if (initalOptionsGet?.initState) {
                    localStorage.removeItem(
                        initalOptionsGet?.initState
                            ? sessionId +
                                  "-" +
                                  stateKey +
                                  "-" +
                                  initalOptionsGet?.initState.localStorageKey
                            : stateKey,
                    );
                }
                localStorage.removeItem(stateKey);
            });
        },
        updateInitialState: (newState: T) => {
            // ADDED: Clear cache on initial state update
            shapeCache.clear();
            stateVersion++;

            const newUpdaterState = createProxyHandler(
                stateKey,
                effectiveSetState,
                componentId,
                sessionId,
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
                localStorage.removeItem(stateKey);
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
                serverState && isDeepEqual(serverState, getKeyState(stateKey)),
            );
        },
    };

    function rebuildStateShape(
        currentState: T,
        path: string[] = [],
        meta?: { filtered?: string[][]; validIndices?: number[] },
    ): any {
        const cacheKey = path.map(String).join(".");

        // MODIFIED: Cache check with version
        const cachedEntry = shapeCache.get(cacheKey);
        if (cachedEntry?.stateVersion === stateVersion) {
            return cachedEntry.proxy;
        }

        const handler = {
            get(target: any, prop: string) {
                if (prop !== "then" && prop !== "$get") {
                    const currentPath = path.join(".");
                    const fullComponentId = `${stateKey}////${componentId}`;
                    const stateEntry = getGlobalStore
                        .getState()
                        .stateComponents.get(stateKey);
                    if (stateEntry && currentPath) {
                        const component =
                            stateEntry.components.get(fullComponentId);
                        if (component) {
                            component.paths.add(currentPath);
                        }
                    }
                }

                if (prop === "lastSynced") {
                    const syncKey = `${stateKey}:${path.join(".")}`;
                    return getGlobalStore.getState().getSyncInfo(syncKey);
                }

                if (prop === "_selected") {
                    const parentPath = path.slice(0, -1);
                    const parentKey = parentPath.join(".");
                    const parent = getGlobalStore
                        .getState()
                        .getNestedState(stateKey, parentPath);
                    if (Array.isArray(parent)) {
                        const currentIndex = Number(path[path.length - 1]);
                        return currentIndex === selectedIndexMap.get(parentKey);
                    }
                    return undefined;
                }
                if (prop == "getLocalStorage") {
                    return (key: string) =>
                        loadFromLocalStorage(
                            sessionId + "-" + stateKey + "-" + key,
                        );
                }
                if (prop === "setSelected") {
                    return (value: boolean) => {
                        const parentPath = path.slice(0, -1);
                        const thisIndex = Number(path[path.length - 1]);
                        const parentKey = parentPath.join(".");
                        if (value) {
                            selectedIndexMap.set(parentKey, thisIndex);
                        } else {
                            // Optional: clear selection if false
                            selectedIndexMap.delete(parentKey);
                        }
                        const nested = getGlobalStore
                            .getState()
                            .getNestedState(stateKey, [...parentPath]);
                        updateFn(effectiveSetState, nested, parentPath);

                        // ADDED: Invalidate cache for parent path
                        invalidateCachePath(parentPath);
                    };
                }

                if (path.length == 0) {
                    if (prop == "_componentId") return componentId;
                    if (prop === "_initialState")
                        return getGlobalStore.getState().initialStateGlobal[
                            stateKey
                        ];
                    if (prop === "_serverState")
                        return getGlobalStore.getState().serverState[stateKey];
                    if (prop === "_isLoading")
                        return getGlobalStore.getState().isLoadingGlobal[
                            stateKey
                        ];
                    if (prop === "revertToInitialState")
                        return baseObj.revertToInitialState;
                    if (prop === "updateInitialState")
                        return baseObj.updateInitialState;
                    if (prop === "removeValidation")
                        return baseObj.removeValidation;
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
                                hideMessage
                                    ? { validation: { message: "" } }
                                    : undefined
                            }
                            path={path}
                            validationKey={
                                getGlobalStore
                                    .getState()
                                    .getInitialOptions(stateKey)
                                    ?.validationKey || ""
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
                    return (payload: UpdateArg<T>, opts?: UpdateOpts) => {
                        // ADDED: Invalidate cache on update
                        invalidateCachePath(path);
                        updateFn(effectiveSetState, payload, path, "");
                    };
                }

                if (prop === "get") {
                    return () =>
                        getGlobalStore
                            .getState()
                            .getNestedState(stateKey, path);
                }

                if (prop === "$get") {
                    return () =>
                        $cogsSignal({ _stateKey: stateKey, _path: path });
                }

                if (prop === "formElement") {
                    return (
                        validationKey: string,
                        child: FormControl<T>,
                        formOpts?: FormOptsType,
                    ) => {
                        return (
                            <FormControlComponent<T>
                                setState={effectiveSetState}
                                validationKey={validationKey}
                                stateKey={stateKey}
                                path={path}
                                child={child}
                                formOpts={formOpts}
                            />
                        );
                    };
                }

                if (Array.isArray(currentState)) {
                    if (prop === "getSelected") {
                        return () => {
                            const selectedIndex = selectedIndexMap.get(
                                path.join("."),
                            );
                            if (selectedIndex === undefined) return undefined;
                            return rebuildStateShape(
                                currentState[selectedIndex],
                                [...path, selectedIndex.toString()],
                                meta,
                            );
                        };
                    }

                    if (prop === "$get") {
                        return () =>
                            $cogsSignal({ _stateKey: stateKey, _path: path });
                    }
                    if (prop === "stateEach") {
                        return (
                            callbackfn: (
                                value: InferArrayElement<T>,
                                setter: StateObject<InferArrayElement<T>>,
                                index: number,
                                array: T,
                                arraySetter: StateObject<T>,
                            ) => void,
                        ) => {
                            const isFiltered = meta?.filtered?.some(
                                (p) => p.join(".") === path.join("."),
                            );
                            const arrayToMap = isFiltered
                                ? currentState
                                : getGlobalStore
                                      .getState()
                                      .getNestedState(stateKey, path);

                            // ADDED: Clear shape cache for array operations
                            shapeCache.clear();
                            stateVersion++;

                            return arrayToMap.map((val: any, index: number) => {
                                const thisIndex =
                                    isFiltered && val.__origIndex
                                        ? val.__origIndex
                                        : index;
                                const elementProxy = rebuildStateShape(
                                    val,
                                    [...path, thisIndex.toString()],
                                    meta,
                                );
                                return callbackfn(
                                    val,
                                    elementProxy,
                                    index,
                                    currentState as any,
                                    rebuildStateShape(
                                        currentState as any,
                                        path,
                                        meta,
                                    ),
                                );
                            });
                        };
                    }

                    if (prop === "stateFlattenOn") {
                        return (fieldName: string) => {
                            const isFiltered = meta?.filtered?.some(
                                (p) => p.join(".") === path.join("."),
                            );
                            const arrayToMap = isFiltered
                                ? currentState
                                : getGlobalStore
                                      .getState()
                                      .getNestedState(stateKey, path);

                            // ADDED: Clear shape cache for flattening operation
                            shapeCache.clear();
                            stateVersion++;

                            const flattenedResults = arrayToMap.flatMap(
                                (val: any, index: number) => {
                                    return val[fieldName] ?? [];
                                },
                            );

                            return rebuildStateShape(
                                flattenedResults,
                                [...path, "[*]", fieldName],
                                meta,
                            );
                        };
                    }

                    if (prop === "findWith") {
                        return (
                            thisKey: keyof InferArrayElement<T>,
                            thisValue: InferArrayElement<T>[keyof InferArrayElement<T>],
                        ) => {
                            const foundIndex = currentState.findIndex(
                                (obj: any) => obj[thisKey] === thisValue,
                            );
                            if (foundIndex === -1) return undefined;
                            const foundValue = currentState[foundIndex];
                            const newPath = [...path, foundIndex.toString()];

                            // Create the proxy for the found item and add cut method
                            const itemProxy = rebuildStateShape(
                                foundValue,
                                newPath,
                            );
                            return {
                                ...itemProxy,
                                cut: () => {
                                    cutFunc(
                                        effectiveSetState,
                                        path,
                                        stateKey,
                                        foundIndex,
                                    );
                                },
                            };
                        };
                    }

                    if (prop === "index") {
                        return (index: number) => {
                            const indexValue = currentState[index];
                            return rebuildStateShape(indexValue, [
                                ...path,
                                index.toString(),
                            ]);
                        };
                    }

                    if (prop === "insert") {
                        return (payload: UpdateArg<T>) => {
                            // ADDED: Invalidate cache on insert
                            invalidateCachePath(path);
                            pushFunc(
                                effectiveSetState,
                                payload,
                                path,
                                stateKey,
                            );
                            return rebuildStateShape(
                                getGlobalStore.getState().cogsStateStore[
                                    stateKey
                                ],
                                [],
                            );
                        };
                    }

                    if (prop === "uniqueInsert") {
                        return (
                            payload: UpdateArg<T>,
                            fields?: (keyof InferArrayElement<T>)[],
                        ) => {
                            const currentArray = getGlobalStore
                                .getState()
                                .getNestedState(stateKey, path) as any[];
                            const newValue = isFunction<T>(payload)
                                ? payload(currentArray as any)
                                : (payload as any);

                            const isUnique = !currentArray.some((item) => {
                                if (fields) {
                                    return fields.every((field) =>
                                        isDeepEqual(
                                            item[field],
                                            newValue[field],
                                        ),
                                    );
                                }
                                return isDeepEqual(item, newValue);
                            });

                            if (isUnique) {
                                // ADDED: Invalidate cache on unique insert
                                invalidateCachePath(path);
                                pushFunc(
                                    effectiveSetState,
                                    newValue,
                                    path,
                                    stateKey,
                                );
                            }
                        };
                    }

                    if (prop === "cut") {
                        return (
                            index: number,
                            options?: { waitForSync?: boolean },
                        ) => {
                            if (options?.waitForSync) return;
                            // ADDED: Invalidate cache on cut
                            invalidateCachePath(path);
                            cutFunc(effectiveSetState, path, stateKey, index);
                        };
                    }

                    if (prop === "stateFilter") {
                        return (
                            callbackfn: (
                                value: InferArrayElement<T>,
                                index: number,
                            ) => boolean,
                        ) => {
                            const newVal = currentState.map(
                                (v: any, i: number) => ({
                                    ...v,
                                    __origIndex: i.toString(),
                                }),
                            );

                            const validIndices: number[] = [];
                            const filteredArray: Array<InferArrayElement<T>> =
                                [];

                            for (let i = 0; i < newVal.length; i++) {
                                if (callbackfn(newVal[i], i)) {
                                    validIndices.push(i);
                                    filteredArray.push(newVal[i]);
                                }
                            }

                            // ADDED: Clear cache for filter operation
                            shapeCache.clear();
                            stateVersion++;
                            return rebuildStateShape(
                                filteredArray as any,
                                path,
                                {
                                    filtered: [...(meta?.filtered || []), path],
                                    validIndices, // Pass through the meta
                                },
                            );
                        };
                    }
                }

                const nextPath = [...path, prop];
                const nextValue = getGlobalStore
                    .getState()
                    .getNestedState(stateKey, nextPath);
                return rebuildStateShape(nextValue, nextPath, meta);
            },
        };

        const proxyInstance = new Proxy(baseObj as StateObject<T>, handler);

        shapeCache.set(cacheKey, {
            proxy: proxyInstance,
            stateVersion: stateVersion,
        });

        return proxyInstance;
    }

    return rebuildStateShape(
        getGlobalStore.getState().getNestedState(stateKey, []),
    );
}

export function $cogsSignal(proxy: { _path: string[]; _stateKey: string }) {
    return createElement(SignalRenderer, { proxy });
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
        () =>
            getGlobalStore
                .getState()
                .getNestedState(proxy._stateKey, proxy._path),
    );
    return createElement("text", {}, String(value));
}
