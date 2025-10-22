"use client";
import { jsx as ne, Fragment as Ue } from "react/jsx-runtime";
import { pluginStore as Q } from "./pluginStore.js";
import { useState as ee, useRef as F, useCallback as Te, useEffect as z, useLayoutEffect as ce, useMemo as Me, createElement as Ee, startTransition as _e } from "react";
import { transformStateFunc as Oe, isFunction as G, isDeepEqual as le, isArray as je, getDifferences as Ne } from "./utility.js";
import { ValidationWrapper as Fe, IsolatedComponentWrapper as xe, FormElementWrapper as Re, MemoizedCogsItemWrapper as Be } from "./Components.jsx";
import Le from "superjson";
import { v4 as ae } from "uuid";
import { getGlobalStore as T, updateShadowTypeInfo as Ie } from "./store.js";
import { useCogsConfig as Pe } from "./CogsStateClient.jsx";
import { runValidation as ze } from "./validation.js";
const {
  getInitialOptions: W,
  updateInitialStateGlobal: ke,
  getShadowMetadata: b,
  setShadowMetadata: J,
  getShadowValue: x,
  initializeShadowState: se,
  initializeAndMergeShadowState: We,
  updateShadowAtPath: qe,
  insertShadowArrayElement: He,
  insertManyShadowArrayElements: Ce,
  removeShadowArrayElement: Ge,
  setInitialStateOptions: ue,
  setServerStateUpdate: $e,
  markAsDirty: ge,
  addPathComponent: Je,
  clearSelectedIndexesForState: Ye,
  addStateLog: Ze,
  setSyncInfo: Pt,
  clearSelectedIndex: Qe,
  getSyncInfo: Xe,
  notifyPathSubscribers: Ke,
  getPluginMetaDataMap: et,
  setPluginMetaData: tt,
  removePluginMetaData: rt
  // Note: The old functions are no longer imported under their original names
} = T.getState(), { notifyUpdate: nt } = Q.getState();
function L(e, n, u) {
  const s = b(e, n);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, n), keys: [] };
  const i = n.length > 0 ? n.join(".") : "root", h = u?.arrayViews?.[i] ?? s.arrayKeys;
  return Array.isArray(h) && h.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, n, h), keys: h ?? [] };
}
function ve(e, n, u) {
  for (let s = 0; s < e.length; s++)
    if (u(e[s], s)) {
      const g = n[s];
      if (g)
        return { key: g, index: s, value: e[s] };
    }
  return null;
}
function we(e, n) {
  const s = {
    ...W(e) || {},
    ...n
  };
  (s.validation?.zodSchemaV4 || s.validation?.zodSchemaV3) && !s.validation?.onBlur && (s.validation.onBlur = "error"), ue(e, s);
}
function Ae({
  stateKey: e,
  options: n,
  initialOptionsPart: u
}) {
  const s = W(e) || {}, g = u[e] || {};
  let i = { ...g, ...s }, h = !1;
  if (n) {
    const l = (t, a) => {
      for (const S in a)
        a.hasOwnProperty(S) && (a[S] instanceof Object && !Array.isArray(a[S]) && t[S] instanceof Object ? le(t[S], a[S]) || (l(t[S], a[S]), h = !0) : t[S] !== a[S] && (t[S] = a[S], h = !0));
      return t;
    };
    i = l(i, n);
  }
  if (i.validation && (n?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || g?.validation?.hasOwnProperty("onBlur") || (i.validation.onBlur = "error", h = !0)), h) {
    ue(e, i);
    const l = s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3, t = i.validation?.zodSchemaV4 && !s?.validation?.zodSchemaV4, a = i.validation?.zodSchemaV3 && !s?.validation?.zodSchemaV3;
    !l && (t || a) && (t ? Ie(
      e,
      i.validation.zodSchemaV4,
      "zod4"
    ) : a && Ie(
      e,
      i.validation.zodSchemaV3,
      "zod3"
    ), K(e));
  }
  return i;
}
function kt(e, n) {
  return {
    ...n,
    initialState: e,
    _addStateOptions: !0
  };
}
const Ct = (e, n) => {
  n?.plugins && Q.getState().setRegisteredPlugins(n.plugins);
  const [u, s] = Oe(e);
  Object.keys(u).forEach((l) => {
    let t = s[l] || {};
    const a = {
      ...t
    };
    n?.formElements && (a.formElements = {
      ...n.formElements,
      ...t.formElements || {}
    }), a.validation = {
      onBlur: "error",
      ...n?.validation,
      ...t.validation || {}
    }, n?.validation?.key && !t.validation?.key && (a.validation.key = `${n.validation.key}.${l}`);
    const S = W(l), M = S ? {
      ...S,
      ...a,
      formElements: {
        ...S.formElements,
        ...a.formElements
      },
      validation: {
        ...S.validation,
        ...a.validation
      }
    } : a;
    ue(l, M);
  }), Object.keys(u).forEach((l) => {
    se(l, u[l]);
  });
  const g = (l, t) => {
    const [a] = ee(t?.componentId ?? ae()), S = Ae({
      stateKey: l,
      options: t,
      initialOptionsPart: s
    }), M = F(S);
    M.current = S;
    const E = x(l, []) || u[l], P = yt(E, {
      stateKey: l,
      syncUpdate: t?.syncUpdate,
      componentId: a,
      localStorage: t?.localStorage,
      middleware: t?.middleware,
      reactiveType: t?.reactiveType,
      reactiveDeps: t?.reactiveDeps,
      defaultState: t?.defaultState,
      dependencies: t?.dependencies,
      serverState: t?.serverState
    });
    return z(() => {
      t && Q.getState().setPluginOptionsForState(l, t);
    }, [l, t]), z(() => (console.log("adding handler 1", l, P), Q.getState().stateHandlers.set(l, P), () => {
      Q.getState().stateHandlers.delete(l);
    }), [l, P]), P;
  };
  function i(l, t) {
    Ae({ stateKey: l, options: t, initialOptionsPart: s }), t.localStorage && at(l, t), K(l);
  }
  function h(l) {
    const a = Q.getState().registeredPlugins.map((M) => l.hasOwnProperty(M.name) ? {
      ...M,
      formWrapper: l[M.name]
    } : M);
    Q.getState().setRegisteredPlugins(a), Object.keys(u).forEach((M) => {
      const E = W(M) || {}, P = {
        ...E,
        formElements: {
          ...E.formElements || {},
          ...l
        }
      };
      ue(M, P);
    });
  }
  return {
    useCogsState: g,
    setCogsOptionsByKey: i,
    setCogsFormElements: h
  };
}, ot = (e, n, u, s, g) => {
  u?.log && console.log(
    "saving to localstorage",
    n,
    u.localStorage?.key,
    s
  );
  const i = G(u?.localStorage?.key) ? u.localStorage?.key(e) : u?.localStorage?.key;
  if (i && s) {
    const h = `${s}-${n}-${i}`;
    let l;
    try {
      l = Se(h)?.lastSyncedWithServer;
    } catch {
    }
    const t = b(n, []), a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, S = Le.serialize(a);
    window.localStorage.setItem(
      h,
      JSON.stringify(S.json)
    );
  }
}, Se = (e) => {
  if (!e) return null;
  try {
    const n = window.localStorage.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch (n) {
    return console.error("Error loading from localStorage:", n), null;
  }
}, at = (e, n) => {
  const u = x(e, []), { sessionId: s } = Pe(), g = G(n?.localStorage?.key) ? n.localStorage.key(u) : n?.localStorage?.key;
  if (g && s) {
    const i = Se(
      `${s}-${e}-${g}`
    );
    if (i && i.lastUpdated > (i.lastSyncedWithServer || 0))
      return K(e), !0;
  }
  return !1;
}, K = (e) => {
  const n = b(e, []);
  if (!n) return;
  const u = /* @__PURE__ */ new Set();
  n?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || u.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    u.forEach((s) => s());
  });
};
function de(e, n, u, s) {
  const g = b(e, n);
  if (J(e, n, {
    ...g,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(u)) {
    const i = b(e, n);
    i?.arrayKeys && i.arrayKeys.forEach((h, l) => {
      const t = [...n, h], a = u[l];
      a !== void 0 && de(
        e,
        t,
        a,
        s
      );
    });
  } else u && typeof u == "object" && u.constructor === Object && Object.keys(u).forEach((i) => {
    const h = [...n, i], l = u[i];
    de(e, h, l, s);
  });
}
let fe = [], be = !1;
function st() {
  be || (be = !0, console.log("Scheduling flush"), queueMicrotask(() => {
    console.log("Actually flushing"), gt();
  }));
}
function it(e, n) {
  e?.signals?.length && e.signals.forEach(({ parentId: u, position: s, effect: g }) => {
    const i = document.querySelector(`[data-parent-id="${u}"]`);
    if (!i) return;
    const h = Array.from(i.childNodes);
    if (!h[s]) return;
    let l = n;
    if (g && n !== null)
      try {
        l = new Function("state", `return (${g})(state)`)(
          n
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    l !== null && typeof l == "object" && (l = JSON.stringify(l)), h[s].textContent = String(l ?? "");
  });
}
function ct(e, n, u) {
  const s = b(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const g = /* @__PURE__ */ new Set();
  if (u.type === "update") {
    let i = [...n];
    for (; ; ) {
      const h = b(e, i);
      if (h?.pathComponents && h.pathComponents.forEach((l) => {
        const t = s.components?.get(l);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || g.add(t));
      }), i.length === 0) break;
      i.pop();
    }
    u.newValue && typeof u.newValue == "object" && !je(u.newValue) && Ne(u.newValue, u.oldValue).forEach((l) => {
      const t = l.split("."), a = [...n, ...t], S = b(e, a);
      S?.pathComponents && S.pathComponents.forEach((M) => {
        const E = s.components?.get(M);
        E && ((Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"]).includes("none") || g.add(E));
      });
    });
  } else if (u.type === "insert" || u.type === "cut" || u.type === "insert_many") {
    let h = [...u.type === "insert" ? n : n.slice(0, -1)];
    for (; ; ) {
      const l = b(e, h);
      if (l?.pathComponents && l.pathComponents.forEach((t) => {
        const a = s.components?.get(t);
        a && g.add(a);
      }), h.length === 0) break;
      h.pop();
    }
  }
  return g;
}
function lt(e, n, u) {
  const s = T.getState().getShadowValue(e, n), g = G(u) ? u(s) : u;
  qe(e, n, g), ge(e, n, { bubble: !0 });
  const i = b(e, n);
  return {
    type: "update",
    oldValue: s,
    newValue: g,
    shadowMeta: i
  };
}
function ut(e, n, u) {
  Ce(e, n, u), ge(e, n, { bubble: !0 });
  const s = b(e, n);
  return {
    type: "insert_many",
    count: u.length,
    shadowMeta: s,
    path: n
  };
}
function dt(e, n, u, s, g) {
  let i;
  if (G(u)) {
    const { value: a } = X(e, n);
    i = u({ state: a });
  } else
    i = u;
  const h = He(
    e,
    n,
    i,
    s,
    g
  );
  ge(e, n, { bubble: !0 });
  const l = b(e, n);
  let t;
  return l?.arrayKeys && s !== void 0 && s > 0 && (t = l.arrayKeys[s - 1]), {
    type: "insert",
    newValue: i,
    shadowMeta: l,
    path: n,
    itemId: h,
    insertAfterId: t
  };
}
function ft(e, n) {
  const u = n.slice(0, -1), s = x(e, n);
  return Ge(e, n), ge(e, u, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: u };
}
function gt() {
  const e = /* @__PURE__ */ new Set(), n = [], u = [];
  for (const s of fe) {
    if (s.status && s.updateType) {
      u.push(s);
      continue;
    }
    const g = s, i = g.type === "cut" ? null : g.newValue;
    g.shadowMeta?.signals?.length > 0 && n.push({ shadowMeta: g.shadowMeta, displayValue: i }), ct(
      g.stateKey,
      g.path,
      g
    ).forEach((l) => {
      e.add(l);
    });
  }
  u.length > 0 && Ze(u), n.forEach(({ shadowMeta: s, displayValue: g }) => {
    it(s, g);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), fe = [], be = !1;
}
function St(e, n, u) {
  return (g, i, h) => {
    s(e, i, g, h);
  };
  function s(g, i, h, l) {
    let t;
    switch (l.updateType) {
      case "update":
        t = lt(g, i, h);
        break;
      case "insert":
        t = dt(
          g,
          i,
          h,
          l.index,
          l.itemId
        );
        break;
      case "insert_many":
        t = ut(g, i, h);
        break;
      case "cut":
        t = ft(g, i);
        break;
    }
    t.stateKey = g, t.path = i, fe.push(t), st();
    const a = {
      timeStamp: Date.now(),
      stateKey: g,
      path: i,
      updateType: l.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: l.metaData
    };
    fe.push(a), t.newValue !== void 0 && ot(
      t.newValue,
      g,
      u.current,
      n
    ), u.current?.middleware && u.current.middleware({ update: a }), ze(a, l.validationTrigger || "programmatic"), nt(a);
  }
}
function yt(e, {
  stateKey: n,
  localStorage: u,
  formElements: s,
  reactiveDeps: g,
  reactiveType: i,
  componentId: h,
  defaultState: l,
  dependencies: t,
  serverState: a
} = {}) {
  const [S, M] = ee({}), { sessionId: E } = Pe();
  let P = !n;
  const [w] = ee(n ?? ae()), q = F(h ?? ae()), R = F(
    null
  );
  R.current = W(w) ?? null;
  const y = Te(
    (o) => {
      const d = o ? { ...W(w), ...o } : W(w), f = d?.defaultState || l || e;
      if (d?.serverState?.status === "success" && d?.serverState?.data !== void 0)
        return {
          value: d.serverState.data,
          source: "server",
          timestamp: d.serverState.timestamp || Date.now()
        };
      if (d?.localStorage?.key && E) {
        const v = G(d.localStorage.key) ? d.localStorage.key(f) : d.localStorage.key, p = Se(
          `${E}-${w}-${v}`
        );
        if (p && p.lastUpdated > (d?.serverState?.timestamp || 0))
          return {
            value: p.state,
            source: "localStorage",
            timestamp: p.lastUpdated
          };
      }
      return {
        value: f || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, l, e, E]
  );
  z(() => {
    a && a.status === "success" && a.data !== void 0 && $e(w, a);
  }, [a, w]), z(() => T.getState().subscribeToPath(w, (c) => {
    if (c?.type === "SERVER_STATE_UPDATE") {
      const d = c.serverState;
      if (d?.status !== "success" || d.data === void 0)
        return;
      we(w, { serverState: d });
      const f = typeof d.merge == "object" ? d.merge : d.merge === !0 ? { strategy: "append", key: "id" } : null, m = x(w, []), v = d.data;
      if (f && f.strategy === "append" && "key" in f && Array.isArray(m) && Array.isArray(v)) {
        const p = f.key;
        if (!p) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const A = new Set(
          m.map((U) => U[p])
        ), $ = v.filter(
          (U) => !A.has(U[p])
        );
        $.length > 0 && Ce(w, [], $);
        const D = x(w, []);
        de(
          w,
          [],
          D,
          d.timestamp || Date.now()
        );
      } else
        se(w, v), de(
          w,
          [],
          v,
          d.timestamp || Date.now()
        );
      K(w);
    }
  }), [w]), z(() => {
    const o = T.getState().getShadowMetadata(w, []);
    if (o && o.stateSource)
      return;
    const c = W(w), d = {
      localStorageEnabled: !!c?.localStorage?.key
    };
    if (J(w, [], {
      ...o,
      features: d
    }), c?.defaultState !== void 0 || l !== void 0) {
      const p = c?.defaultState || l;
      c?.defaultState || we(w, {
        defaultState: p
      });
    }
    const { value: f, source: m, timestamp: v } = y();
    se(w, f), J(w, [], {
      stateSource: m,
      lastServerSync: m === "server" ? v : void 0,
      isDirty: m === "server" ? !1 : void 0,
      baseServerState: m === "server" ? f : void 0
    }), m === "server" && a && $e(w, a), K(w);
  }, [w, ...t || []]), ce(() => {
    P && we(w, {
      formElements: s,
      defaultState: l,
      localStorage: u,
      middleware: R.current?.middleware
    });
    const o = `${w}////${q.current}`, c = b(w, []), d = c?.components || /* @__PURE__ */ new Map();
    return d.set(o, {
      forceUpdate: () => M({}),
      reactiveType: i ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: g || void 0,
      deps: g ? g(x(w, [])) : [],
      prevDeps: g ? g(x(w, [])) : []
    }), J(w, [], {
      ...c,
      components: d
    }), M({}), () => {
      const f = b(w, []), m = f?.components?.get(o);
      m?.paths && m.paths.forEach((v) => {
        const A = v.split(".").slice(1), $ = T.getState().getShadowMetadata(w, A);
        $?.pathComponents && $.pathComponents.size === 0 && (delete $.pathComponents, T.getState().setShadowMetadata(w, A, $));
      }), f?.components && J(w, [], f);
    };
  }, []);
  const te = St(
    w,
    E,
    R
  );
  return T.getState().initialStateGlobal[w] || ke(w, e), Me(() => De(
    w,
    te,
    q.current,
    E
  ), [w, E]);
}
const mt = (e, n, u) => {
  let s = b(e, n)?.arrayKeys || [];
  const g = u?.transforms;
  if (!g || g.length === 0)
    return s;
  for (const i of g)
    if (i.type === "filter") {
      const h = [];
      s.forEach((l, t) => {
        const a = x(e, [...n, l]);
        i.fn(a, t) && h.push(l);
      }), s = h;
    } else i.type === "sort" && s.sort((h, l) => {
      const t = x(e, [...n, h]), a = x(e, [...n, l]);
      return i.fn(t, a);
    });
  return s;
}, pe = (e, n, u) => {
  const s = `${e}////${n}`, i = b(e, [])?.components?.get(s);
  !i || i.reactiveType === "none" || !(Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType]).includes("component") || Je(e, u, s);
}, oe = (e, n, u) => {
  const s = b(e, []), g = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((h, l) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), g.add(l));
  }), b(e, [
    ...n,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    s?.components?.get(h)?.forceUpdate();
  });
  const i = b(e, n);
  for (let h of i?.arrayKeys || []) {
    const l = h + ".selected", t = b(e, l.split(".").slice(1));
    h == u && t?.pathComponents?.forEach((a) => {
      s?.components?.get(a)?.forceUpdate();
    });
  }
};
function X(e, n, u) {
  const s = b(e, n), g = n.length > 0 ? n.join(".") : "root", i = u?.arrayViews?.[g];
  if (Array.isArray(i) && i.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const h = x(e, n, i);
  return {
    shadowMeta: s,
    value: h,
    arrayKeys: s?.arrayKeys
  };
}
function De(e, n, u, s) {
  const g = /* @__PURE__ */ new Map();
  function i({
    path: t = [],
    meta: a,
    componentId: S
  }) {
    const M = a ? JSON.stringify(a.arrayViews || a.transforms) : "", E = t.join(".") + ":" + S + ":" + M;
    if (g.has(E))
      return g.get(E);
    const P = [e, ...t].join("."), w = {
      get(R, y) {
        if (typeof y != "string")
          return Reflect.get(R, y);
        if (t.length === 0 && y in h)
          return h[y];
        if (typeof y == "string" && !y.startsWith("$")) {
          const r = [...t, y];
          return i({
            path: r,
            componentId: S,
            meta: a
          });
        }
        if (y === "$_rebuildStateShape")
          return i;
        if (y === "$sync" && t.length === 0)
          return async function() {
            const r = T.getState().getInitialOptions(e), o = r?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const c = T.getState().getShadowValue(e, []), d = r?.validation?.key;
            try {
              const f = await o.action(c);
              if (f && !f.success && f.errors, f?.success) {
                const m = T.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...m,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: c
                  // Update base server state
                }), o.onSuccess && o.onSuccess(f.data);
              } else !f?.success && o.onError && o.onError(f.error);
              return f;
            } catch (f) {
              return o.onError && o.onError(f), { success: !1, error: f };
            }
          };
        if (y === "$_status" || y === "$getStatus") {
          const r = () => {
            const { shadowMeta: o, value: c } = X(e, t, a);
            return console.log("getStatusFunc", t, o, c), o?.isDirty === !0 ? "dirty" : o?.stateSource === "server" || o?.isDirty === !1 ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" || c !== void 0 ? "fresh" : "unknown";
          };
          return y === "$_status" ? r() : r;
        }
        if (y === "$removeStorage")
          return () => {
            const r = T.getState().initialStateGlobal[e], o = W(e), c = G(o?.localStorage?.key) ? o.localStorage.key(r) : o?.localStorage?.key, d = `${s}-${e}-${c}`;
            d && localStorage.removeItem(d);
          };
        if (y === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = X(e, t, a);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((o) => o.severity === "error").map((o) => o.message) : [];
          };
        if (y === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            pe(e, S, [
              ...t,
              "getSelected"
            ]);
            const o = T.getState().selectedIndicesMap.get(r);
            if (!o)
              return;
            const c = t.join("."), d = a?.arrayViews?.[c], f = o.split(".").pop();
            if (!(d && !d.includes(f) || x(
              e,
              o.split(".").slice(1)
            ) === void 0))
              return i({
                path: o.split(".").slice(1),
                componentId: S,
                meta: a
              });
          };
        if (y === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const o = T.getState().selectedIndicesMap.get(r);
            if (!o)
              return -1;
            const { keys: c } = L(e, t, a);
            if (!c)
              return -1;
            const d = o.split(".").pop();
            return c.indexOf(d);
          };
        if (y === "$clearSelected")
          return oe(e, t), () => {
            Qe({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (y === "$useVirtualView")
          return (r) => {
            const {
              itemHeight: o = 50,
              overscan: c = 6,
              stickToBottom: d = !1,
              scrollStickTolerance: f = 75
            } = r, m = F(null), [v, p] = ee({
              startIndex: 0,
              endIndex: 10
            }), [A, $] = ee({}), D = F(!0);
            z(() => {
              const C = setInterval(() => {
                $({});
              }, 1e3);
              return () => clearInterval(C);
            }, []);
            const U = F({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), O = F(
              /* @__PURE__ */ new Map()
            ), { keys: I } = L(e, t, a);
            z(() => {
              const C = [e, ...t].join("."), V = T.getState().subscribeToPath(C, (j) => {
                j.type !== "GET_SELECTED" && j.type;
              });
              return () => {
                V();
              };
            }, [S, e, t.join(".")]), ce(() => {
              if (d && I.length > 0 && m.current && !U.current.isUserScrolling && D.current) {
                const C = m.current, V = () => {
                  if (C.clientHeight > 0) {
                    const j = Math.ceil(
                      C.clientHeight / o
                    ), B = I.length - 1, _ = Math.max(
                      0,
                      B - j - c
                    );
                    p({ startIndex: _, endIndex: B }), requestAnimationFrame(() => {
                      Z("instant"), D.current = !1;
                    });
                  } else
                    requestAnimationFrame(V);
                };
                V();
              }
            }, [I.length, d, o, c]);
            const k = F(v);
            ce(() => {
              k.current = v;
            }, [v]);
            const N = F(I);
            ce(() => {
              N.current = I;
            }, [I]);
            const ie = Te(() => {
              const C = m.current;
              if (!C) return;
              const V = C.scrollTop, { scrollHeight: j, clientHeight: B } = C, _ = U.current, re = j - (V + B), ye = _.isNearBottom;
              _.isNearBottom = re <= f, V < _.lastScrollTop ? (_.scrollUpCount++, _.scrollUpCount > 3 && ye && (_.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : _.isNearBottom && (_.isUserScrolling = !1, _.scrollUpCount = 0), _.lastScrollTop = V;
              let Y = 0;
              for (let H = 0; H < I.length; H++) {
                const me = I[H], he = O.current.get(me);
                if (he && he.offset + he.height > V) {
                  Y = H;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                O.current,
                Y,
                v
              ), Y !== v.startIndex && v.startIndex != 0) {
                const H = Math.ceil(B / o);
                p({
                  startIndex: Math.max(0, Y - c),
                  endIndex: Math.min(
                    I.length - 1,
                    Y + H + c
                  )
                });
              }
            }, [
              I.length,
              v.startIndex,
              o,
              c,
              f
            ]);
            z(() => {
              const C = m.current;
              if (C)
                return C.addEventListener("scroll", ie, {
                  passive: !0
                }), () => {
                  C.removeEventListener("scroll", ie);
                };
            }, [ie, d]);
            const Z = Te(
              (C = "smooth") => {
                const V = m.current;
                if (!V) return;
                U.current.isUserScrolling = !1, U.current.isNearBottom = !0, U.current.scrollUpCount = 0;
                const j = () => {
                  const B = (_ = 0) => {
                    if (_ > 5) return;
                    const re = V.scrollHeight, ye = V.scrollTop, Y = V.clientHeight;
                    ye + Y >= re - 1 || (V.scrollTo({
                      top: re,
                      behavior: C
                    }), setTimeout(() => {
                      const H = V.scrollHeight, me = V.scrollTop;
                      (H !== re || me + Y < H - 1) && B(_ + 1);
                    }, 50));
                  };
                  B();
                };
                "requestIdleCallback" in window ? requestIdleCallback(j, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(j);
                });
              },
              []
            );
            return z(() => {
              if (!d || !m.current) return;
              const C = m.current, V = U.current;
              let j;
              const B = () => {
                clearTimeout(j), j = setTimeout(() => {
                  !V.isUserScrolling && V.isNearBottom && Z(
                    D.current ? "instant" : "smooth"
                  );
                }, 100);
              }, _ = new MutationObserver(() => {
                V.isUserScrolling || B();
              });
              return _.observe(C, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), D.current ? setTimeout(() => {
                Z("instant");
              }, 0) : B(), () => {
                clearTimeout(j), _.disconnect();
              };
            }, [d, I.length, Z]), {
              virtualState: Me(() => {
                const C = Array.isArray(I) ? I.slice(v.startIndex, v.endIndex + 1) : [], V = t.length > 0 ? t.join(".") : "root";
                return i({
                  path: t,
                  componentId: S,
                  meta: {
                    ...a,
                    arrayViews: { [V]: C },
                    serverStateIsUpStream: !0
                  }
                });
              }, [v.startIndex, v.endIndex, I, a]),
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
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${O.current.get(I[v.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: Z,
              scrollToIndex: (C, V = "smooth") => {
                if (m.current && I[C]) {
                  const j = O.current.get(I[C])?.offset || 0;
                  m.current.scrollTo({ top: j, behavior: V });
                }
              }
            };
          };
        if (y === "$stateMap")
          return (r) => {
            const { value: o, keys: c } = L(
              e,
              t,
              a
            );
            if (pe(e, S, t), !c || !Array.isArray(o))
              return [];
            const d = i({
              path: t,
              componentId: S,
              meta: a
            });
            return o.map((f, m) => {
              const v = c[m];
              if (!v) return;
              const p = [...t, v], A = i({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: S,
                meta: a
              });
              return r(A, m, d);
            });
          };
        if (y === "$stateFilter")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", { keys: c, value: d } = L(
              e,
              t,
              a
            );
            if (!Array.isArray(d))
              throw new Error("stateFilter can only be used on arrays");
            const f = [];
            return d.forEach((m, v) => {
              if (r(m, v)) {
                const p = c[v];
                p && f.push(p);
              }
            }), i({
              path: t,
              componentId: S,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [o]: f
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "filter", fn: r, path: t }
                ]
              }
            });
          };
        if (y === "$stateSort")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", { value: c, keys: d } = L(
              e,
              t,
              a
            );
            if (!Array.isArray(c) || !d)
              throw new Error("No array keys found for sorting");
            const f = c.map((v, p) => ({
              item: v,
              key: d[p]
            }));
            f.sort((v, p) => r(v.item, p.item));
            const m = f.map((v) => v.key);
            return i({
              path: t,
              componentId: S,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [o]: m
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (y === "$stream")
          return function(r = {}) {
            const {
              bufferSize: o = 100,
              flushInterval: c = 100,
              bufferStrategy: d = "accumulate",
              store: f,
              onFlush: m
            } = r;
            let v = [], p = !1, A = null;
            const $ = (k) => {
              if (!p) {
                if (d === "sliding" && v.length >= o)
                  v.shift();
                else if (d === "dropping" && v.length >= o)
                  return;
                v.push(k), v.length >= o && D();
              }
            }, D = () => {
              if (v.length === 0) return;
              const k = [...v];
              if (v = [], f) {
                const N = f(k);
                N !== void 0 && (Array.isArray(N) ? N : [N]).forEach((Z) => {
                  n(Z, t, {
                    updateType: "insert"
                  });
                });
              } else
                k.forEach((N) => {
                  n(N, t, {
                    updateType: "insert"
                  });
                });
              m?.(k);
            };
            c > 0 && (A = setInterval(D, c));
            const U = ae(), O = b(e, t) || {}, I = O.streams || /* @__PURE__ */ new Map();
            return I.set(U, { buffer: v, flushTimer: A }), J(e, t, {
              ...O,
              streams: I
            }), {
              write: (k) => $(k),
              writeMany: (k) => k.forEach($),
              flush: () => D(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, v.length > 0 && D();
              },
              close: () => {
                D(), A && clearInterval(A);
                const k = T.getState().getShadowMetadata(e, t);
                k?.streams && k.streams.delete(U);
              }
            };
          };
        if (y === "$stateList")
          return (r) => /* @__PURE__ */ ne(() => {
            const c = F(/* @__PURE__ */ new Map()), [d, f] = ee({}), m = t.length > 0 ? t.join(".") : "root", v = mt(e, t, a), p = Me(() => ({
              ...a,
              arrayViews: {
                ...a?.arrayViews || {},
                [m]: v
              }
            }), [a, m, v]), { value: A } = L(
              e,
              t,
              p
            );
            if (z(() => {
              const U = T.getState().subscribeToPath(P, (O) => {
                if (O.type === "GET_SELECTED")
                  return;
                const k = T.getState().getShadowMetadata(e, t)?.transformCaches;
                if (k)
                  for (const N of k.keys())
                    N.startsWith(S) && k.delete(N);
                (O.type === "INSERT" || O.type === "INSERT_MANY" || O.type === "REMOVE" || O.type === "CLEAR_SELECTION" || O.type === "SERVER_STATE_UPDATE" && !a?.serverStateIsUpStream) && f({});
              });
              return () => {
                U();
              };
            }, [S, P]), !Array.isArray(A))
              return null;
            const $ = i({
              path: t,
              componentId: S,
              meta: p
              // Use updated meta here
            }), D = A.map((U, O) => {
              const I = v[O];
              if (!I)
                return null;
              let k = c.current.get(I);
              k || (k = ae(), c.current.set(I, k));
              const N = [...t, I];
              return Ee(Be, {
                key: I,
                stateKey: e,
                itemComponentId: k,
                itemPath: N,
                localIndex: O,
                arraySetter: $,
                rebuildStateShape: i,
                renderFn: r
              });
            });
            return /* @__PURE__ */ ne(Ue, { children: D });
          }, {});
        if (y === "$stateFlattenOn")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", c = a?.arrayViews?.[o], d = T.getState().getShadowValue(e, t, c);
            return Array.isArray(d) ? i({
              path: [...t, "[*]", r],
              componentId: S,
              meta: a
            }) : [];
          };
        if (y === "$index")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", c = a?.arrayViews?.[o];
            if (c) {
              const m = c[r];
              return m ? i({
                path: [...t, m],
                componentId: S,
                meta: a
              }) : void 0;
            }
            const d = b(e, t);
            if (!d?.arrayKeys) return;
            const f = d.arrayKeys[r];
            if (f)
              return i({
                path: [...t, f],
                componentId: S,
                meta: a
              });
          };
        if (y === "$last")
          return () => {
            const { keys: r } = L(e, t, a);
            if (!r || r.length === 0)
              return;
            const o = r[r.length - 1];
            if (!o)
              return;
            const c = [...t, o];
            return i({
              path: c,
              componentId: S,
              meta: a
            });
          };
        if (y === "$insert")
          return (r, o) => {
            n(r, t, {
              updateType: "insert",
              index: o
            });
          };
        if (y === "$insertMany")
          return (r) => {
            n(r, t, {
              updateType: "insert_many"
            });
          };
        if (y === "$uniqueInsert")
          return (r, o, c) => {
            const { value: d } = X(
              e,
              t,
              a
            ), f = G(r) ? r(d) : r;
            let m = null;
            if (!d.some((p) => {
              const A = o ? o.every(
                ($) => le(p[$], f[$])
              ) : le(p, f);
              return A && (m = p), A;
            }))
              n(f, t, { updateType: "insert" });
            else if (c && m) {
              const p = c(m), A = d.map(
                ($) => le($, m) ? p : $
              );
              n(A, t, {
                updateType: "update"
              });
            }
          };
        if (y === "$cut")
          return (r, o) => {
            const c = b(e, t);
            if (console.log("shadowMeta ->>>>>>>>>>>>>>>>", c), !c?.arrayKeys || c.arrayKeys.length === 0)
              return;
            const d = r === -1 ? c.arrayKeys.length - 1 : r !== void 0 ? r : c.arrayKeys.length - 1;
            console.log("indexToCut ->>>>>>>>>>>>>>>>", d);
            const f = c.arrayKeys[d];
            f && (console.log("idToCut ->>>>>>>>>>>>>>>>", f), n(null, [...t, f], {
              updateType: "cut"
            }));
          };
        if (y === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: o } = L(e, t, a);
            if (!o || o.length === 0)
              return;
            const c = T.getState().selectedIndicesMap.get(r);
            if (!c)
              return;
            const d = c.split(".").pop();
            if (!o.includes(d))
              return;
            const f = c.split(".").slice(1);
            T.getState().clearSelectedIndex({ arrayKey: r });
            const m = f.slice(0, -1);
            oe(e, m), n(null, f, {
              updateType: "cut"
            });
          };
        if (y === "$cutByValue")
          return (r) => {
            const {
              isArray: o,
              value: c,
              keys: d
            } = L(e, t, a);
            if (!o) return;
            const f = ve(c, d, (m) => m === r);
            f && n(null, [...t, f.key], {
              updateType: "cut"
            });
          };
        if (y === "$toggleByValue")
          return (r) => {
            const {
              isArray: o,
              value: c,
              keys: d
            } = L(e, t, a);
            if (!o) return;
            const f = ve(c, d, (m) => m === r);
            if (f) {
              const m = [...t, f.key];
              n(null, m, {
                updateType: "cut"
              });
            } else
              n(r, t, { updateType: "insert" });
          };
        if (y === "$findWith")
          return (r, o) => {
            const { isArray: c, value: d, keys: f } = L(e, t, a);
            if (!c)
              throw new Error("findWith can only be used on arrays");
            const m = ve(
              d,
              f,
              (v) => v?.[r] === o
            );
            return m ? i({
              path: [...t, m.key],
              componentId: S,
              meta: a
            }) : null;
          };
        if (y === "$cutThis") {
          const { value: r } = X(e, t, a), o = t.slice(0, -1);
          return oe(e, o), () => {
            n(r, t, { updateType: "cut" });
          };
        }
        if (y === "$get")
          return () => {
            pe(e, S, t);
            const { value: r } = X(e, t, a);
            return r;
          };
        if (y === "$$derive")
          return (r) => Ve({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: a
          });
        if (y === "$$get")
          return () => Ve({ _stateKey: e, _path: t, _meta: a });
        if (y === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return Xe(r);
        }
        if (y == "getLocalStorage")
          return (r) => Se(s + "-" + e + "-" + r);
        if (y === "$isSelected") {
          const r = t.slice(0, -1);
          if (b(e, r)?.arrayKeys) {
            const c = e + "." + r.join("."), d = T.getState().selectedIndicesMap.get(c), f = e + "." + t.join(".");
            return d === f;
          }
          return;
        }
        if (y === "$setSelected")
          return (r) => {
            const o = t.slice(0, -1), c = e + "." + o.join("."), d = e + "." + t.join(".");
            oe(e, o, void 0), T.getState().selectedIndicesMap.get(c), r && T.getState().setSelectedIndex(c, d);
          };
        if (y === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), o = e + "." + r.join("."), c = e + "." + t.join(".");
            T.getState().selectedIndicesMap.get(o) === c ? T.getState().clearSelectedIndex({ arrayKey: o }) : T.getState().setSelectedIndex(o, c), oe(e, r);
          };
        if (y === "$_componentId")
          return S;
        if (t.length == 0) {
          if (y === "$setOptions")
            return (r) => {
              Ae({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (y === "$_applyUpdate")
            return (r, o, c = "update") => {
              n(r, o, { updateType: c });
            };
          if (y === "$_getEffectiveSetState")
            return n;
          if (y === "$getPluginMetaData")
            return (r) => et(e, t)?.get(r);
          if (y === "$addPluginMetaData")
            return console.log("$addPluginMetaDat"), (r, o) => tt(e, t, r, o);
          if (y === "$removePluginMetaData")
            return (r) => rt(e, t, r);
          if (y === "$addZodValidation")
            return (r, o) => {
              r.forEach((c) => {
                const d = T.getState().getShadowMetadata(e, c.path) || {};
                T.getState().setShadowMetadata(e, c.path, {
                  ...d,
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
          if (y === "$clearZodValidation")
            return (r) => {
              if (!r)
                throw new Error("clearZodValidation requires a path");
              const o = b(e, r) || {};
              J(e, r, {
                ...o,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (y === "$applyOperation")
            return (r, o) => {
              console.log(
                "getGlobalStore",
                T.getState().getShadowMetadata(e, r.path)
              );
              let c;
              if (r.insertAfterId && r.updateType === "insert") {
                const d = b(e, r.path);
                if (d?.arrayKeys) {
                  const f = d.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  f !== -1 && (c = f + 1);
                }
              }
              n(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                index: c,
                // Pass the calculated index
                metaData: o
              });
            };
          if (y === "$applyJsonPatch")
            return (r) => {
              const o = T.getState(), c = o.getShadowMetadata(e, []);
              if (!c?.components) return;
              const d = (m) => !m || m === "/" ? [] : m.split("/").slice(1).map((v) => v.replace(/~1/g, "/").replace(/~0/g, "~")), f = /* @__PURE__ */ new Set();
              for (const m of r) {
                const v = d(m.path);
                switch (m.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = m;
                    o.updateShadowAtPath(e, v, p), o.markAsDirty(e, v, { bubble: !0 });
                    let A = [...v];
                    for (; ; ) {
                      const $ = o.getShadowMetadata(
                        e,
                        A
                      );
                      if ($?.pathComponents && $.pathComponents.forEach((D) => {
                        if (!f.has(D)) {
                          const U = c.components?.get(D);
                          U && (U.forceUpdate(), f.add(D));
                        }
                      }), A.length === 0) break;
                      A.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = v.slice(0, -1);
                    o.removeShadowArrayElement(e, v), o.markAsDirty(e, p, { bubble: !0 });
                    let A = [...p];
                    for (; ; ) {
                      const $ = o.getShadowMetadata(
                        e,
                        A
                      );
                      if ($?.pathComponents && $.pathComponents.forEach((D) => {
                        if (!f.has(D)) {
                          const U = c.components?.get(D);
                          U && (U.forceUpdate(), f.add(D));
                        }
                      }), A.length === 0) break;
                      A.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (y === "$getComponents")
            return () => b(e, [])?.components;
        }
        if (y === "$validationWrapper")
          return ({
            children: r,
            hideMessage: o
          }) => /* @__PURE__ */ ne(
            Fe,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: r
            }
          );
        if (y === "$_stateKey") return e;
        if (y === "$_path") return t;
        if (y === "$update")
          return (r) => (n(r, t, { updateType: "update" }), {
            synced: () => {
              const o = T.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...o,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const c = [e, ...t].join(".");
              Ke(c, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (y === "$toggle") {
          const { value: r } = X(
            e,
            t,
            a
          );
          if (typeof r != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            n(!r, t, {
              updateType: "update"
            });
          };
        }
        if (y === "$isolate")
          return (r) => /* @__PURE__ */ ne(
            xe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              renderFn: r
            }
          );
        if (y === "$formElement")
          return (r, o) => /* @__PURE__ */ ne(
            Re,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              setState: n,
              formOpts: o,
              renderFn: r
            }
          );
        const te = [...t, y];
        return i({
          path: te,
          componentId: S,
          meta: a
        });
      }
    }, q = new Proxy({}, w);
    return g.set(E, q), q;
  }
  const h = {
    $revertToInitialState: (t) => {
      const a = T.getState().getShadowMetadata(e, []);
      let S;
      a?.stateSource === "server" && a.baseServerState ? S = a.baseServerState : S = T.getState().initialStateGlobal[e], Ye(e), se(e, S), i({
        path: [],
        componentId: u
      });
      const M = W(e), E = G(M?.localStorage?.key) ? M?.localStorage?.key(S) : M?.localStorage?.key, P = `${s}-${e}-${E}`;
      return P && localStorage.removeItem(P), K(e), S;
    },
    $initializeAndMergeShadowState: (t) => {
      We(e, t), K(e);
    },
    $updateInitialState: (t) => {
      const a = De(
        e,
        n,
        u,
        s
      ), S = T.getState().initialStateGlobal[e], M = W(e), E = G(M?.localStorage?.key) ? M?.localStorage?.key(S) : M?.localStorage?.key, P = `${s}-${e}-${E}`;
      return localStorage.getItem(P) && localStorage.removeItem(P), _e(() => {
        ke(e, t), se(e, t);
        const w = T.getState().getShadowMetadata(e, []);
        w && w?.components?.forEach((q) => {
          q.forceUpdate();
        });
      }), {
        fetchId: (w) => a.$get()[w]
      };
    }
  };
  return i({
    componentId: u,
    path: []
  });
}
function Ve(e) {
  return Ee(ht, { proxy: e });
}
function ht({
  proxy: e
}) {
  const n = F(null), u = F(null), s = F(!1), g = `${e._stateKey}-${e._path.join(".")}`, i = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[i], l = x(e._stateKey, e._path, h);
  return z(() => {
    const t = n.current;
    if (!t || s.current) return;
    const a = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", g);
        return;
      }
      const S = t.parentElement, E = Array.from(S.childNodes).indexOf(t);
      let P = S.getAttribute("data-parent-id");
      P || (P = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", P)), u.current = `instance-${crypto.randomUUID()}`;
      const w = T.getState().getShadowMetadata(e._stateKey, e._path) || {}, q = w.signals || [];
      q.push({
        instanceId: u.current,
        parentId: P,
        position: E,
        effect: e._effect
      }), T.getState().setShadowMetadata(e._stateKey, e._path, {
        ...w,
        signals: q
      });
      let R = l;
      if (e._effect)
        try {
          R = new Function(
            "state",
            `return (${e._effect})(state)`
          )(l);
        } catch (te) {
          console.error("Error evaluating effect function:", te);
        }
      R !== null && typeof R == "object" && (R = JSON.stringify(R));
      const y = document.createTextNode(String(R ?? ""));
      t.replaceWith(y), s.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(a), u.current) {
        const S = T.getState().getShadowMetadata(e._stateKey, e._path) || {};
        S.signals && (S.signals = S.signals.filter(
          (M) => M.instanceId !== u.current
        ), T.getState().setShadowMetadata(e._stateKey, e._path, S));
      }
    };
  }, []), Ee("span", {
    ref: n,
    style: { display: "contents" },
    "data-signal-id": g
  });
}
export {
  Ve as $cogsSignal,
  kt as addStateOptions,
  Ct as createCogsState,
  yt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
