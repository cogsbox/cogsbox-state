import { $cogsSignal as r, DefaultValidationComponent as o, addStateOptions as n, createCogsState as a, notifyComponent as s, useCogsStateFn as i } from "./CogsState.jsx";
import { CogsStateClient as g, config as p, useCogsConfig as c } from "./CogsStateClient.jsx";
import { debounce as u, deepMerge as C, deleteNestedProperty as l, getArrayLengthDifferences as y, getArrayLengthDifferencesArray as m, getDifferences as D, getDifferencesArray as S, getNestedValue as A, isArray as x, isDeepEqual as F, isFunction as L, isObject as N, transformStateFunc as V, updateNestedProperty as b } from "./utility.js";
import { useCogsTrpcValidationLink as O } from "./TRPCValidationLink.js";
export {
  r as $cogsSignal,
  g as CogsStateClient,
  o as DefaultValidationComponent,
  n as addStateOptions,
  p as config,
  a as createCogsState,
  u as debounce,
  C as deepMerge,
  l as deleteNestedProperty,
  y as getArrayLengthDifferences,
  m as getArrayLengthDifferencesArray,
  D as getDifferences,
  S as getDifferencesArray,
  A as getNestedValue,
  x as isArray,
  F as isDeepEqual,
  L as isFunction,
  N as isObject,
  s as notifyComponent,
  V as transformStateFunc,
  b as updateNestedProperty,
  c as useCogsConfig,
  i as useCogsStateFn,
  O as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
