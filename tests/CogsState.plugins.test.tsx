import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useState } from 'react';
import { getGlobalStore } from '../src/store';
import { createCogsState } from '../src/CogsState';
import { createPluginContext } from '../src/plugins';
import { waitFor } from '@testing-library/react';

// --- Mocks ---
vi.mock('../src/CogsStateClient.js', () => ({
  useCogsConfig: () => ({ sessionId: 'test-session-id' }),
}));

// --- Test Setup ---
const initialState = {
  counter: { count: 0, label: 'Counter' },
  settings: { prefix: 'Default', multiplier: 1 },
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

  it('should execute plugin lifecycle when options change', async () => {
    const events: string[] = [];
    let hookDataInTransform: any = null;
    let hookDataInUpdate: any = null;

    const { createPlugin } = createPluginContext<typeof initialState>();

    const testPlugin = createPlugin<{ multiplier: number }>('testPlugin')
      .useHook((context, options) => {
        events.push(`useHook called with multiplier: ${options.multiplier}`);
        return {
          multiply: (n: number) => n * options.multiplier,
          id: 'test-hook-data',
        };
      })
      .transformState(({ stateKey, cogsState }, options, hookData) => {
        events.push(
          `transformState called with multiplier: ${options.multiplier}`
        );
        hookDataInTransform = hookData;

        if (stateKey === 'counter') {
          const current = cogsState.$get();
          cogsState.$update({
            count: 10 * options.multiplier,
            label: current.label,
          });
        }
      })
      .onUpdate((stateKey, update, options, hookData) => {
        events.push(
          `onUpdate called: ${JSON.stringify(update.oldValue)} -> ${JSON.stringify(update.newValue)}`
        );
        hookDataInUpdate = hookData;
      });

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    // Create a wrapper component that uses reactive state for plugin options
    const { result } = renderHook(() => {
      const [multiplier, setMultiplier] = useState(1);
      const state = useCogsState('counter', { testPlugin: { multiplier } });
      return { state, setMultiplier };
    });

    // Initial state - plugin hasn't run yet (this is correct behavior)
    expect(result.current.state.$get().count).toBe(0);

    // Verify initial hook was called
    expect(
      events.some((e) => e.includes('useHook called with multiplier: 1'))
    ).toBe(true);

    // Clear events for cleaner tracking
    events.length = 0;

    // NOW CHANGE the multiplier to trigger the plugin
    act(() => {
      result.current.setMultiplier(3);
    });

    // Wait for transform to apply after the change (10 * 3 = 30)
    await waitFor(() => {
      expect(result.current.state.$get().count).toBe(30);
    });

    // Verify the plugin lifecycle ran
    expect(
      events.some((e) => e.includes('useHook called with multiplier: 3'))
    ).toBe(true);
    expect(
      events.some((e) => e.includes('transformState called with multiplier: 3'))
    ).toBe(true);
    expect(events.some((e) => e.includes('onUpdate called'))).toBe(true);

    // Verify hook data was passed correctly
    expect(hookDataInTransform).toEqual({
      multiply: expect.any(Function),
      id: 'test-hook-data',
    });
    expect(hookDataInTransform.multiply(5)).toBe(15); // 5 * 3

    // Clear events again
    events.length = 0;

    // Change multiplier again
    act(() => {
      result.current.setMultiplier(5);
    });

    // Wait for new transform (10 * 5 = 50)
    await waitFor(() => {
      expect(result.current.state.$get().count).toBe(50);
    });

    // Verify it ran again with new value
    expect(
      events.some((e) => e.includes('transformState called with multiplier: 5'))
    ).toBe(true);
  });

  it('should react to state-driven option changes', async () => {
    const events: string[] = [];

    const { createPlugin } = createPluginContext<typeof initialState>();

    // Plugin that adds a prefix to the label
    const prefixPlugin = createPlugin<{ prefix: string }>(
      'prefixPlugin'
    ).transformState(({ stateKey, cogsState }, options) => {
      events.push(`transformState: adding prefix "${options.prefix}"`);

      if (stateKey === 'counter') {
        const current = cogsState.$get();
        cogsState.$update({
          ...current,
          label: `${options.prefix}_${current.label}`,
        });
      }
    });

    const { useCogsState } = createCogsState(initialState, {
      plugins: [prefixPlugin],
    });

    // Simulate getting prefix from another piece of state
    const { result } = renderHook(() => {
      const settings = useCogsState('settings');
      const prefix = settings.$get().prefix;

      // Use the prefix from settings as the plugin option
      const counter = useCogsState('counter', {
        prefixPlugin: { prefix },
      });

      return { counter, settings };
    });

    // Initial state
    expect(result.current.counter.$get().label).toBe('Counter');

    // Clear events
    events.length = 0;

    // Change the settings which will change the plugin options
    act(() => {
      result.current.settings.$update({
        prefix: 'NEW',
        multiplier: 1,
      });
    });

    // The counter's plugin should react to the new prefix
    await waitFor(() => {
      expect(result.current.counter.$get().label).toBe('NEW_Counter');
    });

    // Verify the plugin ran
    expect(events.some((e) => e.includes('adding prefix "NEW"'))).toBe(true);
  });

  it('should handle plugin with only onUpdate', () => {
    const events: string[] = [];

    const { createPlugin } = createPluginContext<typeof initialState>();

    const updateOnlyPlugin = createPlugin('updateOnly').onUpdate(
      (stateKey, update, options) => {
        events.push(`onUpdate: ${stateKey} changed`);
      }
    );

    const { useCogsState } = createCogsState(initialState, {
      plugins: [updateOnlyPlugin],
    });

    const { result } = renderHook(() =>
      useCogsState('counter', { updateOnly: {} })
    );

    // Trigger an update
    act(() => {
      result.current.$update({ count: 100, label: 'Updated' });
    });

    // Verify onUpdate was called
    expect(events.some((e) => e.includes('onUpdate: counter changed'))).toBe(
      true
    );
  });
});
