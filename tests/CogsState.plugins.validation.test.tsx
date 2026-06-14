import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  renderHook,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createCogsState } from '../src/CogsState';
import { createPluginContext } from '../src/plugins';
import { PluginRunner } from '../src/PluginRunner';
import { pluginStore } from '../src/pluginStore';
import { getGlobalStore, shadowStateStore } from '../src/store';
import { z } from 'zod';

vi.mock('../src/CogsStateClient.js', () => ({
  useCogsConfig: () => ({ sessionId: 'test-session-id' }),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}));

const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
});

function createValidatorPlugin() {
  const { createPlugin } = createPluginContext({
    options: z.object({
      schema: z.custom<typeof userFormSchema>(),
    }),
  });

  return createPlugin('validator').onFormUpdate((params) => {
    if (params.event.activityType !== 'blur') return;

    const fieldName = params.event.path.at(-1);
    if (!fieldName) return;

    const result = params.options.schema.safeParse(params.getState());

    if (!result.success) {
      const errors = result.error.issues
        .filter((issue) => String(issue.path[0]) === fieldName)
        .map((issue) => ({
          path: issue.path.map(String),
          message: issue.message,
          code: issue.code,
        }));

      if (errors.length > 0) {
        params.addZodErrors(errors);
      }
    }
  });
}

function createShapeStylePlugin() {
  const { createPlugin } = createPluginContext({
    options: z.object({
      schema: z.custom<typeof userFormSchema>(),
      fieldToGroup: z.record(z.string(), z.array(z.string())),
      groups: z.record(
        z.string(),
        z.object({
          deps: z.array(z.string()),
        })
      ),
    }),
  });

  return createPlugin('shapeValidator').onFormUpdate((params) => {
    if (params.event.activityType !== 'blur') return;

    const fieldName = params.event.path.at(-1);
    if (!fieldName) return;

    const { schema, fieldToGroup, groups } = params.options;

    const affectedGroups = fieldToGroup[fieldName] ?? [];
    const relatedFields = new Set<string>();
    for (const groupName of affectedGroups) {
      for (const dep of groups[groupName]?.deps ?? []) {
        relatedFields.add(dep);
      }
    }

    const result = schema.safeParse(params.getState());
    if (!result.success) {
      const errors = result.error.issues
        .filter((issue) => {
          const issueField = String(issue.path[0]);
          return issueField === fieldName || relatedFields.has(issueField);
        })
        .map((issue) => ({
          path: issue.path.map(String),
          message: issue.message,
          code: issue.code,
        }));

      if (errors.length > 0) {
        params.addZodErrors(errors);
      }
    }
  });
}

