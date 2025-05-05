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
    return r.forEach((s, o) => {
      (o.startsWith(t) || o === e) && n.set(o, s);
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
      const s = new Map(n.selectedIndicesMap);
      let o = s.get(e);
      return o || (o = /* @__PURE__ */ new Map(), s.set(e, o)), t === void 0 ? o.delete(r) : o.set(r, t), {
        ...n,
        selectedIndicesMap: s
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
        const l = o.split(".");
        if (l.length >= s.length) {
          let d = !0;
          for (let c = 0; c < s.length; c++)
            if (l[c] !== s[c]) {
              d = !1;
              break;
            }
          d && (n = !0, t.delete(o));
        }
      }), n ? { validationErrors: t } : r;
    });
  },
  getValidationErrors: (e) => {
    const r = [], t = i().validationErrors, n = e.split("."), s = (o, l) => o === "[*]" ? !0 : Array.isArray(o) ? o.includes(parseInt(l)) : o === l;
    return Array.from(t.keys()).forEach((o) => {
      const l = o.split(".");
      if (l.length >= n.length) {
        let d = !0;
        for (let c = 0; c < n.length; c++) {
          const f = n[c], S = l[c];
          if (f === "[*]" || Array.isArray(f)) {
            const p = parseInt(S);
            if (isNaN(p)) {
              d = !1;
              break;
            }
            if (!s(f, S)) {
              d = !1;
              break;
            }
          } else if (f !== S) {
            d = !1;
            break;
          }
        }
        if (d) {
          const c = t.get(o);
          c && r.push(...c);
        }
      }
    }), r;
  },
  getInitialOptions: (e) => i().initialStateOptions[e],
  getNestedState: (e, r) => {
    const t = i().cogsStateStore[e], n = (s, o) => {
      if (o.length === 0) return s;
      const l = o[0], d = o.slice(1);
      if (l === "[*]") {
        if (!Array.isArray(s)) {
          console.warn("Asterisk notation used on non-array value");
          return;
        }
        if (d.length === 0) return s;
        const f = s.map(
          (S) => n(S, d)
        );
        return Array.isArray(f[0]) ? f.flat() : f;
      }
      const c = s[l];
      if (c !== void 0)
        return n(c, d);
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
