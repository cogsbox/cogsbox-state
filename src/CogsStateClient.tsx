"use client";

import React, { createContext, useContext, type ReactNode } from "react";
type ConfigType = { sessionId?: string };
export const config: ConfigType = {
  sessionId: undefined,
};

const CogsContext = createContext<ConfigType>(config);

export const useCogsConfig = () => useContext(CogsContext);

export function CogsStateClient({
  children,
  sessionId,
}: {
  children: ReactNode;
  sessionId?: string;
}) {
  return (
    <CogsContext.Provider value={{ sessionId }}>
      {children}
    </CogsContext.Provider>
  );
}
