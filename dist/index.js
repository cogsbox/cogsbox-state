import { $cogsSignal as r, addStateOptions as o, createCogsState as a, useCogsStateFn as n } from "./CogsState.jsx";
import { CogsStateClient as g, config as i, useCogsConfig as d } from "./CogsStateClient.jsx";
import { debounce as c, deepMerge as p, deleteNestedProperty as u, getArrayLengthDifferences as S, getArrayLengthDifferencesArray as l, getDifferences as m, getDifferencesArray as x, isArray as C, isDeepEqual as y, isFunction as h, isObject as D, transformStateFunc as A, updateNestedProperty as b } from "./utility.js";
import { useCogsTrpcValidationLink as F } from "./TRPCValidationLink.js";
import { buildShadowNode as M, generateId as N, getGlobalStore as k, shadowStateStore as w } from "./store.js";
import { createMetadataContext as j, createPluginContext as q, keyedSchema as E, toDeconstructedMethods as G } from "./plugins.js";
import { PluginRunner as R } from "./PluginRunner.jsx";
export {
  r as $cogsSignal,
  g as CogsStateClient,
  R as PluginRunner,
  o as addStateOptions,
  M as buildShadowNode,
  i as config,
  a as createCogsState,
  j as createMetadataContext,
  q as createPluginContext,
  c as debounce,
  p as deepMerge,
  u as deleteNestedProperty,
  N as generateId,
  S as getArrayLengthDifferences,
  l as getArrayLengthDifferencesArray,
  m as getDifferences,
  x as getDifferencesArray,
  k as getGlobalStore,
  C as isArray,
  y as isDeepEqual,
  h as isFunction,
  D as isObject,
  E as keyedSchema,
  w as shadowStateStore,
  G as toDeconstructedMethods,
  A as transformStateFunc,
  b as updateNestedProperty,
  d as useCogsConfig,
  n as useCogsStateFn,
  F as useCogsTrpcValidationLink
};
//# sourceMappingURL=index.js.map
