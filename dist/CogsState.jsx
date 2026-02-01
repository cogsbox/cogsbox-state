"use client";
import { jsx as Z, Fragment as Me } from "react/jsx-runtime";
import { pluginStore as x } from "./pluginStore.js";
import { useState as ee, useRef as q, useCallback as Ae, useEffect as J, useLayoutEffect as $e, useMemo as ye, createElement as ue, startTransition as Ee } from "react";
import { transformStateFunc as Te, isFunction as R, isDeepEqual as Y, isArray as Ve, getDifferences as be } from "./utility.js";
import { ValidationWrapper as Ie, IsolatedComponentWrapper as Pe, FormElementWrapper as ke, MemoizedCogsItemWrapper as De } from "./Components.jsx";
import Ce from "superjson";
import { v4 as X } from "uuid";
import { getGlobalStore as p, updateShadowTypeInfo as fe } from "./store.js";
import { useCogsConfig as me } from "./CogsStateClient.jsx";
import { runValidation as _e } from "./validation.js";
const {
  getInitialOptions: N,
  updateInitialStateGlobal: he,
  getShadowMetadata: A,
  setShadowMetadata: W,
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
  setSyncInfo: wt,
  clearSelectedIndex: We,
  getSyncInfo: Le,
  notifyPathSubscribers: Be,
  getPluginMetaDataMap: Ge,
  setPluginMetaData: xe,
  removePluginMetaData: qe
  // Note: The old functions are no longer imported under their original names
} = p.getState(), { notifyUpdate: Je } = x.getState();
function j(e, a, l) {
  const s = A(e, a);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: p.getState().getShadowValue(e, a), keys: [] };
  const i = a.length > 0 ? a.join(".") : "root", m = l?.arrayViews?.[i] ?? s.arrayKeys;
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
  let i = { ...g, ...s }, m = !1;
  if (a) {
    const u = (t, o) => {
      for (const y in o)
        o.hasOwnProperty(y) && (o[y] instanceof Object && !Array.isArray(o[y]) && t[y] instanceof Object ? Y(t[y], o[y]) || (u(t[y], o[y]), m = !0) : t[y] !== o[y] && (t[y] = o[y], m = !0));
      return t;
    };
    i = u(i, a);
  }
  if (i.validation && (a?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || g?.validation?.hasOwnProperty("onBlur") || (i.validation.onBlur = "error", m = !0)), m) {
    de(e, i);
    const u = s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3, t = i.validation?.zodSchemaV4 && !s?.validation?.zodSchemaV4, o = i.validation?.zodSchemaV3 && !s?.validation?.zodSchemaV3;
    !u && (t || o) && (t ? fe(
      e,
      i.validation.zodSchemaV4,
      "zod4"
    ) : o && fe(
      e,
      i.validation.zodSchemaV3,
      "zod3"
    ), B(e));
  }
  return i;
}
function pt(e, a) {
  return {
    ...a,
    initialState: e,
    _addStateOptions: !0
  };
}
const Mt = (e, a) => {
  a?.plugins && x.getState().setRegisteredPlugins(a.plugins);
  const [l, s] = Te(e);
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
    }), $ = q(y);
    $.current = y;
    const E = D(u, []) || l[u], b = ot(
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
    return J(() => {
      t && x.getState().setPluginOptionsForState(u, t);
    }, [u, t]), J(() => (x.getState().stateHandlers.set(u, b), () => {
      x.getState().stateHandlers.delete(u);
    }), [u, b]), b;
  };
  function i(u, t) {
    if (ce({ stateKey: u, options: t, initialOptionsPart: s }), t.localStorage && Ze(u, t), t.formElements) {
      const y = x.getState().registeredPlugins.map(($) => t.formElements.hasOwnProperty($.name) ? {
        ...$,
        formWrapper: t.formElements[$.name]
      } : $);
      x.getState().setRegisteredPlugins(y);
    }
    B(u);
  }
  function m(u) {
    Object.keys(l).forEach((o) => {
      i(o, u);
    });
  }
  return {
    useCogsState: g,
    setCogsOptionsByKey: i,
    setCogsOptions: m
  };
}, He = (e, a, l, s, g) => {
  l?.log && console.log(
    "saving to localstorage",
    a,
    l.localStorage?.key,
    s
  );
  const i = R(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (i && s) {
    const m = `${s}-${a}-${i}`;
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
    const i = ae(
      `${s}-${e}-${g}`
    );
    if (i && i.lastUpdated > (i.lastSyncedWithServer || 0))
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
  if (W(e, a, {
    ...g,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(l)) {
    const i = A(e, a);
    i?.arrayKeys && i.arrayKeys.forEach((m, u) => {
      const t = [...a, m], o = l[u];
      o !== void 0 && te(
        e,
        t,
        o,
        s
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((i) => {
    const m = [...a, i], u = l[i];
    te(e, m, u, s);
  });
}
let re = [], le = !1;
function Qe() {
  le || (le = !0, console.log("Scheduling flush"), queueMicrotask(() => {
    console.log("Actually flushing"), nt();
  }));
}
function Ye(e, a) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: s, effect: g }) => {
    const i = document.querySelector(`[data-parent-id="${l}"]`);
    if (!i) return;
    const m = Array.from(i.childNodes);
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
    let i = [...a];
    for (; ; ) {
      const m = A(e, i);
      if (m?.pathComponents && m.pathComponents.forEach((u) => {
        const t = s.components?.get(u);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || g.add(t));
      }), i.length === 0) break;
      i.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Ve(l.newValue) && be(l.newValue, l.oldValue).forEach((u) => {
      const t = u.split("."), o = [...a, ...t], y = A(e, o);
      y?.pathComponents && y.pathComponents.forEach(($) => {
        const E = s.components?.get($);
        E && ((Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"]).includes("none") || g.add(E));
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
  const i = A(e, a);
  return {
    type: "update",
    oldValue: s,
    newValue: g,
    shadowMeta: i
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
  let i;
  if (R(l)) {
    const { value: o } = L(e, a);
    i = l({ state: o });
  } else
    i = l;
  const m = je(
    e,
    a,
    i,
    s,
    g
  );
  ne(e, a, { bubble: !0 });
  const u = A(e, a);
  let t;
  return u?.arrayKeys && s !== void 0 && s > 0 && (t = u.arrayKeys[s - 1]), {
    type: "insert",
    newValue: i,
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
    const g = s, i = g.type === "cut" ? null : g.newValue;
    g.shadowMeta?.signals?.length > 0 && a.push({ shadowMeta: g.shadowMeta, displayValue: i }), Xe(
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
  return (g, i, m) => {
    s(e, i, g, m);
  };
  function s(g, i, m, u) {
    let t;
    switch (u.updateType) {
      case "update":
        t = Ke(g, i, m);
        break;
      case "insert":
        t = tt(
          g,
          i,
          m,
          u.index,
          u.itemId
        );
        break;
      case "insert_many":
        t = et(g, i, m);
        break;
      case "cut":
        t = rt(g, i);
        break;
    }
    if (t === null)
      return;
    t.stateKey = g, t.path = i, re.push(t), Qe();
    const o = {
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
  reactiveType: i,
  componentId: m,
  defaultState: u,
  dependencies: t,
  serverState: o
} = {}) {
  const [y, $] = ee({}), { sessionId: E } = me();
  let b = !a;
  const [v] = ee(a ?? X()), F = q(m ?? X()), C = q(
    null
  );
  C.current = N(v) ?? null;
  const G = Ae(
    (P) => {
      const n = P ? { ...N(v), ...P } : N(v), c = n?.defaultState || u || e;
      if (n?.serverState?.status === "success" && n?.serverState?.data !== void 0)
        return {
          value: n.serverState.data,
          source: "server",
          timestamp: n.serverState.timestamp || Date.now()
        };
      if (n?.localStorage?.key && E) {
        const f = R(n.localStorage.key) ? n.localStorage.key(c) : n.localStorage.key, h = ae(
          `${E}-${v}-${f}`
        );
        if (h && h.lastUpdated > (n?.serverState?.timestamp || 0))
          return {
            value: h.state,
            source: "localStorage",
            timestamp: h.lastUpdated
          };
      }
      return {
        value: c || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [v, u, e, E]
  );
  J(() => {
    o && o.status === "success" && o.data !== void 0 && ge(v, o);
  }, [o, v]), J(() => p.getState().subscribeToPath(v, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const n = r.serverState;
      if (n?.status !== "success" || n.data === void 0)
        return;
      se(v, { serverState: n });
      const c = typeof n.merge == "object" ? n.merge : n.merge === !0 ? { strategy: "append", key: "id" } : null, S = D(v, []), f = n.data;
      if (c && c.strategy === "append" && "key" in c && Array.isArray(S) && Array.isArray(f)) {
        const h = c.key;
        if (!h) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const w = new Set(
          S.map((I) => I[h])
        ), M = f.filter(
          (I) => !w.has(I[h])
        );
        M.length > 0 && ve(v, [], M);
        const T = D(v, []);
        te(
          v,
          [],
          T,
          n.timestamp || Date.now()
        );
      } else
        K(v, f), te(
          v,
          [],
          f,
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
    if (W(v, [], {
      ...P,
      features: n
    }), r?.defaultState !== void 0 || u !== void 0) {
      const h = r?.defaultState || u;
      r?.defaultState || se(v, {
        defaultState: h
      });
    }
    const { value: c, source: S, timestamp: f } = G();
    K(v, c), W(v, [], {
      stateSource: S,
      lastServerSync: S === "server" ? f : void 0,
      isDirty: S === "server" ? !1 : void 0,
      baseServerState: S === "server" ? c : void 0
    }), S === "server" && o && ge(v, o), B(v);
  }, [v, ...t || []]), $e(() => {
    b && se(v, {
      formElements: s,
      defaultState: u,
      localStorage: l,
      middleware: C.current?.middleware
    });
    const P = `${v}////${F.current}`, r = A(v, []), n = r?.components || /* @__PURE__ */ new Map();
    return n.set(P, {
      forceUpdate: () => $({}),
      reactiveType: i ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: g || void 0,
      deps: g ? g(D(v, [])) : [],
      prevDeps: g ? g(D(v, [])) : []
    }), W(v, [], {
      ...r,
      components: n
    }), $({}), () => {
      const c = A(v, []), S = c?.components?.get(P);
      S?.paths && S.paths.forEach((f) => {
        const w = f.split(".").slice(1), M = p.getState().getShadowMetadata(v, w);
        M?.pathComponents && M.pathComponents.size === 0 && (delete M.pathComponents, p.getState().setShadowMetadata(v, w, M));
      }), c?.components && W(v, [], c);
    };
  }, []);
  const d = at(
    v,
    E,
    C
  );
  return p.getState().initialStateGlobal[v] || he(v, e), ye(() => we(
    v,
    d,
    F.current,
    E
  ), [v, E]);
}
const st = (e, a, l) => {
  let s = A(e, a)?.arrayKeys || [];
  const g = l?.transforms;
  if (!g || g.length === 0)
    return s;
  for (const i of g)
    if (i.type === "filter") {
      const m = [];
      s.forEach((u, t) => {
        const o = D(e, [...a, u]);
        i.fn(o, t) && m.push(u);
      }), s = m;
    } else i.type === "sort" && s.sort((m, u) => {
      const t = D(e, [...a, m]), o = D(e, [...a, u]);
      return i.fn(t, o);
    });
  return s;
}, ie = (e, a, l) => {
  const s = `${e}////${a}`, i = A(e, [])?.components?.get(s);
  !i || i.reactiveType === "none" || !(Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType]).includes("component") || Fe(e, l, s);
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
  const i = A(e, a);
  for (let m of i?.arrayKeys || []) {
    const u = m + ".selected", t = A(e, u.split(".").slice(1));
    m == l && t?.pathComponents?.forEach((o) => {
      s?.components?.get(o)?.forceUpdate();
    });
  }
};
function L(e, a, l) {
  const s = A(e, a), g = a.length > 0 ? a.join(".") : "root", i = l?.arrayViews?.[g];
  if (Array.isArray(i) && i.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const m = D(e, a, i);
  return {
    shadowMeta: s,
    value: m,
    arrayKeys: s?.arrayKeys
  };
}
function we(e, a, l, s) {
  const g = /* @__PURE__ */ new Map();
  function i({
    path: t = [],
    meta: o,
    componentId: y
  }) {
    const $ = o ? JSON.stringify(o.arrayViews || o.transforms) : "", E = t.join(".") + ":" + y + ":" + $;
    if (g.has(E))
      return g.get(E);
    const b = [e, ...t].join("."), v = () => {
    }, F = {
      apply(G, d, H) {
        if (H.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", n = o?.arrayViews?.[r];
          return D(e, t, n);
        }
        const P = H[0];
        return a(P, t, { updateType: "update" }), !0;
      },
      get(G, d, H) {
        if (d === "call" || d === "apply" || d === "bind")
          return Reflect.get(G, d, H);
        if (typeof d != "string")
          return Reflect.get(G, d);
        if (t.length === 0 && d in m)
          return m[d];
        if (typeof d == "string" && !d.startsWith("$")) {
          const r = [...t, d];
          return i({
            path: r,
            componentId: y,
            meta: o
          });
        }
        if (d === "$_rebuildStateShape")
          return i;
        if (d === "$sync" && t.length === 0)
          return async function() {
            const r = p.getState().getInitialOptions(e), n = r?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const c = p.getState().getShadowValue(e, []), S = r?.validation?.key;
            try {
              const f = await n.action(c);
              if (f && !f.success && f.errors, f?.success) {
                const h = p.getState().getShadowMetadata(e, []);
                W(e, [], {
                  ...h,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: c
                  // Update base server state
                }), n.onSuccess && n.onSuccess(f.data);
              } else !f?.success && n.onError && n.onError(f.error);
              return f;
            } catch (f) {
              return n.onError && n.onError(f), { success: !1, error: f };
            }
          };
        if (d === "$_status" || d === "$getStatus") {
          const r = () => {
            const { shadowMeta: n, value: c } = L(e, t, o);
            return n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || c !== void 0 ? "fresh" : "unknown";
          };
          return d === "$_status" ? r() : r;
        }
        if (d === "$removeStorage")
          return () => {
            const r = p.getState().initialStateGlobal[e], n = N(e), c = R(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, S = `${s}-${e}-${c}`;
            S && localStorage.removeItem(S);
          };
        if (d === "$validate")
          return () => {
            const r = p.getState(), { value: n } = L(e, t, o), c = r.getInitialOptions(e), S = c?.validation?.zodSchemaV4 || c?.validation?.zodSchemaV3;
            if (!S)
              return { success: !0, data: n };
            const f = S.safeParse(n);
            return f.success || (f.error.errors.forEach((h) => {
              const w = [...t, ...h.path.map(String)], M = r.getShadowMetadata(e, w) || {};
              r.setShadowMetadata(e, w, {
                ...M,
                validation: {
                  status: "INVALID",
                  errors: [
                    {
                      source: "client",
                      message: h.message,
                      severity: "error",
                      code: h.code
                    }
                  ],
                  lastValidated: Date.now(),
                  validatedValue: D(e, w)
                }
              });
            }), B(e)), f;
          };
        if (d === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = L(e, t, o);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (d === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            ie(e, y, [
              ...t,
              "getSelected"
            ]);
            const n = p.getState().selectedIndicesMap.get(r);
            if (!n)
              return;
            const c = t.join("."), S = o?.arrayViews?.[c], f = n.split(".").pop();
            if (!(S && !S.includes(f) || D(
              e,
              n.split(".").slice(1)
            ) === void 0))
              return i({
                path: n.split(".").slice(1),
                componentId: y,
                meta: o
              });
          };
        if (d === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const n = p.getState().selectedIndicesMap.get(r);
            if (!n)
              return -1;
            const { keys: c } = j(e, t, o);
            if (!c)
              return -1;
            const S = n.split(".").pop();
            return c.indexOf(S);
          };
        if (d === "$clearSelected")
          return Q(e, t), () => {
            We({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (d === "$map")
          return (r) => {
            const { value: n, keys: c } = j(
              e,
              t,
              o
            );
            if (ie(e, y, t), !c || !Array.isArray(n))
              return [];
            const S = i({
              path: t,
              componentId: y,
              meta: o
            });
            return n.map((f, h) => {
              const w = c[h];
              if (!w) return;
              const M = [...t, w], T = i({
                path: M,
                // This now correctly points to the item in the shadow store.
                componentId: y,
                meta: o
              });
              return r(T, h, S);
            });
          };
        if (d === "$filter")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { keys: c, value: S } = j(
              e,
              t,
              o
            );
            if (!Array.isArray(S))
              throw new Error("filter can only be used on arrays");
            const f = [];
            return S.forEach((h, w) => {
              if (r(h, w)) {
                const M = c[w];
                M && f.push(M);
              }
            }), i({
              path: t,
              componentId: y,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [n]: f
                },
                transforms: [
                  ...o?.transforms || [],
                  { type: "filter", fn: r, path: t }
                ]
              }
            });
          };
        if (d === "$sort")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { value: c, keys: S } = j(
              e,
              t,
              o
            );
            if (!Array.isArray(c) || !S)
              throw new Error("No array keys found for sorting");
            const f = c.map((w, M) => ({
              item: w,
              key: S[M]
            }));
            f.sort((w, M) => r(w.item, M.item));
            const h = f.map((w) => w.key);
            return i({
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
        if (d === "$stream")
          return function(r = {}) {
            const {
              bufferSize: n = 100,
              flushInterval: c = 100,
              bufferStrategy: S = "accumulate",
              store: f,
              onFlush: h
            } = r;
            let w = [], M = !1, T = null;
            const I = (V) => {
              if (!M) {
                if (S === "sliding" && w.length >= n)
                  w.shift();
                else if (S === "dropping" && w.length >= n)
                  return;
                w.push(V), w.length >= n && k();
              }
            }, k = () => {
              if (w.length === 0) return;
              const V = [...w];
              if (w = [], f) {
                const U = f(V);
                U !== void 0 && (Array.isArray(U) ? U : [U]).forEach((pe) => {
                  a(pe, t, {
                    updateType: "insert"
                  });
                });
              } else
                V.forEach((U) => {
                  a(U, t, {
                    updateType: "insert"
                  });
                });
              h?.(V);
            };
            c > 0 && (T = setInterval(k, c));
            const O = X(), _ = A(e, t) || {}, z = _.streams || /* @__PURE__ */ new Map();
            return z.set(O, { buffer: w, flushTimer: T }), W(e, t, {
              ..._,
              streams: z
            }), {
              write: (V) => I(V),
              writeMany: (V) => V.forEach(I),
              flush: () => k(),
              pause: () => {
                M = !0;
              },
              resume: () => {
                M = !1, w.length > 0 && k();
              },
              close: () => {
                k(), T && clearInterval(T);
                const V = p.getState().getShadowMetadata(e, t);
                V?.streams && V.streams.delete(O);
              }
            };
          };
        if (d === "$list")
          return (r) => /* @__PURE__ */ Z(() => {
            const c = q(/* @__PURE__ */ new Map()), [S, f] = ee({}), h = t.length > 0 ? t.join(".") : "root", w = st(e, t, o), M = ye(() => ({
              ...o,
              arrayViews: {
                ...o?.arrayViews || {},
                [h]: w
              }
            }), [o, h, w]), { value: T } = j(
              e,
              t,
              M
            );
            if (J(() => {
              const O = p.getState().subscribeToPath(b, (_) => {
                if (_.type === "GET_SELECTED")
                  return;
                const V = p.getState().getShadowMetadata(e, t)?.transformCaches;
                if (V)
                  for (const U of V.keys())
                    U.startsWith(y) && V.delete(U);
                (_.type === "INSERT" || _.type === "INSERT_MANY" || _.type === "REMOVE" || _.type === "CLEAR_SELECTION" || _.type === "SERVER_STATE_UPDATE" && !o?.serverStateIsUpStream) && f({});
              });
              return () => {
                O();
              };
            }, [y, b]), !Array.isArray(T))
              return null;
            const I = i({
              path: t,
              componentId: y,
              meta: M
              // Use updated meta here
            }), k = T.map((O, _) => {
              const z = w[_];
              if (!z)
                return null;
              let V = c.current.get(z);
              V || (V = X(), c.current.set(z, V));
              const U = [...t, z];
              return ue(De, {
                key: z,
                stateKey: e,
                itemComponentId: V,
                itemPath: U,
                localIndex: _,
                arraySetter: I,
                rebuildStateShape: i,
                renderFn: r
              });
            });
            return /* @__PURE__ */ Z(Me, { children: k });
          }, {});
        if (d === "$stateFlattenOn")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", c = o?.arrayViews?.[n], S = p.getState().getShadowValue(e, t, c);
            return Array.isArray(S) ? i({
              path: [...t, "[*]", r],
              componentId: y,
              meta: o
            }) : [];
          };
        if (d === "$index")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", c = o?.arrayViews?.[n];
            if (c) {
              const h = c[r];
              return h ? i({
                path: [...t, h],
                componentId: y,
                meta: o
              }) : void 0;
            }
            const S = A(e, t);
            if (!S?.arrayKeys) return;
            const f = S.arrayKeys[r];
            if (f)
              return i({
                path: [...t, f],
                componentId: y,
                meta: o
              });
          };
        if (d === "$last")
          return () => {
            const { keys: r } = j(e, t, o);
            if (!r || r.length === 0)
              return;
            const n = r[r.length - 1];
            if (!n)
              return;
            const c = [...t, n];
            return i({
              path: c,
              componentId: y,
              meta: o
            });
          };
        if (d === "$insert")
          return (r, n) => {
            a(r, t, {
              updateType: "insert",
              index: n
            });
          };
        if (d === "$insertMany")
          return (r) => {
            a(r, t, {
              updateType: "insert_many"
            });
          };
        if (d === "$uniqueInsert")
          return (r, n, c) => {
            const { value: S } = L(
              e,
              t,
              o
            ), f = R(r) ? r(S) : r;
            let h = null;
            if (!S.some((M) => {
              const T = n ? n.every(
                (I) => Y(M[I], f[I])
              ) : Y(M, f);
              return T && (h = M), T;
            }))
              a(f, t, { updateType: "insert" });
            else if (c && h) {
              const M = c(h), T = S.map(
                (I) => Y(I, h) ? M : I
              );
              a(T, t, {
                updateType: "update"
              });
            }
          };
        if (d === "$cut")
          return (r, n) => {
            const c = A(e, t);
            if (console.log("shadowMeta ->>>>>>>>>>>>>>>>", c), !c?.arrayKeys || c.arrayKeys.length === 0)
              return;
            const S = r === -1 ? c.arrayKeys.length - 1 : r !== void 0 ? r : c.arrayKeys.length - 1;
            console.log("indexToCut ->>>>>>>>>>>>>>>>", S);
            const f = c.arrayKeys[S];
            f && (console.log("idToCut ->>>>>>>>>>>>>>>>", f), a(null, [...t, f], {
              updateType: "cut"
            }));
          };
        if (d === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: n } = j(e, t, o);
            if (!n || n.length === 0)
              return;
            const c = p.getState().selectedIndicesMap.get(r);
            if (!c)
              return;
            const S = c.split(".").pop();
            if (!n.includes(S))
              return;
            const f = c.split(".").slice(1);
            p.getState().clearSelectedIndex({ arrayKey: r });
            const h = f.slice(0, -1);
            Q(e, h), a(null, f, {
              updateType: "cut"
            });
          };
        if (d === "$cutByValue")
          return (r) => {
            const {
              isArray: n,
              value: c,
              keys: S
            } = j(e, t, o);
            if (!n) return;
            const f = oe(c, S, (h) => h === r);
            f && a(null, [...t, f.key], {
              updateType: "cut"
            });
          };
        if (d === "$toggleByValue")
          return (r) => {
            const {
              isArray: n,
              value: c,
              keys: S
            } = j(e, t, o);
            if (!n) return;
            const f = oe(c, S, (h) => h === r);
            if (f) {
              const h = [...t, f.key];
              a(null, h, {
                updateType: "cut"
              });
            } else
              a(r, t, { updateType: "insert" });
          };
        if (d === "$findWith")
          return (r, n) => {
            const { isArray: c, value: S, keys: f } = j(e, t, o);
            if (!c)
              throw new Error("findWith can only be used on arrays");
            const h = oe(
              S,
              f,
              (w) => w?.[r] === n
            );
            return h ? i({
              path: [...t, h.key],
              componentId: y,
              meta: o
            }) : null;
          };
        if (d === "$cutThis") {
          const { value: r } = L(e, t, o), n = t.slice(0, -1);
          return Q(e, n), () => {
            a(r, t, { updateType: "cut" });
          };
        }
        if (d === "$get")
          return () => {
            ie(e, y, t);
            const { value: r } = L(e, t, o);
            return r;
          };
        if (d === "$$derive")
          return (r) => Se({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: o
          });
        if (d === "$$get")
          return () => Se({ _stateKey: e, _path: t, _meta: o });
        if (d === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return Le(r);
        }
        if (d == "getLocalStorage")
          return (r) => ae(s + "-" + e + "-" + r);
        if (d === "$isSelected") {
          const r = t.slice(0, -1);
          if (A(e, r)?.arrayKeys) {
            const c = e + "." + r.join("."), S = p.getState().selectedIndicesMap.get(c), f = e + "." + t.join(".");
            return S === f;
          }
          return;
        }
        if (d === "$setSelected")
          return (r) => {
            const n = t.slice(0, -1), c = e + "." + n.join("."), S = e + "." + t.join(".");
            Q(e, n, void 0), p.getState().selectedIndicesMap.get(c), r && p.getState().setSelectedIndex(c, S);
          };
        if (d === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), n = e + "." + r.join("."), c = e + "." + t.join(".");
            p.getState().selectedIndicesMap.get(n) === c ? p.getState().clearSelectedIndex({ arrayKey: n }) : p.getState().setSelectedIndex(n, c), Q(e, r);
          };
        if (d === "$_componentId")
          return y;
        if (t.length == 0) {
          if (d === "$setOptions")
            return (r) => {
              ce({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (d === "$_applyUpdate")
            return (r, n, c = "update") => {
              a(r, n, { updateType: c });
            };
          if (d === "$_getEffectiveSetState")
            return a;
          if (d === "$getPluginMetaData")
            return (r) => Ge(e, t)?.get(r);
          if (d === "$addPluginMetaData")
            return console.log("$addPluginMetaDat"), (r, n) => xe(e, t, r, n);
          if (d === "$removePluginMetaData")
            return (r) => qe(e, t, r);
          if (d === "$addZodValidation")
            return (r, n) => {
              r.forEach((c) => {
                const S = p.getState().getShadowMetadata(e, c.path) || {};
                p.getState().setShadowMetadata(e, c.path, {
                  ...S,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: n || "client",
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
          if (d === "$clearZodValidation")
            return (r) => {
              if (!r)
                throw new Error("clearZodValidation requires a path");
              const n = A(e, r) || {};
              W(e, r, {
                ...n,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (d === "$applyOperation")
            return (r, n) => {
              console.log(
                "getGlobalStore",
                p.getState().getShadowMetadata(e, r.path)
              );
              let c;
              if (r.insertAfterId && r.updateType === "insert") {
                const S = A(e, r.path);
                if (S?.arrayKeys) {
                  const f = S.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  f !== -1 && (c = f + 1);
                }
              }
              a(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                index: c,
                // Pass the calculated index
                metaData: n
              });
            };
          if (d === "$applyJsonPatch")
            return (r) => {
              const n = p.getState(), c = n.getShadowMetadata(e, []);
              if (!c?.components) return;
              const S = (h) => !h || h === "/" ? [] : h.split("/").slice(1).map((w) => w.replace(/~1/g, "/").replace(/~0/g, "~")), f = /* @__PURE__ */ new Set();
              for (const h of r) {
                const w = S(h.path);
                switch (h.op) {
                  case "add":
                  case "replace": {
                    const { value: M } = h;
                    n.updateShadowAtPath(e, w, M), n.markAsDirty(e, w, { bubble: !0 });
                    let T = [...w];
                    for (; ; ) {
                      const I = n.getShadowMetadata(
                        e,
                        T
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((k) => {
                        if (!f.has(k)) {
                          const O = c.components?.get(k);
                          O && (O.forceUpdate(), f.add(k));
                        }
                      }), T.length === 0) break;
                      T.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const M = w.slice(0, -1);
                    n.removeShadowArrayElement(e, w), n.markAsDirty(e, M, { bubble: !0 });
                    let T = [...M];
                    for (; ; ) {
                      const I = n.getShadowMetadata(
                        e,
                        T
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((k) => {
                        if (!f.has(k)) {
                          const O = c.components?.get(k);
                          O && (O.forceUpdate(), f.add(k));
                        }
                      }), T.length === 0) break;
                      T.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (d === "$getComponents")
            return () => A(e, [])?.components;
        }
        if (d === "$validationWrapper")
          return ({
            children: r,
            hideMessage: n
          }) => /* @__PURE__ */ Z(
            Ie,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: r
            }
          );
        if (d === "$_stateKey") return e;
        if (d === "$_path") return t;
        if (d === "$update")
          return (r) => (a(r, t, { updateType: "update" }), {
            synced: () => {
              const n = p.getState().getShadowMetadata(e, t);
              W(e, t, {
                ...n,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const c = [e, ...t].join(".");
              Be(c, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (d === "$toggle") {
          const { value: r } = L(
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
        if (d === "$isolate")
          return (r) => /* @__PURE__ */ Z(
            Pe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              renderFn: r
            }
          );
        if (d === "$formElement")
          return (r, n) => /* @__PURE__ */ Z(
            ke,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              setState: a,
              formOpts: n,
              renderFn: r
            }
          );
        const P = [...t, d];
        return i({
          path: P,
          componentId: y,
          meta: o
        });
      }
    }, C = new Proxy(v, F);
    return g.set(E, C), C;
  }
  const m = {
    $revertToInitialState: (t) => {
      const o = p.getState().getShadowMetadata(e, []);
      let y;
      o?.stateSource === "server" && o.baseServerState ? y = o.baseServerState : y = p.getState().initialStateGlobal[e], ze(e), K(e, y), i({
        path: [],
        componentId: l
      });
      const $ = N(e), E = R($?.localStorage?.key) ? $?.localStorage?.key(y) : $?.localStorage?.key, b = `${s}-${e}-${E}`;
      return b && localStorage.removeItem(b), B(e), y;
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
      ), y = p.getState().initialStateGlobal[e], $ = N(e), E = R($?.localStorage?.key) ? $?.localStorage?.key(y) : $?.localStorage?.key, b = `${s}-${e}-${E}`;
      return localStorage.getItem(b) && localStorage.removeItem(b), Ee(() => {
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
  return i({
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
  const a = q(null), l = q(null), s = q(!1), g = `${e._stateKey}-${e._path.join(".")}`, i = e._path.length > 0 ? e._path.join(".") : "root", m = e._meta?.arrayViews?.[i], u = D(e._stateKey, e._path, m);
  return J(() => {
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
      const v = p.getState().getShadowMetadata(e._stateKey, e._path) || {}, F = v.signals || [];
      F.push({
        instanceId: l.current,
        parentId: b,
        position: E,
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
        } catch (d) {
          console.error("Error evaluating effect function:", d);
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
  pt as addStateOptions,
  Mt as createCogsState,
  ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
