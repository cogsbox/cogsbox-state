"use client";
import { jsx as ne, Fragment as _e } from "react/jsx-runtime";
import { pluginStore as Q } from "./pluginStore.js";
import { useState as K, useRef as N, useCallback as pe, useEffect as R, useLayoutEffect as ce, useMemo as Te, createElement as Ie, startTransition as Ue } from "react";
import { transformStateFunc as Oe, isFunction as G, isDeepEqual as le, isArray as Fe, getDifferences as je } from "./utility.js";
import { ValidationWrapper as Ne, IsolatedComponentWrapper as xe, FormElementWrapper as Re, MemoizedCogsItemWrapper as Be } from "./Components.jsx";
import Le from "superjson";
import { v4 as ae } from "uuid";
import { getGlobalStore as b, updateShadowTypeInfo as Ae } from "./store.js";
import { useCogsConfig as Pe } from "./CogsStateClient.jsx";
const {
  getInitialOptions: W,
  updateInitialStateGlobal: ke,
  getShadowMetadata: M,
  setShadowMetadata: J,
  getShadowValue: x,
  initializeShadowState: se,
  initializeAndMergeShadowState: ze,
  updateShadowAtPath: We,
  insertShadowArrayElement: qe,
  insertManyShadowArrayElements: Ce,
  removeShadowArrayElement: He,
  setInitialStateOptions: ue,
  setServerStateUpdate: $e,
  markAsDirty: ge,
  addPathComponent: Ge,
  clearSelectedIndexesForState: Je,
  addStateLog: Ye,
  setSyncInfo: $t,
  clearSelectedIndex: Ze,
  getSyncInfo: Qe,
  notifyPathSubscribers: Xe,
  getPluginMetaDataMap: Ke,
  setPluginMetaData: et,
  removePluginMetaData: tt
  // Note: The old functions are no longer imported under their original names
} = b.getState(), { notifyUpdate: rt } = Q.getState();
function z(e, o, u) {
  const s = M(e, o);
  if (!!!s?.arrayKeys)
    return { isArray: !1, value: b.getState().getShadowValue(e, o), keys: [] };
  const c = o.length > 0 ? o.join(".") : "root", v = u?.arrayViews?.[c] ?? s.arrayKeys;
  return Array.isArray(v) && v.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: b.getState().getShadowValue(e, o, v), keys: v ?? [] };
}
function ve(e, o, u) {
  for (let s = 0; s < e.length; s++)
    if (u(e[s], s)) {
      const S = o[s];
      if (S)
        return { key: S, index: s, value: e[s] };
    }
  return null;
}
function we(e, o) {
  const s = {
    ...W(e) || {},
    ...o
  };
  (s.validation?.zodSchemaV4 || s.validation?.zodSchemaV3) && !s.validation?.onBlur && (s.validation.onBlur = "error"), ue(e, s);
}
function Me({
  stateKey: e,
  options: o,
  initialOptionsPart: u
}) {
  const s = W(e) || {}, S = u[e] || {};
  let c = { ...S, ...s }, v = !1;
  if (o) {
    const d = (t, a) => {
      for (const m in a)
        a.hasOwnProperty(m) && (a[m] instanceof Object && !Array.isArray(a[m]) && t[m] instanceof Object ? le(t[m], a[m]) || (d(t[m], a[m]), v = !0) : t[m] !== a[m] && (t[m] = a[m], v = !0));
      return t;
    };
    c = d(c, o);
  }
  if (c.validation && (o?.validation?.hasOwnProperty("onBlur") || s?.validation?.hasOwnProperty("onBlur") || S?.validation?.hasOwnProperty("onBlur") || (c.validation.onBlur = "error", v = !0)), v) {
    ue(e, c);
    const d = s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3, t = c.validation?.zodSchemaV4 && !s?.validation?.zodSchemaV4, a = c.validation?.zodSchemaV3 && !s?.validation?.zodSchemaV3;
    console.log(
      "!bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      d,
      t,
      a
    ), !d && (t || a) && (t ? Ae(
      e,
      c.validation.zodSchemaV4,
      "zod4"
    ) : a && Ae(
      e,
      c.validation.zodSchemaV3,
      "zod3"
    ), ee(e));
  }
  return console.log("merged optipons", c), c;
}
function Vt(e, o) {
  return {
    ...o,
    initialState: e,
    _addStateOptions: !0
  };
}
const Pt = (e, o) => {
  o?.plugins && Q.getState().setRegisteredPlugins(o.plugins);
  const [u, s] = Oe(e);
  Object.keys(u).forEach((d) => {
    let t = s[d] || {};
    const a = {
      ...t
    };
    o?.formElements && (a.formElements = {
      ...o.formElements,
      ...t.formElements || {}
    }), a.validation = {
      onBlur: "error",
      ...o?.validation,
      ...t.validation || {}
    }, o?.validation?.key && !t.validation?.key && (a.validation.key = `${o.validation.key}.${d}`);
    const m = W(d), T = m ? {
      ...m,
      ...a,
      formElements: {
        ...m.formElements,
        ...a.formElements
      },
      validation: {
        ...m.validation,
        ...a.validation
      }
    } : a;
    ue(d, T);
  }), Object.keys(u).forEach((d) => {
    se(d, u[d]);
  });
  const S = (d, t) => {
    const [a] = K(t?.componentId ?? ae()), m = Me({
      stateKey: d,
      options: t,
      initialOptionsPart: s
    }), T = N(m);
    T.current = m;
    const I = x(d, []) || u[d], P = St(I, {
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
    });
    return R(() => {
      t && Q.getState().setPluginOptionsForState(d, t);
    }, [d, t]), R(() => (console.log("adding handler 1", d, P), Q.getState().stateHandlers.set(d, P), () => {
      Q.getState().stateHandlers.delete(d);
    }), [d, P]), P;
  };
  function c(d, t) {
    Me({ stateKey: d, options: t, initialOptionsPart: s }), t.localStorage && ot(d, t), ee(d);
  }
  function v(d) {
    const a = Q.getState().registeredPlugins.map((T) => d.hasOwnProperty(T.name) ? {
      ...T,
      formWrapper: d[T.name]
    } : T);
    Q.getState().setRegisteredPlugins(a), Object.keys(u).forEach((T) => {
      const I = W(T) || {}, P = {
        ...I,
        formElements: {
          ...I.formElements || {},
          ...d
        }
      };
      ue(T, P);
    });
  }
  return {
    useCogsState: S,
    setCogsOptionsByKey: c,
    setCogsFormElements: v
  };
}, nt = (e, o, u, s, S) => {
  u?.log && console.log(
    "saving to localstorage",
    o,
    u.localStorage?.key,
    s
  );
  const c = G(u?.localStorage?.key) ? u.localStorage?.key(e) : u?.localStorage?.key;
  if (c && s) {
    const v = `${s}-${o}-${c}`;
    let d;
    try {
      d = Se(v)?.lastSyncedWithServer;
    } catch {
    }
    const t = M(o, []), a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: d,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, m = Le.serialize(a);
    window.localStorage.setItem(
      v,
      JSON.stringify(m.json)
    );
  }
}, Se = (e) => {
  if (!e) return null;
  try {
    const o = window.localStorage.getItem(e);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, ot = (e, o) => {
  const u = x(e, []), { sessionId: s } = Pe(), S = G(o?.localStorage?.key) ? o.localStorage.key(u) : o?.localStorage?.key;
  if (S && s) {
    const c = Se(
      `${s}-${e}-${S}`
    );
    if (c && c.lastUpdated > (c.lastSyncedWithServer || 0))
      return ee(e), !0;
  }
  return !1;
}, ee = (e) => {
  const o = M(e, []);
  if (!o) return;
  const u = /* @__PURE__ */ new Set();
  o?.components?.forEach((s) => {
    (s ? Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"] : null)?.includes("none") || u.add(() => s.forceUpdate());
  }), queueMicrotask(() => {
    u.forEach((s) => s());
  });
};
function de(e, o, u, s) {
  const S = M(e, o);
  if (J(e, o, {
    ...S,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: s || Date.now()
  }), Array.isArray(u)) {
    const c = M(e, o);
    c?.arrayKeys && c.arrayKeys.forEach((v, d) => {
      const t = [...o, v], a = u[d];
      a !== void 0 && de(
        e,
        t,
        a,
        s
      );
    });
  } else u && typeof u == "object" && u.constructor === Object && Object.keys(u).forEach((c) => {
    const v = [...o, c], d = u[c];
    de(e, v, d, s);
  });
}
let fe = [], Ee = !1;
function at() {
  Ee || (Ee = !0, console.log("Scheduling flush"), queueMicrotask(() => {
    console.log("Actually flushing"), ft();
  }));
}
function st(e, o) {
  e?.signals?.length && e.signals.forEach(({ parentId: u, position: s, effect: S }) => {
    const c = document.querySelector(`[data-parent-id="${u}"]`);
    if (!c) return;
    const v = Array.from(c.childNodes);
    if (!v[s]) return;
    let d = o;
    if (S && o !== null)
      try {
        d = new Function("state", `return (${S})(state)`)(
          o
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    d !== null && typeof d == "object" && (d = JSON.stringify(d)), v[s].textContent = String(d ?? "");
  });
}
function it(e, o, u) {
  const s = M(e, []);
  if (!s?.components)
    return /* @__PURE__ */ new Set();
  const S = /* @__PURE__ */ new Set();
  if (u.type === "update") {
    let c = [...o];
    for (; ; ) {
      const v = M(e, c);
      if (v?.pathComponents && v.pathComponents.forEach((d) => {
        const t = s.components?.get(d);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || S.add(t));
      }), c.length === 0) break;
      c.pop();
    }
    u.newValue && typeof u.newValue == "object" && !Fe(u.newValue) && je(u.newValue, u.oldValue).forEach((d) => {
      const t = d.split("."), a = [...o, ...t], m = M(e, a);
      m?.pathComponents && m.pathComponents.forEach((T) => {
        const I = s.components?.get(T);
        I && ((Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"]).includes("none") || S.add(I));
      });
    });
  } else if (u.type === "insert" || u.type === "cut" || u.type === "insert_many") {
    const c = u.type === "insert" ? o : o.slice(0, -1), v = M(e, c);
    v?.pathComponents && v.pathComponents.forEach((d) => {
      const t = s.components?.get(d);
      t && S.add(t);
    });
  }
  return S;
}
function ct(e, o, u) {
  const s = b.getState().getShadowValue(e, o), S = G(u) ? u(s) : u;
  We(e, o, S), ge(e, o, { bubble: !0 });
  const c = M(e, o);
  return {
    type: "update",
    oldValue: s,
    newValue: S,
    shadowMeta: c
  };
}
function lt(e, o, u) {
  Ce(e, o, u), ge(e, o, { bubble: !0 });
  const s = M(e, o);
  return {
    type: "insert_many",
    count: u.length,
    shadowMeta: s,
    path: o
  };
}
function ut(e, o, u, s, S) {
  let c;
  if (G(u)) {
    const { value: a } = X(e, o);
    c = u({ state: a });
  } else
    c = u;
  const v = qe(
    e,
    o,
    c,
    s,
    S
  );
  ge(e, o, { bubble: !0 });
  const d = M(e, o);
  let t;
  return d?.arrayKeys && s !== void 0 && s > 0 && (t = d.arrayKeys[s - 1]), {
    type: "insert",
    newValue: c,
    shadowMeta: d,
    path: o,
    itemId: v,
    insertAfterId: t
  };
}
function dt(e, o) {
  const u = o.slice(0, -1), s = x(e, o);
  return He(e, o), ge(e, u, { bubble: !0 }), { type: "cut", oldValue: s, parentPath: u };
}
function ft() {
  const e = /* @__PURE__ */ new Set(), o = [], u = [];
  for (const s of fe) {
    if (s.status && s.updateType) {
      u.push(s);
      continue;
    }
    const S = s, c = S.type === "cut" ? null : S.newValue;
    S.shadowMeta?.signals?.length > 0 && o.push({ shadowMeta: S.shadowMeta, displayValue: c }), it(
      S.stateKey,
      S.path,
      S
    ).forEach((d) => {
      e.add(d);
    });
  }
  u.length > 0 && Ye(u), o.forEach(({ shadowMeta: s, displayValue: S }) => {
    st(s, S);
  }), e.forEach((s) => {
    s.forceUpdate();
  }), fe = [], Ee = !1;
}
function gt(e, o, u) {
  return (S, c, v) => {
    s(e, c, S, v);
  };
  function s(S, c, v, d) {
    let t;
    switch (d.updateType) {
      case "update":
        t = ct(S, c, v);
        break;
      case "insert":
        t = ut(
          S,
          c,
          v,
          d.index,
          d.itemId
        );
        break;
      case "insert_many":
        t = lt(S, c, v);
        break;
      case "cut":
        t = dt(S, c);
        break;
    }
    t.stateKey = S, t.path = c, fe.push(t), at();
    const a = {
      timeStamp: Date.now(),
      stateKey: S,
      path: c,
      updateType: d.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: d.metaData
    };
    fe.push(a), t.newValue !== void 0 && nt(
      t.newValue,
      S,
      u.current,
      o
    ), u.current?.middleware && u.current.middleware({ update: a }), rt(a);
  }
}
function St(e, {
  stateKey: o,
  localStorage: u,
  formElements: s,
  reactiveDeps: S,
  reactiveType: c,
  componentId: v,
  defaultState: d,
  dependencies: t,
  serverState: a
} = {}) {
  const [m, T] = K({}), { sessionId: I } = Pe();
  let P = !o;
  const [w] = K(o ?? ae()), q = N(v ?? ae()), B = N(
    null
  );
  B.current = W(w) ?? null;
  const y = pe(
    (n) => {
      const l = n ? { ...W(w), ...n } : W(w), f = l?.defaultState || d || e;
      if (l?.serverState?.status === "success" && l?.serverState?.data !== void 0)
        return {
          value: l.serverState.data,
          source: "server",
          timestamp: l.serverState.timestamp || Date.now()
        };
      if (l?.localStorage?.key && I) {
        const h = G(l.localStorage.key) ? l.localStorage.key(f) : l.localStorage.key, p = Se(
          `${I}-${w}-${h}`
        );
        if (p && p.lastUpdated > (l?.serverState?.timestamp || 0))
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
    [w, d, e, I]
  );
  R(() => {
    a && a.status === "success" && a.data !== void 0 && $e(w, a);
  }, [a, w]), R(() => b.getState().subscribeToPath(w, (i) => {
    if (i?.type === "SERVER_STATE_UPDATE") {
      const l = i.serverState;
      if (l?.status !== "success" || l.data === void 0)
        return;
      we(w, { serverState: l });
      const f = typeof l.merge == "object" ? l.merge : l.merge === !0 ? { strategy: "append", key: "id" } : null, g = x(w, []), h = l.data;
      if (f && f.strategy === "append" && "key" in f && Array.isArray(g) && Array.isArray(h)) {
        const p = f.key;
        if (!p) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const E = new Set(
          g.map((_) => _[p])
        ), $ = h.filter(
          (_) => !E.has(_[p])
        );
        $.length > 0 && Ce(w, [], $);
        const D = x(w, []);
        de(
          w,
          [],
          D,
          l.timestamp || Date.now()
        );
      } else
        se(w, h), de(
          w,
          [],
          h,
          l.timestamp || Date.now()
        );
      ee(w);
    }
  }), [w]), R(() => {
    const n = b.getState().getShadowMetadata(w, []);
    if (n && n.stateSource)
      return;
    const i = W(w), l = {
      localStorageEnabled: !!i?.localStorage?.key
    };
    if (J(w, [], {
      ...n,
      features: l
    }), i?.defaultState !== void 0 || d !== void 0) {
      const p = i?.defaultState || d;
      i?.defaultState || we(w, {
        defaultState: p
      });
    }
    const { value: f, source: g, timestamp: h } = y();
    se(w, f), J(w, [], {
      stateSource: g,
      lastServerSync: g === "server" ? h : void 0,
      isDirty: g === "server" ? !1 : void 0,
      baseServerState: g === "server" ? f : void 0
    }), g === "server" && a && $e(w, a), ee(w);
  }, [w, ...t || []]), ce(() => {
    P && we(w, {
      formElements: s,
      defaultState: d,
      localStorage: u,
      middleware: B.current?.middleware
    });
    const n = `${w}////${q.current}`, i = M(w, []), l = i?.components || /* @__PURE__ */ new Map();
    return l.set(n, {
      forceUpdate: () => T({}),
      reactiveType: c ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: S || void 0,
      deps: S ? S(x(w, [])) : [],
      prevDeps: S ? S(x(w, [])) : []
    }), J(w, [], {
      ...i,
      components: l
    }), T({}), () => {
      const f = M(w, []), g = f?.components?.get(n);
      g?.paths && g.paths.forEach((h) => {
        const E = h.split(".").slice(1), $ = b.getState().getShadowMetadata(w, E);
        $?.pathComponents && $.pathComponents.size === 0 && (delete $.pathComponents, b.getState().setShadowMetadata(w, E, $));
      }), f?.components && J(w, [], f);
    };
  }, []);
  const te = gt(
    w,
    I,
    B
  );
  return b.getState().initialStateGlobal[w] || ke(w, e), Te(() => De(
    w,
    te,
    q.current,
    I
  ), [w, I]);
}
const mt = (e, o, u) => {
  let s = M(e, o)?.arrayKeys || [];
  const S = u?.transforms;
  if (!S || S.length === 0)
    return s;
  for (const c of S)
    if (c.type === "filter") {
      const v = [];
      s.forEach((d, t) => {
        const a = x(e, [...o, d]);
        c.fn(a, t) && v.push(d);
      }), s = v;
    } else c.type === "sort" && s.sort((v, d) => {
      const t = x(e, [...o, v]), a = x(e, [...o, d]);
      return c.fn(t, a);
    });
  return s;
}, be = (e, o, u) => {
  const s = `${e}////${o}`, c = M(e, [])?.components?.get(s);
  !c || c.reactiveType === "none" || !(Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType]).includes("component") || Ge(e, u, s);
}, oe = (e, o, u) => {
  const s = M(e, []), S = /* @__PURE__ */ new Set();
  s?.components && s.components.forEach((v, d) => {
    (Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"]).includes("all") && (v.forceUpdate(), S.add(d));
  }), M(e, [
    ...o,
    "getSelected"
  ])?.pathComponents?.forEach((v) => {
    s?.components?.get(v)?.forceUpdate();
  });
  const c = M(e, o);
  for (let v of c?.arrayKeys || []) {
    const d = v + ".selected", t = M(e, d.split(".").slice(1));
    v == u && t?.pathComponents?.forEach((a) => {
      s?.components?.get(a)?.forceUpdate();
    });
  }
};
function X(e, o, u) {
  const s = M(e, o), S = o.length > 0 ? o.join(".") : "root", c = u?.arrayViews?.[S];
  if (Array.isArray(c) && c.length === 0)
    return {
      shadowMeta: s,
      value: [],
      arrayKeys: s?.arrayKeys
    };
  const v = x(e, o, c);
  return {
    shadowMeta: s,
    value: v,
    arrayKeys: s?.arrayKeys
  };
}
function De(e, o, u, s) {
  const S = /* @__PURE__ */ new Map();
  function c({
    path: t = [],
    meta: a,
    componentId: m
  }) {
    const T = a ? JSON.stringify(a.arrayViews || a.transforms) : "", I = t.join(".") + ":" + m + ":" + T;
    if (S.has(I))
      return S.get(I);
    const P = [e, ...t].join("."), w = {
      get(B, y) {
        if (t.length === 0 && y in v)
          return v[y];
        if (!y.startsWith("$")) {
          const r = [...t, y];
          return c({
            path: r,
            componentId: m,
            meta: a
          });
        }
        if (y === "$_rebuildStateShape")
          return c;
        if (y === "$sync" && t.length === 0)
          return async function() {
            const r = b.getState().getInitialOptions(e), n = r?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const i = b.getState().getShadowValue(e, []), l = r?.validation?.key;
            try {
              const f = await n.action(i);
              if (f && !f.success && f.errors, f?.success) {
                const g = b.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...g,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: i
                  // Update base server state
                }), n.onSuccess && n.onSuccess(f.data);
              } else !f?.success && n.onError && n.onError(f.error);
              return f;
            } catch (f) {
              return n.onError && n.onError(f), { success: !1, error: f };
            }
          };
        if (y === "$_status" || y === "$getStatus") {
          const r = () => {
            const { shadowMeta: n, value: i } = X(e, t, a);
            return console.log("getStatusFunc", t, n, i), n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || i !== void 0 ? "fresh" : "unknown";
          };
          return y === "$_status" ? r() : r;
        }
        if (y === "$removeStorage")
          return () => {
            const r = b.getState().initialStateGlobal[e], n = W(e), i = G(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, l = `${s}-${e}-${i}`;
            l && localStorage.removeItem(l);
          };
        if (y === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = X(e, t, a);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (y === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            be(e, m, [
              ...t,
              "getSelected"
            ]);
            const n = b.getState().selectedIndicesMap.get(r);
            if (!n)
              return;
            const i = t.join("."), l = a?.arrayViews?.[i], f = n.split(".").pop();
            if (!(l && !l.includes(f) || x(
              e,
              n.split(".").slice(1)
            ) === void 0))
              return c({
                path: n.split(".").slice(1),
                componentId: m,
                meta: a
              });
          };
        if (y === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const n = b.getState().selectedIndicesMap.get(r);
            if (!n)
              return -1;
            const { keys: i } = z(e, t, a);
            if (!i)
              return -1;
            const l = n.split(".").pop();
            return i.indexOf(l);
          };
        if (y === "$clearSelected")
          return oe(e, t), () => {
            Ze({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (y === "$useVirtualView")
          return (r) => {
            const {
              itemHeight: n = 50,
              overscan: i = 6,
              stickToBottom: l = !1,
              scrollStickTolerance: f = 75
            } = r, g = N(null), [h, p] = K({
              startIndex: 0,
              endIndex: 10
            }), [E, $] = K({}), D = N(!0);
            R(() => {
              const C = setInterval(() => {
                $({});
              }, 1e3);
              return () => clearInterval(C);
            }, []);
            const _ = N({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), O = N(
              /* @__PURE__ */ new Map()
            ), { keys: A } = z(e, t, a);
            R(() => {
              const C = [e, ...t].join("."), V = b.getState().subscribeToPath(C, (F) => {
                F.type !== "GET_SELECTED" && F.type;
              });
              return () => {
                V();
              };
            }, [m, e, t.join(".")]), ce(() => {
              if (l && A.length > 0 && g.current && !_.current.isUserScrolling && D.current) {
                const C = g.current, V = () => {
                  if (C.clientHeight > 0) {
                    const F = Math.ceil(
                      C.clientHeight / n
                    ), L = A.length - 1, U = Math.max(
                      0,
                      L - F - i
                    );
                    p({ startIndex: U, endIndex: L }), requestAnimationFrame(() => {
                      Z("instant"), D.current = !1;
                    });
                  } else
                    requestAnimationFrame(V);
                };
                V();
              }
            }, [A.length, l, n, i]);
            const k = N(h);
            ce(() => {
              k.current = h;
            }, [h]);
            const j = N(A);
            ce(() => {
              j.current = A;
            }, [A]);
            const ie = pe(() => {
              const C = g.current;
              if (!C) return;
              const V = C.scrollTop, { scrollHeight: F, clientHeight: L } = C, U = _.current, re = F - (V + L), me = U.isNearBottom;
              U.isNearBottom = re <= f, V < U.lastScrollTop ? (U.scrollUpCount++, U.scrollUpCount > 3 && me && (U.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : U.isNearBottom && (U.isUserScrolling = !1, U.scrollUpCount = 0), U.lastScrollTop = V;
              let Y = 0;
              for (let H = 0; H < A.length; H++) {
                const ye = A[H], he = O.current.get(ye);
                if (he && he.offset + he.height > V) {
                  Y = H;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                O.current,
                Y,
                h
              ), Y !== h.startIndex && h.startIndex != 0) {
                const H = Math.ceil(L / n);
                p({
                  startIndex: Math.max(0, Y - i),
                  endIndex: Math.min(
                    A.length - 1,
                    Y + H + i
                  )
                });
              }
            }, [
              A.length,
              h.startIndex,
              n,
              i,
              f
            ]);
            R(() => {
              const C = g.current;
              if (C)
                return C.addEventListener("scroll", ie, {
                  passive: !0
                }), () => {
                  C.removeEventListener("scroll", ie);
                };
            }, [ie, l]);
            const Z = pe(
              (C = "smooth") => {
                const V = g.current;
                if (!V) return;
                _.current.isUserScrolling = !1, _.current.isNearBottom = !0, _.current.scrollUpCount = 0;
                const F = () => {
                  const L = (U = 0) => {
                    if (U > 5) return;
                    const re = V.scrollHeight, me = V.scrollTop, Y = V.clientHeight;
                    me + Y >= re - 1 || (V.scrollTo({
                      top: re,
                      behavior: C
                    }), setTimeout(() => {
                      const H = V.scrollHeight, ye = V.scrollTop;
                      (H !== re || ye + Y < H - 1) && L(U + 1);
                    }, 50));
                  };
                  L();
                };
                "requestIdleCallback" in window ? requestIdleCallback(F, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(F);
                });
              },
              []
            );
            return R(() => {
              if (!l || !g.current) return;
              const C = g.current, V = _.current;
              let F;
              const L = () => {
                clearTimeout(F), F = setTimeout(() => {
                  !V.isUserScrolling && V.isNearBottom && Z(
                    D.current ? "instant" : "smooth"
                  );
                }, 100);
              }, U = new MutationObserver(() => {
                V.isUserScrolling || L();
              });
              return U.observe(C, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), D.current ? setTimeout(() => {
                Z("instant");
              }, 0) : L(), () => {
                clearTimeout(F), U.disconnect();
              };
            }, [l, A.length, Z]), {
              virtualState: Te(() => {
                const C = Array.isArray(A) ? A.slice(h.startIndex, h.endIndex + 1) : [], V = t.length > 0 ? t.join(".") : "root";
                return c({
                  path: t,
                  componentId: m,
                  meta: {
                    ...a,
                    arrayViews: { [V]: C },
                    serverStateIsUpStream: !0
                  }
                });
              }, [h.startIndex, h.endIndex, A, a]),
              virtualizerProps: {
                outer: {
                  ref: g,
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
                    transform: `translateY(${O.current.get(A[h.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: Z,
              scrollToIndex: (C, V = "smooth") => {
                if (g.current && A[C]) {
                  const F = O.current.get(A[C])?.offset || 0;
                  g.current.scrollTo({ top: F, behavior: V });
                }
              }
            };
          };
        if (y === "$stateMap")
          return (r) => {
            const { value: n, keys: i } = z(
              e,
              t,
              a
            );
            if (be(e, m, t), !i || !Array.isArray(n))
              return [];
            const l = c({
              path: t,
              componentId: m,
              meta: a
            });
            return n.map((f, g) => {
              const h = i[g];
              if (!h) return;
              const p = [...t, h], E = c({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: m,
                meta: a
              });
              return r(E, g, l);
            });
          };
        if (y === "$stateFilter")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { keys: i, value: l } = z(
              e,
              t,
              a
            );
            if (!Array.isArray(l))
              throw new Error("stateFilter can only be used on arrays");
            const f = [];
            return l.forEach((g, h) => {
              if (r(g, h)) {
                const p = i[h];
                p && f.push(p);
              }
            }), c({
              path: t,
              componentId: m,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [n]: f
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
            const n = t.length > 0 ? t.join(".") : "root", { value: i, keys: l } = z(
              e,
              t,
              a
            );
            if (!Array.isArray(i) || !l)
              throw new Error("No array keys found for sorting");
            const f = i.map((h, p) => ({
              item: h,
              key: l[p]
            }));
            f.sort((h, p) => r(h.item, p.item));
            const g = f.map((h) => h.key);
            return c({
              path: t,
              componentId: m,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [n]: g
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
              bufferSize: n = 100,
              flushInterval: i = 100,
              bufferStrategy: l = "accumulate",
              store: f,
              onFlush: g
            } = r;
            let h = [], p = !1, E = null;
            const $ = (k) => {
              if (!p) {
                if (l === "sliding" && h.length >= n)
                  h.shift();
                else if (l === "dropping" && h.length >= n)
                  return;
                h.push(k), h.length >= n && D();
              }
            }, D = () => {
              if (h.length === 0) return;
              const k = [...h];
              if (h = [], f) {
                const j = f(k);
                j !== void 0 && (Array.isArray(j) ? j : [j]).forEach((Z) => {
                  o(Z, t, {
                    updateType: "insert"
                  });
                });
              } else
                k.forEach((j) => {
                  o(j, t, {
                    updateType: "insert"
                  });
                });
              g?.(k);
            };
            i > 0 && (E = setInterval(D, i));
            const _ = ae(), O = M(e, t) || {}, A = O.streams || /* @__PURE__ */ new Map();
            return A.set(_, { buffer: h, flushTimer: E }), J(e, t, {
              ...O,
              streams: A
            }), {
              write: (k) => $(k),
              writeMany: (k) => k.forEach($),
              flush: () => D(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, h.length > 0 && D();
              },
              close: () => {
                D(), E && clearInterval(E);
                const k = b.getState().getShadowMetadata(e, t);
                k?.streams && k.streams.delete(_);
              }
            };
          };
        if (y === "$stateList")
          return (r) => /* @__PURE__ */ ne(() => {
            const i = N(/* @__PURE__ */ new Map()), [l, f] = K({}), g = t.length > 0 ? t.join(".") : "root", h = mt(e, t, a), p = Te(() => ({
              ...a,
              arrayViews: {
                ...a?.arrayViews || {},
                [g]: h
              }
            }), [a, g, h]), { value: E } = z(
              e,
              t,
              p
            );
            if (R(() => {
              const _ = b.getState().subscribeToPath(P, (O) => {
                if (O.type === "GET_SELECTED")
                  return;
                const k = b.getState().getShadowMetadata(e, t)?.transformCaches;
                if (k)
                  for (const j of k.keys())
                    j.startsWith(m) && k.delete(j);
                (O.type === "INSERT" || O.type === "INSERT_MANY" || O.type === "REMOVE" || O.type === "CLEAR_SELECTION" || O.type === "SERVER_STATE_UPDATE" && !a?.serverStateIsUpStream) && f({});
              });
              return () => {
                _();
              };
            }, [m, P]), !Array.isArray(E))
              return null;
            const $ = c({
              path: t,
              componentId: m,
              meta: p
              // Use updated meta here
            }), D = E.map((_, O) => {
              const A = h[O];
              if (!A)
                return null;
              let k = i.current.get(A);
              k || (k = ae(), i.current.set(A, k));
              const j = [...t, A];
              return Ie(Be, {
                key: A,
                stateKey: e,
                itemComponentId: k,
                itemPath: j,
                localIndex: O,
                arraySetter: $,
                rebuildStateShape: c,
                renderFn: r
              });
            });
            return /* @__PURE__ */ ne(_e, { children: D });
          }, {});
        if (y === "$stateFlattenOn")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = a?.arrayViews?.[n], l = b.getState().getShadowValue(e, t, i);
            return Array.isArray(l) ? c({
              path: [...t, "[*]", r],
              componentId: m,
              meta: a
            }) : [];
          };
        if (y === "$index")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = a?.arrayViews?.[n];
            if (i) {
              const g = i[r];
              return g ? c({
                path: [...t, g],
                componentId: m,
                meta: a
              }) : void 0;
            }
            const l = M(e, t);
            if (!l?.arrayKeys) return;
            const f = l.arrayKeys[r];
            if (f)
              return c({
                path: [...t, f],
                componentId: m,
                meta: a
              });
          };
        if (y === "$last")
          return () => {
            const { keys: r } = z(e, t, a);
            if (!r || r.length === 0)
              return;
            const n = r[r.length - 1];
            if (!n)
              return;
            const i = [...t, n];
            return c({
              path: i,
              componentId: m,
              meta: a
            });
          };
        if (y === "$insert")
          return (r, n) => {
            o(r, t, {
              updateType: "insert",
              index: n
            });
          };
        if (y === "$insertMany")
          return (r) => {
            o(r, t, {
              updateType: "insert_many"
            });
          };
        if (y === "$uniqueInsert")
          return (r, n, i) => {
            const { value: l } = X(
              e,
              t,
              a
            ), f = G(r) ? r(l) : r;
            let g = null;
            if (!l.some((p) => {
              const E = n ? n.every(
                ($) => le(p[$], f[$])
              ) : le(p, f);
              return E && (g = p), E;
            }))
              o(f, t, { updateType: "insert" });
            else if (i && g) {
              const p = i(g), E = l.map(
                ($) => le($, g) ? p : $
              );
              o(E, t, {
                updateType: "update"
              });
            }
          };
        if (y === "$cut")
          return (r, n) => {
            const i = M(e, t);
            if (!i?.arrayKeys || i.arrayKeys.length === 0)
              return;
            const l = r === -1 ? i.arrayKeys.length - 1 : r !== void 0 ? r : i.arrayKeys.length - 1, f = i.arrayKeys[l];
            f && o(null, [...t, f], {
              updateType: "cut"
            });
          };
        if (y === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: n } = z(e, t, a);
            if (!n || n.length === 0)
              return;
            const i = b.getState().selectedIndicesMap.get(r);
            if (!i)
              return;
            const l = i.split(".").pop();
            if (!n.includes(l))
              return;
            const f = i.split(".").slice(1);
            b.getState().clearSelectedIndex({ arrayKey: r });
            const g = f.slice(0, -1);
            oe(e, g), o(null, f, {
              updateType: "cut"
            });
          };
        if (y === "$cutByValue")
          return (r) => {
            const {
              isArray: n,
              value: i,
              keys: l
            } = z(e, t, a);
            if (!n) return;
            const f = ve(i, l, (g) => g === r);
            f && o(null, [...t, f.key], {
              updateType: "cut"
            });
          };
        if (y === "$toggleByValue")
          return (r) => {
            const {
              isArray: n,
              value: i,
              keys: l
            } = z(e, t, a);
            if (!n) return;
            const f = ve(i, l, (g) => g === r);
            if (f) {
              const g = [...t, f.key];
              o(null, g, {
                updateType: "cut"
              });
            } else
              o(r, t, { updateType: "insert" });
          };
        if (y === "$findWith")
          return (r, n) => {
            const { isArray: i, value: l, keys: f } = z(e, t, a);
            if (!i)
              throw new Error("findWith can only be used on arrays");
            const g = ve(
              l,
              f,
              (h) => h?.[r] === n
            );
            return g ? c({
              path: [...t, g.key],
              componentId: m,
              meta: a
            }) : null;
          };
        if (y === "$cutThis") {
          const { value: r } = X(e, t, a), n = t.slice(0, -1);
          return oe(e, n), () => {
            o(r, t, { updateType: "cut" });
          };
        }
        if (y === "$get")
          return () => {
            be(e, m, t);
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
        if (y === "$formInput") {
          const r = (n) => {
            const i = M(e, n);
            return i?.formRef?.current ? i.formRef.current : (console.warn(
              `Form element ref not found for stateKey "${e}" at path "${n.join(".")}"`
            ), null);
          };
          return {
            setDisabled: (n) => {
              const i = r(t);
              i && (i.disabled = n);
            },
            focus: () => {
              r(t)?.focus();
            },
            blur: () => {
              r(t)?.blur();
            },
            scrollIntoView: (n) => {
              r(t)?.scrollIntoView(
                n ?? { behavior: "smooth", block: "center" }
              );
            },
            click: () => {
              r(t)?.click();
            },
            selectText: () => {
              const n = r(t);
              n && typeof n.select == "function" && n.select();
            }
          };
        }
        if (y === "$$get")
          return () => Ve({ _stateKey: e, _path: t, _meta: a });
        if (y === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return Qe(r);
        }
        if (y == "getLocalStorage")
          return (r) => Se(s + "-" + e + "-" + r);
        if (y === "$isSelected") {
          const r = t.slice(0, -1);
          if (M(e, r)?.arrayKeys) {
            const i = e + "." + r.join("."), l = b.getState().selectedIndicesMap.get(i), f = e + "." + t.join(".");
            return l === f;
          }
          return;
        }
        if (y === "$setSelected")
          return (r) => {
            const n = t.slice(0, -1), i = e + "." + n.join("."), l = e + "." + t.join(".");
            oe(e, n, void 0), b.getState().selectedIndicesMap.get(i), r && b.getState().setSelectedIndex(i, l);
          };
        if (y === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), n = e + "." + r.join("."), i = e + "." + t.join(".");
            b.getState().selectedIndicesMap.get(n) === i ? b.getState().clearSelectedIndex({ arrayKey: n }) : b.getState().setSelectedIndex(n, i), oe(e, r);
          };
        if (y === "$_componentId")
          return m;
        if (t.length == 0) {
          if (y === "$setOptions")
            return (r) => {
              Me({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (y === "$useFocusedFormElement")
            return () => {
              const { subscribeToPath: r } = b.getState(), n = `${e}.__focusedElement`, [i, l] = K(
                // Lazily get the initial value from the root metadata.
                () => M(e, [])?.focusedElement || null
              );
              return R(() => r(
                n,
                l
              ), [e]), i;
            };
          if (y === "$_applyUpdate")
            return (r, n, i = "update") => {
              o(r, n, { updateType: i });
            };
          if (y === "$_getEffectiveSetState")
            return o;
          if (y === "$getPluginMetaData")
            return (r) => Ke(e, t)?.get(r);
          if (y === "$addPluginMetaData")
            return console.log("$addPluginMetaDat"), (r, n) => et(e, t, r, n);
          if (y === "$removePluginMetaData")
            return (r) => tt(e, t, r);
          if (y === "$addZodValidation")
            return (r, n) => {
              r.forEach((i) => {
                const l = b.getState().getShadowMetadata(e, i.path) || {};
                b.getState().setShadowMetadata(e, i.path, {
                  ...l,
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
          if (y === "$clearZodValidation")
            return (r) => {
              if (!r)
                throw new Error("clearZodValidation requires a path");
              const n = M(e, r) || {};
              J(e, r, {
                ...n,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (y === "$applyOperation")
            return (r, n) => {
              const i = r.validation || [];
              if (!r || !r.path) {
                console.error(
                  "Invalid operation received by $applyOperation:",
                  r
                );
                return;
              }
              const l = i.map((g) => ({
                source: "sync_engine",
                message: g.message,
                severity: "warning",
                code: g.code
              }));
              console.log("newErrors", l), b.getState().setShadowMetadata(e, r.path, {
                validation: {
                  status: l.length > 0 ? "INVALID" : "VALID",
                  errors: l,
                  lastValidated: Date.now()
                }
              }), console.log(
                "getGlobalStore",
                b.getState().getShadowMetadata(e, r.path)
              );
              let f;
              if (r.insertAfterId && r.updateType === "insert") {
                const g = M(e, r.path);
                if (g?.arrayKeys) {
                  const h = g.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  h !== -1 && (f = h + 1);
                }
              }
              o(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                index: f,
                // Pass the calculated index
                metaData: n
              });
            };
          if (y === "$applyJsonPatch")
            return (r) => {
              const n = b.getState(), i = n.getShadowMetadata(e, []);
              if (!i?.components) return;
              const l = (g) => !g || g === "/" ? [] : g.split("/").slice(1).map((h) => h.replace(/~1/g, "/").replace(/~0/g, "~")), f = /* @__PURE__ */ new Set();
              for (const g of r) {
                const h = l(g.path);
                switch (g.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = g;
                    n.updateShadowAtPath(e, h, p), n.markAsDirty(e, h, { bubble: !0 });
                    let E = [...h];
                    for (; ; ) {
                      const $ = n.getShadowMetadata(
                        e,
                        E
                      );
                      if ($?.pathComponents && $.pathComponents.forEach((D) => {
                        if (!f.has(D)) {
                          const _ = i.components?.get(D);
                          _ && (_.forceUpdate(), f.add(D));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = h.slice(0, -1);
                    n.removeShadowArrayElement(e, h), n.markAsDirty(e, p, { bubble: !0 });
                    let E = [...p];
                    for (; ; ) {
                      const $ = n.getShadowMetadata(
                        e,
                        E
                      );
                      if ($?.pathComponents && $.pathComponents.forEach((D) => {
                        if (!f.has(D)) {
                          const _ = i.components?.get(D);
                          _ && (_.forceUpdate(), f.add(D));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (y === "$getComponents")
            return () => M(e, [])?.components;
        }
        if (y === "$validationWrapper")
          return ({
            children: r,
            hideMessage: n
          }) => /* @__PURE__ */ ne(
            Ne,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: r
            }
          );
        if (y === "$_stateKey") return e;
        if (y === "$_path") return t;
        if (y === "$update")
          return (r) => (o(r, t, { updateType: "update" }), {
            synced: () => {
              const n = b.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...n,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const i = [e, ...t].join(".");
              Xe(i, {
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
            o(!r, t, {
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
              rebuildStateShape: c,
              renderFn: r
            }
          );
        if (y === "$formElement")
          return (r, n) => /* @__PURE__ */ ne(
            Re,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              setState: o,
              formOpts: n,
              renderFn: r
            }
          );
        const te = [...t, y];
        return c({
          path: te,
          componentId: m,
          meta: a
        });
      }
    }, q = new Proxy({}, w);
    return S.set(I, q), q;
  }
  const v = {
    $revertToInitialState: (t) => {
      const a = b.getState().getShadowMetadata(e, []);
      let m;
      a?.stateSource === "server" && a.baseServerState ? m = a.baseServerState : m = b.getState().initialStateGlobal[e], Je(e), se(e, m), c({
        path: [],
        componentId: u
      });
      const T = W(e), I = G(T?.localStorage?.key) ? T?.localStorage?.key(m) : T?.localStorage?.key, P = `${s}-${e}-${I}`;
      return P && localStorage.removeItem(P), ee(e), m;
    },
    $initializeAndMergeShadowState: (t) => {
      ze(e, t), ee(e);
    },
    $updateInitialState: (t) => {
      const a = De(
        e,
        o,
        u,
        s
      ), m = b.getState().initialStateGlobal[e], T = W(e), I = G(T?.localStorage?.key) ? T?.localStorage?.key(m) : T?.localStorage?.key, P = `${s}-${e}-${I}`;
      return localStorage.getItem(P) && localStorage.removeItem(P), Ue(() => {
        ke(e, t), se(e, t);
        const w = b.getState().getShadowMetadata(e, []);
        w && w?.components?.forEach((q) => {
          q.forceUpdate();
        });
      }), {
        fetchId: (w) => a.$get()[w]
      };
    }
  };
  return c({
    componentId: u,
    path: []
  });
}
function Ve(e) {
  return Ie(yt, { proxy: e });
}
function yt({
  proxy: e
}) {
  const o = N(null), u = N(null), s = N(!1), S = `${e._stateKey}-${e._path.join(".")}`, c = e._path.length > 0 ? e._path.join(".") : "root", v = e._meta?.arrayViews?.[c], d = x(e._stateKey, e._path, v);
  return R(() => {
    const t = o.current;
    if (!t || s.current) return;
    const a = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", S);
        return;
      }
      const m = t.parentElement, I = Array.from(m.childNodes).indexOf(t);
      let P = m.getAttribute("data-parent-id");
      P || (P = `parent-${crypto.randomUUID()}`, m.setAttribute("data-parent-id", P)), u.current = `instance-${crypto.randomUUID()}`;
      const w = b.getState().getShadowMetadata(e._stateKey, e._path) || {}, q = w.signals || [];
      q.push({
        instanceId: u.current,
        parentId: P,
        position: I,
        effect: e._effect
      }), b.getState().setShadowMetadata(e._stateKey, e._path, {
        ...w,
        signals: q
      });
      let B = d;
      if (e._effect)
        try {
          B = new Function(
            "state",
            `return (${e._effect})(state)`
          )(d);
        } catch (te) {
          console.error("Error evaluating effect function:", te);
        }
      B !== null && typeof B == "object" && (B = JSON.stringify(B));
      const y = document.createTextNode(String(B ?? ""));
      t.replaceWith(y), s.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(a), u.current) {
        const m = b.getState().getShadowMetadata(e._stateKey, e._path) || {};
        m.signals && (m.signals = m.signals.filter(
          (T) => T.instanceId !== u.current
        ), b.getState().setShadowMetadata(e._stateKey, e._path, m));
      }
    };
  }, []), Ie("span", {
    ref: o,
    style: { display: "contents" },
    "data-signal-id": S
  });
}
export {
  Ve as $cogsSignal,
  Vt as addStateOptions,
  Pt as createCogsState,
  St as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
