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
    setFieldMetaData: (t, o) => c.getState().setPluginMetaData(a, t, n, o),
    removeFieldMetaData: (t) => c.getState().removePluginMetaData(a, t, n),
    getFieldRefs: (t) => {
      const o = c.getState().getShadowMetadata(a, t);
      if (!o?.clientActivityState?.elements) return [];
      const e = [];
      return o.clientActivityState.elements.forEach((r) => {
        r.domRef?.current && e.push(r.domRef);
      }), e;
    },
    getFieldElements: (t) => {
      const o = c.getState().getShadowMetadata(a, t);
      if (!o?.clientActivityState?.elements) return [];
      const e = [];
      return o.clientActivityState.elements.forEach((r) => {
        r.domRef?.current && e.push(r.domRef.current);
      }), e;
    },
    setFieldDisabled: (t, o) => {
      const e = c.getState().getShadowMetadata(a, t);
      e?.clientActivityState?.elements && e.clientActivityState.elements.forEach((r) => {
        const i = r.domRef?.current;
        i && ("disabled" in i ? i.disabled = o : (i.style.pointerEvents = o ? "none" : "", i.setAttribute("aria-disabled", String(o))));
      });
    },
    getAllFieldElements: () => M(a),
    setAllFieldsDisabled: (t) => m(a, t)
  };
}
function h(a, n, t) {
  const o = D(
    a,
    n
  );
  return {
    ...o,
    getFieldMetaData: () => o.getFieldMetaData(t),
    setFieldMetaData: (e) => o.setFieldMetaData(t, e),
    removeFieldMetaData: () => o.removeFieldMetaData(t),
    // NEW: Direct access to the DOM refs for this field
    getFieldRefs: () => {
      const e = c.getState().getShadowMetadata(a, t);
      if (!e?.clientActivityState?.elements) return [];
      const r = [];
      return e.clientActivityState.elements.forEach((i) => {
        i.domRef?.current && r.push(i.domRef);
      }), r;
    },
    getFieldElements: () => {
      const e = c.getState().getShadowMetadata(a, t);
      if (!e?.clientActivityState?.elements) return [];
      const r = [];
      return e.clientActivityState.elements.forEach((i) => {
        i.domRef?.current && r.push(i.domRef.current);
      }), r;
    },
    setFieldDisabled: (e) => {
      const r = c.getState().getShadowMetadata(a, t);
      r?.clientActivityState?.elements && r.clientActivityState.elements.forEach((i) => {
        const l = i.domRef?.current;
        l && ("disabled" in l ? l.disabled = e : (l.style.pointerEvents = e ? "none" : "", l.setAttribute("aria-disabled", String(e))));
      });
    }
  };
}
function E(a) {
  function n(t) {
    const o = (i, l, s, d) => ({
      name: t,
      useHook: i,
      transformState: l,
      onUpdate: s,
      onFormUpdate: d
    });
    function e(i, l, s, d) {
      const f = o(
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
