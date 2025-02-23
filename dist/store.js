import { create as f } from "./node_modules/zustand/esm/react.js";
const v = f((a, l) => ({
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
    a((t) => {
      const n = new Map(t.validationErrors), o = n.get(e) || [];
      return n.set(e, [...o, r]), { validationErrors: n };
    });
  },
  removeValidationError: (e) => {
    a((r) => {
      const t = new Map(r.validationErrors);
      console.log("updatedErrors", t);
      let n = !1;
      const o = e.split(".");
      return Array.from(t.keys()).forEach((i) => {
        const c = i.split(".");
        if (c.length >= o.length) {
          let S = !0;
          for (let s = 0; s < o.length; s++)
            if (c[s] !== o[s]) {
              S = !1;
              break;
            }
          S && (n = !0, t.delete(i));
        }
      }), n ? { validationErrors: t } : r;
    });
  },
  getValidationErrors: (e) => {
    const r = [], t = l().validationErrors, n = e.split("."), o = (i, c) => i === "[*]" ? !0 : Array.isArray(i) ? i.includes(parseInt(c)) : i === c;
    return Array.from(t.keys()).forEach((i) => {
      const c = i.split(".");
      if (c.length >= n.length) {
        let S = !0;
        for (let s = 0; s < n.length; s++) {
          const d = n[s], u = c[s];
          if (d === "[*]" || Array.isArray(d)) {
            const g = parseInt(u);
            if (isNaN(g)) {
              S = !1;
              break;
            }
            if (!o(d, u)) {
              S = !1;
              break;
            }
          } else if (d !== u) {
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
    const t = l().cogsStateStore[e], n = (o, i) => {
      if (i.length === 0) return o;
      const c = i[0], S = i.slice(1);
      if (c === "[*]") {
        if (!Array.isArray(o)) {
          console.warn("Asterisk notation used on non-array value");
          return;
        }
        if (S.length === 0) return o;
        const d = o.map(
          (u) => n(u, S)
        );
        return Array.isArray(d[0]) ? d.flat() : d;
      }
      const s = o[c];
      if (s !== void 0)
        return n(s, S);
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
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, r) => a((t) => {
    const n = new Map(t.syncInfoStore);
    return n.set(e, r), { ...t, syncInfoStore: n };
  }),
  getSyncInfo: (e) => l().syncInfoStore.get(e) || null
}));
export {
  v as getGlobalStore
};
//# sourceMappingURL=store.js.map
