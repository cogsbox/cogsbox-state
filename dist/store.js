import { create as u } from "zustand";
const w = u((s, l) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, r) => s((t) => {
    const n = new Map(t.formRefs);
    return n.set(e, r), { formRefs: n };
  }),
  getFormRef: (e) => l().formRefs.get(e),
  removeFormRef: (e) => s((r) => {
    const t = new Map(r.formRefs);
    return t.delete(e), { formRefs: t };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (e) => {
    const r = l().formRefs, t = e + ".", n = /* @__PURE__ */ new Map();
    return r.forEach((o, a) => {
      (a.startsWith(t) || a === e) && n.set(a, o);
    }), n;
  }
})), h = u((s, l) => ({
  shadowStateStore: {},
  getShadowMetadata: (e, r) => {
    const t = l().shadowStateStore[e];
    if (!t) return null;
    let n = t;
    for (const o of r)
      if (n = n?.[o], !n) return null;
    return n;
  },
  setShadowMetadata: (e, r, t) => {
    s((n) => {
      const o = { ...n.shadowStateStore };
      if (!o[e]) return n;
      o[e] = JSON.parse(JSON.stringify(o[e]));
      let a = o[e];
      for (const i of r)
        a[i] || (a[i] = {}), a = a[i];
      return Object.keys(t).forEach((i) => {
        a[i] || (a[i] = {}), Object.assign(a[i], t[i]);
      }), { shadowStateStore: o };
    });
  },
  initializeShadowState: (e, r) => {
    const t = (n) => {
      if (Array.isArray(n))
        return new Array(n.length).fill(null).map((o, a) => t(n[a]));
      if (typeof n == "object" && n !== null) {
        const o = {};
        for (const a in n)
          o[a] = t(n[a]);
        return o;
      }
      return {};
    };
    s((n) => ({
      shadowStateStore: {
        ...n.shadowStateStore,
        [e]: t(r)
      }
    }));
  },
  updateShadowAtPath: (e, r, t) => {
    s((n) => {
      const o = { ...n.shadowStateStore };
      if (!o[e]) return n;
      let a = o[e];
      const i = [...r], S = i.pop();
      for (const c of i)
        a[c] || (a[c] = {}), a = a[c];
      return S !== void 0 && (Array.isArray(t) ? a[S] = new Array(t.length) : typeof t == "object" && t !== null ? a[S] = {} : a[S] = a[S] || {}), { shadowStateStore: o };
    });
  },
  insertShadowArrayElement: (e, r) => {
    s((t) => {
      const n = { ...t.shadowStateStore };
      let o = n[e];
      for (const a of r)
        o = o?.[a];
      return Array.isArray(o) && o.push({}), { shadowStateStore: n };
    });
  },
  removeShadowArrayElement: (e, r, t) => {
    s((n) => {
      const o = { ...n.shadowStateStore };
      let a = o[e];
      for (const i of r)
        a = a?.[i];
      return Array.isArray(a) && a.splice(t, 1), { shadowStateStore: o };
    });
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  // Add the new methods
  getSelectedIndex: (e, r) => {
    const t = l().selectedIndicesMap.get(e);
    if (t)
      return t.get(r);
  },
  setSelectedIndex: (e, r, t) => {
    s((n) => {
      const o = new Map(n.selectedIndicesMap);
      let a = o.get(e);
      return a || (a = /* @__PURE__ */ new Map(), o.set(e, a)), t === void 0 ? a.delete(r) : a.set(r, t), {
        ...n,
        selectedIndicesMap: o
      };
    });
  },
  clearSelectedIndex: ({
    stateKey: e,
    path: r
  }) => {
    s((t) => {
      const n = new Map(t.selectedIndicesMap), o = n.get(e);
      if (!o) return t;
      const a = r.join(".");
      return o.delete(a), {
        ...t,
        selectedIndicesMap: n
      };
    });
  },
  clearSelectedIndexesForState: (e) => {
    s((r) => {
      const t = new Map(r.selectedIndicesMap);
      return t.delete(e) ? (console.log(
        `Cleared selected indices map entry for stateKey: ${e}`
      ), { selectedIndicesMap: t }) : {};
    });
  },
  stateComponents: /* @__PURE__ */ new Map(),
  subscribe: (e) => l().subscribe(e),
  reactiveDeps: {},
  setReactiveDeps: (e, r) => s((t) => ({
    ...t,
    reactiveDeps: {
      ...t.reactiveDeps,
      [e]: r
    }
  })),
  deleteReactiveDeps: (e) => s((r) => {
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
    t.has(e) || t.set(e, /* @__PURE__ */ new Set()), t.get(e).add(r), s({ signalDomElements: new Map(t) });
  },
  removeSignalElement: (e, r) => {
    const t = l().signalDomElements, n = t.get(e);
    n && n.forEach((o) => {
      o.instanceId === r && n.delete(o);
    }), s({ signalDomElements: new Map(t) });
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
    s((t) => ({
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
    s((t) => ({
      serverSyncLog: {
        ...t.serverSyncLog,
        [e]: [...t.serverSyncLog[e] ?? [], r]
      }
    }));
  },
  setServerSideOrNot: (e, r) => {
    s((t) => ({
      serverSideOrNot: {
        ...t.serverSideOrNot,
        [e]: r
      }
    }));
  },
  getServerSideOrNot: (e) => l().serverSideOrNot[e],
  getThisLocalUpdate: (e) => l().stateLog[e],
  setServerState: (e, r) => {
    s((t) => ({
      serverState: {
        ...t.serverState,
        [e]: r
      }
    }));
  },
  setStateLog: (e, r) => {
    s((t) => {
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
    s((t) => ({
      isLoadingGlobal: {
        ...t.isLoadingGlobal,
        [e]: r
      }
    }));
  },
  setServerSyncActions: (e, r) => {
    s((t) => ({
      serverSyncActions: {
        ...t.serverSyncActions,
        [e]: r
      }
    }));
  },
  addValidationError: (e, r) => {
    console.log("addValidationError---"), s((t) => {
      const n = new Map(t.validationErrors), o = n.get(e) || [];
      return console.log("addValidationError", e, r, o), n.set(e, [...o, r]), { validationErrors: n };
    });
  },
  removeValidationError: (e) => {
    s((r) => {
      const t = new Map(r.validationErrors);
      let n = !1;
      const o = e.split(".");
      return Array.from(t.keys()).forEach((a) => {
        const i = a.split(".");
        if (i.length >= o.length) {
          let S = !0;
          for (let c = 0; c < o.length; c++)
            if (i[c] !== o[c]) {
              S = !1;
              break;
            }
          S && (n = !0, t.delete(a));
        }
      }), n ? { validationErrors: t } : r;
    });
  },
  getValidationErrors: (e) => {
    const r = [], t = l().validationErrors, n = e.split("."), o = (a, i) => a === "[*]" ? !0 : Array.isArray(a) ? a.includes(parseInt(i)) : a === i;
    return Array.from(t.keys()).forEach((a) => {
      const i = a.split(".");
      if (i.length >= n.length) {
        let S = !0;
        for (let c = 0; c < n.length; c++) {
          const d = n[c], f = i[c];
          if (d === "[*]" || Array.isArray(d)) {
            const p = parseInt(f);
            if (isNaN(p)) {
              S = !1;
              break;
            }
            if (!o(d, f)) {
              S = !1;
              break;
            }
          } else if (d !== f) {
            S = !1;
            break;
          }
        }
        if (S) {
          const c = t.get(a);
          c && r.push(...c);
        }
      }
    }), r;
  },
  getInitialOptions: (e) => l().initialStateOptions[e],
  getNestedState: (e, r) => {
    const t = l().cogsStateStore[e], n = (o, a) => {
      if (a.length === 0) return o;
      const i = a[0], S = a.slice(1);
      if (i === "[*]") {
        if (!Array.isArray(o)) {
          console.warn("Asterisk notation used on non-array value");
          return;
        }
        if (S.length === 0) return o;
        const d = o.map(
          (f) => n(f, S)
        );
        return Array.isArray(d[0]) ? d.flat() : d;
      }
      const c = o[i];
      if (c !== void 0)
        return n(c, S);
    };
    return n(t, r);
  },
  setInitialStateOptions: (e, r) => {
    s((t) => ({
      initialStateOptions: {
        ...t.initialStateOptions,
        [e]: r
      }
    }));
  },
  updateInitialStateGlobal: (e, r) => {
    s((t) => ({
      initialStateGlobal: {
        ...t.initialStateGlobal,
        [e]: r
      }
    }));
  },
  getUpdaterState: (e) => l().updaterState[e],
  setUpdaterState: (e, r) => {
    const t = l().updaterState;
    !e || !r || s({ updaterState: { ...t ?? {}, [e]: r } });
  },
  getKeyState: (e) => l().cogsStateStore[e],
  setState: (e, r) => {
    s((t) => ({
      cogsStateStore: {
        ...t.cogsStateStore,
        [e]: typeof r == "function" ? r(t.cogsStateStore[e]) : r
      }
    }));
  },
  setInitialStates: (e) => {
    s((r) => ({
      cogsStateStore: {
        ...r.cogsStateStore,
        ...e
      }
    }));
  },
  setCreatedState: (e) => {
    s((r) => ({
      iniitialCreatedState: {
        ...r.cogsStateStore,
        ...e
      }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (e, r) => s((t) => {
    const n = new Map(t.syncInfoStore);
    return n.set(e, r), { ...t, syncInfoStore: n };
  }),
  getSyncInfo: (e) => l().syncInfoStore.get(e) || null
}));
export {
  w as formRefStore,
  h as getGlobalStore
};
//# sourceMappingURL=store.js.map
