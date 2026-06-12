import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useEffect } from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { createCogsState } from '../src/CogsState';

// Mocks
vi.mock('../src/CogsStateClient.js', () => ({
  useCogsConfig: () => ({ sessionId: 'test-session-id' }),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}));

// Test state
const { useCogsState } = createCogsState({
  componentTestState: {
    name: 'John',
      age: 30,
      settings: {
        theme: 'dark',
        notifications: true,
      },
      tags: ['react', 'typescript'],
      users: [
        { id: 1, name: 'Alice', email: 'alice@test.com', active: true },
        { id: 2, name: 'Bob', email: 'bob@test.com', active: false },
        { id: 3, name: 'Charlie', email: 'charlie@test.com', active: true },
      ],
      nested: {
        items: [
          { value: 10, label: 'Item A' },
          { value: 20, label: 'Item B' },
        ],
      },
    },
  },
});

describe('$isolate method', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render isolated component with current state', () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');
      useEffect(() => {
        state.$revertToInitialState();
      }, []);

      return (
        <div>
          {state.name.$isolate((nameState) => (
            <span data-testid="isolated-name">{nameState.$get()}</span>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId('isolated-name')).toHaveTextContent('John');
  });

  it('should update when isolated state changes', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');
      useEffect(() => {
        state.$revertToInitialState();
      }, []);

      return (
        <div>
          {state.age.$isolate((ageState) => (
            <div>
              <span data-testid="isolated-age">{ageState.$get()}</span>
              <button onClick={() => ageState.$update(35)}>Update Age</button>
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId('isolated-age')).toHaveTextContent('30');

    fireEvent.click(screen.getByText('Update Age'));
    await waitFor(() => {
      expect(screen.getByTestId('isolated-age')).toHaveTextContent('35');
    });
  });

  it('should work with nested objects in isolate', () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');

      return (
        <div>
          {state.settings.$isolate((settings) => (
            <div data-testid="isolated-settings">
              Theme: {settings.theme.$get()}, Notifications:{' '}
              {settings.notifications.$get() ? 'on' : 'off'}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId('isolated-settings')).toHaveTextContent(
      'Theme: dark, Notifications: on'
    );
  });

  it('should work with arrays in isolate', () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');

      return (
        <div>
          {state.tags.$isolate((tags) => (
            <div data-testid="isolated-tags">
              Tags: {tags.$get().join(', ')}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId('isolated-tags')).toHaveTextContent(
      'Tags: react, typescript'
    );
  });

  it('should isolate array items and allow updates', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');

      return (
        <div>
          {state.users.$index(0).$isolate((user) => (
            <div>
              <span data-testid="user-name">{user.name.$get()}</span>
              <button onClick={() => user.name.$update('Updated Alice')}>
                Update Name
              </button>
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId('user-name')).toHaveTextContent('Alice');

    fireEvent.click(screen.getByText('Update Name'));

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent(
        'Updated Alice'
      );
    });
  });
});

describe('$formElement method', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form element with input props', () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');

      return (
        <div>
          {state.name.$formElement((params) => (
            <input data-testid="name-input" {...params.$inputProps} />
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('name-input') as HTMLInputElement;
    expect(input.value).toBe('John');
  });

  it('should update state when form input changes', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');

      return (
        <div>
          {state.name.$formElement((params) => (
            <input data-testid="name-input" {...params.$inputProps} />
          ))}
          {state.name.$isolate((nameState) => (
            <span data-testid="name-display">{nameState.$get()}</span>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('name-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Jane' } });

    await waitFor(
      () => {
        expect(screen.getByTestId('name-display')).toHaveTextContent('Jane');
      },
      { timeout: 500 }
    );
  });

  it('should work with number inputs', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');
      useEffect(() => {
        state.$revertToInitialState();
      }, []);

      return (
        <div>
          {state.age.$formElement((params) => (
            <input
              data-testid="age-input"
              type="number"
              {...params.$inputProps}
            />
          ))}
          {state.age.$isolate((ageState) => (
            <span data-testid="age-display">{ageState.$get()}</span>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('age-input') as HTMLInputElement;
    expect(input.value).toBe('30');

    fireEvent.change(input, { target: { value: '25' } });

    await waitFor(
      () => {
        expect(screen.getByTestId('age-display')).toHaveTextContent('25');
      },
      { timeout: 500 }
    );
  });

  it('should work with boolean checkbox inputs', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');

      return (
        <div>
          {state.settings.notifications.$formElement((params) => (
            <input
              data-testid="notifications-checkbox"
              type="checkbox"
              checked={params.$get()}
              onChange={() => params.$toggle()}
            />
          ))}
          {state.settings.notifications.$isolate((notifState) => (
            <span data-testid="notif-display">
              {notifState.$get() ? 'on' : 'off'}
            </span>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const checkbox = screen.getByTestId(
      'notifications-checkbox'
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByTestId('notif-display')).toHaveTextContent('off');
    });
  });

  it('should handle debounce time option', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');
      useEffect(() => {
        state.$revertToInitialState();
      }, []);

      return (
        <div>
          {state.name.$formElement(
            (params) => (
              <input data-testid="debounced-input" {...params.$inputProps} />
            ),
            { debounceTime: 100 }
          )}
          {state.name.$isolate((nameState) => (
            <span data-testid="display">{nameState.$get()}</span>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('debounced-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Quick' } });

    // Check immediately - should still be old value
    expect(screen.getByTestId('display')).toHaveTextContent('John');

    // Wait for debounce
    await waitFor(
      () => {
        expect(screen.getByTestId('display')).toHaveTextContent('Quick');
      },
      { timeout: 200 }
    );
  });

  it('should work with nested form elements', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');
      useEffect(() => {
        state.$revertToInitialState();
      }, []);

      return (
        <div>
          {state.settings.theme.$formElement((params) => (
            <select data-testid="theme-select" {...params.$inputProps}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          ))}
          {state.settings.theme.$isolate((themeState) => (
            <span data-testid="theme-display">{themeState.$get()}</span>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const select = screen.getByTestId('theme-select') as HTMLSelectElement;
    expect(select.value).toBe('dark');

    fireEvent.change(select, { target: { value: 'light' } });

    await waitFor(
      () => {
        expect(screen.getByTestId('theme-display')).toHaveTextContent('light');
      },
      { timeout: 500 }
    );
  });

  it('should work with array item form elements', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');
      useEffect(() => {
        state.$revertToInitialState();
      }, []);

      return (
        <div>
          {state.users.$index(1).email.$formElement((params) => (
            <input data-testid="email-input" {...params.$inputProps} />
          ))}
          {state.users.$index(1).email.$isolate((emailState) => (
            <span data-testid="email-display">{emailState.$get()}</span>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('email-input') as HTMLInputElement;
    expect(input.value).toBe('bob@test.com');

    fireEvent.change(input, { target: { value: 'robert@test.com' } });

    await waitFor(
      () => {
        expect(screen.getByTestId('email-display')).toHaveTextContent(
          'robert@test.com'
        );
      },
      { timeout: 500 }
    );
  });
});

describe('$isolate and $formElement interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update isolated component when form element changes', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');
      useEffect(() => {
        state.$revertToInitialState();
      }, []);

      return (
        <div>
          {state.name.$formElement((params) => (
            <input data-testid="form-input" {...params.$inputProps} />
          ))}
          {state.name.$isolate((nameState) => (
            <div data-testid="isolated-display">Name: {nameState.$get()}</div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId('isolated-display')).toHaveTextContent(
      'Name: John'
    );

    const input = screen.getByTestId('form-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Updated' } });

    await waitFor(
      () => {
        expect(screen.getByTestId('isolated-display')).toHaveTextContent(
          'Name: Updated'
        );
      },
      { timeout: 500 }
    );
  });

  it('should handle cross-array updates correctly', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');
      useEffect(() => {
        state.$revertToInitialState();
      }, []);

      return (
        <div>
          {state.users.$index(0).name.$formElement((params) => (
            <input data-testid="user0-input" {...params.$inputProps} />
          ))}

          {state.users.$index(1).$isolate((user) => (
            <div data-testid="user1-display">User 2: {user.name.$get()}</div>
          ))}

          <button
            data-testid="swap-button"
            onClick={() => {
              const name0 = state.users.$index(0).name.$get();
              const name1 = state.users.$index(1).name.$get();
              state.users.$index(0).name.$update(name1);
              state.users.$index(1).name.$update(name0);
            }}
          >
            Swap Names
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByTestId('swap-button'));

    await waitFor(() => {
      const input = screen.getByTestId('user0-input') as HTMLInputElement;
      expect(input.value).toBe('Bob');
      expect(screen.getByTestId('user1-display')).toHaveTextContent(
        'User 2: Alice'
      );
    });
  });
  it('should re-render parent when $cutThis is called on a list item', async () => {
    const parentRenderCount = { value: 0 };

    const TestComponent = () => {
      const state = useCogsState('componentTestState');
      parentRenderCount.value++;

      useEffect(() => {
        state.$revertToInitialState();
      }, []);

      return (
        <div>
          <div data-testid="user-count">{state.users.$get().length}</div>
          <div data-testid="parent-render-count">{parentRenderCount.value}</div>
          {state.users.$list((user, index) => (
            <div key={index} data-testid="user-row">
              <span data-testid={`user-name-${index}`}>{user.name.$get()}</span>
              <button
                data-testid={`delete-user-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  user.$cutThis();
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);

    // Verify initial state - should have 3 users (Alice, Bob, Charlie based on existing tests)
    await waitFor(() => {
      expect(screen.getAllByTestId('user-row')).toHaveLength(3);
    });

    expect(screen.getByTestId('user-count')).toHaveTextContent('3');
    expect(screen.getByTestId('user-name-0')).toHaveTextContent('Alice');

    const initialParentRenders = parentRenderCount.value;

    // Delete the first user (Alice)
    fireEvent.click(screen.getByTestId('delete-user-0'));

    // Wait for the parent to re-render and update the list
    await waitFor(
      () => {
        // The row count should decrease to 2
        expect(screen.getAllByTestId('user-row')).toHaveLength(2);
      },
      { timeout: 1000 }
    );

    // Verify the count updates
    expect(screen.getByTestId('user-count')).toHaveTextContent('2');

    // The first user should now be what was previously the second user (Bob)
    expect(screen.getByTestId('user-name-0')).toHaveTextContent('Bob');

    // Parent component should have re-rendered
    expect(parentRenderCount.value).toBeGreaterThan(initialParentRenders);
  });

  it('should handle $cutThis with filtered lists correctly', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');

      useEffect(() => {
        state.$revertToInitialState();
      }, []);

      // Filter to only active users
      const activeUsers = state.users.$filter((u) => u.active);

      return (
        <div>
          <div data-testid="active-count">{activeUsers.$get().length}</div>
          <div data-testid="total-count">{state.users.$get().length}</div>
          {activeUsers.$list((user, index) => (
            <div key={index} data-testid="active-user-row">
              <span data-testid={`active-user-name-${index}`}>
                {user.name.$get()}
              </span>
              <button
                data-testid={`delete-active-user-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  user.$cutThis();
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);

    // Initial state: Alice (active), Bob (inactive), Charlie (active)
    // So active users should be Alice and Charlie
    await waitFor(() => {
      expect(screen.getAllByTestId('active-user-row')).toHaveLength(2);
    });

    expect(screen.getByTestId('active-count')).toHaveTextContent('2');
    expect(screen.getByTestId('total-count')).toHaveTextContent('3');
    expect(screen.getByTestId('active-user-name-0')).toHaveTextContent('Alice');

    // Delete Alice (first active user)
    fireEvent.click(screen.getByTestId('delete-active-user-0'));

    // Wait for updates
    await waitFor(
      () => {
        expect(screen.getAllByTestId('active-user-row')).toHaveLength(1);
      },
      { timeout: 1000 }
    );

    // Counts should update
    expect(screen.getByTestId('active-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total-count')).toHaveTextContent('2');

    // Charlie should now be the first (and only) active user
    expect(screen.getByTestId('active-user-name-0')).toHaveTextContent(
      'Charlie'
    );
  });

  it('should handle deeply nested array updates', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');

      return (
        <div>
          {state.nested.items.$index(0).value.$formElement((params) => (
            <input
              data-testid="nested-input"
              type="number"
              {...params.$inputProps}
            />
          ))}
          {state.nested.items.$index(0).$isolate((item) => (
            <div data-testid="nested-display">
              {item.label.$get()}: {item.value.$get()}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId('nested-display')).toHaveTextContent(
      'Item A: 10'
    );

    const input = screen.getByTestId('nested-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15' } });

    await waitFor(
      () => {
        expect(screen.getByTestId('nested-display')).toHaveTextContent(
          'Item A: 15'
        );
      },
      { timeout: 500 }
    );
  });

  it('should maintain reactivity after array operations', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');

      return (
        <div>
          <button
            onClick={() => {
              state.tags.$insert('vue');
            }}
          >
            Add Tag
          </button>

          {state.tags.$isolate((tags) => (
            <div data-testid="tags-count">Count: {tags.$get().length}</div>
          ))}

          {state.tags.$list((tag, index) => (
            <div key={index}>
              {tag.$formElement((params) => (
                <input
                  data-testid={`tag-input-${index}`}
                  {...params.$inputProps}
                />
              ))}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId('tags-count')).toHaveTextContent('Count: 2');

    fireEvent.click(screen.getByText('Add Tag'));

    await waitFor(() => {
      expect(screen.getByTestId('tags-count')).toHaveTextContent('Count: 3');
      expect(screen.getByTestId('tag-input-2')).toHaveValue('vue');
    });
  });
  describe('$isolate with explicit dependencies (Overload)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should only re-render when specified dependencies change, ignoring unrelated siblings', async () => {
      const renderMonitor = vi.fn();

      const TestComponent = () => {
        const state = useCogsState('componentTestState');

        useEffect(() => {
          state.$revertToInitialState();
        }, []);

        return (
          <div>
            {state.$isolate([state.name], (proxy) => {
              renderMonitor();
              return (
                <span data-testid="iso-name-explicit">{proxy.name.$get()}</span>
              );
            })}

            <button
              data-testid="btn-update-name"
              onClick={() => state.name.$update('Updated Name')}
            >
              Update Name
            </button>

            <button
              data-testid="btn-update-email"
              onClick={() =>
                state.users.$index(0).email.$update('new@test.com')
              }
            >
              Update Email
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      // Wait longer for ALL effects including $revertToInitialState to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Clear after everything has settled
      renderMonitor.mockClear();

      // --- PHASE 1: Update Unrelated Sibling (Email) ---
      await act(async () => {
        fireEvent.click(screen.getByTestId('btn-update-email'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // ASSERT: Monitor should NOT have been called because we only subscribed to [name]
      expect(renderMonitor).not.toHaveBeenCalled();

      // --- PHASE 2: Update Dependency (Name) ---
      await act(async () => {
        fireEvent.click(screen.getByTestId('btn-update-name'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('iso-name-explicit')).toHaveTextContent(
          'Updated Name'
        );
      });

      // ASSERT: Monitor SHOULD have been called
      expect(renderMonitor).toHaveBeenCalled();
    });
  });
});
