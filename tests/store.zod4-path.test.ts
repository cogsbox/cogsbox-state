import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  buildShadowNode,
  getGlobalStore,
  shadowStateStore,
  updateShadowTypeInfo,
} from '../src/store';

const tradingRulesSchema = z.object({
  rules: z.object({
    positionSizeRangeMin: z.number().nullable(),
    positionSizeRangeMax: z.number().nullable(),
  }),
});

describe('Zod 4 nested schema paths', () => {
  it('should apply number typeInfo to nested nullable fields', () => {
    shadowStateStore.clear();

    const initialState = {
      rules: {
        positionSizeRangeMin: null,
        positionSizeRangeMax: null,
      },
    };

    shadowStateStore.set(
      'tradingRulesForm',
      buildShadowNode('tradingRulesForm', initialState)
    );

    updateShadowTypeInfo('tradingRulesForm', tradingRulesSchema, 'zod4');

    const minNode = shadowStateStore.get('tradingRulesForm')?.rules
      ?.positionSizeRangeMin as { _meta?: { typeInfo?: { type?: string } } };

    expect(minNode?._meta?.typeInfo?.type).toBe('number');
  });

  it('should keep nested number typeInfo after initializeShadowState when schema is in options', () => {
    shadowStateStore.clear();

    const initialState = {
      rules: {
        positionSizeRangeMin: null,
        positionSizeRangeMax: null,
      },
    };

    shadowStateStore.set(
      'tradingRulesForm',
      buildShadowNode('tradingRulesForm', initialState)
    );
    updateShadowTypeInfo('tradingRulesForm', tradingRulesSchema, 'zod4');

    getGlobalStore.getState().setInitialStateOptions('tradingRulesForm', {
      validation: {
        zodSchemaV4: tradingRulesSchema,
        onBlur: 'error',
      },
    });

    getGlobalStore
      .getState()
      .initializeShadowState('tradingRulesForm', initialState);

    const minNode = getGlobalStore
      .getState()
      .getShadowNode('tradingRulesForm', ['rules', 'positionSizeRangeMin']);

    expect(minNode?._meta?.typeInfo?.type).toBe('number');
  });
});
