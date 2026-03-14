import { $cogsSignal as r, addStateOptions as o, createCogsState as a, useCogsStateFn as n } from "./CogsState.js";
import { CogsStateClient as d, config as i, useCogsConfig as g } from "./CogsStateClient.js";
import { debounce as f, deepMerge as l, deleteNestedProperty as p, getArrayLengthDifferences as u, getArrayLengthDifferencesArray as S, getDifferences as m, getDifferencesArray as x, isArray as C, isDeepEqual as y, isFunction as h, isObject as A, transformStateFunc as D, updateNestedProperty as b } from "./utility.js";
import { useCogsTrpcValidationLink as M } from "./TRPCValidationLink.js";
import { buildShadowNode as w, generateId as L, getAllFieldElements as N, getGlobalStore as k, setAllFieldsDisabled as E, shadowStateStore as I, updateShadowTypeInfo as O } from "./store.js";
import { createMetadataContext as j, createPluginContext as q, createScopedMetadataContext as G, keyedSchema as R, toDeconstructedMethods as V } from "./plugins.js";
import { PluginRunner as v } from "./PluginRunner.js";
export {
  r as $cogsSignal,
  d as CogsStateClient,
  v as PluginRunner,
  o as addStateOptions,
  w as buildShadowNode,
  i as config,
  a as createCogsState,
  j as createMetadataContext,
  q as createPluginContext,
  G as createScopedMetadataContext,
  f as debounce,
  l as deepMerge,
  p as deleteNestedProperty,
  L as generateId,
  N as getAllFieldElements,
  u as getArrayLengthDifferences,
  S as getArrayLengthDifferencesArray,
  m as getDifferences,
  x as getDifferencesArray,
  k as getGlobalStore,
  C as isArray,
  y as isDeepEqual,
  h as isFunction,
  A as isObject,
  R as keyedSchema,
  E as setAllFieldsDisabled,
  I as shadowStateStore,
  V as toDeconstructedMethods,
  D as transformStateFunc,
  b as updateNestedProperty,
  O as updateShadowTypeInfo,
  g as useCogsConfig,
  n as useCogsStateFn,
  M as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
