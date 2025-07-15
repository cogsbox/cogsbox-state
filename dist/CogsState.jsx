"use client";
import { jsx as ot, Fragment as Ut } from "react/jsx-runtime";
import { memo as Ot, useState as K, useRef as q, useCallback as ct, useEffect as Z, useLayoutEffect as dt, useMemo as ft, createElement as lt, startTransition as Rt } from "react";
import { createRoot as At } from "react-dom/client";
import { transformStateFunc as jt, isFunction as at, isArray as Tt, getDifferences as Ct, isDeepEqual as st } from "./utility.js";
import { ValidationWrapper as kt } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as rt } from "uuid";
import { getGlobalStore as e, formRefStore as vt } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { useInView as Lt } from "react-intersection-observer";
function mt(t, o) {
  const h = e.getState().getInitialOptions, S = e.getState().setInitialStateOptions, y = h(t) || {};
  S(t, {
    ...y,
    ...o
  });
}
function Vt({
  stateKey: t,
  options: o,
  initialOptionsPart: h
}) {
  const S = nt(t) || {}, y = h[t] || {}, I = e.getState().setInitialStateOptions, V = { ...y, ...S };
  let u = !1;
  if (o)
    for (const f in o)
      V.hasOwnProperty(f) ? (f == "localStorage" && o[f] && V[f].key !== o[f]?.key && (u = !0, V[f] = o[f]), f == "defaultState" && o[f] && V[f] !== o[f] && !st(V[f], o[f]) && (u = !0, V[f] = o[f])) : (u = !0, V[f] = o[f]);
  u && I(t, V);
}
function se(t, { formElements: o, validation: h }) {
  return { initialState: t, formElements: o, validation: h };
}
const ie = (t, o) => {
  let h = t;
  const [S, y] = jt(h);
  Object.keys(S).forEach((u) => {
    let f = y[u] || {};
    const A = {
      ...f
    };
    if (o?.formElements && (A.formElements = {
      ...o.formElements,
      ...f.formElements || {}
    }), o?.validation && (A.validation = {
      ...o.validation,
      ...f.validation || {}
    }, o.validation.key && !f.validation?.key && (A.validation.key = `${o.validation.key}.${u}`)), Object.keys(A).length > 0) {
      const w = nt(u);
      w ? e.getState().setInitialStateOptions(u, {
        ...w,
        ...A
      }) : e.getState().setInitialStateOptions(u, A);
    }
  }), Object.keys(S).forEach((u) => {
    e.getState().initializeShadowState(u, S[u]);
  });
  const I = (u, f) => {
    const [A] = K(f?.componentId ?? rt());
    Vt({
      stateKey: u,
      options: f,
      initialOptionsPart: y
    });
    const w = e.getState().getShadowValue(u) || S[u], i = f?.modifyState ? f.modifyState(w) : w;
    return xt(i, {
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
    Vt({ stateKey: u, options: f, initialOptionsPart: y }), f.localStorage && Ht(u, f), it(u);
  }
  return { useCogsState: I, setCogsOptions: V };
}, {
  getInitialOptions: nt,
  getValidationErrors: ce,
  setStateLog: Nt,
  updateInitialStateGlobal: Dt,
  addValidationError: yt,
  removeValidationError: ut
} = e.getState(), Wt = (t, o, h, S, y) => {
  h?.log && console.log(
    "saving to localstorage",
    o,
    h.localStorage?.key,
    S
  );
  const I = at(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (I && S) {
    const V = `${S}-${o}-${I}`;
    let u;
    try {
      u = gt(V)?.lastSyncedWithServer;
    } catch {
    }
    const f = e.getState().getShadowMetadata(o, []), A = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: u,
      stateSource: f?.stateSource,
      baseServerState: f?.baseServerState
    }, w = Ft.serialize(A);
    window.localStorage.setItem(
      V,
      JSON.stringify(w.json)
    );
  }
}, gt = (t) => {
  if (!t) return null;
  try {
    const o = window.localStorage.getItem(t);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, Ht = (t, o) => {
  const h = e.getState().getShadowValue(t), { sessionId: S } = Pt(), y = at(o?.localStorage?.key) ? o.localStorage.key(h) : o?.localStorage?.key;
  if (y && S) {
    const I = gt(
      `${S}-${t}-${y}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return it(t), !0;
  }
  return !1;
}, it = (t) => {
  const o = e.getState().getShadowMetadata(t, []);
  if (!o) return;
  const h = /* @__PURE__ */ new Set();
  o?.components?.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || h.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((S) => S());
  });
}, le = (t, o) => {
  const h = e.getState().getShadowMetadata(t, []);
  if (h) {
    const S = `${t}////${o}`, y = h?.components?.get(S);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
};
function wt(t, o, h, S) {
  const y = e.getState(), I = y.getShadowMetadata(t, o);
  if (y.setShadowMetadata(t, o, {
    ...I,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: S || Date.now()
  }), Array.isArray(h)) {
    const V = y.getShadowMetadata(t, o);
    V?.arrayKeys && V.arrayKeys.forEach((u, f) => {
      const A = u.split(".").slice(1), w = h[f];
      w !== void 0 && wt(
        t,
        A,
        w,
        S
      );
    });
  } else h && typeof h == "object" && h.constructor === Object && Object.keys(h).forEach((V) => {
    const u = [...o, V], f = h[V];
    wt(t, u, f, S);
  });
}
function xt(t, {
  stateKey: o,
  localStorage: h,
  formElements: S,
  reactiveDeps: y,
  reactiveType: I,
  componentId: V,
  defaultState: u,
  syncUpdate: f,
  dependencies: A,
  serverState: w
} = {}) {
  const [i, g] = K({}), { sessionId: M } = Pt();
  let z = !o;
  const [c] = K(o ?? rt()), B = e.getState().stateLog[c], J = q(/* @__PURE__ */ new Set()), H = q(V ?? rt()), W = q(
    null
  );
  W.current = nt(c) ?? null, Z(() => {
    if (f && f.stateKey === c && f.path?.[0]) {
      const n = `${f.stateKey}:${f.path.join(".")}`;
      e.getState().setSyncInfo(n, {
        timeStamp: f.timeStamp,
        userId: f.userId
      });
    }
  }, [f]);
  const m = ct(
    (n) => {
      const a = n ? { ...nt(c), ...n } : nt(c), d = a?.defaultState || u || t;
      if (a?.serverState?.status === "success" && a?.serverState?.data !== void 0)
        return {
          value: a.serverState.data,
          source: "server",
          timestamp: a.serverState.timestamp || Date.now()
        };
      if (a?.localStorage?.key && M) {
        const p = at(a.localStorage.key) ? a.localStorage.key(d) : a.localStorage.key, E = gt(
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
    e.getState().setServerStateUpdate(c, w);
  }, [w, c]), Z(() => e.getState().subscribeToPath(c, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const a = r.serverState;
      if (a?.status === "success" && a.data !== void 0) {
        mt(c, { serverState: a });
        const l = typeof a.merge == "object" ? a.merge : a.merge === !0 ? {} : null, p = e.getState().getShadowValue(c), E = a.data;
        if (l && Array.isArray(p) && Array.isArray(E)) {
          const U = l.key || "id", C = new Set(
            p.map((x) => x[U])
          ), F = E.filter((x) => !C.has(x[U]));
          F.length > 0 && F.forEach((x) => {
            e.getState().insertShadowArrayElement(c, [], x);
            const j = e.getState().getShadowMetadata(c, []);
            if (j?.arrayKeys) {
              const L = j.arrayKeys[j.arrayKeys.length - 1];
              if (L) {
                const b = L.split(".").slice(1);
                e.getState().setShadowMetadata(c, b, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: a.timestamp || Date.now()
                });
                const k = e.getState().getShadowValue(L);
                k && typeof k == "object" && !Array.isArray(k) && Object.keys(k).forEach((P) => {
                  const O = [...b, P];
                  e.getState().setShadowMetadata(c, O, {
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
        const D = e.getState().getShadowMetadata(c, []);
        e.getState().setShadowMetadata(c, [], {
          ...D,
          stateSource: "server",
          lastServerSync: a.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [c, m]), Z(() => {
    const n = e.getState().getShadowMetadata(c, []);
    if (n && n.stateSource)
      return;
    const r = nt(c);
    if (r?.defaultState !== void 0 || u !== void 0) {
      const a = r?.defaultState || u;
      r?.defaultState || mt(c, {
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
    z && mt(c, {
      formElements: S,
      defaultState: u,
      localStorage: h,
      middleware: W.current?.middleware
    });
    const n = `${c}////${H.current}`, r = e.getState().getShadowMetadata(c, []), a = r?.components || /* @__PURE__ */ new Map();
    return a.set(n, {
      forceUpdate: () => g({}),
      reactiveType: I ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: y || void 0,
      deps: y ? y(e.getState().getShadowValue(c)) : [],
      prevDeps: y ? y(e.getState().getShadowValue(c)) : []
    }), e.getState().setShadowMetadata(c, [], {
      ...r,
      components: a
    }), g({}), () => {
      const d = e.getState().getShadowMetadata(c, []), l = d?.components?.get(n);
      l?.paths && l.paths.forEach((p) => {
        const D = p.split(".").slice(1), U = e.getState().getShadowMetadata(c, D);
        U?.pathComponents && U.pathComponents.size === 0 && (delete U.pathComponents, e.getState().setShadowMetadata(c, D, U));
      }), d?.components && e.getState().setShadowMetadata(c, [], d);
    };
  }, []);
  const Y = q(null), Q = (n, r, a) => {
    const d = [c, ...r].join(".");
    if (Array.isArray(r)) {
      const b = `${c}-${r.join(".")}`;
      J.current.add(b);
    }
    const l = e.getState(), p = l.getShadowMetadata(c, r), E = l.getShadowValue(d), D = a.updateType === "insert" && at(n) ? n({ state: E, uuid: rt() }) : at(n) ? n(E) : n, C = {
      timeStamp: Date.now(),
      stateKey: c,
      path: r,
      updateType: a.updateType,
      status: "new",
      oldValue: E,
      newValue: D
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
      const b = a.updateType === "cut" ? null : D;
      p.signals.forEach(({ parentId: k, position: P, effect: O }) => {
        const v = document.querySelector(`[data-parent-id="${k}"]`);
        if (v) {
          const T = Array.from(v.childNodes);
          if (T[P]) {
            let $ = b;
            if (O && b !== null)
              try {
                $ = new Function(
                  "state",
                  `return (${O})(state)`
                )(b);
              } catch (_) {
                console.error("Error evaluating effect function:", _);
              }
            $ != null && typeof $ == "object" && ($ = JSON.stringify($)), T[P].textContent = String($ ?? "");
          }
        }
      });
    }
    if (a.updateType === "insert" && p?.mapWrappers && p.mapWrappers.length > 0) {
      const b = l.getShadowMetadata(c, r)?.arrayKeys || [], k = b[b.length - 1], P = l.getShadowValue(k), O = l.getShadowValue(
        [c, ...r].join(".")
      );
      if (!k || P === void 0) return;
      p.mapWrappers.forEach((v) => {
        let T = !0, $ = -1;
        if (v.meta?.transforms && v.meta.transforms.length > 0) {
          for (const _ of v.meta.transforms)
            if (_.type === "filter" && !_.fn(P, -1)) {
              T = !1;
              break;
            }
          if (T) {
            const _ = It(
              c,
              r,
              v.meta.transforms
            ), R = v.meta.transforms.find(
              (N) => N.type === "sort"
            );
            if (R) {
              const N = _.map((G) => ({
                key: G,
                value: l.getShadowValue(G)
              }));
              N.push({ key: k, value: P }), N.sort((G, tt) => R.fn(G.value, tt.value)), $ = N.findIndex(
                (G) => G.key === k
              );
            } else
              $ = _.length;
          }
        } else
          T = !0, $ = b.length - 1;
        if (T && v.containerRef && v.containerRef.isConnected) {
          const _ = document.createElement("div");
          _.setAttribute("data-item-path", k);
          const R = Array.from(v.containerRef.children);
          $ >= 0 && $ < R.length ? v.containerRef.insertBefore(
            _,
            R[$]
          ) : v.containerRef.appendChild(_);
          const N = At(_), G = rt(), tt = k.split(".").slice(1), et = v.rebuildStateShape({
            path: v.path,
            currentState: O,
            componentId: v.componentId,
            meta: v.meta
          });
          N.render(
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
          const O = P.containerRef.querySelector(
            `[data-item-path="${d}"]`
          );
          O && O.remove();
        }
      });
    }
    const x = e.getState().getShadowValue(c), j = e.getState().getShadowMetadata(c, []), L = /* @__PURE__ */ new Set();
    if (console.log(
      "rootMeta",
      c,
      e.getState().shadowStateStore
    ), !j?.components)
      return x;
    if (a.updateType === "update") {
      let b = [...r];
      for (; ; ) {
        const k = l.getShadowMetadata(c, b);
        if (k?.pathComponents && k.pathComponents.forEach((P) => {
          if (L.has(P))
            return;
          const O = j.components?.get(P);
          O && ((Array.isArray(O.reactiveType) ? O.reactiveType : [O.reactiveType || "component"]).includes("none") || (O.forceUpdate(), L.add(P)));
        }), b.length === 0)
          break;
        b.pop();
      }
      D && typeof D == "object" && !Tt(D) && E && typeof E == "object" && !Tt(E) && Ct(D, E).forEach((P) => {
        const O = P.split("."), v = [...r, ...O], T = l.getShadowMetadata(c, v);
        T?.pathComponents && T.pathComponents.forEach(($) => {
          if (L.has($))
            return;
          const _ = j.components?.get($);
          _ && ((Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"]).includes("none") || (_.forceUpdate(), L.add($)));
        });
      });
    } else if (a.updateType === "insert" || a.updateType === "cut") {
      const b = a.updateType === "insert" ? r : r.slice(0, -1), k = l.getShadowMetadata(c, b);
      if (k?.signals && k.signals.length > 0) {
        const P = [c, ...b].join("."), O = l.getShadowValue(P);
        k.signals.forEach(({ parentId: v, position: T, effect: $ }) => {
          const _ = document.querySelector(
            `[data-parent-id="${v}"]`
          );
          if (_) {
            const R = Array.from(_.childNodes);
            if (R[T]) {
              let N = O;
              if ($)
                try {
                  N = new Function(
                    "state",
                    `return (${$})(state)`
                  )(O);
                } catch (G) {
                  console.error("Error evaluating effect function:", G), N = O;
                }
              N != null && typeof N == "object" && (N = JSON.stringify(N)), R[T].textContent = String(N ?? "");
            }
          }
        });
      }
      k?.pathComponents && k.pathComponents.forEach((P) => {
        if (!L.has(P)) {
          const O = j.components?.get(P);
          O && (O.forceUpdate(), L.add(P));
        }
      });
    }
    return j.components.forEach((b, k) => {
      if (L.has(k))
        return;
      const P = Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"];
      if (P.includes("all")) {
        b.forceUpdate(), L.add(k);
        return;
      }
      if (P.includes("deps") && b.depsFunction) {
        const O = l.getShadowValue(c), v = b.depsFunction(O);
        let T = !1;
        v === !0 ? T = !0 : Array.isArray(v) && (st(b.prevDeps, v) || (b.prevDeps = v, T = !0)), T && (b.forceUpdate(), L.add(k));
      }
    }), L.clear(), Nt(c, (b) => {
      const k = [...b ?? [], C], P = /* @__PURE__ */ new Map();
      return k.forEach((O) => {
        const v = `${O.stateKey}:${JSON.stringify(O.path)}`, T = P.get(v);
        T ? (T.timeStamp = Math.max(T.timeStamp, O.timeStamp), T.newValue = O.newValue, T.oldValue = T.oldValue ?? O.oldValue, T.updateType = O.updateType) : P.set(v, { ...O });
      }), Array.from(P.values());
    }), Wt(
      D,
      c,
      W.current,
      M
    ), W.current?.middleware && W.current.middleware({
      updateLog: B,
      update: C
    }), x;
  };
  e.getState().initialStateGlobal[c] || Dt(c, t);
  const X = ft(() => _t(
    c,
    Q,
    H.current,
    M
  ), [c, M]), s = W.current?.cogsSync;
  return s && (Y.current = s(X)), X;
}
function zt(t) {
  return !t || t.length === 0 ? "" : t.map(
    (o) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${o.type}${JSON.stringify(o.dependencies || [])}`
    )
  ).join("");
}
const It = (t, o, h) => {
  let S = e.getState().getShadowMetadata(t, o)?.arrayKeys || [];
  if (!h || h.length === 0)
    return S;
  let y = S.map((I) => ({
    key: I,
    value: e.getState().getShadowValue(I)
  }));
  for (const I of h)
    I.type === "filter" ? y = y.filter(
      ({ value: V }, u) => I.fn(V, u)
    ) : I.type === "sort" && y.sort((V, u) => I.fn(V.value, u.value));
  return y.map(({ key: I }) => I);
}, Et = (t, o, h) => {
  const S = `${t}////${o}`, { addPathComponent: y, getShadowMetadata: I } = e.getState(), u = I(t, [])?.components?.get(S);
  !u || u.reactiveType === "none" || !(Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType]).includes("component") || y(t, h, S);
}, pt = (t, o, h) => {
  const S = e.getState(), y = S.getShadowMetadata(t, []), I = /* @__PURE__ */ new Set();
  y?.components && y.components.forEach((u, f) => {
    (Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"]).includes("all") && (u.forceUpdate(), I.add(f));
  }), S.getShadowMetadata(t, [...o, "getSelected"])?.pathComponents?.forEach((u) => {
    y?.components?.get(u)?.forceUpdate();
  });
  const V = S.getShadowMetadata(t, o);
  for (let u of V?.arrayKeys || []) {
    const f = u + ".selected", A = S.getShadowMetadata(
      t,
      f.split(".").slice(1)
    );
    u == h && A?.pathComponents?.forEach((w) => {
      y?.components?.get(w)?.forceUpdate();
    });
  }
};
function _t(t, o, h, S) {
  const y = /* @__PURE__ */ new Map();
  let I = 0;
  const V = (w) => {
    const i = w.join(".");
    for (const [g] of y)
      (g === i || g.startsWith(i + ".")) && y.delete(g);
    I++;
  };
  function u({
    currentState: w,
    path: i = [],
    meta: g,
    componentId: M
  }) {
    const z = i.map(String).join("."), c = [t, ...i].join(".");
    w = e.getState().getShadowValue(c, g?.validIds);
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
            const s = e.getState().getShadowMetadata(t, []), n = e.getState().getShadowValue(t);
            let r;
            return s?.stateSource === "server" && s.baseServerState ? r = s.baseServerState : r = e.getState().initialStateGlobal[t], Ct(n, r);
          };
        if (m === "sync" && i.length === 0)
          return async function() {
            const s = e.getState().getInitialOptions(t), n = s?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = e.getState().getShadowValue(t, []), a = s?.validation?.key;
            try {
              const d = await n.action(r);
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
                }), n.onSuccess && n.onSuccess(d.data);
              } else !d?.success && n.onError && n.onError(d.error);
              return d;
            } catch (d) {
              return n.onError && n.onError(d), { success: !1, error: d };
            }
          };
        if (m === "_status" || m === "getStatus") {
          const s = () => {
            const n = e.getState().getShadowMetadata(t, i), r = e.getState().getShadowValue(c);
            return n?.isDirty === !0 ? "dirty" : n?.isDirty === !1 || n?.stateSource === "server" ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" ? "fresh" : e.getState().getShadowMetadata(t, [])?.stateSource === "server" && !n?.isDirty ? "synced" : r !== void 0 && !n ? "fresh" : "unknown";
          };
          return m === "_status" ? s() : s;
        }
        if (m === "removeStorage")
          return () => {
            const s = e.getState().initialStateGlobal[t], n = nt(t), r = at(n?.localStorage?.key) ? n.localStorage.key(s) : n?.localStorage?.key, a = `${S}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (m === "showValidationErrors")
          return () => {
            const s = e.getState().getShadowMetadata(t, i);
            return s?.validation?.status === "VALIDATION_FAILED" && s.validation.message ? [s.validation.message] : [];
          };
        if (Array.isArray(w)) {
          if (m === "getSelected")
            return () => {
              const s = t + "." + i.join(".");
              Et(t, M, [
                ...i,
                "getSelected"
              ]);
              const n = e.getState().selectedIndicesMap;
              if (!n || !n.has(s))
                return;
              const r = n.get(s);
              if (g?.validIds && !g.validIds.includes(r))
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
              g?.validIds
            );
          if (m === "clearSelected")
            return pt(t, i), () => {
              e.getState().clearSelectedIndex({
                arrayKey: t + "." + i.join(".")
              });
            };
          if (m === "useVirtualView")
            return (s) => {
              const {
                itemHeight: n = 50,
                overscan: r = 6,
                stickToBottom: a = !1,
                scrollStickTolerance: d = 75
              } = s, l = q(null), [p, E] = K({
                startIndex: 0,
                endIndex: 10
              }), [D, U] = K({}), C = q(!0), F = q({
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
              }, [D, a]);
              const j = e.getState().getShadowMetadata(t, i)?.arrayKeys || [], { totalHeight: L, itemOffsets: b } = ft(() => {
                let v = 0;
                const T = /* @__PURE__ */ new Map();
                return (e.getState().getShadowMetadata(t, i)?.arrayKeys || []).forEach((_) => {
                  const R = _.split(".").slice(1), N = e.getState().getShadowMetadata(t, R)?.virtualizer?.itemHeight || n;
                  T.set(_, {
                    height: N,
                    offset: v
                  }), v += N;
                }), x.current = T, { totalHeight: v, itemOffsets: T };
              }, [j.length, n]);
              dt(() => {
                if (a && j.length > 0 && l.current && !F.current.isUserScrolling && C.current) {
                  const v = l.current, T = () => {
                    if (v.clientHeight > 0) {
                      const $ = Math.ceil(
                        v.clientHeight / n
                      ), _ = j.length - 1, R = Math.max(
                        0,
                        _ - $ - r
                      );
                      E({ startIndex: R, endIndex: _ }), requestAnimationFrame(() => {
                        P("instant"), C.current = !1;
                      });
                    } else
                      requestAnimationFrame(T);
                  };
                  T();
                }
              }, [j.length, a, n, r]);
              const k = ct(() => {
                const v = l.current;
                if (!v) return;
                const T = v.scrollTop, { scrollHeight: $, clientHeight: _ } = v, R = F.current, N = $ - (T + _), G = R.isNearBottom;
                R.isNearBottom = N <= d, T < R.lastScrollTop ? (R.scrollUpCount++, R.scrollUpCount > 3 && G && (R.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : R.isNearBottom && (R.isUserScrolling = !1, R.scrollUpCount = 0), R.lastScrollTop = T;
                let tt = 0;
                for (let et = 0; et < j.length; et++) {
                  const St = j[et], ht = x.current.get(St);
                  if (ht && ht.offset + ht.height > T) {
                    tt = et;
                    break;
                  }
                }
                if (tt !== p.startIndex) {
                  const et = Math.ceil(_ / n);
                  E({
                    startIndex: Math.max(0, tt - r),
                    endIndex: Math.min(
                      j.length - 1,
                      tt + et + r
                    )
                  });
                }
              }, [
                j.length,
                p.startIndex,
                n,
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
                    const _ = (R = 0) => {
                      if (R > 5) return;
                      const N = T.scrollHeight, G = T.scrollTop, tt = T.clientHeight;
                      G + tt >= N - 1 || (T.scrollTo({
                        top: N,
                        behavior: v
                      }), setTimeout(() => {
                        const et = T.scrollHeight, St = T.scrollTop;
                        (et !== N || St + tt < et - 1) && _(R + 1);
                      }, 50));
                    };
                    _();
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
                const _ = () => {
                  clearTimeout($), $ = setTimeout(() => {
                    !T.isUserScrolling && T.isNearBottom && P(
                      C.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, R = new MutationObserver(() => {
                  T.isUserScrolling || _();
                });
                R.observe(v, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const N = (G) => {
                  G.target instanceof HTMLImageElement && !T.isUserScrolling && _();
                };
                return v.addEventListener("load", N, !0), C.current ? setTimeout(() => {
                  P("instant");
                }, 0) : _(), () => {
                  clearTimeout($), R.disconnect(), v.removeEventListener("load", N, !0);
                };
              }, [a, j.length, P]), {
                virtualState: ft(() => {
                  const v = e.getState(), T = v.getShadowValue(
                    [t, ...i].join(".")
                  ), $ = v.getShadowMetadata(t, i)?.arrayKeys || [], _ = T.slice(
                    p.startIndex,
                    p.endIndex + 1
                  ), R = $.slice(
                    p.startIndex,
                    p.endIndex + 1
                  );
                  return u({
                    currentState: _,
                    path: i,
                    componentId: M,
                    meta: { ...g, validIds: R }
                  });
                }, [p.startIndex, p.endIndex, j.length]),
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
                      height: `${L}px`,
                      position: "relative"
                    }
                  },
                  list: {
                    style: {
                      transform: `translateY(${x.current.get(
                        j[p.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: P,
                scrollToIndex: (v, T = "smooth") => {
                  if (l.current && j[v]) {
                    const $ = x.current.get(j[v])?.offset || 0;
                    l.current.scrollTo({ top: $, behavior: T });
                  }
                }
              };
            };
          if (m === "stateMap")
            return (s) => {
              const [n, r] = K(
                g?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys
              ), a = e.getState().getShadowValue(c, g?.validIds);
              if (!n)
                throw new Error("No array keys found for mapping");
              const d = u({
                currentState: a,
                path: i,
                componentId: M,
                meta: g
              });
              return a.map((l, p) => {
                const E = n[p]?.split(".").slice(1), D = u({
                  currentState: l,
                  path: E,
                  componentId: M,
                  meta: g
                });
                return s(
                  D,
                  p,
                  d
                );
              });
            };
          if (m === "$stateMap")
            return (s) => lt(Bt, {
              proxy: {
                _stateKey: t,
                _path: i,
                _mapFn: s,
                _meta: g
              },
              rebuildStateShape: u
            });
          if (m === "stateFind")
            return (s) => {
              const n = g?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (n)
                for (let r = 0; r < n.length; r++) {
                  const a = n[r];
                  if (!a) continue;
                  const d = e.getState().getShadowValue(a);
                  if (s(d, r)) {
                    const l = a.split(".").slice(1);
                    return u({
                      currentState: d,
                      path: l,
                      componentId: M,
                      meta: g
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (m === "stateFilter")
            return (s) => {
              const n = g?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for filtering.");
              const r = [], a = w.filter(
                (d, l) => s(d, l) ? (r.push(n[l]), !0) : !1
              );
              return u({
                currentState: a,
                path: i,
                componentId: M,
                meta: {
                  validIds: r,
                  transforms: [
                    ...g?.transforms || [],
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
              const n = g?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for sorting");
              const r = w.map((a, d) => ({
                item: a,
                key: n[d]
              }));
              return r.sort((a, d) => s(a.item, d.item)).filter(Boolean), u({
                currentState: r.map((a) => a.item),
                path: i,
                componentId: M,
                meta: {
                  validIds: r.map((a) => a.key),
                  transforms: [
                    ...g?.transforms || [],
                    { type: "sort", fn: s }
                  ]
                }
              });
            };
          if (m === "stream")
            return function(s = {}) {
              const {
                bufferSize: n = 100,
                flushInterval: r = 100,
                bufferStrategy: a = "accumulate",
                store: d,
                onFlush: l
              } = s;
              let p = [], E = !1, D = null;
              const U = (L) => {
                if (!E) {
                  if (a === "sliding" && p.length >= n)
                    p.shift();
                  else if (a === "dropping" && p.length >= n)
                    return;
                  p.push(L), p.length >= n && C();
                }
              }, C = () => {
                if (p.length === 0) return;
                const L = [...p];
                if (p = [], d) {
                  const b = d(L);
                  b !== void 0 && (Array.isArray(b) ? b : [b]).forEach((P) => {
                    o(P, i, {
                      updateType: "insert"
                    });
                  });
                } else
                  L.forEach((b) => {
                    o(b, i, {
                      updateType: "insert"
                    });
                  });
                l?.(L);
              };
              r > 0 && (D = setInterval(C, r));
              const F = rt(), x = e.getState().getShadowMetadata(t, i) || {}, j = x.streams || /* @__PURE__ */ new Map();
              return j.set(F, { buffer: p, flushTimer: D }), e.getState().setShadowMetadata(t, i, {
                ...x,
                streams: j
              }), {
                write: (L) => U(L),
                writeMany: (L) => L.forEach(U),
                flush: () => C(),
                pause: () => {
                  E = !0;
                },
                resume: () => {
                  E = !1, p.length > 0 && C();
                },
                close: () => {
                  C(), D && clearInterval(D);
                  const L = e.getState().getShadowMetadata(t, i);
                  L?.streams && L.streams.delete(F);
                }
              };
            };
          if (m === "stateList")
            return (s) => /* @__PURE__ */ ot(() => {
              const r = q(/* @__PURE__ */ new Map()), a = g?.transforms && g.transforms.length > 0 ? `${M}-${zt(g.transforms)}` : `${M}-base`, [d, l] = K({}), { validIds: p, arrayValues: E } = ft(() => {
                const U = e.getState().getShadowMetadata(t, i)?.transformCaches?.get(a);
                let C;
                U && U.validIds ? C = U.validIds : (C = It(
                  t,
                  i,
                  g?.transforms
                ), e.getState().setTransformCache(t, i, a, {
                  validIds: C,
                  computedAt: Date.now(),
                  transforms: g?.transforms || []
                }));
                const F = e.getState().getShadowValue(c, C);
                return {
                  validIds: C,
                  arrayValues: F || []
                };
              }, [a, d]);
              if (console.log("freshValues", p, E), Z(() => {
                const U = e.getState().subscribeToPath(c, (C) => {
                  if (C.type === "GET_SELECTED")
                    return;
                  const x = e.getState().getShadowMetadata(t, i)?.transformCaches;
                  if (x)
                    for (const j of x.keys())
                      j.startsWith(M) && x.delete(j);
                  (C.type === "INSERT" || C.type === "REMOVE" || C.type === "CLEAR_SELECTION") && l({});
                });
                return () => {
                  U();
                };
              }, [M, c]), !Array.isArray(E))
                return null;
              const D = u({
                currentState: E,
                path: i,
                componentId: M,
                meta: {
                  ...g,
                  validIds: p
                }
              });
              return console.log("sssssssssssssssssssssssssssss", D), /* @__PURE__ */ ot(Ut, { children: E.map((U, C) => {
                const F = p[C];
                if (!F)
                  return null;
                let x = r.current.get(F);
                x || (x = rt(), r.current.set(F, x));
                const j = F.split(".").slice(1);
                return lt(Mt, {
                  key: F,
                  stateKey: t,
                  itemComponentId: x,
                  itemPath: j,
                  localIndex: C,
                  arraySetter: D,
                  rebuildStateShape: u,
                  renderFn: s
                });
              }) });
            }, {});
          if (m === "stateFlattenOn")
            return (s) => {
              const n = w;
              y.clear(), I++;
              const r = n.flatMap(
                (a) => a[s] ?? []
              );
              return u({
                currentState: r,
                path: [...i, "[*]", s],
                componentId: M,
                meta: g
              });
            };
          if (m === "index")
            return (s) => {
              const r = e.getState().getShadowMetadata(t, i)?.arrayKeys?.filter(
                (l) => !g?.validIds || g?.validIds && g?.validIds?.includes(l)
              )?.[s];
              if (!r) return;
              const a = e.getState().getShadowValue(r, g?.validIds);
              return u({
                currentState: a,
                path: r.split(".").slice(1),
                componentId: M,
                meta: g
              });
            };
          if (m === "last")
            return () => {
              const s = e.getState().getShadowValue(t, i);
              if (s.length === 0) return;
              const n = s.length - 1, r = s[n], a = [...i, n.toString()];
              return u({
                currentState: r,
                path: a,
                componentId: M,
                meta: g
              });
            };
          if (m === "insert")
            return (s, n) => (o(s, i, { updateType: "insert" }), u({
              currentState: e.getState().getShadowValue(t, i),
              path: i,
              componentId: M,
              meta: g
            }));
          if (m === "uniqueInsert")
            return (s, n, r) => {
              const a = e.getState().getShadowValue(t, i), d = at(s) ? s(a) : s;
              let l = null;
              if (!a.some((E) => {
                const D = n ? n.every(
                  (U) => st(E[U], d[U])
                ) : st(E, d);
                return D && (l = E), D;
              }))
                V(i), o(d, i, { updateType: "insert" });
              else if (r && l) {
                const E = r(l), D = a.map(
                  (U) => st(U, l) ? E : U
                );
                V(i), o(D, i, {
                  updateType: "update"
                });
              }
            };
          if (m === "cut")
            return (s, n) => {
              const r = g?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!r || r.length === 0) return;
              const a = s == -1 ? r.length - 1 : s !== void 0 ? s : r.length - 1, d = r[a];
              if (!d) return;
              const l = d.split(".").slice(1);
              o(w, l, {
                updateType: "cut"
              });
            };
          if (m === "cutSelected")
            return () => {
              const s = It(
                t,
                i,
                g?.transforms
              );
              if (!s || s.length === 0) return;
              const n = e.getState().selectedIndicesMap.get(c);
              let r = s.findIndex(
                (d) => d === n
              );
              const a = s[r == -1 ? s.length - 1 : r]?.split(".").slice(1);
              e.getState().clearSelectedIndex({ arrayKey: c }), o(w, a, {
                updateType: "cut"
              });
            };
          if (m === "cutByValue")
            return (s) => {
              const n = e.getState().getShadowMetadata(t, i), r = g?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r)
                if (e.getState().getShadowValue(d) === s) {
                  a = d;
                  break;
                }
              if (a) {
                const d = a.split(".").slice(1);
                o(null, d, { updateType: "cut" });
              }
            };
          if (m === "toggleByValue")
            return (s) => {
              const n = e.getState().getShadowMetadata(t, i), r = g?.validIds ?? n?.arrayKeys;
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
                console.log("itemValue keyToCut", a), o(s, d, {
                  updateType: "cut"
                });
              } else
                o(s, i, { updateType: "insert" });
            };
          if (m === "findWith")
            return (s, n) => {
              const r = e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!r)
                throw new Error("No array keys found for sorting");
              let a = null, d = [];
              for (const l of r) {
                let p = e.getState().getShadowValue(l, g?.validIds);
                if (p && p[s] === n) {
                  a = p, d = l.split(".").slice(1);
                  break;
                }
              }
              return u({
                currentState: a,
                path: d,
                componentId: M,
                meta: g
              });
            };
        }
        if (m === "cut") {
          let s = e.getState().getShadowValue(i.join("."));
          return () => {
            o(s, i, { updateType: "cut" });
          };
        }
        if (m === "get")
          return () => (Et(t, M, i), e.getState().getShadowValue(c, g?.validIds));
        if (m === "getState")
          return () => e.getState().getShadowValue(c, g?.validIds);
        if (m === "$derive")
          return (s) => bt({
            _stateKey: t,
            _path: i,
            _effect: s.toString(),
            _meta: g
          });
        if (m === "$get")
          return () => bt({ _stateKey: t, _path: i, _meta: g });
        if (m === "lastSynced") {
          const s = `${t}:${i.join(".")}`;
          return e.getState().getSyncInfo(s);
        }
        if (m == "getLocalStorage")
          return (s) => gt(S + "-" + t + "-" + s);
        if (m === "isSelected") {
          const s = [t, ...i].slice(0, -1);
          if (pt(t, i, void 0), Array.isArray(
            e.getState().getShadowValue(s.join("."), g?.validIds)
          )) {
            i[i.length - 1];
            const n = s.join("."), r = e.getState().selectedIndicesMap.get(n), a = t + "." + i.join(".");
            return r === a;
          }
          return;
        }
        if (m === "setSelected")
          return (s) => {
            const n = i.slice(0, -1), r = t + "." + n.join("."), a = t + "." + i.join(".");
            pt(t, n, void 0), e.getState().selectedIndicesMap.get(r), s && e.getState().setSelectedIndex(r, a);
          };
        if (m === "toggleSelected")
          return () => {
            const s = i.slice(0, -1), n = t + "." + s.join("."), r = t + "." + i.join(".");
            e.getState().selectedIndicesMap.get(n) === r ? e.getState().clearSelectedIndex({ arrayKey: n }) : e.getState().setSelectedIndex(n, r);
          };
        if (m === "_componentId")
          return M;
        if (i.length == 0) {
          if (m === "addValidation")
            return (s) => {
              const n = e.getState().getInitialOptions(t)?.validation;
              if (!n?.key) throw new Error("Validation key not found");
              ut(n.key), s.forEach((r) => {
                const a = [n.key, ...r.path].join(".");
                yt(a, r.message);
              }), it(t);
            };
          if (m === "applyJsonPatch")
            return (s) => {
              const n = e.getState(), r = n.getShadowMetadata(t, []);
              if (!r?.components) return;
              const a = (l) => !l || l === "/" ? [] : l.split("/").slice(1).map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const l of s) {
                const p = a(l.path);
                switch (l.op) {
                  case "add":
                  case "replace": {
                    const { value: E } = l;
                    n.updateShadowAtPath(t, p, E), n.markAsDirty(t, p, { bubble: !0 });
                    let D = [...p];
                    for (; ; ) {
                      const U = n.getShadowMetadata(
                        t,
                        D
                      );
                      if (console.log("pathMeta", U), U?.pathComponents && U.pathComponents.forEach((C) => {
                        if (!d.has(C)) {
                          const F = r.components?.get(C);
                          F && (F.forceUpdate(), d.add(C));
                        }
                      }), D.length === 0) break;
                      D.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const E = p.slice(0, -1);
                    n.removeShadowArrayElement(t, p), n.markAsDirty(t, E, { bubble: !0 });
                    let D = [...E];
                    for (; ; ) {
                      const U = n.getShadowMetadata(
                        t,
                        D
                      );
                      if (U?.pathComponents && U.pathComponents.forEach((C) => {
                        if (!d.has(C)) {
                          const F = r.components?.get(C);
                          F && (F.forceUpdate(), d.add(C));
                        }
                      }), D.length === 0) break;
                      D.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (m === "validateZodSchema")
            return () => {
              const s = e.getState().getInitialOptions(t)?.validation, n = s?.zodSchemaV4 || s?.zodSchemaV3;
              if (!n || !s?.key)
                throw new Error(
                  "Zod schema (v3 or v4) or validation key not found"
                );
              ut(s.key);
              const r = e.getState().getShadowValue(t), a = n.safeParse(r);
              return a.success ? !0 : ("issues" in a.error ? a.error.issues.forEach((d) => {
                const l = [s.key, ...d.path].join(".");
                yt(l, d.message);
              }) : a.error.errors.forEach((d) => {
                const l = [s.key, ...d.path].join(".");
                yt(l, d.message);
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
            hideMessage: n
          }) => /* @__PURE__ */ ot(
            kt,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: i,
              stateKey: t,
              children: s
            }
          );
        if (m === "_stateKey") return t;
        if (m === "_path") return i;
        if (m === "update")
          return (s) => (o(s, i, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const n = e.getState().getShadowMetadata(t, i);
              e.getState().setShadowMetadata(t, i, {
                ...n,
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
          if (console.log("currentValueAtPath", s), typeof w != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            o(!s, i, {
              updateType: "update"
            });
          };
        }
        if (m === "formElement")
          return (s, n) => /* @__PURE__ */ ot(
            Yt,
            {
              stateKey: t,
              path: i,
              rebuildStateShape: u,
              setState: o,
              formOpts: n,
              renderFn: s
            }
          );
        const Q = [...i, m], X = e.getState().getShadowValue(t, Q);
        return u({
          currentState: X,
          path: Q,
          componentId: M,
          meta: g
        });
      }
    }, H = new Proxy(B, J);
    return y.set(z, {
      proxy: H,
      stateVersion: I
    }), H;
  }
  const f = {
    removeValidation: (w) => {
      w?.validationKey && ut(w.validationKey);
    },
    revertToInitialState: (w) => {
      const i = e.getState().getInitialOptions(t)?.validation;
      i?.key && ut(i.key), w?.validationKey && ut(w.validationKey);
      const g = e.getState().getShadowMetadata(t, []);
      g?.stateSource === "server" && g.baseServerState ? g.baseServerState : e.getState().initialStateGlobal[t];
      const M = e.getState().initialStateGlobal[t];
      e.getState().clearSelectedIndexesForState(t), y.clear(), I++, e.getState().initializeShadowState(t, M), u({
        currentState: M,
        path: [],
        componentId: h
      });
      const z = nt(t), c = at(z?.localStorage?.key) ? z?.localStorage?.key(M) : z?.localStorage?.key, B = `${S}-${t}-${c}`;
      B && localStorage.removeItem(B);
      const J = e.getState().getShadowMetadata(t, []);
      return J && J?.components?.forEach((H) => {
        H.forceUpdate();
      }), M;
    },
    updateInitialState: (w) => {
      y.clear(), I++;
      const i = _t(
        t,
        o,
        h,
        S
      ), g = e.getState().initialStateGlobal[t], M = nt(t), z = at(M?.localStorage?.key) ? M?.localStorage?.key(g) : M?.localStorage?.key, c = `${S}-${t}-${z}`;
      return localStorage.getItem(c) && localStorage.removeItem(c), Rt(() => {
        Dt(t, w), e.getState().initializeShadowState(t, w);
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
    componentId: h,
    path: []
  });
}
function bt(t) {
  return lt(qt, { proxy: t });
}
function Bt({
  proxy: t,
  rebuildStateShape: o
}) {
  const h = q(null), S = q(`map-${crypto.randomUUID()}`), y = q(!1), I = q(/* @__PURE__ */ new Map());
  Z(() => {
    const u = h.current;
    if (!u || y.current) return;
    const f = setTimeout(() => {
      const A = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, w = A.mapWrappers || [];
      w.push({
        instanceId: S.current,
        mapFn: t._mapFn,
        containerRef: u,
        rebuildStateShape: o,
        path: t._path,
        componentId: S.current,
        meta: t._meta
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...A,
        mapWrappers: w
      }), y.current = !0, V();
    }, 0);
    return () => {
      if (clearTimeout(f), S.current) {
        const A = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        A.mapWrappers && (A.mapWrappers = A.mapWrappers.filter(
          (w) => w.instanceId !== S.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, A));
      }
      I.current.forEach((A) => A.unmount());
    };
  }, []);
  const V = () => {
    const u = h.current;
    if (!u) return;
    const f = e.getState().getShadowValue(
      [t._stateKey, ...t._path].join("."),
      t._meta?.validIds
    );
    if (!Array.isArray(f)) return;
    const A = t._meta?.validIds ?? e.getState().getShadowMetadata(t._stateKey, t._path)?.arrayKeys ?? [], w = o({
      currentState: f,
      path: t._path,
      componentId: S.current,
      meta: t._meta
    });
    f.forEach((i, g) => {
      const M = A[g];
      if (!M) return;
      const z = rt(), c = document.createElement("div");
      c.setAttribute("data-item-path", M), u.appendChild(c);
      const B = At(c);
      I.current.set(M, B);
      const J = M.split(".").slice(1);
      B.render(
        lt(Mt, {
          stateKey: t._stateKey,
          itemComponentId: z,
          itemPath: J,
          localIndex: g,
          arraySetter: w,
          rebuildStateShape: o,
          renderFn: t._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ ot("div", { ref: h, "data-map-container": S.current });
}
function qt({
  proxy: t
}) {
  const o = q(null), h = q(null), S = q(!1), y = `${t._stateKey}-${t._path.join(".")}`, I = e.getState().getShadowValue(
    [t._stateKey, ...t._path].join("."),
    t._meta?.validIds
  );
  return Z(() => {
    const V = o.current;
    if (!V || S.current) return;
    const u = setTimeout(() => {
      if (!V.parentElement) {
        console.warn("Parent element not found for signal", y);
        return;
      }
      const f = V.parentElement, w = Array.from(f.childNodes).indexOf(V);
      let i = f.getAttribute("data-parent-id");
      i || (i = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", i)), h.current = `instance-${crypto.randomUUID()}`;
      const g = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, M = g.signals || [];
      M.push({
        instanceId: h.current,
        parentId: i,
        position: w,
        effect: t._effect
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...g,
        signals: M
      });
      let z = I;
      if (t._effect)
        try {
          z = new Function(
            "state",
            `return (${t._effect})(state)`
          )(I);
        } catch (B) {
          console.error("Error evaluating effect function:", B);
        }
      z !== null && typeof z == "object" && (z = JSON.stringify(z));
      const c = document.createTextNode(String(z ?? ""));
      V.replaceWith(c), S.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(u), h.current) {
        const f = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        f.signals && (f.signals = f.signals.filter(
          (A) => A.instanceId !== h.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, f));
      }
    };
  }, []), lt("span", {
    ref: o,
    style: { display: "contents" },
    "data-signal-id": y
  });
}
const Mt = Ot(
  Jt,
  (t, o) => t.itemPath.join(".") === o.itemPath.join(".") && t.stateKey === o.stateKey && t.itemComponentId === o.itemComponentId && t.localIndex === o.localIndex
), Gt = (t) => {
  const [o, h] = K(!1);
  return dt(() => {
    if (!t.current) {
      h(!0);
      return;
    }
    const S = Array.from(t.current.querySelectorAll("img"));
    if (S.length === 0) {
      h(!0);
      return;
    }
    let y = 0;
    const I = () => {
      y++, y === S.length && h(!0);
    };
    return S.forEach((V) => {
      V.complete ? I() : (V.addEventListener("load", I), V.addEventListener("error", I));
    }), () => {
      S.forEach((V) => {
        V.removeEventListener("load", I), V.removeEventListener("error", I);
      });
    };
  }, [t.current]), o;
};
function Jt({
  stateKey: t,
  itemComponentId: o,
  itemPath: h,
  localIndex: S,
  arraySetter: y,
  rebuildStateShape: I,
  renderFn: V
}) {
  const [, u] = K({}), { ref: f, inView: A } = Lt(), w = q(null), i = Gt(w), g = q(!1), M = [t, ...h].join(".");
  $t(t, o, u);
  const z = ct(
    (W) => {
      w.current = W, f(W);
    },
    [f]
  );
  Z(() => {
    e.getState().subscribeToPath(M, (W) => {
      u({});
    });
  }, []), Z(() => {
    if (!A || !i || g.current)
      return;
    const W = w.current;
    if (W && W.offsetHeight > 0) {
      g.current = !0;
      const m = W.offsetHeight;
      e.getState().setShadowMetadata(t, h, {
        virtualizer: {
          itemHeight: m,
          domRef: W
        }
      });
      const Y = h.slice(0, -1), Q = [t, ...Y].join(".");
      e.getState().notifyPathSubscribers(Q, {
        type: "ITEMHEIGHT",
        itemKey: h.join("."),
        ref: w.current
      });
    }
  }, [A, i, t, h]);
  const c = [t, ...h].join("."), B = e.getState().getShadowValue(c);
  if (B === void 0)
    return null;
  const J = I({
    currentState: B,
    path: h,
    componentId: o
  }), H = V(J, S, y);
  return /* @__PURE__ */ ot("div", { ref: z, children: H });
}
function Yt({
  stateKey: t,
  path: o,
  rebuildStateShape: h,
  renderFn: S,
  formOpts: y,
  setState: I
}) {
  const [V] = K(() => rt()), [, u] = K({}), f = [t, ...o].join(".");
  $t(t, V, u);
  const A = e.getState().getShadowValue(f), [w, i] = K(A), g = q(!1), M = q(null);
  Z(() => {
    !g.current && !st(A, w) && i(A);
  }, [A]), Z(() => {
    const H = e.getState().subscribeToPath(f, (W) => {
      !g.current && w !== W && u({});
    });
    return () => {
      H(), M.current && (clearTimeout(M.current), g.current = !1);
    };
  }, []);
  const z = ct(
    (H) => {
      typeof A === "number" && typeof H == "string" && (H = H === "" ? 0 : Number(H)), i(H), g.current = !0, M.current && clearTimeout(M.current);
      const m = y?.debounceTime ?? 200;
      M.current = setTimeout(() => {
        g.current = !1, I(H, o, { updateType: "update" });
        const { getInitialOptions: Y, setShadowMetadata: Q, getShadowMetadata: X } = e.getState(), s = Y(t)?.validation, n = s?.zodSchemaV4 || s?.zodSchemaV3;
        if (n) {
          const r = e.getState().getShadowValue(t), a = n.safeParse(r), d = X(t, o) || {};
          if (a.success)
            Q(t, o, {
              ...d,
              validation: {
                status: "VALID_LIVE",
                validatedValue: H
              }
            });
          else {
            const p = ("issues" in a.error ? a.error.issues : a.error.errors).filter(
              (E) => JSON.stringify(E.path) === JSON.stringify(o)
            );
            p.length > 0 ? Q(t, o, {
              ...d,
              validation: {
                status: "INVALID_LIVE",
                message: p[0]?.message,
                validatedValue: H
              }
            }) : Q(t, o, {
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
    [I, o, y?.debounceTime, t]
  ), c = ct(async () => {
    console.log("handleBlur triggered"), M.current && (clearTimeout(M.current), M.current = null, g.current = !1, I(w, o, { updateType: "update" }));
    const { getInitialOptions: H } = e.getState(), W = H(t)?.validation, m = W?.zodSchemaV4 || W?.zodSchemaV3;
    if (!m) return;
    const Y = e.getState().getShadowMetadata(t, o);
    e.getState().setShadowMetadata(t, o, {
      ...Y,
      validation: {
        status: "DIRTY",
        validatedValue: w
      }
    });
    const Q = e.getState().getShadowValue(t), X = m.safeParse(Q);
    if (console.log("result ", X), X.success)
      e.getState().setShadowMetadata(t, o, {
        ...Y,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: w
        }
      });
    else {
      const s = "issues" in X.error ? X.error.issues : X.error.errors;
      console.log("All validation errors:", s), console.log("Current blur path:", o);
      const n = s.filter((r) => {
        if (console.log("Processing error:", r), o.some((d) => d.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const d = o[0].startsWith("id:") ? [] : o.slice(0, -1);
          console.log("Parent path:", d);
          const l = e.getState().getShadowMetadata(t, d);
          if (console.log("Array metadata:", l), l?.arrayKeys) {
            const p = [t, ...o.slice(0, -1)].join("."), E = l.arrayKeys.indexOf(p);
            console.log("Item key:", p, "Index:", E);
            const D = [...d, E, ...o.slice(-1)], U = JSON.stringify(r.path) === JSON.stringify(D);
            return console.log("Zod path comparison:", {
              zodPath: D,
              errorPath: r.path,
              match: U
            }), U;
          }
        }
        const a = JSON.stringify(r.path) === JSON.stringify(o);
        return console.log("Direct path comparison:", {
          errorPath: r.path,
          currentPath: o,
          match: a
        }), a;
      });
      console.log("Filtered path errors:", n), e.getState().setShadowMetadata(t, o, {
        ...Y,
        validation: {
          status: "VALIDATION_FAILED",
          message: n[0]?.message,
          validatedValue: w
        }
      });
    }
    u({});
  }, [t, o, w, I]), B = h({
    currentState: A,
    path: o,
    componentId: V
  }), J = new Proxy(B, {
    get(H, W) {
      return W === "inputProps" ? {
        value: w ?? "",
        onChange: (m) => {
          z(m.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: c,
        ref: vt.getState().getFormRef(t + "." + o.join("."))
      } : H[W];
    }
  });
  return /* @__PURE__ */ ot(kt, { formOpts: y, path: o, stateKey: t, children: S(J) });
}
function $t(t, o, h) {
  const S = `${t}////${o}`;
  dt(() => {
    const { registerComponent: y, unregisterComponent: I } = e.getState();
    return y(t, S, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      I(t, S);
    };
  }, [t, S]);
}
export {
  bt as $cogsSignal,
  se as addStateOptions,
  ie as createCogsState,
  le as notifyComponent,
  xt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
