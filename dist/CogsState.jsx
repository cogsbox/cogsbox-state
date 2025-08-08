"use client";
import { jsx as ne, Fragment as Ne } from "react/jsx-runtime";
import { memo as $e, useState as J, useRef as B, useCallback as ae, useEffect as q, useLayoutEffect as ie, useMemo as we, createElement as Me, startTransition as je } from "react";
import { transformStateFunc as Fe, isFunction as X, isDeepEqual as oe, isArray as Le, getDifferences as xe } from "./utility.js";
import { ValidationWrapper as _e } from "./Functions.jsx";
import Re from "superjson";
import { v4 as ee } from "uuid";
import { getGlobalStore as I, formRefStore as Ie } from "./store.js";
import { useCogsConfig as ke } from "./CogsStateClient.jsx";
import { useInView as He } from "react-intersection-observer";
const {
  getInitialOptions: G,
  updateInitialStateGlobal: Pe,
  // ALIAS THE NEW FUNCTIONS TO THE OLD NAMES
  getShadowMetadata: D,
  setShadowMetadata: x,
  getShadowValue: F,
  initializeShadowState: ce,
  updateShadowAtPath: Be,
  insertShadowArrayElement: Ce,
  removeShadowArrayElement: We,
  getSelectedIndex: kt,
  setInitialStateOptions: de,
  setServerStateUpdate: qe,
  markAsDirty: fe,
  registerComponent: ze,
  unregisterComponent: Ge,
  addPathComponent: Je,
  clearSelectedIndexesForState: Ze,
  addStateLog: Ye,
  setSyncInfo: Qe,
  clearSelectedIndex: Xe,
  getSyncInfo: Ke,
  notifyPathSubscribers: De,
  subscribeToPath: et
  // Note: The old functions are no longer imported under their original names
} = I.getState();
function Z(e, t, c) {
  const n = D(e, t);
  if (!!!n?.arrayKeys)
    return { isArray: !1, value: I.getState().getShadowValue(e, t), keys: [] };
  const s = t.join("."), u = c?.arrayViews?.[s] ?? n.arrayKeys;
  return Array.isArray(u) && u.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: I.getState().getShadowValue(e, t, u), keys: u ?? [] };
}
function ve(e, t, c) {
  for (let n = 0; n < e.length; n++)
    if (c(e[n], n)) {
      const d = t[n];
      if (d)
        return { key: d, index: n, value: e[n] };
    }
  return null;
}
function pe(e, t) {
  const c = G(e) || {};
  de(e, {
    ...c,
    ...t
  });
}
function Ee({
  stateKey: e,
  options: t,
  initialOptionsPart: c
}) {
  const n = G(e) || {}, s = { ...c[e] || {}, ...n };
  let u = !1;
  if (t)
    for (const i in t)
      s.hasOwnProperty(i) ? (i == "localStorage" && t[i] && s[i].key !== t[i]?.key && (u = !0, s[i] = t[i]), i == "defaultState" && t[i] && s[i] !== t[i] && !oe(s[i], t[i]) && (u = !0, s[i] = t[i])) : (u = !0, s[i] = t[i]);
  s.syncOptions && (!t || !t.hasOwnProperty("syncOptions")) && (u = !0), u && de(e, s);
}
function Pt(e, { formElements: t, validation: c }) {
  return { initialState: e, formElements: t, validation: c };
}
const tt = (e, t) => {
  let c = e;
  const [n, d] = Fe(c);
  t?.__fromSyncSchema && t?.__syncNotifications && I.getState().setInitialStateOptions("__notifications", t.__syncNotifications), t?.__fromSyncSchema && t?.__apiParamsMap && I.getState().setInitialStateOptions("__apiParamsMap", t.__apiParamsMap), Object.keys(n).forEach((i) => {
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
      l ? de(i, {
        ...l,
        ...r
      }) : de(i, r);
    }
  }), Object.keys(n).forEach((i) => {
    ce(i, n[i]);
  }), console.log("new stateObject ", I.getState().shadowStateStore);
  const s = (i, S) => {
    const [r] = J(S?.componentId ?? ee());
    Ee({
      stateKey: i,
      options: S,
      initialOptionsPart: d
    });
    const l = F(i, []) || n[i], M = S?.modifyState ? S.modifyState(l) : l;
    return ft(M, {
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
    Ee({ stateKey: i, options: S, initialOptionsPart: d }), S.localStorage && nt(i, S), be(i);
  }
  return { useCogsState: s, setCogsOptions: u };
};
function Ct(e, t) {
  const c = e.schemas, n = {}, d = {};
  for (const s in c) {
    const u = c[s];
    n[s] = u?.schemas?.defaultValues || {}, u?.api?.queryData?._paramType && (d[s] = u.api.queryData._paramType);
  }
  return tt(n, {
    __fromSyncSchema: !0,
    __syncNotifications: e.notifications,
    __apiParamsMap: d,
    __useSync: t,
    __syncSchemas: c
  });
}
const rt = (e, t, c, n, d) => {
  c?.log && console.log(
    "saving to localstorage",
    t,
    c.localStorage?.key,
    n
  );
  const s = X(c?.localStorage?.key) ? c.localStorage?.key(e) : c?.localStorage?.key;
  if (s && n) {
    const u = `${n}-${t}-${s}`;
    let i;
    try {
      i = me(u)?.lastSyncedWithServer;
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
}, me = (e) => {
  if (!e) return null;
  try {
    const t = window.localStorage.getItem(e);
    return t ? JSON.parse(t) : null;
  } catch (t) {
    return console.error("Error loading from localStorage:", t), null;
  }
}, nt = (e, t) => {
  const c = F(e, []), { sessionId: n } = ke(), d = X(t?.localStorage?.key) ? t.localStorage.key(c) : t?.localStorage?.key;
  if (d && n) {
    const s = me(
      `${n}-${e}-${d}`
    );
    if (s && s.lastUpdated > (s.lastSyncedWithServer || 0))
      return be(e), !0;
  }
  return !1;
}, be = (e) => {
  const t = D(e, []);
  if (!t) return;
  const c = /* @__PURE__ */ new Set();
  t?.components?.forEach((n) => {
    (n ? Array.isArray(n.reactiveType) ? n.reactiveType : [n.reactiveType || "component"] : null)?.includes("none") || c.add(() => n.forceUpdate());
  }), queueMicrotask(() => {
    c.forEach((n) => n());
  });
};
function ge(e, t, c, n) {
  const d = D(e, t);
  if (x(e, t, {
    ...d,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: n || Date.now()
  }), Array.isArray(c)) {
    const s = D(e, t);
    s?.arrayKeys && s.arrayKeys.forEach((u, i) => {
      const S = [...t, u], r = c[i];
      r !== void 0 && ge(
        e,
        S,
        r,
        n
      );
    });
  } else c && typeof c == "object" && c.constructor === Object && Object.keys(c).forEach((s) => {
    const u = [...t, s], i = c[s];
    ge(e, u, i, n);
  });
}
let Se = [], Te = !1;
function ot() {
  Te || (Te = !0, queueMicrotask(ut));
}
function at(e, t, c) {
  const n = I.getState().getShadowValue(e, t), d = X(c) ? c(n) : c;
  Be(e, t, d), fe(e, t, { bubble: !0 });
  const s = D(e, t);
  return {
    type: "update",
    oldValue: n,
    newValue: d,
    shadowMeta: s
  };
}
function st(e, t) {
  e?.signals?.length && e.signals.forEach(({ parentId: c, position: n, effect: d }) => {
    const s = document.querySelector(`[data-parent-id="${c}"]`);
    if (!s) return;
    const u = Array.from(s.childNodes);
    if (!u[n]) return;
    let i = t;
    if (d && t !== null)
      try {
        i = new Function("state", `return (${d})(state)`)(
          t
        );
      } catch (S) {
        console.error("Error evaluating effect function:", S);
      }
    i !== null && typeof i == "object" && (i = JSON.stringify(i)), u[n].textContent = String(i ?? "");
  });
}
function it(e, t, c) {
  const n = D(e, []);
  if (!n?.components)
    return /* @__PURE__ */ new Set();
  const d = /* @__PURE__ */ new Set();
  if (c.type === "update") {
    let s = [...t];
    for (; ; ) {
      const u = D(e, s);
      if (u?.pathComponents && u.pathComponents.forEach((i) => {
        const S = n.components?.get(i);
        S && ((Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"]).includes("none") || d.add(S));
      }), s.length === 0) break;
      s.pop();
    }
    c.newValue && typeof c.newValue == "object" && !Le(c.newValue) && xe(c.newValue, c.oldValue).forEach((i) => {
      const S = i.split("."), r = [...t, ...S], l = D(e, r);
      l?.pathComponents && l.pathComponents.forEach((M) => {
        const _ = n.components?.get(M);
        _ && ((Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"]).includes("none") || d.add(_));
      });
    });
  } else if (c.type === "insert" || c.type === "cut") {
    const s = c.type === "insert" ? t : t.slice(0, -1), u = D(e, s);
    u?.pathComponents && u.pathComponents.forEach((i) => {
      const S = n.components?.get(i);
      S && d.add(S);
    });
  }
  return n.components.forEach((s, u) => {
    if (d.has(s))
      return;
    const i = Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"];
    if (i.includes("all"))
      d.add(s);
    else if (i.includes("deps") && s.depsFunction) {
      const S = F(e, []), r = s.depsFunction(S);
      (r === !0 || Array.isArray(r) && !oe(s.prevDeps, r)) && (s.prevDeps = r, d.add(s));
    }
  }), d;
}
function ct(e, t, c) {
  let n;
  if (X(c)) {
    const { value: s } = K(e, t);
    n = c({ state: s, uuid: ee() });
  } else
    n = c;
  Ce(e, t, n), fe(e, t, { bubble: !0 });
  const d = D(e, t);
  if (d?.arrayKeys) {
    const s = d.arrayKeys[d.arrayKeys.length - 1];
    if (s) {
      const u = s.split(".").slice(1);
      fe(e, u, { bubble: !1 });
    }
  }
  return { type: "insert", newValue: n, shadowMeta: d };
}
function lt(e, t) {
  const c = t.slice(0, -1), n = F(e, t);
  return We(e, t), fe(e, c, { bubble: !0 }), { type: "cut", oldValue: n, parentPath: c };
}
function ut() {
  const e = /* @__PURE__ */ new Set(), t = [], c = [];
  for (const n of Se) {
    if (n.status && n.updateType) {
      c.push(n);
      continue;
    }
    const d = n, s = d.type === "cut" ? null : d.newValue;
    d.shadowMeta?.signals?.length > 0 && t.push({ shadowMeta: d.shadowMeta, displayValue: s }), it(
      d.stateKey,
      d.path,
      d
    ).forEach((i) => {
      e.add(i);
    });
  }
  c.length > 0 && Ye(c), t.forEach(({ shadowMeta: n, displayValue: d }) => {
    st(n, d);
  }), e.forEach((n) => {
    n.forceUpdate();
  }), Se = [], Te = !1;
}
function dt(e, t, c, n) {
  return (s, u, i, S) => {
    d(e, u, s, i);
  };
  function d(s, u, i, S) {
    let r;
    switch (S.updateType) {
      case "update":
        r = at(s, u, i);
        break;
      case "insert":
        r = ct(s, u, i);
        break;
      case "cut":
        r = lt(s, u);
        break;
    }
    r.stateKey = s, r.path = u, Se.push(r), ot();
    const l = {
      timeStamp: Date.now(),
      stateKey: s,
      path: u,
      updateType: S.updateType,
      status: "new",
      oldValue: r.oldValue,
      newValue: r.newValue ?? null
    };
    Se.push(l), r.newValue !== void 0 && rt(
      r.newValue,
      s,
      n.current,
      c
    ), n.current?.middleware && n.current.middleware({ update: l }), S.sync !== !1 && t.current?.connected && t.current.updateState({ operation: l });
  }
}
function ft(e, {
  stateKey: t,
  localStorage: c,
  formElements: n,
  reactiveDeps: d,
  reactiveType: s,
  componentId: u,
  defaultState: i,
  syncUpdate: S,
  dependencies: r,
  serverState: l,
  __useSync: M
} = {}) {
  const [_, C] = J({}), { sessionId: U } = ke();
  let j = !t;
  const [w] = J(t ?? ee()), Y = B(u ?? ee()), f = B(
    null
  );
  f.current = G(w) ?? null, q(() => {
    if (S && S.stateKey === w && S.path?.[0]) {
      const m = `${S.stateKey}:${S.path.join(".")}`;
      Qe(m, {
        timeStamp: S.timeStamp,
        userId: S.userId
      });
    }
  }, [S]);
  const R = ae(
    (m) => {
      const p = m ? { ...G(w), ...m } : G(w), T = p?.defaultState || i || e;
      if (p?.serverState?.status === "success" && p?.serverState?.data !== void 0)
        return {
          value: p.serverState.data,
          source: "server",
          timestamp: p.serverState.timestamp || Date.now()
        };
      if (p?.localStorage?.key && U) {
        const E = X(p.localStorage.key) ? p.localStorage.key(T) : p.localStorage.key, b = me(
          `${U}-${w}-${E}`
        );
        if (b && b.lastUpdated > (p?.serverState?.timestamp || 0))
          return {
            value: b.state,
            source: "localStorage",
            timestamp: b.lastUpdated
          };
      }
      return {
        value: T || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, i, e, U]
  );
  q(() => {
    qe(w, l);
  }, [l, w]), q(() => I.getState().subscribeToPath(w, (h) => {
    if (h?.type === "SERVER_STATE_UPDATE") {
      const p = h.serverState;
      if (p?.status !== "success" || p.data === void 0)
        return;
      console.log(
        "✅ SERVER_STATE_UPDATE received with data:",
        p
      ), pe(w, { serverState: p });
      const T = typeof p.merge == "object" ? p.merge : p.merge === !0 ? { strategy: "append" } : null, A = F(w, []), E = p.data;
      if (T && T.strategy === "append" && "key" in T && // Type guard for key
      Array.isArray(A) && Array.isArray(E)) {
        const b = T.key;
        if (!b) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        console.log("SERVER_STATE_UPDATE 2");
        const N = new Set(
          A.map((W) => W[b])
        ), V = E.filter(
          (W) => !N.has(W[b])
        );
        V.length > 0 && V.forEach((W) => {
          Ce(w, [], W);
        });
        const O = F(w, []);
        ge(
          w,
          [],
          O,
          p.timestamp
        );
      } else
        ce(w, E), ge(
          w,
          [],
          E,
          p.timestamp
        );
    }
  }), [w, R]), q(() => {
    const m = I.getState().getShadowMetadata(w, []);
    if (m && m.stateSource)
      return;
    const h = G(w), p = {
      syncEnabled: !!v && !!y,
      validationEnabled: !!(h?.validation?.zodSchemaV4 || h?.validation?.zodSchemaV3),
      localStorageEnabled: !!h?.localStorage?.key
    };
    if (x(w, [], {
      ...m,
      features: p
    }), h?.defaultState !== void 0 || i !== void 0) {
      const T = h?.defaultState || i;
      h?.defaultState || pe(w, {
        defaultState: T
      });
      const { value: A, source: E, timestamp: b } = R();
      ce(w, A), x(w, [], {
        stateSource: E,
        lastServerSync: E === "server" ? b : void 0,
        isDirty: !1,
        baseServerState: E === "server" ? A : void 0
      }), be(w);
    }
  }, [w, ...r || []]), ie(() => {
    j && pe(w, {
      formElements: n,
      defaultState: i,
      localStorage: c,
      middleware: f.current?.middleware
    });
    const m = `${w}////${Y.current}`, h = D(w, []), p = h?.components || /* @__PURE__ */ new Map();
    return p.set(m, {
      forceUpdate: () => C({}),
      reactiveType: s ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: d || void 0,
      deps: d ? d(F(w, [])) : [],
      prevDeps: d ? d(F(w, [])) : []
    }), x(w, [], {
      ...h,
      components: p
    }), C({}), () => {
      const T = D(w, []), A = T?.components?.get(m);
      A?.paths && A.paths.forEach((E) => {
        const N = E.split(".").slice(1), V = I.getState().getShadowMetadata(w, N);
        V?.pathComponents && V.pathComponents.size === 0 && (delete V.pathComponents, I.getState().setShadowMetadata(w, N, V));
      }), T?.components && x(w, [], T);
    };
  }, []);
  const a = B(null), o = dt(
    w,
    a,
    U,
    f
  );
  I.getState().initialStateGlobal[w] || Pe(w, e);
  const g = we(() => Oe(
    w,
    o,
    Y.current,
    U
  ), [w, U]), v = M, y = f.current?.syncOptions;
  return v && (a.current = v(
    g,
    y ?? {}
  )), g;
}
const gt = (e, t, c) => {
  let n = D(e, t)?.arrayKeys || [];
  if (console.log("ids", n), !c || c.length === 0)
    return n;
  for (const d of c)
    if (d.type === "filter") {
      const s = [];
      n.forEach((u, i) => {
        const S = F(e, [...t, u]);
        d.fn(S, i) && s.push(u);
      }), n = s;
    } else d.type === "sort" && n.sort((s, u) => {
      const i = F(e, [...t, s]), S = F(e, [...t, u]);
      return d.fn(i, S);
    });
  return n;
}, Ve = (e, t, c) => {
  const n = `${e}////${t}`, s = D(e, [])?.components?.get(n);
  !s || s.reactiveType === "none" || !(Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType]).includes("component") || Je(e, c, n);
}, ue = (e, t, c) => {
  const n = I.getState(), d = n.getShadowMetadata(e, []), s = /* @__PURE__ */ new Set();
  d?.components && d.components.forEach((i, S) => {
    (Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"]).includes("all") && (i.forceUpdate(), s.add(S));
  }), n.getShadowMetadata(e, [...t, "getSelected"])?.pathComponents?.forEach((i) => {
    d?.components?.get(i)?.forceUpdate();
  });
  const u = n.getShadowMetadata(e, t);
  for (let i of u?.arrayKeys || []) {
    const S = i + ".selected", r = n.getShadowMetadata(
      e,
      S.split(".").slice(1)
    );
    i == c && r?.pathComponents?.forEach((l) => {
      d?.components?.get(l)?.forceUpdate();
    });
  }
};
function K(e, t, c) {
  const n = D(e, t), d = t.join("."), s = c?.arrayViews?.[d];
  if (Array.isArray(s) && s.length === 0)
    return {
      shadowMeta: n,
      value: [],
      arrayKeys: n?.arrayKeys
    };
  const u = F(e, t, s);
  return {
    shadowMeta: n,
    value: u,
    arrayKeys: n?.arrayKeys
  };
}
function Oe(e, t, c, n) {
  const d = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set([
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
    const _ = l ? JSON.stringify(l.arrayViews || l.transforms) : "", C = r.join(".") + ":" + _;
    if (d.has(C))
      return d.get(C);
    const U = [e, ...r].join("."), j = {
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
        if (f === "sync" && r.length === 0)
          return async function() {
            const a = I.getState().getInitialOptions(e), o = a?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const g = I.getState().getShadowValue(e, []), v = a?.validation?.key;
            try {
              const y = await o.action(g);
              if (y && !y.success && y.errors, y?.success) {
                const m = I.getState().getShadowMetadata(e, []);
                x(e, [], {
                  ...m,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: g
                  // Update base server state
                }), o.onSuccess && o.onSuccess(y.data);
              } else !y?.success && o.onError && o.onError(y.error);
              return y;
            } catch (y) {
              return o.onError && o.onError(y), { success: !1, error: y };
            }
          };
        if (f === "_status" || f === "getStatus") {
          const a = () => {
            const { shadowMeta: o, value: g } = K(e, r, l);
            return o?.isDirty === !0 ? "dirty" : o?.stateSource === "server" || o?.isDirty === !1 ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" || g !== void 0 && !o ? "fresh" : "unknown";
          };
          return f === "_status" ? a() : a;
        }
        if (f === "removeStorage")
          return () => {
            const a = I.getState().initialStateGlobal[e], o = G(e), g = X(o?.localStorage?.key) ? o.localStorage.key(a) : o?.localStorage?.key, v = `${n}-${e}-${g}`;
            v && localStorage.removeItem(v);
          };
        if (f === "showValidationErrors")
          return () => {
            const { shadowMeta: a } = K(e, r, l);
            return a?.validation?.status === "INVALID" && a.validation.errors.length > 0 ? a.validation.errors.filter((o) => o.severity === "error").map((o) => o.message) : [];
          };
        if (f === "getSelected")
          return () => {
            const a = [e, ...r].join(".");
            Ve(e, M, [
              ...r,
              "getSelected"
            ]);
            const o = I.getState().selectedIndicesMap.get(a);
            if (!o)
              return;
            const g = r.join("."), v = l?.arrayViews?.[g], y = o.split(".").pop();
            if (!(v && !v.includes(y) || F(
              e,
              o.split(".").slice(1)
            ) === void 0))
              return u({
                path: o.split(".").slice(1),
                componentId: M,
                meta: l
              });
          };
        if (f === "getSelectedIndex")
          return () => {
            const a = e + "." + r.join(".");
            r.join(".");
            const o = I.getState().selectedIndicesMap.get(a);
            if (!o)
              return -1;
            const { keys: g } = Z(e, r, l);
            if (!g)
              return -1;
            const v = o.split(".").pop();
            return g.indexOf(v);
          };
        if (f === "clearSelected")
          return ue(e, r), () => {
            Xe({
              arrayKey: e + "." + r.join(".")
            });
          };
        if (f === "useVirtualView")
          return (a) => {
            const {
              itemHeight: o = 50,
              overscan: g = 6,
              stickToBottom: v = !1,
              scrollStickTolerance: y = 75
            } = a, m = B(null), [h, p] = J({
              startIndex: 0,
              endIndex: 10
            }), [T, A] = J({}), E = B(!0), b = B({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), N = B(
              /* @__PURE__ */ new Map()
            );
            ie(() => {
              if (!v || !m.current || b.current.isUserScrolling)
                return;
              const k = m.current;
              k.scrollTo({
                top: k.scrollHeight,
                behavior: E.current ? "instant" : "smooth"
              });
            }, [T, v]);
            const { arrayKeys: V = [] } = K(e, r, l), { totalHeight: O, itemOffsets: W } = we(() => {
              let k = 0;
              const P = /* @__PURE__ */ new Map();
              return (I.getState().getShadowMetadata(e, r)?.arrayKeys || []).forEach((L) => {
                const $ = L.split(".").slice(1), z = I.getState().getShadowMetadata(e, $)?.virtualizer?.itemHeight || o;
                P.set(L, {
                  height: z,
                  offset: k
                }), k += z;
              }), N.current = P, { totalHeight: k, itemOffsets: P };
            }, [V.length, o]);
            ie(() => {
              if (v && V.length > 0 && m.current && !b.current.isUserScrolling && E.current) {
                const k = m.current, P = () => {
                  if (k.clientHeight > 0) {
                    const H = Math.ceil(
                      k.clientHeight / o
                    ), L = V.length - 1, $ = Math.max(
                      0,
                      L - H - g
                    );
                    p({ startIndex: $, endIndex: L }), requestAnimationFrame(() => {
                      te("instant"), E.current = !1;
                    });
                  } else
                    requestAnimationFrame(P);
                };
                P();
              }
            }, [V.length, v, o, g]);
            const le = ae(() => {
              const k = m.current;
              if (!k) return;
              const P = k.scrollTop, { scrollHeight: H, clientHeight: L } = k, $ = b.current, z = H - (P + L), se = $.isNearBottom;
              $.isNearBottom = z <= y, P < $.lastScrollTop ? ($.scrollUpCount++, $.scrollUpCount > 3 && se && ($.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : $.isNearBottom && ($.isUserScrolling = !1, $.scrollUpCount = 0), $.lastScrollTop = P;
              let re = 0;
              for (let Q = 0; Q < V.length; Q++) {
                const ye = V[Q], he = N.current.get(ye);
                if (he && he.offset + he.height > P) {
                  re = Q;
                  break;
                }
              }
              if (re !== h.startIndex) {
                const Q = Math.ceil(L / o);
                p({
                  startIndex: Math.max(0, re - g),
                  endIndex: Math.min(
                    V.length - 1,
                    re + Q + g
                  )
                });
              }
            }, [
              V.length,
              h.startIndex,
              o,
              g,
              y
            ]);
            q(() => {
              const k = m.current;
              if (!(!k || !v))
                return k.addEventListener("scroll", le, {
                  passive: !0
                }), () => {
                  k.removeEventListener("scroll", le);
                };
            }, [le, v]);
            const te = ae(
              (k = "smooth") => {
                const P = m.current;
                if (!P) return;
                b.current.isUserScrolling = !1, b.current.isNearBottom = !0, b.current.scrollUpCount = 0;
                const H = () => {
                  const L = ($ = 0) => {
                    if ($ > 5) return;
                    const z = P.scrollHeight, se = P.scrollTop, re = P.clientHeight;
                    se + re >= z - 1 || (P.scrollTo({
                      top: z,
                      behavior: k
                    }), setTimeout(() => {
                      const Q = P.scrollHeight, ye = P.scrollTop;
                      (Q !== z || ye + re < Q - 1) && L($ + 1);
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
              if (!v || !m.current) return;
              const k = m.current, P = b.current;
              let H;
              const L = () => {
                clearTimeout(H), H = setTimeout(() => {
                  !P.isUserScrolling && P.isNearBottom && te(
                    E.current ? "instant" : "smooth"
                  );
                }, 100);
              }, $ = new MutationObserver(() => {
                P.isUserScrolling || L();
              });
              $.observe(k, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
                // More specific than just 'height'
              });
              const z = (se) => {
                se.target instanceof HTMLImageElement && !P.isUserScrolling && L();
              };
              return k.addEventListener("load", z, !0), E.current ? setTimeout(() => {
                te("instant");
              }, 0) : L(), () => {
                clearTimeout(H), $.disconnect(), k.removeEventListener("load", z, !0);
              };
            }, [v, V.length, te]), {
              virtualState: we(() => {
                const k = I.getState(), P = k.getShadowValue(e, r), H = k.getShadowMetadata(e, r)?.arrayKeys || [];
                P.slice(
                  h.startIndex,
                  h.endIndex + 1
                );
                const L = H.slice(
                  h.startIndex,
                  h.endIndex + 1
                ), $ = r.length > 0 ? r.join(".") : "root";
                return u({
                  path: r,
                  componentId: M,
                  meta: { ...l, arrayViews: { [$]: L } }
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
                    height: `${O}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${N.current.get(V[h.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: te,
              scrollToIndex: (k, P = "smooth") => {
                if (m.current && V[k]) {
                  const H = N.current.get(V[k])?.offset || 0;
                  m.current.scrollTo({ top: H, behavior: P });
                }
              }
            };
          };
        if (f === "stateMap")
          return (a) => {
            const { value: o, keys: g } = Z(
              e,
              r,
              l
            );
            if (!g || !Array.isArray(o))
              return [];
            const v = u({
              path: r,
              componentId: M,
              meta: l
            });
            return o.map((y, m) => {
              const h = g[m];
              if (!h) return;
              const p = [...r, h], T = u({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: M,
                meta: l
              });
              return a(T, m, v);
            });
          };
        if (f === "stateFilter")
          return (a) => {
            const o = r.length > 0 ? r.join(".") : "root", { keys: g, value: v } = Z(
              e,
              r,
              l
            );
            if (!Array.isArray(v))
              throw new Error("stateFilter can only be used on arrays");
            const y = [];
            return v.forEach((m, h) => {
              if (a(m, h)) {
                const p = g[h];
                p && y.push(p);
              }
            }), u({
              path: r,
              componentId: M,
              meta: {
                ...l,
                arrayViews: {
                  ...l?.arrayViews || {},
                  [o]: y
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
            const o = r.join("."), { value: g, keys: v } = Z(
              e,
              r,
              l
            );
            if (!Array.isArray(g) || !v)
              throw new Error("No array keys found for sorting");
            const y = g.map((h, p) => ({
              item: h,
              key: v[p]
            }));
            y.sort((h, p) => a(h.item, p.item));
            const m = y.map((h) => h.key);
            return u({
              path: r,
              componentId: M,
              meta: {
                ...l,
                arrayViews: {
                  ...l?.arrayViews || {},
                  [o]: m
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
              bufferSize: o = 100,
              flushInterval: g = 100,
              bufferStrategy: v = "accumulate",
              store: y,
              onFlush: m
            } = a;
            let h = [], p = !1, T = null;
            const A = (O) => {
              if (!p) {
                if (v === "sliding" && h.length >= o)
                  h.shift();
                else if (v === "dropping" && h.length >= o)
                  return;
                h.push(O), h.length >= o && E();
              }
            }, E = () => {
              if (h.length === 0) return;
              const O = [...h];
              if (h = [], y) {
                const W = y(O);
                W !== void 0 && (Array.isArray(W) ? W : [W]).forEach((te) => {
                  t(te, r, {
                    updateType: "insert"
                  });
                });
              } else
                O.forEach((W) => {
                  t(W, r, {
                    updateType: "insert"
                  });
                });
              m?.(O);
            };
            g > 0 && (T = setInterval(E, g));
            const b = ee(), N = D(e, r) || {}, V = N.streams || /* @__PURE__ */ new Map();
            return V.set(b, { buffer: h, flushTimer: T }), x(e, r, {
              ...N,
              streams: V
            }), {
              write: (O) => A(O),
              writeMany: (O) => O.forEach(A),
              flush: () => E(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, h.length > 0 && E();
              },
              close: () => {
                E(), T && clearInterval(T);
                const O = I.getState().getShadowMetadata(e, r);
                O?.streams && O.streams.delete(b);
              }
            };
          };
        if (f === "stateList")
          return (a) => (console.log("meta outside", JSON.stringify(l)), /* @__PURE__ */ ne(() => {
            const g = B(/* @__PURE__ */ new Map()), [v, y] = J({});
            console.log("updateTrigger updateTrigger  updateTrigger");
            const m = gt(
              e,
              r,
              l?.transforms
            ), h = r.length > 0 ? r.join(".") : "root", p = {
              ...l,
              arrayViews: {
                ...l?.arrayViews || {},
                [h]: m
                // Update the arrayViews with the new valid IDs
              }
            }, { value: T } = Z(
              e,
              r,
              p
            );
            if (console.log("validIds", m), console.log("arrayValues", T), q(() => {
              const E = I.getState().subscribeToPath(U, (b) => {
                if (console.log("changed array statelist  ", b), b.type === "GET_SELECTED")
                  return;
                const V = I.getState().getShadowMetadata(e, r)?.transformCaches;
                if (V)
                  for (const O of V.keys())
                    O.startsWith(M) && V.delete(O);
                (b.type === "INSERT" || b.type === "REMOVE" || b.type === "CLEAR_SELECTION") && y({});
              });
              return () => {
                E();
              };
            }, [M, U]), !Array.isArray(T))
              return null;
            const A = u({
              path: r,
              componentId: M,
              meta: p
              // Use updated meta here
            });
            return console.log("arrayValues", T), /* @__PURE__ */ ne(Ne, { children: T.map((E, b) => {
              const N = m[b];
              if (!N)
                return null;
              let V = g.current.get(N);
              V || (V = ee(), g.current.set(N, V));
              const O = [...r, N];
              return Me(mt, {
                key: N,
                stateKey: e,
                itemComponentId: V,
                itemPath: O,
                localIndex: b,
                arraySetter: A,
                rebuildStateShape: u,
                renderFn: a
              });
            }) });
          }, {}));
        if (f === "stateFlattenOn")
          return (a) => {
            const o = r.join("."), g = l?.arrayViews?.[o], v = I.getState().getShadowValue(e, r, g);
            return Array.isArray(v) ? u({
              path: [...r, "[*]", a],
              componentId: M,
              meta: l
            }) : [];
          };
        if (f === "index")
          return (a) => {
            const o = r.join("."), g = l?.arrayViews?.[o];
            if (g) {
              const m = g[a];
              return m ? u({
                path: [...r, m],
                componentId: M,
                meta: l
              }) : void 0;
            }
            const v = D(e, r);
            if (!v?.arrayKeys) return;
            const y = v.arrayKeys[a];
            if (y)
              return u({
                path: [...r, y],
                componentId: M,
                meta: l
              });
          };
        if (f === "last")
          return () => {
            const { keys: a } = Z(e, r, l);
            if (!a || a.length === 0)
              return;
            const o = a[a.length - 1];
            if (!o)
              return;
            const g = [...r, o];
            return u({
              path: g,
              componentId: M,
              meta: l
            });
          };
        if (f === "insert")
          return (a, o) => {
            t(a, r, { updateType: "insert" });
          };
        if (f === "uniqueInsert")
          return (a, o, g) => {
            const { value: v } = K(
              e,
              r,
              l
            ), y = X(a) ? a(v) : a;
            let m = null;
            if (!v.some((p) => {
              const T = o ? o.every(
                (A) => oe(p[A], y[A])
              ) : oe(p, y);
              return T && (m = p), T;
            }))
              t(y, r, { updateType: "insert" });
            else if (g && m) {
              const p = g(m), T = v.map(
                (A) => oe(A, m) ? p : A
              );
              t(T, r, {
                updateType: "update"
              });
            }
          };
        if (f === "cut")
          return (a, o) => {
            const g = D(e, r);
            if (!g?.arrayKeys || g.arrayKeys.length === 0)
              return;
            const v = a === -1 ? g.arrayKeys.length - 1 : a !== void 0 ? a : g.arrayKeys.length - 1, y = g.arrayKeys[v];
            y && t(null, [...r, y], {
              updateType: "cut"
            });
          };
        if (f === "cutSelected")
          return () => {
            const a = [e, ...r].join("."), { keys: o } = Z(e, r, l);
            if (!o || o.length === 0)
              return;
            const g = I.getState().selectedIndicesMap.get(a);
            if (!g)
              return;
            const v = g.split(".").pop();
            if (!o.includes(v))
              return;
            const y = g.split(".").slice(1);
            I.getState().clearSelectedIndex({ arrayKey: a });
            const m = y.slice(0, -1);
            ue(e, m), t(null, y, {
              updateType: "cut"
            });
          };
        if (f === "cutByValue")
          return (a) => {
            const {
              isArray: o,
              value: g,
              keys: v
            } = Z(e, r, l);
            if (!o) return;
            const y = ve(g, v, (m) => m === a);
            y && t(null, [...r, y.key], {
              updateType: "cut"
            });
          };
        if (f === "toggleByValue")
          return (a) => {
            const {
              isArray: o,
              value: g,
              keys: v
            } = Z(e, r, l);
            if (!o) return;
            const y = ve(g, v, (m) => m === a);
            if (y) {
              const m = [...r, y.key];
              t(null, m, {
                updateType: "cut"
              });
            } else
              t(a, r, { updateType: "insert" });
          };
        if (f === "findWith")
          return (a, o) => {
            const { isArray: g, value: v, keys: y } = Z(e, r, l);
            if (!g)
              throw new Error("findWith can only be used on arrays");
            const m = ve(
              v,
              y,
              (h) => h?.[a] === o
            );
            return u(m ? {
              path: [...r, m.key],
              // e.g., ['itemInstances', 'inst-1', 'properties', 'prop-b']
              componentId: M,
              meta: l
            } : {
              path: [...r, `not_found_${ee()}`],
              componentId: M,
              meta: l
            });
          };
        if (f === "cutThis") {
          const { value: a } = K(e, r, l);
          return () => {
            t(a, r, { updateType: "cut" });
          };
        }
        if (f === "get")
          return () => {
            Ve(e, M, r);
            const { value: a } = K(e, r, l);
            return a;
          };
        if (f === "$derive")
          return (a) => Ae({
            _stateKey: e,
            _path: r,
            _effect: a.toString(),
            _meta: l
          });
        if (f === "$get")
          return () => Ae({ _stateKey: e, _path: r, _meta: l });
        if (f === "lastSynced") {
          const a = `${e}:${r.join(".")}`;
          return Ke(a);
        }
        if (f == "getLocalStorage")
          return (a) => me(n + "-" + e + "-" + a);
        if (f === "isSelected") {
          const a = r.slice(0, -1);
          if (D(e, a)?.arrayKeys) {
            const g = e + "." + a.join("."), v = I.getState().selectedIndicesMap.get(g), y = e + "." + r.join(".");
            return ue(e, a, void 0), v === y;
          }
          return;
        }
        if (f === "setSelected")
          return (a) => {
            const o = r.slice(0, -1), g = e + "." + o.join("."), v = e + "." + r.join(".");
            ue(e, o, void 0), I.getState().selectedIndicesMap.get(g), a && I.getState().setSelectedIndex(g, v);
          };
        if (f === "toggleSelected")
          return () => {
            const a = r.slice(0, -1), o = e + "." + a.join("."), g = e + "." + r.join(".");
            I.getState().selectedIndicesMap.get(o) === g ? I.getState().clearSelectedIndex({ arrayKey: o }) : I.getState().setSelectedIndex(o, g);
          };
        if (f === "_componentId")
          return M;
        if (r.length == 0) {
          if (f === "addZodValidation")
            return (a) => {
              a.forEach((o) => {
                const g = I.getState().getShadowMetadata(e, o.path) || {};
                I.getState().setShadowMetadata(e, o.path, {
                  ...g,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: "client",
                        message: o.message,
                        severity: "error",
                        code: o.code
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
              const o = D(e, a) || {};
              x(e, a, {
                ...o,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (f === "applyJsonPatch")
            return (a) => {
              const o = I.getState(), g = o.getShadowMetadata(e, []);
              if (!g?.components) return;
              const v = (m) => !m || m === "/" ? [] : m.split("/").slice(1).map((h) => h.replace(/~1/g, "/").replace(/~0/g, "~")), y = /* @__PURE__ */ new Set();
              for (const m of a) {
                const h = v(m.path);
                switch (m.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = m;
                    o.updateShadowAtPath(e, h, p), o.markAsDirty(e, h, { bubble: !0 });
                    let T = [...h];
                    for (; ; ) {
                      const A = o.getShadowMetadata(
                        e,
                        T
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((E) => {
                        if (!y.has(E)) {
                          const b = g.components?.get(E);
                          b && (b.forceUpdate(), y.add(E));
                        }
                      }), T.length === 0) break;
                      T.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = h.slice(0, -1);
                    o.removeShadowArrayElement(e, h), o.markAsDirty(e, p, { bubble: !0 });
                    let T = [...p];
                    for (; ; ) {
                      const A = o.getShadowMetadata(
                        e,
                        T
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((E) => {
                        if (!y.has(E)) {
                          const b = g.components?.get(E);
                          b && (b.forceUpdate(), y.add(E));
                        }
                      }), T.length === 0) break;
                      T.pop();
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
            hideMessage: o
          }) => /* @__PURE__ */ ne(
            _e,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
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
              const o = I.getState().getShadowMetadata(e, r);
              x(e, r, {
                ...o,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const g = [e, ...r].join(".");
              De(g, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (f === "toggle") {
          const { value: a } = K(
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
          return (a, o) => /* @__PURE__ */ ne(
            vt,
            {
              stateKey: e,
              path: r,
              rebuildStateShape: u,
              setState: t,
              formOpts: o,
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
    }, w = new Proxy({}, j);
    return d.set(C, w), w;
  }
  const i = {
    revertToInitialState: (r) => {
      const l = I.getState().getShadowMetadata(e, []);
      l?.stateSource === "server" && l.baseServerState ? l.baseServerState : I.getState().initialStateGlobal[e];
      const M = I.getState().initialStateGlobal[e];
      Ze(e), ce(e, M), u({
        path: [],
        componentId: c
      });
      const _ = G(e), C = X(_?.localStorage?.key) ? _?.localStorage?.key(M) : _?.localStorage?.key, U = `${n}-${e}-${C}`;
      U && localStorage.removeItem(U);
      const j = I.getState().getShadowMetadata(e, []);
      return j && j?.components?.forEach((w) => {
        w.forceUpdate();
      }), M;
    },
    updateInitialState: (r) => {
      const l = Oe(
        e,
        t,
        c,
        n
      ), M = I.getState().initialStateGlobal[e], _ = G(e), C = X(_?.localStorage?.key) ? _?.localStorage?.key(M) : _?.localStorage?.key, U = `${n}-${e}-${C}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), je(() => {
        Pe(e, r), ce(e, r);
        const j = I.getState().getShadowMetadata(e, []);
        j && j?.components?.forEach((w) => {
          w.forceUpdate();
        });
      }), {
        fetchId: (j) => l.get()[j]
      };
    }
  };
  return u({
    componentId: c,
    path: []
  });
}
function Ae(e) {
  return Me(St, { proxy: e });
}
function St({
  proxy: e
}) {
  const t = B(null), c = B(null), n = B(!1), d = `${e._stateKey}-${e._path.join(".")}`, s = e._path.join("."), u = e._meta?.arrayViews?.[s], i = F(e._stateKey, e._path, u);
  return q(() => {
    const S = t.current;
    if (!S || n.current) return;
    const r = setTimeout(() => {
      if (!S.parentElement) {
        console.warn("Parent element not found for signal", d);
        return;
      }
      const l = S.parentElement, _ = Array.from(l.childNodes).indexOf(S);
      let C = l.getAttribute("data-parent-id");
      C || (C = `parent-${crypto.randomUUID()}`, l.setAttribute("data-parent-id", C)), c.current = `instance-${crypto.randomUUID()}`;
      const U = I.getState().getShadowMetadata(e._stateKey, e._path) || {}, j = U.signals || [];
      j.push({
        instanceId: c.current,
        parentId: C,
        position: _,
        effect: e._effect
      }), I.getState().setShadowMetadata(e._stateKey, e._path, {
        ...U,
        signals: j
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
      S.replaceWith(Y), n.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(r), c.current) {
        const l = I.getState().getShadowMetadata(e._stateKey, e._path) || {};
        l.signals && (l.signals = l.signals.filter(
          (M) => M.instanceId !== c.current
        ), I.getState().setShadowMetadata(e._stateKey, e._path, l));
      }
    };
  }, []), Me("span", {
    ref: t,
    style: { display: "contents" },
    "data-signal-id": d
  });
}
const mt = $e(
  ht,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
), yt = (e) => {
  const [t, c] = J(!1);
  return ie(() => {
    if (!e.current) {
      c(!0);
      return;
    }
    const n = Array.from(e.current.querySelectorAll("img"));
    if (n.length === 0) {
      c(!0);
      return;
    }
    let d = 0;
    const s = () => {
      d++, d === n.length && c(!0);
    };
    return n.forEach((u) => {
      u.complete ? s() : (u.addEventListener("load", s), u.addEventListener("error", s));
    }), () => {
      n.forEach((u) => {
        u.removeEventListener("load", s), u.removeEventListener("error", s);
      });
    };
  }, [e.current]), t;
};
function ht({
  stateKey: e,
  itemComponentId: t,
  itemPath: c,
  localIndex: n,
  arraySetter: d,
  rebuildStateShape: s,
  renderFn: u
}) {
  const [, i] = J({}), { ref: S, inView: r } = He(), l = B(null), M = yt(l), _ = B(!1), C = [e, ...c].join(".");
  Ue(e, t, i);
  const U = ae(
    (f) => {
      l.current = f, S(f);
    },
    [S]
  );
  q(() => {
    et(C, (f) => {
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
      const a = c.slice(0, -1), o = [e, ...a].join(".");
      De(o, {
        type: "ITEMHEIGHT",
        itemKey: c.join("."),
        ref: l.current
      });
    }
  }, [r, M, e, c]);
  const j = F(e, c);
  if (j === void 0)
    return null;
  const w = s({
    currentState: j,
    path: c,
    componentId: t
  }), Y = u(w, n, d);
  return /* @__PURE__ */ ne("div", { ref: U, children: Y });
}
function vt({
  stateKey: e,
  path: t,
  rebuildStateShape: c,
  renderFn: n,
  formOpts: d,
  setState: s
}) {
  const [u] = J(() => ee()), [, i] = J({}), S = [e, ...t].join(".");
  Ue(e, u, i);
  const r = F(e, t), [l, M] = J(r), _ = B(!1), C = B(null);
  q(() => {
    !_.current && !oe(r, l) && M(r);
  }, [r]), q(() => {
    const f = I.getState().subscribeToPath(S, (R) => {
      !_.current && l !== R && i({});
    });
    return () => {
      f(), C.current && (clearTimeout(C.current), _.current = !1);
    };
  }, []);
  const U = ae(
    (f) => {
      typeof r === "number" && typeof f == "string" && (f = f === "" ? 0 : Number(f)), M(f), _.current = !0, C.current && clearTimeout(C.current);
      const a = d?.debounceTime ?? 200;
      C.current = setTimeout(() => {
        if (_.current = !1, s(f, t, { updateType: "update" }), !I.getState().getShadowMetadata(e, [])?.features?.validationEnabled) return;
        const g = G(e)?.validation, v = g?.zodSchemaV4 || g?.zodSchemaV3;
        if (v) {
          const y = F(e, []), m = v.safeParse(y), h = D(e, t) || {};
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
            const T = ("issues" in m.error ? m.error.issues : m.error.errors).filter(
              (A) => JSON.stringify(A.path) === JSON.stringify(t)
            );
            T.length > 0 ? x(e, t, {
              ...h,
              validation: {
                status: "INVALID",
                errors: [
                  {
                    source: "client",
                    message: T[0]?.message,
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
  ), j = ae(async () => {
    if (console.log("handleBlur triggered"), C.current && (clearTimeout(C.current), C.current = null, _.current = !1, s(l, t, { updateType: "update" })), !D(e, [])?.features?.validationEnabled) return;
    const { getInitialOptions: R } = I.getState(), a = R(e)?.validation, o = a?.zodSchemaV4 || a?.zodSchemaV3;
    if (!o) return;
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
    const v = F(e, []), y = o.safeParse(v);
    if (console.log("result ", y), y.success)
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
      const m = "issues" in y.error ? y.error.issues : y.error.errors;
      console.log("All validation errors:", m), console.log("Current blur path:", t);
      const h = m.filter((p) => {
        if (console.log("Processing error:", p), t.some((A) => A.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const A = t[0].startsWith("id:") ? [] : t.slice(0, -1);
          console.log("Parent path:", A);
          const E = I.getState().getShadowMetadata(e, A);
          if (console.log("Array metadata:", E), E?.arrayKeys) {
            const b = [e, ...t.slice(0, -1)].join("."), N = E.arrayKeys.indexOf(b);
            console.log("Item key:", b, "Index:", N);
            const V = [...A, N, ...t.slice(-1)], O = JSON.stringify(p.path) === JSON.stringify(V);
            return console.log("Zod path comparison:", {
              zodPath: V,
              errorPath: p.path,
              match: O
            }), O;
          }
        }
        const T = JSON.stringify(p.path) === JSON.stringify(t);
        return console.log("Direct path comparison:", {
          errorPath: p.path,
          currentPath: t,
          match: T
        }), T;
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
          U(a.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: j,
        ref: Ie.getState().getFormRef(e + "." + t.join("."))
      } : f[R];
    }
  });
  return /* @__PURE__ */ ne(_e, { formOpts: d, path: t, stateKey: e, children: n(Y) });
}
function Ue(e, t, c) {
  const n = `${e}////${t}`;
  ie(() => (ze(e, n, {
    forceUpdate: () => c({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    Ge(e, n);
  }), [e, n]);
}
export {
  Ae as $cogsSignal,
  Pt as addStateOptions,
  tt as createCogsState,
  Ct as createCogsStateFromSync,
  ft as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
