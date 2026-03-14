import { create as K } from "zustand";
function E(l, a = "zod4") {
  if (!l) return null;
  let e = l, t = !1, o = !1, n, s = !1;
  for (let f = 0; f < 20; f++) {
    const u = e?.def || e?._def;
    if (!u) break;
    const p = u.typeName || u.type || e._type;
    if (p === "ZodUnion" || p === "union")
      if (u.options && u.options.length > 0) {
        e = u.options[0];
        continue;
      } else
        break;
    if (p === "ZodOptional" || p === "optional")
      o = !0;
    else if (p === "ZodNullable" || p === "nullable")
      t = !0;
    else if (p === "ZodDefault" || p === "default")
      s = !0, n = typeof u.defaultValue == "function" ? u.defaultValue() : u.defaultValue;
    else if (p !== "ZodEffects" && p !== "effects")
      break;
    const y = u.innerType || u.schema || e._inner;
    if (!y || y === e)
      break;
    e = y;
  }
  const r = e, i = r?.def || r?._def, c = i?.typeName || i?.type || r?._type;
  return c === "ZodNumber" || c === "number" ? {
    type: "number",
    schema: l,
    source: a,
    default: s ? n : 0,
    nullable: t,
    optional: o
  } : c === "ZodString" || c === "string" ? {
    type: "string",
    schema: l,
    source: a,
    default: s ? n : "",
    nullable: t,
    optional: o
  } : c === "ZodBoolean" || c === "boolean" ? {
    type: "boolean",
    schema: l,
    source: a,
    default: s ? n : !1,
    nullable: t,
    optional: o
  } : c === "ZodArray" || c === "array" ? {
    type: "array",
    schema: l,
    source: a,
    default: s ? n : [],
    nullable: t,
    optional: o
  } : c === "ZodObject" || c === "object" ? {
    type: "object",
    schema: l,
    source: a,
    default: s ? n : {},
    nullable: t,
    optional: o
  } : c === "ZodDate" || c === "date" ? {
    type: "date",
    schema: l,
    source: a,
    default: s ? n : /* @__PURE__ */ new Date(),
    nullable: t,
    optional: o
  } : null;
}
function O(l) {
  if (l === null)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: null,
      nullable: !0
    };
  if (l === void 0)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: void 0,
      optional: !0
    };
  const a = typeof l;
  return a === "number" ? { type: "number", schema: null, source: "runtime", default: l } : a === "string" ? { type: "string", schema: null, source: "runtime", default: l } : a === "boolean" ? { type: "boolean", schema: null, source: "runtime", default: l } : Array.isArray(l) ? { type: "array", schema: null, source: "runtime", default: [] } : l instanceof Date ? { type: "date", schema: null, source: "runtime", default: l } : a === "object" ? { type: "object", schema: null, source: "runtime", default: {} } : { type: "unknown", schema: null, source: "runtime", default: l };
}
function _(l, a, e) {
  if (a == null || typeof a != "object") {
    const t = { _meta: { value: a } };
    return t._meta.typeInfo = I(a, e), t;
  }
  if (Array.isArray(a)) {
    const t = { _meta: { arrayKeys: [] } };
    return t._meta.typeInfo = I(a, e), a.forEach((o, n) => {
      const s = M(), r = e ? {
        ...e,
        path: [...e.path, n.toString()]
      } : void 0;
      t[s] = _(l, o, r), t._meta.arrayKeys.push(s);
    }), t;
  }
  if (a.constructor === Object) {
    const t = { _meta: {} };
    t._meta.typeInfo = I(a, e);
    for (const o in a)
      if (Object.prototype.hasOwnProperty.call(a, o)) {
        const n = e ? {
          ...e,
          path: [...e.path, o]
        } : void 0;
        t[o] = _(l, a[o], n);
      }
    return t;
  }
  return {
    _meta: {
      value: a,
      typeInfo: O(a)
    }
  };
}
function I(l, a) {
  if (a) {
    let e = null;
    if (a.schemas.zodV4) {
      const t = a.path.length === 0 ? a.schemas.zodV4 : A(a.schemas.zodV4, a.path);
      t && (e = E(t, "zod4"));
    }
    if (!e && a.schemas.zodV3) {
      const t = a.path.length === 0 ? a.schemas.zodV3 : A(a.schemas.zodV3, a.path);
      t && (e = E(t, "zod3"));
    }
    if (!e && a.schemas.sync?.[a.stateKey] && (e = O(l), e.source = "sync"), e) return e;
  }
  return O(l);
}
function v(l, a, e) {
  const t = h.get(l) || h.get(`[${l}`);
  if (!t) return;
  function o(n, s) {
    if (!n || typeof n != "object") return;
    const r = A(a, s);
    if (r) {
      const i = E(r, e);
      i && (n._meta || (n._meta = {}), n._meta.typeInfo = {
        ...i,
        schema: r
      });
    }
    n._meta?.arrayKeys ? n._meta.arrayKeys.forEach((i) => {
      n[i] && o(n[i], [...s, "0"]);
    }) : n._meta?.hasOwnProperty("value") || Object.keys(n).forEach((i) => {
      i !== "_meta" && o(n[i], [...s, i]);
    });
  }
  o(t, []);
}
function D(l) {
  let a = l;
  for (; a; ) {
    const e = a.def || a._def, t = e?.typeName || e?.type || a._type;
    if (t === "ZodOptional" || t === "optional" || t === "ZodNullable" || t === "nullable" || t === "ZodDefault" || t === "default" || t === "ZodEffects" || t === "effects")
      a = e.innerType || e.schema || a._inner || a.unwrap?.();
    else
      break;
  }
  return a;
}
function A(l, a) {
  if (!l) return null;
  if (a.length === 0) return l;
  let e = l;
  for (const t of a) {
    const o = D(e);
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
let z = 0;
const V = Date.now().toString(36);
function M(l) {
  return `id:local_${V}_${(z++).toString(36)}`;
}
const C = K((l, a) => ({
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
        components: u,
        features: p,
        lastServerSync: y,
        stateSource: m,
        baseServerState: d,
        pathComponents: S,
        signals: b,
        validation: g
      } = s._meta;
      u && (r.components = u), p && (r.features = p), y && (r.lastServerSync = y), m && (r.stateSource = m), d && (r.baseServerState = d), S && (r.pathComponents = S), b && (r.signals = b), g && (r.validation = g);
    }
    function i(u, p) {
      if (p._meta || u._meta) {
        const d = u._meta || {}, S = p._meta || {}, b = { ...d, ...S };
        d.typeInfo?.schema && !S.typeInfo?.schema && (b.typeInfo = d.typeInfo), d.validation && !S.validation && (b.validation = d.validation), d.components && (b.components = d.components), u._meta = b;
      }
      if (p._meta?.hasOwnProperty("value")) {
        for (const d in u)
          d !== "_meta" && delete u[d];
        return;
      }
      const y = new Set(
        Object.keys(p).filter((d) => d !== "_meta")
      ), m = new Set(
        Object.keys(u).filter((d) => d !== "_meta")
      );
      for (const d of m)
        y.has(d) || delete u[d];
      for (const d of y) {
        const S = p[d], b = u[d];
        b && typeof b == "object" && S && typeof S == "object" ? i(b, S) : u[d] = S;
      }
    }
    s ? (i(s, t), s._meta || (s._meta = {}), Object.assign(s._meta, r), h.set(n, s)) : (r && Object.keys(r).length > 0 && (t._meta || (t._meta = {}), Object.assign(t._meta, r)), h.set(n, t));
    const c = a().getInitialOptions(e);
    (c?.validation?.zodSchemaV4 || c?.validation?.zodSchemaV3) && (c.validation?.zodSchemaV4 ? v(e, c.validation.zodSchemaV4, "zod4") : c.validation?.zodSchemaV3 && v(e, c.validation.zodSchemaV3, "zod3")), n === e ? h.delete(`[${e}`) : h.delete(e);
  },
  initializeShadowState: (e, t) => {
    const o = h.get(e) || h.get(`[${e}`);
    let n = {};
    if (o?._meta) {
      const {
        components: u,
        features: p,
        lastServerSync: y,
        stateSource: m,
        baseServerState: d
      } = o._meta;
      u && (n.components = u), p && (n.features = p), y && (n.lastServerSync = y), m && (n.stateSource = m), d && (n.baseServerState = d);
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
    }, c = _(e, t, i);
    c._meta || (c._meta = {}), Object.assign(c._meta, n);
    const f = Array.isArray(t) ? `[${e}` : e;
    h.set(f, c);
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
    r._meta || (r._meta = {}), Object.assign(r._meta, o);
  },
  getShadowValue: (e, t, o) => {
    const n = a().getShadowNode(e, t);
    if (!n)
      return;
    const s = {}, r = [
      [n, s, "final"]
    ];
    for (; r.length > 0; ) {
      const [i, c, f] = r.pop();
      if (i._meta?.hasOwnProperty("value")) {
        c[f] = i._meta.value;
        continue;
      }
      if (i._meta?.arrayKeys) {
        const y = o || i._meta.arrayKeys, m = [];
        c[f] = m;
        for (let d = y.length - 1; d >= 0; d--) {
          const S = y[d];
          i[S] && r.push([i[S], m, d]);
        }
        continue;
      }
      const u = {};
      c[f] = u;
      const p = Object.keys(i);
      for (const y of p)
        y !== "_meta" && r.push([i[y], u, y]);
    }
    return s.final;
  },
  updateShadowAtPath: (e, t, o) => {
    const n = h.has(`[${e}`) ? `[${e}` : e;
    let s = h.get(n);
    if (!s) return;
    let r = s;
    for (let f = 0; f < t.length - 1; f++)
      r[t[f]] || (r[t[f]] = {}), r = r[t[f]];
    const i = t.length === 0 ? r : r[t[t.length - 1]];
    function c(f, u, p) {
      if (typeof u != "object" || u === null || u instanceof Date) {
        const m = f._meta || {};
        for (const d in f)
          d !== "_meta" && delete f[d];
        f._meta = { ...m, value: u };
        return;
      }
      if (Array.isArray(u)) {
        f._meta || (f._meta = {}), f._meta.arrayKeys || (f._meta.arrayKeys = []);
        const m = f._meta.arrayKeys, d = u, S = [];
        for (let b = 0; b < d.length; b++) {
          const g = d[b];
          if (b < m.length) {
            const w = m[b];
            c(f[w], g, [
              ...p,
              w
            ]), S.push(w);
          } else {
            const w = M(), j = a().getInitialOptions(e), N = {
              stateKey: e,
              path: [...p, "0"],
              // Use '0' for array element schema lookup
              schemas: {
                zodV4: j?.validation?.zodSchemaV4,
                zodV3: j?.validation?.zodSchemaV3
              }
            };
            f[w] = _(
              e,
              g,
              N
            ), S.push(w);
          }
        }
        m.length > d.length && m.slice(d.length).forEach((g) => {
          delete f[g];
        }), f._meta.arrayKeys = S;
        return;
      }
      const y = new Set(Object.keys(u));
      f._meta?.hasOwnProperty("value") && delete f._meta.value;
      for (const m of y) {
        const d = u[m];
        if (f[m])
          c(f[m], d, [
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
          f[m] = _(e, d, b);
        }
      }
      for (const m in f)
        m === "_meta" || !Object.prototype.hasOwnProperty.call(f, m) || y.has(m) || delete f[m];
    }
    i ? c(i, o, t) : r[t[t.length - 1]] = _(e, o), a().notifyPathSubscribers([e, ...t].join("."), {
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
    const i = s || `${M()}`;
    r[i] = _(e, o);
    const c = r._meta.arrayKeys, f = n !== void 0 && n >= 0 && n <= c.length ? n : c.length;
    f >= c.length ? c.push(i) : c.splice(f, 0, i);
    const u = [e, ...t].join(".");
    return a().notifyPathSubscribers(u, {
      type: "INSERT",
      path: u,
      itemKey: `${u}.${i}`,
      index: f
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
    o.forEach((u) => {
      const p = `${M()}`;
      r.push(p), s[p] = _(e, u);
    });
    const i = s._meta.arrayKeys, c = n !== void 0 && n >= 0 && n <= i.length ? n : i.length;
    c >= i.length ? i.push(...r) : i.splice(c, 0, ...r);
    const f = [e, ...t].join(".");
    a().notifyPathSubscribers(f, {
      type: "INSERT_MANY",
      path: f,
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
        const c = [e, ...t].join("."), f = new Set(i.paths);
        f.add(c);
        const u = { ...i, paths: f }, p = new Map(r.components);
        p.set(o, u), a().setShadowMetadata(e, [], { components: p });
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
    l((o) => ({
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
    l((o) => {
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
    l((t) => {
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
    l((t) => {
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
    !e || e.length === 0 || l((t) => {
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
    l((o) => ({
      initialStateOptions: { ...o.initialStateOptions, [e]: t }
    }));
  },
  updateInitialStateGlobal: (e, t) => {
    l((o) => ({
      initialStateGlobal: { ...o.initialStateGlobal, [e]: t }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, t) => l((o) => {
    const n = new Map(o.syncInfoStore);
    return n.set(e, t), { syncInfoStore: n };
  }),
  getSyncInfo: (e) => a().syncInfoStore.get(e) || null
}));
function P(l) {
  const a = [], e = h.get(l) || h.get(`[${l}`);
  if (!e) return a;
  const t = (o) => {
    if (!(!o || typeof o != "object")) {
      o._meta?.clientActivityState?.elements && o._meta.clientActivityState.elements.forEach((n) => {
        n.domRef?.current && a.push(n.domRef.current);
      });
      for (const n in o)
        n !== "_meta" && t(o[n]);
    }
  };
  return t(e), a;
}
function R(l, a) {
  const e = h.get(l) || h.get(`[${l}`);
  if (!e) return;
  const t = (o) => {
    if (!(!o || typeof o != "object")) {
      o._meta?.clientActivityState?.elements && o._meta.clientActivityState.elements.forEach((n) => {
        const s = n.domRef?.current;
        s && ("disabled" in s ? s.disabled = a : (s.style.pointerEvents = a ? "none" : "", s.setAttribute("aria-disabled", String(a))));
      });
      for (const n in o)
        n !== "_meta" && t(o[n]);
    }
  };
  t(e);
}
export {
  _ as buildShadowNode,
  M as generateId,
  P as getAllFieldElements,
  C as getGlobalStore,
  R as setAllFieldsDisabled,
  h as shadowStateStore,
  v as updateShadowTypeInfo
};
//# sourceMappingURL=store.js.map
