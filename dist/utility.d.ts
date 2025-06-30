import { TransformedStateType } from './CogsState';

export declare const isObject: (item: any) => item is Record<string, any>;
export type GenericObject = Record<string, any>;
export declare const isFunction: <TStateObject extends unknown>(arg: any) => arg is (prev: TStateObject) => TStateObject;
export declare const isArray: (item: any) => item is Array<any>;
export declare const isDeepEqual: (object1?: Record<string, any>, object2?: Record<string, any>, opts?: {
    get?: () => void;
}, currentPath?: string[]) => boolean;
export declare function updateNestedProperty(path: string[], state: any, update: any): any;
export declare function deleteNestedProperty(path: string[], state: any): any;
export declare function getNestedValue<TStateObject extends unknown>(obj: TStateObject, pathArray: string[]): any;
export declare function updateNestedPropertyIds(path: string[], state: any, newValue: any): any;
type DifferencePaths = string[];
export declare function getDifferences(obj1: any, obj2: any, currentPath?: string): DifferencePaths;
export declare function getDifferencesArray(obj1: any, obj2: any): string[][];
export declare function getArrayLengthDifferences(obj1: any, obj2: any, currentPath?: string): string[];
export declare function getArrayLengthDifferencesArray(obj1: any, obj2: any): string[][];
export declare function transformStateFunc<State extends unknown>(initialState: State): [TransformedStateType<State>, GenericObject];
export declare function debounce<F extends (...args: any[]) => any>(func: (...args: any[]) => any, wait: number): F & {
    cancel: () => void;
};
export type DebouncedFunction<F extends (...args: any[]) => any> = F & {
    cancel: () => void;
};
export {};
