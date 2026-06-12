import { z as M } from "zod";
import { getGlobalStore as l, setAllFieldsDisabled as b, getAllFieldElements as A } from "./store.js";
const j = () => M.object({
  __key: M.literal("keyed"),
  map: M.any()
});
function O(i) {
  return {
    initialiseState: (r) => {
      i.$update(r);
    },
    initialiseShadowState: (r) => {
      i.$initializeAndMergeShadowState(r);
    },
    applyOperation: (r, e) => i.$applyOperation(r, e),
    addZodErrors: (r) => i.$addZodValidation(r),
    getState: () => i.$get(),
    setOptions: (r) => {
      i.$setOptions(r);
    }
  };
}
function P(i, r) {
  return {
    getPluginMetaData: () => l.getState().getPluginMetaDataMap(i, [])?.get(r),
    setPluginMetaData: (e) => l.getState().setPluginMetaData(i, [], r, e),
    removePluginMetaData: () => l.getState().removePluginMetaData(i, [], r),
    getFieldMetaData: (e) => l.getState().getPluginMetaDataMap(i, e)?.get(r),
    setFieldMetaData: (e, a) => l.getState().setPluginMetaData(i, e, r, a),
    removeFieldMetaData: (e) => l.getState().removePluginMetaData(i, e, r),
    getFieldRefs: (e) => {
      const a = l.getState().getShadowMetadata(i, e);
      if (!a?.clientActivityState?.elements) return [];
      const t = [];
      return a.clientActivityState.elements.forEach((o) => {
        o.domRef?.current && t.push(o.domRef);
      }), t;
    },
    getFieldElements: (e) => {
      const a = l.getState().getShadowMetadata(i, e);
      if (!a?.clientActivityState?.elements) return [];
      const t = [];
      return a.clientActivityState.elements.forEach((o) => {
        o.domRef?.current && t.push(o.domRef.current);
      }), t;
    },
    setFieldDisabled: (e, a) => {
      const t = l.getState().getShadowMetadata(i, e);
      t?.clientActivityState?.elements && t.clientActivityState.elements.forEach((o) => {
        const n = o.domRef?.current;
        n && ("disabled" in n ? n.disabled = a : (n.style.pointerEvents = a ? "none" : "", n.setAttribute("aria-disabled", String(a))));
      });
    },
    getAllFieldElements: () => A(i),
    setAllFieldsDisabled: (e) => b(i, e)
  };
}
function $(i, r, e) {
  const a = P(
    i,
    r
  );
  return {
    ...a,
    getFieldMetaData: () => a.getFieldMetaData(e),
    setFieldMetaData: (t) => a.setFieldMetaData(e, t),
    removeFieldMetaData: () => a.removeFieldMetaData(e),
    // NEW: Direct access to the DOM refs for this field
    getFieldRefs: () => {
      const t = l.getState().getShadowMetadata(i, e);
      if (!t?.clientActivityState?.elements) return [];
      const o = [];
      return t.clientActivityState.elements.forEach((n) => {
        n.domRef?.current && o.push(n.domRef);
      }), o;
    },
    getFieldElements: () => {
      const t = l.getState().getShadowMetadata(i, e);
      if (!t?.clientActivityState?.elements) return [];
      const o = [];
      return t.clientActivityState.elements.forEach((n) => {
        n.domRef?.current && o.push(n.domRef.current);
      }), o;
    },
    setFieldDisabled: (t) => {
      const o = l.getState().getShadowMetadata(i, e);
      o?.clientActivityState?.elements && o.clientActivityState.elements.forEach((n) => {
        const c = n.domRef?.current;
        c && ("disabled" in c ? c.disabled = t : (c.style.pointerEvents = t ? "none" : "", c.setAttribute("aria-disabled", String(t))));
      });
    }
  };
}
const u = (i, r) => (e) => ({
  target: i,
  pathPattern: r,
  handler: e
}), E = () => {
  const i = [], r = new Proxy(
    {},
    {
      get(e, a) {
        if (typeof a != "string") return r;
        if (a !== "then")
          return i.push(a === "$" ? "*" : a), r;
      }
    }
  );
  return { recorder: r, path: i };
}, R = () => ({
  path: (r) => {
    const { recorder: e, path: a } = E();
    r(e);
    const t = u(
      "any",
      a
    );
    return t.array = u("array", a), t.object = u("object", a), t.primitive = u("primitive", a), t.boolean = u("boolean", a), t.field = u("any", a), t;
  },
  array: u("array"),
  object: u("object"),
  primitive: u("primitive"),
  boolean: u("boolean"),
  field: u("any")
});
function x(i) {
  function r(e) {
    const a = (n, c, d, g, f, m, S) => ({
      name: e,
      initialState: m,
      useHook: n,
      transformState: c,
      onUpdate: d,
      onFormUpdate: g,
      formWrapper: S,
      chainMethods: f
    });
    function t(n, c, d, g, f, m, S) {
      const D = a(
        n,
        c,
        d,
        g,
        f,
        m,
        S
      ), v = {};
      return c || (v.transformState = (s) => t(
        n,
        s,
        d,
        g,
        f,
        m,
        S
      )), d || (v.onUpdate = (s) => t(
        n,
        c,
        s,
        g,
        f,
        m,
        S
      )), g || (v.onFormUpdate = (s) => t(
        n,
        c,
        d,
        s,
        f,
        m,
        S
      )), f || (v.methods = (s) => t(
        n,
        c,
        d,
        g,
        s(R()),
        m,
        S
      )), m || (v.initialState = (s) => t(
        n,
        c,
        d,
        g,
        f,
        s,
        S
      )), S || (v.formWrapper = (s) => t(
        n,
        c,
        d,
        g,
        f,
        m,
        s
      )), Object.assign(D, v);
    }
    return Object.assign(
      t(),
      {
        useHook(n) {
          return t(n);
        },
        initialState(n) {
          return t(void 0, void 0, void 0, void 0, void 0, n);
        }
      }
    );
  }
  return { createPlugin: r };
}
export {
  P as createMetadataContext,
  x as createPluginContext,
  $ as createScopedMetadataContext,
  j as keyedSchema,
  O as toDeconstructedMethods
};
//# sourceMappingURL=plugins.js.map
