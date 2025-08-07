"use client";
import { jsx as ne, Fragment as $e } from "react/jsx-runtime";
import { memo as Ue, useState as J, useRef as W, useCallback as ae, useEffect as q, useLayoutEffect as ie, useMemo as de, createElement as be, startTransition as Fe } from "react";
import { transformStateFunc as Le, isFunction as X, isDeepEqual as oe, getDifferences as _e, isArray as xe } from "./utility.js";
import { ValidationWrapper as ke } from "./Functions.jsx";
import Re from "superjson";
import { v4 as K } from "uuid";
import { getGlobalStore as I, formRefStore as Ie, buildShadowNode as He, METADATA_KEYS as We } from "./store.js";
import { useCogsConfig as Ce } from "./CogsStateClient.jsx";
import { useInView as Be } from "react-intersection-observer";
const {
  getInitialOptions: G,
  updateInitialStateGlobal: Pe,
  // ALIAS THE NEW FUNCTIONS TO THE OLD NAMES
  getShadowMetadata: D,
  setShadowMetadata: x,
  getShadowValue: $,
  initializeShadowState: ce,
  updateShadowAtPath: qe,
  insertShadowArrayElement: De,
  removeShadowArrayElement: ze,
  getSelectedIndex: Dt,
  setInitialStateOptions: fe,
  setServerStateUpdate: Ge,
  markAsDirty: ge,
  registerComponent: Je,
  unregisterComponent: Ze,
  addPathComponent: Ye,
  clearSelectedIndexesForState: Qe,
  addStateLog: Xe,
  setSyncInfo: Ke,
  clearSelectedIndex: et,
  getSyncInfo: tt,
  notifyPathSubscribers: Oe,
  subscribeToPath: rt
  // Note: The old functions are no longer imported under their original names
} = I.getState();
function re(e, t, c) {
  const o = D(e, t);
  if (console.log("shadowNode", o, c), o && "value" in o)
    return { isArray: !1, value: o.value, keys: [] };
  const d = t.join("."), s = c?.arrayViews?.[d] ?? o?.arrayKeys, u = I.getState().getShadowValue(e, t, s);
  return Array.isArray(u) ? { isArray: !0, value: u, keys: s ?? [] } : { isArray: !1, value: u, keys: [] };
}
function pe(e, t, c) {
  for (let o = 0; o < e.length; o++)
    if (c(e[o], o)) {
      const d = t[o];
      if (d)
        return { key: d, index: o, value: e[o] };
    }
  return null;
}
function we(e, t) {
  const c = G(e) || {};
  fe(e, {
    ...c,
    ...t
  });
}
function Ee({
  stateKey: e,
  options: t,
  initialOptionsPart: c
}) {
  const o = G(e) || {}, s = { ...c[e] || {}, ...o };
  let u = !1;
  if (t)
    for (const i in t)
      s.hasOwnProperty(i) ? (i == "localStorage" && t[i] && s[i].key !== t[i]?.key && (u = !0, s[i] = t[i]), i == "defaultState" && t[i] && s[i] !== t[i] && !oe(s[i], t[i]) && (u = !0, s[i] = t[i])) : (u = !0, s[i] = t[i]);
  s.syncOptions && (!t || !t.hasOwnProperty("syncOptions")) && (u = !0), u && fe(e, s);
}
function Ot(e, { formElements: t, validation: c }) {
  return { initialState: e, formElements: t, validation: c };
}
const nt = (e, t) => {
  let c = e;
  const [o, d] = Le(c);
  t?.__fromSyncSchema && t?.__syncNotifications && I.getState().setInitialStateOptions("__notifications", t.__syncNotifications), t?.__fromSyncSchema && t?.__apiParamsMap && I.getState().setInitialStateOptions("__apiParamsMap", t.__apiParamsMap), Object.keys(o).forEach((i) => {
    let S = d[i] || {};
    const r = {
      ...S
    };
    if (t?.formElements && (r.formElements = {
      ...t.formElements,
      ...S.formElements || {}
    }), t?.validation && (r.validation = {
      ...t.validation,
      ...S.validation || {}
    }, t.validation.key && !S.validation?.key && (r.validation.key = `${t.validation.key}.${i}`)), t?.__syncSchemas?.[i]?.schemas?.validation && (r.validation = {
      zodSchemaV4: t.__syncSchemas[i].schemas.validation,
      ...S.validation
    }), Object.keys(r).length > 0) {
      const l = G(i);
      l ? fe(i, {
        ...l,
        ...r
      }) : fe(i, r);
    }
  }), Object.keys(o).forEach((i) => {
    ce(i, o[i]);
  }), console.log("new stateObject ", I.getState().shadowStateStore);
  const s = (i, S) => {
    const [r] = J(S?.componentId ?? K());
    Ee({
      stateKey: i,
      options: S,
      initialOptionsPart: d
    });
    const l = $(i, []) || o[i], M = S?.modifyState ? S.modifyState(l) : l;
    return St(M, {
      stateKey: i,
      syncUpdate: S?.syncUpdate,
      componentId: r,
      localStorage: S?.localStorage,
      middleware: S?.middleware,
      reactiveType: S?.reactiveType,
      reactiveDeps: S?.reactiveDeps,
      defaultState: S?.defaultState,
      dependencies: S?.dependencies,
      serverState: S?.serverState,
      syncOptions: S?.syncOptions,
      __useSync: t?.__useSync
    });
  };
  function u(i, S) {
    Ee({ stateKey: i, options: S, initialOptionsPart: d }), S.localStorage && at(i, S), Me(i);
  }
  return { useCogsState: s, setCogsOptions: u };
};
function Nt(e, t) {
  const c = e.schemas, o = {}, d = {};
  for (const s in c) {
    const u = c[s];
    o[s] = u?.schemas?.defaultValues || {}, u?.api?.queryData?._paramType && (d[s] = u.api.queryData._paramType);
  }
  return nt(o, {
    __fromSyncSchema: !0,
    __syncNotifications: e.notifications,
    __apiParamsMap: d,
    __useSync: t,
    __syncSchemas: c
  });
}
const ot = (e, t, c, o, d) => {
  c?.log && console.log(
    "saving to localstorage",
    t,
    c.localStorage?.key,
    o
  );
  const s = X(c?.localStorage?.key) ? c.localStorage?.key(e) : c?.localStorage?.key;
  if (s && o) {
    const u = `${o}-${t}-${s}`;
    let i;
    try {
      i = he(u)?.lastSyncedWithServer;
    } catch {
    }
    const S = D(t, []), r = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: i,
      stateSource: S?.stateSource,
      baseServerState: S?.baseServerState
    }, l = Re.serialize(r);
    window.localStorage.setItem(
      u,
      JSON.stringify(l.json)
    );
  }
}, he = (e) => {
  if (!e) return null;
  try {
    const t = window.localStorage.getItem(e);
    return t ? JSON.parse(t) : null;
  } catch (t) {
    return console.error("Error loading from localStorage:", t), null;
  }
}, at = (e, t) => {
  const c = $(e, []), { sessionId: o } = Ce(), d = X(t?.localStorage?.key) ? t.localStorage.key(c) : t?.localStorage?.key;
  if (d && o) {
    const s = he(
      `${o}-${e}-${d}`
    );
    if (s && s.lastUpdated > (s.lastSyncedWithServer || 0))
      return Me(e), !0;
  }
  return !1;
}, Me = (e) => {
  const t = D(e, []);
  if (!t) return;
  const c = /* @__PURE__ */ new Set();
  t?.components?.forEach((o) => {
    (o ? Array.isArray(o.reactiveType) ? o.reactiveType : [o.reactiveType || "component"] : null)?.includes("none") || c.add(() => o.forceUpdate());
  }), queueMicrotask(() => {
    c.forEach((o) => o());
  });
};
function Se(e, t, c, o) {
  const d = D(e, t);
  if (x(e, t, {
    ...d,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: o || Date.now()
  }), Array.isArray(c)) {
    const s = D(e, t);
    s?.arrayKeys && s.arrayKeys.forEach((u, i) => {
      const S = [...t, u], r = c[i];
      r !== void 0 && Se(
        e,
        S,
        r,
        o
      );
    });
  } else c && typeof c == "object" && c.constructor === Object && Object.keys(c).forEach((s) => {
    const u = [...t, s], i = c[s];
    Se(e, u, i, o);
  });
}
let me = [], Te = !1;
function st() {
  Te || (Te = !0, queueMicrotask(ft));
}
function it(e, t, c) {
  const o = D(e, t) || {}, d = I.getState().getShadowValue(e, t), s = X(c) ? c(d) : c, u = He(s);
  if (Object.prototype.hasOwnProperty.call(u, "value"))
    for (const S in o)
      We.has(S) && (u[S] = o[S]);
  qe(e, t, s), ge(e, t, { bubble: !0 });
  const i = D(e, t);
  return {
    type: "update",
    oldValue: d,
    newValue: s,
    shadowMeta: i
  };
}
function ct(e, t) {
  e?.signals?.length && e.signals.forEach(({ parentId: c, position: o, effect: d }) => {
    const s = document.querySelector(`[data-parent-id="${c}"]`);
    if (!s) return;
    const u = Array.from(s.childNodes);
    if (!u[o]) return;
    let i = t;
    if (d && t !== null)
      try {
        i = new Function("state", `return (${d})(state)`)(
          t
        );
      } catch (S) {
        console.error("Error evaluating effect function:", S);
      }
    i !== null && typeof i == "object" && (i = JSON.stringify(i)), u[o].textContent = String(i ?? "");
  });
}
function lt(e, t, c) {
  const o = D(e, []);
  if (!o?.components)
    return /* @__PURE__ */ new Set();
  const d = /* @__PURE__ */ new Set();
  if (c.type === "update") {
    let s = [...t];
    for (; ; ) {
      const u = D(e, s);
      if (u?.pathComponents && u.pathComponents.forEach((i) => {
        const S = o.components?.get(i);
        S && ((Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"]).includes("none") || d.add(S));
      }), s.length === 0) break;
      s.pop();
    }
    c.newValue && typeof c.newValue == "object" && !xe(c.newValue) && _e(c.newValue, c.oldValue).forEach((i) => {
      const S = i.split("."), r = [...t, ...S], l = D(e, r);
      l?.pathComponents && l.pathComponents.forEach((M) => {
        const _ = o.components?.get(M);
        _ && ((Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"]).includes("none") || d.add(_));
      });
    });
  } else if (c.type === "insert" || c.type === "cut") {
    const s = c.type === "insert" ? t : t.slice(0, -1), u = D(e, s);
    u?.pathComponents && u.pathComponents.forEach((i) => {
      const S = o.components?.get(i);
      S && d.add(S);
    });
  }
  return o.components.forEach((s, u) => {
    if (d.has(s))
      return;
    const i = Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"];
    if (i.includes("all"))
      d.add(s);
    else if (i.includes("deps") && s.depsFunction) {
      const S = $(e, []), r = s.depsFunction(S);
      (r === !0 || Array.isArray(r) && !oe(s.prevDeps, r)) && (s.prevDeps = r, d.add(s));
    }
  }), d;
}
function ut(e, t, c) {
  let o;
  if (X(c)) {
    const { value: s } = Z(e, t);
    o = c({ state: s, uuid: K() });
  } else
    o = c;
  De(e, t, o), ge(e, t, { bubble: !0 });
  const d = D(e, t);
  if (d?.arrayKeys) {
    const s = d.arrayKeys[d.arrayKeys.length - 1];
    if (s) {
      const u = s.split(".").slice(1);
      ge(e, u, { bubble: !1 });
    }
  }
  return { type: "insert", newValue: o, shadowMeta: d };
}
function dt(e, t) {
  const c = t.slice(0, -1), o = $(e, t);
  return ze(e, t), ge(e, c, { bubble: !0 }), { type: "cut", oldValue: o, parentPath: c };
}
function ft() {
  const e = /* @__PURE__ */ new Set(), t = [], c = [];
  for (const o of me) {
    if (o.status && o.updateType) {
      c.push(o);
      continue;
    }
    const d = o, s = d.type === "cut" ? null : d.newValue;
    d.shadowMeta?.signals?.length > 0 && t.push({ shadowMeta: d.shadowMeta, displayValue: s }), lt(
      d.stateKey,
      d.path,
      d
    ).forEach((i) => {
      e.add(i);
    });
  }
  c.length > 0 && Xe(c), t.forEach(({ shadowMeta: o, displayValue: d }) => {
    ct(o, d);
  }), e.forEach((o) => {
    o.forceUpdate();
  }), me = [], Te = !1;
}
function gt(e, t, c, o) {
  return (s, u, i, S) => {
    d(e, u, s, i);
  };
  function d(s, u, i, S) {
    let r;
    switch (S.updateType) {
      case "update":
        r = it(s, u, i);
        break;
      case "insert":
        r = ut(s, u, i);
        break;
      case "cut":
        r = dt(s, u);
        break;
    }
    r.stateKey = s, r.path = u, me.push(r), st();
    const l = {
      timeStamp: Date.now(),
      stateKey: s,
      path: u,
      updateType: S.updateType,
      status: "new",
      oldValue: r.oldValue,
      newValue: r.newValue ?? null
    };
    me.push(l), r.newValue !== void 0 && ot(
      r.newValue,
      s,
      o.current,
      c
    ), o.current?.middleware && o.current.middleware({ update: l }), S.sync !== !1 && t.current?.connected && t.current.updateState({ operation: l });
  }
}
function St(e, {
  stateKey: t,
  localStorage: c,
  formElements: o,
  reactiveDeps: d,
  reactiveType: s,
  componentId: u,
  defaultState: i,
  syncUpdate: S,
  dependencies: r,
  serverState: l,
  __useSync: M
} = {}) {
  const [_, P] = J({}), { sessionId: N } = Ce();
  let U = !t;
  const [w] = J(t ?? K()), Y = W(u ?? K()), f = W(
    null
  );
  f.current = G(w) ?? null, q(() => {
    if (S && S.stateKey === w && S.path?.[0]) {
      const m = `${S.stateKey}:${S.path.join(".")}`;
      Ke(m, {
        timeStamp: S.timeStamp,
        userId: S.userId
      });
    }
  }, [S]);
  const R = ae(
    (m) => {
      const p = m ? { ...G(w), ...m } : G(w), b = p?.defaultState || i || e;
      if (p?.serverState?.status === "success" && p?.serverState?.data !== void 0)
        return {
          value: p.serverState.data,
          source: "server",
          timestamp: p.serverState.timestamp || Date.now()
        };
      if (p?.localStorage?.key && N) {
        const T = X(p.localStorage.key) ? p.localStorage.key(b) : p.localStorage.key, A = he(
          `${N}-${w}-${T}`
        );
        if (A && A.lastUpdated > (p?.serverState?.timestamp || 0))
          return {
            value: A.state,
            source: "localStorage",
            timestamp: A.lastUpdated
          };
      }
      return {
        value: b || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, i, e, N]
  );
  q(() => {
    Ge(w, l);
  }, [l, w]), q(() => I.getState().subscribeToPath(w, (h) => {
    if (h?.type === "SERVER_STATE_UPDATE") {
      const p = h.serverState;
      if (p?.status !== "success" || p.data === void 0)
        return;
      console.log(
        "✅ SERVER_STATE_UPDATE received with data:",
        p
      ), we(w, { serverState: p });
      const b = typeof p.merge == "object" ? p.merge : p.merge === !0 ? { strategy: "append" } : null, E = $(w, []), T = p.data;
      if (b && b.strategy === "append" && "key" in b && // Type guard for key
      Array.isArray(E) && Array.isArray(T)) {
        const A = b.key;
        if (!A) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        console.log("SERVER_STATE_UPDATE 2");
        const O = new Set(
          E.map((B) => B[A])
        ), V = T.filter(
          (B) => !O.has(B[A])
        );
        V.length > 0 && V.forEach((B) => {
          De(w, [], B);
        });
        const F = $(w, []);
        Se(
          w,
          [],
          F,
          p.timestamp
        );
      } else
        ce(w, T), Se(
          w,
          [],
          T,
          p.timestamp
        );
    }
  }), [w, R]), q(() => {
    const m = I.getState().getShadowMetadata(w, []);
    if (m && m.stateSource)
      return;
    const h = G(w), p = {
      syncEnabled: !!y && !!v,
      validationEnabled: !!(h?.validation?.zodSchemaV4 || h?.validation?.zodSchemaV3),
      localStorageEnabled: !!h?.localStorage?.key
    };
    if (x(w, [], {
      ...m,
      features: p
    }), h?.defaultState !== void 0 || i !== void 0) {
      const b = h?.defaultState || i;
      h?.defaultState || we(w, {
        defaultState: b
      });
      const { value: E, source: T, timestamp: A } = R();
      ce(w, E), x(w, [], {
        stateSource: T,
        lastServerSync: T === "server" ? A : void 0,
        isDirty: !1,
        baseServerState: T === "server" ? E : void 0
      }), Me(w);
    }
  }, [w, ...r || []]), ie(() => {
    U && we(w, {
      formElements: o,
      defaultState: i,
      localStorage: c,
      middleware: f.current?.middleware
    });
    const m = `${w}////${Y.current}`, h = D(w, []), p = h?.components || /* @__PURE__ */ new Map();
    return p.set(m, {
      forceUpdate: () => P({}),
      reactiveType: s ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: d || void 0,
      deps: d ? d($(w, [])) : [],
      prevDeps: d ? d($(w, [])) : []
    }), x(w, [], {
      ...h,
      components: p
    }), P({}), () => {
      const b = D(w, []), E = b?.components?.get(m);
      E?.paths && E.paths.forEach((T) => {
        const O = T.split(".").slice(1), V = I.getState().getShadowMetadata(w, O);
        V?.pathComponents && V.pathComponents.size === 0 && (delete V.pathComponents, I.getState().setShadowMetadata(w, O, V));
      }), b?.components && x(w, [], b);
    };
  }, []);
  const a = W(null), n = gt(
    w,
    a,
    N,
    f
  );
  I.getState().initialStateGlobal[w] || Pe(w, e);
  const g = de(() => Ne(
    w,
    n,
    Y.current,
    N
  ), [w, N]), y = M, v = f.current?.syncOptions;
  return y && (a.current = y(
    g,
    v ?? {}
  )), g;
}
function mt(e) {
  return !e || e.length === 0 ? "" : e.map(
    (t) => `${t.type}${JSON.stringify(t.dependencies || [])}`
  ).join("");
}
const ht = (e, t, c) => {
  const o = D(e, t);
  let d = Object.keys(o || {}).filter((s) => s.startsWith("id:"));
  if (!c || c.length === 0)
    return d;
  for (const s of c)
    if (s.type === "filter") {
      const u = [];
      d.forEach((i, S) => {
        const r = $(e, [...t, i]);
        s.fn(r, S) && u.push(i);
      }), d = u;
    } else s.type === "sort" && d.sort((u, i) => {
      const S = $(e, [...t, u]), r = $(e, [...t, i]);
      return s.fn(S, r);
    });
  return d;
}, Ae = (e, t, c) => {
  const o = `${e}////${t}`, s = D(e, [])?.components?.get(o);
  !s || s.reactiveType === "none" || !(Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType]).includes("component") || Ye(e, c, o);
}, ue = (e, t, c) => {
  const o = I.getState(), d = o.getShadowMetadata(e, []), s = /* @__PURE__ */ new Set();
  d?.components && d.components.forEach((i, S) => {
    (Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"]).includes("all") && (i.forceUpdate(), s.add(S));
  }), o.getShadowMetadata(e, [...t, "getSelected"])?.pathComponents?.forEach((i) => {
    d?.components?.get(i)?.forceUpdate();
  });
  const u = o.getShadowMetadata(e, t);
  for (let i of u?.arrayKeys || []) {
    const S = i + ".selected", r = o.getShadowMetadata(
      e,
      S.split(".").slice(1)
    );
    i == c && r?.pathComponents?.forEach((l) => {
      d?.components?.get(l)?.forceUpdate();
    });
  }
};
function Z(e, t, c) {
  const o = D(e, t), d = t.join("."), s = c?.arrayViews?.[d], u = $(e, t, s);
  return {
    shadowMeta: o,
    value: u,
    arrayKeys: o?.arrayKeys
    // Get arrayKeys from the metadata
  };
}
function Ne(e, t, c, o) {
  const d = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set([
    "getDifferences",
    "sync",
    "getStatus",
    "removeStorage",
    "showValidationErrors",
    "getSelected",
    "getSelectedIndex",
    "clearSelected",
    "useVirtualView",
    "stateMap",
    "$stateMap",
    "stateFind",
    "stateFilter",
    "stateSort",
    "stream",
    "stateList",
    "stateFlattenOn",
    "index",
    "last",
    "insert",
    "uniqueInsert",
    "cut",
    "cutSelected",
    "cutByValue",
    "toggleByValue",
    "findWith",
    "cutThis",
    "get",
    "getState",
    "$derive",
    "$get",
    "lastSynced",
    "getLocalStorage",
    "isSelected",
    "setSelected",
    "toggleSelected",
    "_componentId",
    "addZodValidation",
    "clearZodValidation",
    "applyJsonPatch",
    "getComponents",
    "getAllFormRefs",
    "getFormRef",
    "validationWrapper",
    "_stateKey",
    "_path",
    "update",
    "toggle",
    "formElement"
    // Add ANY other method names here
  ]);
  function u({
    path: r = [],
    meta: l,
    componentId: M
  }) {
    const _ = l ? JSON.stringify(l.arrayViews || l.transforms) : "", P = r.join(".") + ":" + _;
    if (d.has(P))
      return d.get(P);
    const N = [e, ...r].join("."), U = {
      get(Y, f) {
        if (r.length === 0 && f in i)
          return i[f];
        if (!s.has(f)) {
          const a = [...r, f];
          return u({
            path: a,
            componentId: M,
            meta: l
          });
        }
        if (f === "_rebuildStateShape")
          return u;
        if (f === "getDifferences")
          return () => {
            const { value: a, shadowMeta: n } = Z(
              e,
              r,
              l
            ), g = n?.baseServerState ?? I.getState().initialStateGlobal[e];
            return _e(a, g);
          };
        if (f === "sync" && r.length === 0)
          return async function() {
            const a = I.getState().getInitialOptions(e), n = a?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const g = I.getState().getShadowValue(e, []), y = a?.validation?.key;
            try {
              const v = await n.action(g);
              if (v && !v.success && v.errors, v?.success) {
                const m = I.getState().getShadowMetadata(e, []);
                x(e, [], {
                  ...m,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: g
                  // Update base server state
                }), n.onSuccess && n.onSuccess(v.data);
              } else !v?.success && n.onError && n.onError(v.error);
              return v;
            } catch (v) {
              return n.onError && n.onError(v), { success: !1, error: v };
            }
          };
        if (f === "_status" || f === "getStatus") {
          const a = () => {
            const { shadowMeta: n, value: g } = Z(e, r, l);
            return n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || g !== void 0 && !n ? "fresh" : "unknown";
          };
          return f === "_status" ? a() : a;
        }
        if (f === "removeStorage")
          return () => {
            const a = I.getState().initialStateGlobal[e], n = G(e), g = X(n?.localStorage?.key) ? n.localStorage.key(a) : n?.localStorage?.key, y = `${o}-${e}-${g}`;
            y && localStorage.removeItem(y);
          };
        if (f === "showValidationErrors")
          return () => {
            const { shadowMeta: a } = Z(e, r, l);
            return a?.validation?.status === "INVALID" && a.validation.errors.length > 0 ? a.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (f === "getSelected")
          return () => {
            const a = [e, ...r].join(".");
            Ae(e, M, [
              ...r,
              "getSelected"
            ]);
            const n = I.getState().selectedIndicesMap.get(a);
            if (!n)
              return;
            const g = r.join("."), y = l?.arrayViews?.[g], v = n.split(".").pop();
            if (!(y && !y.includes(v) || $(
              e,
              n.split(".").slice(1)
            ) === void 0))
              return u({
                path: n.split(".").slice(1),
                componentId: M,
                meta: l
              });
          };
        if (f === "getSelectedIndex")
          return () => {
            const a = e + "." + r.join(".");
            r.join(".");
            const n = I.getState().selectedIndicesMap.get(a);
            if (!n)
              return -1;
            const { keys: g } = re(e, r, l);
            if (!g)
              return -1;
            const y = n.split(".").pop();
            return g.indexOf(y);
          };
        if (f === "clearSelected")
          return ue(e, r), () => {
            et({
              arrayKey: e + "." + r.join(".")
            });
          };
        if (f === "useVirtualView")
          return (a) => {
            const {
              itemHeight: n = 50,
              overscan: g = 6,
              stickToBottom: y = !1,
              scrollStickTolerance: v = 75
            } = a, m = W(null), [h, p] = J({
              startIndex: 0,
              endIndex: 10
            }), [b, E] = J({}), T = W(!0), A = W({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), O = W(
              /* @__PURE__ */ new Map()
            );
            ie(() => {
              if (!y || !m.current || A.current.isUserScrolling)
                return;
              const k = m.current;
              k.scrollTo({
                top: k.scrollHeight,
                behavior: T.current ? "instant" : "smooth"
              });
            }, [b, y]);
            const { arrayKeys: V = [] } = Z(e, r, l), { totalHeight: F, itemOffsets: B } = de(() => {
              let k = 0;
              const C = /* @__PURE__ */ new Map();
              return (I.getState().getShadowMetadata(e, r)?.arrayKeys || []).forEach((L) => {
                const j = L.split(".").slice(1), z = I.getState().getShadowMetadata(e, j)?.virtualizer?.itemHeight || n;
                C.set(L, {
                  height: z,
                  offset: k
                }), k += z;
              }), O.current = C, { totalHeight: k, itemOffsets: C };
            }, [V.length, n]);
            ie(() => {
              if (y && V.length > 0 && m.current && !A.current.isUserScrolling && T.current) {
                const k = m.current, C = () => {
                  if (k.clientHeight > 0) {
                    const H = Math.ceil(
                      k.clientHeight / n
                    ), L = V.length - 1, j = Math.max(
                      0,
                      L - H - g
                    );
                    p({ startIndex: j, endIndex: L }), requestAnimationFrame(() => {
                      ee("instant"), T.current = !1;
                    });
                  } else
                    requestAnimationFrame(C);
                };
                C();
              }
            }, [V.length, y, n, g]);
            const le = ae(() => {
              const k = m.current;
              if (!k) return;
              const C = k.scrollTop, { scrollHeight: H, clientHeight: L } = k, j = A.current, z = H - (C + L), se = j.isNearBottom;
              j.isNearBottom = z <= v, C < j.lastScrollTop ? (j.scrollUpCount++, j.scrollUpCount > 3 && se && (j.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : j.isNearBottom && (j.isUserScrolling = !1, j.scrollUpCount = 0), j.lastScrollTop = C;
              let te = 0;
              for (let Q = 0; Q < V.length; Q++) {
                const ye = V[Q], ve = O.current.get(ye);
                if (ve && ve.offset + ve.height > C) {
                  te = Q;
                  break;
                }
              }
              if (te !== h.startIndex) {
                const Q = Math.ceil(L / n);
                p({
                  startIndex: Math.max(0, te - g),
                  endIndex: Math.min(
                    V.length - 1,
                    te + Q + g
                  )
                });
              }
            }, [
              V.length,
              h.startIndex,
              n,
              g,
              v
            ]);
            q(() => {
              const k = m.current;
              if (!(!k || !y))
                return k.addEventListener("scroll", le, {
                  passive: !0
                }), () => {
                  k.removeEventListener("scroll", le);
                };
            }, [le, y]);
            const ee = ae(
              (k = "smooth") => {
                const C = m.current;
                if (!C) return;
                A.current.isUserScrolling = !1, A.current.isNearBottom = !0, A.current.scrollUpCount = 0;
                const H = () => {
                  const L = (j = 0) => {
                    if (j > 5) return;
                    const z = C.scrollHeight, se = C.scrollTop, te = C.clientHeight;
                    se + te >= z - 1 || (C.scrollTo({
                      top: z,
                      behavior: k
                    }), setTimeout(() => {
                      const Q = C.scrollHeight, ye = C.scrollTop;
                      (Q !== z || ye + te < Q - 1) && L(j + 1);
                    }, 50));
                  };
                  L();
                };
                "requestIdleCallback" in window ? requestIdleCallback(H, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(H);
                });
              },
              []
            );
            return q(() => {
              if (!y || !m.current) return;
              const k = m.current, C = A.current;
              let H;
              const L = () => {
                clearTimeout(H), H = setTimeout(() => {
                  !C.isUserScrolling && C.isNearBottom && ee(
                    T.current ? "instant" : "smooth"
                  );
                }, 100);
              }, j = new MutationObserver(() => {
                C.isUserScrolling || L();
              });
              j.observe(k, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
                // More specific than just 'height'
              });
              const z = (se) => {
                se.target instanceof HTMLImageElement && !C.isUserScrolling && L();
              };
              return k.addEventListener("load", z, !0), T.current ? setTimeout(() => {
                ee("instant");
              }, 0) : L(), () => {
                clearTimeout(H), j.disconnect(), k.removeEventListener("load", z, !0);
              };
            }, [y, V.length, ee]), {
              virtualState: de(() => {
                const k = I.getState(), C = k.getShadowValue(e, r), H = k.getShadowMetadata(e, r)?.arrayKeys || [];
                C.slice(
                  h.startIndex,
                  h.endIndex + 1
                );
                const L = H.slice(
                  h.startIndex,
                  h.endIndex + 1
                ), j = r.length > 0 ? r.join(".") : "root";
                return u({
                  path: r,
                  componentId: M,
                  meta: { ...l, arrayViews: { [j]: L } }
                });
              }, [h.startIndex, h.endIndex, V.length]),
              virtualizerProps: {
                outer: {
                  ref: m,
                  style: {
                    overflowY: "auto",
                    height: "100%",
                    position: "relative"
                  }
                },
                inner: {
                  style: {
                    height: `${F}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${O.current.get(V[h.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: ee,
              scrollToIndex: (k, C = "smooth") => {
                if (m.current && V[k]) {
                  const H = O.current.get(V[k])?.offset || 0;
                  m.current.scrollTo({ top: H, behavior: C });
                }
              }
            };
          };
        if (f === "stateMap")
          return (a) => {
            const { value: n, keys: g } = re(
              e,
              r,
              l
            );
            if (!g || !Array.isArray(n))
              return [];
            const y = u({
              path: r,
              componentId: M,
              meta: l
            });
            return n.map((v, m) => {
              const h = g[m];
              if (!h) return;
              const p = [...r, h], b = u({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: M,
                meta: l
              });
              return a(b, m, y);
            });
          };
        if (f === "stateFilter")
          return (a) => {
            const n = r.length > 0 ? r.join(".") : "root", g = l?.arrayViews?.[n] ?? Object.keys(D(e, r) || {}).filter(
              (h) => h.startsWith("id:")
            ), y = $(e, r, g);
            if (!Array.isArray(y))
              throw new Error("stateFilter can only be used on arrays");
            const v = [];
            y.forEach((h, p) => {
              if (a(h, p)) {
                const b = g[p];
                b && v.push(b);
              }
            });
            const m = r.length > 0 ? r.join(".") : "root";
            return u({
              path: r,
              componentId: M,
              meta: {
                ...l,
                // Create a new arrayViews object, preserving other views and setting the new one for this path
                arrayViews: {
                  ...l?.arrayViews || {},
                  [m]: v
                },
                transforms: [
                  ...l?.transforms || [],
                  { type: "filter", fn: a, path: r }
                ]
              }
            });
          };
        if (f === "stateSort")
          return (a) => {
            r.join(".");
            const { value: n, keys: g } = re(
              e,
              r,
              l
            );
            if (!Array.isArray(n) || !g)
              throw new Error("No array keys found for sorting");
            const y = n.map((m, h) => ({
              item: m,
              key: g[h]
            }));
            y.sort((m, h) => a(m.item, h.item));
            const v = y.map((m) => m.key);
            return u({
              path: r,
              componentId: M,
              meta: {
                ...l,
                arrayViews: {
                  ...l?.arrayViews || {},
                  arrayPathKey: v
                },
                transforms: [
                  ...l?.transforms || [],
                  { type: "sort", fn: a, path: r }
                ]
              }
            });
          };
        if (f === "stream")
          return function(a = {}) {
            const {
              bufferSize: n = 100,
              flushInterval: g = 100,
              bufferStrategy: y = "accumulate",
              store: v,
              onFlush: m
            } = a;
            let h = [], p = !1, b = null;
            const E = (F) => {
              if (!p) {
                if (y === "sliding" && h.length >= n)
                  h.shift();
                else if (y === "dropping" && h.length >= n)
                  return;
                h.push(F), h.length >= n && T();
              }
            }, T = () => {
              if (h.length === 0) return;
              const F = [...h];
              if (h = [], v) {
                const B = v(F);
                B !== void 0 && (Array.isArray(B) ? B : [B]).forEach((ee) => {
                  t(ee, r, {
                    updateType: "insert"
                  });
                });
              } else
                F.forEach((B) => {
                  t(B, r, {
                    updateType: "insert"
                  });
                });
              m?.(F);
            };
            g > 0 && (b = setInterval(T, g));
            const A = K(), O = D(e, r) || {}, V = O.streams || /* @__PURE__ */ new Map();
            return V.set(A, { buffer: h, flushTimer: b }), x(e, r, {
              ...O,
              streams: V
            }), {
              write: (F) => E(F),
              writeMany: (F) => F.forEach(E),
              flush: () => T(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, h.length > 0 && T();
              },
              close: () => {
                T(), b && clearInterval(b);
                const F = I.getState().getShadowMetadata(e, r);
                F?.streams && F.streams.delete(A);
              }
            };
          };
        if (f === "stateList")
          return (a) => /* @__PURE__ */ ne(() => {
            const g = W(/* @__PURE__ */ new Map()), y = l?.transforms && l.transforms.length > 0 ? `${M}-${mt(l.transforms)}` : `${M}-base`, [v, m] = J({}), { validIds: h, arrayValues: p } = de(() => {
              const E = I.getState().getShadowMetadata(e, r)?.transformCaches?.get(y);
              let T;
              E && E.validIds ? T = E.validIds : (T = ht(
                e,
                r,
                l?.transforms
              ), I.getState().setTransformCache(e, r, y, {
                validIds: T,
                computedAt: Date.now(),
                transforms: l?.transforms || []
              }));
              const A = I.getState().getShadowValue(e, r, T);
              return {
                validIds: T,
                arrayValues: A || []
              };
            }, [y, v]);
            if (q(() => {
              const E = I.getState().subscribeToPath(N, (T) => {
                if (console.log("changed array statelist  ", T), T.type === "GET_SELECTED")
                  return;
                const O = I.getState().getShadowMetadata(e, r)?.transformCaches;
                if (O)
                  for (const V of O.keys())
                    V.startsWith(M) && O.delete(V);
                (T.type === "INSERT" || T.type === "REMOVE" || T.type === "CLEAR_SELECTION") && m({});
              });
              return () => {
                E();
              };
            }, [M, N]), !Array.isArray(p))
              return null;
            const b = u({
              path: r,
              componentId: M,
              meta: l
            });
            return console.log("arrayValues", p), /* @__PURE__ */ ne($e, { children: p.map((E, T) => {
              const A = h[T];
              if (!A)
                return null;
              let O = g.current.get(A);
              O || (O = K(), g.current.set(A, O));
              const V = [...r, A];
              return be(vt, {
                key: A,
                stateKey: e,
                itemComponentId: O,
                itemPath: V,
                localIndex: T,
                arraySetter: b,
                rebuildStateShape: u,
                renderFn: a
              });
            }) });
          }, {});
        if (f === "stateFlattenOn")
          return (a) => {
            const n = r.join("."), g = l?.arrayViews?.[n], y = I.getState().getShadowValue(e, r, g);
            return Array.isArray(y) ? u({
              path: [...r, "[*]", a],
              componentId: M,
              meta: l
            }) : [];
          };
        if (f === "index")
          return (a) => {
            const n = r.join("."), g = l?.arrayViews?.[n];
            if (g) {
              const h = g[a];
              return h ? u({
                path: [...r, h],
                componentId: M,
                meta: l
              }) : void 0;
            }
            const y = D(e, r);
            if (!y) return;
            const m = Object.keys(y).filter((h) => h.startsWith("id:"))[a];
            if (m)
              return u({
                path: [...r, m],
                componentId: M,
                meta: l
              });
          };
        if (f === "last")
          return () => {
            const { value: a } = Z(e, r, l);
            if (a.length === 0) return;
            const n = a.length - 1;
            a[n];
            const g = [...r, n.toString()];
            return u({
              path: g,
              componentId: M,
              meta: l
            });
          };
        if (f === "insert")
          return (a, n) => {
            t(a, r, { updateType: "insert" });
          };
        if (f === "uniqueInsert")
          return (a, n, g) => {
            const { value: y } = Z(
              e,
              r,
              l
            ), v = X(a) ? a(y) : a;
            let m = null;
            if (!y.some((p) => {
              const b = n ? n.every(
                (E) => oe(p[E], v[E])
              ) : oe(p, v);
              return b && (m = p), b;
            }))
              t(v, r, { updateType: "insert" });
            else if (g && m) {
              const p = g(m), b = y.map(
                (E) => oe(E, m) ? p : E
              );
              t(b, r, {
                updateType: "update"
              });
            }
          };
        if (f === "cut")
          return (a, n) => {
            const g = $(e, r);
            if (!Array.isArray(g) || g.length === 0) return;
            const y = D(e, r);
            if (!y) return;
            const v = Object.keys(y).filter((p) => p.startsWith("id:")), m = a === -1 ? v.length - 1 : a !== void 0 ? a : v.length - 1, h = v[m];
            h && t(null, [...r, h], {
              updateType: "cut"
            });
          };
        if (f === "cutSelected")
          return () => {
            const a = [e, ...r].join(".");
            r.join(".");
            const { keys: n } = re(e, r, l);
            if (!n || n.length === 0)
              return;
            const g = I.getState().selectedIndicesMap.get(a);
            if (!g)
              return;
            const y = g.split(".").pop();
            if (!n.includes(y))
              return;
            const v = g.split(".").slice(1);
            I.getState().clearSelectedIndex({ arrayKey: a });
            const m = v.slice(0, -1);
            ue(e, m), t(null, v, {
              updateType: "cut"
            });
          };
        if (f === "cutByValue")
          return (a) => {
            const {
              isArray: n,
              value: g,
              keys: y
            } = re(e, r, l);
            if (!n) return;
            const v = pe(g, y, (m) => m === a);
            v && t(null, [...r, v.key], {
              updateType: "cut"
            });
          };
        if (f === "toggleByValue")
          return (a) => {
            const {
              isArray: n,
              value: g,
              keys: y
            } = re(e, r, l);
            if (!n) return;
            const v = pe(g, y, (m) => m === a);
            if (v) {
              const m = [...r, v.key];
              t(null, m, {
                updateType: "cut"
              });
            } else
              t(a, r, { updateType: "insert" });
          };
        if (f === "findWith")
          return (a, n) => {
            const { isArray: g, value: y, keys: v } = re(e, r, l);
            if (!g)
              throw new Error("findWith can only be used on arrays");
            const m = pe(
              y,
              v,
              (h) => h?.[a] === n
            );
            return u(m ? {
              path: [...r, m.key],
              // e.g., ['itemInstances', 'inst-1', 'properties', 'prop-b']
              componentId: M,
              meta: l
            } : {
              path: [...r, `not_found_${K()}`],
              componentId: M,
              meta: l
            });
          };
        if (f === "cutThis") {
          const { value: a } = Z(e, r, l);
          return () => {
            t(a, r, { updateType: "cut" });
          };
        }
        if (f === "get")
          return () => {
            Ae(e, M, r);
            const { value: a } = Z(e, r, l);
            return a;
          };
        if (f === "$derive")
          return (a) => Ve({
            _stateKey: e,
            _path: r,
            _effect: a.toString(),
            _meta: l
          });
        if (f === "$get")
          return () => Ve({ _stateKey: e, _path: r, _meta: l });
        if (f === "lastSynced") {
          const a = `${e}:${r.join(".")}`;
          return tt(a);
        }
        if (f == "getLocalStorage")
          return (a) => he(o + "-" + e + "-" + a);
        if (f === "isSelected") {
          const a = r.slice(0, -1);
          if (D(e, a)?.arrayKeys) {
            const g = e + "." + a.join("."), y = I.getState().selectedIndicesMap.get(g), v = e + "." + r.join(".");
            return ue(e, a, void 0), y === v;
          }
          return;
        }
        if (f === "setSelected")
          return (a) => {
            const n = r.slice(0, -1), g = e + "." + n.join("."), y = e + "." + r.join(".");
            ue(e, n, void 0), I.getState().selectedIndicesMap.get(g), a && I.getState().setSelectedIndex(g, y);
          };
        if (f === "toggleSelected")
          return () => {
            const a = r.slice(0, -1), n = e + "." + a.join("."), g = e + "." + r.join(".");
            I.getState().selectedIndicesMap.get(n) === g ? I.getState().clearSelectedIndex({ arrayKey: n }) : I.getState().setSelectedIndex(n, g);
          };
        if (f === "_componentId")
          return M;
        if (r.length == 0) {
          if (f === "addZodValidation")
            return (a) => {
              a.forEach((n) => {
                const g = I.getState().getShadowMetadata(e, n.path) || {};
                I.getState().setShadowMetadata(e, n.path, {
                  ...g,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: "client",
                        message: n.message,
                        severity: "error",
                        code: n.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                });
              });
            };
          if (f === "clearZodValidation")
            return (a) => {
              if (!a)
                throw new Error("clearZodValidation requires a path");
              const n = D(e, a) || {};
              x(e, a, {
                ...n,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (f === "applyJsonPatch")
            return (a) => {
              const n = I.getState(), g = n.getShadowMetadata(e, []);
              if (!g?.components) return;
              const y = (m) => !m || m === "/" ? [] : m.split("/").slice(1).map((h) => h.replace(/~1/g, "/").replace(/~0/g, "~")), v = /* @__PURE__ */ new Set();
              for (const m of a) {
                const h = y(m.path);
                switch (m.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = m;
                    n.updateShadowAtPath(e, h, p), n.markAsDirty(e, h, { bubble: !0 });
                    let b = [...h];
                    for (; ; ) {
                      const E = n.getShadowMetadata(
                        e,
                        b
                      );
                      if (E?.pathComponents && E.pathComponents.forEach((T) => {
                        if (!v.has(T)) {
                          const A = g.components?.get(T);
                          A && (A.forceUpdate(), v.add(T));
                        }
                      }), b.length === 0) break;
                      b.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = h.slice(0, -1);
                    n.removeShadowArrayElement(e, h), n.markAsDirty(e, p, { bubble: !0 });
                    let b = [...p];
                    for (; ; ) {
                      const E = n.getShadowMetadata(
                        e,
                        b
                      );
                      if (E?.pathComponents && E.pathComponents.forEach((T) => {
                        if (!v.has(T)) {
                          const A = g.components?.get(T);
                          A && (A.forceUpdate(), v.add(T));
                        }
                      }), b.length === 0) break;
                      b.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (f === "getComponents")
            return () => D(e, [])?.components;
          if (f === "getAllFormRefs")
            return () => Ie.getState().getFormRefsByStateKey(e);
        }
        if (f === "getFormRef")
          return () => Ie.getState().getFormRef(e + "." + r.join("."));
        if (f === "validationWrapper")
          return ({
            children: a,
            hideMessage: n
          }) => /* @__PURE__ */ ne(
            ke,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: r,
              stateKey: e,
              children: a
            }
          );
        if (f === "_stateKey") return e;
        if (f === "_path") return r;
        if (f === "update")
          return (a) => (t(a, r, { updateType: "update" }), {
            synced: () => {
              const n = I.getState().getShadowMetadata(e, r);
              x(e, r, {
                ...n,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const g = [e, ...r].join(".");
              Oe(g, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (f === "toggle") {
          const { value: a } = Z(
            e,
            r,
            l
          );
          if (typeof a != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            t(!a, r, {
              updateType: "update"
            });
          };
        }
        if (f === "formElement")
          return (a, n) => /* @__PURE__ */ ne(
            It,
            {
              stateKey: e,
              path: r,
              rebuildStateShape: u,
              setState: t,
              formOpts: n,
              renderFn: a
            }
          );
        const R = [...r, f];
        return I.getState().getShadowValue(e, R), u({
          path: R,
          componentId: M,
          meta: l
        });
      }
    }, w = new Proxy({}, U);
    return d.set(P, w), w;
  }
  const i = {
    revertToInitialState: (r) => {
      const l = I.getState().getShadowMetadata(e, []);
      l?.stateSource === "server" && l.baseServerState ? l.baseServerState : I.getState().initialStateGlobal[e];
      const M = I.getState().initialStateGlobal[e];
      Qe(e), ce(e, M), u({
        path: [],
        componentId: c
      });
      const _ = G(e), P = X(_?.localStorage?.key) ? _?.localStorage?.key(M) : _?.localStorage?.key, N = `${o}-${e}-${P}`;
      N && localStorage.removeItem(N);
      const U = I.getState().getShadowMetadata(e, []);
      return U && U?.components?.forEach((w) => {
        w.forceUpdate();
      }), M;
    },
    updateInitialState: (r) => {
      const l = Ne(
        e,
        t,
        c,
        o
      ), M = I.getState().initialStateGlobal[e], _ = G(e), P = X(_?.localStorage?.key) ? _?.localStorage?.key(M) : _?.localStorage?.key, N = `${o}-${e}-${P}`;
      return localStorage.getItem(N) && localStorage.removeItem(N), Fe(() => {
        Pe(e, r), ce(e, r);
        const U = I.getState().getShadowMetadata(e, []);
        U && U?.components?.forEach((w) => {
          w.forceUpdate();
        });
      }), {
        fetchId: (U) => l.get()[U]
      };
    }
  };
  return u({
    componentId: c,
    path: []
  });
}
function Ve(e) {
  return be(yt, { proxy: e });
}
function yt({
  proxy: e
}) {
  const t = W(null), c = W(null), o = W(!1), d = `${e._stateKey}-${e._path.join(".")}`, s = e._path.join("."), u = e._meta?.arrayViews?.[s], i = $(e._stateKey, e._path, u);
  return q(() => {
    const S = t.current;
    if (!S || o.current) return;
    const r = setTimeout(() => {
      if (!S.parentElement) {
        console.warn("Parent element not found for signal", d);
        return;
      }
      const l = S.parentElement, _ = Array.from(l.childNodes).indexOf(S);
      let P = l.getAttribute("data-parent-id");
      P || (P = `parent-${crypto.randomUUID()}`, l.setAttribute("data-parent-id", P)), c.current = `instance-${crypto.randomUUID()}`;
      const N = I.getState().getShadowMetadata(e._stateKey, e._path) || {}, U = N.signals || [];
      U.push({
        instanceId: c.current,
        parentId: P,
        position: _,
        effect: e._effect
      }), I.getState().setShadowMetadata(e._stateKey, e._path, {
        ...N,
        signals: U
      });
      let w = i;
      if (e._effect)
        try {
          w = new Function(
            "state",
            `return (${e._effect})(state)`
          )(i);
        } catch (f) {
          console.error("Error evaluating effect function:", f);
        }
      w !== null && typeof w == "object" && (w = JSON.stringify(w));
      const Y = document.createTextNode(String(w ?? ""));
      S.replaceWith(Y), o.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(r), c.current) {
        const l = I.getState().getShadowMetadata(e._stateKey, e._path) || {};
        l.signals && (l.signals = l.signals.filter(
          (M) => M.instanceId !== c.current
        ), I.getState().setShadowMetadata(e._stateKey, e._path, l));
      }
    };
  }, []), be("span", {
    ref: t,
    style: { display: "contents" },
    "data-signal-id": d
  });
}
const vt = Ue(
  wt,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
), pt = (e) => {
  const [t, c] = J(!1);
  return ie(() => {
    if (!e.current) {
      c(!0);
      return;
    }
    const o = Array.from(e.current.querySelectorAll("img"));
    if (o.length === 0) {
      c(!0);
      return;
    }
    let d = 0;
    const s = () => {
      d++, d === o.length && c(!0);
    };
    return o.forEach((u) => {
      u.complete ? s() : (u.addEventListener("load", s), u.addEventListener("error", s));
    }), () => {
      o.forEach((u) => {
        u.removeEventListener("load", s), u.removeEventListener("error", s);
      });
    };
  }, [e.current]), t;
};
function wt({
  stateKey: e,
  itemComponentId: t,
  itemPath: c,
  localIndex: o,
  arraySetter: d,
  rebuildStateShape: s,
  renderFn: u
}) {
  const [, i] = J({}), { ref: S, inView: r } = Be(), l = W(null), M = pt(l), _ = W(!1), P = [e, ...c].join(".");
  je(e, t, i);
  const N = ae(
    (f) => {
      l.current = f, S(f);
    },
    [S]
  );
  q(() => {
    rt(P, (f) => {
      i({});
    });
  }, []), q(() => {
    if (!r || !M || _.current)
      return;
    const f = l.current;
    if (f && f.offsetHeight > 0) {
      _.current = !0;
      const R = f.offsetHeight;
      x(e, c, {
        virtualizer: {
          itemHeight: R,
          domRef: f
        }
      });
      const a = c.slice(0, -1), n = [e, ...a].join(".");
      Oe(n, {
        type: "ITEMHEIGHT",
        itemKey: c.join("."),
        ref: l.current
      });
    }
  }, [r, M, e, c]);
  const U = $(e, c);
  if (U === void 0)
    return null;
  const w = s({
    currentState: U,
    path: c,
    componentId: t
  }), Y = u(w, o, d);
  return /* @__PURE__ */ ne("div", { ref: N, children: Y });
}
function It({
  stateKey: e,
  path: t,
  rebuildStateShape: c,
  renderFn: o,
  formOpts: d,
  setState: s
}) {
  const [u] = J(() => K()), [, i] = J({}), S = [e, ...t].join(".");
  je(e, u, i);
  const r = $(e, t), [l, M] = J(r), _ = W(!1), P = W(null);
  q(() => {
    !_.current && !oe(r, l) && M(r);
  }, [r]), q(() => {
    const f = I.getState().subscribeToPath(S, (R) => {
      !_.current && l !== R && i({});
    });
    return () => {
      f(), P.current && (clearTimeout(P.current), _.current = !1);
    };
  }, []);
  const N = ae(
    (f) => {
      typeof r === "number" && typeof f == "string" && (f = f === "" ? 0 : Number(f)), M(f), _.current = !0, P.current && clearTimeout(P.current);
      const a = d?.debounceTime ?? 200;
      P.current = setTimeout(() => {
        if (_.current = !1, s(f, t, { updateType: "update" }), !I.getState().getShadowMetadata(e, [])?.features?.validationEnabled) return;
        const g = G(e)?.validation, y = g?.zodSchemaV4 || g?.zodSchemaV3;
        if (y) {
          const v = $(e, []), m = y.safeParse(v), h = D(e, t) || {};
          if (m.success)
            x(e, t, {
              ...h,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: f
              }
            });
          else {
            const b = ("issues" in m.error ? m.error.issues : m.error.errors).filter(
              (E) => JSON.stringify(E.path) === JSON.stringify(t)
            );
            b.length > 0 ? x(e, t, {
              ...h,
              validation: {
                status: "INVALID",
                errors: [
                  {
                    source: "client",
                    message: b[0]?.message,
                    severity: "warning"
                    // Gentle error during typing
                  }
                ],
                lastValidated: Date.now(),
                validatedValue: f
              }
            }) : x(e, t, {
              ...h,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: f
              }
            });
          }
        }
      }, a), i({});
    },
    [s, t, d?.debounceTime, e]
  ), U = ae(async () => {
    if (console.log("handleBlur triggered"), P.current && (clearTimeout(P.current), P.current = null, _.current = !1, s(l, t, { updateType: "update" })), !D(e, [])?.features?.validationEnabled) return;
    const { getInitialOptions: R } = I.getState(), a = R(e)?.validation, n = a?.zodSchemaV4 || a?.zodSchemaV3;
    if (!n) return;
    const g = D(e, t);
    x(e, t, {
      ...g,
      validation: {
        status: "VALIDATING",
        errors: [],
        lastValidated: Date.now(),
        validatedValue: l
      }
    });
    const y = $(e, []), v = n.safeParse(y);
    if (console.log("result ", v), v.success)
      x(e, t, {
        ...g,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: l
        }
      });
    else {
      const m = "issues" in v.error ? v.error.issues : v.error.errors;
      console.log("All validation errors:", m), console.log("Current blur path:", t);
      const h = m.filter((p) => {
        if (console.log("Processing error:", p), t.some((E) => E.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const E = t[0].startsWith("id:") ? [] : t.slice(0, -1);
          console.log("Parent path:", E);
          const T = I.getState().getShadowMetadata(e, E);
          if (console.log("Array metadata:", T), T?.arrayKeys) {
            const A = [e, ...t.slice(0, -1)].join("."), O = T.arrayKeys.indexOf(A);
            console.log("Item key:", A, "Index:", O);
            const V = [...E, O, ...t.slice(-1)], F = JSON.stringify(p.path) === JSON.stringify(V);
            return console.log("Zod path comparison:", {
              zodPath: V,
              errorPath: p.path,
              match: F
            }), F;
          }
        }
        const b = JSON.stringify(p.path) === JSON.stringify(t);
        return console.log("Direct path comparison:", {
          errorPath: p.path,
          currentPath: t,
          match: b
        }), b;
      });
      console.log("Filtered path errors:", h), x(e, t, {
        ...g,
        validation: {
          status: "INVALID",
          errors: h.map((p) => ({
            source: "client",
            message: p.message,
            severity: "error"
            // Hard error on blur
          })),
          lastValidated: Date.now(),
          validatedValue: l
        }
      });
    }
    i({});
  }, [e, t, l, s]), w = c({
    path: t,
    componentId: u
  }), Y = new Proxy(w, {
    get(f, R) {
      return R === "inputProps" ? {
        value: l ?? "",
        onChange: (a) => {
          N(a.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: U,
        ref: Ie.getState().getFormRef(e + "." + t.join("."))
      } : f[R];
    }
  });
  return /* @__PURE__ */ ne(ke, { formOpts: d, path: t, stateKey: e, children: o(Y) });
}
function je(e, t, c) {
  const o = `${e}////${t}`;
  ie(() => (Je(e, o, {
    forceUpdate: () => c({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    Ze(e, o);
  }), [e, o]);
}
export {
  Ve as $cogsSignal,
  Ot as addStateOptions,
  nt as createCogsState,
  Nt as createCogsStateFromSync,
  St as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
