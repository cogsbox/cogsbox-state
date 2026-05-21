import { z as S } from "zod";
import { getGlobalStore as l, setAllFieldsDisabled as v, getAllFieldElements as D } from "./store.js";
const E = () => S.object({
  __key: S.literal("keyed"),
  map: S.any()
});
function F(a) {
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
function b(a, n) {
  return {
    getPluginMetaData: () => l.getState().getPluginMetaDataMap(a, [])?.get(n),
    setPluginMetaData: (e) => l.getState().setPluginMetaData(a, [], n, e),
    removePluginMetaData: () => l.getState().removePluginMetaData(a, [], n),
    getFieldMetaData: (e) => l.getState().getPluginMetaDataMap(a, e)?.get(n),
    setFieldMetaData: (e, i) => l.getState().setPluginMetaData(a, e, n, i),
    removeFieldMetaData: (e) => l.getState().removePluginMetaData(a, e, n),
    getFieldRefs: (e) => {
      const i = l.getState().getShadowMetadata(a, e);
      if (!i?.clientActivityState?.elements) return [];
      const t = [];
      return i.clientActivityState.elements.forEach((o) => {
        o.domRef?.current && t.push(o.domRef);
      }), t;
    },
    getFieldElements: (e) => {
      const i = l.getState().getShadowMetadata(a, e);
      if (!i?.clientActivityState?.elements) return [];
      const t = [];
      return i.clientActivityState.elements.forEach((o) => {
        o.domRef?.current && t.push(o.domRef.current);
      }), t;
    },
    setFieldDisabled: (e, i) => {
      const t = l.getState().getShadowMetadata(a, e);
      t?.clientActivityState?.elements && t.clientActivityState.elements.forEach((o) => {
        const r = o.domRef?.current;
        r && ("disabled" in r ? r.disabled = i : (r.style.pointerEvents = i ? "none" : "", r.setAttribute("aria-disabled", String(i))));
      });
    },
    getAllFieldElements: () => D(a),
    setAllFieldsDisabled: (e) => v(a, e)
  };
}
function R(a, n, e) {
  const i = b(
    a,
    n
  );
  return {
    ...i,
    getFieldMetaData: () => i.getFieldMetaData(e),
    setFieldMetaData: (t) => i.setFieldMetaData(e, t),
    removeFieldMetaData: () => i.removeFieldMetaData(e),
    // NEW: Direct access to the DOM refs for this field
    getFieldRefs: () => {
      const t = l.getState().getShadowMetadata(a, e);
      if (!t?.clientActivityState?.elements) return [];
      const o = [];
      return t.clientActivityState.elements.forEach((r) => {
        r.domRef?.current && o.push(r.domRef);
      }), o;
    },
    getFieldElements: () => {
      const t = l.getState().getShadowMetadata(a, e);
      if (!t?.clientActivityState?.elements) return [];
      const o = [];
      return t.clientActivityState.elements.forEach((r) => {
        r.domRef?.current && o.push(r.domRef.current);
      }), o;
    },
    setFieldDisabled: (t) => {
      const o = l.getState().getShadowMetadata(a, e);
      o?.clientActivityState?.elements && o.clientActivityState.elements.forEach((r) => {
        const c = r.domRef?.current;
        c && ("disabled" in c ? c.disabled = t : (c.style.pointerEvents = t ? "none" : "", c.setAttribute("aria-disabled", String(t))));
      });
    }
  };
}
const s = (a, n) => (e) => ({
  target: a,
  pathPattern: n,
  handler: e
}), A = () => {
  const a = [], n = new Proxy(
    {},
    {
      get(e, i) {
        if (typeof i != "string") return n;
        if (i !== "then")
          return a.push(i === "$" ? "*" : i), n;
      }
    }
  );
  return { recorder: n, path: a };
}, h = () => ({
  path: (n) => {
    const { recorder: e, path: i } = A();
    n(e);
    const t = s(
      "any",
      i
    );
    return t.array = s("array", i), t.object = s("object", i), t.primitive = s("primitive", i), t.boolean = s("boolean", i), t.field = s("any", i), t;
  },
  array: s("array"),
  object: s("object"),
  primitive: s("primitive"),
  boolean: s("boolean"),
  field: s("any")
});
function y(a) {
  function n(e) {
    const i = (r, c, d, u, g) => ({
      name: e,
      useHook: r,
      transformState: c,
      onUpdate: d,
      onFormUpdate: u,
      chainMethods: g
    });
    function t(r, c, d, u, g) {
      const M = i(
        r,
        c,
        d,
        u,
        g
      ), m = {};
      return c || (m.transformState = (f) => t(r, f, d, u, g)), d || (m.onUpdate = (f) => t(r, c, f, u, g)), u || (m.onFormUpdate = (f) => t(r, c, d, f, g)), g || (m.methods = (f) => t(
        r,
        c,
        d,
        u,
        f(h())
      )), Object.assign(M, m);
    }
    return Object.assign(
      t(),
      {
        useHook(r) {
          return t(r);
        }
      }
    );
  }
  return { createPlugin: n };
}
export {
  b as createMetadataContext,
  y as createPluginContext,
  R as createScopedMetadataContext,
  E as keyedSchema,
  F as toDeconstructedMethods
};
//# sourceMappingURL=plugins.js.map
