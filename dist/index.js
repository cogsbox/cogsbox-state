import { $cogsSignal as r, addStateOptions as o, createCogsState as a, createCogsStateFromSync as n, useCogsStateFn as s } from "./CogsState.jsx";
import { CogsStateClient as i, config as f, useCogsConfig as c } from "./CogsStateClient.jsx";
import { debounce as p, deepMerge as S, deleteNestedProperty as u, getArrayLengthDifferences as l, getArrayLengthDifferencesArray as m, getDifferences as C, getDifferencesArray as x, isArray as y, isDeepEqual as A, isFunction as D, isObject as b, transformStateFunc as h, updateNestedProperty as F } from "./utility.js";
import { useCogsTrpcValidationLink as L } from "./TRPCValidationLink.js";
import { buildShadowNode as w, formRefStore as E, generateId as O, getGlobalStore as j, shadowStateStore as k } from "./store.js";
import { PluginExecutor as G, createPluginContext as I } from "./plugins.js";
export {
  r as $cogsSignal,
  i as CogsStateClient,
  G as PluginExecutor,
  o as addStateOptions,
  w as buildShadowNode,
  f as config,
  a as createCogsState,
  n as createCogsStateFromSync,
  I as createPluginContext,
  p as debounce,
  S as deepMerge,
  u as deleteNestedProperty,
  E as formRefStore,
  O as generateId,
  l as getArrayLengthDifferences,
  m as getArrayLengthDifferencesArray,
  C as getDifferences,
  x as getDifferencesArray,
  j as getGlobalStore,
  y as isArray,
  A as isDeepEqual,
  D as isFunction,
  b as isObject,
  k as shadowStateStore,
  h as transformStateFunc,
  F as updateNestedProperty,
  c as useCogsConfig,
  s as useCogsStateFn,
  L as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
