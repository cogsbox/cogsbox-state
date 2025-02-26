import { ZodObject, ZodRawShape, ZodTypeAny } from 'zod';

export type ResultItem = {
    status: "loading" | "success" | "failure" | "error";
    message?: string;
};
type RequestType = Array<{
    path: string[];
    data: any;
    key: string;
}>;
type ResultsState = {
    results: Record<string, Record<string, ResultItem>>;
    request: Record<string, RequestType>;
    getResultsByKey: (key: string) => Record<string, ResultItem> | undefined;
    setResults: (key: string) => (result: Record<string, ResultItem> | ((prevState: Record<string, ResultItem>) => Record<string, ResultItem>)) => void;
    setRequest: (key: string) => (request: RequestType | ((prevState: RequestType) => RequestType)) => void;
    getRequestsByKey: (key: string) => Array<{
        path: string[];
        data: any;
        key: string;
    }> | undefined;
};
export declare const useResultsStore: import('zustand').UseBoundStore<import('zustand').StoreApi<ResultsState>>;
export default function useValidateZodPath<T extends ZodRawShape>(validationKey: string, schema: ZodObject<T>, stateKey?: string): {
    validateZodPath: (path: string[], data: any, results?: Record<string, ResultItem> | undefined) => "loading" | "success" | "failure" | "error";
    getZodPathResults: (path: string[]) => string[] | ResultItem;
    zodPathResults: Record<string, ResultItem> | undefined;
};
export declare function validateZodPathFunc<T extends ZodRawShape, U>(validationKey: string, schema: ZodTypeAny, path: string[], data: U): Promise<{
    success: boolean;
    message?: string;
}>;
export {};
