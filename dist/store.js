import { create as z } from "zustand";
function A(f, o = "zod4") {
  if (!f) return null;
  let t = f, e = !1, n = !1, a, i = !1;
  for (let l = 0; l < 20; l++) {
    const d = t?.def || t?._def;
    if (!d) break;
    const m = d.typeName || d.type || t._type;
    if (m === "ZodUnion" || m === "union")
      if (d.options && d.options.length > 0) {
        t = d.options.find((c) => {
          const y = c?.def || c?._def, h = y?.typeName || y?.type || c?._type;
          return h !== "ZodNull" && h !== "null" && h !== "ZodUndefined" && h !== "undefined";
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
  const s = t, r = s?.def || s?._def, u = r?.typeName || r?.type || s?._type;
  return u === "ZodNumber" || u === "number" ? {
    type: "number",
    schema: f,
    source: o,
    default: i ? a : 0,
    nullable: e,
    optional: n
  } : u === "ZodString" || u === "string" ? {
    type: "string",
    schema: f,
    source: o,
    default: i ? a : "",
    nullable: e,
    optional: n
  } : u === "ZodBoolean" || u === "boolean" ? {
    type: "boolean",
    schema: f,
    source: o,
    default: i ? a : !1,
    nullable: e,
    optional: n
  } : u === "ZodArray" || u === "array" ? {
    type: "array",
    schema: f,
    source: o,
    default: i ? a : [],
    nullable: e,
    optional: n
  } : u === "ZodObject" || u === "object" ? {
    type: "object",
    schema: f,
    source: o,
    default: i ? a : {},
    nullable: e,
    optional: n
  } : u === "ZodDate" || u === "date" ? {
    type: "date",
    schema: f,
    source: o,
    default: i ? a : /* @__PURE__ */ new Date(),
    nullable: e,
    optional: n
  } : null;
}
function j(f) {
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
    return e._meta.typeInfo = O(o, t), e;
  }
  if (Array.isArray(o)) {
    const e = { _meta: { arrayKeys: [] } };
    return e._meta.typeInfo = O(o, t), o.forEach((n, a) => {
      const i = I(), s = t ? {
        ...t,
        path: [...t.path, a.toString()]
      } : void 0;
      e[i] = g(f, n, s), e._meta.arrayKeys.push(i);
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
        e[n] = g(f, o[n], a);
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
function O(f, o) {
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
    if (!t && o.schemas.sync?.[o.stateKey] && (t = j(f), t.source = "sync"), t) return t;
  }
  return j(f);
}
function w(f, o, t) {
  const e = S.get(f) || S.get(`[${f}`);
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
function N(f) {
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
function I(f) {
  return `id:local_${V}_${(K++).toString(36)}`;
}
const C = z((f, o) => ({
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
        validation: c
      } = i._meta;
      d && (s.components = d), m && (s.features = m), b && (s.pathComponents = b), p && (s.signals = p), c && (s.validation = c);
    }
    function r(d, m) {
      if (m._meta || d._meta) {
        const c = d._meta || {}, y = m._meta || {}, h = { ...c, ...y };
        c.typeInfo?.schema && !y.typeInfo?.schema && (h.typeInfo = c.typeInfo), c.validation && !y.validation && (h.validation = c.validation), c.components && (h.components = c.components), c.clientActivityState && !y.clientActivityState && (h.clientActivityState = c.clientActivityState), c.pluginMetaData && !y.pluginMetaData && (h.pluginMetaData = c.pluginMetaData), d._meta = h;
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
        const y = m[c], h = d[c];
        h && typeof h == "object" && y && typeof y == "object" ? r(h, y) : d[c] = y;
      }
    }
    i ? (r(i, e), i._meta || (i._meta = {}), Object.assign(i._meta, s), S.set(a, i)) : (s && Object.keys(s).length > 0 && (e._meta || (e._meta = {}), Object.assign(e._meta, s)), S.set(a, e));
    const u = o().getInitialOptions(t);
    (u?.validation?.zodSchemaV4 || u?.validation?.zodSchemaV3) && (u.validation?.zodSchemaV4 ? w(t, u.validation.zodSchemaV4, "zod4") : u.validation?.zodSchemaV3 && w(t, u.validation.zodSchemaV3, "zod3")), a === t ? S.delete(`[${t}`) : S.delete(t);
  },
  initializeShadowState: (t, e) => {
    const n = S.get(t) || S.get(`[${t}`);
    let a = {};
    const i = /* @__PURE__ */ new Map();
    if (n) {
      const p = (c, y) => {
        if (!(!c || typeof c != "object")) {
          (c._meta?.clientActivityState || c._meta?.pluginMetaData) && i.set(y.join("\0"), {
            clientActivityState: c._meta.clientActivityState,
            pluginMetaData: c._meta.pluginMetaData
          });
          for (const h in c)
            h !== "_meta" && p(c[h], [...y, h]);
        }
      };
      p(n, []);
    }
    if (n?._meta) {
      const {
        components: p,
        features: c
      } = n._meta;
      p && (a.components = p), c && (a.features = c);
    }
    S.delete(t), S.delete(`[${t}`);
    const s = o().getInitialOptions(t), r = o().getInitialOptions("__syncSchemas"), u = {
      stateKey: t,
      path: [],
      schemas: {
        sync: r,
        zodV4: s?.validation?.zodSchemaV4,
        zodV3: s?.validation?.zodSchemaV3
      }
    }, l = g(t, e, u);
    l._meta || (l._meta = {}), Object.assign(l._meta, a);
    const d = (p, c) => {
      if (!p || typeof p != "object") return;
      const y = c.join("\0"), h = i.get(y);
      h && (p._meta || (p._meta = {}), h.clientActivityState && (p._meta.clientActivityState = h.clientActivityState), h.pluginMetaData && (p._meta.pluginMetaData = h.pluginMetaData));
      for (const _ in p)
        _ !== "_meta" && d(p[_], [...c, _]);
    };
    d(l, []);
    const m = Array.isArray(e) ? `[${t}` : t;
    S.set(m, l);
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
      const [r, u, l] = s.pop();
      if (r._meta?.hasOwnProperty("value")) {
        u[l] = r._meta.value;
        continue;
      }
      if (r._meta?.arrayKeys) {
        const b = n || r._meta.arrayKeys, p = [];
        u[l] = p;
        for (let c = b.length - 1; c >= 0; c--) {
          const y = b[c];
          r[y] && s.push([r[y], p, c]);
        }
        continue;
      }
      const d = {};
      u[l] = d;
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
    for (let l = 0; l < e.length - 1; l++)
      s[e[l]] || (s[e[l]] = {}), s = s[e[l]];
    const r = e.length === 0 ? s : s[e[e.length - 1]];
    function u(l, d, m) {
      if (typeof d != "object" || d === null || d instanceof Date) {
        const p = l._meta || {};
        for (const c in l)
          c !== "_meta" && delete l[c];
        l._meta = { ...p, value: d };
        return;
      }
      if (Array.isArray(d)) {
        l._meta || (l._meta = {}), l._meta.arrayKeys || (l._meta.arrayKeys = []);
        const p = l._meta.arrayKeys, c = d, y = [];
        for (let h = 0; h < c.length; h++) {
          const _ = c[h];
          if (h < p.length) {
            const M = p[h];
            u(l[M], _, [
              ...m,
              M
            ]), y.push(M);
          } else {
            const M = I(), E = o().getInitialOptions(t), D = {
              stateKey: t,
              path: [...m, "0"],
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
            ), y.push(M);
          }
        }
        p.length > c.length && p.slice(c.length).forEach((_) => {
          delete l[_];
        }), l._meta.arrayKeys = y;
        return;
      }
      const b = new Set(Object.keys(d));
      l._meta?.hasOwnProperty("value") && delete l._meta.value;
      for (const p of b) {
        const c = d[p];
        if (l[p])
          u(l[p], c, [
            ...m,
            p
          ]);
        else {
          const y = o().getInitialOptions(t), h = {
            stateKey: t,
            path: [...m, p],
            schemas: {
              zodV4: y?.validation?.zodSchemaV4,
              zodV3: y?.validation?.zodSchemaV3
            }
          };
          l[p] = g(t, c, h);
        }
      }
      for (const p in l)
        p === "_meta" || !Object.prototype.hasOwnProperty.call(l, p) || b.has(p) || delete l[p];
    }
    r ? u(r, n, e) : s[e[e.length - 1]] = g(t, n), o().notifyPathSubscribers([t, ...e].join("."), {
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
    s[r] = g(t, n);
    const u = s._meta.arrayKeys, l = a !== void 0 && a >= 0 && a <= u.length ? a : u.length;
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
      s.push(m), i[m] = g(t, d);
    });
    const r = i._meta.arrayKeys, u = a !== void 0 && a >= 0 && a <= r.length ? a : r.length;
    u >= r.length ? r.push(...s) : r.splice(u, 0, ...s);
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
    const i = o().getShadowNode(t, n);
    if (!i?._meta?.arrayKeys) return;
    const s = i._meta.arrayKeys, r = s.indexOf(a);
    if (r === -1) return;
    r === s.length - 1 ? s.pop() : r === 0 ? s.shift() : s.splice(r, 1), delete i[a];
    const u = [t, ...n].join(".");
    o().notifyPathSubscribers(u, {
      type: "REMOVE",
      path: u,
      itemKey: `${u}.${a}`
    });
  },
  registerComponent: (t, e, n) => {
    const a = o().getShadowMetadata(t, []) || {}, i = new Map(a.components);
    i.set(e, n), o().setShadowMetadata(t, [], { components: i });
  },
  unregisterComponent: (t, e) => {
    const n = o().getShadowMetadata(t, []);
    if (!n?.components) return;
    const a = new Map(n.components);
    a.delete(e) && o().setShadowMetadata(t, [], { components: a });
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
        const u = [t, ...e].join("."), l = new Set(r.paths);
        l.add(u);
        const d = { ...r, paths: l }, m = new Map(s.components);
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
      for (const i of n.keys())
        (i === t || i.startsWith(t + ".")) && (n.delete(i), a = !0);
      return a ? { selectedIndicesMap: n } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (t) => {
    !t || t.length === 0 || f((e) => {
      const n = new Map(e.stateLog), a = /* @__PURE__ */ new Map();
      for (const i of t) {
        const s = a.get(i.stateKey) || [];
        s.push(i), a.set(i.stateKey, s);
      }
      for (const [i, s] of a.entries()) {
        const r = new Map(n.get(i));
        for (const u of s)
          r.set(JSON.stringify(u.path), { ...u });
        n.set(i, r);
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
  }
  // Removed: syncInfo is now owned by Shape Plugin
}));
function P(f) {
  const o = [], t = S.get(f) || S.get(`[${f}`);
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
function Z(f, o) {
  const t = S.get(f) || S.get(`[${f}`);
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
  g as buildShadowNode,
  I as generateId,
  P as getAllFieldElements,
  C as getGlobalStore,
  Z as setAllFieldsDisabled,
  S as shadowStateStore,
  w as updateShadowTypeInfo
};
//# sourceMappingURL=store.js.map
