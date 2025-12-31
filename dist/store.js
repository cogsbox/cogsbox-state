import { create as A } from "zustand";
function O(u, o = "zod4") {
  if (!u) return null;
  let e = u, t = !1, a = !1, n, s = !1;
  for (let l = 0; l < 20; l++) {
    const f = e?.def || e?._def;
    if (!f) break;
    const p = f.typeName || f.type || e._type;
    if (p === "ZodUnion" || p === "union")
      if (f.options && f.options.length > 0) {
        e = f.options[0];
        continue;
      } else
        break;
    if (p === "ZodOptional" || p === "optional")
      a = !0;
    else if (p === "ZodNullable" || p === "nullable")
      t = !0;
    else if (p === "ZodDefault" || p === "default")
      s = !0, n = typeof f.defaultValue == "function" ? f.defaultValue() : f.defaultValue;
    else if (p !== "ZodEffects" && p !== "effects")
      break;
    const y = f.innerType || f.schema || e._inner;
    if (!y || y === e)
      break;
    e = y;
  }
  const r = e, i = r?.def || r?._def, c = i?.typeName || i?.type || r?._type;
  return c === "ZodNumber" || c === "number" ? {
    type: "number",
    schema: u,
    source: o,
    default: s ? n : 0,
    nullable: t,
    optional: a
  } : c === "ZodString" || c === "string" ? {
    type: "string",
    schema: u,
    source: o,
    default: s ? n : "",
    nullable: t,
    optional: a
  } : c === "ZodBoolean" || c === "boolean" ? {
    type: "boolean",
    schema: u,
    source: o,
    default: s ? n : !1,
    nullable: t,
    optional: a
  } : c === "ZodArray" || c === "array" ? {
    type: "array",
    schema: u,
    source: o,
    default: s ? n : [],
    nullable: t,
    optional: a
  } : c === "ZodObject" || c === "object" ? {
    type: "object",
    schema: u,
    source: o,
    default: s ? n : {},
    nullable: t,
    optional: a
  } : c === "ZodDate" || c === "date" ? {
    type: "date",
    schema: u,
    source: o,
    default: s ? n : /* @__PURE__ */ new Date(),
    nullable: t,
    optional: a
  } : null;
}
function E(u) {
  if (u === null)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: null,
      nullable: !0
    };
  if (u === void 0)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: void 0,
      optional: !0
    };
  const o = typeof u;
  return o === "number" ? { type: "number", schema: null, source: "runtime", default: u } : o === "string" ? { type: "string", schema: null, source: "runtime", default: u } : o === "boolean" ? { type: "boolean", schema: null, source: "runtime", default: u } : Array.isArray(u) ? { type: "array", schema: null, source: "runtime", default: [] } : u instanceof Date ? { type: "date", schema: null, source: "runtime", default: u } : o === "object" ? { type: "object", schema: null, source: "runtime", default: {} } : { type: "unknown", schema: null, source: "runtime", default: u };
}
function _(u, o, e) {
  if (o == null || typeof o != "object") {
    const t = { _meta: { value: o } };
    return t._meta.typeInfo = I(o, e), t;
  }
  if (Array.isArray(o)) {
    const t = { _meta: { arrayKeys: [] } };
    return t._meta.typeInfo = I(o, e), o.forEach((a, n) => {
      const s = M(), r = e ? {
        ...e,
        path: [...e.path, n.toString()]
      } : void 0;
      t[s] = _(u, a, r), t._meta.arrayKeys.push(s);
    }), t;
  }
  if (o.constructor === Object) {
    const t = { _meta: {} };
    t._meta.typeInfo = I(o, e);
    for (const a in o)
      if (Object.prototype.hasOwnProperty.call(o, a)) {
        const n = e ? {
          ...e,
          path: [...e.path, a]
        } : void 0;
        t[a] = _(u, o[a], n);
      }
    return t;
  }
  return {
    _meta: {
      value: o,
      typeInfo: E(o)
    }
  };
}
function I(u, o) {
  if (o) {
    let e = null;
    if (o.schemas.zodV4) {
      const t = o.path.length === 0 ? o.schemas.zodV4 : j(o.schemas.zodV4, o.path);
      t && (e = O(t, "zod4"));
    }
    if (!e && o.schemas.zodV3) {
      const t = o.path.length === 0 ? o.schemas.zodV3 : j(o.schemas.zodV3, o.path);
      t && (e = O(t, "zod3"));
    }
    if (!e && o.schemas.sync?.[o.stateKey] && (e = E(u), e.source = "sync"), e) return e;
  }
  return E(u);
}
function N(u, o, e) {
  const t = h.get(u) || h.get(`[${u}`);
  if (!t) return;
  function a(n, s) {
    if (!n || typeof n != "object") return;
    const r = j(o, s);
    if (r) {
      const i = O(r, e);
      i && (n._meta || (n._meta = {}), n._meta.typeInfo = {
        ...i,
        schema: r
      });
    }
    n._meta?.arrayKeys ? n._meta.arrayKeys.forEach((i) => {
      n[i] && a(n[i], [...s, "0"]);
    }) : n._meta?.hasOwnProperty("value") || Object.keys(n).forEach((i) => {
      i !== "_meta" && a(n[i], [...s, i]);
    });
  }
  a(t, []);
}
function z(u) {
  let o = u;
  for (; o; ) {
    const e = o.def || o._def, t = e?.typeName || e?.type || o._type;
    if (t === "ZodOptional" || t === "optional" || t === "ZodNullable" || t === "nullable" || t === "ZodDefault" || t === "default" || t === "ZodEffects" || t === "effects")
      o = e.innerType || e.schema || o._inner || o.unwrap?.();
    else
      break;
  }
  return o;
}
function j(u, o) {
  if (!u) return null;
  if (o.length === 0) return u;
  let e = u;
  for (const t of o) {
    const a = z(e);
    if (!a) return null;
    const n = a.def || a._def, s = n?.typeName || n?.type || a._type;
    if (s === "ZodObject" || s === "object")
      e = (n?.shape || a.shape || a._shape)?.[t];
    else if (s === "ZodArray" || s === "array")
      e = a.element || n?.type;
    else
      return null;
    if (!e)
      return null;
  }
  return e;
}
const h = /* @__PURE__ */ new Map();
let D = 0;
const V = Date.now().toString(36);
function M(u) {
  return `id:local_${V}_${(D++).toString(36)}`;
}
const $ = A((u, o) => ({
  getPluginMetaDataMap: (e, t) => o().getShadowMetadata(e, t)?.pluginMetaData,
  setPluginMetaData: (e, t, a, n) => {
    const s = o().getShadowMetadata(e, t) || {}, r = new Map(s.pluginMetaData || []), i = r.get(a) || {};
    r.set(a, { ...i, ...n }), o().setShadowMetadata(e, t, { ...s, pluginMetaData: r }), o().notifyPathSubscribers([e, ...t].join("."), {
      type: "METADATA_UPDATE"
    });
  },
  removePluginMetaData: (e, t, a) => {
    const n = o().getShadowMetadata(e, t);
    if (!n?.pluginMetaData) return;
    const s = new Map(n.pluginMetaData);
    s.delete(a), o().setShadowMetadata(e, t, { ...n, pluginMetaData: s });
  },
  setTransformCache: (e, t, a, n) => {
    const s = o().getShadowMetadata(e, t) || {};
    s.transformCaches || (s.transformCaches = /* @__PURE__ */ new Map()), s.transformCaches.set(a, n), o().setShadowMetadata(e, t, {
      transformCaches: s.transformCaches
    });
  },
  // Replace your entire `initializeAndMergeShadowState` function with this one.
  initializeAndMergeShadowState: (e, t) => {
    const n = t?._meta?.arrayKeys !== void 0 ? `[${e}` : e, s = h.get(n) || h.get(e) || h.get(`[${e}`);
    let r = {};
    if (s?._meta) {
      const {
        components: f,
        features: p,
        lastServerSync: y,
        stateSource: m,
        baseServerState: d,
        pathComponents: S,
        signals: b,
        validation: g
      } = s._meta;
      f && (r.components = f), p && (r.features = p), y && (r.lastServerSync = y), m && (r.stateSource = m), d && (r.baseServerState = d), S && (r.pathComponents = S), b && (r.signals = b), g && (r.validation = g);
    }
    function i(f, p) {
      if (p._meta || f._meta) {
        const d = f._meta || {}, S = p._meta || {}, b = { ...d, ...S };
        d.typeInfo?.schema && !S.typeInfo?.schema && (b.typeInfo = d.typeInfo), d.validation && !S.validation && (b.validation = d.validation), d.components && (b.components = d.components), f._meta = b;
      }
      if (p._meta?.hasOwnProperty("value")) {
        for (const d in f)
          d !== "_meta" && delete f[d];
        return;
      }
      const y = new Set(
        Object.keys(p).filter((d) => d !== "_meta")
      ), m = new Set(
        Object.keys(f).filter((d) => d !== "_meta")
      );
      for (const d of m)
        y.has(d) || delete f[d];
      for (const d of y) {
        const S = p[d], b = f[d];
        b && typeof b == "object" && S && typeof S == "object" ? i(b, S) : f[d] = S;
      }
    }
    s ? (i(s, t), s._meta || (s._meta = {}), Object.assign(s._meta, r), h.set(n, s)) : (r && Object.keys(r).length > 0 && (t._meta || (t._meta = {}), Object.assign(t._meta, r)), h.set(n, t));
    const c = o().getInitialOptions(e);
    (c?.validation?.zodSchemaV4 || c?.validation?.zodSchemaV3) && (c.validation?.zodSchemaV4 ? N(e, c.validation.zodSchemaV4, "zod4") : c.validation?.zodSchemaV3 && N(e, c.validation.zodSchemaV3, "zod3")), n === e ? h.delete(`[${e}`) : h.delete(e);
  },
  initializeShadowState: (e, t) => {
    const a = h.get(e) || h.get(`[${e}`);
    let n = {};
    if (a?._meta) {
      const {
        components: f,
        features: p,
        lastServerSync: y,
        stateSource: m,
        baseServerState: d
      } = a._meta;
      f && (n.components = f), p && (n.features = p), y && (n.lastServerSync = y), m && (n.stateSource = m), d && (n.baseServerState = d);
    }
    h.delete(e), h.delete(`[${e}`);
    const s = o().getInitialOptions(e), r = o().getInitialOptions("__syncSchemas"), i = {
      stateKey: e,
      path: [],
      schemas: {
        sync: r,
        zodV4: s?.validation?.zodSchemaV4,
        zodV3: s?.validation?.zodSchemaV3
      }
    }, c = _(e, t, i);
    c._meta || (c._meta = {}), Object.assign(c._meta, n);
    const l = Array.isArray(t) ? `[${e}` : e;
    h.set(l, c);
  },
  getShadowNode: (e, t) => {
    let a = h.get(e) || h.get(`[${e}`);
    if (a) {
      if (t.length === 0) return a;
      for (const n of t)
        if (typeof a != "object" || a === null || (a = a[n], a === void 0)) return;
      return a;
    }
  },
  getShadowMetadata: (e, t) => o().getShadowNode(e, t)?._meta,
  setShadowMetadata: (e, t, a) => {
    const n = h.has(`[${e}`) ? `[${e}` : e;
    let s = h.get(n);
    if (!s) {
      s = { _meta: a }, h.set(n, s);
      return;
    }
    let r = s;
    for (const i of t)
      r[i] || (r[i] = {}), r = r[i];
    r._meta || (r._meta = {}), Object.assign(r._meta, a);
  },
  getShadowValue: (e, t, a) => {
    const n = o().getShadowNode(e, t);
    if (!n)
      return;
    const s = {}, r = [
      [n, s, "final"]
    ];
    for (; r.length > 0; ) {
      const [i, c, l] = r.pop();
      if (i._meta?.hasOwnProperty("value")) {
        c[l] = i._meta.value;
        continue;
      }
      if (i._meta?.arrayKeys) {
        const y = a || i._meta.arrayKeys, m = [];
        c[l] = m;
        for (let d = y.length - 1; d >= 0; d--) {
          const S = y[d];
          i[S] && r.push([i[S], m, d]);
        }
        continue;
      }
      const f = {};
      c[l] = f;
      const p = Object.keys(i);
      for (const y of p)
        y !== "_meta" && r.push([i[y], f, y]);
    }
    return s.final;
  },
  updateShadowAtPath: (e, t, a) => {
    const n = h.has(`[${e}`) ? `[${e}` : e;
    let s = h.get(n);
    if (!s) return;
    let r = s;
    for (let l = 0; l < t.length - 1; l++)
      r[t[l]] || (r[t[l]] = {}), r = r[t[l]];
    const i = t.length === 0 ? r : r[t[t.length - 1]];
    function c(l, f, p) {
      if (typeof f != "object" || f === null || f instanceof Date) {
        const m = l._meta || {};
        for (const d in l)
          d !== "_meta" && delete l[d];
        l._meta = { ...m, value: f };
        return;
      }
      if (Array.isArray(f)) {
        l._meta || (l._meta = {}), l._meta.arrayKeys || (l._meta.arrayKeys = []);
        const m = l._meta.arrayKeys, d = f, S = [];
        for (let b = 0; b < d.length; b++) {
          const g = d[b];
          if (b < m.length) {
            const w = m[b];
            c(l[w], g, [
              ...p,
              w
            ]), S.push(w);
          } else {
            const w = M(), K = o().getInitialOptions(e), v = {
              stateKey: e,
              path: [...p, "0"],
              // Use '0' for array element schema lookup
              schemas: {
                zodV4: K?.validation?.zodSchemaV4,
                zodV3: K?.validation?.zodSchemaV3
              }
            };
            l[w] = _(
              e,
              g,
              v
            ), S.push(w);
          }
        }
        m.length > d.length && m.slice(d.length).forEach((g) => {
          delete l[g];
        }), l._meta.arrayKeys = S;
        return;
      }
      const y = new Set(Object.keys(f));
      l._meta?.hasOwnProperty("value") && delete l._meta.value;
      for (const m of y) {
        const d = f[m];
        if (l[m])
          c(l[m], d, [
            ...p,
            m
          ]);
        else {
          const S = o().getInitialOptions(e), b = {
            stateKey: e,
            path: [...p, m],
            schemas: {
              zodV4: S?.validation?.zodSchemaV4,
              zodV3: S?.validation?.zodSchemaV3
            }
          };
          l[m] = _(e, d, b);
        }
      }
      for (const m in l)
        m === "_meta" || !Object.prototype.hasOwnProperty.call(l, m) || y.has(m) || delete l[m];
    }
    i ? c(i, a, t) : r[t[t.length - 1]] = _(e, a), o().notifyPathSubscribers([e, ...t].join("."), {
      type: "UPDATE",
      newValue: a
    });
  },
  addItemsToArrayNode: (e, t, a) => {
    const n = h.has(`[${e}`) ? `[${e}` : e;
    let s = h.get(n);
    if (!s) {
      console.error("Root not found for state key:", e);
      return;
    }
    let r = s;
    for (const i of t)
      r[i] || (r[i] = {}), r = r[i];
    Object.assign(r, a);
  },
  insertShadowArrayElement: (e, t, a, n, s) => {
    const r = o().getShadowNode(e, t);
    if (!r?._meta?.arrayKeys)
      throw new Error(
        `Array not found at path: ${[e, ...t].join(".")}`
      );
    const i = s || `${M()}`;
    r[i] = _(e, a);
    const c = r._meta.arrayKeys, l = n !== void 0 && n >= 0 && n <= c.length ? n : c.length;
    l >= c.length ? c.push(i) : c.splice(l, 0, i);
    const f = [e, ...t].join(".");
    return o().notifyPathSubscribers(f, {
      type: "INSERT",
      path: f,
      itemKey: `${f}.${i}`,
      index: l
    }), i;
  },
  insertManyShadowArrayElements: (e, t, a, n) => {
    if (!a || a.length === 0)
      return;
    const s = o().getShadowNode(e, t);
    if (!s?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[e, ...t].join(".")}`
      );
      return;
    }
    const r = [];
    a.forEach((f) => {
      const p = `${M()}`;
      r.push(p), s[p] = _(e, f);
    });
    const i = s._meta.arrayKeys, c = n !== void 0 && n >= 0 && n <= i.length ? n : i.length;
    c >= i.length ? i.push(...r) : i.splice(c, 0, ...r);
    const l = [e, ...t].join(".");
    o().notifyPathSubscribers(l, {
      type: "INSERT_MANY",
      path: l,
      count: a.length,
      index: c
    });
  },
  removeShadowArrayElement: (e, t) => {
    if (t.length === 0) return;
    const a = t.slice(0, -1), n = t[t.length - 1];
    if (!n?.startsWith("id:")) return;
    const s = o().getShadowNode(e, a);
    if (!s?._meta?.arrayKeys) return;
    const r = s._meta.arrayKeys, i = r.indexOf(n);
    if (i === -1) return;
    i === r.length - 1 ? r.pop() : i === 0 ? r.shift() : r.splice(i, 1), delete s[n];
    const c = [e, ...a].join(".");
    o().notifyPathSubscribers(c, {
      type: "REMOVE",
      path: c,
      itemKey: `${c}.${n}`
    });
  },
  registerComponent: (e, t, a) => {
    const n = o().getShadowMetadata(e, []) || {}, s = new Map(n.components);
    s.set(t, a), o().setShadowMetadata(e, [], { components: s });
  },
  unregisterComponent: (e, t) => {
    const a = o().getShadowMetadata(e, []);
    if (!a?.components) return;
    const n = new Map(a.components);
    n.delete(t) && o().setShadowMetadata(e, [], { components: n });
  },
  addPathComponent: (e, t, a) => {
    const n = o().getShadowMetadata(e, t) || {}, s = new Set(n.pathComponents);
    s.add(a), o().setShadowMetadata(e, t, {
      pathComponents: s
    });
    const r = o().getShadowMetadata(e, []);
    if (r?.components) {
      const i = r.components.get(a);
      if (i) {
        const c = [e, ...t].join("."), l = new Set(i.paths);
        l.add(c);
        const f = { ...i, paths: l }, p = new Map(r.components);
        p.set(a, f), o().setShadowMetadata(e, [], { components: p });
      }
    }
  },
  markAsDirty: (e, t, a = { bubble: !0 }) => {
    let n = o().getShadowNode(e, []);
    if (!n) return;
    let s = n;
    for (const i of t)
      if (s = s[i], !s) return;
    if (s._meta || (s._meta = {}), s._meta.isDirty = !0, !a.bubble) return;
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
    u((a) => ({
      serverStateUpdates: new Map(a.serverStateUpdates).set(
        e,
        t
      )
    })), o().notifyPathSubscribers(e, {
      type: "SERVER_STATE_UPDATE",
      serverState: t
    });
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (e, t) => {
    const a = o().pathSubscribers, n = a.get(e) || /* @__PURE__ */ new Set();
    return n.add(t), a.set(e, n), () => {
      const s = o().pathSubscribers.get(e);
      s && (s.delete(t), s.size === 0 && o().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, t) => {
    const n = o().pathSubscribers.get(e);
    n && n.forEach((s) => s(t));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, t) => {
    const a = o().selectedIndicesMap.get(e);
    if (!a) return -1;
    const n = o().getShadowMetadata(
      e.split(".")[0],
      e.split(".").slice(1)
    ), s = t || n?.arrayKeys;
    return s ? s.indexOf(a) : -1;
  },
  setSelectedIndex: (e, t) => {
    u((a) => {
      const n = new Map(a.selectedIndicesMap);
      return t === void 0 ? n.delete(e) : (n.has(e) && o().notifyPathSubscribers(n.get(e), {
        type: "THIS_UNSELECTED"
      }), n.set(e, t), o().notifyPathSubscribers(t, { type: "THIS_SELECTED" })), o().notifyPathSubscribers(e, { type: "GET_SELECTED" }), {
        ...a,
        selectedIndicesMap: n
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: e }) => {
    u((t) => {
      const a = new Map(t.selectedIndicesMap), n = a.get(e);
      return n && o().notifyPathSubscribers(n, {
        type: "CLEAR_SELECTION"
      }), a.delete(e), o().notifyPathSubscribers(e, {
        type: "CLEAR_SELECTION"
      }), {
        ...t,
        selectedIndicesMap: a
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    u((t) => {
      const a = new Map(t.selectedIndicesMap);
      let n = !1;
      for (const s of a.keys())
        (s === e || s.startsWith(e + ".")) && (a.delete(s), n = !0);
      return n ? { selectedIndicesMap: a } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (e) => {
    !e || e.length === 0 || u((t) => {
      const a = new Map(t.stateLog), n = /* @__PURE__ */ new Map();
      for (const s of e) {
        const r = n.get(s.stateKey) || [];
        r.push(s), n.set(s.stateKey, r);
      }
      for (const [s, r] of n.entries()) {
        const i = new Map(a.get(s));
        for (const c of r)
          i.set(JSON.stringify(c.path), { ...c });
        a.set(s, i);
      }
      return { stateLog: a };
    });
  },
  getInitialOptions: (e) => o().initialStateOptions[e],
  setInitialStateOptions: (e, t) => {
    u((a) => ({
      initialStateOptions: { ...a.initialStateOptions, [e]: t }
    }));
  },
  updateInitialStateGlobal: (e, t) => {
    u((a) => ({
      initialStateGlobal: { ...a.initialStateGlobal, [e]: t }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, t) => u((a) => {
    const n = new Map(a.syncInfoStore);
    return n.set(e, t), { syncInfoStore: n };
  }),
  getSyncInfo: (e) => o().syncInfoStore.get(e) || null
}));
export {
  _ as buildShadowNode,
  M as generateId,
  $ as getGlobalStore,
  h as shadowStateStore,
  N as updateShadowTypeInfo
};
//# sourceMappingURL=store.js.map
