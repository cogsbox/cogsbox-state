import type {
    EffectiveSetState,
    FormElementParmas,
    FormOptsType,
    UpdateArg,
    UpdateOpts,
} from "./CogsState";

import { getNestedValue, isFunction, updateNestedProperty } from "./utility";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { getGlobalStore } from "./store";

export function updateFn<U>(
    setState: EffectiveSetState<U>,
    payload: UpdateArg<U>,
    path: string[],
    validationKey?: string,
): void {
    setState(
        (prevState) => {
            if (isFunction<U>(payload)) {
                const nestedValue = payload(getNestedValue(prevState, path));
                let value = updateNestedProperty(path, prevState, nestedValue);
                if (typeof value == "string") {
                    value = value.trim();
                }
                return value;
            } else {
                let value =
                    !path || path.length == 0
                        ? payload
                        : updateNestedProperty(path, prevState, payload);
                if (typeof value == "string") {
                    value = value.trim();
                }
                return value;
            }
        },
        path,
        { updateType: "update" },
        validationKey,
    );
}

export function pushFunc<U>(
    setState: EffectiveSetState<U>,
    payload: UpdateArg<U>,
    path: string[],
    stateKey: string,
    index?: number,
): void {
    const array = getGlobalStore
        .getState()
        .getNestedState(stateKey, path) as U[];
    setState(
        (prevState) => {
            let arrayToUpdate =
                !path || path.length == 0
                    ? prevState
                    : getNestedValue(prevState, [...path]);
            let returnedArray = [...arrayToUpdate];

            returnedArray.splice(
                index || Number(index) == 0 ? index : arrayToUpdate.length,
                0,
                isFunction<U>(payload)
                    ? payload(index == -1 ? undefined : arrayToUpdate)
                    : payload,
            );
            const value =
                path.length == 0
                    ? returnedArray
                    : updateNestedProperty([...path], prevState, returnedArray);

            return value as U;
        },
        [
            ...path,
            index || index === 0
                ? index?.toString()
                : (array!.length - 1).toString(),
        ],
        {
            updateType: "insert",
        },
    );
}

export function cutFunc<U>(
    setState: EffectiveSetState<U>,
    path: string[],
    stateKey: string,
    index: number,
): void {
    const array = getGlobalStore
        .getState()
        .getNestedState(stateKey, path) as U[];
    setState(
        (prevState) => {
            const arrayToUpdate = getNestedValue(prevState, [...path]);
            if (index < 0 || index >= arrayToUpdate?.length) {
                throw new Error(`Index ${index} does not exist in the array.`);
            }
            const indexToCut =
                index || Number(index) == 0 ? index : arrayToUpdate.length - 1;

            const updatedArray = [
                ...arrayToUpdate.slice(0, indexToCut),
                ...arrayToUpdate.slice(indexToCut + 1),
            ] as U;

            console.log(index);
            return path.length == 0
                ? updatedArray
                : updateNestedProperty([...path], prevState, updatedArray);
        },
        [
            ...path,
            index || index === 0
                ? index?.toString()
                : (array!.length - 1).toString(),
        ],
        { updateType: "cut" },
    );
}

export const useStoreSubscription = <T,>(
    fullPath: string,
    selector: (
        store: ReturnType<typeof getGlobalStore.getState>,
        path: string,
    ) => T,
    compare: (a: T, b: T) => boolean = (a, b) =>
        JSON.stringify(a) === JSON.stringify(b),
) => {
    const [value, setValue] = useState<T>(() =>
        selector(getGlobalStore.getState(), fullPath),
    );
    const previousValueRef = useRef<T>(value);

    useEffect(() => {
        const unsubscribe = getGlobalStore.subscribe((store) => {
            const newValue = selector(store, fullPath);
            if (!compare(previousValueRef.current, newValue)) {
                previousValueRef.current = newValue;
                setValue(newValue);
            }
        });

        return () => unsubscribe();
    }, [fullPath]);

    return value;
};
export const useGetValidationErrors = (
    validationKey: string,
    path: string[],
    validIndices?: number[],
) => {
    // Construct the full path the same way as ValidationWrapper
    const fullPath =
        validationKey +
        "." +
        (path.length > 0 ? [path.join(".")] : []) +
        (validIndices && validIndices.length > 0 ? "." + validIndices : "");

    // Skip subscription if we have empty indices
    if (validIndices?.length === 0) {
        return [];
    }

    return useStoreSubscription(
        fullPath,
        (store, path) => store.getValidationErrors(path) || [],
    );
};

