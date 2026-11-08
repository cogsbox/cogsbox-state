import { create as D } from "zustand";
function A(u, o = "zod4") {
  if (!u) return null;
  let t = u, e = !1, n = !1, a, s = !1;
  for (let f = 0; f < 20; f++) {
    const p = t?.def || t?._def;
    if (!p) break;
    const m = p.typeName || p.type || t._type;
    if (m === "ZodUnion" || m === "union")
      if (p.options && p.options.length > 0) {
        t = p.options.find((c) => {
          const y = c?.def || c?._def, h = y?.typeName || y?.type || c?._type;
          return h !== "ZodNull" && h !== "null" && h !== "ZodUndefined" && h !== "undefined";
        }) ?? p.options[0];
        continue;
      } else
        break;
    if (m === "ZodOptional" || m === "optional")
      n = !0;
    else if (m === "ZodNullable" || m === "nullable")
      e = !0;
    else if (m === "ZodDefault" || m === "default")
      s = !0, a = typeof p.defaultValue == "function" ? p.defaultValue() : p.defaultValue;
    else if (m !== "ZodEffects" && m !== "effects")
      break;
    const b = p.innerType || p.schema || t._inner;
    if (!b || b === t)
      break;
    t = b;
  }
  const i = t, r = i?.def || i?._def, l = r?.typeName || r?.type || i?._type;
  return l === "ZodNumber" || l === "number" ? {
    type: "number",
    schema: u,
    source: o,
    default: s ? a : 0,
    nullable: e,
    optional: n
  } : l === "ZodString" || l === "string" ? {
    type: "string",
    schema: u,
    source: o,
    default: s ? a : "",
    nullable: e,
    optional: n
  } : l === "ZodBoolean" || l === "boolean" ? {
    type: "boolean",
    schema: u,
    source: o,
    default: s ? a : !1,
    nullable: e,
    optional: n
  } : l === "ZodArray" || l === "array" ? {
    type: "array",
    schema: u,
    source: o,
    default: s ? a : [],
    nullable: e,
    optional: n
  } : l === "ZodObject" || l === "object" ? {
    type: "object",
    schema: u,
    source: o,
    default: s ? a : {},
    nullable: e,
    optional: n
  } : l === "ZodDate" || l === "date" ? {
    type: "date",
    schema: u,
    source: o,
    default: s ? a : /* @__PURE__ */ new Date(),
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
      const s = I(), i = t ? {
        ...t,
        path: [...t.path, a.toString()]
      } : void 0;
      e[s] = _(u, n, i), e._meta.arrayKeys.push(s);
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
  function n(a, s) {
    if (!a || typeof a != "object") return;
    const i = v(o, s);
    if (i) {
      const r = A(i, t);
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
    const a = n.def || n._def, s = a?.typeName || a?.type || n._type;
    if (s === "ZodObject" || s === "object") {
      const i = a?.shape ?? n.shape ?? n._shape;
      t = (typeof i == "function" ? i() : i)?.[e];
    } else if (s === "ZodArray" || s === "array")
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
    const a = e?._meta?.arrayKeys !== void 0 ? `[${t}` : t, s = S.get(a) || S.get(t) || S.get(`[${t}`);
    let i = {};
    if (s?._meta) {
      const { components: p, features: m, pathComponents: b, signals: d, validation: c } = s._meta;
      p && (i.components = p), m && (i.features = m), b && (i.pathComponents = b), d && (i.signals = d), c && (i.validation = c);
    }
    function r(p, m) {
      if (m._meta || p._meta) {
        const c = p._meta || {}, y = m._meta || {}, h = { ...c, ...y };
        c.typeInfo?.schema && !y.typeInfo?.schema && (h.typeInfo = c.typeInfo), c.validation && !y.validation && (h.validation = c.validation), c.components && (h.components = c.components), c.clientActivityState && !y.clientActivityState && (h.clientActivityState = c.clientActivityState), c.pluginMetaData && !y.pluginMetaData && (h.pluginMetaData = c.pluginMetaData), p._meta = h;
      }
      if (m._meta?.hasOwnProperty("value")) {
        for (const c in p)
          c !== "_meta" && delete p[c];
        return;
      }
      const b = new Set(
        Object.keys(m).filter((c) => c !== "_meta")
      ), d = new Set(
        Object.keys(p).filter((c) => c !== "_meta")
      );
      for (const c of d)
        b.has(c) || delete p[c];
      for (const c of b) {
        const y = m[c], h = p[c];
        h && typeof h == "object" && y && typeof y == "object" ? r(h, y) : p[c] = y;
      }
    }
    s ? (r(s, e), s._meta || (s._meta = {}), Object.assign(s._meta, i), S.set(a, s)) : (i && Object.keys(i).length > 0 && (e._meta || (e._meta = {}), Object.assign(e._meta, i)), S.set(a, e));
    const l = o().getInitialOptions(t);
    (l?.validation?.zodSchemaV4 || l?.validation?.zodSchemaV3) && (l.validation?.zodSchemaV4 ? w(t, l.validation.zodSchemaV4, "zod4") : l.validation?.zodSchemaV3 && w(t, l.validation.zodSchemaV3, "zod3")), a === t ? S.delete(`[${t}`) : S.delete(t);
  },
  initializeShadowState: (t, e) => {
    const n = S.get(t) || S.get(`[${t}`);
    let a = {};
    const s = /* @__PURE__ */ new Map();
    if (n) {
      const d = (c, y) => {
        if (!(!c || typeof c != "object")) {
          (c._meta?.clientActivityState || c._meta?.pluginMetaData) && s.set(y.join("\0"), {
            clientActivityState: c._meta.clientActivityState,
            pluginMetaData: c._meta.pluginMetaData
          });
          for (const h in c)
            h !== "_meta" && d(c[h], [...y, h]);
        }
      };
      d(n, []);
    }
    if (n?._meta) {
      const { components: d, features: c } = n._meta;
      d && (a.components = d), c && (a.features = c);
    }
    S.delete(t), S.delete(`[${t}`);
    const i = o().getInitialOptions(t), r = o().getInitialOptions("__syncSchemas"), l = {
      stateKey: t,
      path: [],
      schemas: {
        sync: r,
        zodV4: i?.validation?.zodSchemaV4,
        zodV3: i?.validation?.zodSchemaV3
      }
    }, f = _(t, e, l);
    f._meta || (f._meta = {}), Object.assign(f._meta, a);
    const p = (d, c) => {
      if (!d || typeof d != "object") return;
      const y = c.join("\0"), h = s.get(y);
      h && (d._meta || (d._meta = {}), h.clientActivityState && (d._meta.clientActivityState = h.clientActivityState), h.pluginMetaData && (d._meta.pluginMetaData = h.pluginMetaData));
      for (const g in d)
        g !== "_meta" && p(d[g], [...c, g]);
    };
    p(f, []);
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
    let s = S.get(a);
    if (!s) {
      s = { _meta: n }, S.set(a, s);
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
      const [r, l, f] = i.pop();
      if (r._meta?.hasOwnProperty("value")) {
        l[f] = r._meta.value;
        continue;
      }
      if (r._meta?.arrayKeys) {
        const b = n || r._meta.arrayKeys, d = [];
        l[f] = d;
        for (let c = b.length - 1; c >= 0; c--) {
          const y = b[c];
          r[y] && i.push([r[y], d, c]);
        }
        continue;
      }
      const p = {};
      l[f] = p;
      const m = Object.keys(r);
      for (const b of m)
        b !== "_meta" && i.push([r[b], p, b]);
    }
    return s.final;
  },
  updateShadowAtPath: (t, e, n) => {
    const a = S.has(`[${t}`) ? `[${t}` : t;
    let s = S.get(a);
    if (!s) return;
    let i = s;
    for (let f = 0; f < e.length - 1; f++)
      i[e[f]] || (i[e[f]] = {}), i = i[e[f]];
    const r = e.length === 0 ? i : i[e[e.length - 1]];
    function l(f, p, m) {
      if (typeof p != "object" || p === null || p instanceof Date) {
        const d = f._meta || {};
        for (const c in f)
          c !== "_meta" && delete f[c];
        f._meta = { ...d, value: p };
        return;
      }
      if (Array.isArray(p)) {
        f._meta || (f._meta = {}), f._meta.arrayKeys || (f._meta.arrayKeys = []);
        const d = f._meta.arrayKeys, c = p, y = [];
        for (let h = 0; h < c.length; h++) {
          const g = c[h];
          if (h < d.length) {
            const M = d[h];
            l(f[M], g, [
              ...m,
              M
            ]), y.push(M);
          } else {
            const M = I(), E = o().getInitialOptions(t), z = {
              stateKey: t,
              path: [...m, "0"],
              // Use '0' for array element schema lookup
              schemas: {
                zodV4: E?.validation?.zodSchemaV4,
                zodV3: E?.validation?.zodSchemaV3
              }
            };
            f[M] = _(
              t,
              g,
              z
            ), y.push(M);
          }
        }
        d.length > c.length && d.slice(c.length).forEach((g) => {
          delete f[g];
        }), f._meta.arrayKeys = y;
        return;
      }
      const b = new Set(Object.keys(p));
      f._meta?.hasOwnProperty("value") && delete f._meta.value;
      for (const d of b) {
        const c = p[d];
        if (f[d])
          l(f[d], c, [
            ...m,
            d
          ]);
        else {
          const y = o().getInitialOptions(t), h = {
            stateKey: t,
            path: [...m, d],
            schemas: {
              zodV4: y?.validation?.zodSchemaV4,
              zodV3: y?.validation?.zodSchemaV3
            }
          };
          f[d] = _(t, c, h);
        }
      }
      for (const d in f)
        d === "_meta" || !Object.prototype.hasOwnProperty.call(f, d) || b.has(d) || delete f[d];
    }
    r ? l(r, n, e) : i[e[e.length - 1]] = _(t, n), o().notifyPathSubscribers([t, ...e].join("."), {
      type: "UPDATE",
      newValue: n
    });
  },
  addItemsToArrayNode: (t, e, n) => {
    const a = S.has(`[${t}`) ? `[${t}` : t;
    let s = S.get(a);
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
    const r = s || `${I()}`;
    i[r] = _(t, n);
    const l = i._meta.arrayKeys, f = a !== void 0 && a >= 0 && a <= l.length ? a : l.length;
    f >= l.length ? l.push(r) : l.splice(f, 0, r);
    const p = [t, ...e].join(".");
    return o().notifyPathSubscribers(p, {
      type: "INSERT",
      path: p,
      itemKey: `${p}.${r}`,
      index: f
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
    n.forEach((p) => {
      const m = `${I()}`;
      i.push(m), s[m] = _(t, p);
    });
    const r = s._meta.arrayKeys, l = a !== void 0 && a >= 0 && a <= r.length ? a : r.length;
    l >= r.length ? r.push(...i) : r.splice(l, 0, ...i);
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
    const s = o().getShadowNode(t, n);
    if (!s?._meta?.arrayKeys) return;
    const i = s._meta.arrayKeys, r = i.indexOf(a);
    if (r === -1) return;
    r === i.length - 1 ? i.pop() : r === 0 ? i.shift() : i.splice(r, 1), delete s[a];
    const l = [t, ...n].join(".");
    o().notifyPathSubscribers(l, {
      type: "REMOVE",
      path: l,
      itemKey: `${l}.${a}`
    });
  },
  registerComponent: (t, e, n) => {
    const a = o().getShadowMetadata(t, []) || {}, s = new Map(a.components);
    s.set(e, n), o().setShadowMetadata(t, [], { components: s });
  },
  unregisterComponent: (t, e) => {
    const n = o().getShadowMetadata(t, []);
    if (!n?.components) return;
    n.components.get(e)?.paths.forEach((i) => {
      const r = i === t ? [] : i.slice(t.length + 1).split("."), l = o().getShadowMetadata(t, r);
      l?.pathComponents && (l.pathComponents.delete(e), l.pathComponents.size === 0 && delete l.pathComponents);
    });
    const s = new Map(n.components);
    s.delete(e) && o().setShadowMetadata(t, [], { components: s });
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
        const l = [t, ...e].join("."), f = new Set(r.paths);
        f.add(l);
        const p = { ...r, paths: f }, m = new Map(i.components);
        m.set(n, p), o().setShadowMetadata(t, [], { components: m });
      }
    }
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
      for (const s of n.keys())
        (s === t || s.startsWith(t + ".")) && (n.delete(s), a = !0);
      return a ? { selectedIndicesMap: n } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (t) => {
    !t || t.length === 0 || u((e) => {
      const n = new Map(e.stateLog), a = /* @__PURE__ */ new Map();
      for (const s of t) {
        const i = a.get(s.stateKey) || [];
        i.push(s), a.set(s.stateKey, i);
      }
      for (const [s, i] of a.entries()) {
        const r = new Map(n.get(s));
        for (const l of i)
          r.set(JSON.stringify(l.path), { ...l });
        n.set(s, r);
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
  _ as buildShadowNode,
  I as generateId,
  P as getAllFieldElements,
  $ as getGlobalStore,
  Z as setAllFieldsDisabled,
  S as shadowStateStore,
  w as updateShadowTypeInfo
};
//# sourceMappingURL=store.js.map