describe('Plugin onFormUpdate validation', () => {
  beforeEach(() => {
    pluginStore.getState().registeredPlugins = [];
    pluginStore.getState().pluginOptions.clear();
    pluginStore.getState().stateHandlers.clear();
    pluginStore.getState().updateSubscribers.clear();
    pluginStore.getState().formUpdateSubscribers.clear();
    shadowStateStore.clear();
  });

  it('should pass expected params to $formElement and formElements.validation', async () => {
    const formElementSnapshots: Array<{
      hasErrors: unknown;
      hasWarnings: unknown;
      message: unknown;
      status: unknown;
      severity: unknown;
      allErrorsCount: number;
      data: unknown;
      validationErrors: string[];
    }> = [];

    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: '',
        },
      },
      {
        validation: {
          zodSchemaV4: z.object({
            username: z
              .string()
              .min(3, 'Username must be at least 3 characters'),
          }),
          onBlur: 'error',
        },
        formElements: {
          validation: ({
            children,
            hasErrors,
            hasWarnings,
            message,
            path,
          }) => {
            return (
              <div
                data-testid="validation-wrapper"
                data-has-errors={String(hasErrors)}
                data-has-warnings={String(hasWarnings)}
                data-message={message ?? ''}
                data-path={path.join('.')}
              >
                {children}
              </div>
            );
          },
        },
      }
    );

    function TestComponent() {
      const form = useCogsState('userForm');

      return (
        <div>
          {form.username.$formElement((params) => {
            formElementSnapshots.push({
              hasErrors: params.hasErrors,
              hasWarnings: params.hasWarnings,
              message: params.message,
              status: params.status,
              severity: params.severity,
              allErrorsCount: params.allErrors.length,
              data: params.getData(),
              validationErrors: params.$showValidationErrors(),
            });

            return (
              <input data-testid="username-input" {...params.$inputProps} />
            );
          })}
        </div>
      );
    }

    render(<TestComponent />);

    expect(screen.getByTestId('validation-wrapper')).toHaveAttribute(
      'data-has-errors',
      'false'
    );
    expect(screen.getByTestId('validation-wrapper')).toHaveAttribute(
      'data-has-warnings',
      'false'
    );
    expect(formElementSnapshots.at(-1)).toMatchObject({
      hasErrors: false,
      hasWarnings: false,
      message: '',
      status: 'NOT_VALIDATED',
      severity: undefined,
      allErrorsCount: 0,
      data: '',
      validationErrors: [],
    });

    const input = screen.getByTestId('username-input');
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId('validation-wrapper')).toHaveAttribute(
        'data-has-errors',
        'true'
      );
      expect(screen.getByTestId('validation-wrapper')).toHaveAttribute(
        'data-message',
        'Username must be at least 3 characters'
      );
    });

    expect(formElementSnapshots.at(-1)).toMatchObject({
      hasErrors: true,
      hasWarnings: false,
      message: 'Username must be at least 3 characters',
      status: 'INVALID',
      severity: 'error',
      allErrorsCount: 1,
      data: 'ab',
      validationErrors: ['Username must be at least 3 characters'],
    });
  });

  it('should surface plugin validation errors in formElements.validation on blur', async () => {
    const validatorPlugin = createValidatorPlugin();

    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: '',
          email: '',
        },
      },
      {
        plugins: [validatorPlugin],
        formElements: {
          validation: ({ children, hasErrors, message }) => (
            <div>
              {children}
              {hasErrors && message && (
                <span data-testid="field-validation-message">{message}</span>
              )}
            </div>
          ),
        },
      }
    );

    function TestComponent() {
      const form = useCogsState('userForm', {
        validator: { schema: userFormSchema },
      });

      return (
        <div>
          {form.username.$formElement((params) => (
            <input data-testid="username-input" {...params.$inputProps} />
          ))}
        </div>
      );
    }

    render(
      <PluginRunner>
        <TestComponent />
      </PluginRunner>
    );

    const input = screen.getByTestId('username-input');
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId('field-validation-message')).toHaveTextContent(
        'Username must be at least 3 characters'
      );
    });
  });

  it('should surface plugin validation errors via $showValidationErrors on blur', async () => {
    const validatorPlugin = createValidatorPlugin();

    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: '',
          email: '',
        },
      },
      { plugins: [validatorPlugin] }
    );

    function TestComponent() {
      const form = useCogsState('userForm', {
        validator: { schema: userFormSchema },
      });

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
    }

    render(
      <PluginRunner>
        <TestComponent />
      </PluginRunner>
    );

    const input = screen.getByTestId('username-input');
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId('username-error')).toHaveTextContent(
        'Username must be at least 3 characters'
      );
    });
  });

  it('should surface related field errors for shape-style plugins on blur', async () => {
    const shapePlugin = createShapeStylePlugin();

    const { useCogsState } = createCogsState(
      {
        userForm: {
          username: '',
          email: 'not-an-email',
        },
      },
      {
        plugins: [shapePlugin],
        formElements: {
          validation: ({ children, hasErrors, message }) => (
            <div>
              {children}
              {hasErrors && message && (
                <span data-testid="field-validation-message">{message}</span>
              )}
            </div>
          ),
        },
      }
    );

    function TestComponent() {
      const form = useCogsState('userForm', {
        shapeValidator: {
          schema: userFormSchema,
          fieldToGroup: {
            username: ['credentials'],
            email: ['credentials'],
          },
          groups: {
            credentials: { deps: ['username', 'email'] },
          },
        },
      });

      return (
        <div>
          {form.username.$formElement((params) => (
            <input data-testid="username-input" {...params.$inputProps} />
          ))}
          {form.email.$formElement((params) => (
            <input data-testid="email-input" {...params.$inputProps} />
          ))}
        </div>
      );
    }

    render(
      <PluginRunner>
        <TestComponent />
      </PluginRunner>
    );

    fireEvent.blur(screen.getByTestId('username-input'));

    await waitFor(() => {
      const messages = screen.getAllByTestId('field-validation-message');
      expect(messages.length).toBeGreaterThanOrEqual(2);
      expect(
        messages.some((el) =>
          el.textContent?.includes('Username must be at least 3 characters')
        )
      ).toBe(true);
      expect(
        messages.some((el) => el.textContent?.includes('Invalid email address'))
      ).toBe(true);
    });
  });

  it('should work when formElements are set via setCogsOptionsByKey', async () => {
    const validatorPlugin = createValidatorPlugin();

    const { useCogsState, setCogsOptionsByKey } = createCogsState(
      {
        userForm: {
          username: '',
          email: '',
        },
      },
      { plugins: [validatorPlugin] }
    );

    setCogsOptionsByKey('userForm', {
      formElements: {
        validation: ({ children, hasErrors, message }) => (
          <div>
            {children}
            {hasErrors && message && (
              <span data-testid="field-validation-message">{message}</span>
            )}
          </div>
        ),
      },
    });

    function TestComponent() {
      const form = useCogsState('userForm', {
        validator: { schema: userFormSchema },
      });

      return (
        <div>
          {form.username.$formElement((params) => (
            <input data-testid="username-input" {...params.$inputProps} />
          ))}
        </div>
      );
    }

    render(
      <PluginRunner>
        <TestComponent />
      </PluginRunner>
    );

    const input = screen.getByTestId('username-input');
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId('field-validation-message')).toHaveTextContent(
        'Username must be at least 3 characters'
      );
    });
  });

  it('should work with baked-in shape box + setCogsOptionsByKey formElements only', async () => {
    type ShapeRefineInfo = {
      fieldToGroup: Record<string, number[]>;
      groups: { deps: string[] | null }[];
    };

    const tradingRulesFormSchema = z.object({
      ruleName: z.string().min(3, 'Rule name must be at least 3 characters'),
      enabled: z.boolean(),
    });

    type TradingRulesForm = z.infer<typeof tradingRulesFormSchema>;

    type ShapeSchemaBoxEntry<TDefaults> = {
      generateDefaults: () => TDefaults;
      schemas: { client: z.ZodTypeAny };
      refineInfo?: ShapeRefineInfo;
    };

    type ShapeSchemaBox = Record<string, ShapeSchemaBoxEntry<TradingRulesForm>>;

    const journalSchemaBox: ShapeSchemaBox = {
      tradingRulesForm: {
        generateDefaults: () => ({ ruleName: '', enabled: false }),
        schemas: { client: tradingRulesFormSchema },
      },
    };

    const { createPlugin } = createPluginContext({
      options: z.object({ logs: z.boolean().optional() }),
    });

    const shapePlugin = createPlugin('shape')
      .initialState(() => ({
        tradingRulesForm: journalSchemaBox.tradingRulesForm!.generateDefaults(),
      }))
      .onFormUpdate((params) => {
        const entry = journalSchemaBox[params.stateKey];
        const clientSchema = entry?.schemas.client;
        if (!entry || !clientSchema || params.event.activityType !== 'blur') {
          return;
        }

        const field = params.event.path.at(-1);
        if (!field) return;

        const result = clientSchema.safeParse(params.getState());
        if (result.success) return;

        const related = new Set<string>([field]);
        for (const index of entry.refineInfo?.fieldToGroup[field] ?? []) {
          for (const dep of entry.refineInfo?.groups[index]?.deps ?? []) {
            related.add(dep);
          }
        }

        const issues = result.error.issues.filter((issue) =>
          related.has(String(issue.path[0]))
        );

        if (issues.length > 0) {
          params.addZodErrors(
            issues.map((issue) => ({
              path: issue.path.map(String),
              message: issue.message,
              code: issue.code,
            }))
          );
        }
      });

    const { useCogsState, setCogsOptionsByKey } = createCogsState(
      {},
      { plugins: [shapePlugin] }
    );

    setCogsOptionsByKey('tradingRulesForm', {
      formElements: {
        validation: ({ children, hasErrors, hasWarnings, message }) => (
          <div>
            {children}
            {(hasErrors || hasWarnings) && message && (
              <span data-testid="field-validation-message">{message}</span>
            )}
          </div>
        ),
      },
    });

    function TestComponent() {
      const form = useCogsState('tradingRulesForm');

      return (
        <div>
          {form.ruleName.$formElement((params) => (
            <input data-testid="rule-name-input" {...params.$inputProps} />
          ))}
        </div>
      );
    }

    render(
      <PluginRunner>
        <TestComponent />
      </PluginRunner>
    );

    const input = screen.getByTestId('rule-name-input');
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId('field-validation-message')).toHaveTextContent(
        'Rule name must be at least 3 characters'
      );
    });
  });

  it('should run shape onFormUpdate without useCogsState plugin options', async () => {
    const { createPlugin } = createPluginContext({
      options: z.object({}),
    });

    let blurCount = 0;
    const shapePlugin = createPlugin('shape')
      .initialState(() => ({ tradingRulesForm: { ruleName: '' } }))
      .onFormUpdate(() => {
        blurCount += 1;
      });

    const { useCogsState } = createCogsState({}, { plugins: [shapePlugin] });

    function TestComponent() {
      const form = useCogsState('tradingRulesForm');
      return (
        <div>
          {form.ruleName.$formElement((params) => (
            <input data-testid="rule-name-input" {...params.$inputProps} />
          ))}
        </div>
      );
    }

    render(
      <PluginRunner>
        <TestComponent />
      </PluginRunner>
    );

    fireEvent.blur(screen.getByTestId('rule-name-input'));

    await waitFor(() => {
      expect(blurCount).toBe(1);
    });
  });

  it('should coerce nested nullable number inputs when plugin wires schema via transformState setOptions', async () => {
    const tradingRulesSchema = z.object({
      rules: z.object({
        positionSizeRangeMin: z.number().nullable(),
        positionSizeRangeMax: z.number().nullable(),
      }),
    });

    type TradingRulesForm = z.infer<typeof tradingRulesSchema>;

    type ShapeSchemaBoxEntry<TDefaults> = {
      generateDefaults: () => TDefaults;
      schemas: { client: z.ZodTypeAny };
    };

    const journalSchemaBox: Record<
      string,
      ShapeSchemaBoxEntry<TradingRulesForm>
    > = {
      tradingRulesForm: {
        generateDefaults: () => ({
          rules: {
            positionSizeRangeMin: null,
            positionSizeRangeMax: null,
          },
        }),
        schemas: { client: tradingRulesSchema },
      },
    };

    const { createPlugin } = createPluginContext({
      options: z.object({ logs: z.boolean().optional() }),
    });

    const shapePlugin = createPlugin('shape')
      .initialState(() => ({
        tradingRulesForm: journalSchemaBox.tradingRulesForm!.generateDefaults(),
      }))
      .transformState((params) => {
        const entry = journalSchemaBox[params.stateKey];
        if (!entry) return;
        params.setOptions({
          validation: {
            zodSchemaV4: entry.schemas.client,
            onBlur: 'error',
          },
        });
      });

    const { useCogsState } = createCogsState({}, { plugins: [shapePlugin] });

    function TestComponent() {
      const form = useCogsState('tradingRulesForm');

      return (
        <div>
          {form.rules.positionSizeRangeMin.$formElement((params) => (
            <input
              type="number"
              data-testid="min-input"
              {...params.$inputProps}
              value={params.$inputProps.value ?? ''}
            />
          ))}
          <span data-testid="min-value">
            {String(form.rules.positionSizeRangeMin.$get())}
          </span>
          <span data-testid="min-type">
            {typeof form.rules.positionSizeRangeMin.$get()}
          </span>
        </div>
      );
    }

    render(
      <PluginRunner>
        <TestComponent />
      </PluginRunner>
    );

    await waitFor(() => {
      expect(
        getGlobalStore.getState().getInitialOptions('tradingRulesForm')
          ?.validation?.zodSchemaV4
      ).toBeTruthy();
      const node = getGlobalStore
        .getState()
        .getShadowNode('tradingRulesForm', ['rules', 'positionSizeRangeMin']);
      expect(node?._meta?.typeInfo?.type).toBe('number');
    });

    const input = screen.getByTestId('min-input');
    fireEvent.change(input, { target: { value: '12' } });

    await waitFor(() => {
      expect(screen.getByTestId('min-value')).toHaveTextContent('12');
      expect(screen.getByTestId('min-type')).toHaveTextContent('number');
    });

    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId('min-type')).toHaveTextContent('number');
      expect(screen.getByTestId('min-value')).toHaveTextContent('12');
    });
  });

  it('should accept optional plugin options like { logs: true } or omit them', () => {
    const { createPlugin } = createPluginContext({
      options: z.object({
        logs: z.boolean().optional(),
      }),
    });

    const logsPlugin = createPlugin('shape').onFormUpdate(() => {});

    const { useCogsState } = createCogsState(
      { tradingRulesForm: { ruleName: '' } },
      { plugins: [logsPlugin] }
    );

    renderHook(() => useCogsState('tradingRulesForm'));
    renderHook(() =>
      useCogsState('tradingRulesForm', { shape: { logs: true } })
    );
    renderHook(() => useCogsState('tradingRulesForm', { shape: {} }));
  });

  it('keeps plugin refine errors after field-level blur validation passes', async () => {
    const rangeSchema = z
      .object({
        min: z.number(),
        max: z.number(),
      })
      .superRefine((row, ctx) => {
        if (row.min >= row.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Max must be > min',
            path: ['max'],
          });
        }
      });

    const { createPlugin } = createPluginContext({
      options: z.object({
        schema: z.custom<typeof rangeSchema>(),
        fieldToGroup: z.record(z.string(), z.array(z.string())),
        groups: z.record(z.string(), z.object({ deps: z.array(z.string()) })),
      }),
    });

    const shapePlugin = createPlugin('shapeValidator').onFormUpdate(
      (params) => {
        if (params.event.activityType !== 'blur') return;

        const fieldName = params.event.path.at(-1);
        if (!fieldName) return;

        const { schema, fieldToGroup, groups } = params.options;
        const related = new Set<string>([fieldName]);
        for (const groupName of fieldToGroup[fieldName] ?? []) {
          for (const dep of groups[groupName]?.deps ?? []) {
            related.add(dep);
          }
        }

        const result = schema.safeParse(params.getState());
        const relatedPaths = [...related].map((name) => [
          ...params.event.path.slice(0, -1),
          name,
        ]);

        if (result.success) {
          params.clearZodErrors(relatedPaths);
          return;
        }

        const issues = result.error.issues.filter((issue) =>
          related.has(String(issue.path.at(-1)))
        );
        const mapped = issues.map((issue) => ({
          path: issue.path.map(String),
          message: issue.message,
          code: issue.code,
        }));
        const active = new Set(mapped.map((e) => e.path.join('\0')));
        params.clearZodErrors(
          relatedPaths.filter((p) => !active.has(p.join('\0')))
        );
        if (mapped.length > 0) params.addZodErrors(mapped);
      }
    );

    const { useCogsState } = createCogsState(
      { rangeForm: { min: 10, max: 1 } },
      {
        plugins: [shapePlugin],
        formElements: {
          validation: ({ children, hasErrors, message }) => (
            <div>
              {children}
              {hasErrors && message && (
                <span data-testid="field-validation-message">{message}</span>
              )}
            </div>
          ),
        },
        validation: {
          zodSchemaV4: rangeSchema,
          onBlur: 'error',
        },
      }
    );

    function TestComponent() {
      const form = useCogsState('rangeForm', {
        shapeValidator: {
          schema: rangeSchema,
          fieldToGroup: { min: ['range'], max: ['range'] },
          groups: { range: { deps: ['min', 'max'] } },
        },
      });

      return (
        <div>
          {form.min.$formElement((params) => (
            <input data-testid="min-input" {...params.$inputProps} />
          ))}
          {form.max.$formElement((params) => (
            <input data-testid="max-input" {...params.$inputProps} />
          ))}
        </div>
      );
    }

    render(
      <PluginRunner>
        <TestComponent />
      </PluginRunner>
    );

    fireEvent.blur(screen.getByTestId('max-input'));

    await waitFor(() => {
      expect(screen.getByTestId('field-validation-message')).toHaveTextContent(
        'Max must be > min'
      );
    });
  });
});
