import { type FormOptsType } from './CogsState';

import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { getGlobalStore } from './store';

export type ValidationWrapperProps = {
  formOpts?: FormOptsType;
  path: string[];
  stateKey: string;
  children: React.ReactNode;
  validIndices?: number[];
};
export function ValidationWrapper({
  formOpts,
  path,
  stateKey,
  children,
  validIndices,
}: ValidationWrapperProps) {
  const { getInitialOptions, getShadowMetadata } = getGlobalStore.getState();
  const thisStateOpts = getInitialOptions(stateKey!);

  // GET VALIDATION FROM SHADOW METADATA
  const shadowMeta = getShadowMetadata(stateKey!, path);
  const validationState = shadowMeta?.validation;
  const status = validationState?.status || 'PRISTINE';
  const hasError = status === 'VALIDATION_FAILED' || status === 'INVALID_LIVE';
  const message = validationState?.message;

  console.log('ValidationWrapper shadow:', {
    stateKey,
    path,
    shadowMeta,
    status,
    message,
  });

  return (
    <>
      {thisStateOpts?.formElements?.validation &&
      !formOpts?.validation?.disable ? (
        thisStateOpts.formElements!.validation!({
          children: (
            <React.Fragment key={path.toString()}>{children}</React.Fragment>
          ),
          status, // Pass status instead of active
          message: formOpts?.validation?.hideMessage
            ? ''
            : formOpts?.validation?.message || message || '',
          path: path,
          stretch: formOpts?.validation?.stretch,
        })
      ) : (
        <React.Fragment key={path.toString()}>{children}</React.Fragment>
      )}
    </>
  );
}
