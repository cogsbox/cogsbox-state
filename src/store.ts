import { create } from 'zustand';
import { ulid } from 'ulid';
import type {
  OptionsType,
  ReactivityType,
  SyncInfo,
  UpdateTypeDetail,
} from './CogsState.js';

import { type ReactNode } from 'react';

export type FreshValuesObject = {
  pathsToValues?: string[];
  prevValue?: any;
  newValue?: any;
  timeStamp: number;
};

type StateValue = any;

export type TrieNode = {
  subscribers: Set<string>;
  children: Map<string, TrieNode>;
};

export type FormRefStoreState = {
  formRefs: Map<string, React.RefObject<any>>;
  registerFormRef: (id: string, ref: React.RefObject<any>) => void;
  getFormRef: (id: string) => React.RefObject<any> | undefined;
  removeFormRef: (id: string) => void;
  getFormRefsByStateKey: (
    stateKey: string
  ) => Map<string, React.RefObject<any>>;
};

export const formRefStore = create<FormRefStoreState>((set, get) => ({
  formRefs: new Map(),

  registerFormRef: (id, ref) =>
    set((state) => {
      const newRefs = new Map(state.formRefs);
      newRefs.set(id, ref);
      return { formRefs: newRefs };
    }),

  getFormRef: (id) => get().formRefs.get(id),

  removeFormRef: (id) =>
    set((state) => {
      const newRefs = new Map(state.formRefs);
      newRefs.delete(id);
      return { formRefs: newRefs };
    }),

  getFormRefsByStateKey: (stateKey) => {
    const allRefs = get().formRefs;
    const stateKeyPrefix = stateKey + '.';
    const filteredRefs = new Map();

    allRefs.forEach((ref, id) => {
      if (id.startsWith(stateKeyPrefix) || id === stateKey) {
        filteredRefs.set(id, ref);
      }
    });

    return filteredRefs;
  },
}));
export type ComponentsType = {
  components?: Map<
    string,
    {
      forceUpdate: () => void;
      paths: Set<string>;
      deps?: any[];
      prevDeps?: any[];
      depsFunction?: (state: any) => any[] | true;
      reactiveType: ReactivityType[] | ReactivityType;
    }
  >;
};

export type ValidationStatus =
  | 'NOT_VALIDATED'
  | 'VALIDATING'
  | 'VALID'
  | 'INVALID';

export type ValidationError = {
  source: 'client' | 'sync_engine' | 'api';
  message: string;
  severity: 'warning' | 'error';
  code?: string;
};

export type ValidationState = {
  status: ValidationStatus;
  errors: ValidationError[];
  lastValidated?: number;
  validatedValue?: any;
};

export type ShadowMetadata = {
  id?: string;
  stateSource?: 'default' | 'server' | 'localStorage';
  lastServerSync?: number;
  isDirty?: boolean;
  baseServerState?: any;
  arrayKeys?: string[];
  fields?: Record<string, any>;
  virtualizer?: {
    itemHeight?: number;
    domRef?: HTMLElement | null;
  };
  syncInfo?: { status: string };
  validation?: ValidationState;
  features?: {
    syncEnabled: boolean;
    validationEnabled: boolean;
    localStorageEnabled: boolean;
  };
  lastUpdated?: number;
  signals?: Array<{
    instanceId: string;
    parentId: string;
    position: number;
    effect?: string;
  }>;
  mapWrappers?: Array<{
    instanceId: string;
    path: string[];
    componentId: string;
    meta?: any;
    mapFn: (setter: any, index: number, arraySetter: any) => ReactNode;
    containerRef: HTMLDivElement | null;
    rebuildStateShape: any;
  }>;
  transformCaches?: Map<
    string,
    {
      validIds: string[];
      computedAt: number;
      transforms: Array<{ type: 'filter' | 'sort'; fn: Function }>;
    }
  >;
  pathComponents?: Set<string>;
  streams?: Map<
    string,
    {
      buffer: any[];
      flushTimer: NodeJS.Timeout | null;
    }
  >;
} & ComponentsType;

type ShadowNode = {
  value?: any;
  _meta?: ShadowMetadata;
  [key: string]: any;
};

