"use client";
import { jsx as it, Fragment as Ot } from "react/jsx-runtime";
import { memo as $t, useState as at, useRef as z, useCallback as lt, useEffect as et, useLayoutEffect as dt, useMemo as St, createElement as ut, startTransition as Ut } from "react";
import { createRoot as Vt } from "react-dom/client";
import { transformStateFunc as Rt, isFunction as rt, isArray as It, getDifferences as Et, isDeepEqual as ct } from "./utility.js";
import { ValidationWrapper as At } from "./Functions.jsx";
import Lt from "superjson";
import { v4 as nt } from "uuid";
import { getGlobalStore as e, formRefStore as ht } from "./store.js";
import { useCogsConfig as _t } from "./CogsStateClient.jsx";
import { useInView as Nt } from "react-intersection-observer";
function mt(t, a) {
  const m = e.getState().getInitialOptions, g = e.getState().setInitialStateOptions, y = m(t) || {};
  g(t, {
    ...y,
    ...a
  });
}
function Mt({
  stateKey: t,
  options: a,
  initialOptionsPart: m
}) {
  const g = ot(t) || {}, y = m[t] || {}, I = e.getState().setInitialStateOptions, T = { ...y, ...g };
  let i = !1;
  if (a)
    for (const f in a)
      T.hasOwnProperty(f) ? (f == "localStorage" && a[f] && T[f].key !== a[f]?.key && (i = !0, T[f] = a[f]), f == "defaultState" && a[f] && T[f] !== a[f] && !ct(T[f], a[f]) && (i = !0, T[f] = a[f])) : (i = !0, T[f] = a[f]);
  T.syncOptions && (!a || !a.hasOwnProperty("syncOptions")) && (i = !0), i && I(t, T);
}
function se(t, { formElements: a, validation: m }) {
  return { initialState: t, formElements: a, validation: m };
}
const Ft = (t, a) => {
  let m = t;
  console.log("optsc", a?.__useSync);
  const [g, y] = Rt(m);
  a?.__fromSyncSchema && a?.__syncNotifications && e.getState().setInitialStateOptions("__notifications", a.__syncNotifications), a?.__fromSyncSchema && a?.__apiParamsMap && e.getState().setInitialStateOptions("__apiParamsMap", a.__apiParamsMap), Object.keys(g).forEach((i) => {
    let f = y[i] || {};
    const P = {
      ...f
    };
    if (a?.formElements && (P.formElements = {
      ...a.formElements,
      ...f.formElements || {}
    }), a?.validation && (P.validation = {
      ...a.validation,
      ...f.validation || {}
    }, a.validation.key && !f.validation?.key && (P.validation.key = `${a.validation.key}.${i}`)), Object.keys(P).length > 0) {
      const b = ot(i);
      b ? e.getState().setInitialStateOptions(i, {
        ...b,
        ...P
      }) : e.getState().setInitialStateOptions(i, P);
    }
  }), Object.keys(g).forEach((i) => {
    e.getState().initializeShadowState(i, g[i]);
  });
  const I = (i, f) => {
    const [P] = at(f?.componentId ?? nt());
    Mt({
      stateKey: i,
      options: f,
      initialOptionsPart: y
    });
    const b = e.getState().getShadowValue(i) || g[i], n = f?.modifyState ? f.modifyState(b) : b;
    return xt(n, {
      stateKey: i,
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
  function T(i, f) {
    Mt({ stateKey: i, options: f, initialOptionsPart: y }), f.localStorage && Ht(i, f), vt(i);
  }
  return { useCogsState: I, setCogsOptions: T };
};
function ie(t, a) {
  const m = t.schemas, g = {}, y = {};
  for (const I in m) {
    const T = m[I];
    g[I] = T?.schemas?.defaultValues || {}, T?.api?.queryData?._paramType && (y[I] = T.api.queryData._paramType);
  }
  return Ft(g, {
    __fromSyncSchema: !0,
    __syncNotifications: t.notifications,
    __apiParamsMap: y,
    __useSync: a
  });
}
const {
  getInitialOptions: ot,
  setStateLog: jt,
  updateInitialStateGlobal: Ct
} = e.getState(), Wt = (t, a, m, g, y) => {
  m?.log && console.log(
    "saving to localstorage",
    a,
    m.localStorage?.key,
    g
  );
  const I = rt(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (I && g) {
    const T = `${g}-${a}-${I}`;
    let i;
    try {
      i = gt(T)?.lastSyncedWithServer;
    } catch {
    }
    const f = e.getState().getShadowMetadata(a, []), P = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: i,
      stateSource: f?.stateSource,
      baseServerState: f?.baseServerState
    }, b = Lt.serialize(P);
    window.localStorage.setItem(
      T,
      JSON.stringify(b.json)
    );
  }
}, gt = (t) => {
  if (!t) return null;
  try {
    const a = window.localStorage.getItem(t);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, Ht = (t, a) => {
  const m = e.getState().getShadowValue(t), { sessionId: g } = _t(), y = rt(a?.localStorage?.key) ? a.localStorage.key(m) : a?.localStorage?.key;
  if (y && g) {
    const I = gt(
      `${g}-${t}-${y}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return vt(t), !0;
  }
  return !1;
}, vt = (t) => {
  const a = e.getState().getShadowMetadata(t, []);
  if (!a) return;
  const m = /* @__PURE__ */ new Set();
  a?.components?.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, ce = (t, a) => {
  const m = e.getState().getShadowMetadata(t, []);
  if (m) {
    const g = `${t}////${a}`, y = m?.components?.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
};
function yt(t, a, m, g) {
  const y = e.getState(), I = y.getShadowMetadata(t, a);
  if (y.setShadowMetadata(t, a, {
    ...I,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: g || Date.now()
  }), Array.isArray(m)) {
    const T = y.getShadowMetadata(t, a);
    T?.arrayKeys && T.arrayKeys.forEach((i, f) => {
      const P = i.split(".").slice(1), b = m[f];
      b !== void 0 && yt(
        t,
        P,
        b,
        g
      );
    });
  } else m && typeof m == "object" && m.constructor === Object && Object.keys(m).forEach((T) => {
    const i = [...a, T], f = m[T];
    yt(t, i, f, g);
  });
}
function xt(t, {
  stateKey: a,
  localStorage: m,
  formElements: g,
  reactiveDeps: y,
  reactiveType: I,
  componentId: T,
  defaultState: i,
  syncUpdate: f,
  dependencies: P,
  serverState: b,
  __useSync: n,
  syncOptions: h
} = {}) {
  const [_, x] = at({}), { sessionId: R } = _t();
  let B = !a;
  const [S] = at(a ?? nt()), W = e.getState().stateLog[S], q = z(/* @__PURE__ */ new Set()), p = z(T ?? nt()), Y = z(
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
  const tt = lt(
    (u) => {
      const d = u ? { ...ot(S), ...u } : ot(S), k = d?.defaultState || i || t;
      if (d?.serverState?.status === "success" && d?.serverState?.data !== void 0)
        return {
          value: d.serverState.data,
          source: "server",
          timestamp: d.serverState.timestamp || Date.now()
        };
      if (d?.localStorage?.key && R) {
        const D = rt(d.localStorage.key) ? d.localStorage.key(k) : d.localStorage.key, V = gt(
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
    [S, i, t, R]
  );
  et(() => {
    e.getState().setServerStateUpdate(S, b);
  }, [b, S]), et(() => e.getState().subscribeToPath(S, (c) => {
    if (c?.type === "SERVER_STATE_UPDATE") {
      const d = c.serverState;
      if (console.log("SERVER_STATE_UPDATE", c), d?.status === "success" && d.data !== void 0) {
        mt(S, { serverState: d });
        const M = typeof d.merge == "object" ? d.merge : d.merge === !0 ? {} : null, D = e.getState().getShadowValue(S), V = d.data;
        if (M && Array.isArray(D) && Array.isArray(V)) {
          const j = M.key, L = new Set(
            D.map((Z) => Z[j])
          ), G = V.filter((Z) => !L.has(Z[j]));
          G.length > 0 && G.forEach((Z) => {
            e.getState().insertShadowArrayElement(S, [], Z);
            const X = e.getState().getShadowMetadata(S, []);
            if (X?.arrayKeys) {
              const H = X.arrayKeys[X.arrayKeys.length - 1];
              if (H) {
                const O = H.split(".").slice(1);
                e.getState().setShadowMetadata(S, O, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: d.timestamp || Date.now()
                });
                const v = e.getState().getShadowValue(H);
                v && typeof v == "object" && !Array.isArray(v) && Object.keys(v).forEach((w) => {
                  const E = [...O, w];
                  e.getState().setShadowMetadata(S, E, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: d.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          e.getState().initializeShadowState(S, V), yt(
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
    if (c?.defaultState !== void 0 || i !== void 0) {
      const d = c?.defaultState || i;
      c?.defaultState || mt(S, {
        defaultState: d
      });
      const { value: k, source: M, timestamp: D } = tt();
      e.getState().initializeShadowState(S, k), e.getState().setShadowMetadata(S, [], {
        stateSource: M,
        lastServerSync: M === "server" ? D : void 0,
        isDirty: !1,
        baseServerState: M === "server" ? k : void 0
      }), vt(S);
    }
  }, [S, ...P || []]), dt(() => {
    B && mt(S, {
      formElements: g,
      defaultState: i,
      localStorage: m,
      middleware: Y.current?.middleware
    });
    const u = `${S}////${p.current}`, c = e.getState().getShadowMetadata(S, []), d = c?.components || /* @__PURE__ */ new Map();
    return d.set(u, {
      forceUpdate: () => x({}),
      reactiveType: I ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: y || void 0,
      deps: y ? y(e.getState().getShadowValue(S)) : [],
      prevDeps: y ? y(e.getState().getShadowValue(S)) : []
    }), e.getState().setShadowMetadata(S, [], {
      ...c,
      components: d
    }), x({}), () => {
      const k = e.getState().getShadowMetadata(S, []), M = k?.components?.get(u);
      M?.paths && M.paths.forEach((D) => {
        const $ = D.split(".").slice(1), j = e.getState().getShadowMetadata(S, $);
        j?.pathComponents && j.pathComponents.size === 0 && (delete j.pathComponents, e.getState().setShadowMetadata(S, $, j));
      }), k?.components && e.getState().setShadowMetadata(S, [], k);
    };
  }, []);
  const Q = z(null), r = (u, c, d) => {
    const k = [S, ...c].join(".");
    if (Array.isArray(c)) {
      const O = `${S}-${c.join(".")}`;
      q.current.add(O);
    }
    const M = e.getState(), D = M.getShadowMetadata(S, c), V = M.getShadowValue(k), $ = d.updateType === "insert" && rt(u) ? u({ state: V, uuid: nt() }) : rt(u) ? u(V) : u, L = {
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
        M.insertShadowArrayElement(S, c, L.newValue), M.markAsDirty(S, c, { bubble: !0 });
        const O = M.getShadowMetadata(S, c);
        if (O?.arrayKeys) {
          const v = O.arrayKeys[O.arrayKeys.length - 1];
          if (v) {
            const w = v.split(".").slice(1);
            M.markAsDirty(S, w, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const O = c.slice(0, -1);
        M.removeShadowArrayElement(S, c), M.markAsDirty(S, O, { bubble: !0 });
        break;
      }
      case "update": {
        M.updateShadowAtPath(S, c, L.newValue), M.markAsDirty(S, c, { bubble: !0 });
        break;
      }
    }
    if (d.sync !== !1 && Q.current && Q.current.connected && Q.current.updateState({ operation: L }), D?.signals && D.signals.length > 0) {
      const O = d.updateType === "cut" ? null : $;
      D.signals.forEach(({ parentId: v, position: w, effect: E }) => {
        const A = document.querySelector(`[data-parent-id="${v}"]`);
        if (A) {
          const C = Array.from(A.childNodes);
          if (C[w]) {
            let U = O;
            if (E && O !== null)
              try {
                U = new Function(
                  "state",
                  `return (${E})(state)`
                )(O);
              } catch (N) {
                console.error("Error evaluating effect function:", N);
              }
            U != null && typeof U == "object" && (U = JSON.stringify(U)), C[w].textContent = String(U ?? "");
          }
        }
      });
    }
    if (d.updateType === "insert" && D?.mapWrappers && D.mapWrappers.length > 0) {
      const O = M.getShadowMetadata(S, c)?.arrayKeys || [], v = O[O.length - 1], w = M.getShadowValue(v), E = M.getShadowValue(
        [S, ...c].join(".")
      );
      if (!v || w === void 0) return;
      D.mapWrappers.forEach((A) => {
        let C = !0, U = -1;
        if (A.meta?.transforms && A.meta.transforms.length > 0) {
          for (const N of A.meta.transforms)
            if (N.type === "filter" && !N.fn(w, -1)) {
              C = !1;
              break;
            }
          if (C) {
            const N = pt(
              S,
              c,
              A.meta.transforms
            ), J = A.meta.transforms.find(
              (F) => F.type === "sort"
            );
            if (J) {
              const F = N.map((K) => ({
                key: K,
                value: M.getShadowValue(K)
              }));
              F.push({ key: v, value: w }), F.sort((K, st) => J.fn(K.value, st.value)), U = F.findIndex(
                (K) => K.key === v
              );
            } else
              U = N.length;
          }
        } else
          C = !0, U = O.length - 1;
        if (C && A.containerRef && A.containerRef.isConnected) {
          const N = document.createElement("div");
          N.setAttribute("data-item-path", v);
          const J = Array.from(A.containerRef.children);
          U >= 0 && U < J.length ? A.containerRef.insertBefore(
            N,
            J[U]
          ) : A.containerRef.appendChild(N);
          const F = Vt(N), K = nt(), st = v.split(".").slice(1), Dt = A.rebuildStateShape({
            path: A.path,
            currentState: E,
            componentId: A.componentId,
            meta: A.meta
          });
          F.render(
            ut(wt, {
              stateKey: S,
              itemComponentId: K,
              itemPath: st,
              localIndex: U,
              arraySetter: Dt,
              rebuildStateShape: A.rebuildStateShape,
              renderFn: A.mapFn
            })
          );
        }
      });
    }
    if (d.updateType === "cut") {
      const O = c.slice(0, -1), v = M.getShadowMetadata(S, O);
      v?.mapWrappers && v.mapWrappers.length > 0 && v.mapWrappers.forEach((w) => {
        if (w.containerRef && w.containerRef.isConnected) {
          const E = w.containerRef.querySelector(
            `[data-item-path="${k}"]`
          );
          E && E.remove();
        }
      });
    }
    const Z = e.getState().getShadowValue(S), X = e.getState().getShadowMetadata(S, []), H = /* @__PURE__ */ new Set();
    if (!X?.components)
      return Z;
    if (d.updateType === "update") {
      let O = [...c];
      for (; ; ) {
        const v = M.getShadowMetadata(S, O);
        if (v?.pathComponents && v.pathComponents.forEach((w) => {
          if (H.has(w))
            return;
          const E = X.components?.get(w);
          E && ((Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"]).includes("none") || (E.forceUpdate(), H.add(w)));
        }), O.length === 0)
          break;
        O.pop();
      }
      $ && typeof $ == "object" && !It($) && V && typeof V == "object" && !It(V) && Et($, V).forEach((w) => {
        const E = w.split("."), A = [...c, ...E], C = M.getShadowMetadata(S, A);
        C?.pathComponents && C.pathComponents.forEach((U) => {
          if (H.has(U))
            return;
          const N = X.components?.get(U);
          N && ((Array.isArray(N.reactiveType) ? N.reactiveType : [N.reactiveType || "component"]).includes("none") || (N.forceUpdate(), H.add(U)));
        });
      });
    } else if (d.updateType === "insert" || d.updateType === "cut") {
      const O = d.updateType === "insert" ? c : c.slice(0, -1), v = M.getShadowMetadata(S, O);
      if (v?.signals && v.signals.length > 0) {
        const w = [S, ...O].join("."), E = M.getShadowValue(w);
        v.signals.forEach(({ parentId: A, position: C, effect: U }) => {
          const N = document.querySelector(
            `[data-parent-id="${A}"]`
          );
          if (N) {
            const J = Array.from(N.childNodes);
            if (J[C]) {
              let F = E;
              if (U)
                try {
                  F = new Function(
                    "state",
                    `return (${U})(state)`
                  )(E);
                } catch (K) {
                  console.error("Error evaluating effect function:", K), F = E;
                }
              F != null && typeof F == "object" && (F = JSON.stringify(F)), J[C].textContent = String(F ?? "");
            }
          }
        });
      }
      v?.pathComponents && v.pathComponents.forEach((w) => {
        if (!H.has(w)) {
          const E = X.components?.get(w);
          E && (E.forceUpdate(), H.add(w));
        }
      });
    }
    return X.components.forEach((O, v) => {
      if (H.has(v))
        return;
      const w = Array.isArray(O.reactiveType) ? O.reactiveType : [O.reactiveType || "component"];
      if (w.includes("all")) {
        O.forceUpdate(), H.add(v);
        return;
      }
      if (w.includes("deps") && O.depsFunction) {
        const E = M.getShadowValue(S), A = O.depsFunction(E);
        let C = !1;
        A === !0 ? C = !0 : Array.isArray(A) && (ct(O.prevDeps, A) || (O.prevDeps = A, C = !0)), C && (O.forceUpdate(), H.add(v));
      }
    }), H.clear(), jt(S, (O) => {
      const v = [...O ?? [], L], w = /* @__PURE__ */ new Map();
      return v.forEach((E) => {
        const A = `${E.stateKey}:${JSON.stringify(E.path)}`, C = w.get(A);
        C ? (C.timeStamp = Math.max(C.timeStamp, E.timeStamp), C.newValue = E.newValue, C.oldValue = C.oldValue ?? E.oldValue, C.updateType = E.updateType) : w.set(A, { ...E });
      }), Array.from(w.values());
    }), Wt(
      $,
      S,
      Y.current,
      R
    ), Y.current?.middleware && Y.current.middleware({
      updateLog: W,
      update: L
    }), Z;
  };
  e.getState().initialStateGlobal[S] || Ct(S, t);
  const o = St(() => Pt(
    S,
    r,
    p.current,
    R
  ), [S, R]), s = n, l = Y.current?.syncOptions;
  return s && (Q.current = s(
    o,
    l ?? {}
  )), o;
}
function Bt(t) {
  return !t || t.length === 0 ? "" : t.map(
    (a) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${a.type}${JSON.stringify(a.dependencies || [])}`
    )
  ).join("");
}
const pt = (t, a, m) => {
  let g = e.getState().getShadowMetadata(t, a)?.arrayKeys || [];
  if (!m || m.length === 0)
    return g;
  let y = g.map((I) => ({
    key: I,
    value: e.getState().getShadowValue(I)
  }));
  for (const I of m)
    I.type === "filter" ? y = y.filter(
      ({ value: T }, i) => I.fn(T, i)
    ) : I.type === "sort" && y.sort((T, i) => I.fn(T.value, i.value));
  return y.map(({ key: I }) => I);
}, Tt = (t, a, m) => {
  const g = `${t}////${a}`, { addPathComponent: y, getShadowMetadata: I } = e.getState(), i = I(t, [])?.components?.get(g);
  !i || i.reactiveType === "none" || !(Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType]).includes("component") || y(t, m, g);
}, ft = (t, a, m) => {
  const g = e.getState(), y = g.getShadowMetadata(t, []), I = /* @__PURE__ */ new Set();
  y?.components && y.components.forEach((i, f) => {
    (Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"]).includes("all") && (i.forceUpdate(), I.add(f));
  }), g.getShadowMetadata(t, [...a, "getSelected"])?.pathComponents?.forEach((i) => {
    y?.components?.get(i)?.forceUpdate();
  });
  const T = g.getShadowMetadata(t, a);
  for (let i of T?.arrayKeys || []) {
    const f = i + ".selected", P = g.getShadowMetadata(
      t,
      f.split(".").slice(1)
    );
    i == m && P?.pathComponents?.forEach((b) => {
      y?.components?.get(b)?.forceUpdate();
    });
  }
};
function Pt(t, a, m, g) {
  const y = /* @__PURE__ */ new Map();
  let I = 0;
  const T = (b) => {
    const n = b.join(".");
    for (const [h] of y)
      (h === n || h.startsWith(n + ".")) && y.delete(h);
    I++;
  };
  function i({
    currentState: b,
    path: n = [],
    meta: h,
    componentId: _
  }) {
    const x = n.map(String).join("."), R = [t, ...n].join(".");
    b = e.getState().getShadowValue(R, h?.validIds);
    const B = function() {
      return e().getShadowValue(t, n);
    }, S = {
      apply(q, p, Y) {
      },
      get(q, p) {
        if (p === "_rebuildStateShape")
          return i;
        if (Object.getOwnPropertyNames(f).includes(p) && n.length === 0)
          return f[p];
        if (p === "getDifferences")
          return () => {
            const r = e.getState().getShadowMetadata(t, []), o = e.getState().getShadowValue(t);
            let s;
            return r?.stateSource === "server" && r.baseServerState ? s = r.baseServerState : s = e.getState().initialStateGlobal[t], Et(o, s);
          };
        if (p === "sync" && n.length === 0)
          return async function() {
            const r = e.getState().getInitialOptions(t), o = r?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const s = e.getState().getShadowValue(t, []), l = r?.validation?.key;
            try {
              const u = await o.action(s);
              if (u && !u.success && u.errors, u?.success) {
                const c = e.getState().getShadowMetadata(t, []);
                e.getState().setShadowMetadata(t, [], {
                  ...c,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: s
                  // Update base server state
                }), o.onSuccess && o.onSuccess(u.data);
              } else !u?.success && o.onError && o.onError(u.error);
              return u;
            } catch (u) {
              return o.onError && o.onError(u), { success: !1, error: u };
            }
          };
        if (p === "_status" || p === "getStatus") {
          const r = () => {
            const o = e.getState().getShadowMetadata(t, n), s = e.getState().getShadowValue(R);
            return o?.isDirty === !0 ? "dirty" : o?.isDirty === !1 || o?.stateSource === "server" ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" ? "fresh" : e.getState().getShadowMetadata(t, [])?.stateSource === "server" && !o?.isDirty ? "synced" : s !== void 0 && !o ? "fresh" : "unknown";
          };
          return p === "_status" ? r() : r;
        }
        if (p === "removeStorage")
          return () => {
            const r = e.getState().initialStateGlobal[t], o = ot(t), s = rt(o?.localStorage?.key) ? o.localStorage.key(r) : o?.localStorage?.key, l = `${g}-${t}-${s}`;
            l && localStorage.removeItem(l);
          };
        if (p === "showValidationErrors")
          return () => {
            const r = e.getState().getShadowMetadata(t, n);
            return r?.validation?.status === "VALIDATION_FAILED" && r.validation.message ? [r.validation.message] : [];
          };
        if (Array.isArray(b)) {
          if (p === "getSelected")
            return () => {
              const r = t + "." + n.join(".");
              Tt(t, _, [
                ...n,
                "getSelected"
              ]);
              const o = e.getState().selectedIndicesMap;
              if (!o || !o.has(r))
                return;
              const s = o.get(r);
              if (h?.validIds && !h.validIds.includes(s))
                return;
              const l = e.getState().getShadowValue(s);
              if (l)
                return i({
                  currentState: l,
                  path: s.split(".").slice(1),
                  componentId: _
                });
            };
          if (p === "getSelectedIndex")
            return () => e.getState().getSelectedIndex(
              t + "." + n.join("."),
              h?.validIds
            );
          if (p === "clearSelected")
            return ft(t, n), () => {
              e.getState().clearSelectedIndex({
                arrayKey: t + "." + n.join(".")
              });
            };
          if (p === "useVirtualView")
            return (r) => {
              const {
                itemHeight: o = 50,
                overscan: s = 6,
                stickToBottom: l = !1,
                scrollStickTolerance: u = 75
              } = r, c = z(null), [d, k] = at({
                startIndex: 0,
                endIndex: 10
              }), [M, D] = at({}), V = z(!0), $ = z({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), j = z(
                /* @__PURE__ */ new Map()
              );
              dt(() => {
                if (!l || !c.current || $.current.isUserScrolling)
                  return;
                const v = c.current;
                v.scrollTo({
                  top: v.scrollHeight,
                  behavior: V.current ? "instant" : "smooth"
                });
              }, [M, l]);
              const L = e.getState().getShadowMetadata(t, n)?.arrayKeys || [], { totalHeight: G, itemOffsets: Z } = St(() => {
                let v = 0;
                const w = /* @__PURE__ */ new Map();
                return (e.getState().getShadowMetadata(t, n)?.arrayKeys || []).forEach((A) => {
                  const C = A.split(".").slice(1), U = e.getState().getShadowMetadata(t, C)?.virtualizer?.itemHeight || o;
                  w.set(A, {
                    height: U,
                    offset: v
                  }), v += U;
                }), j.current = w, { totalHeight: v, itemOffsets: w };
              }, [L.length, o]);
              dt(() => {
                if (l && L.length > 0 && c.current && !$.current.isUserScrolling && V.current) {
                  const v = c.current, w = () => {
                    if (v.clientHeight > 0) {
                      const E = Math.ceil(
                        v.clientHeight / o
                      ), A = L.length - 1, C = Math.max(
                        0,
                        A - E - s
                      );
                      k({ startIndex: C, endIndex: A }), requestAnimationFrame(() => {
                        H("instant"), V.current = !1;
                      });
                    } else
                      requestAnimationFrame(w);
                  };
                  w();
                }
              }, [L.length, l, o, s]);
              const X = lt(() => {
                const v = c.current;
                if (!v) return;
                const w = v.scrollTop, { scrollHeight: E, clientHeight: A } = v, C = $.current, U = E - (w + A), N = C.isNearBottom;
                C.isNearBottom = U <= u, w < C.lastScrollTop ? (C.scrollUpCount++, C.scrollUpCount > 3 && N && (C.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : C.isNearBottom && (C.isUserScrolling = !1, C.scrollUpCount = 0), C.lastScrollTop = w;
                let J = 0;
                for (let F = 0; F < L.length; F++) {
                  const K = L[F], st = j.current.get(K);
                  if (st && st.offset + st.height > w) {
                    J = F;
                    break;
                  }
                }
                if (J !== d.startIndex) {
                  const F = Math.ceil(A / o);
                  k({
                    startIndex: Math.max(0, J - s),
                    endIndex: Math.min(
                      L.length - 1,
                      J + F + s
                    )
                  });
                }
              }, [
                L.length,
                d.startIndex,
                o,
                s,
                u
              ]);
              et(() => {
                const v = c.current;
                if (!(!v || !l))
                  return v.addEventListener("scroll", X, {
                    passive: !0
                  }), () => {
                    v.removeEventListener("scroll", X);
                  };
              }, [X, l]);
              const H = lt(
                (v = "smooth") => {
                  const w = c.current;
                  if (!w) return;
                  $.current.isUserScrolling = !1, $.current.isNearBottom = !0, $.current.scrollUpCount = 0;
                  const E = () => {
                    const A = (C = 0) => {
                      if (C > 5) return;
                      const U = w.scrollHeight, N = w.scrollTop, J = w.clientHeight;
                      N + J >= U - 1 || (w.scrollTo({
                        top: U,
                        behavior: v
                      }), setTimeout(() => {
                        const F = w.scrollHeight, K = w.scrollTop;
                        (F !== U || K + J < F - 1) && A(C + 1);
                      }, 50));
                    };
                    A();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback(E, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame(E);
                  });
                },
                []
              );
              return et(() => {
                if (!l || !c.current) return;
                const v = c.current, w = $.current;
                let E;
                const A = () => {
                  clearTimeout(E), E = setTimeout(() => {
                    !w.isUserScrolling && w.isNearBottom && H(
                      V.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, C = new MutationObserver(() => {
                  w.isUserScrolling || A();
                });
                C.observe(v, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const U = (N) => {
                  N.target instanceof HTMLImageElement && !w.isUserScrolling && A();
                };
                return v.addEventListener("load", U, !0), V.current ? setTimeout(() => {
                  H("instant");
                }, 0) : A(), () => {
                  clearTimeout(E), C.disconnect(), v.removeEventListener("load", U, !0);
                };
              }, [l, L.length, H]), {
                virtualState: St(() => {
                  const v = e.getState(), w = v.getShadowValue(
                    [t, ...n].join(".")
                  ), E = v.getShadowMetadata(t, n)?.arrayKeys || [], A = w.slice(
                    d.startIndex,
                    d.endIndex + 1
                  ), C = E.slice(
                    d.startIndex,
                    d.endIndex + 1
                  );
                  return i({
                    currentState: A,
                    path: n,
                    componentId: _,
                    meta: { ...h, validIds: C }
                  });
                }, [d.startIndex, d.endIndex, L.length]),
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
                      transform: `translateY(${j.current.get(
                        L[d.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: H,
                scrollToIndex: (v, w = "smooth") => {
                  if (c.current && L[v]) {
                    const E = j.current.get(L[v])?.offset || 0;
                    c.current.scrollTo({ top: E, behavior: w });
                  }
                }
              };
            };
          if (p === "stateMap")
            return (r) => {
              const [o, s] = at(
                h?.validIds ?? e.getState().getShadowMetadata(t, n)?.arrayKeys
              ), l = e.getState().getShadowValue(R, h?.validIds);
              if (!o)
                throw new Error("No array keys found for mapping");
              const u = i({
                currentState: l,
                path: n,
                componentId: _,
                meta: h
              });
              return l.map((c, d) => {
                const k = o[d]?.split(".").slice(1), M = i({
                  currentState: c,
                  path: k,
                  componentId: _,
                  meta: h
                });
                return r(
                  M,
                  d,
                  u
                );
              });
            };
          if (p === "$stateMap")
            return (r) => ut(qt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: r,
                _meta: h
              },
              rebuildStateShape: i
            });
          if (p === "stateFind")
            return (r) => {
              const o = h?.validIds ?? e.getState().getShadowMetadata(t, n)?.arrayKeys;
              if (o)
                for (let s = 0; s < o.length; s++) {
                  const l = o[s];
                  if (!l) continue;
                  const u = e.getState().getShadowValue(l);
                  if (r(u, s)) {
                    const c = l.split(".").slice(1);
                    return i({
                      currentState: u,
                      path: c,
                      componentId: _,
                      meta: h
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (p === "stateFilter")
            return (r) => {
              const o = h?.validIds ?? e.getState().getShadowMetadata(t, n)?.arrayKeys;
              if (!o)
                throw new Error("No array keys found for filtering.");
              const s = [], l = b.filter(
                (u, c) => r(u, c) ? (s.push(o[c]), !0) : !1
              );
              return i({
                currentState: l,
                path: n,
                componentId: _,
                meta: {
                  validIds: s,
                  transforms: [
                    ...h?.transforms || [],
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
              const o = h?.validIds ?? e.getState().getShadowMetadata(t, n)?.arrayKeys;
              if (!o)
                throw new Error("No array keys found for sorting");
              const s = b.map((l, u) => ({
                item: l,
                key: o[u]
              }));
              return s.sort((l, u) => r(l.item, u.item)).filter(Boolean), i({
                currentState: s.map((l) => l.item),
                path: n,
                componentId: _,
                meta: {
                  validIds: s.map((l) => l.key),
                  transforms: [
                    ...h?.transforms || [],
                    { type: "sort", fn: r }
                  ]
                }
              });
            };
          if (p === "stream")
            return function(r = {}) {
              const {
                bufferSize: o = 100,
                flushInterval: s = 100,
                bufferStrategy: l = "accumulate",
                store: u,
                onFlush: c
              } = r;
              let d = [], k = !1, M = null;
              const D = (G) => {
                if (!k) {
                  if (l === "sliding" && d.length >= o)
                    d.shift();
                  else if (l === "dropping" && d.length >= o)
                    return;
                  d.push(G), d.length >= o && V();
                }
              }, V = () => {
                if (d.length === 0) return;
                const G = [...d];
                if (d = [], u) {
                  const Z = u(G);
                  Z !== void 0 && (Array.isArray(Z) ? Z : [Z]).forEach((H) => {
                    a(H, n, {
                      updateType: "insert"
                    });
                  });
                } else
                  G.forEach((Z) => {
                    a(Z, n, {
                      updateType: "insert"
                    });
                  });
                c?.(G);
              };
              s > 0 && (M = setInterval(V, s));
              const $ = nt(), j = e.getState().getShadowMetadata(t, n) || {}, L = j.streams || /* @__PURE__ */ new Map();
              return L.set($, { buffer: d, flushTimer: M }), e.getState().setShadowMetadata(t, n, {
                ...j,
                streams: L
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
                  V(), M && clearInterval(M);
                  const G = e.getState().getShadowMetadata(t, n);
                  G?.streams && G.streams.delete($);
                }
              };
            };
          if (p === "stateList")
            return (r) => /* @__PURE__ */ it(() => {
              const s = z(/* @__PURE__ */ new Map()), l = h?.transforms && h.transforms.length > 0 ? `${_}-${Bt(h.transforms)}` : `${_}-base`, [u, c] = at({}), { validIds: d, arrayValues: k } = St(() => {
                const D = e.getState().getShadowMetadata(t, n)?.transformCaches?.get(l);
                let V;
                D && D.validIds ? V = D.validIds : (V = pt(
                  t,
                  n,
                  h?.transforms
                ), e.getState().setTransformCache(t, n, l, {
                  validIds: V,
                  computedAt: Date.now(),
                  transforms: h?.transforms || []
                }));
                const $ = e.getState().getShadowValue(R, V);
                return {
                  validIds: V,
                  arrayValues: $ || []
                };
              }, [l, u]);
              if (et(() => {
                const D = e.getState().subscribeToPath(R, (V) => {
                  if (V.type === "GET_SELECTED")
                    return;
                  const j = e.getState().getShadowMetadata(t, n)?.transformCaches;
                  if (j)
                    for (const L of j.keys())
                      L.startsWith(_) && j.delete(L);
                  (V.type === "INSERT" || V.type === "REMOVE" || V.type === "CLEAR_SELECTION") && c({});
                });
                return () => {
                  D();
                };
              }, [_, R]), !Array.isArray(k))
                return null;
              const M = i({
                currentState: k,
                path: n,
                componentId: _,
                meta: {
                  ...h,
                  validIds: d
                }
              });
              return /* @__PURE__ */ it(Ot, { children: k.map((D, V) => {
                const $ = d[V];
                if (!$)
                  return null;
                let j = s.current.get($);
                j || (j = nt(), s.current.set($, j));
                const L = $.split(".").slice(1);
                return ut(wt, {
                  key: $,
                  stateKey: t,
                  itemComponentId: j,
                  itemPath: L,
                  localIndex: V,
                  arraySetter: M,
                  rebuildStateShape: i,
                  renderFn: r
                });
              }) });
            }, {});
          if (p === "stateFlattenOn")
            return (r) => {
              const o = b;
              y.clear(), I++;
              const s = o.flatMap(
                (l) => l[r] ?? []
              );
              return i({
                currentState: s,
                path: [...n, "[*]", r],
                componentId: _,
                meta: h
              });
            };
          if (p === "index")
            return (r) => {
              const s = e.getState().getShadowMetadata(t, n)?.arrayKeys?.filter(
                (c) => !h?.validIds || h?.validIds && h?.validIds?.includes(c)
              )?.[r];
              if (!s) return;
              const l = e.getState().getShadowValue(s, h?.validIds);
              return i({
                currentState: l,
                path: s.split(".").slice(1),
                componentId: _,
                meta: h
              });
            };
          if (p === "last")
            return () => {
              const r = e.getState().getShadowValue(t, n);
              if (r.length === 0) return;
              const o = r.length - 1, s = r[o], l = [...n, o.toString()];
              return i({
                currentState: s,
                path: l,
                componentId: _,
                meta: h
              });
            };
          if (p === "insert")
            return (r, o) => (a(r, n, { updateType: "insert" }), i({
              currentState: e.getState().getShadowValue(t, n),
              path: n,
              componentId: _,
              meta: h
            }));
          if (p === "uniqueInsert")
            return (r, o, s) => {
              const l = e.getState().getShadowValue(t, n), u = rt(r) ? r(l) : r;
              let c = null;
              if (!l.some((k) => {
                const M = o ? o.every(
                  (D) => ct(k[D], u[D])
                ) : ct(k, u);
                return M && (c = k), M;
              }))
                T(n), a(u, n, { updateType: "insert" });
              else if (s && c) {
                const k = s(c), M = l.map(
                  (D) => ct(D, c) ? k : D
                );
                T(n), a(M, n, {
                  updateType: "update"
                });
              }
            };
          if (p === "cut")
            return (r, o) => {
              const s = h?.validIds ?? e.getState().getShadowMetadata(t, n)?.arrayKeys;
              if (!s || s.length === 0) return;
              const l = r == -1 ? s.length - 1 : r !== void 0 ? r : s.length - 1, u = s[l];
              if (!u) return;
              const c = u.split(".").slice(1);
              a(b, c, {
                updateType: "cut"
              });
            };
          if (p === "cutSelected")
            return () => {
              const r = pt(
                t,
                n,
                h?.transforms
              );
              if (!r || r.length === 0) return;
              const o = e.getState().selectedIndicesMap.get(R);
              let s = r.findIndex(
                (c) => c === o
              );
              const l = r[s == -1 ? r.length - 1 : s]?.split(".").slice(1);
              e.getState().clearSelectedIndex({ arrayKey: R });
              const u = l?.slice(0, -1);
              ft(t, u), a(b, l, {
                updateType: "cut"
              });
            };
          if (p === "cutByValue")
            return (r) => {
              const o = e.getState().getShadowMetadata(t, n), s = h?.validIds ?? o?.arrayKeys;
              if (!s) return;
              let l = null;
              for (const u of s)
                if (e.getState().getShadowValue(u) === r) {
                  l = u;
                  break;
                }
              if (l) {
                const u = l.split(".").slice(1);
                a(null, u, { updateType: "cut" });
              }
            };
          if (p === "toggleByValue")
            return (r) => {
              const o = e.getState().getShadowMetadata(t, n), s = h?.validIds ?? o?.arrayKeys;
              if (!s) return;
              let l = null;
              for (const u of s) {
                const c = e.getState().getShadowValue(u);
                if (console.log("itemValue sdasdasdasd", c), c === r) {
                  l = u;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", l), l) {
                const u = l.split(".").slice(1);
                console.log("itemValue keyToCut", l), a(r, u, {
                  updateType: "cut"
                });
              } else
                a(r, n, { updateType: "insert" });
            };
          if (p === "findWith")
            return (r, o) => {
              const s = e.getState().getShadowMetadata(t, n)?.arrayKeys;
              if (!s)
                throw new Error("No array keys found for sorting");
              let l = null, u = [];
              for (const c of s) {
                let d = e.getState().getShadowValue(c, h?.validIds);
                if (d && d[r] === o) {
                  l = d, u = c.split(".").slice(1);
                  break;
                }
              }
              return i({
                currentState: l,
                path: u,
                componentId: _,
                meta: h
              });
            };
        }
        if (p === "cut") {
          let r = e.getState().getShadowValue(n.join("."));
          return () => {
            a(r, n, { updateType: "cut" });
          };
        }
        if (p === "get")
          return () => (Tt(t, _, n), e.getState().getShadowValue(R, h?.validIds));
        if (p === "getState")
          return () => e.getState().getShadowValue(R, h?.validIds);
        if (p === "$derive")
          return (r) => bt({
            _stateKey: t,
            _path: n,
            _effect: r.toString(),
            _meta: h
          });
        if (p === "$get")
          return () => bt({ _stateKey: t, _path: n, _meta: h });
        if (p === "lastSynced") {
          const r = `${t}:${n.join(".")}`;
          return e.getState().getSyncInfo(r);
        }
        if (p == "getLocalStorage")
          return (r) => gt(g + "-" + t + "-" + r);
        if (p === "isSelected") {
          const r = [t, ...n].slice(0, -1);
          if (ft(t, n, void 0), Array.isArray(
            e.getState().getShadowValue(r.join("."), h?.validIds)
          )) {
            n[n.length - 1];
            const o = r.join("."), s = e.getState().selectedIndicesMap.get(o), l = t + "." + n.join(".");
            return s === l;
          }
          return;
        }
        if (p === "setSelected")
          return (r) => {
            const o = n.slice(0, -1), s = t + "." + o.join("."), l = t + "." + n.join(".");
            ft(t, o, void 0), e.getState().selectedIndicesMap.get(s), r && e.getState().setSelectedIndex(s, l);
          };
        if (p === "toggleSelected")
          return () => {
            const r = n.slice(0, -1), o = t + "." + r.join("."), s = t + "." + n.join(".");
            e.getState().selectedIndicesMap.get(o) === s ? e.getState().clearSelectedIndex({ arrayKey: o }) : e.getState().setSelectedIndex(o, s);
          };
        if (p === "_componentId")
          return _;
        if (n.length == 0) {
          if (p === "addZodValidation")
            return (r) => {
              if (!e.getState().getInitialOptions(t)?.validation?.key) throw new Error("Validation key not found");
              r.forEach((s) => {
                const l = e.getState().getShadowMetadata(t, s.path) || {};
                e.getState().setShadowMetadata(t, s.path, {
                  ...l,
                  validation: {
                    status: "VALIDATION_FAILED",
                    message: s.message,
                    validatedValue: void 0
                  }
                }), e.getState().notifyPathSubscribers(s.path, {
                  type: "VALIDATION_FAILED",
                  message: s.message,
                  validatedValue: void 0
                });
              });
            };
          if (p === "clearZodValidation")
            return (r) => {
              if (!r)
                throw new Error("clearZodValidation requires a path");
              const o = e.getState().getShadowMetadata(t, r) || {};
              o.validation && (e.getState().setShadowMetadata(t, r, {
                ...o,
                validation: void 0
              }), e.getState().notifyPathSubscribers([t, ...r].join("."), {
                type: "VALIDATION_CLEARED"
              }));
            };
          if (p === "applyJsonPatch")
            return (r) => {
              const o = e.getState(), s = o.getShadowMetadata(t, []);
              if (!s?.components) return;
              const l = (c) => !c || c === "/" ? [] : c.split("/").slice(1).map((d) => d.replace(/~1/g, "/").replace(/~0/g, "~")), u = /* @__PURE__ */ new Set();
              for (const c of r) {
                const d = l(c.path);
                switch (c.op) {
                  case "add":
                  case "replace": {
                    const { value: k } = c;
                    o.updateShadowAtPath(t, d, k), o.markAsDirty(t, d, { bubble: !0 });
                    let M = [...d];
                    for (; ; ) {
                      const D = o.getShadowMetadata(
                        t,
                        M
                      );
                      if (D?.pathComponents && D.pathComponents.forEach((V) => {
                        if (!u.has(V)) {
                          const $ = s.components?.get(V);
                          $ && ($.forceUpdate(), u.add(V));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const k = d.slice(0, -1);
                    o.removeShadowArrayElement(t, d), o.markAsDirty(t, k, { bubble: !0 });
                    let M = [...k];
                    for (; ; ) {
                      const D = o.getShadowMetadata(
                        t,
                        M
                      );
                      if (D?.pathComponents && D.pathComponents.forEach((V) => {
                        if (!u.has(V)) {
                          const $ = s.components?.get(V);
                          $ && ($.forceUpdate(), u.add(V));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (p === "getComponents")
            return () => e.getState().getShadowMetadata(t, [])?.components;
          if (p === "getAllFormRefs")
            return () => ht.getState().getFormRefsByStateKey(t);
        }
        if (p === "getFormRef")
          return () => ht.getState().getFormRef(t + "." + n.join("."));
        if (p === "validationWrapper")
          return ({
            children: r,
            hideMessage: o
          }) => /* @__PURE__ */ it(
            At,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: n,
              stateKey: t,
              children: r
            }
          );
        if (p === "_stateKey") return t;
        if (p === "_path") return n;
        if (p === "update")
          return (r) => (a(r, n, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const o = e.getState().getShadowMetadata(t, n);
              e.getState().setShadowMetadata(t, n, {
                ...o,
                isDirty: !1,
                // EXPLICITLY set to false, not just undefined
                stateSource: "server",
                // Mark as coming from server
                lastServerSync: Date.now()
                // Add timestamp
              });
              const s = [t, ...n].join(".");
              e.getState().notifyPathSubscribers(s, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (p === "toggle") {
          const r = e.getState().getShadowValue([t, ...n].join("."));
          if (console.log("currentValueAtPath", r), typeof b != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            a(!r, n, {
              updateType: "update"
            });
          };
        }
        if (p === "formElement")
          return (r, o) => /* @__PURE__ */ it(
            Yt,
            {
              stateKey: t,
              path: n,
              rebuildStateShape: i,
              setState: a,
              formOpts: o,
              renderFn: r
            }
          );
        const tt = [...n, p], Q = e.getState().getShadowValue(t, tt);
        return i({
          currentState: Q,
          path: tt,
          componentId: _,
          meta: h
        });
      }
    }, W = new Proxy(B, S);
    return y.set(x, {
      proxy: W,
      stateVersion: I
    }), W;
  }
  const f = {
    revertToInitialState: (b) => {
      e.getState().getInitialOptions(t)?.validation;
      const n = e.getState().getShadowMetadata(t, []);
      n?.stateSource === "server" && n.baseServerState ? n.baseServerState : e.getState().initialStateGlobal[t];
      const h = e.getState().initialStateGlobal[t];
      e.getState().clearSelectedIndexesForState(t), y.clear(), I++, e.getState().initializeShadowState(t, h), i({
        currentState: h,
        path: [],
        componentId: m
      });
      const _ = ot(t), x = rt(_?.localStorage?.key) ? _?.localStorage?.key(h) : _?.localStorage?.key, R = `${g}-${t}-${x}`;
      R && localStorage.removeItem(R);
      const B = e.getState().getShadowMetadata(t, []);
      return B && B?.components?.forEach((S) => {
        S.forceUpdate();
      }), h;
    },
    updateInitialState: (b) => {
      y.clear(), I++;
      const n = Pt(
        t,
        a,
        m,
        g
      ), h = e.getState().initialStateGlobal[t], _ = ot(t), x = rt(_?.localStorage?.key) ? _?.localStorage?.key(h) : _?.localStorage?.key, R = `${g}-${t}-${x}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Ut(() => {
        Ct(t, b), e.getState().initializeShadowState(t, b);
        const B = e.getState().getShadowMetadata(t, []);
        B && B?.components?.forEach((S) => {
          S.forceUpdate();
        });
      }), {
        fetchId: (B) => n.get()[B]
      };
    }
  };
  return i({
    currentState: e.getState().getShadowValue(t, []),
    componentId: m,
    path: []
  });
}
function bt(t) {
  return ut(zt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: a
}) {
  const m = z(null), g = z(`map-${crypto.randomUUID()}`), y = z(!1), I = z(/* @__PURE__ */ new Map());
  et(() => {
    const i = m.current;
    if (!i || y.current) return;
    const f = setTimeout(() => {
      const P = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, b = P.mapWrappers || [];
      b.push({
        instanceId: g.current,
        mapFn: t._mapFn,
        containerRef: i,
        rebuildStateShape: a,
        path: t._path,
        componentId: g.current,
        meta: t._meta
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...P,
        mapWrappers: b
      }), y.current = !0, T();
    }, 0);
    return () => {
      if (clearTimeout(f), g.current) {
        const P = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        P.mapWrappers && (P.mapWrappers = P.mapWrappers.filter(
          (b) => b.instanceId !== g.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, P));
      }
      I.current.forEach((P) => P.unmount());
    };
  }, []);
  const T = () => {
    const i = m.current;
    if (!i) return;
    const f = e.getState().getShadowValue(
      [t._stateKey, ...t._path].join("."),
      t._meta?.validIds
    );
    if (!Array.isArray(f)) return;
    const P = t._meta?.validIds ?? e.getState().getShadowMetadata(t._stateKey, t._path)?.arrayKeys ?? [], b = a({
      currentState: f,
      path: t._path,
      componentId: g.current,
      meta: t._meta
    });
    f.forEach((n, h) => {
      const _ = P[h];
      if (!_) return;
      const x = nt(), R = document.createElement("div");
      R.setAttribute("data-item-path", _), i.appendChild(R);
      const B = Vt(R);
      I.current.set(_, B);
      const S = _.split(".").slice(1);
      B.render(
        ut(wt, {
          stateKey: t._stateKey,
          itemComponentId: x,
          itemPath: S,
          localIndex: h,
          arraySetter: b,
          rebuildStateShape: a,
          renderFn: t._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ it("div", { ref: m, "data-map-container": g.current });
}
function zt({
  proxy: t
}) {
  const a = z(null), m = z(null), g = z(!1), y = `${t._stateKey}-${t._path.join(".")}`, I = e.getState().getShadowValue(
    [t._stateKey, ...t._path].join("."),
    t._meta?.validIds
  );
  return et(() => {
    const T = a.current;
    if (!T || g.current) return;
    const i = setTimeout(() => {
      if (!T.parentElement) {
        console.warn("Parent element not found for signal", y);
        return;
      }
      const f = T.parentElement, b = Array.from(f.childNodes).indexOf(T);
      let n = f.getAttribute("data-parent-id");
      n || (n = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", n)), m.current = `instance-${crypto.randomUUID()}`;
      const h = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, _ = h.signals || [];
      _.push({
        instanceId: m.current,
        parentId: n,
        position: b,
        effect: t._effect
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...h,
        signals: _
      });
      let x = I;
      if (t._effect)
        try {
          x = new Function(
            "state",
            `return (${t._effect})(state)`
          )(I);
        } catch (B) {
          console.error("Error evaluating effect function:", B);
        }
      x !== null && typeof x == "object" && (x = JSON.stringify(x));
      const R = document.createTextNode(String(x ?? ""));
      T.replaceWith(R), g.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(i), m.current) {
        const f = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        f.signals && (f.signals = f.signals.filter(
          (P) => P.instanceId !== m.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, f));
      }
    };
  }, []), ut("span", {
    ref: a,
    style: { display: "contents" },
    "data-signal-id": y
  });
}
const wt = $t(
  Jt,
  (t, a) => t.itemPath.join(".") === a.itemPath.join(".") && t.stateKey === a.stateKey && t.itemComponentId === a.itemComponentId && t.localIndex === a.localIndex
), Gt = (t) => {
  const [a, m] = at(!1);
  return dt(() => {
    if (!t.current) {
      m(!0);
      return;
    }
    const g = Array.from(t.current.querySelectorAll("img"));
    if (g.length === 0) {
      m(!0);
      return;
    }
    let y = 0;
    const I = () => {
      y++, y === g.length && m(!0);
    };
    return g.forEach((T) => {
      T.complete ? I() : (T.addEventListener("load", I), T.addEventListener("error", I));
    }), () => {
      g.forEach((T) => {
        T.removeEventListener("load", I), T.removeEventListener("error", I);
      });
    };
  }, [t.current]), a;
};
function Jt({
  stateKey: t,
  itemComponentId: a,
  itemPath: m,
  localIndex: g,
  arraySetter: y,
  rebuildStateShape: I,
  renderFn: T
}) {
  const [, i] = at({}), { ref: f, inView: P } = Nt(), b = z(null), n = Gt(b), h = z(!1), _ = [t, ...m].join(".");
  kt(t, a, i);
  const x = lt(
    (q) => {
      b.current = q, f(q);
    },
    [f]
  );
  et(() => {
    e.getState().subscribeToPath(_, (q) => {
      i({});
    });
  }, []), et(() => {
    if (!P || !n || h.current)
      return;
    const q = b.current;
    if (q && q.offsetHeight > 0) {
      h.current = !0;
      const p = q.offsetHeight;
      e.getState().setShadowMetadata(t, m, {
        virtualizer: {
          itemHeight: p,
          domRef: q
        }
      });
      const Y = m.slice(0, -1), tt = [t, ...Y].join(".");
      e.getState().notifyPathSubscribers(tt, {
        type: "ITEMHEIGHT",
        itemKey: m.join("."),
        ref: b.current
      });
    }
  }, [P, n, t, m]);
  const R = [t, ...m].join("."), B = e.getState().getShadowValue(R);
  if (B === void 0)
    return null;
  const S = I({
    currentState: B,
    path: m,
    componentId: a
  }), W = T(S, g, y);
  return /* @__PURE__ */ it("div", { ref: x, children: W });
}
function Yt({
  stateKey: t,
  path: a,
  rebuildStateShape: m,
  renderFn: g,
  formOpts: y,
  setState: I
}) {
  const [T] = at(() => nt()), [, i] = at({}), f = [t, ...a].join(".");
  kt(t, T, i);
  const P = e.getState().getShadowValue(f), [b, n] = at(P), h = z(!1), _ = z(null);
  et(() => {
    !h.current && !ct(P, b) && n(P);
  }, [P]), et(() => {
    const W = e.getState().subscribeToPath(f, (q) => {
      !h.current && b !== q && i({});
    });
    return () => {
      W(), _.current && (clearTimeout(_.current), h.current = !1);
    };
  }, []);
  const x = lt(
    (W) => {
      typeof P === "number" && typeof W == "string" && (W = W === "" ? 0 : Number(W)), n(W), h.current = !0, _.current && clearTimeout(_.current);
      const p = y?.debounceTime ?? 200;
      _.current = setTimeout(() => {
        h.current = !1, I(W, a, { updateType: "update" });
        const { getInitialOptions: Y, setShadowMetadata: tt, getShadowMetadata: Q } = e.getState(), r = Y(t)?.validation, o = r?.zodSchemaV4 || r?.zodSchemaV3;
        if (o) {
          const s = e.getState().getShadowValue(t), l = o.safeParse(s), u = Q(t, a) || {};
          if (l.success)
            tt(t, a, {
              ...u,
              validation: {
                status: "VALID_LIVE",
                validatedValue: W,
                message: void 0
              }
            });
          else {
            const d = ("issues" in l.error ? l.error.issues : l.error.errors).filter(
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
                validatedValue: W,
                message: void 0
              }
            });
          }
        }
      }, p), i({});
    },
    [I, a, y?.debounceTime, t]
  ), R = lt(async () => {
    console.log("handleBlur triggered"), _.current && (clearTimeout(_.current), _.current = null, h.current = !1, I(b, a, { updateType: "update" }));
    const { getInitialOptions: W } = e.getState(), q = W(t)?.validation, p = q?.zodSchemaV4 || q?.zodSchemaV3;
    if (!p) return;
    const Y = e.getState().getShadowMetadata(t, a);
    e.getState().setShadowMetadata(t, a, {
      ...Y,
      validation: {
        status: "DIRTY",
        validatedValue: b
      }
    });
    const tt = e.getState().getShadowValue(t), Q = p.safeParse(tt);
    if (console.log("result ", Q), Q.success)
      e.getState().setShadowMetadata(t, a, {
        ...Y,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: b
        }
      });
    else {
      const r = "issues" in Q.error ? Q.error.issues : Q.error.errors;
      console.log("All validation errors:", r), console.log("Current blur path:", a);
      const o = r.filter((s) => {
        if (console.log("Processing error:", s), a.some((u) => u.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const u = a[0].startsWith("id:") ? [] : a.slice(0, -1);
          console.log("Parent path:", u);
          const c = e.getState().getShadowMetadata(t, u);
          if (console.log("Array metadata:", c), c?.arrayKeys) {
            const d = [t, ...a.slice(0, -1)].join("."), k = c.arrayKeys.indexOf(d);
            console.log("Item key:", d, "Index:", k);
            const M = [...u, k, ...a.slice(-1)], D = JSON.stringify(s.path) === JSON.stringify(M);
            return console.log("Zod path comparison:", {
              zodPath: M,
              errorPath: s.path,
              match: D
            }), D;
          }
        }
        const l = JSON.stringify(s.path) === JSON.stringify(a);
        return console.log("Direct path comparison:", {
          errorPath: s.path,
          currentPath: a,
          match: l
        }), l;
      });
      console.log("Filtered path errors:", o), e.getState().setShadowMetadata(t, a, {
        ...Y,
        validation: {
          status: "VALIDATION_FAILED",
          message: o[0]?.message,
          validatedValue: b
        }
      });
    }
    i({});
  }, [t, a, b, I]), B = m({
    currentState: P,
    path: a,
    componentId: T
  }), S = new Proxy(B, {
    get(W, q) {
      return q === "inputProps" ? {
        value: b ?? "",
        onChange: (p) => {
          x(p.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: R,
        ref: ht.getState().getFormRef(t + "." + a.join("."))
      } : W[q];
    }
  });
  return /* @__PURE__ */ it(At, { formOpts: y, path: a, stateKey: t, children: g(S) });
}
function kt(t, a, m) {
  const g = `${t}////${a}`;
  dt(() => {
    const { registerComponent: y, unregisterComponent: I } = e.getState();
    return y(t, g, {
      forceUpdate: () => m({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      I(t, g);
    };
  }, [t, g]);
}
export {
  bt as $cogsSignal,
  se as addStateOptions,
  Ft as createCogsState,
  ie as createCogsStateFromSync,
  ce as notifyComponent,
  xt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
