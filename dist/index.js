import { $cogsSignal as r, addStateOptions as o, createCogsState as a, useCogsStateFn as n } from "./CogsState.js";
import { CogsStateClient as d, config as i, useCogsConfig as g } from "./CogsStateClient.js";
import { debounce as p, deepMerge as c, deleteNestedProperty as l, getArrayLengthDifferences as u, getArrayLengthDifferencesArray as S, getDifferences as x, getDifferencesArray as C, isArray as m, isDeepEqual as y, isFunction as A, isObject as D, transformStateFunc as h, updateNestedProperty as b } from "./utility.js";
import { useCogsTrpcValidationLink as M } from "./TRPCValidationLink.js";
import { buildShadowNode as w, generateId as L, getAllFieldElements as N, getGlobalStore as O, setAllFieldsDisabled as E, shadowStateStore as I, updateShadowTypeInfo as T } from "./store.js";
import { createMetadataContext as k, createPluginContext as q, createScopedMetadataContext as G, perKeyOptions as K, toDeconstructedMethods as R } from "./plugins.js";
import { PluginRunner as $ } from "./PluginRunner.js";
export {
  r as $cogsSignal,
  d as CogsStateClient,
  $ as PluginRunner,
  o as addStateOptions,
  w as buildShadowNode,
  i as config,
  a as createCogsState,
  k as createMetadataContext,
  q as createPluginContext,
  G as createScopedMetadataContext,
  p as debounce,
  c as deepMerge,
  l as deleteNestedProperty,
  L as generateId,
  N as getAllFieldElements,
  u as getArrayLengthDifferences,
  S as getArrayLengthDifferencesArray,
  x as getDifferences,
  C as getDifferencesArray,
  O as getGlobalStore,
  m as isArray,
  y as isDeepEqual,
  A as isFunction,
  D as isObject,
  K as perKeyOptions,
  E as setAllFieldsDisabled,
  I as shadowStateStore,
  R as toDeconstructedMethods,
  h as transformStateFunc,
  b as updateNestedProperty,
  T as updateShadowTypeInfo,
  g as useCogsConfig,
  n as useCogsStateFn,
  M as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
