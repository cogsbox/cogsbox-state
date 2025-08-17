"use client";
import { jsx as ne, Fragment as Ve } from "react/jsx-runtime";
import { useState as te, useRef as x, useEffect as B, useCallback as we, useLayoutEffect as ie, useMemo as pe, createElement as be, startTransition as Pe } from "react";
import { transformStateFunc as Ce, isFunction as z, isDeepEqual as oe, isArray as De, getDifferences as Ue } from "./utility.js";
import { ValidationWrapper as je, IsolatedComponentWrapper as Fe, FormElementWrapper as Ne, MemoizedCogsItemWrapper as Oe } from "./Components.jsx";
import Re from "superjson";
import { v4 as ee } from "uuid";
import { getGlobalStore as b, formRefStore as Ae } from "./store.js";
import { useCogsConfig as Ie } from "./CogsStateClient.jsx";
const {
  getInitialOptions: W,
  updateInitialStateGlobal: _e,
  getShadowMetadata: k,
  setShadowMetadata: J,
  getShadowValue: R,
  initializeShadowState: se,
  updateShadowAtPath: xe,
  insertShadowArrayElement: Le,
  insertManyShadowArrayElements: qe,
  removeShadowArrayElement: Be,
  setInitialStateOptions: ce,
  setServerStateUpdate: We,
  markAsDirty: le,
  addPathComponent: Ge,
  clearSelectedIndexesForState: He,
  addStateLog: ze,
  setSyncInfo: Je,
  clearSelectedIndex: Ye,
  getSyncInfo: Ze,
  notifyPathSubscribers: Qe
  // Note: The old functions are no longer imported under their original names
} = b.getState();
function q(e, r, l) {
  const o = k(e, r);
  if (!!!o?.arrayKeys)
    return { isArray: !1, value: b.getState().getShadowValue(e, r), keys: [] };
  const n = r.length > 0 ? r.join(".") : "root", d = l?.arrayViews?.[n] ?? o.arrayKeys;
  return Array.isArray(d) && d.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: b.getState().getShadowValue(e, r, d), keys: d ?? [] };
}
function he(e, r, l) {
  for (let o = 0; o < e.length; o++)
    if (l(e[o], o)) {
      const f = r[o];
      if (f)
        return { key: f, index: o, value: e[o] };
    }
  return null;
}
function ve(e, r) {
  const l = W(e) || {};
  ce(e, {
    ...l,
    ...r
  });
}
function Ee({
  stateKey: e,
  options: r,
  initialOptionsPart: l
}) {
  const o = W(e) || {}, n = { ...l[e] || {}, ...o };
  let d = !1;
  if (r)
    for (const c in r)
      n.hasOwnProperty(c) ? (c == "localStorage" && r[c] && n[c].key !== r[c]?.key && (d = !0, n[c] = r[c]), c == "defaultState" && r[c] && n[c] !== r[c] && !oe(n[c], r[c]) && (d = !0, n[c] = r[c])) : (d = !0, n[c] = r[c]);
  n.syncOptions && (!r || !r.hasOwnProperty("syncOptions")) && (d = !0), d && ce(e, n);
}
function Tt(e, { formElements: r, validation: l }) {
  return { initialState: e, formElements: r, validation: l };
}
const Xe = (e, r) => {
  let l = e;
  const [o, f] = Ce(l);
  r?.__fromSyncSchema && r?.__syncNotifications && b.getState().setInitialStateOptions("__notifications", r.__syncNotifications), r?.__fromSyncSchema && r?.__apiParamsMap && b.getState().setInitialStateOptions("__apiParamsMap", r.__apiParamsMap), Object.keys(o).forEach((c) => {
    let t = f[c] || {};
    const i = {
      ...t
    };
    if (r?.formElements && (i.formElements = {
      ...r.formElements,
      ...t.formElements || {}
    }), r?.validation && (i.validation = {
      ...r.validation,
      ...t.validation || {}
    }, r.validation.key && !t.validation?.key && (i.validation.key = `${r.validation.key}.${c}`)), r?.__syncSchemas?.[c]?.schemas?.validation && (i.validation = {
      zodSchemaV4: r.__syncSchemas[c].schemas.validation,
      ...t.validation
    }), Object.keys(i).length > 0) {
      const m = W(c);
      m ? ce(c, {
        ...m,
        ...i
      }) : ce(c, i);
    }
  }), Object.keys(o).forEach((c) => {
    se(c, o[c]);
  });
  const n = (c, t) => {
    const [i] = te(t?.componentId ?? ee());
    Ee({
      stateKey: c,
      options: t,
      initialOptionsPart: f
    });
    const m = R(c, []) || o[c], C = t?.modifyState ? t.modifyState(m) : m;
    return lt(C, {
      stateKey: c,
      syncUpdate: t?.syncUpdate,
      componentId: i,
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
  function d(c, t) {
    Ee({ stateKey: c, options: t, initialOptionsPart: f }), t.localStorage && et(c, t), Se(c);
  }
  return { useCogsState: n, setCogsOptions: d };
};
function bt(e, r) {
  const l = e.schemas, o = {}, f = {};
  for (const n in l) {
    const d = l[n];
    o[n] = d?.schemas?.defaultValues || {}, d?.api?.queryData?._paramType && (f[n] = d.api.queryData._paramType);
  }
  return Xe(o, {
    __fromSyncSchema: !0,
    __syncNotifications: e.notifications,
    __apiParamsMap: f,
    __useSync: r,
    __syncSchemas: l
  });
}
const Ke = (e, r, l, o, f) => {
  l?.log && console.log(
    "saving to localstorage",
    r,
    l.localStorage?.key,
    o
  );
  const n = z(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (n && o) {
    const d = `${o}-${r}-${n}`;
    let c;
    try {
      c = de(d)?.lastSyncedWithServer;
    } catch {
    }
    const t = k(r, []), i = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: c,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, m = Re.serialize(i);
    window.localStorage.setItem(
      d,
      JSON.stringify(m.json)
    );
  }
}, de = (e) => {
  if (!e) return null;
  try {
    const r = window.localStorage.getItem(e);
    return r ? JSON.parse(r) : null;
  } catch (r) {
    return console.error("Error loading from localStorage:", r), null;
  }
}, et = (e, r) => {
  const l = R(e, []), { sessionId: o } = Ie(), f = z(r?.localStorage?.key) ? r.localStorage.key(l) : r?.localStorage?.key;
  if (f && o) {
    const n = de(
      `${o}-${e}-${f}`
    );
    if (n && n.lastUpdated > (n.lastSyncedWithServer || 0))
      return Se(e), !0;
  }
  return !1;
}, Se = (e) => {
  const r = k(e, []);
  if (!r) return;
  const l = /* @__PURE__ */ new Set();
  r?.components?.forEach((o) => {
    (o ? Array.isArray(o.reactiveType) ? o.reactiveType : [o.reactiveType || "component"] : null)?.includes("none") || l.add(() => o.forceUpdate());
  }), queueMicrotask(() => {
    l.forEach((o) => o());
  });
};
function ue(e, r, l, o) {
  const f = k(e, r);
  if (J(e, r, {
    ...f,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: o || Date.now()
  }), Array.isArray(l)) {
    const n = k(e, r);
    n?.arrayKeys && n.arrayKeys.forEach((d, c) => {
      const t = [...r, d], i = l[c];
      i !== void 0 && ue(
        e,
        t,
        i,
        o
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((n) => {
    const d = [...r, n], c = l[n];
    ue(e, d, c, o);
  });
}
let fe = [], Te = !1;
function tt() {
  Te || (Te = !0, queueMicrotask(it));
}
function rt(e, r, l) {
  const o = b.getState().getShadowValue(e, r), f = z(l) ? l(o) : l;
  xe(e, r, f), le(e, r, { bubble: !0 });
  const n = k(e, r);
  return {
    type: "update",
    oldValue: o,
    newValue: f,
    shadowMeta: n
  };
}
function nt(e, r) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: o, effect: f }) => {
    const n = document.querySelector(`[data-parent-id="${l}"]`);
    if (!n) return;
    const d = Array.from(n.childNodes);
    if (!d[o]) return;
    let c = r;
    if (f && r !== null)
      try {
        c = new Function("state", `return (${f})(state)`)(
          r
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    c !== null && typeof c == "object" && (c = JSON.stringify(c)), d[o].textContent = String(c ?? "");
  });
}
function at(e, r, l) {
  const o = k(e, []);
  if (!o?.components)
    return /* @__PURE__ */ new Set();
  const f = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let n = [...r];
    for (; ; ) {
      const d = k(e, n);
      if (d?.pathComponents && d.pathComponents.forEach((c) => {
        const t = o.components?.get(c);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || f.add(t));
      }), n.length === 0) break;
      n.pop();
    }
    l.newValue && typeof l.newValue == "object" && !De(l.newValue) && Ue(l.newValue, l.oldValue).forEach((c) => {
      const t = c.split("."), i = [...r, ...t], m = k(e, i);
      m?.pathComponents && m.pathComponents.forEach((C) => {
        const U = o.components?.get(C);
        U && ((Array.isArray(U.reactiveType) ? U.reactiveType : [U.reactiveType || "component"]).includes("none") || f.add(U));
      });
    });
  } else if (l.type === "insert" || l.type === "cut") {
    const n = l.type === "insert" ? r : r.slice(0, -1), d = k(e, n);
    d?.pathComponents && d.pathComponents.forEach((c) => {
      const t = o.components?.get(c);
      t && f.add(t);
    });
  }
  return o.components.forEach((n, d) => {
    if (f.has(n))
      return;
    const c = Array.isArray(n.reactiveType) ? n.reactiveType : [n.reactiveType || "component"];
    if (c.includes("all"))
      f.add(n);
    else if (c.includes("deps") && n.depsFunction) {
      const t = R(e, []), i = n.depsFunction(t);
      (i === !0 || Array.isArray(i) && !oe(n.prevDeps, i)) && (n.prevDeps = i, f.add(n));
    }
  }), f;
}
function ot(e, r, l) {
  let o;
  if (z(l)) {
    const { value: n } = K(e, r);
    o = l({ state: n, uuid: ee() });
  } else
    o = l;
  Le(e, r, o), le(e, r, { bubble: !0 });
  const f = k(e, r);
  if (f?.arrayKeys) {
    const n = f.arrayKeys[f.arrayKeys.length - 1];
    if (n) {
      const d = n.split(".").slice(1);
      le(e, d, { bubble: !1 });
    }
  }
  return { type: "insert", newValue: o, shadowMeta: f };
}
function st(e, r) {
  const l = r.slice(0, -1), o = R(e, r);
  return Be(e, r), le(e, l, { bubble: !0 }), { type: "cut", oldValue: o, parentPath: l };
}
function it() {
  const e = /* @__PURE__ */ new Set(), r = [], l = [];
  for (const o of fe) {
    if (o.status && o.updateType) {
      l.push(o);
      continue;
    }
    const f = o, n = f.type === "cut" ? null : f.newValue;
    f.shadowMeta?.signals?.length > 0 && r.push({ shadowMeta: f.shadowMeta, displayValue: n }), at(
      f.stateKey,
      f.path,
      f
    ).forEach((c) => {
      e.add(c);
    });
  }
  l.length > 0 && ze(l), r.forEach(({ shadowMeta: o, displayValue: f }) => {
    nt(o, f);
  }), e.forEach((o) => {
    o.forceUpdate();
  }), fe = [], Te = !1;
}
function ct(e, r, l, o) {
  return (n, d, c, t) => {
    f(e, d, n, c);
  };
  function f(n, d, c, t) {
    let i;
    switch (t.updateType) {
      case "update":
        i = rt(n, d, c);
        break;
      case "insert":
        i = ot(n, d, c);
        break;
      case "cut":
        i = st(n, d);
        break;
    }
    i.stateKey = n, i.path = d, fe.push(i), tt();
    const m = {
      timeStamp: Date.now(),
      stateKey: n,
      path: d,
      updateType: t.updateType,
      status: "new",
      oldValue: i.oldValue,
      newValue: i.newValue ?? null
    };
    fe.push(m), i.newValue !== void 0 && Ke(
      i.newValue,
      n,
      o.current,
      l
    ), o.current?.middleware && o.current.middleware({ update: m }), t.sync !== !1 && r.current?.connected && r.current.updateState({ operation: m });
  }
}
function lt(e, {
  stateKey: r,
  localStorage: l,
  formElements: o,
  reactiveDeps: f,
  reactiveType: n,
  componentId: d,
  defaultState: c,
  syncUpdate: t,
  dependencies: i,
  serverState: m,
  __useSync: C
} = {}) {
  const [U, j] = te({}), { sessionId: F } = Ie();
  let G = !r;
  const [p] = te(r ?? ee()), y = x(d ?? ee()), Y = x(
    null
  );
  Y.current = W(p) ?? null, B(() => {
    if (t && t.stateKey === p && t.path?.[0]) {
      const S = `${t.stateKey}:${t.path.join(".")}`;
      Je(S, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]);
  const s = we(
    (S) => {
      const w = S ? { ...W(p), ...S } : W(p), A = w?.defaultState || c || e;
      if (w?.serverState?.status === "success" && w?.serverState?.data !== void 0)
        return {
          value: w.serverState.data,
          source: "server",
          timestamp: w.serverState.timestamp || Date.now()
        };
      if (w?.localStorage?.key && F) {
        const M = z(w.localStorage.key) ? w.localStorage.key(A) : w.localStorage.key, _ = de(
          `${F}-${p}-${M}`
        );
        if (_ && _.lastUpdated > (w?.serverState?.timestamp || 0))
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
    [p, c, e, F]
  );
  B(() => {
    We(p, m);
  }, [m, p]), B(() => b.getState().subscribeToPath(p, (T) => {
    if (T?.type === "SERVER_STATE_UPDATE") {
      const w = T.serverState;
      if (w?.status !== "success" || w.data === void 0)
        return;
      ve(p, { serverState: w });
      const A = typeof w.merge == "object" ? w.merge : w.merge === !0 ? { strategy: "append" } : null, I = R(p, []), M = w.data;
      if (A && A.strategy === "append" && "key" in A && // Type guard for key
      Array.isArray(I) && Array.isArray(M)) {
        const _ = A.key;
        if (!_) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const E = new Set(
          I.map((Z) => Z[_])
        ), $ = M.filter(
          (Z) => !E.has(Z[_])
        );
        $.length > 0 && qe(p, [], $);
        const N = R(p, []);
        ue(
          p,
          [],
          N,
          w.timestamp
        );
      } else
        se(p, M), ue(
          p,
          [],
          M,
          w.timestamp
        );
    }
  }), [p, s]), B(() => {
    const S = b.getState().getShadowMetadata(p, []);
    if (S && S.stateSource)
      return;
    const T = W(p), w = {
      syncEnabled: !!g && !!v,
      validationEnabled: !!(T?.validation?.zodSchemaV4 || T?.validation?.zodSchemaV3),
      localStorageEnabled: !!T?.localStorage?.key
    };
    if (J(p, [], {
      ...S,
      features: w
    }), T?.defaultState !== void 0 || c !== void 0) {
      const A = T?.defaultState || c;
      T?.defaultState || ve(p, {
        defaultState: A
      });
      const { value: I, source: M, timestamp: _ } = s();
      se(p, I), J(p, [], {
        stateSource: M,
        lastServerSync: M === "server" ? _ : void 0,
        isDirty: !1,
        baseServerState: M === "server" ? I : void 0
      }), Se(p);
    }
  }, [p, ...i || []]), ie(() => {
    G && ve(p, {
      formElements: o,
      defaultState: c,
      localStorage: l,
      middleware: Y.current?.middleware
    });
    const S = `${p}////${y.current}`, T = k(p, []), w = T?.components || /* @__PURE__ */ new Map();
    return w.set(S, {
      forceUpdate: () => j({}),
      reactiveType: n ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: f || void 0,
      deps: f ? f(R(p, [])) : [],
      prevDeps: f ? f(R(p, [])) : []
    }), J(p, [], {
      ...T,
      components: w
    }), j({}), () => {
      const A = k(p, []), I = A?.components?.get(S);
      I?.paths && I.paths.forEach((M) => {
        const E = M.split(".").slice(1), $ = b.getState().getShadowMetadata(p, E);
        $?.pathComponents && $.pathComponents.size === 0 && (delete $.pathComponents, b.getState().setShadowMetadata(p, E, $));
      }), A?.components && J(p, [], A);
    };
  }, []);
  const a = x(null), u = ct(
    p,
    a,
    F,
    Y
  );
  b.getState().initialStateGlobal[p] || _e(p, e);
  const h = pe(() => ke(
    p,
    u,
    y.current,
    F
  ), [p, F]), g = C, v = Y.current?.syncOptions;
  return g && (a.current = g(
    h,
    v ?? {}
  )), h;
}
const ut = (e, r, l) => {
  let o = k(e, r)?.arrayKeys || [];
  const f = l?.transforms;
  if (!f || f.length === 0)
    return o;
  for (const n of f)
    if (n.type === "filter") {
      const d = [];
      o.forEach((c, t) => {
        const i = R(e, [...r, c]);
        n.fn(i, t) && d.push(c);
      }), o = d;
    } else n.type === "sort" && o.sort((d, c) => {
      const t = R(e, [...r, d]), i = R(e, [...r, c]);
      return n.fn(t, i);
    });
  return o;
}, Me = (e, r, l) => {
  const o = `${e}////${r}`, n = k(e, [])?.components?.get(o);
  !n || n.reactiveType === "none" || !(Array.isArray(n.reactiveType) ? n.reactiveType : [n.reactiveType]).includes("component") || Ge(e, l, o);
}, ae = (e, r, l) => {
  const o = k(e, []), f = /* @__PURE__ */ new Set();
  o?.components && o.components.forEach((d, c) => {
    (Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"]).includes("all") && (d.forceUpdate(), f.add(c));
  }), k(e, [
    ...r,
    "getSelected"
  ])?.pathComponents?.forEach((d) => {
    o?.components?.get(d)?.forceUpdate();
  });
  const n = k(e, r);
  for (let d of n?.arrayKeys || []) {
    const c = d + ".selected", t = k(e, c.split(".").slice(1));
    d == l && t?.pathComponents?.forEach((i) => {
      o?.components?.get(i)?.forceUpdate();
    });
  }
};
function K(e, r, l) {
  const o = k(e, r), f = r.length > 0 ? r.join(".") : "root", n = l?.arrayViews?.[f];
  if (Array.isArray(n) && n.length === 0)
    return {
      shadowMeta: o,
      value: [],
      arrayKeys: o?.arrayKeys
    };
  const d = R(e, r, n);
  return {
    shadowMeta: o,
    value: d,
    arrayKeys: o?.arrayKeys
  };
}
function ke(e, r, l, o) {
  const f = /* @__PURE__ */ new Map();
  function n({
    path: t = [],
    meta: i,
    componentId: m
  }) {
    const C = i ? JSON.stringify(i.arrayViews || i.transforms) : "", U = t.join(".") + ":" + m + ":" + C;
    if (f.has(U))
      return f.get(U);
    const j = [e, ...t].join("."), F = {
      get(p, y) {
        if (t.length === 0 && y in d)
          return d[y];
        if (!y.startsWith("$")) {
          const s = [...t, y];
          return n({
            path: s,
            componentId: m,
            meta: i
          });
        }
        if (y === "$_rebuildStateShape")
          return n;
        if (y === "$sync" && t.length === 0)
          return async function() {
            const s = b.getState().getInitialOptions(e), a = s?.sync;
            if (!a)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const u = b.getState().getShadowValue(e, []), h = s?.validation?.key;
            try {
              const g = await a.action(u);
              if (g && !g.success && g.errors, g?.success) {
                const v = b.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...v,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: u
                  // Update base server state
                }), a.onSuccess && a.onSuccess(g.data);
              } else !g?.success && a.onError && a.onError(g.error);
              return g;
            } catch (g) {
              return a.onError && a.onError(g), { success: !1, error: g };
            }
          };
        if (y === "$_status" || y === "$getStatus") {
          const s = () => {
            const { shadowMeta: a, value: u } = K(e, t, i);
            return a?.isDirty === !0 ? "dirty" : a?.stateSource === "server" || a?.isDirty === !1 ? "synced" : a?.stateSource === "localStorage" ? "restored" : a?.stateSource === "default" || u !== void 0 && !a ? "fresh" : "unknown";
          };
          return y === "$_status" ? s() : s;
        }
        if (y === "$removeStorage")
          return () => {
            const s = b.getState().initialStateGlobal[e], a = W(e), u = z(a?.localStorage?.key) ? a.localStorage.key(s) : a?.localStorage?.key, h = `${o}-${e}-${u}`;
            h && localStorage.removeItem(h);
          };
        if (y === "$showValidationErrors")
          return () => {
            const { shadowMeta: s } = K(e, t, i);
            return s?.validation?.status === "INVALID" && s.validation.errors.length > 0 ? s.validation.errors.filter((a) => a.severity === "error").map((a) => a.message) : [];
          };
        if (y === "$getSelected")
          return () => {
            const s = [e, ...t].join(".");
            Me(e, m, [
              ...t,
              "getSelected"
            ]);
            const a = b.getState().selectedIndicesMap.get(s);
            if (!a)
              return;
            const u = t.join("."), h = i?.arrayViews?.[u], g = a.split(".").pop();
            if (!(h && !h.includes(g) || R(
              e,
              a.split(".").slice(1)
            ) === void 0))
              return n({
                path: a.split(".").slice(1),
                componentId: m,
                meta: i
              });
          };
        if (y === "$getSelectedIndex")
          return () => {
            const s = e + "." + t.join(".");
            t.join(".");
            const a = b.getState().selectedIndicesMap.get(s);
            if (!a)
              return -1;
            const { keys: u } = q(e, t, i);
            if (!u)
              return -1;
            const h = a.split(".").pop();
            return u.indexOf(h);
          };
        if (y === "$clearSelected")
          return ae(e, t), () => {
            Ye({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (y === "$useVirtualView")
          return (s) => {
            const {
              itemHeight: a = 50,
              overscan: u = 6,
              stickToBottom: h = !1,
              scrollStickTolerance: g = 75
            } = s, v = x(null), [S, T] = te({
              startIndex: 0,
              endIndex: 10
            }), [w, A] = te({}), I = x(!0);
            B(() => {
              const P = setInterval(() => {
                A({});
              }, 1e3);
              return () => clearInterval(P);
            }, []);
            const M = x({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), _ = x(
              /* @__PURE__ */ new Map()
            ), { keys: E } = q(e, t, i);
            B(() => {
              const P = [e, ...t].join("."), V = b.getState().subscribeToPath(P, (O) => {
                O.type !== "GET_SELECTED" && O.type;
              });
              return () => {
                V();
              };
            }, [m, e, t.join(".")]), ie(() => {
              if (h && E.length > 0 && v.current && !M.current.isUserScrolling && I.current) {
                const P = v.current, V = () => {
                  if (P.clientHeight > 0) {
                    const O = Math.ceil(
                      P.clientHeight / a
                    ), L = E.length - 1, D = Math.max(
                      0,
                      L - O - u
                    );
                    T({ startIndex: D, endIndex: L }), requestAnimationFrame(() => {
                      X("instant"), I.current = !1;
                    });
                  } else
                    requestAnimationFrame(V);
                };
                V();
              }
            }, [E.length, h, a, u]);
            const $ = x(S);
            ie(() => {
              $.current = S;
            }, [S]);
            const N = x(E);
            ie(() => {
              N.current = E;
            }, [E]);
            const Z = we(() => {
              const P = v.current;
              if (!P) return;
              const V = P.scrollTop, { scrollHeight: O, clientHeight: L } = P, D = M.current, re = O - (V + L), ge = D.isNearBottom;
              D.isNearBottom = re <= g, V < D.lastScrollTop ? (D.scrollUpCount++, D.scrollUpCount > 3 && ge && (D.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : D.isNearBottom && (D.isUserScrolling = !1, D.scrollUpCount = 0), D.lastScrollTop = V;
              let Q = 0;
              for (let H = 0; H < E.length; H++) {
                const ye = E[H], me = _.current.get(ye);
                if (me && me.offset + me.height > V) {
                  Q = H;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                _.current,
                Q,
                S
              ), Q !== S.startIndex && S.startIndex != 0) {
                const H = Math.ceil(L / a);
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
              S.startIndex,
              a,
              u,
              g
            ]);
            B(() => {
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
                const V = v.current;
                if (!V) return;
                M.current.isUserScrolling = !1, M.current.isNearBottom = !0, M.current.scrollUpCount = 0;
                const O = () => {
                  const L = (D = 0) => {
                    if (D > 5) return;
                    const re = V.scrollHeight, ge = V.scrollTop, Q = V.clientHeight;
                    ge + Q >= re - 1 || (V.scrollTo({
                      top: re,
                      behavior: P
                    }), setTimeout(() => {
                      const H = V.scrollHeight, ye = V.scrollTop;
                      (H !== re || ye + Q < H - 1) && L(D + 1);
                    }, 50));
                  };
                  L();
                };
                "requestIdleCallback" in window ? requestIdleCallback(O, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(O);
                });
              },
              []
            );
            return B(() => {
              if (!h || !v.current) return;
              const P = v.current, V = M.current;
              let O;
              const L = () => {
                clearTimeout(O), O = setTimeout(() => {
                  !V.isUserScrolling && V.isNearBottom && X(
                    I.current ? "instant" : "smooth"
                  );
                }, 100);
              }, D = new MutationObserver(() => {
                V.isUserScrolling || L();
              });
              return D.observe(P, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), I.current ? setTimeout(() => {
                X("instant");
              }, 0) : L(), () => {
                clearTimeout(O), D.disconnect();
              };
            }, [h, E.length, X]), {
              virtualState: pe(() => {
                const P = Array.isArray(E) ? E.slice(S.startIndex, S.endIndex + 1) : [], V = t.length > 0 ? t.join(".") : "root";
                return n({
                  path: t,
                  componentId: m,
                  meta: {
                    ...i,
                    arrayViews: { [V]: P },
                    serverStateIsUpStream: !0
                  }
                });
              }, [S.startIndex, S.endIndex, E, i]),
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
                    transform: `translateY(${_.current.get(E[S.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: X,
              scrollToIndex: (P, V = "smooth") => {
                if (v.current && E[P]) {
                  const O = _.current.get(E[P])?.offset || 0;
                  v.current.scrollTo({ top: O, behavior: V });
                }
              }
            };
          };
        if (y === "$stateMap")
          return (s) => {
            const { value: a, keys: u } = q(
              e,
              t,
              i
            );
            if (!u || !Array.isArray(a))
              return [];
            const h = n({
              path: t,
              componentId: m,
              meta: i
            });
            return a.map((g, v) => {
              const S = u[v];
              if (!S) return;
              const T = [...t, S], w = n({
                path: T,
                // This now correctly points to the item in the shadow store.
                componentId: m,
                meta: i
              });
              return s(w, v, h);
            });
          };
        if (y === "$stateFilter")
          return (s) => {
            const a = t.length > 0 ? t.join(".") : "root", { keys: u, value: h } = q(
              e,
              t,
              i
            );
            if (!Array.isArray(h))
              throw new Error("stateFilter can only be used on arrays");
            const g = [];
            return h.forEach((v, S) => {
              if (s(v, S)) {
                const T = u[S];
                T && g.push(T);
              }
            }), n({
              path: t,
              componentId: m,
              meta: {
                ...i,
                arrayViews: {
                  ...i?.arrayViews || {},
                  [a]: g
                },
                transforms: [
                  ...i?.transforms || [],
                  { type: "filter", fn: s, path: t }
                ]
              }
            });
          };
        if (y === "$stateSort")
          return (s) => {
            const a = t.length > 0 ? t.join(".") : "root", { value: u, keys: h } = q(
              e,
              t,
              i
            );
            if (!Array.isArray(u) || !h)
              throw new Error("No array keys found for sorting");
            const g = u.map((S, T) => ({
              item: S,
              key: h[T]
            }));
            g.sort((S, T) => s(S.item, T.item));
            const v = g.map((S) => S.key);
            return n({
              path: t,
              componentId: m,
              meta: {
                ...i,
                arrayViews: {
                  ...i?.arrayViews || {},
                  [a]: v
                },
                transforms: [
                  ...i?.transforms || [],
                  { type: "sort", fn: s, path: t }
                ]
              }
            });
          };
        if (y === "$stream")
          return function(s = {}) {
            const {
              bufferSize: a = 100,
              flushInterval: u = 100,
              bufferStrategy: h = "accumulate",
              store: g,
              onFlush: v
            } = s;
            let S = [], T = !1, w = null;
            const A = ($) => {
              if (!T) {
                if (h === "sliding" && S.length >= a)
                  S.shift();
                else if (h === "dropping" && S.length >= a)
                  return;
                S.push($), S.length >= a && I();
              }
            }, I = () => {
              if (S.length === 0) return;
              const $ = [...S];
              if (S = [], g) {
                const N = g($);
                N !== void 0 && (Array.isArray(N) ? N : [N]).forEach((X) => {
                  r(X, t, {
                    updateType: "insert"
                  });
                });
              } else
                $.forEach((N) => {
                  r(N, t, {
                    updateType: "insert"
                  });
                });
              v?.($);
            };
            u > 0 && (w = setInterval(I, u));
            const M = ee(), _ = k(e, t) || {}, E = _.streams || /* @__PURE__ */ new Map();
            return E.set(M, { buffer: S, flushTimer: w }), J(e, t, {
              ..._,
              streams: E
            }), {
              write: ($) => A($),
              writeMany: ($) => $.forEach(A),
              flush: () => I(),
              pause: () => {
                T = !0;
              },
              resume: () => {
                T = !1, S.length > 0 && I();
              },
              close: () => {
                I(), w && clearInterval(w);
                const $ = b.getState().getShadowMetadata(e, t);
                $?.streams && $.streams.delete(M);
              }
            };
          };
        if (y === "$stateList")
          return (s) => /* @__PURE__ */ ne(() => {
            const u = x(/* @__PURE__ */ new Map()), [h, g] = te({}), v = t.length > 0 ? t.join(".") : "root", S = ut(e, t, i), T = pe(() => ({
              ...i,
              arrayViews: {
                ...i?.arrayViews || {},
                [v]: S
              }
            }), [i, v, S]), { value: w } = q(
              e,
              t,
              T
            );
            if (B(() => {
              const M = b.getState().subscribeToPath(j, (_) => {
                if (_.type === "GET_SELECTED")
                  return;
                const $ = b.getState().getShadowMetadata(e, t)?.transformCaches;
                if ($)
                  for (const N of $.keys())
                    N.startsWith(m) && $.delete(N);
                (_.type === "INSERT" || _.type === "INSERT_MANY" || _.type === "REMOVE" || _.type === "CLEAR_SELECTION" || _.type === "SERVER_STATE_UPDATE" && !i?.serverStateIsUpStream) && g({});
              });
              return () => {
                M();
              };
            }, [m, j]), !Array.isArray(w))
              return null;
            const A = n({
              path: t,
              componentId: m,
              meta: T
              // Use updated meta here
            }), I = w.map((M, _) => {
              const E = S[_];
              if (!E)
                return null;
              let $ = u.current.get(E);
              $ || ($ = ee(), u.current.set(E, $));
              const N = [...t, E];
              return be(Oe, {
                key: E,
                stateKey: e,
                itemComponentId: $,
                itemPath: N,
                localIndex: _,
                arraySetter: A,
                rebuildStateShape: n,
                renderFn: s
              });
            });
            return /* @__PURE__ */ ne(Ve, { children: I });
          }, {});
        if (y === "$stateFlattenOn")
          return (s) => {
            const a = t.length > 0 ? t.join(".") : "root", u = i?.arrayViews?.[a], h = b.getState().getShadowValue(e, t, u);
            return Array.isArray(h) ? n({
              path: [...t, "[*]", s],
              componentId: m,
              meta: i
            }) : [];
          };
        if (y === "$index")
          return (s) => {
            const a = t.length > 0 ? t.join(".") : "root", u = i?.arrayViews?.[a];
            if (u) {
              const v = u[s];
              return v ? n({
                path: [...t, v],
                componentId: m,
                meta: i
              }) : void 0;
            }
            const h = k(e, t);
            if (!h?.arrayKeys) return;
            const g = h.arrayKeys[s];
            if (g)
              return n({
                path: [...t, g],
                componentId: m,
                meta: i
              });
          };
        if (y === "$last")
          return () => {
            const { keys: s } = q(e, t, i);
            if (!s || s.length === 0)
              return;
            const a = s[s.length - 1];
            if (!a)
              return;
            const u = [...t, a];
            return n({
              path: u,
              componentId: m,
              meta: i
            });
          };
        if (y === "$insert")
          return (s, a) => {
            r(s, t, { updateType: "insert" });
          };
        if (y === "$uniqueInsert")
          return (s, a, u) => {
            const { value: h } = K(
              e,
              t,
              i
            ), g = z(s) ? s(h) : s;
            let v = null;
            if (!h.some((T) => {
              const w = a ? a.every(
                (A) => oe(T[A], g[A])
              ) : oe(T, g);
              return w && (v = T), w;
            }))
              r(g, t, { updateType: "insert" });
            else if (u && v) {
              const T = u(v), w = h.map(
                (A) => oe(A, v) ? T : A
              );
              r(w, t, {
                updateType: "update"
              });
            }
          };
        if (y === "$cut")
          return (s, a) => {
            const u = k(e, t);
            if (!u?.arrayKeys || u.arrayKeys.length === 0)
              return;
            const h = s === -1 ? u.arrayKeys.length - 1 : s !== void 0 ? s : u.arrayKeys.length - 1, g = u.arrayKeys[h];
            g && r(null, [...t, g], {
              updateType: "cut"
            });
          };
        if (y === "$cutSelected")
          return () => {
            const s = [e, ...t].join("."), { keys: a } = q(e, t, i);
            if (!a || a.length === 0)
              return;
            const u = b.getState().selectedIndicesMap.get(s);
            if (!u)
              return;
            const h = u.split(".").pop();
            if (!a.includes(h))
              return;
            const g = u.split(".").slice(1);
            b.getState().clearSelectedIndex({ arrayKey: s });
            const v = g.slice(0, -1);
            ae(e, v), r(null, g, {
              updateType: "cut"
            });
          };
        if (y === "$cutByValue")
          return (s) => {
            const {
              isArray: a,
              value: u,
              keys: h
            } = q(e, t, i);
            if (!a) return;
            const g = he(u, h, (v) => v === s);
            g && r(null, [...t, g.key], {
              updateType: "cut"
            });
          };
        if (y === "$toggleByValue")
          return (s) => {
            const {
              isArray: a,
              value: u,
              keys: h
            } = q(e, t, i);
            if (!a) return;
            const g = he(u, h, (v) => v === s);
            if (g) {
              const v = [...t, g.key];
              r(null, v, {
                updateType: "cut"
              });
            } else
              r(s, t, { updateType: "insert" });
          };
        if (y === "$findWith")
          return (s, a) => {
            const { isArray: u, value: h, keys: g } = q(e, t, i);
            if (!u)
              throw new Error("findWith can only be used on arrays");
            const v = he(
              h,
              g,
              (S) => S?.[s] === a
            );
            return n(v ? {
              path: [...t, v.key],
              componentId: m,
              meta: i
            } : {
              path: [...t, `not_found_${ee()}`],
              componentId: m,
              meta: i
            });
          };
        if (y === "$cutThis") {
          const { value: s } = K(e, t, i), a = t.slice(0, -1);
          return ae(e, a), () => {
            r(s, t, { updateType: "cut" });
          };
        }
        if (y === "$get")
          return () => {
            Me(e, m, t);
            const { value: s } = K(e, t, i);
            return s;
          };
        if (y === "$$derive")
          return (s) => $e({
            _stateKey: e,
            _path: t,
            _effect: s.toString(),
            _meta: i
          });
        if (y === "$$get")
          return () => $e({ _stateKey: e, _path: t, _meta: i });
        if (y === "$lastSynced") {
          const s = `${e}:${t.join(".")}`;
          return Ze(s);
        }
        if (y == "getLocalStorage")
          return (s) => de(o + "-" + e + "-" + s);
        if (y === "$isSelected") {
          const s = t.slice(0, -1);
          if (k(e, s)?.arrayKeys) {
            const u = e + "." + s.join("."), h = b.getState().selectedIndicesMap.get(u), g = e + "." + t.join(".");
            return h === g;
          }
          return;
        }
        if (y === "$setSelected")
          return (s) => {
            const a = t.slice(0, -1), u = e + "." + a.join("."), h = e + "." + t.join(".");
            ae(e, a, void 0), b.getState().selectedIndicesMap.get(u), s && b.getState().setSelectedIndex(u, h);
          };
        if (y === "$toggleSelected")
          return () => {
            const s = t.slice(0, -1), a = e + "." + s.join("."), u = e + "." + t.join(".");
            b.getState().selectedIndicesMap.get(a) === u ? b.getState().clearSelectedIndex({ arrayKey: a }) : b.getState().setSelectedIndex(a, u), ae(e, s);
          };
        if (y === "$_componentId")
          return m;
        if (t.length == 0) {
          if (y === "$addZodValidation")
            return (s) => {
              s.forEach((a) => {
                const u = b.getState().getShadowMetadata(e, a.path) || {};
                b.getState().setShadowMetadata(e, a.path, {
                  ...u,
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
          if (y === "$clearZodValidation")
            return (s) => {
              if (!s)
                throw new Error("clearZodValidation requires a path");
              const a = k(e, s) || {};
              J(e, s, {
                ...a,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (y === "$applyJsonPatch")
            return (s) => {
              const a = b.getState(), u = a.getShadowMetadata(e, []);
              if (!u?.components) return;
              const h = (v) => !v || v === "/" ? [] : v.split("/").slice(1).map((S) => S.replace(/~1/g, "/").replace(/~0/g, "~")), g = /* @__PURE__ */ new Set();
              for (const v of s) {
                const S = h(v.path);
                switch (v.op) {
                  case "add":
                  case "replace": {
                    const { value: T } = v;
                    a.updateShadowAtPath(e, S, T), a.markAsDirty(e, S, { bubble: !0 });
                    let w = [...S];
                    for (; ; ) {
                      const A = a.getShadowMetadata(
                        e,
                        w
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((I) => {
                        if (!g.has(I)) {
                          const M = u.components?.get(I);
                          M && (M.forceUpdate(), g.add(I));
                        }
                      }), w.length === 0) break;
                      w.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const T = S.slice(0, -1);
                    a.removeShadowArrayElement(e, S), a.markAsDirty(e, T, { bubble: !0 });
                    let w = [...T];
                    for (; ; ) {
                      const A = a.getShadowMetadata(
                        e,
                        w
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((I) => {
                        if (!g.has(I)) {
                          const M = u.components?.get(I);
                          M && (M.forceUpdate(), g.add(I));
                        }
                      }), w.length === 0) break;
                      w.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (y === "$getComponents")
            return () => k(e, [])?.components;
          if (y === "$getAllFormRefs")
            return () => Ae.getState().getFormRefsByStateKey(e);
        }
        if (y === "$getFormRef")
          return () => Ae.getState().getFormRef(e + "." + t.join("."));
        if (y === "$validationWrapper")
          return ({
            children: s,
            hideMessage: a
          }) => /* @__PURE__ */ ne(
            je,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: s
            }
          );
        if (y === "$_stateKey") return e;
        if (y === "$_path") return t;
        if (y === "$update")
          return (s) => (r(s, t, { updateType: "update" }), {
            synced: () => {
              const a = b.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...a,
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
        if (y === "$toggle") {
          const { value: s } = K(
            e,
            t,
            i
          );
          if (typeof s != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            r(!s, t, {
              updateType: "update"
            });
          };
        }
        if (y === "$isolate")
          return (s) => /* @__PURE__ */ ne(
            Fe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: n,
              renderFn: s
            }
          );
        if (y === "$formElement")
          return (s, a) => /* @__PURE__ */ ne(
            Ne,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: n,
              setState: r,
              formOpts: a,
              renderFn: s
            }
          );
        const Y = [...t, y];
        return n({
          path: Y,
          componentId: m,
          meta: i
        });
      }
    }, G = new Proxy({}, F);
    return f.set(U, G), G;
  }
  const d = {
    $revertToInitialState: (t) => {
      const i = b.getState().getShadowMetadata(e, []);
      let m;
      i?.stateSource === "server" && i.baseServerState ? m = i.baseServerState : m = b.getState().initialStateGlobal[e], He(e), se(e, m), n({
        path: [],
        componentId: l
      });
      const C = W(e), U = z(C?.localStorage?.key) ? C?.localStorage?.key(m) : C?.localStorage?.key, j = `${o}-${e}-${U}`;
      return j && localStorage.removeItem(j), Se(e), m;
    },
    $updateInitialState: (t) => {
      const i = ke(
        e,
        r,
        l,
        o
      ), m = b.getState().initialStateGlobal[e], C = W(e), U = z(C?.localStorage?.key) ? C?.localStorage?.key(m) : C?.localStorage?.key, j = `${o}-${e}-${U}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Pe(() => {
        _e(e, t), se(e, t);
        const F = b.getState().getShadowMetadata(e, []);
        F && F?.components?.forEach((G) => {
          G.forceUpdate();
        });
      }), {
        fetchId: (F) => i.$get()[F]
      };
    }
  };
  return n({
    componentId: l,
    path: []
  });
}
function $e(e) {
  return be(ft, { proxy: e });
}
function ft({
  proxy: e
}) {
  const r = x(null), l = x(null), o = x(!1), f = `${e._stateKey}-${e._path.join(".")}`, n = e._path.length > 0 ? e._path.join(".") : "root", d = e._meta?.arrayViews?.[n], c = R(e._stateKey, e._path, d);
  return B(() => {
    const t = r.current;
    if (!t || o.current) return;
    const i = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", f);
        return;
      }
      const m = t.parentElement, U = Array.from(m.childNodes).indexOf(t);
      let j = m.getAttribute("data-parent-id");
      j || (j = `parent-${crypto.randomUUID()}`, m.setAttribute("data-parent-id", j)), l.current = `instance-${crypto.randomUUID()}`;
      const F = b.getState().getShadowMetadata(e._stateKey, e._path) || {}, G = F.signals || [];
      G.push({
        instanceId: l.current,
        parentId: j,
        position: U,
        effect: e._effect
      }), b.getState().setShadowMetadata(e._stateKey, e._path, {
        ...F,
        signals: G
      });
      let p = c;
      if (e._effect)
        try {
          p = new Function(
            "state",
            `return (${e._effect})(state)`
          )(c);
        } catch (Y) {
          console.error("Error evaluating effect function:", Y);
        }
      p !== null && typeof p == "object" && (p = JSON.stringify(p));
      const y = document.createTextNode(String(p ?? ""));
      t.replaceWith(y), o.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(i), l.current) {
        const m = b.getState().getShadowMetadata(e._stateKey, e._path) || {};
        m.signals && (m.signals = m.signals.filter(
          (C) => C.instanceId !== l.current
        ), b.getState().setShadowMetadata(e._stateKey, e._path, m));
      }
    };
  }, []), be("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": f
  });
}
export {
  $e as $cogsSignal,
  Tt as addStateOptions,
  Xe as createCogsState,
  bt as createCogsStateFromSync,
  lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
