import { create as u } from "zustand";
const w = u((s, S) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (e, r) => s((t) => {
    const n = new Map(t.formRefs);
    return n.set(e, r), { formRefs: n };
  }),
  getFormRef: (e) => S().formRefs.get(e),
  removeFormRef: (e) => s((r) => {
    const t = new Map(r.formRefs);
    return t.delete(e), { formRefs: t };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (e) => {
    const r = S().formRefs, t = e + ".", n = /* @__PURE__ */ new Map();
    return r.forEach((a, o) => {
      (o.startsWith(t) || o === e) && n.set(o, a);
    }), n;
  }
})), h = u((s, S) => ({
  shadowStateStore: {},
  getShadowMetadata: (e, r) => {
    const t = S().shadowStateStore[e];
    if (!t) return null;
    let n = t;
    for (const a of r)
      if (n = n?.[a], !n) return null;
    return n;
  },
  initializeShadowState: (e, r) => {
    const t = (n) => {
      if (Array.isArray(n))
        return new Array(n.length).fill(null).map((a, o) => t(n[o]));
      if (typeof n == "object" && n !== null) {
        const a = {};
        for (const o in n)
          a[o] = t(n[o]);
        return a;
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
      const a = { ...n.shadowStateStore };
      if (!a[e]) return n;
      let o = a[e];
      const i = [...r], l = i.pop();
      for (const c of i)
        o[c] || (o[c] = {}), o = o[c];
      return l !== void 0 && (Array.isArray(t) ? o[l] = new Array(t.length) : typeof t == "object" && t !== null ? o[l] = {} : o[l] = o[l] || {}), { shadowStateStore: a };
    });
  },
  insertShadowArrayElement: (e, r, t) => {
    s((n) => {
      const a = { ...n.shadowStateStore };
      if (!a[e]) return n;
      a[e] = JSON.parse(JSON.stringify(a[e]));
      let o = a[e];
      for (const i of r)
        if (o = o[i], !o) return n;
      if (Array.isArray(o)) {
        const i = (l) => {
          if (Array.isArray(l))
            return l.map((c) => i(c));
          if (typeof l == "object" && l !== null) {
            const c = {};
            for (const d in l)
              c[d] = i(l[d]);
            return c;
          }
          return {};
        };
        o.push(i(t));
      }
      return { shadowStateStore: a };
    });
  },
  removeShadowArrayElement: (e, r, t) => {
    s((n) => {
      const a = { ...n.shadowStateStore };
      let o = a[e];
      for (const i of r)
        o = o?.[i];
      return Array.isArray(o) && o.splice(t, 1), { shadowStateStore: a };
    });
  },
  shadowStateSubscribers: /* @__PURE__ */ new Map(),
  // key -> Set of callbacks
  subscribeToShadowState: (e, r) => (s((t) => {
    const n = new Map(t.shadowStateSubscribers), a = n.get(e) || /* @__PURE__ */ new Set();
    return a.add(r), n.set(e, a), { shadowStateSubscribers: n };
  }), () => {
    s((t) => {
      const n = new Map(t.shadowStateSubscribers), a = n.get(e);
      return a && a.delete(r), { shadowStateSubscribers: n };
    });
  }),
  setShadowMetadata: (e, r, t) => {
    let n = !1;
    if (s((a) => {
      const o = { ...a.shadowStateStore };
      if (!o[e]) return a;
      o[e] = JSON.parse(JSON.stringify(o[e]));
      let i = o[e];
      for (const d of r)
        i[d] || (i[d] = {}), i = i[d];
      const l = i.virtualizer?.itemHeight, c = t.virtualizer?.itemHeight;
      return c && l !== c && (n = !0, i.virtualizer || (i.virtualizer = {}), i.virtualizer.itemHeight = c), { shadowStateStore: o };
    }), n) {
      const a = S().shadowStateSubscribers.get(e);
      a && a.forEach((o) => o());
    }
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  // Add the new methods
  getSelectedIndex: (e, r) => {
    const t = S().selectedIndicesMap.get(e);
    if (t)
      return t.get(r);
  },
  setSelectedIndex: (e, r, t) => {
    s((n) => {
      const a = new Map(n.selectedIndicesMap);
      let o = a.get(e);
      return o || (o = /* @__PURE__ */ new Map(), a.set(e, o)), t === void 0 ? o.delete(r) : o.set(r, t), {
        ...n,
        selectedIndicesMap: a
      };
    });
  },
  clearSelectedIndex: ({
    stateKey: e,
    path: r
  }) => {
    s((t) => {
      const n = new Map(t.selectedIndicesMap), a = n.get(e);
      if (!a) return t;
      const o = r.join(".");
      return a.delete(o), {
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
  subscribe: (e) => S().subscribe(e),
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
    const t = S().signalDomElements;
    t.has(e) || t.set(e, /* @__PURE__ */ new Set()), t.get(e).add(r), s({ signalDomElements: new Map(t) });
  },
  removeSignalElement: (e, r) => {
    const t = S().signalDomElements, n = t.get(e);
    n && n.forEach((a) => {
      a.instanceId === r && n.delete(a);
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
  getServerSideOrNot: (e) => S().serverSideOrNot[e],
  getThisLocalUpdate: (e) => S().stateLog[e],
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
      const n = new Map(t.validationErrors), a = n.get(e) || [];
      return console.log("addValidationError", e, r, a), n.set(e, [...a, r]), { validationErrors: n };
    });
  },
  removeValidationError: (e) => {
    s((r) => {
      const t = new Map(r.validationErrors);
      let n = !1;
      const a = e.split(".");
      return Array.from(t.keys()).forEach((o) => {
        const i = o.split(".");
        if (i.length >= a.length) {
          let l = !0;
          for (let c = 0; c < a.length; c++)
            if (i[c] !== a[c]) {
              l = !1;
              break;
            }
          l && (n = !0, t.delete(o));
        }
      }), n ? { validationErrors: t } : r;
    });
  },
  getValidationErrors: (e) => {
    const r = [], t = S().validationErrors, n = e.split("."), a = (o, i) => o === "[*]" ? !0 : Array.isArray(o) ? o.includes(parseInt(i)) : o === i;
    return Array.from(t.keys()).forEach((o) => {
      const i = o.split(".");
      if (i.length >= n.length) {
        let l = !0;
        for (let c = 0; c < n.length; c++) {
          const d = n[c], f = i[c];
          if (d === "[*]" || Array.isArray(d)) {
            const p = parseInt(f);
            if (isNaN(p)) {
              l = !1;
              break;
            }
            if (!a(d, f)) {
              l = !1;
              break;
            }
          } else if (d !== f) {
            l = !1;
            break;
          }
        }
        if (l) {
          const c = t.get(o);
          c && r.push(...c);
        }
      }
    }), r;
  },
  getInitialOptions: (e) => S().initialStateOptions[e],
  getNestedState: (e, r) => {
    const t = S().cogsStateStore[e], n = (a, o) => {
      if (o.length === 0) return a;
      const i = o[0], l = o.slice(1);
      if (i === "[*]") {
        if (!Array.isArray(a)) {
          console.warn("Asterisk notation used on non-array value");
          return;
        }
        if (l.length === 0) return a;
        const d = a.map(
          (f) => n(f, l)
        );
        return Array.isArray(d[0]) ? d.flat() : d;
      }
      const c = a[i];
      if (c !== void 0)
        return n(c, l);
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
  getUpdaterState: (e) => S().updaterState[e],
  setUpdaterState: (e, r) => {
    const t = S().updaterState;
    !e || !r || s({ updaterState: { ...t ?? {}, [e]: r } });
  },
  getKeyState: (e) => S().cogsStateStore[e],
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
  getSyncInfo: (e) => S().syncInfoStore.get(e) || null
}));
export {
  w as formRefStore,
  h as getGlobalStore
};
//# sourceMappingURL=store.js.map
