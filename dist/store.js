import { create as I } from "zustand";
const A = I((c, r) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, a) => c((t) => {
    const n = new Map(t.formRefs);
    return n.set(e, a), { formRefs: n };
  }),
  getFormRef: (e) => r().formRefs.get(e),
  removeFormRef: (e) => c((a) => {
    const t = new Map(a.formRefs);
    return t.delete(e), { formRefs: t };
  }),
  getFormRefsByStateKey: (e) => {
    const a = r().formRefs, t = e + ".", n = /* @__PURE__ */ new Map();
    return a.forEach((o, s) => {
      (s.startsWith(t) || s === e) && n.set(s, o);
    }), n;
  }
}));
function b(c, r = "zod4") {
  if (!c) return null;
  let e = c, a = !1, t = !1, n, o = !1;
  if (c._def) {
    let s = c;
    for (; s._def; ) {
      const i = s._def.typeName;
      if (i === "ZodOptional")
        t = !0, s = s._def.innerType || s.unwrap();
      else if (i === "ZodNullable")
        a = !0, s = s._def.innerType || s.unwrap();
      else if (i === "ZodDefault")
        o = !0, n = s._def.defaultValue(), s = s._def.innerType;
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
        default: o ? n : 0,
        nullable: a,
        optional: t
      };
    if (l === "ZodString")
      return {
        type: "string",
        schema: c,
        source: r,
        default: o ? n : "",
        nullable: a,
        optional: t
      };
    if (l === "ZodBoolean")
      return {
        type: "boolean",
        schema: c,
        source: r,
        default: o ? n : !1,
        nullable: a,
        optional: t
      };
    if (l === "ZodArray")
      return {
        type: "array",
        schema: c,
        source: r,
        default: o ? n : [],
        nullable: a,
        optional: t
      };
    if (l === "ZodObject")
      return {
        type: "object",
        schema: c,
        source: r,
        default: o ? n : {},
        nullable: a,
        optional: t
      };
    if (l === "ZodDate")
      return {
        type: "date",
        schema: c,
        source: r,
        default: o ? n : /* @__PURE__ */ new Date(),
        nullable: a,
        optional: t
      };
  }
  if (c._type) {
    let s = c;
    for (; s; )
      if (s._type === "optional")
        t = !0, s = s._def?.innerType || s._inner;
      else if (s._type === "nullable")
        a = !0, s = s._def?.innerType || s._inner;
      else if (s._def?.defaultValue !== void 0) {
        o = !0, n = typeof s._def.defaultValue == "function" ? s._def.defaultValue() : s._def.defaultValue;
        break;
      } else
        break;
    if (e = s, e._type === "number")
      return {
        type: "number",
        schema: c,
        source: r,
        default: o ? n : 0,
        nullable: a,
        optional: t
      };
    if (e._type === "string")
      return {
        type: "string",
        schema: c,
        source: r,
        default: o ? n : "",
        nullable: a,
        optional: t
      };
    if (e._type === "boolean")
      return {
        type: "boolean",
        schema: c,
        source: r,
        default: o ? n : !1,
        nullable: a,
        optional: t
      };
    if (e._type === "array")
      return {
        type: "array",
        schema: c,
        source: r,
        default: o ? n : [],
        nullable: a,
        optional: t
      };
    if (e._type === "object")
      return {
        type: "object",
        schema: c,
        source: r,
        default: o ? n : {},
        nullable: a,
        optional: t
      };
    if (e._type === "date")
      return {
        type: "date",
        schema: c,
        source: r,
        default: o ? n : /* @__PURE__ */ new Date(),
        nullable: a,
        optional: t
      };
  }
  return null;
}
function g(c) {
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
    const a = { _meta: {} };
    if (a._meta.value = r, e) {
      let t = null;
      if (e.schemas.sync && e.schemas.sync[e.stateKey]) {
        const n = e.schemas.sync[e.stateKey];
        if (n.schemas?.validation) {
          let o = n.schemas.validation;
          for (const s of e.path)
            o?.shape ? o = o.shape[s] : o?._def?.shape && (o = o._def.shape()[s]);
          if (o && (t = b(o, "sync"), t && n.schemas.defaults)) {
            let s = n.schemas.defaults;
            for (const l of e.path)
              s && typeof s == "object" && (s = s[l]);
            s !== void 0 && (t.default = s, r == null && !t.optional && (a._meta.value = s));
          }
        }
      }
      if (!t && e.schemas.zodV4) {
        let n = e.schemas.zodV4;
        for (const o of e.path)
          n?.shape ? n = n.shape[o] : n?._def?.shape && (n = n._def.shape()[o]);
        n && (t = b(n, "zod4"), t && r == null && !t.optional && !t.nullable && (a.value = t.default));
      }
      if (!t && e.schemas.zodV3) {
        let n = e.schemas.zodV3;
        for (const o of e.path)
          n?.shape ? n = n.shape[o] : n?._shape && (n = n._shape[o]);
        n && (t = b(n, "zod3"), t && r == null && !t.optional && !t.nullable && (a.value = t.default));
      }
      t || (t = g(a._meta.value)), t && (a._meta || (a._meta = {}), a._meta.typeInfo = t);
    } else {
      const t = g(r);
      a._meta || (a._meta = {}), a._meta.typeInfo = t;
    }
    return a;
  }
  if (Array.isArray(r)) {
    const a = { _meta: { arrayKeys: [] } }, t = [];
    if (r.forEach((n, o) => {
      const s = `${_(c)}`, l = e ? {
        ...e,
        path: [...e.path, o.toString()]
      } : void 0;
      a[s] = S(c, n, l), t.push(s);
    }), a._meta.arrayKeys = t, e) {
      let n = null;
      if (e.schemas.zodV4) {
        let o = e.schemas.zodV4;
        for (const s of e.path)
          o?.shape ? o = o.shape[s] : o?._def?.shape && (o = o._def.shape()[s]);
        n = o;
      }
      a._meta.typeInfo = {
        type: "array",
        schema: n,
        source: n ? "zod4" : "runtime",
        default: []
      };
    }
    return a;
  }
  if (r.constructor === Object) {
    const a = { _meta: {} };
    for (const t in r)
      if (Object.prototype.hasOwnProperty.call(r, t)) {
        const n = e ? {
          ...e,
          path: [...e.path, t]
        } : void 0;
        a[t] = S(c, r[t], n);
      }
    if (e) {
      let t = null;
      if (e.schemas.zodV4) {
        let n = e.schemas.zodV4;
        for (const o of e.path)
          n?.shape ? n = n.shape[o] : n?._def?.shape && (n = n._def.shape()[o]);
        t = n;
      }
      a._meta.typeInfo = {
        type: "object",
        schema: t,
        source: t ? "zod4" : "runtime",
        default: {}
      };
    }
    return a;
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
  setTransformCache: (e, a, t, n) => {
    const o = r().getShadowMetadata(e, a) || {};
    o.transformCaches || (o.transformCaches = /* @__PURE__ */ new Map()), o.transformCaches.set(t, n), r().setShadowMetadata(e, a, {
      transformCaches: o.transformCaches
    });
  },
  initializeAndMergeShadowState: (e, a) => {
    const n = a?._meta?.arrayKeys !== void 0 ? `[${e}` : e, o = m.get(n) || m.get(e) || m.get(`[${e}`);
    let s = {};
    if (o?._meta) {
      const {
        components: i,
        features: f,
        lastServerSync: d,
        stateSource: u,
        baseServerState: p,
        pathComponents: y,
        signals: h,
        validation: w,
        syncArrayIdPrefix: M
      } = o._meta;
      i && (s.components = i), f && (s.features = f), d && (s.lastServerSync = d), u && (s.stateSource = u), p && (s.baseServerState = p), y && (s.pathComponents = y), h && (s.signals = h), w && (s.validation = w), M && (s.syncArrayIdPrefix = M);
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
    o ? (l(o, a), o._meta || (o._meta = {}), Object.assign(o._meta, s), m.set(n, o)) : (s && Object.keys(s).length > 0 && (a._meta || (a._meta = {}), Object.assign(a._meta, s)), m.set(n, a)), n === e ? m.delete(`[${e}`) : m.delete(e);
  },
  initializeShadowState: (e, a) => {
    const t = m.get(e) || m.get(`[${e}`);
    let n = {};
    if (t?._meta) {
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
    const o = r().getInitialOptions(e), s = r().getInitialOptions("__syncSchemas"), l = {
      stateKey: e,
      path: [],
      schemas: {
        sync: s,
        zodV4: o?.validation?.zodSchemaV4,
        zodV3: o?.validation?.zodSchemaV3
      }
    }, i = S(e, a, l);
    i._meta || (i._meta = {}), Object.assign(i._meta, n);
    const f = Array.isArray(a) ? `[${e}` : e;
    m.set(f, i);
  },
  getShadowNode: (e, a) => {
    let t = m.get(e) || m.get(`[${e}`);
    if (t) {
      if (a.length === 0) return t;
      for (const n of a)
        if (typeof t != "object" || t === null || (t = t[n], t === void 0)) return;
      return t;
    }
  },
  getShadowMetadata: (e, a) => r().getShadowNode(e, a)?._meta,
  setShadowMetadata: (e, a, t) => {
    const n = m.has(`[${e}`) ? `[${e}` : e;
    let o = m.get(n);
    if (!o) {
      o = { _meta: t }, m.set(n, o);
      return;
    }
    let s = o;
    for (const l of a)
      s[l] || (s[l] = {}), s = s[l];
    s._meta || (s._meta = {}), Object.assign(s._meta, t);
  },
  getShadowValue: (e, a, t, n) => {
    const o = r().getShadowNode(e, a);
    if (o == null) return;
    const s = Object.keys(o);
    if (o._meta && Object.prototype.hasOwnProperty.call(o._meta, "value") && s.length === 1 && s[0] === "_meta")
      return o._meta.value;
    if (o._meta && Object.prototype.hasOwnProperty.call(o._meta, "arrayKeys"))
      return (t !== void 0 && t.length > 0 ? t : o._meta.arrayKeys).map(
        (d) => r().getShadowValue(e, [...a, d])
      );
    const i = {};
    for (const f of s)
      f !== "_meta" && !f.startsWith("id:") && (i[f] = r().getShadowValue(e, [...a, f]));
    return i;
  },
  updateShadowAtPath: (e, a, t) => {
    const n = m.has(`[${e}`) ? `[${e}` : e;
    let o = m.get(n);
    if (!o) return;
    let s = o;
    for (let f = 0; f < a.length - 1; f++)
      s[a[f]] || (s[a[f]] = {}), s = s[a[f]];
    const l = a.length === 0 ? s : s[a[a.length - 1]];
    if (!l) {
      s[a[a.length - 1]] = S(e, t), r().notifyPathSubscribers([e, ...a].join("."), {
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
    i(l, t), r().notifyPathSubscribers([e, ...a].join("."), {
      type: "UPDATE",
      newValue: t
    });
  },
  addItemsToArrayNode: (e, a, t, n) => {
    const o = m.has(`[${e}`) ? `[${e}` : e;
    let s = m.get(o);
    if (!s) {
      console.error("Root not found for state key:", e);
      return;
    }
    let l = s;
    for (const i of a)
      l[i] || (l[i] = {}), l = l[i];
    Object.assign(l, t), l._meta || (l._meta = {}), l._meta.arrayKeys = n;
  },
  insertShadowArrayElement: (e, a, t, n, o) => {
    const s = r().getShadowNode(e, a);
    if (!s?._meta?.arrayKeys)
      throw new Error(
        `Array not found at path: ${[e, ...a].join(".")}`
      );
    const l = o || _(e), i = { [l]: S(e, t) }, f = s._meta.arrayKeys, d = n !== void 0 && n >= 0 && n <= f.length ? n : f.length;
    d >= f.length ? f.push(l) : f.splice(d, 0, l), r().addItemsToArrayNode(e, a, i, f);
    const u = [e, ...a].join(".");
    return r().notifyPathSubscribers(u, {
      type: "INSERT",
      path: u,
      itemKey: `${u}.${l}`,
      index: d
    }), l;
  },
  insertManyShadowArrayElements: (e, a, t, n) => {
    if (!t || t.length === 0)
      return;
    const o = r().getShadowNode(e, a);
    if (!o?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[e, ...a].join(".")}`
      );
      return;
    }
    const s = {}, l = [];
    t.forEach((u) => {
      const p = `${_(e)}`;
      l.push(p), s[p] = S(e, u);
    });
    const i = o._meta.arrayKeys, f = n !== void 0 && n >= 0 && n <= i.length ? n : i.length;
    f >= i.length ? i.push(...l) : i.splice(f, 0, ...l), r().addItemsToArrayNode(e, a, s, i);
    const d = [e, ...a].join(".");
    r().notifyPathSubscribers(d, {
      type: "INSERT_MANY",
      path: d,
      count: t.length,
      index: f
    });
  },
  removeShadowArrayElement: (e, a) => {
    if (a.length === 0) return;
    const t = a.slice(0, -1), n = a[a.length - 1];
    if (!n?.startsWith("id:")) return;
    const o = r().getShadowNode(e, t);
    if (!o?._meta?.arrayKeys) return;
    const s = o._meta.arrayKeys, l = s.indexOf(n);
    if (l === -1) return;
    l === s.length - 1 ? s.pop() : l === 0 ? s.shift() : s.splice(l, 1), delete o[n];
    const i = [e, ...t].join(".");
    r().notifyPathSubscribers(i, {
      type: "REMOVE",
      path: i,
      itemKey: `${i}.${n}`
    });
  },
  registerComponent: (e, a, t) => {
    const n = r().getShadowMetadata(e, []) || {}, o = new Map(n.components);
    o.set(a, t), r().setShadowMetadata(e, [], { components: o });
  },
  unregisterComponent: (e, a) => {
    const t = r().getShadowMetadata(e, []);
    if (!t?.components) return;
    const n = new Map(t.components);
    n.delete(a) && r().setShadowMetadata(e, [], { components: n });
  },
  addPathComponent: (e, a, t) => {
    const n = r().getShadowMetadata(e, a) || {}, o = new Set(n.pathComponents);
    o.add(t), r().setShadowMetadata(e, a, {
      pathComponents: o
    });
    const s = r().getShadowMetadata(e, []);
    if (s?.components) {
      const l = s.components.get(t);
      if (l) {
        const i = [e, ...a].join("."), f = new Set(l.paths);
        f.add(i);
        const d = { ...l, paths: f }, u = new Map(s.components);
        u.set(t, d), r().setShadowMetadata(e, [], { components: u });
      }
    }
  },
  markAsDirty: (e, a, t = { bubble: !0 }) => {
    const n = (o) => r().getShadowNode(e, o)?._meta?.isDirty ? !0 : (r().setShadowMetadata(e, o, { isDirty: !0 }), !1);
    if (n(a), t.bubble) {
      let o = [...a];
      for (; o.length > 0 && (o.pop(), !n(o)); )
        ;
    }
  },
  // Keep these in Zustand as they need React reactivity
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (e, a) => {
    c((t) => ({
      serverStateUpdates: new Map(t.serverStateUpdates).set(
        e,
        a
      )
    })), r().notifyPathSubscribers(e, {
      type: "SERVER_STATE_UPDATE",
      serverState: a
    });
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (e, a) => {
    const t = r().pathSubscribers, n = t.get(e) || /* @__PURE__ */ new Set();
    return n.add(a), t.set(e, n), () => {
      const o = r().pathSubscribers.get(e);
      o && (o.delete(a), o.size === 0 && r().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, a) => {
    const n = r().pathSubscribers.get(e);
    n && n.forEach((o) => o(a));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, a) => {
    const t = r().selectedIndicesMap.get(e);
    if (!t) return -1;
    const n = r().getShadowMetadata(
      e.split(".")[0],
      e.split(".").slice(1)
    ), o = a || n?.arrayKeys;
    return o ? o.indexOf(t) : -1;
  },
  setSelectedIndex: (e, a) => {
    c((t) => {
      const n = new Map(t.selectedIndicesMap);
      return a === void 0 ? n.delete(e) : (n.has(e) && r().notifyPathSubscribers(n.get(e), {
        type: "THIS_UNSELECTED"
      }), n.set(e, a), r().notifyPathSubscribers(a, { type: "THIS_SELECTED" })), r().notifyPathSubscribers(e, { type: "GET_SELECTED" }), {
        ...t,
        selectedIndicesMap: n
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: e }) => {
    c((a) => {
      const t = new Map(a.selectedIndicesMap), n = t.get(e);
      return n && r().notifyPathSubscribers(n, {
        type: "CLEAR_SELECTION"
      }), t.delete(e), r().notifyPathSubscribers(e, {
        type: "CLEAR_SELECTION"
      }), {
        ...a,
        selectedIndicesMap: t
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    c((a) => {
      const t = new Map(a.selectedIndicesMap);
      let n = !1;
      for (const o of t.keys())
        (o === e || o.startsWith(e + ".")) && (t.delete(o), n = !0);
      return n ? { selectedIndicesMap: t } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (e) => {
    !e || e.length === 0 || c((a) => {
      const t = new Map(a.stateLog), n = /* @__PURE__ */ new Map();
      for (const o of e) {
        const s = n.get(o.stateKey) || [];
        s.push(o), n.set(o.stateKey, s);
      }
      for (const [o, s] of n.entries()) {
        const l = new Map(t.get(o));
        for (const i of s)
          l.set(JSON.stringify(i.path), { ...i });
        t.set(o, l);
      }
      return { stateLog: t };
    });
  },
  getInitialOptions: (e) => r().initialStateOptions[e],
  setInitialStateOptions: (e, a) => {
    c((t) => ({
      initialStateOptions: { ...t.initialStateOptions, [e]: a }
    }));
  },
  updateInitialStateGlobal: (e, a) => {
    c((t) => ({
      initialStateGlobal: { ...t.initialStateGlobal, [e]: a }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, a) => c((t) => {
    const n = new Map(t.syncInfoStore);
    return n.set(e, a), { syncInfoStore: n };
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
