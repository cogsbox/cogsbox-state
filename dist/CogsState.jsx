"use client";
import { jsx as oe, Fragment as Pe } from "react/jsx-runtime";
import { useState as te, useRef as R, useCallback as we, useEffect as G, useLayoutEffect as re, useMemo as pe, createElement as Ae, startTransition as Ce } from "react";
import { transformStateFunc as Ue, isFunction as J, isDeepEqual as ne } from "./utility.js";
import { ValidationWrapper as De, IsolatedComponentWrapper as Oe, FormElementWrapper as Fe, MemoizedCogsItemWrapper as je } from "./Components.jsx";
import Ne from "superjson";
import { v4 as X } from "uuid";
import { getGlobalStore as T, formRefStore as Ee, shadowStateStore as Re } from "./store.js";
import { useCogsConfig as ke } from "./CogsStateClient.jsx";
const {
  getInitialOptions: H,
  updateInitialStateGlobal: Ve,
  getShadowMetadata: P,
  setShadowMetadata: Y,
  getShadowValue: x,
  initializeShadowState: ie,
  initializeAndMergeShadowState: xe,
  updateShadowAtPath: Le,
  insertShadowArrayElement: Be,
  insertManyShadowArrayElements: qe,
  removeShadowArrayElement: We,
  setInitialStateOptions: le,
  setServerStateUpdate: $e,
  markAsDirty: Ie,
  addPathComponent: He,
  clearSelectedIndexesForState: ze,
  addStateLog: Ge,
  setSyncInfo: pt,
  clearSelectedIndex: Je,
  getSyncInfo: Ye,
  notifyPathSubscribers: Ze
  // Note: The old functions are no longer imported under their original names
} = T.getState();
function W(e, r, S) {
  const i = P(e, r);
  if (!!!i?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, r), keys: [] };
  const l = r.length > 0 ? r.join(".") : "root", u = S?.arrayViews?.[l] ?? i.arrayKeys;
  return Array.isArray(u) && u.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, r, u), keys: u ?? [] };
}
function me(e, r, S) {
  for (let i = 0; i < e.length; i++)
    if (S(e[i], i)) {
      const g = r[i];
      if (g)
        return { key: g, index: i, value: e[i] };
    }
  return null;
}
function he(e, r) {
  const S = H(e) || {};
  le(e, {
    ...S,
    ...r
  });
}
function Me({
  stateKey: e,
  options: r,
  initialOptionsPart: S
}) {
  const i = H(e) || {};
  let l = { ...S[e] || {}, ...i }, u = !1;
  if (r) {
    const c = (t, a) => {
      for (const f in a)
        a.hasOwnProperty(f) && (a[f] instanceof Object && !Array.isArray(a[f]) && t[f] instanceof Object ? ne(t[f], a[f]) || (c(t[f], a[f]), u = !0) : t[f] !== a[f] && (t[f] = a[f], u = !0));
      return t;
    };
    l = c(l, r);
  }
  l.syncOptions && (!r || !r.hasOwnProperty("syncOptions")) && (u = !0), (l.validation && l?.validation?.zodSchemaV4 || l?.validation?.zodSchemaV3) && (r?.validation?.hasOwnProperty("onBlur") || i?.validation?.hasOwnProperty("onBlur") || (l.validation.onBlur = "error")), u && le(e, l);
}
function Tt(e, r) {
  return {
    ...r,
    initialState: e,
    _addStateOptions: !0
  };
}
const Qe = (e, r) => {
  const [S, i] = Ue(e);
  Object.keys(S).forEach((u) => {
    let c = i[u] || {};
    const t = {
      ...c
    };
    if (r?.formElements && (t.formElements = {
      ...r.formElements,
      ...c.formElements || {}
    }), r?.validation && (t.validation = {
      ...r.validation,
      ...c.validation || {}
    }, r.validation.key && !c.validation?.key && (t.validation.key = `${r.validation.key}.${u}`)), r?.__syncSchemas?.[u]?.schemas?.validation && (t.validation = {
      zodSchemaV4: r.__syncSchemas[u].schemas.validation,
      ...c.validation
    }), Object.keys(t).length > 0) {
      const a = H(u);
      a ? le(u, {
        ...a,
        ...t
      }) : le(u, t);
    }
  }), Object.keys(S).forEach((u) => {
    ie(u, S[u]);
  });
  const g = (u, c) => {
    const [t] = te(c?.componentId ?? X()), a = R([]);
    Me({
      stateKey: u,
      options: c,
      initialOptionsPart: i
    });
    const f = x(u, []) || S[u], $ = ct(f, {
      stateKey: u,
      syncUpdate: c?.syncUpdate,
      componentId: t,
      localStorage: c?.localStorage,
      middleware: c?.middleware,
      reactiveType: c?.reactiveType,
      reactiveDeps: c?.reactiveDeps,
      defaultState: c?.defaultState,
      dependencies: c?.dependencies,
      serverState: c?.serverState,
      syncOptions: c?.syncOptions,
      __useSync: r?.__useSync,
      __pluginDataRef: a
    });
    return re(() => {
      if (!r?.plugins) return;
      const O = r.plugins.map((V) => {
        let F;
        return V.useHook && (F = V.useHook($, c)), {
          plugin: V,
          options: c,
          hookData: F
        };
      });
      a.current = O;
    }, []), re(() => {
      if (!r?.plugins?.some((U) => U.transformState) || a.current.length === 0)
        return;
      let V = $.$get(), F = !1;
      a.current.forEach((U) => {
        if (U.plugin.transformState) {
          const L = V, o = U.plugin.transformState(
            V,
            U.options,
            U.hookData
          );
          o !== void 0 && !ne(L, o) && (V = o, F = !0);
        }
      }), F && $.$update(V);
    }, [$, c, ...c?.dependencies || []]), $;
  };
  function l(u, c) {
    Me({ stateKey: u, options: c, initialOptionsPart: i }), c.localStorage && Ke(u, c), ce(u);
  }
  return {
    useCogsState: g,
    setCogsOptions: l
  };
};
function At(e, r) {
  const S = e.schemas, i = {}, g = {};
  for (const l in S) {
    const u = S[l];
    u?.relations && u?.schemas?.defaults ? i[l] = u.schemas.defaults : i[l] = u?.schemas?.defaults || {}, console.log("initialState", i), u?.api?.queryData?._paramType && (g[l] = u.api.queryData._paramType);
  }
  return Qe(i, {
    __syncNotifications: e.notifications,
    __useSync: r,
    __syncSchemas: S
  });
}
const Xe = (e, r, S, i, g) => {
  S?.log && console.log(
    "saving to localstorage",
    r,
    S.localStorage?.key,
    i
  );
  const l = J(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (l && i) {
    const u = `${i}-${r}-${l}`;
    let c;
    try {
      c = fe(u)?.lastSyncedWithServer;
    } catch {
    }
    const t = P(r, []), a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: c,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, f = Ne.serialize(a);
    window.localStorage.setItem(
      u,
      JSON.stringify(f.json)
    );
  }
}, fe = (e) => {
  if (!e) return null;
  try {
    const r = window.localStorage.getItem(e);
    return r ? JSON.parse(r) : null;
  } catch (r) {
    return console.error("Error loading from localStorage:", r), null;
  }
}, Ke = (e, r) => {
  const S = x(e, []), { sessionId: i } = ke(), g = J(r?.localStorage?.key) ? r.localStorage.key(S) : r?.localStorage?.key;
  if (g && i) {
    const l = fe(
      `${i}-${e}-${g}`
    );
    if (l && l.lastUpdated > (l.lastSyncedWithServer || 0))
      return ce(e), !0;
  }
  return !1;
}, ce = (e) => {
  const r = P(e, []);
  if (!r) return;
  const S = /* @__PURE__ */ new Set();
  r?.components?.forEach((i) => {
    (i ? Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"] : null)?.includes("none") || S.add(() => i.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((i) => i());
  });
};
function ue(e, r, S, i) {
  const g = P(e, r);
  if (Y(e, r, {
    ...g,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: i || Date.now()
  }), Array.isArray(S)) {
    const l = P(e, r);
    l?.arrayKeys && l.arrayKeys.forEach((u, c) => {
      const t = [...r, u], a = S[c];
      a !== void 0 && ue(
        e,
        t,
        a,
        i
      );
    });
  } else S && typeof S == "object" && S.constructor === Object && Object.keys(S).forEach((l) => {
    const u = [...r, l], c = S[l];
    ue(e, u, c, i);
  });
}
let de = [], Te = !1;
function et() {
  Te || (Te = !0, queueMicrotask(st));
}
function tt(e, r, S) {
  const i = T.getState().getShadowValue(e, r), g = J(S) ? S(i) : S;
  Le(e, r, g), Ie(e, r, { bubble: !0 });
  const l = P(e, r);
  return {
    type: "update",
    oldValue: i,
    newValue: g,
    shadowMeta: l
  };
}
function rt(e, r) {
  e?.signals?.length && e.signals.forEach(({ parentId: S, position: i, effect: g }) => {
    const l = document.querySelector(`[data-parent-id="${S}"]`);
    if (!l) return;
    const u = Array.from(l.childNodes);
    if (!u[i]) return;
    let c = r;
    if (g && r !== null)
      try {
        c = new Function("state", `return (${g})(state)`)(
          r
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    c !== null && typeof c == "object" && (c = JSON.stringify(c)), u[i].textContent = String(c ?? "");
  });
}
function nt(e, r, S) {
  const i = P(e, []);
  if (!i?.components)
    return /* @__PURE__ */ new Set();
  const g = /* @__PURE__ */ new Set();
  let l = r;
  S.type === "insert" && S.itemId && (l = r);
  let u = [...l];
  for (; ; ) {
    const c = P(e, u);
    if (c?.pathComponents && c.pathComponents.forEach((t) => {
      const a = i.components?.get(t);
      a && ((Array.isArray(a.reactiveType) ? a.reactiveType : [a.reactiveType || "component"]).includes("none") || g.add(a));
    }), u.length === 0) break;
    u.pop();
  }
  return i.components.forEach((c, t) => {
    if (g.has(c))
      return;
    const a = Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType || "component"];
    if (a.includes("all"))
      g.add(c);
    else if (a.includes("deps") && c.depsFunction) {
      const f = x(e, []), $ = c.depsFunction(f);
      ($ === !0 || Array.isArray($) && !ne(c.prevDeps, $)) && (c.prevDeps = $, g.add(c));
    }
  }), g;
}
function at(e, r, S, i, g) {
  let l;
  if (J(S)) {
    const { value: a } = Q(e, r);
    l = S({ state: a, uuid: X() });
  } else
    l = S;
  const u = Be(
    e,
    r,
    l,
    i,
    g
  );
  Ie(e, r, { bubble: !0 });
  const c = P(e, r);
  let t;
  return c?.arrayKeys, {
    type: "insert",
    newValue: l,
    shadowMeta: c,
    path: r,
    itemId: u,
    insertAfterId: t
  };
}
function ot(e, r) {
  const S = r.slice(0, -1), i = x(e, r);
  return We(e, r), Ie(e, S, { bubble: !0 }), { type: "cut", oldValue: i, parentPath: S };
}
function st() {
  const e = /* @__PURE__ */ new Set(), r = [], S = [];
  for (const i of de) {
    if (i.status && i.updateType) {
      S.push(i);
      continue;
    }
    const g = i, l = g.type === "cut" ? null : g.newValue;
    g.shadowMeta?.signals?.length > 0 && r.push({ shadowMeta: g.shadowMeta, displayValue: l }), nt(
      g.stateKey,
      g.path,
      g
    ).forEach((c) => {
      e.add(c);
    });
  }
  S.length > 0 && Ge(S), r.forEach(({ shadowMeta: i, displayValue: g }) => {
    rt(i, g);
  }), e.forEach((i) => {
    i.forceUpdate();
  }), de = [], Te = !1;
}
function it(e, r, S, i, g) {
  return (u, c, t, a) => {
    l(e, c, u, t);
  };
  function l(u, c, t, a) {
    let f;
    switch (a.updateType) {
      case "update":
        f = tt(u, c, t);
        break;
      case "insert":
        f = at(
          u,
          c,
          t,
          void 0,
          a.itemId
        );
        break;
      case "cut":
        f = ot(u, c);
        break;
    }
    f.stateKey = u, f.path = c, de.push(f), et();
    const $ = {
      timeStamp: Date.now(),
      stateKey: u,
      path: c,
      updateType: a.updateType,
      status: "new",
      oldValue: f.oldValue,
      newValue: f.newValue ?? null,
      itemId: f.itemId,
      insertAfterId: f.insertAfterId
    };
    de.push($), f.newValue !== void 0 && Xe(
      f.newValue,
      u,
      i.current,
      S
    ), i.current?.middleware && i.current.middleware({ update: $ }), g?.current && g.current.length > 0 && g.current.forEach((O) => {
      if (O.plugin.onUpdate)
        try {
          O.plugin.onUpdate(
            $,
            O.options,
            O.hookData
          );
        } catch (V) {
          console.error("Plugin onUpdate error:", V);
        }
    }), a.sync !== !1 && r.current?.connected && r.current.updateState({ operation: $ });
  }
}
function ct(e, {
  stateKey: r,
  localStorage: S,
  formElements: i,
  reactiveDeps: g,
  reactiveType: l,
  componentId: u,
  defaultState: c,
  syncUpdate: t,
  dependencies: a,
  serverState: f,
  __useSync: $,
  __pluginDataRef: O
} = {}) {
  const [V, F] = te({}), { sessionId: U } = ke();
  let L = !r;
  const [o] = te(r ?? X()), K = R(u ?? X()), n = R(
    null
  );
  n.current = H(o) ?? null;
  const s = we(
    (p) => {
      const w = p ? { ...H(o), ...p } : H(o), E = w?.defaultState || c || e;
      if (w?.serverState?.status === "success" && w?.serverState?.data !== void 0)
        return {
          value: w.serverState.data,
          source: "server",
          timestamp: w.serverState.timestamp || Date.now()
        };
      if (w?.localStorage?.key && U) {
        const b = J(w.localStorage.key) ? w.localStorage.key(E) : w.localStorage.key, A = fe(
          `${U}-${o}-${b}`
        );
        if (A && A.lastUpdated > (w?.serverState?.timestamp || 0))
          return {
            value: A.state,
            source: "localStorage",
            timestamp: A.lastUpdated
          };
      }
      return {
        value: E || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [o, c, e, U]
  );
  G(() => {
    f && f.status === "success" && f.data !== void 0 && $e(o, f);
  }, [f, o]), G(() => T.getState().subscribeToPath(o, (I) => {
    if (I?.type === "SERVER_STATE_UPDATE") {
      const w = I.serverState;
      if (w?.status !== "success" || w.data === void 0)
        return;
      he(o, { serverState: w });
      const E = typeof w.merge == "object" ? w.merge : w.merge === !0 ? { strategy: "append", key: "id" } : null, M = x(o, []), b = w.data;
      if (E && E.strategy === "append" && "key" in E && Array.isArray(M) && Array.isArray(b)) {
        const A = E.key;
        if (!A) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const k = new Set(
          M.map((B) => B[A])
        ), D = b.filter(
          (B) => !k.has(B[A])
        );
        D.length > 0 && qe(o, [], D);
        const ee = x(o, []);
        ue(
          o,
          [],
          ee,
          w.timestamp || Date.now()
        );
      } else
        ie(o, b), ue(
          o,
          [],
          b,
          w.timestamp || Date.now()
        );
      ce(o);
    }
  }), [o]), G(() => {
    const p = T.getState().getShadowMetadata(o, []);
    if (p && p.stateSource)
      return;
    const I = H(o), w = {
      syncEnabled: !!h && !!v,
      validationEnabled: !!(I?.validation?.zodSchemaV4 || I?.validation?.zodSchemaV3),
      localStorageEnabled: !!I?.localStorage?.key
    };
    if (Y(o, [], {
      ...p,
      features: w
    }), I?.defaultState !== void 0 || c !== void 0) {
      const A = I?.defaultState || c;
      I?.defaultState || he(o, {
        defaultState: A
      });
    }
    const { value: E, source: M, timestamp: b } = s();
    ie(o, E), Y(o, [], {
      stateSource: M,
      lastServerSync: M === "server" ? b : void 0,
      isDirty: M === "server" ? !1 : void 0,
      baseServerState: M === "server" ? E : void 0
    }), M === "server" && f && $e(o, f), ce(o);
  }, [o, ...a || []]), re(() => {
    L && he(o, {
      formElements: i,
      defaultState: c,
      localStorage: S,
      middleware: n.current?.middleware
    });
    const p = `${o}////${K.current}`, I = P(o, []), w = I?.components || /* @__PURE__ */ new Map();
    return w.set(p, {
      forceUpdate: () => F({}),
      reactiveType: l ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: g || void 0,
      deps: g ? g(x(o, [])) : [],
      prevDeps: g ? g(x(o, [])) : []
    }), Y(o, [], {
      ...I,
      components: w
    }), F({}), () => {
      const E = P(o, []), M = E?.components?.get(p);
      M?.paths && M.paths.forEach((b) => {
        const k = b.split(".").slice(1), D = T.getState().getShadowMetadata(o, k);
        D?.pathComponents && D.pathComponents.size === 0 && (delete D.pathComponents, T.getState().setShadowMetadata(o, k, D));
      }), E?.components && Y(o, [], E);
    };
  }, []);
  const d = R(null), y = it(
    o,
    d,
    U,
    n,
    O
  );
  T.getState().initialStateGlobal[o] || Ve(o, e);
  const m = pe(() => _e(
    o,
    y,
    K.current,
    U
  ), [o, U]), h = $, v = n.current?.syncOptions;
  return h && (d.current = h(
    m,
    v ?? {}
  )), m;
}
const lt = (e, r, S) => {
  let i = P(e, r)?.arrayKeys || [];
  const g = S?.transforms;
  if (!g || g.length === 0)
    return i;
  for (const l of g)
    if (l.type === "filter") {
      const u = [];
      i.forEach((c, t) => {
        const a = x(e, [...r, c]);
        l.fn(a, t) && u.push(c);
      }), i = u;
    } else l.type === "sort" && i.sort((u, c) => {
      const t = x(e, [...r, u]), a = x(e, [...r, c]);
      return l.fn(t, a);
    });
  return i;
}, ve = (e, r, S) => {
  const i = `${e}////${r}`, l = P(e, [])?.components?.get(i);
  !l || l.reactiveType === "none" || !(Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType]).includes("component") || He(e, S, i);
}, se = (e, r, S) => {
  const i = P(e, []), g = /* @__PURE__ */ new Set();
  i?.components && i.components.forEach((u, c) => {
    (Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"]).includes("all") && (u.forceUpdate(), g.add(c));
  }), P(e, [
    ...r,
    "getSelected"
  ])?.pathComponents?.forEach((u) => {
    i?.components?.get(u)?.forceUpdate();
  });
  const l = P(e, r);
  for (let u of l?.arrayKeys || []) {
    const c = u + ".selected", t = P(e, c.split(".").slice(1));
    u == S && t?.pathComponents?.forEach((a) => {
      i?.components?.get(a)?.forceUpdate();
    });
  }
};
function Q(e, r, S) {
  const i = P(e, r), g = r.length > 0 ? r.join(".") : "root", l = S?.arrayViews?.[g];
  if (Array.isArray(l) && l.length === 0)
    return {
      shadowMeta: i,
      value: [],
      arrayKeys: i?.arrayKeys
    };
  const u = x(e, r, l);
  return {
    shadowMeta: i,
    value: u,
    arrayKeys: i?.arrayKeys
  };
}
function _e(e, r, S, i) {
  const g = /* @__PURE__ */ new Map();
  function l({
    path: t = [],
    meta: a,
    componentId: f
  }) {
    const $ = a ? JSON.stringify(a.arrayViews || a.transforms) : "", O = t.join(".") + ":" + f + ":" + $;
    if (g.has(O))
      return g.get(O);
    const V = [e, ...t].join("."), F = {
      get(L, o) {
        if (t.length === 0 && o in u)
          return u[o];
        if (!o.startsWith("$")) {
          const n = [...t, o];
          return l({
            path: n,
            componentId: f,
            meta: a
          });
        }
        if (o === "$_rebuildStateShape")
          return l;
        if (o === "$sync" && t.length === 0)
          return async function() {
            const n = T.getState().getInitialOptions(e), s = n?.sync;
            if (!s)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const d = T.getState().getShadowValue(e, []), y = n?.validation?.key;
            try {
              const m = await s.action(d);
              if (m && !m.success && m.errors, m?.success) {
                const h = T.getState().getShadowMetadata(e, []);
                Y(e, [], {
                  ...h,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: d
                  // Update base server state
                }), s.onSuccess && s.onSuccess(m.data);
              } else !m?.success && s.onError && s.onError(m.error);
              return m;
            } catch (m) {
              return s.onError && s.onError(m), { success: !1, error: m };
            }
          };
        if (o === "$_status" || o === "$getStatus") {
          const n = () => {
            const { shadowMeta: s, value: d } = Q(e, t, a);
            return console.log("getStatusFunc", t, s, d), s?.isDirty === !0 ? "dirty" : s?.stateSource === "server" || s?.isDirty === !1 ? "synced" : s?.stateSource === "localStorage" ? "restored" : s?.stateSource === "default" || d !== void 0 ? "fresh" : "unknown";
          };
          return o === "$_status" ? n() : n;
        }
        if (o === "$removeStorage")
          return () => {
            const n = T.getState().initialStateGlobal[e], s = H(e), d = J(s?.localStorage?.key) ? s.localStorage.key(n) : s?.localStorage?.key, y = `${i}-${e}-${d}`;
            y && localStorage.removeItem(y);
          };
        if (o === "$showValidationErrors")
          return () => {
            const { shadowMeta: n } = Q(e, t, a);
            return n?.validation?.status === "INVALID" && n.validation.errors.length > 0 ? n.validation.errors.filter((s) => s.severity === "error").map((s) => s.message) : [];
          };
        if (o === "$getSelected")
          return () => {
            const n = [e, ...t].join(".");
            ve(e, f, [
              ...t,
              "getSelected"
            ]);
            const s = T.getState().selectedIndicesMap.get(n);
            if (!s)
              return;
            const d = t.join("."), y = a?.arrayViews?.[d], m = s.split(".").pop();
            if (!(y && !y.includes(m) || x(
              e,
              s.split(".").slice(1)
            ) === void 0))
              return l({
                path: s.split(".").slice(1),
                componentId: f,
                meta: a
              });
          };
        if (o === "$getSelectedIndex")
          return () => {
            const n = e + "." + t.join(".");
            t.join(".");
            const s = T.getState().selectedIndicesMap.get(n);
            if (!s)
              return -1;
            const { keys: d } = W(e, t, a);
            if (!d)
              return -1;
            const y = s.split(".").pop();
            return d.indexOf(y);
          };
        if (o === "$clearSelected")
          return se(e, t), () => {
            Je({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (o === "$useVirtualView")
          return (n) => {
            const {
              itemHeight: s = 50,
              overscan: d = 6,
              stickToBottom: y = !1,
              scrollStickTolerance: m = 75
            } = n, h = R(null), [v, p] = te({
              startIndex: 0,
              endIndex: 10
            }), [I, w] = te({}), E = R(!0);
            G(() => {
              const C = setInterval(() => {
                w({});
              }, 1e3);
              return () => clearInterval(C);
            }, []);
            const M = R({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), b = R(
              /* @__PURE__ */ new Map()
            ), { keys: A } = W(e, t, a);
            G(() => {
              const C = [e, ...t].join("."), _ = T.getState().subscribeToPath(C, (N) => {
                N.type !== "GET_SELECTED" && N.type;
              });
              return () => {
                _();
              };
            }, [f, e, t.join(".")]), re(() => {
              if (y && A.length > 0 && h.current && !M.current.isUserScrolling && E.current) {
                const C = h.current, _ = () => {
                  if (C.clientHeight > 0) {
                    const N = Math.ceil(
                      C.clientHeight / s
                    ), q = A.length - 1, j = Math.max(
                      0,
                      q - N - d
                    );
                    p({ startIndex: j, endIndex: q }), requestAnimationFrame(() => {
                      B("instant"), E.current = !1;
                    });
                  } else
                    requestAnimationFrame(_);
                };
                _();
              }
            }, [A.length, y, s, d]);
            const k = R(v);
            re(() => {
              k.current = v;
            }, [v]);
            const D = R(A);
            re(() => {
              D.current = A;
            }, [A]);
            const ee = we(() => {
              const C = h.current;
              if (!C) return;
              const _ = C.scrollTop, { scrollHeight: N, clientHeight: q } = C, j = M.current, ae = N - (_ + q), Se = j.isNearBottom;
              j.isNearBottom = ae <= m, _ < j.lastScrollTop ? (j.scrollUpCount++, j.scrollUpCount > 3 && Se && (j.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : j.isNearBottom && (j.isUserScrolling = !1, j.scrollUpCount = 0), j.lastScrollTop = _;
              let Z = 0;
              for (let z = 0; z < A.length; z++) {
                const ge = A[z], ye = b.current.get(ge);
                if (ye && ye.offset + ye.height > _) {
                  Z = z;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                b.current,
                Z,
                v
              ), Z !== v.startIndex && v.startIndex != 0) {
                const z = Math.ceil(q / s);
                p({
                  startIndex: Math.max(0, Z - d),
                  endIndex: Math.min(
                    A.length - 1,
                    Z + z + d
                  )
                });
              }
            }, [
              A.length,
              v.startIndex,
              s,
              d,
              m
            ]);
            G(() => {
              const C = h.current;
              if (C)
                return C.addEventListener("scroll", ee, {
                  passive: !0
                }), () => {
                  C.removeEventListener("scroll", ee);
                };
            }, [ee, y]);
            const B = we(
              (C = "smooth") => {
                const _ = h.current;
                if (!_) return;
                M.current.isUserScrolling = !1, M.current.isNearBottom = !0, M.current.scrollUpCount = 0;
                const N = () => {
                  const q = (j = 0) => {
                    if (j > 5) return;
                    const ae = _.scrollHeight, Se = _.scrollTop, Z = _.clientHeight;
                    Se + Z >= ae - 1 || (_.scrollTo({
                      top: ae,
                      behavior: C
                    }), setTimeout(() => {
                      const z = _.scrollHeight, ge = _.scrollTop;
                      (z !== ae || ge + Z < z - 1) && q(j + 1);
                    }, 50));
                  };
                  q();
                };
                "requestIdleCallback" in window ? requestIdleCallback(N, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(N);
                });
              },
              []
            );
            return G(() => {
              if (!y || !h.current) return;
              const C = h.current, _ = M.current;
              let N;
              const q = () => {
                clearTimeout(N), N = setTimeout(() => {
                  !_.isUserScrolling && _.isNearBottom && B(
                    E.current ? "instant" : "smooth"
                  );
                }, 100);
              }, j = new MutationObserver(() => {
                _.isUserScrolling || q();
              });
              return j.observe(C, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), E.current ? setTimeout(() => {
                B("instant");
              }, 0) : q(), () => {
                clearTimeout(N), j.disconnect();
              };
            }, [y, A.length, B]), {
              virtualState: pe(() => {
                const C = Array.isArray(A) ? A.slice(v.startIndex, v.endIndex + 1) : [], _ = t.length > 0 ? t.join(".") : "root";
                return l({
                  path: t,
                  componentId: f,
                  meta: {
                    ...a,
                    arrayViews: { [_]: C },
                    serverStateIsUpStream: !0
                  }
                });
              }, [v.startIndex, v.endIndex, A, a]),
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
                    transform: `translateY(${b.current.get(A[v.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: B,
              scrollToIndex: (C, _ = "smooth") => {
                if (h.current && A[C]) {
                  const N = b.current.get(A[C])?.offset || 0;
                  h.current.scrollTo({ top: N, behavior: _ });
                }
              }
            };
          };
        if (o === "$stateMap")
          return (n) => {
            const { value: s, keys: d } = W(
              e,
              t,
              a
            );
            if (ve(e, f, t), !d || !Array.isArray(s))
              return [];
            const y = l({
              path: t,
              componentId: f,
              meta: a
            });
            return s.map((m, h) => {
              const v = d[h];
              if (!v) return;
              const p = [...t, v], I = l({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: f,
                meta: a
              });
              return n(I, h, y);
            });
          };
        if (o === "$stateFilter")
          return (n) => {
            const s = t.length > 0 ? t.join(".") : "root", { keys: d, value: y } = W(
              e,
              t,
              a
            );
            if (!Array.isArray(y))
              throw new Error("stateFilter can only be used on arrays");
            const m = [];
            return y.forEach((h, v) => {
              if (n(h, v)) {
                const p = d[v];
                p && m.push(p);
              }
            }), l({
              path: t,
              componentId: f,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [s]: m
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "filter", fn: n, path: t }
                ]
              }
            });
          };
        if (o === "$stateSort")
          return (n) => {
            const s = t.length > 0 ? t.join(".") : "root", { value: d, keys: y } = W(
              e,
              t,
              a
            );
            if (!Array.isArray(d) || !y)
              throw new Error("No array keys found for sorting");
            const m = d.map((v, p) => ({
              item: v,
              key: y[p]
            }));
            m.sort((v, p) => n(v.item, p.item));
            const h = m.map((v) => v.key);
            return l({
              path: t,
              componentId: f,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [s]: h
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "sort", fn: n, path: t }
                ]
              }
            });
          };
        if (o === "$stream")
          return function(n = {}) {
            const {
              bufferSize: s = 100,
              flushInterval: d = 100,
              bufferStrategy: y = "accumulate",
              store: m,
              onFlush: h
            } = n;
            let v = [], p = !1, I = null;
            const w = (k) => {
              if (!p) {
                if (y === "sliding" && v.length >= s)
                  v.shift();
                else if (y === "dropping" && v.length >= s)
                  return;
                v.push(k), v.length >= s && E();
              }
            }, E = () => {
              if (v.length === 0) return;
              const k = [...v];
              if (v = [], m) {
                const D = m(k);
                D !== void 0 && (Array.isArray(D) ? D : [D]).forEach((B) => {
                  r(B, t, {
                    updateType: "insert"
                  });
                });
              } else
                k.forEach((D) => {
                  r(D, t, {
                    updateType: "insert"
                  });
                });
              h?.(k);
            };
            d > 0 && (I = setInterval(E, d));
            const M = X(), b = P(e, t) || {}, A = b.streams || /* @__PURE__ */ new Map();
            return A.set(M, { buffer: v, flushTimer: I }), Y(e, t, {
              ...b,
              streams: A
            }), {
              write: (k) => w(k),
              writeMany: (k) => k.forEach(w),
              flush: () => E(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, v.length > 0 && E();
              },
              close: () => {
                E(), I && clearInterval(I);
                const k = T.getState().getShadowMetadata(e, t);
                k?.streams && k.streams.delete(M);
              }
            };
          };
        if (o === "$stateList")
          return (n) => /* @__PURE__ */ oe(() => {
            const d = R(/* @__PURE__ */ new Map()), [y, m] = te({}), h = t.length > 0 ? t.join(".") : "root", v = lt(e, t, a), p = pe(() => ({
              ...a,
              arrayViews: {
                ...a?.arrayViews || {},
                [h]: v
              }
            }), [a, h, v]), { value: I } = W(
              e,
              t,
              p
            );
            if (G(() => {
              const M = T.getState().subscribeToPath(V, (b) => {
                if (b.type === "GET_SELECTED")
                  return;
                const k = T.getState().getShadowMetadata(e, t)?.transformCaches;
                if (k)
                  for (const D of k.keys())
                    D.startsWith(f) && k.delete(D);
                (b.type === "INSERT" || b.type === "INSERT_MANY" || b.type === "REMOVE" || b.type === "CLEAR_SELECTION" || b.type === "SERVER_STATE_UPDATE" && !a?.serverStateIsUpStream) && m({});
              });
              return () => {
                M();
              };
            }, [f, V]), !Array.isArray(I))
              return null;
            const w = l({
              path: t,
              componentId: f,
              meta: p
              // Use updated meta here
            }), E = I.map((M, b) => {
              const A = v[b];
              if (!A)
                return null;
              let k = d.current.get(A);
              k || (k = X(), d.current.set(A, k));
              const D = [...t, A];
              return Ae(je, {
                key: A,
                stateKey: e,
                itemComponentId: k,
                itemPath: D,
                localIndex: b,
                arraySetter: w,
                rebuildStateShape: l,
                renderFn: n
              });
            });
            return /* @__PURE__ */ oe(Pe, { children: E });
          }, {});
        if (o === "$stateFlattenOn")
          return (n) => {
            const s = t.length > 0 ? t.join(".") : "root", d = a?.arrayViews?.[s], y = T.getState().getShadowValue(e, t, d);
            return Array.isArray(y) ? l({
              path: [...t, "[*]", n],
              componentId: f,
              meta: a
            }) : [];
          };
        if (o === "$index")
          return (n) => {
            const s = t.length > 0 ? t.join(".") : "root", d = a?.arrayViews?.[s];
            if (d) {
              const h = d[n];
              return h ? l({
                path: [...t, h],
                componentId: f,
                meta: a
              }) : void 0;
            }
            const y = P(e, t);
            if (!y?.arrayKeys) return;
            const m = y.arrayKeys[n];
            if (m)
              return l({
                path: [...t, m],
                componentId: f,
                meta: a
              });
          };
        if (o === "$last")
          return () => {
            const { keys: n } = W(e, t, a);
            if (!n || n.length === 0)
              return;
            const s = n[n.length - 1];
            if (!s)
              return;
            const d = [...t, s];
            return l({
              path: d,
              componentId: f,
              meta: a
            });
          };
        if (o === "$insert")
          return (n, s) => {
            r(n, t, { updateType: "insert" });
          };
        if (o === "$uniqueInsert")
          return (n, s, d) => {
            const { value: y } = Q(
              e,
              t,
              a
            ), m = J(n) ? n(y) : n;
            let h = null;
            if (!y.some((p) => {
              const I = s ? s.every(
                (w) => ne(p[w], m[w])
              ) : ne(p, m);
              return I && (h = p), I;
            }))
              r(m, t, { updateType: "insert" });
            else if (d && h) {
              const p = d(h), I = y.map(
                (w) => ne(w, h) ? p : w
              );
              r(I, t, {
                updateType: "update"
              });
            }
          };
        if (o === "$cut")
          return (n, s) => {
            const d = P(e, t);
            if (!d?.arrayKeys || d.arrayKeys.length === 0)
              return;
            const y = n === -1 ? d.arrayKeys.length - 1 : n !== void 0 ? n : d.arrayKeys.length - 1, m = d.arrayKeys[y];
            m && r(null, [...t, m], {
              updateType: "cut"
            });
          };
        if (o === "$cutSelected")
          return () => {
            const n = [e, ...t].join("."), { keys: s } = W(e, t, a);
            if (!s || s.length === 0)
              return;
            const d = T.getState().selectedIndicesMap.get(n);
            if (!d)
              return;
            const y = d.split(".").pop();
            if (!s.includes(y))
              return;
            const m = d.split(".").slice(1);
            T.getState().clearSelectedIndex({ arrayKey: n });
            const h = m.slice(0, -1);
            se(e, h), r(null, m, {
              updateType: "cut"
            });
          };
        if (o === "$cutByValue")
          return (n) => {
            const {
              isArray: s,
              value: d,
              keys: y
            } = W(e, t, a);
            if (!s) return;
            const m = me(d, y, (h) => h === n);
            m && r(null, [...t, m.key], {
              updateType: "cut"
            });
          };
        if (o === "$toggleByValue")
          return (n) => {
            const {
              isArray: s,
              value: d,
              keys: y
            } = W(e, t, a);
            if (!s) return;
            const m = me(d, y, (h) => h === n);
            if (m) {
              const h = [...t, m.key];
              r(null, h, {
                updateType: "cut"
              });
            } else
              r(n, t, { updateType: "insert" });
          };
        if (o === "$findWith")
          return (n, s) => {
            const { isArray: d, value: y, keys: m } = W(e, t, a);
            if (!d)
              throw new Error("findWith can only be used on arrays");
            const h = me(
              y,
              m,
              (v) => v?.[n] === s
            );
            return l(h ? {
              path: [...t, h.key],
              componentId: f,
              meta: a
            } : {
              path: [...t, `not_found_${X()}`],
              componentId: f,
              meta: a
            });
          };
        if (o === "$cutThis") {
          const { value: n } = Q(e, t, a), s = t.slice(0, -1);
          return se(e, s), () => {
            r(n, t, { updateType: "cut" });
          };
        }
        if (o === "$get")
          return () => {
            ve(e, f, t);
            const { value: n } = Q(e, t, a);
            return n;
          };
        if (o === "$$derive")
          return (n) => be({
            _stateKey: e,
            _path: t,
            _effect: n.toString(),
            _meta: a
          });
        if (o === "$$get")
          return () => be({ _stateKey: e, _path: t, _meta: a });
        if (o === "$lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return Ye(n);
        }
        if (o == "getLocalStorage")
          return (n) => fe(i + "-" + e + "-" + n);
        if (o === "$isSelected") {
          const n = t.slice(0, -1);
          if (P(e, n)?.arrayKeys) {
            const d = e + "." + n.join("."), y = T.getState().selectedIndicesMap.get(d), m = e + "." + t.join(".");
            return y === m;
          }
          return;
        }
        if (o === "$setSelected")
          return (n) => {
            const s = t.slice(0, -1), d = e + "." + s.join("."), y = e + "." + t.join(".");
            se(e, s, void 0), T.getState().selectedIndicesMap.get(d), n && T.getState().setSelectedIndex(d, y);
          };
        if (o === "$toggleSelected")
          return () => {
            const n = t.slice(0, -1), s = e + "." + n.join("."), d = e + "." + t.join(".");
            T.getState().selectedIndicesMap.get(s) === d ? T.getState().clearSelectedIndex({ arrayKey: s }) : T.getState().setSelectedIndex(s, d), se(e, n);
          };
        if (o === "$_componentId")
          return f;
        if (t.length == 0) {
          if (o === "$addZodValidation")
            return (n, s) => {
              n.forEach((d) => {
                const y = T.getState().getShadowMetadata(e, d.path) || {};
                T.getState().setShadowMetadata(e, d.path, {
                  ...y,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: s || "client",
                        message: d.message,
                        severity: "error",
                        code: d.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                });
              });
            };
          if (o === "$clearZodValidation")
            return (n) => {
              if (!n)
                throw new Error("clearZodValidation requires a path");
              const s = P(e, n) || {};
              Y(e, n, {
                ...s,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (o === "$applyOperation")
            return (n) => {
              const s = n.validation || [];
              if (!n || !n.path) {
                console.error(
                  "Invalid operation received by $applyOperation:",
                  n
                );
                return;
              }
              const d = s.map((y) => ({
                source: "sync_engine",
                message: y.message,
                severity: "warning",
                code: y.code
              }));
              T.getState().setShadowMetadata(e, n.path, {
                validation: {
                  status: d.length > 0 ? "INVALID" : "VALID",
                  errors: d,
                  lastValidated: Date.now()
                }
              }), r(n.newValue, n.path, {
                updateType: n.updateType,
                sync: !1,
                itemId: n.itemId
              });
            };
          if (o === "$applyJsonPatch")
            return (n) => {
              const s = T.getState(), d = s.getShadowMetadata(e, []);
              if (!d?.components) return;
              const y = (h) => !h || h === "/" ? [] : h.split("/").slice(1).map((v) => v.replace(/~1/g, "/").replace(/~0/g, "~")), m = /* @__PURE__ */ new Set();
              for (const h of n) {
                const v = y(h.path);
                switch (h.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = h;
                    s.updateShadowAtPath(e, v, p), s.markAsDirty(e, v, { bubble: !0 });
                    let I = [...v];
                    for (; ; ) {
                      const w = s.getShadowMetadata(
                        e,
                        I
                      );
                      if (w?.pathComponents && w.pathComponents.forEach((E) => {
                        if (!m.has(E)) {
                          const M = d.components?.get(E);
                          M && (M.forceUpdate(), m.add(E));
                        }
                      }), I.length === 0) break;
                      I.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = v.slice(0, -1);
                    s.removeShadowArrayElement(e, v), s.markAsDirty(e, p, { bubble: !0 });
                    let I = [...p];
                    for (; ; ) {
                      const w = s.getShadowMetadata(
                        e,
                        I
                      );
                      if (w?.pathComponents && w.pathComponents.forEach((E) => {
                        if (!m.has(E)) {
                          const M = d.components?.get(E);
                          M && (M.forceUpdate(), m.add(E));
                        }
                      }), I.length === 0) break;
                      I.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (o === "$getComponents")
            return () => P(e, [])?.components;
          if (o === "$getAllFormRefs")
            return () => Ee.getState().getFormRefsByStateKey(e);
        }
        if (o === "$getFormRef")
          return () => Ee.getState().getFormRef(e + "." + t.join("."));
        if (o === "$validationWrapper")
          return ({
            children: n,
            hideMessage: s
          }) => /* @__PURE__ */ oe(
            De,
            {
              formOpts: s ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: n
            }
          );
        if (o === "$_stateKey") return e;
        if (o === "$_path") return t;
        if (o === "$update")
          return (n) => (r(n, t, { updateType: "update" }), {
            synced: () => {
              const s = T.getState().getShadowMetadata(e, t);
              Y(e, t, {
                ...s,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const d = [e, ...t].join(".");
              Ze(d, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (o === "$toggle") {
          const { value: n } = Q(
            e,
            t,
            a
          );
          if (typeof n != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            r(!n, t, {
              updateType: "update"
            });
          };
        }
        if (o === "$isolate")
          return (n) => /* @__PURE__ */ oe(
            Oe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: l,
              renderFn: n
            }
          );
        if (o === "$formElement")
          return (n, s) => /* @__PURE__ */ oe(
            Fe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: l,
              setState: r,
              formOpts: s,
              renderFn: n
            }
          );
        const K = [...t, o];
        return l({
          path: K,
          componentId: f,
          meta: a
        });
      }
    }, U = new Proxy({}, F);
    return g.set(O, U), U;
  }
  const u = {
    $test: () => {
      const t = Re.get(e);
      console.log("test", t);
    },
    $revertToInitialState: (t) => {
      const a = T.getState().getShadowMetadata(e, []);
      let f;
      a?.stateSource === "server" && a.baseServerState ? f = a.baseServerState : f = T.getState().initialStateGlobal[e], ze(e), ie(e, f), l({
        path: [],
        componentId: S
      });
      const $ = H(e), O = J($?.localStorage?.key) ? $?.localStorage?.key(f) : $?.localStorage?.key, V = `${i}-${e}-${O}`;
      return V && localStorage.removeItem(V), ce(e), f;
    },
    $initializeAndMergeShadowState: (t) => {
      xe(e, t);
    },
    $updateInitialState: (t) => {
      const a = _e(
        e,
        r,
        S,
        i
      ), f = T.getState().initialStateGlobal[e], $ = H(e), O = J($?.localStorage?.key) ? $?.localStorage?.key(f) : $?.localStorage?.key, V = `${i}-${e}-${O}`;
      return localStorage.getItem(V) && localStorage.removeItem(V), Ce(() => {
        Ve(e, t), ie(e, t);
        const F = T.getState().getShadowMetadata(e, []);
        F && F?.components?.forEach((U) => {
          U.forceUpdate();
        });
      }), {
        fetchId: (F) => a.$get()[F]
      };
    }
  };
  return l({
    componentId: S,
    path: []
  });
}
function be(e) {
  return Ae(ut, { proxy: e });
}
function ut({
  proxy: e
}) {
  const r = R(null), S = R(null), i = R(!1), g = `${e._stateKey}-${e._path.join(".")}`, l = e._path.length > 0 ? e._path.join(".") : "root", u = e._meta?.arrayViews?.[l], c = x(e._stateKey, e._path, u);
  return G(() => {
    const t = r.current;
    if (!t || i.current) return;
    const a = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", g);
        return;
      }
      const f = t.parentElement, O = Array.from(f.childNodes).indexOf(t);
      let V = f.getAttribute("data-parent-id");
      V || (V = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", V)), S.current = `instance-${crypto.randomUUID()}`;
      const F = T.getState().getShadowMetadata(e._stateKey, e._path) || {}, U = F.signals || [];
      U.push({
        instanceId: S.current,
        parentId: V,
        position: O,
        effect: e._effect
      }), T.getState().setShadowMetadata(e._stateKey, e._path, {
        ...F,
        signals: U
      });
      let L = c;
      if (e._effect)
        try {
          L = new Function(
            "state",
            `return (${e._effect})(state)`
          )(c);
        } catch (K) {
          console.error("Error evaluating effect function:", K);
        }
      L !== null && typeof L == "object" && (L = JSON.stringify(L));
      const o = document.createTextNode(String(L ?? ""));
      t.replaceWith(o), i.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(a), S.current) {
        const f = T.getState().getShadowMetadata(e._stateKey, e._path) || {};
        f.signals && (f.signals = f.signals.filter(
          ($) => $.instanceId !== S.current
        ), T.getState().setShadowMetadata(e._stateKey, e._path, f));
      }
    };
  }, []), Ae("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": g
  });
}
export {
  be as $cogsSignal,
  Tt as addStateOptions,
  Qe as createCogsState,
  At as createCogsStateFromSync,
  ct as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
