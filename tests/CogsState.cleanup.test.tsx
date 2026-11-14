import React, { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
} from '@testing-library/react';
import { createCogsState, useCogsStateFn } from '../src/CogsState';
import { useRegisterComponent } from '../src/Components';
import { getGlobalStore, shadowStateStore } from '../src/store';
import { pluginStore } from '../src/pluginStore';
import { PluginRunner } from '../src/PluginRunner';

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: () => {}, inView: true }),
}));

const store = () => getGlobalStore.getState();

beforeEach(() => {
  shadowStateStore.clear();
  getGlobalStore.setState({
    initialStateGlobal: {},
    initialStateOptions: {},
    stateLog: new Map(),
    pathSubscribers: new Map(),
    selectedIndicesMap: new Map(),
  });
  pluginStore.setState({
    stateHandlers: new Map(),
    pluginOptions: new Map(),
    hookResults: new Map(),
    registeredPlugins: [],
    registeredPluginsByState: new Map(),
    updateSubscribers: new Set(),
    formUpdateSubscribers: new Set(),
  });
});

afterEach(async () => {
  cleanup();
  await act(async () => {});
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('component lifetime cleanup', () => {
  it.each([false, true])(
    'releases root and path registrations (StrictMode: %s)',
    async (strict) => {
      const { useCogsState } = createCogsState({ counter: { value: 0 } });
      const wrapper = strict
        ? ({ children }: { children: React.ReactNode }) => (
            <StrictMode>{children}</StrictMode>
          )
        : undefined;

      for (let index = 0; index < 5; index++) {
        const hook = renderHook(
          () => {
            const state = useCogsState('counter');
            state.value.$get();
            return state;
          },
          { wrapper }
        );
        await act(async () => {});
        expect(store().getShadowMetadata('counter', [])?.components?.size).toBe(
          1
        );
        expect(
          store().getShadowMetadata('counter', ['value'])?.pathComponents?.size
        ).toBe(1);
        hook.unmount();
        expect(
          store().getShadowMetadata('counter', [])?.components?.size ?? 0
        ).toBe(0);
        expect(
          store().getShadowMetadata('counter', ['value'])?.pathComponents
            ?.size ?? 0
        ).toBe(0);
      }
    }
  );

  it('unregisters helper dependencies without touching other consumers or recreating deleted paths', () => {
    const key = 'counter.with.dots';
    store().initializeShadowState(key, { value: 0, removed: 1 });
    const fullId = `${key}////first`;
    const otherId = `${key}////second`;
    const first = renderHook(() =>
      useRegisterComponent(key, 'first', () => {})
    );
    const second = renderHook(() =>
      useRegisterComponent(key, 'second', () => {})
    );
    store().addPathComponent(key, ['value'], fullId);
    store().addPathComponent(key, ['value'], otherId);
    store().addPathComponent(key, [], fullId);
    store().addPathComponent(key, ['removed'], fullId);
    delete store().getShadowNode(key, [])!.removed;

    first.unmount();
    expect(store().getShadowMetadata(key, ['value'])?.pathComponents).toEqual(
      new Set([otherId])
    );
    expect(store().getShadowMetadata(key, [])?.pathComponents?.size ?? 0).toBe(
      0
    );
    expect(store().getShadowNode(key, ['removed'])).toBeUndefined();
    second.unmount();
    expect(
      store().getShadowMetadata(key, ['value'])?.pathComponents?.size ?? 0
    ).toBe(0);
  });

  it('cleans isolated views and list subscriptions when their owner stays mounted', async () => {
    const { useCogsState } = createCogsState({
      data: { value: 1, items: [{ name: 'one' }] },
    });
    function View({ show }: { show: boolean }) {
      const state = useCogsState('data', { reactiveType: 'none' });
      return show ? (
        <>
          {state.value.$isolate((value) => (
            <span>{value.$get()}</span>
          ))}
          {state.items.$list((item) => (
            <div>{item.name.$get()}</div>
          ))}
        </>
      ) : null;
    }
    const view = render(<View show />);
    await act(async () => {});
    expect(store().pathSubscribers.size).toBeGreaterThan(0);
    view.rerender(<View show={false} />);
    expect(store().pathSubscribers.size).toBe(0);
    expect(store().getShadowMetadata('data', [])?.components?.size).toBe(1);
    const visit = (node: any) => {
      expect(node._meta?.pathComponents?.size ?? 0).toBe(0);
      Object.entries(node).forEach(([key, child]) => {
        if (key !== '_meta') visit(child);
      });
    };
    visit(store().getShadowNode('data', []));
  });

  it('cancels field debounce work and releases DOM references on unmount', async () => {
    vi.useFakeTimers();
    const { useCogsState } = createCogsState({ form: { name: 'initial' } });
    function Form() {
      const state = useCogsState('form', { reactiveType: 'none' });
      return state.name.$formElement(({ $inputProps }) => (
        <input {...$inputProps} />
      ));
    }
    const view = render(<Form />);
    await act(async () => {});
    fireEvent.change(view.getByRole('textbox'), {
      target: { value: 'pending' },
    });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    view.unmount();
    await act(async () => {
      vi.runAllTimers();
    });
    expect(store().getShadowValue('form', ['name'])).toBe('initial');
    expect(
      store().getShadowMetadata('form', ['name'])?.clientActivityState?.elements
        .size
    ).toBe(0);
    expect(store().getShadowMetadata('form', [])?.components?.size ?? 0).toBe(
      0
    );
    expect(store().pathSubscribers.size).toBe(0);
  });

  it('releases automatically generated state keys after unmount, including StrictMode replays', async () => {
    const hook = renderHook(() => useCogsStateFn({ value: 1 }), {
      wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
    });
    await act(async () => {});
    expect(hook.result.current.value.$get()).toBe(1);
    act(() => {
      hook.result.current.value.$update(2);
      hook.unmount();
    });
    await act(async () => {});
    expect(shadowStateStore.size).toBe(0);
    expect(Object.keys(store().initialStateGlobal)).toHaveLength(0);
    expect(Object.keys(store().initialStateOptions)).toHaveLength(0);
    expect(store().stateLog.size).toBe(0);
  });

  it('moves field subscriptions and DOM registrations when the rendered field changes', async () => {
    const { useCogsState } = createCogsState({
      form: { first: 'a', second: 'b' },
    });
    function Form({ field }: { field: 'first' | 'second' }) {
      const state = useCogsState('form', { reactiveType: 'none' });
      return state[field].$formElement(({ $inputProps }) => (
        <input {...$inputProps} />
      ));
    }
    const view = render(<Form field="first" />);
    await act(async () => {});
    view.rerender(<Form field="second" />);
    expect(
      store().getShadowMetadata('form', ['first'])?.clientActivityState
        ?.elements.size
    ).toBe(0);
    expect(store().pathSubscribers.has('form.first')).toBe(false);
    expect(
      store().getShadowMetadata('form', ['second'])?.clientActivityState
        ?.elements.size
    ).toBe(1);
    expect(store().pathSubscribers.get('form.second')?.size).toBe(1);
  });

  it('releases signal registrations and setup timers on unmount', async () => {
    vi.useFakeTimers();
    const { useCogsState } = createCogsState({ data: { value: 1 } });
    function View() {
      const state = useCogsState('data', { reactiveType: 'none' });
      return <div>{state.value.$$get()}</div>;
    }
    const pending = render(<View />);
    pending.unmount();
    expect(vi.getTimerCount()).toBe(0);

    const mounted = render(<View />);
    await act(async () => {
      vi.runAllTimers();
    });
    expect(store().getShadowMetadata('data', ['value'])?.signals).toHaveLength(
      1
    );
    mounted.unmount();
    expect(store().getShadowMetadata('data', ['value'])?.signals).toHaveLength(
      0
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it('evicts old cached proxies while keeping retained handles functional', async () => {
    const { useCogsState } = createCogsState({
      data: { items: Array.from({ length: 2000 }, (_, value) => ({ value })) },
    });
    const hook = renderHook(() =>
      useCogsState('data', { reactiveType: 'none' })
    );
    await act(async () => {});
    const items = hook.result.current.items;
    const first = items.$index(0);
    expect(items.$index(0)).toBe(first);
    for (let index = 1; index < 2000; index++) {
      expect(items.$index(index).value.$get()).toBe(index);
    }
    expect(items.$index(0)).not.toBe(first);
    await act(async () => {
      first.value.$update(99);
    });
    expect(items.$index(0).value.$get()).toBe(99);
  });

  it('releases a failed notification batch so subsequent updates can flush', async () => {
    const { useCogsState } = createCogsState({ data: { value: 1 } });
    const hook = renderHook(() =>
      useCogsState('data', { reactiveType: 'none' })
    );
    await act(async () => {});
    const forceUpdate = vi.fn().mockImplementationOnce(() => {
      throw new Error('notification failed');
    });
    store().registerComponent('data', 'throwing', {
      forceUpdate,
      paths: new Set(),
      reactiveType: 'component',
    });
    store().addPathComponent('data', ['value'], 'throwing');
    const pending: VoidFunction[] = [];
    const queue = vi
      .spyOn(globalThis, 'queueMicrotask')
      .mockImplementation((callback) => {
        pending.push(callback);
      });
    try {
      hook.result.current.value.$update(2);
      expect(() => pending.shift()!()).toThrow('notification failed');
      hook.result.current.value.$update(3);
      expect(pending).toHaveLength(1);
      pending.shift()!();
      expect(forceUpdate).toHaveBeenCalledTimes(2);
    } finally {
      queue.mockRestore();
      store().unregisterComponent('data', 'throwing');
    }
  });

  it('ignores stale dependency ids when updating a surviving consumer', async () => {
    const { useCogsState } = createCogsState({ data: { value: 1 } });
    const hook = renderHook(() =>
      useCogsState('data', { reactiveType: 'none' })
    );
    await act(async () => {});
    store().setShadowMetadata('data', ['value'], {
      pathComponents: new Set(['stale']),
    });
    await act(async () => {
      hook.result.current.value.$update(2);
    });
    expect(hook.result.current.value.$get()).toBe(2);
  });
});

describe('shared plugin lifetime', () => {
  it.each([0, 1])(
    'keeps plugins running when consumer %s unmounts first and releases them after the last',
    async (firstToUnmount) => {
      const onUpdate = vi.fn();
      const hookData = { marker: 'active' };
      const { useCogsState } = createCogsState(
        { shared: { value: 0 } },
        {
          plugins: [
            {
              name: 'observer',
              onUpdate,
              onFormUpdate: vi.fn(),
              useHook: () => hookData,
            },
          ],
        }
      );
      const hooks = [0, 1].map(() =>
        renderHook(() =>
          useCogsState('shared', {
            observer: {},
            reactiveType: 'none',
          })
        )
      );
      const runner = render(<PluginRunner>{null}</PluginRunner>);
      await act(async () => {});
      expect(pluginStore.getState().updateSubscribers.size).toBe(1);
      expect(pluginStore.getState().getHookResult('shared', 'observer')).toBe(
        hookData
      );
      hooks[firstToUnmount]!.unmount();
      await act(async () => {});
      const survivor = hooks[1 - firstToUnmount]!;
      expect(pluginStore.getState().stateHandlers.get('shared')).toBe(
        survivor.result.current
      );
      await act(async () => {
        survivor.result.current.value.$update(2);
      });
      expect(onUpdate).toHaveBeenCalledTimes(1);
      survivor.unmount();
      await act(async () => {});
      expect(pluginStore.getState().stateHandlers.size).toBe(0);
      expect(pluginStore.getState().pluginOptions.size).toBe(0);
      expect(pluginStore.getState().hookResults.size).toBe(0);
      expect(pluginStore.getState().updateSubscribers.size).toBe(0);
      expect(pluginStore.getState().formUpdateSubscribers.size).toBe(0);
      runner.unmount();
    }
  );
});
