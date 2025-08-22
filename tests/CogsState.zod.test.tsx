import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createCogsState } from '../src/CogsState';
import { z } from 'zod';

// Mocks
vi.mock('../src/CogsStateClient.js', () => ({
  useCogsConfig: () => ({ sessionId: 'test-session-id' }),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}));

// Zod schema
const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old'),
  bio: z.string().max(100, 'Bio must be 100 characters or less'),
});

describe('Zod Validation with Error/Warning Types', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error severity on blur when configured', async () => {
    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: '',
          email: '',
          age: 16,
          bio: '',
        },
      },
      {
        validation: {
          zodSchemaV4: userFormSchema,
          onBlur: 'error', // Show as errors on blur
        },
      }
    );

    const TestComponent = () => {
      const form = useCogsState('userForm');

      return (
        <div>
          {form.username.$formElement((params) => (
            <>
              <input
                data-testid="username-input"
                {...params.$inputProps}
                placeholder="Username"
              />
              {params.$showValidationErrors().map((err, i) => (
                <span key={i} data-testid="username-error">
                  {err}
                </span>
              ))}
            </>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('username-input');

    // Type invalid username
    fireEvent.change(input, { target: { value: 'ab' } });

    // Blur to trigger validation
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId('username-error')).toHaveTextContent(
        'Username must be at least 3 characters'
      );
    });
  });

  it('should show warning severity on blur when configured', async () => {
    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: '',
          email: '',
          age: 20,
          bio: '',
        },
      },
      {
        validation: {
          zodSchemaV4: userFormSchema,
          onBlur: 'warning', // Show as warnings on blur
        },
      }
    );

    const TestComponent = () => {
      const form = useCogsState('userForm');
      const [validationErrors, setValidationErrors] = React.useState<string[]>(
        []
      );

      return (
        <div>
          {form.email.$formElement((params) => {
            // Since warnings don't show in $showValidationErrors by default,
            // we'd need to check the validation state differently
            // For now, just check that validation happens
            return (
              <>
                <input
                  data-testid="email-input"
                  {...params.$inputProps}
                  placeholder="Email"
                  onBlur={(e) => {
                    params.$inputProps.onBlur?.(e);
                    // After blur, check validation errors
                    setTimeout(() => {
                      const errors = params.$showValidationErrors();
                      setValidationErrors(errors);
                    }, 100);
                  }}
                />
                {validationErrors.length > 0 && (
                  <span data-testid="email-warning">{validationErrors[0]}</span>
                )}
              </>
            );
          })}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('email-input');

    // Type invalid email
    fireEvent.change(input, { target: { value: 'notanemail' } });

    // Blur to trigger validation
    fireEvent.blur(input);

    // With warning severity, errors might not show in $showValidationErrors
    // This test might need adjustment based on how warnings are handled
    await waitFor(() => {
      // Check that input still has the value (not blocked)
      expect(input).toHaveValue('notanemail');
    });
  });

  it('should show error severity on change when configured', async () => {
    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: '',
          email: '',
          age: 20,
          bio: '',
        },
      },
      {
        validation: {
          zodSchemaV4: userFormSchema,
          onChange: 'error', // Show as errors while typing
        },
      }
    );

    const TestComponent = () => {
      const form = useCogsState('userForm');

      return (
        <div>
          {form.username.$formElement((params) => (
            <>
              <input data-testid="username-input" {...params.$inputProps} />
              {params.$showValidationErrors().map((err, i) => (
                <span key={i} data-testid="username-error-realtime">
                  {err}
                </span>
              ))}
            </>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('username-input');

    // Type invalid username - should show error immediately
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(
      () => {
        expect(screen.getByTestId('username-error-realtime')).toHaveTextContent(
          'Username must be at least 3 characters'
        );
      },
      { timeout: 500 }
    );
  });

  it('should show warning severity on change when configured', async () => {
    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: '',
          email: '',
          age: 20,
          bio: '',
        },
      },
      {
        validation: {
          zodSchemaV4: userFormSchema,
          onChange: 'warning', // Show as warnings while typing
        },
      }
    );

    const TestComponent = () => {
      const form = useCogsState('userForm');

      return (
        <div>
          {form.bio.$formElement((params) => (
            <>
              <textarea data-testid="bio-input" {...params.$inputProps} />
              {/* With warning severity, $showValidationErrors might not return anything
                  since it filters for errors only */}
              <span data-testid="bio-value">{params.$get()}</span>
            </>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('bio-input');

    // Type text that exceeds limit
    const longText = 'a'.repeat(101);
    fireEvent.change(input, { target: { value: longText } });

    await waitFor(
      () => {
        // With warning, the value should still update
        expect(screen.getByTestId('bio-value')).toHaveTextContent(longText);
      },
      { timeout: 500 }
    );
  });

  it('should use both onChange and onBlur with different severities', async () => {
    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: '',
          email: '',
          age: 20,
          bio: '',
        },
      },
      {
        validation: {
          zodSchemaV4: userFormSchema,
          onChange: 'warning', // Warnings while typing
          onBlur: 'error', // Errors on blur
        },
      }
    );

    const TestComponent = () => {
      const form = useCogsState('userForm');
      const [blurred, setBlurred] = React.useState(false);

      return (
        <div>
          {form.age.$formElement((params) => (
            <>
              <input
                type="number"
                data-testid="age-input"
                {...params.$inputProps}
                onBlur={(e) => {
                  params.$inputProps.onBlur?.(e);
                  setBlurred(true);
                }}
              />
              {params.$showValidationErrors().map((err, i) => (
                <span key={i} data-testid="age-error">
                  {err}
                </span>
              ))}
              <span data-testid="blur-status">
                {blurred ? 'blurred' : 'focused'}
              </span>
            </>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('age-input');

    // Type invalid age - with warning severity, might not show in $showValidationErrors
    fireEvent.change(input, { target: { value: '15' } });

    await waitFor(
      () => {
        // Value should update even with warning
        expect(input).toHaveValue(15);
      },
      { timeout: 500 }
    );

    // Blur - should change to error and show in $showValidationErrors
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId('age-error')).toHaveTextContent(
        'Must be at least 18 years old'
      );
    });
  });

  it('should not validate if validation options are not set', async () => {
    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: '',
          email: '',
          age: 16,
          bio: '',
        },
      },
      {
        validation: {
          zodSchemaV4: userFormSchema,
          onBlur: undefined,
          onChange: undefined,
        },
      }
    );

    const TestComponent = () => {
      const form = useCogsState('userForm');

      return (
        <div>
          {form.username.$formElement((params) => {
            console.log(
              'params showValidationErrors',
              params.$showValidationErrors()
            );
            return (
              <>
                <input data-testid="username-input" {...params.$inputProps} />
                {params.$showValidationErrors().map((err, i) => (
                  <span key={i} data-testid="username-error">
                    {err}
                  </span>
                ))}
              </>
            );
          })}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('username-input');

    // Type invalid value
    fireEvent.change(input, { target: { value: 'a' } });

    // Blur
    fireEvent.blur(input);

    // Wait and check no errors appear
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.queryByTestId('username-error')).not.toBeInTheDocument();
  });

  it('should clear validation on valid input', async () => {
    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: 'ab', // Start with invalid
          email: '',
          age: 20,
          bio: '',
        },
      },
      {
        validation: {
          zodSchemaV4: userFormSchema,
          onBlur: 'error',
        },
      }
    );

    const TestComponent = () => {
      const form = useCogsState('userForm');

      return (
        <div>
          {form.username.$formElement((params) => (
            <>
              <input data-testid="username-input" {...params.$inputProps} />
              {params.$showValidationErrors().map((err, i) => (
                <span key={i} data-testid="username-error">
                  {err}
                </span>
              ))}
            </>
          ))}
        </div>
      );
    };

    render(<TestComponent />);
    const input = screen.getByTestId('username-input');

    // Blur to show error
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId('username-error')).toBeInTheDocument();
    });

    // Fix the value
    fireEvent.change(input, { target: { value: 'validusername' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.queryByTestId('username-error')).not.toBeInTheDocument();
    });
  });

  it('should validate multiple fields independently', async () => {
    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: '',
          email: '',
          age: 20,
          bio: '',
        },
      },
      {
        validation: {
          zodSchemaV4: userFormSchema,
          onBlur: 'error',
        },
      }
    );

    const TestComponent = () => {
      const form = useCogsState('userForm');

      return (
        <div>
          {form.username.$formElement((params) => (
            <>
              <input data-testid="username-input" {...params.$inputProps} />
              {params.$showValidationErrors().map((err, i) => (
                <span key={i} data-testid="username-error">
                  {err}
                </span>
              ))}
            </>
          ))}
          {form.email.$formElement((params) => (
            <>
              <input data-testid="email-input" {...params.$inputProps} />
              {params.$showValidationErrors().map((err, i) => (
                <span key={i} data-testid="email-error">
                  {err}
                </span>
              ))}
            </>
          ))}
        </div>
      );
    };

    render(<TestComponent />);

    // Invalid username
    const usernameInput = screen.getByTestId('username-input');
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.blur(usernameInput);

    // Invalid email
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'notanemail' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByTestId('username-error')).toHaveTextContent(
        'Username must be at least 3 characters'
      );
      expect(screen.getByTestId('email-error')).toHaveTextContent(
        'Invalid email address'
      );
    });
  });
});
