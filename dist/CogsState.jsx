"use client";
import { jsx as ne, Fragment as $e } from "react/jsx-runtime";
import { memo as Ue, useState as J, useRef as W, useCallback as ae, useEffect as q, useLayoutEffect as ie, useMemo as we, createElement as be, startTransition as Fe } from "react";
import { transformStateFunc as Le, isFunction as X, isDeepEqual as oe, getDifferences as _e, isArray as xe } from "./utility.js";
import { ValidationWrapper as ke } from "./Functions.jsx";
import Re from "superjson";
import { v4 as ee } from "uuid";
import { getGlobalStore as I, formRefStore as Ie, buildShadowNode as He, METADATA_KEYS as We } from "./store.js";
import { useCogsConfig as Pe } from "./CogsStateClient.jsx";
import { useInView as Be } from "react-intersection-observer";
const {
  getInitialOptions: G,
  updateInitialStateGlobal: Ce,
  // ALIAS THE NEW FUNCTIONS TO THE OLD NAMES
  getShadowMetadata: D,
  setShadowMetadata: x,
  getShadowValue: L,
  initializeShadowState: ce,
  updateShadowAtPath: qe,
  insertShadowArrayElement: De,
  removeShadowArrayElement: ze,
  getSelectedIndex: Ct,
  setInitialStateOptions: de,
  setServerStateUpdate: Ge,
  markAsDirty: fe,
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
function K(e, t, c) {
  const o = D(e, t);
  if (console.log("shadowNode", o, c), o && "value" in o)
    return { isArray: !1, value: o.value, keys: [] };
  const S = t.join("."), s = c?.arrayViews?.[S] ?? o?.arrayKeys, u = I.getState().getShadowValue(e, t, s);
  return Array.isArray(u) ? { isArray: !0, value: u, keys: s ?? [] } : { isArray: !1, value: u, keys: [] };
}
function ve(e, t, c) {
  for (let o = 0; o < e.length; o++)
    if (c(e[o], o)) {
      const S = t[o];
      if (S)
        return { key: S, index: o, value: e[o] };
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
  const o = G(e) || {}, s = { ...c[e] || {}, ...o };
  let u = !1;
  if (t)
    for (const i in t)
      s.hasOwnProperty(i) ? (i == "localStorage" && t[i] && s[i].key !== t[i]?.key && (u = !0, s[i] = t[i]), i == "defaultState" && t[i] && s[i] !== t[i] && !oe(s[i], t[i]) && (u = !0, s[i] = t[i])) : (u = !0, s[i] = t[i]);
  s.syncOptions && (!t || !t.hasOwnProperty("syncOptions")) && (u = !0), u && de(e, s);
}
function Dt(e, { formElements: t, validation: c }) {
  return { initialState: e, formElements: t, validation: c };
}
const nt = (e, t) => {
  let c = e;
  const [o, S] = Le(c);
  t?.__fromSyncSchema && t?.__syncNotifications && I.getState().setInitialStateOptions("__notifications", t.__syncNotifications), t?.__fromSyncSchema && t?.__apiParamsMap && I.getState().setInitialStateOptions("__apiParamsMap", t.__apiParamsMap), Object.keys(o).forEach((i) => {
    let m = S[i] || {};
    const r = {
      ...m
    };
    if (t?.formElements && (r.formElements = {
      ...t.formElements,
      ...m.formElements || {}
    }), t?.validation && (r.validation = {
      ...t.validation,
      ...m.validation || {}
    }, t.validation.key && !m.validation?.key && (r.validation.key = `${t.validation.key}.${i}`)), t?.__syncSchemas?.[i]?.schemas?.validation && (r.validation = {
      zodSchemaV4: t.__syncSchemas[i].schemas.validation,
      ...m.validation
    }), Object.keys(r).length > 0) {
      const l = G(i);
      l ? de(i, {
        ...l,
        ...r
      }) : de(i, r);
    }
  }), Object.keys(o).forEach((i) => {
    ce(i, o[i]);
  }), console.log("new stateObject ", I.getState().shadowStateStore);
  const s = (i, m) => {
    const [r] = J(m?.componentId ?? ee());
    Ee({
      stateKey: i,
      options: m,
      initialOptionsPart: S
    });
    const l = L(i, []) || o[i], b = m?.modifyState ? m.modifyState(l) : l;
    return St(b, {
      stateKey: i,
      syncUpdate: m?.syncUpdate,
      componentId: r,
      localStorage: m?.localStorage,
      middleware: m?.middleware,
      reactiveType: m?.reactiveType,
      reactiveDeps: m?.reactiveDeps,
      defaultState: m?.defaultState,
      dependencies: m?.dependencies,
      serverState: m?.serverState,
      syncOptions: m?.syncOptions,
      __useSync: t?.__useSync
    });
  };
  function u(i, m) {
    Ee({ stateKey: i, options: m, initialOptionsPart: S }), m.localStorage && at(i, m), Me(i);
  }
  return { useCogsState: s, setCogsOptions: u };
};
function Ot(e, t) {
  const c = e.schemas, o = {}, S = {};
  for (const s in c) {
    const u = c[s];
    o[s] = u?.schemas?.defaultValues || {}, u?.api?.queryData?._paramType && (S[s] = u.api.queryData._paramType);
  }
  return nt(o, {
    __fromSyncSchema: !0,
    __syncNotifications: e.notifications,
    __apiParamsMap: S,
    __useSync: t,
    __syncSchemas: c
  });
}
const ot = (e, t, c, o, S) => {
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
      i = me(u)?.lastSyncedWithServer;
    } catch {
    }
    const m = D(t, []), r = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: i,
      stateSource: m?.stateSource,
      baseServerState: m?.baseServerState
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
}, at = (e, t) => {
  const c = L(e, []), { sessionId: o } = Pe(), S = X(t?.localStorage?.key) ? t.localStorage.key(c) : t?.localStorage?.key;
  if (S && o) {
    const s = me(
      `${o}-${e}-${S}`
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
function ge(e, t, c, o) {
  const S = D(e, t);
  if (x(e, t, {
    ...S,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: o || Date.now()
  }), Array.isArray(c)) {
    const s = D(e, t);
    s?.arrayKeys && s.arrayKeys.forEach((u, i) => {
      const m = [...t, u], r = c[i];
      r !== void 0 && ge(
        e,
        m,
        r,
        o
      );
    });
  } else c && typeof c == "object" && c.constructor === Object && Object.keys(c).forEach((s) => {
    const u = [...t, s], i = c[s];
    ge(e, u, i, o);
  });
}
let Se = [], Te = !1;
function st() {
  Te || (Te = !0, queueMicrotask(ft));
}
function it(e, t, c) {
  const o = D(e, t) || {}, S = I.getState().getShadowValue(e, t), s = X(c) ? c(S) : c, u = He(s);
  if (Object.prototype.hasOwnProperty.call(u, "value"))
    for (const m in o)
      We.has(m) && (u[m] = o[m]);
  qe(e, t, s), fe(e, t, { bubble: !0 });
  const i = D(e, t);
  return {
    type: "update",
    oldValue: S,
    newValue: s,
    shadowMeta: i
  };
}
function ct(e, t) {
  e?.signals?.length && e.signals.forEach(({ parentId: c, position: o, effect: S }) => {
    const s = document.querySelector(`[data-parent-id="${c}"]`);
    if (!s) return;
    const u = Array.from(s.childNodes);
    if (!u[o]) return;
    let i = t;
    if (S && t !== null)
      try {
        i = new Function("state", `return (${S})(state)`)(
          t
        );
      } catch (m) {
        console.error("Error evaluating effect function:", m);
      }
    i !== null && typeof i == "object" && (i = JSON.stringify(i)), u[o].textContent = String(i ?? "");
  });
}
function lt(e, t, c) {
  const o = D(e, []);
  if (!o?.components)
    return /* @__PURE__ */ new Set();
  const S = /* @__PURE__ */ new Set();
  if (c.type === "update") {
    let s = [...t];
    for (; ; ) {
      const u = D(e, s);
      if (u?.pathComponents && u.pathComponents.forEach((i) => {
        const m = o.components?.get(i);
        m && ((Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"]).includes("none") || S.add(m));
      }), s.length === 0) break;
      s.pop();
    }
    c.newValue && typeof c.newValue == "object" && !xe(c.newValue) && _e(c.newValue, c.oldValue).forEach((i) => {
      const m = i.split("."), r = [...t, ...m], l = D(e, r);
      l?.pathComponents && l.pathComponents.forEach((b) => {
        const V = o.components?.get(b);
        V && ((Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"]).includes("none") || S.add(V));
      });
    });
  } else if (c.type === "insert" || c.type === "cut") {
    const s = c.type === "insert" ? t : t.slice(0, -1), u = D(e, s);
    u?.pathComponents && u.pathComponents.forEach((i) => {
      const m = o.components?.get(i);
      m && S.add(m);
    });
  }
  return o.components.forEach((s, u) => {
    if (S.has(s))
      return;
    const i = Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"];
    if (i.includes("all"))
      S.add(s);
    else if (i.includes("deps") && s.depsFunction) {
      const m = L(e, []), r = s.depsFunction(m);
      (r === !0 || Array.isArray(r) && !oe(s.prevDeps, r)) && (s.prevDeps = r, S.add(s));
    }
  }), S;
}
function ut(e, t, c) {
  let o;
  if (X(c)) {
    const { value: s } = Z(e, t);
    o = c({ state: s, uuid: ee() });
  } else
    o = c;
  De(e, t, o), fe(e, t, { bubble: !0 });
  const S = D(e, t);
  if (S?.arrayKeys) {
    const s = S.arrayKeys[S.arrayKeys.length - 1];
    if (s) {
      const u = s.split(".").slice(1);
      fe(e, u, { bubble: !1 });
    }
  }
  return { type: "insert", newValue: o, shadowMeta: S };
}
function dt(e, t) {
  const c = t.slice(0, -1), o = L(e, t);
  return ze(e, t), fe(e, c, { bubble: !0 }), { type: "cut", oldValue: o, parentPath: c };
}
function ft() {
  const e = /* @__PURE__ */ new Set(), t = [], c = [];
  for (const o of Se) {
    if (o.status && o.updateType) {
      c.push(o);
      continue;
    }
    const S = o, s = S.type === "cut" ? null : S.newValue;
    S.shadowMeta?.signals?.length > 0 && t.push({ shadowMeta: S.shadowMeta, displayValue: s }), lt(
      S.stateKey,
      S.path,
      S
    ).forEach((i) => {
      e.add(i);
    });
  }
  c.length > 0 && Xe(c), t.forEach(({ shadowMeta: o, displayValue: S }) => {
    ct(o, S);
  }), e.forEach((o) => {
    o.forceUpdate();
  }), Se = [], Te = !1;
}
function gt(e, t, c, o) {
  return (s, u, i, m) => {
    S(e, u, s, i);
  };
  function S(s, u, i, m) {
    let r;
    switch (m.updateType) {
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
    r.stateKey = s, r.path = u, Se.push(r), st();
    const l = {
      timeStamp: Date.now(),
      stateKey: s,
      path: u,
      updateType: m.updateType,
      status: "new",
      oldValue: r.oldValue,
      newValue: r.newValue ?? null
    };
    Se.push(l), r.newValue !== void 0 && ot(
      r.newValue,
      s,
      o.current,
      c
    ), o.current?.middleware && o.current.middleware({ update: l }), m.sync !== !1 && t.current?.connected && t.current.updateState({ operation: l });
  }
}
function St(e, {
  stateKey: t,
  localStorage: c,
  formElements: o,
  reactiveDeps: S,
  reactiveType: s,
  componentId: u,
  defaultState: i,
  syncUpdate: m,
  dependencies: r,
  serverState: l,
  __useSync: b
} = {}) {
  const [V, P] = J({}), { sessionId: O } = Pe();
  let $ = !t;
  const [w] = J(t ?? ee()), Y = W(u ?? ee()), d = W(
    null
  );
  d.current = G(w) ?? null, q(() => {
    if (m && m.stateKey === w && m.path?.[0]) {
      const g = `${m.stateKey}:${m.path.join(".")}`;
      Ke(g, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]);
  const R = ae(
    (g) => {
      const p = g ? { ...G(w), ...g } : G(w), T = p?.defaultState || i || e;
      if (p?.serverState?.status === "success" && p?.serverState?.data !== void 0)
        return {
          value: p.serverState.data,
          source: "server",
          timestamp: p.serverState.timestamp || Date.now()
        };
      if (p?.localStorage?.key && O) {
        const M = X(p.localStorage.key) ? p.localStorage.key(T) : p.localStorage.key, A = me(
          `${O}-${w}-${M}`
        );
        if (A && A.lastUpdated > (p?.serverState?.timestamp || 0))
          return {
            value: A.state,
            source: "localStorage",
            timestamp: A.lastUpdated
          };
      }
      return {
        value: T || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, i, e, O]
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
      ), pe(w, { serverState: p });
      const T = typeof p.merge == "object" ? p.merge : p.merge === !0 ? { strategy: "append" } : null, E = L(w, []), M = p.data;
      if (T && T.strategy === "append" && "key" in T && // Type guard for key
      Array.isArray(E) && Array.isArray(M)) {
        const A = T.key;
        if (!A) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        console.log("SERVER_STATE_UPDATE 2");
        const j = new Set(
          E.map((B) => B[A])
        ), C = M.filter(
          (B) => !j.has(B[A])
        );
        C.length > 0 && C.forEach((B) => {
          De(w, [], B);
        });
        const U = L(w, []);
        ge(
          w,
          [],
          U,
          p.timestamp
        );
      } else
        ce(w, M), ge(
          w,
          [],
          M,
          p.timestamp
        );
    }
  }), [w, R]), q(() => {
    const g = I.getState().getShadowMetadata(w, []);
    if (g && g.stateSource)
      return;
    const h = G(w), p = {
      syncEnabled: !!y && !!v,
      validationEnabled: !!(h?.validation?.zodSchemaV4 || h?.validation?.zodSchemaV3),
      localStorageEnabled: !!h?.localStorage?.key
    };
    if (x(w, [], {
      ...g,
      features: p
    }), h?.defaultState !== void 0 || i !== void 0) {
      const T = h?.defaultState || i;
      h?.defaultState || pe(w, {
        defaultState: T
      });
      const { value: E, source: M, timestamp: A } = R();
      ce(w, E), x(w, [], {
        stateSource: M,
        lastServerSync: M === "server" ? A : void 0,
        isDirty: !1,
        baseServerState: M === "server" ? E : void 0
      }), Me(w);
    }
  }, [w, ...r || []]), ie(() => {
    $ && pe(w, {
      formElements: o,
      defaultState: i,
      localStorage: c,
      middleware: d.current?.middleware
    });
    const g = `${w}////${Y.current}`, h = D(w, []), p = h?.components || /* @__PURE__ */ new Map();
    return p.set(g, {
      forceUpdate: () => P({}),
      reactiveType: s ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: S || void 0,
      deps: S ? S(L(w, [])) : [],
      prevDeps: S ? S(L(w, [])) : []
    }), x(w, [], {
      ...h,
      components: p
    }), P({}), () => {
      const T = D(w, []), E = T?.components?.get(g);
      E?.paths && E.paths.forEach((M) => {
        const j = M.split(".").slice(1), C = I.getState().getShadowMetadata(w, j);
        C?.pathComponents && C.pathComponents.size === 0 && (delete C.pathComponents, I.getState().setShadowMetadata(w, j, C));
      }), T?.components && x(w, [], T);
    };
  }, []);
  const a = W(null), n = gt(
    w,
    a,
    O,
    d
  );
  I.getState().initialStateGlobal[w] || Ce(w, e);
  const f = we(() => Ne(
    w,
    n,
    Y.current,
    O
  ), [w, O]), y = b, v = d.current?.syncOptions;
  return y && (a.current = y(
    f,
    v ?? {}
  )), f;
}
function mt(e) {
  return !e || e.length === 0 ? "" : e.map(
    (t) => `${t.type}${JSON.stringify(t.dependencies || [])}`
  ).join("");
}
const Ae = (e, t, c) => {
  const o = `${e}////${t}`, s = D(e, [])?.components?.get(o);
  !s || s.reactiveType === "none" || !(Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType]).includes("component") || Ye(e, c, o);
}, ue = (e, t, c) => {
  const o = I.getState(), S = o.getShadowMetadata(e, []), s = /* @__PURE__ */ new Set();
  S?.components && S.components.forEach((i, m) => {
    (Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"]).includes("all") && (i.forceUpdate(), s.add(m));
  }), o.getShadowMetadata(e, [...t, "getSelected"])?.pathComponents?.forEach((i) => {
    S?.components?.get(i)?.forceUpdate();
  });
  const u = o.getShadowMetadata(e, t);
  for (let i of u?.arrayKeys || []) {
    const m = i + ".selected", r = o.getShadowMetadata(
      e,
      m.split(".").slice(1)
    );
    i == c && r?.pathComponents?.forEach((l) => {
      S?.components?.get(l)?.forceUpdate();
    });
  }
};
function Z(e, t, c) {
  const o = D(e, t), S = t.join("."), s = c?.arrayViews?.[S], u = L(e, t, s);
  return {
    shadowMeta: o,
    value: u,
    arrayKeys: o?.arrayKeys
    // Get arrayKeys from the metadata
  };
}
function Ne(e, t, c, o) {
  const S = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set([
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
    componentId: b
  }) {
    const V = l ? JSON.stringify(l.arrayViews || l.transforms) : "", P = r.join(".") + ":" + V;
    if (S.has(P))
      return S.get(P);
    const O = [e, ...r].join("."), $ = {
      get(Y, d) {
        if (r.length === 0 && d in i)
          return i[d];
        if (!s.has(d)) {
          const a = [...r, d];
          return u({
            path: a,
            componentId: b,
            meta: l
          });
        }
        if (d === "_rebuildStateShape")
          return u;
        if (d === "getDifferences")
          return () => {
            const { value: a, shadowMeta: n } = Z(
              e,
              r,
              l
            ), f = n?.baseServerState ?? I.getState().initialStateGlobal[e];
            return _e(a, f);
          };
        if (d === "sync" && r.length === 0)
          return async function() {
            const a = I.getState().getInitialOptions(e), n = a?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const f = I.getState().getShadowValue(e, []), y = a?.validation?.key;
            try {
              const v = await n.action(f);
              if (v && !v.success && v.errors, v?.success) {
                const g = I.getState().getShadowMetadata(e, []);
                x(e, [], {
                  ...g,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: f
                  // Update base server state
                }), n.onSuccess && n.onSuccess(v.data);
              } else !v?.success && n.onError && n.onError(v.error);
              return v;
            } catch (v) {
              return n.onError && n.onError(v), { success: !1, error: v };
            }
          };
        if (d === "_status" || d === "getStatus") {
          const a = () => {
            const { shadowMeta: n, value: f } = Z(e, r, l);
            return n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || f !== void 0 && !n ? "fresh" : "unknown";
          };
          return d === "_status" ? a() : a;
        }
        if (d === "removeStorage")
          return () => {
            const a = I.getState().initialStateGlobal[e], n = G(e), f = X(n?.localStorage?.key) ? n.localStorage.key(a) : n?.localStorage?.key, y = `${o}-${e}-${f}`;
            y && localStorage.removeItem(y);
          };
        if (d === "showValidationErrors")
          return () => {
            const { shadowMeta: a } = Z(e, r, l);
            return a?.validation?.status === "INVALID" && a.validation.errors.length > 0 ? a.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (d === "getSelected")
          return () => {
            const a = [e, ...r].join(".");
            Ae(e, b, [
              ...r,
              "getSelected"
            ]);
            const n = I.getState().selectedIndicesMap.get(a);
            if (!n)
              return;
            const f = r.join("."), y = l?.arrayViews?.[f], v = n.split(".").pop();
            if (!(y && !y.includes(v) || L(
              e,
              n.split(".").slice(1)
            ) === void 0))
              return u({
                path: n.split(".").slice(1),
                componentId: b,
                meta: l
              });
          };
        if (d === "getSelectedIndex")
          return () => {
            const a = e + "." + r.join(".");
            r.join(".");
            const n = I.getState().selectedIndicesMap.get(a);
            if (!n)
              return -1;
            const { keys: f } = K(e, r, l);
            if (!f)
              return -1;
            const y = n.split(".").pop();
            return f.indexOf(y);
          };
        if (d === "clearSelected")
          return ue(e, r), () => {
            et({
              arrayKey: e + "." + r.join(".")
            });
          };
        if (d === "useVirtualView")
          return (a) => {
            const {
              itemHeight: n = 50,
              overscan: f = 6,
              stickToBottom: y = !1,
              scrollStickTolerance: v = 75
            } = a, g = W(null), [h, p] = J({
              startIndex: 0,
              endIndex: 10
            }), [T, E] = J({}), M = W(!0), A = W({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), j = W(
              /* @__PURE__ */ new Map()
            );
            ie(() => {
              if (!y || !g.current || A.current.isUserScrolling)
                return;
              const _ = g.current;
              _.scrollTo({
                top: _.scrollHeight,
                behavior: M.current ? "instant" : "smooth"
              });
            }, [T, y]);
            const { arrayKeys: C = [] } = Z(e, r, l), { totalHeight: U, itemOffsets: B } = we(() => {
              let _ = 0;
              const k = /* @__PURE__ */ new Map();
              return (I.getState().getShadowMetadata(e, r)?.arrayKeys || []).forEach((F) => {
                const N = F.split(".").slice(1), z = I.getState().getShadowMetadata(e, N)?.virtualizer?.itemHeight || n;
                k.set(F, {
                  height: z,
                  offset: _
                }), _ += z;
              }), j.current = k, { totalHeight: _, itemOffsets: k };
            }, [C.length, n]);
            ie(() => {
              if (y && C.length > 0 && g.current && !A.current.isUserScrolling && M.current) {
                const _ = g.current, k = () => {
                  if (_.clientHeight > 0) {
                    const H = Math.ceil(
                      _.clientHeight / n
                    ), F = C.length - 1, N = Math.max(
                      0,
                      F - H - f
                    );
                    p({ startIndex: N, endIndex: F }), requestAnimationFrame(() => {
                      te("instant"), M.current = !1;
                    });
                  } else
                    requestAnimationFrame(k);
                };
                k();
              }
            }, [C.length, y, n, f]);
            const le = ae(() => {
              const _ = g.current;
              if (!_) return;
              const k = _.scrollTop, { scrollHeight: H, clientHeight: F } = _, N = A.current, z = H - (k + F), se = N.isNearBottom;
              N.isNearBottom = z <= v, k < N.lastScrollTop ? (N.scrollUpCount++, N.scrollUpCount > 3 && se && (N.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : N.isNearBottom && (N.isUserScrolling = !1, N.scrollUpCount = 0), N.lastScrollTop = k;
              let re = 0;
              for (let Q = 0; Q < C.length; Q++) {
                const he = C[Q], ye = j.current.get(he);
                if (ye && ye.offset + ye.height > k) {
                  re = Q;
                  break;
                }
              }
              if (re !== h.startIndex) {
                const Q = Math.ceil(F / n);
                p({
                  startIndex: Math.max(0, re - f),
                  endIndex: Math.min(
                    C.length - 1,
                    re + Q + f
                  )
                });
              }
            }, [
              C.length,
              h.startIndex,
              n,
              f,
              v
            ]);
            q(() => {
              const _ = g.current;
              if (!(!_ || !y))
                return _.addEventListener("scroll", le, {
                  passive: !0
                }), () => {
                  _.removeEventListener("scroll", le);
                };
            }, [le, y]);
            const te = ae(
              (_ = "smooth") => {
                const k = g.current;
                if (!k) return;
                A.current.isUserScrolling = !1, A.current.isNearBottom = !0, A.current.scrollUpCount = 0;
                const H = () => {
                  const F = (N = 0) => {
                    if (N > 5) return;
                    const z = k.scrollHeight, se = k.scrollTop, re = k.clientHeight;
                    se + re >= z - 1 || (k.scrollTo({
                      top: z,
                      behavior: _
                    }), setTimeout(() => {
                      const Q = k.scrollHeight, he = k.scrollTop;
                      (Q !== z || he + re < Q - 1) && F(N + 1);
                    }, 50));
                  };
                  F();
                };
                "requestIdleCallback" in window ? requestIdleCallback(H, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(H);
                });
              },
              []
            );
            return q(() => {
              if (!y || !g.current) return;
              const _ = g.current, k = A.current;
              let H;
              const F = () => {
                clearTimeout(H), H = setTimeout(() => {
                  !k.isUserScrolling && k.isNearBottom && te(
                    M.current ? "instant" : "smooth"
                  );
                }, 100);
              }, N = new MutationObserver(() => {
                k.isUserScrolling || F();
              });
              N.observe(_, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
                // More specific than just 'height'
              });
              const z = (se) => {
                se.target instanceof HTMLImageElement && !k.isUserScrolling && F();
              };
              return _.addEventListener("load", z, !0), M.current ? setTimeout(() => {
                te("instant");
              }, 0) : F(), () => {
                clearTimeout(H), N.disconnect(), _.removeEventListener("load", z, !0);
              };
            }, [y, C.length, te]), {
              virtualState: we(() => {
                const _ = I.getState(), k = _.getShadowValue(e, r), H = _.getShadowMetadata(e, r)?.arrayKeys || [];
                k.slice(
                  h.startIndex,
                  h.endIndex + 1
                );
                const F = H.slice(
                  h.startIndex,
                  h.endIndex + 1
                ), N = r.length > 0 ? r.join(".") : "root";
                return u({
                  path: r,
                  componentId: b,
                  meta: { ...l, arrayViews: { [N]: F } }
                });
              }, [h.startIndex, h.endIndex, C.length]),
              virtualizerProps: {
                outer: {
                  ref: g,
                  style: {
                    overflowY: "auto",
                    height: "100%",
                    position: "relative"
                  }
                },
                inner: {
                  style: {
                    height: `${U}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${j.current.get(C[h.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: te,
              scrollToIndex: (_, k = "smooth") => {
                if (g.current && C[_]) {
                  const H = j.current.get(C[_])?.offset || 0;
                  g.current.scrollTo({ top: H, behavior: k });
                }
              }
            };
          };
        if (d === "stateMap")
          return (a) => {
            const { value: n, keys: f } = K(
              e,
              r,
              l
            );
            if (!f || !Array.isArray(n))
              return [];
            const y = u({
              path: r,
              componentId: b,
              meta: l
            });
            return n.map((v, g) => {
              const h = f[g];
              if (!h) return;
              const p = [...r, h], T = u({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: b,
                meta: l
              });
              return a(T, g, y);
            });
          };
        if (d === "stateFilter")
          return (a) => {
            const n = r.length > 0 ? r.join(".") : "root", f = l?.arrayViews?.[n] ?? Object.keys(D(e, r) || {}).filter(
              (h) => h.startsWith("id:")
            ), y = L(e, r, f);
            if (!Array.isArray(y))
              throw new Error("stateFilter can only be used on arrays");
            const v = [];
            y.forEach((h, p) => {
              if (a(h, p)) {
                const T = f[p];
                T && v.push(T);
              }
            });
            const g = r.length > 0 ? r.join(".") : "root";
            return u({
              path: r,
              componentId: b,
              meta: {
                ...l,
                // Create a new arrayViews object, preserving other views and setting the new one for this path
                arrayViews: {
                  ...l?.arrayViews || {},
                  [g]: v
                },
                transforms: [
                  ...l?.transforms || [],
                  { type: "filter", fn: a, path: r }
                ]
              }
            });
          };
        if (d === "stateSort")
          return (a) => {
            r.join(".");
            const { value: n, keys: f } = K(
              e,
              r,
              l
            );
            if (!Array.isArray(n) || !f)
              throw new Error("No array keys found for sorting");
            const y = n.map((g, h) => ({
              item: g,
              key: f[h]
            }));
            y.sort((g, h) => a(g.item, h.item));
            const v = y.map((g) => g.key);
            return u({
              path: r,
              componentId: b,
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
        if (d === "stream")
          return function(a = {}) {
            const {
              bufferSize: n = 100,
              flushInterval: f = 100,
              bufferStrategy: y = "accumulate",
              store: v,
              onFlush: g
            } = a;
            let h = [], p = !1, T = null;
            const E = (U) => {
              if (!p) {
                if (y === "sliding" && h.length >= n)
                  h.shift();
                else if (y === "dropping" && h.length >= n)
                  return;
                h.push(U), h.length >= n && M();
              }
            }, M = () => {
              if (h.length === 0) return;
              const U = [...h];
              if (h = [], v) {
                const B = v(U);
                B !== void 0 && (Array.isArray(B) ? B : [B]).forEach((te) => {
                  t(te, r, {
                    updateType: "insert"
                  });
                });
              } else
                U.forEach((B) => {
                  t(B, r, {
                    updateType: "insert"
                  });
                });
              g?.(U);
            };
            f > 0 && (T = setInterval(M, f));
            const A = ee(), j = D(e, r) || {}, C = j.streams || /* @__PURE__ */ new Map();
            return C.set(A, { buffer: h, flushTimer: T }), x(e, r, {
              ...j,
              streams: C
            }), {
              write: (U) => E(U),
              writeMany: (U) => U.forEach(E),
              flush: () => M(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, h.length > 0 && M();
              },
              close: () => {
                M(), T && clearInterval(T);
                const U = I.getState().getShadowMetadata(e, r);
                U?.streams && U.streams.delete(A);
              }
            };
          };
        if (d === "stateList")
          return (a) => /* @__PURE__ */ ne(() => {
            const f = W(/* @__PURE__ */ new Map());
            l?.transforms && l.transforms.length > 0 ? `${b}${mt(l.transforms)}` : `${b}`;
            const [y, v] = J({}), { keys: g, value: h } = K(
              e,
              r,
              l
            );
            if (q(() => {
              const T = I.getState().subscribeToPath(O, (E) => {
                if (console.log("changed array statelist  ", E), E.type === "GET_SELECTED")
                  return;
                const A = I.getState().getShadowMetadata(e, r)?.transformCaches;
                if (A)
                  for (const j of A.keys())
                    j.startsWith(b) && A.delete(j);
                (E.type === "INSERT" || E.type === "REMOVE" || E.type === "CLEAR_SELECTION") && v({});
              });
              return () => {
                T();
              };
            }, [b, O]), !Array.isArray(h))
              return null;
            const p = u({
              path: r,
              componentId: b,
              meta: l
            });
            return console.log("arrayValues", h), /* @__PURE__ */ ne($e, { children: h.map((T, E) => {
              const M = g[E];
              if (!M)
                return null;
              let A = f.current.get(M);
              A || (A = ee(), f.current.set(M, A));
              const j = [...r, M];
              return be(yt, {
                key: M,
                stateKey: e,
                itemComponentId: A,
                itemPath: j,
                localIndex: E,
                arraySetter: p,
                rebuildStateShape: u,
                renderFn: a
              });
            }) });
          }, {});
        if (d === "stateFlattenOn")
          return (a) => {
            const n = r.join("."), f = l?.arrayViews?.[n], y = I.getState().getShadowValue(e, r, f);
            return Array.isArray(y) ? u({
              path: [...r, "[*]", a],
              componentId: b,
              meta: l
            }) : [];
          };
        if (d === "index")
          return (a) => {
            const n = r.join("."), f = l?.arrayViews?.[n];
            if (f) {
              const h = f[a];
              return h ? u({
                path: [...r, h],
                componentId: b,
                meta: l
              }) : void 0;
            }
            const y = D(e, r);
            if (!y) return;
            const g = Object.keys(y).filter((h) => h.startsWith("id:"))[a];
            if (g)
              return u({
                path: [...r, g],
                componentId: b,
                meta: l
              });
          };
        if (d === "last")
          return () => {
            const { value: a } = Z(e, r, l);
            if (a.length === 0) return;
            const n = a.length - 1;
            a[n];
            const f = [...r, n.toString()];
            return u({
              path: f,
              componentId: b,
              meta: l
            });
          };
        if (d === "insert")
          return (a, n) => {
            t(a, r, { updateType: "insert" });
          };
        if (d === "uniqueInsert")
          return (a, n, f) => {
            const { value: y } = Z(
              e,
              r,
              l
            ), v = X(a) ? a(y) : a;
            let g = null;
            if (!y.some((p) => {
              const T = n ? n.every(
                (E) => oe(p[E], v[E])
              ) : oe(p, v);
              return T && (g = p), T;
            }))
              t(v, r, { updateType: "insert" });
            else if (f && g) {
              const p = f(g), T = y.map(
                (E) => oe(E, g) ? p : E
              );
              t(T, r, {
                updateType: "update"
              });
            }
          };
        if (d === "cut")
          return (a, n) => {
            const f = L(e, r);
            if (!Array.isArray(f) || f.length === 0) return;
            const y = D(e, r);
            if (!y) return;
            const v = Object.keys(y).filter((p) => p.startsWith("id:")), g = a === -1 ? v.length - 1 : a !== void 0 ? a : v.length - 1, h = v[g];
            h && t(null, [...r, h], {
              updateType: "cut"
            });
          };
        if (d === "cutSelected")
          return () => {
            const a = [e, ...r].join(".");
            r.join(".");
            const { keys: n } = K(e, r, l);
            if (!n || n.length === 0)
              return;
            const f = I.getState().selectedIndicesMap.get(a);
            if (!f)
              return;
            const y = f.split(".").pop();
            if (!n.includes(y))
              return;
            const v = f.split(".").slice(1);
            I.getState().clearSelectedIndex({ arrayKey: a });
            const g = v.slice(0, -1);
            ue(e, g), t(null, v, {
              updateType: "cut"
            });
          };
        if (d === "cutByValue")
          return (a) => {
            const {
              isArray: n,
              value: f,
              keys: y
            } = K(e, r, l);
            if (!n) return;
            const v = ve(f, y, (g) => g === a);
            v && t(null, [...r, v.key], {
              updateType: "cut"
            });
          };
        if (d === "toggleByValue")
          return (a) => {
            const {
              isArray: n,
              value: f,
              keys: y
            } = K(e, r, l);
            if (!n) return;
            const v = ve(f, y, (g) => g === a);
            if (v) {
              const g = [...r, v.key];
              t(null, g, {
                updateType: "cut"
              });
            } else
              t(a, r, { updateType: "insert" });
          };
        if (d === "findWith")
          return (a, n) => {
            const { isArray: f, value: y, keys: v } = K(e, r, l);
            if (!f)
              throw new Error("findWith can only be used on arrays");
            const g = ve(
              y,
              v,
              (h) => h?.[a] === n
            );
            return u(g ? {
              path: [...r, g.key],
              // e.g., ['itemInstances', 'inst-1', 'properties', 'prop-b']
              componentId: b,
              meta: l
            } : {
              path: [...r, `not_found_${ee()}`],
              componentId: b,
              meta: l
            });
          };
        if (d === "cutThis") {
          const { value: a } = Z(e, r, l);
          return () => {
            t(a, r, { updateType: "cut" });
          };
        }
        if (d === "get")
          return () => {
            Ae(e, b, r);
            const { value: a } = Z(e, r, l);
            return a;
          };
        if (d === "$derive")
          return (a) => Ve({
            _stateKey: e,
            _path: r,
            _effect: a.toString(),
            _meta: l
          });
        if (d === "$get")
          return () => Ve({ _stateKey: e, _path: r, _meta: l });
        if (d === "lastSynced") {
          const a = `${e}:${r.join(".")}`;
          return tt(a);
        }
        if (d == "getLocalStorage")
          return (a) => me(o + "-" + e + "-" + a);
        if (d === "isSelected") {
          const a = r.slice(0, -1);
          if (D(e, a)?.arrayKeys) {
            const f = e + "." + a.join("."), y = I.getState().selectedIndicesMap.get(f), v = e + "." + r.join(".");
            return ue(e, a, void 0), y === v;
          }
          return;
        }
        if (d === "setSelected")
          return (a) => {
            const n = r.slice(0, -1), f = e + "." + n.join("."), y = e + "." + r.join(".");
            ue(e, n, void 0), I.getState().selectedIndicesMap.get(f), a && I.getState().setSelectedIndex(f, y);
          };
        if (d === "toggleSelected")
          return () => {
            const a = r.slice(0, -1), n = e + "." + a.join("."), f = e + "." + r.join(".");
            I.getState().selectedIndicesMap.get(n) === f ? I.getState().clearSelectedIndex({ arrayKey: n }) : I.getState().setSelectedIndex(n, f);
          };
        if (d === "_componentId")
          return b;
        if (r.length == 0) {
          if (d === "addZodValidation")
            return (a) => {
              a.forEach((n) => {
                const f = I.getState().getShadowMetadata(e, n.path) || {};
                I.getState().setShadowMetadata(e, n.path, {
                  ...f,
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
          if (d === "clearZodValidation")
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
          if (d === "applyJsonPatch")
            return (a) => {
              const n = I.getState(), f = n.getShadowMetadata(e, []);
              if (!f?.components) return;
              const y = (g) => !g || g === "/" ? [] : g.split("/").slice(1).map((h) => h.replace(/~1/g, "/").replace(/~0/g, "~")), v = /* @__PURE__ */ new Set();
              for (const g of a) {
                const h = y(g.path);
                switch (g.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = g;
                    n.updateShadowAtPath(e, h, p), n.markAsDirty(e, h, { bubble: !0 });
                    let T = [...h];
                    for (; ; ) {
                      const E = n.getShadowMetadata(
                        e,
                        T
                      );
                      if (E?.pathComponents && E.pathComponents.forEach((M) => {
                        if (!v.has(M)) {
                          const A = f.components?.get(M);
                          A && (A.forceUpdate(), v.add(M));
                        }
                      }), T.length === 0) break;
                      T.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = h.slice(0, -1);
                    n.removeShadowArrayElement(e, h), n.markAsDirty(e, p, { bubble: !0 });
                    let T = [...p];
                    for (; ; ) {
                      const E = n.getShadowMetadata(
                        e,
                        T
                      );
                      if (E?.pathComponents && E.pathComponents.forEach((M) => {
                        if (!v.has(M)) {
                          const A = f.components?.get(M);
                          A && (A.forceUpdate(), v.add(M));
                        }
                      }), T.length === 0) break;
                      T.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (d === "getComponents")
            return () => D(e, [])?.components;
          if (d === "getAllFormRefs")
            return () => Ie.getState().getFormRefsByStateKey(e);
        }
        if (d === "getFormRef")
          return () => Ie.getState().getFormRef(e + "." + r.join("."));
        if (d === "validationWrapper")
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
        if (d === "_stateKey") return e;
        if (d === "_path") return r;
        if (d === "update")
          return (a) => (t(a, r, { updateType: "update" }), {
            synced: () => {
              const n = I.getState().getShadowMetadata(e, r);
              x(e, r, {
                ...n,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const f = [e, ...r].join(".");
              Oe(f, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (d === "toggle") {
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
        if (d === "formElement")
          return (a, n) => /* @__PURE__ */ ne(
            wt,
            {
              stateKey: e,
              path: r,
              rebuildStateShape: u,
              setState: t,
              formOpts: n,
              renderFn: a
            }
          );
        const R = [...r, d];
        return I.getState().getShadowValue(e, R), u({
          path: R,
          componentId: b,
          meta: l
        });
      }
    }, w = new Proxy({}, $);
    return S.set(P, w), w;
  }
  const i = {
    revertToInitialState: (r) => {
      const l = I.getState().getShadowMetadata(e, []);
      l?.stateSource === "server" && l.baseServerState ? l.baseServerState : I.getState().initialStateGlobal[e];
      const b = I.getState().initialStateGlobal[e];
      Qe(e), ce(e, b), u({
        path: [],
        componentId: c
      });
      const V = G(e), P = X(V?.localStorage?.key) ? V?.localStorage?.key(b) : V?.localStorage?.key, O = `${o}-${e}-${P}`;
      O && localStorage.removeItem(O);
      const $ = I.getState().getShadowMetadata(e, []);
      return $ && $?.components?.forEach((w) => {
        w.forceUpdate();
      }), b;
    },
    updateInitialState: (r) => {
      const l = Ne(
        e,
        t,
        c,
        o
      ), b = I.getState().initialStateGlobal[e], V = G(e), P = X(V?.localStorage?.key) ? V?.localStorage?.key(b) : V?.localStorage?.key, O = `${o}-${e}-${P}`;
      return localStorage.getItem(O) && localStorage.removeItem(O), Fe(() => {
        Ce(e, r), ce(e, r);
        const $ = I.getState().getShadowMetadata(e, []);
        $ && $?.components?.forEach((w) => {
          w.forceUpdate();
        });
      }), {
        fetchId: ($) => l.get()[$]
      };
    }
  };
  return u({
    componentId: c,
    path: []
  });
}
function Ve(e) {
  return be(ht, { proxy: e });
}
function ht({
  proxy: e
}) {
  const t = W(null), c = W(null), o = W(!1), S = `${e._stateKey}-${e._path.join(".")}`, s = e._path.join("."), u = e._meta?.arrayViews?.[s], i = L(e._stateKey, e._path, u);
  return q(() => {
    const m = t.current;
    if (!m || o.current) return;
    const r = setTimeout(() => {
      if (!m.parentElement) {
        console.warn("Parent element not found for signal", S);
        return;
      }
      const l = m.parentElement, V = Array.from(l.childNodes).indexOf(m);
      let P = l.getAttribute("data-parent-id");
      P || (P = `parent-${crypto.randomUUID()}`, l.setAttribute("data-parent-id", P)), c.current = `instance-${crypto.randomUUID()}`;
      const O = I.getState().getShadowMetadata(e._stateKey, e._path) || {}, $ = O.signals || [];
      $.push({
        instanceId: c.current,
        parentId: P,
        position: V,
        effect: e._effect
      }), I.getState().setShadowMetadata(e._stateKey, e._path, {
        ...O,
        signals: $
      });
      let w = i;
      if (e._effect)
        try {
          w = new Function(
            "state",
            `return (${e._effect})(state)`
          )(i);
        } catch (d) {
          console.error("Error evaluating effect function:", d);
        }
      w !== null && typeof w == "object" && (w = JSON.stringify(w));
      const Y = document.createTextNode(String(w ?? ""));
      m.replaceWith(Y), o.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(r), c.current) {
        const l = I.getState().getShadowMetadata(e._stateKey, e._path) || {};
        l.signals && (l.signals = l.signals.filter(
          (b) => b.instanceId !== c.current
        ), I.getState().setShadowMetadata(e._stateKey, e._path, l));
      }
    };
  }, []), be("span", {
    ref: t,
    style: { display: "contents" },
    "data-signal-id": S
  });
}
const yt = Ue(
  pt,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
), vt = (e) => {
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
    let S = 0;
    const s = () => {
      S++, S === o.length && c(!0);
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
function pt({
  stateKey: e,
  itemComponentId: t,
  itemPath: c,
  localIndex: o,
  arraySetter: S,
  rebuildStateShape: s,
  renderFn: u
}) {
  const [, i] = J({}), { ref: m, inView: r } = Be(), l = W(null), b = vt(l), V = W(!1), P = [e, ...c].join(".");
  je(e, t, i);
  const O = ae(
    (d) => {
      l.current = d, m(d);
    },
    [m]
  );
  q(() => {
    rt(P, (d) => {
      i({});
    });
  }, []), q(() => {
    if (!r || !b || V.current)
      return;
    const d = l.current;
    if (d && d.offsetHeight > 0) {
      V.current = !0;
      const R = d.offsetHeight;
      x(e, c, {
        virtualizer: {
          itemHeight: R,
          domRef: d
        }
      });
      const a = c.slice(0, -1), n = [e, ...a].join(".");
      Oe(n, {
        type: "ITEMHEIGHT",
        itemKey: c.join("."),
        ref: l.current
      });
    }
  }, [r, b, e, c]);
  const $ = L(e, c);
  if ($ === void 0)
    return null;
  const w = s({
    currentState: $,
    path: c,
    componentId: t
  }), Y = u(w, o, S);
  return /* @__PURE__ */ ne("div", { ref: O, children: Y });
}
function wt({
  stateKey: e,
  path: t,
  rebuildStateShape: c,
  renderFn: o,
  formOpts: S,
  setState: s
}) {
  const [u] = J(() => ee()), [, i] = J({}), m = [e, ...t].join(".");
  je(e, u, i);
  const r = L(e, t), [l, b] = J(r), V = W(!1), P = W(null);
  q(() => {
    !V.current && !oe(r, l) && b(r);
  }, [r]), q(() => {
    const d = I.getState().subscribeToPath(m, (R) => {
      !V.current && l !== R && i({});
    });
    return () => {
      d(), P.current && (clearTimeout(P.current), V.current = !1);
    };
  }, []);
  const O = ae(
    (d) => {
      typeof r === "number" && typeof d == "string" && (d = d === "" ? 0 : Number(d)), b(d), V.current = !0, P.current && clearTimeout(P.current);
      const a = S?.debounceTime ?? 200;
      P.current = setTimeout(() => {
        if (V.current = !1, s(d, t, { updateType: "update" }), !I.getState().getShadowMetadata(e, [])?.features?.validationEnabled) return;
        const f = G(e)?.validation, y = f?.zodSchemaV4 || f?.zodSchemaV3;
        if (y) {
          const v = L(e, []), g = y.safeParse(v), h = D(e, t) || {};
          if (g.success)
            x(e, t, {
              ...h,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: d
              }
            });
          else {
            const T = ("issues" in g.error ? g.error.issues : g.error.errors).filter(
              (E) => JSON.stringify(E.path) === JSON.stringify(t)
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
                validatedValue: d
              }
            }) : x(e, t, {
              ...h,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: d
              }
            });
          }
        }
      }, a), i({});
    },
    [s, t, S?.debounceTime, e]
  ), $ = ae(async () => {
    if (console.log("handleBlur triggered"), P.current && (clearTimeout(P.current), P.current = null, V.current = !1, s(l, t, { updateType: "update" })), !D(e, [])?.features?.validationEnabled) return;
    const { getInitialOptions: R } = I.getState(), a = R(e)?.validation, n = a?.zodSchemaV4 || a?.zodSchemaV3;
    if (!n) return;
    const f = D(e, t);
    x(e, t, {
      ...f,
      validation: {
        status: "VALIDATING",
        errors: [],
        lastValidated: Date.now(),
        validatedValue: l
      }
    });
    const y = L(e, []), v = n.safeParse(y);
    if (console.log("result ", v), v.success)
      x(e, t, {
        ...f,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: l
        }
      });
    else {
      const g = "issues" in v.error ? v.error.issues : v.error.errors;
      console.log("All validation errors:", g), console.log("Current blur path:", t);
      const h = g.filter((p) => {
        if (console.log("Processing error:", p), t.some((E) => E.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const E = t[0].startsWith("id:") ? [] : t.slice(0, -1);
          console.log("Parent path:", E);
          const M = I.getState().getShadowMetadata(e, E);
          if (console.log("Array metadata:", M), M?.arrayKeys) {
            const A = [e, ...t.slice(0, -1)].join("."), j = M.arrayKeys.indexOf(A);
            console.log("Item key:", A, "Index:", j);
            const C = [...E, j, ...t.slice(-1)], U = JSON.stringify(p.path) === JSON.stringify(C);
            return console.log("Zod path comparison:", {
              zodPath: C,
              errorPath: p.path,
              match: U
            }), U;
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
        ...f,
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
    get(d, R) {
      return R === "inputProps" ? {
        value: l ?? "",
        onChange: (a) => {
          O(a.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: $,
        ref: Ie.getState().getFormRef(e + "." + t.join("."))
      } : d[R];
    }
  });
  return /* @__PURE__ */ ne(ke, { formOpts: S, path: t, stateKey: e, children: o(Y) });
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
  Dt as addStateOptions,
  nt as createCogsState,
  Ot as createCogsStateFromSync,
  St as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
