import { useState, useEffect, useRef } from "react";
import { useSyncContext } from "./SyncProvider";
import type { UpdateTypeDetail } from "../../CogsState";

interface SyncState<T> {
  data: T | null;
  status: "idle" | "connecting" | "connected" | "error" | "disconnected";
  error: string | null;
  lastUpdated: Date | null;
}

interface SyncOptions {
  autoConnect?: boolean;
  enabled?: boolean;
}

/**
 * Custom hook for syncing state with backend via WebSocket
 *
 * @param syncKey - The unique key for the sync session (format: "serviceId-userId-stateKey-stateId")
 * @param fetchStateHandler - Function to handle fetching initial state
 * @param updateStateHandler - Function to handle state updates
 * @param options - Configuration options
 * @returns An object with the sync state and control functions
 */
export function useSync<T>(syncKey: string, options: SyncOptions = {}) {
  const { autoConnect = true, enabled = true } = options;

  const { sessionToken, serverUrl, handlers, serviceId, sessionId } =
    useSyncContext();
  let fullSyncKeyRef = useRef(`${serviceId}-${sessionId}-${syncKey}`);
  let enabledRef = useRef(enabled);

  const [state, setState] = useState<SyncState<T>>({
    data: null,
    status: "idle",
    error: null,
    lastUpdated: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const isConnected = state.status === "connected";

  useEffect(() => {
    fullSyncKeyRef.current = `${serviceId}-${sessionId}-${syncKey}`;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const registerMsg = {
        type: "register",
        syncKey: fullSyncKeyRef.current,
      };
      console.log("Sending:", JSON.stringify(registerMsg));

      wsRef.current.send(JSON.stringify(registerMsg));

      setState((prev) => ({
        ...prev,
        data: null,
        lastUpdated: null,
      }));
    } else {
      if (autoConnect && enabledRef.current) {
        console.log("Attempting to connect...");
        connect();
      }
    }
  }, [syncKey]);

  const connect = () => {
    if (!enabledRef.current) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, status: "connecting", error: null }));

      // Use the sessionToken from context
      const wsUrl = `${serverUrl}?token=${encodeURIComponent(sessionToken)}`;

      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        console.log("WebSocket Connected");
        ws.send(
          JSON.stringify({
            type: "register",
            syncKey: fullSyncKeyRef.current,
          })
        );
        setState((prev) => ({ ...prev, status: "connected", error: null }));
      };

      ws.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
        const message = JSON.parse(event.data);
        handleWebSocketMessage(ws, message);
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Connection error",
        }));
      };

      ws.onclose = (event) => {
        console.log("WebSocket Disconnected:", event.code, event.reason);
        let errorMessage = null;

        // Handle specific error codes
        switch (event.code) {
          case 4000:
            errorMessage = "Authentication Error: Invalid token";
            break;
          case 4001:
            errorMessage = "Authentication Error: Missing token";
            break;
          case 4002:
            errorMessage = `Authentication Error: Service error (${event.reason})`;
            break;
          case 4003:
            errorMessage = "Authentication Error: Service unavailable";
            break;
        }

        setState((prev) => ({
          ...prev,
          status: "disconnected",
          error: errorMessage,
        }));
      };

      wsRef.current = ws;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error.message,
      }));
    }
  };

  // Disconnect from WebSocket server
  const disconnect = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, "User disconnected");
      setState((prev) => ({ ...prev, status: "disconnected" }));
    }
  };

  // Handle received WebSocket messages
  const handleWebSocketMessage = async (ws: WebSocket, message: any) => {
    if (!enabledRef.current) return; // Skip handling messages if not enabled

    switch (message.type) {
      case "fetchStateFromDb":
        try {
          if (!handlers.fetchState) {
            throw new Error("No fetchState handler registered");
          }

          const data = await handlers.fetchState(message.syncKey);
          console.log("fetchStateFromDb", data, fullSyncKeyRef.current);
          ws.send(
            JSON.stringify({
              type: "stateData",
              syncKey: fullSyncKeyRef.current,
              data: data,
            })
          );
          setState((prev) => ({
            ...prev,
            data,
            lastUpdated: new Date(),
          }));
        } catch (error: any) {
          ws.send(
            JSON.stringify({
              type: "error",
              syncKey: message.syncKey,
              message: error.message,
            })
          );

          setState((prev) => ({
            ...prev,
            error: `Failed to fetch state: ${error.message}`,
          }));
        }
        break;

      case "updateStateInDb":
        setState((prev) => ({
          ...prev,
          data: message.data,
          lastUpdated: new Date(),
        }));
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  };

  const updateState = (newData: UpdateTypeDetail) => {
    console.log("enabledenabledenabledenabled", enabledRef.current);
    if (!enabledRef.current) return false;

    try {
      console.log("updateState", wsRef.current);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "queueUpdate",
            syncKey: fullSyncKeyRef.current,
            data: newData,
          })
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to send update:", error);
      return false;
    }
  };

  const clearStorage = () => {
    if (!enabledRef.current) return false;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "clearStorage",
          syncKey: fullSyncKeyRef.current,
        })
      );
      return true;
    }
    return false;
  };

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && enabledRef.current) {
      connect();
    }
    return () => {
      if (wsRef.current && !enabledRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [autoConnect, enabled]);

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled && isConnected) {
      disconnect();
    }
  }, [enabled]);

  return {
    state: state.data as T,
    status: state.status,
    error: state.error,
    lastUpdated: state.lastUpdated,
    connect,
    disconnect,
    clearStorage,
    updateState,
    isConnected,
  };
}
