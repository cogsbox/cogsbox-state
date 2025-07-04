import {
  type FormElementParams,
  type FormOptsType,
  type UpdateArg,
} from "./CogsState";

import { getNestedValue, isFunction, updateNestedProperty } from "./utility";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { getGlobalStore, formRefStore } from "./store";
import { validateZodPathFunc } from "./useValidateZodPath";
import { ulid } from "ulid";

export const useStoreSubscription = <T,>(
  fullPath: string,
  selector: (
    store: ReturnType<typeof getGlobalStore.getState>,
    path: string
  ) => T,
  compare: (a: T, b: T) => boolean = (a, b) =>
    JSON.stringify(a) === JSON.stringify(b)
) => {
  const [value, setValue] = useState<T>(() =>
    selector(getGlobalStore.getState(), fullPath)
  );
  const previousValueRef = useRef<T>(value);
  const fullPathRef = useRef(fullPath);
  useEffect(() => {
    fullPathRef.current = fullPath; // Ensure latest fullPath is always used

    setValue(selector(getGlobalStore.getState(), fullPath));

    const callback = (store: any) => {
      const newValue = selector(store, fullPathRef.current);

      if (!compare(previousValueRef.current, newValue)) {
        previousValueRef.current = newValue;
        setValue(newValue);
      }
    };
    const unsubscribe = getGlobalStore.subscribe(callback);
    return () => {
      unsubscribe();
    };
  }, [fullPath]);
  return value;
};
export const useGetValidationErrors = (
  validationKey: string,
  path: string[],
  validIndices?: number[]
) => {
  const fullPath =
    validationKey +
    "." +
    (path.length > 0 ? [path.join(".")] : []) +
    (validIndices && validIndices.length > 0 ? "." + validIndices : "");

  const returnresult = useStoreSubscription(
    fullPath,
    (store, path) => store.getValidationErrors(path) || []
  );

  return returnresult;
};

export const useGetSyncInfo = (key: string, path: string[]) => {
  const syncKey = `${key}:${path.join(".")}`;
  return useStoreSubscription(syncKey, (store, path) =>
    store.getSyncInfo(path)
  );
};
export const useGetKeyState = (key: string, path: string[]) => {
  return useStoreSubscription(`${key}:${path.join(".")}`, (store, fullPath) =>
    store.getNestedState(key, path)
  );
};
interface FormControlComponentProps<TStateObject> {
  setState: any;

  path: string[];
  child: (obj: FormElementParams<TStateObject>) => JSX.Element;
  formOpts?: FormOptsType;
  stateKey: string;
}
// Find FormControlComponent in your Functions.ts or equivalent file

