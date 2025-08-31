import { create as g } from "zustand";
const N = g((i, r) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, o) => i((t) => {
    const n = new Map(t.formRefs);
    return n.set(e, o), { formRefs: n };
  }),
  getFormRef: (e) => r().formRefs.get(e),
  removeFormRef: (e) => i((o) => {
    const t = new Map(o.formRefs);
    return t.delete(e), { formRefs: t };
  }),
  getFormRefsByStateKey: (e) => {
    const o = r().formRefs, t = e + ".", n = /* @__PURE__ */ new Map();
    return o.forEach((a, s) => {
      (s.startsWith(t) || s === e) && n.set(s, a);
    }), n;
  }
}));
function b(i, r = "zod4") {
  if (!i) return null;
  let e = i, o = !1, t = !1, n, a = !1;
  if (i._def) {
    let s = i;
    for (; s._def; ) {
      const f = s._def.typeName;
      if (f === "ZodOptional")
        t = !0, s = s._def.innerType || s.unwrap();
      else if (f === "ZodNullable")
        o = !0, s = s._def.innerType || s.unwrap();
      else if (f === "ZodDefault")
        a = !0, n = s._def.defaultValue(), s = s._def.innerType;
      else if (f === "ZodEffects")
        s = s._def.schema;
      else
        break;
    }
    e = s;
    const l = e._def?.typeName;
    if (l === "ZodNumber")
      return {
        type: "number",
        schema: i,
        // Store the original schema with wrappers
        source: r,
        default: a ? n : 0,
        nullable: o,
        optional: t
      };
    if (l === "ZodString")
      return {
        type: "string",
        schema: i,
        source: r,
        default: a ? n : "",
        nullable: o,
        optional: t
      };
    if (l === "ZodBoolean")
      return {
        type: "boolean",
        schema: i,
        source: r,
        default: a ? n : !1,
        nullable: o,
        optional: t
      };
    if (l === "ZodArray")
      return {
        type: "array",
        schema: i,
        source: r,
        default: a ? n : [],
        nullable: o,
        optional: t
      };
    if (l === "ZodObject")
      return {
        type: "object",
        schema: i,
        source: r,
        default: a ? n : {},
        nullable: o,
        optional: t
      };
    if (l === "ZodDate")
      return {
        type: "date",
        schema: i,
        source: r,
        default: a ? n : /* @__PURE__ */ new Date(),
        nullable: o,
        optional: t
      };
  }
  if (i._type) {
    let s = i;
    for (; s; )
      if (s._type === "optional")
        t = !0, s = s._def?.innerType || s._inner;
      else if (s._type === "nullable")
        o = !0, s = s._def?.innerType || s._inner;
      else if (s._def?.defaultValue !== void 0) {
        a = !0, n = typeof s._def.defaultValue == "function" ? s._def.defaultValue() : s._def.defaultValue;
        break;
      } else
        break;
    if (e = s, e._type === "number")
      return {
        type: "number",
        schema: i,
        source: r,
        default: a ? n : 0,
        nullable: o,
        optional: t
      };
    if (e._type === "string")
      return {
        type: "string",
        schema: i,
        source: r,
        default: a ? n : "",
        nullable: o,
        optional: t
      };
    if (e._type === "boolean")
      return {
        type: "boolean",
        schema: i,
        source: r,
        default: a ? n : !1,
        nullable: o,
        optional: t
      };
    if (e._type === "array")
      return {
        type: "array",
        schema: i,
        source: r,
        default: a ? n : [],
        nullable: o,
        optional: t
      };
    if (e._type === "object")
      return {
        type: "object",
        schema: i,
        source: r,
        default: a ? n : {},
        nullable: o,
        optional: t
      };
    if (e._type === "date")
      return {
        type: "date",
        schema: i,
        source: r,
        default: a ? n : /* @__PURE__ */ new Date(),
        nullable: o,
        optional: t
      };
  }
  return null;
}
function w(i) {
  if (i === null)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: null,
      nullable: !0
    };
  if (i === void 0)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: void 0,
      optional: !0
    };
  const r = typeof i;
  return r === "number" ? { type: "number", schema: null, source: "runtime", default: i } : r === "string" ? { type: "string", schema: null, source: "runtime", default: i } : r === "boolean" ? { type: "boolean", schema: null, source: "runtime", default: i } : Array.isArray(i) ? { type: "array", schema: null, source: "runtime", default: [] } : i instanceof Date ? { type: "date", schema: null, source: "runtime", default: i } : r === "object" ? { type: "object", schema: null, source: "runtime", default: {} } : { type: "unknown", schema: null, source: "runtime", default: i };
}
function h(i, r, e) {
  if (r == null || typeof r != "object") {
    const o = { _meta: {} };
    if (o._meta.value = r, e) {
      let t = null;
      if (e.schemas.sync && e.schemas.sync[e.stateKey]) {
        const n = e.schemas.sync[e.stateKey];
        if (n.schemas?.validation) {
          let a = n.schemas.validation;
          for (const s of e.path)
            a?.shape ? a = a.shape[s] : a?._def?.shape && (a = a._def.shape()[s]);
          if (a && (t = b(a, "sync"), t && n.schemas.defaults)) {
            let s = n.schemas.defaults;
            for (const l of e.path)
              s && typeof s == "object" && (s = s[l]);
            s !== void 0 && (t.default = s, r == null && !t.optional && (o._meta.value = s));
          }
        }
      }
      if (!t && e.schemas.zodV4) {
        let n = e.schemas.zodV4;
        for (const a of e.path)
          n?.shape ? n = n.shape[a] : n?._def?.shape && (n = n._def.shape()[a]);
        n && (t = b(n, "zod4"), t && r == null && !t.optional && !t.nullable && (o.value = t.default));
      }
      if (!t && e.schemas.zodV3) {
        let n = e.schemas.zodV3;
        for (const a of e.path)
          n?.shape ? n = n.shape[a] : n?._shape && (n = n._shape[a]);
        n && (t = b(n, "zod3"), t && r == null && !t.optional && !t.nullable && (o.value = t.default));
      }
      t || (t = w(o._meta.value)), t && (o._meta || (o._meta = {}), o._meta.typeInfo = t);
    } else {
      const t = w(r);
      o._meta || (o._meta = {}), o._meta.typeInfo = t;
    }
    return o;
  }
  if (Array.isArray(r)) {
    const o = { _meta: { arrayKeys: [] } }, t = [];
    if (r.forEach((n, a) => {
      const s = `${_(i)}`, l = e ? {
        ...e,
        path: [...e.path, a.toString()]
      } : void 0;
      o[s] = h(i, n, l), t.push(s);
    }), o._meta.arrayKeys = t, e) {
      let n = null;
      if (e.schemas.zodV4) {
        let a = e.schemas.zodV4;
        for (const s of e.path)
          a?.shape ? a = a.shape[s] : a?._def?.shape && (a = a._def.shape()[s]);
        n = a;
      }
      o._meta.typeInfo = {
        type: "array",
        schema: n,
        source: n ? "zod4" : "runtime",
        default: []
      };
    }
    return o;
  }
  if (r.constructor === Object) {
    const o = { _meta: {} };
    for (const t in r)
      if (Object.prototype.hasOwnProperty.call(r, t)) {
        const n = e ? {
          ...e,
          path: [...e.path, t]
        } : void 0;
        o[t] = h(i, r[t], n);
      }
    if (e) {
      let t = null;
      if (e.schemas.zodV4) {
        let n = e.schemas.zodV4;
        for (const a of e.path)
          n?.shape ? n = n.shape[a] : n?._def?.shape && (n = n._def.shape()[a]);
        t = n;
      }
      o._meta.typeInfo = {
        type: "object",
        schema: t,
        source: t ? "zod4" : "runtime",
        default: {}
      };
    }
    return o;
  }
  return { value: r };
}
const p = /* @__PURE__ */ new Map();
let M = 0;
function _(i) {
  return `id:${I.getState().getShadowMetadata(i, [])?.syncArrayIdPrefix || "local"}_${(M++).toString(36)}`;
}
const I = g((i, r) => ({
  // Remove shadowStateStore from Zustand state
  setTransformCache: (e, o, t, n) => {
    const a = r().getShadowMetadata(e, o) || {};
    a.transformCaches || (a.transformCaches = /* @__PURE__ */ new Map()), a.transformCaches.set(t, n), r().setShadowMetadata(e, o, {
      transformCaches: a.transformCaches
    });
  },
  initializeShadowState: (e, o) => {
    const t = p.get(e) || p.get(`[${e}`);
    let n = {};
    if (t?._meta) {
      const {
        components: d,
        features: m,
        lastServerSync: u,
        stateSource: y,
        baseServerState: S
      } = t._meta;
      d && (n.components = d), m && (n.features = m), u && (n.lastServerSync = u), y && (n.stateSource = y), S && (n.baseServerState = S);
    }
    p.delete(e), p.delete(`[${e}`);
    const a = r().getInitialOptions(e), s = r().getInitialOptions("__syncSchemas"), l = {
      stateKey: e,
      path: [],
      schemas: {
        sync: s,
        zodV4: a?.validation?.zodSchemaV4,
        zodV3: a?.validation?.zodSchemaV3
      }
    }, f = h(e, o, l);
    f._meta || (f._meta = {}), Object.assign(f._meta, n);
    const c = Array.isArray(o) ? `[${e}` : e;
    p.set(c, f);
  },
  getShadowNode: (e, o) => {
    let t = p.get(e) || p.get(`[${e}`);
    if (t) {
      if (o.length === 0) return t;
      for (const n of o)
        if (typeof t != "object" || t === null || (t = t[n], t === void 0)) return;
      return t;
    }
  },
  getShadowMetadata: (e, o) => r().getShadowNode(e, o)?._meta,
  setShadowMetadata: (e, o, t) => {
    const n = p.has(`[${e}`) ? `[${e}` : e;
    let a = p.get(n);
    if (!a) {
      a = { _meta: t }, p.set(n, a);
      return;
    }
    let s = a;
    for (const l of o)
      s[l] || (s[l] = {}), s = s[l];
    s._meta || (s._meta = {}), Object.assign(s._meta, t);
  },
  getShadowValue: (e, o, t, n) => {
    const a = r().getShadowNode(e, o);
    if (a == null) return;
    const s = Object.keys(a);
    if (a._meta && Object.prototype.hasOwnProperty.call(a._meta, "value") && s.length === 1 && s[0] === "_meta")
      return a._meta.value;
    if (a._meta && Object.prototype.hasOwnProperty.call(a._meta, "arrayKeys"))
      return (t !== void 0 && t.length > 0 ? t : a._meta.arrayKeys).map(
        (d) => r().getShadowValue(e, [...o, d])
      );
    const f = {};
    for (const c of s)
      c !== "_meta" && !c.startsWith("id:") && (f[c] = r().getShadowValue(e, [...o, c]));
    return f;
  },
  updateShadowAtPath: (e, o, t) => {
    const n = p.has(`[${e}`) ? `[${e}` : e;
    let a = p.get(n);
    if (!a) return;
    let s = a;
    for (let c = 0; c < o.length - 1; c++)
      s[o[c]] || (s[o[c]] = {}), s = s[o[c]];
    const l = o.length === 0 ? s : s[o[o.length - 1]];
    if (!l) {
      s[o[o.length - 1]] = h(e, t), r().notifyPathSubscribers([e, ...o].join("."), {
        type: "UPDATE",
        newValue: t
      });
      return;
    }
    function f(c, d) {
      if (typeof d != "object" || d === null || Array.isArray(d)) {
        const u = c._meta;
        for (const S in c)
          S !== "_meta" && delete c[S];
        const y = h(e, d);
        Object.assign(c, y), u && (c._meta = { ...u, ...c._meta || {} });
        return;
      }
      const m = new Set(Object.keys(d));
      for (const u of m) {
        const y = d[u];
        c[u] ? f(c[u], y) : c[u] = h(e, y);
      }
      for (const u in c)
        u === "_meta" || !Object.prototype.hasOwnProperty.call(c, u) || m.has(u) || delete c[u];
    }
    f(l, t), r().notifyPathSubscribers([e, ...o].join("."), {
      type: "UPDATE",
      newValue: t
    });
  },
  addItemsToArrayNode: (e, o, t, n) => {
    const a = p.has(`[${e}`) ? `[${e}` : e;
    let s = p.get(a);
    if (!s) {
      console.error("Root not found for state key:", e);
      return;
    }
    let l = s;
    for (const f of o)
      l[f] || (l[f] = {}), l = l[f];
    Object.assign(l, t), l._meta || (l._meta = {}), l._meta.arrayKeys = n;
  },
  insertShadowArrayElement: (e, o, t, n) => {
    const a = r().getShadowNode(e, o);
    if (!a?._meta?.arrayKeys)
      throw new Error(
        `Array not found at path: ${[e, ...o].join(".")}`
      );
    const s = `${_(e)}`, l = { [s]: h(e, t) }, f = a._meta.arrayKeys, c = n !== void 0 && n >= 0 && n <= f.length ? n : f.length;
    c >= f.length ? f.push(s) : f.splice(c, 0, s), r().addItemsToArrayNode(e, o, l, f);
    const d = [e, ...o].join(".");
    return r().notifyPathSubscribers(d, {
      type: "INSERT",
      path: d,
      itemKey: `${d}.${s}`,
      index: c
    }), s;
  },
  insertManyShadowArrayElements: (e, o, t, n) => {
    if (!t || t.length === 0)
      return;
    const a = r().getShadowNode(e, o);
    if (!a?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[e, ...o].join(".")}`
      );
      return;
    }
    const s = {}, l = [];
    t.forEach((m) => {
      const u = `${_(e)}`;
      l.push(u), s[u] = h(e, m);
    });
    const f = a._meta.arrayKeys, c = n !== void 0 && n >= 0 && n <= f.length ? n : f.length;
    c >= f.length ? f.push(...l) : f.splice(c, 0, ...l), r().addItemsToArrayNode(e, o, s, f);
    const d = [e, ...o].join(".");
    r().notifyPathSubscribers(d, {
      type: "INSERT_MANY",
      path: d,
      count: t.length,
      index: c
    });
  },
  removeShadowArrayElement: (e, o) => {
    if (o.length === 0) return;
    const t = o.slice(0, -1), n = o[o.length - 1];
    if (!n?.startsWith("id:")) return;
    const a = r().getShadowNode(e, t);
    if (!a?._meta?.arrayKeys) return;
    const s = a._meta.arrayKeys, l = s.indexOf(n);
    if (l === -1) return;
    l === s.length - 1 ? s.pop() : l === 0 ? s.shift() : s.splice(l, 1), delete a[n];
    const f = [e, ...t].join(".");
    r().notifyPathSubscribers(f, {
      type: "REMOVE",
      path: f,
      itemKey: `${f}.${n}`
    });
  },
  registerComponent: (e, o, t) => {
    const n = r().getShadowMetadata(e, []) || {}, a = new Map(n.components);
    a.set(o, t), r().setShadowMetadata(e, [], { components: a });
  },
  unregisterComponent: (e, o) => {
    const t = r().getShadowMetadata(e, []);
    if (!t?.components) return;
    const n = new Map(t.components);
    n.delete(o) && r().setShadowMetadata(e, [], { components: n });
  },
  addPathComponent: (e, o, t) => {
    const n = r().getShadowMetadata(e, o) || {}, a = new Set(n.pathComponents);
    a.add(t), r().setShadowMetadata(e, o, {
      pathComponents: a
    });
    const s = r().getShadowMetadata(e, []);
    if (s?.components) {
      const l = s.components.get(t);
      if (l) {
        const f = [e, ...o].join("."), c = new Set(l.paths);
        c.add(f);
        const d = { ...l, paths: c }, m = new Map(s.components);
        m.set(t, d), r().setShadowMetadata(e, [], { components: m });
      }
    }
  },
  markAsDirty: (e, o, t = { bubble: !0 }) => {
    const n = (a) => r().getShadowNode(e, a)?._meta?.isDirty ? !0 : (r().setShadowMetadata(e, a, { isDirty: !0 }), !1);
    if (n(o), t.bubble) {
      let a = [...o];
      for (; a.length > 0 && (a.pop(), !n(a)); )
        ;
    }
  },
  // Keep these in Zustand as they need React reactivity
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (e, o) => {
    i((t) => ({
      serverStateUpdates: new Map(t.serverStateUpdates).set(
        e,
        o
      )
    })), r().notifyPathSubscribers(e, {
      type: "SERVER_STATE_UPDATE",
      serverState: o
    });
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (e, o) => {
    const t = r().pathSubscribers, n = t.get(e) || /* @__PURE__ */ new Set();
    return n.add(o), t.set(e, n), () => {
      const a = r().pathSubscribers.get(e);
      a && (a.delete(o), a.size === 0 && r().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, o) => {
    const n = r().pathSubscribers.get(e);
    n && n.forEach((a) => a(o));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, o) => {
    const t = r().selectedIndicesMap.get(e);
    if (!t) return -1;
    const n = r().getShadowMetadata(
      e.split(".")[0],
      e.split(".").slice(1)
    ), a = o || n?.arrayKeys;
    return a ? a.indexOf(t) : -1;
  },
  setSelectedIndex: (e, o) => {
    i((t) => {
      const n = new Map(t.selectedIndicesMap);
      return o === void 0 ? n.delete(e) : (n.has(e) && r().notifyPathSubscribers(n.get(e), {
        type: "THIS_UNSELECTED"
      }), n.set(e, o), r().notifyPathSubscribers(o, { type: "THIS_SELECTED" })), r().notifyPathSubscribers(e, { type: "GET_SELECTED" }), {
        ...t,
        selectedIndicesMap: n
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: e }) => {
    i((o) => {
      const t = new Map(o.selectedIndicesMap), n = t.get(e);
      return n && r().notifyPathSubscribers(n, {
        type: "CLEAR_SELECTION"
      }), t.delete(e), r().notifyPathSubscribers(e, {
        type: "CLEAR_SELECTION"
      }), {
        ...o,
        selectedIndicesMap: t
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    i((o) => {
      const t = new Map(o.selectedIndicesMap);
      let n = !1;
      for (const a of t.keys())
        (a === e || a.startsWith(e + ".")) && (t.delete(a), n = !0);
      return n ? { selectedIndicesMap: t } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (e) => {
    !e || e.length === 0 || i((o) => {
      const t = new Map(o.stateLog), n = /* @__PURE__ */ new Map();
      for (const a of e) {
        const s = n.get(a.stateKey) || [];
        s.push(a), n.set(a.stateKey, s);
      }
      for (const [a, s] of n.entries()) {
        const l = new Map(t.get(a));
        for (const f of s)
          l.set(JSON.stringify(f.path), { ...f });
        t.set(a, l);
      }
      return { stateLog: t };
    });
  },
  getInitialOptions: (e) => r().initialStateOptions[e],
  setInitialStateOptions: (e, o) => {
    i((t) => ({
      initialStateOptions: { ...t.initialStateOptions, [e]: o }
    }));
  },
  updateInitialStateGlobal: (e, o) => {
    i((t) => ({
      initialStateGlobal: { ...t.initialStateGlobal, [e]: o }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, o) => i((t) => {
    const n = new Map(t.syncInfoStore);
    return n.set(e, o), { syncInfoStore: n };
  }),
  getSyncInfo: (e) => r().syncInfoStore.get(e) || null
}));
export {
  h as buildShadowNode,
  N as formRefStore,
  _ as generateId,
  I as getGlobalStore
};
//# sourceMappingURL=store.js.map
