"use client";
import { jsx as ne, Fragment as De } from "react/jsx-runtime";
import { pluginStore as ae } from "./pluginStore.js";
import { useState as X, useRef as j, useCallback as pe, useEffect as x, useLayoutEffect as le, useMemo as Te, createElement as be, startTransition as Ce } from "react";
import { transformStateFunc as Ue, isFunction as z, isDeepEqual as se } from "./utility.js";
import { ValidationWrapper as _e, IsolatedComponentWrapper as Oe, FormElementWrapper as Fe, MemoizedCogsItemWrapper as je } from "./Components.jsx";
import Ne from "superjson";
import { v4 as K } from "uuid";
import { getGlobalStore as T } from "./store.js";
import { useCogsConfig as ke } from "./CogsStateClient.jsx";
const {
  getInitialOptions: H,
  updateInitialStateGlobal: Ve,
  getShadowMetadata: M,
  setShadowMetadata: J,
  getShadowValue: N,
  initializeShadowState: ie,
  initializeAndMergeShadowState: Re,
  updateShadowAtPath: xe,
  insertShadowArrayElement: Le,
  insertManyShadowArrayElements: Be,
  removeShadowArrayElement: We,
  setInitialStateOptions: ue,
  setServerStateUpdate: Ee,
  markAsDirty: Ie,
  addPathComponent: qe,
  clearSelectedIndexesForState: He,
  addStateLog: Ge,
  setSyncInfo: $t,
  clearSelectedIndex: ze,
  getSyncInfo: Je,
  notifyPathSubscribers: Ye,
  getPluginMetaDataMap: Ze,
  setPluginMetaData: Qe,
  removePluginMetaData: Xe
  // Note: The old functions are no longer imported under their original names
} = T.getState();
function W(e, o, g) {
  const s = M(e, o);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, o), keys: [] };
  const i = o.length > 0 ? o.join(".") : "root", u = g?.arrayViews?.[i] ?? s.arrayKeys;
  return Array.isArray(u) && u.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, o, u), keys: u ?? [] };
}
function he(e, o, g) {
  for (let s = 0; s < e.length; s++)
    if (g(e[s], s)) {
      const v = o[s];
      if (v)
        return { key: v, index: s, value: e[s] };
    }
  return null;
}
function ve(e, o) {
  const g = H(e) || {};
  ue(e, {
    ...g,
    ...o
  });
}
function Me({
  stateKey: e,
  options: o,
  initialOptionsPart: g
}) {
  const s = H(e) || {};
  let i = { ...g[e] || {}, ...s }, u = !1;
  if (o) {
    const l = (t, a) => {
      for (const S in a)
        a.hasOwnProperty(S) && (a[S] instanceof Object && !Array.isArray(a[S]) && t[S] instanceof Object ? se(t[S], a[S]) || (l(t[S], a[S]), u = !0) : t[S] !== a[S] && (t[S] = a[S], u = !0));
      return t;
    };
    i = l(i, o);
  }
  return i.syncOptions && (!o || !o.hasOwnProperty("syncOptions")) && (u = !0), (i.validation && i?.validation?.zodSchemaV4 || i?.validation?.zodSchemaV3) && (o?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || (i.validation.onBlur = "error")), u && ue(e, i), i;
}
function bt(e, o) {
  return {
    ...o,
    initialState: e,
    _addStateOptions: !0
  };
}
const It = (e, o) => {
  o?.plugins && ae.getState().setRegisteredPlugins(o.plugins);
  const [g, s] = Ue(e);
  Object.keys(g).forEach((u) => {
    let l = s[u] || {};
    const t = {
      ...l
    };
    if (o?.formElements && (t.formElements = {
      ...o.formElements,
      ...l.formElements || {}
    }), o?.validation && (t.validation = {
      ...o.validation,
      ...l.validation || {}
    }, o.validation.key && !l.validation?.key && (t.validation.key = `${o.validation.key}.${u}`)), Object.keys(t).length > 0) {
      const a = H(u);
      a ? ue(u, {
        ...a,
        ...t
      }) : ue(u, t);
    }
  }), Object.keys(g).forEach((u) => {
    ie(u, g[u]);
  });
  const v = (u, l) => {
    const [t] = X(l?.componentId ?? K()), a = Me({
      stateKey: u,
      options: l,
      initialOptionsPart: s
    }), S = j(a);
    S.current = a;
    const D = N(u, []) || g[u], O = lt(D, {
      stateKey: u,
      syncUpdate: l?.syncUpdate,
      componentId: t,
      localStorage: l?.localStorage,
      middleware: l?.middleware,
      reactiveType: l?.reactiveType,
      reactiveDeps: l?.reactiveDeps,
      defaultState: l?.defaultState,
      dependencies: l?.dependencies,
      serverState: l?.serverState,
      syncOptions: l?.syncOptions
    });
    return x(() => {
      l && ae.getState().setPluginOptionsForState(u, l);
    }, [u, l]), x(() => (console.log("adding handler 1", u, O), ae.getState().stateHandlers.set(u, O), () => {
      ae.getState().stateHandlers.delete(u);
    }), [u, O]), O;
  };
  function i(u, l) {
    Me({ stateKey: u, options: l, initialOptionsPart: s }), l.localStorage && et(u, l), ee(u);
  }
  return {
    useCogsState: v,
    setCogsOptions: i
  };
}, Ke = (e, o, g, s, v) => {
  g?.log && console.log(
    "saving to localstorage",
    o,
    g.localStorage?.key,
    s
  );
  const i = z(g?.localStorage?.key) ? g.localStorage?.key(e) : g?.localStorage?.key;
  if (i && s) {
    const u = `${s}-${o}-${i}`;
    let l;
    try {
      l = ge(u)?.lastSyncedWithServer;
    } catch {
    }
    const t = M(o, []), a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, S = Ne.serialize(a);
    window.localStorage.setItem(
      u,
      JSON.stringify(S.json)
    );
  }
}, ge = (e) => {
  if (!e) return null;
  try {
    const o = window.localStorage.getItem(e);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, et = (e, o) => {
  const g = N(e, []), { sessionId: s } = ke(), v = z(o?.localStorage?.key) ? o.localStorage.key(g) : o?.localStorage?.key;
  if (v && s) {
    const i = ge(
      `${s}-${e}-${v}`
    );
    if (i && i.lastUpdated > (i.lastSyncedWithServer || 0))
      return ee(e), !0;
  }
  return !1;
}, ee = (e) => {
  const o = M(e, []);
  if (!o) return;
  const g = /* @__PURE__ */ new Set();
  o?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || g.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    g.forEach((s) => s());
  });
};
function de(e, o, g, s) {
  const v = M(e, o);
  if (J(e, o, {
    ...v,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(g)) {
    const i = M(e, o);
    i?.arrayKeys && i.arrayKeys.forEach((u, l) => {
      const t = [...o, u], a = g[l];
      a !== void 0 && de(
        e,
        t,
        a,
        s
      );
    });
  } else g && typeof g == "object" && g.constructor === Object && Object.keys(g).forEach((i) => {
    const u = [...o, i], l = g[i];
    de(e, u, l, s);
  });
}
let fe = [], $e = !1;
function tt() {
  $e || ($e = !0, queueMicrotask(it));
}
function rt(e, o, g) {
  const s = T.getState().getShadowValue(e, o), v = z(g) ? g(s) : g;
  xe(e, o, v), Ie(e, o, { bubble: !0 });
  const i = M(e, o);
  return {
    type: "update",
    oldValue: s,
    newValue: v,
    shadowMeta: i
  };
}
function nt(e, o) {
  e?.signals?.length && e.signals.forEach(({ parentId: g, position: s, effect: v }) => {
    const i = document.querySelector(`[data-parent-id="${g}"]`);
    if (!i) return;
    const u = Array.from(i.childNodes);
    if (!u[s]) return;
    let l = o;
    if (v && o !== null)
      try {
        l = new Function("state", `return (${v})(state)`)(
          o
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    l !== null && typeof l == "object" && (l = JSON.stringify(l)), u[s].textContent = String(l ?? "");
  });
}
function ot(e, o, g) {
  const s = M(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const v = /* @__PURE__ */ new Set();
  let i = o;
  g.type === "insert" && g.itemId && (i = o);
  let u = [...i];
  for (; ; ) {
    const l = M(e, u);
    if (l?.pathComponents && l.pathComponents.forEach((t) => {
      const a = s.components?.get(t);
      a && ((Array.isArray(a.reactiveType) ? a.reactiveType : [a.reactiveType || "component"]).includes("none") || v.add(a));
    }), u.length === 0) break;
    u.pop();
  }
  return s.components.forEach((l, t) => {
    if (v.has(l))
      return;
    const a = Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"];
    if (a.includes("all"))
      v.add(l);
    else if (a.includes("deps") && l.depsFunction) {
      const S = N(e, []), D = l.depsFunction(S);
      (D === !0 || Array.isArray(D) && !se(l.prevDeps, D)) && (l.prevDeps = D, v.add(l));
    }
  }), v;
}
function at(e, o, g, s, v) {
  let i;
  if (z(g)) {
    const { value: a } = Q(e, o);
    i = g({ state: a, uuid: K() });
  } else
    i = g;
  const u = Le(
    e,
    o,
    i,
    s,
    v
  );
  Ie(e, o, { bubble: !0 });
  const l = M(e, o);
  let t;
  return l?.arrayKeys, {
    type: "insert",
    newValue: i,
    shadowMeta: l,
    path: o,
    itemId: u,
    insertAfterId: t
  };
}
function st(e, o) {
  const g = o.slice(0, -1), s = N(e, o);
  return We(e, o), Ie(e, g, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: g };
}
function it() {
  const e = /* @__PURE__ */ new Set(), o = [], g = [];
  for (const s of fe) {
    if (s.status && s.updateType) {
      g.push(s);
      continue;
    }
    const v = s, i = v.type === "cut" ? null : v.newValue;
    v.shadowMeta?.signals?.length > 0 && o.push({ shadowMeta: v.shadowMeta, displayValue: i }), ot(
      v.stateKey,
      v.path,
      v
    ).forEach((l) => {
      e.add(l);
    });
  }
  g.length > 0 && Ge(g), o.forEach(({ shadowMeta: s, displayValue: v }) => {
    nt(s, v);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), fe = [], $e = !1;
}
function ct(e, o, g, s) {
  return (i, u, l, t) => {
    v(e, u, i, l);
  };
  function v(i, u, l, t) {
    let a;
    switch (t.updateType) {
      case "update":
        a = rt(i, u, l);
        break;
      case "insert":
        a = at(
          i,
          u,
          l,
          void 0,
          t.itemId
        );
        break;
      case "cut":
        a = st(i, u);
        break;
    }
    a.stateKey = i, a.path = u, fe.push(a), tt();
    const S = {
      timeStamp: Date.now(),
      stateKey: i,
      path: u,
      updateType: t.updateType,
      status: "new",
      oldValue: a.oldValue,
      newValue: a.newValue ?? null,
      itemId: a.itemId,
      insertAfterId: a.insertAfterId,
      metaData: t.metaData
    };
    fe.push(S), a.newValue !== void 0 && Ke(
      a.newValue,
      i,
      s.current,
      g
    ), s.current?.middleware && s.current.middleware({ update: S }), ae.getState().notifyUpdate(S);
  }
}
function lt(e, {
  stateKey: o,
  localStorage: g,
  formElements: s,
  reactiveDeps: v,
  reactiveType: i,
  componentId: u,
  defaultState: l,
  syncUpdate: t,
  dependencies: a,
  serverState: S
} = {}) {
  const [D, O] = X({}), { sessionId: C } = ke();
  let L = !o;
  const [w] = X(o ?? K()), q = j(u ?? K()), m = j(
    null
  );
  m.current = H(w) ?? null;
  const te = pe(
    (y) => {
      const d = y ? { ...H(w), ...y } : H(w), h = d?.defaultState || l || e;
      if (d?.serverState?.status === "success" && d?.serverState?.data !== void 0)
        return {
          value: d.serverState.data,
          source: "server",
          timestamp: d.serverState.timestamp || Date.now()
        };
      if (d?.localStorage?.key && C) {
        const $ = z(d.localStorage.key) ? d.localStorage.key(h) : d.localStorage.key, I = ge(
          `${C}-${w}-${$}`
        );
        if (I && I.lastUpdated > (d?.serverState?.timestamp || 0))
          return {
            value: I.state,
            source: "localStorage",
            timestamp: I.lastUpdated
          };
      }
      return {
        value: h || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, l, e, C]
  );
  x(() => {
    S && S.status === "success" && S.data !== void 0 && Ee(w, S);
  }, [S, w]), x(() => T.getState().subscribeToPath(w, (f) => {
    if (f?.type === "SERVER_STATE_UPDATE") {
      const d = f.serverState;
      if (d?.status !== "success" || d.data === void 0)
        return;
      ve(w, { serverState: d });
      const h = typeof d.merge == "object" ? d.merge : d.merge === !0 ? { strategy: "append", key: "id" } : null, p = N(w, []), $ = d.data;
      if (h && h.strategy === "append" && "key" in h && Array.isArray(p) && Array.isArray($)) {
        const I = h.key;
        if (!I) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const A = new Set(
          p.map((b) => b[I])
        ), E = $.filter(
          (b) => !A.has(b[I])
        );
        E.length > 0 && Be(w, [], E);
        const U = N(w, []);
        de(
          w,
          [],
          U,
          d.timestamp || Date.now()
        );
      } else
        ie(w, $), de(
          w,
          [],
          $,
          d.timestamp || Date.now()
        );
      ee(w);
    }
  }), [w]), x(() => {
    const y = T.getState().getShadowMetadata(w, []);
    if (y && y.stateSource)
      return;
    const f = H(w), d = {
      validationEnabled: !!(f?.validation?.zodSchemaV4 || f?.validation?.zodSchemaV3),
      localStorageEnabled: !!f?.localStorage?.key
    };
    if (J(w, [], {
      ...y,
      features: d
    }), f?.defaultState !== void 0 || l !== void 0) {
      const I = f?.defaultState || l;
      f?.defaultState || ve(w, {
        defaultState: I
      });
    }
    const { value: h, source: p, timestamp: $ } = te();
    ie(w, h), J(w, [], {
      stateSource: p,
      lastServerSync: p === "server" ? $ : void 0,
      isDirty: p === "server" ? !1 : void 0,
      baseServerState: p === "server" ? h : void 0
    }), p === "server" && S && Ee(w, S), ee(w);
  }, [w, ...a || []]), le(() => {
    L && ve(w, {
      formElements: s,
      defaultState: l,
      localStorage: g,
      middleware: m.current?.middleware
    });
    const y = `${w}////${q.current}`, f = M(w, []), d = f?.components || /* @__PURE__ */ new Map();
    return d.set(y, {
      forceUpdate: () => O({}),
      reactiveType: i ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: v || void 0,
      deps: v ? v(N(w, [])) : [],
      prevDeps: v ? v(N(w, [])) : []
    }), J(w, [], {
      ...f,
      components: d
    }), O({}), () => {
      const h = M(w, []), p = h?.components?.get(y);
      p?.paths && p.paths.forEach(($) => {
        const A = $.split(".").slice(1), E = T.getState().getShadowMetadata(w, A);
        E?.pathComponents && E.pathComponents.size === 0 && (delete E.pathComponents, T.getState().setShadowMetadata(w, A, E));
      }), h?.components && J(w, [], h);
    };
  }, []);
  const r = j(null), n = ct(
    w,
    r,
    C,
    m
  );
  return T.getState().initialStateGlobal[w] || Ve(w, e), Te(() => Pe(
    w,
    n,
    q.current,
    C
  ), [w, C]);
}
const ut = (e, o, g) => {
  let s = M(e, o)?.arrayKeys || [];
  const v = g?.transforms;
  if (!v || v.length === 0)
    return s;
  for (const i of v)
    if (i.type === "filter") {
      const u = [];
      s.forEach((l, t) => {
        const a = N(e, [...o, l]);
        i.fn(a, t) && u.push(l);
      }), s = u;
    } else i.type === "sort" && s.sort((u, l) => {
      const t = N(e, [...o, u]), a = N(e, [...o, l]);
      return i.fn(t, a);
    });
  return s;
}, we = (e, o, g) => {
  const s = `${e}////${o}`, i = M(e, [])?.components?.get(s);
  !i || i.reactiveType === "none" || !(Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType]).includes("component") || qe(e, g, s);
}, oe = (e, o, g) => {
  const s = M(e, []), v = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((u, l) => {
    (Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"]).includes("all") && (u.forceUpdate(), v.add(l));
  }), M(e, [
    ...o,
    "getSelected"
  ])?.pathComponents?.forEach((u) => {
    s?.components?.get(u)?.forceUpdate();
  });
  const i = M(e, o);
  for (let u of i?.arrayKeys || []) {
    const l = u + ".selected", t = M(e, l.split(".").slice(1));
    u == g && t?.pathComponents?.forEach((a) => {
      s?.components?.get(a)?.forceUpdate();
    });
  }
};
function Q(e, o, g) {
  const s = M(e, o), v = o.length > 0 ? o.join(".") : "root", i = g?.arrayViews?.[v];
  if (Array.isArray(i) && i.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const u = N(e, o, i);
  return {
    shadowMeta: s,
    value: u,
    arrayKeys: s?.arrayKeys
  };
}
function Pe(e, o, g, s) {
  const v = /* @__PURE__ */ new Map();
  function i({
    path: t = [],
    meta: a,
    componentId: S
  }) {
    const D = a ? JSON.stringify(a.arrayViews || a.transforms) : "", O = t.join(".") + ":" + S + ":" + D;
    if (v.has(O))
      return v.get(O);
    const C = [e, ...t].join("."), L = {
      get(q, m) {
        if (t.length === 0 && m in u)
          return u[m];
        if (!m.startsWith("$")) {
          const r = [...t, m];
          return i({
            path: r,
            componentId: S,
            meta: a
          });
        }
        if (m === "$_rebuildStateShape")
          return i;
        if (m === "$sync" && t.length === 0)
          return async function() {
            const r = T.getState().getInitialOptions(e), n = r?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const c = T.getState().getShadowValue(e, []), y = r?.validation?.key;
            try {
              const f = await n.action(c);
              if (f && !f.success && f.errors, f?.success) {
                const d = T.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...d,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: c
                  // Update base server state
                }), n.onSuccess && n.onSuccess(f.data);
              } else !f?.success && n.onError && n.onError(f.error);
              return f;
            } catch (f) {
              return n.onError && n.onError(f), { success: !1, error: f };
            }
          };
        if (m === "$_status" || m === "$getStatus") {
          const r = () => {
            const { shadowMeta: n, value: c } = Q(e, t, a);
            return console.log("getStatusFunc", t, n, c), n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || c !== void 0 ? "fresh" : "unknown";
          };
          return m === "$_status" ? r() : r;
        }
        if (m === "$removeStorage")
          return () => {
            const r = T.getState().initialStateGlobal[e], n = H(e), c = z(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, y = `${s}-${e}-${c}`;
            y && localStorage.removeItem(y);
          };
        if (m === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = Q(e, t, a);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (m === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            we(e, S, [
              ...t,
              "getSelected"
            ]);
            const n = T.getState().selectedIndicesMap.get(r);
            if (!n)
              return;
            const c = t.join("."), y = a?.arrayViews?.[c], f = n.split(".").pop();
            if (!(y && !y.includes(f) || N(
              e,
              n.split(".").slice(1)
            ) === void 0))
              return i({
                path: n.split(".").slice(1),
                componentId: S,
                meta: a
              });
          };
        if (m === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const n = T.getState().selectedIndicesMap.get(r);
            if (!n)
              return -1;
            const { keys: c } = W(e, t, a);
            if (!c)
              return -1;
            const y = n.split(".").pop();
            return c.indexOf(y);
          };
        if (m === "$clearSelected")
          return oe(e, t), () => {
            ze({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (m === "$useVirtualView")
          return (r) => {
            const {
              itemHeight: n = 50,
              overscan: c = 6,
              stickToBottom: y = !1,
              scrollStickTolerance: f = 75
            } = r, d = j(null), [h, p] = X({
              startIndex: 0,
              endIndex: 10
            }), [$, I] = X({}), A = j(!0);
            x(() => {
              const P = setInterval(() => {
                I({});
              }, 1e3);
              return () => clearInterval(P);
            }, []);
            const E = j({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), U = j(
              /* @__PURE__ */ new Map()
            ), { keys: b } = W(e, t, a);
            x(() => {
              const P = [e, ...t].join("."), k = T.getState().subscribeToPath(P, (F) => {
                F.type !== "GET_SELECTED" && F.type;
              });
              return () => {
                k();
              };
            }, [S, e, t.join(".")]), le(() => {
              if (y && b.length > 0 && d.current && !E.current.isUserScrolling && A.current) {
                const P = d.current, k = () => {
                  if (P.clientHeight > 0) {
                    const F = Math.ceil(
                      P.clientHeight / n
                    ), B = b.length - 1, _ = Math.max(
                      0,
                      B - F - c
                    );
                    p({ startIndex: _, endIndex: B }), requestAnimationFrame(() => {
                      Z("instant"), A.current = !1;
                    });
                  } else
                    requestAnimationFrame(k);
                };
                k();
              }
            }, [b.length, y, n, c]);
            const V = j(h);
            le(() => {
              V.current = h;
            }, [h]);
            const R = j(b);
            le(() => {
              R.current = b;
            }, [b]);
            const ce = pe(() => {
              const P = d.current;
              if (!P) return;
              const k = P.scrollTop, { scrollHeight: F, clientHeight: B } = P, _ = E.current, re = F - (k + B), Se = _.isNearBottom;
              _.isNearBottom = re <= f, k < _.lastScrollTop ? (_.scrollUpCount++, _.scrollUpCount > 3 && Se && (_.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : _.isNearBottom && (_.isUserScrolling = !1, _.scrollUpCount = 0), _.lastScrollTop = k;
              let Y = 0;
              for (let G = 0; G < b.length; G++) {
                const ye = b[G], me = U.current.get(ye);
                if (me && me.offset + me.height > k) {
                  Y = G;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                U.current,
                Y,
                h
              ), Y !== h.startIndex && h.startIndex != 0) {
                const G = Math.ceil(B / n);
                p({
                  startIndex: Math.max(0, Y - c),
                  endIndex: Math.min(
                    b.length - 1,
                    Y + G + c
                  )
                });
              }
            }, [
              b.length,
              h.startIndex,
              n,
              c,
              f
            ]);
            x(() => {
              const P = d.current;
              if (P)
                return P.addEventListener("scroll", ce, {
                  passive: !0
                }), () => {
                  P.removeEventListener("scroll", ce);
                };
            }, [ce, y]);
            const Z = pe(
              (P = "smooth") => {
                const k = d.current;
                if (!k) return;
                E.current.isUserScrolling = !1, E.current.isNearBottom = !0, E.current.scrollUpCount = 0;
                const F = () => {
                  const B = (_ = 0) => {
                    if (_ > 5) return;
                    const re = k.scrollHeight, Se = k.scrollTop, Y = k.clientHeight;
                    Se + Y >= re - 1 || (k.scrollTo({
                      top: re,
                      behavior: P
                    }), setTimeout(() => {
                      const G = k.scrollHeight, ye = k.scrollTop;
                      (G !== re || ye + Y < G - 1) && B(_ + 1);
                    }, 50));
                  };
                  B();
                };
                "requestIdleCallback" in window ? requestIdleCallback(F, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(F);
                });
              },
              []
            );
            return x(() => {
              if (!y || !d.current) return;
              const P = d.current, k = E.current;
              let F;
              const B = () => {
                clearTimeout(F), F = setTimeout(() => {
                  !k.isUserScrolling && k.isNearBottom && Z(
                    A.current ? "instant" : "smooth"
                  );
                }, 100);
              }, _ = new MutationObserver(() => {
                k.isUserScrolling || B();
              });
              return _.observe(P, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), A.current ? setTimeout(() => {
                Z("instant");
              }, 0) : B(), () => {
                clearTimeout(F), _.disconnect();
              };
            }, [y, b.length, Z]), {
              virtualState: Te(() => {
                const P = Array.isArray(b) ? b.slice(h.startIndex, h.endIndex + 1) : [], k = t.length > 0 ? t.join(".") : "root";
                return i({
                  path: t,
                  componentId: S,
                  meta: {
                    ...a,
                    arrayViews: { [k]: P },
                    serverStateIsUpStream: !0
                  }
                });
              }, [h.startIndex, h.endIndex, b, a]),
              virtualizerProps: {
                outer: {
                  ref: d,
                  style: {
                    overflowY: "auto",
                    height: "100%",
                    position: "relative"
                  }
                },
                inner: {
                  style: {
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${U.current.get(b[h.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: Z,
              scrollToIndex: (P, k = "smooth") => {
                if (d.current && b[P]) {
                  const F = U.current.get(b[P])?.offset || 0;
                  d.current.scrollTo({ top: F, behavior: k });
                }
              }
            };
          };
        if (m === "$stateMap")
          return (r) => {
            const { value: n, keys: c } = W(
              e,
              t,
              a
            );
            if (we(e, S, t), !c || !Array.isArray(n))
              return [];
            const y = i({
              path: t,
              componentId: S,
              meta: a
            });
            return n.map((f, d) => {
              const h = c[d];
              if (!h) return;
              const p = [...t, h], $ = i({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: S,
                meta: a
              });
              return r($, d, y);
            });
          };
        if (m === "$stateFilter")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { keys: c, value: y } = W(
              e,
              t,
              a
            );
            if (!Array.isArray(y))
              throw new Error("stateFilter can only be used on arrays");
            const f = [];
            return y.forEach((d, h) => {
              if (r(d, h)) {
                const p = c[h];
                p && f.push(p);
              }
            }), i({
              path: t,
              componentId: S,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [n]: f
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "filter", fn: r, path: t }
                ]
              }
            });
          };
        if (m === "$stateSort")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { value: c, keys: y } = W(
              e,
              t,
              a
            );
            if (!Array.isArray(c) || !y)
              throw new Error("No array keys found for sorting");
            const f = c.map((h, p) => ({
              item: h,
              key: y[p]
            }));
            f.sort((h, p) => r(h.item, p.item));
            const d = f.map((h) => h.key);
            return i({
              path: t,
              componentId: S,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [n]: d
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (m === "$stream")
          return function(r = {}) {
            const {
              bufferSize: n = 100,
              flushInterval: c = 100,
              bufferStrategy: y = "accumulate",
              store: f,
              onFlush: d
            } = r;
            let h = [], p = !1, $ = null;
            const I = (V) => {
              if (!p) {
                if (y === "sliding" && h.length >= n)
                  h.shift();
                else if (y === "dropping" && h.length >= n)
                  return;
                h.push(V), h.length >= n && A();
              }
            }, A = () => {
              if (h.length === 0) return;
              const V = [...h];
              if (h = [], f) {
                const R = f(V);
                R !== void 0 && (Array.isArray(R) ? R : [R]).forEach((Z) => {
                  o(Z, t, {
                    updateType: "insert"
                  });
                });
              } else
                V.forEach((R) => {
                  o(R, t, {
                    updateType: "insert"
                  });
                });
              d?.(V);
            };
            c > 0 && ($ = setInterval(A, c));
            const E = K(), U = M(e, t) || {}, b = U.streams || /* @__PURE__ */ new Map();
            return b.set(E, { buffer: h, flushTimer: $ }), J(e, t, {
              ...U,
              streams: b
            }), {
              write: (V) => I(V),
              writeMany: (V) => V.forEach(I),
              flush: () => A(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, h.length > 0 && A();
              },
              close: () => {
                A(), $ && clearInterval($);
                const V = T.getState().getShadowMetadata(e, t);
                V?.streams && V.streams.delete(E);
              }
            };
          };
        if (m === "$stateList")
          return (r) => /* @__PURE__ */ ne(() => {
            const c = j(/* @__PURE__ */ new Map()), [y, f] = X({}), d = t.length > 0 ? t.join(".") : "root", h = ut(e, t, a), p = Te(() => ({
              ...a,
              arrayViews: {
                ...a?.arrayViews || {},
                [d]: h
              }
            }), [a, d, h]), { value: $ } = W(
              e,
              t,
              p
            );
            if (x(() => {
              const E = T.getState().subscribeToPath(C, (U) => {
                if (U.type === "GET_SELECTED")
                  return;
                const V = T.getState().getShadowMetadata(e, t)?.transformCaches;
                if (V)
                  for (const R of V.keys())
                    R.startsWith(S) && V.delete(R);
                (U.type === "INSERT" || U.type === "INSERT_MANY" || U.type === "REMOVE" || U.type === "CLEAR_SELECTION" || U.type === "SERVER_STATE_UPDATE" && !a?.serverStateIsUpStream) && f({});
              });
              return () => {
                E();
              };
            }, [S, C]), !Array.isArray($))
              return null;
            const I = i({
              path: t,
              componentId: S,
              meta: p
              // Use updated meta here
            }), A = $.map((E, U) => {
              const b = h[U];
              if (!b)
                return null;
              let V = c.current.get(b);
              V || (V = K(), c.current.set(b, V));
              const R = [...t, b];
              return be(je, {
                key: b,
                stateKey: e,
                itemComponentId: V,
                itemPath: R,
                localIndex: U,
                arraySetter: I,
                rebuildStateShape: i,
                renderFn: r
              });
            });
            return /* @__PURE__ */ ne(De, { children: A });
          }, {});
        if (m === "$stateFlattenOn")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", c = a?.arrayViews?.[n], y = T.getState().getShadowValue(e, t, c);
            return Array.isArray(y) ? i({
              path: [...t, "[*]", r],
              componentId: S,
              meta: a
            }) : [];
          };
        if (m === "$index")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", c = a?.arrayViews?.[n];
            if (c) {
              const d = c[r];
              return d ? i({
                path: [...t, d],
                componentId: S,
                meta: a
              }) : void 0;
            }
            const y = M(e, t);
            if (!y?.arrayKeys) return;
            const f = y.arrayKeys[r];
            if (f)
              return i({
                path: [...t, f],
                componentId: S,
                meta: a
              });
          };
        if (m === "$last")
          return () => {
            const { keys: r } = W(e, t, a);
            if (!r || r.length === 0)
              return;
            const n = r[r.length - 1];
            if (!n)
              return;
            const c = [...t, n];
            return i({
              path: c,
              componentId: S,
              meta: a
            });
          };
        if (m === "$insert")
          return (r, n) => {
            o(r, t, { updateType: "insert" });
          };
        if (m === "$uniqueInsert")
          return (r, n, c) => {
            const { value: y } = Q(
              e,
              t,
              a
            ), f = z(r) ? r(y) : r;
            let d = null;
            if (!y.some((p) => {
              const $ = n ? n.every(
                (I) => se(p[I], f[I])
              ) : se(p, f);
              return $ && (d = p), $;
            }))
              o(f, t, { updateType: "insert" });
            else if (c && d) {
              const p = c(d), $ = y.map(
                (I) => se(I, d) ? p : I
              );
              o($, t, {
                updateType: "update"
              });
            }
          };
        if (m === "$cut")
          return (r, n) => {
            const c = M(e, t);
            if (!c?.arrayKeys || c.arrayKeys.length === 0)
              return;
            const y = r === -1 ? c.arrayKeys.length - 1 : r !== void 0 ? r : c.arrayKeys.length - 1, f = c.arrayKeys[y];
            f && o(null, [...t, f], {
              updateType: "cut"
            });
          };
        if (m === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: n } = W(e, t, a);
            if (!n || n.length === 0)
              return;
            const c = T.getState().selectedIndicesMap.get(r);
            if (!c)
              return;
            const y = c.split(".").pop();
            if (!n.includes(y))
              return;
            const f = c.split(".").slice(1);
            T.getState().clearSelectedIndex({ arrayKey: r });
            const d = f.slice(0, -1);
            oe(e, d), o(null, f, {
              updateType: "cut"
            });
          };
        if (m === "$cutByValue")
          return (r) => {
            const {
              isArray: n,
              value: c,
              keys: y
            } = W(e, t, a);
            if (!n) return;
            const f = he(c, y, (d) => d === r);
            f && o(null, [...t, f.key], {
              updateType: "cut"
            });
          };
        if (m === "$toggleByValue")
          return (r) => {
            const {
              isArray: n,
              value: c,
              keys: y
            } = W(e, t, a);
            if (!n) return;
            const f = he(c, y, (d) => d === r);
            if (f) {
              const d = [...t, f.key];
              o(null, d, {
                updateType: "cut"
              });
            } else
              o(r, t, { updateType: "insert" });
          };
        if (m === "$findWith")
          return (r, n) => {
            const { isArray: c, value: y, keys: f } = W(e, t, a);
            if (!c)
              throw new Error("findWith can only be used on arrays");
            const d = he(
              y,
              f,
              (h) => h?.[r] === n
            );
            return i(d ? {
              path: [...t, d.key],
              componentId: S,
              meta: a
            } : {
              path: [...t, `not_found_${K()}`],
              componentId: S,
              meta: a
            });
          };
        if (m === "$cutThis") {
          const { value: r } = Q(e, t, a), n = t.slice(0, -1);
          return oe(e, n), () => {
            o(r, t, { updateType: "cut" });
          };
        }
        if (m === "$get")
          return () => {
            we(e, S, t);
            const { value: r } = Q(e, t, a);
            return r;
          };
        if (m === "$$derive")
          return (r) => Ae({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: a
          });
        if (m === "$formInput") {
          const r = (n) => {
            const c = M(e, n);
            return c?.formRef?.current ? c.formRef.current : (console.warn(
              `Form element ref not found for stateKey "${e}" at path "${n.join(".")}"`
            ), null);
          };
          return {
            setDisabled: (n) => {
              const c = r(t);
              c && (c.disabled = n);
            },
            focus: () => {
              r(t)?.focus();
            },
            blur: () => {
              r(t)?.blur();
            },
            scrollIntoView: (n) => {
              r(t)?.scrollIntoView(
                n ?? { behavior: "smooth", block: "center" }
              );
            },
            click: () => {
              r(t)?.click();
            },
            selectText: () => {
              const n = r(t);
              n && typeof n.select == "function" && n.select();
            }
          };
        }
        if (m === "$$get")
          return () => Ae({ _stateKey: e, _path: t, _meta: a });
        if (m === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return Je(r);
        }
        if (m == "getLocalStorage")
          return (r) => ge(s + "-" + e + "-" + r);
        if (m === "$isSelected") {
          const r = t.slice(0, -1);
          if (M(e, r)?.arrayKeys) {
            const c = e + "." + r.join("."), y = T.getState().selectedIndicesMap.get(c), f = e + "." + t.join(".");
            return y === f;
          }
          return;
        }
        if (m === "$setSelected")
          return (r) => {
            const n = t.slice(0, -1), c = e + "." + n.join("."), y = e + "." + t.join(".");
            oe(e, n, void 0), T.getState().selectedIndicesMap.get(c), r && T.getState().setSelectedIndex(c, y);
          };
        if (m === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), n = e + "." + r.join("."), c = e + "." + t.join(".");
            T.getState().selectedIndicesMap.get(n) === c ? T.getState().clearSelectedIndex({ arrayKey: n }) : T.getState().setSelectedIndex(n, c), oe(e, r);
          };
        if (m === "$_componentId")
          return S;
        if (t.length == 0) {
          if (m === "$useFocusedFormElement")
            return () => {
              const { subscribeToPath: r } = T.getState(), n = `${e}.__focusedElement`, [c, y] = X(
                // Lazily get the initial value from the root metadata.
                () => M(e, [])?.focusedElement || null
              );
              return x(() => r(
                n,
                y
              ), [e]), c;
            };
          if (m === "$_applyUpdate")
            return (r, n, c = "update") => {
              o(r, n, { updateType: c });
            };
          if (m === "$_getEffectiveSetState")
            return o;
          if (m === "$getPluginMetaData")
            return (r) => Ze(e, t)?.get(r);
          if (m === "$addPluginMetaData")
            return console.log("$addPluginMetaDat"), (r, n) => Qe(e, r, n);
          if (m === "$removePluginMetaData")
            return (r) => Xe(e, t, r);
          if (m === "$addZodValidation")
            return (r, n) => {
              r.forEach((c) => {
                const y = T.getState().getShadowMetadata(e, c.path) || {};
                T.getState().setShadowMetadata(e, c.path, {
                  ...y,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: n || "client",
                        message: c.message,
                        severity: "error",
                        code: c.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                });
              });
            };
          if (m === "$clearZodValidation")
            return (r) => {
              if (!r)
                throw new Error("clearZodValidation requires a path");
              const n = M(e, r) || {};
              J(e, r, {
                ...n,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (m === "$applyOperation")
            return (r, n) => {
              const c = r.validation || [];
              if (!r || !r.path) {
                console.error(
                  "Invalid operation received by $applyOperation:",
                  r
                );
                return;
              }
              const y = c.map((f) => ({
                source: "sync_engine",
                message: f.message,
                severity: "warning",
                code: f.code
              }));
              T.getState().setShadowMetadata(e, r.path, {
                stateVersion: r.version,
                validation: {
                  status: y.length > 0 ? "INVALID" : "VALID",
                  errors: y,
                  lastValidated: Date.now()
                }
              }), o(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                metaData: n
              });
            };
          if (m === "$applyJsonPatch")
            return (r) => {
              const n = T.getState(), c = n.getShadowMetadata(e, []);
              if (!c?.components) return;
              const y = (d) => !d || d === "/" ? [] : d.split("/").slice(1).map((h) => h.replace(/~1/g, "/").replace(/~0/g, "~")), f = /* @__PURE__ */ new Set();
              for (const d of r) {
                const h = y(d.path);
                switch (d.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = d;
                    n.updateShadowAtPath(e, h, p), n.markAsDirty(e, h, { bubble: !0 });
                    let $ = [...h];
                    for (; ; ) {
                      const I = n.getShadowMetadata(
                        e,
                        $
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((A) => {
                        if (!f.has(A)) {
                          const E = c.components?.get(A);
                          E && (E.forceUpdate(), f.add(A));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = h.slice(0, -1);
                    n.removeShadowArrayElement(e, h), n.markAsDirty(e, p, { bubble: !0 });
                    let $ = [...p];
                    for (; ; ) {
                      const I = n.getShadowMetadata(
                        e,
                        $
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((A) => {
                        if (!f.has(A)) {
                          const E = c.components?.get(A);
                          E && (E.forceUpdate(), f.add(A));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (m === "$getComponents")
            return () => M(e, [])?.components;
        }
        if (m === "$validationWrapper")
          return ({
            children: r,
            hideMessage: n
          }) => /* @__PURE__ */ ne(
            _e,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: r
            }
          );
        if (m === "$_stateKey") return e;
        if (m === "$_path") return t;
        if (m === "$update")
          return (r) => (o(r, t, { updateType: "update" }), {
            synced: () => {
              const n = T.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...n,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const c = [e, ...t].join(".");
              Ye(c, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (m === "$toggle") {
          const { value: r } = Q(
            e,
            t,
            a
          );
          if (typeof r != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            o(!r, t, {
              updateType: "update"
            });
          };
        }
        if (m === "$isolate")
          return (r) => /* @__PURE__ */ ne(
            Oe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              renderFn: r
            }
          );
        if (m === "$formElement")
          return (r, n) => /* @__PURE__ */ ne(
            Fe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              setState: o,
              formOpts: n,
              renderFn: r
            }
          );
        const te = [...t, m];
        return i({
          path: te,
          componentId: S,
          meta: a
        });
      }
    }, w = new Proxy({}, L);
    return v.set(O, w), w;
  }
  const u = {
    $revertToInitialState: (t) => {
      const a = T.getState().getShadowMetadata(e, []);
      let S;
      a?.stateSource === "server" && a.baseServerState ? S = a.baseServerState : S = T.getState().initialStateGlobal[e], He(e), ie(e, S), i({
        path: [],
        componentId: g
      });
      const D = H(e), O = z(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, C = `${s}-${e}-${O}`;
      return C && localStorage.removeItem(C), ee(e), S;
    },
    $initializeAndMergeShadowState: (t) => {
      Re(e, t), ee(e);
    },
    $updateInitialState: (t) => {
      const a = Pe(
        e,
        o,
        g,
        s
      ), S = T.getState().initialStateGlobal[e], D = H(e), O = z(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, C = `${s}-${e}-${O}`;
      return localStorage.getItem(C) && localStorage.removeItem(C), Ce(() => {
        Ve(e, t), ie(e, t);
        const L = T.getState().getShadowMetadata(e, []);
        L && L?.components?.forEach((w) => {
          w.forceUpdate();
        });
      }), {
        fetchId: (L) => a.$get()[L]
      };
    }
  };
  return i({
    componentId: g,
    path: []
  });
}
function Ae(e) {
  return be(dt, { proxy: e });
}
function dt({
  proxy: e
}) {
  const o = j(null), g = j(null), s = j(!1), v = `${e._stateKey}-${e._path.join(".")}`, i = e._path.length > 0 ? e._path.join(".") : "root", u = e._meta?.arrayViews?.[i], l = N(e._stateKey, e._path, u);
  return x(() => {
    const t = o.current;
    if (!t || s.current) return;
    const a = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", v);
        return;
      }
      const S = t.parentElement, O = Array.from(S.childNodes).indexOf(t);
      let C = S.getAttribute("data-parent-id");
      C || (C = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", C)), g.current = `instance-${crypto.randomUUID()}`;
      const L = T.getState().getShadowMetadata(e._stateKey, e._path) || {}, w = L.signals || [];
      w.push({
        instanceId: g.current,
        parentId: C,
        position: O,
        effect: e._effect
      }), T.getState().setShadowMetadata(e._stateKey, e._path, {
        ...L,
        signals: w
      });
      let q = l;
      if (e._effect)
        try {
          q = new Function(
            "state",
            `return (${e._effect})(state)`
          )(l);
        } catch (te) {
          console.error("Error evaluating effect function:", te);
        }
      q !== null && typeof q == "object" && (q = JSON.stringify(q));
      const m = document.createTextNode(String(q ?? ""));
      t.replaceWith(m), s.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(a), g.current) {
        const S = T.getState().getShadowMetadata(e._stateKey, e._path) || {};
        S.signals && (S.signals = S.signals.filter(
          (D) => D.instanceId !== g.current
        ), T.getState().setShadowMetadata(e._stateKey, e._path, S));
      }
    };
  }, []), be("span", {
    ref: o,
    style: { display: "contents" },
    "data-signal-id": v
  });
}
export {
  Ae as $cogsSignal,
  bt as addStateOptions,
  It as createCogsState,
  lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
