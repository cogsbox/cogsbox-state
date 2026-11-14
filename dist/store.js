import { create as D } from "zustand";
function A(u, o = "zod4") {
  if (!u) return null;
  let t = u, e = !1, n = !1, a, i = !1;
  for (let f = 0; f < 20; f++) {
    const d = t?.def || t?._def;
    if (!d) break;
    const m = d.typeName || d.type || t._type;
    if (m === "ZodUnion" || m === "union")
      if (d.options && d.options.length > 0) {
        t = d.options.find((c) => {
          const h = c?.def || c?._def, y = h?.typeName || h?.type || c?._type;
          return y !== "ZodNull" && y !== "null" && y !== "ZodUndefined" && y !== "undefined";
        }) ?? d.options[0];
        continue;
      } else
        break;
    if (m === "ZodOptional" || m === "optional")
      n = !0;
    else if (m === "ZodNullable" || m === "nullable")
      e = !0;
    else if (m === "ZodDefault" || m === "default")
      i = !0, a = typeof d.defaultValue == "function" ? d.defaultValue() : d.defaultValue;
    else if (m !== "ZodEffects" && m !== "effects")
      break;
    const b = d.innerType || d.schema || t._inner;
    if (!b || b === t)
      break;
    t = b;
  }
  const s = t, r = s?.def || s?._def, l = r?.typeName || r?.type || s?._type;
  return l === "ZodNumber" || l === "number" ? {
    type: "number",
    schema: u,
    source: o,
    default: i ? a : 0,
    nullable: e,
    optional: n
  } : l === "ZodString" || l === "string" ? {
    type: "string",
    schema: u,
    source: o,
    default: i ? a : "",
    nullable: e,
    optional: n
  } : l === "ZodBoolean" || l === "boolean" ? {
    type: "boolean",
    schema: u,
    source: o,
    default: i ? a : !1,
    nullable: e,
    optional: n
  } : l === "ZodArray" || l === "array" ? {
    type: "array",
    schema: u,
    source: o,
    default: i ? a : [],
    nullable: e,
    optional: n
  } : l === "ZodObject" || l === "object" ? {
    type: "object",
    schema: u,
    source: o,
    default: i ? a : {},
    nullable: e,
    optional: n
  } : l === "ZodDate" || l === "date" ? {
    type: "date",
    schema: u,
    source: o,
    default: i ? a : /* @__PURE__ */ new Date(),
    nullable: e,
    optional: n
  } : null;
}
function j(u) {
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
function _(u, o, t) {
  if (o == null || typeof o != "object") {
    const e = { _meta: { value: o } };
    return e._meta.typeInfo = O(o, t), e;
  }
  if (Array.isArray(o)) {
    const e = { _meta: { arrayKeys: [] } };
    return e._meta.typeInfo = O(o, t), o.forEach((n, a) => {
      const i = I(), s = t ? {
        ...t,
        path: [...t.path, a.toString()]
      } : void 0;
      e[i] = _(u, n, s), e._meta.arrayKeys.push(i);
    }), e;
  }
  if (o.constructor === Object) {
    const e = { _meta: {} };
    e._meta.typeInfo = O(o, t);
    for (const n in o)
      if (Object.prototype.hasOwnProperty.call(o, n)) {
        const a = t ? {
          ...t,
          path: [...t.path, n]
        } : void 0;
        e[n] = _(u, o[n], a);
      }
    return e;
  }
  return {
    _meta: {
      value: o,
      typeInfo: j(o)
    }
  };
}
function O(u, o) {
  if (o) {
    let t = null;
    if (o.schemas.zodV4) {
      const e = o.path.length === 0 ? o.schemas.zodV4 : v(o.schemas.zodV4, o.path);
      e && (t = A(e, "zod4"));
    }
    if (!t && o.schemas.zodV3) {
      const e = o.path.length === 0 ? o.schemas.zodV3 : v(o.schemas.zodV3, o.path);
      e && (t = A(e, "zod3"));
    }
    if (!t && o.schemas.sync?.[o.stateKey] && (t = j(u), t.source = "sync"), t) return t;
  }
  return j(u);
}
function w(u, o, t) {
  const e = S.get(u) || S.get(`[${u}`);
  if (!e) return;
  function n(a, i) {
    if (!a || typeof a != "object") return;
    const s = v(o, i);
    if (s) {
      const r = A(s, t);
      r && (a._meta || (a._meta = {}), a._meta.typeInfo = {
        ...r,
        schema: s
      });
    }
    a._meta?.arrayKeys ? a._meta.arrayKeys.forEach((r) => {
      a[r] && n(a[r], [...i, "0"]);
    }) : a._meta?.hasOwnProperty("value") || Object.keys(a).forEach((r) => {
      r !== "_meta" && n(a[r], [...i, r]);
    });
  }
  n(e, []);
}
function N(u) {
  let o = u;
  for (; o; ) {
    const t = o.def || o._def, e = t?.typeName || t?.type || o._type;
    if (e === "ZodOptional" || e === "optional" || e === "ZodNullable" || e === "nullable" || e === "ZodDefault" || e === "default" || e === "ZodEffects" || e === "effects")
      o = t.innerType || t.schema || o._inner || o.unwrap?.();
    else
      break;
  }
  return o;
}
function v(u, o) {
  if (!u) return null;
  if (o.length === 0) return u;
  let t = u;
  for (const e of o) {
    const n = N(t);
    if (!n) return null;
    const a = n.def || n._def, i = a?.typeName || a?.type || n._type;
    if (i === "ZodObject" || i === "object") {
      const s = a?.shape ?? n.shape ?? n._shape;
      t = (typeof s == "function" ? s() : s)?.[e];
    } else if (i === "ZodArray" || i === "array")
      t = n.element || a?.type;
    else
      return null;
    if (!t)
      return null;
  }
  return t;
}
const S = /* @__PURE__ */ new Map();
let K = 0;
const V = Date.now().toString(36);
function I(u) {
  return `id:local_${V}_${(K++).toString(36)}`;
}
const $ = D((u, o) => ({
  getPluginMetaDataMap: (t, e) => o().getShadowMetadata(t, e)?.pluginMetaData,
  setPluginMetaData: (t, e, n, a) => {
    const i = o().getShadowMetadata(t, e) || {}, s = new Map(i.pluginMetaData || []), r = s.get(n) || {};
    s.set(n, { ...r, ...a }), o().setShadowMetadata(t, e, { ...i, pluginMetaData: s }), o().notifyPathSubscribers([t, ...e].join("."), {
      type: "METADATA_UPDATE"
    });
  },
  removePluginMetaData: (t, e, n) => {
    const a = o().getShadowMetadata(t, e);
    if (!a?.pluginMetaData) return;
    const i = new Map(a.pluginMetaData);
    i.delete(n), o().setShadowMetadata(t, e, { ...a, pluginMetaData: i });
  },
  setTransformCache: (t, e, n, a) => {
    const i = o().getShadowMetadata(t, e) || {};
    i.transformCaches || (i.transformCaches = /* @__PURE__ */ new Map()), i.transformCaches.set(n, a), o().setShadowMetadata(t, e, {
      transformCaches: i.transformCaches
    });
  },
  // Replace your entire `initializeAndMergeShadowState` function with this one.
  initializeAndMergeShadowState: (t, e) => {
    const a = e?._meta?.arrayKeys !== void 0 ? `[${t}` : t, i = S.get(a) || S.get(t) || S.get(`[${t}`);
    let s = {};
    if (i?._meta) {
      const {
        components: d,
        features: m,
        pathComponents: b,
        signals: p,
        validation: c,
        hookInitialized: h
      } = i._meta;
      h && (s.hookInitialized = h), d && (s.components = d), m && (s.features = m), b && (s.pathComponents = b), p && (s.signals = p), c && (s.validation = c);
    }
    function r(d, m) {
      if (m._meta || d._meta) {
        const c = d._meta || {}, h = m._meta || {}, y = { ...c, ...h };
        c.typeInfo?.schema && !h.typeInfo?.schema && (y.typeInfo = c.typeInfo), c.validation && !h.validation && (y.validation = c.validation), c.components && (y.components = c.components), c.clientActivityState && !h.clientActivityState && (y.clientActivityState = c.clientActivityState), c.pluginMetaData && !h.pluginMetaData && (y.pluginMetaData = c.pluginMetaData), d._meta = y;
      }
      if (m._meta?.hasOwnProperty("value")) {
        for (const c in d)
          c !== "_meta" && delete d[c];
        return;
      }
      const b = new Set(
        Object.keys(m).filter((c) => c !== "_meta")
      ), p = new Set(
        Object.keys(d).filter((c) => c !== "_meta")
      );
      for (const c of p)
        b.has(c) || delete d[c];
      for (const c of b) {
        const h = m[c], y = d[c];
        y && typeof y == "object" && h && typeof h == "object" ? r(y, h) : d[c] = h;
      }
    }
    i ? (r(i, e), i._meta || (i._meta = {}), Object.assign(i._meta, s), S.set(a, i)) : (s && Object.keys(s).length > 0 && (e._meta || (e._meta = {}), Object.assign(e._meta, s)), S.set(a, e));
    const l = o().getInitialOptions(t);
    (l?.validation?.zodSchemaV4 || l?.validation?.zodSchemaV3) && (l.validation?.zodSchemaV4 ? w(t, l.validation.zodSchemaV4, "zod4") : l.validation?.zodSchemaV3 && w(t, l.validation.zodSchemaV3, "zod3")), a === t ? S.delete(`[${t}`) : S.delete(t);
  },
  initializeShadowState: (t, e) => {
    const n = S.get(t) || S.get(`[${t}`);
    let a = {};
    const i = /* @__PURE__ */ new Map();
    if (n) {
      const p = (c, h) => {
        if (!(!c || typeof c != "object")) {
          (c._meta?.clientActivityState || c._meta?.pluginMetaData) && i.set(h.join("\0"), {
            clientActivityState: c._meta.clientActivityState,
            pluginMetaData: c._meta.pluginMetaData
          });
          for (const y in c)
            y !== "_meta" && p(c[y], [...h, y]);
        }
      };
      p(n, []);
    }
    if (n?._meta) {
      const { components: p, features: c, hookInitialized: h } = n._meta;
      h && (a.hookInitialized = h), p && (a.components = p), c && (a.features = c);
    }
    S.delete(t), S.delete(`[${t}`);
    const s = o().getInitialOptions(t), r = o().getInitialOptions("__syncSchemas"), l = {
      stateKey: t,
      path: [],
      schemas: {
        sync: r,
        zodV4: s?.validation?.zodSchemaV4,
        zodV3: s?.validation?.zodSchemaV3
      }
    }, f = _(t, e, l);
    f._meta || (f._meta = {}), Object.assign(f._meta, a);
    const d = (p, c) => {
      if (!p || typeof p != "object") return;
      const h = c.join("\0"), y = i.get(h);
      y && (p._meta || (p._meta = {}), y.clientActivityState && (p._meta.clientActivityState = y.clientActivityState), y.pluginMetaData && (p._meta.pluginMetaData = y.pluginMetaData));
      for (const g in p)
        g !== "_meta" && d(p[g], [...c, g]);
    };
    d(f, []);
    const m = Array.isArray(e) ? `[${t}` : t;
    S.set(m, f);
    const b = o().getInitialOptions(t);
    b?.validation?.zodSchemaV4 ? w(t, b.validation.zodSchemaV4, "zod4") : b?.validation?.zodSchemaV3 && w(t, b.validation.zodSchemaV3, "zod3");
  },
  getShadowNode: (t, e) => {
    let n = S.get(t) || S.get(`[${t}`);
    if (n) {
      if (e.length === 0) return n;
      for (const a of e)
        if (typeof n != "object" || n === null || (n = n[a], n === void 0)) return;
      return n;
    }
  },
  getShadowMetadata: (t, e) => o().getShadowNode(t, e)?._meta,
  setShadowMetadata: (t, e, n) => {
    const a = S.has(`[${t}`) ? `[${t}` : t;
    let i = S.get(a);
    if (!i) {
      i = { _meta: n }, S.set(a, i);
      return;
    }
    let s = i;
    for (const r of e)
      s[r] || (s[r] = {}), s = s[r];
    s._meta || (s._meta = {}), Object.assign(s._meta, n);
  },
  getShadowValue: (t, e, n) => {
    const a = o().getShadowNode(t, e);
    if (!a)
      return;
    const i = {}, s = [
      [a, i, "final"]
    ];
    for (; s.length > 0; ) {
      const [r, l, f] = s.pop();
      if (r._meta?.hasOwnProperty("value")) {
        l[f] = r._meta.value;
        continue;
      }
      if (r._meta?.arrayKeys) {
        const b = n || r._meta.arrayKeys, p = [];
        l[f] = p;
        for (let c = b.length - 1; c >= 0; c--) {
          const h = b[c];
          r[h] && s.push([r[h], p, c]);
        }
        continue;
      }
      const d = {};
      l[f] = d;
      const m = Object.keys(r);
      for (const b of m)
        b !== "_meta" && s.push([r[b], d, b]);
    }
    return i.final;
  },
  updateShadowAtPath: (t, e, n) => {
    const a = S.has(`[${t}`) ? `[${t}` : t;
    let i = S.get(a);
    if (!i) return;
    let s = i;
    for (let f = 0; f < e.length - 1; f++)
      s[e[f]] || (s[e[f]] = {}), s = s[e[f]];
    const r = e.length === 0 ? s : s[e[e.length - 1]];
    function l(f, d, m) {
      if (typeof d != "object" || d === null || d instanceof Date) {
        const p = f._meta || {};
        for (const c in f)
          c !== "_meta" && delete f[c];
        f._meta = { ...p, value: d };
        return;
      }
      if (Array.isArray(d)) {
        f._meta || (f._meta = {}), f._meta.arrayKeys || (f._meta.arrayKeys = []);
        const p = f._meta.arrayKeys, c = d, h = [];
        for (let y = 0; y < c.length; y++) {
          const g = c[y];
          if (y < p.length) {
            const M = p[y];
            l(f[M], g, [
              ...m,
              M
            ]), h.push(M);
          } else {
            const M = I(), z = o().getInitialOptions(t), E = {
              stateKey: t,
              path: [...m, "0"],
              // Use '0' for array element schema lookup
              schemas: {
                zodV4: z?.validation?.zodSchemaV4,
                zodV3: z?.validation?.zodSchemaV3
              }
            };
            f[M] = _(
              t,
              g,
              E
            ), h.push(M);
          }
        }
        p.length > c.length && p.slice(c.length).forEach((g) => {
          delete f[g];
        }), f._meta.arrayKeys = h;
        return;
      }
      const b = new Set(Object.keys(d));
      f._meta?.hasOwnProperty("value") && delete f._meta.value;
      for (const p of b) {
        const c = d[p];
        if (f[p])
          l(f[p], c, [
            ...m,
            p
          ]);
        else {
          const h = o().getInitialOptions(t), y = {
            stateKey: t,
            path: [...m, p],
            schemas: {
              zodV4: h?.validation?.zodSchemaV4,
              zodV3: h?.validation?.zodSchemaV3
            }
          };
          f[p] = _(t, c, y);
        }
      }
      for (const p in f)
        p === "_meta" || !Object.prototype.hasOwnProperty.call(f, p) || b.has(p) || delete f[p];
    }
    r ? l(r, n, e) : s[e[e.length - 1]] = _(t, n), o().notifyPathSubscribers([t, ...e].join("."), {
      type: "UPDATE",
      newValue: n
    });
  },
  addItemsToArrayNode: (t, e, n) => {
    const a = S.has(`[${t}`) ? `[${t}` : t;
    let i = S.get(a);
    if (!i) {
      console.error("Root not found for state key:", t);
      return;
    }
    let s = i;
    for (const r of e)
      s[r] || (s[r] = {}), s = s[r];
    Object.assign(s, n);
  },
  insertShadowArrayElement: (t, e, n, a, i) => {
    const s = o().getShadowNode(t, e);
    if (!s?._meta?.arrayKeys)
      throw new Error(
        `Array not found at path: ${[t, ...e].join(".")}`
      );
    const r = i || `${I()}`;
    s[r] = _(t, n);
    const l = s._meta.arrayKeys, f = a !== void 0 && a >= 0 && a <= l.length ? a : l.length;
    f >= l.length ? l.push(r) : l.splice(f, 0, r);
    const d = [t, ...e].join(".");
    return o().notifyPathSubscribers(d, {
      type: "INSERT",
      path: d,
      itemKey: `${d}.${r}`,
      index: f
    }), r;
  },
  insertManyShadowArrayElements: (t, e, n, a) => {
    if (!n || n.length === 0)
      return;
    const i = o().getShadowNode(t, e);
    if (!i?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[t, ...e].join(".")}`
      );
      return;
    }
    const s = [];
    n.forEach((d) => {
      const m = `${I()}`;
      s.push(m), i[m] = _(t, d);
    });
    const r = i._meta.arrayKeys, l = a !== void 0 && a >= 0 && a <= r.length ? a : r.length;
    l >= r.length ? r.push(...s) : r.splice(l, 0, ...s);
    const f = [t, ...e].join(".");
    o().notifyPathSubscribers(f, {
      type: "INSERT_MANY",
      path: f,
      count: n.length,
      index: l
    });
  },
  removeShadowArrayElement: (t, e) => {
    if (e.length === 0) return;
    const n = e.slice(0, -1), a = e[e.length - 1];
    if (!a?.startsWith("id:")) return;
    const i = o().getShadowNode(t, n);
    if (!i?._meta?.arrayKeys) return;
    const s = i._meta.arrayKeys, r = s.indexOf(a);
    if (r === -1) return;
    r === s.length - 1 ? s.pop() : r === 0 ? s.shift() : s.splice(r, 1), delete i[a];
    const l = [t, ...n].join(".");
    o().notifyPathSubscribers(l, {
      type: "REMOVE",
      path: l,
      itemKey: `${l}.${a}`
    });
  },
  registerComponent: (t, e, n) => {
    const a = o().getShadowMetadata(t, []) || {}, i = new Map(a.components);
    i.set(e, n), o().setShadowMetadata(t, [], { components: i });
  },
  unregisterComponent: (t, e) => {
    const n = o().getShadowMetadata(t, []);
    if (!n?.components) return;
    n.components.get(e)?.paths.forEach((s) => {
      const r = s === t ? [] : s.slice(t.length + 1).split("."), l = o().getShadowMetadata(t, r);
      l?.pathComponents && (l.pathComponents.delete(e), l.pathComponents.size === 0 && delete l.pathComponents);
    });
    const i = new Map(n.components);
    i.delete(e) && o().setShadowMetadata(t, [], { components: i });
  },
  addPathComponent: (t, e, n) => {
    const a = o().getShadowMetadata(t, e) || {}, i = new Set(a.pathComponents);
    i.add(n), o().setShadowMetadata(t, e, {
      pathComponents: i
    });
    const s = o().getShadowMetadata(t, []);
    if (s?.components) {
      const r = s.components.get(n);
      if (r) {
        const l = [t, ...e].join("."), f = new Set(r.paths);
        f.add(l);
        const d = { ...r, paths: f }, m = new Map(s.components);
        m.set(n, d), o().setShadowMetadata(t, [], { components: m });
      }
    }
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (t, e) => {
    const n = o().pathSubscribers, a = n.get(t) || /* @__PURE__ */ new Set();
    return a.add(e), n.set(t, a), () => {
      const i = o().pathSubscribers.get(t);
      i && (i.delete(e), i.size === 0 && o().pathSubscribers.delete(t));
    };
  },
  notifyPathSubscribers: (t, e) => {
    const a = o().pathSubscribers.get(t);
    a && a.forEach((i) => i(e));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (t, e) => {
    const n = o().selectedIndicesMap.get(t);
    if (!n) return -1;
    const a = o().getShadowMetadata(
      t.split(".")[0],
      t.split(".").slice(1)
    ), i = e || a?.arrayKeys;
    return i ? i.indexOf(n) : -1;
  },
  setSelectedIndex: (t, e) => {
    u((n) => {
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
    u((e) => {
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
    u((e) => {
      const n = new Map(e.selectedIndicesMap);
      let a = !1;
      for (const i of n.keys())
        (i === t || i.startsWith(t + ".")) && (n.delete(i), a = !0);
      return a ? { selectedIndicesMap: n } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (t) => {
    !t || t.length === 0 || u((e) => {
      const n = new Map(e.stateLog), a = /* @__PURE__ */ new Map();
      for (const i of t) {
        const s = a.get(i.stateKey) || [];
        s.push(i), a.set(i.stateKey, s);
      }
      for (const [i, s] of a.entries()) {
        const r = new Map(n.get(i));
        for (const l of s)
          r.set(JSON.stringify(l.path), { ...l });
        n.set(i, r);
      }
      return { stateLog: n };
    });
  },
  getInitialOptions: (t) => o().initialStateOptions[t],
  setInitialStateOptions: (t, e) => {
    u((n) => ({
      initialStateOptions: { ...n.initialStateOptions, [t]: e }
    }));
  },
  updateInitialStateGlobal: (t, e) => {
    u((n) => ({
      initialStateGlobal: { ...n.initialStateGlobal, [t]: e }
    }));
  }
  // Removed: syncInfo is now owned by Shape Plugin
}));
function P(u) {
  const o = [], t = S.get(u) || S.get(`[${u}`);
  if (!t) return o;
  const e = (n) => {
    if (!(!n || typeof n != "object")) {
      n._meta?.clientActivityState?.elements && n._meta.clientActivityState.elements.forEach((a) => {
        a.domRef?.current && o.push(a.domRef.current);
      });
      for (const a in n)
        a !== "_meta" && e(n[a]);
    }
  };
  return e(t), o;
}
function Z(u, o) {
  const t = S.get(u) || S.get(`[${u}`);
  if (!t) return;
  const e = (n) => {
    if (!(!n || typeof n != "object")) {
      n._meta?.clientActivityState?.elements && n._meta.clientActivityState.elements.forEach((a) => {
        const i = a.domRef?.current;
        i && ("disabled" in i ? i.disabled = o : (i.style.pointerEvents = o ? "none" : "", i.setAttribute("aria-disabled", String(o))));
      });
      for (const a in n)
        a !== "_meta" && e(n[a]);
    }
  };
  e(t);
}
export {
  _ as buildShadowNode,
  I as generateId,
  P as getAllFieldElements,
  $ as getGlobalStore,
  Z as setAllFieldsDisabled,
  S as shadowStateStore,
  w as updateShadowTypeInfo
};
//# sourceMappingURL=store.js.map
