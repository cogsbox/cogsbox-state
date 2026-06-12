import { FormElementParams, FormOptsType } from './CogsState';
import { default as React, ReactNode } from 'react';

export type ValidationWrapperProps = {
    formOpts?: FormOptsType;
    path: string[];
    stateKey: string;
    children: ReactNode;
};
export declare function ValidationWrapper({ formOpts, path, stateKey, children, }: ValidationWrapperProps): import("react/jsx-runtime").JSX.Element;
export declare const MemoizedCogsItemWrapper: React.MemoExoticComponent<typeof ListItemWrapper>;
export declare function ListItemWrapper({ stateKey, itemComponentId, itemPath, localIndex, arraySetter, rebuildStateShape, renderFn, }: {
    stateKey: string;
    itemComponentId: string;
    itemPath: string[];
    localIndex: number;
    arraySetter: any;
    rebuildStateShape: any;
    renderFn: any;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function FormElementWrapper({ stateKey, path, rebuildStateShape, renderFn, formOpts, setState, }: {
    stateKey: string;
    path: string[];
    rebuildStateShape: (options: {
        path: string[];
        componentId: string;
        meta?: any;
    }) => any;
    renderFn: (params: FormElementParams<any>) => ReactNode;
    formOpts?: FormOptsType;
    setState: any;
}): import("react/jsx-runtime").JSX.Element;
export declare function useRegisterComponent(stateKey: string, componentId: string, forceUpdate: (o: object) => void): void;
export declare function IsolatedComponentWrapper({ stateKey, path, // The path of the parent node (e.g. ['form'])
dependencies, // NEW: Optional array of Proxy objects or path arrays
rebuildStateShape, renderFn, }: {
    stateKey: string;
    path: string[];
    dependencies?: any[];
    rebuildStateShape: (options: any) => any;
    renderFn: (state: any) => React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Components.d.ts.map