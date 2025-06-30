import { create as h } from "zustand";
import { ulid as u } from "ulid";
const b = h((a, l) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, r) => a((t) => {
    const n = new Map(t.formRefs);
    return n.set(e, r), { formRefs: n };
  }),
  getFormRef: (e) => l().formRefs.get(e),
  removeFormRef: (e) => a((r) => {
    const t = new Map(r.formRefs);
    return t.delete(e), { formRefs: t };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (e) => {
    const r = l().formRefs, t = e + ".", n = /* @__PURE__ */ new Map();
    return r.forEach((s, o) => {
      (o.startsWith(t) || o === e) && n.set(o, s);
    }), n;
  }
})), I = h((a, l) => ({
  shadowStateStore: /* @__PURE__ */ new Map(),
  shadowStateSubscribers: /* @__PURE__ */ new Map(),
  subscribeToShadowState: (e, r) => (a((t) => {
    const n = new Map(t.shadowStateSubscribers), s = n.get(e) || /* @__PURE__ */ new Set();
    return s.add(r), n.set(e, s), { shadowStateSubscribers: n };
  }), () => {
    a((t) => {
      const n = new Map(t.shadowStateSubscribers), s = n.get(e);
      return s && (s.delete(r), s.size === 0 && n.delete(e)), { shadowStateSubscribers: n };
    });
  }),
  initializeShadowState: (e, r) => {
    const t = /* @__PURE__ */ new Map(), n = (s, o) => {
      const d = [e, ...o].join(".");
      if (Array.isArray(s)) {
        const i = [];
        s.forEach((c) => {
          typeof c == "object" && c !== null && !c.id && (c.id = u());
          const f = `id:${c.id}`;
          i.push(f);
          const p = [...o, f];
          n(c, p);
        });
        const S = {
          id: u(),
          arrayKeys: i
        };
        t.set(d, S);
      } else typeof s == "object" && s !== null ? (t.set(d, { id: u() }), Object.keys(s).forEach((i) => {
        n(s[i], [...o, i]);
      })) : t.set(d, { id: u() });
    };
    n(r, []), a({ shadowStateStore: t });
  },
  getShadowMetadata: (e, r) => {
    const t = [e, ...r].join(".");
    return l().shadowStateStore.get(t);
  },
  setShadowMetadata: (e, r, t) => {
    const n = [e, ...r].join("."), s = new Map(l().shadowStateStore), o = s.get(n) || { id: u() };
    s.set(n, { ...o, ...t }), a({ shadowStateStore: s }), t.virtualizer?.itemHeight && l().shadowStateSubscribers.get(e)?.forEach((i) => i());
  },
  insertShadowArrayElement: (e, r, t) => {
    const n = new Map(l().shadowStateStore), s = [e, ...r].join("."), o = n.get(s), d = l().getNestedState(e, r);
    if (!o || !o.arrayKeys) return;
    const i = `id:${t.id}`, S = d.findIndex((p) => p.id === t.id);
    if (S === -1) return;
    const c = [...o.arrayKeys];
    c.splice(S, 0, i), n.set(s, { ...o, arrayKeys: c });
    const f = (p, w) => {
      const g = [e, ...w].join(".");
      typeof p == "object" && p !== null ? (n.set(g, { id: u() }), Object.keys(p).forEach((y) => {
        f(p[y], [...w, y]);
      })) : n.set(g, { id: u() });
    };
    f(t, [...r, i]), a({ shadowStateStore: n });
  },
  removeShadowArrayElement: (e, r) => {
    const t = new Map(l().shadowStateStore), n = [e, ...r].join("."), s = r[r.length - 1], o = r.slice(0, -1), d = [e, ...o].join("."), i = t.get(d);
    if (i && i.arrayKeys) {
      const c = i.arrayKeys.filter(
        (f) => f !== s
      );
      t.set(d, { ...i, arrayKeys: c });
    }
    const S = n + ".";
    for (const c of Array.from(t.keys()))
      (c === n || c.startsWith(S)) && t.delete(c);
    a({ shadowStateStore: t });
  },
  updateShadowAtPath: (e, r, t) => {
    const n = [e, ...r].join("."), s = new Map(l().shadowStateStore), o = s.get(n) || { id: u() };
    s.set(n, { ...o, lastUpdated: Date.now() }), a({ shadowStateStore: s });
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  // Add the new methods
  getSelectedIndex: (e, r) => {
    const t = l().selectedIndicesMap.get(e);
    if (t)
      return t.get(r);
  },
  setSelectedIndex: (e, r, t) => {
    a((n) => {
      const s = new Map(n.selectedIndicesMap);
      let o = s.get(e);
      return o || (o = /* @__PURE__ */ new Map(), s.set(e, o)), t === void 0 ? o.delete(r) : o.set(r, t), {
        ...n,
        selectedIndicesMap: s
      };
    });
  },
  clearSelectedIndex: ({
    stateKey: e,
    path: r
  }) => {
    a((t) => {
      const n = new Map(t.selectedIndicesMap), s = n.get(e);
      if (!s) return t;
      const o = r.join(".");
      return s.delete(o), {
        ...t,
        selectedIndicesMap: n
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    a((r) => {
      const t = new Map(r.selectedIndicesMap);
      return t.delete(e) ? (console.log(
        `Cleared selected indices map entry for stateKey: ${e}`
      ), { selectedIndicesMap: t }) : {};
    });
  },
  stateComponents: /* @__PURE__ */ new Map(),
  subscribe: (e) => l().subscribe(e),
  reactiveDeps: {},
  setReactiveDeps: (e, r) => a((t) => ({
    ...t,
    reactiveDeps: {
      ...t.reactiveDeps,
      [e]: r
    }
  })),
  deleteReactiveDeps: (e) => a((r) => {
    const { [e]: t, ...n } = r.reactiveDeps;
    return {
      ...r,
      reactiveDeps: n
    };
  }),
  reRenderTriggerPrevValue: {},
  signalDomElements: /* @__PURE__ */ new Map(),
  addSignalElement: (e, r) => {
    const t = l().signalDomElements;
    t.has(e) || t.set(e, /* @__PURE__ */ new Set()), t.get(e).add(r), a({ signalDomElements: new Map(t) });
  },
  removeSignalElement: (e, r) => {
    const t = l().signalDomElements, n = t.get(e);
    n && n.forEach((s) => {
      s.instanceId === r && n.delete(s);
    }), a({ signalDomElements: new Map(t) });
  },
  initialStateOptions: {},
  updaterState: {},
  stateTimeline: {},
  cogsStateStore: {},
  stateLog: {},
  isLoadingGlobal: {},
  initialStateGlobal: {},
  iniitialCreatedState: {},
  updateInitialCreatedState: (e, r) => {
    a((t) => ({
      iniitialCreatedState: {
        ...t.iniitialCreatedState,
        [e]: r
      }
    }));
  },
  validationErrors: /* @__PURE__ */ new Map(),
  serverState: {},
  serverSyncActions: {},
  serverSyncLog: {},
  serverSideOrNot: {},
  setServerSyncLog: (e, r) => {
    a((t) => ({
      serverSyncLog: {
        ...t.serverSyncLog,
        [e]: [...t.serverSyncLog[e] ?? [], r]
      }
    }));
  },
  setServerSideOrNot: (e, r) => {
    a((t) => ({
      serverSideOrNot: {
        ...t.serverSideOrNot,
        [e]: r
      }
    }));
  },
  getServerSideOrNot: (e) => l().serverSideOrNot[e],
  getThisLocalUpdate: (e) => l().stateLog[e],
  setServerState: (e, r) => {
    a((t) => ({
      serverState: {
        ...t.serverState,
        [e]: r
      }
    }));
  },
  setStateLog: (e, r) => {
    a((t) => {
      const n = t.stateLog[e] ?? [], s = r(n);
      return {
        stateLog: {
          ...t.stateLog,
          [e]: s
        }
      };
    });
  },
  setIsLoadingGlobal: (e, r) => {
    a((t) => ({
      isLoadingGlobal: {
        ...t.isLoadingGlobal,
        [e]: r
      }
    }));
  },
  setServerSyncActions: (e, r) => {
    a((t) => ({
      serverSyncActions: {
        ...t.serverSyncActions,
        [e]: r
      }
    }));
  },
  addValidationError: (e, r) => {
    console.log("addValidationError---"), a((t) => {
      const n = new Map(t.validationErrors), s = n.get(e) || [];
      return console.log("addValidationError", e, r, s), n.set(e, [...s, r]), { validationErrors: n };
    });
  },
  removeValidationError: (e) => {
    a((r) => {
      const t = new Map(r.validationErrors);
      let n = !1;
      const s = e.split(".");
      return Array.from(t.keys()).forEach((o) => {
        const d = o.split(".");
        if (d.length >= s.length) {
          let i = !0;
          for (let S = 0; S < s.length; S++)
            if (d[S] !== s[S]) {
              i = !1;
              break;
            }
          i && (n = !0, t.delete(o));
        }
      }), n ? { validationErrors: t } : r;
    });
  },
  getValidationErrors: (e) => {
    const r = [], t = l().validationErrors, n = e.split("."), s = (o, d) => o === "[*]" ? !0 : Array.isArray(o) ? o.includes(parseInt(d)) : o === d;
    return Array.from(t.keys()).forEach((o) => {
      const d = o.split(".");
      if (d.length >= n.length) {
        let i = !0;
        for (let S = 0; S < n.length; S++) {
          const c = n[S], f = d[S];
          if (c === "[*]" || Array.isArray(c)) {
            const p = parseInt(f);
            if (isNaN(p)) {
              i = !1;
              break;
            }
            if (!s(c, f)) {
              i = !1;
              break;
            }
          } else if (c !== f) {
            i = !1;
            break;
          }
        }
        if (i) {
          const S = t.get(o);
          S && r.push(...S);
        }
      }
    }), r;
  },
  getInitialOptions: (e) => l().initialStateOptions[e],
  getNestedState: (e, r) => {
    const t = l().cogsStateStore[e], n = (s, o) => {
      if (o.length === 0 || s === void 0)
        return s;
      const d = o[0], i = o.slice(1);
      if (Array.isArray(s) && typeof d == "string" && d.startsWith("id:")) {
        const c = d.split(":")[1], f = s.find(
          (p) => p && String(p.id) === c
        );
        return n(f, i);
      }
      if (d === "[*]") {
        if (!Array.isArray(s)) {
          console.warn("Asterisk notation used on non-array value");
          return;
        }
        if (i.length === 0) return s;
        const c = s.map((f) => n(f, i));
        return Array.isArray(c[0]) ? c.flat() : c;
      }
      const S = s[d];
      return n(S, i);
    };
    return n(t, r);
  },
  setInitialStateOptions: (e, r) => {
    a((t) => ({
      initialStateOptions: {
        ...t.initialStateOptions,
        [e]: r
      }
    }));
  },
  updateInitialStateGlobal: (e, r) => {
    a((t) => ({
      initialStateGlobal: {
        ...t.initialStateGlobal,
        [e]: r
      }
    }));
  },
  getUpdaterState: (e) => l().updaterState[e],
  setUpdaterState: (e, r) => {
    const t = l().updaterState;
    !e || !r || a({ updaterState: { ...t ?? {}, [e]: r } });
  },
  getKeyState: (e) => l().cogsStateStore[e],
  setState: (e, r) => {
    a((t) => ({
      cogsStateStore: {
        ...t.cogsStateStore,
        [e]: typeof r == "function" ? r(t.cogsStateStore[e]) : r
      }
    }));
  },
  setInitialStates: (e) => {
    a((r) => ({
      cogsStateStore: {
        ...r.cogsStateStore,
        ...e
      }
    }));
  },
  setCreatedState: (e) => {
    a((r) => ({
      iniitialCreatedState: {
        ...r.cogsStateStore,
        ...e
      }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, r) => a((t) => {
    const n = new Map(t.syncInfoStore);
    return n.set(e, r), { ...t, syncInfoStore: n };
  }),
  getSyncInfo: (e) => l().syncInfoStore.get(e) || null
}));
export {
  b as formRefStore,
  I as getGlobalStore
};
//# sourceMappingURL=store.js.map
