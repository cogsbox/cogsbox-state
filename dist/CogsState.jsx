"use client";
import { jsx as Q, Fragment as Me } from "react/jsx-runtime";
import { pluginStore as q } from "./pluginStore.js";
import { useState as te, useRef as x, useCallback as Ae, useEffect as J, useLayoutEffect as $e, useMemo as ye, createElement as ue, startTransition as Ee } from "react";
import { transformStateFunc as Ve, isFunction as R, isDeepEqual as Z, isArray as Te, getDifferences as be } from "./utility.js";
import { ValidationWrapper as Ie, IsolatedComponentWrapper as Pe, FormElementWrapper as ke, MemoizedCogsItemWrapper as De } from "./Components.jsx";
import Ce from "superjson";
import { v4 as X } from "uuid";
import { getGlobalStore as p, updateShadowTypeInfo as fe } from "./store.js";
import { useCogsConfig as me } from "./CogsStateClient.jsx";
import { runValidation as _e } from "./validation.js";
const {
  getInitialOptions: N,
  updateInitialStateGlobal: he,
  getShadowMetadata: E,
  setShadowMetadata: B,
  getShadowValue: D,
  initializeShadowState: K,
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
  notifyPathSubscribers: Be,
  getPluginMetaDataMap: Ge,
  setPluginMetaData: qe,
  removePluginMetaData: xe
} = p.getState(), { notifyUpdate: Je } = q.getState();
function U(e, a, l) {
  const s = E(e, a);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: p.getState().getShadowValue(e, a), keys: [] };
  const c = a.length > 0 ? a.join(".") : "root", h = l?.arrayViews?.[c] ?? s.arrayKeys;
  return Array.isArray(h) && h.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: p.getState().getShadowValue(e, a, h), keys: h ?? [] };
}
function se(e, a, l) {
  for (let s = 0; s < e.length; s++)
    if (l(e[s], s)) {
      const S = a[s];
      if (S)
        return { key: S, index: s, value: e[s] };
    }
  return null;
}
function ie(e, a) {
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
  const s = N(e) || {}, S = l[e] || {};
  let c = { ...S, ...s }, h = !1;
  if (a) {
    const u = (t, o) => {
      for (const y in o)
        o.hasOwnProperty(y) && (o[y] instanceof Object && !Array.isArray(o[y]) && t[y] instanceof Object ? Z(t[y], o[y]) || (u(t[y], o[y]), h = !0) : t[y] !== o[y] && (t[y] = o[y], h = !0));
      return t;
    };
    c = u(c, a);
  }
  if (c.validation && (a?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || S?.validation?.hasOwnProperty("onBlur") || (c.validation.onBlur = "error", h = !0)), h) {
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
    ), L(e));
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
  const S = (u, t) => {
    const [o] = te(t?.componentId ?? X()), y = ce({
      stateKey: u,
      options: t,
      initialOptionsPart: s
    }), $ = x(y);
    $.current = y;
    const V = D(u, []) || l[u], b = ot(
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
    }, [u, t]), J(() => (q.getState().stateHandlers.set(u, b), () => {
      q.getState().stateHandlers.delete(u);
    }), [u, b]), b;
  };
  function c(u, t) {
    if (ce({ stateKey: u, options: t, initialOptionsPart: s }), t.localStorage && Qe(u, t), t.formElements) {
      const y = q.getState().registeredPlugins.map(($) => t.formElements.hasOwnProperty($.name) ? {
        ...$,
        formWrapper: t.formElements[$.name]
      } : $);
      q.getState().setRegisteredPlugins(y);
    }
    L(u);
  }
  function h(u) {
    Object.keys(l).forEach((o) => {
      c(o, u);
    });
  }
  return {
    useCogsState: S,
    setCogsOptionsByKey: c,
    setCogsOptions: h
  };
}, He = (e, a, l, s, S) => {
  l?.log && console.log(
    "saving to localstorage",
    a,
    l.localStorage?.key,
    s
  );
  const c = R(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (c && s) {
    const h = `${s}-${a}-${c}`;
    let u;
    try {
      u = oe(h)?.lastSyncedWithServer;
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
      h,
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
}, Qe = (e, a) => {
  const l = D(e, []), { sessionId: s } = me(), S = R(a?.localStorage?.key) ? a.localStorage.key(l) : a?.localStorage?.key;
  if (S && s) {
    const c = oe(
      `${s}-${e}-${S}`
    );
    if (c && c.lastUpdated > (c.lastSyncedWithServer || 0))
      return L(e), !0;
  }
  return !1;
}, L = (e) => {
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
  const S = E(e, a);
  if (B(e, a, {
    ...S,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(l)) {
    const c = E(e, a);
    c?.arrayKeys && c.arrayKeys.forEach((h, u) => {
      const t = [...a, h], o = l[u];
      o !== void 0 && re(
        e,
        t,
        o,
        s
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((c) => {
    const h = [...a, c], u = l[c];
    re(e, h, u, s);
  });
}
let ne = [], le = !1;
function Ye() {
  le || (le = !0, queueMicrotask(() => {
    nt();
  }));
}
function Ze(e, a) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: s, effect: S }) => {
    const c = document.querySelector(`[data-parent-id="${l}"]`);
    if (!c) return;
    const h = Array.from(c.childNodes);
    if (!h[s]) return;
    let u = a;
    if (S && a !== null)
      try {
        u = new Function("state", `return (${S})(state)`)(
          a
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    u !== null && typeof u == "object" && (u = JSON.stringify(u)), h[s].textContent = String(u ?? "");
  });
}
function Xe(e, a, l) {
  const s = E(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const S = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let c = [...a];
    for (; ; ) {
      const h = E(e, c);
      if (h?.pathComponents && h.pathComponents.forEach((u) => {
        const t = s.components?.get(u);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || S.add(t));
      }), c.length === 0) break;
      c.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Te(l.newValue) && be(l.newValue, l.oldValue).forEach((u) => {
      const t = u.split("."), o = [...a, ...t], y = E(e, o);
      y?.pathComponents && y.pathComponents.forEach(($) => {
        const V = s.components?.get($);
        V && ((Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"]).includes("none") || S.add(V));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    let h = [...l.type === "insert" ? a : a.slice(0, -1)];
    for (; ; ) {
      const u = E(e, h);
      if (u?.pathComponents && u.pathComponents.forEach((t) => {
        const o = s.components?.get(t);
        o && S.add(o);
      }), h.length === 0) break;
      h.pop();
    }
  }
  return S;
}
function Ke(e, a, l) {
  const s = p.getState().getShadowValue(e, a), S = R(l) ? l(s) : l;
  if (Z(s, S))
    return null;
  je(e, a, S), ae(e, a, { bubble: !0 });
  const c = E(e, a);
  return {
    type: "update",
    oldValue: s,
    newValue: S,
    shadowMeta: c
  };
}
function et(e, a, l) {
  ve(e, a, l), ae(e, a, { bubble: !0 });
  const s = E(e, a);
  return {
    type: "insert_many",
    count: l.length,
    shadowMeta: s,
    path: a
  };
}
function tt(e, a, l, s, S) {
  let c;
  if (R(l)) {
    const { value: o } = W(e, a);
    c = l({ state: o });
  } else
    c = l;
  const h = Ue(
    e,
    a,
    c,
    s,
    S
  );
  ae(e, a, { bubble: !0 });
  const u = E(e, a);
  let t;
  return u?.arrayKeys && s !== void 0 && s > 0 && (t = u.arrayKeys[s - 1]), {
    type: "insert",
    newValue: c,
    shadowMeta: u,
    path: a,
    itemId: h,
    insertAfterId: t
  };
}
function rt(e, a) {
  const l = a.slice(0, -1), s = D(e, a);
  return Ne(e, a), ae(e, l, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: l };
}
function nt() {
  const e = /* @__PURE__ */ new Set(), a = [], l = [];
  for (const s of ne) {
    if (s.status && s.updateType) {
      l.push(s);
      continue;
    }
    const S = s, c = S.type === "cut" ? null : S.newValue;
    S.shadowMeta?.signals?.length > 0 && a.push({ shadowMeta: S.shadowMeta, displayValue: c }), Xe(
      S.stateKey,
      S.path,
      S
    ).forEach((u) => {
      e.add(u);
    });
  }
  l.length > 0 && Re(l), a.forEach(({ shadowMeta: s, displayValue: S }) => {
    Ze(s, S);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), ne = [], le = !1;
}
function at(e, a, l) {
  return (S, c, h) => {
    s(e, c, S, h);
  };
  function s(S, c, h, u) {
    let t;
    switch (u.updateType) {
      case "update":
        t = Ke(S, c, h);
        break;
      case "insert":
        t = tt(
          S,
          c,
          h,
          u.index,
          u.itemId
        );
        break;
      case "insert_many":
        t = et(S, c, h);
        break;
      case "cut":
        t = rt(S, c);
        break;
    }
    if (t === null)
      return;
    t.stateKey = S, t.path = c, ne.push(t), Ye();
    const o = {
      timeStamp: Date.now(),
      stateKey: S,
      path: c,
      updateType: u.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: u.metaData
    };
    ne.push(o), t.newValue !== void 0 && He(
      t.newValue,
      S,
      l.current,
      a
    ), l.current?.middleware && l.current.middleware({ update: o }), _e(o, u.validationTrigger || "programmatic"), Je(o);
  }
}
function ot(e, {
  stateKey: a,
  localStorage: l,
  formElements: s,
  reactiveDeps: S,
  reactiveType: c,
  componentId: h,
  defaultState: u,
  dependencies: t,
  serverState: o
} = {}) {
  const [y, $] = te({}), { sessionId: V } = me();
  let b = !a;
  const [v] = te(a ?? X()), F = x(h ?? X()), C = x(
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
        const d = R(n.localStorage.key) ? n.localStorage.key(i) : n.localStorage.key, m = oe(
          `${V}-${v}-${d}`
        );
        if (m && m.lastUpdated > (n?.serverState?.timestamp || 0))
          return {
            value: m.state,
            source: "localStorage",
            timestamp: m.lastUpdated
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
      ie(v, { serverState: n });
      const i = typeof n.merge == "object" ? n.merge : n.merge === !0 ? { strategy: "append", key: "id" } : null, f = D(v, []), d = n.data;
      if (i && i.strategy === "append" && "key" in i && Array.isArray(f) && Array.isArray(d)) {
        const m = i.key;
        if (!m) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const w = new Set(
          f.map((I) => I[m])
        ), M = d.filter(
          (I) => !w.has(I[m])
        );
        M.length > 0 && ve(v, [], M);
        const A = D(v, []);
        re(
          v,
          [],
          A,
          n.timestamp || Date.now()
        );
      } else
        K(v, d), re(
          v,
          [],
          d,
          n.timestamp || Date.now()
        );
      L(v);
    }
  }), [v]), J(() => {
    const P = p.getState().getShadowMetadata(v, []);
    if (P && P.stateSource)
      return;
    const r = N(v), n = {
      localStorageEnabled: !!r?.localStorage?.key
    };
    if (B(v, [], {
      ...P,
      features: n
    }), r?.defaultState !== void 0 || u !== void 0) {
      const m = r?.defaultState || u;
      r?.defaultState || ie(v, {
        defaultState: m
      });
    }
    const { value: i, source: f, timestamp: d } = G();
    K(v, i), B(v, [], {
      stateSource: f,
      lastServerSync: f === "server" ? d : void 0,
      isDirty: f === "server" ? !1 : void 0,
      baseServerState: f === "server" ? i : void 0
    }), f === "server" && o && ge(v, o), L(v);
  }, [v, ...t || []]), $e(() => {
    b && ie(v, {
      formElements: s,
      defaultState: u,
      localStorage: l,
      middleware: C.current?.middleware
    });
    const P = `${v}////${F.current}`, r = E(v, []), n = r?.components || /* @__PURE__ */ new Map();
    return n.set(P, {
      forceUpdate: () => $({}),
      reactiveType: c ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: S || void 0,
      deps: S ? S(D(v, [])) : [],
      prevDeps: S ? S(D(v, [])) : []
    }), B(v, [], {
      ...r,
      components: n
    }), $({}), () => {
      const i = E(v, []), f = i?.components?.get(P);
      f?.paths && f.paths.forEach((d) => {
        const w = d.split(".").slice(1), M = p.getState().getShadowMetadata(v, w);
        M?.pathComponents && M.pathComponents.size === 0 && (delete M.pathComponents, p.getState().setShadowMetadata(v, w, M));
      }), i?.components && B(v, [], i);
    };
  }, []);
  const g = at(
    v,
    V,
    C
  );
  return p.getState().initialStateGlobal[v] || he(v, e), ye(() => we(
    v,
    g,
    F.current,
    V
  ), [v, V]);
}
const st = (e, a, l) => {
  let s = E(e, a)?.arrayKeys || [];
  const S = l?.transforms;
  if (!S || S.length === 0)
    return s;
  for (const c of S)
    if (c.type === "filter") {
      const h = [];
      s.forEach((u, t) => {
        const o = D(e, [...a, u]);
        c.fn(o, t) && h.push(u);
      }), s = h;
    } else c.type === "sort" && s.sort((h, u) => {
      const t = D(e, [...a, h]), o = D(e, [...a, u]);
      return c.fn(t, o);
    });
  return s;
}, ee = (e, a, l) => {
  const s = `${e}////${a}`, c = E(e, [])?.components?.get(s);
  !c || c.reactiveType === "none" || !(Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType]).includes("component") || Fe(e, l, s);
}, Y = (e, a, l) => {
  const s = E(e, []), S = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((h, u) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), S.add(u));
  }), E(e, [
    ...a,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    s?.components?.get(h)?.forceUpdate();
  });
  const c = E(e, a);
  for (let h of c?.arrayKeys || []) {
    const u = h + ".selected", t = E(e, u.split(".").slice(1));
    h == l && t?.pathComponents?.forEach((o) => {
      s?.components?.get(o)?.forceUpdate();
    });
  }
};
function W(e, a, l) {
  const s = E(e, a), S = a.length > 0 ? a.join(".") : "root", c = l?.arrayViews?.[S];
  if (Array.isArray(c) && c.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const h = D(e, a, c);
  return {
    shadowMeta: s,
    value: h,
    arrayKeys: s?.arrayKeys
  };
}
function we(e, a, l, s) {
  const S = /* @__PURE__ */ new Map();
  function c({
    path: t = [],
    meta: o,
    componentId: y
  }) {
    const $ = o ? JSON.stringify(o.arrayViews || o.transforms) : "", V = t.join(".") + ":" + y + ":" + $;
    if (S.has(V))
      return S.get(V);
    const b = [e, ...t].join("."), v = () => {
    }, F = {
      apply(G, g, H) {
        if (H.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", n = o?.arrayViews?.[r];
          return ee(e, y, t), D(e, t, n);
        }
        const P = H[0];
        return a(P, t, { updateType: "update" }), !0;
      },
      get(G, g, H) {
        if (g === "call" || g === "apply" || g === "bind")
          return Reflect.get(G, g, H);
        if (typeof g != "string")
          return Reflect.get(G, g);
        if (t.length === 0 && g in h)
          return h[g];
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
            const r = p.getState().getInitialOptions(e), n = r?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const i = p.getState().getShadowValue(e, []), f = r?.validation?.key;
            try {
              const d = await n.action(i);
              if (d && !d.success && d.errors, d?.success) {
                const m = p.getState().getShadowMetadata(e, []);
                B(e, [], {
                  ...m,
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
            const { shadowMeta: n, value: i } = W(e, t, o);
            return n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || i !== void 0 ? "fresh" : "unknown";
          };
          return g === "$_status" ? r() : r;
        }
        if (g === "$removeStorage")
          return () => {
            const r = p.getState().initialStateGlobal[e], n = N(e), i = R(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, f = `${s}-${e}-${i}`;
            f && localStorage.removeItem(f);
          };
        if (g === "$validate")
          return () => {
            const r = p.getState(), { value: n } = W(e, t, o), i = r.getInitialOptions(e), f = i?.validation?.zodSchemaV4 || i?.validation?.zodSchemaV3;
            if (!f)
              return { success: !0, data: n };
            const d = f.safeParse(n);
            if (d.success) {
              const m = r.getShadowMetadata(e, t) || {};
              r.setShadowMetadata(e, t, {
                ...m,
                validation: {
                  status: "VALID",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            } else
              (d.error?.issues || d.error?.errors || []).forEach((w) => {
                const M = [...t, ...w.path.map(String)], A = r.getShadowMetadata(e, M) || {};
                r.setShadowMetadata(e, M, {
                  ...A,
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
            return L(e), d;
          };
        if (g === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = W(e, t, o);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (g === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            ee(e, y, [
              ...t,
              "getSelected"
            ]);
            const n = p.getState().selectedIndicesMap.get(r);
            if (!n)
              return;
            const i = t.join("."), f = o?.arrayViews?.[i], d = n.split(".").pop();
            if (!(f && !f.includes(d) || D(
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
            const n = p.getState().selectedIndicesMap.get(r);
            if (!n)
              return -1;
            const { keys: i } = U(e, t, o);
            if (!i)
              return -1;
            const f = n.split(".").pop();
            return i.indexOf(f);
          };
        if (g === "$clearSelected")
          return Y(e, t), () => {
            Le({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (g === "$map")
          return (r) => {
            const { value: n, keys: i } = U(
              e,
              t,
              o
            );
            if (ee(e, y, t), !i || !Array.isArray(n))
              return [];
            const f = c({
              path: t,
              componentId: y,
              meta: o
            });
            return n.map((d, m) => {
              const w = i[m];
              if (!w) return;
              const M = [...t, w], A = c({
                path: M,
                // This now correctly points to the item in the shadow store.
                componentId: y,
                meta: o
              });
              return r(A, m, f);
            });
          };
        if (g === "$filter")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { keys: i, value: f } = U(
              e,
              t,
              o
            );
            if (!Array.isArray(f))
              throw new Error("filter can only be used on arrays");
            const d = [];
            return f.forEach((m, w) => {
              if (r(m, w)) {
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
        if (g === "$sort")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { value: i, keys: f } = U(
              e,
              t,
              o
            );
            if (!Array.isArray(i) || !f)
              throw new Error("No array keys found for sorting");
            const d = i.map((w, M) => ({
              item: w,
              key: f[M]
            }));
            d.sort((w, M) => r(w.item, M.item));
            const m = d.map((w) => w.key);
            return c({
              path: t,
              componentId: y,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [n]: m
                },
                transforms: [
                  ...o?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (g === "$stream")
          return function(r = {}) {
            const {
              bufferSize: n = 100,
              flushInterval: i = 100,
              bufferStrategy: f = "accumulate",
              store: d,
              onFlush: m
            } = r;
            let w = [], M = !1, A = null;
            const I = (T) => {
              if (!M) {
                if (f === "sliding" && w.length >= n)
                  w.shift();
                else if (f === "dropping" && w.length >= n)
                  return;
                w.push(T), w.length >= n && k();
              }
            }, k = () => {
              if (w.length === 0) return;
              const T = [...w];
              if (w = [], d) {
                const j = d(T);
                j !== void 0 && (Array.isArray(j) ? j : [j]).forEach((pe) => {
                  a(pe, t, {
                    updateType: "insert"
                  });
                });
              } else
                T.forEach((j) => {
                  a(j, t, {
                    updateType: "insert"
                  });
                });
              m?.(T);
            };
            i > 0 && (A = setInterval(k, i));
            const O = X(), _ = E(e, t) || {}, z = _.streams || /* @__PURE__ */ new Map();
            return z.set(O, { buffer: w, flushTimer: A }), B(e, t, {
              ..._,
              streams: z
            }), {
              write: (T) => I(T),
              writeMany: (T) => T.forEach(I),
              flush: () => k(),
              pause: () => {
                M = !0;
              },
              resume: () => {
                M = !1, w.length > 0 && k();
              },
              close: () => {
                k(), A && clearInterval(A);
                const T = p.getState().getShadowMetadata(e, t);
                T?.streams && T.streams.delete(O);
              }
            };
          };
        if (g === "$list")
          return (r) => /* @__PURE__ */ Q(() => {
            const i = x(/* @__PURE__ */ new Map()), [f, d] = te({}), m = t.length > 0 ? t.join(".") : "root", w = st(e, t, o), M = ye(() => ({
              ...o,
              arrayViews: {
                ...o?.arrayViews || {},
                [m]: w
              }
            }), [o, m, w]), { value: A } = U(
              e,
              t,
              M
            );
            if (J(() => {
              const O = p.getState().subscribeToPath(b, (_) => {
                if (_.type === "GET_SELECTED")
                  return;
                const T = p.getState().getShadowMetadata(e, t)?.transformCaches;
                if (T)
                  for (const j of T.keys())
                    j.startsWith(y) && T.delete(j);
                (_.type === "INSERT" || _.type === "INSERT_MANY" || _.type === "REMOVE" || _.type === "CLEAR_SELECTION" || _.type === "SERVER_STATE_UPDATE" && !o?.serverStateIsUpStream) && d({});
              });
              return () => {
                O();
              };
            }, [y, b]), !Array.isArray(A))
              return null;
            const I = c({
              path: t,
              componentId: y,
              meta: M
              // Use updated meta here
            }), k = A.map((O, _) => {
              const z = w[_];
              if (!z)
                return null;
              let T = i.current.get(z);
              T || (T = X(), i.current.set(z, T));
              const j = [...t, z];
              return ue(De, {
                key: z,
                stateKey: e,
                itemComponentId: T,
                itemPath: j,
                localIndex: _,
                arraySetter: I,
                rebuildStateShape: c,
                renderFn: r
              });
            });
            return /* @__PURE__ */ Q(Me, { children: k });
          }, {});
        if (g === "$stateFlattenOn")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = o?.arrayViews?.[n], f = p.getState().getShadowValue(e, t, i);
            return Array.isArray(f) ? c({
              path: [...t, "[*]", r],
              componentId: y,
              meta: o
            }) : [];
          };
        if (g === "$index")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = o?.arrayViews?.[n];
            if (i) {
              const m = i[r];
              return m ? c({
                path: [...t, m],
                componentId: y,
                meta: o
              }) : void 0;
            }
            const f = E(e, t);
            if (!f?.arrayKeys) return;
            const d = f.arrayKeys[r];
            if (d)
              return c({
                path: [...t, d],
                componentId: y,
                meta: o
              });
          };
        if (g === "$last")
          return () => {
            const { keys: r } = U(e, t, o);
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
            const { value: f } = W(
              e,
              t,
              o
            ), d = R(r) ? r(f) : r;
            let m = null;
            if (!f.some((M) => {
              const A = n ? n.every(
                (I) => Z(M[I], d[I])
              ) : Z(M, d);
              return A && (m = M), A;
            }))
              a(d, t, { updateType: "insert" });
            else if (i && m) {
              const M = i(m), A = f.map(
                (I) => Z(I, m) ? M : I
              );
              a(A, t, {
                updateType: "update"
              });
            }
          };
        if (g === "$cut")
          return (r, n) => {
            const i = E(e, t);
            if (!i?.arrayKeys || i.arrayKeys.length === 0)
              return;
            const f = r === -1 ? i.arrayKeys.length - 1 : r !== void 0 ? r : i.arrayKeys.length - 1, d = i.arrayKeys[f];
            d && a(null, [...t, d], {
              updateType: "cut"
            });
          };
        if (g === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: n } = U(e, t, o);
            if (!n || n.length === 0)
              return;
            const i = p.getState().selectedIndicesMap.get(r);
            if (!i)
              return;
            const f = i.split(".").pop();
            if (!n.includes(f))
              return;
            const d = i.split(".").slice(1);
            p.getState().clearSelectedIndex({ arrayKey: r });
            const m = d.slice(0, -1);
            Y(e, m), a(null, d, {
              updateType: "cut"
            });
          };
        if (g === "$cutByValue")
          return (r) => {
            const {
              isArray: n,
              value: i,
              keys: f
            } = U(e, t, o);
            if (!n) return;
            const d = se(i, f, (m) => m === r);
            d && a(null, [...t, d.key], {
              updateType: "cut"
            });
          };
        if (g === "$toggleByValue")
          return (r) => {
            const {
              isArray: n,
              value: i,
              keys: f
            } = U(e, t, o);
            if (!n) return;
            const d = se(i, f, (m) => m === r);
            if (d) {
              const m = [...t, d.key];
              a(null, m, {
                updateType: "cut"
              });
            } else
              a(r, t, { updateType: "insert" });
          };
        if (g === "$findWith")
          return (r, n) => {
            const { isArray: i, value: f, keys: d } = U(e, t, o);
            if (!i)
              throw new Error("findWith can only be used on arrays");
            const m = se(
              f,
              d,
              (w) => w?.[r] === n
            );
            return m ? c({
              path: [...t, m.key],
              componentId: y,
              meta: o
            }) : null;
          };
        if (g === "$cutThis") {
          const { value: r } = W(e, t, o), n = t.slice(0, -1);
          return Y(e, n), () => {
            a(r, t, { updateType: "cut" });
          };
        }
        if (g === "$get")
          return () => {
            ee(e, y, t);
            const { value: r } = W(e, t, o);
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
            const i = e + "." + r.join("."), f = p.getState().selectedIndicesMap.get(i), d = e + "." + t.join(".");
            return f === d;
          }
          return;
        }
        if (g === "$setSelected")
          return (r) => {
            const n = t.slice(0, -1), i = e + "." + n.join("."), f = e + "." + t.join(".");
            Y(e, n, void 0), p.getState().selectedIndicesMap.get(i), r && p.getState().setSelectedIndex(i, f);
          };
        if (g === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), n = e + "." + r.join("."), i = e + "." + t.join(".");
            p.getState().selectedIndicesMap.get(n) === i ? p.getState().clearSelectedIndex({ arrayKey: n }) : p.getState().setSelectedIndex(n, i), Y(e, r);
          };
        if (g === "$clearValidation")
          return (r) => {
            const n = r ? [...t, ...r] : t, i = p.getState(), f = i.getShadowNode(e, n);
            if (console.log("startNode ", f), !f) return;
            const d = [[f, n]];
            for (console.log("stack ", d); d.length > 0; ) {
              const [m, w] = d.pop();
              if (console.log("while (stack.length ", m, w), !m || typeof m != "object") continue;
              if (m._meta?.validation) {
                m._meta.validation = {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now(),
                  validatedValue: void 0
                };
                const A = [e, ...w].join(".");
                i.notifyPathSubscribers(A, {
                  type: "VALIDATION_CLEAR"
                });
              }
              const M = Object.keys(m);
              for (const A of M)
                A !== "_meta" && d.push([m[A], [...w, A]]);
            }
            L(e);
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
            return (r) => Ge(e, t)?.get(r);
          if (g === "$addPluginMetaData")
            return (r, n) => qe(e, t, r, n);
          if (g === "$removePluginMetaData")
            return (r) => xe(e, t, r);
          if (g === "$addZodValidation")
            return (r, n) => {
              r.forEach((i) => {
                const f = p.getState().getShadowMetadata(e, i.path) || {};
                p.getState().setShadowMetadata(e, i.path, {
                  ...f,
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
                const f = E(e, r.path);
                if (f?.arrayKeys) {
                  const d = f.arrayKeys.indexOf(
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
              const n = p.getState(), i = n.getShadowMetadata(e, []);
              if (!i?.components) return;
              const f = (m) => !m || m === "/" ? [] : m.split("/").slice(1).map((w) => w.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const m of r) {
                const w = f(m.path);
                switch (m.op) {
                  case "add":
                  case "replace": {
                    const { value: M } = m;
                    n.updateShadowAtPath(e, w, M), n.markAsDirty(e, w, { bubble: !0 });
                    let A = [...w];
                    for (; ; ) {
                      const I = n.getShadowMetadata(
                        e,
                        A
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((k) => {
                        if (!d.has(k)) {
                          const O = i.components?.get(k);
                          O && (O.forceUpdate(), d.add(k));
                        }
                      }), A.length === 0) break;
                      A.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const M = w.slice(0, -1);
                    n.removeShadowArrayElement(e, w), n.markAsDirty(e, M, { bubble: !0 });
                    let A = [...M];
                    for (; ; ) {
                      const I = n.getShadowMetadata(
                        e,
                        A
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((k) => {
                        if (!d.has(k)) {
                          const O = i.components?.get(k);
                          O && (O.forceUpdate(), d.add(k));
                        }
                      }), A.length === 0) break;
                      A.pop();
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
          }) => /* @__PURE__ */ Q(
            Ie,
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
              const n = p.getState().getShadowMetadata(e, t);
              B(e, t, {
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
        if (g === "$toggle") {
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
        if (g === "$isolate")
          return (r, n) => {
            const i = Array.isArray(r), f = i ? r : void 0, d = i ? n : r;
            if (!d || typeof d != "function")
              throw new Error(
                "CogsState: $isolate requires a render function."
              );
            return /* @__PURE__ */ Q(
              Pe,
              {
                stateKey: e,
                path: t,
                dependencies: f,
                rebuildStateShape: c,
                renderFn: d
              }
            );
          };
        if (g === "$formElement")
          return (r, n) => /* @__PURE__ */ Q(
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
    }, C = new Proxy(v, F);
    return S.set(V, C), C;
  }
  const h = {
    $revertToInitialState: (t) => {
      const o = p.getState().getShadowMetadata(e, []);
      let y;
      o?.stateSource === "server" && o.baseServerState ? y = o.baseServerState : y = p.getState().initialStateGlobal[e], ze(e), K(e, y), c({
        path: [],
        componentId: l
      });
      const $ = N(e), V = R($?.localStorage?.key) ? $?.localStorage?.key(y) : $?.localStorage?.key, b = `${s}-${e}-${V}`;
      return b && localStorage.removeItem(b), L(e), y;
    },
    $initializeAndMergeShadowState: (t) => {
      Oe(e, t), L(e);
    },
    $updateInitialState: (t) => {
      const o = we(
        e,
        a,
        l,
        s
      ), y = p.getState().initialStateGlobal[e], $ = N(e), V = R($?.localStorage?.key) ? $?.localStorage?.key(y) : $?.localStorage?.key, b = `${s}-${e}-${V}`;
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
  const a = x(null), l = x(null), s = x(!1), S = `${e._stateKey}-${e._path.join(".")}`, c = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[c], u = D(e._stateKey, e._path, h);
  return J(() => {
    const t = a.current;
    if (!t || s.current) return;
    const o = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", S);
        return;
      }
      const y = t.parentElement, V = Array.from(y.childNodes).indexOf(t);
      let b = y.getAttribute("data-parent-id");
      b || (b = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", b)), l.current = `instance-${crypto.randomUUID()}`;
      const v = p.getState().getShadowMetadata(e._stateKey, e._path) || {}, F = v.signals || [];
      F.push({
        instanceId: l.current,
        parentId: b,
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
        } catch (g) {
          console.error("Error evaluating effect function:", g);
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
    "data-signal-id": S
  });
}
export {
  Se as $cogsSignal,
  wt as addStateOptions,
  pt as createCogsState,
  ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
