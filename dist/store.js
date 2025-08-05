import { create as b } from "zustand";
import { ulid as m } from "ulid";
import { startTransition as E } from "react";
const O = b((i, f) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, n) => i((o) => {
    const t = new Map(o.formRefs);
    return t.set(e, n), { formRefs: t };
  }),
  getFormRef: (e) => f().formRefs.get(e),
  removeFormRef: (e) => i((n) => {
    const o = new Map(n.formRefs);
    return o.delete(e), { formRefs: o };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (e) => {
    const n = f().formRefs, o = e + ".", t = /* @__PURE__ */ new Map();
    return n.forEach((s, a) => {
      (a.startsWith(o) || a === e) && t.set(a, s);
    }), t;
  }
})), u = (i) => i === null || typeof i != "object" || i instanceof Uint8Array || i instanceof Int8Array || i instanceof Uint16Array || i instanceof Int16Array || i instanceof Uint32Array || i instanceof Int32Array || i instanceof Float32Array || i instanceof Float64Array || i instanceof ArrayBuffer || i instanceof Date || i instanceof RegExp || i instanceof Map || i instanceof Set ? !1 : Array.isArray(i) || i.constructor === Object, g = b((i, f) => ({
  updateQueue: /* @__PURE__ */ new Set(),
  // A flag to ensure we only schedule the flush once per event-loop tick.
  isFlushScheduled: !1,
  // This function is called by queueMicrotask to execute all queued updates.
  flushUpdates: () => {
    const { updateQueue: e } = f();
    e.size > 0 && E(() => {
      e.forEach((n) => n());
    }), i({ updateQueue: /* @__PURE__ */ new Set(), isFlushScheduled: !1 });
  },
  addPathComponent: (e, n, o) => {
    i((t) => {
      const s = new Map(t.shadowStateStore), a = [e, ...n].join("."), r = s.get(a) || {}, S = new Set(r.pathComponents);
      S.add(o), s.set(a, { ...r, pathComponents: S });
      const c = s.get(e) || {}, p = c.components?.get(o);
      if (p) {
        const d = new Set(p.paths);
        d.add(a);
        const h = { ...p, paths: d }, w = new Map(c.components);
        w.set(o, h), s.set(e, {
          ...c,
          components: w
        });
      }
      return { shadowStateStore: s };
    });
  },
  registerComponent: (e, n, o) => {
    i((t) => {
      const s = new Map(t.shadowStateStore), a = s.get(e) || {}, r = new Map(a.components);
      return r.set(n, o), s.set(e, { ...a, components: r }), { shadowStateStore: s };
    });
  },
  unregisterComponent: (e, n) => {
    i((o) => {
      const t = new Map(o.shadowStateStore), s = t.get(e);
      if (!s?.components)
        return o;
      const a = new Map(s.components);
      return a.delete(n) ? (t.set(e, { ...s, components: a }), { shadowStateStore: t }) : o;
    });
  },
  markAsDirty: (e, n, o = { bubble: !0 }) => {
    const t = new Map(f().shadowStateStore);
    let s = !1;
    const a = (r) => {
      const S = [e, ...r].join("."), c = t.get(S);
      c && c.isDirty !== !0 ? (t.set(S, { ...c, isDirty: !0 }), s = !0) : c || (t.set(S, { isDirty: !0 }), s = !0);
    };
    if (a(n), o.bubble) {
      let r = [...n];
      for (; r.length > 0; )
        r.pop(), a(r);
    }
    s && i({ shadowStateStore: t });
  },
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (e, n) => {
    i((o) => {
      const t = new Map(o.serverStateUpdates);
      return t.set(e, n), { serverStateUpdates: t };
    }), f().notifyPathSubscribers(e, {
      type: "SERVER_STATE_UPDATE",
      serverState: n
    });
  },
  shadowStateStore: /* @__PURE__ */ new Map(),
  getShadowNode: (e) => f().shadowStateStore.get(e),
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (e, n) => {
    const o = f().pathSubscribers, t = o.get(e) || /* @__PURE__ */ new Set();
    return t.add(n), o.set(e, t), () => {
      const s = f().pathSubscribers.get(e);
      s && (s.delete(n), s.size === 0 && f().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, n) => {
    const t = f().pathSubscribers.get(e);
    t && t.forEach((s) => s(n));
  },
  initializeShadowState: (e, n) => {
    i((o) => {
      const t = new Map(o.shadowStateStore), a = t.get(e)?.components, r = e + ".";
      for (const c of Array.from(t.keys()))
        (c === e || c.startsWith(r)) && t.delete(c);
      const S = (c, p) => {
        const d = [e, ...p].join(".");
        if (Array.isArray(c)) {
          const h = [];
          c.forEach(() => {
            const w = `id:${m()}`;
            h.push(d + "." + w);
          }), t.set(d, { arrayKeys: h }), c.forEach((w, y) => {
            const l = h[y].split(".").pop();
            S(w, [...p, l]);
          });
        } else if (u(c)) {
          const h = Object.fromEntries(
            Object.keys(c).map((w) => [w, d + "." + w])
          );
          t.set(d, { fields: h }), Object.keys(c).forEach((w) => {
            S(c[w], [...p, w]);
          });
        } else
          t.set(d, { value: c });
      };
      if (S(n, []), a) {
        const c = t.get(e) || {};
        t.set(e, {
          ...c,
          components: a
        });
      }
      return { shadowStateStore: t };
    });
  },
  getShadowValue: (e, n) => {
    const o = /* @__PURE__ */ new Map(), t = (s, a) => {
      if (o.has(s))
        return o.get(s);
      const r = f().shadowStateStore.get(s);
      if (!r)
        return;
      if (r.value !== void 0)
        return r.value;
      let S;
      if (r.arrayKeys) {
        const c = a ?? r.arrayKeys;
        S = [], o.set(s, S), c.forEach((p) => {
          S.push(t(p));
        });
      } else r.fields ? (S = {}, o.set(s, S), Object.entries(r.fields).forEach(([c, p]) => {
        S[c] = t(p);
      })) : S = void 0;
      return S;
    };
    return t(e, n);
  },
  getShadowMetadata: (e, n, o) => {
    const t = [e, ...n].join(".");
    return f().shadowStateStore.get(t), f().shadowStateStore.get(t);
  },
  setShadowMetadata: (e, n, o) => {
    const t = [e, ...n].join("."), s = f().shadowStateStore.get(t);
    s?.components && !o.components && (console.group(
      "%c🚨 RACE CONDITION DETECTED! 🚨",
      "color: red; font-size: 18px; font-weight: bold;"
    ), console.error(
      `An overwrite is about to happen on stateKey: "${e}" at path: [${n.join(", ")}]`
    ), console.log(
      "The EXISTING metadata had a components map:",
      s.components
    ), console.log(
      "The NEW metadata is trying to save WITHOUT a components map:",
      o
    ), console.log(
      "%cStack trace to the function that caused this overwrite:",
      "font-weight: bold;"
    ), console.trace(), console.groupEnd());
    const a = new Map(f().shadowStateStore), r = { ...s || {}, ...o };
    a.set(t, r), i({ shadowStateStore: a });
  },
  setTransformCache: (e, n, o, t) => {
    const s = [e, ...n].join("."), a = new Map(f().shadowStateStore), r = a.get(s) || {};
    r.transformCaches || (r.transformCaches = /* @__PURE__ */ new Map()), r.transformCaches.set(o, t), a.set(s, r), i({ shadowStateStore: a });
  },
  insertShadowArrayElement: (e, n, o) => {
    const t = new Map(f().shadowStateStore), s = [e, ...n].join("."), a = t.get(s);
    if (!a || !a.arrayKeys) return;
    const r = `id:${m()}`, S = s + "." + r, c = [...a.arrayKeys];
    c.push(S), t.set(s, { ...a, arrayKeys: c });
    const p = (d, h) => {
      const w = [e, ...h].join(".");
      if (!Array.isArray(d)) if (typeof d == "object" && d !== null) {
        const y = Object.fromEntries(
          Object.keys(d).map((l) => [l, w + "." + l])
        );
        t.set(w, { fields: y }), Object.entries(d).forEach(([l, M]) => {
          p(M, [...h, l]);
        });
      } else
        t.set(w, { value: d });
    };
    p(o, [...n, r]), i({ shadowStateStore: t }), f().notifyPathSubscribers(s, {
      type: "INSERT",
      path: s,
      itemKey: S
    });
  },
  removeShadowArrayElement: (e, n) => {
    const o = new Map(f().shadowStateStore), t = [e, ...n].join("."), s = n.slice(0, -1), a = [e, ...s].join("."), r = o.get(a);
    if (r && r.arrayKeys && r.arrayKeys.findIndex(
      (c) => c === t
    ) !== -1) {
      const c = r.arrayKeys.filter(
        (d) => d !== t
      );
      o.set(a, {
        ...r,
        arrayKeys: c
      });
      const p = t + ".";
      for (const d of Array.from(o.keys()))
        (d === t || d.startsWith(p)) && o.delete(d);
    }
    i({ shadowStateStore: o }), f().notifyPathSubscribers(a, {
      type: "REMOVE",
      path: a,
      itemKey: t
      // The exact ID of the removed item
    });
  },
  updateShadowAtPath: (e, n, o) => {
    const t = new Map(f().shadowStateStore), s = [e, ...n].join("."), a = (r, S) => {
      const c = t.get(r);
      if (u(S) && c && c.fields) {
        for (const p in S)
          if (Object.prototype.hasOwnProperty.call(S, p)) {
            const d = c.fields[p], h = S[p];
            d && a(d, h);
          }
      } else {
        const p = t.get(r) || {};
        t.set(r, { ...p, value: S });
      }
    };
    a(s, o), f().notifyPathSubscribers(s, { type: "UPDATE", newValue: o }), i({ shadowStateStore: t });
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, n) => {
    const o = f().selectedIndicesMap.get(e);
    if (!o) return -1;
    const t = n || g.getState().getShadowMetadata(e, [])?.arrayKeys;
    return t ? t.indexOf(o) : -1;
  },
  setSelectedIndex: (e, n) => {
    i((o) => {
      const t = o.selectedIndicesMap;
      return n === void 0 ? t.delete(e) : (t.has(e) && f().notifyPathSubscribers(t.get(e), {
        type: "THIS_UNSELECTED"
      }), t.set(e, n), f().notifyPathSubscribers(n, {
        type: "THIS_SELECTED"
      })), f().notifyPathSubscribers(e, {
        type: "GET_SELECTED"
      }), {
        ...o,
        selectedIndicesMap: t
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: e }) => {
    i((n) => {
      const o = n.selectedIndicesMap, t = o.get(e);
      return t && f().notifyPathSubscribers(t, {
        type: "CLEAR_SELECTION"
      }), o.delete(e), f().notifyPathSubscribers(e, {
        type: "CLEAR_SELECTION"
      }), {
        ...n,
        selectedIndicesMap: o
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    i((n) => {
      const o = new Map(n.selectedIndicesMap);
      return o.delete(e) ? { selectedIndicesMap: o } : {};
    });
  },
  initialStateOptions: {},
  stateTimeline: {},
  cogsStateStore: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  validationErrors: /* @__PURE__ */ new Map(),
  addStateLog: (e, n) => {
    i((o) => {
      const t = new Map(o.stateLog), s = new Map(t.get(e)), a = JSON.stringify(n.path), r = s.get(a);
      return r ? (r.newValue = n.newValue, r.timeStamp = n.timeStamp) : s.set(a, { ...n }), t.set(e, s), { stateLog: t };
    });
  },
  getInitialOptions: (e) => f().initialStateOptions[e],
  setInitialStateOptions: (e, n) => {
    i((o) => ({
      initialStateOptions: {
        ...o.initialStateOptions,
        [e]: n
      }
    }));
  },
  updateInitialStateGlobal: (e, n) => {
    i((o) => ({
      initialStateGlobal: {
        ...o.initialStateGlobal,
        [e]: n
      }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, n) => i((o) => {
    const t = new Map(o.syncInfoStore);
    return t.set(e, n), { ...o, syncInfoStore: t };
  }),
  getSyncInfo: (e) => f().syncInfoStore.get(e) || null
}));
export {
  O as formRefStore,
  g as getGlobalStore
};
//# sourceMappingURL=store.js.map
