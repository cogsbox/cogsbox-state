import { $cogsSignal as r, addStateOptions as o, createCogsState as a, useCogsStateFn as n } from "./CogsState.js";
import { CogsStateClient as d, config as g, useCogsConfig as i } from "./CogsStateClient.js";
import { debounce as f, deepMerge as p, deleteNestedProperty as u, getArrayLengthDifferences as S, getArrayLengthDifferencesArray as l, getDifferences as x, getDifferencesArray as C, isArray as m, isDeepEqual as y, isFunction as h, isObject as D, transformStateFunc as A, updateNestedProperty as b } from "./utility.js";
import { useCogsTrpcValidationLink as P } from "./TRPCValidationLink.js";
import { buildShadowNode as F, generateId as L, getGlobalStore as N, shadowStateStore as k, updateShadowTypeInfo as I } from "./store.js";
import { createMetadataContext as T, createPluginContext as j, createScopedMetadataContext as q, keyedSchema as E, toDeconstructedMethods as G } from "./plugins.js";
import { PluginRunner as V } from "./PluginRunner.js";
export {
  r as $cogsSignal,
  d as CogsStateClient,
  V as PluginRunner,
  o as addStateOptions,
  F as buildShadowNode,
  g as config,
  a as createCogsState,
  T as createMetadataContext,
  j as createPluginContext,
  q as createScopedMetadataContext,
  f as debounce,
  p as deepMerge,
  u as deleteNestedProperty,
  L as generateId,
  S as getArrayLengthDifferences,
  l as getArrayLengthDifferencesArray,
  x as getDifferences,
  C as getDifferencesArray,
  N as getGlobalStore,
  m as isArray,
  y as isDeepEqual,
  h as isFunction,
  D as isObject,
  E as keyedSchema,
  k as shadowStateStore,
  G as toDeconstructedMethods,
  A as transformStateFunc,
  b as updateNestedProperty,
  I as updateShadowTypeInfo,
  i as useCogsConfig,
  n as useCogsStateFn,
  P as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
