"use client";
import { jsx as nt, Fragment as Pt } from "react/jsx-runtime";
import { memo as Dt, useState as X, useRef as z, useCallback as st, useEffect as Q, useLayoutEffect as ct, useMemo as dt, createElement as it, startTransition as kt } from "react";
import { createRoot as Mt } from "react-dom/client";
import { transformStateFunc as Ot, isFunction as tt, isArray as pt, getDifferences as Tt, isDeepEqual as ot } from "./utility.js";
import { ValidationWrapper as bt } from "./Functions.jsx";
import Ut from "superjson";
import { v4 as et } from "uuid";
import { getGlobalStore as a, formRefStore as St } from "./store.js";
import { useCogsConfig as Et } from "./CogsStateClient.jsx";
import { useInView as $t } from "react-intersection-observer";
function ft(t, r) {
  const h = a.getState().getInitialOptions, g = a.getState().setInitialStateOptions, w = h(t) || {};
  g(t, {
    ...w,
    ...r
  });
}
function vt({
  stateKey: t,
  options: r,
  initialOptionsPart: h
}) {
  const g = at(t) || {}, w = h[t] || {}, f = a.getState().setInitialStateOptions, b = { ...w, ...g };
  let S = !1;
  if (r)
    for (const e in r)
      b.hasOwnProperty(e) ? (e == "localStorage" && r[e] && b[e].key !== r[e]?.key && (S = !0, b[e] = r[e]), e == "defaultState" && r[e] && b[e] !== r[e] && !ot(b[e], r[e]) && (S = !0, b[e] = r[e])) : (S = !0, b[e] = r[e]);
  b.syncOptions && (!r || !r.hasOwnProperty("syncOptions")) && (S = !0), S && f(t, b);
}
function re(t, { formElements: r, validation: h }) {
  return { initialState: t, formElements: r, validation: h };
}
const Rt = (t, r) => {
  let h = t;
  console.log("optsc", r?.__useSync);
  const [g, w] = Ot(h);
  r?.__fromSyncSchema && r?.__syncNotifications && a.getState().setInitialStateOptions("__notifications", r.__syncNotifications), r?.__fromSyncSchema && r?.__apiParamsMap && a.getState().setInitialStateOptions("__apiParamsMap", r.__apiParamsMap), Object.keys(g).forEach((S) => {
    let e = w[S] || {};
    const s = {
      ...e
    };
    if (r?.formElements && (s.formElements = {
      ...r.formElements,
      ...e.formElements || {}
    }), r?.validation && (s.validation = {
      ...r.validation,
      ...e.validation || {}
    }, r.validation.key && !e.validation?.key && (s.validation.key = `${r.validation.key}.${S}`)), r?.__syncSchemas?.[S]?.schemas?.validation && (s.validation = {
      zodSchemaV4: r.__syncSchemas[S].schemas.validation,
      ...e.validation
    }), Object.keys(s).length > 0) {
      const v = at(S);
      v ? a.getState().setInitialStateOptions(S, {
        ...v,
        ...s
      }) : a.getState().setInitialStateOptions(S, s);
    }
  }), Object.keys(g).forEach((S) => {
    a.getState().initializeShadowState(S, g[S]);
  });
  const f = (S, e) => {
    const [s] = X(e?.componentId ?? et());
    vt({
      stateKey: S,
      options: e,
      initialOptionsPart: w
    });
    const v = a.getState().getShadowValue(S) || g[S], R = e?.modifyState ? e.modifyState(v) : v;
    return Lt(R, {
      stateKey: S,
      syncUpdate: e?.syncUpdate,
      componentId: s,
      localStorage: e?.localStorage,
      middleware: e?.middleware,
      reactiveType: e?.reactiveType,
      reactiveDeps: e?.reactiveDeps,
      defaultState: e?.defaultState,
      dependencies: e?.dependencies,
      serverState: e?.serverState,
      syncOptions: e?.syncOptions,
      __useSync: r?.__useSync
    });
  };
  function b(S, e) {
    vt({ stateKey: S, options: e, initialOptionsPart: w }), e.localStorage && Ft(S, e), mt(S);
  }
  return { useCogsState: f, setCogsOptions: b };
};
function ne(t, r) {
  const h = t.schemas, g = {}, w = {};
  for (const f in h) {
    const b = h[f];
    g[f] = b?.schemas?.defaultValues || {}, b?.api?.queryData?._paramType && (w[f] = b.api.queryData._paramType);
  }
  return Rt(g, {
    __fromSyncSchema: !0,
    __syncNotifications: t.notifications,
    __apiParamsMap: w,
    __useSync: r,
    __syncSchemas: h
  });
}
const {
  getInitialOptions: at,
  addStateLog: Nt,
  updateInitialStateGlobal: Vt
} = a.getState(), jt = (t, r, h, g, w) => {
  h?.log && console.log(
    "saving to localstorage",
    r,
    h.localStorage?.key,
    g
  );
  const f = tt(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (f && g) {
    const b = `${g}-${r}-${f}`;
    let S;
    try {
      S = ut(b)?.lastSyncedWithServer;
    } catch {
    }
    const e = a.getState().getShadowMetadata(r, []), s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: S,
      stateSource: e?.stateSource,
      baseServerState: e?.baseServerState
    }, v = Ut.serialize(s);
    window.localStorage.setItem(
      b,
      JSON.stringify(v.json)
    );
  }
}, ut = (t) => {
  if (!t) return null;
  try {
    const r = window.localStorage.getItem(t);
    return r ? JSON.parse(r) : null;
  } catch (r) {
    return console.error("Error loading from localStorage:", r), null;
  }
}, Ft = (t, r) => {
  const h = a.getState().getShadowValue(t), { sessionId: g } = Et(), w = tt(r?.localStorage?.key) ? r.localStorage.key(h) : r?.localStorage?.key;
  if (w && g) {
    const f = ut(
      `${g}-${t}-${w}`
    );
    if (f && f.lastUpdated > (f.lastSyncedWithServer || 0))
      return mt(t), !0;
  }
  return !1;
}, mt = (t) => {
  const r = a.getState().getShadowMetadata(t, []);
  if (!r) return;
  const h = /* @__PURE__ */ new Set();
  r?.components?.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || h.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((g) => g());
  });
}, oe = (t, r) => {
  const h = a.getState().getShadowMetadata(t, []);
  if (h) {
    const g = `${t}////${r}`, w = h?.components?.get(g);
    if ((w ? Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"] : null)?.includes("none"))
      return;
    w && w.forceUpdate();
  }
};
function gt(t, r, h, g) {
  const w = a.getState(), f = w.getShadowMetadata(t, r);
  if (w.setShadowMetadata(t, r, {
    ...f,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: g || Date.now()
  }), Array.isArray(h)) {
    const b = w.getShadowMetadata(t, r);
    b?.arrayKeys && b.arrayKeys.forEach((S, e) => {
      const s = S.split(".").slice(1), v = h[e];
      v !== void 0 && gt(
        t,
        s,
        v,
        g
      );
    });
  } else h && typeof h == "object" && h.constructor === Object && Object.keys(h).forEach((b) => {
    const S = [...r, b], e = h[b];
    gt(t, S, e, g);
  });
}
function Lt(t, {
  stateKey: r,
  localStorage: h,
  formElements: g,
  reactiveDeps: w,
  reactiveType: f,
  componentId: b,
  defaultState: S,
  syncUpdate: e,
  dependencies: s,
  serverState: v,
  __useSync: R,
  syncOptions: L
} = {}) {
  const [k, W] = X({}), { sessionId: H } = Et();
  let J = !r;
  const [m] = X(r ?? et()), u = z(b ?? et()), j = z(
    null
  );
  j.current = at(m) ?? null, Q(() => {
    if (e && e.stateKey === m && e.path?.[0]) {
      const l = `${e.stateKey}:${e.path.join(".")}`;
      a.getState().setSyncInfo(l, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]);
  const Y = st(
    (l) => {
      const y = l ? { ...at(m), ...l } : at(m), _ = y?.defaultState || S || t;
      if (y?.serverState?.status === "success" && y?.serverState?.data !== void 0)
        return {
          value: y.serverState.data,
          source: "server",
          timestamp: y.serverState.timestamp || Date.now()
        };
      if (y?.localStorage?.key && H) {
        const E = tt(y.localStorage.key) ? y.localStorage.key(_) : y.localStorage.key, A = ut(
          `${H}-${m}-${E}`
        );
        if (A && A.lastUpdated > (y?.serverState?.timestamp || 0))
          return {
            value: A.state,
            source: "localStorage",
            timestamp: A.lastUpdated
          };
      }
      return {
        value: _ || t,
        source: "default",
        timestamp: Date.now()
      };
    },
    [m, S, t, H]
  );
  Q(() => {
    a.getState().setServerStateUpdate(m, v);
  }, [v, m]), Q(() => a.getState().subscribeToPath(m, (d) => {
    if (d?.type === "SERVER_STATE_UPDATE") {
      const y = d.serverState;
      if (console.log("SERVER_STATE_UPDATE", d), y?.status === "success" && y.data !== void 0) {
        ft(m, { serverState: y });
        const M = typeof y.merge == "object" ? y.merge : y.merge === !0 ? {} : null, E = a.getState().getShadowValue(m), A = y.data;
        if (M && Array.isArray(E) && Array.isArray(A)) {
          const $ = M.key, x = new Set(
            E.map((G) => G[$])
          ), K = A.filter((G) => !x.has(G[$]));
          K.length > 0 && K.forEach((G) => {
            a.getState().insertShadowArrayElement(m, [], G);
            const B = a.getState().getShadowMetadata(m, []);
            if (B?.arrayKeys) {
              const D = B.arrayKeys[B.arrayKeys.length - 1];
              if (D) {
                const I = D.split(".").slice(1);
                a.getState().setShadowMetadata(m, I, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: y.timestamp || Date.now()
                });
                const T = a.getState().getShadowValue(D);
                T && typeof T == "object" && !Array.isArray(T) && Object.keys(T).forEach((C) => {
                  const V = [...I, C];
                  a.getState().setShadowMetadata(m, V, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: y.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          a.getState().initializeShadowState(m, A), gt(
            m,
            [],
            A,
            y.timestamp
          );
        const U = a.getState().getShadowMetadata(m, []);
        a.getState().setShadowMetadata(m, [], {
          ...U,
          stateSource: "server",
          lastServerSync: y.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [m, Y]), Q(() => {
    const l = a.getState().getShadowMetadata(m, []);
    if (l && l.stateSource)
      return;
    const d = at(m);
    if (d?.defaultState !== void 0 || S !== void 0) {
      const y = d?.defaultState || S;
      d?.defaultState || ft(m, {
        defaultState: y
      });
      const { value: _, source: M, timestamp: E } = Y();
      a.getState().initializeShadowState(m, _), a.getState().setShadowMetadata(m, [], {
        stateSource: M,
        lastServerSync: M === "server" ? E : void 0,
        isDirty: !1,
        baseServerState: M === "server" ? _ : void 0
      }), mt(m);
    }
  }, [m, ...s || []]), ct(() => {
    J && ft(m, {
      formElements: g,
      defaultState: S,
      localStorage: h,
      middleware: j.current?.middleware
    });
    const l = `${m}////${u.current}`, d = a.getState().getShadowMetadata(m, []), y = d?.components || /* @__PURE__ */ new Map();
    return y.set(l, {
      forceUpdate: () => W({}),
      reactiveType: f ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: w || void 0,
      deps: w ? w(a.getState().getShadowValue(m)) : [],
      prevDeps: w ? w(a.getState().getShadowValue(m)) : []
    }), a.getState().setShadowMetadata(m, [], {
      ...d,
      components: y
    }), W({}), () => {
      const _ = a.getState().getShadowMetadata(m, []), M = _?.components?.get(l);
      M?.paths && M.paths.forEach((E) => {
        const U = E.split(".").slice(1), $ = a.getState().getShadowMetadata(m, U);
        $?.pathComponents && $.pathComponents.size === 0 && (delete $.pathComponents, a.getState().setShadowMetadata(m, U, $));
      }), _?.components && a.getState().setShadowMetadata(m, [], _);
    };
  }, []);
  const n = z(null), o = (l, d, y) => {
    const _ = [m, ...d].join("."), M = a.getState(), E = M.getShadowMetadata(m, d), A = M.getShadowValue(_), U = y.updateType === "insert" && tt(l) ? l({ state: A, uuid: et() }) : tt(l) ? l(A) : l, x = {
      timeStamp: Date.now(),
      stateKey: m,
      path: d,
      updateType: y.updateType,
      status: "new",
      oldValue: A,
      newValue: U
    };
    switch (y.updateType) {
      case "insert": {
        M.insertShadowArrayElement(m, d, x.newValue), M.markAsDirty(m, d, { bubble: !0 });
        const D = M.getShadowMetadata(m, d);
        if (D?.arrayKeys) {
          const I = D.arrayKeys[D.arrayKeys.length - 1];
          if (I) {
            const T = I.split(".").slice(1);
            M.markAsDirty(m, T, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const D = d.slice(0, -1);
        M.removeShadowArrayElement(m, d), M.markAsDirty(m, D, { bubble: !0 });
        break;
      }
      case "update": {
        M.updateShadowAtPath(m, d, x.newValue), M.markAsDirty(m, d, { bubble: !0 });
        break;
      }
    }
    if (y.sync !== !1 && n.current && n.current.connected && n.current.updateState({ operation: x }), E?.signals && E.signals.length > 0) {
      const D = y.updateType === "cut" ? null : U;
      E.signals.forEach(({ parentId: I, position: T, effect: C }) => {
        const V = document.querySelector(`[data-parent-id="${I}"]`);
        if (V) {
          const P = Array.from(V.childNodes);
          if (P[T]) {
            let O = D;
            if (C && D !== null)
              try {
                O = new Function(
                  "state",
                  `return (${C})(state)`
                )(D);
              } catch (N) {
                console.error("Error evaluating effect function:", N);
              }
            O != null && typeof O == "object" && (O = JSON.stringify(O)), P[T].textContent = String(O ?? "");
          }
        }
      });
    }
    if (y.updateType === "insert" && E?.mapWrappers && E.mapWrappers.length > 0) {
      const D = M.getShadowMetadata(m, d)?.arrayKeys || [], I = D[D.length - 1], T = M.getShadowValue(I), C = M.getShadowValue(
        [m, ...d].join(".")
      );
      if (!I || T === void 0) return;
      E.mapWrappers.forEach((V) => {
        let P = !0, O = -1;
        if (V.meta?.transforms && V.meta.transforms.length > 0) {
          for (const N of V.meta.transforms)
            if (N.type === "filter" && !N.fn(T, -1)) {
              P = !1;
              break;
            }
          if (P) {
            const N = ht(
              m,
              d,
              V.meta.transforms
            ), q = V.meta.transforms.find(
              (F) => F.type === "sort"
            );
            if (q) {
              const F = N.map((Z) => ({
                key: Z,
                value: M.getShadowValue(Z)
              }));
              F.push({ key: I, value: T }), F.sort((Z, rt) => q.fn(Z.value, rt.value)), O = F.findIndex(
                (Z) => Z.key === I
              );
            } else
              O = N.length;
          }
        } else
          P = !0, O = D.length - 1;
        if (P && V.containerRef && V.containerRef.isConnected) {
          const N = document.createElement("div");
          N.setAttribute("data-item-path", I);
          const q = Array.from(V.containerRef.children);
          O >= 0 && O < q.length ? V.containerRef.insertBefore(
            N,
            q[O]
          ) : V.containerRef.appendChild(N);
          const F = Mt(N), Z = et(), rt = I.split(".").slice(1), Ct = V.rebuildStateShape({
            path: V.path,
            currentState: C,
            componentId: V.componentId,
            meta: V.meta
          });
          F.render(
            it(yt, {
              stateKey: m,
              itemComponentId: Z,
              itemPath: rt,
              localIndex: O,
              arraySetter: Ct,
              rebuildStateShape: V.rebuildStateShape,
              renderFn: V.mapFn
            })
          );
        }
      });
    }
    if (y.updateType === "cut") {
      const D = d.slice(0, -1), I = M.getShadowMetadata(m, D);
      I?.mapWrappers && I.mapWrappers.length > 0 && I.mapWrappers.forEach((T) => {
        if (T.containerRef && T.containerRef.isConnected) {
          const C = T.containerRef.querySelector(
            `[data-item-path="${_}"]`
          );
          C && C.remove();
        }
      });
    }
    const G = M.getShadowMetadata(m, []), B = /* @__PURE__ */ new Set();
    if (G?.components) {
      if (y.updateType === "update") {
        let D = [...d];
        for (; ; ) {
          const I = M.getShadowMetadata(m, D);
          if (I?.pathComponents && I.pathComponents.forEach((T) => {
            if (B.has(T))
              return;
            const C = G.components?.get(T);
            C && ((Array.isArray(C.reactiveType) ? C.reactiveType : [C.reactiveType || "component"]).includes("none") || (C.forceUpdate(), B.add(T)));
          }), D.length === 0)
            break;
          D.pop();
        }
        U && typeof U == "object" && !pt(U) && A && typeof A == "object" && !pt(A) && Tt(U, A).forEach((T) => {
          const C = T.split("."), V = [...d, ...C], P = M.getShadowMetadata(m, V);
          P?.pathComponents && P.pathComponents.forEach((O) => {
            if (B.has(O))
              return;
            const N = G.components?.get(O);
            N && ((Array.isArray(N.reactiveType) ? N.reactiveType : [N.reactiveType || "component"]).includes("none") || (N.forceUpdate(), B.add(O)));
          });
        });
      } else if (y.updateType === "insert" || y.updateType === "cut") {
        const D = y.updateType === "insert" ? d : d.slice(0, -1), I = M.getShadowMetadata(m, D);
        if (I?.signals && I.signals.length > 0) {
          const T = [m, ...D].join("."), C = M.getShadowValue(T);
          I.signals.forEach(({ parentId: V, position: P, effect: O }) => {
            const N = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if (N) {
              const q = Array.from(N.childNodes);
              if (q[P]) {
                let F = C;
                if (O)
                  try {
                    F = new Function(
                      "state",
                      `return (${O})(state)`
                    )(C);
                  } catch (Z) {
                    console.error("Error evaluating effect function:", Z), F = C;
                  }
                F != null && typeof F == "object" && (F = JSON.stringify(F)), q[P].textContent = String(F ?? "");
              }
            }
          });
        }
        I?.pathComponents && I.pathComponents.forEach((T) => {
          if (!B.has(T)) {
            const C = G.components?.get(T);
            C && (C.forceUpdate(), B.add(T));
          }
        });
      }
      G.components.forEach((D, I) => {
        if (B.has(I))
          return;
        const T = Array.isArray(D.reactiveType) ? D.reactiveType : [D.reactiveType || "component"];
        if (T.includes("all")) {
          D.forceUpdate(), B.add(I);
          return;
        }
        if (T.includes("deps") && D.depsFunction) {
          const C = M.getShadowValue(m), V = D.depsFunction(C);
          let P = !1;
          V === !0 ? P = !0 : Array.isArray(V) && (ot(D.prevDeps, V) || (D.prevDeps = V, P = !0)), P && (D.forceUpdate(), B.add(I));
        }
      }), B.clear(), Nt(m, x), jt(
        U,
        m,
        j.current,
        H
      ), j.current?.middleware && j.current.middleware({
        update: x
      });
    }
  };
  a.getState().initialStateGlobal[m] || Vt(m, t);
  const i = dt(() => At(
    m,
    o,
    u.current,
    H
  ), [m, H]), c = R, p = j.current?.syncOptions;
  return c && (n.current = c(
    i,
    p ?? {}
  )), i;
}
function Wt(t) {
  return !t || t.length === 0 ? "" : t.map(
    (r) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${r.type}${JSON.stringify(r.dependencies || [])}`
    )
  ).join("");
}
const ht = (t, r, h) => {
  let g = a.getState().getShadowMetadata(t, r)?.arrayKeys || [];
  if (!h || h.length === 0)
    return g;
  let w = g.map((f) => ({
    key: f,
    value: a.getState().getShadowValue(f)
  }));
  for (const f of h)
    f.type === "filter" ? w = w.filter(
      ({ value: b }, S) => f.fn(b, S)
    ) : f.type === "sort" && w.sort((b, S) => f.fn(b.value, S.value));
  return w.map(({ key: f }) => f);
}, wt = (t, r, h) => {
  const g = `${t}////${r}`, { addPathComponent: w, getShadowMetadata: f } = a.getState(), S = f(t, [])?.components?.get(g);
  !S || S.reactiveType === "none" || !(Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType]).includes("component") || w(t, h, g);
}, lt = (t, r, h) => {
  const g = a.getState(), w = g.getShadowMetadata(t, []), f = /* @__PURE__ */ new Set();
  w?.components && w.components.forEach((S, e) => {
    (Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"]).includes("all") && (S.forceUpdate(), f.add(e));
  }), g.getShadowMetadata(t, [...r, "getSelected"])?.pathComponents?.forEach((S) => {
    w?.components?.get(S)?.forceUpdate();
  });
  const b = g.getShadowMetadata(t, r);
  for (let S of b?.arrayKeys || []) {
    const e = S + ".selected", s = g.getShadowMetadata(
      t,
      e.split(".").slice(1)
    );
    S == h && s?.pathComponents?.forEach((v) => {
      w?.components?.get(v)?.forceUpdate();
    });
  }
};
function At(t, r, h, g) {
  const w = /* @__PURE__ */ new Map();
  function f({
    path: e = [],
    meta: s,
    componentId: v
  }) {
    const R = s ? JSON.stringify(s.validIds || s.transforms) : "", L = e.join(".") + ":" + R, k = [t, ...e].join(".");
    if (w.has(L))
      return w.get(L);
    const W = function() {
      return a().getShadowValue(t, e);
    }, H = {
      apply(m, u, j) {
      },
      get(m, u) {
        if (u === "_rebuildStateShape")
          return f;
        if (Object.getOwnPropertyNames(b).includes(u) && e.length === 0)
          return b[u];
        if (u === "getDifferences")
          return () => {
            const n = a.getState().getShadowMetadata(t, []), o = a.getState().getShadowValue(t);
            let i;
            return n?.stateSource === "server" && n.baseServerState ? i = n.baseServerState : i = a.getState().initialStateGlobal[t], Tt(o, i);
          };
        if (u === "sync" && e.length === 0)
          return async function() {
            const n = a.getState().getInitialOptions(t), o = n?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const i = a.getState().getShadowValue(t, []), c = n?.validation?.key;
            try {
              const p = await o.action(i);
              if (p && !p.success && p.errors, p?.success) {
                const l = a.getState().getShadowMetadata(t, []);
                a.getState().setShadowMetadata(t, [], {
                  ...l,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: i
                  // Update base server state
                }), o.onSuccess && o.onSuccess(p.data);
              } else !p?.success && o.onError && o.onError(p.error);
              return p;
            } catch (p) {
              return o.onError && o.onError(p), { success: !1, error: p };
            }
          };
        if (u === "_status" || u === "getStatus") {
          const n = () => {
            const o = a.getState().getShadowMetadata(t, e), i = a.getState().getShadowValue(k);
            return o?.isDirty === !0 ? "dirty" : o?.isDirty === !1 || o?.stateSource === "server" ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" ? "fresh" : a.getState().getShadowMetadata(t, [])?.stateSource === "server" && !o?.isDirty ? "synced" : i !== void 0 && !o ? "fresh" : "unknown";
          };
          return u === "_status" ? n() : n;
        }
        if (u === "removeStorage")
          return () => {
            const n = a.getState().initialStateGlobal[t], o = at(t), i = tt(o?.localStorage?.key) ? o.localStorage.key(n) : o?.localStorage?.key, c = `${g}-${t}-${i}`;
            c && localStorage.removeItem(c);
          };
        if (u === "showValidationErrors")
          return () => {
            const n = a.getState().getShadowMetadata(t, e);
            return n?.validation?.status === "VALIDATION_FAILED" && n.validation.message ? [n.validation.message] : [];
          };
        if (u === "getSelected")
          return () => {
            const n = t + "." + e.join(".");
            wt(t, v, [
              ...e,
              "getSelected"
            ]);
            const o = a.getState().selectedIndicesMap;
            if (!o || !o.has(n))
              return;
            const i = o.get(n);
            if (!(s?.validIds && !s.validIds.includes(i) || !a.getState().getShadowValue(i)))
              return f({
                path: i.split(".").slice(1),
                componentId: v
              });
          };
        if (u === "getSelectedIndex")
          return () => a.getState().getSelectedIndex(
            t + "." + e.join("."),
            s?.validIds
          );
        if (u === "clearSelected")
          return lt(t, e), () => {
            a.getState().clearSelectedIndex({
              arrayKey: t + "." + e.join(".")
            });
          };
        if (u === "useVirtualView")
          return (n) => {
            const {
              itemHeight: o = 50,
              overscan: i = 6,
              stickToBottom: c = !1,
              scrollStickTolerance: p = 75
            } = n, l = z(null), [d, y] = X({
              startIndex: 0,
              endIndex: 10
            }), [_, M] = X({}), E = z(!0), A = z({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), U = z(
              /* @__PURE__ */ new Map()
            );
            ct(() => {
              if (!c || !l.current || A.current.isUserScrolling)
                return;
              const I = l.current;
              I.scrollTo({
                top: I.scrollHeight,
                behavior: E.current ? "instant" : "smooth"
              });
            }, [_, c]);
            const $ = a.getState().getShadowMetadata(t, e)?.arrayKeys || [], { totalHeight: x, itemOffsets: K } = dt(() => {
              let I = 0;
              const T = /* @__PURE__ */ new Map();
              return (a.getState().getShadowMetadata(t, e)?.arrayKeys || []).forEach((V) => {
                const P = V.split(".").slice(1), O = a.getState().getShadowMetadata(t, P)?.virtualizer?.itemHeight || o;
                T.set(V, {
                  height: O,
                  offset: I
                }), I += O;
              }), U.current = T, { totalHeight: I, itemOffsets: T };
            }, [$.length, o]);
            ct(() => {
              if (c && $.length > 0 && l.current && !A.current.isUserScrolling && E.current) {
                const I = l.current, T = () => {
                  if (I.clientHeight > 0) {
                    const C = Math.ceil(
                      I.clientHeight / o
                    ), V = $.length - 1, P = Math.max(
                      0,
                      V - C - i
                    );
                    y({ startIndex: P, endIndex: V }), requestAnimationFrame(() => {
                      B("instant"), E.current = !1;
                    });
                  } else
                    requestAnimationFrame(T);
                };
                T();
              }
            }, [$.length, c, o, i]);
            const G = st(() => {
              const I = l.current;
              if (!I) return;
              const T = I.scrollTop, { scrollHeight: C, clientHeight: V } = I, P = A.current, O = C - (T + V), N = P.isNearBottom;
              P.isNearBottom = O <= p, T < P.lastScrollTop ? (P.scrollUpCount++, P.scrollUpCount > 3 && N && (P.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : P.isNearBottom && (P.isUserScrolling = !1, P.scrollUpCount = 0), P.lastScrollTop = T;
              let q = 0;
              for (let F = 0; F < $.length; F++) {
                const Z = $[F], rt = U.current.get(Z);
                if (rt && rt.offset + rt.height > T) {
                  q = F;
                  break;
                }
              }
              if (q !== d.startIndex) {
                const F = Math.ceil(V / o);
                y({
                  startIndex: Math.max(0, q - i),
                  endIndex: Math.min(
                    $.length - 1,
                    q + F + i
                  )
                });
              }
            }, [
              $.length,
              d.startIndex,
              o,
              i,
              p
            ]);
            Q(() => {
              const I = l.current;
              if (!(!I || !c))
                return I.addEventListener("scroll", G, {
                  passive: !0
                }), () => {
                  I.removeEventListener("scroll", G);
                };
            }, [G, c]);
            const B = st(
              (I = "smooth") => {
                const T = l.current;
                if (!T) return;
                A.current.isUserScrolling = !1, A.current.isNearBottom = !0, A.current.scrollUpCount = 0;
                const C = () => {
                  const V = (P = 0) => {
                    if (P > 5) return;
                    const O = T.scrollHeight, N = T.scrollTop, q = T.clientHeight;
                    N + q >= O - 1 || (T.scrollTo({
                      top: O,
                      behavior: I
                    }), setTimeout(() => {
                      const F = T.scrollHeight, Z = T.scrollTop;
                      (F !== O || Z + q < F - 1) && V(P + 1);
                    }, 50));
                  };
                  V();
                };
                "requestIdleCallback" in window ? requestIdleCallback(C, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(C);
                });
              },
              []
            );
            return Q(() => {
              if (!c || !l.current) return;
              const I = l.current, T = A.current;
              let C;
              const V = () => {
                clearTimeout(C), C = setTimeout(() => {
                  !T.isUserScrolling && T.isNearBottom && B(
                    E.current ? "instant" : "smooth"
                  );
                }, 100);
              }, P = new MutationObserver(() => {
                T.isUserScrolling || V();
              });
              P.observe(I, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
                // More specific than just 'height'
              });
              const O = (N) => {
                N.target instanceof HTMLImageElement && !T.isUserScrolling && V();
              };
              return I.addEventListener("load", O, !0), E.current ? setTimeout(() => {
                B("instant");
              }, 0) : V(), () => {
                clearTimeout(C), P.disconnect(), I.removeEventListener("load", O, !0);
              };
            }, [c, $.length, B]), {
              virtualState: dt(() => {
                const I = a.getState(), T = I.getShadowValue(
                  [t, ...e].join(".")
                ), C = I.getShadowMetadata(t, e)?.arrayKeys || [];
                T.slice(
                  d.startIndex,
                  d.endIndex + 1
                );
                const V = C.slice(
                  d.startIndex,
                  d.endIndex + 1
                );
                return f({
                  path: e,
                  componentId: v,
                  meta: { ...s, validIds: V }
                });
              }, [d.startIndex, d.endIndex, $.length]),
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
                    height: `${x}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${U.current.get($[d.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: B,
              scrollToIndex: (I, T = "smooth") => {
                if (l.current && $[I]) {
                  const C = U.current.get($[I])?.offset || 0;
                  l.current.scrollTo({ top: C, behavior: T });
                }
              }
            };
          };
        if (u === "stateMap")
          return (n) => {
            const [o, i] = X(
              s?.validIds ?? a.getState().getShadowMetadata(t, e)?.arrayKeys
            ), c = a.getState().getShadowValue(k, s?.validIds);
            if (!o)
              throw new Error("No array keys found for mapping");
            const p = f({
              path: e,
              componentId: v,
              meta: s
            });
            return c.map((l, d) => {
              const y = o[d]?.split(".").slice(1), _ = f({
                path: y,
                componentId: v,
                meta: s
              });
              return n(
                _,
                d,
                p
              );
            });
          };
        if (u === "$stateMap")
          return (n) => it(Ht, {
            proxy: {
              _stateKey: t,
              _path: e,
              _mapFn: n,
              _meta: s
            },
            rebuildStateShape: f
          });
        if (u === "stateFind")
          return (n) => {
            const o = s?.validIds ?? a.getState().getShadowMetadata(t, e)?.arrayKeys;
            if (o)
              for (let i = 0; i < o.length; i++) {
                const c = o[i];
                if (!c) continue;
                const p = a.getState().getShadowValue(c);
                if (n(p, i)) {
                  const l = c.split(".").slice(1);
                  return f({
                    path: l,
                    componentId: v,
                    meta: s
                    // Pass along meta for potential further chaining
                  });
                }
              }
          };
        if (u === "stateFilter")
          return (n) => {
            const o = a.getState().getShadowValue([t, ...e].join("."), s?.validIds);
            if (!Array.isArray(o)) return [];
            const i = s?.validIds ?? a.getState().getShadowMetadata(t, e)?.arrayKeys;
            if (!i)
              throw new Error("No array keys found for filtering.");
            const c = [];
            return o.filter(
              (p, l) => n(p, l) ? (c.push(i[l]), !0) : !1
            ), f({
              path: e,
              componentId: v,
              meta: {
                validIds: c,
                transforms: [
                  ...s?.transforms || [],
                  {
                    type: "filter",
                    fn: n
                  }
                ]
              }
            });
          };
        if (u === "stateSort")
          return (n) => {
            const o = a.getState().getShadowValue([t, ...e].join("."), s?.validIds);
            if (!Array.isArray(o)) return [];
            const i = s?.validIds ?? a.getState().getShadowMetadata(t, e)?.arrayKeys;
            if (!i)
              throw new Error("No array keys found for sorting");
            const c = o.map((p, l) => ({
              item: p,
              key: i[l]
            }));
            return c.sort((p, l) => n(p.item, l.item)).filter(Boolean), f({
              path: e,
              componentId: v,
              meta: {
                validIds: c.map((p) => p.key),
                transforms: [
                  ...s?.transforms || [],
                  { type: "sort", fn: n }
                ]
              }
            });
          };
        if (u === "stream")
          return function(n = {}) {
            const {
              bufferSize: o = 100,
              flushInterval: i = 100,
              bufferStrategy: c = "accumulate",
              store: p,
              onFlush: l
            } = n;
            let d = [], y = !1, _ = null;
            const M = (x) => {
              if (!y) {
                if (c === "sliding" && d.length >= o)
                  d.shift();
                else if (c === "dropping" && d.length >= o)
                  return;
                d.push(x), d.length >= o && E();
              }
            }, E = () => {
              if (d.length === 0) return;
              const x = [...d];
              if (d = [], p) {
                const K = p(x);
                K !== void 0 && (Array.isArray(K) ? K : [K]).forEach((B) => {
                  r(B, e, {
                    updateType: "insert"
                  });
                });
              } else
                x.forEach((K) => {
                  r(K, e, {
                    updateType: "insert"
                  });
                });
              l?.(x);
            };
            i > 0 && (_ = setInterval(E, i));
            const A = et(), U = a.getState().getShadowMetadata(t, e) || {}, $ = U.streams || /* @__PURE__ */ new Map();
            return $.set(A, { buffer: d, flushTimer: _ }), a.getState().setShadowMetadata(t, e, {
              ...U,
              streams: $
            }), {
              write: (x) => M(x),
              writeMany: (x) => x.forEach(M),
              flush: () => E(),
              pause: () => {
                y = !0;
              },
              resume: () => {
                y = !1, d.length > 0 && E();
              },
              close: () => {
                E(), _ && clearInterval(_);
                const x = a.getState().getShadowMetadata(t, e);
                x?.streams && x.streams.delete(A);
              }
            };
          };
        if (u === "stateList")
          return (n) => /* @__PURE__ */ nt(() => {
            const i = z(/* @__PURE__ */ new Map()), c = s?.transforms && s.transforms.length > 0 ? `${v}-${Wt(s.transforms)}` : `${v}-base`, [p, l] = X({}), { validIds: d, arrayValues: y } = dt(() => {
              const M = a.getState().getShadowMetadata(t, e)?.transformCaches?.get(c);
              let E;
              M && M.validIds ? E = M.validIds : (E = ht(
                t,
                e,
                s?.transforms
              ), a.getState().setTransformCache(t, e, c, {
                validIds: E,
                computedAt: Date.now(),
                transforms: s?.transforms || []
              }));
              const A = a.getState().getShadowValue(k, E);
              return {
                validIds: E,
                arrayValues: A || []
              };
            }, [c, p]);
            if (Q(() => {
              const M = a.getState().subscribeToPath(k, (E) => {
                if (E.type === "GET_SELECTED")
                  return;
                const U = a.getState().getShadowMetadata(t, e)?.transformCaches;
                if (U)
                  for (const $ of U.keys())
                    $.startsWith(v) && U.delete($);
                (E.type === "INSERT" || E.type === "REMOVE" || E.type === "CLEAR_SELECTION") && l({});
              });
              return () => {
                M();
              };
            }, [v, k]), !Array.isArray(y))
              return null;
            const _ = f({
              path: e,
              componentId: v,
              meta: {
                ...s,
                validIds: d
              }
            });
            return /* @__PURE__ */ nt(Pt, { children: y.map((M, E) => {
              const A = d[E];
              if (!A)
                return null;
              let U = i.current.get(A);
              U || (U = et(), i.current.set(A, U));
              const $ = A.split(".").slice(1);
              return it(yt, {
                key: A,
                stateKey: t,
                itemComponentId: U,
                itemPath: $,
                localIndex: E,
                arraySetter: _,
                rebuildStateShape: f,
                renderFn: n
              });
            }) });
          }, {});
        if (u === "stateFlattenOn")
          return (n) => {
            const o = a.getState().getShadowValue([t, ...e].join("."), s?.validIds);
            return Array.isArray(o) ? (o.flatMap(
              (c) => c[n] ?? []
            ), f({
              path: [...e, "[*]", n],
              componentId: v,
              meta: s
            })) : [];
          };
        if (u === "index")
          return (n) => {
            const i = a.getState().getShadowMetadata(t, e)?.arrayKeys?.filter(
              (p) => !s?.validIds || s?.validIds && s?.validIds?.includes(p)
            )?.[n];
            return i ? (a.getState().getShadowValue(i, s?.validIds), f({
              path: i.split(".").slice(1),
              componentId: v,
              meta: s
            })) : void 0;
          };
        if (u === "last")
          return () => {
            const n = a.getState().getShadowValue(t, e);
            if (n.length === 0) return;
            const o = n.length - 1;
            n[o];
            const i = [...e, o.toString()];
            return f({
              path: i,
              componentId: v,
              meta: s
            });
          };
        if (u === "insert")
          return (n, o) => (r(n, e, { updateType: "insert" }), f({
            path: e,
            componentId: v,
            meta: s
          }));
        if (u === "uniqueInsert")
          return (n, o, i) => {
            const c = a.getState().getShadowValue(t, e), p = tt(n) ? n(c) : n;
            let l = null;
            if (!c.some((y) => {
              const _ = o ? o.every(
                (M) => ot(y[M], p[M])
              ) : ot(y, p);
              return _ && (l = y), _;
            }))
              r(p, e, { updateType: "insert" });
            else if (i && l) {
              const y = i(l), _ = c.map(
                (M) => ot(M, l) ? y : M
              );
              r(_, e, {
                updateType: "update"
              });
            }
          };
        if (u === "cut")
          return (n, o) => {
            const i = a.getState().getShadowValue([t, ...e].join("."), s?.validIds), c = s?.validIds ?? a.getState().getShadowMetadata(t, e)?.arrayKeys;
            if (!c || c.length === 0) return;
            const p = n == -1 ? c.length - 1 : n !== void 0 ? n : c.length - 1, l = c[p];
            if (!l) return;
            const d = l.split(".").slice(1);
            r(i, d, {
              updateType: "cut"
            });
          };
        if (u === "cutSelected")
          return () => {
            const n = ht(t, e, s?.transforms), o = a.getState().getShadowValue([t, ...e].join("."), s?.validIds);
            if (!n || n.length === 0) return;
            const i = a.getState().selectedIndicesMap.get(k);
            let c = n.findIndex(
              (d) => d === i
            );
            const p = n[c == -1 ? n.length - 1 : c]?.split(".").slice(1);
            a.getState().clearSelectedIndex({ arrayKey: k });
            const l = p?.slice(0, -1);
            lt(t, l), r(o, p, {
              updateType: "cut"
            });
          };
        if (u === "cutByValue")
          return (n) => {
            const o = a.getState().getShadowMetadata(t, e), i = s?.validIds ?? o?.arrayKeys;
            if (!i) return;
            let c = null;
            for (const p of i)
              if (a.getState().getShadowValue(p) === n) {
                c = p;
                break;
              }
            if (c) {
              const p = c.split(".").slice(1);
              r(null, p, { updateType: "cut" });
            }
          };
        if (u === "toggleByValue")
          return (n) => {
            const o = a.getState().getShadowMetadata(t, e), i = s?.validIds ?? o?.arrayKeys;
            if (!i) return;
            let c = null;
            for (const p of i) {
              const l = a.getState().getShadowValue(p);
              if (console.log("itemValue sdasdasdasd", l), l === n) {
                c = p;
                break;
              }
            }
            if (console.log("itemValue keyToCut", c), c) {
              const p = c.split(".").slice(1);
              console.log("itemValue keyToCut", c), r(n, p, {
                updateType: "cut"
              });
            } else
              r(n, e, { updateType: "insert" });
          };
        if (u === "findWith")
          return (n, o) => {
            const i = a.getState().getShadowMetadata(t, e)?.arrayKeys;
            if (!i)
              throw new Error("No array keys found for sorting");
            let c = [];
            for (const p of i) {
              let l = a.getState().getShadowValue(p, s?.validIds);
              if (l && l[n] === o) {
                c = p.split(".").slice(1);
                break;
              }
            }
            return f({
              path: c,
              componentId: v,
              meta: s
            });
          };
        if (u === "cutThis") {
          let n = a.getState().getShadowValue(e.join("."));
          return () => {
            r(n, e, { updateType: "cut" });
          };
        }
        if (u === "get")
          return () => (wt(t, v, e), a.getState().getShadowValue(k, s?.validIds));
        if (u === "getState")
          return () => a.getState().getShadowValue(k, s?.validIds);
        if (u === "$derive")
          return (n) => It({
            _stateKey: t,
            _path: e,
            _effect: n.toString(),
            _meta: s
          });
        if (u === "$get")
          return () => It({ _stateKey: t, _path: e, _meta: s });
        if (u === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (u == "getLocalStorage")
          return (n) => ut(g + "-" + t + "-" + n);
        if (u === "isSelected") {
          const n = [t, ...e].slice(0, -1);
          if (lt(t, e, void 0), Array.isArray(
            a.getState().getShadowValue(n.join("."), s?.validIds)
          )) {
            e[e.length - 1];
            const o = n.join("."), i = a.getState().selectedIndicesMap.get(o), c = t + "." + e.join(".");
            return i === c;
          }
          return;
        }
        if (u === "setSelected")
          return (n) => {
            const o = e.slice(0, -1), i = t + "." + o.join("."), c = t + "." + e.join(".");
            lt(t, o, void 0), a.getState().selectedIndicesMap.get(i), n && a.getState().setSelectedIndex(i, c);
          };
        if (u === "toggleSelected")
          return () => {
            const n = e.slice(0, -1), o = t + "." + n.join("."), i = t + "." + e.join(".");
            a.getState().selectedIndicesMap.get(o) === i ? a.getState().clearSelectedIndex({ arrayKey: o }) : a.getState().setSelectedIndex(o, i);
          };
        if (u === "_componentId")
          return v;
        if (e.length == 0) {
          if (u === "addZodValidation")
            return (n) => {
              a.getState().getInitialOptions(t)?.validation, n.forEach((o) => {
                const i = a.getState().getShadowMetadata(t, o.path) || {};
                a.getState().setShadowMetadata(t, o.path, {
                  ...i,
                  validation: {
                    status: "VALIDATION_FAILED",
                    message: o.message,
                    validatedValue: void 0
                  }
                }), a.getState().notifyPathSubscribers(o.path, {
                  type: "VALIDATION_FAILED",
                  message: o.message,
                  validatedValue: void 0
                });
              });
            };
          if (u === "clearZodValidation")
            return (n) => {
              if (!n)
                throw new Error("clearZodValidation requires a path");
              const o = a.getState().getShadowMetadata(t, n) || {};
              o.validation && (a.getState().setShadowMetadata(t, n, {
                ...o,
                validation: void 0
              }), a.getState().notifyPathSubscribers([t, ...n].join("."), {
                type: "VALIDATION_CLEARED"
              }));
            };
          if (u === "applyJsonPatch")
            return (n) => {
              const o = a.getState(), i = o.getShadowMetadata(t, []);
              if (!i?.components) return;
              const c = (l) => !l || l === "/" ? [] : l.split("/").slice(1).map((d) => d.replace(/~1/g, "/").replace(/~0/g, "~")), p = /* @__PURE__ */ new Set();
              for (const l of n) {
                const d = c(l.path);
                switch (l.op) {
                  case "add":
                  case "replace": {
                    const { value: y } = l;
                    o.updateShadowAtPath(t, d, y), o.markAsDirty(t, d, { bubble: !0 });
                    let _ = [...d];
                    for (; ; ) {
                      const M = o.getShadowMetadata(
                        t,
                        _
                      );
                      if (M?.pathComponents && M.pathComponents.forEach((E) => {
                        if (!p.has(E)) {
                          const A = i.components?.get(E);
                          A && (A.forceUpdate(), p.add(E));
                        }
                      }), _.length === 0) break;
                      _.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const y = d.slice(0, -1);
                    o.removeShadowArrayElement(t, d), o.markAsDirty(t, y, { bubble: !0 });
                    let _ = [...y];
                    for (; ; ) {
                      const M = o.getShadowMetadata(
                        t,
                        _
                      );
                      if (M?.pathComponents && M.pathComponents.forEach((E) => {
                        if (!p.has(E)) {
                          const A = i.components?.get(E);
                          A && (A.forceUpdate(), p.add(E));
                        }
                      }), _.length === 0) break;
                      _.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (u === "getComponents")
            return () => a.getState().getShadowMetadata(t, [])?.components;
          if (u === "getAllFormRefs")
            return () => St.getState().getFormRefsByStateKey(t);
        }
        if (u === "getFormRef")
          return () => St.getState().getFormRef(t + "." + e.join("."));
        if (u === "validationWrapper")
          return ({
            children: n,
            hideMessage: o
          }) => /* @__PURE__ */ nt(
            bt,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: e,
              stateKey: t,
              children: n
            }
          );
        if (u === "_stateKey") return t;
        if (u === "_path") return e;
        if (u === "update")
          return (n) => (r(n, e, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const o = a.getState().getShadowMetadata(t, e);
              a.getState().setShadowMetadata(t, e, {
                ...o,
                isDirty: !1,
                // EXPLICITLY set to false, not just undefined
                stateSource: "server",
                // Mark as coming from server
                lastServerSync: Date.now()
                // Add timestamp
              });
              const i = [t, ...e].join(".");
              a.getState().notifyPathSubscribers(i, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (u === "toggle") {
          const n = a.getState().getShadowValue([t, ...e].join(".")), o = a.getState().getShadowValue([t, ...e].join("."), s?.validIds);
          if (console.log("currentValueAtPath", n), typeof o != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            r(!n, e, {
              updateType: "update"
            });
          };
        }
        if (u === "formElement")
          return (n, o) => /* @__PURE__ */ nt(
            qt,
            {
              stateKey: t,
              path: e,
              rebuildStateShape: f,
              setState: r,
              formOpts: o,
              renderFn: n
            }
          );
        const Y = [...e, u];
        return a.getState().getShadowValue(t, Y), f({
          path: Y,
          componentId: v,
          meta: s
        });
      }
    }, J = new Proxy(W, H);
    return w.set(L, J), J;
  }
  const b = {
    revertToInitialState: (e) => {
      a.getState().getInitialOptions(t)?.validation;
      const s = a.getState().getShadowMetadata(t, []);
      s?.stateSource === "server" && s.baseServerState ? s.baseServerState : a.getState().initialStateGlobal[t];
      const v = a.getState().initialStateGlobal[t];
      a.getState().clearSelectedIndexesForState(t), a.getState().initializeShadowState(t, v), f({
        path: [],
        componentId: h
      });
      const R = at(t), L = tt(R?.localStorage?.key) ? R?.localStorage?.key(v) : R?.localStorage?.key, k = `${g}-${t}-${L}`;
      k && localStorage.removeItem(k);
      const W = a.getState().getShadowMetadata(t, []);
      return W && W?.components?.forEach((H) => {
        H.forceUpdate();
      }), v;
    },
    updateInitialState: (e) => {
      const s = At(
        t,
        r,
        h,
        g
      ), v = a.getState().initialStateGlobal[t], R = at(t), L = tt(R?.localStorage?.key) ? R?.localStorage?.key(v) : R?.localStorage?.key, k = `${g}-${t}-${L}`;
      return localStorage.getItem(k) && localStorage.removeItem(k), kt(() => {
        Vt(t, e), a.getState().initializeShadowState(t, e);
        const W = a.getState().getShadowMetadata(t, []);
        W && W?.components?.forEach((H) => {
          H.forceUpdate();
        });
      }), {
        fetchId: (W) => s.get()[W]
      };
    }
  };
  return f({
    componentId: h,
    path: []
  });
}
function It(t) {
  return it(xt, { proxy: t });
}
function Ht({
  proxy: t,
  rebuildStateShape: r
}) {
  const h = z(null), g = z(`map-${crypto.randomUUID()}`), w = z(!1), f = z(/* @__PURE__ */ new Map());
  Q(() => {
    const S = h.current;
    if (!S || w.current) return;
    const e = setTimeout(() => {
      const s = a.getState().getShadowMetadata(t._stateKey, t._path) || {}, v = s.mapWrappers || [];
      v.push({
        instanceId: g.current,
        mapFn: t._mapFn,
        containerRef: S,
        rebuildStateShape: r,
        path: t._path,
        componentId: g.current,
        meta: t._meta
      }), a.getState().setShadowMetadata(t._stateKey, t._path, {
        ...s,
        mapWrappers: v
      }), w.current = !0, b();
    }, 0);
    return () => {
      if (clearTimeout(e), g.current) {
        const s = a.getState().getShadowMetadata(t._stateKey, t._path) || {};
        s.mapWrappers && (s.mapWrappers = s.mapWrappers.filter(
          (v) => v.instanceId !== g.current
        ), a.getState().setShadowMetadata(t._stateKey, t._path, s));
      }
      f.current.forEach((s) => s.unmount());
    };
  }, []);
  const b = () => {
    const S = h.current;
    if (!S) return;
    const e = a.getState().getShadowValue(
      [t._stateKey, ...t._path].join("."),
      t._meta?.validIds
    );
    if (!Array.isArray(e)) return;
    const s = t._meta?.validIds ?? a.getState().getShadowMetadata(t._stateKey, t._path)?.arrayKeys ?? [], v = r({
      currentState: e,
      path: t._path,
      componentId: g.current,
      meta: t._meta
    });
    e.forEach((R, L) => {
      const k = s[L];
      if (!k) return;
      const W = et(), H = document.createElement("div");
      H.setAttribute("data-item-path", k), S.appendChild(H);
      const J = Mt(H);
      f.current.set(k, J);
      const m = k.split(".").slice(1);
      J.render(
        it(yt, {
          stateKey: t._stateKey,
          itemComponentId: W,
          itemPath: m,
          localIndex: L,
          arraySetter: v,
          rebuildStateShape: r,
          renderFn: t._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ nt("div", { ref: h, "data-map-container": g.current });
}
function xt({
  proxy: t
}) {
  const r = z(null), h = z(null), g = z(!1), w = `${t._stateKey}-${t._path.join(".")}`, f = a.getState().getShadowValue(
    [t._stateKey, ...t._path].join("."),
    t._meta?.validIds
  );
  return Q(() => {
    const b = r.current;
    if (!b || g.current) return;
    const S = setTimeout(() => {
      if (!b.parentElement) {
        console.warn("Parent element not found for signal", w);
        return;
      }
      const e = b.parentElement, v = Array.from(e.childNodes).indexOf(b);
      let R = e.getAttribute("data-parent-id");
      R || (R = `parent-${crypto.randomUUID()}`, e.setAttribute("data-parent-id", R)), h.current = `instance-${crypto.randomUUID()}`;
      const L = a.getState().getShadowMetadata(t._stateKey, t._path) || {}, k = L.signals || [];
      k.push({
        instanceId: h.current,
        parentId: R,
        position: v,
        effect: t._effect
      }), a.getState().setShadowMetadata(t._stateKey, t._path, {
        ...L,
        signals: k
      });
      let W = f;
      if (t._effect)
        try {
          W = new Function(
            "state",
            `return (${t._effect})(state)`
          )(f);
        } catch (J) {
          console.error("Error evaluating effect function:", J);
        }
      W !== null && typeof W == "object" && (W = JSON.stringify(W));
      const H = document.createTextNode(String(W ?? ""));
      b.replaceWith(H), g.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(S), h.current) {
        const e = a.getState().getShadowMetadata(t._stateKey, t._path) || {};
        e.signals && (e.signals = e.signals.filter(
          (s) => s.instanceId !== h.current
        ), a.getState().setShadowMetadata(t._stateKey, t._path, e));
      }
    };
  }, []), it("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": w
  });
}
const yt = Dt(
  zt,
  (t, r) => t.itemPath.join(".") === r.itemPath.join(".") && t.stateKey === r.stateKey && t.itemComponentId === r.itemComponentId && t.localIndex === r.localIndex
), Bt = (t) => {
  const [r, h] = X(!1);
  return ct(() => {
    if (!t.current) {
      h(!0);
      return;
    }
    const g = Array.from(t.current.querySelectorAll("img"));
    if (g.length === 0) {
      h(!0);
      return;
    }
    let w = 0;
    const f = () => {
      w++, w === g.length && h(!0);
    };
    return g.forEach((b) => {
      b.complete ? f() : (b.addEventListener("load", f), b.addEventListener("error", f));
    }), () => {
      g.forEach((b) => {
        b.removeEventListener("load", f), b.removeEventListener("error", f);
      });
    };
  }, [t.current]), r;
};
function zt({
  stateKey: t,
  itemComponentId: r,
  itemPath: h,
  localIndex: g,
  arraySetter: w,
  rebuildStateShape: f,
  renderFn: b
}) {
  const [, S] = X({}), { ref: e, inView: s } = $t(), v = z(null), R = Bt(v), L = z(!1), k = [t, ...h].join(".");
  _t(t, r, S);
  const W = st(
    (j) => {
      v.current = j, e(j);
    },
    [e]
  );
  Q(() => {
    a.getState().subscribeToPath(k, (j) => {
      S({});
    });
  }, []), Q(() => {
    if (!s || !R || L.current)
      return;
    const j = v.current;
    if (j && j.offsetHeight > 0) {
      L.current = !0;
      const Y = j.offsetHeight;
      a.getState().setShadowMetadata(t, h, {
        virtualizer: {
          itemHeight: Y,
          domRef: j
        }
      });
      const n = h.slice(0, -1), o = [t, ...n].join(".");
      a.getState().notifyPathSubscribers(o, {
        type: "ITEMHEIGHT",
        itemKey: h.join("."),
        ref: v.current
      });
    }
  }, [s, R, t, h]);
  const H = [t, ...h].join("."), J = a.getState().getShadowValue(H);
  if (J === void 0)
    return null;
  const m = f({
    currentState: J,
    path: h,
    componentId: r
  }), u = b(m, g, w);
  return /* @__PURE__ */ nt("div", { ref: W, children: u });
}
function qt({
  stateKey: t,
  path: r,
  rebuildStateShape: h,
  renderFn: g,
  formOpts: w,
  setState: f
}) {
  const [b] = X(() => et()), [, S] = X({}), e = [t, ...r].join(".");
  _t(t, b, S);
  const s = a.getState().getShadowValue(e), [v, R] = X(s), L = z(!1), k = z(null);
  Q(() => {
    !L.current && !ot(s, v) && R(s);
  }, [s]), Q(() => {
    const u = a.getState().subscribeToPath(e, (j) => {
      !L.current && v !== j && S({});
    });
    return () => {
      u(), k.current && (clearTimeout(k.current), L.current = !1);
    };
  }, []);
  const W = st(
    (u) => {
      typeof s === "number" && typeof u == "string" && (u = u === "" ? 0 : Number(u)), R(u), L.current = !0, k.current && clearTimeout(k.current);
      const Y = w?.debounceTime ?? 200;
      k.current = setTimeout(() => {
        L.current = !1, f(u, r, { updateType: "update" });
        const { getInitialOptions: n, setShadowMetadata: o, getShadowMetadata: i } = a.getState(), c = n(t)?.validation, p = c?.zodSchemaV4 || c?.zodSchemaV3;
        if (p) {
          const l = a.getState().getShadowValue(t), d = p.safeParse(l), y = i(t, r) || {};
          if (d.success)
            o(t, r, {
              ...y,
              validation: {
                status: "VALID_LIVE",
                validatedValue: u,
                message: void 0
              }
            });
          else {
            const M = ("issues" in d.error ? d.error.issues : d.error.errors).filter(
              (E) => JSON.stringify(E.path) === JSON.stringify(r)
            );
            M.length > 0 ? o(t, r, {
              ...y,
              validation: {
                status: "INVALID_LIVE",
                message: M[0]?.message,
                validatedValue: u
              }
            }) : o(t, r, {
              ...y,
              validation: {
                status: "VALID_LIVE",
                validatedValue: u,
                message: void 0
              }
            });
          }
        }
      }, Y), S({});
    },
    [f, r, w?.debounceTime, t]
  ), H = st(async () => {
    console.log("handleBlur triggered"), k.current && (clearTimeout(k.current), k.current = null, L.current = !1, f(v, r, { updateType: "update" }));
    const { getInitialOptions: u } = a.getState(), j = u(t)?.validation, Y = j?.zodSchemaV4 || j?.zodSchemaV3;
    if (!Y) return;
    const n = a.getState().getShadowMetadata(t, r);
    a.getState().setShadowMetadata(t, r, {
      ...n,
      validation: {
        status: "DIRTY",
        validatedValue: v
      }
    });
    const o = a.getState().getShadowValue(t), i = Y.safeParse(o);
    if (console.log("result ", i), i.success)
      a.getState().setShadowMetadata(t, r, {
        ...n,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: v
        }
      });
    else {
      const c = "issues" in i.error ? i.error.issues : i.error.errors;
      console.log("All validation errors:", c), console.log("Current blur path:", r);
      const p = c.filter((l) => {
        if (console.log("Processing error:", l), r.some((y) => y.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const y = r[0].startsWith("id:") ? [] : r.slice(0, -1);
          console.log("Parent path:", y);
          const _ = a.getState().getShadowMetadata(t, y);
          if (console.log("Array metadata:", _), _?.arrayKeys) {
            const M = [t, ...r.slice(0, -1)].join("."), E = _.arrayKeys.indexOf(M);
            console.log("Item key:", M, "Index:", E);
            const A = [...y, E, ...r.slice(-1)], U = JSON.stringify(l.path) === JSON.stringify(A);
            return console.log("Zod path comparison:", {
              zodPath: A,
              errorPath: l.path,
              match: U
            }), U;
          }
        }
        const d = JSON.stringify(l.path) === JSON.stringify(r);
        return console.log("Direct path comparison:", {
          errorPath: l.path,
          currentPath: r,
          match: d
        }), d;
      });
      console.log("Filtered path errors:", p), a.getState().setShadowMetadata(t, r, {
        ...n,
        validation: {
          status: "VALIDATION_FAILED",
          message: p[0]?.message,
          validatedValue: v
        }
      });
    }
    S({});
  }, [t, r, v, f]), J = h({
    currentState: s,
    path: r,
    componentId: b
  }), m = new Proxy(J, {
    get(u, j) {
      return j === "inputProps" ? {
        value: v ?? "",
        onChange: (Y) => {
          W(Y.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: H,
        ref: St.getState().getFormRef(t + "." + r.join("."))
      } : u[j];
    }
  });
  return /* @__PURE__ */ nt(bt, { formOpts: w, path: r, stateKey: t, children: g(m) });
}
function _t(t, r, h) {
  const g = `${t}////${r}`;
  ct(() => {
    const { registerComponent: w, unregisterComponent: f } = a.getState();
    return w(t, g, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      f(t, g);
    };
  }, [t, g]);
}
export {
  It as $cogsSignal,
  re as addStateOptions,
  Rt as createCogsState,
  ne as createCogsStateFromSync,
  oe as notifyComponent,
  Lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
