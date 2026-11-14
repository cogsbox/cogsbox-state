import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, renderHook } from '@testing-library/react';
import { createCogsState } from '../src/CogsState';
import { ValidationWrapper } from '../src/Components';
import { PluginRunner } from '../src/PluginRunner';
import { pluginStore } from '../src/pluginStore';
import { getGlobalStore, shadowStateStore } from '../src/store';

beforeEach(() => {
  shadowStateStore.clear();
  getGlobalStore.setState({
    initialStateGlobal: {},
    initialStateOptions: {},
    pathSubscribers: new Map(),
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

function makePlugin(name: string, owner: string) {
  const hookData = { owner };
  return {
    name,
    useHook: vi.fn(() => hookData),
    transformState: vi.fn(),
    onUpdate: vi.fn(),
    onFormUpdate: vi.fn(),
    chainMethods: {
      owner: { target: 'object' as const, handler: () => owner },
    },
  };
}

describe('plugins belonging to separate stores', () => {
  it('keeps different plugin lists, methods, and callbacks when more stores are created', async () => {
    const alphaPlugin = makePlugin('alphaPlugin', 'alpha');
    const betaPlugin = makePlugin('betaPlugin', 'beta');
    const alpha = createCogsState(
      { alpha: { value: 0 } },
      { plugins: [alphaPlugin] }
    );
    const beta = createCogsState(
      { beta: { value: 0 } },
      { plugins: [betaPlugin] }
    );
    const plain = createCogsState({ plain: { value: 0 } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PluginRunner>{children}</PluginRunner>
    );
    const hooks = renderHook(
      () => ({
        alpha: alpha.useCogsState('alpha', { alphaPlugin: {} }),
        beta: beta.useCogsState('beta', { betaPlugin: {} }),
        plain: plain.useCogsState('plain'),
      }),
      { wrapper }
    );
    await act(async () => {});
    expect(hooks.result.current.alpha.$owner()).toBe('alpha');
    expect(hooks.result.current.beta.$owner()).toBe('beta');
    expect(
      pluginStore
        .getState()
        .getPluginConfigsForState('alpha')
        .map(({ plugin }) => plugin)
    ).toEqual([alphaPlugin]);
    expect(
      pluginStore
        .getState()
        .getPluginConfigsForState('beta')
        .map(({ plugin }) => plugin)
    ).toEqual([betaPlugin]);
    expect(
      pluginStore.getState().getRegisteredPluginsForState('plain')
    ).toEqual([]);
    expect(pluginStore.getState().hookResults.has('plain')).toBe(false);
    expect(alphaPlugin.transformState).toHaveBeenCalledTimes(1);
    expect(betaPlugin.transformState).toHaveBeenCalledTimes(1);

    await act(async () => {
      hooks.result.current.alpha.value.$update(1);
    });
    expect(alphaPlugin.onUpdate).toHaveBeenCalledTimes(1);
    expect(betaPlugin.onUpdate).not.toHaveBeenCalled();
    await act(async () => {
      hooks.result.current.beta.value.$update(2);
      hooks.result.current.plain.value.$update(3);
      pluginStore
        .getState()
        .notifyFormUpdate({
          stateKey: 'alpha',
          path: ['value'],
          activityType: 'blur',
          timestamp: 1,
          details: { duration: 0 },
        });
    });
    expect(alphaPlugin.onUpdate).toHaveBeenCalledTimes(1);
    expect(betaPlugin.onUpdate).toHaveBeenCalledTimes(1);
    expect(alphaPlugin.onFormUpdate).toHaveBeenCalledTimes(1);
    expect(betaPlugin.onFormUpdate).not.toHaveBeenCalled();
  });

  it('resolves same-name Shape plugins, generated state, and validation adapters by state key', async () => {
    const firstPlugin = {
      ...makePlugin('shape', 'first'),
      initialState: () => ({ firstForm: { value: 0 } }),
    };
    const secondPlugin = {
      ...makePlugin('shape', 'second'),
      initialState: () => ({ secondForm: { value: 0 } }),
    };
    const first = createCogsState({}, { plugins: [firstPlugin] });
    const second = createCogsState({}, { plugins: [secondPlugin] });
    const firstAdapter = vi.fn(({ children }) => <>{children}</>);
    const secondAdapter = vi.fn(({ children }) => <>{children}</>);
    const firstWrapper = vi.fn(({ element }) => element);
    const secondWrapper = vi.fn(({ element }) => element);
    first.setCogsOptionsByKey('firstForm', {
      formElements: { validation: firstAdapter, shape: firstWrapper },
    });
    second.setCogsOptionsByKey('secondForm', {
      formElements: { validation: secondAdapter, shape: secondWrapper },
    });

    function Forms() {
      const firstState = first.useCogsState('firstForm', { shape: {} });
      const secondState = second.useCogsState('secondForm', { shape: {} });
      return (
        <>
          <output>{firstState.$owner()}</output>
          <output>{secondState.$owner()}</output>
          <ValidationWrapper stateKey="firstForm" path={['value']}>
            <span>first field</span>
          </ValidationWrapper>
          <ValidationWrapper stateKey="secondForm" path={['value']}>
            <span>second field</span>
          </ValidationWrapper>
        </>
      );
    }
    const view = render(
      <PluginRunner>
        <Forms />
      </PluginRunner>
    );
    await act(async () => {});
    // Hook results are published after render; mounting a subscriber must also
    // retain the state's configured adapters and hook data.
    view.rerender(
      <PluginRunner>
        <Forms />
      </PluginRunner>
    );
    expect(view.getAllByRole('status').map((node) => node.textContent)).toEqual(
      ['first', 'second']
    );
    expect(firstAdapter.mock.lastCall?.[0].plugins.shape.hookData).toEqual({
      owner: 'first',
    });
    expect(secondAdapter.mock.lastCall?.[0].plugins.shape.hookData).toEqual({
      owner: 'second',
    });
    expect(
      pluginStore.getState().getRegisteredPluginsForState('firstForm')[0]
        ?.formWrapper
    ).toBe(firstWrapper);
    expect(
      pluginStore.getState().getRegisteredPluginsForState('secondForm')[0]
        ?.formWrapper
    ).toBe(secondWrapper);
    expect(
      firstPlugin.transformState.mock.calls.every(
        ([params]) => params.stateKey === 'firstForm'
      )
    ).toBe(true);
    expect(
      secondPlugin.transformState.mock.calls.every(
        ([params]) => params.stateKey === 'secondForm'
      )
    ).toBe(true);
    await act(async () => {
      pluginStore.getState().stateHandlers.get('firstForm')!.value.$update(4);
      pluginStore
        .getState()
        .notifyFormUpdate({
          stateKey: 'secondForm',
          path: ['value'],
          activityType: 'blur',
          timestamp: 1,
          details: { duration: 0 },
        });
    });
    expect(firstPlugin.onUpdate).toHaveBeenCalledTimes(1);
    expect(secondPlugin.onUpdate).not.toHaveBeenCalled();
    expect(firstPlugin.onFormUpdate).not.toHaveBeenCalled();
    expect(secondPlugin.onFormUpdate).toHaveBeenCalledTimes(1);
  });
});
