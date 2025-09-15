import { create as z } from "zustand";
function I(u, a = "zod4") {
  if (!u) return null;
  let e = u, t = !1, o = !1, n, s = !1;
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
      o = !0;
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
    source: a,
    default: s ? n : 0,
    nullable: t,
    optional: o
  } : c === "ZodString" || c === "string" ? {
    type: "string",
    schema: u,
    source: a,
    default: s ? n : "",
    nullable: t,
    optional: o
  } : c === "ZodBoolean" || c === "boolean" ? {
    type: "boolean",
    schema: u,
    source: a,
    default: s ? n : !1,
    nullable: t,
    optional: o
  } : c === "ZodArray" || c === "array" ? {
    type: "array",
    schema: u,
    source: a,
    default: s ? n : [],
    nullable: t,
    optional: o
  } : c === "ZodObject" || c === "object" ? {
    type: "object",
    schema: u,
    source: a,
    default: s ? n : {},
    nullable: t,
    optional: o
  } : c === "ZodDate" || c === "date" ? {
    type: "date",
    schema: u,
    source: a,
    default: s ? n : /* @__PURE__ */ new Date(),
    nullable: t,
    optional: o
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
  const a = typeof u;
  return a === "number" ? { type: "number", schema: null, source: "runtime", default: u } : a === "string" ? { type: "string", schema: null, source: "runtime", default: u } : a === "boolean" ? { type: "boolean", schema: null, source: "runtime", default: u } : Array.isArray(u) ? { type: "array", schema: null, source: "runtime", default: [] } : u instanceof Date ? { type: "date", schema: null, source: "runtime", default: u } : a === "object" ? { type: "object", schema: null, source: "runtime", default: {} } : { type: "unknown", schema: null, source: "runtime", default: u };
}
function g(u, a, e) {
  if (a == null || typeof a != "object") {
    const t = { _meta: { value: a } };
    return t._meta.typeInfo = M(a, e), t;
  }
  if (Array.isArray(a)) {
    const t = { _meta: { arrayKeys: [] } };
    return t._meta.typeInfo = M(a, e), a.forEach((o, n) => {
      const s = O(), r = e ? {
        ...e,
        path: [...e.path, n.toString()]
      } : void 0;
      t[s] = g(u, o, r), t._meta.arrayKeys.push(s);
    }), t;
  }
  if (a.constructor === Object) {
    const t = { _meta: {} };
    t._meta.typeInfo = M(a, e);
    for (const o in a)
      if (Object.prototype.hasOwnProperty.call(a, o)) {
        const n = e ? {
          ...e,
          path: [...e.path, o]
        } : void 0;
        t[o] = g(u, a[o], n);
      }
    return t;
  }
  return {
    _meta: {
      value: a,
      typeInfo: E(a)
    }
  };
}
function M(u, a) {
  if (a) {
    let e = null;
    if (a.schemas.zodV4) {
      const t = a.path.length === 0 ? a.schemas.zodV4 : j(a.schemas.zodV4, a.path);
      t && (console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuuuuu", t), e = I(t, "zod4"));
    }
    if (!e && a.schemas.zodV3) {
      const t = a.path.length === 0 ? a.schemas.zodV3 : j(a.schemas.zodV3, a.path);
      t && (e = I(t, "zod3"));
    }
    if (!e && a.schemas.sync?.[a.stateKey] && (e = E(u), e.source = "sync"), e) return e;
  }
  return E(u);
}
function K(u, a, e) {
  const t = h.get(u) || h.get(`[${u}`);
  if (!t) return;
  function o(n, s) {
    if (!n || typeof n != "object") return;
    const r = j(a, s);
    if (console.log("fieldSchema", r, s), r) {
      const i = I(r, e);
      console.log("typeInfo", i), i && (n._meta || (n._meta = {}), n._meta.typeInfo = {
        ...i,
        schema: r
      });
    }
    console.log("nodenodenodenodenodenode", n), n._meta?.arrayKeys ? n._meta.arrayKeys.forEach((i) => {
      n[i] && (console.log(
        "updating type info for array item",
        n[i],
        i
      ), o(n[i], [...s, "0"]));
    }) : n._meta?.hasOwnProperty("value") || Object.keys(n).forEach((i) => {
      i !== "_meta" && o(n[i], [...s, i]);
    });
  }
  o(t, []);
}
function A(u) {
  let a = u;
  for (; a; ) {
    const e = a.def || a._def, t = e?.typeName || e?.type || a._type;
    if (t === "ZodOptional" || t === "optional" || t === "ZodNullable" || t === "nullable" || t === "ZodDefault" || t === "default" || t === "ZodEffects" || t === "effects")
      a = e.innerType || e.schema || a._inner || a.unwrap?.();
    else
      break;
  }
  return a;
}
function j(u, a) {
  if (!u) return null;
  if (a.length === 0) return u;
  let e = u;
  for (const t of a) {
    const o = A(e);
    if (!o) return null;
    const n = o.def || o._def, s = n?.typeName || n?.type || o._type;
    if (s === "ZodObject" || s === "object")
      e = (n?.shape || o.shape || o._shape)?.[t];
    else if (s === "ZodArray" || s === "array")
      e = o.element || n?.type;
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
function O(u) {
  return `id:local_${V}_${(D++).toString(36)}`;
}
const $ = z((u, a) => ({
  getPluginMetaDataMap: (e, t) => a().getShadowMetadata(e, t)?.pluginMetaData,
  setPluginMetaData: (e, t, o, n) => {
    const s = a().getShadowMetadata(e, t) || {}, r = new Map(s.pluginMetaData || []), i = r.get(o) || {};
    r.set(o, { ...i, ...n }), a().setShadowMetadata(e, t, { ...s, pluginMetaData: r }), a().notifyPathSubscribers([e, ...t].join("."), {
      type: "METADATA_UPDATE"
    });
  },
  removePluginMetaData: (e, t, o) => {
    const n = a().getShadowMetadata(e, t);
    if (!n?.pluginMetaData) return;
    const s = new Map(n.pluginMetaData);
    s.delete(o), a().setShadowMetadata(e, t, { ...n, pluginMetaData: s });
  },
  setTransformCache: (e, t, o, n) => {
    const s = a().getShadowMetadata(e, t) || {};
    s.transformCaches || (s.transformCaches = /* @__PURE__ */ new Map()), s.transformCaches.set(o, n), a().setShadowMetadata(e, t, {
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
        validation: _
      } = s._meta;
      f && (r.components = f), p && (r.features = p), y && (r.lastServerSync = y), m && (r.stateSource = m), d && (r.baseServerState = d), S && (r.pathComponents = S), b && (r.signals = b), _ && (r.validation = _);
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
    const c = a().getInitialOptions(e);
    (c?.validation?.zodSchemaV4 || c?.validation?.zodSchemaV3) && (c.validation?.zodSchemaV4 ? (console.log("updating type info for zod4", e), K(e, c.validation.zodSchemaV4, "zod4")) : c.validation?.zodSchemaV3 && K(e, c.validation.zodSchemaV3, "zod3")), console.log(
      "shadowStateStoreshadowStateStore >>>>>>>>>>>>>>>>>>>>>",
      h
    ), n === e ? h.delete(`[${e}`) : h.delete(e);
  },
  initializeShadowState: (e, t) => {
    const o = h.get(e) || h.get(`[${e}`);
    let n = {};
    if (o?._meta) {
      const {
        components: f,
        features: p,
        lastServerSync: y,
        stateSource: m,
        baseServerState: d
      } = o._meta;
      f && (n.components = f), p && (n.features = p), y && (n.lastServerSync = y), m && (n.stateSource = m), d && (n.baseServerState = d);
    }
    h.delete(e), h.delete(`[${e}`);
    const s = a().getInitialOptions(e), r = a().getInitialOptions("__syncSchemas"), i = {
      stateKey: e,
      path: [],
      schemas: {
        sync: r,
        zodV4: s?.validation?.zodSchemaV4,
        zodV3: s?.validation?.zodSchemaV3
      }
    }, c = g(e, t, i);
    c._meta || (c._meta = {}), Object.assign(c._meta, n);
    const l = Array.isArray(t) ? `[${e}` : e;
    h.set(l, c);
  },
  getShadowNode: (e, t) => {
    let o = h.get(e) || h.get(`[${e}`);
    if (o) {
      if (t.length === 0) return o;
      for (const n of t)
        if (typeof o != "object" || o === null || (o = o[n], o === void 0)) return;
      return o;
    }
  },
  getShadowMetadata: (e, t) => a().getShadowNode(e, t)?._meta,
  setShadowMetadata: (e, t, o) => {
    const n = h.has(`[${e}`) ? `[${e}` : e;
    let s = h.get(n);
    if (!s) {
      s = { _meta: o }, h.set(n, s);
      return;
    }
    let r = s;
    for (const i of t)
      r[i] || (r[i] = {}), r = r[i];
    r._meta || (r._meta = {}), t.length > 0 && (console.log("current._meta", t, r._meta), console.log("newMetadata", t, o)), Object.assign(r._meta, o);
  },
  getShadowValue: (e, t, o) => {
    const n = a().getShadowNode(e, t);
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
        const y = o || i._meta.arrayKeys, m = [];
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
  updateShadowAtPath: (e, t, o) => {
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
          const _ = d[b];
          if (b < m.length) {
            const w = m[b];
            c(l[w], _, [
              ...p,
              w
            ]), S.push(w);
          } else {
            const w = O(), N = a().getInitialOptions(e), v = {
              stateKey: e,
              path: [...p, "0"],
              // Use '0' for array element schema lookup
              schemas: {
                zodV4: N?.validation?.zodSchemaV4,
                zodV3: N?.validation?.zodSchemaV3
              }
            };
            l[w] = g(
              e,
              _,
              v
            ), S.push(w);
          }
        }
        m.length > d.length && m.slice(d.length).forEach((_) => {
          delete l[_];
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
          const S = a().getInitialOptions(e), b = {
            stateKey: e,
            path: [...p, m],
            schemas: {
              zodV4: S?.validation?.zodSchemaV4,
              zodV3: S?.validation?.zodSchemaV3
            }
          };
          l[m] = g(e, d, b);
        }
      }
      for (const m in l)
        m === "_meta" || !Object.prototype.hasOwnProperty.call(l, m) || y.has(m) || delete l[m];
    }
    i ? c(i, o, t) : r[t[t.length - 1]] = g(e, o), a().notifyPathSubscribers([e, ...t].join("."), {
      type: "UPDATE",
      newValue: o
    });
  },
  addItemsToArrayNode: (e, t, o) => {
    const n = h.has(`[${e}`) ? `[${e}` : e;
    let s = h.get(n);
    if (!s) {
      console.error("Root not found for state key:", e);
      return;
    }
    let r = s;
    for (const i of t)
      r[i] || (r[i] = {}), r = r[i];
    Object.assign(r, o);
  },
  insertShadowArrayElement: (e, t, o, n, s) => {
    const r = a().getShadowNode(e, t);
    if (!r?._meta?.arrayKeys)
      throw new Error(
        `Array not found at path: ${[e, ...t].join(".")}`
      );
    console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
    const i = s || `${O()}`;
    r[i] = g(e, o);
    const c = r._meta.arrayKeys, l = n !== void 0 && n >= 0 && n <= c.length ? n : c.length;
    l >= c.length ? c.push(i) : c.splice(l, 0, i);
    const f = [e, ...t].join(".");
    return a().notifyPathSubscribers(f, {
      type: "INSERT",
      path: f,
      itemKey: `${f}.${i}`,
      index: l
    }), i;
  },
  insertManyShadowArrayElements: (e, t, o, n) => {
    if (!o || o.length === 0)
      return;
    const s = a().getShadowNode(e, t);
    if (!s?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[e, ...t].join(".")}`
      );
      return;
    }
    const r = [];
    o.forEach((f) => {
      const p = `${O()}`;
      r.push(p), s[p] = g(e, f);
    });
    const i = s._meta.arrayKeys, c = n !== void 0 && n >= 0 && n <= i.length ? n : i.length;
    c >= i.length ? i.push(...r) : i.splice(c, 0, ...r);
    const l = [e, ...t].join(".");
    a().notifyPathSubscribers(l, {
      type: "INSERT_MANY",
      path: l,
      count: o.length,
      index: c
    });
  },
  removeShadowArrayElement: (e, t) => {
    if (t.length === 0) return;
    const o = t.slice(0, -1), n = t[t.length - 1];
    if (!n?.startsWith("id:")) return;
    const s = a().getShadowNode(e, o);
    if (!s?._meta?.arrayKeys) return;
    const r = s._meta.arrayKeys, i = r.indexOf(n);
    if (i === -1) return;
    i === r.length - 1 ? r.pop() : i === 0 ? r.shift() : r.splice(i, 1), delete s[n];
    const c = [e, ...o].join(".");
    a().notifyPathSubscribers(c, {
      type: "REMOVE",
      path: c,
      itemKey: `${c}.${n}`
    });
  },
  registerComponent: (e, t, o) => {
    const n = a().getShadowMetadata(e, []) || {}, s = new Map(n.components);
    s.set(t, o), a().setShadowMetadata(e, [], { components: s });
  },
  unregisterComponent: (e, t) => {
    const o = a().getShadowMetadata(e, []);
    if (!o?.components) return;
    const n = new Map(o.components);
    n.delete(t) && a().setShadowMetadata(e, [], { components: n });
  },
  addPathComponent: (e, t, o) => {
    const n = a().getShadowMetadata(e, t) || {}, s = new Set(n.pathComponents);
    s.add(o), a().setShadowMetadata(e, t, {
      pathComponents: s
    });
    const r = a().getShadowMetadata(e, []);
    if (r?.components) {
      const i = r.components.get(o);
      if (i) {
        const c = [e, ...t].join("."), l = new Set(i.paths);
        l.add(c);
        const f = { ...i, paths: l }, p = new Map(r.components);
        p.set(o, f), a().setShadowMetadata(e, [], { components: p });
      }
    }
  },
  markAsDirty: (e, t, o = { bubble: !0 }) => {
    let n = a().getShadowNode(e, []);
    if (!n) return;
    let s = n;
    for (const i of t)
      if (s = s[i], !s) return;
    if (s._meta || (s._meta = {}), s._meta.isDirty = !0, !o.bubble) return;
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
    u((o) => ({
      serverStateUpdates: new Map(o.serverStateUpdates).set(
        e,
        t
      )
    })), a().notifyPathSubscribers(e, {
      type: "SERVER_STATE_UPDATE",
      serverState: t
    });
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (e, t) => {
    const o = a().pathSubscribers, n = o.get(e) || /* @__PURE__ */ new Set();
    return n.add(t), o.set(e, n), () => {
      const s = a().pathSubscribers.get(e);
      s && (s.delete(t), s.size === 0 && a().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, t) => {
    const n = a().pathSubscribers.get(e);
    n && n.forEach((s) => s(t));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, t) => {
    const o = a().selectedIndicesMap.get(e);
    if (!o) return -1;
    const n = a().getShadowMetadata(
      e.split(".")[0],
      e.split(".").slice(1)
    ), s = t || n?.arrayKeys;
    return s ? s.indexOf(o) : -1;
  },
  setSelectedIndex: (e, t) => {
    u((o) => {
      const n = new Map(o.selectedIndicesMap);
      return t === void 0 ? n.delete(e) : (n.has(e) && a().notifyPathSubscribers(n.get(e), {
        type: "THIS_UNSELECTED"
      }), n.set(e, t), a().notifyPathSubscribers(t, { type: "THIS_SELECTED" })), a().notifyPathSubscribers(e, { type: "GET_SELECTED" }), {
        ...o,
        selectedIndicesMap: n
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: e }) => {
    u((t) => {
      const o = new Map(t.selectedIndicesMap), n = o.get(e);
      return n && a().notifyPathSubscribers(n, {
        type: "CLEAR_SELECTION"
      }), o.delete(e), a().notifyPathSubscribers(e, {
        type: "CLEAR_SELECTION"
      }), {
        ...t,
        selectedIndicesMap: o
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    u((t) => {
      const o = new Map(t.selectedIndicesMap);
      let n = !1;
      for (const s of o.keys())
        (s === e || s.startsWith(e + ".")) && (o.delete(s), n = !0);
      return n ? { selectedIndicesMap: o } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (e) => {
    !e || e.length === 0 || u((t) => {
      const o = new Map(t.stateLog), n = /* @__PURE__ */ new Map();
      for (const s of e) {
        const r = n.get(s.stateKey) || [];
        r.push(s), n.set(s.stateKey, r);
      }
      for (const [s, r] of n.entries()) {
        const i = new Map(o.get(s));
        for (const c of r)
          i.set(JSON.stringify(c.path), { ...c });
        o.set(s, i);
      }
      return { stateLog: o };
    });
  },
  getInitialOptions: (e) => a().initialStateOptions[e],
  setInitialStateOptions: (e, t) => {
    u((o) => ({
      initialStateOptions: { ...o.initialStateOptions, [e]: t }
    }));
  },
  updateInitialStateGlobal: (e, t) => {
    u((o) => ({
      initialStateGlobal: { ...o.initialStateGlobal, [e]: t }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, t) => u((o) => {
    const n = new Map(o.syncInfoStore);
    return n.set(e, t), { syncInfoStore: n };
  }),
  getSyncInfo: (e) => a().syncInfoStore.get(e) || null
}));
export {
  g as buildShadowNode,
  O as generateId,
  $ as getGlobalStore,
  h as shadowStateStore,
  K as updateShadowTypeInfo
};
//# sourceMappingURL=store.js.map
