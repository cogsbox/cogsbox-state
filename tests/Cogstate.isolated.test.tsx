import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    initialState: {
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

  it('should work with filtered arrays in both isolate and formElement', async () => {
    const TestComponent = () => {
      const state = useCogsState('componentTestState');
      useEffect(() => {
        state.$revertToInitialState();
      }, []);

      const activeUsers = state.users.$stateFilter((u) => u.active);

      return (
        <div>
          {activeUsers.$stateList((user, index) => (
            <div key={index}>
              {user.name.$formElement((params) => (
                <input
                  data-testid={`active-user-${index}`}
                  {...params.$inputProps}
                />
              ))}
              {user.$isolate((u) => (
                <span data-testid={`active-display-${index}`}>
                  Active: {u.active.$get() ? 'Yes' : 'No'}
                </span>
              ))}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('active-user-0')).toHaveValue('Alice');
    expect(screen.getByTestId('active-user-1')).toHaveValue('Charlie');
    expect(screen.queryByTestId('active-user-2')).not.toBeInTheDocument();

    const input = screen.getByTestId('active-user-0') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Alicia' } });

    await waitFor(
      () => {
        expect(input.value).toBe('Alicia');
      },
      { timeout: 500 }
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

          {state.tags.$stateList((tag, index) => (
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
});
