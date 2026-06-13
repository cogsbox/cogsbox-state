import { z as M } from "zod";
import { getGlobalStore as l, setAllFieldsDisabled as b, getAllFieldElements as A } from "./store.js";
const j = () => M.object({
  __key: M.literal("keyed"),
  map: M.any()
});
function $(e) {
  return {
    initialiseState: (a) => {
      e.$update(a);
    },
    initialiseShadowState: (a) => {
      e.$initializeAndMergeShadowState(a);
    },
    applyOperation: (a, i) => e.$applyOperation(a, i),
    addZodErrors: (a) => e.$addZodValidation(a),
    clearZodErrors: (a) => e.$clearZodValidationPaths(a),
    getState: () => e.$get(),
    setOptions: (a) => {
      e.$setOptions(a);
    }
  };
}
function P(e, a) {
  return {
    getPluginMetaData: () => l.getState().getPluginMetaDataMap(e, [])?.get(a),
    setPluginMetaData: (i) => l.getState().setPluginMetaData(e, [], a, i),
    removePluginMetaData: () => l.getState().removePluginMetaData(e, [], a),
    getFieldMetaData: (i) => l.getState().getPluginMetaDataMap(e, i)?.get(a),
    setFieldMetaData: (i, r) => l.getState().setPluginMetaData(e, i, a, r),
    removeFieldMetaData: (i) => l.getState().removePluginMetaData(e, i, a),
    getFieldRefs: (i) => {
      const r = l.getState().getShadowMetadata(e, i);
      if (!r?.clientActivityState?.elements) return [];
      const t = [];
      return r.clientActivityState.elements.forEach((n) => {
        n.domRef?.current && t.push(n.domRef);
      }), t;
    },
    getFieldElements: (i) => {
      const r = l.getState().getShadowMetadata(e, i);
      if (!r?.clientActivityState?.elements) return [];
      const t = [];
      return r.clientActivityState.elements.forEach((n) => {
        n.domRef?.current && t.push(n.domRef.current);
      }), t;
    },
    setFieldDisabled: (i, r) => {
      const t = l.getState().getShadowMetadata(e, i);
      t?.clientActivityState?.elements && t.clientActivityState.elements.forEach((n) => {
        const o = n.domRef?.current;
        o && ("disabled" in o ? o.disabled = r : (o.style.pointerEvents = r ? "none" : "", o.setAttribute("aria-disabled", String(r))));
      });
    },
    getAllFieldElements: () => A(e),
    setAllFieldsDisabled: (i) => b(e, i)
  };
}
function O(e, a, i) {
  const r = P(
    e,
    a
  );
  return {
    ...r,
    getFieldMetaData: () => r.getFieldMetaData(i),
    setFieldMetaData: (t) => r.setFieldMetaData(i, t),
    removeFieldMetaData: () => r.removeFieldMetaData(i),
    // NEW: Direct access to the DOM refs for this field
    getFieldRefs: () => {
      const t = l.getState().getShadowMetadata(e, i);
      if (!t?.clientActivityState?.elements) return [];
      const n = [];
      return t.clientActivityState.elements.forEach((o) => {
        o.domRef?.current && n.push(o.domRef);
      }), n;
    },
    getFieldElements: () => {
      const t = l.getState().getShadowMetadata(e, i);
      if (!t?.clientActivityState?.elements) return [];
      const n = [];
      return t.clientActivityState.elements.forEach((o) => {
        o.domRef?.current && n.push(o.domRef.current);
      }), n;
    },
    setFieldDisabled: (t) => {
      const n = l.getState().getShadowMetadata(e, i);
      n?.clientActivityState?.elements && n.clientActivityState.elements.forEach((o) => {
        const c = o.domRef?.current;
        c && ("disabled" in c ? c.disabled = t : (c.style.pointerEvents = t ? "none" : "", c.setAttribute("aria-disabled", String(t))));
      });
    }
  };
}
const u = (e, a) => (i) => ({
  target: e,
  pathPattern: a,
  handler: i
}), E = () => {
  const e = [], a = new Proxy(
    {},
    {
      get(i, r) {
        if (typeof r != "string") return a;
        if (r !== "then")
          return e.push(r === "$" ? "*" : r), a;
      }
    }
  );
  return { recorder: a, path: e };
}, R = () => ({
  path: (a) => {
    const { recorder: i, path: r } = E();
    a(i);
    const t = u(
      "any",
      r
    );
    return t.array = u("array", r), t.object = u("object", r), t.primitive = u("primitive", r), t.boolean = u("boolean", r), t.field = u("any", r), t;
  },
  array: u("array"),
  object: u("object"),
  primitive: u("primitive"),
  boolean: u("boolean"),
  field: u("any")
});
function x(e) {
  function a(i) {
    const r = (o, c, d, g, f, m, S) => ({
      name: i,
      initialState: m,
      useHook: o,
      transformState: c,
      onUpdate: d,
      onFormUpdate: g,
      formWrapper: S,
      chainMethods: f
    });
    function t(o, c, d, g, f, m, S) {
      const D = r(
        o,
        c,
        d,
        g,
        f,
        m,
        S
      ), v = {};
      return c || (v.transformState = (s) => t(
        o,
        s,
        d,
        g,
        f,
        m,
        S
      )), d || (v.onUpdate = (s) => t(
        o,
        c,
        s,
        g,
        f,
        m,
        S
      )), g || (v.onFormUpdate = (s) => t(
        o,
        c,
        d,
        s,
        f,
        m,
        S
      )), f || (v.methods = (s) => t(
        o,
        c,
        d,
        g,
        s(R()),
        m,
        S
      )), m || (v.initialState = (s) => t(
        o,
        c,
        d,
        g,
        f,
        s,
        S
      )), S || (v.formWrapper = (s) => t(
        o,
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
        useHook(o) {
          return t(o);
        },
        initialState(o) {
          return t(void 0, void 0, void 0, void 0, void 0, o);
        }
      }
    );
  }
  return { createPlugin: a };
}
export {
  P as createMetadataContext,
  x as createPluginContext,
  O as createScopedMetadataContext,
  j as keyedSchema,
  $ as toDeconstructedMethods
};
//# sourceMappingURL=plugins.js.map
