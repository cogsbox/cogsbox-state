import { create as f } from "./node_modules/zustand/esm/react.js";
const v = f((o, l) => ({
  stateComponents: /* @__PURE__ */ new Map(),
  subscribe: (e) => l().subscribe(e),
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
    console.log("Adding signal element", e, r);
    const t = l().signalDomElements;
    t.has(e) || t.set(e, /* @__PURE__ */ new Set()), t.get(e).add(r), console.log("After adding", t.get(e)), o({ signalDomElements: new Map(t) });
  },
  removeSignalElement: (e, r) => {
    console.log("Removing signal element", e, r);
    const t = l().signalDomElements, n = t.get(e);
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
  getServerSideOrNot: (e) => l().serverSideOrNot[e],
  getThisLocalUpdate: (e) => l().stateLog[e],
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
    o((t) => {
      const n = new Map(t.validationErrors), a = n.get(e) || [];
      return n.set(e, [...a, r]), { validationErrors: n };
    });
  },
  removeValidationError: (e) => {
    o((r) => {
      const t = new Map(r.validationErrors);
      console.log("updatedErrors", t);
      let n = !1;
      const a = e.split(".");
      return Array.from(t.keys()).forEach((i) => {
        const c = i.split(".");
        if (c.length >= a.length) {
          let S = !0;
          for (let s = 0; s < a.length; s++)
            if (c[s] !== a[s]) {
              S = !1;
              break;
            }
          S && (n = !0, t.delete(i));
        }
      }), n ? { validationErrors: t } : r;
    });
  },
  getValidationErrors: (e) => {
    const r = [], t = l().validationErrors, n = e.split("."), a = (i, c) => i === "[*]" ? !0 : Array.isArray(i) ? i.includes(parseInt(c)) : i === c;
    return Array.from(t.keys()).forEach((i) => {
      const c = i.split(".");
      if (c.length >= n.length) {
        let S = !0;
        for (let s = 0; s < n.length; s++) {
          const d = n[s], g = c[s];
          if (d === "[*]" || Array.isArray(d)) {
            const u = parseInt(g);
            if (isNaN(u)) {
              S = !1;
              break;
            }
            if (!a(d, g)) {
              S = !1;
              break;
            }
          } else if (d !== g) {
            S = !1;
            break;
          }
        }
        if (S) {
          const s = t.get(i);
          s && r.push(...s);
        }
      }
    }), r;
  },
  getInitialOptions: (e) => l().initialStateOptions[e],
  getNestedState: (e, r) => {
    const t = l().cogsStateStore[e], n = (a, i) => {
      if (i.length === 0) return a;
      const c = i[0], S = i.slice(1);
      if (c === "[*]") {
        if (!Array.isArray(a)) {
          console.warn("Asterisk notation used on non-array value");
          return;
        }
        if (S.length === 0) return a;
        const d = a.map(
          (g) => n(g, S)
        );
        return Array.isArray(d[0]) ? d.flat() : d;
      }
      const s = a[c];
      if (s !== void 0)
        return n(s, S);
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
  getUpdaterState: (e) => l().updaterState[e],
  setUpdaterState: (e, r) => {
    const t = l().updaterState;
    !e || !r || o({ updaterState: { ...t ?? {}, [e]: r } });
  },
  getKeyState: (e) => l().cogsStateStore[e],
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
  getSyncInfo: (e) => l().syncInfoStore.get(e) || null
}));
export {
  v as getGlobalStore
};
//# sourceMappingURL=store.js.map
