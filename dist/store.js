import { create as g } from "zustand";
const j = g((d, r) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, n) => d((a) => {
    const t = new Map(a.formRefs);
    return t.set(e, n), { formRefs: t };
  }),
  getFormRef: (e) => r().formRefs.get(e),
  removeFormRef: (e) => d((n) => {
    const a = new Map(n.formRefs);
    return a.delete(e), { formRefs: a };
  }),
  getFormRefsByStateKey: (e) => {
    const n = r().formRefs, a = e + ".", t = /* @__PURE__ */ new Map();
    return n.forEach((o, s) => {
      (s.startsWith(a) || s === e) && t.set(s, o);
    }), t;
  }
}));
function b(d, r = "zod4") {
  if (!d) return null;
  let e = d, n = !1, a = !1, t, o = !1;
  if (d._def) {
    let s = d;
    for (; s._def; ) {
      const i = s._def.typeName;
      if (i === "ZodOptional")
        a = !0, s = s._def.innerType || s.unwrap();
      else if (i === "ZodNullable")
        n = !0, s = s._def.innerType || s.unwrap();
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
        nullable: n,
        optional: a
      };
    if (f === "ZodString")
      return {
        type: "string",
        schema: d,
        source: r,
        default: o ? t : "",
        nullable: n,
        optional: a
      };
    if (f === "ZodBoolean")
      return {
        type: "boolean",
        schema: d,
        source: r,
        default: o ? t : !1,
        nullable: n,
        optional: a
      };
    if (f === "ZodArray")
      return {
        type: "array",
        schema: d,
        source: r,
        default: o ? t : [],
        nullable: n,
        optional: a
      };
    if (f === "ZodObject")
      return {
        type: "object",
        schema: d,
        source: r,
        default: o ? t : {},
        nullable: n,
        optional: a
      };
    if (f === "ZodDate")
      return {
        type: "date",
        schema: d,
        source: r,
        default: o ? t : /* @__PURE__ */ new Date(),
        nullable: n,
        optional: a
      };
  }
  if (d._type) {
    let s = d;
    for (; s; )
      if (s._type === "optional")
        a = !0, s = s._def?.innerType || s._inner;
      else if (s._type === "nullable")
        n = !0, s = s._def?.innerType || s._inner;
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
        nullable: n,
        optional: a
      };
    if (e._type === "string")
      return {
        type: "string",
        schema: d,
        source: r,
        default: o ? t : "",
        nullable: n,
        optional: a
      };
    if (e._type === "boolean")
      return {
        type: "boolean",
        schema: d,
        source: r,
        default: o ? t : !1,
        nullable: n,
        optional: a
      };
    if (e._type === "array")
      return {
        type: "array",
        schema: d,
        source: r,
        default: o ? t : [],
        nullable: n,
        optional: a
      };
    if (e._type === "object")
      return {
        type: "object",
        schema: d,
        source: r,
        default: o ? t : {},
        nullable: n,
        optional: a
      };
    if (e._type === "date")
      return {
        type: "date",
        schema: d,
        source: r,
        default: o ? t : /* @__PURE__ */ new Date(),
        nullable: n,
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
  const r = typeof d;
  return r === "number" ? { type: "number", schema: null, source: "runtime", default: d } : r === "string" ? { type: "string", schema: null, source: "runtime", default: d } : r === "boolean" ? { type: "boolean", schema: null, source: "runtime", default: d } : Array.isArray(d) ? { type: "array", schema: null, source: "runtime", default: [] } : d instanceof Date ? { type: "date", schema: null, source: "runtime", default: d } : r === "object" ? { type: "object", schema: null, source: "runtime", default: {} } : { type: "unknown", schema: null, source: "runtime", default: d };
}
function S(d, r, e) {
  if (r == null || typeof r != "object") {
    const n = { _meta: {} };
    if (n._meta.value = r, e) {
      let a = null;
      if (e.schemas.sync && e.schemas.sync[e.stateKey]) {
        const t = e.schemas.sync[e.stateKey];
        if (t.schemas?.validation) {
          let o = t.schemas.validation;
          for (const s of e.path)
            o?.shape ? o = o.shape[s] : o?._def?.shape && (o = o._def.shape()[s]);
          if (o && (a = b(o, "sync"), a && t.schemas.defaults)) {
            let s = t.schemas.defaults;
            for (const f of e.path)
              s && typeof s == "object" && (s = s[f]);
            s !== void 0 && (a.default = s, r == null && !a.optional && (n._meta.value = s));
          }
        }
      }
      if (!a && e.schemas.zodV4) {
        let t = e.schemas.zodV4;
        for (const o of e.path)
          t?.shape ? t = t.shape[o] : t?._def?.shape && (t = t._def.shape()[o]);
        t && (a = b(t, "zod4"), a && r == null && !a.optional && !a.nullable && (n.value = a.default));
      }
      if (!a && e.schemas.zodV3) {
        let t = e.schemas.zodV3;
        for (const o of e.path)
          t?.shape ? t = t.shape[o] : t?._shape && (t = t._shape[o]);
        t && (a = b(t, "zod3"), a && r == null && !a.optional && !a.nullable && (n.value = a.default));
      }
      a || (a = M(n._meta.value)), a && (n._meta || (n._meta = {}), n._meta.typeInfo = a);
    } else {
      const a = M(r);
      n._meta || (n._meta = {}), n._meta.typeInfo = a;
    }
    return n;
  }
  if (Array.isArray(r)) {
    const n = { _meta: { arrayKeys: [] } }, a = [];
    if (r.forEach((t, o) => {
      const s = `${_()}`, f = e ? {
        ...e,
        path: [...e.path, o.toString()]
      } : void 0;
      n[s] = S(d, t, f), a.push(s);
    }), n._meta.arrayKeys = a, e) {
      let t = null;
      if (e.schemas.zodV4) {
        let o = e.schemas.zodV4;
        for (const s of e.path)
          o?.shape ? o = o.shape[s] : o?._def?.shape && (o = o._def.shape()[s]);
        t = o;
      }
      n._meta.typeInfo = {
        type: "array",
        schema: t,
        source: t ? "zod4" : "runtime",
        default: []
      };
    }
    return n;
  }
  if (r.constructor === Object) {
    const n = { _meta: {} };
    for (const a in r)
      if (Object.prototype.hasOwnProperty.call(r, a)) {
        const t = e ? {
          ...e,
          path: [...e.path, a]
        } : void 0;
        n[a] = S(d, r[a], t);
      }
    if (e) {
      let a = null;
      if (e.schemas.zodV4) {
        let t = e.schemas.zodV4;
        for (const o of e.path)
          t?.shape ? t = t.shape[o] : t?._def?.shape && (t = t._def.shape()[o]);
        a = t;
      }
      n._meta.typeInfo = {
        type: "object",
        schema: a,
        source: a ? "zod4" : "runtime",
        default: {}
      };
    }
    return n;
  }
  return { value: r };
}
const m = /* @__PURE__ */ new Map();
let I = 0;
const O = Date.now().toString(36);
function _(d) {
  return `id:local_${O}_${(I++).toString(36)}`;
}
const N = g((d, r) => ({
  getPluginMetaDataMap: (e, n) => r().getShadowMetadata(e, n)?.pluginMetaData,
  setPluginMetaData: (e, n, a) => {
    const t = r().getShadowMetadata(e, []) || {};
    console.log("metadata", t);
    const o = new Map(t.pluginMetaData || []), s = o.get(n) || {};
    o.set(n, { ...s, ...a }), console.log("pluginMetaData", o), r().setShadowMetadata(e, [], { ...t, pluginMetaData: o });
  },
  removePluginMetaData: (e, n, a) => {
    const t = r().getShadowMetadata(e, n);
    if (!t?.pluginMetaData) return;
    const o = new Map(t.pluginMetaData);
    o.delete(a), r().setShadowMetadata(e, n, { ...t, pluginMetaData: o });
  },
  setTransformCache: (e, n, a, t) => {
    const o = r().getShadowMetadata(e, n) || {};
    o.transformCaches || (o.transformCaches = /* @__PURE__ */ new Map()), o.transformCaches.set(a, t), r().setShadowMetadata(e, n, {
      transformCaches: o.transformCaches
    });
  },
  initializeAndMergeShadowState: (e, n) => {
    const t = n?._meta?.arrayKeys !== void 0 ? `[${e}` : e, o = m.get(t) || m.get(e) || m.get(`[${e}`);
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
    o ? (f(o, n), o._meta || (o._meta = {}), Object.assign(o._meta, s), m.set(t, o)) : (s && Object.keys(s).length > 0 && (n._meta || (n._meta = {}), Object.assign(n._meta, s)), m.set(t, n)), t === e ? m.delete(`[${e}`) : m.delete(e);
  },
  initializeShadowState: (e, n) => {
    const a = m.get(e) || m.get(`[${e}`);
    let t = {};
    if (a?._meta) {
      const {
        components: c,
        features: u,
        lastServerSync: p,
        stateSource: y,
        baseServerState: h
      } = a._meta;
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
    }, i = S(e, n, f);
    i._meta || (i._meta = {}), Object.assign(i._meta, t);
    const l = Array.isArray(n) ? `[${e}` : e;
    m.set(l, i);
  },
  getShadowNode: (e, n) => {
    let a = m.get(e) || m.get(`[${e}`);
    if (a) {
      if (n.length === 0) return a;
      for (const t of n)
        if (typeof a != "object" || a === null || (a = a[t], a === void 0)) return;
      return a;
    }
  },
  getShadowMetadata: (e, n) => r().getShadowNode(e, n)?._meta,
  setShadowMetadata: (e, n, a) => {
    const t = m.has(`[${e}`) ? `[${e}` : e;
    let o = m.get(t);
    if (!o) {
      o = { _meta: a }, m.set(t, o);
      return;
    }
    let s = o;
    for (const f of n)
      s[f] || (s[f] = {}), s = s[f];
    s._meta || (s._meta = {}), Object.assign(s._meta, a);
  },
  getShadowValue: (e, n, a, t) => {
    const o = r().getShadowNode(e, n);
    if (o == null) return;
    const s = Object.keys(o);
    if (o._meta && Object.prototype.hasOwnProperty.call(o._meta, "value") && s.length === 1 && s[0] === "_meta")
      return o._meta.value;
    if (o._meta && Object.prototype.hasOwnProperty.call(o._meta, "arrayKeys"))
      return (a !== void 0 && a.length > 0 ? a : o._meta.arrayKeys).map(
        (c) => r().getShadowValue(e, [...n, c])
      );
    const i = {};
    for (const l of s)
      l !== "_meta" && !l.startsWith("id:") && (i[l] = r().getShadowValue(e, [...n, l]));
    return i;
  },
  updateShadowAtPath: (e, n, a) => {
    const t = m.has(`[${e}`) ? `[${e}` : e;
    let o = m.get(t);
    if (!o) return;
    let s = o;
    for (let l = 0; l < n.length - 1; l++)
      s[n[l]] || (s[n[l]] = {}), s = s[n[l]];
    const f = n.length === 0 ? s : s[n[n.length - 1]];
    if (!f) {
      s[n[n.length - 1]] = S(e, a), r().notifyPathSubscribers([e, ...n].join("."), {
        type: "UPDATE",
        newValue: a
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
    i(f, a), r().notifyPathSubscribers([e, ...n].join("."), {
      type: "UPDATE",
      newValue: a
    });
  },
  addItemsToArrayNode: (e, n, a, t) => {
    const o = m.has(`[${e}`) ? `[${e}` : e;
    let s = m.get(o);
    if (!s) {
      console.error("Root not found for state key:", e);
      return;
    }
    let f = s;
    for (const i of n)
      f[i] || (f[i] = {}), f = f[i];
    Object.assign(f, a), f._meta || (f._meta = {}), f._meta.arrayKeys = t;
  },
  insertShadowArrayElement: (e, n, a, t, o) => {
    const s = r().getShadowNode(e, n);
    if (!s?._meta?.arrayKeys)
      throw new Error(
        `Array not found at path: ${[e, ...n].join(".")}`
      );
    const f = o || _(), i = { [f]: S(e, a) }, l = s._meta.arrayKeys, c = t !== void 0 && t >= 0 && t <= l.length ? t : l.length;
    c >= l.length ? l.push(f) : l.splice(c, 0, f), r().addItemsToArrayNode(e, n, i, l);
    const u = [e, ...n].join(".");
    return r().notifyPathSubscribers(u, {
      type: "INSERT",
      path: u,
      itemKey: `${u}.${f}`,
      index: c
    }), f;
  },
  insertManyShadowArrayElements: (e, n, a, t) => {
    if (!a || a.length === 0)
      return;
    const o = r().getShadowNode(e, n);
    if (!o?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[e, ...n].join(".")}`
      );
      return;
    }
    const s = {}, f = [];
    a.forEach((u) => {
      const p = `${_()}`;
      f.push(p), s[p] = S(e, u);
    });
    const i = o._meta.arrayKeys, l = t !== void 0 && t >= 0 && t <= i.length ? t : i.length;
    l >= i.length ? i.push(...f) : i.splice(l, 0, ...f), r().addItemsToArrayNode(e, n, s, i);
    const c = [e, ...n].join(".");
    r().notifyPathSubscribers(c, {
      type: "INSERT_MANY",
      path: c,
      count: a.length,
      index: l
    });
  },
  removeShadowArrayElement: (e, n) => {
    if (n.length === 0) return;
    const a = n.slice(0, -1), t = n[n.length - 1];
    if (!t?.startsWith("id:")) return;
    const o = r().getShadowNode(e, a);
    if (!o?._meta?.arrayKeys) return;
    const s = o._meta.arrayKeys, f = s.indexOf(t);
    if (f === -1) return;
    f === s.length - 1 ? s.pop() : f === 0 ? s.shift() : s.splice(f, 1), delete o[t];
    const i = [e, ...a].join(".");
    r().notifyPathSubscribers(i, {
      type: "REMOVE",
      path: i,
      itemKey: `${i}.${t}`
    });
  },
  registerComponent: (e, n, a) => {
    const t = r().getShadowMetadata(e, []) || {}, o = new Map(t.components);
    o.set(n, a), r().setShadowMetadata(e, [], { components: o });
  },
  unregisterComponent: (e, n) => {
    const a = r().getShadowMetadata(e, []);
    if (!a?.components) return;
    const t = new Map(a.components);
    t.delete(n) && r().setShadowMetadata(e, [], { components: t });
  },
  addPathComponent: (e, n, a) => {
    const t = r().getShadowMetadata(e, n) || {}, o = new Set(t.pathComponents);
    o.add(a), r().setShadowMetadata(e, n, {
      pathComponents: o
    });
    const s = r().getShadowMetadata(e, []);
    if (s?.components) {
      const f = s.components.get(a);
      if (f) {
        const i = [e, ...n].join("."), l = new Set(f.paths);
        l.add(i);
        const c = { ...f, paths: l }, u = new Map(s.components);
        u.set(a, c), r().setShadowMetadata(e, [], { components: u });
      }
    }
  },
  markAsDirty: (e, n, a = { bubble: !0 }) => {
    const t = (o) => r().getShadowNode(e, o)?._meta?.isDirty ? !0 : (r().setShadowMetadata(e, o, { isDirty: !0 }), !1);
    if (t(n), a.bubble) {
      let o = [...n];
      for (; o.length > 0 && (o.pop(), !t(o)); )
        ;
    }
  },
  // Keep these in Zustand as they need React reactivity
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (e, n) => {
    d((a) => ({
      serverStateUpdates: new Map(a.serverStateUpdates).set(
        e,
        n
      )
    })), r().notifyPathSubscribers(e, {
      type: "SERVER_STATE_UPDATE",
      serverState: n
    });
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (e, n) => {
    const a = r().pathSubscribers, t = a.get(e) || /* @__PURE__ */ new Set();
    return t.add(n), a.set(e, t), () => {
      const o = r().pathSubscribers.get(e);
      o && (o.delete(n), o.size === 0 && r().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, n) => {
    const t = r().pathSubscribers.get(e);
    t && t.forEach((o) => o(n));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, n) => {
    const a = r().selectedIndicesMap.get(e);
    if (!a) return -1;
    const t = r().getShadowMetadata(
      e.split(".")[0],
      e.split(".").slice(1)
    ), o = n || t?.arrayKeys;
    return o ? o.indexOf(a) : -1;
  },
  setSelectedIndex: (e, n) => {
    d((a) => {
      const t = new Map(a.selectedIndicesMap);
      return n === void 0 ? t.delete(e) : (t.has(e) && r().notifyPathSubscribers(t.get(e), {
        type: "THIS_UNSELECTED"
      }), t.set(e, n), r().notifyPathSubscribers(n, { type: "THIS_SELECTED" })), r().notifyPathSubscribers(e, { type: "GET_SELECTED" }), {
        ...a,
        selectedIndicesMap: t
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: e }) => {
    d((n) => {
      const a = new Map(n.selectedIndicesMap), t = a.get(e);
      return t && r().notifyPathSubscribers(t, {
        type: "CLEAR_SELECTION"
      }), a.delete(e), r().notifyPathSubscribers(e, {
        type: "CLEAR_SELECTION"
      }), {
        ...n,
        selectedIndicesMap: a
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    d((n) => {
      const a = new Map(n.selectedIndicesMap);
      let t = !1;
      for (const o of a.keys())
        (o === e || o.startsWith(e + ".")) && (a.delete(o), t = !0);
      return t ? { selectedIndicesMap: a } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (e) => {
    !e || e.length === 0 || d((n) => {
      const a = new Map(n.stateLog), t = /* @__PURE__ */ new Map();
      for (const o of e) {
        const s = t.get(o.stateKey) || [];
        s.push(o), t.set(o.stateKey, s);
      }
      for (const [o, s] of t.entries()) {
        const f = new Map(a.get(o));
        for (const i of s)
          f.set(JSON.stringify(i.path), { ...i });
        a.set(o, f);
      }
      return { stateLog: a };
    });
  },
  getInitialOptions: (e) => r().initialStateOptions[e],
  setInitialStateOptions: (e, n) => {
    d((a) => ({
      initialStateOptions: { ...a.initialStateOptions, [e]: n }
    }));
  },
  updateInitialStateGlobal: (e, n) => {
    d((a) => ({
      initialStateGlobal: { ...a.initialStateGlobal, [e]: n }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, n) => d((a) => {
    const t = new Map(a.syncInfoStore);
    return t.set(e, n), { syncInfoStore: t };
  }),
  getSyncInfo: (e) => r().syncInfoStore.get(e) || null
}));
export {
  S as buildShadowNode,
  j as formRefStore,
  _ as generateId,
  N as getGlobalStore,
  m as shadowStateStore
};
//# sourceMappingURL=store.js.map
