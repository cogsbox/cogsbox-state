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
  const { autoConnect = false } = options;

  // Get session token and server URL from context
  const { sessionToken, serverUrl, handlers } = useSyncContext();

  const [state, setState] = useState<SyncState<T>>({
    data: null,
    status: "idle",
    error: null,
    lastUpdated: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const isConnected = state.status === "connected";

  // Connect to WebSocket server
  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      setState((prev) => ({ ...prev, status: "connecting", error: null }));

      // Use the sessionToken from context
      const wsUrl = `${serverUrl}?token=${encodeURIComponent(sessionToken)}`;
      console.log("Connecting to WebSocket:", wsUrl);

      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        console.log("WebSocket Connected");
        ws.send(
          JSON.stringify({
            type: "register",
            syncKey: syncKey,
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
    switch (message.type) {
      case "fetchState":
        try {
          if (!handlers.fetchState)
            throw new Error("No fetchState handler registered");
          const data = await handlers.fetchState(message.syncKey);
          ws.send(
            JSON.stringify({
              type: "stateData",
              syncKey: syncKey,
              data: state,
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

      case "updateState":
        try {
          console.log("updateStateHandler", message.syncKey, message.data);
          if (!handlers.updateState)
            throw new Error("No updateState handler registered");
          await handlers.updateState(message.syncKey, message.data);

          setState((prev) => ({
            ...prev,
            data: message.data,
            lastUpdated: new Date(),
          }));
        } catch (error: any) {
          ws.send(
            JSON.stringify({
              type: "stateUpdateError",
              syncKey: message.syncKey,
              message: error.message,
            })
          );

          setState((prev) => ({
            ...prev,
            error: `Failed to update state: ${error.message}`,
          }));
        }
        break;

      case "stateData":
        // Update local state with received data

        console.log("stateData", message.data);
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

  // Send a local update to sync with all clients
  const updateState = (newData: UpdateTypeDetail) => {
    console.log("updateState", newData, syncKey);
    try {
      wsRef.current?.send(
        JSON.stringify({
          type: "broadcastUpdate",
          syncKey,
          data: newData,
        })
      );

      return true;
    } catch (error) {
      console.error("Failed to send update:", error);
      return false;
    }
  };
  const clearStorage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "clearStorage",
          syncKey,
        })
      );
      return true;
    }
    return false;
  };
  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [autoConnect, syncKey]);

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
