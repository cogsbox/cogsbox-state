import { createCogsState } from "../../src/CogsState";

const fooBarObject = {
  foo: "bar" as const,
};

const allState = {
  fooBarObject,
};

export type StateExampleObject = {
  fooBarObject: { foo: "bar" | "baz" };
};

export const { useCogsState } = createCogsState<StateExampleObject>(allState);
