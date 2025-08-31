import { $cogsSignal as r, addStateOptions as o, createCogsState as a, createCogsStateFromSync as s, useCogsStateFn as n } from "./CogsState.jsx";
import { CogsStateClient as f, config as i, useCogsConfig as c } from "./CogsStateClient.jsx";
import { debounce as S, deepMerge as p, deleteNestedProperty as u, getArrayLengthDifferences as l, getArrayLengthDifferencesArray as m, getDifferences as y, getDifferencesArray as C, isArray as x, isDeepEqual as A, isFunction as D, isObject as b, transformStateFunc as h, updateNestedProperty as F } from "./utility.js";
import { useCogsTrpcValidationLink as N } from "./TRPCValidationLink.js";
import { buildShadowNode as O, formRefStore as P, generateId as j, getGlobalStore as k, shadowStateStore as q } from "./store.js";
export {
  r as $cogsSignal,
  f as CogsStateClient,
  o as addStateOptions,
  O as buildShadowNode,
  i as config,
  a as createCogsState,
  s as createCogsStateFromSync,
  S as debounce,
  p as deepMerge,
  u as deleteNestedProperty,
  P as formRefStore,
  j as generateId,
  l as getArrayLengthDifferences,
  m as getArrayLengthDifferencesArray,
  y as getDifferences,
  C as getDifferencesArray,
  k as getGlobalStore,
  x as isArray,
  A as isDeepEqual,
  D as isFunction,
  b as isObject,
  q as shadowStateStore,
  h as transformStateFunc,
  F as updateNestedProperty,
  c as useCogsConfig,
  n as useCogsStateFn,
  N as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
