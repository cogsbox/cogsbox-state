import { create as h } from "zustand";
import { ulid as y } from "ulid";
const _ = h((d, r) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, s) => d((n) => {
    const o = new Map(n.formRefs);
    return o.set(e, s), { formRefs: o };
  }),
  getFormRef: (e) => r().formRefs.get(e),
  removeFormRef: (e) => d((s) => {
    const n = new Map(s.formRefs);
    return n.delete(e), { formRefs: n };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (e) => {
    const s = r().formRefs, n = e + ".", o = /* @__PURE__ */ new Map();
    return s.forEach((t, a) => {
      (a.startsWith(n) || a === e) && o.set(a, t);
    }), o;
  }
})), g = /* @__PURE__ */ new Set(["_meta", "value"]);
function m(d) {
  if (d === null || typeof d != "object")
    return { value: d };
  if (Array.isArray(d)) {
    const r = { _meta: { arrayKeys: [] } }, e = [];
    return d.forEach((s) => {
      const n = `id:${y()}`;
      r[n] = m(s), e.push(n);
    }), r._meta.arrayKeys = e, r;
  }
  if (d.constructor === Object) {
    const r = { _meta: {} };
    for (const e in d)
      Object.prototype.hasOwnProperty.call(d, e) && (r[e] = m(d[e]));
    return r;
  }
  return { value: d };
}
const I = h((d, r) => ({
  shadowStateStore: /* @__PURE__ */ new Map(),
  setTransformCache: (e, s, n, o) => {
    const t = r().getShadowMetadata(e, s) || {};
    t.transformCaches || (t.transformCaches = /* @__PURE__ */ new Map()), t.transformCaches.set(n, o), r().setShadowMetadata(e, s, {
      transformCaches: t.transformCaches
    });
  },
  initializeShadowState: (e, s) => {
    d((n) => {
      const o = new Map(n.shadowStateStore), t = o.get(e) || o.get(`[${e}`);
      let a = {};
      if (t?._meta) {
        const {
          components: i,
          features: f,
          lastServerSync: S,
          stateSource: u,
          baseServerState: l
        } = t._meta;
        i && (a.components = i), f && (a.features = f), S && (a.lastServerSync = S), u && (a.stateSource = u), l && (a.baseServerState = l);
      }
      o.delete(e), o.delete(`[${e}`);
      const c = m(s);
      c._meta || (c._meta = {}), Object.assign(c._meta, a);
      const p = Array.isArray(s) ? `[${e}` : e;
      return o.set(p, c), { shadowStateStore: o };
    });
  },
  // ✅ NEW HELPER: Gets the entire node (data and metadata).
  getShadowNode: (e, s) => {
    const n = r().shadowStateStore;
    let o = n.get(e) || n.get(`[${e}`);
    if (o) {
      if (s.length === 0) return o;
      for (const t of s)
        if (typeof o != "object" || o === null || (o = o[t], o === void 0)) return;
      return o;
    }
  },
  // ✅ REFACTORED: Returns only the `_meta` part of a node.
  getShadowMetadata: (e, s) => r().getShadowNode(e, s)?._meta,
  // ✅ REFACTORED: Sets data within the `_meta` object.
  setShadowMetadata: (e, s, n) => {
    d((o) => {
      const t = new Map(o.shadowStateStore), a = t.has(`[${e}`) ? `[${e}` : e;
      let c = t.get(a);
      c || (c = {}, t.set(a, c));
      const p = { ...c };
      t.set(a, p);
      let i = p;
      for (const f of s) {
        const S = i[f] || {};
        i[f] = { ...S }, i = i[f];
      }
      return i._meta = { ...i._meta || {}, ...n }, { shadowStateStore: t };
    });
  },
  getShadowValue: (e, s, n, o) => {
    const t = r().getShadowNode(e, s);
    if (t == null) return;
    const a = Object.keys(t);
    if (Object.prototype.hasOwnProperty.call(t, "value") && a.every((f) => f === "value" || f === "_meta"))
      return t.value;
    if (t._meta && Object.prototype.hasOwnProperty.call(t._meta, "arrayKeys"))
      return (n !== void 0 && n.length > 0 ? n : t._meta.arrayKeys).map(
        (S) => r().getShadowValue(e, [...s, S])
      );
    const i = {};
    for (const f of a)
      f !== "_meta" && !f.startsWith("id:") && (i[f] = r().getShadowValue(e, [...s, f]));
    return i;
  },
  // ✅ REFACTORED: Correctly preserves `_meta` on updates.
  updateShadowAtPath: (e, s, n) => {
    d((o) => {
      const t = new Map(o.shadowStateStore), a = t.has(`[${e}`) ? `[${e}` : e;
      let c = t.get(a);
      if (!c) return o;
      const p = { ...c };
      if (t.set(a, p), s.length === 0) {
        const i = m(n);
        p._meta && (i._meta = {
          ...i._meta || {},
          ...p._meta
        }), t.set(a, i);
      } else {
        let i = p;
        const f = s.slice(0, -1);
        for (const w of f)
          i[w] = { ...i[w] }, i = i[w];
        const S = s[s.length - 1], u = i[S] || {}, l = m(n);
        u._meta && (l._meta = {
          ...l._meta || {},
          ...u._meta
        }), i[S] = l;
      }
      return r().notifyPathSubscribers([e, ...s].join("."), {
        type: "UPDATE",
        newValue: n
      }), { shadowStateStore: t };
    });
  },
  // ✅ REFACTORED: Works with `_meta.arrayKeys`.
  insertShadowArrayElement: (e, s, n, o) => {
    const t = r().getShadowNode(e, s);
    if (!t?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[e, ...s].join(".")}`
      );
      return;
    }
    const a = `id:${y()}`, c = m(n), i = [...t._meta.arrayKeys];
    o !== void 0 && o >= 0 && o <= i.length ? i.splice(o, 0, a) : i.push(a), t._meta.transformCaches && t._meta.transformCaches.forEach((S) => {
      S.validIds && Array.isArray(S.validIds) && S.transforms.every(
        (l) => l.type === "filter" ? l.fn(n) : !0
      ) && (S.validIds = [...S.validIds], o !== void 0 ? S.validIds.splice(o, 0, a) : S.validIds.push(a));
    }), t[a] = c, t._meta.arrayKeys = i, r().setShadowMetadata(e, s, { arrayKeys: i });
    const f = [e, ...s].join(".");
    r().notifyPathSubscribers(f, {
      type: "INSERT",
      path: f,
      itemKey: `${f}.${a}`,
      index: o ?? i.length - 1
    });
  },
  // ✅ REFACTORED: Works with `_meta.arrayKeys`.
  removeShadowArrayElement: (e, s) => {
    if (s.length === 0) return;
    const n = s.slice(0, -1), o = s[s.length - 1];
    if (!o?.startsWith("id:")) return;
    const t = r().getShadowNode(e, n);
    if (!t?._meta?.arrayKeys) return;
    const a = t._meta.arrayKeys.filter((p) => p !== o);
    delete t[o], r().setShadowMetadata(e, n, { arrayKeys: a });
    const c = [e, ...n].join(".");
    r().notifyPathSubscribers(c, {
      type: "REMOVE",
      path: c,
      itemKey: `${c}.${o}`
    });
  },
  // The rest of the functions are updated to use the new helpers (`getShadowMetadata`, `setShadowMetadata`)
  // which abstracts away the `_meta` implementation detail.
  addPathComponent: (e, s, n) => {
    const o = r().getShadowMetadata(e, s) || {}, t = new Set(o.pathComponents);
    t.add(n), r().setShadowMetadata(e, s, {
      pathComponents: t
    });
    const a = r().getShadowMetadata(e, []);
    if (a?.components) {
      const c = a.components.get(n);
      if (c) {
        const p = [e, ...s].join("."), i = new Set(c.paths);
        i.add(p);
        const f = { ...c, paths: i }, S = new Map(a.components);
        S.set(n, f), r().setShadowMetadata(e, [], { components: S });
      }
    }
  },
  registerComponent: (e, s, n) => {
    const o = r().getShadowMetadata(e, []) || {}, t = new Map(o.components);
    t.set(s, n), r().setShadowMetadata(e, [], { components: t });
  },
  unregisterComponent: (e, s) => {
    const n = r().getShadowMetadata(e, []);
    if (!n?.components) return;
    const o = new Map(n.components);
    o.delete(s) && r().setShadowMetadata(e, [], { components: o });
  },
  // ✅ REFACTORED: `markAsDirty` now correctly writes to `_meta.isDirty`.
  markAsDirty: (e, s, n = { bubble: !0 }) => {
    const o = (t) => r().getShadowNode(e, t)?._meta?.isDirty ? !0 : (r().setShadowMetadata(e, t, { isDirty: !0 }), !1);
    if (o(s), n.bubble) {
      let t = [...s];
      for (; t.length > 0 && (t.pop(), !o(t)); )
        ;
    }
  },
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (e, s) => {
    d((n) => ({
      serverStateUpdates: new Map(n.serverStateUpdates).set(
        e,
        s
      )
    })), r().notifyPathSubscribers(e, {
      type: "SERVER_STATE_UPDATE",
      serverState: s
    });
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (e, s) => {
    const n = r().pathSubscribers, o = n.get(e) || /* @__PURE__ */ new Set();
    return o.add(s), n.set(e, o), () => {
      const t = r().pathSubscribers.get(e);
      t && (t.delete(s), t.size === 0 && r().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, s) => {
    const o = r().pathSubscribers.get(e);
    o && o.forEach((t) => t(s));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, s) => {
    const n = r().selectedIndicesMap.get(e);
    if (!n) return -1;
    const o = r().getShadowMetadata(
      e.split(".")[0],
      e.split(".").slice(1)
    ), t = s || o?.arrayKeys;
    return t ? t.indexOf(n) : -1;
  },
  setSelectedIndex: (e, s) => {
    d((n) => {
      const o = new Map(n.selectedIndicesMap), t = o.get(e);
      return t && r().notifyPathSubscribers(t, { type: "THIS_UNSELECTED" }), s === void 0 ? o.delete(e) : (o.set(e, s), r().notifyPathSubscribers(s, { type: "THIS_SELECTED" })), r().notifyPathSubscribers(e, { type: "GET_SELECTED" }), { selectedIndicesMap: o };
    });
  },
  clearSelectedIndex: ({ arrayKey: e }) => {
    d((s) => {
      const n = new Map(s.selectedIndicesMap), o = n.get(e);
      return o && r().notifyPathSubscribers(o, { type: "CLEAR_SELECTION" }), n.delete(e), r().notifyPathSubscribers(e, { type: "CLEAR_SELECTION" }), { selectedIndicesMap: n };
    });
  },
  clearSelectedIndexesForState: (e) => {
    d((s) => {
      const n = new Map(s.selectedIndicesMap);
      let o = !1;
      for (const t of n.keys())
        (t === e || t.startsWith(e + ".")) && (n.delete(t), o = !0);
      return o ? { selectedIndicesMap: n } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (e) => {
    !e || e.length === 0 || d((s) => {
      const n = new Map(s.stateLog), o = /* @__PURE__ */ new Map();
      for (const t of e) {
        const a = o.get(t.stateKey) || [];
        a.push(t), o.set(t.stateKey, a);
      }
      for (const [t, a] of o.entries()) {
        const c = new Map(n.get(t));
        for (const p of a)
          c.set(JSON.stringify(p.path), { ...p });
        n.set(t, c);
      }
      return { stateLog: n };
    });
  },
  getInitialOptions: (e) => r().initialStateOptions[e],
  setInitialStateOptions: (e, s) => {
    d((n) => ({
      initialStateOptions: { ...n.initialStateOptions, [e]: s }
    }));
  },
  updateInitialStateGlobal: (e, s) => {
    d((n) => ({
      initialStateGlobal: { ...n.initialStateGlobal, [e]: s }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, s) => d((n) => {
    const o = new Map(n.syncInfoStore);
    return o.set(e, s), { syncInfoStore: o };
  }),
  getSyncInfo: (e) => r().syncInfoStore.get(e) || null
}));
export {
  g as METADATA_KEYS,
  m as buildShadowNode,
  _ as formRefStore,
  I as getGlobalStore
};
//# sourceMappingURL=store.js.map
