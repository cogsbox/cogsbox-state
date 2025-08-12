import { create as M } from "zustand";
import { ulid as y } from "ulid";
const I = M((f, s) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (t, e) => f((n) => {
    const o = new Map(n.formRefs);
    return o.set(t, e), { formRefs: o };
  }),
  getFormRef: (t) => s().formRefs.get(t),
  removeFormRef: (t) => f((e) => {
    const n = new Map(e.formRefs);
    return n.delete(t), { formRefs: n };
  }),
  getFormRefsByStateKey: (t) => {
    const e = s().formRefs, n = t + ".", o = /* @__PURE__ */ new Map();
    return e.forEach((r, a) => {
      (a.startsWith(n) || a === t) && o.set(a, r);
    }), o;
  }
}));
function w(f) {
  if (f === null || typeof f != "object")
    return { value: f };
  if (Array.isArray(f)) {
    const s = { _meta: { arrayKeys: [] } }, t = [];
    return f.forEach((e) => {
      const n = `id:${y()}`;
      s[n] = w(e), t.push(n);
    }), s._meta.arrayKeys = t, s;
  }
  if (f.constructor === Object) {
    const s = { _meta: {} };
    for (const t in f)
      Object.prototype.hasOwnProperty.call(f, t) && (s[t] = w(f[t]));
    return s;
  }
  return { value: f };
}
const N = M((f, s) => ({
  shadowStateStore: /* @__PURE__ */ new Map(),
  setTransformCache: (t, e, n, o) => {
    const r = s().getShadowMetadata(t, e) || {};
    r.transformCaches || (r.transformCaches = /* @__PURE__ */ new Map()), r.transformCaches.set(n, o), s().setShadowMetadata(t, e, {
      transformCaches: r.transformCaches
    });
  },
  initializeShadowState: (t, e) => {
    f((n) => {
      const o = new Map(n.shadowStateStore), r = o.get(t) || o.get(`[${t}`);
      let a = {};
      if (r?._meta) {
        const {
          components: c,
          features: i,
          lastServerSync: S,
          stateSource: l,
          baseServerState: u
        } = r._meta;
        c && (a.components = c), i && (a.features = i), S && (a.lastServerSync = S), l && (a.stateSource = l), u && (a.baseServerState = u);
      }
      o.delete(t), o.delete(`[${t}`);
      const d = w(e);
      d._meta || (d._meta = {}), Object.assign(d._meta, a);
      const p = Array.isArray(e) ? `[${t}` : t;
      return o.set(p, d), { shadowStateStore: o };
    });
  },
  getShadowNode: (t, e) => {
    const n = s().shadowStateStore;
    let o = n.get(t) || n.get(`[${t}`);
    if (o) {
      if (e.length === 0) return o;
      for (const r of e)
        if (typeof o != "object" || o === null || (o = o[r], o === void 0)) return;
      return o;
    }
  },
  getShadowMetadata: (t, e) => s().getShadowNode(t, e)?._meta,
  setShadowMetadata: (t, e, n) => {
    f((o) => {
      const r = new Map(o.shadowStateStore), a = r.has(`[${t}`) ? `[${t}` : t;
      let d = r.get(a);
      d || (d = {}, r.set(a, d));
      const p = { ...d };
      r.set(a, p);
      let c = p;
      for (const i of e) {
        const S = c[i] || {};
        c[i] = { ...S }, c = c[i];
      }
      return c._meta = { ...c._meta || {}, ...n }, { shadowStateStore: r };
    });
  },
  getShadowValue: (t, e, n, o) => {
    const r = s().getShadowNode(t, e);
    if (r == null) return;
    const a = Object.keys(r);
    if (Object.prototype.hasOwnProperty.call(r, "value") && a.every((i) => i === "value" || i === "_meta"))
      return r.value;
    if (r._meta && Object.prototype.hasOwnProperty.call(r._meta, "arrayKeys"))
      return (n !== void 0 && n.length > 0 ? n : r._meta.arrayKeys).map(
        (S) => s().getShadowValue(t, [...e, S])
      );
    const c = {};
    for (const i of a)
      i !== "_meta" && !i.startsWith("id:") && (c[i] = s().getShadowValue(t, [...e, i]));
    return c;
  },
  updateShadowAtPath: (t, e, n) => {
    f((o) => {
      const r = new Map(o.shadowStateStore), a = r.has(`[${t}`) ? `[${t}` : t;
      let d = r.get(a);
      if (!d) return o;
      const p = { ...d };
      r.set(a, p);
      let c = p;
      for (let l = 0; l < e.length - 1; l++)
        c[e[l]] = { ...c[e[l]] || {} }, c = c[e[l]];
      const i = e.length === 0 ? c : c[e[e.length - 1]];
      if (!i)
        return c[e[e.length - 1]] = w(n), { shadowStateStore: r };
      function S(l, u) {
        if (typeof u != "object" || u === null || Array.isArray(u)) {
          const h = l._meta, m = w(u);
          h && (m._meta = { ...h, ...m._meta || {} }), Object.keys(l).forEach((g) => delete l[g]), Object.assign(l, m);
          return;
        }
        const b = new Set(Object.keys(u));
        for (const h of b) {
          const m = u[h];
          l[h] ? S(l[h], m) : l[h] = w(m);
        }
        for (const h in l)
          h === "_meta" || !Object.prototype.hasOwnProperty.call(l, h) || b.has(h) || delete l[h];
      }
      return S(i, n), s().notifyPathSubscribers([t, ...e].join("."), {
        type: "UPDATE",
        newValue: n
      }), { shadowStateStore: r };
    });
  },
  addItemsToArrayNode: (t, e, n, o) => {
    f((r) => {
      const a = new Map(r.shadowStateStore), d = a.has(`[${t}`) ? `[${t}` : t;
      let p = a.get(d);
      if (!p)
        return console.error("Root not found for state key:", t), r;
      const c = { ...p };
      a.set(d, c);
      let i = c;
      for (const S of e) {
        const l = i[S] || {};
        i[S] = { ...l }, i = i[S];
      }
      return Object.assign(i, n), i._meta = { ...i._meta || {}, arrayKeys: o }, { shadowStateStore: a };
    });
  },
  insertShadowArrayElement: (t, e, n, o) => {
    const r = s().getShadowNode(t, e);
    if (!r?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[t, ...e].join(".")}`
      );
      return;
    }
    const a = `id:${y()}`, d = { [a]: w(n) }, c = [...r._meta.arrayKeys], i = o !== void 0 && o >= 0 && o <= c.length ? o : c.length;
    c.splice(i, 0, a), s().addItemsToArrayNode(t, e, d, c);
    const S = [t, ...e].join(".");
    s().notifyPathSubscribers(S, {
      type: "INSERT",
      path: S,
      itemKey: `${S}.${a}`,
      index: i
    });
  },
  insertManyShadowArrayElements: (t, e, n, o) => {
    if (!n || n.length === 0)
      return;
    const r = s().getShadowNode(t, e);
    if (!r?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[t, ...e].join(".")}`
      );
      return;
    }
    const a = {}, d = [];
    n.forEach((l) => {
      const u = `id:${y()}`;
      d.push(u), a[u] = w(l);
    });
    const c = [...r._meta.arrayKeys], i = o !== void 0 && o >= 0 && o <= c.length ? o : c.length;
    c.splice(i, 0, ...d), s().addItemsToArrayNode(t, e, a, c);
    const S = [t, ...e].join(".");
    s().notifyPathSubscribers(S, {
      type: "INSERT_MANY",
      path: S,
      count: n.length,
      index: i
    });
  },
  removeShadowArrayElement: (t, e) => {
    if (e.length === 0) return;
    const n = e.slice(0, -1), o = e[e.length - 1];
    if (!o?.startsWith("id:")) return;
    const r = s().getShadowNode(t, n);
    if (!r?._meta?.arrayKeys) return;
    const a = r._meta.arrayKeys.filter((p) => p !== o);
    delete r[o], s().setShadowMetadata(t, n, { arrayKeys: a });
    const d = [t, ...n].join(".");
    s().notifyPathSubscribers(d, {
      type: "REMOVE",
      path: d,
      itemKey: `${d}.${o}`
    });
  },
  addPathComponent: (t, e, n) => {
    const o = s().getShadowMetadata(t, e) || {}, r = new Set(o.pathComponents);
    r.add(n), s().setShadowMetadata(t, e, {
      pathComponents: r
    });
    const a = s().getShadowMetadata(t, []);
    if (a?.components) {
      const d = a.components.get(n);
      if (d) {
        const p = [t, ...e].join("."), c = new Set(d.paths);
        c.add(p);
        const i = { ...d, paths: c }, S = new Map(a.components);
        S.set(n, i), s().setShadowMetadata(t, [], { components: S });
      }
    }
  },
  registerComponent: (t, e, n) => {
    const o = s().getShadowMetadata(t, []) || {}, r = new Map(o.components);
    r.set(e, n), s().setShadowMetadata(t, [], { components: r });
  },
  unregisterComponent: (t, e) => {
    const n = s().getShadowMetadata(t, []);
    if (!n?.components) return;
    const o = new Map(n.components);
    o.delete(e) && s().setShadowMetadata(t, [], { components: o });
  },
  markAsDirty: (t, e, n = { bubble: !0 }) => {
    const o = (r) => s().getShadowNode(t, r)?._meta?.isDirty ? !0 : (s().setShadowMetadata(t, r, { isDirty: !0 }), !1);
    if (o(e), n.bubble) {
      let r = [...e];
      for (; r.length > 0 && (r.pop(), !o(r)); )
        ;
    }
  },
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (t, e) => {
    f((n) => ({
      serverStateUpdates: new Map(n.serverStateUpdates).set(
        t,
        e
      )
    })), s().notifyPathSubscribers(t, {
      type: "SERVER_STATE_UPDATE",
      serverState: e
    });
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (t, e) => {
    const n = s().pathSubscribers, o = n.get(t) || /* @__PURE__ */ new Set();
    return o.add(e), n.set(t, o), () => {
      const r = s().pathSubscribers.get(t);
      r && (r.delete(e), r.size === 0 && s().pathSubscribers.delete(t));
    };
  },
  notifyPathSubscribers: (t, e) => {
    const o = s().pathSubscribers.get(t);
    o && o.forEach((r) => r(e));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (t, e) => {
    const n = s().selectedIndicesMap.get(t);
    if (!n) return -1;
    const o = s().getShadowMetadata(
      t.split(".")[0],
      t.split(".").slice(1)
    ), r = e || o?.arrayKeys;
    return r ? r.indexOf(n) : -1;
  },
  setSelectedIndex: (t, e) => {
    f((n) => {
      const o = new Map(n.selectedIndicesMap);
      return e === void 0 ? o.delete(t) : (o.has(t) && s().notifyPathSubscribers(o.get(t), {
        type: "THIS_UNSELECTED"
      }), o.set(t, e), s().notifyPathSubscribers(e, { type: "THIS_SELECTED" })), s().notifyPathSubscribers(t, { type: "GET_SELECTED" }), {
        ...n,
        selectedIndicesMap: o
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: t }) => {
    f((e) => {
      const n = new Map(e.selectedIndicesMap), o = n.get(t);
      return o && s().notifyPathSubscribers(o, {
        type: "CLEAR_SELECTION"
      }), n.delete(t), s().notifyPathSubscribers(t, {
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
      let o = !1;
      for (const r of n.keys())
        (r === t || r.startsWith(t + ".")) && (n.delete(r), o = !0);
      return o ? { selectedIndicesMap: n } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (t) => {
    !t || t.length === 0 || f((e) => {
      const n = new Map(e.stateLog), o = /* @__PURE__ */ new Map();
      for (const r of t) {
        const a = o.get(r.stateKey) || [];
        a.push(r), o.set(r.stateKey, a);
      }
      for (const [r, a] of o.entries()) {
        const d = new Map(n.get(r));
        for (const p of a)
          d.set(JSON.stringify(p.path), { ...p });
        n.set(r, d);
      }
      return { stateLog: n };
    });
  },
  getInitialOptions: (t) => s().initialStateOptions[t],
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
    const o = new Map(n.syncInfoStore);
    return o.set(t, e), { syncInfoStore: o };
  }),
  getSyncInfo: (t) => s().syncInfoStore.get(t) || null
}));
export {
  w as buildShadowNode,
  I as formRefStore,
  N as getGlobalStore
};
//# sourceMappingURL=store.js.map
