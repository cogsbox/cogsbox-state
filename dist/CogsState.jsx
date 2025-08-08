"use client";
import { jsx as se, Fragment as Ce } from "react/jsx-runtime";
import { useState as K, useRef as L, useEffect as H, useCallback as pe, useLayoutEffect as ce, useMemo as _e, createElement as Te, startTransition as De } from "react";
import { transformStateFunc as Ue, isFunction as z, isDeepEqual as ne, isArray as Fe, getDifferences as $e } from "./utility.js";
import { ValidationWrapper as Oe, FormElementWrapper as je, MemoizedCogsItemWrapper as Ne } from "./Components.jsx";
import xe from "superjson";
import { v4 as X } from "uuid";
import { getGlobalStore as T, formRefStore as Me } from "./store.js";
import { useCogsConfig as Ve } from "./CogsStateClient.jsx";
const {
  getInitialOptions: W,
  updateInitialStateGlobal: ke,
  // ALIAS THE NEW FUNCTIONS TO THE OLD NAMES
  getShadowMetadata: D,
  setShadowMetadata: J,
  getShadowValue: R,
  initializeShadowState: ae,
  updateShadowAtPath: Re,
  insertShadowArrayElement: Le,
  insertManyShadowArrayElements: qe,
  removeShadowArrayElement: Be,
  getSelectedIndex: Tt,
  setInitialStateOptions: le,
  setServerStateUpdate: We,
  markAsDirty: ue,
  registerComponent: It,
  unregisterComponent: Mt,
  addPathComponent: Ge,
  clearSelectedIndexesForState: He,
  addStateLog: ze,
  setSyncInfo: Je,
  clearSelectedIndex: Ze,
  getSyncInfo: Ye,
  notifyPathSubscribers: Qe,
  subscribeToPath: bt
  // Note: The old functions are no longer imported under their original names
} = T.getState();
function B(e, r, c) {
  const n = D(e, r);
  if (!!!n?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, r), keys: [] };
  const i = r.length > 0 ? r.join(".") : "root", u = c?.arrayViews?.[i] ?? n.arrayKeys;
  return Array.isArray(u) && u.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, r, u), keys: u ?? [] };
}
function he(e, r, c) {
  for (let n = 0; n < e.length; n++)
    if (c(e[n], n)) {
      const f = r[n];
      if (f)
        return { key: f, index: n, value: e[n] };
    }
  return null;
}
function ve(e, r) {
  const c = W(e) || {};
  le(e, {
    ...c,
    ...r
  });
}
function be({
  stateKey: e,
  options: r,
  initialOptionsPart: c
}) {
  const n = W(e) || {}, i = { ...c[e] || {}, ...n };
  let u = !1;
  if (r)
    for (const s in r)
      i.hasOwnProperty(s) ? (s == "localStorage" && r[s] && i[s].key !== r[s]?.key && (u = !0, i[s] = r[s]), s == "defaultState" && r[s] && i[s] !== r[s] && !ne(i[s], r[s]) && (u = !0, i[s] = r[s])) : (u = !0, i[s] = r[s]);
  i.syncOptions && (!r || !r.hasOwnProperty("syncOptions")) && (u = !0), u && le(e, i);
}
function Et(e, { formElements: r, validation: c }) {
  return { initialState: e, formElements: r, validation: c };
}
const Xe = (e, r) => {
  let c = e;
  const [n, f] = Ue(c);
  r?.__fromSyncSchema && r?.__syncNotifications && T.getState().setInitialStateOptions("__notifications", r.__syncNotifications), r?.__fromSyncSchema && r?.__apiParamsMap && T.getState().setInitialStateOptions("__apiParamsMap", r.__apiParamsMap), Object.keys(n).forEach((s) => {
    let S = f[s] || {};
    const t = {
      ...S
    };
    if (r?.formElements && (t.formElements = {
      ...r.formElements,
      ...S.formElements || {}
    }), r?.validation && (t.validation = {
      ...r.validation,
      ...S.validation || {}
    }, r.validation.key && !S.validation?.key && (t.validation.key = `${r.validation.key}.${s}`)), r?.__syncSchemas?.[s]?.schemas?.validation && (t.validation = {
      zodSchemaV4: r.__syncSchemas[s].schemas.validation,
      ...S.validation
    }), Object.keys(t).length > 0) {
      const l = W(s);
      l ? le(s, {
        ...l,
        ...t
      }) : le(s, t);
    }
  }), Object.keys(n).forEach((s) => {
    ae(s, n[s]);
  }), console.log("new stateObject ", T.getState().shadowStateStore);
  const i = (s, S) => {
    const [t] = K(S?.componentId ?? X());
    be({
      stateKey: s,
      options: S,
      initialOptionsPart: f
    });
    const l = R(s, []) || n[s], I = S?.modifyState ? S.modifyState(l) : l;
    return lt(I, {
      stateKey: s,
      syncUpdate: S?.syncUpdate,
      componentId: t,
      localStorage: S?.localStorage,
      middleware: S?.middleware,
      reactiveType: S?.reactiveType,
      reactiveDeps: S?.reactiveDeps,
      defaultState: S?.defaultState,
      dependencies: S?.dependencies,
      serverState: S?.serverState,
      syncOptions: S?.syncOptions,
      __useSync: r?.__useSync
    });
  };
  function u(s, S) {
    be({ stateKey: s, options: S, initialOptionsPart: f }), S.localStorage && et(s, S), Ie(s);
  }
  return { useCogsState: i, setCogsOptions: u };
};
function At(e, r) {
  const c = e.schemas, n = {}, f = {};
  for (const i in c) {
    const u = c[i];
    n[i] = u?.schemas?.defaultValues || {}, u?.api?.queryData?._paramType && (f[i] = u.api.queryData._paramType);
  }
  return Xe(n, {
    __fromSyncSchema: !0,
    __syncNotifications: e.notifications,
    __apiParamsMap: f,
    __useSync: r,
    __syncSchemas: c
  });
}
const Ke = (e, r, c, n, f) => {
  c?.log && console.log(
    "saving to localstorage",
    r,
    c.localStorage?.key,
    n
  );
  const i = z(c?.localStorage?.key) ? c.localStorage?.key(e) : c?.localStorage?.key;
  if (i && n) {
    const u = `${n}-${r}-${i}`;
    let s;
    try {
      s = Se(u)?.lastSyncedWithServer;
    } catch {
    }
    const S = D(r, []), t = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: s,
      stateSource: S?.stateSource,
      baseServerState: S?.baseServerState
    }, l = xe.serialize(t);
    window.localStorage.setItem(
      u,
      JSON.stringify(l.json)
    );
  }
}, Se = (e) => {
  if (!e) return null;
  try {
    const r = window.localStorage.getItem(e);
    return r ? JSON.parse(r) : null;
  } catch (r) {
    return console.error("Error loading from localStorage:", r), null;
  }
}, et = (e, r) => {
  const c = R(e, []), { sessionId: n } = Ve(), f = z(r?.localStorage?.key) ? r.localStorage.key(c) : r?.localStorage?.key;
  if (f && n) {
    const i = Se(
      `${n}-${e}-${f}`
    );
    if (i && i.lastUpdated > (i.lastSyncedWithServer || 0))
      return Ie(e), !0;
  }
  return !1;
}, Ie = (e) => {
  const r = D(e, []);
  if (!r) return;
  const c = /* @__PURE__ */ new Set();
  r?.components?.forEach((n) => {
    (n ? Array.isArray(n.reactiveType) ? n.reactiveType : [n.reactiveType || "component"] : null)?.includes("none") || c.add(() => n.forceUpdate());
  }), queueMicrotask(() => {
    c.forEach((n) => n());
  });
};
function de(e, r, c, n) {
  const f = D(e, r);
  if (J(e, r, {
    ...f,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: n || Date.now()
  }), Array.isArray(c)) {
    const i = D(e, r);
    i?.arrayKeys && i.arrayKeys.forEach((u, s) => {
      const S = [...r, u], t = c[s];
      t !== void 0 && de(
        e,
        S,
        t,
        n
      );
    });
  } else c && typeof c == "object" && c.constructor === Object && Object.keys(c).forEach((i) => {
    const u = [...r, i], s = c[i];
    de(e, u, s, n);
  });
}
let fe = [], we = !1;
function tt() {
  we || (we = !0, queueMicrotask(it));
}
function rt(e, r, c) {
  const n = T.getState().getShadowValue(e, r), f = z(c) ? c(n) : c;
  Re(e, r, f), ue(e, r, { bubble: !0 });
  const i = D(e, r);
  return {
    type: "update",
    oldValue: n,
    newValue: f,
    shadowMeta: i
  };
}
function nt(e, r) {
  e?.signals?.length && e.signals.forEach(({ parentId: c, position: n, effect: f }) => {
    const i = document.querySelector(`[data-parent-id="${c}"]`);
    if (!i) return;
    const u = Array.from(i.childNodes);
    if (!u[n]) return;
    let s = r;
    if (f && r !== null)
      try {
        s = new Function("state", `return (${f})(state)`)(
          r
        );
      } catch (S) {
        console.error("Error evaluating effect function:", S);
      }
    s !== null && typeof s == "object" && (s = JSON.stringify(s)), u[n].textContent = String(s ?? "");
  });
}
function at(e, r, c) {
  const n = D(e, []);
  if (!n?.components)
    return /* @__PURE__ */ new Set();
  const f = /* @__PURE__ */ new Set();
  if (c.type === "update") {
    let i = [...r];
    for (; ; ) {
      const u = D(e, i);
      if (u?.pathComponents && u.pathComponents.forEach((s) => {
        const S = n.components?.get(s);
        S && ((Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"]).includes("none") || f.add(S));
      }), i.length === 0) break;
      i.pop();
    }
    c.newValue && typeof c.newValue == "object" && !Fe(c.newValue) && $e(c.newValue, c.oldValue).forEach((s) => {
      const S = s.split("."), t = [...r, ...S], l = D(e, t);
      l?.pathComponents && l.pathComponents.forEach((I) => {
        const U = n.components?.get(I);
        U && ((Array.isArray(U.reactiveType) ? U.reactiveType : [U.reactiveType || "component"]).includes("none") || f.add(U));
      });
    });
  } else if (c.type === "insert" || c.type === "cut") {
    const i = c.type === "insert" ? r : r.slice(0, -1), u = D(e, i);
    u?.pathComponents && u.pathComponents.forEach((s) => {
      const S = n.components?.get(s);
      S && f.add(S);
    });
  }
  return n.components.forEach((i, u) => {
    if (f.has(i))
      return;
    const s = Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"];
    if (s.includes("all"))
      f.add(i);
    else if (s.includes("deps") && i.depsFunction) {
      const S = R(e, []), t = i.depsFunction(S);
      (t === !0 || Array.isArray(t) && !ne(i.prevDeps, t)) && (i.prevDeps = t, f.add(i));
    }
  }), f;
}
function ot(e, r, c) {
  let n;
  if (z(c)) {
    const { value: i } = Q(e, r);
    n = c({ state: i, uuid: X() });
  } else
    n = c;
  Le(e, r, n), ue(e, r, { bubble: !0 });
  const f = D(e, r);
  if (f?.arrayKeys) {
    const i = f.arrayKeys[f.arrayKeys.length - 1];
    if (i) {
      const u = i.split(".").slice(1);
      ue(e, u, { bubble: !1 });
    }
  }
  return { type: "insert", newValue: n, shadowMeta: f };
}
function st(e, r) {
  const c = r.slice(0, -1), n = R(e, r);
  return Be(e, r), ue(e, c, { bubble: !0 }), { type: "cut", oldValue: n, parentPath: c };
}
function it() {
  const e = /* @__PURE__ */ new Set(), r = [], c = [];
  for (const n of fe) {
    if (n.status && n.updateType) {
      c.push(n);
      continue;
    }
    const f = n, i = f.type === "cut" ? null : f.newValue;
    f.shadowMeta?.signals?.length > 0 && r.push({ shadowMeta: f.shadowMeta, displayValue: i }), at(
      f.stateKey,
      f.path,
      f
    ).forEach((s) => {
      e.add(s);
    });
  }
  c.length > 0 && ze(c), r.forEach(({ shadowMeta: n, displayValue: f }) => {
    nt(n, f);
  }), e.forEach((n) => {
    n.forceUpdate();
  }), fe = [], we = !1;
}
function ct(e, r, c, n) {
  return (i, u, s, S) => {
    f(e, u, i, s);
  };
  function f(i, u, s, S) {
    let t;
    switch (S.updateType) {
      case "update":
        t = rt(i, u, s);
        break;
      case "insert":
        t = ot(i, u, s);
        break;
      case "cut":
        t = st(i, u);
        break;
    }
    t.stateKey = i, t.path = u, fe.push(t), tt();
    const l = {
      timeStamp: Date.now(),
      stateKey: i,
      path: u,
      updateType: S.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null
    };
    fe.push(l), t.newValue !== void 0 && Ke(
      t.newValue,
      i,
      n.current,
      c
    ), n.current?.middleware && n.current.middleware({ update: l }), S.sync !== !1 && r.current?.connected && r.current.updateState({ operation: l });
  }
}
function lt(e, {
  stateKey: r,
  localStorage: c,
  formElements: n,
  reactiveDeps: f,
  reactiveType: i,
  componentId: u,
  defaultState: s,
  syncUpdate: S,
  dependencies: t,
  serverState: l,
  __useSync: I
} = {}) {
  const [U, j] = K({}), { sessionId: F } = Ve();
  let x = !r;
  const [w] = K(r ?? X()), ee = L(u ?? X()), m = L(
    null
  );
  m.current = W(w) ?? null, H(() => {
    if (S && S.stateKey === w && S.path?.[0]) {
      const g = `${S.stateKey}:${S.path.join(".")}`;
      Je(g, {
        timeStamp: S.timeStamp,
        userId: S.userId
      });
    }
  }, [S]);
  const te = pe(
    (g) => {
      const p = g ? { ...W(w), ...g } : W(w), M = p?.defaultState || s || e;
      if (p?.serverState?.status === "success" && p?.serverState?.data !== void 0)
        return {
          value: p.serverState.data,
          source: "server",
          timestamp: p.serverState.timestamp || Date.now()
        };
      if (p?.localStorage?.key && F) {
        const E = z(p.localStorage.key) ? p.localStorage.key(M) : p.localStorage.key, A = Se(
          `${F}-${w}-${E}`
        );
        if (A && A.lastUpdated > (p?.serverState?.timestamp || 0))
          return {
            value: A.state,
            source: "localStorage",
            timestamp: A.lastUpdated
          };
      }
      return {
        value: M || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, s, e, F]
  );
  H(() => {
    We(w, l);
  }, [l, w]), H(() => T.getState().subscribeToPath(w, (y) => {
    if (y?.type === "SERVER_STATE_UPDATE") {
      const p = y.serverState;
      if (p?.status !== "success" || p.data === void 0)
        return;
      ve(w, { serverState: p });
      const M = typeof p.merge == "object" ? p.merge : p.merge === !0 ? { strategy: "append" } : null, _ = R(w, []), E = p.data;
      if (M && M.strategy === "append" && "key" in M && // Type guard for key
      Array.isArray(_) && Array.isArray(E)) {
        const A = M.key;
        if (!A) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const P = new Set(
          _.map((O) => O[A])
        ), b = E.filter(
          (O) => !P.has(O[A])
        );
        b.length > 0 && qe(w, [], b);
        const V = R(w, []);
        de(
          w,
          [],
          V,
          p.timestamp
        );
      } else
        ae(w, E), de(
          w,
          [],
          E,
          p.timestamp
        );
    }
  }), [w, te]), H(() => {
    const g = T.getState().getShadowMetadata(w, []);
    if (g && g.stateSource)
      return;
    const y = W(w), p = {
      syncEnabled: !!v && !!h,
      validationEnabled: !!(y?.validation?.zodSchemaV4 || y?.validation?.zodSchemaV3),
      localStorageEnabled: !!y?.localStorage?.key
    };
    if (J(w, [], {
      ...g,
      features: p
    }), y?.defaultState !== void 0 || s !== void 0) {
      const M = y?.defaultState || s;
      y?.defaultState || ve(w, {
        defaultState: M
      });
      const { value: _, source: E, timestamp: A } = te();
      ae(w, _), J(w, [], {
        stateSource: E,
        lastServerSync: E === "server" ? A : void 0,
        isDirty: !1,
        baseServerState: E === "server" ? _ : void 0
      }), Ie(w);
    }
  }, [w, ...t || []]), ce(() => {
    x && ve(w, {
      formElements: n,
      defaultState: s,
      localStorage: c,
      middleware: m.current?.middleware
    });
    const g = `${w}////${ee.current}`, y = D(w, []), p = y?.components || /* @__PURE__ */ new Map();
    return p.set(g, {
      forceUpdate: () => j({}),
      reactiveType: i ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: f || void 0,
      deps: f ? f(R(w, [])) : [],
      prevDeps: f ? f(R(w, [])) : []
    }), J(w, [], {
      ...y,
      components: p
    }), j({}), () => {
      const M = D(w, []), _ = M?.components?.get(g);
      _?.paths && _.paths.forEach((E) => {
        const P = E.split(".").slice(1), b = T.getState().getShadowMetadata(w, P);
        b?.pathComponents && b.pathComponents.size === 0 && (delete b.pathComponents, T.getState().setShadowMetadata(w, P, b));
      }), M?.components && J(w, [], M);
    };
  }, []);
  const o = L(null), a = ct(
    w,
    o,
    F,
    m
  );
  T.getState().initialStateGlobal[w] || ke(w, e);
  const d = _e(() => Pe(
    w,
    a,
    ee.current,
    F
  ), [w, F]), v = I, h = m.current?.syncOptions;
  return v && (o.current = v(
    d,
    h ?? {}
  )), d;
}
const ut = (e, r, c) => {
  let n = D(e, r)?.arrayKeys || [];
  const f = c?.transforms;
  if (!f || f.length === 0)
    return n;
  for (const i of f)
    if (i.type === "filter") {
      const u = [];
      n.forEach((s, S) => {
        const t = R(e, [...r, s]);
        i.fn(t, S) && u.push(s);
      }), n = u;
    } else i.type === "sort" && n.sort((u, s) => {
      const S = R(e, [...r, u]), t = R(e, [...r, s]);
      return i.fn(S, t);
    });
  return n;
}, Ee = (e, r, c) => {
  const n = `${e}////${r}`, i = D(e, [])?.components?.get(n);
  !i || i.reactiveType === "none" || !(Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType]).includes("component") || Ge(e, c, n);
}, ie = (e, r, c) => {
  const n = T.getState(), f = n.getShadowMetadata(e, []), i = /* @__PURE__ */ new Set();
  f?.components && f.components.forEach((s, S) => {
    (Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"]).includes("all") && (s.forceUpdate(), i.add(S));
  }), n.getShadowMetadata(e, [...r, "getSelected"])?.pathComponents?.forEach((s) => {
    f?.components?.get(s)?.forceUpdate();
  });
  const u = n.getShadowMetadata(e, r);
  for (let s of u?.arrayKeys || []) {
    const S = s + ".selected", t = n.getShadowMetadata(
      e,
      S.split(".").slice(1)
    );
    s == c && t?.pathComponents?.forEach((l) => {
      f?.components?.get(l)?.forceUpdate();
    });
  }
};
function Q(e, r, c) {
  const n = D(e, r), f = r.length > 0 ? r.join(".") : "root", i = c?.arrayViews?.[f];
  if (Array.isArray(i) && i.length === 0)
    return {
      shadowMeta: n,
      value: [],
      arrayKeys: n?.arrayKeys
    };
  const u = R(e, r, i);
  return {
    shadowMeta: n,
    value: u,
    arrayKeys: n?.arrayKeys
  };
}
function Pe(e, r, c, n) {
  const f = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set([
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
    path: t = [],
    meta: l,
    componentId: I
  }) {
    const U = l ? JSON.stringify(l.arrayViews || l.transforms) : "", j = t.join(".") + ":" + U;
    if (f.has(j))
      return f.get(j);
    const F = [e, ...t].join("."), x = {
      get(ee, m) {
        if (t.length === 0 && m in s)
          return s[m];
        if (!i.has(m)) {
          const o = [...t, m];
          return u({
            path: o,
            componentId: I,
            meta: l
          });
        }
        if (m === "_rebuildStateShape")
          return u;
        if (m === "sync" && t.length === 0)
          return async function() {
            const o = T.getState().getInitialOptions(e), a = o?.sync;
            if (!a)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const d = T.getState().getShadowValue(e, []), v = o?.validation?.key;
            try {
              const h = await a.action(d);
              if (h && !h.success && h.errors, h?.success) {
                const g = T.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...g,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: d
                  // Update base server state
                }), a.onSuccess && a.onSuccess(h.data);
              } else !h?.success && a.onError && a.onError(h.error);
              return h;
            } catch (h) {
              return a.onError && a.onError(h), { success: !1, error: h };
            }
          };
        if (m === "_status" || m === "getStatus") {
          const o = () => {
            const { shadowMeta: a, value: d } = Q(e, t, l);
            return a?.isDirty === !0 ? "dirty" : a?.stateSource === "server" || a?.isDirty === !1 ? "synced" : a?.stateSource === "localStorage" ? "restored" : a?.stateSource === "default" || d !== void 0 && !a ? "fresh" : "unknown";
          };
          return m === "_status" ? o() : o;
        }
        if (m === "removeStorage")
          return () => {
            const o = T.getState().initialStateGlobal[e], a = W(e), d = z(a?.localStorage?.key) ? a.localStorage.key(o) : a?.localStorage?.key, v = `${n}-${e}-${d}`;
            v && localStorage.removeItem(v);
          };
        if (m === "showValidationErrors")
          return () => {
            const { shadowMeta: o } = Q(e, t, l);
            return o?.validation?.status === "INVALID" && o.validation.errors.length > 0 ? o.validation.errors.filter((a) => a.severity === "error").map((a) => a.message) : [];
          };
        if (m === "getSelected")
          return () => {
            const o = [e, ...t].join(".");
            Ee(e, I, [
              ...t,
              "getSelected"
            ]);
            const a = T.getState().selectedIndicesMap.get(o);
            if (!a)
              return;
            const d = t.join("."), v = l?.arrayViews?.[d], h = a.split(".").pop();
            if (!(v && !v.includes(h) || R(
              e,
              a.split(".").slice(1)
            ) === void 0))
              return u({
                path: a.split(".").slice(1),
                componentId: I,
                meta: l
              });
          };
        if (m === "getSelectedIndex")
          return () => {
            const o = e + "." + t.join(".");
            t.join(".");
            const a = T.getState().selectedIndicesMap.get(o);
            if (!a)
              return -1;
            const { keys: d } = B(e, t, l);
            if (!d)
              return -1;
            const v = a.split(".").pop();
            return d.indexOf(v);
          };
        if (m === "clearSelected")
          return ie(e, t), () => {
            Ze({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (m === "useVirtualView")
          return (o) => {
            const {
              itemHeight: a = 50,
              overscan: d = 6,
              stickToBottom: v = !1,
              scrollStickTolerance: h = 75
            } = o, g = L(null), [y, p] = K({
              startIndex: 0,
              endIndex: 10
            }), [M, _] = K({}), E = L(!0), A = L({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), P = L(
              /* @__PURE__ */ new Map()
            ), { keys: b } = B(e, t, l);
            H(() => {
              const C = [e, ...t].join("."), k = T.getState().subscribeToPath(C, (N) => {
                N.type !== "GET_SELECTED" && N.type === "SERVER_STATE_UPDATE" && _({});
              });
              return () => {
                k();
              };
            }, [I, e, t.join(".")]), ce(() => {
              if (v && b.length > 0 && g.current && !A.current.isUserScrolling && E.current) {
                const C = g.current, k = () => {
                  if (C.clientHeight > 0) {
                    const N = Math.ceil(
                      C.clientHeight / a
                    ), q = b.length - 1, $ = Math.max(
                      0,
                      q - N - d
                    );
                    p({ startIndex: $, endIndex: q }), requestAnimationFrame(() => {
                      Y("instant"), E.current = !1;
                    });
                  } else
                    requestAnimationFrame(k);
                };
                k();
              }
            }, [b.length, v, a, d]);
            const V = L(y);
            ce(() => {
              V.current = y;
            }, [y]);
            const O = L(b);
            ce(() => {
              O.current = b;
            }, [b]);
            const oe = pe(() => {
              const C = g.current;
              if (!C) return;
              const k = C.scrollTop, { scrollHeight: N, clientHeight: q } = C, $ = A.current, re = N - (k + q), ge = $.isNearBottom;
              $.isNearBottom = re <= h, k < $.lastScrollTop ? ($.scrollUpCount++, $.scrollUpCount > 3 && ge && ($.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : $.isNearBottom && ($.isUserScrolling = !1, $.scrollUpCount = 0), $.lastScrollTop = k;
              let Z = 0;
              for (let G = 0; G < b.length; G++) {
                const ye = b[G], me = P.current.get(ye);
                if (me && me.offset + me.height > k) {
                  Z = G;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                P.current,
                Z,
                y
              ), Z !== y.startIndex && y.startIndex != 0) {
                const G = Math.ceil(q / a);
                p({
                  startIndex: Math.max(0, Z - d),
                  endIndex: Math.min(
                    b.length - 1,
                    Z + G + d
                  )
                });
              }
            }, [
              b.length,
              y.startIndex,
              a,
              d,
              h
            ]);
            H(() => {
              const C = g.current;
              if (C)
                return C.addEventListener("scroll", oe, {
                  passive: !0
                }), () => {
                  C.removeEventListener("scroll", oe);
                };
            }, [oe, v]);
            const Y = pe(
              (C = "smooth") => {
                const k = g.current;
                if (!k) return;
                A.current.isUserScrolling = !1, A.current.isNearBottom = !0, A.current.scrollUpCount = 0;
                const N = () => {
                  const q = ($ = 0) => {
                    if ($ > 5) return;
                    const re = k.scrollHeight, ge = k.scrollTop, Z = k.clientHeight;
                    ge + Z >= re - 1 || (k.scrollTo({
                      top: re,
                      behavior: C
                    }), setTimeout(() => {
                      const G = k.scrollHeight, ye = k.scrollTop;
                      (G !== re || ye + Z < G - 1) && q($ + 1);
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
            return H(() => {
              if (!v || !g.current) return;
              const C = g.current, k = A.current;
              let N;
              const q = () => {
                clearTimeout(N), N = setTimeout(() => {
                  !k.isUserScrolling && k.isNearBottom && Y(
                    E.current ? "instant" : "smooth"
                  );
                }, 100);
              }, $ = new MutationObserver(() => {
                k.isUserScrolling || q();
              });
              return $.observe(C, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), E.current ? setTimeout(() => {
                Y("instant");
              }, 0) : q(), () => {
                clearTimeout(N), $.disconnect();
              };
            }, [v, b.length, Y]), console.log("range", y), {
              virtualState: _e(() => {
                const C = Array.isArray(b) ? b.slice(y.startIndex, y.endIndex + 1) : [];
                console.log("slicedKeys", C);
                const k = t.length > 0 ? t.join(".") : "root";
                return u({
                  path: t,
                  componentId: I,
                  meta: {
                    ...l,
                    arrayViews: { [k]: C },
                    serverStateIsUpStream: !0
                  }
                });
              }, [y.startIndex, y.endIndex, b, l]),
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
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${P.current.get(b[y.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: Y,
              scrollToIndex: (C, k = "smooth") => {
                if (g.current && b[C]) {
                  const N = P.current.get(b[C])?.offset || 0;
                  g.current.scrollTo({ top: N, behavior: k });
                }
              }
            };
          };
        if (m === "stateMap")
          return (o) => {
            const { value: a, keys: d } = B(
              e,
              t,
              l
            );
            if (!d || !Array.isArray(a))
              return [];
            const v = u({
              path: t,
              componentId: I,
              meta: l
            });
            return a.map((h, g) => {
              const y = d[g];
              if (!y) return;
              const p = [...t, y], M = u({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: I,
                meta: l
              });
              return o(M, g, v);
            });
          };
        if (m === "stateFilter")
          return (o) => {
            const a = t.length > 0 ? t.join(".") : "root", { keys: d, value: v } = B(
              e,
              t,
              l
            );
            if (!Array.isArray(v))
              throw new Error("stateFilter can only be used on arrays");
            const h = [];
            return v.forEach((g, y) => {
              if (o(g, y)) {
                const p = d[y];
                p && h.push(p);
              }
            }), u({
              path: t,
              componentId: I,
              meta: {
                ...l,
                arrayViews: {
                  ...l?.arrayViews || {},
                  [a]: h
                },
                transforms: [
                  ...l?.transforms || [],
                  { type: "filter", fn: o, path: t }
                ]
              }
            });
          };
        if (m === "stateSort")
          return (o) => {
            const a = t.length > 0 ? t.join(".") : "root", { value: d, keys: v } = B(
              e,
              t,
              l
            );
            if (!Array.isArray(d) || !v)
              throw new Error("No array keys found for sorting");
            const h = d.map((y, p) => ({
              item: y,
              key: v[p]
            }));
            h.sort((y, p) => o(y.item, p.item));
            const g = h.map((y) => y.key);
            return u({
              path: t,
              componentId: I,
              meta: {
                ...l,
                arrayViews: {
                  ...l?.arrayViews || {},
                  [a]: g
                },
                transforms: [
                  ...l?.transforms || [],
                  { type: "sort", fn: o, path: t }
                ]
              }
            });
          };
        if (m === "stream")
          return function(o = {}) {
            const {
              bufferSize: a = 100,
              flushInterval: d = 100,
              bufferStrategy: v = "accumulate",
              store: h,
              onFlush: g
            } = o;
            let y = [], p = !1, M = null;
            const _ = (V) => {
              if (!p) {
                if (v === "sliding" && y.length >= a)
                  y.shift();
                else if (v === "dropping" && y.length >= a)
                  return;
                y.push(V), y.length >= a && E();
              }
            }, E = () => {
              if (y.length === 0) return;
              const V = [...y];
              if (y = [], h) {
                const O = h(V);
                O !== void 0 && (Array.isArray(O) ? O : [O]).forEach((Y) => {
                  r(Y, t, {
                    updateType: "insert"
                  });
                });
              } else
                V.forEach((O) => {
                  r(O, t, {
                    updateType: "insert"
                  });
                });
              g?.(V);
            };
            d > 0 && (M = setInterval(E, d));
            const A = X(), P = D(e, t) || {}, b = P.streams || /* @__PURE__ */ new Map();
            return b.set(A, { buffer: y, flushTimer: M }), J(e, t, {
              ...P,
              streams: b
            }), {
              write: (V) => _(V),
              writeMany: (V) => V.forEach(_),
              flush: () => E(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, y.length > 0 && E();
              },
              close: () => {
                E(), M && clearInterval(M);
                const V = T.getState().getShadowMetadata(e, t);
                V?.streams && V.streams.delete(A);
              }
            };
          };
        if (m === "stateList")
          return (o) => /* @__PURE__ */ se(() => {
            const d = L(/* @__PURE__ */ new Map()), [v, h] = K({});
            console.log("mett", l);
            const g = ut(e, t, l), y = t.length > 0 ? t.join(".") : "root", p = {
              ...l,
              arrayViews: {
                ...l?.arrayViews || {},
                [y]: g
                // Update the arrayViews with the new valid IDs
              }
            };
            console.log("updatedMeta", p);
            const { value: M } = B(
              e,
              t,
              p
            );
            if (H(() => {
              const A = T.getState().subscribeToPath(F, (P) => {
                if (P.type === "GET_SELECTED")
                  return;
                const V = T.getState().getShadowMetadata(e, t)?.transformCaches;
                if (V)
                  for (const O of V.keys())
                    O.startsWith(I) && V.delete(O);
                (P.type === "INSERT" || P.type === "INSERT_MANY" || P.type === "REMOVE" || P.type === "CLEAR_SELECTION" || P.type === "SERVER_STATE_UPDATE" && !l?.serverStateIsUpStream) && h({});
              });
              return () => {
                A();
              };
            }, [I, F]), !Array.isArray(M))
              return null;
            const _ = u({
              path: t,
              componentId: I,
              meta: p
              // Use updated meta here
            });
            console.time("render");
            const E = M.map((A, P) => {
              const b = g[P];
              if (!b)
                return null;
              let V = d.current.get(b);
              V || (V = X(), d.current.set(b, V));
              const O = [...t, b];
              return Te(Ne, {
                key: b,
                stateKey: e,
                itemComponentId: V,
                itemPath: O,
                localIndex: P,
                arraySetter: _,
                rebuildStateShape: u,
                renderFn: o
              });
            });
            return console.timeEnd("render"), /* @__PURE__ */ se(Ce, { children: E });
          }, {});
        if (m === "stateFlattenOn")
          return (o) => {
            const a = t.length > 0 ? t.join(".") : "root", d = l?.arrayViews?.[a], v = T.getState().getShadowValue(e, t, d);
            return Array.isArray(v) ? u({
              path: [...t, "[*]", o],
              componentId: I,
              meta: l
            }) : [];
          };
        if (m === "index")
          return (o) => {
            const a = t.length > 0 ? t.join(".") : "root", d = l?.arrayViews?.[a];
            if (d) {
              const g = d[o];
              return g ? u({
                path: [...t, g],
                componentId: I,
                meta: l
              }) : void 0;
            }
            const v = D(e, t);
            if (!v?.arrayKeys) return;
            const h = v.arrayKeys[o];
            if (h)
              return u({
                path: [...t, h],
                componentId: I,
                meta: l
              });
          };
        if (m === "last")
          return () => {
            const { keys: o } = B(e, t, l);
            if (!o || o.length === 0)
              return;
            const a = o[o.length - 1];
            if (!a)
              return;
            const d = [...t, a];
            return u({
              path: d,
              componentId: I,
              meta: l
            });
          };
        if (m === "insert")
          return (o, a) => {
            r(o, t, { updateType: "insert" });
          };
        if (m === "uniqueInsert")
          return (o, a, d) => {
            const { value: v } = Q(
              e,
              t,
              l
            ), h = z(o) ? o(v) : o;
            let g = null;
            if (!v.some((p) => {
              const M = a ? a.every(
                (_) => ne(p[_], h[_])
              ) : ne(p, h);
              return M && (g = p), M;
            }))
              r(h, t, { updateType: "insert" });
            else if (d && g) {
              const p = d(g), M = v.map(
                (_) => ne(_, g) ? p : _
              );
              r(M, t, {
                updateType: "update"
              });
            }
          };
        if (m === "cut")
          return (o, a) => {
            const d = D(e, t);
            if (!d?.arrayKeys || d.arrayKeys.length === 0)
              return;
            const v = o === -1 ? d.arrayKeys.length - 1 : o !== void 0 ? o : d.arrayKeys.length - 1, h = d.arrayKeys[v];
            h && r(null, [...t, h], {
              updateType: "cut"
            });
          };
        if (m === "cutSelected")
          return () => {
            const o = [e, ...t].join("."), { keys: a } = B(e, t, l);
            if (!a || a.length === 0)
              return;
            const d = T.getState().selectedIndicesMap.get(o);
            if (!d)
              return;
            const v = d.split(".").pop();
            if (!a.includes(v))
              return;
            const h = d.split(".").slice(1);
            T.getState().clearSelectedIndex({ arrayKey: o });
            const g = h.slice(0, -1);
            ie(e, g), r(null, h, {
              updateType: "cut"
            });
          };
        if (m === "cutByValue")
          return (o) => {
            const {
              isArray: a,
              value: d,
              keys: v
            } = B(e, t, l);
            if (!a) return;
            const h = he(d, v, (g) => g === o);
            h && r(null, [...t, h.key], {
              updateType: "cut"
            });
          };
        if (m === "toggleByValue")
          return (o) => {
            const {
              isArray: a,
              value: d,
              keys: v
            } = B(e, t, l);
            if (!a) return;
            const h = he(d, v, (g) => g === o);
            if (h) {
              const g = [...t, h.key];
              r(null, g, {
                updateType: "cut"
              });
            } else
              r(o, t, { updateType: "insert" });
          };
        if (m === "findWith")
          return (o, a) => {
            const { isArray: d, value: v, keys: h } = B(e, t, l);
            if (!d)
              throw new Error("findWith can only be used on arrays");
            const g = he(
              v,
              h,
              (y) => y?.[o] === a
            );
            return u(g ? {
              path: [...t, g.key],
              // e.g., ['itemInstances', 'inst-1', 'properties', 'prop-b']
              componentId: I,
              meta: l
            } : {
              path: [...t, `not_found_${X()}`],
              componentId: I,
              meta: l
            });
          };
        if (m === "cutThis") {
          const { value: o } = Q(e, t, l);
          return () => {
            r(o, t, { updateType: "cut" });
          };
        }
        if (m === "get")
          return () => {
            Ee(e, I, t);
            const { value: o } = Q(e, t, l);
            return o;
          };
        if (m === "$derive")
          return (o) => Ae({
            _stateKey: e,
            _path: t,
            _effect: o.toString(),
            _meta: l
          });
        if (m === "$get")
          return () => Ae({ _stateKey: e, _path: t, _meta: l });
        if (m === "lastSynced") {
          const o = `${e}:${t.join(".")}`;
          return Ye(o);
        }
        if (m == "getLocalStorage")
          return (o) => Se(n + "-" + e + "-" + o);
        if (m === "isSelected") {
          const o = t.slice(0, -1);
          if (D(e, o)?.arrayKeys) {
            const d = e + "." + o.join("."), v = T.getState().selectedIndicesMap.get(d), h = e + "." + t.join(".");
            return ie(e, o, void 0), v === h;
          }
          return;
        }
        if (m === "setSelected")
          return (o) => {
            const a = t.slice(0, -1), d = e + "." + a.join("."), v = e + "." + t.join(".");
            ie(e, a, void 0), T.getState().selectedIndicesMap.get(d), o && T.getState().setSelectedIndex(d, v);
          };
        if (m === "toggleSelected")
          return () => {
            const o = t.slice(0, -1), a = e + "." + o.join("."), d = e + "." + t.join(".");
            T.getState().selectedIndicesMap.get(a) === d ? T.getState().clearSelectedIndex({ arrayKey: a }) : T.getState().setSelectedIndex(a, d);
          };
        if (m === "_componentId")
          return I;
        if (t.length == 0) {
          if (m === "addZodValidation")
            return (o) => {
              o.forEach((a) => {
                const d = T.getState().getShadowMetadata(e, a.path) || {};
                T.getState().setShadowMetadata(e, a.path, {
                  ...d,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: "client",
                        message: a.message,
                        severity: "error",
                        code: a.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                });
              });
            };
          if (m === "clearZodValidation")
            return (o) => {
              if (!o)
                throw new Error("clearZodValidation requires a path");
              const a = D(e, o) || {};
              J(e, o, {
                ...a,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (m === "applyJsonPatch")
            return (o) => {
              const a = T.getState(), d = a.getShadowMetadata(e, []);
              if (!d?.components) return;
              const v = (g) => !g || g === "/" ? [] : g.split("/").slice(1).map((y) => y.replace(/~1/g, "/").replace(/~0/g, "~")), h = /* @__PURE__ */ new Set();
              for (const g of o) {
                const y = v(g.path);
                switch (g.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = g;
                    a.updateShadowAtPath(e, y, p), a.markAsDirty(e, y, { bubble: !0 });
                    let M = [...y];
                    for (; ; ) {
                      const _ = a.getShadowMetadata(
                        e,
                        M
                      );
                      if (_?.pathComponents && _.pathComponents.forEach((E) => {
                        if (!h.has(E)) {
                          const A = d.components?.get(E);
                          A && (A.forceUpdate(), h.add(E));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = y.slice(0, -1);
                    a.removeShadowArrayElement(e, y), a.markAsDirty(e, p, { bubble: !0 });
                    let M = [...p];
                    for (; ; ) {
                      const _ = a.getShadowMetadata(
                        e,
                        M
                      );
                      if (_?.pathComponents && _.pathComponents.forEach((E) => {
                        if (!h.has(E)) {
                          const A = d.components?.get(E);
                          A && (A.forceUpdate(), h.add(E));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (m === "getComponents")
            return () => D(e, [])?.components;
          if (m === "getAllFormRefs")
            return () => Me.getState().getFormRefsByStateKey(e);
        }
        if (m === "getFormRef")
          return () => Me.getState().getFormRef(e + "." + t.join("."));
        if (m === "validationWrapper")
          return ({
            children: o,
            hideMessage: a
          }) => /* @__PURE__ */ se(
            Oe,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: o
            }
          );
        if (m === "_stateKey") return e;
        if (m === "_path") return t;
        if (m === "update")
          return (o) => (r(o, t, { updateType: "update" }), {
            synced: () => {
              const a = T.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...a,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const d = [e, ...t].join(".");
              Qe(d, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (m === "toggle") {
          const { value: o } = Q(
            e,
            t,
            l
          );
          if (typeof o != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            r(!o, t, {
              updateType: "update"
            });
          };
        }
        if (m === "formElement")
          return (o, a) => /* @__PURE__ */ se(
            je,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: u,
              setState: r,
              formOpts: a,
              renderFn: o
            }
          );
        const te = [...t, m];
        return T.getState().getShadowValue(e, te), u({
          path: te,
          componentId: I,
          meta: l
        });
      }
    }, w = new Proxy({}, x);
    return f.set(j, w), w;
  }
  const s = {
    revertToInitialState: (t) => {
      const l = T.getState().getShadowMetadata(e, []);
      l?.stateSource === "server" && l.baseServerState ? l.baseServerState : T.getState().initialStateGlobal[e];
      const I = T.getState().initialStateGlobal[e];
      He(e), ae(e, I), u({
        path: [],
        componentId: c
      });
      const U = W(e), j = z(U?.localStorage?.key) ? U?.localStorage?.key(I) : U?.localStorage?.key, F = `${n}-${e}-${j}`;
      F && localStorage.removeItem(F);
      const x = T.getState().getShadowMetadata(e, []);
      return x && x?.components?.forEach((w) => {
        w.forceUpdate();
      }), I;
    },
    updateInitialState: (t) => {
      const l = Pe(
        e,
        r,
        c,
        n
      ), I = T.getState().initialStateGlobal[e], U = W(e), j = z(U?.localStorage?.key) ? U?.localStorage?.key(I) : U?.localStorage?.key, F = `${n}-${e}-${j}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), De(() => {
        ke(e, t), ae(e, t);
        const x = T.getState().getShadowMetadata(e, []);
        x && x?.components?.forEach((w) => {
          w.forceUpdate();
        });
      }), {
        fetchId: (x) => l.get()[x]
      };
    }
  };
  return u({
    componentId: c,
    path: []
  });
}
function Ae(e) {
  return Te(dt, { proxy: e });
}
function dt({
  proxy: e
}) {
  const r = L(null), c = L(null), n = L(!1), f = `${e._stateKey}-${e._path.join(".")}`, i = e._path.length > 0 ? e._path.join(".") : "root", u = e._meta?.arrayViews?.[i], s = R(e._stateKey, e._path, u);
  return H(() => {
    const S = r.current;
    if (!S || n.current) return;
    const t = setTimeout(() => {
      if (!S.parentElement) {
        console.warn("Parent element not found for signal", f);
        return;
      }
      const l = S.parentElement, U = Array.from(l.childNodes).indexOf(S);
      let j = l.getAttribute("data-parent-id");
      j || (j = `parent-${crypto.randomUUID()}`, l.setAttribute("data-parent-id", j)), c.current = `instance-${crypto.randomUUID()}`;
      const F = T.getState().getShadowMetadata(e._stateKey, e._path) || {}, x = F.signals || [];
      x.push({
        instanceId: c.current,
        parentId: j,
        position: U,
        effect: e._effect
      }), T.getState().setShadowMetadata(e._stateKey, e._path, {
        ...F,
        signals: x
      });
      let w = s;
      if (e._effect)
        try {
          w = new Function(
            "state",
            `return (${e._effect})(state)`
          )(s);
        } catch (m) {
          console.error("Error evaluating effect function:", m);
        }
      w !== null && typeof w == "object" && (w = JSON.stringify(w));
      const ee = document.createTextNode(String(w ?? ""));
      S.replaceWith(ee), n.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(t), c.current) {
        const l = T.getState().getShadowMetadata(e._stateKey, e._path) || {};
        l.signals && (l.signals = l.signals.filter(
          (I) => I.instanceId !== c.current
        ), T.getState().setShadowMetadata(e._stateKey, e._path, l));
      }
    };
  }, []), Te("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": f
  });
}
export {
  Ae as $cogsSignal,
  Et as addStateOptions,
  Xe as createCogsState,
  At as createCogsStateFromSync,
  lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
