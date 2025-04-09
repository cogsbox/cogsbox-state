import { useEffect, useState } from "react";
import {
  z,
  ZodArray,
  ZodEffects,
  ZodError,
  ZodNullable,
  ZodObject,
  ZodOptional,
  type SafeParseReturnType,
  type ZodRawShape,
  type ZodTypeAny,
} from "zod";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { getGlobalStore } from "./store";

// Your existing types and store
export type ResultItem = {
  status: "loading" | "success" | "failure" | "error";
  message?: string;
};
type RequestType = Array<{ path: string[]; data: any; key: string }>;

type ResultsState = {
  results: Record<string, Record<string, ResultItem>>;
  request: Record<string, RequestType>;
  getResultsByKey: (key: string) => Record<string, ResultItem> | undefined;
  setResults: (
    key: string
  ) => (
    result:
      | Record<string, ResultItem>
      | ((prevState: Record<string, ResultItem>) => Record<string, ResultItem>)
  ) => void;
  setRequest: (
    key: string
  ) => (
    request: RequestType | ((prevState: RequestType) => RequestType)
  ) => void;
  getRequestsByKey: (
    key: string
  ) => Array<{ path: string[]; data: any; key: string }> | undefined;
};

export const useResultsStore = create<ResultsState>((set, get) => ({
  results: {},
  request: {},
  getResultsByKey: (key) => get().results[key],
  setResults: (key) => (result) => {
    set((state) => {
      return {
        results: {
          ...state.results,
          [key]:
            typeof result === "function" ? result(state.results[key]!) : result,
        },
      };
    });
  },
  setRequest: (key) => (request) =>
    set((state) => ({
      request: {
        ...state.request,
        [key]:
          typeof request === "function"
            ? request(state.request[key]!)
            : request,
      },
    })),
  getRequestsByKey: (key) => get().request[key],
}));

export default function useValidateZodPath<T extends ZodRawShape>(
  validationKey: string,
  schema: ZodObject<T>,
  stateKey?: string
) {
  const [thisKey, setThisKey] = useState(stateKey ?? uuidv4());
  const [requests, setRequests] = useState<RequestType | undefined>(undefined);

  const [localResults, setLocalResults] = useState<Record<string, ResultItem>>(
    {}
  );
  const results = stateKey
    ? useResultsStore((state) => state.getResultsByKey(thisKey))
    : localResults;
  const setResults = stateKey
    ? useResultsStore.getState().setResults(thisKey)
    : setLocalResults;

  useEffect(() => {
    requests?.forEach(async ({ path, data, key }) => {
      setResults((prevResults) => ({
        ...prevResults,
        [key]: { status: "loading" },
      })); // prevResults is saying its any

      try {
        const response = await validateZodPathFunc(
          validationKey,
          schema,
          path,
          data
        );
        setResults((prevResults) => ({
          ...prevResults,
          [key]: {
            status: response.success ? "success" : "failure",
            message: response.success ? undefined : response.message, // Now just a string
          },
        }));
      } catch (error) {
        console.error(error);
        setResults((prevResults) => ({
          ...prevResults,
          [key]: {
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "An unknown error occurred",
          },
        }));
      }
    });

    // Clear requests after processing
    if (requests && requests.length > 0) {
      setRequests([]);
    }
  }, [requests, schema]);

  const validateZodPath = (
    path: string[],
    data: any,
    results?: Record<string, ResultItem> | undefined
  ) => {
    const pathKey = path.join(".");

    setResults((prevResults) => ({
      ...prevResults,
      [pathKey]: { status: "loading" },
    }));
    setRequests((prevRequests) => [
      ...(prevRequests ?? []),
      { path, data, key: pathKey },
    ]);

    return results?.[pathKey]?.status ?? "loading";
  };

  const getZodPathResults = (path: string[]) => {
    const pathKey = path.join(".");
    let endsWith = Object.keys(results ?? {}).filter(
      (key) =>
        key.endsWith(pathKey) && key.split(".").length === path.length + 1
    );

    return results?.[pathKey] ?? endsWith ?? null;
  };

  return { validateZodPath, getZodPathResults, zodPathResults: results };
}

export async function validateZodPathFunc<T extends ZodRawShape, U>(
  validationKey: string,
  schema: ZodTypeAny,
  path: string[],
  data: U
): Promise<{ success: boolean; message?: string }> {
  let currentSchema: ZodTypeAny = schema;
  const addValidationError = getGlobalStore.getState().addValidationError;

  for (const key of path) {
    currentSchema = unwrapSchema(currentSchema);

    if (currentSchema instanceof ZodArray) {
      const index = Number(key);
      if (!isNaN(index)) {
        currentSchema = currentSchema.element;
      } else {
        throw new Error(`Invalid path: array index expected but got '${key}'.`);
      }
    } else if (currentSchema instanceof ZodObject) {
      if (key in currentSchema.shape) {
        currentSchema = currentSchema.shape[key];
      } else {
        throw new Error(`Invalid path: key '${key}' not found in schema.`);
      }
    } else {
      throw new Error(`Invalid path: key '${key}' not found in schema.`);
    }
  }

  // Ensure the final schema is fully unwrapped
  currentSchema = unwrapSchema(currentSchema, true);
  // Now currentSchema should be the schema at the end of the path, and we can validate.
  const result: SafeParseReturnType<any, any> =
    await currentSchema.safeParseAsync(data);

  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => issue.message)
      .join(", ");

    const fullErrorPath = [validationKey, ...path].join(".");
    addValidationError(fullErrorPath, messages);
    return { success: false, message: messages };
  }

  return { success: true, message: undefined };
}

function unwrapSchema(
  schema: ZodTypeAny,
  notEffects: boolean = false
): ZodTypeAny {
  while (
    schema instanceof ZodOptional ||
    schema instanceof ZodNullable ||
    (!notEffects && schema instanceof ZodEffects)
  ) {
    if (schema instanceof ZodOptional || schema instanceof ZodNullable) {
      schema = schema.unwrap();
    } else if (schema instanceof ZodEffects) {
      schema = schema._def.schema;
    }
  }
  return schema;
}
