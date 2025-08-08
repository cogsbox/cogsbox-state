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
import { formRefStore, getGlobalStore, ValidationError } from './store';
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
    subscribeToPath(fullKey, (e) => {
      forceUpdate({});
    });
  }, []);
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
  const [componentId] = useState(() => uuidv4());
  const [, forceUpdate] = useState({});

  const stateKeyPathKey = [stateKey, ...path].join('.');
  useRegisterComponent(stateKey, componentId, forceUpdate);
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

  const debouncedUpdate = useCallback(
    (newValue: any) => {
      const currentType = typeof globalStateValue;
      if (currentType === 'number' && typeof newValue === 'string') {
        newValue = newValue === '' ? 0 : Number(newValue);
      }
      setLocalValue(newValue);
      isCurrentlyDebouncing.current = true;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      const debounceTime = formOpts?.debounceTime ?? 200;

      debounceTimeoutRef.current = setTimeout(() => {
        isCurrentlyDebouncing.current = false;
        setState(newValue, path, { updateType: 'update' });

        // NEW: Check if validation is enabled via features
        const rootMeta = getGlobalStore
          .getState()
          .getShadowMetadata(stateKey, []);
        if (!rootMeta?.features?.validationEnabled) return;

        const validationOptions = getInitialOptions(stateKey)?.validation;
        const zodSchema =
          validationOptions?.zodSchemaV4 || validationOptions?.zodSchemaV3;

        if (zodSchema) {
          const fullState = getShadowValue(stateKey, []);
          const result = zodSchema.safeParse(fullState);
          const currentMeta = getShadowMetadata(stateKey, path) || {};

          if (!result.success) {
            const errors =
              'issues' in result.error
                ? result.error.issues
                : (result.error as any).errors;

            const pathErrors = errors.filter(
              (error: any) =>
                JSON.stringify(error.path) === JSON.stringify(path)
            );

            if (pathErrors.length > 0) {
              setShadowMetadata(stateKey, path, {
                ...currentMeta,
                validation: {
                  status: 'INVALID',
                  errors: [
                    {
                      source: 'client',
                      message: pathErrors[0]?.message,
                      severity: 'warning', // Gentle error during typing
                    },
                  ],
                  lastValidated: Date.now(),
                  validatedValue: newValue,
                },
              });
            } else {
              setShadowMetadata(stateKey, path, {
                ...currentMeta,
                validation: {
                  status: 'VALID',
                  errors: [],
                  lastValidated: Date.now(),
                  validatedValue: newValue,
                },
              });
            }
          } else {
            setShadowMetadata(stateKey, path, {
              ...currentMeta,
              validation: {
                status: 'VALID',
                errors: [],
                lastValidated: Date.now(),
                validatedValue: newValue,
              },
            });
          }
        }
      }, debounceTime);
      forceUpdate({});
    },
    [setState, path, formOpts?.debounceTime, stateKey]
  );

  const handleBlur = useCallback(async () => {
    console.log('handleBlur triggered');

    // Commit any pending changes
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
      isCurrentlyDebouncing.current = false;
      setState(localValue, path, { updateType: 'update' });
    }
    const rootMeta = getShadowMetadata(stateKey, []);
    if (!rootMeta?.features?.validationEnabled) return;
    const { getInitialOptions } = getGlobalStore.getState();
    const validationOptions = getInitialOptions(stateKey)?.validation;
    const zodSchema =
      validationOptions?.zodSchemaV4 || validationOptions?.zodSchemaV3;

    if (!zodSchema) return;

    // Get the full path including stateKey

    // Update validation state to "validating"
    const currentMeta = getShadowMetadata(stateKey, path);

    setShadowMetadata(stateKey, path, {
      ...currentMeta,
      validation: {
        status: 'VALIDATING',
        errors: [],
        lastValidated: Date.now(),
        validatedValue: localValue,
      },
    });

    // Validate full state
    const fullState = getShadowValue(stateKey, []);
    const result = zodSchema.safeParse(fullState);

    if (!result.success) {
      const errors =
        'issues' in result.error
          ? result.error.issues
          : (result.error as any).errors;

      // Find errors for this specific path
      const pathErrors = errors.filter((error: any) => {
        // For array paths, we need to translate indices to ULIDs
        if (path.some((p) => p.startsWith('id:'))) {
          // This is an array item path like ["id:xyz", "name"]
          const parentPath = path[0]!.startsWith('id:')
            ? []
            : path.slice(0, -1);

          const arrayMeta = getGlobalStore
            .getState()
            .getShadowMetadata(stateKey, parentPath);

          if (arrayMeta?.arrayKeys) {
            const itemKey = [stateKey, ...path.slice(0, -1)].join('.');
            const itemIndex = arrayMeta.arrayKeys.indexOf(itemKey);

            // Compare with Zod path
            const zodPath = [...parentPath, itemIndex, ...path.slice(-1)];
            const match =
              JSON.stringify(error.path) === JSON.stringify(zodPath);

            return match;
          }
        }

        const directMatch = JSON.stringify(error.path) === JSON.stringify(path);

        return directMatch;
      });

      // Update shadow metadata with validation result
      setShadowMetadata(stateKey, path, {
        ...currentMeta,
        validation: {
          status: 'INVALID',
          errors: pathErrors.map((err: any) => ({
            source: 'client' as const,
            message: err.message,
            severity: 'error' as const, // Hard error on blur
          })),
          lastValidated: Date.now(),
          validatedValue: localValue,
        },
      });
    } else {
      // Validation passed
      setShadowMetadata(stateKey, path, {
        ...currentMeta,
        validation: {
          status: 'VALID',
          errors: [],
          lastValidated: Date.now(),
          validatedValue: localValue,
        },
      });
    }
    forceUpdate({});
  }, [stateKey, path, localValue, setState]);

  const baseState = rebuildStateShape({
    path: path,
    componentId: componentId,
  });

  const stateWithInputProps = new Proxy(baseState, {
    get(target, prop) {
      if (prop === 'inputProps') {
        return {
          value: localValue ?? '',
          onChange: (e: any) => {
            debouncedUpdate(e.target.value);
          },
          // 5. Wire the new onBlur handler to the input props.
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
