"use client";
import { jsx as ie, Fragment as Ce } from "react/jsx-runtime";
import { useState as K, useRef as L, useEffect as W, useCallback as we, useLayoutEffect as ce, useMemo as pe, createElement as be, startTransition as De } from "react";
import { transformStateFunc as Ue, isFunction as z, isDeepEqual as ae, isArray as Fe, getDifferences as $e } from "./utility.js";
import { ValidationWrapper as Ne, FormElementWrapper as Oe, MemoizedCogsItemWrapper as je } from "./Components.jsx";
import xe from "superjson";
import { v4 as X } from "uuid";
import { getGlobalStore as T, formRefStore as Me } from "./store.js";
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
  setInitialStateOptions: le,
  setServerStateUpdate: We,
  markAsDirty: ue,
  registerComponent: bt,
  unregisterComponent: Et,
  addPathComponent: Ge,
  clearSelectedIndexesForState: He,
  addStateLog: ze,
  setSyncInfo: Je,
  clearSelectedIndex: Ze,
  getSyncInfo: Ye,
  notifyPathSubscribers: Qe,
  subscribeToPath: Mt
  // Note: The old functions are no longer imported under their original names
} = T.getState();
function B(e, r, l) {
  const a = V(e, r);
  if (!!!a?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, r), keys: [] };
  const s = r.length > 0 ? r.join(".") : "root", c = l?.arrayViews?.[s] ?? a.arrayKeys;
  return Array.isArray(c) && c.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, r, c), keys: c ?? [] };
}
function he(e, r, l) {
  for (let a = 0; a < e.length; a++)
    if (l(e[a], a)) {
      const S = r[a];
      if (S)
        return { key: S, index: a, value: e[a] };
    }
  return null;
}
function ve(e, r) {
  const l = G(e) || {};
  le(e, {
    ...l,
    ...r
  });
}
function Ae({
  stateKey: e,
  options: r,
  initialOptionsPart: l
}) {
  const a = G(e) || {}, s = { ...l[e] || {}, ...a };
  let c = !1;
  if (r)
    for (const i in r)
      s.hasOwnProperty(i) ? (i == "localStorage" && r[i] && s[i].key !== r[i]?.key && (c = !0, s[i] = r[i]), i == "defaultState" && r[i] && s[i] !== r[i] && !ae(s[i], r[i]) && (c = !0, s[i] = r[i])) : (c = !0, s[i] = r[i]);
  s.syncOptions && (!r || !r.hasOwnProperty("syncOptions")) && (c = !0), c && le(e, s);
}
function At(e, { formElements: r, validation: l }) {
  return { initialState: e, formElements: r, validation: l };
}
const Xe = (e, r) => {
  let l = e;
  const [a, S] = Ue(l);
  r?.__fromSyncSchema && r?.__syncNotifications && T.getState().setInitialStateOptions("__notifications", r.__syncNotifications), r?.__fromSyncSchema && r?.__apiParamsMap && T.getState().setInitialStateOptions("__apiParamsMap", r.__apiParamsMap), Object.keys(a).forEach((i) => {
    let d = S[i] || {};
    const t = {
      ...d
    };
    if (r?.formElements && (t.formElements = {
      ...r.formElements,
      ...d.formElements || {}
    }), r?.validation && (t.validation = {
      ...r.validation,
      ...d.validation || {}
    }, r.validation.key && !d.validation?.key && (t.validation.key = `${r.validation.key}.${i}`)), r?.__syncSchemas?.[i]?.schemas?.validation && (t.validation = {
      zodSchemaV4: r.__syncSchemas[i].schemas.validation,
      ...d.validation
    }), Object.keys(t).length > 0) {
      const u = G(i);
      u ? le(i, {
        ...u,
        ...t
      }) : le(i, t);
    }
  }), Object.keys(a).forEach((i) => {
    oe(i, a[i]);
  });
  const s = (i, d) => {
    const [t] = K(d?.componentId ?? X());
    Ae({
      stateKey: i,
      options: d,
      initialOptionsPart: S
    });
    const u = R(i, []) || a[i], b = d?.modifyState ? d.modifyState(u) : u;
    return lt(b, {
      stateKey: i,
      syncUpdate: d?.syncUpdate,
      componentId: t,
      localStorage: d?.localStorage,
      middleware: d?.middleware,
      reactiveType: d?.reactiveType,
      reactiveDeps: d?.reactiveDeps,
      defaultState: d?.defaultState,
      dependencies: d?.dependencies,
      serverState: d?.serverState,
      syncOptions: d?.syncOptions,
      __useSync: r?.__useSync
    });
  };
  function c(i, d) {
    Ae({ stateKey: i, options: d, initialOptionsPart: S }), d.localStorage && et(i, d), Ee(i);
  }
  return { useCogsState: s, setCogsOptions: c };
};
function It(e, r) {
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
      i = Se(c)?.lastSyncedWithServer;
    } catch {
    }
    const d = V(r, []), t = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: i,
      stateSource: d?.stateSource,
      baseServerState: d?.baseServerState
    }, u = xe.serialize(t);
    window.localStorage.setItem(
      c,
      JSON.stringify(u.json)
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
  const l = R(e, []), { sessionId: a } = Ve(), S = z(r?.localStorage?.key) ? r.localStorage.key(l) : r?.localStorage?.key;
  if (S && a) {
    const s = Se(
      `${a}-${e}-${S}`
    );
    if (s && s.lastUpdated > (s.lastSyncedWithServer || 0))
      return Ee(e), !0;
  }
  return !1;
}, Ee = (e) => {
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
      const d = [...r, c], t = l[i];
      t !== void 0 && fe(
        e,
        d,
        t,
        a
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((s) => {
    const c = [...r, s], i = l[s];
    fe(e, c, i, a);
  });
}
let de = [], Te = !1;
function tt() {
  Te || (Te = !0, queueMicrotask(it));
}
function rt(e, r, l) {
  const a = T.getState().getShadowValue(e, r), S = z(l) ? l(a) : l;
  Re(e, r, S), ue(e, r, { bubble: !0 });
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
      } catch (d) {
        console.error("Error evaluating effect function:", d);
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
        const d = a.components?.get(i);
        d && ((Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"]).includes("none") || S.add(d));
      }), s.length === 0) break;
      s.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Fe(l.newValue) && $e(l.newValue, l.oldValue).forEach((i) => {
      const d = i.split("."), t = [...r, ...d], u = V(e, t);
      u?.pathComponents && u.pathComponents.forEach((b) => {
        const U = a.components?.get(b);
        U && ((Array.isArray(U.reactiveType) ? U.reactiveType : [U.reactiveType || "component"]).includes("none") || S.add(U));
      });
    });
  } else if (l.type === "insert" || l.type === "cut") {
    const s = l.type === "insert" ? r : r.slice(0, -1), c = V(e, s);
    c?.pathComponents && c.pathComponents.forEach((i) => {
      const d = a.components?.get(i);
      d && S.add(d);
    });
  }
  return a.components.forEach((s, c) => {
    if (S.has(s))
      return;
    const i = Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"];
    if (i.includes("all"))
      S.add(s);
    else if (i.includes("deps") && s.depsFunction) {
      const d = R(e, []), t = s.depsFunction(d);
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
  Le(e, r, a), ue(e, r, { bubble: !0 });
  const S = V(e, r);
  if (S?.arrayKeys) {
    const s = S.arrayKeys[S.arrayKeys.length - 1];
    if (s) {
      const c = s.split(".").slice(1);
      ue(e, c, { bubble: !1 });
    }
  }
  return { type: "insert", newValue: a, shadowMeta: S };
}
function st(e, r) {
  const l = r.slice(0, -1), a = R(e, r);
  return Be(e, r), ue(e, l, { bubble: !0 }), { type: "cut", oldValue: a, parentPath: l };
}
function it() {
  const e = /* @__PURE__ */ new Set(), r = [], l = [];
  for (const a of de) {
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
  }), de = [], Te = !1;
}
function ct(e, r, l, a) {
  return (s, c, i, d) => {
    S(e, c, s, i);
  };
  function S(s, c, i, d) {
    let t;
    switch (d.updateType) {
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
    t.stateKey = s, t.path = c, de.push(t), tt();
    const u = {
      timeStamp: Date.now(),
      stateKey: s,
      path: c,
      updateType: d.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null
    };
    de.push(u), t.newValue !== void 0 && Ke(
      t.newValue,
      s,
      a.current,
      l
    ), a.current?.middleware && a.current.middleware({ update: u }), d.sync !== !1 && r.current?.connected && r.current.updateState({ operation: u });
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
  syncUpdate: d,
  dependencies: t,
  serverState: u,
  __useSync: b
} = {}) {
  const [U, O] = K({}), { sessionId: F } = Ve();
  let x = !r;
  const [p] = K(r ?? X()), ee = L(c ?? X()), m = L(
    null
  );
  m.current = G(p) ?? null, W(() => {
    if (d && d.stateKey === p && d.path?.[0]) {
      const g = `${d.stateKey}:${d.path.join(".")}`;
      Je(g, {
        timeStamp: d.timeStamp,
        userId: d.userId
      });
    }
  }, [d]);
  const te = we(
    (g) => {
      const w = g ? { ...G(p), ...g } : G(p), E = w?.defaultState || i || e;
      if (w?.serverState?.status === "success" && w?.serverState?.data !== void 0)
        return {
          value: w.serverState.data,
          source: "server",
          timestamp: w.serverState.timestamp || Date.now()
        };
      if (w?.localStorage?.key && F) {
        const A = z(w.localStorage.key) ? w.localStorage.key(E) : w.localStorage.key, I = Se(
          `${F}-${p}-${A}`
        );
        if (I && I.lastUpdated > (w?.serverState?.timestamp || 0))
          return {
            value: I.state,
            source: "localStorage",
            timestamp: I.lastUpdated
          };
      }
      return {
        value: E || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [p, i, e, F]
  );
  W(() => {
    We(p, u);
  }, [u, p]), W(() => T.getState().subscribeToPath(p, (y) => {
    if (y?.type === "SERVER_STATE_UPDATE") {
      const w = y.serverState;
      if (w?.status !== "success" || w.data === void 0)
        return;
      ve(p, { serverState: w });
      const E = typeof w.merge == "object" ? w.merge : w.merge === !0 ? { strategy: "append" } : null, _ = R(p, []), A = w.data;
      if (E && E.strategy === "append" && "key" in E && // Type guard for key
      Array.isArray(_) && Array.isArray(A)) {
        const I = E.key;
        if (!I) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const D = new Set(
          _.map((N) => N[I])
        ), M = A.filter(
          (N) => !D.has(N[I])
        );
        M.length > 0 && qe(p, [], M);
        const k = R(p, []);
        fe(
          p,
          [],
          k,
          w.timestamp
        );
      } else
        oe(p, A), fe(
          p,
          [],
          A,
          w.timestamp
        );
    }
  }), [p, te]), W(() => {
    const g = T.getState().getShadowMetadata(p, []);
    if (g && g.stateSource)
      return;
    const y = G(p), w = {
      syncEnabled: !!v && !!h,
      validationEnabled: !!(y?.validation?.zodSchemaV4 || y?.validation?.zodSchemaV3),
      localStorageEnabled: !!y?.localStorage?.key
    };
    if (J(p, [], {
      ...g,
      features: w
    }), y?.defaultState !== void 0 || i !== void 0) {
      const E = y?.defaultState || i;
      y?.defaultState || ve(p, {
        defaultState: E
      });
      const { value: _, source: A, timestamp: I } = te();
      oe(p, _), J(p, [], {
        stateSource: A,
        lastServerSync: A === "server" ? I : void 0,
        isDirty: !1,
        baseServerState: A === "server" ? _ : void 0
      }), Ee(p);
    }
  }, [p, ...t || []]), ce(() => {
    x && ve(p, {
      formElements: a,
      defaultState: i,
      localStorage: l,
      middleware: m.current?.middleware
    });
    const g = `${p}////${ee.current}`, y = V(p, []), w = y?.components || /* @__PURE__ */ new Map();
    return w.set(g, {
      forceUpdate: () => O({}),
      reactiveType: s ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: S || void 0,
      deps: S ? S(R(p, [])) : [],
      prevDeps: S ? S(R(p, [])) : []
    }), J(p, [], {
      ...y,
      components: w
    }), O({}), () => {
      const E = V(p, []), _ = E?.components?.get(g);
      _?.paths && _.paths.forEach((A) => {
        const D = A.split(".").slice(1), M = T.getState().getShadowMetadata(p, D);
        M?.pathComponents && M.pathComponents.size === 0 && (delete M.pathComponents, T.getState().setShadowMetadata(p, D, M));
      }), E?.components && J(p, [], E);
    };
  }, []);
  const o = L(null), n = ct(
    p,
    o,
    F,
    m
  );
  T.getState().initialStateGlobal[p] || ke(p, e);
  const f = pe(() => Pe(
    p,
    n,
    ee.current,
    F
  ), [p, F]), v = b, h = m.current?.syncOptions;
  return v && (o.current = v(
    f,
    h ?? {}
  )), f;
}
const ut = (e, r, l) => {
  let a = V(e, r)?.arrayKeys || [];
  const S = l?.transforms;
  if (!S || S.length === 0)
    return a;
  for (const s of S)
    if (s.type === "filter") {
      const c = [];
      a.forEach((i, d) => {
        const t = R(e, [...r, i]);
        s.fn(t, d) && c.push(i);
      }), a = c;
    } else s.type === "sort" && a.sort((c, i) => {
      const d = R(e, [...r, c]), t = R(e, [...r, i]);
      return s.fn(d, t);
    });
  return a;
}, Ie = (e, r, l) => {
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
    const i = c + ".selected", d = V(e, i.split(".").slice(1));
    c == l && d?.pathComponents?.forEach((t) => {
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
    componentId: b
  }) {
    const U = u ? JSON.stringify(u.arrayViews || u.transforms) : "", O = t.join(".") + ":" + b + ":" + U;
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
            componentId: b,
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
            const f = T.getState().getShadowValue(e, []), v = o?.validation?.key;
            try {
              const h = await n.action(f);
              if (h && !h.success && h.errors, h?.success) {
                const g = T.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...g,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: f
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
            const { shadowMeta: n, value: f } = Q(e, t, u);
            return n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || f !== void 0 && !n ? "fresh" : "unknown";
          };
          return m === "_status" ? o() : o;
        }
        if (m === "removeStorage")
          return () => {
            const o = T.getState().initialStateGlobal[e], n = G(e), f = z(n?.localStorage?.key) ? n.localStorage.key(o) : n?.localStorage?.key, v = `${a}-${e}-${f}`;
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
            Ie(e, b, [
              ...t,
              "getSelected"
            ]);
            const n = T.getState().selectedIndicesMap.get(o);
            if (!n)
              return;
            const f = t.join("."), v = u?.arrayViews?.[f], h = n.split(".").pop();
            if (!(v && !v.includes(h) || R(
              e,
              n.split(".").slice(1)
            ) === void 0))
              return c({
                path: n.split(".").slice(1),
                componentId: b,
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
            const { keys: f } = B(e, t, u);
            if (!f)
              return -1;
            const v = n.split(".").pop();
            return f.indexOf(v);
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
              overscan: f = 6,
              stickToBottom: v = !1,
              scrollStickTolerance: h = 75
            } = o, g = L(null), [y, w] = K({
              startIndex: 0,
              endIndex: 10
            }), [E, _] = K({}), A = L(!0);
            W(() => {
              const C = setInterval(() => {
                _({});
              }, 1e3);
              return () => clearInterval(C);
            }, []);
            const I = L({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), D = L(
              /* @__PURE__ */ new Map()
            ), { keys: M } = B(e, t, u);
            W(() => {
              const C = [e, ...t].join("."), P = T.getState().subscribeToPath(C, (j) => {
                j.type !== "GET_SELECTED" && j.type;
              });
              return () => {
                P();
              };
            }, [b, e, t.join(".")]), ce(() => {
              if (v && M.length > 0 && g.current && !I.current.isUserScrolling && A.current) {
                const C = g.current, P = () => {
                  if (C.clientHeight > 0) {
                    const j = Math.ceil(
                      C.clientHeight / n
                    ), q = M.length - 1, $ = Math.max(
                      0,
                      q - j - f
                    );
                    w({ startIndex: $, endIndex: q }), requestAnimationFrame(() => {
                      Y("instant"), A.current = !1;
                    });
                  } else
                    requestAnimationFrame(P);
                };
                P();
              }
            }, [M.length, v, n, f]);
            const k = L(y);
            ce(() => {
              k.current = y;
            }, [y]);
            const N = L(M);
            ce(() => {
              N.current = M;
            }, [M]);
            const se = we(() => {
              const C = g.current;
              if (!C) return;
              const P = C.scrollTop, { scrollHeight: j, clientHeight: q } = C, $ = I.current, re = j - (P + q), ge = $.isNearBottom;
              $.isNearBottom = re <= h, P < $.lastScrollTop ? ($.scrollUpCount++, $.scrollUpCount > 3 && ge && ($.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : $.isNearBottom && ($.isUserScrolling = !1, $.scrollUpCount = 0), $.lastScrollTop = P;
              let Z = 0;
              for (let H = 0; H < M.length; H++) {
                const ye = M[H], me = D.current.get(ye);
                if (me && me.offset + me.height > P) {
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
                w({
                  startIndex: Math.max(0, Z - f),
                  endIndex: Math.min(
                    M.length - 1,
                    Z + H + f
                  )
                });
              }
            }, [
              M.length,
              y.startIndex,
              n,
              f,
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
                I.current.isUserScrolling = !1, I.current.isNearBottom = !0, I.current.scrollUpCount = 0;
                const j = () => {
                  const q = ($ = 0) => {
                    if ($ > 5) return;
                    const re = P.scrollHeight, ge = P.scrollTop, Z = P.clientHeight;
                    ge + Z >= re - 1 || (P.scrollTo({
                      top: re,
                      behavior: C
                    }), setTimeout(() => {
                      const H = P.scrollHeight, ye = P.scrollTop;
                      (H !== re || ye + Z < H - 1) && q($ + 1);
                    }, 50));
                  };
                  q();
                };
                "requestIdleCallback" in window ? requestIdleCallback(j, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(j);
                });
              },
              []
            );
            return W(() => {
              if (!v || !g.current) return;
              const C = g.current, P = I.current;
              let j;
              const q = () => {
                clearTimeout(j), j = setTimeout(() => {
                  !P.isUserScrolling && P.isNearBottom && Y(
                    A.current ? "instant" : "smooth"
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
              }), A.current ? setTimeout(() => {
                Y("instant");
              }, 0) : q(), () => {
                clearTimeout(j), $.disconnect();
              };
            }, [v, M.length, Y]), {
              virtualState: pe(() => {
                const C = Array.isArray(M) ? M.slice(y.startIndex, y.endIndex + 1) : [], P = t.length > 0 ? t.join(".") : "root";
                return c({
                  path: t,
                  componentId: b,
                  meta: {
                    ...u,
                    arrayViews: { [P]: C },
                    serverStateIsUpStream: !0
                  }
                });
              }, [y.startIndex, y.endIndex, M, u]),
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
                    transform: `translateY(${D.current.get(M[y.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: Y,
              scrollToIndex: (C, P = "smooth") => {
                if (g.current && M[C]) {
                  const j = D.current.get(M[C])?.offset || 0;
                  g.current.scrollTo({ top: j, behavior: P });
                }
              }
            };
          };
        if (m === "stateMap")
          return (o) => {
            const { value: n, keys: f } = B(
              e,
              t,
              u
            );
            if (!f || !Array.isArray(n))
              return [];
            const v = c({
              path: t,
              componentId: b,
              meta: u
            });
            return n.map((h, g) => {
              const y = f[g];
              if (!y) return;
              const w = [...t, y], E = c({
                path: w,
                // This now correctly points to the item in the shadow store.
                componentId: b,
                meta: u
              });
              return o(E, g, v);
            });
          };
        if (m === "stateFilter")
          return (o) => {
            const n = t.length > 0 ? t.join(".") : "root", { keys: f, value: v } = B(
              e,
              t,
              u
            );
            if (!Array.isArray(v))
              throw new Error("stateFilter can only be used on arrays");
            const h = [];
            return v.forEach((g, y) => {
              if (o(g, y)) {
                const w = f[y];
                w && h.push(w);
              }
            }), c({
              path: t,
              componentId: b,
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
            const n = t.length > 0 ? t.join(".") : "root", { value: f, keys: v } = B(
              e,
              t,
              u
            );
            if (!Array.isArray(f) || !v)
              throw new Error("No array keys found for sorting");
            const h = f.map((y, w) => ({
              item: y,
              key: v[w]
            }));
            h.sort((y, w) => o(y.item, w.item));
            const g = h.map((y) => y.key);
            return c({
              path: t,
              componentId: b,
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
              flushInterval: f = 100,
              bufferStrategy: v = "accumulate",
              store: h,
              onFlush: g
            } = o;
            let y = [], w = !1, E = null;
            const _ = (k) => {
              if (!w) {
                if (v === "sliding" && y.length >= n)
                  y.shift();
                else if (v === "dropping" && y.length >= n)
                  return;
                y.push(k), y.length >= n && A();
              }
            }, A = () => {
              if (y.length === 0) return;
              const k = [...y];
              if (y = [], h) {
                const N = h(k);
                N !== void 0 && (Array.isArray(N) ? N : [N]).forEach((Y) => {
                  r(Y, t, {
                    updateType: "insert"
                  });
                });
              } else
                k.forEach((N) => {
                  r(N, t, {
                    updateType: "insert"
                  });
                });
              g?.(k);
            };
            f > 0 && (E = setInterval(A, f));
            const I = X(), D = V(e, t) || {}, M = D.streams || /* @__PURE__ */ new Map();
            return M.set(I, { buffer: y, flushTimer: E }), J(e, t, {
              ...D,
              streams: M
            }), {
              write: (k) => _(k),
              writeMany: (k) => k.forEach(_),
              flush: () => A(),
              pause: () => {
                w = !0;
              },
              resume: () => {
                w = !1, y.length > 0 && A();
              },
              close: () => {
                A(), E && clearInterval(E);
                const k = T.getState().getShadowMetadata(e, t);
                k?.streams && k.streams.delete(I);
              }
            };
          };
        if (m === "stateList")
          return (o) => /* @__PURE__ */ ie(() => {
            const f = L(/* @__PURE__ */ new Map()), [v, h] = K({}), g = t.length > 0 ? t.join(".") : "root", y = ut(e, t, u), w = pe(() => ({
              ...u,
              arrayViews: {
                ...u?.arrayViews || {},
                [g]: y
              }
            }), [u, g, y]), { value: E } = B(
              e,
              t,
              w
            );
            if (W(() => {
              const I = T.getState().subscribeToPath(F, (D) => {
                if (D.type === "GET_SELECTED")
                  return;
                const k = T.getState().getShadowMetadata(e, t)?.transformCaches;
                if (k)
                  for (const N of k.keys())
                    N.startsWith(b) && k.delete(N);
                (D.type === "INSERT" || D.type === "INSERT_MANY" || D.type === "REMOVE" || D.type === "CLEAR_SELECTION" || D.type === "SERVER_STATE_UPDATE" && !u?.serverStateIsUpStream) && h({});
              });
              return () => {
                I();
              };
            }, [b, F]), !Array.isArray(E))
              return null;
            const _ = c({
              path: t,
              componentId: b,
              meta: w
              // Use updated meta here
            }), A = E.map((I, D) => {
              const M = y[D];
              if (!M)
                return null;
              let k = f.current.get(M);
              k || (k = X(), f.current.set(M, k));
              const N = [...t, M];
              return be(je, {
                key: M,
                stateKey: e,
                itemComponentId: k,
                itemPath: N,
                localIndex: D,
                arraySetter: _,
                rebuildStateShape: c,
                renderFn: o
              });
            });
            return /* @__PURE__ */ ie(Ce, { children: A });
          }, {});
        if (m === "stateFlattenOn")
          return (o) => {
            const n = t.length > 0 ? t.join(".") : "root", f = u?.arrayViews?.[n], v = T.getState().getShadowValue(e, t, f);
            return Array.isArray(v) ? c({
              path: [...t, "[*]", o],
              componentId: b,
              meta: u
            }) : [];
          };
        if (m === "index")
          return (o) => {
            const n = t.length > 0 ? t.join(".") : "root", f = u?.arrayViews?.[n];
            if (f) {
              const g = f[o];
              return g ? c({
                path: [...t, g],
                componentId: b,
                meta: u
              }) : void 0;
            }
            const v = V(e, t);
            if (!v?.arrayKeys) return;
            const h = v.arrayKeys[o];
            if (h)
              return c({
                path: [...t, h],
                componentId: b,
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
            const f = [...t, n];
            return c({
              path: f,
              componentId: b,
              meta: u
            });
          };
        if (m === "insert")
          return (o, n) => {
            r(o, t, { updateType: "insert" });
          };
        if (m === "uniqueInsert")
          return (o, n, f) => {
            const { value: v } = Q(
              e,
              t,
              u
            ), h = z(o) ? o(v) : o;
            let g = null;
            if (!v.some((w) => {
              const E = n ? n.every(
                (_) => ae(w[_], h[_])
              ) : ae(w, h);
              return E && (g = w), E;
            }))
              r(h, t, { updateType: "insert" });
            else if (f && g) {
              const w = f(g), E = v.map(
                (_) => ae(_, g) ? w : _
              );
              r(E, t, {
                updateType: "update"
              });
            }
          };
        if (m === "cut")
          return (o, n) => {
            const f = V(e, t);
            if (!f?.arrayKeys || f.arrayKeys.length === 0)
              return;
            const v = o === -1 ? f.arrayKeys.length - 1 : o !== void 0 ? o : f.arrayKeys.length - 1, h = f.arrayKeys[v];
            h && r(null, [...t, h], {
              updateType: "cut"
            });
          };
        if (m === "cutSelected")
          return () => {
            const o = [e, ...t].join("."), { keys: n } = B(e, t, u);
            if (!n || n.length === 0)
              return;
            const f = T.getState().selectedIndicesMap.get(o);
            if (!f)
              return;
            const v = f.split(".").pop();
            if (!n.includes(v))
              return;
            const h = f.split(".").slice(1);
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
              value: f,
              keys: v
            } = B(e, t, u);
            if (!n) return;
            const h = he(f, v, (g) => g === o);
            h && r(null, [...t, h.key], {
              updateType: "cut"
            });
          };
        if (m === "toggleByValue")
          return (o) => {
            const {
              isArray: n,
              value: f,
              keys: v
            } = B(e, t, u);
            if (!n) return;
            const h = he(f, v, (g) => g === o);
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
            const { isArray: f, value: v, keys: h } = B(e, t, u);
            if (!f)
              throw new Error("findWith can only be used on arrays");
            const g = he(
              v,
              h,
              (y) => y?.[o] === n
            );
            return c(g ? {
              path: [...t, g.key],
              componentId: b,
              meta: u
            } : {
              path: [...t, `not_found_${X()}`],
              componentId: b,
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
            Ie(e, b, t);
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
          return (o) => Se(a + "-" + e + "-" + o);
        if (m === "isSelected") {
          const o = t.slice(0, -1);
          if (V(e, o)?.arrayKeys) {
            const f = e + "." + o.join("."), v = T.getState().selectedIndicesMap.get(f), h = e + "." + t.join(".");
            return v === h;
          }
          return;
        }
        if (m === "setSelected")
          return (o) => {
            const n = t.slice(0, -1), f = e + "." + n.join("."), v = e + "." + t.join(".");
            ne(e, n, void 0), T.getState().selectedIndicesMap.get(f), o && T.getState().setSelectedIndex(f, v);
          };
        if (m === "toggleSelected")
          return () => {
            const o = t.slice(0, -1), n = e + "." + o.join("."), f = e + "." + t.join(".");
            T.getState().selectedIndicesMap.get(n) === f ? T.getState().clearSelectedIndex({ arrayKey: n }) : T.getState().setSelectedIndex(n, f), ne(e, o);
          };
        if (m === "_componentId")
          return b;
        if (t.length == 0) {
          if (m === "addZodValidation")
            return (o) => {
              o.forEach((n) => {
                const f = T.getState().getShadowMetadata(e, n.path) || {};
                T.getState().setShadowMetadata(e, n.path, {
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
              const n = T.getState(), f = n.getShadowMetadata(e, []);
              if (!f?.components) return;
              const v = (g) => !g || g === "/" ? [] : g.split("/").slice(1).map((y) => y.replace(/~1/g, "/").replace(/~0/g, "~")), h = /* @__PURE__ */ new Set();
              for (const g of o) {
                const y = v(g.path);
                switch (g.op) {
                  case "add":
                  case "replace": {
                    const { value: w } = g;
                    n.updateShadowAtPath(e, y, w), n.markAsDirty(e, y, { bubble: !0 });
                    let E = [...y];
                    for (; ; ) {
                      const _ = n.getShadowMetadata(
                        e,
                        E
                      );
                      if (_?.pathComponents && _.pathComponents.forEach((A) => {
                        if (!h.has(A)) {
                          const I = f.components?.get(A);
                          I && (I.forceUpdate(), h.add(A));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const w = y.slice(0, -1);
                    n.removeShadowArrayElement(e, y), n.markAsDirty(e, w, { bubble: !0 });
                    let E = [...w];
                    for (; ; ) {
                      const _ = n.getShadowMetadata(
                        e,
                        E
                      );
                      if (_?.pathComponents && _.pathComponents.forEach((A) => {
                        if (!h.has(A)) {
                          const I = f.components?.get(A);
                          I && (I.forceUpdate(), h.add(A));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (m === "getComponents")
            return () => V(e, [])?.components;
          if (m === "getAllFormRefs")
            return () => Me.getState().getFormRefsByStateKey(e);
        }
        if (m === "getFormRef")
          return () => Me.getState().getFormRef(e + "." + t.join("."));
        if (m === "validationWrapper")
          return ({
            children: o,
            hideMessage: n
          }) => /* @__PURE__ */ ie(
            Ne,
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
          return (o) => (r(o, t, { updateType: "update" }), {
            synced: () => {
              const n = T.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...n,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const f = [e, ...t].join(".");
              Qe(f, {
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
          componentId: b,
          meta: u
        });
      }
    }, p = new Proxy({}, x);
    return S.set(O, p), p;
  }
  const i = {
    revertToInitialState: (t) => {
      const u = T.getState().getShadowMetadata(e, []);
      u?.stateSource === "server" && u.baseServerState ? u.baseServerState : T.getState().initialStateGlobal[e];
      const b = T.getState().initialStateGlobal[e];
      He(e), oe(e, b), c({
        path: [],
        componentId: l
      });
      const U = G(e), O = z(U?.localStorage?.key) ? U?.localStorage?.key(b) : U?.localStorage?.key, F = `${a}-${e}-${O}`;
      F && localStorage.removeItem(F);
      const x = T.getState().getShadowMetadata(e, []);
      return x && x?.components?.forEach((p) => {
        p.forceUpdate();
      }), b;
    },
    updateInitialState: (t) => {
      const u = Pe(
        e,
        r,
        l,
        a
      ), b = T.getState().initialStateGlobal[e], U = G(e), O = z(U?.localStorage?.key) ? U?.localStorage?.key(b) : U?.localStorage?.key, F = `${a}-${e}-${O}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), De(() => {
        ke(e, t), oe(e, t);
        const x = T.getState().getShadowMetadata(e, []);
        x && x?.components?.forEach((p) => {
          p.forceUpdate();
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
  return be(ft, { proxy: e });
}
function ft({
  proxy: e
}) {
  const r = L(null), l = L(null), a = L(!1), S = `${e._stateKey}-${e._path.join(".")}`, s = e._path.length > 0 ? e._path.join(".") : "root", c = e._meta?.arrayViews?.[s], i = R(e._stateKey, e._path, c);
  return W(() => {
    const d = r.current;
    if (!d || a.current) return;
    const t = setTimeout(() => {
      if (!d.parentElement) {
        console.warn("Parent element not found for signal", S);
        return;
      }
      const u = d.parentElement, U = Array.from(u.childNodes).indexOf(d);
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
      let p = i;
      if (e._effect)
        try {
          p = new Function(
            "state",
            `return (${e._effect})(state)`
          )(i);
        } catch (m) {
          console.error("Error evaluating effect function:", m);
        }
      p !== null && typeof p == "object" && (p = JSON.stringify(p));
      const ee = document.createTextNode(String(p ?? ""));
      d.replaceWith(ee), a.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(t), l.current) {
        const u = T.getState().getShadowMetadata(e._stateKey, e._path) || {};
        u.signals && (u.signals = u.signals.filter(
          (b) => b.instanceId !== l.current
        ), T.getState().setShadowMetadata(e._stateKey, e._path, u));
      }
    };
  }, []), be("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": S
  });
}
export {
  _e as $cogsSignal,
  At as addStateOptions,
  Xe as createCogsState,
  It as createCogsStateFromSync,
  lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
