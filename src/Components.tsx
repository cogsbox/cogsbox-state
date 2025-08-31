import { FormElementParams, type FormOptsType } from './CogsState';
import React, {
  memo,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  formRefStore,
  getGlobalStore,
  shadowStateStore,
  ValidationError,
  ValidationSeverity,
} from './store';
import { useInView } from 'react-intersection-observer';
import { v4 as uuidv4 } from 'uuid';
import { isDeepEqual } from './utility';
const {
  getInitialOptions,

  getShadowMetadata,
  setShadowMetadata,
  getShadowValue,

  registerComponent,
  unregisterComponent,

  notifyPathSubscribers,
  subscribeToPath,
} = getGlobalStore.getState();
export type ValidationWrapperProps = {
  formOpts?: FormOptsType;
  path: string[];
  stateKey: string;
  children: React.ReactNode;
};

export function ValidationWrapper({
  formOpts,
  path,
  stateKey,
  children,
}: ValidationWrapperProps) {
  const { getInitialOptions, getShadowMetadata, getShadowValue } =
    getGlobalStore.getState();
  const thisStateOpts = getInitialOptions(stateKey!);

  const shadowMeta = getShadowMetadata(stateKey!, path);
  const validationState = shadowMeta?.validation;

  const status = validationState?.status || 'NOT_VALIDATED';

  const errors = (validationState?.errors || []).map((err) => ({
    ...err,
    path: path,
  })) as ValidationError[];
  const errorMessages = errors
    .filter((err) => err.severity === 'error')
    .map((err) => err.message);
  const warningMessages = errors
    .filter((err) => err.severity === 'warning')
    .map((err) => err.message);

  // Use first error, or first warning if no errors
  const message = errorMessages[0] || warningMessages[0];
  const primarySeverity: ValidationSeverity =
    errorMessages.length > 0
      ? 'error'
      : warningMessages.length > 0
        ? 'warning'
        : undefined;
  return (
    <>
      {thisStateOpts?.formElements?.validation &&
      !formOpts?.validation?.disable ? (
        thisStateOpts.formElements!.validation!({
          children: (
            <React.Fragment key={path.toString()}>{children}</React.Fragment>
          ),
          status, // Now passes the new ValidationStatus type
          message: formOpts?.validation?.hideMessage
            ? ''
            : formOpts?.validation?.message || message || '',
          severity: primarySeverity,
          hasErrors: errorMessages.length > 0,
          hasWarnings: warningMessages.length > 0,
          allErrors: errors,
          path: path,
          getData: () => getShadowValue(stateKey!, path),
        })
      ) : (
        <React.Fragment key={path.toString()}>{children}</React.Fragment>
      )}
    </>
  );
}
export const MemoizedCogsItemWrapper = memo(
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
export function ListItemWrapper({
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
    const unsubscribe = subscribeToPath(fullKey, (e) => {
      forceUpdate({});
    });
    return () => unsubscribe();
  }, [fullKey]);
  useEffect(() => {
    if (!inView || !imagesLoaded || hasReportedInitialHeight.current) {
      return;
    }

    const element = elementRef.current;
    if (element && element.offsetHeight > 0) {
      hasReportedInitialHeight.current = true;
      const newHeight = element.offsetHeight;

      setShadowMetadata(stateKey, itemPath, {
        virtualizer: {
          itemHeight: newHeight,
          domRef: element,
        },
      });

      const arrayPath = itemPath.slice(0, -1);
      const arrayPathKey = [stateKey, ...arrayPath].join('.');
      notifyPathSubscribers(arrayPathKey, {
        type: 'ITEMHEIGHT',
        itemKey: itemPath.join('.'),

        ref: elementRef.current,
      });
    }
  }, [inView, imagesLoaded, stateKey, itemPath]);

  const itemValue = getShadowValue(stateKey, itemPath);

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

export function FormElementWrapper({
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
    path: string[];
    componentId: string;
    meta?: any;
  }) => any;
  renderFn: (params: FormElementParams<any>) => React.ReactNode;
  formOpts?: FormOptsType;
  setState: any;
}) {
  const componentId = useRef(uuidv4()).current;
  const [, forceUpdate] = useState({});

  const stateKeyPathKey = [stateKey, ...path].join('.');
  useRegisterComponent(stateKey, componentId, forceUpdate);

  // Get the shadow node to access typeInfo and schema
  const shadowNode = getGlobalStore.getState().getShadowNode(stateKey, path);
  const typeInfo = shadowNode?._meta?.typeInfo;
  const fieldSchema = typeInfo?.schema; // The actual Zod schema for this field

  const globalStateValue = getShadowValue(stateKey, path);
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

  // Separate validation function that uses the field's schema
  const validateField = useCallback(
    (value: any, trigger: 'onChange' | 'onBlur') => {
      const rootMeta = getGlobalStore
        .getState()
        .getShadowMetadata(stateKey, []);
      if (!rootMeta?.features?.validationEnabled) return;

      const validationOptions = getInitialOptions(stateKey)?.validation;

      if (!validationOptions) return;

      const currentMeta = getShadowMetadata(stateKey, path) || {};
      const currentStatus = currentMeta?.validation?.status;

      let shouldValidate = false;
      let severity: 'error' | 'warning' | undefined;
      console.log('trigger', trigger, validationOptions);
      if (trigger === 'onBlur' && validationOptions.onBlur) {
        shouldValidate = true;
        severity = validationOptions.onBlur ?? 'error';
      } else if (trigger === 'onChange') {
        if (validationOptions.onChange) {
          shouldValidate = true;
          severity = validationOptions.onChange;
        } else if (currentStatus === 'INVALID') {
          shouldValidate = true;
          severity = 'warning';
        }
      }

      if (!shouldValidate) return;

      let validationResult: { success: boolean; message?: string } | null =
        null;
      console.log(
        'shouldValidate 33',
        path,
        fieldSchema,
        shouldValidate,
        value,
        typeof value
      );
      if (fieldSchema && shouldValidate) {
        // Direct field validation using its own schema
        const result = fieldSchema.safeParse(value);

        if (!result.success) {
          const errors =
            'issues' in result.error
              ? result.error.issues
              : (result.error as any).errors;

          validationResult = {
            success: false,
            message: errors[0]?.message || 'Invalid value',
          };
        } else {
          validationResult = { success: true };
        }
      } else {
        // Fallback: validate using the entire schema
        const zodSchema =
          validationOptions.zodSchemaV4 || validationOptions.zodSchemaV3;
        if (!zodSchema) return;

        // Create a test state with the new value at the correct path
        const fullState = getShadowValue(stateKey, []);
        const testState = JSON.parse(JSON.stringify(fullState)); // Deep clone

        // Set the value at the correct path
        let current = testState;
        for (let i = 0; i < path.length - 1; i++) {
          if (!current[path[i]!]) current[path[i]!] = {};
          current = current[path[i]!];
        }
        if (path.length > 0) {
          current[path[path.length - 1]!] = value;
        } else {
          // Root level update
          Object.assign(testState, value);
        }

        const result = zodSchema.safeParse(testState);

        if (!result.success) {
          const errors =
            'issues' in result.error
              ? result.error.issues
              : (result.error as any).errors;

          // Find errors for this specific path
          const pathErrors = errors.filter((error: any) => {
            // Handle array paths with id: prefixes
            if (path.some((p) => p.startsWith('id:'))) {
              const parentPath = path[0]!.startsWith('id:')
                ? []
                : path.slice(0, -1);
              const arrayMeta = getGlobalStore
                .getState()
                .getShadowMetadata(stateKey, parentPath);

              if (arrayMeta?.arrayKeys) {
                const itemKey = path.slice(0, -1).join('.');
                const itemIndex = arrayMeta.arrayKeys.findIndex(
                  (k) => k === path[path.length - 2]
                );
                const zodPath = [...parentPath, itemIndex, ...path.slice(-1)];
                return JSON.stringify(error.path) === JSON.stringify(zodPath);
              }
            }

            return JSON.stringify(error.path) === JSON.stringify(path);
          });

          if (pathErrors.length > 0) {
            validationResult = {
              success: false,
              message: pathErrors[0]?.message,
            };
          } else {
            validationResult = { success: true };
          }
        } else {
          validationResult = { success: true };
        }
      }

      // Update validation state based on result
      if (validationResult) {
        if (!validationResult.success) {
          setShadowMetadata(stateKey, path, {
            ...currentMeta,
            validation: {
              status: 'INVALID',
              errors: [
                {
                  source: 'client' as const,
                  message: validationResult.message!,
                  severity: severity!,
                },
              ],
              lastValidated: Date.now(),
              validatedValue: value,
            },
          });
        } else {
          setShadowMetadata(stateKey, path, {
            ...currentMeta,
            validation: {
              status: 'VALID',
              errors: [],
              lastValidated: Date.now(),
              validatedValue: value,
            },
          });
        }
      }
      forceUpdate({});
    },
    [stateKey, path, fieldSchema]
  );

  const debouncedUpdate = useCallback(
    (newValue: any) => {
      // Use typeInfo to properly convert the value
      const root = getGlobalStore.getState().getShadowMetadata(stateKey, []);
      const fullShadow = shadowStateStore.get(stateKey);
      console.log('update root', root, fullShadow);
      if (typeInfo) {
        if (typeInfo.type === 'number' && typeof newValue === 'string') {
          newValue =
            newValue === ''
              ? typeInfo.nullable
                ? null
                : (typeInfo.default ?? 0)
              : Number(newValue);
        } else if (
          typeInfo.type === 'boolean' &&
          typeof newValue === 'string'
        ) {
          newValue = newValue === 'true' || newValue === '1';
        } else if (typeInfo.type === 'date' && typeof newValue === 'string') {
          newValue = new Date(newValue);
        }
      } else {
        // Fallback to old behavior if no typeInfo

        const currentType = typeof globalStateValue;

        if (currentType === 'number' && typeof newValue === 'string') {
          newValue = newValue === '' ? 0 : Number(newValue);
        }
      }

      setLocalValue(newValue);

      // Validate immediately on change (will only run if configured or clearing errors)
      validateField(newValue, 'onChange');

      isCurrentlyDebouncing.current = true;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      const debounceTime = formOpts?.debounceTime ?? 200;

      // Debounce only the state update, not the validation
      debounceTimeoutRef.current = setTimeout(() => {
        isCurrentlyDebouncing.current = false;
        setState(newValue, path, { updateType: 'update' });
      }, debounceTime);
    },
    [
      setState,
      path,
      formOpts?.debounceTime,
      validateField,
      typeInfo,
      globalStateValue,
    ]
  );

  const handleBlur = useCallback(() => {
    // Commit any pending changes immediately
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
      isCurrentlyDebouncing.current = false;
      setState(localValue, path, { updateType: 'update' });
    }

    // Validate on blur
    validateField(localValue, 'onBlur');
  }, [localValue, setState, path, validateField]);

  const baseState = rebuildStateShape({
    path: path,
    componentId: componentId,
    meta: undefined,
  });

  const stateWithInputProps = new Proxy(baseState, {
    get(target, prop) {
      if (prop === '$inputProps') {
        return {
          value: localValue ?? '',
          onChange: (e: any) => {
            debouncedUpdate(e.target.value);
          },
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
export function useRegisterComponent(
  stateKey: string,
  componentId: string,
  forceUpdate: (o: object) => void
) {
  const fullComponentId = `${stateKey}////${componentId}`;

  useLayoutEffect(() => {
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
// Components.tsx

// Generic isolated component wrapper
export function IsolatedComponentWrapper({
  stateKey,
  path,
  rebuildStateShape,
  renderFn,
}: {
  stateKey: string;
  path: string[];
  rebuildStateShape: (options: {
    path: string[];
    componentId: string;
    meta?: any;
  }) => any;
  renderFn: (state: any) => React.ReactNode;
}) {
  const [componentId] = useState(() => uuidv4());
  const [, forceUpdate] = useState({});

  const stateKeyPathKey = [stateKey, ...path].join('.');
  useRegisterComponent(stateKey, componentId, forceUpdate);

  useEffect(() => {
    const unsubscribe = getGlobalStore
      .getState()
      .subscribeToPath(stateKeyPathKey, () => {
        forceUpdate({});
      });
    return () => unsubscribe();
  }, [stateKeyPathKey]);

  const baseState = rebuildStateShape({
    path: path,
    componentId: componentId,
    meta: undefined,
  });

  return <>{renderFn(baseState)}</>;
}
