import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createCogsState } from '../src/CogsState';
import { createPluginContext } from '../src/plugins';
import { PluginRunner } from '../src/PluginRunner';
import { pluginStore } from '../src/pluginStore';
import React from 'react';

describe('Plugin Hook to Transform Flow', () => {
  const initialState = {
    counter: { value: 0 },
  };

  beforeEach(() => {
    // Clear any plugin store state
    pluginStore.getState().registeredPlugins = [];
    pluginStore.getState().pluginOptions.clear();
    pluginStore.getState().stateHandlers.clear();
    // Clear update subscribers to prevent tests from interfering
    pluginStore.getState().updateSubscribers.clear();
  });

  it('should pass hook data to transformState', () => {
    let capturedHookData: any = null;
    let hookRenderCount = 0;
    let transformCallCount = 0;

    const { createPlugin } = createPluginContext<
      typeof initialState,
      { multiplier: number }
    >();

    const testPlugin = createPlugin('testPlugin')
      .useHook((context, options) => {
        hookRenderCount++;
        // Return some data that transformState can use
        return {
          computedValue: options.multiplier * 10,
          timestamp: Date.now(),
        };
      })
      .transformState((context, options, hookData) => {
        transformCallCount++;
        capturedHookData = hookData;

        // Use the hook data to update state
        if (hookData && context.stateKey === 'counter') {
          context.cogsState.$update({
            value: hookData.computedValue,
          });
        }
      });

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    // Wrap in PluginRunner
    const { result } = renderHook(
      () => {
        const state = useCogsState('counter', {
          testPlugin: { multiplier: 5 },
        });

        return state;
      },
      {
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    // Check that hook was called
    expect(hookRenderCount).toBeGreaterThan(0);

    // Check that transformState was called
    expect(transformCallCount).toBe(1);

    // Check that hook data was passed to transformState
    expect(capturedHookData).toEqual({
      computedValue: 50, // 5 * 10
      timestamp: expect.any(Number),
    });

    // Check that state was updated using hook data
    expect(result.current.$get().value).toBe(50);
  });

  it('should re-run hooks on each render but only run transformState on option changes', () => {
    let hookRenderCount = 0;
    let transformCallCount = 0;

    const { createPlugin } = createPluginContext<
      typeof initialState,
      { value: number }
    >();

    const testPlugin = createPlugin('testPlugin')
      .useHook((context, options) => {
        hookRenderCount++;
        return { renderCount: hookRenderCount };
      })
      .transformState((context, options, hookData) => {
        transformCallCount++;
      });

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    const { rerender } = renderHook(
      ({ value }) => {
        useCogsState('counter', {
          testPlugin: { value },
        });
      },
      {
        initialProps: { value: 1 },
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    const initialHookCount = hookRenderCount;
    expect(transformCallCount).toBe(1);

    // Force a re-render without changing options
    rerender({ value: 1 });

    // Hook should run again
    expect(hookRenderCount).toBeGreaterThan(initialHookCount);

    // Transform should NOT run again (options didn't change)
    expect(transformCallCount).toBe(1);

    // Now change the options
    rerender({ value: 2 });

    // Both should run
    expect(hookRenderCount).toBeGreaterThan(initialHookCount + 1);
    expect(transformCallCount).toBe(2);
  });

  it('should trigger onUpdate when state changes and pass hook data', () => {
    let onUpdateCallCount = 0;
    let capturedUpdateDetail: any = null;
    let capturedHookData: any = null;

    const { createPlugin } = createPluginContext<
      typeof initialState,
      { someOption: string }
    >();

    const testPlugin = createPlugin('updateTestPlugin')
      .useHook(() => {
        // Return static data to be passed to onUpdate
        return { hookId: 'hook-123' };
      })
      .onUpdate((stateKey, update, options, hookData) => {
        onUpdateCallCount++;
        capturedUpdateDetail = update;
        capturedHookData = hookData;

        // Also verify the other parameters are correct
        expect(stateKey).toBe('counter');
        expect(options.someOption).toBe('test-value');
      });

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    const { result } = renderHook(
      () => {
        return useCogsState('counter', {
          updateTestPlugin: { someOption: 'test-value' },
        });
      },
      {
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    // Act: Trigger a state update
    act(() => {
      result.current.$update({ value: 99 });
    });

    // Assert: Check that onUpdate was called correctly
    expect(onUpdateCallCount).toBe(1);

    // Verify the update object
    expect(capturedUpdateDetail).not.toBeNull();
    expect(capturedUpdateDetail.stateKey).toBe('counter');
    expect(capturedUpdateDetail.updateType).toBe('update');
    expect(capturedUpdateDetail.newValue).toEqual({ value: 99 });
    expect(capturedUpdateDetail.oldValue).toEqual({ value: 0 });

    // Verify the hook data was passed through
    expect(capturedHookData).toEqual({ hookId: 'hook-123' });
  });
});
