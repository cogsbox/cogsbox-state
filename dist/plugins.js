import { z as S } from "zod";
import { getGlobalStore as c, setAllFieldsDisabled as M, getAllFieldElements as m } from "./store.js";
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
      return o.clientActivityState.elements.forEach((l) => {
        l.domRef?.current && e.push(l.domRef);
      }), e;
    },
    getFieldElements: (t) => {
      const o = c.getState().getShadowMetadata(a, t);
      if (!o?.clientActivityState?.elements) return [];
      const e = [];
      return o.clientActivityState.elements.forEach((l) => {
        l.domRef?.current && e.push(l.domRef.current);
      }), e;
    },
    setFieldDisabled: (t, o) => {
      const e = c.getState().getShadowMetadata(a, t);
      e?.clientActivityState?.elements && e.clientActivityState.elements.forEach((l) => {
        const i = l.domRef?.current;
        i && ("disabled" in i ? i.disabled = o : (i.style.pointerEvents = o ? "none" : "", i.setAttribute("aria-disabled", String(o))));
      });
    },
    getAllFieldElements: () => (console.log(
      "getAllFieldElements(stateKey)",
      m(a)
    ), m(a)),
    setAllFieldsDisabled: (t) => M(a, t)
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
      const l = [];
      return e.clientActivityState.elements.forEach((i) => {
        i.domRef?.current && l.push(i.domRef);
      }), l;
    },
    getFieldElements: () => {
      const e = c.getState().getShadowMetadata(a, t);
      if (!e?.clientActivityState?.elements) return [];
      const l = [];
      return e.clientActivityState.elements.forEach((i) => {
        i.domRef?.current && l.push(i.domRef.current);
      }), l;
    },
    setFieldDisabled: (e) => {
      const l = c.getState().getShadowMetadata(a, t);
      l?.clientActivityState?.elements && l.clientActivityState.elements.forEach((i) => {
        const r = i.domRef?.current;
        r && ("disabled" in r ? r.disabled = e : (r.style.pointerEvents = e ? "none" : "", r.setAttribute("aria-disabled", String(e))));
      });
    }
  };
}
function E(a) {
  function n(t) {
    const o = (i, r, s, d) => ({
      name: t,
      useHook: i,
      transformState: r,
      onUpdate: s,
      onFormUpdate: d
    });
    function e(i, r, s, d) {
      const f = o(
        i,
        r,
        s,
        d
      ), u = {};
      return r || (u.transformState = (g) => e(i, g, s, d)), s || (u.onUpdate = (g) => e(i, r, g, d)), d || (u.onFormUpdate = (g) => e(
        i,
        r,
        s,
        g
      )), Object.assign(f, u);
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
