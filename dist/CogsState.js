"use client";
import { jsx as Q, Fragment as Pe } from "react/jsx-runtime";
import { pluginStore as R } from "./pluginStore.js";
import { useState as ne, useRef as q, useCallback as Ie, useEffect as Z, useLayoutEffect as re, useMemo as Ae, createElement as Se, startTransition as ke } from "react";
import { transformStateFunc as De, isFunction as L, isDeepEqual as X, isArray as Ce, getDifferences as _e } from "./utility.js";
import { ValidationWrapper as Oe, IsolatedComponentWrapper as je, FormElementWrapper as Ne, MemoizedCogsItemWrapper as Ue } from "./Components.js";
import Fe from "superjson";
import { v4 as ae } from "uuid";
import { getGlobalStore as p, updateShadowTypeInfo as H } from "./store.js";
import { useCogsConfig as Me } from "./CogsStateClient.js";
import { runValidation as ze } from "./validation.js";
const {
  getInitialOptions: j,
  updateInitialStateGlobal: Ve,
  getShadowMetadata: E,
  setShadowMetadata: W,
  getShadowValue: C,
  initializeShadowState: K,
  initializeAndMergeShadowState: Re,
  updateShadowAtPath: Le,
  insertShadowArrayElement: We,
  insertManyShadowArrayElements: be,
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
} = p.getState(), { notifyUpdate: Ye } = R.getState();
function F(e, n, l) {
  const i = E(e, n);
  if (!!!i?.arrayKeys)
    return { isArray: !1, value: p.getState().getShadowValue(e, n), keys: [] };
  const u = n.length > 0 ? n.join(".") : "root", h = l?.arrayViews?.[u] ?? i.arrayKeys;
  return Array.isArray(h) && h.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: p.getState().getShadowValue(e, n, h), keys: h ?? [] };
}
function le(e, n, l) {
  for (let i = 0; i < e.length; i++)
    if (l(e[i], i)) {
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
  initialOptionsPart: l
}) {
  const i = j(e) || {}, f = l[e] || {};
  let u = { ...f, ...i }, h = !1;
  if (n) {
    const m = (t, o) => {
      for (const d in o)
        o.hasOwnProperty(d) && (o[d] instanceof Object && !Array.isArray(o[d]) && t[d] instanceof Object ? X(t[d], o[d]) || (m(t[d], o[d]), h = !0) : t[d] !== o[d] && (t[d] = o[d], h = !0));
      return t;
    };
    u = m(u, n);
  }
  if (u.validation && (n?.validation?.hasOwnProperty("onBlur") || i?.validation?.hasOwnProperty("onBlur") || f?.validation?.hasOwnProperty("onBlur") || (u.validation.onBlur = "error", h = !0)), h) {
    ye(e, u);
    const m = u.validation?.zodSchemaV4, t = u.validation?.zodSchemaV3;
    (m !== i?.validation?.zodSchemaV4 || t !== i?.validation?.zodSchemaV3) && (m || t) && (m ? H(e, m, "zod4") : t && H(e, t, "zod3"), U(e));
  }
  return u;
}
const bt = (e, n) => {
  n?.plugins && R.getState().setRegisteredPlugins(n.plugins);
  const l = {};
  if (n?.plugins)
    for (const o of n.plugins)
      typeof o.initialState == "function" && Object.assign(l, o.initialState());
  const i = { ...l, ...e }, [f, u] = De(i);
  Object.keys(f).forEach((o) => {
    let d = {};
    n?.formElements && (d.formElements = n.formElements), d.validation = {
      onBlur: "error",
      ...n?.validation
    };
    const $ = j(o), V = $ ? {
      ...$,
      formElements: n?.formElements,
      validation: {
        ...$.validation,
        ...d.validation
      }
    } : d;
    Object.keys(V).length > 0 && ye(o, V);
  }), Object.keys(f).forEach((o) => {
    K(o, f[o]);
  });
  const h = (o, d) => {
    const [$] = ne(d?.componentId ?? ae()), V = fe({
      stateKey: o,
      options: d,
      initialOptionsPart: u
    }), T = q(V);
    T.current = V;
    const v = C(o, []) || f[o], _ = ct(v, {
      stateKey: o,
      syncUpdate: d?.syncUpdate,
      componentId: $,
      localStorage: d?.localStorage,
      middleware: d?.middleware,
      reactiveType: d?.reactiveType,
      reactiveDeps: d?.reactiveDeps,
      defaultState: d?.defaultState,
      dependencies: d?.dependencies,
      serverState: d?.serverState
    });
    return re(() => {
      d && R.getState().setPluginOptionsForState(o, d);
    }, [o, d]), re(() => (R.getState().registerStateHandler(o, _), () => {
      R.getState().unregisterStateHandler(o);
    }), [o, _]), re(() => {
      const P = j(o)?.validation;
      P?.zodSchemaV4 ? H(o, P.zodSchemaV4, "zod4") : P?.zodSchemaV3 && H(o, P.zodSchemaV3, "zod3");
    }), _;
  };
  function m(o, d) {
    if (fe({ stateKey: o, options: d, initialOptionsPart: u }), d.localStorage && Xe(o, d), d.formElements) {
      const V = R.getState().registeredPlugins.map((T) => d.formElements.hasOwnProperty(T.name) ? {
        ...T,
        formWrapper: d.formElements[T.name]
      } : T);
      R.getState().setRegisteredPlugins(V);
    }
    U(o);
  }
  function t(o) {
    Object.keys(f).forEach(($) => {
      m($, o);
    });
  }
  return {
    useCogsState: h,
    setCogsOptionsByKey: m,
    setCogsOptions: t
  };
}, Ze = (e, n, l, i, f) => {
  l?.log && console.log(
    "saving to localstorage",
    n,
    l.localStorage?.key,
    i
  );
  const u = L(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (u && i) {
    const h = `${i}-${n}-${u}`;
    let m;
    try {
      m = ce(h)?.lastSyncedWithServer;
    } catch {
    }
    const t = E(n, []), o = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: m,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, d = Fe.serialize(o);
    window.localStorage.setItem(
      h,
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
  const l = C(e, []), { sessionId: i } = Me(), f = L(n?.localStorage?.key) ? n.localStorage.key(l) : n?.localStorage?.key;
  if (f && i) {
    const u = ce(
      `${i}-${e}-${f}`
    );
    if (u && u.lastUpdated > (u.lastSyncedWithServer || 0))
      return U(e), !0;
  }
  return !1;
}, U = (e) => {
  const n = E(e, []);
  if (!n) return;
  const l = /* @__PURE__ */ new Set();
  n?.components?.forEach((i) => {
    (i ? Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"] : null)?.includes("none") || l.add(() => i.forceUpdate());
  }), queueMicrotask(() => {
    l.forEach((i) => i());
  });
};
function oe(e, n, l, i) {
  const f = E(e, n);
  if (W(e, n, {
    ...f,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: i || Date.now()
  }), Array.isArray(l)) {
    const u = E(e, n);
    u?.arrayKeys && u.arrayKeys.forEach((h, m) => {
      const t = [...n, h], o = l[m];
      o !== void 0 && oe(
        e,
        t,
        o,
        i
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((u) => {
    const h = [...n, u], m = l[u];
    oe(e, h, m, i);
  });
}
let ie = [], ge = !1;
function Ke() {
  ge || (ge = !0, queueMicrotask(() => {
    it();
  }));
}
function et(e, n) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: i, effect: f }) => {
    const u = document.querySelector(`[data-parent-id="${l}"]`);
    if (!u) return;
    const h = Array.from(u.childNodes);
    if (!h[i]) return;
    let m = n;
    if (f && n !== null)
      try {
        m = new Function("state", `return (${f})(state)`)(
          n
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    m !== null && typeof m == "object" && (m = JSON.stringify(m)), h[i].textContent = String(m ?? "");
  });
}
function tt(e, n, l) {
  const i = E(e, []);
  if (!i?.components)
    return /* @__PURE__ */ new Set();
  const f = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let u = [...n];
    for (; ; ) {
      const h = E(e, u);
      if (h?.pathComponents && h.pathComponents.forEach((m) => {
        const t = i.components?.get(m);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || f.add(t));
      }), u.length === 0) break;
      u.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Ce(l.newValue) && _e(l.newValue, l.oldValue).forEach((m) => {
      const t = m.split("."), o = [...n, ...t], d = E(e, o);
      d?.pathComponents && d.pathComponents.forEach(($) => {
        const V = i.components?.get($);
        V && ((Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"]).includes("none") || f.add(V));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    let h = [...l.type === "insert" ? n : n.slice(0, -1)];
    for (; ; ) {
      const m = E(e, h);
      if (m?.pathComponents && m.pathComponents.forEach((t) => {
        const o = i.components?.get(t);
        o && f.add(o);
      }), h.length === 0) break;
      h.pop();
    }
  }
  return f;
}
function rt(e, n, l) {
  const i = p.getState().getShadowValue(e, n), f = L(l) ? l(i) : l;
  if (X(i, f))
    return null;
  Le(e, n, f), se(e, n, { bubble: !0 });
  const u = E(e, n);
  return {
    type: "update",
    oldValue: i,
    newValue: f,
    shadowMeta: u
  };
}
function nt(e, n, l) {
  be(e, n, l), se(e, n, { bubble: !0 });
  const i = E(e, n);
  return {
    type: "insert_many",
    count: l.length,
    shadowMeta: i,
    path: n
  };
}
function at(e, n, l, i, f) {
  let u;
  if (L(l)) {
    const { value: o } = N(e, n);
    u = l({ state: o });
  } else
    u = l;
  const h = We(
    e,
    n,
    u,
    i,
    f
  );
  se(e, n, { bubble: !0 });
  const m = E(e, n);
  let t;
  return m?.arrayKeys && i !== void 0 && i > 0 && (t = m.arrayKeys[i - 1]), {
    type: "insert",
    newValue: u,
    shadowMeta: m,
    path: n,
    itemId: h,
    insertAfterId: t
  };
}
function ot(e, n) {
  const l = n.slice(0, -1), i = C(e, n);
  return Be(e, n), se(e, l, { bubble: !0 }), { type: "cut", oldValue: i, parentPath: l };
}
function it() {
  const e = /* @__PURE__ */ new Set(), n = [], l = [];
  for (const i of ie) {
    if (i.status && i.updateType) {
      l.push(i);
      continue;
    }
    const f = i, u = f.type === "cut" ? null : f.newValue;
    f.shadowMeta?.signals?.length > 0 && n.push({ shadowMeta: f.shadowMeta, displayValue: u }), tt(
      f.stateKey,
      f.path,
      f
    ).forEach((m) => {
      e.add(m);
    });
  }
  l.length > 0 && xe(l), n.forEach(({ shadowMeta: i, displayValue: f }) => {
    et(i, f);
  }), e.forEach((i) => {
    i.forceUpdate();
  }), ie = [], ge = !1;
}
function st(e, n, l) {
  return (f, u, h) => {
    i(e, u, f, h);
  };
  function i(f, u, h, m) {
    let t;
    switch (m.updateType) {
      case "update":
        t = rt(f, u, h);
        break;
      case "insert":
        t = at(
          f,
          u,
          h,
          m.index,
          m.itemId
        );
        break;
      case "insert_many":
        t = nt(f, u, h);
        break;
      case "cut":
        t = ot(f, u);
        break;
    }
    if (t === null)
      return;
    t.stateKey = f, t.path = u, ie.push(t), Ke();
    const o = {
      timeStamp: Date.now(),
      stateKey: f,
      path: u,
      updateType: m.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: m.metaData
    };
    ie.push(o), t.newValue !== void 0 && Ze(
      t.newValue,
      f,
      l.current,
      n
    ), l.current?.middleware && l.current.middleware({ update: o }), ze(o, m.validationTrigger || "programmatic"), Ye(o);
  }
}
function ct(e, {
  stateKey: n,
  localStorage: l,
  formElements: i,
  reactiveDeps: f,
  reactiveType: u,
  componentId: h,
  defaultState: m,
  dependencies: t,
  serverState: o
} = {}) {
  const [d, $] = ne({}), { sessionId: V } = Me();
  let T = !n;
  const [v] = ne(n ?? ae()), _ = q(h ?? ae()), P = q(
    null
  );
  P.current = j(v) ?? null;
  const x = Ie(
    (k) => {
      const r = k ? { ...j(v), ...k } : j(v), a = r?.defaultState || m || e;
      if (r?.serverState?.status === "success" && r?.serverState?.data !== void 0)
        return {
          value: r.serverState.data,
          source: "server",
          timestamp: r.serverState.timestamp || Date.now()
        };
      if (r?.localStorage?.key && V) {
        const S = L(r.localStorage.key) ? r.localStorage.key(a) : r.localStorage.key, s = ce(
          `${V}-${v}-${S}`
        );
        if (s && s.lastUpdated > (r?.serverState?.timestamp || 0))
          return {
            value: s.state,
            source: "localStorage",
            timestamp: s.lastUpdated
          };
      }
      return {
        value: a || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [v, m, e, V]
  );
  Z(() => {
    o && o.status === "success" && o.data !== void 0 && me(v, o);
  }, [o, v]), Z(() => p.getState().subscribeToPath(v, (D) => {
    if (D?.type === "SERVER_STATE_UPDATE") {
      const r = D.serverState;
      if (r?.status !== "success" || r.data === void 0)
        return;
      ue(v, { serverState: r });
      const a = typeof r.merge == "object" ? r.merge : r.merge === !0 ? { strategy: "append", key: "id" } : null, c = C(v, []), S = r.data;
      if (a && a.strategy === "append" && "key" in a && Array.isArray(c) && Array.isArray(S)) {
        const s = a.key;
        if (!s) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const y = new Set(
          c.map((M) => M[s])
        ), w = S.filter(
          (M) => !y.has(M[s])
        );
        w.length > 0 && be(v, [], w);
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
      U(v);
    }
  }), [v]), Z(() => {
    const k = p.getState().getShadowMetadata(v, []);
    if (k && k.stateSource)
      return;
    const D = j(v), r = {
      localStorageEnabled: !!D?.localStorage?.key
    };
    if (W(v, [], {
      ...k,
      features: r
    }), D?.defaultState !== void 0 || m !== void 0) {
      const y = D?.defaultState || m;
      D?.defaultState || ue(v, {
        defaultState: y
      });
    }
    const { value: a, source: c, timestamp: S } = x();
    K(v, a);
    const s = j(v)?.validation;
    s?.zodSchemaV4 ? H(v, s.zodSchemaV4, "zod4") : s?.zodSchemaV3 && H(v, s.zodSchemaV3, "zod3"), W(v, [], {
      stateSource: c,
      lastServerSync: c === "server" ? S : void 0,
      isDirty: c === "server" ? !1 : void 0,
      baseServerState: c === "server" ? a : void 0
    }), c === "server" && o && me(v, o), U(v);
  }, [v, ...t || []]), re(() => {
    T && ue(v, {
      formElements: i,
      defaultState: m,
      localStorage: l,
      middleware: P.current?.middleware
    });
    const k = `${v}////${_.current}`, D = E(v, []), r = D?.components || /* @__PURE__ */ new Map();
    return r.set(k, {
      forceUpdate: () => $({}),
      reactiveType: u ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: f || void 0,
      deps: f ? f(C(v, [])) : [],
      prevDeps: f ? f(C(v, [])) : []
    }), W(v, [], {
      ...D,
      components: r
    }), $({}), () => {
      const a = E(v, []), c = a?.components?.get(k);
      c?.paths && c.paths.forEach((S) => {
        const y = S.split(".").slice(1), w = p.getState().getShadowMetadata(v, y);
        w?.pathComponents && w.pathComponents.size === 0 && (delete w.pathComponents, p.getState().setShadowMetadata(v, y, w));
      }), a?.components && W(v, [], a);
    };
  }, []);
  const G = st(
    v,
    V,
    P
  );
  return p.getState().initialStateGlobal[v] || Ve(v, e), Ae(() => Te(
    v,
    G,
    _.current,
    V
  ), [v, V]);
}
const lt = (e, n, l) => {
  let i = E(e, n)?.arrayKeys || [];
  const f = l?.transforms;
  if (!f || f.length === 0)
    return i;
  for (const u of f)
    if (u.type === "filter") {
      const h = [];
      i.forEach((m, t) => {
        const o = C(e, [...n, m]);
        u.fn(o, t) && h.push(m);
      }), i = h;
    } else u.type === "sort" && i.sort((h, m) => {
      const t = C(e, [...n, h]), o = C(e, [...n, m]);
      return u.fn(t, o);
    });
  return i;
}, te = (e, n, l) => {
  const i = `${e}////${n}`, u = E(e, [])?.components?.get(i);
  !u || u.reactiveType === "none" || !(Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType]).includes("component") || Ge(e, l, i);
}, Y = (e, n, l) => {
  const i = E(e, []), f = /* @__PURE__ */ new Set();
  i?.components && i.components.forEach((h, m) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), f.add(m));
  }), E(e, [
    ...n,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    i?.components?.get(h)?.forceUpdate();
  });
  const u = E(e, n);
  for (let h of u?.arrayKeys || []) {
    const m = h + ".selected", t = E(e, m.split(".").slice(1));
    h == l && t?.pathComponents?.forEach((o) => {
      i?.components?.get(o)?.forceUpdate();
    });
  }
};
function N(e, n, l) {
  const i = E(e, n), f = n.length > 0 ? n.join(".") : "root", u = l?.arrayViews?.[f];
  if (Array.isArray(u) && u.length === 0)
    return {
      shadowMeta: i,
      value: [],
      arrayKeys: i?.arrayKeys
    };
  const h = C(e, n, u);
  return {
    shadowMeta: i,
    value: h,
    arrayKeys: i?.arrayKeys
  };
}
function ut(e, n) {
  return n ? e.length !== n.length ? !1 : n.every((l, i) => l === "*" || l === e[i]) : !0;
}
function dt(e, n) {
  return n === "any" ? !0 : n === "array" ? Array.isArray(e) : n === "boolean" ? typeof e == "boolean" : n === "object" ? e !== null && typeof e == "object" && !Array.isArray(e) : n === "primitive" ? e === null || typeof e != "object" && !Array.isArray(e) : !1;
}
function Ee(e, n) {
  const l = p.getState().getShadowMetadata(e, n);
  if (!l?.clientActivityState?.elements) return [];
  const i = [];
  return l.clientActivityState.elements.forEach((f) => {
    f.domRef?.current && i.push(f.domRef);
  }), i;
}
function $e(e, n) {
  return Ee(e, n).map((i) => i.current).filter(Boolean);
}
function ft(e, n, l) {
  $e(e, n).forEach((i) => {
    if ("disabled" in i) {
      i.disabled = l;
      return;
    }
    i.style.pointerEvents = l ? "none" : "", i.setAttribute("aria-disabled", String(l));
  });
}
function Te(e, n, l, i) {
  const f = /* @__PURE__ */ new Map();
  function u({
    path: t = [],
    meta: o,
    componentId: d
  }) {
    if (E(e, t)?.isRaw)
      return C(e, t);
    const V = o ? JSON.stringify(o.arrayViews || o.transforms) : "", T = t.join(".") + ":" + d + ":" + V;
    if (f.has(T))
      return f.get(T);
    const v = [e, ...t].join("."), _ = () => {
    }, P = {
      apply(G, g, k) {
        if (k.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", a = o?.arrayViews?.[r];
          return te(e, d, t), C(e, t, a);
        }
        const D = k[0];
        return n(D, t, { updateType: "update" }), !0;
      },
      get(G, g, k) {
        if (g === Symbol.toPrimitive)
          return (r) => r === "number" ? NaN : r === "string" ? `[CogsState: ${t.join(".") || "root"}]` : null;
        if (g === Symbol.toStringTag)
          return "CogsState";
        if (g === Symbol.iterator) {
          const { value: r } = N(e, t, o);
          return Array.isArray(r) ? function* () {
            for (let a = 0; a < r.length; a++)
              yield r[a];
          } : void 0;
        }
        if (g === "call" || g === "apply" || g === "bind")
          return Reflect.get(G, g, k);
        if (typeof g != "string")
          return Reflect.get(G, g);
        if (t.length === 0 && g in h)
          return h[g];
        if (typeof g == "string" && !g.startsWith("$")) {
          const { value: r } = N(e, t, o);
          if (r !== null && typeof r == "object" && !Array.isArray(r) && Object.prototype.hasOwnProperty.call(r, g)) {
            const s = [...t, g];
            return u({
              path: s,
              componentId: d,
              meta: o
            });
          }
          const c = R.getState().registeredPlugins;
          for (const s of c) {
            const y = s.chainMethods?.[g];
            if (y && ut(t, y.pathPattern) && dt(r, y.target))
              return (...w) => {
                const A = R.getState(), M = A.pluginOptions.get(e)?.get(s.name), I = A.getHookResult(e, s.name);
                return y.handler(
                  {
                    stateKey: e,
                    path: t,
                    pluginName: s.name,
                    options: M,
                    hookData: I,
                    $get: () => N(e, t, o).value,
                    $update: (b) => (n(b, t, {
                      updateType: "update"
                    }), {
                      synced: () => {
                        const O = p.getState().getShadowMetadata(e, t);
                        W(e, t, {
                          ...O,
                          isDirty: !1,
                          stateSource: "server",
                          lastServerSync: Date.now()
                        });
                      }
                    }),
                    $applyOperation: (b, O) => {
                      n(b.newValue, b.path, {
                        updateType: b.updateType,
                        itemId: b.itemId,
                        metaData: O
                      });
                    },
                    getFieldMetaData: () => he(e, t)?.get(s.name),
                    setFieldMetaData: (b) => ve(e, t, s.name, b),
                    removeFieldMetaData: () => we(e, t, s.name),
                    getFieldRefs: () => Ee(e, t),
                    getFieldElements: () => $e(e, t),
                    setFieldDisabled: (b) => ft(e, t, b)
                  },
                  ...w
                );
              };
          }
          const S = [...t, g];
          return u({
            path: S,
            componentId: d,
            meta: o
          });
        }
        if (g === "$_rebuildStateShape")
          return u;
        if (g === "$sync" && t.length === 0)
          return async function() {
            const r = p.getState().getInitialOptions(e), a = r?.sync;
            if (!a)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const c = p.getState().getShadowValue(e, []), S = r?.validation?.key;
            try {
              const s = await a.action(c);
              if (s && !s.success && s.errors, s?.success) {
                const y = p.getState().getShadowMetadata(e, []);
                W(e, [], {
                  ...y,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: c
                  // Update base server state
                }), a.onSuccess && a.onSuccess(s.data);
              } else !s?.success && a.onError && a.onError(s.error);
              return s;
            } catch (s) {
              return a.onError && a.onError(s), { success: !1, error: s };
            }
          };
        if (g === "$_status" || g === "$getStatus") {
          const r = () => {
            const { shadowMeta: a, value: c } = N(e, t, o);
            return a?.isDirty === !0 ? "dirty" : a?.stateSource === "server" || a?.isDirty === !1 ? "synced" : a?.stateSource === "localStorage" ? "restored" : a?.stateSource === "default" || c !== void 0 ? "fresh" : "unknown";
          };
          return g === "$_status" ? r() : r;
        }
        if (g === "$removeStorage")
          return () => {
            const r = p.getState().initialStateGlobal[e], a = j(e), c = L(a?.localStorage?.key) ? a.localStorage.key(r) : a?.localStorage?.key, S = i && c ? `${i}-${e}-${c}` : void 0;
            de(S);
          };
        if (g === "$setRaw")
          return (r) => {
            const a = E(e, t) || {};
            W(e, t, { ...a, isRaw: !0 }), n(r, t, { updateType: "update" });
          };
        if (g === "$validate")
          return () => {
            const r = p.getState(), { value: a } = N(e, t, o), c = r.getInitialOptions(e), S = c?.validation?.zodSchemaV4 || c?.validation?.zodSchemaV3;
            if (!S)
              return { success: !0, data: a };
            const s = S.safeParse(a);
            if (s.success) {
              const y = r.getShadowMetadata(e, t) || {};
              r.setShadowMetadata(e, t, {
                ...y,
                validation: {
                  status: "VALID",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            } else
              (s.error?.issues || s.error?.errors || []).forEach((w) => {
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
            return U(e), s;
          };
        if (g === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = N(e, t, o);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((a) => a.severity === "error").map((a) => a.message) : [];
          };
        if (g === "$validationErrors")
          return (r) => {
            const a = p.getState(), c = (s) => {
              const y = a.getShadowMetadata(e, s)?.validation, w = (y?.errors || []).map((b) => ({
                ...b,
                path: s
              })), A = w.filter((b) => b.severity === "error"), M = w.filter(
                (b) => b.severity === "warning"
              ), I = A.length > 0 ? "error" : M.length > 0 ? "warning" : void 0;
              return {
                status: y?.status || "NOT_VALIDATED",
                severity: I,
                hasErrors: A.length > 0,
                hasWarnings: M.length > 0,
                message: A[0]?.message || M[0]?.message || "",
                errors: A.map((b) => b.message),
                warnings: M.map((b) => b.message),
                allErrors: w,
                path: s,
                getData: () => a.getShadowValue(e, s)
              };
            };
            return (r ?? Object.keys(a.getShadowNode(e, t) ?? {}).filter(
              (s) => s !== "_meta"
            )).map((s) => c([...t, s]));
          };
        if (g === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            te(e, d, [
              ...t,
              "getSelected"
            ]);
            const a = p.getState().selectedIndicesMap.get(r);
            if (!a)
              return;
            const c = t.join("."), S = o?.arrayViews?.[c], s = a.split(".").pop();
            if (!(S && !S.includes(s) || C(
              e,
              a.split(".").slice(1)
            ) === void 0))
              return u({
                path: a.split(".").slice(1),
                componentId: d,
                meta: o
              });
          };
        if (g === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const a = p.getState().selectedIndicesMap.get(r);
            if (!a)
              return -1;
            const { keys: c } = F(e, t, o);
            if (!c)
              return -1;
            const S = a.split(".").pop();
            return c.indexOf(S);
          };
        if (g === "$clearSelected")
          return Y(e, t), () => {
            Je({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (g === "$map")
          return (r) => {
            const { value: a, keys: c } = F(
              e,
              t,
              o
            );
            if (te(e, d, t), !c || !Array.isArray(a))
              return [];
            const S = u({
              path: t,
              componentId: d,
              meta: o
            });
            return a.map((s, y) => {
              const w = c[y];
              if (!w) return;
              const A = [...t, w], M = u({
                path: A,
                // This now correctly points to the item in the shadow store.
                componentId: d,
                meta: o
              });
              return r(M, y, S);
            });
          };
        if (g === "$filter")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", { keys: c, value: S } = F(
              e,
              t,
              o
            );
            if (!Array.isArray(S))
              throw new Error("filter can only be used on arrays");
            const s = [];
            return S.forEach((y, w) => {
              if (r(y, w)) {
                const A = c[w];
                A && s.push(A);
              }
            }), u({
              path: t,
              componentId: d,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [a]: s
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
            const a = t.length > 0 ? t.join(".") : "root", { value: c, keys: S } = F(
              e,
              t,
              o
            );
            if (!Array.isArray(c) || !S)
              throw new Error("No array keys found for sorting");
            const s = c.map((w, A) => ({
              item: w,
              key: S[A]
            }));
            s.sort((w, A) => r(w.item, A.item));
            const y = s.map((w) => w.key);
            return u({
              path: t,
              componentId: d,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [a]: y
                },
                transforms: [
                  ...o?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (g === "$list")
          return (r) => /* @__PURE__ */ Q(() => {
            const c = q(/* @__PURE__ */ new Map()), [S, s] = ne({}), y = t.length > 0 ? t.join(".") : "root", w = lt(e, t, o), A = Ae(() => ({
              ...o,
              arrayViews: {
                ...o?.arrayViews || {},
                [y]: w
              }
            }), [o, y, w]), { value: M } = F(
              e,
              t,
              A
            );
            if (Z(() => {
              const O = p.getState().subscribeToPath(v, (z) => {
                if (z.type === "GET_SELECTED")
                  return;
                const B = p.getState().getShadowMetadata(e, t)?.transformCaches;
                if (B)
                  for (const ee of B.keys())
                    ee.startsWith(d) && B.delete(ee);
                (z.type === "INSERT" || z.type === "INSERT_MANY" || z.type === "REMOVE" || z.type === "CLEAR_SELECTION" || z.type === "SERVER_STATE_UPDATE" && !o?.serverStateIsUpStream) && s({});
              });
              return () => {
                O();
              };
            }, [d, v]), !Array.isArray(M))
              return null;
            const I = u({
              path: t,
              componentId: d,
              meta: A
              // Use updated meta here
            }), b = M.map((O, z) => {
              const J = w[z];
              if (!J)
                return null;
              let B = c.current.get(J);
              B || (B = ae(), c.current.set(J, B));
              const ee = [...t, J];
              return Se(Ue, {
                key: J,
                stateKey: e,
                itemComponentId: B,
                itemPath: ee,
                localIndex: z,
                arraySetter: I,
                rebuildStateShape: u,
                renderFn: r
              });
            });
            return /* @__PURE__ */ Q(Pe, { children: b });
          }, {});
        if (g === "$stateFlattenOn")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", c = o?.arrayViews?.[a], S = p.getState().getShadowValue(e, t, c);
            return Array.isArray(S) ? u({
              path: [...t, "[*]", r],
              componentId: d,
              meta: o
            }) : [];
          };
        if (g === "$index")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", c = o?.arrayViews?.[a];
            if (c) {
              const y = c[r];
              return y ? u({
                path: [...t, y],
                componentId: d,
                meta: o
              }) : void 0;
            }
            const S = E(e, t);
            if (!S?.arrayKeys) return;
            const s = S.arrayKeys[r];
            if (s)
              return u({
                path: [...t, s],
                componentId: d,
                meta: o
              });
          };
        if (g === "$last")
          return () => {
            const { keys: r } = F(e, t, o);
            if (!r || r.length === 0)
              return;
            const a = r[r.length - 1];
            if (!a)
              return;
            const c = [...t, a];
            return u({
              path: c,
              componentId: d,
              meta: o
            });
          };
        if (g === "$insert")
          return (r, a) => {
            n(r, t, {
              updateType: "insert",
              index: a
            });
          };
        if (g === "$insertMany")
          return (r) => {
            n(r, t, {
              updateType: "insert_many"
            });
          };
        if (g === "$uniqueInsert")
          return (r, a, c) => {
            const { value: S } = N(
              e,
              t,
              o
            ), s = L(r) ? r(S) : r;
            let y = null;
            if (!S.some((A) => {
              const M = a ? a.every(
                (I) => X(A[I], s[I])
              ) : X(A, s);
              return M && (y = A), M;
            }))
              n(s, t, { updateType: "insert" });
            else if (c && y) {
              const A = c(y), M = S.map(
                (I) => X(I, y) ? A : I
              );
              n(M, t, {
                updateType: "update"
              });
            }
          };
        if (g === "$cut")
          return (r, a) => {
            const c = E(e, t);
            if (!c?.arrayKeys || c.arrayKeys.length === 0)
              return;
            const S = r === -1 ? c.arrayKeys.length - 1 : r !== void 0 ? r : c.arrayKeys.length - 1, s = c.arrayKeys[S];
            s && n(null, [...t, s], {
              updateType: "cut"
            });
          };
        if (g === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: a } = F(e, t, o);
            if (!a || a.length === 0)
              return;
            const c = p.getState().selectedIndicesMap.get(r);
            if (!c)
              return;
            const S = c.split(".").pop();
            if (!a.includes(S))
              return;
            const s = c.split(".").slice(1);
            p.getState().clearSelectedIndex({ arrayKey: r });
            const y = s.slice(0, -1);
            Y(e, y), n(null, s, {
              updateType: "cut"
            });
          };
        if (g === "$cutByValue")
          return (r) => {
            const {
              isArray: a,
              value: c,
              keys: S
            } = F(e, t, o);
            if (!a) return;
            const s = le(c, S, (y) => y === r);
            s && n(null, [...t, s.key], {
              updateType: "cut"
            });
          };
        if (g === "$toggleByValue")
          return (r) => {
            const {
              isArray: a,
              value: c,
              keys: S
            } = F(e, t, o);
            if (!a) return;
            const s = le(c, S, (y) => y === r);
            if (s) {
              const y = [...t, s.key];
              n(null, y, {
                updateType: "cut"
              });
            } else
              n(r, t, { updateType: "insert" });
          };
        if (g === "$findWith")
          return (r, a) => {
            const { isArray: c, value: S, keys: s } = F(e, t, o);
            if (!c)
              throw new Error("findWith can only be used on arrays");
            const y = le(
              S,
              s,
              (w) => w?.[r] === a
            );
            return y ? u({
              path: [...t, y.key],
              componentId: d,
              meta: o
            }) : null;
          };
        if (g === "$cutThis") {
          const { value: r } = N(e, t, o), a = t.slice(0, -1);
          return Y(e, a), () => {
            n(r, t, { updateType: "cut" });
          };
        }
        if (g === "$get")
          return () => {
            te(e, d, t);
            const { value: r } = N(e, t, o);
            return r;
          };
        if (g === "$$derive")
          return (r) => pe({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: o
          });
        if (g === "$$get")
          return () => pe({ _stateKey: e, _path: t, _meta: o });
        if (g === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return He(r);
        }
        if (g == "getLocalStorage")
          return (r) => ce(i + "-" + e + "-" + r);
        if (g === "$isSelected") {
          const r = t.slice(0, -1);
          if (E(e, r)?.arrayKeys) {
            const c = e + "." + r.join("."), S = p.getState().selectedIndicesMap.get(c), s = e + "." + t.join(".");
            return S === s;
          }
          return;
        }
        if (g === "$setSelected")
          return (r) => {
            const a = t.slice(0, -1), c = e + "." + a.join("."), S = e + "." + t.join(".");
            Y(e, a, void 0), p.getState().selectedIndicesMap.get(c), r && p.getState().setSelectedIndex(c, S);
          };
        if (g === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), a = e + "." + r.join("."), c = e + "." + t.join(".");
            p.getState().selectedIndicesMap.get(a) === c ? p.getState().clearSelectedIndex({ arrayKey: a }) : p.getState().setSelectedIndex(a, c), Y(e, r);
          };
        if (g === "$clearValidation")
          return (r) => {
            const a = r ? [...t, ...r] : t, c = p.getState(), S = c.getShadowNode(e, a);
            if (console.log("startNode ", S), !S) return;
            const s = [[S, a]];
            for (console.log("stack ", s); s.length > 0; ) {
              const [y, w] = s.pop();
              if (console.log("while (stack.length ", y, w), !y || typeof y != "object") continue;
              if (y._meta?.validation) {
                y._meta.validation = {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now(),
                  validatedValue: void 0
                };
                const M = [e, ...w].join(".");
                c.notifyPathSubscribers(M, {
                  type: "VALIDATION_CLEAR"
                });
              }
              const A = Object.keys(y);
              for (const M of A)
                M !== "_meta" && s.push([y[M], [...w, M]]);
            }
            U(e);
          };
        if (t.length == 0) {
          if (g === "$_componentId")
            return d;
          if (g === "$setOptions")
            return (r) => {
              fe({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (g === "$_applyUpdate")
            return (r, a, c = "update") => {
              n(r, a, { updateType: c });
            };
          if (g === "$_getEffectiveSetState")
            return n;
          if (g === "$getPluginMetaData")
            return (r) => he(e, t)?.get(r);
          if (g === "$addPluginMetaData")
            return (r, a) => ve(e, t, r, a);
          if (g === "$removePluginMetaData")
            return (r) => we(e, t, r);
          if (g === "$addZodValidation")
            return (r, a) => {
              const c = p.getState();
              r.forEach((S) => {
                const s = S.path.map(String), y = c.getShadowMetadata(e, s) || {};
                c.setShadowMetadata(e, s, {
                  ...y,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: a || "client",
                        message: S.message,
                        severity: "error",
                        code: S.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                }), c.notifyPathSubscribers(
                  [e, ...s].join("."),
                  { type: "VALIDATION_UPDATE" }
                );
              }), U(e);
            };
          if (g === "$clearZodValidationPaths")
            return (r) => {
              const a = p.getState();
              r.forEach((c) => {
                const S = a.getShadowMetadata(e, c) || {};
                S.validation && (a.setShadowMetadata(e, c, {
                  ...S,
                  validation: {
                    status: "NOT_VALIDATED",
                    errors: [],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                }), a.notifyPathSubscribers(
                  [e, ...c].join("."),
                  { type: "VALIDATION_CLEAR" }
                ));
              }), U(e);
            };
          if (g === "$applyOperation")
            return (r, a) => {
              let c;
              if (r.insertAfterId && r.updateType === "insert") {
                const S = E(e, r.path);
                if (S?.arrayKeys) {
                  const s = S.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  s !== -1 && (c = s + 1);
                }
              }
              n(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                index: c,
                // Pass the calculated index
                metaData: a
              });
            };
          if (g === "$applyJsonPatch")
            return (r) => {
              const a = p.getState(), c = a.getShadowMetadata(e, []);
              if (!c?.components) return;
              const S = (y) => !y || y === "/" ? [] : y.split("/").slice(1).map((w) => w.replace(/~1/g, "/").replace(/~0/g, "~")), s = /* @__PURE__ */ new Set();
              for (const y of r) {
                const w = S(y.path);
                switch (y.op) {
                  case "add":
                  case "replace": {
                    const { value: A } = y;
                    a.updateShadowAtPath(e, w, A), a.markAsDirty(e, w, { bubble: !0 });
                    let M = [...w];
                    for (; ; ) {
                      const I = a.getShadowMetadata(
                        e,
                        M
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((b) => {
                        if (!s.has(b)) {
                          const O = c.components?.get(b);
                          O && (O.forceUpdate(), s.add(b));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const A = w.slice(0, -1);
                    a.removeShadowArrayElement(e, w), a.markAsDirty(e, A, { bubble: !0 });
                    let M = [...A];
                    for (; ; ) {
                      const I = a.getShadowMetadata(
                        e,
                        M
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((b) => {
                        if (!s.has(b)) {
                          const O = c.components?.get(b);
                          O && (O.forceUpdate(), s.add(b));
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
            return () => E(e, [])?.components;
        }
        if (g === "$validationWrapper")
          return ({
            children: r,
            hideMessage: a
          }) => /* @__PURE__ */ Q(
            Oe,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
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
              const a = p.getState().getShadowMetadata(e, t);
              W(e, t, {
                ...a,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const c = [e, ...t].join(".");
              Qe(c, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (g === "$toggle") {
          const { value: r } = N(
            e,
            t,
            o
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
          return (r, a) => {
            const c = Array.isArray(r), S = c ? r : void 0, s = c ? a : r;
            if (!s || typeof s != "function")
              throw new Error(
                "CogsState: $isolate requires a render function."
              );
            return /* @__PURE__ */ Q(
              je,
              {
                stateKey: e,
                path: t,
                dependencies: S,
                rebuildStateShape: u,
                renderFn: s
              }
            );
          };
        if (g === "$formElement")
          return (r, a) => /* @__PURE__ */ Q(
            Ne,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: u,
              setState: n,
              formOpts: a,
              renderFn: r
            }
          );
        const D = [...t, g];
        return u({
          path: D,
          componentId: d,
          meta: o
        });
      }
    }, x = new Proxy(_, P);
    return f.set(T, x), x;
  }
  const h = {
    $revertToInitialState: (t) => {
      const o = p.getState().getShadowMetadata(e, []);
      let d;
      o?.stateSource === "server" && o.baseServerState ? d = o.baseServerState : d = p.getState().initialStateGlobal[e], qe(e), K(e, d), u({
        path: [],
        componentId: l
      });
      const $ = j(e), V = L($?.localStorage?.key) ? $?.localStorage?.key(d) : $?.localStorage?.key, T = i && V ? `${i}-${e}-${V}` : void 0;
      return de(T), U(e), d;
    },
    $initializeAndMergeShadowState: (t) => {
      Re(e, t), U(e);
    },
    $updateInitialState: (t) => {
      const o = Te(
        e,
        n,
        l,
        i
      ), d = p.getState().initialStateGlobal[e], $ = j(e), V = L($?.localStorage?.key) ? $?.localStorage?.key(d) : $?.localStorage?.key, T = i && V ? `${i}-${e}-${V}` : void 0;
      return de(T), ke(() => {
        Ve(e, t), K(e, t);
        const v = p.getState().getShadowMetadata(e, []);
        v && v?.components?.forEach((_) => {
          _.forceUpdate();
        });
      }), {
        fetchId: (v) => o.$get()[v]
      };
    }
  };
  return u({
    componentId: l,
    path: []
  });
}
function pe(e) {
  return Se(gt, { proxy: e });
}
function gt({
  proxy: e
}) {
  const n = q(null), l = q(null), i = q(!1), f = `${e._stateKey}-${e._path.join(".")}`, u = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[u], m = C(e._stateKey, e._path, h);
  return Z(() => {
    const t = n.current;
    if (!t || i.current) return;
    const o = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", f);
        return;
      }
      const d = t.parentElement, V = Array.from(d.childNodes).indexOf(t);
      let T = d.getAttribute("data-parent-id");
      T || (T = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", T)), l.current = `instance-${crypto.randomUUID()}`;
      const v = p.getState().getShadowMetadata(e._stateKey, e._path) || {}, _ = v.signals || [];
      _.push({
        instanceId: l.current,
        parentId: T,
        position: V,
        effect: e._effect
      }), p.getState().setShadowMetadata(e._stateKey, e._path, {
        ...v,
        signals: _
      });
      let P = m;
      if (e._effect)
        try {
          P = new Function(
            "state",
            `return (${e._effect})(state)`
          )(m);
        } catch (G) {
          console.error("Error evaluating effect function:", G);
        }
      P !== null && typeof P == "object" && (P = JSON.stringify(P));
      const x = document.createTextNode(String(P ?? ""));
      t.replaceWith(x), i.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(o), l.current) {
        const d = p.getState().getShadowMetadata(e._stateKey, e._path) || {};
        d.signals && (d.signals = d.signals.filter(
          ($) => $.instanceId !== l.current
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
  bt as createCogsState,
  ct as useCogsStateFn
};
//# sourceMappingURL=CogsState.js.map
