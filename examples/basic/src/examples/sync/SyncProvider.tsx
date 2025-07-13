'use client';
import { useWebSocketConnection } from './useWebsocketConnection';
import {
  createSchema,
  type Schema,
  type InferFromSchema,
  isFunction,
} from 'cogsbox-shape';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import type z from 'zod';
import { refreshSyncToken } from './vite/getRefreshtoken';
import { applyPatch, compare, Operation } from 'fast-json-patch';
type UpdateTypeDetail = any;
type StateObject<T> = any;

const SyncContext = createContext<{
  token: string | null;
  refreshToken: string | null;
  socketUrl: string | null;
  clientId: string | null;
  syncApiUrl: string | null;
  sessionId: string;
  refreshAccessToken: () => Promise<string | null>; // Add this
}>({
  token: null,
  refreshToken: null,
  socketUrl: null,
  clientId: null,
  syncApiUrl: null,
  sessionId: '',
  refreshAccessToken: () => Promise.resolve(null),
});

// Add these types at the top of your file
type NotificationCallback = (notification: {
  syncKey: string;
  matches: any[];
  timestamp: number;
}) => void;

type NotificationContextType = {
  subscribe: (channel: string, callback: NotificationCallback) => () => void;
  isNotificationConnected: boolean;
};

// Create a new context for notifications
const NotificationContext = createContext<NotificationContextType>({
  subscribe: () => () => {},
  isNotificationConnected: false,
});

// Update your SyncProvider to include notification functionality
export default function SyncProvider({
  children,
  token,
  refreshToken,
  socketUrl,
  clientId,
  syncApiUrl,
}: {
  children: ReactNode;
  token?: string | null;
  refreshToken?: string | null;
  socketUrl: string | null;
  clientId: string;
  syncApiUrl: string;
}) {
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const [currentToken, setCurrentToken] = useState(token);
  const [isNotificationConnected, setIsNotificationConnected] = useState(false);
  const subscriptions = useRef<Map<string, Set<NotificationCallback>>>(
    new Map()
  );
  const refreshTokenRef = useRef(refreshToken);
  const isRefreshing = useRef(false);
  const refreshAccessToken = useCallback(async () => {
    if (!refreshTokenRef.current || isRefreshing.current) {
      return null;
    }

    isRefreshing.current = true;
    try {
      const newToken = await refreshSyncToken({
        refreshToken: refreshTokenRef.current,
        clientId,
      });
      if (newToken) {
        setCurrentToken(newToken);
        return newToken;
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    } finally {
      isRefreshing.current = false;
    }
  }, [clientId]);
  // Single notification WebSocket connection
  // const { connection: notificationConnection } = useWebSocketConnection({
  //   url:
  //     clientId && token
  //       ? `${socketUrl}/user-presence/${clientId}?token=${currentToken}&sessionId=${sessionId}`
  //       : '',
  //   connect: Boolean(clientId && currentToken),
  //   onConnect: () => setIsNotificationConnected(true),
  //   onDisconnect: () => setIsNotificationConnected(false),
  //   onMessage: (data) => {
  //     if (data.type === 'notification') {
  //       // Get all callbacks for this channel
  //       const callbacks = subscriptions.current.get(data.channel);
  //       if (callbacks) {
  //         callbacks.forEach((callback) => {
  //           callback({
  //             syncKey: data.syncKey,
  //             matches: data.matches,
  //             timestamp: data.timestamp,
  //           });
  //         });
  //       }
  //     }
  //   },
  // });

  const subscribe = useCallback(
    (channel: string, callback: NotificationCallback) => {
      // Add subscription
      if (!subscriptions.current.has(channel)) {
        subscriptions.current.set(channel, new Set());
      }
      subscriptions.current.get(channel)!.add(callback);

      // Return unsubscribe function
      return () => {
        const callbacks = subscriptions.current.get(channel);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            subscriptions.current.delete(channel);
          }
        }
      };
    },
    []
  );

  const notificationValue = useMemo(
    () => ({
      subscribe,
      isNotificationConnected,
    }),
    [subscribe, isNotificationConnected]
  );
  if (!token || !socketUrl || !syncApiUrl) {
    return <>{children}</>;
  }
  return (
    <SyncContext.Provider
      value={{
        token: currentToken!,
        refreshToken: refreshToken!,
        socketUrl,
        clientId,
        syncApiUrl,
        sessionId,
        refreshAccessToken,
      }}
    >
      <NotificationContext.Provider value={notificationValue}>
        {children}
      </NotificationContext.Provider>
    </SyncContext.Provider>
  );
}

