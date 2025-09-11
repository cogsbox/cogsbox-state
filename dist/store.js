import { create as I } from "zustand";
function w(d, s = "zod4") {
  if (!d) return null;
  let e = d, t = !1, a = !1, n, o = !1;
  if (d._def) {
    let r = d;
    for (; r._def; ) {
      const l = r._def.typeName;
      if (l === "ZodOptional")
        a = !0, r = r._def.innerType || r.unwrap();
      else if (l === "ZodNullable")
        t = !0, r = r._def.innerType || r.unwrap();
      else if (l === "ZodDefault")
        o = !0, n = r._def.defaultValue(), r = r._def.innerType;
      else if (l === "ZodEffects")
        r = r._def.schema;
      else
        break;
    }
    e = r;
    const i = e._def?.typeName;
    if (i === "ZodNumber")
      return {
        type: "number",
        schema: d,
        // Store the original schema with wrappers
        source: s,
        default: o ? n : 0,
        nullable: t,
        optional: a
      };
    if (i === "ZodString")
      return {
        type: "string",
        schema: d,
        source: s,
        default: o ? n : "",
        nullable: t,
        optional: a
      };
    if (i === "ZodBoolean")
      return {
        type: "boolean",
        schema: d,
        source: s,
        default: o ? n : !1,
        nullable: t,
        optional: a
      };
    if (i === "ZodArray")
      return {
        type: "array",
        schema: d,
        source: s,
        default: o ? n : [],
        nullable: t,
        optional: a
      };
    if (i === "ZodObject")
      return {
        type: "object",
        schema: d,
        source: s,
        default: o ? n : {},
        nullable: t,
        optional: a
      };
    if (i === "ZodDate")
      return {
        type: "date",
        schema: d,
        source: s,
        default: o ? n : /* @__PURE__ */ new Date(),
        nullable: t,
        optional: a
      };
  }
  if (d._type) {
    let r = d;
    for (; r; )
      if (r._type === "optional")
        a = !0, r = r._def?.innerType || r._inner;
      else if (r._type === "nullable")
        t = !0, r = r._def?.innerType || r._inner;
      else if (r._def?.defaultValue !== void 0) {
        o = !0, n = typeof r._def.defaultValue == "function" ? r._def.defaultValue() : r._def.defaultValue;
        break;
      } else
        break;
    if (e = r, e._type === "number")
      return {
        type: "number",
        schema: d,
        source: s,
        default: o ? n : 0,
        nullable: t,
        optional: a
      };
    if (e._type === "string")
      return {
        type: "string",
        schema: d,
        source: s,
        default: o ? n : "",
        nullable: t,
        optional: a
      };
    if (e._type === "boolean")
      return {
        type: "boolean",
        schema: d,
        source: s,
        default: o ? n : !1,
        nullable: t,
        optional: a
      };
    if (e._type === "array")
      return {
        type: "array",
        schema: d,
        source: s,
        default: o ? n : [],
        nullable: t,
        optional: a
      };
    if (e._type === "object")
      return {
        type: "object",
        schema: d,
        source: s,
        default: o ? n : {},
        nullable: t,
        optional: a
      };
    if (e._type === "date")
      return {
        type: "date",
        schema: d,
        source: s,
        default: o ? n : /* @__PURE__ */ new Date(),
        nullable: t,
        optional: a
      };
  }
  return null;
}
function M(d) {
  if (d === null)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: null,
      nullable: !0
    };
  if (d === void 0)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: void 0,
      optional: !0
    };
  const s = typeof d;
  return s === "number" ? { type: "number", schema: null, source: "runtime", default: d } : s === "string" ? { type: "string", schema: null, source: "runtime", default: d } : s === "boolean" ? { type: "boolean", schema: null, source: "runtime", default: d } : Array.isArray(d) ? { type: "array", schema: null, source: "runtime", default: [] } : d instanceof Date ? { type: "date", schema: null, source: "runtime", default: d } : s === "object" ? { type: "object", schema: null, source: "runtime", default: {} } : { type: "unknown", schema: null, source: "runtime", default: d };
}
function b(d, s, e) {
  if (s == null || typeof s != "object") {
    const t = {
      _meta: {
        value: s
      }
    };
    let a = null;
    if (e) {
      if (e.schemas.zodV4) {
        const n = e.path.length === 0 ? e.schemas.zodV4 : _(e.schemas.zodV4, e.path);
        n && (a = w(n, "zod4"));
      }
      if (!a && e.schemas.zodV3) {
        const n = e.path.length === 0 ? e.schemas.zodV3 : _(e.schemas.zodV3, e.path);
        n && (a = w(n, "zod3"));
      }
      !a && e.schemas.sync?.[d] && (a = M(s), a.source = "sync");
    }
    return a || (a = M(s)), t._meta.typeInfo = a, t;
  }
  if (Array.isArray(s)) {
    const t = {
      _meta: {
        arrayKeys: []
      }
    }, a = [];
    if (s.forEach((n, o) => {
      const r = g(), i = e ? {
        ...e,
        path: [...e.path, o.toString()]
      } : void 0;
      t[r] = b(d, n, i), a.push(r);
    }), t._meta.arrayKeys = a, e) {
      let n = null;
      if (e.schemas.zodV4) {
        const o = e.path.length === 0 ? e.schemas.zodV4 : _(e.schemas.zodV4, e.path);
        o && (n = w(o, "zod4"));
      }
      if (!n && e.schemas.zodV3) {
        const o = e.path.length === 0 ? e.schemas.zodV3 : _(e.schemas.zodV3, e.path);
        o && (n = w(o, "zod3"));
      }
      n || (n = {
        type: "array",
        schema: null,
        source: "runtime",
        default: []
      }), t._meta.typeInfo = n;
    }
    return t;
  }
  if (s.constructor === Object) {
    const t = Object.keys(s);
    let a = !0;
    for (const o of t) {
      const r = s[o], i = typeof r;
      if (r !== null && i !== "string" && i !== "number" && i !== "boolean") {
        a = !1;
        break;
      }
    }
    const n = {
      _meta: {
        typeInfo: {
          type: "object",
          schema: e ? _(
            e.schemas.zodV4 || e.schemas.zodV3,
            e.path
          ) : null,
          source: e?.schemas.zodV4 ? "zod4" : e?.schemas.zodV3 ? "zod3" : "runtime",
          default: {}
        }
      }
    };
    if (a && !e)
      for (const o of t)
        n[o] = {
          _meta: {
            value: s[o],
            typeInfo: M(s[o])
          }
        };
    else
      for (const o in s)
        if (Object.prototype.hasOwnProperty.call(s, o)) {
          const r = e ? {
            ...e,
            path: [...e.path, o]
          } : void 0;
          n[o] = b(d, s[o], r);
        }
    return n;
  }
  return {
    _meta: {
      value: s,
      typeInfo: M(s)
    }
  };
}
function _(d, s) {
  if (!d || s.length === 0) return d;
  let e = d;
  for (const t of s) {
    if (e._def) {
      for (; e._def && (e._def.typeName === "ZodOptional" || e._def.typeName === "ZodNullable" || e._def.typeName === "ZodDefault"); )
        e = e._def.innerType || e.unwrap();
      if (e._def.typeName === "ZodObject")
        e = e.shape[t];
      else if (e._def.typeName === "ZodArray")
        e = e._def.type;
      else
        return null;
    } else if (e._type)
      if (e._type === "object" && e._shape)
        e = e._shape[t];
      else if (e._type === "array" && e._def)
        e = e._def.type;
      else
        return null;
    else
      return null;
    if (!e) return null;
  }
  return e;
}
const y = /* @__PURE__ */ new Map();
let N = 0;
const O = Date.now().toString(36);
function g(d) {
  return `id:local_${O}_${(N++).toString(36)}`;
}
const E = I((d, s) => ({
  getPluginMetaDataMap: (e, t) => s().getShadowMetadata(e, t)?.pluginMetaData,
  setPluginMetaData: (e, t, a, n) => {
    const o = s().getShadowMetadata(e, t) || {}, r = new Map(o.pluginMetaData || []), i = r.get(a) || {};
    r.set(a, { ...i, ...n }), s().setShadowMetadata(e, t, { ...o, pluginMetaData: r }), s().notifyPathSubscribers([e, ...t].join("."), {
      type: "METADATA_UPDATE"
    });
  },
  removePluginMetaData: (e, t, a) => {
    const n = s().getShadowMetadata(e, t);
    if (!n?.pluginMetaData) return;
    const o = new Map(n.pluginMetaData);
    o.delete(a), s().setShadowMetadata(e, t, { ...n, pluginMetaData: o });
  },
  setTransformCache: (e, t, a, n) => {
    const o = s().getShadowMetadata(e, t) || {};
    o.transformCaches || (o.transformCaches = /* @__PURE__ */ new Map()), o.transformCaches.set(a, n), s().setShadowMetadata(e, t, {
      transformCaches: o.transformCaches
    });
  },
  initializeAndMergeShadowState: (e, t) => {
    const n = t?._meta?.arrayKeys !== void 0 ? `[${e}` : e, o = y.get(n) || y.get(e) || y.get(`[${e}`);
    let r = {};
    if (o?._meta) {
      const {
        components: l,
        features: f,
        lastServerSync: c,
        stateSource: p,
        baseServerState: u,
        pathComponents: m,
        signals: h,
        validation: S
      } = o._meta;
      l && (r.components = l), f && (r.features = f), c && (r.lastServerSync = c), p && (r.stateSource = p), u && (r.baseServerState = u), m && (r.pathComponents = m), h && (r.signals = h), S && (r.validation = S);
    }
    function i(l, f) {
      if (f._meta?.hasOwnProperty("value")) {
        l._meta || (l._meta = {}), l._meta.value = f._meta.value;
        for (const c in l)
          c !== "_meta" && delete l[c];
        return l;
      }
      if (f._meta?.arrayKeys) {
        const c = { ...l._meta };
        return delete c.arrayKeys, l._meta?.arrayKeys && l._meta.arrayKeys.forEach((p) => {
          delete l[p];
        }), l._meta = { ...c, ...f._meta }, f._meta.arrayKeys.forEach((p) => {
          l[p] = f[p];
        }), l;
      }
      for (const c in f)
        c === "_meta" ? l._meta = { ...l._meta || {}, ...f._meta || {} } : l[c] && typeof l[c] == "object" && typeof f[c] == "object" ? i(l[c], f[c]) : l[c] = f[c];
      if (!f._meta?.arrayKeys && !f._meta?.hasOwnProperty("value"))
        for (const c in l)
          c !== "_meta" && !f.hasOwnProperty(c) && delete l[c];
      return l;
    }
    o ? (i(o, t), o._meta || (o._meta = {}), Object.assign(o._meta, r), y.set(n, o)) : (r && Object.keys(r).length > 0 && (t._meta || (t._meta = {}), Object.assign(t._meta, r)), y.set(n, t)), n === e ? y.delete(`[${e}`) : y.delete(e);
  },
  initializeShadowState: (e, t) => {
    const a = y.get(e) || y.get(`[${e}`);
    let n = {};
    if (a?._meta) {
      const {
        components: c,
        features: p,
        lastServerSync: u,
        stateSource: m,
        baseServerState: h
      } = a._meta;
      c && (n.components = c), p && (n.features = p), u && (n.lastServerSync = u), m && (n.stateSource = m), h && (n.baseServerState = h);
    }
    y.delete(e), y.delete(`[${e}`);
    const o = s().getInitialOptions(e), r = s().getInitialOptions("__syncSchemas"), i = {
      stateKey: e,
      path: [],
      schemas: {
        sync: r,
        zodV4: o?.validation?.zodSchemaV4,
        zodV3: o?.validation?.zodSchemaV3
      }
    }, l = b(e, t, i);
    l._meta || (l._meta = {}), Object.assign(l._meta, n);
    const f = Array.isArray(t) ? `[${e}` : e;
    y.set(f, l);
  },
  getShadowNode: (e, t) => {
    let a = y.get(e) || y.get(`[${e}`);
    if (a) {
      if (t.length === 0) return a;
      for (const n of t)
        if (typeof a != "object" || a === null || (a = a[n], a === void 0)) return;
      return a;
    }
  },
  getShadowMetadata: (e, t) => s().getShadowNode(e, t)?._meta,
  setShadowMetadata: (e, t, a) => {
    const n = y.has(`[${e}`) ? `[${e}` : e;
    let o = y.get(n);
    if (!o) {
      o = { _meta: a }, y.set(n, o);
      return;
    }
    let r = o;
    for (const i of t)
      r[i] || (r[i] = {}), r = r[i];
    r._meta || (r._meta = {}), Object.assign(r._meta, a);
  },
  getShadowValue: (e, t, a) => {
    const n = s().getShadowNode(e, t);
    if (!n)
      return;
    const o = {}, r = [
      [n, o, "final"]
    ];
    for (; r.length > 0; ) {
      const [i, l, f] = r.pop();
      if (i._meta?.hasOwnProperty("value")) {
        l[f] = i._meta.value;
        continue;
      }
      if (i._meta?.arrayKeys) {
        const u = a || i._meta.arrayKeys, m = [];
        l[f] = m;
        for (let h = u.length - 1; h >= 0; h--) {
          const S = u[h];
          i[S] && r.push([i[S], m, h]);
        }
        continue;
      }
      const c = {};
      l[f] = c;
      const p = Object.keys(i);
      for (const u of p)
        u !== "_meta" && r.push([i[u], c, u]);
    }
    return o.final;
  },
  updateShadowAtPath: (e, t, a) => {
    const n = y.has(`[${e}`) ? `[${e}` : e;
    let o = y.get(n);
    if (!o) return;
    let r = o;
    for (let f = 0; f < t.length - 1; f++)
      r[t[f]] || (r[t[f]] = {}), r = r[t[f]];
    const i = t.length === 0 ? r : r[t[t.length - 1]];
    if (!i) {
      r[t[t.length - 1]] = b(e, a), s().notifyPathSubscribers([e, ...t].join("."), {
        type: "UPDATE",
        newValue: a
      });
      return;
    }
    function l(f, c) {
      if (typeof c != "object" || c === null || Array.isArray(c)) {
        const u = f._meta;
        for (const h in f)
          h !== "_meta" && delete f[h];
        const m = b(e, c);
        Object.assign(f, m), u && (f._meta = { ...u, ...f._meta || {} });
        return;
      }
      const p = new Set(Object.keys(c));
      for (const u of p) {
        const m = c[u];
        f[u] ? l(f[u], m) : f[u] = b(e, m);
      }
      for (const u in f)
        u === "_meta" || !Object.prototype.hasOwnProperty.call(f, u) || p.has(u) || delete f[u];
    }
    l(i, a), s().notifyPathSubscribers([e, ...t].join("."), {
      type: "UPDATE",
      newValue: a
    });
  },
  addItemsToArrayNode: (e, t, a) => {
    const n = y.has(`[${e}`) ? `[${e}` : e;
    let o = y.get(n);
    if (!o) {
      console.error("Root not found for state key:", e);
      return;
    }
    let r = o;
    for (const i of t)
      r[i] || (r[i] = {}), r = r[i];
    Object.assign(r, a);
  },
  insertShadowArrayElement: (e, t, a, n, o) => {
    const r = s().getShadowNode(e, t);
    if (!r?._meta?.arrayKeys)
      throw new Error(
        `Array not found at path: ${[e, ...t].join(".")}`
      );
    const i = o || `${g()}`;
    r[i] = b(e, a);
    const l = r._meta.arrayKeys, f = n !== void 0 && n >= 0 && n <= l.length ? n : l.length;
    f >= l.length ? l.push(i) : l.splice(f, 0, i);
    const c = [e, ...t].join(".");
    return s().notifyPathSubscribers(c, {
      type: "INSERT",
      path: c,
      itemKey: `${c}.${i}`,
      index: f
    }), i;
  },
  insertManyShadowArrayElements: (e, t, a, n) => {
    if (!a || a.length === 0)
      return;
    const o = s().getShadowNode(e, t);
    if (!o?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[e, ...t].join(".")}`
      );
      return;
    }
    const r = [];
    a.forEach((c) => {
      const p = `${g()}`;
      r.push(p), o[p] = b(e, c);
    });
    const i = o._meta.arrayKeys, l = n !== void 0 && n >= 0 && n <= i.length ? n : i.length;
    l >= i.length ? i.push(...r) : i.splice(l, 0, ...r);
    const f = [e, ...t].join(".");
    s().notifyPathSubscribers(f, {
      type: "INSERT_MANY",
      path: f,
      count: a.length,
      index: l
    });
  },
  removeShadowArrayElement: (e, t) => {
    if (t.length === 0) return;
    const a = t.slice(0, -1), n = t[t.length - 1];
    if (!n?.startsWith("id:")) return;
    const o = s().getShadowNode(e, a);
    if (!o?._meta?.arrayKeys) return;
    const r = o._meta.arrayKeys, i = r.indexOf(n);
    if (i === -1) return;
    i === r.length - 1 ? r.pop() : i === 0 ? r.shift() : r.splice(i, 1), delete o[n];
    const l = [e, ...a].join(".");
    s().notifyPathSubscribers(l, {
      type: "REMOVE",
      path: l,
      itemKey: `${l}.${n}`
    });
  },
  registerComponent: (e, t, a) => {
    const n = s().getShadowMetadata(e, []) || {}, o = new Map(n.components);
    o.set(t, a), s().setShadowMetadata(e, [], { components: o });
  },
  unregisterComponent: (e, t) => {
    const a = s().getShadowMetadata(e, []);
    if (!a?.components) return;
    const n = new Map(a.components);
    n.delete(t) && s().setShadowMetadata(e, [], { components: n });
  },
  addPathComponent: (e, t, a) => {
    const n = s().getShadowMetadata(e, t) || {}, o = new Set(n.pathComponents);
    o.add(a), s().setShadowMetadata(e, t, {
      pathComponents: o
    });
    const r = s().getShadowMetadata(e, []);
    if (r?.components) {
      const i = r.components.get(a);
      if (i) {
        const l = [e, ...t].join("."), f = new Set(i.paths);
        f.add(l);
        const c = { ...i, paths: f }, p = new Map(r.components);
        p.set(a, c), s().setShadowMetadata(e, [], { components: p });
      }
    }
  },
  markAsDirty: (e, t, a = { bubble: !0 }) => {
    let n = s().getShadowNode(e, []);
    if (!n) return;
    let o = n;
    for (const i of t)
      if (o = o[i], !o) return;
    if (o._meta || (o._meta = {}), o._meta.isDirty = !0, !a.bubble) return;
    let r = n;
    for (let i = 0; i < t.length; i++) {
      if (r._meta?.isDirty)
        return;
      r._meta || (r._meta = {}), r._meta.isDirty = !0, r = r[t[i]];
    }
  },
  // Keep these in Zustand as they need React reactivity
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (e, t) => {
    d((a) => ({
      serverStateUpdates: new Map(a.serverStateUpdates).set(
        e,
        t
      )
    })), s().notifyPathSubscribers(e, {
      type: "SERVER_STATE_UPDATE",
      serverState: t
    });
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (e, t) => {
    const a = s().pathSubscribers, n = a.get(e) || /* @__PURE__ */ new Set();
    return n.add(t), a.set(e, n), () => {
      const o = s().pathSubscribers.get(e);
      o && (o.delete(t), o.size === 0 && s().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, t) => {
    const n = s().pathSubscribers.get(e);
    n && n.forEach((o) => o(t));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, t) => {
    const a = s().selectedIndicesMap.get(e);
    if (!a) return -1;
    const n = s().getShadowMetadata(
      e.split(".")[0],
      e.split(".").slice(1)
    ), o = t || n?.arrayKeys;
    return o ? o.indexOf(a) : -1;
  },
  setSelectedIndex: (e, t) => {
    d((a) => {
      const n = new Map(a.selectedIndicesMap);
      return t === void 0 ? n.delete(e) : (n.has(e) && s().notifyPathSubscribers(n.get(e), {
        type: "THIS_UNSELECTED"
      }), n.set(e, t), s().notifyPathSubscribers(t, { type: "THIS_SELECTED" })), s().notifyPathSubscribers(e, { type: "GET_SELECTED" }), {
        ...a,
        selectedIndicesMap: n
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: e }) => {
    d((t) => {
      const a = new Map(t.selectedIndicesMap), n = a.get(e);
      return n && s().notifyPathSubscribers(n, {
        type: "CLEAR_SELECTION"
      }), a.delete(e), s().notifyPathSubscribers(e, {
        type: "CLEAR_SELECTION"
      }), {
        ...t,
        selectedIndicesMap: a
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    d((t) => {
      const a = new Map(t.selectedIndicesMap);
      let n = !1;
      for (const o of a.keys())
        (o === e || o.startsWith(e + ".")) && (a.delete(o), n = !0);
      return n ? { selectedIndicesMap: a } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (e) => {
    !e || e.length === 0 || d((t) => {
      const a = new Map(t.stateLog), n = /* @__PURE__ */ new Map();
      for (const o of e) {
        const r = n.get(o.stateKey) || [];
        r.push(o), n.set(o.stateKey, r);
      }
      for (const [o, r] of n.entries()) {
        const i = new Map(a.get(o));
        for (const l of r)
          i.set(JSON.stringify(l.path), { ...l });
        a.set(o, i);
      }
      return { stateLog: a };
    });
  },
  getInitialOptions: (e) => s().initialStateOptions[e],
  setInitialStateOptions: (e, t) => {
    d((a) => ({
      initialStateOptions: { ...a.initialStateOptions, [e]: t }
    }));
  },
  updateInitialStateGlobal: (e, t) => {
    d((a) => ({
      initialStateGlobal: { ...a.initialStateGlobal, [e]: t }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, t) => d((a) => {
    const n = new Map(a.syncInfoStore);
    return n.set(e, t), { syncInfoStore: n };
  }),
  getSyncInfo: (e) => s().syncInfoStore.get(e) || null
}));
export {
  b as buildShadowNode,
  g as generateId,
  E as getGlobalStore,
  y as shadowStateStore
};
//# sourceMappingURL=store.js.map
