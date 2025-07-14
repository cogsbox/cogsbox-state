import { $cogsSignal as r, addStateOptions as o, createCogsState as n, notifyComponent as s, useCogsStateFn as a } from "./CogsState.jsx";
import { CogsStateClient as g, config as f, useCogsConfig as c } from "./CogsStateClient.jsx";
import { debounce as d, deepMerge as u, deleteNestedProperty as y, getArrayLengthDifferences as C, getArrayLengthDifferencesArray as l, getDifferences as m, getDifferencesArray as S, getNestedValue as A, isArray as D, isDeepEqual as x, isFunction as F, isObject as L, transformStateFunc as N, updateNestedProperty as b } from "./utility.js";
import { useCogsTrpcValidationLink as O } from "./TRPCValidationLink.js";
export {
  r as $cogsSignal,
  g as CogsStateClient,
  o as addStateOptions,
  f as config,
  n as createCogsState,
  d as debounce,
  u as deepMerge,
  y as deleteNestedProperty,
  C as getArrayLengthDifferences,
  l as getArrayLengthDifferencesArray,
  m as getDifferences,
  S as getDifferencesArray,
  A as getNestedValue,
  D as isArray,
  x as isDeepEqual,
  F as isFunction,
  L as isObject,
  s as notifyComponent,
  N as transformStateFunc,
  b as updateNestedProperty,
  c as useCogsConfig,
  a as useCogsStateFn,
  O as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
