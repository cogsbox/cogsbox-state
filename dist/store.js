import { create as u } from "zustand";
import { ulid as m } from "ulid";
const A = u((a, f) => ({
  formRefs: /* @__PURE__ */ new Map(),
  registerFormRef: (t, n) => a((o) => {
    const e = new Map(o.formRefs);
    return e.set(t, n), { formRefs: e };
  }),
  getFormRef: (t) => f().formRefs.get(t),
  removeFormRef: (t) => a((n) => {
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
})), b = (a) => a === null || typeof a != "object" || a instanceof Uint8Array || a instanceof Int8Array || a instanceof Uint16Array || a instanceof Int16Array || a instanceof Uint32Array || a instanceof Int32Array || a instanceof Float32Array || a instanceof Float64Array || a instanceof ArrayBuffer || a instanceof Date || a instanceof RegExp || a instanceof Map || a instanceof Set ? !1 : Array.isArray(a) || a.constructor === Object, E = u((a, f) => ({
  addPathComponent: (t, n, o) => {
    a((e) => {
      const s = new Map(e.shadowStateStore), r = [t, ...n].join("."), i = s.get(r) || {}, S = new Set(i.pathComponents);
      S.add(o), s.set(r, { ...i, pathComponents: S });
      const c = s.get(t) || {}, p = c.components?.get(o);
      if (p) {
        const d = new Set(p.paths);
        d.add(r);
        const h = { ...p, paths: d }, w = new Map(c.components);
        w.set(o, h), s.set(t, {
          ...c,
          components: w
        });
      }
      return { shadowStateStore: s };
    });
  },
  registerComponent: (t, n, o) => {
    a((e) => {
      const s = new Map(e.shadowStateStore), r = s.get(t) || {}, i = new Map(r.components);
      return i.set(n, o), s.set(t, { ...r, components: i }), { shadowStateStore: s };
    });
  },
  unregisterComponent: (t, n) => {
    a((o) => {
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
      const S = [t, ...i].join("."), c = e.get(S);
      c && c.isDirty !== !0 ? (e.set(S, { ...c, isDirty: !0 }), s = !0) : c || (e.set(S, { isDirty: !0 }), s = !0);
    };
    if (r(n), o.bubble) {
      let i = [...n];
      for (; i.length > 0; )
        i.pop(), r(i);
    }
    s && a({ shadowStateStore: e });
  },
  serverStateUpdates: /* @__PURE__ */ new Map(),
  setServerStateUpdate: (t, n) => {
    a((o) => {
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
    a((o) => {
      const e = new Map(o.shadowStateStore), r = e.get(t)?.components, i = t + ".";
      for (const c of Array.from(e.keys()))
        (c === t || c.startsWith(i)) && e.delete(c);
      const S = (c, p) => {
        const d = [t, ...p].join(".");
        if (Array.isArray(c)) {
          const h = [];
          c.forEach(() => {
            const w = `id:${m()}`;
            h.push(d + "." + w);
          }), e.set(d, { arrayKeys: h }), c.forEach((w, y) => {
            const l = h[y].split(".").pop();
            S(w, [...p, l]);
          });
        } else if (b(c)) {
          const h = Object.fromEntries(
            Object.keys(c).map((w) => [w, d + "." + w])
          );
          e.set(d, { fields: h }), Object.keys(c).forEach((w) => {
            S(c[w], [...p, w]);
          });
        } else
          e.set(d, { value: c });
      };
      if (S(n, []), r) {
        const c = e.get(t) || {};
        e.set(t, {
          ...c,
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
    r.set(e, i), a({ shadowStateStore: r });
  },
  setTransformCache: (t, n, o, e) => {
    const s = [t, ...n].join("."), r = new Map(f().shadowStateStore), i = r.get(s) || {};
    i.transformCaches || (i.transformCaches = /* @__PURE__ */ new Map()), i.transformCaches.set(o, e), r.set(s, i), a({ shadowStateStore: r });
  },
  insertShadowArrayElement: (t, n, o) => {
    const e = new Map(f().shadowStateStore), s = [t, ...n].join("."), r = e.get(s);
    if (!r || !r.arrayKeys) return;
    const i = `id:${m()}`, S = s + "." + i, c = [...r.arrayKeys];
    c.push(S), e.set(s, { ...r, arrayKeys: c });
    const p = (d, h) => {
      const w = [t, ...h].join(".");
      if (!Array.isArray(d)) if (typeof d == "object" && d !== null) {
        const y = Object.fromEntries(
          Object.keys(d).map((l) => [l, w + "." + l])
        );
        e.set(w, { fields: y }), Object.entries(d).forEach(([l, M]) => {
          p(M, [...h, l]);
        });
      } else
        e.set(w, { value: d });
    };
    p(o, [...n, i]), a({ shadowStateStore: e }), f().notifyPathSubscribers(s, {
      type: "INSERT",
      path: s,
      itemKey: S
    });
  },
  removeShadowArrayElement: (t, n) => {
    const o = new Map(f().shadowStateStore), e = [t, ...n].join("."), s = n.slice(0, -1), r = [t, ...s].join("."), i = o.get(r);
    if (i && i.arrayKeys && i.arrayKeys.findIndex(
      (c) => c === e
    ) !== -1) {
      const c = i.arrayKeys.filter(
        (d) => d !== e
      );
      o.set(r, {
        ...i,
        arrayKeys: c
      });
      const p = e + ".";
      for (const d of Array.from(o.keys()))
        (d === e || d.startsWith(p)) && o.delete(d);
    }
    a({ shadowStateStore: o }), f().notifyPathSubscribers(r, {
      type: "REMOVE",
      path: r,
      itemKey: e
      // The exact ID of the removed item
    });
  },
  updateShadowAtPath: (t, n, o) => {
    const e = new Map(f().shadowStateStore), s = [t, ...n].join("."), r = (i, S) => {
      const c = e.get(i);
      if (b(S) && c && c.fields) {
        for (const p in S)
          if (Object.prototype.hasOwnProperty.call(S, p)) {
            const d = c.fields[p], h = S[p];
            d && r(d, h);
          }
      } else {
        const p = e.get(i) || {};
        e.set(i, { ...p, value: S });
      }
    };
    r(s, o), f().notifyPathSubscribers(s, { type: "UPDATE", newValue: o }), a({ shadowStateStore: e });
  },
  selectedIndicesMap: /* @__PURE__ */ new Map(),
  getSelectedIndex: (t, n) => {
    const o = f().selectedIndicesMap.get(t);
    if (!o) return -1;
    const e = n || E.getState().getShadowMetadata(t, [])?.arrayKeys;
    return e ? e.indexOf(o) : -1;
  },
  setSelectedIndex: (t, n) => {
    a((o) => {
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
    a((n) => {
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
    a((n) => {
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
    a((o) => {
      const e = o.stateLog[t] ?? [], s = n(e);
      return {
        stateLog: {
          ...o.stateLog,
          [t]: s
        }
      };
    });
  },
  getInitialOptions: (t) => f().initialStateOptions[t],
  setInitialStateOptions: (t, n) => {
    a((o) => ({
      initialStateOptions: {
        ...o.initialStateOptions,
        [t]: n
      }
    }));
  },
  updateInitialStateGlobal: (t, n) => {
    a((o) => ({
      initialStateGlobal: {
        ...o.initialStateGlobal,
        [t]: n
      }
    }));
  },
  syncInfoStore: /* @__PURE__ */ new Map(),
  setSyncInfo: (t, n) => a((o) => {
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
