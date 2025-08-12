"use client";
import { jsx as ie, Fragment as Ce } from "react/jsx-runtime";
import { useState as K, useRef as L, useEffect as W, useCallback as we, useLayoutEffect as ce, useMemo as le, createElement as Ie, startTransition as De } from "react";
import { transformStateFunc as Ue, isFunction as z, isDeepEqual as ae, isArray as Fe, getDifferences as $e } from "./utility.js";
import { ValidationWrapper as je, FormElementWrapper as Oe, MemoizedCogsItemWrapper as Ne } from "./Components.jsx";
import xe from "superjson";
import { v4 as X } from "uuid";
import { getGlobalStore as T, formRefStore as Ee } from "./store.js";
import { useCogsConfig as Ve } from "./CogsStateClient.jsx";
const {
  getInitialOptions: G,
  updateInitialStateGlobal: ke,
  // ALIAS THE NEW FUNCTIONS TO THE OLD NAMES
  getShadowMetadata: V,
  setShadowMetadata: J,
  getShadowValue: R,
  initializeShadowState: oe,
  updateShadowAtPath: Re,
  insertShadowArrayElement: Le,
  insertManyShadowArrayElements: qe,
  removeShadowArrayElement: Be,
  getSelectedIndex: Tt,
  setInitialStateOptions: ue,
  setServerStateUpdate: We,
  markAsDirty: de,
  registerComponent: It,
  unregisterComponent: bt,
  addPathComponent: Ge,
  clearSelectedIndexesForState: He,
  addStateLog: ze,
  setSyncInfo: Je,
  clearSelectedIndex: Ze,
  getSyncInfo: Ye,
  notifyPathSubscribers: Qe,
  subscribeToPath: Et
  // Note: The old functions are no longer imported under their original names
} = T.getState();
function B(e, r, l) {
  const a = V(e, r);
  if (!!!a?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, r), keys: [] };
  const s = r.length > 0 ? r.join(".") : "root", c = l?.arrayViews?.[s] ?? a.arrayKeys;
  return Array.isArray(c) && c.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, r, c), keys: c ?? [] };
}
function ve(e, r, l) {
  for (let a = 0; a < e.length; a++)
    if (l(e[a], a)) {
      const S = r[a];
      if (S)
        return { key: S, index: a, value: e[a] };
    }
  return null;
}
function pe(e, r) {
  const l = G(e) || {};
  ue(e, {
    ...l,
    ...r
  });
}
function Me({
  stateKey: e,
  options: r,
  initialOptionsPart: l
}) {
  const a = G(e) || {}, s = { ...l[e] || {}, ...a };
  let c = !1;
  if (r)
    for (const i in r)
      s.hasOwnProperty(i) ? (i == "localStorage" && r[i] && s[i].key !== r[i]?.key && (c = !0, s[i] = r[i]), i == "defaultState" && r[i] && s[i] !== r[i] && !ae(s[i], r[i]) && (c = !0, s[i] = r[i])) : (c = !0, s[i] = r[i]);
  s.syncOptions && (!r || !r.hasOwnProperty("syncOptions")) && (c = !0), c && ue(e, s);
}
function Mt(e, { formElements: r, validation: l }) {
  return { initialState: e, formElements: r, validation: l };
}
const Xe = (e, r) => {
  let l = e;
  const [a, S] = Ue(l);
  r?.__fromSyncSchema && r?.__syncNotifications && T.getState().setInitialStateOptions("__notifications", r.__syncNotifications), r?.__fromSyncSchema && r?.__apiParamsMap && T.getState().setInitialStateOptions("__apiParamsMap", r.__apiParamsMap), Object.keys(a).forEach((i) => {
    let f = S[i] || {};
    const t = {
      ...f
    };
    if (r?.formElements && (t.formElements = {
      ...r.formElements,
      ...f.formElements || {}
    }), r?.validation && (t.validation = {
      ...r.validation,
      ...f.validation || {}
    }, r.validation.key && !f.validation?.key && (t.validation.key = `${r.validation.key}.${i}`)), r?.__syncSchemas?.[i]?.schemas?.validation && (t.validation = {
      zodSchemaV4: r.__syncSchemas[i].schemas.validation,
      ...f.validation
    }), Object.keys(t).length > 0) {
      const u = G(i);
      u ? ue(i, {
        ...u,
        ...t
      }) : ue(i, t);
    }
  }), Object.keys(a).forEach((i) => {
    oe(i, a[i]);
  }), console.log("new stateObject ", T.getState().shadowStateStore);
  const s = (i, f) => {
    const [t] = K(f?.componentId ?? X());
    Me({
      stateKey: i,
      options: f,
      initialOptionsPart: S
    });
    const u = R(i, []) || a[i], I = f?.modifyState ? f.modifyState(u) : u;
    return lt(I, {
      stateKey: i,
      syncUpdate: f?.syncUpdate,
      componentId: t,
      localStorage: f?.localStorage,
      middleware: f?.middleware,
      reactiveType: f?.reactiveType,
      reactiveDeps: f?.reactiveDeps,
      defaultState: f?.defaultState,
      dependencies: f?.dependencies,
      serverState: f?.serverState,
      syncOptions: f?.syncOptions,
      __useSync: r?.__useSync
    });
  };
  function c(i, f) {
    Me({ stateKey: i, options: f, initialOptionsPart: S }), f.localStorage && et(i, f), be(i);
  }
  return { useCogsState: s, setCogsOptions: c };
};
function At(e, r) {
  const l = e.schemas, a = {}, S = {};
  for (const s in l) {
    const c = l[s];
    a[s] = c?.schemas?.defaultValues || {}, c?.api?.queryData?._paramType && (S[s] = c.api.queryData._paramType);
  }
  return Xe(a, {
    __fromSyncSchema: !0,
    __syncNotifications: e.notifications,
    __apiParamsMap: S,
    __useSync: r,
    __syncSchemas: l
  });
}
const Ke = (e, r, l, a, S) => {
  l?.log && console.log(
    "saving to localstorage",
    r,
    l.localStorage?.key,
    a
  );
  const s = z(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (s && a) {
    const c = `${a}-${r}-${s}`;
    let i;
    try {
      i = ge(c)?.lastSyncedWithServer;
    } catch {
    }
    const f = V(r, []), t = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: i,
      stateSource: f?.stateSource,
      baseServerState: f?.baseServerState
    }, u = xe.serialize(t);
    window.localStorage.setItem(
      c,
      JSON.stringify(u.json)
    );
  }
}, ge = (e) => {
  if (!e) return null;
  try {
    const r = window.localStorage.getItem(e);
    return r ? JSON.parse(r) : null;
  } catch (r) {
    return console.error("Error loading from localStorage:", r), null;
  }
}, et = (e, r) => {
  const l = R(e, []), { sessionId: a } = Ve(), S = z(r?.localStorage?.key) ? r.localStorage.key(l) : r?.localStorage?.key;
  if (S && a) {
    const s = ge(
      `${a}-${e}-${S}`
    );
    if (s && s.lastUpdated > (s.lastSyncedWithServer || 0))
      return be(e), !0;
  }
  return !1;
}, be = (e) => {
  const r = V(e, []);
  if (!r) return;
  const l = /* @__PURE__ */ new Set();
  r?.components?.forEach((a) => {
    (a ? Array.isArray(a.reactiveType) ? a.reactiveType : [a.reactiveType || "component"] : null)?.includes("none") || l.add(() => a.forceUpdate());
  }), queueMicrotask(() => {
    l.forEach((a) => a());
  });
};
function fe(e, r, l, a) {
  const S = V(e, r);
  if (J(e, r, {
    ...S,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: a || Date.now()
  }), Array.isArray(l)) {
    const s = V(e, r);
    s?.arrayKeys && s.arrayKeys.forEach((c, i) => {
      const f = [...r, c], t = l[i];
      t !== void 0 && fe(
        e,
        f,
        t,
        a
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((s) => {
    const c = [...r, s], i = l[s];
    fe(e, c, i, a);
  });
}
let Se = [], Te = !1;
function tt() {
  Te || (Te = !0, queueMicrotask(it));
}
function rt(e, r, l) {
  const a = T.getState().getShadowValue(e, r), S = z(l) ? l(a) : l;
  Re(e, r, S), de(e, r, { bubble: !0 });
  const s = V(e, r);
  return {
    type: "update",
    oldValue: a,
    newValue: S,
    shadowMeta: s
  };
}
function nt(e, r) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: a, effect: S }) => {
    const s = document.querySelector(`[data-parent-id="${l}"]`);
    if (!s) return;
    const c = Array.from(s.childNodes);
    if (!c[a]) return;
    let i = r;
    if (S && r !== null)
      try {
        i = new Function("state", `return (${S})(state)`)(
          r
        );
      } catch (f) {
        console.error("Error evaluating effect function:", f);
      }
    i !== null && typeof i == "object" && (i = JSON.stringify(i)), c[a].textContent = String(i ?? "");
  });
}
function at(e, r, l) {
  const a = V(e, []);
  if (!a?.components)
    return /* @__PURE__ */ new Set();
  const S = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let s = [...r];
    for (; ; ) {
      const c = V(e, s);
      if (c?.pathComponents && c.pathComponents.forEach((i) => {
        const f = a.components?.get(i);
        f && ((Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"]).includes("none") || S.add(f));
      }), s.length === 0) break;
      s.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Fe(l.newValue) && $e(l.newValue, l.oldValue).forEach((i) => {
      const f = i.split("."), t = [...r, ...f], u = V(e, t);
      u?.pathComponents && u.pathComponents.forEach((I) => {
        const U = a.components?.get(I);
        U && ((Array.isArray(U.reactiveType) ? U.reactiveType : [U.reactiveType || "component"]).includes("none") || S.add(U));
      });
    });
  } else if (l.type === "insert" || l.type === "cut") {
    const s = l.type === "insert" ? r : r.slice(0, -1), c = V(e, s);
    c?.pathComponents && c.pathComponents.forEach((i) => {
      const f = a.components?.get(i);
      f && S.add(f);
    });
  }
  return a.components.forEach((s, c) => {
    if (S.has(s))
      return;
    const i = Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"];
    if (i.includes("all"))
      S.add(s);
    else if (i.includes("deps") && s.depsFunction) {
      const f = R(e, []), t = s.depsFunction(f);
      (t === !0 || Array.isArray(t) && !ae(s.prevDeps, t)) && (s.prevDeps = t, S.add(s));
    }
  }), S;
}
function ot(e, r, l) {
  let a;
  if (z(l)) {
    const { value: s } = Q(e, r);
    a = l({ state: s, uuid: X() });
  } else
    a = l;
  Le(e, r, a), de(e, r, { bubble: !0 });
  const S = V(e, r);
  if (S?.arrayKeys) {
    const s = S.arrayKeys[S.arrayKeys.length - 1];
    if (s) {
      const c = s.split(".").slice(1);
      de(e, c, { bubble: !1 });
    }
  }
  return { type: "insert", newValue: a, shadowMeta: S };
}
function st(e, r) {
  const l = r.slice(0, -1), a = R(e, r);
  return Be(e, r), de(e, l, { bubble: !0 }), { type: "cut", oldValue: a, parentPath: l };
}
function it() {
  const e = /* @__PURE__ */ new Set(), r = [], l = [];
  for (const a of Se) {
    if (a.status && a.updateType) {
      l.push(a);
      continue;
    }
    const S = a, s = S.type === "cut" ? null : S.newValue;
    S.shadowMeta?.signals?.length > 0 && r.push({ shadowMeta: S.shadowMeta, displayValue: s }), at(
      S.stateKey,
      S.path,
      S
    ).forEach((i) => {
      e.add(i);
    });
  }
  l.length > 0 && ze(l), r.forEach(({ shadowMeta: a, displayValue: S }) => {
    nt(a, S);
  }), e.forEach((a) => {
    a.forceUpdate();
  }), Se = [], Te = !1;
}
function ct(e, r, l, a) {
  return (s, c, i, f) => {
    S(e, c, s, i);
  };
  function S(s, c, i, f) {
    let t;
    switch (f.updateType) {
      case "update":
        t = rt(s, c, i);
        break;
      case "insert":
        t = ot(s, c, i);
        break;
      case "cut":
        t = st(s, c);
        break;
    }
    t.stateKey = s, t.path = c, Se.push(t), tt();
    const u = {
      timeStamp: Date.now(),
      stateKey: s,
      path: c,
      updateType: f.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null
    };
    Se.push(u), t.newValue !== void 0 && Ke(
      t.newValue,
      s,
      a.current,
      l
    ), a.current?.middleware && a.current.middleware({ update: u }), f.sync !== !1 && r.current?.connected && r.current.updateState({ operation: u });
  }
}
function lt(e, {
  stateKey: r,
  localStorage: l,
  formElements: a,
  reactiveDeps: S,
  reactiveType: s,
  componentId: c,
  defaultState: i,
  syncUpdate: f,
  dependencies: t,
  serverState: u,
  __useSync: I
} = {}) {
  const [U, O] = K({}), { sessionId: F } = Ve();
  let x = !r;
  const [w] = K(r ?? X()), ee = L(c ?? X()), m = L(
    null
  );
  m.current = G(w) ?? null, W(() => {
    if (f && f.stateKey === w && f.path?.[0]) {
      const g = `${f.stateKey}:${f.path.join(".")}`;
      Je(g, {
        timeStamp: f.timeStamp,
        userId: f.userId
      });
    }
  }, [f]);
  const te = we(
    (g) => {
      const p = g ? { ...G(w), ...g } : G(w), b = p?.defaultState || i || e;
      if (p?.serverState?.status === "success" && p?.serverState?.data !== void 0)
        return {
          value: p.serverState.data,
          source: "server",
          timestamp: p.serverState.timestamp || Date.now()
        };
      if (p?.localStorage?.key && F) {
        const M = z(p.localStorage.key) ? p.localStorage.key(b) : p.localStorage.key, A = ge(
          `${F}-${w}-${M}`
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
    [w, i, e, F]
  );
  W(() => {
    We(w, u);
  }, [u, w]), W(() => T.getState().subscribeToPath(w, (y) => {
    if (y?.type === "SERVER_STATE_UPDATE") {
      const p = y.serverState;
      if (p?.status !== "success" || p.data === void 0)
        return;
      pe(w, { serverState: p });
      const b = typeof p.merge == "object" ? p.merge : p.merge === !0 ? { strategy: "append" } : null, _ = R(w, []), M = p.data;
      if (b && b.strategy === "append" && "key" in b && // Type guard for key
      Array.isArray(_) && Array.isArray(M)) {
        const A = b.key;
        if (!A) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const D = new Set(
          _.map((j) => j[A])
        ), E = M.filter(
          (j) => !D.has(j[A])
        );
        E.length > 0 && qe(w, [], E);
        const k = R(w, []);
        fe(
          w,
          [],
          k,
          p.timestamp
        );
      } else
        oe(w, M), fe(
          w,
          [],
          M,
          p.timestamp
        );
    }
  }), [w, te]), W(() => {
    const g = T.getState().getShadowMetadata(w, []);
    if (g && g.stateSource)
      return;
    const y = G(w), p = {
      syncEnabled: !!v && !!h,
      validationEnabled: !!(y?.validation?.zodSchemaV4 || y?.validation?.zodSchemaV3),
      localStorageEnabled: !!y?.localStorage?.key
    };
    if (J(w, [], {
      ...g,
      features: p
    }), y?.defaultState !== void 0 || i !== void 0) {
      const b = y?.defaultState || i;
      y?.defaultState || pe(w, {
        defaultState: b
      });
      const { value: _, source: M, timestamp: A } = te();
      oe(w, _), J(w, [], {
        stateSource: M,
        lastServerSync: M === "server" ? A : void 0,
        isDirty: !1,
        baseServerState: M === "server" ? _ : void 0
      }), be(w);
    }
  }, [w, ...t || []]), ce(() => {
    x && pe(w, {
      formElements: a,
      defaultState: i,
      localStorage: l,
      middleware: m.current?.middleware
    });
    const g = `${w}////${ee.current}`, y = V(w, []), p = y?.components || /* @__PURE__ */ new Map();
    return p.set(g, {
      forceUpdate: () => O({}),
      reactiveType: s ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: S || void 0,
      deps: S ? S(R(w, [])) : [],
      prevDeps: S ? S(R(w, [])) : []
    }), J(w, [], {
      ...y,
      components: p
    }), O({}), () => {
      const b = V(w, []), _ = b?.components?.get(g);
      _?.paths && _.paths.forEach((M) => {
        const D = M.split(".").slice(1), E = T.getState().getShadowMetadata(w, D);
        E?.pathComponents && E.pathComponents.size === 0 && (delete E.pathComponents, T.getState().setShadowMetadata(w, D, E));
      }), b?.components && J(w, [], b);
    };
  }, []);
  const o = L(null), n = ct(
    w,
    o,
    F,
    m
  );
  T.getState().initialStateGlobal[w] || ke(w, e);
  const d = le(() => Pe(
    w,
    n,
    ee.current,
    F
  ), [w, F]), v = I, h = m.current?.syncOptions;
  return v && (o.current = v(
    d,
    h ?? {}
  )), d;
}
const ut = (e, r, l) => {
  let a = V(e, r)?.arrayKeys || [];
  const S = l?.transforms;
  if (!S || S.length === 0)
    return a;
  for (const s of S)
    if (s.type === "filter") {
      const c = [];
      a.forEach((i, f) => {
        const t = R(e, [...r, i]);
        s.fn(t, f) && c.push(i);
      }), a = c;
    } else s.type === "sort" && a.sort((c, i) => {
      const f = R(e, [...r, c]), t = R(e, [...r, i]);
      return s.fn(f, t);
    });
  return a;
}, Ae = (e, r, l) => {
  const a = `${e}////${r}`, s = V(e, [])?.components?.get(a);
  !s || s.reactiveType === "none" || !(Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType]).includes("component") || Ge(e, l, a);
}, ne = (e, r, l) => {
  const a = V(e, []), S = /* @__PURE__ */ new Set();
  a?.components && a.components.forEach((c, i) => {
    (Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType || "component"]).includes("all") && (c.forceUpdate(), S.add(i));
  }), V(e, [
    ...r,
    "getSelected"
  ])?.pathComponents?.forEach((c) => {
    a?.components?.get(c)?.forceUpdate();
  });
  const s = V(e, r);
  for (let c of s?.arrayKeys || []) {
    const i = c + ".selected", f = V(e, i.split(".").slice(1));
    c == l && f?.pathComponents?.forEach((t) => {
      a?.components?.get(t)?.forceUpdate();
    });
  }
};
function Q(e, r, l) {
  const a = V(e, r), S = r.length > 0 ? r.join(".") : "root", s = l?.arrayViews?.[S];
  if (Array.isArray(s) && s.length === 0)
    return {
      shadowMeta: a,
      value: [],
      arrayKeys: a?.arrayKeys
    };
  const c = R(e, r, s);
  return {
    shadowMeta: a,
    value: c,
    arrayKeys: a?.arrayKeys
  };
}
function Pe(e, r, l, a) {
  const S = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set([
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
  function c({
    path: t = [],
    meta: u,
    componentId: I
  }) {
    const U = u ? JSON.stringify(u.arrayViews || u.transforms) : "", O = t.join(".") + ":" + U;
    if (S.has(O))
      return S.get(O);
    const F = [e, ...t].join("."), x = {
      get(ee, m) {
        if (t.length === 0 && m in i)
          return i[m];
        if (!s.has(m)) {
          const o = [...t, m];
          return c({
            path: o,
            componentId: I,
            meta: u
          });
        }
        if (m === "_rebuildStateShape")
          return c;
        if (m === "sync" && t.length === 0)
          return async function() {
            const o = T.getState().getInitialOptions(e), n = o?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const d = T.getState().getShadowValue(e, []), v = o?.validation?.key;
            try {
              const h = await n.action(d);
              if (h && !h.success && h.errors, h?.success) {
                const g = T.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...g,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: d
                  // Update base server state
                }), n.onSuccess && n.onSuccess(h.data);
              } else !h?.success && n.onError && n.onError(h.error);
              return h;
            } catch (h) {
              return n.onError && n.onError(h), { success: !1, error: h };
            }
          };
        if (m === "_status" || m === "getStatus") {
          const o = () => {
            const { shadowMeta: n, value: d } = Q(e, t, u);
            return n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || d !== void 0 && !n ? "fresh" : "unknown";
          };
          return m === "_status" ? o() : o;
        }
        if (m === "removeStorage")
          return () => {
            const o = T.getState().initialStateGlobal[e], n = G(e), d = z(n?.localStorage?.key) ? n.localStorage.key(o) : n?.localStorage?.key, v = `${a}-${e}-${d}`;
            v && localStorage.removeItem(v);
          };
        if (m === "showValidationErrors")
          return () => {
            const { shadowMeta: o } = Q(e, t, u);
            return o?.validation?.status === "INVALID" && o.validation.errors.length > 0 ? o.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (m === "getSelected")
          return () => {
            const o = [e, ...t].join(".");
            Ae(e, I, [
              ...t,
              "getSelected"
            ]);
            const n = T.getState().selectedIndicesMap.get(o);
            if (!n)
              return;
            const d = t.join("."), v = u?.arrayViews?.[d], h = n.split(".").pop();
            if (!(v && !v.includes(h) || R(
              e,
              n.split(".").slice(1)
            ) === void 0))
              return c({
                path: n.split(".").slice(1),
                componentId: I,
                meta: u
              });
          };
        if (m === "getSelectedIndex")
          return () => {
            const o = e + "." + t.join(".");
            t.join(".");
            const n = T.getState().selectedIndicesMap.get(o);
            if (!n)
              return -1;
            const { keys: d } = B(e, t, u);
            if (!d)
              return -1;
            const v = n.split(".").pop();
            return d.indexOf(v);
          };
        if (m === "clearSelected")
          return ne(e, t), () => {
            Ze({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (m === "useVirtualView")
          return (o) => {
            const {
              itemHeight: n = 50,
              overscan: d = 6,
              stickToBottom: v = !1,
              scrollStickTolerance: h = 75
            } = o, g = L(null), [y, p] = K({
              startIndex: 0,
              endIndex: 10
            }), [b, _] = K({}), M = L(!0);
            W(() => {
              const C = setInterval(() => {
                _({});
              }, 1e3);
              return () => clearInterval(C);
            }, []);
            const A = L({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), D = L(
              /* @__PURE__ */ new Map()
            ), { keys: E } = B(e, t, u);
            W(() => {
              const C = [e, ...t].join("."), P = T.getState().subscribeToPath(C, (N) => {
                N.type !== "GET_SELECTED" && N.type;
              });
              return () => {
                P();
              };
            }, [I, e, t.join(".")]), ce(() => {
              if (v && E.length > 0 && g.current && !A.current.isUserScrolling && M.current) {
                const C = g.current, P = () => {
                  if (C.clientHeight > 0) {
                    const N = Math.ceil(
                      C.clientHeight / n
                    ), q = E.length - 1, $ = Math.max(
                      0,
                      q - N - d
                    );
                    p({ startIndex: $, endIndex: q }), requestAnimationFrame(() => {
                      Y("instant"), M.current = !1;
                    });
                  } else
                    requestAnimationFrame(P);
                };
                P();
              }
            }, [E.length, v, n, d]);
            const k = L(y);
            ce(() => {
              k.current = y;
            }, [y]);
            const j = L(E);
            ce(() => {
              j.current = E;
            }, [E]);
            const se = we(() => {
              const C = g.current;
              if (!C) return;
              const P = C.scrollTop, { scrollHeight: N, clientHeight: q } = C, $ = A.current, re = N - (P + q), ye = $.isNearBottom;
              $.isNearBottom = re <= h, P < $.lastScrollTop ? ($.scrollUpCount++, $.scrollUpCount > 3 && ye && ($.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : $.isNearBottom && ($.isUserScrolling = !1, $.scrollUpCount = 0), $.lastScrollTop = P;
              let Z = 0;
              for (let H = 0; H < E.length; H++) {
                const me = E[H], he = D.current.get(me);
                if (he && he.offset + he.height > P) {
                  Z = H;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                D.current,
                Z,
                y
              ), Z !== y.startIndex && y.startIndex != 0) {
                const H = Math.ceil(q / n);
                p({
                  startIndex: Math.max(0, Z - d),
                  endIndex: Math.min(
                    E.length - 1,
                    Z + H + d
                  )
                });
              }
            }, [
              E.length,
              y.startIndex,
              n,
              d,
              h
            ]);
            W(() => {
              const C = g.current;
              if (C)
                return C.addEventListener("scroll", se, {
                  passive: !0
                }), () => {
                  C.removeEventListener("scroll", se);
                };
            }, [se, v]);
            const Y = we(
              (C = "smooth") => {
                const P = g.current;
                if (!P) return;
                A.current.isUserScrolling = !1, A.current.isNearBottom = !0, A.current.scrollUpCount = 0;
                const N = () => {
                  const q = ($ = 0) => {
                    if ($ > 5) return;
                    const re = P.scrollHeight, ye = P.scrollTop, Z = P.clientHeight;
                    ye + Z >= re - 1 || (P.scrollTo({
                      top: re,
                      behavior: C
                    }), setTimeout(() => {
                      const H = P.scrollHeight, me = P.scrollTop;
                      (H !== re || me + Z < H - 1) && q($ + 1);
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
            return W(() => {
              if (!v || !g.current) return;
              const C = g.current, P = A.current;
              let N;
              const q = () => {
                clearTimeout(N), N = setTimeout(() => {
                  !P.isUserScrolling && P.isNearBottom && Y(
                    M.current ? "instant" : "smooth"
                  );
                }, 100);
              }, $ = new MutationObserver(() => {
                P.isUserScrolling || q();
              });
              return $.observe(C, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), M.current ? setTimeout(() => {
                Y("instant");
              }, 0) : q(), () => {
                clearTimeout(N), $.disconnect();
              };
            }, [v, E.length, Y]), {
              virtualState: le(() => {
                const C = Array.isArray(E) ? E.slice(y.startIndex, y.endIndex + 1) : [], P = t.length > 0 ? t.join(".") : "root";
                return c({
                  path: t,
                  componentId: I,
                  meta: {
                    ...u,
                    arrayViews: { [P]: C },
                    serverStateIsUpStream: !0
                  }
                });
              }, [y.startIndex, y.endIndex, E, u]),
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
                    transform: `translateY(${D.current.get(E[y.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: Y,
              scrollToIndex: (C, P = "smooth") => {
                if (g.current && E[C]) {
                  const N = D.current.get(E[C])?.offset || 0;
                  g.current.scrollTo({ top: N, behavior: P });
                }
              }
            };
          };
        if (m === "stateMap")
          return (o) => {
            const { value: n, keys: d } = B(
              e,
              t,
              u
            );
            if (!d || !Array.isArray(n))
              return [];
            const v = c({
              path: t,
              componentId: I,
              meta: u
            });
            return n.map((h, g) => {
              const y = d[g];
              if (!y) return;
              const p = [...t, y], b = c({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: I,
                meta: u
              });
              return o(b, g, v);
            });
          };
        if (m === "stateFilter")
          return (o) => {
            const n = t.length > 0 ? t.join(".") : "root", { keys: d, value: v } = B(
              e,
              t,
              u
            );
            if (!Array.isArray(v))
              throw new Error("stateFilter can only be used on arrays");
            const h = [];
            return v.forEach((g, y) => {
              if (o(g, y)) {
                const p = d[y];
                p && h.push(p);
              }
            }), c({
              path: t,
              componentId: I,
              meta: {
                ...u,
                arrayViews: {
                  ...u?.arrayViews || {},
                  [n]: h
                },
                transforms: [
                  ...u?.transforms || [],
                  { type: "filter", fn: o, path: t }
                ]
              }
            });
          };
        if (m === "stateSort")
          return (o) => {
            const n = t.length > 0 ? t.join(".") : "root", { value: d, keys: v } = B(
              e,
              t,
              u
            );
            if (!Array.isArray(d) || !v)
              throw new Error("No array keys found for sorting");
            const h = d.map((y, p) => ({
              item: y,
              key: v[p]
            }));
            h.sort((y, p) => o(y.item, p.item));
            const g = h.map((y) => y.key);
            return c({
              path: t,
              componentId: I,
              meta: {
                ...u,
                arrayViews: {
                  ...u?.arrayViews || {},
                  [n]: g
                },
                transforms: [
                  ...u?.transforms || [],
                  { type: "sort", fn: o, path: t }
                ]
              }
            });
          };
        if (m === "stream")
          return function(o = {}) {
            const {
              bufferSize: n = 100,
              flushInterval: d = 100,
              bufferStrategy: v = "accumulate",
              store: h,
              onFlush: g
            } = o;
            let y = [], p = !1, b = null;
            const _ = (k) => {
              if (!p) {
                if (v === "sliding" && y.length >= n)
                  y.shift();
                else if (v === "dropping" && y.length >= n)
                  return;
                y.push(k), y.length >= n && M();
              }
            }, M = () => {
              if (y.length === 0) return;
              const k = [...y];
              if (y = [], h) {
                const j = h(k);
                j !== void 0 && (Array.isArray(j) ? j : [j]).forEach((Y) => {
                  r(Y, t, {
                    updateType: "insert"
                  });
                });
              } else
                k.forEach((j) => {
                  r(j, t, {
                    updateType: "insert"
                  });
                });
              g?.(k);
            };
            d > 0 && (b = setInterval(M, d));
            const A = X(), D = V(e, t) || {}, E = D.streams || /* @__PURE__ */ new Map();
            return E.set(A, { buffer: y, flushTimer: b }), J(e, t, {
              ...D,
              streams: E
            }), {
              write: (k) => _(k),
              writeMany: (k) => k.forEach(_),
              flush: () => M(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, y.length > 0 && M();
              },
              close: () => {
                M(), b && clearInterval(b);
                const k = T.getState().getShadowMetadata(e, t);
                k?.streams && k.streams.delete(A);
              }
            };
          };
        if (m === "stateList")
          return (o) => /* @__PURE__ */ ie(() => {
            const d = L(/* @__PURE__ */ new Map()), [v, h] = K({}), g = t.length > 0 ? t.join(".") : "root", y = le(() => ut(e, t, u), [
              e,
              t.join("."),
              // Only recalculate if the underlying array keys or transforms change
              V(e, t)?.arrayKeys,
              u?.transforms
            ]), p = le(() => ({
              ...u,
              arrayViews: {
                ...u?.arrayViews || {},
                [g]: y
              }
            }), [u, g, y]), { value: b } = B(
              e,
              t,
              p
            );
            if (W(() => {
              const A = T.getState().subscribeToPath(F, (D) => {
                if (D.type === "GET_SELECTED")
                  return;
                const k = T.getState().getShadowMetadata(e, t)?.transformCaches;
                if (k)
                  for (const j of k.keys())
                    j.startsWith(I) && k.delete(j);
                (D.type === "INSERT" || D.type === "INSERT_MANY" || D.type === "REMOVE" || D.type === "CLEAR_SELECTION" || D.type === "SERVER_STATE_UPDATE" && !u?.serverStateIsUpStream) && h({});
              });
              return () => {
                A();
              };
            }, [I, F]), !Array.isArray(b))
              return null;
            const _ = c({
              path: t,
              componentId: I,
              meta: p
              // Use updated meta here
            }), M = b.map((A, D) => {
              const E = y[D];
              if (!E)
                return null;
              let k = d.current.get(E);
              k || (k = X(), d.current.set(E, k));
              const j = [...t, E];
              return Ie(Ne, {
                key: E,
                stateKey: e,
                itemComponentId: k,
                itemPath: j,
                localIndex: D,
                arraySetter: _,
                rebuildStateShape: c,
                renderFn: o
              });
            });
            return /* @__PURE__ */ ie(Ce, { children: M });
          }, {});
        if (m === "stateFlattenOn")
          return (o) => {
            const n = t.length > 0 ? t.join(".") : "root", d = u?.arrayViews?.[n], v = T.getState().getShadowValue(e, t, d);
            return Array.isArray(v) ? c({
              path: [...t, "[*]", o],
              componentId: I,
              meta: u
            }) : [];
          };
        if (m === "index")
          return (o) => {
            const n = t.length > 0 ? t.join(".") : "root", d = u?.arrayViews?.[n];
            if (d) {
              const g = d[o];
              return g ? c({
                path: [...t, g],
                componentId: I,
                meta: u
              }) : void 0;
            }
            const v = V(e, t);
            if (!v?.arrayKeys) return;
            const h = v.arrayKeys[o];
            if (h)
              return c({
                path: [...t, h],
                componentId: I,
                meta: u
              });
          };
        if (m === "last")
          return () => {
            const { keys: o } = B(e, t, u);
            if (!o || o.length === 0)
              return;
            const n = o[o.length - 1];
            if (!n)
              return;
            const d = [...t, n];
            return c({
              path: d,
              componentId: I,
              meta: u
            });
          };
        if (m === "insert")
          return (o, n) => {
            r(o, t, { updateType: "insert" });
          };
        if (m === "uniqueInsert")
          return (o, n, d) => {
            const { value: v } = Q(
              e,
              t,
              u
            ), h = z(o) ? o(v) : o;
            let g = null;
            if (!v.some((p) => {
              const b = n ? n.every(
                (_) => ae(p[_], h[_])
              ) : ae(p, h);
              return b && (g = p), b;
            }))
              r(h, t, { updateType: "insert" });
            else if (d && g) {
              const p = d(g), b = v.map(
                (_) => ae(_, g) ? p : _
              );
              r(b, t, {
                updateType: "update"
              });
            }
          };
        if (m === "cut")
          return (o, n) => {
            const d = V(e, t);
            if (!d?.arrayKeys || d.arrayKeys.length === 0)
              return;
            const v = o === -1 ? d.arrayKeys.length - 1 : o !== void 0 ? o : d.arrayKeys.length - 1, h = d.arrayKeys[v];
            h && r(null, [...t, h], {
              updateType: "cut"
            });
          };
        if (m === "cutSelected")
          return () => {
            const o = [e, ...t].join("."), { keys: n } = B(e, t, u);
            if (!n || n.length === 0)
              return;
            const d = T.getState().selectedIndicesMap.get(o);
            if (!d)
              return;
            const v = d.split(".").pop();
            if (!n.includes(v))
              return;
            const h = d.split(".").slice(1);
            T.getState().clearSelectedIndex({ arrayKey: o });
            const g = h.slice(0, -1);
            ne(e, g), r(null, h, {
              updateType: "cut"
            });
          };
        if (m === "cutByValue")
          return (o) => {
            const {
              isArray: n,
              value: d,
              keys: v
            } = B(e, t, u);
            if (!n) return;
            const h = ve(d, v, (g) => g === o);
            h && r(null, [...t, h.key], {
              updateType: "cut"
            });
          };
        if (m === "toggleByValue")
          return (o) => {
            const {
              isArray: n,
              value: d,
              keys: v
            } = B(e, t, u);
            if (!n) return;
            const h = ve(d, v, (g) => g === o);
            if (h) {
              const g = [...t, h.key];
              r(null, g, {
                updateType: "cut"
              });
            } else
              r(o, t, { updateType: "insert" });
          };
        if (m === "findWith")
          return (o, n) => {
            const { isArray: d, value: v, keys: h } = B(e, t, u);
            if (!d)
              throw new Error("findWith can only be used on arrays");
            const g = ve(
              v,
              h,
              (y) => y?.[o] === n
            );
            return c(g ? {
              path: [...t, g.key],
              // e.g., ['itemInstances', 'inst-1', 'properties', 'prop-b']
              componentId: I,
              meta: u
            } : {
              path: [...t, `not_found_${X()}`],
              componentId: I,
              meta: u
            });
          };
        if (m === "cutThis") {
          const { value: o } = Q(e, t, u), n = t.slice(0, -1);
          return ne(e, n), () => {
            r(o, t, { updateType: "cut" });
          };
        }
        if (m === "get")
          return () => {
            Ae(e, I, t);
            const { value: o } = Q(e, t, u);
            return o;
          };
        if (m === "$derive")
          return (o) => _e({
            _stateKey: e,
            _path: t,
            _effect: o.toString(),
            _meta: u
          });
        if (m === "$get")
          return () => _e({ _stateKey: e, _path: t, _meta: u });
        if (m === "lastSynced") {
          const o = `${e}:${t.join(".")}`;
          return Ye(o);
        }
        if (m == "getLocalStorage")
          return (o) => ge(a + "-" + e + "-" + o);
        if (m === "isSelected") {
          const o = t.slice(0, -1);
          if (V(e, o)?.arrayKeys) {
            const d = e + "." + o.join("."), v = T.getState().selectedIndicesMap.get(d), h = e + "." + t.join(".");
            return v === h;
          }
          return;
        }
        if (m === "setSelected")
          return (o) => {
            const n = t.slice(0, -1), d = e + "." + n.join("."), v = e + "." + t.join(".");
            ne(e, n, void 0), T.getState().selectedIndicesMap.get(d), o && T.getState().setSelectedIndex(d, v);
          };
        if (m === "toggleSelected")
          return () => {
            const o = t.slice(0, -1), n = e + "." + o.join("."), d = e + "." + t.join(".");
            T.getState().selectedIndicesMap.get(n) === d ? T.getState().clearSelectedIndex({ arrayKey: n }) : T.getState().setSelectedIndex(n, d), ne(e, o);
          };
        if (m === "_componentId")
          return I;
        if (t.length == 0) {
          if (m === "addZodValidation")
            return (o) => {
              o.forEach((n) => {
                const d = T.getState().getShadowMetadata(e, n.path) || {};
                T.getState().setShadowMetadata(e, n.path, {
                  ...d,
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
          if (m === "clearZodValidation")
            return (o) => {
              if (!o)
                throw new Error("clearZodValidation requires a path");
              const n = V(e, o) || {};
              J(e, o, {
                ...n,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (m === "applyJsonPatch")
            return (o) => {
              const n = T.getState(), d = n.getShadowMetadata(e, []);
              if (!d?.components) return;
              const v = (g) => !g || g === "/" ? [] : g.split("/").slice(1).map((y) => y.replace(/~1/g, "/").replace(/~0/g, "~")), h = /* @__PURE__ */ new Set();
              for (const g of o) {
                const y = v(g.path);
                switch (g.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = g;
                    n.updateShadowAtPath(e, y, p), n.markAsDirty(e, y, { bubble: !0 });
                    let b = [...y];
                    for (; ; ) {
                      const _ = n.getShadowMetadata(
                        e,
                        b
                      );
                      if (_?.pathComponents && _.pathComponents.forEach((M) => {
                        if (!h.has(M)) {
                          const A = d.components?.get(M);
                          A && (A.forceUpdate(), h.add(M));
                        }
                      }), b.length === 0) break;
                      b.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = y.slice(0, -1);
                    n.removeShadowArrayElement(e, y), n.markAsDirty(e, p, { bubble: !0 });
                    let b = [...p];
                    for (; ; ) {
                      const _ = n.getShadowMetadata(
                        e,
                        b
                      );
                      if (_?.pathComponents && _.pathComponents.forEach((M) => {
                        if (!h.has(M)) {
                          const A = d.components?.get(M);
                          A && (A.forceUpdate(), h.add(M));
                        }
                      }), b.length === 0) break;
                      b.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (m === "getComponents")
            return () => V(e, [])?.components;
          if (m === "getAllFormRefs")
            return () => Ee.getState().getFormRefsByStateKey(e);
        }
        if (m === "getFormRef")
          return () => Ee.getState().getFormRef(e + "." + t.join("."));
        if (m === "validationWrapper")
          return ({
            children: o,
            hideMessage: n
          }) => /* @__PURE__ */ ie(
            je,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: o
            }
          );
        if (m === "_stateKey") return e;
        if (m === "_path") return t;
        if (m === "update")
          return (o) => (console.log("udpating", o, t), r(o, t, { updateType: "update" }), {
            synced: () => {
              const n = T.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...n,
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
            u
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
          return (o, n) => /* @__PURE__ */ ie(
            Oe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              setState: r,
              formOpts: n,
              renderFn: o
            }
          );
        const te = [...t, m];
        return T.getState().getShadowValue(e, te), c({
          path: te,
          componentId: I,
          meta: u
        });
      }
    }, w = new Proxy({}, x);
    return S.set(O, w), w;
  }
  const i = {
    revertToInitialState: (t) => {
      const u = T.getState().getShadowMetadata(e, []);
      u?.stateSource === "server" && u.baseServerState ? u.baseServerState : T.getState().initialStateGlobal[e];
      const I = T.getState().initialStateGlobal[e];
      He(e), oe(e, I), c({
        path: [],
        componentId: l
      });
      const U = G(e), O = z(U?.localStorage?.key) ? U?.localStorage?.key(I) : U?.localStorage?.key, F = `${a}-${e}-${O}`;
      F && localStorage.removeItem(F);
      const x = T.getState().getShadowMetadata(e, []);
      return x && x?.components?.forEach((w) => {
        w.forceUpdate();
      }), I;
    },
    updateInitialState: (t) => {
      const u = Pe(
        e,
        r,
        l,
        a
      ), I = T.getState().initialStateGlobal[e], U = G(e), O = z(U?.localStorage?.key) ? U?.localStorage?.key(I) : U?.localStorage?.key, F = `${a}-${e}-${O}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), De(() => {
        ke(e, t), oe(e, t);
        const x = T.getState().getShadowMetadata(e, []);
        x && x?.components?.forEach((w) => {
          w.forceUpdate();
        });
      }), {
        fetchId: (x) => u.get()[x]
      };
    }
  };
  return c({
    componentId: l,
    path: []
  });
}
function _e(e) {
  return Ie(dt, { proxy: e });
}
function dt({
  proxy: e
}) {
  const r = L(null), l = L(null), a = L(!1), S = `${e._stateKey}-${e._path.join(".")}`, s = e._path.length > 0 ? e._path.join(".") : "root", c = e._meta?.arrayViews?.[s], i = R(e._stateKey, e._path, c);
  return W(() => {
    const f = r.current;
    if (!f || a.current) return;
    const t = setTimeout(() => {
      if (!f.parentElement) {
        console.warn("Parent element not found for signal", S);
        return;
      }
      const u = f.parentElement, U = Array.from(u.childNodes).indexOf(f);
      let O = u.getAttribute("data-parent-id");
      O || (O = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", O)), l.current = `instance-${crypto.randomUUID()}`;
      const F = T.getState().getShadowMetadata(e._stateKey, e._path) || {}, x = F.signals || [];
      x.push({
        instanceId: l.current,
        parentId: O,
        position: U,
        effect: e._effect
      }), T.getState().setShadowMetadata(e._stateKey, e._path, {
        ...F,
        signals: x
      });
      let w = i;
      if (e._effect)
        try {
          w = new Function(
            "state",
            `return (${e._effect})(state)`
          )(i);
        } catch (m) {
          console.error("Error evaluating effect function:", m);
        }
      w !== null && typeof w == "object" && (w = JSON.stringify(w));
      const ee = document.createTextNode(String(w ?? ""));
      f.replaceWith(ee), a.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(t), l.current) {
        const u = T.getState().getShadowMetadata(e._stateKey, e._path) || {};
        u.signals && (u.signals = u.signals.filter(
          (I) => I.instanceId !== l.current
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
  _e as $cogsSignal,
  Mt as addStateOptions,
  Xe as createCogsState,
  At as createCogsStateFromSync,
  lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
