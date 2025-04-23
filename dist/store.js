import { create as u } from "./node_modules/zustand/esm/react.js";
const v = u((a, i) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, r) => a((t) => {
    const n = new Map(t.formRefs);
    return n.set(e, r), { formRefs: n };
  }),
  getFormRef: (e) => i().formRefs.get(e),
  removeFormRef: (e) => a((r) => {
    const t = new Map(r.formRefs);
    return t.delete(e), { formRefs: t };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (e) => {
    const r = i().formRefs, t = e + ".", n = /* @__PURE__ */ new Map();
    return r.forEach((o, s) => {
      (s.startsWith(t) || s === e) && n.set(s, o);
    }), n;
  }
})), m = u((a, i) => ({
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  // Add the new methods
  getSelectedIndex: (e, r) => {
    const t = i().selectedIndicesMap.get(e);
    if (t)
      return t.get(r);
  },
  setSelectedIndex: (e, r, t) => {
    a((n) => {
      const o = new Map(n.selectedIndicesMap);
      let s = o.get(e);
      return s || (s = /* @__PURE__ */ new Map(), o.set(e, s)), t === void 0 ? s.delete(r) : s.set(r, t), {
        ...n,
        selectedIndicesMap: o
      };
    });
  },
  stateComponents: /* @__PURE__ */ new Map(),
  subscribe: (e) => i().subscribe(e),
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
    const t = i().signalDomElements;
    t.has(e) || t.set(e, /* @__PURE__ */ new Set()), t.get(e).add(r), a({ signalDomElements: new Map(t) });
  },
  removeSignalElement: (e, r) => {
    const t = i().signalDomElements, n = t.get(e);
    n && n.forEach((o) => {
      o.instanceId === r && n.delete(o);
    }), a({ signalDomElements: new Map(t) });
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
  getServerSideOrNot: (e) => i().serverSideOrNot[e],
  getThisLocalUpdate: (e) => i().stateLog[e],
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
      const n = t.stateLog[e] ?? [], o = r(n);
      return {
        stateLog: {
          ...t.stateLog,
          [e]: o
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
      const n = new Map(t.validationErrors), o = n.get(e) || [];
      return console.log("addValidationError", e, r, o), n.set(e, [...o, r]), { validationErrors: n };
    });
  },
  removeValidationError: (e) => {
    a((r) => {
      const t = new Map(r.validationErrors);
      let n = !1;
      const o = e.split(".");
      return Array.from(t.keys()).forEach((s) => {
        const c = s.split(".");
        if (c.length >= o.length) {
          let f = !0;
          for (let l = 0; l < o.length; l++)
            if (c[l] !== o[l]) {
              f = !1;
              break;
            }
          f && (n = !0, t.delete(s));
        }
      }), n ? { validationErrors: t } : r;
    });
  },
  getValidationErrors: (e) => {
    const r = [], t = i().validationErrors, n = e.split("."), o = (s, c) => s === "[*]" ? !0 : Array.isArray(s) ? s.includes(parseInt(c)) : s === c;
    return Array.from(t.keys()).forEach((s) => {
      const c = s.split(".");
      if (c.length >= n.length) {
        let f = !0;
        for (let l = 0; l < n.length; l++) {
          const S = n[l], d = c[l];
          if (S === "[*]" || Array.isArray(S)) {
            const g = parseInt(d);
            if (isNaN(g)) {
              f = !1;
              break;
            }
            if (!o(S, d)) {
              f = !1;
              break;
            }
          } else if (S !== d) {
            f = !1;
            break;
          }
        }
        if (f) {
          const l = t.get(s);
          l && r.push(...l);
        }
      }
    }), r;
  },
  getInitialOptions: (e) => i().initialStateOptions[e],
  getNestedState: (e, r) => {
    const t = i().cogsStateStore[e], n = (o, s) => {
      if (s.length === 0) return o;
      const c = s[0], f = s.slice(1);
      if (c === "[*]") {
        if (!Array.isArray(o)) {
          console.warn("Asterisk notation used on non-array value");
          return;
        }
        if (f.length === 0) return o;
        const S = o.map(
          (d) => n(d, f)
        );
        return Array.isArray(S[0]) ? S.flat() : S;
      }
      const l = o[c];
      if (l !== void 0)
        return n(l, f);
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
  getUpdaterState: (e) => i().updaterState[e],
  setUpdaterState: (e, r) => {
    const t = i().updaterState;
    !e || !r || a({ updaterState: { ...t ?? {}, [e]: r } });
  },
  getKeyState: (e) => i().cogsStateStore[e],
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
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, r) => a((t) => {
    const n = new Map(t.syncInfoStore);
    return n.set(e, r), { ...t, syncInfoStore: n };
  }),
  getSyncInfo: (e) => i().syncInfoStore.get(e) || null
}));
export {
  v as formRefStore,
  m as getGlobalStore
};
//# sourceMappingURL=store.js.map
