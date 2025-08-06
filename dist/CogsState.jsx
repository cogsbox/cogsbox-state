"use client";
import { jsx as ne, Fragment as De } from "react/jsx-runtime";
import { memo as Oe, useState as X, useRef as B, useCallback as se, useEffect as Q, useLayoutEffect as ue, useMemo as fe, createElement as ie, startTransition as Ue } from "react";
import { createRoot as Ee } from "react-dom/client";
import { transformStateFunc as $e, isFunction as ee, isArray as Ie, getDifferences as Ve, isDeepEqual as oe } from "./utility.js";
import { ValidationWrapper as _e } from "./Functions.jsx";
import Re from "superjson";
import { v4 as te } from "uuid";
import { getGlobalStore as r, formRefStore as me } from "./store.js";
import { useCogsConfig as Ae } from "./CogsStateClient.jsx";
import { useInView as Ne } from "react-intersection-observer";
function ge(e, a) {
  const m = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, p = m(e) || {};
  f(e, {
    ...p,
    ...a
  });
}
function Me({
  stateKey: e,
  options: a,
  initialOptionsPart: m
}) {
  const f = ae(e) || {}, p = m[e] || {}, S = r.getState().setInitialStateOptions, T = { ...p, ...f };
  let y = !1;
  if (a)
    for (const t in a)
      T.hasOwnProperty(t) ? (t == "localStorage" && a[t] && T[t].key !== a[t]?.key && (y = !0, T[t] = a[t]), t == "defaultState" && a[t] && T[t] !== a[t] && !oe(T[t], a[t]) && (y = !0, T[t] = a[t])) : (y = !0, T[t] = a[t]);
  T.syncOptions && (!a || !a.hasOwnProperty("syncOptions")) && (y = !0), y && S(e, T);
}
function ot(e, { formElements: a, validation: m }) {
  return { initialState: e, formElements: a, validation: m };
}
const Fe = (e, a) => {
  let m = e;
  const [f, p] = $e(m);
  a?.__fromSyncSchema && a?.__syncNotifications && r.getState().setInitialStateOptions("__notifications", a.__syncNotifications), a?.__fromSyncSchema && a?.__apiParamsMap && r.getState().setInitialStateOptions("__apiParamsMap", a.__apiParamsMap), Object.keys(f).forEach((y) => {
    let t = p[y] || {};
    const s = {
      ...t
    };
    if (a?.formElements && (s.formElements = {
      ...a.formElements,
      ...t.formElements || {}
    }), a?.validation && (s.validation = {
      ...a.validation,
      ...t.validation || {}
    }, a.validation.key && !t.validation?.key && (s.validation.key = `${a.validation.key}.${y}`)), a?.__syncSchemas?.[y]?.schemas?.validation && (s.validation = {
      zodSchemaV4: a.__syncSchemas[y].schemas.validation,
      ...t.validation
    }), Object.keys(s).length > 0) {
      const v = ae(y);
      v ? r.getState().setInitialStateOptions(y, {
        ...v,
        ...s
      }) : r.getState().setInitialStateOptions(y, s);
    }
  }), Object.keys(f).forEach((y) => {
    r.getState().initializeShadowState(y, f[y]);
  });
  const S = (y, t) => {
    const [s] = X(t?.componentId ?? te());
    Me({
      stateKey: y,
      options: t,
      initialOptionsPart: p
    });
    const v = r.getState().getShadowValue(y) || f[y], F = t?.modifyState ? t.modifyState(v) : v;
    return He(F, {
      stateKey: y,
      syncUpdate: t?.syncUpdate,
      componentId: s,
      localStorage: t?.localStorage,
      middleware: t?.middleware,
      reactiveType: t?.reactiveType,
      reactiveDeps: t?.reactiveDeps,
      defaultState: t?.defaultState,
      dependencies: t?.dependencies,
      serverState: t?.serverState,
      syncOptions: t?.syncOptions,
      __useSync: a?.__useSync
    });
  };
  function T(y, t) {
    Me({ stateKey: y, options: t, initialOptionsPart: p }), t.localStorage && We(y, t), ve(y);
  }
  return { useCogsState: S, setCogsOptions: T };
};
function st(e, a) {
  const m = e.schemas, f = {}, p = {};
  for (const S in m) {
    const T = m[S];
    f[S] = T?.schemas?.defaultValues || {}, T?.api?.queryData?._paramType && (p[S] = T.api.queryData._paramType);
  }
  return Fe(f, {
    __fromSyncSchema: !0,
    __syncNotifications: e.notifications,
    __apiParamsMap: p,
    __useSync: a,
    __syncSchemas: m
  });
}
const {
  getInitialOptions: ae,
  addStateLog: je,
  updateInitialStateGlobal: Ce
} = r.getState(), Le = (e, a, m, f, p) => {
  m?.log && console.log(
    "saving to localstorage",
    a,
    m.localStorage?.key,
    f
  );
  const S = ee(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (S && f) {
    const T = `${f}-${a}-${S}`;
    let y;
    try {
      y = Se(T)?.lastSyncedWithServer;
    } catch {
    }
    const t = r.getState().getShadowMetadata(a, []), s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, v = Re.serialize(s);
    window.localStorage.setItem(
      T,
      JSON.stringify(v.json)
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
}, We = (e, a) => {
  const m = r.getState().getShadowValue(e), { sessionId: f } = Ae(), p = ee(a?.localStorage?.key) ? a.localStorage.key(m) : a?.localStorage?.key;
  if (p && f) {
    const S = Se(
      `${f}-${e}-${p}`
    );
    if (S && S.lastUpdated > (S.lastSyncedWithServer || 0))
      return ve(e), !0;
  }
  return !1;
}, ve = (e) => {
  const a = r.getState().getShadowMetadata(e, []);
  if (!a) return;
  const m = /* @__PURE__ */ new Set();
  a?.components?.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, it = (e, a) => {
  const m = r.getState().getShadowMetadata(e, []);
  if (m) {
    const f = `${e}////${a}`, p = m?.components?.get(f);
    if ((p ? Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"] : null)?.includes("none"))
      return;
    p && p.forceUpdate();
  }
};
function ye(e, a, m, f) {
  const p = r.getState(), S = p.getShadowMetadata(e, a);
  if (p.setShadowMetadata(e, a, {
    ...S,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: f || Date.now()
  }), Array.isArray(m)) {
    const T = p.getShadowMetadata(e, a);
    T?.arrayKeys && T.arrayKeys.forEach((y, t) => {
      const s = y.split(".").slice(1), v = m[t];
      v !== void 0 && ye(
        e,
        s,
        v,
        f
      );
    });
  } else m && typeof m == "object" && m.constructor === Object && Object.keys(m).forEach((T) => {
    const y = [...a, T], t = m[T];
    ye(e, y, t, f);
  });
}
let le = /* @__PURE__ */ new Map(), he = !1;
function He(e, {
  stateKey: a,
  localStorage: m,
  formElements: f,
  reactiveDeps: p,
  reactiveType: S,
  componentId: T,
  defaultState: y,
  syncUpdate: t,
  dependencies: s,
  serverState: v,
  __useSync: F
} = {}) {
  const [j, O] = X({}), { sessionId: N } = Ae();
  let G = !a;
  const [g] = X(a ?? te()), K = B(T ?? te()), h = B(
    null
  );
  h.current = ae(g) ?? null, Q(() => {
    if (t && t.stateKey === g && t.path?.[0]) {
      const l = `${t.stateKey}:${t.path.join(".")}`;
      r.getState().setSyncInfo(l, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]);
  const W = se(
    (l) => {
      const c = l ? { ...ae(g), ...l } : ae(g), A = c?.defaultState || y || e;
      if (c?.serverState?.status === "success" && c?.serverState?.data !== void 0)
        return {
          value: c.serverState.data,
          source: "server",
          timestamp: c.serverState.timestamp || Date.now()
        };
      if (c?.localStorage?.key && N) {
        const E = ee(c.localStorage.key) ? c.localStorage.key(A) : c.localStorage.key, I = Se(
          `${N}-${g}-${E}`
        );
        if (I && I.lastUpdated > (c?.serverState?.timestamp || 0))
          return {
            value: I.state,
            source: "localStorage",
            timestamp: I.lastUpdated
          };
      }
      return {
        value: A || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [g, y, e, N]
  );
  Q(() => {
    r.getState().setServerStateUpdate(g, v);
  }, [v, g]), Q(() => r.getState().subscribeToPath(g, (i) => {
    if (i?.type === "SERVER_STATE_UPDATE") {
      const c = i.serverState;
      if (console.log("SERVER_STATE_UPDATE", i), c?.status === "success" && c.data !== void 0) {
        ge(g, { serverState: c });
        const w = typeof c.merge == "object" ? c.merge : c.merge === !0 ? {} : null, E = r.getState().getShadowValue(g), I = c.data;
        if (w && Array.isArray(E) && Array.isArray(I)) {
          const R = w.key, D = new Set(
            E.map((x) => x[R])
          ), q = I.filter((x) => !D.has(x[R]));
          q.length > 0 && q.forEach((x) => {
            r.getState().insertShadowArrayElement(g, [], x);
            const z = r.getState().getShadowMetadata(g, []);
            if (z?.arrayKeys) {
              const C = z.arrayKeys[z.arrayKeys.length - 1];
              if (C) {
                const U = C.split(".").slice(1);
                r.getState().setShadowMetadata(g, U, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: c.timestamp || Date.now()
                });
                const M = r.getState().getShadowValue(C);
                M && typeof M == "object" && !Array.isArray(M) && Object.keys(M).forEach((b) => {
                  const V = [...U, b];
                  r.getState().setShadowMetadata(g, V, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: c.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          r.getState().initializeShadowState(g, I), ye(
            g,
            [],
            I,
            c.timestamp
          );
        const _ = r.getState().getShadowMetadata(g, []);
        r.getState().setShadowMetadata(g, [], {
          ..._,
          stateSource: "server",
          lastServerSync: c.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [g, W]), Q(() => {
    const l = r.getState().getShadowMetadata(g, []);
    if (l && l.stateSource)
      return;
    const i = ae(g), c = {
      syncEnabled: !!u && !!d,
      validationEnabled: !!(i?.validation?.zodSchemaV4 || i?.validation?.zodSchemaV3),
      localStorageEnabled: !!i?.localStorage?.key
    };
    if (r.getState().setShadowMetadata(g, [], {
      ...l,
      features: c
    }), i?.defaultState !== void 0 || y !== void 0) {
      const A = i?.defaultState || y;
      i?.defaultState || ge(g, {
        defaultState: A
      });
      const { value: w, source: E, timestamp: I } = W();
      r.getState().initializeShadowState(g, w), r.getState().setShadowMetadata(g, [], {
        stateSource: E,
        lastServerSync: E === "server" ? I : void 0,
        isDirty: !1,
        baseServerState: E === "server" ? w : void 0
      }), ve(g);
    }
  }, [g, ...s || []]), ue(() => {
    G && ge(g, {
      formElements: f,
      defaultState: y,
      localStorage: m,
      middleware: h.current?.middleware
    });
    const l = `${g}////${K.current}`, i = r.getState().getShadowMetadata(g, []), c = i?.components || /* @__PURE__ */ new Map();
    return c.set(l, {
      forceUpdate: () => O({}),
      reactiveType: S ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: p || void 0,
      deps: p ? p(r.getState().getShadowValue(g)) : [],
      prevDeps: p ? p(r.getState().getShadowValue(g)) : []
    }), r.getState().setShadowMetadata(g, [], {
      ...i,
      components: c
    }), O({}), () => {
      const A = r.getState().getShadowMetadata(g, []), w = A?.components?.get(l);
      w?.paths && w.paths.forEach((E) => {
        const _ = E.split(".").slice(1), R = r.getState().getShadowMetadata(g, _);
        R?.pathComponents && R.pathComponents.size === 0 && (delete R.pathComponents, r.getState().setShadowMetadata(g, _, R));
      }), A?.components && r.getState().setShadowMetadata(g, [], A);
    };
  }, []);
  const J = B(null), n = (l, i, c) => {
    const A = [g, ...i].join("."), w = r.getState(), E = w.getShadowMetadata(g, i), I = w.getShadowValue(A), _ = c.updateType === "insert" && ee(l) ? l({ state: I, uuid: te() }) : ee(l) ? l(I) : l, D = {
      timeStamp: Date.now(),
      stateKey: g,
      path: i,
      updateType: c.updateType,
      status: "new",
      oldValue: I,
      newValue: _
    };
    switch (c.updateType) {
      case "insert": {
        w.insertShadowArrayElement(g, i, D.newValue), w.markAsDirty(g, i, { bubble: !0 });
        const C = E;
        if (C?.arrayKeys) {
          const U = C.arrayKeys[C.arrayKeys.length - 1];
          if (U) {
            const M = U.split(".").slice(1);
            w.markAsDirty(g, M, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const C = i.slice(0, -1);
        w.removeShadowArrayElement(g, i), w.markAsDirty(g, C, { bubble: !0 });
        break;
      }
      case "update": {
        w.updateShadowAtPath(g, i, D.newValue), w.markAsDirty(g, i, { bubble: !0 });
        break;
      }
    }
    if (c.sync !== !1 && J.current && J.current.connected && J.current.updateState({ operation: D }), E?.signals && E.signals.length > 0) {
      const C = c.updateType === "cut" ? null : _;
      E.signals.forEach(({ parentId: U, position: M, effect: b }) => {
        const V = document.querySelector(`[data-parent-id="${U}"]`);
        if (V) {
          const k = Array.from(V.childNodes);
          if (k[M]) {
            let P = C;
            if (b && C !== null)
              try {
                P = new Function(
                  "state",
                  `return (${b})(state)`
                )(C);
              } catch ($) {
                console.error("Error evaluating effect function:", $);
              }
            P != null && typeof P == "object" && (P = JSON.stringify(P)), k[M].textContent = String(P ?? "");
          }
        }
      });
    }
    if (c.updateType === "insert" && E?.mapWrappers && E.mapWrappers.length > 0) {
      const C = w.getShadowMetadata(g, i)?.arrayKeys || [], U = C[C.length - 1], M = w.getShadowValue(U), b = w.getShadowValue(
        [g, ...i].join(".")
      );
      if (!U || M === void 0) return;
      E.mapWrappers.forEach((V) => {
        let k = !0, P = -1;
        if (V.meta?.transforms && V.meta.transforms.length > 0) {
          for (const $ of V.meta.transforms)
            if ($.type === "filter" && !$.fn(M, -1)) {
              k = !1;
              break;
            }
          if (k) {
            const $ = pe(
              g,
              i,
              V.meta.transforms
            ), Y = V.meta.transforms.find(
              (L) => L.type === "sort"
            );
            if (Y) {
              const L = $.map((H) => ({
                key: H,
                value: w.getShadowValue(H)
              }));
              L.push({ key: U, value: M }), L.sort((H, re) => Y.fn(H.value, re.value)), P = L.findIndex(
                (H) => H.key === U
              );
            } else
              P = $.length;
          }
        } else
          k = !0, P = C.length - 1;
        if (k && V.containerRef && V.containerRef.isConnected) {
          const $ = document.createElement("div");
          $.setAttribute("data-item-path", U);
          const Y = Array.from(V.containerRef.children);
          P >= 0 && P < Y.length ? V.containerRef.insertBefore(
            $,
            Y[P]
          ) : V.containerRef.appendChild($);
          const L = Ee($), H = te(), re = U.split(".").slice(1), ce = V.rebuildStateShape({
            path: V.path,
            currentState: b,
            componentId: V.componentId,
            meta: V.meta
          });
          L.render(
            ie(we, {
              stateKey: g,
              itemComponentId: H,
              itemPath: re,
              localIndex: P,
              arraySetter: ce,
              rebuildStateShape: V.rebuildStateShape,
              renderFn: V.mapFn
            })
          );
        }
      });
    }
    if (c.updateType === "cut") {
      const C = i.slice(0, -1), U = w.getShadowMetadata(g, C);
      U?.mapWrappers && U.mapWrappers.length > 0 && U.mapWrappers.forEach((M) => {
        if (M.containerRef && M.containerRef.isConnected) {
          const b = M.containerRef.querySelector(
            `[data-item-path="${A}"]`
          );
          b && b.remove();
        }
      });
    }
    const x = w.getShadowMetadata(g, []), z = /* @__PURE__ */ new Set();
    if (x?.components) {
      if (c.updateType === "update") {
        let C = [...i];
        for (; ; ) {
          const U = w.getShadowMetadata(g, C);
          if (U?.pathComponents && U.pathComponents.forEach((M) => {
            if (z.has(M))
              return;
            const b = x.components?.get(M);
            b && ((Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"]).includes("none") || (b.forceUpdate(), z.add(M)));
          }), C.length === 0)
            break;
          C.pop();
        }
        _ && typeof _ == "object" && !Ie(_) && I && typeof I == "object" && !Ie(I) && Ve(_, I).forEach((M) => {
          const b = M.split("."), V = [...i, ...b], k = w.getShadowMetadata(g, V);
          k?.pathComponents && k.pathComponents.forEach((P) => {
            if (z.has(P))
              return;
            const $ = x.components?.get(P);
            $ && ((Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"]).includes("none") || ($.forceUpdate(), z.add(P)));
          });
        });
      } else if (c.updateType === "insert" || c.updateType === "cut") {
        const C = c.updateType === "insert" ? i : i.slice(0, -1), U = w.getShadowMetadata(g, C);
        if (U?.signals && U.signals.length > 0) {
          const M = [g, ...C].join("."), b = w.getShadowValue(M);
          U.signals.forEach(({ parentId: V, position: k, effect: P }) => {
            const $ = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if ($) {
              const Y = Array.from($.childNodes);
              if (Y[k]) {
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
                L != null && typeof L == "object" && (L = JSON.stringify(L)), Y[k].textContent = String(L ?? "");
              }
            }
          });
        }
        U?.pathComponents && U.pathComponents.forEach((M) => {
          if (!z.has(M)) {
            const b = x.components?.get(M);
            b && (b.forceUpdate(), z.add(M));
          }
        });
      }
      x.components.forEach((C, U) => {
        if (z.has(U))
          return;
        const M = Array.isArray(C.reactiveType) ? C.reactiveType : [C.reactiveType || "component"];
        if (M.includes("all")) {
          C.forceUpdate(), z.add(U);
          return;
        }
        if (M.includes("deps") && C.depsFunction) {
          const b = w.getShadowValue(g), V = C.depsFunction(b);
          let k = !1;
          V === !0 ? k = !0 : Array.isArray(V) && (oe(C.prevDeps, V) || (C.prevDeps = V, k = !0)), k && (C.forceUpdate(), z.add(U));
        }
      }), z.clear(), je(g, D), Le(
        _,
        g,
        h.current,
        N
      ), h.current?.middleware && h.current.middleware({
        update: D
      });
    }
  };
  r.getState().initialStateGlobal[g] || Ce(g, e);
  const o = fe(() => Pe(
    g,
    n,
    K.current,
    N
  ), [g, N]), u = F, d = h.current?.syncOptions;
  return u && (J.current = u(
    o,
    d ?? {}
  )), o;
}
function xe(e) {
  return !e || e.length === 0 ? "" : e.map(
    (a) => `${a.type}${JSON.stringify(a.dependencies || [])}`
  ).join("");
}
const pe = (e, a, m) => {
  let f = r.getState().getShadowMetadata(e, a)?.arrayKeys || [];
  if (!m || m.length === 0)
    return f;
  let p = f.map((S) => ({
    key: S,
    value: r.getState().getShadowValue(S)
  }));
  for (const S of m)
    S.type === "filter" ? p = p.filter(
      ({ value: T }, y) => S.fn(T, y)
    ) : S.type === "sort" && p.sort((T, y) => S.fn(T.value, y.value));
  return p.map(({ key: S }) => S);
}, Te = (e, a, m) => {
  const f = `${e}////${a}`, { addPathComponent: p, getShadowMetadata: S } = r.getState(), y = S(e, [])?.components?.get(f);
  !y || y.reactiveType === "none" || !(Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType]).includes("component") || p(e, m, f);
}, de = (e, a, m) => {
  const f = r.getState(), p = f.getShadowMetadata(e, []), S = /* @__PURE__ */ new Set();
  p?.components && p.components.forEach((y, t) => {
    (Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"]).includes("all") && (y.forceUpdate(), S.add(t));
  }), f.getShadowMetadata(e, [...a, "getSelected"])?.pathComponents?.forEach((y) => {
    p?.components?.get(y)?.forceUpdate();
  });
  const T = f.getShadowMetadata(e, a);
  for (let y of T?.arrayKeys || []) {
    const t = y + ".selected", s = f.getShadowMetadata(
      e,
      t.split(".").slice(1)
    );
    y == m && s?.pathComponents?.forEach((v) => {
      p?.components?.get(v)?.forceUpdate();
    });
  }
};
function Z(e, a, m) {
  const f = r.getState(), p = f.getShadowMetadata(e, a);
  if (p?.value !== void 0)
    return {
      store: f,
      shadowMeta: p,
      value: p.value,
      // Directly return the primitive value
      arrayKeys: void 0
      // Primitives don't have array keys
    };
  const S = m?.validIds ?? p?.arrayKeys, T = f.getShadowValue([e, ...a].join("."), S);
  return {
    store: f,
    shadowMeta: p,
    value: T,
    arrayKeys: S
  };
}
function Pe(e, a, m, f) {
  const p = /* @__PURE__ */ new Map();
  function S({
    path: t = [],
    meta: s,
    componentId: v
  }) {
    const F = s ? JSON.stringify(s.validIds || s.transforms) : "", j = t.join(".") + ":" + F;
    if (p.has(j))
      return p.get(j);
    const O = [e, ...t].join("."), N = function() {
      return r().getShadowValue(e, t);
    }, G = {
      get(K, h) {
        if (h === "_rebuildStateShape")
          return S;
        if (Object.getOwnPropertyNames(T).includes(h) && t.length === 0)
          return T[h];
        if (h === "getDifferences")
          return () => {
            const { value: n, shadowMeta: o } = Z(
              e,
              t,
              s
            ), u = o?.baseServerState ?? r.getState().initialStateGlobal[e];
            return Ve(n, u);
          };
        if (h === "sync" && t.length === 0)
          return async function() {
            const n = r.getState().getInitialOptions(e), o = n?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const u = r.getState().getShadowValue(e, []), d = n?.validation?.key;
            try {
              const l = await o.action(u);
              if (l && !l.success && l.errors, l?.success) {
                const i = r.getState().getShadowMetadata(e, []);
                r.getState().setShadowMetadata(e, [], {
                  ...i,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: u
                  // Update base server state
                }), o.onSuccess && o.onSuccess(l.data);
              } else !l?.success && o.onError && o.onError(l.error);
              return l;
            } catch (l) {
              return o.onError && o.onError(l), { success: !1, error: l };
            }
          };
        if (h === "_status" || h === "getStatus") {
          const n = () => {
            const { shadowMeta: o, value: u } = Z(e, t, s);
            return o?.isDirty === !0 ? "dirty" : o?.stateSource === "server" || o?.isDirty === !1 ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" || u !== void 0 && !o ? "fresh" : "unknown";
          };
          return h === "_status" ? n() : n;
        }
        if (h === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], o = ae(e), u = ee(o?.localStorage?.key) ? o.localStorage.key(n) : o?.localStorage?.key, d = `${f}-${e}-${u}`;
            d && localStorage.removeItem(d);
          };
        if (h === "showValidationErrors")
          return () => {
            const { shadowMeta: n } = Z(e, t, s);
            return n?.validation?.status === "INVALID" && n.validation.errors.length > 0 ? n.validation.errors.filter((o) => o.severity === "error").map((o) => o.message) : [];
          };
        if (h === "getSelected")
          return () => {
            const n = e + "." + t.join(".");
            Te(e, v, [
              ...t,
              "getSelected"
            ]);
            const o = r.getState().selectedIndicesMap;
            if (!o || !o.has(n))
              return;
            const u = o.get(n);
            if (!(s?.validIds && !s.validIds.includes(u) || !r.getState().getShadowValue(u)))
              return S({
                path: u.split(".").slice(1),
                componentId: v
              });
          };
        if (h === "getSelectedIndex")
          return () => r.getState().getSelectedIndex(
            e + "." + t.join("."),
            s?.validIds
          );
        if (h === "clearSelected")
          return de(e, t), () => {
            r.getState().clearSelectedIndex({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (h === "useVirtualView")
          return (n) => {
            const {
              itemHeight: o = 50,
              overscan: u = 6,
              stickToBottom: d = !1,
              scrollStickTolerance: l = 75
            } = n, i = B(null), [c, A] = X({
              startIndex: 0,
              endIndex: 10
            }), [w, E] = X({}), I = B(!0), _ = B({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), R = B(
              /* @__PURE__ */ new Map()
            );
            ue(() => {
              if (!d || !i.current || _.current.isUserScrolling)
                return;
              const M = i.current;
              M.scrollTo({
                top: M.scrollHeight,
                behavior: I.current ? "instant" : "smooth"
              });
            }, [w, d]);
            const { arrayKeys: D = [] } = Z(e, t, s), { totalHeight: q, itemOffsets: x } = fe(() => {
              let M = 0;
              const b = /* @__PURE__ */ new Map();
              return (r.getState().getShadowMetadata(e, t)?.arrayKeys || []).forEach((k) => {
                const P = k.split(".").slice(1), $ = r.getState().getShadowMetadata(e, P)?.virtualizer?.itemHeight || o;
                b.set(k, {
                  height: $,
                  offset: M
                }), M += $;
              }), R.current = b, { totalHeight: M, itemOffsets: b };
            }, [D.length, o]);
            ue(() => {
              if (d && D.length > 0 && i.current && !_.current.isUserScrolling && I.current) {
                const M = i.current, b = () => {
                  if (M.clientHeight > 0) {
                    const V = Math.ceil(
                      M.clientHeight / o
                    ), k = D.length - 1, P = Math.max(
                      0,
                      k - V - u
                    );
                    A({ startIndex: P, endIndex: k }), requestAnimationFrame(() => {
                      C("instant"), I.current = !1;
                    });
                  } else
                    requestAnimationFrame(b);
                };
                b();
              }
            }, [D.length, d, o, u]);
            const z = se(() => {
              const M = i.current;
              if (!M) return;
              const b = M.scrollTop, { scrollHeight: V, clientHeight: k } = M, P = _.current, $ = V - (b + k), Y = P.isNearBottom;
              P.isNearBottom = $ <= l, b < P.lastScrollTop ? (P.scrollUpCount++, P.scrollUpCount > 3 && Y && (P.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : P.isNearBottom && (P.isUserScrolling = !1, P.scrollUpCount = 0), P.lastScrollTop = b;
              let L = 0;
              for (let H = 0; H < D.length; H++) {
                const re = D[H], ce = R.current.get(re);
                if (ce && ce.offset + ce.height > b) {
                  L = H;
                  break;
                }
              }
              if (L !== c.startIndex) {
                const H = Math.ceil(k / o);
                A({
                  startIndex: Math.max(0, L - u),
                  endIndex: Math.min(
                    D.length - 1,
                    L + H + u
                  )
                });
              }
            }, [
              D.length,
              c.startIndex,
              o,
              u,
              l
            ]);
            Q(() => {
              const M = i.current;
              if (!(!M || !d))
                return M.addEventListener("scroll", z, {
                  passive: !0
                }), () => {
                  M.removeEventListener("scroll", z);
                };
            }, [z, d]);
            const C = se(
              (M = "smooth") => {
                const b = i.current;
                if (!b) return;
                _.current.isUserScrolling = !1, _.current.isNearBottom = !0, _.current.scrollUpCount = 0;
                const V = () => {
                  const k = (P = 0) => {
                    if (P > 5) return;
                    const $ = b.scrollHeight, Y = b.scrollTop, L = b.clientHeight;
                    Y + L >= $ - 1 || (b.scrollTo({
                      top: $,
                      behavior: M
                    }), setTimeout(() => {
                      const H = b.scrollHeight, re = b.scrollTop;
                      (H !== $ || re + L < H - 1) && k(P + 1);
                    }, 50));
                  };
                  k();
                };
                "requestIdleCallback" in window ? requestIdleCallback(V, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(V);
                });
              },
              []
            );
            return Q(() => {
              if (!d || !i.current) return;
              const M = i.current, b = _.current;
              let V;
              const k = () => {
                clearTimeout(V), V = setTimeout(() => {
                  !b.isUserScrolling && b.isNearBottom && C(
                    I.current ? "instant" : "smooth"
                  );
                }, 100);
              }, P = new MutationObserver(() => {
                b.isUserScrolling || k();
              });
              P.observe(M, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
                // More specific than just 'height'
              });
              const $ = (Y) => {
                Y.target instanceof HTMLImageElement && !b.isUserScrolling && k();
              };
              return M.addEventListener("load", $, !0), I.current ? setTimeout(() => {
                C("instant");
              }, 0) : k(), () => {
                clearTimeout(V), P.disconnect(), M.removeEventListener("load", $, !0);
              };
            }, [d, D.length, C]), {
              virtualState: fe(() => {
                const M = r.getState(), b = M.getShadowValue(
                  [e, ...t].join(".")
                ), V = M.getShadowMetadata(e, t)?.arrayKeys || [];
                b.slice(
                  c.startIndex,
                  c.endIndex + 1
                );
                const k = V.slice(
                  c.startIndex,
                  c.endIndex + 1
                );
                return S({
                  path: t,
                  componentId: v,
                  meta: { ...s, validIds: k }
                });
              }, [c.startIndex, c.endIndex, D.length]),
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
                    height: `${q}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${R.current.get(D[c.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: C,
              scrollToIndex: (M, b = "smooth") => {
                if (i.current && D[M]) {
                  const V = R.current.get(D[M])?.offset || 0;
                  i.current.scrollTo({ top: V, behavior: b });
                }
              }
            };
          };
        if (h === "stateMap")
          return (n) => {
            const { value: o, arrayKeys: u } = Z(
              e,
              t,
              s
            );
            if (!u)
              throw new Error("No array keys found for mapping");
            const d = S({
              path: t,
              componentId: v,
              meta: s
            });
            return o.map((l, i) => {
              const c = u[i]?.split(".").slice(1), A = S({
                path: c,
                componentId: v,
                meta: s
              });
              return n(
                A,
                i,
                d
              );
            });
          };
        if (h === "$stateMap")
          return (n) => ie(ze, {
            proxy: {
              _stateKey: e,
              _path: t,
              _mapFn: n,
              _meta: s
            },
            rebuildStateShape: S
          });
        if (h === "stateFind")
          return (n) => {
            const { store: o, arrayKeys: u } = Z(e, t, s);
            if (u)
              for (let d = 0; d < u.length; d++) {
                const l = u[d];
                if (!l) continue;
                const i = o.getShadowValue(l);
                if (n(i, d)) {
                  const c = l.split(".").slice(1);
                  return S({
                    path: c,
                    componentId: v,
                    meta: s
                    // Pass along meta for potential further chaining
                  });
                }
              }
          };
        if (h === "stateFilter")
          return (n) => {
            const { value: o, arrayKeys: u } = Z(
              e,
              t,
              s
            );
            if (!u)
              throw new Error("No array keys found for filtering.");
            const d = [];
            return o.filter(
              (l, i) => n(l, i) ? (d.push(u[i]), !0) : !1
            ), S({
              path: t,
              componentId: v,
              meta: {
                validIds: d,
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
        if (h === "stateSort")
          return (n) => {
            const { value: o, arrayKeys: u } = Z(
              e,
              t,
              s
            );
            if (!u)
              throw new Error("No array keys found for sorting");
            const d = o.map((l, i) => ({
              item: l,
              key: u[i]
            }));
            return d.sort((l, i) => n(l.item, i.item)).filter(Boolean), S({
              path: t,
              componentId: v,
              meta: {
                validIds: d.map((l) => l.key),
                transforms: [
                  ...s?.transforms || [],
                  { type: "sort", fn: n }
                ]
              }
            });
          };
        if (h === "stream")
          return function(n = {}) {
            const {
              bufferSize: o = 100,
              flushInterval: u = 100,
              bufferStrategy: d = "accumulate",
              store: l,
              onFlush: i
            } = n;
            let c = [], A = !1, w = null;
            const E = (q) => {
              if (!A) {
                if (d === "sliding" && c.length >= o)
                  c.shift();
                else if (d === "dropping" && c.length >= o)
                  return;
                c.push(q), c.length >= o && I();
              }
            }, I = () => {
              if (c.length === 0) return;
              const q = [...c];
              if (c = [], l) {
                const x = l(q);
                x !== void 0 && (Array.isArray(x) ? x : [x]).forEach((C) => {
                  a(C, t, {
                    updateType: "insert"
                  });
                });
              } else
                q.forEach((x) => {
                  a(x, t, {
                    updateType: "insert"
                  });
                });
              i?.(q);
            };
            u > 0 && (w = setInterval(I, u));
            const _ = te(), R = r.getState().getShadowMetadata(e, t) || {}, D = R.streams || /* @__PURE__ */ new Map();
            return D.set(_, { buffer: c, flushTimer: w }), r.getState().setShadowMetadata(e, t, {
              ...R,
              streams: D
            }), {
              write: (q) => E(q),
              writeMany: (q) => q.forEach(E),
              flush: () => I(),
              pause: () => {
                A = !0;
              },
              resume: () => {
                A = !1, c.length > 0 && I();
              },
              close: () => {
                I(), w && clearInterval(w);
                const q = r.getState().getShadowMetadata(e, t);
                q?.streams && q.streams.delete(_);
              }
            };
          };
        if (h === "stateList")
          return (n) => /* @__PURE__ */ ne(() => {
            const u = B(/* @__PURE__ */ new Map()), d = s?.transforms && s.transforms.length > 0 ? `${v}-${xe(s.transforms)}` : `${v}-base`, [l, i] = X({}), { validIds: c, arrayValues: A } = fe(() => {
              const E = r.getState().getShadowMetadata(e, t)?.transformCaches?.get(d);
              let I;
              E && E.validIds ? I = E.validIds : (I = pe(
                e,
                t,
                s?.transforms
              ), r.getState().setTransformCache(e, t, d, {
                validIds: I,
                computedAt: Date.now(),
                transforms: s?.transforms || []
              }));
              const _ = r.getState().getShadowValue(O, I);
              return {
                validIds: I,
                arrayValues: _ || []
              };
            }, [d, l]);
            if (Q(() => {
              const E = r.getState().subscribeToPath(O, (I) => {
                if (I.type === "GET_SELECTED")
                  return;
                const R = r.getState().getShadowMetadata(e, t)?.transformCaches;
                if (R)
                  for (const D of R.keys())
                    D.startsWith(v) && R.delete(D);
                (I.type === "INSERT" || I.type === "REMOVE" || I.type === "CLEAR_SELECTION") && i({});
              });
              return () => {
                E();
              };
            }, [v, O]), !Array.isArray(A))
              return null;
            const w = S({
              path: t,
              componentId: v,
              meta: {
                ...s,
                validIds: c
              }
            });
            return /* @__PURE__ */ ne(De, { children: A.map((E, I) => {
              const _ = c[I];
              if (!_)
                return null;
              let R = u.current.get(_);
              R || (R = te(), u.current.set(_, R));
              const D = _.split(".").slice(1);
              return ie(we, {
                key: _,
                stateKey: e,
                itemComponentId: R,
                itemPath: D,
                localIndex: I,
                arraySetter: w,
                rebuildStateShape: S,
                renderFn: n
              });
            }) });
          }, {});
        if (h === "stateFlattenOn")
          return (n) => {
            const o = r.getState().getShadowValue([e, ...t].join("."), s?.validIds);
            return Array.isArray(o) ? S({
              path: [...t, "[*]", n],
              componentId: v,
              meta: s
            }) : [];
          };
        if (h === "index")
          return (n) => {
            const u = r.getState().getShadowMetadata(e, t)?.arrayKeys?.filter(
              (l) => !s?.validIds || s?.validIds && s?.validIds?.includes(l)
            )?.[n];
            return u ? (r.getState().getShadowValue(u, s?.validIds), S({
              path: u.split(".").slice(1),
              componentId: v,
              meta: s
            })) : void 0;
          };
        if (h === "last")
          return () => {
            const { value: n } = Z(e, t, s);
            if (n.length === 0) return;
            const o = n.length - 1;
            n[o];
            const u = [...t, o.toString()];
            return S({
              path: u,
              componentId: v,
              meta: s
            });
          };
        if (h === "insert")
          return (n, o) => (a(n, t, { updateType: "insert" }), S({
            path: t,
            componentId: v,
            meta: s
          }));
        if (h === "uniqueInsert")
          return (n, o, u) => {
            const { value: d } = Z(
              e,
              t,
              s
            ), l = ee(n) ? n(d) : n;
            let i = null;
            if (!d.some((A) => {
              const w = o ? o.every(
                (E) => oe(A[E], l[E])
              ) : oe(A, l);
              return w && (i = A), w;
            }))
              a(l, t, { updateType: "insert" });
            else if (u && i) {
              const A = u(i), w = d.map(
                (E) => oe(E, i) ? A : E
              );
              a(w, t, {
                updateType: "update"
              });
            }
          };
        if (h === "cut")
          return (n, o) => {
            const { value: u, arrayKeys: d } = Z(
              e,
              t,
              s
            );
            if (!d || d.length === 0) return;
            const l = n == -1 ? d.length - 1 : n !== void 0 ? n : d.length - 1, i = d[l];
            if (!i) return;
            const c = i.split(".").slice(1);
            a(u, c, {
              updateType: "cut"
            });
          };
        if (h === "cutSelected")
          return () => {
            const n = pe(e, t, s?.transforms), o = r.getState().getShadowValue([e, ...t].join("."), s?.validIds);
            if (!n || n.length === 0) return;
            const u = r.getState().selectedIndicesMap.get(O);
            let d = n.findIndex(
              (c) => c === u
            );
            const l = n[d == -1 ? n.length - 1 : d]?.split(".").slice(1);
            r.getState().clearSelectedIndex({ arrayKey: O });
            const i = l?.slice(0, -1);
            de(e, i), a(o, l, {
              updateType: "cut"
            });
          };
        if (h === "cutByValue")
          return (n) => {
            const { store: o, arrayKeys: u } = Z(
              e,
              t,
              s
            );
            if (!u) return;
            let d = null;
            for (const l of u)
              if (o.getShadowValue(l) === n) {
                d = l;
                break;
              }
            if (d) {
              const l = d.split(".").slice(1);
              a(null, l, { updateType: "cut" });
            }
          };
        if (h === "toggleByValue")
          return (n) => {
            const o = r.getState().getShadowMetadata(e, t), u = s?.validIds ?? o?.arrayKeys;
            if (!u) return;
            let d = null;
            for (const l of u) {
              const i = r.getState().getShadowValue(l);
              if (console.log("itemValue sdasdasdasd", i), i === n) {
                d = l;
                break;
              }
            }
            if (console.log("itemValue keyToCut", d), d) {
              const l = d.split(".").slice(1);
              console.log("itemValue keyToCut", d), a(n, l, {
                updateType: "cut"
              });
            } else
              a(n, t, { updateType: "insert" });
          };
        if (h === "findWith")
          return (n, o) => {
            const { store: u, arrayKeys: d } = Z(e, t, s);
            if (!d)
              throw new Error("No array keys found for sorting");
            let l = [];
            for (const i of d) {
              let c = u.getShadowValue(i, s?.validIds);
              if (c && c[n] === o) {
                l = i.split(".").slice(1);
                break;
              }
            }
            return S({
              path: l,
              componentId: v,
              meta: s
            });
          };
        if (h === "cutThis") {
          const { value: n } = Z(e, t, s);
          return () => {
            a(n, t, { updateType: "cut" });
          };
        }
        if (h === "get")
          return () => {
            Te(e, v, t);
            const { value: n } = Z(e, t, s);
            return n;
          };
        if (h === "$derive")
          return (n) => be({
            _stateKey: e,
            _path: t,
            _effect: n.toString(),
            _meta: s
          });
        if (h === "$get")
          return () => be({ _stateKey: e, _path: t, _meta: s });
        if (h === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (h == "getLocalStorage")
          return (n) => Se(f + "-" + e + "-" + n);
        if (h === "isSelected") {
          const n = [e, ...t].slice(0, -1);
          if (de(e, t, void 0), Array.isArray(
            r.getState().getShadowValue(n.join("."), s?.validIds)
          )) {
            t[t.length - 1];
            const o = n.join("."), u = r.getState().selectedIndicesMap.get(o), d = e + "." + t.join(".");
            return u === d;
          }
          return;
        }
        if (h === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), u = e + "." + o.join("."), d = e + "." + t.join(".");
            de(e, o, void 0), r.getState().selectedIndicesMap.get(u), n && r.getState().setSelectedIndex(u, d);
          };
        if (h === "toggleSelected")
          return () => {
            const n = t.slice(0, -1), o = e + "." + n.join("."), u = e + "." + t.join(".");
            r.getState().selectedIndicesMap.get(o) === u ? r.getState().clearSelectedIndex({ arrayKey: o }) : r.getState().setSelectedIndex(o, u);
          };
        if (h === "_componentId")
          return v;
        if (t.length == 0) {
          if (h === "addZodValidation")
            return (n) => {
              n.forEach((o) => {
                const u = r.getState().getShadowMetadata(e, o.path) || {};
                r.getState().setShadowMetadata(e, o.path, {
                  ...u,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: "client",
                        message: o.message,
                        severity: "error",
                        code: o.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                });
              });
            };
          if (h === "clearZodValidation")
            return (n) => {
              if (!n)
                throw new Error("clearZodValidation requires a path");
              const o = r.getState().getShadowMetadata(e, n) || {};
              r.getState().setShadowMetadata(e, n, {
                ...o,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (h === "applyJsonPatch")
            return (n) => {
              const o = r.getState(), u = o.getShadowMetadata(e, []);
              if (!u?.components) return;
              const d = (i) => !i || i === "/" ? [] : i.split("/").slice(1).map((c) => c.replace(/~1/g, "/").replace(/~0/g, "~")), l = /* @__PURE__ */ new Set();
              for (const i of n) {
                const c = d(i.path);
                switch (i.op) {
                  case "add":
                  case "replace": {
                    const { value: A } = i;
                    o.updateShadowAtPath(e, c, A), o.markAsDirty(e, c, { bubble: !0 });
                    let w = [...c];
                    for (; ; ) {
                      const E = o.getShadowMetadata(
                        e,
                        w
                      );
                      if (E?.pathComponents && E.pathComponents.forEach((I) => {
                        if (!l.has(I)) {
                          const _ = u.components?.get(I);
                          _ && (_.forceUpdate(), l.add(I));
                        }
                      }), w.length === 0) break;
                      w.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const A = c.slice(0, -1);
                    o.removeShadowArrayElement(e, c), o.markAsDirty(e, A, { bubble: !0 });
                    let w = [...A];
                    for (; ; ) {
                      const E = o.getShadowMetadata(
                        e,
                        w
                      );
                      if (E?.pathComponents && E.pathComponents.forEach((I) => {
                        if (!l.has(I)) {
                          const _ = u.components?.get(I);
                          _ && (_.forceUpdate(), l.add(I));
                        }
                      }), w.length === 0) break;
                      w.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (h === "getComponents")
            return () => r.getState().getShadowMetadata(e, [])?.components;
          if (h === "getAllFormRefs")
            return () => me.getState().getFormRefsByStateKey(e);
        }
        if (h === "getFormRef")
          return () => me.getState().getFormRef(e + "." + t.join("."));
        if (h === "validationWrapper")
          return ({
            children: n,
            hideMessage: o
          }) => /* @__PURE__ */ ne(
            _e,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: n
            }
          );
        if (h === "_stateKey") return e;
        if (h === "_path") return t;
        if (h === "update")
          return (n) => {
            const u = new Error().stack || "";
            if (u.includes("onClick") || u.includes("dispatchEvent") || u.includes("batchedUpdates")) {
              const l = `${e}.${t.join(".")}`;
              he || (le.clear(), he = !0, queueMicrotask(() => {
                for (const [c, A] of le) {
                  const w = c.split(".");
                  w[0];
                  const E = w.slice(1), I = A.reduce(
                    (_, R) => typeof R == "function" && typeof _ == "function" ? (D) => R(_(D)) : R
                  );
                  a(I, E, {
                    updateType: "update"
                  });
                }
                le.clear(), he = !1;
              }));
              const i = le.get(l) || [];
              i.push(n), le.set(l, i);
            } else
              a(n, t, { updateType: "update" });
            return {
              synced: () => {
                const l = r.getState().getShadowMetadata(e, t);
                r.getState().setShadowMetadata(e, t, {
                  ...l,
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: Date.now()
                });
                const i = [e, ...t].join(".");
                r.getState().notifyPathSubscribers(i, {
                  type: "SYNC_STATUS_CHANGE",
                  isDirty: !1
                });
              }
            };
          };
        if (h === "toggle") {
          const { value: n } = Z(
            e,
            t,
            s
          );
          if (typeof n != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            a(!n, t, {
              updateType: "update"
            });
          };
        }
        if (h === "formElement")
          return (n, o) => /* @__PURE__ */ ne(
            Je,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: S,
              setState: a,
              formOpts: o,
              renderFn: n
            }
          );
        const J = [...t, h];
        return r.getState().getShadowValue(e, J), S({
          path: J,
          componentId: v,
          meta: s
        });
      }
    }, g = new Proxy(N, G);
    return p.set(j, g), g;
  }
  const T = {
    revertToInitialState: (t) => {
      r.getState().getInitialOptions(e)?.validation;
      const s = r.getState().getShadowMetadata(e, []);
      s?.stateSource === "server" && s.baseServerState ? s.baseServerState : r.getState().initialStateGlobal[e];
      const v = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), r.getState().initializeShadowState(e, v), S({
        path: [],
        componentId: m
      });
      const F = ae(e), j = ee(F?.localStorage?.key) ? F?.localStorage?.key(v) : F?.localStorage?.key, O = `${f}-${e}-${j}`;
      O && localStorage.removeItem(O);
      const N = r.getState().getShadowMetadata(e, []);
      return N && N?.components?.forEach((G) => {
        G.forceUpdate();
      }), v;
    },
    updateInitialState: (t) => {
      const s = Pe(
        e,
        a,
        m,
        f
      ), v = r.getState().initialStateGlobal[e], F = ae(e), j = ee(F?.localStorage?.key) ? F?.localStorage?.key(v) : F?.localStorage?.key, O = `${f}-${e}-${j}`;
      return localStorage.getItem(O) && localStorage.removeItem(O), Ue(() => {
        Ce(e, t), r.getState().initializeShadowState(e, t);
        const N = r.getState().getShadowMetadata(e, []);
        N && N?.components?.forEach((G) => {
          G.forceUpdate();
        });
      }), {
        fetchId: (N) => s.get()[N]
      };
    }
  };
  return S({
    componentId: m,
    path: []
  });
}
function be(e) {
  return ie(Be, { proxy: e });
}
function ze({
  proxy: e,
  rebuildStateShape: a
}) {
  const m = B(null), f = B(`map-${crypto.randomUUID()}`), p = B(!1), S = B(/* @__PURE__ */ new Map());
  Q(() => {
    const y = m.current;
    if (!y || p.current) return;
    const t = setTimeout(() => {
      const s = r.getState().getShadowMetadata(e._stateKey, e._path) || {}, v = s.mapWrappers || [];
      v.push({
        instanceId: f.current,
        mapFn: e._mapFn,
        containerRef: y,
        rebuildStateShape: a,
        path: e._path,
        componentId: f.current,
        meta: e._meta
      }), r.getState().setShadowMetadata(e._stateKey, e._path, {
        ...s,
        mapWrappers: v
      }), p.current = !0, T();
    }, 0);
    return () => {
      if (clearTimeout(t), f.current) {
        const s = r.getState().getShadowMetadata(e._stateKey, e._path) || {};
        s.mapWrappers && (s.mapWrappers = s.mapWrappers.filter(
          (v) => v.instanceId !== f.current
        ), r.getState().setShadowMetadata(e._stateKey, e._path, s));
      }
      S.current.forEach((s) => s.unmount());
    };
  }, []);
  const T = () => {
    const y = m.current;
    if (!y) return;
    const t = r.getState().getShadowValue(
      [e._stateKey, ...e._path].join("."),
      e._meta?.validIds
    );
    if (!Array.isArray(t)) return;
    const s = e._meta?.validIds ?? r.getState().getShadowMetadata(e._stateKey, e._path)?.arrayKeys ?? [], v = a({
      currentState: t,
      path: e._path,
      componentId: f.current,
      meta: e._meta
    });
    t.forEach((F, j) => {
      const O = s[j];
      if (!O) return;
      const N = te(), G = document.createElement("div");
      G.setAttribute("data-item-path", O), y.appendChild(G);
      const g = Ee(G);
      S.current.set(O, g);
      const K = O.split(".").slice(1);
      g.render(
        ie(we, {
          stateKey: e._stateKey,
          itemComponentId: N,
          itemPath: K,
          localIndex: j,
          arraySetter: v,
          rebuildStateShape: a,
          renderFn: e._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ ne("div", { ref: m, "data-map-container": f.current });
}
function Be({
  proxy: e
}) {
  const a = B(null), m = B(null), f = B(!1), p = `${e._stateKey}-${e._path.join(".")}`, S = r.getState().getShadowValue(
    [e._stateKey, ...e._path].join("."),
    e._meta?.validIds
  );
  return Q(() => {
    const T = a.current;
    if (!T || f.current) return;
    const y = setTimeout(() => {
      if (!T.parentElement) {
        console.warn("Parent element not found for signal", p);
        return;
      }
      const t = T.parentElement, v = Array.from(t.childNodes).indexOf(T);
      let F = t.getAttribute("data-parent-id");
      F || (F = `parent-${crypto.randomUUID()}`, t.setAttribute("data-parent-id", F)), m.current = `instance-${crypto.randomUUID()}`;
      const j = r.getState().getShadowMetadata(e._stateKey, e._path) || {}, O = j.signals || [];
      O.push({
        instanceId: m.current,
        parentId: F,
        position: v,
        effect: e._effect
      }), r.getState().setShadowMetadata(e._stateKey, e._path, {
        ...j,
        signals: O
      });
      let N = S;
      if (e._effect)
        try {
          N = new Function(
            "state",
            `return (${e._effect})(state)`
          )(S);
        } catch (g) {
          console.error("Error evaluating effect function:", g);
        }
      N !== null && typeof N == "object" && (N = JSON.stringify(N));
      const G = document.createTextNode(String(N ?? ""));
      T.replaceWith(G), f.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(y), m.current) {
        const t = r.getState().getShadowMetadata(e._stateKey, e._path) || {};
        t.signals && (t.signals = t.signals.filter(
          (s) => s.instanceId !== m.current
        ), r.getState().setShadowMetadata(e._stateKey, e._path, t));
      }
    };
  }, []), ie("span", {
    ref: a,
    style: { display: "contents" },
    "data-signal-id": p
  });
}
const we = Oe(
  Ge,
  (e, a) => e.itemPath.join(".") === a.itemPath.join(".") && e.stateKey === a.stateKey && e.itemComponentId === a.itemComponentId && e.localIndex === a.localIndex
), qe = (e) => {
  const [a, m] = X(!1);
  return ue(() => {
    if (!e.current) {
      m(!0);
      return;
    }
    const f = Array.from(e.current.querySelectorAll("img"));
    if (f.length === 0) {
      m(!0);
      return;
    }
    let p = 0;
    const S = () => {
      p++, p === f.length && m(!0);
    };
    return f.forEach((T) => {
      T.complete ? S() : (T.addEventListener("load", S), T.addEventListener("error", S));
    }), () => {
      f.forEach((T) => {
        T.removeEventListener("load", S), T.removeEventListener("error", S);
      });
    };
  }, [e.current]), a;
};
function Ge({
  stateKey: e,
  itemComponentId: a,
  itemPath: m,
  localIndex: f,
  arraySetter: p,
  rebuildStateShape: S,
  renderFn: T
}) {
  const [, y] = X({}), { ref: t, inView: s } = Ne(), v = B(null), F = qe(v), j = B(!1), O = [e, ...m].join(".");
  ke(e, a, y);
  const N = se(
    (W) => {
      v.current = W, t(W);
    },
    [t]
  );
  Q(() => {
    r.getState().subscribeToPath(O, (W) => {
      y({});
    });
  }, []), Q(() => {
    if (!s || !F || j.current)
      return;
    const W = v.current;
    if (W && W.offsetHeight > 0) {
      j.current = !0;
      const J = W.offsetHeight;
      r.getState().setShadowMetadata(e, m, {
        virtualizer: {
          itemHeight: J,
          domRef: W
        }
      });
      const n = m.slice(0, -1), o = [e, ...n].join(".");
      r.getState().notifyPathSubscribers(o, {
        type: "ITEMHEIGHT",
        itemKey: m.join("."),
        ref: v.current
      });
    }
  }, [s, F, e, m]);
  const G = [e, ...m].join("."), g = r.getState().getShadowValue(G);
  if (g === void 0)
    return null;
  const K = S({
    currentState: g,
    path: m,
    componentId: a
  }), h = T(K, f, p);
  return /* @__PURE__ */ ne("div", { ref: N, children: h });
}
function Je({
  stateKey: e,
  path: a,
  rebuildStateShape: m,
  renderFn: f,
  formOpts: p,
  setState: S
}) {
  const [T] = X(() => te()), [, y] = X({}), t = [e, ...a].join(".");
  ke(e, T, y);
  const s = r.getState().getShadowValue(t), [v, F] = X(s), j = B(!1), O = B(null);
  Q(() => {
    !j.current && !oe(s, v) && F(s);
  }, [s]), Q(() => {
    const h = r.getState().subscribeToPath(t, (W) => {
      !j.current && v !== W && y({});
    });
    return () => {
      h(), O.current && (clearTimeout(O.current), j.current = !1);
    };
  }, []);
  const N = se(
    (h) => {
      typeof s === "number" && typeof h == "string" && (h = h === "" ? 0 : Number(h)), F(h), j.current = !0, O.current && clearTimeout(O.current);
      const J = p?.debounceTime ?? 200;
      O.current = setTimeout(() => {
        if (j.current = !1, S(h, a, { updateType: "update" }), !r.getState().getShadowMetadata(e, [])?.features?.validationEnabled) return;
        const { getInitialOptions: o, setShadowMetadata: u, getShadowMetadata: d } = r.getState(), l = o(e)?.validation, i = l?.zodSchemaV4 || l?.zodSchemaV3;
        if (i) {
          const c = r.getState().getShadowValue(e), A = i.safeParse(c), w = d(e, a) || {};
          if (A.success)
            u(e, a, {
              ...w,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: h
              }
            });
          else {
            const I = ("issues" in A.error ? A.error.issues : A.error.errors).filter(
              (_) => JSON.stringify(_.path) === JSON.stringify(a)
            );
            I.length > 0 ? u(e, a, {
              ...w,
              validation: {
                status: "INVALID",
                errors: [
                  {
                    source: "client",
                    message: I[0]?.message,
                    severity: "warning"
                    // Gentle error during typing
                  }
                ],
                lastValidated: Date.now(),
                validatedValue: h
              }
            }) : u(e, a, {
              ...w,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: h
              }
            });
          }
        }
      }, J), y({});
    },
    [S, a, p?.debounceTime, e]
  ), G = se(async () => {
    if (console.log("handleBlur triggered"), O.current && (clearTimeout(O.current), O.current = null, j.current = !1, S(v, a, { updateType: "update" })), !r.getState().getShadowMetadata(e, [])?.features?.validationEnabled) return;
    const { getInitialOptions: W } = r.getState(), J = W(e)?.validation, n = J?.zodSchemaV4 || J?.zodSchemaV3;
    if (!n) return;
    const o = r.getState().getShadowMetadata(e, a);
    r.getState().setShadowMetadata(e, a, {
      ...o,
      validation: {
        status: "VALIDATING",
        errors: [],
        lastValidated: Date.now(),
        validatedValue: v
      }
    });
    const u = r.getState().getShadowValue(e), d = n.safeParse(u);
    if (console.log("result ", d), d.success)
      r.getState().setShadowMetadata(e, a, {
        ...o,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: v
        }
      });
    else {
      const l = "issues" in d.error ? d.error.issues : d.error.errors;
      console.log("All validation errors:", l), console.log("Current blur path:", a);
      const i = l.filter((c) => {
        if (console.log("Processing error:", c), a.some((w) => w.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const w = a[0].startsWith("id:") ? [] : a.slice(0, -1);
          console.log("Parent path:", w);
          const E = r.getState().getShadowMetadata(e, w);
          if (console.log("Array metadata:", E), E?.arrayKeys) {
            const I = [e, ...a.slice(0, -1)].join("."), _ = E.arrayKeys.indexOf(I);
            console.log("Item key:", I, "Index:", _);
            const R = [...w, _, ...a.slice(-1)], D = JSON.stringify(c.path) === JSON.stringify(R);
            return console.log("Zod path comparison:", {
              zodPath: R,
              errorPath: c.path,
              match: D
            }), D;
          }
        }
        const A = JSON.stringify(c.path) === JSON.stringify(a);
        return console.log("Direct path comparison:", {
          errorPath: c.path,
          currentPath: a,
          match: A
        }), A;
      });
      console.log("Filtered path errors:", i), r.getState().setShadowMetadata(e, a, {
        ...o,
        validation: {
          status: "INVALID",
          errors: i.map((c) => ({
            source: "client",
            message: c.message,
            severity: "error"
            // Hard error on blur
          })),
          lastValidated: Date.now(),
          validatedValue: v
        }
      });
    }
    y({});
  }, [e, a, v, S]), g = m({
    currentState: s,
    path: a,
    componentId: T
  }), K = new Proxy(g, {
    get(h, W) {
      return W === "inputProps" ? {
        value: v ?? "",
        onChange: (J) => {
          N(J.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: G,
        ref: me.getState().getFormRef(e + "." + a.join("."))
      } : h[W];
    }
  });
  return /* @__PURE__ */ ne(_e, { formOpts: p, path: a, stateKey: e, children: f(K) });
}
function ke(e, a, m) {
  const f = `${e}////${a}`;
  ue(() => {
    const { registerComponent: p, unregisterComponent: S } = r.getState();
    return p(e, f, {
      forceUpdate: () => m({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      S(e, f);
    };
  }, [e, f]);
}
export {
  be as $cogsSignal,
  ot as addStateOptions,
  Fe as createCogsState,
  st as createCogsStateFromSync,
  it as notifyComponent,
  He as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
