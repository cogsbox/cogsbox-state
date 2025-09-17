"use client";
import { jsx as ne, Fragment as _e } from "react/jsx-runtime";
import { pluginStore as Q } from "./pluginStore.js";
import { useState as K, useRef as N, useCallback as Te, useEffect as R, useLayoutEffect as ce, useMemo as be, createElement as $e, startTransition as Ue } from "react";
import { transformStateFunc as Oe, isFunction as G, isDeepEqual as le, isArray as Fe, getDifferences as je } from "./utility.js";
import { ValidationWrapper as Ne, IsolatedComponentWrapper as xe, FormElementWrapper as Re, MemoizedCogsItemWrapper as Be } from "./Components.jsx";
import Le from "superjson";
import { v4 as ae } from "uuid";
import { getGlobalStore as p, updateShadowTypeInfo as Ae } from "./store.js";
import { useCogsConfig as Pe } from "./CogsStateClient.jsx";
import { runValidation as ze } from "./validation.js";
const {
  getInitialOptions: W,
  updateInitialStateGlobal: ke,
  getShadowMetadata: M,
  setShadowMetadata: J,
  getShadowValue: x,
  initializeShadowState: se,
  initializeAndMergeShadowState: We,
  updateShadowAtPath: qe,
  insertShadowArrayElement: He,
  insertManyShadowArrayElements: Ce,
  removeShadowArrayElement: Ge,
  setInitialStateOptions: ue,
  setServerStateUpdate: Ie,
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
} = p.getState(), { notifyUpdate: nt } = Q.getState();
function z(e, o, l) {
  const s = M(e, o);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: p.getState().getShadowValue(e, o), keys: [] };
  const c = o.length > 0 ? o.join(".") : "root", h = l?.arrayViews?.[c] ?? s.arrayKeys;
  return Array.isArray(h) && h.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: p.getState().getShadowValue(e, o, h), keys: h ?? [] };
}
function ve(e, o, l) {
  for (let s = 0; s < e.length; s++)
    if (l(e[s], s)) {
      const g = o[s];
      if (g)
        return { key: g, index: s, value: e[s] };
    }
  return null;
}
function we(e, o) {
  const s = {
    ...W(e) || {},
    ...o
  };
  (s.validation?.zodSchemaV4 || s.validation?.zodSchemaV3) && !s.validation?.onBlur && (s.validation.onBlur = "error"), ue(e, s);
}
function Me({
  stateKey: e,
  options: o,
  initialOptionsPart: l
}) {
  const s = W(e) || {}, g = l[e] || {};
  let c = { ...g, ...s }, h = !1;
  if (o) {
    const u = (t, a) => {
      for (const S in a)
        a.hasOwnProperty(S) && (a[S] instanceof Object && !Array.isArray(a[S]) && t[S] instanceof Object ? le(t[S], a[S]) || (u(t[S], a[S]), h = !0) : t[S] !== a[S] && (t[S] = a[S], h = !0));
      return t;
    };
    c = u(c, o);
  }
  if (c.validation && (o?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || g?.validation?.hasOwnProperty("onBlur") || (c.validation.onBlur = "error", h = !0)), h) {
    ue(e, c);
    const u = s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3, t = c.validation?.zodSchemaV4 && !s?.validation?.zodSchemaV4, a = c.validation?.zodSchemaV3 && !s?.validation?.zodSchemaV3;
    !u && (t || a) && (t ? Ae(
      e,
      c.validation.zodSchemaV4,
      "zod4"
    ) : a && Ae(
      e,
      c.validation.zodSchemaV3,
      "zod3"
    ), ee(e));
  }
  return c;
}
function kt(e, o) {
  return {
    ...o,
    initialState: e,
    _addStateOptions: !0
  };
}
const Ct = (e, o) => {
  o?.plugins && Q.getState().setRegisteredPlugins(o.plugins);
  const [l, s] = Oe(e);
  Object.keys(l).forEach((u) => {
    let t = s[u] || {};
    const a = {
      ...t
    };
    o?.formElements && (a.formElements = {
      ...o.formElements,
      ...t.formElements || {}
    }), a.validation = {
      onBlur: "error",
      ...o?.validation,
      ...t.validation || {}
    }, o?.validation?.key && !t.validation?.key && (a.validation.key = `${o.validation.key}.${u}`);
    const S = W(u), b = S ? {
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
    ue(u, b);
  }), Object.keys(l).forEach((u) => {
    se(u, l[u]);
  });
  const g = (u, t) => {
    const [a] = K(t?.componentId ?? ae()), S = Me({
      stateKey: u,
      options: t,
      initialOptionsPart: s
    }), b = N(S);
    b.current = S;
    const $ = x(u, []) || l[u], P = mt($, {
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
    return R(() => {
      t && Q.getState().setPluginOptionsForState(u, t);
    }, [u, t]), R(() => (console.log("adding handler 1", u, P), Q.getState().stateHandlers.set(u, P), () => {
      Q.getState().stateHandlers.delete(u);
    }), [u, P]), P;
  };
  function c(u, t) {
    Me({ stateKey: u, options: t, initialOptionsPart: s }), t.localStorage && at(u, t), ee(u);
  }
  function h(u) {
    const a = Q.getState().registeredPlugins.map((b) => u.hasOwnProperty(b.name) ? {
      ...b,
      formWrapper: u[b.name]
    } : b);
    Q.getState().setRegisteredPlugins(a), Object.keys(l).forEach((b) => {
      const $ = W(b) || {}, P = {
        ...$,
        formElements: {
          ...$.formElements || {},
          ...u
        }
      };
      ue(b, P);
    });
  }
  return {
    useCogsState: g,
    setCogsOptionsByKey: c,
    setCogsFormElements: h
  };
}, ot = (e, o, l, s, g) => {
  l?.log && console.log(
    "saving to localstorage",
    o,
    l.localStorage?.key,
    s
  );
  const c = G(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (c && s) {
    const h = `${s}-${o}-${c}`;
    let u;
    try {
      u = Se(h)?.lastSyncedWithServer;
    } catch {
    }
    const t = M(o, []), a = {
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
    const o = window.localStorage.getItem(e);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, at = (e, o) => {
  const l = x(e, []), { sessionId: s } = Pe(), g = G(o?.localStorage?.key) ? o.localStorage.key(l) : o?.localStorage?.key;
  if (g && s) {
    const c = Se(
      `${s}-${e}-${g}`
    );
    if (c && c.lastUpdated > (c.lastSyncedWithServer || 0))
      return ee(e), !0;
  }
  return !1;
}, ee = (e) => {
  const o = M(e, []);
  if (!o) return;
  const l = /* @__PURE__ */ new Set();
  o?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || l.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    l.forEach((s) => s());
  });
};
function de(e, o, l, s) {
  const g = M(e, o);
  if (J(e, o, {
    ...g,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(l)) {
    const c = M(e, o);
    c?.arrayKeys && c.arrayKeys.forEach((h, u) => {
      const t = [...o, h], a = l[u];
      a !== void 0 && de(
        e,
        t,
        a,
        s
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((c) => {
    const h = [...o, c], u = l[c];
    de(e, h, u, s);
  });
}
let fe = [], Ee = !1;
function st() {
  Ee || (Ee = !0, console.log("Scheduling flush"), queueMicrotask(() => {
    console.log("Actually flushing"), gt();
  }));
}
function it(e, o) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: s, effect: g }) => {
    const c = document.querySelector(`[data-parent-id="${l}"]`);
    if (!c) return;
    const h = Array.from(c.childNodes);
    if (!h[s]) return;
    let u = o;
    if (g && o !== null)
      try {
        u = new Function("state", `return (${g})(state)`)(
          o
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    u !== null && typeof u == "object" && (u = JSON.stringify(u)), h[s].textContent = String(u ?? "");
  });
}
function ct(e, o, l) {
  const s = M(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const g = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let c = [...o];
    for (; ; ) {
      const h = M(e, c);
      if (h?.pathComponents && h.pathComponents.forEach((u) => {
        const t = s.components?.get(u);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || g.add(t));
      }), c.length === 0) break;
      c.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Fe(l.newValue) && je(l.newValue, l.oldValue).forEach((u) => {
      const t = u.split("."), a = [...o, ...t], S = M(e, a);
      S?.pathComponents && S.pathComponents.forEach((b) => {
        const $ = s.components?.get(b);
        $ && ((Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"]).includes("none") || g.add($));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    const c = l.type === "insert" ? o : o.slice(0, -1), h = M(e, c);
    h?.pathComponents && h.pathComponents.forEach((u) => {
      const t = s.components?.get(u);
      t && g.add(t);
    });
  }
  return g;
}
function lt(e, o, l) {
  const s = p.getState().getShadowValue(e, o), g = G(l) ? l(s) : l;
  qe(e, o, g), ge(e, o, { bubble: !0 });
  const c = M(e, o);
  return {
    type: "update",
    oldValue: s,
    newValue: g,
    shadowMeta: c
  };
}
function ut(e, o, l) {
  Ce(e, o, l), ge(e, o, { bubble: !0 });
  const s = M(e, o);
  return {
    type: "insert_many",
    count: l.length,
    shadowMeta: s,
    path: o
  };
}
function dt(e, o, l, s, g) {
  let c;
  if (G(l)) {
    const { value: a } = X(e, o);
    c = l({ state: a });
  } else
    c = l;
  const h = He(
    e,
    o,
    c,
    s,
    g
  );
  ge(e, o, { bubble: !0 });
  const u = M(e, o);
  let t;
  return u?.arrayKeys && s !== void 0 && s > 0 && (t = u.arrayKeys[s - 1]), {
    type: "insert",
    newValue: c,
    shadowMeta: u,
    path: o,
    itemId: h,
    insertAfterId: t
  };
}
function ft(e, o) {
  const l = o.slice(0, -1), s = x(e, o);
  return Ge(e, o), ge(e, l, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: l };
}
function gt() {
  const e = /* @__PURE__ */ new Set(), o = [], l = [];
  for (const s of fe) {
    if (s.status && s.updateType) {
      l.push(s);
      continue;
    }
    const g = s, c = g.type === "cut" ? null : g.newValue;
    g.shadowMeta?.signals?.length > 0 && o.push({ shadowMeta: g.shadowMeta, displayValue: c }), ct(
      g.stateKey,
      g.path,
      g
    ).forEach((u) => {
      e.add(u);
    });
  }
  l.length > 0 && Ze(l), o.forEach(({ shadowMeta: s, displayValue: g }) => {
    it(s, g);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), fe = [], Ee = !1;
}
function St(e, o, l) {
  return (g, c, h) => {
    s(e, c, g, h);
  };
  function s(g, c, h, u) {
    let t;
    switch (u.updateType) {
      case "update":
        t = lt(g, c, h);
        break;
      case "insert":
        t = dt(
          g,
          c,
          h,
          u.index,
          u.itemId
        );
        break;
      case "insert_many":
        t = ut(g, c, h);
        break;
      case "cut":
        t = ft(g, c);
        break;
    }
    t.stateKey = g, t.path = c, fe.push(t), st();
    const a = {
      timeStamp: Date.now(),
      stateKey: g,
      path: c,
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
      o
    ), l.current?.middleware && l.current.middleware({ update: a }), ze(a, u.validationTrigger || "programmatic"), nt(a);
  }
}
function mt(e, {
  stateKey: o,
  localStorage: l,
  formElements: s,
  reactiveDeps: g,
  reactiveType: c,
  componentId: h,
  defaultState: u,
  dependencies: t,
  serverState: a
} = {}) {
  const [S, b] = K({}), { sessionId: $ } = Pe();
  let P = !o;
  const [w] = K(o ?? ae()), q = N(h ?? ae()), B = N(
    null
  );
  B.current = W(w) ?? null;
  const m = Te(
    (r) => {
      const d = r ? { ...W(w), ...r } : W(w), f = d?.defaultState || u || e;
      if (d?.serverState?.status === "success" && d?.serverState?.data !== void 0)
        return {
          value: d.serverState.data,
          source: "server",
          timestamp: d.serverState.timestamp || Date.now()
        };
      if (d?.localStorage?.key && $) {
        const v = G(d.localStorage.key) ? d.localStorage.key(f) : d.localStorage.key, T = Se(
          `${$}-${w}-${v}`
        );
        if (T && T.lastUpdated > (d?.serverState?.timestamp || 0))
          return {
            value: T.state,
            source: "localStorage",
            timestamp: T.lastUpdated
          };
      }
      return {
        value: f || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, u, e, $]
  );
  R(() => {
    a && a.status === "success" && a.data !== void 0 && Ie(w, a);
  }, [a, w]), R(() => p.getState().subscribeToPath(w, (i) => {
    if (i?.type === "SERVER_STATE_UPDATE") {
      const d = i.serverState;
      if (d?.status !== "success" || d.data === void 0)
        return;
      we(w, { serverState: d });
      const f = typeof d.merge == "object" ? d.merge : d.merge === !0 ? { strategy: "append", key: "id" } : null, y = x(w, []), v = d.data;
      if (f && f.strategy === "append" && "key" in f && Array.isArray(y) && Array.isArray(v)) {
        const T = f.key;
        if (!T) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const E = new Set(
          y.map((_) => _[T])
        ), I = v.filter(
          (_) => !E.has(_[T])
        );
        I.length > 0 && Ce(w, [], I);
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
      ee(w);
    }
  }), [w]), R(() => {
    const r = p.getState().getShadowMetadata(w, []);
    if (r && r.stateSource)
      return;
    const i = W(w), d = {
      localStorageEnabled: !!i?.localStorage?.key
    };
    if (J(w, [], {
      ...r,
      features: d
    }), i?.defaultState !== void 0 || u !== void 0) {
      const T = i?.defaultState || u;
      i?.defaultState || we(w, {
        defaultState: T
      });
    }
    const { value: f, source: y, timestamp: v } = m();
    se(w, f), J(w, [], {
      stateSource: y,
      lastServerSync: y === "server" ? v : void 0,
      isDirty: y === "server" ? !1 : void 0,
      baseServerState: y === "server" ? f : void 0
    }), y === "server" && a && Ie(w, a), ee(w);
  }, [w, ...t || []]), ce(() => {
    P && we(w, {
      formElements: s,
      defaultState: u,
      localStorage: l,
      middleware: B.current?.middleware
    });
    const r = `${w}////${q.current}`, i = M(w, []), d = i?.components || /* @__PURE__ */ new Map();
    return d.set(r, {
      forceUpdate: () => b({}),
      reactiveType: c ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: g || void 0,
      deps: g ? g(x(w, [])) : [],
      prevDeps: g ? g(x(w, [])) : []
    }), J(w, [], {
      ...i,
      components: d
    }), b({}), () => {
      const f = M(w, []), y = f?.components?.get(r);
      y?.paths && y.paths.forEach((v) => {
        const E = v.split(".").slice(1), I = p.getState().getShadowMetadata(w, E);
        I?.pathComponents && I.pathComponents.size === 0 && (delete I.pathComponents, p.getState().setShadowMetadata(w, E, I));
      }), f?.components && J(w, [], f);
    };
  }, []);
  const te = St(
    w,
    $,
    B
  );
  return p.getState().initialStateGlobal[w] || ke(w, e), be(() => De(
    w,
    te,
    q.current,
    $
  ), [w, $]);
}
const yt = (e, o, l) => {
  let s = M(e, o)?.arrayKeys || [];
  const g = l?.transforms;
  if (!g || g.length === 0)
    return s;
  for (const c of g)
    if (c.type === "filter") {
      const h = [];
      s.forEach((u, t) => {
        const a = x(e, [...o, u]);
        c.fn(a, t) && h.push(u);
      }), s = h;
    } else c.type === "sort" && s.sort((h, u) => {
      const t = x(e, [...o, h]), a = x(e, [...o, u]);
      return c.fn(t, a);
    });
  return s;
}, pe = (e, o, l) => {
  const s = `${e}////${o}`, c = M(e, [])?.components?.get(s);
  !c || c.reactiveType === "none" || !(Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType]).includes("component") || Je(e, l, s);
}, oe = (e, o, l) => {
  const s = M(e, []), g = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((h, u) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), g.add(u));
  }), M(e, [
    ...o,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    s?.components?.get(h)?.forceUpdate();
  });
  const c = M(e, o);
  for (let h of c?.arrayKeys || []) {
    const u = h + ".selected", t = M(e, u.split(".").slice(1));
    h == l && t?.pathComponents?.forEach((a) => {
      s?.components?.get(a)?.forceUpdate();
    });
  }
};
function X(e, o, l) {
  const s = M(e, o), g = o.length > 0 ? o.join(".") : "root", c = l?.arrayViews?.[g];
  if (Array.isArray(c) && c.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const h = x(e, o, c);
  return {
    shadowMeta: s,
    value: h,
    arrayKeys: s?.arrayKeys
  };
}
function De(e, o, l, s) {
  const g = /* @__PURE__ */ new Map();
  function c({
    path: t = [],
    meta: a,
    componentId: S
  }) {
    const b = a ? JSON.stringify(a.arrayViews || a.transforms) : "", $ = t.join(".") + ":" + S + ":" + b;
    if (g.has($))
      return g.get($);
    const P = [e, ...t].join("."), w = {
      get(B, m) {
        if (t.length === 0 && m in h)
          return h[m];
        if (!m.startsWith("$")) {
          const n = [...t, m];
          return c({
            path: n,
            componentId: S,
            meta: a
          });
        }
        if (m === "$_rebuildStateShape")
          return c;
        if (m === "$sync" && t.length === 0)
          return async function() {
            const n = p.getState().getInitialOptions(e), r = n?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const i = p.getState().getShadowValue(e, []), d = n?.validation?.key;
            try {
              const f = await r.action(i);
              if (f && !f.success && f.errors, f?.success) {
                const y = p.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...y,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: i
                  // Update base server state
                }), r.onSuccess && r.onSuccess(f.data);
              } else !f?.success && r.onError && r.onError(f.error);
              return f;
            } catch (f) {
              return r.onError && r.onError(f), { success: !1, error: f };
            }
          };
        if (m === "$_status" || m === "$getStatus") {
          const n = () => {
            const { shadowMeta: r, value: i } = X(e, t, a);
            return console.log("getStatusFunc", t, r, i), r?.isDirty === !0 ? "dirty" : r?.stateSource === "server" || r?.isDirty === !1 ? "synced" : r?.stateSource === "localStorage" ? "restored" : r?.stateSource === "default" || i !== void 0 ? "fresh" : "unknown";
          };
          return m === "$_status" ? n() : n;
        }
        if (m === "$removeStorage")
          return () => {
            const n = p.getState().initialStateGlobal[e], r = W(e), i = G(r?.localStorage?.key) ? r.localStorage.key(n) : r?.localStorage?.key, d = `${s}-${e}-${i}`;
            d && localStorage.removeItem(d);
          };
        if (m === "$showValidationErrors")
          return () => {
            const { shadowMeta: n } = X(e, t, a);
            return n?.validation?.status === "INVALID" && n.validation.errors.length > 0 ? n.validation.errors.filter((r) => r.severity === "error").map((r) => r.message) : [];
          };
        if (m === "$getSelected")
          return () => {
            const n = [e, ...t].join(".");
            pe(e, S, [
              ...t,
              "getSelected"
            ]);
            const r = p.getState().selectedIndicesMap.get(n);
            if (!r)
              return;
            const i = t.join("."), d = a?.arrayViews?.[i], f = r.split(".").pop();
            if (!(d && !d.includes(f) || x(
              e,
              r.split(".").slice(1)
            ) === void 0))
              return c({
                path: r.split(".").slice(1),
                componentId: S,
                meta: a
              });
          };
        if (m === "$getSelectedIndex")
          return () => {
            const n = e + "." + t.join(".");
            t.join(".");
            const r = p.getState().selectedIndicesMap.get(n);
            if (!r)
              return -1;
            const { keys: i } = z(e, t, a);
            if (!i)
              return -1;
            const d = r.split(".").pop();
            return i.indexOf(d);
          };
        if (m === "$clearSelected")
          return oe(e, t), () => {
            Qe({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (m === "$useVirtualView")
          return (n) => {
            const {
              itemHeight: r = 50,
              overscan: i = 6,
              stickToBottom: d = !1,
              scrollStickTolerance: f = 75
            } = n, y = N(null), [v, T] = K({
              startIndex: 0,
              endIndex: 10
            }), [E, I] = K({}), D = N(!0);
            R(() => {
              const C = setInterval(() => {
                I({});
              }, 1e3);
              return () => clearInterval(C);
            }, []);
            const _ = N({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), O = N(
              /* @__PURE__ */ new Map()
            ), { keys: A } = z(e, t, a);
            R(() => {
              const C = [e, ...t].join("."), V = p.getState().subscribeToPath(C, (F) => {
                F.type !== "GET_SELECTED" && F.type;
              });
              return () => {
                V();
              };
            }, [S, e, t.join(".")]), ce(() => {
              if (d && A.length > 0 && y.current && !_.current.isUserScrolling && D.current) {
                const C = y.current, V = () => {
                  if (C.clientHeight > 0) {
                    const F = Math.ceil(
                      C.clientHeight / r
                    ), L = A.length - 1, U = Math.max(
                      0,
                      L - F - i
                    );
                    T({ startIndex: U, endIndex: L }), requestAnimationFrame(() => {
                      Z("instant"), D.current = !1;
                    });
                  } else
                    requestAnimationFrame(V);
                };
                V();
              }
            }, [A.length, d, r, i]);
            const k = N(v);
            ce(() => {
              k.current = v;
            }, [v]);
            const j = N(A);
            ce(() => {
              j.current = A;
            }, [A]);
            const ie = Te(() => {
              const C = y.current;
              if (!C) return;
              const V = C.scrollTop, { scrollHeight: F, clientHeight: L } = C, U = _.current, re = F - (V + L), me = U.isNearBottom;
              U.isNearBottom = re <= f, V < U.lastScrollTop ? (U.scrollUpCount++, U.scrollUpCount > 3 && me && (U.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : U.isNearBottom && (U.isUserScrolling = !1, U.scrollUpCount = 0), U.lastScrollTop = V;
              let Y = 0;
              for (let H = 0; H < A.length; H++) {
                const ye = A[H], he = O.current.get(ye);
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
                const H = Math.ceil(L / r);
                T({
                  startIndex: Math.max(0, Y - i),
                  endIndex: Math.min(
                    A.length - 1,
                    Y + H + i
                  )
                });
              }
            }, [
              A.length,
              v.startIndex,
              r,
              i,
              f
            ]);
            R(() => {
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
                _.current.isUserScrolling = !1, _.current.isNearBottom = !0, _.current.scrollUpCount = 0;
                const F = () => {
                  const L = (U = 0) => {
                    if (U > 5) return;
                    const re = V.scrollHeight, me = V.scrollTop, Y = V.clientHeight;
                    me + Y >= re - 1 || (V.scrollTo({
                      top: re,
                      behavior: C
                    }), setTimeout(() => {
                      const H = V.scrollHeight, ye = V.scrollTop;
                      (H !== re || ye + Y < H - 1) && L(U + 1);
                    }, 50));
                  };
                  L();
                };
                "requestIdleCallback" in window ? requestIdleCallback(F, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(F);
                });
              },
              []
            );
            return R(() => {
              if (!d || !y.current) return;
              const C = y.current, V = _.current;
              let F;
              const L = () => {
                clearTimeout(F), F = setTimeout(() => {
                  !V.isUserScrolling && V.isNearBottom && Z(
                    D.current ? "instant" : "smooth"
                  );
                }, 100);
              }, U = new MutationObserver(() => {
                V.isUserScrolling || L();
              });
              return U.observe(C, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), D.current ? setTimeout(() => {
                Z("instant");
              }, 0) : L(), () => {
                clearTimeout(F), U.disconnect();
              };
            }, [d, A.length, Z]), {
              virtualState: be(() => {
                const C = Array.isArray(A) ? A.slice(v.startIndex, v.endIndex + 1) : [], V = t.length > 0 ? t.join(".") : "root";
                return c({
                  path: t,
                  componentId: S,
                  meta: {
                    ...a,
                    arrayViews: { [V]: C },
                    serverStateIsUpStream: !0
                  }
                });
              }, [v.startIndex, v.endIndex, A, a]),
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
                    transform: `translateY(${O.current.get(A[v.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: Z,
              scrollToIndex: (C, V = "smooth") => {
                if (y.current && A[C]) {
                  const F = O.current.get(A[C])?.offset || 0;
                  y.current.scrollTo({ top: F, behavior: V });
                }
              }
            };
          };
        if (m === "$stateMap")
          return (n) => {
            const { value: r, keys: i } = z(
              e,
              t,
              a
            );
            if (pe(e, S, t), !i || !Array.isArray(r))
              return [];
            const d = c({
              path: t,
              componentId: S,
              meta: a
            });
            return r.map((f, y) => {
              const v = i[y];
              if (!v) return;
              const T = [...t, v], E = c({
                path: T,
                // This now correctly points to the item in the shadow store.
                componentId: S,
                meta: a
              });
              return n(E, y, d);
            });
          };
        if (m === "$stateFilter")
          return (n) => {
            const r = t.length > 0 ? t.join(".") : "root", { keys: i, value: d } = z(
              e,
              t,
              a
            );
            if (!Array.isArray(d))
              throw new Error("stateFilter can only be used on arrays");
            const f = [];
            return d.forEach((y, v) => {
              if (n(y, v)) {
                const T = i[v];
                T && f.push(T);
              }
            }), c({
              path: t,
              componentId: S,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [r]: f
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "filter", fn: n, path: t }
                ]
              }
            });
          };
        if (m === "$stateSort")
          return (n) => {
            const r = t.length > 0 ? t.join(".") : "root", { value: i, keys: d } = z(
              e,
              t,
              a
            );
            if (!Array.isArray(i) || !d)
              throw new Error("No array keys found for sorting");
            const f = i.map((v, T) => ({
              item: v,
              key: d[T]
            }));
            f.sort((v, T) => n(v.item, T.item));
            const y = f.map((v) => v.key);
            return c({
              path: t,
              componentId: S,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [r]: y
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "sort", fn: n, path: t }
                ]
              }
            });
          };
        if (m === "$stream")
          return function(n = {}) {
            const {
              bufferSize: r = 100,
              flushInterval: i = 100,
              bufferStrategy: d = "accumulate",
              store: f,
              onFlush: y
            } = n;
            let v = [], T = !1, E = null;
            const I = (k) => {
              if (!T) {
                if (d === "sliding" && v.length >= r)
                  v.shift();
                else if (d === "dropping" && v.length >= r)
                  return;
                v.push(k), v.length >= r && D();
              }
            }, D = () => {
              if (v.length === 0) return;
              const k = [...v];
              if (v = [], f) {
                const j = f(k);
                j !== void 0 && (Array.isArray(j) ? j : [j]).forEach((Z) => {
                  o(Z, t, {
                    updateType: "insert"
                  });
                });
              } else
                k.forEach((j) => {
                  o(j, t, {
                    updateType: "insert"
                  });
                });
              y?.(k);
            };
            i > 0 && (E = setInterval(D, i));
            const _ = ae(), O = M(e, t) || {}, A = O.streams || /* @__PURE__ */ new Map();
            return A.set(_, { buffer: v, flushTimer: E }), J(e, t, {
              ...O,
              streams: A
            }), {
              write: (k) => I(k),
              writeMany: (k) => k.forEach(I),
              flush: () => D(),
              pause: () => {
                T = !0;
              },
              resume: () => {
                T = !1, v.length > 0 && D();
              },
              close: () => {
                D(), E && clearInterval(E);
                const k = p.getState().getShadowMetadata(e, t);
                k?.streams && k.streams.delete(_);
              }
            };
          };
        if (m === "$stateList")
          return (n) => /* @__PURE__ */ ne(() => {
            const i = N(/* @__PURE__ */ new Map()), [d, f] = K({}), y = t.length > 0 ? t.join(".") : "root", v = yt(e, t, a), T = be(() => ({
              ...a,
              arrayViews: {
                ...a?.arrayViews || {},
                [y]: v
              }
            }), [a, y, v]), { value: E } = z(
              e,
              t,
              T
            );
            if (R(() => {
              const _ = p.getState().subscribeToPath(P, (O) => {
                if (O.type === "GET_SELECTED")
                  return;
                const k = p.getState().getShadowMetadata(e, t)?.transformCaches;
                if (k)
                  for (const j of k.keys())
                    j.startsWith(S) && k.delete(j);
                (O.type === "INSERT" || O.type === "INSERT_MANY" || O.type === "REMOVE" || O.type === "CLEAR_SELECTION" || O.type === "SERVER_STATE_UPDATE" && !a?.serverStateIsUpStream) && f({});
              });
              return () => {
                _();
              };
            }, [S, P]), !Array.isArray(E))
              return null;
            const I = c({
              path: t,
              componentId: S,
              meta: T
              // Use updated meta here
            }), D = E.map((_, O) => {
              const A = v[O];
              if (!A)
                return null;
              let k = i.current.get(A);
              k || (k = ae(), i.current.set(A, k));
              const j = [...t, A];
              return $e(Be, {
                key: A,
                stateKey: e,
                itemComponentId: k,
                itemPath: j,
                localIndex: O,
                arraySetter: I,
                rebuildStateShape: c,
                renderFn: n
              });
            });
            return /* @__PURE__ */ ne(_e, { children: D });
          }, {});
        if (m === "$stateFlattenOn")
          return (n) => {
            const r = t.length > 0 ? t.join(".") : "root", i = a?.arrayViews?.[r], d = p.getState().getShadowValue(e, t, i);
            return Array.isArray(d) ? c({
              path: [...t, "[*]", n],
              componentId: S,
              meta: a
            }) : [];
          };
        if (m === "$index")
          return (n) => {
            const r = t.length > 0 ? t.join(".") : "root", i = a?.arrayViews?.[r];
            if (i) {
              const y = i[n];
              return y ? c({
                path: [...t, y],
                componentId: S,
                meta: a
              }) : void 0;
            }
            const d = M(e, t);
            if (!d?.arrayKeys) return;
            const f = d.arrayKeys[n];
            if (f)
              return c({
                path: [...t, f],
                componentId: S,
                meta: a
              });
          };
        if (m === "$last")
          return () => {
            const { keys: n } = z(e, t, a);
            if (!n || n.length === 0)
              return;
            const r = n[n.length - 1];
            if (!r)
              return;
            const i = [...t, r];
            return c({
              path: i,
              componentId: S,
              meta: a
            });
          };
        if (m === "$insert")
          return (n, r) => {
            o(n, t, {
              updateType: "insert",
              index: r
            });
          };
        if (m === "$insertMany")
          return (n) => {
            o(n, t, {
              updateType: "insert_many"
            });
          };
        if (m === "$uniqueInsert")
          return (n, r, i) => {
            const { value: d } = X(
              e,
              t,
              a
            ), f = G(n) ? n(d) : n;
            let y = null;
            if (!d.some((T) => {
              const E = r ? r.every(
                (I) => le(T[I], f[I])
              ) : le(T, f);
              return E && (y = T), E;
            }))
              o(f, t, { updateType: "insert" });
            else if (i && y) {
              const T = i(y), E = d.map(
                (I) => le(I, y) ? T : I
              );
              o(E, t, {
                updateType: "update"
              });
            }
          };
        if (m === "$cut")
          return (n, r) => {
            const i = M(e, t);
            if (!i?.arrayKeys || i.arrayKeys.length === 0)
              return;
            const d = n === -1 ? i.arrayKeys.length - 1 : n !== void 0 ? n : i.arrayKeys.length - 1, f = i.arrayKeys[d];
            f && o(null, [...t, f], {
              updateType: "cut"
            });
          };
        if (m === "$cutSelected")
          return () => {
            const n = [e, ...t].join("."), { keys: r } = z(e, t, a);
            if (!r || r.length === 0)
              return;
            const i = p.getState().selectedIndicesMap.get(n);
            if (!i)
              return;
            const d = i.split(".").pop();
            if (!r.includes(d))
              return;
            const f = i.split(".").slice(1);
            p.getState().clearSelectedIndex({ arrayKey: n });
            const y = f.slice(0, -1);
            oe(e, y), o(null, f, {
              updateType: "cut"
            });
          };
        if (m === "$cutByValue")
          return (n) => {
            const {
              isArray: r,
              value: i,
              keys: d
            } = z(e, t, a);
            if (!r) return;
            const f = ve(i, d, (y) => y === n);
            f && o(null, [...t, f.key], {
              updateType: "cut"
            });
          };
        if (m === "$toggleByValue")
          return (n) => {
            const {
              isArray: r,
              value: i,
              keys: d
            } = z(e, t, a);
            if (!r) return;
            const f = ve(i, d, (y) => y === n);
            if (f) {
              const y = [...t, f.key];
              o(null, y, {
                updateType: "cut"
              });
            } else
              o(n, t, { updateType: "insert" });
          };
        if (m === "$findWith")
          return (n, r) => {
            const { isArray: i, value: d, keys: f } = z(e, t, a);
            if (!i)
              throw new Error("findWith can only be used on arrays");
            const y = ve(
              d,
              f,
              (v) => v?.[n] === r
            );
            return y ? c({
              path: [...t, y.key],
              componentId: S,
              meta: a
            }) : null;
          };
        if (m === "$cutThis") {
          const { value: n } = X(e, t, a), r = t.slice(0, -1);
          return oe(e, r), () => {
            o(n, t, { updateType: "cut" });
          };
        }
        if (m === "$get")
          return () => {
            pe(e, S, t);
            const { value: n } = X(e, t, a);
            return n;
          };
        if (m === "$$derive")
          return (n) => Ve({
            _stateKey: e,
            _path: t,
            _effect: n.toString(),
            _meta: a
          });
        if (m === "$formInput") {
          const n = (r) => {
            const i = M(e, r);
            return i?.formRef?.current ? i.formRef.current : (console.warn(
              `Form element ref not found for stateKey "${e}" at path "${r.join(".")}"`
            ), null);
          };
          return {
            setDisabled: (r) => {
              const i = n(t);
              i && (i.disabled = r);
            },
            focus: () => {
              n(t)?.focus();
            },
            blur: () => {
              n(t)?.blur();
            },
            scrollIntoView: (r) => {
              n(t)?.scrollIntoView(
                r ?? { behavior: "smooth", block: "center" }
              );
            },
            click: () => {
              n(t)?.click();
            },
            selectText: () => {
              const r = n(t);
              r && typeof r.select == "function" && r.select();
            }
          };
        }
        if (m === "$$get")
          return () => Ve({ _stateKey: e, _path: t, _meta: a });
        if (m === "$lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return Xe(n);
        }
        if (m == "getLocalStorage")
          return (n) => Se(s + "-" + e + "-" + n);
        if (m === "$isSelected") {
          const n = t.slice(0, -1);
          if (M(e, n)?.arrayKeys) {
            const i = e + "." + n.join("."), d = p.getState().selectedIndicesMap.get(i), f = e + "." + t.join(".");
            return d === f;
          }
          return;
        }
        if (m === "$setSelected")
          return (n) => {
            const r = t.slice(0, -1), i = e + "." + r.join("."), d = e + "." + t.join(".");
            oe(e, r, void 0), p.getState().selectedIndicesMap.get(i), n && p.getState().setSelectedIndex(i, d);
          };
        if (m === "$toggleSelected")
          return () => {
            const n = t.slice(0, -1), r = e + "." + n.join("."), i = e + "." + t.join(".");
            p.getState().selectedIndicesMap.get(r) === i ? p.getState().clearSelectedIndex({ arrayKey: r }) : p.getState().setSelectedIndex(r, i), oe(e, n);
          };
        if (m === "$_componentId")
          return S;
        if (t.length == 0) {
          if (m === "$setOptions")
            return (n) => {
              Me({ stateKey: e, options: n, initialOptionsPart: {} });
            };
          if (m === "$useFocusedFormElement")
            return () => {
              const { subscribeToPath: n } = p.getState(), r = `${e}.__focusedElement`, [i, d] = K(
                // Lazily get the initial value from the root metadata.
                () => M(e, [])?.focusedElement || null
              );
              return R(() => n(
                r,
                d
              ), [e]), i;
            };
          if (m === "$_applyUpdate")
            return (n, r, i = "update") => {
              o(n, r, { updateType: i });
            };
          if (m === "$_getEffectiveSetState")
            return o;
          if (m === "$getPluginMetaData")
            return (n) => et(e, t)?.get(n);
          if (m === "$addPluginMetaData")
            return console.log("$addPluginMetaDat"), (n, r) => tt(e, t, n, r);
          if (m === "$removePluginMetaData")
            return (n) => rt(e, t, n);
          if (m === "$addZodValidation")
            return (n, r) => {
              n.forEach((i) => {
                const d = p.getState().getShadowMetadata(e, i.path) || {};
                p.getState().setShadowMetadata(e, i.path, {
                  ...d,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: r || "client",
                        message: i.message,
                        severity: "error",
                        code: i.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                });
              });
            };
          if (m === "$clearZodValidation")
            return (n) => {
              if (!n)
                throw new Error("clearZodValidation requires a path");
              const r = M(e, n) || {};
              J(e, n, {
                ...r,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (m === "$applyOperation")
            return (n, r) => {
              console.log(
                "getGlobalStore",
                p.getState().getShadowMetadata(e, n.path)
              );
              let i;
              if (n.insertAfterId && n.updateType === "insert") {
                const d = M(e, n.path);
                if (d?.arrayKeys) {
                  const f = d.arrayKeys.indexOf(
                    n.insertAfterId
                  );
                  f !== -1 && (i = f + 1);
                }
              }
              o(n.newValue, n.path, {
                updateType: n.updateType,
                itemId: n.itemId,
                index: i,
                // Pass the calculated index
                metaData: r
              });
            };
          if (m === "$applyJsonPatch")
            return (n) => {
              const r = p.getState(), i = r.getShadowMetadata(e, []);
              if (!i?.components) return;
              const d = (y) => !y || y === "/" ? [] : y.split("/").slice(1).map((v) => v.replace(/~1/g, "/").replace(/~0/g, "~")), f = /* @__PURE__ */ new Set();
              for (const y of n) {
                const v = d(y.path);
                switch (y.op) {
                  case "add":
                  case "replace": {
                    const { value: T } = y;
                    r.updateShadowAtPath(e, v, T), r.markAsDirty(e, v, { bubble: !0 });
                    let E = [...v];
                    for (; ; ) {
                      const I = r.getShadowMetadata(
                        e,
                        E
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((D) => {
                        if (!f.has(D)) {
                          const _ = i.components?.get(D);
                          _ && (_.forceUpdate(), f.add(D));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const T = v.slice(0, -1);
                    r.removeShadowArrayElement(e, v), r.markAsDirty(e, T, { bubble: !0 });
                    let E = [...T];
                    for (; ; ) {
                      const I = r.getShadowMetadata(
                        e,
                        E
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((D) => {
                        if (!f.has(D)) {
                          const _ = i.components?.get(D);
                          _ && (_.forceUpdate(), f.add(D));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (m === "$getComponents")
            return () => M(e, [])?.components;
        }
        if (m === "$validationWrapper")
          return ({
            children: n,
            hideMessage: r
          }) => /* @__PURE__ */ ne(
            Ne,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: n
            }
          );
        if (m === "$_stateKey") return e;
        if (m === "$_path") return t;
        if (m === "$update")
          return (n) => (o(n, t, { updateType: "update" }), {
            synced: () => {
              const r = p.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...r,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const i = [e, ...t].join(".");
              Ke(i, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (m === "$toggle") {
          const { value: n } = X(
            e,
            t,
            a
          );
          if (typeof n != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            o(!n, t, {
              updateType: "update"
            });
          };
        }
        if (m === "$isolate")
          return (n) => /* @__PURE__ */ ne(
            xe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              renderFn: n
            }
          );
        if (m === "$formElement")
          return (n, r) => /* @__PURE__ */ ne(
            Re,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              setState: o,
              formOpts: r,
              renderFn: n
            }
          );
        const te = [...t, m];
        return c({
          path: te,
          componentId: S,
          meta: a
        });
      }
    }, q = new Proxy({}, w);
    return g.set($, q), q;
  }
  const h = {
    $revertToInitialState: (t) => {
      const a = p.getState().getShadowMetadata(e, []);
      let S;
      a?.stateSource === "server" && a.baseServerState ? S = a.baseServerState : S = p.getState().initialStateGlobal[e], Ye(e), se(e, S), c({
        path: [],
        componentId: l
      });
      const b = W(e), $ = G(b?.localStorage?.key) ? b?.localStorage?.key(S) : b?.localStorage?.key, P = `${s}-${e}-${$}`;
      return P && localStorage.removeItem(P), ee(e), S;
    },
    $initializeAndMergeShadowState: (t) => {
      We(e, t), ee(e);
    },
    $updateInitialState: (t) => {
      const a = De(
        e,
        o,
        l,
        s
      ), S = p.getState().initialStateGlobal[e], b = W(e), $ = G(b?.localStorage?.key) ? b?.localStorage?.key(S) : b?.localStorage?.key, P = `${s}-${e}-${$}`;
      return localStorage.getItem(P) && localStorage.removeItem(P), Ue(() => {
        ke(e, t), se(e, t);
        const w = p.getState().getShadowMetadata(e, []);
        w && w?.components?.forEach((q) => {
          q.forceUpdate();
        });
      }), {
        fetchId: (w) => a.$get()[w]
      };
    }
  };
  return c({
    componentId: l,
    path: []
  });
}
function Ve(e) {
  return $e(ht, { proxy: e });
}
function ht({
  proxy: e
}) {
  const o = N(null), l = N(null), s = N(!1), g = `${e._stateKey}-${e._path.join(".")}`, c = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[c], u = x(e._stateKey, e._path, h);
  return R(() => {
    const t = o.current;
    if (!t || s.current) return;
    const a = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", g);
        return;
      }
      const S = t.parentElement, $ = Array.from(S.childNodes).indexOf(t);
      let P = S.getAttribute("data-parent-id");
      P || (P = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", P)), l.current = `instance-${crypto.randomUUID()}`;
      const w = p.getState().getShadowMetadata(e._stateKey, e._path) || {}, q = w.signals || [];
      q.push({
        instanceId: l.current,
        parentId: P,
        position: $,
        effect: e._effect
      }), p.getState().setShadowMetadata(e._stateKey, e._path, {
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
        const S = p.getState().getShadowMetadata(e._stateKey, e._path) || {};
        S.signals && (S.signals = S.signals.filter(
          (b) => b.instanceId !== l.current
        ), p.getState().setShadowMetadata(e._stateKey, e._path, S));
      }
    };
  }, []), $e("span", {
    ref: o,
    style: { display: "contents" },
    "data-signal-id": g
  });
}
export {
  Ve as $cogsSignal,
  kt as addStateOptions,
  Ct as createCogsState,
  mt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
