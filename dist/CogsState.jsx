"use client";
import { jsx as ne, Fragment as De } from "react/jsx-runtime";
import { pluginStore as ae } from "./pluginStore.js";
import { useState as X, useRef as x, useCallback as pe, useEffect as R, useLayoutEffect as le, useMemo as Te, createElement as be, startTransition as Ce } from "react";
import { transformStateFunc as Ue, isFunction as z, isDeepEqual as se } from "./utility.js";
import { ValidationWrapper as _e, IsolatedComponentWrapper as Oe, FormElementWrapper as Fe, MemoizedCogsItemWrapper as je } from "./Components.jsx";
import Ne from "superjson";
import { v4 as K } from "uuid";
import { getGlobalStore as p } from "./store.js";
import { useCogsConfig as ke } from "./CogsStateClient.jsx";
const {
  getInitialOptions: H,
  updateInitialStateGlobal: Ve,
  getShadowMetadata: E,
  setShadowMetadata: J,
  getShadowValue: j,
  initializeShadowState: ie,
  initializeAndMergeShadowState: xe,
  updateShadowAtPath: Re,
  insertShadowArrayElement: Le,
  insertManyShadowArrayElements: Be,
  removeShadowArrayElement: We,
  setInitialStateOptions: ue,
  setServerStateUpdate: Ee,
  markAsDirty: Ie,
  addPathComponent: qe,
  clearSelectedIndexesForState: He,
  addStateLog: Ge,
  setSyncInfo: $t,
  clearSelectedIndex: ze,
  getSyncInfo: Je,
  notifyPathSubscribers: Ye,
  getPluginMetaDataMap: Ze,
  setPluginMetaData: Qe,
  removePluginMetaData: Xe
  // Note: The old functions are no longer imported under their original names
} = p.getState();
function W(e, o, f) {
  const i = E(e, o);
  if (!!!i?.arrayKeys)
    return { isArray: !1, value: p.getState().getShadowValue(e, o), keys: [] };
  const c = o.length > 0 ? o.join(".") : "root", d = f?.arrayViews?.[c] ?? i.arrayKeys;
  return Array.isArray(d) && d.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: p.getState().getShadowValue(e, o, d), keys: d ?? [] };
}
function he(e, o, f) {
  for (let i = 0; i < e.length; i++)
    if (f(e[i], i)) {
      const S = o[i];
      if (S)
        return { key: S, index: i, value: e[i] };
    }
  return null;
}
function ve(e, o) {
  const f = H(e) || {};
  ue(e, {
    ...f,
    ...o
  });
}
function Me({
  stateKey: e,
  options: o,
  initialOptionsPart: f
}) {
  const i = H(e) || {};
  let c = { ...f[e] || {}, ...i }, d = !1;
  if (o) {
    const l = (t, a) => {
      for (const h in a)
        a.hasOwnProperty(h) && (a[h] instanceof Object && !Array.isArray(a[h]) && t[h] instanceof Object ? se(t[h], a[h]) || (l(t[h], a[h]), d = !0) : t[h] !== a[h] && (t[h] = a[h], d = !0));
      return t;
    };
    c = l(c, o);
  }
  return c.syncOptions && (!o || !o.hasOwnProperty("syncOptions")) && (d = !0), (c.validation && c?.validation?.zodSchemaV4 || c?.validation?.zodSchemaV3) && (o?.validation?.hasOwnProperty("onBlur") || i?.validation?.hasOwnProperty("onBlur") || (c.validation.onBlur = "error")), d && ue(e, c), c;
}
function bt(e, o) {
  return {
    ...o,
    initialState: e,
    _addStateOptions: !0
  };
}
const It = (e, o) => {
  o?.plugins && ae.getState().setRegisteredPlugins(o.plugins);
  const [f, i] = Ue(e);
  Object.keys(f).forEach((d) => {
    let l = i[d] || {};
    const t = {
      ...l
    };
    if (o?.formElements && (t.formElements = {
      ...o.formElements,
      ...l.formElements || {}
    }), o?.validation && (t.validation = {
      ...o.validation,
      ...l.validation || {}
    }, o.validation.key && !l.validation?.key && (t.validation.key = `${o.validation.key}.${d}`)), Object.keys(t).length > 0) {
      const a = H(d);
      a ? ue(d, {
        ...a,
        ...t
      }) : ue(d, t);
    }
  }), Object.keys(f).forEach((d) => {
    ie(d, f[d]);
  });
  const S = (d, l) => {
    const [t] = X(l?.componentId ?? K()), a = Me({
      stateKey: d,
      options: l,
      initialOptionsPart: i
    }), h = x(a);
    h.current = a;
    const A = j(d, []) || f[d], C = lt(A, {
      stateKey: d,
      syncUpdate: l?.syncUpdate,
      componentId: t,
      localStorage: l?.localStorage,
      middleware: l?.middleware,
      reactiveType: l?.reactiveType,
      reactiveDeps: l?.reactiveDeps,
      defaultState: l?.defaultState,
      dependencies: l?.dependencies,
      serverState: l?.serverState
    });
    return R(() => {
      l && ae.getState().setPluginOptionsForState(d, l);
    }, [d, l]), R(() => (console.log("adding handler 1", d, C), ae.getState().stateHandlers.set(d, C), () => {
      ae.getState().stateHandlers.delete(d);
    }), [d, C]), C;
  };
  function c(d, l) {
    Me({ stateKey: d, options: l, initialOptionsPart: i }), l.localStorage && et(d, l), ee(d);
  }
  return {
    useCogsState: S,
    setCogsOptions: c
  };
}, Ke = (e, o, f, i, S) => {
  f?.log && console.log(
    "saving to localstorage",
    o,
    f.localStorage?.key,
    i
  );
  const c = z(f?.localStorage?.key) ? f.localStorage?.key(e) : f?.localStorage?.key;
  if (c && i) {
    const d = `${i}-${o}-${c}`;
    let l;
    try {
      l = ge(d)?.lastSyncedWithServer;
    } catch {
    }
    const t = E(o, []), a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, h = Ne.serialize(a);
    window.localStorage.setItem(
      d,
      JSON.stringify(h.json)
    );
  }
}, ge = (e) => {
  if (!e) return null;
  try {
    const o = window.localStorage.getItem(e);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, et = (e, o) => {
  const f = j(e, []), { sessionId: i } = ke(), S = z(o?.localStorage?.key) ? o.localStorage.key(f) : o?.localStorage?.key;
  if (S && i) {
    const c = ge(
      `${i}-${e}-${S}`
    );
    if (c && c.lastUpdated > (c.lastSyncedWithServer || 0))
      return ee(e), !0;
  }
  return !1;
}, ee = (e) => {
  const o = E(e, []);
  if (!o) return;
  const f = /* @__PURE__ */ new Set();
  o?.components?.forEach((i) => {
    (i ? Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"] : null)?.includes("none") || f.add(() => i.forceUpdate());
  }), queueMicrotask(() => {
    f.forEach((i) => i());
  });
};
function de(e, o, f, i) {
  const S = E(e, o);
  if (J(e, o, {
    ...S,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: i || Date.now()
  }), Array.isArray(f)) {
    const c = E(e, o);
    c?.arrayKeys && c.arrayKeys.forEach((d, l) => {
      const t = [...o, d], a = f[l];
      a !== void 0 && de(
        e,
        t,
        a,
        i
      );
    });
  } else f && typeof f == "object" && f.constructor === Object && Object.keys(f).forEach((c) => {
    const d = [...o, c], l = f[c];
    de(e, d, l, i);
  });
}
let fe = [], $e = !1;
function tt() {
  $e || ($e = !0, queueMicrotask(it));
}
function rt(e, o, f) {
  const i = p.getState().getShadowValue(e, o), S = z(f) ? f(i) : f;
  Re(e, o, S), Ie(e, o, { bubble: !0 });
  const c = E(e, o);
  return {
    type: "update",
    oldValue: i,
    newValue: S,
    shadowMeta: c
  };
}
function nt(e, o) {
  e?.signals?.length && e.signals.forEach(({ parentId: f, position: i, effect: S }) => {
    const c = document.querySelector(`[data-parent-id="${f}"]`);
    if (!c) return;
    const d = Array.from(c.childNodes);
    if (!d[i]) return;
    let l = o;
    if (S && o !== null)
      try {
        l = new Function("state", `return (${S})(state)`)(
          o
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    l !== null && typeof l == "object" && (l = JSON.stringify(l)), d[i].textContent = String(l ?? "");
  });
}
function ot(e, o, f) {
  const i = E(e, []);
  if (!i?.components)
    return /* @__PURE__ */ new Set();
  const S = /* @__PURE__ */ new Set();
  let c = o;
  f.type === "insert" && f.itemId && (c = o);
  let d = [...c];
  for (; ; ) {
    const l = E(e, d);
    if (l?.pathComponents && l.pathComponents.forEach((t) => {
      const a = i.components?.get(t);
      a && ((Array.isArray(a.reactiveType) ? a.reactiveType : [a.reactiveType || "component"]).includes("none") || S.add(a));
    }), d.length === 0) break;
    d.pop();
  }
  return i.components.forEach((l, t) => {
    if (S.has(l))
      return;
    const a = Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"];
    if (a.includes("all"))
      S.add(l);
    else if (a.includes("deps") && l.depsFunction) {
      const h = j(e, []), A = l.depsFunction(h);
      (A === !0 || Array.isArray(A) && !se(l.prevDeps, A)) && (l.prevDeps = A, S.add(l));
    }
  }), S;
}
function at(e, o, f, i, S) {
  let c;
  if (z(f)) {
    const { value: a } = Q(e, o);
    c = f({ state: a, uuid: K() });
  } else
    c = f;
  const d = Le(
    e,
    o,
    c,
    i,
    S
  );
  Ie(e, o, { bubble: !0 });
  const l = E(e, o);
  let t;
  return l?.arrayKeys, {
    type: "insert",
    newValue: c,
    shadowMeta: l,
    path: o,
    itemId: d,
    insertAfterId: t
  };
}
function st(e, o) {
  const f = o.slice(0, -1), i = j(e, o);
  return We(e, o), Ie(e, f, { bubble: !0 }), { type: "cut", oldValue: i, parentPath: f };
}
function it() {
  const e = /* @__PURE__ */ new Set(), o = [], f = [];
  for (const i of fe) {
    if (i.status && i.updateType) {
      f.push(i);
      continue;
    }
    const S = i, c = S.type === "cut" ? null : S.newValue;
    S.shadowMeta?.signals?.length > 0 && o.push({ shadowMeta: S.shadowMeta, displayValue: c }), ot(
      S.stateKey,
      S.path,
      S
    ).forEach((l) => {
      e.add(l);
    });
  }
  f.length > 0 && Ge(f), o.forEach(({ shadowMeta: i, displayValue: S }) => {
    nt(i, S);
  }), e.forEach((i) => {
    i.forceUpdate();
  }), fe = [], $e = !1;
}
function ct(e, o, f) {
  return (S, c, d, l) => {
    i(e, c, S, d);
  };
  function i(S, c, d, l) {
    let t;
    switch (l.updateType) {
      case "update":
        t = rt(S, c, d);
        break;
      case "insert":
        t = at(
          S,
          c,
          d,
          void 0,
          l.itemId
        );
        break;
      case "cut":
        t = st(S, c);
        break;
    }
    t.stateKey = S, t.path = c, fe.push(t), tt();
    const a = {
      timeStamp: Date.now(),
      stateKey: S,
      path: c,
      updateType: l.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: l.metaData
    };
    fe.push(a), t.newValue !== void 0 && Ke(
      t.newValue,
      S,
      f.current,
      o
    ), f.current?.middleware && f.current.middleware({ update: a }), ae.getState().notifyUpdate(a);
  }
}
function lt(e, {
  stateKey: o,
  localStorage: f,
  formElements: i,
  reactiveDeps: S,
  reactiveType: c,
  componentId: d,
  defaultState: l,
  dependencies: t,
  serverState: a
} = {}) {
  const [h, A] = X({}), { sessionId: C } = ke();
  let O = !o;
  const [w] = X(o ?? K()), q = x(d ?? K()), L = x(
    null
  );
  L.current = H(w) ?? null;
  const m = pe(
    (r) => {
      const u = r ? { ...H(w), ...r } : H(w), g = u?.defaultState || l || e;
      if (u?.serverState?.status === "success" && u?.serverState?.data !== void 0)
        return {
          value: u.serverState.data,
          source: "server",
          timestamp: u.serverState.timestamp || Date.now()
        };
      if (u?.localStorage?.key && C) {
        const v = z(u.localStorage.key) ? u.localStorage.key(g) : u.localStorage.key, T = ge(
          `${C}-${w}-${v}`
        );
        if (T && T.lastUpdated > (u?.serverState?.timestamp || 0))
          return {
            value: T.state,
            source: "localStorage",
            timestamp: T.lastUpdated
          };
      }
      return {
        value: g || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, l, e, C]
  );
  R(() => {
    a && a.status === "success" && a.data !== void 0 && Ee(w, a);
  }, [a, w]), R(() => p.getState().subscribeToPath(w, (s) => {
    if (s?.type === "SERVER_STATE_UPDATE") {
      const u = s.serverState;
      if (u?.status !== "success" || u.data === void 0)
        return;
      ve(w, { serverState: u });
      const g = typeof u.merge == "object" ? u.merge : u.merge === !0 ? { strategy: "append", key: "id" } : null, y = j(w, []), v = u.data;
      if (g && g.strategy === "append" && "key" in g && Array.isArray(y) && Array.isArray(v)) {
        const T = g.key;
        if (!T) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const $ = new Set(
          y.map((D) => D[T])
        ), I = v.filter(
          (D) => !$.has(D[T])
        );
        I.length > 0 && Be(w, [], I);
        const P = j(w, []);
        de(
          w,
          [],
          P,
          u.timestamp || Date.now()
        );
      } else
        ie(w, v), de(
          w,
          [],
          v,
          u.timestamp || Date.now()
        );
      ee(w);
    }
  }), [w]), R(() => {
    const r = p.getState().getShadowMetadata(w, []);
    if (r && r.stateSource)
      return;
    const s = H(w), u = {
      validationEnabled: !!(s?.validation?.zodSchemaV4 || s?.validation?.zodSchemaV3),
      localStorageEnabled: !!s?.localStorage?.key
    };
    if (J(w, [], {
      ...r,
      features: u
    }), s?.defaultState !== void 0 || l !== void 0) {
      const T = s?.defaultState || l;
      s?.defaultState || ve(w, {
        defaultState: T
      });
    }
    const { value: g, source: y, timestamp: v } = m();
    ie(w, g), J(w, [], {
      stateSource: y,
      lastServerSync: y === "server" ? v : void 0,
      isDirty: y === "server" ? !1 : void 0,
      baseServerState: y === "server" ? g : void 0
    }), y === "server" && a && Ee(w, a), ee(w);
  }, [w, ...t || []]), le(() => {
    O && ve(w, {
      formElements: i,
      defaultState: l,
      localStorage: f,
      middleware: L.current?.middleware
    });
    const r = `${w}////${q.current}`, s = E(w, []), u = s?.components || /* @__PURE__ */ new Map();
    return u.set(r, {
      forceUpdate: () => A({}),
      reactiveType: c ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: S || void 0,
      deps: S ? S(j(w, [])) : [],
      prevDeps: S ? S(j(w, [])) : []
    }), J(w, [], {
      ...s,
      components: u
    }), A({}), () => {
      const g = E(w, []), y = g?.components?.get(r);
      y?.paths && y.paths.forEach((v) => {
        const $ = v.split(".").slice(1), I = p.getState().getShadowMetadata(w, $);
        I?.pathComponents && I.pathComponents.size === 0 && (delete I.pathComponents, p.getState().setShadowMetadata(w, $, I));
      }), g?.components && J(w, [], g);
    };
  }, []);
  const te = ct(
    w,
    C,
    L
  );
  return p.getState().initialStateGlobal[w] || Ve(w, e), Te(() => Pe(
    w,
    te,
    q.current,
    C
  ), [w, C]);
}
const ut = (e, o, f) => {
  let i = E(e, o)?.arrayKeys || [];
  const S = f?.transforms;
  if (!S || S.length === 0)
    return i;
  for (const c of S)
    if (c.type === "filter") {
      const d = [];
      i.forEach((l, t) => {
        const a = j(e, [...o, l]);
        c.fn(a, t) && d.push(l);
      }), i = d;
    } else c.type === "sort" && i.sort((d, l) => {
      const t = j(e, [...o, d]), a = j(e, [...o, l]);
      return c.fn(t, a);
    });
  return i;
}, we = (e, o, f) => {
  const i = `${e}////${o}`, c = E(e, [])?.components?.get(i);
  !c || c.reactiveType === "none" || !(Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType]).includes("component") || qe(e, f, i);
}, oe = (e, o, f) => {
  const i = E(e, []), S = /* @__PURE__ */ new Set();
  i?.components && i.components.forEach((d, l) => {
    (Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"]).includes("all") && (d.forceUpdate(), S.add(l));
  }), E(e, [
    ...o,
    "getSelected"
  ])?.pathComponents?.forEach((d) => {
    i?.components?.get(d)?.forceUpdate();
  });
  const c = E(e, o);
  for (let d of c?.arrayKeys || []) {
    const l = d + ".selected", t = E(e, l.split(".").slice(1));
    d == f && t?.pathComponents?.forEach((a) => {
      i?.components?.get(a)?.forceUpdate();
    });
  }
};
function Q(e, o, f) {
  const i = E(e, o), S = o.length > 0 ? o.join(".") : "root", c = f?.arrayViews?.[S];
  if (Array.isArray(c) && c.length === 0)
    return {
      shadowMeta: i,
      value: [],
      arrayKeys: i?.arrayKeys
    };
  const d = j(e, o, c);
  return {
    shadowMeta: i,
    value: d,
    arrayKeys: i?.arrayKeys
  };
}
function Pe(e, o, f, i) {
  const S = /* @__PURE__ */ new Map();
  function c({
    path: t = [],
    meta: a,
    componentId: h
  }) {
    const A = a ? JSON.stringify(a.arrayViews || a.transforms) : "", C = t.join(".") + ":" + h + ":" + A;
    if (S.has(C))
      return S.get(C);
    const O = [e, ...t].join("."), w = {
      get(L, m) {
        if (t.length === 0 && m in d)
          return d[m];
        if (!m.startsWith("$")) {
          const n = [...t, m];
          return c({
            path: n,
            componentId: h,
            meta: a
          });
        }
        if (m === "$_rebuildStateShape")
          return c;
        if (m === "$sync" && t.length === 0)
          return async function() {
            const n = p.getState().getInitialOptions(e), r = n?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const s = p.getState().getShadowValue(e, []), u = n?.validation?.key;
            try {
              const g = await r.action(s);
              if (g && !g.success && g.errors, g?.success) {
                const y = p.getState().getShadowMetadata(e, []);
                J(e, [], {
                  ...y,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: s
                  // Update base server state
                }), r.onSuccess && r.onSuccess(g.data);
              } else !g?.success && r.onError && r.onError(g.error);
              return g;
            } catch (g) {
              return r.onError && r.onError(g), { success: !1, error: g };
            }
          };
        if (m === "$_status" || m === "$getStatus") {
          const n = () => {
            const { shadowMeta: r, value: s } = Q(e, t, a);
            return console.log("getStatusFunc", t, r, s), r?.isDirty === !0 ? "dirty" : r?.stateSource === "server" || r?.isDirty === !1 ? "synced" : r?.stateSource === "localStorage" ? "restored" : r?.stateSource === "default" || s !== void 0 ? "fresh" : "unknown";
          };
          return m === "$_status" ? n() : n;
        }
        if (m === "$removeStorage")
          return () => {
            const n = p.getState().initialStateGlobal[e], r = H(e), s = z(r?.localStorage?.key) ? r.localStorage.key(n) : r?.localStorage?.key, u = `${i}-${e}-${s}`;
            u && localStorage.removeItem(u);
          };
        if (m === "$showValidationErrors")
          return () => {
            const { shadowMeta: n } = Q(e, t, a);
            return n?.validation?.status === "INVALID" && n.validation.errors.length > 0 ? n.validation.errors.filter((r) => r.severity === "error").map((r) => r.message) : [];
          };
        if (m === "$getSelected")
          return () => {
            const n = [e, ...t].join(".");
            we(e, h, [
              ...t,
              "getSelected"
            ]);
            const r = p.getState().selectedIndicesMap.get(n);
            if (!r)
              return;
            const s = t.join("."), u = a?.arrayViews?.[s], g = r.split(".").pop();
            if (!(u && !u.includes(g) || j(
              e,
              r.split(".").slice(1)
            ) === void 0))
              return c({
                path: r.split(".").slice(1),
                componentId: h,
                meta: a
              });
          };
        if (m === "$getSelectedIndex")
          return () => {
            const n = e + "." + t.join(".");
            t.join(".");
            const r = p.getState().selectedIndicesMap.get(n);
            if (!r)
              return -1;
            const { keys: s } = W(e, t, a);
            if (!s)
              return -1;
            const u = r.split(".").pop();
            return s.indexOf(u);
          };
        if (m === "$clearSelected")
          return oe(e, t), () => {
            ze({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (m === "$useVirtualView")
          return (n) => {
            const {
              itemHeight: r = 50,
              overscan: s = 6,
              stickToBottom: u = !1,
              scrollStickTolerance: g = 75
            } = n, y = x(null), [v, T] = X({
              startIndex: 0,
              endIndex: 10
            }), [$, I] = X({}), P = x(!0);
            R(() => {
              const V = setInterval(() => {
                I({});
              }, 1e3);
              return () => clearInterval(V);
            }, []);
            const D = x({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), _ = x(
              /* @__PURE__ */ new Map()
            ), { keys: b } = W(e, t, a);
            R(() => {
              const V = [e, ...t].join("."), M = p.getState().subscribeToPath(V, (F) => {
                F.type !== "GET_SELECTED" && F.type;
              });
              return () => {
                M();
              };
            }, [h, e, t.join(".")]), le(() => {
              if (u && b.length > 0 && y.current && !D.current.isUserScrolling && P.current) {
                const V = y.current, M = () => {
                  if (V.clientHeight > 0) {
                    const F = Math.ceil(
                      V.clientHeight / r
                    ), B = b.length - 1, U = Math.max(
                      0,
                      B - F - s
                    );
                    T({ startIndex: U, endIndex: B }), requestAnimationFrame(() => {
                      Z("instant"), P.current = !1;
                    });
                  } else
                    requestAnimationFrame(M);
                };
                M();
              }
            }, [b.length, u, r, s]);
            const k = x(v);
            le(() => {
              k.current = v;
            }, [v]);
            const N = x(b);
            le(() => {
              N.current = b;
            }, [b]);
            const ce = pe(() => {
              const V = y.current;
              if (!V) return;
              const M = V.scrollTop, { scrollHeight: F, clientHeight: B } = V, U = D.current, re = F - (M + B), Se = U.isNearBottom;
              U.isNearBottom = re <= g, M < U.lastScrollTop ? (U.scrollUpCount++, U.scrollUpCount > 3 && Se && (U.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : U.isNearBottom && (U.isUserScrolling = !1, U.scrollUpCount = 0), U.lastScrollTop = M;
              let Y = 0;
              for (let G = 0; G < b.length; G++) {
                const ye = b[G], me = _.current.get(ye);
                if (me && me.offset + me.height > M) {
                  Y = G;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                _.current,
                Y,
                v
              ), Y !== v.startIndex && v.startIndex != 0) {
                const G = Math.ceil(B / r);
                T({
                  startIndex: Math.max(0, Y - s),
                  endIndex: Math.min(
                    b.length - 1,
                    Y + G + s
                  )
                });
              }
            }, [
              b.length,
              v.startIndex,
              r,
              s,
              g
            ]);
            R(() => {
              const V = y.current;
              if (V)
                return V.addEventListener("scroll", ce, {
                  passive: !0
                }), () => {
                  V.removeEventListener("scroll", ce);
                };
            }, [ce, u]);
            const Z = pe(
              (V = "smooth") => {
                const M = y.current;
                if (!M) return;
                D.current.isUserScrolling = !1, D.current.isNearBottom = !0, D.current.scrollUpCount = 0;
                const F = () => {
                  const B = (U = 0) => {
                    if (U > 5) return;
                    const re = M.scrollHeight, Se = M.scrollTop, Y = M.clientHeight;
                    Se + Y >= re - 1 || (M.scrollTo({
                      top: re,
                      behavior: V
                    }), setTimeout(() => {
                      const G = M.scrollHeight, ye = M.scrollTop;
                      (G !== re || ye + Y < G - 1) && B(U + 1);
                    }, 50));
                  };
                  B();
                };
                "requestIdleCallback" in window ? requestIdleCallback(F, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(F);
                });
              },
              []
            );
            return R(() => {
              if (!u || !y.current) return;
              const V = y.current, M = D.current;
              let F;
              const B = () => {
                clearTimeout(F), F = setTimeout(() => {
                  !M.isUserScrolling && M.isNearBottom && Z(
                    P.current ? "instant" : "smooth"
                  );
                }, 100);
              }, U = new MutationObserver(() => {
                M.isUserScrolling || B();
              });
              return U.observe(V, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), P.current ? setTimeout(() => {
                Z("instant");
              }, 0) : B(), () => {
                clearTimeout(F), U.disconnect();
              };
            }, [u, b.length, Z]), {
              virtualState: Te(() => {
                const V = Array.isArray(b) ? b.slice(v.startIndex, v.endIndex + 1) : [], M = t.length > 0 ? t.join(".") : "root";
                return c({
                  path: t,
                  componentId: h,
                  meta: {
                    ...a,
                    arrayViews: { [M]: V },
                    serverStateIsUpStream: !0
                  }
                });
              }, [v.startIndex, v.endIndex, b, a]),
              virtualizerProps: {
                outer: {
                  ref: y,
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
                    transform: `translateY(${_.current.get(b[v.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: Z,
              scrollToIndex: (V, M = "smooth") => {
                if (y.current && b[V]) {
                  const F = _.current.get(b[V])?.offset || 0;
                  y.current.scrollTo({ top: F, behavior: M });
                }
              }
            };
          };
        if (m === "$stateMap")
          return (n) => {
            const { value: r, keys: s } = W(
              e,
              t,
              a
            );
            if (we(e, h, t), !s || !Array.isArray(r))
              return [];
            const u = c({
              path: t,
              componentId: h,
              meta: a
            });
            return r.map((g, y) => {
              const v = s[y];
              if (!v) return;
              const T = [...t, v], $ = c({
                path: T,
                // This now correctly points to the item in the shadow store.
                componentId: h,
                meta: a
              });
              return n($, y, u);
            });
          };
        if (m === "$stateFilter")
          return (n) => {
            const r = t.length > 0 ? t.join(".") : "root", { keys: s, value: u } = W(
              e,
              t,
              a
            );
            if (!Array.isArray(u))
              throw new Error("stateFilter can only be used on arrays");
            const g = [];
            return u.forEach((y, v) => {
              if (n(y, v)) {
                const T = s[v];
                T && g.push(T);
              }
            }), c({
              path: t,
              componentId: h,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [r]: g
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "filter", fn: n, path: t }
                ]
              }
            });
          };
        if (m === "$stateSort")
          return (n) => {
            const r = t.length > 0 ? t.join(".") : "root", { value: s, keys: u } = W(
              e,
              t,
              a
            );
            if (!Array.isArray(s) || !u)
              throw new Error("No array keys found for sorting");
            const g = s.map((v, T) => ({
              item: v,
              key: u[T]
            }));
            g.sort((v, T) => n(v.item, T.item));
            const y = g.map((v) => v.key);
            return c({
              path: t,
              componentId: h,
              meta: {
                ...a,
                arrayViews: {
                  ...a?.arrayViews || {},
                  [r]: y
                },
                transforms: [
                  ...a?.transforms || [],
                  { type: "sort", fn: n, path: t }
                ]
              }
            });
          };
        if (m === "$stream")
          return function(n = {}) {
            const {
              bufferSize: r = 100,
              flushInterval: s = 100,
              bufferStrategy: u = "accumulate",
              store: g,
              onFlush: y
            } = n;
            let v = [], T = !1, $ = null;
            const I = (k) => {
              if (!T) {
                if (u === "sliding" && v.length >= r)
                  v.shift();
                else if (u === "dropping" && v.length >= r)
                  return;
                v.push(k), v.length >= r && P();
              }
            }, P = () => {
              if (v.length === 0) return;
              const k = [...v];
              if (v = [], g) {
                const N = g(k);
                N !== void 0 && (Array.isArray(N) ? N : [N]).forEach((Z) => {
                  o(Z, t, {
                    updateType: "insert"
                  });
                });
              } else
                k.forEach((N) => {
                  o(N, t, {
                    updateType: "insert"
                  });
                });
              y?.(k);
            };
            s > 0 && ($ = setInterval(P, s));
            const D = K(), _ = E(e, t) || {}, b = _.streams || /* @__PURE__ */ new Map();
            return b.set(D, { buffer: v, flushTimer: $ }), J(e, t, {
              ..._,
              streams: b
            }), {
              write: (k) => I(k),
              writeMany: (k) => k.forEach(I),
              flush: () => P(),
              pause: () => {
                T = !0;
              },
              resume: () => {
                T = !1, v.length > 0 && P();
              },
              close: () => {
                P(), $ && clearInterval($);
                const k = p.getState().getShadowMetadata(e, t);
                k?.streams && k.streams.delete(D);
              }
            };
          };
        if (m === "$stateList")
          return (n) => /* @__PURE__ */ ne(() => {
            const s = x(/* @__PURE__ */ new Map()), [u, g] = X({}), y = t.length > 0 ? t.join(".") : "root", v = ut(e, t, a), T = Te(() => ({
              ...a,
              arrayViews: {
                ...a?.arrayViews || {},
                [y]: v
              }
            }), [a, y, v]), { value: $ } = W(
              e,
              t,
              T
            );
            if (R(() => {
              const D = p.getState().subscribeToPath(O, (_) => {
                if (_.type === "GET_SELECTED")
                  return;
                const k = p.getState().getShadowMetadata(e, t)?.transformCaches;
                if (k)
                  for (const N of k.keys())
                    N.startsWith(h) && k.delete(N);
                (_.type === "INSERT" || _.type === "INSERT_MANY" || _.type === "REMOVE" || _.type === "CLEAR_SELECTION" || _.type === "SERVER_STATE_UPDATE" && !a?.serverStateIsUpStream) && g({});
              });
              return () => {
                D();
              };
            }, [h, O]), !Array.isArray($))
              return null;
            const I = c({
              path: t,
              componentId: h,
              meta: T
              // Use updated meta here
            }), P = $.map((D, _) => {
              const b = v[_];
              if (!b)
                return null;
              let k = s.current.get(b);
              k || (k = K(), s.current.set(b, k));
              const N = [...t, b];
              return be(je, {
                key: b,
                stateKey: e,
                itemComponentId: k,
                itemPath: N,
                localIndex: _,
                arraySetter: I,
                rebuildStateShape: c,
                renderFn: n
              });
            });
            return /* @__PURE__ */ ne(De, { children: P });
          }, {});
        if (m === "$stateFlattenOn")
          return (n) => {
            const r = t.length > 0 ? t.join(".") : "root", s = a?.arrayViews?.[r], u = p.getState().getShadowValue(e, t, s);
            return Array.isArray(u) ? c({
              path: [...t, "[*]", n],
              componentId: h,
              meta: a
            }) : [];
          };
        if (m === "$index")
          return (n) => {
            const r = t.length > 0 ? t.join(".") : "root", s = a?.arrayViews?.[r];
            if (s) {
              const y = s[n];
              return y ? c({
                path: [...t, y],
                componentId: h,
                meta: a
              }) : void 0;
            }
            const u = E(e, t);
            if (!u?.arrayKeys) return;
            const g = u.arrayKeys[n];
            if (g)
              return c({
                path: [...t, g],
                componentId: h,
                meta: a
              });
          };
        if (m === "$last")
          return () => {
            const { keys: n } = W(e, t, a);
            if (!n || n.length === 0)
              return;
            const r = n[n.length - 1];
            if (!r)
              return;
            const s = [...t, r];
            return c({
              path: s,
              componentId: h,
              meta: a
            });
          };
        if (m === "$insert")
          return (n, r) => {
            o(n, t, { updateType: "insert" });
          };
        if (m === "$uniqueInsert")
          return (n, r, s) => {
            const { value: u } = Q(
              e,
              t,
              a
            ), g = z(n) ? n(u) : n;
            let y = null;
            if (!u.some((T) => {
              const $ = r ? r.every(
                (I) => se(T[I], g[I])
              ) : se(T, g);
              return $ && (y = T), $;
            }))
              o(g, t, { updateType: "insert" });
            else if (s && y) {
              const T = s(y), $ = u.map(
                (I) => se(I, y) ? T : I
              );
              o($, t, {
                updateType: "update"
              });
            }
          };
        if (m === "$cut")
          return (n, r) => {
            const s = E(e, t);
            if (!s?.arrayKeys || s.arrayKeys.length === 0)
              return;
            const u = n === -1 ? s.arrayKeys.length - 1 : n !== void 0 ? n : s.arrayKeys.length - 1, g = s.arrayKeys[u];
            g && o(null, [...t, g], {
              updateType: "cut"
            });
          };
        if (m === "$cutSelected")
          return () => {
            const n = [e, ...t].join("."), { keys: r } = W(e, t, a);
            if (!r || r.length === 0)
              return;
            const s = p.getState().selectedIndicesMap.get(n);
            if (!s)
              return;
            const u = s.split(".").pop();
            if (!r.includes(u))
              return;
            const g = s.split(".").slice(1);
            p.getState().clearSelectedIndex({ arrayKey: n });
            const y = g.slice(0, -1);
            oe(e, y), o(null, g, {
              updateType: "cut"
            });
          };
        if (m === "$cutByValue")
          return (n) => {
            const {
              isArray: r,
              value: s,
              keys: u
            } = W(e, t, a);
            if (!r) return;
            const g = he(s, u, (y) => y === n);
            g && o(null, [...t, g.key], {
              updateType: "cut"
            });
          };
        if (m === "$toggleByValue")
          return (n) => {
            const {
              isArray: r,
              value: s,
              keys: u
            } = W(e, t, a);
            if (!r) return;
            const g = he(s, u, (y) => y === n);
            if (g) {
              const y = [...t, g.key];
              o(null, y, {
                updateType: "cut"
              });
            } else
              o(n, t, { updateType: "insert" });
          };
        if (m === "$findWith")
          return (n, r) => {
            const { isArray: s, value: u, keys: g } = W(e, t, a);
            if (!s)
              throw new Error("findWith can only be used on arrays");
            const y = he(
              u,
              g,
              (v) => v?.[n] === r
            );
            return c(y ? {
              path: [...t, y.key],
              componentId: h,
              meta: a
            } : {
              path: [...t, `not_found_${K()}`],
              componentId: h,
              meta: a
            });
          };
        if (m === "$cutThis") {
          const { value: n } = Q(e, t, a), r = t.slice(0, -1);
          return oe(e, r), () => {
            o(n, t, { updateType: "cut" });
          };
        }
        if (m === "$get")
          return () => {
            we(e, h, t);
            const { value: n } = Q(e, t, a);
            return n;
          };
        if (m === "$$derive")
          return (n) => Ae({
            _stateKey: e,
            _path: t,
            _effect: n.toString(),
            _meta: a
          });
        if (m === "$formInput") {
          const n = (r) => {
            const s = E(e, r);
            return s?.formRef?.current ? s.formRef.current : (console.warn(
              `Form element ref not found for stateKey "${e}" at path "${r.join(".")}"`
            ), null);
          };
          return {
            setDisabled: (r) => {
              const s = n(t);
              s && (s.disabled = r);
            },
            focus: () => {
              n(t)?.focus();
            },
            blur: () => {
              n(t)?.blur();
            },
            scrollIntoView: (r) => {
              n(t)?.scrollIntoView(
                r ?? { behavior: "smooth", block: "center" }
              );
            },
            click: () => {
              n(t)?.click();
            },
            selectText: () => {
              const r = n(t);
              r && typeof r.select == "function" && r.select();
            }
          };
        }
        if (m === "$$get")
          return () => Ae({ _stateKey: e, _path: t, _meta: a });
        if (m === "$lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return Je(n);
        }
        if (m == "getLocalStorage")
          return (n) => ge(i + "-" + e + "-" + n);
        if (m === "$isSelected") {
          const n = t.slice(0, -1);
          if (E(e, n)?.arrayKeys) {
            const s = e + "." + n.join("."), u = p.getState().selectedIndicesMap.get(s), g = e + "." + t.join(".");
            return u === g;
          }
          return;
        }
        if (m === "$setSelected")
          return (n) => {
            const r = t.slice(0, -1), s = e + "." + r.join("."), u = e + "." + t.join(".");
            oe(e, r, void 0), p.getState().selectedIndicesMap.get(s), n && p.getState().setSelectedIndex(s, u);
          };
        if (m === "$toggleSelected")
          return () => {
            const n = t.slice(0, -1), r = e + "." + n.join("."), s = e + "." + t.join(".");
            p.getState().selectedIndicesMap.get(r) === s ? p.getState().clearSelectedIndex({ arrayKey: r }) : p.getState().setSelectedIndex(r, s), oe(e, n);
          };
        if (m === "$_componentId")
          return h;
        if (t.length == 0) {
          if (m === "$useFocusedFormElement")
            return () => {
              const { subscribeToPath: n } = p.getState(), r = `${e}.__focusedElement`, [s, u] = X(
                // Lazily get the initial value from the root metadata.
                () => E(e, [])?.focusedElement || null
              );
              return R(() => n(
                r,
                u
              ), [e]), s;
            };
          if (m === "$_applyUpdate")
            return (n, r, s = "update") => {
              o(n, r, { updateType: s });
            };
          if (m === "$_getEffectiveSetState")
            return o;
          if (m === "$getPluginMetaData")
            return (n) => Ze(e, t)?.get(n);
          if (m === "$addPluginMetaData")
            return console.log("$addPluginMetaDat"), (n, r) => Qe(e, t, n, r);
          if (m === "$removePluginMetaData")
            return (n) => Xe(e, t, n);
          if (m === "$addZodValidation")
            return (n, r) => {
              n.forEach((s) => {
                const u = p.getState().getShadowMetadata(e, s.path) || {};
                p.getState().setShadowMetadata(e, s.path, {
                  ...u,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: r || "client",
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
          if (m === "$clearZodValidation")
            return (n) => {
              if (!n)
                throw new Error("clearZodValidation requires a path");
              const r = E(e, n) || {};
              J(e, n, {
                ...r,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (m === "$applyOperation")
            return (n, r) => {
              const s = n.validation || [];
              if (!n || !n.path) {
                console.error(
                  "Invalid operation received by $applyOperation:",
                  n
                );
                return;
              }
              const u = s.map((g) => ({
                source: "sync_engine",
                message: g.message,
                severity: "warning",
                code: g.code
              }));
              p.getState().setShadowMetadata(e, n.path, {
                validation: {
                  status: u.length > 0 ? "INVALID" : "VALID",
                  errors: u,
                  lastValidated: Date.now()
                }
              }), o(n.newValue, n.path, {
                updateType: n.updateType,
                itemId: n.itemId,
                metaData: r
              });
            };
          if (m === "$applyJsonPatch")
            return (n) => {
              const r = p.getState(), s = r.getShadowMetadata(e, []);
              if (!s?.components) return;
              const u = (y) => !y || y === "/" ? [] : y.split("/").slice(1).map((v) => v.replace(/~1/g, "/").replace(/~0/g, "~")), g = /* @__PURE__ */ new Set();
              for (const y of n) {
                const v = u(y.path);
                switch (y.op) {
                  case "add":
                  case "replace": {
                    const { value: T } = y;
                    r.updateShadowAtPath(e, v, T), r.markAsDirty(e, v, { bubble: !0 });
                    let $ = [...v];
                    for (; ; ) {
                      const I = r.getShadowMetadata(
                        e,
                        $
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((P) => {
                        if (!g.has(P)) {
                          const D = s.components?.get(P);
                          D && (D.forceUpdate(), g.add(P));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const T = v.slice(0, -1);
                    r.removeShadowArrayElement(e, v), r.markAsDirty(e, T, { bubble: !0 });
                    let $ = [...T];
                    for (; ; ) {
                      const I = r.getShadowMetadata(
                        e,
                        $
                      );
                      if (I?.pathComponents && I.pathComponents.forEach((P) => {
                        if (!g.has(P)) {
                          const D = s.components?.get(P);
                          D && (D.forceUpdate(), g.add(P));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (m === "$getComponents")
            return () => E(e, [])?.components;
        }
        if (m === "$validationWrapper")
          return ({
            children: n,
            hideMessage: r
          }) => /* @__PURE__ */ ne(
            _e,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: n
            }
          );
        if (m === "$_stateKey") return e;
        if (m === "$_path") return t;
        if (m === "$update")
          return (n) => (o(n, t, { updateType: "update" }), {
            synced: () => {
              const r = p.getState().getShadowMetadata(e, t);
              J(e, t, {
                ...r,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const s = [e, ...t].join(".");
              Ye(s, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (m === "$toggle") {
          const { value: n } = Q(
            e,
            t,
            a
          );
          if (typeof n != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            o(!n, t, {
              updateType: "update"
            });
          };
        }
        if (m === "$isolate")
          return (n) => /* @__PURE__ */ ne(
            Oe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              renderFn: n
            }
          );
        if (m === "$formElement")
          return (n, r) => /* @__PURE__ */ ne(
            Fe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: c,
              setState: o,
              formOpts: r,
              renderFn: n
            }
          );
        const te = [...t, m];
        return c({
          path: te,
          componentId: h,
          meta: a
        });
      }
    }, q = new Proxy({}, w);
    return S.set(C, q), q;
  }
  const d = {
    $revertToInitialState: (t) => {
      const a = p.getState().getShadowMetadata(e, []);
      let h;
      a?.stateSource === "server" && a.baseServerState ? h = a.baseServerState : h = p.getState().initialStateGlobal[e], He(e), ie(e, h), c({
        path: [],
        componentId: f
      });
      const A = H(e), C = z(A?.localStorage?.key) ? A?.localStorage?.key(h) : A?.localStorage?.key, O = `${i}-${e}-${C}`;
      return O && localStorage.removeItem(O), ee(e), h;
    },
    $initializeAndMergeShadowState: (t) => {
      xe(e, t), ee(e);
    },
    $updateInitialState: (t) => {
      const a = Pe(
        e,
        o,
        f,
        i
      ), h = p.getState().initialStateGlobal[e], A = H(e), C = z(A?.localStorage?.key) ? A?.localStorage?.key(h) : A?.localStorage?.key, O = `${i}-${e}-${C}`;
      return localStorage.getItem(O) && localStorage.removeItem(O), Ce(() => {
        Ve(e, t), ie(e, t);
        const w = p.getState().getShadowMetadata(e, []);
        w && w?.components?.forEach((q) => {
          q.forceUpdate();
        });
      }), {
        fetchId: (w) => a.$get()[w]
      };
    }
  };
  return c({
    componentId: f,
    path: []
  });
}
function Ae(e) {
  return be(dt, { proxy: e });
}
function dt({
  proxy: e
}) {
  const o = x(null), f = x(null), i = x(!1), S = `${e._stateKey}-${e._path.join(".")}`, c = e._path.length > 0 ? e._path.join(".") : "root", d = e._meta?.arrayViews?.[c], l = j(e._stateKey, e._path, d);
  return R(() => {
    const t = o.current;
    if (!t || i.current) return;
    const a = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", S);
        return;
      }
      const h = t.parentElement, C = Array.from(h.childNodes).indexOf(t);
      let O = h.getAttribute("data-parent-id");
      O || (O = `parent-${crypto.randomUUID()}`, h.setAttribute("data-parent-id", O)), f.current = `instance-${crypto.randomUUID()}`;
      const w = p.getState().getShadowMetadata(e._stateKey, e._path) || {}, q = w.signals || [];
      q.push({
        instanceId: f.current,
        parentId: O,
        position: C,
        effect: e._effect
      }), p.getState().setShadowMetadata(e._stateKey, e._path, {
        ...w,
        signals: q
      });
      let L = l;
      if (e._effect)
        try {
          L = new Function(
            "state",
            `return (${e._effect})(state)`
          )(l);
        } catch (te) {
          console.error("Error evaluating effect function:", te);
        }
      L !== null && typeof L == "object" && (L = JSON.stringify(L));
      const m = document.createTextNode(String(L ?? ""));
      t.replaceWith(m), i.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(a), f.current) {
        const h = p.getState().getShadowMetadata(e._stateKey, e._path) || {};
        h.signals && (h.signals = h.signals.filter(
          (A) => A.instanceId !== f.current
        ), p.getState().setShadowMetadata(e._stateKey, e._path, h));
      }
    };
  }, []), be("span", {
    ref: o,
    style: { display: "contents" },
    "data-signal-id": S
  });
}
export {
  Ae as $cogsSignal,
  bt as addStateOptions,
  It as createCogsState,
  lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
