"use client";
import { jsx as ae, Fragment as Me, jsxs as Ve } from "react/jsx-runtime";
import { memo as Oe, useState as X, useRef as q, useCallback as ce, useEffect as Q, useLayoutEffect as de, useMemo as fe, createElement as le, startTransition as Le } from "react";
import { createRoot as Pe } from "react-dom/client";
import { transformStateFunc as Fe, isFunction as re, isArray as Ee, getDifferences as De, isDeepEqual as se } from "./utility.js";
import { ValidationWrapper as be } from "./Functions.jsx";
import Ne from "superjson";
import { v4 as ne } from "uuid";
import { getGlobalStore as t, formRefStore as ve } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
import { useInView as je } from "react-intersection-observer";
function me(e, o) {
  const S = t.getState().getInitialOptions, g = t.getState().setInitialStateOptions, y = S(e) || {};
  g(e, {
    ...y,
    ...o
  });
}
function Ae({
  stateKey: e,
  options: o,
  initialOptionsPart: S
}) {
  const g = oe(e) || {}, y = S[e] || {}, I = t.getState().setInitialStateOptions, V = { ...y, ...g };
  let u = !1;
  if (o)
    for (const f in o)
      V.hasOwnProperty(f) ? (f == "localStorage" && o[f] && V[f].key !== o[f]?.key && (u = !0, V[f] = o[f]), f == "defaultState" && o[f] && V[f] !== o[f] && !se(V[f], o[f]) && (u = !0, V[f] = o[f])) : (u = !0, V[f] = o[f]);
  u && I(e, V);
}
function it(e, { formElements: o, validation: S }) {
  return { initialState: e, formElements: o, validation: S };
}
const ct = (e, o) => {
  let S = e;
  const [g, y] = Fe(S);
  Object.keys(g).forEach((u) => {
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
      const w = oe(u);
      w ? t.getState().setInitialStateOptions(u, {
        ...w,
        ...A
      }) : t.getState().setInitialStateOptions(u, A);
    }
  }), Object.keys(g).forEach((u) => {
    t.getState().initializeShadowState(u, g[u]);
  });
  const I = (u, f) => {
    const [A] = X(f?.componentId ?? ne());
    Ae({
      stateKey: u,
      options: f,
      initialOptionsPart: y
    });
    const w = t.getState().getShadowValue(u) || g[u], i = f?.modifyState ? f.modifyState(w) : w;
    return ze(i, {
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
    Ae({ stateKey: u, options: f, initialOptionsPart: y }), f.localStorage && He(u, f), ie(u);
  }
  return { useCogsState: I, setCogsOptions: V };
}, {
  getInitialOptions: oe,
  getValidationErrors: lt,
  setStateLog: xe,
  updateInitialStateGlobal: $e,
  addValidationError: ye,
  removeValidationError: ue
} = t.getState(), We = (e, o, S, g, y) => {
  S?.log && console.log(
    "saving to localstorage",
    o,
    S.localStorage?.key,
    g
  );
  const I = re(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (I && g) {
    const V = `${g}-${o}-${I}`;
    let u;
    try {
      u = ge(V)?.lastSyncedWithServer;
    } catch {
    }
    const f = t.getState().getShadowMetadata(o, []), A = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: u,
      stateSource: f?.stateSource,
      baseServerState: f?.baseServerState
    }, w = Ne.serialize(A);
    window.localStorage.setItem(
      V,
      JSON.stringify(w.json)
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
}, He = (e, o) => {
  const S = t.getState().getShadowValue(e), { sessionId: g } = _e(), y = re(o?.localStorage?.key) ? o.localStorage.key(S) : o?.localStorage?.key;
  if (y && g) {
    const I = ge(
      `${g}-${e}-${y}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return ie(e), !0;
  }
  return !1;
}, ie = (e) => {
  const o = t.getState().getShadowMetadata(e, []);
  if (!o) return;
  const S = /* @__PURE__ */ new Set();
  o?.components?.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, ut = (e, o) => {
  const S = t.getState().getShadowMetadata(e, []);
  if (S) {
    const g = `${e}////${o}`, y = S?.components?.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
};
function we(e, o, S, g) {
  const y = t.getState(), I = y.getShadowMetadata(e, o);
  if (y.setShadowMetadata(e, o, {
    ...I,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: g || Date.now()
  }), Array.isArray(S)) {
    const V = y.getShadowMetadata(e, o);
    V?.arrayKeys && V.arrayKeys.forEach((u, f) => {
      const A = u.split(".").slice(1), w = S[f];
      w !== void 0 && we(
        e,
        A,
        w,
        g
      );
    });
  } else S && typeof S == "object" && S.constructor === Object && Object.keys(S).forEach((V) => {
    const u = [...o, V], f = S[V];
    we(e, u, f, g);
  });
}
function ze(e, {
  stateKey: o,
  localStorage: S,
  formElements: g,
  reactiveDeps: y,
  reactiveType: I,
  componentId: V,
  defaultState: u,
  syncUpdate: f,
  dependencies: A,
  serverState: w
} = {}) {
  const [i, h] = X({}), { sessionId: M } = _e();
  let H = !o;
  const [l] = X(o ?? ne()), z = t.getState().stateLog[l], Y = q(/* @__PURE__ */ new Set()), B = q(V ?? ne()), x = q(
    null
  );
  x.current = oe(l) ?? null, Q(() => {
    if (f && f.stateKey === l && f.path?.[0]) {
      const n = `${f.stateKey}:${f.path.join(".")}`;
      t.getState().setSyncInfo(n, {
        timeStamp: f.timeStamp,
        userId: f.userId
      });
    }
  }, [f]);
  const m = ce(
    (n) => {
      const r = n ? { ...oe(l), ...n } : oe(l), d = r?.defaultState || u || e;
      if (r?.serverState?.status === "success" && r?.serverState?.data !== void 0)
        return {
          value: r.serverState.data,
          source: "server",
          timestamp: r.serverState.timestamp || Date.now()
        };
      if (r?.localStorage?.key && M) {
        const p = re(r.localStorage.key) ? r.localStorage.key(d) : r.localStorage.key, b = ge(
          `${M}-${l}-${p}`
        );
        if (b && b.lastUpdated > (r?.serverState?.timestamp || 0))
          return {
            value: b.state,
            source: "localStorage",
            timestamp: b.lastUpdated
          };
      }
      return {
        value: d || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [l, u, e, M]
  );
  Q(() => {
    t.getState().setServerStateUpdate(l, w);
  }, [w, l]), Q(() => t.getState().subscribeToPath(l, (a) => {
    if (a?.type === "SERVER_STATE_UPDATE") {
      const r = a.serverState;
      if (r?.status === "success" && r.data !== void 0) {
        me(l, { serverState: r });
        const c = typeof r.merge == "object" ? r.merge : r.merge === !0 ? {} : null, p = t.getState().getShadowValue(l), b = r.data;
        if (c && Array.isArray(p) && Array.isArray(b)) {
          const U = c.key || "id", C = new Set(
            p.map((W) => W[U])
          ), F = b.filter((W) => !C.has(W[U]));
          F.length > 0 && F.forEach((W) => {
            t.getState().insertShadowArrayElement(l, [], W);
            const L = t.getState().getShadowMetadata(l, []);
            if (L?.arrayKeys) {
              const N = L.arrayKeys[L.arrayKeys.length - 1];
              if (N) {
                const E = N.split(".").slice(1);
                t.getState().setShadowMetadata(l, E, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: r.timestamp || Date.now()
                });
                const k = t.getState().getShadowValue(N);
                k && typeof k == "object" && !Array.isArray(k) && Object.keys(k).forEach((P) => {
                  const R = [...E, P];
                  t.getState().setShadowMetadata(l, R, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: r.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          t.getState().initializeShadowState(l, b), we(
            l,
            [],
            b,
            r.timestamp
          );
        const D = t.getState().getShadowMetadata(l, []);
        t.getState().setShadowMetadata(l, [], {
          ...D,
          stateSource: "server",
          lastServerSync: r.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [l, m]), Q(() => {
    const n = t.getState().getShadowMetadata(l, []);
    if (n && n.stateSource)
      return;
    const a = oe(l);
    if (a?.defaultState !== void 0 || u !== void 0) {
      const r = a?.defaultState || u;
      a?.defaultState || me(l, {
        defaultState: r
      });
      const { value: d, source: c, timestamp: p } = m();
      t.getState().initializeShadowState(l, d), t.getState().setShadowMetadata(l, [], {
        stateSource: c,
        lastServerSync: c === "server" ? p : void 0,
        isDirty: !1,
        baseServerState: c === "server" ? d : void 0
      }), ie(l);
    }
  }, [l, ...A || []]), de(() => {
    H && me(l, {
      formElements: g,
      defaultState: u,
      localStorage: S,
      middleware: x.current?.middleware
    });
    const n = `${l}////${B.current}`, a = t.getState().getShadowMetadata(l, []), r = a?.components || /* @__PURE__ */ new Map();
    return r.set(n, {
      forceUpdate: () => h({}),
      reactiveType: I ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: y || void 0,
      deps: y ? y(t.getState().getShadowValue(l)) : [],
      prevDeps: y ? y(t.getState().getShadowValue(l)) : []
    }), t.getState().setShadowMetadata(l, [], {
      ...a,
      components: r
    }), h({}), () => {
      const d = t.getState().getShadowMetadata(l, []), c = d?.components?.get(n);
      c?.paths && c.paths.forEach((p) => {
        const D = p.split(".").slice(1), U = t.getState().getShadowMetadata(l, D);
        U?.pathComponents && U.pathComponents.size === 0 && (delete U.pathComponents, t.getState().setShadowMetadata(l, D, U));
      }), d?.components && t.getState().setShadowMetadata(l, [], d);
    };
  }, []);
  const J = q(null), te = (n, a, r) => {
    const d = [l, ...a].join(".");
    if (Array.isArray(a)) {
      const E = `${l}-${a.join(".")}`;
      Y.current.add(E);
    }
    const c = t.getState(), p = c.getShadowMetadata(l, a), b = c.getShadowValue(d), D = r.updateType === "insert" && re(n) ? n({ state: b, uuid: ne() }) : re(n) ? n(b) : n, C = {
      timeStamp: Date.now(),
      stateKey: l,
      path: a,
      updateType: r.updateType,
      status: "new",
      oldValue: b,
      newValue: D
    };
    switch (r.updateType) {
      case "insert": {
        c.insertShadowArrayElement(l, a, C.newValue), c.markAsDirty(l, a, { bubble: !0 });
        const E = c.getShadowMetadata(l, a);
        if (E?.arrayKeys) {
          const k = E.arrayKeys[E.arrayKeys.length - 1];
          if (k) {
            const P = k.split(".").slice(1);
            c.markAsDirty(l, P, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const E = a.slice(0, -1);
        c.removeShadowArrayElement(l, a), c.markAsDirty(l, E, { bubble: !0 });
        break;
      }
      case "update": {
        c.updateShadowAtPath(l, a, C.newValue), c.markAsDirty(l, a, { bubble: !0 });
        break;
      }
    }
    if (r.sync !== !1 && J.current && J.current.connected && J.current.updateState({ operation: C }), p?.signals && p.signals.length > 0) {
      const E = r.updateType === "cut" ? null : D;
      p.signals.forEach(({ parentId: k, position: P, effect: R }) => {
        const v = document.querySelector(`[data-parent-id="${k}"]`);
        if (v) {
          const T = Array.from(v.childNodes);
          if (T[P]) {
            let $ = E;
            if (R && E !== null)
              try {
                $ = new Function(
                  "state",
                  `return (${R})(state)`
                )(E);
              } catch (_) {
                console.error("Error evaluating effect function:", _);
              }
            $ != null && typeof $ == "object" && ($ = JSON.stringify($)), T[P].textContent = String($ ?? "");
          }
        }
      });
    }
    if (r.updateType === "insert" && p?.mapWrappers && p.mapWrappers.length > 0) {
      const E = c.getShadowMetadata(l, a)?.arrayKeys || [], k = E[E.length - 1], P = c.getShadowValue(k), R = c.getShadowValue(
        [l, ...a].join(".")
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
            const _ = Ie(
              l,
              a,
              v.meta.transforms
            ), O = v.meta.transforms.find(
              (j) => j.type === "sort"
            );
            if (O) {
              const j = _.map((G) => ({
                key: G,
                value: c.getShadowValue(G)
              }));
              j.push({ key: k, value: P }), j.sort((G, K) => O.fn(G.value, K.value)), $ = j.findIndex(
                (G) => G.key === k
              );
            } else
              $ = _.length;
          }
        } else
          T = !0, $ = E.length - 1;
        if (T && v.containerRef && v.containerRef.isConnected) {
          const _ = document.createElement("div");
          _.setAttribute("data-item-path", k);
          const O = Array.from(v.containerRef.children);
          $ >= 0 && $ < O.length ? v.containerRef.insertBefore(
            _,
            O[$]
          ) : v.containerRef.appendChild(_);
          const j = Pe(_), G = ne(), K = k.split(".").slice(1), ee = v.rebuildStateShape({
            path: v.path,
            currentState: R,
            componentId: v.componentId,
            meta: v.meta
          });
          j.render(
            le(Te, {
              stateKey: l,
              itemComponentId: G,
              itemPath: K,
              localIndex: $,
              arraySetter: ee,
              rebuildStateShape: v.rebuildStateShape,
              renderFn: v.mapFn
            })
          );
        }
      });
    }
    if (r.updateType === "cut") {
      const E = a.slice(0, -1), k = c.getShadowMetadata(l, E);
      k?.mapWrappers && k.mapWrappers.length > 0 && k.mapWrappers.forEach((P) => {
        if (P.containerRef && P.containerRef.isConnected) {
          const R = P.containerRef.querySelector(
            `[data-item-path="${d}"]`
          );
          R && R.remove();
        }
      });
    }
    const W = t.getState().getShadowValue(l), L = t.getState().getShadowMetadata(l, []), N = /* @__PURE__ */ new Set();
    if (console.log(
      "rootMeta",
      l,
      t.getState().shadowStateStore
    ), !L?.components)
      return W;
    if (r.updateType === "update") {
      let E = [...a];
      for (; ; ) {
        const k = c.getShadowMetadata(l, E);
        if (k?.pathComponents && k.pathComponents.forEach((P) => {
          if (N.has(P))
            return;
          const R = L.components?.get(P);
          R && ((Array.isArray(R.reactiveType) ? R.reactiveType : [R.reactiveType || "component"]).includes("none") || (R.forceUpdate(), N.add(P)));
        }), E.length === 0)
          break;
        E.pop();
      }
      D && typeof D == "object" && !Ee(D) && b && typeof b == "object" && !Ee(b) && De(D, b).forEach((P) => {
        const R = P.split("."), v = [...a, ...R], T = c.getShadowMetadata(l, v);
        T?.pathComponents && T.pathComponents.forEach(($) => {
          if (N.has($))
            return;
          const _ = L.components?.get($);
          _ && ((Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"]).includes("none") || (_.forceUpdate(), N.add($)));
        });
      });
    } else if (r.updateType === "insert" || r.updateType === "cut") {
      const E = r.updateType === "insert" ? a : a.slice(0, -1), k = c.getShadowMetadata(l, E);
      if (k?.signals && k.signals.length > 0) {
        const P = [l, ...E].join("."), R = c.getShadowValue(P);
        k.signals.forEach(({ parentId: v, position: T, effect: $ }) => {
          const _ = document.querySelector(
            `[data-parent-id="${v}"]`
          );
          if (_) {
            const O = Array.from(_.childNodes);
            if (O[T]) {
              let j = R;
              if ($)
                try {
                  j = new Function(
                    "state",
                    `return (${$})(state)`
                  )(R);
                } catch (G) {
                  console.error("Error evaluating effect function:", G), j = R;
                }
              j != null && typeof j == "object" && (j = JSON.stringify(j)), O[T].textContent = String(j ?? "");
            }
          }
        });
      }
      k?.pathComponents && k.pathComponents.forEach((P) => {
        if (!N.has(P)) {
          const R = L.components?.get(P);
          R && (R.forceUpdate(), N.add(P));
        }
      });
    }
    return L.components.forEach((E, k) => {
      if (N.has(k))
        return;
      const P = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
      if (P.includes("all")) {
        E.forceUpdate(), N.add(k);
        return;
      }
      if (P.includes("deps") && E.depsFunction) {
        const R = c.getShadowValue(l), v = E.depsFunction(R);
        let T = !1;
        v === !0 ? T = !0 : Array.isArray(v) && (se(E.prevDeps, v) || (E.prevDeps = v, T = !0)), T && (E.forceUpdate(), N.add(k));
      }
    }), N.clear(), xe(l, (E) => {
      const k = [...E ?? [], C], P = /* @__PURE__ */ new Map();
      return k.forEach((R) => {
        const v = `${R.stateKey}:${JSON.stringify(R.path)}`, T = P.get(v);
        T ? (T.timeStamp = Math.max(T.timeStamp, R.timeStamp), T.newValue = R.newValue, T.oldValue = T.oldValue ?? R.oldValue, T.updateType = R.updateType) : P.set(v, { ...R });
      }), Array.from(P.values());
    }), We(
      D,
      l,
      x.current,
      M
    ), x.current?.middleware && x.current.middleware({
      updateLog: z,
      update: C
    }), W;
  };
  t.getState().initialStateGlobal[l] || $e(l, e);
  const Z = fe(() => Ue(
    l,
    te,
    B.current,
    M
  ), [l, M]), s = x.current?.cogsSync;
  return s && (J.current = s(Z)), Z;
}
function Be(e) {
  return !e || e.length === 0 ? "" : e.map(
    (o) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${o.type}${JSON.stringify(o.dependencies || [])}`
    )
  ).join("");
}
const Ie = (e, o, S) => {
  let g = t.getState().getShadowMetadata(e, o)?.arrayKeys || [];
  if (!S || S.length === 0)
    return g;
  let y = g.map((I) => ({
    key: I,
    value: t.getState().getShadowValue(I)
  }));
  for (const I of S)
    I.type === "filter" ? y = y.filter(
      ({ value: V }, u) => I.fn(V, u)
    ) : I.type === "sort" && y.sort((V, u) => I.fn(V.value, u.value));
  return y.map(({ key: I }) => I);
}, Ce = (e, o, S) => {
  const g = `${e}////${o}`, { addPathComponent: y, getShadowMetadata: I } = t.getState(), u = I(e, [])?.components?.get(g);
  !u || u.reactiveType === "none" || !(Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType]).includes("component") || y(e, S, g);
}, pe = (e, o, S) => {
  const g = t.getState(), y = g.getShadowMetadata(e, []), I = /* @__PURE__ */ new Set();
  y?.components && y.components.forEach((u, f) => {
    (Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"]).includes("all") && (u.forceUpdate(), I.add(f));
  }), g.getShadowMetadata(e, [...o, "getSelected"])?.pathComponents?.forEach((u) => {
    y?.components?.get(u)?.forceUpdate();
  });
  const V = g.getShadowMetadata(e, o);
  for (let u of V?.arrayKeys || []) {
    const f = u + ".selected", A = g.getShadowMetadata(
      e,
      f.split(".").slice(1)
    );
    u == S && A?.pathComponents?.forEach((w) => {
      y?.components?.get(w)?.forceUpdate();
    });
  }
};
function Ue(e, o, S, g) {
  const y = /* @__PURE__ */ new Map();
  let I = 0;
  const V = (w) => {
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
    const H = i.map(String).join("."), l = [e, ...i].join(".");
    w = t.getState().getShadowValue(l, h?.validIds);
    const z = function() {
      return t().getShadowValue(e, i);
    }, Y = {
      apply(x, m, J) {
      },
      get(x, m) {
        if (m === "_rebuildStateShape")
          return u;
        if (Object.getOwnPropertyNames(f).includes(m) && i.length === 0)
          return f[m];
        if (m === "getDifferences")
          return () => {
            const s = t.getState().getShadowMetadata(e, []), n = t.getState().getShadowValue(e);
            let a;
            return s?.stateSource === "server" && s.baseServerState ? a = s.baseServerState : a = t.getState().initialStateGlobal[e], De(n, a);
          };
        if (m === "sync" && i.length === 0)
          return async function() {
            const s = t.getState().getInitialOptions(e), n = s?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const a = t.getState().getShadowValue(e, []), r = s?.validation?.key;
            try {
              const d = await n.action(a);
              if (d && !d.success && d.errors && r && (t.getState().removeValidationError(r), d.errors.forEach((c) => {
                const p = [r, ...c.path].join(".");
                t.getState().addValidationError(p, c.message);
              }), ie(e)), d?.success) {
                const c = t.getState().getShadowMetadata(e, []);
                t.getState().setShadowMetadata(e, [], {
                  ...c,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: a
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
            const n = t.getState().getShadowMetadata(e, i), a = t.getState().getShadowValue(l);
            return n?.isDirty === !0 ? "dirty" : n?.isDirty === !1 || n?.stateSource === "server" ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" ? "fresh" : t.getState().getShadowMetadata(e, [])?.stateSource === "server" && !n?.isDirty ? "synced" : a !== void 0 && !n ? "fresh" : "unknown";
          };
          return m === "_status" ? s() : s;
        }
        if (m === "removeStorage")
          return () => {
            const s = t.getState().initialStateGlobal[e], n = oe(e), a = re(n?.localStorage?.key) ? n.localStorage.key(s) : n?.localStorage?.key, r = `${g}-${e}-${a}`;
            r && localStorage.removeItem(r);
          };
        if (m === "showValidationErrors")
          return () => {
            const s = t.getState().getShadowMetadata(e, i);
            return s?.validation?.status === "VALIDATION_FAILED" && s.validation.message ? [s.validation.message] : [];
          };
        if (Array.isArray(w)) {
          if (m === "getSelected")
            return () => {
              const s = e + "." + i.join(".");
              Ce(e, M, [
                ...i,
                "getSelected"
              ]);
              const n = t.getState().selectedIndicesMap;
              if (!n || !n.has(s))
                return;
              const a = n.get(s);
              if (h?.validIds && !h.validIds.includes(a))
                return;
              const r = t.getState().getShadowValue(a);
              if (r)
                return u({
                  currentState: r,
                  path: a.split(".").slice(1),
                  componentId: M
                });
            };
          if (m === "getSelectedIndex")
            return () => t.getState().getSelectedIndex(
              e + "." + i.join("."),
              h?.validIds
            );
          if (m === "clearSelected")
            return pe(e, i), () => {
              t.getState().clearSelectedIndex({
                arrayKey: e + "." + i.join(".")
              });
            };
          if (m === "useVirtualView")
            return (s) => {
              const {
                itemHeight: n = 50,
                overscan: a = 6,
                stickToBottom: r = !1,
                scrollStickTolerance: d = 75
              } = s, c = q(null), [p, b] = X({
                startIndex: 0,
                endIndex: 10
              }), [D, U] = X({}), C = q(!0), F = q({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), W = q(
                /* @__PURE__ */ new Map()
              );
              de(() => {
                if (!r || !c.current || F.current.isUserScrolling)
                  return;
                const v = c.current;
                v.scrollTo({
                  top: v.scrollHeight,
                  behavior: C.current ? "instant" : "smooth"
                });
              }, [D, r]);
              const L = t.getState().getShadowMetadata(e, i)?.arrayKeys || [], { totalHeight: N, itemOffsets: E } = fe(() => {
                let v = 0;
                const T = /* @__PURE__ */ new Map();
                return (t.getState().getShadowMetadata(e, i)?.arrayKeys || []).forEach((_) => {
                  const O = _.split(".").slice(1), j = t.getState().getShadowMetadata(e, O)?.virtualizer?.itemHeight || n;
                  T.set(_, {
                    height: j,
                    offset: v
                  }), v += j;
                }), W.current = T, { totalHeight: v, itemOffsets: T };
              }, [L.length, n]);
              de(() => {
                if (r && L.length > 0 && c.current && !F.current.isUserScrolling && C.current) {
                  const v = c.current, T = () => {
                    if (v.clientHeight > 0) {
                      const $ = Math.ceil(
                        v.clientHeight / n
                      ), _ = L.length - 1, O = Math.max(
                        0,
                        _ - $ - a
                      );
                      b({ startIndex: O, endIndex: _ }), requestAnimationFrame(() => {
                        P("instant"), C.current = !1;
                      });
                    } else
                      requestAnimationFrame(T);
                  };
                  T();
                }
              }, [L.length, r, n, a]);
              const k = ce(() => {
                const v = c.current;
                if (!v) return;
                const T = v.scrollTop, { scrollHeight: $, clientHeight: _ } = v, O = F.current, j = $ - (T + _), G = O.isNearBottom;
                O.isNearBottom = j <= d, T < O.lastScrollTop ? (O.scrollUpCount++, O.scrollUpCount > 3 && G && (O.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : O.isNearBottom && (O.isUserScrolling = !1, O.scrollUpCount = 0), O.lastScrollTop = T;
                let K = 0;
                for (let ee = 0; ee < L.length; ee++) {
                  const Se = L[ee], he = W.current.get(Se);
                  if (he && he.offset + he.height > T) {
                    K = ee;
                    break;
                  }
                }
                if (K !== p.startIndex) {
                  const ee = Math.ceil(_ / n);
                  b({
                    startIndex: Math.max(0, K - a),
                    endIndex: Math.min(
                      L.length - 1,
                      K + ee + a
                    )
                  });
                }
              }, [
                L.length,
                p.startIndex,
                n,
                a,
                d
              ]);
              Q(() => {
                const v = c.current;
                if (!(!v || !r))
                  return v.addEventListener("scroll", k, {
                    passive: !0
                  }), () => {
                    v.removeEventListener("scroll", k);
                  };
              }, [k, r]);
              const P = ce(
                (v = "smooth") => {
                  const T = c.current;
                  if (!T) return;
                  F.current.isUserScrolling = !1, F.current.isNearBottom = !0, F.current.scrollUpCount = 0;
                  const $ = () => {
                    const _ = (O = 0) => {
                      if (O > 5) return;
                      const j = T.scrollHeight, G = T.scrollTop, K = T.clientHeight;
                      G + K >= j - 1 || (T.scrollTo({
                        top: j,
                        behavior: v
                      }), setTimeout(() => {
                        const ee = T.scrollHeight, Se = T.scrollTop;
                        (ee !== j || Se + K < ee - 1) && _(O + 1);
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
              return Q(() => {
                if (!r || !c.current) return;
                const v = c.current, T = F.current;
                let $;
                const _ = () => {
                  clearTimeout($), $ = setTimeout(() => {
                    !T.isUserScrolling && T.isNearBottom && P(
                      C.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, O = new MutationObserver(() => {
                  T.isUserScrolling || _();
                });
                O.observe(v, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const j = (G) => {
                  G.target instanceof HTMLImageElement && !T.isUserScrolling && _();
                };
                return v.addEventListener("load", j, !0), C.current ? setTimeout(() => {
                  P("instant");
                }, 0) : _(), () => {
                  clearTimeout($), O.disconnect(), v.removeEventListener("load", j, !0);
                };
              }, [r, L.length, P]), {
                virtualState: fe(() => {
                  const v = t.getState(), T = v.getShadowValue(
                    [e, ...i].join(".")
                  ), $ = v.getShadowMetadata(e, i)?.arrayKeys || [], _ = T.slice(
                    p.startIndex,
                    p.endIndex + 1
                  ), O = $.slice(
                    p.startIndex,
                    p.endIndex + 1
                  );
                  return u({
                    currentState: _,
                    path: i,
                    componentId: M,
                    meta: { ...h, validIds: O }
                  });
                }, [p.startIndex, p.endIndex, L.length]),
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
                      height: `${N}px`,
                      position: "relative"
                    }
                  },
                  list: {
                    style: {
                      transform: `translateY(${W.current.get(
                        L[p.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: P,
                scrollToIndex: (v, T = "smooth") => {
                  if (c.current && L[v]) {
                    const $ = W.current.get(L[v])?.offset || 0;
                    c.current.scrollTo({ top: $, behavior: T });
                  }
                }
              };
            };
          if (m === "stateMap")
            return (s) => {
              const [n, a] = X(
                h?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys
              ), r = t.getState().getShadowValue(l, h?.validIds);
              if (!n)
                throw new Error("No array keys found for mapping");
              const d = u({
                currentState: r,
                path: i,
                componentId: M,
                meta: h
              });
              return r.map((c, p) => {
                const b = n[p]?.split(".").slice(1), D = u({
                  currentState: c,
                  path: b,
                  componentId: M,
                  meta: h
                });
                return s(
                  D,
                  p,
                  d
                );
              });
            };
          if (m === "$stateMap")
            return (s) => le(qe, {
              proxy: {
                _stateKey: e,
                _path: i,
                _mapFn: s,
                _meta: h
              },
              rebuildStateShape: u
            });
          if (m === "stateFind")
            return (s) => {
              const n = h?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (n)
                for (let a = 0; a < n.length; a++) {
                  const r = n[a];
                  if (!r) continue;
                  const d = t.getState().getShadowValue(r);
                  if (s(d, a)) {
                    const c = r.split(".").slice(1);
                    return u({
                      currentState: d,
                      path: c,
                      componentId: M,
                      meta: h
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (m === "stateFilter")
            return (s) => {
              const n = h?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for filtering.");
              const a = [], r = w.filter(
                (d, c) => s(d, c) ? (a.push(n[c]), !0) : !1
              );
              return u({
                currentState: r,
                path: i,
                componentId: M,
                meta: {
                  validIds: a,
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
              const n = h?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for sorting");
              const a = w.map((r, d) => ({
                item: r,
                key: n[d]
              }));
              return a.sort((r, d) => s(r.item, d.item)).filter(Boolean), u({
                currentState: a.map((r) => r.item),
                path: i,
                componentId: M,
                meta: {
                  validIds: a.map((r) => r.key),
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
                bufferSize: n = 100,
                flushInterval: a = 100,
                bufferStrategy: r = "accumulate",
                store: d,
                onFlush: c
              } = s;
              let p = [], b = !1, D = null;
              const U = (N) => {
                if (!b) {
                  if (r === "sliding" && p.length >= n)
                    p.shift();
                  else if (r === "dropping" && p.length >= n)
                    return;
                  p.push(N), p.length >= n && C();
                }
              }, C = () => {
                if (p.length === 0) return;
                const N = [...p];
                if (p = [], d) {
                  const E = d(N);
                  E !== void 0 && (Array.isArray(E) ? E : [E]).forEach((P) => {
                    o(P, i, {
                      updateType: "insert"
                    });
                  });
                } else
                  N.forEach((E) => {
                    o(E, i, {
                      updateType: "insert"
                    });
                  });
                c?.(N);
              };
              a > 0 && (D = setInterval(C, a));
              const F = ne(), W = t.getState().getShadowMetadata(e, i) || {}, L = W.streams || /* @__PURE__ */ new Map();
              return L.set(F, { buffer: p, flushTimer: D }), t.getState().setShadowMetadata(e, i, {
                ...W,
                streams: L
              }), {
                write: (N) => U(N),
                writeMany: (N) => N.forEach(U),
                flush: () => C(),
                pause: () => {
                  b = !0;
                },
                resume: () => {
                  b = !1, p.length > 0 && C();
                },
                close: () => {
                  C(), D && clearInterval(D);
                  const N = t.getState().getShadowMetadata(e, i);
                  N?.streams && N.streams.delete(F);
                }
              };
            };
          if (m === "stateList")
            return (s) => /* @__PURE__ */ ae(() => {
              const a = q(/* @__PURE__ */ new Map()), r = h?.transforms && h.transforms.length > 0 ? `${M}-${Be(h.transforms)}` : `${M}-base`, [d, c] = X({}), { validIds: p, arrayValues: b } = fe(() => {
                const U = t.getState().getShadowMetadata(e, i)?.transformCaches?.get(r);
                let C;
                U && U.validIds ? C = U.validIds : (C = Ie(
                  e,
                  i,
                  h?.transforms
                ), t.getState().setTransformCache(e, i, r, {
                  validIds: C,
                  computedAt: Date.now(),
                  transforms: h?.transforms || []
                }));
                const F = t.getState().getShadowValue(l, C);
                return {
                  validIds: C,
                  arrayValues: F || []
                };
              }, [r, d]);
              if (console.log("freshValues", p, b), Q(() => {
                const U = t.getState().subscribeToPath(l, (C) => {
                  if (C.type === "GET_SELECTED")
                    return;
                  const W = t.getState().getShadowMetadata(e, i)?.transformCaches;
                  if (W)
                    for (const L of W.keys())
                      L.startsWith(M) && W.delete(L);
                  (C.type === "INSERT" || C.type === "REMOVE" || C.type === "CLEAR_SELECTION") && c({});
                });
                return () => {
                  U();
                };
              }, [M, l]), !Array.isArray(b))
                return null;
              const D = u({
                currentState: b,
                path: i,
                componentId: M,
                meta: {
                  ...h,
                  validIds: p
                }
              });
              return console.log("sssssssssssssssssssssssssssss", D), /* @__PURE__ */ ae(Me, { children: b.map((U, C) => {
                const F = p[C];
                if (!F)
                  return null;
                let W = a.current.get(F);
                W || (W = ne(), a.current.set(F, W));
                const L = F.split(".").slice(1);
                return le(Te, {
                  key: F,
                  stateKey: e,
                  itemComponentId: W,
                  itemPath: L,
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
              const a = n.flatMap(
                (r) => r[s] ?? []
              );
              return u({
                currentState: a,
                path: [...i, "[*]", s],
                componentId: M,
                meta: h
              });
            };
          if (m === "index")
            return (s) => {
              const a = t.getState().getShadowMetadata(e, i)?.arrayKeys?.filter(
                (c) => !h?.validIds || h?.validIds && h?.validIds?.includes(c)
              )?.[s];
              if (!a) return;
              const r = t.getState().getShadowValue(a, h?.validIds);
              return u({
                currentState: r,
                path: a.split(".").slice(1),
                componentId: M,
                meta: h
              });
            };
          if (m === "last")
            return () => {
              const s = t.getState().getShadowValue(e, i);
              if (s.length === 0) return;
              const n = s.length - 1, a = s[n], r = [...i, n.toString()];
              return u({
                currentState: a,
                path: r,
                componentId: M,
                meta: h
              });
            };
          if (m === "insert")
            return (s, n) => (o(s, i, { updateType: "insert" }), u({
              currentState: t.getState().getShadowValue(e, i),
              path: i,
              componentId: M,
              meta: h
            }));
          if (m === "uniqueInsert")
            return (s, n, a) => {
              const r = t.getState().getShadowValue(e, i), d = re(s) ? s(r) : s;
              let c = null;
              if (!r.some((b) => {
                const D = n ? n.every(
                  (U) => se(b[U], d[U])
                ) : se(b, d);
                return D && (c = b), D;
              }))
                V(i), o(d, i, { updateType: "insert" });
              else if (a && c) {
                const b = a(c), D = r.map(
                  (U) => se(U, c) ? b : U
                );
                V(i), o(D, i, {
                  updateType: "update"
                });
              }
            };
          if (m === "cut")
            return (s, n) => {
              const a = h?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (!a || a.length === 0) return;
              const r = s == -1 ? a.length - 1 : s !== void 0 ? s : a.length - 1, d = a[r];
              if (!d) return;
              const c = d.split(".").slice(1);
              o(w, c, {
                updateType: "cut"
              });
            };
          if (m === "cutSelected")
            return () => {
              t.getState().getShadowMetadata(e, i)?.arrayKeys;
              const s = Ie(
                e,
                i,
                h?.transforms
              );
              if (console.log("validKeys", s), !s || s.length === 0) return;
              const n = t.getState().selectedIndicesMap.get(l);
              let a = s.findIndex(
                (d) => d === n
              );
              console.log("indexToCut", a);
              const r = s[a == -1 ? s.length - 1 : a]?.split(".").slice(1);
              console.log("pathForCut", r), o(w, r, {
                updateType: "cut"
              });
            };
          if (m === "cutByValue")
            return (s) => {
              const n = t.getState().getShadowMetadata(e, i), a = h?.validIds ?? n?.arrayKeys;
              if (!a) return;
              let r = null;
              for (const d of a)
                if (t.getState().getShadowValue(d) === s) {
                  r = d;
                  break;
                }
              if (r) {
                const d = r.split(".").slice(1);
                o(null, d, { updateType: "cut" });
              }
            };
          if (m === "toggleByValue")
            return (s) => {
              const n = t.getState().getShadowMetadata(e, i), a = h?.validIds ?? n?.arrayKeys;
              if (!a) return;
              let r = null;
              for (const d of a) {
                const c = t.getState().getShadowValue(d);
                if (console.log("itemValue sdasdasdasd", c), c === s) {
                  r = d;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", r), r) {
                const d = r.split(".").slice(1);
                console.log("itemValue keyToCut", r), o(s, d, {
                  updateType: "cut"
                });
              } else
                o(s, i, { updateType: "insert" });
            };
          if (m === "findWith")
            return (s, n) => {
              const a = t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (!a)
                throw new Error("No array keys found for sorting");
              let r = null, d = [];
              for (const c of a) {
                let p = t.getState().getShadowValue(c, h?.validIds);
                if (p && p[s] === n) {
                  r = p, d = c.split(".").slice(1);
                  break;
                }
              }
              return u({
                currentState: r,
                path: d,
                componentId: M,
                meta: h
              });
            };
        }
        if (m === "cut") {
          let s = t.getState().getShadowValue(i.join("."));
          return () => {
            o(s, i, { updateType: "cut" });
          };
        }
        if (m === "get")
          return () => (Ce(e, M, i), t.getState().getShadowValue(l, h?.validIds));
        if (m === "getState")
          return () => t.getState().getShadowValue(l, h?.validIds);
        if (m === "$derive")
          return (s) => ke({
            _stateKey: e,
            _path: i,
            _effect: s.toString(),
            _meta: h
          });
        if (m === "$get")
          return () => ke({ _stateKey: e, _path: i, _meta: h });
        if (m === "lastSynced") {
          const s = `${e}:${i.join(".")}`;
          return t.getState().getSyncInfo(s);
        }
        if (m == "getLocalStorage")
          return (s) => ge(g + "-" + e + "-" + s);
        if (m === "isSelected") {
          const s = [e, ...i].slice(0, -1);
          if (pe(e, i, void 0), Array.isArray(
            t.getState().getShadowValue(s.join("."), h?.validIds)
          )) {
            i[i.length - 1];
            const n = s.join("."), a = t.getState().selectedIndicesMap.get(n), r = e + "." + i.join(".");
            return a === r;
          }
          return;
        }
        if (m === "setSelected")
          return (s) => {
            const n = i.slice(0, -1), a = e + "." + n.join("."), r = e + "." + i.join(".");
            pe(e, n, void 0), t.getState().selectedIndicesMap.get(a), s && t.getState().setSelectedIndex(a, r);
          };
        if (m === "toggleSelected")
          return () => {
            const s = i.slice(0, -1), n = e + "." + s.join("."), a = e + "." + i.join(".");
            t.getState().selectedIndicesMap.get(n) === a ? t.getState().clearSelectedIndex({ arrayKey: n }) : t.getState().setSelectedIndex(n, a);
          };
        if (m === "_componentId")
          return M;
        if (i.length == 0) {
          if (m === "addValidation")
            return (s) => {
              const n = t.getState().getInitialOptions(e)?.validation;
              if (!n?.key) throw new Error("Validation key not found");
              ue(n.key), s.forEach((a) => {
                const r = [n.key, ...a.path].join(".");
                ye(r, a.message);
              }), ie(e);
            };
          if (m === "applyJsonPatch")
            return (s) => {
              const n = t.getState(), a = n.getShadowMetadata(e, []);
              if (!a?.components) return;
              const r = (c) => !c || c === "/" ? [] : c.split("/").slice(1).map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const c of s) {
                const p = r(c.path);
                switch (c.op) {
                  case "add":
                  case "replace": {
                    const { value: b } = c;
                    n.updateShadowAtPath(e, p, b), n.markAsDirty(e, p, { bubble: !0 });
                    let D = [...p];
                    for (; ; ) {
                      const U = n.getShadowMetadata(
                        e,
                        D
                      );
                      if (console.log("pathMeta", U), U?.pathComponents && U.pathComponents.forEach((C) => {
                        if (!d.has(C)) {
                          const F = a.components?.get(C);
                          F && (F.forceUpdate(), d.add(C));
                        }
                      }), D.length === 0) break;
                      D.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const b = p.slice(0, -1);
                    n.removeShadowArrayElement(e, p), n.markAsDirty(e, b, { bubble: !0 });
                    let D = [...b];
                    for (; ; ) {
                      const U = n.getShadowMetadata(
                        e,
                        D
                      );
                      if (U?.pathComponents && U.pathComponents.forEach((C) => {
                        if (!d.has(C)) {
                          const F = a.components?.get(C);
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
              const s = t.getState().getInitialOptions(e)?.validation, n = s?.zodSchemaV4 || s?.zodSchemaV3;
              if (!n || !s?.key)
                throw new Error(
                  "Zod schema (v3 or v4) or validation key not found"
                );
              ue(s.key);
              const a = t.getState().getShadowValue(e), r = n.safeParse(a);
              return r.success ? !0 : ("issues" in r.error ? r.error.issues.forEach((d) => {
                const c = [s.key, ...d.path].join(".");
                ye(c, d.message);
              }) : r.error.errors.forEach((d) => {
                const c = [s.key, ...d.path].join(".");
                ye(c, d.message);
              }), ie(e), !1);
            };
          if (m === "getComponents")
            return () => t.getState().getShadowMetadata(e, [])?.components;
          if (m === "getAllFormRefs")
            return () => ve.getState().getFormRefsByStateKey(e);
        }
        if (m === "getFormRef")
          return () => ve.getState().getFormRef(e + "." + i.join("."));
        if (m === "validationWrapper")
          return ({
            children: s,
            hideMessage: n
          }) => /* @__PURE__ */ ae(
            be,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: i,
              stateKey: e,
              children: s
            }
          );
        if (m === "_stateKey") return e;
        if (m === "_path") return i;
        if (m === "update")
          return (s) => (o(s, i, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const n = t.getState().getShadowMetadata(e, i);
              t.getState().setShadowMetadata(e, i, {
                ...n,
                isDirty: !1,
                // EXPLICITLY set to false, not just undefined
                stateSource: "server",
                // Mark as coming from server
                lastServerSync: Date.now()
                // Add timestamp
              });
              const a = [e, ...i].join(".");
              t.getState().notifyPathSubscribers(a, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (m === "toggle") {
          const s = t.getState().getShadowValue([e, ...i].join("."));
          if (console.log("currentValueAtPath", s), typeof w != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            o(!s, i, {
              updateType: "update"
            });
          };
        }
        if (m === "formElement")
          return (s, n) => /* @__PURE__ */ ae(
            be,
            {
              formOpts: n,
              path: i,
              stateKey: e,
              children: /* @__PURE__ */ ae(
                Ze,
                {
                  stateKey: e,
                  path: i,
                  rebuildStateShape: u,
                  setState: o,
                  formOpts: n,
                  renderFn: s
                }
              )
            }
          );
        const te = [...i, m], Z = t.getState().getShadowValue(e, te);
        return u({
          currentState: Z,
          path: te,
          componentId: M,
          meta: h
        });
      }
    }, B = new Proxy(z, Y);
    return y.set(H, {
      proxy: B,
      stateVersion: I
    }), B;
  }
  const f = {
    removeValidation: (w) => {
      w?.validationKey && ue(w.validationKey);
    },
    revertToInitialState: (w) => {
      const i = t.getState().getInitialOptions(e)?.validation;
      i?.key && ue(i.key), w?.validationKey && ue(w.validationKey);
      const h = t.getState().getShadowMetadata(e, []);
      h?.stateSource === "server" && h.baseServerState ? h.baseServerState : t.getState().initialStateGlobal[e];
      const M = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), y.clear(), I++, t.getState().initializeShadowState(e, M), u({
        currentState: M,
        path: [],
        componentId: S
      });
      const H = oe(e), l = re(H?.localStorage?.key) ? H?.localStorage?.key(M) : H?.localStorage?.key, z = `${g}-${e}-${l}`;
      z && localStorage.removeItem(z);
      const Y = t.getState().getShadowMetadata(e, []);
      return Y && Y?.components?.forEach((B) => {
        B.forceUpdate();
      }), M;
    },
    updateInitialState: (w) => {
      y.clear(), I++;
      const i = Ue(
        e,
        o,
        S,
        g
      ), h = t.getState().initialStateGlobal[e], M = oe(e), H = re(M?.localStorage?.key) ? M?.localStorage?.key(h) : M?.localStorage?.key, l = `${g}-${e}-${H}`;
      return localStorage.getItem(l) && localStorage.removeItem(l), Le(() => {
        $e(e, w), t.getState().initializeShadowState(e, w);
        const z = t.getState().getShadowMetadata(e, []);
        z && z?.components?.forEach((Y) => {
          Y.forceUpdate();
        });
      }), {
        fetchId: (z) => i.get()[z]
      };
    }
  };
  return u({
    currentState: t.getState().getShadowValue(e, []),
    componentId: S,
    path: []
  });
}
function ke(e) {
  return le(Ge, { proxy: e });
}
function qe({
  proxy: e,
  rebuildStateShape: o
}) {
  const S = q(null), g = q(`map-${crypto.randomUUID()}`), y = q(!1), I = q(/* @__PURE__ */ new Map());
  Q(() => {
    const u = S.current;
    if (!u || y.current) return;
    const f = setTimeout(() => {
      const A = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, w = A.mapWrappers || [];
      w.push({
        instanceId: g.current,
        mapFn: e._mapFn,
        containerRef: u,
        rebuildStateShape: o,
        path: e._path,
        componentId: g.current,
        meta: e._meta
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...A,
        mapWrappers: w
      }), y.current = !0, V();
    }, 0);
    return () => {
      if (clearTimeout(f), g.current) {
        const A = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        A.mapWrappers && (A.mapWrappers = A.mapWrappers.filter(
          (w) => w.instanceId !== g.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, A));
      }
      I.current.forEach((A) => A.unmount());
    };
  }, []);
  const V = () => {
    const u = S.current;
    if (!u) return;
    const f = t.getState().getShadowValue(
      [e._stateKey, ...e._path].join("."),
      e._meta?.validIds
    );
    if (!Array.isArray(f)) return;
    const A = e._meta?.validIds ?? t.getState().getShadowMetadata(e._stateKey, e._path)?.arrayKeys ?? [], w = o({
      currentState: f,
      path: e._path,
      componentId: g.current,
      meta: e._meta
    });
    f.forEach((i, h) => {
      const M = A[h];
      if (!M) return;
      const H = ne(), l = document.createElement("div");
      l.setAttribute("data-item-path", M), u.appendChild(l);
      const z = Pe(l);
      I.current.set(M, z);
      const Y = M.split(".").slice(1);
      z.render(
        le(Te, {
          stateKey: e._stateKey,
          itemComponentId: H,
          itemPath: Y,
          localIndex: h,
          arraySetter: w,
          rebuildStateShape: o,
          renderFn: e._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ ae("div", { ref: S, "data-map-container": g.current });
}
function Ge({
  proxy: e
}) {
  const o = q(null), S = q(null), g = q(!1), y = `${e._stateKey}-${e._path.join(".")}`, I = t.getState().getShadowValue(
    [e._stateKey, ...e._path].join("."),
    e._meta?.validIds
  );
  return Q(() => {
    const V = o.current;
    if (!V || g.current) return;
    const u = setTimeout(() => {
      if (!V.parentElement) {
        console.warn("Parent element not found for signal", y);
        return;
      }
      const f = V.parentElement, w = Array.from(f.childNodes).indexOf(V);
      let i = f.getAttribute("data-parent-id");
      i || (i = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", i)), S.current = `instance-${crypto.randomUUID()}`;
      const h = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, M = h.signals || [];
      M.push({
        instanceId: S.current,
        parentId: i,
        position: w,
        effect: e._effect
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...h,
        signals: M
      });
      let H = I;
      if (e._effect)
        try {
          H = new Function(
            "state",
            `return (${e._effect})(state)`
          )(I);
        } catch (z) {
          console.error("Error evaluating effect function:", z);
        }
      H !== null && typeof H == "object" && (H = JSON.stringify(H));
      const l = document.createTextNode(String(H ?? ""));
      V.replaceWith(l), g.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(u), S.current) {
        const f = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        f.signals && (f.signals = f.signals.filter(
          (A) => A.instanceId !== S.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, f));
      }
    };
  }, []), le("span", {
    ref: o,
    style: { display: "contents" },
    "data-signal-id": y
  });
}
const Te = Oe(
  Ye,
  (e, o) => e.itemPath.join(".") === o.itemPath.join(".") && e.stateKey === o.stateKey && e.itemComponentId === o.itemComponentId && e.localIndex === o.localIndex
), Je = (e) => {
  const [o, S] = X(!1);
  return de(() => {
    if (!e.current) {
      S(!0);
      return;
    }
    const g = Array.from(e.current.querySelectorAll("img"));
    if (g.length === 0) {
      S(!0);
      return;
    }
    let y = 0;
    const I = () => {
      y++, y === g.length && S(!0);
    };
    return g.forEach((V) => {
      V.complete ? I() : (V.addEventListener("load", I), V.addEventListener("error", I));
    }), () => {
      g.forEach((V) => {
        V.removeEventListener("load", I), V.removeEventListener("error", I);
      });
    };
  }, [e.current]), o;
};
function Ye({
  stateKey: e,
  itemComponentId: o,
  itemPath: S,
  localIndex: g,
  arraySetter: y,
  rebuildStateShape: I,
  renderFn: V
}) {
  const [, u] = X({}), { ref: f, inView: A } = je(), w = q(null), i = Je(w), h = q(!1), M = [e, ...S].join(".");
  Re(e, o, u);
  const H = ce(
    (x) => {
      w.current = x, f(x);
    },
    [f]
  );
  Q(() => {
    t.getState().subscribeToPath(M, (x) => {
      u({});
    });
  }, []), Q(() => {
    if (!A || !i || h.current)
      return;
    const x = w.current;
    if (x && x.offsetHeight > 0) {
      h.current = !0;
      const m = x.offsetHeight;
      t.getState().setShadowMetadata(e, S, {
        virtualizer: {
          itemHeight: m,
          domRef: x
        }
      });
      const J = S.slice(0, -1), te = [e, ...J].join(".");
      t.getState().notifyPathSubscribers(te, {
        type: "ITEMHEIGHT",
        itemKey: S.join("."),
        ref: w.current
      });
    }
  }, [A, i, e, S]);
  const l = [e, ...S].join("."), z = t.getState().getShadowValue(l);
  if (z === void 0)
    return null;
  const Y = I({
    currentState: z,
    path: S,
    componentId: o
  }), B = V(Y, g, y);
  return /* @__PURE__ */ ae("div", { ref: H, children: B });
}
function Ze({
  stateKey: e,
  path: o,
  rebuildStateShape: S,
  renderFn: g,
  formOpts: y,
  setState: I
}) {
  const [V] = X(() => ne()), [, u] = X({}), f = [e, ...o].join(".");
  Re(e, V, u);
  const A = t.getState().getShadowValue(f), [w, i] = X(A), h = q(!1), M = q(null);
  Q(() => {
    !h.current && !se(A, w) && i(A);
  }, [A]), Q(() => {
    const B = t.getState().subscribeToPath(f, (x) => {
      !h.current && w !== x && u({});
    });
    return () => {
      B(), M.current && (clearTimeout(M.current), h.current = !1);
    };
  }, []);
  const H = ce(
    (B) => {
      i(B), h.current = !0, M.current && clearTimeout(M.current);
      const x = y?.debounceTime ?? 200;
      M.current = setTimeout(() => {
        h.current = !1, I(B, o, { updateType: "update" });
        const { getInitialOptions: m, setShadowMetadata: J, getShadowMetadata: te } = t.getState(), Z = m(e)?.validation, s = Z?.zodSchemaV4 || Z?.zodSchemaV3;
        if (s) {
          const n = t.getState().getShadowValue(e), a = s.safeParse(n), r = te(e, o) || {};
          if (a.success)
            J(e, o, {
              ...r,
              validation: {
                status: "VALID_LIVE",
                // Valid while typing
                validatedValue: B
              }
            });
          else {
            const c = ("issues" in a.error ? a.error.issues : a.error.errors).filter(
              (p) => JSON.stringify(p.path) === JSON.stringify(o)
            );
            c.length > 0 && J(e, o, {
              ...r,
              validation: {
                status: "INVALID_LIVE",
                // Gentle error while typing
                message: c[0]?.message,
                validatedValue: B
              }
            });
          }
        }
      }, x);
    },
    [I, o, y?.debounceTime, e]
  ), l = ce(async () => {
    console.log("handleBlur triggered"), M.current && (clearTimeout(M.current), M.current = null, h.current = !1, I(w, o, { updateType: "update" }));
    const { getInitialOptions: B } = t.getState(), x = B(e)?.validation, m = x?.zodSchemaV4 || x?.zodSchemaV3;
    if (!m) return;
    const J = t.getState().getShadowMetadata(e, o);
    t.getState().setShadowMetadata(e, o, {
      ...J,
      validation: {
        status: "DIRTY",
        validatedValue: w
      }
    });
    const te = t.getState().getShadowValue(e), Z = m.safeParse(te);
    if (console.log("result ", Z), Z.success)
      t.getState().setShadowMetadata(e, o, {
        ...J,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: w
        }
      });
    else {
      const s = "issues" in Z.error ? Z.error.issues : Z.error.errors;
      console.log("All validation errors:", s), console.log("Current blur path:", o);
      const n = s.filter((a) => {
        if (console.log("Processing error:", a), o.some((d) => d.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const d = o[0].startsWith("id:") ? [] : o.slice(0, -1);
          console.log("Parent path:", d);
          const c = t.getState().getShadowMetadata(e, d);
          if (console.log("Array metadata:", c), c?.arrayKeys) {
            const p = [e, ...o.slice(0, -1)].join("."), b = c.arrayKeys.indexOf(p);
            console.log("Item key:", p, "Index:", b);
            const D = [...d, b, ...o.slice(-1)], U = JSON.stringify(a.path) === JSON.stringify(D);
            return console.log("Zod path comparison:", {
              zodPath: D,
              errorPath: a.path,
              match: U
            }), U;
          }
        }
        const r = JSON.stringify(a.path) === JSON.stringify(o);
        return console.log("Direct path comparison:", {
          errorPath: a.path,
          currentPath: o,
          match: r
        }), r;
      });
      console.log("Filtered path errors:", n), t.getState().setShadowMetadata(e, o, {
        ...J,
        validation: {
          status: "VALIDATION_FAILED",
          message: n[0]?.message,
          validatedValue: w
        }
      });
    }
  }, [e, o, w, I]), z = S({
    currentState: A,
    path: o,
    componentId: V
  }), Y = new Proxy(z, {
    get(B, x) {
      return x === "inputProps" ? {
        value: w ?? "",
        onChange: (m) => {
          H(m.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: l,
        ref: ve.getState().getFormRef(e + "." + o.join("."))
      } : B[x];
    }
  });
  return /* @__PURE__ */ ae(Me, { children: g(Y) });
}
function Re(e, o, S) {
  const g = `${e}////${o}`;
  de(() => {
    const { registerComponent: y, unregisterComponent: I } = t.getState();
    return y(e, g, {
      forceUpdate: () => S({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      I(e, g);
    };
  }, [e, g]);
}
const dt = ({
  children: e,
  status: o,
  message: S
}) => {
  if (!S || o === "PRISTINE" || o === "DIRTY")
    return /* @__PURE__ */ ae(Me, { children: e });
  const g = o === "INVALID_LIVE";
  return /* @__PURE__ */ Ve("div", { style: { position: "relative" }, children: [
    e,
    (g || o === "VALIDATION_FAILED") && /* @__PURE__ */ Ve(
      "div",
      {
        style: {
          fontSize: "12px",
          marginTop: "4px",
          color: g ? "#ff9800" : "#f44336",
          // Orange for live, red for blur
          display: "flex",
          alignItems: "center",
          gap: "4px"
        },
        children: [
          /* @__PURE__ */ ae("span", { style: { fontSize: "16px" }, children: g ? "⚠" : "⛔" }),
          S
        ]
      }
    )
  ] });
};
export {
  ke as $cogsSignal,
  dt as DefaultValidationComponent,
  it as addStateOptions,
  ct as createCogsState,
  ut as notifyComponent,
  ze as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
