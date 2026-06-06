"use client";
import { jsx as H, Fragment as Ve } from "react/jsx-runtime";
import { pluginStore as F } from "./pluginStore.js";
import { useState as ee, useRef as G, useCallback as Pe, useEffect as x, useLayoutEffect as Te, useMemo as we, createElement as de, startTransition as ke } from "react";
import { transformStateFunc as Ie, isFunction as R, isDeepEqual as Y, isArray as De, getDifferences as Ce } from "./utility.js";
import { ValidationWrapper as _e, IsolatedComponentWrapper as Oe, FormElementWrapper as je, MemoizedCogsItemWrapper as Ne } from "./Components.js";
import Ue from "superjson";
import { v4 as te } from "uuid";
import { getGlobalStore as w, updateShadowTypeInfo as ge } from "./store.js";
import { useCogsConfig as pe } from "./CogsStateClient.js";
import { runValidation as Fe } from "./validation.js";
const {
  getInitialOptions: j,
  updateInitialStateGlobal: Ae,
  getShadowMetadata: E,
  setShadowMetadata: W,
  getShadowValue: I,
  initializeShadowState: Z,
  initializeAndMergeShadowState: Re,
  updateShadowAtPath: ze,
  insertShadowArrayElement: Le,
  insertManyShadowArrayElements: Me,
  removeShadowArrayElement: We,
  setInitialStateOptions: fe,
  setServerStateUpdate: Se,
  markAsDirty: ae,
  addPathComponent: Be,
  clearSelectedIndexesForState: Ge,
  addStateLog: xe,
  clearSelectedIndex: qe,
  getSyncInfo: Je,
  notifyPathSubscribers: He,
  getPluginMetaDataMap: ye,
  setPluginMetaData: me,
  removePluginMetaData: he
} = w.getState(), { notifyUpdate: Qe } = F.getState();
function O(e, n, c) {
  const o = E(e, n);
  if (!!!o?.arrayKeys)
    return { isArray: !1, value: w.getState().getShadowValue(e, n), keys: [] };
  const l = n.length > 0 ? n.join(".") : "root", h = c?.arrayViews?.[l] ?? o.arrayKeys;
  return Array.isArray(h) && h.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: w.getState().getShadowValue(e, n, h), keys: h ?? [] };
}
function ie(e, n, c) {
  for (let o = 0; o < e.length; o++)
    if (c(e[o], o)) {
      const g = n[o];
      if (g)
        return { key: g, index: o, value: e[o] };
    }
  return null;
}
function se(e, n) {
  const o = {
    ...j(e) || {},
    ...n
  };
  (o.validation?.zodSchemaV4 || o.validation?.zodSchemaV3) && !o.validation?.onBlur && (o.validation.onBlur = "error"), fe(e, o);
}
function le({
  stateKey: e,
  options: n,
  initialOptionsPart: c
}) {
  const o = j(e) || {}, g = c[e] || {};
  let l = { ...g, ...o }, h = !1;
  if (n) {
    const d = (t, i) => {
      for (const y in i)
        i.hasOwnProperty(y) && (i[y] instanceof Object && !Array.isArray(i[y]) && t[y] instanceof Object ? Y(t[y], i[y]) || (d(t[y], i[y]), h = !0) : t[y] !== i[y] && (t[y] = i[y], h = !0));
      return t;
    };
    l = d(l, n);
  }
  if (l.validation && (n?.validation?.hasOwnProperty("onBlur") || o?.validation?.hasOwnProperty("onBlur") || g?.validation?.hasOwnProperty("onBlur") || (l.validation.onBlur = "error", h = !0)), h) {
    fe(e, l);
    const d = o?.validation?.zodSchemaV4 || o?.validation?.zodSchemaV3, t = l.validation?.zodSchemaV4 && !o?.validation?.zodSchemaV4, i = l.validation?.zodSchemaV3 && !o?.validation?.zodSchemaV3;
    !d && (t || i) && (t ? ge(
      e,
      l.validation.zodSchemaV4,
      "zod4"
    ) : i && ge(
      e,
      l.validation.zodSchemaV3,
      "zod3"
    ), z(e));
  }
  return l;
}
function $t(e, n) {
  return {
    ...n,
    initialState: e,
    _addStateOptions: !0
  };
}
const bt = (e, n) => {
  n?.plugins && F.getState().setRegisteredPlugins(n.plugins);
  const [c, o] = Ie(e);
  Object.keys(c).forEach((d) => {
    let t = o[d] || {};
    const i = {
      ...t
    };
    n?.formElements && (i.formElements = {
      ...n.formElements,
      ...t.formElements || {}
    }), i.validation = {
      onBlur: "error",
      ...n?.validation,
      ...t.validation || {}
    }, n?.validation?.key && !t.validation?.key && (i.validation.key = `${n.validation.key}.${d}`);
    const y = j(d), $ = y ? {
      ...y,
      ...i,
      formElements: {
        ...y.formElements,
        ...i.formElements
      },
      validation: {
        ...y.validation,
        ...i.validation
      }
    } : i;
    fe(d, $);
  }), Object.keys(c).forEach((d) => {
    Z(d, c[d]);
  });
  const g = (d, t) => {
    const [i] = ee(t?.componentId ?? te()), y = le({
      stateKey: d,
      options: t,
      initialOptionsPart: o
    }), $ = G(y);
    $.current = y;
    const b = I(d, []) || c[d], T = st(
      b,
      {
        stateKey: d,
        syncUpdate: t?.syncUpdate,
        componentId: i,
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
    }, [d, t]), x(() => (F.getState().stateHandlers.set(d, T), () => {
      F.getState().stateHandlers.delete(d);
    }), [d, T]), T;
  };
  function l(d, t) {
    if (le({ stateKey: d, options: t, initialOptionsPart: o }), t.localStorage && Ze(d, t), t.formElements) {
      const y = F.getState().registeredPlugins.map(($) => t.formElements.hasOwnProperty($.name) ? {
        ...$,
        formWrapper: t.formElements[$.name]
      } : $);
      F.getState().setRegisteredPlugins(y);
    }
    z(d);
  }
  function h(d) {
    Object.keys(c).forEach((i) => {
      l(i, d);
    });
  }
  return {
    useCogsState: g,
    setCogsOptionsByKey: l,
    setCogsOptions: h
  };
}, Ye = (e, n, c, o, g) => {
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
    const t = E(n, []), i = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: d,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, y = Ue.serialize(i);
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
}, ce = (e) => {
  if (e)
    try {
      typeof window < "u" && window.localStorage && window.localStorage.removeItem(e);
    } catch (n) {
      console.error("Error removing from localStorage:", n);
    }
}, Ze = (e, n) => {
  const c = I(e, []), { sessionId: o } = pe(), g = R(n?.localStorage?.key) ? n.localStorage.key(c) : n?.localStorage?.key;
  if (g && o) {
    const l = oe(
      `${o}-${e}-${g}`
    );
    if (l && l.lastUpdated > (l.lastSyncedWithServer || 0))
      return z(e), !0;
  }
  return !1;
}, z = (e) => {
  const n = E(e, []);
  if (!n) return;
  const c = /* @__PURE__ */ new Set();
  n?.components?.forEach((o) => {
    (o ? Array.isArray(o.reactiveType) ? o.reactiveType : [o.reactiveType || "component"] : null)?.includes("none") || c.add(() => o.forceUpdate());
  }), queueMicrotask(() => {
    c.forEach((o) => o());
  });
};
function re(e, n, c, o) {
  const g = E(e, n);
  if (W(e, n, {
    ...g,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: o || Date.now()
  }), Array.isArray(c)) {
    const l = E(e, n);
    l?.arrayKeys && l.arrayKeys.forEach((h, d) => {
      const t = [...n, h], i = c[d];
      i !== void 0 && re(
        e,
        t,
        i,
        o
      );
    });
  } else c && typeof c == "object" && c.constructor === Object && Object.keys(c).forEach((l) => {
    const h = [...n, l], d = c[l];
    re(e, h, d, o);
  });
}
let ne = [], ue = !1;
function Xe() {
  ue || (ue = !0, queueMicrotask(() => {
    ot();
  }));
}
function Ke(e, n) {
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
function et(e, n, c) {
  const o = E(e, []);
  if (!o?.components)
    return /* @__PURE__ */ new Set();
  const g = /* @__PURE__ */ new Set();
  if (c.type === "update") {
    let l = [...n];
    for (; ; ) {
      const h = E(e, l);
      if (h?.pathComponents && h.pathComponents.forEach((d) => {
        const t = o.components?.get(d);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || g.add(t));
      }), l.length === 0) break;
      l.pop();
    }
    c.newValue && typeof c.newValue == "object" && !De(c.newValue) && Ce(c.newValue, c.oldValue).forEach((d) => {
      const t = d.split("."), i = [...n, ...t], y = E(e, i);
      y?.pathComponents && y.pathComponents.forEach(($) => {
        const b = o.components?.get($);
        b && ((Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"]).includes("none") || g.add(b));
      });
    });
  } else if (c.type === "insert" || c.type === "cut" || c.type === "insert_many") {
    let h = [...c.type === "insert" ? n : n.slice(0, -1)];
    for (; ; ) {
      const d = E(e, h);
      if (d?.pathComponents && d.pathComponents.forEach((t) => {
        const i = o.components?.get(t);
        i && g.add(i);
      }), h.length === 0) break;
      h.pop();
    }
  }
  return g;
}
function tt(e, n, c) {
  const o = w.getState().getShadowValue(e, n), g = R(c) ? c(o) : c;
  if (Y(o, g))
    return null;
  ze(e, n, g), ae(e, n, { bubble: !0 });
  const l = E(e, n);
  return {
    type: "update",
    oldValue: o,
    newValue: g,
    shadowMeta: l
  };
}
function rt(e, n, c) {
  Me(e, n, c), ae(e, n, { bubble: !0 });
  const o = E(e, n);
  return {
    type: "insert_many",
    count: c.length,
    shadowMeta: o,
    path: n
  };
}
function nt(e, n, c, o, g) {
  let l;
  if (R(c)) {
    const { value: i } = _(e, n);
    l = c({ state: i });
  } else
    l = c;
  const h = Le(
    e,
    n,
    l,
    o,
    g
  );
  ae(e, n, { bubble: !0 });
  const d = E(e, n);
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
function at(e, n) {
  const c = n.slice(0, -1), o = I(e, n);
  return We(e, n), ae(e, c, { bubble: !0 }), { type: "cut", oldValue: o, parentPath: c };
}
function ot() {
  const e = /* @__PURE__ */ new Set(), n = [], c = [];
  for (const o of ne) {
    if (o.status && o.updateType) {
      c.push(o);
      continue;
    }
    const g = o, l = g.type === "cut" ? null : g.newValue;
    g.shadowMeta?.signals?.length > 0 && n.push({ shadowMeta: g.shadowMeta, displayValue: l }), et(
      g.stateKey,
      g.path,
      g
    ).forEach((d) => {
      e.add(d);
    });
  }
  c.length > 0 && xe(c), n.forEach(({ shadowMeta: o, displayValue: g }) => {
    Ke(o, g);
  }), e.forEach((o) => {
    o.forceUpdate();
  }), ne = [], ue = !1;
}
function it(e, n, c) {
  return (g, l, h) => {
    o(e, l, g, h);
  };
  function o(g, l, h, d) {
    let t;
    switch (d.updateType) {
      case "update":
        t = tt(g, l, h);
        break;
      case "insert":
        t = nt(
          g,
          l,
          h,
          d.index,
          d.itemId
        );
        break;
      case "insert_many":
        t = rt(g, l, h);
        break;
      case "cut":
        t = at(g, l);
        break;
    }
    if (t === null)
      return;
    t.stateKey = g, t.path = l, ne.push(t), Xe();
    const i = {
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
    ne.push(i), t.newValue !== void 0 && Ye(
      t.newValue,
      g,
      c.current,
      n
    ), c.current?.middleware && c.current.middleware({ update: i }), Fe(i, d.validationTrigger || "programmatic"), Qe(i);
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
  serverState: i
} = {}) {
  const [y, $] = ee({}), { sessionId: b } = pe();
  let T = !n;
  const [v] = ee(n ?? te()), N = G(h ?? te()), D = G(
    null
  );
  D.current = j(v) ?? null;
  const B = Pe(
    (k) => {
      const a = k ? { ...j(v), ...k } : j(v), s = a?.defaultState || d || e;
      if (a?.serverState?.status === "success" && a?.serverState?.data !== void 0)
        return {
          value: a.serverState.data,
          source: "server",
          timestamp: a.serverState.timestamp || Date.now()
        };
      if (a?.localStorage?.key && b) {
        const u = R(a.localStorage.key) ? a.localStorage.key(s) : a.localStorage.key, m = oe(
          `${b}-${v}-${u}`
        );
        if (m && m.lastUpdated > (a?.serverState?.timestamp || 0))
          return {
            value: m.state,
            source: "localStorage",
            timestamp: m.lastUpdated
          };
      }
      return {
        value: s || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [v, d, e, b]
  );
  x(() => {
    i && i.status === "success" && i.data !== void 0 && Se(v, i);
  }, [i, v]), x(() => w.getState().subscribeToPath(v, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const a = r.serverState;
      if (a?.status !== "success" || a.data === void 0)
        return;
      se(v, { serverState: a });
      const s = typeof a.merge == "object" ? a.merge : a.merge === !0 ? { strategy: "append", key: "id" } : null, S = I(v, []), u = a.data;
      if (s && s.strategy === "append" && "key" in s && Array.isArray(S) && Array.isArray(u)) {
        const m = s.key;
        if (!m) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const p = new Set(
          S.map((P) => P[m])
        ), A = u.filter(
          (P) => !p.has(P[m])
        );
        A.length > 0 && Me(v, [], A);
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
      r?.defaultState || se(v, {
        defaultState: m
      });
    }
    const { value: s, source: S, timestamp: u } = B();
    Z(v, s), W(v, [], {
      stateSource: S,
      lastServerSync: S === "server" ? u : void 0,
      isDirty: S === "server" ? !1 : void 0,
      baseServerState: S === "server" ? s : void 0
    }), S === "server" && i && Se(v, i), z(v);
  }, [v, ...t || []]), Te(() => {
    T && se(v, {
      formElements: o,
      defaultState: d,
      localStorage: c,
      middleware: D.current?.middleware
    });
    const k = `${v}////${N.current}`, r = E(v, []), a = r?.components || /* @__PURE__ */ new Map();
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
      const s = E(v, []), S = s?.components?.get(k);
      S?.paths && S.paths.forEach((u) => {
        const p = u.split(".").slice(1), A = w.getState().getShadowMetadata(v, p);
        A?.pathComponents && A.pathComponents.size === 0 && (delete A.pathComponents, w.getState().setShadowMetadata(v, p, A));
      }), s?.components && W(v, [], s);
    };
  }, []);
  const f = it(
    v,
    b,
    D
  );
  return w.getState().initialStateGlobal[v] || Ae(v, e), we(() => Ee(
    v,
    f,
    N.current,
    b
  ), [v, b]);
}
const ct = (e, n, c) => {
  let o = E(e, n)?.arrayKeys || [];
  const g = c?.transforms;
  if (!g || g.length === 0)
    return o;
  for (const l of g)
    if (l.type === "filter") {
      const h = [];
      o.forEach((d, t) => {
        const i = I(e, [...n, d]);
        l.fn(i, t) && h.push(d);
      }), o = h;
    } else l.type === "sort" && o.sort((h, d) => {
      const t = I(e, [...n, h]), i = I(e, [...n, d]);
      return l.fn(t, i);
    });
  return o;
}, K = (e, n, c) => {
  const o = `${e}////${n}`, l = E(e, [])?.components?.get(o);
  !l || l.reactiveType === "none" || !(Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType]).includes("component") || Be(e, c, o);
}, Q = (e, n, c) => {
  const o = E(e, []), g = /* @__PURE__ */ new Set();
  o?.components && o.components.forEach((h, d) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), g.add(d));
  }), E(e, [
    ...n,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    o?.components?.get(h)?.forceUpdate();
  });
  const l = E(e, n);
  for (let h of l?.arrayKeys || []) {
    const d = h + ".selected", t = E(e, d.split(".").slice(1));
    h == c && t?.pathComponents?.forEach((i) => {
      o?.components?.get(i)?.forceUpdate();
    });
  }
};
function _(e, n, c) {
  const o = E(e, n), g = n.length > 0 ? n.join(".") : "root", l = c?.arrayViews?.[g];
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
function lt(e, n) {
  return n ? e.length !== n.length ? !1 : n.every((c, o) => c === "*" || c === e[o]) : !0;
}
function ut(e, n) {
  return n === "any" ? !0 : n === "array" ? Array.isArray(e) : n === "boolean" ? typeof e == "boolean" : n === "object" ? e !== null && typeof e == "object" && !Array.isArray(e) : n === "primitive" ? e === null || typeof e != "object" && !Array.isArray(e) : !1;
}
function $e(e, n) {
  const c = w.getState().getShadowMetadata(e, n);
  if (!c?.clientActivityState?.elements) return [];
  const o = [];
  return c.clientActivityState.elements.forEach((g) => {
    g.domRef?.current && o.push(g.domRef);
  }), o;
}
function be(e, n) {
  return $e(e, n).map((o) => o.current).filter(Boolean);
}
function dt(e, n, c) {
  be(e, n).forEach((o) => {
    if ("disabled" in o) {
      o.disabled = c;
      return;
    }
    o.style.pointerEvents = c ? "none" : "", o.setAttribute("aria-disabled", String(c));
  });
}
function Ee(e, n, c, o) {
  const g = /* @__PURE__ */ new Map();
  function l({
    path: t = [],
    meta: i,
    componentId: y
  }) {
    const $ = i ? JSON.stringify(i.arrayViews || i.transforms) : "", b = t.join(".") + ":" + y + ":" + $;
    if (g.has(b))
      return g.get(b);
    const T = [e, ...t].join("."), v = () => {
    }, N = {
      apply(B, f, J) {
        if (J.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", a = i?.arrayViews?.[r];
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
          const { value: r } = _(e, t, i);
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
          const { value: r } = _(e, t, i);
          if (r !== null && typeof r == "object" && !Array.isArray(r) && Object.prototype.hasOwnProperty.call(r, f)) {
            const u = [...t, f];
            return l({
              path: u,
              componentId: y,
              meta: i
            });
          }
          const s = F.getState().registeredPlugins;
          for (const u of s) {
            const m = u.chainMethods?.[f];
            if (m && lt(t, m.pathPattern) && ut(r, m.target))
              return (...p) => {
                const A = F.getState(), M = A.pluginOptions.get(e)?.get(u.name), P = A.getHookResult(e, u.name);
                return m.handler(
                  {
                    stateKey: e,
                    path: t,
                    pluginName: u.name,
                    options: M,
                    hookData: P,
                    $get: () => _(e, t, i).value,
                    $update: (V) => (n(V, t, {
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
                    $applyOperation: (V, C) => {
                      n(V.newValue, V.path, {
                        updateType: V.updateType,
                        itemId: V.itemId,
                        metaData: C
                      });
                    },
                    getFieldMetaData: () => ye(e, t)?.get(u.name),
                    setFieldMetaData: (V) => me(e, t, u.name, V),
                    removeFieldMetaData: () => he(e, t, u.name),
                    getFieldRefs: () => $e(e, t),
                    getFieldElements: () => be(e, t),
                    setFieldDisabled: (V) => dt(e, t, V)
                  },
                  ...p
                );
              };
          }
          const S = [...t, f];
          return l({
            path: S,
            componentId: y,
            meta: i
          });
        }
        if (f === "$_rebuildStateShape")
          return l;
        if (f === "$sync" && t.length === 0)
          return async function() {
            const r = w.getState().getInitialOptions(e), a = r?.sync;
            if (!a)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const s = w.getState().getShadowValue(e, []), S = r?.validation?.key;
            try {
              const u = await a.action(s);
              if (u && !u.success && u.errors, u?.success) {
                const m = w.getState().getShadowMetadata(e, []);
                W(e, [], {
                  ...m,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: s
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
            const { shadowMeta: a, value: s } = _(e, t, i);
            return a?.isDirty === !0 ? "dirty" : a?.stateSource === "server" || a?.isDirty === !1 ? "synced" : a?.stateSource === "localStorage" ? "restored" : a?.stateSource === "default" || s !== void 0 ? "fresh" : "unknown";
          };
          return f === "$_status" ? r() : r;
        }
        if (f === "$removeStorage")
          return () => {
            const r = w.getState().initialStateGlobal[e], a = j(e), s = R(a?.localStorage?.key) ? a.localStorage.key(r) : a?.localStorage?.key, S = o && s ? `${o}-${e}-${s}` : void 0;
            ce(S);
          };
        if (f === "$validate")
          return () => {
            const r = w.getState(), { value: a } = _(e, t, i), s = r.getInitialOptions(e), S = s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3;
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
            const { shadowMeta: r } = _(e, t, i);
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
            const s = t.join("."), S = i?.arrayViews?.[s], u = a.split(".").pop();
            if (!(S && !S.includes(u) || I(
              e,
              a.split(".").slice(1)
            ) === void 0))
              return l({
                path: a.split(".").slice(1),
                componentId: y,
                meta: i
              });
          };
        if (f === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const a = w.getState().selectedIndicesMap.get(r);
            if (!a)
              return -1;
            const { keys: s } = O(e, t, i);
            if (!s)
              return -1;
            const S = a.split(".").pop();
            return s.indexOf(S);
          };
        if (f === "$clearSelected")
          return Q(e, t), () => {
            qe({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (f === "$map")
          return (r) => {
            const { value: a, keys: s } = O(
              e,
              t,
              i
            );
            if (K(e, y, t), !s || !Array.isArray(a))
              return [];
            const S = l({
              path: t,
              componentId: y,
              meta: i
            });
            return a.map((u, m) => {
              const p = s[m];
              if (!p) return;
              const A = [...t, p], M = l({
                path: A,
                // This now correctly points to the item in the shadow store.
                componentId: y,
                meta: i
              });
              return r(M, m, S);
            });
          };
        if (f === "$filter")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", { keys: s, value: S } = O(
              e,
              t,
              i
            );
            if (!Array.isArray(S))
              throw new Error("filter can only be used on arrays");
            const u = [];
            return S.forEach((m, p) => {
              if (r(m, p)) {
                const A = s[p];
                A && u.push(A);
              }
            }), l({
              path: t,
              componentId: y,
              meta: {
                ...i,
                arrayViews: {
                  ...i?.arrayViews || {},
                  [a]: u
                },
                transforms: [
                  ...i?.transforms || [],
                  { type: "filter", fn: r, path: t }
                ]
              }
            });
          };
        if (f === "$sort")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", { value: s, keys: S } = O(
              e,
              t,
              i
            );
            if (!Array.isArray(s) || !S)
              throw new Error("No array keys found for sorting");
            const u = s.map((p, A) => ({
              item: p,
              key: S[A]
            }));
            u.sort((p, A) => r(p.item, A.item));
            const m = u.map((p) => p.key);
            return l({
              path: t,
              componentId: y,
              meta: {
                ...i,
                arrayViews: {
                  ...i?.arrayViews || {},
                  [a]: m
                },
                transforms: [
                  ...i?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (f === "$list")
          return (r) => /* @__PURE__ */ H(() => {
            const s = G(/* @__PURE__ */ new Map()), [S, u] = ee({}), m = t.length > 0 ? t.join(".") : "root", p = ct(e, t, i), A = we(() => ({
              ...i,
              arrayViews: {
                ...i?.arrayViews || {},
                [m]: p
              }
            }), [i, m, p]), { value: M } = O(
              e,
              t,
              A
            );
            if (x(() => {
              const C = w.getState().subscribeToPath(T, (U) => {
                if (U.type === "GET_SELECTED")
                  return;
                const L = w.getState().getShadowMetadata(e, t)?.transformCaches;
                if (L)
                  for (const X of L.keys())
                    X.startsWith(y) && L.delete(X);
                (U.type === "INSERT" || U.type === "INSERT_MANY" || U.type === "REMOVE" || U.type === "CLEAR_SELECTION" || U.type === "SERVER_STATE_UPDATE" && !i?.serverStateIsUpStream) && u({});
              });
              return () => {
                C();
              };
            }, [y, T]), !Array.isArray(M))
              return null;
            const P = l({
              path: t,
              componentId: y,
              meta: A
              // Use updated meta here
            }), V = M.map((C, U) => {
              const q = p[U];
              if (!q)
                return null;
              let L = s.current.get(q);
              L || (L = te(), s.current.set(q, L));
              const X = [...t, q];
              return de(Ne, {
                key: q,
                stateKey: e,
                itemComponentId: L,
                itemPath: X,
                localIndex: U,
                arraySetter: P,
                rebuildStateShape: l,
                renderFn: r
              });
            });
            return /* @__PURE__ */ H(Ve, { children: V });
          }, {});
        if (f === "$stateFlattenOn")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", s = i?.arrayViews?.[a], S = w.getState().getShadowValue(e, t, s);
            return Array.isArray(S) ? l({
              path: [...t, "[*]", r],
              componentId: y,
              meta: i
            }) : [];
          };
        if (f === "$index")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", s = i?.arrayViews?.[a];
            if (s) {
              const m = s[r];
              return m ? l({
                path: [...t, m],
                componentId: y,
                meta: i
              }) : void 0;
            }
            const S = E(e, t);
            if (!S?.arrayKeys) return;
            const u = S.arrayKeys[r];
            if (u)
              return l({
                path: [...t, u],
                componentId: y,
                meta: i
              });
          };
        if (f === "$last")
          return () => {
            const { keys: r } = O(e, t, i);
            if (!r || r.length === 0)
              return;
            const a = r[r.length - 1];
            if (!a)
              return;
            const s = [...t, a];
            return l({
              path: s,
              componentId: y,
              meta: i
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
          return (r, a, s) => {
            const { value: S } = _(
              e,
              t,
              i
            ), u = R(r) ? r(S) : r;
            let m = null;
            if (!S.some((A) => {
              const M = a ? a.every(
                (P) => Y(A[P], u[P])
              ) : Y(A, u);
              return M && (m = A), M;
            }))
              n(u, t, { updateType: "insert" });
            else if (s && m) {
              const A = s(m), M = S.map(
                (P) => Y(P, m) ? A : P
              );
              n(M, t, {
                updateType: "update"
              });
            }
          };
        if (f === "$cut")
          return (r, a) => {
            const s = E(e, t);
            if (!s?.arrayKeys || s.arrayKeys.length === 0)
              return;
            const S = r === -1 ? s.arrayKeys.length - 1 : r !== void 0 ? r : s.arrayKeys.length - 1, u = s.arrayKeys[S];
            u && n(null, [...t, u], {
              updateType: "cut"
            });
          };
        if (f === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: a } = O(e, t, i);
            if (!a || a.length === 0)
              return;
            const s = w.getState().selectedIndicesMap.get(r);
            if (!s)
              return;
            const S = s.split(".").pop();
            if (!a.includes(S))
              return;
            const u = s.split(".").slice(1);
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
              value: s,
              keys: S
            } = O(e, t, i);
            if (!a) return;
            const u = ie(s, S, (m) => m === r);
            u && n(null, [...t, u.key], {
              updateType: "cut"
            });
          };
        if (f === "$toggleByValue")
          return (r) => {
            const {
              isArray: a,
              value: s,
              keys: S
            } = O(e, t, i);
            if (!a) return;
            const u = ie(s, S, (m) => m === r);
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
            const { isArray: s, value: S, keys: u } = O(e, t, i);
            if (!s)
              throw new Error("findWith can only be used on arrays");
            const m = ie(
              S,
              u,
              (p) => p?.[r] === a
            );
            return m ? l({
              path: [...t, m.key],
              componentId: y,
              meta: i
            }) : null;
          };
        if (f === "$cutThis") {
          const { value: r } = _(e, t, i), a = t.slice(0, -1);
          return Q(e, a), () => {
            n(r, t, { updateType: "cut" });
          };
        }
        if (f === "$get")
          return () => {
            K(e, y, t);
            const { value: r } = _(e, t, i);
            return r;
          };
        if (f === "$$derive")
          return (r) => ve({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: i
          });
        if (f === "$$get")
          return () => ve({ _stateKey: e, _path: t, _meta: i });
        if (f === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return Je(r);
        }
        if (f == "getLocalStorage")
          return (r) => oe(o + "-" + e + "-" + r);
        if (f === "$isSelected") {
          const r = t.slice(0, -1);
          if (E(e, r)?.arrayKeys) {
            const s = e + "." + r.join("."), S = w.getState().selectedIndicesMap.get(s), u = e + "." + t.join(".");
            return S === u;
          }
          return;
        }
        if (f === "$setSelected")
          return (r) => {
            const a = t.slice(0, -1), s = e + "." + a.join("."), S = e + "." + t.join(".");
            Q(e, a, void 0), w.getState().selectedIndicesMap.get(s), r && w.getState().setSelectedIndex(s, S);
          };
        if (f === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), a = e + "." + r.join("."), s = e + "." + t.join(".");
            w.getState().selectedIndicesMap.get(a) === s ? w.getState().clearSelectedIndex({ arrayKey: a }) : w.getState().setSelectedIndex(a, s), Q(e, r);
          };
        if (f === "$clearValidation")
          return (r) => {
            const a = r ? [...t, ...r] : t, s = w.getState(), S = s.getShadowNode(e, a);
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
                s.notifyPathSubscribers(M, {
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
              le({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (f === "$_applyUpdate")
            return (r, a, s = "update") => {
              n(r, a, { updateType: s });
            };
          if (f === "$_getEffectiveSetState")
            return n;
          if (f === "$getPluginMetaData")
            return (r) => ye(e, t)?.get(r);
          if (f === "$addPluginMetaData")
            return (r, a) => me(e, t, r, a);
          if (f === "$removePluginMetaData")
            return (r) => he(e, t, r);
          if (f === "$addZodValidation")
            return (r, a) => {
              r.forEach((s) => {
                const S = w.getState().getShadowMetadata(e, s.path) || {};
                w.getState().setShadowMetadata(e, s.path, {
                  ...S,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: a || "client",
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
          if (f === "$applyOperation")
            return (r, a) => {
              let s;
              if (r.insertAfterId && r.updateType === "insert") {
                const S = E(e, r.path);
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
                metaData: a
              });
            };
          if (f === "$applyJsonPatch")
            return (r) => {
              const a = w.getState(), s = a.getShadowMetadata(e, []);
              if (!s?.components) return;
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
                      const P = a.getShadowMetadata(
                        e,
                        M
                      );
                      if (P?.pathComponents && P.pathComponents.forEach((V) => {
                        if (!u.has(V)) {
                          const C = s.components?.get(V);
                          C && (C.forceUpdate(), u.add(V));
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
                      const P = a.getShadowMetadata(
                        e,
                        M
                      );
                      if (P?.pathComponents && P.pathComponents.forEach((V) => {
                        if (!u.has(V)) {
                          const C = s.components?.get(V);
                          C && (C.forceUpdate(), u.add(V));
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
            return () => E(e, [])?.components;
        }
        if (f === "$validationWrapper")
          return ({
            children: r,
            hideMessage: a
          }) => /* @__PURE__ */ H(
            _e,
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
              const s = [e, ...t].join(".");
              He(s, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (f === "$toggle") {
          const { value: r } = _(
            e,
            t,
            i
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
            const s = Array.isArray(r), S = s ? r : void 0, u = s ? a : r;
            if (!u || typeof u != "function")
              throw new Error(
                "CogsState: $isolate requires a render function."
              );
            return /* @__PURE__ */ H(
              Oe,
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
            je,
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
          meta: i
        });
      }
    }, D = new Proxy(v, N);
    return g.set(b, D), D;
  }
  const h = {
    $revertToInitialState: (t) => {
      const i = w.getState().getShadowMetadata(e, []);
      let y;
      i?.stateSource === "server" && i.baseServerState ? y = i.baseServerState : y = w.getState().initialStateGlobal[e], Ge(e), Z(e, y), l({
        path: [],
        componentId: c
      });
      const $ = j(e), b = R($?.localStorage?.key) ? $?.localStorage?.key(y) : $?.localStorage?.key, T = o && b ? `${o}-${e}-${b}` : void 0;
      return ce(T), z(e), y;
    },
    $initializeAndMergeShadowState: (t) => {
      Re(e, t), z(e);
    },
    $updateInitialState: (t) => {
      const i = Ee(
        e,
        n,
        c,
        o
      ), y = w.getState().initialStateGlobal[e], $ = j(e), b = R($?.localStorage?.key) ? $?.localStorage?.key(y) : $?.localStorage?.key, T = o && b ? `${o}-${e}-${b}` : void 0;
      return ce(T), ke(() => {
        Ae(e, t), Z(e, t);
        const v = w.getState().getShadowMetadata(e, []);
        v && v?.components?.forEach((N) => {
          N.forceUpdate();
        });
      }), {
        fetchId: (v) => i.$get()[v]
      };
    }
  };
  return l({
    componentId: c,
    path: []
  });
}
function ve(e) {
  return de(ft, { proxy: e });
}
function ft({
  proxy: e
}) {
  const n = G(null), c = G(null), o = G(!1), g = `${e._stateKey}-${e._path.join(".")}`, l = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[l], d = I(e._stateKey, e._path, h);
  return x(() => {
    const t = n.current;
    if (!t || o.current) return;
    const i = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", g);
        return;
      }
      const y = t.parentElement, b = Array.from(y.childNodes).indexOf(t);
      let T = y.getAttribute("data-parent-id");
      T || (T = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", T)), c.current = `instance-${crypto.randomUUID()}`;
      const v = w.getState().getShadowMetadata(e._stateKey, e._path) || {}, N = v.signals || [];
      N.push({
        instanceId: c.current,
        parentId: T,
        position: b,
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
      if (clearTimeout(i), c.current) {
        const y = w.getState().getShadowMetadata(e._stateKey, e._path) || {};
        y.signals && (y.signals = y.signals.filter(
          ($) => $.instanceId !== c.current
        ), w.getState().setShadowMetadata(e._stateKey, e._path, y));
      }
    };
  }, []), de("span", {
    ref: n,
    style: { display: "contents" },
    "data-signal-id": g
  });
}
export {
  ve as $cogsSignal,
  $t as addStateOptions,
  bt as createCogsState,
  st as useCogsStateFn
};
//# sourceMappingURL=CogsState.js.map
