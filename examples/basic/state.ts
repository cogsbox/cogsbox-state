import { createCogsState } from "../../src/CogsState";

const fooBarObject = {
  foo: "bar" as const,
};

const allState = {
  fooBarObject,
};

type StateObject = {
  fooBarObject: { foo: "bar" | "baz" };
};

export const { useCogsState } = createCogsState<StateObject>(allState);
