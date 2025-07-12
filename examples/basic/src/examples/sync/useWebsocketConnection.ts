// import { useRef, useCallback, useState, useEffect } from 'react';

// export type ConnectionState = {
//   socket: WebSocket | null;
//   connected: boolean;
//   error: string | null;
//   reconnectAttempts: number;
//   reconnectTimer: ReturnType<typeof setTimeout> | null;
//   refCount: number;
// };

// export type ConnectionConfig = {
//   url: string;
//   connect?: boolean;
//   maxReconnectAttempts?: number;
//   reconnectDelay?: number;
//   maxReconnectDelay?: number;
//   onConnect?: (socket: WebSocket) => void;
//   onMessage?: (data: any) => void;
//   onDisconnect?: () => void;
//   onError?: (error: string) => void;
//   onRefreshToken?: () => Promise<string | null>;
// };

// const connectionPool = new Map<string, ConnectionState>();

// function getOrCreateConnectionState(url: string): ConnectionState {
//   if (!connectionPool.has(url)) {
//     connectionPool.set(url, {
//       socket: null,
//       connected: false,
//       error: null,
//       reconnectAttempts: 0,
//       reconnectTimer: null,
//       refCount: 0,
//     });
//   }
//   return connectionPool.get(url)!;
// }

// export function useWebSocketConnection(config: ConnectionConfig) {
//   const [, forceUpdate] = useState({});
//   const shouldConnect = config.connect !== false; // Default to true if not specified
//   const connectionState = getOrCreateConnectionState(config.url);

//   // Store the current URL in a ref so sendMessage can access it
//   const currentUrlRef = useRef(config.url);
//   currentUrlRef.current = config.url;

//   // Store callbacks in refs to keep them stable and accessible
//   const onConnectRef = useRef(config.onConnect);
//   const onMessageRef = useRef(config.onMessage);
//   const onDisconnectRef = useRef(config.onDisconnect);
//   const onErrorRef = useRef(config.onError);
//   const onRefreshTokenRef = useRef(config.onRefreshToken);
//   // Update refs on each render
//   useEffect(() => {
//     onConnectRef.current = config.onConnect;
//     onMessageRef.current = config.onMessage;
//     onDisconnectRef.current = config.onDisconnect;
//     onErrorRef.current = config.onError;
//     onRefreshTokenRef.current = config.onRefreshToken;
//   });

//   const notifySubscribers = useCallback(() => {
//     forceUpdate({});
//   }, []);

//   const processMessageQueue = useCallback(async () => {
//     // This function's dependencies are now stable
//     const state = getOrCreateConnectionState(config.url);
//     if (!state.socket || state.socket.readyState !== WebSocket.OPEN) return;

//     // This logic can be simplified as it's not the core issue,
//     // but keeping it for now.
//     const socket = state.socket;
//     socket.send(JSON.stringify({ type: 'ping' }));
//   }, [config.url]);

//   const connect = useCallback(() => {
//     const state = getOrCreateConnectionState(config.url);

//     if (state.socket && state.socket.readyState !== WebSocket.CLOSED) {
//       return;
//     }

//     if (state.reconnectTimer) {
//       clearTimeout(state.reconnectTimer);
//       state.reconnectTimer = null;
//     }

//     try {
//       const socket = new WebSocket(config.url);
//       state.socket = socket;

//       socket.onopen = () => {
//         state.connected = true;
//         state.error = null;
//         state.reconnectAttempts = 0;
//         onConnectRef.current?.(socket);
//         notifySubscribers();
//       };

//       socket.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           onMessageRef.current?.(data);
//         } catch (err) {
//           console.error('Failed to parse message', err);
//         }
//       };

//       socket.onclose = () => {
//         console.log(
//           `[WS] Socket for ${config.url} was closed (likely by server). State updated.`
//         );

//         // Update the state to reflect reality. Do not try to fight it.
//         connectionState.connected = false;
//         connectionState.socket = null;
//         connectionState.reconnectAttempts = 0; // Reset attempts

//         config.onDisconnect?.();
//         notifySubscribers();
//       };

