import { create as g } from "zustand";
function b(d, r = "zod4") {
  if (!d) return null;
  let e = d, a = !1, n = !1, t, o = !1;
  if (d._def) {
    let s = d;
    for (; s._def; ) {
      const i = s._def.typeName;
      if (i === "ZodOptional")
        n = !0, s = s._def.innerType || s.unwrap();
      else if (i === "ZodNullable")
        a = !0, s = s._def.innerType || s.unwrap();
      else if (i === "ZodDefault")
        o = !0, t = s._def.defaultValue(), s = s._def.innerType;
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
        default: o ? t : 0,
        nullable: a,
        optional: n
      };
    if (f === "ZodString")
      return {
        type: "string",
        schema: d,
        source: r,
        default: o ? t : "",
        nullable: a,
        optional: n
      };
    if (f === "ZodBoolean")
      return {
        type: "boolean",
        schema: d,
        source: r,
        default: o ? t : !1,
        nullable: a,
        optional: n
      };
    if (f === "ZodArray")
      return {
        type: "array",
        schema: d,
        source: r,
        default: o ? t : [],
        nullable: a,
        optional: n
      };
    if (f === "ZodObject")
      return {
        type: "object",
        schema: d,
        source: r,
        default: o ? t : {},
        nullable: a,
        optional: n
      };
    if (f === "ZodDate")
      return {
        type: "date",
        schema: d,
        source: r,
        default: o ? t : /* @__PURE__ */ new Date(),
        nullable: a,
        optional: n
      };
  }
  if (d._type) {
    let s = d;
    for (; s; )
      if (s._type === "optional")
        n = !0, s = s._def?.innerType || s._inner;
      else if (s._type === "nullable")
        a = !0, s = s._def?.innerType || s._inner;
      else if (s._def?.defaultValue !== void 0) {
        o = !0, t = typeof s._def.defaultValue == "function" ? s._def.defaultValue() : s._def.defaultValue;
        break;
      } else
        break;
    if (e = s, e._type === "number")
      return {
        type: "number",
        schema: d,
        source: r,
        default: o ? t : 0,
        nullable: a,
        optional: n
      };
    if (e._type === "string")
      return {
        type: "string",
        schema: d,
        source: r,
        default: o ? t : "",
        nullable: a,
        optional: n
      };
    if (e._type === "boolean")
      return {
        type: "boolean",
        schema: d,
        source: r,
        default: o ? t : !1,
        nullable: a,
        optional: n
      };
    if (e._type === "array")
      return {
        type: "array",
        schema: d,
        source: r,
        default: o ? t : [],
        nullable: a,
        optional: n
      };
    if (e._type === "object")
      return {
        type: "object",
        schema: d,
        source: r,
        default: o ? t : {},
        nullable: a,
        optional: n
      };
    if (e._type === "date")
      return {
        type: "date",
        schema: d,
        source: r,
        default: o ? t : /* @__PURE__ */ new Date(),
        nullable: a,
        optional: n
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
      let n = null;
      if (e.schemas.sync && e.schemas.sync[e.stateKey]) {
        const t = e.schemas.sync[e.stateKey];
        if (t.schemas?.validation) {
          let o = t.schemas.validation;
          for (const s of e.path)
            o?.shape ? o = o.shape[s] : o?._def?.shape && (o = o._def.shape()[s]);
          if (o && (n = b(o, "sync"), n && t.schemas.defaults)) {
            let s = t.schemas.defaults;
            for (const f of e.path)
              s && typeof s == "object" && (s = s[f]);
            s !== void 0 && (n.default = s, r == null && !n.optional && (a._meta.value = s));
          }
        }
      }
      if (!n && e.schemas.zodV4) {
        let t = e.schemas.zodV4;
        for (const o of e.path)
          t?.shape ? t = t.shape[o] : t?._def?.shape && (t = t._def.shape()[o]);
        t && (n = b(t, "zod4"), n && r == null && !n.optional && !n.nullable && (a.value = n.default));
      }
      if (!n && e.schemas.zodV3) {
        let t = e.schemas.zodV3;
        for (const o of e.path)
          t?.shape ? t = t.shape[o] : t?._shape && (t = t._shape[o]);
        t && (n = b(t, "zod3"), n && r == null && !n.optional && !n.nullable && (a.value = n.default));
      }
      n || (n = M(a._meta.value)), n && (a._meta || (a._meta = {}), a._meta.typeInfo = n);
    } else {
      const n = M(r);
      a._meta || (a._meta = {}), a._meta.typeInfo = n;
    }
    return a;
  }
  if (Array.isArray(r)) {
    const a = { _meta: { arrayKeys: [] } }, n = [];
    if (r.forEach((t, o) => {
      const s = `${_()}`, f = e ? {
        ...e,
        path: [...e.path, o.toString()]
      } : void 0;
      a[s] = S(d, t, f), n.push(s);
    }), a._meta.arrayKeys = n, e) {
      let t = null;
      if (e.schemas.zodV4) {
        let o = e.schemas.zodV4;
        for (const s of e.path)
          o?.shape ? o = o.shape[s] : o?._def?.shape && (o = o._def.shape()[s]);
        t = o;
      }
      a._meta.typeInfo = {
        type: "array",
        schema: t,
        source: t ? "zod4" : "runtime",
        default: []
      };
    }
    return a;
  }
  if (r.constructor === Object) {
    const a = { _meta: {} };
    for (const n in r)
      if (Object.prototype.hasOwnProperty.call(r, n)) {
        const t = e ? {
          ...e,
          path: [...e.path, n]
        } : void 0;
        a[n] = S(d, r[n], t);
      }
    if (e) {
      let n = null;
      if (e.schemas.zodV4) {
        let t = e.schemas.zodV4;
        for (const o of e.path)
          t?.shape ? t = t.shape[o] : t?._def?.shape && (t = t._def.shape()[o]);
        n = t;
      }
      a._meta.typeInfo = {
        type: "object",
        schema: n,
        source: n ? "zod4" : "runtime",
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
  setPluginMetaData: (e, a, n) => {
    const t = r().getShadowMetadata(e, []) || {};
    console.log("metadata", t);
    const o = new Map(t.pluginMetaData || []), s = o.get(a) || {};
    o.set(a, { ...s, ...n }), console.log("pluginMetaData", o), r().setShadowMetadata(e, [], { ...t, pluginMetaData: o });
  },
  removePluginMetaData: (e, a, n) => {
    const t = r().getShadowMetadata(e, a);
    if (!t?.pluginMetaData) return;
    const o = new Map(t.pluginMetaData);
    o.delete(n), r().setShadowMetadata(e, a, { ...t, pluginMetaData: o });
  },
  setTransformCache: (e, a, n, t) => {
    const o = r().getShadowMetadata(e, a) || {};
    o.transformCaches || (o.transformCaches = /* @__PURE__ */ new Map()), o.transformCaches.set(n, t), r().setShadowMetadata(e, a, {
      transformCaches: o.transformCaches
    });
  },
  initializeAndMergeShadowState: (e, a) => {
    const t = a?._meta?.arrayKeys !== void 0 ? `[${e}` : e, o = m.get(t) || m.get(e) || m.get(`[${e}`);
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
    o ? (f(o, a), o._meta || (o._meta = {}), Object.assign(o._meta, s), m.set(t, o)) : (s && Object.keys(s).length > 0 && (a._meta || (a._meta = {}), Object.assign(a._meta, s)), m.set(t, a)), t === e ? m.delete(`[${e}`) : m.delete(e);
  },
  initializeShadowState: (e, a) => {
    const n = m.get(e) || m.get(`[${e}`);
    let t = {};
    if (n?._meta) {
      const {
        components: c,
        features: u,
        lastServerSync: p,
        stateSource: y,
        baseServerState: h
      } = n._meta;
      c && (t.components = c), u && (t.features = u), p && (t.lastServerSync = p), y && (t.stateSource = y), h && (t.baseServerState = h);
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
    i._meta || (i._meta = {}), Object.assign(i._meta, t);
    const l = Array.isArray(a) ? `[${e}` : e;
    m.set(l, i);
  },
  getShadowNode: (e, a) => {
    let n = m.get(e) || m.get(`[${e}`);
    if (n) {
      if (a.length === 0) return n;
      for (const t of a)
        if (typeof n != "object" || n === null || (n = n[t], n === void 0)) return;
      return n;
    }
  },
  getShadowMetadata: (e, a) => r().getShadowNode(e, a)?._meta,
  setShadowMetadata: (e, a, n) => {
    const t = m.has(`[${e}`) ? `[${e}` : e;
    let o = m.get(t);
    if (!o) {
      o = { _meta: n }, m.set(t, o);
      return;
    }
    let s = o;
    for (const f of a)
      s[f] || (s[f] = {}), s = s[f];
    s._meta || (s._meta = {}), Object.assign(s._meta, n);
  },
  getShadowValue: (e, a, n, t) => {
    const o = r().getShadowNode(e, a);
    if (o == null) return;
    const s = Object.keys(o);
    if (o._meta && Object.prototype.hasOwnProperty.call(o._meta, "value") && s.length === 1 && s[0] === "_meta")
      return o._meta.value;
    if (o._meta && Object.prototype.hasOwnProperty.call(o._meta, "arrayKeys"))
      return (n !== void 0 && n.length > 0 ? n : o._meta.arrayKeys).map(
        (c) => r().getShadowValue(e, [...a, c])
      );
    const i = {};
    for (const l of s)
      l !== "_meta" && !l.startsWith("id:") && (i[l] = r().getShadowValue(e, [...a, l]));
    return i;
  },
  updateShadowAtPath: (e, a, n) => {
    const t = m.has(`[${e}`) ? `[${e}` : e;
    let o = m.get(t);
    if (!o) return;
    let s = o;
    for (let l = 0; l < a.length - 1; l++)
      s[a[l]] || (s[a[l]] = {}), s = s[a[l]];
    const f = a.length === 0 ? s : s[a[a.length - 1]];
    if (!f) {
      s[a[a.length - 1]] = S(e, n), r().notifyPathSubscribers([e, ...a].join("."), {
        type: "UPDATE",
        newValue: n
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
    i(f, n), r().notifyPathSubscribers([e, ...a].join("."), {
      type: "UPDATE",
      newValue: n
    });
  },
  addItemsToArrayNode: (e, a, n, t) => {
    const o = m.has(`[${e}`) ? `[${e}` : e;
    let s = m.get(o);
    if (!s) {
      console.error("Root not found for state key:", e);
      return;
    }
    let f = s;
    for (const i of a)
      f[i] || (f[i] = {}), f = f[i];
    Object.assign(f, n), f._meta || (f._meta = {}), f._meta.arrayKeys = t;
  },
  insertShadowArrayElement: (e, a, n, t, o) => {
    const s = r().getShadowNode(e, a);
    if (!s?._meta?.arrayKeys)
      throw new Error(
        `Array not found at path: ${[e, ...a].join(".")}`
      );
    const f = o || _(), i = { [f]: S(e, n) }, l = s._meta.arrayKeys, c = t !== void 0 && t >= 0 && t <= l.length ? t : l.length;
    c >= l.length ? l.push(f) : l.splice(c, 0, f), r().addItemsToArrayNode(e, a, i, l);
    const u = [e, ...a].join(".");
    return r().notifyPathSubscribers(u, {
      type: "INSERT",
      path: u,
      itemKey: `${u}.${f}`,
      index: c
    }), f;
  },
  insertManyShadowArrayElements: (e, a, n, t) => {
    if (!n || n.length === 0)
      return;
    const o = r().getShadowNode(e, a);
    if (!o?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[e, ...a].join(".")}`
      );
      return;
    }
    const s = {}, f = [];
    n.forEach((u) => {
      const p = `${_()}`;
      f.push(p), s[p] = S(e, u);
    });
    const i = o._meta.arrayKeys, l = t !== void 0 && t >= 0 && t <= i.length ? t : i.length;
    l >= i.length ? i.push(...f) : i.splice(l, 0, ...f), r().addItemsToArrayNode(e, a, s, i);
    const c = [e, ...a].join(".");
    r().notifyPathSubscribers(c, {
      type: "INSERT_MANY",
      path: c,
      count: n.length,
      index: l
    });
  },
  removeShadowArrayElement: (e, a) => {
    if (a.length === 0) return;
    const n = a.slice(0, -1), t = a[a.length - 1];
    if (!t?.startsWith("id:")) return;
    const o = r().getShadowNode(e, n);
    if (!o?._meta?.arrayKeys) return;
    const s = o._meta.arrayKeys, f = s.indexOf(t);
    if (f === -1) return;
    f === s.length - 1 ? s.pop() : f === 0 ? s.shift() : s.splice(f, 1), delete o[t];
    const i = [e, ...n].join(".");
    r().notifyPathSubscribers(i, {
      type: "REMOVE",
      path: i,
      itemKey: `${i}.${t}`
    });
  },
  registerComponent: (e, a, n) => {
    const t = r().getShadowMetadata(e, []) || {}, o = new Map(t.components);
    o.set(a, n), r().setShadowMetadata(e, [], { components: o });
  },
  unregisterComponent: (e, a) => {
    const n = r().getShadowMetadata(e, []);
    if (!n?.components) return;
    const t = new Map(n.components);
    t.delete(a) && r().setShadowMetadata(e, [], { components: t });
  },
  addPathComponent: (e, a, n) => {
    const t = r().getShadowMetadata(e, a) || {}, o = new Set(t.pathComponents);
    o.add(n), r().setShadowMetadata(e, a, {
      pathComponents: o
    });
    const s = r().getShadowMetadata(e, []);
    if (s?.components) {
      const f = s.components.get(n);
      if (f) {
        const i = [e, ...a].join("."), l = new Set(f.paths);
        l.add(i);
        const c = { ...f, paths: l }, u = new Map(s.components);
        u.set(n, c), r().setShadowMetadata(e, [], { components: u });
      }
    }
  },
  markAsDirty: (e, a, n = { bubble: !0 }) => {
    const t = (o) => r().getShadowNode(e, o)?._meta?.isDirty ? !0 : (r().setShadowMetadata(e, o, { isDirty: !0 }), !1);
    if (t(a), n.bubble) {
      let o = [...a];
      for (; o.length > 0 && (o.pop(), !t(o)); )
        ;
    }
  },
  // Keep these in Zustand as they need React reactivity
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (e, a) => {
    d((n) => ({
      serverStateUpdates: new Map(n.serverStateUpdates).set(
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
    const n = r().pathSubscribers, t = n.get(e) || /* @__PURE__ */ new Set();
    return t.add(a), n.set(e, t), () => {
      const o = r().pathSubscribers.get(e);
      o && (o.delete(a), o.size === 0 && r().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, a) => {
    const t = r().pathSubscribers.get(e);
    t && t.forEach((o) => o(a));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, a) => {
    const n = r().selectedIndicesMap.get(e);
    if (!n) return -1;
    const t = r().getShadowMetadata(
      e.split(".")[0],
      e.split(".").slice(1)
    ), o = a || t?.arrayKeys;
    return o ? o.indexOf(n) : -1;
  },
  setSelectedIndex: (e, a) => {
    d((n) => {
      const t = new Map(n.selectedIndicesMap);
      return a === void 0 ? t.delete(e) : (t.has(e) && r().notifyPathSubscribers(t.get(e), {
        type: "THIS_UNSELECTED"
      }), t.set(e, a), r().notifyPathSubscribers(a, { type: "THIS_SELECTED" })), r().notifyPathSubscribers(e, { type: "GET_SELECTED" }), {
        ...n,
        selectedIndicesMap: t
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: e }) => {
    d((a) => {
      const n = new Map(a.selectedIndicesMap), t = n.get(e);
      return t && r().notifyPathSubscribers(t, {
        type: "CLEAR_SELECTION"
      }), n.delete(e), r().notifyPathSubscribers(e, {
        type: "CLEAR_SELECTION"
      }), {
        ...a,
        selectedIndicesMap: n
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    d((a) => {
      const n = new Map(a.selectedIndicesMap);
      let t = !1;
      for (const o of n.keys())
        (o === e || o.startsWith(e + ".")) && (n.delete(o), t = !0);
      return t ? { selectedIndicesMap: n } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (e) => {
    !e || e.length === 0 || d((a) => {
      const n = new Map(a.stateLog), t = /* @__PURE__ */ new Map();
      for (const o of e) {
        const s = t.get(o.stateKey) || [];
        s.push(o), t.set(o.stateKey, s);
      }
      for (const [o, s] of t.entries()) {
        const f = new Map(n.get(o));
        for (const i of s)
          f.set(JSON.stringify(i.path), { ...i });
        n.set(o, f);
      }
      return { stateLog: n };
    });
  },
  getInitialOptions: (e) => r().initialStateOptions[e],
  setInitialStateOptions: (e, a) => {
    d((n) => ({
      initialStateOptions: { ...n.initialStateOptions, [e]: a }
    }));
  },
  updateInitialStateGlobal: (e, a) => {
    d((n) => ({
      initialStateGlobal: { ...n.initialStateGlobal, [e]: a }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, a) => d((n) => {
    const t = new Map(n.syncInfoStore);
    return t.set(e, a), { syncInfoStore: t };
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
