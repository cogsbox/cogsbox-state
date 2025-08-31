"use client";
import { jsx as ne, Fragment as Pe } from "react/jsx-runtime";
import { useState as te, useRef as R, useEffect as q, useCallback as we, useLayoutEffect as ce, useMemo as pe, createElement as Ae, startTransition as Ce } from "react";
import { transformStateFunc as De, isFunction as z, isDeepEqual as oe } from "./utility.js";
import { ValidationWrapper as Oe, IsolatedComponentWrapper as Ue, FormElementWrapper as Fe, MemoizedCogsItemWrapper as je } from "./Components.jsx";
import Ne from "superjson";
import { v4 as ee } from "uuid";
import { getGlobalStore as T, formRefStore as Me } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
const {
  getInitialOptions: W,
  updateInitialStateGlobal: ke,
  getShadowMetadata: V,
  setShadowMetadata: J,
  getShadowValue: N,
  initializeShadowState: se,
  updateShadowAtPath: Re,
  insertShadowArrayElement: xe,
  insertManyShadowArrayElements: Le,
  removeShadowArrayElement: Be,
  setInitialStateOptions: le,
  setServerStateUpdate: Ee,
  markAsDirty: Ie,
  addPathComponent: qe,
  clearSelectedIndexesForState: We,
  addStateLog: Ge,
  setSyncInfo: He,
  clearSelectedIndex: ze,
  getSyncInfo: Je,
  notifyPathSubscribers: Ye
  // Note: The old functions are no longer imported under their original names
} = T.getState();
function B(e, r, d) {
  const s = V(e, r);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, r), keys: [] };
  const i = r.length > 0 ? r.join(".") : "root", S = d?.arrayViews?.[i] ?? s.arrayKeys;
  return Array.isArray(S) && S.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, r, S), keys: S ?? [] };
}
function me(e, r, d) {
  for (let s = 0; s < e.length; s++)
    if (d(e[s], s)) {
      const f = r[s];
      if (f)
        return { key: f, index: s, value: e[s] };
    }
  return null;
}
function he(e, r) {
  const d = W(e) || {};
  le(e, {
    ...d,
    ...r
  });
}
function $e({
  stateKey: e,
  options: r,
  initialOptionsPart: d
}) {
  const s = W(e) || {};
  let i = { ...d[e] || {}, ...s }, S = !1;
  if (r) {
    const l = (t, n) => {
      for (const u in n)
        n.hasOwnProperty(u) && (n[u] instanceof Object && !Array.isArray(n[u]) && t[u] instanceof Object ? oe(t[u], n[u]) || (l(t[u], n[u]), S = !0) : t[u] !== n[u] && (t[u] = n[u], S = !0));
      return t;
    };
    i = l(i, r);
  }
  i.syncOptions && (!r || !r.hasOwnProperty("syncOptions")) && (S = !0), (i.validation && i?.validation?.zodSchemaV4 || i?.validation?.zodSchemaV3) && (r?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || (i.validation.onBlur = "error")), S && le(e, i);
}
function wt(e, { formElements: r, validation: d }) {
  return { initialState: e, formElements: r, validation: d };
}
const Ze = (e, r) => {
  let d = e;
  const [s, f] = De(d);
  r?.__fromSyncSchema && r?.__syncNotifications && T.getState().setInitialStateOptions("__notifications", r.__syncNotifications), r?.__fromSyncSchema && r?.__apiParamsMap && T.getState().setInitialStateOptions("__apiParamsMap", r.__apiParamsMap), Object.keys(s).forEach((l) => {
    let t = f[l] || {};
    const n = {
      ...t
    };
    if (r?.formElements && (n.formElements = {
      ...r.formElements,
      ...t.formElements || {}
    }), r?.validation && (n.validation = {
      ...r.validation,
      ...t.validation || {}
    }, r.validation.key && !t.validation?.key && (n.validation.key = `${r.validation.key}.${l}`)), r?.__syncSchemas?.[l]?.schemas?.validation && (n.validation = {
      zodSchemaV4: r.__syncSchemas[l].schemas.validation,
      ...t.validation
    }), Object.keys(n).length > 0) {
      const u = W(l);
      u ? le(l, {
        ...u,
        ...n
      }) : le(l, n);
    }
  }), Object.keys(s).forEach((l) => {
    se(l, s[l]);
  });
  const i = (l, t) => {
    const [n] = te(t?.componentId ?? ee());
    $e({
      stateKey: l,
      options: t,
      initialOptionsPart: f
    });
    const u = N(l, []) || s[l], C = t?.modifyState ? t.modifyState(u) : u;
    return it(C, {
      stateKey: l,
      syncUpdate: t?.syncUpdate,
      componentId: n,
      localStorage: t?.localStorage,
      middleware: t?.middleware,
      reactiveType: t?.reactiveType,
      reactiveDeps: t?.reactiveDeps,
      defaultState: t?.defaultState,
      dependencies: t?.dependencies,
      serverState: t?.serverState,
      syncOptions: t?.syncOptions,
      __useSync: r?.__useSync
    });
  };
  function S(l, t) {
    $e({ stateKey: l, options: t, initialOptionsPart: f }), t.localStorage && Xe(l, t), ie(l);
  }
  return { useCogsState: i, setCogsOptions: S };
};
function pt(e, r) {
  const d = e.schemas, s = {}, f = {};
  for (const i in d) {
    const S = d[i];
    S?.relations && S?.schemas?.defaults ? s[i] = S.schemas.defaults : s[i] = S?.schemas?.defaults || {}, console.log("initialState", s), S?.api?.queryData?._paramType && (f[i] = S.api.queryData._paramType);
  }
  return Ze(s, {
    __fromSyncSchema: !0,
    __syncNotifications: e.notifications,
    __apiParamsMap: f,
    __useSync: r,
    __syncSchemas: d
  });
}
const Qe = (e, r, d, s, f) => {
  d?.log && console.log(
    "saving to localstorage",
    r,
    d.localStorage?.key,
    s
  );
  const i = z(d?.localStorage?.key) ? d.localStorage?.key(e) : d?.localStorage?.key;
  if (i && s) {
    const S = `${s}-${r}-${i}`;
    let l;
    try {
      l = fe(S)?.lastSyncedWithServer;
    } catch {
    }
    const t = V(r, []), n = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, u = Ne.serialize(n);
    window.localStorage.setItem(
      S,
      JSON.stringify(u.json)
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
}, Xe = (e, r) => {
  const d = N(e, []), { sessionId: s } = _e(), f = z(r?.localStorage?.key) ? r.localStorage.key(d) : r?.localStorage?.key;
  if (f && s) {
    const i = fe(
      `${s}-${e}-${f}`
    );
    if (i && i.lastUpdated > (i.lastSyncedWithServer || 0))
      return ie(e), !0;
  }
  return !1;
}, ie = (e) => {
  const r = V(e, []);
  if (!r) return;
  const d = /* @__PURE__ */ new Set();
  r?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || d.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    d.forEach((s) => s());
  });
};
function ue(e, r, d, s) {
  const f = V(e, r);
  if (J(e, r, {
    ...f,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(d)) {
    const i = V(e, r);
    i?.arrayKeys && i.arrayKeys.forEach((S, l) => {
      const t = [...r, S], n = d[l];
      n !== void 0 && ue(
        e,
        t,
        n,
        s
      );
    });
  } else d && typeof d == "object" && d.constructor === Object && Object.keys(d).forEach((i) => {
    const S = [...r, i], l = d[i];
    ue(e, S, l, s);
  });
}
let de = [], Te = !1;
function Ke() {
  Te || (Te = !0, queueMicrotask(ot));
}
function et(e, r, d) {
  const s = T.getState().getShadowValue(e, r), f = z(d) ? d(s) : d;
  Re(e, r, f), Ie(e, r, { bubble: !0 });
  const i = V(e, r);
  return {
    type: "update",
    oldValue: s,
    newValue: f,
    shadowMeta: i
  };
}
function tt(e, r) {
  e?.signals?.length && e.signals.forEach(({ parentId: d, position: s, effect: f }) => {
    const i = document.querySelector(`[data-parent-id="${d}"]`);
    if (!i) return;
    const S = Array.from(i.childNodes);
    if (!S[s]) return;
    let l = r;
    if (f && r !== null)
      try {
        l = new Function("state", `return (${f})(state)`)(
          r
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    l !== null && typeof l == "object" && (l = JSON.stringify(l)), S[s].textContent = String(l ?? "");
  });
}
function rt(e, r, d) {
  const s = V(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const f = /* @__PURE__ */ new Set();
  let i = r;
  d.type === "insert" && d.itemId && (i = r);
  let S = [...i];
  for (; ; ) {
    const l = V(e, S);
    if (l?.pathComponents && l.pathComponents.forEach((t) => {
      const n = s.components?.get(t);
      n && ((Array.isArray(n.reactiveType) ? n.reactiveType : [n.reactiveType || "component"]).includes("none") || f.add(n));
    }), S.length === 0) break;
    S.pop();
  }
  return s.components.forEach((l, t) => {
    if (f.has(l))
      return;
    const n = Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"];
    if (n.includes("all"))
      f.add(l);
    else if (n.includes("deps") && l.depsFunction) {
      const u = N(e, []), C = l.depsFunction(u);
      (C === !0 || Array.isArray(C) && !oe(l.prevDeps, C)) && (l.prevDeps = C, f.add(l));
    }
  }), f;
}
function nt(e, r, d, s) {
  let f;
  if (z(d)) {
    const { value: t } = K(e, r);
    f = d({ state: t, uuid: ee() });
  } else
    f = d;
  const i = xe(e, r, f, s);
  Ie(e, r, { bubble: !0 });
  const S = V(e, r);
  let l;
  return S?.arrayKeys, {
    type: "insert",
    newValue: f,
    shadowMeta: S,
    path: r,
    // Just the array path now
    itemId: i,
    insertAfterId: l
  };
}
function at(e, r) {
  const d = r.slice(0, -1), s = N(e, r);
  return Be(e, r), Ie(e, d, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: d };
}
function ot() {
  const e = /* @__PURE__ */ new Set(), r = [], d = [];
  for (const s of de) {
    if (s.status && s.updateType) {
      d.push(s);
      continue;
    }
    const f = s, i = f.type === "cut" ? null : f.newValue;
    f.shadowMeta?.signals?.length > 0 && r.push({ shadowMeta: f.shadowMeta, displayValue: i }), rt(
      f.stateKey,
      f.path,
      f
    ).forEach((l) => {
      e.add(l);
    });
  }
  d.length > 0 && Ge(d), r.forEach(({ shadowMeta: s, displayValue: f }) => {
    tt(s, f);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), de = [], Te = !1;
}
function st(e, r, d, s) {
  return (i, S, l, t) => {
    f(e, S, i, l);
  };
  function f(i, S, l, t) {
    let n;
    switch (t.updateType) {
      case "update":
        n = et(i, S, l);
        break;
      case "insert":
        n = nt(i, S, l);
        break;
      case "cut":
        n = at(i, S);
        break;
    }
    n.stateKey = i, n.path = S, de.push(n), Ke();
    const u = {
      timeStamp: Date.now(),
      stateKey: i,
      path: S,
      updateType: t.updateType,
      status: "new",
      oldValue: n.oldValue,
      newValue: n.newValue ?? null,
      itemId: n.itemId,
      insertAfterId: n.insertAfterId
    };
    de.push(u), n.newValue !== void 0 && Qe(
      n.newValue,
      i,
      s.current,
      d
    ), s.current?.middleware && s.current.middleware({ update: u }), t.sync !== !1 && r.current?.connected && r.current.updateState({ operation: u });
  }
}
function it(e, {
  stateKey: r,
  localStorage: d,
  formElements: s,
  reactiveDeps: f,
  reactiveType: i,
  componentId: S,
  defaultState: l,
  syncUpdate: t,
  dependencies: n,
  serverState: u,
  __useSync: C
} = {}) {
  const [x, O] = te({}), { sessionId: U } = _e();
  let G = !r;
  const [w] = te(r ?? ee()), m = R(S ?? ee()), Y = R(
    null
  );
  Y.current = W(w) ?? null, q(() => {
    if (t && t.stateKey === w && t.path?.[0]) {
      const g = `${t.stateKey}:${t.path.join(".")}`;
      He(g, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]);
  const a = we(
    (g) => {
      const p = g ? { ...W(w), ...g } : W(w), I = p?.defaultState || l || e;
      if (p?.serverState?.status === "success" && p?.serverState?.data !== void 0)
        return {
          value: p.serverState.data,
          source: "server",
          timestamp: p.serverState.timestamp || Date.now()
        };
      if (p?.localStorage?.key && U) {
        const b = z(p.localStorage.key) ? p.localStorage.key(I) : p.localStorage.key, _ = fe(
          `${U}-${w}-${b}`
        );
        if (_ && _.lastUpdated > (p?.serverState?.timestamp || 0))
          return {
            value: _.state,
            source: "localStorage",
            timestamp: _.lastUpdated
          };
      }
      return {
        value: I || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, l, e, U]
  );
  q(() => {
    u && u.status === "success" && u.data !== void 0 && Ee(w, u);
  }, [u, w]), q(() => T.getState().subscribeToPath(w, (A) => {
    if (A?.type === "SERVER_STATE_UPDATE") {
      const p = A.serverState;
      if (p?.status !== "success" || p.data === void 0)
        return;
      he(w, { serverState: p });
      const I = typeof p.merge == "object" ? p.merge : p.merge === !0 ? { strategy: "append", key: "id" } : null, M = N(w, []), b = p.data;
      if (I && I.strategy === "append" && "key" in I && Array.isArray(M) && Array.isArray(b)) {
        const _ = I.key;
        if (!_) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const E = new Set(
          M.map((Z) => Z[_])
        ), $ = b.filter(
          (Z) => !E.has(Z[_])
        );
        $.length > 0 && Le(w, [], $);
        const F = N(w, []);
        ue(
          w,
          [],
          F,
          p.timestamp || Date.now()
        );
      } else
        se(w, b), ue(
          w,
          [],
          b,
          p.timestamp || Date.now()
        );
      ie(w);
    }
  }), [w]), q(() => {
    const g = T.getState().getShadowMetadata(w, []);
    if (g && g.stateSource)
      return;
    const A = W(w), p = {
      syncEnabled: !!y && !!v,
      validationEnabled: !!(A?.validation?.zodSchemaV4 || A?.validation?.zodSchemaV3),
      localStorageEnabled: !!A?.localStorage?.key
    };
    if (J(w, [], {
      ...g,
      features: p
    }), A?.defaultState !== void 0 || l !== void 0) {
      const _ = A?.defaultState || l;
      A?.defaultState || he(w, {
        defaultState: _
      });
    }
    const { value: I, source: M, timestamp: b } = a();
    se(w, I), J(w, [], {
      stateSource: M,
      lastServerSync: M === "server" ? b : void 0,
      isDirty: M === "server" ? !1 : void 0,
      baseServerState: M === "server" ? I : void 0
    }), M === "server" && u && Ee(w, u), ie(w);
  }, [w, ...n || []]), ce(() => {
    G && he(w, {
      formElements: s,
      defaultState: l,
      localStorage: d,
      middleware: Y.current?.middleware
    });
    const g = `${w}////${m.current}`, A = V(w, []), p = A?.components || /* @__PURE__ */ new Map();
    return p.set(g, {
      forceUpdate: () => O({}),
      reactiveType: i ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: f || void 0,
      deps: f ? f(N(w, [])) : [],
      prevDeps: f ? f(N(w, [])) : []
    }), J(w, [], {
      ...A,
      components: p
    }), O({}), () => {
      const I = V(w, []), M = I?.components?.get(g);
      M?.paths && M.paths.forEach((b) => {
        const E = b.split(".").slice(1), $ = T.getState().getShadowMetadata(w, E);
        $?.pathComponents && $.pathComponents.size === 0 && (delete $.pathComponents, T.getState().setShadowMetadata(w, E, $));
      }), I?.components && J(w, [], I);
    };
  }, []);
  const o = R(null), c = st(
    w,
    o,
    U,
    Y
  );
  T.getState().initialStateGlobal[w] || ke(w, e);
  const h = pe(() => Ve(
    w,
    c,
    m.current,
    U
  ), [w, U]), y = C, v = Y.current?.syncOptions;
  return console.log("syncOpt", v), y && (o.current = y(
    h,
    v ?? {}
  )), h;
}
const ct = (e, r, d) => {
  let s = V(e, r)?.arrayKeys || [];
  const f = d?.transforms;
  if (!f || f.length === 0)
    return s;
  for (const i of f)
    if (i.type === "filter") {
      const S = [];
      s.forEach((l, t) => {
        const n = N(e, [...r, l]);
        i.fn(n, t) && S.push(l);
      }), s = S;
    } else i.type === "sort" && s.sort((S, l) => {
      const t = N(e, [...r, S]), n = N(e, [...r, l]);
      return i.fn(t, n);
    });
  return s;
}, ve = (e, r, d) => {
  const s = `${e}////${r}`, i = V(e, [])?.components?.get(s);
  !i || i.reactiveType === "none" || !(Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType]).includes("component") || qe(e, d, s);
}, ae = (e, r, d) => {
  const s = V(e, []), f = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((S, l) => {
    (Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"]).includes("all") && (S.forceUpdate(), f.add(l));
  }), V(e, [
    ...r,
    "getSelected"
  ])?.pathComponents?.forEach((S) => {
    s?.components?.get(S)?.forceUpdate();
  });
  const i = V(e, r);
  for (let S of i?.arrayKeys || []) {
    const l = S + ".selected", t = V(e, l.split(".").slice(1));
    S == d && t?.pathComponents?.forEach((n) => {
      s?.components?.get(n)?.forceUpdate();
    });
  }
};
function K(e, r, d) {
  const s = V(e, r), f = r.length > 0 ? r.join(".") : "root", i = d?.arrayViews?.[f];
  if (Array.isArray(i) && i.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const S = N(e, r, i);
  return {
    shadowMeta: s,
    value: S,
    arrayKeys: s?.arrayKeys
  };
}
function Ve(e, r, d, s) {
  const f = /* @__PURE__ */ new Map();
  function i({
    path: t = [],
    meta: n,
    componentId: u
  }) {
    const C = n ? JSON.stringify(n.arrayViews || n.transforms) : "", x = t.join(".") + ":" + u + ":" + C;
    if (f.has(x))
      return f.get(x);
    const O = [e, ...t].join("."), U = {
      get(w, m) {
        if (t.length === 0 && m in S)
          return S[m];
        if (!m.startsWith("$")) {
          const a = [...t, m];
          return i({
            path: a,
            componentId: u,
            meta: n
          });
        }
        if (m === "$_rebuildStateShape")
          return i;
        if (m === "$sync" && t.length === 0)
          return async function() {
            const a = T.getState().getInitialOptions(e), o = a?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const c = T.getState().getShadowValue(e, []), h = a?.validation?.key;
            try {
              const y = await o.action(c);
              if (y && !y.success && y.errors, y?.success) {
                const v = T.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...v,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: c
                  // Update base server state
                }), o.onSuccess && o.onSuccess(y.data);
              } else !y?.success && o.onError && o.onError(y.error);
              return y;
            } catch (y) {
              return o.onError && o.onError(y), { success: !1, error: y };
            }
          };
        if (m === "$_status" || m === "$getStatus") {
          const a = () => {
            const { shadowMeta: o, value: c } = K(e, t, n);
            return console.log("getStatusFunc", t, o, c), o?.isDirty === !0 ? "dirty" : o?.stateSource === "server" || o?.isDirty === !1 ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" || c !== void 0 ? "fresh" : "unknown";
          };
          return m === "$_status" ? a() : a;
        }
        if (m === "$removeStorage")
          return () => {
            const a = T.getState().initialStateGlobal[e], o = W(e), c = z(o?.localStorage?.key) ? o.localStorage.key(a) : o?.localStorage?.key, h = `${s}-${e}-${c}`;
            h && localStorage.removeItem(h);
          };
        if (m === "$showValidationErrors")
          return () => {
            const { shadowMeta: a } = K(e, t, n);
            return a?.validation?.status === "INVALID" && a.validation.errors.length > 0 ? a.validation.errors.filter((o) => o.severity === "error").map((o) => o.message) : [];
          };
        if (m === "$getSelected")
          return () => {
            const a = [e, ...t].join(".");
            ve(e, u, [
              ...t,
              "getSelected"
            ]);
            const o = T.getState().selectedIndicesMap.get(a);
            if (!o)
              return;
            const c = t.join("."), h = n?.arrayViews?.[c], y = o.split(".").pop();
            if (!(h && !h.includes(y) || N(
              e,
              o.split(".").slice(1)
            ) === void 0))
              return i({
                path: o.split(".").slice(1),
                componentId: u,
                meta: n
              });
          };
        if (m === "$getSelectedIndex")
          return () => {
            const a = e + "." + t.join(".");
            t.join(".");
            const o = T.getState().selectedIndicesMap.get(a);
            if (!o)
              return -1;
            const { keys: c } = B(e, t, n);
            if (!c)
              return -1;
            const h = o.split(".").pop();
            return c.indexOf(h);
          };
        if (m === "$clearSelected")
          return ae(e, t), () => {
            ze({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (m === "$useVirtualView")
          return (a) => {
            const {
              itemHeight: o = 50,
              overscan: c = 6,
              stickToBottom: h = !1,
              scrollStickTolerance: y = 75
            } = a, v = R(null), [g, A] = te({
              startIndex: 0,
              endIndex: 10
            }), [p, I] = te({}), M = R(!0);
            q(() => {
              const P = setInterval(() => {
                I({});
              }, 1e3);
              return () => clearInterval(P);
            }, []);
            const b = R({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), _ = R(
              /* @__PURE__ */ new Map()
            ), { keys: E } = B(e, t, n);
            q(() => {
              const P = [e, ...t].join("."), k = T.getState().subscribeToPath(P, (j) => {
                j.type !== "GET_SELECTED" && j.type;
              });
              return () => {
                k();
              };
            }, [u, e, t.join(".")]), ce(() => {
              if (h && E.length > 0 && v.current && !b.current.isUserScrolling && M.current) {
                const P = v.current, k = () => {
                  if (P.clientHeight > 0) {
                    const j = Math.ceil(
                      P.clientHeight / o
                    ), L = E.length - 1, D = Math.max(
                      0,
                      L - j - c
                    );
                    A({ startIndex: D, endIndex: L }), requestAnimationFrame(() => {
                      X("instant"), M.current = !1;
                    });
                  } else
                    requestAnimationFrame(k);
                };
                k();
              }
            }, [E.length, h, o, c]);
            const $ = R(g);
            ce(() => {
              $.current = g;
            }, [g]);
            const F = R(E);
            ce(() => {
              F.current = E;
            }, [E]);
            const Z = we(() => {
              const P = v.current;
              if (!P) return;
              const k = P.scrollTop, { scrollHeight: j, clientHeight: L } = P, D = b.current, re = j - (k + L), Se = D.isNearBottom;
              D.isNearBottom = re <= y, k < D.lastScrollTop ? (D.scrollUpCount++, D.scrollUpCount > 3 && Se && (D.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : D.isNearBottom && (D.isUserScrolling = !1, D.scrollUpCount = 0), D.lastScrollTop = k;
              let Q = 0;
              for (let H = 0; H < E.length; H++) {
                const ge = E[H], ye = _.current.get(ge);
                if (ye && ye.offset + ye.height > k) {
                  Q = H;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                _.current,
                Q,
                g
              ), Q !== g.startIndex && g.startIndex != 0) {
                const H = Math.ceil(L / o);
                A({
                  startIndex: Math.max(0, Q - c),
                  endIndex: Math.min(
                    E.length - 1,
                    Q + H + c
                  )
                });
              }
            }, [
              E.length,
              g.startIndex,
              o,
              c,
              y
            ]);
            q(() => {
              const P = v.current;
              if (P)
                return P.addEventListener("scroll", Z, {
                  passive: !0
                }), () => {
                  P.removeEventListener("scroll", Z);
                };
            }, [Z, h]);
            const X = we(
              (P = "smooth") => {
                const k = v.current;
                if (!k) return;
                b.current.isUserScrolling = !1, b.current.isNearBottom = !0, b.current.scrollUpCount = 0;
                const j = () => {
                  const L = (D = 0) => {
                    if (D > 5) return;
                    const re = k.scrollHeight, Se = k.scrollTop, Q = k.clientHeight;
                    Se + Q >= re - 1 || (k.scrollTo({
                      top: re,
                      behavior: P
                    }), setTimeout(() => {
                      const H = k.scrollHeight, ge = k.scrollTop;
                      (H !== re || ge + Q < H - 1) && L(D + 1);
                    }, 50));
                  };
                  L();
                };
                "requestIdleCallback" in window ? requestIdleCallback(j, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(j);
                });
              },
              []
            );
            return q(() => {
              if (!h || !v.current) return;
              const P = v.current, k = b.current;
              let j;
              const L = () => {
                clearTimeout(j), j = setTimeout(() => {
                  !k.isUserScrolling && k.isNearBottom && X(
                    M.current ? "instant" : "smooth"
                  );
                }, 100);
              }, D = new MutationObserver(() => {
                k.isUserScrolling || L();
              });
              return D.observe(P, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), M.current ? setTimeout(() => {
                X("instant");
              }, 0) : L(), () => {
                clearTimeout(j), D.disconnect();
              };
            }, [h, E.length, X]), {
              virtualState: pe(() => {
                const P = Array.isArray(E) ? E.slice(g.startIndex, g.endIndex + 1) : [], k = t.length > 0 ? t.join(".") : "root";
                return i({
                  path: t,
                  componentId: u,
                  meta: {
                    ...n,
                    arrayViews: { [k]: P },
                    serverStateIsUpStream: !0
                  }
                });
              }, [g.startIndex, g.endIndex, E, n]),
              virtualizerProps: {
                outer: {
                  ref: v,
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
                    transform: `translateY(${_.current.get(E[g.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: X,
              scrollToIndex: (P, k = "smooth") => {
                if (v.current && E[P]) {
                  const j = _.current.get(E[P])?.offset || 0;
                  v.current.scrollTo({ top: j, behavior: k });
                }
              }
            };
          };
        if (m === "$stateMap")
          return (a) => {
            const { value: o, keys: c } = B(
              e,
              t,
              n
            );
            if (ve(e, u, t), !c || !Array.isArray(o))
              return [];
            const h = i({
              path: t,
              componentId: u,
              meta: n
            });
            return o.map((y, v) => {
              const g = c[v];
              if (!g) return;
              const A = [...t, g], p = i({
                path: A,
                // This now correctly points to the item in the shadow store.
                componentId: u,
                meta: n
              });
              return a(p, v, h);
            });
          };
        if (m === "$stateFilter")
          return (a) => {
            const o = t.length > 0 ? t.join(".") : "root", { keys: c, value: h } = B(
              e,
              t,
              n
            );
            if (!Array.isArray(h))
              throw new Error("stateFilter can only be used on arrays");
            const y = [];
            return h.forEach((v, g) => {
              if (a(v, g)) {
                const A = c[g];
                A && y.push(A);
              }
            }), i({
              path: t,
              componentId: u,
              meta: {
                ...n,
                arrayViews: {
                  ...n?.arrayViews || {},
                  [o]: y
                },
                transforms: [
                  ...n?.transforms || [],
                  { type: "filter", fn: a, path: t }
                ]
              }
            });
          };
        if (m === "$stateSort")
          return (a) => {
            const o = t.length > 0 ? t.join(".") : "root", { value: c, keys: h } = B(
              e,
              t,
              n
            );
            if (!Array.isArray(c) || !h)
              throw new Error("No array keys found for sorting");
            const y = c.map((g, A) => ({
              item: g,
              key: h[A]
            }));
            y.sort((g, A) => a(g.item, A.item));
            const v = y.map((g) => g.key);
            return i({
              path: t,
              componentId: u,
              meta: {
                ...n,
                arrayViews: {
                  ...n?.arrayViews || {},
                  [o]: v
                },
                transforms: [
                  ...n?.transforms || [],
                  { type: "sort", fn: a, path: t }
                ]
              }
            });
          };
        if (m === "$stream")
          return function(a = {}) {
            const {
              bufferSize: o = 100,
              flushInterval: c = 100,
              bufferStrategy: h = "accumulate",
              store: y,
              onFlush: v
            } = a;
            let g = [], A = !1, p = null;
            const I = ($) => {
              if (!A) {
                if (h === "sliding" && g.length >= o)
                  g.shift();
                else if (h === "dropping" && g.length >= o)
                  return;
                g.push($), g.length >= o && M();
              }
            }, M = () => {
              if (g.length === 0) return;
              const $ = [...g];
              if (g = [], y) {
                const F = y($);
                F !== void 0 && (Array.isArray(F) ? F : [F]).forEach((X) => {
                  r(X, t, {
                    updateType: "insert"
                  });
                });
              } else
                $.forEach((F) => {
                  r(F, t, {
                    updateType: "insert"
                  });
                });
              v?.($);
            };
            c > 0 && (p = setInterval(M, c));
            const b = ee(), _ = V(e, t) || {}, E = _.streams || /* @__PURE__ */ new Map();
            return E.set(b, { buffer: g, flushTimer: p }), J(e, t, {
              ..._,
              streams: E
            }), {
              write: ($) => I($),
              writeMany: ($) => $.forEach(I),
              flush: () => M(),
              pause: () => {
                A = !0;
              },
              resume: () => {
                A = !1, g.length > 0 && M();
              },
              close: () => {
                M(), p && clearInterval(p);
                const $ = T.getState().getShadowMetadata(e, t);
                $?.streams && $.streams.delete(b);
              }
            };
          };
        if (m === "$stateList")
          return (a) => /* @__PURE__ */ ne(() => {
            const c = R(/* @__PURE__ */ new Map()), [h, y] = te({}), v = t.length > 0 ? t.join(".") : "root", g = ct(e, t, n), A = pe(() => ({
              ...n,
              arrayViews: {
                ...n?.arrayViews || {},
                [v]: g
              }
            }), [n, v, g]), { value: p } = B(
              e,
              t,
              A
            );
            if (q(() => {
              const b = T.getState().subscribeToPath(O, (_) => {
                if (_.type === "GET_SELECTED")
                  return;
                const $ = T.getState().getShadowMetadata(e, t)?.transformCaches;
                if ($)
                  for (const F of $.keys())
                    F.startsWith(u) && $.delete(F);
                (_.type === "INSERT" || _.type === "INSERT_MANY" || _.type === "REMOVE" || _.type === "CLEAR_SELECTION" || _.type === "SERVER_STATE_UPDATE" && !n?.serverStateIsUpStream) && y({});
              });
              return () => {
                b();
              };
            }, [u, O]), !Array.isArray(p))
              return null;
            const I = i({
              path: t,
              componentId: u,
              meta: A
              // Use updated meta here
            }), M = p.map((b, _) => {
              const E = g[_];
              if (!E)
                return null;
              let $ = c.current.get(E);
              $ || ($ = ee(), c.current.set(E, $));
              const F = [...t, E];
              return Ae(je, {
                key: E,
                stateKey: e,
                itemComponentId: $,
                itemPath: F,
                localIndex: _,
                arraySetter: I,
                rebuildStateShape: i,
                renderFn: a
              });
            });
            return /* @__PURE__ */ ne(Pe, { children: M });
          }, {});
        if (m === "$stateFlattenOn")
          return (a) => {
            const o = t.length > 0 ? t.join(".") : "root", c = n?.arrayViews?.[o], h = T.getState().getShadowValue(e, t, c);
            return Array.isArray(h) ? i({
              path: [...t, "[*]", a],
              componentId: u,
              meta: n
            }) : [];
          };
        if (m === "$index")
          return (a) => {
            const o = t.length > 0 ? t.join(".") : "root", c = n?.arrayViews?.[o];
            if (c) {
              const v = c[a];
              return v ? i({
                path: [...t, v],
                componentId: u,
                meta: n
              }) : void 0;
            }
            const h = V(e, t);
            if (!h?.arrayKeys) return;
            const y = h.arrayKeys[a];
            if (y)
              return i({
                path: [...t, y],
                componentId: u,
                meta: n
              });
          };
        if (m === "$last")
          return () => {
            const { keys: a } = B(e, t, n);
            if (!a || a.length === 0)
              return;
            const o = a[a.length - 1];
            if (!o)
              return;
            const c = [...t, o];
            return i({
              path: c,
              componentId: u,
              meta: n
            });
          };
        if (m === "$insert")
          return (a, o) => {
            r(a, t, { updateType: "insert" });
          };
        if (m === "$uniqueInsert")
          return (a, o, c) => {
            const { value: h } = K(
              e,
              t,
              n
            ), y = z(a) ? a(h) : a;
            let v = null;
            if (!h.some((A) => {
              const p = o ? o.every(
                (I) => oe(A[I], y[I])
              ) : oe(A, y);
              return p && (v = A), p;
            }))
              r(y, t, { updateType: "insert" });
            else if (c && v) {
              const A = c(v), p = h.map(
                (I) => oe(I, v) ? A : I
              );
              r(p, t, {
                updateType: "update"
              });
            }
          };
        if (m === "$cut")
          return (a, o) => {
            const c = V(e, t);
            if (!c?.arrayKeys || c.arrayKeys.length === 0)
              return;
            const h = a === -1 ? c.arrayKeys.length - 1 : a !== void 0 ? a : c.arrayKeys.length - 1, y = c.arrayKeys[h];
            y && r(null, [...t, y], {
              updateType: "cut"
            });
          };
        if (m === "$cutSelected")
          return () => {
            const a = [e, ...t].join("."), { keys: o } = B(e, t, n);
            if (!o || o.length === 0)
              return;
            const c = T.getState().selectedIndicesMap.get(a);
            if (!c)
              return;
            const h = c.split(".").pop();
            if (!o.includes(h))
              return;
            const y = c.split(".").slice(1);
            T.getState().clearSelectedIndex({ arrayKey: a });
            const v = y.slice(0, -1);
            ae(e, v), r(null, y, {
              updateType: "cut"
            });
          };
        if (m === "$cutByValue")
          return (a) => {
            const {
              isArray: o,
              value: c,
              keys: h
            } = B(e, t, n);
            if (!o) return;
            const y = me(c, h, (v) => v === a);
            y && r(null, [...t, y.key], {
              updateType: "cut"
            });
          };
        if (m === "$toggleByValue")
          return (a) => {
            const {
              isArray: o,
              value: c,
              keys: h
            } = B(e, t, n);
            if (!o) return;
            const y = me(c, h, (v) => v === a);
            if (y) {
              const v = [...t, y.key];
              r(null, v, {
                updateType: "cut"
              });
            } else
              r(a, t, { updateType: "insert" });
          };
        if (m === "$findWith")
          return (a, o) => {
            const { isArray: c, value: h, keys: y } = B(e, t, n);
            if (!c)
              throw new Error("findWith can only be used on arrays");
            const v = me(
              h,
              y,
              (g) => g?.[a] === o
            );
            return i(v ? {
              path: [...t, v.key],
              componentId: u,
              meta: n
            } : {
              path: [...t, `not_found_${ee()}`],
              componentId: u,
              meta: n
            });
          };
        if (m === "$cutThis") {
          const { value: a } = K(e, t, n), o = t.slice(0, -1);
          return ae(e, o), () => {
            r(a, t, { updateType: "cut" });
          };
        }
        if (m === "$get")
          return () => {
            ve(e, u, t);
            const { value: a } = K(e, t, n);
            return a;
          };
        if (m === "$$derive")
          return (a) => be({
            _stateKey: e,
            _path: t,
            _effect: a.toString(),
            _meta: n
          });
        if (m === "$$get")
          return () => be({ _stateKey: e, _path: t, _meta: n });
        if (m === "$lastSynced") {
          const a = `${e}:${t.join(".")}`;
          return Je(a);
        }
        if (m == "getLocalStorage")
          return (a) => fe(s + "-" + e + "-" + a);
        if (m === "$isSelected") {
          const a = t.slice(0, -1);
          if (V(e, a)?.arrayKeys) {
            const c = e + "." + a.join("."), h = T.getState().selectedIndicesMap.get(c), y = e + "." + t.join(".");
            return h === y;
          }
          return;
        }
        if (m === "$setSelected")
          return (a) => {
            const o = t.slice(0, -1), c = e + "." + o.join("."), h = e + "." + t.join(".");
            ae(e, o, void 0), T.getState().selectedIndicesMap.get(c), a && T.getState().setSelectedIndex(c, h);
          };
        if (m === "$toggleSelected")
          return () => {
            const a = t.slice(0, -1), o = e + "." + a.join("."), c = e + "." + t.join(".");
            T.getState().selectedIndicesMap.get(o) === c ? T.getState().clearSelectedIndex({ arrayKey: o }) : T.getState().setSelectedIndex(o, c), ae(e, a);
          };
        if (m === "$_componentId")
          return u;
        if (t.length == 0) {
          if (m === "$addZodValidation")
            return (a, o) => {
              a.forEach((c) => {
                const h = T.getState().getShadowMetadata(e, c.path) || {};
                T.getState().setShadowMetadata(e, c.path, {
                  ...h,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: o || "client",
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
            return (a) => {
              if (!a)
                throw new Error("clearZodValidation requires a path");
              const o = V(e, a) || {};
              J(e, a, {
                ...o,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (m === "$applyOperation")
            return (a) => {
              const o = a.validation || [];
              if (!a || !a.path) {
                console.error(
                  "Invalid operation received by $applyOperation:",
                  a
                );
                return;
              }
              const c = a.path, h = T.getState().getShadowMetadata(e, c) || {}, y = o.map((v) => ({
                source: "sync_engine",
                message: v.message,
                severity: "warning",
                code: v.code
              }));
              console.log("updatePath", c), T.getState().setShadowMetadata(e, c, {
                ...h,
                validation: {
                  status: y.length > 0 ? "INVALID" : "VALID",
                  errors: y,
                  lastValidated: Date.now()
                }
              }), r(a.newValue, c, {
                updateType: a.updateType,
                sync: !1
              });
            };
          if (m === "$applyJsonPatch")
            return (a) => {
              const o = T.getState(), c = o.getShadowMetadata(e, []);
              if (!c?.components) return;
              const h = (v) => !v || v === "/" ? [] : v.split("/").slice(1).map((g) => g.replace(/~1/g, "/").replace(/~0/g, "~")), y = /* @__PURE__ */ new Set();
              for (const v of a) {
                const g = h(v.path);
                switch (v.op) {
                  case "add":
                  case "replace": {
                    const { value: A } = v;
                    o.updateShadowAtPath(e, g, A), o.markAsDirty(e, g, { bubble: !0 });
                    let p = [...g];
                    for (; ; ) {
                      const I = o.getShadowMetadata(
                        e,
                        p
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((M) => {
                        if (!y.has(M)) {
                          const b = c.components?.get(M);
                          b && (b.forceUpdate(), y.add(M));
                        }
                      }), p.length === 0) break;
                      p.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const A = g.slice(0, -1);
                    o.removeShadowArrayElement(e, g), o.markAsDirty(e, A, { bubble: !0 });
                    let p = [...A];
                    for (; ; ) {
                      const I = o.getShadowMetadata(
                        e,
                        p
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((M) => {
                        if (!y.has(M)) {
                          const b = c.components?.get(M);
                          b && (b.forceUpdate(), y.add(M));
                        }
                      }), p.length === 0) break;
                      p.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (m === "$getComponents")
            return () => V(e, [])?.components;
          if (m === "$getAllFormRefs")
            return () => Me.getState().getFormRefsByStateKey(e);
        }
        if (m === "$getFormRef")
          return () => Me.getState().getFormRef(e + "." + t.join("."));
        if (m === "$validationWrapper")
          return ({
            children: a,
            hideMessage: o
          }) => /* @__PURE__ */ ne(
            Oe,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: a
            }
          );
        if (m === "$_stateKey") return e;
        if (m === "$_path") return t;
        if (m === "$update")
          return (a) => (r(a, t, { updateType: "update" }), {
            synced: () => {
              const o = T.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...o,
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
          const { value: a } = K(
            e,
            t,
            n
          );
          if (typeof a != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            r(!a, t, {
              updateType: "update"
            });
          };
        }
        if (m === "$isolate")
          return (a) => /* @__PURE__ */ ne(
            Ue,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              renderFn: a
            }
          );
        if (m === "$formElement")
          return (a, o) => /* @__PURE__ */ ne(
            Fe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              setState: r,
              formOpts: o,
              renderFn: a
            }
          );
        const Y = [...t, m];
        return i({
          path: Y,
          componentId: u,
          meta: n
        });
      }
    }, G = new Proxy({}, U);
    return f.set(x, G), G;
  }
  const S = {
    $revertToInitialState: (t) => {
      const n = T.getState().getShadowMetadata(e, []);
      let u;
      n?.stateSource === "server" && n.baseServerState ? u = n.baseServerState : u = T.getState().initialStateGlobal[e], We(e), se(e, u), i({
        path: [],
        componentId: d
      });
      const C = W(e), x = z(C?.localStorage?.key) ? C?.localStorage?.key(u) : C?.localStorage?.key, O = `${s}-${e}-${x}`;
      return O && localStorage.removeItem(O), ie(e), u;
    },
    $updateInitialState: (t) => {
      const n = Ve(
        e,
        r,
        d,
        s
      ), u = T.getState().initialStateGlobal[e], C = W(e), x = z(C?.localStorage?.key) ? C?.localStorage?.key(u) : C?.localStorage?.key, O = `${s}-${e}-${x}`;
      return localStorage.getItem(O) && localStorage.removeItem(O), Ce(() => {
        ke(e, t), se(e, t);
        const U = T.getState().getShadowMetadata(e, []);
        U && U?.components?.forEach((G) => {
          G.forceUpdate();
        });
      }), {
        fetchId: (U) => n.$get()[U]
      };
    }
  };
  return i({
    componentId: d,
    path: []
  });
}
function be(e) {
  return Ae(lt, { proxy: e });
}
function lt({
  proxy: e
}) {
  const r = R(null), d = R(null), s = R(!1), f = `${e._stateKey}-${e._path.join(".")}`, i = e._path.length > 0 ? e._path.join(".") : "root", S = e._meta?.arrayViews?.[i], l = N(e._stateKey, e._path, S);
  return q(() => {
    const t = r.current;
    if (!t || s.current) return;
    const n = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", f);
        return;
      }
      const u = t.parentElement, x = Array.from(u.childNodes).indexOf(t);
      let O = u.getAttribute("data-parent-id");
      O || (O = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", O)), d.current = `instance-${crypto.randomUUID()}`;
      const U = T.getState().getShadowMetadata(e._stateKey, e._path) || {}, G = U.signals || [];
      G.push({
        instanceId: d.current,
        parentId: O,
        position: x,
        effect: e._effect
      }), T.getState().setShadowMetadata(e._stateKey, e._path, {
        ...U,
        signals: G
      });
      let w = l;
      if (e._effect)
        try {
          w = new Function(
            "state",
            `return (${e._effect})(state)`
          )(l);
        } catch (Y) {
          console.error("Error evaluating effect function:", Y);
        }
      w !== null && typeof w == "object" && (w = JSON.stringify(w));
      const m = document.createTextNode(String(w ?? ""));
      t.replaceWith(m), s.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(n), d.current) {
        const u = T.getState().getShadowMetadata(e._stateKey, e._path) || {};
        u.signals && (u.signals = u.signals.filter(
          (C) => C.instanceId !== d.current
        ), T.getState().setShadowMetadata(e._stateKey, e._path, u));
      }
    };
  }, []), Ae("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": f
  });
}
export {
  be as $cogsSignal,
  wt as addStateOptions,
  Ze as createCogsState,
  pt as createCogsStateFromSync,
  it as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
