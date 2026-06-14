"use client";
import { jsx as Q, Fragment as Pe } from "react/jsx-runtime";
import { pluginStore as L } from "./pluginStore.js";
import { useState as ne, useRef as x, useCallback as Ie, useEffect as Z, useLayoutEffect as re, useMemo as pe, createElement as Se, startTransition as De } from "react";
import { transformStateFunc as ke, isFunction as W, isDeepEqual as X, isArray as Ce, getDifferences as _e } from "./utility.js";
import { ValidationWrapper as Oe, IsolatedComponentWrapper as je, FormElementWrapper as Ne, MemoizedCogsItemWrapper as Ue } from "./Components.js";
import Fe from "superjson";
import { v4 as ae } from "uuid";
import { getGlobalStore as M, updateShadowTypeInfo as H } from "./store.js";
import { useCogsConfig as Me } from "./CogsStateClient.js";
import { runValidation as ze } from "./validation.js";
const {
  getInitialOptions: U,
  updateInitialStateGlobal: Ve,
  getShadowMetadata: E,
  setShadowMetadata: B,
  getShadowValue: _,
  initializeShadowState: K,
  initializeAndMergeShadowState: Re,
  updateShadowAtPath: Le,
  insertShadowArrayElement: We,
  insertManyShadowArrayElements: be,
  removeShadowArrayElement: Be,
  setInitialStateOptions: ye,
  setServerStateUpdate: me,
  markAsDirty: ie,
  addPathComponent: Ge,
  clearSelectedIndexesForState: qe,
  addStateLog: xe,
  clearSelectedIndex: Je,
  getSyncInfo: He,
  notifyPathSubscribers: Qe,
  getPluginMetaDataMap: he,
  setPluginMetaData: ve,
  removePluginMetaData: we
} = M.getState(), { notifyUpdate: Ye } = L.getState();
function z(e, a, l) {
  const s = E(e, a);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: M.getState().getShadowValue(e, a), keys: [] };
  const u = a.length > 0 ? a.join(".") : "root", h = l?.arrayViews?.[u] ?? s.arrayKeys;
  return Array.isArray(h) && h.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: M.getState().getShadowValue(e, a, h), keys: h ?? [] };
}
function le(e, a, l) {
  for (let s = 0; s < e.length; s++)
    if (l(e[s], s)) {
      const S = a[s];
      if (S)
        return { key: S, index: s, value: e[s] };
    }
  return null;
}
function ue(e, a) {
  const s = {
    ...U(e) || {},
    ...a
  };
  (s.validation?.zodSchemaV4 || s.validation?.zodSchemaV3) && !s.validation?.onBlur && (s.validation.onBlur = "error"), ye(e, s);
}
function fe({
  stateKey: e,
  options: a,
  initialOptionsPart: l
}) {
  const s = U(e) || {}, S = l[e] || {};
  let u = { ...S, ...s }, h = !1;
  if (a) {
    const y = (t, o) => {
      for (const d in o)
        o.hasOwnProperty(d) && (o[d] instanceof Object && !Array.isArray(o[d]) && t[d] instanceof Object ? X(t[d], o[d]) || (y(t[d], o[d]), h = !0) : t[d] !== o[d] && (t[d] = o[d], h = !0));
      return t;
    };
    u = y(u, a);
  }
  if (u.validation && (a?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || S?.validation?.hasOwnProperty("onBlur") || (u.validation.onBlur = "error", h = !0)), h) {
    ye(e, u);
    const y = u.validation?.zodSchemaV4, t = u.validation?.zodSchemaV3;
    (y !== s?.validation?.zodSchemaV4 || t !== s?.validation?.zodSchemaV3) && (y || t) && (y ? H(e, y, "zod4") : t && H(e, t, "zod3"), N(e));
  }
  return u;
}
const bt = (e, a) => {
  a?.plugins && L.getState().setRegisteredPlugins(a.plugins);
  const l = {};
  if (a?.plugins)
    for (const o of a.plugins)
      typeof o.initialState == "function" && Object.assign(l, o.initialState());
  const s = { ...l, ...e }, [S, u] = ke(s);
  Object.keys(S).forEach((o) => {
    let d = {};
    a?.formElements && (d.formElements = a.formElements), d.validation = {
      onBlur: "error",
      ...a?.validation
    };
    const $ = U(o), b = $ ? {
      ...$,
      formElements: a?.formElements,
      validation: {
        ...$.validation,
        ...d.validation
      }
    } : d;
    Object.keys(b).length > 0 && ye(o, b);
  }), Object.keys(S).forEach((o) => {
    K(o, S[o]);
  });
  const h = (o, d) => {
    const [$] = ne(d?.componentId ?? ae()), b = fe({
      stateKey: o,
      options: d,
      initialOptionsPart: u
    }), P = x(b);
    P.current = b;
    const v = _(o, []) || S[o], O = ct(v, {
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
      d && L.getState().setPluginOptionsForState(o, d);
    }, [o, d]), re(() => (L.getState().registerStateHandler(o, O), () => {
      L.getState().unregisterStateHandler(o);
    }), [o, O]), re(() => {
      const D = U(o)?.validation;
      D?.zodSchemaV4 ? H(o, D.zodSchemaV4, "zod4") : D?.zodSchemaV3 && H(o, D.zodSchemaV3, "zod3");
    }), O;
  };
  function y(o, d) {
    if (fe({ stateKey: o, options: d, initialOptionsPart: u }), d.localStorage && Xe(o, d), d.formElements) {
      const b = L.getState().registeredPlugins.map((P) => d.formElements.hasOwnProperty(P.name) ? {
        ...P,
        formWrapper: d.formElements[P.name]
      } : P);
      L.getState().setRegisteredPlugins(b);
    }
    N(o);
  }
  function t(o) {
    Object.keys(S).forEach(($) => {
      y($, o);
    });
  }
  return {
    useCogsState: h,
    setCogsOptionsByKey: y,
    setCogsOptions: t
  };
}, Ze = (e, a, l, s, S) => {
  l?.log && console.log(
    "saving to localstorage",
    a,
    l.localStorage?.key,
    s
  );
  const u = W(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (u && s) {
    const h = `${s}-${a}-${u}`;
    let y;
    try {
      y = ce(h)?.lastSyncedWithServer;
    } catch {
    }
    const t = E(a, []), o = {
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
    const a = window.localStorage.getItem(e);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, de = (e) => {
  if (e)
    try {
      typeof window < "u" && window.localStorage && window.localStorage.removeItem(e);
    } catch (a) {
      console.error("Error removing from localStorage:", a);
    }
}, Xe = (e, a) => {
  const l = _(e, []), { sessionId: s } = Me(), S = W(a?.localStorage?.key) ? a.localStorage.key(l) : a?.localStorage?.key;
  if (S && s) {
    const u = ce(
      `${s}-${e}-${S}`
    );
    if (u && u.lastUpdated > (u.lastSyncedWithServer || 0))
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
function oe(e, a, l, s) {
  const S = E(e, a);
  if (B(e, a, {
    ...S,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(l)) {
    const u = E(e, a);
    u?.arrayKeys && u.arrayKeys.forEach((h, y) => {
      const t = [...a, h], o = l[y];
      o !== void 0 && oe(
        e,
        t,
        o,
        s
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((u) => {
    const h = [...a, u], y = l[u];
    oe(e, h, y, s);
  });
}
let se = [], ge = !1;
function Ke() {
  ge || (ge = !0, queueMicrotask(() => {
    st();
  }));
}
function et(e, a) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: s, effect: S }) => {
    const u = document.querySelector(`[data-parent-id="${l}"]`);
    if (!u) return;
    const h = Array.from(u.childNodes);
    if (!h[s]) return;
    let y = a;
    if (S && a !== null)
      try {
        y = new Function("state", `return (${S})(state)`)(
          a
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    y !== null && typeof y == "object" && (y = JSON.stringify(y)), h[s].textContent = String(y ?? "");
  });
}
function tt(e, a, l) {
  const s = E(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const S = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let u = [...a];
    for (; ; ) {
      const h = E(e, u);
      if (h?.pathComponents && h.pathComponents.forEach((y) => {
        const t = s.components?.get(y);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || S.add(t));
      }), u.length === 0) break;
      u.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Ce(l.newValue) && _e(l.newValue, l.oldValue).forEach((y) => {
      const t = y.split("."), o = [...a, ...t], d = E(e, o);
      d?.pathComponents && d.pathComponents.forEach(($) => {
        const b = s.components?.get($);
        b && ((Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"]).includes("none") || S.add(b));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    let h = [...l.type === "insert" ? a : a.slice(0, -1)];
    for (; ; ) {
      const y = E(e, h);
      if (y?.pathComponents && y.pathComponents.forEach((t) => {
        const o = s.components?.get(t);
        o && S.add(o);
      }), h.length === 0) break;
      h.pop();
    }
  }
  return S;
}
function rt(e, a, l) {
  const s = M.getState().getShadowValue(e, a), S = W(l) ? l(s) : l;
  if (X(s, S))
    return null;
  Le(e, a, S), ie(e, a, { bubble: !0 });
  const u = E(e, a);
  return {
    type: "update",
    oldValue: s,
    newValue: S,
    shadowMeta: u
  };
}
function nt(e, a, l) {
  be(e, a, l), ie(e, a, { bubble: !0 });
  const s = E(e, a);
  return {
    type: "insert_many",
    count: l.length,
    shadowMeta: s,
    path: a
  };
}
function at(e, a, l, s, S) {
  let u;
  if (W(l)) {
    const { value: o } = j(e, a);
    u = l({ state: o });
  } else
    u = l;
  const h = We(
    e,
    a,
    u,
    s,
    S
  );
  ie(e, a, { bubble: !0 });
  const y = E(e, a);
  let t;
  return y?.arrayKeys && s !== void 0 && s > 0 && (t = y.arrayKeys[s - 1]), {
    type: "insert",
    newValue: u,
    shadowMeta: y,
    path: a,
    itemId: h,
    insertAfterId: t
  };
}
function ot(e, a) {
  const l = a.slice(0, -1), s = _(e, a);
  return Be(e, a), ie(e, l, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: l };
}
function st() {
  const e = /* @__PURE__ */ new Set(), a = [], l = [];
  for (const s of se) {
    if (s.status && s.updateType) {
      l.push(s);
      continue;
    }
    const S = s, u = S.type === "cut" ? null : S.newValue;
    S.shadowMeta?.signals?.length > 0 && a.push({ shadowMeta: S.shadowMeta, displayValue: u }), tt(
      S.stateKey,
      S.path,
      S
    ).forEach((y) => {
      e.add(y);
    });
  }
  l.length > 0 && xe(l), a.forEach(({ shadowMeta: s, displayValue: S }) => {
    et(s, S);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), se = [], ge = !1;
}
function it(e, a, l) {
  return (S, u, h) => {
    s(e, u, S, h);
  };
  function s(S, u, h, y) {
    let t;
    switch (y.updateType) {
      case "update":
        t = rt(S, u, h);
        break;
      case "insert":
        t = at(
          S,
          u,
          h,
          y.index,
          y.itemId
        );
        break;
      case "insert_many":
        t = nt(S, u, h);
        break;
      case "cut":
        t = ot(S, u);
        break;
    }
    if (t === null)
      return;
    t.stateKey = S, t.path = u, se.push(t), Ke();
    const o = {
      timeStamp: Date.now(),
      stateKey: S,
      path: u,
      updateType: y.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: y.metaData
    };
    se.push(o), t.newValue !== void 0 && Ze(
      t.newValue,
      S,
      l.current,
      a
    ), l.current?.middleware && l.current.middleware({ update: o }), ze(o, y.validationTrigger || "programmatic"), Ye(o);
  }
}
function ct(e, {
  stateKey: a,
  localStorage: l,
  formElements: s,
  reactiveDeps: S,
  reactiveType: u,
  componentId: h,
  defaultState: y,
  dependencies: t,
  serverState: o
} = {}) {
  const [d, $] = ne({}), { sessionId: b } = Me();
  let P = !a;
  const [v] = ne(a ?? ae()), O = x(h ?? ae()), D = x(
    null
  );
  D.current = U(v) ?? null;
  const J = Ie(
    (k) => {
      const r = k ? { ...U(v), ...k } : U(v), n = r?.defaultState || y || e;
      if (r?.serverState?.status === "success" && r?.serverState?.data !== void 0)
        return {
          value: r.serverState.data,
          source: "server",
          timestamp: r.serverState.timestamp || Date.now()
        };
      if (r?.localStorage?.key && b) {
        const f = W(r.localStorage.key) ? r.localStorage.key(n) : r.localStorage.key, c = ce(
          `${b}-${v}-${f}`
        );
        if (c && c.lastUpdated > (r?.serverState?.timestamp || 0))
          return {
            value: c.state,
            source: "localStorage",
            timestamp: c.lastUpdated
          };
      }
      return {
        value: n || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [v, y, e, b]
  );
  Z(() => {
    o && o.status === "success" && o.data !== void 0 && me(v, o);
  }, [o, v]), Z(() => M.getState().subscribeToPath(v, (C) => {
    if (C?.type === "SERVER_STATE_UPDATE") {
      const r = C.serverState;
      if (r?.status !== "success" || r.data === void 0)
        return;
      ue(v, { serverState: r });
      const n = typeof r.merge == "object" ? r.merge : r.merge === !0 ? { strategy: "append", key: "id" } : null, i = _(v, []), f = r.data;
      if (n && n.strategy === "append" && "key" in n && Array.isArray(i) && Array.isArray(f)) {
        const c = n.key;
        if (!c) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const m = new Set(
          i.map((A) => A[c])
        ), w = f.filter(
          (A) => !m.has(A[c])
        );
        w.length > 0 && be(v, [], w);
        const p = _(v, []);
        oe(
          v,
          [],
          p,
          r.timestamp || Date.now()
        );
      } else
        K(v, f), oe(
          v,
          [],
          f,
          r.timestamp || Date.now()
        );
      N(v);
    }
  }), [v]), Z(() => {
    const k = M.getState().getShadowMetadata(v, []);
    if (k && k.stateSource)
      return;
    const C = U(v), r = {
      localStorageEnabled: !!C?.localStorage?.key
    };
    if (B(v, [], {
      ...k,
      features: r
    }), C?.defaultState !== void 0 || y !== void 0) {
      const m = C?.defaultState || y;
      C?.defaultState || ue(v, {
        defaultState: m
      });
    }
    const { value: n, source: i, timestamp: f } = J();
    K(v, n);
    const c = U(v)?.validation;
    c?.zodSchemaV4 ? H(v, c.zodSchemaV4, "zod4") : c?.zodSchemaV3 && H(v, c.zodSchemaV3, "zod3"), B(v, [], {
      stateSource: i,
      lastServerSync: i === "server" ? f : void 0,
      isDirty: i === "server" ? !1 : void 0,
      baseServerState: i === "server" ? n : void 0
    }), i === "server" && o && me(v, o), N(v);
  }, [v, ...t || []]), re(() => {
    P && ue(v, {
      formElements: s,
      defaultState: y,
      localStorage: l,
      middleware: D.current?.middleware
    });
    const k = `${v}////${O.current}`, C = E(v, []), r = C?.components || /* @__PURE__ */ new Map();
    return r.set(k, {
      forceUpdate: () => $({}),
      reactiveType: u ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: S || void 0,
      deps: S ? S(_(v, [])) : [],
      prevDeps: S ? S(_(v, [])) : []
    }), B(v, [], {
      ...C,
      components: r
    }), $({}), () => {
      const n = E(v, []), i = n?.components?.get(k);
      i?.paths && i.paths.forEach((f) => {
        const m = f.split(".").slice(1), w = M.getState().getShadowMetadata(v, m);
        w?.pathComponents && w.pathComponents.size === 0 && (delete w.pathComponents, M.getState().setShadowMetadata(v, m, w));
      }), n?.components && B(v, [], n);
    };
  }, []);
  const q = it(
    v,
    b,
    D
  );
  return M.getState().initialStateGlobal[v] || Ve(v, e), pe(() => Te(
    v,
    q,
    O.current,
    b
  ), [v, b]);
}
const lt = (e, a, l) => {
  let s = E(e, a)?.arrayKeys || [];
  const S = l?.transforms;
  if (!S || S.length === 0)
    return s;
  for (const u of S)
    if (u.type === "filter") {
      const h = [];
      s.forEach((y, t) => {
        const o = _(e, [...a, y]);
        u.fn(o, t) && h.push(y);
      }), s = h;
    } else u.type === "sort" && s.sort((h, y) => {
      const t = _(e, [...a, h]), o = _(e, [...a, y]);
      return u.fn(t, o);
    });
  return s;
}, te = (e, a, l) => {
  const s = `${e}////${a}`, u = E(e, [])?.components?.get(s);
  !u || u.reactiveType === "none" || !(Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType]).includes("component") || Ge(e, l, s);
}, Y = (e, a, l) => {
  const s = E(e, []), S = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((h, y) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), S.add(y));
  }), E(e, [
    ...a,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    s?.components?.get(h)?.forceUpdate();
  });
  const u = E(e, a);
  for (let h of u?.arrayKeys || []) {
    const y = h + ".selected", t = E(e, y.split(".").slice(1));
    h == l && t?.pathComponents?.forEach((o) => {
      s?.components?.get(o)?.forceUpdate();
    });
  }
};
function j(e, a, l) {
  const s = E(e, a), S = a.length > 0 ? a.join(".") : "root", u = l?.arrayViews?.[S];
  if (Array.isArray(u) && u.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const h = _(e, a, u);
  return {
    shadowMeta: s,
    value: h,
    arrayKeys: s?.arrayKeys
  };
}
function ut(e, a) {
  return a ? e.length !== a.length ? !1 : a.every((l, s) => l === "*" || l === e[s]) : !0;
}
function dt(e, a) {
  return a === "any" ? !0 : a === "array" ? Array.isArray(e) : a === "boolean" ? typeof e == "boolean" : a === "object" ? e !== null && typeof e == "object" && !Array.isArray(e) : a === "primitive" ? e === null || typeof e != "object" && !Array.isArray(e) : !1;
}
function Ee(e, a) {
  const l = M.getState().getShadowMetadata(e, a);
  if (!l?.clientActivityState?.elements) return [];
  const s = [];
  return l.clientActivityState.elements.forEach((S) => {
    S.domRef?.current && s.push(S.domRef);
  }), s;
}
function $e(e, a) {
  return Ee(e, a).map((s) => s.current).filter(Boolean);
}
function ft(e, a, l) {
  $e(e, a).forEach((s) => {
    if ("disabled" in s) {
      s.disabled = l;
      return;
    }
    s.style.pointerEvents = l ? "none" : "", s.setAttribute("aria-disabled", String(l));
  });
}
function Te(e, a, l, s) {
  const S = /* @__PURE__ */ new Map();
  function u({
    path: t = [],
    meta: o,
    componentId: d
  }) {
    if (E(e, t)?.isRaw)
      return _(e, t);
    const b = o ? JSON.stringify(o.arrayViews || o.transforms) : "", P = t.join(".") + ":" + d + ":" + b;
    if (S.has(P))
      return S.get(P);
    const v = [e, ...t].join("."), O = () => {
    }, D = {
      apply(q, g, k) {
        if (k.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", n = o?.arrayViews?.[r];
          return te(e, d, t), _(e, t, n);
        }
        const C = k[0];
        return a(C, t, { updateType: "update" }), !0;
      },
      get(q, g, k) {
        if (g === Symbol.toPrimitive)
          return (r) => r === "number" ? NaN : r === "string" ? `[CogsState: ${t.join(".") || "root"}]` : null;
        if (g === Symbol.toStringTag)
          return "CogsState";
        if (g === Symbol.iterator) {
          const { value: r } = j(e, t, o);
          return Array.isArray(r) ? function* () {
            for (let n = 0; n < r.length; n++)
              yield r[n];
          } : void 0;
        }
        if (g === "call" || g === "apply" || g === "bind")
          return Reflect.get(q, g, k);
        if (typeof g != "string")
          return Reflect.get(q, g);
        if (t.length === 0 && g in h)
          return h[g];
        if (typeof g == "string" && !g.startsWith("$")) {
          const { value: r } = j(e, t, o);
          if (r !== null && typeof r == "object" && !Array.isArray(r) && Object.prototype.hasOwnProperty.call(r, g)) {
            const f = [...t, g];
            return u({
              path: f,
              componentId: d,
              meta: o
            });
          }
          const i = [...t, g];
          return u({
            path: i,
            componentId: d,
            meta: o
          });
        }
        if (typeof g == "string" && g.startsWith("$")) {
          const r = g.slice(1), { value: n } = j(e, t, o), i = L.getState().registeredPlugins;
          for (const f of i) {
            const c = f.chainMethods?.[r];
            if (c && ut(t, c.pathPattern) && dt(n, c.target))
              return (...m) => {
                const w = L.getState(), p = w.pluginOptions.get(e)?.get(f.name), A = w.getHookResult(e, f.name);
                return c.handler(
                  {
                    stateKey: e,
                    path: t,
                    pluginName: f.name,
                    options: p,
                    hookData: A,
                    $get: () => j(e, t, o).value,
                    $update: (V) => (a(V, t, {
                      updateType: "update"
                    }), {
                      synced: () => {
                        const T = M.getState().getShadowMetadata(e, t);
                        B(e, t, {
                          ...T,
                          isDirty: !1,
                          stateSource: "server",
                          lastServerSync: Date.now()
                        });
                      }
                    }),
                    $applyOperation: (V, T) => {
                      a(V.newValue, V.path, {
                        updateType: V.updateType,
                        itemId: V.itemId,
                        metaData: T
                      });
                    },
                    getFieldMetaData: () => he(e, t)?.get(f.name),
                    setFieldMetaData: (V) => ve(e, t, f.name, V),
                    removeFieldMetaData: () => we(e, t, f.name),
                    getFieldRefs: () => Ee(e, t),
                    getFieldElements: () => $e(e, t),
                    setFieldDisabled: (V) => ft(e, t, V)
                  },
                  ...m
                );
              };
          }
        }
        if (g === "$_rebuildStateShape")
          return u;
        if (g === "$sync" && t.length === 0)
          return async function() {
            const r = M.getState().getInitialOptions(e), n = r?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const i = M.getState().getShadowValue(e, []), f = r?.validation?.key;
            try {
              const c = await n.action(i);
              if (c && !c.success && c.errors, c?.success) {
                const m = M.getState().getShadowMetadata(e, []);
                B(e, [], {
                  ...m,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: i
                  // Update base server state
                }), n.onSuccess && n.onSuccess(c.data);
              } else !c?.success && n.onError && n.onError(c.error);
              return c;
            } catch (c) {
              return n.onError && n.onError(c), { success: !1, error: c };
            }
          };
        if (g === "$_status" || g === "$getStatus") {
          const r = () => {
            const { shadowMeta: n, value: i } = j(e, t, o);
            return n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || i !== void 0 ? "fresh" : "unknown";
          };
          return g === "$_status" ? r() : r;
        }
        if (g === "$removeStorage")
          return () => {
            const r = M.getState().initialStateGlobal[e], n = U(e), i = W(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, f = s && i ? `${s}-${e}-${i}` : void 0;
            de(f);
          };
        if (g === "$setRaw")
          return (r) => {
            const n = E(e, t) || {};
            B(e, t, { ...n, isRaw: !0 }), a(r, t, { updateType: "update" });
          };
        if (g === "$validate")
          return (r) => {
            const n = M.getState();
            if (r) {
              const w = r.map((p) => {
                const A = [...t, p], V = n.getShadowValue(e, A), T = n.getShadowMetadata(e, A) || {}, F = T.typeInfo?.schema;
                if (!F)
                  return {
                    key: p,
                    path: A,
                    success: !0,
                    data: V
                  };
                const I = F.safeParse(V), R = I.error?.issues || I.error?.errors || [];
                return n.setShadowMetadata(e, A, {
                  ...T,
                  validation: {
                    status: I.success ? "VALID" : "INVALID",
                    errors: I.success ? [] : [
                      {
                        source: "client",
                        message: R[0]?.message || "Invalid value",
                        severity: "error",
                        code: R[0]?.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: V
                  }
                }), n.notifyPathSubscribers([e, ...A].join("."), {
                  type: "VALIDATION_UPDATE"
                }), {
                  key: p,
                  path: A,
                  success: I.success,
                  data: I.success ? I.data : void 0,
                  error: I.success ? void 0 : I.error
                };
              });
              return N(e), {
                success: w.every((p) => p.success),
                results: w
              };
            }
            const { value: i } = j(e, t, o), f = n.getInitialOptions(e), c = f?.validation?.zodSchemaV4 || f?.validation?.zodSchemaV3;
            if (!c)
              return { success: !0, data: i };
            const m = c.safeParse(i);
            if (m.success) {
              const w = n.getShadowMetadata(e, t) || {};
              n.setShadowMetadata(e, t, {
                ...w,
                validation: {
                  status: "VALID",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            } else
              (m.error?.issues || m.error?.errors || []).forEach((p) => {
                const A = [...t, ...p.path.map(String)], V = n.getShadowMetadata(e, A) || {};
                n.setShadowMetadata(e, A, {
                  ...V,
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
                    validatedValue: n.getShadowValue(e, A)
                  }
                });
              });
            return N(e), m;
          };
        if (g === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = j(e, t, o);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (g === "$validationErrors")
          return (r) => {
            const n = M.getState(), i = (c) => {
              const m = n.getShadowMetadata(e, c)?.validation, w = (m?.errors || []).map((T) => ({
                ...T,
                path: c
              })), p = w.filter((T) => T.severity === "error"), A = w.filter(
                (T) => T.severity === "warning"
              ), V = p.length > 0 ? "error" : A.length > 0 ? "warning" : void 0;
              return {
                status: m?.status || "NOT_VALIDATED",
                severity: V,
                hasErrors: p.length > 0,
                hasWarnings: A.length > 0,
                message: p[0]?.message || A[0]?.message || "",
                errors: p.map((T) => T.message),
                warnings: A.map((T) => T.message),
                allErrors: w,
                path: c,
                getData: () => n.getShadowValue(e, c)
              };
            };
            return (r ?? Object.keys(n.getShadowNode(e, t) ?? {}).filter(
              (c) => c !== "_meta"
            )).map((c) => i([...t, c]));
          };
        if (g === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            te(e, d, [
              ...t,
              "getSelected"
            ]);
            const n = M.getState().selectedIndicesMap.get(r);
            if (!n)
              return;
            const i = t.join("."), f = o?.arrayViews?.[i], c = n.split(".").pop();
            if (!(f && !f.includes(c) || _(
              e,
              n.split(".").slice(1)
            ) === void 0))
              return u({
                path: n.split(".").slice(1),
                componentId: d,
                meta: o
              });
          };
        if (g === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const n = M.getState().selectedIndicesMap.get(r);
            if (!n)
              return -1;
            const { keys: i } = z(e, t, o);
            if (!i)
              return -1;
            const f = n.split(".").pop();
            return i.indexOf(f);
          };
        if (g === "$clearSelected")
          return Y(e, t), () => {
            Je({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (g === "$map")
          return (r) => {
            const { value: n, keys: i } = z(
              e,
              t,
              o
            );
            if (te(e, d, t), !i || !Array.isArray(n))
              return [];
            const f = u({
              path: t,
              componentId: d,
              meta: o
            });
            return n.map((c, m) => {
              const w = i[m];
              if (!w) return;
              const p = [...t, w], A = u({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: d,
                meta: o
              });
              return r(A, m, f);
            });
          };
        if (g === "$filter")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { keys: i, value: f } = z(
              e,
              t,
              o
            );
            if (!Array.isArray(f))
              throw new Error("filter can only be used on arrays");
            const c = [];
            return f.forEach((m, w) => {
              if (r(m, w)) {
                const p = i[w];
                p && c.push(p);
              }
            }), u({
              path: t,
              componentId: d,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [n]: c
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
            const n = t.length > 0 ? t.join(".") : "root", { value: i, keys: f } = z(
              e,
              t,
              o
            );
            if (!Array.isArray(i) || !f)
              throw new Error("No array keys found for sorting");
            const c = i.map((w, p) => ({
              item: w,
              key: f[p]
            }));
            c.sort((w, p) => r(w.item, p.item));
            const m = c.map((w) => w.key);
            return u({
              path: t,
              componentId: d,
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
        if (g === "$list")
          return (r) => /* @__PURE__ */ Q(() => {
            const i = x(/* @__PURE__ */ new Map()), [f, c] = ne({}), m = t.length > 0 ? t.join(".") : "root", w = lt(e, t, o), p = pe(() => ({
              ...o,
              arrayViews: {
                ...o?.arrayViews || {},
                [m]: w
              }
            }), [o, m, w]), { value: A } = z(
              e,
              t,
              p
            );
            if (Z(() => {
              const F = M.getState().subscribeToPath(v, (I) => {
                if (I.type === "GET_SELECTED")
                  return;
                const G = M.getState().getShadowMetadata(e, t)?.transformCaches;
                if (G)
                  for (const ee of G.keys())
                    ee.startsWith(d) && G.delete(ee);
                (I.type === "INSERT" || I.type === "INSERT_MANY" || I.type === "REMOVE" || I.type === "CLEAR_SELECTION" || I.type === "SERVER_STATE_UPDATE" && !o?.serverStateIsUpStream) && c({});
              });
              return () => {
                F();
              };
            }, [d, v]), !Array.isArray(A))
              return null;
            const V = u({
              path: t,
              componentId: d,
              meta: p
              // Use updated meta here
            }), T = A.map((F, I) => {
              const R = w[I];
              if (!R)
                return null;
              let G = i.current.get(R);
              G || (G = ae(), i.current.set(R, G));
              const ee = [...t, R];
              return Se(Ue, {
                key: R,
                stateKey: e,
                itemComponentId: G,
                itemPath: ee,
                localIndex: I,
                arraySetter: V,
                rebuildStateShape: u,
                renderFn: r
              });
            });
            return /* @__PURE__ */ Q(Pe, { children: T });
          }, {});
        if (g === "$stateFlattenOn")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = o?.arrayViews?.[n], f = M.getState().getShadowValue(e, t, i);
            return Array.isArray(f) ? u({
              path: [...t, "[*]", r],
              componentId: d,
              meta: o
            }) : [];
          };
        if (g === "$index")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = o?.arrayViews?.[n];
            if (i) {
              const m = i[r];
              return m ? u({
                path: [...t, m],
                componentId: d,
                meta: o
              }) : void 0;
            }
            const f = E(e, t);
            if (!f?.arrayKeys) return;
            const c = f.arrayKeys[r];
            if (c)
              return u({
                path: [...t, c],
                componentId: d,
                meta: o
              });
          };
        if (g === "$last")
          return () => {
            const { keys: r } = z(e, t, o);
            if (!r || r.length === 0)
              return;
            const n = r[r.length - 1];
            if (!n)
              return;
            const i = [...t, n];
            return u({
              path: i,
              componentId: d,
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
            const { value: f } = j(
              e,
              t,
              o
            ), c = W(r) ? r(f) : r;
            let m = null;
            if (!f.some((p) => {
              const A = n ? n.every(
                (V) => X(p[V], c[V])
              ) : X(p, c);
              return A && (m = p), A;
            }))
              a(c, t, { updateType: "insert" });
            else if (i && m) {
              const p = i(m), A = f.map(
                (V) => X(V, m) ? p : V
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
            const f = r === -1 ? i.arrayKeys.length - 1 : r !== void 0 ? r : i.arrayKeys.length - 1, c = i.arrayKeys[f];
            c && a(null, [...t, c], {
              updateType: "cut"
            });
          };
        if (g === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: n } = z(e, t, o);
            if (!n || n.length === 0)
              return;
            const i = M.getState().selectedIndicesMap.get(r);
            if (!i)
              return;
            const f = i.split(".").pop();
            if (!n.includes(f))
              return;
            const c = i.split(".").slice(1);
            M.getState().clearSelectedIndex({ arrayKey: r });
            const m = c.slice(0, -1);
            Y(e, m), a(null, c, {
              updateType: "cut"
            });
          };
        if (g === "$cutByValue")
          return (r) => {
            const {
              isArray: n,
              value: i,
              keys: f
            } = z(e, t, o);
            if (!n) return;
            const c = le(i, f, (m) => m === r);
            c && a(null, [...t, c.key], {
              updateType: "cut"
            });
          };
        if (g === "$toggleByValue")
          return (r) => {
            const {
              isArray: n,
              value: i,
              keys: f
            } = z(e, t, o);
            if (!n) return;
            const c = le(i, f, (m) => m === r);
            if (c) {
              const m = [...t, c.key];
              a(null, m, {
                updateType: "cut"
              });
            } else
              a(r, t, { updateType: "insert" });
          };
        if (g === "$findWith")
          return (r, n) => {
            const { isArray: i, value: f, keys: c } = z(e, t, o);
            if (!i)
              throw new Error("findWith can only be used on arrays");
            const m = le(
              f,
              c,
              (w) => w?.[r] === n
            );
            return m ? u({
              path: [...t, m.key],
              componentId: d,
              meta: o
            }) : null;
          };
        if (g === "$cutThis") {
          const { value: r } = j(e, t, o), n = t.slice(0, -1);
          return Y(e, n), () => {
            a(r, t, { updateType: "cut" });
          };
        }
        if (g === "$get")
          return () => {
            te(e, d, t);
            const { value: r } = j(e, t, o);
            return r;
          };
        if (g === "$$derive")
          return (r) => Ae({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: o
          });
        if (g === "$$get")
          return () => Ae({ _stateKey: e, _path: t, _meta: o });
        if (g === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return He(r);
        }
        if (g == "getLocalStorage")
          return (r) => ce(s + "-" + e + "-" + r);
        if (g === "$isSelected") {
          const r = t.slice(0, -1);
          if (E(e, r)?.arrayKeys) {
            const i = e + "." + r.join("."), f = M.getState().selectedIndicesMap.get(i), c = e + "." + t.join(".");
            return f === c;
          }
          return;
        }
        if (g === "$setSelected")
          return (r) => {
            const n = t.slice(0, -1), i = e + "." + n.join("."), f = e + "." + t.join(".");
            Y(e, n, void 0), M.getState().selectedIndicesMap.get(i), r && M.getState().setSelectedIndex(i, f);
          };
        if (g === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), n = e + "." + r.join("."), i = e + "." + t.join(".");
            M.getState().selectedIndicesMap.get(n) === i ? M.getState().clearSelectedIndex({ arrayKey: n }) : M.getState().setSelectedIndex(n, i), Y(e, r);
          };
        if (g === "$clearValidation")
          return (r) => {
            const n = r ? [...t, ...r] : t, i = M.getState(), f = i.getShadowNode(e, n);
            if (console.log("startNode ", f), !f) return;
            const c = [[f, n]];
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
                const A = [e, ...w].join(".");
                i.notifyPathSubscribers(A, {
                  type: "VALIDATION_CLEAR"
                });
              }
              const p = Object.keys(m);
              for (const A of p)
                A !== "_meta" && c.push([m[A], [...w, A]]);
            }
            N(e);
          };
        if (t.length == 0) {
          if (g === "$_componentId")
            return d;
          if (g === "$setOptions")
            return (r) => {
              fe({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (g === "$_applyUpdate")
            return (r, n, i = "update") => {
              a(r, n, { updateType: i });
            };
          if (g === "$_getEffectiveSetState")
            return a;
          if (g === "$getPluginMetaData")
            return (r) => he(e, t)?.get(r);
          if (g === "$addPluginMetaData")
            return (r, n) => ve(e, t, r, n);
          if (g === "$removePluginMetaData")
            return (r) => we(e, t, r);
          if (g === "$addZodValidation")
            return (r, n) => {
              const i = M.getState();
              r.forEach((f) => {
                const c = f.path.map(String), m = i.getShadowMetadata(e, c) || {};
                i.setShadowMetadata(e, c, {
                  ...m,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: n || "client",
                        message: f.message,
                        severity: "error",
                        code: f.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                }), i.notifyPathSubscribers(
                  [e, ...c].join("."),
                  { type: "VALIDATION_UPDATE" }
                );
              }), N(e);
            };
          if (g === "$clearZodValidationPaths")
            return (r) => {
              const n = M.getState();
              r.forEach((i) => {
                const f = n.getShadowMetadata(e, i) || {};
                f.validation && (n.setShadowMetadata(e, i, {
                  ...f,
                  validation: {
                    status: "NOT_VALIDATED",
                    errors: [],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                }), n.notifyPathSubscribers(
                  [e, ...i].join("."),
                  { type: "VALIDATION_CLEAR" }
                ));
              }), N(e);
            };
          if (g === "$applyOperation")
            return (r, n) => {
              let i;
              if (r.insertAfterId && r.updateType === "insert") {
                const f = E(e, r.path);
                if (f?.arrayKeys) {
                  const c = f.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  c !== -1 && (i = c + 1);
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
              const n = M.getState(), i = n.getShadowMetadata(e, []);
              if (!i?.components) return;
              const f = (m) => !m || m === "/" ? [] : m.split("/").slice(1).map((w) => w.replace(/~1/g, "/").replace(/~0/g, "~")), c = /* @__PURE__ */ new Set();
              for (const m of r) {
                const w = f(m.path);
                switch (m.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = m;
                    n.updateShadowAtPath(e, w, p), n.markAsDirty(e, w, { bubble: !0 });
                    let A = [...w];
                    for (; ; ) {
                      const V = n.getShadowMetadata(
                        e,
                        A
                      );
                      if (V?.pathComponents && V.pathComponents.forEach((T) => {
                        if (!c.has(T)) {
                          const F = i.components?.get(T);
                          F && (F.forceUpdate(), c.add(T));
                        }
                      }), A.length === 0) break;
                      A.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = w.slice(0, -1);
                    n.removeShadowArrayElement(e, w), n.markAsDirty(e, p, { bubble: !0 });
                    let A = [...p];
                    for (; ; ) {
                      const V = n.getShadowMetadata(
                        e,
                        A
                      );
                      if (V?.pathComponents && V.pathComponents.forEach((T) => {
                        if (!c.has(T)) {
                          const F = i.components?.get(T);
                          F && (F.forceUpdate(), c.add(T));
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
            Oe,
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
              const n = M.getState().getShadowMetadata(e, t);
              B(e, t, {
                ...n,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const i = [e, ...t].join(".");
              Qe(i, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (g === "$toggle") {
          const { value: r } = j(
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
            const i = Array.isArray(r), f = i ? r : void 0, c = i ? n : r;
            if (!c || typeof c != "function")
              throw new Error(
                "CogsState: $isolate requires a render function."
              );
            return /* @__PURE__ */ Q(
              je,
              {
                stateKey: e,
                path: t,
                dependencies: f,
                rebuildStateShape: u,
                renderFn: c
              }
            );
          };
        if (g === "$formElement")
          return (r, n) => /* @__PURE__ */ Q(
            Ne,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: u,
              setState: a,
              formOpts: n,
              renderFn: r
            }
          );
        const C = [...t, g];
        return u({
          path: C,
          componentId: d,
          meta: o
        });
      }
    }, J = new Proxy(O, D);
    return S.set(P, J), J;
  }
  const h = {
    $revertToInitialState: (t) => {
      const o = M.getState().getShadowMetadata(e, []);
      let d;
      o?.stateSource === "server" && o.baseServerState ? d = o.baseServerState : d = M.getState().initialStateGlobal[e], qe(e), K(e, d), u({
        path: [],
        componentId: l
      });
      const $ = U(e), b = W($?.localStorage?.key) ? $?.localStorage?.key(d) : $?.localStorage?.key, P = s && b ? `${s}-${e}-${b}` : void 0;
      return de(P), N(e), d;
    },
    $initializeAndMergeShadowState: (t) => {
      Re(e, t), N(e);
    },
    $updateInitialState: (t) => {
      const o = Te(
        e,
        a,
        l,
        s
      ), d = M.getState().initialStateGlobal[e], $ = U(e), b = W($?.localStorage?.key) ? $?.localStorage?.key(d) : $?.localStorage?.key, P = s && b ? `${s}-${e}-${b}` : void 0;
      return de(P), De(() => {
        Ve(e, t), K(e, t);
        const v = M.getState().getShadowMetadata(e, []);
        v && v?.components?.forEach((O) => {
          O.forceUpdate();
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
function Ae(e) {
  return Se(gt, { proxy: e });
}
function gt({
  proxy: e
}) {
  const a = x(null), l = x(null), s = x(!1), S = `${e._stateKey}-${e._path.join(".")}`, u = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[u], y = _(e._stateKey, e._path, h);
  return Z(() => {
    const t = a.current;
    if (!t || s.current) return;
    const o = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", S);
        return;
      }
      const d = t.parentElement, b = Array.from(d.childNodes).indexOf(t);
      let P = d.getAttribute("data-parent-id");
      P || (P = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", P)), l.current = `instance-${crypto.randomUUID()}`;
      const v = M.getState().getShadowMetadata(e._stateKey, e._path) || {}, O = v.signals || [];
      O.push({
        instanceId: l.current,
        parentId: P,
        position: b,
        effect: e._effect
      }), M.getState().setShadowMetadata(e._stateKey, e._path, {
        ...v,
        signals: O
      });
      let D = y;
      if (e._effect)
        try {
          D = new Function(
            "state",
            `return (${e._effect})(state)`
          )(y);
        } catch (q) {
          console.error("Error evaluating effect function:", q);
        }
      D !== null && typeof D == "object" && (D = JSON.stringify(D));
      const J = document.createTextNode(String(D ?? ""));
      t.replaceWith(J), s.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(o), l.current) {
        const d = M.getState().getShadowMetadata(e._stateKey, e._path) || {};
        d.signals && (d.signals = d.signals.filter(
          ($) => $.instanceId !== l.current
        ), M.getState().setShadowMetadata(e._stateKey, e._path, d));
      }
    };
  }, []), Se("span", {
    ref: a,
    style: { display: "contents" },
    "data-signal-id": S
  });
}
export {
  Ae as $cogsSignal,
  bt as createCogsState,
  ct as useCogsStateFn
};
//# sourceMappingURL=CogsState.js.map
