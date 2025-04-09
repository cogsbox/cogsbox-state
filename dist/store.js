import { create as d } from "./node_modules/zustand/esm/react.js";
const m = d((o, i) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, r) => o((t) => {
    const n = new Map(t.formRefs);
    return n.set(e, r), { formRefs: n };
  }),
  getFormRef: (e) => i().formRefs.get(e),
  removeFormRef: (e) => o((r) => {
    const t = new Map(r.formRefs);
    return t.delete(e), { formRefs: t };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (e) => {
    const r = i().formRefs, t = e + ".", n = /* @__PURE__ */ new Map();
    return r.forEach((s, a) => {
      (a.startsWith(t) || a === e) && n.set(a, s);
    }), n;
  }
})), v = d((o, i) => ({
  stateComponents: /* @__PURE__ */ new Map(),
  subscribe: (e) => i().subscribe(e),
  reactiveDeps: {},
  setReactiveDeps: (e, r) => o((t) => ({
    ...t,
    reactiveDeps: {
      ...t.reactiveDeps,
      [e]: r
    }
  })),
  deleteReactiveDeps: (e) => o((r) => {
    const { [e]: t, ...n } = r.reactiveDeps;
    return {
      ...r,
      reactiveDeps: n
    };
  }),
  reRenderTriggerPrevValue: {},
  signalDomElements: /* @__PURE__ */ new Map(),
  addSignalElement: (e, r) => {
    const t = i().signalDomElements;
    t.has(e) || t.set(e, /* @__PURE__ */ new Set()), t.get(e).add(r), o({ signalDomElements: new Map(t) });
  },
  removeSignalElement: (e, r) => {
    const t = i().signalDomElements, n = t.get(e);
    n && n.forEach((s) => {
      s.instanceId === r && n.delete(s);
    }), o({ signalDomElements: new Map(t) });
  },
  initialStateOptions: {},
  updaterState: {},
  stateTimeline: {},
  cogsStateStore: {},
  stateLog: {},
  isLoadingGlobal: {},
  initialStateGlobal: {},
  validationErrors: /* @__PURE__ */ new Map(),
  serverState: {},
  serverSyncActions: {},
  serverSyncLog: {},
  serverSideOrNot: {},
  setServerSyncLog: (e, r) => {
    o((t) => ({
      serverSyncLog: {
        ...t.serverSyncLog,
        [e]: [...t.serverSyncLog[e] ?? [], r]
      }
    }));
  },
  setServerSideOrNot: (e, r) => {
    o((t) => ({
      serverSideOrNot: {
        ...t.serverSideOrNot,
        [e]: r
      }
    }));
  },
  getServerSideOrNot: (e) => i().serverSideOrNot[e],
  getThisLocalUpdate: (e) => i().stateLog[e],
  setServerState: (e, r) => {
    o((t) => ({
      serverState: {
        ...t.serverState,
        [e]: r
      }
    }));
  },
  setStateLog: (e, r) => {
    o((t) => {
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
    o((t) => ({
      isLoadingGlobal: {
        ...t.isLoadingGlobal,
        [e]: r
      }
    }));
  },
  setServerSyncActions: (e, r) => {
    o((t) => ({
      serverSyncActions: {
        ...t.serverSyncActions,
        [e]: r
      }
    }));
  },
  addValidationError: (e, r) => {
    o((t) => {
      const n = new Map(t.validationErrors), s = n.get(e) || [];
      return n.set(e, [...s, r]), { validationErrors: n };
    });
  },
  removeValidationError: (e) => {
    o((r) => {
      const t = new Map(r.validationErrors);
      let n = !1;
      const s = e.split(".");
      return Array.from(t.keys()).forEach((a) => {
        const c = a.split(".");
        if (c.length >= s.length) {
          let f = !0;
          for (let l = 0; l < s.length; l++)
            if (c[l] !== s[l]) {
              f = !1;
              break;
            }
          f && (n = !0, t.delete(a));
        }
      }), n ? { validationErrors: t } : r;
    });
  },
  getValidationErrors: (e) => {
    const r = [], t = i().validationErrors, n = e.split("."), s = (a, c) => a === "[*]" ? !0 : Array.isArray(a) ? a.includes(parseInt(c)) : a === c;
    return Array.from(t.keys()).forEach((a) => {
      const c = a.split(".");
      if (c.length >= n.length) {
        let f = !0;
        for (let l = 0; l < n.length; l++) {
          const S = n[l], u = c[l];
          if (S === "[*]" || Array.isArray(S)) {
            const g = parseInt(u);
            if (isNaN(g)) {
              f = !1;
              break;
            }
            if (!s(S, u)) {
              f = !1;
              break;
            }
          } else if (S !== u) {
            f = !1;
            break;
          }
        }
        if (f) {
          const l = t.get(a);
          l && r.push(...l);
        }
      }
    }), r;
  },
  getInitialOptions: (e) => i().initialStateOptions[e],
  getNestedState: (e, r) => {
    const t = i().cogsStateStore[e], n = (s, a) => {
      if (a.length === 0) return s;
      const c = a[0], f = a.slice(1);
      if (c === "[*]") {
        if (!Array.isArray(s)) {
          console.warn("Asterisk notation used on non-array value");
          return;
        }
        if (f.length === 0) return s;
        const S = s.map(
          (u) => n(u, f)
        );
        return Array.isArray(S[0]) ? S.flat() : S;
      }
      const l = s[c];
      if (l !== void 0)
        return n(l, f);
    };
    return n(t, r);
  },
  setInitialStateOptions: (e, r) => {
    o((t) => ({
      initialStateOptions: {
        ...t.initialStateOptions,
        [e]: r
      }
    }));
  },
  updateInitialStateGlobal: (e, r) => {
    o((t) => ({
      initialStateGlobal: {
        ...t.initialStateGlobal,
        [e]: r
      }
    }));
  },
  getUpdaterState: (e) => i().updaterState[e],
  setUpdaterState: (e, r) => {
    const t = i().updaterState;
    !e || !r || o({ updaterState: { ...t ?? {}, [e]: r } });
  },
  getKeyState: (e) => i().cogsStateStore[e],
  setState: (e, r) => {
    o((t) => ({
      cogsStateStore: {
        ...t.cogsStateStore,
        [e]: typeof r == "function" ? r(t.cogsStateStore[e]) : r
      }
    }));
  },
  setInitialStates: (e) => {
    o((r) => ({
      cogsStateStore: {
        ...r.cogsStateStore,
        ...e
      }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, r) => o((t) => {
    const n = new Map(t.syncInfoStore);
    return n.set(e, r), { ...t, syncInfoStore: n };
  }),
  getSyncInfo: (e) => i().syncInfoStore.get(e) || null
}));
export {
  m as formRefStore,
  v as getGlobalStore
};
//# sourceMappingURL=store.js.map
