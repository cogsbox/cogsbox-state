"use client";
import { jsx as ne, Fragment as Pe } from "react/jsx-runtime";
import { useState as te, useRef as R, useEffect as q, useCallback as we, useLayoutEffect as ce, useMemo as pe, createElement as Ie, startTransition as Ce } from "react";
import { transformStateFunc as De, isFunction as H, isDeepEqual as oe } from "./utility.js";
import { ValidationWrapper as Oe, IsolatedComponentWrapper as Ue, FormElementWrapper as Fe, MemoizedCogsItemWrapper as je } from "./Components.jsx";
import Ne from "superjson";
import { v4 as ee } from "uuid";
import { getGlobalStore as T, formRefStore as Me, shadowStateStore as Re } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
const {
  getInitialOptions: W,
  updateInitialStateGlobal: ke,
  getShadowMetadata: V,
  setShadowMetadata: J,
  getShadowValue: N,
  initializeShadowState: se,
  initializeAndMergeShadowState: xe,
  updateShadowAtPath: Le,
  insertShadowArrayElement: Be,
  insertManyShadowArrayElements: qe,
  removeShadowArrayElement: We,
  setInitialStateOptions: le,
  setServerStateUpdate: $e,
  markAsDirty: Ae,
  addPathComponent: ze,
  clearSelectedIndexesForState: Ge,
  addStateLog: He,
  setSyncInfo: Je,
  clearSelectedIndex: Ye,
  getSyncInfo: Ze,
  notifyPathSubscribers: Qe
  // Note: The old functions are no longer imported under their original names
} = T.getState();
function B(e, r, d) {
  const s = V(e, r);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, r), keys: [] };
  const i = r.length > 0 ? r.join(".") : "root", f = d?.arrayViews?.[i] ?? s.arrayKeys;
  return Array.isArray(f) && f.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, r, f), keys: f ?? [] };
}
function me(e, r, d) {
  for (let s = 0; s < e.length; s++)
    if (d(e[s], s)) {
      const S = r[s];
      if (S)
        return { key: S, index: s, value: e[s] };
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
function Ee({
  stateKey: e,
  options: r,
  initialOptionsPart: d
}) {
  const s = W(e) || {};
  let i = { ...d[e] || {}, ...s }, f = !1;
  if (r) {
    const l = (t, n) => {
      for (const u in n)
        n.hasOwnProperty(u) && (n[u] instanceof Object && !Array.isArray(n[u]) && t[u] instanceof Object ? oe(t[u], n[u]) || (l(t[u], n[u]), f = !0) : t[u] !== n[u] && (t[u] = n[u], f = !0));
      return t;
    };
    i = l(i, r);
  }
  i.syncOptions && (!r || !r.hasOwnProperty("syncOptions")) && (f = !0), (i.validation && i?.validation?.zodSchemaV4 || i?.validation?.zodSchemaV3) && (r?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || (i.validation.onBlur = "error")), f && le(e, i);
}
function Tt(e, { formElements: r, validation: d }) {
  return { initialState: e, formElements: r, validation: d };
}
const Xe = (e, r) => {
  let d = e;
  const [s, S] = De(d);
  r?.__fromSyncSchema && r?.__syncNotifications && T.getState().setInitialStateOptions("__notifications", r.__syncNotifications), r?.__fromSyncSchema && r?.__apiParamsMap && T.getState().setInitialStateOptions("__apiParamsMap", r.__apiParamsMap), Object.keys(s).forEach((l) => {
    let t = S[l] || {};
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
    Ee({
      stateKey: l,
      options: t,
      initialOptionsPart: S
    });
    const u = N(l, []) || s[l], C = t?.modifyState ? t.modifyState(u) : u;
    return lt(C, {
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
  function f(l, t) {
    Ee({ stateKey: l, options: t, initialOptionsPart: S }), t.localStorage && et(l, t), ie(l);
  }
  return { useCogsState: i, setCogsOptions: f };
};
function It(e, r) {
  const d = e.schemas, s = {}, S = {};
  for (const i in d) {
    const f = d[i];
    f?.relations && f?.schemas?.defaults ? s[i] = f.schemas.defaults : s[i] = f?.schemas?.defaults || {}, console.log("initialState", s), f?.api?.queryData?._paramType && (S[i] = f.api.queryData._paramType);
  }
  return Xe(s, {
    __fromSyncSchema: !0,
    __syncNotifications: e.notifications,
    __apiParamsMap: S,
    __useSync: r,
    __syncSchemas: d
  });
}
const Ke = (e, r, d, s, S) => {
  d?.log && console.log(
    "saving to localstorage",
    r,
    d.localStorage?.key,
    s
  );
  const i = H(d?.localStorage?.key) ? d.localStorage?.key(e) : d?.localStorage?.key;
  if (i && s) {
    const f = `${s}-${r}-${i}`;
    let l;
    try {
      l = fe(f)?.lastSyncedWithServer;
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
      f,
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
}, et = (e, r) => {
  const d = N(e, []), { sessionId: s } = _e(), S = H(r?.localStorage?.key) ? r.localStorage.key(d) : r?.localStorage?.key;
  if (S && s) {
    const i = fe(
      `${s}-${e}-${S}`
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
  const S = V(e, r);
  if (J(e, r, {
    ...S,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(d)) {
    const i = V(e, r);
    i?.arrayKeys && i.arrayKeys.forEach((f, l) => {
      const t = [...r, f], n = d[l];
      n !== void 0 && ue(
        e,
        t,
        n,
        s
      );
    });
  } else d && typeof d == "object" && d.constructor === Object && Object.keys(d).forEach((i) => {
    const f = [...r, i], l = d[i];
    ue(e, f, l, s);
  });
}
let de = [], Te = !1;
function tt() {
  Te || (Te = !0, queueMicrotask(it));
}
function rt(e, r, d) {
  const s = T.getState().getShadowValue(e, r), S = H(d) ? d(s) : d;
  Le(e, r, S), Ae(e, r, { bubble: !0 });
  const i = V(e, r);
  return {
    type: "update",
    oldValue: s,
    newValue: S,
    shadowMeta: i
  };
}
function nt(e, r) {
  e?.signals?.length && e.signals.forEach(({ parentId: d, position: s, effect: S }) => {
    const i = document.querySelector(`[data-parent-id="${d}"]`);
    if (!i) return;
    const f = Array.from(i.childNodes);
    if (!f[s]) return;
    let l = r;
    if (S && r !== null)
      try {
        l = new Function("state", `return (${S})(state)`)(
          r
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    l !== null && typeof l == "object" && (l = JSON.stringify(l)), f[s].textContent = String(l ?? "");
  });
}
function at(e, r, d) {
  const s = V(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const S = /* @__PURE__ */ new Set();
  let i = r;
  d.type === "insert" && d.itemId && (i = r);
  let f = [...i];
  for (; ; ) {
    const l = V(e, f);
    if (l?.pathComponents && l.pathComponents.forEach((t) => {
      const n = s.components?.get(t);
      n && ((Array.isArray(n.reactiveType) ? n.reactiveType : [n.reactiveType || "component"]).includes("none") || S.add(n));
    }), f.length === 0) break;
    f.pop();
  }
  return s.components.forEach((l, t) => {
    if (S.has(l))
      return;
    const n = Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"];
    if (n.includes("all"))
      S.add(l);
    else if (n.includes("deps") && l.depsFunction) {
      const u = N(e, []), C = l.depsFunction(u);
      (C === !0 || Array.isArray(C) && !oe(l.prevDeps, C)) && (l.prevDeps = C, S.add(l));
    }
  }), S;
}
function ot(e, r, d, s, S) {
  let i;
  if (H(d)) {
    const { value: n } = K(e, r);
    i = d({ state: n, uuid: ee() });
  } else
    i = d;
  const f = Be(
    e,
    r,
    i,
    s,
    S
  );
  Ae(e, r, { bubble: !0 });
  const l = V(e, r);
  let t;
  return l?.arrayKeys, {
    type: "insert",
    newValue: i,
    shadowMeta: l,
    path: r,
    itemId: f,
    insertAfterId: t
  };
}
function st(e, r) {
  const d = r.slice(0, -1), s = N(e, r);
  return We(e, r), Ae(e, d, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: d };
}
function it() {
  const e = /* @__PURE__ */ new Set(), r = [], d = [];
  for (const s of de) {
    if (s.status && s.updateType) {
      d.push(s);
      continue;
    }
    const S = s, i = S.type === "cut" ? null : S.newValue;
    S.shadowMeta?.signals?.length > 0 && r.push({ shadowMeta: S.shadowMeta, displayValue: i }), at(
      S.stateKey,
      S.path,
      S
    ).forEach((l) => {
      e.add(l);
    });
  }
  d.length > 0 && He(d), r.forEach(({ shadowMeta: s, displayValue: S }) => {
    nt(s, S);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), de = [], Te = !1;
}
function ct(e, r, d, s) {
  return (i, f, l, t) => {
    S(e, f, i, l);
  };
  function S(i, f, l, t) {
    let n;
    switch (t.updateType) {
      case "update":
        n = rt(i, f, l);
        break;
      case "insert":
        n = ot(
          i,
          f,
          l,
          void 0,
          t.itemId
        );
        break;
      case "cut":
        n = st(i, f);
        break;
    }
    n.stateKey = i, n.path = f, de.push(n), tt();
    const u = {
      timeStamp: Date.now(),
      stateKey: i,
      path: f,
      updateType: t.updateType,
      status: "new",
      oldValue: n.oldValue,
      newValue: n.newValue ?? null,
      itemId: n.itemId,
      insertAfterId: n.insertAfterId
    };
    de.push(u), n.newValue !== void 0 && Ke(
      n.newValue,
      i,
      s.current,
      d
    ), s.current?.middleware && s.current.middleware({ update: u }), t.sync !== !1 && r.current?.connected && r.current.updateState({ operation: u });
  }
}
function lt(e, {
  stateKey: r,
  localStorage: d,
  formElements: s,
  reactiveDeps: S,
  reactiveType: i,
  componentId: f,
  defaultState: l,
  syncUpdate: t,
  dependencies: n,
  serverState: u,
  __useSync: C
} = {}) {
  const [x, O] = te({}), { sessionId: U } = _e();
  let z = !r;
  const [w] = te(r ?? ee()), m = R(f ?? ee()), Y = R(
    null
  );
  Y.current = W(w) ?? null, q(() => {
    if (t && t.stateKey === w && t.path?.[0]) {
      const g = `${t.stateKey}:${t.path.join(".")}`;
      Je(g, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]);
  const a = we(
    (g) => {
      const p = g ? { ...W(w), ...g } : W(w), A = p?.defaultState || l || e;
      if (p?.serverState?.status === "success" && p?.serverState?.data !== void 0)
        return {
          value: p.serverState.data,
          source: "server",
          timestamp: p.serverState.timestamp || Date.now()
        };
      if (p?.localStorage?.key && U) {
        const b = H(p.localStorage.key) ? p.localStorage.key(A) : p.localStorage.key, _ = fe(
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
        value: A || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, l, e, U]
  );
  q(() => {
    u && u.status === "success" && u.data !== void 0 && $e(w, u);
  }, [u, w]), q(() => T.getState().subscribeToPath(w, (I) => {
    if (I?.type === "SERVER_STATE_UPDATE") {
      const p = I.serverState;
      if (p?.status !== "success" || p.data === void 0)
        return;
      he(w, { serverState: p });
      const A = typeof p.merge == "object" ? p.merge : p.merge === !0 ? { strategy: "append", key: "id" } : null, M = N(w, []), b = p.data;
      if (A && A.strategy === "append" && "key" in A && Array.isArray(M) && Array.isArray(b)) {
        const _ = A.key;
        if (!_) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const $ = new Set(
          M.map((Z) => Z[_])
        ), E = b.filter(
          (Z) => !$.has(Z[_])
        );
        E.length > 0 && qe(w, [], E);
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
    const I = W(w), p = {
      syncEnabled: !!y && !!v,
      validationEnabled: !!(I?.validation?.zodSchemaV4 || I?.validation?.zodSchemaV3),
      localStorageEnabled: !!I?.localStorage?.key
    };
    if (J(w, [], {
      ...g,
      features: p
    }), I?.defaultState !== void 0 || l !== void 0) {
      const _ = I?.defaultState || l;
      I?.defaultState || he(w, {
        defaultState: _
      });
    }
    const { value: A, source: M, timestamp: b } = a();
    se(w, A), J(w, [], {
      stateSource: M,
      lastServerSync: M === "server" ? b : void 0,
      isDirty: M === "server" ? !1 : void 0,
      baseServerState: M === "server" ? A : void 0
    }), M === "server" && u && $e(w, u), ie(w);
  }, [w, ...n || []]), ce(() => {
    z && he(w, {
      formElements: s,
      defaultState: l,
      localStorage: d,
      middleware: Y.current?.middleware
    });
    const g = `${w}////${m.current}`, I = V(w, []), p = I?.components || /* @__PURE__ */ new Map();
    return p.set(g, {
      forceUpdate: () => O({}),
      reactiveType: i ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: S || void 0,
      deps: S ? S(N(w, [])) : [],
      prevDeps: S ? S(N(w, [])) : []
    }), J(w, [], {
      ...I,
      components: p
    }), O({}), () => {
      const A = V(w, []), M = A?.components?.get(g);
      M?.paths && M.paths.forEach((b) => {
        const $ = b.split(".").slice(1), E = T.getState().getShadowMetadata(w, $);
        E?.pathComponents && E.pathComponents.size === 0 && (delete E.pathComponents, T.getState().setShadowMetadata(w, $, E));
      }), A?.components && J(w, [], A);
    };
  }, []);
  const o = R(null), c = ct(
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
  return y && (o.current = y(
    h,
    v ?? {}
  )), h;
}
const ut = (e, r, d) => {
  let s = V(e, r)?.arrayKeys || [];
  const S = d?.transforms;
  if (!S || S.length === 0)
    return s;
  for (const i of S)
    if (i.type === "filter") {
      const f = [];
      s.forEach((l, t) => {
        const n = N(e, [...r, l]);
        i.fn(n, t) && f.push(l);
      }), s = f;
    } else i.type === "sort" && s.sort((f, l) => {
      const t = N(e, [...r, f]), n = N(e, [...r, l]);
      return i.fn(t, n);
    });
  return s;
}, ve = (e, r, d) => {
  const s = `${e}////${r}`, i = V(e, [])?.components?.get(s);
  !i || i.reactiveType === "none" || !(Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType]).includes("component") || ze(e, d, s);
}, ae = (e, r, d) => {
  const s = V(e, []), S = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((f, l) => {
    (Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"]).includes("all") && (f.forceUpdate(), S.add(l));
  }), V(e, [
    ...r,
    "getSelected"
  ])?.pathComponents?.forEach((f) => {
    s?.components?.get(f)?.forceUpdate();
  });
  const i = V(e, r);
  for (let f of i?.arrayKeys || []) {
    const l = f + ".selected", t = V(e, l.split(".").slice(1));
    f == d && t?.pathComponents?.forEach((n) => {
      s?.components?.get(n)?.forceUpdate();
    });
  }
};
function K(e, r, d) {
  const s = V(e, r), S = r.length > 0 ? r.join(".") : "root", i = d?.arrayViews?.[S];
  if (Array.isArray(i) && i.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const f = N(e, r, i);
  return {
    shadowMeta: s,
    value: f,
    arrayKeys: s?.arrayKeys
  };
}
function Ve(e, r, d, s) {
  const S = /* @__PURE__ */ new Map();
  function i({
    path: t = [],
    meta: n,
    componentId: u
  }) {
    const C = n ? JSON.stringify(n.arrayViews || n.transforms) : "", x = t.join(".") + ":" + u + ":" + C;
    if (S.has(x))
      return S.get(x);
    const O = [e, ...t].join("."), U = {
      get(w, m) {
        if (t.length === 0 && m in f)
          return f[m];
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
            const a = T.getState().initialStateGlobal[e], o = W(e), c = H(o?.localStorage?.key) ? o.localStorage.key(a) : o?.localStorage?.key, h = `${s}-${e}-${c}`;
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
            Ye({
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
            } = a, v = R(null), [g, I] = te({
              startIndex: 0,
              endIndex: 10
            }), [p, A] = te({}), M = R(!0);
            q(() => {
              const P = setInterval(() => {
                A({});
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
            ), { keys: $ } = B(e, t, n);
            q(() => {
              const P = [e, ...t].join("."), k = T.getState().subscribeToPath(P, (j) => {
                j.type !== "GET_SELECTED" && j.type;
              });
              return () => {
                k();
              };
            }, [u, e, t.join(".")]), ce(() => {
              if (h && $.length > 0 && v.current && !b.current.isUserScrolling && M.current) {
                const P = v.current, k = () => {
                  if (P.clientHeight > 0) {
                    const j = Math.ceil(
                      P.clientHeight / o
                    ), L = $.length - 1, D = Math.max(
                      0,
                      L - j - c
                    );
                    I({ startIndex: D, endIndex: L }), requestAnimationFrame(() => {
                      X("instant"), M.current = !1;
                    });
                  } else
                    requestAnimationFrame(k);
                };
                k();
              }
            }, [$.length, h, o, c]);
            const E = R(g);
            ce(() => {
              E.current = g;
            }, [g]);
            const F = R($);
            ce(() => {
              F.current = $;
            }, [$]);
            const Z = we(() => {
              const P = v.current;
              if (!P) return;
              const k = P.scrollTop, { scrollHeight: j, clientHeight: L } = P, D = b.current, re = j - (k + L), Se = D.isNearBottom;
              D.isNearBottom = re <= y, k < D.lastScrollTop ? (D.scrollUpCount++, D.scrollUpCount > 3 && Se && (D.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : D.isNearBottom && (D.isUserScrolling = !1, D.scrollUpCount = 0), D.lastScrollTop = k;
              let Q = 0;
              for (let G = 0; G < $.length; G++) {
                const ge = $[G], ye = _.current.get(ge);
                if (ye && ye.offset + ye.height > k) {
                  Q = G;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                _.current,
                Q,
                g
              ), Q !== g.startIndex && g.startIndex != 0) {
                const G = Math.ceil(L / o);
                I({
                  startIndex: Math.max(0, Q - c),
                  endIndex: Math.min(
                    $.length - 1,
                    Q + G + c
                  )
                });
              }
            }, [
              $.length,
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
                      const G = k.scrollHeight, ge = k.scrollTop;
                      (G !== re || ge + Q < G - 1) && L(D + 1);
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
            }, [h, $.length, X]), {
              virtualState: pe(() => {
                const P = Array.isArray($) ? $.slice(g.startIndex, g.endIndex + 1) : [], k = t.length > 0 ? t.join(".") : "root";
                return i({
                  path: t,
                  componentId: u,
                  meta: {
                    ...n,
                    arrayViews: { [k]: P },
                    serverStateIsUpStream: !0
                  }
                });
              }, [g.startIndex, g.endIndex, $, n]),
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
                    transform: `translateY(${_.current.get($[g.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: X,
              scrollToIndex: (P, k = "smooth") => {
                if (v.current && $[P]) {
                  const j = _.current.get($[P])?.offset || 0;
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
              const I = [...t, g], p = i({
                path: I,
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
                const I = c[g];
                I && y.push(I);
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
            const y = c.map((g, I) => ({
              item: g,
              key: h[I]
            }));
            y.sort((g, I) => a(g.item, I.item));
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
            let g = [], I = !1, p = null;
            const A = (E) => {
              if (!I) {
                if (h === "sliding" && g.length >= o)
                  g.shift();
                else if (h === "dropping" && g.length >= o)
                  return;
                g.push(E), g.length >= o && M();
              }
            }, M = () => {
              if (g.length === 0) return;
              const E = [...g];
              if (g = [], y) {
                const F = y(E);
                F !== void 0 && (Array.isArray(F) ? F : [F]).forEach((X) => {
                  r(X, t, {
                    updateType: "insert"
                  });
                });
              } else
                E.forEach((F) => {
                  r(F, t, {
                    updateType: "insert"
                  });
                });
              v?.(E);
            };
            c > 0 && (p = setInterval(M, c));
            const b = ee(), _ = V(e, t) || {}, $ = _.streams || /* @__PURE__ */ new Map();
            return $.set(b, { buffer: g, flushTimer: p }), J(e, t, {
              ..._,
              streams: $
            }), {
              write: (E) => A(E),
              writeMany: (E) => E.forEach(A),
              flush: () => M(),
              pause: () => {
                I = !0;
              },
              resume: () => {
                I = !1, g.length > 0 && M();
              },
              close: () => {
                M(), p && clearInterval(p);
                const E = T.getState().getShadowMetadata(e, t);
                E?.streams && E.streams.delete(b);
              }
            };
          };
        if (m === "$stateList")
          return (a) => /* @__PURE__ */ ne(() => {
            const c = R(/* @__PURE__ */ new Map()), [h, y] = te({}), v = t.length > 0 ? t.join(".") : "root", g = ut(e, t, n), I = pe(() => ({
              ...n,
              arrayViews: {
                ...n?.arrayViews || {},
                [v]: g
              }
            }), [n, v, g]), { value: p } = B(
              e,
              t,
              I
            );
            if (q(() => {
              const b = T.getState().subscribeToPath(O, (_) => {
                if (_.type === "GET_SELECTED")
                  return;
                const E = T.getState().getShadowMetadata(e, t)?.transformCaches;
                if (E)
                  for (const F of E.keys())
                    F.startsWith(u) && E.delete(F);
                (_.type === "INSERT" || _.type === "INSERT_MANY" || _.type === "REMOVE" || _.type === "CLEAR_SELECTION" || _.type === "SERVER_STATE_UPDATE" && !n?.serverStateIsUpStream) && y({});
              });
              return () => {
                b();
              };
            }, [u, O]), !Array.isArray(p))
              return null;
            const A = i({
              path: t,
              componentId: u,
              meta: I
              // Use updated meta here
            }), M = p.map((b, _) => {
              const $ = g[_];
              if (!$)
                return null;
              let E = c.current.get($);
              E || (E = ee(), c.current.set($, E));
              const F = [...t, $];
              return Ie(je, {
                key: $,
                stateKey: e,
                itemComponentId: E,
                itemPath: F,
                localIndex: _,
                arraySetter: A,
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
            ), y = H(a) ? a(h) : a;
            let v = null;
            if (!h.some((I) => {
              const p = o ? o.every(
                (A) => oe(I[A], y[A])
              ) : oe(I, y);
              return p && (v = I), p;
            }))
              r(y, t, { updateType: "insert" });
            else if (c && v) {
              const I = c(v), p = h.map(
                (A) => oe(A, v) ? I : A
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
          return Ze(a);
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
              T.getState().setShadowMetadata(e, c, {
                ...h,
                validation: {
                  status: y.length > 0 ? "INVALID" : "VALID",
                  errors: y,
                  lastValidated: Date.now()
                }
              }), r(a.newValue, c, {
                updateType: a.updateType,
                sync: !1,
                itemId: a.itemId
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
                    const { value: I } = v;
                    o.updateShadowAtPath(e, g, I), o.markAsDirty(e, g, { bubble: !0 });
                    let p = [...g];
                    for (; ; ) {
                      const A = o.getShadowMetadata(
                        e,
                        p
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((M) => {
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
                    const I = g.slice(0, -1);
                    o.removeShadowArrayElement(e, g), o.markAsDirty(e, I, { bubble: !0 });
                    let p = [...I];
                    for (; ; ) {
                      const A = o.getShadowMetadata(
                        e,
                        p
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((M) => {
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
              Qe(c, {
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
    }, z = new Proxy({}, U);
    return S.set(x, z), z;
  }
  const f = {
    $test: () => {
      const t = Re.get(e);
      console.log("test", t);
    },
    $revertToInitialState: (t) => {
      const n = T.getState().getShadowMetadata(e, []);
      let u;
      n?.stateSource === "server" && n.baseServerState ? u = n.baseServerState : u = T.getState().initialStateGlobal[e], Ge(e), se(e, u), i({
        path: [],
        componentId: d
      });
      const C = W(e), x = H(C?.localStorage?.key) ? C?.localStorage?.key(u) : C?.localStorage?.key, O = `${s}-${e}-${x}`;
      return O && localStorage.removeItem(O), ie(e), u;
    },
    $initializeAndMergeShadowState: (t) => {
      xe(e, t);
    },
    $updateInitialState: (t) => {
      const n = Ve(
        e,
        r,
        d,
        s
      ), u = T.getState().initialStateGlobal[e], C = W(e), x = H(C?.localStorage?.key) ? C?.localStorage?.key(u) : C?.localStorage?.key, O = `${s}-${e}-${x}`;
      return localStorage.getItem(O) && localStorage.removeItem(O), Ce(() => {
        ke(e, t), se(e, t);
        const U = T.getState().getShadowMetadata(e, []);
        U && U?.components?.forEach((z) => {
          z.forceUpdate();
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
  return Ie(dt, { proxy: e });
}
function dt({
  proxy: e
}) {
  const r = R(null), d = R(null), s = R(!1), S = `${e._stateKey}-${e._path.join(".")}`, i = e._path.length > 0 ? e._path.join(".") : "root", f = e._meta?.arrayViews?.[i], l = N(e._stateKey, e._path, f);
  return q(() => {
    const t = r.current;
    if (!t || s.current) return;
    const n = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", S);
        return;
      }
      const u = t.parentElement, x = Array.from(u.childNodes).indexOf(t);
      let O = u.getAttribute("data-parent-id");
      O || (O = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", O)), d.current = `instance-${crypto.randomUUID()}`;
      const U = T.getState().getShadowMetadata(e._stateKey, e._path) || {}, z = U.signals || [];
      z.push({
        instanceId: d.current,
        parentId: O,
        position: x,
        effect: e._effect
      }), T.getState().setShadowMetadata(e._stateKey, e._path, {
        ...U,
        signals: z
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
  }, []), Ie("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": S
  });
}
export {
  be as $cogsSignal,
  Tt as addStateOptions,
  Xe as createCogsState,
  It as createCogsStateFromSync,
  lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
