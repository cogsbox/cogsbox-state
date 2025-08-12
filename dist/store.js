import { create as w } from "zustand";
import { ulid as y } from "ulid";
const _ = w((l, a) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, t) => l((o) => {
    const n = new Map(o.formRefs);
    return n.set(e, t), { formRefs: n };
  }),
  getFormRef: (e) => a().formRefs.get(e),
  removeFormRef: (e) => l((t) => {
    const o = new Map(t.formRefs);
    return o.delete(e), { formRefs: o };
  }),
  getFormRefsByStateKey: (e) => {
    const t = a().formRefs, o = e + ".", n = /* @__PURE__ */ new Map();
    return t.forEach((s, r) => {
      (r.startsWith(o) || r === e) && n.set(r, s);
    }), n;
  }
}));
function m(l) {
  if (l === null || typeof l != "object")
    return { value: l };
  if (Array.isArray(l)) {
    const a = { _meta: { arrayKeys: [] } }, e = [];
    return l.forEach((t) => {
      const o = `id:${y()}`;
      a[o] = m(t), e.push(o);
    }), a._meta.arrayKeys = e, a;
  }
  if (l.constructor === Object) {
    const a = { _meta: {} };
    for (const e in l)
      Object.prototype.hasOwnProperty.call(l, e) && (a[e] = m(l[e]));
    return a;
  }
  return { value: l };
}
const p = /* @__PURE__ */ new Map(), E = w((l, a) => ({
  // Remove shadowStateStore from Zustand state
  setTransformCache: (e, t, o, n) => {
    const s = a().getShadowMetadata(e, t) || {};
    s.transformCaches || (s.transformCaches = /* @__PURE__ */ new Map()), s.transformCaches.set(o, n), a().setShadowMetadata(e, t, {
      transformCaches: s.transformCaches
    });
  },
  initializeShadowState: (e, t) => {
    const o = p.get(e) || p.get(`[${e}`);
    let n = {};
    if (o?._meta) {
      const {
        components: i,
        features: f,
        lastServerSync: c,
        stateSource: d,
        baseServerState: u
      } = o._meta;
      i && (n.components = i), f && (n.features = f), c && (n.lastServerSync = c), d && (n.stateSource = d), u && (n.baseServerState = u);
    }
    p.delete(e), p.delete(`[${e}`);
    const s = m(t);
    s._meta || (s._meta = {}), Object.assign(s._meta, n);
    const r = Array.isArray(t) ? `[${e}` : e;
    p.set(r, s);
  },
  getShadowNode: (e, t) => {
    let o = p.get(e) || p.get(`[${e}`);
    if (o) {
      if (t.length === 0) return o;
      for (const n of t)
        if (typeof o != "object" || o === null || (o = o[n], o === void 0)) return;
      return o;
    }
  },
  getShadowMetadata: (e, t) => a().getShadowNode(e, t)?._meta,
  setShadowMetadata: (e, t, o) => {
    const n = p.has(`[${e}`) ? `[${e}` : e;
    let s = p.get(n);
    if (!s) {
      s = { _meta: o }, p.set(n, s);
      return;
    }
    let r = s;
    for (const i of t)
      r[i] || (r[i] = {}), r = r[i];
    r._meta || (r._meta = {}), Object.assign(r._meta, o);
  },
  getShadowValue: (e, t, o, n) => {
    const s = a().getShadowNode(e, t);
    if (s == null) return;
    const r = Object.keys(s);
    if (Object.prototype.hasOwnProperty.call(s, "value") && r.every((d) => d === "value" || d === "_meta"))
      return s.value;
    if (s._meta && Object.prototype.hasOwnProperty.call(s._meta, "arrayKeys"))
      return (o !== void 0 && o.length > 0 ? o : s._meta.arrayKeys).map(
        (u) => a().getShadowValue(e, [...t, u])
      );
    const c = {};
    for (const d of r)
      d !== "_meta" && !d.startsWith("id:") && (c[d] = a().getShadowValue(e, [...t, d]));
    return c;
  },
  updateShadowAtPath: (e, t, o) => {
    const n = p.has(`[${e}`) ? `[${e}` : e;
    let s = p.get(n);
    if (!s) return;
    let r = s;
    for (let c = 0; c < t.length - 1; c++)
      r[t[c]] || (r[t[c]] = {}), r = r[t[c]];
    const i = t.length === 0 ? r : r[t[t.length - 1]];
    if (!i) {
      r[t[t.length - 1]] = m(o), a().notifyPathSubscribers([e, ...t].join("."), {
        type: "UPDATE",
        newValue: o
      });
      return;
    }
    function f(c, d) {
      if (typeof d != "object" || d === null || Array.isArray(d)) {
        const S = c._meta;
        for (const b in c)
          b !== "_meta" && delete c[b];
        const h = m(d);
        Object.assign(c, h), S && (c._meta = { ...S, ...c._meta || {} });
        return;
      }
      const u = new Set(Object.keys(d));
      for (const S of u) {
        const h = d[S];
        c[S] ? f(c[S], h) : c[S] = m(h);
      }
      for (const S in c)
        S === "_meta" || !Object.prototype.hasOwnProperty.call(c, S) || u.has(S) || delete c[S];
    }
    f(i, o), a().notifyPathSubscribers([e, ...t].join("."), {
      type: "UPDATE",
      newValue: o
    });
  },
  addItemsToArrayNode: (e, t, o, n) => {
    const s = p.has(`[${e}`) ? `[${e}` : e;
    let r = p.get(s);
    if (!r) {
      console.error("Root not found for state key:", e);
      return;
    }
    let i = r;
    for (const f of t)
      i[f] || (i[f] = {}), i = i[f];
    Object.assign(i, o), i._meta || (i._meta = {}), i._meta.arrayKeys = n;
  },
  insertShadowArrayElement: (e, t, o, n) => {
    const s = a().getShadowNode(e, t);
    if (!s?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[e, ...t].join(".")}`
      );
      return;
    }
    const r = `id:${y()}`, i = { [r]: m(o) }, f = s._meta.arrayKeys, c = n !== void 0 && n >= 0 && n <= f.length ? n : f.length;
    c >= f.length ? f.push(r) : f.splice(c, 0, r), a().addItemsToArrayNode(e, t, i, f);
    const d = [e, ...t].join(".");
    a().notifyPathSubscribers(d, {
      type: "INSERT",
      path: d,
      itemKey: `${d}.${r}`,
      index: c
    });
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
    const r = {}, i = [];
    o.forEach((u) => {
      const S = `id:${y()}`;
      i.push(S), r[S] = m(u);
    });
    const f = s._meta.arrayKeys, c = n !== void 0 && n >= 0 && n <= f.length ? n : f.length;
    c >= f.length ? f.push(...i) : f.splice(c, 0, ...i), a().addItemsToArrayNode(e, t, r, f);
    const d = [e, ...t].join(".");
    a().notifyPathSubscribers(d, {
      type: "INSERT_MANY",
      path: d,
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
    const f = [e, ...o].join(".");
    a().notifyPathSubscribers(f, {
      type: "REMOVE",
      path: f,
      itemKey: `${f}.${n}`
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
        const f = [e, ...t].join("."), c = new Set(i.paths);
        c.add(f);
        const d = { ...i, paths: c }, u = new Map(r.components);
        u.set(o, d), a().setShadowMetadata(e, [], { components: u });
      }
    }
  },
  markAsDirty: (e, t, o = { bubble: !0 }) => {
    const n = (s) => a().getShadowNode(e, s)?._meta?.isDirty ? !0 : (a().setShadowMetadata(e, s, { isDirty: !0 }), !1);
    if (n(t), o.bubble) {
      let s = [...t];
      for (; s.length > 0 && (s.pop(), !n(s)); )
        ;
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
        for (const f of r)
          i.set(JSON.stringify(f.path), { ...f });
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
export {
  m as buildShadowNode,
  _ as formRefStore,
  E as getGlobalStore
};
//# sourceMappingURL=store.js.map
