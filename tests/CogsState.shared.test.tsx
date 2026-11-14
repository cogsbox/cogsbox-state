import React, { StrictMode, useEffect, useLayoutEffect, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, render, renderHook } from '@testing-library/react';
import { createCogsState, useCogsStateFn } from '../src/CogsState';
import { CogsStateClient } from '../src/CogsStateClient';
import { getGlobalStore, shadowStateStore } from '../src/store';
import { pluginStore } from '../src/pluginStore';

beforeEach(() => {
  shadowStateStore.clear();
  window.localStorage.clear();
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
});

describe('shared state subscribers', () => {
  it.each(['layout', 'passive'] as const)(
    'keeps initialization from the first subscriber in a %s effect when siblings mount together',
    async (effect) => {
      const { useCogsState } = createCogsState({ counter: { value: 0 } });
      const useMountEffect = effect === 'layout' ? useLayoutEffect : useEffect;
      function Subscriber({ initialize = false }: { initialize?: boolean }) {
        const state = useCogsState('counter');
        useMountEffect(() => {
          if (initialize) state.value.$update(10);
        }, []);
        return <output>{state.value.$get()}</output>;
      }
      const view = render(
        <>
          <Subscriber initialize />
          <Subscriber />
        </>
      );
      await act(async () => {});
      expect(
        view.getAllByRole('status').map((node) => node.textContent)
      ).toEqual(['10', '10']);
    }
  );

  it.each([0, 1])(
    'attaches a later subscriber to live values and stays reactive when subscriber %s unmounts',
    async (firstToUnmount) => {
      const { useCogsState } = createCogsState({ counter: { value: 0 } });
      const useCounter = () => {
        const state = useCogsState('counter');
        return { state, value: state.value.$get() };
      };
      const first = renderHook(useCounter);
      await act(async () => {
        first.result.current.state.value.$update(3);
      });
      const root = getGlobalStore.getState().getShadowNode('counter', []);
      const second = renderHook(useCounter);
      await act(async () => {});
      expect(getGlobalStore.getState().getShadowNode('counter', [])).toBe(root);
      expect(first.result.current.value).toBe(3);
      expect(second.result.current.value).toBe(3);

      for (const [hook, value] of [
        [first, 4],
        [second, 5],
      ] as const) {
        await act(async () => {
          hook.result.current.state.value.$update(value);
        });
        expect(first.result.current.value).toBe(value);
        expect(second.result.current.value).toBe(value);
      }
      const hooks = [first, second];
      hooks[firstToUnmount]!.unmount();
      const survivor = hooks[1 - firstToUnmount]!;
      await act(async () => {
        survivor.result.current.state.value.$update(6);
      });
      expect(survivor.result.current.value).toBe(6);
    }
  );

  it('keeps live state and subscriptions through StrictMode effect replay', async () => {
    const { useCogsState } = createCogsState({ counter: { value: 0 } });
    const first = renderHook(
      () => {
        const state = useCogsState('counter');
        const initialized = useRef(false);
        useEffect(() => {
          if (!initialized.current) {
            initialized.current = true;
            state.value.$update(7);
          }
        }, []);
        return { state, value: state.value.$get() };
      },
      { wrapper: ({ children }) => <StrictMode>{children}</StrictMode> }
    );
    await act(async () => {});
    expect(first.result.current.value).toBe(7);
    await act(async () => {
      first.result.current.state.value.$update(8);
    });
    expect(first.result.current.value).toBe(8);
  });

  it('applies defaults once, preserves named state after all subscribers leave, and allows explicit resets', async () => {
    const { useCogsState } = createCogsState({ counter: { value: 1 } });
    const useCounter = () =>
      useCogsState('counter', { defaultState: { value: 5 } });
    const first = renderHook(useCounter);
    await act(async () => {});
    expect(first.result.current.$get()).toEqual({ value: 5 });
    await act(async () => {
      first.result.current.value.$update(9);
    });
    first.unmount();
    const second = renderHook(useCounter);
    await act(async () => {});
    expect(second.result.current.$get()).toEqual({ value: 9 });
    await act(async () => {
      second.result.current.$revertToInitialState();
    });
    expect(second.result.current.$get()).toEqual({ value: 1 });
    const third = renderHook(useCounter);
    await act(async () => {});
    expect(third.result.current.$get()).toEqual({ value: 1 });
    await act(async () => {
      third.result.current.$updateInitialState({ value: 12 });
    });
    const fourth = renderHook(useCounter);
    await act(async () => {});
    expect(fourth.result.current.$get()).toEqual({ value: 12 });
  });

  it('hydrates localStorage once and keeps live values when another subscriber mounts', async () => {
    window.localStorage.setItem(
      'session-counter-saved',
      JSON.stringify({ state: { value: 11 }, lastUpdated: 1 })
    );
    const { useCogsState } = createCogsState({ counter: { value: 0 } });
    const useCounter = () =>
      useCogsState('counter', { localStorage: { key: 'saved' } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CogsStateClient sessionId="session">{children}</CogsStateClient>
    );
    const first = renderHook(useCounter, { wrapper });
    await act(async () => {});
    expect(first.result.current.$get()).toEqual({ value: 11 });
    await act(async () => {
      first.result.current.value.$update(13);
    });
    window.localStorage.setItem(
      'session-counter-saved',
      JSON.stringify({ state: { value: 11 }, lastUpdated: 1 })
    );
    const second = renderHook(useCounter, { wrapper });
    await act(async () => {});
    expect(first.result.current.$get()).toEqual({ value: 13 });
    expect(second.result.current.$get()).toEqual({ value: 13 });
  });

  it('attaches to an existing array store', async () => {
    const { useCogsState } = createCogsState({ items: [1, 2] });
    const first = renderHook(() => useCogsState('items'));
    await act(async () => {
      first.result.current.$update([3, 4]);
    });
    const root = shadowStateStore.get('[items');
    const second = renderHook(() => useCogsState('items'));
    await act(async () => {});
    expect(second.result.current.$get()).toEqual([3, 4]);
    expect(shadowStateStore.get('[items')).toBe(root);
  });

  it.each([false, 0, '', null])(
    'honors a falsy default of %s',
    async (defaultState) => {
      const hook = renderHook(() =>
        useCogsStateFn<unknown>('seed', { defaultState })
      );
      await act(async () => {});
      expect(hook.result.current.$get()).toBe(defaultState);
    }
  );

  it('keeps an unnamed store through StrictMode replay and releases it after unmount', async () => {
    const hook = renderHook(
      () => {
        const state = useCogsStateFn({ value: 0 });
        const initialized = useRef(false);
        useEffect(() => {
          if (!initialized.current) {
            initialized.current = true;
            state.value.$update(15);
          }
        }, []);
        return { state, value: state.value.$get() };
      },
      { wrapper: ({ children }) => <StrictMode>{children}</StrictMode> }
    );
    await act(async () => {});
    expect(hook.result.current.value).toBe(15);
    await act(async () => {
      hook.result.current.state.value.$update(16);
    });
    expect(hook.result.current.value).toBe(16);
    hook.unmount();
    await act(async () => {});
    expect(shadowStateStore.size).toBe(0);
    expect(
      Object.keys(getGlobalStore.getState().initialStateGlobal)
    ).toHaveLength(0);
  });
});
