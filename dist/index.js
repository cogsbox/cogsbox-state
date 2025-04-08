import { $cogsSignal as r, $cogsSignalStore as o, addStateOptions as n, createCogsState as s, notifyComponent as a, useCogsStateFn as i } from "./CogsState.jsx";
import { config as f, useCogsConfig as c } from "./CogsStateClient.jsx";
import { debounce as d, deleteNestedProperty as u, getArrayLengthDifferences as y, getArrayLengthDifferencesArray as S, getDifferences as l, getDifferencesArray as m, getNestedValue as C, isArray as A, isDeepEqual as D, isFunction as x, isObject as F, transformStateFunc as L, updateNestedProperty as N } from "./utility.js";
import { useCogsTrpcValidationLink as h } from "./TRPCValidationLink.js";
export {
  r as $cogsSignal,
  o as $cogsSignalStore,
  n as addStateOptions,
  f as config,
  s as createCogsState,
  d as debounce,
  u as deleteNestedProperty,
  y as getArrayLengthDifferences,
  S as getArrayLengthDifferencesArray,
  l as getDifferences,
  m as getDifferencesArray,
  C as getNestedValue,
  A as isArray,
  D as isDeepEqual,
  x as isFunction,
  F as isObject,
  a as notifyComponent,
  L as transformStateFunc,
  N as updateNestedProperty,
  c as useCogsConfig,
  i as useCogsStateFn,
  h as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
