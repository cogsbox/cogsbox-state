import { create as b } from "zustand";
import { ulid as u } from "ulid";
const A = b((c, f) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (t, n) => c((o) => {
    const e = new Map(o.formRefs);
    return e.set(t, n), { formRefs: e };
  }),
  getFormRef: (t) => f().formRefs.get(t),
  removeFormRef: (t) => c((n) => {
    const o = new Map(n.formRefs);
    return o.delete(t), { formRefs: o };
  }),
  // Get all refs that start with the stateKey prefix
  getFormRefsByStateKey: (t) => {
    const n = f().formRefs, o = t + ".", e = /* @__PURE__ */ new Map();
    return n.forEach((s, r) => {
      (r.startsWith(o) || r === t) && e.set(r, s);
    }), e;
  }
})), m = (c) => c === null || typeof c != "object" || c instanceof Uint8Array || c instanceof Int8Array || c instanceof Uint16Array || c instanceof Int16Array || c instanceof Uint32Array || c instanceof Int32Array || c instanceof Float32Array || c instanceof Float64Array || c instanceof ArrayBuffer || c instanceof Date || c instanceof RegExp || c instanceof Map || c instanceof Set ? !1 : Array.isArray(c) || c.constructor === Object, E = b((c, f) => ({
  addPathComponent: (t, n, o) => {
    c((e) => {
      const s = new Map(e.shadowStateStore), r = [t, ...n].join("."), i = s.get(r) || {}, d = new Set(i.pathComponents);
      d.add(o), s.set(r, { ...i, pathComponents: d });
      const a = s.get(t) || {}, p = a.components?.get(o);
      if (p) {
        const S = new Set(p.paths);
        S.add(r);
        const h = { ...p, paths: S }, l = new Map(a.components);
        l.set(o, h), s.set(t, {
          ...a,
          components: l
        });
      }
      return { shadowStateStore: s };
    });
  },
  registerComponent: (t, n, o) => {
    c((e) => {
      const s = new Map(e.shadowStateStore), r = s.get(t) || {}, i = new Map(r.components);
      return i.set(n, o), s.set(t, { ...r, components: i }), { shadowStateStore: s };
    });
  },
  unregisterComponent: (t, n) => {
    c((o) => {
      const e = new Map(o.shadowStateStore), s = e.get(t);
      if (!s?.components)
        return o;
      const r = new Map(s.components);
      return r.delete(n) ? (e.set(t, { ...s, components: r }), { shadowStateStore: e }) : o;
    });
  },
  markAsDirty: (t, n, o = { bubble: !0 }) => {
    const e = new Map(f().shadowStateStore);
    let s = !1;
    const r = (i) => {
      const d = [t, ...i].join("."), a = e.get(d);
      a && a.isDirty !== !0 ? (e.set(d, { ...a, isDirty: !0 }), s = !0) : a || (e.set(d, { isDirty: !0 }), s = !0);
    };
    if (r(n), o.bubble) {
      let i = [...n];
      for (; i.length > 0; )
        i.pop(), r(i);
    }
    s && c({ shadowStateStore: e });
  },
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (t, n) => {
    c((o) => {
      const e = new Map(o.serverStateUpdates);
      return e.set(t, n), { serverStateUpdates: e };
    }), f().notifyPathSubscribers(t, {
      type: "SERVER_STATE_UPDATE",
      serverState: n
    });
  },
  shadowStateStore: /* @__PURE__ */ new Map(),
  pathSubscribers: /* @__PURE__ */ new Map(),
  subscribeToPath: (t, n) => {
    const o = f().pathSubscribers, e = o.get(t) || /* @__PURE__ */ new Set();
    return e.add(n), o.set(t, e), () => {
      const s = f().pathSubscribers.get(t);
      s && (s.delete(n), s.size === 0 && f().pathSubscribers.delete(t));
    };
  },
  notifyPathSubscribers: (t, n) => {
    const e = f().pathSubscribers.get(t);
    e && e.forEach((s) => s(n));
  },
  initializeShadowState: (t, n) => {
    c((o) => {
      const e = new Map(o.shadowStateStore), r = e.get(t)?.components, i = t + ".";
      for (const a of Array.from(e.keys()))
        (a === t || a.startsWith(i)) && e.delete(a);
      const d = (a, p) => {
        const S = [t, ...p].join(".");
        if (Array.isArray(a)) {
          const h = [];
          a.forEach(() => {
            const l = `id:${u()}`;
            h.push(S + "." + l);
          }), e.set(S, { arrayKeys: h }), a.forEach((l, y) => {
            const w = h[y].split(".").pop();
            d(l, [...p, w]);
          });
        } else if (m(a)) {
          const h = Object.fromEntries(
            Object.keys(a).map((l) => [l, S + "." + l])
          );
          e.set(S, { fields: h }), Object.keys(a).forEach((l) => {
            d(a[l], [...p, l]);
          });
        } else
          e.set(S, { value: a });
      };
      if (d(n, []), r) {
        const a = e.get(t) || {};
        e.set(t, {
          ...a,
          components: r
        });
      }
      return { shadowStateStore: e };
    });
  },
  getShadowValue: (t, n) => {
    const o = f().shadowStateStore.get(t);
    if (o) {
      if (o.value !== void 0)
        return o.value;
      if (o.arrayKeys)
        return (n ?? o.arrayKeys).map((r) => f().getShadowValue(r));
      if (o.fields) {
        const e = {};
        return Object.entries(o.fields).forEach(([s, r]) => {
          e[s] = f().getShadowValue(r);
        }), e;
      }
    }
  },
  getShadowMetadata: (t, n, o) => {
    const e = [t, ...n].join(".");
    return f().shadowStateStore.get(e), f().shadowStateStore.get(e);
  },
  setShadowMetadata: (t, n, o) => {
    const e = [t, ...n].join("."), s = f().shadowStateStore.get(e);
    s?.components && !o.components && (console.group(
      "%c🚨 RACE CONDITION DETECTED! 🚨",
      "color: red; font-size: 18px; font-weight: bold;"
    ), console.error(
      `An overwrite is about to happen on stateKey: "${t}" at path: [${n.join(", ")}]`
    ), console.log(
      "The EXISTING metadata had a components map:",
      s.components
    ), console.log(
      "The NEW metadata is trying to save WITHOUT a components map:",
      o
    ), console.log(
      "%cStack trace to the function that caused this overwrite:",
      "font-weight: bold;"
    ), console.trace(), console.groupEnd());
    const r = new Map(f().shadowStateStore), i = { ...s || {}, ...o };
    r.set(e, i), c({ shadowStateStore: r });
  },
  setTransformCache: (t, n, o, e) => {
    const s = [t, ...n].join("."), r = new Map(f().shadowStateStore), i = r.get(s) || {};
    i.transformCaches || (i.transformCaches = /* @__PURE__ */ new Map()), i.transformCaches.set(o, e), r.set(s, i), c({ shadowStateStore: r });
  },
  insertShadowArrayElement: (t, n, o) => {
    const e = new Map(f().shadowStateStore), s = [t, ...n].join("."), r = e.get(s);
    if (!r || !r.arrayKeys) return;
    const i = `id:${u()}`, d = s + "." + i, a = [...r.arrayKeys];
    a.push(d), e.set(s, { ...r, arrayKeys: a });
    const p = (S, h) => {
      const l = [t, ...h].join(".");
      if (!Array.isArray(S)) if (typeof S == "object" && S !== null) {
        const y = Object.fromEntries(
          Object.keys(S).map((w) => [w, l + "." + w])
        );
        e.set(l, { fields: y }), Object.entries(S).forEach(([w, M]) => {
          p(M, [...h, w]);
        });
      } else
        e.set(l, { value: S });
    };
    p(o, [...n, i]), c({ shadowStateStore: e }), f().notifyPathSubscribers(s, {
      type: "INSERT",
      path: s,
      itemKey: d
    });
  },
  removeShadowArrayElement: (t, n) => {
    const o = new Map(f().shadowStateStore), e = [t, ...n].join("."), s = n.slice(0, -1), r = [t, ...s].join("."), i = o.get(r);
    if (i && i.arrayKeys && i.arrayKeys.findIndex(
      (a) => a === e
    ) !== -1) {
      const a = i.arrayKeys.filter(
        (S) => S !== e
      );
      o.set(r, {
        ...i,
        arrayKeys: a
      });
      const p = e + ".";
      for (const S of Array.from(o.keys()))
        (S === e || S.startsWith(p)) && o.delete(S);
    }
    c({ shadowStateStore: o }), f().notifyPathSubscribers(r, {
      type: "REMOVE",
      path: r,
      itemKey: e
      // The exact ID of the removed item
    });
  },
  updateShadowAtPath: (t, n, o) => {
    const e = new Map(f().shadowStateStore), s = [t, ...n].join("."), r = (i, d) => {
      const a = e.get(i);
      if (m(d) && a && a.fields) {
        for (const p in d)
          if (Object.prototype.hasOwnProperty.call(d, p)) {
            const S = a.fields[p], h = d[p];
            S && r(S, h);
          }
      } else {
        const p = e.get(i) || {};
        e.set(i, { ...p, value: d });
      }
    };
    r(s, o), f().notifyPathSubscribers(s, { type: "UPDATE", newValue: o }), c({ shadowStateStore: e });
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (t, n) => {
    const o = f().selectedIndicesMap.get(t);
    if (!o) return -1;
    const e = n || E.getState().getShadowMetadata(t, [])?.arrayKeys;
    return e ? e.indexOf(o) : -1;
  },
  setSelectedIndex: (t, n) => {
    c((o) => {
      const e = o.selectedIndicesMap;
      return n === void 0 ? e.delete(t) : (e.has(t) && f().notifyPathSubscribers(e.get(t), {
        type: "THIS_UNSELECTED"
      }), e.set(t, n), f().notifyPathSubscribers(n, {
        type: "THIS_SELECTED"
      })), f().notifyPathSubscribers(t, {
        type: "GET_SELECTED"
      }), {
        ...o,
        selectedIndicesMap: e
      };
    });
  },
  clearSelectedIndex: ({ arrayKey: t }) => {
    c((n) => {
      const o = n.selectedIndicesMap, e = o.get(t);
      return e && f().notifyPathSubscribers(e, {
        type: "CLEAR_SELECTION"
      }), o.delete(t), f().notifyPathSubscribers(t, {
        type: "CLEAR_SELECTION"
      }), {
        ...n,
        selectedIndicesMap: o
      };
    });
  },
  clearSelectedIndexesForState: (t) => {
    c((n) => {
      const o = new Map(n.selectedIndicesMap);
      return o.delete(t) ? { selectedIndicesMap: o } : {};
    });
  },
  initialStateOptions: {},
  stateTimeline: {},
  cogsStateStore: {},
  stateLog: {},
  initialStateGlobal: {},
  validationErrors: /* @__PURE__ */ new Map(),
  setStateLog: (t, n) => {
    c((o) => {
      const e = o.stateLog[t] ?? [], s = n(e);
      return {
        stateLog: {
          ...o.stateLog,
          [t]: s
        }
      };
    });
  },
  addValidationError: (t, n) => {
    c((o) => {
      const e = new Map(o.validationErrors), s = e.get(t) || [];
      return console.log("addValidationError", t, n, s), e.set(t, [...s, n]), { validationErrors: e };
    });
  },
  removeValidationError: (t) => {
    c((n) => {
      const o = new Map(n.validationErrors);
      let e = !1;
      const s = t.split(".");
      return Array.from(o.keys()).forEach((r) => {
        const i = r.split(".");
        if (i.length >= s.length) {
          let d = !0;
          for (let a = 0; a < s.length; a++)
            if (i[a] !== s[a]) {
              d = !1;
              break;
            }
          d && (e = !0, o.delete(r));
        }
      }), e ? { validationErrors: o } : n;
    });
  },
  getValidationErrors: (t) => {
    const n = [], o = f().validationErrors, e = t.split("."), s = (r, i) => r === "[*]" ? !0 : Array.isArray(r) ? r.includes(parseInt(i)) : r === i;
    return Array.from(o.keys()).forEach((r) => {
      const i = r.split(".");
      if (i.length >= e.length) {
        let d = !0;
        for (let a = 0; a < e.length; a++) {
          const p = e[a], S = i[a];
          if (p === "[*]" || Array.isArray(p)) {
            const h = parseInt(S);
            if (isNaN(h)) {
              d = !1;
              break;
            }
            if (!s(p, S)) {
              d = !1;
              break;
            }
          } else if (p !== S) {
            d = !1;
            break;
          }
        }
        if (d) {
          const a = o.get(r);
          a && n.push(...a);
        }
      }
    }), n;
  },
  getInitialOptions: (t) => f().initialStateOptions[t],
  setInitialStateOptions: (t, n) => {
    c((o) => ({
      initialStateOptions: {
        ...o.initialStateOptions,
        [t]: n
      }
    }));
  },
  updateInitialStateGlobal: (t, n) => {
    c((o) => ({
      initialStateGlobal: {
        ...o.initialStateGlobal,
        [t]: n
      }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (t, n) => c((o) => {
    const e = new Map(o.syncInfoStore);
    return e.set(t, n), { ...o, syncInfoStore: e };
  }),
  getSyncInfo: (t) => f().syncInfoStore.get(t) || null
}));
export {
  A as formRefStore,
  E as getGlobalStore
};
//# sourceMappingURL=store.js.map
