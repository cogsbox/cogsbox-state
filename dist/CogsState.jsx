"use client";
import { jsx as Z, Fragment as Me } from "react/jsx-runtime";
import { pluginStore as q } from "./pluginStore.js";
import { useState as ee, useRef as x, useCallback as Ae, useEffect as J, useLayoutEffect as $e, useMemo as ye, createElement as ue, startTransition as Ee } from "react";
import { transformStateFunc as Ve, isFunction as R, isDeepEqual as Y, isArray as Te, getDifferences as Ie } from "./utility.js";
import { ValidationWrapper as be, IsolatedComponentWrapper as Pe, FormElementWrapper as ke, MemoizedCogsItemWrapper as De } from "./Components.jsx";
import Ce from "superjson";
import { v4 as X } from "uuid";
import { getGlobalStore as p, updateShadowTypeInfo as fe } from "./store.js";
import { useCogsConfig as me } from "./CogsStateClient.jsx";
import { runValidation as _e } from "./validation.js";
const {
  getInitialOptions: N,
  updateInitialStateGlobal: he,
  getShadowMetadata: A,
  setShadowMetadata: L,
  getShadowValue: D,
  initializeShadowState: K,
  initializeAndMergeShadowState: Oe,
  updateShadowAtPath: Ue,
  insertShadowArrayElement: je,
  insertManyShadowArrayElements: ve,
  removeShadowArrayElement: Ne,
  setInitialStateOptions: de,
  setServerStateUpdate: ge,
  markAsDirty: ne,
  addPathComponent: Fe,
  clearSelectedIndexesForState: ze,
  addStateLog: Re,
  clearSelectedIndex: Le,
  getSyncInfo: We,
  notifyPathSubscribers: Be,
  getPluginMetaDataMap: Ge,
  setPluginMetaData: qe,
  removePluginMetaData: xe
} = p.getState(), { notifyUpdate: Je } = q.getState();
function j(e, a, l) {
  const s = A(e, a);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: p.getState().getShadowValue(e, a), keys: [] };
  const c = a.length > 0 ? a.join(".") : "root", m = l?.arrayViews?.[c] ?? s.arrayKeys;
  return Array.isArray(m) && m.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: p.getState().getShadowValue(e, a, m), keys: m ?? [] };
}
function oe(e, a, l) {
  for (let s = 0; s < e.length; s++)
    if (l(e[s], s)) {
      const g = a[s];
      if (g)
        return { key: g, index: s, value: e[s] };
    }
  return null;
}
function se(e, a) {
  const s = {
    ...N(e) || {},
    ...a
  };
  (s.validation?.zodSchemaV4 || s.validation?.zodSchemaV3) && !s.validation?.onBlur && (s.validation.onBlur = "error"), de(e, s);
}
function ce({
  stateKey: e,
  options: a,
  initialOptionsPart: l
}) {
  const s = N(e) || {}, g = l[e] || {};
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
    ), B(e));
  }
  return c;
}
function wt(e, a) {
  return {
    ...a,
    initialState: e,
    _addStateOptions: !0
  };
}
const pt = (e, a) => {
  a?.plugins && q.getState().setRegisteredPlugins(a.plugins);
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
    const y = N(u), $ = y ? {
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
    de(u, $);
  }), Object.keys(l).forEach((u) => {
    K(u, l[u]);
  });
  const g = (u, t) => {
    const [o] = ee(t?.componentId ?? X()), y = ce({
      stateKey: u,
      options: t,
      initialOptionsPart: s
    }), $ = x(y);
    $.current = y;
    const V = D(u, []) || l[u], I = ot(
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
    return J(() => {
      t && q.getState().setPluginOptionsForState(u, t);
    }, [u, t]), J(() => (q.getState().stateHandlers.set(u, I), () => {
      q.getState().stateHandlers.delete(u);
    }), [u, I]), I;
  };
  function c(u, t) {
    if (ce({ stateKey: u, options: t, initialOptionsPart: s }), t.localStorage && Ze(u, t), t.formElements) {
      const y = q.getState().registeredPlugins.map(($) => t.formElements.hasOwnProperty($.name) ? {
        ...$,
        formWrapper: t.formElements[$.name]
      } : $);
      q.getState().setRegisteredPlugins(y);
    }
    B(u);
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
}, He = (e, a, l, s, g) => {
  l?.log && console.log(
    "saving to localstorage",
    a,
    l.localStorage?.key,
    s
  );
  const c = R(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (c && s) {
    const m = `${s}-${a}-${c}`;
    let u;
    try {
      u = ae(m)?.lastSyncedWithServer;
    } catch {
    }
    const t = A(a, []), o = {
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
}, ae = (e) => {
  if (!e) return null;
  try {
    const a = window.localStorage.getItem(e);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, Ze = (e, a) => {
  const l = D(e, []), { sessionId: s } = me(), g = R(a?.localStorage?.key) ? a.localStorage.key(l) : a?.localStorage?.key;
  if (g && s) {
    const c = ae(
      `${s}-${e}-${g}`
    );
    if (c && c.lastUpdated > (c.lastSyncedWithServer || 0))
      return B(e), !0;
  }
  return !1;
}, B = (e) => {
  const a = A(e, []);
  if (!a) return;
  const l = /* @__PURE__ */ new Set();
  a?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || l.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    l.forEach((s) => s());
  });
};
function te(e, a, l, s) {
  const g = A(e, a);
  if (L(e, a, {
    ...g,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(l)) {
    const c = A(e, a);
    c?.arrayKeys && c.arrayKeys.forEach((m, u) => {
      const t = [...a, m], o = l[u];
      o !== void 0 && te(
        e,
        t,
        o,
        s
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((c) => {
    const m = [...a, c], u = l[c];
    te(e, m, u, s);
  });
}
let re = [], le = !1;
function Qe() {
  le || (le = !0, queueMicrotask(() => {
    nt();
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
function Xe(e, a, l) {
  const s = A(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const g = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let c = [...a];
    for (; ; ) {
      const m = A(e, c);
      if (m?.pathComponents && m.pathComponents.forEach((u) => {
        const t = s.components?.get(u);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || g.add(t));
      }), c.length === 0) break;
      c.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Te(l.newValue) && Ie(l.newValue, l.oldValue).forEach((u) => {
      const t = u.split("."), o = [...a, ...t], y = A(e, o);
      y?.pathComponents && y.pathComponents.forEach(($) => {
        const V = s.components?.get($);
        V && ((Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"]).includes("none") || g.add(V));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    let m = [...l.type === "insert" ? a : a.slice(0, -1)];
    for (; ; ) {
      const u = A(e, m);
      if (u?.pathComponents && u.pathComponents.forEach((t) => {
        const o = s.components?.get(t);
        o && g.add(o);
      }), m.length === 0) break;
      m.pop();
    }
  }
  return g;
}
function Ke(e, a, l) {
  const s = p.getState().getShadowValue(e, a), g = R(l) ? l(s) : l;
  if (Y(s, g))
    return null;
  Ue(e, a, g), ne(e, a, { bubble: !0 });
  const c = A(e, a);
  return {
    type: "update",
    oldValue: s,
    newValue: g,
    shadowMeta: c
  };
}
function et(e, a, l) {
  ve(e, a, l), ne(e, a, { bubble: !0 });
  const s = A(e, a);
  return {
    type: "insert_many",
    count: l.length,
    shadowMeta: s,
    path: a
  };
}
function tt(e, a, l, s, g) {
  let c;
  if (R(l)) {
    const { value: o } = W(e, a);
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
  ne(e, a, { bubble: !0 });
  const u = A(e, a);
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
function rt(e, a) {
  const l = a.slice(0, -1), s = D(e, a);
  return Ne(e, a), ne(e, l, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: l };
}
function nt() {
  const e = /* @__PURE__ */ new Set(), a = [], l = [];
  for (const s of re) {
    if (s.status && s.updateType) {
      l.push(s);
      continue;
    }
    const g = s, c = g.type === "cut" ? null : g.newValue;
    g.shadowMeta?.signals?.length > 0 && a.push({ shadowMeta: g.shadowMeta, displayValue: c }), Xe(
      g.stateKey,
      g.path,
      g
    ).forEach((u) => {
      e.add(u);
    });
  }
  l.length > 0 && Re(l), a.forEach(({ shadowMeta: s, displayValue: g }) => {
    Ye(s, g);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), re = [], le = !1;
}
function at(e, a, l) {
  return (g, c, m) => {
    s(e, c, g, m);
  };
  function s(g, c, m, u) {
    let t;
    switch (u.updateType) {
      case "update":
        t = Ke(g, c, m);
        break;
      case "insert":
        t = tt(
          g,
          c,
          m,
          u.index,
          u.itemId
        );
        break;
      case "insert_many":
        t = et(g, c, m);
        break;
      case "cut":
        t = rt(g, c);
        break;
    }
    if (t === null)
      return;
    t.stateKey = g, t.path = c, re.push(t), Qe();
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
    re.push(o), t.newValue !== void 0 && He(
      t.newValue,
      g,
      l.current,
      a
    ), l.current?.middleware && l.current.middleware({ update: o }), _e(o, u.validationTrigger || "programmatic"), Je(o);
  }
}
function ot(e, {
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
  const [y, $] = ee({}), { sessionId: V } = me();
  let I = !a;
  const [v] = ee(a ?? X()), F = x(m ?? X()), C = x(
    null
  );
  C.current = N(v) ?? null;
  const G = Ae(
    (P) => {
      const n = P ? { ...N(v), ...P } : N(v), i = n?.defaultState || u || e;
      if (n?.serverState?.status === "success" && n?.serverState?.data !== void 0)
        return {
          value: n.serverState.data,
          source: "server",
          timestamp: n.serverState.timestamp || Date.now()
        };
      if (n?.localStorage?.key && V) {
        const d = R(n.localStorage.key) ? n.localStorage.key(i) : n.localStorage.key, h = ae(
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
  J(() => {
    o && o.status === "success" && o.data !== void 0 && ge(v, o);
  }, [o, v]), J(() => p.getState().subscribeToPath(v, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const n = r.serverState;
      if (n?.status !== "success" || n.data === void 0)
        return;
      se(v, { serverState: n });
      const i = typeof n.merge == "object" ? n.merge : n.merge === !0 ? { strategy: "append", key: "id" } : null, S = D(v, []), d = n.data;
      if (i && i.strategy === "append" && "key" in i && Array.isArray(S) && Array.isArray(d)) {
        const h = i.key;
        if (!h) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const w = new Set(
          S.map((b) => b[h])
        ), M = d.filter(
          (b) => !w.has(b[h])
        );
        M.length > 0 && ve(v, [], M);
        const E = D(v, []);
        te(
          v,
          [],
          E,
          n.timestamp || Date.now()
        );
      } else
        K(v, d), te(
          v,
          [],
          d,
          n.timestamp || Date.now()
        );
      B(v);
    }
  }), [v]), J(() => {
    const P = p.getState().getShadowMetadata(v, []);
    if (P && P.stateSource)
      return;
    const r = N(v), n = {
      localStorageEnabled: !!r?.localStorage?.key
    };
    if (L(v, [], {
      ...P,
      features: n
    }), r?.defaultState !== void 0 || u !== void 0) {
      const h = r?.defaultState || u;
      r?.defaultState || se(v, {
        defaultState: h
      });
    }
    const { value: i, source: S, timestamp: d } = G();
    K(v, i), L(v, [], {
      stateSource: S,
      lastServerSync: S === "server" ? d : void 0,
      isDirty: S === "server" ? !1 : void 0,
      baseServerState: S === "server" ? i : void 0
    }), S === "server" && o && ge(v, o), B(v);
  }, [v, ...t || []]), $e(() => {
    I && se(v, {
      formElements: s,
      defaultState: u,
      localStorage: l,
      middleware: C.current?.middleware
    });
    const P = `${v}////${F.current}`, r = A(v, []), n = r?.components || /* @__PURE__ */ new Map();
    return n.set(P, {
      forceUpdate: () => $({}),
      reactiveType: c ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: g || void 0,
      deps: g ? g(D(v, [])) : [],
      prevDeps: g ? g(D(v, [])) : []
    }), L(v, [], {
      ...r,
      components: n
    }), $({}), () => {
      const i = A(v, []), S = i?.components?.get(P);
      S?.paths && S.paths.forEach((d) => {
        const w = d.split(".").slice(1), M = p.getState().getShadowMetadata(v, w);
        M?.pathComponents && M.pathComponents.size === 0 && (delete M.pathComponents, p.getState().setShadowMetadata(v, w, M));
      }), i?.components && L(v, [], i);
    };
  }, []);
  const f = at(
    v,
    V,
    C
  );
  return p.getState().initialStateGlobal[v] || he(v, e), ye(() => we(
    v,
    f,
    F.current,
    V
  ), [v, V]);
}
const st = (e, a, l) => {
  let s = A(e, a)?.arrayKeys || [];
  const g = l?.transforms;
  if (!g || g.length === 0)
    return s;
  for (const c of g)
    if (c.type === "filter") {
      const m = [];
      s.forEach((u, t) => {
        const o = D(e, [...a, u]);
        c.fn(o, t) && m.push(u);
      }), s = m;
    } else c.type === "sort" && s.sort((m, u) => {
      const t = D(e, [...a, m]), o = D(e, [...a, u]);
      return c.fn(t, o);
    });
  return s;
}, ie = (e, a, l) => {
  const s = `${e}////${a}`, c = A(e, [])?.components?.get(s);
  !c || c.reactiveType === "none" || !(Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType]).includes("component") || Fe(e, l, s);
}, Q = (e, a, l) => {
  const s = A(e, []), g = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((m, u) => {
    (Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"]).includes("all") && (m.forceUpdate(), g.add(u));
  }), A(e, [
    ...a,
    "getSelected"
  ])?.pathComponents?.forEach((m) => {
    s?.components?.get(m)?.forceUpdate();
  });
  const c = A(e, a);
  for (let m of c?.arrayKeys || []) {
    const u = m + ".selected", t = A(e, u.split(".").slice(1));
    m == l && t?.pathComponents?.forEach((o) => {
      s?.components?.get(o)?.forceUpdate();
    });
  }
};
function W(e, a, l) {
  const s = A(e, a), g = a.length > 0 ? a.join(".") : "root", c = l?.arrayViews?.[g];
  if (Array.isArray(c) && c.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const m = D(e, a, c);
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
    const $ = o ? JSON.stringify(o.arrayViews || o.transforms) : "", V = t.join(".") + ":" + y + ":" + $;
    if (g.has(V))
      return g.get(V);
    const I = [e, ...t].join("."), v = () => {
    }, F = {
      apply(G, f, H) {
        if (H.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", n = o?.arrayViews?.[r];
          return D(e, t, n);
        }
        const P = H[0];
        return a(P, t, { updateType: "update" }), !0;
      },
      get(G, f, H) {
        if (f === "call" || f === "apply" || f === "bind")
          return Reflect.get(G, f, H);
        if (typeof f != "string")
          return Reflect.get(G, f);
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
            const r = p.getState().getInitialOptions(e), n = r?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const i = p.getState().getShadowValue(e, []), S = r?.validation?.key;
            try {
              const d = await n.action(i);
              if (d && !d.success && d.errors, d?.success) {
                const h = p.getState().getShadowMetadata(e, []);
                L(e, [], {
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
            const { shadowMeta: n, value: i } = W(e, t, o);
            return n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || i !== void 0 ? "fresh" : "unknown";
          };
          return f === "$_status" ? r() : r;
        }
        if (f === "$removeStorage")
          return () => {
            const r = p.getState().initialStateGlobal[e], n = N(e), i = R(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, S = `${s}-${e}-${i}`;
            S && localStorage.removeItem(S);
          };
        if (f === "$validate")
          return () => {
            const r = p.getState(), { value: n } = W(e, t, o), i = r.getInitialOptions(e), S = i?.validation?.zodSchemaV4 || i?.validation?.zodSchemaV3;
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
              (d.error?.issues || d.error?.errors || []).forEach((w) => {
                const M = [...t, ...w.path.map(String)], E = r.getShadowMetadata(e, M) || {};
                r.setShadowMetadata(e, M, {
                  ...E,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: "client",
                        message: w.message,
                        severity: "error",
                        code: w.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: r.getShadowValue(e, M)
                  }
                });
              });
            return B(e), d;
          };
        if (f === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = W(e, t, o);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (f === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            ie(e, y, [
              ...t,
              "getSelected"
            ]);
            const n = p.getState().selectedIndicesMap.get(r);
            if (!n)
              return;
            const i = t.join("."), S = o?.arrayViews?.[i], d = n.split(".").pop();
            if (!(S && !S.includes(d) || D(
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
            const n = p.getState().selectedIndicesMap.get(r);
            if (!n)
              return -1;
            const { keys: i } = j(e, t, o);
            if (!i)
              return -1;
            const S = n.split(".").pop();
            return i.indexOf(S);
          };
        if (f === "$clearSelected")
          return Q(e, t), () => {
            Le({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (f === "$map")
          return (r) => {
            const { value: n, keys: i } = j(
              e,
              t,
              o
            );
            if (ie(e, y, t), !i || !Array.isArray(n))
              return [];
            const S = c({
              path: t,
              componentId: y,
              meta: o
            });
            return n.map((d, h) => {
              const w = i[h];
              if (!w) return;
              const M = [...t, w], E = c({
                path: M,
                // This now correctly points to the item in the shadow store.
                componentId: y,
                meta: o
              });
              return r(E, h, S);
            });
          };
        if (f === "$filter")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { keys: i, value: S } = j(
              e,
              t,
              o
            );
            if (!Array.isArray(S))
              throw new Error("filter can only be used on arrays");
            const d = [];
            return S.forEach((h, w) => {
              if (r(h, w)) {
                const M = i[w];
                M && d.push(M);
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
            const n = t.length > 0 ? t.join(".") : "root", { value: i, keys: S } = j(
              e,
              t,
              o
            );
            if (!Array.isArray(i) || !S)
              throw new Error("No array keys found for sorting");
            const d = i.map((w, M) => ({
              item: w,
              key: S[M]
            }));
            d.sort((w, M) => r(w.item, M.item));
            const h = d.map((w) => w.key);
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
        if (f === "$stream")
          return function(r = {}) {
            const {
              bufferSize: n = 100,
              flushInterval: i = 100,
              bufferStrategy: S = "accumulate",
              store: d,
              onFlush: h
            } = r;
            let w = [], M = !1, E = null;
            const b = (T) => {
              if (!M) {
                if (S === "sliding" && w.length >= n)
                  w.shift();
                else if (S === "dropping" && w.length >= n)
                  return;
                w.push(T), w.length >= n && k();
              }
            }, k = () => {
              if (w.length === 0) return;
              const T = [...w];
              if (w = [], d) {
                const U = d(T);
                U !== void 0 && (Array.isArray(U) ? U : [U]).forEach((pe) => {
                  a(pe, t, {
                    updateType: "insert"
                  });
                });
              } else
                T.forEach((U) => {
                  a(U, t, {
                    updateType: "insert"
                  });
                });
              h?.(T);
            };
            i > 0 && (E = setInterval(k, i));
            const O = X(), _ = A(e, t) || {}, z = _.streams || /* @__PURE__ */ new Map();
            return z.set(O, { buffer: w, flushTimer: E }), L(e, t, {
              ..._,
              streams: z
            }), {
              write: (T) => b(T),
              writeMany: (T) => T.forEach(b),
              flush: () => k(),
              pause: () => {
                M = !0;
              },
              resume: () => {
                M = !1, w.length > 0 && k();
              },
              close: () => {
                k(), E && clearInterval(E);
                const T = p.getState().getShadowMetadata(e, t);
                T?.streams && T.streams.delete(O);
              }
            };
          };
        if (f === "$list")
          return (r) => /* @__PURE__ */ Z(() => {
            const i = x(/* @__PURE__ */ new Map()), [S, d] = ee({}), h = t.length > 0 ? t.join(".") : "root", w = st(e, t, o), M = ye(() => ({
              ...o,
              arrayViews: {
                ...o?.arrayViews || {},
                [h]: w
              }
            }), [o, h, w]), { value: E } = j(
              e,
              t,
              M
            );
            if (J(() => {
              const O = p.getState().subscribeToPath(I, (_) => {
                if (_.type === "GET_SELECTED")
                  return;
                const T = p.getState().getShadowMetadata(e, t)?.transformCaches;
                if (T)
                  for (const U of T.keys())
                    U.startsWith(y) && T.delete(U);
                (_.type === "INSERT" || _.type === "INSERT_MANY" || _.type === "REMOVE" || _.type === "CLEAR_SELECTION" || _.type === "SERVER_STATE_UPDATE" && !o?.serverStateIsUpStream) && d({});
              });
              return () => {
                O();
              };
            }, [y, I]), !Array.isArray(E))
              return null;
            const b = c({
              path: t,
              componentId: y,
              meta: M
              // Use updated meta here
            }), k = E.map((O, _) => {
              const z = w[_];
              if (!z)
                return null;
              let T = i.current.get(z);
              T || (T = X(), i.current.set(z, T));
              const U = [...t, z];
              return ue(De, {
                key: z,
                stateKey: e,
                itemComponentId: T,
                itemPath: U,
                localIndex: _,
                arraySetter: b,
                rebuildStateShape: c,
                renderFn: r
              });
            });
            return /* @__PURE__ */ Z(Me, { children: k });
          }, {});
        if (f === "$stateFlattenOn")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = o?.arrayViews?.[n], S = p.getState().getShadowValue(e, t, i);
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
            const S = A(e, t);
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
            const { keys: r } = j(e, t, o);
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
            const { value: S } = W(
              e,
              t,
              o
            ), d = R(r) ? r(S) : r;
            let h = null;
            if (!S.some((M) => {
              const E = n ? n.every(
                (b) => Y(M[b], d[b])
              ) : Y(M, d);
              return E && (h = M), E;
            }))
              a(d, t, { updateType: "insert" });
            else if (i && h) {
              const M = i(h), E = S.map(
                (b) => Y(b, h) ? M : b
              );
              a(E, t, {
                updateType: "update"
              });
            }
          };
        if (f === "$cut")
          return (r, n) => {
            const i = A(e, t);
            if (!i?.arrayKeys || i.arrayKeys.length === 0)
              return;
            const S = r === -1 ? i.arrayKeys.length - 1 : r !== void 0 ? r : i.arrayKeys.length - 1, d = i.arrayKeys[S];
            d && a(null, [...t, d], {
              updateType: "cut"
            });
          };
        if (f === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: n } = j(e, t, o);
            if (!n || n.length === 0)
              return;
            const i = p.getState().selectedIndicesMap.get(r);
            if (!i)
              return;
            const S = i.split(".").pop();
            if (!n.includes(S))
              return;
            const d = i.split(".").slice(1);
            p.getState().clearSelectedIndex({ arrayKey: r });
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
            } = j(e, t, o);
            if (!n) return;
            const d = oe(i, S, (h) => h === r);
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
            } = j(e, t, o);
            if (!n) return;
            const d = oe(i, S, (h) => h === r);
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
            const { isArray: i, value: S, keys: d } = j(e, t, o);
            if (!i)
              throw new Error("findWith can only be used on arrays");
            const h = oe(
              S,
              d,
              (w) => w?.[r] === n
            );
            return h ? c({
              path: [...t, h.key],
              componentId: y,
              meta: o
            }) : null;
          };
        if (f === "$cutThis") {
          const { value: r } = W(e, t, o), n = t.slice(0, -1);
          return Q(e, n), () => {
            a(r, t, { updateType: "cut" });
          };
        }
        if (f === "$get")
          return () => {
            ie(e, y, t);
            const { value: r } = W(e, t, o);
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
          return We(r);
        }
        if (f == "getLocalStorage")
          return (r) => ae(s + "-" + e + "-" + r);
        if (f === "$isSelected") {
          const r = t.slice(0, -1);
          if (A(e, r)?.arrayKeys) {
            const i = e + "." + r.join("."), S = p.getState().selectedIndicesMap.get(i), d = e + "." + t.join(".");
            return S === d;
          }
          return;
        }
        if (f === "$setSelected")
          return (r) => {
            const n = t.slice(0, -1), i = e + "." + n.join("."), S = e + "." + t.join(".");
            Q(e, n, void 0), p.getState().selectedIndicesMap.get(i), r && p.getState().setSelectedIndex(i, S);
          };
        if (f === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), n = e + "." + r.join("."), i = e + "." + t.join(".");
            p.getState().selectedIndicesMap.get(n) === i ? p.getState().clearSelectedIndex({ arrayKey: n }) : p.getState().setSelectedIndex(n, i), Q(e, r);
          };
        if (f === "$_componentId")
          return y;
        if (t.length == 0) {
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
            return (r) => Ge(e, t)?.get(r);
          if (f === "$addPluginMetaData")
            return (r, n) => qe(e, t, r, n);
          if (f === "$removePluginMetaData")
            return (r) => xe(e, t, r);
          if (f === "$addZodValidation")
            return (r, n) => {
              r.forEach((i) => {
                const S = p.getState().getShadowMetadata(e, i.path) || {};
                p.getState().setShadowMetadata(e, i.path, {
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
          if (f === "$clearZodValidation")
            return (r) => {
              if (!r)
                throw new Error("clearZodValidation requires a path");
              const n = A(e, r) || {};
              L(e, r, {
                ...n,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (f === "$applyOperation")
            return (r, n) => {
              let i;
              if (r.insertAfterId && r.updateType === "insert") {
                const S = A(e, r.path);
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
              const n = p.getState(), i = n.getShadowMetadata(e, []);
              if (!i?.components) return;
              const S = (h) => !h || h === "/" ? [] : h.split("/").slice(1).map((w) => w.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const h of r) {
                const w = S(h.path);
                switch (h.op) {
                  case "add":
                  case "replace": {
                    const { value: M } = h;
                    n.updateShadowAtPath(e, w, M), n.markAsDirty(e, w, { bubble: !0 });
                    let E = [...w];
                    for (; ; ) {
                      const b = n.getShadowMetadata(
                        e,
                        E
                      );
                      if (b?.pathComponents && b.pathComponents.forEach((k) => {
                        if (!d.has(k)) {
                          const O = i.components?.get(k);
                          O && (O.forceUpdate(), d.add(k));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const M = w.slice(0, -1);
                    n.removeShadowArrayElement(e, w), n.markAsDirty(e, M, { bubble: !0 });
                    let E = [...M];
                    for (; ; ) {
                      const b = n.getShadowMetadata(
                        e,
                        E
                      );
                      if (b?.pathComponents && b.pathComponents.forEach((k) => {
                        if (!d.has(k)) {
                          const O = i.components?.get(k);
                          O && (O.forceUpdate(), d.add(k));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (f === "$getComponents")
            return () => A(e, [])?.components;
        }
        if (f === "$validationWrapper")
          return ({
            children: r,
            hideMessage: n
          }) => /* @__PURE__ */ Z(
            be,
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
              const n = p.getState().getShadowMetadata(e, t);
              L(e, t, {
                ...n,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const i = [e, ...t].join(".");
              Be(i, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (f === "$toggle") {
          const { value: r } = W(
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
            return /* @__PURE__ */ Z(
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
          return (r, n) => /* @__PURE__ */ Z(
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
        const P = [...t, f];
        return c({
          path: P,
          componentId: y,
          meta: o
        });
      }
    }, C = new Proxy(v, F);
    return g.set(V, C), C;
  }
  const m = {
    $revertToInitialState: (t) => {
      const o = p.getState().getShadowMetadata(e, []);
      let y;
      o?.stateSource === "server" && o.baseServerState ? y = o.baseServerState : y = p.getState().initialStateGlobal[e], ze(e), K(e, y), c({
        path: [],
        componentId: l
      });
      const $ = N(e), V = R($?.localStorage?.key) ? $?.localStorage?.key(y) : $?.localStorage?.key, I = `${s}-${e}-${V}`;
      return I && localStorage.removeItem(I), B(e), y;
    },
    $initializeAndMergeShadowState: (t) => {
      Oe(e, t), B(e);
    },
    $updateInitialState: (t) => {
      const o = we(
        e,
        a,
        l,
        s
      ), y = p.getState().initialStateGlobal[e], $ = N(e), V = R($?.localStorage?.key) ? $?.localStorage?.key(y) : $?.localStorage?.key, I = `${s}-${e}-${V}`;
      return localStorage.getItem(I) && localStorage.removeItem(I), Ee(() => {
        he(e, t), K(e, t);
        const v = p.getState().getShadowMetadata(e, []);
        v && v?.components?.forEach((F) => {
          F.forceUpdate();
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
  return ue(it, { proxy: e });
}
function it({
  proxy: e
}) {
  const a = x(null), l = x(null), s = x(!1), g = `${e._stateKey}-${e._path.join(".")}`, c = e._path.length > 0 ? e._path.join(".") : "root", m = e._meta?.arrayViews?.[c], u = D(e._stateKey, e._path, m);
  return J(() => {
    const t = a.current;
    if (!t || s.current) return;
    const o = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", g);
        return;
      }
      const y = t.parentElement, V = Array.from(y.childNodes).indexOf(t);
      let I = y.getAttribute("data-parent-id");
      I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I)), l.current = `instance-${crypto.randomUUID()}`;
      const v = p.getState().getShadowMetadata(e._stateKey, e._path) || {}, F = v.signals || [];
      F.push({
        instanceId: l.current,
        parentId: I,
        position: V,
        effect: e._effect
      }), p.getState().setShadowMetadata(e._stateKey, e._path, {
        ...v,
        signals: F
      });
      let C = u;
      if (e._effect)
        try {
          C = new Function(
            "state",
            `return (${e._effect})(state)`
          )(u);
        } catch (f) {
          console.error("Error evaluating effect function:", f);
        }
      C !== null && typeof C == "object" && (C = JSON.stringify(C));
      const G = document.createTextNode(String(C ?? ""));
      t.replaceWith(G), s.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(o), l.current) {
        const y = p.getState().getShadowMetadata(e._stateKey, e._path) || {};
        y.signals && (y.signals = y.signals.filter(
          ($) => $.instanceId !== l.current
        ), p.getState().setShadowMetadata(e._stateKey, e._path, y));
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
  wt as addStateOptions,
  pt as createCogsState,
  ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
