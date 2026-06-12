import { $cogsSignal as r, createCogsState as o, useCogsStateFn as a } from "./CogsState.js";
import { CogsStateClient as s, config as d, useCogsConfig as i } from "./CogsStateClient.js";
import { debounce as c, deepMerge as f, deleteNestedProperty as l, getArrayLengthDifferences as p, getArrayLengthDifferencesArray as u, getDifferences as S, getDifferencesArray as m, isArray as x, isDeepEqual as C, isFunction as y, isObject as h, transformStateFunc as A, updateNestedProperty as D } from "./utility.js";
import { useCogsTrpcValidationLink as F } from "./TRPCValidationLink.js";
import { buildShadowNode as P, generateId as w, getAllFieldElements as L, getGlobalStore as N, setAllFieldsDisabled as k, shadowStateStore as E, updateShadowTypeInfo as I } from "./store.js";
import { createMetadataContext as j, createPluginContext as q, createScopedMetadataContext as G, keyedSchema as O, toDeconstructedMethods as R } from "./plugins.js";
import { PluginRunner as $ } from "./PluginRunner.js";
export {
  r as $cogsSignal,
  s as CogsStateClient,
  $ as PluginRunner,
  P as buildShadowNode,
  d as config,
  o as createCogsState,
  j as createMetadataContext,
  q as createPluginContext,
  G as createScopedMetadataContext,
  c as debounce,
  f as deepMerge,
  l as deleteNestedProperty,
  w as generateId,
  L as getAllFieldElements,
  p as getArrayLengthDifferences,
  u as getArrayLengthDifferencesArray,
  S as getDifferences,
  m as getDifferencesArray,
  N as getGlobalStore,
  x as isArray,
  C as isDeepEqual,
  y as isFunction,
  h as isObject,
  O as keyedSchema,
  k as setAllFieldsDisabled,
  E as shadowStateStore,
  R as toDeconstructedMethods,
  A as transformStateFunc,
  D as updateNestedProperty,
  I as updateShadowTypeInfo,
  i as useCogsConfig,
  a as useCogsStateFn,
  F as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
