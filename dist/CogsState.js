"use client";
import { jsx as Q, Fragment as Pe } from "react/jsx-runtime";
import { pluginStore as R } from "./pluginStore.js";
import { useState as te, useRef as q, useCallback as Te, useEffect as x, useLayoutEffect as ke, useMemo as pe, createElement as fe, startTransition as Ie } from "react";
import { transformStateFunc as De, isFunction as z, isDeepEqual as Z, isArray as Ce, getDifferences as _e } from "./utility.js";
import { ValidationWrapper as Oe, IsolatedComponentWrapper as je, FormElementWrapper as Ne, MemoizedCogsItemWrapper as Ue } from "./Components.js";
import Fe from "superjson";
import { v4 as re } from "uuid";
import { getGlobalStore as p, updateShadowTypeInfo as Se } from "./store.js";
import { useCogsConfig as Ae } from "./CogsStateClient.js";
import { runValidation as Re } from "./validation.js";
const {
  getInitialOptions: U,
  updateInitialStateGlobal: Me,
  getShadowMetadata: $,
  setShadowMetadata: L,
  getShadowValue: D,
  initializeShadowState: X,
  initializeAndMergeShadowState: ze,
  updateShadowAtPath: Le,
  insertShadowArrayElement: We,
  insertManyShadowArrayElements: be,
  removeShadowArrayElement: Be,
  setInitialStateOptions: ge,
  setServerStateUpdate: ye,
  markAsDirty: oe,
  addPathComponent: Ge,
  clearSelectedIndexesForState: qe,
  addStateLog: xe,
  clearSelectedIndex: Je,
  getSyncInfo: He,
  notifyPathSubscribers: Qe,
  getPluginMetaDataMap: me,
  setPluginMetaData: he,
  removePluginMetaData: ve
} = p.getState(), { notifyUpdate: Ye } = R.getState();
function N(e, n, l) {
  const i = $(e, n);
  if (!!!i?.arrayKeys)
    return { isArray: !1, value: p.getState().getShadowValue(e, n), keys: [] };
  const c = n.length > 0 ? n.join(".") : "root", m = l?.arrayViews?.[c] ?? i.arrayKeys;
  return Array.isArray(m) && m.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: p.getState().getShadowValue(e, n, m), keys: m ?? [] };
}
function se(e, n, l) {
  for (let i = 0; i < e.length; i++)
    if (l(e[i], i)) {
      const f = n[i];
      if (f)
        return { key: f, index: i, value: e[i] };
    }
  return null;
}
function ce(e, n) {
  const i = {
    ...U(e) || {},
    ...n
  };
  (i.validation?.zodSchemaV4 || i.validation?.zodSchemaV3) && !i.validation?.onBlur && (i.validation.onBlur = "error"), ge(e, i);
}
function ue({
  stateKey: e,
  options: n,
  initialOptionsPart: l
}) {
  const i = U(e) || {}, f = l[e] || {};
  let c = { ...f, ...i }, m = !1;
  if (n) {
    const y = (t, a) => {
      for (const d in a)
        a.hasOwnProperty(d) && (a[d] instanceof Object && !Array.isArray(a[d]) && t[d] instanceof Object ? Z(t[d], a[d]) || (y(t[d], a[d]), m = !0) : t[d] !== a[d] && (t[d] = a[d], m = !0));
      return t;
    };
    c = y(c, n);
  }
  if (c.validation && (n?.validation?.hasOwnProperty("onBlur") || i?.validation?.hasOwnProperty("onBlur") || f?.validation?.hasOwnProperty("onBlur") || (c.validation.onBlur = "error", m = !0)), m) {
    ge(e, c);
    const y = i?.validation?.zodSchemaV4 || i?.validation?.zodSchemaV3, t = c.validation?.zodSchemaV4 && !i?.validation?.zodSchemaV4, a = c.validation?.zodSchemaV3 && !i?.validation?.zodSchemaV3;
    !y && (t || a) && (t ? Se(
      e,
      c.validation.zodSchemaV4,
      "zod4"
    ) : a && Se(
      e,
      c.validation.zodSchemaV3,
      "zod3"
    ), W(e));
  }
  return c;
}
const $t = (e, n) => {
  n?.plugins && R.getState().setRegisteredPlugins(n.plugins);
  const l = {};
  if (n?.plugins)
    for (const a of n.plugins)
      typeof a.initialState == "function" && Object.assign(l, a.initialState());
  const i = { ...l, ...e }, [f, c] = De(i);
  Object.keys(f).forEach((a) => {
    let d = {};
    n?.formElements && (d.formElements = n.formElements), d.validation = {
      onBlur: "error",
      ...n?.validation
    };
    const E = U(a), b = E ? {
      ...E,
      formElements: n?.formElements,
      validation: {
        ...E.validation,
        ...d.validation
      }
    } : d;
    Object.keys(b).length > 0 && ge(a, b);
  }), Object.keys(f).forEach((a) => {
    X(a, f[a]);
  });
  const m = (a, d) => {
    const [E] = te(d?.componentId ?? re()), b = ue({
      stateKey: a,
      options: d,
      initialOptionsPart: c
    }), V = q(b);
    V.current = b;
    const v = D(a, []) || f[a], C = ct(v, {
      stateKey: a,
      syncUpdate: d?.syncUpdate,
      componentId: E,
      localStorage: d?.localStorage,
      middleware: d?.middleware,
      reactiveType: d?.reactiveType,
      reactiveDeps: d?.reactiveDeps,
      defaultState: d?.defaultState,
      dependencies: d?.dependencies,
      serverState: d?.serverState
    });
    return x(() => {
      d && R.getState().setPluginOptionsForState(a, d);
    }, [a, d]), x(() => (R.getState().registerStateHandler(a, C), () => {
      R.getState().unregisterStateHandler(a);
    }), [a, C]), C;
  };
  function y(a, d) {
    if (ue({ stateKey: a, options: d, initialOptionsPart: c }), d.localStorage && Xe(a, d), d.formElements) {
      const b = R.getState().registeredPlugins.map((V) => d.formElements.hasOwnProperty(V.name) ? {
        ...V,
        formWrapper: d.formElements[V.name]
      } : V);
      R.getState().setRegisteredPlugins(b);
    }
    W(a);
  }
  function t(a) {
    Object.keys(f).forEach((E) => {
      y(E, a);
    });
  }
  return {
    useCogsState: m,
    setCogsOptionsByKey: y,
    setCogsOptions: t
  };
}, Ze = (e, n, l, i, f) => {
  l?.log && console.log(
    "saving to localstorage",
    n,
    l.localStorage?.key,
    i
  );
  const c = z(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (c && i) {
    const m = `${i}-${n}-${c}`;
    let y;
    try {
      y = ie(m)?.lastSyncedWithServer;
    } catch {
    }
    const t = $(n, []), a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, d = Fe.serialize(a);
    window.localStorage.setItem(
      m,
      JSON.stringify(d.json)
    );
  }
}, ie = (e) => {
  if (!e) return null;
  try {
    const n = window.localStorage.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch (n) {
    return console.error("Error loading from localStorage:", n), null;
  }
}, le = (e) => {
  if (e)
    try {
      typeof window < "u" && window.localStorage && window.localStorage.removeItem(e);
    } catch (n) {
      console.error("Error removing from localStorage:", n);
    }
}, Xe = (e, n) => {
  const l = D(e, []), { sessionId: i } = Ae(), f = z(n?.localStorage?.key) ? n.localStorage.key(l) : n?.localStorage?.key;
  if (f && i) {
    const c = ie(
      `${i}-${e}-${f}`
    );
    if (c && c.lastUpdated > (c.lastSyncedWithServer || 0))
      return W(e), !0;
  }
  return !1;
}, W = (e) => {
  const n = $(e, []);
  if (!n) return;
  const l = /* @__PURE__ */ new Set();
  n?.components?.forEach((i) => {
    (i ? Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"] : null)?.includes("none") || l.add(() => i.forceUpdate());
  }), queueMicrotask(() => {
    l.forEach((i) => i());
  });
};
function ne(e, n, l, i) {
  const f = $(e, n);
  if (L(e, n, {
    ...f,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: i || Date.now()
  }), Array.isArray(l)) {
    const c = $(e, n);
    c?.arrayKeys && c.arrayKeys.forEach((m, y) => {
      const t = [...n, m], a = l[y];
      a !== void 0 && ne(
        e,
        t,
        a,
        i
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((c) => {
    const m = [...n, c], y = l[c];
    ne(e, m, y, i);
  });
}
let ae = [], de = !1;
function Ke() {
  de || (de = !0, queueMicrotask(() => {
    it();
  }));
}
function et(e, n) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: i, effect: f }) => {
    const c = document.querySelector(`[data-parent-id="${l}"]`);
    if (!c) return;
    const m = Array.from(c.childNodes);
    if (!m[i]) return;
    let y = n;
    if (f && n !== null)
      try {
        y = new Function("state", `return (${f})(state)`)(
          n
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    y !== null && typeof y == "object" && (y = JSON.stringify(y)), m[i].textContent = String(y ?? "");
  });
}
function tt(e, n, l) {
  const i = $(e, []);
  if (!i?.components)
    return /* @__PURE__ */ new Set();
  const f = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let c = [...n];
    for (; ; ) {
      const m = $(e, c);
      if (m?.pathComponents && m.pathComponents.forEach((y) => {
        const t = i.components?.get(y);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || f.add(t));
      }), c.length === 0) break;
      c.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Ce(l.newValue) && _e(l.newValue, l.oldValue).forEach((y) => {
      const t = y.split("."), a = [...n, ...t], d = $(e, a);
      d?.pathComponents && d.pathComponents.forEach((E) => {
        const b = i.components?.get(E);
        b && ((Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"]).includes("none") || f.add(b));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    let m = [...l.type === "insert" ? n : n.slice(0, -1)];
    for (; ; ) {
      const y = $(e, m);
      if (y?.pathComponents && y.pathComponents.forEach((t) => {
        const a = i.components?.get(t);
        a && f.add(a);
      }), m.length === 0) break;
      m.pop();
    }
  }
  return f;
}
function rt(e, n, l) {
  const i = p.getState().getShadowValue(e, n), f = z(l) ? l(i) : l;
  if (Z(i, f))
    return null;
  Le(e, n, f), oe(e, n, { bubble: !0 });
  const c = $(e, n);
  return {
    type: "update",
    oldValue: i,
    newValue: f,
    shadowMeta: c
  };
}
function nt(e, n, l) {
  be(e, n, l), oe(e, n, { bubble: !0 });
  const i = $(e, n);
  return {
    type: "insert_many",
    count: l.length,
    shadowMeta: i,
    path: n
  };
}
function at(e, n, l, i, f) {
  let c;
  if (z(l)) {
    const { value: a } = j(e, n);
    c = l({ state: a });
  } else
    c = l;
  const m = We(
    e,
    n,
    c,
    i,
    f
  );
  oe(e, n, { bubble: !0 });
  const y = $(e, n);
  let t;
  return y?.arrayKeys && i !== void 0 && i > 0 && (t = y.arrayKeys[i - 1]), {
    type: "insert",
    newValue: c,
    shadowMeta: y,
    path: n,
    itemId: m,
    insertAfterId: t
  };
}
function ot(e, n) {
  const l = n.slice(0, -1), i = D(e, n);
  return Be(e, n), oe(e, l, { bubble: !0 }), { type: "cut", oldValue: i, parentPath: l };
}
function it() {
  const e = /* @__PURE__ */ new Set(), n = [], l = [];
  for (const i of ae) {
    if (i.status && i.updateType) {
      l.push(i);
      continue;
    }
    const f = i, c = f.type === "cut" ? null : f.newValue;
    f.shadowMeta?.signals?.length > 0 && n.push({ shadowMeta: f.shadowMeta, displayValue: c }), tt(
      f.stateKey,
      f.path,
      f
    ).forEach((y) => {
      e.add(y);
    });
  }
  l.length > 0 && xe(l), n.forEach(({ shadowMeta: i, displayValue: f }) => {
    et(i, f);
  }), e.forEach((i) => {
    i.forceUpdate();
  }), ae = [], de = !1;
}
function st(e, n, l) {
  return (f, c, m) => {
    i(e, c, f, m);
  };
  function i(f, c, m, y) {
    let t;
    switch (y.updateType) {
      case "update":
        t = rt(f, c, m);
        break;
      case "insert":
        t = at(
          f,
          c,
          m,
          y.index,
          y.itemId
        );
        break;
      case "insert_many":
        t = nt(f, c, m);
        break;
      case "cut":
        t = ot(f, c);
        break;
    }
    if (t === null)
      return;
    t.stateKey = f, t.path = c, ae.push(t), Ke();
    const a = {
      timeStamp: Date.now(),
      stateKey: f,
      path: c,
      updateType: y.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: y.metaData
    };
    ae.push(a), t.newValue !== void 0 && Ze(
      t.newValue,
      f,
      l.current,
      n
    ), l.current?.middleware && l.current.middleware({ update: a }), Re(a, y.validationTrigger || "programmatic"), Ye(a);
  }
}
function ct(e, {
  stateKey: n,
  localStorage: l,
  formElements: i,
  reactiveDeps: f,
  reactiveType: c,
  componentId: m,
  defaultState: y,
  dependencies: t,
  serverState: a
} = {}) {
  const [d, E] = te({}), { sessionId: b } = Ae();
  let V = !n;
  const [v] = te(n ?? re()), C = q(m ?? re()), _ = q(
    null
  );
  _.current = U(v) ?? null;
  const J = Te(
    (T) => {
      const r = T ? { ...U(v), ...T } : U(v), o = r?.defaultState || y || e;
      if (r?.serverState?.status === "success" && r?.serverState?.data !== void 0)
        return {
          value: r.serverState.data,
          source: "server",
          timestamp: r.serverState.timestamp || Date.now()
        };
      if (r?.localStorage?.key && b) {
        const S = z(r.localStorage.key) ? r.localStorage.key(o) : r.localStorage.key, u = ie(
          `${b}-${v}-${S}`
        );
        if (u && u.lastUpdated > (r?.serverState?.timestamp || 0))
          return {
            value: u.state,
            source: "localStorage",
            timestamp: u.lastUpdated
          };
      }
      return {
        value: o || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [v, y, e, b]
  );
  x(() => {
    a && a.status === "success" && a.data !== void 0 && ye(v, a);
  }, [a, v]), x(() => p.getState().subscribeToPath(v, (k) => {
    if (k?.type === "SERVER_STATE_UPDATE") {
      const r = k.serverState;
      if (r?.status !== "success" || r.data === void 0)
        return;
      ce(v, { serverState: r });
      const o = typeof r.merge == "object" ? r.merge : r.merge === !0 ? { strategy: "append", key: "id" } : null, s = D(v, []), S = r.data;
      if (o && o.strategy === "append" && "key" in o && Array.isArray(s) && Array.isArray(S)) {
        const u = o.key;
        if (!u) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const h = new Set(
          s.map((M) => M[u])
        ), w = S.filter(
          (M) => !h.has(M[u])
        );
        w.length > 0 && be(v, [], w);
        const A = D(v, []);
        ne(
          v,
          [],
          A,
          r.timestamp || Date.now()
        );
      } else
        X(v, S), ne(
          v,
          [],
          S,
          r.timestamp || Date.now()
        );
      W(v);
    }
  }), [v]), x(() => {
    const T = p.getState().getShadowMetadata(v, []);
    if (T && T.stateSource)
      return;
    const k = U(v), r = {
      localStorageEnabled: !!k?.localStorage?.key
    };
    if (L(v, [], {
      ...T,
      features: r
    }), k?.defaultState !== void 0 || y !== void 0) {
      const u = k?.defaultState || y;
      k?.defaultState || ce(v, {
        defaultState: u
      });
    }
    const { value: o, source: s, timestamp: S } = J();
    X(v, o), L(v, [], {
      stateSource: s,
      lastServerSync: s === "server" ? S : void 0,
      isDirty: s === "server" ? !1 : void 0,
      baseServerState: s === "server" ? o : void 0
    }), s === "server" && a && ye(v, a), W(v);
  }, [v, ...t || []]), ke(() => {
    V && ce(v, {
      formElements: i,
      defaultState: y,
      localStorage: l,
      middleware: _.current?.middleware
    });
    const T = `${v}////${C.current}`, k = $(v, []), r = k?.components || /* @__PURE__ */ new Map();
    return r.set(T, {
      forceUpdate: () => E({}),
      reactiveType: c ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: f || void 0,
      deps: f ? f(D(v, [])) : [],
      prevDeps: f ? f(D(v, [])) : []
    }), L(v, [], {
      ...k,
      components: r
    }), E({}), () => {
      const o = $(v, []), s = o?.components?.get(T);
      s?.paths && s.paths.forEach((S) => {
        const h = S.split(".").slice(1), w = p.getState().getShadowMetadata(v, h);
        w?.pathComponents && w.pathComponents.size === 0 && (delete w.pathComponents, p.getState().setShadowMetadata(v, h, w));
      }), o?.components && L(v, [], o);
    };
  }, []);
  const G = st(
    v,
    b,
    _
  );
  return p.getState().initialStateGlobal[v] || Me(v, e), pe(() => Ve(
    v,
    G,
    C.current,
    b
  ), [v, b]);
}
const lt = (e, n, l) => {
  let i = $(e, n)?.arrayKeys || [];
  const f = l?.transforms;
  if (!f || f.length === 0)
    return i;
  for (const c of f)
    if (c.type === "filter") {
      const m = [];
      i.forEach((y, t) => {
        const a = D(e, [...n, y]);
        c.fn(a, t) && m.push(y);
      }), i = m;
    } else c.type === "sort" && i.sort((m, y) => {
      const t = D(e, [...n, m]), a = D(e, [...n, y]);
      return c.fn(t, a);
    });
  return i;
}, ee = (e, n, l) => {
  const i = `${e}////${n}`, c = $(e, [])?.components?.get(i);
  !c || c.reactiveType === "none" || !(Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType]).includes("component") || Ge(e, l, i);
}, Y = (e, n, l) => {
  const i = $(e, []), f = /* @__PURE__ */ new Set();
  i?.components && i.components.forEach((m, y) => {
    (Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"]).includes("all") && (m.forceUpdate(), f.add(y));
  }), $(e, [
    ...n,
    "getSelected"
  ])?.pathComponents?.forEach((m) => {
    i?.components?.get(m)?.forceUpdate();
  });
  const c = $(e, n);
  for (let m of c?.arrayKeys || []) {
    const y = m + ".selected", t = $(e, y.split(".").slice(1));
    m == l && t?.pathComponents?.forEach((a) => {
      i?.components?.get(a)?.forceUpdate();
    });
  }
};
function j(e, n, l) {
  const i = $(e, n), f = n.length > 0 ? n.join(".") : "root", c = l?.arrayViews?.[f];
  if (Array.isArray(c) && c.length === 0)
    return {
      shadowMeta: i,
      value: [],
      arrayKeys: i?.arrayKeys
    };
  const m = D(e, n, c);
  return {
    shadowMeta: i,
    value: m,
    arrayKeys: i?.arrayKeys
  };
}
function ut(e, n) {
  return n ? e.length !== n.length ? !1 : n.every((l, i) => l === "*" || l === e[i]) : !0;
}
function dt(e, n) {
  return n === "any" ? !0 : n === "array" ? Array.isArray(e) : n === "boolean" ? typeof e == "boolean" : n === "object" ? e !== null && typeof e == "object" && !Array.isArray(e) : n === "primitive" ? e === null || typeof e != "object" && !Array.isArray(e) : !1;
}
function $e(e, n) {
  const l = p.getState().getShadowMetadata(e, n);
  if (!l?.clientActivityState?.elements) return [];
  const i = [];
  return l.clientActivityState.elements.forEach((f) => {
    f.domRef?.current && i.push(f.domRef);
  }), i;
}
function Ee(e, n) {
  return $e(e, n).map((i) => i.current).filter(Boolean);
}
function ft(e, n, l) {
  Ee(e, n).forEach((i) => {
    if ("disabled" in i) {
      i.disabled = l;
      return;
    }
    i.style.pointerEvents = l ? "none" : "", i.setAttribute("aria-disabled", String(l));
  });
}
function Ve(e, n, l, i) {
  const f = /* @__PURE__ */ new Map();
  function c({
    path: t = [],
    meta: a,
    componentId: d
  }) {
    if ($(e, t)?.isRaw)
      return D(e, t);
    const b = a ? JSON.stringify(a.arrayViews || a.transforms) : "", V = t.join(".") + ":" + d + ":" + b;
    if (f.has(V))
      return f.get(V);
    const v = [e, ...t].join("."), C = () => {
    }, _ = {
      apply(G, g, T) {
        if (T.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", o = a?.arrayViews?.[r];
          return ee(e, d, t), D(e, t, o);
        }
        const k = T[0];
        return n(k, t, { updateType: "update" }), !0;
      },
      get(G, g, T) {
        if (g === Symbol.toPrimitive)
          return (r) => r === "number" ? NaN : r === "string" ? `[CogsState: ${t.join(".") || "root"}]` : null;
        if (g === Symbol.toStringTag)
          return "CogsState";
        if (g === Symbol.iterator) {
          const { value: r } = j(e, t, a);
          return Array.isArray(r) ? function* () {
            for (let o = 0; o < r.length; o++)
              yield r[o];
          } : void 0;
        }
        if (g === "call" || g === "apply" || g === "bind")
          return Reflect.get(G, g, T);
        if (typeof g != "string")
          return Reflect.get(G, g);
        if (t.length === 0 && g in m)
          return m[g];
        if (typeof g == "string" && !g.startsWith("$")) {
          const { value: r } = j(e, t, a);
          if (r !== null && typeof r == "object" && !Array.isArray(r) && Object.prototype.hasOwnProperty.call(r, g)) {
            const u = [...t, g];
            return c({
              path: u,
              componentId: d,
              meta: a
            });
          }
          const s = R.getState().registeredPlugins;
          for (const u of s) {
            const h = u.chainMethods?.[g];
            if (h && ut(t, h.pathPattern) && dt(r, h.target))
              return (...w) => {
                const A = R.getState(), M = A.pluginOptions.get(e)?.get(u.name), I = A.getHookResult(e, u.name);
                return h.handler(
                  {
                    stateKey: e,
                    path: t,
                    pluginName: u.name,
                    options: M,
                    hookData: I,
                    $get: () => j(e, t, a).value,
                    $update: (P) => (n(P, t, {
                      updateType: "update"
                    }), {
                      synced: () => {
                        const O = p.getState().getShadowMetadata(e, t);
                        L(e, t, {
                          ...O,
                          isDirty: !1,
                          stateSource: "server",
                          lastServerSync: Date.now()
                        });
                      }
                    }),
                    $applyOperation: (P, O) => {
                      n(P.newValue, P.path, {
                        updateType: P.updateType,
                        itemId: P.itemId,
                        metaData: O
                      });
                    },
                    getFieldMetaData: () => me(e, t)?.get(u.name),
                    setFieldMetaData: (P) => he(e, t, u.name, P),
                    removeFieldMetaData: () => ve(e, t, u.name),
                    getFieldRefs: () => $e(e, t),
                    getFieldElements: () => Ee(e, t),
                    setFieldDisabled: (P) => ft(e, t, P)
                  },
                  ...w
                );
              };
          }
          const S = [...t, g];
          return c({
            path: S,
            componentId: d,
            meta: a
          });
        }
        if (g === "$_rebuildStateShape")
          return c;
        if (g === "$sync" && t.length === 0)
          return async function() {
            const r = p.getState().getInitialOptions(e), o = r?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const s = p.getState().getShadowValue(e, []), S = r?.validation?.key;
            try {
              const u = await o.action(s);
              if (u && !u.success && u.errors, u?.success) {
                const h = p.getState().getShadowMetadata(e, []);
                L(e, [], {
                  ...h,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: s
                  // Update base server state
                }), o.onSuccess && o.onSuccess(u.data);
              } else !u?.success && o.onError && o.onError(u.error);
              return u;
            } catch (u) {
              return o.onError && o.onError(u), { success: !1, error: u };
            }
          };
        if (g === "$_status" || g === "$getStatus") {
          const r = () => {
            const { shadowMeta: o, value: s } = j(e, t, a);
            return o?.isDirty === !0 ? "dirty" : o?.stateSource === "server" || o?.isDirty === !1 ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" || s !== void 0 ? "fresh" : "unknown";
          };
          return g === "$_status" ? r() : r;
        }
        if (g === "$removeStorage")
          return () => {
            const r = p.getState().initialStateGlobal[e], o = U(e), s = z(o?.localStorage?.key) ? o.localStorage.key(r) : o?.localStorage?.key, S = i && s ? `${i}-${e}-${s}` : void 0;
            le(S);
          };
        if (g === "$setRaw")
          return (r) => {
            const o = $(e, t) || {};
            L(e, t, { ...o, isRaw: !0 }), n(r, t, { updateType: "update" });
          };
        if (g === "$validate")
          return () => {
            const r = p.getState(), { value: o } = j(e, t, a), s = r.getInitialOptions(e), S = s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3;
            if (!S)
              return { success: !0, data: o };
            const u = S.safeParse(o);
            if (u.success) {
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
              (u.error?.issues || u.error?.errors || []).forEach((w) => {
                const A = [...t, ...w.path.map(String)], M = r.getShadowMetadata(e, A) || {};
                r.setShadowMetadata(e, A, {
                  ...M,
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
                    validatedValue: r.getShadowValue(e, A)
                  }
                });
              });
            return W(e), u;
          };
        if (g === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = j(e, t, a);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((o) => o.severity === "error").map((o) => o.message) : [];
          };
        if (g === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            ee(e, d, [
              ...t,
              "getSelected"
            ]);
            const o = p.getState().selectedIndicesMap.get(r);
            if (!o)
              return;
            const s = t.join("."), S = a?.arrayViews?.[s], u = o.split(".").pop();
            if (!(S && !S.includes(u) || D(
              e,
              o.split(".").slice(1)
            ) === void 0))
              return c({
                path: o.split(".").slice(1),
                componentId: d,
                meta: a
              });
          };
        if (g === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const o = p.getState().selectedIndicesMap.get(r);
            if (!o)
              return -1;
            const { keys: s } = N(e, t, a);
            if (!s)
              return -1;
            const S = o.split(".").pop();
            return s.indexOf(S);
          };
        if (g === "$clearSelected")
          return Y(e, t), () => {
            Je({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (g === "$map")
          return (r) => {
            const { value: o, keys: s } = N(
              e,
              t,
              a
            );
            if (ee(e, d, t), !s || !Array.isArray(o))
              return [];
            const S = c({
              path: t,
              componentId: d,
              meta: a
            });
            return o.map((u, h) => {
              const w = s[h];
              if (!w) return;
              const A = [...t, w], M = c({
                path: A,
                // This now correctly points to the item in the shadow store.
                componentId: d,
                meta: a
              });
              return r(M, h, S);
            });
          };
        if (g === "$filter")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", { keys: s, value: S } = N(
              e,
              t,
              a
            );
            if (!Array.isArray(S))
              throw new Error("filter can only be used on arrays");
            const u = [];
            return S.forEach((h, w) => {
              if (r(h, w)) {
                const A = s[w];
                A && u.push(A);
              }
            }), c({
              path: t,
              componentId: d,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [o]: u
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "filter", fn: r, path: t }
                ]
              }
            });
          };
        if (g === "$sort")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", { value: s, keys: S } = N(
              e,
              t,
              a
            );
            if (!Array.isArray(s) || !S)
              throw new Error("No array keys found for sorting");
            const u = s.map((w, A) => ({
              item: w,
              key: S[A]
            }));
            u.sort((w, A) => r(w.item, A.item));
            const h = u.map((w) => w.key);
            return c({
              path: t,
              componentId: d,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [o]: h
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (g === "$list")
          return (r) => /* @__PURE__ */ Q(() => {
            const s = q(/* @__PURE__ */ new Map()), [S, u] = te({}), h = t.length > 0 ? t.join(".") : "root", w = lt(e, t, a), A = pe(() => ({
              ...a,
              arrayViews: {
                ...a?.arrayViews || {},
                [h]: w
              }
            }), [a, h, w]), { value: M } = N(
              e,
              t,
              A
            );
            if (x(() => {
              const O = p.getState().subscribeToPath(v, (F) => {
                if (F.type === "GET_SELECTED")
                  return;
                const B = p.getState().getShadowMetadata(e, t)?.transformCaches;
                if (B)
                  for (const K of B.keys())
                    K.startsWith(d) && B.delete(K);
                (F.type === "INSERT" || F.type === "INSERT_MANY" || F.type === "REMOVE" || F.type === "CLEAR_SELECTION" || F.type === "SERVER_STATE_UPDATE" && !a?.serverStateIsUpStream) && u({});
              });
              return () => {
                O();
              };
            }, [d, v]), !Array.isArray(M))
              return null;
            const I = c({
              path: t,
              componentId: d,
              meta: A
              // Use updated meta here
            }), P = M.map((O, F) => {
              const H = w[F];
              if (!H)
                return null;
              let B = s.current.get(H);
              B || (B = re(), s.current.set(H, B));
              const K = [...t, H];
              return fe(Ue, {
                key: H,
                stateKey: e,
                itemComponentId: B,
                itemPath: K,
                localIndex: F,
                arraySetter: I,
                rebuildStateShape: c,
                renderFn: r
              });
            });
            return /* @__PURE__ */ Q(Pe, { children: P });
          }, {});
        if (g === "$stateFlattenOn")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", s = a?.arrayViews?.[o], S = p.getState().getShadowValue(e, t, s);
            return Array.isArray(S) ? c({
              path: [...t, "[*]", r],
              componentId: d,
              meta: a
            }) : [];
          };
        if (g === "$index")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", s = a?.arrayViews?.[o];
            if (s) {
              const h = s[r];
              return h ? c({
                path: [...t, h],
                componentId: d,
                meta: a
              }) : void 0;
            }
            const S = $(e, t);
            if (!S?.arrayKeys) return;
            const u = S.arrayKeys[r];
            if (u)
              return c({
                path: [...t, u],
                componentId: d,
                meta: a
              });
          };
        if (g === "$last")
          return () => {
            const { keys: r } = N(e, t, a);
            if (!r || r.length === 0)
              return;
            const o = r[r.length - 1];
            if (!o)
              return;
            const s = [...t, o];
            return c({
              path: s,
              componentId: d,
              meta: a
            });
          };
        if (g === "$insert")
          return (r, o) => {
            n(r, t, {
              updateType: "insert",
              index: o
            });
          };
        if (g === "$insertMany")
          return (r) => {
            n(r, t, {
              updateType: "insert_many"
            });
          };
        if (g === "$uniqueInsert")
          return (r, o, s) => {
            const { value: S } = j(
              e,
              t,
              a
            ), u = z(r) ? r(S) : r;
            let h = null;
            if (!S.some((A) => {
              const M = o ? o.every(
                (I) => Z(A[I], u[I])
              ) : Z(A, u);
              return M && (h = A), M;
            }))
              n(u, t, { updateType: "insert" });
            else if (s && h) {
              const A = s(h), M = S.map(
                (I) => Z(I, h) ? A : I
              );
              n(M, t, {
                updateType: "update"
              });
            }
          };
        if (g === "$cut")
          return (r, o) => {
            const s = $(e, t);
            if (!s?.arrayKeys || s.arrayKeys.length === 0)
              return;
            const S = r === -1 ? s.arrayKeys.length - 1 : r !== void 0 ? r : s.arrayKeys.length - 1, u = s.arrayKeys[S];
            u && n(null, [...t, u], {
              updateType: "cut"
            });
          };
        if (g === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: o } = N(e, t, a);
            if (!o || o.length === 0)
              return;
            const s = p.getState().selectedIndicesMap.get(r);
            if (!s)
              return;
            const S = s.split(".").pop();
            if (!o.includes(S))
              return;
            const u = s.split(".").slice(1);
            p.getState().clearSelectedIndex({ arrayKey: r });
            const h = u.slice(0, -1);
            Y(e, h), n(null, u, {
              updateType: "cut"
            });
          };
        if (g === "$cutByValue")
          return (r) => {
            const {
              isArray: o,
              value: s,
              keys: S
            } = N(e, t, a);
            if (!o) return;
            const u = se(s, S, (h) => h === r);
            u && n(null, [...t, u.key], {
              updateType: "cut"
            });
          };
        if (g === "$toggleByValue")
          return (r) => {
            const {
              isArray: o,
              value: s,
              keys: S
            } = N(e, t, a);
            if (!o) return;
            const u = se(s, S, (h) => h === r);
            if (u) {
              const h = [...t, u.key];
              n(null, h, {
                updateType: "cut"
              });
            } else
              n(r, t, { updateType: "insert" });
          };
        if (g === "$findWith")
          return (r, o) => {
            const { isArray: s, value: S, keys: u } = N(e, t, a);
            if (!s)
              throw new Error("findWith can only be used on arrays");
            const h = se(
              S,
              u,
              (w) => w?.[r] === o
            );
            return h ? c({
              path: [...t, h.key],
              componentId: d,
              meta: a
            }) : null;
          };
        if (g === "$cutThis") {
          const { value: r } = j(e, t, a), o = t.slice(0, -1);
          return Y(e, o), () => {
            n(r, t, { updateType: "cut" });
          };
        }
        if (g === "$get")
          return () => {
            ee(e, d, t);
            const { value: r } = j(e, t, a);
            return r;
          };
        if (g === "$$derive")
          return (r) => we({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: a
          });
        if (g === "$$get")
          return () => we({ _stateKey: e, _path: t, _meta: a });
        if (g === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return He(r);
        }
        if (g == "getLocalStorage")
          return (r) => ie(i + "-" + e + "-" + r);
        if (g === "$isSelected") {
          const r = t.slice(0, -1);
          if ($(e, r)?.arrayKeys) {
            const s = e + "." + r.join("."), S = p.getState().selectedIndicesMap.get(s), u = e + "." + t.join(".");
            return S === u;
          }
          return;
        }
        if (g === "$setSelected")
          return (r) => {
            const o = t.slice(0, -1), s = e + "." + o.join("."), S = e + "." + t.join(".");
            Y(e, o, void 0), p.getState().selectedIndicesMap.get(s), r && p.getState().setSelectedIndex(s, S);
          };
        if (g === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), o = e + "." + r.join("."), s = e + "." + t.join(".");
            p.getState().selectedIndicesMap.get(o) === s ? p.getState().clearSelectedIndex({ arrayKey: o }) : p.getState().setSelectedIndex(o, s), Y(e, r);
          };
        if (g === "$clearValidation")
          return (r) => {
            const o = r ? [...t, ...r] : t, s = p.getState(), S = s.getShadowNode(e, o);
            if (console.log("startNode ", S), !S) return;
            const u = [[S, o]];
            for (console.log("stack ", u); u.length > 0; ) {
              const [h, w] = u.pop();
              if (console.log("while (stack.length ", h, w), !h || typeof h != "object") continue;
              if (h._meta?.validation) {
                h._meta.validation = {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now(),
                  validatedValue: void 0
                };
                const M = [e, ...w].join(".");
                s.notifyPathSubscribers(M, {
                  type: "VALIDATION_CLEAR"
                });
              }
              const A = Object.keys(h);
              for (const M of A)
                M !== "_meta" && u.push([h[M], [...w, M]]);
            }
            W(e);
          };
        if (t.length == 0) {
          if (g === "$_componentId")
            return d;
          if (g === "$setOptions")
            return (r) => {
              ue({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (g === "$_applyUpdate")
            return (r, o, s = "update") => {
              n(r, o, { updateType: s });
            };
          if (g === "$_getEffectiveSetState")
            return n;
          if (g === "$getPluginMetaData")
            return (r) => me(e, t)?.get(r);
          if (g === "$addPluginMetaData")
            return (r, o) => he(e, t, r, o);
          if (g === "$removePluginMetaData")
            return (r) => ve(e, t, r);
          if (g === "$addZodValidation")
            return (r, o) => {
              r.forEach((s) => {
                const S = p.getState().getShadowMetadata(e, s.path) || {};
                p.getState().setShadowMetadata(e, s.path, {
                  ...S,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: o || "client",
                        message: s.message,
                        severity: "error",
                        code: s.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                });
              });
            };
          if (g === "$applyOperation")
            return (r, o) => {
              let s;
              if (r.insertAfterId && r.updateType === "insert") {
                const S = $(e, r.path);
                if (S?.arrayKeys) {
                  const u = S.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  u !== -1 && (s = u + 1);
                }
              }
              n(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                index: s,
                // Pass the calculated index
                metaData: o
              });
            };
          if (g === "$applyJsonPatch")
            return (r) => {
              const o = p.getState(), s = o.getShadowMetadata(e, []);
              if (!s?.components) return;
              const S = (h) => !h || h === "/" ? [] : h.split("/").slice(1).map((w) => w.replace(/~1/g, "/").replace(/~0/g, "~")), u = /* @__PURE__ */ new Set();
              for (const h of r) {
                const w = S(h.path);
                switch (h.op) {
                  case "add":
                  case "replace": {
                    const { value: A } = h;
                    o.updateShadowAtPath(e, w, A), o.markAsDirty(e, w, { bubble: !0 });
                    let M = [...w];
                    for (; ; ) {
                      const I = o.getShadowMetadata(
                        e,
                        M
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((P) => {
                        if (!u.has(P)) {
                          const O = s.components?.get(P);
                          O && (O.forceUpdate(), u.add(P));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const A = w.slice(0, -1);
                    o.removeShadowArrayElement(e, w), o.markAsDirty(e, A, { bubble: !0 });
                    let M = [...A];
                    for (; ; ) {
                      const I = o.getShadowMetadata(
                        e,
                        M
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((P) => {
                        if (!u.has(P)) {
                          const O = s.components?.get(P);
                          O && (O.forceUpdate(), u.add(P));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (g === "$getComponents")
            return () => $(e, [])?.components;
        }
        if (g === "$validationWrapper")
          return ({
            children: r,
            hideMessage: o
          }) => /* @__PURE__ */ Q(
            Oe,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: r
            }
          );
        if (g === "$_stateKey") return e;
        if (g === "$_path") return t;
        if (g === "$update")
          return (r) => (n(r, t, { updateType: "update" }), {
            synced: () => {
              const o = p.getState().getShadowMetadata(e, t);
              L(e, t, {
                ...o,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const s = [e, ...t].join(".");
              Qe(s, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (g === "$toggle") {
          const { value: r } = j(
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
        if (g === "$isolate")
          return (r, o) => {
            const s = Array.isArray(r), S = s ? r : void 0, u = s ? o : r;
            if (!u || typeof u != "function")
              throw new Error(
                "CogsState: $isolate requires a render function."
              );
            return /* @__PURE__ */ Q(
              je,
              {
                stateKey: e,
                path: t,
                dependencies: S,
                rebuildStateShape: c,
                renderFn: u
              }
            );
          };
        if (g === "$formElement")
          return (r, o) => /* @__PURE__ */ Q(
            Ne,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              setState: n,
              formOpts: o,
              renderFn: r
            }
          );
        const k = [...t, g];
        return c({
          path: k,
          componentId: d,
          meta: a
        });
      }
    }, J = new Proxy(C, _);
    return f.set(V, J), J;
  }
  const m = {
    $revertToInitialState: (t) => {
      const a = p.getState().getShadowMetadata(e, []);
      let d;
      a?.stateSource === "server" && a.baseServerState ? d = a.baseServerState : d = p.getState().initialStateGlobal[e], qe(e), X(e, d), c({
        path: [],
        componentId: l
      });
      const E = U(e), b = z(E?.localStorage?.key) ? E?.localStorage?.key(d) : E?.localStorage?.key, V = i && b ? `${i}-${e}-${b}` : void 0;
      return le(V), W(e), d;
    },
    $initializeAndMergeShadowState: (t) => {
      ze(e, t), W(e);
    },
    $updateInitialState: (t) => {
      const a = Ve(
        e,
        n,
        l,
        i
      ), d = p.getState().initialStateGlobal[e], E = U(e), b = z(E?.localStorage?.key) ? E?.localStorage?.key(d) : E?.localStorage?.key, V = i && b ? `${i}-${e}-${b}` : void 0;
      return le(V), Ie(() => {
        Me(e, t), X(e, t);
        const v = p.getState().getShadowMetadata(e, []);
        v && v?.components?.forEach((C) => {
          C.forceUpdate();
        });
      }), {
        fetchId: (v) => a.$get()[v]
      };
    }
  };
  return c({
    componentId: l,
    path: []
  });
}
function we(e) {
  return fe(gt, { proxy: e });
}
function gt({
  proxy: e
}) {
  const n = q(null), l = q(null), i = q(!1), f = `${e._stateKey}-${e._path.join(".")}`, c = e._path.length > 0 ? e._path.join(".") : "root", m = e._meta?.arrayViews?.[c], y = D(e._stateKey, e._path, m);
  return x(() => {
    const t = n.current;
    if (!t || i.current) return;
    const a = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", f);
        return;
      }
      const d = t.parentElement, b = Array.from(d.childNodes).indexOf(t);
      let V = d.getAttribute("data-parent-id");
      V || (V = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", V)), l.current = `instance-${crypto.randomUUID()}`;
      const v = p.getState().getShadowMetadata(e._stateKey, e._path) || {}, C = v.signals || [];
      C.push({
        instanceId: l.current,
        parentId: V,
        position: b,
        effect: e._effect
      }), p.getState().setShadowMetadata(e._stateKey, e._path, {
        ...v,
        signals: C
      });
      let _ = y;
      if (e._effect)
        try {
          _ = new Function(
            "state",
            `return (${e._effect})(state)`
          )(y);
        } catch (G) {
          console.error("Error evaluating effect function:", G);
        }
      _ !== null && typeof _ == "object" && (_ = JSON.stringify(_));
      const J = document.createTextNode(String(_ ?? ""));
      t.replaceWith(J), i.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(a), l.current) {
        const d = p.getState().getShadowMetadata(e._stateKey, e._path) || {};
        d.signals && (d.signals = d.signals.filter(
          (E) => E.instanceId !== l.current
        ), p.getState().setShadowMetadata(e._stateKey, e._path, d));
      }
    };
  }, []), fe("span", {
    ref: n,
    style: { display: "contents" },
    "data-signal-id": f
  });
}
export {
  we as $cogsSignal,
  $t as createCogsState,
  ct as useCogsStateFn
};
//# sourceMappingURL=CogsState.js.map
