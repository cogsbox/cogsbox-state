import { EffectiveSetState, FormElementParmas, FormOptsType, UpdateArg } from './CogsState';
import { default as React } from 'react';
import { getGlobalStore } from './store';

export declare function updateFn<U>(setState: EffectiveSetState<U>, payload: UpdateArg<U>, path: string[], validationKey?: string): void;
export declare function pushFunc<U>(setState: EffectiveSetState<U>, payload: UpdateArg<U>, path: string[], stateKey: string, index?: number): void;
export declare function cutFunc<U>(setState: EffectiveSetState<U>, path: string[], stateKey: string, index: number): void;
export declare const useStoreSubscription: <T>(fullPath: string, selector: (store: ReturnType<typeof getGlobalStore.getState>, path: string) => T, compare?: (a: T, b: T) => boolean) => T;
export declare const useGetValidationErrors: (validationKey: string, path: string[], validIndices?: number[]) => string[];
export declare const useGetSyncInfo: (key: string, path: string[]) => import('./CogsState').SyncInfo | null;
export declare const useGetKeyState: (key: string, path: string[]) => any;
interface FormControlComponentProps<TStateObject> {
    setState: EffectiveSetState<TStateObject>;
    path: string[];
    child: (obj: FormElementParmas<TStateObject>) => JSX.Element;
    formOpts?: FormOptsType;
    stateKey: string;
}
export declare const FormControlComponent: <TStateObject>({ setState, path, child, formOpts, stateKey, }: FormControlComponentProps<TStateObject>) => import("react/jsx-runtime").JSX.Element;
export declare function ValidationWrapper({ formOpts, path, validationKey, stateKey, children, validIndices, }: {
    formOpts?: FormOptsType;
    path: string[];
    validationKey: string;
    stateKey?: string;
    children: React.ReactNode;
    validIndices?: number[];
}): import("react/jsx-runtime").JSX.Element;
export {};