export type CogsGlobalState = {
  // NEW shadow store
  shadowStateStore: Map<string, ShadowNode>;
  setTransformCache: (
    key: string,
    path: string[],
    cacheKey: string,
    cacheData: any
  ) => void;
  initializeShadowState: (key: string, initialState: any) => void;
  getShadowNode: (key: string, path: string[]) => ShadowNode | undefined;
  getShadowMetadata: (
    key: string,
    path: string[]
  ) => ShadowMetadata | undefined;

  setShadowMetadata: (key: string, path: string[], metadata: any) => void;
  getShadowValue: (
    key: string,
    path: string[],
    validArrayIds?: string[],
    log?: boolean
  ) => any;
  updateShadowAtPath: (key: string, path: string[], newValue: any) => void;
  insertManyShadowArrayElements: (
    key: string,
    arrayPath: string[],
    newItems: any[],
    index?: number
  ) => void;
  addItemsToArrayNode: (
    key: string,
    arrayPath: string[],
    newItems: any,
    newKeys: string[]
  ) => void;
  insertShadowArrayElement: (
    key: string,
    arrayPath: string[],
    newItem: any,
    index?: number
  ) => void;
  removeShadowArrayElement: (key: string, itemPath: string[]) => void;
  registerComponent: (
    stateKey: string,
    componentId: string,
    registration: any
  ) => void;
  unregisterComponent: (stateKey: string, componentId: string) => void;
  addPathComponent: (
    stateKey: string,
    dependencyPath: string[],
    fullComponentId: string
  ) => void;
  markAsDirty: (
    key: string,
    path: string[],
    options: { bubble: boolean }
  ) => void;

  pathSubscribers: Map<string, Set<(newValue: any) => void>>;
  subscribeToPath: (
    path: string,
    callback: (newValue: any) => void
  ) => () => void;
  notifyPathSubscribers: (updatedPath: string, newValue: any) => void;

  selectedIndicesMap: Map<string, string>; // stateKey -> (parentPath -> selectedIndex)
  getSelectedIndex: (stateKey: string, validArrayIds?: string[]) => number;
  setSelectedIndex: (key: string, itemKey: string) => void;
  clearSelectedIndex: ({ arrayKey }: { arrayKey: string }) => void;
  clearSelectedIndexesForState: (stateKey: string) => void;

  initialStateOptions: { [key: string]: OptionsType };
  initialStateGlobal: { [key: string]: StateValue };
  updateInitialStateGlobal: (key: string, newState: StateValue) => void;

  getInitialOptions: (key: string) => OptionsType | undefined;
  setInitialStateOptions: (key: string, value: OptionsType) => void;

  serverStateUpdates: Map<
    string,
    {
      data: any;
      status: 'loading' | 'success' | 'error';
      timestamp: number;
    }
  >;

  setServerStateUpdate: (key: string, serverState: any) => void;

  stateLog: Map<string, Map<string, UpdateTypeDetail>>;
  syncInfoStore: Map<string, SyncInfo>;
  addStateLog: (updates: UpdateTypeDetail[]) => void;

  setSyncInfo: (key: string, syncInfo: SyncInfo) => void;
  getSyncInfo: (key: string) => SyncInfo | null;
};

export function buildShadowNode(value: any): ShadowNode {
  if (value === null || typeof value !== 'object') {
    return { value };
  }

  if (Array.isArray(value)) {
    const arrayNode: ShadowNode = { _meta: { arrayKeys: [] } };
    const idKeys: string[] = [];

    value.forEach((item) => {
      const itemId = `id:${ulid()}`;
      arrayNode[itemId] = buildShadowNode(item);
      idKeys.push(itemId);
    });

    arrayNode._meta!.arrayKeys = idKeys;
    return arrayNode;
  }

  if (value.constructor === Object) {
    const objectNode: ShadowNode = { _meta: {} };
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        objectNode[key] = buildShadowNode(value[key]);
      }
    }
    return objectNode;
  }

  return { value };
}

