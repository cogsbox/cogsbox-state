import { create as u } from "zustand";
import { ulid as w } from "ulid";
const g = u((a, f) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (r, s) => a((t) => {
    const e = new Map(t.formRefs);
    return e.set(r, s), { formRefs: e };
  }),
  getFormRef: (r) => f().formRefs.get(r),
  removeFormRef: (r) => a((s) => {
    const t = new Map(s.formRefs);
    return t.delete(r), { formRefs: t };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (r) => {
    const s = f().formRefs, t = r + ".", e = /* @__PURE__ */ new Map();
    return s.forEach((n, o) => {
      (o.startsWith(t) || o === r) && e.set(o, n);
    }), e;
  }
})), b = (a) => a === null || typeof a != "object" || a instanceof Uint8Array || a instanceof Int8Array || a instanceof Uint16Array || a instanceof Int16Array || a instanceof Uint32Array || a instanceof Int32Array || a instanceof Float32Array || a instanceof Float64Array || a instanceof ArrayBuffer || a instanceof Date || a instanceof RegExp || a instanceof Map || a instanceof Set ? !1 : Array.isArray(a) || a.constructor === Object, M = u((a, f) => ({
  markAsDirty: (r, s, t = { bubble: !0 }) => {
    const e = new Map(f().shadowStateStore);
    let n = !1;
    const o = (i) => {
      const d = [r, ...i].join("."), c = e.get(d);
      c && c.stateSource === "server" && c.isDirty !== !0 && (e.set(d, { ...c, isDirty: !0 }), n = !0);
    };
    if (o(s), t.bubble) {
      let i = [...s];
      for (; i.length > 0; )
        i.pop(), o(i);
    }
    n && a({ shadowStateStore: e });
  },
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (r, s) => {
    a((t) => {
      const e = new Map(t.serverStateUpdates);
      return e.set(r, s), { serverStateUpdates: e };
    }), f().notifyPathSubscribers(r, {
      type: "SERVER_STATE_UPDATE",
      serverState: s
    });
  },
  shadowStateStore: /* @__PURE__ */ new Map(),
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (r, s) => {
    const t = f().pathSubscribers, e = t.get(r) || /* @__PURE__ */ new Set();
    return e.add(s), t.set(r, e), () => {
      const n = f().pathSubscribers.get(r);
      n && (n.delete(s), n.size === 0 && f().pathSubscribers.delete(r));
    };
  },
  notifyPathSubscribers: (r, s) => {
    const e = f().pathSubscribers.get(r);
    e && e.forEach((n) => n(s));
  },
  initializeShadowState: (r, s) => {
    const t = new Map(f().shadowStateStore), e = (n, o) => {
      const i = [r, ...o].join(".");
      if (Array.isArray(n)) {
        const d = [];
        n.forEach((c) => {
          const l = `id:${w()}`;
          d.push(i + "." + l);
        }), t.set(i, { arrayKeys: d }), n.forEach((c, l) => {
          const S = d[l].split(".").pop();
          e(c, [...o, S]);
        });
      } else if (b(n)) {
        const d = Object.fromEntries(
          Object.keys(n).map((c) => [c, i + "." + c])
        );
        t.set(i, { fields: d }), Object.keys(n).forEach((c) => {
          e(n[c], [...o, c]);
        });
      } else
        t.set(i, { value: n });
    };
    e(s, []), a({ shadowStateStore: t });
  },
  getShadowValue: (r, s) => {
    const t = f().shadowStateStore.get(r);
    if (t) {
      if (t.value !== void 0)
        return t.value;
      if (t.arrayKeys)
        return (s ?? t.arrayKeys).map((o) => f().getShadowValue(o));
      if (t.fields) {
        const e = {};
        return Object.entries(t.fields).forEach(([n, o]) => {
          e[n] = f().getShadowValue(o);
        }), e;
      }
    }
  },
  getShadowMetadata: (r, s, t) => {
    const e = [r, ...s].join(".");
    return f().shadowStateStore.get(e), f().shadowStateStore.get(e);
  },
  setShadowMetadata: (r, s, t) => {
    const e = [r, ...s].join("."), n = new Map(f().shadowStateStore), o = n.get(e) || { id: w() };
    n.set(e, { ...o, ...t }), a({ shadowStateStore: n });
  },
  setTransformCache: (r, s, t, e) => {
    const n = [r, ...s].join("."), o = new Map(f().shadowStateStore), i = o.get(n) || {};
    i.transformCaches || (i.transformCaches = /* @__PURE__ */ new Map()), i.transformCaches.set(t, e), o.set(n, i), a({ shadowStateStore: o });
  },
  insertShadowArrayElement: (r, s, t) => {
    const e = new Map(f().shadowStateStore), n = [r, ...s].join("."), o = e.get(n);
    if (!o || !o.arrayKeys) return;
    const i = `id:${w()}`, d = n + "." + i, c = [...o.arrayKeys];
    c.push(d), e.set(n, { ...o, arrayKeys: c });
    const l = (S, y) => {
      const h = [r, ...y].join(".");
      if (!Array.isArray(S)) if (typeof S == "object" && S !== null) {
        const m = Object.fromEntries(
          Object.keys(S).map((p) => [p, h + "." + p])
        );
        e.set(h, { fields: m }), Object.entries(S).forEach(([p, E]) => {
          l(E, [...y, p]);
        });
      } else
        e.set(h, { value: S });
    };
    l(t, [...s, i]), a({ shadowStateStore: e }), f().notifyPathSubscribers(n, {
      type: "INSERT",
      path: n,
      itemKey: d
    });
  },
  removeShadowArrayElement: (r, s) => {
    const t = new Map(f().shadowStateStore), e = [r, ...s].join("."), n = s.slice(0, -1), o = [r, ...n].join("."), i = t.get(o);
    if (i && i.arrayKeys && i.arrayKeys.findIndex(
      (c) => c === e
    ) !== -1) {
      const c = i.arrayKeys.filter(
        (S) => S !== e
      );
      t.set(o, {
        ...i,
        arrayKeys: c
      });
      const l = e + ".";
      for (const S of Array.from(t.keys()))
        (S === e || S.startsWith(l)) && t.delete(S);
    }
    a({ shadowStateStore: t }), f().notifyPathSubscribers(o, {
      type: "REMOVE",
      path: o,
      itemKey: e
      // The exact ID of the removed item
    });
  },
  updateShadowAtPath: (r, s, t) => {
    const e = new Map(f().shadowStateStore), n = [r, ...s].join("."), o = (i, d) => {
      const c = e.get(i);
      if (b(d) && c && c.fields) {
        for (const l in d)
          if (Object.prototype.hasOwnProperty.call(d, l)) {
            const S = c.fields[l], y = d[l];
            S && o(S, y);
          }
      } else {
        const l = e.get(i) || {};
        e.set(i, { ...l, value: d });
      }
    };
    o(n, t), f().notifyPathSubscribers(n, { type: "UPDATE", newValue: t }), a({ shadowStateStore: e });
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (r, s) => {
    const t = f().selectedIndicesMap.get(r);
    if (!t) return -1;
    const e = s || M.getState().getShadowMetadata(r, [])?.arrayKeys;
    return e ? e.indexOf(t) : -1;
  },
  setSelectedIndex: (r, s) => {
    a((t) => {
      const e = t.selectedIndicesMap;
      return s === void 0 ? e.delete(r) : (e.has(r) && f().notifyPathSubscribers(e.get(r), {
        type: "THIS_UNSELECTED"
      }), e.set(r, s), f().notifyPathSubscribers(s, {
        type: "THIS_SELECTED"
      })), f().notifyPathSubscribers(r, {
        type: "GET_SELECTED"
      }), {
        ...t,
        selectedIndicesMap: e
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: r }) => {
    a((s) => {
      const t = s.selectedIndicesMap;
      return t.delete(r), f().notifyPathSubscribers(r, {
        type: "CLEAR_SELECTION"
      }), {
        ...s,
        selectedIndicesMap: t
      };
    });
  },
  clearSelectedIndexesForState: (r) => {
    a((s) => {
      const t = new Map(s.selectedIndicesMap);
      return t.delete(r) ? { selectedIndicesMap: t } : {};
    });
  },
  initialStateOptions: {},
  stateTimeline: {},
  cogsStateStore: {},
  stateLog: {},
  initialStateGlobal: {},
  validationErrors: /* @__PURE__ */ new Map(),
  setStateLog: (r, s) => {
    a((t) => {
      const e = t.stateLog[r] ?? [], n = s(e);
      return {
        stateLog: {
          ...t.stateLog,
          [r]: n
        }
      };
    });
  },
  addValidationError: (r, s) => {
    a((t) => {
      const e = new Map(t.validationErrors), n = e.get(r) || [];
      return console.log("addValidationError", r, s, n), e.set(r, [...n, s]), { validationErrors: e };
    });
  },
  removeValidationError: (r) => {
    a((s) => {
      const t = new Map(s.validationErrors);
      let e = !1;
      const n = r.split(".");
      return Array.from(t.keys()).forEach((o) => {
        const i = o.split(".");
        if (i.length >= n.length) {
          let d = !0;
          for (let c = 0; c < n.length; c++)
            if (i[c] !== n[c]) {
              d = !1;
              break;
            }
          d && (e = !0, t.delete(o));
        }
      }), e ? { validationErrors: t } : s;
    });
  },
  getValidationErrors: (r) => {
    const s = [], t = f().validationErrors, e = r.split("."), n = (o, i) => o === "[*]" ? !0 : Array.isArray(o) ? o.includes(parseInt(i)) : o === i;
    return Array.from(t.keys()).forEach((o) => {
      const i = o.split(".");
      if (i.length >= e.length) {
        let d = !0;
        for (let c = 0; c < e.length; c++) {
          const l = e[c], S = i[c];
          if (l === "[*]" || Array.isArray(l)) {
            const y = parseInt(S);
            if (isNaN(y)) {
              d = !1;
              break;
            }
            if (!n(l, S)) {
              d = !1;
              break;
            }
          } else if (l !== S) {
            d = !1;
            break;
          }
        }
        if (d) {
          const c = t.get(o);
          c && s.push(...c);
        }
      }
    }), s;
  },
  getInitialOptions: (r) => f().initialStateOptions[r],
  setInitialStateOptions: (r, s) => {
    a((t) => ({
      initialStateOptions: {
        ...t.initialStateOptions,
        [r]: s
      }
    }));
  },
  updateInitialStateGlobal: (r, s) => {
    a((t) => ({
      initialStateGlobal: {
        ...t.initialStateGlobal,
        [r]: s
      }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (r, s) => a((t) => {
    const e = new Map(t.syncInfoStore);
    return e.set(r, s), { ...t, syncInfoStore: e };
  }),
  getSyncInfo: (r) => f().syncInfoStore.get(r) || null
}));
export {
  g as formRefStore,
  M as getGlobalStore
};
//# sourceMappingURL=store.js.map
