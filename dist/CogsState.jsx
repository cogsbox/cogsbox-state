"use client";
import { jsx as H, Fragment as Ae } from "react/jsx-runtime";
import { pluginStore as W } from "./pluginStore.js";
import { useState as ee, useRef as G, useCallback as Me, useEffect as q, useLayoutEffect as $e, useMemo as ye, createElement as ue, startTransition as Ee } from "react";
import { transformStateFunc as Ve, isFunction as U, isDeepEqual as Y, isArray as Te, getDifferences as be } from "./utility.js";
import { ValidationWrapper as Pe, IsolatedComponentWrapper as Ie, FormElementWrapper as ke, MemoizedCogsItemWrapper as De } from "./Components.jsx";
import Ce from "superjson";
import { v4 as te } from "uuid";
import { getGlobalStore as w, updateShadowTypeInfo as fe } from "./store.js";
import { useCogsConfig as me } from "./CogsStateClient.jsx";
import { runValidation as _e } from "./validation.js";
const {
  getInitialOptions: C,
  updateInitialStateGlobal: he,
  getShadowMetadata: E,
  setShadowMetadata: B,
  getShadowValue: I,
  initializeShadowState: Z,
  initializeAndMergeShadowState: Oe,
  updateShadowAtPath: je,
  insertShadowArrayElement: Ue,
  insertManyShadowArrayElements: ve,
  removeShadowArrayElement: Ne,
  setInitialStateOptions: de,
  setServerStateUpdate: ge,
  markAsDirty: ae,
  addPathComponent: Fe,
  clearSelectedIndexesForState: ze,
  addStateLog: Re,
  clearSelectedIndex: Le,
  getSyncInfo: We,
  notifyPathSubscribers: we,
  getPluginMetaDataMap: Be,
  setPluginMetaData: Ge,
  removePluginMetaData: qe
} = w.getState(), { notifyUpdate: xe } = W.getState();
function D(e, a, l) {
  const s = E(e, a);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: w.getState().getShadowValue(e, a), keys: [] };
  const c = a.length > 0 ? a.join(".") : "root", m = l?.arrayViews?.[c] ?? s.arrayKeys;
  return Array.isArray(m) && m.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: w.getState().getShadowValue(e, a, m), keys: m ?? [] };
}
function se(e, a, l) {
  for (let s = 0; s < e.length; s++)
    if (l(e[s], s)) {
      const f = a[s];
      if (f)
        return { key: f, index: s, value: e[s] };
    }
  return null;
}
function ie(e, a) {
  const s = {
    ...C(e) || {},
    ...a
  };
  (s.validation?.zodSchemaV4 || s.validation?.zodSchemaV3) && !s.validation?.onBlur && (s.validation.onBlur = "error"), de(e, s);
}
function ce({
  stateKey: e,
  options: a,
  initialOptionsPart: l
}) {
  const s = C(e) || {}, f = l[e] || {};
  let c = { ...f, ...s }, m = !1;
  if (a) {
    const u = (t, o) => {
      for (const y in o)
        o.hasOwnProperty(y) && (o[y] instanceof Object && !Array.isArray(o[y]) && t[y] instanceof Object ? Y(t[y], o[y]) || (u(t[y], o[y]), m = !0) : t[y] !== o[y] && (t[y] = o[y], m = !0));
      return t;
    };
    c = u(c, a);
  }
  if (c.validation && (a?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || f?.validation?.hasOwnProperty("onBlur") || (c.validation.onBlur = "error", m = !0)), m) {
    de(e, c);
    const u = s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3, t = c.validation?.zodSchemaV4 && !s?.validation?.zodSchemaV4, o = c.validation?.zodSchemaV3 && !s?.validation?.zodSchemaV3;
    !u && (t || o) && (t ? fe(
      e,
      c.validation.zodSchemaV4,
      "zod4"
    ) : o && fe(
      e,
      c.validation.zodSchemaV3,
      "zod3"
    ), N(e));
  }
  return c;
}
function ht(e, a) {
  return {
    ...a,
    initialState: e,
    _addStateOptions: !0
  };
}
const vt = (e, a) => {
  a?.plugins && W.getState().setRegisteredPlugins(a.plugins);
  const [l, s] = Ve(e);
  Object.keys(l).forEach((u) => {
    let t = s[u] || {};
    const o = {
      ...t
    };
    a?.formElements && (o.formElements = {
      ...a.formElements,
      ...t.formElements || {}
    }), o.validation = {
      onBlur: "error",
      ...a?.validation,
      ...t.validation || {}
    }, a?.validation?.key && !t.validation?.key && (o.validation.key = `${a.validation.key}.${u}`);
    const y = C(u), M = y ? {
      ...y,
      ...o,
      formElements: {
        ...y.formElements,
        ...o.formElements
      },
      validation: {
        ...y.validation,
        ...o.validation
      }
    } : o;
    de(u, M);
  }), Object.keys(l).forEach((u) => {
    Z(u, l[u]);
  });
  const f = (u, t) => {
    const [o] = ee(t?.componentId ?? te()), y = ce({
      stateKey: u,
      options: t,
      initialOptionsPart: s
    }), M = G(y);
    M.current = y;
    const V = I(u, []) || l[u], T = at(
      V,
      {
        stateKey: u,
        syncUpdate: t?.syncUpdate,
        componentId: o,
        localStorage: t?.localStorage,
        middleware: t?.middleware,
        reactiveType: t?.reactiveType,
        reactiveDeps: t?.reactiveDeps,
        defaultState: t?.defaultState,
        dependencies: t?.dependencies,
        serverState: t?.serverState
      }
    );
    return q(() => {
      t && W.getState().setPluginOptionsForState(u, t);
    }, [u, t]), q(() => (W.getState().stateHandlers.set(u, T), () => {
      W.getState().stateHandlers.delete(u);
    }), [u, T]), T;
  };
  function c(u, t) {
    if (ce({ stateKey: u, options: t, initialOptionsPart: s }), t.localStorage && He(u, t), t.formElements) {
      const y = W.getState().registeredPlugins.map((M) => t.formElements.hasOwnProperty(M.name) ? {
        ...M,
        formWrapper: t.formElements[M.name]
      } : M);
      W.getState().setRegisteredPlugins(y);
    }
    N(u);
  }
  function m(u) {
    Object.keys(l).forEach((o) => {
      c(o, u);
    });
  }
  return {
    useCogsState: f,
    setCogsOptionsByKey: c,
    setCogsOptions: m
  };
}, Je = (e, a, l, s, f) => {
  l?.log && console.log(
    "saving to localstorage",
    a,
    l.localStorage?.key,
    s
  );
  const c = U(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (c && s) {
    const m = `${s}-${a}-${c}`;
    let u;
    try {
      u = oe(m)?.lastSyncedWithServer;
    } catch {
    }
    const t = E(a, []), o = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: u,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, y = Ce.serialize(o);
    window.localStorage.setItem(
      m,
      JSON.stringify(y.json)
    );
  }
}, oe = (e) => {
  if (!e) return null;
  try {
    const a = window.localStorage.getItem(e);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, He = (e, a) => {
  const l = I(e, []), { sessionId: s } = me(), f = U(a?.localStorage?.key) ? a.localStorage.key(l) : a?.localStorage?.key;
  if (f && s) {
    const c = oe(
      `${s}-${e}-${f}`
    );
    if (c && c.lastUpdated > (c.lastSyncedWithServer || 0))
      return N(e), !0;
  }
  return !1;
}, N = (e) => {
  const a = E(e, []);
  if (!a) return;
  const l = /* @__PURE__ */ new Set();
  a?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || l.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    l.forEach((s) => s());
  });
};
function re(e, a, l, s) {
  const f = E(e, a);
  if (B(e, a, {
    ...f,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(l)) {
    const c = E(e, a);
    c?.arrayKeys && c.arrayKeys.forEach((m, u) => {
      const t = [...a, m], o = l[u];
      o !== void 0 && re(
        e,
        t,
        o,
        s
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((c) => {
    const m = [...a, c], u = l[c];
    re(e, m, u, s);
  });
}
let ne = [], le = !1;
function Qe() {
  le || (le = !0, queueMicrotask(() => {
    rt();
  }));
}
function Ye(e, a) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: s, effect: f }) => {
    const c = document.querySelector(`[data-parent-id="${l}"]`);
    if (!c) return;
    const m = Array.from(c.childNodes);
    if (!m[s]) return;
    let u = a;
    if (f && a !== null)
      try {
        u = new Function("state", `return (${f})(state)`)(
          a
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    u !== null && typeof u == "object" && (u = JSON.stringify(u)), m[s].textContent = String(u ?? "");
  });
}
function Ze(e, a, l) {
  const s = E(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const f = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let c = [...a];
    for (; ; ) {
      const m = E(e, c);
      if (m?.pathComponents && m.pathComponents.forEach((u) => {
        const t = s.components?.get(u);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || f.add(t));
      }), c.length === 0) break;
      c.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Te(l.newValue) && be(l.newValue, l.oldValue).forEach((u) => {
      const t = u.split("."), o = [...a, ...t], y = E(e, o);
      y?.pathComponents && y.pathComponents.forEach((M) => {
        const V = s.components?.get(M);
        V && ((Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"]).includes("none") || f.add(V));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    let m = [...l.type === "insert" ? a : a.slice(0, -1)];
    for (; ; ) {
      const u = E(e, m);
      if (u?.pathComponents && u.pathComponents.forEach((t) => {
        const o = s.components?.get(t);
        o && f.add(o);
      }), m.length === 0) break;
      m.pop();
    }
  }
  return f;
}
function Xe(e, a, l) {
  const s = w.getState().getShadowValue(e, a), f = U(l) ? l(s) : l;
  if (Y(s, f))
    return null;
  je(e, a, f), ae(e, a, { bubble: !0 });
  const c = E(e, a);
  return {
    type: "update",
    oldValue: s,
    newValue: f,
    shadowMeta: c
  };
}
function Ke(e, a, l) {
  ve(e, a, l), ae(e, a, { bubble: !0 });
  const s = E(e, a);
  return {
    type: "insert_many",
    count: l.length,
    shadowMeta: s,
    path: a
  };
}
function et(e, a, l, s, f) {
  let c;
  if (U(l)) {
    const { value: o } = R(e, a);
    c = l({ state: o });
  } else
    c = l;
  const m = Ue(
    e,
    a,
    c,
    s,
    f
  );
  ae(e, a, { bubble: !0 });
  const u = E(e, a);
  let t;
  return u?.arrayKeys && s !== void 0 && s > 0 && (t = u.arrayKeys[s - 1]), {
    type: "insert",
    newValue: c,
    shadowMeta: u,
    path: a,
    itemId: m,
    insertAfterId: t
  };
}
function tt(e, a) {
  const l = a.slice(0, -1), s = I(e, a);
  Ne(e, a), ae(e, l, { bubble: !0 });
  const f = [e, ...l].join(".");
  return we(f, { type: "REMOVE" }), { type: "cut", oldValue: s, parentPath: l };
}
function rt() {
  const e = /* @__PURE__ */ new Set(), a = [], l = [];
  for (const s of ne) {
    if (s.status && s.updateType) {
      l.push(s);
      continue;
    }
    const f = s, c = f.type === "cut" ? null : f.newValue;
    f.shadowMeta?.signals?.length > 0 && a.push({ shadowMeta: f.shadowMeta, displayValue: c }), Ze(
      f.stateKey,
      f.path,
      f
    ).forEach((u) => {
      e.add(u);
    });
  }
  l.length > 0 && Re(l), a.forEach(({ shadowMeta: s, displayValue: f }) => {
    Ye(s, f);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), ne = [], le = !1;
}
function nt(e, a, l) {
  return (f, c, m) => {
    s(e, c, f, m);
  };
  function s(f, c, m, u) {
    let t;
    switch (u.updateType) {
      case "update":
        t = Xe(f, c, m);
        break;
      case "insert":
        t = et(
          f,
          c,
          m,
          u.index,
          u.itemId
        );
        break;
      case "insert_many":
        t = Ke(f, c, m);
        break;
      case "cut":
        t = tt(f, c);
        break;
    }
    if (t === null)
      return;
    t.stateKey = f, t.path = c, ne.push(t), Qe();
    const o = {
      timeStamp: Date.now(),
      stateKey: f,
      path: c,
      updateType: u.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: u.metaData
    };
    ne.push(o), t.newValue !== void 0 && Je(
      t.newValue,
      f,
      l.current,
      a
    ), l.current?.middleware && l.current.middleware({ update: o }), _e(o, u.validationTrigger || "programmatic"), xe(o);
  }
}
function at(e, {
  stateKey: a,
  localStorage: l,
  formElements: s,
  reactiveDeps: f,
  reactiveType: c,
  componentId: m,
  defaultState: u,
  dependencies: t,
  serverState: o
} = {}) {
  const [y, M] = ee({}), { sessionId: V } = me();
  let T = !a;
  const [v] = ee(a ?? te()), _ = G(m ?? te()), k = G(
    null
  );
  k.current = C(v) ?? null;
  const L = Me(
    (P) => {
      const n = P ? { ...C(v), ...P } : C(v), i = n?.defaultState || u || e;
      if (n?.serverState?.status === "success" && n?.serverState?.data !== void 0)
        return {
          value: n.serverState.data,
          source: "server",
          timestamp: n.serverState.timestamp || Date.now()
        };
      if (n?.localStorage?.key && V) {
        const d = U(n.localStorage.key) ? n.localStorage.key(i) : n.localStorage.key, h = oe(
          `${V}-${v}-${d}`
        );
        if (h && h.lastUpdated > (n?.serverState?.timestamp || 0))
          return {
            value: h.state,
            source: "localStorage",
            timestamp: h.lastUpdated
          };
      }
      return {
        value: i || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [v, u, e, V]
  );
  q(() => {
    o && o.status === "success" && o.data !== void 0 && ge(v, o);
  }, [o, v]), q(() => w.getState().subscribeToPath(v, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const n = r.serverState;
      if (n?.status !== "success" || n.data === void 0)
        return;
      ie(v, { serverState: n });
      const i = typeof n.merge == "object" ? n.merge : n.merge === !0 ? { strategy: "append", key: "id" } : null, S = I(v, []), d = n.data;
      if (i && i.strategy === "append" && "key" in i && Array.isArray(S) && Array.isArray(d)) {
        const h = i.key;
        if (!h) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const p = new Set(
          S.map((b) => b[h])
        ), A = d.filter(
          (b) => !p.has(b[h])
        );
        A.length > 0 && ve(v, [], A);
        const $ = I(v, []);
        re(
          v,
          [],
          $,
          n.timestamp || Date.now()
        );
      } else
        Z(v, d), re(
          v,
          [],
          d,
          n.timestamp || Date.now()
        );
      N(v);
    }
  }), [v]), q(() => {
    const P = w.getState().getShadowMetadata(v, []);
    if (P && P.stateSource)
      return;
    const r = C(v), n = {
      localStorageEnabled: !!r?.localStorage?.key
    };
    if (B(v, [], {
      ...P,
      features: n
    }), r?.defaultState !== void 0 || u !== void 0) {
      const h = r?.defaultState || u;
      r?.defaultState || ie(v, {
        defaultState: h
      });
    }
    const { value: i, source: S, timestamp: d } = L();
    Z(v, i), B(v, [], {
      stateSource: S,
      lastServerSync: S === "server" ? d : void 0,
      isDirty: S === "server" ? !1 : void 0,
      baseServerState: S === "server" ? i : void 0
    }), S === "server" && o && ge(v, o), N(v);
  }, [v, ...t || []]), $e(() => {
    T && ie(v, {
      formElements: s,
      defaultState: u,
      localStorage: l,
      middleware: k.current?.middleware
    });
    const P = `${v}////${_.current}`, r = E(v, []), n = r?.components || /* @__PURE__ */ new Map();
    return n.set(P, {
      forceUpdate: () => M({}),
      reactiveType: c ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: f || void 0,
      deps: f ? f(I(v, [])) : [],
      prevDeps: f ? f(I(v, [])) : []
    }), B(v, [], {
      ...r,
      components: n
    }), M({}), () => {
      const i = E(v, []), S = i?.components?.get(P);
      S?.paths && S.paths.forEach((d) => {
        const p = d.split(".").slice(1), A = w.getState().getShadowMetadata(v, p);
        A?.pathComponents && A.pathComponents.size === 0 && (delete A.pathComponents, w.getState().setShadowMetadata(v, p, A));
      }), i?.components && B(v, [], i);
    };
  }, []);
  const g = nt(
    v,
    V,
    k
  );
  return w.getState().initialStateGlobal[v] || he(v, e), ye(() => pe(
    v,
    g,
    _.current,
    V
  ), [v, V]);
}
const ot = (e, a, l) => {
  let s = E(e, a)?.arrayKeys || [];
  const f = l?.transforms;
  if (!f || f.length === 0)
    return s;
  for (const c of f)
    if (c.type === "filter") {
      const m = [];
      s.forEach((u, t) => {
        const o = I(e, [...a, u]);
        c.fn(o, t) && m.push(u);
      }), s = m;
    } else c.type === "sort" && s.sort((m, u) => {
      const t = I(e, [...a, m]), o = I(e, [...a, u]);
      return c.fn(t, o);
    });
  return s;
}, K = (e, a, l) => {
  const s = `${e}////${a}`, c = E(e, [])?.components?.get(s);
  !c || c.reactiveType === "none" || !(Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType]).includes("component") || Fe(e, l, s);
}, Q = (e, a, l) => {
  const s = E(e, []), f = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((m, u) => {
    (Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"]).includes("all") && (m.forceUpdate(), f.add(u));
  }), E(e, [
    ...a,
    "getSelected"
  ])?.pathComponents?.forEach((m) => {
    s?.components?.get(m)?.forceUpdate();
  });
  const c = E(e, a);
  for (let m of c?.arrayKeys || []) {
    const u = m + ".selected", t = E(e, u.split(".").slice(1));
    m == l && t?.pathComponents?.forEach((o) => {
      s?.components?.get(o)?.forceUpdate();
    });
  }
};
function R(e, a, l) {
  const s = E(e, a), f = a.length > 0 ? a.join(".") : "root", c = l?.arrayViews?.[f];
  if (Array.isArray(c) && c.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const m = I(e, a, c);
  return {
    shadowMeta: s,
    value: m,
    arrayKeys: s?.arrayKeys
  };
}
function pe(e, a, l, s) {
  const f = /* @__PURE__ */ new Map();
  function c({
    path: t = [],
    meta: o,
    componentId: y
  }) {
    const M = o ? JSON.stringify(o.arrayViews || o.transforms) : "", V = t.join(".") + ":" + y + ":" + M;
    if (f.has(V))
      return f.get(V);
    const T = [e, ...t].join("."), v = () => {
    }, _ = {
      apply(L, g, J) {
        if (J.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", n = o?.arrayViews?.[r];
          return K(e, y, t), I(e, t, n);
        }
        const P = J[0];
        return a(P, t, { updateType: "update" }), !0;
      },
      get(L, g, J) {
        if (g === "call" || g === "apply" || g === "bind")
          return Reflect.get(L, g, J);
        if (typeof g != "string")
          return Reflect.get(L, g);
        if (t.length === 0 && g in m)
          return m[g];
        if (typeof g == "string" && !g.startsWith("$")) {
          const r = [...t, g];
          return c({
            path: r,
            componentId: y,
            meta: o
          });
        }
        if (g === "$_rebuildStateShape")
          return c;
        if (g === "$sync" && t.length === 0)
          return async function() {
            const r = w.getState().getInitialOptions(e), n = r?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const i = w.getState().getShadowValue(e, []), S = r?.validation?.key;
            try {
              const d = await n.action(i);
              if (d && !d.success && d.errors, d?.success) {
                const h = w.getState().getShadowMetadata(e, []);
                B(e, [], {
                  ...h,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: i
                  // Update base server state
                }), n.onSuccess && n.onSuccess(d.data);
              } else !d?.success && n.onError && n.onError(d.error);
              return d;
            } catch (d) {
              return n.onError && n.onError(d), { success: !1, error: d };
            }
          };
        if (g === "$_status" || g === "$getStatus") {
          const r = () => {
            const { shadowMeta: n, value: i } = R(e, t, o);
            return n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || i !== void 0 ? "fresh" : "unknown";
          };
          return g === "$_status" ? r() : r;
        }
        if (g === "$removeStorage")
          return () => {
            const r = w.getState().initialStateGlobal[e], n = C(e), i = U(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, S = `${s}-${e}-${i}`;
            S && localStorage.removeItem(S);
          };
        if (g === "$validate")
          return () => {
            const r = w.getState(), { value: n } = R(e, t, o), i = r.getInitialOptions(e), S = i?.validation?.zodSchemaV4 || i?.validation?.zodSchemaV3;
            if (!S)
              return { success: !0, data: n };
            const d = S.safeParse(n);
            if (d.success) {
              const h = r.getShadowMetadata(e, t) || {};
              r.setShadowMetadata(e, t, {
                ...h,
                validation: {
                  status: "VALID",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            } else
              (d.error?.issues || d.error?.errors || []).forEach((p) => {
                const A = [...t, ...p.path.map(String)], $ = r.getShadowMetadata(e, A) || {};
                r.setShadowMetadata(e, A, {
                  ...$,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: "client",
                        message: p.message,
                        severity: "error",
                        code: p.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: r.getShadowValue(e, A)
                  }
                });
              });
            return N(e), d;
          };
        if (g === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = R(e, t, o);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (g === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            K(e, y, [
              ...t,
              "getSelected"
            ]);
            const n = w.getState().selectedIndicesMap.get(r);
            if (!n)
              return;
            const i = t.join("."), S = o?.arrayViews?.[i], d = n.split(".").pop();
            if (!(S && !S.includes(d) || I(
              e,
              n.split(".").slice(1)
            ) === void 0))
              return c({
                path: n.split(".").slice(1),
                componentId: y,
                meta: o
              });
          };
        if (g === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const n = w.getState().selectedIndicesMap.get(r);
            if (!n)
              return -1;
            const { keys: i } = D(e, t, o);
            if (!i)
              return -1;
            const S = n.split(".").pop();
            return i.indexOf(S);
          };
        if (g === "$clearSelected")
          return Q(e, t), () => {
            Le({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (g === "$map")
          return (r) => {
            const { value: n, keys: i } = D(
              e,
              t,
              o
            );
            if (K(e, y, t), !i || !Array.isArray(n))
              return [];
            const S = c({
              path: t,
              componentId: y,
              meta: o
            });
            return n.map((d, h) => {
              const p = i[h];
              if (!p) return;
              const A = [...t, p], $ = c({
                path: A,
                // This now correctly points to the item in the shadow store.
                componentId: y,
                meta: o
              });
              return r($, h, S);
            });
          };
        if (g === "$filter")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { keys: i, value: S } = D(
              e,
              t,
              o
            );
            if (!Array.isArray(S))
              throw new Error("filter can only be used on arrays");
            const d = [];
            return S.forEach((h, p) => {
              if (r(h, p)) {
                const A = i[p];
                A && d.push(A);
              }
            }), c({
              path: t,
              componentId: y,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [n]: d
                },
                transforms: [
                  ...o?.transforms || [],
                  { type: "filter", fn: r, path: t }
                ]
              }
            });
          };
        if (g === "$sort")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { value: i, keys: S } = D(
              e,
              t,
              o
            );
            if (!Array.isArray(i) || !S)
              throw new Error("No array keys found for sorting");
            const d = i.map((p, A) => ({
              item: p,
              key: S[A]
            }));
            d.sort((p, A) => r(p.item, A.item));
            const h = d.map((p) => p.key);
            return c({
              path: t,
              componentId: y,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [n]: h
                },
                transforms: [
                  ...o?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (g === "$list")
          return (r) => /* @__PURE__ */ H(() => {
            const i = G(/* @__PURE__ */ new Map()), [S, d] = ee({}), h = t.length > 0 ? t.join(".") : "root", p = ot(e, t, o), A = ye(() => ({
              ...o,
              arrayViews: {
                ...o?.arrayViews || {},
                [h]: p
              }
            }), [o, h, p]), { value: $ } = D(
              e,
              t,
              A
            );
            if (q(() => {
              const F = w.getState().subscribeToPath(T, (j) => {
                if (j.type === "GET_SELECTED")
                  return;
                const z = w.getState().getShadowMetadata(e, t)?.transformCaches;
                if (z)
                  for (const X of z.keys())
                    X.startsWith(y) && z.delete(X);
                (j.type === "INSERT" || j.type === "INSERT_MANY" || j.type === "REMOVE" || j.type === "CLEAR_SELECTION" || j.type === "SERVER_STATE_UPDATE" && !o?.serverStateIsUpStream) && d({});
              });
              return () => {
                F();
              };
            }, [y, T]), !Array.isArray($))
              return null;
            const b = c({
              path: t,
              componentId: y,
              meta: A
              // Use updated meta here
            }), O = $.map((F, j) => {
              const x = p[j];
              if (!x)
                return null;
              let z = i.current.get(x);
              z || (z = te(), i.current.set(x, z));
              const X = [...t, x];
              return ue(De, {
                key: x,
                stateKey: e,
                itemComponentId: z,
                itemPath: X,
                localIndex: j,
                arraySetter: b,
                rebuildStateShape: c,
                renderFn: r
              });
            });
            return /* @__PURE__ */ H(Ae, { children: O });
          }, {});
        if (g === "$stateFlattenOn")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = o?.arrayViews?.[n], S = w.getState().getShadowValue(e, t, i);
            return Array.isArray(S) ? c({
              path: [...t, "[*]", r],
              componentId: y,
              meta: o
            }) : [];
          };
        if (g === "$index")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = o?.arrayViews?.[n];
            if (i) {
              const h = i[r];
              return h ? c({
                path: [...t, h],
                componentId: y,
                meta: o
              }) : void 0;
            }
            const S = E(e, t);
            if (!S?.arrayKeys) return;
            const d = S.arrayKeys[r];
            if (d)
              return c({
                path: [...t, d],
                componentId: y,
                meta: o
              });
          };
        if (g === "$last")
          return () => {
            const { keys: r } = D(e, t, o);
            if (!r || r.length === 0)
              return;
            const n = r[r.length - 1];
            if (!n)
              return;
            const i = [...t, n];
            return c({
              path: i,
              componentId: y,
              meta: o
            });
          };
        if (g === "$insert")
          return (r, n) => {
            a(r, t, {
              updateType: "insert",
              index: n
            });
          };
        if (g === "$insertMany")
          return (r) => {
            a(r, t, {
              updateType: "insert_many"
            });
          };
        if (g === "$uniqueInsert")
          return (r, n, i) => {
            const { value: S } = R(
              e,
              t,
              o
            ), d = U(r) ? r(S) : r;
            let h = null;
            if (!S.some((A) => {
              const $ = n ? n.every(
                (b) => Y(A[b], d[b])
              ) : Y(A, d);
              return $ && (h = A), $;
            }))
              a(d, t, { updateType: "insert" });
            else if (i && h) {
              const A = i(h), $ = S.map(
                (b) => Y(b, h) ? A : b
              );
              a($, t, {
                updateType: "update"
              });
            }
          };
        if (g === "$cut")
          return (r, n) => {
            const i = E(e, t);
            if (!i?.arrayKeys || i.arrayKeys.length === 0)
              return;
            const S = r === -1 ? i.arrayKeys.length - 1 : r !== void 0 ? r : i.arrayKeys.length - 1, d = i.arrayKeys[S];
            d && a(null, [...t, d], {
              updateType: "cut"
            });
          };
        if (g === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: n } = D(e, t, o);
            if (!n || n.length === 0)
              return;
            const i = w.getState().selectedIndicesMap.get(r);
            if (!i)
              return;
            const S = i.split(".").pop();
            if (!n.includes(S))
              return;
            const d = i.split(".").slice(1);
            w.getState().clearSelectedIndex({ arrayKey: r });
            const h = d.slice(0, -1);
            Q(e, h), a(null, d, {
              updateType: "cut"
            });
          };
        if (g === "$cutByValue")
          return (r) => {
            const {
              isArray: n,
              value: i,
              keys: S
            } = D(e, t, o);
            if (!n) return;
            const d = se(i, S, (h) => h === r);
            d && a(null, [...t, d.key], {
              updateType: "cut"
            });
          };
        if (g === "$toggleByValue")
          return (r) => {
            const {
              isArray: n,
              value: i,
              keys: S
            } = D(e, t, o);
            if (!n) return;
            const d = se(i, S, (h) => h === r);
            if (d) {
              const h = [...t, d.key];
              a(null, h, {
                updateType: "cut"
              });
            } else
              a(r, t, { updateType: "insert" });
          };
        if (g === "$findWith")
          return (r, n) => {
            const { isArray: i, value: S, keys: d } = D(e, t, o);
            if (!i)
              throw new Error("findWith can only be used on arrays");
            const h = se(
              S,
              d,
              (p) => p?.[r] === n
            );
            return h ? c({
              path: [...t, h.key],
              componentId: y,
              meta: o
            }) : null;
          };
        if (g === "$cutThis") {
          const { value: r } = R(e, t, o), n = t.slice(0, -1);
          return Q(e, n), () => {
            a(r, t, { updateType: "cut" });
          };
        }
        if (g === "$get")
          return () => {
            K(e, y, t);
            const { value: r } = R(e, t, o);
            return r;
          };
        if (g === "$$derive")
          return (r) => Se({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: o
          });
        if (g === "$$get")
          return () => Se({ _stateKey: e, _path: t, _meta: o });
        if (g === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return We(r);
        }
        if (g == "getLocalStorage")
          return (r) => oe(s + "-" + e + "-" + r);
        if (g === "$isSelected") {
          const r = t.slice(0, -1);
          if (E(e, r)?.arrayKeys) {
            const i = e + "." + r.join("."), S = w.getState().selectedIndicesMap.get(i), d = e + "." + t.join(".");
            return S === d;
          }
          return;
        }
        if (g === "$setSelected")
          return (r) => {
            const n = t.slice(0, -1), i = e + "." + n.join("."), S = e + "." + t.join(".");
            Q(e, n, void 0), w.getState().selectedIndicesMap.get(i), r && w.getState().setSelectedIndex(i, S);
          };
        if (g === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), n = e + "." + r.join("."), i = e + "." + t.join(".");
            w.getState().selectedIndicesMap.get(n) === i ? w.getState().clearSelectedIndex({ arrayKey: n }) : w.getState().setSelectedIndex(n, i), Q(e, r);
          };
        if (g === "$clearValidation")
          return (r) => {
            const n = r ? [...t, ...r] : t, i = w.getState(), S = i.getShadowNode(e, n);
            if (console.log("startNode ", S), !S) return;
            const d = [[S, n]];
            for (console.log("stack ", d); d.length > 0; ) {
              const [h, p] = d.pop();
              if (console.log("while (stack.length ", h, p), !h || typeof h != "object") continue;
              if (h._meta?.validation) {
                h._meta.validation = {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now(),
                  validatedValue: void 0
                };
                const $ = [e, ...p].join(".");
                i.notifyPathSubscribers($, {
                  type: "VALIDATION_CLEAR"
                });
              }
              const A = Object.keys(h);
              for (const $ of A)
                $ !== "_meta" && d.push([h[$], [...p, $]]);
            }
            N(e);
          };
        if (t.length == 0) {
          if (g === "$_componentId")
            return y;
          if (g === "$setOptions")
            return (r) => {
              ce({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (g === "$_applyUpdate")
            return (r, n, i = "update") => {
              a(r, n, { updateType: i });
            };
          if (g === "$_getEffectiveSetState")
            return a;
          if (g === "$getPluginMetaData")
            return (r) => Be(e, t)?.get(r);
          if (g === "$addPluginMetaData")
            return (r, n) => Ge(e, t, r, n);
          if (g === "$removePluginMetaData")
            return (r) => qe(e, t, r);
          if (g === "$addZodValidation")
            return (r, n) => {
              r.forEach((i) => {
                const S = w.getState().getShadowMetadata(e, i.path) || {};
                w.getState().setShadowMetadata(e, i.path, {
                  ...S,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: n || "client",
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
          if (g === "$applyOperation")
            return (r, n) => {
              let i;
              if (r.insertAfterId && r.updateType === "insert") {
                const S = E(e, r.path);
                if (S?.arrayKeys) {
                  const d = S.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  d !== -1 && (i = d + 1);
                }
              }
              a(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                index: i,
                // Pass the calculated index
                metaData: n
              });
            };
          if (g === "$applyJsonPatch")
            return (r) => {
              const n = w.getState(), i = n.getShadowMetadata(e, []);
              if (!i?.components) return;
              const S = (h) => !h || h === "/" ? [] : h.split("/").slice(1).map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const h of r) {
                const p = S(h.path);
                switch (h.op) {
                  case "add":
                  case "replace": {
                    const { value: A } = h;
                    n.updateShadowAtPath(e, p, A), n.markAsDirty(e, p, { bubble: !0 });
                    let $ = [...p];
                    for (; ; ) {
                      const b = n.getShadowMetadata(
                        e,
                        $
                      );
                      if (b?.pathComponents && b.pathComponents.forEach((O) => {
                        if (!d.has(O)) {
                          const F = i.components?.get(O);
                          F && (F.forceUpdate(), d.add(O));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const A = p.slice(0, -1);
                    n.removeShadowArrayElement(e, p), n.markAsDirty(e, A, { bubble: !0 });
                    let $ = [...A];
                    for (; ; ) {
                      const b = n.getShadowMetadata(
                        e,
                        $
                      );
                      if (b?.pathComponents && b.pathComponents.forEach((O) => {
                        if (!d.has(O)) {
                          const F = i.components?.get(O);
                          F && (F.forceUpdate(), d.add(O));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (g === "$getComponents")
            return () => E(e, [])?.components;
        }
        if (g === "$validationWrapper")
          return ({
            children: r,
            hideMessage: n
          }) => /* @__PURE__ */ H(
            Pe,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: r
            }
          );
        if (g === "$_stateKey") return e;
        if (g === "$_path") return t;
        if (g === "$update")
          return (r) => (a(r, t, { updateType: "update" }), {
            synced: () => {
              const n = w.getState().getShadowMetadata(e, t);
              B(e, t, {
                ...n,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const i = [e, ...t].join(".");
              we(i, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (g === "$toggle") {
          const { value: r } = R(
            e,
            t,
            o
          );
          if (typeof r != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            a(!r, t, {
              updateType: "update"
            });
          };
        }
        if (g === "$isolate")
          return (r, n) => {
            const i = Array.isArray(r), S = i ? r : void 0, d = i ? n : r;
            if (!d || typeof d != "function")
              throw new Error(
                "CogsState: $isolate requires a render function."
              );
            return /* @__PURE__ */ H(
              Ie,
              {
                stateKey: e,
                path: t,
                dependencies: S,
                rebuildStateShape: c,
                renderFn: d
              }
            );
          };
        if (g === "$formElement")
          return (r, n) => /* @__PURE__ */ H(
            ke,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              setState: a,
              formOpts: n,
              renderFn: r
            }
          );
        const P = [...t, g];
        return c({
          path: P,
          componentId: y,
          meta: o
        });
      }
    }, k = new Proxy(v, _);
    return f.set(V, k), k;
  }
  const m = {
    $revertToInitialState: (t) => {
      const o = w.getState().getShadowMetadata(e, []);
      let y;
      o?.stateSource === "server" && o.baseServerState ? y = o.baseServerState : y = w.getState().initialStateGlobal[e], ze(e), Z(e, y), c({
        path: [],
        componentId: l
      });
      const M = C(e), V = U(M?.localStorage?.key) ? M?.localStorage?.key(y) : M?.localStorage?.key, T = `${s}-${e}-${V}`;
      return T && localStorage.removeItem(T), N(e), y;
    },
    $initializeAndMergeShadowState: (t) => {
      Oe(e, t), N(e);
    },
    $updateInitialState: (t) => {
      const o = pe(
        e,
        a,
        l,
        s
      ), y = w.getState().initialStateGlobal[e], M = C(e), V = U(M?.localStorage?.key) ? M?.localStorage?.key(y) : M?.localStorage?.key, T = `${s}-${e}-${V}`;
      return localStorage.getItem(T) && localStorage.removeItem(T), Ee(() => {
        he(e, t), Z(e, t);
        const v = w.getState().getShadowMetadata(e, []);
        v && v?.components?.forEach((_) => {
          _.forceUpdate();
        });
      }), {
        fetchId: (v) => o.$get()[v]
      };
    }
  };
  return c({
    componentId: l,
    path: []
  });
}
function Se(e) {
  return ue(st, { proxy: e });
}
function st({
  proxy: e
}) {
  const a = G(null), l = G(null), s = G(!1), f = `${e._stateKey}-${e._path.join(".")}`, c = e._path.length > 0 ? e._path.join(".") : "root", m = e._meta?.arrayViews?.[c], u = I(e._stateKey, e._path, m);
  return q(() => {
    const t = a.current;
    if (!t || s.current) return;
    const o = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", f);
        return;
      }
      const y = t.parentElement, V = Array.from(y.childNodes).indexOf(t);
      let T = y.getAttribute("data-parent-id");
      T || (T = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", T)), l.current = `instance-${crypto.randomUUID()}`;
      const v = w.getState().getShadowMetadata(e._stateKey, e._path) || {}, _ = v.signals || [];
      _.push({
        instanceId: l.current,
        parentId: T,
        position: V,
        effect: e._effect
      }), w.getState().setShadowMetadata(e._stateKey, e._path, {
        ...v,
        signals: _
      });
      let k = u;
      if (e._effect)
        try {
          k = new Function(
            "state",
            `return (${e._effect})(state)`
          )(u);
        } catch (g) {
          console.error("Error evaluating effect function:", g);
        }
      k !== null && typeof k == "object" && (k = JSON.stringify(k));
      const L = document.createTextNode(String(k ?? ""));
      t.replaceWith(L), s.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(o), l.current) {
        const y = w.getState().getShadowMetadata(e._stateKey, e._path) || {};
        y.signals && (y.signals = y.signals.filter(
          (M) => M.instanceId !== l.current
        ), w.getState().setShadowMetadata(e._stateKey, e._path, y));
      }
    };
  }, []), ue("span", {
    ref: a,
    style: { display: "contents" },
    "data-signal-id": f
  });
}
export {
  Se as $cogsSignal,
  ht as addStateOptions,
  vt as createCogsState,
  at as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
