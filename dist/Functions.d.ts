import { FormOptsType } from './CogsState';
import { default as React } from 'react';

export type ValidationWrapperProps = {
    formOpts?: FormOptsType;
    path: string[];
    stateKey: string;
    children: React.ReactNode;
    validIndices?: number[];
};
export declare function ValidationWrapper({ formOpts, path, stateKey, children, validIndices, }: ValidationWrapperProps): import("react/jsx-runtime").JSX.Element;
