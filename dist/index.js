import { $cogsSignal as r, addStateOptions as o, createCogsState as n, useCogsStateFn as a } from "./CogsState.jsx";
import { CogsStateClient as g, config as i, useCogsConfig as f } from "./CogsStateClient.jsx";
import { debounce as p, deepMerge as c, deleteNestedProperty as u, getArrayLengthDifferences as l, getArrayLengthDifferencesArray as S, getDifferences as m, getDifferencesArray as x, isArray as C, isDeepEqual as y, isFunction as A, isObject as D, transformStateFunc as b, updateNestedProperty as h } from "./utility.js";
import { useCogsTrpcValidationLink as F } from "./TRPCValidationLink.js";
import { buildShadowNode as N, generateId as w, getGlobalStore as O, shadowStateStore as j } from "./store.js";
import { createPluginContext as q } from "./plugins.js";
import { PluginRunner as G } from "./PluginRunner.jsx";
export {
  r as $cogsSignal,
  g as CogsStateClient,
  G as PluginRunner,
  o as addStateOptions,
  N as buildShadowNode,
  i as config,
  n as createCogsState,
  q as createPluginContext,
  p as debounce,
  c as deepMerge,
  u as deleteNestedProperty,
  w as generateId,
  l as getArrayLengthDifferences,
  S as getArrayLengthDifferencesArray,
  m as getDifferences,
  x as getDifferencesArray,
  O as getGlobalStore,
  C as isArray,
  y as isDeepEqual,
  A as isFunction,
  D as isObject,
  j as shadowStateStore,
  b as transformStateFunc,
  h as updateNestedProperty,
  f as useCogsConfig,
  a as useCogsStateFn,
  F as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
