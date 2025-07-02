import { createCogsState } from "../../../src/CogsState";

const fooBarObject = {
  foo: "bar" as const,
  nested: {
    foo: "bar" as const,
  },
  seperateNested: {
    foo: "bar" as const,
  },
};

const allState = {
  fooBarObject,
};

export type StateExampleObject = {
  fooBarObject: {
    foo: "bar" | "baz";
    nested: { foo: "bar" | "baz" };
    seperateNested: { foo: "bar" | "baz" };
  };
};

export const { useCogsState } = createCogsState<StateExampleObject>(allState);
