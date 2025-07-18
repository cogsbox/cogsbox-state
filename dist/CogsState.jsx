"use client";
import { jsx as ot, Fragment as Ut } from "react/jsx-runtime";
import { memo as Ot, useState as K, useRef as q, useCallback as ct, useEffect as Z, useLayoutEffect as dt, useMemo as St, createElement as lt, startTransition as Rt } from "react";
import { createRoot as At } from "react-dom/client";
import { transformStateFunc as Nt, isFunction as at, isArray as Tt, getDifferences as Ct, isDeepEqual as st } from "./utility.js";
import { ValidationWrapper as kt } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as rt } from "uuid";
import { getGlobalStore as e, formRefStore as vt } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { useInView as jt } from "react-intersection-observer";
function yt(t, r) {
  const g = e.getState().getInitialOptions, S = e.getState().setInitialStateOptions, y = g(t) || {};
  S(t, {
    ...y,
    ...r
  });
}
function Et({
  stateKey: t,
  options: r,
  initialOptionsPart: g
}) {
  const S = nt(t) || {}, y = g[t] || {}, I = e.getState().setInitialStateOptions, E = { ...y, ...S };
  let u = !1;
  if (r)
    for (const f in r)
      E.hasOwnProperty(f) ? (f == "localStorage" && r[f] && E[f].key !== r[f]?.key && (u = !0, E[f] = r[f]), f == "defaultState" && r[f] && E[f] !== r[f] && !st(E[f], r[f]) && (u = !0, E[f] = r[f])) : (u = !0, E[f] = r[f]);
  u && I(t, E);
}
function ie(t, { formElements: r, validation: g }) {
  return { initialState: t, formElements: r, validation: g };
}
const Lt = (t, r) => {
  let g = t;
  const [S, y] = Nt(g);
  r?.__fromSyncSchema && r?.__syncNotifications && e.getState().setInitialStateOptions("__notifications", r.__syncNotifications), Object.keys(S).forEach((u) => {
    let f = y[u] || {};
    const A = {
      ...f
    };
    if (r?.formElements && (A.formElements = {
      ...r.formElements,
      ...f.formElements || {}
    }), r?.validation && (A.validation = {
      ...r.validation,
      ...f.validation || {}
    }, r.validation.key && !f.validation?.key && (A.validation.key = `${r.validation.key}.${u}`)), Object.keys(A).length > 0) {
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
    Et({
      stateKey: u,
      options: f,
      initialOptionsPart: y
    });
    const w = e.getState().getShadowValue(u) || S[u], i = f?.modifyState ? f.modifyState(w) : w;
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
  function E(u, f) {
    Et({ stateKey: u, options: f, initialOptionsPart: y }), f.localStorage && xt(u, f), it(u);
  }
  return { useCogsState: I, setCogsOptions: E };
};
function ce(t) {
  const r = {};
  for (const g in t.schemas) {
    const S = t.schemas[g];
    S.rawSchema ? r[g] = S.rawSchema : S.schemas?.defaults ? r[g] = S.schemas.defaults : S._tableName ? r[g] = S : r[g] = {};
  }
  return Lt(r, {
    __fromSyncSchema: !0,
    __syncNotifications: t.notifications
  });
}
const {
  getInitialOptions: nt,
  getValidationErrors: le,
  setStateLog: Wt,
  updateInitialStateGlobal: _t,
  addValidationError: pt,
  removeValidationError: ut
} = e.getState(), Ht = (t, r, g, S, y) => {
  g?.log && console.log(
    "saving to localstorage",
    r,
    g.localStorage?.key,
    S
  );
  const I = at(g?.localStorage?.key) ? g.localStorage?.key(t) : g?.localStorage?.key;
  if (I && S) {
    const E = `${S}-${r}-${I}`;
    let u;
    try {
      u = gt(E)?.lastSyncedWithServer;
    } catch {
    }
    const f = e.getState().getShadowMetadata(r, []), A = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: u,
      stateSource: f?.stateSource,
      baseServerState: f?.baseServerState
    }, w = Ft.serialize(A);
    window.localStorage.setItem(
      E,
      JSON.stringify(w.json)
    );
  }
}, gt = (t) => {
  if (!t) return null;
  try {
    const r = window.localStorage.getItem(t);
    return r ? JSON.parse(r) : null;
  } catch (r) {
    return console.error("Error loading from localStorage:", r), null;
  }
}, xt = (t, r) => {
  const g = e.getState().getShadowValue(t), { sessionId: S } = Pt(), y = at(r?.localStorage?.key) ? r.localStorage.key(g) : r?.localStorage?.key;
  if (y && S) {
    const I = gt(
      `${S}-${t}-${y}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return it(t), !0;
  }
  return !1;
}, it = (t) => {
  const r = e.getState().getShadowMetadata(t, []);
  if (!r) return;
  const g = /* @__PURE__ */ new Set();
  r?.components?.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || g.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    g.forEach((S) => S());
  });
}, ue = (t, r) => {
  const g = e.getState().getShadowMetadata(t, []);
  if (g) {
    const S = `${t}////${r}`, y = g?.components?.get(S);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
};
function wt(t, r, g, S) {
  const y = e.getState(), I = y.getShadowMetadata(t, r);
  if (y.setShadowMetadata(t, r, {
    ...I,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: S || Date.now()
  }), Array.isArray(g)) {
    const E = y.getShadowMetadata(t, r);
    E?.arrayKeys && E.arrayKeys.forEach((u, f) => {
      const A = u.split(".").slice(1), w = g[f];
      w !== void 0 && wt(
        t,
        A,
        w,
        S
      );
    });
  } else g && typeof g == "object" && g.constructor === Object && Object.keys(g).forEach((E) => {
    const u = [...r, E], f = g[E];
    wt(t, u, f, S);
  });
}
function zt(t, {
  stateKey: r,
  localStorage: g,
  formElements: S,
  reactiveDeps: y,
  reactiveType: I,
  componentId: E,
  defaultState: u,
  syncUpdate: f,
  dependencies: A,
  serverState: w
} = {}) {
  const [i, h] = K({}), { sessionId: M } = Pt();
  let z = !r;
  const [c] = K(r ?? rt()), B = e.getState().stateLog[c], J = q(/* @__PURE__ */ new Set()), H = q(E ?? rt()), W = q(
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
        const p = at(a.localStorage.key) ? a.localStorage.key(d) : a.localStorage.key, V = gt(
          `${M}-${c}-${p}`
        );
        if (V && V.lastUpdated > (a?.serverState?.timestamp || 0))
          return {
            value: V.state,
            source: "localStorage",
            timestamp: V.lastUpdated
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
  }, [w, c]), Z(() => e.getState().subscribeToPath(c, (n) => {
    if (n?.type === "SERVER_STATE_UPDATE") {
      const a = n.serverState;
      if (a?.status === "success" && a.data !== void 0) {
        yt(c, { serverState: a });
        const l = typeof a.merge == "object" ? a.merge : a.merge === !0 ? {} : null, p = e.getState().getShadowValue(c), V = a.data;
        if (l && Array.isArray(p) && Array.isArray(V)) {
          const U = l.key || "id", C = new Set(
            p.map((x) => x[U])
          ), F = V.filter((x) => !C.has(x[U]));
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
          e.getState().initializeShadowState(c, V), wt(
            c,
            [],
            V,
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
    const n = nt(c);
    if (n?.defaultState !== void 0 || u !== void 0) {
      const a = n?.defaultState || u;
      n?.defaultState || yt(c, {
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
      formElements: S,
      defaultState: u,
      localStorage: g,
      middleware: W.current?.middleware
    });
    const o = `${c}////${H.current}`, n = e.getState().getShadowMetadata(c, []), a = n?.components || /* @__PURE__ */ new Map();
    return a.set(o, {
      forceUpdate: () => h({}),
      reactiveType: I ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: y || void 0,
      deps: y ? y(e.getState().getShadowValue(c)) : [],
      prevDeps: y ? y(e.getState().getShadowValue(c)) : []
    }), e.getState().setShadowMetadata(c, [], {
      ...n,
      components: a
    }), h({}), () => {
      const d = e.getState().getShadowMetadata(c, []), l = d?.components?.get(o);
      l?.paths && l.paths.forEach((p) => {
        const _ = p.split(".").slice(1), U = e.getState().getShadowMetadata(c, _);
        U?.pathComponents && U.pathComponents.size === 0 && (delete U.pathComponents, e.getState().setShadowMetadata(c, _, U));
      }), d?.components && e.getState().setShadowMetadata(c, [], d);
    };
  }, []);
  const Y = q(null), Q = (o, n, a) => {
    const d = [c, ...n].join(".");
    if (Array.isArray(n)) {
      const b = `${c}-${n.join(".")}`;
      J.current.add(b);
    }
    const l = e.getState(), p = l.getShadowMetadata(c, n), V = l.getShadowValue(d), _ = a.updateType === "insert" && at(o) ? o({ state: V, uuid: rt() }) : at(o) ? o(V) : o, C = {
      timeStamp: Date.now(),
      stateKey: c,
      path: n,
      updateType: a.updateType,
      status: "new",
      oldValue: V,
      newValue: _
    };
    switch (a.updateType) {
      case "insert": {
        l.insertShadowArrayElement(c, n, C.newValue), l.markAsDirty(c, n, { bubble: !0 });
        const b = l.getShadowMetadata(c, n);
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
        const b = n.slice(0, -1);
        l.removeShadowArrayElement(c, n), l.markAsDirty(c, b, { bubble: !0 });
        break;
      }
      case "update": {
        l.updateShadowAtPath(c, n, C.newValue), l.markAsDirty(c, n, { bubble: !0 });
        break;
      }
    }
    if (a.sync !== !1 && Y.current && Y.current.connected && Y.current.updateState({ operation: C }), p?.signals && p.signals.length > 0) {
      const b = a.updateType === "cut" ? null : _;
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
              } catch (D) {
                console.error("Error evaluating effect function:", D);
              }
            $ != null && typeof $ == "object" && ($ = JSON.stringify($)), T[P].textContent = String($ ?? "");
          }
        }
      });
    }
    if (a.updateType === "insert" && p?.mapWrappers && p.mapWrappers.length > 0) {
      const b = l.getShadowMetadata(c, n)?.arrayKeys || [], k = b[b.length - 1], P = l.getShadowValue(k), O = l.getShadowValue(
        [c, ...n].join(".")
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
              n,
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
            currentState: O,
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
      const b = n.slice(0, -1), k = l.getShadowMetadata(c, b);
      k?.mapWrappers && k.mapWrappers.length > 0 && k.mapWrappers.forEach((P) => {
        if (P.containerRef && P.containerRef.isConnected) {
          const O = P.containerRef.querySelector(
            `[data-item-path="${d}"]`
          );
          O && O.remove();
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
      let b = [...n];
      for (; ; ) {
        const k = l.getShadowMetadata(c, b);
        if (k?.pathComponents && k.pathComponents.forEach((P) => {
          if (j.has(P))
            return;
          const O = N.components?.get(P);
          O && ((Array.isArray(O.reactiveType) ? O.reactiveType : [O.reactiveType || "component"]).includes("none") || (O.forceUpdate(), j.add(P)));
        }), b.length === 0)
          break;
        b.pop();
      }
      _ && typeof _ == "object" && !Tt(_) && V && typeof V == "object" && !Tt(V) && Ct(_, V).forEach((P) => {
        const O = P.split("."), v = [...n, ...O], T = l.getShadowMetadata(c, v);
        T?.pathComponents && T.pathComponents.forEach(($) => {
          if (j.has($))
            return;
          const D = N.components?.get($);
          D && ((Array.isArray(D.reactiveType) ? D.reactiveType : [D.reactiveType || "component"]).includes("none") || (D.forceUpdate(), j.add($)));
        });
      });
    } else if (a.updateType === "insert" || a.updateType === "cut") {
      const b = a.updateType === "insert" ? n : n.slice(0, -1), k = l.getShadowMetadata(c, b);
      if (k?.signals && k.signals.length > 0) {
        const P = [c, ...b].join("."), O = l.getShadowValue(P);
        k.signals.forEach(({ parentId: v, position: T, effect: $ }) => {
          const D = document.querySelector(
            `[data-parent-id="${v}"]`
          );
          if (D) {
            const R = Array.from(D.childNodes);
            if (R[T]) {
              let L = O;
              if ($)
                try {
                  L = new Function(
                    "state",
                    `return (${$})(state)`
                  )(O);
                } catch (G) {
                  console.error("Error evaluating effect function:", G), L = O;
                }
              L != null && typeof L == "object" && (L = JSON.stringify(L)), R[T].textContent = String(L ?? "");
            }
          }
        });
      }
      k?.pathComponents && k.pathComponents.forEach((P) => {
        if (!j.has(P)) {
          const O = N.components?.get(P);
          O && (O.forceUpdate(), j.add(P));
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
        const O = l.getShadowValue(c), v = b.depsFunction(O);
        let T = !1;
        v === !0 ? T = !0 : Array.isArray(v) && (st(b.prevDeps, v) || (b.prevDeps = v, T = !0)), T && (b.forceUpdate(), j.add(k));
      }
    }), j.clear(), Wt(c, (b) => {
      const k = [...b ?? [], C], P = /* @__PURE__ */ new Map();
      return k.forEach((O) => {
        const v = `${O.stateKey}:${JSON.stringify(O.path)}`, T = P.get(v);
        T ? (T.timeStamp = Math.max(T.timeStamp, O.timeStamp), T.newValue = O.newValue, T.oldValue = T.oldValue ?? O.oldValue, T.updateType = O.updateType) : P.set(v, { ...O });
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
  const X = St(() => Dt(
    c,
    Q,
    H.current,
    M
  ), [c, M]), s = W.current?.cogsSync;
  return s && (Y.current = s(X)), X;
}
function Bt(t) {
  return !t || t.length === 0 ? "" : t.map(
    (r) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${r.type}${JSON.stringify(r.dependencies || [])}`
    )
  ).join("");
}
const It = (t, r, g) => {
  let S = e.getState().getShadowMetadata(t, r)?.arrayKeys || [];
  if (!g || g.length === 0)
    return S;
  let y = S.map((I) => ({
    key: I,
    value: e.getState().getShadowValue(I)
  }));
  for (const I of g)
    I.type === "filter" ? y = y.filter(
      ({ value: E }, u) => I.fn(E, u)
    ) : I.type === "sort" && y.sort((E, u) => I.fn(E.value, u.value));
  return y.map(({ key: I }) => I);
}, Vt = (t, r, g) => {
  const S = `${t}////${r}`, { addPathComponent: y, getShadowMetadata: I } = e.getState(), u = I(t, [])?.components?.get(S);
  !u || u.reactiveType === "none" || !(Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType]).includes("component") || y(t, g, S);
}, ft = (t, r, g) => {
  const S = e.getState(), y = S.getShadowMetadata(t, []), I = /* @__PURE__ */ new Set();
  y?.components && y.components.forEach((u, f) => {
    (Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"]).includes("all") && (u.forceUpdate(), I.add(f));
  }), S.getShadowMetadata(t, [...r, "getSelected"])?.pathComponents?.forEach((u) => {
    y?.components?.get(u)?.forceUpdate();
  });
  const E = S.getShadowMetadata(t, r);
  for (let u of E?.arrayKeys || []) {
    const f = u + ".selected", A = S.getShadowMetadata(
      t,
      f.split(".").slice(1)
    );
    u == g && A?.pathComponents?.forEach((w) => {
      y?.components?.get(w)?.forceUpdate();
    });
  }
};
function Dt(t, r, g, S) {
  const y = /* @__PURE__ */ new Map();
  let I = 0;
  const E = (w) => {
    const i = w.join(".");
    for (const [h] of y)
      (h === i || h.startsWith(i + ".")) && y.delete(h);
    I++;
  };
  function u({
    currentState: w,
    path: i = [],
    meta: h,
    componentId: M
  }) {
    const z = i.map(String).join("."), c = [t, ...i].join(".");
    w = e.getState().getShadowValue(c, h?.validIds);
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
            let n;
            return s?.stateSource === "server" && s.baseServerState ? n = s.baseServerState : n = e.getState().initialStateGlobal[t], Ct(o, n);
          };
        if (m === "sync" && i.length === 0)
          return async function() {
            const s = e.getState().getInitialOptions(t), o = s?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = e.getState().getShadowValue(t, []), a = s?.validation?.key;
            try {
              const d = await o.action(n);
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
                  baseServerState: n
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
            const o = e.getState().getShadowMetadata(t, i), n = e.getState().getShadowValue(c);
            return o?.isDirty === !0 ? "dirty" : o?.isDirty === !1 || o?.stateSource === "server" ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" ? "fresh" : e.getState().getShadowMetadata(t, [])?.stateSource === "server" && !o?.isDirty ? "synced" : n !== void 0 && !o ? "fresh" : "unknown";
          };
          return m === "_status" ? s() : s;
        }
        if (m === "removeStorage")
          return () => {
            const s = e.getState().initialStateGlobal[t], o = nt(t), n = at(o?.localStorage?.key) ? o.localStorage.key(s) : o?.localStorage?.key, a = `${S}-${t}-${n}`;
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
              Vt(t, M, [
                ...i,
                "getSelected"
              ]);
              const o = e.getState().selectedIndicesMap;
              if (!o || !o.has(s))
                return;
              const n = o.get(s);
              if (h?.validIds && !h.validIds.includes(n))
                return;
              const a = e.getState().getShadowValue(n);
              if (a)
                return u({
                  currentState: a,
                  path: n.split(".").slice(1),
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
                overscan: n = 6,
                stickToBottom: a = !1,
                scrollStickTolerance: d = 75
              } = s, l = q(null), [p, V] = K({
                startIndex: 0,
                endIndex: 10
              }), [_, U] = K({}), C = q(!0), F = q({
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
              const N = e.getState().getShadowMetadata(t, i)?.arrayKeys || [], { totalHeight: j, itemOffsets: b } = St(() => {
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
                        D - $ - n
                      );
                      V({ startIndex: R, endIndex: D }), requestAnimationFrame(() => {
                        P("instant"), C.current = !1;
                      });
                    } else
                      requestAnimationFrame(T);
                  };
                  T();
                }
              }, [N.length, a, o, n]);
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
                  V({
                    startIndex: Math.max(0, tt - n),
                    endIndex: Math.min(
                      N.length - 1,
                      tt + et + n
                    )
                  });
                }
              }, [
                N.length,
                p.startIndex,
                o,
                n,
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
                virtualState: St(() => {
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
              const [o, n] = K(
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
                const V = o[p]?.split(".").slice(1), _ = u({
                  currentState: l,
                  path: V,
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
                for (let n = 0; n < o.length; n++) {
                  const a = o[n];
                  if (!a) continue;
                  const d = e.getState().getShadowValue(a);
                  if (s(d, n)) {
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
              const n = [], a = w.filter(
                (d, l) => s(d, l) ? (n.push(o[l]), !0) : !1
              );
              return u({
                currentState: a,
                path: i,
                componentId: M,
                meta: {
                  validIds: n,
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
              const n = w.map((a, d) => ({
                item: a,
                key: o[d]
              }));
              return n.sort((a, d) => s(a.item, d.item)).filter(Boolean), u({
                currentState: n.map((a) => a.item),
                path: i,
                componentId: M,
                meta: {
                  validIds: n.map((a) => a.key),
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
                flushInterval: n = 100,
                bufferStrategy: a = "accumulate",
                store: d,
                onFlush: l
              } = s;
              let p = [], V = !1, _ = null;
              const U = (j) => {
                if (!V) {
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
                    r(P, i, {
                      updateType: "insert"
                    });
                  });
                } else
                  j.forEach((b) => {
                    r(b, i, {
                      updateType: "insert"
                    });
                  });
                l?.(j);
              };
              n > 0 && (_ = setInterval(C, n));
              const F = rt(), x = e.getState().getShadowMetadata(t, i) || {}, N = x.streams || /* @__PURE__ */ new Map();
              return N.set(F, { buffer: p, flushTimer: _ }), e.getState().setShadowMetadata(t, i, {
                ...x,
                streams: N
              }), {
                write: (j) => U(j),
                writeMany: (j) => j.forEach(U),
                flush: () => C(),
                pause: () => {
                  V = !0;
                },
                resume: () => {
                  V = !1, p.length > 0 && C();
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
              const n = q(/* @__PURE__ */ new Map()), a = h?.transforms && h.transforms.length > 0 ? `${M}-${Bt(h.transforms)}` : `${M}-base`, [d, l] = K({}), { validIds: p, arrayValues: V } = St(() => {
                const U = e.getState().getShadowMetadata(t, i)?.transformCaches?.get(a);
                let C;
                U && U.validIds ? C = U.validIds : (C = It(
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
                const U = e.getState().subscribeToPath(c, (C) => {
                  if (C.type === "GET_SELECTED")
                    return;
                  const x = e.getState().getShadowMetadata(t, i)?.transformCaches;
                  if (x)
                    for (const N of x.keys())
                      N.startsWith(M) && x.delete(N);
                  (C.type === "INSERT" || C.type === "REMOVE" || C.type === "CLEAR_SELECTION") && l({});
                });
                return () => {
                  U();
                };
              }, [M, c]), !Array.isArray(V))
                return null;
              const _ = u({
                currentState: V,
                path: i,
                componentId: M,
                meta: {
                  ...h,
                  validIds: p
                }
              });
              return /* @__PURE__ */ ot(Ut, { children: V.map((U, C) => {
                const F = p[C];
                if (!F)
                  return null;
                let x = n.current.get(F);
                x || (x = rt(), n.current.set(F, x));
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
              const o = w;
              y.clear(), I++;
              const n = o.flatMap(
                (a) => a[s] ?? []
              );
              return u({
                currentState: n,
                path: [...i, "[*]", s],
                componentId: M,
                meta: h
              });
            };
          if (m === "index")
            return (s) => {
              const n = e.getState().getShadowMetadata(t, i)?.arrayKeys?.filter(
                (l) => !h?.validIds || h?.validIds && h?.validIds?.includes(l)
              )?.[s];
              if (!n) return;
              const a = e.getState().getShadowValue(n, h?.validIds);
              return u({
                currentState: a,
                path: n.split(".").slice(1),
                componentId: M,
                meta: h
              });
            };
          if (m === "last")
            return () => {
              const s = e.getState().getShadowValue(t, i);
              if (s.length === 0) return;
              const o = s.length - 1, n = s[o], a = [...i, o.toString()];
              return u({
                currentState: n,
                path: a,
                componentId: M,
                meta: h
              });
            };
          if (m === "insert")
            return (s, o) => (r(s, i, { updateType: "insert" }), u({
              currentState: e.getState().getShadowValue(t, i),
              path: i,
              componentId: M,
              meta: h
            }));
          if (m === "uniqueInsert")
            return (s, o, n) => {
              const a = e.getState().getShadowValue(t, i), d = at(s) ? s(a) : s;
              let l = null;
              if (!a.some((V) => {
                const _ = o ? o.every(
                  (U) => st(V[U], d[U])
                ) : st(V, d);
                return _ && (l = V), _;
              }))
                E(i), r(d, i, { updateType: "insert" });
              else if (n && l) {
                const V = n(l), _ = a.map(
                  (U) => st(U, l) ? V : U
                );
                E(i), r(_, i, {
                  updateType: "update"
                });
              }
            };
          if (m === "cut")
            return (s, o) => {
              const n = h?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!n || n.length === 0) return;
              const a = s == -1 ? n.length - 1 : s !== void 0 ? s : n.length - 1, d = n[a];
              if (!d) return;
              const l = d.split(".").slice(1);
              r(w, l, {
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
              let n = s.findIndex(
                (l) => l === o
              );
              const a = s[n == -1 ? s.length - 1 : n]?.split(".").slice(1);
              e.getState().clearSelectedIndex({ arrayKey: c });
              const d = a?.slice(0, -1);
              ft(t, d), r(w, a, {
                updateType: "cut"
              });
            };
          if (m === "cutByValue")
            return (s) => {
              const o = e.getState().getShadowMetadata(t, i), n = h?.validIds ?? o?.arrayKeys;
              if (!n) return;
              let a = null;
              for (const d of n)
                if (e.getState().getShadowValue(d) === s) {
                  a = d;
                  break;
                }
              if (a) {
                const d = a.split(".").slice(1);
                r(null, d, { updateType: "cut" });
              }
            };
          if (m === "toggleByValue")
            return (s) => {
              const o = e.getState().getShadowMetadata(t, i), n = h?.validIds ?? o?.arrayKeys;
              if (!n) return;
              let a = null;
              for (const d of n) {
                const l = e.getState().getShadowValue(d);
                if (console.log("itemValue sdasdasdasd", l), l === s) {
                  a = d;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", a), a) {
                const d = a.split(".").slice(1);
                console.log("itemValue keyToCut", a), r(s, d, {
                  updateType: "cut"
                });
              } else
                r(s, i, { updateType: "insert" });
            };
          if (m === "findWith")
            return (s, o) => {
              const n = e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for sorting");
              let a = null, d = [];
              for (const l of n) {
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
            r(s, i, { updateType: "cut" });
          };
        }
        if (m === "get")
          return () => (Vt(t, M, i), e.getState().getShadowValue(c, h?.validIds));
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
          return (s) => gt(S + "-" + t + "-" + s);
        if (m === "isSelected") {
          const s = [t, ...i].slice(0, -1);
          if (ft(t, i, void 0), Array.isArray(
            e.getState().getShadowValue(s.join("."), h?.validIds)
          )) {
            i[i.length - 1];
            const o = s.join("."), n = e.getState().selectedIndicesMap.get(o), a = t + "." + i.join(".");
            return n === a;
          }
          return;
        }
        if (m === "setSelected")
          return (s) => {
            const o = i.slice(0, -1), n = t + "." + o.join("."), a = t + "." + i.join(".");
            ft(t, o, void 0), e.getState().selectedIndicesMap.get(n), s && e.getState().setSelectedIndex(n, a);
          };
        if (m === "toggleSelected")
          return () => {
            const s = i.slice(0, -1), o = t + "." + s.join("."), n = t + "." + i.join(".");
            e.getState().selectedIndicesMap.get(o) === n ? e.getState().clearSelectedIndex({ arrayKey: o }) : e.getState().setSelectedIndex(o, n);
          };
        if (m === "_componentId")
          return M;
        if (i.length == 0) {
          if (m === "addValidation")
            return (s) => {
              const o = e.getState().getInitialOptions(t)?.validation;
              if (!o?.key) throw new Error("Validation key not found");
              ut(o.key), s.forEach((n) => {
                const a = [o.key, ...n.path].join(".");
                pt(a, n.message);
              }), it(t);
            };
          if (m === "applyJsonPatch")
            return (s) => {
              const o = e.getState(), n = o.getShadowMetadata(t, []);
              if (!n?.components) return;
              const a = (l) => !l || l === "/" ? [] : l.split("/").slice(1).map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const l of s) {
                const p = a(l.path);
                switch (l.op) {
                  case "add":
                  case "replace": {
                    const { value: V } = l;
                    o.updateShadowAtPath(t, p, V), o.markAsDirty(t, p, { bubble: !0 });
                    let _ = [...p];
                    for (; ; ) {
                      const U = o.getShadowMetadata(
                        t,
                        _
                      );
                      if (console.log("pathMeta", U), U?.pathComponents && U.pathComponents.forEach((C) => {
                        if (!d.has(C)) {
                          const F = n.components?.get(C);
                          F && (F.forceUpdate(), d.add(C));
                        }
                      }), _.length === 0) break;
                      _.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const V = p.slice(0, -1);
                    o.removeShadowArrayElement(t, p), o.markAsDirty(t, V, { bubble: !0 });
                    let _ = [...V];
                    for (; ; ) {
                      const U = o.getShadowMetadata(
                        t,
                        _
                      );
                      if (U?.pathComponents && U.pathComponents.forEach((C) => {
                        if (!d.has(C)) {
                          const F = n.components?.get(C);
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
              const n = e.getState().getShadowValue(t), a = o.safeParse(n);
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
          return (s) => (r(s, i, { updateType: "update" }), {
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
              const n = [t, ...i].join(".");
              e.getState().notifyPathSubscribers(n, {
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
            r(!s, i, {
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
              setState: r,
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
      const h = e.getState().getShadowMetadata(t, []);
      h?.stateSource === "server" && h.baseServerState ? h.baseServerState : e.getState().initialStateGlobal[t];
      const M = e.getState().initialStateGlobal[t];
      e.getState().clearSelectedIndexesForState(t), y.clear(), I++, e.getState().initializeShadowState(t, M), u({
        currentState: M,
        path: [],
        componentId: g
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
      const i = Dt(
        t,
        r,
        g,
        S
      ), h = e.getState().initialStateGlobal[t], M = nt(t), z = at(M?.localStorage?.key) ? M?.localStorage?.key(h) : M?.localStorage?.key, c = `${S}-${t}-${z}`;
      return localStorage.getItem(c) && localStorage.removeItem(c), Rt(() => {
        _t(t, w), e.getState().initializeShadowState(t, w);
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
    componentId: g,
    path: []
  });
}
function bt(t) {
  return lt(Gt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: r
}) {
  const g = q(null), S = q(`map-${crypto.randomUUID()}`), y = q(!1), I = q(/* @__PURE__ */ new Map());
  Z(() => {
    const u = g.current;
    if (!u || y.current) return;
    const f = setTimeout(() => {
      const A = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, w = A.mapWrappers || [];
      w.push({
        instanceId: S.current,
        mapFn: t._mapFn,
        containerRef: u,
        rebuildStateShape: r,
        path: t._path,
        componentId: S.current,
        meta: t._meta
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...A,
        mapWrappers: w
      }), y.current = !0, E();
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
  const E = () => {
    const u = g.current;
    if (!u) return;
    const f = e.getState().getShadowValue(
      [t._stateKey, ...t._path].join("."),
      t._meta?.validIds
    );
    if (!Array.isArray(f)) return;
    const A = t._meta?.validIds ?? e.getState().getShadowMetadata(t._stateKey, t._path)?.arrayKeys ?? [], w = r({
      currentState: f,
      path: t._path,
      componentId: S.current,
      meta: t._meta
    });
    f.forEach((i, h) => {
      const M = A[h];
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
          localIndex: h,
          arraySetter: w,
          rebuildStateShape: r,
          renderFn: t._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ ot("div", { ref: g, "data-map-container": S.current });
}
function Gt({
  proxy: t
}) {
  const r = q(null), g = q(null), S = q(!1), y = `${t._stateKey}-${t._path.join(".")}`, I = e.getState().getShadowValue(
    [t._stateKey, ...t._path].join("."),
    t._meta?.validIds
  );
  return Z(() => {
    const E = r.current;
    if (!E || S.current) return;
    const u = setTimeout(() => {
      if (!E.parentElement) {
        console.warn("Parent element not found for signal", y);
        return;
      }
      const f = E.parentElement, w = Array.from(f.childNodes).indexOf(E);
      let i = f.getAttribute("data-parent-id");
      i || (i = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", i)), g.current = `instance-${crypto.randomUUID()}`;
      const h = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, M = h.signals || [];
      M.push({
        instanceId: g.current,
        parentId: i,
        position: w,
        effect: t._effect
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...h,
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
      E.replaceWith(c), S.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(u), g.current) {
        const f = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        f.signals && (f.signals = f.signals.filter(
          (A) => A.instanceId !== g.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, f));
      }
    };
  }, []), lt("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": y
  });
}
const Mt = Ot(
  Yt,
  (t, r) => t.itemPath.join(".") === r.itemPath.join(".") && t.stateKey === r.stateKey && t.itemComponentId === r.itemComponentId && t.localIndex === r.localIndex
), Jt = (t) => {
  const [r, g] = K(!1);
  return dt(() => {
    if (!t.current) {
      g(!0);
      return;
    }
    const S = Array.from(t.current.querySelectorAll("img"));
    if (S.length === 0) {
      g(!0);
      return;
    }
    let y = 0;
    const I = () => {
      y++, y === S.length && g(!0);
    };
    return S.forEach((E) => {
      E.complete ? I() : (E.addEventListener("load", I), E.addEventListener("error", I));
    }), () => {
      S.forEach((E) => {
        E.removeEventListener("load", I), E.removeEventListener("error", I);
      });
    };
  }, [t.current]), r;
};
function Yt({
  stateKey: t,
  itemComponentId: r,
  itemPath: g,
  localIndex: S,
  arraySetter: y,
  rebuildStateShape: I,
  renderFn: E
}) {
  const [, u] = K({}), { ref: f, inView: A } = jt(), w = q(null), i = Jt(w), h = q(!1), M = [t, ...g].join(".");
  $t(t, r, u);
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
    if (!A || !i || h.current)
      return;
    const W = w.current;
    if (W && W.offsetHeight > 0) {
      h.current = !0;
      const m = W.offsetHeight;
      e.getState().setShadowMetadata(t, g, {
        virtualizer: {
          itemHeight: m,
          domRef: W
        }
      });
      const Y = g.slice(0, -1), Q = [t, ...Y].join(".");
      e.getState().notifyPathSubscribers(Q, {
        type: "ITEMHEIGHT",
        itemKey: g.join("."),
        ref: w.current
      });
    }
  }, [A, i, t, g]);
  const c = [t, ...g].join("."), B = e.getState().getShadowValue(c);
  if (B === void 0)
    return null;
  const J = I({
    currentState: B,
    path: g,
    componentId: r
  }), H = E(J, S, y);
  return /* @__PURE__ */ ot("div", { ref: z, children: H });
}
function Zt({
  stateKey: t,
  path: r,
  rebuildStateShape: g,
  renderFn: S,
  formOpts: y,
  setState: I
}) {
  const [E] = K(() => rt()), [, u] = K({}), f = [t, ...r].join(".");
  $t(t, E, u);
  const A = e.getState().getShadowValue(f), [w, i] = K(A), h = q(!1), M = q(null);
  Z(() => {
    !h.current && !st(A, w) && i(A);
  }, [A]), Z(() => {
    const H = e.getState().subscribeToPath(f, (W) => {
      !h.current && w !== W && u({});
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
        h.current = !1, I(H, r, { updateType: "update" });
        const { getInitialOptions: Y, setShadowMetadata: Q, getShadowMetadata: X } = e.getState(), s = Y(t)?.validation, o = s?.zodSchemaV4 || s?.zodSchemaV3;
        if (o) {
          const n = e.getState().getShadowValue(t), a = o.safeParse(n), d = X(t, r) || {};
          if (a.success)
            Q(t, r, {
              ...d,
              validation: {
                status: "VALID_LIVE",
                validatedValue: H
              }
            });
          else {
            const p = ("issues" in a.error ? a.error.issues : a.error.errors).filter(
              (V) => JSON.stringify(V.path) === JSON.stringify(r)
            );
            p.length > 0 ? Q(t, r, {
              ...d,
              validation: {
                status: "INVALID_LIVE",
                message: p[0]?.message,
                validatedValue: H
              }
            }) : Q(t, r, {
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
    [I, r, y?.debounceTime, t]
  ), c = ct(async () => {
    console.log("handleBlur triggered"), M.current && (clearTimeout(M.current), M.current = null, h.current = !1, I(w, r, { updateType: "update" }));
    const { getInitialOptions: H } = e.getState(), W = H(t)?.validation, m = W?.zodSchemaV4 || W?.zodSchemaV3;
    if (!m) return;
    const Y = e.getState().getShadowMetadata(t, r);
    e.getState().setShadowMetadata(t, r, {
      ...Y,
      validation: {
        status: "DIRTY",
        validatedValue: w
      }
    });
    const Q = e.getState().getShadowValue(t), X = m.safeParse(Q);
    if (console.log("result ", X), X.success)
      e.getState().setShadowMetadata(t, r, {
        ...Y,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: w
        }
      });
    else {
      const s = "issues" in X.error ? X.error.issues : X.error.errors;
      console.log("All validation errors:", s), console.log("Current blur path:", r);
      const o = s.filter((n) => {
        if (console.log("Processing error:", n), r.some((d) => d.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const d = r[0].startsWith("id:") ? [] : r.slice(0, -1);
          console.log("Parent path:", d);
          const l = e.getState().getShadowMetadata(t, d);
          if (console.log("Array metadata:", l), l?.arrayKeys) {
            const p = [t, ...r.slice(0, -1)].join("."), V = l.arrayKeys.indexOf(p);
            console.log("Item key:", p, "Index:", V);
            const _ = [...d, V, ...r.slice(-1)], U = JSON.stringify(n.path) === JSON.stringify(_);
            return console.log("Zod path comparison:", {
              zodPath: _,
              errorPath: n.path,
              match: U
            }), U;
          }
        }
        const a = JSON.stringify(n.path) === JSON.stringify(r);
        return console.log("Direct path comparison:", {
          errorPath: n.path,
          currentPath: r,
          match: a
        }), a;
      });
      console.log("Filtered path errors:", o), e.getState().setShadowMetadata(t, r, {
        ...Y,
        validation: {
          status: "VALIDATION_FAILED",
          message: o[0]?.message,
          validatedValue: w
        }
      });
    }
    u({});
  }, [t, r, w, I]), B = g({
    currentState: A,
    path: r,
    componentId: E
  }), J = new Proxy(B, {
    get(H, W) {
      return W === "inputProps" ? {
        value: w ?? "",
        onChange: (m) => {
          z(m.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: c,
        ref: vt.getState().getFormRef(t + "." + r.join("."))
      } : H[W];
    }
  });
  return /* @__PURE__ */ ot(kt, { formOpts: y, path: r, stateKey: t, children: S(J) });
}
function $t(t, r, g) {
  const S = `${t}////${r}`;
  dt(() => {
    const { registerComponent: y, unregisterComponent: I } = e.getState();
    return y(t, S, {
      forceUpdate: () => g({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      I(t, S);
    };
  }, [t, S]);
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
