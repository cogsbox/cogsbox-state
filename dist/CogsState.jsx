"use client";
import { jsx as ne, Fragment as Ue } from "react/jsx-runtime";
import { pluginStore as Q } from "./pluginStore.js";
import { useState as ee, useRef as F, useCallback as Te, useEffect as z, useLayoutEffect as ce, useMemo as Me, createElement as Ee, startTransition as _e } from "react";
import { transformStateFunc as Oe, isFunction as G, isDeepEqual as le, isArray as je, getDifferences as Ne } from "./utility.js";
import { ValidationWrapper as Fe, IsolatedComponentWrapper as xe, FormElementWrapper as Be, MemoizedCogsItemWrapper as Re } from "./Components.jsx";
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
function L(e, n, l) {
  const s = b(e, n);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, n), keys: [] };
  const i = n.length > 0 ? n.join(".") : "root", h = l?.arrayViews?.[i] ?? s.arrayKeys;
  return Array.isArray(h) && h.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, n, h), keys: h ?? [] };
}
function ve(e, n, l) {
  for (let s = 0; s < e.length; s++)
    if (l(e[s], s)) {
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
  initialOptionsPart: l
}) {
  const s = W(e) || {}, g = l[e] || {};
  let i = { ...g, ...s }, h = !1;
  if (n) {
    const u = (t, a) => {
      for (const S in a)
        a.hasOwnProperty(S) && (a[S] instanceof Object && !Array.isArray(a[S]) && t[S] instanceof Object ? le(t[S], a[S]) || (u(t[S], a[S]), h = !0) : t[S] !== a[S] && (t[S] = a[S], h = !0));
      return t;
    };
    i = u(i, n);
  }
  if (i.validation && (n?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || g?.validation?.hasOwnProperty("onBlur") || (i.validation.onBlur = "error", h = !0)), h) {
    ue(e, i);
    const u = s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3, t = i.validation?.zodSchemaV4 && !s?.validation?.zodSchemaV4, a = i.validation?.zodSchemaV3 && !s?.validation?.zodSchemaV3;
    !u && (t || a) && (t ? Ie(
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
  const [l, s] = Oe(e);
  Object.keys(l).forEach((u) => {
    let t = s[u] || {};
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
    }, n?.validation?.key && !t.validation?.key && (a.validation.key = `${n.validation.key}.${u}`);
    const S = W(u), M = S ? {
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
    ue(u, M);
  }), Object.keys(l).forEach((u) => {
    se(u, l[u]);
  });
  const g = (u, t) => {
    const [a] = ee(t?.componentId ?? ae()), S = Ae({
      stateKey: u,
      options: t,
      initialOptionsPart: s
    }), M = F(S);
    M.current = S;
    const E = x(u, []) || l[u], P = yt(E, {
      stateKey: u,
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
      t && Q.getState().setPluginOptionsForState(u, t);
    }, [u, t]), z(() => (console.log("adding handler 1", u, P), Q.getState().stateHandlers.set(u, P), () => {
      Q.getState().stateHandlers.delete(u);
    }), [u, P]), P;
  };
  function i(u, t) {
    Ae({ stateKey: u, options: t, initialOptionsPart: s }), t.localStorage && at(u, t), K(u);
  }
  function h(u) {
    const a = Q.getState().registeredPlugins.map((M) => u.hasOwnProperty(M.name) ? {
      ...M,
      formWrapper: u[M.name]
    } : M);
    Q.getState().setRegisteredPlugins(a), Object.keys(l).forEach((M) => {
      const E = W(M) || {}, P = {
        ...E,
        formElements: {
          ...E.formElements || {},
          ...u
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
}, ot = (e, n, l, s, g) => {
  l?.log && console.log(
    "saving to localstorage",
    n,
    l.localStorage?.key,
    s
  );
  const i = G(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (i && s) {
    const h = `${s}-${n}-${i}`;
    let u;
    try {
      u = Se(h)?.lastSyncedWithServer;
    } catch {
    }
    const t = b(n, []), a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: u,
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
  const l = x(e, []), { sessionId: s } = Pe(), g = G(n?.localStorage?.key) ? n.localStorage.key(l) : n?.localStorage?.key;
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
  const l = /* @__PURE__ */ new Set();
  n?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || l.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    l.forEach((s) => s());
  });
};
function de(e, n, l, s) {
  const g = b(e, n);
  if (J(e, n, {
    ...g,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(l)) {
    const i = b(e, n);
    i?.arrayKeys && i.arrayKeys.forEach((h, u) => {
      const t = [...n, h], a = l[u];
      a !== void 0 && de(
        e,
        t,
        a,
        s
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((i) => {
    const h = [...n, i], u = l[i];
    de(e, h, u, s);
  });
}
let fe = [], be = !1;
function st() {
  be || (be = !0, console.log("Scheduling flush"), queueMicrotask(() => {
    console.log("Actually flushing"), gt();
  }));
}
function it(e, n) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: s, effect: g }) => {
    const i = document.querySelector(`[data-parent-id="${l}"]`);
    if (!i) return;
    const h = Array.from(i.childNodes);
    if (!h[s]) return;
    let u = n;
    if (g && n !== null)
      try {
        u = new Function("state", `return (${g})(state)`)(
          n
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    u !== null && typeof u == "object" && (u = JSON.stringify(u)), h[s].textContent = String(u ?? "");
  });
}
function ct(e, n, l) {
  const s = b(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const g = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let i = [...n];
    for (; ; ) {
      const h = b(e, i);
      if (h?.pathComponents && h.pathComponents.forEach((u) => {
        const t = s.components?.get(u);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || g.add(t));
      }), i.length === 0) break;
      i.pop();
    }
    l.newValue && typeof l.newValue == "object" && !je(l.newValue) && Ne(l.newValue, l.oldValue).forEach((u) => {
      const t = u.split("."), a = [...n, ...t], S = b(e, a);
      S?.pathComponents && S.pathComponents.forEach((M) => {
        const E = s.components?.get(M);
        E && ((Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"]).includes("none") || g.add(E));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    const i = l.type === "insert" ? n : n.slice(0, -1), h = b(e, i);
    h?.pathComponents && h.pathComponents.forEach((u) => {
      const t = s.components?.get(u);
      t && g.add(t);
    });
  }
  return g;
}
function lt(e, n, l) {
  const s = T.getState().getShadowValue(e, n), g = G(l) ? l(s) : l;
  qe(e, n, g), ge(e, n, { bubble: !0 });
  const i = b(e, n);
  return {
    type: "update",
    oldValue: s,
    newValue: g,
    shadowMeta: i
  };
}
function ut(e, n, l) {
  Ce(e, n, l), ge(e, n, { bubble: !0 });
  const s = b(e, n);
  return {
    type: "insert_many",
    count: l.length,
    shadowMeta: s,
    path: n
  };
}
function dt(e, n, l, s, g) {
  let i;
  if (G(l)) {
    const { value: a } = X(e, n);
    i = l({ state: a });
  } else
    i = l;
  const h = He(
    e,
    n,
    i,
    s,
    g
  );
  ge(e, n, { bubble: !0 });
  const u = b(e, n);
  let t;
  return u?.arrayKeys && s !== void 0 && s > 0 && (t = u.arrayKeys[s - 1]), {
    type: "insert",
    newValue: i,
    shadowMeta: u,
    path: n,
    itemId: h,
    insertAfterId: t
  };
}
function ft(e, n) {
  const l = n.slice(0, -1), s = x(e, n);
  return Ge(e, n), ge(e, l, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: l };
}
function gt() {
  const e = /* @__PURE__ */ new Set(), n = [], l = [];
  for (const s of fe) {
    if (s.status && s.updateType) {
      l.push(s);
      continue;
    }
    const g = s, i = g.type === "cut" ? null : g.newValue;
    g.shadowMeta?.signals?.length > 0 && n.push({ shadowMeta: g.shadowMeta, displayValue: i }), ct(
      g.stateKey,
      g.path,
      g
    ).forEach((u) => {
      e.add(u);
    });
  }
  l.length > 0 && Ze(l), n.forEach(({ shadowMeta: s, displayValue: g }) => {
    it(s, g);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), fe = [], be = !1;
}
function St(e, n, l) {
  return (g, i, h) => {
    s(e, i, g, h);
  };
  function s(g, i, h, u) {
    let t;
    switch (u.updateType) {
      case "update":
        t = lt(g, i, h);
        break;
      case "insert":
        t = dt(
          g,
          i,
          h,
          u.index,
          u.itemId
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
      updateType: u.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: u.metaData
    };
    fe.push(a), t.newValue !== void 0 && ot(
      t.newValue,
      g,
      l.current,
      n
    ), l.current?.middleware && l.current.middleware({ update: a }), ze(a, u.validationTrigger || "programmatic"), nt(a);
  }
}
function yt(e, {
  stateKey: n,
  localStorage: l,
  formElements: s,
  reactiveDeps: g,
  reactiveType: i,
  componentId: h,
  defaultState: u,
  dependencies: t,
  serverState: a
} = {}) {
  const [S, M] = ee({}), { sessionId: E } = Pe();
  let P = !n;
  const [w] = ee(n ?? ae()), q = F(h ?? ae()), B = F(
    null
  );
  B.current = W(w) ?? null;
  const m = Te(
    (o) => {
      const d = o ? { ...W(w), ...o } : W(w), f = d?.defaultState || u || e;
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
    [w, u, e, E]
  );
  z(() => {
    a && a.status === "success" && a.data !== void 0 && $e(w, a);
  }, [a, w]), z(() => T.getState().subscribeToPath(w, (c) => {
    if (c?.type === "SERVER_STATE_UPDATE") {
      const d = c.serverState;
      if (d?.status !== "success" || d.data === void 0)
        return;
      we(w, { serverState: d });
      const f = typeof d.merge == "object" ? d.merge : d.merge === !0 ? { strategy: "append", key: "id" } : null, y = x(w, []), v = d.data;
      if (f && f.strategy === "append" && "key" in f && Array.isArray(y) && Array.isArray(v)) {
        const p = f.key;
        if (!p) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const A = new Set(
          y.map((U) => U[p])
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
    }), c?.defaultState !== void 0 || u !== void 0) {
      const p = c?.defaultState || u;
      c?.defaultState || we(w, {
        defaultState: p
      });
    }
    const { value: f, source: y, timestamp: v } = m();
    se(w, f), J(w, [], {
      stateSource: y,
      lastServerSync: y === "server" ? v : void 0,
      isDirty: y === "server" ? !1 : void 0,
      baseServerState: y === "server" ? f : void 0
    }), y === "server" && a && $e(w, a), K(w);
  }, [w, ...t || []]), ce(() => {
    P && we(w, {
      formElements: s,
      defaultState: u,
      localStorage: l,
      middleware: B.current?.middleware
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
      const f = b(w, []), y = f?.components?.get(o);
      y?.paths && y.paths.forEach((v) => {
        const A = v.split(".").slice(1), $ = T.getState().getShadowMetadata(w, A);
        $?.pathComponents && $.pathComponents.size === 0 && (delete $.pathComponents, T.getState().setShadowMetadata(w, A, $));
      }), f?.components && J(w, [], f);
    };
  }, []);
  const te = St(
    w,
    E,
    B
  );
  return T.getState().initialStateGlobal[w] || ke(w, e), Me(() => De(
    w,
    te,
    q.current,
    E
  ), [w, E]);
}
const mt = (e, n, l) => {
  let s = b(e, n)?.arrayKeys || [];
  const g = l?.transforms;
  if (!g || g.length === 0)
    return s;
  for (const i of g)
    if (i.type === "filter") {
      const h = [];
      s.forEach((u, t) => {
        const a = x(e, [...n, u]);
        i.fn(a, t) && h.push(u);
      }), s = h;
    } else i.type === "sort" && s.sort((h, u) => {
      const t = x(e, [...n, h]), a = x(e, [...n, u]);
      return i.fn(t, a);
    });
  return s;
}, pe = (e, n, l) => {
  const s = `${e}////${n}`, i = b(e, [])?.components?.get(s);
  !i || i.reactiveType === "none" || !(Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType]).includes("component") || Je(e, l, s);
}, oe = (e, n, l) => {
  const s = b(e, []), g = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((h, u) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), g.add(u));
  }), b(e, [
    ...n,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    s?.components?.get(h)?.forceUpdate();
  });
  const i = b(e, n);
  for (let h of i?.arrayKeys || []) {
    const u = h + ".selected", t = b(e, u.split(".").slice(1));
    h == l && t?.pathComponents?.forEach((a) => {
      s?.components?.get(a)?.forceUpdate();
    });
  }
};
function X(e, n, l) {
  const s = b(e, n), g = n.length > 0 ? n.join(".") : "root", i = l?.arrayViews?.[g];
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
function De(e, n, l, s) {
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
      get(B, m) {
        if (t.length === 0 && m in h)
          return h[m];
        if (!m.startsWith("$")) {
          const r = [...t, m];
          return i({
            path: r,
            componentId: S,
            meta: a
          });
        }
        if (m === "$_rebuildStateShape")
          return i;
        if (m === "$sync" && t.length === 0)
          return async function() {
            const r = T.getState().getInitialOptions(e), o = r?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const c = T.getState().getShadowValue(e, []), d = r?.validation?.key;
            try {
              const f = await o.action(c);
              if (f && !f.success && f.errors, f?.success) {
                const y = T.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...y,
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
        if (m === "$_status" || m === "$getStatus") {
          const r = () => {
            const { shadowMeta: o, value: c } = X(e, t, a);
            return console.log("getStatusFunc", t, o, c), o?.isDirty === !0 ? "dirty" : o?.stateSource === "server" || o?.isDirty === !1 ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" || c !== void 0 ? "fresh" : "unknown";
          };
          return m === "$_status" ? r() : r;
        }
        if (m === "$removeStorage")
          return () => {
            const r = T.getState().initialStateGlobal[e], o = W(e), c = G(o?.localStorage?.key) ? o.localStorage.key(r) : o?.localStorage?.key, d = `${s}-${e}-${c}`;
            d && localStorage.removeItem(d);
          };
        if (m === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = X(e, t, a);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((o) => o.severity === "error").map((o) => o.message) : [];
          };
        if (m === "$getSelected")
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
        if (m === "$getSelectedIndex")
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
        if (m === "$clearSelected")
          return oe(e, t), () => {
            Qe({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (m === "$useVirtualView")
          return (r) => {
            const {
              itemHeight: o = 50,
              overscan: c = 6,
              stickToBottom: d = !1,
              scrollStickTolerance: f = 75
            } = r, y = F(null), [v, p] = ee({
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
              if (d && I.length > 0 && y.current && !U.current.isUserScrolling && D.current) {
                const C = y.current, V = () => {
                  if (C.clientHeight > 0) {
                    const j = Math.ceil(
                      C.clientHeight / o
                    ), R = I.length - 1, _ = Math.max(
                      0,
                      R - j - c
                    );
                    p({ startIndex: _, endIndex: R }), requestAnimationFrame(() => {
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
              const C = y.current;
              if (!C) return;
              const V = C.scrollTop, { scrollHeight: j, clientHeight: R } = C, _ = U.current, re = j - (V + R), ye = _.isNearBottom;
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
                const H = Math.ceil(R / o);
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
              const C = y.current;
              if (C)
                return C.addEventListener("scroll", ie, {
                  passive: !0
                }), () => {
                  C.removeEventListener("scroll", ie);
                };
            }, [ie, d]);
            const Z = Te(
              (C = "smooth") => {
                const V = y.current;
                if (!V) return;
                U.current.isUserScrolling = !1, U.current.isNearBottom = !0, U.current.scrollUpCount = 0;
                const j = () => {
                  const R = (_ = 0) => {
                    if (_ > 5) return;
                    const re = V.scrollHeight, ye = V.scrollTop, Y = V.clientHeight;
                    ye + Y >= re - 1 || (V.scrollTo({
                      top: re,
                      behavior: C
                    }), setTimeout(() => {
                      const H = V.scrollHeight, me = V.scrollTop;
                      (H !== re || me + Y < H - 1) && R(_ + 1);
                    }, 50));
                  };
                  R();
                };
                "requestIdleCallback" in window ? requestIdleCallback(j, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(j);
                });
              },
              []
            );
            return z(() => {
              if (!d || !y.current) return;
              const C = y.current, V = U.current;
              let j;
              const R = () => {
                clearTimeout(j), j = setTimeout(() => {
                  !V.isUserScrolling && V.isNearBottom && Z(
                    D.current ? "instant" : "smooth"
                  );
                }, 100);
              }, _ = new MutationObserver(() => {
                V.isUserScrolling || R();
              });
              return _.observe(C, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), D.current ? setTimeout(() => {
                Z("instant");
              }, 0) : R(), () => {
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
                  ref: y,
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
                if (y.current && I[C]) {
                  const j = O.current.get(I[C])?.offset || 0;
                  y.current.scrollTo({ top: j, behavior: V });
                }
              }
            };
          };
        if (m === "$stateMap")
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
            return o.map((f, y) => {
              const v = c[y];
              if (!v) return;
              const p = [...t, v], A = i({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: S,
                meta: a
              });
              return r(A, y, d);
            });
          };
        if (m === "$stateFilter")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", { keys: c, value: d } = L(
              e,
              t,
              a
            );
            if (!Array.isArray(d))
              throw new Error("stateFilter can only be used on arrays");
            const f = [];
            return d.forEach((y, v) => {
              if (r(y, v)) {
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
        if (m === "$stateSort")
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
            const y = f.map((v) => v.key);
            return i({
              path: t,
              componentId: S,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [o]: y
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (m === "$stream")
          return function(r = {}) {
            const {
              bufferSize: o = 100,
              flushInterval: c = 100,
              bufferStrategy: d = "accumulate",
              store: f,
              onFlush: y
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
              y?.(k);
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
        if (m === "$stateList")
          return (r) => /* @__PURE__ */ ne(() => {
            const c = F(/* @__PURE__ */ new Map()), [d, f] = ee({}), y = t.length > 0 ? t.join(".") : "root", v = mt(e, t, a), p = Me(() => ({
              ...a,
              arrayViews: {
                ...a?.arrayViews || {},
                [y]: v
              }
            }), [a, y, v]), { value: A } = L(
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
              return Ee(Re, {
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
        if (m === "$stateFlattenOn")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", c = a?.arrayViews?.[o], d = T.getState().getShadowValue(e, t, c);
            return Array.isArray(d) ? i({
              path: [...t, "[*]", r],
              componentId: S,
              meta: a
            }) : [];
          };
        if (m === "$index")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", c = a?.arrayViews?.[o];
            if (c) {
              const y = c[r];
              return y ? i({
                path: [...t, y],
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
        if (m === "$last")
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
        if (m === "$insert")
          return (r, o) => {
            n(r, t, {
              updateType: "insert",
              index: o
            });
          };
        if (m === "$insertMany")
          return (r) => {
            n(r, t, {
              updateType: "insert_many"
            });
          };
        if (m === "$uniqueInsert")
          return (r, o, c) => {
            const { value: d } = X(
              e,
              t,
              a
            ), f = G(r) ? r(d) : r;
            let y = null;
            if (!d.some((p) => {
              const A = o ? o.every(
                ($) => le(p[$], f[$])
              ) : le(p, f);
              return A && (y = p), A;
            }))
              n(f, t, { updateType: "insert" });
            else if (c && y) {
              const p = c(y), A = d.map(
                ($) => le($, y) ? p : $
              );
              n(A, t, {
                updateType: "update"
              });
            }
          };
        if (m === "$cut")
          return (r, o) => {
            const c = b(e, t);
            if (!c?.arrayKeys || c.arrayKeys.length === 0)
              return;
            const d = r === -1 ? c.arrayKeys.length - 1 : r !== void 0 ? r : c.arrayKeys.length - 1, f = c.arrayKeys[d];
            f && n(null, [...t, f], {
              updateType: "cut"
            });
          };
        if (m === "$cutSelected")
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
            const y = f.slice(0, -1);
            oe(e, y), n(null, f, {
              updateType: "cut"
            });
          };
        if (m === "$cutByValue")
          return (r) => {
            const {
              isArray: o,
              value: c,
              keys: d
            } = L(e, t, a);
            if (!o) return;
            const f = ve(c, d, (y) => y === r);
            f && n(null, [...t, f.key], {
              updateType: "cut"
            });
          };
        if (m === "$toggleByValue")
          return (r) => {
            const {
              isArray: o,
              value: c,
              keys: d
            } = L(e, t, a);
            if (!o) return;
            const f = ve(c, d, (y) => y === r);
            if (f) {
              const y = [...t, f.key];
              n(null, y, {
                updateType: "cut"
              });
            } else
              n(r, t, { updateType: "insert" });
          };
        if (m === "$findWith")
          return (r, o) => {
            const { isArray: c, value: d, keys: f } = L(e, t, a);
            if (!c)
              throw new Error("findWith can only be used on arrays");
            const y = ve(
              d,
              f,
              (v) => v?.[r] === o
            );
            return y ? i({
              path: [...t, y.key],
              componentId: S,
              meta: a
            }) : null;
          };
        if (m === "$cutThis") {
          const { value: r } = X(e, t, a), o = t.slice(0, -1);
          return oe(e, o), () => {
            n(r, t, { updateType: "cut" });
          };
        }
        if (m === "$get")
          return () => {
            pe(e, S, t);
            const { value: r } = X(e, t, a);
            return r;
          };
        if (m === "$$derive")
          return (r) => Ve({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: a
          });
        if (m === "$$get")
          return () => Ve({ _stateKey: e, _path: t, _meta: a });
        if (m === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return Xe(r);
        }
        if (m == "getLocalStorage")
          return (r) => Se(s + "-" + e + "-" + r);
        if (m === "$isSelected") {
          const r = t.slice(0, -1);
          if (b(e, r)?.arrayKeys) {
            const c = e + "." + r.join("."), d = T.getState().selectedIndicesMap.get(c), f = e + "." + t.join(".");
            return d === f;
          }
          return;
        }
        if (m === "$setSelected")
          return (r) => {
            const o = t.slice(0, -1), c = e + "." + o.join("."), d = e + "." + t.join(".");
            oe(e, o, void 0), T.getState().selectedIndicesMap.get(c), r && T.getState().setSelectedIndex(c, d);
          };
        if (m === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), o = e + "." + r.join("."), c = e + "." + t.join(".");
            T.getState().selectedIndicesMap.get(o) === c ? T.getState().clearSelectedIndex({ arrayKey: o }) : T.getState().setSelectedIndex(o, c), oe(e, r);
          };
        if (m === "$_componentId")
          return S;
        if (t.length == 0) {
          if (m === "$setOptions")
            return (r) => {
              Ae({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (m === "$_applyUpdate")
            return (r, o, c = "update") => {
              n(r, o, { updateType: c });
            };
          if (m === "$_getEffectiveSetState")
            return n;
          if (m === "$getPluginMetaData")
            return (r) => et(e, t)?.get(r);
          if (m === "$addPluginMetaData")
            return console.log("$addPluginMetaDat"), (r, o) => tt(e, t, r, o);
          if (m === "$removePluginMetaData")
            return (r) => rt(e, t, r);
          if (m === "$addZodValidation")
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
          if (m === "$clearZodValidation")
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
          if (m === "$applyOperation")
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
          if (m === "$applyJsonPatch")
            return (r) => {
              const o = T.getState(), c = o.getShadowMetadata(e, []);
              if (!c?.components) return;
              const d = (y) => !y || y === "/" ? [] : y.split("/").slice(1).map((v) => v.replace(/~1/g, "/").replace(/~0/g, "~")), f = /* @__PURE__ */ new Set();
              for (const y of r) {
                const v = d(y.path);
                switch (y.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = y;
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
          if (m === "$getComponents")
            return () => b(e, [])?.components;
        }
        if (m === "$validationWrapper")
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
        if (m === "$_stateKey") return e;
        if (m === "$_path") return t;
        if (m === "$update")
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
        if (m === "$toggle") {
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
        if (m === "$isolate")
          return (r) => /* @__PURE__ */ ne(
            xe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              renderFn: r
            }
          );
        if (m === "$formElement")
          return (r, o) => /* @__PURE__ */ ne(
            Be,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              setState: n,
              formOpts: o,
              renderFn: r
            }
          );
        const te = [...t, m];
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
        componentId: l
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
        l,
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
    componentId: l,
    path: []
  });
}
function Ve(e) {
  return Ee(ht, { proxy: e });
}
function ht({
  proxy: e
}) {
  const n = F(null), l = F(null), s = F(!1), g = `${e._stateKey}-${e._path.join(".")}`, i = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[i], u = x(e._stateKey, e._path, h);
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
      P || (P = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", P)), l.current = `instance-${crypto.randomUUID()}`;
      const w = T.getState().getShadowMetadata(e._stateKey, e._path) || {}, q = w.signals || [];
      q.push({
        instanceId: l.current,
        parentId: P,
        position: E,
        effect: e._effect
      }), T.getState().setShadowMetadata(e._stateKey, e._path, {
        ...w,
        signals: q
      });
      let B = u;
      if (e._effect)
        try {
          B = new Function(
            "state",
            `return (${e._effect})(state)`
          )(u);
        } catch (te) {
          console.error("Error evaluating effect function:", te);
        }
      B !== null && typeof B == "object" && (B = JSON.stringify(B));
      const m = document.createTextNode(String(B ?? ""));
      t.replaceWith(m), s.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(a), l.current) {
        const S = T.getState().getShadowMetadata(e._stateKey, e._path) || {};
        S.signals && (S.signals = S.signals.filter(
          (M) => M.instanceId !== l.current
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
