import { default as React } from 'react';

type ConfigType = {
    sessionId?: string;
};
export declare const config: ConfigType;
export declare const useCogsConfig: () => ConfigType;
export declare function CogsStateClient({ children, sessionId, }: {
    children: React.ReactNode;
    sessionId?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
