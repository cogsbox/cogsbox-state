"use client";
import { jsx as ne, Fragment as Ce } from "react/jsx-runtime";
import { pluginStore as ae } from "./pluginStore.js";
import { useState as ee, useRef as j, useCallback as ue, useEffect as W, useLayoutEffect as le, useMemo as Te, createElement as Me, startTransition as Ue } from "react";
import { transformStateFunc as _e, isFunction as z, isDeepEqual as se } from "./utility.js";
import { ValidationWrapper as Oe, IsolatedComponentWrapper as Fe, FormElementWrapper as je, MemoizedCogsItemWrapper as Ne } from "./Components.jsx";
import Re from "superjson";
import { v4 as K } from "uuid";
import { getGlobalStore as T, formRefStore as Ie } from "./store.js";
import { useCogsConfig as Ve } from "./CogsStateClient.jsx";
const {
  getInitialOptions: q,
  updateInitialStateGlobal: Pe,
  getShadowMetadata: P,
  setShadowMetadata: J,
  getShadowValue: N,
  initializeShadowState: ie,
  initializeAndMergeShadowState: xe,
  updateShadowAtPath: Le,
  insertShadowArrayElement: Be,
  insertManyShadowArrayElements: We,
  removeShadowArrayElement: qe,
  setInitialStateOptions: de,
  setServerStateUpdate: Ee,
  markAsDirty: $e,
  addPathComponent: He,
  clearSelectedIndexesForState: Ge,
  addStateLog: ze,
  setSyncInfo: Mt,
  clearSelectedIndex: Je,
  getSyncInfo: Ye,
  notifyPathSubscribers: Ze,
  getPluginMetaDataMap: Qe,
  setPluginMetaData: Xe,
  removePluginMetaData: Ke
  // Note: The old functions are no longer imported under their original names
} = T.getState();
function B(e, n, g) {
  const s = P(e, n);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, n), keys: [] };
  const c = n.length > 0 ? n.join(".") : "root", l = g?.arrayViews?.[c] ?? s.arrayKeys;
  return Array.isArray(l) && l.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, n, l), keys: l ?? [] };
}
function ve(e, n, g) {
  for (let s = 0; s < e.length; s++)
    if (g(e[s], s)) {
      const m = n[s];
      if (m)
        return { key: m, index: s, value: e[s] };
    }
  return null;
}
function we(e, n) {
  const g = q(e) || {};
  de(e, {
    ...g,
    ...n
  });
}
function be({
  stateKey: e,
  options: n,
  initialOptionsPart: g
}) {
  const s = q(e) || {};
  let c = { ...g[e] || {}, ...s }, l = !1;
  if (n) {
    const i = (t, o) => {
      for (const d in o)
        o.hasOwnProperty(d) && (o[d] instanceof Object && !Array.isArray(o[d]) && t[d] instanceof Object ? se(t[d], o[d]) || (i(t[d], o[d]), l = !0) : t[d] !== o[d] && (t[d] = o[d], l = !0));
      return t;
    };
    c = i(c, n);
  }
  return c.syncOptions && (!n || !n.hasOwnProperty("syncOptions")) && (l = !0), (c.validation && c?.validation?.zodSchemaV4 || c?.validation?.zodSchemaV3) && (n?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || (c.validation.onBlur = "error")), l && de(e, c), c;
}
function $t(e, n) {
  return {
    ...n,
    initialState: e,
    _addStateOptions: !0
  };
}
const It = (e, n) => {
  n?.plugins && ae.getState().setRegisteredPlugins(n.plugins);
  const [g, s] = _e(e);
  Object.keys(g).forEach((l) => {
    let i = s[l] || {};
    const t = {
      ...i
    };
    if (n?.formElements && (t.formElements = {
      ...n.formElements,
      ...i.formElements || {}
    }), n?.validation && (t.validation = {
      ...n.validation,
      ...i.validation || {}
    }, n.validation.key && !i.validation?.key && (t.validation.key = `${n.validation.key}.${l}`)), Object.keys(t).length > 0) {
      const o = q(l);
      o ? de(l, {
        ...o,
        ...t
      }) : de(l, t);
    }
  }), Object.keys(g).forEach((l) => {
    ie(l, g[l]);
  });
  const m = (l, i) => {
    const [t] = ee(i?.componentId ?? K()), o = be({
      stateKey: l,
      options: i,
      initialOptionsPart: s
    }), d = j(o);
    d.current = o;
    const E = N(l, []) || g[l], x = ue((_) => {
      ae.getState().notifyUpdate(_);
    }, []), U = ut(E, {
      stateKey: l,
      syncUpdate: i?.syncUpdate,
      componentId: t,
      localStorage: i?.localStorage,
      middleware: i?.middleware,
      reactiveType: i?.reactiveType,
      reactiveDeps: i?.reactiveDeps,
      defaultState: i?.defaultState,
      dependencies: i?.dependencies,
      serverState: i?.serverState,
      syncOptions: i?.syncOptions,
      onUpdateCallback: x
    });
    return W(() => {
      i && ae.getState().setPluginOptionsForState(l, i);
    }, [l, i]), W(() => (console.log("adding handler 1", l, U), ae.getState().stateHandlers.set(l, U), () => {
      ae.getState().stateHandlers.delete(l);
    }), [l, U]), U;
  };
  function c(l, i) {
    be({ stateKey: l, options: i, initialOptionsPart: s }), i.localStorage && tt(l, i), te(l);
  }
  return {
    useCogsState: m,
    setCogsOptions: c
  };
}, et = (e, n, g, s, m) => {
  g?.log && console.log(
    "saving to localstorage",
    n,
    g.localStorage?.key,
    s
  );
  const c = z(g?.localStorage?.key) ? g.localStorage?.key(e) : g?.localStorage?.key;
  if (c && s) {
    const l = `${s}-${n}-${c}`;
    let i;
    try {
      i = Se(l)?.lastSyncedWithServer;
    } catch {
    }
    const t = P(n, []), o = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: i,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, d = Re.serialize(o);
    window.localStorage.setItem(
      l,
      JSON.stringify(d.json)
    );
  }
}, Se = (e) => {
  if (!e) return null;
  try {
    const n = window.localStorage.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch (n) {
    return console.error("Error loading from localStorage:", n), null;
  }
}, tt = (e, n) => {
  const g = N(e, []), { sessionId: s } = Ve(), m = z(n?.localStorage?.key) ? n.localStorage.key(g) : n?.localStorage?.key;
  if (m && s) {
    const c = Se(
      `${s}-${e}-${m}`
    );
    if (c && c.lastUpdated > (c.lastSyncedWithServer || 0))
      return te(e), !0;
  }
  return !1;
}, te = (e) => {
  const n = P(e, []);
  if (!n) return;
  const g = /* @__PURE__ */ new Set();
  n?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || g.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    g.forEach((s) => s());
  });
};
function fe(e, n, g, s) {
  const m = P(e, n);
  if (J(e, n, {
    ...m,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(g)) {
    const c = P(e, n);
    c?.arrayKeys && c.arrayKeys.forEach((l, i) => {
      const t = [...n, l], o = g[i];
      o !== void 0 && fe(
        e,
        t,
        o,
        s
      );
    });
  } else g && typeof g == "object" && g.constructor === Object && Object.keys(g).forEach((c) => {
    const l = [...n, c], i = g[c];
    fe(e, l, i, s);
  });
}
let ge = [], Ae = !1;
function rt() {
  Ae || (Ae = !0, queueMicrotask(ct));
}
function nt(e, n, g) {
  const s = T.getState().getShadowValue(e, n), m = z(g) ? g(s) : g;
  Le(e, n, m), $e(e, n, { bubble: !0 });
  const c = P(e, n);
  return {
    type: "update",
    oldValue: s,
    newValue: m,
    shadowMeta: c
  };
}
function at(e, n) {
  e?.signals?.length && e.signals.forEach(({ parentId: g, position: s, effect: m }) => {
    const c = document.querySelector(`[data-parent-id="${g}"]`);
    if (!c) return;
    const l = Array.from(c.childNodes);
    if (!l[s]) return;
    let i = n;
    if (m && n !== null)
      try {
        i = new Function("state", `return (${m})(state)`)(
          n
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    i !== null && typeof i == "object" && (i = JSON.stringify(i)), l[s].textContent = String(i ?? "");
  });
}
function ot(e, n, g) {
  const s = P(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const m = /* @__PURE__ */ new Set();
  let c = n;
  g.type === "insert" && g.itemId && (c = n);
  let l = [...c];
  for (; ; ) {
    const i = P(e, l);
    if (i?.pathComponents && i.pathComponents.forEach((t) => {
      const o = s.components?.get(t);
      o && ((Array.isArray(o.reactiveType) ? o.reactiveType : [o.reactiveType || "component"]).includes("none") || m.add(o));
    }), l.length === 0) break;
    l.pop();
  }
  return s.components.forEach((i, t) => {
    if (m.has(i))
      return;
    const o = Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"];
    if (o.includes("all"))
      m.add(i);
    else if (o.includes("deps") && i.depsFunction) {
      const d = N(e, []), E = i.depsFunction(d);
      (E === !0 || Array.isArray(E) && !se(i.prevDeps, E)) && (i.prevDeps = E, m.add(i));
    }
  }), m;
}
function st(e, n, g, s, m) {
  let c;
  if (z(g)) {
    const { value: o } = X(e, n);
    c = g({ state: o, uuid: K() });
  } else
    c = g;
  const l = Be(
    e,
    n,
    c,
    s,
    m
  );
  $e(e, n, { bubble: !0 });
  const i = P(e, n);
  let t;
  return i?.arrayKeys, {
    type: "insert",
    newValue: c,
    shadowMeta: i,
    path: n,
    itemId: l,
    insertAfterId: t
  };
}
function it(e, n) {
  const g = n.slice(0, -1), s = N(e, n);
  return qe(e, n), $e(e, g, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: g };
}
function ct() {
  const e = /* @__PURE__ */ new Set(), n = [], g = [];
  for (const s of ge) {
    if (s.status && s.updateType) {
      g.push(s);
      continue;
    }
    const m = s, c = m.type === "cut" ? null : m.newValue;
    m.shadowMeta?.signals?.length > 0 && n.push({ shadowMeta: m.shadowMeta, displayValue: c }), ot(
      m.stateKey,
      m.path,
      m
    ).forEach((i) => {
      e.add(i);
    });
  }
  g.length > 0 && ze(g), n.forEach(({ shadowMeta: s, displayValue: m }) => {
    at(s, m);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), ge = [], Ae = !1;
}
function lt(e, n, g, s, m) {
  return (l, i, t, o) => {
    c(e, i, l, t);
  };
  function c(l, i, t, o) {
    let d;
    switch (o.updateType) {
      case "update":
        d = nt(l, i, t);
        break;
      case "insert":
        d = st(
          l,
          i,
          t,
          void 0,
          o.itemId
        );
        break;
      case "cut":
        d = it(l, i);
        break;
    }
    d.stateKey = l, d.path = i, ge.push(d), rt();
    const E = {
      timeStamp: Date.now(),
      stateKey: l,
      path: i,
      updateType: o.updateType,
      status: "new",
      oldValue: d.oldValue,
      newValue: d.newValue ?? null,
      itemId: d.itemId,
      insertAfterId: d.insertAfterId,
      metaData: o.metaData
    };
    ge.push(E), d.newValue !== void 0 && et(
      d.newValue,
      l,
      s.current,
      g
    ), s.current?.middleware && s.current.middleware({ update: E }), console.log(
      "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
      i,
      E
    ), m && m(E);
  }
}
function ut(e, {
  stateKey: n,
  localStorage: g,
  formElements: s,
  reactiveDeps: m,
  reactiveType: c,
  componentId: l,
  defaultState: i,
  syncUpdate: t,
  dependencies: o,
  serverState: d,
  onUpdateCallback: E
} = {}) {
  const [x, U] = ee({}), { sessionId: _ } = Ve();
  let H = !n;
  const [w] = ee(n ?? K()), y = j(l ?? K()), Z = j(
    null
  );
  Z.current = q(w) ?? null;
  const r = ue(
    (S) => {
      const f = S ? { ...q(w), ...S } : q(w), p = f?.defaultState || i || e;
      if (f?.serverState?.status === "success" && f?.serverState?.data !== void 0)
        return {
          value: f.serverState.data,
          source: "server",
          timestamp: f.serverState.timestamp || Date.now()
        };
      if (f?.localStorage?.key && _) {
        const $ = z(f.localStorage.key) ? f.localStorage.key(p) : f.localStorage.key, M = Se(
          `${_}-${w}-${$}`
        );
        if (M && M.lastUpdated > (f?.serverState?.timestamp || 0))
          return {
            value: M.state,
            source: "localStorage",
            timestamp: M.lastUpdated
          };
      }
      return {
        value: p || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, i, e, _]
  );
  W(() => {
    d && d.status === "success" && d.data !== void 0 && Ee(w, d);
  }, [d, w]), W(() => T.getState().subscribeToPath(w, (h) => {
    if (h?.type === "SERVER_STATE_UPDATE") {
      const f = h.serverState;
      if (f?.status !== "success" || f.data === void 0)
        return;
      we(w, { serverState: f });
      const p = typeof f.merge == "object" ? f.merge : f.merge === !0 ? { strategy: "append", key: "id" } : null, A = N(w, []), $ = f.data;
      if (p && p.strategy === "append" && "key" in p && Array.isArray(A) && Array.isArray($)) {
        const M = p.key;
        if (!M) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const D = new Set(
          A.map((b) => b[M])
        ), k = $.filter(
          (b) => !D.has(b[M])
        );
        k.length > 0 && We(w, [], k);
        const I = N(w, []);
        fe(
          w,
          [],
          I,
          f.timestamp || Date.now()
        );
      } else
        ie(w, $), fe(
          w,
          [],
          $,
          f.timestamp || Date.now()
        );
      te(w);
    }
  }), [w]), W(() => {
    const S = T.getState().getShadowMetadata(w, []);
    if (S && S.stateSource)
      return;
    const h = q(w), f = {
      validationEnabled: !!(h?.validation?.zodSchemaV4 || h?.validation?.zodSchemaV3),
      localStorageEnabled: !!h?.localStorage?.key
    };
    if (J(w, [], {
      ...S,
      features: f
    }), h?.defaultState !== void 0 || i !== void 0) {
      const M = h?.defaultState || i;
      h?.defaultState || we(w, {
        defaultState: M
      });
    }
    const { value: p, source: A, timestamp: $ } = r();
    ie(w, p), J(w, [], {
      stateSource: A,
      lastServerSync: A === "server" ? $ : void 0,
      isDirty: A === "server" ? !1 : void 0,
      baseServerState: A === "server" ? p : void 0
    }), A === "server" && d && Ee(w, d), te(w);
  }, [w, ...o || []]), le(() => {
    H && we(w, {
      formElements: s,
      defaultState: i,
      localStorage: g,
      middleware: Z.current?.middleware
    });
    const S = `${w}////${y.current}`, h = P(w, []), f = h?.components || /* @__PURE__ */ new Map();
    return f.set(S, {
      forceUpdate: () => U({}),
      reactiveType: c ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: m || void 0,
      deps: m ? m(N(w, [])) : [],
      prevDeps: m ? m(N(w, [])) : []
    }), J(w, [], {
      ...h,
      components: f
    }), U({}), () => {
      const p = P(w, []), A = p?.components?.get(S);
      A?.paths && A.paths.forEach(($) => {
        const D = $.split(".").slice(1), k = T.getState().getShadowMetadata(w, D);
        k?.pathComponents && k.pathComponents.size === 0 && (delete k.pathComponents, T.getState().setShadowMetadata(w, D, k));
      }), p?.components && J(w, [], p);
    };
  }, []);
  const a = j(null), u = lt(
    w,
    a,
    _,
    Z,
    E
  );
  return T.getState().initialStateGlobal[w] || Pe(w, e), Te(() => De(
    w,
    u,
    y.current,
    _
  ), [w, _]);
}
const dt = (e, n, g) => {
  let s = P(e, n)?.arrayKeys || [];
  const m = g?.transforms;
  if (!m || m.length === 0)
    return s;
  for (const c of m)
    if (c.type === "filter") {
      const l = [];
      s.forEach((i, t) => {
        const o = N(e, [...n, i]);
        c.fn(o, t) && l.push(i);
      }), s = l;
    } else c.type === "sort" && s.sort((l, i) => {
      const t = N(e, [...n, l]), o = N(e, [...n, i]);
      return c.fn(t, o);
    });
  return s;
}, pe = (e, n, g) => {
  const s = `${e}////${n}`, c = P(e, [])?.components?.get(s);
  !c || c.reactiveType === "none" || !(Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType]).includes("component") || He(e, g, s);
}, oe = (e, n, g) => {
  const s = P(e, []), m = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((l, i) => {
    (Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"]).includes("all") && (l.forceUpdate(), m.add(i));
  }), P(e, [
    ...n,
    "getSelected"
  ])?.pathComponents?.forEach((l) => {
    s?.components?.get(l)?.forceUpdate();
  });
  const c = P(e, n);
  for (let l of c?.arrayKeys || []) {
    const i = l + ".selected", t = P(e, i.split(".").slice(1));
    l == g && t?.pathComponents?.forEach((o) => {
      s?.components?.get(o)?.forceUpdate();
    });
  }
};
function X(e, n, g) {
  const s = P(e, n), m = n.length > 0 ? n.join(".") : "root", c = g?.arrayViews?.[m];
  if (Array.isArray(c) && c.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const l = N(e, n, c);
  return {
    shadowMeta: s,
    value: l,
    arrayKeys: s?.arrayKeys
  };
}
function De(e, n, g, s) {
  const m = /* @__PURE__ */ new Map();
  function c({
    path: t = [],
    meta: o,
    componentId: d
  }) {
    const E = o ? JSON.stringify(o.arrayViews || o.transforms) : "", x = t.join(".") + ":" + d + ":" + E;
    if (m.has(x))
      return m.get(x);
    const U = [e, ...t].join("."), _ = {
      get(w, y) {
        if (t.length === 0 && y in l)
          return l[y];
        if (!y.startsWith("$")) {
          const r = [...t, y];
          return c({
            path: r,
            componentId: d,
            meta: o
          });
        }
        if (y === "$_rebuildStateShape")
          return c;
        if (y === "$sync" && t.length === 0)
          return async function() {
            const r = T.getState().getInitialOptions(e), a = r?.sync;
            if (!a)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const u = T.getState().getShadowValue(e, []), v = r?.validation?.key;
            try {
              const S = await a.action(u);
              if (S && !S.success && S.errors, S?.success) {
                const h = T.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...h,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: u
                  // Update base server state
                }), a.onSuccess && a.onSuccess(S.data);
              } else !S?.success && a.onError && a.onError(S.error);
              return S;
            } catch (S) {
              return a.onError && a.onError(S), { success: !1, error: S };
            }
          };
        if (y === "$_status" || y === "$getStatus") {
          const r = () => {
            const { shadowMeta: a, value: u } = X(e, t, o);
            return console.log("getStatusFunc", t, a, u), a?.isDirty === !0 ? "dirty" : a?.stateSource === "server" || a?.isDirty === !1 ? "synced" : a?.stateSource === "localStorage" ? "restored" : a?.stateSource === "default" || u !== void 0 ? "fresh" : "unknown";
          };
          return y === "$_status" ? r() : r;
        }
        if (y === "$removeStorage")
          return () => {
            const r = T.getState().initialStateGlobal[e], a = q(e), u = z(a?.localStorage?.key) ? a.localStorage.key(r) : a?.localStorage?.key, v = `${s}-${e}-${u}`;
            v && localStorage.removeItem(v);
          };
        if (y === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = X(e, t, o);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((a) => a.severity === "error").map((a) => a.message) : [];
          };
        if (y === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            pe(e, d, [
              ...t,
              "getSelected"
            ]);
            const a = T.getState().selectedIndicesMap.get(r);
            if (!a)
              return;
            const u = t.join("."), v = o?.arrayViews?.[u], S = a.split(".").pop();
            if (!(v && !v.includes(S) || N(
              e,
              a.split(".").slice(1)
            ) === void 0))
              return c({
                path: a.split(".").slice(1),
                componentId: d,
                meta: o
              });
          };
        if (y === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const a = T.getState().selectedIndicesMap.get(r);
            if (!a)
              return -1;
            const { keys: u } = B(e, t, o);
            if (!u)
              return -1;
            const v = a.split(".").pop();
            return u.indexOf(v);
          };
        if (y === "$clearSelected")
          return oe(e, t), () => {
            Je({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (y === "$useVirtualView")
          return (r) => {
            const {
              itemHeight: a = 50,
              overscan: u = 6,
              stickToBottom: v = !1,
              scrollStickTolerance: S = 75
            } = r, h = j(null), [f, p] = ee({
              startIndex: 0,
              endIndex: 10
            }), [A, $] = ee({}), M = j(!0);
            W(() => {
              const C = setInterval(() => {
                $({});
              }, 1e3);
              return () => clearInterval(C);
            }, []);
            const D = j({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), k = j(
              /* @__PURE__ */ new Map()
            ), { keys: I } = B(e, t, o);
            W(() => {
              const C = [e, ...t].join("."), V = T.getState().subscribeToPath(C, (F) => {
                F.type !== "GET_SELECTED" && F.type;
              });
              return () => {
                V();
              };
            }, [d, e, t.join(".")]), le(() => {
              if (v && I.length > 0 && h.current && !D.current.isUserScrolling && M.current) {
                const C = h.current, V = () => {
                  if (C.clientHeight > 0) {
                    const F = Math.ceil(
                      C.clientHeight / a
                    ), L = I.length - 1, O = Math.max(
                      0,
                      L - F - u
                    );
                    p({ startIndex: O, endIndex: L }), requestAnimationFrame(() => {
                      Q("instant"), M.current = !1;
                    });
                  } else
                    requestAnimationFrame(V);
                };
                V();
              }
            }, [I.length, v, a, u]);
            const b = j(f);
            le(() => {
              b.current = f;
            }, [f]);
            const R = j(I);
            le(() => {
              R.current = I;
            }, [I]);
            const ce = ue(() => {
              const C = h.current;
              if (!C) return;
              const V = C.scrollTop, { scrollHeight: F, clientHeight: L } = C, O = D.current, re = F - (V + L), he = O.isNearBottom;
              O.isNearBottom = re <= S, V < O.lastScrollTop ? (O.scrollUpCount++, O.scrollUpCount > 3 && he && (O.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : O.isNearBottom && (O.isUserScrolling = !1, O.scrollUpCount = 0), O.lastScrollTop = V;
              let Y = 0;
              for (let G = 0; G < I.length; G++) {
                const ye = I[G], me = k.current.get(ye);
                if (me && me.offset + me.height > V) {
                  Y = G;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                k.current,
                Y,
                f
              ), Y !== f.startIndex && f.startIndex != 0) {
                const G = Math.ceil(L / a);
                p({
                  startIndex: Math.max(0, Y - u),
                  endIndex: Math.min(
                    I.length - 1,
                    Y + G + u
                  )
                });
              }
            }, [
              I.length,
              f.startIndex,
              a,
              u,
              S
            ]);
            W(() => {
              const C = h.current;
              if (C)
                return C.addEventListener("scroll", ce, {
                  passive: !0
                }), () => {
                  C.removeEventListener("scroll", ce);
                };
            }, [ce, v]);
            const Q = ue(
              (C = "smooth") => {
                const V = h.current;
                if (!V) return;
                D.current.isUserScrolling = !1, D.current.isNearBottom = !0, D.current.scrollUpCount = 0;
                const F = () => {
                  const L = (O = 0) => {
                    if (O > 5) return;
                    const re = V.scrollHeight, he = V.scrollTop, Y = V.clientHeight;
                    he + Y >= re - 1 || (V.scrollTo({
                      top: re,
                      behavior: C
                    }), setTimeout(() => {
                      const G = V.scrollHeight, ye = V.scrollTop;
                      (G !== re || ye + Y < G - 1) && L(O + 1);
                    }, 50));
                  };
                  L();
                };
                "requestIdleCallback" in window ? requestIdleCallback(F, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(F);
                });
              },
              []
            );
            return W(() => {
              if (!v || !h.current) return;
              const C = h.current, V = D.current;
              let F;
              const L = () => {
                clearTimeout(F), F = setTimeout(() => {
                  !V.isUserScrolling && V.isNearBottom && Q(
                    M.current ? "instant" : "smooth"
                  );
                }, 100);
              }, O = new MutationObserver(() => {
                V.isUserScrolling || L();
              });
              return O.observe(C, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), M.current ? setTimeout(() => {
                Q("instant");
              }, 0) : L(), () => {
                clearTimeout(F), O.disconnect();
              };
            }, [v, I.length, Q]), {
              virtualState: Te(() => {
                const C = Array.isArray(I) ? I.slice(f.startIndex, f.endIndex + 1) : [], V = t.length > 0 ? t.join(".") : "root";
                return c({
                  path: t,
                  componentId: d,
                  meta: {
                    ...o,
                    arrayViews: { [V]: C },
                    serverStateIsUpStream: !0
                  }
                });
              }, [f.startIndex, f.endIndex, I, o]),
              virtualizerProps: {
                outer: {
                  ref: h,
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
                    transform: `translateY(${k.current.get(I[f.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: Q,
              scrollToIndex: (C, V = "smooth") => {
                if (h.current && I[C]) {
                  const F = k.current.get(I[C])?.offset || 0;
                  h.current.scrollTo({ top: F, behavior: V });
                }
              }
            };
          };
        if (y === "$stateMap")
          return (r) => {
            const { value: a, keys: u } = B(
              e,
              t,
              o
            );
            if (pe(e, d, t), !u || !Array.isArray(a))
              return [];
            const v = c({
              path: t,
              componentId: d,
              meta: o
            });
            return a.map((S, h) => {
              const f = u[h];
              if (!f) return;
              const p = [...t, f], A = c({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: d,
                meta: o
              });
              return r(A, h, v);
            });
          };
        if (y === "$stateFilter")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", { keys: u, value: v } = B(
              e,
              t,
              o
            );
            if (!Array.isArray(v))
              throw new Error("stateFilter can only be used on arrays");
            const S = [];
            return v.forEach((h, f) => {
              if (r(h, f)) {
                const p = u[f];
                p && S.push(p);
              }
            }), c({
              path: t,
              componentId: d,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [a]: S
                },
                transforms: [
                  ...o?.transforms || [],
                  { type: "filter", fn: r, path: t }
                ]
              }
            });
          };
        if (y === "$stateSort")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", { value: u, keys: v } = B(
              e,
              t,
              o
            );
            if (!Array.isArray(u) || !v)
              throw new Error("No array keys found for sorting");
            const S = u.map((f, p) => ({
              item: f,
              key: v[p]
            }));
            S.sort((f, p) => r(f.item, p.item));
            const h = S.map((f) => f.key);
            return c({
              path: t,
              componentId: d,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [a]: h
                },
                transforms: [
                  ...o?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (y === "$stream")
          return function(r = {}) {
            const {
              bufferSize: a = 100,
              flushInterval: u = 100,
              bufferStrategy: v = "accumulate",
              store: S,
              onFlush: h
            } = r;
            let f = [], p = !1, A = null;
            const $ = (b) => {
              if (!p) {
                if (v === "sliding" && f.length >= a)
                  f.shift();
                else if (v === "dropping" && f.length >= a)
                  return;
                f.push(b), f.length >= a && M();
              }
            }, M = () => {
              if (f.length === 0) return;
              const b = [...f];
              if (f = [], S) {
                const R = S(b);
                R !== void 0 && (Array.isArray(R) ? R : [R]).forEach((Q) => {
                  n(Q, t, {
                    updateType: "insert"
                  });
                });
              } else
                b.forEach((R) => {
                  n(R, t, {
                    updateType: "insert"
                  });
                });
              h?.(b);
            };
            u > 0 && (A = setInterval(M, u));
            const D = K(), k = P(e, t) || {}, I = k.streams || /* @__PURE__ */ new Map();
            return I.set(D, { buffer: f, flushTimer: A }), J(e, t, {
              ...k,
              streams: I
            }), {
              write: (b) => $(b),
              writeMany: (b) => b.forEach($),
              flush: () => M(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, f.length > 0 && M();
              },
              close: () => {
                M(), A && clearInterval(A);
                const b = T.getState().getShadowMetadata(e, t);
                b?.streams && b.streams.delete(D);
              }
            };
          };
        if (y === "$stateList")
          return (r) => /* @__PURE__ */ ne(() => {
            const u = j(/* @__PURE__ */ new Map()), [v, S] = ee({}), h = t.length > 0 ? t.join(".") : "root", f = dt(e, t, o), p = Te(() => ({
              ...o,
              arrayViews: {
                ...o?.arrayViews || {},
                [h]: f
              }
            }), [o, h, f]), { value: A } = B(
              e,
              t,
              p
            );
            if (W(() => {
              const D = T.getState().subscribeToPath(U, (k) => {
                if (k.type === "GET_SELECTED")
                  return;
                const b = T.getState().getShadowMetadata(e, t)?.transformCaches;
                if (b)
                  for (const R of b.keys())
                    R.startsWith(d) && b.delete(R);
                (k.type === "INSERT" || k.type === "INSERT_MANY" || k.type === "REMOVE" || k.type === "CLEAR_SELECTION" || k.type === "SERVER_STATE_UPDATE" && !o?.serverStateIsUpStream) && S({});
              });
              return () => {
                D();
              };
            }, [d, U]), !Array.isArray(A))
              return null;
            const $ = c({
              path: t,
              componentId: d,
              meta: p
              // Use updated meta here
            }), M = A.map((D, k) => {
              const I = f[k];
              if (!I)
                return null;
              let b = u.current.get(I);
              b || (b = K(), u.current.set(I, b));
              const R = [...t, I];
              return Me(Ne, {
                key: I,
                stateKey: e,
                itemComponentId: b,
                itemPath: R,
                localIndex: k,
                arraySetter: $,
                rebuildStateShape: c,
                renderFn: r
              });
            });
            return /* @__PURE__ */ ne(Ce, { children: M });
          }, {});
        if (y === "$stateFlattenOn")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", u = o?.arrayViews?.[a], v = T.getState().getShadowValue(e, t, u);
            return Array.isArray(v) ? c({
              path: [...t, "[*]", r],
              componentId: d,
              meta: o
            }) : [];
          };
        if (y === "$index")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", u = o?.arrayViews?.[a];
            if (u) {
              const h = u[r];
              return h ? c({
                path: [...t, h],
                componentId: d,
                meta: o
              }) : void 0;
            }
            const v = P(e, t);
            if (!v?.arrayKeys) return;
            const S = v.arrayKeys[r];
            if (S)
              return c({
                path: [...t, S],
                componentId: d,
                meta: o
              });
          };
        if (y === "$last")
          return () => {
            const { keys: r } = B(e, t, o);
            if (!r || r.length === 0)
              return;
            const a = r[r.length - 1];
            if (!a)
              return;
            const u = [...t, a];
            return c({
              path: u,
              componentId: d,
              meta: o
            });
          };
        if (y === "$insert")
          return (r, a) => {
            n(r, t, { updateType: "insert" });
          };
        if (y === "$uniqueInsert")
          return (r, a, u) => {
            const { value: v } = X(
              e,
              t,
              o
            ), S = z(r) ? r(v) : r;
            let h = null;
            if (!v.some((p) => {
              const A = a ? a.every(
                ($) => se(p[$], S[$])
              ) : se(p, S);
              return A && (h = p), A;
            }))
              n(S, t, { updateType: "insert" });
            else if (u && h) {
              const p = u(h), A = v.map(
                ($) => se($, h) ? p : $
              );
              n(A, t, {
                updateType: "update"
              });
            }
          };
        if (y === "$cut")
          return (r, a) => {
            const u = P(e, t);
            if (!u?.arrayKeys || u.arrayKeys.length === 0)
              return;
            const v = r === -1 ? u.arrayKeys.length - 1 : r !== void 0 ? r : u.arrayKeys.length - 1, S = u.arrayKeys[v];
            S && n(null, [...t, S], {
              updateType: "cut"
            });
          };
        if (y === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: a } = B(e, t, o);
            if (!a || a.length === 0)
              return;
            const u = T.getState().selectedIndicesMap.get(r);
            if (!u)
              return;
            const v = u.split(".").pop();
            if (!a.includes(v))
              return;
            const S = u.split(".").slice(1);
            T.getState().clearSelectedIndex({ arrayKey: r });
            const h = S.slice(0, -1);
            oe(e, h), n(null, S, {
              updateType: "cut"
            });
          };
        if (y === "$cutByValue")
          return (r) => {
            const {
              isArray: a,
              value: u,
              keys: v
            } = B(e, t, o);
            if (!a) return;
            const S = ve(u, v, (h) => h === r);
            S && n(null, [...t, S.key], {
              updateType: "cut"
            });
          };
        if (y === "$toggleByValue")
          return (r) => {
            const {
              isArray: a,
              value: u,
              keys: v
            } = B(e, t, o);
            if (!a) return;
            const S = ve(u, v, (h) => h === r);
            if (S) {
              const h = [...t, S.key];
              n(null, h, {
                updateType: "cut"
              });
            } else
              n(r, t, { updateType: "insert" });
          };
        if (y === "$findWith")
          return (r, a) => {
            const { isArray: u, value: v, keys: S } = B(e, t, o);
            if (!u)
              throw new Error("findWith can only be used on arrays");
            const h = ve(
              v,
              S,
              (f) => f?.[r] === a
            );
            return c(h ? {
              path: [...t, h.key],
              componentId: d,
              meta: o
            } : {
              path: [...t, `not_found_${K()}`],
              componentId: d,
              meta: o
            });
          };
        if (y === "$cutThis") {
          const { value: r } = X(e, t, o), a = t.slice(0, -1);
          return oe(e, a), () => {
            n(r, t, { updateType: "cut" });
          };
        }
        if (y === "$get")
          return () => {
            pe(e, d, t);
            const { value: r } = X(e, t, o);
            return r;
          };
        if (y === "$$derive")
          return (r) => ke({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: o
          });
        if (y === "$$get")
          return () => ke({ _stateKey: e, _path: t, _meta: o });
        if (y === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return Ye(r);
        }
        if (y == "getLocalStorage")
          return (r) => Se(s + "-" + e + "-" + r);
        if (y === "$isSelected") {
          const r = t.slice(0, -1);
          if (P(e, r)?.arrayKeys) {
            const u = e + "." + r.join("."), v = T.getState().selectedIndicesMap.get(u), S = e + "." + t.join(".");
            return v === S;
          }
          return;
        }
        if (y === "$setSelected")
          return (r) => {
            const a = t.slice(0, -1), u = e + "." + a.join("."), v = e + "." + t.join(".");
            oe(e, a, void 0), T.getState().selectedIndicesMap.get(u), r && T.getState().setSelectedIndex(u, v);
          };
        if (y === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), a = e + "." + r.join("."), u = e + "." + t.join(".");
            T.getState().selectedIndicesMap.get(a) === u ? T.getState().clearSelectedIndex({ arrayKey: a }) : T.getState().setSelectedIndex(a, u), oe(e, r);
          };
        if (y === "$_componentId")
          return d;
        if (t.length == 0) {
          if (y === "$_applyUpdate")
            return (r, a, u = "update") => {
              n(r, a, { updateType: u });
            };
          if (y === "$_getEffectiveSetState")
            return n;
          if (y === "$getPluginMetaData")
            return (r) => Qe(e, t)?.get(r);
          if (y === "$addPluginMetaData")
            return console.log("$addPluginMetaDat"), (r, a) => Xe(e, r, a);
          if (y === "$removePluginMetaData")
            return (r) => Ke(e, t, r);
          if (y === "$addZodValidation")
            return (r, a) => {
              r.forEach((u) => {
                const v = T.getState().getShadowMetadata(e, u.path) || {};
                T.getState().setShadowMetadata(e, u.path, {
                  ...v,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: a || "client",
                        message: u.message,
                        severity: "error",
                        code: u.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                });
              });
            };
          if (y === "$clearZodValidation")
            return (r) => {
              if (!r)
                throw new Error("clearZodValidation requires a path");
              const a = P(e, r) || {};
              J(e, r, {
                ...a,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (y === "$applyOperation")
            return (r, a) => {
              const u = r.validation || [];
              if (!r || !r.path) {
                console.error(
                  "Invalid operation received by $applyOperation:",
                  r
                );
                return;
              }
              const v = u.map((S) => ({
                source: "sync_engine",
                message: S.message,
                severity: "warning",
                code: S.code
              }));
              T.getState().setShadowMetadata(e, r.path, {
                stateVersion: r.version,
                validation: {
                  status: v.length > 0 ? "INVALID" : "VALID",
                  errors: v,
                  lastValidated: Date.now()
                }
              }), n(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                metaData: a
              });
            };
          if (y === "$applyJsonPatch")
            return (r) => {
              const a = T.getState(), u = a.getShadowMetadata(e, []);
              if (!u?.components) return;
              const v = (h) => !h || h === "/" ? [] : h.split("/").slice(1).map((f) => f.replace(/~1/g, "/").replace(/~0/g, "~")), S = /* @__PURE__ */ new Set();
              for (const h of r) {
                const f = v(h.path);
                switch (h.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = h;
                    a.updateShadowAtPath(e, f, p), a.markAsDirty(e, f, { bubble: !0 });
                    let A = [...f];
                    for (; ; ) {
                      const $ = a.getShadowMetadata(
                        e,
                        A
                      );
                      if ($?.pathComponents && $.pathComponents.forEach((M) => {
                        if (!S.has(M)) {
                          const D = u.components?.get(M);
                          D && (D.forceUpdate(), S.add(M));
                        }
                      }), A.length === 0) break;
                      A.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = f.slice(0, -1);
                    a.removeShadowArrayElement(e, f), a.markAsDirty(e, p, { bubble: !0 });
                    let A = [...p];
                    for (; ; ) {
                      const $ = a.getShadowMetadata(
                        e,
                        A
                      );
                      if ($?.pathComponents && $.pathComponents.forEach((M) => {
                        if (!S.has(M)) {
                          const D = u.components?.get(M);
                          D && (D.forceUpdate(), S.add(M));
                        }
                      }), A.length === 0) break;
                      A.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (y === "$getComponents")
            return () => P(e, [])?.components;
          if (y === "$getAllFormRefs")
            return () => Ie.getState().getFormRefsByStateKey(e);
        }
        if (y === "$getFormRef")
          return () => Ie.getState().getFormRef(e + "." + t.join("."));
        if (y === "$validationWrapper")
          return ({
            children: r,
            hideMessage: a
          }) => /* @__PURE__ */ ne(
            Oe,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: r
            }
          );
        if (y === "$_stateKey") return e;
        if (y === "$_path") return t;
        if (y === "$update")
          return (r) => (n(r, t, { updateType: "update" }), {
            synced: () => {
              const a = T.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...a,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const u = [e, ...t].join(".");
              Ze(u, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (y === "$toggle") {
          const { value: r } = X(
            e,
            t,
            o
          );
          if (typeof r != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            n(!r, t, {
              updateType: "update"
            });
          };
        }
        if (y === "$isolate")
          return (r) => /* @__PURE__ */ ne(
            Fe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              renderFn: r
            }
          );
        if (y === "$formElement")
          return (r, a) => /* @__PURE__ */ ne(
            je,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              setState: n,
              formOpts: a,
              renderFn: r
            }
          );
        const Z = [...t, y];
        return c({
          path: Z,
          componentId: d,
          meta: o
        });
      }
    }, H = new Proxy({}, _);
    return m.set(x, H), H;
  }
  const l = {
    $revertToInitialState: (t) => {
      const o = T.getState().getShadowMetadata(e, []);
      let d;
      o?.stateSource === "server" && o.baseServerState ? d = o.baseServerState : d = T.getState().initialStateGlobal[e], Ge(e), ie(e, d), c({
        path: [],
        componentId: g
      });
      const E = q(e), x = z(E?.localStorage?.key) ? E?.localStorage?.key(d) : E?.localStorage?.key, U = `${s}-${e}-${x}`;
      return U && localStorage.removeItem(U), te(e), d;
    },
    $initializeAndMergeShadowState: (t) => {
      xe(e, t), te(e);
    },
    $updateInitialState: (t) => {
      const o = De(
        e,
        n,
        g,
        s
      ), d = T.getState().initialStateGlobal[e], E = q(e), x = z(E?.localStorage?.key) ? E?.localStorage?.key(d) : E?.localStorage?.key, U = `${s}-${e}-${x}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Ue(() => {
        Pe(e, t), ie(e, t);
        const _ = T.getState().getShadowMetadata(e, []);
        _ && _?.components?.forEach((H) => {
          H.forceUpdate();
        });
      }), {
        fetchId: (_) => o.$get()[_]
      };
    }
  };
  return c({
    componentId: g,
    path: []
  });
}
function ke(e) {
  return Me(ft, { proxy: e });
}
function ft({
  proxy: e
}) {
  const n = j(null), g = j(null), s = j(!1), m = `${e._stateKey}-${e._path.join(".")}`, c = e._path.length > 0 ? e._path.join(".") : "root", l = e._meta?.arrayViews?.[c], i = N(e._stateKey, e._path, l);
  return W(() => {
    const t = n.current;
    if (!t || s.current) return;
    const o = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", m);
        return;
      }
      const d = t.parentElement, x = Array.from(d.childNodes).indexOf(t);
      let U = d.getAttribute("data-parent-id");
      U || (U = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", U)), g.current = `instance-${crypto.randomUUID()}`;
      const _ = T.getState().getShadowMetadata(e._stateKey, e._path) || {}, H = _.signals || [];
      H.push({
        instanceId: g.current,
        parentId: U,
        position: x,
        effect: e._effect
      }), T.getState().setShadowMetadata(e._stateKey, e._path, {
        ..._,
        signals: H
      });
      let w = i;
      if (e._effect)
        try {
          w = new Function(
            "state",
            `return (${e._effect})(state)`
          )(i);
        } catch (Z) {
          console.error("Error evaluating effect function:", Z);
        }
      w !== null && typeof w == "object" && (w = JSON.stringify(w));
      const y = document.createTextNode(String(w ?? ""));
      t.replaceWith(y), s.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(o), g.current) {
        const d = T.getState().getShadowMetadata(e._stateKey, e._path) || {};
        d.signals && (d.signals = d.signals.filter(
          (E) => E.instanceId !== g.current
        ), T.getState().setShadowMetadata(e._stateKey, e._path, d));
      }
    };
  }, []), Me("span", {
    ref: n,
    style: { display: "contents" },
    "data-signal-id": m
  });
}
export {
  ke as $cogsSignal,
  $t as addStateOptions,
  It as createCogsState,
  ut as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
