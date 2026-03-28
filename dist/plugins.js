import { getGlobalStore as c, setAllFieldsDisabled as f, getAllFieldElements as m } from "./store.js";
const v = () => ({});
function A(i) {
  return {
    initialiseState: (n) => {
      i.$update(n);
    },
    initialiseShadowState: (n) => {
      i.$initializeAndMergeShadowState(n);
    },
    applyOperation: (n, t) => i.$applyOperation(n, t),
    addZodErrors: (n) => i.$addZodValidation(n),
    getState: () => i.$get(),
    setOptions: (n) => {
      i.$setOptions(n);
    }
  };
}
function M(i, n) {
  return {
    getPluginMetaData: () => c.getState().getPluginMetaDataMap(i, [])?.get(n),
    setPluginMetaData: (t) => c.getState().setPluginMetaData(i, [], n, t),
    removePluginMetaData: () => c.getState().removePluginMetaData(i, [], n),
    getFieldMetaData: (t) => c.getState().getPluginMetaDataMap(i, t)?.get(n),
    setFieldMetaData: (t, r) => c.getState().setPluginMetaData(i, t, n, r),
    removeFieldMetaData: (t) => c.getState().removePluginMetaData(i, t, n),
    getFieldRefs: (t) => {
      const r = c.getState().getShadowMetadata(i, t);
      if (!r?.clientActivityState?.elements) return [];
      const e = [];
      return r.clientActivityState.elements.forEach((o) => {
        o.domRef?.current && e.push(o.domRef);
      }), e;
    },
    getFieldElements: (t) => {
      const r = c.getState().getShadowMetadata(i, t);
      if (!r?.clientActivityState?.elements) return [];
      const e = [];
      return r.clientActivityState.elements.forEach((o) => {
        o.domRef?.current && e.push(o.domRef.current);
      }), e;
    },
    setFieldDisabled: (t, r) => {
      const e = c.getState().getShadowMetadata(i, t);
      e?.clientActivityState?.elements && e.clientActivityState.elements.forEach((o) => {
        const a = o.domRef?.current;
        a && ("disabled" in a ? a.disabled = r : (a.style.pointerEvents = r ? "none" : "", a.setAttribute("aria-disabled", String(r))));
      });
    },
    getAllFieldElements: () => m(i),
    setAllFieldsDisabled: (t) => f(i, t)
  };
}
function F(i, n, t) {
  const r = M(
    i,
    n
  );
  return {
    ...r,
    getFieldMetaData: () => r.getFieldMetaData(t),
    setFieldMetaData: (e) => r.setFieldMetaData(t, e),
    removeFieldMetaData: () => r.removeFieldMetaData(t),
    // NEW: Direct access to the DOM refs for this field
    getFieldRefs: () => {
      const e = c.getState().getShadowMetadata(i, t);
      if (!e?.clientActivityState?.elements) return [];
      const o = [];
      return e.clientActivityState.elements.forEach((a) => {
        a.domRef?.current && o.push(a.domRef);
      }), o;
    },
    getFieldElements: () => {
      const e = c.getState().getShadowMetadata(i, t);
      if (!e?.clientActivityState?.elements) return [];
      const o = [];
      return e.clientActivityState.elements.forEach((a) => {
        a.domRef?.current && o.push(a.domRef.current);
      }), o;
    },
    setFieldDisabled: (e) => {
      const o = c.getState().getShadowMetadata(i, t);
      o?.clientActivityState?.elements && o.clientActivityState.elements.forEach((a) => {
        const l = a.domRef?.current;
        l && ("disabled" in l ? l.disabled = e : (l.style.pointerEvents = e ? "none" : "", l.setAttribute("aria-disabled", String(e))));
      });
    }
  };
}
function b(i) {
  function n(t) {
    const r = (a, l, s, d) => ({
      name: t,
      useHook: a,
      transformState: l,
      onUpdate: s,
      onFormUpdate: d
    });
    function e(a, l, s, d) {
      const S = r(
        a,
        l,
        s,
        d
      ), g = {};
      return l || (g.transformState = (u) => e(a, u, s, d)), s || (g.onUpdate = (u) => e(a, l, u, d)), d || (g.onFormUpdate = (u) => e(
        a,
        l,
        s,
        u
      )), Object.assign(S, g);
    }
    return Object.assign(
      e(),
      {
        useHook(a) {
          return e(a);
        }
      }
    );
  }
  return { createPlugin: n };
}
export {
  M as createMetadataContext,
  b as createPluginContext,
  F as createScopedMetadataContext,
  v as perKeyOptions,
  A as toDeconstructedMethods
};
//# sourceMappingURL=plugins.js.map
