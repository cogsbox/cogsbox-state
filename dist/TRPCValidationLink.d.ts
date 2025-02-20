import { AnyRouter } from '@trpc/server';
import { TRPCLink } from '@trpc/client';

export declare const useCogsTrpcValidationLink: <TRouter extends AnyRouter>() => () => TRPCLink<TRouter>;
