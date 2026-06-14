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
  getShadowValue: O,
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
      const f = a[s];
      if (f)
        return { key: f, index: s, value: e[s] };
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
  const s = U(e) || {}, f = l[e] || {};
  let u = { ...f, ...s }, h = !1;
  if (a) {
    const m = (t, o) => {
      for (const d in o)
        o.hasOwnProperty(d) && (o[d] instanceof Object && !Array.isArray(o[d]) && t[d] instanceof Object ? X(t[d], o[d]) || (m(t[d], o[d]), h = !0) : t[d] !== o[d] && (t[d] = o[d], h = !0));
      return t;
    };
    u = m(u, a);
  }
  if (u.validation && (a?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || f?.validation?.hasOwnProperty("onBlur") || (u.validation.onBlur = "error", h = !0)), h) {
    ye(e, u);
    const m = u.validation?.zodSchemaV4, t = u.validation?.zodSchemaV3;
    (m !== s?.validation?.zodSchemaV4 || t !== s?.validation?.zodSchemaV3) && (m || t) && (m ? H(e, m, "zod4") : t && H(e, t, "zod3"), N(e));
  }
  return u;
}
const bt = (e, a) => {
  a?.plugins && L.getState().setRegisteredPlugins(a.plugins);
  const l = {};
  if (a?.plugins)
    for (const o of a.plugins)
      typeof o.initialState == "function" && Object.assign(l, o.initialState());
  const s = { ...l, ...e }, [f, u] = ke(s);
  Object.keys(f).forEach((o) => {
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
  }), Object.keys(f).forEach((o) => {
    K(o, f[o]);
  });
  const h = (o, d) => {
    const [$] = ne(d?.componentId ?? ae()), b = fe({
      stateKey: o,
      options: d,
      initialOptionsPart: u
    }), P = x(b);
    P.current = b;
    const v = O(o, []) || f[o], j = ct(v, {
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
    }, [o, d]), re(() => (L.getState().registerStateHandler(o, j), () => {
      L.getState().unregisterStateHandler(o);
    }), [o, j]), re(() => {
      const D = U(o)?.validation;
      D?.zodSchemaV4 ? H(o, D.zodSchemaV4, "zod4") : D?.zodSchemaV3 && H(o, D.zodSchemaV3, "zod3");
    }), j;
  };
  function m(o, d) {
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
    Object.keys(f).forEach(($) => {
      m($, o);
    });
  }
  return {
    useCogsState: h,
    setCogsOptionsByKey: m,
    setCogsOptions: t
  };
}, Ze = (e, a, l, s, f) => {
  l?.log && console.log(
    "saving to localstorage",
    a,
    l.localStorage?.key,
    s
  );
  const u = W(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (u && s) {
    const h = `${s}-${a}-${u}`;
    let m;
    try {
      m = ce(h)?.lastSyncedWithServer;
    } catch {
    }
    const t = E(a, []), o = {
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
  const l = O(e, []), { sessionId: s } = Me(), f = W(a?.localStorage?.key) ? a.localStorage.key(l) : a?.localStorage?.key;
  if (f && s) {
    const u = ce(
      `${s}-${e}-${f}`
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
  const f = E(e, a);
  if (B(e, a, {
    ...f,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(l)) {
    const u = E(e, a);
    u?.arrayKeys && u.arrayKeys.forEach((h, m) => {
      const t = [...a, h], o = l[m];
      o !== void 0 && oe(
        e,
        t,
        o,
        s
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((u) => {
    const h = [...a, u], m = l[u];
    oe(e, h, m, s);
  });
}
let se = [], ge = !1;
function Ke() {
  ge || (ge = !0, queueMicrotask(() => {
    st();
  }));
}
function et(e, a) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: s, effect: f }) => {
    const u = document.querySelector(`[data-parent-id="${l}"]`);
    if (!u) return;
    const h = Array.from(u.childNodes);
    if (!h[s]) return;
    let m = a;
    if (f && a !== null)
      try {
        m = new Function("state", `return (${f})(state)`)(
          a
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    m !== null && typeof m == "object" && (m = JSON.stringify(m)), h[s].textContent = String(m ?? "");
  });
}
function tt(e, a, l) {
  const s = E(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const f = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let u = [...a];
    for (; ; ) {
      const h = E(e, u);
      if (h?.pathComponents && h.pathComponents.forEach((m) => {
        const t = s.components?.get(m);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || f.add(t));
      }), u.length === 0) break;
      u.pop();
    }
    l.newValue && typeof l.newValue == "object" && !Ce(l.newValue) && _e(l.newValue, l.oldValue).forEach((m) => {
      const t = m.split("."), o = [...a, ...t], d = E(e, o);
      d?.pathComponents && d.pathComponents.forEach(($) => {
        const b = s.components?.get($);
        b && ((Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"]).includes("none") || f.add(b));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    let h = [...l.type === "insert" ? a : a.slice(0, -1)];
    for (; ; ) {
      const m = E(e, h);
      if (m?.pathComponents && m.pathComponents.forEach((t) => {
        const o = s.components?.get(t);
        o && f.add(o);
      }), h.length === 0) break;
      h.pop();
    }
  }
  return f;
}
function rt(e, a, l) {
  const s = M.getState().getShadowValue(e, a), f = W(l) ? l(s) : l;
  if (X(s, f))
    return null;
  Le(e, a, f), ie(e, a, { bubble: !0 });
  const u = E(e, a);
  return {
    type: "update",
    oldValue: s,
    newValue: f,
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
function at(e, a, l, s, f) {
  let u;
  if (W(l)) {
    const { value: o } = F(e, a);
    u = l({ state: o });
  } else
    u = l;
  const h = We(
    e,
    a,
    u,
    s,
    f
  );
  ie(e, a, { bubble: !0 });
  const m = E(e, a);
  let t;
  return m?.arrayKeys && s !== void 0 && s > 0 && (t = m.arrayKeys[s - 1]), {
    type: "insert",
    newValue: u,
    shadowMeta: m,
    path: a,
    itemId: h,
    insertAfterId: t
  };
}
function ot(e, a) {
  const l = a.slice(0, -1), s = O(e, a);
  return Be(e, a), ie(e, l, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: l };
}
function st() {
  const e = /* @__PURE__ */ new Set(), a = [], l = [];
  for (const s of se) {
    if (s.status && s.updateType) {
      l.push(s);
      continue;
    }
    const f = s, u = f.type === "cut" ? null : f.newValue;
    f.shadowMeta?.signals?.length > 0 && a.push({ shadowMeta: f.shadowMeta, displayValue: u }), tt(
      f.stateKey,
      f.path,
      f
    ).forEach((m) => {
      e.add(m);
    });
  }
  l.length > 0 && xe(l), a.forEach(({ shadowMeta: s, displayValue: f }) => {
    et(s, f);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), se = [], ge = !1;
}
function it(e, a, l) {
  return (f, u, h) => {
    s(e, u, f, h);
  };
  function s(f, u, h, m) {
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
    t.stateKey = f, t.path = u, se.push(t), Ke();
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
    se.push(o), t.newValue !== void 0 && Ze(
      t.newValue,
      f,
      l.current,
      a
    ), l.current?.middleware && l.current.middleware({ update: o }), ze(o, m.validationTrigger || "programmatic"), Ye(o);
  }
}
function ct(e, {
  stateKey: a,
  localStorage: l,
  formElements: s,
  reactiveDeps: f,
  reactiveType: u,
  componentId: h,
  defaultState: m,
  dependencies: t,
  serverState: o
} = {}) {
  const [d, $] = ne({}), { sessionId: b } = Me();
  let P = !a;
  const [v] = ne(a ?? ae()), j = x(h ?? ae()), D = x(
    null
  );
  D.current = U(v) ?? null;
  const J = Ie(
    (k) => {
      const r = k ? { ...U(v), ...k } : U(v), n = r?.defaultState || m || e;
      if (r?.serverState?.status === "success" && r?.serverState?.data !== void 0)
        return {
          value: r.serverState.data,
          source: "server",
          timestamp: r.serverState.timestamp || Date.now()
        };
      if (r?.localStorage?.key && b) {
        const S = W(r.localStorage.key) ? r.localStorage.key(n) : r.localStorage.key, i = ce(
          `${b}-${v}-${S}`
        );
        if (i && i.lastUpdated > (r?.serverState?.timestamp || 0))
          return {
            value: i.state,
            source: "localStorage",
            timestamp: i.lastUpdated
          };
      }
      return {
        value: n || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [v, m, e, b]
  );
  Z(() => {
    o && o.status === "success" && o.data !== void 0 && me(v, o);
  }, [o, v]), Z(() => M.getState().subscribeToPath(v, (C) => {
    if (C?.type === "SERVER_STATE_UPDATE") {
      const r = C.serverState;
      if (r?.status !== "success" || r.data === void 0)
        return;
      ue(v, { serverState: r });
      const n = typeof r.merge == "object" ? r.merge : r.merge === !0 ? { strategy: "append", key: "id" } : null, c = O(v, []), S = r.data;
      if (n && n.strategy === "append" && "key" in n && Array.isArray(c) && Array.isArray(S)) {
        const i = n.key;
        if (!i) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const y = new Set(
          c.map((A) => A[i])
        ), w = S.filter(
          (A) => !y.has(A[i])
        );
        w.length > 0 && be(v, [], w);
        const p = O(v, []);
        oe(
          v,
          [],
          p,
          r.timestamp || Date.now()
        );
      } else
        K(v, S), oe(
          v,
          [],
          S,
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
    }), C?.defaultState !== void 0 || m !== void 0) {
      const y = C?.defaultState || m;
      C?.defaultState || ue(v, {
        defaultState: y
      });
    }
    const { value: n, source: c, timestamp: S } = J();
    K(v, n);
    const i = U(v)?.validation;
    i?.zodSchemaV4 ? H(v, i.zodSchemaV4, "zod4") : i?.zodSchemaV3 && H(v, i.zodSchemaV3, "zod3"), B(v, [], {
      stateSource: c,
      lastServerSync: c === "server" ? S : void 0,
      isDirty: c === "server" ? !1 : void 0,
      baseServerState: c === "server" ? n : void 0
    }), c === "server" && o && me(v, o), N(v);
  }, [v, ...t || []]), re(() => {
    P && ue(v, {
      formElements: s,
      defaultState: m,
      localStorage: l,
      middleware: D.current?.middleware
    });
    const k = `${v}////${j.current}`, C = E(v, []), r = C?.components || /* @__PURE__ */ new Map();
    return r.set(k, {
      forceUpdate: () => $({}),
      reactiveType: u ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: f || void 0,
      deps: f ? f(O(v, [])) : [],
      prevDeps: f ? f(O(v, [])) : []
    }), B(v, [], {
      ...C,
      components: r
    }), $({}), () => {
      const n = E(v, []), c = n?.components?.get(k);
      c?.paths && c.paths.forEach((S) => {
        const y = S.split(".").slice(1), w = M.getState().getShadowMetadata(v, y);
        w?.pathComponents && w.pathComponents.size === 0 && (delete w.pathComponents, M.getState().setShadowMetadata(v, y, w));
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
    j.current,
    b
  ), [v, b]);
}
const lt = (e, a, l) => {
  let s = E(e, a)?.arrayKeys || [];
  const f = l?.transforms;
  if (!f || f.length === 0)
    return s;
  for (const u of f)
    if (u.type === "filter") {
      const h = [];
      s.forEach((m, t) => {
        const o = O(e, [...a, m]);
        u.fn(o, t) && h.push(m);
      }), s = h;
    } else u.type === "sort" && s.sort((h, m) => {
      const t = O(e, [...a, h]), o = O(e, [...a, m]);
      return u.fn(t, o);
    });
  return s;
}, te = (e, a, l) => {
  const s = `${e}////${a}`, u = E(e, [])?.components?.get(s);
  !u || u.reactiveType === "none" || !(Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType]).includes("component") || Ge(e, l, s);
}, Y = (e, a, l) => {
  const s = E(e, []), f = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((h, m) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), f.add(m));
  }), E(e, [
    ...a,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    s?.components?.get(h)?.forceUpdate();
  });
  const u = E(e, a);
  for (let h of u?.arrayKeys || []) {
    const m = h + ".selected", t = E(e, m.split(".").slice(1));
    h == l && t?.pathComponents?.forEach((o) => {
      s?.components?.get(o)?.forceUpdate();
    });
  }
};
function F(e, a, l) {
  const s = E(e, a), f = a.length > 0 ? a.join(".") : "root", u = l?.arrayViews?.[f];
  if (Array.isArray(u) && u.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const h = O(e, a, u);
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
  return l.clientActivityState.elements.forEach((f) => {
    f.domRef?.current && s.push(f.domRef);
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
  const f = /* @__PURE__ */ new Map();
  function u({
    path: t = [],
    meta: o,
    componentId: d
  }) {
    if (E(e, t)?.isRaw)
      return O(e, t);
    const b = o ? JSON.stringify(o.arrayViews || o.transforms) : "", P = t.join(".") + ":" + d + ":" + b;
    if (f.has(P))
      return f.get(P);
    const v = [e, ...t].join("."), j = () => {
    }, D = {
      apply(q, g, k) {
        if (k.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", n = o?.arrayViews?.[r];
          return te(e, d, t), O(e, t, n);
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
          const { value: r } = F(e, t, o);
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
          const { value: r } = F(e, t, o);
          if (r !== null && typeof r == "object" && !Array.isArray(r) && Object.prototype.hasOwnProperty.call(r, g)) {
            const i = [...t, g];
            return u({
              path: i,
              componentId: d,
              meta: o
            });
          }
          const c = L.getState().registeredPlugins;
          for (const i of c) {
            const y = i.chainMethods?.[g];
            if (y && ut(t, y.pathPattern) && dt(r, y.target))
              return (...w) => {
                const p = L.getState(), A = p.pluginOptions.get(e)?.get(i.name), T = p.getHookResult(e, i.name);
                return y.handler(
                  {
                    stateKey: e,
                    path: t,
                    pluginName: i.name,
                    options: A,
                    hookData: T,
                    $get: () => F(e, t, o).value,
                    $update: (V) => (a(V, t, {
                      updateType: "update"
                    }), {
                      synced: () => {
                        const _ = M.getState().getShadowMetadata(e, t);
                        B(e, t, {
                          ..._,
                          isDirty: !1,
                          stateSource: "server",
                          lastServerSync: Date.now()
                        });
                      }
                    }),
                    $applyOperation: (V, _) => {
                      a(V.newValue, V.path, {
                        updateType: V.updateType,
                        itemId: V.itemId,
                        metaData: _
                      });
                    },
                    getFieldMetaData: () => he(e, t)?.get(i.name),
                    setFieldMetaData: (V) => ve(e, t, i.name, V),
                    removeFieldMetaData: () => we(e, t, i.name),
                    getFieldRefs: () => Ee(e, t),
                    getFieldElements: () => $e(e, t),
                    setFieldDisabled: (V) => ft(e, t, V)
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
            const r = M.getState().getInitialOptions(e), n = r?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const c = M.getState().getShadowValue(e, []), S = r?.validation?.key;
            try {
              const i = await n.action(c);
              if (i && !i.success && i.errors, i?.success) {
                const y = M.getState().getShadowMetadata(e, []);
                B(e, [], {
                  ...y,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: c
                  // Update base server state
                }), n.onSuccess && n.onSuccess(i.data);
              } else !i?.success && n.onError && n.onError(i.error);
              return i;
            } catch (i) {
              return n.onError && n.onError(i), { success: !1, error: i };
            }
          };
        if (g === "$_status" || g === "$getStatus") {
          const r = () => {
            const { shadowMeta: n, value: c } = F(e, t, o);
            return n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || c !== void 0 ? "fresh" : "unknown";
          };
          return g === "$_status" ? r() : r;
        }
        if (g === "$removeStorage")
          return () => {
            const r = M.getState().initialStateGlobal[e], n = U(e), c = W(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, S = s && c ? `${s}-${e}-${c}` : void 0;
            de(S);
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
                const A = [...t, p], T = n.getShadowValue(e, A), V = n.getShadowMetadata(e, A) || {}, _ = V.typeInfo?.schema;
                if (!_)
                  return {
                    key: p,
                    path: A,
                    success: !0,
                    data: T
                  };
                const I = _.safeParse(T), R = I.error?.issues || I.error?.errors || [];
                return n.setShadowMetadata(e, A, {
                  ...V,
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
                    validatedValue: T
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
            const { value: c } = F(e, t, o), S = n.getInitialOptions(e), i = S?.validation?.zodSchemaV4 || S?.validation?.zodSchemaV3;
            if (!i)
              return { success: !0, data: c };
            const y = i.safeParse(c);
            if (y.success) {
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
              (y.error?.issues || y.error?.errors || []).forEach((p) => {
                const A = [...t, ...p.path.map(String)], T = n.getShadowMetadata(e, A) || {};
                n.setShadowMetadata(e, A, {
                  ...T,
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
            return N(e), y;
          };
        if (g === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = F(e, t, o);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (g === "$validationErrors")
          return (r) => {
            const n = M.getState(), c = (i) => {
              const y = n.getShadowMetadata(e, i)?.validation, w = (y?.errors || []).map((V) => ({
                ...V,
                path: i
              })), p = w.filter((V) => V.severity === "error"), A = w.filter(
                (V) => V.severity === "warning"
              ), T = p.length > 0 ? "error" : A.length > 0 ? "warning" : void 0;
              return {
                status: y?.status || "NOT_VALIDATED",
                severity: T,
                hasErrors: p.length > 0,
                hasWarnings: A.length > 0,
                message: p[0]?.message || A[0]?.message || "",
                errors: p.map((V) => V.message),
                warnings: A.map((V) => V.message),
                allErrors: w,
                path: i,
                getData: () => n.getShadowValue(e, i)
              };
            };
            return (r ?? Object.keys(n.getShadowNode(e, t) ?? {}).filter(
              (i) => i !== "_meta"
            )).map((i) => c([...t, i]));
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
            const c = t.join("."), S = o?.arrayViews?.[c], i = n.split(".").pop();
            if (!(S && !S.includes(i) || O(
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
            const { keys: c } = z(e, t, o);
            if (!c)
              return -1;
            const S = n.split(".").pop();
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
            const { value: n, keys: c } = z(
              e,
              t,
              o
            );
            if (te(e, d, t), !c || !Array.isArray(n))
              return [];
            const S = u({
              path: t,
              componentId: d,
              meta: o
            });
            return n.map((i, y) => {
              const w = c[y];
              if (!w) return;
              const p = [...t, w], A = u({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: d,
                meta: o
              });
              return r(A, y, S);
            });
          };
        if (g === "$filter")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { keys: c, value: S } = z(
              e,
              t,
              o
            );
            if (!Array.isArray(S))
              throw new Error("filter can only be used on arrays");
            const i = [];
            return S.forEach((y, w) => {
              if (r(y, w)) {
                const p = c[w];
                p && i.push(p);
              }
            }), u({
              path: t,
              componentId: d,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [n]: i
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
            const n = t.length > 0 ? t.join(".") : "root", { value: c, keys: S } = z(
              e,
              t,
              o
            );
            if (!Array.isArray(c) || !S)
              throw new Error("No array keys found for sorting");
            const i = c.map((w, p) => ({
              item: w,
              key: S[p]
            }));
            i.sort((w, p) => r(w.item, p.item));
            const y = i.map((w) => w.key);
            return u({
              path: t,
              componentId: d,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [n]: y
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
            const c = x(/* @__PURE__ */ new Map()), [S, i] = ne({}), y = t.length > 0 ? t.join(".") : "root", w = lt(e, t, o), p = pe(() => ({
              ...o,
              arrayViews: {
                ...o?.arrayViews || {},
                [y]: w
              }
            }), [o, y, w]), { value: A } = z(
              e,
              t,
              p
            );
            if (Z(() => {
              const _ = M.getState().subscribeToPath(v, (I) => {
                if (I.type === "GET_SELECTED")
                  return;
                const G = M.getState().getShadowMetadata(e, t)?.transformCaches;
                if (G)
                  for (const ee of G.keys())
                    ee.startsWith(d) && G.delete(ee);
                (I.type === "INSERT" || I.type === "INSERT_MANY" || I.type === "REMOVE" || I.type === "CLEAR_SELECTION" || I.type === "SERVER_STATE_UPDATE" && !o?.serverStateIsUpStream) && i({});
              });
              return () => {
                _();
              };
            }, [d, v]), !Array.isArray(A))
              return null;
            const T = u({
              path: t,
              componentId: d,
              meta: p
              // Use updated meta here
            }), V = A.map((_, I) => {
              const R = w[I];
              if (!R)
                return null;
              let G = c.current.get(R);
              G || (G = ae(), c.current.set(R, G));
              const ee = [...t, R];
              return Se(Ue, {
                key: R,
                stateKey: e,
                itemComponentId: G,
                itemPath: ee,
                localIndex: I,
                arraySetter: T,
                rebuildStateShape: u,
                renderFn: r
              });
            });
            return /* @__PURE__ */ Q(Pe, { children: V });
          }, {});
        if (g === "$stateFlattenOn")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", c = o?.arrayViews?.[n], S = M.getState().getShadowValue(e, t, c);
            return Array.isArray(S) ? u({
              path: [...t, "[*]", r],
              componentId: d,
              meta: o
            }) : [];
          };
        if (g === "$index")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", c = o?.arrayViews?.[n];
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
            const i = S.arrayKeys[r];
            if (i)
              return u({
                path: [...t, i],
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
            const c = [...t, n];
            return u({
              path: c,
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
          return (r, n, c) => {
            const { value: S } = F(
              e,
              t,
              o
            ), i = W(r) ? r(S) : r;
            let y = null;
            if (!S.some((p) => {
              const A = n ? n.every(
                (T) => X(p[T], i[T])
              ) : X(p, i);
              return A && (y = p), A;
            }))
              a(i, t, { updateType: "insert" });
            else if (c && y) {
              const p = c(y), A = S.map(
                (T) => X(T, y) ? p : T
              );
              a(A, t, {
                updateType: "update"
              });
            }
          };
        if (g === "$cut")
          return (r, n) => {
            const c = E(e, t);
            if (!c?.arrayKeys || c.arrayKeys.length === 0)
              return;
            const S = r === -1 ? c.arrayKeys.length - 1 : r !== void 0 ? r : c.arrayKeys.length - 1, i = c.arrayKeys[S];
            i && a(null, [...t, i], {
              updateType: "cut"
            });
          };
        if (g === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: n } = z(e, t, o);
            if (!n || n.length === 0)
              return;
            const c = M.getState().selectedIndicesMap.get(r);
            if (!c)
              return;
            const S = c.split(".").pop();
            if (!n.includes(S))
              return;
            const i = c.split(".").slice(1);
            M.getState().clearSelectedIndex({ arrayKey: r });
            const y = i.slice(0, -1);
            Y(e, y), a(null, i, {
              updateType: "cut"
            });
          };
        if (g === "$cutByValue")
          return (r) => {
            const {
              isArray: n,
              value: c,
              keys: S
            } = z(e, t, o);
            if (!n) return;
            const i = le(c, S, (y) => y === r);
            i && a(null, [...t, i.key], {
              updateType: "cut"
            });
          };
        if (g === "$toggleByValue")
          return (r) => {
            const {
              isArray: n,
              value: c,
              keys: S
            } = z(e, t, o);
            if (!n) return;
            const i = le(c, S, (y) => y === r);
            if (i) {
              const y = [...t, i.key];
              a(null, y, {
                updateType: "cut"
              });
            } else
              a(r, t, { updateType: "insert" });
          };
        if (g === "$findWith")
          return (r, n) => {
            const { isArray: c, value: S, keys: i } = z(e, t, o);
            if (!c)
              throw new Error("findWith can only be used on arrays");
            const y = le(
              S,
              i,
              (w) => w?.[r] === n
            );
            return y ? u({
              path: [...t, y.key],
              componentId: d,
              meta: o
            }) : null;
          };
        if (g === "$cutThis") {
          const { value: r } = F(e, t, o), n = t.slice(0, -1);
          return Y(e, n), () => {
            a(r, t, { updateType: "cut" });
          };
        }
        if (g === "$get")
          return () => {
            te(e, d, t);
            const { value: r } = F(e, t, o);
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
            const c = e + "." + r.join("."), S = M.getState().selectedIndicesMap.get(c), i = e + "." + t.join(".");
            return S === i;
          }
          return;
        }
        if (g === "$setSelected")
          return (r) => {
            const n = t.slice(0, -1), c = e + "." + n.join("."), S = e + "." + t.join(".");
            Y(e, n, void 0), M.getState().selectedIndicesMap.get(c), r && M.getState().setSelectedIndex(c, S);
          };
        if (g === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), n = e + "." + r.join("."), c = e + "." + t.join(".");
            M.getState().selectedIndicesMap.get(n) === c ? M.getState().clearSelectedIndex({ arrayKey: n }) : M.getState().setSelectedIndex(n, c), Y(e, r);
          };
        if (g === "$clearValidation")
          return (r) => {
            const n = r ? [...t, ...r] : t, c = M.getState(), S = c.getShadowNode(e, n);
            if (console.log("startNode ", S), !S) return;
            const i = [[S, n]];
            for (console.log("stack ", i); i.length > 0; ) {
              const [y, w] = i.pop();
              if (console.log("while (stack.length ", y, w), !y || typeof y != "object") continue;
              if (y._meta?.validation) {
                y._meta.validation = {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now(),
                  validatedValue: void 0
                };
                const A = [e, ...w].join(".");
                c.notifyPathSubscribers(A, {
                  type: "VALIDATION_CLEAR"
                });
              }
              const p = Object.keys(y);
              for (const A of p)
                A !== "_meta" && i.push([y[A], [...w, A]]);
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
            return (r, n, c = "update") => {
              a(r, n, { updateType: c });
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
              const c = M.getState();
              r.forEach((S) => {
                const i = S.path.map(String), y = c.getShadowMetadata(e, i) || {};
                c.setShadowMetadata(e, i, {
                  ...y,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: n || "client",
                        message: S.message,
                        severity: "error",
                        code: S.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                }), c.notifyPathSubscribers(
                  [e, ...i].join("."),
                  { type: "VALIDATION_UPDATE" }
                );
              }), N(e);
            };
          if (g === "$clearZodValidationPaths")
            return (r) => {
              const n = M.getState();
              r.forEach((c) => {
                const S = n.getShadowMetadata(e, c) || {};
                S.validation && (n.setShadowMetadata(e, c, {
                  ...S,
                  validation: {
                    status: "NOT_VALIDATED",
                    errors: [],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                }), n.notifyPathSubscribers(
                  [e, ...c].join("."),
                  { type: "VALIDATION_CLEAR" }
                ));
              }), N(e);
            };
          if (g === "$applyOperation")
            return (r, n) => {
              let c;
              if (r.insertAfterId && r.updateType === "insert") {
                const S = E(e, r.path);
                if (S?.arrayKeys) {
                  const i = S.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  i !== -1 && (c = i + 1);
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
          if (g === "$applyJsonPatch")
            return (r) => {
              const n = M.getState(), c = n.getShadowMetadata(e, []);
              if (!c?.components) return;
              const S = (y) => !y || y === "/" ? [] : y.split("/").slice(1).map((w) => w.replace(/~1/g, "/").replace(/~0/g, "~")), i = /* @__PURE__ */ new Set();
              for (const y of r) {
                const w = S(y.path);
                switch (y.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = y;
                    n.updateShadowAtPath(e, w, p), n.markAsDirty(e, w, { bubble: !0 });
                    let A = [...w];
                    for (; ; ) {
                      const T = n.getShadowMetadata(
                        e,
                        A
                      );
                      if (T?.pathComponents && T.pathComponents.forEach((V) => {
                        if (!i.has(V)) {
                          const _ = c.components?.get(V);
                          _ && (_.forceUpdate(), i.add(V));
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
                      const T = n.getShadowMetadata(
                        e,
                        A
                      );
                      if (T?.pathComponents && T.pathComponents.forEach((V) => {
                        if (!i.has(V)) {
                          const _ = c.components?.get(V);
                          _ && (_.forceUpdate(), i.add(V));
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
              const c = [e, ...t].join(".");
              Qe(c, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (g === "$toggle") {
          const { value: r } = F(
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
            const c = Array.isArray(r), S = c ? r : void 0, i = c ? n : r;
            if (!i || typeof i != "function")
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
                renderFn: i
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
    }, J = new Proxy(j, D);
    return f.set(P, J), J;
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
        v && v?.components?.forEach((j) => {
          j.forceUpdate();
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
  const a = x(null), l = x(null), s = x(!1), f = `${e._stateKey}-${e._path.join(".")}`, u = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[u], m = O(e._stateKey, e._path, h);
  return Z(() => {
    const t = a.current;
    if (!t || s.current) return;
    const o = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", f);
        return;
      }
      const d = t.parentElement, b = Array.from(d.childNodes).indexOf(t);
      let P = d.getAttribute("data-parent-id");
      P || (P = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", P)), l.current = `instance-${crypto.randomUUID()}`;
      const v = M.getState().getShadowMetadata(e._stateKey, e._path) || {}, j = v.signals || [];
      j.push({
        instanceId: l.current,
        parentId: P,
        position: b,
        effect: e._effect
      }), M.getState().setShadowMetadata(e._stateKey, e._path, {
        ...v,
        signals: j
      });
      let D = m;
      if (e._effect)
        try {
          D = new Function(
            "state",
            `return (${e._effect})(state)`
          )(m);
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
    "data-signal-id": f
  });
}
export {
  Ae as $cogsSignal,
  bt as createCogsState,
  ct as useCogsStateFn
};
//# sourceMappingURL=CogsState.js.map
