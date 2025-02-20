"use client";

import React, { createContext, useContext } from "react";
type ConfigType = { sessionId?: string };
export const config: ConfigType = {
    sessionId: undefined,
};

const CogsContext = createContext<ConfigType>(config);

export const useCogsConfig = () => useContext(CogsContext);

export default function CogsStateClient({
    children,
    sessionId,
}: {
    children: React.ReactNode;
    sessionId?: string;
}) {
    return (
        <CogsContext.Provider value={{ sessionId }}>
            {children}
        </CogsContext.Provider>
    );
}
