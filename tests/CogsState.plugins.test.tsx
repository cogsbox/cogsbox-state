import { describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, act, render, screen } from '@testing-library/react';
import { createCogsState } from '../src/CogsState';
import { createPluginContext } from '../src/plugins';
import { PluginRunner } from '../src/PluginRunner';
import { pluginStore } from '../src/pluginStore';
import { getGlobalStore, shadowStateStore } from '../src/store';

import z from 'zod';

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
    shadowStateStore.clear();
  });

  it('should pass hook data to transformState', () => {
    const { createPlugin } = createPluginContext({
      options: z.object({ multiplier: z.number() }),
    });

    const testPlugin = createPlugin('testPlugin')
      .useHook((params) => {
        return {
          computedValue: params.options.multiplier * 10,
          timestamp: Date.now(),
        };
      })
      .transformState((params) => {
        // Actually transform the state using the hook data
        if (params.hookData && params.isInitialTransform) {
          params.initialiseState({
            value: params.hookData.computedValue,
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

    // Wait for the plugin effects to complete
    act(() => {
      // Allow React to flush effects
    });

    // The ACTUAL test: Check that the state was transformed correctly
    // The initial value was 0, the plugin should transform it to 50 (5 * 10)
    expect(result.current.value.$get()).toBe(50);
  });

  it('should re-run hooks on each render but only run transformState on option changes', () => {
    let hookRenderCount = 0;
    let transformCallCount = 0;

    const { createPlugin } = createPluginContext({
      options: z.object({ value: z.number() }),
    });

    const testPlugin = createPlugin('testPlugin')
      .useHook((params) => {
        hookRenderCount++;
        return { renderCount: hookRenderCount };
      })
      .transformState((params) => {
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

    const { createPlugin } = createPluginContext({
      options: z.object({ someOption: z.string() }),
    });

    const testPlugin = createPlugin('updateTestPlugin')
      .useHook(() => {
        // Return static data to be passed to onUpdate
        return { hookId: 'hook-123' };
      })
      .onUpdate((params) => {
        onUpdateCallCount++;
        capturedUpdateDetail = params.update;
        capturedHookData = params.hookData;

        expect(params.stateKey).toBe('counter');
        expect(params.options.someOption).toBe('test-value');
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

  it('should provide setFieldDisabled to directly disable DOM elements via refs', () => {
    let capturedSetFieldDisabled:
      | ((path: string[], disabled: boolean) => void)
      | null = null;
    let capturedGetFieldElements: ((path: string[]) => HTMLElement[]) | null =
      null;

    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    const testPlugin = createPlugin('disableTestPlugin').useHook((params) => {
      // Capture the methods for testing
      capturedSetFieldDisabled = params.setFieldDisabled;
      capturedGetFieldElements = params.getFieldElements;
      return {};
    });

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    renderHook(
      () => {
        return useCogsState('counter', {
          disableTestPlugin: {},
        });
      },
      {
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    // Wait for effects
    act(() => {});

    // Verify the methods were passed to the hook
    expect(capturedSetFieldDisabled).toBeInstanceOf(Function);
    expect(capturedGetFieldElements).toBeInstanceOf(Function);
  });

  it('should disable DOM element when setFieldDisabled is called with a registered ref', () => {
    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    let setFieldDisabledFn:
      | ((path: string[], disabled: boolean) => void)
      | null = null;

    const testPlugin = createPlugin('disableTestPlugin').useHook((params) => {
      setFieldDisabledFn = params.setFieldDisabled;
      return {};
    });

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    renderHook(
      () => {
        return useCogsState('counter', {
          disableTestPlugin: {},
        });
      },
      {
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    act(() => {});

    // Create a mock input element and manually register it in shadow metadata
    const mockInput = document.createElement('input');
    mockInput.disabled = false;

    const mockRef = { current: mockInput };
    const path = ['value'];
    const stateKey = 'counter';

    // Simulate what FormElementWrapper does - register the ref in clientActivityState
    const { getShadowMetadata, setShadowMetadata } = getGlobalStore.getState();
    const meta = getShadowMetadata(stateKey, path) || {};
    meta.clientActivityState = {
      elements: new Map([
        [
          'test-component-id',
          {
            domRef: mockRef,
            elementType: 'input',
            mountedAt: Date.now(),
          },
        ],
      ]),
    };
    setShadowMetadata(stateKey, path, meta);

    // Now call setFieldDisabled
    act(() => {
      setFieldDisabledFn!(path, true);
    });

    // The mock input should now be disabled
    expect(mockInput.disabled).toBe(true);

    // Re-enable it
    act(() => {
      setFieldDisabledFn!(path, false);
    });

    expect(mockInput.disabled).toBe(false);
  });

  it('should apply pointer-events fallback for non-form elements', () => {
    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    let setFieldDisabledFn:
      | ((path: string[], disabled: boolean) => void)
      | null = null;

    const testPlugin = createPlugin('disableTestPlugin').useHook((params) => {
      setFieldDisabledFn = params.setFieldDisabled;
      return {};
    });

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    renderHook(
      () => {
        return useCogsState('counter', {
          disableTestPlugin: {},
        });
      },
      {
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    act(() => {});

    // Create a div (which doesn't have a native disabled property)
    const mockDiv = document.createElement('div');
    const mockRef = { current: mockDiv };
    const path = ['value'];
    const stateKey = 'counter';

    const { getShadowMetadata, setShadowMetadata } = getGlobalStore.getState();
    const meta = getShadowMetadata(stateKey, path) || {};
    meta.clientActivityState = {
      elements: new Map([
        [
          'test-component-id',
          {
            domRef: mockRef,
            elementType: 'custom',
            mountedAt: Date.now(),
          },
        ],
      ]),
    };
    setShadowMetadata(stateKey, path, meta);

    act(() => {
      setFieldDisabledFn!(path, true);
    });

    // Should use pointer-events fallback
    expect(mockDiv.style.pointerEvents).toBe('none');
    expect(mockDiv.getAttribute('aria-disabled')).toBe('true');

    act(() => {
      setFieldDisabledFn!(path, false);
    });

    expect(mockDiv.style.pointerEvents).toBe('');
    expect(mockDiv.getAttribute('aria-disabled')).toBe('false');
  });
  it('should get all field elements across multiple paths with getAllFieldElements', () => {
    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    let getAllFieldElementsFn: (() => HTMLElement[]) | null = null;

    const testPlugin = createPlugin('getAllElementsTestPlugin').useHook(
      (params) => {
        getAllFieldElementsFn = params.getAllFieldElements;
        return {};
      }
    );

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    renderHook(
      () => {
        return useCogsState('counter', {
          getAllElementsTestPlugin: {},
        });
      },
      {
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    act(() => {});

    // Create multiple mock elements at different paths
    const mockInput1 = document.createElement('input');
    const mockInput2 = document.createElement('input');
    const mockDiv = document.createElement('div');

    const stateKey = 'counter';

    const { setShadowMetadata } = getGlobalStore.getState();

    // Register elements at different paths
    setShadowMetadata(stateKey, ['value'], {
      clientActivityState: {
        elements: new Map([
          [
            'comp-1',
            {
              domRef: { current: mockInput1 },
              elementType: 'input',
              mountedAt: Date.now(),
            },
          ],
        ]),
      },
    });

    setShadowMetadata(stateKey, ['other', 'nested'], {
      clientActivityState: {
        elements: new Map([
          [
            'comp-2',
            {
              domRef: { current: mockInput2 },
              elementType: 'input',
              mountedAt: Date.now(),
            },
          ],
          [
            'comp-3',
            {
              domRef: { current: mockDiv },
              elementType: 'div',
              mountedAt: Date.now(),
            },
          ],
        ]),
      },
    });

    // Get all elements
    let allElements: HTMLElement[] = [];
    act(() => {
      allElements = getAllFieldElementsFn!();
    });

    // Should return all 3 elements
    expect(allElements).toHaveLength(3);
    expect(allElements).toContain(mockInput1);
    expect(allElements).toContain(mockInput2);
    expect(allElements).toContain(mockDiv);
  });

  it('should return empty array when no elements are registered', () => {
    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    let getAllFieldElementsFn: (() => HTMLElement[]) | null = null;

    const testPlugin = createPlugin('emptyElementsTestPlugin').useHook(
      (params) => {
        getAllFieldElementsFn = params.getAllFieldElements;
        return {};
      }
    );

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    renderHook(
      () => {
        return useCogsState('counter', {
          emptyElementsTestPlugin: {},
        });
      },
      {
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    act(() => {});

    let allElements: HTMLElement[] = [];
    act(() => {
      allElements = getAllFieldElementsFn!();
    });

    expect(allElements).toHaveLength(0);
    expect(allElements).toEqual([]);
  });

  it('should disable all fields with setAllFieldsDisabled', () => {
    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    let setAllFieldsDisabledFn: ((disabled: boolean) => void) | null = null;

    const testPlugin = createPlugin('disableAllTestPlugin').useHook(
      (params) => {
        setAllFieldsDisabledFn = params.setAllFieldsDisabled;
        return {};
      }
    );

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    renderHook(
      () => {
        return useCogsState('counter', {
          disableAllTestPlugin: {},
        });
      },
      {
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    act(() => {});

    // Create multiple mock elements at different paths
    const mockInput1 = document.createElement('input');
    const mockInput2 = document.createElement('input');
    const mockDiv = document.createElement('div');
    mockInput1.disabled = false;
    mockInput2.disabled = false;

    const stateKey = 'counter';

    const { setShadowMetadata } = getGlobalStore.getState();

    // Register elements at different paths
    setShadowMetadata(stateKey, ['value'], {
      clientActivityState: {
        elements: new Map([
          [
            'comp-1',
            {
              domRef: { current: mockInput1 },
              elementType: 'input',
              mountedAt: Date.now(),
            },
          ],
        ]),
      },
    });

    setShadowMetadata(stateKey, ['other'], {
      clientActivityState: {
        elements: new Map([
          [
            'comp-2',
            {
              domRef: { current: mockInput2 },
              elementType: 'input',
              mountedAt: Date.now(),
            },
          ],
          [
            'comp-3',
            {
              domRef: { current: mockDiv },
              elementType: 'div',
              mountedAt: Date.now(),
            },
          ],
        ]),
      },
    });

    // Disable all fields
    act(() => {
      setAllFieldsDisabledFn!(true);
    });

    // All form elements should be disabled
    expect(mockInput1.disabled).toBe(true);
    expect(mockInput2.disabled).toBe(true);
    // Div should have pointer-events none
    expect(mockDiv.style.pointerEvents).toBe('none');
    expect(mockDiv.getAttribute('aria-disabled')).toBe('true');

    // Re-enable all fields
    act(() => {
      setAllFieldsDisabledFn!(false);
    });

    expect(mockInput1.disabled).toBe(false);
    expect(mockInput2.disabled).toBe(false);
    expect(mockDiv.style.pointerEvents).toBe('');
    expect(mockDiv.getAttribute('aria-disabled')).toBe('false');
  });

  it('should handle mixed form and non-form elements when disabling all fields', () => {
    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    let setAllFieldsDisabledFn: ((disabled: boolean) => void) | null = null;

    const testPlugin = createPlugin('mixedElementsTestPlugin').useHook(
      (params) => {
        setAllFieldsDisabledFn = params.setAllFieldsDisabled;
        return {};
      }
    );

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    renderHook(
      () => {
        return useCogsState('counter', {
          mixedElementsTestPlugin: {},
        });
      },
      {
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    act(() => {});

    // Create various element types
    const mockInput = document.createElement('input');
    const mockButton = document.createElement('button');
    const mockSelect = document.createElement('select');
    const mockTextarea = document.createElement('textarea');
    const mockSpan = document.createElement('span');

    mockInput.disabled = false;
    mockButton.disabled = false;
    mockSelect.disabled = false;
    mockTextarea.disabled = false;

    const stateKey = 'counter';
    const { setShadowMetadata } = getGlobalStore.getState();

    setShadowMetadata(stateKey, ['field1'], {
      clientActivityState: {
        elements: new Map([
          [
            'comp-1',
            {
              domRef: { current: mockInput },
              elementType: 'input',
              mountedAt: Date.now(),
            },
          ],
          [
            'comp-2',
            {
              domRef: { current: mockButton },
              elementType: 'button',
              mountedAt: Date.now(),
            },
          ],
        ]),
      },
    });

    setShadowMetadata(stateKey, ['field2'], {
      clientActivityState: {
        elements: new Map([
          [
            'comp-3',
            {
              domRef: { current: mockSelect },
              elementType: 'select',
              mountedAt: Date.now(),
            },
          ],
          [
            'comp-4',
            {
              domRef: { current: mockTextarea },
              elementType: 'textarea',
              mountedAt: Date.now(),
            },
          ],
          [
            'comp-5',
            {
              domRef: { current: mockSpan },
              elementType: 'span',
              mountedAt: Date.now(),
            },
          ],
        ]),
      },
    });

    // Disable all
    act(() => {
      setAllFieldsDisabledFn!(true);
    });

    // Native form elements should use disabled property
    expect(mockInput.disabled).toBe(true);
    expect(mockButton.disabled).toBe(true);
    expect(mockSelect.disabled).toBe(true);
    expect(mockTextarea.disabled).toBe(true);

    // Non-form element should use pointer-events fallback
    expect(mockSpan.style.pointerEvents).toBe('none');
    expect(mockSpan.getAttribute('aria-disabled')).toBe('true');
  });

  it('should handle null refs gracefully in getAllFieldElements', () => {
    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    let getAllFieldElementsFn: (() => HTMLElement[]) | null = null;

    const testPlugin = createPlugin('nullRefTestPlugin').useHook((params) => {
      getAllFieldElementsFn = params.getAllFieldElements;
      return {};
    });

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    renderHook(
      () => {
        return useCogsState('counter', {
          nullRefTestPlugin: {},
        });
      },
      {
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    act(() => {});

    const mockInput = document.createElement('input');
    const stateKey = 'counter';
    const { setShadowMetadata } = getGlobalStore.getState();

    // Mix of valid and null refs
    setShadowMetadata(stateKey, ['value'], {
      clientActivityState: {
        elements: new Map([
          [
            'comp-1',
            {
              domRef: { current: mockInput },
              elementType: 'input',
              mountedAt: Date.now(),
            },
          ],
          [
            'comp-2',
            {
              domRef: { current: null },
              elementType: 'input',
              mountedAt: Date.now(),
            },
          ],
          [
            'comp-3',
            { domRef: null, elementType: 'input', mountedAt: Date.now() },
          ],
        ]),
      },
    });

    let allElements: HTMLElement[] = [];
    act(() => {
      allElements = getAllFieldElementsFn!();
    });

    // Should only return the valid element
    expect(allElements).toHaveLength(1);
    expect(allElements).toContain(mockInput);
  });

  it('should handle null refs gracefully in setAllFieldsDisabled', () => {
    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    let setAllFieldsDisabledFn: ((disabled: boolean) => void) | null = null;

    const testPlugin = createPlugin('nullRefDisableTestPlugin').useHook(
      (params) => {
        setAllFieldsDisabledFn = params.setAllFieldsDisabled;
        return {};
      }
    );

    const { useCogsState } = createCogsState(initialState, {
      plugins: [testPlugin],
    });

    renderHook(
      () => {
        return useCogsState('counter', {
          nullRefDisableTestPlugin: {},
        });
      },
      {
        wrapper: ({ children }) => <PluginRunner>{children}</PluginRunner>,
      }
    );

    act(() => {});

    const mockInput = document.createElement('input');
    mockInput.disabled = false;

    const stateKey = 'counter';
    const { setShadowMetadata } = getGlobalStore.getState();

    // Mix of valid and null refs
    setShadowMetadata(stateKey, ['value'], {
      clientActivityState: {
        elements: new Map([
          [
            'comp-1',
            {
              domRef: { current: mockInput },
              elementType: 'input',
              mountedAt: Date.now(),
            },
          ],
          [
            'comp-2',
            {
              domRef: { current: null },
              elementType: 'input',
              mountedAt: Date.now(),
            },
          ],
        ]),
      },
    });

    // Should not throw when encountering null refs
    expect(() => {
      act(() => {
        setAllFieldsDisabledFn!(true);
      });
    }).not.toThrow();

    // Valid element should still be disabled
    expect(mockInput.disabled).toBe(true);
  });
  it('should get all field elements after FormElementWrapper mounts', async () => {
    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    let capturedGetAllFieldElements: (() => HTMLElement[]) | null = null;

    const testPlugin = createPlugin('testPlugin').useHook((params) => {
      capturedGetAllFieldElements = params.getAllFieldElements;
      return {};
    });

    const { useCogsState } = createCogsState(
      { test: { name: '' } },
      { plugins: [testPlugin] }
    );

    function TestComponent() {
      const state = useCogsState('test', { testPlugin: {} });
      return (
        <div>
          {state.name.$formElement((f) => (
            <input data-testid="name-input" {...f.$inputProps} />
          ))}
        </div>
      );
    }

    render(
      <PluginRunner>
        <TestComponent />
      </PluginRunner>
    );

    // Wait for ALL effects to complete - FormElementWrapper's useEffect needs to run
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // The function queries live state, so it should see the registered element now
    const elements = capturedGetAllFieldElements!();
    expect(elements).toHaveLength(1);
  });

  it('should attach plugin chain methods by target and proxy path', () => {
    const calls: any[] = [];

    const { createPlugin } = createPluginContext({
      options: z.object({ bucketPrefix: z.string().optional() }),
    });

    const chainPlugin = createPlugin('chainPlugin').methods(
      ({ array, path }) => ({
        sendManyToS3: array((ctx, bucket: string) => {
          calls.push({
            method: 'sendManyToS3',
            bucket,
            path: ctx.path,
            value: ctx.$get(),
          });
          return `array:${bucket}`;
        }),
        sendToS3: path((state) => state.users.$.profile.image)(
          (ctx, bucket: string, prefix?: string) => {
            calls.push({
              method: 'sendToS3',
              bucket,
              prefix,
              path: ctx.path,
              value: ctx.$get(),
            });
            return { uploaded: true, bucket, prefix };
          }
        ),
        sendGalleryToS3: path((state) => state.galleries.$.images).array(
          (ctx, bucket: string) => {
            calls.push({
              method: 'sendGalleryToS3',
              bucket,
              path: ctx.path,
              value: ctx.$get(),
            });
            return ctx.options?.bucketPrefix ?? 'none';
          }
        ),
      })
    );

    const { useCogsState } = createCogsState(
      {
        assets: {
          users: [{ profile: { image: 'avatar.png' } }],
          galleries: [{ images: ['one.png', 'two.png'] }],
          looseImages: ['loose.png'],
        },
      },
      { plugins: [chainPlugin] }
    );

    const { result } = renderHook(() =>
      useCogsState('assets', {
        chainPlugin: { bucketPrefix: 'uploads' },
      })
    );

    expect(result.current.looseImages.sendManyToS3('bucket-a')).toBe(
      'array:bucket-a'
    );

    expect(
      result.current.users
        .$index(0)
        .profile.image.sendToS3('bucket-b', 'avatars')
    ).toEqual({
      uploaded: true,
      bucket: 'bucket-b',
      prefix: 'avatars',
    });

    expect(
      result.current.galleries.$index(0).images.sendGalleryToS3('bucket-c')
    ).toBe('uploads');

    expect(calls).toEqual([
      {
        method: 'sendManyToS3',
        bucket: 'bucket-a',
        path: ['looseImages'],
        value: ['loose.png'],
      },
      {
        method: 'sendToS3',
        bucket: 'bucket-b',
        prefix: 'avatars',
        path: ['users', expect.any(String), 'profile', 'image'],
        value: 'avatar.png',
      },
      {
        method: 'sendGalleryToS3',
        bucket: 'bucket-c',
        path: ['galleries', expect.any(String), 'images'],
        value: ['one.png', 'two.png'],
      },
    ]);
  });

  it('should leave real state fields ahead of plugin chain methods', () => {
    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    const chainPlugin = createPlugin('chainPlugin').methods(({ object }) => ({
      sendToS3: object(() => 'plugin-method'),
    }));

    const { useCogsState } = createCogsState(
      {
        assets: {
          image: {
            sendToS3: 'real-field',
          },
        },
      },
      { plugins: [chainPlugin] }
    );

    const { result } = renderHook(() =>
      useCogsState('assets', {
        chainPlugin: {},
      })
    );

    expect(result.current.image.sendToS3.$get()).toBe('real-field');
  });

  it('should allow plugins with no options schema', () => {
    const { createPlugin } = createPluginContext();

    const noOptionsPlugin = createPlugin('noOptionsPlugin').methods(
      ({ object }) => ({
        initialise: object((ctx, value: Record<string, any>) => {
          ctx.$update(value);
          return ctx.$get();
        }),
      })
    );

    const { useCogsState } = createCogsState(
      {
        draftUser: {},
      },
      { plugins: [noOptionsPlugin] }
    );

    const { result } = renderHook(() => useCogsState('draftUser'));

    expect(
      result.current.initialise({
        name: 'Ada',
      })
    ).toEqual({
      name: 'Ada',
    });
  });

  it('should contribute initialState keys from plugin when user passes {}', () => {
    const taskManagerPlugin = {
      name: 'taskManager' as const,
      initialState: () => ({
        tasks: [] as Array<{ id: number; title: string; done: boolean }>,
        filter: 'all' as string,
      }),
    };

    const { useCogsState } = createCogsState(
      {},
      {
        plugins: [taskManagerPlugin],
      }
    );

    const TestComponent = () => {
      const tasks = useCogsState('tasks');
      return <div data-testid="tasks">{tasks.$get().length}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByTestId('tasks')).toHaveTextContent('0');
  });

  it('should allow user initialState to override plugin initialState', () => {
    const formPlugin = {
      name: 'formPrefs' as const,
      initialState: () => ({
        theme: 'dark',
        fontSize: 14,
      }),
    };

    const { useCogsState } = createCogsState(
      {
        theme: 'light',
      },
      {
        plugins: [formPlugin],
      }
    );

    const TestComponent = () => {
      const theme = useCogsState('theme'); //const theme: StateObject<string, []>
      const fontSize = useCogsState('fontSize');
      return (
        <div>
          <span data-testid="theme">{theme.$get()}</span>
          <span data-testid="fontSize">{fontSize.$get()}</span>
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('fontSize')).toHaveTextContent('14');
  });
});
