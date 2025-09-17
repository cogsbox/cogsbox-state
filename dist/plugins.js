import { z as D } from "zod";
import { getGlobalStore as M } from "./store.js";
const $ = () => D.object({
  __key: D.literal("keyed"),
  map: D.any()
});
function j(e) {
  return {
    initialiseState: (t) => {
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
function v(e, t) {
  return {
    getPluginMetaData: () => M.getState().getPluginMetaDataMap(e, [])?.get(t),
    setPluginMetaData: (a) => M.getState().setPluginMetaData(e, [], t, a),
    removePluginMetaData: () => M.getState().removePluginMetaData(e, [], t),
    getFieldMetaData: (a) => M.getState().getPluginMetaDataMap(e, a)?.get(t),
    setFieldMetaData: (a, r) => M.getState().setPluginMetaData(e, a, t, r),
    removeFieldMetaData: (a) => M.getState().removePluginMetaData(e, a, t)
  };
}
function d(e) {
  function t(a) {
    const r = (i, o, g, n, c) => ({
      name: a,
      useHook: i,
      transformState: o,
      onUpdate: g,
      onFormUpdate: n,
      formWrapper: c
    });
    function s(i, o, g, n, c) {
      const P = r(
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
  v as createMetadataContext,
  d as createPluginContext,
  $ as keyedSchema,
  j as toDeconstructedMethods
};
//# sourceMappingURL=plugins.js.map
