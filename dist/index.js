import { $cogsSignal as r, addStateOptions as o, createCogsState as n, createCogsStateFromSync as s, notifyComponent as a, useCogsStateFn as f } from "./CogsState.jsx";
import { CogsStateClient as i, config as c, useCogsConfig as p } from "./CogsStateClient.jsx";
import { debounce as S, deepMerge as m, deleteNestedProperty as u, getArrayLengthDifferences as y, getArrayLengthDifferencesArray as C, getDifferences as l, getDifferencesArray as x, getNestedValue as A, isArray as D, isDeepEqual as F, isFunction as b, isObject as L, transformStateFunc as N, updateNestedProperty as h } from "./utility.js";
import { useCogsTrpcValidationLink as P } from "./TRPCValidationLink.js";
import { formRefStore as j, getGlobalStore as k } from "./store.js";
export {
  r as $cogsSignal,
  i as CogsStateClient,
  o as addStateOptions,
  c as config,
  n as createCogsState,
  s as createCogsStateFromSync,
  S as debounce,
  m as deepMerge,
  u as deleteNestedProperty,
  j as formRefStore,
  y as getArrayLengthDifferences,
  C as getArrayLengthDifferencesArray,
  l as getDifferences,
  x as getDifferencesArray,
  k as getGlobalStore,
  A as getNestedValue,
  D as isArray,
  F as isDeepEqual,
  b as isFunction,
  L as isObject,
  a as notifyComponent,
  N as transformStateFunc,
  h as updateNestedProperty,
  p as useCogsConfig,
  f as useCogsStateFn,
  P as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
