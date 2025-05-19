import { create as p } from "./node_modules/zustand/esm/react.js";
const v = p((o, i) => ({
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
    return r.forEach((a, s) => {
      (s.startsWith(t) || s === e) && n.set(s, a);
    }), n;
  }
})), m = p((o, i) => ({
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  // Add the new methods
  getSelectedIndex: (e, r) => {
    const t = i().selectedIndicesMap.get(e);
    if (t)
      return t.get(r);
  },
  setSelectedIndex: (e, r, t) => {
    o((n) => {
      const a = new Map(n.selectedIndicesMap);
      let s = a.get(e);
      return s || (s = /* @__PURE__ */ new Map(), a.set(e, s)), t === void 0 ? s.delete(r) : s.set(r, t), {
        ...n,
        selectedIndicesMap: a
      };
    });
  },
  clearSelectedIndex: ({
    stateKey: e,
    path: r
  }) => {
    o((t) => {
      const n = new Map(t.selectedIndicesMap), a = n.get(e);
      if (!a) return t;
      const s = r.join(".");
      return a.delete(s), {
        ...t,
        selectedIndicesMap: n
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    o((r) => {
      const t = new Map(r.selectedIndicesMap);
      return t.delete(e) ? (console.log(
        `Cleared selected indices map entry for stateKey: ${e}`
      ), { selectedIndicesMap: t }) : {};
    });
  },
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
    n && n.forEach((a) => {
      a.instanceId === r && n.delete(a);
    }), o({ signalDomElements: new Map(t) });
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
    o((t) => ({
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
      const n = t.stateLog[e] ?? [], a = r(n);
      return {
        stateLog: {
          ...t.stateLog,
          [e]: a
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
    console.log("addValidationError---"), o((t) => {
      const n = new Map(t.validationErrors), a = n.get(e) || [];
      return console.log("addValidationError", e, r, a), n.set(e, [...a, r]), { validationErrors: n };
    });
  },
  removeValidationError: (e) => {
    o((r) => {
      const t = new Map(r.validationErrors);
      let n = !1;
      const a = e.split(".");
      return Array.from(t.keys()).forEach((s) => {
        const l = s.split(".");
        if (l.length >= a.length) {
          let d = !0;
          for (let c = 0; c < a.length; c++)
            if (l[c] !== a[c]) {
              d = !1;
              break;
            }
          d && (n = !0, t.delete(s));
        }
      }), n ? { validationErrors: t } : r;
    });
  },
  getValidationErrors: (e) => {
    const r = [], t = i().validationErrors, n = e.split("."), a = (s, l) => s === "[*]" ? !0 : Array.isArray(s) ? s.includes(parseInt(l)) : s === l;
    return Array.from(t.keys()).forEach((s) => {
      const l = s.split(".");
      if (l.length >= n.length) {
        let d = !0;
        for (let c = 0; c < n.length; c++) {
          const S = n[c], f = l[c];
          if (S === "[*]" || Array.isArray(S)) {
            const u = parseInt(f);
            if (isNaN(u)) {
              d = !1;
              break;
            }
            if (!a(S, f)) {
              d = !1;
              break;
            }
          } else if (S !== f) {
            d = !1;
            break;
          }
        }
        if (d) {
          const c = t.get(s);
          c && r.push(...c);
        }
      }
    }), r;
  },
  getInitialOptions: (e) => i().initialStateOptions[e],
  getNestedState: (e, r) => {
    const t = i().cogsStateStore[e], n = (a, s) => {
      if (s.length === 0) return a;
      const l = s[0], d = s.slice(1);
      if (l === "[*]") {
        if (!Array.isArray(a)) {
          console.warn("Asterisk notation used on non-array value");
          return;
        }
        if (d.length === 0) return a;
        const S = a.map(
          (f) => n(f, d)
        );
        return Array.isArray(S[0]) ? S.flat() : S;
      }
      const c = a[l];
      if (c !== void 0)
        return n(c, d);
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
  setCreatedState: (e) => {
    o((r) => ({
      iniitialCreatedState: {
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
  v as formRefStore,
  m as getGlobalStore
};
//# sourceMappingURL=store.js.map
