import { describe, it, expect } from 'vitest';
import { type StateObject } from '../src/CogsState';

describe('StateObject Type Tests', () => {
  it('should handle nullable relation fields', () => {
    type Variant = { boxName: string; color: string };

    type TestState = {
      variant: Variant | null;
    };

    const state: StateObject<TestState> = null as any;

    const _variantAccess: StateObject<Variant | null> = state.variant;
    const _boxNameAccess: StateObject<string> = state.variant?.boxName;

    const _colorAccess: StateObject<string> = state.variant.color;
  });

  it('should handle nested nullable objects', () => {
    type Inner = { value: number };
    type Outer = { inner: Inner | null };

    type TestState = {
      data: Outer | null;
    };

    const state: StateObject<TestState> = null as any;

    const _dataAccess: StateObject<Outer | null> = state.data;
    const _innerAccess: StateObject<Inner | null> = state.data.inner;

    const _valueAccess: StateObject<number> = state.data.inner.value;
  });

  it('should still handle normal non-nullable objects', () => {
    type TestState = {
      user: {
        name: string;
        age: number;
      };
    };

    const state: StateObject<TestState> = null as any;

    const _userAccess: StateObject<{ name: string; age: number }> = state.user;
    const _nameAccess: StateObject<string> = state.user.name;
    const _ageAccess: StateObject<number> = state.user.age;
  });

  it('should still handle arrays', () => {
    type TestState = {
      items: string[];
    };

    const state: StateObject<TestState> = null as any;

    const _itemsAccess: StateObject<string[]> = state.items;
    const _firstItem: StateObject<string> | undefined = state.items.$index(0);
  });
});
