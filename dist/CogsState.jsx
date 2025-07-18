"use client";
import { jsx as ot, Fragment as Ot } from "react/jsx-runtime";
import { memo as Ut, useState as K, useRef as q, useCallback as ct, useEffect as Z, useLayoutEffect as dt, useMemo as gt, createElement as lt, startTransition as Rt } from "react";
import { createRoot as At } from "react-dom/client";
import { transformStateFunc as Nt, isFunction as at, isArray as Tt, getDifferences as Ct, isDeepEqual as st } from "./utility.js";
import { ValidationWrapper as kt } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as rt } from "uuid";
import { getGlobalStore as e, formRefStore as vt } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { useInView as jt } from "react-intersection-observer";
function yt(t, n) {
  const S = e.getState().getInitialOptions, g = e.getState().setInitialStateOptions, y = S(t) || {};
  g(t, {
    ...y,
    ...n
  });
}
function Vt({
  stateKey: t,
  options: n,
  initialOptionsPart: S
}) {
  const g = nt(t) || {}, y = S[t] || {}, w = e.getState().setInitialStateOptions, V = { ...y, ...g };
  let u = !1;
  if (n)
    for (const f in n)
      V.hasOwnProperty(f) ? (f == "localStorage" && n[f] && V[f].key !== n[f]?.key && (u = !0, V[f] = n[f]), f == "defaultState" && n[f] && V[f] !== n[f] && !st(V[f], n[f]) && (u = !0, V[f] = n[f])) : (u = !0, V[f] = n[f]);
  u && w(t, V);
}
function ie(t, { formElements: n, validation: S }) {
  return { initialState: t, formElements: n, validation: S };
}
const Lt = (t, n) => {
  let S = t;
  const [g, y] = Nt(S);
  n?.__fromSyncSchema && n?.__syncNotifications && e.getState().setInitialStateOptions("__notifications", n.__syncNotifications), Object.keys(g).forEach((u) => {
    let f = y[u] || {};
    const A = {
      ...f
    };
    if (n?.formElements && (A.formElements = {
      ...n.formElements,
      ...f.formElements || {}
    }), n?.validation && (A.validation = {
      ...n.validation,
      ...f.validation || {}
    }, n.validation.key && !f.validation?.key && (A.validation.key = `${n.validation.key}.${u}`)), Object.keys(A).length > 0) {
      const I = nt(u);
      I ? e.getState().setInitialStateOptions(u, {
        ...I,
        ...A
      }) : e.getState().setInitialStateOptions(u, A);
    }
  }), Object.keys(g).forEach((u) => {
    e.getState().initializeShadowState(u, g[u]);
  });
  const w = (u, f) => {
    const [A] = K(f?.componentId ?? rt());
    Vt({
      stateKey: u,
      options: f,
      initialOptionsPart: y
    });
    const I = e.getState().getShadowValue(u) || g[u], i = f?.modifyState ? f.modifyState(I) : I;
    return zt(i, {
      stateKey: u,
      syncUpdate: f?.syncUpdate,
      componentId: A,
      localStorage: f?.localStorage,
      middleware: f?.middleware,
      reactiveType: f?.reactiveType,
      reactiveDeps: f?.reactiveDeps,
      defaultState: f?.defaultState,
      dependencies: f?.dependencies,
      serverState: f?.serverState
    });
  };
  function V(u, f) {
    Vt({ stateKey: u, options: f, initialOptionsPart: y }), f.localStorage && xt(u, f), it(u);
  }
  return { useCogsState: w, setCogsOptions: V };
};
function ce(t) {
  t.notifications && e.getState().setInitialStateOptions("__notifications", t.notifications);
  const n = t.schemas, S = {};
  for (const w in n)
    S[w] = n[w]?.schemas?.defaultValues || {};
  const { useCogsState: g, setCogsOptions: y } = Lt(S);
  return {
    useCogsState: g,
    setCogsOptions: y
  };
}
const {
  getInitialOptions: nt,
  getValidationErrors: le,
  setStateLog: Wt,
  updateInitialStateGlobal: _t,
  addValidationError: pt,
  removeValidationError: ut
} = e.getState(), Ht = (t, n, S, g, y) => {
  S?.log && console.log(
    "saving to localstorage",
    n,
    S.localStorage?.key,
    g
  );
  const w = at(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (w && g) {
    const V = `${g}-${n}-${w}`;
    let u;
    try {
      u = St(V)?.lastSyncedWithServer;
    } catch {
    }
    const f = e.getState().getShadowMetadata(n, []), A = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: u,
      stateSource: f?.stateSource,
      baseServerState: f?.baseServerState
    }, I = Ft.serialize(A);
    window.localStorage.setItem(
      V,
      JSON.stringify(I.json)
    );
  }
}, St = (t) => {
  if (!t) return null;
  try {
    const n = window.localStorage.getItem(t);
    return n ? JSON.parse(n) : null;
  } catch (n) {
    return console.error("Error loading from localStorage:", n), null;
  }
}, xt = (t, n) => {
  const S = e.getState().getShadowValue(t), { sessionId: g } = Pt(), y = at(n?.localStorage?.key) ? n.localStorage.key(S) : n?.localStorage?.key;
  if (y && g) {
    const w = St(
      `${g}-${t}-${y}`
    );
    if (w && w.lastUpdated > (w.lastSyncedWithServer || 0))
      return it(t), !0;
  }
  return !1;
}, it = (t) => {
  const n = e.getState().getShadowMetadata(t, []);
  if (!n) return;
  const S = /* @__PURE__ */ new Set();
  n?.components?.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, ue = (t, n) => {
  const S = e.getState().getShadowMetadata(t, []);
  if (S) {
    const g = `${t}////${n}`, y = S?.components?.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
};
function wt(t, n, S, g) {
  const y = e.getState(), w = y.getShadowMetadata(t, n);
  if (y.setShadowMetadata(t, n, {
    ...w,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: g || Date.now()
  }), Array.isArray(S)) {
    const V = y.getShadowMetadata(t, n);
    V?.arrayKeys && V.arrayKeys.forEach((u, f) => {
      const A = u.split(".").slice(1), I = S[f];
      I !== void 0 && wt(
        t,
        A,
        I,
        g
      );
    });
  } else S && typeof S == "object" && S.constructor === Object && Object.keys(S).forEach((V) => {
    const u = [...n, V], f = S[V];
    wt(t, u, f, g);
  });
}
function zt(t, {
  stateKey: n,
  localStorage: S,
  formElements: g,
  reactiveDeps: y,
  reactiveType: w,
  componentId: V,
  defaultState: u,
  syncUpdate: f,
  dependencies: A,
  serverState: I
} = {}) {
  const [i, h] = K({}), { sessionId: M } = Pt();
  let z = !n;
  const [c] = K(n ?? rt()), B = e.getState().stateLog[c], J = q(/* @__PURE__ */ new Set()), H = q(V ?? rt()), W = q(
    null
  );
  W.current = nt(c) ?? null, Z(() => {
    if (f && f.stateKey === c && f.path?.[0]) {
      const o = `${f.stateKey}:${f.path.join(".")}`;
      e.getState().setSyncInfo(o, {
        timeStamp: f.timeStamp,
        userId: f.userId
      });
    }
  }, [f]);
  const m = ct(
    (o) => {
      const a = o ? { ...nt(c), ...o } : nt(c), d = a?.defaultState || u || t;
      if (a?.serverState?.status === "success" && a?.serverState?.data !== void 0)
        return {
          value: a.serverState.data,
          source: "server",
          timestamp: a.serverState.timestamp || Date.now()
        };
      if (a?.localStorage?.key && M) {
        const p = at(a.localStorage.key) ? a.localStorage.key(d) : a.localStorage.key, E = St(
          `${M}-${c}-${p}`
        );
        if (E && E.lastUpdated > (a?.serverState?.timestamp || 0))
          return {
            value: E.state,
            source: "localStorage",
            timestamp: E.lastUpdated
          };
      }
      return {
        value: d || t,
        source: "default",
        timestamp: Date.now()
      };
    },
    [c, u, t, M]
  );
  Z(() => {
    e.getState().setServerStateUpdate(c, I);
  }, [I, c]), Z(() => e.getState().subscribeToPath(c, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const a = r.serverState;
      if (a?.status === "success" && a.data !== void 0) {
        yt(c, { serverState: a });
        const l = typeof a.merge == "object" ? a.merge : a.merge === !0 ? {} : null, p = e.getState().getShadowValue(c), E = a.data;
        if (l && Array.isArray(p) && Array.isArray(E)) {
          const O = l.key || "id", C = new Set(
            p.map((x) => x[O])
          ), F = E.filter((x) => !C.has(x[O]));
          F.length > 0 && F.forEach((x) => {
            e.getState().insertShadowArrayElement(c, [], x);
            const N = e.getState().getShadowMetadata(c, []);
            if (N?.arrayKeys) {
              const j = N.arrayKeys[N.arrayKeys.length - 1];
              if (j) {
                const b = j.split(".").slice(1);
                e.getState().setShadowMetadata(c, b, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: a.timestamp || Date.now()
                });
                const k = e.getState().getShadowValue(j);
                k && typeof k == "object" && !Array.isArray(k) && Object.keys(k).forEach((P) => {
                  const U = [...b, P];
                  e.getState().setShadowMetadata(c, U, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: a.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          e.getState().initializeShadowState(c, E), wt(
            c,
            [],
            E,
            a.timestamp
          );
        const _ = e.getState().getShadowMetadata(c, []);
        e.getState().setShadowMetadata(c, [], {
          ..._,
          stateSource: "server",
          lastServerSync: a.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [c, m]), Z(() => {
    const o = e.getState().getShadowMetadata(c, []);
    if (o && o.stateSource)
      return;
    const r = nt(c);
    if (r?.defaultState !== void 0 || u !== void 0) {
      const a = r?.defaultState || u;
      r?.defaultState || yt(c, {
        defaultState: a
      });
      const { value: d, source: l, timestamp: p } = m();
      e.getState().initializeShadowState(c, d), e.getState().setShadowMetadata(c, [], {
        stateSource: l,
        lastServerSync: l === "server" ? p : void 0,
        isDirty: !1,
        baseServerState: l === "server" ? d : void 0
      }), it(c);
    }
  }, [c, ...A || []]), dt(() => {
    z && yt(c, {
      formElements: g,
      defaultState: u,
      localStorage: S,
      middleware: W.current?.middleware
    });
    const o = `${c}////${H.current}`, r = e.getState().getShadowMetadata(c, []), a = r?.components || /* @__PURE__ */ new Map();
    return a.set(o, {
      forceUpdate: () => h({}),
      reactiveType: w ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: y || void 0,
      deps: y ? y(e.getState().getShadowValue(c)) : [],
      prevDeps: y ? y(e.getState().getShadowValue(c)) : []
    }), e.getState().setShadowMetadata(c, [], {
      ...r,
      components: a
    }), h({}), () => {
      const d = e.getState().getShadowMetadata(c, []), l = d?.components?.get(o);
      l?.paths && l.paths.forEach((p) => {
        const _ = p.split(".").slice(1), O = e.getState().getShadowMetadata(c, _);
        O?.pathComponents && O.pathComponents.size === 0 && (delete O.pathComponents, e.getState().setShadowMetadata(c, _, O));
      }), d?.components && e.getState().setShadowMetadata(c, [], d);
    };
  }, []);
  const Y = q(null), Q = (o, r, a) => {
    const d = [c, ...r].join(".");
    if (Array.isArray(r)) {
      const b = `${c}-${r.join(".")}`;
      J.current.add(b);
    }
    const l = e.getState(), p = l.getShadowMetadata(c, r), E = l.getShadowValue(d), _ = a.updateType === "insert" && at(o) ? o({ state: E, uuid: rt() }) : at(o) ? o(E) : o, C = {
      timeStamp: Date.now(),
      stateKey: c,
      path: r,
      updateType: a.updateType,
      status: "new",
      oldValue: E,
      newValue: _
    };
    switch (a.updateType) {
      case "insert": {
        l.insertShadowArrayElement(c, r, C.newValue), l.markAsDirty(c, r, { bubble: !0 });
        const b = l.getShadowMetadata(c, r);
        if (b?.arrayKeys) {
          const k = b.arrayKeys[b.arrayKeys.length - 1];
          if (k) {
            const P = k.split(".").slice(1);
            l.markAsDirty(c, P, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const b = r.slice(0, -1);
        l.removeShadowArrayElement(c, r), l.markAsDirty(c, b, { bubble: !0 });
        break;
      }
      case "update": {
        l.updateShadowAtPath(c, r, C.newValue), l.markAsDirty(c, r, { bubble: !0 });
        break;
      }
    }
    if (a.sync !== !1 && Y.current && Y.current.connected && Y.current.updateState({ operation: C }), p?.signals && p.signals.length > 0) {
      const b = a.updateType === "cut" ? null : _;
      p.signals.forEach(({ parentId: k, position: P, effect: U }) => {
        const v = document.querySelector(`[data-parent-id="${k}"]`);
        if (v) {
          const T = Array.from(v.childNodes);
          if (T[P]) {
            let $ = b;
            if (U && b !== null)
              try {
                $ = new Function(
                  "state",
                  `return (${U})(state)`
                )(b);
              } catch (D) {
                console.error("Error evaluating effect function:", D);
              }
            $ != null && typeof $ == "object" && ($ = JSON.stringify($)), T[P].textContent = String($ ?? "");
          }
        }
      });
    }
    if (a.updateType === "insert" && p?.mapWrappers && p.mapWrappers.length > 0) {
      const b = l.getShadowMetadata(c, r)?.arrayKeys || [], k = b[b.length - 1], P = l.getShadowValue(k), U = l.getShadowValue(
        [c, ...r].join(".")
      );
      if (!k || P === void 0) return;
      p.mapWrappers.forEach((v) => {
        let T = !0, $ = -1;
        if (v.meta?.transforms && v.meta.transforms.length > 0) {
          for (const D of v.meta.transforms)
            if (D.type === "filter" && !D.fn(P, -1)) {
              T = !1;
              break;
            }
          if (T) {
            const D = It(
              c,
              r,
              v.meta.transforms
            ), R = v.meta.transforms.find(
              (L) => L.type === "sort"
            );
            if (R) {
              const L = D.map((G) => ({
                key: G,
                value: l.getShadowValue(G)
              }));
              L.push({ key: k, value: P }), L.sort((G, tt) => R.fn(G.value, tt.value)), $ = L.findIndex(
                (G) => G.key === k
              );
            } else
              $ = D.length;
          }
        } else
          T = !0, $ = b.length - 1;
        if (T && v.containerRef && v.containerRef.isConnected) {
          const D = document.createElement("div");
          D.setAttribute("data-item-path", k);
          const R = Array.from(v.containerRef.children);
          $ >= 0 && $ < R.length ? v.containerRef.insertBefore(
            D,
            R[$]
          ) : v.containerRef.appendChild(D);
          const L = At(D), G = rt(), tt = k.split(".").slice(1), et = v.rebuildStateShape({
            path: v.path,
            currentState: U,
            componentId: v.componentId,
            meta: v.meta
          });
          L.render(
            lt(Mt, {
              stateKey: c,
              itemComponentId: G,
              itemPath: tt,
              localIndex: $,
              arraySetter: et,
              rebuildStateShape: v.rebuildStateShape,
              renderFn: v.mapFn
            })
          );
        }
      });
    }
    if (a.updateType === "cut") {
      const b = r.slice(0, -1), k = l.getShadowMetadata(c, b);
      k?.mapWrappers && k.mapWrappers.length > 0 && k.mapWrappers.forEach((P) => {
        if (P.containerRef && P.containerRef.isConnected) {
          const U = P.containerRef.querySelector(
            `[data-item-path="${d}"]`
          );
          U && U.remove();
        }
      });
    }
    const x = e.getState().getShadowValue(c), N = e.getState().getShadowMetadata(c, []), j = /* @__PURE__ */ new Set();
    if (console.log(
      "rootMeta",
      c,
      e.getState().shadowStateStore
    ), !N?.components)
      return x;
    if (a.updateType === "update") {
      let b = [...r];
      for (; ; ) {
        const k = l.getShadowMetadata(c, b);
        if (k?.pathComponents && k.pathComponents.forEach((P) => {
          if (j.has(P))
            return;
          const U = N.components?.get(P);
          U && ((Array.isArray(U.reactiveType) ? U.reactiveType : [U.reactiveType || "component"]).includes("none") || (U.forceUpdate(), j.add(P)));
        }), b.length === 0)
          break;
        b.pop();
      }
      _ && typeof _ == "object" && !Tt(_) && E && typeof E == "object" && !Tt(E) && Ct(_, E).forEach((P) => {
        const U = P.split("."), v = [...r, ...U], T = l.getShadowMetadata(c, v);
        T?.pathComponents && T.pathComponents.forEach(($) => {
          if (j.has($))
            return;
          const D = N.components?.get($);
          D && ((Array.isArray(D.reactiveType) ? D.reactiveType : [D.reactiveType || "component"]).includes("none") || (D.forceUpdate(), j.add($)));
        });
      });
    } else if (a.updateType === "insert" || a.updateType === "cut") {
      const b = a.updateType === "insert" ? r : r.slice(0, -1), k = l.getShadowMetadata(c, b);
      if (k?.signals && k.signals.length > 0) {
        const P = [c, ...b].join("."), U = l.getShadowValue(P);
        k.signals.forEach(({ parentId: v, position: T, effect: $ }) => {
          const D = document.querySelector(
            `[data-parent-id="${v}"]`
          );
          if (D) {
            const R = Array.from(D.childNodes);
            if (R[T]) {
              let L = U;
              if ($)
                try {
                  L = new Function(
                    "state",
                    `return (${$})(state)`
                  )(U);
                } catch (G) {
                  console.error("Error evaluating effect function:", G), L = U;
                }
              L != null && typeof L == "object" && (L = JSON.stringify(L)), R[T].textContent = String(L ?? "");
            }
          }
        });
      }
      k?.pathComponents && k.pathComponents.forEach((P) => {
        if (!j.has(P)) {
          const U = N.components?.get(P);
          U && (U.forceUpdate(), j.add(P));
        }
      });
    }
    return N.components.forEach((b, k) => {
      if (j.has(k))
        return;
      const P = Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"];
      if (P.includes("all")) {
        b.forceUpdate(), j.add(k);
        return;
      }
      if (P.includes("deps") && b.depsFunction) {
        const U = l.getShadowValue(c), v = b.depsFunction(U);
        let T = !1;
        v === !0 ? T = !0 : Array.isArray(v) && (st(b.prevDeps, v) || (b.prevDeps = v, T = !0)), T && (b.forceUpdate(), j.add(k));
      }
    }), j.clear(), Wt(c, (b) => {
      const k = [...b ?? [], C], P = /* @__PURE__ */ new Map();
      return k.forEach((U) => {
        const v = `${U.stateKey}:${JSON.stringify(U.path)}`, T = P.get(v);
        T ? (T.timeStamp = Math.max(T.timeStamp, U.timeStamp), T.newValue = U.newValue, T.oldValue = T.oldValue ?? U.oldValue, T.updateType = U.updateType) : P.set(v, { ...U });
      }), Array.from(P.values());
    }), Ht(
      _,
      c,
      W.current,
      M
    ), W.current?.middleware && W.current.middleware({
      updateLog: B,
      update: C
    }), x;
  };
  e.getState().initialStateGlobal[c] || _t(c, t);
  const X = gt(() => Dt(
    c,
    Q,
    H.current,
    M
  ), [c, M]), s = W.current?.cogsSync;
  return s && (Y.current = s(X)), X;
}
function Bt(t) {
  return !t || t.length === 0 ? "" : t.map(
    (n) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${n.type}${JSON.stringify(n.dependencies || [])}`
    )
  ).join("");
}
const It = (t, n, S) => {
  let g = e.getState().getShadowMetadata(t, n)?.arrayKeys || [];
  if (!S || S.length === 0)
    return g;
  let y = g.map((w) => ({
    key: w,
    value: e.getState().getShadowValue(w)
  }));
  for (const w of S)
    w.type === "filter" ? y = y.filter(
      ({ value: V }, u) => w.fn(V, u)
    ) : w.type === "sort" && y.sort((V, u) => w.fn(V.value, u.value));
  return y.map(({ key: w }) => w);
}, Et = (t, n, S) => {
  const g = `${t}////${n}`, { addPathComponent: y, getShadowMetadata: w } = e.getState(), u = w(t, [])?.components?.get(g);
  !u || u.reactiveType === "none" || !(Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType]).includes("component") || y(t, S, g);
}, ft = (t, n, S) => {
  const g = e.getState(), y = g.getShadowMetadata(t, []), w = /* @__PURE__ */ new Set();
  y?.components && y.components.forEach((u, f) => {
    (Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"]).includes("all") && (u.forceUpdate(), w.add(f));
  }), g.getShadowMetadata(t, [...n, "getSelected"])?.pathComponents?.forEach((u) => {
    y?.components?.get(u)?.forceUpdate();
  });
  const V = g.getShadowMetadata(t, n);
  for (let u of V?.arrayKeys || []) {
    const f = u + ".selected", A = g.getShadowMetadata(
      t,
      f.split(".").slice(1)
    );
    u == S && A?.pathComponents?.forEach((I) => {
      y?.components?.get(I)?.forceUpdate();
    });
  }
};
function Dt(t, n, S, g) {
  const y = /* @__PURE__ */ new Map();
  let w = 0;
  const V = (I) => {
    const i = I.join(".");
    for (const [h] of y)
      (h === i || h.startsWith(i + ".")) && y.delete(h);
    w++;
  };
  function u({
    currentState: I,
    path: i = [],
    meta: h,
    componentId: M
  }) {
    const z = i.map(String).join("."), c = [t, ...i].join(".");
    I = e.getState().getShadowValue(c, h?.validIds);
    const B = function() {
      return e().getShadowValue(t, i);
    }, J = {
      apply(W, m, Y) {
      },
      get(W, m) {
        if (m === "_rebuildStateShape")
          return u;
        if (Object.getOwnPropertyNames(f).includes(m) && i.length === 0)
          return f[m];
        if (m === "getDifferences")
          return () => {
            const s = e.getState().getShadowMetadata(t, []), o = e.getState().getShadowValue(t);
            let r;
            return s?.stateSource === "server" && s.baseServerState ? r = s.baseServerState : r = e.getState().initialStateGlobal[t], Ct(o, r);
          };
        if (m === "sync" && i.length === 0)
          return async function() {
            const s = e.getState().getInitialOptions(t), o = s?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = e.getState().getShadowValue(t, []), a = s?.validation?.key;
            try {
              const d = await o.action(r);
              if (d && !d.success && d.errors && a && (e.getState().removeValidationError(a), d.errors.forEach((l) => {
                const p = [a, ...l.path].join(".");
                e.getState().addValidationError(p, l.message);
              }), it(t)), d?.success) {
                const l = e.getState().getShadowMetadata(t, []);
                e.getState().setShadowMetadata(t, [], {
                  ...l,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: r
                  // Update base server state
                }), o.onSuccess && o.onSuccess(d.data);
              } else !d?.success && o.onError && o.onError(d.error);
              return d;
            } catch (d) {
              return o.onError && o.onError(d), { success: !1, error: d };
            }
          };
        if (m === "_status" || m === "getStatus") {
          const s = () => {
            const o = e.getState().getShadowMetadata(t, i), r = e.getState().getShadowValue(c);
            return o?.isDirty === !0 ? "dirty" : o?.isDirty === !1 || o?.stateSource === "server" ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" ? "fresh" : e.getState().getShadowMetadata(t, [])?.stateSource === "server" && !o?.isDirty ? "synced" : r !== void 0 && !o ? "fresh" : "unknown";
          };
          return m === "_status" ? s() : s;
        }
        if (m === "removeStorage")
          return () => {
            const s = e.getState().initialStateGlobal[t], o = nt(t), r = at(o?.localStorage?.key) ? o.localStorage.key(s) : o?.localStorage?.key, a = `${g}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (m === "showValidationErrors")
          return () => {
            const s = e.getState().getShadowMetadata(t, i);
            return s?.validation?.status === "VALIDATION_FAILED" && s.validation.message ? [s.validation.message] : [];
          };
        if (Array.isArray(I)) {
          if (m === "getSelected")
            return () => {
              const s = t + "." + i.join(".");
              Et(t, M, [
                ...i,
                "getSelected"
              ]);
              const o = e.getState().selectedIndicesMap;
              if (!o || !o.has(s))
                return;
              const r = o.get(s);
              if (h?.validIds && !h.validIds.includes(r))
                return;
              const a = e.getState().getShadowValue(r);
              if (a)
                return u({
                  currentState: a,
                  path: r.split(".").slice(1),
                  componentId: M
                });
            };
          if (m === "getSelectedIndex")
            return () => e.getState().getSelectedIndex(
              t + "." + i.join("."),
              h?.validIds
            );
          if (m === "clearSelected")
            return ft(t, i), () => {
              e.getState().clearSelectedIndex({
                arrayKey: t + "." + i.join(".")
              });
            };
          if (m === "useVirtualView")
            return (s) => {
              const {
                itemHeight: o = 50,
                overscan: r = 6,
                stickToBottom: a = !1,
                scrollStickTolerance: d = 75
              } = s, l = q(null), [p, E] = K({
                startIndex: 0,
                endIndex: 10
              }), [_, O] = K({}), C = q(!0), F = q({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), x = q(
                /* @__PURE__ */ new Map()
              );
              dt(() => {
                if (!a || !l.current || F.current.isUserScrolling)
                  return;
                const v = l.current;
                v.scrollTo({
                  top: v.scrollHeight,
                  behavior: C.current ? "instant" : "smooth"
                });
              }, [_, a]);
              const N = e.getState().getShadowMetadata(t, i)?.arrayKeys || [], { totalHeight: j, itemOffsets: b } = gt(() => {
                let v = 0;
                const T = /* @__PURE__ */ new Map();
                return (e.getState().getShadowMetadata(t, i)?.arrayKeys || []).forEach((D) => {
                  const R = D.split(".").slice(1), L = e.getState().getShadowMetadata(t, R)?.virtualizer?.itemHeight || o;
                  T.set(D, {
                    height: L,
                    offset: v
                  }), v += L;
                }), x.current = T, { totalHeight: v, itemOffsets: T };
              }, [N.length, o]);
              dt(() => {
                if (a && N.length > 0 && l.current && !F.current.isUserScrolling && C.current) {
                  const v = l.current, T = () => {
                    if (v.clientHeight > 0) {
                      const $ = Math.ceil(
                        v.clientHeight / o
                      ), D = N.length - 1, R = Math.max(
                        0,
                        D - $ - r
                      );
                      E({ startIndex: R, endIndex: D }), requestAnimationFrame(() => {
                        P("instant"), C.current = !1;
                      });
                    } else
                      requestAnimationFrame(T);
                  };
                  T();
                }
              }, [N.length, a, o, r]);
              const k = ct(() => {
                const v = l.current;
                if (!v) return;
                const T = v.scrollTop, { scrollHeight: $, clientHeight: D } = v, R = F.current, L = $ - (T + D), G = R.isNearBottom;
                R.isNearBottom = L <= d, T < R.lastScrollTop ? (R.scrollUpCount++, R.scrollUpCount > 3 && G && (R.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : R.isNearBottom && (R.isUserScrolling = !1, R.scrollUpCount = 0), R.lastScrollTop = T;
                let tt = 0;
                for (let et = 0; et < N.length; et++) {
                  const ht = N[et], mt = x.current.get(ht);
                  if (mt && mt.offset + mt.height > T) {
                    tt = et;
                    break;
                  }
                }
                if (tt !== p.startIndex) {
                  const et = Math.ceil(D / o);
                  E({
                    startIndex: Math.max(0, tt - r),
                    endIndex: Math.min(
                      N.length - 1,
                      tt + et + r
                    )
                  });
                }
              }, [
                N.length,
                p.startIndex,
                o,
                r,
                d
              ]);
              Z(() => {
                const v = l.current;
                if (!(!v || !a))
                  return v.addEventListener("scroll", k, {
                    passive: !0
                  }), () => {
                    v.removeEventListener("scroll", k);
                  };
              }, [k, a]);
              const P = ct(
                (v = "smooth") => {
                  const T = l.current;
                  if (!T) return;
                  F.current.isUserScrolling = !1, F.current.isNearBottom = !0, F.current.scrollUpCount = 0;
                  const $ = () => {
                    const D = (R = 0) => {
                      if (R > 5) return;
                      const L = T.scrollHeight, G = T.scrollTop, tt = T.clientHeight;
                      G + tt >= L - 1 || (T.scrollTo({
                        top: L,
                        behavior: v
                      }), setTimeout(() => {
                        const et = T.scrollHeight, ht = T.scrollTop;
                        (et !== L || ht + tt < et - 1) && D(R + 1);
                      }, 50));
                    };
                    D();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback($, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame($);
                  });
                },
                []
              );
              return Z(() => {
                if (!a || !l.current) return;
                const v = l.current, T = F.current;
                let $;
                const D = () => {
                  clearTimeout($), $ = setTimeout(() => {
                    !T.isUserScrolling && T.isNearBottom && P(
                      C.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, R = new MutationObserver(() => {
                  T.isUserScrolling || D();
                });
                R.observe(v, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const L = (G) => {
                  G.target instanceof HTMLImageElement && !T.isUserScrolling && D();
                };
                return v.addEventListener("load", L, !0), C.current ? setTimeout(() => {
                  P("instant");
                }, 0) : D(), () => {
                  clearTimeout($), R.disconnect(), v.removeEventListener("load", L, !0);
                };
              }, [a, N.length, P]), {
                virtualState: gt(() => {
                  const v = e.getState(), T = v.getShadowValue(
                    [t, ...i].join(".")
                  ), $ = v.getShadowMetadata(t, i)?.arrayKeys || [], D = T.slice(
                    p.startIndex,
                    p.endIndex + 1
                  ), R = $.slice(
                    p.startIndex,
                    p.endIndex + 1
                  );
                  return u({
                    currentState: D,
                    path: i,
                    componentId: M,
                    meta: { ...h, validIds: R }
                  });
                }, [p.startIndex, p.endIndex, N.length]),
                virtualizerProps: {
                  outer: {
                    ref: l,
                    style: {
                      overflowY: "auto",
                      height: "100%",
                      position: "relative"
                    }
                  },
                  inner: {
                    style: {
                      height: `${j}px`,
                      position: "relative"
                    }
                  },
                  list: {
                    style: {
                      transform: `translateY(${x.current.get(
                        N[p.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: P,
                scrollToIndex: (v, T = "smooth") => {
                  if (l.current && N[v]) {
                    const $ = x.current.get(N[v])?.offset || 0;
                    l.current.scrollTo({ top: $, behavior: T });
                  }
                }
              };
            };
          if (m === "stateMap")
            return (s) => {
              const [o, r] = K(
                h?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys
              ), a = e.getState().getShadowValue(c, h?.validIds);
              if (!o)
                throw new Error("No array keys found for mapping");
              const d = u({
                currentState: a,
                path: i,
                componentId: M,
                meta: h
              });
              return a.map((l, p) => {
                const E = o[p]?.split(".").slice(1), _ = u({
                  currentState: l,
                  path: E,
                  componentId: M,
                  meta: h
                });
                return s(
                  _,
                  p,
                  d
                );
              });
            };
          if (m === "$stateMap")
            return (s) => lt(qt, {
              proxy: {
                _stateKey: t,
                _path: i,
                _mapFn: s,
                _meta: h
              },
              rebuildStateShape: u
            });
          if (m === "stateFind")
            return (s) => {
              const o = h?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (o)
                for (let r = 0; r < o.length; r++) {
                  const a = o[r];
                  if (!a) continue;
                  const d = e.getState().getShadowValue(a);
                  if (s(d, r)) {
                    const l = a.split(".").slice(1);
                    return u({
                      currentState: d,
                      path: l,
                      componentId: M,
                      meta: h
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (m === "stateFilter")
            return (s) => {
              const o = h?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!o)
                throw new Error("No array keys found for filtering.");
              const r = [], a = I.filter(
                (d, l) => s(d, l) ? (r.push(o[l]), !0) : !1
              );
              return u({
                currentState: a,
                path: i,
                componentId: M,
                meta: {
                  validIds: r,
                  transforms: [
                    ...h?.transforms || [],
                    {
                      type: "filter",
                      fn: s
                    }
                  ]
                }
              });
            };
          if (m === "stateSort")
            return (s) => {
              const o = h?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!o)
                throw new Error("No array keys found for sorting");
              const r = I.map((a, d) => ({
                item: a,
                key: o[d]
              }));
              return r.sort((a, d) => s(a.item, d.item)).filter(Boolean), u({
                currentState: r.map((a) => a.item),
                path: i,
                componentId: M,
                meta: {
                  validIds: r.map((a) => a.key),
                  transforms: [
                    ...h?.transforms || [],
                    { type: "sort", fn: s }
                  ]
                }
              });
            };
          if (m === "stream")
            return function(s = {}) {
              const {
                bufferSize: o = 100,
                flushInterval: r = 100,
                bufferStrategy: a = "accumulate",
                store: d,
                onFlush: l
              } = s;
              let p = [], E = !1, _ = null;
              const O = (j) => {
                if (!E) {
                  if (a === "sliding" && p.length >= o)
                    p.shift();
                  else if (a === "dropping" && p.length >= o)
                    return;
                  p.push(j), p.length >= o && C();
                }
              }, C = () => {
                if (p.length === 0) return;
                const j = [...p];
                if (p = [], d) {
                  const b = d(j);
                  b !== void 0 && (Array.isArray(b) ? b : [b]).forEach((P) => {
                    n(P, i, {
                      updateType: "insert"
                    });
                  });
                } else
                  j.forEach((b) => {
                    n(b, i, {
                      updateType: "insert"
                    });
                  });
                l?.(j);
              };
              r > 0 && (_ = setInterval(C, r));
              const F = rt(), x = e.getState().getShadowMetadata(t, i) || {}, N = x.streams || /* @__PURE__ */ new Map();
              return N.set(F, { buffer: p, flushTimer: _ }), e.getState().setShadowMetadata(t, i, {
                ...x,
                streams: N
              }), {
                write: (j) => O(j),
                writeMany: (j) => j.forEach(O),
                flush: () => C(),
                pause: () => {
                  E = !0;
                },
                resume: () => {
                  E = !1, p.length > 0 && C();
                },
                close: () => {
                  C(), _ && clearInterval(_);
                  const j = e.getState().getShadowMetadata(t, i);
                  j?.streams && j.streams.delete(F);
                }
              };
            };
          if (m === "stateList")
            return (s) => /* @__PURE__ */ ot(() => {
              const r = q(/* @__PURE__ */ new Map()), a = h?.transforms && h.transforms.length > 0 ? `${M}-${Bt(h.transforms)}` : `${M}-base`, [d, l] = K({}), { validIds: p, arrayValues: E } = gt(() => {
                const O = e.getState().getShadowMetadata(t, i)?.transformCaches?.get(a);
                let C;
                O && O.validIds ? C = O.validIds : (C = It(
                  t,
                  i,
                  h?.transforms
                ), e.getState().setTransformCache(t, i, a, {
                  validIds: C,
                  computedAt: Date.now(),
                  transforms: h?.transforms || []
                }));
                const F = e.getState().getShadowValue(c, C);
                return {
                  validIds: C,
                  arrayValues: F || []
                };
              }, [a, d]);
              if (Z(() => {
                const O = e.getState().subscribeToPath(c, (C) => {
                  if (C.type === "GET_SELECTED")
                    return;
                  const x = e.getState().getShadowMetadata(t, i)?.transformCaches;
                  if (x)
                    for (const N of x.keys())
                      N.startsWith(M) && x.delete(N);
                  (C.type === "INSERT" || C.type === "REMOVE" || C.type === "CLEAR_SELECTION") && l({});
                });
                return () => {
                  O();
                };
              }, [M, c]), !Array.isArray(E))
                return null;
              const _ = u({
                currentState: E,
                path: i,
                componentId: M,
                meta: {
                  ...h,
                  validIds: p
                }
              });
              return /* @__PURE__ */ ot(Ot, { children: E.map((O, C) => {
                const F = p[C];
                if (!F)
                  return null;
                let x = r.current.get(F);
                x || (x = rt(), r.current.set(F, x));
                const N = F.split(".").slice(1);
                return lt(Mt, {
                  key: F,
                  stateKey: t,
                  itemComponentId: x,
                  itemPath: N,
                  localIndex: C,
                  arraySetter: _,
                  rebuildStateShape: u,
                  renderFn: s
                });
              }) });
            }, {});
          if (m === "stateFlattenOn")
            return (s) => {
              const o = I;
              y.clear(), w++;
              const r = o.flatMap(
                (a) => a[s] ?? []
              );
              return u({
                currentState: r,
                path: [...i, "[*]", s],
                componentId: M,
                meta: h
              });
            };
          if (m === "index")
            return (s) => {
              const r = e.getState().getShadowMetadata(t, i)?.arrayKeys?.filter(
                (l) => !h?.validIds || h?.validIds && h?.validIds?.includes(l)
              )?.[s];
              if (!r) return;
              const a = e.getState().getShadowValue(r, h?.validIds);
              return u({
                currentState: a,
                path: r.split(".").slice(1),
                componentId: M,
                meta: h
              });
            };
          if (m === "last")
            return () => {
              const s = e.getState().getShadowValue(t, i);
              if (s.length === 0) return;
              const o = s.length - 1, r = s[o], a = [...i, o.toString()];
              return u({
                currentState: r,
                path: a,
                componentId: M,
                meta: h
              });
            };
          if (m === "insert")
            return (s, o) => (n(s, i, { updateType: "insert" }), u({
              currentState: e.getState().getShadowValue(t, i),
              path: i,
              componentId: M,
              meta: h
            }));
          if (m === "uniqueInsert")
            return (s, o, r) => {
              const a = e.getState().getShadowValue(t, i), d = at(s) ? s(a) : s;
              let l = null;
              if (!a.some((E) => {
                const _ = o ? o.every(
                  (O) => st(E[O], d[O])
                ) : st(E, d);
                return _ && (l = E), _;
              }))
                V(i), n(d, i, { updateType: "insert" });
              else if (r && l) {
                const E = r(l), _ = a.map(
                  (O) => st(O, l) ? E : O
                );
                V(i), n(_, i, {
                  updateType: "update"
                });
              }
            };
          if (m === "cut")
            return (s, o) => {
              const r = h?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!r || r.length === 0) return;
              const a = s == -1 ? r.length - 1 : s !== void 0 ? s : r.length - 1, d = r[a];
              if (!d) return;
              const l = d.split(".").slice(1);
              n(I, l, {
                updateType: "cut"
              });
            };
          if (m === "cutSelected")
            return () => {
              const s = It(
                t,
                i,
                h?.transforms
              );
              if (!s || s.length === 0) return;
              const o = e.getState().selectedIndicesMap.get(c);
              let r = s.findIndex(
                (l) => l === o
              );
              const a = s[r == -1 ? s.length - 1 : r]?.split(".").slice(1);
              e.getState().clearSelectedIndex({ arrayKey: c });
              const d = a?.slice(0, -1);
              ft(t, d), n(I, a, {
                updateType: "cut"
              });
            };
          if (m === "cutByValue")
            return (s) => {
              const o = e.getState().getShadowMetadata(t, i), r = h?.validIds ?? o?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r)
                if (e.getState().getShadowValue(d) === s) {
                  a = d;
                  break;
                }
              if (a) {
                const d = a.split(".").slice(1);
                n(null, d, { updateType: "cut" });
              }
            };
          if (m === "toggleByValue")
            return (s) => {
              const o = e.getState().getShadowMetadata(t, i), r = h?.validIds ?? o?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r) {
                const l = e.getState().getShadowValue(d);
                if (console.log("itemValue sdasdasdasd", l), l === s) {
                  a = d;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", a), a) {
                const d = a.split(".").slice(1);
                console.log("itemValue keyToCut", a), n(s, d, {
                  updateType: "cut"
                });
              } else
                n(s, i, { updateType: "insert" });
            };
          if (m === "findWith")
            return (s, o) => {
              const r = e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!r)
                throw new Error("No array keys found for sorting");
              let a = null, d = [];
              for (const l of r) {
                let p = e.getState().getShadowValue(l, h?.validIds);
                if (p && p[s] === o) {
                  a = p, d = l.split(".").slice(1);
                  break;
                }
              }
              return u({
                currentState: a,
                path: d,
                componentId: M,
                meta: h
              });
            };
        }
        if (m === "cut") {
          let s = e.getState().getShadowValue(i.join("."));
          return () => {
            n(s, i, { updateType: "cut" });
          };
        }
        if (m === "get")
          return () => (Et(t, M, i), e.getState().getShadowValue(c, h?.validIds));
        if (m === "getState")
          return () => e.getState().getShadowValue(c, h?.validIds);
        if (m === "$derive")
          return (s) => bt({
            _stateKey: t,
            _path: i,
            _effect: s.toString(),
            _meta: h
          });
        if (m === "$get")
          return () => bt({ _stateKey: t, _path: i, _meta: h });
        if (m === "lastSynced") {
          const s = `${t}:${i.join(".")}`;
          return e.getState().getSyncInfo(s);
        }
        if (m == "getLocalStorage")
          return (s) => St(g + "-" + t + "-" + s);
        if (m === "isSelected") {
          const s = [t, ...i].slice(0, -1);
          if (ft(t, i, void 0), Array.isArray(
            e.getState().getShadowValue(s.join("."), h?.validIds)
          )) {
            i[i.length - 1];
            const o = s.join("."), r = e.getState().selectedIndicesMap.get(o), a = t + "." + i.join(".");
            return r === a;
          }
          return;
        }
        if (m === "setSelected")
          return (s) => {
            const o = i.slice(0, -1), r = t + "." + o.join("."), a = t + "." + i.join(".");
            ft(t, o, void 0), e.getState().selectedIndicesMap.get(r), s && e.getState().setSelectedIndex(r, a);
          };
        if (m === "toggleSelected")
          return () => {
            const s = i.slice(0, -1), o = t + "." + s.join("."), r = t + "." + i.join(".");
            e.getState().selectedIndicesMap.get(o) === r ? e.getState().clearSelectedIndex({ arrayKey: o }) : e.getState().setSelectedIndex(o, r);
          };
        if (m === "_componentId")
          return M;
        if (i.length == 0) {
          if (m === "addValidation")
            return (s) => {
              const o = e.getState().getInitialOptions(t)?.validation;
              if (!o?.key) throw new Error("Validation key not found");
              ut(o.key), s.forEach((r) => {
                const a = [o.key, ...r.path].join(".");
                pt(a, r.message);
              }), it(t);
            };
          if (m === "applyJsonPatch")
            return (s) => {
              const o = e.getState(), r = o.getShadowMetadata(t, []);
              if (!r?.components) return;
              const a = (l) => !l || l === "/" ? [] : l.split("/").slice(1).map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const l of s) {
                const p = a(l.path);
                switch (l.op) {
                  case "add":
                  case "replace": {
                    const { value: E } = l;
                    o.updateShadowAtPath(t, p, E), o.markAsDirty(t, p, { bubble: !0 });
                    let _ = [...p];
                    for (; ; ) {
                      const O = o.getShadowMetadata(
                        t,
                        _
                      );
                      if (console.log("pathMeta", O), O?.pathComponents && O.pathComponents.forEach((C) => {
                        if (!d.has(C)) {
                          const F = r.components?.get(C);
                          F && (F.forceUpdate(), d.add(C));
                        }
                      }), _.length === 0) break;
                      _.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const E = p.slice(0, -1);
                    o.removeShadowArrayElement(t, p), o.markAsDirty(t, E, { bubble: !0 });
                    let _ = [...E];
                    for (; ; ) {
                      const O = o.getShadowMetadata(
                        t,
                        _
                      );
                      if (O?.pathComponents && O.pathComponents.forEach((C) => {
                        if (!d.has(C)) {
                          const F = r.components?.get(C);
                          F && (F.forceUpdate(), d.add(C));
                        }
                      }), _.length === 0) break;
                      _.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (m === "validateZodSchema")
            return () => {
              const s = e.getState().getInitialOptions(t)?.validation, o = s?.zodSchemaV4 || s?.zodSchemaV3;
              if (!o || !s?.key)
                throw new Error(
                  "Zod schema (v3 or v4) or validation key not found"
                );
              ut(s.key);
              const r = e.getState().getShadowValue(t), a = o.safeParse(r);
              return a.success ? !0 : ("issues" in a.error ? a.error.issues.forEach((d) => {
                const l = [s.key, ...d.path].join(".");
                pt(l, d.message);
              }) : a.error.errors.forEach((d) => {
                const l = [s.key, ...d.path].join(".");
                pt(l, d.message);
              }), it(t), !1);
            };
          if (m === "getComponents")
            return () => e.getState().getShadowMetadata(t, [])?.components;
          if (m === "getAllFormRefs")
            return () => vt.getState().getFormRefsByStateKey(t);
        }
        if (m === "getFormRef")
          return () => vt.getState().getFormRef(t + "." + i.join("."));
        if (m === "validationWrapper")
          return ({
            children: s,
            hideMessage: o
          }) => /* @__PURE__ */ ot(
            kt,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: i,
              stateKey: t,
              children: s
            }
          );
        if (m === "_stateKey") return t;
        if (m === "_path") return i;
        if (m === "update")
          return (s) => (n(s, i, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const o = e.getState().getShadowMetadata(t, i);
              e.getState().setShadowMetadata(t, i, {
                ...o,
                isDirty: !1,
                // EXPLICITLY set to false, not just undefined
                stateSource: "server",
                // Mark as coming from server
                lastServerSync: Date.now()
                // Add timestamp
              });
              const r = [t, ...i].join(".");
              e.getState().notifyPathSubscribers(r, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (m === "toggle") {
          const s = e.getState().getShadowValue([t, ...i].join("."));
          if (console.log("currentValueAtPath", s), typeof I != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            n(!s, i, {
              updateType: "update"
            });
          };
        }
        if (m === "formElement")
          return (s, o) => /* @__PURE__ */ ot(
            Zt,
            {
              stateKey: t,
              path: i,
              rebuildStateShape: u,
              setState: n,
              formOpts: o,
              renderFn: s
            }
          );
        const Q = [...i, m], X = e.getState().getShadowValue(t, Q);
        return u({
          currentState: X,
          path: Q,
          componentId: M,
          meta: h
        });
      }
    }, H = new Proxy(B, J);
    return y.set(z, {
      proxy: H,
      stateVersion: w
    }), H;
  }
  const f = {
    removeValidation: (I) => {
      I?.validationKey && ut(I.validationKey);
    },
    revertToInitialState: (I) => {
      const i = e.getState().getInitialOptions(t)?.validation;
      i?.key && ut(i.key), I?.validationKey && ut(I.validationKey);
      const h = e.getState().getShadowMetadata(t, []);
      h?.stateSource === "server" && h.baseServerState ? h.baseServerState : e.getState().initialStateGlobal[t];
      const M = e.getState().initialStateGlobal[t];
      e.getState().clearSelectedIndexesForState(t), y.clear(), w++, e.getState().initializeShadowState(t, M), u({
        currentState: M,
        path: [],
        componentId: S
      });
      const z = nt(t), c = at(z?.localStorage?.key) ? z?.localStorage?.key(M) : z?.localStorage?.key, B = `${g}-${t}-${c}`;
      B && localStorage.removeItem(B);
      const J = e.getState().getShadowMetadata(t, []);
      return J && J?.components?.forEach((H) => {
        H.forceUpdate();
      }), M;
    },
    updateInitialState: (I) => {
      y.clear(), w++;
      const i = Dt(
        t,
        n,
        S,
        g
      ), h = e.getState().initialStateGlobal[t], M = nt(t), z = at(M?.localStorage?.key) ? M?.localStorage?.key(h) : M?.localStorage?.key, c = `${g}-${t}-${z}`;
      return localStorage.getItem(c) && localStorage.removeItem(c), Rt(() => {
        _t(t, I), e.getState().initializeShadowState(t, I);
        const B = e.getState().getShadowMetadata(t, []);
        B && B?.components?.forEach((J) => {
          J.forceUpdate();
        });
      }), {
        fetchId: (B) => i.get()[B]
      };
    }
  };
  return u({
    currentState: e.getState().getShadowValue(t, []),
    componentId: S,
    path: []
  });
}
function bt(t) {
  return lt(Gt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: n
}) {
  const S = q(null), g = q(`map-${crypto.randomUUID()}`), y = q(!1), w = q(/* @__PURE__ */ new Map());
  Z(() => {
    const u = S.current;
    if (!u || y.current) return;
    const f = setTimeout(() => {
      const A = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, I = A.mapWrappers || [];
      I.push({
        instanceId: g.current,
        mapFn: t._mapFn,
        containerRef: u,
        rebuildStateShape: n,
        path: t._path,
        componentId: g.current,
        meta: t._meta
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...A,
        mapWrappers: I
      }), y.current = !0, V();
    }, 0);
    return () => {
      if (clearTimeout(f), g.current) {
        const A = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        A.mapWrappers && (A.mapWrappers = A.mapWrappers.filter(
          (I) => I.instanceId !== g.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, A));
      }
      w.current.forEach((A) => A.unmount());
    };
  }, []);
  const V = () => {
    const u = S.current;
    if (!u) return;
    const f = e.getState().getShadowValue(
      [t._stateKey, ...t._path].join("."),
      t._meta?.validIds
    );
    if (!Array.isArray(f)) return;
    const A = t._meta?.validIds ?? e.getState().getShadowMetadata(t._stateKey, t._path)?.arrayKeys ?? [], I = n({
      currentState: f,
      path: t._path,
      componentId: g.current,
      meta: t._meta
    });
    f.forEach((i, h) => {
      const M = A[h];
      if (!M) return;
      const z = rt(), c = document.createElement("div");
      c.setAttribute("data-item-path", M), u.appendChild(c);
      const B = At(c);
      w.current.set(M, B);
      const J = M.split(".").slice(1);
      B.render(
        lt(Mt, {
          stateKey: t._stateKey,
          itemComponentId: z,
          itemPath: J,
          localIndex: h,
          arraySetter: I,
          rebuildStateShape: n,
          renderFn: t._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ ot("div", { ref: S, "data-map-container": g.current });
}
function Gt({
  proxy: t
}) {
  const n = q(null), S = q(null), g = q(!1), y = `${t._stateKey}-${t._path.join(".")}`, w = e.getState().getShadowValue(
    [t._stateKey, ...t._path].join("."),
    t._meta?.validIds
  );
  return Z(() => {
    const V = n.current;
    if (!V || g.current) return;
    const u = setTimeout(() => {
      if (!V.parentElement) {
        console.warn("Parent element not found for signal", y);
        return;
      }
      const f = V.parentElement, I = Array.from(f.childNodes).indexOf(V);
      let i = f.getAttribute("data-parent-id");
      i || (i = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", i)), S.current = `instance-${crypto.randomUUID()}`;
      const h = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, M = h.signals || [];
      M.push({
        instanceId: S.current,
        parentId: i,
        position: I,
        effect: t._effect
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...h,
        signals: M
      });
      let z = w;
      if (t._effect)
        try {
          z = new Function(
            "state",
            `return (${t._effect})(state)`
          )(w);
        } catch (B) {
          console.error("Error evaluating effect function:", B);
        }
      z !== null && typeof z == "object" && (z = JSON.stringify(z));
      const c = document.createTextNode(String(z ?? ""));
      V.replaceWith(c), g.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(u), S.current) {
        const f = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        f.signals && (f.signals = f.signals.filter(
          (A) => A.instanceId !== S.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, f));
      }
    };
  }, []), lt("span", {
    ref: n,
    style: { display: "contents" },
    "data-signal-id": y
  });
}
const Mt = Ut(
  Yt,
  (t, n) => t.itemPath.join(".") === n.itemPath.join(".") && t.stateKey === n.stateKey && t.itemComponentId === n.itemComponentId && t.localIndex === n.localIndex
), Jt = (t) => {
  const [n, S] = K(!1);
  return dt(() => {
    if (!t.current) {
      S(!0);
      return;
    }
    const g = Array.from(t.current.querySelectorAll("img"));
    if (g.length === 0) {
      S(!0);
      return;
    }
    let y = 0;
    const w = () => {
      y++, y === g.length && S(!0);
    };
    return g.forEach((V) => {
      V.complete ? w() : (V.addEventListener("load", w), V.addEventListener("error", w));
    }), () => {
      g.forEach((V) => {
        V.removeEventListener("load", w), V.removeEventListener("error", w);
      });
    };
  }, [t.current]), n;
};
function Yt({
  stateKey: t,
  itemComponentId: n,
  itemPath: S,
  localIndex: g,
  arraySetter: y,
  rebuildStateShape: w,
  renderFn: V
}) {
  const [, u] = K({}), { ref: f, inView: A } = jt(), I = q(null), i = Jt(I), h = q(!1), M = [t, ...S].join(".");
  $t(t, n, u);
  const z = ct(
    (W) => {
      I.current = W, f(W);
    },
    [f]
  );
  Z(() => {
    e.getState().subscribeToPath(M, (W) => {
      u({});
    });
  }, []), Z(() => {
    if (!A || !i || h.current)
      return;
    const W = I.current;
    if (W && W.offsetHeight > 0) {
      h.current = !0;
      const m = W.offsetHeight;
      e.getState().setShadowMetadata(t, S, {
        virtualizer: {
          itemHeight: m,
          domRef: W
        }
      });
      const Y = S.slice(0, -1), Q = [t, ...Y].join(".");
      e.getState().notifyPathSubscribers(Q, {
        type: "ITEMHEIGHT",
        itemKey: S.join("."),
        ref: I.current
      });
    }
  }, [A, i, t, S]);
  const c = [t, ...S].join("."), B = e.getState().getShadowValue(c);
  if (B === void 0)
    return null;
  const J = w({
    currentState: B,
    path: S,
    componentId: n
  }), H = V(J, g, y);
  return /* @__PURE__ */ ot("div", { ref: z, children: H });
}
function Zt({
  stateKey: t,
  path: n,
  rebuildStateShape: S,
  renderFn: g,
  formOpts: y,
  setState: w
}) {
  const [V] = K(() => rt()), [, u] = K({}), f = [t, ...n].join(".");
  $t(t, V, u);
  const A = e.getState().getShadowValue(f), [I, i] = K(A), h = q(!1), M = q(null);
  Z(() => {
    !h.current && !st(A, I) && i(A);
  }, [A]), Z(() => {
    const H = e.getState().subscribeToPath(f, (W) => {
      !h.current && I !== W && u({});
    });
    return () => {
      H(), M.current && (clearTimeout(M.current), h.current = !1);
    };
  }, []);
  const z = ct(
    (H) => {
      typeof A === "number" && typeof H == "string" && (H = H === "" ? 0 : Number(H)), i(H), h.current = !0, M.current && clearTimeout(M.current);
      const m = y?.debounceTime ?? 200;
      M.current = setTimeout(() => {
        h.current = !1, w(H, n, { updateType: "update" });
        const { getInitialOptions: Y, setShadowMetadata: Q, getShadowMetadata: X } = e.getState(), s = Y(t)?.validation, o = s?.zodSchemaV4 || s?.zodSchemaV3;
        if (o) {
          const r = e.getState().getShadowValue(t), a = o.safeParse(r), d = X(t, n) || {};
          if (a.success)
            Q(t, n, {
              ...d,
              validation: {
                status: "VALID_LIVE",
                validatedValue: H
              }
            });
          else {
            const p = ("issues" in a.error ? a.error.issues : a.error.errors).filter(
              (E) => JSON.stringify(E.path) === JSON.stringify(n)
            );
            p.length > 0 ? Q(t, n, {
              ...d,
              validation: {
                status: "INVALID_LIVE",
                message: p[0]?.message,
                validatedValue: H
              }
            }) : Q(t, n, {
              ...d,
              validation: {
                status: "VALID_LIVE",
                validatedValue: H
              }
            });
          }
        }
      }, m), u({});
    },
    [w, n, y?.debounceTime, t]
  ), c = ct(async () => {
    console.log("handleBlur triggered"), M.current && (clearTimeout(M.current), M.current = null, h.current = !1, w(I, n, { updateType: "update" }));
    const { getInitialOptions: H } = e.getState(), W = H(t)?.validation, m = W?.zodSchemaV4 || W?.zodSchemaV3;
    if (!m) return;
    const Y = e.getState().getShadowMetadata(t, n);
    e.getState().setShadowMetadata(t, n, {
      ...Y,
      validation: {
        status: "DIRTY",
        validatedValue: I
      }
    });
    const Q = e.getState().getShadowValue(t), X = m.safeParse(Q);
    if (console.log("result ", X), X.success)
      e.getState().setShadowMetadata(t, n, {
        ...Y,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: I
        }
      });
    else {
      const s = "issues" in X.error ? X.error.issues : X.error.errors;
      console.log("All validation errors:", s), console.log("Current blur path:", n);
      const o = s.filter((r) => {
        if (console.log("Processing error:", r), n.some((d) => d.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const d = n[0].startsWith("id:") ? [] : n.slice(0, -1);
          console.log("Parent path:", d);
          const l = e.getState().getShadowMetadata(t, d);
          if (console.log("Array metadata:", l), l?.arrayKeys) {
            const p = [t, ...n.slice(0, -1)].join("."), E = l.arrayKeys.indexOf(p);
            console.log("Item key:", p, "Index:", E);
            const _ = [...d, E, ...n.slice(-1)], O = JSON.stringify(r.path) === JSON.stringify(_);
            return console.log("Zod path comparison:", {
              zodPath: _,
              errorPath: r.path,
              match: O
            }), O;
          }
        }
        const a = JSON.stringify(r.path) === JSON.stringify(n);
        return console.log("Direct path comparison:", {
          errorPath: r.path,
          currentPath: n,
          match: a
        }), a;
      });
      console.log("Filtered path errors:", o), e.getState().setShadowMetadata(t, n, {
        ...Y,
        validation: {
          status: "VALIDATION_FAILED",
          message: o[0]?.message,
          validatedValue: I
        }
      });
    }
    u({});
  }, [t, n, I, w]), B = S({
    currentState: A,
    path: n,
    componentId: V
  }), J = new Proxy(B, {
    get(H, W) {
      return W === "inputProps" ? {
        value: I ?? "",
        onChange: (m) => {
          z(m.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: c,
        ref: vt.getState().getFormRef(t + "." + n.join("."))
      } : H[W];
    }
  });
  return /* @__PURE__ */ ot(kt, { formOpts: y, path: n, stateKey: t, children: g(J) });
}
function $t(t, n, S) {
  const g = `${t}////${n}`;
  dt(() => {
    const { registerComponent: y, unregisterComponent: w } = e.getState();
    return y(t, g, {
      forceUpdate: () => S({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      w(t, g);
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
