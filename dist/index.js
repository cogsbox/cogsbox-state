import { $cogsSignal as r, $cogsSignalStore as o, addStateOptions as s, createCogsState as n, notifyComponent as a, useCogsStateFn as i } from "./CogsState.jsx";
import { CogsStateClient as f, config as c, useCogsConfig as p } from "./CogsStateClient.jsx";
import { debounce as u, deleteNestedProperty as y, getArrayLengthDifferences as C, getArrayLengthDifferencesArray as S, getDifferences as l, getDifferencesArray as m, getNestedValue as A, isArray as D, isDeepEqual as x, isFunction as N, isObject as F, transformStateFunc as L, updateNestedProperty as P, updateNestedPropertyIds as b } from "./utility.js";
import { useCogsTrpcValidationLink as O } from "./TRPCValidationLink.js";
export {
  r as $cogsSignal,
  o as $cogsSignalStore,
  f as CogsStateClient,
  s as addStateOptions,
  c as config,
  n as createCogsState,
  u as debounce,
  y as deleteNestedProperty,
  C as getArrayLengthDifferences,
  S as getArrayLengthDifferencesArray,
  l as getDifferences,
  m as getDifferencesArray,
  A as getNestedValue,
  D as isArray,
  x as isDeepEqual,
  N as isFunction,
  F as isObject,
  a as notifyComponent,
  L as transformStateFunc,
  P as updateNestedProperty,
  b as updateNestedPropertyIds,
  p as useCogsConfig,
  i as useCogsStateFn,
  O as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
