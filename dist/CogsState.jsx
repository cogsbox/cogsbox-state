"use client";
import { jsx as H, Fragment as pe } from "react/jsx-runtime";
import { pluginStore as W } from "./pluginStore.js";
import { useState as ee, useRef as G, useCallback as Ae, useEffect as q, useLayoutEffect as Me, useMemo as ye, createElement as ue, startTransition as $e } from "react";
import { transformStateFunc as Ve, isFunction as U, isDeepEqual as Y, isArray as Ee, getDifferences as be } from "./utility.js";
import { ValidationWrapper as Te, IsolatedComponentWrapper as Pe, FormElementWrapper as Ie, MemoizedCogsItemWrapper as ke } from "./Components.jsx";
import De from "superjson";
import { v4 as te } from "uuid";
import { getGlobalStore as w, updateShadowTypeInfo as fe } from "./store.js";
import { useCogsConfig as me } from "./CogsStateClient.jsx";
import { runValidation as Ce } from "./validation.js";
const {
  getInitialOptions: C,
  updateInitialStateGlobal: he,
  getShadowMetadata: V,
  setShadowMetadata: B,
  getShadowValue: I,
  initializeShadowState: Z,
  initializeAndMergeShadowState: _e,
  updateShadowAtPath: Oe,
  insertShadowArrayElement: je,
  insertManyShadowArrayElements: ve,
  removeShadowArrayElement: Ne,
  setInitialStateOptions: de,
  setServerStateUpdate: ge,
  markAsDirty: ae,
  addPathComponent: Ue,
  clearSelectedIndexesForState: Fe,
  addStateLog: ze,
  clearSelectedIndex: Re,
  getSyncInfo: Le,
  notifyPathSubscribers: We,
  getPluginMetaDataMap: Be,
  setPluginMetaData: Ge,
  removePluginMetaData: qe
} = w.getState(), { notifyUpdate: xe } = W.getState();
function D(e, a, l) {
  const s = V(e, a);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: w.getState().getShadowValue(e, a), keys: [] };
  const c = a.length > 0 ? a.join(".") : "root", m = l?.arrayViews?.[c] ?? s.arrayKeys;
  return Array.isArray(m) && m.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: w.getState().getShadowValue(e, a, m), keys: m ?? [] };
}
function se(e, a, l) {
  for (let s = 0; s < e.length; s++)
    if (l(e[s], s)) {
      const g = a[s];
      if (g)
        return { key: g, index: s, value: e[s] };
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
  const s = C(e) || {}, g = l[e] || {};
  let c = { ...g, ...s }, m = !1;
  if (a) {
    const u = (t, o) => {
      for (const y in o)
        o.hasOwnProperty(y) && (o[y] instanceof Object && !Array.isArray(o[y]) && t[y] instanceof Object ? Y(t[y], o[y]) || (u(t[y], o[y]), m = !0) : t[y] !== o[y] && (t[y] = o[y], m = !0));
      return t;
    };
    c = u(c, a);
  }
  if (c.validation && (a?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || g?.validation?.hasOwnProperty("onBlur") || (c.validation.onBlur = "error", m = !0)), m) {
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
    ), F(e));
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
  const g = (u, t) => {
    const [o] = ee(t?.componentId ?? te()), y = ce({
      stateKey: u,
      options: t,
      initialOptionsPart: s
    }), M = G(y);
    M.current = y;
    const E = I(u, []) || l[u], b = at(
      E,
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
    }, [u, t]), q(() => (W.getState().stateHandlers.set(u, b), () => {
      W.getState().stateHandlers.delete(u);
    }), [u, b]), b;
  };
  function c(u, t) {
    if (ce({ stateKey: u, options: t, initialOptionsPart: s }), t.localStorage && He(u, t), t.formElements) {
      const y = W.getState().registeredPlugins.map((M) => t.formElements.hasOwnProperty(M.name) ? {
        ...M,
        formWrapper: t.formElements[M.name]
      } : M);
      W.getState().setRegisteredPlugins(y);
    }
    F(u);
  }
  function m(u) {
    Object.keys(l).forEach((o) => {
      c(o, u);
    });
  }
  return {
    useCogsState: g,
    setCogsOptionsByKey: c,
    setCogsOptions: m
  };
}, Je = (e, a, l, s, g) => {
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
    const t = V(a, []), o = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: u,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, y = De.serialize(o);
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
  const l = I(e, []), { sessionId: s } = me(), g = U(a?.localStorage?.key) ? a.localStorage.key(l) : a?.localStorage?.key;
  if (g && s) {
    const c = oe(
      `${s}-${e}-${g}`
    );
    if (c && c.lastUpdated > (c.lastSyncedWithServer || 0))
      return F(e), !0;
  }
  return !1;
}, F = (e) => {
  const a = V(e, []);
  if (!a) return;
  const l = /* @__PURE__ */ new Set();
  a?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || l.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    l.forEach((s) => s());
  });
};
function re(e, a, l, s) {
  const g = V(e, a);
  if (B(e, a, {
    ...g,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(l)) {
    const c = V(e, a);
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
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: s, effect: g }) => {
    const c = document.querySelector(`[data-parent-id="${l}"]`);
    if (!c) return;
    const m = Array.from(c.childNodes);
    if (!m[s]) return;
    let u = a;
    if (g && a !== null)
      try {
        u = new Function("state", `return (${g})(state)`)(
          a
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    u !== null && typeof u == "object" && (u = JSON.stringify(u)), m[s].textContent = String(u ?? "");
  });
}
function Ze(e, a, l) {
  const s = V(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const g = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let c = [...a];
    for (; ; ) {
      const m = V(e, c);
      if (m?.pathComponents && m.pathComponents.forEach((u) => {
        const t = s.components?.get(u);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || g.add(t));
      }), c.length === 0) break;
      c.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Ee(l.newValue) && be(l.newValue, l.oldValue).forEach((u) => {
      const t = u.split("."), o = [...a, ...t], y = V(e, o);
      y?.pathComponents && y.pathComponents.forEach((M) => {
        const E = s.components?.get(M);
        E && ((Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"]).includes("none") || g.add(E));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    let m = [...l.type === "insert" ? a : a.slice(0, -1)];
    for (; ; ) {
      const u = V(e, m);
      if (u?.pathComponents && u.pathComponents.forEach((t) => {
        const o = s.components?.get(t);
        o && g.add(o);
      }), m.length === 0) break;
      m.pop();
    }
  }
  return g;
}
function Xe(e, a, l) {
  const s = w.getState().getShadowValue(e, a), g = U(l) ? l(s) : l;
  if (Y(s, g))
    return null;
  Oe(e, a, g), ae(e, a, { bubble: !0 });
  const c = V(e, a);
  return {
    type: "update",
    oldValue: s,
    newValue: g,
    shadowMeta: c
  };
}
function Ke(e, a, l) {
  ve(e, a, l), ae(e, a, { bubble: !0 });
  const s = V(e, a);
  return {
    type: "insert_many",
    count: l.length,
    shadowMeta: s,
    path: a
  };
}
function et(e, a, l, s, g) {
  let c;
  if (U(l)) {
    const { value: o } = N(e, a);
    c = l({ state: o });
  } else
    c = l;
  const m = je(
    e,
    a,
    c,
    s,
    g
  );
  ae(e, a, { bubble: !0 });
  const u = V(e, a);
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
  return Ne(e, a), ae(e, l, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: l };
}
function rt() {
  const e = /* @__PURE__ */ new Set(), a = [], l = [];
  for (const s of ne) {
    if (s.status && s.updateType) {
      l.push(s);
      continue;
    }
    const g = s, c = g.type === "cut" ? null : g.newValue;
    g.shadowMeta?.signals?.length > 0 && a.push({ shadowMeta: g.shadowMeta, displayValue: c }), Ze(
      g.stateKey,
      g.path,
      g
    ).forEach((u) => {
      e.add(u);
    });
  }
  l.length > 0 && ze(l), a.forEach(({ shadowMeta: s, displayValue: g }) => {
    Ye(s, g);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), ne = [], le = !1;
}
function nt(e, a, l) {
  return (g, c, m) => {
    s(e, c, g, m);
  };
  function s(g, c, m, u) {
    let t;
    switch (u.updateType) {
      case "update":
        t = Xe(g, c, m);
        break;
      case "insert":
        t = et(
          g,
          c,
          m,
          u.index,
          u.itemId
        );
        break;
      case "insert_many":
        t = Ke(g, c, m);
        break;
      case "cut":
        t = tt(g, c);
        break;
    }
    if (t === null)
      return;
    t.stateKey = g, t.path = c, ne.push(t), Qe();
    const o = {
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
    ne.push(o), t.newValue !== void 0 && Je(
      t.newValue,
      g,
      l.current,
      a
    ), l.current?.middleware && l.current.middleware({ update: o }), Ce(o, u.validationTrigger || "programmatic"), xe(o);
  }
}
function at(e, {
  stateKey: a,
  localStorage: l,
  formElements: s,
  reactiveDeps: g,
  reactiveType: c,
  componentId: m,
  defaultState: u,
  dependencies: t,
  serverState: o
} = {}) {
  const [y, M] = ee({}), { sessionId: E } = me();
  let b = !a;
  const [v] = ee(a ?? te()), _ = G(m ?? te()), k = G(
    null
  );
  k.current = C(v) ?? null;
  const L = Ae(
    (P) => {
      const n = P ? { ...C(v), ...P } : C(v), i = n?.defaultState || u || e;
      if (n?.serverState?.status === "success" && n?.serverState?.data !== void 0)
        return {
          value: n.serverState.data,
          source: "server",
          timestamp: n.serverState.timestamp || Date.now()
        };
      if (n?.localStorage?.key && E) {
        const d = U(n.localStorage.key) ? n.localStorage.key(i) : n.localStorage.key, h = oe(
          `${E}-${v}-${d}`
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
    [v, u, e, E]
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
          S.map((T) => T[h])
        ), A = d.filter(
          (T) => !p.has(T[h])
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
      F(v);
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
    }), S === "server" && o && ge(v, o), F(v);
  }, [v, ...t || []]), Me(() => {
    b && ie(v, {
      formElements: s,
      defaultState: u,
      localStorage: l,
      middleware: k.current?.middleware
    });
    const P = `${v}////${_.current}`, r = V(v, []), n = r?.components || /* @__PURE__ */ new Map();
    return n.set(P, {
      forceUpdate: () => M({}),
      reactiveType: c ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: g || void 0,
      deps: g ? g(I(v, [])) : [],
      prevDeps: g ? g(I(v, [])) : []
    }), B(v, [], {
      ...r,
      components: n
    }), M({}), () => {
      const i = V(v, []), S = i?.components?.get(P);
      S?.paths && S.paths.forEach((d) => {
        const p = d.split(".").slice(1), A = w.getState().getShadowMetadata(v, p);
        A?.pathComponents && A.pathComponents.size === 0 && (delete A.pathComponents, w.getState().setShadowMetadata(v, p, A));
      }), i?.components && B(v, [], i);
    };
  }, []);
  const f = nt(
    v,
    E,
    k
  );
  return w.getState().initialStateGlobal[v] || he(v, e), ye(() => we(
    v,
    f,
    _.current,
    E
  ), [v, E]);
}
const ot = (e, a, l) => {
  let s = V(e, a)?.arrayKeys || [];
  const g = l?.transforms;
  if (!g || g.length === 0)
    return s;
  for (const c of g)
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
  const s = `${e}////${a}`, c = V(e, [])?.components?.get(s);
  !c || c.reactiveType === "none" || !(Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType]).includes("component") || Ue(e, l, s);
}, Q = (e, a, l) => {
  const s = V(e, []), g = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((m, u) => {
    (Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"]).includes("all") && (m.forceUpdate(), g.add(u));
  }), V(e, [
    ...a,
    "getSelected"
  ])?.pathComponents?.forEach((m) => {
    s?.components?.get(m)?.forceUpdate();
  });
  const c = V(e, a);
  for (let m of c?.arrayKeys || []) {
    const u = m + ".selected", t = V(e, u.split(".").slice(1));
    m == l && t?.pathComponents?.forEach((o) => {
      s?.components?.get(o)?.forceUpdate();
    });
  }
};
function N(e, a, l) {
  const s = V(e, a), g = a.length > 0 ? a.join(".") : "root", c = l?.arrayViews?.[g];
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
function we(e, a, l, s) {
  const g = /* @__PURE__ */ new Map();
  function c({
    path: t = [],
    meta: o,
    componentId: y
  }) {
    const M = o ? JSON.stringify(o.arrayViews || o.transforms) : "", E = t.join(".") + ":" + y + ":" + M;
    if (g.has(E))
      return g.get(E);
    const b = [e, ...t].join("."), v = () => {
    }, _ = {
      apply(L, f, J) {
        if (J.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", n = o?.arrayViews?.[r];
          return K(e, y, t), I(e, t, n);
        }
        const P = J[0];
        return a(P, t, { updateType: "update" }), !0;
      },
      get(L, f, J) {
        if (f === Symbol.toPrimitive)
          return (r) => r === "number" ? NaN : r === "string" ? `[CogsState: ${t.join(".") || "root"}]` : null;
        if (f === Symbol.toStringTag)
          return "CogsState";
        if (f === Symbol.iterator) {
          const { value: r } = N(e, t, o);
          return Array.isArray(r) ? function* () {
            for (let n = 0; n < r.length; n++)
              yield r[n];
          } : void 0;
        }
        if (f === "call" || f === "apply" || f === "bind")
          return Reflect.get(L, f, J);
        if (typeof f != "string")
          return Reflect.get(L, f);
        if (t.length === 0 && f in m)
          return m[f];
        if (typeof f == "string" && !f.startsWith("$")) {
          const r = [...t, f];
          return c({
            path: r,
            componentId: y,
            meta: o
          });
        }
        if (f === "$_rebuildStateShape")
          return c;
        if (f === "$sync" && t.length === 0)
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
        if (f === "$_status" || f === "$getStatus") {
          const r = () => {
            const { shadowMeta: n, value: i } = N(e, t, o);
            return n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || i !== void 0 ? "fresh" : "unknown";
          };
          return f === "$_status" ? r() : r;
        }
        if (f === "$removeStorage")
          return () => {
            const r = w.getState().initialStateGlobal[e], n = C(e), i = U(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, S = `${s}-${e}-${i}`;
            S && localStorage.removeItem(S);
          };
        if (f === "$validate")
          return () => {
            const r = w.getState(), { value: n } = N(e, t, o), i = r.getInitialOptions(e), S = i?.validation?.zodSchemaV4 || i?.validation?.zodSchemaV3;
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
            return F(e), d;
          };
        if (f === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = N(e, t, o);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (f === "$getSelected")
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
        if (f === "$getSelectedIndex")
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
        if (f === "$clearSelected")
          return Q(e, t), () => {
            Re({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (f === "$map")
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
        if (f === "$filter")
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
        if (f === "$sort")
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
        if (f === "$list")
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
              const z = w.getState().subscribeToPath(b, (j) => {
                if (j.type === "GET_SELECTED")
                  return;
                const R = w.getState().getShadowMetadata(e, t)?.transformCaches;
                if (R)
                  for (const X of R.keys())
                    X.startsWith(y) && R.delete(X);
                (j.type === "INSERT" || j.type === "INSERT_MANY" || j.type === "REMOVE" || j.type === "CLEAR_SELECTION" || j.type === "SERVER_STATE_UPDATE" && !o?.serverStateIsUpStream) && d({});
              });
              return () => {
                z();
              };
            }, [y, b]), !Array.isArray($))
              return null;
            const T = c({
              path: t,
              componentId: y,
              meta: A
              // Use updated meta here
            }), O = $.map((z, j) => {
              const x = p[j];
              if (!x)
                return null;
              let R = i.current.get(x);
              R || (R = te(), i.current.set(x, R));
              const X = [...t, x];
              return ue(ke, {
                key: x,
                stateKey: e,
                itemComponentId: R,
                itemPath: X,
                localIndex: j,
                arraySetter: T,
                rebuildStateShape: c,
                renderFn: r
              });
            });
            return /* @__PURE__ */ H(pe, { children: O });
          }, {});
        if (f === "$stateFlattenOn")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = o?.arrayViews?.[n], S = w.getState().getShadowValue(e, t, i);
            return Array.isArray(S) ? c({
              path: [...t, "[*]", r],
              componentId: y,
              meta: o
            }) : [];
          };
        if (f === "$index")
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
            const S = V(e, t);
            if (!S?.arrayKeys) return;
            const d = S.arrayKeys[r];
            if (d)
              return c({
                path: [...t, d],
                componentId: y,
                meta: o
              });
          };
        if (f === "$last")
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
        if (f === "$insert")
          return (r, n) => {
            a(r, t, {
              updateType: "insert",
              index: n
            });
          };
        if (f === "$insertMany")
          return (r) => {
            a(r, t, {
              updateType: "insert_many"
            });
          };
        if (f === "$uniqueInsert")
          return (r, n, i) => {
            const { value: S } = N(
              e,
              t,
              o
            ), d = U(r) ? r(S) : r;
            let h = null;
            if (!S.some((A) => {
              const $ = n ? n.every(
                (T) => Y(A[T], d[T])
              ) : Y(A, d);
              return $ && (h = A), $;
            }))
              a(d, t, { updateType: "insert" });
            else if (i && h) {
              const A = i(h), $ = S.map(
                (T) => Y(T, h) ? A : T
              );
              a($, t, {
                updateType: "update"
              });
            }
          };
        if (f === "$cut")
          return (r, n) => {
            const i = V(e, t);
            if (!i?.arrayKeys || i.arrayKeys.length === 0)
              return;
            const S = r === -1 ? i.arrayKeys.length - 1 : r !== void 0 ? r : i.arrayKeys.length - 1, d = i.arrayKeys[S];
            d && a(null, [...t, d], {
              updateType: "cut"
            });
          };
        if (f === "$cutSelected")
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
        if (f === "$cutByValue")
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
        if (f === "$toggleByValue")
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
        if (f === "$findWith")
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
        if (f === "$cutThis") {
          const { value: r } = N(e, t, o), n = t.slice(0, -1);
          return Q(e, n), () => {
            a(r, t, { updateType: "cut" });
          };
        }
        if (f === "$get")
          return () => {
            K(e, y, t);
            const { value: r } = N(e, t, o);
            return r;
          };
        if (f === "$$derive")
          return (r) => Se({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: o
          });
        if (f === "$$get")
          return () => Se({ _stateKey: e, _path: t, _meta: o });
        if (f === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return Le(r);
        }
        if (f == "getLocalStorage")
          return (r) => oe(s + "-" + e + "-" + r);
        if (f === "$isSelected") {
          const r = t.slice(0, -1);
          if (V(e, r)?.arrayKeys) {
            const i = e + "." + r.join("."), S = w.getState().selectedIndicesMap.get(i), d = e + "." + t.join(".");
            return S === d;
          }
          return;
        }
        if (f === "$setSelected")
          return (r) => {
            const n = t.slice(0, -1), i = e + "." + n.join("."), S = e + "." + t.join(".");
            Q(e, n, void 0), w.getState().selectedIndicesMap.get(i), r && w.getState().setSelectedIndex(i, S);
          };
        if (f === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), n = e + "." + r.join("."), i = e + "." + t.join(".");
            w.getState().selectedIndicesMap.get(n) === i ? w.getState().clearSelectedIndex({ arrayKey: n }) : w.getState().setSelectedIndex(n, i), Q(e, r);
          };
        if (f === "$clearValidation")
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
            F(e);
          };
        if (t.length == 0) {
          if (f === "$_componentId")
            return y;
          if (f === "$setOptions")
            return (r) => {
              ce({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (f === "$_applyUpdate")
            return (r, n, i = "update") => {
              a(r, n, { updateType: i });
            };
          if (f === "$_getEffectiveSetState")
            return a;
          if (f === "$getPluginMetaData")
            return (r) => Be(e, t)?.get(r);
          if (f === "$addPluginMetaData")
            return (r, n) => Ge(e, t, r, n);
          if (f === "$removePluginMetaData")
            return (r) => qe(e, t, r);
          if (f === "$addZodValidation")
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
          if (f === "$applyOperation")
            return (r, n) => {
              let i;
              if (r.insertAfterId && r.updateType === "insert") {
                const S = V(e, r.path);
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
          if (f === "$applyJsonPatch")
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
                      const T = n.getShadowMetadata(
                        e,
                        $
                      );
                      if (T?.pathComponents && T.pathComponents.forEach((O) => {
                        if (!d.has(O)) {
                          const z = i.components?.get(O);
                          z && (z.forceUpdate(), d.add(O));
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
                      const T = n.getShadowMetadata(
                        e,
                        $
                      );
                      if (T?.pathComponents && T.pathComponents.forEach((O) => {
                        if (!d.has(O)) {
                          const z = i.components?.get(O);
                          z && (z.forceUpdate(), d.add(O));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (f === "$getComponents")
            return () => V(e, [])?.components;
        }
        if (f === "$validationWrapper")
          return ({
            children: r,
            hideMessage: n
          }) => /* @__PURE__ */ H(
            Te,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: r
            }
          );
        if (f === "$_stateKey") return e;
        if (f === "$_path") return t;
        if (f === "$update")
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
              We(i, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (f === "$toggle") {
          const { value: r } = N(
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
        if (f === "$isolate")
          return (r, n) => {
            const i = Array.isArray(r), S = i ? r : void 0, d = i ? n : r;
            if (!d || typeof d != "function")
              throw new Error(
                "CogsState: $isolate requires a render function."
              );
            return /* @__PURE__ */ H(
              Pe,
              {
                stateKey: e,
                path: t,
                dependencies: S,
                rebuildStateShape: c,
                renderFn: d
              }
            );
          };
        if (f === "$formElement")
          return (r, n) => /* @__PURE__ */ H(
            Ie,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              setState: a,
              formOpts: n,
              renderFn: r
            }
          );
        const P = [...t, f];
        return c({
          path: P,
          componentId: y,
          meta: o
        });
      }
    }, k = new Proxy(v, _);
    return g.set(E, k), k;
  }
  const m = {
    $revertToInitialState: (t) => {
      const o = w.getState().getShadowMetadata(e, []);
      let y;
      o?.stateSource === "server" && o.baseServerState ? y = o.baseServerState : y = w.getState().initialStateGlobal[e], Fe(e), Z(e, y), c({
        path: [],
        componentId: l
      });
      const M = C(e), E = U(M?.localStorage?.key) ? M?.localStorage?.key(y) : M?.localStorage?.key, b = `${s}-${e}-${E}`;
      return b && localStorage.removeItem(b), F(e), y;
    },
    $initializeAndMergeShadowState: (t) => {
      _e(e, t), F(e);
    },
    $updateInitialState: (t) => {
      const o = we(
        e,
        a,
        l,
        s
      ), y = w.getState().initialStateGlobal[e], M = C(e), E = U(M?.localStorage?.key) ? M?.localStorage?.key(y) : M?.localStorage?.key, b = `${s}-${e}-${E}`;
      return localStorage.getItem(b) && localStorage.removeItem(b), $e(() => {
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
  const a = G(null), l = G(null), s = G(!1), g = `${e._stateKey}-${e._path.join(".")}`, c = e._path.length > 0 ? e._path.join(".") : "root", m = e._meta?.arrayViews?.[c], u = I(e._stateKey, e._path, m);
  return q(() => {
    const t = a.current;
    if (!t || s.current) return;
    const o = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", g);
        return;
      }
      const y = t.parentElement, E = Array.from(y.childNodes).indexOf(t);
      let b = y.getAttribute("data-parent-id");
      b || (b = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", b)), l.current = `instance-${crypto.randomUUID()}`;
      const v = w.getState().getShadowMetadata(e._stateKey, e._path) || {}, _ = v.signals || [];
      _.push({
        instanceId: l.current,
        parentId: b,
        position: E,
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
        } catch (f) {
          console.error("Error evaluating effect function:", f);
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
    "data-signal-id": g
  });
}
export {
  Se as $cogsSignal,
  ht as addStateOptions,
  vt as createCogsState,
  at as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
