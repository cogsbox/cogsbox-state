// in utils.ts

import { UpdateTypeDetail } from './CogsState'; // Adjust path as needed
import { getGlobalStore } from './store';
import { isDeepEqual } from './utility';
import { ZodType } from 'zod';

/**
 * THIS IS THE CORRECTED FUNCTION.
 */
export function runValidation(
  operation: UpdateTypeDetail,
  trigger: 'onBlur' | 'onChange' | 'programmatic'
) {
  const {
    getInitialOptions,
    getShadowMetadata,
    setShadowMetadata,
    notifyPathSubscribers,
  } = getGlobalStore.getState();
  const { stateKey, path, newValue, updateType } = operation;

  if (updateType !== 'update') {
    return;
  }

  const validationOptions = getInitialOptions(stateKey)?.validation;
  if (!validationOptions) return;

  const currentMeta = getShadowMetadata(stateKey, path) || {};
  const fieldSchema = currentMeta.typeInfo?.schema as ZodType | undefined;
  const currentStatus = currentMeta.validation?.status;

  let shouldValidate = false;
  let severity: 'error' | 'warning' = 'error';

  if (trigger === 'onBlur' && validationOptions.onBlur) {
    shouldValidate = true;
    severity = validationOptions.onBlur;
  } else if (trigger === 'onChange' && validationOptions.onChange) {
    shouldValidate = true;
    severity = validationOptions.onChange;
  } else if (trigger === 'onChange' && currentStatus === 'INVALID') {
    shouldValidate = true;
    severity = 'warning';
  } else if (trigger === 'programmatic') {
    if (validationOptions.onBlur || validationOptions.onChange) {
      shouldValidate = true;

      severity =
        validationOptions.onBlur || validationOptions.onChange || 'error';
    }
  }

  if (!shouldValidate || !fieldSchema) {
    return;
  }

  // The rest of the function is the same.
  const result = fieldSchema.safeParse(newValue);
  const newValidationState = {
    status: result.success ? 'VALID' : 'INVALID',
    errors: result.success
      ? []
      : [
          {
            source: 'client',
            message: result.error.issues[0]?.message || 'Invalid value',
            severity: severity,
          },
        ],
    lastValidated: Date.now(),
  };

  if (!isDeepEqual(currentMeta.validation, newValidationState)) {
    setShadowMetadata(stateKey, path, {
      ...currentMeta,
      validation: newValidationState,
    });
    notifyPathSubscribers([stateKey, ...path].join('.'), {
      type: 'VALIDATION_UPDATE',
    });
  }
}
