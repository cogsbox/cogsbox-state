import {
  FormElementParams,
  StateObject,
  UpdateTypeDetail,
  type FormOptsType,
} from './CogsState';
import { pluginStore } from './pluginStore';
import { createMetadataContext, toDeconstructedMethods } from './plugins';
import React, {
  memo,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { getGlobalStore, ValidationError, ValidationSeverity } from './store';
import { useInView } from 'react-intersection-observer';
import { v4 as uuidv4 } from 'uuid';
import { isDeepEqual } from './utility';
import { runValidation } from './validation';

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
const { stateHandlers, notifyFormUpdate } = pluginStore.getState();

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
  const formElementRef = useRef<any>(null);
  const stateKeyPathKey = [stateKey, ...path].join('.');
  useRegisterComponent(stateKey, componentId, forceUpdate);
  // Get the shadow node to access typeInfo and schema
  const shadowNode = getGlobalStore.getState().getShadowNode(stateKey, path);
  const typeInfo = shadowNode?._meta?.typeInfo;
  const fieldSchema = typeInfo?.schema;

  const globalStateValue = getShadowValue(stateKey, path);
  const [localValue, setLocalValue] = useState<any>(globalStateValue);
  const isCurrentlyDebouncing = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Memoize the list of active form wrappers to avoid re-calculating on every render.
  const activeFormWrappers = useMemo(() => {
    return (
      pluginStore
        .getState()
        .getPluginConfigsForState(stateKey)
        // We only care about plugins that have defined a formWrapper
        .filter((config) => typeof config.plugin.formWrapper === 'function')
    );
  }, [stateKey]);

  useEffect(() => {
    if (
      !isCurrentlyDebouncing.current &&
      !isDeepEqual(globalStateValue, localValue)
    ) {
      setLocalValue(globalStateValue);
    }
  }, [globalStateValue]);

  useEffect(() => {
    const { setShadowMetadata } = getGlobalStore.getState();
    setShadowMetadata(stateKey, path, { formRef: formElementRef });

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
      const currentMeta = getGlobalStore
        .getState()
        .getShadowMetadata(stateKey, path);
      if (currentMeta && currentMeta.formRef) {
        setShadowMetadata(stateKey, path, { formRef: undefined });
      }
    };
  }, []);

  const debouncedUpdate = useCallback(
    (newValue: any) => {
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
      notifyFormUpdate({
        stateKey,
        type: 'input',
        path,
        value: newValue,
      });
      // Validate immediately on change (will only run if configured or clearing errors)
      const virtualOperation: UpdateTypeDetail = {
        stateKey,
        path,
        newValue: newValue,
        updateType: 'update',

        timeStamp: Date.now(),
        status: 'new',
        oldValue: globalStateValue,
      };

      // Call the one function with the 'onChange' trigger
      runValidation(virtualOperation, 'onChange');
      isCurrentlyDebouncing.current = true;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      const debounceTime = formOpts?.debounceTime ?? 200;

      // Debounce only the state update, not the validation
      debounceTimeoutRef.current = setTimeout(() => {
        isCurrentlyDebouncing.current = false;
        setState(newValue, path, {
          updateType: 'update',
          validationTrigger: 'onChange',
        });
      }, debounceTime);
    },
    [setState, path, formOpts?.debounceTime, typeInfo, globalStateValue]
  );
  const virtualFocusPath = `${stateKey}.__focusedElement`;
  const newFocusedElement = { path, ref: formElementRef };
  const handleFocus = useCallback(() => {
    const rootMeta =
      getGlobalStore.getState().getShadowMetadata(stateKey, []) || {};
    setShadowMetadata(stateKey, [], {
      ...rootMeta,
      focusedElement: { path, ref: formElementRef },
    });
    notifyPathSubscribers(virtualFocusPath, newFocusedElement);
    notifyFormUpdate({
      stateKey,
      type: 'focus',
      path,
      value: localValue,
    });
  }, [stateKey, path, formElementRef]);

  const handleBlur = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
      isCurrentlyDebouncing.current = false;
      setState(localValue, path, {
        updateType: 'update',
        validationTrigger: 'onBlur',
      });
    }

    queueMicrotask(() => {
      const rootMeta =
        getGlobalStore.getState().getShadowMetadata(stateKey, []) || {};
      if (
        rootMeta.focusedElement &&
        JSON.stringify(rootMeta.focusedElement.path) === JSON.stringify(path)
      ) {
        setShadowMetadata(stateKey, [], {
          focusedElement: null,
        });
        notifyPathSubscribers(virtualFocusPath, null);
        notifyFormUpdate({
          stateKey,
          type: 'blur',
          path,
          value: localValue,
        });
      }
    });

    const validationOptions = getInitialOptions(stateKey)?.validation;
    if (validationOptions?.onBlur) {
      // Create the complete operation object. It has all the f--king details.
      const virtualOperation: UpdateTypeDetail = {
        stateKey,
        path,
        newValue: localValue, // Use the current value from the input's state
        updateType: 'update',

        timeStamp: Date.now(),
        status: 'new',
        oldValue: globalStateValue,
      };

      // Call the one function with the 'onBlur' trigger
      runValidation(virtualOperation, 'onBlur');
    }
  }, [localValue, setState, path, stateKey]);

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
          onFocus: handleFocus,
          onBlur: handleBlur,
          ref: formElementRef,
        };
      }

      return target[prop];
    },
  });

  const initialElement = renderFn(stateWithInputProps);

  const wrappedElement = activeFormWrappers.reduceRight(
    (currentElement, config, index) => (
      <PluginWrapper
        stateKey={stateKey}
        path={path}
        pluginName={config.plugin.name}
        wrapperDepth={activeFormWrappers.length - 1 - index}
      >
        {currentElement}
      </PluginWrapper>
    ),
    initialElement
  );

  return (
    <ValidationWrapper formOpts={formOpts} path={path} stateKey={stateKey}>
      {wrappedElement}
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

// 1. Define the MINIMAL props needed.
type PluginWrapperProps = {
  children: React.ReactNode;
  stateKey: string;
  path: string[];
  pluginName: string;
  wrapperDepth: number;
};

const PluginWrapper = memo(function PluginWrapper({
  children,
  stateKey,
  path,
  pluginName,
  wrapperDepth,
}: PluginWrapperProps) {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const fullPathKey = [stateKey, ...path].join('.');
    const unsubscribe = getGlobalStore
      .getState()
      .subscribeToPath(fullPathKey, () => {
        forceUpdate({});
      });
    return unsubscribe;
  }, [stateKey, path]);

  const plugin = pluginStore
    .getState()
    .registeredPlugins.find((p) => p.name === pluginName);

  const stateHandler: StateObject<any> | undefined = pluginStore
    .getState()
    .stateHandlers.get(stateKey);

  const typeInfo = getGlobalStore.getState().getShadowNode(stateKey, path)
    ?._meta?.typeInfo;

  const options = pluginStore
    .getState()
    .pluginOptions.get(stateKey)
    ?.get(pluginName);

  const hookData = pluginStore.getState().getHookResult(stateKey, pluginName);

  if (!plugin?.formWrapper || !stateHandler) {
    return <>{children}</>;
  }

  const metadataContext = createMetadataContext(stateKey, plugin.name);
  const deconstructed = toDeconstructedMethods(stateHandler);

  return plugin.formWrapper({
    element: children,
    path,
    stateKey,
    pluginName: plugin.name,
    ...deconstructed,
    ...metadataContext,
    options,
    hookData,
    fieldType: typeInfo?.type,
    wrapperDepth,
  });
});
