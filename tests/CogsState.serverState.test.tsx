import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getGlobalStore } from '../src/store'; // Ensure this path is correct
import { createCogsState, type OptionsType } from '../src/CogsState';

// --- Mocks ---
vi.mock('../src/CogsStateClient.js', () => ({
  useCogsConfig: () => ({ sessionId: 'test-session-id' }),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}));

// --- CORRECT TEST SETUP ---

// 1. Define the initial state for the entire application/test suite ONCE.
const initialState = {
  todos: [] as { id: string; text: string }[],
  user: { name: 'Default', role: 'user' },
  defaultTodos: [{ id: 'default-1', text: 'Default Todo' }],
  clientOnlyTodos: [{ id: 'client-1', text: 'Client Only Todo' }],
};

// 2. Create the global state manager ONCE. This is the correct pattern.
const { useCogsState } = createCogsState(initialState);

describe('serverState Hydration and Merging', () => {
  let storage: Record<string, string> = {};

  // 3. This hook correctly resets the SINGLE global store before EACH test.
  beforeEach(() => {
    // Reset localStorage mock for every test
    storage = {};
    // @ts-ignore
    global.window.localStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    };

    // THE CRITICAL FIX: Reset the global store to its original state.
    const store = getGlobalStore.getState();

    // Re-initialize every slice of the state using the library's own function
    Object.keys(initialState).forEach((key) => {
      store.initializeShadowState(
        key,
        initialState[key as keyof typeof initialState]
      );
    });
  });

  it('should update correctly when serverState arrives AFTER initial render', async () => {
    const AsyncWrapper = () => {
      const [serverState, setServerState] =
        React.useState<OptionsType<any>['serverState']>(undefined);
      React.useEffect(() => {
        setTimeout(() => {
          setServerState({
            status: 'success',
            data: [{ id: 'async-1', text: 'Async Server Todo' }],
            timestamp: Date.now(),
          });
        }, 50);
      }, []);

      const todos = useCogsState('defaultTodos', { serverState });
      return (
        <ul>
          {todos.$get().map((todo) => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      );
    };

    render(<AsyncWrapper />);
    expect(screen.getByText('Default Todo')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('Async Server Todo')).toBeInTheDocument()
    );
    expect(screen.queryByText('Default Todo')).not.toBeInTheDocument();
  });

  it('should fall back to defaultState if serverState arrives with a non-success status', async () => {
    const AsyncWrapper = () => {
      const [serverState, setServerState] =
        React.useState<OptionsType<any>['serverState']>(undefined);
      React.useEffect(() => {
        setTimeout(() => {
          setServerState({ status: 'error', data: [], timestamp: Date.now() });
        }, 50);
      }, []);
      const todos = useCogsState('defaultTodos', { serverState });
      return (
        <ul>
          {todos.$get().map((todo) => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      );
    };

    render(<AsyncWrapper />);
    expect(screen.getByText('Default Todo')).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 100));
    expect(screen.getByText('Default Todo')).toBeInTheDocument();
  });

  it('should initially load from localStorage, then update from newer serverState', async () => {
    const localData = {
      state: [{ id: 'local-1', text: 'Local Todo' }],
      lastUpdated: Date.now() - 10000,
    };
    storage['test-session-id-todos-my-todos'] = JSON.stringify(localData);

    const AsyncWrapper = () => {
      const [serverState, setServerState] =
        React.useState<OptionsType<any>['serverState']>(undefined);
      React.useEffect(() => {
        setTimeout(() => {
          setServerState({
            status: 'success',
            data: [{ id: 'server-1', text: 'Newer Server Todo' }],
            timestamp: Date.now(),
          });
        }, 50);
      }, []);

      const todos = useCogsState('todos', {
        localStorage: { key: 'my-todos' },
        serverState,
      });
      return (
        <ul>
          {todos.$get().map((todo) => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      );
    };

    render(<AsyncWrapper />);
    await waitFor(() =>
      expect(screen.getByText('Local Todo')).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText('Newer Server Todo')).toBeInTheDocument()
    );
    expect(screen.queryByText('Local Todo')).not.toBeInTheDocument();
  });

  it('should append new items with merge strategy "append" when serverState arrives later', async () => {
    const AsyncWrapper = () => {
      const [serverState, setServerState] =
        React.useState<OptionsType<any>['serverState']>(undefined);
      React.useEffect(() => {
        setTimeout(() => {
          setServerState({
            status: 'success',
            data: [
              { id: 'client-1', text: 'This is a duplicate' },
              { id: 'server-1', text: 'New Server Todo' },
            ],
            timestamp: Date.now(),
            merge: { strategy: 'append', key: 'id' },
          });
        }, 50);
      }, []);
      const todos = useCogsState('clientOnlyTodos', { serverState });
      return (
        <ul>
          {todos.$get().map((todo) => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      );
    };

    render(<AsyncWrapper />);
    expect(screen.getByText('Client Only Todo')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('New Server Todo')).toBeInTheDocument()
    );
    expect(screen.getByText('Client Only Todo')).toBeInTheDocument();
    expect(screen.queryByText('This is a duplicate')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(2);
  });

  it('should have a status of "synced" only after hydrating from serverState', async () => {
    const AsyncWrapper = () => {
      const [serverState, setServerState] =
        React.useState<OptionsType<any>['serverState']>(undefined);
      React.useEffect(() => {
        setTimeout(() => {
          setServerState({
            status: 'success',
            data: { name: 'Admin User', role: 'admin' },
            timestamp: Date.now(),
          });
        }, 50);
      }, []);
      const user = useCogsState('user', { serverState });
      return (
        <div>
          <span data-testid="status">{user.$getStatus()}</span>
          <span data-testid="name-status">{user.name.$getStatus()}</span>
        </div>
      );
    };

    render(<AsyncWrapper />);
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('fresh')
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('synced')
    );
    expect(screen.getByTestId('name-status')).toHaveTextContent('synced');
  });
});
