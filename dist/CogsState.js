"use client";
import { jsx as Q, Fragment as Te } from "react/jsx-runtime";
import { pluginStore as z } from "./pluginStore.js";
import { useState as ne, useRef as q, useCallback as ke, useEffect as Z, useLayoutEffect as re, useMemo as Ae, createElement as Se, startTransition as Ie } from "react";
import { transformStateFunc as De, isFunction as R, isDeepEqual as X, isArray as Ce, getDifferences as _e } from "./utility.js";
import { ValidationWrapper as Oe, IsolatedComponentWrapper as je, FormElementWrapper as Ue, MemoizedCogsItemWrapper as Ne } from "./Components.js";
import Fe from "superjson";
import { v4 as ae } from "uuid";
import { getGlobalStore as p, updateShadowTypeInfo as H } from "./store.js";
import { useCogsConfig as Me } from "./CogsStateClient.js";
import { runValidation as ze } from "./validation.js";
const {
  getInitialOptions: j,
  updateInitialStateGlobal: be,
  getShadowMetadata: $,
  setShadowMetadata: L,
  getShadowValue: C,
  initializeShadowState: K,
  initializeAndMergeShadowState: Re,
  updateShadowAtPath: Le,
  insertShadowArrayElement: We,
  insertManyShadowArrayElements: $e,
  removeShadowArrayElement: Be,
  setInitialStateOptions: ye,
  setServerStateUpdate: me,
  markAsDirty: se,
  addPathComponent: Ge,
  clearSelectedIndexesForState: qe,
  addStateLog: xe,
  clearSelectedIndex: Je,
  getSyncInfo: He,
  notifyPathSubscribers: Qe,
  getPluginMetaDataMap: he,
  setPluginMetaData: ve,
  removePluginMetaData: we
} = p.getState(), { notifyUpdate: Ye } = z.getState();
function N(e, n, c) {
  const i = $(e, n);
  if (!!!i?.arrayKeys)
    return { isArray: !1, value: p.getState().getShadowValue(e, n), keys: [] };
  const l = n.length > 0 ? n.join(".") : "root", m = c?.arrayViews?.[l] ?? i.arrayKeys;
  return Array.isArray(m) && m.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: p.getState().getShadowValue(e, n, m), keys: m ?? [] };
}
function le(e, n, c) {
  for (let i = 0; i < e.length; i++)
    if (c(e[i], i)) {
      const f = n[i];
      if (f)
        return { key: f, index: i, value: e[i] };
    }
  return null;
}
function ue(e, n) {
  const i = {
    ...j(e) || {},
    ...n
  };
  (i.validation?.zodSchemaV4 || i.validation?.zodSchemaV3) && !i.validation?.onBlur && (i.validation.onBlur = "error"), ye(e, i);
}
function fe({
  stateKey: e,
  options: n,
  initialOptionsPart: c
}) {
  const i = j(e) || {}, f = c[e] || {};
  let l = { ...f, ...i }, m = !1;
  if (n) {
    const y = (t, a) => {
      for (const d in a)
        a.hasOwnProperty(d) && (a[d] instanceof Object && !Array.isArray(a[d]) && t[d] instanceof Object ? X(t[d], a[d]) || (y(t[d], a[d]), m = !0) : t[d] !== a[d] && (t[d] = a[d], m = !0));
      return t;
    };
    l = y(l, n);
  }
  if (l.validation && (n?.validation?.hasOwnProperty("onBlur") || i?.validation?.hasOwnProperty("onBlur") || f?.validation?.hasOwnProperty("onBlur") || (l.validation.onBlur = "error", m = !0)), m) {
    ye(e, l);
    const y = l.validation?.zodSchemaV4, t = l.validation?.zodSchemaV3;
    (y !== i?.validation?.zodSchemaV4 || t !== i?.validation?.zodSchemaV3) && (y || t) && (y ? H(e, y, "zod4") : t && H(e, t, "zod3"), W(e));
  }
  return l;
}
const $t = (e, n) => {
  n?.plugins && z.getState().setRegisteredPlugins(n.plugins);
  const c = {};
  if (n?.plugins)
    for (const a of n.plugins)
      typeof a.initialState == "function" && Object.assign(c, a.initialState());
  const i = { ...c, ...e }, [f, l] = De(i);
  Object.keys(f).forEach((a) => {
    let d = {};
    n?.formElements && (d.formElements = n.formElements), d.validation = {
      onBlur: "error",
      ...n?.validation
    };
    const V = j(a), b = V ? {
      ...V,
      formElements: n?.formElements,
      validation: {
        ...V.validation,
        ...d.validation
      }
    } : d;
    Object.keys(b).length > 0 && ye(a, b);
  }), Object.keys(f).forEach((a) => {
    K(a, f[a]);
  });
  const m = (a, d) => {
    const [V] = ne(d?.componentId ?? ae()), b = fe({
      stateKey: a,
      options: d,
      initialOptionsPart: l
    }), E = q(b);
    E.current = b;
    const v = C(a, []) || f[a], _ = ct(v, {
      stateKey: a,
      syncUpdate: d?.syncUpdate,
      componentId: V,
      localStorage: d?.localStorage,
      middleware: d?.middleware,
      reactiveType: d?.reactiveType,
      reactiveDeps: d?.reactiveDeps,
      defaultState: d?.defaultState,
      dependencies: d?.dependencies,
      serverState: d?.serverState
    });
    return re(() => {
      d && z.getState().setPluginOptionsForState(a, d);
    }, [a, d]), re(() => (z.getState().registerStateHandler(a, _), () => {
      z.getState().unregisterStateHandler(a);
    }), [a, _]), re(() => {
      const T = j(a)?.validation;
      T?.zodSchemaV4 ? H(a, T.zodSchemaV4, "zod4") : T?.zodSchemaV3 && H(a, T.zodSchemaV3, "zod3");
    }), _;
  };
  function y(a, d) {
    if (fe({ stateKey: a, options: d, initialOptionsPart: l }), d.localStorage && Xe(a, d), d.formElements) {
      const b = z.getState().registeredPlugins.map((E) => d.formElements.hasOwnProperty(E.name) ? {
        ...E,
        formWrapper: d.formElements[E.name]
      } : E);
      z.getState().setRegisteredPlugins(b);
    }
    W(a);
  }
  function t(a) {
    Object.keys(f).forEach((V) => {
      y(V, a);
    });
  }
  return {
    useCogsState: m,
    setCogsOptionsByKey: y,
    setCogsOptions: t
  };
}, Ze = (e, n, c, i, f) => {
  c?.log && console.log(
    "saving to localstorage",
    n,
    c.localStorage?.key,
    i
  );
  const l = R(c?.localStorage?.key) ? c.localStorage?.key(e) : c?.localStorage?.key;
  if (l && i) {
    const m = `${i}-${n}-${l}`;
    let y;
    try {
      y = ce(m)?.lastSyncedWithServer;
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
}, ce = (e) => {
  if (!e) return null;
  try {
    const n = window.localStorage.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch (n) {
    return console.error("Error loading from localStorage:", n), null;
  }
}, de = (e) => {
  if (e)
    try {
      typeof window < "u" && window.localStorage && window.localStorage.removeItem(e);
    } catch (n) {
      console.error("Error removing from localStorage:", n);
    }
}, Xe = (e, n) => {
  const c = C(e, []), { sessionId: i } = Me(), f = R(n?.localStorage?.key) ? n.localStorage.key(c) : n?.localStorage?.key;
  if (f && i) {
    const l = ce(
      `${i}-${e}-${f}`
    );
    if (l && l.lastUpdated > (l.lastSyncedWithServer || 0))
      return W(e), !0;
  }
  return !1;
}, W = (e) => {
  const n = $(e, []);
  if (!n) return;
  const c = /* @__PURE__ */ new Set();
  n?.components?.forEach((i) => {
    (i ? Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"] : null)?.includes("none") || c.add(() => i.forceUpdate());
  }), queueMicrotask(() => {
    c.forEach((i) => i());
  });
};
function oe(e, n, c, i) {
  const f = $(e, n);
  if (L(e, n, {
    ...f,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: i || Date.now()
  }), Array.isArray(c)) {
    const l = $(e, n);
    l?.arrayKeys && l.arrayKeys.forEach((m, y) => {
      const t = [...n, m], a = c[y];
      a !== void 0 && oe(
        e,
        t,
        a,
        i
      );
    });
  } else c && typeof c == "object" && c.constructor === Object && Object.keys(c).forEach((l) => {
    const m = [...n, l], y = c[l];
    oe(e, m, y, i);
  });
}
let ie = [], ge = !1;
function Ke() {
  ge || (ge = !0, queueMicrotask(() => {
    it();
  }));
}
function et(e, n) {
  e?.signals?.length && e.signals.forEach(({ parentId: c, position: i, effect: f }) => {
    const l = document.querySelector(`[data-parent-id="${c}"]`);
    if (!l) return;
    const m = Array.from(l.childNodes);
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
function tt(e, n, c) {
  const i = $(e, []);
  if (!i?.components)
    return /* @__PURE__ */ new Set();
  const f = /* @__PURE__ */ new Set();
  if (c.type === "update") {
    let l = [...n];
    for (; ; ) {
      const m = $(e, l);
      if (m?.pathComponents && m.pathComponents.forEach((y) => {
        const t = i.components?.get(y);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || f.add(t));
      }), l.length === 0) break;
      l.pop();
    }
    c.newValue && typeof c.newValue == "object" && !Ce(c.newValue) && _e(c.newValue, c.oldValue).forEach((y) => {
      const t = y.split("."), a = [...n, ...t], d = $(e, a);
      d?.pathComponents && d.pathComponents.forEach((V) => {
        const b = i.components?.get(V);
        b && ((Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"]).includes("none") || f.add(b));
      });
    });
  } else if (c.type === "insert" || c.type === "cut" || c.type === "insert_many") {
    let m = [...c.type === "insert" ? n : n.slice(0, -1)];
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
function rt(e, n, c) {
  const i = p.getState().getShadowValue(e, n), f = R(c) ? c(i) : c;
  if (X(i, f))
    return null;
  Le(e, n, f), se(e, n, { bubble: !0 });
  const l = $(e, n);
  return {
    type: "update",
    oldValue: i,
    newValue: f,
    shadowMeta: l
  };
}
function nt(e, n, c) {
  $e(e, n, c), se(e, n, { bubble: !0 });
  const i = $(e, n);
  return {
    type: "insert_many",
    count: c.length,
    shadowMeta: i,
    path: n
  };
}
function at(e, n, c, i, f) {
  let l;
  if (R(c)) {
    const { value: a } = U(e, n);
    l = c({ state: a });
  } else
    l = c;
  const m = We(
    e,
    n,
    l,
    i,
    f
  );
  se(e, n, { bubble: !0 });
  const y = $(e, n);
  let t;
  return y?.arrayKeys && i !== void 0 && i > 0 && (t = y.arrayKeys[i - 1]), {
    type: "insert",
    newValue: l,
    shadowMeta: y,
    path: n,
    itemId: m,
    insertAfterId: t
  };
}
function ot(e, n) {
  const c = n.slice(0, -1), i = C(e, n);
  return Be(e, n), se(e, c, { bubble: !0 }), { type: "cut", oldValue: i, parentPath: c };
}
function it() {
  const e = /* @__PURE__ */ new Set(), n = [], c = [];
  for (const i of ie) {
    if (i.status && i.updateType) {
      c.push(i);
      continue;
    }
    const f = i, l = f.type === "cut" ? null : f.newValue;
    f.shadowMeta?.signals?.length > 0 && n.push({ shadowMeta: f.shadowMeta, displayValue: l }), tt(
      f.stateKey,
      f.path,
      f
    ).forEach((y) => {
      e.add(y);
    });
  }
  c.length > 0 && xe(c), n.forEach(({ shadowMeta: i, displayValue: f }) => {
    et(i, f);
  }), e.forEach((i) => {
    i.forceUpdate();
  }), ie = [], ge = !1;
}
function st(e, n, c) {
  return (f, l, m) => {
    i(e, l, f, m);
  };
  function i(f, l, m, y) {
    let t;
    switch (y.updateType) {
      case "update":
        t = rt(f, l, m);
        break;
      case "insert":
        t = at(
          f,
          l,
          m,
          y.index,
          y.itemId
        );
        break;
      case "insert_many":
        t = nt(f, l, m);
        break;
      case "cut":
        t = ot(f, l);
        break;
    }
    if (t === null)
      return;
    t.stateKey = f, t.path = l, ie.push(t), Ke();
    const a = {
      timeStamp: Date.now(),
      stateKey: f,
      path: l,
      updateType: y.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: y.metaData
    };
    ie.push(a), t.newValue !== void 0 && Ze(
      t.newValue,
      f,
      c.current,
      n
    ), c.current?.middleware && c.current.middleware({ update: a }), ze(a, y.validationTrigger || "programmatic"), Ye(a);
  }
}
function ct(e, {
  stateKey: n,
  localStorage: c,
  formElements: i,
  reactiveDeps: f,
  reactiveType: l,
  componentId: m,
  defaultState: y,
  dependencies: t,
  serverState: a
} = {}) {
  const [d, V] = ne({}), { sessionId: b } = Me();
  let E = !n;
  const [v] = ne(n ?? ae()), _ = q(m ?? ae()), T = q(
    null
  );
  T.current = j(v) ?? null;
  const x = ke(
    (k) => {
      const r = k ? { ...j(v), ...k } : j(v), o = r?.defaultState || y || e;
      if (r?.serverState?.status === "success" && r?.serverState?.data !== void 0)
        return {
          value: r.serverState.data,
          source: "server",
          timestamp: r.serverState.timestamp || Date.now()
        };
      if (r?.localStorage?.key && b) {
        const S = R(r.localStorage.key) ? r.localStorage.key(o) : r.localStorage.key, u = ce(
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
  Z(() => {
    a && a.status === "success" && a.data !== void 0 && me(v, a);
  }, [a, v]), Z(() => p.getState().subscribeToPath(v, (I) => {
    if (I?.type === "SERVER_STATE_UPDATE") {
      const r = I.serverState;
      if (r?.status !== "success" || r.data === void 0)
        return;
      ue(v, { serverState: r });
      const o = typeof r.merge == "object" ? r.merge : r.merge === !0 ? { strategy: "append", key: "id" } : null, s = C(v, []), S = r.data;
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
        w.length > 0 && $e(v, [], w);
        const A = C(v, []);
        oe(
          v,
          [],
          A,
          r.timestamp || Date.now()
        );
      } else
        K(v, S), oe(
          v,
          [],
          S,
          r.timestamp || Date.now()
        );
      W(v);
    }
  }), [v]), Z(() => {
    const k = p.getState().getShadowMetadata(v, []);
    if (k && k.stateSource)
      return;
    const I = j(v), r = {
      localStorageEnabled: !!I?.localStorage?.key
    };
    if (L(v, [], {
      ...k,
      features: r
    }), I?.defaultState !== void 0 || y !== void 0) {
      const h = I?.defaultState || y;
      I?.defaultState || ue(v, {
        defaultState: h
      });
    }
    const { value: o, source: s, timestamp: S } = x();
    K(v, o);
    const u = j(v)?.validation;
    u?.zodSchemaV4 ? H(v, u.zodSchemaV4, "zod4") : u?.zodSchemaV3 && H(v, u.zodSchemaV3, "zod3"), L(v, [], {
      stateSource: s,
      lastServerSync: s === "server" ? S : void 0,
      isDirty: s === "server" ? !1 : void 0,
      baseServerState: s === "server" ? o : void 0
    }), s === "server" && a && me(v, a), W(v);
  }, [v, ...t || []]), re(() => {
    E && ue(v, {
      formElements: i,
      defaultState: y,
      localStorage: c,
      middleware: T.current?.middleware
    });
    const k = `${v}////${_.current}`, I = $(v, []), r = I?.components || /* @__PURE__ */ new Map();
    return r.set(k, {
      forceUpdate: () => V({}),
      reactiveType: l ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: f || void 0,
      deps: f ? f(C(v, [])) : [],
      prevDeps: f ? f(C(v, [])) : []
    }), L(v, [], {
      ...I,
      components: r
    }), V({}), () => {
      const o = $(v, []), s = o?.components?.get(k);
      s?.paths && s.paths.forEach((S) => {
        const h = S.split(".").slice(1), w = p.getState().getShadowMetadata(v, h);
        w?.pathComponents && w.pathComponents.size === 0 && (delete w.pathComponents, p.getState().setShadowMetadata(v, h, w));
      }), o?.components && L(v, [], o);
    };
  }, []);
  const G = st(
    v,
    b,
    T
  );
  return p.getState().initialStateGlobal[v] || be(v, e), Ae(() => Pe(
    v,
    G,
    _.current,
    b
  ), [v, b]);
}
const lt = (e, n, c) => {
  let i = $(e, n)?.arrayKeys || [];
  const f = c?.transforms;
  if (!f || f.length === 0)
    return i;
  for (const l of f)
    if (l.type === "filter") {
      const m = [];
      i.forEach((y, t) => {
        const a = C(e, [...n, y]);
        l.fn(a, t) && m.push(y);
      }), i = m;
    } else l.type === "sort" && i.sort((m, y) => {
      const t = C(e, [...n, m]), a = C(e, [...n, y]);
      return l.fn(t, a);
    });
  return i;
}, te = (e, n, c) => {
  const i = `${e}////${n}`, l = $(e, [])?.components?.get(i);
  !l || l.reactiveType === "none" || !(Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType]).includes("component") || Ge(e, c, i);
}, Y = (e, n, c) => {
  const i = $(e, []), f = /* @__PURE__ */ new Set();
  i?.components && i.components.forEach((m, y) => {
    (Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"]).includes("all") && (m.forceUpdate(), f.add(y));
  }), $(e, [
    ...n,
    "getSelected"
  ])?.pathComponents?.forEach((m) => {
    i?.components?.get(m)?.forceUpdate();
  });
  const l = $(e, n);
  for (let m of l?.arrayKeys || []) {
    const y = m + ".selected", t = $(e, y.split(".").slice(1));
    m == c && t?.pathComponents?.forEach((a) => {
      i?.components?.get(a)?.forceUpdate();
    });
  }
};
function U(e, n, c) {
  const i = $(e, n), f = n.length > 0 ? n.join(".") : "root", l = c?.arrayViews?.[f];
  if (Array.isArray(l) && l.length === 0)
    return {
      shadowMeta: i,
      value: [],
      arrayKeys: i?.arrayKeys
    };
  const m = C(e, n, l);
  return {
    shadowMeta: i,
    value: m,
    arrayKeys: i?.arrayKeys
  };
}
function ut(e, n) {
  return n ? e.length !== n.length ? !1 : n.every((c, i) => c === "*" || c === e[i]) : !0;
}
function dt(e, n) {
  return n === "any" ? !0 : n === "array" ? Array.isArray(e) : n === "boolean" ? typeof e == "boolean" : n === "object" ? e !== null && typeof e == "object" && !Array.isArray(e) : n === "primitive" ? e === null || typeof e != "object" && !Array.isArray(e) : !1;
}
function Ve(e, n) {
  const c = p.getState().getShadowMetadata(e, n);
  if (!c?.clientActivityState?.elements) return [];
  const i = [];
  return c.clientActivityState.elements.forEach((f) => {
    f.domRef?.current && i.push(f.domRef);
  }), i;
}
function Ee(e, n) {
  return Ve(e, n).map((i) => i.current).filter(Boolean);
}
function ft(e, n, c) {
  Ee(e, n).forEach((i) => {
    if ("disabled" in i) {
      i.disabled = c;
      return;
    }
    i.style.pointerEvents = c ? "none" : "", i.setAttribute("aria-disabled", String(c));
  });
}
function Pe(e, n, c, i) {
  const f = /* @__PURE__ */ new Map();
  function l({
    path: t = [],
    meta: a,
    componentId: d
  }) {
    if ($(e, t)?.isRaw)
      return C(e, t);
    const b = a ? JSON.stringify(a.arrayViews || a.transforms) : "", E = t.join(".") + ":" + d + ":" + b;
    if (f.has(E))
      return f.get(E);
    const v = [e, ...t].join("."), _ = () => {
    }, T = {
      apply(G, g, k) {
        if (k.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", o = a?.arrayViews?.[r];
          return te(e, d, t), C(e, t, o);
        }
        const I = k[0];
        return n(I, t, { updateType: "update" }), !0;
      },
      get(G, g, k) {
        if (g === Symbol.toPrimitive)
          return (r) => r === "number" ? NaN : r === "string" ? `[CogsState: ${t.join(".") || "root"}]` : null;
        if (g === Symbol.toStringTag)
          return "CogsState";
        if (g === Symbol.iterator) {
          const { value: r } = U(e, t, a);
          return Array.isArray(r) ? function* () {
            for (let o = 0; o < r.length; o++)
              yield r[o];
          } : void 0;
        }
        if (g === "call" || g === "apply" || g === "bind")
          return Reflect.get(G, g, k);
        if (typeof g != "string")
          return Reflect.get(G, g);
        if (t.length === 0 && g in m)
          return m[g];
        if (typeof g == "string" && !g.startsWith("$")) {
          const { value: r } = U(e, t, a);
          if (r !== null && typeof r == "object" && !Array.isArray(r) && Object.prototype.hasOwnProperty.call(r, g)) {
            const u = [...t, g];
            return l({
              path: u,
              componentId: d,
              meta: a
            });
          }
          const s = z.getState().registeredPlugins;
          for (const u of s) {
            const h = u.chainMethods?.[g];
            if (h && ut(t, h.pathPattern) && dt(r, h.target))
              return (...w) => {
                const A = z.getState(), M = A.pluginOptions.get(e)?.get(u.name), D = A.getHookResult(e, u.name);
                return h.handler(
                  {
                    stateKey: e,
                    path: t,
                    pluginName: u.name,
                    options: M,
                    hookData: D,
                    $get: () => U(e, t, a).value,
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
                    getFieldMetaData: () => he(e, t)?.get(u.name),
                    setFieldMetaData: (P) => ve(e, t, u.name, P),
                    removeFieldMetaData: () => we(e, t, u.name),
                    getFieldRefs: () => Ve(e, t),
                    getFieldElements: () => Ee(e, t),
                    setFieldDisabled: (P) => ft(e, t, P)
                  },
                  ...w
                );
              };
          }
          const S = [...t, g];
          return l({
            path: S,
            componentId: d,
            meta: a
          });
        }
        if (g === "$_rebuildStateShape")
          return l;
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
            const { shadowMeta: o, value: s } = U(e, t, a);
            return o?.isDirty === !0 ? "dirty" : o?.stateSource === "server" || o?.isDirty === !1 ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" || s !== void 0 ? "fresh" : "unknown";
          };
          return g === "$_status" ? r() : r;
        }
        if (g === "$removeStorage")
          return () => {
            const r = p.getState().initialStateGlobal[e], o = j(e), s = R(o?.localStorage?.key) ? o.localStorage.key(r) : o?.localStorage?.key, S = i && s ? `${i}-${e}-${s}` : void 0;
            de(S);
          };
        if (g === "$setRaw")
          return (r) => {
            const o = $(e, t) || {};
            L(e, t, { ...o, isRaw: !0 }), n(r, t, { updateType: "update" });
          };
        if (g === "$validate")
          return () => {
            const r = p.getState(), { value: o } = U(e, t, a), s = r.getInitialOptions(e), S = s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3;
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
            const { shadowMeta: r } = U(e, t, a);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((o) => o.severity === "error").map((o) => o.message) : [];
          };
        if (g === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            te(e, d, [
              ...t,
              "getSelected"
            ]);
            const o = p.getState().selectedIndicesMap.get(r);
            if (!o)
              return;
            const s = t.join("."), S = a?.arrayViews?.[s], u = o.split(".").pop();
            if (!(S && !S.includes(u) || C(
              e,
              o.split(".").slice(1)
            ) === void 0))
              return l({
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
            if (te(e, d, t), !s || !Array.isArray(o))
              return [];
            const S = l({
              path: t,
              componentId: d,
              meta: a
            });
            return o.map((u, h) => {
              const w = s[h];
              if (!w) return;
              const A = [...t, w], M = l({
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
            }), l({
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
            return l({
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
            const s = q(/* @__PURE__ */ new Map()), [S, u] = ne({}), h = t.length > 0 ? t.join(".") : "root", w = lt(e, t, a), A = Ae(() => ({
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
            if (Z(() => {
              const O = p.getState().subscribeToPath(v, (F) => {
                if (F.type === "GET_SELECTED")
                  return;
                const B = p.getState().getShadowMetadata(e, t)?.transformCaches;
                if (B)
                  for (const ee of B.keys())
                    ee.startsWith(d) && B.delete(ee);
                (F.type === "INSERT" || F.type === "INSERT_MANY" || F.type === "REMOVE" || F.type === "CLEAR_SELECTION" || F.type === "SERVER_STATE_UPDATE" && !a?.serverStateIsUpStream) && u({});
              });
              return () => {
                O();
              };
            }, [d, v]), !Array.isArray(M))
              return null;
            const D = l({
              path: t,
              componentId: d,
              meta: A
              // Use updated meta here
            }), P = M.map((O, F) => {
              const J = w[F];
              if (!J)
                return null;
              let B = s.current.get(J);
              B || (B = ae(), s.current.set(J, B));
              const ee = [...t, J];
              return Se(Ne, {
                key: J,
                stateKey: e,
                itemComponentId: B,
                itemPath: ee,
                localIndex: F,
                arraySetter: D,
                rebuildStateShape: l,
                renderFn: r
              });
            });
            return /* @__PURE__ */ Q(Te, { children: P });
          }, {});
        if (g === "$stateFlattenOn")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", s = a?.arrayViews?.[o], S = p.getState().getShadowValue(e, t, s);
            return Array.isArray(S) ? l({
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
              return h ? l({
                path: [...t, h],
                componentId: d,
                meta: a
              }) : void 0;
            }
            const S = $(e, t);
            if (!S?.arrayKeys) return;
            const u = S.arrayKeys[r];
            if (u)
              return l({
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
            return l({
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
            const { value: S } = U(
              e,
              t,
              a
            ), u = R(r) ? r(S) : r;
            let h = null;
            if (!S.some((A) => {
              const M = o ? o.every(
                (D) => X(A[D], u[D])
              ) : X(A, u);
              return M && (h = A), M;
            }))
              n(u, t, { updateType: "insert" });
            else if (s && h) {
              const A = s(h), M = S.map(
                (D) => X(D, h) ? A : D
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
            const u = le(s, S, (h) => h === r);
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
            const u = le(s, S, (h) => h === r);
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
            const h = le(
              S,
              u,
              (w) => w?.[r] === o
            );
            return h ? l({
              path: [...t, h.key],
              componentId: d,
              meta: a
            }) : null;
          };
        if (g === "$cutThis") {
          const { value: r } = U(e, t, a), o = t.slice(0, -1);
          return Y(e, o), () => {
            n(r, t, { updateType: "cut" });
          };
        }
        if (g === "$get")
          return () => {
            te(e, d, t);
            const { value: r } = U(e, t, a);
            return r;
          };
        if (g === "$$derive")
          return (r) => pe({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: a
          });
        if (g === "$$get")
          return () => pe({ _stateKey: e, _path: t, _meta: a });
        if (g === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return He(r);
        }
        if (g == "getLocalStorage")
          return (r) => ce(i + "-" + e + "-" + r);
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
              fe({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (g === "$_applyUpdate")
            return (r, o, s = "update") => {
              n(r, o, { updateType: s });
            };
          if (g === "$_getEffectiveSetState")
            return n;
          if (g === "$getPluginMetaData")
            return (r) => he(e, t)?.get(r);
          if (g === "$addPluginMetaData")
            return (r, o) => ve(e, t, r, o);
          if (g === "$removePluginMetaData")
            return (r) => we(e, t, r);
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
                      const D = o.getShadowMetadata(
                        e,
                        M
                      );
                      if (D?.pathComponents && D.pathComponents.forEach((P) => {
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
                      const D = o.getShadowMetadata(
                        e,
                        M
                      );
                      if (D?.pathComponents && D.pathComponents.forEach((P) => {
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
          const { value: r } = U(
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
                rebuildStateShape: l,
                renderFn: u
              }
            );
          };
        if (g === "$formElement")
          return (r, o) => /* @__PURE__ */ Q(
            Ue,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: l,
              setState: n,
              formOpts: o,
              renderFn: r
            }
          );
        const I = [...t, g];
        return l({
          path: I,
          componentId: d,
          meta: a
        });
      }
    }, x = new Proxy(_, T);
    return f.set(E, x), x;
  }
  const m = {
    $revertToInitialState: (t) => {
      const a = p.getState().getShadowMetadata(e, []);
      let d;
      a?.stateSource === "server" && a.baseServerState ? d = a.baseServerState : d = p.getState().initialStateGlobal[e], qe(e), K(e, d), l({
        path: [],
        componentId: c
      });
      const V = j(e), b = R(V?.localStorage?.key) ? V?.localStorage?.key(d) : V?.localStorage?.key, E = i && b ? `${i}-${e}-${b}` : void 0;
      return de(E), W(e), d;
    },
    $initializeAndMergeShadowState: (t) => {
      Re(e, t), W(e);
    },
    $updateInitialState: (t) => {
      const a = Pe(
        e,
        n,
        c,
        i
      ), d = p.getState().initialStateGlobal[e], V = j(e), b = R(V?.localStorage?.key) ? V?.localStorage?.key(d) : V?.localStorage?.key, E = i && b ? `${i}-${e}-${b}` : void 0;
      return de(E), Ie(() => {
        be(e, t), K(e, t);
        const v = p.getState().getShadowMetadata(e, []);
        v && v?.components?.forEach((_) => {
          _.forceUpdate();
        });
      }), {
        fetchId: (v) => a.$get()[v]
      };
    }
  };
  return l({
    componentId: c,
    path: []
  });
}
function pe(e) {
  return Se(gt, { proxy: e });
}
function gt({
  proxy: e
}) {
  const n = q(null), c = q(null), i = q(!1), f = `${e._stateKey}-${e._path.join(".")}`, l = e._path.length > 0 ? e._path.join(".") : "root", m = e._meta?.arrayViews?.[l], y = C(e._stateKey, e._path, m);
  return Z(() => {
    const t = n.current;
    if (!t || i.current) return;
    const a = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", f);
        return;
      }
      const d = t.parentElement, b = Array.from(d.childNodes).indexOf(t);
      let E = d.getAttribute("data-parent-id");
      E || (E = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", E)), c.current = `instance-${crypto.randomUUID()}`;
      const v = p.getState().getShadowMetadata(e._stateKey, e._path) || {}, _ = v.signals || [];
      _.push({
        instanceId: c.current,
        parentId: E,
        position: b,
        effect: e._effect
      }), p.getState().setShadowMetadata(e._stateKey, e._path, {
        ...v,
        signals: _
      });
      let T = y;
      if (e._effect)
        try {
          T = new Function(
            "state",
            `return (${e._effect})(state)`
          )(y);
        } catch (G) {
          console.error("Error evaluating effect function:", G);
        }
      T !== null && typeof T == "object" && (T = JSON.stringify(T));
      const x = document.createTextNode(String(T ?? ""));
      t.replaceWith(x), i.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(a), c.current) {
        const d = p.getState().getShadowMetadata(e._stateKey, e._path) || {};
        d.signals && (d.signals = d.signals.filter(
          (V) => V.instanceId !== c.current
        ), p.getState().setShadowMetadata(e._stateKey, e._path, d));
      }
    };
  }, []), Se("span", {
    ref: n,
    style: { display: "contents" },
    "data-signal-id": f
  });
}
export {
  pe as $cogsSignal,
  $t as createCogsState,
  ct as useCogsStateFn
};
//# sourceMappingURL=CogsState.js.map
