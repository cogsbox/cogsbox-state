import { create as N } from "zustand";
function I(f, o = "zod4") {
  if (!f) return null;
  let t = f, e = !1, n = !1, a, s = !1;
  for (let l = 0; l < 20; l++) {
    const d = t?.def || t?._def;
    if (!d) break;
    const y = d.typeName || d.type || t._type;
    if (y === "ZodUnion" || y === "union")
      if (d.options && d.options.length > 0) {
        t = d.options[0];
        continue;
      } else
        break;
    if (y === "ZodOptional" || y === "optional")
      n = !0;
    else if (y === "ZodNullable" || y === "nullable")
      e = !0;
    else if (y === "ZodDefault" || y === "default")
      s = !0, a = typeof d.defaultValue == "function" ? d.defaultValue() : d.defaultValue;
    else if (y !== "ZodEffects" && y !== "effects")
      break;
    const h = d.innerType || d.schema || t._inner;
    if (!h || h === t)
      break;
    t = h;
  }
  const i = t, r = i?.def || i?._def, u = r?.typeName || r?.type || i?._type;
  return u === "ZodNumber" || u === "number" ? {
    type: "number",
    schema: f,
    source: o,
    default: s ? a : 0,
    nullable: e,
    optional: n
  } : u === "ZodString" || u === "string" ? {
    type: "string",
    schema: f,
    source: o,
    default: s ? a : "",
    nullable: e,
    optional: n
  } : u === "ZodBoolean" || u === "boolean" ? {
    type: "boolean",
    schema: f,
    source: o,
    default: s ? a : !1,
    nullable: e,
    optional: n
  } : u === "ZodArray" || u === "array" ? {
    type: "array",
    schema: f,
    source: o,
    default: s ? a : [],
    nullable: e,
    optional: n
  } : u === "ZodObject" || u === "object" ? {
    type: "object",
    schema: f,
    source: o,
    default: s ? a : {},
    nullable: e,
    optional: n
  } : u === "ZodDate" || u === "date" ? {
    type: "date",
    schema: f,
    source: o,
    default: s ? a : /* @__PURE__ */ new Date(),
    nullable: e,
    optional: n
  } : null;
}
function A(f) {
  if (f === null)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: null,
      nullable: !0
    };
  if (f === void 0)
    return {
      type: "unknown",
      schema: null,
      source: "default",
      default: void 0,
      optional: !0
    };
  const o = typeof f;
  return o === "number" ? { type: "number", schema: null, source: "runtime", default: f } : o === "string" ? { type: "string", schema: null, source: "runtime", default: f } : o === "boolean" ? { type: "boolean", schema: null, source: "runtime", default: f } : Array.isArray(f) ? { type: "array", schema: null, source: "runtime", default: [] } : f instanceof Date ? { type: "date", schema: null, source: "runtime", default: f } : o === "object" ? { type: "object", schema: null, source: "runtime", default: {} } : { type: "unknown", schema: null, source: "runtime", default: f };
}
function g(f, o, t) {
  if (o == null || typeof o != "object") {
    const e = { _meta: { value: o } };
    return e._meta.typeInfo = j(o, t), e;
  }
  if (Array.isArray(o)) {
    const e = { _meta: { arrayKeys: [] } };
    return e._meta.typeInfo = j(o, t), o.forEach((n, a) => {
      const s = w(), i = t ? {
        ...t,
        path: [...t.path, a.toString()]
      } : void 0;
      e[s] = g(f, n, i), e._meta.arrayKeys.push(s);
    }), e;
  }
  if (o.constructor === Object) {
    const e = { _meta: {} };
    e._meta.typeInfo = j(o, t);
    for (const n in o)
      if (Object.prototype.hasOwnProperty.call(o, n)) {
        const a = t ? {
          ...t,
          path: [...t.path, n]
        } : void 0;
        e[n] = g(f, o[n], a);
      }
    return e;
  }
  return {
    _meta: {
      value: o,
      typeInfo: A(o)
    }
  };
}
function j(f, o) {
  if (o) {
    let t = null;
    if (o.schemas.zodV4) {
      const e = o.path.length === 0 ? o.schemas.zodV4 : v(o.schemas.zodV4, o.path);
      e && (t = I(e, "zod4"));
    }
    if (!t && o.schemas.zodV3) {
      const e = o.path.length === 0 ? o.schemas.zodV3 : v(o.schemas.zodV3, o.path);
      e && (t = I(e, "zod3"));
    }
    if (!t && o.schemas.sync?.[o.stateKey] && (t = A(f), t.source = "sync"), t) return t;
  }
  return A(f);
}
function O(f, o, t) {
  const e = b.get(f) || b.get(`[${f}`);
  if (!e) return;
  function n(a, s) {
    if (!a || typeof a != "object") return;
    const i = v(o, s);
    if (i) {
      const r = I(i, t);
      r && (a._meta || (a._meta = {}), a._meta.typeInfo = {
        ...r,
        schema: i
      });
    }
    a._meta?.arrayKeys ? a._meta.arrayKeys.forEach((r) => {
      a[r] && n(a[r], [...s, "0"]);
    }) : a._meta?.hasOwnProperty("value") || Object.keys(a).forEach((r) => {
      r !== "_meta" && n(a[r], [...s, r]);
    });
  }
  n(e, []);
}
function K(f) {
  let o = f;
  for (; o; ) {
    const t = o.def || o._def, e = t?.typeName || t?.type || o._type;
    if (e === "ZodOptional" || e === "optional" || e === "ZodNullable" || e === "nullable" || e === "ZodDefault" || e === "default" || e === "ZodEffects" || e === "effects")
      o = t.innerType || t.schema || o._inner || o.unwrap?.();
    else
      break;
  }
  return o;
}
function v(f, o) {
  if (!f) return null;
  if (o.length === 0) return f;
  let t = f;
  for (const e of o) {
    const n = K(t);
    if (!n) return null;
    const a = n.def || n._def, s = a?.typeName || a?.type || n._type;
    if (s === "ZodObject" || s === "object")
      t = (a?.shape || n.shape || n._shape)?.[e];
    else if (s === "ZodArray" || s === "array")
      t = n.element || a?.type;
    else
      return null;
    if (!t)
      return null;
  }
  return t;
}
const b = /* @__PURE__ */ new Map();
let z = 0;
const V = Date.now().toString(36);
function w(f) {
  return `id:local_${V}_${(z++).toString(36)}`;
}
const C = N((f, o) => ({
  getPluginMetaDataMap: (t, e) => o().getShadowMetadata(t, e)?.pluginMetaData,
  setPluginMetaData: (t, e, n, a) => {
    const s = o().getShadowMetadata(t, e) || {}, i = new Map(s.pluginMetaData || []), r = i.get(n) || {};
    i.set(n, { ...r, ...a }), o().setShadowMetadata(t, e, { ...s, pluginMetaData: i }), o().notifyPathSubscribers([t, ...e].join("."), {
      type: "METADATA_UPDATE"
    });
  },
  removePluginMetaData: (t, e, n) => {
    const a = o().getShadowMetadata(t, e);
    if (!a?.pluginMetaData) return;
    const s = new Map(a.pluginMetaData);
    s.delete(n), o().setShadowMetadata(t, e, { ...a, pluginMetaData: s });
  },
  setTransformCache: (t, e, n, a) => {
    const s = o().getShadowMetadata(t, e) || {};
    s.transformCaches || (s.transformCaches = /* @__PURE__ */ new Map()), s.transformCaches.set(n, a), o().setShadowMetadata(t, e, {
      transformCaches: s.transformCaches
    });
  },
  // Replace your entire `initializeAndMergeShadowState` function with this one.
  initializeAndMergeShadowState: (t, e) => {
    const a = e?._meta?.arrayKeys !== void 0 ? `[${t}` : t;
    console.log("initializeAndMergeShadowState running");
    const s = b.get(a) || b.get(t) || b.get(`[${t}`);
    let i = {};
    if (s?._meta) {
      const {
        components: d,
        features: y,
        lastServerSync: h,
        stateSource: p,
        baseServerState: c,
        pathComponents: m,
        signals: S,
        validation: _
      } = s._meta;
      d && (i.components = d), y && (i.features = y), h && (i.lastServerSync = h), p && (i.stateSource = p), c && (i.baseServerState = c), m && (i.pathComponents = m), S && (i.signals = S), _ && (i.validation = _);
    }
    function r(d, y) {
      if (y._meta || d._meta) {
        const c = d._meta || {}, m = y._meta || {}, S = { ...c, ...m };
        c.typeInfo?.schema && !m.typeInfo?.schema && (S.typeInfo = c.typeInfo), c.validation && !m.validation && (S.validation = c.validation), c.components && (S.components = c.components), c.clientActivityState && !m.clientActivityState && (S.clientActivityState = c.clientActivityState), c.pluginMetaData && !m.pluginMetaData && (S.pluginMetaData = c.pluginMetaData), d._meta = S;
      }
      if (y._meta?.hasOwnProperty("value")) {
        for (const c in d)
          c !== "_meta" && delete d[c];
        return;
      }
      const h = new Set(
        Object.keys(y).filter((c) => c !== "_meta")
      ), p = new Set(
        Object.keys(d).filter((c) => c !== "_meta")
      );
      for (const c of p)
        h.has(c) || delete d[c];
      for (const c of h) {
        const m = y[c], S = d[c];
        S && typeof S == "object" && m && typeof m == "object" ? r(S, m) : d[c] = m;
      }
    }
    s ? (r(s, e), s._meta || (s._meta = {}), Object.assign(s._meta, i), b.set(a, s)) : (i && Object.keys(i).length > 0 && (e._meta || (e._meta = {}), Object.assign(e._meta, i)), b.set(a, e));
    const u = o().getInitialOptions(t);
    (u?.validation?.zodSchemaV4 || u?.validation?.zodSchemaV3) && (u.validation?.zodSchemaV4 ? O(t, u.validation.zodSchemaV4, "zod4") : u.validation?.zodSchemaV3 && O(t, u.validation.zodSchemaV3, "zod3")), a === t ? b.delete(`[${t}`) : b.delete(t);
  },
  initializeShadowState: (t, e) => {
    const n = b.get(t) || b.get(`[${t}`);
    let a = {};
    const s = /* @__PURE__ */ new Map();
    if (n) {
      const h = (p, c) => {
        if (!(!p || typeof p != "object")) {
          (p._meta?.clientActivityState || p._meta?.pluginMetaData) && s.set(c.join("\0"), {
            clientActivityState: p._meta.clientActivityState,
            pluginMetaData: p._meta.pluginMetaData
          });
          for (const m in p)
            m !== "_meta" && h(p[m], [...c, m]);
        }
      };
      h(n, []);
    }
    if (n?._meta) {
      const {
        components: h,
        features: p,
        lastServerSync: c,
        stateSource: m,
        baseServerState: S
      } = n._meta;
      h && (a.components = h), p && (a.features = p), c && (a.lastServerSync = c), m && (a.stateSource = m), S && (a.baseServerState = S);
    }
    b.delete(t), b.delete(`[${t}`);
    const i = o().getInitialOptions(t), r = o().getInitialOptions("__syncSchemas"), u = {
      stateKey: t,
      path: [],
      schemas: {
        sync: r,
        zodV4: i?.validation?.zodSchemaV4,
        zodV3: i?.validation?.zodSchemaV3
      }
    }, l = g(t, e, u);
    l._meta || (l._meta = {}), Object.assign(l._meta, a);
    const d = (h, p) => {
      if (!h || typeof h != "object") return;
      const c = p.join("\0"), m = s.get(c);
      m && (h._meta || (h._meta = {}), m.clientActivityState && (h._meta.clientActivityState = m.clientActivityState), m.pluginMetaData && (h._meta.pluginMetaData = m.pluginMetaData));
      for (const S in h)
        S !== "_meta" && d(h[S], [...p, S]);
    };
    d(l, []);
    const y = Array.isArray(e) ? `[${t}` : t;
    b.set(y, l);
  },
  getShadowNode: (t, e) => {
    let n = b.get(t) || b.get(`[${t}`);
    if (n) {
      if (e.length === 0) return n;
      for (const a of e)
        if (typeof n != "object" || n === null || (n = n[a], n === void 0)) return;
      return n;
    }
  },
  getShadowMetadata: (t, e) => o().getShadowNode(t, e)?._meta,
  setShadowMetadata: (t, e, n) => {
    const a = b.has(`[${t}`) ? `[${t}` : t;
    let s = b.get(a);
    if (console.log("newMetadata", n), !s) {
      s = { _meta: n }, b.set(a, s);
      return;
    }
    let i = s;
    for (const r of e)
      i[r] || (i[r] = {}), i = i[r];
    i._meta || (i._meta = {}), Object.assign(i._meta, n);
  },
  getShadowValue: (t, e, n) => {
    const a = o().getShadowNode(t, e);
    if (!a)
      return;
    const s = {}, i = [
      [a, s, "final"]
    ];
    for (; i.length > 0; ) {
      const [r, u, l] = i.pop();
      if (r._meta?.hasOwnProperty("value")) {
        u[l] = r._meta.value;
        continue;
      }
      if (r._meta?.arrayKeys) {
        const h = n || r._meta.arrayKeys, p = [];
        u[l] = p;
        for (let c = h.length - 1; c >= 0; c--) {
          const m = h[c];
          r[m] && i.push([r[m], p, c]);
        }
        continue;
      }
      const d = {};
      u[l] = d;
      const y = Object.keys(r);
      for (const h of y)
        h !== "_meta" && i.push([r[h], d, h]);
    }
    return s.final;
  },
  updateShadowAtPath: (t, e, n) => {
    const a = b.has(`[${t}`) ? `[${t}` : t;
    let s = b.get(a);
    if (!s) return;
    let i = s;
    for (let l = 0; l < e.length - 1; l++)
      i[e[l]] || (i[e[l]] = {}), i = i[e[l]];
    const r = e.length === 0 ? i : i[e[e.length - 1]];
    function u(l, d, y) {
      if (typeof d != "object" || d === null || d instanceof Date) {
        const p = l._meta || {};
        for (const c in l)
          c !== "_meta" && delete l[c];
        l._meta = { ...p, value: d };
        return;
      }
      if (Array.isArray(d)) {
        l._meta || (l._meta = {}), l._meta.arrayKeys || (l._meta.arrayKeys = []);
        const p = l._meta.arrayKeys, c = d, m = [];
        for (let S = 0; S < c.length; S++) {
          const _ = c[S];
          if (S < p.length) {
            const M = p[S];
            u(l[M], _, [
              ...y,
              M
            ]), m.push(M);
          } else {
            const M = w(), E = o().getInitialOptions(t), D = {
              stateKey: t,
              path: [...y, "0"],
              // Use '0' for array element schema lookup
              schemas: {
                zodV4: E?.validation?.zodSchemaV4,
                zodV3: E?.validation?.zodSchemaV3
              }
            };
            l[M] = g(
              t,
              _,
              D
            ), m.push(M);
          }
        }
        p.length > c.length && p.slice(c.length).forEach((_) => {
          delete l[_];
        }), l._meta.arrayKeys = m;
        return;
      }
      const h = new Set(Object.keys(d));
      l._meta?.hasOwnProperty("value") && delete l._meta.value;
      for (const p of h) {
        const c = d[p];
        if (l[p])
          u(l[p], c, [
            ...y,
            p
          ]);
        else {
          const m = o().getInitialOptions(t), S = {
            stateKey: t,
            path: [...y, p],
            schemas: {
              zodV4: m?.validation?.zodSchemaV4,
              zodV3: m?.validation?.zodSchemaV3
            }
          };
          l[p] = g(t, c, S);
        }
      }
      for (const p in l)
        p === "_meta" || !Object.prototype.hasOwnProperty.call(l, p) || h.has(p) || delete l[p];
    }
    r ? u(r, n, e) : i[e[e.length - 1]] = g(t, n), o().notifyPathSubscribers([t, ...e].join("."), {
      type: "UPDATE",
      newValue: n
    });
  },
  addItemsToArrayNode: (t, e, n) => {
    const a = b.has(`[${t}`) ? `[${t}` : t;
    let s = b.get(a);
    if (!s) {
      console.error("Root not found for state key:", t);
      return;
    }
    let i = s;
    for (const r of e)
      i[r] || (i[r] = {}), i = i[r];
    Object.assign(i, n);
  },
  insertShadowArrayElement: (t, e, n, a, s) => {
    const i = o().getShadowNode(t, e);
    if (!i?._meta?.arrayKeys)
      throw new Error(
        `Array not found at path: ${[t, ...e].join(".")}`
      );
    const r = s || `${w()}`;
    i[r] = g(t, n);
    const u = i._meta.arrayKeys, l = a !== void 0 && a >= 0 && a <= u.length ? a : u.length;
    l >= u.length ? u.push(r) : u.splice(l, 0, r);
    const d = [t, ...e].join(".");
    return o().notifyPathSubscribers(d, {
      type: "INSERT",
      path: d,
      itemKey: `${d}.${r}`,
      index: l
    }), r;
  },
  insertManyShadowArrayElements: (t, e, n, a) => {
    if (!n || n.length === 0)
      return;
    const s = o().getShadowNode(t, e);
    if (!s?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[t, ...e].join(".")}`
      );
      return;
    }
    const i = [];
    n.forEach((d) => {
      const y = `${w()}`;
      i.push(y), s[y] = g(t, d);
    });
    const r = s._meta.arrayKeys, u = a !== void 0 && a >= 0 && a <= r.length ? a : r.length;
    u >= r.length ? r.push(...i) : r.splice(u, 0, ...i);
    const l = [t, ...e].join(".");
    o().notifyPathSubscribers(l, {
      type: "INSERT_MANY",
      path: l,
      count: n.length,
      index: u
    });
  },
  removeShadowArrayElement: (t, e) => {
    if (e.length === 0) return;
    const n = e.slice(0, -1), a = e[e.length - 1];
    if (!a?.startsWith("id:")) return;
    const s = o().getShadowNode(t, n);
    if (!s?._meta?.arrayKeys) return;
    const i = s._meta.arrayKeys, r = i.indexOf(a);
    if (r === -1) return;
    r === i.length - 1 ? i.pop() : r === 0 ? i.shift() : i.splice(r, 1), delete s[a];
    const u = [t, ...n].join(".");
    o().notifyPathSubscribers(u, {
      type: "REMOVE",
      path: u,
      itemKey: `${u}.${a}`
    });
  },
  registerComponent: (t, e, n) => {
    const a = o().getShadowMetadata(t, []) || {}, s = new Map(a.components);
    s.set(e, n), o().setShadowMetadata(t, [], { components: s });
  },
  unregisterComponent: (t, e) => {
    const n = o().getShadowMetadata(t, []);
    if (!n?.components) return;
    const a = new Map(n.components);
    a.delete(e) && o().setShadowMetadata(t, [], { components: a });
  },
  addPathComponent: (t, e, n) => {
    const a = o().getShadowMetadata(t, e) || {}, s = new Set(a.pathComponents);
    s.add(n), o().setShadowMetadata(t, e, {
      pathComponents: s
    });
    const i = o().getShadowMetadata(t, []);
    if (i?.components) {
      const r = i.components.get(n);
      if (r) {
        const u = [t, ...e].join("."), l = new Set(r.paths);
        l.add(u);
        const d = { ...r, paths: l }, y = new Map(i.components);
        y.set(n, d), o().setShadowMetadata(t, [], { components: y });
      }
    }
  },
  markAsDirty: (t, e, n = { bubble: !0 }) => {
    let a = o().getShadowNode(t, []);
    if (!a) return;
    let s = a;
    for (const r of e)
      if (s = s[r], !s) return;
    if (s._meta || (s._meta = {}), s._meta.isDirty = !0, !n.bubble) return;
    let i = a;
    for (let r = 0; r < e.length; r++) {
      if (i._meta?.isDirty)
        return;
      i._meta || (i._meta = {}), i._meta.isDirty = !0, i = i[e[r]];
    }
  },
  // Keep these in Zustand as they need React reactivity
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (t, e) => {
    f((n) => ({
      serverStateUpdates: new Map(n.serverStateUpdates).set(
        t,
        e
      )
    })), o().notifyPathSubscribers(t, {
      type: "SERVER_STATE_UPDATE",
      serverState: e
    });
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (t, e) => {
    const n = o().pathSubscribers, a = n.get(t) || /* @__PURE__ */ new Set();
    return a.add(e), n.set(t, a), () => {
      const s = o().pathSubscribers.get(t);
      s && (s.delete(e), s.size === 0 && o().pathSubscribers.delete(t));
    };
  },
  notifyPathSubscribers: (t, e) => {
    const a = o().pathSubscribers.get(t);
    a && a.forEach((s) => s(e));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (t, e) => {
    const n = o().selectedIndicesMap.get(t);
    if (!n) return -1;
    const a = o().getShadowMetadata(
      t.split(".")[0],
      t.split(".").slice(1)
    ), s = e || a?.arrayKeys;
    return s ? s.indexOf(n) : -1;
  },
  setSelectedIndex: (t, e) => {
    f((n) => {
      const a = new Map(n.selectedIndicesMap);
      return e === void 0 ? a.delete(t) : (a.has(t) && o().notifyPathSubscribers(a.get(t), {
        type: "THIS_UNSELECTED"
      }), a.set(t, e), o().notifyPathSubscribers(e, { type: "THIS_SELECTED" })), o().notifyPathSubscribers(t, { type: "GET_SELECTED" }), {
        ...n,
        selectedIndicesMap: a
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: t }) => {
    f((e) => {
      const n = new Map(e.selectedIndicesMap), a = n.get(t);
      return a && o().notifyPathSubscribers(a, {
        type: "CLEAR_SELECTION"
      }), n.delete(t), o().notifyPathSubscribers(t, {
        type: "CLEAR_SELECTION"
      }), {
        ...e,
        selectedIndicesMap: n
      };
    });
  },
  clearSelectedIndexesForState: (t) => {
    f((e) => {
      const n = new Map(e.selectedIndicesMap);
      let a = !1;
      for (const s of n.keys())
        (s === t || s.startsWith(t + ".")) && (n.delete(s), a = !0);
      return a ? { selectedIndicesMap: n } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (t) => {
    !t || t.length === 0 || f((e) => {
      const n = new Map(e.stateLog), a = /* @__PURE__ */ new Map();
      for (const s of t) {
        const i = a.get(s.stateKey) || [];
        i.push(s), a.set(s.stateKey, i);
      }
      for (const [s, i] of a.entries()) {
        const r = new Map(n.get(s));
        for (const u of i)
          r.set(JSON.stringify(u.path), { ...u });
        n.set(s, r);
      }
      return { stateLog: n };
    });
  },
  getInitialOptions: (t) => o().initialStateOptions[t],
  setInitialStateOptions: (t, e) => {
    f((n) => ({
      initialStateOptions: { ...n.initialStateOptions, [t]: e }
    }));
  },
  updateInitialStateGlobal: (t, e) => {
    f((n) => ({
      initialStateGlobal: { ...n.initialStateGlobal, [t]: e }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (t, e) => f((n) => {
    const a = new Map(n.syncInfoStore);
    return a.set(t, e), { syncInfoStore: a };
  }),
  getSyncInfo: (t) => o().syncInfoStore.get(t) || null
}));
function P(f) {
  const o = [], t = b.get(f) || b.get(`[${f}`);
  if (console.log("testtestsetsetsetse", t), !t) return o;
  const e = (n) => {
    if (!(!n || typeof n != "object")) {
      n._meta?.clientActivityState?.elements && n._meta.clientActivityState.elements.forEach((a) => {
        a.domRef?.current && (console.log("jjjjjjjjjjjjjjjjjjjj", a), o.push(a.domRef.current));
      });
      for (const a in n)
        a !== "_meta" && e(n[a]);
    }
  };
  return e(t), console.log("elementselements", o), o;
}
function R(f, o) {
  const t = b.get(f) || b.get(`[${f}`);
  if (!t) return;
  const e = (n) => {
    if (!(!n || typeof n != "object")) {
      n._meta?.clientActivityState?.elements && n._meta.clientActivityState.elements.forEach((a) => {
        const s = a.domRef?.current;
        s && ("disabled" in s ? s.disabled = o : (s.style.pointerEvents = o ? "none" : "", s.setAttribute("aria-disabled", String(o))));
      });
      for (const a in n)
        a !== "_meta" && e(n[a]);
    }
  };
  e(t);
}
export {
  g as buildShadowNode,
  w as generateId,
  P as getAllFieldElements,
  C as getGlobalStore,
  R as setAllFieldsDisabled,
  b as shadowStateStore,
  O as updateShadowTypeInfo
};
//# sourceMappingURL=store.js.map
