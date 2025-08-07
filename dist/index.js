import { $cogsSignal as r, addStateOptions as o, createCogsState as a, createCogsStateFromSync as s, useCogsStateFn as n } from "./CogsState.jsx";
import { CogsStateClient as g, config as i, useCogsConfig as c } from "./CogsStateClient.jsx";
import { debounce as p, deepMerge as S, deleteNestedProperty as u, getArrayLengthDifferences as l, getArrayLengthDifferencesArray as m, getDifferences as y, getDifferencesArray as A, isArray as C, isDeepEqual as D, isFunction as x, isObject as b, transformStateFunc as F, updateNestedProperty as h } from "./utility.js";
import { useCogsTrpcValidationLink as L } from "./TRPCValidationLink.js";
import { METADATA_KEYS as T, buildShadowNode as M, formRefStore as O, getGlobalStore as P } from "./store.js";
export {
  r as $cogsSignal,
  g as CogsStateClient,
  T as METADATA_KEYS,
  o as addStateOptions,
  M as buildShadowNode,
  i as config,
  a as createCogsState,
  s as createCogsStateFromSync,
  p as debounce,
  S as deepMerge,
  u as deleteNestedProperty,
  O as formRefStore,
  l as getArrayLengthDifferences,
  m as getArrayLengthDifferencesArray,
  y as getDifferences,
  A as getDifferencesArray,
  P as getGlobalStore,
  C as isArray,
  D as isDeepEqual,
  x as isFunction,
  b as isObject,
  F as transformStateFunc,
  h as updateNestedProperty,
  c as useCogsConfig,
  n as useCogsStateFn,
  L as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
