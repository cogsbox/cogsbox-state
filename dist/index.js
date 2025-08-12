import { $cogsSignal as r, addStateOptions as o, createCogsState as a, createCogsStateFromSync as s, useCogsStateFn as n } from "./CogsState.jsx";
import { CogsStateClient as g, config as i, useCogsConfig as c } from "./CogsStateClient.jsx";
import { debounce as p, deepMerge as S, deleteNestedProperty as u, getArrayLengthDifferences as l, getArrayLengthDifferencesArray as m, getDifferences as y, getDifferencesArray as C, isArray as x, isDeepEqual as A, isFunction as D, isObject as b, transformStateFunc as F, updateNestedProperty as h } from "./utility.js";
import { useCogsTrpcValidationLink as N } from "./TRPCValidationLink.js";
import { buildShadowNode as P, formRefStore as j, getGlobalStore as k } from "./store.js";
export {
  r as $cogsSignal,
  g as CogsStateClient,
  o as addStateOptions,
  P as buildShadowNode,
  i as config,
  a as createCogsState,
  s as createCogsStateFromSync,
  p as debounce,
  S as deepMerge,
  u as deleteNestedProperty,
  j as formRefStore,
  l as getArrayLengthDifferences,
  m as getArrayLengthDifferencesArray,
  y as getDifferences,
  C as getDifferencesArray,
  k as getGlobalStore,
  x as isArray,
  A as isDeepEqual,
  D as isFunction,
  b as isObject,
  F as transformStateFunc,
  h as updateNestedProperty,
  c as useCogsConfig,
  n as useCogsStateFn,
  N as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
