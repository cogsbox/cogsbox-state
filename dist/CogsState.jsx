"use client";
import { jsx as ot, Fragment as Ot } from "react/jsx-runtime";
import { memo as Ut, useState as tt, useRef as G, useCallback as ct, useEffect as X, useLayoutEffect as ft, useMemo as gt, createElement as lt, startTransition as Rt } from "react";
import { createRoot as At } from "react-dom/client";
import { transformStateFunc as Nt, isFunction as at, isArray as Tt, getDifferences as Pt, isDeepEqual as st } from "./utility.js";
import { ValidationWrapper as _t } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as rt } from "uuid";
import { getGlobalStore as e, formRefStore as vt } from "./store.js";
import { useCogsConfig as Ct } from "./CogsStateClient.jsx";
import { useInView as jt } from "react-intersection-observer";
function yt(t, a) {
  const h = e.getState().getInitialOptions, g = e.getState().setInitialStateOptions, p = h(t) || {};
  g(t, {
    ...p,
    ...a
  });
}
function Vt({
  stateKey: t,
  options: a,
  initialOptionsPart: h
}) {
  const g = nt(t) || {}, p = h[t] || {}, I = e.getState().setInitialStateOptions, V = { ...p, ...g };
  let l = !1;
  if (a)
    for (const d in a)
      V.hasOwnProperty(d) ? (d == "localStorage" && a[d] && V[d].key !== a[d]?.key && (l = !0, V[d] = a[d]), d == "defaultState" && a[d] && V[d] !== a[d] && !st(V[d], a[d]) && (l = !0, V[d] = a[d])) : (l = !0, V[d] = a[d]);
  l && I(t, V);
}
function ie(t, { formElements: a, validation: h }) {
  return { initialState: t, formElements: a, validation: h };
}
const Lt = (t, a) => {
  let h = t;
  const [g, p] = Nt(h);
  a?.__fromSyncSchema && a?.__syncNotifications && e.getState().setInitialStateOptions("__notifications", a.__syncNotifications), a?.__fromSyncSchema && a?.__apiParamsMap && e.getState().setInitialStateOptions("__apiParamsMap", a.__apiParamsMap), Object.keys(g).forEach((l) => {
    let d = p[l] || {};
    const C = {
      ...d
    };
    if (a?.formElements && (C.formElements = {
      ...a.formElements,
      ...d.formElements || {}
    }), a?.validation && (C.validation = {
      ...a.validation,
      ...d.validation || {}
    }, a.validation.key && !d.validation?.key && (C.validation.key = `${a.validation.key}.${l}`)), Object.keys(C).length > 0) {
      const M = nt(l);
      M ? e.getState().setInitialStateOptions(l, {
        ...M,
        ...C
      }) : e.getState().setInitialStateOptions(l, C);
    }
  }), Object.keys(g).forEach((l) => {
    e.getState().initializeShadowState(l, g[l]);
  });
  const I = (l, d) => {
    const [C] = tt(d?.componentId ?? rt()), M = a?.__apiParamsMap?.[l], c = {
      ...d,
      apiParamsSchema: M
      // Add the schema here
    };
    Vt({
      stateKey: l,
      options: c,
      initialOptionsPart: p
    });
    const m = e.getState().getShadowValue(l) || g[l], T = d?.modifyState ? d.modifyState(m) : m;
    return zt(T, {
      stateKey: l,
      syncUpdate: d?.syncUpdate,
      componentId: C,
      localStorage: d?.localStorage,
      middleware: d?.middleware,
      reactiveType: d?.reactiveType,
      reactiveDeps: d?.reactiveDeps,
      defaultState: d?.defaultState,
      dependencies: d?.dependencies,
      serverState: d?.serverState
    });
  };
  function V(l, d) {
    Vt({ stateKey: l, options: d, initialOptionsPart: p }), d.localStorage && xt(l, d), it(l);
  }
  return { useCogsState: I, setCogsOptions: V };
};
function ce(t) {
  const a = t.schemas, h = {}, g = {};
  for (const p in a) {
    const I = a[p];
    h[p] = I?.schemas?.defaultValues || {}, I?.apiParamsSchema && (g[p] = I.apiParamsSchema);
  }
  return Lt(h, {
    __fromSyncSchema: !0,
    __syncNotifications: t.notifications,
    __apiParamsMap: g
    // Pass the apiParams schemas
  });
}
const {
  getInitialOptions: nt,
  getValidationErrors: le,
  setStateLog: Wt,
  updateInitialStateGlobal: kt,
  addValidationError: pt,
  removeValidationError: dt
} = e.getState(), Ht = (t, a, h, g, p) => {
  h?.log && console.log(
    "saving to localstorage",
    a,
    h.localStorage?.key,
    g
  );
  const I = at(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (I && g) {
    const V = `${g}-${a}-${I}`;
    let l;
    try {
      l = ht(V)?.lastSyncedWithServer;
    } catch {
    }
    const d = e.getState().getShadowMetadata(a, []), C = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: d?.stateSource,
      baseServerState: d?.baseServerState
    }, M = Ft.serialize(C);
    window.localStorage.setItem(
      V,
      JSON.stringify(M.json)
    );
  }
}, ht = (t) => {
  if (!t) return null;
  try {
    const a = window.localStorage.getItem(t);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, xt = (t, a) => {
  const h = e.getState().getShadowValue(t), { sessionId: g } = Ct(), p = at(a?.localStorage?.key) ? a.localStorage.key(h) : a?.localStorage?.key;
  if (p && g) {
    const I = ht(
      `${g}-${t}-${p}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return it(t), !0;
  }
  return !1;
}, it = (t) => {
  const a = e.getState().getShadowMetadata(t, []);
  if (!a) return;
  const h = /* @__PURE__ */ new Set();
  a?.components?.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || h.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((g) => g());
  });
}, ue = (t, a) => {
  const h = e.getState().getShadowMetadata(t, []);
  if (h) {
    const g = `${t}////${a}`, p = h?.components?.get(g);
    if ((p ? Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"] : null)?.includes("none"))
      return;
    p && p.forceUpdate();
  }
};
function wt(t, a, h, g) {
  const p = e.getState(), I = p.getShadowMetadata(t, a);
  if (p.setShadowMetadata(t, a, {
    ...I,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: g || Date.now()
  }), Array.isArray(h)) {
    const V = p.getShadowMetadata(t, a);
    V?.arrayKeys && V.arrayKeys.forEach((l, d) => {
      const C = l.split(".").slice(1), M = h[d];
      M !== void 0 && wt(
        t,
        C,
        M,
        g
      );
    });
  } else h && typeof h == "object" && h.constructor === Object && Object.keys(h).forEach((V) => {
    const l = [...a, V], d = h[V];
    wt(t, l, d, g);
  });
}
function zt(t, {
  stateKey: a,
  localStorage: h,
  formElements: g,
  reactiveDeps: p,
  reactiveType: I,
  componentId: V,
  defaultState: l,
  syncUpdate: d,
  dependencies: C,
  serverState: M,
  apiParamsSchema: c
} = {}) {
  const [m, T] = tt({}), { sessionId: F } = Ct();
  let j = !a;
  const [u] = tt(a ?? rt()), Z = e.getState().stateLog[u], L = G(/* @__PURE__ */ new Set()), H = G(V ?? rt()), y = G(
    null
  );
  y.current = nt(u) ?? null, X(() => {
    if (d && d.stateKey === u && d.path?.[0]) {
      const s = `${d.stateKey}:${d.path.join(".")}`;
      e.getState().setSyncInfo(s, {
        timeStamp: d.timeStamp,
        userId: d.userId
      });
    }
  }, [d]);
  const K = ct(
    (s) => {
      const n = s ? { ...nt(u), ...s } : nt(u), S = n?.defaultState || l || t;
      if (n?.serverState?.status === "success" && n?.serverState?.data !== void 0)
        return {
          value: n.serverState.data,
          source: "server",
          timestamp: n.serverState.timestamp || Date.now()
        };
      if (n?.localStorage?.key && F) {
        const b = at(n.localStorage.key) ? n.localStorage.key(S) : n.localStorage.key, E = ht(
          `${F}-${u}-${b}`
        );
        if (E && E.lastUpdated > (n?.serverState?.timestamp || 0))
          return {
            value: E.state,
            source: "localStorage",
            timestamp: E.lastUpdated
          };
      }
      return {
        value: S || t,
        source: "default",
        timestamp: Date.now()
      };
    },
    [u, l, t, F]
  );
  X(() => {
    e.getState().setServerStateUpdate(u, M);
  }, [M, u]), X(() => e.getState().subscribeToPath(u, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const n = r.serverState;
      if (n?.status === "success" && n.data !== void 0) {
        yt(u, { serverState: n });
        const f = typeof n.merge == "object" ? n.merge : n.merge === !0 ? {} : null, b = e.getState().getShadowValue(u), E = n.data;
        if (f && Array.isArray(b) && Array.isArray(E)) {
          const k = f.key || "id", R = new Set(
            b.map((N) => N[k])
          ), q = E.filter((N) => !R.has(N[k]));
          q.length > 0 && q.forEach((N) => {
            e.getState().insertShadowArrayElement(u, [], N);
            const W = e.getState().getShadowMetadata(u, []);
            if (W?.arrayKeys) {
              const x = W.arrayKeys[W.arrayKeys.length - 1];
              if (x) {
                const A = x.split(".").slice(1);
                e.getState().setShadowMetadata(u, A, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: n.timestamp || Date.now()
                });
                const P = e.getState().getShadowValue(x);
                P && typeof P == "object" && !Array.isArray(P) && Object.keys(P).forEach((U) => {
                  const v = [...A, U];
                  e.getState().setShadowMetadata(u, v, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: n.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          e.getState().initializeShadowState(u, E), wt(
            u,
            [],
            E,
            n.timestamp
          );
        const O = e.getState().getShadowMetadata(u, []);
        e.getState().setShadowMetadata(u, [], {
          ...O,
          stateSource: "server",
          lastServerSync: n.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [u, K]), X(() => {
    const s = e.getState().getShadowMetadata(u, []);
    if (s && s.stateSource)
      return;
    const r = nt(u);
    if (r?.defaultState !== void 0 || l !== void 0) {
      const n = r?.defaultState || l;
      r?.defaultState || yt(u, {
        defaultState: n
      });
      const { value: S, source: f, timestamp: b } = K();
      e.getState().initializeShadowState(u, S), e.getState().setShadowMetadata(u, [], {
        stateSource: f,
        lastServerSync: f === "server" ? b : void 0,
        isDirty: !1,
        baseServerState: f === "server" ? S : void 0
      }), it(u);
    }
  }, [u, ...C || []]), ft(() => {
    j && yt(u, {
      formElements: g,
      defaultState: l,
      localStorage: h,
      middleware: y.current?.middleware
    });
    const s = `${u}////${H.current}`, r = e.getState().getShadowMetadata(u, []), n = r?.components || /* @__PURE__ */ new Map();
    return n.set(s, {
      forceUpdate: () => T({}),
      reactiveType: I ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: p || void 0,
      deps: p ? p(e.getState().getShadowValue(u)) : [],
      prevDeps: p ? p(e.getState().getShadowValue(u)) : []
    }), e.getState().setShadowMetadata(u, [], {
      ...r,
      components: n
    }), T({}), () => {
      const S = e.getState().getShadowMetadata(u, []), f = S?.components?.get(s);
      f?.paths && f.paths.forEach((b) => {
        const O = b.split(".").slice(1), k = e.getState().getShadowMetadata(u, O);
        k?.pathComponents && k.pathComponents.size === 0 && (delete k.pathComponents, e.getState().setShadowMetadata(u, O, k));
      }), S?.components && e.getState().setShadowMetadata(u, [], S);
    };
  }, []);
  const Y = G(null), et = (s, r, n) => {
    const S = [u, ...r].join(".");
    if (Array.isArray(r)) {
      const A = `${u}-${r.join(".")}`;
      L.current.add(A);
    }
    const f = e.getState(), b = f.getShadowMetadata(u, r), E = f.getShadowValue(S), O = n.updateType === "insert" && at(s) ? s({ state: E, uuid: rt() }) : at(s) ? s(E) : s, R = {
      timeStamp: Date.now(),
      stateKey: u,
      path: r,
      updateType: n.updateType,
      status: "new",
      oldValue: E,
      newValue: O
    };
    switch (n.updateType) {
      case "insert": {
        f.insertShadowArrayElement(u, r, R.newValue), f.markAsDirty(u, r, { bubble: !0 });
        const A = f.getShadowMetadata(u, r);
        if (A?.arrayKeys) {
          const P = A.arrayKeys[A.arrayKeys.length - 1];
          if (P) {
            const U = P.split(".").slice(1);
            f.markAsDirty(u, U, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const A = r.slice(0, -1);
        f.removeShadowArrayElement(u, r), f.markAsDirty(u, A, { bubble: !0 });
        break;
      }
      case "update": {
        f.updateShadowAtPath(u, r, R.newValue), f.markAsDirty(u, r, { bubble: !0 });
        break;
      }
    }
    if (n.sync !== !1 && Y.current && Y.current.connected && Y.current.updateState({ operation: R }), b?.signals && b.signals.length > 0) {
      const A = n.updateType === "cut" ? null : O;
      b.signals.forEach(({ parentId: P, position: U, effect: v }) => {
        const w = document.querySelector(`[data-parent-id="${P}"]`);
        if (w) {
          const D = Array.from(w.childNodes);
          if (D[U]) {
            let $ = A;
            if (v && A !== null)
              try {
                $ = new Function(
                  "state",
                  `return (${v})(state)`
                )(A);
              } catch (_) {
                console.error("Error evaluating effect function:", _);
              }
            $ != null && typeof $ == "object" && ($ = JSON.stringify($)), D[U].textContent = String($ ?? "");
          }
        }
      });
    }
    if (n.updateType === "insert" && b?.mapWrappers && b.mapWrappers.length > 0) {
      const A = f.getShadowMetadata(u, r)?.arrayKeys || [], P = A[A.length - 1], U = f.getShadowValue(P), v = f.getShadowValue(
        [u, ...r].join(".")
      );
      if (!P || U === void 0) return;
      b.mapWrappers.forEach((w) => {
        let D = !0, $ = -1;
        if (w.meta?.transforms && w.meta.transforms.length > 0) {
          for (const _ of w.meta.transforms)
            if (_.type === "filter" && !_.fn(U, -1)) {
              D = !1;
              break;
            }
          if (D) {
            const _ = It(
              u,
              r,
              w.meta.transforms
            ), B = w.meta.transforms.find(
              (z) => z.type === "sort"
            );
            if (B) {
              const z = _.map((J) => ({
                key: J,
                value: f.getShadowValue(J)
              }));
              z.push({ key: P, value: U }), z.sort((J, Q) => B.fn(J.value, Q.value)), $ = z.findIndex(
                (J) => J.key === P
              );
            } else
              $ = _.length;
          }
        } else
          D = !0, $ = A.length - 1;
        if (D && w.containerRef && w.containerRef.isConnected) {
          const _ = document.createElement("div");
          _.setAttribute("data-item-path", P);
          const B = Array.from(w.containerRef.children);
          $ >= 0 && $ < B.length ? w.containerRef.insertBefore(
            _,
            B[$]
          ) : w.containerRef.appendChild(_);
          const z = At(_), J = rt(), Q = P.split(".").slice(1), ut = w.rebuildStateShape({
            path: w.path,
            currentState: v,
            componentId: w.componentId,
            meta: w.meta
          });
          z.render(
            lt(Mt, {
              stateKey: u,
              itemComponentId: J,
              itemPath: Q,
              localIndex: $,
              arraySetter: ut,
              rebuildStateShape: w.rebuildStateShape,
              renderFn: w.mapFn
            })
          );
        }
      });
    }
    if (n.updateType === "cut") {
      const A = r.slice(0, -1), P = f.getShadowMetadata(u, A);
      P?.mapWrappers && P.mapWrappers.length > 0 && P.mapWrappers.forEach((U) => {
        if (U.containerRef && U.containerRef.isConnected) {
          const v = U.containerRef.querySelector(
            `[data-item-path="${S}"]`
          );
          v && v.remove();
        }
      });
    }
    const N = e.getState().getShadowValue(u), W = e.getState().getShadowMetadata(u, []), x = /* @__PURE__ */ new Set();
    if (console.log(
      "rootMeta",
      u,
      e.getState().shadowStateStore
    ), !W?.components)
      return N;
    if (n.updateType === "update") {
      let A = [...r];
      for (; ; ) {
        const P = f.getShadowMetadata(u, A);
        if (P?.pathComponents && P.pathComponents.forEach((U) => {
          if (x.has(U))
            return;
          const v = W.components?.get(U);
          v && ((Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"]).includes("none") || (v.forceUpdate(), x.add(U)));
        }), A.length === 0)
          break;
        A.pop();
      }
      O && typeof O == "object" && !Tt(O) && E && typeof E == "object" && !Tt(E) && Pt(O, E).forEach((U) => {
        const v = U.split("."), w = [...r, ...v], D = f.getShadowMetadata(u, w);
        D?.pathComponents && D.pathComponents.forEach(($) => {
          if (x.has($))
            return;
          const _ = W.components?.get($);
          _ && ((Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"]).includes("none") || (_.forceUpdate(), x.add($)));
        });
      });
    } else if (n.updateType === "insert" || n.updateType === "cut") {
      const A = n.updateType === "insert" ? r : r.slice(0, -1), P = f.getShadowMetadata(u, A);
      if (P?.signals && P.signals.length > 0) {
        const U = [u, ...A].join("."), v = f.getShadowValue(U);
        P.signals.forEach(({ parentId: w, position: D, effect: $ }) => {
          const _ = document.querySelector(
            `[data-parent-id="${w}"]`
          );
          if (_) {
            const B = Array.from(_.childNodes);
            if (B[D]) {
              let z = v;
              if ($)
                try {
                  z = new Function(
                    "state",
                    `return (${$})(state)`
                  )(v);
                } catch (J) {
                  console.error("Error evaluating effect function:", J), z = v;
                }
              z != null && typeof z == "object" && (z = JSON.stringify(z)), B[D].textContent = String(z ?? "");
            }
          }
        });
      }
      P?.pathComponents && P.pathComponents.forEach((U) => {
        if (!x.has(U)) {
          const v = W.components?.get(U);
          v && (v.forceUpdate(), x.add(U));
        }
      });
    }
    return W.components.forEach((A, P) => {
      if (x.has(P))
        return;
      const U = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
      if (U.includes("all")) {
        A.forceUpdate(), x.add(P);
        return;
      }
      if (U.includes("deps") && A.depsFunction) {
        const v = f.getShadowValue(u), w = A.depsFunction(v);
        let D = !1;
        w === !0 ? D = !0 : Array.isArray(w) && (st(A.prevDeps, w) || (A.prevDeps = w, D = !0)), D && (A.forceUpdate(), x.add(P));
      }
    }), x.clear(), Wt(u, (A) => {
      const P = [...A ?? [], R], U = /* @__PURE__ */ new Map();
      return P.forEach((v) => {
        const w = `${v.stateKey}:${JSON.stringify(v.path)}`, D = U.get(w);
        D ? (D.timeStamp = Math.max(D.timeStamp, v.timeStamp), D.newValue = v.newValue, D.oldValue = D.oldValue ?? v.oldValue, D.updateType = v.updateType) : U.set(w, { ...v });
      }), Array.from(U.values());
    }), Ht(
      O,
      u,
      y.current,
      F
    ), y.current?.middleware && y.current.middleware({
      updateLog: Z,
      update: R
    }), N;
  };
  e.getState().initialStateGlobal[u] || kt(u, t);
  const o = gt(() => Dt(
    u,
    et,
    H.current,
    F
  ), [u, F]), i = y.current?.cogsSync;
  return i && (Y.current = i(o)), o;
}
function Bt(t) {
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
  let p = g.map((I) => ({
    key: I,
    value: e.getState().getShadowValue(I)
  }));
  for (const I of h)
    I.type === "filter" ? p = p.filter(
      ({ value: V }, l) => I.fn(V, l)
    ) : I.type === "sort" && p.sort((V, l) => I.fn(V.value, l.value));
  return p.map(({ key: I }) => I);
}, Et = (t, a, h) => {
  const g = `${t}////${a}`, { addPathComponent: p, getShadowMetadata: I } = e.getState(), l = I(t, [])?.components?.get(g);
  !l || l.reactiveType === "none" || !(Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType]).includes("component") || p(t, h, g);
}, St = (t, a, h) => {
  const g = e.getState(), p = g.getShadowMetadata(t, []), I = /* @__PURE__ */ new Set();
  p?.components && p.components.forEach((l, d) => {
    (Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"]).includes("all") && (l.forceUpdate(), I.add(d));
  }), g.getShadowMetadata(t, [...a, "getSelected"])?.pathComponents?.forEach((l) => {
    p?.components?.get(l)?.forceUpdate();
  });
  const V = g.getShadowMetadata(t, a);
  for (let l of V?.arrayKeys || []) {
    const d = l + ".selected", C = g.getShadowMetadata(
      t,
      d.split(".").slice(1)
    );
    l == h && C?.pathComponents?.forEach((M) => {
      p?.components?.get(M)?.forceUpdate();
    });
  }
};
function Dt(t, a, h, g) {
  const p = /* @__PURE__ */ new Map();
  let I = 0;
  const V = (M) => {
    const c = M.join(".");
    for (const [m] of p)
      (m === c || m.startsWith(c + ".")) && p.delete(m);
    I++;
  };
  function l({
    currentState: M,
    path: c = [],
    meta: m,
    componentId: T
  }) {
    const F = c.map(String).join("."), j = [t, ...c].join(".");
    M = e.getState().getShadowValue(j, m?.validIds);
    const u = function() {
      return e().getShadowValue(t, c);
    }, Z = {
      apply(H, y, K) {
      },
      get(H, y) {
        if (y === "_rebuildStateShape")
          return l;
        if (Object.getOwnPropertyNames(d).includes(y) && c.length === 0)
          return d[y];
        if (y === "getDifferences")
          return () => {
            const o = e.getState().getShadowMetadata(t, []), i = e.getState().getShadowValue(t);
            let s;
            return o?.stateSource === "server" && o.baseServerState ? s = o.baseServerState : s = e.getState().initialStateGlobal[t], Pt(i, s);
          };
        if (y === "sync" && c.length === 0)
          return async function() {
            const o = e.getState().getInitialOptions(t), i = o?.sync;
            if (!i)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const s = e.getState().getShadowValue(t, []), r = o?.validation?.key;
            try {
              const n = await i.action(s);
              if (n && !n.success && n.errors && r && (e.getState().removeValidationError(r), n.errors.forEach((S) => {
                const f = [r, ...S.path].join(".");
                e.getState().addValidationError(f, S.message);
              }), it(t)), n?.success) {
                const S = e.getState().getShadowMetadata(t, []);
                e.getState().setShadowMetadata(t, [], {
                  ...S,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: s
                  // Update base server state
                }), i.onSuccess && i.onSuccess(n.data);
              } else !n?.success && i.onError && i.onError(n.error);
              return n;
            } catch (n) {
              return i.onError && i.onError(n), { success: !1, error: n };
            }
          };
        if (y === "_status" || y === "getStatus") {
          const o = () => {
            const i = e.getState().getShadowMetadata(t, c), s = e.getState().getShadowValue(j);
            return i?.isDirty === !0 ? "dirty" : i?.isDirty === !1 || i?.stateSource === "server" ? "synced" : i?.stateSource === "localStorage" ? "restored" : i?.stateSource === "default" ? "fresh" : e.getState().getShadowMetadata(t, [])?.stateSource === "server" && !i?.isDirty ? "synced" : s !== void 0 && !i ? "fresh" : "unknown";
          };
          return y === "_status" ? o() : o;
        }
        if (y === "removeStorage")
          return () => {
            const o = e.getState().initialStateGlobal[t], i = nt(t), s = at(i?.localStorage?.key) ? i.localStorage.key(o) : i?.localStorage?.key, r = `${g}-${t}-${s}`;
            r && localStorage.removeItem(r);
          };
        if (y === "showValidationErrors")
          return () => {
            const o = e.getState().getShadowMetadata(t, c);
            return o?.validation?.status === "VALIDATION_FAILED" && o.validation.message ? [o.validation.message] : [];
          };
        if (Array.isArray(M)) {
          if (y === "getSelected")
            return () => {
              const o = t + "." + c.join(".");
              Et(t, T, [
                ...c,
                "getSelected"
              ]);
              const i = e.getState().selectedIndicesMap;
              if (!i || !i.has(o))
                return;
              const s = i.get(o);
              if (m?.validIds && !m.validIds.includes(s))
                return;
              const r = e.getState().getShadowValue(s);
              if (r)
                return l({
                  currentState: r,
                  path: s.split(".").slice(1),
                  componentId: T
                });
            };
          if (y === "getSelectedIndex")
            return () => e.getState().getSelectedIndex(
              t + "." + c.join("."),
              m?.validIds
            );
          if (y === "clearSelected")
            return St(t, c), () => {
              e.getState().clearSelectedIndex({
                arrayKey: t + "." + c.join(".")
              });
            };
          if (y === "useVirtualView")
            return (o) => {
              const {
                itemHeight: i = 50,
                overscan: s = 6,
                stickToBottom: r = !1,
                scrollStickTolerance: n = 75
              } = o, S = G(null), [f, b] = tt({
                startIndex: 0,
                endIndex: 10
              }), [E, O] = tt({}), k = G(!0), R = G({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), q = G(
                /* @__PURE__ */ new Map()
              );
              ft(() => {
                if (!r || !S.current || R.current.isUserScrolling)
                  return;
                const v = S.current;
                v.scrollTo({
                  top: v.scrollHeight,
                  behavior: k.current ? "instant" : "smooth"
                });
              }, [E, r]);
              const N = e.getState().getShadowMetadata(t, c)?.arrayKeys || [], { totalHeight: W, itemOffsets: x } = gt(() => {
                let v = 0;
                const w = /* @__PURE__ */ new Map();
                return (e.getState().getShadowMetadata(t, c)?.arrayKeys || []).forEach(($) => {
                  const _ = $.split(".").slice(1), B = e.getState().getShadowMetadata(t, _)?.virtualizer?.itemHeight || i;
                  w.set($, {
                    height: B,
                    offset: v
                  }), v += B;
                }), q.current = w, { totalHeight: v, itemOffsets: w };
              }, [N.length, i]);
              ft(() => {
                if (r && N.length > 0 && S.current && !R.current.isUserScrolling && k.current) {
                  const v = S.current, w = () => {
                    if (v.clientHeight > 0) {
                      const D = Math.ceil(
                        v.clientHeight / i
                      ), $ = N.length - 1, _ = Math.max(
                        0,
                        $ - D - s
                      );
                      b({ startIndex: _, endIndex: $ }), requestAnimationFrame(() => {
                        P("instant"), k.current = !1;
                      });
                    } else
                      requestAnimationFrame(w);
                  };
                  w();
                }
              }, [N.length, r, i, s]);
              const A = ct(() => {
                const v = S.current;
                if (!v) return;
                const w = v.scrollTop, { scrollHeight: D, clientHeight: $ } = v, _ = R.current, B = D - (w + $), z = _.isNearBottom;
                _.isNearBottom = B <= n, w < _.lastScrollTop ? (_.scrollUpCount++, _.scrollUpCount > 3 && z && (_.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : _.isNearBottom && (_.isUserScrolling = !1, _.scrollUpCount = 0), _.lastScrollTop = w;
                let J = 0;
                for (let Q = 0; Q < N.length; Q++) {
                  const ut = N[Q], mt = q.current.get(ut);
                  if (mt && mt.offset + mt.height > w) {
                    J = Q;
                    break;
                  }
                }
                if (J !== f.startIndex) {
                  const Q = Math.ceil($ / i);
                  b({
                    startIndex: Math.max(0, J - s),
                    endIndex: Math.min(
                      N.length - 1,
                      J + Q + s
                    )
                  });
                }
              }, [
                N.length,
                f.startIndex,
                i,
                s,
                n
              ]);
              X(() => {
                const v = S.current;
                if (!(!v || !r))
                  return v.addEventListener("scroll", A, {
                    passive: !0
                  }), () => {
                    v.removeEventListener("scroll", A);
                  };
              }, [A, r]);
              const P = ct(
                (v = "smooth") => {
                  const w = S.current;
                  if (!w) return;
                  R.current.isUserScrolling = !1, R.current.isNearBottom = !0, R.current.scrollUpCount = 0;
                  const D = () => {
                    const $ = (_ = 0) => {
                      if (_ > 5) return;
                      const B = w.scrollHeight, z = w.scrollTop, J = w.clientHeight;
                      z + J >= B - 1 || (w.scrollTo({
                        top: B,
                        behavior: v
                      }), setTimeout(() => {
                        const Q = w.scrollHeight, ut = w.scrollTop;
                        (Q !== B || ut + J < Q - 1) && $(_ + 1);
                      }, 50));
                    };
                    $();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback(D, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame(D);
                  });
                },
                []
              );
              return X(() => {
                if (!r || !S.current) return;
                const v = S.current, w = R.current;
                let D;
                const $ = () => {
                  clearTimeout(D), D = setTimeout(() => {
                    !w.isUserScrolling && w.isNearBottom && P(
                      k.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, _ = new MutationObserver(() => {
                  w.isUserScrolling || $();
                });
                _.observe(v, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const B = (z) => {
                  z.target instanceof HTMLImageElement && !w.isUserScrolling && $();
                };
                return v.addEventListener("load", B, !0), k.current ? setTimeout(() => {
                  P("instant");
                }, 0) : $(), () => {
                  clearTimeout(D), _.disconnect(), v.removeEventListener("load", B, !0);
                };
              }, [r, N.length, P]), {
                virtualState: gt(() => {
                  const v = e.getState(), w = v.getShadowValue(
                    [t, ...c].join(".")
                  ), D = v.getShadowMetadata(t, c)?.arrayKeys || [], $ = w.slice(
                    f.startIndex,
                    f.endIndex + 1
                  ), _ = D.slice(
                    f.startIndex,
                    f.endIndex + 1
                  );
                  return l({
                    currentState: $,
                    path: c,
                    componentId: T,
                    meta: { ...m, validIds: _ }
                  });
                }, [f.startIndex, f.endIndex, N.length]),
                virtualizerProps: {
                  outer: {
                    ref: S,
                    style: {
                      overflowY: "auto",
                      height: "100%",
                      position: "relative"
                    }
                  },
                  inner: {
                    style: {
                      height: `${W}px`,
                      position: "relative"
                    }
                  },
                  list: {
                    style: {
                      transform: `translateY(${q.current.get(
                        N[f.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: P,
                scrollToIndex: (v, w = "smooth") => {
                  if (S.current && N[v]) {
                    const D = q.current.get(N[v])?.offset || 0;
                    S.current.scrollTo({ top: D, behavior: w });
                  }
                }
              };
            };
          if (y === "stateMap")
            return (o) => {
              const [i, s] = tt(
                m?.validIds ?? e.getState().getShadowMetadata(t, c)?.arrayKeys
              ), r = e.getState().getShadowValue(j, m?.validIds);
              if (!i)
                throw new Error("No array keys found for mapping");
              const n = l({
                currentState: r,
                path: c,
                componentId: T,
                meta: m
              });
              return r.map((S, f) => {
                const b = i[f]?.split(".").slice(1), E = l({
                  currentState: S,
                  path: b,
                  componentId: T,
                  meta: m
                });
                return o(
                  E,
                  f,
                  n
                );
              });
            };
          if (y === "$stateMap")
            return (o) => lt(qt, {
              proxy: {
                _stateKey: t,
                _path: c,
                _mapFn: o,
                _meta: m
              },
              rebuildStateShape: l
            });
          if (y === "stateFind")
            return (o) => {
              const i = m?.validIds ?? e.getState().getShadowMetadata(t, c)?.arrayKeys;
              if (i)
                for (let s = 0; s < i.length; s++) {
                  const r = i[s];
                  if (!r) continue;
                  const n = e.getState().getShadowValue(r);
                  if (o(n, s)) {
                    const S = r.split(".").slice(1);
                    return l({
                      currentState: n,
                      path: S,
                      componentId: T,
                      meta: m
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (y === "stateFilter")
            return (o) => {
              const i = m?.validIds ?? e.getState().getShadowMetadata(t, c)?.arrayKeys;
              if (!i)
                throw new Error("No array keys found for filtering.");
              const s = [], r = M.filter(
                (n, S) => o(n, S) ? (s.push(i[S]), !0) : !1
              );
              return l({
                currentState: r,
                path: c,
                componentId: T,
                meta: {
                  validIds: s,
                  transforms: [
                    ...m?.transforms || [],
                    {
                      type: "filter",
                      fn: o
                    }
                  ]
                }
              });
            };
          if (y === "stateSort")
            return (o) => {
              const i = m?.validIds ?? e.getState().getShadowMetadata(t, c)?.arrayKeys;
              if (!i)
                throw new Error("No array keys found for sorting");
              const s = M.map((r, n) => ({
                item: r,
                key: i[n]
              }));
              return s.sort((r, n) => o(r.item, n.item)).filter(Boolean), l({
                currentState: s.map((r) => r.item),
                path: c,
                componentId: T,
                meta: {
                  validIds: s.map((r) => r.key),
                  transforms: [
                    ...m?.transforms || [],
                    { type: "sort", fn: o }
                  ]
                }
              });
            };
          if (y === "stream")
            return function(o = {}) {
              const {
                bufferSize: i = 100,
                flushInterval: s = 100,
                bufferStrategy: r = "accumulate",
                store: n,
                onFlush: S
              } = o;
              let f = [], b = !1, E = null;
              const O = (W) => {
                if (!b) {
                  if (r === "sliding" && f.length >= i)
                    f.shift();
                  else if (r === "dropping" && f.length >= i)
                    return;
                  f.push(W), f.length >= i && k();
                }
              }, k = () => {
                if (f.length === 0) return;
                const W = [...f];
                if (f = [], n) {
                  const x = n(W);
                  x !== void 0 && (Array.isArray(x) ? x : [x]).forEach((P) => {
                    a(P, c, {
                      updateType: "insert"
                    });
                  });
                } else
                  W.forEach((x) => {
                    a(x, c, {
                      updateType: "insert"
                    });
                  });
                S?.(W);
              };
              s > 0 && (E = setInterval(k, s));
              const R = rt(), q = e.getState().getShadowMetadata(t, c) || {}, N = q.streams || /* @__PURE__ */ new Map();
              return N.set(R, { buffer: f, flushTimer: E }), e.getState().setShadowMetadata(t, c, {
                ...q,
                streams: N
              }), {
                write: (W) => O(W),
                writeMany: (W) => W.forEach(O),
                flush: () => k(),
                pause: () => {
                  b = !0;
                },
                resume: () => {
                  b = !1, f.length > 0 && k();
                },
                close: () => {
                  k(), E && clearInterval(E);
                  const W = e.getState().getShadowMetadata(t, c);
                  W?.streams && W.streams.delete(R);
                }
              };
            };
          if (y === "stateList")
            return (o) => /* @__PURE__ */ ot(() => {
              const s = G(/* @__PURE__ */ new Map()), r = m?.transforms && m.transforms.length > 0 ? `${T}-${Bt(m.transforms)}` : `${T}-base`, [n, S] = tt({}), { validIds: f, arrayValues: b } = gt(() => {
                const O = e.getState().getShadowMetadata(t, c)?.transformCaches?.get(r);
                let k;
                O && O.validIds ? k = O.validIds : (k = It(
                  t,
                  c,
                  m?.transforms
                ), e.getState().setTransformCache(t, c, r, {
                  validIds: k,
                  computedAt: Date.now(),
                  transforms: m?.transforms || []
                }));
                const R = e.getState().getShadowValue(j, k);
                return {
                  validIds: k,
                  arrayValues: R || []
                };
              }, [r, n]);
              if (X(() => {
                const O = e.getState().subscribeToPath(j, (k) => {
                  if (k.type === "GET_SELECTED")
                    return;
                  const q = e.getState().getShadowMetadata(t, c)?.transformCaches;
                  if (q)
                    for (const N of q.keys())
                      N.startsWith(T) && q.delete(N);
                  (k.type === "INSERT" || k.type === "REMOVE" || k.type === "CLEAR_SELECTION") && S({});
                });
                return () => {
                  O();
                };
              }, [T, j]), !Array.isArray(b))
                return null;
              const E = l({
                currentState: b,
                path: c,
                componentId: T,
                meta: {
                  ...m,
                  validIds: f
                }
              });
              return /* @__PURE__ */ ot(Ot, { children: b.map((O, k) => {
                const R = f[k];
                if (!R)
                  return null;
                let q = s.current.get(R);
                q || (q = rt(), s.current.set(R, q));
                const N = R.split(".").slice(1);
                return lt(Mt, {
                  key: R,
                  stateKey: t,
                  itemComponentId: q,
                  itemPath: N,
                  localIndex: k,
                  arraySetter: E,
                  rebuildStateShape: l,
                  renderFn: o
                });
              }) });
            }, {});
          if (y === "stateFlattenOn")
            return (o) => {
              const i = M;
              p.clear(), I++;
              const s = i.flatMap(
                (r) => r[o] ?? []
              );
              return l({
                currentState: s,
                path: [...c, "[*]", o],
                componentId: T,
                meta: m
              });
            };
          if (y === "index")
            return (o) => {
              const s = e.getState().getShadowMetadata(t, c)?.arrayKeys?.filter(
                (S) => !m?.validIds || m?.validIds && m?.validIds?.includes(S)
              )?.[o];
              if (!s) return;
              const r = e.getState().getShadowValue(s, m?.validIds);
              return l({
                currentState: r,
                path: s.split(".").slice(1),
                componentId: T,
                meta: m
              });
            };
          if (y === "last")
            return () => {
              const o = e.getState().getShadowValue(t, c);
              if (o.length === 0) return;
              const i = o.length - 1, s = o[i], r = [...c, i.toString()];
              return l({
                currentState: s,
                path: r,
                componentId: T,
                meta: m
              });
            };
          if (y === "insert")
            return (o, i) => (a(o, c, { updateType: "insert" }), l({
              currentState: e.getState().getShadowValue(t, c),
              path: c,
              componentId: T,
              meta: m
            }));
          if (y === "uniqueInsert")
            return (o, i, s) => {
              const r = e.getState().getShadowValue(t, c), n = at(o) ? o(r) : o;
              let S = null;
              if (!r.some((b) => {
                const E = i ? i.every(
                  (O) => st(b[O], n[O])
                ) : st(b, n);
                return E && (S = b), E;
              }))
                V(c), a(n, c, { updateType: "insert" });
              else if (s && S) {
                const b = s(S), E = r.map(
                  (O) => st(O, S) ? b : O
                );
                V(c), a(E, c, {
                  updateType: "update"
                });
              }
            };
          if (y === "cut")
            return (o, i) => {
              const s = m?.validIds ?? e.getState().getShadowMetadata(t, c)?.arrayKeys;
              if (!s || s.length === 0) return;
              const r = o == -1 ? s.length - 1 : o !== void 0 ? o : s.length - 1, n = s[r];
              if (!n) return;
              const S = n.split(".").slice(1);
              a(M, S, {
                updateType: "cut"
              });
            };
          if (y === "cutSelected")
            return () => {
              const o = It(
                t,
                c,
                m?.transforms
              );
              if (!o || o.length === 0) return;
              const i = e.getState().selectedIndicesMap.get(j);
              let s = o.findIndex(
                (S) => S === i
              );
              const r = o[s == -1 ? o.length - 1 : s]?.split(".").slice(1);
              e.getState().clearSelectedIndex({ arrayKey: j });
              const n = r?.slice(0, -1);
              St(t, n), a(M, r, {
                updateType: "cut"
              });
            };
          if (y === "cutByValue")
            return (o) => {
              const i = e.getState().getShadowMetadata(t, c), s = m?.validIds ?? i?.arrayKeys;
              if (!s) return;
              let r = null;
              for (const n of s)
                if (e.getState().getShadowValue(n) === o) {
                  r = n;
                  break;
                }
              if (r) {
                const n = r.split(".").slice(1);
                a(null, n, { updateType: "cut" });
              }
            };
          if (y === "toggleByValue")
            return (o) => {
              const i = e.getState().getShadowMetadata(t, c), s = m?.validIds ?? i?.arrayKeys;
              if (!s) return;
              let r = null;
              for (const n of s) {
                const S = e.getState().getShadowValue(n);
                if (console.log("itemValue sdasdasdasd", S), S === o) {
                  r = n;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", r), r) {
                const n = r.split(".").slice(1);
                console.log("itemValue keyToCut", r), a(o, n, {
                  updateType: "cut"
                });
              } else
                a(o, c, { updateType: "insert" });
            };
          if (y === "findWith")
            return (o, i) => {
              const s = e.getState().getShadowMetadata(t, c)?.arrayKeys;
              if (!s)
                throw new Error("No array keys found for sorting");
              let r = null, n = [];
              for (const S of s) {
                let f = e.getState().getShadowValue(S, m?.validIds);
                if (f && f[o] === i) {
                  r = f, n = S.split(".").slice(1);
                  break;
                }
              }
              return l({
                currentState: r,
                path: n,
                componentId: T,
                meta: m
              });
            };
        }
        if (y === "cut") {
          let o = e.getState().getShadowValue(c.join("."));
          return () => {
            a(o, c, { updateType: "cut" });
          };
        }
        if (y === "get")
          return () => (Et(t, T, c), e.getState().getShadowValue(j, m?.validIds));
        if (y === "getState")
          return () => e.getState().getShadowValue(j, m?.validIds);
        if (y === "$derive")
          return (o) => bt({
            _stateKey: t,
            _path: c,
            _effect: o.toString(),
            _meta: m
          });
        if (y === "$get")
          return () => bt({ _stateKey: t, _path: c, _meta: m });
        if (y === "lastSynced") {
          const o = `${t}:${c.join(".")}`;
          return e.getState().getSyncInfo(o);
        }
        if (y == "getLocalStorage")
          return (o) => ht(g + "-" + t + "-" + o);
        if (y === "isSelected") {
          const o = [t, ...c].slice(0, -1);
          if (St(t, c, void 0), Array.isArray(
            e.getState().getShadowValue(o.join("."), m?.validIds)
          )) {
            c[c.length - 1];
            const i = o.join("."), s = e.getState().selectedIndicesMap.get(i), r = t + "." + c.join(".");
            return s === r;
          }
          return;
        }
        if (y === "setSelected")
          return (o) => {
            const i = c.slice(0, -1), s = t + "." + i.join("."), r = t + "." + c.join(".");
            St(t, i, void 0), e.getState().selectedIndicesMap.get(s), o && e.getState().setSelectedIndex(s, r);
          };
        if (y === "toggleSelected")
          return () => {
            const o = c.slice(0, -1), i = t + "." + o.join("."), s = t + "." + c.join(".");
            e.getState().selectedIndicesMap.get(i) === s ? e.getState().clearSelectedIndex({ arrayKey: i }) : e.getState().setSelectedIndex(i, s);
          };
        if (y === "_componentId")
          return T;
        if (c.length == 0) {
          if (y === "addValidation")
            return (o) => {
              const i = e.getState().getInitialOptions(t)?.validation;
              if (!i?.key) throw new Error("Validation key not found");
              dt(i.key), o.forEach((s) => {
                const r = [i.key, ...s.path].join(".");
                pt(r, s.message);
              }), it(t);
            };
          if (y === "applyJsonPatch")
            return (o) => {
              const i = e.getState(), s = i.getShadowMetadata(t, []);
              if (!s?.components) return;
              const r = (S) => !S || S === "/" ? [] : S.split("/").slice(1).map((f) => f.replace(/~1/g, "/").replace(/~0/g, "~")), n = /* @__PURE__ */ new Set();
              for (const S of o) {
                const f = r(S.path);
                switch (S.op) {
                  case "add":
                  case "replace": {
                    const { value: b } = S;
                    i.updateShadowAtPath(t, f, b), i.markAsDirty(t, f, { bubble: !0 });
                    let E = [...f];
                    for (; ; ) {
                      const O = i.getShadowMetadata(
                        t,
                        E
                      );
                      if (console.log("pathMeta", O), O?.pathComponents && O.pathComponents.forEach((k) => {
                        if (!n.has(k)) {
                          const R = s.components?.get(k);
                          R && (R.forceUpdate(), n.add(k));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const b = f.slice(0, -1);
                    i.removeShadowArrayElement(t, f), i.markAsDirty(t, b, { bubble: !0 });
                    let E = [...b];
                    for (; ; ) {
                      const O = i.getShadowMetadata(
                        t,
                        E
                      );
                      if (O?.pathComponents && O.pathComponents.forEach((k) => {
                        if (!n.has(k)) {
                          const R = s.components?.get(k);
                          R && (R.forceUpdate(), n.add(k));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (y === "validateZodSchema")
            return () => {
              const o = e.getState().getInitialOptions(t)?.validation, i = o?.zodSchemaV4 || o?.zodSchemaV3;
              if (!i || !o?.key)
                throw new Error(
                  "Zod schema (v3 or v4) or validation key not found"
                );
              dt(o.key);
              const s = e.getState().getShadowValue(t), r = i.safeParse(s);
              return r.success ? !0 : ("issues" in r.error ? r.error.issues.forEach((n) => {
                const S = [o.key, ...n.path].join(".");
                pt(S, n.message);
              }) : r.error.errors.forEach((n) => {
                const S = [o.key, ...n.path].join(".");
                pt(S, n.message);
              }), it(t), !1);
            };
          if (y === "getComponents")
            return () => e.getState().getShadowMetadata(t, [])?.components;
          if (y === "getAllFormRefs")
            return () => vt.getState().getFormRefsByStateKey(t);
        }
        if (y === "getFormRef")
          return () => vt.getState().getFormRef(t + "." + c.join("."));
        if (y === "validationWrapper")
          return ({
            children: o,
            hideMessage: i
          }) => /* @__PURE__ */ ot(
            _t,
            {
              formOpts: i ? { validation: { message: "" } } : void 0,
              path: c,
              stateKey: t,
              children: o
            }
          );
        if (y === "_stateKey") return t;
        if (y === "_path") return c;
        if (y === "update")
          return (o) => (a(o, c, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const i = e.getState().getShadowMetadata(t, c);
              e.getState().setShadowMetadata(t, c, {
                ...i,
                isDirty: !1,
                // EXPLICITLY set to false, not just undefined
                stateSource: "server",
                // Mark as coming from server
                lastServerSync: Date.now()
                // Add timestamp
              });
              const s = [t, ...c].join(".");
              e.getState().notifyPathSubscribers(s, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (y === "toggle") {
          const o = e.getState().getShadowValue([t, ...c].join("."));
          if (console.log("currentValueAtPath", o), typeof M != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            a(!o, c, {
              updateType: "update"
            });
          };
        }
        if (y === "formElement")
          return (o, i) => /* @__PURE__ */ ot(
            Zt,
            {
              stateKey: t,
              path: c,
              rebuildStateShape: l,
              setState: a,
              formOpts: i,
              renderFn: o
            }
          );
        const Y = [...c, y], et = e.getState().getShadowValue(t, Y);
        return l({
          currentState: et,
          path: Y,
          componentId: T,
          meta: m
        });
      }
    }, L = new Proxy(u, Z);
    return p.set(F, {
      proxy: L,
      stateVersion: I
    }), L;
  }
  const d = {
    removeValidation: (M) => {
      M?.validationKey && dt(M.validationKey);
    },
    revertToInitialState: (M) => {
      const c = e.getState().getInitialOptions(t)?.validation;
      c?.key && dt(c.key), M?.validationKey && dt(M.validationKey);
      const m = e.getState().getShadowMetadata(t, []);
      m?.stateSource === "server" && m.baseServerState ? m.baseServerState : e.getState().initialStateGlobal[t];
      const T = e.getState().initialStateGlobal[t];
      e.getState().clearSelectedIndexesForState(t), p.clear(), I++, e.getState().initializeShadowState(t, T), l({
        currentState: T,
        path: [],
        componentId: h
      });
      const F = nt(t), j = at(F?.localStorage?.key) ? F?.localStorage?.key(T) : F?.localStorage?.key, u = `${g}-${t}-${j}`;
      u && localStorage.removeItem(u);
      const Z = e.getState().getShadowMetadata(t, []);
      return Z && Z?.components?.forEach((L) => {
        L.forceUpdate();
      }), T;
    },
    updateInitialState: (M) => {
      p.clear(), I++;
      const c = Dt(
        t,
        a,
        h,
        g
      ), m = e.getState().initialStateGlobal[t], T = nt(t), F = at(T?.localStorage?.key) ? T?.localStorage?.key(m) : T?.localStorage?.key, j = `${g}-${t}-${F}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Rt(() => {
        kt(t, M), e.getState().initializeShadowState(t, M);
        const u = e.getState().getShadowMetadata(t, []);
        u && u?.components?.forEach((Z) => {
          Z.forceUpdate();
        });
      }), {
        fetchId: (u) => c.get()[u]
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
  return lt(Gt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: a
}) {
  const h = G(null), g = G(`map-${crypto.randomUUID()}`), p = G(!1), I = G(/* @__PURE__ */ new Map());
  X(() => {
    const l = h.current;
    if (!l || p.current) return;
    const d = setTimeout(() => {
      const C = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, M = C.mapWrappers || [];
      M.push({
        instanceId: g.current,
        mapFn: t._mapFn,
        containerRef: l,
        rebuildStateShape: a,
        path: t._path,
        componentId: g.current,
        meta: t._meta
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...C,
        mapWrappers: M
      }), p.current = !0, V();
    }, 0);
    return () => {
      if (clearTimeout(d), g.current) {
        const C = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        C.mapWrappers && (C.mapWrappers = C.mapWrappers.filter(
          (M) => M.instanceId !== g.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, C));
      }
      I.current.forEach((C) => C.unmount());
    };
  }, []);
  const V = () => {
    const l = h.current;
    if (!l) return;
    const d = e.getState().getShadowValue(
      [t._stateKey, ...t._path].join("."),
      t._meta?.validIds
    );
    if (!Array.isArray(d)) return;
    const C = t._meta?.validIds ?? e.getState().getShadowMetadata(t._stateKey, t._path)?.arrayKeys ?? [], M = a({
      currentState: d,
      path: t._path,
      componentId: g.current,
      meta: t._meta
    });
    d.forEach((c, m) => {
      const T = C[m];
      if (!T) return;
      const F = rt(), j = document.createElement("div");
      j.setAttribute("data-item-path", T), l.appendChild(j);
      const u = At(j);
      I.current.set(T, u);
      const Z = T.split(".").slice(1);
      u.render(
        lt(Mt, {
          stateKey: t._stateKey,
          itemComponentId: F,
          itemPath: Z,
          localIndex: m,
          arraySetter: M,
          rebuildStateShape: a,
          renderFn: t._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ ot("div", { ref: h, "data-map-container": g.current });
}
function Gt({
  proxy: t
}) {
  const a = G(null), h = G(null), g = G(!1), p = `${t._stateKey}-${t._path.join(".")}`, I = e.getState().getShadowValue(
    [t._stateKey, ...t._path].join("."),
    t._meta?.validIds
  );
  return X(() => {
    const V = a.current;
    if (!V || g.current) return;
    const l = setTimeout(() => {
      if (!V.parentElement) {
        console.warn("Parent element not found for signal", p);
        return;
      }
      const d = V.parentElement, M = Array.from(d.childNodes).indexOf(V);
      let c = d.getAttribute("data-parent-id");
      c || (c = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", c)), h.current = `instance-${crypto.randomUUID()}`;
      const m = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, T = m.signals || [];
      T.push({
        instanceId: h.current,
        parentId: c,
        position: M,
        effect: t._effect
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...m,
        signals: T
      });
      let F = I;
      if (t._effect)
        try {
          F = new Function(
            "state",
            `return (${t._effect})(state)`
          )(I);
        } catch (u) {
          console.error("Error evaluating effect function:", u);
        }
      F !== null && typeof F == "object" && (F = JSON.stringify(F));
      const j = document.createTextNode(String(F ?? ""));
      V.replaceWith(j), g.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(l), h.current) {
        const d = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        d.signals && (d.signals = d.signals.filter(
          (C) => C.instanceId !== h.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, d));
      }
    };
  }, []), lt("span", {
    ref: a,
    style: { display: "contents" },
    "data-signal-id": p
  });
}
const Mt = Ut(
  Yt,
  (t, a) => t.itemPath.join(".") === a.itemPath.join(".") && t.stateKey === a.stateKey && t.itemComponentId === a.itemComponentId && t.localIndex === a.localIndex
), Jt = (t) => {
  const [a, h] = tt(!1);
  return ft(() => {
    if (!t.current) {
      h(!0);
      return;
    }
    const g = Array.from(t.current.querySelectorAll("img"));
    if (g.length === 0) {
      h(!0);
      return;
    }
    let p = 0;
    const I = () => {
      p++, p === g.length && h(!0);
    };
    return g.forEach((V) => {
      V.complete ? I() : (V.addEventListener("load", I), V.addEventListener("error", I));
    }), () => {
      g.forEach((V) => {
        V.removeEventListener("load", I), V.removeEventListener("error", I);
      });
    };
  }, [t.current]), a;
};
function Yt({
  stateKey: t,
  itemComponentId: a,
  itemPath: h,
  localIndex: g,
  arraySetter: p,
  rebuildStateShape: I,
  renderFn: V
}) {
  const [, l] = tt({}), { ref: d, inView: C } = jt(), M = G(null), c = Jt(M), m = G(!1), T = [t, ...h].join(".");
  $t(t, a, l);
  const F = ct(
    (H) => {
      M.current = H, d(H);
    },
    [d]
  );
  X(() => {
    e.getState().subscribeToPath(T, (H) => {
      l({});
    });
  }, []), X(() => {
    if (!C || !c || m.current)
      return;
    const H = M.current;
    if (H && H.offsetHeight > 0) {
      m.current = !0;
      const y = H.offsetHeight;
      e.getState().setShadowMetadata(t, h, {
        virtualizer: {
          itemHeight: y,
          domRef: H
        }
      });
      const K = h.slice(0, -1), Y = [t, ...K].join(".");
      e.getState().notifyPathSubscribers(Y, {
        type: "ITEMHEIGHT",
        itemKey: h.join("."),
        ref: M.current
      });
    }
  }, [C, c, t, h]);
  const j = [t, ...h].join("."), u = e.getState().getShadowValue(j);
  if (u === void 0)
    return null;
  const Z = I({
    currentState: u,
    path: h,
    componentId: a
  }), L = V(Z, g, p);
  return /* @__PURE__ */ ot("div", { ref: F, children: L });
}
function Zt({
  stateKey: t,
  path: a,
  rebuildStateShape: h,
  renderFn: g,
  formOpts: p,
  setState: I
}) {
  const [V] = tt(() => rt()), [, l] = tt({}), d = [t, ...a].join(".");
  $t(t, V, l);
  const C = e.getState().getShadowValue(d), [M, c] = tt(C), m = G(!1), T = G(null);
  X(() => {
    !m.current && !st(C, M) && c(C);
  }, [C]), X(() => {
    const L = e.getState().subscribeToPath(d, (H) => {
      !m.current && M !== H && l({});
    });
    return () => {
      L(), T.current && (clearTimeout(T.current), m.current = !1);
    };
  }, []);
  const F = ct(
    (L) => {
      typeof C === "number" && typeof L == "string" && (L = L === "" ? 0 : Number(L)), c(L), m.current = !0, T.current && clearTimeout(T.current);
      const y = p?.debounceTime ?? 200;
      T.current = setTimeout(() => {
        m.current = !1, I(L, a, { updateType: "update" });
        const { getInitialOptions: K, setShadowMetadata: Y, getShadowMetadata: et } = e.getState(), o = K(t)?.validation, i = o?.zodSchemaV4 || o?.zodSchemaV3;
        if (i) {
          const s = e.getState().getShadowValue(t), r = i.safeParse(s), n = et(t, a) || {};
          if (r.success)
            Y(t, a, {
              ...n,
              validation: {
                status: "VALID_LIVE",
                validatedValue: L
              }
            });
          else {
            const f = ("issues" in r.error ? r.error.issues : r.error.errors).filter(
              (b) => JSON.stringify(b.path) === JSON.stringify(a)
            );
            f.length > 0 ? Y(t, a, {
              ...n,
              validation: {
                status: "INVALID_LIVE",
                message: f[0]?.message,
                validatedValue: L
              }
            }) : Y(t, a, {
              ...n,
              validation: {
                status: "VALID_LIVE",
                validatedValue: L
              }
            });
          }
        }
      }, y), l({});
    },
    [I, a, p?.debounceTime, t]
  ), j = ct(async () => {
    console.log("handleBlur triggered"), T.current && (clearTimeout(T.current), T.current = null, m.current = !1, I(M, a, { updateType: "update" }));
    const { getInitialOptions: L } = e.getState(), H = L(t)?.validation, y = H?.zodSchemaV4 || H?.zodSchemaV3;
    if (!y) return;
    const K = e.getState().getShadowMetadata(t, a);
    e.getState().setShadowMetadata(t, a, {
      ...K,
      validation: {
        status: "DIRTY",
        validatedValue: M
      }
    });
    const Y = e.getState().getShadowValue(t), et = y.safeParse(Y);
    if (console.log("result ", et), et.success)
      e.getState().setShadowMetadata(t, a, {
        ...K,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: M
        }
      });
    else {
      const o = "issues" in et.error ? et.error.issues : et.error.errors;
      console.log("All validation errors:", o), console.log("Current blur path:", a);
      const i = o.filter((s) => {
        if (console.log("Processing error:", s), a.some((n) => n.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const n = a[0].startsWith("id:") ? [] : a.slice(0, -1);
          console.log("Parent path:", n);
          const S = e.getState().getShadowMetadata(t, n);
          if (console.log("Array metadata:", S), S?.arrayKeys) {
            const f = [t, ...a.slice(0, -1)].join("."), b = S.arrayKeys.indexOf(f);
            console.log("Item key:", f, "Index:", b);
            const E = [...n, b, ...a.slice(-1)], O = JSON.stringify(s.path) === JSON.stringify(E);
            return console.log("Zod path comparison:", {
              zodPath: E,
              errorPath: s.path,
              match: O
            }), O;
          }
        }
        const r = JSON.stringify(s.path) === JSON.stringify(a);
        return console.log("Direct path comparison:", {
          errorPath: s.path,
          currentPath: a,
          match: r
        }), r;
      });
      console.log("Filtered path errors:", i), e.getState().setShadowMetadata(t, a, {
        ...K,
        validation: {
          status: "VALIDATION_FAILED",
          message: i[0]?.message,
          validatedValue: M
        }
      });
    }
    l({});
  }, [t, a, M, I]), u = h({
    currentState: C,
    path: a,
    componentId: V
  }), Z = new Proxy(u, {
    get(L, H) {
      return H === "inputProps" ? {
        value: M ?? "",
        onChange: (y) => {
          F(y.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: j,
        ref: vt.getState().getFormRef(t + "." + a.join("."))
      } : L[H];
    }
  });
  return /* @__PURE__ */ ot(_t, { formOpts: p, path: a, stateKey: t, children: g(Z) });
}
function $t(t, a, h) {
  const g = `${t}////${a}`;
  ft(() => {
    const { registerComponent: p, unregisterComponent: I } = e.getState();
    return p(t, g, {
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
  ie as addStateOptions,
  Lt as createCogsState,
  ce as createCogsStateFromSync,
  ue as notifyComponent,
  zt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
