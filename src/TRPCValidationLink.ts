//@ts-nocheck
import { observable } from '@trpc/server/observable';
import type { AnyRouter } from '@trpc/server';
import type { TRPCLink } from '@trpc/client';
import type { Operation } from '@trpc/client';
import type { TRPCClientError } from '@trpc/client';
import { getGlobalStore } from './store';
import type { Observer } from '@trpc/server/observable';
export const useCogsTrpcValidationLink = <
  TRouter extends AnyRouter,
>(passedOpts?: {
  log?: boolean;
}) => {
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
                try {
                  const errorObject = JSON.parse(err.message);
                  if (passedOpts?.log) {
                    console.log('errorObject', errorObject);
                  }
                  if (Array.isArray(errorObject)) {
                    errorObject.forEach(
                      (error: { path: string[]; message: string }) => {
                        const fullpath = `${op.path}.${error.path.join('.')}`;
                        // In your TRPC link
                        if (passedOpts?.log) {
                          console.log('fullpath 1', fullpath);
                        }
                        addValidationError(fullpath, error.message);
                      }
                    );
                  } else if (
                    typeof errorObject === 'object' &&
                    errorObject !== null
                  ) {
                    Object.entries(errorObject).forEach(([key, value]) => {
                      const fullpath = `${op.path}.${key}`;
                      if (passedOpts?.log) {
                        console.log('fullpath 2', fullpath);
                      }
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
