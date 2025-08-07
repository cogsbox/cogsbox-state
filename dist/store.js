import { create as b } from "zustand";
import { ulid as m } from "ulid";
const I = b((S, r) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, o) => S((s) => {
    const t = new Map(s.formRefs);
    return t.set(e, o), { formRefs: t };
  }),
  getFormRef: (e) => r().formRefs.get(e),
  removeFormRef: (e) => S((o) => {
    const s = new Map(o.formRefs);
    return s.delete(e), { formRefs: s };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (e) => {
    const o = r().formRefs, s = e + ".", t = /* @__PURE__ */ new Map();
    return o.forEach((n, a) => {
      (a.startsWith(s) || a === e) && t.set(a, n);
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
    const r = { arrayKeys: [] }, e = [];
    return S.forEach((o) => {
      const s = `id:${m()}`;
      r[s] = w(o), e.push(s);
    }), r.arrayKeys = e, r;
  }
  if (S.constructor === Object) {
    const r = {};
    for (const e in S)
      Object.prototype.hasOwnProperty.call(S, e) && (r[e] = w(S[e]));
    return r;
  }
  return { value: S };
}
const M = b((S, r) => ({
  // Add to CogsGlobalState in store.ts
  shadowStateStore: /* @__PURE__ */ new Map(),
  initializeShadowState: (e, o) => {
    S((s) => {
      const t = new Map(s.shadowStateStore), n = t.get(e) || t.get(`[${e}`);
      let a = {};
      if (n) {
        const {
          components: i,
          features: c,
          lastServerSync: l,
          stateSource: u,
          baseServerState: p
        } = n;
        i && (a.components = i), c && (a.features = c), l && (a.lastServerSync = l), u && (a.stateSource = u), p && (a.baseServerState = p);
      }
      t.delete(e), t.delete(`[${e}`);
      const d = w(o);
      Object.assign(d, a);
      const f = Array.isArray(o) ? `[${e}` : e;
      return t.set(f, d), console.log("sssssssssssssssssssssssssssss", t), { shadowStateStore: t };
    });
  },
  getShadowMetadata: (e, o) => {
    const s = r().shadowStateStore;
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
      const n = new Map(t.shadowStateStore), a = n.has(`[${e}`) ? `[${e}` : e;
      let d = n.get(a);
      d || (d = {}, n.set(a, d));
      const f = { ...d };
      if (n.set(a, f), o.length === 0)
        Object.assign(f, s);
      else {
        let i = f;
        const c = o.slice(0, -1);
        for (const p of c) {
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
    const n = r().getShadowMetadata(e, o);
    if (n == null) return;
    t && console.log("getShadowValue", e, o, n);
    const a = Object.keys(n), d = Object.prototype.hasOwnProperty.call(n, "value") && a.every((c) => c === "value" || y.has(c));
    if (t && console.log("isPrimitiveWrapper", d), d) return n.value;
    const f = Object.prototype.hasOwnProperty.call(n, "arrayKeys");
    if (t && console.log("isArrayNode", f), f) {
      const c = s !== void 0 && s.length > 0 ? s : n.arrayKeys;
      return t && console.log("keysToIterate", c), c.map(
        (l) => r().getShadowValue(e, [...o, l])
      );
    }
    const i = {};
    for (const c of a)
      !y.has(c) && !c.startsWith("id:") && (i[c] = r().getShadowValue(e, [...o, c]));
    return i;
  },
  updateShadowAtPath: (e, o, s) => {
    S((t) => {
      const n = new Map(t.shadowStateStore), a = n.has(`[${e}`) ? `[${e}` : e;
      let d = n.get(a);
      if (!d) return t;
      const f = { ...d };
      if (n.set(a, f), o.length === 0) {
        const i = w(s);
        for (const c in f)
          y.has(c) && (i[c] = f[c]);
        n.set(a, i);
      } else {
        let i = f;
        const c = o.slice(0, -1);
        for (const h of c)
          i[h] = { ...i[h] }, i = i[h];
        const l = o[o.length - 1], u = i[l] || {}, p = w(s);
        i[l] = { ...u, ...p };
      }
      return r().notifyPathSubscribers([e, ...o].join("."), {
        type: "UPDATE",
        newValue: s
      }), { shadowStateStore: n };
    });
  },
  insertShadowArrayElement: (e, o, s, t) => {
    S((n) => {
      const a = r().getShadowMetadata(e, o);
      if (!a)
        return console.error(
          `Array not found at path: ${[e, ...o].join(".")}`
        ), n;
      const d = `id:${m()}`;
      console.log("newItemId", d), a[d] = w(s);
      const i = [...a.arrayKeys || []];
      t !== void 0 && t >= 0 && t <= i.length ? i.splice(t, 0, d) : i.push(d), a.arrayKeys = i, r().setShadowMetadata(e, o, a);
      const c = [e, ...o].join(".");
      return r().notifyPathSubscribers(c, {
        type: "INSERT",
        path: c,
        itemKey: `${c}.${d}`,
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
      const a = r().getShadowMetadata(e, t);
      if (!a)
        return console.error(
          `Array not found at path: ${[e, ...t].join(".")}`
        ), s;
      delete a[n], Array.isArray(a.arrayKeys) && (a.arrayKeys = a.arrayKeys.filter((f) => f !== n)), r().setShadowMetadata(e, t, a);
      const d = [e, ...t].join(".");
      return r().notifyPathSubscribers(d, {
        type: "REMOVE",
        path: d,
        itemKey: `${d}.${n}`
      }), {};
    });
  },
  addPathComponent: (e, o, s) => {
    const t = r().getShadowMetadata(e, o) || {}, n = new Set(t.pathComponents);
    n.add(s), r().setShadowMetadata(e, o, {
      pathComponents: n
    });
    const a = r().getShadowMetadata(e, []);
    if (a?.components) {
      const d = a.components.get(s);
      if (d) {
        const f = [e, ...o].join("."), i = new Set(d.paths);
        i.add(f);
        const c = { ...d, paths: i }, l = new Map(a.components);
        l.set(s, c), r().setShadowMetadata(e, [], {
          components: l
        });
      }
    }
  },
  registerComponent: (e, o, s) => {
    const t = r().getShadowMetadata(e, []), n = new Map(t?.components);
    n.set(o, s), r().setShadowMetadata(e, [], { components: n });
  },
  // Replace the old unregisterComponent with this corrected version
  unregisterComponent: (e, o) => {
    const s = r().getShadowMetadata(e, []);
    if (!s?.components)
      return;
    const t = new Map(s.components);
    t.delete(o) && r().setShadowMetadata(e, [], { components: t });
  },
  markAsDirty: (e, o, s = { bubble: !0 }) => {
    S((t) => {
      const n = new Map(t.shadowStateStore), a = n.has(`[${e}`) ? `[${e}` : e, d = n.get(a);
      if (!d)
        return console.error(`State with key "${e}" not found for markAsDirty.`), t;
      const f = { ...d };
      n.set(a, f);
      const i = (c) => {
        let l = f;
        for (const p of c) {
          if (!l[p])
            return !0;
          l = l[p];
        }
        if (l.isDirty === !0)
          return !0;
        let u = f;
        for (const p of c)
          u[p] = { ...u[p] }, u = u[p];
        return u.isDirty = !0, !1;
      };
      if (i(o), s.bubble) {
        let c = [...o];
        for (; c.length > 0 && (c.pop(), !i(c)); )
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
    }), r().notifyPathSubscribers(e, {
      type: "SERVER_STATE_UPDATE",
      serverState: o
    });
  },
  getShadowNode: (e) => r().shadowStateStore.get(e),
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (e, o) => {
    const s = r().pathSubscribers, t = s.get(e) || /* @__PURE__ */ new Set();
    return t.add(o), s.set(e, t), () => {
      const n = r().pathSubscribers.get(e);
      n && (n.delete(o), n.size === 0 && r().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, o) => {
    const t = r().pathSubscribers.get(e);
    t && t.forEach((n) => n(o));
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, o) => {
    const s = r().selectedIndicesMap.get(e);
    if (!s) return -1;
    const t = o || M.getState().getShadowMetadata(e, [])?.arrayKeys;
    return t ? t.indexOf(s) : -1;
  },
  setSelectedIndex: (e, o) => {
    S((s) => {
      const t = s.selectedIndicesMap;
      return o === void 0 ? t.delete(e) : (t.has(e) && r().notifyPathSubscribers(t.get(e), {
        type: "THIS_UNSELECTED"
      }), t.set(e, o), r().notifyPathSubscribers(o, {
        type: "THIS_SELECTED"
      })), r().notifyPathSubscribers(e, {
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
      return t && r().notifyPathSubscribers(t, {
        type: "CLEAR_SELECTION"
      }), s.delete(e), r().notifyPathSubscribers(e, {
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
      for (const [n, a] of t.entries()) {
        const d = new Map(s.get(n));
        for (const f of a) {
          const i = JSON.stringify(f.path);
          d.set(i, { ...f });
        }
        s.set(n, d);
      }
      return { stateLog: s };
    });
  },
  getInitialOptions: (e) => r().initialStateOptions[e],
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
  getSyncInfo: (e) => r().syncInfoStore.get(e) || null
}));
export {
  y as METADATA_KEYS,
  w as buildShadowNode,
  I as formRefStore,
  M as getGlobalStore
};
//# sourceMappingURL=store.js.map
