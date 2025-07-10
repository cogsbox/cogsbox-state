import { FormOptsType } from './CogsState';
import { default as React } from 'react';
import { getGlobalStore } from './store';

export declare const useStoreSubscription: <T>(fullPath: string, selector: (store: ReturnType<typeof getGlobalStore.getState>, path: string) => T, compare?: (a: T, b: T) => boolean) => T;
export declare const useGetValidationErrors: (validationKey: string, path: string[], validIndices?: number[]) => string[];
export type ValidationWrapperProps = {
    formOpts?: FormOptsType;
    path: string[];
    stateKey: string;
    children: React.ReactNode;
    validIndices?: number[];
};
export declare function ValidationWrapper({ formOpts, path, stateKey, children, validIndices, }: ValidationWrapperProps): import("react/jsx-runtime").JSX.Element;
