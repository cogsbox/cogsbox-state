// sync-provider.tsx
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// Types for the handlers
type FetchStateHandler = (syncKey: string) => Promise<any>;
type UpdateStateHandler = (syncKey: string, data: any) => Promise<any>;

// Define the type for our context value
interface SyncContextValue {
  sessionToken: string;
  serverUrl: string;

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
  serverUrl: string;
}

export function SyncProvider({
  children,
  sessionToken,
  serverUrl,
}: SyncProviderProps) {
  // Store handlers in state
  const [handlers, setHandlers] = useState<{
    fetchState: FetchStateHandler | null;
    updateState: UpdateStateHandler | null;
  }>({
    fetchState: null,
    updateState: null,
  });

  // Function to register handlers
  const registerHandlers = useCallback(
    (fetchState: FetchStateHandler, updateState: UpdateStateHandler) => {
      setHandlers({
        fetchState,
        updateState,
      });
    },
    []
  );

  const contextValue = {
    sessionToken,
    serverUrl,
    handlers,
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
