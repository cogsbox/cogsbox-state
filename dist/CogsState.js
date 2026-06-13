"use client";
import { jsx as Q, Fragment as Te } from "react/jsx-runtime";
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
  updateInitialStateGlobal: be,
  getShadowMetadata: V,
  setShadowMetadata: W,
  getShadowValue: C,
  initializeShadowState: K,
  initializeAndMergeShadowState: Re,
  updateShadowAtPath: Le,
  insertShadowArrayElement: We,
  insertManyShadowArrayElements: Ve,
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
  const i = V(e, n);
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
    const y = (t, o) => {
      for (const d in o)
        o.hasOwnProperty(d) && (o[d] instanceof Object && !Array.isArray(o[d]) && t[d] instanceof Object ? X(t[d], o[d]) || (y(t[d], o[d]), h = !0) : t[d] !== o[d] && (t[d] = o[d], h = !0));
      return t;
    };
    u = y(u, n);
  }
  if (u.validation && (n?.validation?.hasOwnProperty("onBlur") || i?.validation?.hasOwnProperty("onBlur") || f?.validation?.hasOwnProperty("onBlur") || (u.validation.onBlur = "error", h = !0)), h) {
    ye(e, u);
    const y = u.validation?.zodSchemaV4, t = u.validation?.zodSchemaV3;
    (y !== i?.validation?.zodSchemaV4 || t !== i?.validation?.zodSchemaV3) && (y || t) && (y ? H(e, y, "zod4") : t && H(e, t, "zod3"), U(e));
  }
  return u;
}
const Vt = (e, n) => {
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
    const E = j(o), b = E ? {
      ...E,
      formElements: n?.formElements,
      validation: {
        ...E.validation,
        ...d.validation
      }
    } : d;
    Object.keys(b).length > 0 && ye(o, b);
  }), Object.keys(f).forEach((o) => {
    K(o, f[o]);
  });
  const h = (o, d) => {
    const [E] = ne(d?.componentId ?? ae()), b = fe({
      stateKey: o,
      options: d,
      initialOptionsPart: u
    }), $ = q(b);
    $.current = b;
    const v = C(o, []) || f[o], _ = ct(v, {
      stateKey: o,
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
    return re(() => {
      d && R.getState().setPluginOptionsForState(o, d);
    }, [o, d]), re(() => (R.getState().registerStateHandler(o, _), () => {
      R.getState().unregisterStateHandler(o);
    }), [o, _]), re(() => {
      const T = j(o)?.validation;
      T?.zodSchemaV4 ? H(o, T.zodSchemaV4, "zod4") : T?.zodSchemaV3 && H(o, T.zodSchemaV3, "zod3");
    }), _;
  };
  function y(o, d) {
    if (fe({ stateKey: o, options: d, initialOptionsPart: u }), d.localStorage && Xe(o, d), d.formElements) {
      const b = R.getState().registeredPlugins.map(($) => d.formElements.hasOwnProperty($.name) ? {
        ...$,
        formWrapper: d.formElements[$.name]
      } : $);
      R.getState().setRegisteredPlugins(b);
    }
    U(o);
  }
  function t(o) {
    Object.keys(f).forEach((E) => {
      y(E, o);
    });
  }
  return {
    useCogsState: h,
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
  const u = L(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (u && i) {
    const h = `${i}-${n}-${u}`;
    let y;
    try {
      y = ce(h)?.lastSyncedWithServer;
    } catch {
    }
    const t = V(n, []), o = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y,
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
  const n = V(e, []);
  if (!n) return;
  const l = /* @__PURE__ */ new Set();
  n?.components?.forEach((i) => {
    (i ? Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"] : null)?.includes("none") || l.add(() => i.forceUpdate());
  }), queueMicrotask(() => {
    l.forEach((i) => i());
  });
};
function oe(e, n, l, i) {
  const f = V(e, n);
  if (W(e, n, {
    ...f,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: i || Date.now()
  }), Array.isArray(l)) {
    const u = V(e, n);
    u?.arrayKeys && u.arrayKeys.forEach((h, y) => {
      const t = [...n, h], o = l[y];
      o !== void 0 && oe(
        e,
        t,
        o,
        i
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((u) => {
    const h = [...n, u], y = l[u];
    oe(e, h, y, i);
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
    let y = n;
    if (f && n !== null)
      try {
        y = new Function("state", `return (${f})(state)`)(
          n
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    y !== null && typeof y == "object" && (y = JSON.stringify(y)), h[i].textContent = String(y ?? "");
  });
}
function tt(e, n, l) {
  const i = V(e, []);
  if (!i?.components)
    return /* @__PURE__ */ new Set();
  const f = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let u = [...n];
    for (; ; ) {
      const h = V(e, u);
      if (h?.pathComponents && h.pathComponents.forEach((y) => {
        const t = i.components?.get(y);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || f.add(t));
      }), u.length === 0) break;
      u.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Ce(l.newValue) && _e(l.newValue, l.oldValue).forEach((y) => {
      const t = y.split("."), o = [...n, ...t], d = V(e, o);
      d?.pathComponents && d.pathComponents.forEach((E) => {
        const b = i.components?.get(E);
        b && ((Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"]).includes("none") || f.add(b));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    let h = [...l.type === "insert" ? n : n.slice(0, -1)];
    for (; ; ) {
      const y = V(e, h);
      if (y?.pathComponents && y.pathComponents.forEach((t) => {
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
  const u = V(e, n);
  return {
    type: "update",
    oldValue: i,
    newValue: f,
    shadowMeta: u
  };
}
function nt(e, n, l) {
  Ve(e, n, l), se(e, n, { bubble: !0 });
  const i = V(e, n);
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
  const y = V(e, n);
  let t;
  return y?.arrayKeys && i !== void 0 && i > 0 && (t = y.arrayKeys[i - 1]), {
    type: "insert",
    newValue: u,
    shadowMeta: y,
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
    ).forEach((y) => {
      e.add(y);
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
  function i(f, u, h, y) {
    let t;
    switch (y.updateType) {
      case "update":
        t = rt(f, u, h);
        break;
      case "insert":
        t = at(
          f,
          u,
          h,
          y.index,
          y.itemId
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
      updateType: y.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: y.metaData
    };
    ie.push(o), t.newValue !== void 0 && Ze(
      t.newValue,
      f,
      l.current,
      n
    ), l.current?.middleware && l.current.middleware({ update: o }), ze(o, y.validationTrigger || "programmatic"), Ye(o);
  }
}
function ct(e, {
  stateKey: n,
  localStorage: l,
  formElements: i,
  reactiveDeps: f,
  reactiveType: u,
  componentId: h,
  defaultState: y,
  dependencies: t,
  serverState: o
} = {}) {
  const [d, E] = ne({}), { sessionId: b } = Me();
  let $ = !n;
  const [v] = ne(n ?? ae()), _ = q(h ?? ae()), T = q(
    null
  );
  T.current = j(v) ?? null;
  const x = Ie(
    (I) => {
      const r = I ? { ...j(v), ...I } : j(v), a = r?.defaultState || y || e;
      if (r?.serverState?.status === "success" && r?.serverState?.data !== void 0)
        return {
          value: r.serverState.data,
          source: "server",
          timestamp: r.serverState.timestamp || Date.now()
        };
      if (r?.localStorage?.key && b) {
        const S = L(r.localStorage.key) ? r.localStorage.key(a) : r.localStorage.key, c = ce(
          `${b}-${v}-${S}`
        );
        if (c && c.lastUpdated > (r?.serverState?.timestamp || 0))
          return {
            value: c.state,
            source: "localStorage",
            timestamp: c.lastUpdated
          };
      }
      return {
        value: a || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [v, y, e, b]
  );
  Z(() => {
    o && o.status === "success" && o.data !== void 0 && me(v, o);
  }, [o, v]), Z(() => p.getState().subscribeToPath(v, (k) => {
    if (k?.type === "SERVER_STATE_UPDATE") {
      const r = k.serverState;
      if (r?.status !== "success" || r.data === void 0)
        return;
      ue(v, { serverState: r });
      const a = typeof r.merge == "object" ? r.merge : r.merge === !0 ? { strategy: "append", key: "id" } : null, s = C(v, []), S = r.data;
      if (a && a.strategy === "append" && "key" in a && Array.isArray(s) && Array.isArray(S)) {
        const c = a.key;
        if (!c) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const m = new Set(
          s.map((M) => M[c])
        ), w = S.filter(
          (M) => !m.has(M[c])
        );
        w.length > 0 && Ve(v, [], w);
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
    const I = p.getState().getShadowMetadata(v, []);
    if (I && I.stateSource)
      return;
    const k = j(v), r = {
      localStorageEnabled: !!k?.localStorage?.key
    };
    if (W(v, [], {
      ...I,
      features: r
    }), k?.defaultState !== void 0 || y !== void 0) {
      const m = k?.defaultState || y;
      k?.defaultState || ue(v, {
        defaultState: m
      });
    }
    const { value: a, source: s, timestamp: S } = x();
    K(v, a);
    const c = j(v)?.validation;
    c?.zodSchemaV4 ? H(v, c.zodSchemaV4, "zod4") : c?.zodSchemaV3 && H(v, c.zodSchemaV3, "zod3"), W(v, [], {
      stateSource: s,
      lastServerSync: s === "server" ? S : void 0,
      isDirty: s === "server" ? !1 : void 0,
      baseServerState: s === "server" ? a : void 0
    }), s === "server" && o && me(v, o), U(v);
  }, [v, ...t || []]), re(() => {
    $ && ue(v, {
      formElements: i,
      defaultState: y,
      localStorage: l,
      middleware: T.current?.middleware
    });
    const I = `${v}////${_.current}`, k = V(v, []), r = k?.components || /* @__PURE__ */ new Map();
    return r.set(I, {
      forceUpdate: () => E({}),
      reactiveType: u ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: f || void 0,
      deps: f ? f(C(v, [])) : [],
      prevDeps: f ? f(C(v, [])) : []
    }), W(v, [], {
      ...k,
      components: r
    }), E({}), () => {
      const a = V(v, []), s = a?.components?.get(I);
      s?.paths && s.paths.forEach((S) => {
        const m = S.split(".").slice(1), w = p.getState().getShadowMetadata(v, m);
        w?.pathComponents && w.pathComponents.size === 0 && (delete w.pathComponents, p.getState().setShadowMetadata(v, m, w));
      }), a?.components && W(v, [], a);
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
const lt = (e, n, l) => {
  let i = V(e, n)?.arrayKeys || [];
  const f = l?.transforms;
  if (!f || f.length === 0)
    return i;
  for (const u of f)
    if (u.type === "filter") {
      const h = [];
      i.forEach((y, t) => {
        const o = C(e, [...n, y]);
        u.fn(o, t) && h.push(y);
      }), i = h;
    } else u.type === "sort" && i.sort((h, y) => {
      const t = C(e, [...n, h]), o = C(e, [...n, y]);
      return u.fn(t, o);
    });
  return i;
}, te = (e, n, l) => {
  const i = `${e}////${n}`, u = V(e, [])?.components?.get(i);
  !u || u.reactiveType === "none" || !(Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType]).includes("component") || Ge(e, l, i);
}, Y = (e, n, l) => {
  const i = V(e, []), f = /* @__PURE__ */ new Set();
  i?.components && i.components.forEach((h, y) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), f.add(y));
  }), V(e, [
    ...n,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    i?.components?.get(h)?.forceUpdate();
  });
  const u = V(e, n);
  for (let h of u?.arrayKeys || []) {
    const y = h + ".selected", t = V(e, y.split(".").slice(1));
    h == l && t?.pathComponents?.forEach((o) => {
      i?.components?.get(o)?.forceUpdate();
    });
  }
};
function N(e, n, l) {
  const i = V(e, n), f = n.length > 0 ? n.join(".") : "root", u = l?.arrayViews?.[f];
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
function Pe(e, n, l, i) {
  const f = /* @__PURE__ */ new Map();
  function u({
    path: t = [],
    meta: o,
    componentId: d
  }) {
    if (V(e, t)?.isRaw)
      return C(e, t);
    const b = o ? JSON.stringify(o.arrayViews || o.transforms) : "", $ = t.join(".") + ":" + d + ":" + b;
    if (f.has($))
      return f.get($);
    const v = [e, ...t].join("."), _ = () => {
    }, T = {
      apply(G, g, I) {
        if (I.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", a = o?.arrayViews?.[r];
          return te(e, d, t), C(e, t, a);
        }
        const k = I[0];
        return n(k, t, { updateType: "update" }), !0;
      },
      get(G, g, I) {
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
          return Reflect.get(G, g, I);
        if (typeof g != "string")
          return Reflect.get(G, g);
        if (t.length === 0 && g in h)
          return h[g];
        if (typeof g == "string" && !g.startsWith("$")) {
          const { value: r } = N(e, t, o);
          if (r !== null && typeof r == "object" && !Array.isArray(r) && Object.prototype.hasOwnProperty.call(r, g)) {
            const c = [...t, g];
            return u({
              path: c,
              componentId: d,
              meta: o
            });
          }
          const s = R.getState().registeredPlugins;
          for (const c of s) {
            const m = c.chainMethods?.[g];
            if (m && ut(t, m.pathPattern) && dt(r, m.target))
              return (...w) => {
                const A = R.getState(), M = A.pluginOptions.get(e)?.get(c.name), D = A.getHookResult(e, c.name);
                return m.handler(
                  {
                    stateKey: e,
                    path: t,
                    pluginName: c.name,
                    options: M,
                    hookData: D,
                    $get: () => N(e, t, o).value,
                    $update: (P) => (n(P, t, {
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
                    $applyOperation: (P, O) => {
                      n(P.newValue, P.path, {
                        updateType: P.updateType,
                        itemId: P.itemId,
                        metaData: O
                      });
                    },
                    getFieldMetaData: () => he(e, t)?.get(c.name),
                    setFieldMetaData: (P) => ve(e, t, c.name, P),
                    removeFieldMetaData: () => we(e, t, c.name),
                    getFieldRefs: () => Ee(e, t),
                    getFieldElements: () => $e(e, t),
                    setFieldDisabled: (P) => ft(e, t, P)
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
            const s = p.getState().getShadowValue(e, []), S = r?.validation?.key;
            try {
              const c = await a.action(s);
              if (c && !c.success && c.errors, c?.success) {
                const m = p.getState().getShadowMetadata(e, []);
                W(e, [], {
                  ...m,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: s
                  // Update base server state
                }), a.onSuccess && a.onSuccess(c.data);
              } else !c?.success && a.onError && a.onError(c.error);
              return c;
            } catch (c) {
              return a.onError && a.onError(c), { success: !1, error: c };
            }
          };
        if (g === "$_status" || g === "$getStatus") {
          const r = () => {
            const { shadowMeta: a, value: s } = N(e, t, o);
            return a?.isDirty === !0 ? "dirty" : a?.stateSource === "server" || a?.isDirty === !1 ? "synced" : a?.stateSource === "localStorage" ? "restored" : a?.stateSource === "default" || s !== void 0 ? "fresh" : "unknown";
          };
          return g === "$_status" ? r() : r;
        }
        if (g === "$removeStorage")
          return () => {
            const r = p.getState().initialStateGlobal[e], a = j(e), s = L(a?.localStorage?.key) ? a.localStorage.key(r) : a?.localStorage?.key, S = i && s ? `${i}-${e}-${s}` : void 0;
            de(S);
          };
        if (g === "$setRaw")
          return (r) => {
            const a = V(e, t) || {};
            W(e, t, { ...a, isRaw: !0 }), n(r, t, { updateType: "update" });
          };
        if (g === "$validate")
          return () => {
            const r = p.getState(), { value: a } = N(e, t, o), s = r.getInitialOptions(e), S = s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3;
            if (!S)
              return { success: !0, data: a };
            const c = S.safeParse(a);
            if (c.success) {
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
              (c.error?.issues || c.error?.errors || []).forEach((w) => {
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
            return U(e), c;
          };
        if (g === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = N(e, t, o);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((a) => a.severity === "error").map((a) => a.message) : [];
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
            const s = t.join("."), S = o?.arrayViews?.[s], c = a.split(".").pop();
            if (!(S && !S.includes(c) || C(
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
            const { keys: s } = F(e, t, o);
            if (!s)
              return -1;
            const S = a.split(".").pop();
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
            const { value: a, keys: s } = F(
              e,
              t,
              o
            );
            if (te(e, d, t), !s || !Array.isArray(a))
              return [];
            const S = u({
              path: t,
              componentId: d,
              meta: o
            });
            return a.map((c, m) => {
              const w = s[m];
              if (!w) return;
              const A = [...t, w], M = u({
                path: A,
                // This now correctly points to the item in the shadow store.
                componentId: d,
                meta: o
              });
              return r(M, m, S);
            });
          };
        if (g === "$filter")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", { keys: s, value: S } = F(
              e,
              t,
              o
            );
            if (!Array.isArray(S))
              throw new Error("filter can only be used on arrays");
            const c = [];
            return S.forEach((m, w) => {
              if (r(m, w)) {
                const A = s[w];
                A && c.push(A);
              }
            }), u({
              path: t,
              componentId: d,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [a]: c
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
            const a = t.length > 0 ? t.join(".") : "root", { value: s, keys: S } = F(
              e,
              t,
              o
            );
            if (!Array.isArray(s) || !S)
              throw new Error("No array keys found for sorting");
            const c = s.map((w, A) => ({
              item: w,
              key: S[A]
            }));
            c.sort((w, A) => r(w.item, A.item));
            const m = c.map((w) => w.key);
            return u({
              path: t,
              componentId: d,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [a]: m
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
            const s = q(/* @__PURE__ */ new Map()), [S, c] = ne({}), m = t.length > 0 ? t.join(".") : "root", w = lt(e, t, o), A = Ae(() => ({
              ...o,
              arrayViews: {
                ...o?.arrayViews || {},
                [m]: w
              }
            }), [o, m, w]), { value: M } = F(
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
                (z.type === "INSERT" || z.type === "INSERT_MANY" || z.type === "REMOVE" || z.type === "CLEAR_SELECTION" || z.type === "SERVER_STATE_UPDATE" && !o?.serverStateIsUpStream) && c({});
              });
              return () => {
                O();
              };
            }, [d, v]), !Array.isArray(M))
              return null;
            const D = u({
              path: t,
              componentId: d,
              meta: A
              // Use updated meta here
            }), P = M.map((O, z) => {
              const J = w[z];
              if (!J)
                return null;
              let B = s.current.get(J);
              B || (B = ae(), s.current.set(J, B));
              const ee = [...t, J];
              return Se(Ue, {
                key: J,
                stateKey: e,
                itemComponentId: B,
                itemPath: ee,
                localIndex: z,
                arraySetter: D,
                rebuildStateShape: u,
                renderFn: r
              });
            });
            return /* @__PURE__ */ Q(Te, { children: P });
          }, {});
        if (g === "$stateFlattenOn")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", s = o?.arrayViews?.[a], S = p.getState().getShadowValue(e, t, s);
            return Array.isArray(S) ? u({
              path: [...t, "[*]", r],
              componentId: d,
              meta: o
            }) : [];
          };
        if (g === "$index")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", s = o?.arrayViews?.[a];
            if (s) {
              const m = s[r];
              return m ? u({
                path: [...t, m],
                componentId: d,
                meta: o
              }) : void 0;
            }
            const S = V(e, t);
            if (!S?.arrayKeys) return;
            const c = S.arrayKeys[r];
            if (c)
              return u({
                path: [...t, c],
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
            const s = [...t, a];
            return u({
              path: s,
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
          return (r, a, s) => {
            const { value: S } = N(
              e,
              t,
              o
            ), c = L(r) ? r(S) : r;
            let m = null;
            if (!S.some((A) => {
              const M = a ? a.every(
                (D) => X(A[D], c[D])
              ) : X(A, c);
              return M && (m = A), M;
            }))
              n(c, t, { updateType: "insert" });
            else if (s && m) {
              const A = s(m), M = S.map(
                (D) => X(D, m) ? A : D
              );
              n(M, t, {
                updateType: "update"
              });
            }
          };
        if (g === "$cut")
          return (r, a) => {
            const s = V(e, t);
            if (!s?.arrayKeys || s.arrayKeys.length === 0)
              return;
            const S = r === -1 ? s.arrayKeys.length - 1 : r !== void 0 ? r : s.arrayKeys.length - 1, c = s.arrayKeys[S];
            c && n(null, [...t, c], {
              updateType: "cut"
            });
          };
        if (g === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: a } = F(e, t, o);
            if (!a || a.length === 0)
              return;
            const s = p.getState().selectedIndicesMap.get(r);
            if (!s)
              return;
            const S = s.split(".").pop();
            if (!a.includes(S))
              return;
            const c = s.split(".").slice(1);
            p.getState().clearSelectedIndex({ arrayKey: r });
            const m = c.slice(0, -1);
            Y(e, m), n(null, c, {
              updateType: "cut"
            });
          };
        if (g === "$cutByValue")
          return (r) => {
            const {
              isArray: a,
              value: s,
              keys: S
            } = F(e, t, o);
            if (!a) return;
            const c = le(s, S, (m) => m === r);
            c && n(null, [...t, c.key], {
              updateType: "cut"
            });
          };
        if (g === "$toggleByValue")
          return (r) => {
            const {
              isArray: a,
              value: s,
              keys: S
            } = F(e, t, o);
            if (!a) return;
            const c = le(s, S, (m) => m === r);
            if (c) {
              const m = [...t, c.key];
              n(null, m, {
                updateType: "cut"
              });
            } else
              n(r, t, { updateType: "insert" });
          };
        if (g === "$findWith")
          return (r, a) => {
            const { isArray: s, value: S, keys: c } = F(e, t, o);
            if (!s)
              throw new Error("findWith can only be used on arrays");
            const m = le(
              S,
              c,
              (w) => w?.[r] === a
            );
            return m ? u({
              path: [...t, m.key],
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
          if (V(e, r)?.arrayKeys) {
            const s = e + "." + r.join("."), S = p.getState().selectedIndicesMap.get(s), c = e + "." + t.join(".");
            return S === c;
          }
          return;
        }
        if (g === "$setSelected")
          return (r) => {
            const a = t.slice(0, -1), s = e + "." + a.join("."), S = e + "." + t.join(".");
            Y(e, a, void 0), p.getState().selectedIndicesMap.get(s), r && p.getState().setSelectedIndex(s, S);
          };
        if (g === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), a = e + "." + r.join("."), s = e + "." + t.join(".");
            p.getState().selectedIndicesMap.get(a) === s ? p.getState().clearSelectedIndex({ arrayKey: a }) : p.getState().setSelectedIndex(a, s), Y(e, r);
          };
        if (g === "$clearValidation")
          return (r) => {
            const a = r ? [...t, ...r] : t, s = p.getState(), S = s.getShadowNode(e, a);
            if (console.log("startNode ", S), !S) return;
            const c = [[S, a]];
            for (console.log("stack ", c); c.length > 0; ) {
              const [m, w] = c.pop();
              if (console.log("while (stack.length ", m, w), !m || typeof m != "object") continue;
              if (m._meta?.validation) {
                m._meta.validation = {
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
              const A = Object.keys(m);
              for (const M of A)
                M !== "_meta" && c.push([m[M], [...w, M]]);
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
            return (r, a, s = "update") => {
              n(r, a, { updateType: s });
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
              const s = p.getState();
              r.forEach((S) => {
                const c = S.path.map(String), m = s.getShadowMetadata(e, c) || {};
                s.setShadowMetadata(e, c, {
                  ...m,
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
                }), s.notifyPathSubscribers(
                  [e, ...c].join("."),
                  { type: "VALIDATION_UPDATE" }
                );
              }), U(e);
            };
          if (g === "$clearZodValidationPaths")
            return (r) => {
              const a = p.getState();
              r.forEach((s) => {
                const S = a.getShadowMetadata(e, s) || {};
                S.validation && (a.setShadowMetadata(e, s, {
                  ...S,
                  validation: {
                    status: "NOT_VALIDATED",
                    errors: [],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                }), a.notifyPathSubscribers(
                  [e, ...s].join("."),
                  { type: "VALIDATION_CLEAR" }
                ));
              }), U(e);
            };
          if (g === "$applyOperation")
            return (r, a) => {
              let s;
              if (r.insertAfterId && r.updateType === "insert") {
                const S = V(e, r.path);
                if (S?.arrayKeys) {
                  const c = S.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  c !== -1 && (s = c + 1);
                }
              }
              n(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                index: s,
                // Pass the calculated index
                metaData: a
              });
            };
          if (g === "$applyJsonPatch")
            return (r) => {
              const a = p.getState(), s = a.getShadowMetadata(e, []);
              if (!s?.components) return;
              const S = (m) => !m || m === "/" ? [] : m.split("/").slice(1).map((w) => w.replace(/~1/g, "/").replace(/~0/g, "~")), c = /* @__PURE__ */ new Set();
              for (const m of r) {
                const w = S(m.path);
                switch (m.op) {
                  case "add":
                  case "replace": {
                    const { value: A } = m;
                    a.updateShadowAtPath(e, w, A), a.markAsDirty(e, w, { bubble: !0 });
                    let M = [...w];
                    for (; ; ) {
                      const D = a.getShadowMetadata(
                        e,
                        M
                      );
                      if (D?.pathComponents && D.pathComponents.forEach((P) => {
                        if (!c.has(P)) {
                          const O = s.components?.get(P);
                          O && (O.forceUpdate(), c.add(P));
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
                      const D = a.getShadowMetadata(
                        e,
                        M
                      );
                      if (D?.pathComponents && D.pathComponents.forEach((P) => {
                        if (!c.has(P)) {
                          const O = s.components?.get(P);
                          O && (O.forceUpdate(), c.add(P));
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
            return () => V(e, [])?.components;
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
              const s = [e, ...t].join(".");
              Qe(s, {
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
            const s = Array.isArray(r), S = s ? r : void 0, c = s ? a : r;
            if (!c || typeof c != "function")
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
                renderFn: c
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
        const k = [...t, g];
        return u({
          path: k,
          componentId: d,
          meta: o
        });
      }
    }, x = new Proxy(_, T);
    return f.set($, x), x;
  }
  const h = {
    $revertToInitialState: (t) => {
      const o = p.getState().getShadowMetadata(e, []);
      let d;
      o?.stateSource === "server" && o.baseServerState ? d = o.baseServerState : d = p.getState().initialStateGlobal[e], qe(e), K(e, d), u({
        path: [],
        componentId: l
      });
      const E = j(e), b = L(E?.localStorage?.key) ? E?.localStorage?.key(d) : E?.localStorage?.key, $ = i && b ? `${i}-${e}-${b}` : void 0;
      return de($), U(e), d;
    },
    $initializeAndMergeShadowState: (t) => {
      Re(e, t), U(e);
    },
    $updateInitialState: (t) => {
      const o = Pe(
        e,
        n,
        l,
        i
      ), d = p.getState().initialStateGlobal[e], E = j(e), b = L(E?.localStorage?.key) ? E?.localStorage?.key(d) : E?.localStorage?.key, $ = i && b ? `${i}-${e}-${b}` : void 0;
      return de($), ke(() => {
        be(e, t), K(e, t);
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
  const n = q(null), l = q(null), i = q(!1), f = `${e._stateKey}-${e._path.join(".")}`, u = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[u], y = C(e._stateKey, e._path, h);
  return Z(() => {
    const t = n.current;
    if (!t || i.current) return;
    const o = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", f);
        return;
      }
      const d = t.parentElement, b = Array.from(d.childNodes).indexOf(t);
      let $ = d.getAttribute("data-parent-id");
      $ || ($ = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", $)), l.current = `instance-${crypto.randomUUID()}`;
      const v = p.getState().getShadowMetadata(e._stateKey, e._path) || {}, _ = v.signals || [];
      _.push({
        instanceId: l.current,
        parentId: $,
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
      if (clearTimeout(o), l.current) {
        const d = p.getState().getShadowMetadata(e._stateKey, e._path) || {};
        d.signals && (d.signals = d.signals.filter(
          (E) => E.instanceId !== l.current
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
  Vt as createCogsState,
  ct as useCogsStateFn
};
//# sourceMappingURL=CogsState.js.map
