"use client";
import { jsx as H, Fragment as Ee } from "react/jsx-runtime";
import { pluginStore as F } from "./pluginStore.js";
import { useState as ee, useRef as G, useCallback as Ve, useEffect as x, useLayoutEffect as Pe, useMemo as ve, createElement as ue, startTransition as Te } from "react";
import { transformStateFunc as ke, isFunction as R, isDeepEqual as Y, isArray as Ie, getDifferences as De } from "./utility.js";
import { ValidationWrapper as Ce, IsolatedComponentWrapper as _e, FormElementWrapper as Oe, MemoizedCogsItemWrapper as je } from "./Components.js";
import Ne from "superjson";
import { v4 as te } from "uuid";
import { getGlobalStore as w, updateShadowTypeInfo as fe } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.js";
import { runValidation as Ue } from "./validation.js";
const {
  getInitialOptions: j,
  updateInitialStateGlobal: pe,
  getShadowMetadata: b,
  setShadowMetadata: W,
  getShadowValue: I,
  initializeShadowState: Z,
  initializeAndMergeShadowState: Fe,
  updateShadowAtPath: Re,
  insertShadowArrayElement: ze,
  insertManyShadowArrayElements: Ae,
  removeShadowArrayElement: Le,
  setInitialStateOptions: de,
  setServerStateUpdate: ge,
  markAsDirty: ae,
  addPathComponent: We,
  clearSelectedIndexesForState: Be,
  addStateLog: Ge,
  clearSelectedIndex: xe,
  getSyncInfo: qe,
  notifyPathSubscribers: Je,
  getPluginMetaDataMap: Se,
  setPluginMetaData: ye,
  removePluginMetaData: me
} = w.getState(), { notifyUpdate: He } = F.getState();
function O(e, n, c) {
  const o = b(e, n);
  if (!!!o?.arrayKeys)
    return { isArray: !1, value: w.getState().getShadowValue(e, n), keys: [] };
  const l = n.length > 0 ? n.join(".") : "root", h = c?.arrayViews?.[l] ?? o.arrayKeys;
  return Array.isArray(h) && h.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: w.getState().getShadowValue(e, n, h), keys: h ?? [] };
}
function se(e, n, c) {
  for (let o = 0; o < e.length; o++)
    if (c(e[o], o)) {
      const g = n[o];
      if (g)
        return { key: g, index: o, value: e[o] };
    }
  return null;
}
function ie(e, n) {
  const o = {
    ...j(e) || {},
    ...n
  };
  (o.validation?.zodSchemaV4 || o.validation?.zodSchemaV3) && !o.validation?.onBlur && (o.validation.onBlur = "error"), de(e, o);
}
function ce({
  stateKey: e,
  options: n,
  initialOptionsPart: c
}) {
  const o = j(e) || {}, g = c[e] || {};
  let l = { ...g, ...o }, h = !1;
  if (n) {
    const d = (t, s) => {
      for (const y in s)
        s.hasOwnProperty(y) && (s[y] instanceof Object && !Array.isArray(s[y]) && t[y] instanceof Object ? Y(t[y], s[y]) || (d(t[y], s[y]), h = !0) : t[y] !== s[y] && (t[y] = s[y], h = !0));
      return t;
    };
    l = d(l, n);
  }
  if (l.validation && (n?.validation?.hasOwnProperty("onBlur") || o?.validation?.hasOwnProperty("onBlur") || g?.validation?.hasOwnProperty("onBlur") || (l.validation.onBlur = "error", h = !0)), h) {
    de(e, l);
    const d = o?.validation?.zodSchemaV4 || o?.validation?.zodSchemaV3, t = l.validation?.zodSchemaV4 && !o?.validation?.zodSchemaV4, s = l.validation?.zodSchemaV3 && !o?.validation?.zodSchemaV3;
    !d && (t || s) && (t ? fe(
      e,
      l.validation.zodSchemaV4,
      "zod4"
    ) : s && fe(
      e,
      l.validation.zodSchemaV3,
      "zod3"
    ), z(e));
  }
  return l;
}
function Mt(e, n) {
  return {
    ...n,
    initialState: e,
    _addStateOptions: !0
  };
}
const $t = (e, n) => {
  n?.plugins && F.getState().setRegisteredPlugins(n.plugins);
  const [c, o] = ke(e);
  Object.keys(c).forEach((d) => {
    let t = o[d] || {};
    const s = {
      ...t
    };
    n?.formElements && (s.formElements = {
      ...n.formElements,
      ...t.formElements || {}
    }), s.validation = {
      onBlur: "error",
      ...n?.validation,
      ...t.validation || {}
    }, n?.validation?.key && !t.validation?.key && (s.validation.key = `${n.validation.key}.${d}`);
    const y = j(d), $ = y ? {
      ...y,
      ...s,
      formElements: {
        ...y.formElements,
        ...s.formElements
      },
      validation: {
        ...y.validation,
        ...s.validation
      }
    } : s;
    de(d, $);
  }), Object.keys(c).forEach((d) => {
    Z(d, c[d]);
  });
  const g = (d, t) => {
    const [s] = ee(t?.componentId ?? te()), y = ce({
      stateKey: d,
      options: t,
      initialOptionsPart: o
    }), $ = G(y);
    $.current = y;
    const E = I(d, []) || c[d], V = st(
      E,
      {
        stateKey: d,
        syncUpdate: t?.syncUpdate,
        componentId: s,
        localStorage: t?.localStorage,
        middleware: t?.middleware,
        reactiveType: t?.reactiveType,
        reactiveDeps: t?.reactiveDeps,
        defaultState: t?.defaultState,
        dependencies: t?.dependencies,
        serverState: t?.serverState
      }
    );
    return x(() => {
      t && F.getState().setPluginOptionsForState(d, t);
    }, [d, t]), x(() => (F.getState().stateHandlers.set(d, V), () => {
      F.getState().stateHandlers.delete(d);
    }), [d, V]), V;
  };
  function l(d, t) {
    if (ce({ stateKey: d, options: t, initialOptionsPart: o }), t.localStorage && Ye(d, t), t.formElements) {
      const y = F.getState().registeredPlugins.map(($) => t.formElements.hasOwnProperty($.name) ? {
        ...$,
        formWrapper: t.formElements[$.name]
      } : $);
      F.getState().setRegisteredPlugins(y);
    }
    z(d);
  }
  function h(d) {
    Object.keys(c).forEach((s) => {
      l(s, d);
    });
  }
  return {
    useCogsState: g,
    setCogsOptionsByKey: l,
    setCogsOptions: h
  };
}, Qe = (e, n, c, o, g) => {
  c?.log && console.log(
    "saving to localstorage",
    n,
    c.localStorage?.key,
    o
  );
  const l = R(c?.localStorage?.key) ? c.localStorage?.key(e) : c?.localStorage?.key;
  if (l && o) {
    const h = `${o}-${n}-${l}`;
    let d;
    try {
      d = oe(h)?.lastSyncedWithServer;
    } catch {
    }
    const t = b(n, []), s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: d,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, y = Ne.serialize(s);
    window.localStorage.setItem(
      h,
      JSON.stringify(y.json)
    );
  }
}, oe = (e) => {
  if (!e) return null;
  try {
    const n = window.localStorage.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch (n) {
    return console.error("Error loading from localStorage:", n), null;
  }
}, Ye = (e, n) => {
  const c = I(e, []), { sessionId: o } = we(), g = R(n?.localStorage?.key) ? n.localStorage.key(c) : n?.localStorage?.key;
  if (g && o) {
    const l = oe(
      `${o}-${e}-${g}`
    );
    if (l && l.lastUpdated > (l.lastSyncedWithServer || 0))
      return z(e), !0;
  }
  return !1;
}, z = (e) => {
  const n = b(e, []);
  if (!n) return;
  const c = /* @__PURE__ */ new Set();
  n?.components?.forEach((o) => {
    (o ? Array.isArray(o.reactiveType) ? o.reactiveType : [o.reactiveType || "component"] : null)?.includes("none") || c.add(() => o.forceUpdate());
  }), queueMicrotask(() => {
    c.forEach((o) => o());
  });
};
function re(e, n, c, o) {
  const g = b(e, n);
  if (W(e, n, {
    ...g,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: o || Date.now()
  }), Array.isArray(c)) {
    const l = b(e, n);
    l?.arrayKeys && l.arrayKeys.forEach((h, d) => {
      const t = [...n, h], s = c[d];
      s !== void 0 && re(
        e,
        t,
        s,
        o
      );
    });
  } else c && typeof c == "object" && c.constructor === Object && Object.keys(c).forEach((l) => {
    const h = [...n, l], d = c[l];
    re(e, h, d, o);
  });
}
let ne = [], le = !1;
function Ze() {
  le || (le = !0, queueMicrotask(() => {
    at();
  }));
}
function Xe(e, n) {
  e?.signals?.length && e.signals.forEach(({ parentId: c, position: o, effect: g }) => {
    const l = document.querySelector(`[data-parent-id="${c}"]`);
    if (!l) return;
    const h = Array.from(l.childNodes);
    if (!h[o]) return;
    let d = n;
    if (g && n !== null)
      try {
        d = new Function("state", `return (${g})(state)`)(
          n
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    d !== null && typeof d == "object" && (d = JSON.stringify(d)), h[o].textContent = String(d ?? "");
  });
}
function Ke(e, n, c) {
  const o = b(e, []);
  if (!o?.components)
    return /* @__PURE__ */ new Set();
  const g = /* @__PURE__ */ new Set();
  if (c.type === "update") {
    let l = [...n];
    for (; ; ) {
      const h = b(e, l);
      if (h?.pathComponents && h.pathComponents.forEach((d) => {
        const t = o.components?.get(d);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || g.add(t));
      }), l.length === 0) break;
      l.pop();
    }
    c.newValue && typeof c.newValue == "object" && !Ie(c.newValue) && De(c.newValue, c.oldValue).forEach((d) => {
      const t = d.split("."), s = [...n, ...t], y = b(e, s);
      y?.pathComponents && y.pathComponents.forEach(($) => {
        const E = o.components?.get($);
        E && ((Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"]).includes("none") || g.add(E));
      });
    });
  } else if (c.type === "insert" || c.type === "cut" || c.type === "insert_many") {
    let h = [...c.type === "insert" ? n : n.slice(0, -1)];
    for (; ; ) {
      const d = b(e, h);
      if (d?.pathComponents && d.pathComponents.forEach((t) => {
        const s = o.components?.get(t);
        s && g.add(s);
      }), h.length === 0) break;
      h.pop();
    }
  }
  return g;
}
function et(e, n, c) {
  const o = w.getState().getShadowValue(e, n), g = R(c) ? c(o) : c;
  if (Y(o, g))
    return null;
  Re(e, n, g), ae(e, n, { bubble: !0 });
  const l = b(e, n);
  return {
    type: "update",
    oldValue: o,
    newValue: g,
    shadowMeta: l
  };
}
function tt(e, n, c) {
  Ae(e, n, c), ae(e, n, { bubble: !0 });
  const o = b(e, n);
  return {
    type: "insert_many",
    count: c.length,
    shadowMeta: o,
    path: n
  };
}
function rt(e, n, c, o, g) {
  let l;
  if (R(c)) {
    const { value: s } = _(e, n);
    l = c({ state: s });
  } else
    l = c;
  const h = ze(
    e,
    n,
    l,
    o,
    g
  );
  ae(e, n, { bubble: !0 });
  const d = b(e, n);
  let t;
  return d?.arrayKeys && o !== void 0 && o > 0 && (t = d.arrayKeys[o - 1]), {
    type: "insert",
    newValue: l,
    shadowMeta: d,
    path: n,
    itemId: h,
    insertAfterId: t
  };
}
function nt(e, n) {
  const c = n.slice(0, -1), o = I(e, n);
  return Le(e, n), ae(e, c, { bubble: !0 }), { type: "cut", oldValue: o, parentPath: c };
}
function at() {
  const e = /* @__PURE__ */ new Set(), n = [], c = [];
  for (const o of ne) {
    if (o.status && o.updateType) {
      c.push(o);
      continue;
    }
    const g = o, l = g.type === "cut" ? null : g.newValue;
    g.shadowMeta?.signals?.length > 0 && n.push({ shadowMeta: g.shadowMeta, displayValue: l }), Ke(
      g.stateKey,
      g.path,
      g
    ).forEach((d) => {
      e.add(d);
    });
  }
  c.length > 0 && Ge(c), n.forEach(({ shadowMeta: o, displayValue: g }) => {
    Xe(o, g);
  }), e.forEach((o) => {
    o.forceUpdate();
  }), ne = [], le = !1;
}
function ot(e, n, c) {
  return (g, l, h) => {
    o(e, l, g, h);
  };
  function o(g, l, h, d) {
    let t;
    switch (d.updateType) {
      case "update":
        t = et(g, l, h);
        break;
      case "insert":
        t = rt(
          g,
          l,
          h,
          d.index,
          d.itemId
        );
        break;
      case "insert_many":
        t = tt(g, l, h);
        break;
      case "cut":
        t = nt(g, l);
        break;
    }
    if (t === null)
      return;
    t.stateKey = g, t.path = l, ne.push(t), Ze();
    const s = {
      timeStamp: Date.now(),
      stateKey: g,
      path: l,
      updateType: d.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: d.metaData
    };
    ne.push(s), t.newValue !== void 0 && Qe(
      t.newValue,
      g,
      c.current,
      n
    ), c.current?.middleware && c.current.middleware({ update: s }), Ue(s, d.validationTrigger || "programmatic"), He(s);
  }
}
function st(e, {
  stateKey: n,
  localStorage: c,
  formElements: o,
  reactiveDeps: g,
  reactiveType: l,
  componentId: h,
  defaultState: d,
  dependencies: t,
  serverState: s
} = {}) {
  const [y, $] = ee({}), { sessionId: E } = we();
  let V = !n;
  const [v] = ee(n ?? te()), N = G(h ?? te()), D = G(
    null
  );
  D.current = j(v) ?? null;
  const B = Ve(
    (k) => {
      const a = k ? { ...j(v), ...k } : j(v), i = a?.defaultState || d || e;
      if (a?.serverState?.status === "success" && a?.serverState?.data !== void 0)
        return {
          value: a.serverState.data,
          source: "server",
          timestamp: a.serverState.timestamp || Date.now()
        };
      if (a?.localStorage?.key && E) {
        const u = R(a.localStorage.key) ? a.localStorage.key(i) : a.localStorage.key, m = oe(
          `${E}-${v}-${u}`
        );
        if (m && m.lastUpdated > (a?.serverState?.timestamp || 0))
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
    [v, d, e, E]
  );
  x(() => {
    s && s.status === "success" && s.data !== void 0 && ge(v, s);
  }, [s, v]), x(() => w.getState().subscribeToPath(v, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const a = r.serverState;
      if (a?.status !== "success" || a.data === void 0)
        return;
      ie(v, { serverState: a });
      const i = typeof a.merge == "object" ? a.merge : a.merge === !0 ? { strategy: "append", key: "id" } : null, S = I(v, []), u = a.data;
      if (i && i.strategy === "append" && "key" in i && Array.isArray(S) && Array.isArray(u)) {
        const m = i.key;
        if (!m) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const p = new Set(
          S.map((T) => T[m])
        ), A = u.filter(
          (T) => !p.has(T[m])
        );
        A.length > 0 && Ae(v, [], A);
        const M = I(v, []);
        re(
          v,
          [],
          M,
          a.timestamp || Date.now()
        );
      } else
        Z(v, u), re(
          v,
          [],
          u,
          a.timestamp || Date.now()
        );
      z(v);
    }
  }), [v]), x(() => {
    const k = w.getState().getShadowMetadata(v, []);
    if (k && k.stateSource)
      return;
    const r = j(v), a = {
      localStorageEnabled: !!r?.localStorage?.key
    };
    if (W(v, [], {
      ...k,
      features: a
    }), r?.defaultState !== void 0 || d !== void 0) {
      const m = r?.defaultState || d;
      r?.defaultState || ie(v, {
        defaultState: m
      });
    }
    const { value: i, source: S, timestamp: u } = B();
    Z(v, i), W(v, [], {
      stateSource: S,
      lastServerSync: S === "server" ? u : void 0,
      isDirty: S === "server" ? !1 : void 0,
      baseServerState: S === "server" ? i : void 0
    }), S === "server" && s && ge(v, s), z(v);
  }, [v, ...t || []]), Pe(() => {
    V && ie(v, {
      formElements: o,
      defaultState: d,
      localStorage: c,
      middleware: D.current?.middleware
    });
    const k = `${v}////${N.current}`, r = b(v, []), a = r?.components || /* @__PURE__ */ new Map();
    return a.set(k, {
      forceUpdate: () => $({}),
      reactiveType: l ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: g || void 0,
      deps: g ? g(I(v, [])) : [],
      prevDeps: g ? g(I(v, [])) : []
    }), W(v, [], {
      ...r,
      components: a
    }), $({}), () => {
      const i = b(v, []), S = i?.components?.get(k);
      S?.paths && S.paths.forEach((u) => {
        const p = u.split(".").slice(1), A = w.getState().getShadowMetadata(v, p);
        A?.pathComponents && A.pathComponents.size === 0 && (delete A.pathComponents, w.getState().setShadowMetadata(v, p, A));
      }), i?.components && W(v, [], i);
    };
  }, []);
  const f = ot(
    v,
    E,
    D
  );
  return w.getState().initialStateGlobal[v] || pe(v, e), ve(() => be(
    v,
    f,
    N.current,
    E
  ), [v, E]);
}
const it = (e, n, c) => {
  let o = b(e, n)?.arrayKeys || [];
  const g = c?.transforms;
  if (!g || g.length === 0)
    return o;
  for (const l of g)
    if (l.type === "filter") {
      const h = [];
      o.forEach((d, t) => {
        const s = I(e, [...n, d]);
        l.fn(s, t) && h.push(d);
      }), o = h;
    } else l.type === "sort" && o.sort((h, d) => {
      const t = I(e, [...n, h]), s = I(e, [...n, d]);
      return l.fn(t, s);
    });
  return o;
}, K = (e, n, c) => {
  const o = `${e}////${n}`, l = b(e, [])?.components?.get(o);
  !l || l.reactiveType === "none" || !(Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType]).includes("component") || We(e, c, o);
}, Q = (e, n, c) => {
  const o = b(e, []), g = /* @__PURE__ */ new Set();
  o?.components && o.components.forEach((h, d) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), g.add(d));
  }), b(e, [
    ...n,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    o?.components?.get(h)?.forceUpdate();
  });
  const l = b(e, n);
  for (let h of l?.arrayKeys || []) {
    const d = h + ".selected", t = b(e, d.split(".").slice(1));
    h == c && t?.pathComponents?.forEach((s) => {
      o?.components?.get(s)?.forceUpdate();
    });
  }
};
function _(e, n, c) {
  const o = b(e, n), g = n.length > 0 ? n.join(".") : "root", l = c?.arrayViews?.[g];
  if (Array.isArray(l) && l.length === 0)
    return {
      shadowMeta: o,
      value: [],
      arrayKeys: o?.arrayKeys
    };
  const h = I(e, n, l);
  return {
    shadowMeta: o,
    value: h,
    arrayKeys: o?.arrayKeys
  };
}
function ct(e, n) {
  return n ? e.length !== n.length ? !1 : n.every((c, o) => c === "*" || c === e[o]) : !0;
}
function lt(e, n) {
  return n === "any" ? !0 : n === "array" ? Array.isArray(e) : n === "boolean" ? typeof e == "boolean" : n === "object" ? e !== null && typeof e == "object" && !Array.isArray(e) : n === "primitive" ? e === null || typeof e != "object" && !Array.isArray(e) : !1;
}
function Me(e, n) {
  const c = w.getState().getShadowMetadata(e, n);
  if (!c?.clientActivityState?.elements) return [];
  const o = [];
  return c.clientActivityState.elements.forEach((g) => {
    g.domRef?.current && o.push(g.domRef);
  }), o;
}
function $e(e, n) {
  return Me(e, n).map((o) => o.current).filter(Boolean);
}
function ut(e, n, c) {
  $e(e, n).forEach((o) => {
    if ("disabled" in o) {
      o.disabled = c;
      return;
    }
    o.style.pointerEvents = c ? "none" : "", o.setAttribute("aria-disabled", String(c));
  });
}
function be(e, n, c, o) {
  const g = /* @__PURE__ */ new Map();
  function l({
    path: t = [],
    meta: s,
    componentId: y
  }) {
    const $ = s ? JSON.stringify(s.arrayViews || s.transforms) : "", E = t.join(".") + ":" + y + ":" + $;
    if (g.has(E))
      return g.get(E);
    const V = [e, ...t].join("."), v = () => {
    }, N = {
      apply(B, f, J) {
        if (J.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", a = s?.arrayViews?.[r];
          return K(e, y, t), I(e, t, a);
        }
        const k = J[0];
        return n(k, t, { updateType: "update" }), !0;
      },
      get(B, f, J) {
        if (f === Symbol.toPrimitive)
          return (r) => r === "number" ? NaN : r === "string" ? `[CogsState: ${t.join(".") || "root"}]` : null;
        if (f === Symbol.toStringTag)
          return "CogsState";
        if (f === Symbol.iterator) {
          const { value: r } = _(e, t, s);
          return Array.isArray(r) ? function* () {
            for (let a = 0; a < r.length; a++)
              yield r[a];
          } : void 0;
        }
        if (f === "call" || f === "apply" || f === "bind")
          return Reflect.get(B, f, J);
        if (typeof f != "string")
          return Reflect.get(B, f);
        if (t.length === 0 && f in h)
          return h[f];
        if (typeof f == "string" && !f.startsWith("$")) {
          const { value: r } = _(e, t, s);
          if (r !== null && typeof r == "object" && !Array.isArray(r) && Object.prototype.hasOwnProperty.call(r, f)) {
            const u = [...t, f];
            return l({
              path: u,
              componentId: y,
              meta: s
            });
          }
          const i = F.getState().registeredPlugins;
          for (const u of i) {
            const m = u.chainMethods?.[f];
            if (m && ct(t, m.pathPattern) && lt(r, m.target))
              return (...p) => {
                const A = F.getState(), M = A.pluginOptions.get(e)?.get(u.name), T = A.getHookResult(e, u.name);
                return m.handler(
                  {
                    stateKey: e,
                    path: t,
                    pluginName: u.name,
                    options: M,
                    hookData: T,
                    $get: () => _(e, t, s).value,
                    $update: (P) => (n(P, t, {
                      updateType: "update"
                    }), {
                      synced: () => {
                        const C = w.getState().getShadowMetadata(e, t);
                        W(e, t, {
                          ...C,
                          isDirty: !1,
                          stateSource: "server",
                          lastServerSync: Date.now()
                        });
                      }
                    }),
                    $applyOperation: (P, C) => {
                      n(P.newValue, P.path, {
                        updateType: P.updateType,
                        itemId: P.itemId,
                        metaData: C
                      });
                    },
                    getFieldMetaData: () => Se(e, t)?.get(u.name),
                    setFieldMetaData: (P) => ye(e, t, u.name, P),
                    removeFieldMetaData: () => me(e, t, u.name),
                    getFieldRefs: () => Me(e, t),
                    getFieldElements: () => $e(e, t),
                    setFieldDisabled: (P) => ut(e, t, P)
                  },
                  ...p
                );
              };
          }
          const S = [...t, f];
          return l({
            path: S,
            componentId: y,
            meta: s
          });
        }
        if (f === "$_rebuildStateShape")
          return l;
        if (f === "$sync" && t.length === 0)
          return async function() {
            const r = w.getState().getInitialOptions(e), a = r?.sync;
            if (!a)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const i = w.getState().getShadowValue(e, []), S = r?.validation?.key;
            try {
              const u = await a.action(i);
              if (u && !u.success && u.errors, u?.success) {
                const m = w.getState().getShadowMetadata(e, []);
                W(e, [], {
                  ...m,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: i
                  // Update base server state
                }), a.onSuccess && a.onSuccess(u.data);
              } else !u?.success && a.onError && a.onError(u.error);
              return u;
            } catch (u) {
              return a.onError && a.onError(u), { success: !1, error: u };
            }
          };
        if (f === "$_status" || f === "$getStatus") {
          const r = () => {
            const { shadowMeta: a, value: i } = _(e, t, s);
            return a?.isDirty === !0 ? "dirty" : a?.stateSource === "server" || a?.isDirty === !1 ? "synced" : a?.stateSource === "localStorage" ? "restored" : a?.stateSource === "default" || i !== void 0 ? "fresh" : "unknown";
          };
          return f === "$_status" ? r() : r;
        }
        if (f === "$removeStorage")
          return () => {
            const r = w.getState().initialStateGlobal[e], a = j(e), i = R(a?.localStorage?.key) ? a.localStorage.key(r) : a?.localStorage?.key, S = `${o}-${e}-${i}`;
            S && localStorage.removeItem(S);
          };
        if (f === "$validate")
          return () => {
            const r = w.getState(), { value: a } = _(e, t, s), i = r.getInitialOptions(e), S = i?.validation?.zodSchemaV4 || i?.validation?.zodSchemaV3;
            if (!S)
              return { success: !0, data: a };
            const u = S.safeParse(a);
            if (u.success) {
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
              (u.error?.issues || u.error?.errors || []).forEach((p) => {
                const A = [...t, ...p.path.map(String)], M = r.getShadowMetadata(e, A) || {};
                r.setShadowMetadata(e, A, {
                  ...M,
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
            return z(e), u;
          };
        if (f === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = _(e, t, s);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((a) => a.severity === "error").map((a) => a.message) : [];
          };
        if (f === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            K(e, y, [
              ...t,
              "getSelected"
            ]);
            const a = w.getState().selectedIndicesMap.get(r);
            if (!a)
              return;
            const i = t.join("."), S = s?.arrayViews?.[i], u = a.split(".").pop();
            if (!(S && !S.includes(u) || I(
              e,
              a.split(".").slice(1)
            ) === void 0))
              return l({
                path: a.split(".").slice(1),
                componentId: y,
                meta: s
              });
          };
        if (f === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const a = w.getState().selectedIndicesMap.get(r);
            if (!a)
              return -1;
            const { keys: i } = O(e, t, s);
            if (!i)
              return -1;
            const S = a.split(".").pop();
            return i.indexOf(S);
          };
        if (f === "$clearSelected")
          return Q(e, t), () => {
            xe({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (f === "$map")
          return (r) => {
            const { value: a, keys: i } = O(
              e,
              t,
              s
            );
            if (K(e, y, t), !i || !Array.isArray(a))
              return [];
            const S = l({
              path: t,
              componentId: y,
              meta: s
            });
            return a.map((u, m) => {
              const p = i[m];
              if (!p) return;
              const A = [...t, p], M = l({
                path: A,
                // This now correctly points to the item in the shadow store.
                componentId: y,
                meta: s
              });
              return r(M, m, S);
            });
          };
        if (f === "$filter")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", { keys: i, value: S } = O(
              e,
              t,
              s
            );
            if (!Array.isArray(S))
              throw new Error("filter can only be used on arrays");
            const u = [];
            return S.forEach((m, p) => {
              if (r(m, p)) {
                const A = i[p];
                A && u.push(A);
              }
            }), l({
              path: t,
              componentId: y,
              meta: {
                ...s,
                arrayViews: {
                  ...s?.arrayViews || {},
                  [a]: u
                },
                transforms: [
                  ...s?.transforms || [],
                  { type: "filter", fn: r, path: t }
                ]
              }
            });
          };
        if (f === "$sort")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", { value: i, keys: S } = O(
              e,
              t,
              s
            );
            if (!Array.isArray(i) || !S)
              throw new Error("No array keys found for sorting");
            const u = i.map((p, A) => ({
              item: p,
              key: S[A]
            }));
            u.sort((p, A) => r(p.item, A.item));
            const m = u.map((p) => p.key);
            return l({
              path: t,
              componentId: y,
              meta: {
                ...s,
                arrayViews: {
                  ...s?.arrayViews || {},
                  [a]: m
                },
                transforms: [
                  ...s?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (f === "$list")
          return (r) => /* @__PURE__ */ H(() => {
            const i = G(/* @__PURE__ */ new Map()), [S, u] = ee({}), m = t.length > 0 ? t.join(".") : "root", p = it(e, t, s), A = ve(() => ({
              ...s,
              arrayViews: {
                ...s?.arrayViews || {},
                [m]: p
              }
            }), [s, m, p]), { value: M } = O(
              e,
              t,
              A
            );
            if (x(() => {
              const C = w.getState().subscribeToPath(V, (U) => {
                if (U.type === "GET_SELECTED")
                  return;
                const L = w.getState().getShadowMetadata(e, t)?.transformCaches;
                if (L)
                  for (const X of L.keys())
                    X.startsWith(y) && L.delete(X);
                (U.type === "INSERT" || U.type === "INSERT_MANY" || U.type === "REMOVE" || U.type === "CLEAR_SELECTION" || U.type === "SERVER_STATE_UPDATE" && !s?.serverStateIsUpStream) && u({});
              });
              return () => {
                C();
              };
            }, [y, V]), !Array.isArray(M))
              return null;
            const T = l({
              path: t,
              componentId: y,
              meta: A
              // Use updated meta here
            }), P = M.map((C, U) => {
              const q = p[U];
              if (!q)
                return null;
              let L = i.current.get(q);
              L || (L = te(), i.current.set(q, L));
              const X = [...t, q];
              return ue(je, {
                key: q,
                stateKey: e,
                itemComponentId: L,
                itemPath: X,
                localIndex: U,
                arraySetter: T,
                rebuildStateShape: l,
                renderFn: r
              });
            });
            return /* @__PURE__ */ H(Ee, { children: P });
          }, {});
        if (f === "$stateFlattenOn")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", i = s?.arrayViews?.[a], S = w.getState().getShadowValue(e, t, i);
            return Array.isArray(S) ? l({
              path: [...t, "[*]", r],
              componentId: y,
              meta: s
            }) : [];
          };
        if (f === "$index")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", i = s?.arrayViews?.[a];
            if (i) {
              const m = i[r];
              return m ? l({
                path: [...t, m],
                componentId: y,
                meta: s
              }) : void 0;
            }
            const S = b(e, t);
            if (!S?.arrayKeys) return;
            const u = S.arrayKeys[r];
            if (u)
              return l({
                path: [...t, u],
                componentId: y,
                meta: s
              });
          };
        if (f === "$last")
          return () => {
            const { keys: r } = O(e, t, s);
            if (!r || r.length === 0)
              return;
            const a = r[r.length - 1];
            if (!a)
              return;
            const i = [...t, a];
            return l({
              path: i,
              componentId: y,
              meta: s
            });
          };
        if (f === "$insert")
          return (r, a) => {
            n(r, t, {
              updateType: "insert",
              index: a
            });
          };
        if (f === "$insertMany")
          return (r) => {
            n(r, t, {
              updateType: "insert_many"
            });
          };
        if (f === "$uniqueInsert")
          return (r, a, i) => {
            const { value: S } = _(
              e,
              t,
              s
            ), u = R(r) ? r(S) : r;
            let m = null;
            if (!S.some((A) => {
              const M = a ? a.every(
                (T) => Y(A[T], u[T])
              ) : Y(A, u);
              return M && (m = A), M;
            }))
              n(u, t, { updateType: "insert" });
            else if (i && m) {
              const A = i(m), M = S.map(
                (T) => Y(T, m) ? A : T
              );
              n(M, t, {
                updateType: "update"
              });
            }
          };
        if (f === "$cut")
          return (r, a) => {
            const i = b(e, t);
            if (!i?.arrayKeys || i.arrayKeys.length === 0)
              return;
            const S = r === -1 ? i.arrayKeys.length - 1 : r !== void 0 ? r : i.arrayKeys.length - 1, u = i.arrayKeys[S];
            u && n(null, [...t, u], {
              updateType: "cut"
            });
          };
        if (f === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: a } = O(e, t, s);
            if (!a || a.length === 0)
              return;
            const i = w.getState().selectedIndicesMap.get(r);
            if (!i)
              return;
            const S = i.split(".").pop();
            if (!a.includes(S))
              return;
            const u = i.split(".").slice(1);
            w.getState().clearSelectedIndex({ arrayKey: r });
            const m = u.slice(0, -1);
            Q(e, m), n(null, u, {
              updateType: "cut"
            });
          };
        if (f === "$cutByValue")
          return (r) => {
            const {
              isArray: a,
              value: i,
              keys: S
            } = O(e, t, s);
            if (!a) return;
            const u = se(i, S, (m) => m === r);
            u && n(null, [...t, u.key], {
              updateType: "cut"
            });
          };
        if (f === "$toggleByValue")
          return (r) => {
            const {
              isArray: a,
              value: i,
              keys: S
            } = O(e, t, s);
            if (!a) return;
            const u = se(i, S, (m) => m === r);
            if (u) {
              const m = [...t, u.key];
              n(null, m, {
                updateType: "cut"
              });
            } else
              n(r, t, { updateType: "insert" });
          };
        if (f === "$findWith")
          return (r, a) => {
            const { isArray: i, value: S, keys: u } = O(e, t, s);
            if (!i)
              throw new Error("findWith can only be used on arrays");
            const m = se(
              S,
              u,
              (p) => p?.[r] === a
            );
            return m ? l({
              path: [...t, m.key],
              componentId: y,
              meta: s
            }) : null;
          };
        if (f === "$cutThis") {
          const { value: r } = _(e, t, s), a = t.slice(0, -1);
          return Q(e, a), () => {
            n(r, t, { updateType: "cut" });
          };
        }
        if (f === "$get")
          return () => {
            K(e, y, t);
            const { value: r } = _(e, t, s);
            return r;
          };
        if (f === "$$derive")
          return (r) => he({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: s
          });
        if (f === "$$get")
          return () => he({ _stateKey: e, _path: t, _meta: s });
        if (f === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return qe(r);
        }
        if (f == "getLocalStorage")
          return (r) => oe(o + "-" + e + "-" + r);
        if (f === "$isSelected") {
          const r = t.slice(0, -1);
          if (b(e, r)?.arrayKeys) {
            const i = e + "." + r.join("."), S = w.getState().selectedIndicesMap.get(i), u = e + "." + t.join(".");
            return S === u;
          }
          return;
        }
        if (f === "$setSelected")
          return (r) => {
            const a = t.slice(0, -1), i = e + "." + a.join("."), S = e + "." + t.join(".");
            Q(e, a, void 0), w.getState().selectedIndicesMap.get(i), r && w.getState().setSelectedIndex(i, S);
          };
        if (f === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), a = e + "." + r.join("."), i = e + "." + t.join(".");
            w.getState().selectedIndicesMap.get(a) === i ? w.getState().clearSelectedIndex({ arrayKey: a }) : w.getState().setSelectedIndex(a, i), Q(e, r);
          };
        if (f === "$clearValidation")
          return (r) => {
            const a = r ? [...t, ...r] : t, i = w.getState(), S = i.getShadowNode(e, a);
            if (console.log("startNode ", S), !S) return;
            const u = [[S, a]];
            for (console.log("stack ", u); u.length > 0; ) {
              const [m, p] = u.pop();
              if (console.log("while (stack.length ", m, p), !m || typeof m != "object") continue;
              if (m._meta?.validation) {
                m._meta.validation = {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now(),
                  validatedValue: void 0
                };
                const M = [e, ...p].join(".");
                i.notifyPathSubscribers(M, {
                  type: "VALIDATION_CLEAR"
                });
              }
              const A = Object.keys(m);
              for (const M of A)
                M !== "_meta" && u.push([m[M], [...p, M]]);
            }
            z(e);
          };
        if (t.length == 0) {
          if (f === "$_componentId")
            return y;
          if (f === "$setOptions")
            return (r) => {
              ce({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (f === "$_applyUpdate")
            return (r, a, i = "update") => {
              n(r, a, { updateType: i });
            };
          if (f === "$_getEffectiveSetState")
            return n;
          if (f === "$getPluginMetaData")
            return (r) => Se(e, t)?.get(r);
          if (f === "$addPluginMetaData")
            return (r, a) => ye(e, t, r, a);
          if (f === "$removePluginMetaData")
            return (r) => me(e, t, r);
          if (f === "$addZodValidation")
            return (r, a) => {
              r.forEach((i) => {
                const S = w.getState().getShadowMetadata(e, i.path) || {};
                w.getState().setShadowMetadata(e, i.path, {
                  ...S,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: a || "client",
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
            return (r, a) => {
              let i;
              if (r.insertAfterId && r.updateType === "insert") {
                const S = b(e, r.path);
                if (S?.arrayKeys) {
                  const u = S.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  u !== -1 && (i = u + 1);
                }
              }
              n(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                index: i,
                // Pass the calculated index
                metaData: a
              });
            };
          if (f === "$applyJsonPatch")
            return (r) => {
              const a = w.getState(), i = a.getShadowMetadata(e, []);
              if (!i?.components) return;
              const S = (m) => !m || m === "/" ? [] : m.split("/").slice(1).map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~")), u = /* @__PURE__ */ new Set();
              for (const m of r) {
                const p = S(m.path);
                switch (m.op) {
                  case "add":
                  case "replace": {
                    const { value: A } = m;
                    a.updateShadowAtPath(e, p, A), a.markAsDirty(e, p, { bubble: !0 });
                    let M = [...p];
                    for (; ; ) {
                      const T = a.getShadowMetadata(
                        e,
                        M
                      );
                      if (T?.pathComponents && T.pathComponents.forEach((P) => {
                        if (!u.has(P)) {
                          const C = i.components?.get(P);
                          C && (C.forceUpdate(), u.add(P));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const A = p.slice(0, -1);
                    a.removeShadowArrayElement(e, p), a.markAsDirty(e, A, { bubble: !0 });
                    let M = [...A];
                    for (; ; ) {
                      const T = a.getShadowMetadata(
                        e,
                        M
                      );
                      if (T?.pathComponents && T.pathComponents.forEach((P) => {
                        if (!u.has(P)) {
                          const C = i.components?.get(P);
                          C && (C.forceUpdate(), u.add(P));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (f === "$getComponents")
            return () => b(e, [])?.components;
        }
        if (f === "$validationWrapper")
          return ({
            children: r,
            hideMessage: a
          }) => /* @__PURE__ */ H(
            Ce,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: r
            }
          );
        if (f === "$_stateKey") return e;
        if (f === "$_path") return t;
        if (f === "$update")
          return (r) => (n(r, t, { updateType: "update" }), {
            synced: () => {
              const a = w.getState().getShadowMetadata(e, t);
              W(e, t, {
                ...a,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const i = [e, ...t].join(".");
              Je(i, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (f === "$toggle") {
          const { value: r } = _(
            e,
            t,
            s
          );
          if (typeof r != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            n(!r, t, {
              updateType: "update"
            });
          };
        }
        if (f === "$isolate")
          return (r, a) => {
            const i = Array.isArray(r), S = i ? r : void 0, u = i ? a : r;
            if (!u || typeof u != "function")
              throw new Error(
                "CogsState: $isolate requires a render function."
              );
            return /* @__PURE__ */ H(
              _e,
              {
                stateKey: e,
                path: t,
                dependencies: S,
                rebuildStateShape: l,
                renderFn: u
              }
            );
          };
        if (f === "$formElement")
          return (r, a) => /* @__PURE__ */ H(
            Oe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: l,
              setState: n,
              formOpts: a,
              renderFn: r
            }
          );
        const k = [...t, f];
        return l({
          path: k,
          componentId: y,
          meta: s
        });
      }
    }, D = new Proxy(v, N);
    return g.set(E, D), D;
  }
  const h = {
    $revertToInitialState: (t) => {
      const s = w.getState().getShadowMetadata(e, []);
      let y;
      s?.stateSource === "server" && s.baseServerState ? y = s.baseServerState : y = w.getState().initialStateGlobal[e], Be(e), Z(e, y), l({
        path: [],
        componentId: c
      });
      const $ = j(e), E = R($?.localStorage?.key) ? $?.localStorage?.key(y) : $?.localStorage?.key, V = `${o}-${e}-${E}`;
      return V && localStorage.removeItem(V), z(e), y;
    },
    $initializeAndMergeShadowState: (t) => {
      Fe(e, t), z(e);
    },
    $updateInitialState: (t) => {
      const s = be(
        e,
        n,
        c,
        o
      ), y = w.getState().initialStateGlobal[e], $ = j(e), E = R($?.localStorage?.key) ? $?.localStorage?.key(y) : $?.localStorage?.key, V = `${o}-${e}-${E}`;
      return localStorage.getItem(V) && localStorage.removeItem(V), Te(() => {
        pe(e, t), Z(e, t);
        const v = w.getState().getShadowMetadata(e, []);
        v && v?.components?.forEach((N) => {
          N.forceUpdate();
        });
      }), {
        fetchId: (v) => s.$get()[v]
      };
    }
  };
  return l({
    componentId: c,
    path: []
  });
}
function he(e) {
  return ue(dt, { proxy: e });
}
function dt({
  proxy: e
}) {
  const n = G(null), c = G(null), o = G(!1), g = `${e._stateKey}-${e._path.join(".")}`, l = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[l], d = I(e._stateKey, e._path, h);
  return x(() => {
    const t = n.current;
    if (!t || o.current) return;
    const s = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", g);
        return;
      }
      const y = t.parentElement, E = Array.from(y.childNodes).indexOf(t);
      let V = y.getAttribute("data-parent-id");
      V || (V = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", V)), c.current = `instance-${crypto.randomUUID()}`;
      const v = w.getState().getShadowMetadata(e._stateKey, e._path) || {}, N = v.signals || [];
      N.push({
        instanceId: c.current,
        parentId: V,
        position: E,
        effect: e._effect
      }), w.getState().setShadowMetadata(e._stateKey, e._path, {
        ...v,
        signals: N
      });
      let D = d;
      if (e._effect)
        try {
          D = new Function(
            "state",
            `return (${e._effect})(state)`
          )(d);
        } catch (f) {
          console.error("Error evaluating effect function:", f);
        }
      D !== null && typeof D == "object" && (D = JSON.stringify(D));
      const B = document.createTextNode(String(D ?? ""));
      t.replaceWith(B), o.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(s), c.current) {
        const y = w.getState().getShadowMetadata(e._stateKey, e._path) || {};
        y.signals && (y.signals = y.signals.filter(
          ($) => $.instanceId !== c.current
        ), w.getState().setShadowMetadata(e._stateKey, e._path, y));
      }
    };
  }, []), ue("span", {
    ref: n,
    style: { display: "contents" },
    "data-signal-id": g
  });
}
export {
  he as $cogsSignal,
  Mt as addStateOptions,
  $t as createCogsState,
  st as useCogsStateFn
};
//# sourceMappingURL=CogsState.js.map
