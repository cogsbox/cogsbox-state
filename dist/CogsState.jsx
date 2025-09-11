"use client";
import { jsx as ne, Fragment as De } from "react/jsx-runtime";
import { pluginStore as Q } from "./pluginStore.js";
import { useState as K, useRef as N, useCallback as be, useEffect as R, useLayoutEffect as ce, useMemo as Te, createElement as Ie, startTransition as _e } from "react";
import { transformStateFunc as Ue, isFunction as z, isDeepEqual as le, isArray as Oe, getDifferences as Fe } from "./utility.js";
import { ValidationWrapper as je, IsolatedComponentWrapper as Ne, FormElementWrapper as xe, MemoizedCogsItemWrapper as Re } from "./Components.jsx";
import Be from "superjson";
import { v4 as ae } from "uuid";
import { getGlobalStore as p } from "./store.js";
import { useCogsConfig as Pe } from "./CogsStateClient.jsx";
const {
  getInitialOptions: q,
  updateInitialStateGlobal: ke,
  getShadowMetadata: M,
  setShadowMetadata: J,
  getShadowValue: x,
  initializeShadowState: se,
  initializeAndMergeShadowState: Le,
  updateShadowAtPath: We,
  insertShadowArrayElement: qe,
  insertManyShadowArrayElements: Ve,
  removeShadowArrayElement: He,
  setInitialStateOptions: ue,
  setServerStateUpdate: Ae,
  markAsDirty: ge,
  addPathComponent: Ge,
  clearSelectedIndexesForState: ze,
  addStateLog: Je,
  setSyncInfo: At,
  clearSelectedIndex: Ye,
  getSyncInfo: Ze,
  notifyPathSubscribers: Qe,
  getPluginMetaDataMap: Xe,
  setPluginMetaData: Ke,
  removePluginMetaData: et
  // Note: The old functions are no longer imported under their original names
} = p.getState(), { notifyUpdate: tt } = Q.getState();
function W(e, o, u) {
  const a = M(e, o);
  if (!!!a?.arrayKeys)
    return { isArray: !1, value: p.getState().getShadowValue(e, o), keys: [] };
  const c = o.length > 0 ? o.join(".") : "root", v = u?.arrayViews?.[c] ?? a.arrayKeys;
  return Array.isArray(v) && v.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: p.getState().getShadowValue(e, o, v), keys: v ?? [] };
}
function ve(e, o, u) {
  for (let a = 0; a < e.length; a++)
    if (u(e[a], a)) {
      const S = o[a];
      if (S)
        return { key: S, index: a, value: e[a] };
    }
  return null;
}
function we(e, o) {
  const a = {
    ...q(e) || {},
    ...o
  };
  (a.validation?.zodSchemaV4 || a.validation?.zodSchemaV3) && !a.validation?.onBlur && (a.validation.onBlur = "error"), ue(e, a);
}
function Me({
  stateKey: e,
  options: o,
  initialOptionsPart: u
}) {
  const a = q(e) || {}, S = u[e] || {};
  console.log("initialOptions", a);
  let c = { ...S, ...a }, v = !1;
  if (o) {
    const d = (t, s) => {
      for (const m in s)
        s.hasOwnProperty(m) && (s[m] instanceof Object && !Array.isArray(s[m]) && t[m] instanceof Object ? le(t[m], s[m]) || (d(t[m], s[m]), v = !0) : t[m] !== s[m] && (t[m] = s[m], v = !0));
      return t;
    };
    c = d(c, o);
  }
  return c.validation && (o?.validation?.hasOwnProperty("onBlur") || a?.validation?.hasOwnProperty("onBlur") || S?.validation?.hasOwnProperty("onBlur") || (c.validation.onBlur = "error", v = !0)), v && ue(e, c), console.log("mergedOptions", c), c;
}
function $t(e, o) {
  return {
    ...o,
    initialState: e,
    _addStateOptions: !0
  };
}
const Pt = (e, o) => {
  o?.plugins && Q.getState().setRegisteredPlugins(o.plugins);
  const [u, a] = Ue(e);
  Object.keys(u).forEach((d) => {
    let t = a[d] || {};
    const s = {
      ...t
    };
    o?.formElements && (s.formElements = {
      ...o.formElements,
      ...t.formElements || {}
    }), s.validation = {
      onBlur: "error",
      ...o?.validation,
      ...t.validation || {}
    }, o?.validation?.key && !t.validation?.key && (s.validation.key = `${o.validation.key}.${d}`);
    const m = q(d), T = m ? {
      ...m,
      ...s,
      formElements: {
        ...m.formElements,
        ...s.formElements
      },
      validation: {
        ...m.validation,
        ...s.validation
      }
    } : s;
    ue(d, T);
  }), Object.keys(u).forEach((d) => {
    se(d, u[d]);
  });
  const S = (d, t) => {
    const [s] = K(t?.componentId ?? ae()), m = Me({
      stateKey: d,
      options: t,
      initialOptionsPart: a
    }), T = N(m);
    T.current = m;
    const I = x(d, []) || u[d], k = gt(I, {
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
    });
    return R(() => {
      t && Q.getState().setPluginOptionsForState(d, t);
    }, [d, t]), R(() => (console.log("adding handler 1", d, k), Q.getState().stateHandlers.set(d, k), () => {
      Q.getState().stateHandlers.delete(d);
    }), [d, k]), k;
  };
  function c(d, t) {
    Me({ stateKey: d, options: t, initialOptionsPart: a }), t.localStorage && nt(d, t), ee(d);
  }
  function v(d) {
    const s = Q.getState().registeredPlugins.map((T) => d.hasOwnProperty(T.name) ? {
      ...T,
      formWrapper: d[T.name]
    } : T);
    Q.getState().setRegisteredPlugins(s), Object.keys(u).forEach((T) => {
      const I = q(T) || {}, k = {
        ...I,
        formElements: {
          ...I.formElements || {},
          ...d
        }
      };
      ue(T, k);
    });
  }
  return {
    useCogsState: S,
    setCogsOptionsByKey: c,
    setCogsFormElements: v
  };
}, rt = (e, o, u, a, S) => {
  u?.log && console.log(
    "saving to localstorage",
    o,
    u.localStorage?.key,
    a
  );
  const c = z(u?.localStorage?.key) ? u.localStorage?.key(e) : u?.localStorage?.key;
  if (c && a) {
    const v = `${a}-${o}-${c}`;
    let d;
    try {
      d = Se(v)?.lastSyncedWithServer;
    } catch {
    }
    const t = M(o, []), s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: d,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, m = Be.serialize(s);
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
}, nt = (e, o) => {
  const u = x(e, []), { sessionId: a } = Pe(), S = z(o?.localStorage?.key) ? o.localStorage.key(u) : o?.localStorage?.key;
  if (S && a) {
    const c = Se(
      `${a}-${e}-${S}`
    );
    if (c && c.lastUpdated > (c.lastSyncedWithServer || 0))
      return ee(e), !0;
  }
  return !1;
}, ee = (e) => {
  const o = M(e, []);
  if (!o) return;
  const u = /* @__PURE__ */ new Set();
  o?.components?.forEach((a) => {
    (a ? Array.isArray(a.reactiveType) ? a.reactiveType : [a.reactiveType || "component"] : null)?.includes("none") || u.add(() => a.forceUpdate());
  }), queueMicrotask(() => {
    u.forEach((a) => a());
  });
};
function de(e, o, u, a) {
  const S = M(e, o);
  if (J(e, o, {
    ...S,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: a || Date.now()
  }), Array.isArray(u)) {
    const c = M(e, o);
    c?.arrayKeys && c.arrayKeys.forEach((v, d) => {
      const t = [...o, v], s = u[d];
      s !== void 0 && de(
        e,
        t,
        s,
        a
      );
    });
  } else u && typeof u == "object" && u.constructor === Object && Object.keys(u).forEach((c) => {
    const v = [...o, c], d = u[c];
    de(e, v, d, a);
  });
}
let fe = [], Ee = !1;
function ot() {
  Ee || (Ee = !0, console.log("Scheduling flush"), queueMicrotask(() => {
    console.log("Actually flushing"), dt();
  }));
}
function at(e, o) {
  e?.signals?.length && e.signals.forEach(({ parentId: u, position: a, effect: S }) => {
    const c = document.querySelector(`[data-parent-id="${u}"]`);
    if (!c) return;
    const v = Array.from(c.childNodes);
    if (!v[a]) return;
    let d = o;
    if (S && o !== null)
      try {
        d = new Function("state", `return (${S})(state)`)(
          o
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    d !== null && typeof d == "object" && (d = JSON.stringify(d)), v[a].textContent = String(d ?? "");
  });
}
function st(e, o, u) {
  const a = M(e, []);
  if (!a?.components)
    return /* @__PURE__ */ new Set();
  const S = /* @__PURE__ */ new Set();
  if (u.type === "update") {
    let c = [...o];
    for (; ; ) {
      const v = M(e, c);
      if (v?.pathComponents && v.pathComponents.forEach((d) => {
        const t = a.components?.get(d);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || S.add(t));
      }), c.length === 0) break;
      c.pop();
    }
    u.newValue && typeof u.newValue == "object" && !Oe(u.newValue) && Fe(u.newValue, u.oldValue).forEach((d) => {
      const t = d.split("."), s = [...o, ...t], m = M(e, s);
      m?.pathComponents && m.pathComponents.forEach((T) => {
        const I = a.components?.get(T);
        I && ((Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"]).includes("none") || S.add(I));
      });
    });
  } else if (u.type === "insert" || u.type === "cut" || u.type === "insert_many") {
    const c = u.type === "insert" ? o : o.slice(0, -1), v = M(e, c);
    v?.pathComponents && v.pathComponents.forEach((d) => {
      const t = a.components?.get(d);
      t && S.add(t);
    });
  }
  return S;
}
function it(e, o, u) {
  const a = p.getState().getShadowValue(e, o), S = z(u) ? u(a) : u;
  We(e, o, S), ge(e, o, { bubble: !0 });
  const c = M(e, o);
  return {
    type: "update",
    oldValue: a,
    newValue: S,
    shadowMeta: c
  };
}
function ct(e, o, u) {
  Ve(e, o, u), ge(e, o, { bubble: !0 });
  const a = M(e, o);
  return {
    type: "insert_many",
    count: u.length,
    shadowMeta: a,
    path: o
  };
}
function lt(e, o, u, a, S) {
  let c;
  if (z(u)) {
    const { value: s } = X(e, o);
    c = u({ state: s });
  } else
    c = u;
  const v = qe(
    e,
    o,
    c,
    a,
    S
  );
  ge(e, o, { bubble: !0 });
  const d = M(e, o);
  let t;
  return d?.arrayKeys && a !== void 0 && a > 0 && (t = d.arrayKeys[a - 1]), {
    type: "insert",
    newValue: c,
    shadowMeta: d,
    path: o,
    itemId: v,
    insertAfterId: t
  };
}
function ut(e, o) {
  const u = o.slice(0, -1), a = x(e, o);
  return He(e, o), ge(e, u, { bubble: !0 }), { type: "cut", oldValue: a, parentPath: u };
}
function dt() {
  const e = /* @__PURE__ */ new Set(), o = [], u = [];
  for (const a of fe) {
    if (a.status && a.updateType) {
      u.push(a);
      continue;
    }
    const S = a, c = S.type === "cut" ? null : S.newValue;
    S.shadowMeta?.signals?.length > 0 && o.push({ shadowMeta: S.shadowMeta, displayValue: c }), st(
      S.stateKey,
      S.path,
      S
    ).forEach((d) => {
      e.add(d);
    });
  }
  u.length > 0 && Je(u), o.forEach(({ shadowMeta: a, displayValue: S }) => {
    at(a, S);
  }), e.forEach((a) => {
    a.forceUpdate();
  }), fe = [], Ee = !1;
}
function ft(e, o, u) {
  return (S, c, v) => {
    a(e, c, S, v);
  };
  function a(S, c, v, d) {
    let t;
    switch (d.updateType) {
      case "update":
        t = it(S, c, v);
        break;
      case "insert":
        t = lt(
          S,
          c,
          v,
          d.index,
          d.itemId
        );
        break;
      case "insert_many":
        t = ct(S, c, v);
        break;
      case "cut":
        t = ut(S, c);
        break;
    }
    t.stateKey = S, t.path = c, fe.push(t), ot();
    const s = {
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
    fe.push(s), t.newValue !== void 0 && rt(
      t.newValue,
      S,
      u.current,
      o
    ), u.current?.middleware && u.current.middleware({ update: s }), tt(s);
  }
}
function gt(e, {
  stateKey: o,
  localStorage: u,
  formElements: a,
  reactiveDeps: S,
  reactiveType: c,
  componentId: v,
  defaultState: d,
  dependencies: t,
  serverState: s
} = {}) {
  const [m, T] = K({}), { sessionId: I } = Pe();
  let k = !o;
  const [w] = K(o ?? ae()), H = N(v ?? ae()), B = N(
    null
  );
  B.current = q(w) ?? null;
  const y = be(
    (n) => {
      const l = n ? { ...q(w), ...n } : q(w), f = l?.defaultState || d || e;
      if (l?.serverState?.status === "success" && l?.serverState?.data !== void 0)
        return {
          value: l.serverState.data,
          source: "server",
          timestamp: l.serverState.timestamp || Date.now()
        };
      if (l?.localStorage?.key && I) {
        const h = z(l.localStorage.key) ? l.localStorage.key(f) : l.localStorage.key, b = Se(
          `${I}-${w}-${h}`
        );
        if (b && b.lastUpdated > (l?.serverState?.timestamp || 0))
          return {
            value: b.state,
            source: "localStorage",
            timestamp: b.lastUpdated
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
    s && s.status === "success" && s.data !== void 0 && Ae(w, s);
  }, [s, w]), R(() => p.getState().subscribeToPath(w, (i) => {
    if (i?.type === "SERVER_STATE_UPDATE") {
      const l = i.serverState;
      if (l?.status !== "success" || l.data === void 0)
        return;
      we(w, { serverState: l });
      const f = typeof l.merge == "object" ? l.merge : l.merge === !0 ? { strategy: "append", key: "id" } : null, g = x(w, []), h = l.data;
      if (f && f.strategy === "append" && "key" in f && Array.isArray(g) && Array.isArray(h)) {
        const b = f.key;
        if (!b) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const E = new Set(
          g.map((_) => _[b])
        ), $ = h.filter(
          (_) => !E.has(_[b])
        );
        $.length > 0 && Ve(w, [], $);
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
    const n = p.getState().getShadowMetadata(w, []);
    if (n && n.stateSource)
      return;
    const i = q(w), l = {
      localStorageEnabled: !!i?.localStorage?.key
    };
    if (J(w, [], {
      ...n,
      features: l
    }), i?.defaultState !== void 0 || d !== void 0) {
      const b = i?.defaultState || d;
      i?.defaultState || we(w, {
        defaultState: b
      });
    }
    const { value: f, source: g, timestamp: h } = y();
    se(w, f), J(w, [], {
      stateSource: g,
      lastServerSync: g === "server" ? h : void 0,
      isDirty: g === "server" ? !1 : void 0,
      baseServerState: g === "server" ? f : void 0
    }), g === "server" && s && Ae(w, s), ee(w);
  }, [w, ...t || []]), ce(() => {
    k && we(w, {
      formElements: a,
      defaultState: d,
      localStorage: u,
      middleware: B.current?.middleware
    });
    const n = `${w}////${H.current}`, i = M(w, []), l = i?.components || /* @__PURE__ */ new Map();
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
        const E = h.split(".").slice(1), $ = p.getState().getShadowMetadata(w, E);
        $?.pathComponents && $.pathComponents.size === 0 && (delete $.pathComponents, p.getState().setShadowMetadata(w, E, $));
      }), f?.components && J(w, [], f);
    };
  }, []);
  const te = ft(
    w,
    I,
    B
  );
  return p.getState().initialStateGlobal[w] || ke(w, e), Te(() => Ce(
    w,
    te,
    H.current,
    I
  ), [w, I]);
}
const St = (e, o, u) => {
  let a = M(e, o)?.arrayKeys || [];
  const S = u?.transforms;
  if (!S || S.length === 0)
    return a;
  for (const c of S)
    if (c.type === "filter") {
      const v = [];
      a.forEach((d, t) => {
        const s = x(e, [...o, d]);
        c.fn(s, t) && v.push(d);
      }), a = v;
    } else c.type === "sort" && a.sort((v, d) => {
      const t = x(e, [...o, v]), s = x(e, [...o, d]);
      return c.fn(t, s);
    });
  return a;
}, pe = (e, o, u) => {
  const a = `${e}////${o}`, c = M(e, [])?.components?.get(a);
  !c || c.reactiveType === "none" || !(Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType]).includes("component") || Ge(e, u, a);
}, oe = (e, o, u) => {
  const a = M(e, []), S = /* @__PURE__ */ new Set();
  a?.components && a.components.forEach((v, d) => {
    (Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"]).includes("all") && (v.forceUpdate(), S.add(d));
  }), M(e, [
    ...o,
    "getSelected"
  ])?.pathComponents?.forEach((v) => {
    a?.components?.get(v)?.forceUpdate();
  });
  const c = M(e, o);
  for (let v of c?.arrayKeys || []) {
    const d = v + ".selected", t = M(e, d.split(".").slice(1));
    v == u && t?.pathComponents?.forEach((s) => {
      a?.components?.get(s)?.forceUpdate();
    });
  }
};
function X(e, o, u) {
  const a = M(e, o), S = o.length > 0 ? o.join(".") : "root", c = u?.arrayViews?.[S];
  if (Array.isArray(c) && c.length === 0)
    return {
      shadowMeta: a,
      value: [],
      arrayKeys: a?.arrayKeys
    };
  const v = x(e, o, c);
  return {
    shadowMeta: a,
    value: v,
    arrayKeys: a?.arrayKeys
  };
}
function Ce(e, o, u, a) {
  const S = /* @__PURE__ */ new Map();
  function c({
    path: t = [],
    meta: s,
    componentId: m
  }) {
    const T = s ? JSON.stringify(s.arrayViews || s.transforms) : "", I = t.join(".") + ":" + m + ":" + T;
    if (S.has(I))
      return S.get(I);
    const k = [e, ...t].join("."), w = {
      get(B, y) {
        if (t.length === 0 && y in v)
          return v[y];
        if (!y.startsWith("$")) {
          const r = [...t, y];
          return c({
            path: r,
            componentId: m,
            meta: s
          });
        }
        if (y === "$_rebuildStateShape")
          return c;
        if (y === "$sync" && t.length === 0)
          return async function() {
            const r = p.getState().getInitialOptions(e), n = r?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const i = p.getState().getShadowValue(e, []), l = r?.validation?.key;
            try {
              const f = await n.action(i);
              if (f && !f.success && f.errors, f?.success) {
                const g = p.getState().getShadowMetadata(e, []);
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
            const { shadowMeta: n, value: i } = X(e, t, s);
            return console.log("getStatusFunc", t, n, i), n?.isDirty === !0 ? "dirty" : n?.stateSource === "server" || n?.isDirty === !1 ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" || i !== void 0 ? "fresh" : "unknown";
          };
          return y === "$_status" ? r() : r;
        }
        if (y === "$removeStorage")
          return () => {
            const r = p.getState().initialStateGlobal[e], n = q(e), i = z(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, l = `${a}-${e}-${i}`;
            l && localStorage.removeItem(l);
          };
        if (y === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = X(e, t, s);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((n) => n.severity === "error").map((n) => n.message) : [];
          };
        if (y === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            pe(e, m, [
              ...t,
              "getSelected"
            ]);
            const n = p.getState().selectedIndicesMap.get(r);
            if (!n)
              return;
            const i = t.join("."), l = s?.arrayViews?.[i], f = n.split(".").pop();
            if (!(l && !l.includes(f) || x(
              e,
              n.split(".").slice(1)
            ) === void 0))
              return c({
                path: n.split(".").slice(1),
                componentId: m,
                meta: s
              });
          };
        if (y === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const n = p.getState().selectedIndicesMap.get(r);
            if (!n)
              return -1;
            const { keys: i } = W(e, t, s);
            if (!i)
              return -1;
            const l = n.split(".").pop();
            return i.indexOf(l);
          };
        if (y === "$clearSelected")
          return oe(e, t), () => {
            Ye({
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
            } = r, g = N(null), [h, b] = K({
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
            ), { keys: A } = W(e, t, s);
            R(() => {
              const C = [e, ...t].join("."), P = p.getState().subscribeToPath(C, (F) => {
                F.type !== "GET_SELECTED" && F.type;
              });
              return () => {
                P();
              };
            }, [m, e, t.join(".")]), ce(() => {
              if (l && A.length > 0 && g.current && !_.current.isUserScrolling && D.current) {
                const C = g.current, P = () => {
                  if (C.clientHeight > 0) {
                    const F = Math.ceil(
                      C.clientHeight / n
                    ), L = A.length - 1, U = Math.max(
                      0,
                      L - F - i
                    );
                    b({ startIndex: U, endIndex: L }), requestAnimationFrame(() => {
                      Z("instant"), D.current = !1;
                    });
                  } else
                    requestAnimationFrame(P);
                };
                P();
              }
            }, [A.length, l, n, i]);
            const V = N(h);
            ce(() => {
              V.current = h;
            }, [h]);
            const j = N(A);
            ce(() => {
              j.current = A;
            }, [A]);
            const ie = be(() => {
              const C = g.current;
              if (!C) return;
              const P = C.scrollTop, { scrollHeight: F, clientHeight: L } = C, U = _.current, re = F - (P + L), me = U.isNearBottom;
              U.isNearBottom = re <= f, P < U.lastScrollTop ? (U.scrollUpCount++, U.scrollUpCount > 3 && me && (U.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : U.isNearBottom && (U.isUserScrolling = !1, U.scrollUpCount = 0), U.lastScrollTop = P;
              let Y = 0;
              for (let G = 0; G < A.length; G++) {
                const ye = A[G], he = O.current.get(ye);
                if (he && he.offset + he.height > P) {
                  Y = G;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                O.current,
                Y,
                h
              ), Y !== h.startIndex && h.startIndex != 0) {
                const G = Math.ceil(L / n);
                b({
                  startIndex: Math.max(0, Y - i),
                  endIndex: Math.min(
                    A.length - 1,
                    Y + G + i
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
            const Z = be(
              (C = "smooth") => {
                const P = g.current;
                if (!P) return;
                _.current.isUserScrolling = !1, _.current.isNearBottom = !0, _.current.scrollUpCount = 0;
                const F = () => {
                  const L = (U = 0) => {
                    if (U > 5) return;
                    const re = P.scrollHeight, me = P.scrollTop, Y = P.clientHeight;
                    me + Y >= re - 1 || (P.scrollTo({
                      top: re,
                      behavior: C
                    }), setTimeout(() => {
                      const G = P.scrollHeight, ye = P.scrollTop;
                      (G !== re || ye + Y < G - 1) && L(U + 1);
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
              const C = g.current, P = _.current;
              let F;
              const L = () => {
                clearTimeout(F), F = setTimeout(() => {
                  !P.isUserScrolling && P.isNearBottom && Z(
                    D.current ? "instant" : "smooth"
                  );
                }, 100);
              }, U = new MutationObserver(() => {
                P.isUserScrolling || L();
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
                const C = Array.isArray(A) ? A.slice(h.startIndex, h.endIndex + 1) : [], P = t.length > 0 ? t.join(".") : "root";
                return c({
                  path: t,
                  componentId: m,
                  meta: {
                    ...s,
                    arrayViews: { [P]: C },
                    serverStateIsUpStream: !0
                  }
                });
              }, [h.startIndex, h.endIndex, A, s]),
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
              scrollToIndex: (C, P = "smooth") => {
                if (g.current && A[C]) {
                  const F = O.current.get(A[C])?.offset || 0;
                  g.current.scrollTo({ top: F, behavior: P });
                }
              }
            };
          };
        if (y === "$stateMap")
          return (r) => {
            const { value: n, keys: i } = W(
              e,
              t,
              s
            );
            if (pe(e, m, t), !i || !Array.isArray(n))
              return [];
            const l = c({
              path: t,
              componentId: m,
              meta: s
            });
            return n.map((f, g) => {
              const h = i[g];
              if (!h) return;
              const b = [...t, h], E = c({
                path: b,
                // This now correctly points to the item in the shadow store.
                componentId: m,
                meta: s
              });
              return r(E, g, l);
            });
          };
        if (y === "$stateFilter")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { keys: i, value: l } = W(
              e,
              t,
              s
            );
            if (!Array.isArray(l))
              throw new Error("stateFilter can only be used on arrays");
            const f = [];
            return l.forEach((g, h) => {
              if (r(g, h)) {
                const b = i[h];
                b && f.push(b);
              }
            }), c({
              path: t,
              componentId: m,
              meta: {
                ...s,
                arrayViews: {
                  ...s?.arrayViews || {},
                  [n]: f
                },
                transforms: [
                  ...s?.transforms || [],
                  { type: "filter", fn: r, path: t }
                ]
              }
            });
          };
        if (y === "$stateSort")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", { value: i, keys: l } = W(
              e,
              t,
              s
            );
            if (!Array.isArray(i) || !l)
              throw new Error("No array keys found for sorting");
            const f = i.map((h, b) => ({
              item: h,
              key: l[b]
            }));
            f.sort((h, b) => r(h.item, b.item));
            const g = f.map((h) => h.key);
            return c({
              path: t,
              componentId: m,
              meta: {
                ...s,
                arrayViews: {
                  ...s?.arrayViews || {},
                  [n]: g
                },
                transforms: [
                  ...s?.transforms || [],
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
            let h = [], b = !1, E = null;
            const $ = (V) => {
              if (!b) {
                if (l === "sliding" && h.length >= n)
                  h.shift();
                else if (l === "dropping" && h.length >= n)
                  return;
                h.push(V), h.length >= n && D();
              }
            }, D = () => {
              if (h.length === 0) return;
              const V = [...h];
              if (h = [], f) {
                const j = f(V);
                j !== void 0 && (Array.isArray(j) ? j : [j]).forEach((Z) => {
                  o(Z, t, {
                    updateType: "insert"
                  });
                });
              } else
                V.forEach((j) => {
                  o(j, t, {
                    updateType: "insert"
                  });
                });
              g?.(V);
            };
            i > 0 && (E = setInterval(D, i));
            const _ = ae(), O = M(e, t) || {}, A = O.streams || /* @__PURE__ */ new Map();
            return A.set(_, { buffer: h, flushTimer: E }), J(e, t, {
              ...O,
              streams: A
            }), {
              write: (V) => $(V),
              writeMany: (V) => V.forEach($),
              flush: () => D(),
              pause: () => {
                b = !0;
              },
              resume: () => {
                b = !1, h.length > 0 && D();
              },
              close: () => {
                D(), E && clearInterval(E);
                const V = p.getState().getShadowMetadata(e, t);
                V?.streams && V.streams.delete(_);
              }
            };
          };
        if (y === "$stateList")
          return (r) => /* @__PURE__ */ ne(() => {
            const i = N(/* @__PURE__ */ new Map()), [l, f] = K({}), g = t.length > 0 ? t.join(".") : "root", h = St(e, t, s), b = Te(() => ({
              ...s,
              arrayViews: {
                ...s?.arrayViews || {},
                [g]: h
              }
            }), [s, g, h]), { value: E } = W(
              e,
              t,
              b
            );
            if (R(() => {
              const _ = p.getState().subscribeToPath(k, (O) => {
                if (O.type === "GET_SELECTED")
                  return;
                const V = p.getState().getShadowMetadata(e, t)?.transformCaches;
                if (V)
                  for (const j of V.keys())
                    j.startsWith(m) && V.delete(j);
                (O.type === "INSERT" || O.type === "INSERT_MANY" || O.type === "REMOVE" || O.type === "CLEAR_SELECTION" || O.type === "SERVER_STATE_UPDATE" && !s?.serverStateIsUpStream) && f({});
              });
              return () => {
                _();
              };
            }, [m, k]), !Array.isArray(E))
              return null;
            const $ = c({
              path: t,
              componentId: m,
              meta: b
              // Use updated meta here
            }), D = E.map((_, O) => {
              const A = h[O];
              if (!A)
                return null;
              let V = i.current.get(A);
              V || (V = ae(), i.current.set(A, V));
              const j = [...t, A];
              return Ie(Re, {
                key: A,
                stateKey: e,
                itemComponentId: V,
                itemPath: j,
                localIndex: O,
                arraySetter: $,
                rebuildStateShape: c,
                renderFn: r
              });
            });
            return /* @__PURE__ */ ne(De, { children: D });
          }, {});
        if (y === "$stateFlattenOn")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = s?.arrayViews?.[n], l = p.getState().getShadowValue(e, t, i);
            return Array.isArray(l) ? c({
              path: [...t, "[*]", r],
              componentId: m,
              meta: s
            }) : [];
          };
        if (y === "$index")
          return (r) => {
            const n = t.length > 0 ? t.join(".") : "root", i = s?.arrayViews?.[n];
            if (i) {
              const g = i[r];
              return g ? c({
                path: [...t, g],
                componentId: m,
                meta: s
              }) : void 0;
            }
            const l = M(e, t);
            if (!l?.arrayKeys) return;
            const f = l.arrayKeys[r];
            if (f)
              return c({
                path: [...t, f],
                componentId: m,
                meta: s
              });
          };
        if (y === "$last")
          return () => {
            const { keys: r } = W(e, t, s);
            if (!r || r.length === 0)
              return;
            const n = r[r.length - 1];
            if (!n)
              return;
            const i = [...t, n];
            return c({
              path: i,
              componentId: m,
              meta: s
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
              s
            ), f = z(r) ? r(l) : r;
            let g = null;
            if (!l.some((b) => {
              const E = n ? n.every(
                ($) => le(b[$], f[$])
              ) : le(b, f);
              return E && (g = b), E;
            }))
              o(f, t, { updateType: "insert" });
            else if (i && g) {
              const b = i(g), E = l.map(
                ($) => le($, g) ? b : $
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
            const r = [e, ...t].join("."), { keys: n } = W(e, t, s);
            if (!n || n.length === 0)
              return;
            const i = p.getState().selectedIndicesMap.get(r);
            if (!i)
              return;
            const l = i.split(".").pop();
            if (!n.includes(l))
              return;
            const f = i.split(".").slice(1);
            p.getState().clearSelectedIndex({ arrayKey: r });
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
            } = W(e, t, s);
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
            } = W(e, t, s);
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
            const { isArray: i, value: l, keys: f } = W(e, t, s);
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
              meta: s
            }) : null;
          };
        if (y === "$cutThis") {
          const { value: r } = X(e, t, s), n = t.slice(0, -1);
          return oe(e, n), () => {
            o(r, t, { updateType: "cut" });
          };
        }
        if (y === "$get")
          return () => {
            pe(e, m, t);
            const { value: r } = X(e, t, s);
            return r;
          };
        if (y === "$$derive")
          return (r) => $e({
            _stateKey: e,
            _path: t,
            _effect: r.toString(),
            _meta: s
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
          return () => $e({ _stateKey: e, _path: t, _meta: s });
        if (y === "$lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return Ze(r);
        }
        if (y == "getLocalStorage")
          return (r) => Se(a + "-" + e + "-" + r);
        if (y === "$isSelected") {
          const r = t.slice(0, -1);
          if (M(e, r)?.arrayKeys) {
            const i = e + "." + r.join("."), l = p.getState().selectedIndicesMap.get(i), f = e + "." + t.join(".");
            return l === f;
          }
          return;
        }
        if (y === "$setSelected")
          return (r) => {
            const n = t.slice(0, -1), i = e + "." + n.join("."), l = e + "." + t.join(".");
            oe(e, n, void 0), p.getState().selectedIndicesMap.get(i), r && p.getState().setSelectedIndex(i, l);
          };
        if (y === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), n = e + "." + r.join("."), i = e + "." + t.join(".");
            p.getState().selectedIndicesMap.get(n) === i ? p.getState().clearSelectedIndex({ arrayKey: n }) : p.getState().setSelectedIndex(n, i), oe(e, r);
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
              const { subscribeToPath: r } = p.getState(), n = `${e}.__focusedElement`, [i, l] = K(
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
            return (r) => Xe(e, t)?.get(r);
          if (y === "$addPluginMetaData")
            return console.log("$addPluginMetaDat"), (r, n) => Ke(e, t, r, n);
          if (y === "$removePluginMetaData")
            return (r) => et(e, t, r);
          if (y === "$addZodValidation")
            return (r, n) => {
              r.forEach((i) => {
                const l = p.getState().getShadowMetadata(e, i.path) || {};
                p.getState().setShadowMetadata(e, i.path, {
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
              console.log("newErrors", l), p.getState().setShadowMetadata(e, r.path, {
                validation: {
                  status: l.length > 0 ? "INVALID" : "VALID",
                  errors: l,
                  lastValidated: Date.now()
                }
              }), console.log(
                "getGlobalStore",
                p.getState().getShadowMetadata(e, r.path)
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
              const n = p.getState(), i = n.getShadowMetadata(e, []);
              if (!i?.components) return;
              const l = (g) => !g || g === "/" ? [] : g.split("/").slice(1).map((h) => h.replace(/~1/g, "/").replace(/~0/g, "~")), f = /* @__PURE__ */ new Set();
              for (const g of r) {
                const h = l(g.path);
                switch (g.op) {
                  case "add":
                  case "replace": {
                    const { value: b } = g;
                    n.updateShadowAtPath(e, h, b), n.markAsDirty(e, h, { bubble: !0 });
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
                    const b = h.slice(0, -1);
                    n.removeShadowArrayElement(e, h), n.markAsDirty(e, b, { bubble: !0 });
                    let E = [...b];
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
            je,
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
              const n = p.getState().getShadowMetadata(e, t);
              J(e, t, {
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
        if (y === "$toggle") {
          const { value: r } = X(
            e,
            t,
            s
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
            Ne,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              renderFn: r
            }
          );
        if (y === "$formElement")
          return (r, n) => /* @__PURE__ */ ne(
            xe,
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
          meta: s
        });
      }
    }, H = new Proxy({}, w);
    return S.set(I, H), H;
  }
  const v = {
    $revertToInitialState: (t) => {
      const s = p.getState().getShadowMetadata(e, []);
      let m;
      s?.stateSource === "server" && s.baseServerState ? m = s.baseServerState : m = p.getState().initialStateGlobal[e], ze(e), se(e, m), c({
        path: [],
        componentId: u
      });
      const T = q(e), I = z(T?.localStorage?.key) ? T?.localStorage?.key(m) : T?.localStorage?.key, k = `${a}-${e}-${I}`;
      return k && localStorage.removeItem(k), ee(e), m;
    },
    $initializeAndMergeShadowState: (t) => {
      Le(e, t), ee(e);
    },
    $updateInitialState: (t) => {
      const s = Ce(
        e,
        o,
        u,
        a
      ), m = p.getState().initialStateGlobal[e], T = q(e), I = z(T?.localStorage?.key) ? T?.localStorage?.key(m) : T?.localStorage?.key, k = `${a}-${e}-${I}`;
      return localStorage.getItem(k) && localStorage.removeItem(k), _e(() => {
        ke(e, t), se(e, t);
        const w = p.getState().getShadowMetadata(e, []);
        w && w?.components?.forEach((H) => {
          H.forceUpdate();
        });
      }), {
        fetchId: (w) => s.$get()[w]
      };
    }
  };
  return c({
    componentId: u,
    path: []
  });
}
function $e(e) {
  return Ie(mt, { proxy: e });
}
function mt({
  proxy: e
}) {
  const o = N(null), u = N(null), a = N(!1), S = `${e._stateKey}-${e._path.join(".")}`, c = e._path.length > 0 ? e._path.join(".") : "root", v = e._meta?.arrayViews?.[c], d = x(e._stateKey, e._path, v);
  return R(() => {
    const t = o.current;
    if (!t || a.current) return;
    const s = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", S);
        return;
      }
      const m = t.parentElement, I = Array.from(m.childNodes).indexOf(t);
      let k = m.getAttribute("data-parent-id");
      k || (k = `parent-${crypto.randomUUID()}`, m.setAttribute("data-parent-id", k)), u.current = `instance-${crypto.randomUUID()}`;
      const w = p.getState().getShadowMetadata(e._stateKey, e._path) || {}, H = w.signals || [];
      H.push({
        instanceId: u.current,
        parentId: k,
        position: I,
        effect: e._effect
      }), p.getState().setShadowMetadata(e._stateKey, e._path, {
        ...w,
        signals: H
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
      t.replaceWith(y), a.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(s), u.current) {
        const m = p.getState().getShadowMetadata(e._stateKey, e._path) || {};
        m.signals && (m.signals = m.signals.filter(
          (T) => T.instanceId !== u.current
        ), p.getState().setShadowMetadata(e._stateKey, e._path, m));
      }
    };
  }, []), Ie("span", {
    ref: o,
    style: { display: "contents" },
    "data-signal-id": S
  });
}
export {
  $e as $cogsSignal,
  $t as addStateOptions,
  Pt as createCogsState,
  gt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