export const useGetSyncInfo = (key: string, path: string[]) => {
    const syncKey = `${key}:${path.join(".")}`;
    return useStoreSubscription(syncKey, (store, path) =>
        store.getSyncInfo(path),
    );
};
export const useGetKeyState = (key: string, path: string[]) => {
    return useStoreSubscription(`${key}:${path.join(".")}`, (store, fullPath) =>
        store.getNestedState(key, path),
    );
};
interface FormControlComponentProps<TStateObject> {
    setState: EffectiveSetState<TStateObject>;
    validationKey: string;
    path: string[];
    child: (obj: FormElementParmas<TStateObject>) => JSX.Element;
    formOpts?: FormOptsType;
    stateKey: string;
}
export const FormControlComponent = <TStateObject,>({
    setState,
    validationKey,
    path,
    child,
    formOpts,
    stateKey,
}: FormControlComponentProps<TStateObject>) => {
    const { getValidationErrors } = getGlobalStore.getState();
    const stateValue = useGetKeyState(stateKey, path);
    const [inputValue, setInputValue] = useState<any>(
        getGlobalStore.getState().getNestedState(stateKey, path),
    );

    useEffect(() => {
        setInputValue(stateValue);
    }, [stateKey, path.join("."), stateValue]);

    const timeoutRef = useRef<NodeJS.Timeout>();

    let updater = (
        payload: UpdateArg<TStateObject>,
        opts?: UpdateOpts<TStateObject>,
    ) => {
        setInputValue(payload);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            updateFn(setState, payload, path, validationKey);
        }, formOpts?.debounceTime ?? 300);
    };

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const rawSyncStatus = useGetSyncInfo(stateKey, path);
    const syncStatus = rawSyncStatus
        ? {
              ...rawSyncStatus,
              date: new Date(rawSyncStatus.timeStamp),
          }
        : null;
    const childElement = child({
        get: () =>
            inputValue ||
            getGlobalStore.getState().getNestedState(stateKey, path),
        set: updater,
        syncStatus,
        path: path,
        validationErrors: () =>
            getValidationErrors(validationKey + "." + path.join(".")),

        // Add default input props
        inputProps: {
            value:
                inputValue ||
                getGlobalStore.getState().getNestedState(stateKey, path) ||
                "",
            onChange: (e: any) => updater(e.target.value),
        },
    });

    return (
        <>
            <ValidationWrapper
                {...{
                    formOpts,
                    path,
                    validationKey,
                    stateKey,
                }}
            >
                {childElement}
            </ValidationWrapper>
        </>
    );
};

export function ValidationWrapper({
    formOpts,
    path,
    validationKey,
    stateKey,
    children,
    validIndices,
}: {
    formOpts?: FormOptsType;
    path: string[];
    validationKey: string;
    stateKey?: string;
    children: React.ReactNode;
    validIndices?: number[];
}) {
    const { getInitialOptions, getValidationErrors } =
        getGlobalStore.getState();
    const validationErrors = useGetValidationErrors(
        validationKey,
        path,
        validIndices,
    );
    const thesMessages: string[] = [];

    if (validationErrors) {
        const newMessage = validationErrors!.join(", ");
        if (!thesMessages.includes(newMessage)) {
            thesMessages.push(newMessage);
        }
    }
    let fullMessageString =
        thesMessages?.length > 0 ? thesMessages?.join(", ") : "";

    const thisStateOpts = getInitialOptions(stateKey!);

    return (
        <>
            {thisStateOpts?.formElements?.validation &&
            !formOpts?.validation?.disable ? (
                thisStateOpts.formElements!.validation!({
                    children: (
                        <React.Fragment key={path.toString()}>
                            {children}
                        </React.Fragment>
                    ),
                    active: fullMessageString != "" ? true : false,
                    message: formOpts?.validation?.message
                        ? formOpts?.validation?.message
                        : formOpts?.validation?.message == ""
                          ? ""
                          : fullMessageString,
                    path,

                    ...(formOpts?.key && { key: formOpts?.key }),
                })
            ) : (
                <React.Fragment key={path.toString()}>
                    {children}
                </React.Fragment>
            )}
        </>
    );
}
