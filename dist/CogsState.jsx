"use client";
import { jsx as ne, Fragment as Pe } from "react/jsx-runtime";
import { useState as te, useRef as x, useEffect as q, useCallback as we, useLayoutEffect as ce, useMemo as pe, createElement as be, startTransition as Ce } from "react";
import { transformStateFunc as De, isFunction as z, isDeepEqual as oe, isArray as Ue, getDifferences as je } from "./utility.js";
import { ValidationWrapper as Oe, IsolatedComponentWrapper as Fe, FormElementWrapper as Ne, MemoizedCogsItemWrapper as Re } from "./Components.jsx";
import xe from "superjson";
import { v4 as ee } from "uuid";
import { getGlobalStore as b, formRefStore as Ae } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
const {
  getInitialOptions: W,
  updateInitialStateGlobal: Ve,
  getShadowMetadata: V,
  setShadowMetadata: J,
  getShadowValue: R,
  initializeShadowState: se,
  updateShadowAtPath: Le,
  insertShadowArrayElement: Be,
  insertManyShadowArrayElements: qe,
  removeShadowArrayElement: We,
  setInitialStateOptions: le,
  setServerStateUpdate: Me,
  markAsDirty: ue,
  addPathComponent: Ge,
  clearSelectedIndexesForState: He,
  addStateLog: ze,
  setSyncInfo: Je,
  clearSelectedIndex: Ye,
  getSyncInfo: Ze,
  notifyPathSubscribers: Qe
  // Note: The old functions are no longer imported under their original names
} = b.getState();
function B(e, r, c) {
  const s = V(e, r);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: b.getState().getShadowValue(e, r), keys: [] };
  const n = r.length > 0 ? r.join(".") : "root", S = c?.arrayViews?.[n] ?? s.arrayKeys;
  return Array.isArray(S) && S.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: b.getState().getShadowValue(e, r, S), keys: S ?? [] };
}
function he(e, r, c) {
  for (let s = 0; s < e.length; s++)
    if (c(e[s], s)) {
      const d = r[s];
      if (d)
        return { key: d, index: s, value: e[s] };
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
function Ee({
  stateKey: e,
  options: r,
  initialOptionsPart: c
}) {
  const s = W(e) || {};
  let n = { ...c[e] || {}, ...s }, S = !1;
  if (r) {
    const f = (t, a) => {
      for (const l in a)
        a.hasOwnProperty(l) && (a[l] instanceof Object && !Array.isArray(a[l]) && t[l] instanceof Object ? oe(t[l], a[l]) || (f(t[l], a[l]), S = !0) : t[l] !== a[l] && (t[l] = a[l], S = !0));
      return t;
    };
    n = f(n, r);
  }
  n.syncOptions && (!r || !r.hasOwnProperty("syncOptions")) && (S = !0), (n.validation && n?.validation?.zodSchemaV4 || n?.validation?.zodSchemaV3) && (n?.validation?.onBlur || n.validation.onBlur === void 0 || (n.validation.onBlur = "error")), S && le(e, n);
}
function Tt(e, { formElements: r, validation: c }) {
  return { initialState: e, formElements: r, validation: c };
}
const Xe = (e, r) => {
  let c = e;
  const [s, d] = De(c);
  r?.__fromSyncSchema && r?.__syncNotifications && b.getState().setInitialStateOptions("__notifications", r.__syncNotifications), r?.__fromSyncSchema && r?.__apiParamsMap && b.getState().setInitialStateOptions("__apiParamsMap", r.__apiParamsMap), Object.keys(s).forEach((f) => {
    let t = d[f] || {};
    const a = {
      ...t
    };
    if (r?.formElements && (a.formElements = {
      ...r.formElements,
      ...t.formElements || {}
    }), r?.validation && (a.validation = {
      ...r.validation,
      ...t.validation || {}
    }, r.validation.key && !t.validation?.key && (a.validation.key = `${r.validation.key}.${f}`)), r?.__syncSchemas?.[f]?.schemas?.validation && (a.validation = {
      zodSchemaV4: r.__syncSchemas[f].schemas.validation,
      ...t.validation
    }), Object.keys(a).length > 0) {
      const l = W(f);
      l ? le(f, {
        ...l,
        ...a
      }) : le(f, a);
    }
  }), Object.keys(s).forEach((f) => {
    se(f, s[f]);
  });
  const n = (f, t) => {
    const [a] = te(t?.componentId ?? ee());
    Ee({
      stateKey: f,
      options: t,
      initialOptionsPart: d
    });
    const l = R(f, []) || s[f], C = t?.modifyState ? t.modifyState(l) : l;
    return lt(C, {
      stateKey: f,
      syncUpdate: t?.syncUpdate,
      componentId: a,
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
  function S(f, t) {
    Ee({ stateKey: f, options: t, initialOptionsPart: d }), t.localStorage && et(f, t), ie(f);
  }
  return { useCogsState: n, setCogsOptions: S };
};
function bt(e, r) {
  const c = e.schemas, s = {}, d = {};
  for (const n in c) {
    const S = c[n];
    s[n] = S?.schemas?.defaultValues || {}, S?.api?.queryData?._paramType && (d[n] = S.api.queryData._paramType);
  }
  return Xe(s, {
    __fromSyncSchema: !0,
    __syncNotifications: e.notifications,
    __apiParamsMap: d,
    __useSync: r,
    __syncSchemas: c
  });
}
const Ke = (e, r, c, s, d) => {
  c?.log && console.log(
    "saving to localstorage",
    r,
    c.localStorage?.key,
    s
  );
  const n = z(c?.localStorage?.key) ? c.localStorage?.key(e) : c?.localStorage?.key;
  if (n && s) {
    const S = `${s}-${r}-${n}`;
    let f;
    try {
      f = Se(S)?.lastSyncedWithServer;
    } catch {
    }
    const t = V(r, []), a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: f,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, l = xe.serialize(a);
    window.localStorage.setItem(
      S,
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
  const c = R(e, []), { sessionId: s } = _e(), d = z(r?.localStorage?.key) ? r.localStorage.key(c) : r?.localStorage?.key;
  if (d && s) {
    const n = Se(
      `${s}-${e}-${d}`
    );
    if (n && n.lastUpdated > (n.lastSyncedWithServer || 0))
      return ie(e), !0;
  }
  return !1;
}, ie = (e) => {
  const r = V(e, []);
  if (!r) return;
  const c = /* @__PURE__ */ new Set();
  r?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || c.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    c.forEach((s) => s());
  });
};
function fe(e, r, c, s) {
  const d = V(e, r);
  if (J(e, r, {
    ...d,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(c)) {
    const n = V(e, r);
    n?.arrayKeys && n.arrayKeys.forEach((S, f) => {
      const t = [...r, S], a = c[f];
      a !== void 0 && fe(
        e,
        t,
        a,
        s
      );
    });
  } else c && typeof c == "object" && c.constructor === Object && Object.keys(c).forEach((n) => {
    const S = [...r, n], f = c[n];
    fe(e, S, f, s);
  });
}
let de = [], Te = !1;
function tt() {
  Te || (Te = !0, queueMicrotask(it));
}
function rt(e, r, c) {
  const s = b.getState().getShadowValue(e, r), d = z(c) ? c(s) : c;
  Le(e, r, d), ue(e, r, { bubble: !0 });
  const n = V(e, r);
  return {
    type: "update",
    oldValue: s,
    newValue: d,
    shadowMeta: n
  };
}
function nt(e, r) {
  e?.signals?.length && e.signals.forEach(({ parentId: c, position: s, effect: d }) => {
    const n = document.querySelector(`[data-parent-id="${c}"]`);
    if (!n) return;
    const S = Array.from(n.childNodes);
    if (!S[s]) return;
    let f = r;
    if (d && r !== null)
      try {
        f = new Function("state", `return (${d})(state)`)(
          r
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    f !== null && typeof f == "object" && (f = JSON.stringify(f)), S[s].textContent = String(f ?? "");
  });
}
function at(e, r, c) {
  const s = V(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const d = /* @__PURE__ */ new Set();
  if (c.type === "update") {
    let n = [...r];
    for (; ; ) {
      const S = V(e, n);
      if (S?.pathComponents && S.pathComponents.forEach((f) => {
        const t = s.components?.get(f);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || d.add(t));
      }), n.length === 0) break;
      n.pop();
    }
    c.newValue && typeof c.newValue == "object" && !Ue(c.newValue) && je(c.newValue, c.oldValue).forEach((f) => {
      const t = f.split("."), a = [...r, ...t], l = V(e, a);
      l?.pathComponents && l.pathComponents.forEach((C) => {
        const U = s.components?.get(C);
        U && ((Array.isArray(U.reactiveType) ? U.reactiveType : [U.reactiveType || "component"]).includes("none") || d.add(U));
      });
    });
  } else if (c.type === "insert" || c.type === "cut") {
    const n = c.type === "insert" ? r : r.slice(0, -1), S = V(e, n);
    S?.pathComponents && S.pathComponents.forEach((f) => {
      const t = s.components?.get(f);
      t && d.add(t);
    });
  }
  return s.components.forEach((n, S) => {
    if (d.has(n))
      return;
    const f = Array.isArray(n.reactiveType) ? n.reactiveType : [n.reactiveType || "component"];
    if (f.includes("all"))
      d.add(n);
    else if (f.includes("deps") && n.depsFunction) {
      const t = R(e, []), a = n.depsFunction(t);
      (a === !0 || Array.isArray(a) && !oe(n.prevDeps, a)) && (n.prevDeps = a, d.add(n));
    }
  }), d;
}
function ot(e, r, c) {
  let s;
  if (z(c)) {
    const { value: n } = K(e, r);
    s = c({ state: n, uuid: ee() });
  } else
    s = c;
  Be(e, r, s), ue(e, r, { bubble: !0 });
  const d = V(e, r);
  if (d?.arrayKeys) {
    const n = d.arrayKeys[d.arrayKeys.length - 1];
    if (n) {
      const S = n.split(".").slice(1);
      ue(e, S, { bubble: !1 });
    }
  }
  return { type: "insert", newValue: s, shadowMeta: d };
}
function st(e, r) {
  const c = r.slice(0, -1), s = R(e, r);
  return We(e, r), ue(e, c, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: c };
}
function it() {
  const e = /* @__PURE__ */ new Set(), r = [], c = [];
  for (const s of de) {
    if (s.status && s.updateType) {
      c.push(s);
      continue;
    }
    const d = s, n = d.type === "cut" ? null : d.newValue;
    d.shadowMeta?.signals?.length > 0 && r.push({ shadowMeta: d.shadowMeta, displayValue: n }), at(
      d.stateKey,
      d.path,
      d
    ).forEach((f) => {
      e.add(f);
    });
  }
  c.length > 0 && ze(c), r.forEach(({ shadowMeta: s, displayValue: d }) => {
    nt(s, d);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), de = [], Te = !1;
}
function ct(e, r, c, s) {
  return (n, S, f, t) => {
    d(e, S, n, f);
  };
  function d(n, S, f, t) {
    let a;
    switch (t.updateType) {
      case "update":
        a = rt(n, S, f);
        break;
      case "insert":
        a = ot(n, S, f);
        break;
      case "cut":
        a = st(n, S);
        break;
    }
    a.stateKey = n, a.path = S, de.push(a), tt();
    const l = {
      timeStamp: Date.now(),
      stateKey: n,
      path: S,
      updateType: t.updateType,
      status: "new",
      oldValue: a.oldValue,
      newValue: a.newValue ?? null
    };
    de.push(l), a.newValue !== void 0 && Ke(
      a.newValue,
      n,
      s.current,
      c
    ), s.current?.middleware && s.current.middleware({ update: l }), t.sync !== !1 && r.current?.connected && r.current.updateState({ operation: l });
  }
}
function lt(e, {
  stateKey: r,
  localStorage: c,
  formElements: s,
  reactiveDeps: d,
  reactiveType: n,
  componentId: S,
  defaultState: f,
  syncUpdate: t,
  dependencies: a,
  serverState: l,
  __useSync: C
} = {}) {
  const [U, j] = te({}), { sessionId: O } = _e();
  let G = !r;
  const [w] = te(r ?? ee()), m = x(S ?? ee()), Y = x(
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
  const i = we(
    (g) => {
      const p = g ? { ...W(w), ...g } : W(w), A = p?.defaultState || f || e;
      if (p?.serverState?.status === "success" && p?.serverState?.data !== void 0)
        return {
          value: p.serverState.data,
          source: "server",
          timestamp: p.serverState.timestamp || Date.now()
        };
      if (p?.localStorage?.key && O) {
        const I = z(p.localStorage.key) ? p.localStorage.key(A) : p.localStorage.key, _ = Se(
          `${O}-${w}-${I}`
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
    [w, f, e, O]
  );
  q(() => {
    l && l.status === "success" && l.data !== void 0 && Me(w, l);
  }, [l, w]), q(() => b.getState().subscribeToPath(w, (T) => {
    if (T?.type === "SERVER_STATE_UPDATE") {
      const p = T.serverState;
      if (p?.status !== "success" || p.data === void 0)
        return;
      ve(w, { serverState: p });
      const A = typeof p.merge == "object" ? p.merge : p.merge === !0 ? { strategy: "append", key: "id" } : null, M = R(w, []), I = p.data;
      if (A && A.strategy === "append" && "key" in A && Array.isArray(M) && Array.isArray(I)) {
        const _ = A.key;
        if (!_) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const E = new Set(
          M.map((Z) => Z[_])
        ), $ = I.filter(
          (Z) => !E.has(Z[_])
        );
        $.length > 0 && qe(w, [], $);
        const F = R(w, []);
        fe(
          w,
          [],
          F,
          p.timestamp || Date.now()
        );
      } else
        se(w, I), fe(
          w,
          [],
          I,
          p.timestamp || Date.now()
        );
      ie(w);
    }
  }), [w]), q(() => {
    const g = b.getState().getShadowMetadata(w, []);
    if (g && g.stateSource)
      return;
    const T = W(w), p = {
      syncEnabled: !!y && !!v,
      validationEnabled: !!(T?.validation?.zodSchemaV4 || T?.validation?.zodSchemaV3),
      localStorageEnabled: !!T?.localStorage?.key
    };
    if (J(w, [], {
      ...g,
      features: p
    }), T?.defaultState !== void 0 || f !== void 0) {
      const _ = T?.defaultState || f;
      T?.defaultState || ve(w, {
        defaultState: _
      });
    }
    const { value: A, source: M, timestamp: I } = i();
    se(w, A), J(w, [], {
      stateSource: M,
      lastServerSync: M === "server" ? I : void 0,
      isDirty: M === "server" ? !1 : void 0,
      // Only explicitly set isDirty: false for server source
      baseServerState: M === "server" ? A : void 0
    }), M === "server" && l && Me(w, l), ie(w);
  }, [w, ...a || []]), ce(() => {
    G && ve(w, {
      formElements: s,
      defaultState: f,
      localStorage: c,
      middleware: Y.current?.middleware
    });
    const g = `${w}////${m.current}`, T = V(w, []), p = T?.components || /* @__PURE__ */ new Map();
    return p.set(g, {
      forceUpdate: () => j({}),
      reactiveType: n ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: d || void 0,
      deps: d ? d(R(w, [])) : [],
      prevDeps: d ? d(R(w, [])) : []
    }), J(w, [], {
      ...T,
      components: p
    }), j({}), () => {
      const A = V(w, []), M = A?.components?.get(g);
      M?.paths && M.paths.forEach((I) => {
        const E = I.split(".").slice(1), $ = b.getState().getShadowMetadata(w, E);
        $?.pathComponents && $.pathComponents.size === 0 && (delete $.pathComponents, b.getState().setShadowMetadata(w, E, $));
      }), A?.components && J(w, [], A);
    };
  }, []);
  const o = x(null), u = ct(
    w,
    o,
    O,
    Y
  );
  b.getState().initialStateGlobal[w] || Ve(w, e);
  const h = pe(() => ke(
    w,
    u,
    m.current,
    O
  ), [w, O]), y = C, v = Y.current?.syncOptions;
  return y && (o.current = y(
    h,
    v ?? {}
  )), h;
}
const ut = (e, r, c) => {
  let s = V(e, r)?.arrayKeys || [];
  const d = c?.transforms;
  if (!d || d.length === 0)
    return s;
  for (const n of d)
    if (n.type === "filter") {
      const S = [];
      s.forEach((f, t) => {
        const a = R(e, [...r, f]);
        n.fn(a, t) && S.push(f);
      }), s = S;
    } else n.type === "sort" && s.sort((S, f) => {
      const t = R(e, [...r, S]), a = R(e, [...r, f]);
      return n.fn(t, a);
    });
  return s;
}, $e = (e, r, c) => {
  const s = `${e}////${r}`, n = V(e, [])?.components?.get(s);
  !n || n.reactiveType === "none" || !(Array.isArray(n.reactiveType) ? n.reactiveType : [n.reactiveType]).includes("component") || Ge(e, c, s);
}, ae = (e, r, c) => {
  const s = V(e, []), d = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((S, f) => {
    (Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"]).includes("all") && (S.forceUpdate(), d.add(f));
  }), V(e, [
    ...r,
    "getSelected"
  ])?.pathComponents?.forEach((S) => {
    s?.components?.get(S)?.forceUpdate();
  });
  const n = V(e, r);
  for (let S of n?.arrayKeys || []) {
    const f = S + ".selected", t = V(e, f.split(".").slice(1));
    S == c && t?.pathComponents?.forEach((a) => {
      s?.components?.get(a)?.forceUpdate();
    });
  }
};
function K(e, r, c) {
  const s = V(e, r), d = r.length > 0 ? r.join(".") : "root", n = c?.arrayViews?.[d];
  if (Array.isArray(n) && n.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const S = R(e, r, n);
  return {
    shadowMeta: s,
    value: S,
    arrayKeys: s?.arrayKeys
  };
}
function ke(e, r, c, s) {
  const d = /* @__PURE__ */ new Map();
  function n({
    path: t = [],
    meta: a,
    componentId: l
  }) {
    const C = a ? JSON.stringify(a.arrayViews || a.transforms) : "", U = t.join(".") + ":" + l + ":" + C;
    if (d.has(U))
      return d.get(U);
    const j = [e, ...t].join("."), O = {
      get(w, m) {
        if (t.length === 0 && m in S)
          return S[m];
        if (!m.startsWith("$")) {
          const i = [...t, m];
          return n({
            path: i,
            componentId: l,
            meta: a
          });
        }
        if (m === "$_rebuildStateShape")
          return n;
        if (m === "$sync" && t.length === 0)
          return async function() {
            const i = b.getState().getInitialOptions(e), o = i?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const u = b.getState().getShadowValue(e, []), h = i?.validation?.key;
            try {
              const y = await o.action(u);
              if (y && !y.success && y.errors, y?.success) {
                const v = b.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...v,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: u
                  // Update base server state
                }), o.onSuccess && o.onSuccess(y.data);
              } else !y?.success && o.onError && o.onError(y.error);
              return y;
            } catch (y) {
              return o.onError && o.onError(y), { success: !1, error: y };
            }
          };
        if (m === "$_status" || m === "$getStatus") {
          const i = () => {
            const { shadowMeta: o, value: u } = K(e, t, a);
            return o?.isDirty === !0 ? "dirty" : o?.stateSource === "server" || o?.isDirty === !1 ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" || u !== void 0 && !o ? "fresh" : "unknown";
          };
          return m === "$_status" ? i() : i;
        }
        if (m === "$removeStorage")
          return () => {
            const i = b.getState().initialStateGlobal[e], o = W(e), u = z(o?.localStorage?.key) ? o.localStorage.key(i) : o?.localStorage?.key, h = `${s}-${e}-${u}`;
            h && localStorage.removeItem(h);
          };
        if (m === "$showValidationErrors")
          return () => {
            const { shadowMeta: i } = K(e, t, a);
            return i?.validation?.status === "INVALID" && i.validation.errors.length > 0 ? i.validation.errors.filter((o) => o.severity === "error").map((o) => o.message) : [];
          };
        if (m === "$getSelected")
          return () => {
            const i = [e, ...t].join(".");
            $e(e, l, [
              ...t,
              "getSelected"
            ]);
            const o = b.getState().selectedIndicesMap.get(i);
            if (!o)
              return;
            const u = t.join("."), h = a?.arrayViews?.[u], y = o.split(".").pop();
            if (!(h && !h.includes(y) || R(
              e,
              o.split(".").slice(1)
            ) === void 0))
              return n({
                path: o.split(".").slice(1),
                componentId: l,
                meta: a
              });
          };
        if (m === "$getSelectedIndex")
          return () => {
            const i = e + "." + t.join(".");
            t.join(".");
            const o = b.getState().selectedIndicesMap.get(i);
            if (!o)
              return -1;
            const { keys: u } = B(e, t, a);
            if (!u)
              return -1;
            const h = o.split(".").pop();
            return u.indexOf(h);
          };
        if (m === "$clearSelected")
          return ae(e, t), () => {
            Ye({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (m === "$useVirtualView")
          return (i) => {
            const {
              itemHeight: o = 50,
              overscan: u = 6,
              stickToBottom: h = !1,
              scrollStickTolerance: y = 75
            } = i, v = x(null), [g, T] = te({
              startIndex: 0,
              endIndex: 10
            }), [p, A] = te({}), M = x(!0);
            q(() => {
              const P = setInterval(() => {
                A({});
              }, 1e3);
              return () => clearInterval(P);
            }, []);
            const I = x({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), _ = x(
              /* @__PURE__ */ new Map()
            ), { keys: E } = B(e, t, a);
            q(() => {
              const P = [e, ...t].join("."), k = b.getState().subscribeToPath(P, (N) => {
                N.type !== "GET_SELECTED" && N.type;
              });
              return () => {
                k();
              };
            }, [l, e, t.join(".")]), ce(() => {
              if (h && E.length > 0 && v.current && !I.current.isUserScrolling && M.current) {
                const P = v.current, k = () => {
                  if (P.clientHeight > 0) {
                    const N = Math.ceil(
                      P.clientHeight / o
                    ), L = E.length - 1, D = Math.max(
                      0,
                      L - N - u
                    );
                    T({ startIndex: D, endIndex: L }), requestAnimationFrame(() => {
                      X("instant"), M.current = !1;
                    });
                  } else
                    requestAnimationFrame(k);
                };
                k();
              }
            }, [E.length, h, o, u]);
            const $ = x(g);
            ce(() => {
              $.current = g;
            }, [g]);
            const F = x(E);
            ce(() => {
              F.current = E;
            }, [E]);
            const Z = we(() => {
              const P = v.current;
              if (!P) return;
              const k = P.scrollTop, { scrollHeight: N, clientHeight: L } = P, D = I.current, re = N - (k + L), ge = D.isNearBottom;
              D.isNearBottom = re <= y, k < D.lastScrollTop ? (D.scrollUpCount++, D.scrollUpCount > 3 && ge && (D.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : D.isNearBottom && (D.isUserScrolling = !1, D.scrollUpCount = 0), D.lastScrollTop = k;
              let Q = 0;
              for (let H = 0; H < E.length; H++) {
                const ye = E[H], me = _.current.get(ye);
                if (me && me.offset + me.height > k) {
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
                T({
                  startIndex: Math.max(0, Q - u),
                  endIndex: Math.min(
                    E.length - 1,
                    Q + H + u
                  )
                });
              }
            }, [
              E.length,
              g.startIndex,
              o,
              u,
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
                I.current.isUserScrolling = !1, I.current.isNearBottom = !0, I.current.scrollUpCount = 0;
                const N = () => {
                  const L = (D = 0) => {
                    if (D > 5) return;
                    const re = k.scrollHeight, ge = k.scrollTop, Q = k.clientHeight;
                    ge + Q >= re - 1 || (k.scrollTo({
                      top: re,
                      behavior: P
                    }), setTimeout(() => {
                      const H = k.scrollHeight, ye = k.scrollTop;
                      (H !== re || ye + Q < H - 1) && L(D + 1);
                    }, 50));
                  };
                  L();
                };
                "requestIdleCallback" in window ? requestIdleCallback(N, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(N);
                });
              },
              []
            );
            return q(() => {
              if (!h || !v.current) return;
              const P = v.current, k = I.current;
              let N;
              const L = () => {
                clearTimeout(N), N = setTimeout(() => {
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
                clearTimeout(N), D.disconnect();
              };
            }, [h, E.length, X]), {
              virtualState: pe(() => {
                const P = Array.isArray(E) ? E.slice(g.startIndex, g.endIndex + 1) : [], k = t.length > 0 ? t.join(".") : "root";
                return n({
                  path: t,
                  componentId: l,
                  meta: {
                    ...a,
                    arrayViews: { [k]: P },
                    serverStateIsUpStream: !0
                  }
                });
              }, [g.startIndex, g.endIndex, E, a]),
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
                  const N = _.current.get(E[P])?.offset || 0;
                  v.current.scrollTo({ top: N, behavior: k });
                }
              }
            };
          };
        if (m === "$stateMap")
          return (i) => {
            const { value: o, keys: u } = B(
              e,
              t,
              a
            );
            if (!u || !Array.isArray(o))
              return [];
            const h = n({
              path: t,
              componentId: l,
              meta: a
            });
            return o.map((y, v) => {
              const g = u[v];
              if (!g) return;
              const T = [...t, g], p = n({
                path: T,
                // This now correctly points to the item in the shadow store.
                componentId: l,
                meta: a
              });
              return i(p, v, h);
            });
          };
        if (m === "$stateFilter")
          return (i) => {
            const o = t.length > 0 ? t.join(".") : "root", { keys: u, value: h } = B(
              e,
              t,
              a
            );
            if (!Array.isArray(h))
              throw new Error("stateFilter can only be used on arrays");
            const y = [];
            return h.forEach((v, g) => {
              if (i(v, g)) {
                const T = u[g];
                T && y.push(T);
              }
            }), n({
              path: t,
              componentId: l,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [o]: y
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "filter", fn: i, path: t }
                ]
              }
            });
          };
        if (m === "$stateSort")
          return (i) => {
            const o = t.length > 0 ? t.join(".") : "root", { value: u, keys: h } = B(
              e,
              t,
              a
            );
            if (!Array.isArray(u) || !h)
              throw new Error("No array keys found for sorting");
            const y = u.map((g, T) => ({
              item: g,
              key: h[T]
            }));
            y.sort((g, T) => i(g.item, T.item));
            const v = y.map((g) => g.key);
            return n({
              path: t,
              componentId: l,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [o]: v
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "sort", fn: i, path: t }
                ]
              }
            });
          };
        if (m === "$stream")
          return function(i = {}) {
            const {
              bufferSize: o = 100,
              flushInterval: u = 100,
              bufferStrategy: h = "accumulate",
              store: y,
              onFlush: v
            } = i;
            let g = [], T = !1, p = null;
            const A = ($) => {
              if (!T) {
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
            u > 0 && (p = setInterval(M, u));
            const I = ee(), _ = V(e, t) || {}, E = _.streams || /* @__PURE__ */ new Map();
            return E.set(I, { buffer: g, flushTimer: p }), J(e, t, {
              ..._,
              streams: E
            }), {
              write: ($) => A($),
              writeMany: ($) => $.forEach(A),
              flush: () => M(),
              pause: () => {
                T = !0;
              },
              resume: () => {
                T = !1, g.length > 0 && M();
              },
              close: () => {
                M(), p && clearInterval(p);
                const $ = b.getState().getShadowMetadata(e, t);
                $?.streams && $.streams.delete(I);
              }
            };
          };
        if (m === "$stateList")
          return (i) => /* @__PURE__ */ ne(() => {
            const u = x(/* @__PURE__ */ new Map()), [h, y] = te({}), v = t.length > 0 ? t.join(".") : "root", g = ut(e, t, a), T = pe(() => ({
              ...a,
              arrayViews: {
                ...a?.arrayViews || {},
                [v]: g
              }
            }), [a, v, g]), { value: p } = B(
              e,
              t,
              T
            );
            if (q(() => {
              const I = b.getState().subscribeToPath(j, (_) => {
                if (_.type === "GET_SELECTED")
                  return;
                const $ = b.getState().getShadowMetadata(e, t)?.transformCaches;
                if ($)
                  for (const F of $.keys())
                    F.startsWith(l) && $.delete(F);
                (_.type === "INSERT" || _.type === "INSERT_MANY" || _.type === "REMOVE" || _.type === "CLEAR_SELECTION" || _.type === "SERVER_STATE_UPDATE" && !a?.serverStateIsUpStream) && y({});
              });
              return () => {
                I();
              };
            }, [l, j]), !Array.isArray(p))
              return null;
            const A = n({
              path: t,
              componentId: l,
              meta: T
              // Use updated meta here
            }), M = p.map((I, _) => {
              const E = g[_];
              if (!E)
                return null;
              let $ = u.current.get(E);
              $ || ($ = ee(), u.current.set(E, $));
              const F = [...t, E];
              return be(Re, {
                key: E,
                stateKey: e,
                itemComponentId: $,
                itemPath: F,
                localIndex: _,
                arraySetter: A,
                rebuildStateShape: n,
                renderFn: i
              });
            });
            return /* @__PURE__ */ ne(Pe, { children: M });
          }, {});
        if (m === "$stateFlattenOn")
          return (i) => {
            const o = t.length > 0 ? t.join(".") : "root", u = a?.arrayViews?.[o], h = b.getState().getShadowValue(e, t, u);
            return Array.isArray(h) ? n({
              path: [...t, "[*]", i],
              componentId: l,
              meta: a
            }) : [];
          };
        if (m === "$index")
          return (i) => {
            const o = t.length > 0 ? t.join(".") : "root", u = a?.arrayViews?.[o];
            if (u) {
              const v = u[i];
              return v ? n({
                path: [...t, v],
                componentId: l,
                meta: a
              }) : void 0;
            }
            const h = V(e, t);
            if (!h?.arrayKeys) return;
            const y = h.arrayKeys[i];
            if (y)
              return n({
                path: [...t, y],
                componentId: l,
                meta: a
              });
          };
        if (m === "$last")
          return () => {
            const { keys: i } = B(e, t, a);
            if (!i || i.length === 0)
              return;
            const o = i[i.length - 1];
            if (!o)
              return;
            const u = [...t, o];
            return n({
              path: u,
              componentId: l,
              meta: a
            });
          };
        if (m === "$insert")
          return (i, o) => {
            r(i, t, { updateType: "insert" });
          };
        if (m === "$uniqueInsert")
          return (i, o, u) => {
            const { value: h } = K(
              e,
              t,
              a
            ), y = z(i) ? i(h) : i;
            let v = null;
            if (!h.some((T) => {
              const p = o ? o.every(
                (A) => oe(T[A], y[A])
              ) : oe(T, y);
              return p && (v = T), p;
            }))
              r(y, t, { updateType: "insert" });
            else if (u && v) {
              const T = u(v), p = h.map(
                (A) => oe(A, v) ? T : A
              );
              r(p, t, {
                updateType: "update"
              });
            }
          };
        if (m === "$cut")
          return (i, o) => {
            const u = V(e, t);
            if (!u?.arrayKeys || u.arrayKeys.length === 0)
              return;
            const h = i === -1 ? u.arrayKeys.length - 1 : i !== void 0 ? i : u.arrayKeys.length - 1, y = u.arrayKeys[h];
            y && r(null, [...t, y], {
              updateType: "cut"
            });
          };
        if (m === "$cutSelected")
          return () => {
            const i = [e, ...t].join("."), { keys: o } = B(e, t, a);
            if (!o || o.length === 0)
              return;
            const u = b.getState().selectedIndicesMap.get(i);
            if (!u)
              return;
            const h = u.split(".").pop();
            if (!o.includes(h))
              return;
            const y = u.split(".").slice(1);
            b.getState().clearSelectedIndex({ arrayKey: i });
            const v = y.slice(0, -1);
            ae(e, v), r(null, y, {
              updateType: "cut"
            });
          };
        if (m === "$cutByValue")
          return (i) => {
            const {
              isArray: o,
              value: u,
              keys: h
            } = B(e, t, a);
            if (!o) return;
            const y = he(u, h, (v) => v === i);
            y && r(null, [...t, y.key], {
              updateType: "cut"
            });
          };
        if (m === "$toggleByValue")
          return (i) => {
            const {
              isArray: o,
              value: u,
              keys: h
            } = B(e, t, a);
            if (!o) return;
            const y = he(u, h, (v) => v === i);
            if (y) {
              const v = [...t, y.key];
              r(null, v, {
                updateType: "cut"
              });
            } else
              r(i, t, { updateType: "insert" });
          };
        if (m === "$findWith")
          return (i, o) => {
            const { isArray: u, value: h, keys: y } = B(e, t, a);
            if (!u)
              throw new Error("findWith can only be used on arrays");
            const v = he(
              h,
              y,
              (g) => g?.[i] === o
            );
            return n(v ? {
              path: [...t, v.key],
              componentId: l,
              meta: a
            } : {
              path: [...t, `not_found_${ee()}`],
              componentId: l,
              meta: a
            });
          };
        if (m === "$cutThis") {
          const { value: i } = K(e, t, a), o = t.slice(0, -1);
          return ae(e, o), () => {
            r(i, t, { updateType: "cut" });
          };
        }
        if (m === "$get")
          return () => {
            $e(e, l, t);
            const { value: i } = K(e, t, a);
            return i;
          };
        if (m === "$$derive")
          return (i) => Ie({
            _stateKey: e,
            _path: t,
            _effect: i.toString(),
            _meta: a
          });
        if (m === "$$get")
          return () => Ie({ _stateKey: e, _path: t, _meta: a });
        if (m === "$lastSynced") {
          const i = `${e}:${t.join(".")}`;
          return Ze(i);
        }
        if (m == "getLocalStorage")
          return (i) => Se(s + "-" + e + "-" + i);
        if (m === "$isSelected") {
          const i = t.slice(0, -1);
          if (V(e, i)?.arrayKeys) {
            const u = e + "." + i.join("."), h = b.getState().selectedIndicesMap.get(u), y = e + "." + t.join(".");
            return h === y;
          }
          return;
        }
        if (m === "$setSelected")
          return (i) => {
            const o = t.slice(0, -1), u = e + "." + o.join("."), h = e + "." + t.join(".");
            ae(e, o, void 0), b.getState().selectedIndicesMap.get(u), i && b.getState().setSelectedIndex(u, h);
          };
        if (m === "$toggleSelected")
          return () => {
            const i = t.slice(0, -1), o = e + "." + i.join("."), u = e + "." + t.join(".");
            b.getState().selectedIndicesMap.get(o) === u ? b.getState().clearSelectedIndex({ arrayKey: o }) : b.getState().setSelectedIndex(o, u), ae(e, i);
          };
        if (m === "$_componentId")
          return l;
        if (t.length == 0) {
          if (m === "$addZodValidation")
            return (i) => {
              i.forEach((o) => {
                const u = b.getState().getShadowMetadata(e, o.path) || {};
                b.getState().setShadowMetadata(e, o.path, {
                  ...u,
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
          if (m === "$clearZodValidation")
            return (i) => {
              if (!i)
                throw new Error("clearZodValidation requires a path");
              const o = V(e, i) || {};
              J(e, i, {
                ...o,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (m === "$applyJsonPatch")
            return (i) => {
              const o = b.getState(), u = o.getShadowMetadata(e, []);
              if (!u?.components) return;
              const h = (v) => !v || v === "/" ? [] : v.split("/").slice(1).map((g) => g.replace(/~1/g, "/").replace(/~0/g, "~")), y = /* @__PURE__ */ new Set();
              for (const v of i) {
                const g = h(v.path);
                switch (v.op) {
                  case "add":
                  case "replace": {
                    const { value: T } = v;
                    o.updateShadowAtPath(e, g, T), o.markAsDirty(e, g, { bubble: !0 });
                    let p = [...g];
                    for (; ; ) {
                      const A = o.getShadowMetadata(
                        e,
                        p
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((M) => {
                        if (!y.has(M)) {
                          const I = u.components?.get(M);
                          I && (I.forceUpdate(), y.add(M));
                        }
                      }), p.length === 0) break;
                      p.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const T = g.slice(0, -1);
                    o.removeShadowArrayElement(e, g), o.markAsDirty(e, T, { bubble: !0 });
                    let p = [...T];
                    for (; ; ) {
                      const A = o.getShadowMetadata(
                        e,
                        p
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((M) => {
                        if (!y.has(M)) {
                          const I = u.components?.get(M);
                          I && (I.forceUpdate(), y.add(M));
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
            return () => Ae.getState().getFormRefsByStateKey(e);
        }
        if (m === "$getFormRef")
          return () => Ae.getState().getFormRef(e + "." + t.join("."));
        if (m === "$validationWrapper")
          return ({
            children: i,
            hideMessage: o
          }) => /* @__PURE__ */ ne(
            Oe,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: i
            }
          );
        if (m === "$_stateKey") return e;
        if (m === "$_path") return t;
        if (m === "$update")
          return (i) => (r(i, t, { updateType: "update" }), {
            synced: () => {
              const o = b.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...o,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const u = [e, ...t].join(".");
              Qe(u, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (m === "$toggle") {
          const { value: i } = K(
            e,
            t,
            a
          );
          if (typeof i != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            r(!i, t, {
              updateType: "update"
            });
          };
        }
        if (m === "$isolate")
          return (i) => /* @__PURE__ */ ne(
            Fe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: n,
              renderFn: i
            }
          );
        if (m === "$formElement")
          return (i, o) => /* @__PURE__ */ ne(
            Ne,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: n,
              setState: r,
              formOpts: o,
              renderFn: i
            }
          );
        const Y = [...t, m];
        return n({
          path: Y,
          componentId: l,
          meta: a
        });
      }
    }, G = new Proxy({}, O);
    return d.set(U, G), G;
  }
  const S = {
    $revertToInitialState: (t) => {
      const a = b.getState().getShadowMetadata(e, []);
      let l;
      a?.stateSource === "server" && a.baseServerState ? l = a.baseServerState : l = b.getState().initialStateGlobal[e], He(e), se(e, l), n({
        path: [],
        componentId: c
      });
      const C = W(e), U = z(C?.localStorage?.key) ? C?.localStorage?.key(l) : C?.localStorage?.key, j = `${s}-${e}-${U}`;
      return j && localStorage.removeItem(j), ie(e), l;
    },
    $updateInitialState: (t) => {
      const a = ke(
        e,
        r,
        c,
        s
      ), l = b.getState().initialStateGlobal[e], C = W(e), U = z(C?.localStorage?.key) ? C?.localStorage?.key(l) : C?.localStorage?.key, j = `${s}-${e}-${U}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Ce(() => {
        Ve(e, t), se(e, t);
        const O = b.getState().getShadowMetadata(e, []);
        O && O?.components?.forEach((G) => {
          G.forceUpdate();
        });
      }), {
        fetchId: (O) => a.$get()[O]
      };
    }
  };
  return n({
    componentId: c,
    path: []
  });
}
function Ie(e) {
  return be(ft, { proxy: e });
}
function ft({
  proxy: e
}) {
  const r = x(null), c = x(null), s = x(!1), d = `${e._stateKey}-${e._path.join(".")}`, n = e._path.length > 0 ? e._path.join(".") : "root", S = e._meta?.arrayViews?.[n], f = R(e._stateKey, e._path, S);
  return q(() => {
    const t = r.current;
    if (!t || s.current) return;
    const a = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", d);
        return;
      }
      const l = t.parentElement, U = Array.from(l.childNodes).indexOf(t);
      let j = l.getAttribute("data-parent-id");
      j || (j = `parent-${crypto.randomUUID()}`, l.setAttribute("data-parent-id", j)), c.current = `instance-${crypto.randomUUID()}`;
      const O = b.getState().getShadowMetadata(e._stateKey, e._path) || {}, G = O.signals || [];
      G.push({
        instanceId: c.current,
        parentId: j,
        position: U,
        effect: e._effect
      }), b.getState().setShadowMetadata(e._stateKey, e._path, {
        ...O,
        signals: G
      });
      let w = f;
      if (e._effect)
        try {
          w = new Function(
            "state",
            `return (${e._effect})(state)`
          )(f);
        } catch (Y) {
          console.error("Error evaluating effect function:", Y);
        }
      w !== null && typeof w == "object" && (w = JSON.stringify(w));
      const m = document.createTextNode(String(w ?? ""));
      t.replaceWith(m), s.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(a), c.current) {
        const l = b.getState().getShadowMetadata(e._stateKey, e._path) || {};
        l.signals && (l.signals = l.signals.filter(
          (C) => C.instanceId !== c.current
        ), b.getState().setShadowMetadata(e._stateKey, e._path, l));
      }
    };
  }, []), be("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": d
  });
}
export {
  Ie as $cogsSignal,
  Tt as addStateOptions,
  Xe as createCogsState,
  bt as createCogsStateFromSync,
  lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
