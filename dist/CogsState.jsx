"use client";
import { jsx as re, Fragment as ke } from "react/jsx-runtime";
import { memo as Re, useState as X, useRef as G, useCallback as ce, useEffect as Q, useLayoutEffect as de, useMemo as ge, createElement as le, startTransition as je } from "react";
import { createRoot as Ce } from "react-dom/client";
import { transformStateFunc as Fe, isFunction as ee, isArray as Te, getDifferences as Pe, isDeepEqual as se } from "./utility.js";
import { ValidationWrapper as be } from "./Functions.jsx";
import Oe from "superjson";
import { v4 as te } from "uuid";
import { getGlobalStore as t, formRefStore as pe } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
import { useInView as Le } from "react-intersection-observer";
function he(e, i) {
  const f = t.getState().getInitialOptions, g = t.getState().setInitialStateOptions, h = f(e) || {};
  g(e, {
    ...h,
    ...i
  });
}
function Ee({
  stateKey: e,
  options: i,
  initialOptionsPart: f
}) {
  const g = ae(e) || {}, h = f[e] || {}, p = t.getState().setInitialStateOptions, M = { ...h, ...g };
  let l = !1;
  if (i)
    for (const u in i)
      M.hasOwnProperty(u) ? (u == "localStorage" && i[u] && M[u].key !== i[u]?.key && (l = !0, M[u] = i[u]), u == "defaultState" && i[u] && M[u] !== i[u] && !se(M[u], i[u]) && (l = !0, M[u] = i[u])) : (l = !0, M[u] = i[u]);
  l && p(e, M);
}
function it(e, { formElements: i, validation: f }) {
  return { initialState: e, formElements: i, validation: f };
}
const ct = (e, i) => {
  let f = e;
  const [g, h] = Fe(f);
  Object.keys(g).forEach((l) => {
    let u = h[l] || {};
    const A = {
      ...u
    };
    if (i?.formElements && (A.formElements = {
      ...i.formElements,
      ...u.formElements || {}
    }), i?.validation && (A.validation = {
      ...i.validation,
      ...u.validation || {}
    }, i.validation.key && !u.validation?.key && (A.validation.key = `${i.validation.key}.${l}`)), Object.keys(A).length > 0) {
      const b = ae(l);
      b ? t.getState().setInitialStateOptions(l, {
        ...b,
        ...A
      }) : t.getState().setInitialStateOptions(l, A);
    }
  }), Object.keys(g).forEach((l) => {
    t.getState().initializeShadowState(l, g[l]);
  });
  const p = (l, u) => {
    const [A] = X(u?.componentId ?? te());
    Ee({
      stateKey: l,
      options: u,
      initialOptionsPart: h
    });
    const b = t.getState().getShadowValue(l) || g[l], o = u?.modifyState ? u.modifyState(b) : b;
    return Be(o, {
      stateKey: l,
      syncUpdate: u?.syncUpdate,
      componentId: A,
      localStorage: u?.localStorage,
      middleware: u?.middleware,
      reactiveType: u?.reactiveType,
      reactiveDeps: u?.reactiveDeps,
      defaultState: u?.defaultState,
      dependencies: u?.dependencies,
      serverState: u?.serverState
    });
  };
  function M(l, u) {
    Ee({ stateKey: l, options: u, initialOptionsPart: h }), u.localStorage && xe(l, u), ie(l);
  }
  return { useCogsState: p, setCogsOptions: M };
}, {
  getInitialOptions: ae,
  getValidationErrors: Ne,
  setStateLog: We,
  updateInitialStateGlobal: $e,
  addValidationError: ve,
  removeValidationError: ne
} = t.getState(), He = (e, i, f, g, h) => {
  f?.log && console.log(
    "saving to localstorage",
    i,
    f.localStorage?.key,
    g
  );
  const p = ee(f?.localStorage?.key) ? f.localStorage?.key(e) : f?.localStorage?.key;
  if (p && g) {
    const M = `${g}-${i}-${p}`;
    let l;
    try {
      l = Se(M)?.lastSyncedWithServer;
    } catch {
    }
    const u = t.getState().getShadowMetadata(i, []), A = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: u?.stateSource,
      baseServerState: u?.baseServerState
    }, b = Oe.serialize(A);
    window.localStorage.setItem(
      M,
      JSON.stringify(b.json)
    );
  }
}, Se = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, xe = (e, i) => {
  const f = t.getState().getShadowValue(e), { sessionId: g } = _e(), h = ee(i?.localStorage?.key) ? i.localStorage.key(f) : i?.localStorage?.key;
  if (h && g) {
    const p = Se(
      `${g}-${e}-${h}`
    );
    if (p && p.lastUpdated > (p.lastSyncedWithServer || 0))
      return ie(e), !0;
  }
  return !1;
}, ie = (e) => {
  const i = t.getState().getShadowMetadata(e, []);
  if (!i) return;
  const f = /* @__PURE__ */ new Set();
  i?.components?.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || f.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    f.forEach((g) => g());
  });
}, lt = (e, i) => {
  const f = t.getState().getShadowMetadata(e, []);
  if (f) {
    const g = `${e}////${i}`, h = f?.components?.get(g);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
};
function we(e, i, f, g) {
  const h = t.getState(), p = h.getShadowMetadata(e, i);
  if (h.setShadowMetadata(e, i, {
    ...p,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: g || Date.now()
  }), Array.isArray(f)) {
    const M = h.getShadowMetadata(e, i);
    M?.arrayKeys && M.arrayKeys.forEach((l, u) => {
      const A = l.split(".").slice(1), b = f[u];
      b !== void 0 && we(
        e,
        A,
        b,
        g
      );
    });
  } else f && typeof f == "object" && f.constructor === Object && Object.keys(f).forEach((M) => {
    const l = [...i, M], u = f[M];
    we(e, l, u, g);
  });
}
function Be(e, {
  stateKey: i,
  localStorage: f,
  formElements: g,
  reactiveDeps: h,
  reactiveType: p,
  componentId: M,
  defaultState: l,
  syncUpdate: u,
  dependencies: A,
  serverState: b
} = {}) {
  const [o, S] = X({}), { sessionId: T } = _e();
  let W = !i;
  const [c] = X(i ?? te()), x = t.getState().stateLog[c], Y = G(/* @__PURE__ */ new Set()), J = G(M ?? te()), U = G(
    null
  );
  U.current = ae(c) ?? null, Q(() => {
    if (u && u.stateKey === c && u.path?.[0]) {
      const n = `${u.stateKey}:${u.path.join(".")}`;
      t.getState().setSyncInfo(n, {
        timeStamp: u.timeStamp,
        userId: u.userId
      });
    }
  }, [u]);
  const v = ce(
    (n) => {
      const a = n ? { ...ae(c), ...n } : ae(c), d = a?.defaultState || l || e;
      if (a?.serverState?.status === "success" && a?.serverState?.data !== void 0)
        return {
          value: a.serverState.data,
          source: "server",
          timestamp: a.serverState.timestamp || Date.now()
        };
      if (a?.localStorage?.key && T) {
        const m = ee(a.localStorage.key) ? a.localStorage.key(d) : a.localStorage.key, P = Se(
          `${T}-${c}-${m}`
        );
        if (P && P.lastUpdated > (a?.serverState?.timestamp || 0))
          return {
            value: P.state,
            source: "localStorage",
            timestamp: P.lastUpdated
          };
      }
      return {
        value: d || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [c, l, e, T]
  );
  Q(() => {
    t.getState().setServerStateUpdate(c, b);
  }, [b, c]), Q(() => t.getState().subscribeToPath(c, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const a = r.serverState;
      if (a?.status === "success" && a.data !== void 0) {
        he(c, { serverState: a });
        const w = typeof a.merge == "object" ? a.merge : a.merge === !0 ? {} : null, m = t.getState().getShadowValue(c), P = a.data;
        if (w && Array.isArray(m) && Array.isArray(P)) {
          const D = w.key || "id", j = new Set(
            m.map((O) => O[D])
          ), F = P.filter((O) => !j.has(O[D]));
          F.length > 0 && F.forEach((O) => {
            t.getState().insertShadowArrayElement(c, [], O);
            const L = t.getState().getShadowMetadata(c, []);
            if (L?.arrayKeys) {
              const N = L.arrayKeys[L.arrayKeys.length - 1];
              if (N) {
                const B = N.split(".").slice(1);
                t.getState().setShadowMetadata(c, B, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: a.timestamp || Date.now()
                });
                const V = t.getState().getShadowValue(N);
                V && typeof V == "object" && !Array.isArray(V) && Object.keys(V).forEach((E) => {
                  const $ = [...B, E];
                  t.getState().setShadowMetadata(c, $, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: a.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          t.getState().initializeShadowState(c, P), we(
            c,
            [],
            P,
            a.timestamp
          );
        const R = t.getState().getShadowMetadata(c, []);
        t.getState().setShadowMetadata(c, [], {
          ...R,
          stateSource: "server",
          lastServerSync: a.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [c, v]), Q(() => {
    const n = t.getState().getShadowMetadata(c, []);
    if (n && n.stateSource)
      return;
    const r = ae(c);
    if (r?.defaultState !== void 0 || l !== void 0) {
      const a = r?.defaultState || l;
      r?.defaultState || he(c, {
        defaultState: a
      });
      const { value: d, source: w, timestamp: m } = v();
      t.getState().initializeShadowState(c, d), t.getState().setShadowMetadata(c, [], {
        stateSource: w,
        lastServerSync: w === "server" ? m : void 0,
        isDirty: !1,
        baseServerState: w === "server" ? d : void 0
      }), ie(c);
    }
  }, [c, ...A || []]), de(() => {
    W && he(c, {
      formElements: g,
      defaultState: l,
      localStorage: f,
      middleware: U.current?.middleware
    });
    const n = `${c}////${J.current}`, r = t.getState().getShadowMetadata(c, []), a = r?.components || /* @__PURE__ */ new Map();
    return a.set(n, {
      forceUpdate: () => S({}),
      reactiveType: p ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: h || void 0,
      deps: h ? h(t.getState().getShadowValue(c)) : [],
      prevDeps: h ? h(t.getState().getShadowValue(c)) : []
    }), t.getState().setShadowMetadata(c, [], {
      ...r,
      components: a
    }), S({}), () => {
      const d = t.getState().getShadowMetadata(c, []), w = d?.components?.get(n);
      w?.paths && w.paths.forEach((m) => {
        const R = m.split(".").slice(1), D = t.getState().getShadowMetadata(c, R);
        D?.pathComponents && D.pathComponents.size === 0 && (delete D.pathComponents, t.getState().setShadowMetadata(c, R, D));
      }), d?.components && t.getState().setShadowMetadata(c, [], d);
    };
  }, []);
  const K = G(null), oe = (n, r, a, d) => {
    const w = [c, ...r].join(".");
    if (Array.isArray(r)) {
      const V = `${c}-${r.join(".")}`;
      Y.current.add(V);
    }
    const m = t.getState(), P = m.getShadowMetadata(c, r), R = m.getShadowValue(w), D = a.updateType === "insert" && ee(n) ? n({ state: R, uuid: te() }) : ee(n) ? n(R) : n, F = {
      timeStamp: Date.now(),
      stateKey: c,
      path: r,
      updateType: a.updateType,
      status: "new",
      oldValue: R,
      newValue: D
    };
    switch (a.updateType) {
      case "insert": {
        m.insertShadowArrayElement(c, r, F.newValue), m.markAsDirty(c, r, { bubble: !0 });
        const V = m.getShadowMetadata(c, r);
        if (V?.arrayKeys) {
          const E = V.arrayKeys[V.arrayKeys.length - 1];
          if (E) {
            const $ = E.split(".").slice(1);
            m.markAsDirty(c, $, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const V = r.slice(0, -1);
        m.removeShadowArrayElement(c, r), m.markAsDirty(c, V, { bubble: !0 });
        break;
      }
      case "update": {
        m.updateShadowAtPath(c, r, F.newValue), m.markAsDirty(c, r, { bubble: !0 });
        break;
      }
    }
    if (console.log("sdadasdasd", K.current, F), K.current && K.current.connected && K.current.updateState({ operation: F }), P?.signals && P.signals.length > 0) {
      const V = a.updateType === "cut" ? null : D;
      P.signals.forEach(({ parentId: E, position: $, effect: I }) => {
        const y = document.querySelector(`[data-parent-id="${E}"]`);
        if (y) {
          const k = Array.from(y.childNodes);
          if (k[$]) {
            let C = V;
            if (I && V !== null)
              try {
                C = new Function(
                  "state",
                  `return (${I})(state)`
                )(V);
              } catch (_) {
                console.error("Error evaluating effect function:", _);
              }
            C != null && typeof C == "object" && (C = JSON.stringify(C)), k[$].textContent = String(C ?? "");
          }
        }
      });
    }
    if (a.updateType === "insert" && P?.mapWrappers && P.mapWrappers.length > 0) {
      const V = m.getShadowMetadata(c, r)?.arrayKeys || [], E = V[V.length - 1], $ = m.getShadowValue(E), I = m.getShadowValue(
        [c, ...r].join(".")
      );
      if (!E || $ === void 0) return;
      P.mapWrappers.forEach((y) => {
        let k = !0, C = -1;
        if (y.meta?.transforms && y.meta.transforms.length > 0) {
          for (const _ of y.meta.transforms)
            if (_.type === "filter" && !_.fn($, -1)) {
              k = !1;
              break;
            }
          if (k) {
            const _ = Ie(
              c,
              r,
              y.meta.transforms
            ), q = y.meta.transforms.find(
              (H) => H.type === "sort"
            );
            if (q) {
              const H = _.map((z) => ({
                key: z,
                value: m.getShadowValue(z)
              }));
              H.push({ key: E, value: $ }), H.sort((z, Z) => q.fn(z.value, Z.value)), C = H.findIndex(
                (z) => z.key === E
              );
            } else
              C = _.length;
          }
        } else
          k = !0, C = V.length - 1;
        if (k && y.containerRef && y.containerRef.isConnected) {
          const _ = document.createElement("div");
          _.setAttribute("data-item-path", E);
          const q = Array.from(y.containerRef.children);
          C >= 0 && C < q.length ? y.containerRef.insertBefore(
            _,
            q[C]
          ) : y.containerRef.appendChild(_);
          const H = Ce(_), z = te(), Z = E.split(".").slice(1), ue = y.rebuildStateShape({
            path: y.path,
            currentState: I,
            componentId: y.componentId,
            meta: y.meta
          });
          H.render(
            le(Me, {
              stateKey: c,
              itemComponentId: z,
              itemPath: Z,
              localIndex: C,
              arraySetter: ue,
              rebuildStateShape: y.rebuildStateShape,
              renderFn: y.mapFn
            })
          );
        }
      });
    }
    if (a.updateType === "cut") {
      const V = r.slice(0, -1), E = m.getShadowMetadata(c, V);
      E?.mapWrappers && E.mapWrappers.length > 0 && E.mapWrappers.forEach(($) => {
        if ($.containerRef && $.containerRef.isConnected) {
          const I = $.containerRef.querySelector(
            `[data-item-path="${w}"]`
          );
          I && I.remove();
        }
      });
    }
    a.updateType === "update" && (d || U.current?.validation?.key) && r && ne(
      (d || U.current?.validation?.key) + "." + r.join(".")
    );
    const O = r.slice(0, r.length - 1);
    a.updateType === "cut" && U.current?.validation?.key && ne(
      U.current?.validation?.key + "." + O.join(".")
    ), a.updateType === "insert" && U.current?.validation?.key && Ne(
      U.current?.validation?.key + "." + O.join(".")
    ).filter((E) => {
      let $ = E?.split(".").length;
      const I = "";
      if (E == O.join(".") && $ == O.length - 1) {
        let y = E + "." + O;
        ne(E), ve(y, I);
      }
    });
    const L = m.getShadowValue(c), N = m.getShadowMetadata(c, []), B = /* @__PURE__ */ new Set();
    if (!N?.components)
      return L;
    if (a.updateType === "update")
      P?.pathComponents && P.pathComponents.forEach((V) => {
        if (B.has(V))
          return;
        const E = N.components?.get(V);
        E && ((Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"]).includes("none") || (E.forceUpdate(), B.add(V)));
      }), D && typeof D == "object" && !Te(D) && R && typeof R == "object" && !Te(R) && Pe(D, R).forEach((E) => {
        const $ = E.split("."), I = [...r, ...$], y = m.getShadowMetadata(c, I);
        y?.pathComponents && y.pathComponents.forEach((k) => {
          if (B.has(k))
            return;
          const C = N.components?.get(k);
          C && ((Array.isArray(C.reactiveType) ? C.reactiveType : [C.reactiveType || "component"]).includes("none") || (C.forceUpdate(), B.add(k)));
        });
      });
    else if (a.updateType === "insert" || a.updateType === "cut") {
      const V = a.updateType === "insert" ? r : r.slice(0, -1), E = m.getShadowMetadata(c, V);
      if (E?.signals && E.signals.length > 0) {
        const $ = [c, ...V].join("."), I = m.getShadowValue($);
        E.signals.forEach(({ parentId: y, position: k, effect: C }) => {
          const _ = document.querySelector(
            `[data-parent-id="${y}"]`
          );
          if (_) {
            const q = Array.from(_.childNodes);
            if (q[k]) {
              let H = I;
              if (C)
                try {
                  H = new Function(
                    "state",
                    `return (${C})(state)`
                  )(I);
                } catch (z) {
                  console.error("Error evaluating effect function:", z), H = I;
                }
              H != null && typeof H == "object" && (H = JSON.stringify(H)), q[k].textContent = String(H ?? "");
            }
          }
        });
      }
      E?.pathComponents && E.pathComponents.forEach(($) => {
        if (!B.has($)) {
          const I = N.components?.get($);
          I && (I.forceUpdate(), B.add($));
        }
      });
    }
    return N.components.forEach((V, E) => {
      if (B.has(E))
        return;
      const $ = Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"];
      if ($.includes("all")) {
        V.forceUpdate(), B.add(E);
        return;
      }
      if ($.includes("deps") && V.depsFunction) {
        const I = m.getShadowValue(c), y = V.depsFunction(I);
        let k = !1;
        y === !0 ? k = !0 : Array.isArray(y) && (se(V.prevDeps, y) || (V.prevDeps = y, k = !0)), k && (V.forceUpdate(), B.add(E));
      }
    }), B.clear(), We(c, (V) => {
      const E = [...V ?? [], F], $ = /* @__PURE__ */ new Map();
      return E.forEach((I) => {
        const y = `${I.stateKey}:${JSON.stringify(I.path)}`, k = $.get(y);
        k ? (k.timeStamp = Math.max(k.timeStamp, I.timeStamp), k.newValue = I.newValue, k.oldValue = k.oldValue ?? I.oldValue, k.updateType = I.updateType) : $.set(y, { ...I });
      }), Array.from($.values());
    }), He(
      D,
      c,
      U.current,
      T
    ), U.current?.middleware && U.current.middleware({
      updateLog: x,
      update: F
    }), L;
  };
  t.getState().initialStateGlobal[c] || $e(c, e);
  const fe = ge(() => De(
    c,
    oe,
    J.current,
    T
  ), [c, T]), s = U.current?.cogsSync;
  return s && (K.current = s(fe)), fe;
}
function qe(e) {
  return !e || e.length === 0 ? "" : e.map(
    (i) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${i.type}${JSON.stringify(i.dependencies || [])}`
    )
  ).join("");
}
const Ie = (e, i, f) => {
  let g = t.getState().getShadowMetadata(e, i)?.arrayKeys || [];
  if (!f || f.length === 0)
    return g;
  let h = g.map((p) => ({
    key: p,
    value: t.getState().getShadowValue(p)
  }));
  for (const p of f)
    p.type === "filter" ? h = h.filter(
      ({ value: M }, l) => p.fn(M, l)
    ) : p.type === "sort" && h.sort((M, l) => p.fn(M.value, l.value));
  return h.map(({ key: p }) => p);
}, Ve = (e, i, f) => {
  const g = `${e}////${i}`, p = t.getState().getShadowMetadata(e, [])?.components?.get(g);
  if (!p || p.reactiveType == "none" || !(Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType]).includes("component"))
    return;
  const M = [e, ...f].join(".");
  p.paths.add(M);
  const l = t.getState().getShadowMetadata(e, f) || {}, u = l.pathComponents || /* @__PURE__ */ new Set();
  u.add(g), t.getState().setShadowMetadata(e, f, {
    ...l,
    pathComponents: u
  });
}, ye = (e, i, f) => {
  const g = t.getState(), h = g.getShadowMetadata(e, []), p = /* @__PURE__ */ new Set();
  h?.components && h.components.forEach((l, u) => {
    (Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"]).includes("all") && (l.forceUpdate(), p.add(u));
  }), g.getShadowMetadata(e, [...i, "getSelected"])?.pathComponents?.forEach((l) => {
    h?.components?.get(l)?.forceUpdate();
  });
  const M = g.getShadowMetadata(e, i);
  for (let l of M?.arrayKeys || []) {
    const u = l + ".selected", A = g.getShadowMetadata(
      e,
      u.split(".").slice(1)
    );
    l == f && A?.pathComponents?.forEach((b) => {
      h?.components?.get(b)?.forceUpdate();
    });
  }
};
function De(e, i, f, g) {
  const h = /* @__PURE__ */ new Map();
  let p = 0;
  const M = (b) => {
    const o = b.join(".");
    for (const [S] of h)
      (S === o || S.startsWith(o + ".")) && h.delete(S);
    p++;
  };
  function l({
    currentState: b,
    path: o = [],
    meta: S,
    componentId: T
  }) {
    const W = o.map(String).join("."), c = [e, ...o].join(".");
    b = t.getState().getShadowValue(c, S?.validIds);
    const x = function() {
      return t().getShadowValue(e, o);
    }, Y = {
      apply(U, v, K) {
      },
      get(U, v) {
        if (v === "_rebuildStateShape")
          return l;
        if (Object.getOwnPropertyNames(u).includes(v) && o.length === 0)
          return u[v];
        if (v === "getDifferences")
          return () => {
            const s = t.getState().getShadowMetadata(e, []), n = t.getState().getShadowValue(e);
            let r;
            return s?.stateSource === "server" && s.baseServerState ? r = s.baseServerState : r = t.getState().initialStateGlobal[e], Pe(n, r);
          };
        if (v === "sync" && o.length === 0)
          return async function() {
            const s = t.getState().getInitialOptions(e), n = s?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const r = t.getState().getShadowValue(e, []), a = s?.validation?.key;
            try {
              const d = await n.action(r);
              if (d && !d.success && d.errors && a && (t.getState().removeValidationError(a), d.errors.forEach((w) => {
                const m = [a, ...w.path].join(".");
                t.getState().addValidationError(m, w.message);
              }), ie(e)), d?.success) {
                const w = t.getState().getShadowMetadata(e, []);
                t.getState().setShadowMetadata(e, [], {
                  ...w,
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
        if (v === "_status" || v === "getStatus") {
          const s = () => {
            const n = t.getState().getShadowMetadata(e, o), r = t.getState().getShadowValue(c);
            return n?.isDirty === !0 ? "dirty" : n?.isDirty === !1 || n?.stateSource === "server" ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" ? "fresh" : t.getState().getShadowMetadata(e, [])?.stateSource === "server" && !n?.isDirty ? "synced" : r !== void 0 && !n ? "fresh" : "unknown";
          };
          return v === "_status" ? s() : s;
        }
        if (v === "removeStorage")
          return () => {
            const s = t.getState().initialStateGlobal[e], n = ae(e), r = ee(n?.localStorage?.key) ? n.localStorage.key(s) : n?.localStorage?.key, a = `${g}-${e}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (v === "showValidationErrors")
          return () => {
            const s = t.getState().getInitialOptions(e)?.validation;
            if (!s?.key) throw new Error("Validation key not found");
            return t.getState().getValidationErrors(s.key + "." + o.join("."));
          };
        if (Array.isArray(b)) {
          if (v === "getSelected")
            return () => {
              const s = e + "." + o.join(".");
              Ve(e, T, [
                ...o,
                "getSelected"
              ]);
              const n = t.getState().selectedIndicesMap;
              if (!n || !n.has(s))
                return;
              const r = n.get(s);
              if (S?.validIds && !S.validIds.includes(r))
                return;
              const a = t.getState().getShadowValue(r);
              if (a)
                return l({
                  currentState: a,
                  path: r.split(".").slice(1),
                  componentId: T
                });
            };
          if (v === "getSelectedIndex")
            return () => t.getState().getSelectedIndex(
              e + "." + o.join("."),
              S?.validIds
            );
          if (v === "clearSelected")
            return ye(e, o), () => {
              t.getState().clearSelectedIndex({
                arrayKey: e + "." + o.join(".")
              });
            };
          if (v === "useVirtualView")
            return (s) => {
              const {
                itemHeight: n = 50,
                overscan: r = 6,
                stickToBottom: a = !1,
                scrollStickTolerance: d = 75
              } = s, w = G(null), [m, P] = X({
                startIndex: 0,
                endIndex: 10
              }), [R, D] = X({}), j = G(!0), F = G({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), O = G(
                /* @__PURE__ */ new Map()
              );
              de(() => {
                if (!a || !w.current || F.current.isUserScrolling)
                  return;
                const I = w.current;
                I.scrollTo({
                  top: I.scrollHeight,
                  behavior: j.current ? "instant" : "smooth"
                });
              }, [R, a]);
              const L = t.getState().getShadowMetadata(e, o)?.arrayKeys || [], { totalHeight: N, itemOffsets: B } = ge(() => {
                let I = 0;
                const y = /* @__PURE__ */ new Map();
                return (t.getState().getShadowMetadata(e, o)?.arrayKeys || []).forEach((C) => {
                  const _ = C.split(".").slice(1), q = t.getState().getShadowMetadata(e, _)?.virtualizer?.itemHeight || n;
                  y.set(C, {
                    height: q,
                    offset: I
                  }), I += q;
                }), O.current = y, { totalHeight: I, itemOffsets: y };
              }, [L.length, n]);
              de(() => {
                if (a && L.length > 0 && w.current && !F.current.isUserScrolling && j.current) {
                  const I = w.current, y = () => {
                    if (I.clientHeight > 0) {
                      const k = Math.ceil(
                        I.clientHeight / n
                      ), C = L.length - 1, _ = Math.max(
                        0,
                        C - k - r
                      );
                      P({ startIndex: _, endIndex: C }), requestAnimationFrame(() => {
                        E("instant"), j.current = !1;
                      });
                    } else
                      requestAnimationFrame(y);
                  };
                  y();
                }
              }, [L.length, a, n, r]);
              const V = ce(() => {
                const I = w.current;
                if (!I) return;
                const y = I.scrollTop, { scrollHeight: k, clientHeight: C } = I, _ = F.current, q = k - (y + C), H = _.isNearBottom;
                _.isNearBottom = q <= d, y < _.lastScrollTop ? (_.scrollUpCount++, _.scrollUpCount > 3 && H && (_.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : _.isNearBottom && (_.isUserScrolling = !1, _.scrollUpCount = 0), _.lastScrollTop = y;
                let z = 0;
                for (let Z = 0; Z < L.length; Z++) {
                  const ue = L[Z], me = O.current.get(ue);
                  if (me && me.offset + me.height > y) {
                    z = Z;
                    break;
                  }
                }
                if (z !== m.startIndex) {
                  const Z = Math.ceil(C / n);
                  P({
                    startIndex: Math.max(0, z - r),
                    endIndex: Math.min(
                      L.length - 1,
                      z + Z + r
                    )
                  });
                }
              }, [
                L.length,
                m.startIndex,
                n,
                r,
                d
              ]);
              Q(() => {
                const I = w.current;
                if (!(!I || !a))
                  return I.addEventListener("scroll", V, {
                    passive: !0
                  }), () => {
                    I.removeEventListener("scroll", V);
                  };
              }, [V, a]);
              const E = ce(
                (I = "smooth") => {
                  const y = w.current;
                  if (!y) return;
                  F.current.isUserScrolling = !1, F.current.isNearBottom = !0, F.current.scrollUpCount = 0;
                  const k = () => {
                    const C = (_ = 0) => {
                      if (_ > 5) return;
                      const q = y.scrollHeight, H = y.scrollTop, z = y.clientHeight;
                      H + z >= q - 1 || (y.scrollTo({
                        top: q,
                        behavior: I
                      }), setTimeout(() => {
                        const Z = y.scrollHeight, ue = y.scrollTop;
                        (Z !== q || ue + z < Z - 1) && C(_ + 1);
                      }, 50));
                    };
                    C();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback(k, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame(k);
                  });
                },
                []
              );
              return Q(() => {
                if (!a || !w.current) return;
                const I = w.current, y = F.current;
                let k;
                const C = () => {
                  clearTimeout(k), k = setTimeout(() => {
                    !y.isUserScrolling && y.isNearBottom && E(
                      j.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, _ = new MutationObserver(() => {
                  y.isUserScrolling || C();
                });
                _.observe(I, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const q = (H) => {
                  H.target instanceof HTMLImageElement && !y.isUserScrolling && C();
                };
                return I.addEventListener("load", q, !0), j.current ? setTimeout(() => {
                  E("instant");
                }, 0) : C(), () => {
                  clearTimeout(k), _.disconnect(), I.removeEventListener("load", q, !0);
                };
              }, [a, L.length, E]), {
                virtualState: ge(() => {
                  const I = t.getState(), y = I.getShadowValue(
                    [e, ...o].join(".")
                  ), k = I.getShadowMetadata(e, o)?.arrayKeys || [], C = y.slice(
                    m.startIndex,
                    m.endIndex + 1
                  ), _ = k.slice(
                    m.startIndex,
                    m.endIndex + 1
                  );
                  return l({
                    currentState: C,
                    path: o,
                    componentId: T,
                    meta: { ...S, validIds: _ }
                  });
                }, [m.startIndex, m.endIndex, L.length]),
                virtualizerProps: {
                  outer: {
                    ref: w,
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
                      transform: `translateY(${O.current.get(
                        L[m.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: E,
                scrollToIndex: (I, y = "smooth") => {
                  if (w.current && L[I]) {
                    const k = O.current.get(L[I])?.offset || 0;
                    w.current.scrollTo({ top: k, behavior: y });
                  }
                }
              };
            };
          if (v === "stateMap")
            return (s) => {
              const [n, r] = X(
                S?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys
              ), a = t.getState().getShadowValue(c, S?.validIds);
              if (!n)
                throw new Error("No array keys found for mapping");
              const d = l({
                currentState: a,
                path: o,
                componentId: T,
                meta: S
              });
              return a.map((w, m) => {
                const P = n[m]?.split(".").slice(1), R = l({
                  currentState: w,
                  path: P,
                  componentId: T,
                  meta: S
                });
                return s(
                  R,
                  m,
                  d
                );
              });
            };
          if (v === "$stateMap")
            return (s) => le(Ge, {
              proxy: {
                _stateKey: e,
                _path: o,
                _mapFn: s,
                _meta: S
              },
              rebuildStateShape: l
            });
          if (v === "stateFind")
            return (s) => {
              const n = S?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (n)
                for (let r = 0; r < n.length; r++) {
                  const a = n[r];
                  if (!a) continue;
                  const d = t.getState().getShadowValue(a);
                  if (s(d, r)) {
                    const w = a.split(".").slice(1);
                    return l({
                      currentState: d,
                      path: w,
                      componentId: T,
                      meta: S
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (v === "stateFilter")
            return (s) => {
              const n = S?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for filtering.");
              const r = [], a = b.filter(
                (d, w) => s(d, w) ? (r.push(n[w]), !0) : !1
              );
              return l({
                currentState: a,
                path: o,
                componentId: T,
                meta: {
                  validIds: r,
                  transforms: [
                    ...S?.transforms || [],
                    {
                      type: "filter",
                      fn: s
                    }
                  ]
                }
              });
            };
          if (v === "stateSort")
            return (s) => {
              const n = S?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for sorting");
              const r = b.map((a, d) => ({
                item: a,
                key: n[d]
              }));
              return r.sort((a, d) => s(a.item, d.item)).filter(Boolean), l({
                currentState: r.map((a) => a.item),
                path: o,
                componentId: T,
                meta: {
                  validIds: r.map((a) => a.key),
                  transforms: [
                    ...S?.transforms || [],
                    { type: "sort", fn: s }
                  ]
                }
              });
            };
          if (v === "stream")
            return function(s = {}) {
              const {
                bufferSize: n = 100,
                flushInterval: r = 100,
                bufferStrategy: a = "accumulate",
                store: d,
                onFlush: w
              } = s;
              let m = [], P = !1, R = null;
              const D = (N) => {
                if (!P) {
                  if (a === "sliding" && m.length >= n)
                    m.shift();
                  else if (a === "dropping" && m.length >= n)
                    return;
                  m.push(N), m.length >= n && j();
                }
              }, j = () => {
                if (m.length === 0) return;
                const N = [...m];
                if (m = [], d) {
                  const B = d(N);
                  B !== void 0 && (Array.isArray(B) ? B : [B]).forEach((E) => {
                    i(E, o, {
                      updateType: "insert"
                    });
                  });
                } else
                  N.forEach((B) => {
                    i(B, o, {
                      updateType: "insert"
                    });
                  });
                w?.(N);
              };
              r > 0 && (R = setInterval(j, r));
              const F = te(), O = t.getState().getShadowMetadata(e, o) || {}, L = O.streams || /* @__PURE__ */ new Map();
              return L.set(F, { buffer: m, flushTimer: R }), t.getState().setShadowMetadata(e, o, {
                ...O,
                streams: L
              }), {
                write: (N) => D(N),
                writeMany: (N) => N.forEach(D),
                flush: () => j(),
                pause: () => {
                  P = !0;
                },
                resume: () => {
                  P = !1, m.length > 0 && j();
                },
                close: () => {
                  j(), R && clearInterval(R);
                  const N = t.getState().getShadowMetadata(e, o);
                  N?.streams && N.streams.delete(F);
                }
              };
            };
          if (v === "stateList")
            return (s) => /* @__PURE__ */ re(() => {
              const r = G(/* @__PURE__ */ new Map()), a = S?.transforms && S.transforms.length > 0 ? `${T}-${qe(S.transforms)}` : `${T}-base`, [d, w] = X({}), { validIds: m, arrayValues: P } = ge(() => {
                const D = t.getState().getShadowMetadata(e, o)?.transformCaches?.get(a);
                let j;
                D && D.validIds ? j = D.validIds : (j = Ie(
                  e,
                  o,
                  S?.transforms
                ), t.getState().setTransformCache(e, o, a, {
                  validIds: j,
                  computedAt: Date.now(),
                  transforms: S?.transforms || []
                }));
                const F = t.getState().getShadowValue(c, j);
                return {
                  validIds: j,
                  arrayValues: F || []
                };
              }, [a, d]);
              if (console.log("freshValues", m, P), Q(() => {
                const D = t.getState().subscribeToPath(c, (j) => {
                  if (j.type === "GET_SELECTED")
                    return;
                  const O = t.getState().getShadowMetadata(e, o)?.transformCaches;
                  if (O)
                    for (const L of O.keys())
                      L.startsWith(T) && O.delete(L);
                  (j.type === "INSERT" || j.type === "REMOVE" || j.type === "CLEAR_SELECTION") && (console.log("sssssssssssssssssssssssssssss", j), w({}));
                });
                return () => {
                  D();
                };
              }, [T, c]), !Array.isArray(P))
                return null;
              const R = l({
                currentState: P,
                path: o,
                componentId: T,
                meta: {
                  ...S,
                  validIds: m
                }
              });
              return console.log("sssssssssssssssssssssssssssss", R), /* @__PURE__ */ re(ke, { children: P.map((D, j) => {
                const F = m[j];
                if (!F)
                  return null;
                let O = r.current.get(F);
                O || (O = te(), r.current.set(F, O));
                const L = F.split(".").slice(1);
                return le(Me, {
                  key: F,
                  stateKey: e,
                  itemComponentId: O,
                  itemPath: L,
                  localIndex: j,
                  arraySetter: R,
                  rebuildStateShape: l,
                  renderFn: s
                });
              }) });
            }, {});
          if (v === "stateFlattenOn")
            return (s) => {
              const n = b;
              h.clear(), p++;
              const r = n.flatMap(
                (a) => a[s] ?? []
              );
              return l({
                currentState: r,
                path: [...o, "[*]", s],
                componentId: T,
                meta: S
              });
            };
          if (v === "index")
            return (s) => {
              const r = t.getState().getShadowMetadata(e, o)?.arrayKeys?.filter(
                (w) => !S?.validIds || S?.validIds && S?.validIds?.includes(w)
              )?.[s];
              if (!r) return;
              const a = t.getState().getShadowValue(r, S?.validIds);
              return l({
                currentState: a,
                path: r.split(".").slice(1),
                componentId: T,
                meta: S
              });
            };
          if (v === "last")
            return () => {
              const s = t.getState().getShadowValue(e, o);
              if (s.length === 0) return;
              const n = s.length - 1, r = s[n], a = [...o, n.toString()];
              return l({
                currentState: r,
                path: a,
                componentId: T,
                meta: S
              });
            };
          if (v === "insert")
            return (s, n) => (i(s, o, { updateType: "insert" }), l({
              currentState: t.getState().getShadowValue(e, o),
              path: o,
              componentId: T,
              meta: S
            }));
          if (v === "uniqueInsert")
            return (s, n, r) => {
              const a = t.getState().getShadowValue(e, o), d = ee(s) ? s(a) : s;
              let w = null;
              if (!a.some((P) => {
                const R = n ? n.every(
                  (D) => se(P[D], d[D])
                ) : se(P, d);
                return R && (w = P), R;
              }))
                M(o), i(d, o, { updateType: "insert" });
              else if (r && w) {
                const P = r(w), R = a.map(
                  (D) => se(D, w) ? P : D
                );
                M(o), i(R, o, {
                  updateType: "update"
                });
              }
            };
          if (v === "cut")
            return (s, n) => {
              const r = S?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!r || r.length === 0) return;
              const a = s == -1 ? r.length - 1 : s !== void 0 ? s : r.length - 1, d = r[a];
              if (!d) return;
              const w = d.split(".").slice(1);
              i(b, w, {
                updateType: "cut"
              });
            };
          if (v === "cutSelected")
            return () => {
              t.getState().getShadowMetadata(e, o)?.arrayKeys;
              const s = Ie(
                e,
                o,
                S?.transforms
              );
              if (console.log("validKeys", s), !s || s.length === 0) return;
              const n = t.getState().selectedIndicesMap.get(c);
              let r = s.findIndex(
                (d) => d === n
              );
              console.log("indexToCut", r);
              const a = s[r == -1 ? s.length - 1 : r]?.split(".").slice(1);
              console.log("pathForCut", a), i(b, a, {
                updateType: "cut"
              });
            };
          if (v === "cutByValue")
            return (s) => {
              const n = t.getState().getShadowMetadata(e, o), r = S?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r)
                if (t.getState().getShadowValue(d) === s) {
                  a = d;
                  break;
                }
              if (a) {
                const d = a.split(".").slice(1);
                i(null, d, { updateType: "cut" });
              }
            };
          if (v === "toggleByValue")
            return (s) => {
              const n = t.getState().getShadowMetadata(e, o), r = S?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r) {
                const w = t.getState().getShadowValue(d);
                if (console.log("itemValue sdasdasdasd", w), w === s) {
                  a = d;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", a), a) {
                const d = a.split(".").slice(1);
                console.log("itemValue keyToCut", a), i(s, d, {
                  updateType: "cut"
                });
              } else
                i(s, o, { updateType: "insert" });
            };
          if (v === "findWith")
            return (s, n) => {
              const r = t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!r)
                throw new Error("No array keys found for sorting");
              let a = null, d = [];
              for (const w of r) {
                let m = t.getState().getShadowValue(w, S?.validIds);
                if (m && m[s] === n) {
                  a = m, d = w.split(".").slice(1);
                  break;
                }
              }
              return l({
                currentState: a,
                path: d,
                componentId: T,
                meta: S
              });
            };
        }
        if (v === "cut") {
          let s = t.getState().getShadowValue(o.join("."));
          return () => {
            i(s, o, { updateType: "cut" });
          };
        }
        if (v === "get")
          return () => (Ve(e, T, o), t.getState().getShadowValue(c, S?.validIds));
        if (v === "$derive")
          return (s) => Ae({
            _stateKey: e,
            _path: o,
            _effect: s.toString(),
            _meta: S
          });
        if (v === "$get")
          return () => Ae({ _stateKey: e, _path: o, _meta: S });
        if (v === "lastSynced") {
          const s = `${e}:${o.join(".")}`;
          return t.getState().getSyncInfo(s);
        }
        if (v == "getLocalStorage")
          return (s) => Se(g + "-" + e + "-" + s);
        if (v === "isSelected") {
          const s = [e, ...o].slice(0, -1);
          if (ye(e, o, void 0), Array.isArray(
            t.getState().getShadowValue(s.join("."), S?.validIds)
          )) {
            o[o.length - 1];
            const n = s.join("."), r = t.getState().selectedIndicesMap.get(n), a = e + "." + o.join(".");
            return r === a;
          }
          return;
        }
        if (v === "setSelected")
          return (s) => {
            const n = o.slice(0, -1), r = e + "." + n.join("."), a = e + "." + o.join(".");
            ye(e, n, void 0), t.getState().selectedIndicesMap.get(r), s && t.getState().setSelectedIndex(r, a);
          };
        if (v === "toggleSelected")
          return () => {
            const s = o.slice(0, -1), n = e + "." + s.join("."), r = e + "." + o.join(".");
            t.getState().selectedIndicesMap.get(n) === r ? t.getState().clearSelectedIndex({ arrayKey: n }) : t.getState().setSelectedIndex(n, r);
          };
        if (v === "_componentId")
          return T;
        if (o.length == 0) {
          if (v === "addValidation")
            return (s) => {
              const n = t.getState().getInitialOptions(e)?.validation;
              if (!n?.key) throw new Error("Validation key not found");
              ne(n.key), s.forEach((r) => {
                const a = [n.key, ...r.path].join(".");
                ve(a, r.message);
              }), ie(e);
            };
          if (v === "applyJsonPatch")
            return (s) => {
              const n = t.getState(), r = (a) => !a || a === "/" ? [] : a.split("/").slice(1).map((d) => d.replace(/~1/g, "/").replace(/~0/g, "~"));
              for (const a of s) {
                const d = r(a.path);
                switch (a.op) {
                  case "add":
                  case "replace": {
                    const { value: w } = a;
                    n.updateShadowAtPath(e, d, w), n.markAsDirty(e, d, { bubble: !0 });
                    break;
                  }
                  case "remove": {
                    n.removeShadowArrayElement(e, d);
                    const w = d.slice(0, -1);
                    n.markAsDirty(e, w, { bubble: !0 });
                    break;
                  }
                }
              }
            };
          if (v === "validateZodSchema")
            return () => {
              const s = t.getState().getInitialOptions(e)?.validation;
              if (!s?.zodSchema || !s?.key)
                throw new Error("Zod schema or validation key not found");
              ne(s.key);
              const n = t.getState().getShadowValue(e), r = s.zodSchema.safeParse(n);
              return r.success ? !0 : (r.error.errors.forEach((a) => {
                const d = [s.key, ...a.path].join(".");
                ve(d, a.message);
              }), ie(e), !1);
            };
          if (v === "getComponents")
            return () => t.getState().getShadowMetadata(e, [])?.components;
          if (v === "getAllFormRefs")
            return () => pe.getState().getFormRefsByStateKey(e);
        }
        if (v === "getFormRef")
          return () => pe.getState().getFormRef(e + "." + o.join("."));
        if (v === "validationWrapper")
          return ({
            children: s,
            hideMessage: n
          }) => /* @__PURE__ */ re(
            be,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: o,
              stateKey: e,
              children: s
            }
          );
        if (v === "_stateKey") return e;
        if (v === "_path") return o;
        if (v === "update")
          return (s) => (i(s, o, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const n = t.getState().getShadowMetadata(e, o);
              t.getState().setShadowMetadata(e, o, {
                ...n,
                isDirty: !1,
                // EXPLICITLY set to false, not just undefined
                stateSource: "server",
                // Mark as coming from server
                lastServerSync: Date.now()
                // Add timestamp
              });
              const r = [e, ...o].join(".");
              t.getState().notifyPathSubscribers(r, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (v === "toggle") {
          const s = t.getState().getShadowValue([e, ...o].join("."));
          if (console.log("currentValueAtPath", s), typeof b != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            i(!s, o, {
              updateType: "update"
            });
          };
        }
        if (v === "formElement")
          return (s, n) => /* @__PURE__ */ re(
            be,
            {
              formOpts: n,
              path: o,
              stateKey: e,
              children: /* @__PURE__ */ re(
                Ze,
                {
                  stateKey: e,
                  path: o,
                  rebuildStateShape: l,
                  setState: i,
                  formOpts: n,
                  renderFn: s
                }
              )
            }
          );
        const oe = [...o, v], fe = t.getState().getShadowValue(e, oe);
        return l({
          currentState: fe,
          path: oe,
          componentId: T,
          meta: S
        });
      }
    }, J = new Proxy(x, Y);
    return h.set(W, {
      proxy: J,
      stateVersion: p
    }), J;
  }
  const u = {
    removeValidation: (b) => {
      b?.validationKey && ne(b.validationKey);
    },
    revertToInitialState: (b) => {
      const o = t.getState().getInitialOptions(e)?.validation;
      o?.key && ne(o.key), b?.validationKey && ne(b.validationKey);
      const S = t.getState().getShadowMetadata(e, []);
      S?.stateSource === "server" && S.baseServerState ? S.baseServerState : t.getState().initialStateGlobal[e];
      const T = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), h.clear(), p++, t.getState().initializeShadowState(e, T), l({
        currentState: T,
        path: [],
        componentId: f
      });
      const W = ae(e), c = ee(W?.localStorage?.key) ? W?.localStorage?.key(T) : W?.localStorage?.key, x = `${g}-${e}-${c}`;
      x && localStorage.removeItem(x);
      const Y = t.getState().getShadowMetadata(e, []);
      return Y && Y?.components?.forEach((J) => {
        J.forceUpdate();
      }), T;
    },
    updateInitialState: (b) => {
      h.clear(), p++;
      const o = De(
        e,
        i,
        f,
        g
      ), S = t.getState().initialStateGlobal[e], T = ae(e), W = ee(T?.localStorage?.key) ? T?.localStorage?.key(S) : T?.localStorage?.key, c = `${g}-${e}-${W}`;
      return localStorage.getItem(c) && localStorage.removeItem(c), je(() => {
        $e(e, b), t.getState().initializeShadowState(e, b);
        const x = t.getState().getShadowMetadata(e, []);
        x && x?.components?.forEach((Y) => {
          Y.forceUpdate();
        });
      }), {
        fetchId: (x) => o.get()[x]
      };
    }
  };
  return l({
    currentState: t.getState().getShadowValue(e, []),
    componentId: f,
    path: []
  });
}
function Ae(e) {
  return le(ze, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: i
}) {
  const f = G(null), g = G(`map-${crypto.randomUUID()}`), h = G(!1), p = G(/* @__PURE__ */ new Map());
  Q(() => {
    const l = f.current;
    if (!l || h.current) return;
    const u = setTimeout(() => {
      const A = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, b = A.mapWrappers || [];
      b.push({
        instanceId: g.current,
        mapFn: e._mapFn,
        containerRef: l,
        rebuildStateShape: i,
        path: e._path,
        componentId: g.current,
        meta: e._meta
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...A,
        mapWrappers: b
      }), h.current = !0, M();
    }, 0);
    return () => {
      if (clearTimeout(u), g.current) {
        const A = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        A.mapWrappers && (A.mapWrappers = A.mapWrappers.filter(
          (b) => b.instanceId !== g.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, A));
      }
      p.current.forEach((A) => A.unmount());
    };
  }, []);
  const M = () => {
    const l = f.current;
    if (!l) return;
    const u = t.getState().getShadowValue(
      [e._stateKey, ...e._path].join("."),
      e._meta?.validIds
    );
    if (!Array.isArray(u)) return;
    const A = e._meta?.validIds ?? t.getState().getShadowMetadata(e._stateKey, e._path)?.arrayKeys ?? [], b = i({
      currentState: u,
      path: e._path,
      componentId: g.current,
      meta: e._meta
    });
    u.forEach((o, S) => {
      const T = A[S];
      if (!T) return;
      const W = te(), c = document.createElement("div");
      c.setAttribute("data-item-path", T), l.appendChild(c);
      const x = Ce(c);
      p.current.set(T, x);
      const Y = T.split(".").slice(1);
      x.render(
        le(Me, {
          stateKey: e._stateKey,
          itemComponentId: W,
          itemPath: Y,
          localIndex: S,
          arraySetter: b,
          rebuildStateShape: i,
          renderFn: e._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ re("div", { ref: f, "data-map-container": g.current });
}
function ze({
  proxy: e
}) {
  const i = G(null), f = G(null), g = G(!1), h = `${e._stateKey}-${e._path.join(".")}`, p = t.getState().getShadowValue(
    [e._stateKey, ...e._path].join("."),
    e._meta?.validIds
  );
  return Q(() => {
    const M = i.current;
    if (!M || g.current) return;
    const l = setTimeout(() => {
      if (!M.parentElement) {
        console.warn("Parent element not found for signal", h);
        return;
      }
      const u = M.parentElement, b = Array.from(u.childNodes).indexOf(M);
      let o = u.getAttribute("data-parent-id");
      o || (o = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", o)), f.current = `instance-${crypto.randomUUID()}`;
      const S = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, T = S.signals || [];
      T.push({
        instanceId: f.current,
        parentId: o,
        position: b,
        effect: e._effect
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...S,
        signals: T
      });
      let W = p;
      if (e._effect)
        try {
          W = new Function(
            "state",
            `return (${e._effect})(state)`
          )(p);
        } catch (x) {
          console.error("Error evaluating effect function:", x);
        }
      W !== null && typeof W == "object" && (W = JSON.stringify(W));
      const c = document.createTextNode(String(W ?? ""));
      M.replaceWith(c), g.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(l), f.current) {
        const u = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        u.signals && (u.signals = u.signals.filter(
          (A) => A.instanceId !== f.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, u));
      }
    };
  }, []), le("span", {
    ref: i,
    style: { display: "contents" },
    "data-signal-id": h
  });
}
const Me = Re(
  Ye,
  (e, i) => e.itemPath.join(".") === i.itemPath.join(".") && e.stateKey === i.stateKey && e.itemComponentId === i.itemComponentId && e.localIndex === i.localIndex
), Je = (e) => {
  const [i, f] = X(!1);
  return de(() => {
    if (!e.current) {
      f(!0);
      return;
    }
    const g = Array.from(e.current.querySelectorAll("img"));
    if (g.length === 0) {
      f(!0);
      return;
    }
    let h = 0;
    const p = () => {
      h++, h === g.length && f(!0);
    };
    return g.forEach((M) => {
      M.complete ? p() : (M.addEventListener("load", p), M.addEventListener("error", p));
    }), () => {
      g.forEach((M) => {
        M.removeEventListener("load", p), M.removeEventListener("error", p);
      });
    };
  }, [e.current]), i;
};
function Ye({
  stateKey: e,
  itemComponentId: i,
  itemPath: f,
  localIndex: g,
  arraySetter: h,
  rebuildStateShape: p,
  renderFn: M
}) {
  const [, l] = X({}), { ref: u, inView: A } = Le(), b = G(null), o = Je(b), S = G(!1), T = [e, ...f].join(".");
  Ue(e, i, l);
  const W = ce(
    (U) => {
      b.current = U, u(U);
    },
    [u]
  );
  Q(() => {
    t.getState().subscribeToPath(T, (U) => {
      l({});
    });
  }, []), Q(() => {
    if (!A || !o || S.current)
      return;
    const U = b.current;
    if (U && U.offsetHeight > 0) {
      S.current = !0;
      const v = U.offsetHeight;
      t.getState().setShadowMetadata(e, f, {
        virtualizer: {
          itemHeight: v,
          domRef: U
        }
      });
      const K = f.slice(0, -1), oe = [e, ...K].join(".");
      t.getState().notifyPathSubscribers(oe, {
        type: "ITEMHEIGHT",
        itemKey: f.join("."),
        ref: b.current
      });
    }
  }, [A, o, e, f]);
  const c = [e, ...f].join("."), x = t.getState().getShadowValue(c);
  if (x === void 0)
    return null;
  const Y = p({
    currentState: x,
    path: f,
    componentId: i
  }), J = M(Y, g, h);
  return /* @__PURE__ */ re("div", { ref: W, children: J });
}
function Ze({
  stateKey: e,
  path: i,
  rebuildStateShape: f,
  renderFn: g,
  formOpts: h,
  setState: p
}) {
  const [M] = X(() => te()), [, l] = X({}), u = [e, ...i].join(".");
  Ue(e, M, l);
  const A = t.getState().getShadowValue(u), [b, o] = X(A), S = G(!1), T = G(null);
  Q(() => {
    !S.current && !se(A, b) && o(A);
  }, [A]), Q(() => {
    const J = t.getState().subscribeToPath(u, (U) => {
      l({});
    });
    return () => {
      J(), T.current && (clearTimeout(T.current), S.current = !1);
    };
  }, []);
  const W = ce(
    (J) => {
      o(J), S.current = !0, T.current && clearTimeout(T.current);
      const U = h?.debounceTime ?? 200;
      T.current = setTimeout(() => {
        S.current = !1, p(J, i, { updateType: "update" });
      }, U);
    },
    [p, i, h?.debounceTime]
  ), c = ce(() => {
    T.current && (clearTimeout(T.current), S.current = !1, p(b, i, { updateType: "update" }));
  }, [p, i, b]), x = f({
    currentState: A,
    path: i,
    componentId: M
  }), Y = new Proxy(x, {
    get(J, U) {
      return U === "inputProps" ? {
        value: b ?? "",
        onChange: (v) => {
          W(v.target.value);
        },
        onBlur: c,
        ref: pe.getState().getFormRef(e + "." + i.join("."))
      } : J[U];
    }
  });
  return /* @__PURE__ */ re(ke, { children: g(Y) });
}
function Ue(e, i, f) {
  const g = `${e}////${i}`;
  de(() => {
    const h = t.getState().getShadowMetadata(e, []), p = h?.components || /* @__PURE__ */ new Map();
    return p.set(g, {
      forceUpdate: () => f({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), t.getState().setShadowMetadata(e, [], {
      ...h,
      components: p
    }), () => {
      const M = t.getState().getShadowMetadata(e, []);
      M?.components && M.components.delete(g);
    };
  }, [e, g]);
}
export {
  Ae as $cogsSignal,
  it as addStateOptions,
  ct as createCogsState,
  lt as notifyComponent,
  Be as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