export const FormControlComponent = <TStateObject,>({
  setState, // This is the real effectiveSetState from the hook
  path,
  child,
  formOpts,
  stateKey,
}: FormControlComponentProps<TStateObject>) => {
  const { registerFormRef, getFormRef } = formRefStore.getState();
  const {
    getValidationErrors,
    addValidationError,
    getInitialOptions,
    removeValidationError,
  } = getGlobalStore.getState();
  const stateKeyPathKey = [stateKey, ...path].join(".");
  const [, forceUpdate] = useState<any>();
  getGlobalStore.getState().subscribeToPath(stateKeyPathKey, () => {
    forceUpdate({});
  });

  const refKey = stateKey + "." + path.join(".");
  const localFormRef = useRef<HTMLInputElement>(null);
  const existingRef = getFormRef(refKey);
  if (!existingRef) {
    registerFormRef(refKey, localFormRef);
  }
  const formRef = existingRef || localFormRef;

  // --- START CHANGES ---

  const globalStateValue = getGlobalStore
    .getState()
    .getShadowValue(stateKeyPathKey);
  const [localValue, setLocalValue] = useState<any>(globalStateValue);
  const isCurrentlyDebouncing = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to sync local state if global state changes externally
  useEffect(() => {
    // Only update local if not actively debouncing a local change
    if (!isCurrentlyDebouncing.current && globalStateValue !== localValue) {
      setLocalValue(globalStateValue);
    }
  }, [globalStateValue]); // Removed localValue dependency

  // Effect for cleanup
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null; // Explicitly nullify
        isCurrentlyDebouncing.current = false;
      }
    };
  }, []);

  const debouncedUpdater = (payload: UpdateArg<TStateObject>) => {
    setLocalValue(payload); // Update local state immediately
    isCurrentlyDebouncing.current = true;

    if (payload === "") {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current); // Clear pending timer
        debounceTimeoutRef.current = null;
      }

      setState(payload, path, { updateType: "update" });
      isCurrentlyDebouncing.current = false; // No longer debouncing
      return; // Don't proceed to set another timeout
    }

    // If not empty, proceed with normal debouncing
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(
      () => {
        isCurrentlyDebouncing.current = false;
        setState(payload, path, { updateType: "update" });
      },
      formOpts?.debounceTime ??
        (typeof globalStateValue == "boolean" ? 20 : 200)
    );
  };

  const initialOptions = getInitialOptions(stateKey);
  if (!initialOptions?.validation?.key) {
    throw new Error("Validation key not found.");
  }
  const validationKey = initialOptions.validation.key;
  const validateOnBlur = initialOptions.validation.onBlur === true;

  const handleBlur = async () => {
    // --- Ensure latest value is flushed if debouncing ---
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current); // Clear pending timer
      debounceTimeoutRef.current = null;
      isCurrentlyDebouncing.current = false;
      // Ensure the absolute latest local value is committed on blur
      setState(localValue, path, { updateType: "update" });
    }
    // --- End modification ---

    if (!initialOptions.validation?.zodSchema || !validateOnBlur) return;
    removeValidationError(validationKey + "." + path.join("."));
    try {
      // Use the potentially just flushed value
      const fieldValue = getGlobalStore
        .getState()
        .getShadowValue(stateKeyPathKey);
      await validateZodPathFunc(
        validationKey,
        initialOptions.validation.zodSchema,
        path,
        fieldValue
      );
      // forceUpdate might be needed if validation state update doesn't trigger render
      // Consider using useGetValidationErrors hook result directly for validation display
    } catch (error) {
      console.error("Validation error on blur:", error);
    }
  };

  const rawSyncStatus = useGetSyncInfo(stateKey, path);
  const syncStatus = rawSyncStatus
    ? { ...rawSyncStatus, date: new Date(rawSyncStatus.timeStamp) }
    : null;

  const childElement = child({
    // --- START CHANGES ---
    get: () => localValue, // Get should return the immediate local value
    set: debouncedUpdater, // Use the new debounced updater
    // --- END CHANGES ---
    syncStatus,
    path: path,
    validationErrors: () =>
      getValidationErrors(validationKey + "." + path.join(".")),
    addValidationError: (message?: string) => {
      removeValidationError(validationKey + "." + path.join("."));
      addValidationError(validationKey + "." + path.join("."), message ?? "");
    },
    inputProps: {
      // --- START CHANGES ---
      value: localValue ?? "", // Input value is always the local state
      onChange: (e: any) => debouncedUpdater(e.target.value), // Use debounced updater
      // --- END CHANGES ---
      onBlur: handleBlur,
      ref: formRef,
    },
  });

  return (
    <>
      <ValidationWrapper {...{ formOpts, path, stateKey }}>
        {childElement}
      </ValidationWrapper>
    </>
  );
};
export type ValidationWrapperProps = {
  formOpts?: FormOptsType;
  path: string[];
  stateKey: string;
  children: React.ReactNode;
  validIndices?: number[];
};
export function ValidationWrapper({
  formOpts,
  path,

  stateKey,
  children,
  validIndices,
}: ValidationWrapperProps) {
  const { getInitialOptions } = getGlobalStore.getState();
  const thisStateOpts = getInitialOptions(stateKey!);
  const validationKey = thisStateOpts?.validation?.key ?? stateKey!;
  const validationErrors = useGetValidationErrors(
    validationKey,
    path,
    validIndices
  );
  // console.log(
  //   "validationErrors ValidationWrapper",
  //   stateKey,
  //   validationKey,
  //   path,
  //   validationErrors
  // );
  const thesMessages: string[] = [];

  if (validationErrors) {
    const newMessage = validationErrors!.join(", ");
    if (!thesMessages.includes(newMessage)) {
      thesMessages.push(newMessage);
    }
  }

  return (
    <>
      {thisStateOpts?.formElements?.validation &&
      !formOpts?.validation?.disable ? (
        thisStateOpts.formElements!.validation!({
          children: (
            <React.Fragment key={path.toString()}>{children}</React.Fragment>
          ),
          active: validationErrors.length > 0 ? true : false,
          message: formOpts?.validation?.hideMessage
            ? ""
            : formOpts?.validation?.message
              ? formOpts?.validation?.message
              : thesMessages.map((m) => m).join(", "),
          path: path,
        })
      ) : (
        <React.Fragment key={path.toString()}>{children}</React.Fragment>
      )}
    </>
  );
}
