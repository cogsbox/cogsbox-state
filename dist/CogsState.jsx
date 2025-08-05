"use client";
import { jsx as re, Fragment as De } from "react/jsx-runtime";
import { memo as Oe, useState as K, useRef as G, useCallback as se, useEffect as Q, useLayoutEffect as de, useMemo as fe, createElement as ie, startTransition as Re } from "react";
import { createRoot as be } from "react-dom/client";
import { transformStateFunc as $e, isFunction as ee, isArray as Ie, getDifferences as Ae, isDeepEqual as oe } from "./utility.js";
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
  const m = ae(e) || {}, v = y[e] || {}, M = t.getState().setInitialStateOptions, h = { ...v, ...m };
  let g = !1;
  if (a)
    for (const u in a)
      h.hasOwnProperty(u) ? (u == "localStorage" && a[u] && h[u].key !== a[u]?.key && (g = !0, h[u] = a[u]), u == "defaultState" && a[u] && h[u] !== a[u] && !oe(h[u], a[u]) && (g = !0, h[u] = a[u])) : (g = !0, h[u] = a[u]);
  h.syncOptions && (!a || !a.hasOwnProperty("syncOptions")) && (g = !0), g && M(e, h);
}
function ot(e, { formElements: a, validation: y }) {
  return { initialState: e, formElements: a, validation: y };
}
const Fe = (e, a) => {
  let y = e;
  console.log("optsc", a?.__useSync);
  const [m, v] = $e(y);
  a?.__fromSyncSchema && a?.__syncNotifications && t.getState().setInitialStateOptions("__notifications", a.__syncNotifications), a?.__fromSyncSchema && a?.__apiParamsMap && t.getState().setInitialStateOptions("__apiParamsMap", a.__apiParamsMap), Object.keys(m).forEach((g) => {
    let u = v[g] || {};
    const n = {
      ...u
    };
    if (a?.formElements && (n.formElements = {
      ...a.formElements,
      ...u.formElements || {}
    }), a?.validation && (n.validation = {
      ...a.validation,
      ...u.validation || {}
    }, a.validation.key && !u.validation?.key && (n.validation.key = `${a.validation.key}.${g}`)), a?.__syncSchemas?.[g]?.schemas?.validation && (n.validation = {
      zodSchemaV4: a.__syncSchemas[g].schemas.validation,
      ...u.validation
    }), Object.keys(n).length > 0) {
      const i = ae(g);
      i ? t.getState().setInitialStateOptions(g, {
        ...i,
        ...n
      }) : t.getState().setInitialStateOptions(g, n);
    }
  }), Object.keys(m).forEach((g) => {
    t.getState().initializeShadowState(g, m[g]);
  });
  const M = (g, u) => {
    console.time("useCogsState");
    const [n] = K(u?.componentId ?? te());
    Me({
      stateKey: g,
      options: u,
      initialOptionsPart: v
    });
    const i = t.getState().getShadowValue(g) || m[g], V = u?.modifyState ? u.modifyState(i) : i;
    return console.timeEnd("useCogsState"), We(V, {
      stateKey: g,
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
  function h(g, u) {
    Me({ stateKey: g, options: u, initialOptionsPart: v }), u.localStorage && He(g, u), ve(g);
  }
  return { useCogsState: M, setCogsOptions: h };
};
function st(e, a) {
  const y = e.schemas, m = {}, v = {};
  for (const M in y) {
    const h = y[M];
    m[M] = h?.schemas?.defaultValues || {}, h?.api?.queryData?._paramType && (v[M] = h.api.queryData._paramType);
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
  const M = ee(y?.localStorage?.key) ? y.localStorage?.key(e) : y?.localStorage?.key;
  if (M && m) {
    const h = `${m}-${a}-${M}`;
    let g;
    try {
      g = Se(h)?.lastSyncedWithServer;
    } catch {
    }
    const u = t.getState().getShadowMetadata(a, []), n = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: g,
      stateSource: u?.stateSource,
      baseServerState: u?.baseServerState
    }, i = Ue.serialize(n);
    window.localStorage.setItem(
      h,
      JSON.stringify(i.json)
    );
  }
}, Se = (e) => {
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
    const M = Se(
      `${m}-${e}-${v}`
    );
    if (M && M.lastUpdated > (M.lastSyncedWithServer || 0))
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
  const v = t.getState(), M = v.getShadowMetadata(e, a);
  if (v.setShadowMetadata(e, a, {
    ...M,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: m || Date.now()
  }), Array.isArray(y)) {
    const h = v.getShadowMetadata(e, a);
    h?.arrayKeys && h.arrayKeys.forEach((g, u) => {
      const n = g.split(".").slice(1), i = y[u];
      i !== void 0 && ye(
        e,
        n,
        i,
        m
      );
    });
  } else y && typeof y == "object" && y.constructor === Object && Object.keys(y).forEach((h) => {
    const g = [...a, h], u = y[h];
    ye(e, g, u, m);
  });
}
let le = /* @__PURE__ */ new Map(), me = !1;
function We(e, {
  stateKey: a,
  localStorage: y,
  formElements: m,
  reactiveDeps: v,
  reactiveType: M,
  componentId: h,
  defaultState: g,
  syncUpdate: u,
  dependencies: n,
  serverState: i,
  __useSync: V,
  syncOptions: j
} = {}) {
  console.time("useCogsStateFn top");
  const [F, $] = K({}), { sessionId: L } = _e();
  let J = !a;
  const [p] = K(a ?? te()), W = G(h ?? te()), f = G(
    null
  );
  f.current = ae(p) ?? null, Q(() => {
    if (u && u.stateKey === p && u.path?.[0]) {
      const c = `${u.stateKey}:${u.path.join(".")}`;
      t.getState().setSyncInfo(c, {
        timeStamp: u.timeStamp,
        userId: u.userId
      });
    }
  }, [u]);
  const X = se(
    (c) => {
      const l = c ? { ...ae(p), ...c } : ae(p), P = l?.defaultState || g || e;
      if (l?.serverState?.status === "success" && l?.serverState?.data !== void 0)
        return {
          value: l.serverState.data,
          source: "server",
          timestamp: l.serverState.timestamp || Date.now()
        };
      if (l?.localStorage?.key && L) {
        const A = ee(l.localStorage.key) ? l.localStorage.key(P) : l.localStorage.key, T = Se(
          `${L}-${p}-${A}`
        );
        if (T && T.lastUpdated > (l?.serverState?.timestamp || 0))
          return {
            value: T.state,
            source: "localStorage",
            timestamp: T.lastUpdated
          };
      }
      return {
        value: P || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [p, g, e, L]
  );
  Q(() => {
    t.getState().setServerStateUpdate(p, i);
  }, [i, p]), Q(() => t.getState().subscribeToPath(p, (s) => {
    if (s?.type === "SERVER_STATE_UPDATE") {
      const l = s.serverState;
      if (console.log("SERVER_STATE_UPDATE", s), l?.status === "success" && l.data !== void 0) {
        ge(p, { serverState: l });
        const w = typeof l.merge == "object" ? l.merge : l.merge === !0 ? {} : null, A = t.getState().getShadowValue(p), T = l.data;
        if (w && Array.isArray(A) && Array.isArray(T)) {
          const N = w.key, U = new Set(
            A.map((q) => q[N])
          ), B = T.filter((q) => !U.has(q[N]));
          B.length > 0 && B.forEach((q) => {
            t.getState().insertShadowArrayElement(p, [], q);
            const z = t.getState().getShadowMetadata(p, []);
            if (z?.arrayKeys) {
              const C = z.arrayKeys[z.arrayKeys.length - 1];
              if (C) {
                const O = C.split(".").slice(1);
                t.getState().setShadowMetadata(p, O, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: l.timestamp || Date.now()
                });
                const I = t.getState().getShadowValue(C);
                I && typeof I == "object" && !Array.isArray(I) && Object.keys(I).forEach((E) => {
                  const b = [...O, E];
                  t.getState().setShadowMetadata(p, b, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: l.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          t.getState().initializeShadowState(p, T), ye(
            p,
            [],
            T,
            l.timestamp
          );
        const _ = t.getState().getShadowMetadata(p, []);
        t.getState().setShadowMetadata(p, [], {
          ..._,
          stateSource: "server",
          lastServerSync: l.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [p, X]), Q(() => {
    const c = t.getState().getShadowMetadata(p, []);
    if (c && c.stateSource)
      return;
    const s = ae(p);
    if (s?.defaultState !== void 0 || g !== void 0) {
      const l = s?.defaultState || g;
      s?.defaultState || ge(p, {
        defaultState: l
      });
      const { value: P, source: w, timestamp: A } = X();
      t.getState().initializeShadowState(p, P), t.getState().setShadowMetadata(p, [], {
        stateSource: w,
        lastServerSync: w === "server" ? A : void 0,
        isDirty: !1,
        baseServerState: w === "server" ? P : void 0
      }), ve(p);
    }
  }, [p, ...n || []]), de(() => {
    J && ge(p, {
      formElements: m,
      defaultState: g,
      localStorage: y,
      middleware: f.current?.middleware
    });
    const c = `${p}////${W.current}`, s = t.getState().getShadowMetadata(p, []), l = s?.components || /* @__PURE__ */ new Map();
    return l.set(c, {
      forceUpdate: () => $({}),
      reactiveType: M ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: v || void 0,
      deps: v ? v(t.getState().getShadowValue(p)) : [],
      prevDeps: v ? v(t.getState().getShadowValue(p)) : []
    }), t.getState().setShadowMetadata(p, [], {
      ...s,
      components: l
    }), $({}), () => {
      const P = t.getState().getShadowMetadata(p, []), w = P?.components?.get(c);
      w?.paths && w.paths.forEach((A) => {
        const _ = A.split(".").slice(1), N = t.getState().getShadowMetadata(p, _);
        N?.pathComponents && N.pathComponents.size === 0 && (delete N.pathComponents, t.getState().setShadowMetadata(p, _, N));
      }), P?.components && t.getState().setShadowMetadata(p, [], P);
    };
  }, []);
  const Y = G(null);
  console.timeEnd("useCogsStateFn top");
  const r = (c, s, l) => {
    console.time("top of effectiveSetState");
    const P = [p, ...s].join("."), w = t.getState(), A = w.getShadowMetadata(p, s), T = w.getShadowValue(P);
    console.timeEnd("top of effectiveSetState"), console.time("top of payload");
    const _ = l.updateType === "insert" && ee(c) ? c({ state: T, uuid: te() }) : ee(c) ? c(T) : c, U = {
      timeStamp: Date.now(),
      stateKey: p,
      path: s,
      updateType: l.updateType,
      status: "new",
      oldValue: T,
      newValue: _
    };
    switch (console.timeEnd("top of payload"), console.time("switch in effectiveSetState"), l.updateType) {
      case "insert": {
        w.insertShadowArrayElement(p, s, U.newValue), w.markAsDirty(p, s, { bubble: !0 });
        const C = A;
        if (C?.arrayKeys) {
          const O = C.arrayKeys[C.arrayKeys.length - 1];
          if (O) {
            const I = O.split(".").slice(1);
            w.markAsDirty(p, I, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const C = s.slice(0, -1);
        w.removeShadowArrayElement(p, s), w.markAsDirty(p, C, { bubble: !0 });
        break;
      }
      case "update": {
        w.updateShadowAtPath(p, s, U.newValue), w.markAsDirty(p, s, { bubble: !0 });
        break;
      }
    }
    console.timeEnd("switch in effectiveSetState");
    const B = l.sync !== !1;
    if (console.time("signals"), B && Y.current && Y.current.connected && Y.current.updateState({ operation: U }), A?.signals && A.signals.length > 0) {
      const C = l.updateType === "cut" ? null : _;
      A.signals.forEach(({ parentId: O, position: I, effect: E }) => {
        const b = document.querySelector(`[data-parent-id="${O}"]`);
        if (b) {
          const D = Array.from(b.childNodes);
          if (D[I]) {
            let k = C;
            if (E && C !== null)
              try {
                k = new Function(
                  "state",
                  `return (${E})(state)`
                )(C);
              } catch (R) {
                console.error("Error evaluating effect function:", R);
              }
            k != null && typeof k == "object" && (k = JSON.stringify(k)), D[I].textContent = String(k ?? "");
          }
        }
      });
    }
    if (l.updateType === "insert" && A?.mapWrappers && A.mapWrappers.length > 0) {
      const C = w.getShadowMetadata(p, s)?.arrayKeys || [], O = C[C.length - 1], I = w.getShadowValue(O), E = w.getShadowValue(
        [p, ...s].join(".")
      );
      if (!O || I === void 0) return;
      A.mapWrappers.forEach((b) => {
        let D = !0, k = -1;
        if (b.meta?.transforms && b.meta.transforms.length > 0) {
          for (const R of b.meta.transforms)
            if (R.type === "filter" && !R.fn(I, -1)) {
              D = !1;
              break;
            }
          if (D) {
            const R = pe(
              p,
              s,
              b.meta.transforms
            ), Z = b.meta.transforms.find(
              (H) => H.type === "sort"
            );
            if (Z) {
              const H = R.map((x) => ({
                key: x,
                value: w.getShadowValue(x)
              }));
              H.push({ key: O, value: I }), H.sort((x, ne) => Z.fn(x.value, ne.value)), k = H.findIndex(
                (x) => x.key === O
              );
            } else
              k = R.length;
          }
        } else
          D = !0, k = C.length - 1;
        if (D && b.containerRef && b.containerRef.isConnected) {
          const R = document.createElement("div");
          R.setAttribute("data-item-path", O);
          const Z = Array.from(b.containerRef.children);
          k >= 0 && k < Z.length ? b.containerRef.insertBefore(
            R,
            Z[k]
          ) : b.containerRef.appendChild(R);
          const H = be(R), x = te(), ne = O.split(".").slice(1), ce = b.rebuildStateShape({
            path: b.path,
            currentState: E,
            componentId: b.componentId,
            meta: b.meta
          });
          H.render(
            ie(we, {
              stateKey: p,
              itemComponentId: x,
              itemPath: ne,
              localIndex: k,
              arraySetter: ce,
              rebuildStateShape: b.rebuildStateShape,
              renderFn: b.mapFn
            })
          );
        }
      });
    }
    if (l.updateType === "cut") {
      const C = s.slice(0, -1), O = w.getShadowMetadata(p, C);
      O?.mapWrappers && O.mapWrappers.length > 0 && O.mapWrappers.forEach((I) => {
        if (I.containerRef && I.containerRef.isConnected) {
          const E = I.containerRef.querySelector(
            `[data-item-path="${P}"]`
          );
          E && E.remove();
        }
      });
    }
    console.timeEnd("signals"), console.time("notify");
    const q = w.getShadowMetadata(p, []), z = /* @__PURE__ */ new Set();
    if (q?.components) {
      if (l.updateType === "update") {
        let C = [...s];
        for (; ; ) {
          const O = w.getShadowMetadata(p, C);
          if (O?.pathComponents && O.pathComponents.forEach((I) => {
            if (z.has(I))
              return;
            const E = q.components?.get(I);
            E && ((Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"]).includes("none") || (E.forceUpdate(), z.add(I)));
          }), C.length === 0)
            break;
          C.pop();
        }
        _ && typeof _ == "object" && !Ie(_) && T && typeof T == "object" && !Ie(T) && Ae(_, T).forEach((I) => {
          const E = I.split("."), b = [...s, ...E], D = w.getShadowMetadata(p, b);
          D?.pathComponents && D.pathComponents.forEach((k) => {
            if (z.has(k))
              return;
            const R = q.components?.get(k);
            R && ((Array.isArray(R.reactiveType) ? R.reactiveType : [R.reactiveType || "component"]).includes("none") || (R.forceUpdate(), z.add(k)));
          });
        });
      } else if (l.updateType === "insert" || l.updateType === "cut") {
        const C = l.updateType === "insert" ? s : s.slice(0, -1), O = w.getShadowMetadata(p, C);
        if (O?.signals && O.signals.length > 0) {
          const I = [p, ...C].join("."), E = w.getShadowValue(I);
          O.signals.forEach(({ parentId: b, position: D, effect: k }) => {
            const R = document.querySelector(
              `[data-parent-id="${b}"]`
            );
            if (R) {
              const Z = Array.from(R.childNodes);
              if (Z[D]) {
                let H = E;
                if (k)
                  try {
                    H = new Function(
                      "state",
                      `return (${k})(state)`
                    )(E);
                  } catch (x) {
                    console.error("Error evaluating effect function:", x), H = E;
                  }
                H != null && typeof H == "object" && (H = JSON.stringify(H)), Z[D].textContent = String(H ?? "");
              }
            }
          });
        }
        O?.pathComponents && O.pathComponents.forEach((I) => {
          if (!z.has(I)) {
            const E = q.components?.get(I);
            E && (E.forceUpdate(), z.add(I));
          }
        });
      }
      q.components.forEach((C, O) => {
        if (z.has(O))
          return;
        const I = Array.isArray(C.reactiveType) ? C.reactiveType : [C.reactiveType || "component"];
        if (I.includes("all")) {
          C.forceUpdate(), z.add(O);
          return;
        }
        if (I.includes("deps") && C.depsFunction) {
          const E = w.getShadowValue(p), b = C.depsFunction(E);
          let D = !1;
          b === !0 ? D = !0 : Array.isArray(b) && (oe(C.prevDeps, b) || (C.prevDeps = b, D = !0)), D && (C.forceUpdate(), z.add(O));
        }
      }), z.clear(), console.timeEnd("notify"), console.time("end stuff"), je(p, U), Le(
        _,
        p,
        f.current,
        L
      ), f.current?.middleware && f.current.middleware({
        update: U
      }), console.timeEnd("end stuff");
    }
  };
  t.getState().initialStateGlobal[p] || Ce(p, e);
  const o = fe(() => {
    console.time("createProxyHandler");
    const c = Pe(
      p,
      r,
      W.current,
      L
    );
    return console.timeEnd("createProxyHandler"), c;
  }, [p, L]), d = V, S = f.current?.syncOptions;
  return d && (Y.current = d(
    o,
    S ?? {}
  )), o;
}
function xe(e) {
  return !e || e.length === 0 ? "" : e.map(
    (a) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${a.type}${JSON.stringify(a.dependencies || [])}`
    )
  ).join("");
}
const pe = (e, a, y) => {
  let m = t.getState().getShadowMetadata(e, a)?.arrayKeys || [];
  if (!y || y.length === 0)
    return m;
  let v = m.map((M) => ({
    key: M,
    value: t.getState().getShadowValue(M)
  }));
  for (const M of y)
    M.type === "filter" ? v = v.filter(
      ({ value: h }, g) => M.fn(h, g)
    ) : M.type === "sort" && v.sort((h, g) => M.fn(h.value, g.value));
  return v.map(({ key: M }) => M);
}, Te = (e, a, y) => {
  const m = `${e}////${a}`, { addPathComponent: v, getShadowMetadata: M } = t.getState(), g = M(e, [])?.components?.get(m);
  !g || g.reactiveType === "none" || !(Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType]).includes("component") || v(e, y, m);
}, ue = (e, a, y) => {
  const m = t.getState(), v = m.getShadowMetadata(e, []), M = /* @__PURE__ */ new Set();
  v?.components && v.components.forEach((g, u) => {
    (Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"]).includes("all") && (g.forceUpdate(), M.add(u));
  }), m.getShadowMetadata(e, [...a, "getSelected"])?.pathComponents?.forEach((g) => {
    v?.components?.get(g)?.forceUpdate();
  });
  const h = m.getShadowMetadata(e, a);
  for (let g of h?.arrayKeys || []) {
    const u = g + ".selected", n = m.getShadowMetadata(
      e,
      u.split(".").slice(1)
    );
    g == y && n?.pathComponents?.forEach((i) => {
      v?.components?.get(i)?.forceUpdate();
    });
  }
};
function Pe(e, a, y, m) {
  const v = /* @__PURE__ */ new Map();
  console.time("rebuildStateShape Outer");
  let M = null;
  function h({
    path: n = [],
    meta: i,
    componentId: V
  }) {
    console.time("rebuildStateShape Inner");
    const j = i ? JSON.stringify(i.validIds || i.transforms) : "", F = n.join(".") + ":" + j;
    if (console.log("PROXY CACHE KEY ", F), v.has(F))
      return console.log("PROXY CACHE HIT"), v.get(F);
    const $ = [e, ...n].join("."), L = function() {
      return t().getShadowValue(e, n);
    }, J = {
      apply(W, f, X) {
      },
      get(W, f) {
        if (n.length === 0 && (M = `Recursion-${Math.random()}`, console.time(M)), f === "_rebuildStateShape")
          return h;
        if (Object.getOwnPropertyNames(g).includes(f) && n.length === 0)
          return g[f];
        if (f === "getDifferences")
          return () => {
            const r = t.getState().getShadowMetadata(e, []), o = t.getState().getShadowValue(e);
            let d;
            return r?.stateSource === "server" && r.baseServerState ? d = r.baseServerState : d = t.getState().initialStateGlobal[e], Ae(o, d);
          };
        if (f === "sync" && n.length === 0)
          return async function() {
            const r = t.getState().getInitialOptions(e), o = r?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const d = t.getState().getShadowValue(e, []), S = r?.validation?.key;
            try {
              const c = await o.action(d);
              if (c && !c.success && c.errors, c?.success) {
                const s = t.getState().getShadowMetadata(e, []);
                t.getState().setShadowMetadata(e, [], {
                  ...s,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: d
                  // Update base server state
                }), o.onSuccess && o.onSuccess(c.data);
              } else !c?.success && o.onError && o.onError(c.error);
              return c;
            } catch (c) {
              return o.onError && o.onError(c), { success: !1, error: c };
            }
          };
        if (f === "_status" || f === "getStatus") {
          const r = () => {
            const o = t.getState().getShadowMetadata(e, n), d = t.getState().getShadowValue($);
            return o?.isDirty === !0 ? "dirty" : o?.isDirty === !1 || o?.stateSource === "server" ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" ? "fresh" : t.getState().getShadowMetadata(e, [])?.stateSource === "server" && !o?.isDirty ? "synced" : d !== void 0 && !o ? "fresh" : "unknown";
          };
          return f === "_status" ? r() : r;
        }
        if (f === "removeStorage")
          return () => {
            const r = t.getState().initialStateGlobal[e], o = ae(e), d = ee(o?.localStorage?.key) ? o.localStorage.key(r) : o?.localStorage?.key, S = `${m}-${e}-${d}`;
            S && localStorage.removeItem(S);
          };
        if (f === "showValidationErrors")
          return () => {
            const r = t.getState().getShadowMetadata(e, n);
            return r?.validation?.status === "VALIDATION_FAILED" && r.validation.message ? [r.validation.message] : [];
          };
        if (f === "getSelected")
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
            if (!(i?.validIds && !i.validIds.includes(d) || !t.getState().getShadowValue(d)))
              return h({
                path: d.split(".").slice(1),
                componentId: V
              });
          };
        if (f === "getSelectedIndex")
          return () => t.getState().getSelectedIndex(
            e + "." + n.join("."),
            i?.validIds
          );
        if (f === "clearSelected")
          return ue(e, n), () => {
            t.getState().clearSelectedIndex({
              arrayKey: e + "." + n.join(".")
            });
          };
        if (f === "useVirtualView")
          return (r) => {
            const {
              itemHeight: o = 50,
              overscan: d = 6,
              stickToBottom: S = !1,
              scrollStickTolerance: c = 75
            } = r, s = G(null), [l, P] = K({
              startIndex: 0,
              endIndex: 10
            }), [w, A] = K({}), T = G(!0), _ = G({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), N = G(
              /* @__PURE__ */ new Map()
            );
            de(() => {
              if (!S || !s.current || _.current.isUserScrolling)
                return;
              const I = s.current;
              I.scrollTo({
                top: I.scrollHeight,
                behavior: T.current ? "instant" : "smooth"
              });
            }, [w, S]);
            const U = t.getState().getShadowMetadata(e, n)?.arrayKeys || [], { totalHeight: B, itemOffsets: q } = fe(() => {
              let I = 0;
              const E = /* @__PURE__ */ new Map();
              return (t.getState().getShadowMetadata(e, n)?.arrayKeys || []).forEach((D) => {
                const k = D.split(".").slice(1), R = t.getState().getShadowMetadata(e, k)?.virtualizer?.itemHeight || o;
                E.set(D, {
                  height: R,
                  offset: I
                }), I += R;
              }), N.current = E, { totalHeight: I, itemOffsets: E };
            }, [U.length, o]);
            de(() => {
              if (S && U.length > 0 && s.current && !_.current.isUserScrolling && T.current) {
                const I = s.current, E = () => {
                  if (I.clientHeight > 0) {
                    const b = Math.ceil(
                      I.clientHeight / o
                    ), D = U.length - 1, k = Math.max(
                      0,
                      D - b - d
                    );
                    P({ startIndex: k, endIndex: D }), requestAnimationFrame(() => {
                      C("instant"), T.current = !1;
                    });
                  } else
                    requestAnimationFrame(E);
                };
                E();
              }
            }, [U.length, S, o, d]);
            const z = se(() => {
              const I = s.current;
              if (!I) return;
              const E = I.scrollTop, { scrollHeight: b, clientHeight: D } = I, k = _.current, R = b - (E + D), Z = k.isNearBottom;
              k.isNearBottom = R <= c, E < k.lastScrollTop ? (k.scrollUpCount++, k.scrollUpCount > 3 && Z && (k.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : k.isNearBottom && (k.isUserScrolling = !1, k.scrollUpCount = 0), k.lastScrollTop = E;
              let H = 0;
              for (let x = 0; x < U.length; x++) {
                const ne = U[x], ce = N.current.get(ne);
                if (ce && ce.offset + ce.height > E) {
                  H = x;
                  break;
                }
              }
              if (H !== l.startIndex) {
                const x = Math.ceil(D / o);
                P({
                  startIndex: Math.max(0, H - d),
                  endIndex: Math.min(
                    U.length - 1,
                    H + x + d
                  )
                });
              }
            }, [
              U.length,
              l.startIndex,
              o,
              d,
              c
            ]);
            Q(() => {
              const I = s.current;
              if (!(!I || !S))
                return I.addEventListener("scroll", z, {
                  passive: !0
                }), () => {
                  I.removeEventListener("scroll", z);
                };
            }, [z, S]);
            const C = se(
              (I = "smooth") => {
                const E = s.current;
                if (!E) return;
                _.current.isUserScrolling = !1, _.current.isNearBottom = !0, _.current.scrollUpCount = 0;
                const b = () => {
                  const D = (k = 0) => {
                    if (k > 5) return;
                    const R = E.scrollHeight, Z = E.scrollTop, H = E.clientHeight;
                    Z + H >= R - 1 || (E.scrollTo({
                      top: R,
                      behavior: I
                    }), setTimeout(() => {
                      const x = E.scrollHeight, ne = E.scrollTop;
                      (x !== R || ne + H < x - 1) && D(k + 1);
                    }, 50));
                  };
                  D();
                };
                "requestIdleCallback" in window ? requestIdleCallback(b, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(b);
                });
              },
              []
            );
            return Q(() => {
              if (!S || !s.current) return;
              const I = s.current, E = _.current;
              let b;
              const D = () => {
                clearTimeout(b), b = setTimeout(() => {
                  !E.isUserScrolling && E.isNearBottom && C(
                    T.current ? "instant" : "smooth"
                  );
                }, 100);
              }, k = new MutationObserver(() => {
                E.isUserScrolling || D();
              });
              k.observe(I, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
                // More specific than just 'height'
              });
              const R = (Z) => {
                Z.target instanceof HTMLImageElement && !E.isUserScrolling && D();
              };
              return I.addEventListener("load", R, !0), T.current ? setTimeout(() => {
                C("instant");
              }, 0) : D(), () => {
                clearTimeout(b), k.disconnect(), I.removeEventListener("load", R, !0);
              };
            }, [S, U.length, C]), {
              virtualState: fe(() => {
                const I = t.getState(), E = I.getShadowValue(
                  [e, ...n].join(".")
                ), b = I.getShadowMetadata(e, n)?.arrayKeys || [];
                E.slice(
                  l.startIndex,
                  l.endIndex + 1
                );
                const D = b.slice(
                  l.startIndex,
                  l.endIndex + 1
                );
                return h({
                  path: n,
                  componentId: V,
                  meta: { ...i, validIds: D }
                });
              }, [l.startIndex, l.endIndex, U.length]),
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
                    height: `${B}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${N.current.get(U[l.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: C,
              scrollToIndex: (I, E = "smooth") => {
                if (s.current && U[I]) {
                  const b = N.current.get(U[I])?.offset || 0;
                  s.current.scrollTo({ top: b, behavior: E });
                }
              }
            };
          };
        if (f === "stateMap")
          return (r) => {
            const [o, d] = K(
              i?.validIds ?? t.getState().getShadowMetadata(e, n)?.arrayKeys
            ), S = t.getState().getShadowValue($, i?.validIds);
            if (!o)
              throw new Error("No array keys found for mapping");
            const c = h({
              path: n,
              componentId: V,
              meta: i
            });
            return S.map((s, l) => {
              const P = o[l]?.split(".").slice(1), w = h({
                path: P,
                componentId: V,
                meta: i
              });
              return r(
                w,
                l,
                c
              );
            });
          };
        if (f === "$stateMap")
          return (r) => ie(Be, {
            proxy: {
              _stateKey: e,
              _path: n,
              _mapFn: r,
              _meta: i
            },
            rebuildStateShape: h
          });
        if (f === "stateFind")
          return (r) => {
            const o = i?.validIds ?? t.getState().getShadowMetadata(e, n)?.arrayKeys;
            if (o)
              for (let d = 0; d < o.length; d++) {
                const S = o[d];
                if (!S) continue;
                const c = t.getState().getShadowValue(S);
                if (r(c, d)) {
                  const s = S.split(".").slice(1);
                  return h({
                    path: s,
                    componentId: V,
                    meta: i
                    // Pass along meta for potential further chaining
                  });
                }
              }
          };
        if (f === "stateFilter")
          return (r) => {
            const o = t.getState().getShadowValue([e, ...n].join("."), i?.validIds);
            if (!Array.isArray(o)) return [];
            const d = i?.validIds ?? t.getState().getShadowMetadata(e, n)?.arrayKeys;
            if (!d)
              throw new Error("No array keys found for filtering.");
            const S = [];
            return o.filter(
              (c, s) => r(c, s) ? (S.push(d[s]), !0) : !1
            ), h({
              path: n,
              componentId: V,
              meta: {
                validIds: S,
                transforms: [
                  ...i?.transforms || [],
                  {
                    type: "filter",
                    fn: r
                  }
                ]
              }
            });
          };
        if (f === "stateSort")
          return (r) => {
            const o = t.getState().getShadowValue([e, ...n].join("."), i?.validIds);
            if (!Array.isArray(o)) return [];
            const d = i?.validIds ?? t.getState().getShadowMetadata(e, n)?.arrayKeys;
            if (!d)
              throw new Error("No array keys found for sorting");
            const S = o.map((c, s) => ({
              item: c,
              key: d[s]
            }));
            return S.sort((c, s) => r(c.item, s.item)).filter(Boolean), h({
              path: n,
              componentId: V,
              meta: {
                validIds: S.map((c) => c.key),
                transforms: [
                  ...i?.transforms || [],
                  { type: "sort", fn: r }
                ]
              }
            });
          };
        if (f === "stream")
          return function(r = {}) {
            const {
              bufferSize: o = 100,
              flushInterval: d = 100,
              bufferStrategy: S = "accumulate",
              store: c,
              onFlush: s
            } = r;
            let l = [], P = !1, w = null;
            const A = (B) => {
              if (!P) {
                if (S === "sliding" && l.length >= o)
                  l.shift();
                else if (S === "dropping" && l.length >= o)
                  return;
                l.push(B), l.length >= o && T();
              }
            }, T = () => {
              if (l.length === 0) return;
              const B = [...l];
              if (l = [], c) {
                const q = c(B);
                q !== void 0 && (Array.isArray(q) ? q : [q]).forEach((C) => {
                  a(C, n, {
                    updateType: "insert"
                  });
                });
              } else
                B.forEach((q) => {
                  a(q, n, {
                    updateType: "insert"
                  });
                });
              s?.(B);
            };
            d > 0 && (w = setInterval(T, d));
            const _ = te(), N = t.getState().getShadowMetadata(e, n) || {}, U = N.streams || /* @__PURE__ */ new Map();
            return U.set(_, { buffer: l, flushTimer: w }), t.getState().setShadowMetadata(e, n, {
              ...N,
              streams: U
            }), {
              write: (B) => A(B),
              writeMany: (B) => B.forEach(A),
              flush: () => T(),
              pause: () => {
                P = !0;
              },
              resume: () => {
                P = !1, l.length > 0 && T();
              },
              close: () => {
                T(), w && clearInterval(w);
                const B = t.getState().getShadowMetadata(e, n);
                B?.streams && B.streams.delete(_);
              }
            };
          };
        if (f === "stateList")
          return (r) => /* @__PURE__ */ re(() => {
            const d = G(/* @__PURE__ */ new Map()), S = i?.transforms && i.transforms.length > 0 ? `${V}-${xe(i.transforms)}` : `${V}-base`, [c, s] = K({}), { validIds: l, arrayValues: P } = fe(() => {
              const A = t.getState().getShadowMetadata(e, n)?.transformCaches?.get(S);
              let T;
              A && A.validIds ? T = A.validIds : (T = pe(
                e,
                n,
                i?.transforms
              ), t.getState().setTransformCache(e, n, S, {
                validIds: T,
                computedAt: Date.now(),
                transforms: i?.transforms || []
              }));
              const _ = t.getState().getShadowValue($, T);
              return {
                validIds: T,
                arrayValues: _ || []
              };
            }, [S, c]);
            if (Q(() => {
              const A = t.getState().subscribeToPath($, (T) => {
                if (T.type === "GET_SELECTED")
                  return;
                const N = t.getState().getShadowMetadata(e, n)?.transformCaches;
                if (N)
                  for (const U of N.keys())
                    U.startsWith(V) && N.delete(U);
                (T.type === "INSERT" || T.type === "REMOVE" || T.type === "CLEAR_SELECTION") && s({});
              });
              return () => {
                A();
              };
            }, [V, $]), !Array.isArray(P))
              return null;
            const w = h({
              path: n,
              componentId: V,
              meta: {
                ...i,
                validIds: l
              }
            });
            return /* @__PURE__ */ re(De, { children: P.map((A, T) => {
              const _ = l[T];
              if (!_)
                return null;
              let N = d.current.get(_);
              N || (N = te(), d.current.set(_, N));
              const U = _.split(".").slice(1);
              return ie(we, {
                key: _,
                stateKey: e,
                itemComponentId: N,
                itemPath: U,
                localIndex: T,
                arraySetter: w,
                rebuildStateShape: h,
                renderFn: r
              });
            }) });
          }, {});
        if (f === "stateFlattenOn")
          return (r) => {
            const o = t.getState().getShadowValue([e, ...n].join("."), i?.validIds);
            return Array.isArray(o) ? (o.flatMap(
              (S) => S[r] ?? []
            ), h({
              path: [...n, "[*]", r],
              componentId: V,
              meta: i
            })) : [];
          };
        if (f === "index")
          return (r) => {
            const d = t.getState().getShadowMetadata(e, n)?.arrayKeys?.filter(
              (c) => !i?.validIds || i?.validIds && i?.validIds?.includes(c)
            )?.[r];
            return d ? (t.getState().getShadowValue(d, i?.validIds), h({
              path: d.split(".").slice(1),
              componentId: V,
              meta: i
            })) : void 0;
          };
        if (f === "last")
          return () => {
            const r = t.getState().getShadowValue(e, n);
            if (r.length === 0) return;
            const o = r.length - 1;
            r[o];
            const d = [...n, o.toString()];
            return h({
              path: d,
              componentId: V,
              meta: i
            });
          };
        if (f === "insert")
          return (r, o) => (a(r, n, { updateType: "insert" }), h({
            path: n,
            componentId: V,
            meta: i
          }));
        if (f === "uniqueInsert")
          return (r, o, d) => {
            const S = t.getState().getShadowValue(e, n), c = ee(r) ? r(S) : r;
            let s = null;
            if (!S.some((P) => {
              const w = o ? o.every(
                (A) => oe(P[A], c[A])
              ) : oe(P, c);
              return w && (s = P), w;
            }))
              a(c, n, { updateType: "insert" });
            else if (d && s) {
              const P = d(s), w = S.map(
                (A) => oe(A, s) ? P : A
              );
              a(w, n, {
                updateType: "update"
              });
            }
          };
        if (f === "cut")
          return (r, o) => {
            const d = t.getState().getShadowValue([e, ...n].join("."), i?.validIds), S = i?.validIds ?? t.getState().getShadowMetadata(e, n)?.arrayKeys;
            if (!S || S.length === 0) return;
            const c = r == -1 ? S.length - 1 : r !== void 0 ? r : S.length - 1, s = S[c];
            if (!s) return;
            const l = s.split(".").slice(1);
            a(d, l, {
              updateType: "cut"
            });
          };
        if (f === "cutSelected")
          return () => {
            const r = pe(e, n, i?.transforms), o = t.getState().getShadowValue([e, ...n].join("."), i?.validIds);
            if (!r || r.length === 0) return;
            const d = t.getState().selectedIndicesMap.get($);
            let S = r.findIndex(
              (l) => l === d
            );
            const c = r[S == -1 ? r.length - 1 : S]?.split(".").slice(1);
            t.getState().clearSelectedIndex({ arrayKey: $ });
            const s = c?.slice(0, -1);
            ue(e, s), a(o, c, {
              updateType: "cut"
            });
          };
        if (f === "cutByValue")
          return (r) => {
            const o = t.getState().getShadowMetadata(e, n), d = i?.validIds ?? o?.arrayKeys;
            if (!d) return;
            let S = null;
            for (const c of d)
              if (t.getState().getShadowValue(c) === r) {
                S = c;
                break;
              }
            if (S) {
              const c = S.split(".").slice(1);
              a(null, c, { updateType: "cut" });
            }
          };
        if (f === "toggleByValue")
          return (r) => {
            const o = t.getState().getShadowMetadata(e, n), d = i?.validIds ?? o?.arrayKeys;
            if (!d) return;
            let S = null;
            for (const c of d) {
              const s = t.getState().getShadowValue(c);
              if (console.log("itemValue sdasdasdasd", s), s === r) {
                S = c;
                break;
              }
            }
            if (console.log("itemValue keyToCut", S), S) {
              const c = S.split(".").slice(1);
              console.log("itemValue keyToCut", S), a(r, c, {
                updateType: "cut"
              });
            } else
              a(r, n, { updateType: "insert" });
          };
        if (f === "findWith")
          return (r, o) => {
            const d = t.getState().getShadowMetadata(e, n)?.arrayKeys;
            if (!d)
              throw new Error("No array keys found for sorting");
            let S = [];
            for (const c of d) {
              let s = t.getState().getShadowValue(c, i?.validIds);
              if (s && s[r] === o) {
                S = c.split(".").slice(1);
                break;
              }
            }
            return h({
              path: S,
              componentId: V,
              meta: i
            });
          };
        if (f === "cutThis") {
          let r = t.getState().getShadowValue(n.join("."));
          return () => {
            a(r, n, { updateType: "cut" });
          };
        }
        if (f === "get")
          return () => (Te(e, V, n), t.getState().getShadowValue($, i?.validIds));
        if (f === "getState")
          return () => t.getState().getShadowValue($, i?.validIds);
        if (f === "$derive")
          return (r) => Ee({
            _stateKey: e,
            _path: n,
            _effect: r.toString(),
            _meta: i
          });
        if (f === "$get")
          return () => Ee({ _stateKey: e, _path: n, _meta: i });
        if (f === "lastSynced") {
          const r = `${e}:${n.join(".")}`;
          return t.getState().getSyncInfo(r);
        }
        if (f == "getLocalStorage")
          return (r) => Se(m + "-" + e + "-" + r);
        if (f === "isSelected") {
          const r = [e, ...n].slice(0, -1);
          if (ue(e, n, void 0), Array.isArray(
            t.getState().getShadowValue(r.join("."), i?.validIds)
          )) {
            n[n.length - 1];
            const o = r.join("."), d = t.getState().selectedIndicesMap.get(o), S = e + "." + n.join(".");
            return d === S;
          }
          return;
        }
        if (f === "setSelected")
          return (r) => {
            const o = n.slice(0, -1), d = e + "." + o.join("."), S = e + "." + n.join(".");
            ue(e, o, void 0), t.getState().selectedIndicesMap.get(d), r && t.getState().setSelectedIndex(d, S);
          };
        if (f === "toggleSelected")
          return () => {
            const r = n.slice(0, -1), o = e + "." + r.join("."), d = e + "." + n.join(".");
            t.getState().selectedIndicesMap.get(o) === d ? t.getState().clearSelectedIndex({ arrayKey: o }) : t.getState().setSelectedIndex(o, d);
          };
        if (f === "_componentId")
          return V;
        if (n.length == 0) {
          if (f === "addZodValidation")
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
          if (f === "clearZodValidation")
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
          if (f === "applyJsonPatch")
            return (r) => {
              const o = t.getState(), d = o.getShadowMetadata(e, []);
              if (!d?.components) return;
              const S = (s) => !s || s === "/" ? [] : s.split("/").slice(1).map((l) => l.replace(/~1/g, "/").replace(/~0/g, "~")), c = /* @__PURE__ */ new Set();
              for (const s of r) {
                const l = S(s.path);
                switch (s.op) {
                  case "add":
                  case "replace": {
                    const { value: P } = s;
                    o.updateShadowAtPath(e, l, P), o.markAsDirty(e, l, { bubble: !0 });
                    let w = [...l];
                    for (; ; ) {
                      const A = o.getShadowMetadata(
                        e,
                        w
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((T) => {
                        if (!c.has(T)) {
                          const _ = d.components?.get(T);
                          _ && (_.forceUpdate(), c.add(T));
                        }
                      }), w.length === 0) break;
                      w.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const P = l.slice(0, -1);
                    o.removeShadowArrayElement(e, l), o.markAsDirty(e, P, { bubble: !0 });
                    let w = [...P];
                    for (; ; ) {
                      const A = o.getShadowMetadata(
                        e,
                        w
                      );
                      if (A?.pathComponents && A.pathComponents.forEach((T) => {
                        if (!c.has(T)) {
                          const _ = d.components?.get(T);
                          _ && (_.forceUpdate(), c.add(T));
                        }
                      }), w.length === 0) break;
                      w.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (f === "getComponents")
            return () => t.getState().getShadowMetadata(e, [])?.components;
          if (f === "getAllFormRefs")
            return () => he.getState().getFormRefsByStateKey(e);
        }
        if (f === "getFormRef")
          return () => he.getState().getFormRef(e + "." + n.join("."));
        if (f === "validationWrapper")
          return ({
            children: r,
            hideMessage: o
          }) => /* @__PURE__ */ re(
            Ve,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: n,
              stateKey: e,
              children: r
            }
          );
        if (f === "_stateKey") return e;
        if (f === "_path") return n;
        if (f === "update")
          return M && (console.timeEnd(M), M = null), (r) => {
            const d = new Error().stack || "";
            if (d.includes("onClick") || d.includes("dispatchEvent") || d.includes("batchedUpdates")) {
              const c = `${e}.${n.join(".")}`;
              me || (le.clear(), me = !0, queueMicrotask(() => {
                for (const [l, P] of le) {
                  const w = l.split(".");
                  w[0];
                  const A = w.slice(1), T = P.reduce(
                    (_, N) => typeof N == "function" && typeof _ == "function" ? (U) => N(_(U)) : N
                  );
                  a(T, A, {
                    updateType: "update"
                  });
                }
                le.clear(), me = !1;
              }));
              const s = le.get(c) || [];
              s.push(r), le.set(c, s);
            } else
              console.time("update inner"), a(r, n, { updateType: "update" }), console.timeEnd("update inner");
            return {
              synced: () => {
                const c = t.getState().getShadowMetadata(e, n);
                t.getState().setShadowMetadata(e, n, {
                  ...c,
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
        if (f === "toggle") {
          const r = t.getState().getShadowValue([e, ...n].join("."), i?.validIds);
          if (typeof r != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            a(!r, n, {
              updateType: "update"
            });
          };
        }
        if (f === "formElement")
          return (r, o) => /* @__PURE__ */ re(
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
        const Y = [...n, f];
        return t.getState().getShadowValue(e, Y), h({
          path: Y,
          componentId: V,
          meta: i
        });
      }
    }, p = new Proxy(L, J);
    return v.set(F, p), console.timeEnd("rebuildStateShape Inner"), p;
  }
  console.timeEnd("rebuildStateShape Outer");
  const g = {
    revertToInitialState: (n) => {
      t.getState().getInitialOptions(e)?.validation;
      const i = t.getState().getShadowMetadata(e, []);
      i?.stateSource === "server" && i.baseServerState ? i.baseServerState : t.getState().initialStateGlobal[e];
      const V = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), t.getState().initializeShadowState(e, V), h({
        path: [],
        componentId: y
      });
      const j = ae(e), F = ee(j?.localStorage?.key) ? j?.localStorage?.key(V) : j?.localStorage?.key, $ = `${m}-${e}-${F}`;
      $ && localStorage.removeItem($);
      const L = t.getState().getShadowMetadata(e, []);
      return L && L?.components?.forEach((J) => {
        J.forceUpdate();
      }), V;
    },
    updateInitialState: (n) => {
      const i = Pe(
        e,
        a,
        y,
        m
      ), V = t.getState().initialStateGlobal[e], j = ae(e), F = ee(j?.localStorage?.key) ? j?.localStorage?.key(V) : j?.localStorage?.key, $ = `${m}-${e}-${F}`;
      return localStorage.getItem($) && localStorage.removeItem($), Re(() => {
        Ce(e, n), t.getState().initializeShadowState(e, n);
        const L = t.getState().getShadowMetadata(e, []);
        L && L?.components?.forEach((J) => {
          J.forceUpdate();
        });
      }), {
        fetchId: (L) => i.get()[L]
      };
    }
  };
  return h({
    componentId: y,
    path: []
  });
}
function Ee(e) {
  return ie(qe, { proxy: e });
}
function Be({
  proxy: e,
  rebuildStateShape: a
}) {
  const y = G(null), m = G(`map-${crypto.randomUUID()}`), v = G(!1), M = G(/* @__PURE__ */ new Map());
  Q(() => {
    const g = y.current;
    if (!g || v.current) return;
    const u = setTimeout(() => {
      const n = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, i = n.mapWrappers || [];
      i.push({
        instanceId: m.current,
        mapFn: e._mapFn,
        containerRef: g,
        rebuildStateShape: a,
        path: e._path,
        componentId: m.current,
        meta: e._meta
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...n,
        mapWrappers: i
      }), v.current = !0, h();
    }, 0);
    return () => {
      if (clearTimeout(u), m.current) {
        const n = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        n.mapWrappers && (n.mapWrappers = n.mapWrappers.filter(
          (i) => i.instanceId !== m.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, n));
      }
      M.current.forEach((n) => n.unmount());
    };
  }, []);
  const h = () => {
    const g = y.current;
    if (!g) return;
    const u = t.getState().getShadowValue(
      [e._stateKey, ...e._path].join("."),
      e._meta?.validIds
    );
    if (!Array.isArray(u)) return;
    const n = e._meta?.validIds ?? t.getState().getShadowMetadata(e._stateKey, e._path)?.arrayKeys ?? [], i = a({
      currentState: u,
      path: e._path,
      componentId: m.current,
      meta: e._meta
    });
    u.forEach((V, j) => {
      const F = n[j];
      if (!F) return;
      const $ = te(), L = document.createElement("div");
      L.setAttribute("data-item-path", F), g.appendChild(L);
      const J = be(L);
      M.current.set(F, J);
      const p = F.split(".").slice(1);
      J.render(
        ie(we, {
          stateKey: e._stateKey,
          itemComponentId: $,
          itemPath: p,
          localIndex: j,
          arraySetter: i,
          rebuildStateShape: a,
          renderFn: e._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ re("div", { ref: y, "data-map-container": m.current });
}
function qe({
  proxy: e
}) {
  const a = G(null), y = G(null), m = G(!1), v = `${e._stateKey}-${e._path.join(".")}`, M = t.getState().getShadowValue(
    [e._stateKey, ...e._path].join("."),
    e._meta?.validIds
  );
  return Q(() => {
    const h = a.current;
    if (!h || m.current) return;
    const g = setTimeout(() => {
      if (!h.parentElement) {
        console.warn("Parent element not found for signal", v);
        return;
      }
      const u = h.parentElement, i = Array.from(u.childNodes).indexOf(h);
      let V = u.getAttribute("data-parent-id");
      V || (V = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", V)), y.current = `instance-${crypto.randomUUID()}`;
      const j = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, F = j.signals || [];
      F.push({
        instanceId: y.current,
        parentId: V,
        position: i,
        effect: e._effect
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...j,
        signals: F
      });
      let $ = M;
      if (e._effect)
        try {
          $ = new Function(
            "state",
            `return (${e._effect})(state)`
          )(M);
        } catch (J) {
          console.error("Error evaluating effect function:", J);
        }
      $ !== null && typeof $ == "object" && ($ = JSON.stringify($));
      const L = document.createTextNode(String($ ?? ""));
      h.replaceWith(L), m.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(g), y.current) {
        const u = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        u.signals && (u.signals = u.signals.filter(
          (n) => n.instanceId !== y.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, u));
      }
    };
  }, []), ie("span", {
    ref: a,
    style: { display: "contents" },
    "data-signal-id": v
  });
}
const we = Oe(
  Ge,
  (e, a) => e.itemPath.join(".") === a.itemPath.join(".") && e.stateKey === a.stateKey && e.itemComponentId === a.itemComponentId && e.localIndex === a.localIndex
), ze = (e) => {
  const [a, y] = K(!1);
  return de(() => {
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
    const M = () => {
      v++, v === m.length && y(!0);
    };
    return m.forEach((h) => {
      h.complete ? M() : (h.addEventListener("load", M), h.addEventListener("error", M));
    }), () => {
      m.forEach((h) => {
        h.removeEventListener("load", M), h.removeEventListener("error", M);
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
  rebuildStateShape: M,
  renderFn: h
}) {
  const [, g] = K({}), { ref: u, inView: n } = Ne(), i = G(null), V = ze(i), j = G(!1), F = [e, ...y].join(".");
  ke(e, a, g);
  const $ = se(
    (f) => {
      i.current = f, u(f);
    },
    [u]
  );
  Q(() => {
    t.getState().subscribeToPath(F, (f) => {
      g({});
    });
  }, []), Q(() => {
    if (!n || !V || j.current)
      return;
    const f = i.current;
    if (f && f.offsetHeight > 0) {
      j.current = !0;
      const X = f.offsetHeight;
      t.getState().setShadowMetadata(e, y, {
        virtualizer: {
          itemHeight: X,
          domRef: f
        }
      });
      const Y = y.slice(0, -1), r = [e, ...Y].join(".");
      t.getState().notifyPathSubscribers(r, {
        type: "ITEMHEIGHT",
        itemKey: y.join("."),
        ref: i.current
      });
    }
  }, [n, V, e, y]);
  const L = [e, ...y].join("."), J = t.getState().getShadowValue(L);
  if (J === void 0)
    return null;
  const p = M({
    currentState: J,
    path: y,
    componentId: a
  }), W = h(p, m, v);
  return /* @__PURE__ */ re("div", { ref: $, children: W });
}
function Je({
  stateKey: e,
  path: a,
  rebuildStateShape: y,
  renderFn: m,
  formOpts: v,
  setState: M
}) {
  const [h] = K(() => te()), [, g] = K({}), u = [e, ...a].join(".");
  ke(e, h, g);
  const n = t.getState().getShadowValue(u), [i, V] = K(n), j = G(!1), F = G(null);
  Q(() => {
    !j.current && !oe(n, i) && V(n);
  }, [n]), Q(() => {
    const W = t.getState().subscribeToPath(u, (f) => {
      !j.current && i !== f && g({});
    });
    return () => {
      W(), F.current && (clearTimeout(F.current), j.current = !1);
    };
  }, []);
  const $ = se(
    (W) => {
      typeof n === "number" && typeof W == "string" && (W = W === "" ? 0 : Number(W)), V(W), j.current = !0, F.current && clearTimeout(F.current);
      const X = v?.debounceTime ?? 200;
      F.current = setTimeout(() => {
        j.current = !1, M(W, a, { updateType: "update" });
        const { getInitialOptions: Y, setShadowMetadata: r, getShadowMetadata: o } = t.getState(), d = Y(e)?.validation, S = d?.zodSchemaV4 || d?.zodSchemaV3;
        if (S) {
          const c = t.getState().getShadowValue(e), s = S.safeParse(c), l = o(e, a) || {};
          if (s.success)
            r(e, a, {
              ...l,
              validation: {
                status: "VALID_LIVE",
                validatedValue: W,
                message: void 0
              }
            });
          else {
            const w = ("issues" in s.error ? s.error.issues : s.error.errors).filter(
              (A) => JSON.stringify(A.path) === JSON.stringify(a)
            );
            w.length > 0 ? r(e, a, {
              ...l,
              validation: {
                status: "INVALID_LIVE",
                message: w[0]?.message,
                validatedValue: W
              }
            }) : r(e, a, {
              ...l,
              validation: {
                status: "VALID_LIVE",
                validatedValue: W,
                message: void 0
              }
            });
          }
        }
      }, X), g({});
    },
    [M, a, v?.debounceTime, e]
  ), L = se(async () => {
    console.log("handleBlur triggered"), F.current && (clearTimeout(F.current), F.current = null, j.current = !1, M(i, a, { updateType: "update" }));
    const { getInitialOptions: W } = t.getState(), f = W(e)?.validation, X = f?.zodSchemaV4 || f?.zodSchemaV3;
    if (!X) return;
    const Y = t.getState().getShadowMetadata(e, a);
    t.getState().setShadowMetadata(e, a, {
      ...Y,
      validation: {
        status: "DIRTY",
        validatedValue: i
      }
    });
    const r = t.getState().getShadowValue(e), o = X.safeParse(r);
    if (console.log("result ", o), o.success)
      t.getState().setShadowMetadata(e, a, {
        ...Y,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: i
        }
      });
    else {
      const d = "issues" in o.error ? o.error.issues : o.error.errors;
      console.log("All validation errors:", d), console.log("Current blur path:", a);
      const S = d.filter((c) => {
        if (console.log("Processing error:", c), a.some((l) => l.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const l = a[0].startsWith("id:") ? [] : a.slice(0, -1);
          console.log("Parent path:", l);
          const P = t.getState().getShadowMetadata(e, l);
          if (console.log("Array metadata:", P), P?.arrayKeys) {
            const w = [e, ...a.slice(0, -1)].join("."), A = P.arrayKeys.indexOf(w);
            console.log("Item key:", w, "Index:", A);
            const T = [...l, A, ...a.slice(-1)], _ = JSON.stringify(c.path) === JSON.stringify(T);
            return console.log("Zod path comparison:", {
              zodPath: T,
              errorPath: c.path,
              match: _
            }), _;
          }
        }
        const s = JSON.stringify(c.path) === JSON.stringify(a);
        return console.log("Direct path comparison:", {
          errorPath: c.path,
          currentPath: a,
          match: s
        }), s;
      });
      console.log("Filtered path errors:", S), t.getState().setShadowMetadata(e, a, {
        ...Y,
        validation: {
          status: "VALIDATION_FAILED",
          message: S[0]?.message,
          validatedValue: i
        }
      });
    }
    g({});
  }, [e, a, i, M]), J = y({
    currentState: n,
    path: a,
    componentId: h
  }), p = new Proxy(J, {
    get(W, f) {
      return f === "inputProps" ? {
        value: i ?? "",
        onChange: (X) => {
          $(X.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: L,
        ref: he.getState().getFormRef(e + "." + a.join("."))
      } : W[f];
    }
  });
  return /* @__PURE__ */ re(Ve, { formOpts: v, path: a, stateKey: e, children: m(p) });
}
function ke(e, a, y) {
  const m = `${e}////${a}`;
  de(() => {
    const { registerComponent: v, unregisterComponent: M } = t.getState();
    return v(e, m, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      M(e, m);
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