//       socket.onerror = (error) => {
//         console.log(' socket.onerror WebSocket error:', error);
//         state.error = 'Connection error';
//         state.connected = false;
//         onErrorRef.current?.('Connection error');
//         notifySubscribers();
//       };
//     } catch (err) {
//       console.error('WebSocket connection error:', err);
//       const errorMsg = err instanceof Error ? err.message : 'Failed to connect';
//       state.error = errorMsg;
//       onErrorRef.current?.(errorMsg);
//       notifySubscribers();
//     }
//   }, [config.url, notifySubscribers]);

//   useEffect(() => {
//     // Only proceed if we should connect
//     if (!shouldConnect) {
//       return;
//     }

//     const state = getOrCreateConnectionState(config.url);
//     state.refCount++;

//     if (state.refCount === 1) {
//       connect();
//     }

//     // Announce the new state
//     notifySubscribers();

//     return () => {
//       // Just decrement the count. That's it. Nothing else.
//       const state = getOrCreateConnectionState(config.url);
//       state.refCount--;
//       notifySubscribers();
//     };
//   }, [config.url, shouldConnect, connect, notifySubscribers]);

//   const sendMessage = useCallback(
//     (payload: any): boolean => {
//       // Use the current URL from the ref instead of the captured config.url
//       const state = getOrCreateConnectionState(currentUrlRef.current);
//       console.log('sendMessage', currentUrlRef.current, state.socket);
//       if (state.socket && state.socket.readyState === WebSocket.OPEN) {
//         state.socket.send(JSON.stringify(payload));
//         return true;
//       } else {
//         // Simplified: Queueing logic can be re-added if needed, but it's not the cause of the loop.
//         console.warn('WebSocket not ready, message NOT sent');
//         return false;
//       }
//     },
//     [] // Remove config.url from dependencies since we're using the ref
//   );

//   const subscribe = useCallback((callback: () => void) => {
//     // This is a local subscription, not part of the core bug.
//     // It's fine as is.
//     return () => {};
//   }, []);

//   return {
//     connection: connectionState,
//     sendMessage,
//     subscribe,
//   };
// }

import { useRef, useCallback, useState, useEffect } from 'react';

export type ConnectionState = {
  socket: WebSocket | null;
  connected: boolean;
  error: string | null;
  reconnectAttempts: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  refCount: number;
  messageQueue: any[];
  subscribers: Set<() => void>;
};

export type ConnectionConfig<T = any> = {
  url: string;
  connect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  enableReconnect?: boolean;
  pingInterval?: number;
  connectionTimeout?: number;
  onConnect?: (socket: WebSocket) => void;
  onMessage?: (data: T) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  onRefreshToken?: () => Promise<string | null>;
};

const connectionPool = new Map<string, ConnectionState>();
const poolCleanupTimers = new Map<string, ReturnType<typeof setTimeout>>();

function getOrCreateConnectionState(url: string): ConnectionState {
  if (!connectionPool.has(url)) {
    connectionPool.set(url, {
      socket: null,
      connected: false,
      error: null,
      reconnectAttempts: 0,
      reconnectTimer: null,
      refCount: 0,
      messageQueue: [],
      subscribers: new Set(),
    });
  }
  return connectionPool.get(url)!;
}

function cleanupConnection(url: string) {
  const state = connectionPool.get(url);
  if (!state) return;

  // Clear any existing cleanup timer
  const existingTimer = poolCleanupTimers.get(url);
  if (existingTimer) {
    clearTimeout(existingTimer);
    poolCleanupTimers.delete(url);
  }

  // Schedule cleanup after a delay to handle rapid mount/unmount
  const timer = setTimeout(() => {
    const currentState = connectionPool.get(url);
    if (currentState && currentState.refCount === 0) {
      // Close socket if still open
      if (currentState.socket) {
        currentState.socket.close();
        currentState.socket = null;
      }

      // Clear reconnect timer
      if (currentState.reconnectTimer) {
        clearTimeout(currentState.reconnectTimer);
        currentState.reconnectTimer = null;
      }

      // Remove from pool
      connectionPool.delete(url);
      poolCleanupTimers.delete(url);
    }
  }, 1000);

  poolCleanupTimers.set(url, timer);
}

