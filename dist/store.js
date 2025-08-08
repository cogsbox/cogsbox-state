import { create as y } from "zustand";
import { ulid as m } from "ulid";
const _ = y((f, r) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (t, e) => f((s) => {
    const o = new Map(s.formRefs);
    return o.set(t, e), { formRefs: o };
  }),
  getFormRef: (t) => r().formRefs.get(t),
  removeFormRef: (t) => f((e) => {
    const s = new Map(e.formRefs);
    return s.delete(t), { formRefs: s };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (t) => {
    const e = r().formRefs, s = t + ".", o = /* @__PURE__ */ new Map();
    return e.forEach((n, a) => {
      (a.startsWith(s) || a === t) && o.set(a, n);
    }), o;
  }
})), g = /* @__PURE__ */ new Set(["_meta", "value"]);
function h(f) {
  if (f === null || typeof f != "object")
    return { value: f };
  if (Array.isArray(f)) {
    const r = { _meta: { arrayKeys: [] } }, t = [];
    return f.forEach((e) => {
      const s = `id:${m()}`;
      r[s] = h(e), t.push(s);
    }), r._meta.arrayKeys = t, r;
  }
  if (f.constructor === Object) {
    const r = { _meta: {} };
    for (const t in f)
      Object.prototype.hasOwnProperty.call(f, t) && (r[t] = h(f[t]));
    return r;
  }
  return { value: f };
}
const E = y((f, r) => ({
  shadowStateStore: /* @__PURE__ */ new Map(),
  setTransformCache: (t, e, s, o) => {
    const n = r().getShadowMetadata(t, e) || {};
    n.transformCaches || (n.transformCaches = /* @__PURE__ */ new Map()), n.transformCaches.set(s, o), r().setShadowMetadata(t, e, {
      transformCaches: n.transformCaches
    });
  },
  initializeShadowState: (t, e) => {
    f((s) => {
      const o = new Map(s.shadowStateStore), n = o.get(t) || o.get(`[${t}`);
      let a = {};
      if (n?._meta) {
        const {
          components: c,
          features: i,
          lastServerSync: S,
          stateSource: l,
          baseServerState: u
        } = n._meta;
        c && (a.components = c), i && (a.features = i), S && (a.lastServerSync = S), l && (a.stateSource = l), u && (a.baseServerState = u);
      }
      o.delete(t), o.delete(`[${t}`);
      const d = h(e);
      d._meta || (d._meta = {}), Object.assign(d._meta, a);
      const p = Array.isArray(e) ? `[${t}` : t;
      return o.set(p, d), { shadowStateStore: o };
    });
  },
  // ✅ NEW HELPER: Gets the entire node (data and metadata).
  getShadowNode: (t, e) => {
    const s = r().shadowStateStore;
    let o = s.get(t) || s.get(`[${t}`);
    if (o) {
      if (e.length === 0) return o;
      for (const n of e)
        if (typeof o != "object" || o === null || (o = o[n], o === void 0)) return;
      return o;
    }
  },
  // ✅ REFACTORED: Returns only the `_meta` part of a node.
  getShadowMetadata: (t, e) => r().getShadowNode(t, e)?._meta,
  // ✅ REFACTORED: Sets data within the `_meta` object.
  setShadowMetadata: (t, e, s) => {
    f((o) => {
      const n = new Map(o.shadowStateStore), a = n.has(`[${t}`) ? `[${t}` : t;
      let d = n.get(a);
      d || (d = {}, n.set(a, d));
      const p = { ...d };
      n.set(a, p);
      let c = p;
      for (const i of e) {
        const S = c[i] || {};
        c[i] = { ...S }, c = c[i];
      }
      return c._meta = { ...c._meta || {}, ...s }, { shadowStateStore: n };
    });
  },
  getShadowValue: (t, e, s, o) => {
    const n = r().getShadowNode(t, e);
    if (n == null) return;
    const a = Object.keys(n);
    if (Object.prototype.hasOwnProperty.call(n, "value") && a.every((i) => i === "value" || i === "_meta"))
      return n.value;
    if (n._meta && Object.prototype.hasOwnProperty.call(n._meta, "arrayKeys"))
      return (s !== void 0 && s.length > 0 ? s : n._meta.arrayKeys).map(
        (S) => r().getShadowValue(t, [...e, S])
      );
    const c = {};
    for (const i of a)
      i !== "_meta" && !i.startsWith("id:") && (c[i] = r().getShadowValue(t, [...e, i]));
    return c;
  },
  // ✅ REFACTORED: Correctly preserves `_meta` on updates.
  updateShadowAtPath: (t, e, s) => {
    f((o) => {
      const n = new Map(o.shadowStateStore), a = n.has(`[${t}`) ? `[${t}` : t;
      let d = n.get(a);
      if (!d) return o;
      const p = { ...d };
      if (n.set(a, p), e.length === 0) {
        const c = h(s);
        p._meta && (c._meta = {
          ...c._meta || {},
          ...p._meta
        }), n.set(a, c);
      } else {
        let c = p;
        const i = e.slice(0, -1);
        for (const w of i)
          c[w] = { ...c[w] }, c = c[w];
        const S = e[e.length - 1], l = c[S] || {}, u = h(s);
        l._meta && (u._meta = {
          ...u._meta || {},
          ...l._meta
        }), c[S] = u;
      }
      return r().notifyPathSubscribers([t, ...e].join("."), {
        type: "UPDATE",
        newValue: s
      }), { shadowStateStore: n };
    });
  },
  addItemsToArrayNode: (t, e, s, o) => {
    f((n) => {
      const a = new Map(n.shadowStateStore), d = a.has(`[${t}`) ? `[${t}` : t;
      let p = a.get(d);
      if (!p)
        return console.error("Root not found for state key:", t), n;
      const c = { ...p };
      a.set(d, c);
      let i = c;
      for (const S of e) {
        const l = i[S] || {};
        i[S] = { ...l }, i = i[S];
      }
      return Object.assign(i, s), i._meta = { ...i._meta || {}, arrayKeys: o }, { shadowStateStore: a };
    });
  },
  // ✅ REFACTORED: Works with `_meta.arrayKeys`.
  insertShadowArrayElement: (t, e, s, o) => {
    const n = r().getShadowNode(t, e);
    if (!n?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[t, ...e].join(".")}`
      );
      return;
    }
    const a = `id:${m()}`, d = { [a]: h(s) }, c = [...n._meta.arrayKeys], i = o !== void 0 && o >= 0 && o <= c.length ? o : c.length;
    c.splice(i, 0, a), r().addItemsToArrayNode(t, e, d, c);
    const S = [t, ...e].join(".");
    r().notifyPathSubscribers(S, {
      type: "INSERT",
      path: S,
      itemKey: `${S}.${a}`,
      index: i
    });
  },
  insertManyShadowArrayElements: (t, e, s, o) => {
    if (!s || s.length === 0)
      return;
    const n = r().getShadowNode(t, e);
    if (!n?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[t, ...e].join(".")}`
      );
      return;
    }
    const a = {}, d = [];
    s.forEach((l) => {
      const u = `id:${m()}`;
      d.push(u), a[u] = h(l);
    });
    const c = [...n._meta.arrayKeys], i = o !== void 0 && o >= 0 && o <= c.length ? o : c.length;
    c.splice(i, 0, ...d), r().addItemsToArrayNode(t, e, a, c);
    const S = [t, ...e].join(".");
    r().notifyPathSubscribers(S, {
      type: "INSERT_MANY",
      path: S,
      count: s.length,
      index: i
    });
  },
  // ✅ REFACTORED: Works with `_meta.arrayKeys`.
  removeShadowArrayElement: (t, e) => {
    if (e.length === 0) return;
    const s = e.slice(0, -1), o = e[e.length - 1];
    if (!o?.startsWith("id:")) return;
    const n = r().getShadowNode(t, s);
    if (!n?._meta?.arrayKeys) return;
    const a = n._meta.arrayKeys.filter((p) => p !== o);
    delete n[o], r().setShadowMetadata(t, s, { arrayKeys: a });
    const d = [t, ...s].join(".");
    r().notifyPathSubscribers(d, {
      type: "REMOVE",
      path: d,
      itemKey: `${d}.${o}`
    });
  },
  // The rest of the functions are updated to use the new helpers (`getShadowMetadata`, `setShadowMetadata`)
  // which abstracts away the `_meta` implementation detail.
  addPathComponent: (t, e, s) => {
    const o = r().getShadowMetadata(t, e) || {}, n = new Set(o.pathComponents);
    n.add(s), r().setShadowMetadata(t, e, {
      pathComponents: n
    });
    const a = r().getShadowMetadata(t, []);
    if (a?.components) {
      const d = a.components.get(s);
      if (d) {
        const p = [t, ...e].join("."), c = new Set(d.paths);
        c.add(p);
        const i = { ...d, paths: c }, S = new Map(a.components);
        S.set(s, i), r().setShadowMetadata(t, [], { components: S });
      }
    }
  },
  registerComponent: (t, e, s) => {
    const o = r().getShadowMetadata(t, []) || {}, n = new Map(o.components);
    n.set(e, s), r().setShadowMetadata(t, [], { components: n });
  },
  unregisterComponent: (t, e) => {
    const s = r().getShadowMetadata(t, []);
    if (!s?.components) return;
    const o = new Map(s.components);
    o.delete(e) && r().setShadowMetadata(t, [], { components: o });
  },
  // ✅ REFACTORED: `markAsDirty` now correctly writes to `_meta.isDirty`.
  markAsDirty: (t, e, s = { bubble: !0 }) => {
    const o = (n) => r().getShadowNode(t, n)?._meta?.isDirty ? !0 : (r().setShadowMetadata(t, n, { isDirty: !0 }), !1);
    if (o(e), s.bubble) {
      let n = [...e];
      for (; n.length > 0 && (n.pop(), !o(n)); )
        ;
    }
  },
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (t, e) => {
    f((s) => ({
      serverStateUpdates: new Map(s.serverStateUpdates).set(
        t,
        e
      )
    })), r().notifyPathSubscribers(t, {
      type: "SERVER_STATE_UPDATE",
      serverState: e
    });
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (t, e) => {
    const s = r().pathSubscribers, o = s.get(t) || /* @__PURE__ */ new Set();
    return o.add(e), s.set(t, o), () => {
      const n = r().pathSubscribers.get(t);
      n && (n.delete(e), n.size === 0 && r().pathSubscribers.delete(t));
    };
  },
  notifyPathSubscribers: (t, e) => {
    const o = r().pathSubscribers.get(t);
    o && o.forEach((n) => n(e));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (t, e) => {
    const s = r().selectedIndicesMap.get(t);
    if (!s) return -1;
    const o = r().getShadowMetadata(
      t.split(".")[0],
      t.split(".").slice(1)
    ), n = e || o?.arrayKeys;
    return n ? n.indexOf(s) : -1;
  },
  setSelectedIndex: (t, e) => {
    f((s) => {
      const o = new Map(s.selectedIndicesMap), n = o.get(t);
      return n && r().notifyPathSubscribers(n, { type: "THIS_UNSELECTED" }), e === void 0 ? o.delete(t) : (o.set(t, e), r().notifyPathSubscribers(e, { type: "THIS_SELECTED" })), r().notifyPathSubscribers(t, { type: "GET_SELECTED" }), { selectedIndicesMap: o };
    });
  },
  clearSelectedIndex: ({ arrayKey: t }) => {
    f((e) => {
      const s = new Map(e.selectedIndicesMap), o = s.get(t);
      return o && r().notifyPathSubscribers(o, { type: "CLEAR_SELECTION" }), s.delete(t), r().notifyPathSubscribers(t, { type: "CLEAR_SELECTION" }), { selectedIndicesMap: s };
    });
  },
  clearSelectedIndexesForState: (t) => {
    f((e) => {
      const s = new Map(e.selectedIndicesMap);
      let o = !1;
      for (const n of s.keys())
        (n === t || n.startsWith(t + ".")) && (s.delete(n), o = !0);
      return o ? { selectedIndicesMap: s } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (t) => {
    !t || t.length === 0 || f((e) => {
      const s = new Map(e.stateLog), o = /* @__PURE__ */ new Map();
      for (const n of t) {
        const a = o.get(n.stateKey) || [];
        a.push(n), o.set(n.stateKey, a);
      }
      for (const [n, a] of o.entries()) {
        const d = new Map(s.get(n));
        for (const p of a)
          d.set(JSON.stringify(p.path), { ...p });
        s.set(n, d);
      }
      return { stateLog: s };
    });
  },
  getInitialOptions: (t) => r().initialStateOptions[t],
  setInitialStateOptions: (t, e) => {
    f((s) => ({
      initialStateOptions: { ...s.initialStateOptions, [t]: e }
    }));
  },
  updateInitialStateGlobal: (t, e) => {
    f((s) => ({
      initialStateGlobal: { ...s.initialStateGlobal, [t]: e }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (t, e) => f((s) => {
    const o = new Map(s.syncInfoStore);
    return o.set(t, e), { syncInfoStore: o };
  }),
  getSyncInfo: (t) => r().syncInfoStore.get(t) || null
}));
export {
  g as METADATA_KEYS,
  h as buildShadowNode,
  _ as formRefStore,
  E as getGlobalStore
};
//# sourceMappingURL=store.js.map
