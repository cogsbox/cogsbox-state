"use client";
import { jsx as it, Fragment as Ut } from "react/jsx-runtime";
import { memo as Rt, useState as at, useRef as q, useCallback as ut, useEffect as et, useLayoutEffect as St, useMemo as ht, createElement as dt, startTransition as Nt } from "react";
import { createRoot as At } from "react-dom/client";
import { transformStateFunc as Ft, isFunction as rt, isArray as Tt, getDifferences as _t, isDeepEqual as ct } from "./utility.js";
import { ValidationWrapper as Ct } from "./Functions.jsx";
import jt from "superjson";
import { v4 as nt } from "uuid";
import { getGlobalStore as e, formRefStore as vt } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { useInView as Lt } from "react-intersection-observer";
function yt(t, a) {
  const h = e.getState().getInitialOptions, g = e.getState().setInitialStateOptions, y = h(t) || {};
  g(t, {
    ...y,
    ...a
  });
}
function Et({
  stateKey: t,
  options: a,
  initialOptionsPart: h
}) {
  const g = ot(t) || {}, y = h[t] || {}, I = e.getState().setInitialStateOptions, E = { ...y, ...g };
  let l = !1;
  if (a)
    for (const f in a)
      E.hasOwnProperty(f) ? (f == "localStorage" && a[f] && E[f].key !== a[f]?.key && (l = !0, E[f] = a[f]), f == "defaultState" && a[f] && E[f] !== a[f] && !ct(E[f], a[f]) && (l = !0, E[f] = a[f])) : (l = !0, E[f] = a[f]);
  E.syncOptions && (!a || !a.hasOwnProperty("syncOptions")) && (l = !0), l && I(t, E);
}
function ce(t, { formElements: a, validation: h }) {
  return { initialState: t, formElements: a, validation: h };
}
const Wt = (t, a) => {
  let h = t;
  console.log("optsc", a?.__useSync);
  const [g, y] = Ft(h);
  a?.__fromSyncSchema && a?.__syncNotifications && e.getState().setInitialStateOptions("__notifications", a.__syncNotifications), a?.__fromSyncSchema && a?.__apiParamsMap && e.getState().setInitialStateOptions("__apiParamsMap", a.__apiParamsMap), Object.keys(g).forEach((l) => {
    let f = y[l] || {};
    const P = {
      ...f
    };
    if (a?.formElements && (P.formElements = {
      ...a.formElements,
      ...f.formElements || {}
    }), a?.validation && (P.validation = {
      ...a.validation,
      ...f.validation || {}
    }, a.validation.key && !f.validation?.key && (P.validation.key = `${a.validation.key}.${l}`)), Object.keys(P).length > 0) {
      const M = ot(l);
      M ? e.getState().setInitialStateOptions(l, {
        ...M,
        ...P
      }) : e.getState().setInitialStateOptions(l, P);
    }
  }), Object.keys(g).forEach((l) => {
    e.getState().initializeShadowState(l, g[l]);
  });
  const I = (l, f) => {
    const [P] = at(f?.componentId ?? nt());
    Et({
      stateKey: l,
      options: f,
      initialOptionsPart: y
    });
    const M = e.getState().getShadowValue(l) || g[l], o = f?.modifyState ? f.modifyState(M) : M;
    return Bt(o, {
      stateKey: l,
      syncUpdate: f?.syncUpdate,
      componentId: P,
      localStorage: f?.localStorage,
      middleware: f?.middleware,
      reactiveType: f?.reactiveType,
      reactiveDeps: f?.reactiveDeps,
      defaultState: f?.defaultState,
      dependencies: f?.dependencies,
      serverState: f?.serverState,
      syncOptions: f?.syncOptions,
      __useSync: a?.__useSync
    });
  };
  function E(l, f) {
    Et({ stateKey: l, options: f, initialOptionsPart: y }), f.localStorage && zt(l, f), lt(l);
  }
  return { useCogsState: I, setCogsOptions: E };
};
function le(t, a) {
  const h = t.schemas, g = {}, y = {};
  for (const I in h) {
    const E = h[I];
    g[I] = E?.schemas?.defaultValues || {}, E?.api?.queryData?._paramType && (y[I] = E.api.queryData._paramType);
  }
  return Wt(g, {
    __fromSyncSchema: !0,
    __syncNotifications: t.notifications,
    __apiParamsMap: y,
    __useSync: a
  });
}
const {
  getInitialOptions: ot,
  getValidationErrors: ue,
  setStateLog: Ht,
  updateInitialStateGlobal: kt,
  addValidationError: pt,
  removeValidationError: ft
} = e.getState(), xt = (t, a, h, g, y) => {
  h?.log && console.log(
    "saving to localstorage",
    a,
    h.localStorage?.key,
    g
  );
  const I = rt(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (I && g) {
    const E = `${g}-${a}-${I}`;
    let l;
    try {
      l = mt(E)?.lastSyncedWithServer;
    } catch {
    }
    const f = e.getState().getShadowMetadata(a, []), P = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: f?.stateSource,
      baseServerState: f?.baseServerState
    }, M = jt.serialize(P);
    window.localStorage.setItem(
      E,
      JSON.stringify(M.json)
    );
  }
}, mt = (t) => {
  if (!t) return null;
  try {
    const a = window.localStorage.getItem(t);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, zt = (t, a) => {
  const h = e.getState().getShadowValue(t), { sessionId: g } = Pt(), y = rt(a?.localStorage?.key) ? a.localStorage.key(h) : a?.localStorage?.key;
  if (y && g) {
    const I = mt(
      `${g}-${t}-${y}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return lt(t), !0;
  }
  return !1;
}, lt = (t) => {
  const a = e.getState().getShadowMetadata(t, []);
  if (!a) return;
  const h = /* @__PURE__ */ new Set();
  a?.components?.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || h.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((g) => g());
  });
}, de = (t, a) => {
  const h = e.getState().getShadowMetadata(t, []);
  if (h) {
    const g = `${t}////${a}`, y = h?.components?.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
};
function wt(t, a, h, g) {
  const y = e.getState(), I = y.getShadowMetadata(t, a);
  if (y.setShadowMetadata(t, a, {
    ...I,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: g || Date.now()
  }), Array.isArray(h)) {
    const E = y.getShadowMetadata(t, a);
    E?.arrayKeys && E.arrayKeys.forEach((l, f) => {
      const P = l.split(".").slice(1), M = h[f];
      M !== void 0 && wt(
        t,
        P,
        M,
        g
      );
    });
  } else h && typeof h == "object" && h.constructor === Object && Object.keys(h).forEach((E) => {
    const l = [...a, E], f = h[E];
    wt(t, l, f, g);
  });
}
function Bt(t, {
  stateKey: a,
  localStorage: h,
  formElements: g,
  reactiveDeps: y,
  reactiveType: I,
  componentId: E,
  defaultState: l,
  syncUpdate: f,
  dependencies: P,
  serverState: M,
  __useSync: o,
  syncOptions: m
} = {}) {
  const [b, H] = at({}), { sessionId: R } = Pt();
  let z = !a;
  const [S] = at(a ?? nt()), W = e.getState().stateLog[S], B = q(/* @__PURE__ */ new Set()), p = q(E ?? nt()), Y = q(
    null
  );
  Y.current = ot(S) ?? null, et(() => {
    if (f && f.stateKey === S && f.path?.[0]) {
      const u = `${f.stateKey}:${f.path.join(".")}`;
      e.getState().setSyncInfo(u, {
        timeStamp: f.timeStamp,
        userId: f.userId
      });
    }
  }, [f]);
  const tt = ut(
    (u) => {
      const d = u ? { ...ot(S), ...u } : ot(S), k = d?.defaultState || l || t;
      if (d?.serverState?.status === "success" && d?.serverState?.data !== void 0)
        return {
          value: d.serverState.data,
          source: "server",
          timestamp: d.serverState.timestamp || Date.now()
        };
      if (d?.localStorage?.key && R) {
        const D = rt(d.localStorage.key) ? d.localStorage.key(k) : d.localStorage.key, V = mt(
          `${R}-${S}-${D}`
        );
        if (V && V.lastUpdated > (d?.serverState?.timestamp || 0))
          return {
            value: V.state,
            source: "localStorage",
            timestamp: V.lastUpdated
          };
      }
      return {
        value: k || t,
        source: "default",
        timestamp: Date.now()
      };
    },
    [S, l, t, R]
  );
  et(() => {
    e.getState().setServerStateUpdate(S, M);
  }, [M, S]), et(() => e.getState().subscribeToPath(S, (c) => {
    if (c?.type === "SERVER_STATE_UPDATE") {
      const d = c.serverState;
      if (console.log("SERVER_STATE_UPDATE", c), d?.status === "success" && d.data !== void 0) {
        yt(S, { serverState: d });
        const T = typeof d.merge == "object" ? d.merge : d.merge === !0 ? {} : null, D = e.getState().getShadowValue(S), V = d.data;
        if (T && Array.isArray(D) && Array.isArray(V)) {
          const L = T.key, N = new Set(
            D.map((Z) => Z[L])
          ), G = V.filter((Z) => !N.has(Z[L]));
          G.length > 0 && G.forEach((Z) => {
            e.getState().insertShadowArrayElement(S, [], Z);
            const X = e.getState().getShadowMetadata(S, []);
            if (X?.arrayKeys) {
              const x = X.arrayKeys[X.arrayKeys.length - 1];
              if (x) {
                const O = x.split(".").slice(1);
                e.getState().setShadowMetadata(S, O, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: d.timestamp || Date.now()
                });
                const v = e.getState().getShadowValue(x);
                v && typeof v == "object" && !Array.isArray(v) && Object.keys(v).forEach((w) => {
                  const A = [...O, w];
                  e.getState().setShadowMetadata(S, A, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: d.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          e.getState().initializeShadowState(S, V), wt(
            S,
            [],
            V,
            d.timestamp
          );
        const $ = e.getState().getShadowMetadata(S, []);
        e.getState().setShadowMetadata(S, [], {
          ...$,
          stateSource: "server",
          lastServerSync: d.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [S, tt]), et(() => {
    const u = e.getState().getShadowMetadata(S, []);
    if (u && u.stateSource)
      return;
    const c = ot(S);
    if (c?.defaultState !== void 0 || l !== void 0) {
      const d = c?.defaultState || l;
      c?.defaultState || yt(S, {
        defaultState: d
      });
      const { value: k, source: T, timestamp: D } = tt();
      e.getState().initializeShadowState(S, k), e.getState().setShadowMetadata(S, [], {
        stateSource: T,
        lastServerSync: T === "server" ? D : void 0,
        isDirty: !1,
        baseServerState: T === "server" ? k : void 0
      }), lt(S);
    }
  }, [S, ...P || []]), St(() => {
    z && yt(S, {
      formElements: g,
      defaultState: l,
      localStorage: h,
      middleware: Y.current?.middleware
    });
    const u = `${S}////${p.current}`, c = e.getState().getShadowMetadata(S, []), d = c?.components || /* @__PURE__ */ new Map();
    return d.set(u, {
      forceUpdate: () => H({}),
      reactiveType: I ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: y || void 0,
      deps: y ? y(e.getState().getShadowValue(S)) : [],
      prevDeps: y ? y(e.getState().getShadowValue(S)) : []
    }), e.getState().setShadowMetadata(S, [], {
      ...c,
      components: d
    }), H({}), () => {
      const k = e.getState().getShadowMetadata(S, []), T = k?.components?.get(u);
      T?.paths && T.paths.forEach((D) => {
        const $ = D.split(".").slice(1), L = e.getState().getShadowMetadata(S, $);
        L?.pathComponents && L.pathComponents.size === 0 && (delete L.pathComponents, e.getState().setShadowMetadata(S, $, L));
      }), k?.components && e.getState().setShadowMetadata(S, [], k);
    };
  }, []);
  const Q = q(null), r = (u, c, d) => {
    const k = [S, ...c].join(".");
    if (Array.isArray(c)) {
      const O = `${S}-${c.join(".")}`;
      B.current.add(O);
    }
    const T = e.getState(), D = T.getShadowMetadata(S, c), V = T.getShadowValue(k), $ = d.updateType === "insert" && rt(u) ? u({ state: V, uuid: nt() }) : rt(u) ? u(V) : u, N = {
      timeStamp: Date.now(),
      stateKey: S,
      path: c,
      updateType: d.updateType,
      status: "new",
      oldValue: V,
      newValue: $
    };
    switch (d.updateType) {
      case "insert": {
        T.insertShadowArrayElement(S, c, N.newValue), T.markAsDirty(S, c, { bubble: !0 });
        const O = T.getShadowMetadata(S, c);
        if (O?.arrayKeys) {
          const v = O.arrayKeys[O.arrayKeys.length - 1];
          if (v) {
            const w = v.split(".").slice(1);
            T.markAsDirty(S, w, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const O = c.slice(0, -1);
        T.removeShadowArrayElement(S, c), T.markAsDirty(S, O, { bubble: !0 });
        break;
      }
      case "update": {
        T.updateShadowAtPath(S, c, N.newValue), T.markAsDirty(S, c, { bubble: !0 });
        break;
      }
    }
    if (d.sync !== !1 && Q.current && Q.current.connected && Q.current.updateState({ operation: N }), D?.signals && D.signals.length > 0) {
      const O = d.updateType === "cut" ? null : $;
      D.signals.forEach(({ parentId: v, position: w, effect: A }) => {
        const _ = document.querySelector(`[data-parent-id="${v}"]`);
        if (_) {
          const C = Array.from(_.childNodes);
          if (C[w]) {
            let U = O;
            if (A && O !== null)
              try {
                U = new Function(
                  "state",
                  `return (${A})(state)`
                )(O);
              } catch (F) {
                console.error("Error evaluating effect function:", F);
              }
            U != null && typeof U == "object" && (U = JSON.stringify(U)), C[w].textContent = String(U ?? "");
          }
        }
      });
    }
    if (d.updateType === "insert" && D?.mapWrappers && D.mapWrappers.length > 0) {
      const O = T.getShadowMetadata(S, c)?.arrayKeys || [], v = O[O.length - 1], w = T.getShadowValue(v), A = T.getShadowValue(
        [S, ...c].join(".")
      );
      if (!v || w === void 0) return;
      D.mapWrappers.forEach((_) => {
        let C = !0, U = -1;
        if (_.meta?.transforms && _.meta.transforms.length > 0) {
          for (const F of _.meta.transforms)
            if (F.type === "filter" && !F.fn(w, -1)) {
              C = !1;
              break;
            }
          if (C) {
            const F = It(
              S,
              c,
              _.meta.transforms
            ), J = _.meta.transforms.find(
              (j) => j.type === "sort"
            );
            if (J) {
              const j = F.map((K) => ({
                key: K,
                value: T.getShadowValue(K)
              }));
              j.push({ key: v, value: w }), j.sort((K, st) => J.fn(K.value, st.value)), U = j.findIndex(
                (K) => K.key === v
              );
            } else
              U = F.length;
          }
        } else
          C = !0, U = O.length - 1;
        if (C && _.containerRef && _.containerRef.isConnected) {
          const F = document.createElement("div");
          F.setAttribute("data-item-path", v);
          const J = Array.from(_.containerRef.children);
          U >= 0 && U < J.length ? _.containerRef.insertBefore(
            F,
            J[U]
          ) : _.containerRef.appendChild(F);
          const j = At(F), K = nt(), st = v.split(".").slice(1), $t = _.rebuildStateShape({
            path: _.path,
            currentState: A,
            componentId: _.componentId,
            meta: _.meta
          });
          j.render(
            dt(Mt, {
              stateKey: S,
              itemComponentId: K,
              itemPath: st,
              localIndex: U,
              arraySetter: $t,
              rebuildStateShape: _.rebuildStateShape,
              renderFn: _.mapFn
            })
          );
        }
      });
    }
    if (d.updateType === "cut") {
      const O = c.slice(0, -1), v = T.getShadowMetadata(S, O);
      v?.mapWrappers && v.mapWrappers.length > 0 && v.mapWrappers.forEach((w) => {
        if (w.containerRef && w.containerRef.isConnected) {
          const A = w.containerRef.querySelector(
            `[data-item-path="${k}"]`
          );
          A && A.remove();
        }
      });
    }
    const Z = e.getState().getShadowValue(S), X = e.getState().getShadowMetadata(S, []), x = /* @__PURE__ */ new Set();
    if (console.log(
      "rootMeta",
      S,
      e.getState().shadowStateStore
    ), !X?.components)
      return Z;
    if (d.updateType === "update") {
      let O = [...c];
      for (; ; ) {
        const v = T.getShadowMetadata(S, O);
        if (v?.pathComponents && v.pathComponents.forEach((w) => {
          if (x.has(w))
            return;
          const A = X.components?.get(w);
          A && ((Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"]).includes("none") || (A.forceUpdate(), x.add(w)));
        }), O.length === 0)
          break;
        O.pop();
      }
      $ && typeof $ == "object" && !Tt($) && V && typeof V == "object" && !Tt(V) && _t($, V).forEach((w) => {
        const A = w.split("."), _ = [...c, ...A], C = T.getShadowMetadata(S, _);
        C?.pathComponents && C.pathComponents.forEach((U) => {
          if (x.has(U))
            return;
          const F = X.components?.get(U);
          F && ((Array.isArray(F.reactiveType) ? F.reactiveType : [F.reactiveType || "component"]).includes("none") || (F.forceUpdate(), x.add(U)));
        });
      });
    } else if (d.updateType === "insert" || d.updateType === "cut") {
      const O = d.updateType === "insert" ? c : c.slice(0, -1), v = T.getShadowMetadata(S, O);
      if (v?.signals && v.signals.length > 0) {
        const w = [S, ...O].join("."), A = T.getShadowValue(w);
        v.signals.forEach(({ parentId: _, position: C, effect: U }) => {
          const F = document.querySelector(
            `[data-parent-id="${_}"]`
          );
          if (F) {
            const J = Array.from(F.childNodes);
            if (J[C]) {
              let j = A;
              if (U)
                try {
                  j = new Function(
                    "state",
                    `return (${U})(state)`
                  )(A);
                } catch (K) {
                  console.error("Error evaluating effect function:", K), j = A;
                }
              j != null && typeof j == "object" && (j = JSON.stringify(j)), J[C].textContent = String(j ?? "");
            }
          }
        });
      }
      v?.pathComponents && v.pathComponents.forEach((w) => {
        if (!x.has(w)) {
          const A = X.components?.get(w);
          A && (A.forceUpdate(), x.add(w));
        }
      });
    }
    return X.components.forEach((O, v) => {
      if (x.has(v))
        return;
      const w = Array.isArray(O.reactiveType) ? O.reactiveType : [O.reactiveType || "component"];
      if (w.includes("all")) {
        O.forceUpdate(), x.add(v);
        return;
      }
      if (w.includes("deps") && O.depsFunction) {
        const A = T.getShadowValue(S), _ = O.depsFunction(A);
        let C = !1;
        _ === !0 ? C = !0 : Array.isArray(_) && (ct(O.prevDeps, _) || (O.prevDeps = _, C = !0)), C && (O.forceUpdate(), x.add(v));
      }
    }), x.clear(), Ht(S, (O) => {
      const v = [...O ?? [], N], w = /* @__PURE__ */ new Map();
      return v.forEach((A) => {
        const _ = `${A.stateKey}:${JSON.stringify(A.path)}`, C = w.get(_);
        C ? (C.timeStamp = Math.max(C.timeStamp, A.timeStamp), C.newValue = A.newValue, C.oldValue = C.oldValue ?? A.oldValue, C.updateType = A.updateType) : w.set(_, { ...A });
      }), Array.from(w.values());
    }), xt(
      $,
      S,
      Y.current,
      R
    ), Y.current?.middleware && Y.current.middleware({
      updateLog: W,
      update: N
    }), Z;
  };
  e.getState().initialStateGlobal[S] || kt(S, t);
  const n = ht(() => Dt(
    S,
    r,
    p.current,
    R
  ), [S, R]), s = o, i = Y.current?.syncOptions;
  return console.log("cogsSyncFn", s, i), s && (Q.current = s(
    n,
    i ?? {}
  )), n;
}
function qt(t) {
  return !t || t.length === 0 ? "" : t.map(
    (a) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${a.type}${JSON.stringify(a.dependencies || [])}`
    )
  ).join("");
}
const It = (t, a, h) => {
  let g = e.getState().getShadowMetadata(t, a)?.arrayKeys || [];
  if (!h || h.length === 0)
    return g;
  let y = g.map((I) => ({
    key: I,
    value: e.getState().getShadowValue(I)
  }));
  for (const I of h)
    I.type === "filter" ? y = y.filter(
      ({ value: E }, l) => I.fn(E, l)
    ) : I.type === "sort" && y.sort((E, l) => I.fn(E.value, l.value));
  return y.map(({ key: I }) => I);
}, Vt = (t, a, h) => {
  const g = `${t}////${a}`, { addPathComponent: y, getShadowMetadata: I } = e.getState(), l = I(t, [])?.components?.get(g);
  !l || l.reactiveType === "none" || !(Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType]).includes("component") || y(t, h, g);
}, gt = (t, a, h) => {
  const g = e.getState(), y = g.getShadowMetadata(t, []), I = /* @__PURE__ */ new Set();
  y?.components && y.components.forEach((l, f) => {
    (Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"]).includes("all") && (l.forceUpdate(), I.add(f));
  }), g.getShadowMetadata(t, [...a, "getSelected"])?.pathComponents?.forEach((l) => {
    y?.components?.get(l)?.forceUpdate();
  });
  const E = g.getShadowMetadata(t, a);
  for (let l of E?.arrayKeys || []) {
    const f = l + ".selected", P = g.getShadowMetadata(
      t,
      f.split(".").slice(1)
    );
    l == h && P?.pathComponents?.forEach((M) => {
      y?.components?.get(M)?.forceUpdate();
    });
  }
};
function Dt(t, a, h, g) {
  const y = /* @__PURE__ */ new Map();
  let I = 0;
  const E = (M) => {
    const o = M.join(".");
    for (const [m] of y)
      (m === o || m.startsWith(o + ".")) && y.delete(m);
    I++;
  };
  function l({
    currentState: M,
    path: o = [],
    meta: m,
    componentId: b
  }) {
    const H = o.map(String).join("."), R = [t, ...o].join(".");
    M = e.getState().getShadowValue(R, m?.validIds);
    const z = function() {
      return e().getShadowValue(t, o);
    }, S = {
      apply(B, p, Y) {
      },
      get(B, p) {
        if (p === "_rebuildStateShape")
          return l;
        if (Object.getOwnPropertyNames(f).includes(p) && o.length === 0)
          return f[p];
        if (p === "getDifferences")
          return () => {
            const r = e.getState().getShadowMetadata(t, []), n = e.getState().getShadowValue(t);
            let s;
            return r?.stateSource === "server" && r.baseServerState ? s = r.baseServerState : s = e.getState().initialStateGlobal[t], _t(n, s);
          };
        if (p === "sync" && o.length === 0)
          return async function() {
            const r = e.getState().getInitialOptions(t), n = r?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const s = e.getState().getShadowValue(t, []), i = r?.validation?.key;
            try {
              const u = await n.action(s);
              if (u && !u.success && u.errors && i && (e.getState().removeValidationError(i), u.errors.forEach((c) => {
                const d = [i, ...c.path].join(".");
                e.getState().addValidationError(d, c.message);
              }), lt(t)), u?.success) {
                const c = e.getState().getShadowMetadata(t, []);
                e.getState().setShadowMetadata(t, [], {
                  ...c,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: s
                  // Update base server state
                }), n.onSuccess && n.onSuccess(u.data);
              } else !u?.success && n.onError && n.onError(u.error);
              return u;
            } catch (u) {
              return n.onError && n.onError(u), { success: !1, error: u };
            }
          };
        if (p === "_status" || p === "getStatus") {
          const r = () => {
            const n = e.getState().getShadowMetadata(t, o), s = e.getState().getShadowValue(R);
            return n?.isDirty === !0 ? "dirty" : n?.isDirty === !1 || n?.stateSource === "server" ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" ? "fresh" : e.getState().getShadowMetadata(t, [])?.stateSource === "server" && !n?.isDirty ? "synced" : s !== void 0 && !n ? "fresh" : "unknown";
          };
          return p === "_status" ? r() : r;
        }
        if (p === "removeStorage")
          return () => {
            const r = e.getState().initialStateGlobal[t], n = ot(t), s = rt(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, i = `${g}-${t}-${s}`;
            i && localStorage.removeItem(i);
          };
        if (p === "showValidationErrors")
          return () => {
            const r = e.getState().getShadowMetadata(t, o);
            return r?.validation?.status === "VALIDATION_FAILED" && r.validation.message ? [r.validation.message] : [];
          };
        if (Array.isArray(M)) {
          if (p === "getSelected")
            return () => {
              const r = t + "." + o.join(".");
              Vt(t, b, [
                ...o,
                "getSelected"
              ]);
              const n = e.getState().selectedIndicesMap;
              if (!n || !n.has(r))
                return;
              const s = n.get(r);
              if (m?.validIds && !m.validIds.includes(s))
                return;
              const i = e.getState().getShadowValue(s);
              if (i)
                return l({
                  currentState: i,
                  path: s.split(".").slice(1),
                  componentId: b
                });
            };
          if (p === "getSelectedIndex")
            return () => e.getState().getSelectedIndex(
              t + "." + o.join("."),
              m?.validIds
            );
          if (p === "clearSelected")
            return gt(t, o), () => {
              e.getState().clearSelectedIndex({
                arrayKey: t + "." + o.join(".")
              });
            };
          if (p === "useVirtualView")
            return (r) => {
              const {
                itemHeight: n = 50,
                overscan: s = 6,
                stickToBottom: i = !1,
                scrollStickTolerance: u = 75
              } = r, c = q(null), [d, k] = at({
                startIndex: 0,
                endIndex: 10
              }), [T, D] = at({}), V = q(!0), $ = q({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), L = q(
                /* @__PURE__ */ new Map()
              );
              St(() => {
                if (!i || !c.current || $.current.isUserScrolling)
                  return;
                const v = c.current;
                v.scrollTo({
                  top: v.scrollHeight,
                  behavior: V.current ? "instant" : "smooth"
                });
              }, [T, i]);
              const N = e.getState().getShadowMetadata(t, o)?.arrayKeys || [], { totalHeight: G, itemOffsets: Z } = ht(() => {
                let v = 0;
                const w = /* @__PURE__ */ new Map();
                return (e.getState().getShadowMetadata(t, o)?.arrayKeys || []).forEach((_) => {
                  const C = _.split(".").slice(1), U = e.getState().getShadowMetadata(t, C)?.virtualizer?.itemHeight || n;
                  w.set(_, {
                    height: U,
                    offset: v
                  }), v += U;
                }), L.current = w, { totalHeight: v, itemOffsets: w };
              }, [N.length, n]);
              St(() => {
                if (i && N.length > 0 && c.current && !$.current.isUserScrolling && V.current) {
                  const v = c.current, w = () => {
                    if (v.clientHeight > 0) {
                      const A = Math.ceil(
                        v.clientHeight / n
                      ), _ = N.length - 1, C = Math.max(
                        0,
                        _ - A - s
                      );
                      k({ startIndex: C, endIndex: _ }), requestAnimationFrame(() => {
                        x("instant"), V.current = !1;
                      });
                    } else
                      requestAnimationFrame(w);
                  };
                  w();
                }
              }, [N.length, i, n, s]);
              const X = ut(() => {
                const v = c.current;
                if (!v) return;
                const w = v.scrollTop, { scrollHeight: A, clientHeight: _ } = v, C = $.current, U = A - (w + _), F = C.isNearBottom;
                C.isNearBottom = U <= u, w < C.lastScrollTop ? (C.scrollUpCount++, C.scrollUpCount > 3 && F && (C.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : C.isNearBottom && (C.isUserScrolling = !1, C.scrollUpCount = 0), C.lastScrollTop = w;
                let J = 0;
                for (let j = 0; j < N.length; j++) {
                  const K = N[j], st = L.current.get(K);
                  if (st && st.offset + st.height > w) {
                    J = j;
                    break;
                  }
                }
                if (J !== d.startIndex) {
                  const j = Math.ceil(_ / n);
                  k({
                    startIndex: Math.max(0, J - s),
                    endIndex: Math.min(
                      N.length - 1,
                      J + j + s
                    )
                  });
                }
              }, [
                N.length,
                d.startIndex,
                n,
                s,
                u
              ]);
              et(() => {
                const v = c.current;
                if (!(!v || !i))
                  return v.addEventListener("scroll", X, {
                    passive: !0
                  }), () => {
                    v.removeEventListener("scroll", X);
                  };
              }, [X, i]);
              const x = ut(
                (v = "smooth") => {
                  const w = c.current;
                  if (!w) return;
                  $.current.isUserScrolling = !1, $.current.isNearBottom = !0, $.current.scrollUpCount = 0;
                  const A = () => {
                    const _ = (C = 0) => {
                      if (C > 5) return;
                      const U = w.scrollHeight, F = w.scrollTop, J = w.clientHeight;
                      F + J >= U - 1 || (w.scrollTo({
                        top: U,
                        behavior: v
                      }), setTimeout(() => {
                        const j = w.scrollHeight, K = w.scrollTop;
                        (j !== U || K + J < j - 1) && _(C + 1);
                      }, 50));
                    };
                    _();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback(A, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame(A);
                  });
                },
                []
              );
              return et(() => {
                if (!i || !c.current) return;
                const v = c.current, w = $.current;
                let A;
                const _ = () => {
                  clearTimeout(A), A = setTimeout(() => {
                    !w.isUserScrolling && w.isNearBottom && x(
                      V.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, C = new MutationObserver(() => {
                  w.isUserScrolling || _();
                });
                C.observe(v, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const U = (F) => {
                  F.target instanceof HTMLImageElement && !w.isUserScrolling && _();
                };
                return v.addEventListener("load", U, !0), V.current ? setTimeout(() => {
                  x("instant");
                }, 0) : _(), () => {
                  clearTimeout(A), C.disconnect(), v.removeEventListener("load", U, !0);
                };
              }, [i, N.length, x]), {
                virtualState: ht(() => {
                  const v = e.getState(), w = v.getShadowValue(
                    [t, ...o].join(".")
                  ), A = v.getShadowMetadata(t, o)?.arrayKeys || [], _ = w.slice(
                    d.startIndex,
                    d.endIndex + 1
                  ), C = A.slice(
                    d.startIndex,
                    d.endIndex + 1
                  );
                  return l({
                    currentState: _,
                    path: o,
                    componentId: b,
                    meta: { ...m, validIds: C }
                  });
                }, [d.startIndex, d.endIndex, N.length]),
                virtualizerProps: {
                  outer: {
                    ref: c,
                    style: {
                      overflowY: "auto",
                      height: "100%",
                      position: "relative"
                    }
                  },
                  inner: {
                    style: {
                      height: `${G}px`,
                      position: "relative"
                    }
                  },
                  list: {
                    style: {
                      transform: `translateY(${L.current.get(
                        N[d.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: x,
                scrollToIndex: (v, w = "smooth") => {
                  if (c.current && N[v]) {
                    const A = L.current.get(N[v])?.offset || 0;
                    c.current.scrollTo({ top: A, behavior: w });
                  }
                }
              };
            };
          if (p === "stateMap")
            return (r) => {
              const [n, s] = at(
                m?.validIds ?? e.getState().getShadowMetadata(t, o)?.arrayKeys
              ), i = e.getState().getShadowValue(R, m?.validIds);
              if (!n)
                throw new Error("No array keys found for mapping");
              const u = l({
                currentState: i,
                path: o,
                componentId: b,
                meta: m
              });
              return i.map((c, d) => {
                const k = n[d]?.split(".").slice(1), T = l({
                  currentState: c,
                  path: k,
                  componentId: b,
                  meta: m
                });
                return r(
                  T,
                  d,
                  u
                );
              });
            };
          if (p === "$stateMap")
            return (r) => dt(Gt, {
              proxy: {
                _stateKey: t,
                _path: o,
                _mapFn: r,
                _meta: m
              },
              rebuildStateShape: l
            });
          if (p === "stateFind")
            return (r) => {
              const n = m?.validIds ?? e.getState().getShadowMetadata(t, o)?.arrayKeys;
              if (n)
                for (let s = 0; s < n.length; s++) {
                  const i = n[s];
                  if (!i) continue;
                  const u = e.getState().getShadowValue(i);
                  if (r(u, s)) {
                    const c = i.split(".").slice(1);
                    return l({
                      currentState: u,
                      path: c,
                      componentId: b,
                      meta: m
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (p === "stateFilter")
            return (r) => {
              const n = m?.validIds ?? e.getState().getShadowMetadata(t, o)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for filtering.");
              const s = [], i = M.filter(
                (u, c) => r(u, c) ? (s.push(n[c]), !0) : !1
              );
              return l({
                currentState: i,
                path: o,
                componentId: b,
                meta: {
                  validIds: s,
                  transforms: [
                    ...m?.transforms || [],
                    {
                      type: "filter",
                      fn: r
                    }
                  ]
                }
              });
            };
          if (p === "stateSort")
            return (r) => {
              const n = m?.validIds ?? e.getState().getShadowMetadata(t, o)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for sorting");
              const s = M.map((i, u) => ({
                item: i,
                key: n[u]
              }));
              return s.sort((i, u) => r(i.item, u.item)).filter(Boolean), l({
                currentState: s.map((i) => i.item),
                path: o,
                componentId: b,
                meta: {
                  validIds: s.map((i) => i.key),
                  transforms: [
                    ...m?.transforms || [],
                    { type: "sort", fn: r }
                  ]
                }
              });
            };
          if (p === "stream")
            return function(r = {}) {
              const {
                bufferSize: n = 100,
                flushInterval: s = 100,
                bufferStrategy: i = "accumulate",
                store: u,
                onFlush: c
              } = r;
              let d = [], k = !1, T = null;
              const D = (G) => {
                if (!k) {
                  if (i === "sliding" && d.length >= n)
                    d.shift();
                  else if (i === "dropping" && d.length >= n)
                    return;
                  d.push(G), d.length >= n && V();
                }
              }, V = () => {
                if (d.length === 0) return;
                const G = [...d];
                if (d = [], u) {
                  const Z = u(G);
                  Z !== void 0 && (Array.isArray(Z) ? Z : [Z]).forEach((x) => {
                    a(x, o, {
                      updateType: "insert"
                    });
                  });
                } else
                  G.forEach((Z) => {
                    a(Z, o, {
                      updateType: "insert"
                    });
                  });
                c?.(G);
              };
              s > 0 && (T = setInterval(V, s));
              const $ = nt(), L = e.getState().getShadowMetadata(t, o) || {}, N = L.streams || /* @__PURE__ */ new Map();
              return N.set($, { buffer: d, flushTimer: T }), e.getState().setShadowMetadata(t, o, {
                ...L,
                streams: N
              }), {
                write: (G) => D(G),
                writeMany: (G) => G.forEach(D),
                flush: () => V(),
                pause: () => {
                  k = !0;
                },
                resume: () => {
                  k = !1, d.length > 0 && V();
                },
                close: () => {
                  V(), T && clearInterval(T);
                  const G = e.getState().getShadowMetadata(t, o);
                  G?.streams && G.streams.delete($);
                }
              };
            };
          if (p === "stateList")
            return (r) => /* @__PURE__ */ it(() => {
              const s = q(/* @__PURE__ */ new Map()), i = m?.transforms && m.transforms.length > 0 ? `${b}-${qt(m.transforms)}` : `${b}-base`, [u, c] = at({}), { validIds: d, arrayValues: k } = ht(() => {
                const D = e.getState().getShadowMetadata(t, o)?.transformCaches?.get(i);
                let V;
                D && D.validIds ? V = D.validIds : (V = It(
                  t,
                  o,
                  m?.transforms
                ), e.getState().setTransformCache(t, o, i, {
                  validIds: V,
                  computedAt: Date.now(),
                  transforms: m?.transforms || []
                }));
                const $ = e.getState().getShadowValue(R, V);
                return {
                  validIds: V,
                  arrayValues: $ || []
                };
              }, [i, u]);
              if (et(() => {
                const D = e.getState().subscribeToPath(R, (V) => {
                  if (V.type === "GET_SELECTED")
                    return;
                  const L = e.getState().getShadowMetadata(t, o)?.transformCaches;
                  if (L)
                    for (const N of L.keys())
                      N.startsWith(b) && L.delete(N);
                  (V.type === "INSERT" || V.type === "REMOVE" || V.type === "CLEAR_SELECTION") && c({});
                });
                return () => {
                  D();
                };
              }, [b, R]), !Array.isArray(k))
                return null;
              const T = l({
                currentState: k,
                path: o,
                componentId: b,
                meta: {
                  ...m,
                  validIds: d
                }
              });
              return /* @__PURE__ */ it(Ut, { children: k.map((D, V) => {
                const $ = d[V];
                if (!$)
                  return null;
                let L = s.current.get($);
                L || (L = nt(), s.current.set($, L));
                const N = $.split(".").slice(1);
                return dt(Mt, {
                  key: $,
                  stateKey: t,
                  itemComponentId: L,
                  itemPath: N,
                  localIndex: V,
                  arraySetter: T,
                  rebuildStateShape: l,
                  renderFn: r
                });
              }) });
            }, {});
          if (p === "stateFlattenOn")
            return (r) => {
              const n = M;
              y.clear(), I++;
              const s = n.flatMap(
                (i) => i[r] ?? []
              );
              return l({
                currentState: s,
                path: [...o, "[*]", r],
                componentId: b,
                meta: m
              });
            };
          if (p === "index")
            return (r) => {
              const s = e.getState().getShadowMetadata(t, o)?.arrayKeys?.filter(
                (c) => !m?.validIds || m?.validIds && m?.validIds?.includes(c)
              )?.[r];
              if (!s) return;
              const i = e.getState().getShadowValue(s, m?.validIds);
              return l({
                currentState: i,
                path: s.split(".").slice(1),
                componentId: b,
                meta: m
              });
            };
          if (p === "last")
            return () => {
              const r = e.getState().getShadowValue(t, o);
              if (r.length === 0) return;
              const n = r.length - 1, s = r[n], i = [...o, n.toString()];
              return l({
                currentState: s,
                path: i,
                componentId: b,
                meta: m
              });
            };
          if (p === "insert")
            return (r, n) => (a(r, o, { updateType: "insert" }), l({
              currentState: e.getState().getShadowValue(t, o),
              path: o,
              componentId: b,
              meta: m
            }));
          if (p === "uniqueInsert")
            return (r, n, s) => {
              const i = e.getState().getShadowValue(t, o), u = rt(r) ? r(i) : r;
              let c = null;
              if (!i.some((k) => {
                const T = n ? n.every(
                  (D) => ct(k[D], u[D])
                ) : ct(k, u);
                return T && (c = k), T;
              }))
                E(o), a(u, o, { updateType: "insert" });
              else if (s && c) {
                const k = s(c), T = i.map(
                  (D) => ct(D, c) ? k : D
                );
                E(o), a(T, o, {
                  updateType: "update"
                });
              }
            };
          if (p === "cut")
            return (r, n) => {
              const s = m?.validIds ?? e.getState().getShadowMetadata(t, o)?.arrayKeys;
              if (!s || s.length === 0) return;
              const i = r == -1 ? s.length - 1 : r !== void 0 ? r : s.length - 1, u = s[i];
              if (!u) return;
              const c = u.split(".").slice(1);
              a(M, c, {
                updateType: "cut"
              });
            };
          if (p === "cutSelected")
            return () => {
              const r = It(
                t,
                o,
                m?.transforms
              );
              if (!r || r.length === 0) return;
              const n = e.getState().selectedIndicesMap.get(R);
              let s = r.findIndex(
                (c) => c === n
              );
              const i = r[s == -1 ? r.length - 1 : s]?.split(".").slice(1);
              e.getState().clearSelectedIndex({ arrayKey: R });
              const u = i?.slice(0, -1);
              gt(t, u), a(M, i, {
                updateType: "cut"
              });
            };
          if (p === "cutByValue")
            return (r) => {
              const n = e.getState().getShadowMetadata(t, o), s = m?.validIds ?? n?.arrayKeys;
              if (!s) return;
              let i = null;
              for (const u of s)
                if (e.getState().getShadowValue(u) === r) {
                  i = u;
                  break;
                }
              if (i) {
                const u = i.split(".").slice(1);
                a(null, u, { updateType: "cut" });
              }
            };
          if (p === "toggleByValue")
            return (r) => {
              const n = e.getState().getShadowMetadata(t, o), s = m?.validIds ?? n?.arrayKeys;
              if (!s) return;
              let i = null;
              for (const u of s) {
                const c = e.getState().getShadowValue(u);
                if (console.log("itemValue sdasdasdasd", c), c === r) {
                  i = u;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", i), i) {
                const u = i.split(".").slice(1);
                console.log("itemValue keyToCut", i), a(r, u, {
                  updateType: "cut"
                });
              } else
                a(r, o, { updateType: "insert" });
            };
          if (p === "findWith")
            return (r, n) => {
              const s = e.getState().getShadowMetadata(t, o)?.arrayKeys;
              if (!s)
                throw new Error("No array keys found for sorting");
              let i = null, u = [];
              for (const c of s) {
                let d = e.getState().getShadowValue(c, m?.validIds);
                if (d && d[r] === n) {
                  i = d, u = c.split(".").slice(1);
                  break;
                }
              }
              return l({
                currentState: i,
                path: u,
                componentId: b,
                meta: m
              });
            };
        }
        if (p === "cut") {
          let r = e.getState().getShadowValue(o.join("."));
          return () => {
            a(r, o, { updateType: "cut" });
          };
        }
        if (p === "get")
          return () => (Vt(t, b, o), e.getState().getShadowValue(R, m?.validIds));
        if (p === "getState")
          return () => e.getState().getShadowValue(R, m?.validIds);
        if (p === "$derive")
          return (r) => bt({
            _stateKey: t,
            _path: o,
            _effect: r.toString(),
            _meta: m
          });
        if (p === "$get")
          return () => bt({ _stateKey: t, _path: o, _meta: m });
        if (p === "lastSynced") {
          const r = `${t}:${o.join(".")}`;
          return e.getState().getSyncInfo(r);
        }
        if (p == "getLocalStorage")
          return (r) => mt(g + "-" + t + "-" + r);
        if (p === "isSelected") {
          const r = [t, ...o].slice(0, -1);
          if (gt(t, o, void 0), Array.isArray(
            e.getState().getShadowValue(r.join("."), m?.validIds)
          )) {
            o[o.length - 1];
            const n = r.join("."), s = e.getState().selectedIndicesMap.get(n), i = t + "." + o.join(".");
            return s === i;
          }
          return;
        }
        if (p === "setSelected")
          return (r) => {
            const n = o.slice(0, -1), s = t + "." + n.join("."), i = t + "." + o.join(".");
            gt(t, n, void 0), e.getState().selectedIndicesMap.get(s), r && e.getState().setSelectedIndex(s, i);
          };
        if (p === "toggleSelected")
          return () => {
            const r = o.slice(0, -1), n = t + "." + r.join("."), s = t + "." + o.join(".");
            e.getState().selectedIndicesMap.get(n) === s ? e.getState().clearSelectedIndex({ arrayKey: n }) : e.getState().setSelectedIndex(n, s);
          };
        if (p === "_componentId")
          return b;
        if (o.length == 0) {
          if (p === "addValidation")
            return (r) => {
              const n = e.getState().getInitialOptions(t)?.validation;
              if (!n?.key) throw new Error("Validation key not found");
              ft(n.key), r.forEach((s) => {
                const i = [n.key, ...s.path].join(".");
                pt(i, s.message);
              }), lt(t);
            };
          if (p === "applyJsonPatch")
            return (r) => {
              const n = e.getState(), s = n.getShadowMetadata(t, []);
              if (!s?.components) return;
              const i = (c) => !c || c === "/" ? [] : c.split("/").slice(1).map((d) => d.replace(/~1/g, "/").replace(/~0/g, "~")), u = /* @__PURE__ */ new Set();
              for (const c of r) {
                const d = i(c.path);
                switch (c.op) {
                  case "add":
                  case "replace": {
                    const { value: k } = c;
                    n.updateShadowAtPath(t, d, k), n.markAsDirty(t, d, { bubble: !0 });
                    let T = [...d];
                    for (; ; ) {
                      const D = n.getShadowMetadata(
                        t,
                        T
                      );
                      if (console.log("pathMeta", D), D?.pathComponents && D.pathComponents.forEach((V) => {
                        if (!u.has(V)) {
                          const $ = s.components?.get(V);
                          $ && ($.forceUpdate(), u.add(V));
                        }
                      }), T.length === 0) break;
                      T.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const k = d.slice(0, -1);
                    n.removeShadowArrayElement(t, d), n.markAsDirty(t, k, { bubble: !0 });
                    let T = [...k];
                    for (; ; ) {
                      const D = n.getShadowMetadata(
                        t,
                        T
                      );
                      if (D?.pathComponents && D.pathComponents.forEach((V) => {
                        if (!u.has(V)) {
                          const $ = s.components?.get(V);
                          $ && ($.forceUpdate(), u.add(V));
                        }
                      }), T.length === 0) break;
                      T.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (p === "validateZodSchema")
            return () => {
              const r = e.getState().getInitialOptions(t)?.validation, n = r?.zodSchemaV4 || r?.zodSchemaV3;
              if (!n || !r?.key)
                throw new Error(
                  "Zod schema (v3 or v4) or validation key not found"
                );
              ft(r.key);
              const s = e.getState().getShadowValue(t), i = n.safeParse(s);
              return i.success ? !0 : ("issues" in i.error ? i.error.issues.forEach((u) => {
                const c = [r.key, ...u.path].join(".");
                pt(c, u.message);
              }) : i.error.errors.forEach((u) => {
                const c = [r.key, ...u.path].join(".");
                pt(c, u.message);
              }), lt(t), !1);
            };
          if (p === "getComponents")
            return () => e.getState().getShadowMetadata(t, [])?.components;
          if (p === "getAllFormRefs")
            return () => vt.getState().getFormRefsByStateKey(t);
        }
        if (p === "getFormRef")
          return () => vt.getState().getFormRef(t + "." + o.join("."));
        if (p === "validationWrapper")
          return ({
            children: r,
            hideMessage: n
          }) => /* @__PURE__ */ it(
            Ct,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: o,
              stateKey: t,
              children: r
            }
          );
        if (p === "_stateKey") return t;
        if (p === "_path") return o;
        if (p === "update")
          return (r) => (a(r, o, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const n = e.getState().getShadowMetadata(t, o);
              e.getState().setShadowMetadata(t, o, {
                ...n,
                isDirty: !1,
                // EXPLICITLY set to false, not just undefined
                stateSource: "server",
                // Mark as coming from server
                lastServerSync: Date.now()
                // Add timestamp
              });
              const s = [t, ...o].join(".");
              e.getState().notifyPathSubscribers(s, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (p === "toggle") {
          const r = e.getState().getShadowValue([t, ...o].join("."));
          if (console.log("currentValueAtPath", r), typeof M != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            a(!r, o, {
              updateType: "update"
            });
          };
        }
        if (p === "formElement")
          return (r, n) => /* @__PURE__ */ it(
            Qt,
            {
              stateKey: t,
              path: o,
              rebuildStateShape: l,
              setState: a,
              formOpts: n,
              renderFn: r
            }
          );
        const tt = [...o, p], Q = e.getState().getShadowValue(t, tt);
        return l({
          currentState: Q,
          path: tt,
          componentId: b,
          meta: m
        });
      }
    }, W = new Proxy(z, S);
    return y.set(H, {
      proxy: W,
      stateVersion: I
    }), W;
  }
  const f = {
    removeValidation: (M) => {
      M?.validationKey && ft(M.validationKey);
    },
    revertToInitialState: (M) => {
      const o = e.getState().getInitialOptions(t)?.validation;
      o?.key && ft(o.key), M?.validationKey && ft(M.validationKey);
      const m = e.getState().getShadowMetadata(t, []);
      m?.stateSource === "server" && m.baseServerState ? m.baseServerState : e.getState().initialStateGlobal[t];
      const b = e.getState().initialStateGlobal[t];
      e.getState().clearSelectedIndexesForState(t), y.clear(), I++, e.getState().initializeShadowState(t, b), l({
        currentState: b,
        path: [],
        componentId: h
      });
      const H = ot(t), R = rt(H?.localStorage?.key) ? H?.localStorage?.key(b) : H?.localStorage?.key, z = `${g}-${t}-${R}`;
      z && localStorage.removeItem(z);
      const S = e.getState().getShadowMetadata(t, []);
      return S && S?.components?.forEach((W) => {
        W.forceUpdate();
      }), b;
    },
    updateInitialState: (M) => {
      y.clear(), I++;
      const o = Dt(
        t,
        a,
        h,
        g
      ), m = e.getState().initialStateGlobal[t], b = ot(t), H = rt(b?.localStorage?.key) ? b?.localStorage?.key(m) : b?.localStorage?.key, R = `${g}-${t}-${H}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Nt(() => {
        kt(t, M), e.getState().initializeShadowState(t, M);
        const z = e.getState().getShadowMetadata(t, []);
        z && z?.components?.forEach((S) => {
          S.forceUpdate();
        });
      }), {
        fetchId: (z) => o.get()[z]
      };
    }
  };
  return l({
    currentState: e.getState().getShadowValue(t, []),
    componentId: h,
    path: []
  });
}
function bt(t) {
  return dt(Jt, { proxy: t });
}
function Gt({
  proxy: t,
  rebuildStateShape: a
}) {
  const h = q(null), g = q(`map-${crypto.randomUUID()}`), y = q(!1), I = q(/* @__PURE__ */ new Map());
  et(() => {
    const l = h.current;
    if (!l || y.current) return;
    const f = setTimeout(() => {
      const P = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, M = P.mapWrappers || [];
      M.push({
        instanceId: g.current,
        mapFn: t._mapFn,
        containerRef: l,
        rebuildStateShape: a,
        path: t._path,
        componentId: g.current,
        meta: t._meta
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...P,
        mapWrappers: M
      }), y.current = !0, E();
    }, 0);
    return () => {
      if (clearTimeout(f), g.current) {
        const P = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        P.mapWrappers && (P.mapWrappers = P.mapWrappers.filter(
          (M) => M.instanceId !== g.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, P));
      }
      I.current.forEach((P) => P.unmount());
    };
  }, []);
  const E = () => {
    const l = h.current;
    if (!l) return;
    const f = e.getState().getShadowValue(
      [t._stateKey, ...t._path].join("."),
      t._meta?.validIds
    );
    if (!Array.isArray(f)) return;
    const P = t._meta?.validIds ?? e.getState().getShadowMetadata(t._stateKey, t._path)?.arrayKeys ?? [], M = a({
      currentState: f,
      path: t._path,
      componentId: g.current,
      meta: t._meta
    });
    f.forEach((o, m) => {
      const b = P[m];
      if (!b) return;
      const H = nt(), R = document.createElement("div");
      R.setAttribute("data-item-path", b), l.appendChild(R);
      const z = At(R);
      I.current.set(b, z);
      const S = b.split(".").slice(1);
      z.render(
        dt(Mt, {
          stateKey: t._stateKey,
          itemComponentId: H,
          itemPath: S,
          localIndex: m,
          arraySetter: M,
          rebuildStateShape: a,
          renderFn: t._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ it("div", { ref: h, "data-map-container": g.current });
}
function Jt({
  proxy: t
}) {
  const a = q(null), h = q(null), g = q(!1), y = `${t._stateKey}-${t._path.join(".")}`, I = e.getState().getShadowValue(
    [t._stateKey, ...t._path].join("."),
    t._meta?.validIds
  );
  return et(() => {
    const E = a.current;
    if (!E || g.current) return;
    const l = setTimeout(() => {
      if (!E.parentElement) {
        console.warn("Parent element not found for signal", y);
        return;
      }
      const f = E.parentElement, M = Array.from(f.childNodes).indexOf(E);
      let o = f.getAttribute("data-parent-id");
      o || (o = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", o)), h.current = `instance-${crypto.randomUUID()}`;
      const m = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, b = m.signals || [];
      b.push({
        instanceId: h.current,
        parentId: o,
        position: M,
        effect: t._effect
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...m,
        signals: b
      });
      let H = I;
      if (t._effect)
        try {
          H = new Function(
            "state",
            `return (${t._effect})(state)`
          )(I);
        } catch (z) {
          console.error("Error evaluating effect function:", z);
        }
      H !== null && typeof H == "object" && (H = JSON.stringify(H));
      const R = document.createTextNode(String(H ?? ""));
      E.replaceWith(R), g.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(l), h.current) {
        const f = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        f.signals && (f.signals = f.signals.filter(
          (P) => P.instanceId !== h.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, f));
      }
    };
  }, []), dt("span", {
    ref: a,
    style: { display: "contents" },
    "data-signal-id": y
  });
}
const Mt = Rt(
  Zt,
  (t, a) => t.itemPath.join(".") === a.itemPath.join(".") && t.stateKey === a.stateKey && t.itemComponentId === a.itemComponentId && t.localIndex === a.localIndex
), Yt = (t) => {
  const [a, h] = at(!1);
  return St(() => {
    if (!t.current) {
      h(!0);
      return;
    }
    const g = Array.from(t.current.querySelectorAll("img"));
    if (g.length === 0) {
      h(!0);
      return;
    }
    let y = 0;
    const I = () => {
      y++, y === g.length && h(!0);
    };
    return g.forEach((E) => {
      E.complete ? I() : (E.addEventListener("load", I), E.addEventListener("error", I));
    }), () => {
      g.forEach((E) => {
        E.removeEventListener("load", I), E.removeEventListener("error", I);
      });
    };
  }, [t.current]), a;
};
function Zt({
  stateKey: t,
  itemComponentId: a,
  itemPath: h,
  localIndex: g,
  arraySetter: y,
  rebuildStateShape: I,
  renderFn: E
}) {
  const [, l] = at({}), { ref: f, inView: P } = Lt(), M = q(null), o = Yt(M), m = q(!1), b = [t, ...h].join(".");
  Ot(t, a, l);
  const H = ut(
    (B) => {
      M.current = B, f(B);
    },
    [f]
  );
  et(() => {
    e.getState().subscribeToPath(b, (B) => {
      l({});
    });
  }, []), et(() => {
    if (!P || !o || m.current)
      return;
    const B = M.current;
    if (B && B.offsetHeight > 0) {
      m.current = !0;
      const p = B.offsetHeight;
      e.getState().setShadowMetadata(t, h, {
        virtualizer: {
          itemHeight: p,
          domRef: B
        }
      });
      const Y = h.slice(0, -1), tt = [t, ...Y].join(".");
      e.getState().notifyPathSubscribers(tt, {
        type: "ITEMHEIGHT",
        itemKey: h.join("."),
        ref: M.current
      });
    }
  }, [P, o, t, h]);
  const R = [t, ...h].join("."), z = e.getState().getShadowValue(R);
  if (z === void 0)
    return null;
  const S = I({
    currentState: z,
    path: h,
    componentId: a
  }), W = E(S, g, y);
  return /* @__PURE__ */ it("div", { ref: H, children: W });
}
function Qt({
  stateKey: t,
  path: a,
  rebuildStateShape: h,
  renderFn: g,
  formOpts: y,
  setState: I
}) {
  const [E] = at(() => nt()), [, l] = at({}), f = [t, ...a].join(".");
  Ot(t, E, l);
  const P = e.getState().getShadowValue(f), [M, o] = at(P), m = q(!1), b = q(null);
  et(() => {
    !m.current && !ct(P, M) && o(P);
  }, [P]), et(() => {
    const W = e.getState().subscribeToPath(f, (B) => {
      !m.current && M !== B && l({});
    });
    return () => {
      W(), b.current && (clearTimeout(b.current), m.current = !1);
    };
  }, []);
  const H = ut(
    (W) => {
      typeof P === "number" && typeof W == "string" && (W = W === "" ? 0 : Number(W)), o(W), m.current = !0, b.current && clearTimeout(b.current);
      const p = y?.debounceTime ?? 200;
      b.current = setTimeout(() => {
        m.current = !1, I(W, a, { updateType: "update" });
        const { getInitialOptions: Y, setShadowMetadata: tt, getShadowMetadata: Q } = e.getState(), r = Y(t)?.validation, n = r?.zodSchemaV4 || r?.zodSchemaV3;
        if (n) {
          const s = e.getState().getShadowValue(t), i = n.safeParse(s), u = Q(t, a) || {};
          if (i.success)
            tt(t, a, {
              ...u,
              validation: {
                status: "VALID_LIVE",
                validatedValue: W
              }
            });
          else {
            const d = ("issues" in i.error ? i.error.issues : i.error.errors).filter(
              (k) => JSON.stringify(k.path) === JSON.stringify(a)
            );
            d.length > 0 ? tt(t, a, {
              ...u,
              validation: {
                status: "INVALID_LIVE",
                message: d[0]?.message,
                validatedValue: W
              }
            }) : tt(t, a, {
              ...u,
              validation: {
                status: "VALID_LIVE",
                validatedValue: W
              }
            });
          }
        }
      }, p), l({});
    },
    [I, a, y?.debounceTime, t]
  ), R = ut(async () => {
    console.log("handleBlur triggered"), b.current && (clearTimeout(b.current), b.current = null, m.current = !1, I(M, a, { updateType: "update" }));
    const { getInitialOptions: W } = e.getState(), B = W(t)?.validation, p = B?.zodSchemaV4 || B?.zodSchemaV3;
    if (!p) return;
    const Y = e.getState().getShadowMetadata(t, a);
    e.getState().setShadowMetadata(t, a, {
      ...Y,
      validation: {
        status: "DIRTY",
        validatedValue: M
      }
    });
    const tt = e.getState().getShadowValue(t), Q = p.safeParse(tt);
    if (console.log("result ", Q), Q.success)
      e.getState().setShadowMetadata(t, a, {
        ...Y,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: M
        }
      });
    else {
      const r = "issues" in Q.error ? Q.error.issues : Q.error.errors;
      console.log("All validation errors:", r), console.log("Current blur path:", a);
      const n = r.filter((s) => {
        if (console.log("Processing error:", s), a.some((u) => u.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const u = a[0].startsWith("id:") ? [] : a.slice(0, -1);
          console.log("Parent path:", u);
          const c = e.getState().getShadowMetadata(t, u);
          if (console.log("Array metadata:", c), c?.arrayKeys) {
            const d = [t, ...a.slice(0, -1)].join("."), k = c.arrayKeys.indexOf(d);
            console.log("Item key:", d, "Index:", k);
            const T = [...u, k, ...a.slice(-1)], D = JSON.stringify(s.path) === JSON.stringify(T);
            return console.log("Zod path comparison:", {
              zodPath: T,
              errorPath: s.path,
              match: D
            }), D;
          }
        }
        const i = JSON.stringify(s.path) === JSON.stringify(a);
        return console.log("Direct path comparison:", {
          errorPath: s.path,
          currentPath: a,
          match: i
        }), i;
      });
      console.log("Filtered path errors:", n), e.getState().setShadowMetadata(t, a, {
        ...Y,
        validation: {
          status: "VALIDATION_FAILED",
          message: n[0]?.message,
          validatedValue: M
        }
      });
    }
    l({});
  }, [t, a, M, I]), z = h({
    currentState: P,
    path: a,
    componentId: E
  }), S = new Proxy(z, {
    get(W, B) {
      return B === "inputProps" ? {
        value: M ?? "",
        onChange: (p) => {
          H(p.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: R,
        ref: vt.getState().getFormRef(t + "." + a.join("."))
      } : W[B];
    }
  });
  return /* @__PURE__ */ it(Ct, { formOpts: y, path: a, stateKey: t, children: g(S) });
}
function Ot(t, a, h) {
  const g = `${t}////${a}`;
  St(() => {
    const { registerComponent: y, unregisterComponent: I } = e.getState();
    return y(t, g, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      I(t, g);
    };
  }, [t, g]);
}
export {
  bt as $cogsSignal,
  ce as addStateOptions,
  Wt as createCogsState,
  le as createCogsStateFromSync,
  de as notifyComponent,
  Bt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
