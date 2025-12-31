import { z as l } from "zod";
import { getGlobalStore as u } from "./store.js";
const f = () => l.object({
  __key: l.literal("keyed"),
  map: l.any()
});
function m(e) {
  return {
    initialiseState: (t) => {
      e.$update(t);
    },
    initialiseShadowState: (t) => {
      e.$initializeAndMergeShadowState(t);
    },
    applyOperation: (t, a) => e.$applyOperation(t, a),
    addZodErrors: (t) => e.$addZodValidation(t),
    getState: () => e.$get(),
    setOptions: (t) => {
      e.$setOptions(t);
    }
  };
}
function S(e, t) {
  return {
    getPluginMetaData: () => u.getState().getPluginMetaDataMap(e, [])?.get(t),
    setPluginMetaData: (a) => u.getState().setPluginMetaData(e, [], t, a),
    removePluginMetaData: () => u.getState().removePluginMetaData(e, [], t),
    getFieldMetaData: (a) => u.getState().getPluginMetaDataMap(e, a)?.get(t),
    setFieldMetaData: (a, i) => u.getState().setPluginMetaData(e, a, t, i),
    removeFieldMetaData: (a) => u.getState().removePluginMetaData(e, a, t)
  };
}
function O(e, t, a) {
  const i = S(
    e,
    t
  );
  return {
    // Return the global methods for plugin metadata
    ...i,
    // Override the field methods with new, path-scoped versions
    getFieldMetaData: () => i.getFieldMetaData(a),
    setFieldMetaData: (n) => i.setFieldMetaData(a, n),
    removeFieldMetaData: () => i.removeFieldMetaData(a)
  };
}
function b(e) {
  function t(a) {
    const i = (o, r, g, c) => ({
      name: a,
      useHook: o,
      transformState: r,
      onUpdate: g,
      onFormUpdate: c
    });
    function n(o, r, g, c) {
      const D = i(
        o,
        r,
        g,
        c
      ), s = {};
      return r || (s.transformState = (M) => n(o, M, g, c)), g || (s.onUpdate = (M) => n(o, r, M, c)), c || (s.onFormUpdate = (M) => n(
        o,
        r,
        g,
        M
      )), Object.assign(D, s);
    }
    return Object.assign(
      n(),
      {
        useHook(o) {
          return n(o);
        }
      }
    );
  }
  return { createPlugin: t };
}
export {
  S as createMetadataContext,
  b as createPluginContext,
  O as createScopedMetadataContext,
  f as keyedSchema,
  m as toDeconstructedMethods
};
//# sourceMappingURL=plugins.js.map
