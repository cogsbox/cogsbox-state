"use client";
import { jsx as rt, Fragment as kt } from "react/jsx-runtime";
import { memo as Dt, useState as X, useRef as q, useCallback as ot, useEffect as Z, useLayoutEffect as lt, useMemo as dt, createElement as st, startTransition as Ot } from "react";
import { createRoot as bt } from "react-dom/client";
import { transformStateFunc as Rt, isFunction as K, isArray as wt, getDifferences as Et, isDeepEqual as nt } from "./utility.js";
import { ValidationWrapper as Vt } from "./Functions.jsx";
import Ut from "superjson";
import { v4 as tt } from "uuid";
import { getGlobalStore as a, formRefStore as ht } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import { useInView as $t } from "react-intersection-observer";
function St(t, r) {
  const y = a.getState().getInitialOptions, m = a.getState().setInitialStateOptions, v = y(t) || {};
  m(t, {
    ...v,
    ...r
  });
}
function It({
  stateKey: t,
  options: r,
  initialOptionsPart: y
}) {
  const m = et(t) || {}, v = y[t] || {}, g = a.getState().setInitialStateOptions, T = { ...v, ...m };
  let h = !1;
  if (r)
    for (const e in r)
      T.hasOwnProperty(e) ? (e == "localStorage" && r[e] && T[e].key !== r[e]?.key && (h = !0, T[e] = r[e]), e == "defaultState" && r[e] && T[e] !== r[e] && !nt(T[e], r[e]) && (h = !0, T[e] = r[e])) : (h = !0, T[e] = r[e]);
  T.syncOptions && (!r || !r.hasOwnProperty("syncOptions")) && (h = !0), h && g(t, T);
}
function ne(t, { formElements: r, validation: y }) {
  return { initialState: t, formElements: r, validation: y };
}
const Nt = (t, r) => {
  let y = t;
  const [m, v] = Rt(y);
  r?.__fromSyncSchema && r?.__syncNotifications && a.getState().setInitialStateOptions("__notifications", r.__syncNotifications), r?.__fromSyncSchema && r?.__apiParamsMap && a.getState().setInitialStateOptions("__apiParamsMap", r.__apiParamsMap), Object.keys(m).forEach((h) => {
    let e = v[h] || {};
    const s = {
      ...e
    };
    if (r?.formElements && (s.formElements = {
      ...r.formElements,
      ...e.formElements || {}
    }), r?.validation && (s.validation = {
      ...r.validation,
      ...e.validation || {}
    }, r.validation.key && !e.validation?.key && (s.validation.key = `${r.validation.key}.${h}`)), r?.__syncSchemas?.[h]?.schemas?.validation && (s.validation = {
      zodSchemaV4: r.__syncSchemas[h].schemas.validation,
      ...e.validation
    }), Object.keys(s).length > 0) {
      const p = et(h);
      p ? a.getState().setInitialStateOptions(h, {
        ...p,
        ...s
      }) : a.getState().setInitialStateOptions(h, s);
    }
  }), Object.keys(m).forEach((h) => {
    a.getState().initializeShadowState(h, m[h]);
  });
  const g = (h, e) => {
    const [s] = X(e?.componentId ?? tt());
    It({
      stateKey: h,
      options: e,
      initialOptionsPart: v
    });
    const p = a.getState().getShadowValue(h) || m[h], F = e?.modifyState ? e.modifyState(p) : p;
    return Wt(F, {
      stateKey: h,
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
  function T(h, e) {
    It({ stateKey: h, options: e, initialOptionsPart: v }), e.localStorage && Lt(h, e), pt(h);
  }
  return { useCogsState: g, setCogsOptions: T };
};
function oe(t, r) {
  const y = t.schemas, m = {}, v = {};
  for (const g in y) {
    const T = y[g];
    m[g] = T?.schemas?.defaultValues || {}, T?.api?.queryData?._paramType && (v[g] = T.api.queryData._paramType);
  }
  return Nt(m, {
    __fromSyncSchema: !0,
    __syncNotifications: t.notifications,
    __apiParamsMap: v,
    __useSync: r,
    __syncSchemas: y
  });
}
const {
  getInitialOptions: et,
  addStateLog: Ft,
  updateInitialStateGlobal: _t
} = a.getState(), jt = (t, r, y, m, v) => {
  y?.log && console.log(
    "saving to localstorage",
    r,
    y.localStorage?.key,
    m
  );
  const g = K(y?.localStorage?.key) ? y.localStorage?.key(t) : y?.localStorage?.key;
  if (g && m) {
    const T = `${m}-${r}-${g}`;
    let h;
    try {
      h = ft(T)?.lastSyncedWithServer;
    } catch {
    }
    const e = a.getState().getShadowMetadata(r, []), s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: h,
      stateSource: e?.stateSource,
      baseServerState: e?.baseServerState
    }, p = Ut.serialize(s);
    window.localStorage.setItem(
      T,
      JSON.stringify(p.json)
    );
  }
}, ft = (t) => {
  if (!t) return null;
  try {
    const r = window.localStorage.getItem(t);
    return r ? JSON.parse(r) : null;
  } catch (r) {
    return console.error("Error loading from localStorage:", r), null;
  }
}, Lt = (t, r) => {
  const y = a.getState().getShadowValue(t), { sessionId: m } = At(), v = K(r?.localStorage?.key) ? r.localStorage.key(y) : r?.localStorage?.key;
  if (v && m) {
    const g = ft(
      `${m}-${t}-${v}`
    );
    if (g && g.lastUpdated > (g.lastSyncedWithServer || 0))
      return pt(t), !0;
  }
  return !1;
}, pt = (t) => {
  const r = a.getState().getShadowMetadata(t, []);
  if (!r) return;
  const y = /* @__PURE__ */ new Set();
  r?.components?.forEach((m) => {
    (m ? Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"] : null)?.includes("none") || y.add(() => m.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((m) => m());
  });
}, se = (t, r) => {
  const y = a.getState().getShadowMetadata(t, []);
  if (y) {
    const m = `${t}////${r}`, v = y?.components?.get(m);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
};
function mt(t, r, y, m) {
  const v = a.getState(), g = v.getShadowMetadata(t, r);
  if (v.setShadowMetadata(t, r, {
    ...g,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: m || Date.now()
  }), Array.isArray(y)) {
    const T = v.getShadowMetadata(t, r);
    T?.arrayKeys && T.arrayKeys.forEach((h, e) => {
      const s = h.split(".").slice(1), p = y[e];
      p !== void 0 && mt(
        t,
        s,
        p,
        m
      );
    });
  } else y && typeof y == "object" && y.constructor === Object && Object.keys(y).forEach((T) => {
    const h = [...r, T], e = y[T];
    mt(t, h, e, m);
  });
}
let ct = /* @__PURE__ */ new Map(), gt = !1;
function Wt(t, {
  stateKey: r,
  localStorage: y,
  formElements: m,
  reactiveDeps: v,
  reactiveType: g,
  componentId: T,
  defaultState: h,
  syncUpdate: e,
  dependencies: s,
  serverState: p,
  __useSync: F
} = {}) {
  const [j, k] = X({}), { sessionId: N } = At();
  let G = !r;
  const [S] = X(r ?? tt()), Q = q(T ?? tt()), d = q(
    null
  );
  d.current = et(S) ?? null, Z(() => {
    if (e && e.stateKey === S && e.path?.[0]) {
      const l = `${e.stateKey}:${e.path.join(".")}`;
      a.getState().setSyncInfo(l, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]);
  const W = ot(
    (l) => {
      const u = l ? { ...et(S), ...l } : et(S), E = u?.defaultState || h || t;
      if (u?.serverState?.status === "success" && u?.serverState?.data !== void 0)
        return {
          value: u.serverState.data,
          source: "server",
          timestamp: u.serverState.timestamp || Date.now()
        };
      if (u?.localStorage?.key && N) {
        const V = K(u.localStorage.key) ? u.localStorage.key(E) : u.localStorage.key, M = ft(
          `${N}-${S}-${V}`
        );
        if (M && M.lastUpdated > (u?.serverState?.timestamp || 0))
          return {
            value: M.state,
            source: "localStorage",
            timestamp: M.lastUpdated
          };
      }
      return {
        value: E || t,
        source: "default",
        timestamp: Date.now()
      };
    },
    [S, h, t, N]
  );
  Z(() => {
    a.getState().setServerStateUpdate(S, p);
  }, [p, S]), Z(() => a.getState().subscribeToPath(S, (i) => {
    if (i?.type === "SERVER_STATE_UPDATE") {
      const u = i.serverState;
      if (console.log("SERVER_STATE_UPDATE", i), u?.status === "success" && u.data !== void 0) {
        St(S, { serverState: u });
        const w = typeof u.merge == "object" ? u.merge : u.merge === !0 ? {} : null, V = a.getState().getShadowValue(S), M = u.data;
        if (w && Array.isArray(V) && Array.isArray(M)) {
          const U = w.key, $ = new Set(
            V.map((x) => x[U])
          ), z = M.filter((x) => !$.has(x[U]));
          z.length > 0 && z.forEach((x) => {
            a.getState().insertShadowArrayElement(S, [], x);
            const B = a.getState().getShadowMetadata(S, []);
            if (B?.arrayKeys) {
              const C = B.arrayKeys[B.arrayKeys.length - 1];
              if (C) {
                const O = C.split(".").slice(1);
                a.getState().setShadowMetadata(S, O, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: u.timestamp || Date.now()
                });
                const I = a.getState().getShadowValue(C);
                I && typeof I == "object" && !Array.isArray(I) && Object.keys(I).forEach((b) => {
                  const A = [...O, b];
                  a.getState().setShadowMetadata(S, A, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: u.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          a.getState().initializeShadowState(S, M), mt(
            S,
            [],
            M,
            u.timestamp
          );
        const _ = a.getState().getShadowMetadata(S, []);
        a.getState().setShadowMetadata(S, [], {
          ..._,
          stateSource: "server",
          lastServerSync: u.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [S, W]), Z(() => {
    const l = a.getState().getShadowMetadata(S, []);
    if (l && l.stateSource)
      return;
    const i = et(S);
    if (i?.defaultState !== void 0 || h !== void 0) {
      const u = i?.defaultState || h;
      i?.defaultState || St(S, {
        defaultState: u
      });
      const { value: E, source: w, timestamp: V } = W();
      a.getState().initializeShadowState(S, E), a.getState().setShadowMetadata(S, [], {
        stateSource: w,
        lastServerSync: w === "server" ? V : void 0,
        isDirty: !1,
        baseServerState: w === "server" ? E : void 0
      }), pt(S);
    }
  }, [S, ...s || []]), lt(() => {
    G && St(S, {
      formElements: m,
      defaultState: h,
      localStorage: y,
      middleware: d.current?.middleware
    });
    const l = `${S}////${Q.current}`, i = a.getState().getShadowMetadata(S, []), u = i?.components || /* @__PURE__ */ new Map();
    return u.set(l, {
      forceUpdate: () => k({}),
      reactiveType: g ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: v || void 0,
      deps: v ? v(a.getState().getShadowValue(S)) : [],
      prevDeps: v ? v(a.getState().getShadowValue(S)) : []
    }), a.getState().setShadowMetadata(S, [], {
      ...i,
      components: u
    }), k({}), () => {
      const E = a.getState().getShadowMetadata(S, []), w = E?.components?.get(l);
      w?.paths && w.paths.forEach((V) => {
        const _ = V.split(".").slice(1), U = a.getState().getShadowMetadata(S, _);
        U?.pathComponents && U.pathComponents.size === 0 && (delete U.pathComponents, a.getState().setShadowMetadata(S, _, U));
      }), E?.components && a.getState().setShadowMetadata(S, [], E);
    };
  }, []);
  const J = q(null), n = (l, i, u) => {
    const E = [S, ...i].join("."), w = a.getState(), V = w.getShadowMetadata(S, i), M = w.getShadowValue(E), _ = u.updateType === "insert" && K(l) ? l({ state: M, uuid: tt() }) : K(l) ? l(M) : l, $ = {
      timeStamp: Date.now(),
      stateKey: S,
      path: i,
      updateType: u.updateType,
      status: "new",
      oldValue: M,
      newValue: _
    };
    switch (u.updateType) {
      case "insert": {
        w.insertShadowArrayElement(S, i, $.newValue), w.markAsDirty(S, i, { bubble: !0 });
        const C = V;
        if (C?.arrayKeys) {
          const O = C.arrayKeys[C.arrayKeys.length - 1];
          if (O) {
            const I = O.split(".").slice(1);
            w.markAsDirty(S, I, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const C = i.slice(0, -1);
        w.removeShadowArrayElement(S, i), w.markAsDirty(S, C, { bubble: !0 });
        break;
      }
      case "update": {
        w.updateShadowAtPath(S, i, $.newValue), w.markAsDirty(S, i, { bubble: !0 });
        break;
      }
    }
    if (u.sync !== !1 && J.current && J.current.connected && J.current.updateState({ operation: $ }), V?.signals && V.signals.length > 0) {
      const C = u.updateType === "cut" ? null : _;
      V.signals.forEach(({ parentId: O, position: I, effect: b }) => {
        const A = document.querySelector(`[data-parent-id="${O}"]`);
        if (A) {
          const D = Array.from(A.childNodes);
          if (D[I]) {
            let P = C;
            if (b && C !== null)
              try {
                P = new Function(
                  "state",
                  `return (${b})(state)`
                )(C);
              } catch (R) {
                console.error("Error evaluating effect function:", R);
              }
            P != null && typeof P == "object" && (P = JSON.stringify(P)), D[I].textContent = String(P ?? "");
          }
        }
      });
    }
    if (u.updateType === "insert" && V?.mapWrappers && V.mapWrappers.length > 0) {
      const C = w.getShadowMetadata(S, i)?.arrayKeys || [], O = C[C.length - 1], I = w.getShadowValue(O), b = w.getShadowValue(
        [S, ...i].join(".")
      );
      if (!O || I === void 0) return;
      V.mapWrappers.forEach((A) => {
        let D = !0, P = -1;
        if (A.meta?.transforms && A.meta.transforms.length > 0) {
          for (const R of A.meta.transforms)
            if (R.type === "filter" && !R.fn(I, -1)) {
              D = !1;
              break;
            }
          if (D) {
            const R = yt(
              S,
              i,
              A.meta.transforms
            ), Y = A.meta.transforms.find(
              (L) => L.type === "sort"
            );
            if (Y) {
              const L = R.map((H) => ({
                key: H,
                value: w.getShadowValue(H)
              }));
              L.push({ key: O, value: I }), L.sort((H, at) => Y.fn(H.value, at.value)), P = L.findIndex(
                (H) => H.key === O
              );
            } else
              P = R.length;
          }
        } else
          D = !0, P = C.length - 1;
        if (D && A.containerRef && A.containerRef.isConnected) {
          const R = document.createElement("div");
          R.setAttribute("data-item-path", O);
          const Y = Array.from(A.containerRef.children);
          P >= 0 && P < Y.length ? A.containerRef.insertBefore(
            R,
            Y[P]
          ) : A.containerRef.appendChild(R);
          const L = bt(R), H = tt(), at = O.split(".").slice(1), it = A.rebuildStateShape({
            path: A.path,
            currentState: b,
            componentId: A.componentId,
            meta: A.meta
          });
          L.render(
            st(vt, {
              stateKey: S,
              itemComponentId: H,
              itemPath: at,
              localIndex: P,
              arraySetter: it,
              rebuildStateShape: A.rebuildStateShape,
              renderFn: A.mapFn
            })
          );
        }
      });
    }
    if (u.updateType === "cut") {
      const C = i.slice(0, -1), O = w.getShadowMetadata(S, C);
      O?.mapWrappers && O.mapWrappers.length > 0 && O.mapWrappers.forEach((I) => {
        if (I.containerRef && I.containerRef.isConnected) {
          const b = I.containerRef.querySelector(
            `[data-item-path="${E}"]`
          );
          b && b.remove();
        }
      });
    }
    const x = w.getShadowMetadata(S, []), B = /* @__PURE__ */ new Set();
    if (x?.components) {
      if (u.updateType === "update") {
        let C = [...i];
        for (; ; ) {
          const O = w.getShadowMetadata(S, C);
          if (O?.pathComponents && O.pathComponents.forEach((I) => {
            if (B.has(I))
              return;
            const b = x.components?.get(I);
            b && ((Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"]).includes("none") || (b.forceUpdate(), B.add(I)));
          }), C.length === 0)
            break;
          C.pop();
        }
        _ && typeof _ == "object" && !wt(_) && M && typeof M == "object" && !wt(M) && Et(_, M).forEach((I) => {
          const b = I.split("."), A = [...i, ...b], D = w.getShadowMetadata(S, A);
          D?.pathComponents && D.pathComponents.forEach((P) => {
            if (B.has(P))
              return;
            const R = x.components?.get(P);
            R && ((Array.isArray(R.reactiveType) ? R.reactiveType : [R.reactiveType || "component"]).includes("none") || (R.forceUpdate(), B.add(P)));
          });
        });
      } else if (u.updateType === "insert" || u.updateType === "cut") {
        const C = u.updateType === "insert" ? i : i.slice(0, -1), O = w.getShadowMetadata(S, C);
        if (O?.signals && O.signals.length > 0) {
          const I = [S, ...C].join("."), b = w.getShadowValue(I);
          O.signals.forEach(({ parentId: A, position: D, effect: P }) => {
            const R = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (R) {
              const Y = Array.from(R.childNodes);
              if (Y[D]) {
                let L = b;
                if (P)
                  try {
                    L = new Function(
                      "state",
                      `return (${P})(state)`
                    )(b);
                  } catch (H) {
                    console.error("Error evaluating effect function:", H), L = b;
                  }
                L != null && typeof L == "object" && (L = JSON.stringify(L)), Y[D].textContent = String(L ?? "");
              }
            }
          });
        }
        O?.pathComponents && O.pathComponents.forEach((I) => {
          if (!B.has(I)) {
            const b = x.components?.get(I);
            b && (b.forceUpdate(), B.add(I));
          }
        });
      }
      x.components.forEach((C, O) => {
        if (B.has(O))
          return;
        const I = Array.isArray(C.reactiveType) ? C.reactiveType : [C.reactiveType || "component"];
        if (I.includes("all")) {
          C.forceUpdate(), B.add(O);
          return;
        }
        if (I.includes("deps") && C.depsFunction) {
          const b = w.getShadowValue(S), A = C.depsFunction(b);
          let D = !1;
          A === !0 ? D = !0 : Array.isArray(A) && (nt(C.prevDeps, A) || (C.prevDeps = A, D = !0)), D && (C.forceUpdate(), B.add(O));
        }
      }), B.clear(), Ft(S, $), jt(
        _,
        S,
        d.current,
        N
      ), d.current?.middleware && d.current.middleware({
        update: $
      });
    }
  };
  a.getState().initialStateGlobal[S] || _t(S, t);
  const o = dt(() => Ct(
    S,
    n,
    Q.current,
    N
  ), [S, N]), c = F, f = d.current?.syncOptions;
  return c && (J.current = c(
    o,
    f ?? {}
  )), o;
}
function Ht(t) {
  return !t || t.length === 0 ? "" : t.map(
    (r) => `${r.type}${JSON.stringify(r.dependencies || [])}`
  ).join("");
}
const yt = (t, r, y) => {
  let m = a.getState().getShadowMetadata(t, r)?.arrayKeys || [];
  if (!y || y.length === 0)
    return m;
  let v = m.map((g) => ({
    key: g,
    value: a.getState().getShadowValue(g)
  }));
  for (const g of y)
    g.type === "filter" ? v = v.filter(
      ({ value: T }, h) => g.fn(T, h)
    ) : g.type === "sort" && v.sort((T, h) => g.fn(T.value, h.value));
  return v.map(({ key: g }) => g);
}, Mt = (t, r, y) => {
  const m = `${t}////${r}`, { addPathComponent: v, getShadowMetadata: g } = a.getState(), h = g(t, [])?.components?.get(m);
  !h || h.reactiveType === "none" || !(Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType]).includes("component") || v(t, y, m);
}, ut = (t, r, y) => {
  const m = a.getState(), v = m.getShadowMetadata(t, []), g = /* @__PURE__ */ new Set();
  v?.components && v.components.forEach((h, e) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), g.add(e));
  }), m.getShadowMetadata(t, [...r, "getSelected"])?.pathComponents?.forEach((h) => {
    v?.components?.get(h)?.forceUpdate();
  });
  const T = m.getShadowMetadata(t, r);
  for (let h of T?.arrayKeys || []) {
    const e = h + ".selected", s = m.getShadowMetadata(
      t,
      e.split(".").slice(1)
    );
    h == y && s?.pathComponents?.forEach((p) => {
      v?.components?.get(p)?.forceUpdate();
    });
  }
};
function Ct(t, r, y, m) {
  const v = /* @__PURE__ */ new Map();
  function g({
    path: e = [],
    meta: s,
    componentId: p
  }) {
    const F = s ? JSON.stringify(s.validIds || s.transforms) : "", j = e.join(".") + ":" + F;
    if (console.log("PROXY CACHE KEY ", j), v.has(j))
      return console.log("PROXY CACHE HIT"), v.get(j);
    const k = [t, ...e].join("."), N = function() {
      return a().getShadowValue(t, e);
    }, G = {
      get(Q, d) {
        if (d === "_rebuildStateShape")
          return g;
        if (Object.getOwnPropertyNames(T).includes(d) && e.length === 0)
          return T[d];
        if (d === "getDifferences")
          return () => {
            const n = a.getState().getShadowMetadata(t, []), o = a.getState().getShadowValue(t);
            let c;
            return n?.stateSource === "server" && n.baseServerState ? c = n.baseServerState : c = a.getState().initialStateGlobal[t], Et(o, c);
          };
        if (d === "sync" && e.length === 0)
          return async function() {
            const n = a.getState().getInitialOptions(t), o = n?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const c = a.getState().getShadowValue(t, []), f = n?.validation?.key;
            try {
              const l = await o.action(c);
              if (l && !l.success && l.errors, l?.success) {
                const i = a.getState().getShadowMetadata(t, []);
                a.getState().setShadowMetadata(t, [], {
                  ...i,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: c
                  // Update base server state
                }), o.onSuccess && o.onSuccess(l.data);
              } else !l?.success && o.onError && o.onError(l.error);
              return l;
            } catch (l) {
              return o.onError && o.onError(l), { success: !1, error: l };
            }
          };
        if (d === "_status" || d === "getStatus") {
          const n = () => {
            const o = a.getState().getShadowMetadata(t, e), c = a.getState().getShadowValue(k);
            return o?.isDirty === !0 ? "dirty" : o?.isDirty === !1 || o?.stateSource === "server" ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" ? "fresh" : a.getState().getShadowMetadata(t, [])?.stateSource === "server" && !o?.isDirty ? "synced" : c !== void 0 && !o ? "fresh" : "unknown";
          };
          return d === "_status" ? n() : n;
        }
        if (d === "removeStorage")
          return () => {
            const n = a.getState().initialStateGlobal[t], o = et(t), c = K(o?.localStorage?.key) ? o.localStorage.key(n) : o?.localStorage?.key, f = `${m}-${t}-${c}`;
            f && localStorage.removeItem(f);
          };
        if (d === "showValidationErrors")
          return () => {
            const n = a.getState().getShadowMetadata(t, e);
            return n?.validation?.status === "VALIDATION_FAILED" && n.validation.message ? [n.validation.message] : [];
          };
        if (d === "getSelected")
          return () => {
            const n = t + "." + e.join(".");
            Mt(t, p, [
              ...e,
              "getSelected"
            ]);
            const o = a.getState().selectedIndicesMap;
            if (!o || !o.has(n))
              return;
            const c = o.get(n);
            if (!(s?.validIds && !s.validIds.includes(c) || !a.getState().getShadowValue(c)))
              return g({
                path: c.split(".").slice(1),
                componentId: p
              });
          };
        if (d === "getSelectedIndex")
          return () => a.getState().getSelectedIndex(
            t + "." + e.join("."),
            s?.validIds
          );
        if (d === "clearSelected")
          return ut(t, e), () => {
            a.getState().clearSelectedIndex({
              arrayKey: t + "." + e.join(".")
            });
          };
        if (d === "useVirtualView")
          return (n) => {
            const {
              itemHeight: o = 50,
              overscan: c = 6,
              stickToBottom: f = !1,
              scrollStickTolerance: l = 75
            } = n, i = q(null), [u, E] = X({
              startIndex: 0,
              endIndex: 10
            }), [w, V] = X({}), M = q(!0), _ = q({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), U = q(
              /* @__PURE__ */ new Map()
            );
            lt(() => {
              if (!f || !i.current || _.current.isUserScrolling)
                return;
              const I = i.current;
              I.scrollTo({
                top: I.scrollHeight,
                behavior: M.current ? "instant" : "smooth"
              });
            }, [w, f]);
            const $ = a.getState().getShadowMetadata(t, e)?.arrayKeys || [], { totalHeight: z, itemOffsets: x } = dt(() => {
              let I = 0;
              const b = /* @__PURE__ */ new Map();
              return (a.getState().getShadowMetadata(t, e)?.arrayKeys || []).forEach((D) => {
                const P = D.split(".").slice(1), R = a.getState().getShadowMetadata(t, P)?.virtualizer?.itemHeight || o;
                b.set(D, {
                  height: R,
                  offset: I
                }), I += R;
              }), U.current = b, { totalHeight: I, itemOffsets: b };
            }, [$.length, o]);
            lt(() => {
              if (f && $.length > 0 && i.current && !_.current.isUserScrolling && M.current) {
                const I = i.current, b = () => {
                  if (I.clientHeight > 0) {
                    const A = Math.ceil(
                      I.clientHeight / o
                    ), D = $.length - 1, P = Math.max(
                      0,
                      D - A - c
                    );
                    E({ startIndex: P, endIndex: D }), requestAnimationFrame(() => {
                      C("instant"), M.current = !1;
                    });
                  } else
                    requestAnimationFrame(b);
                };
                b();
              }
            }, [$.length, f, o, c]);
            const B = ot(() => {
              const I = i.current;
              if (!I) return;
              const b = I.scrollTop, { scrollHeight: A, clientHeight: D } = I, P = _.current, R = A - (b + D), Y = P.isNearBottom;
              P.isNearBottom = R <= l, b < P.lastScrollTop ? (P.scrollUpCount++, P.scrollUpCount > 3 && Y && (P.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : P.isNearBottom && (P.isUserScrolling = !1, P.scrollUpCount = 0), P.lastScrollTop = b;
              let L = 0;
              for (let H = 0; H < $.length; H++) {
                const at = $[H], it = U.current.get(at);
                if (it && it.offset + it.height > b) {
                  L = H;
                  break;
                }
              }
              if (L !== u.startIndex) {
                const H = Math.ceil(D / o);
                E({
                  startIndex: Math.max(0, L - c),
                  endIndex: Math.min(
                    $.length - 1,
                    L + H + c
                  )
                });
              }
            }, [
              $.length,
              u.startIndex,
              o,
              c,
              l
            ]);
            Z(() => {
              const I = i.current;
              if (!(!I || !f))
                return I.addEventListener("scroll", B, {
                  passive: !0
                }), () => {
                  I.removeEventListener("scroll", B);
                };
            }, [B, f]);
            const C = ot(
              (I = "smooth") => {
                const b = i.current;
                if (!b) return;
                _.current.isUserScrolling = !1, _.current.isNearBottom = !0, _.current.scrollUpCount = 0;
                const A = () => {
                  const D = (P = 0) => {
                    if (P > 5) return;
                    const R = b.scrollHeight, Y = b.scrollTop, L = b.clientHeight;
                    Y + L >= R - 1 || (b.scrollTo({
                      top: R,
                      behavior: I
                    }), setTimeout(() => {
                      const H = b.scrollHeight, at = b.scrollTop;
                      (H !== R || at + L < H - 1) && D(P + 1);
                    }, 50));
                  };
                  D();
                };
                "requestIdleCallback" in window ? requestIdleCallback(A, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(A);
                });
              },
              []
            );
            return Z(() => {
              if (!f || !i.current) return;
              const I = i.current, b = _.current;
              let A;
              const D = () => {
                clearTimeout(A), A = setTimeout(() => {
                  !b.isUserScrolling && b.isNearBottom && C(
                    M.current ? "instant" : "smooth"
                  );
                }, 100);
              }, P = new MutationObserver(() => {
                b.isUserScrolling || D();
              });
              P.observe(I, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
                // More specific than just 'height'
              });
              const R = (Y) => {
                Y.target instanceof HTMLImageElement && !b.isUserScrolling && D();
              };
              return I.addEventListener("load", R, !0), M.current ? setTimeout(() => {
                C("instant");
              }, 0) : D(), () => {
                clearTimeout(A), P.disconnect(), I.removeEventListener("load", R, !0);
              };
            }, [f, $.length, C]), {
              virtualState: dt(() => {
                const I = a.getState(), b = I.getShadowValue(
                  [t, ...e].join(".")
                ), A = I.getShadowMetadata(t, e)?.arrayKeys || [];
                b.slice(
                  u.startIndex,
                  u.endIndex + 1
                );
                const D = A.slice(
                  u.startIndex,
                  u.endIndex + 1
                );
                return g({
                  path: e,
                  componentId: p,
                  meta: { ...s, validIds: D }
                });
              }, [u.startIndex, u.endIndex, $.length]),
              virtualizerProps: {
                outer: {
                  ref: i,
                  style: {
                    overflowY: "auto",
                    height: "100%",
                    position: "relative"
                  }
                },
                inner: {
                  style: {
                    height: `${z}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${U.current.get($[u.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: C,
              scrollToIndex: (I, b = "smooth") => {
                if (i.current && $[I]) {
                  const A = U.current.get($[I])?.offset || 0;
                  i.current.scrollTo({ top: A, behavior: b });
                }
              }
            };
          };
        if (d === "stateMap")
          return (n) => {
            const [o, c] = X(
              s?.validIds ?? a.getState().getShadowMetadata(t, e)?.arrayKeys
            ), f = a.getState().getShadowValue(k, s?.validIds);
            if (!o)
              throw new Error("No array keys found for mapping");
            const l = g({
              path: e,
              componentId: p,
              meta: s
            });
            return f.map((i, u) => {
              const E = o[u]?.split(".").slice(1), w = g({
                path: E,
                componentId: p,
                meta: s
              });
              return n(
                w,
                u,
                l
              );
            });
          };
        if (d === "$stateMap")
          return (n) => st(xt, {
            proxy: {
              _stateKey: t,
              _path: e,
              _mapFn: n,
              _meta: s
            },
            rebuildStateShape: g
          });
        if (d === "stateFind")
          return (n) => {
            const o = s?.validIds ?? a.getState().getShadowMetadata(t, e)?.arrayKeys;
            if (o)
              for (let c = 0; c < o.length; c++) {
                const f = o[c];
                if (!f) continue;
                const l = a.getState().getShadowValue(f);
                if (n(l, c)) {
                  const i = f.split(".").slice(1);
                  return g({
                    path: i,
                    componentId: p,
                    meta: s
                    // Pass along meta for potential further chaining
                  });
                }
              }
          };
        if (d === "stateFilter")
          return (n) => {
            const o = a.getState().getShadowValue([t, ...e].join("."), s?.validIds);
            if (!Array.isArray(o)) return [];
            const c = s?.validIds ?? a.getState().getShadowMetadata(t, e)?.arrayKeys;
            if (!c)
              throw new Error("No array keys found for filtering.");
            const f = [];
            return o.filter(
              (l, i) => n(l, i) ? (f.push(c[i]), !0) : !1
            ), g({
              path: e,
              componentId: p,
              meta: {
                validIds: f,
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
        if (d === "stateSort")
          return (n) => {
            const o = a.getState().getShadowValue([t, ...e].join("."), s?.validIds);
            if (!Array.isArray(o)) return [];
            const c = s?.validIds ?? a.getState().getShadowMetadata(t, e)?.arrayKeys;
            if (!c)
              throw new Error("No array keys found for sorting");
            const f = o.map((l, i) => ({
              item: l,
              key: c[i]
            }));
            return f.sort((l, i) => n(l.item, i.item)).filter(Boolean), g({
              path: e,
              componentId: p,
              meta: {
                validIds: f.map((l) => l.key),
                transforms: [
                  ...s?.transforms || [],
                  { type: "sort", fn: n }
                ]
              }
            });
          };
        if (d === "stream")
          return function(n = {}) {
            const {
              bufferSize: o = 100,
              flushInterval: c = 100,
              bufferStrategy: f = "accumulate",
              store: l,
              onFlush: i
            } = n;
            let u = [], E = !1, w = null;
            const V = (z) => {
              if (!E) {
                if (f === "sliding" && u.length >= o)
                  u.shift();
                else if (f === "dropping" && u.length >= o)
                  return;
                u.push(z), u.length >= o && M();
              }
            }, M = () => {
              if (u.length === 0) return;
              const z = [...u];
              if (u = [], l) {
                const x = l(z);
                x !== void 0 && (Array.isArray(x) ? x : [x]).forEach((C) => {
                  r(C, e, {
                    updateType: "insert"
                  });
                });
              } else
                z.forEach((x) => {
                  r(x, e, {
                    updateType: "insert"
                  });
                });
              i?.(z);
            };
            c > 0 && (w = setInterval(M, c));
            const _ = tt(), U = a.getState().getShadowMetadata(t, e) || {}, $ = U.streams || /* @__PURE__ */ new Map();
            return $.set(_, { buffer: u, flushTimer: w }), a.getState().setShadowMetadata(t, e, {
              ...U,
              streams: $
            }), {
              write: (z) => V(z),
              writeMany: (z) => z.forEach(V),
              flush: () => M(),
              pause: () => {
                E = !0;
              },
              resume: () => {
                E = !1, u.length > 0 && M();
              },
              close: () => {
                M(), w && clearInterval(w);
                const z = a.getState().getShadowMetadata(t, e);
                z?.streams && z.streams.delete(_);
              }
            };
          };
        if (d === "stateList")
          return (n) => /* @__PURE__ */ rt(() => {
            const c = q(/* @__PURE__ */ new Map()), f = s?.transforms && s.transforms.length > 0 ? `${p}-${Ht(s.transforms)}` : `${p}-base`, [l, i] = X({}), { validIds: u, arrayValues: E } = dt(() => {
              const V = a.getState().getShadowMetadata(t, e)?.transformCaches?.get(f);
              let M;
              V && V.validIds ? M = V.validIds : (M = yt(
                t,
                e,
                s?.transforms
              ), a.getState().setTransformCache(t, e, f, {
                validIds: M,
                computedAt: Date.now(),
                transforms: s?.transforms || []
              }));
              const _ = a.getState().getShadowValue(k, M);
              return {
                validIds: M,
                arrayValues: _ || []
              };
            }, [f, l]);
            if (Z(() => {
              const V = a.getState().subscribeToPath(k, (M) => {
                if (M.type === "GET_SELECTED")
                  return;
                const U = a.getState().getShadowMetadata(t, e)?.transformCaches;
                if (U)
                  for (const $ of U.keys())
                    $.startsWith(p) && U.delete($);
                (M.type === "INSERT" || M.type === "REMOVE" || M.type === "CLEAR_SELECTION") && i({});
              });
              return () => {
                V();
              };
            }, [p, k]), !Array.isArray(E))
              return null;
            const w = g({
              path: e,
              componentId: p,
              meta: {
                ...s,
                validIds: u
              }
            });
            return /* @__PURE__ */ rt(kt, { children: E.map((V, M) => {
              const _ = u[M];
              if (!_)
                return null;
              let U = c.current.get(_);
              U || (U = tt(), c.current.set(_, U));
              const $ = _.split(".").slice(1);
              return st(vt, {
                key: _,
                stateKey: t,
                itemComponentId: U,
                itemPath: $,
                localIndex: M,
                arraySetter: w,
                rebuildStateShape: g,
                renderFn: n
              });
            }) });
          }, {});
        if (d === "stateFlattenOn")
          return (n) => {
            const o = a.getState().getShadowValue([t, ...e].join("."), s?.validIds);
            return Array.isArray(o) ? (o.flatMap(
              (f) => f[n] ?? []
            ), g({
              path: [...e, "[*]", n],
              componentId: p,
              meta: s
            })) : [];
          };
        if (d === "index")
          return (n) => {
            const c = a.getState().getShadowMetadata(t, e)?.arrayKeys?.filter(
              (l) => !s?.validIds || s?.validIds && s?.validIds?.includes(l)
            )?.[n];
            return c ? (a.getState().getShadowValue(c, s?.validIds), g({
              path: c.split(".").slice(1),
              componentId: p,
              meta: s
            })) : void 0;
          };
        if (d === "last")
          return () => {
            const n = a.getState().getShadowValue(t, e);
            if (n.length === 0) return;
            const o = n.length - 1;
            n[o];
            const c = [...e, o.toString()];
            return g({
              path: c,
              componentId: p,
              meta: s
            });
          };
        if (d === "insert")
          return (n, o) => (r(n, e, { updateType: "insert" }), g({
            path: e,
            componentId: p,
            meta: s
          }));
        if (d === "uniqueInsert")
          return (n, o, c) => {
            const f = a.getState().getShadowValue(t, e), l = K(n) ? n(f) : n;
            let i = null;
            if (!f.some((E) => {
              const w = o ? o.every(
                (V) => nt(E[V], l[V])
              ) : nt(E, l);
              return w && (i = E), w;
            }))
              r(l, e, { updateType: "insert" });
            else if (c && i) {
              const E = c(i), w = f.map(
                (V) => nt(V, i) ? E : V
              );
              r(w, e, {
                updateType: "update"
              });
            }
          };
        if (d === "cut")
          return (n, o) => {
            const c = a.getState().getShadowValue([t, ...e].join("."), s?.validIds), f = s?.validIds ?? a.getState().getShadowMetadata(t, e)?.arrayKeys;
            if (!f || f.length === 0) return;
            const l = n == -1 ? f.length - 1 : n !== void 0 ? n : f.length - 1, i = f[l];
            if (!i) return;
            const u = i.split(".").slice(1);
            r(c, u, {
              updateType: "cut"
            });
          };
        if (d === "cutSelected")
          return () => {
            const n = yt(t, e, s?.transforms), o = a.getState().getShadowValue([t, ...e].join("."), s?.validIds);
            if (!n || n.length === 0) return;
            const c = a.getState().selectedIndicesMap.get(k);
            let f = n.findIndex(
              (u) => u === c
            );
            const l = n[f == -1 ? n.length - 1 : f]?.split(".").slice(1);
            a.getState().clearSelectedIndex({ arrayKey: k });
            const i = l?.slice(0, -1);
            ut(t, i), r(o, l, {
              updateType: "cut"
            });
          };
        if (d === "cutByValue")
          return (n) => {
            const o = a.getState().getShadowMetadata(t, e), c = s?.validIds ?? o?.arrayKeys;
            if (!c) return;
            let f = null;
            for (const l of c)
              if (a.getState().getShadowValue(l) === n) {
                f = l;
                break;
              }
            if (f) {
              const l = f.split(".").slice(1);
              r(null, l, { updateType: "cut" });
            }
          };
        if (d === "toggleByValue")
          return (n) => {
            const o = a.getState().getShadowMetadata(t, e), c = s?.validIds ?? o?.arrayKeys;
            if (!c) return;
            let f = null;
            for (const l of c) {
              const i = a.getState().getShadowValue(l);
              if (console.log("itemValue sdasdasdasd", i), i === n) {
                f = l;
                break;
              }
            }
            if (console.log("itemValue keyToCut", f), f) {
              const l = f.split(".").slice(1);
              console.log("itemValue keyToCut", f), r(n, l, {
                updateType: "cut"
              });
            } else
              r(n, e, { updateType: "insert" });
          };
        if (d === "findWith")
          return (n, o) => {
            const c = a.getState().getShadowMetadata(t, e)?.arrayKeys;
            if (!c)
              throw new Error("No array keys found for sorting");
            let f = [];
            for (const l of c) {
              let i = a.getState().getShadowValue(l, s?.validIds);
              if (i && i[n] === o) {
                f = l.split(".").slice(1);
                break;
              }
            }
            return g({
              path: f,
              componentId: p,
              meta: s
            });
          };
        if (d === "cutThis") {
          let n = a.getState().getShadowValue(e.join("."));
          return () => {
            r(n, e, { updateType: "cut" });
          };
        }
        if (d === "get")
          return () => (Mt(t, p, e), a.getState().getShadowValue(k, s?.validIds));
        if (d === "getState")
          return () => a.getState().getShadowValue(k, s?.validIds);
        if (d === "$derive")
          return (n) => Tt({
            _stateKey: t,
            _path: e,
            _effect: n.toString(),
            _meta: s
          });
        if (d === "$get")
          return () => Tt({ _stateKey: t, _path: e, _meta: s });
        if (d === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (d == "getLocalStorage")
          return (n) => ft(m + "-" + t + "-" + n);
        if (d === "isSelected") {
          const n = [t, ...e].slice(0, -1);
          if (ut(t, e, void 0), Array.isArray(
            a.getState().getShadowValue(n.join("."), s?.validIds)
          )) {
            e[e.length - 1];
            const o = n.join("."), c = a.getState().selectedIndicesMap.get(o), f = t + "." + e.join(".");
            return c === f;
          }
          return;
        }
        if (d === "setSelected")
          return (n) => {
            const o = e.slice(0, -1), c = t + "." + o.join("."), f = t + "." + e.join(".");
            ut(t, o, void 0), a.getState().selectedIndicesMap.get(c), n && a.getState().setSelectedIndex(c, f);
          };
        if (d === "toggleSelected")
          return () => {
            const n = e.slice(0, -1), o = t + "." + n.join("."), c = t + "." + e.join(".");
            a.getState().selectedIndicesMap.get(o) === c ? a.getState().clearSelectedIndex({ arrayKey: o }) : a.getState().setSelectedIndex(o, c);
          };
        if (d === "_componentId")
          return p;
        if (e.length == 0) {
          if (d === "addZodValidation")
            return (n) => {
              a.getState().getInitialOptions(t)?.validation, n.forEach((o) => {
                const c = a.getState().getShadowMetadata(t, o.path) || {};
                a.getState().setShadowMetadata(t, o.path, {
                  ...c,
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
          if (d === "clearZodValidation")
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
          if (d === "applyJsonPatch")
            return (n) => {
              const o = a.getState(), c = o.getShadowMetadata(t, []);
              if (!c?.components) return;
              const f = (i) => !i || i === "/" ? [] : i.split("/").slice(1).map((u) => u.replace(/~1/g, "/").replace(/~0/g, "~")), l = /* @__PURE__ */ new Set();
              for (const i of n) {
                const u = f(i.path);
                switch (i.op) {
                  case "add":
                  case "replace": {
                    const { value: E } = i;
                    o.updateShadowAtPath(t, u, E), o.markAsDirty(t, u, { bubble: !0 });
                    let w = [...u];
                    for (; ; ) {
                      const V = o.getShadowMetadata(
                        t,
                        w
                      );
                      if (V?.pathComponents && V.pathComponents.forEach((M) => {
                        if (!l.has(M)) {
                          const _ = c.components?.get(M);
                          _ && (_.forceUpdate(), l.add(M));
                        }
                      }), w.length === 0) break;
                      w.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const E = u.slice(0, -1);
                    o.removeShadowArrayElement(t, u), o.markAsDirty(t, E, { bubble: !0 });
                    let w = [...E];
                    for (; ; ) {
                      const V = o.getShadowMetadata(
                        t,
                        w
                      );
                      if (V?.pathComponents && V.pathComponents.forEach((M) => {
                        if (!l.has(M)) {
                          const _ = c.components?.get(M);
                          _ && (_.forceUpdate(), l.add(M));
                        }
                      }), w.length === 0) break;
                      w.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (d === "getComponents")
            return () => a.getState().getShadowMetadata(t, [])?.components;
          if (d === "getAllFormRefs")
            return () => ht.getState().getFormRefsByStateKey(t);
        }
        if (d === "getFormRef")
          return () => ht.getState().getFormRef(t + "." + e.join("."));
        if (d === "validationWrapper")
          return ({
            children: n,
            hideMessage: o
          }) => /* @__PURE__ */ rt(
            Vt,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: e,
              stateKey: t,
              children: n
            }
          );
        if (d === "_stateKey") return t;
        if (d === "_path") return e;
        if (d === "update")
          return (n) => {
            const c = new Error().stack || "";
            if (c.includes("onClick") || c.includes("dispatchEvent") || c.includes("batchedUpdates")) {
              const l = `${t}.${e.join(".")}`;
              gt || (ct.clear(), gt = !0, queueMicrotask(() => {
                for (const [u, E] of ct) {
                  const w = u.split(".");
                  w[0];
                  const V = w.slice(1), M = E.reduce(
                    (_, U) => typeof U == "function" && typeof _ == "function" ? ($) => U(_($)) : U
                  );
                  r(M, V, {
                    updateType: "update"
                  });
                }
                ct.clear(), gt = !1;
              }));
              const i = ct.get(l) || [];
              i.push(n), ct.set(l, i);
            } else
              r(n, e, { updateType: "update" });
            return {
              synced: () => {
                const l = a.getState().getShadowMetadata(t, e);
                a.getState().setShadowMetadata(t, e, {
                  ...l,
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: Date.now()
                });
                const i = [t, ...e].join(".");
                a.getState().notifyPathSubscribers(i, {
                  type: "SYNC_STATUS_CHANGE",
                  isDirty: !1
                });
              }
            };
          };
        if (d === "toggle") {
          const n = a.getState().getShadowValue([t, ...e].join("."), s?.validIds);
          if (typeof n != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            r(!n, e, {
              updateType: "update"
            });
          };
        }
        if (d === "formElement")
          return (n, o) => /* @__PURE__ */ rt(
            Gt,
            {
              stateKey: t,
              path: e,
              rebuildStateShape: g,
              setState: r,
              formOpts: o,
              renderFn: n
            }
          );
        const J = [...e, d];
        return a.getState().getShadowValue(t, J), g({
          path: J,
          componentId: p,
          meta: s
        });
      }
    }, S = new Proxy(N, G);
    return v.set(j, S), S;
  }
  const T = {
    revertToInitialState: (e) => {
      a.getState().getInitialOptions(t)?.validation;
      const s = a.getState().getShadowMetadata(t, []);
      s?.stateSource === "server" && s.baseServerState ? s.baseServerState : a.getState().initialStateGlobal[t];
      const p = a.getState().initialStateGlobal[t];
      a.getState().clearSelectedIndexesForState(t), a.getState().initializeShadowState(t, p), g({
        path: [],
        componentId: y
      });
      const F = et(t), j = K(F?.localStorage?.key) ? F?.localStorage?.key(p) : F?.localStorage?.key, k = `${m}-${t}-${j}`;
      k && localStorage.removeItem(k);
      const N = a.getState().getShadowMetadata(t, []);
      return N && N?.components?.forEach((G) => {
        G.forceUpdate();
      }), p;
    },
    updateInitialState: (e) => {
      const s = Ct(
        t,
        r,
        y,
        m
      ), p = a.getState().initialStateGlobal[t], F = et(t), j = K(F?.localStorage?.key) ? F?.localStorage?.key(p) : F?.localStorage?.key, k = `${m}-${t}-${j}`;
      return localStorage.getItem(k) && localStorage.removeItem(k), Ot(() => {
        _t(t, e), a.getState().initializeShadowState(t, e);
        const N = a.getState().getShadowMetadata(t, []);
        N && N?.components?.forEach((G) => {
          G.forceUpdate();
        });
      }), {
        fetchId: (N) => s.get()[N]
      };
    }
  };
  return g({
    componentId: y,
    path: []
  });
}
function Tt(t) {
  return st(Bt, { proxy: t });
}
function xt({
  proxy: t,
  rebuildStateShape: r
}) {
  const y = q(null), m = q(`map-${crypto.randomUUID()}`), v = q(!1), g = q(/* @__PURE__ */ new Map());
  Z(() => {
    const h = y.current;
    if (!h || v.current) return;
    const e = setTimeout(() => {
      const s = a.getState().getShadowMetadata(t._stateKey, t._path) || {}, p = s.mapWrappers || [];
      p.push({
        instanceId: m.current,
        mapFn: t._mapFn,
        containerRef: h,
        rebuildStateShape: r,
        path: t._path,
        componentId: m.current,
        meta: t._meta
      }), a.getState().setShadowMetadata(t._stateKey, t._path, {
        ...s,
        mapWrappers: p
      }), v.current = !0, T();
    }, 0);
    return () => {
      if (clearTimeout(e), m.current) {
        const s = a.getState().getShadowMetadata(t._stateKey, t._path) || {};
        s.mapWrappers && (s.mapWrappers = s.mapWrappers.filter(
          (p) => p.instanceId !== m.current
        ), a.getState().setShadowMetadata(t._stateKey, t._path, s));
      }
      g.current.forEach((s) => s.unmount());
    };
  }, []);
  const T = () => {
    const h = y.current;
    if (!h) return;
    const e = a.getState().getShadowValue(
      [t._stateKey, ...t._path].join("."),
      t._meta?.validIds
    );
    if (!Array.isArray(e)) return;
    const s = t._meta?.validIds ?? a.getState().getShadowMetadata(t._stateKey, t._path)?.arrayKeys ?? [], p = r({
      currentState: e,
      path: t._path,
      componentId: m.current,
      meta: t._meta
    });
    e.forEach((F, j) => {
      const k = s[j];
      if (!k) return;
      const N = tt(), G = document.createElement("div");
      G.setAttribute("data-item-path", k), h.appendChild(G);
      const S = bt(G);
      g.current.set(k, S);
      const Q = k.split(".").slice(1);
      S.render(
        st(vt, {
          stateKey: t._stateKey,
          itemComponentId: N,
          itemPath: Q,
          localIndex: j,
          arraySetter: p,
          rebuildStateShape: r,
          renderFn: t._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ rt("div", { ref: y, "data-map-container": m.current });
}
function Bt({
  proxy: t
}) {
  const r = q(null), y = q(null), m = q(!1), v = `${t._stateKey}-${t._path.join(".")}`, g = a.getState().getShadowValue(
    [t._stateKey, ...t._path].join("."),
    t._meta?.validIds
  );
  return Z(() => {
    const T = r.current;
    if (!T || m.current) return;
    const h = setTimeout(() => {
      if (!T.parentElement) {
        console.warn("Parent element not found for signal", v);
        return;
      }
      const e = T.parentElement, p = Array.from(e.childNodes).indexOf(T);
      let F = e.getAttribute("data-parent-id");
      F || (F = `parent-${crypto.randomUUID()}`, e.setAttribute("data-parent-id", F)), y.current = `instance-${crypto.randomUUID()}`;
      const j = a.getState().getShadowMetadata(t._stateKey, t._path) || {}, k = j.signals || [];
      k.push({
        instanceId: y.current,
        parentId: F,
        position: p,
        effect: t._effect
      }), a.getState().setShadowMetadata(t._stateKey, t._path, {
        ...j,
        signals: k
      });
      let N = g;
      if (t._effect)
        try {
          N = new Function(
            "state",
            `return (${t._effect})(state)`
          )(g);
        } catch (S) {
          console.error("Error evaluating effect function:", S);
        }
      N !== null && typeof N == "object" && (N = JSON.stringify(N));
      const G = document.createTextNode(String(N ?? ""));
      T.replaceWith(G), m.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(h), y.current) {
        const e = a.getState().getShadowMetadata(t._stateKey, t._path) || {};
        e.signals && (e.signals = e.signals.filter(
          (s) => s.instanceId !== y.current
        ), a.getState().setShadowMetadata(t._stateKey, t._path, e));
      }
    };
  }, []), st("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": v
  });
}
const vt = Dt(
  zt,
  (t, r) => t.itemPath.join(".") === r.itemPath.join(".") && t.stateKey === r.stateKey && t.itemComponentId === r.itemComponentId && t.localIndex === r.localIndex
), qt = (t) => {
  const [r, y] = X(!1);
  return lt(() => {
    if (!t.current) {
      y(!0);
      return;
    }
    const m = Array.from(t.current.querySelectorAll("img"));
    if (m.length === 0) {
      y(!0);
      return;
    }
    let v = 0;
    const g = () => {
      v++, v === m.length && y(!0);
    };
    return m.forEach((T) => {
      T.complete ? g() : (T.addEventListener("load", g), T.addEventListener("error", g));
    }), () => {
      m.forEach((T) => {
        T.removeEventListener("load", g), T.removeEventListener("error", g);
      });
    };
  }, [t.current]), r;
};
function zt({
  stateKey: t,
  itemComponentId: r,
  itemPath: y,
  localIndex: m,
  arraySetter: v,
  rebuildStateShape: g,
  renderFn: T
}) {
  const [, h] = X({}), { ref: e, inView: s } = $t(), p = q(null), F = qt(p), j = q(!1), k = [t, ...y].join(".");
  Pt(t, r, h);
  const N = ot(
    (W) => {
      p.current = W, e(W);
    },
    [e]
  );
  Z(() => {
    a.getState().subscribeToPath(k, (W) => {
      h({});
    });
  }, []), Z(() => {
    if (!s || !F || j.current)
      return;
    const W = p.current;
    if (W && W.offsetHeight > 0) {
      j.current = !0;
      const J = W.offsetHeight;
      a.getState().setShadowMetadata(t, y, {
        virtualizer: {
          itemHeight: J,
          domRef: W
        }
      });
      const n = y.slice(0, -1), o = [t, ...n].join(".");
      a.getState().notifyPathSubscribers(o, {
        type: "ITEMHEIGHT",
        itemKey: y.join("."),
        ref: p.current
      });
    }
  }, [s, F, t, y]);
  const G = [t, ...y].join("."), S = a.getState().getShadowValue(G);
  if (S === void 0)
    return null;
  const Q = g({
    currentState: S,
    path: y,
    componentId: r
  }), d = T(Q, m, v);
  return /* @__PURE__ */ rt("div", { ref: N, children: d });
}
function Gt({
  stateKey: t,
  path: r,
  rebuildStateShape: y,
  renderFn: m,
  formOpts: v,
  setState: g
}) {
  const [T] = X(() => tt()), [, h] = X({}), e = [t, ...r].join(".");
  Pt(t, T, h);
  const s = a.getState().getShadowValue(e), [p, F] = X(s), j = q(!1), k = q(null);
  Z(() => {
    !j.current && !nt(s, p) && F(s);
  }, [s]), Z(() => {
    const d = a.getState().subscribeToPath(e, (W) => {
      !j.current && p !== W && h({});
    });
    return () => {
      d(), k.current && (clearTimeout(k.current), j.current = !1);
    };
  }, []);
  const N = ot(
    (d) => {
      typeof s === "number" && typeof d == "string" && (d = d === "" ? 0 : Number(d)), F(d), j.current = !0, k.current && clearTimeout(k.current);
      const J = v?.debounceTime ?? 200;
      k.current = setTimeout(() => {
        j.current = !1, g(d, r, { updateType: "update" });
        const { getInitialOptions: n, setShadowMetadata: o, getShadowMetadata: c } = a.getState(), f = n(t)?.validation, l = f?.zodSchemaV4 || f?.zodSchemaV3;
        if (l) {
          const i = a.getState().getShadowValue(t), u = l.safeParse(i), E = c(t, r) || {};
          if (u.success)
            o(t, r, {
              ...E,
              validation: {
                status: "VALID_LIVE",
                validatedValue: d,
                message: void 0
              }
            });
          else {
            const V = ("issues" in u.error ? u.error.issues : u.error.errors).filter(
              (M) => JSON.stringify(M.path) === JSON.stringify(r)
            );
            V.length > 0 ? o(t, r, {
              ...E,
              validation: {
                status: "INVALID_LIVE",
                message: V[0]?.message,
                validatedValue: d
              }
            }) : o(t, r, {
              ...E,
              validation: {
                status: "VALID_LIVE",
                validatedValue: d,
                message: void 0
              }
            });
          }
        }
      }, J), h({});
    },
    [g, r, v?.debounceTime, t]
  ), G = ot(async () => {
    console.log("handleBlur triggered"), k.current && (clearTimeout(k.current), k.current = null, j.current = !1, g(p, r, { updateType: "update" }));
    const { getInitialOptions: d } = a.getState(), W = d(t)?.validation, J = W?.zodSchemaV4 || W?.zodSchemaV3;
    if (!J) return;
    const n = a.getState().getShadowMetadata(t, r);
    a.getState().setShadowMetadata(t, r, {
      ...n,
      validation: {
        status: "DIRTY",
        validatedValue: p
      }
    });
    const o = a.getState().getShadowValue(t), c = J.safeParse(o);
    if (console.log("result ", c), c.success)
      a.getState().setShadowMetadata(t, r, {
        ...n,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: p
        }
      });
    else {
      const f = "issues" in c.error ? c.error.issues : c.error.errors;
      console.log("All validation errors:", f), console.log("Current blur path:", r);
      const l = f.filter((i) => {
        if (console.log("Processing error:", i), r.some((E) => E.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const E = r[0].startsWith("id:") ? [] : r.slice(0, -1);
          console.log("Parent path:", E);
          const w = a.getState().getShadowMetadata(t, E);
          if (console.log("Array metadata:", w), w?.arrayKeys) {
            const V = [t, ...r.slice(0, -1)].join("."), M = w.arrayKeys.indexOf(V);
            console.log("Item key:", V, "Index:", M);
            const _ = [...E, M, ...r.slice(-1)], U = JSON.stringify(i.path) === JSON.stringify(_);
            return console.log("Zod path comparison:", {
              zodPath: _,
              errorPath: i.path,
              match: U
            }), U;
          }
        }
        const u = JSON.stringify(i.path) === JSON.stringify(r);
        return console.log("Direct path comparison:", {
          errorPath: i.path,
          currentPath: r,
          match: u
        }), u;
      });
      console.log("Filtered path errors:", l), a.getState().setShadowMetadata(t, r, {
        ...n,
        validation: {
          status: "VALIDATION_FAILED",
          message: l[0]?.message,
          validatedValue: p
        }
      });
    }
    h({});
  }, [t, r, p, g]), S = y({
    currentState: s,
    path: r,
    componentId: T
  }), Q = new Proxy(S, {
    get(d, W) {
      return W === "inputProps" ? {
        value: p ?? "",
        onChange: (J) => {
          N(J.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: G,
        ref: ht.getState().getFormRef(t + "." + r.join("."))
      } : d[W];
    }
  });
  return /* @__PURE__ */ rt(Vt, { formOpts: v, path: r, stateKey: t, children: m(Q) });
}
function Pt(t, r, y) {
  const m = `${t}////${r}`;
  lt(() => {
    const { registerComponent: v, unregisterComponent: g } = a.getState();
    return v(t, m, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      g(t, m);
    };
  }, [t, m]);
}
export {
  Tt as $cogsSignal,
  ne as addStateOptions,
  Nt as createCogsState,
  oe as createCogsStateFromSync,
  se as notifyComponent,
  Wt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
