import { observable } from "@trpc/server/observable";
import type { AnyRouter } from "@trpc/server";
import type { TRPCLink } from "@trpc/client";
import type { Operation } from "@trpc/client";
import type { TRPCClientError } from "@trpc/client";
import { getGlobalStore } from "./store";
import type { Observer } from "@trpc/server/observable";
export const useCogsTrpcValidationLink = <TRouter extends AnyRouter>() => {
  const addValidationError = getGlobalStore.getState().addValidationError;

  const TrpcValidationLink = (): TRPCLink<TRouter> => {
    return (opts) => {
      return ({ next, op }: { next: any; op: Operation }) => {
        return observable(
          (observer: Observer<any, TRPCClientError<TRouter>>) => {
            const unsubscribe = next(op).subscribe({
              next(value: unknown) {
                observer.next(value);
              },
              error(err: TRPCClientError<TRouter>) {
                console.log("link error1", err);
                try {
                  const errorObject = JSON.parse(err.message);
                  console.log("link error2", errorObject);

                  if (Array.isArray(errorObject)) {
                    errorObject.forEach(
                      (error: { path: string[]; message: string }) => {
                        const fullpath = `${op.path}.${error.path.join(".")}`;
                        // In your TRPC link
                        console.log(
                          "Adding validation error",
                          fullpath,
                          error.message
                        );
                        console.log(
                          "Current validation store before:",
                          getGlobalStore.getState().validationErrors
                        );
                        addValidationError(fullpath, error.message);
                        console.log(
                          "Current validation store after:",
                          getGlobalStore.getState().validationErrors
                        );
                      }
                    );
                  } else if (
                    typeof errorObject === "object" &&
                    errorObject !== null
                  ) {
                    Object.entries(errorObject).forEach(([key, value]) => {
                      const fullpath = `${op.path}.${key}`;
                      addValidationError(fullpath, value as string);
                    });
                  }
                } catch (e) {
                  // Silently handle parse errors
                }

                observer.error(err);
              },
              complete() {
                observer.complete();
              },
            });
            return unsubscribe;
          }
        );
      };
    };
  };
  return TrpcValidationLink;
};
