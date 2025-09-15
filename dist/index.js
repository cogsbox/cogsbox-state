import { $cogsSignal as r, addStateOptions as o, createCogsState as a, useCogsStateFn as n } from "./CogsState.jsx";
import { CogsStateClient as d, config as g, useCogsConfig as i } from "./CogsStateClient.jsx";
import { debounce as c, deepMerge as p, deleteNestedProperty as u, getArrayLengthDifferences as S, getArrayLengthDifferencesArray as l, getDifferences as m, getDifferencesArray as x, isArray as y, isDeepEqual as C, isFunction as h, isObject as D, transformStateFunc as A, updateNestedProperty as b } from "./utility.js";
import { useCogsTrpcValidationLink as w } from "./TRPCValidationLink.js";
import { buildShadowNode as L, generateId as M, getGlobalStore as N, shadowStateStore as k, updateShadowTypeInfo as I } from "./store.js";
import { createMetadataContext as T, createPluginContext as j, keyedSchema as q, toDeconstructedMethods as E } from "./plugins.js";
import { PluginRunner as R } from "./PluginRunner.jsx";
export {
  r as $cogsSignal,
  d as CogsStateClient,
  R as PluginRunner,
  o as addStateOptions,
  L as buildShadowNode,
  g as config,
  a as createCogsState,
  T as createMetadataContext,
  j as createPluginContext,
  c as debounce,
  p as deepMerge,
  u as deleteNestedProperty,
  M as generateId,
  S as getArrayLengthDifferences,
  l as getArrayLengthDifferencesArray,
  m as getDifferences,
  x as getDifferencesArray,
  N as getGlobalStore,
  y as isArray,
  C as isDeepEqual,
  h as isFunction,
  D as isObject,
  q as keyedSchema,
  k as shadowStateStore,
  E as toDeconstructedMethods,
  A as transformStateFunc,
  b as updateNestedProperty,
  I as updateShadowTypeInfo,
  i as useCogsConfig,
  n as useCogsStateFn,
  w as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
