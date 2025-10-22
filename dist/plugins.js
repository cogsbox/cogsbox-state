import { z as r } from "zod";
import { getGlobalStore as M } from "./store.js";
const b = () => r.object({
  __key: r.literal("keyed"),
  map: r.any()
});
function d(e) {
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
function j(e, t) {
  return {
    getPluginMetaData: () => M.getState().getPluginMetaDataMap(e, [])?.get(t),
    setPluginMetaData: (a) => M.getState().setPluginMetaData(e, [], t, a),
    removePluginMetaData: () => M.getState().removePluginMetaData(e, [], t),
    getFieldMetaData: (a) => M.getState().getPluginMetaDataMap(e, a)?.get(t),
    setFieldMetaData: (a, D) => M.getState().setPluginMetaData(e, a, t, D),
    removeFieldMetaData: (a) => M.getState().removePluginMetaData(e, a, t)
  };
}
function v(e) {
  function t(a) {
    const D = (i, o, g, n, c) => ({
      name: a,
      useHook: i,
      transformState: o,
      onUpdate: g,
      onFormUpdate: n,
      formWrapper: c
    });
    function s(i, o, g, n, c) {
      const P = D(
        i,
        o,
        g,
        n,
        c
      ), S = {};
      return o || (S.transformState = (u) => s(i, u, g, n, c)), g || (S.onUpdate = (u) => s(i, o, u, n, c)), n || (S.onFormUpdate = (u) => s(
        i,
        o,
        g,
        u,
        c
      )), c || (S.formWrapper = (u) => s(i, o, g, n, u)), Object.assign(P, S);
    }
    return Object.assign(
      s(),
      {
        useHook(i) {
          return s(i);
        }
      }
    );
  }
  return { createPlugin: t };
}
export {
  j as createMetadataContext,
  v as createPluginContext,
  b as keyedSchema,
  d as toDeconstructedMethods
};
//# sourceMappingURL=plugins.js.map
