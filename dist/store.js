import { create as g } from "zustand";
function b(d, r = "zod4") {
  if (!d) return null;
  let e = d, a = !1, t = !1, n, o = !1;
  if (d._def) {
    let s = d;
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
    const f = e._def?.typeName;
    if (f === "ZodNumber")
      return {
        type: "number",
        schema: d,
        // Store the original schema with wrappers
        source: r,
        default: o ? n : 0,
        nullable: a,
        optional: t
      };
    if (f === "ZodString")
      return {
        type: "string",
        schema: d,
        source: r,
        default: o ? n : "",
        nullable: a,
        optional: t
      };
    if (f === "ZodBoolean")
      return {
        type: "boolean",
        schema: d,
        source: r,
        default: o ? n : !1,
        nullable: a,
        optional: t
      };
    if (f === "ZodArray")
      return {
        type: "array",
        schema: d,
        source: r,
        default: o ? n : [],
        nullable: a,
        optional: t
      };
    if (f === "ZodObject")
      return {
        type: "object",
        schema: d,
        source: r,
        default: o ? n : {},
        nullable: a,
        optional: t
      };
    if (f === "ZodDate")
      return {
        type: "date",
        schema: d,
        source: r,
        default: o ? n : /* @__PURE__ */ new Date(),
        nullable: a,
        optional: t
      };
  }
  if (d._type) {
    let s = d;
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
        schema: d,
        source: r,
        default: o ? n : 0,
        nullable: a,
        optional: t
      };
    if (e._type === "string")
      return {
        type: "string",
        schema: d,
        source: r,
        default: o ? n : "",
        nullable: a,
        optional: t
      };
    if (e._type === "boolean")
      return {
        type: "boolean",
        schema: d,
        source: r,
        default: o ? n : !1,
        nullable: a,
        optional: t
      };
    if (e._type === "array")
      return {
        type: "array",
        schema: d,
        source: r,
        default: o ? n : [],
        nullable: a,
        optional: t
      };
    if (e._type === "object")
      return {
        type: "object",
        schema: d,
        source: r,
        default: o ? n : {},
        nullable: a,
        optional: t
      };
    if (e._type === "date")
      return {
        type: "date",
        schema: d,
        source: r,
        default: o ? n : /* @__PURE__ */ new Date(),
        nullable: a,
        optional: t
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
  const r = typeof d;
  return r === "number" ? { type: "number", schema: null, source: "runtime", default: d } : r === "string" ? { type: "string", schema: null, source: "runtime", default: d } : r === "boolean" ? { type: "boolean", schema: null, source: "runtime", default: d } : Array.isArray(d) ? { type: "array", schema: null, source: "runtime", default: [] } : d instanceof Date ? { type: "date", schema: null, source: "runtime", default: d } : r === "object" ? { type: "object", schema: null, source: "runtime", default: {} } : { type: "unknown", schema: null, source: "runtime", default: d };
}
function S(d, r, e) {
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
            for (const f of e.path)
              s && typeof s == "object" && (s = s[f]);
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
      t || (t = M(a._meta.value)), t && (a._meta || (a._meta = {}), a._meta.typeInfo = t);
    } else {
      const t = M(r);
      a._meta || (a._meta = {}), a._meta.typeInfo = t;
    }
    return a;
  }
  if (Array.isArray(r)) {
    const a = { _meta: { arrayKeys: [] } }, t = [];
    if (r.forEach((n, o) => {
      const s = `${_()}`, f = e ? {
        ...e,
        path: [...e.path, o.toString()]
      } : void 0;
      a[s] = S(d, n, f), t.push(s);
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
        a[t] = S(d, r[t], n);
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
let I = 0;
const O = Date.now().toString(36);
function _(d) {
  return `id:local_${O}_${(I++).toString(36)}`;
}
const E = g((d, r) => ({
  getPluginMetaDataMap: (e, a) => r().getShadowMetadata(e, a)?.pluginMetaData,
  setPluginMetaData: (e, a, t, n) => {
    const o = r().getShadowMetadata(e, a) || {}, s = new Map(o.pluginMetaData || []), f = s.get(t) || {};
    s.set(t, { ...f, ...n }), r().setShadowMetadata(e, a, { ...o, pluginMetaData: s });
  },
  removePluginMetaData: (e, a, t) => {
    const n = r().getShadowMetadata(e, a);
    if (!n?.pluginMetaData) return;
    const o = new Map(n.pluginMetaData);
    o.delete(t), r().setShadowMetadata(e, a, { ...n, pluginMetaData: o });
  },
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
        features: l,
        lastServerSync: c,
        stateSource: u,
        baseServerState: p,
        pathComponents: y,
        signals: h,
        validation: w
      } = o._meta;
      i && (s.components = i), l && (s.features = l), c && (s.lastServerSync = c), u && (s.stateSource = u), p && (s.baseServerState = p), y && (s.pathComponents = y), h && (s.signals = h), w && (s.validation = w);
    }
    function f(i, l) {
      if (l._meta?.hasOwnProperty("value")) {
        i._meta || (i._meta = {}), i._meta.value = l._meta.value;
        for (const c in i)
          c !== "_meta" && delete i[c];
        return i;
      }
      if (l._meta?.arrayKeys) {
        const c = { ...i._meta };
        return delete c.arrayKeys, i._meta?.arrayKeys && i._meta.arrayKeys.forEach((u) => {
          delete i[u];
        }), i._meta = { ...c, ...l._meta }, l._meta.arrayKeys.forEach((u) => {
          i[u] = l[u];
        }), i;
      }
      for (const c in l)
        c === "_meta" ? i._meta = { ...i._meta || {}, ...l._meta || {} } : i[c] && typeof i[c] == "object" && typeof l[c] == "object" ? f(i[c], l[c]) : i[c] = l[c];
      if (!l._meta?.arrayKeys && !l._meta?.hasOwnProperty("value"))
        for (const c in i)
          c !== "_meta" && !l.hasOwnProperty(c) && delete i[c];
      return i;
    }
    o ? (f(o, a), o._meta || (o._meta = {}), Object.assign(o._meta, s), m.set(n, o)) : (s && Object.keys(s).length > 0 && (a._meta || (a._meta = {}), Object.assign(a._meta, s)), m.set(n, a)), n === e ? m.delete(`[${e}`) : m.delete(e);
  },
  initializeShadowState: (e, a) => {
    const t = m.get(e) || m.get(`[${e}`);
    let n = {};
    if (t?._meta) {
      const {
        components: c,
        features: u,
        lastServerSync: p,
        stateSource: y,
        baseServerState: h
      } = t._meta;
      c && (n.components = c), u && (n.features = u), p && (n.lastServerSync = p), y && (n.stateSource = y), h && (n.baseServerState = h);
    }
    m.delete(e), m.delete(`[${e}`);
    const o = r().getInitialOptions(e), s = r().getInitialOptions("__syncSchemas"), f = {
      stateKey: e,
      path: [],
      schemas: {
        sync: s,
        zodV4: o?.validation?.zodSchemaV4,
        zodV3: o?.validation?.zodSchemaV3
      }
    }, i = S(e, a, f);
    i._meta || (i._meta = {}), Object.assign(i._meta, n);
    const l = Array.isArray(a) ? `[${e}` : e;
    m.set(l, i);
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
    for (const f of a)
      s[f] || (s[f] = {}), s = s[f];
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
        (c) => r().getShadowValue(e, [...a, c])
      );
    const i = {};
    for (const l of s)
      l !== "_meta" && !l.startsWith("id:") && (i[l] = r().getShadowValue(e, [...a, l]));
    return i;
  },
  updateShadowAtPath: (e, a, t) => {
    const n = m.has(`[${e}`) ? `[${e}` : e;
    let o = m.get(n);
    if (!o) return;
    let s = o;
    for (let l = 0; l < a.length - 1; l++)
      s[a[l]] || (s[a[l]] = {}), s = s[a[l]];
    const f = a.length === 0 ? s : s[a[a.length - 1]];
    if (!f) {
      s[a[a.length - 1]] = S(e, t), r().notifyPathSubscribers([e, ...a].join("."), {
        type: "UPDATE",
        newValue: t
      });
      return;
    }
    function i(l, c) {
      if (typeof c != "object" || c === null || Array.isArray(c)) {
        const p = l._meta;
        for (const h in l)
          h !== "_meta" && delete l[h];
        const y = S(e, c);
        Object.assign(l, y), p && (l._meta = { ...p, ...l._meta || {} });
        return;
      }
      const u = new Set(Object.keys(c));
      for (const p of u) {
        const y = c[p];
        l[p] ? i(l[p], y) : l[p] = S(e, y);
      }
      for (const p in l)
        p === "_meta" || !Object.prototype.hasOwnProperty.call(l, p) || u.has(p) || delete l[p];
    }
    i(f, t), r().notifyPathSubscribers([e, ...a].join("."), {
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
    let f = s;
    for (const i of a)
      f[i] || (f[i] = {}), f = f[i];
    Object.assign(f, t), f._meta || (f._meta = {}), f._meta.arrayKeys = n;
  },
  insertShadowArrayElement: (e, a, t, n, o) => {
    const s = r().getShadowNode(e, a);
    if (!s?._meta?.arrayKeys)
      throw new Error(
        `Array not found at path: ${[e, ...a].join(".")}`
      );
    const f = o || _(), i = { [f]: S(e, t) }, l = s._meta.arrayKeys, c = n !== void 0 && n >= 0 && n <= l.length ? n : l.length;
    c >= l.length ? l.push(f) : l.splice(c, 0, f), r().addItemsToArrayNode(e, a, i, l);
    const u = [e, ...a].join(".");
    return r().notifyPathSubscribers(u, {
      type: "INSERT",
      path: u,
      itemKey: `${u}.${f}`,
      index: c
    }), f;
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
    const s = {}, f = [];
    t.forEach((u) => {
      const p = `${_()}`;
      f.push(p), s[p] = S(e, u);
    });
    const i = o._meta.arrayKeys, l = n !== void 0 && n >= 0 && n <= i.length ? n : i.length;
    l >= i.length ? i.push(...f) : i.splice(l, 0, ...f), r().addItemsToArrayNode(e, a, s, i);
    const c = [e, ...a].join(".");
    r().notifyPathSubscribers(c, {
      type: "INSERT_MANY",
      path: c,
      count: t.length,
      index: l
    });
  },
  removeShadowArrayElement: (e, a) => {
    if (a.length === 0) return;
    const t = a.slice(0, -1), n = a[a.length - 1];
    if (!n?.startsWith("id:")) return;
    const o = r().getShadowNode(e, t);
    if (!o?._meta?.arrayKeys) return;
    const s = o._meta.arrayKeys, f = s.indexOf(n);
    if (f === -1) return;
    f === s.length - 1 ? s.pop() : f === 0 ? s.shift() : s.splice(f, 1), delete o[n];
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
      const f = s.components.get(t);
      if (f) {
        const i = [e, ...a].join("."), l = new Set(f.paths);
        l.add(i);
        const c = { ...f, paths: l }, u = new Map(s.components);
        u.set(t, c), r().setShadowMetadata(e, [], { components: u });
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
    d((t) => ({
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
    d((t) => {
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
    d((a) => {
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
    d((a) => {
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
    !e || e.length === 0 || d((a) => {
      const t = new Map(a.stateLog), n = /* @__PURE__ */ new Map();
      for (const o of e) {
        const s = n.get(o.stateKey) || [];
        s.push(o), n.set(o.stateKey, s);
      }
      for (const [o, s] of n.entries()) {
        const f = new Map(t.get(o));
        for (const i of s)
          f.set(JSON.stringify(i.path), { ...i });
        t.set(o, f);
      }
      return { stateLog: t };
    });
  },
  getInitialOptions: (e) => r().initialStateOptions[e],
  setInitialStateOptions: (e, a) => {
    d((t) => ({
      initialStateOptions: { ...t.initialStateOptions, [e]: a }
    }));
  },
  updateInitialStateGlobal: (e, a) => {
    d((t) => ({
      initialStateGlobal: { ...t.initialStateGlobal, [e]: a }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, a) => d((t) => {
    const n = new Map(t.syncInfoStore);
    return n.set(e, a), { syncInfoStore: n };
  }),
  getSyncInfo: (e) => r().syncInfoStore.get(e) || null
}));
export {
  S as buildShadowNode,
  _ as generateId,
  E as getGlobalStore,
  m as shadowStateStore
};
//# sourceMappingURL=store.js.map
