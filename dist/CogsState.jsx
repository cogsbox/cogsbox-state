"use client";
import { jsx as ne, Fragment as Ue } from "react/jsx-runtime";
import { pluginStore as Q } from "./pluginStore.js";
import { useState as ee, useRef as F, useCallback as pe, useEffect as z, useLayoutEffect as le, useMemo as Te, createElement as Ee, startTransition as _e } from "react";
import { transformStateFunc as Oe, isFunction as G, isDeepEqual as ae, isArray as je, getDifferences as Ne } from "./utility.js";
import { ValidationWrapper as Fe, IsolatedComponentWrapper as xe, FormElementWrapper as Re, MemoizedCogsItemWrapper as Be } from "./Components.jsx";
import Le from "superjson";
import { v4 as se } from "uuid";
import { getGlobalStore as T, updateShadowTypeInfo as Ie } from "./store.js";
import { useCogsConfig as Pe } from "./CogsStateClient.jsx";
import { runValidation as ze } from "./validation.js";
const {
  getInitialOptions: q,
  updateInitialStateGlobal: ke,
  getShadowMetadata: A,
  setShadowMetadata: J,
  getShadowValue: x,
  initializeShadowState: ie,
  initializeAndMergeShadowState: We,
  updateShadowAtPath: qe,
  insertShadowArrayElement: He,
  insertManyShadowArrayElements: Ce,
  removeShadowArrayElement: Ge,
  setInitialStateOptions: be,
  setServerStateUpdate: $e,
  markAsDirty: fe,
  addPathComponent: Je,
  clearSelectedIndexesForState: Ye,
  addStateLog: Ze,
  setSyncInfo: Pt,
  clearSelectedIndex: Qe,
  getSyncInfo: Xe,
  notifyPathSubscribers: Ke,
  getPluginMetaDataMap: et,
  setPluginMetaData: tt,
  removePluginMetaData: rt
  // Note: The old functions are no longer imported under their original names
} = T.getState(), { notifyUpdate: nt } = Q.getState();
function L(e, n, l) {
  const s = A(e, n);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, n), keys: [] };
  const i = n.length > 0 ? n.join(".") : "root", h = l?.arrayViews?.[i] ?? s.arrayKeys;
  return Array.isArray(h) && h.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, n, h), keys: h ?? [] };
}
function he(e, n, l) {
  for (let s = 0; s < e.length; s++)
    if (l(e[s], s)) {
      const g = n[s];
      if (g)
        return { key: g, index: s, value: e[s] };
    }
  return null;
}
function ve(e, n) {
  const s = {
    ...q(e) || {},
    ...n
  };
  (s.validation?.zodSchemaV4 || s.validation?.zodSchemaV3) && !s.validation?.onBlur && (s.validation.onBlur = "error"), be(e, s);
}
function Me({
  stateKey: e,
  options: n,
  initialOptionsPart: l
}) {
  const s = q(e) || {}, g = l[e] || {};
  let i = { ...g, ...s }, h = !1;
  if (n) {
    const d = (t, a) => {
      for (const S in a)
        a.hasOwnProperty(S) && (a[S] instanceof Object && !Array.isArray(a[S]) && t[S] instanceof Object ? ae(t[S], a[S]) || (d(t[S], a[S]), h = !0) : t[S] !== a[S] && (t[S] = a[S], h = !0));
      return t;
    };
    i = d(i, n);
  }
  if (i.validation && (n?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || g?.validation?.hasOwnProperty("onBlur") || (i.validation.onBlur = "error", h = !0)), h) {
    be(e, i);
    const d = s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3, t = i.validation?.zodSchemaV4 && !s?.validation?.zodSchemaV4, a = i.validation?.zodSchemaV3 && !s?.validation?.zodSchemaV3;
    !d && (t || a) && (t ? Ie(
      e,
      i.validation.zodSchemaV4,
      "zod4"
    ) : a && Ie(
      e,
      i.validation.zodSchemaV3,
      "zod3"
    ), K(e));
  }
  return i;
}
function kt(e, n) {
  return {
    ...n,
    initialState: e,
    _addStateOptions: !0
  };
}
const Ct = (e, n) => {
  n?.plugins && Q.getState().setRegisteredPlugins(n.plugins);
  const [l, s] = Oe(e);
  Object.keys(l).forEach((d) => {
    let t = s[d] || {};
    const a = {
      ...t
    };
    n?.formElements && (a.formElements = {
      ...n.formElements,
      ...t.formElements || {}
    }), a.validation = {
      onBlur: "error",
      ...n?.validation,
      ...t.validation || {}
    }, n?.validation?.key && !t.validation?.key && (a.validation.key = `${n.validation.key}.${d}`);
    const S = q(d), E = S ? {
      ...S,
      ...a,
      formElements: {
        ...S.formElements,
        ...a.formElements
      },
      validation: {
        ...S.validation,
        ...a.validation
      }
    } : a;
    be(d, E);
  }), Object.keys(l).forEach((d) => {
    ie(d, l[d]);
  });
  const g = (d, t) => {
    const [a] = ee(t?.componentId ?? se()), S = Me({
      stateKey: d,
      options: t,
      initialOptionsPart: s
    }), E = F(S);
    E.current = S;
    const V = x(d, []) || l[d], U = yt(
      V,
      {
        stateKey: d,
        syncUpdate: t?.syncUpdate,
        componentId: a,
        localStorage: t?.localStorage,
        middleware: t?.middleware,
        reactiveType: t?.reactiveType,
        reactiveDeps: t?.reactiveDeps,
        defaultState: t?.defaultState,
        dependencies: t?.dependencies,
        serverState: t?.serverState
      }
    );
    return z(() => {
      t && Q.getState().setPluginOptionsForState(d, t);
    }, [d, t]), z(() => (Q.getState().stateHandlers.set(d, U), () => {
      Q.getState().stateHandlers.delete(d);
    }), [d, U]), U;
  };
  function i(d, t) {
    if (Me({ stateKey: d, options: t, initialOptionsPart: s }), t.localStorage && at(d, t), t.formElements) {
      const S = Q.getState().registeredPlugins.map((E) => t.formElements.hasOwnProperty(E.name) ? {
        ...E,
        formWrapper: t.formElements[E.name]
      } : E);
      Q.getState().setRegisteredPlugins(S);
    }
    K(d);
  }
  function h(d) {
    Object.keys(l).forEach((a) => {
      i(a, d);
    });
  }
  return {
    useCogsState: g,
    setCogsOptionsByKey: i,
    setCogsOptions: h
  };
}, ot = (e, n, l, s, g) => {
  l?.log && console.log(
    "saving to localstorage",
    n,
    l.localStorage?.key,
    s
  );
  const i = G(l?.localStorage?.key) ? l.localStorage?.key(e) : l?.localStorage?.key;
  if (i && s) {
    const h = `${s}-${n}-${i}`;
    let d;
    try {
      d = ge(h)?.lastSyncedWithServer;
    } catch {
    }
    const t = A(n, []), a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: d,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, S = Le.serialize(a);
    window.localStorage.setItem(
      h,
      JSON.stringify(S.json)
    );
  }
}, ge = (e) => {
  if (!e) return null;
  try {
    const n = window.localStorage.getItem(e);
    return n ? JSON.parse(n) : null;
  } catch (n) {
    return console.error("Error loading from localStorage:", n), null;
  }
}, at = (e, n) => {
  const l = x(e, []), { sessionId: s } = Pe(), g = G(n?.localStorage?.key) ? n.localStorage.key(l) : n?.localStorage?.key;
  if (g && s) {
    const i = ge(
      `${s}-${e}-${g}`
    );
    if (i && i.lastUpdated > (i.lastSyncedWithServer || 0))
      return K(e), !0;
  }
  return !1;
}, K = (e) => {
  const n = A(e, []);
  if (!n) return;
  const l = /* @__PURE__ */ new Set();
  n?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || l.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    l.forEach((s) => s());
  });
};
function ue(e, n, l, s) {
  const g = A(e, n);
  if (J(e, n, {
    ...g,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(l)) {
    const i = A(e, n);
    i?.arrayKeys && i.arrayKeys.forEach((h, d) => {
      const t = [...n, h], a = l[d];
      a !== void 0 && ue(
        e,
        t,
        a,
        s
      );
    });
  } else l && typeof l == "object" && l.constructor === Object && Object.keys(l).forEach((i) => {
    const h = [...n, i], d = l[i];
    ue(e, h, d, s);
  });
}
let de = [], Ae = !1;
function st() {
  Ae || (Ae = !0, console.log("Scheduling flush"), queueMicrotask(() => {
    console.log("Actually flushing"), gt();
  }));
}
function it(e, n) {
  e?.signals?.length && e.signals.forEach(({ parentId: l, position: s, effect: g }) => {
    const i = document.querySelector(`[data-parent-id="${l}"]`);
    if (!i) return;
    const h = Array.from(i.childNodes);
    if (!h[s]) return;
    let d = n;
    if (g && n !== null)
      try {
        d = new Function("state", `return (${g})(state)`)(
          n
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    d !== null && typeof d == "object" && (d = JSON.stringify(d)), h[s].textContent = String(d ?? "");
  });
}
function ct(e, n, l) {
  const s = A(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const g = /* @__PURE__ */ new Set();
  if (l.type === "update") {
    let i = [...n];
    for (; ; ) {
      const h = A(e, i);
      if (h?.pathComponents && h.pathComponents.forEach((d) => {
        const t = s.components?.get(d);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || g.add(t));
      }), i.length === 0) break;
      i.pop();
    }
    l.newValue && typeof l.newValue == "object" && !je(l.newValue) && Ne(l.newValue, l.oldValue).forEach((d) => {
      const t = d.split("."), a = [...n, ...t], S = A(e, a);
      S?.pathComponents && S.pathComponents.forEach((E) => {
        const V = s.components?.get(E);
        V && ((Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"]).includes("none") || g.add(V));
      });
    });
  } else if (l.type === "insert" || l.type === "cut" || l.type === "insert_many") {
    let h = [...l.type === "insert" ? n : n.slice(0, -1)];
    for (; ; ) {
      const d = A(e, h);
      if (d?.pathComponents && d.pathComponents.forEach((t) => {
        const a = s.components?.get(t);
        a && g.add(a);
      }), h.length === 0) break;
      h.pop();
    }
  }
  return g;
}
function lt(e, n, l) {
  const s = T.getState().getShadowValue(e, n), g = G(l) ? l(s) : l;
  if (ae(s, g))
    return null;
  qe(e, n, g), fe(e, n, { bubble: !0 });
  const i = A(e, n);
  return {
    type: "update",
    oldValue: s,
    newValue: g,
    shadowMeta: i
  };
}
function ut(e, n, l) {
  Ce(e, n, l), fe(e, n, { bubble: !0 });
  const s = A(e, n);
  return {
    type: "insert_many",
    count: l.length,
    shadowMeta: s,
    path: n
  };
}
function dt(e, n, l, s, g) {
  let i;
  if (G(l)) {
    const { value: a } = X(e, n);
    i = l({ state: a });
  } else
    i = l;
  const h = He(
    e,
    n,
    i,
    s,
    g
  );
  fe(e, n, { bubble: !0 });
  const d = A(e, n);
  let t;
  return d?.arrayKeys && s !== void 0 && s > 0 && (t = d.arrayKeys[s - 1]), {
    type: "insert",
    newValue: i,
    shadowMeta: d,
    path: n,
    itemId: h,
    insertAfterId: t
  };
}
function ft(e, n) {
  const l = n.slice(0, -1), s = x(e, n);
  return Ge(e, n), fe(e, l, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: l };
}
function gt() {
  const e = /* @__PURE__ */ new Set(), n = [], l = [];
  for (const s of de) {
    if (s.status && s.updateType) {
      l.push(s);
      continue;
    }
    const g = s, i = g.type === "cut" ? null : g.newValue;
    g.shadowMeta?.signals?.length > 0 && n.push({ shadowMeta: g.shadowMeta, displayValue: i }), ct(
      g.stateKey,
      g.path,
      g
    ).forEach((d) => {
      e.add(d);
    });
  }
  l.length > 0 && Ze(l), n.forEach(({ shadowMeta: s, displayValue: g }) => {
    it(s, g);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), de = [], Ae = !1;
}
function St(e, n, l) {
  return (g, i, h) => {
    s(e, i, g, h);
  };
  function s(g, i, h, d) {
    let t;
    switch (d.updateType) {
      case "update":
        t = lt(g, i, h);
        break;
      case "insert":
        t = dt(
          g,
          i,
          h,
          d.index,
          d.itemId
        );
        break;
      case "insert_many":
        t = ut(g, i, h);
        break;
      case "cut":
        t = ft(g, i);
        break;
    }
    if (t === null)
      return;
    t.stateKey = g, t.path = i, de.push(t), st();
    const a = {
      timeStamp: Date.now(),
      stateKey: g,
      path: i,
      updateType: d.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: d.metaData
    };
    de.push(a), t.newValue !== void 0 && ot(
      t.newValue,
      g,
      l.current,
      n
    ), l.current?.middleware && l.current.middleware({ update: a }), ze(a, d.validationTrigger || "programmatic"), nt(a);
  }
}
function yt(e, {
  stateKey: n,
  localStorage: l,
  formElements: s,
  reactiveDeps: g,
  reactiveType: i,
  componentId: h,
  defaultState: d,
  dependencies: t,
  serverState: a
} = {}) {
  const [S, E] = ee({}), { sessionId: V } = Pe();
  let U = !n;
  const [w] = ee(n ?? se()), W = F(h ?? se()), R = F(
    null
  );
  R.current = q(w) ?? null;
  const y = pe(
    (o) => {
      const u = o ? { ...q(w), ...o } : q(w), f = u?.defaultState || d || e;
      if (u?.serverState?.status === "success" && u?.serverState?.data !== void 0)
        return {
          value: u.serverState.data,
          source: "server",
          timestamp: u.serverState.timestamp || Date.now()
        };
      if (u?.localStorage?.key && V) {
        const v = G(u.localStorage.key) ? u.localStorage.key(f) : u.localStorage.key, p = ge(
          `${V}-${w}-${v}`
        );
        if (p && p.lastUpdated > (u?.serverState?.timestamp || 0))
          return {
            value: p.state,
            source: "localStorage",
            timestamp: p.lastUpdated
          };
      }
      return {
        value: f || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, d, e, V]
  );
  z(() => {
    a && a.status === "success" && a.data !== void 0 && $e(w, a);
  }, [a, w]), z(() => T.getState().subscribeToPath(w, (c) => {
    if (c?.type === "SERVER_STATE_UPDATE") {
      const u = c.serverState;
      if (u?.status !== "success" || u.data === void 0)
        return;
      ve(w, { serverState: u });
      const f = typeof u.merge == "object" ? u.merge : u.merge === !0 ? { strategy: "append", key: "id" } : null, m = x(w, []), v = u.data;
      if (f && f.strategy === "append" && "key" in f && Array.isArray(m) && Array.isArray(v)) {
        const p = f.key;
        if (!p) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const M = new Set(
          m.map((D) => D[p])
        ), I = v.filter(
          (D) => !M.has(D[p])
        );
        I.length > 0 && Ce(w, [], I);
        const C = x(w, []);
        ue(
          w,
          [],
          C,
          u.timestamp || Date.now()
        );
      } else
        ie(w, v), ue(
          w,
          [],
          v,
          u.timestamp || Date.now()
        );
      K(w);
    }
  }), [w]), z(() => {
    const o = T.getState().getShadowMetadata(w, []);
    if (o && o.stateSource)
      return;
    const c = q(w), u = {
      localStorageEnabled: !!c?.localStorage?.key
    };
    if (J(w, [], {
      ...o,
      features: u
    }), c?.defaultState !== void 0 || d !== void 0) {
      const p = c?.defaultState || d;
      c?.defaultState || ve(w, {
        defaultState: p
      });
    }
    const { value: f, source: m, timestamp: v } = y();
    ie(w, f), J(w, [], {
      stateSource: m,
      lastServerSync: m === "server" ? v : void 0,
      isDirty: m === "server" ? !1 : void 0,
      baseServerState: m === "server" ? f : void 0
    }), m === "server" && a && $e(w, a), K(w);
  }, [w, ...t || []]), le(() => {
    U && ve(w, {
      formElements: s,
      defaultState: d,
      localStorage: l,
      middleware: R.current?.middleware
    });
    const o = `${w}////${W.current}`, c = A(w, []), u = c?.components || /* @__PURE__ */ new Map();
    return u.set(o, {
      forceUpdate: () => E({}),
      reactiveType: i ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: g || void 0,
      deps: g ? g(x(w, [])) : [],
      prevDeps: g ? g(x(w, [])) : []
    }), J(w, [], {
      ...c,
      components: u
    }), E({}), () => {
      const f = A(w, []), m = f?.components?.get(o);
      m?.paths && m.paths.forEach((v) => {
        const M = v.split(".").slice(1), I = T.getState().getShadowMetadata(w, M);
        I?.pathComponents && I.pathComponents.size === 0 && (delete I.pathComponents, T.getState().setShadowMetadata(w, M, I));
      }), f?.components && J(w, [], f);
    };
  }, []);
  const te = St(
    w,
    V,
    R
  );
  return T.getState().initialStateGlobal[w] || ke(w, e), Te(() => De(
    w,
    te,
    W.current,
    V
  ), [w, V]);
}
const mt = (e, n, l) => {
  let s = A(e, n)?.arrayKeys || [];
  const g = l?.transforms;
  if (!g || g.length === 0)
    return s;
  for (const i of g)
    if (i.type === "filter") {
      const h = [];
      s.forEach((d, t) => {
        const a = x(e, [...n, d]);
        i.fn(a, t) && h.push(d);
      }), s = h;
    } else i.type === "sort" && s.sort((h, d) => {
      const t = x(e, [...n, h]), a = x(e, [...n, d]);
      return i.fn(t, a);
    });
  return s;
}, we = (e, n, l) => {
  const s = `${e}////${n}`, i = A(e, [])?.components?.get(s);
  !i || i.reactiveType === "none" || !(Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType]).includes("component") || Je(e, l, s);
}, oe = (e, n, l) => {
  const s = A(e, []), g = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((h, d) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), g.add(d));
  }), A(e, [
    ...n,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    s?.components?.get(h)?.forceUpdate();
  });
  const i = A(e, n);
  for (let h of i?.arrayKeys || []) {
    const d = h + ".selected", t = A(e, d.split(".").slice(1));
    h == l && t?.pathComponents?.forEach((a) => {
      s?.components?.get(a)?.forceUpdate();
    });
  }
};
function X(e, n, l) {
  const s = A(e, n), g = n.length > 0 ? n.join(".") : "root", i = l?.arrayViews?.[g];
  if (Array.isArray(i) && i.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const h = x(e, n, i);
  return {
    shadowMeta: s,
    value: h,
    arrayKeys: s?.arrayKeys
  };
}
function De(e, n, l, s) {
  const g = /* @__PURE__ */ new Map();
  function i({
    path: t = [],
    meta: a,
    componentId: S
  }) {
    const E = a ? JSON.stringify(a.arrayViews || a.transforms) : "", V = t.join(".") + ":" + S + ":" + E;
    if (g.has(V))
      return g.get(V);
    const U = [e, ...t].join("."), w = {
      get(R, y) {
        if (typeof y != "string")
          return Reflect.get(R, y);
        if (t.length === 0 && y in h)
          return h[y];
        if (typeof y == "string" && !y.startsWith("$")) {
          const r = [...t, y];
          return i({
            path: r,
            componentId: S,
            meta: a
          });
        }
        if (y === "$_rebuildStateShape")
          return i;
        if (y === "$sync" && t.length === 0)
          return async function() {
            const r = T.getState().getInitialOptions(e), o = r?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const c = T.getState().getShadowValue(e, []), u = r?.validation?.key;
            try {
              const f = await o.action(c);
              if (f && !f.success && f.errors, f?.success) {
                const m = T.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...m,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: c
                  // Update base server state
                }), o.onSuccess && o.onSuccess(f.data);
              } else !f?.success && o.onError && o.onError(f.error);
              return f;
            } catch (f) {
              return o.onError && o.onError(f), { success: !1, error: f };
            }
          };
        if (y === "$_status" || y === "$getStatus") {
          const r = () => {
            const { shadowMeta: o, value: c } = X(e, t, a);
            return console.log("getStatusFunc", t, o, c), o?.isDirty === !0 ? "dirty" : o?.stateSource === "server" || o?.isDirty === !1 ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" || c !== void 0 ? "fresh" : "unknown";
          };
          return y === "$_status" ? r() : r;
        }
        if (y === "$removeStorage")
          return () => {
            const r = T.getState().initialStateGlobal[e], o = q(e), c = G(o?.localStorage?.key) ? o.localStorage.key(r) : o?.localStorage?.key, u = `${s}-${e}-${c}`;
            u && localStorage.removeItem(u);
          };
        if (y === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = X(e, t, a);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((o) => o.severity === "error").map((o) => o.message) : [];
          };
        if (y === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            we(e, S, [
              ...t,
              "getSelected"
            ]);
            const o = T.getState().selectedIndicesMap.get(r);
            if (!o)
              return;
            const c = t.join("."), u = a?.arrayViews?.[c], f = o.split(".").pop();
            if (!(u && !u.includes(f) || x(
              e,
              o.split(".").slice(1)
            ) === void 0))
              return i({
                path: o.split(".").slice(1),
                componentId: S,
                meta: a
              });
          };
        if (y === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const o = T.getState().selectedIndicesMap.get(r);
            if (!o)
              return -1;
            const { keys: c } = L(e, t, a);
            if (!c)
              return -1;
            const u = o.split(".").pop();
            return c.indexOf(u);
          };
        if (y === "$clearSelected")
          return oe(e, t), () => {
            Qe({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (y === "$useVirtualView")
          return (r) => {
            const {
              itemHeight: o = 50,
              overscan: c = 6,
              stickToBottom: u = !1,
              scrollStickTolerance: f = 75
            } = r, m = F(null), [v, p] = ee({
              startIndex: 0,
              endIndex: 10
            }), [M, I] = ee({}), C = F(!0);
            z(() => {
              const k = setInterval(() => {
                I({});
              }, 1e3);
              return () => clearInterval(k);
            }, []);
            const D = F({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), O = F(
              /* @__PURE__ */ new Map()
            ), { keys: b } = L(e, t, a);
            z(() => {
              const k = [e, ...t].join("."), $ = T.getState().subscribeToPath(k, (j) => {
                j.type !== "GET_SELECTED" && j.type;
              });
              return () => {
                $();
              };
            }, [S, e, t.join(".")]), le(() => {
              if (u && b.length > 0 && m.current && !D.current.isUserScrolling && C.current) {
                const k = m.current, $ = () => {
                  if (k.clientHeight > 0) {
                    const j = Math.ceil(
                      k.clientHeight / o
                    ), B = b.length - 1, _ = Math.max(
                      0,
                      B - j - c
                    );
                    p({ startIndex: _, endIndex: B }), requestAnimationFrame(() => {
                      Z("instant"), C.current = !1;
                    });
                  } else
                    requestAnimationFrame($);
                };
                $();
              }
            }, [b.length, u, o, c]);
            const P = F(v);
            le(() => {
              P.current = v;
            }, [v]);
            const N = F(b);
            le(() => {
              N.current = b;
            }, [b]);
            const ce = pe(() => {
              const k = m.current;
              if (!k) return;
              const $ = k.scrollTop, { scrollHeight: j, clientHeight: B } = k, _ = D.current, re = j - ($ + B), Se = _.isNearBottom;
              _.isNearBottom = re <= f, $ < _.lastScrollTop ? (_.scrollUpCount++, _.scrollUpCount > 3 && Se && (_.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : _.isNearBottom && (_.isUserScrolling = !1, _.scrollUpCount = 0), _.lastScrollTop = $;
              let Y = 0;
              for (let H = 0; H < b.length; H++) {
                const ye = b[H], me = O.current.get(ye);
                if (me && me.offset + me.height > $) {
                  Y = H;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                O.current,
                Y,
                v
              ), Y !== v.startIndex && v.startIndex != 0) {
                const H = Math.ceil(B / o);
                p({
                  startIndex: Math.max(0, Y - c),
                  endIndex: Math.min(
                    b.length - 1,
                    Y + H + c
                  )
                });
              }
            }, [
              b.length,
              v.startIndex,
              o,
              c,
              f
            ]);
            z(() => {
              const k = m.current;
              if (k)
                return k.addEventListener("scroll", ce, {
                  passive: !0
                }), () => {
                  k.removeEventListener("scroll", ce);
                };
            }, [ce, u]);
            const Z = pe(
              (k = "smooth") => {
                const $ = m.current;
                if (!$) return;
                D.current.isUserScrolling = !1, D.current.isNearBottom = !0, D.current.scrollUpCount = 0;
                const j = () => {
                  const B = (_ = 0) => {
                    if (_ > 5) return;
                    const re = $.scrollHeight, Se = $.scrollTop, Y = $.clientHeight;
                    Se + Y >= re - 1 || ($.scrollTo({
                      top: re,
                      behavior: k
                    }), setTimeout(() => {
                      const H = $.scrollHeight, ye = $.scrollTop;
                      (H !== re || ye + Y < H - 1) && B(_ + 1);
                    }, 50));
                  };
                  B();
                };
                "requestIdleCallback" in window ? requestIdleCallback(j, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(j);
                });
              },
              []
            );
            return z(() => {
              if (!u || !m.current) return;
              const k = m.current, $ = D.current;
              let j;
              const B = () => {
                clearTimeout(j), j = setTimeout(() => {
                  !$.isUserScrolling && $.isNearBottom && Z(
                    C.current ? "instant" : "smooth"
                  );
                }, 100);
              }, _ = new MutationObserver(() => {
                $.isUserScrolling || B();
              });
              return _.observe(k, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), C.current ? setTimeout(() => {
                Z("instant");
              }, 0) : B(), () => {
                clearTimeout(j), _.disconnect();
              };
            }, [u, b.length, Z]), {
              virtualState: Te(() => {
                const k = Array.isArray(b) ? b.slice(v.startIndex, v.endIndex + 1) : [], $ = t.length > 0 ? t.join(".") : "root";
                return i({
                  path: t,
                  componentId: S,
                  meta: {
                    ...a,
                    arrayViews: { [$]: k },
                    serverStateIsUpStream: !0
                  }
                });
              }, [v.startIndex, v.endIndex, b, a]),
              virtualizerProps: {
                outer: {
                  ref: m,
                  style: {
                    overflowY: "auto",
                    height: "100%",
                    position: "relative"
                  }
                },
                inner: {
                  style: {
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${O.current.get(b[v.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: Z,
              scrollToIndex: (k, $ = "smooth") => {
                if (m.current && b[k]) {
                  const j = O.current.get(b[k])?.offset || 0;
                  m.current.scrollTo({ top: j, behavior: $ });
                }
              }
            };
          };
        if (y === "$stateMap")
          return (r) => {
            const { value: o, keys: c } = L(
              e,
              t,
              a
            );
            if (we(e, S, t), !c || !Array.isArray(o))
              return [];
            const u = i({
              path: t,
              componentId: S,
              meta: a
            });
            return o.map((f, m) => {
              const v = c[m];
              if (!v) return;
              const p = [...t, v], M = i({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: S,
                meta: a
              });
              return r(M, m, u);
            });
          };
        if (y === "$stateFilter")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", { keys: c, value: u } = L(
              e,
              t,
              a
            );
            if (!Array.isArray(u))
              throw new Error("stateFilter can only be used on arrays");
            const f = [];
            return u.forEach((m, v) => {
              if (r(m, v)) {
                const p = c[v];
                p && f.push(p);
              }
            }), i({
              path: t,
              componentId: S,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [o]: f
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "filter", fn: r, path: t }
                ]
              }
            });
          };
        if (y === "$stateSort")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", { value: c, keys: u } = L(
              e,
              t,
              a
            );
            if (!Array.isArray(c) || !u)
              throw new Error("No array keys found for sorting");
            const f = c.map((v, p) => ({
              item: v,
              key: u[p]
            }));
            f.sort((v, p) => r(v.item, p.item));
            const m = f.map((v) => v.key);
            return i({
              path: t,
              componentId: S,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [o]: m
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (y === "$stream")
          return function(r = {}) {
            const {
              bufferSize: o = 100,
              flushInterval: c = 100,
              bufferStrategy: u = "accumulate",
              store: f,
              onFlush: m
            } = r;
            let v = [], p = !1, M = null;
            const I = (P) => {
              if (!p) {
                if (u === "sliding" && v.length >= o)
                  v.shift();
                else if (u === "dropping" && v.length >= o)
                  return;
                v.push(P), v.length >= o && C();
              }
            }, C = () => {
              if (v.length === 0) return;
              const P = [...v];
              if (v = [], f) {
                const N = f(P);
                N !== void 0 && (Array.isArray(N) ? N : [N]).forEach((Z) => {
                  n(Z, t, {
                    updateType: "insert"
                  });
                });
              } else
                P.forEach((N) => {
                  n(N, t, {
                    updateType: "insert"
                  });
                });
              m?.(P);
            };
            c > 0 && (M = setInterval(C, c));
            const D = se(), O = A(e, t) || {}, b = O.streams || /* @__PURE__ */ new Map();
            return b.set(D, { buffer: v, flushTimer: M }), J(e, t, {
              ...O,
              streams: b
            }), {
              write: (P) => I(P),
              writeMany: (P) => P.forEach(I),
              flush: () => C(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, v.length > 0 && C();
              },
              close: () => {
                C(), M && clearInterval(M);
                const P = T.getState().getShadowMetadata(e, t);
                P?.streams && P.streams.delete(D);
              }
            };
          };
        if (y === "$stateList")
          return (r) => /* @__PURE__ */ ne(() => {
            const c = F(/* @__PURE__ */ new Map()), [u, f] = ee({}), m = t.length > 0 ? t.join(".") : "root", v = mt(e, t, a), p = Te(() => ({
              ...a,
              arrayViews: {
                ...a?.arrayViews || {},
                [m]: v
              }
            }), [a, m, v]), { value: M } = L(
              e,
              t,
              p
            );
            if (z(() => {
              const D = T.getState().subscribeToPath(U, (O) => {
                if (O.type === "GET_SELECTED")
                  return;
                const P = T.getState().getShadowMetadata(e, t)?.transformCaches;
                if (P)
                  for (const N of P.keys())
                    N.startsWith(S) && P.delete(N);
                (O.type === "INSERT" || O.type === "INSERT_MANY" || O.type === "REMOVE" || O.type === "CLEAR_SELECTION" || O.type === "SERVER_STATE_UPDATE" && !a?.serverStateIsUpStream) && f({});
              });
              return () => {
                D();
              };
            }, [S, U]), !Array.isArray(M))
              return null;
            const I = i({
              path: t,
              componentId: S,
              meta: p
              // Use updated meta here
            }), C = M.map((D, O) => {
              const b = v[O];
              if (!b)
                return null;
              let P = c.current.get(b);
              P || (P = se(), c.current.set(b, P));
              const N = [...t, b];
              return Ee(Be, {
                key: b,
                stateKey: e,
                itemComponentId: P,
                itemPath: N,
                localIndex: O,
                arraySetter: I,
                rebuildStateShape: i,
                renderFn: r
              });
            });
            return /* @__PURE__ */ ne(Ue, { children: C });
          }, {});
        if (y === "$stateFlattenOn")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", c = a?.arrayViews?.[o], u = T.getState().getShadowValue(e, t, c);
            return Array.isArray(u) ? i({
              path: [...t, "[*]", r],
              componentId: S,
              meta: a
            }) : [];
          };
        if (y === "$index")
          return (r) => {
            const o = t.length > 0 ? t.join(".") : "root", c = a?.arrayViews?.[o];
            if (c) {
              const m = c[r];
              return m ? i({
                path: [...t, m],
                componentId: S,
                meta: a
              }) : void 0;
            }
            const u = A(e, t);
            if (!u?.arrayKeys) return;
            const f = u.arrayKeys[r];
            if (f)
              return i({
                path: [...t, f],
                componentId: S,
                meta: a
              });
          };
        if (y === "$last")
          return () => {
            const { keys: r } = L(e, t, a);
            if (!r || r.length === 0)
              return;
            const o = r[r.length - 1];
            if (!o)
              return;
            const c = [...t, o];
            return i({
              path: c,
              componentId: S,
              meta: a
            });
          };
        if (y === "$insert")
          return (r, o) => {
            n(r, t, {
              updateType: "insert",
              index: o
            });
          };
        if (y === "$insertMany")
          return (r) => {
            n(r, t, {
              updateType: "insert_many"
            });
          };
        if (y === "$uniqueInsert")
          return (r, o, c) => {
            const { value: u } = X(
              e,
              t,
              a
            ), f = G(r) ? r(u) : r;
            let m = null;
            if (!u.some((p) => {
              const M = o ? o.every(
                (I) => ae(p[I], f[I])
              ) : ae(p, f);
              return M && (m = p), M;
            }))
              n(f, t, { updateType: "insert" });
            else if (c && m) {
              const p = c(m), M = u.map(
                (I) => ae(I, m) ? p : I
              );
              n(M, t, {
                updateType: "update"
              });
            }
          };
        if (y === "$cut")
          return (r, o) => {
            const c = A(e, t);
            if (console.log("shadowMeta ->>>>>>>>>>>>>>>>", c), !c?.arrayKeys || c.arrayKeys.length === 0)
              return;
            const u = r === -1 ? c.arrayKeys.length - 1 : r !== void 0 ? r : c.arrayKeys.length - 1;
            console.log("indexToCut ->>>>>>>>>>>>>>>>", u);
            const f = c.arrayKeys[u];
            f && (console.log("idToCut ->>>>>>>>>>>>>>>>", f), n(null, [...t, f], {
              updateType: "cut"
            }));
          };
        if (y === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: o } = L(e, t, a);
            if (!o || o.length === 0)
              return;
            const c = T.getState().selectedIndicesMap.get(r);
            if (!c)
              return;
            const u = c.split(".").pop();
            if (!o.includes(u))
              return;
            const f = c.split(".").slice(1);
            T.getState().clearSelectedIndex({ arrayKey: r });
            const m = f.slice(0, -1);
            oe(e, m), n(null, f, {
              updateType: "cut"
            });
          };
        if (y === "$cutByValue")
          return (r) => {
            const {
              isArray: o,
              value: c,
              keys: u
            } = L(e, t, a);
            if (!o) return;
            const f = he(c, u, (m) => m === r);
            f && n(null, [...t, f.key], {
              updateType: "cut"
            });
          };
        if (y === "$toggleByValue")
          return (r) => {
            const {
              isArray: o,
              value: c,
              keys: u
            } = L(e, t, a);
            if (!o) return;
            const f = he(c, u, (m) => m === r);
            if (f) {
              const m = [...t, f.key];
              n(null, m, {
                updateType: "cut"
              });
            } else
              n(r, t, { updateType: "insert" });
          };
        if (y === "$findWith")
          return (r, o) => {
            const { isArray: c, value: u, keys: f } = L(e, t, a);
            if (!c)
              throw new Error("findWith can only be used on arrays");
            const m = he(
              u,
              f,
              (v) => v?.[r] === o
            );
            return m ? i({
              path: [...t, m.key],
              componentId: S,
              meta: a
            }) : null;
          };
        if (y === "$cutThis") {
          const { value: r } = X(e, t, a), o = t.slice(0, -1);
          return oe(e, o), () => {
            n(r, t, { updateType: "cut" });
          };
        }
        if (y === "$get")
          return () => {
            we(e, S, t);
            const { value: r } = X(e, t, a);
            return r;
          };
        if (y === "$$derive")
          return (r) => Ve({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: a
          });
        if (y === "$$get")
          return () => Ve({ _stateKey: e, _path: t, _meta: a });
        if (y === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return Xe(r);
        }
        if (y == "getLocalStorage")
          return (r) => ge(s + "-" + e + "-" + r);
        if (y === "$isSelected") {
          const r = t.slice(0, -1);
          if (A(e, r)?.arrayKeys) {
            const c = e + "." + r.join("."), u = T.getState().selectedIndicesMap.get(c), f = e + "." + t.join(".");
            return u === f;
          }
          return;
        }
        if (y === "$setSelected")
          return (r) => {
            const o = t.slice(0, -1), c = e + "." + o.join("."), u = e + "." + t.join(".");
            oe(e, o, void 0), T.getState().selectedIndicesMap.get(c), r && T.getState().setSelectedIndex(c, u);
          };
        if (y === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), o = e + "." + r.join("."), c = e + "." + t.join(".");
            T.getState().selectedIndicesMap.get(o) === c ? T.getState().clearSelectedIndex({ arrayKey: o }) : T.getState().setSelectedIndex(o, c), oe(e, r);
          };
        if (y === "$_componentId")
          return S;
        if (t.length == 0) {
          if (y === "$setOptions")
            return (r) => {
              Me({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (y === "$_applyUpdate")
            return (r, o, c = "update") => {
              n(r, o, { updateType: c });
            };
          if (y === "$_getEffectiveSetState")
            return n;
          if (y === "$getPluginMetaData")
            return (r) => et(e, t)?.get(r);
          if (y === "$addPluginMetaData")
            return console.log("$addPluginMetaDat"), (r, o) => tt(e, t, r, o);
          if (y === "$removePluginMetaData")
            return (r) => rt(e, t, r);
          if (y === "$addZodValidation")
            return (r, o) => {
              r.forEach((c) => {
                const u = T.getState().getShadowMetadata(e, c.path) || {};
                T.getState().setShadowMetadata(e, c.path, {
                  ...u,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: o || "client",
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
          if (y === "$clearZodValidation")
            return (r) => {
              if (!r)
                throw new Error("clearZodValidation requires a path");
              const o = A(e, r) || {};
              J(e, r, {
                ...o,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (y === "$applyOperation")
            return (r, o) => {
              console.log(
                "getGlobalStore",
                T.getState().getShadowMetadata(e, r.path)
              );
              let c;
              if (r.insertAfterId && r.updateType === "insert") {
                const u = A(e, r.path);
                if (u?.arrayKeys) {
                  const f = u.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  f !== -1 && (c = f + 1);
                }
              }
              n(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                index: c,
                // Pass the calculated index
                metaData: o
              });
            };
          if (y === "$applyJsonPatch")
            return (r) => {
              const o = T.getState(), c = o.getShadowMetadata(e, []);
              if (!c?.components) return;
              const u = (m) => !m || m === "/" ? [] : m.split("/").slice(1).map((v) => v.replace(/~1/g, "/").replace(/~0/g, "~")), f = /* @__PURE__ */ new Set();
              for (const m of r) {
                const v = u(m.path);
                switch (m.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = m;
                    o.updateShadowAtPath(e, v, p), o.markAsDirty(e, v, { bubble: !0 });
                    let M = [...v];
                    for (; ; ) {
                      const I = o.getShadowMetadata(
                        e,
                        M
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((C) => {
                        if (!f.has(C)) {
                          const D = c.components?.get(C);
                          D && (D.forceUpdate(), f.add(C));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = v.slice(0, -1);
                    o.removeShadowArrayElement(e, v), o.markAsDirty(e, p, { bubble: !0 });
                    let M = [...p];
                    for (; ; ) {
                      const I = o.getShadowMetadata(
                        e,
                        M
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((C) => {
                        if (!f.has(C)) {
                          const D = c.components?.get(C);
                          D && (D.forceUpdate(), f.add(C));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (y === "$getComponents")
            return () => A(e, [])?.components;
        }
        if (y === "$validationWrapper")
          return ({
            children: r,
            hideMessage: o
          }) => /* @__PURE__ */ ne(
            Fe,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: r
            }
          );
        if (y === "$_stateKey") return e;
        if (y === "$_path") return t;
        if (y === "$update")
          return (r) => (n(r, t, { updateType: "update" }), {
            synced: () => {
              const o = T.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...o,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const c = [e, ...t].join(".");
              Ke(c, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (y === "$toggle") {
          const { value: r } = X(
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
        if (y === "$isolate")
          return (r) => /* @__PURE__ */ ne(
            xe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              renderFn: r
            }
          );
        if (y === "$formElement")
          return (r, o) => /* @__PURE__ */ ne(
            Re,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: i,
              setState: n,
              formOpts: o,
              renderFn: r
            }
          );
        const te = [...t, y];
        return i({
          path: te,
          componentId: S,
          meta: a
        });
      }
    }, W = new Proxy({}, w);
    return g.set(V, W), W;
  }
  const h = {
    $revertToInitialState: (t) => {
      const a = T.getState().getShadowMetadata(e, []);
      let S;
      a?.stateSource === "server" && a.baseServerState ? S = a.baseServerState : S = T.getState().initialStateGlobal[e], Ye(e), ie(e, S), i({
        path: [],
        componentId: l
      });
      const E = q(e), V = G(E?.localStorage?.key) ? E?.localStorage?.key(S) : E?.localStorage?.key, U = `${s}-${e}-${V}`;
      return U && localStorage.removeItem(U), K(e), S;
    },
    $initializeAndMergeShadowState: (t) => {
      We(e, t), K(e);
    },
    $updateInitialState: (t) => {
      const a = De(
        e,
        n,
        l,
        s
      ), S = T.getState().initialStateGlobal[e], E = q(e), V = G(E?.localStorage?.key) ? E?.localStorage?.key(S) : E?.localStorage?.key, U = `${s}-${e}-${V}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), _e(() => {
        ke(e, t), ie(e, t);
        const w = T.getState().getShadowMetadata(e, []);
        w && w?.components?.forEach((W) => {
          W.forceUpdate();
        });
      }), {
        fetchId: (w) => a.$get()[w]
      };
    }
  };
  return i({
    componentId: l,
    path: []
  });
}
function Ve(e) {
  return Ee(ht, { proxy: e });
}
function ht({
  proxy: e
}) {
  const n = F(null), l = F(null), s = F(!1), g = `${e._stateKey}-${e._path.join(".")}`, i = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[i], d = x(e._stateKey, e._path, h);
  return z(() => {
    const t = n.current;
    if (!t || s.current) return;
    const a = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", g);
        return;
      }
      const S = t.parentElement, V = Array.from(S.childNodes).indexOf(t);
      let U = S.getAttribute("data-parent-id");
      U || (U = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", U)), l.current = `instance-${crypto.randomUUID()}`;
      const w = T.getState().getShadowMetadata(e._stateKey, e._path) || {}, W = w.signals || [];
      W.push({
        instanceId: l.current,
        parentId: U,
        position: V,
        effect: e._effect
      }), T.getState().setShadowMetadata(e._stateKey, e._path, {
        ...w,
        signals: W
      });
      let R = d;
      if (e._effect)
        try {
          R = new Function(
            "state",
            `return (${e._effect})(state)`
          )(d);
        } catch (te) {
          console.error("Error evaluating effect function:", te);
        }
      R !== null && typeof R == "object" && (R = JSON.stringify(R));
      const y = document.createTextNode(String(R ?? ""));
      t.replaceWith(y), s.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(a), l.current) {
        const S = T.getState().getShadowMetadata(e._stateKey, e._path) || {};
        S.signals && (S.signals = S.signals.filter(
          (E) => E.instanceId !== l.current
        ), T.getState().setShadowMetadata(e._stateKey, e._path, S));
      }
    };
  }, []), Ee("span", {
    ref: n,
    style: { display: "contents" },
    "data-signal-id": g
  });
}
export {
  Ve as $cogsSignal,
  kt as addStateOptions,
  Ct as createCogsState,
  yt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
