import { $cogsSignal as r, addStateOptions as o, createCogsState as n, useCogsStateFn as a } from "./CogsState.jsx";
import { CogsStateClient as f, config as g, useCogsConfig as i } from "./CogsStateClient.jsx";
import { debounce as p, deepMerge as c, deleteNestedProperty as u, getArrayLengthDifferences as S, getArrayLengthDifferencesArray as l, getDifferences as m, getDifferencesArray as x, isArray as C, isDeepEqual as y, isFunction as A, isObject as D, transformStateFunc as b, updateNestedProperty as h } from "./utility.js";
import { useCogsTrpcValidationLink as F } from "./TRPCValidationLink.js";
import { buildShadowNode as N, formRefStore as w, generateId as O, getGlobalStore as R, shadowStateStore as j } from "./store.js";
import { createPluginContext as q } from "./plugins.js";
import { PluginRunner as G } from "./PluginRunner.jsx";
export {
  r as $cogsSignal,
  f as CogsStateClient,
  G as PluginRunner,
  o as addStateOptions,
  N as buildShadowNode,
  g as config,
  n as createCogsState,
  q as createPluginContext,
  p as debounce,
  c as deepMerge,
  u as deleteNestedProperty,
  w as formRefStore,
  O as generateId,
  S as getArrayLengthDifferences,
  l as getArrayLengthDifferencesArray,
  m as getDifferences,
  x as getDifferencesArray,
  R as getGlobalStore,
  C as isArray,
  y as isDeepEqual,
  A as isFunction,
  D as isObject,
  j as shadowStateStore,
  b as transformStateFunc,
  h as updateNestedProperty,
  i as useCogsConfig,
  a as useCogsStateFn,
  F as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
