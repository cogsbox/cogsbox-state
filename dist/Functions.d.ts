import { FormOptsType } from './CogsState';
import { default as React } from 'react';

export type ValidationWrapperProps = {
    formOpts?: FormOptsType;
    path: string[];
    stateKey: string;
    children: React.ReactNode;
};
export declare function ValidationWrapper({ formOpts, path, stateKey, children, }: ValidationWrapperProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Functions.d.ts.map