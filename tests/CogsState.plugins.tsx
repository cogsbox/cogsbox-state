import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getGlobalStore } from '../src/store';
import { createCogsState } from '../src/CogsState';
import { createPluginContext } from '../src/plugins';

// --- Mocks ---
vi.mock('../src/CogsStateClient.js', () => ({
  useCogsConfig: () => ({ sessionId: 'test-session-id' }),
}));

// --- Test Setup ---
const initialState = {
  counter: { count: 0, label: 'Counter' },
};

describe('Plugin System', () => {
  beforeEach(() => {
    // Reset the global store
    const store = getGlobalStore.getState();
    Object.keys(initialState).forEach((key) => {
      store.initializeShadowState(
        key,
        initialState[key as keyof typeof initialState]
      );
    });
  });

  it('should execute all plugin lifecycle methods correctly', () => {
    const events: string[] = [];
    let hookDataInTransform: any = null;
    let hookDataInUpdate: any = null;

    const testPlugin = createPluginContext<{ count: number; label: string }>()
      .createPlugin<{ multiplier: number }>()
      .useHook((state, options) => {
        events.push(`useHook called with multiplier: ${options.multiplier}`);
        return {
          multiply: (n: number) => n * options.multiplier,
          id: 'test-hook-data',
        };
      })
      .transformState((state, options, hookData) => {
        events.push('transformState called');
        hookDataInTransform = hookData;
        return {
          ...state,
          count: hookData.multiply(state.count.$get() + 10), // Transform: add 10 then multiply
        };
      })
      .onUpdate((update, options, hookData) => {
        events.push(
          `onUpdate called: ${update.oldValue?.count} -> ${update.newValue?.count}`
        );
        hookDataInUpdate = hookData;
      });

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    const { result } = renderHook(() =>
      useCogsState('counter', { multiplier: 3 })
    );

    // Let hooks run
    act(() => {});

    // Check initial transformation worked
    expect(result.current.$get()).toEqual({
      count: 30, // (0 + 10) * 3
      label: 'Counter',
    });

    // Check hook was called
    expect(events).toContain('useHook called with multiplier: 3');
    expect(events).toContain('transformState called');

    // Check hook data was passed to transformState
    expect(hookDataInTransform).toEqual({
      multiply: expect.any(Function),
      id: 'test-hook-data',
    });
    expect(hookDataInTransform.multiply(5)).toBe(15);

    // Now update the state to trigger onUpdate
    act(() => {
      result.current.$update({ count: 100, label: 'Updated' });
    });

    // Check onUpdate was called with correct values
    expect(events).toContain('onUpdate called: 30 -> 100');

    // Check hook data was passed to onUpdate
    expect(hookDataInUpdate).toEqual({
      multiply: expect.any(Function),
      id: 'test-hook-data',
    });

    // Verify all parts ran
    expect(events).toEqual([
      'useHook called with multiplier: 3',
      'transformState called',
      'onUpdate called: 30 -> 100',
    ]);
  });
});
