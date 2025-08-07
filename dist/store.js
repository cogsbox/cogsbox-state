import { create as b } from "zustand";
import { ulid as m } from "ulid";
const I = b((S, a) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, o) => S((s) => {
    const t = new Map(s.formRefs);
    return t.set(e, o), { formRefs: t };
  }),
  getFormRef: (e) => a().formRefs.get(e),
  removeFormRef: (e) => S((o) => {
    const s = new Map(o.formRefs);
    return s.delete(e), { formRefs: s };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (e) => {
    const o = a().formRefs, s = e + ".", t = /* @__PURE__ */ new Map();
    return o.forEach((n, r) => {
      (r.startsWith(s) || r === e) && t.set(r, n);
    }), t;
  }
})), y = /* @__PURE__ */ new Set([
  "arrayKeys",
  "components",
  "signals",
  "mapWrappers",
  "pathComponents",
  "validation",
  "features",
  "virtualizer",
  "transformCaches",
  "lastServerSync",
  "stateSource",
  "baseServerState",
  "isDirty"
]);
function w(S) {
  if (S === null || typeof S != "object")
    return { value: S };
  if (Array.isArray(S)) {
    const a = { arrayKeys: [] }, e = [];
    return S.forEach((o) => {
      const s = `id:${m()}`;
      a[s] = w(o), e.push(s);
    }), a.arrayKeys = e, a;
  }
  if (S.constructor === Object) {
    const a = {};
    for (const e in S)
      Object.prototype.hasOwnProperty.call(S, e) && (a[e] = w(S[e]));
    return a;
  }
  return { value: S };
}
const M = b((S, a) => ({
  // Add to CogsGlobalState in store.ts
  shadowStateStore: /* @__PURE__ */ new Map(),
  setTransformCache: (e, o, s, t) => {
    const n = [e, ...o].join("."), r = new Map(a().shadowStateStore), c = r.get(n) || {};
    c.transformCaches || (c.transformCaches = /* @__PURE__ */ new Map()), c.transformCaches.set(s, t), r.set(n, c), S({ shadowStateStore: r });
  },
  initializeShadowState: (e, o) => {
    S((s) => {
      const t = new Map(s.shadowStateStore), n = t.get(e) || t.get(`[${e}`);
      let r = {};
      if (n) {
        const {
          components: i,
          features: d,
          lastServerSync: l,
          stateSource: u,
          baseServerState: p
        } = n;
        i && (r.components = i), d && (r.features = d), l && (r.lastServerSync = l), u && (r.stateSource = u), p && (r.baseServerState = p);
      }
      t.delete(e), t.delete(`[${e}`);
      const c = w(o);
      Object.assign(c, r);
      const f = Array.isArray(o) ? `[${e}` : e;
      return t.set(f, c), console.log("sssssssssssssssssssssssssssss", t), { shadowStateStore: t };
    });
  },
  getShadowMetadata: (e, o) => {
    const s = a().shadowStateStore;
    let t = s.get(e) || s.get(`[${e}`);
    if (t) {
      if (o.length === 0) return t;
      for (const n of o)
        if (typeof t != "object" || t === null || (t = t[n], t === void 0)) return;
      return t;
    }
  },
  setShadowMetadata: (e, o, s) => {
    S((t) => {
      const n = new Map(t.shadowStateStore), r = n.has(`[${e}`) ? `[${e}` : e;
      let c = n.get(r);
      c || (c = {}, n.set(r, c));
      const f = { ...c };
      if (n.set(r, f), o.length === 0)
        Object.assign(f, s);
      else {
        let i = f;
        const d = o.slice(0, -1);
        for (const p of d) {
          const h = i[p] || {};
          i[p] = { ...h }, i = i[p];
        }
        const l = o[o.length - 1], u = i[l] || {};
        i[l] = { ...u, ...s };
      }
      return { shadowStateStore: n };
    });
  },
  getShadowValue: (e, o, s, t) => {
    const n = a().getShadowMetadata(e, o);
    if (n == null) return;
    t && console.log("getShadowValue", e, o, n);
    const r = Object.keys(n), c = Object.prototype.hasOwnProperty.call(n, "value") && r.every((d) => d === "value" || y.has(d));
    if (t && console.log("isPrimitiveWrapper", c), c) return n.value;
    const f = Object.prototype.hasOwnProperty.call(n, "arrayKeys");
    if (t && console.log("isArrayNode", f), f) {
      const d = s !== void 0 && s.length > 0 ? s : n.arrayKeys;
      return t && console.log("keysToIterate", d), d.map(
        (l) => a().getShadowValue(e, [...o, l])
      );
    }
    const i = {};
    for (const d of r)
      !y.has(d) && !d.startsWith("id:") && (i[d] = a().getShadowValue(e, [...o, d]));
    return i;
  },
  updateShadowAtPath: (e, o, s) => {
    S((t) => {
      const n = new Map(t.shadowStateStore), r = n.has(`[${e}`) ? `[${e}` : e;
      let c = n.get(r);
      if (!c) return t;
      const f = { ...c };
      if (n.set(r, f), o.length === 0) {
        const i = w(s);
        for (const d in f)
          y.has(d) && (i[d] = f[d]);
        n.set(r, i);
      } else {
        let i = f;
        const d = o.slice(0, -1);
        for (const h of d)
          i[h] = { ...i[h] }, i = i[h];
        const l = o[o.length - 1], u = i[l] || {}, p = w(s);
        i[l] = { ...u, ...p };
      }
      return a().notifyPathSubscribers([e, ...o].join("."), {
        type: "UPDATE",
        newValue: s
      }), { shadowStateStore: n };
    });
  },
  insertShadowArrayElement: (e, o, s, t) => {
    S((n) => {
      const r = a().getShadowMetadata(e, o);
      if (!r)
        return console.error(
          `Array not found at path: ${[e, ...o].join(".")}`
        ), n;
      const c = `id:${m()}`;
      r[c] = w(s);
      const i = [...r.arrayKeys || []];
      t !== void 0 && t >= 0 && t <= i.length ? i.splice(t, 0, c) : i.push(c), r.arrayKeys = i, a().setShadowMetadata(e, o, r);
      const d = [e, ...o].join(".");
      return a().notifyPathSubscribers(d, {
        type: "INSERT",
        path: d,
        itemKey: `${d}.${c}`,
        index: t ?? i.length - 1
      }), {};
    });
  },
  // ✅ CHANGE 5: `removeShadowArrayElement` now updates the `arrayKeys` metadata.
  removeShadowArrayElement: (e, o) => {
    S((s) => {
      if (o.length === 0)
        return console.error("Cannot remove root"), s;
      const t = o.slice(0, -1), n = o[o.length - 1];
      if (!n?.startsWith("id:"))
        return console.error("Invalid item ID for removal:", n), s;
      const r = a().getShadowMetadata(e, t);
      if (!r)
        return console.error(
          `Array not found at path: ${[e, ...t].join(".")}`
        ), s;
      delete r[n], Array.isArray(r.arrayKeys) && (r.arrayKeys = r.arrayKeys.filter((f) => f !== n)), a().setShadowMetadata(e, t, r);
      const c = [e, ...t].join(".");
      return a().notifyPathSubscribers(c, {
        type: "REMOVE",
        path: c,
        itemKey: `${c}.${n}`
      }), {};
    });
  },
  addPathComponent: (e, o, s) => {
    const t = a().getShadowMetadata(e, o) || {}, n = new Set(t.pathComponents);
    n.add(s), a().setShadowMetadata(e, o, {
      pathComponents: n
    });
    const r = a().getShadowMetadata(e, []);
    if (r?.components) {
      const c = r.components.get(s);
      if (c) {
        const f = [e, ...o].join("."), i = new Set(c.paths);
        i.add(f);
        const d = { ...c, paths: i }, l = new Map(r.components);
        l.set(s, d), a().setShadowMetadata(e, [], {
          components: l
        });
      }
    }
  },
  registerComponent: (e, o, s) => {
    const t = a().getShadowMetadata(e, []), n = new Map(t?.components);
    n.set(o, s), a().setShadowMetadata(e, [], { components: n });
  },
  // Replace the old unregisterComponent with this corrected version
  unregisterComponent: (e, o) => {
    const s = a().getShadowMetadata(e, []);
    if (!s?.components)
      return;
    const t = new Map(s.components);
    t.delete(o) && a().setShadowMetadata(e, [], { components: t });
  },
  markAsDirty: (e, o, s = { bubble: !0 }) => {
    S((t) => {
      const n = new Map(t.shadowStateStore), r = n.has(`[${e}`) ? `[${e}` : e, c = n.get(r);
      if (!c)
        return console.error(`State with key "${e}" not found for markAsDirty.`), t;
      const f = { ...c };
      n.set(r, f);
      const i = (d) => {
        let l = f;
        for (const p of d) {
          if (!l[p])
            return !0;
          l = l[p];
        }
        if (l.isDirty === !0)
          return !0;
        let u = f;
        for (const p of d)
          u[p] = { ...u[p] }, u = u[p];
        return u.isDirty = !0, !1;
      };
      if (i(o), s.bubble) {
        let d = [...o];
        for (; d.length > 0 && (d.pop(), !i(d)); )
          ;
      }
      return { shadowStateStore: n };
    });
  },
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (e, o) => {
    S((s) => {
      const t = new Map(s.serverStateUpdates);
      return t.set(e, o), { serverStateUpdates: t };
    }), a().notifyPathSubscribers(e, {
      type: "SERVER_STATE_UPDATE",
      serverState: o
    });
  },
  getShadowNode: (e) => a().shadowStateStore.get(e),
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (e, o) => {
    const s = a().pathSubscribers, t = s.get(e) || /* @__PURE__ */ new Set();
    return t.add(o), s.set(e, t), () => {
      const n = a().pathSubscribers.get(e);
      n && (n.delete(o), n.size === 0 && a().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, o) => {
    const t = a().pathSubscribers.get(e);
    t && t.forEach((n) => n(o));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, o) => {
    const s = a().selectedIndicesMap.get(e);
    if (!s) return -1;
    const t = o || M.getState().getShadowMetadata(e, [])?.arrayKeys;
    return t ? t.indexOf(s) : -1;
  },
  setSelectedIndex: (e, o) => {
    S((s) => {
      const t = s.selectedIndicesMap;
      return o === void 0 ? t.delete(e) : (t.has(e) && a().notifyPathSubscribers(t.get(e), {
        type: "THIS_UNSELECTED"
      }), t.set(e, o), a().notifyPathSubscribers(o, {
        type: "THIS_SELECTED"
      })), a().notifyPathSubscribers(e, {
        type: "GET_SELECTED"
      }), {
        ...s,
        selectedIndicesMap: t
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: e }) => {
    S((o) => {
      const s = o.selectedIndicesMap, t = s.get(e);
      return t && a().notifyPathSubscribers(t, {
        type: "CLEAR_SELECTION"
      }), s.delete(e), a().notifyPathSubscribers(e, {
        type: "CLEAR_SELECTION"
      }), {
        ...o,
        selectedIndicesMap: s
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    S((o) => {
      const s = new Map(o.selectedIndicesMap);
      return s.delete(e) ? { selectedIndicesMap: s } : {};
    });
  },
  initialStateOptions: {},
  stateTimeline: {},
  cogsStateStore: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  validationErrors: /* @__PURE__ */ new Map(),
  addStateLog: (e) => {
    !e || e.length === 0 || S((o) => {
      const s = new Map(o.stateLog), t = /* @__PURE__ */ new Map();
      for (const n of e)
        t.has(n.stateKey) || t.set(n.stateKey, []), t.get(n.stateKey).push(n);
      for (const [n, r] of t.entries()) {
        const c = new Map(s.get(n));
        for (const f of r) {
          const i = JSON.stringify(f.path);
          c.set(i, { ...f });
        }
        s.set(n, c);
      }
      return { stateLog: s };
    });
  },
  getInitialOptions: (e) => a().initialStateOptions[e],
  setInitialStateOptions: (e, o) => {
    S((s) => ({
      initialStateOptions: {
        ...s.initialStateOptions,
        [e]: o
      }
    }));
  },
  updateInitialStateGlobal: (e, o) => {
    S((s) => ({
      initialStateGlobal: {
        ...s.initialStateGlobal,
        [e]: o
      }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, o) => S((s) => {
    const t = new Map(s.syncInfoStore);
    return t.set(e, o), { ...s, syncInfoStore: t };
  }),
  getSyncInfo: (e) => a().syncInfoStore.get(e) || null
}));
export {
  y as METADATA_KEYS,
  w as buildShadowNode,
  I as formRefStore,
  M as getGlobalStore
};
//# sourceMappingURL=store.js.map
