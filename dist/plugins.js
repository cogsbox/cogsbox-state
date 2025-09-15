import { z as r } from "zod";
import { getGlobalStore as M } from "./store.js";
const $ = () => r.object({
  __key: r.literal("keyed"),
  map: r.any()
});
function j(e) {
  return {
    initialiseState: (t) => {
      console.log("initialiseState", t), e.$initializeAndMergeShadowState(t);
    },
    applyOperation: (t, i) => e.$applyOperation(t, i),
    addZodErrors: (t) => e.$addZodValidation(t),
    getState: () => e.$get(),
    setOptions: (t) => {
      console.log("setOptions", t), e.$setOptions(t);
    }
  };
}
function v(e, t) {
  return {
    getPluginMetaData: () => M.getState().getPluginMetaDataMap(e, [])?.get(t),
    setPluginMetaData: (i) => M.getState().setPluginMetaData(e, [], t, i),
    removePluginMetaData: () => M.getState().removePluginMetaData(e, [], t),
    getFieldMetaData: (i) => M.getState().getPluginMetaDataMap(e, i)?.get(t),
    setFieldMetaData: (i, l) => M.getState().setPluginMetaData(e, i, t, l),
    removeFieldMetaData: (i) => M.getState().removePluginMetaData(e, i, t)
  };
}
function x(e) {
  function t(i) {
    const l = (a, o, n, g, c) => ({
      name: i,
      useHook: a,
      transformState: o,
      onUpdate: n,
      onFormUpdate: g,
      formWrapper: c
    });
    function u(a, o, n, g, c) {
      const D = l(
        a,
        o,
        n,
        g,
        c
      ), S = {};
      return o || (S.transformState = (s) => u(a, s, n, g, c)), n || (S.onUpdate = (s) => u(a, o, s, g, c)), g || (S.onFormUpdate = (s) => u(
        a,
        o,
        n,
        s,
        c
      )), c || (S.formWrapper = (s) => u(a, o, n, g, s)), Object.assign(D, S);
    }
    return Object.assign(
      u(),
      {
        useHook(a) {
          return u(a);
        }
      }
    );
  }
  return { createPlugin: t };
}
export {
  v as createMetadataContext,
  x as createPluginContext,
  $ as keyedSchema,
  j as toDeconstructedMethods
};
//# sourceMappingURL=plugins.js.map
