import { $cogsSignal as r, addStateOptions as o, createCogsState as a, useCogsStateFn as n } from "./CogsState.jsx";
import { CogsStateClient as f, config as g, useCogsConfig as i } from "./CogsStateClient.jsx";
import { debounce as c, deepMerge as p, deleteNestedProperty as S, getArrayLengthDifferences as u, getArrayLengthDifferencesArray as l, getDifferences as m, getDifferencesArray as C, isArray as x, isDeepEqual as y, isFunction as A, isObject as D, transformStateFunc as b, updateNestedProperty as h } from "./utility.js";
import { useCogsTrpcValidationLink as L } from "./TRPCValidationLink.js";
import { buildShadowNode as P, formRefStore as w, generateId as O, getGlobalStore as j, shadowStateStore as k } from "./store.js";
import { createPluginContext as E } from "./plugins.js";
export {
  r as $cogsSignal,
  f as CogsStateClient,
  o as addStateOptions,
  P as buildShadowNode,
  g as config,
  a as createCogsState,
  E as createPluginContext,
  c as debounce,
  p as deepMerge,
  S as deleteNestedProperty,
  w as formRefStore,
  O as generateId,
  u as getArrayLengthDifferences,
  l as getArrayLengthDifferencesArray,
  m as getDifferences,
  C as getDifferencesArray,
  j as getGlobalStore,
  x as isArray,
  y as isDeepEqual,
  A as isFunction,
  D as isObject,
  k as shadowStateStore,
  b as transformStateFunc,
  h as updateNestedProperty,
  i as useCogsConfig,
  n as useCogsStateFn,
  L as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
