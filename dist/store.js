import { create as I } from "zustand";
const A = I((c, r) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, o) => c((t) => {
    const n = new Map(t.formRefs);
    return n.set(e, o), { formRefs: n };
  }),
  getFormRef: (e) => r().formRefs.get(e),
  removeFormRef: (e) => c((o) => {
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
function b(c, r = "zod4") {
  if (!c) return null;
  let e = c, o = !1, t = !1, n, a = !1;
  if (c._def) {
    let s = c;
    for (; s._def; ) {
      const i = s._def.typeName;
      if (i === "ZodOptional")
        t = !0, s = s._def.innerType || s.unwrap();
      else if (i === "ZodNullable")
        o = !0, s = s._def.innerType || s.unwrap();
      else if (i === "ZodDefault")
        a = !0, n = s._def.defaultValue(), s = s._def.innerType;
      else if (i === "ZodEffects")
        s = s._def.schema;
      else
        break;
    }
    e = s;
    const l = e._def?.typeName;
    if (l === "ZodNumber")
      return {
        type: "number",
        schema: c,
        // Store the original schema with wrappers
        source: r,
        default: a ? n : 0,
        nullable: o,
        optional: t
      };
    if (l === "ZodString")
      return {
        type: "string",
        schema: c,
        source: r,
        default: a ? n : "",
        nullable: o,
        optional: t
      };
    if (l === "ZodBoolean")
      return {
        type: "boolean",
        schema: c,
        source: r,
        default: a ? n : !1,
        nullable: o,
        optional: t
      };
    if (l === "ZodArray")
      return {
        type: "array",
        schema: c,
        source: r,
        default: a ? n : [],
        nullable: o,
        optional: t
      };
    if (l === "ZodObject")
      return {
        type: "object",
        schema: c,
        source: r,
        default: a ? n : {},
        nullable: o,
        optional: t
      };
    if (l === "ZodDate")
      return {
        type: "date",
        schema: c,
        source: r,
        default: a ? n : /* @__PURE__ */ new Date(),
        nullable: o,
        optional: t
      };
  }
  if (c._type) {
    let s = c;
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
        schema: c,
        source: r,
        default: a ? n : 0,
        nullable: o,
        optional: t
      };
    if (e._type === "string")
      return {
        type: "string",
        schema: c,
        source: r,
        default: a ? n : "",
        nullable: o,
        optional: t
      };
    if (e._type === "boolean")
      return {
        type: "boolean",
        schema: c,
        source: r,
        default: a ? n : !1,
        nullable: o,
        optional: t
      };
    if (e._type === "array")
      return {
        type: "array",
        schema: c,
        source: r,
        default: a ? n : [],
        nullable: o,
        optional: t
      };
    if (e._type === "object")
      return {
        type: "object",
        schema: c,
        source: r,
        default: a ? n : {},
        nullable: o,
        optional: t
      };
    if (e._type === "date")
      return {
        type: "date",
        schema: c,
        source: r,
        default: a ? n : /* @__PURE__ */ new Date(),
        nullable: o,
        optional: t
      };
  }
  return null;
}
function M(c) {
  if (c === null)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: null,
      nullable: !0
    };
  if (c === void 0)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: void 0,
      optional: !0
    };
  const r = typeof c;
  return r === "number" ? { type: "number", schema: null, source: "runtime", default: c } : r === "string" ? { type: "string", schema: null, source: "runtime", default: c } : r === "boolean" ? { type: "boolean", schema: null, source: "runtime", default: c } : Array.isArray(c) ? { type: "array", schema: null, source: "runtime", default: [] } : c instanceof Date ? { type: "date", schema: null, source: "runtime", default: c } : r === "object" ? { type: "object", schema: null, source: "runtime", default: {} } : { type: "unknown", schema: null, source: "runtime", default: c };
}
function S(c, r, e) {
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
      t || (t = M(o._meta.value)), t && (o._meta || (o._meta = {}), o._meta.typeInfo = t);
    } else {
      const t = M(r);
      o._meta || (o._meta = {}), o._meta.typeInfo = t;
    }
    return o;
  }
  if (Array.isArray(r)) {
    const o = { _meta: { arrayKeys: [] } }, t = [];
    if (r.forEach((n, a) => {
      const s = `${_(c)}`, l = e ? {
        ...e,
        path: [...e.path, a.toString()]
      } : void 0;
      o[s] = S(c, n, l), t.push(s);
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
        o[t] = S(c, r[t], n);
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
const m = /* @__PURE__ */ new Map();
let O = 0;
const E = Date.now().toString(36);
function _(c) {
  return `id:${j.getState().getShadowMetadata(c, [])?.syncArrayIdPrefix || "local"}_${E}_${(O++).toString(36)}`;
}
const j = I((c, r) => ({
  setTransformCache: (e, o, t, n) => {
    const a = r().getShadowMetadata(e, o) || {};
    a.transformCaches || (a.transformCaches = /* @__PURE__ */ new Map()), a.transformCaches.set(t, n), r().setShadowMetadata(e, o, {
      transformCaches: a.transformCaches
    });
  },
  initializeAndMergeShadowState: (e, o) => {
    const n = o?._meta?.arrayKeys !== void 0 ? `[${e}` : e, a = m.get(n) || m.get(e) || m.get(`[${e}`);
    let s = {};
    if (a?._meta) {
      const {
        components: i,
        features: f,
        lastServerSync: d,
        stateSource: u,
        baseServerState: p,
        pathComponents: y,
        signals: h,
        validation: w,
        syncArrayIdPrefix: g
      } = a._meta;
      i && (s.components = i), f && (s.features = f), d && (s.lastServerSync = d), u && (s.stateSource = u), p && (s.baseServerState = p), y && (s.pathComponents = y), h && (s.signals = h), w && (s.validation = w), g && (s.syncArrayIdPrefix = g);
    }
    function l(i, f) {
      if (f._meta?.hasOwnProperty("value")) {
        i._meta || (i._meta = {}), i._meta.value = f._meta.value;
        for (const d in i)
          d !== "_meta" && delete i[d];
        return i;
      }
      if (f._meta?.arrayKeys) {
        const d = { ...i._meta };
        return delete d.arrayKeys, i._meta?.arrayKeys && i._meta.arrayKeys.forEach((u) => {
          delete i[u];
        }), i._meta = { ...d, ...f._meta }, f._meta.arrayKeys.forEach((u) => {
          i[u] = f[u];
        }), i;
      }
      for (const d in f)
        d === "_meta" ? i._meta = { ...i._meta || {}, ...f._meta || {} } : i[d] && typeof i[d] == "object" && typeof f[d] == "object" ? l(i[d], f[d]) : i[d] = f[d];
      if (!f._meta?.arrayKeys && !f._meta?.hasOwnProperty("value"))
        for (const d in i)
          d !== "_meta" && !f.hasOwnProperty(d) && delete i[d];
      return i;
    }
    a ? (l(a, o), a._meta || (a._meta = {}), Object.assign(a._meta, s), m.set(n, a)) : (s && Object.keys(s).length > 0 && (o._meta || (o._meta = {}), Object.assign(o._meta, s)), m.set(n, o)), n === e ? m.delete(`[${e}`) : m.delete(e);
  },
  initializeShadowState: (e, o) => {
    const t = m.get(e) || m.get(`[${e}`);
    let n = {};
    if (console.log("existingRoot initializeShadowState", t), t?._meta) {
      const {
        components: d,
        features: u,
        lastServerSync: p,
        stateSource: y,
        baseServerState: h
      } = t._meta;
      d && (n.components = d), u && (n.features = u), p && (n.lastServerSync = p), y && (n.stateSource = y), h && (n.baseServerState = h);
    }
    m.delete(e), m.delete(`[${e}`);
    const a = r().getInitialOptions(e), s = r().getInitialOptions("__syncSchemas"), l = {
      stateKey: e,
      path: [],
      schemas: {
        sync: s,
        zodV4: a?.validation?.zodSchemaV4,
        zodV3: a?.validation?.zodSchemaV3
      }
    }, i = S(e, o, l);
    i._meta || (i._meta = {}), Object.assign(i._meta, n), console.log("existingRoot newRoot", i);
    const f = Array.isArray(o) ? `[${e}` : e;
    m.set(f, i);
  },
  getShadowNode: (e, o) => {
    let t = m.get(e) || m.get(`[${e}`);
    if (t) {
      if (o.length === 0) return t;
      for (const n of o)
        if (typeof t != "object" || t === null || (t = t[n], t === void 0)) return;
      return t;
    }
  },
  getShadowMetadata: (e, o) => r().getShadowNode(e, o)?._meta,
  setShadowMetadata: (e, o, t) => {
    const n = m.has(`[${e}`) ? `[${e}` : e;
    let a = m.get(n);
    if (!a) {
      a = { _meta: t }, m.set(n, a);
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
    const i = {};
    for (const f of s)
      f !== "_meta" && !f.startsWith("id:") && (i[f] = r().getShadowValue(e, [...o, f]));
    return i;
  },
  updateShadowAtPath: (e, o, t) => {
    const n = m.has(`[${e}`) ? `[${e}` : e;
    let a = m.get(n);
    if (!a) return;
    let s = a;
    for (let f = 0; f < o.length - 1; f++)
      s[o[f]] || (s[o[f]] = {}), s = s[o[f]];
    const l = o.length === 0 ? s : s[o[o.length - 1]];
    if (!l) {
      s[o[o.length - 1]] = S(e, t), r().notifyPathSubscribers([e, ...o].join("."), {
        type: "UPDATE",
        newValue: t
      });
      return;
    }
    function i(f, d) {
      if (typeof d != "object" || d === null || Array.isArray(d)) {
        const p = f._meta;
        for (const h in f)
          h !== "_meta" && delete f[h];
        const y = S(e, d);
        Object.assign(f, y), p && (f._meta = { ...p, ...f._meta || {} });
        return;
      }
      const u = new Set(Object.keys(d));
      for (const p of u) {
        const y = d[p];
        f[p] ? i(f[p], y) : f[p] = S(e, y);
      }
      for (const p in f)
        p === "_meta" || !Object.prototype.hasOwnProperty.call(f, p) || u.has(p) || delete f[p];
    }
    i(l, t), r().notifyPathSubscribers([e, ...o].join("."), {
      type: "UPDATE",
      newValue: t
    });
  },
  addItemsToArrayNode: (e, o, t, n) => {
    const a = m.has(`[${e}`) ? `[${e}` : e;
    let s = m.get(a);
    if (!s) {
      console.error("Root not found for state key:", e);
      return;
    }
    let l = s;
    for (const i of o)
      l[i] || (l[i] = {}), l = l[i];
    Object.assign(l, t), l._meta || (l._meta = {}), l._meta.arrayKeys = n;
  },
  insertShadowArrayElement: (e, o, t, n, a) => {
    const s = r().getShadowNode(e, o);
    if (!s?._meta?.arrayKeys)
      throw new Error(
        `Array not found at path: ${[e, ...o].join(".")}`
      );
    const l = a || _(e), i = { [l]: S(e, t) }, f = s._meta.arrayKeys, d = n !== void 0 && n >= 0 && n <= f.length ? n : f.length;
    d >= f.length ? f.push(l) : f.splice(d, 0, l), r().addItemsToArrayNode(e, o, i, f);
    const u = [e, ...o].join(".");
    return r().notifyPathSubscribers(u, {
      type: "INSERT",
      path: u,
      itemKey: `${u}.${l}`,
      index: d
    }), l;
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
    t.forEach((u) => {
      const p = `${_(e)}`;
      l.push(p), s[p] = S(e, u);
    });
    const i = a._meta.arrayKeys, f = n !== void 0 && n >= 0 && n <= i.length ? n : i.length;
    f >= i.length ? i.push(...l) : i.splice(f, 0, ...l), r().addItemsToArrayNode(e, o, s, i);
    const d = [e, ...o].join(".");
    r().notifyPathSubscribers(d, {
      type: "INSERT_MANY",
      path: d,
      count: t.length,
      index: f
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
    const i = [e, ...t].join(".");
    r().notifyPathSubscribers(i, {
      type: "REMOVE",
      path: i,
      itemKey: `${i}.${n}`
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
        const i = [e, ...o].join("."), f = new Set(l.paths);
        f.add(i);
        const d = { ...l, paths: f }, u = new Map(s.components);
        u.set(t, d), r().setShadowMetadata(e, [], { components: u });
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
    c((t) => ({
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
    c((t) => {
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
    c((o) => {
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
    c((o) => {
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
    !e || e.length === 0 || c((o) => {
      const t = new Map(o.stateLog), n = /* @__PURE__ */ new Map();
      for (const a of e) {
        const s = n.get(a.stateKey) || [];
        s.push(a), n.set(a.stateKey, s);
      }
      for (const [a, s] of n.entries()) {
        const l = new Map(t.get(a));
        for (const i of s)
          l.set(JSON.stringify(i.path), { ...i });
        t.set(a, l);
      }
      return { stateLog: t };
    });
  },
  getInitialOptions: (e) => r().initialStateOptions[e],
  setInitialStateOptions: (e, o) => {
    c((t) => ({
      initialStateOptions: { ...t.initialStateOptions, [e]: o }
    }));
  },
  updateInitialStateGlobal: (e, o) => {
    c((t) => ({
      initialStateGlobal: { ...t.initialStateGlobal, [e]: o }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, o) => c((t) => {
    const n = new Map(t.syncInfoStore);
    return n.set(e, o), { syncInfoStore: n };
  }),
  getSyncInfo: (e) => r().syncInfoStore.get(e) || null
}));
export {
  S as buildShadowNode,
  A as formRefStore,
  _ as generateId,
  j as getGlobalStore,
  m as shadowStateStore
};
//# sourceMappingURL=store.js.map
