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
  let s = !1;
  if (a)
    for (const l in a)
      T.hasOwnProperty(l) ? (l == "localStorage" && a[l] && T[l].key !== a[l]?.key && (s = !0, T[l] = a[l]), l == "defaultState" && a[l] && T[l] !== a[l] && !ct(T[l], a[l]) && (s = !0, T[l] = a[l])) : (s = !0, T[l] = a[l]);
  T.syncOptions && (!a || !a.hasOwnProperty("syncOptions")) && (s = !0), s && I(t, T);
}
function se(t, { formElements: a, validation: m }) {
  return { initialState: t, formElements: a, validation: m };
}
const Ft = (t, a) => {
  let m = t;
  console.log("optsc", a?.__useSync);
  const [g, y] = Rt(m);
  a?.__fromSyncSchema && a?.__syncNotifications && e.getState().setInitialStateOptions("__notifications", a.__syncNotifications), a?.__fromSyncSchema && a?.__apiParamsMap && e.getState().setInitialStateOptions("__apiParamsMap", a.__apiParamsMap), Object.keys(g).forEach((s) => {
    let l = y[s] || {};
    const P = {
      ...l
    };
    if (a?.formElements && (P.formElements = {
      ...a.formElements,
      ...l.formElements || {}
    }), a?.validation && (P.validation = {
      ...a.validation,
      ...l.validation || {}
    }, a.validation.key && !l.validation?.key && (P.validation.key = `${a.validation.key}.${s}`)), a?.__syncSchemas?.[s]?.schemas?.validation && (P.validation = {
      zodSchemaV4: a.__syncSchemas[s].schemas.validation,
      ...l.validation
    }), Object.keys(P).length > 0) {
      const b = ot(s);
      b ? e.getState().setInitialStateOptions(s, {
        ...b,
        ...P
      }) : e.getState().setInitialStateOptions(s, P);
    }
  }), Object.keys(g).forEach((s) => {
    e.getState().initializeShadowState(s, g[s]);
  });
  const I = (s, l) => {
    const [P] = at(l?.componentId ?? nt());
    Mt({
      stateKey: s,
      options: l,
      initialOptionsPart: y
    });
    const b = e.getState().getShadowValue(s) || g[s], o = l?.modifyState ? l.modifyState(b) : b;
    return xt(o, {
      stateKey: s,
      syncUpdate: l?.syncUpdate,
      componentId: P,
      localStorage: l?.localStorage,
      middleware: l?.middleware,
      reactiveType: l?.reactiveType,
      reactiveDeps: l?.reactiveDeps,
      defaultState: l?.defaultState,
      dependencies: l?.dependencies,
      serverState: l?.serverState,
      syncOptions: l?.syncOptions,
      __useSync: a?.__useSync
    });
  };
  function T(s, l) {
    Mt({ stateKey: s, options: l, initialOptionsPart: y }), l.localStorage && Ht(s, l), vt(s);
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
    __useSync: a,
    __syncSchemas: m
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
    let s;
    try {
      s = gt(T)?.lastSyncedWithServer;
    } catch {
    }
    const l = e.getState().getShadowMetadata(a, []), P = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: s,
      stateSource: l?.stateSource,
      baseServerState: l?.baseServerState
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
    T?.arrayKeys && T.arrayKeys.forEach((s, l) => {
      const P = s.split(".").slice(1), b = m[l];
      b !== void 0 && yt(
        t,
        P,
        b,
        g
      );
    });
  } else m && typeof m == "object" && m.constructor === Object && Object.keys(m).forEach((T) => {
    const s = [...a, T], l = m[T];
    yt(t, s, l, g);
  });
}
function xt(t, {
  stateKey: a,
  localStorage: m,
  formElements: g,
  reactiveDeps: y,
  reactiveType: I,
  componentId: T,
  defaultState: s,
  syncUpdate: l,
  dependencies: P,
  serverState: b,
  __useSync: o,
  syncOptions: h
} = {}) {
  const [_, x] = at({}), { sessionId: R } = _t();
  let B = !a;
  const [S] = at(a ?? nt()), W = e.getState().stateLog[S], q = z(/* @__PURE__ */ new Set()), p = z(T ?? nt()), Y = z(
    null
  );
  Y.current = ot(S) ?? null, et(() => {
    if (l && l.stateKey === S && l.path?.[0]) {
      const d = `${l.stateKey}:${l.path.join(".")}`;
      e.getState().setSyncInfo(d, {
        timeStamp: l.timeStamp,
        userId: l.userId
      });
    }
  }, [l]);
  const tt = lt(
    (d) => {
      const f = d ? { ...ot(S), ...d } : ot(S), D = f?.defaultState || s || t;
      if (f?.serverState?.status === "success" && f?.serverState?.data !== void 0)
        return {
          value: f.serverState.data,
          source: "server",
          timestamp: f.serverState.timestamp || Date.now()
        };
      if (f?.localStorage?.key && R) {
        const k = rt(f.localStorage.key) ? f.localStorage.key(D) : f.localStorage.key, V = gt(
          `${R}-${S}-${k}`
        );
        if (V && V.lastUpdated > (f?.serverState?.timestamp || 0))
          return {
            value: V.state,
            source: "localStorage",
            timestamp: V.lastUpdated
          };
      }
      return {
        value: D || t,
        source: "default",
        timestamp: Date.now()
      };
    },
    [S, s, t, R]
  );
  et(() => {
    e.getState().setServerStateUpdate(S, b);
  }, [b, S]), et(() => e.getState().subscribeToPath(S, (c) => {
    if (c?.type === "SERVER_STATE_UPDATE") {
      const f = c.serverState;
      if (console.log("SERVER_STATE_UPDATE", c), f?.status === "success" && f.data !== void 0) {
        mt(S, { serverState: f });
        const M = typeof f.merge == "object" ? f.merge : f.merge === !0 ? {} : null, k = e.getState().getShadowValue(S), V = f.data;
        if (M && Array.isArray(k) && Array.isArray(V)) {
          const j = M.key, L = new Set(
            k.map((Z) => Z[j])
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
                  lastServerSync: f.timestamp || Date.now()
                });
                const v = e.getState().getShadowValue(H);
                v && typeof v == "object" && !Array.isArray(v) && Object.keys(v).forEach((w) => {
                  const E = [...O, w];
                  e.getState().setShadowMetadata(S, E, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: f.timestamp || Date.now()
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
            f.timestamp
          );
        const $ = e.getState().getShadowMetadata(S, []);
        e.getState().setShadowMetadata(S, [], {
          ...$,
          stateSource: "server",
          lastServerSync: f.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [S, tt]), et(() => {
    const d = e.getState().getShadowMetadata(S, []);
    if (d && d.stateSource)
      return;
    const c = ot(S);
    if (c?.defaultState !== void 0 || s !== void 0) {
      const f = c?.defaultState || s;
      c?.defaultState || mt(S, {
        defaultState: f
      });
      const { value: D, source: M, timestamp: k } = tt();
      e.getState().initializeShadowState(S, D), e.getState().setShadowMetadata(S, [], {
        stateSource: M,
        lastServerSync: M === "server" ? k : void 0,
        isDirty: !1,
        baseServerState: M === "server" ? D : void 0
      }), vt(S);
    }
  }, [S, ...P || []]), dt(() => {
    B && mt(S, {
      formElements: g,
      defaultState: s,
      localStorage: m,
      middleware: Y.current?.middleware
    });
    const d = `${S}////${p.current}`, c = e.getState().getShadowMetadata(S, []), f = c?.components || /* @__PURE__ */ new Map();
    return f.set(d, {
      forceUpdate: () => x({}),
      reactiveType: I ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: y || void 0,
      deps: y ? y(e.getState().getShadowValue(S)) : [],
      prevDeps: y ? y(e.getState().getShadowValue(S)) : []
    }), e.getState().setShadowMetadata(S, [], {
      ...c,
      components: f
    }), x({}), () => {
      const D = e.getState().getShadowMetadata(S, []), M = D?.components?.get(d);
      M?.paths && M.paths.forEach((k) => {
        const $ = k.split(".").slice(1), j = e.getState().getShadowMetadata(S, $);
        j?.pathComponents && j.pathComponents.size === 0 && (delete j.pathComponents, e.getState().setShadowMetadata(S, $, j));
      }), D?.components && e.getState().setShadowMetadata(S, [], D);
    };
  }, []);
  const Q = z(null), r = (d, c, f) => {
    const D = [S, ...c].join(".");
    if (Array.isArray(c)) {
      const O = `${S}-${c.join(".")}`;
      q.current.add(O);
    }
    const M = e.getState(), k = M.getShadowMetadata(S, c), V = M.getShadowValue(D), $ = f.updateType === "insert" && rt(d) ? d({ state: V, uuid: nt() }) : rt(d) ? d(V) : d, L = {
      timeStamp: Date.now(),
      stateKey: S,
      path: c,
      updateType: f.updateType,
      status: "new",
      oldValue: V,
      newValue: $
    };
    switch (f.updateType) {
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
    if (f.sync !== !1 && Q.current && Q.current.connected && Q.current.updateState({ operation: L }), k?.signals && k.signals.length > 0) {
      const O = f.updateType === "cut" ? null : $;
      k.signals.forEach(({ parentId: v, position: w, effect: E }) => {
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
    if (f.updateType === "insert" && k?.mapWrappers && k.mapWrappers.length > 0) {
      const O = M.getShadowMetadata(S, c)?.arrayKeys || [], v = O[O.length - 1], w = M.getShadowValue(v), E = M.getShadowValue(
        [S, ...c].join(".")
      );
      if (!v || w === void 0) return;
      k.mapWrappers.forEach((A) => {
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
          const F = Vt(N), K = nt(), st = v.split(".").slice(1), kt = A.rebuildStateShape({
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
              arraySetter: kt,
              rebuildStateShape: A.rebuildStateShape,
              renderFn: A.mapFn
            })
          );
        }
      });
    }
    if (f.updateType === "cut") {
      const O = c.slice(0, -1), v = M.getShadowMetadata(S, O);
      v?.mapWrappers && v.mapWrappers.length > 0 && v.mapWrappers.forEach((w) => {
        if (w.containerRef && w.containerRef.isConnected) {
          const E = w.containerRef.querySelector(
            `[data-item-path="${D}"]`
          );
          E && E.remove();
        }
      });
    }
    const Z = e.getState().getShadowValue(S), X = e.getState().getShadowMetadata(S, []), H = /* @__PURE__ */ new Set();
    if (!X?.components)
      return Z;
    if (f.updateType === "update") {
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
    } else if (f.updateType === "insert" || f.updateType === "cut") {
      const O = f.updateType === "insert" ? c : c.slice(0, -1), v = M.getShadowMetadata(S, O);
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
  const n = St(() => Pt(
    S,
    r,
    p.current,
    R
  ), [S, R]), i = o, u = Y.current?.syncOptions;
  return i && (Q.current = i(
    n,
    u ?? {}
  )), n;
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
      ({ value: T }, s) => I.fn(T, s)
    ) : I.type === "sort" && y.sort((T, s) => I.fn(T.value, s.value));
  return y.map(({ key: I }) => I);
}, Tt = (t, a, m) => {
  const g = `${t}////${a}`, { addPathComponent: y, getShadowMetadata: I } = e.getState(), s = I(t, [])?.components?.get(g);
  !s || s.reactiveType === "none" || !(Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType]).includes("component") || y(t, m, g);
}, ft = (t, a, m) => {
  const g = e.getState(), y = g.getShadowMetadata(t, []), I = /* @__PURE__ */ new Set();
  y?.components && y.components.forEach((s, l) => {
    (Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"]).includes("all") && (s.forceUpdate(), I.add(l));
  }), g.getShadowMetadata(t, [...a, "getSelected"])?.pathComponents?.forEach((s) => {
    y?.components?.get(s)?.forceUpdate();
  });
  const T = g.getShadowMetadata(t, a);
  for (let s of T?.arrayKeys || []) {
    const l = s + ".selected", P = g.getShadowMetadata(
      t,
      l.split(".").slice(1)
    );
    s == m && P?.pathComponents?.forEach((b) => {
      y?.components?.get(b)?.forceUpdate();
    });
  }
};
function Pt(t, a, m, g) {
  const y = /* @__PURE__ */ new Map();
  let I = 0;
  const T = (b) => {
    const o = b.join(".");
    for (const [h] of y)
      (h === o || h.startsWith(o + ".")) && y.delete(h);
    I++;
  };
  function s({
    currentState: b,
    path: o = [],
    meta: h,
    componentId: _
  }) {
    const x = o.map(String).join("."), R = [t, ...o].join(".");
    b = e.getState().getShadowValue(R, h?.validIds);
    const B = function() {
      return e().getShadowValue(t, o);
    }, S = {
      apply(q, p, Y) {
      },
      get(q, p) {
        if (p === "_rebuildStateShape")
          return s;
        if (Object.getOwnPropertyNames(l).includes(p) && o.length === 0)
          return l[p];
        if (p === "getDifferences")
          return () => {
            const r = e.getState().getShadowMetadata(t, []), n = e.getState().getShadowValue(t);
            let i;
            return r?.stateSource === "server" && r.baseServerState ? i = r.baseServerState : i = e.getState().initialStateGlobal[t], Et(n, i);
          };
        if (p === "sync" && o.length === 0)
          return async function() {
            const r = e.getState().getInitialOptions(t), n = r?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const i = e.getState().getShadowValue(t, []), u = r?.validation?.key;
            try {
              const d = await n.action(i);
              if (d && !d.success && d.errors, d?.success) {
                const c = e.getState().getShadowMetadata(t, []);
                e.getState().setShadowMetadata(t, [], {
                  ...c,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: i
                  // Update base server state
                }), n.onSuccess && n.onSuccess(d.data);
              } else !d?.success && n.onError && n.onError(d.error);
              return d;
            } catch (d) {
              return n.onError && n.onError(d), { success: !1, error: d };
            }
          };
        if (p === "_status" || p === "getStatus") {
          const r = () => {
            const n = e.getState().getShadowMetadata(t, o), i = e.getState().getShadowValue(R);
            return n?.isDirty === !0 ? "dirty" : n?.isDirty === !1 || n?.stateSource === "server" ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" ? "fresh" : e.getState().getShadowMetadata(t, [])?.stateSource === "server" && !n?.isDirty ? "synced" : i !== void 0 && !n ? "fresh" : "unknown";
          };
          return p === "_status" ? r() : r;
        }
        if (p === "removeStorage")
          return () => {
            const r = e.getState().initialStateGlobal[t], n = ot(t), i = rt(n?.localStorage?.key) ? n.localStorage.key(r) : n?.localStorage?.key, u = `${g}-${t}-${i}`;
            u && localStorage.removeItem(u);
          };
        if (p === "showValidationErrors")
          return () => {
            const r = e.getState().getShadowMetadata(t, o);
            return r?.validation?.status === "VALIDATION_FAILED" && r.validation.message ? [r.validation.message] : [];
          };
        if (Array.isArray(b)) {
          if (p === "getSelected")
            return () => {
              const r = t + "." + o.join(".");
              Tt(t, _, [
                ...o,
                "getSelected"
              ]);
              const n = e.getState().selectedIndicesMap;
              if (!n || !n.has(r))
                return;
              const i = n.get(r);
              if (h?.validIds && !h.validIds.includes(i))
                return;
              const u = e.getState().getShadowValue(i);
              if (u)
                return s({
                  currentState: u,
                  path: i.split(".").slice(1),
                  componentId: _
                });
            };
          if (p === "getSelectedIndex")
            return () => e.getState().getSelectedIndex(
              t + "." + o.join("."),
              h?.validIds
            );
          if (p === "clearSelected")
            return ft(t, o), () => {
              e.getState().clearSelectedIndex({
                arrayKey: t + "." + o.join(".")
              });
            };
          if (p === "useVirtualView")
            return (r) => {
              const {
                itemHeight: n = 50,
                overscan: i = 6,
                stickToBottom: u = !1,
                scrollStickTolerance: d = 75
              } = r, c = z(null), [f, D] = at({
                startIndex: 0,
                endIndex: 10
              }), [M, k] = at({}), V = z(!0), $ = z({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), j = z(
                /* @__PURE__ */ new Map()
              );
              dt(() => {
                if (!u || !c.current || $.current.isUserScrolling)
                  return;
                const v = c.current;
                v.scrollTo({
                  top: v.scrollHeight,
                  behavior: V.current ? "instant" : "smooth"
                });
              }, [M, u]);
              const L = e.getState().getShadowMetadata(t, o)?.arrayKeys || [], { totalHeight: G, itemOffsets: Z } = St(() => {
                let v = 0;
                const w = /* @__PURE__ */ new Map();
                return (e.getState().getShadowMetadata(t, o)?.arrayKeys || []).forEach((A) => {
                  const C = A.split(".").slice(1), U = e.getState().getShadowMetadata(t, C)?.virtualizer?.itemHeight || n;
                  w.set(A, {
                    height: U,
                    offset: v
                  }), v += U;
                }), j.current = w, { totalHeight: v, itemOffsets: w };
              }, [L.length, n]);
              dt(() => {
                if (u && L.length > 0 && c.current && !$.current.isUserScrolling && V.current) {
                  const v = c.current, w = () => {
                    if (v.clientHeight > 0) {
                      const E = Math.ceil(
                        v.clientHeight / n
                      ), A = L.length - 1, C = Math.max(
                        0,
                        A - E - i
                      );
                      D({ startIndex: C, endIndex: A }), requestAnimationFrame(() => {
                        H("instant"), V.current = !1;
                      });
                    } else
                      requestAnimationFrame(w);
                  };
                  w();
                }
              }, [L.length, u, n, i]);
              const X = lt(() => {
                const v = c.current;
                if (!v) return;
                const w = v.scrollTop, { scrollHeight: E, clientHeight: A } = v, C = $.current, U = E - (w + A), N = C.isNearBottom;
                C.isNearBottom = U <= d, w < C.lastScrollTop ? (C.scrollUpCount++, C.scrollUpCount > 3 && N && (C.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : C.isNearBottom && (C.isUserScrolling = !1, C.scrollUpCount = 0), C.lastScrollTop = w;
                let J = 0;
                for (let F = 0; F < L.length; F++) {
                  const K = L[F], st = j.current.get(K);
                  if (st && st.offset + st.height > w) {
                    J = F;
                    break;
                  }
                }
                if (J !== f.startIndex) {
                  const F = Math.ceil(A / n);
                  D({
                    startIndex: Math.max(0, J - i),
                    endIndex: Math.min(
                      L.length - 1,
                      J + F + i
                    )
                  });
                }
              }, [
                L.length,
                f.startIndex,
                n,
                i,
                d
              ]);
              et(() => {
                const v = c.current;
                if (!(!v || !u))
                  return v.addEventListener("scroll", X, {
                    passive: !0
                  }), () => {
                    v.removeEventListener("scroll", X);
                  };
              }, [X, u]);
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
                if (!u || !c.current) return;
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
              }, [u, L.length, H]), {
                virtualState: St(() => {
                  const v = e.getState(), w = v.getShadowValue(
                    [t, ...o].join(".")
                  ), E = v.getShadowMetadata(t, o)?.arrayKeys || [], A = w.slice(
                    f.startIndex,
                    f.endIndex + 1
                  ), C = E.slice(
                    f.startIndex,
                    f.endIndex + 1
                  );
                  return s({
                    currentState: A,
                    path: o,
                    componentId: _,
                    meta: { ...h, validIds: C }
                  });
                }, [f.startIndex, f.endIndex, L.length]),
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
                        L[f.startIndex]
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
              const [n, i] = at(
                h?.validIds ?? e.getState().getShadowMetadata(t, o)?.arrayKeys
              ), u = e.getState().getShadowValue(R, h?.validIds);
              if (!n)
                throw new Error("No array keys found for mapping");
              const d = s({
                currentState: u,
                path: o,
                componentId: _,
                meta: h
              });
              return u.map((c, f) => {
                const D = n[f]?.split(".").slice(1), M = s({
                  currentState: c,
                  path: D,
                  componentId: _,
                  meta: h
                });
                return r(
                  M,
                  f,
                  d
                );
              });
            };
          if (p === "$stateMap")
            return (r) => ut(qt, {
              proxy: {
                _stateKey: t,
                _path: o,
                _mapFn: r,
                _meta: h
              },
              rebuildStateShape: s
            });
          if (p === "stateFind")
            return (r) => {
              const n = h?.validIds ?? e.getState().getShadowMetadata(t, o)?.arrayKeys;
              if (n)
                for (let i = 0; i < n.length; i++) {
                  const u = n[i];
                  if (!u) continue;
                  const d = e.getState().getShadowValue(u);
                  if (r(d, i)) {
                    const c = u.split(".").slice(1);
                    return s({
                      currentState: d,
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
              const n = h?.validIds ?? e.getState().getShadowMetadata(t, o)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for filtering.");
              const i = [], u = b.filter(
                (d, c) => r(d, c) ? (i.push(n[c]), !0) : !1
              );
              return s({
                currentState: u,
                path: o,
                componentId: _,
                meta: {
                  validIds: i,
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
              const n = h?.validIds ?? e.getState().getShadowMetadata(t, o)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for sorting");
              const i = b.map((u, d) => ({
                item: u,
                key: n[d]
              }));
              return i.sort((u, d) => r(u.item, d.item)).filter(Boolean), s({
                currentState: i.map((u) => u.item),
                path: o,
                componentId: _,
                meta: {
                  validIds: i.map((u) => u.key),
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
                bufferSize: n = 100,
                flushInterval: i = 100,
                bufferStrategy: u = "accumulate",
                store: d,
                onFlush: c
              } = r;
              let f = [], D = !1, M = null;
              const k = (G) => {
                if (!D) {
                  if (u === "sliding" && f.length >= n)
                    f.shift();
                  else if (u === "dropping" && f.length >= n)
                    return;
                  f.push(G), f.length >= n && V();
                }
              }, V = () => {
                if (f.length === 0) return;
                const G = [...f];
                if (f = [], d) {
                  const Z = d(G);
                  Z !== void 0 && (Array.isArray(Z) ? Z : [Z]).forEach((H) => {
                    a(H, o, {
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
              i > 0 && (M = setInterval(V, i));
              const $ = nt(), j = e.getState().getShadowMetadata(t, o) || {}, L = j.streams || /* @__PURE__ */ new Map();
              return L.set($, { buffer: f, flushTimer: M }), e.getState().setShadowMetadata(t, o, {
                ...j,
                streams: L
              }), {
                write: (G) => k(G),
                writeMany: (G) => G.forEach(k),
                flush: () => V(),
                pause: () => {
                  D = !0;
                },
                resume: () => {
                  D = !1, f.length > 0 && V();
                },
                close: () => {
                  V(), M && clearInterval(M);
                  const G = e.getState().getShadowMetadata(t, o);
                  G?.streams && G.streams.delete($);
                }
              };
            };
          if (p === "stateList")
            return (r) => /* @__PURE__ */ it(() => {
              const i = z(/* @__PURE__ */ new Map()), u = h?.transforms && h.transforms.length > 0 ? `${_}-${Bt(h.transforms)}` : `${_}-base`, [d, c] = at({}), { validIds: f, arrayValues: D } = St(() => {
                const k = e.getState().getShadowMetadata(t, o)?.transformCaches?.get(u);
                let V;
                k && k.validIds ? V = k.validIds : (V = pt(
                  t,
                  o,
                  h?.transforms
                ), e.getState().setTransformCache(t, o, u, {
                  validIds: V,
                  computedAt: Date.now(),
                  transforms: h?.transforms || []
                }));
                const $ = e.getState().getShadowValue(R, V);
                return {
                  validIds: V,
                  arrayValues: $ || []
                };
              }, [u, d]);
              if (et(() => {
                const k = e.getState().subscribeToPath(R, (V) => {
                  if (V.type === "GET_SELECTED")
                    return;
                  const j = e.getState().getShadowMetadata(t, o)?.transformCaches;
                  if (j)
                    for (const L of j.keys())
                      L.startsWith(_) && j.delete(L);
                  (V.type === "INSERT" || V.type === "REMOVE" || V.type === "CLEAR_SELECTION") && c({});
                });
                return () => {
                  k();
                };
              }, [_, R]), !Array.isArray(D))
                return null;
              const M = s({
                currentState: D,
                path: o,
                componentId: _,
                meta: {
                  ...h,
                  validIds: f
                }
              });
              return /* @__PURE__ */ it(Ot, { children: D.map((k, V) => {
                const $ = f[V];
                if (!$)
                  return null;
                let j = i.current.get($);
                j || (j = nt(), i.current.set($, j));
                const L = $.split(".").slice(1);
                return ut(wt, {
                  key: $,
                  stateKey: t,
                  itemComponentId: j,
                  itemPath: L,
                  localIndex: V,
                  arraySetter: M,
                  rebuildStateShape: s,
                  renderFn: r
                });
              }) });
            }, {});
          if (p === "stateFlattenOn")
            return (r) => {
              const n = b;
              y.clear(), I++;
              const i = n.flatMap(
                (u) => u[r] ?? []
              );
              return s({
                currentState: i,
                path: [...o, "[*]", r],
                componentId: _,
                meta: h
              });
            };
          if (p === "index")
            return (r) => {
              const i = e.getState().getShadowMetadata(t, o)?.arrayKeys?.filter(
                (c) => !h?.validIds || h?.validIds && h?.validIds?.includes(c)
              )?.[r];
              if (!i) return;
              const u = e.getState().getShadowValue(i, h?.validIds);
              return s({
                currentState: u,
                path: i.split(".").slice(1),
                componentId: _,
                meta: h
              });
            };
          if (p === "last")
            return () => {
              const r = e.getState().getShadowValue(t, o);
              if (r.length === 0) return;
              const n = r.length - 1, i = r[n], u = [...o, n.toString()];
              return s({
                currentState: i,
                path: u,
                componentId: _,
                meta: h
              });
            };
          if (p === "insert")
            return (r, n) => (a(r, o, { updateType: "insert" }), s({
              currentState: e.getState().getShadowValue(t, o),
              path: o,
              componentId: _,
              meta: h
            }));
          if (p === "uniqueInsert")
            return (r, n, i) => {
              const u = e.getState().getShadowValue(t, o), d = rt(r) ? r(u) : r;
              let c = null;
              if (!u.some((D) => {
                const M = n ? n.every(
                  (k) => ct(D[k], d[k])
                ) : ct(D, d);
                return M && (c = D), M;
              }))
                T(o), a(d, o, { updateType: "insert" });
              else if (i && c) {
                const D = i(c), M = u.map(
                  (k) => ct(k, c) ? D : k
                );
                T(o), a(M, o, {
                  updateType: "update"
                });
              }
            };
          if (p === "cut")
            return (r, n) => {
              const i = h?.validIds ?? e.getState().getShadowMetadata(t, o)?.arrayKeys;
              if (!i || i.length === 0) return;
              const u = r == -1 ? i.length - 1 : r !== void 0 ? r : i.length - 1, d = i[u];
              if (!d) return;
              const c = d.split(".").slice(1);
              a(b, c, {
                updateType: "cut"
              });
            };
          if (p === "cutSelected")
            return () => {
              const r = pt(
                t,
                o,
                h?.transforms
              );
              if (!r || r.length === 0) return;
              const n = e.getState().selectedIndicesMap.get(R);
              let i = r.findIndex(
                (c) => c === n
              );
              const u = r[i == -1 ? r.length - 1 : i]?.split(".").slice(1);
              e.getState().clearSelectedIndex({ arrayKey: R });
              const d = u?.slice(0, -1);
              ft(t, d), a(b, u, {
                updateType: "cut"
              });
            };
          if (p === "cutByValue")
            return (r) => {
              const n = e.getState().getShadowMetadata(t, o), i = h?.validIds ?? n?.arrayKeys;
              if (!i) return;
              let u = null;
              for (const d of i)
                if (e.getState().getShadowValue(d) === r) {
                  u = d;
                  break;
                }
              if (u) {
                const d = u.split(".").slice(1);
                a(null, d, { updateType: "cut" });
              }
            };
          if (p === "toggleByValue")
            return (r) => {
              const n = e.getState().getShadowMetadata(t, o), i = h?.validIds ?? n?.arrayKeys;
              if (!i) return;
              let u = null;
              for (const d of i) {
                const c = e.getState().getShadowValue(d);
                if (console.log("itemValue sdasdasdasd", c), c === r) {
                  u = d;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", u), u) {
                const d = u.split(".").slice(1);
                console.log("itemValue keyToCut", u), a(r, d, {
                  updateType: "cut"
                });
              } else
                a(r, o, { updateType: "insert" });
            };
          if (p === "findWith")
            return (r, n) => {
              const i = e.getState().getShadowMetadata(t, o)?.arrayKeys;
              if (!i)
                throw new Error("No array keys found for sorting");
              let u = null, d = [];
              for (const c of i) {
                let f = e.getState().getShadowValue(c, h?.validIds);
                if (f && f[r] === n) {
                  u = f, d = c.split(".").slice(1);
                  break;
                }
              }
              return s({
                currentState: u,
                path: d,
                componentId: _,
                meta: h
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
          return () => (Tt(t, _, o), e.getState().getShadowValue(R, h?.validIds));
        if (p === "getState")
          return () => e.getState().getShadowValue(R, h?.validIds);
        if (p === "$derive")
          return (r) => bt({
            _stateKey: t,
            _path: o,
            _effect: r.toString(),
            _meta: h
          });
        if (p === "$get")
          return () => bt({ _stateKey: t, _path: o, _meta: h });
        if (p === "lastSynced") {
          const r = `${t}:${o.join(".")}`;
          return e.getState().getSyncInfo(r);
        }
        if (p == "getLocalStorage")
          return (r) => gt(g + "-" + t + "-" + r);
        if (p === "isSelected") {
          const r = [t, ...o].slice(0, -1);
          if (ft(t, o, void 0), Array.isArray(
            e.getState().getShadowValue(r.join("."), h?.validIds)
          )) {
            o[o.length - 1];
            const n = r.join("."), i = e.getState().selectedIndicesMap.get(n), u = t + "." + o.join(".");
            return i === u;
          }
          return;
        }
        if (p === "setSelected")
          return (r) => {
            const n = o.slice(0, -1), i = t + "." + n.join("."), u = t + "." + o.join(".");
            ft(t, n, void 0), e.getState().selectedIndicesMap.get(i), r && e.getState().setSelectedIndex(i, u);
          };
        if (p === "toggleSelected")
          return () => {
            const r = o.slice(0, -1), n = t + "." + r.join("."), i = t + "." + o.join(".");
            e.getState().selectedIndicesMap.get(n) === i ? e.getState().clearSelectedIndex({ arrayKey: n }) : e.getState().setSelectedIndex(n, i);
          };
        if (p === "_componentId")
          return _;
        if (o.length == 0) {
          if (p === "addZodValidation")
            return (r) => {
              e.getState().getInitialOptions(t)?.validation, r.forEach((n) => {
                const i = e.getState().getShadowMetadata(t, n.path) || {};
                e.getState().setShadowMetadata(t, n.path, {
                  ...i,
                  validation: {
                    status: "VALIDATION_FAILED",
                    message: n.message,
                    validatedValue: void 0
                  }
                }), e.getState().notifyPathSubscribers(n.path, {
                  type: "VALIDATION_FAILED",
                  message: n.message,
                  validatedValue: void 0
                });
              });
            };
          if (p === "clearZodValidation")
            return (r) => {
              if (!r)
                throw new Error("clearZodValidation requires a path");
              const n = e.getState().getShadowMetadata(t, r) || {};
              n.validation && (e.getState().setShadowMetadata(t, r, {
                ...n,
                validation: void 0
              }), e.getState().notifyPathSubscribers([t, ...r].join("."), {
                type: "VALIDATION_CLEARED"
              }));
            };
          if (p === "applyJsonPatch")
            return (r) => {
              const n = e.getState(), i = n.getShadowMetadata(t, []);
              if (!i?.components) return;
              const u = (c) => !c || c === "/" ? [] : c.split("/").slice(1).map((f) => f.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const c of r) {
                const f = u(c.path);
                switch (c.op) {
                  case "add":
                  case "replace": {
                    const { value: D } = c;
                    n.updateShadowAtPath(t, f, D), n.markAsDirty(t, f, { bubble: !0 });
                    let M = [...f];
                    for (; ; ) {
                      const k = n.getShadowMetadata(
                        t,
                        M
                      );
                      if (k?.pathComponents && k.pathComponents.forEach((V) => {
                        if (!d.has(V)) {
                          const $ = i.components?.get(V);
                          $ && ($.forceUpdate(), d.add(V));
                        }
                      }), M.length === 0) break;
                      M.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const D = f.slice(0, -1);
                    n.removeShadowArrayElement(t, f), n.markAsDirty(t, D, { bubble: !0 });
                    let M = [...D];
                    for (; ; ) {
                      const k = n.getShadowMetadata(
                        t,
                        M
                      );
                      if (k?.pathComponents && k.pathComponents.forEach((V) => {
                        if (!d.has(V)) {
                          const $ = i.components?.get(V);
                          $ && ($.forceUpdate(), d.add(V));
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
          return () => ht.getState().getFormRef(t + "." + o.join("."));
        if (p === "validationWrapper")
          return ({
            children: r,
            hideMessage: n
          }) => /* @__PURE__ */ it(
            At,
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
              const i = [t, ...o].join(".");
              e.getState().notifyPathSubscribers(i, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (p === "toggle") {
          const r = e.getState().getShadowValue([t, ...o].join("."));
          if (console.log("currentValueAtPath", r), typeof b != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            a(!r, o, {
              updateType: "update"
            });
          };
        }
        if (p === "formElement")
          return (r, n) => /* @__PURE__ */ it(
            Yt,
            {
              stateKey: t,
              path: o,
              rebuildStateShape: s,
              setState: a,
              formOpts: n,
              renderFn: r
            }
          );
        const tt = [...o, p], Q = e.getState().getShadowValue(t, tt);
        return s({
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
  const l = {
    revertToInitialState: (b) => {
      e.getState().getInitialOptions(t)?.validation;
      const o = e.getState().getShadowMetadata(t, []);
      o?.stateSource === "server" && o.baseServerState ? o.baseServerState : e.getState().initialStateGlobal[t];
      const h = e.getState().initialStateGlobal[t];
      e.getState().clearSelectedIndexesForState(t), y.clear(), I++, e.getState().initializeShadowState(t, h), s({
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
      const o = Pt(
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
        fetchId: (B) => o.get()[B]
      };
    }
  };
  return s({
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
    const s = m.current;
    if (!s || y.current) return;
    const l = setTimeout(() => {
      const P = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, b = P.mapWrappers || [];
      b.push({
        instanceId: g.current,
        mapFn: t._mapFn,
        containerRef: s,
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
      if (clearTimeout(l), g.current) {
        const P = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        P.mapWrappers && (P.mapWrappers = P.mapWrappers.filter(
          (b) => b.instanceId !== g.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, P));
      }
      I.current.forEach((P) => P.unmount());
    };
  }, []);
  const T = () => {
    const s = m.current;
    if (!s) return;
    const l = e.getState().getShadowValue(
      [t._stateKey, ...t._path].join("."),
      t._meta?.validIds
    );
    if (!Array.isArray(l)) return;
    const P = t._meta?.validIds ?? e.getState().getShadowMetadata(t._stateKey, t._path)?.arrayKeys ?? [], b = a({
      currentState: l,
      path: t._path,
      componentId: g.current,
      meta: t._meta
    });
    l.forEach((o, h) => {
      const _ = P[h];
      if (!_) return;
      const x = nt(), R = document.createElement("div");
      R.setAttribute("data-item-path", _), s.appendChild(R);
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
    const s = setTimeout(() => {
      if (!T.parentElement) {
        console.warn("Parent element not found for signal", y);
        return;
      }
      const l = T.parentElement, b = Array.from(l.childNodes).indexOf(T);
      let o = l.getAttribute("data-parent-id");
      o || (o = `parent-${crypto.randomUUID()}`, l.setAttribute("data-parent-id", o)), m.current = `instance-${crypto.randomUUID()}`;
      const h = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, _ = h.signals || [];
      _.push({
        instanceId: m.current,
        parentId: o,
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
      if (clearTimeout(s), m.current) {
        const l = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        l.signals && (l.signals = l.signals.filter(
          (P) => P.instanceId !== m.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, l));
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
  const [, s] = at({}), { ref: l, inView: P } = Nt(), b = z(null), o = Gt(b), h = z(!1), _ = [t, ...m].join(".");
  Dt(t, a, s);
  const x = lt(
    (q) => {
      b.current = q, l(q);
    },
    [l]
  );
  et(() => {
    e.getState().subscribeToPath(_, (q) => {
      s({});
    });
  }, []), et(() => {
    if (!P || !o || h.current)
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
  }, [P, o, t, m]);
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
  const [T] = at(() => nt()), [, s] = at({}), l = [t, ...a].join(".");
  Dt(t, T, s);
  const P = e.getState().getShadowValue(l), [b, o] = at(P), h = z(!1), _ = z(null);
  et(() => {
    !h.current && !ct(P, b) && o(P);
  }, [P]), et(() => {
    const W = e.getState().subscribeToPath(l, (q) => {
      !h.current && b !== q && s({});
    });
    return () => {
      W(), _.current && (clearTimeout(_.current), h.current = !1);
    };
  }, []);
  const x = lt(
    (W) => {
      typeof P === "number" && typeof W == "string" && (W = W === "" ? 0 : Number(W)), o(W), h.current = !0, _.current && clearTimeout(_.current);
      const p = y?.debounceTime ?? 200;
      _.current = setTimeout(() => {
        h.current = !1, I(W, a, { updateType: "update" });
        const { getInitialOptions: Y, setShadowMetadata: tt, getShadowMetadata: Q } = e.getState(), r = Y(t)?.validation, n = r?.zodSchemaV4 || r?.zodSchemaV3;
        if (n) {
          const i = e.getState().getShadowValue(t), u = n.safeParse(i), d = Q(t, a) || {};
          if (u.success)
            tt(t, a, {
              ...d,
              validation: {
                status: "VALID_LIVE",
                validatedValue: W,
                message: void 0
              }
            });
          else {
            const f = ("issues" in u.error ? u.error.issues : u.error.errors).filter(
              (D) => JSON.stringify(D.path) === JSON.stringify(a)
            );
            f.length > 0 ? tt(t, a, {
              ...d,
              validation: {
                status: "INVALID_LIVE",
                message: f[0]?.message,
                validatedValue: W
              }
            }) : tt(t, a, {
              ...d,
              validation: {
                status: "VALID_LIVE",
                validatedValue: W,
                message: void 0
              }
            });
          }
        }
      }, p), s({});
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
      const n = r.filter((i) => {
        if (console.log("Processing error:", i), a.some((d) => d.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const d = a[0].startsWith("id:") ? [] : a.slice(0, -1);
          console.log("Parent path:", d);
          const c = e.getState().getShadowMetadata(t, d);
          if (console.log("Array metadata:", c), c?.arrayKeys) {
            const f = [t, ...a.slice(0, -1)].join("."), D = c.arrayKeys.indexOf(f);
            console.log("Item key:", f, "Index:", D);
            const M = [...d, D, ...a.slice(-1)], k = JSON.stringify(i.path) === JSON.stringify(M);
            return console.log("Zod path comparison:", {
              zodPath: M,
              errorPath: i.path,
              match: k
            }), k;
          }
        }
        const u = JSON.stringify(i.path) === JSON.stringify(a);
        return console.log("Direct path comparison:", {
          errorPath: i.path,
          currentPath: a,
          match: u
        }), u;
      });
      console.log("Filtered path errors:", n), e.getState().setShadowMetadata(t, a, {
        ...Y,
        validation: {
          status: "VALIDATION_FAILED",
          message: n[0]?.message,
          validatedValue: b
        }
      });
    }
    s({});
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
function Dt(t, a, m) {
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