type SchemaData<S extends Schema<any>> = z.infer<
  ReturnType<typeof createSchema<S>>['clientSchema']
>;
type InferSchemaTypes<S extends Schema<any>> = ReturnType<
  typeof createSchema<S>
>['clientSchema'];

export function useSync<
  TInnershape extends Record<string, any>,
  T extends Schema<TInnershape> | [Schema<TInnershape>],
  TSyncId extends
    | number
    | string
    | (({ clientId }: { clientId: string }) => string | null),
  TBaseSchema extends Schema<TInnershape> = T extends (infer U)[] ? U : T,
  TStateType = T extends [any]
    ? InferSchemaTypes<TBaseSchema>[]
    : InferSchemaTypes<TBaseSchema>,
>(
  cogsState: StateObject<TStateType>,
  options: {
    syncId: TSyncId;
    connect: boolean;

    inMemoryState?: boolean;
  }
) {
  const {
    token,
    socketUrl,
    clientId,
    syncApiUrl,
    sessionId,
    refreshAccessToken,
  } = useContext(SyncContext);
  const currentToken = useRef(token);
  useEffect(() => {
    currentToken.current = token;
  }, [token]);

  const syncId = options.syncId;
  const isArray = false;
  //const notArrayShape = isArray ? shape[0] : (shape as Schema<TInnershape>);
  //const createdSchema = createSchema(notArrayShape);
  const syncKey = (cogsState as StateObject<any>)._stateKey as string;
  type StateType = T extends [infer U extends Schema<any>]
    ? SchemaData<U>[]
    : T extends infer S extends Schema<any>
      ? SchemaData<S>
      : never;

  type HookReturn = Readonly<{
    state: StateType | null;
    connected: boolean;
    clientId: string | null;
    schemaRegistered: boolean;
    updateState: (data: UpdateTypeDetail) => void;
    subscribers: string[];
  }>;

  const determinedSyncId: string = (
    isFunction(syncId) ? syncId({ clientId: clientId ?? '' }) : syncId
  ) as string;

  const syncIdString = `${syncKey}-${determinedSyncId}`;
  const activeSyncIdRef = useRef(determinedSyncId);
  activeSyncIdRef.current = determinedSyncId;
  const syndIdRef = useRef(syncIdString);
  syndIdRef.current = syncIdString;
  // const thisState = useRef(isArray ? ([] as any as StateType) : (createdSchema.defaultValues as StateType));

  const subScribers = useRef<string[]>([]); // New state for subscriber IDs
  const isInitialised = useRef(false);

  const { connection, sendMessage } = useWebSocketConnection({
    url: `${socketUrl}/sync/${syndIdRef.current}?token=${currentToken.current}&sessionId=${sessionId}`,
    connect: options.connect,

    onDisconnect() {
      console.log('useSync WebSocket disconnected');
    },
    onConnect: async () => {
      // 2. Send the initial setup message
      sendMessage({
        type: 'initialSend',
        syncKey: syncIdString,
        isArray: isArray,
        syncApiUrl,
        inMemoryState: options?.inMemoryState,
      });
    },
    onMessage: async (data) => {
      switch (data.type) {
        case 'auth_failed':
          console.log('auth_failed', data);

          const newToken = await refreshAccessToken();
          if (newToken) {
            currentToken.current = newToken;
          }
          break;
        case 'updateState':
          if (data.syncKey === syndIdRef.current) {
            isInitialised.current = true;

            cogsState.updateInitialState(data.data as TStateType);
          }
          break;
        case 'requestInitialState':
          if (data.syncKey === syndIdRef.current) {
            const state = cogsState.getState();
            sendMessage({
              type: 'provideInitialState',
              syncKey: syncIdString,
              state: state,
            });
          }
          break;
        case 'subscribers':
          if (data.syncKey === syndIdRef.current) {
            console.log('Received subscriber list:', data.subscribers);
            subScribers.current = data.subscribers;
          }
          break;
        case 'applyPatch':
          if (data.syncKey === syndIdRef.current) {
            cogsState.applyJsonPatch(data.data);
          }
          break;
        case 'syncReady':
          console.log('Sync ready for syncKey:', data.syncKey);
          break;

        case 'fetchStateFromDb':
          // NOW fetch the data
          if (determinedSyncId) {
            sendMessage({
              type: 'initialSend',
              syncKey: syncIdString,

              isArray: isArray,
              syncApiUrl,
            });
          }
          break;
        case 'validationError':
          console.log('Sync validation error:', data.details, data.message);
          cogsState.addValidation(data.details);

          break;
        case 'error':
          console.error('Sync error:', data.message);
          break;
      }
    },
  });
  useEffect(() => {
    // When this hook becomes active (or the syncKey changes)
    // AND the underlying socket is connected...
    if (determinedSyncId && connection.connected && isInitialised.current) {
      console.log(
        `[useSync] Activating subscription for ${syncIdString}. Requesting state.`
      );
      // Send a new message type to the DO
      sendMessage({
        type: 'requestState',
        syncKey: syncIdString,
      });
    }
  }, [determinedSyncId, connection.connected, sendMessage, syncIdString]);

  if (!currentToken || !socketUrl || !syncIdString) {
    return {
      state: isArray ? [] : null,
      connected: false,
      clientId,
      schemaRegistered: false,
      updateState: (data: any) => {
        console.warn('Cannot update state: Sync connection not established.');
      },
    } as HookReturn;
  }

  // The main return path also conforms to the `HookReturn` type.
  return {
    connected: connection.connected,
    clientId,

    updateState: (data: UpdateTypeDetail) => {
      sendMessage({
        type: 'queueUpdate',
        data: data,
      });
      //is sendMessage an old version
    },
    subscribers: subScribers.current,
  } as const;
}