export function useWebSocketConnection<T = any>(config: ConnectionConfig<T>) {
  const [connectionVersion, setConnectionVersion] = useState(0);
  const shouldConnect = config.connect !== false;
  const enableReconnect = config.enableReconnect !== false;

  // Store the current URL in a ref for stable reference
  const currentUrlRef = useRef(config.url);
  currentUrlRef.current = config.url;

  // Store callbacks in refs to keep them stable
  const onConnectRef = useRef(config.onConnect);
  const onMessageRef = useRef(config.onMessage);
  const onDisconnectRef = useRef(config.onDisconnect);
  const onErrorRef = useRef(config.onError);
  const onRefreshTokenRef = useRef(config.onRefreshToken);

  // Ping interval timer ref
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Update refs on each render
  useEffect(() => {
    onConnectRef.current = config.onConnect;
    onMessageRef.current = config.onMessage;
    onDisconnectRef.current = config.onDisconnect;
    onErrorRef.current = config.onError;
    onRefreshTokenRef.current = config.onRefreshToken;
  });

  const notifySubscribers = useCallback((url: string) => {
    const state = connectionPool.get(url);
    if (state) {
      state.subscribers.forEach((callback) => callback());
    }
    setConnectionVersion((v) => v + 1);
  }, []);

  const processMessageQueue = useCallback((url: string) => {
    const state = connectionPool.get(url);
    if (!state || !state.socket || state.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const queue = [...state.messageQueue];
    state.messageQueue = [];

    queue.forEach((message) => {
      try {
        state.socket!.send(JSON.stringify(message));
      } catch (err) {
        console.error('Failed to send queued message:', err);
        // Re-queue the message
        state.messageQueue.push(message);
      }
    });
  }, []);

  const setupPingInterval = useCallback(
    (url: string) => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

      if (config.pingInterval && config.pingInterval > 0) {
        pingIntervalRef.current = setInterval(() => {
          const state = connectionPool.get(url);
          if (state?.socket?.readyState === WebSocket.OPEN) {
            try {
              state.socket.send(JSON.stringify({ type: 'ping' }));
            } catch (err) {
              console.error('Failed to send ping:', err);
            }
          }
        }, config.pingInterval);
      }
    },
    [config.pingInterval]
  );

  const connect = useCallback(
    (url: string) => {
      const state = getOrCreateConnectionState(url);

      if (state.socket && state.socket.readyState !== WebSocket.CLOSED) {
        return;
      }

      if (state.reconnectTimer) {
        clearTimeout(state.reconnectTimer);
        state.reconnectTimer = null;
      }

      // Clear any existing connection timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      try {
        const socket = new WebSocket(url);
        state.socket = socket;

        // Set connection timeout
        if (config.connectionTimeout && config.connectionTimeout > 0) {
          connectionTimeoutRef.current = setTimeout(() => {
            if (socket.readyState === WebSocket.CONNECTING) {
              socket.close();
              state.error = 'Connection timeout';
              onErrorRef.current?.('Connection timeout');
              notifySubscribers(url);
            }
          }, config.connectionTimeout);
        }

        socket.onopen = async () => {
          // Clear connection timeout
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }

          // Handle token refresh if needed
          if (onRefreshTokenRef.current) {
            try {
              const token = await onRefreshTokenRef.current();
              if (token) {
                socket.send(JSON.stringify({ type: 'auth', token }));
              }
            } catch (err) {
              console.error('Token refresh failed:', err);
            }
          }

          state.connected = true;
          state.error = null;
          state.reconnectAttempts = 0;

          // Process any queued messages
          processMessageQueue(url);

          // Setup ping interval
          setupPingInterval(url);

          onConnectRef.current?.(socket);
          notifySubscribers(url);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessageRef.current?.(data);
          } catch (err) {
            console.error('Failed to parse message:', err);
          }
        };

        socket.onclose = () => {
          console.log(`[WS] Socket for ${url} was closed. State updated.`);

          // Clear ping interval
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }

          // Update state
          state.connected = false;
          state.socket = null;

          onDisconnectRef.current?.();
          notifySubscribers(url);

          // Attempt reconnection if enabled and we should still be connected
          if (enableReconnect && shouldConnect && state.refCount > 0) {
            reconnect(url);
          }
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          state.error = 'Connection error';
          state.connected = false;
          onErrorRef.current?.('Connection error');
          notifySubscribers(url);
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to connect';
        state.error = errorMsg;
        onErrorRef.current?.(errorMsg);
        notifySubscribers(url);

        // Attempt reconnection if enabled
        if (enableReconnect && shouldConnect && state.refCount > 0) {
          reconnect(url);
        }
      }
    },
    [
      shouldConnect,
      enableReconnect,
      config.connectionTimeout,
      processMessageQueue,
      setupPingInterval,
      notifySubscribers,
    ]
  );

  const reconnect = useCallback(
    (url: string) => {
      const state = getOrCreateConnectionState(url);

      const maxAttempts = config.maxReconnectAttempts ?? 5;
      if (state.reconnectAttempts >= maxAttempts) {
        state.error = 'Max reconnection attempts reached';
        onErrorRef.current?.('Max reconnection attempts reached');
        notifySubscribers(url);
        return;
      }

      const baseDelay = config.reconnectDelay ?? 1000;
      const maxDelay = config.maxReconnectDelay ?? 30000;
      const delay = Math.min(
        baseDelay * Math.pow(2, state.reconnectAttempts),
        maxDelay
      );

      console.log(
        `[WS] Reconnecting to ${url} in ${delay}ms (attempt ${state.reconnectAttempts + 1}/${maxAttempts})`
      );

      state.reconnectTimer = setTimeout(() => {
        state.reconnectAttempts++;
        connect(url);
      }, delay);
    },
    [
      config.maxReconnectAttempts,
      config.reconnectDelay,
      config.maxReconnectDelay,
      connect,
      notifySubscribers,
    ]
  );

  useEffect(() => {
    // Capture URL at effect creation time to avoid race conditions
    const effectUrl = config.url;

    if (!shouldConnect) {
      return;
    }

    const state = getOrCreateConnectionState(effectUrl);
    state.refCount++;

    // Subscribe this component to state changes
    const unsubscribe = subscribe(() => {
      setConnectionVersion((v) => v + 1);
    });

    if (state.refCount === 1) {
      connect(effectUrl);
    }

    notifySubscribers(effectUrl);

    return () => {
      unsubscribe();

      const cleanupState = getOrCreateConnectionState(effectUrl);
      cleanupState.refCount--;

      if (cleanupState.refCount === 0) {
        // Cancel any pending reconnection
        if (cleanupState.reconnectTimer) {
          clearTimeout(cleanupState.reconnectTimer);
          cleanupState.reconnectTimer = null;
        }

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Schedule cleanup
        cleanupConnection(effectUrl);
      }

      notifySubscribers(effectUrl);
    };
  }, [config.url, shouldConnect, connect, notifySubscribers]);

  const sendMessage = useCallback(
    (payload: T, queueIfDisconnected: boolean = true): boolean => {
      const url = currentUrlRef.current;
      const state = getOrCreateConnectionState(url);

      if (state.socket && state.socket.readyState === WebSocket.OPEN) {
        try {
          state.socket.send(JSON.stringify(payload));
          return true;
        } catch (err) {
          console.error('Failed to send message:', err);
          if (queueIfDisconnected) {
            state.messageQueue.push(payload);
          }
          return false;
        }
      } else if (queueIfDisconnected) {
        console.log('WebSocket not ready, queueing message');
        state.messageQueue.push(payload);
        return false;
      } else {
        console.warn('WebSocket not ready, message not sent');
        return false;
      }
    },
    []
  );

  const subscribe = useCallback((callback: () => void) => {
    const url = currentUrlRef.current;
    const state = getOrCreateConnectionState(url);
    state.subscribers.add(callback);

    return () => {
      state.subscribers.delete(callback);
    };
  }, []);

  const disconnect = useCallback(() => {
    const url = currentUrlRef.current;
    const state = getOrCreateConnectionState(url);

    if (state.socket) {
      state.socket.close();
    }
  }, []);

  const clearMessageQueue = useCallback(() => {
    const url = currentUrlRef.current;
    const state = getOrCreateConnectionState(url);
    state.messageQueue = [];
  }, []);

  // Get current connection state
  const connectionState = getOrCreateConnectionState(currentUrlRef.current);

  return {
    connection: connectionState,
    connected: connectionState.connected,
    error: connectionState.error,
    reconnectAttempts: connectionState.reconnectAttempts,
    sendMessage,
    subscribe,
    disconnect,
    clearMessageQueue,
    messageQueueLength: connectionState.messageQueue.length,
  };
}
