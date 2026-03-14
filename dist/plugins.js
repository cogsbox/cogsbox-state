import { z as S } from "zod";
import { getGlobalStore as s } from "./store.js";
const v = () => S.object({
  __key: S.literal("keyed"),
  map: S.any()
});
function A(a) {
  return {
    initialiseState: (n) => {
      a.$update(n);
    },
    initialiseShadowState: (n) => {
      a.$initializeAndMergeShadowState(n);
    },
    applyOperation: (n, e) => a.$applyOperation(n, e),
    addZodErrors: (n) => a.$addZodValidation(n),
    getState: () => a.$get(),
    setOptions: (n) => {
      a.$setOptions(n);
    }
  };
}
function m(a, n) {
  return {
    getPluginMetaData: () => s.getState().getPluginMetaDataMap(a, [])?.get(n),
    setPluginMetaData: (e) => s.getState().setPluginMetaData(a, [], n, e),
    removePluginMetaData: () => s.getState().removePluginMetaData(a, [], n),
    getFieldMetaData: (e) => s.getState().getPluginMetaDataMap(a, e)?.get(n),
    setFieldMetaData: (e, o) => s.getState().setPluginMetaData(a, e, n, o),
    removeFieldMetaData: (e) => s.getState().removePluginMetaData(a, e, n),
    getFieldRefs: (e) => {
      const o = s.getState().getShadowMetadata(a, e);
      if (!o?.clientActivityState?.elements) return [];
      const t = [];
      return o.clientActivityState.elements.forEach((r) => {
        r.domRef?.current && t.push(r.domRef);
      }), t;
    },
    getFieldElements: (e) => {
      const o = s.getState().getShadowMetadata(a, e);
      if (!o?.clientActivityState?.elements) return [];
      const t = [];
      return o.clientActivityState.elements.forEach((r) => {
        r.domRef?.current && t.push(r.domRef.current);
      }), t;
    },
    setFieldDisabled: (e, o) => {
      const t = s.getState().getShadowMetadata(a, e);
      t?.clientActivityState?.elements && t.clientActivityState.elements.forEach((r) => {
        const i = r.domRef?.current;
        i && ("disabled" in i ? i.disabled = o : (i.style.pointerEvents = o ? "none" : "", i.setAttribute("aria-disabled", String(o))));
      });
    }
  };
}
function h(a, n, e) {
  const o = m(
    a,
    n
  );
  return {
    ...o,
    getFieldMetaData: () => o.getFieldMetaData(e),
    setFieldMetaData: (t) => o.setFieldMetaData(e, t),
    removeFieldMetaData: () => o.removeFieldMetaData(e),
    // NEW: Direct access to the DOM refs for this field
    getFieldRefs: () => {
      const t = s.getState().getShadowMetadata(a, e);
      if (!t?.clientActivityState?.elements) return [];
      const r = [];
      return t.clientActivityState.elements.forEach((i) => {
        i.domRef?.current && r.push(i.domRef);
      }), r;
    },
    getFieldElements: () => {
      const t = s.getState().getShadowMetadata(a, e);
      if (!t?.clientActivityState?.elements) return [];
      const r = [];
      return t.clientActivityState.elements.forEach((i) => {
        i.domRef?.current && r.push(i.domRef.current);
      }), r;
    },
    setFieldDisabled: (t) => {
      const r = s.getState().getShadowMetadata(a, e);
      r?.clientActivityState?.elements && r.clientActivityState.elements.forEach((i) => {
        const c = i.domRef?.current;
        c && ("disabled" in c ? c.disabled = t : (c.style.pointerEvents = t ? "none" : "", c.setAttribute("aria-disabled", String(t))));
      });
    }
  };
}
function b(a) {
  function n(e) {
    const o = (i, c, l, d) => ({
      name: e,
      useHook: i,
      transformState: c,
      onUpdate: l,
      onFormUpdate: d
    });
    function t(i, c, l, d) {
      const f = o(
        i,
        c,
        l,
        d
      ), g = {};
      return c || (g.transformState = (u) => t(i, u, l, d)), l || (g.onUpdate = (u) => t(i, c, u, d)), d || (g.onFormUpdate = (u) => t(
        i,
        c,
        l,
        u
      )), Object.assign(f, g);
    }
    return Object.assign(
      t(),
      {
        useHook(i) {
          return t(i);
        }
      }
    );
  }
  return { createPlugin: n };
}
export {
  m as createMetadataContext,
  b as createPluginContext,
  h as createScopedMetadataContext,
  v as keyedSchema,
  A as toDeconstructedMethods
};
//# sourceMappingURL=plugins.js.map
