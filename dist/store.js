import { create as b } from "zustand";
import { ulid as y } from "ulid";
const g = b((S, s) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (t, o) => S((e) => {
    const n = new Map(e.formRefs);
    return n.set(t, o), { formRefs: n };
  }),
  getFormRef: (t) => s().formRefs.get(t),
  removeFormRef: (t) => S((o) => {
    const e = new Map(o.formRefs);
    return e.delete(t), { formRefs: e };
  }),
  getFormRefsByStateKey: (t) => {
    const o = s().formRefs, e = t + ".", n = /* @__PURE__ */ new Map();
    return o.forEach((r, a) => {
      (a.startsWith(e) || a === t) && n.set(a, r);
    }), n;
  }
}));
function u(S) {
  if (S === null || typeof S != "object")
    return { value: S };
  if (Array.isArray(S)) {
    const s = { _meta: { arrayKeys: [] } }, t = [];
    return S.forEach((o) => {
      const e = `id:${y()}`;
      s[e] = u(o), t.push(e);
    }), s._meta.arrayKeys = t, s;
  }
  if (S.constructor === Object) {
    const s = { _meta: {} };
    for (const t in S)
      Object.prototype.hasOwnProperty.call(S, t) && (s[t] = u(S[t]));
    return s;
  }
  return { value: S };
}
const E = b((S, s) => ({
  shadowStateStore: /* @__PURE__ */ new Map(),
  setTransformCache: (t, o, e, n) => {
    const r = s().getShadowMetadata(t, o) || {};
    r.transformCaches || (r.transformCaches = /* @__PURE__ */ new Map()), r.transformCaches.set(e, n), s().setShadowMetadata(t, o, {
      transformCaches: r.transformCaches
    });
  },
  initializeShadowState: (t, o) => {
    S((e) => {
      const n = new Map(e.shadowStateStore), r = n.get(t) || n.get(`[${t}`);
      let a;
      if (r?._meta) {
        const {
          components: i,
          features: c,
          lastServerSync: f,
          stateSource: h,
          baseServerState: p
        } = r._meta;
        (i || c || f || h || p) && (a = {}, i && (a.components = i), c && (a.features = c), f && (a.lastServerSync = f), h && (a.stateSource = h), p && (a.baseServerState = p));
      }
      n.delete(t), n.delete(`[${t}`);
      const d = u(o);
      a && (d._meta || (d._meta = {}), Object.assign(d._meta, a));
      const l = Array.isArray(o) ? `[${t}` : t;
      return n.set(l, d), { shadowStateStore: n };
    });
  },
  getShadowNode: (t, o) => {
    const e = s().shadowStateStore;
    if (o.length === 0)
      return e.get(t) || e.get(`[${t}`);
    let n = e.get(t) || e.get(`[${t}`);
    if (n) {
      for (let r = 0; r < o.length; r++)
        if (typeof n != "object" || n === null || (n = n[o[r]], n === void 0)) return;
      return n;
    }
  },
  getShadowMetadata: (t, o) => s().getShadowNode(t, o)?._meta,
  setShadowMetadata: (t, o, e) => {
    S((n) => {
      const r = new Map(n.shadowStateStore), a = r.has(`[${t}`) ? `[${t}` : t;
      let d = r.get(a);
      if (!d)
        return d = { _meta: e }, r.set(a, d), { shadowStateStore: r };
      if (o.length === 0) {
        const c = { ...d };
        return c._meta = { ...d._meta || {}, ...e }, r.set(a, c), { shadowStateStore: r };
      }
      const l = { ...d };
      r.set(a, l);
      let i = l;
      for (let c = 0; c < o.length; c++) {
        const f = o[c];
        i[f] ? i[f] = { ...i[f] } : i[f] = c === o.length - 1 ? { _meta: {} } : {}, i = i[f];
      }
      return i._meta = i._meta ? { ...i._meta, ...e } : e, { shadowStateStore: r };
    });
  },
  getShadowValue: (t, o, e, n) => {
    const r = s().getShadowNode(t, o);
    if (r == null) return;
    const a = Object.keys(r);
    if (Object.prototype.hasOwnProperty.call(r, "value") && a.every((c) => c === "value" || c === "_meta"))
      return r.value;
    if (r._meta && Object.prototype.hasOwnProperty.call(r._meta, "arrayKeys")) {
      const c = e !== void 0 && e.length > 0 ? e : r._meta.arrayKeys, f = new Array(c.length);
      for (let h = 0; h < c.length; h++)
        f[h] = s().getShadowValue(t, [...o, c[h]]);
      return f;
    }
    const i = {};
    for (const c in r)
      c !== "_meta" && !c.startsWith("id:") && Object.prototype.hasOwnProperty.call(r, c) && (i[c] = s().getShadowValue(t, [...o, c]));
    return i;
  },
  updateShadowAtPath: (t, o, e) => {
    S((n) => {
      const r = new Map(n.shadowStateStore), a = r.has(`[${t}`) ? `[${t}` : t;
      let d = r.get(a);
      if (!d) return n;
      const l = { ...d };
      if (r.set(a, l), o.length === 0) {
        const p = d._meta, m = u(e);
        return p && (m._meta = { ...p, ...m._meta || {} }), r.set(a, m), s().notifyPathSubscribers(t, {
          type: "UPDATE",
          newValue: e
        }), { shadowStateStore: r };
      }
      let i = l;
      const c = o.length;
      for (let p = 0; p < c - 1; p++) {
        const m = o[p];
        i[m] = i[m] ? { ...i[m] } : {}, i = i[m];
      }
      const f = o[c - 1], h = i[f];
      if (e == null || typeof e != "object" || Array.isArray(e) || !h || Array.isArray(h._meta?.arrayKeys)) {
        const p = h?._meta, m = u(e);
        p && (m._meta ? m._meta = { ...p, ...m._meta } : m._meta = p), i[f] = m;
      } else {
        const p = { ...h };
        i[f] = p, h._meta && (p._meta = h._meta);
        const m = new Set(Object.keys(e));
        for (const w in p)
          w !== "_meta" && !m.has(w) && delete p[w];
        for (const w of m)
          p[w] = u(e[w]);
      }
      return s().notifyPathSubscribers([t, ...o].join("."), {
        type: "UPDATE",
        newValue: e
      }), { shadowStateStore: r };
    });
  },
  addItemsToArrayNode: (t, o, e, n) => {
    S((r) => {
      const a = new Map(r.shadowStateStore), d = a.has(`[${t}`) ? `[${t}` : t;
      let l = a.get(d);
      if (!l)
        return console.error("Root not found for state key:", t), r;
      const i = { ...l };
      a.set(d, i);
      let c = i;
      for (const f of o) {
        const h = c[f] || {};
        c[f] = { ...h }, c = c[f];
      }
      return Object.assign(c, e), c._meta = { ...c._meta || {}, arrayKeys: n }, { shadowStateStore: a };
    });
  },
  insertShadowArrayElement: (t, o, e, n) => {
    const r = s().getShadowNode(t, o);
    if (!r?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[t, ...o].join(".")}`
      );
      return;
    }
    const a = `id:${y()}`, d = { [a]: u(e) }, i = [...r._meta.arrayKeys], c = n !== void 0 && n >= 0 && n <= i.length ? n : i.length;
    i.splice(c, 0, a), s().addItemsToArrayNode(t, o, d, i);
    const f = [t, ...o].join(".");
    s().notifyPathSubscribers(f, {
      type: "INSERT",
      path: f,
      itemKey: `${f}.${a}`,
      index: c
    });
  },
  insertManyShadowArrayElements: (t, o, e, n) => {
    if (!e || e.length === 0) return;
    const r = s().getShadowNode(t, o);
    if (!r?._meta?.arrayKeys) {
      console.error(
        `Array not found at path: ${[t, ...o].join(".")}`
      );
      return;
    }
    const a = /* @__PURE__ */ Object.create(null), d = new Array(e.length);
    for (let h = 0; h < e.length; h++) {
      const p = `id:${y()}`;
      d[h] = p, a[p] = u(e[h]);
    }
    const l = r._meta.arrayKeys, i = n !== void 0 && n >= 0 && n <= l.length ? n : l.length, c = [
      ...l.slice(0, i),
      ...d,
      ...l.slice(i)
    ];
    s().addItemsToArrayNode(t, o, a, c);
    const f = [t, ...o].join(".");
    s().notifyPathSubscribers(f, {
      type: "INSERT_MANY",
      path: f,
      count: e.length,
      index: i
    });
  },
  removeShadowArrayElement: (t, o) => {
    if (o.length === 0) return;
    const e = o.slice(0, -1), n = o[o.length - 1];
    if (!n?.startsWith("id:")) return;
    const r = s().getShadowNode(t, e);
    if (!r?._meta?.arrayKeys) return;
    const a = r._meta.arrayKeys.filter((l) => l !== n);
    delete r[n], s().setShadowMetadata(t, e, { arrayKeys: a });
    const d = [t, ...e].join(".");
    s().notifyPathSubscribers(d, {
      type: "REMOVE",
      path: d,
      itemKey: `${d}.${n}`
    });
  },
  addPathComponent: (t, o, e) => {
    const n = s().getShadowMetadata(t, o) || {};
    if (!n.pathComponents?.has(e)) {
      const r = new Set(n.pathComponents);
      r.add(e), s().setShadowMetadata(t, o, {
        pathComponents: r
      });
      const a = s().getShadowMetadata(t, []);
      if (a?.components) {
        const d = a.components.get(e);
        if (d && !d.paths.has([t, ...o].join("."))) {
          const l = new Set(d.paths), i = [t, ...o].join(".");
          l.add(i);
          const c = new Map(a.components);
          c.set(e, {
            ...d,
            paths: l
          }), s().setShadowMetadata(t, [], {
            components: c
          });
        }
      }
    }
  },
  registerComponent: (t, o, e) => {
    const n = s().getShadowMetadata(t, []) || {}, r = new Map(n.components);
    r.set(o, e), s().setShadowMetadata(t, [], { components: r });
  },
  unregisterComponent: (t, o) => {
    const e = s().getShadowMetadata(t, []);
    if (!e?.components) return;
    const n = new Map(e.components);
    n.delete(o) && s().setShadowMetadata(t, [], { components: n });
  },
  markAsDirty: (t, o, e = { bubble: !0 }) => {
    const n = (r) => s().getShadowNode(t, r)?._meta?.isDirty ? !0 : (s().setShadowMetadata(t, r, { isDirty: !0 }), !1);
    if (n(o), e.bubble) {
      let r = [...o];
      for (; r.length > 0 && (r.pop(), !n(r)); )
        ;
    }
  },
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (t, o) => {
    S((e) => ({
      serverStateUpdates: new Map(e.serverStateUpdates).set(
        t,
        o
      )
    })), s().notifyPathSubscribers(t, {
      type: "SERVER_STATE_UPDATE",
      serverState: o
    });
  },
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (t, o) => {
    const e = s().pathSubscribers, n = e.get(t) || /* @__PURE__ */ new Set();
    return n.add(o), e.set(t, n), () => {
      const r = s().pathSubscribers.get(t);
      r && (r.delete(o), r.size === 0 && s().pathSubscribers.delete(t));
    };
  },
  notifyPathSubscribers: (t, o) => {
    const n = s().pathSubscribers.get(t);
    n && n.forEach((r) => r(o));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (t, o) => {
    const e = s().selectedIndicesMap.get(t);
    if (!e) return -1;
    const n = s().getShadowMetadata(
      t.split(".")[0],
      t.split(".").slice(1)
    ), r = o || n?.arrayKeys;
    return r ? r.indexOf(e) : -1;
  },
  setSelectedIndex: (t, o) => {
    S((e) => {
      const n = new Map(e.selectedIndicesMap);
      return o === void 0 ? n.delete(t) : (n.has(t) && s().notifyPathSubscribers(n.get(t), {
        type: "THIS_UNSELECTED"
      }), n.set(t, o), s().notifyPathSubscribers(o, { type: "THIS_SELECTED" })), s().notifyPathSubscribers(t, { type: "GET_SELECTED" }), {
        ...e,
        selectedIndicesMap: n
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: t }) => {
    S((o) => {
      const e = new Map(o.selectedIndicesMap), n = e.get(t);
      return n && s().notifyPathSubscribers(n, {
        type: "CLEAR_SELECTION"
      }), e.delete(t), s().notifyPathSubscribers(t, {
        type: "CLEAR_SELECTION"
      }), {
        ...o,
        selectedIndicesMap: e
      };
    });
  },
  clearSelectedIndexesForState: (t) => {
    S((o) => {
      const e = new Map(o.selectedIndicesMap);
      let n = !1;
      for (const r of e.keys())
        (r === t || r.startsWith(t + ".")) && (e.delete(r), n = !0);
      return n ? { selectedIndicesMap: e } : {};
    });
  },
  initialStateOptions: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  addStateLog: (t) => {
    !t || t.length === 0 || S((o) => {
      const e = new Map(o.stateLog), n = /* @__PURE__ */ new Map();
      for (const r of t) {
        const a = n.get(r.stateKey) || [];
        a.push(r), n.set(r.stateKey, a);
      }
      for (const [r, a] of n.entries()) {
        const d = new Map(e.get(r));
        for (const l of a)
          d.set(JSON.stringify(l.path), { ...l });
        e.set(r, d);
      }
      return { stateLog: e };
    });
  },
  getInitialOptions: (t) => s().initialStateOptions[t],
  setInitialStateOptions: (t, o) => {
    S((e) => ({
      initialStateOptions: { ...e.initialStateOptions, [t]: o }
    }));
  },
  updateInitialStateGlobal: (t, o) => {
    S((e) => ({
      initialStateGlobal: { ...e.initialStateGlobal, [t]: o }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (t, o) => S((e) => {
    const n = new Map(e.syncInfoStore);
    return n.set(t, o), { syncInfoStore: n };
  }),
  getSyncInfo: (t) => s().syncInfoStore.get(t) || null
}));
export {
  u as buildShadowNode,
  g as formRefStore,
  E as getGlobalStore
};
//# sourceMappingURL=store.js.map
