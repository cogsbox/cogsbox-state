import { $cogsSignal as r, $cogsSignalStore as o, addStateOptions as n, createCogsState as s, notifyComponent as a, useCogsStateFn as i } from "./CogsState.jsx";
import { CogsStateClient as f, config as c, useCogsConfig as p } from "./CogsStateClient.jsx";
import { debounce as u, deleteNestedProperty as y, getArrayLengthDifferences as C, getArrayLengthDifferencesArray as S, getDifferences as l, getDifferencesArray as m, getNestedValue as A, isArray as D, isDeepEqual as x, isFunction as F, isObject as L, transformStateFunc as N, updateNestedProperty as b } from "./utility.js";
import { useCogsTrpcValidationLink as O } from "./TRPCValidationLink.js";
export {
  r as $cogsSignal,
  o as $cogsSignalStore,
  f as CogsStateClient,
  n as addStateOptions,
  c as config,
  s as createCogsState,
  u as debounce,
  y as deleteNestedProperty,
  C as getArrayLengthDifferences,
  S as getArrayLengthDifferencesArray,
  l as getDifferences,
  m as getDifferencesArray,
  A as getNestedValue,
  D as isArray,
  x as isDeepEqual,
  F as isFunction,
  L as isObject,
  a as notifyComponent,
  N as transformStateFunc,
  b as updateNestedProperty,
  p as useCogsConfig,
  i as useCogsStateFn,
  O as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
