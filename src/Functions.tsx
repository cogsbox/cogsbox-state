import { type FormOptsType } from './CogsState';
import React from 'react';
import { getGlobalStore, ValidationError } from './store';
import { get } from 'http';

export type ValidationWrapperProps = {
  formOpts?: FormOptsType;
  path: string[];
  stateKey: string;
  children: React.ReactNode;
};

export function ValidationWrapper({
  formOpts,
  path,
  stateKey,
  children,
}: ValidationWrapperProps) {
  const { getInitialOptions, getShadowMetadata, getShadowValue } =
    getGlobalStore.getState();
  const thisStateOpts = getInitialOptions(stateKey!);

  const shadowMeta = getShadowMetadata(stateKey!, path);
  const validationState = shadowMeta?.validation;

  const status = validationState?.status || 'NOT_VALIDATED';

  const errors = (validationState?.errors || []).map((err) => ({
    ...err,
    path: path,
  })) as ValidationError[];
  const errorMessages = errors
    .filter((err) => err.severity === 'error')
    .map((err) => err.message);
  const warningMessages = errors
    .filter((err) => err.severity === 'warning')
    .map((err) => err.message);

  // Use first error, or first warning if no errors
  const message = errorMessages[0] || warningMessages[0];

  return (
    <>
      {thisStateOpts?.formElements?.validation &&
      !formOpts?.validation?.disable ? (
        thisStateOpts.formElements!.validation!({
          children: (
            <React.Fragment key={path.toString()}>{children}</React.Fragment>
          ),
          status, // Now passes the new ValidationStatus type
          message: formOpts?.validation?.hideMessage
            ? ''
            : formOpts?.validation?.message || message || '',

          hasErrors: errorMessages.length > 0,
          hasWarnings: warningMessages.length > 0,
          allErrors: errors,
          path: path,
          getData: () => getShadowValue(stateKey!, path),
        })
      ) : (
        <React.Fragment key={path.toString()}>{children}</React.Fragment>
      )}
    </>
  );
}
