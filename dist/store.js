import { create as M } from "zustand";
import { ulid as b } from "ulid";
import { startTransition as g } from "react";
const j = M((f, c) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, s) => f((o) => {
    const t = new Map(o.formRefs);
    return t.set(e, s), { formRefs: t };
  }),
  getFormRef: (e) => c().formRefs.get(e),
  removeFormRef: (e) => f((s) => {
    const o = new Map(s.formRefs);
    return o.delete(e), { formRefs: o };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (e) => {
    const s = c().formRefs, o = e + ".", t = /* @__PURE__ */ new Map();
    return s.forEach((n, a) => {
      (a.startsWith(o) || a === e) && t.set(a, n);
    }), t;
  }
})), m = (f) => f === null || typeof f != "object" ? !1 : !!(Array.isArray(f) || f.constructor === Object), E = M((f, c) => ({
  updateQueue: /* @__PURE__ */ new Set(),
  // A flag to ensure we only schedule the flush once per event-loop tick.
  isFlushScheduled: !1,
  // This function is called by queueMicrotask to execute all queued updates.
  flushUpdates: () => {
    const { updateQueue: e } = c();
    e.size > 0 && g(() => {
      e.forEach((s) => s());
    }), f({ updateQueue: /* @__PURE__ */ new Set(), isFlushScheduled: !1 });
  },
  addPathComponent: (e, s, o) => {
    f((t) => {
      const n = new Map(t.shadowStateStore), a = [e, ...s].join("."), r = n.get(a) || {}, S = new Set(r.pathComponents);
      S.add(o), n.set(a, { ...r, pathComponents: S });
      const i = n.get(e) || {}, p = i.components?.get(o);
      if (p) {
        const d = new Set(p.paths);
        d.add(a);
        const h = { ...p, paths: d }, l = new Map(i.components);
        l.set(o, h), n.set(e, {
          ...i,
          components: l
        });
      }
      return { shadowStateStore: n };
    });
  },
  registerComponent: (e, s, o) => {
    f((t) => {
      const n = new Map(t.shadowStateStore), a = n.get(e) || {}, r = new Map(a.components);
      return r.set(s, o), n.set(e, { ...a, components: r }), { shadowStateStore: n };
    });
  },
  unregisterComponent: (e, s) => {
    f((o) => {
      const t = new Map(o.shadowStateStore), n = t.get(e);
      if (!n?.components)
        return o;
      const a = new Map(n.components);
      return a.delete(s) ? (t.set(e, { ...n, components: a }), { shadowStateStore: t }) : o;
    });
  },
  markAsDirty: (e, s, o = { bubble: !0 }) => {
    const { shadowStateStore: t } = c(), n = /* @__PURE__ */ new Map(), a = (r) => {
      const S = [e, ...r].join("."), i = t.get(S) || {};
      return i.isDirty === !0 ? !0 : (n.set(S, { ...i, isDirty: !0 }), !1);
    };
    if (a(s), o.bubble) {
      let r = [...s];
      for (; r.length > 0 && (r.pop(), !a(r)); )
        ;
    }
    n.size > 0 && f((r) => (n.forEach((S, i) => {
      r.shadowStateStore.set(i, S);
    }), r));
  },
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (e, s) => {
    f((o) => {
      const t = new Map(o.serverStateUpdates);
      return t.set(e, s), { serverStateUpdates: t };
    }), c().notifyPathSubscribers(e, {
      type: "SERVER_STATE_UPDATE",
      serverState: s
    });
  },
  shadowStateStore: /* @__PURE__ */ new Map(),
  getShadowNode: (e) => c().shadowStateStore.get(e),
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (e, s) => {
    const o = c().pathSubscribers, t = o.get(e) || /* @__PURE__ */ new Set();
    return t.add(s), o.set(e, t), () => {
      const n = c().pathSubscribers.get(e);
      n && (n.delete(s), n.size === 0 && c().pathSubscribers.delete(e));
    };
  },
  notifyPathSubscribers: (e, s) => {
    const t = c().pathSubscribers.get(e);
    t && t.forEach((n) => n(s));
  },
  initializeShadowState: (e, s) => {
    f((o) => {
      const t = new Map(o.shadowStateStore);
      console.log("initializeShadowState");
      const a = t.get(e)?.components, r = e + ".";
      for (const i of Array.from(t.keys()))
        (i === e || i.startsWith(r)) && t.delete(i);
      const S = (i, p) => {
        const d = [e, ...p].join(".");
        if (Array.isArray(i)) {
          const h = [];
          i.forEach(() => {
            const l = `id:${b()}`;
            h.push(d + "." + l);
          }), t.set(d, { arrayKeys: h }), i.forEach((l, u) => {
            const w = h[u].split(".").pop();
            S(l, [...p, w]);
          });
        } else if (m(i)) {
          const h = Object.fromEntries(
            Object.keys(i).map((l) => [l, d + "." + l])
          );
          t.set(d, { fields: h }), Object.keys(i).forEach((l) => {
            S(i[l], [...p, l]);
          });
        } else
          t.set(d, { value: i });
      };
      if (S(s, []), a) {
        const i = t.get(e) || {};
        t.set(e, {
          ...i,
          components: a
        });
      }
      return { shadowStateStore: t };
    });
  },
  getShadowValue: (e, s) => {
    const o = /* @__PURE__ */ new Map(), t = (n, a) => {
      if (o.has(n))
        return o.get(n);
      const r = c().shadowStateStore.get(n);
      if (!r)
        return;
      if (r.value !== void 0)
        return r.value;
      let S;
      if (r.arrayKeys) {
        const i = a ?? r.arrayKeys;
        S = [], o.set(n, S), i.forEach((p) => {
          S.push(t(p));
        });
      } else r.fields ? (S = {}, o.set(n, S), Object.entries(r.fields).forEach(([i, p]) => {
        S[i] = t(p);
      })) : S = void 0;
      return S;
    };
    return t(e, s);
  },
  getShadowMetadata: (e, s) => {
    const o = [e, ...s].join(".");
    return c().shadowStateStore.get(o);
  },
  setShadowMetadata: (e, s, o) => {
    const t = [e, ...s].join("."), n = c().shadowStateStore.get(t);
    n?.components && !o.components && (console.group(
      "%c🚨 RACE CONDITION DETECTED! 🚨",
      "color: red; font-size: 18px; font-weight: bold;"
    ), console.error(
      `An overwrite is about to happen on stateKey: "${e}" at path: [${s.join(", ")}]`
    ), console.log(
      "The EXISTING metadata had a components map:",
      n.components
    ), console.log(
      "The NEW metadata is trying to save WITHOUT a components map:",
      o
    ), console.log(
      "%cStack trace to the function that caused this overwrite:",
      "font-weight: bold;"
    ), console.trace(), console.groupEnd());
    const a = new Map(c().shadowStateStore), r = { ...n || {}, ...o };
    a.set(t, r), f({ shadowStateStore: a });
  },
  setTransformCache: (e, s, o, t) => {
    const n = [e, ...s].join("."), a = new Map(c().shadowStateStore), r = a.get(n) || {};
    r.transformCaches || (r.transformCaches = /* @__PURE__ */ new Map()), r.transformCaches.set(o, t), a.set(n, r), f({ shadowStateStore: a });
  },
  insertShadowArrayElement: (e, s, o) => {
    const t = new Map(c().shadowStateStore), n = [e, ...s].join("."), a = t.get(n);
    if (!a || !a.arrayKeys) return;
    const r = `id:${b()}`, S = n + "." + r, i = [...a.arrayKeys];
    i.push(S), t.set(n, { ...a, arrayKeys: i });
    const p = (d, h) => {
      const l = [e, ...h].join(".");
      if (!Array.isArray(d)) if (typeof d == "object" && d !== null) {
        const u = Object.fromEntries(
          Object.keys(d).map((w) => [w, l + "." + w])
        );
        t.set(l, { fields: u }), Object.entries(d).forEach(([w, y]) => {
          p(y, [...h, w]);
        });
      } else
        t.set(l, { value: d });
    };
    p(o, [...s, r]), f({ shadowStateStore: t }), c().notifyPathSubscribers(n, {
      type: "INSERT",
      path: n,
      itemKey: S
    });
  },
  removeShadowArrayElement: (e, s) => {
    const o = new Map(c().shadowStateStore), t = [e, ...s].join("."), n = s.slice(0, -1), a = [e, ...n].join("."), r = o.get(a);
    if (r && r.arrayKeys && r.arrayKeys.findIndex(
      (i) => i === t
    ) !== -1) {
      const i = r.arrayKeys.filter(
        (d) => d !== t
      );
      o.set(a, {
        ...r,
        arrayKeys: i
      });
      const p = t + ".";
      for (const d of Array.from(o.keys()))
        (d === t || d.startsWith(p)) && o.delete(d);
    }
    f({ shadowStateStore: o }), c().notifyPathSubscribers(a, {
      type: "REMOVE",
      path: a,
      itemKey: t
      // The exact ID of the removed item
    });
  },
  updateShadowAtPath: (e, s, o) => {
    const t = [e, ...s].join(".");
    c().shadowStateStore.get(t)?.value === o && !m(o) || f((a) => {
      const r = a.shadowStateStore;
      if (m(o)) {
        const S = (i, p) => {
          const d = [e, ...i].join("."), h = r.get(d);
          if (h && h.fields) {
            for (const l in p)
              if (Object.prototype.hasOwnProperty.call(p, l)) {
                const u = p[l], w = h.fields[l];
                if (w)
                  if (m(u))
                    S(
                      w.split(".").slice(1),
                      u
                    );
                  else {
                    const y = r.get(w) || {};
                    r.set(w, {
                      ...y,
                      value: u
                    });
                  }
              }
          }
        };
        S(s, o);
      } else {
        const S = r.get(t) || {};
        r.set(t, { ...S, value: o });
      }
      return c().notifyPathSubscribers(t, { type: "UPDATE", newValue: o }), a;
    });
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (e, s) => {
    const o = c().selectedIndicesMap.get(e);
    if (!o) return -1;
    const t = s || E.getState().getShadowMetadata(e, [])?.arrayKeys;
    return t ? t.indexOf(o) : -1;
  },
  setSelectedIndex: (e, s) => {
    f((o) => {
      const t = o.selectedIndicesMap;
      return s === void 0 ? t.delete(e) : (t.has(e) && c().notifyPathSubscribers(t.get(e), {
        type: "THIS_UNSELECTED"
      }), t.set(e, s), c().notifyPathSubscribers(s, {
        type: "THIS_SELECTED"
      })), c().notifyPathSubscribers(e, {
        type: "GET_SELECTED"
      }), {
        ...o,
        selectedIndicesMap: t
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: e }) => {
    f((s) => {
      const o = s.selectedIndicesMap, t = o.get(e);
      return t && c().notifyPathSubscribers(t, {
        type: "CLEAR_SELECTION"
      }), o.delete(e), c().notifyPathSubscribers(e, {
        type: "CLEAR_SELECTION"
      }), {
        ...s,
        selectedIndicesMap: o
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    f((s) => {
      const o = new Map(s.selectedIndicesMap);
      return o.delete(e) ? { selectedIndicesMap: o } : {};
    });
  },
  initialStateOptions: {},
  stateTimeline: {},
  cogsStateStore: {},
  stateLog: /* @__PURE__ */ new Map(),
  initialStateGlobal: {},
  validationErrors: /* @__PURE__ */ new Map(),
  addStateLog: (e, s) => {
    f((o) => {
      const t = new Map(o.stateLog), n = new Map(t.get(e)), a = JSON.stringify(s.path), r = n.get(a);
      return r ? (r.newValue = s.newValue, r.timeStamp = s.timeStamp) : n.set(a, { ...s }), t.set(e, n), { stateLog: t };
    });
  },
  getInitialOptions: (e) => c().initialStateOptions[e],
  setInitialStateOptions: (e, s) => {
    f((o) => ({
      initialStateOptions: {
        ...o.initialStateOptions,
        [e]: s
      }
    }));
  },
  updateInitialStateGlobal: (e, s) => {
    f((o) => ({
      initialStateGlobal: {
        ...o.initialStateGlobal,
        [e]: s
      }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, s) => f((o) => {
    const t = new Map(o.syncInfoStore);
    return t.set(e, s), { ...o, syncInfoStore: t };
  }),
  getSyncInfo: (e) => c().syncInfoStore.get(e) || null
}));
export {
  j as formRefStore,
  E as getGlobalStore
};
//# sourceMappingURL=store.js.map
