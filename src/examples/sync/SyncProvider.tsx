// sync-provider.tsx
"use client";

import React, { createContext, useContext, type ReactNode } from "react";

// Define the type for our context value
interface SyncContextValue {
  sessionToken: string;
  serverUrl: string;
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
  const contextValue = {
    sessionToken,
    serverUrl,
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
