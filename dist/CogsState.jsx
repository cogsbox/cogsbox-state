"use client";
import { jsx as ne, Fragment as De } from "react/jsx-runtime";
import { memo as Oe, useState as Q, useRef as z, useCallback as oe, useEffect as Z, useLayoutEffect as le, useMemo as ue, createElement as se, startTransition as Re } from "react";
import { createRoot as be } from "react-dom/client";
import { transformStateFunc as $e, isFunction as ee, isArray as Ie, getDifferences as Ae, isDeepEqual as re } from "./utility.js";
import { ValidationWrapper as Ve } from "./Functions.jsx";
import Ue from "superjson";
import { v4 as te } from "uuid";
import { getGlobalStore as t, formRefStore as he } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
import { useInView as Ne } from "react-intersection-observer";
function ge(e, a) {
  const y = t.getState().getInitialOptions, m = t.getState().setInitialStateOptions, v = y(e) || {};
  m(e, {
    ...v,
    ...a
  });
}
function Me({
  stateKey: e,
  options: a,
  initialOptionsPart: y
}) {
  const m = ae(e) || {}, v = y[e] || {}, I = t.getState().setInitialStateOptions, h = { ...v, ...m };
  let S = !1;
  if (a)
    for (const u in a)
      h.hasOwnProperty(u) ? (u == "localStorage" && a[u] && h[u].key !== a[u]?.key && (S = !0, h[u] = a[u]), u == "defaultState" && a[u] && h[u] !== a[u] && !re(h[u], a[u]) && (S = !0, h[u] = a[u])) : (S = !0, h[u] = a[u]);
  h.syncOptions && (!a || !a.hasOwnProperty("syncOptions")) && (S = !0), S && I(e, h);
}
function ot(e, { formElements: a, validation: y }) {
  return { initialState: e, formElements: a, validation: y };
}
const Fe = (e, a) => {
  let y = e;
  const [m, v] = $e(y);
  a?.__fromSyncSchema && a?.__syncNotifications && t.getState().setInitialStateOptions("__notifications", a.__syncNotifications), a?.__fromSyncSchema && a?.__apiParamsMap && t.getState().setInitialStateOptions("__apiParamsMap", a.__apiParamsMap), Object.keys(m).forEach((S) => {
    let u = v[S] || {};
    const n = {
      ...u
    };
    if (a?.formElements && (n.formElements = {
      ...a.formElements,
      ...u.formElements || {}
    }), a?.validation && (n.validation = {
      ...a.validation,
      ...u.validation || {}
    }, a.validation.key && !u.validation?.key && (n.validation.key = `${a.validation.key}.${S}`)), a?.__syncSchemas?.[S]?.schemas?.validation && (n.validation = {
      zodSchemaV4: a.__syncSchemas[S].schemas.validation,
      ...u.validation
    }), Object.keys(n).length > 0) {
      const l = ae(S);
      l ? t.getState().setInitialStateOptions(S, {
        ...l,
        ...n
      }) : t.getState().setInitialStateOptions(S, n);
    }
  }), Object.keys(m).forEach((S) => {
    t.getState().initializeShadowState(S, m[S]);
  });
  const I = (S, u) => {
    console.time("useCogsState");
    const [n] = Q(u?.componentId ?? te());
    Me({
      stateKey: S,
      options: u,
      initialOptionsPart: v
    });
    const l = t.getState().getShadowValue(S) || m[S], V = u?.modifyState ? u.modifyState(l) : l;
    return console.timeEnd("useCogsState"), We(V, {
      stateKey: S,
      syncUpdate: u?.syncUpdate,
      componentId: n,
      localStorage: u?.localStorage,
      middleware: u?.middleware,
      reactiveType: u?.reactiveType,
      reactiveDeps: u?.reactiveDeps,
      defaultState: u?.defaultState,
      dependencies: u?.dependencies,
      serverState: u?.serverState,
      syncOptions: u?.syncOptions,
      __useSync: a?.__useSync
    });
  };
  function h(S, u) {
    Me({ stateKey: S, options: u, initialOptionsPart: v }), u.localStorage && He(S, u), ve(S);
  }
  return { useCogsState: I, setCogsOptions: h };
};
function st(e, a) {
  const y = e.schemas, m = {}, v = {};
  for (const I in y) {
    const h = y[I];
    m[I] = h?.schemas?.defaultValues || {}, h?.api?.queryData?._paramType && (v[I] = h.api.queryData._paramType);
  }
  return Fe(m, {
    __fromSyncSchema: !0,
    __syncNotifications: e.notifications,
    __apiParamsMap: v,
    __useSync: a,
    __syncSchemas: y
  });
}
const {
  getInitialOptions: ae,
  addStateLog: je,
  updateInitialStateGlobal: Ce
} = t.getState(), Le = (e, a, y, m, v) => {
  y?.log && console.log(
    "saving to localstorage",
    a,
    y.localStorage?.key,
    m
  );
  const I = ee(y?.localStorage?.key) ? y.localStorage?.key(e) : y?.localStorage?.key;
  if (I && m) {
    const h = `${m}-${a}-${I}`;
    let S;
    try {
      S = fe(h)?.lastSyncedWithServer;
    } catch {
    }
    const u = t.getState().getShadowMetadata(a, []), n = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: S,
      stateSource: u?.stateSource,
      baseServerState: u?.baseServerState
    }, l = Ue.serialize(n);
    window.localStorage.setItem(
      h,
      JSON.stringify(l.json)
    );
  }
}, fe = (e) => {
  if (!e) return null;
  try {
    const a = window.localStorage.getItem(e);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, He = (e, a) => {
  const y = t.getState().getShadowValue(e), { sessionId: m } = _e(), v = ee(a?.localStorage?.key) ? a.localStorage.key(y) : a?.localStorage?.key;
  if (v && m) {
    const I = fe(
      `${m}-${e}-${v}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return ve(e), !0;
  }
  return !1;
}, ve = (e) => {
  const a = t.getState().getShadowMetadata(e, []);
  if (!a) return;
  const y = /* @__PURE__ */ new Set();
  a?.components?.forEach((m) => {
    (m ? Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"] : null)?.includes("none") || y.add(() => m.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((m) => m());
  });
}, it = (e, a) => {
  const y = t.getState().getShadowMetadata(e, []);
  if (y) {
    const m = `${e}////${a}`, v = y?.components?.get(m);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
};
function ye(e, a, y, m) {
  const v = t.getState(), I = v.getShadowMetadata(e, a);
  if (v.setShadowMetadata(e, a, {
    ...I,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: m || Date.now()
  }), Array.isArray(y)) {
    const h = v.getShadowMetadata(e, a);
    h?.arrayKeys && h.arrayKeys.forEach((S, u) => {
      const n = S.split(".").slice(1), l = y[u];
      l !== void 0 && ye(
        e,
        n,
        l,
        m
      );
    });
  } else y && typeof y == "object" && y.constructor === Object && Object.keys(y).forEach((h) => {
    const S = [...a, h], u = y[h];
    ye(e, S, u, m);
  });
}
let ce = /* @__PURE__ */ new Map(), me = !1;
function We(e, {
  stateKey: a,
  localStorage: y,
  formElements: m,
  reactiveDeps: v,
  reactiveType: I,
  componentId: h,
  defaultState: S,
  syncUpdate: u,
  dependencies: n,
  serverState: l,
  __useSync: V
} = {}) {
  console.time("useCogsStateFn top");
  const [j, U] = Q({}), { sessionId: O } = _e();
  let B = !a;
  const [f] = Q(a ?? te()), K = z(h ?? te()), L = z(
    null
  );
  L.current = ae(f) ?? null, Z(() => {
    if (u && u.stateKey === f && u.path?.[0]) {
      const c = `${u.stateKey}:${u.path.join(".")}`;
      t.getState().setSyncInfo(c, {
        timeStamp: u.timeStamp,
        userId: u.userId
      });
    }
  }, [u]);
  const g = oe(
    (c) => {
      const s = c ? { ...ae(f), ...c } : ae(f), p = s?.defaultState || S || e;
      if (s?.serverState?.status === "success" && s?.serverState?.data !== void 0)
        return {
          value: s.serverState.data,
          source: "server",
          timestamp: s.serverState.timestamp || Date.now()
        };
      if (s?.localStorage?.key && O) {
        const b = ee(s.localStorage.key) ? s.localStorage.key(p) : s.localStorage.key, A = fe(
          `${O}-${f}-${b}`
        );
        if (A && A.lastUpdated > (s?.serverState?.timestamp || 0))
          return {
            value: A.state,
            source: "localStorage",
            timestamp: A.lastUpdated
          };
      }
      return {
        value: p || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [f, S, e, O]
  );
  Z(() => {
    t.getState().setServerStateUpdate(f, l);
  }, [l, f]), Z(() => t.getState().subscribeToPath(f, (i) => {
    if (i?.type === "SERVER_STATE_UPDATE") {
      const s = i.serverState;
      if (console.log("SERVER_STATE_UPDATE", i), s?.status === "success" && s.data !== void 0) {
        ge(f, { serverState: s });
        const w = typeof s.merge == "object" ? s.merge : s.merge === !0 ? {} : null, b = t.getState().getShadowValue(f), A = s.data;
        if (w && Array.isArray(b) && Array.isArray(A)) {
          const P = w.key, N = new Set(
            b.map((H) => H[P])
          ), F = A.filter((H) => !N.has(H[P]));
          F.length > 0 && F.forEach((H) => {
            t.getState().insertShadowArrayElement(f, [], H);
            const W = t.getState().getShadowMetadata(f, []);
            if (W?.arrayKeys) {
              const C = W.arrayKeys[W.arrayKeys.length - 1];
              if (C) {
                const k = C.split(".").slice(1);
                t.getState().setShadowMetadata(f, k, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: s.timestamp || Date.now()
                });
                const R = t.getState().getShadowValue(C);
                R && typeof R == "object" && !Array.isArray(R) && Object.keys(R).forEach((T) => {
                  const M = [...k, T];
                  t.getState().setShadowMetadata(f, M, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: s.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          t.getState().initializeShadowState(f, A), ye(
            f,
            [],
            A,
            s.timestamp
          );
        const E = t.getState().getShadowMetadata(f, []);
        t.getState().setShadowMetadata(f, [], {
          ...E,
          stateSource: "server",
          lastServerSync: s.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [f, g]), Z(() => {
    const c = t.getState().getShadowMetadata(f, []);
    if (c && c.stateSource)
      return;
    const i = ae(f);
    if (i?.defaultState !== void 0 || S !== void 0) {
      const s = i?.defaultState || S;
      i?.defaultState || ge(f, {
        defaultState: s
      });
      const { value: p, source: w, timestamp: b } = g();
      t.getState().initializeShadowState(f, p), t.getState().setShadowMetadata(f, [], {
        stateSource: w,
        lastServerSync: w === "server" ? b : void 0,
        isDirty: !1,
        baseServerState: w === "server" ? p : void 0
      }), ve(f);
    }
  }, [f, ...n || []]), le(() => {
    B && ge(f, {
      formElements: m,
      defaultState: S,
      localStorage: y,
      middleware: L.current?.middleware
    });
    const c = `${f}////${K.current}`, i = t.getState().getShadowMetadata(f, []), s = i?.components || /* @__PURE__ */ new Map();
    return s.set(c, {
      forceUpdate: () => U({}),
      reactiveType: I ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: v || void 0,
      deps: v ? v(t.getState().getShadowValue(f)) : [],
      prevDeps: v ? v(t.getState().getShadowValue(f)) : []
    }), t.getState().setShadowMetadata(f, [], {
      ...i,
      components: s
    }), U({}), () => {
      const p = t.getState().getShadowMetadata(f, []), w = p?.components?.get(c);
      w?.paths && w.paths.forEach((b) => {
        const E = b.split(".").slice(1), P = t.getState().getShadowMetadata(f, E);
        P?.pathComponents && P.pathComponents.size === 0 && (delete P.pathComponents, t.getState().setShadowMetadata(f, E, P));
      }), p?.components && t.getState().setShadowMetadata(f, [], p);
    };
  }, []);
  const J = z(null);
  console.timeEnd("useCogsStateFn top");
  const X = (c, i, s) => {
    console.time("top of effectiveSetState");
    const p = [f, ...i].join("."), w = t.getState(), b = w.getShadowMetadata(f, i), A = w.getShadowValue(p);
    console.timeEnd("top of effectiveSetState"), console.time("top of payload");
    const E = s.updateType === "insert" && ee(c) ? c({ state: A, uuid: te() }) : ee(c) ? c(A) : c, N = {
      timeStamp: Date.now(),
      stateKey: f,
      path: i,
      updateType: s.updateType,
      status: "new",
      oldValue: A,
      newValue: E
    };
    switch (console.timeEnd("top of payload"), console.time("switch in effectiveSetState"), s.updateType) {
      case "insert": {
        w.insertShadowArrayElement(f, i, N.newValue), w.markAsDirty(f, i, { bubble: !0 });
        const C = b;
        if (C?.arrayKeys) {
          const k = C.arrayKeys[C.arrayKeys.length - 1];
          if (k) {
            const R = k.split(".").slice(1);
            w.markAsDirty(f, R, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const C = i.slice(0, -1);
        w.removeShadowArrayElement(f, i), w.markAsDirty(f, C, { bubble: !0 });
        break;
      }
      case "update": {
        w.updateShadowAtPath(f, i, N.newValue), w.markAsDirty(f, i, { bubble: !0 });
        break;
      }
    }
    console.timeEnd("switch in effectiveSetState");
    const F = s.sync !== !1;
    if (console.time("signals"), F && J.current && J.current.connected && J.current.updateState({ operation: N }), b?.signals && b.signals.length > 0) {
      const C = s.updateType === "cut" ? null : E;
      b.signals.forEach(({ parentId: k, position: R, effect: T }) => {
        const M = document.querySelector(`[data-parent-id="${k}"]`);
        if (M) {
          const $ = Array.from(M.childNodes);
          if ($[R]) {
            let D = C;
            if (T && C !== null)
              try {
                D = new Function(
                  "state",
                  `return (${T})(state)`
                )(C);
              } catch (_) {
                console.error("Error evaluating effect function:", _);
              }
            D != null && typeof D == "object" && (D = JSON.stringify(D)), $[R].textContent = String(D ?? "");
          }
        }
      });
    }
    if (s.updateType === "insert" && b?.mapWrappers && b.mapWrappers.length > 0) {
      const C = w.getShadowMetadata(f, i)?.arrayKeys || [], k = C[C.length - 1], R = w.getShadowValue(k), T = w.getShadowValue(
        [f, ...i].join(".")
      );
      if (!k || R === void 0) return;
      b.mapWrappers.forEach((M) => {
        let $ = !0, D = -1;
        if (M.meta?.transforms && M.meta.transforms.length > 0) {
          for (const _ of M.meta.transforms)
            if (_.type === "filter" && !_.fn(R, -1)) {
              $ = !1;
              break;
            }
          if ($) {
            const _ = pe(
              f,
              i,
              M.meta.transforms
            ), q = M.meta.transforms.find(
              (x) => x.type === "sort"
            );
            if (q) {
              const x = _.map((G) => ({
                key: G,
                value: w.getShadowValue(G)
              }));
              x.push({ key: k, value: R }), x.sort((G, Y) => q.fn(G.value, Y.value)), D = x.findIndex(
                (G) => G.key === k
              );
            } else
              D = _.length;
          }
        } else
          $ = !0, D = C.length - 1;
        if ($ && M.containerRef && M.containerRef.isConnected) {
          const _ = document.createElement("div");
          _.setAttribute("data-item-path", k);
          const q = Array.from(M.containerRef.children);
          D >= 0 && D < q.length ? M.containerRef.insertBefore(
            _,
            q[D]
          ) : M.containerRef.appendChild(_);
          const x = be(_), G = te(), Y = k.split(".").slice(1), ie = M.rebuildStateShape({
            path: M.path,
            currentState: T,
            componentId: M.componentId,
            meta: M.meta
          });
          x.render(
            se(we, {
              stateKey: f,
              itemComponentId: G,
              itemPath: Y,
              localIndex: D,
              arraySetter: ie,
              rebuildStateShape: M.rebuildStateShape,
              renderFn: M.mapFn
            })
          );
        }
      });
    }
    if (s.updateType === "cut") {
      const C = i.slice(0, -1), k = w.getShadowMetadata(f, C);
      k?.mapWrappers && k.mapWrappers.length > 0 && k.mapWrappers.forEach((R) => {
        if (R.containerRef && R.containerRef.isConnected) {
          const T = R.containerRef.querySelector(
            `[data-item-path="${p}"]`
          );
          T && T.remove();
        }
      });
    }
    console.timeEnd("signals"), console.time("notify");
    const H = w.getShadowMetadata(f, []), W = /* @__PURE__ */ new Set();
    if (H?.components) {
      if (s.updateType === "update") {
        let C = [...i];
        for (; ; ) {
          const k = w.getShadowMetadata(f, C);
          if (k?.pathComponents && k.pathComponents.forEach((R) => {
            if (W.has(R))
              return;
            const T = H.components?.get(R);
            T && ((Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"]).includes("none") || (T.forceUpdate(), W.add(R)));
          }), C.length === 0)
            break;
          C.pop();
        }
        E && typeof E == "object" && !Ie(E) && A && typeof A == "object" && !Ie(A) && Ae(E, A).forEach((R) => {
          const T = R.split("."), M = [...i, ...T], $ = w.getShadowMetadata(f, M);
          $?.pathComponents && $.pathComponents.forEach((D) => {
            if (W.has(D))
              return;
            const _ = H.components?.get(D);
            _ && ((Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"]).includes("none") || (_.forceUpdate(), W.add(D)));
          });
        });
      } else if (s.updateType === "insert" || s.updateType === "cut") {
        const C = s.updateType === "insert" ? i : i.slice(0, -1), k = w.getShadowMetadata(f, C);
        if (k?.signals && k.signals.length > 0) {
          const R = [f, ...C].join("."), T = w.getShadowValue(R);
          k.signals.forEach(({ parentId: M, position: $, effect: D }) => {
            const _ = document.querySelector(
              `[data-parent-id="${M}"]`
            );
            if (_) {
              const q = Array.from(_.childNodes);
              if (q[$]) {
                let x = T;
                if (D)
                  try {
                    x = new Function(
                      "state",
                      `return (${D})(state)`
                    )(T);
                  } catch (G) {
                    console.error("Error evaluating effect function:", G), x = T;
                  }
                x != null && typeof x == "object" && (x = JSON.stringify(x)), q[$].textContent = String(x ?? "");
              }
            }
          });
        }
        k?.pathComponents && k.pathComponents.forEach((R) => {
          if (!W.has(R)) {
            const T = H.components?.get(R);
            T && (T.forceUpdate(), W.add(R));
          }
        });
      }
      H.components.forEach((C, k) => {
        if (W.has(k))
          return;
        const R = Array.isArray(C.reactiveType) ? C.reactiveType : [C.reactiveType || "component"];
        if (R.includes("all")) {
          C.forceUpdate(), W.add(k);
          return;
        }
        if (R.includes("deps") && C.depsFunction) {
          const T = w.getShadowValue(f), M = C.depsFunction(T);
          let $ = !1;
          M === !0 ? $ = !0 : Array.isArray(M) && (re(C.prevDeps, M) || (C.prevDeps = M, $ = !0)), $ && (C.forceUpdate(), W.add(k));
        }
      }), W.clear(), console.timeEnd("notify"), console.time("end stuff"), je(f, N), Le(
        E,
        f,
        L.current,
        O
      ), L.current?.middleware && L.current.middleware({
        update: N
      }), console.timeEnd("end stuff");
    }
  };
  t.getState().initialStateGlobal[f] || Ce(f, e);
  const r = ue(() => {
    console.time("createProxyHandler");
    const c = Pe(
      f,
      X,
      K.current,
      O
    );
    return console.timeEnd("createProxyHandler"), c;
  }, [f, O]), o = V, d = L.current?.syncOptions;
  return o && (J.current = o(
    r,
    d ?? {}
  )), r;
}
function xe(e) {
  return !e || e.length === 0 ? "" : e.map(
    (a) => `${a.type}${JSON.stringify(a.dependencies || [])}`
  ).join("");
}
const pe = (e, a, y) => {
  let m = t.getState().getShadowMetadata(e, a)?.arrayKeys || [];
  if (!y || y.length === 0)
    return m;
  let v = m.map((I) => ({
    key: I,
    value: t.getState().getShadowValue(I)
  }));
  for (const I of y)
    I.type === "filter" ? v = v.filter(
      ({ value: h }, S) => I.fn(h, S)
    ) : I.type === "sort" && v.sort((h, S) => I.fn(h.value, S.value));
  return v.map(({ key: I }) => I);
}, Te = (e, a, y) => {
  const m = `${e}////${a}`, { addPathComponent: v, getShadowMetadata: I } = t.getState(), S = I(e, [])?.components?.get(m);
  !S || S.reactiveType === "none" || !(Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType]).includes("component") || v(e, y, m);
}, de = (e, a, y) => {
  const m = t.getState(), v = m.getShadowMetadata(e, []), I = /* @__PURE__ */ new Set();
  v?.components && v.components.forEach((S, u) => {
    (Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"]).includes("all") && (S.forceUpdate(), I.add(u));
  }), m.getShadowMetadata(e, [...a, "getSelected"])?.pathComponents?.forEach((S) => {
    v?.components?.get(S)?.forceUpdate();
  });
  const h = m.getShadowMetadata(e, a);
  for (let S of h?.arrayKeys || []) {
    const u = S + ".selected", n = m.getShadowMetadata(
      e,
      u.split(".").slice(1)
    );
    S == y && n?.pathComponents?.forEach((l) => {
      v?.components?.get(l)?.forceUpdate();
    });
  }
};
function Pe(e, a, y, m) {
  const v = /* @__PURE__ */ new Map();
  console.time("rebuildStateShape Outer");
  let I = null;
  function h({
    path: n = [],
    meta: l,
    componentId: V
  }) {
    console.time("rebuildStateShape Inner");
    const j = l ? JSON.stringify(l.validIds || l.transforms) : "", U = n.join(".") + ":" + j;
    if (console.log("PROXY CACHE KEY ", U), v.has(U))
      return console.log("PROXY CACHE HIT"), v.get(U);
    const O = [e, ...n].join("."), B = function() {
      return t().getShadowValue(e, n);
    }, f = {
      apply(L, g, J) {
      },
      get(L, g) {
        if (n.length === 0 && (I = `Recursion-${Math.random()}`, console.time(I)), g === "_rebuildStateShape")
          return h;
        if (Object.getOwnPropertyNames(S).includes(g) && n.length === 0)
          return S[g];
        if (g === "getDifferences")
          return () => {
            const r = t.getState().getShadowMetadata(e, []), o = t.getState().getShadowValue(e);
            let d;
            return r?.stateSource === "server" && r.baseServerState ? d = r.baseServerState : d = t.getState().initialStateGlobal[e], Ae(o, d);
          };
        if (g === "sync" && n.length === 0)
          return async function() {
            const r = t.getState().getInitialOptions(e), o = r?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const d = t.getState().getShadowValue(e, []), c = r?.validation?.key;
            try {
              const i = await o.action(d);
              if (i && !i.success && i.errors, i?.success) {
                const s = t.getState().getShadowMetadata(e, []);
                t.getState().setShadowMetadata(e, [], {
                  ...s,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: d
                  // Update base server state
                }), o.onSuccess && o.onSuccess(i.data);
              } else !i?.success && o.onError && o.onError(i.error);
              return i;
            } catch (i) {
              return o.onError && o.onError(i), { success: !1, error: i };
            }
          };
        if (g === "_status" || g === "getStatus") {
          const r = () => {
            const o = t.getState().getShadowMetadata(e, n), d = t.getState().getShadowValue(O);
            return o?.isDirty === !0 ? "dirty" : o?.isDirty === !1 || o?.stateSource === "server" ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" ? "fresh" : t.getState().getShadowMetadata(e, [])?.stateSource === "server" && !o?.isDirty ? "synced" : d !== void 0 && !o ? "fresh" : "unknown";
          };
          return g === "_status" ? r() : r;
        }
        if (g === "removeStorage")
          return () => {
            const r = t.getState().initialStateGlobal[e], o = ae(e), d = ee(o?.localStorage?.key) ? o.localStorage.key(r) : o?.localStorage?.key, c = `${m}-${e}-${d}`;
            c && localStorage.removeItem(c);
          };
        if (g === "showValidationErrors")
          return () => {
            const r = t.getState().getShadowMetadata(e, n);
            return r?.validation?.status === "VALIDATION_FAILED" && r.validation.message ? [r.validation.message] : [];
          };
        if (g === "getSelected")
          return () => {
            const r = e + "." + n.join(".");
            Te(e, V, [
              ...n,
              "getSelected"
            ]);
            const o = t.getState().selectedIndicesMap;
            if (!o || !o.has(r))
              return;
            const d = o.get(r);
            if (!(l?.validIds && !l.validIds.includes(d) || !t.getState().getShadowValue(d)))
              return h({
                path: d.split(".").slice(1),
                componentId: V
              });
          };
        if (g === "getSelectedIndex")
          return () => t.getState().getSelectedIndex(
            e + "." + n.join("."),
            l?.validIds
          );
        if (g === "clearSelected")
          return de(e, n), () => {
            t.getState().clearSelectedIndex({
              arrayKey: e + "." + n.join(".")
            });
          };
        if (g === "useVirtualView")
          return (r) => {
            const {
              itemHeight: o = 50,
              overscan: d = 6,
              stickToBottom: c = !1,
              scrollStickTolerance: i = 75
            } = r, s = z(null), [p, w] = Q({
              startIndex: 0,
              endIndex: 10
            }), [b, A] = Q({}), E = z(!0), P = z({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), N = z(
              /* @__PURE__ */ new Map()
            );
            le(() => {
              if (!c || !s.current || P.current.isUserScrolling)
                return;
              const T = s.current;
              T.scrollTo({
                top: T.scrollHeight,
                behavior: E.current ? "instant" : "smooth"
              });
            }, [b, c]);
            const F = t.getState().getShadowMetadata(e, n)?.arrayKeys || [], { totalHeight: H, itemOffsets: W } = ue(() => {
              let T = 0;
              const M = /* @__PURE__ */ new Map();
              return (t.getState().getShadowMetadata(e, n)?.arrayKeys || []).forEach((D) => {
                const _ = D.split(".").slice(1), q = t.getState().getShadowMetadata(e, _)?.virtualizer?.itemHeight || o;
                M.set(D, {
                  height: q,
                  offset: T
                }), T += q;
              }), N.current = M, { totalHeight: T, itemOffsets: M };
            }, [F.length, o]);
            le(() => {
              if (c && F.length > 0 && s.current && !P.current.isUserScrolling && E.current) {
                const T = s.current, M = () => {
                  if (T.clientHeight > 0) {
                    const $ = Math.ceil(
                      T.clientHeight / o
                    ), D = F.length - 1, _ = Math.max(
                      0,
                      D - $ - d
                    );
                    w({ startIndex: _, endIndex: D }), requestAnimationFrame(() => {
                      k("instant"), E.current = !1;
                    });
                  } else
                    requestAnimationFrame(M);
                };
                M();
              }
            }, [F.length, c, o, d]);
            const C = oe(() => {
              const T = s.current;
              if (!T) return;
              const M = T.scrollTop, { scrollHeight: $, clientHeight: D } = T, _ = P.current, q = $ - (M + D), x = _.isNearBottom;
              _.isNearBottom = q <= i, M < _.lastScrollTop ? (_.scrollUpCount++, _.scrollUpCount > 3 && x && (_.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : _.isNearBottom && (_.isUserScrolling = !1, _.scrollUpCount = 0), _.lastScrollTop = M;
              let G = 0;
              for (let Y = 0; Y < F.length; Y++) {
                const ie = F[Y], Se = N.current.get(ie);
                if (Se && Se.offset + Se.height > M) {
                  G = Y;
                  break;
                }
              }
              if (G !== p.startIndex) {
                const Y = Math.ceil(D / o);
                w({
                  startIndex: Math.max(0, G - d),
                  endIndex: Math.min(
                    F.length - 1,
                    G + Y + d
                  )
                });
              }
            }, [
              F.length,
              p.startIndex,
              o,
              d,
              i
            ]);
            Z(() => {
              const T = s.current;
              if (!(!T || !c))
                return T.addEventListener("scroll", C, {
                  passive: !0
                }), () => {
                  T.removeEventListener("scroll", C);
                };
            }, [C, c]);
            const k = oe(
              (T = "smooth") => {
                const M = s.current;
                if (!M) return;
                P.current.isUserScrolling = !1, P.current.isNearBottom = !0, P.current.scrollUpCount = 0;
                const $ = () => {
                  const D = (_ = 0) => {
                    if (_ > 5) return;
                    const q = M.scrollHeight, x = M.scrollTop, G = M.clientHeight;
                    x + G >= q - 1 || (M.scrollTo({
                      top: q,
                      behavior: T
                    }), setTimeout(() => {
                      const Y = M.scrollHeight, ie = M.scrollTop;
                      (Y !== q || ie + G < Y - 1) && D(_ + 1);
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
              if (!c || !s.current) return;
              const T = s.current, M = P.current;
              let $;
              const D = () => {
                clearTimeout($), $ = setTimeout(() => {
                  !M.isUserScrolling && M.isNearBottom && k(
                    E.current ? "instant" : "smooth"
                  );
                }, 100);
              }, _ = new MutationObserver(() => {
                M.isUserScrolling || D();
              });
              _.observe(T, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
                // More specific than just 'height'
              });
              const q = (x) => {
                x.target instanceof HTMLImageElement && !M.isUserScrolling && D();
              };
              return T.addEventListener("load", q, !0), E.current ? setTimeout(() => {
                k("instant");
              }, 0) : D(), () => {
                clearTimeout($), _.disconnect(), T.removeEventListener("load", q, !0);
              };
            }, [c, F.length, k]), {
              virtualState: ue(() => {
                const T = t.getState(), M = T.getShadowValue(
                  [e, ...n].join(".")
                ), $ = T.getShadowMetadata(e, n)?.arrayKeys || [];
                M.slice(
                  p.startIndex,
                  p.endIndex + 1
                );
                const D = $.slice(
                  p.startIndex,
                  p.endIndex + 1
                );
                return h({
                  path: n,
                  componentId: V,
                  meta: { ...l, validIds: D }
                });
              }, [p.startIndex, p.endIndex, F.length]),
              virtualizerProps: {
                outer: {
                  ref: s,
                  style: {
                    overflowY: "auto",
                    height: "100%",
                    position: "relative"
                  }
                },
                inner: {
                  style: {
                    height: `${H}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${N.current.get(F[p.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: k,
              scrollToIndex: (T, M = "smooth") => {
                if (s.current && F[T]) {
                  const $ = N.current.get(F[T])?.offset || 0;
                  s.current.scrollTo({ top: $, behavior: M });
                }
              }
            };
          };
        if (g === "stateMap")
          return (r) => {
            const [o, d] = Q(
              l?.validIds ?? t.getState().getShadowMetadata(e, n)?.arrayKeys
            ), c = t.getState().getShadowValue(O, l?.validIds);
            if (!o)
              throw new Error("No array keys found for mapping");
            const i = h({
              path: n,
              componentId: V,
              meta: l
            });
            return c.map((s, p) => {
              const w = o[p]?.split(".").slice(1), b = h({
                path: w,
                componentId: V,
                meta: l
              });
              return r(
                b,
                p,
                i
              );
            });
          };
        if (g === "$stateMap")
          return (r) => se(Be, {
            proxy: {
              _stateKey: e,
              _path: n,
              _mapFn: r,
              _meta: l
            },
            rebuildStateShape: h
          });
        if (g === "stateFind")
          return (r) => {
            const o = l?.validIds ?? t.getState().getShadowMetadata(e, n)?.arrayKeys;
            if (o)
              for (let d = 0; d < o.length; d++) {
                const c = o[d];
                if (!c) continue;
                const i = t.getState().getShadowValue(c);
                if (r(i, d)) {
                  const s = c.split(".").slice(1);
                  return h({
                    path: s,
                    componentId: V,
                    meta: l
                    // Pass along meta for potential further chaining
                  });
                }
              }
          };
        if (g === "stateFilter")
          return (r) => {
            const o = t.getState().getShadowValue([e, ...n].join("."), l?.validIds);
            if (!Array.isArray(o)) return [];
            const d = l?.validIds ?? t.getState().getShadowMetadata(e, n)?.arrayKeys;
            if (!d)
              throw new Error("No array keys found for filtering.");
            const c = [];
            return o.filter(
              (i, s) => r(i, s) ? (c.push(d[s]), !0) : !1
            ), h({
              path: n,
              componentId: V,
              meta: {
                validIds: c,
                transforms: [
                  ...l?.transforms || [],
                  {
                    type: "filter",
                    fn: r
                  }
                ]
              }
            });
          };
        if (g === "stateSort")
          return (r) => {
            const o = t.getState().getShadowValue([e, ...n].join("."), l?.validIds);
            if (!Array.isArray(o)) return [];
            const d = l?.validIds ?? t.getState().getShadowMetadata(e, n)?.arrayKeys;
            if (!d)
              throw new Error("No array keys found for sorting");
            const c = o.map((i, s) => ({
              item: i,
              key: d[s]
            }));
            return c.sort((i, s) => r(i.item, s.item)).filter(Boolean), h({
              path: n,
              componentId: V,
              meta: {
                validIds: c.map((i) => i.key),
                transforms: [
                  ...l?.transforms || [],
                  { type: "sort", fn: r }
                ]
              }
            });
          };
        if (g === "stream")
          return function(r = {}) {
            const {
              bufferSize: o = 100,
              flushInterval: d = 100,
              bufferStrategy: c = "accumulate",
              store: i,
              onFlush: s
            } = r;
            let p = [], w = !1, b = null;
            const A = (H) => {
              if (!w) {
                if (c === "sliding" && p.length >= o)
                  p.shift();
                else if (c === "dropping" && p.length >= o)
                  return;
                p.push(H), p.length >= o && E();
              }
            }, E = () => {
              if (p.length === 0) return;
              const H = [...p];
              if (p = [], i) {
                const W = i(H);
                W !== void 0 && (Array.isArray(W) ? W : [W]).forEach((k) => {
                  a(k, n, {
                    updateType: "insert"
                  });
                });
              } else
                H.forEach((W) => {
                  a(W, n, {
                    updateType: "insert"
                  });
                });
              s?.(H);
            };
            d > 0 && (b = setInterval(E, d));
            const P = te(), N = t.getState().getShadowMetadata(e, n) || {}, F = N.streams || /* @__PURE__ */ new Map();
            return F.set(P, { buffer: p, flushTimer: b }), t.getState().setShadowMetadata(e, n, {
              ...N,
              streams: F
            }), {
              write: (H) => A(H),
              writeMany: (H) => H.forEach(A),
              flush: () => E(),
              pause: () => {
                w = !0;
              },
              resume: () => {
                w = !1, p.length > 0 && E();
              },
              close: () => {
                E(), b && clearInterval(b);
                const H = t.getState().getShadowMetadata(e, n);
                H?.streams && H.streams.delete(P);
              }
            };
          };
        if (g === "stateList")
          return (r) => /* @__PURE__ */ ne(() => {
            const d = z(/* @__PURE__ */ new Map()), c = l?.transforms && l.transforms.length > 0 ? `${V}-${xe(l.transforms)}` : `${V}-base`, [i, s] = Q({}), { validIds: p, arrayValues: w } = ue(() => {
              const A = t.getState().getShadowMetadata(e, n)?.transformCaches?.get(c);
              let E;
              A && A.validIds ? E = A.validIds : (E = pe(
                e,
                n,
                l?.transforms
              ), t.getState().setTransformCache(e, n, c, {
                validIds: E,
                computedAt: Date.now(),
                transforms: l?.transforms || []
              }));
              const P = t.getState().getShadowValue(O, E);
              return {
                validIds: E,
                arrayValues: P || []
              };
            }, [c, i]);
            if (Z(() => {
              const A = t.getState().subscribeToPath(O, (E) => {
                if (E.type === "GET_SELECTED")
                  return;
                const N = t.getState().getShadowMetadata(e, n)?.transformCaches;
                if (N)
                  for (const F of N.keys())
                    F.startsWith(V) && N.delete(F);
                (E.type === "INSERT" || E.type === "REMOVE" || E.type === "CLEAR_SELECTION") && s({});
              });
              return () => {
                A();
              };
            }, [V, O]), !Array.isArray(w))
              return null;
            const b = h({
              path: n,
              componentId: V,
              meta: {
                ...l,
                validIds: p
              }
            });
            return /* @__PURE__ */ ne(De, { children: w.map((A, E) => {
              const P = p[E];
              if (!P)
                return null;
              let N = d.current.get(P);
              N || (N = te(), d.current.set(P, N));
              const F = P.split(".").slice(1);
              return se(we, {
                key: P,
                stateKey: e,
                itemComponentId: N,
                itemPath: F,
                localIndex: E,
                arraySetter: b,
                rebuildStateShape: h,
                renderFn: r
              });
            }) });
          }, {});
        if (g === "stateFlattenOn")
          return (r) => {
            const o = t.getState().getShadowValue([e, ...n].join("."), l?.validIds);
            return Array.isArray(o) ? (o.flatMap(
              (c) => c[r] ?? []
            ), h({
              path: [...n, "[*]", r],
              componentId: V,
              meta: l
            })) : [];
          };
        if (g === "index")
          return (r) => {
            const d = t.getState().getShadowMetadata(e, n)?.arrayKeys?.filter(
              (i) => !l?.validIds || l?.validIds && l?.validIds?.includes(i)
            )?.[r];
            return d ? (t.getState().getShadowValue(d, l?.validIds), h({
              path: d.split(".").slice(1),
              componentId: V,
              meta: l
            })) : void 0;
          };
        if (g === "last")
          return () => {
            const r = t.getState().getShadowValue(e, n);
            if (r.length === 0) return;
            const o = r.length - 1;
            r[o];
            const d = [...n, o.toString()];
            return h({
              path: d,
              componentId: V,
              meta: l
            });
          };
        if (g === "insert")
          return (r, o) => (a(r, n, { updateType: "insert" }), h({
            path: n,
            componentId: V,
            meta: l
          }));
        if (g === "uniqueInsert")
          return (r, o, d) => {
            const c = t.getState().getShadowValue(e, n), i = ee(r) ? r(c) : r;
            let s = null;
            if (!c.some((w) => {
              const b = o ? o.every(
                (A) => re(w[A], i[A])
              ) : re(w, i);
              return b && (s = w), b;
            }))
              a(i, n, { updateType: "insert" });
            else if (d && s) {
              const w = d(s), b = c.map(
                (A) => re(A, s) ? w : A
              );
              a(b, n, {
                updateType: "update"
              });
            }
          };
        if (g === "cut")
          return (r, o) => {
            const d = t.getState().getShadowValue([e, ...n].join("."), l?.validIds), c = l?.validIds ?? t.getState().getShadowMetadata(e, n)?.arrayKeys;
            if (!c || c.length === 0) return;
            const i = r == -1 ? c.length - 1 : r !== void 0 ? r : c.length - 1, s = c[i];
            if (!s) return;
            const p = s.split(".").slice(1);
            a(d, p, {
              updateType: "cut"
            });
          };
        if (g === "cutSelected")
          return () => {
            const r = pe(e, n, l?.transforms), o = t.getState().getShadowValue([e, ...n].join("."), l?.validIds);
            if (!r || r.length === 0) return;
            const d = t.getState().selectedIndicesMap.get(O);
            let c = r.findIndex(
              (p) => p === d
            );
            const i = r[c == -1 ? r.length - 1 : c]?.split(".").slice(1);
            t.getState().clearSelectedIndex({ arrayKey: O });
            const s = i?.slice(0, -1);
            de(e, s), a(o, i, {
              updateType: "cut"
            });
          };
        if (g === "cutByValue")
          return (r) => {
            const o = t.getState().getShadowMetadata(e, n), d = l?.validIds ?? o?.arrayKeys;
            if (!d) return;
            let c = null;
            for (const i of d)
              if (t.getState().getShadowValue(i) === r) {
                c = i;
                break;
              }
            if (c) {
              const i = c.split(".").slice(1);
              a(null, i, { updateType: "cut" });
            }
          };
        if (g === "toggleByValue")
          return (r) => {
            const o = t.getState().getShadowMetadata(e, n), d = l?.validIds ?? o?.arrayKeys;
            if (!d) return;
            let c = null;
            for (const i of d) {
              const s = t.getState().getShadowValue(i);
              if (console.log("itemValue sdasdasdasd", s), s === r) {
                c = i;
                break;
              }
            }
            if (console.log("itemValue keyToCut", c), c) {
              const i = c.split(".").slice(1);
              console.log("itemValue keyToCut", c), a(r, i, {
                updateType: "cut"
              });
            } else
              a(r, n, { updateType: "insert" });
          };
        if (g === "findWith")
          return (r, o) => {
            const d = t.getState().getShadowMetadata(e, n)?.arrayKeys;
            if (!d)
              throw new Error("No array keys found for sorting");
            let c = [];
            for (const i of d) {
              let s = t.getState().getShadowValue(i, l?.validIds);
              if (s && s[r] === o) {
                c = i.split(".").slice(1);
                break;
              }
            }
            return h({
              path: c,
              componentId: V,
              meta: l
            });
          };
        if (g === "cutThis") {
          let r = t.getState().getShadowValue(n.join("."));
          return () => {
            a(r, n, { updateType: "cut" });
          };
        }
        if (g === "get")
          return () => (Te(e, V, n), t.getState().getShadowValue(O, l?.validIds));
        if (g === "getState")
          return () => t.getState().getShadowValue(O, l?.validIds);
        if (g === "$derive")
          return (r) => Ee({
            _stateKey: e,
            _path: n,
            _effect: r.toString(),
            _meta: l
          });
        if (g === "$get")
          return () => Ee({ _stateKey: e, _path: n, _meta: l });
        if (g === "lastSynced") {
          const r = `${e}:${n.join(".")}`;
          return t.getState().getSyncInfo(r);
        }
        if (g == "getLocalStorage")
          return (r) => fe(m + "-" + e + "-" + r);
        if (g === "isSelected") {
          const r = [e, ...n].slice(0, -1);
          if (de(e, n, void 0), Array.isArray(
            t.getState().getShadowValue(r.join("."), l?.validIds)
          )) {
            n[n.length - 1];
            const o = r.join("."), d = t.getState().selectedIndicesMap.get(o), c = e + "." + n.join(".");
            return d === c;
          }
          return;
        }
        if (g === "setSelected")
          return (r) => {
            const o = n.slice(0, -1), d = e + "." + o.join("."), c = e + "." + n.join(".");
            de(e, o, void 0), t.getState().selectedIndicesMap.get(d), r && t.getState().setSelectedIndex(d, c);
          };
        if (g === "toggleSelected")
          return () => {
            const r = n.slice(0, -1), o = e + "." + r.join("."), d = e + "." + n.join(".");
            t.getState().selectedIndicesMap.get(o) === d ? t.getState().clearSelectedIndex({ arrayKey: o }) : t.getState().setSelectedIndex(o, d);
          };
        if (g === "_componentId")
          return V;
        if (n.length == 0) {
          if (g === "addZodValidation")
            return (r) => {
              t.getState().getInitialOptions(e)?.validation, r.forEach((o) => {
                const d = t.getState().getShadowMetadata(e, o.path) || {};
                t.getState().setShadowMetadata(e, o.path, {
                  ...d,
                  validation: {
                    status: "VALIDATION_FAILED",
                    message: o.message,
                    validatedValue: void 0
                  }
                }), t.getState().notifyPathSubscribers(o.path, {
                  type: "VALIDATION_FAILED",
                  message: o.message,
                  validatedValue: void 0
                });
              });
            };
          if (g === "clearZodValidation")
            return (r) => {
              if (!r)
                throw new Error("clearZodValidation requires a path");
              const o = t.getState().getShadowMetadata(e, r) || {};
              o.validation && (t.getState().setShadowMetadata(e, r, {
                ...o,
                validation: void 0
              }), t.getState().notifyPathSubscribers([e, ...r].join("."), {
                type: "VALIDATION_CLEARED"
              }));
            };
          if (g === "applyJsonPatch")
            return (r) => {
              const o = t.getState(), d = o.getShadowMetadata(e, []);
              if (!d?.components) return;
              const c = (s) => !s || s === "/" ? [] : s.split("/").slice(1).map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~")), i = /* @__PURE__ */ new Set();
              for (const s of r) {
                const p = c(s.path);
                switch (s.op) {
                  case "add":
                  case "replace": {
                    const { value: w } = s;
                    o.updateShadowAtPath(e, p, w), o.markAsDirty(e, p, { bubble: !0 });
                    let b = [...p];
                    for (; ; ) {
                      const A = o.getShadowMetadata(
                        e,
                        b
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((E) => {
                        if (!i.has(E)) {
                          const P = d.components?.get(E);
                          P && (P.forceUpdate(), i.add(E));
                        }
                      }), b.length === 0) break;
                      b.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const w = p.slice(0, -1);
                    o.removeShadowArrayElement(e, p), o.markAsDirty(e, w, { bubble: !0 });
                    let b = [...w];
                    for (; ; ) {
                      const A = o.getShadowMetadata(
                        e,
                        b
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((E) => {
                        if (!i.has(E)) {
                          const P = d.components?.get(E);
                          P && (P.forceUpdate(), i.add(E));
                        }
                      }), b.length === 0) break;
                      b.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (g === "getComponents")
            return () => t.getState().getShadowMetadata(e, [])?.components;
          if (g === "getAllFormRefs")
            return () => he.getState().getFormRefsByStateKey(e);
        }
        if (g === "getFormRef")
          return () => he.getState().getFormRef(e + "." + n.join("."));
        if (g === "validationWrapper")
          return ({
            children: r,
            hideMessage: o
          }) => /* @__PURE__ */ ne(
            Ve,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: n,
              stateKey: e,
              children: r
            }
          );
        if (g === "_stateKey") return e;
        if (g === "_path") return n;
        if (g === "update")
          return I && (console.timeEnd(I), I = null), (r) => {
            const d = new Error().stack || "";
            if (d.includes("onClick") || d.includes("dispatchEvent") || d.includes("batchedUpdates")) {
              const i = `${e}.${n.join(".")}`;
              me || (ce.clear(), me = !0, queueMicrotask(() => {
                for (const [p, w] of ce) {
                  const b = p.split(".");
                  b[0];
                  const A = b.slice(1), E = w.reduce(
                    (P, N) => typeof N == "function" && typeof P == "function" ? (F) => N(P(F)) : N
                  );
                  a(E, A, {
                    updateType: "update"
                  });
                }
                ce.clear(), me = !1;
              }));
              const s = ce.get(i) || [];
              s.push(r), ce.set(i, s);
            } else
              console.time("update inner"), a(r, n, { updateType: "update" }), console.timeEnd("update inner");
            return {
              synced: () => {
                const i = t.getState().getShadowMetadata(e, n);
                t.getState().setShadowMetadata(e, n, {
                  ...i,
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: Date.now()
                });
                const s = [e, ...n].join(".");
                t.getState().notifyPathSubscribers(s, {
                  type: "SYNC_STATUS_CHANGE",
                  isDirty: !1
                });
              }
            };
          };
        if (g === "toggle") {
          const r = t.getState().getShadowValue([e, ...n].join("."), l?.validIds);
          if (typeof r != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            a(!r, n, {
              updateType: "update"
            });
          };
        }
        if (g === "formElement")
          return (r, o) => /* @__PURE__ */ ne(
            Je,
            {
              stateKey: e,
              path: n,
              rebuildStateShape: h,
              setState: a,
              formOpts: o,
              renderFn: r
            }
          );
        const X = [...n, g];
        return t.getState().getShadowValue(e, X), h({
          path: X,
          componentId: V,
          meta: l
        });
      }
    }, K = new Proxy(B, f);
    return v.set(U, K), console.timeEnd("rebuildStateShape Inner"), K;
  }
  console.timeEnd("rebuildStateShape Outer");
  const S = {
    revertToInitialState: (n) => {
      t.getState().getInitialOptions(e)?.validation;
      const l = t.getState().getShadowMetadata(e, []);
      l?.stateSource === "server" && l.baseServerState ? l.baseServerState : t.getState().initialStateGlobal[e];
      const V = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), t.getState().initializeShadowState(e, V), h({
        path: [],
        componentId: y
      });
      const j = ae(e), U = ee(j?.localStorage?.key) ? j?.localStorage?.key(V) : j?.localStorage?.key, O = `${m}-${e}-${U}`;
      O && localStorage.removeItem(O);
      const B = t.getState().getShadowMetadata(e, []);
      return B && B?.components?.forEach((f) => {
        f.forceUpdate();
      }), V;
    },
    updateInitialState: (n) => {
      const l = Pe(
        e,
        a,
        y,
        m
      ), V = t.getState().initialStateGlobal[e], j = ae(e), U = ee(j?.localStorage?.key) ? j?.localStorage?.key(V) : j?.localStorage?.key, O = `${m}-${e}-${U}`;
      return localStorage.getItem(O) && localStorage.removeItem(O), Re(() => {
        Ce(e, n), t.getState().initializeShadowState(e, n);
        const B = t.getState().getShadowMetadata(e, []);
        B && B?.components?.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (B) => l.get()[B]
      };
    }
  };
  return h({
    componentId: y,
    path: []
  });
}
function Ee(e) {
  return se(qe, { proxy: e });
}
function Be({
  proxy: e,
  rebuildStateShape: a
}) {
  const y = z(null), m = z(`map-${crypto.randomUUID()}`), v = z(!1), I = z(/* @__PURE__ */ new Map());
  Z(() => {
    const S = y.current;
    if (!S || v.current) return;
    const u = setTimeout(() => {
      const n = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, l = n.mapWrappers || [];
      l.push({
        instanceId: m.current,
        mapFn: e._mapFn,
        containerRef: S,
        rebuildStateShape: a,
        path: e._path,
        componentId: m.current,
        meta: e._meta
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...n,
        mapWrappers: l
      }), v.current = !0, h();
    }, 0);
    return () => {
      if (clearTimeout(u), m.current) {
        const n = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        n.mapWrappers && (n.mapWrappers = n.mapWrappers.filter(
          (l) => l.instanceId !== m.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, n));
      }
      I.current.forEach((n) => n.unmount());
    };
  }, []);
  const h = () => {
    const S = y.current;
    if (!S) return;
    const u = t.getState().getShadowValue(
      [e._stateKey, ...e._path].join("."),
      e._meta?.validIds
    );
    if (!Array.isArray(u)) return;
    const n = e._meta?.validIds ?? t.getState().getShadowMetadata(e._stateKey, e._path)?.arrayKeys ?? [], l = a({
      currentState: u,
      path: e._path,
      componentId: m.current,
      meta: e._meta
    });
    u.forEach((V, j) => {
      const U = n[j];
      if (!U) return;
      const O = te(), B = document.createElement("div");
      B.setAttribute("data-item-path", U), S.appendChild(B);
      const f = be(B);
      I.current.set(U, f);
      const K = U.split(".").slice(1);
      f.render(
        se(we, {
          stateKey: e._stateKey,
          itemComponentId: O,
          itemPath: K,
          localIndex: j,
          arraySetter: l,
          rebuildStateShape: a,
          renderFn: e._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ ne("div", { ref: y, "data-map-container": m.current });
}
function qe({
  proxy: e
}) {
  const a = z(null), y = z(null), m = z(!1), v = `${e._stateKey}-${e._path.join(".")}`, I = t.getState().getShadowValue(
    [e._stateKey, ...e._path].join("."),
    e._meta?.validIds
  );
  return Z(() => {
    const h = a.current;
    if (!h || m.current) return;
    const S = setTimeout(() => {
      if (!h.parentElement) {
        console.warn("Parent element not found for signal", v);
        return;
      }
      const u = h.parentElement, l = Array.from(u.childNodes).indexOf(h);
      let V = u.getAttribute("data-parent-id");
      V || (V = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", V)), y.current = `instance-${crypto.randomUUID()}`;
      const j = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, U = j.signals || [];
      U.push({
        instanceId: y.current,
        parentId: V,
        position: l,
        effect: e._effect
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...j,
        signals: U
      });
      let O = I;
      if (e._effect)
        try {
          O = new Function(
            "state",
            `return (${e._effect})(state)`
          )(I);
        } catch (f) {
          console.error("Error evaluating effect function:", f);
        }
      O !== null && typeof O == "object" && (O = JSON.stringify(O));
      const B = document.createTextNode(String(O ?? ""));
      h.replaceWith(B), m.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(S), y.current) {
        const u = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        u.signals && (u.signals = u.signals.filter(
          (n) => n.instanceId !== y.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, u));
      }
    };
  }, []), se("span", {
    ref: a,
    style: { display: "contents" },
    "data-signal-id": v
  });
}
const we = Oe(
  Ge,
  (e, a) => e.itemPath.join(".") === a.itemPath.join(".") && e.stateKey === a.stateKey && e.itemComponentId === a.itemComponentId && e.localIndex === a.localIndex
), ze = (e) => {
  const [a, y] = Q(!1);
  return le(() => {
    if (!e.current) {
      y(!0);
      return;
    }
    const m = Array.from(e.current.querySelectorAll("img"));
    if (m.length === 0) {
      y(!0);
      return;
    }
    let v = 0;
    const I = () => {
      v++, v === m.length && y(!0);
    };
    return m.forEach((h) => {
      h.complete ? I() : (h.addEventListener("load", I), h.addEventListener("error", I));
    }), () => {
      m.forEach((h) => {
        h.removeEventListener("load", I), h.removeEventListener("error", I);
      });
    };
  }, [e.current]), a;
};
function Ge({
  stateKey: e,
  itemComponentId: a,
  itemPath: y,
  localIndex: m,
  arraySetter: v,
  rebuildStateShape: I,
  renderFn: h
}) {
  const [, S] = Q({}), { ref: u, inView: n } = Ne(), l = z(null), V = ze(l), j = z(!1), U = [e, ...y].join(".");
  ke(e, a, S);
  const O = oe(
    (g) => {
      l.current = g, u(g);
    },
    [u]
  );
  Z(() => {
    t.getState().subscribeToPath(U, (g) => {
      S({});
    });
  }, []), Z(() => {
    if (!n || !V || j.current)
      return;
    const g = l.current;
    if (g && g.offsetHeight > 0) {
      j.current = !0;
      const J = g.offsetHeight;
      t.getState().setShadowMetadata(e, y, {
        virtualizer: {
          itemHeight: J,
          domRef: g
        }
      });
      const X = y.slice(0, -1), r = [e, ...X].join(".");
      t.getState().notifyPathSubscribers(r, {
        type: "ITEMHEIGHT",
        itemKey: y.join("."),
        ref: l.current
      });
    }
  }, [n, V, e, y]);
  const B = [e, ...y].join("."), f = t.getState().getShadowValue(B);
  if (f === void 0)
    return null;
  const K = I({
    currentState: f,
    path: y,
    componentId: a
  }), L = h(K, m, v);
  return /* @__PURE__ */ ne("div", { ref: O, children: L });
}
function Je({
  stateKey: e,
  path: a,
  rebuildStateShape: y,
  renderFn: m,
  formOpts: v,
  setState: I
}) {
  const [h] = Q(() => te()), [, S] = Q({}), u = [e, ...a].join(".");
  ke(e, h, S);
  const n = t.getState().getShadowValue(u), [l, V] = Q(n), j = z(!1), U = z(null);
  Z(() => {
    !j.current && !re(n, l) && V(n);
  }, [n]), Z(() => {
    const L = t.getState().subscribeToPath(u, (g) => {
      !j.current && l !== g && S({});
    });
    return () => {
      L(), U.current && (clearTimeout(U.current), j.current = !1);
    };
  }, []);
  const O = oe(
    (L) => {
      typeof n === "number" && typeof L == "string" && (L = L === "" ? 0 : Number(L)), V(L), j.current = !0, U.current && clearTimeout(U.current);
      const J = v?.debounceTime ?? 200;
      U.current = setTimeout(() => {
        j.current = !1, I(L, a, { updateType: "update" });
        const { getInitialOptions: X, setShadowMetadata: r, getShadowMetadata: o } = t.getState(), d = X(e)?.validation, c = d?.zodSchemaV4 || d?.zodSchemaV3;
        if (c) {
          const i = t.getState().getShadowValue(e), s = c.safeParse(i), p = o(e, a) || {};
          if (s.success)
            r(e, a, {
              ...p,
              validation: {
                status: "VALID_LIVE",
                validatedValue: L,
                message: void 0
              }
            });
          else {
            const b = ("issues" in s.error ? s.error.issues : s.error.errors).filter(
              (A) => JSON.stringify(A.path) === JSON.stringify(a)
            );
            b.length > 0 ? r(e, a, {
              ...p,
              validation: {
                status: "INVALID_LIVE",
                message: b[0]?.message,
                validatedValue: L
              }
            }) : r(e, a, {
              ...p,
              validation: {
                status: "VALID_LIVE",
                validatedValue: L,
                message: void 0
              }
            });
          }
        }
      }, J), S({});
    },
    [I, a, v?.debounceTime, e]
  ), B = oe(async () => {
    console.log("handleBlur triggered"), U.current && (clearTimeout(U.current), U.current = null, j.current = !1, I(l, a, { updateType: "update" }));
    const { getInitialOptions: L } = t.getState(), g = L(e)?.validation, J = g?.zodSchemaV4 || g?.zodSchemaV3;
    if (!J) return;
    const X = t.getState().getShadowMetadata(e, a);
    t.getState().setShadowMetadata(e, a, {
      ...X,
      validation: {
        status: "DIRTY",
        validatedValue: l
      }
    });
    const r = t.getState().getShadowValue(e), o = J.safeParse(r);
    if (console.log("result ", o), o.success)
      t.getState().setShadowMetadata(e, a, {
        ...X,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: l
        }
      });
    else {
      const d = "issues" in o.error ? o.error.issues : o.error.errors;
      console.log("All validation errors:", d), console.log("Current blur path:", a);
      const c = d.filter((i) => {
        if (console.log("Processing error:", i), a.some((p) => p.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const p = a[0].startsWith("id:") ? [] : a.slice(0, -1);
          console.log("Parent path:", p);
          const w = t.getState().getShadowMetadata(e, p);
          if (console.log("Array metadata:", w), w?.arrayKeys) {
            const b = [e, ...a.slice(0, -1)].join("."), A = w.arrayKeys.indexOf(b);
            console.log("Item key:", b, "Index:", A);
            const E = [...p, A, ...a.slice(-1)], P = JSON.stringify(i.path) === JSON.stringify(E);
            return console.log("Zod path comparison:", {
              zodPath: E,
              errorPath: i.path,
              match: P
            }), P;
          }
        }
        const s = JSON.stringify(i.path) === JSON.stringify(a);
        return console.log("Direct path comparison:", {
          errorPath: i.path,
          currentPath: a,
          match: s
        }), s;
      });
      console.log("Filtered path errors:", c), t.getState().setShadowMetadata(e, a, {
        ...X,
        validation: {
          status: "VALIDATION_FAILED",
          message: c[0]?.message,
          validatedValue: l
        }
      });
    }
    S({});
  }, [e, a, l, I]), f = y({
    currentState: n,
    path: a,
    componentId: h
  }), K = new Proxy(f, {
    get(L, g) {
      return g === "inputProps" ? {
        value: l ?? "",
        onChange: (J) => {
          O(J.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: B,
        ref: he.getState().getFormRef(e + "." + a.join("."))
      } : L[g];
    }
  });
  return /* @__PURE__ */ ne(Ve, { formOpts: v, path: a, stateKey: e, children: m(K) });
}
function ke(e, a, y) {
  const m = `${e}////${a}`;
  le(() => {
    const { registerComponent: v, unregisterComponent: I } = t.getState();
    return v(e, m, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      I(e, m);
    };
  }, [e, m]);
}
export {
  Ee as $cogsSignal,
  ot as addStateOptions,
  Fe as createCogsState,
  st as createCogsStateFromSync,
  it as notifyComponent,
  We as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
