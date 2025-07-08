// src/components/docs/examples/reactivity/state.ts

import { createCogsState } from '../../../../../src/CogsState'; // Adjust path if needed

// Note: The original had a typo `createCogsState`. Assuming it's `createState`
// or your library's equivalent export. I will use `createState` as a placeholder.

// Initial data structure
const fooBarObject = {
  counter1: 0,
  counter2: 0,
  foo: 'bar' as const,
  nested: {
    foo: 'bar' as const,
  },
  seperateNested: {
    foo: 'bar' as const,
  },
};

const allState = {
  fooBarObject,
};

// The type definition for our state slice. Allows 'bar' or 'baz'.
export type StateExampleObject = {
  fooBarObject: {
    counter1: number;
    counter2: number;
    foo: 'bar' | 'baz';
    nested: { foo: 'bar' | 'baz' };
    seperateNested: { foo: 'bar' | 'baz' };
  };
};

// createCogsState was used in the file, so I'll assume that's the correct export name.
export const { useCogsState } = createCogsState<StateExampleObject>(allState);