export const getGlobalStore = create<CogsGlobalState>((set, get) => ({
  shadowStateStore: new Map<string, ShadowNode>(),

  setTransformCache: (
    key: string,
    path: string[],
    cacheKey: string,
    cacheData: any
  ) => {
    const metadata = get().getShadowMetadata(key, path) || {};
    if (!metadata.transformCaches) {
      metadata.transformCaches = new Map();
    }
    metadata.transformCaches.set(cacheKey, cacheData);
    get().setShadowMetadata(key, path, {
      transformCaches: metadata.transformCaches,
    });
  },

  initializeShadowState: (key: string, initialState: any) => {
    set((state) => {
      const newShadowStore = new Map(state.shadowStateStore);
      const existingRoot =
        newShadowStore.get(key) || newShadowStore.get(`[${key}`);
      let preservedMetadata: Partial<ShadowMetadata> = {};

      if (existingRoot?._meta) {
        const {
          components,
          features,
          lastServerSync,
          stateSource,
          baseServerState,
        } = existingRoot._meta;
        if (components) preservedMetadata.components = components;
        if (features) preservedMetadata.features = features;
        if (lastServerSync) preservedMetadata.lastServerSync = lastServerSync;
        if (stateSource) preservedMetadata.stateSource = stateSource;
        if (baseServerState)
          preservedMetadata.baseServerState = baseServerState;
      }

      newShadowStore.delete(key);
      newShadowStore.delete(`[${key}`);

      const newRoot = buildShadowNode(initialState);

      if (!newRoot._meta) newRoot._meta = {};
      Object.assign(newRoot._meta, preservedMetadata);

      const storageKey = Array.isArray(initialState) ? `[${key}` : key;
      newShadowStore.set(storageKey, newRoot);

      return { shadowStateStore: newShadowStore };
    });
  },

  getShadowNode: (key: string, path: string[]): ShadowNode | undefined => {
    const store = get().shadowStateStore;
    let current: any = store.get(key) || store.get(`[${key}`);

    if (!current) return undefined;
    if (path.length === 0) return current;

    for (const segment of path) {
      if (typeof current !== 'object' || current === null) return undefined;
      current = current[segment];
      if (current === undefined) return undefined;
    }
    return current;
  },

  getShadowMetadata: (
    key: string,
    path: string[]
  ): ShadowMetadata | undefined => {
    const node = get().getShadowNode(key, path);
    return node?._meta;
  },

  setShadowMetadata: (
    key: string,
    path: string[],
    newMetadata: Partial<ShadowMetadata>
  ) => {
    set((state) => {
      const newStore = new Map(state.shadowStateStore);
      const rootKey = newStore.has(`[${key}`) ? `[${key}` : key;
      let root = newStore.get(rootKey);

      if (!root) {
        root = {};
        newStore.set(rootKey, root);
      }

      const clonedRoot: any = { ...root };
      newStore.set(rootKey, clonedRoot);

      let current = clonedRoot;
      for (const segment of path) {
        const nextNode = current[segment] || {};
        current[segment] = { ...nextNode };
        current = current[segment];
      }

      current._meta = { ...(current._meta || {}), ...newMetadata };

      return { shadowStateStore: newStore };
    });
  },
  getShadowValue: (
    key: string,
    path: string[],
    validArrayIds?: string[],
    log?: boolean
  ) => {
    const node = get().getShadowNode(key, path);

    if (node === null || node === undefined) return undefined;

    const nodeKeys = Object.keys(node);

    const isPrimitiveWrapper =
      Object.prototype.hasOwnProperty.call(node, 'value') &&
      nodeKeys.every((k) => k === 'value' || k === '_meta');

    if (isPrimitiveWrapper) {
      return node.value;
    }

    // Array Check (This part is correct)
    const isArrayNode =
      node._meta &&
      Object.prototype.hasOwnProperty.call(node._meta, 'arrayKeys');
    if (isArrayNode) {
      const keysToIterate =
        validArrayIds !== undefined && validArrayIds.length > 0
          ? validArrayIds
          : node._meta!.arrayKeys!;

      return keysToIterate.map((itemKey: string) =>
        get().getShadowValue(key, [...path, itemKey])
      );
    }

    const result: any = {};
    for (const propKey of nodeKeys) {
      if (propKey !== '_meta' && !propKey.startsWith('id:')) {
        result[propKey] = get().getShadowValue(key, [...path, propKey]);
      }
    }
    return result;
  },
  updateShadowAtPath: (key, path, newValue) => {
    set((state) => {
      const newStore = new Map(state.shadowStateStore);
      const rootKey = newStore.has(`[${key}`) ? `[${key}` : key;
      let root = newStore.get(rootKey);
      if (!root) return state;
      const clonedRoot: any = { ...root };
      newStore.set(rootKey, clonedRoot);
      let parentNode = clonedRoot;
      for (let i = 0; i < path.length - 1; i++) {
        parentNode[path[i]!] = { ...(parentNode[path[i]!] || {}) };
        parentNode = parentNode[path[i]!];
      }
      const targetNode =
        path.length === 0 ? parentNode : parentNode[path[path.length - 1]!];

      if (!targetNode) {
        parentNode[path[path.length - 1]!] = buildShadowNode(newValue);
        return { shadowStateStore: newStore };
      }

      function intelligentMerge(nodeToUpdate: any, plainValue: any) {
        if (
          typeof plainValue !== 'object' ||
          plainValue === null ||
          Array.isArray(plainValue)
        ) {
          const oldMeta = nodeToUpdate._meta;
          const newNode = buildShadowNode(plainValue);
          if (oldMeta) {
            newNode._meta = { ...oldMeta, ...(newNode._meta || {}) };
          }
          Object.keys(nodeToUpdate).forEach((key) => delete nodeToUpdate[key]);
          Object.assign(nodeToUpdate, newNode);
          return;
        }

        const plainValueKeys = new Set(Object.keys(plainValue));

        for (const propKey of plainValueKeys) {
          const childValue = plainValue[propKey];
          if (nodeToUpdate[propKey]) {
            intelligentMerge(nodeToUpdate[propKey], childValue);
          } else {
            nodeToUpdate[propKey] = buildShadowNode(childValue);
          }
        }

        for (const nodeKey in nodeToUpdate) {
          if (
            nodeKey === '_meta' ||
            !Object.prototype.hasOwnProperty.call(nodeToUpdate, nodeKey)
          )
            continue;

          if (!plainValueKeys.has(nodeKey)) {
            delete nodeToUpdate[nodeKey];
          }
        }
      }

      intelligentMerge(targetNode, newValue);

      get().notifyPathSubscribers([key, ...path].join('.'), {
        type: 'UPDATE',
        newValue,
      });
      return { shadowStateStore: newStore };
    });
  },
  addItemsToArrayNode: (key, arrayPath, newItems, newKeys) => {
    set((state) => {
      const newStore = new Map(state.shadowStateStore);
      const rootKey = newStore.has(`[${key}`) ? `[${key}` : key;
      let root = newStore.get(rootKey);
      if (!root) {
        console.error('Root not found for state key:', key);
        return state;
      }

      const clonedRoot = { ...root };
      newStore.set(rootKey, clonedRoot);

      let current = clonedRoot;
      for (const segment of arrayPath) {
        const nextNode = current[segment] || {};
        current[segment] = { ...nextNode };
        current = current[segment];
      }

      Object.assign(current, newItems);
      current._meta = { ...(current._meta || {}), arrayKeys: newKeys };

      return { shadowStateStore: newStore };
    });
  },

  insertShadowArrayElement: (key, arrayPath, newItem, index) => {
    const arrayNode = get().getShadowNode(key, arrayPath);
    if (!arrayNode?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[key, ...arrayPath].join('.')}`
      );
      return;
    }

    const newItemId = `id:${ulid()}`;
    const itemsToAdd = { [newItemId]: buildShadowNode(newItem) };

    const currentKeys = arrayNode._meta.arrayKeys;
    const newKeys = [...currentKeys];
    const insertionPoint =
      index !== undefined && index >= 0 && index <= newKeys.length
        ? index
        : newKeys.length;
    newKeys.splice(insertionPoint, 0, newItemId);

    get().addItemsToArrayNode(key, arrayPath, itemsToAdd, newKeys);

    const arrayKey = [key, ...arrayPath].join('.');
    get().notifyPathSubscribers(arrayKey, {
      type: 'INSERT',
      path: arrayKey,
      itemKey: `${arrayKey}.${newItemId}`,
      index: insertionPoint,
    });
  },
  insertManyShadowArrayElements: (key, arrayPath, newItems, index) => {
    if (!newItems || newItems.length === 0) {
      return;
    }

    const arrayNode = get().getShadowNode(key, arrayPath);
    if (!arrayNode?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[key, ...arrayPath].join('.')}`
      );
      return;
    }

    const itemsToAdd: Record<string, any> = {};
    const newIds: string[] = [];

    newItems.forEach((item) => {
      const newItemId = `id:${ulid()}`;
      newIds.push(newItemId);
      itemsToAdd[newItemId] = buildShadowNode(item);
    });

    const currentKeys = arrayNode._meta.arrayKeys;
    const finalKeys = [...currentKeys];
    const insertionPoint =
      index !== undefined && index >= 0 && index <= finalKeys.length
        ? index
        : finalKeys.length;
    finalKeys.splice(insertionPoint, 0, ...newIds);

    get().addItemsToArrayNode(key, arrayPath, itemsToAdd, finalKeys);

    const arrayKey = [key, ...arrayPath].join('.');
    get().notifyPathSubscribers(arrayKey, {
      type: 'INSERT_MANY',
      path: arrayKey,
      count: newItems.length,
      index: insertionPoint,
    });
  },

  removeShadowArrayElement: (key, itemPath) => {
    if (itemPath.length === 0) return;

    const arrayPath = itemPath.slice(0, -1);
    const itemId = itemPath[itemPath.length - 1];
    if (!itemId?.startsWith('id:')) return;

    const arrayNode = get().getShadowNode(key, arrayPath);
    if (!arrayNode?._meta?.arrayKeys) return;

    const newKeys = arrayNode._meta.arrayKeys.filter((k) => k !== itemId);
    delete arrayNode[itemId];

    get().setShadowMetadata(key, arrayPath, { arrayKeys: newKeys });

    const arrayKey = [key, ...arrayPath].join('.');
    get().notifyPathSubscribers(arrayKey, {
      type: 'REMOVE',
      path: arrayKey,
      itemKey: `${arrayKey}.${itemId}`,
    });
  },

  addPathComponent: (stateKey, dependencyPath, fullComponentId) => {
    const metadata = get().getShadowMetadata(stateKey, dependencyPath) || {};
    const newPathComponents = new Set(metadata.pathComponents);
    newPathComponents.add(fullComponentId);
    get().setShadowMetadata(stateKey, dependencyPath, {
      pathComponents: newPathComponents,
    });

    const rootMeta = get().getShadowMetadata(stateKey, []);
    if (rootMeta?.components) {
      const component = rootMeta.components.get(fullComponentId);
      if (component) {
        const fullPathKey = [stateKey, ...dependencyPath].join('.');
        const newPaths = new Set(component.paths);
        newPaths.add(fullPathKey);
        const newComponentRegistration = { ...component, paths: newPaths };
        const newComponentsMap = new Map(rootMeta.components);
        newComponentsMap.set(fullComponentId, newComponentRegistration);
        get().setShadowMetadata(stateKey, [], { components: newComponentsMap });
      }
    }
  },

  registerComponent: (stateKey, fullComponentId, registration) => {
    const rootMeta = get().getShadowMetadata(stateKey, []) || {};
    const components = new Map(rootMeta.components);
    components.set(fullComponentId, registration);
    get().setShadowMetadata(stateKey, [], { components });
  },

  unregisterComponent: (stateKey, fullComponentId) => {
    const rootMeta = get().getShadowMetadata(stateKey, []);
    if (!rootMeta?.components) return;
    const components = new Map(rootMeta.components);
    if (components.delete(fullComponentId)) {
      get().setShadowMetadata(stateKey, [], { components });
    }
  },

  markAsDirty: (key, path, options = { bubble: true }) => {
    const setDirtyOnPath = (pathToMark: string[]) => {
      const node = get().getShadowNode(key, pathToMark);
      if (node?._meta?.isDirty) {
        return true;
      }
      get().setShadowMetadata(key, pathToMark, { isDirty: true });
      return false;
    };

    setDirtyOnPath(path);

    if (options.bubble) {
      let parentPath = [...path];
      while (parentPath.length > 0) {
        parentPath.pop();
        if (setDirtyOnPath(parentPath)) {
          break;
        }
      }
    }
  },

  serverStateUpdates: new Map(),
  setServerStateUpdate: (key, serverState) => {
    set((state) => ({
      serverStateUpdates: new Map(state.serverStateUpdates).set(
        key,
        serverState
      ),
    }));
    get().notifyPathSubscribers(key, {
      type: 'SERVER_STATE_UPDATE',
      serverState,
    });
  },

  pathSubscribers: new Map<string, Set<(newValue: any) => void>>(),
  subscribeToPath: (path, callback) => {
    const subscribers = get().pathSubscribers;
    const subsForPath = subscribers.get(path) || new Set();
    subsForPath.add(callback);
    subscribers.set(path, subsForPath);

    return () => {
      const currentSubs = get().pathSubscribers.get(path);
      if (currentSubs) {
        currentSubs.delete(callback);
        if (currentSubs.size === 0) {
          get().pathSubscribers.delete(path);
        }
      }
    };
  },
  notifyPathSubscribers: (updatedPath, newValue) => {
    const subscribers = get().pathSubscribers;
    const subs = subscribers.get(updatedPath);
    if (subs) {
      subs.forEach((callback) => callback(newValue));
    }
  },
  selectedIndicesMap: new Map<string, string>(),
  getSelectedIndex: (arrayKey, validIds) => {
    const itemKey = get().selectedIndicesMap.get(arrayKey);
    if (!itemKey) return -1;

    const arrayMeta = get().getShadowMetadata(
      arrayKey.split('.')[0]!,
      arrayKey.split('.').slice(1)
    );
    const arrayKeys = validIds || arrayMeta?.arrayKeys;

    return arrayKeys ? arrayKeys.indexOf(itemKey) : -1;
  },

  setSelectedIndex: (arrayKey: string, itemKey: string | undefined) => {
    set((state) => {
      const newMap = new Map(state.selectedIndicesMap); // CREATE A NEW MAP!

      if (itemKey === undefined) {
        newMap.delete(arrayKey);
      } else {
        if (newMap.has(arrayKey)) {
          get().notifyPathSubscribers(newMap.get(arrayKey)!, {
            type: 'THIS_UNSELECTED',
          });
        }
        newMap.set(arrayKey, itemKey);
        get().notifyPathSubscribers(itemKey, { type: 'THIS_SELECTED' });
      }

      get().notifyPathSubscribers(arrayKey, { type: 'GET_SELECTED' });

      return {
        ...state,
        selectedIndicesMap: newMap,
      };
    });
  },

  clearSelectedIndex: ({ arrayKey }: { arrayKey: string }): void => {
    set((state) => {
      const newMap = new Map(state.selectedIndicesMap); // CREATE A NEW MAP!
      const actualKey = newMap.get(arrayKey);
      if (actualKey) {
        get().notifyPathSubscribers(actualKey, {
          type: 'CLEAR_SELECTION',
        });
      }

      newMap.delete(arrayKey);
      get().notifyPathSubscribers(arrayKey, {
        type: 'CLEAR_SELECTION',
      });
      return {
        ...state,
        selectedIndicesMap: newMap,
      };
    });
  },
  clearSelectedIndexesForState: (stateKey) => {
    set((state) => {
      const newMap = new Map(state.selectedIndicesMap);
      let changed = false;
      for (const key of newMap.keys()) {
        if (key === stateKey || key.startsWith(stateKey + '.')) {
          newMap.delete(key);
          changed = true;
        }
      }
      return changed ? { selectedIndicesMap: newMap } : {};
    });
  },

  initialStateOptions: {},
  stateLog: new Map(),
  initialStateGlobal: {},

  addStateLog: (updates) => {
    if (!updates || updates.length === 0) return;
    set((state) => {
      const newLog = new Map(state.stateLog);
      const logsGroupedByKey = new Map<string, UpdateTypeDetail[]>();
      for (const update of updates) {
        const group = logsGroupedByKey.get(update.stateKey) || [];
        group.push(update);
        logsGroupedByKey.set(update.stateKey, group);
      }
      for (const [key, batchOfUpdates] of logsGroupedByKey.entries()) {
        const newStateLogForKey = new Map(newLog.get(key));
        for (const update of batchOfUpdates) {
          newStateLogForKey.set(JSON.stringify(update.path), { ...update });
        }
        newLog.set(key, newStateLogForKey);
      }
      return { stateLog: newLog };
    });
  },

  getInitialOptions: (key) => get().initialStateOptions[key],
  setInitialStateOptions: (key, value) => {
    set((prev) => ({
      initialStateOptions: { ...prev.initialStateOptions, [key]: value },
    }));
  },
  updateInitialStateGlobal: (key, newState) => {
    set((prev) => ({
      initialStateGlobal: { ...prev.initialStateGlobal, [key]: newState },
    }));
  },

  syncInfoStore: new Map<string, SyncInfo>(),
  setSyncInfo: (key, syncInfo) =>
    set((state) => {
      const newMap = new Map(state.syncInfoStore);
      newMap.set(key, syncInfo);
      return { syncInfoStore: newMap };
    }),
  getSyncInfo: (key) => get().syncInfoStore.get(key) || null,
}));
