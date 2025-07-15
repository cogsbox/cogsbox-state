import { $cogsSignal as r, addStateOptions as o, createCogsState as n, notifyComponent as s, useCogsStateFn as a } from "./CogsState.jsx";
import { CogsStateClient as g, config as i, useCogsConfig as p } from "./CogsStateClient.jsx";
import { debounce as d, deepMerge as u, deleteNestedProperty as l, getArrayLengthDifferences as m, getArrayLengthDifferencesArray as y, getDifferences as C, getDifferencesArray as S, getNestedValue as x, isArray as A, isDeepEqual as D, isFunction as b, isObject as F, transformStateFunc as L, updateNestedProperty as N } from "./utility.js";
import { useCogsTrpcValidationLink as O } from "./TRPCValidationLink.js";
import { formRefStore as V, getGlobalStore as j } from "./store.js";
export {
  r as $cogsSignal,
  g as CogsStateClient,
  o as addStateOptions,
  i as config,
  n as createCogsState,
  d as debounce,
  u as deepMerge,
  l as deleteNestedProperty,
  V as formRefStore,
  m as getArrayLengthDifferences,
  y as getArrayLengthDifferencesArray,
  C as getDifferences,
  S as getDifferencesArray,
  j as getGlobalStore,
  x as getNestedValue,
  A as isArray,
  D as isDeepEqual,
  b as isFunction,
  F as isObject,
  s as notifyComponent,
  L as transformStateFunc,
  N as updateNestedProperty,
  p as useCogsConfig,
  a as useCogsStateFn,
  O as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
