import { default as React } from 'react';

/**
 * The main orchestrator component. It reads from the central pluginStore
 * and renders a `PluginInstance` controller for each active plugin.
 *
 * Uses useSyncExternalStore for reliable, tear-free reads from the
 * zustand store, ensuring React always sees a consistent snapshot.
 */
export declare function PluginRunner({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=PluginRunner.d.ts.map