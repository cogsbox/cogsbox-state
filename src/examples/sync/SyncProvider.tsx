// sync-provider.tsx
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useMemo,
  useRef,
} from "react";

// Types for the handlers
type FetchStateHandler = (syncKey: string) => Promise<any>;
type UpdateStateHandler = (syncKey: string, data: any) => Promise<any>;

// Define the type for our context value
interface SyncContextValue {
  sessionToken: string;
  serverUrl: string;
  serviceId: string;
  sessionId: string;
  // Stored handlers
  handlers: {
    fetchState: FetchStateHandler | null;
    updateState: UpdateStateHandler | null;
  };

  // Function to set handlers
  registerHandlers: (
    fetchState: FetchStateHandler,
    updateState: UpdateStateHandler
  ) => void;
}

// Create the context with a default value
const SyncContext = createContext<SyncContextValue | null>(null);

interface SyncProviderProps {
  children: ReactNode;
  sessionToken: string;
  serviceId: string;
  sessionId: string;
  serverUrl: string;
}

export function SyncProvider({
  children,
  serviceId,
  sessionId,
  sessionToken,
  serverUrl,
}: SyncProviderProps) {
  // Store handlers in a ref instead of state
  const handlersRef = useRef<{
    fetchState: FetchStateHandler | null;
    updateState: UpdateStateHandler | null;
  }>({
    fetchState: null,
    updateState: null,
  });

  // Function to register handlers
  const registerHandlers = (
    fetchState: FetchStateHandler,
    updateState: UpdateStateHandler
  ) => {
    // Store the handlers directly in the ref
    handlersRef.current = {
      fetchState,
      updateState,
    };
  };

  const contextValue = {
    serviceId,
    sessionId,
    sessionToken,
    serverUrl,
    handlers: handlersRef.current,
    registerHandlers,
  };

  return (
    <SyncContext.Provider value={contextValue}>{children}</SyncContext.Provider>
  );
}

// Custom hook to consume the context
export function useSyncContext() {
  const context = useContext(SyncContext);

  if (!context) {
    throw new Error("useSyncContext must be used within a SyncProvider");
  }

  return context;
}