// FIX #3: Correct the helper type as well. It had the same bug.
export type UseSyncReturn<T extends Schema<any>, IsArray extends boolean> = {
  state: IsArray extends true ? SchemaData<T>[] | null : SchemaData<T> | null;
  connected: boolean;
  clientId: string | null;
  schemaRegistered: boolean;
  updateState: (data: any) => void;
};

// Update your frontend hook to use the proper type
export function useNotificationChannel(
  channel: string,
  onNotification: NotificationCallback
) {
  const { subscribe, isNotificationConnected } =
    useContext(NotificationContext);

  useEffect(() => {
    const unsubscribe = subscribe(channel, onNotification);
    return unsubscribe;
  }, [channel, onNotification, subscribe]);

  return { isConnected: isNotificationConnected };
}

export function useSyncReact<TStateType>(
  state: TStateType,
  setState: React.Dispatch<React.SetStateAction<TStateType>>,
  options: {
    syncId:
      | number
      | string
      | (({ clientId }: { clientId: string }) => string | null);
    connect?: boolean;
    syncKey: string;
    inMemoryState?: boolean;
  }
) {
  const mergedOptions = {
    ...options,
    connect: typeof options?.connect === 'undefined' ? true : options?.connect,
  };
  console.log('mergedOptions', mergedOptions);
  const {
    token,
    socketUrl,
    clientId,
    syncApiUrl,
    sessionId,
    refreshAccessToken,
  } = useContext(SyncContext);
  const setStateRef = useRef(setState);
  useEffect(() => {
    setStateRef.current = setState;
  }, [setState, state]);

  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const currentToken = useRef(token);

  useEffect(() => {
    currentToken.current = token;
  }, [token]);

  const { syncId, connect, syncKey } = mergedOptions;
  const isArray = Array.isArray(state);
  const determinedSyncId: string = (
    isFunction(syncId) ? syncId({ clientId: clientId ?? '' }) : syncId
  ) as string;
  const syncIdString = `${syncKey}-${determinedSyncId}`;
  const syndIdRef = useRef(syncIdString);
  syndIdRef.current = syncIdString;

  const subScribers = useRef<string[]>([]);
  const isInitialised = useRef(false);
  const isReadyToConnect = Boolean(
    token && socketUrl && determinedSyncId && connect
  );

  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const { connection, sendMessage } = useWebSocketConnection({
    url: `${socketUrl}/sync/${syndIdRef.current}?token=${currentToken.current}&sessionId=${sessionId}`,
    connect: isReadyToConnect,
    onDisconnect() {
      console.log('useSyncReact WebSocket disconnected');
      // Clear initialized state to trigger re-sync on reconnect
      isInitialised.current = false;
    },
    onConnect: async () => {
      sendMessage({
        type: 'initialSend',
        syncKey: syncIdString,
        isArray: isArray,
        syncApiUrl: syncApiUrl || null,
        inMemoryState: mergedOptions?.inMemoryState,
      });
    },
    onMessage: async (data) => {
      switch (data.type) {
        case 'auth_failed':
          console.error('[useSyncReact] Authentication failed');
          const newToken = await refreshAccessToken();
          if (newToken) {
            currentToken.current = newToken;
          }
          break;
        case 'updateState':
          if (data.syncKey === syndIdRef.current) {
            isInitialised.current = true;
            console.log('[useSyncReact] Received state update:', data.data);
            setStateRef.current(data.data as TStateType);
          }
          break;
        case 'requestInitialState':
          if (data.syncKey === syndIdRef.current) {
            sendMessage({
              type: 'provideInitialState',
              syncKey: syncIdString,
              state: state,
            });
          }
          break;
        case 'subscribers':
          if (data.syncKey === syndIdRef.current) {
            subScribers.current = data.subscribers;
          }
          break;
        case 'applyPatch':
          if (data.syncKey === syndIdRef.current) {
            try {
              setStateRef.current((prevState) => {
                const result = applyPatch(prevState, data.data as Operation[]);

                return result.newDocument;
              });
              forceUpdate();
            } catch (error) {
              console.error('[useSyncReact] Failed to apply patch:', error);
            }
          }
          break;
        case 'syncReady':
          console.log('Sync ready for syncKey:', data.syncKey);
          break;
        case 'fetchStateFromDb':
          if (determinedSyncId) {
            sendMessage({
              type: 'initialSend',
              syncKey: syncIdString,
              isArray: isArray,
              syncApiUrl: syncApiUrl || null,
            });
          }
          break;
        case 'validationError':
          setValidationErrors((prevErrors) => [...prevErrors, data.details]);

          break;
        case 'schemaWarning':
          if (data.syncKey === syndIdRef.current) {
            console.warn(
              `[useSyncReact] Schema Warning for ${data.syncKey}: ${data.message}`
            );
          }
          break;
        case 'error':
          console.error('Sync error:', data.message);
          break;
      }
    },
  });

  useEffect(() => {
    // When hook becomes active and socket is connected
    if (determinedSyncId && connection.connected && isInitialised.current) {
      sendMessage({
        type: 'requestState',
        syncKey: syncIdString,
      });
    }
  }, [determinedSyncId, connection.connected, sendMessage, syncIdString]);

  const syncedUpdater = useCallback(
    (valueOrFn: React.SetStateAction<TStateType>) => {
      // Ensure we have a connection before sending updates
      if (!connection.connected) {
        console.warn('[useSyncReact] Cannot update: WebSocket not connected');
        // Optionally, queue the update or retry connection
        return;
      }

      const oldState = state;
      const newState = isFunction(valueOrFn) ? valueOrFn(oldState) : valueOrFn;

      const patch = compare(oldState as any, newState as any);

      if (patch.length === 0) {
        console.log('[useSyncReact] No changes detected, skipping update');
        return;
      }

      console.log('[useSyncReact] Sending patch:', patch);
      setState(newState);
      try {
        sendMessage({
          type: 'queueUpdate',
          data: {
            operation: patch,
          },
        });
      } catch (error) {
        console.error('[useSyncReact] Failed to send update:', error);
      }
    },
    [state, connection.connected, sendMessage]
  );

  if (!currentToken || !socketUrl) {
    console.warn('SyncProvider not ready', socketUrl, currentToken);
    return [
      state,
      setState, // Fall back to regular setState
      {
        connected: false,
        clientId,
        subscribers: [],
        validationErrors,
      },
    ] as const;
  }

  const details = {
    connected: connection.connected,
    clientId,
    subscribers: subScribers.current,
    validationErrors,
  };
  return [state, syncedUpdater, details] as const;
}
