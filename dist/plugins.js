import { z as S } from "zod";
import { getGlobalStore as c, setAllFieldsDisabled as m, getAllFieldElements as M } from "./store.js";
const F = () => S.object({
  __key: S.literal("keyed"),
  map: S.any()
});
function b(a) {
  return {
    initialiseState: (n) => {
      a.$update(n);
    },
    initialiseShadowState: (n) => {
      a.$initializeAndMergeShadowState(n);
    },
    applyOperation: (n, t) => a.$applyOperation(n, t),
    addZodErrors: (n) => a.$addZodValidation(n),
    getState: () => a.$get(),
    setOptions: (n) => {
      a.$setOptions(n);
    }
  };
}
function D(a, n) {
  return {
    getPluginMetaData: () => c.getState().getPluginMetaDataMap(a, [])?.get(n),
    setPluginMetaData: (t) => c.getState().setPluginMetaData(a, [], n, t),
    removePluginMetaData: () => c.getState().removePluginMetaData(a, [], n),
    getFieldMetaData: (t) => c.getState().getPluginMetaDataMap(a, t)?.get(n),
    setFieldMetaData: (t, r) => c.getState().setPluginMetaData(a, t, n, r),
    removeFieldMetaData: (t) => c.getState().removePluginMetaData(a, t, n),
    getFieldRefs: (t) => {
      const r = c.getState().getShadowMetadata(a, t);
      if (!r?.clientActivityState?.elements) return [];
      const e = [];
      return r.clientActivityState.elements.forEach((o) => {
        o.domRef?.current && e.push(o.domRef);
      }), e;
    },
    getFieldElements: (t) => {
      const r = c.getState().getShadowMetadata(a, t);
      if (!r?.clientActivityState?.elements) return [];
      const e = [];
      return r.clientActivityState.elements.forEach((o) => {
        o.domRef?.current && e.push(o.domRef.current);
      }), e;
    },
    setFieldDisabled: (t, r) => {
      const e = c.getState().getShadowMetadata(a, t);
      e?.clientActivityState?.elements && e.clientActivityState.elements.forEach((o) => {
        const i = o.domRef?.current;
        i && ("disabled" in i ? i.disabled = r : (i.style.pointerEvents = r ? "none" : "", i.setAttribute("aria-disabled", String(r))));
      });
    },
    getAllFieldElements: () => M(a),
    setAllFieldsDisabled: (t) => m(a, t)
  };
}
function h(a, n, t) {
  const r = D(
    a,
    n
  );
  return {
    ...r,
    getFieldMetaData: () => r.getFieldMetaData(t),
    setFieldMetaData: (e) => r.setFieldMetaData(t, e),
    removeFieldMetaData: () => r.removeFieldMetaData(t),
    // NEW: Direct access to the DOM refs for this field
    getFieldRefs: () => {
      const e = c.getState().getShadowMetadata(a, t);
      if (!e?.clientActivityState?.elements) return [];
      const o = [];
      return e.clientActivityState.elements.forEach((i) => {
        i.domRef?.current && o.push(i.domRef);
      }), o;
    },
    getFieldElements: () => {
      const e = c.getState().getShadowMetadata(a, t);
      if (!e?.clientActivityState?.elements) return [];
      const o = [];
      return e.clientActivityState.elements.forEach((i) => {
        i.domRef?.current && o.push(i.domRef.current);
      }), o;
    },
    setFieldDisabled: (e) => {
      const o = c.getState().getShadowMetadata(a, t);
      o?.clientActivityState?.elements && o.clientActivityState.elements.forEach((i) => {
        const l = i.domRef?.current;
        l && ("disabled" in l ? l.disabled = e : (l.style.pointerEvents = e ? "none" : "", l.setAttribute("aria-disabled", String(e))));
      });
    }
  };
}
function E(a) {
  function n(t) {
    const r = (i, l, s, d) => ({
      name: t,
      useHook: i,
      transformState: l,
      onUpdate: s,
      onFormUpdate: d
    });
    function e(i, l, s, d) {
      const f = r(
        i,
        l,
        s,
        d
      ), g = {};
      return l || (g.transformState = (u) => e(i, u, s, d)), s || (g.onUpdate = (u) => e(i, l, u, d)), d || (g.onFormUpdate = (u) => e(
        i,
        l,
        s,
        u
      )), Object.assign(f, g);
    }
    return Object.assign(
      e(),
      {
        useHook(i) {
          return e(i);
        }
      }
    );
  }
  return { createPlugin: n };
}
export {
  D as createMetadataContext,
  E as createPluginContext,
  h as createScopedMetadataContext,
  F as keyedSchema,
  b as toDeconstructedMethods
};
//# sourceMappingURL=plugins.js.map
