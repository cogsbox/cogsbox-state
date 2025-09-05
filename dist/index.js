import { $cogsSignal as r, addStateOptions as o, createCogsState as a, useCogsStateFn as n } from "./CogsState.jsx";
import { CogsStateClient as g, config as i, useCogsConfig as f } from "./CogsStateClient.jsx";
import { debounce as c, deepMerge as p, deleteNestedProperty as u, getArrayLengthDifferences as l, getArrayLengthDifferencesArray as S, getDifferences as x, getDifferencesArray as C, isArray as m, isDeepEqual as y, isFunction as A, isObject as D, transformStateFunc as b, updateNestedProperty as h } from "./utility.js";
import { useCogsTrpcValidationLink as F } from "./TRPCValidationLink.js";
import { buildShadowNode as N, generateId as w, getGlobalStore as M, shadowStateStore as O } from "./store.js";
import { createMetadataContext as k, createPluginContext as q } from "./plugins.js";
import { PluginRunner as G } from "./PluginRunner.jsx";
export {
  r as $cogsSignal,
  g as CogsStateClient,
  G as PluginRunner,
  o as addStateOptions,
  N as buildShadowNode,
  i as config,
  a as createCogsState,
  k as createMetadataContext,
  q as createPluginContext,
  c as debounce,
  p as deepMerge,
  u as deleteNestedProperty,
  w as generateId,
  l as getArrayLengthDifferences,
  S as getArrayLengthDifferencesArray,
  x as getDifferences,
  C as getDifferencesArray,
  M as getGlobalStore,
  m as isArray,
  y as isDeepEqual,
  A as isFunction,
  D as isObject,
  O as shadowStateStore,
  b as transformStateFunc,
  h as updateNestedProperty,
  f as useCogsConfig,
  n as useCogsStateFn,
  F as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
