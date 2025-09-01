import { $cogsSignal as r, addStateOptions as o, createCogsState as a, createCogsStateFromSync as n, useCogsStateFn as s } from "./CogsState.jsx";
import { CogsStateClient as f, config as i, useCogsConfig as c } from "./CogsStateClient.jsx";
import { debounce as p, deepMerge as S, deleteNestedProperty as u, getArrayLengthDifferences as l, getArrayLengthDifferencesArray as m, getDifferences as C, getDifferencesArray as y, isArray as x, isDeepEqual as A, isFunction as D, isObject as b, transformStateFunc as h, updateNestedProperty as F } from "./utility.js";
import { useCogsTrpcValidationLink as N } from "./TRPCValidationLink.js";
import { buildShadowNode as w, formRefStore as O, generateId as j, getGlobalStore as k, shadowStateStore as q } from "./store.js";
import { createPluginContext as G } from "./plugins.js";
export {
  r as $cogsSignal,
  f as CogsStateClient,
  o as addStateOptions,
  w as buildShadowNode,
  i as config,
  a as createCogsState,
  n as createCogsStateFromSync,
  G as createPluginContext,
  p as debounce,
  S as deepMerge,
  u as deleteNestedProperty,
  O as formRefStore,
  j as generateId,
  l as getArrayLengthDifferences,
  m as getArrayLengthDifferencesArray,
  C as getDifferences,
  y as getDifferencesArray,
  k as getGlobalStore,
  x as isArray,
  A as isDeepEqual,
  D as isFunction,
  b as isObject,
  q as shadowStateStore,
  h as transformStateFunc,
  F as updateNestedProperty,
  c as useCogsConfig,
  s as useCogsStateFn,
  N as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
