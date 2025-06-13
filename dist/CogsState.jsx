"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as le, useRef as ee, useEffect as de, useLayoutEffect as ke, useMemo as $e, createElement as re, useSyncExternalStore as Te, startTransition as Ae } from "react";
import { transformStateFunc as Ne, isDeepEqual as L, isFunction as Z, getNestedValue as q, getDifferences as he, debounce as Ve } from "./utility.js";
import { pushFunc as se, updateFn as Q, cutFunc as K, ValidationWrapper as _e, FormControlComponent as Ce } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as t, formRefStore as me } from "./store.js";
import { useCogsConfig as pe } from "./CogsStateClient.jsx";
import { applyPatch as be } from "fast-json-patch";
function ye(e, i) {
  const S = t.getState().getInitialOptions, u = t.getState().setInitialStateOptions, f = S(e) || {};
  u(e, {
    ...f,
    ...i
  });
}
function ve({
  stateKey: e,
  options: i,
  initialOptionsPart: S
}) {
  const u = H(e) || {}, f = S[e] || {}, k = t.getState().setInitialStateOptions, h = { ...f, ...u };
  let v = !1;
  if (i)
    for (const s in i)
      h.hasOwnProperty(s) ? (s == "localStorage" && i[s] && h[s].key !== i[s]?.key && (v = !0, h[s] = i[s]), s == "initialState" && i[s] && h[s] !== i[s] && // Different references
      !L(h[s], i[s]) && (v = !0, h[s] = i[s])) : (v = !0, h[s] = i[s]);
  v && k(e, h);
}
function Qe(e, { formElements: i, validation: S }) {
  return { initialState: e, formElements: i, validation: S };
}
const Ke = (e, i) => {
  let S = e;
  const [u, f] = Ne(S);
  (Object.keys(f).length > 0 || i && Object.keys(i).length > 0) && Object.keys(f).forEach((v) => {
    f[v] = f[v] || {}, f[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...f[v].formElements || {}
      // State-specific overrides
    }, H(v) || t.getState().setInitialStateOptions(v, f[v]);
  }), t.getState().setInitialStates(u), t.getState().setCreatedState(u);
  const k = (v, s) => {
    const [m] = le(s?.componentId ?? ue());
    ve({
      stateKey: v,
      options: s,
      initialOptionsPart: f
    });
    const n = t.getState().cogsStateStore[v] || u[v], I = s?.modifyState ? s.modifyState(n) : n, [M, _] = Me(
      I,
      {
        stateKey: v,
        syncUpdate: s?.syncUpdate,
        componentId: m,
        localStorage: s?.localStorage,
        middleware: s?.middleware,
        enabledSync: s?.enabledSync,
        reactiveType: s?.reactiveType,
        reactiveDeps: s?.reactiveDeps,
        initialState: s?.initialState,
        dependencies: s?.dependencies,
        serverState: s?.serverState
      }
    );
    return _;
  };
  function h(v, s) {
    ve({ stateKey: v, options: s, initialOptionsPart: f }), s.localStorage && je(v, s), oe(v);
  }
  return { useCogsState: k, setCogsOptions: h };
}, {
  setUpdaterState: te,
  setState: Y,
  getInitialOptions: H,
  getKeyState: we,
  getValidationErrors: xe,
  setStateLog: Oe,
  updateInitialStateGlobal: ge,
  addValidationError: Fe,
  removeValidationError: B,
  setServerSyncActions: Re
} = t.getState(), Ie = (e, i, S, u, f) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    u
  );
  const k = Z(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (k && u) {
    const h = `${u}-${i}-${k}`;
    let v;
    try {
      v = ae(h)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: f ?? v
    }, m = Pe.serialize(s);
    window.localStorage.setItem(
      h,
      JSON.stringify(m.json)
    );
  }
}, ae = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, je = (e, i) => {
  const S = t.getState().cogsStateStore[e], { sessionId: u } = pe(), f = Z(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (f && u) {
    const k = ae(
      `${u}-${e}-${f}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return Y(e, k.state), oe(e), !0;
  }
  return !1;
}, Ee = (e, i, S, u, f, k) => {
  const h = {
    initialState: i,
    updaterState: ne(
      e,
      u,
      f,
      k
    ),
    state: S
  };
  ge(e, h.initialState), te(e, h.updaterState), Y(e, h.state);
}, oe = (e) => {
  const i = t.getState().stateComponents.get(e);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((u) => u());
  });
}, et = (e, i) => {
  const S = t.getState().stateComponents.get(e);
  if (S) {
    const u = `${e}////${i}`, f = S.components.get(u);
    if ((f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none"))
      return;
    f && f.forceUpdate();
  }
}, Ue = (e, i, S, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: q(i, u),
        newValue: q(S, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(S, u)
      };
    case "cut":
      return {
        oldValue: q(i, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Me(e, {
  stateKey: i,
  serverSync: S,
  localStorage: u,
  formElements: f,
  reactiveDeps: k,
  reactiveType: h,
  componentId: v,
  initialState: s,
  syncUpdate: m,
  dependencies: n,
  serverState: I
} = {}) {
  const [M, _] = le({}), { sessionId: C } = pe();
  let D = !i;
  const [g] = le(i ?? ue()), d = t.getState().stateLog[g], X = ee(/* @__PURE__ */ new Set()), J = ee(v ?? ue()), P = ee(
    null
  );
  P.current = H(g) ?? null, de(() => {
    if (m && m.stateKey === g && m.path?.[0]) {
      Y(g, (a) => ({
        ...a,
        [m.path[0]]: m.newValue
      }));
      const o = `${m.stateKey}:${m.path.join(".")}`;
      t.getState().setSyncInfo(o, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), de(() => {
    if (s) {
      ye(g, {
        initialState: s
      });
      const o = P.current, c = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, p = t.getState().initialStateGlobal[g];
      if (!(p && !L(p, s) || !p) && !c)
        return;
      let w = null;
      const $ = Z(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      $ && C && (w = ae(`${C}-${g}-${$}`));
      let A = s, T = !1;
      const V = c ? Date.now() : 0, R = w?.lastUpdated || 0, b = w?.lastSyncedWithServer || 0;
      c && V > R ? (A = o.serverState.data, T = !0) : w && R > b && (A = w.state, o?.localStorage?.onChange && o?.localStorage?.onChange(A)), Ee(
        g,
        s,
        A,
        l,
        J.current,
        C
      ), T && $ && C && Ie(A, g, o, C, Date.now()), oe(g), (Array.isArray(h) ? h : [h || "component"]).includes("none") || _({});
    }
  }, [
    s,
    I?.status,
    I?.data,
    ...n || []
  ]), ke(() => {
    D && ye(g, {
      serverSync: S,
      formElements: f,
      initialState: s,
      localStorage: u,
      middleware: P.current?.middleware
    });
    const o = `${g}////${J.current}`, a = t.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => _({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: h ?? ["component", "deps"]
    }), t.getState().stateComponents.set(g, a), _({}), () => {
      const c = `${g}////${J.current}`;
      a && (a.components.delete(c), a.components.size === 0 && t.getState().stateComponents.delete(g));
    };
  }, []);
  const l = (o, a, c, p) => {
    if (Array.isArray(a)) {
      const y = `${g}-${a.join(".")}`;
      X.current.add(y);
    }
    Y(g, (y) => {
      const w = Z(o) ? o(y) : o, $ = `${g}-${a.join(".")}`;
      if ($) {
        let G = !1, N = t.getState().signalDomElements.get($);
        if ((!N || N.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const j = a.slice(0, -1), W = q(w, j);
          if (Array.isArray(W)) {
            G = !0;
            const E = `${g}-${j.join(".")}`;
            N = t.getState().signalDomElements.get(E);
          }
        }
        if (N) {
          const j = G ? q(w, a.slice(0, -1)) : q(w, a);
          N.forEach(({ parentId: W, position: E, effect: F }) => {
            const O = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (O) {
              const z = Array.from(O.childNodes);
              if (z[E]) {
                const U = F ? new Function("state", `return (${F})(state)`)(j) : j;
                z[E].textContent = String(U);
              }
            }
          });
        }
      }
      c.updateType === "update" && (p || P.current?.validation?.key) && a && B(
        (p || P.current?.validation?.key) + "." + a.join(".")
      );
      const A = a.slice(0, a.length - 1);
      c.updateType === "cut" && P.current?.validation?.key && B(
        P.current?.validation?.key + "." + A.join(".")
      ), c.updateType === "insert" && P.current?.validation?.key && xe(
        P.current?.validation?.key + "." + A.join(".")
      ).filter(([N, j]) => {
        let W = N?.split(".").length;
        if (N == A.join(".") && W == A.length - 1) {
          let E = N + "." + A;
          B(N), Fe(E, j);
        }
      });
      const T = t.getState().stateComponents.get(g);
      if (T) {
        const G = he(y, w), N = new Set(G), j = c.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          W,
          E
        ] of T.components.entries()) {
          let F = !1;
          const O = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (!O.includes("none")) {
            if (O.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (O.includes("component") && ((E.paths.has(j) || E.paths.has("")) && (F = !0), !F))
              for (const z of N) {
                let U = z;
                for (; ; ) {
                  if (E.paths.has(U)) {
                    F = !0;
                    break;
                  }
                  const ie = U.lastIndexOf(".");
                  if (ie !== -1) {
                    const fe = U.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(U.substring(ie + 1))
                    ) && E.paths.has(fe)) {
                      F = !0;
                      break;
                    }
                    U = fe;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (F) break;
              }
            if (!F && O.includes("deps") && E.depsFunction) {
              const z = E.depsFunction(w);
              let U = !1;
              typeof z == "boolean" ? z && (U = !0) : L(E.deps, z) || (E.deps = z, U = !0), U && (F = !0);
            }
            F && E.forceUpdate();
          }
        }
      }
      const V = Date.now();
      a = a.map((G, N) => {
        const j = a.slice(0, -1), W = q(w, j);
        return N === a.length - 1 && ["insert", "cut"].includes(c.updateType) ? (W.length - 1).toString() : G;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        c.updateType,
        y,
        w,
        a
      );
      const { oldValue: R, newValue: b } = Ue(
        c.updateType,
        y,
        w,
        a
      ), x = {
        timeStamp: V,
        stateKey: g,
        path: a,
        updateType: c.updateType,
        status: "new",
        oldValue: R,
        newValue: b
      };
      if (Oe(g, (G) => {
        const j = [...G ?? [], x].reduce((W, E) => {
          const F = `${E.stateKey}:${JSON.stringify(E.path)}`, O = W.get(F);
          return O ? (O.timeStamp = Math.max(O.timeStamp, E.timeStamp), O.newValue = E.newValue, O.oldValue = O.oldValue ?? E.oldValue, O.updateType = E.updateType) : W.set(F, { ...E }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(j.values());
      }), Ie(
        w,
        g,
        P.current,
        C
      ), P.current?.middleware && P.current.middleware({
        updateLog: d,
        update: x
      }), P.current?.serverSync) {
        const G = t.getState().serverState[g], N = P.current?.serverSync;
        Re(g, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: w }),
          rollBackState: G,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  t.getState().updaterState[g] || (te(
    g,
    ne(
      g,
      l,
      J.current,
      C
    )
  ), t.getState().cogsStateStore[g] || Y(g, e), t.getState().initialStateGlobal[g] || ge(g, e));
  const r = $e(() => ne(
    g,
    l,
    J.current,
    C
  ), [g]);
  return [we(g), r];
}
function ne(e, i, S, u) {
  const f = /* @__PURE__ */ new Map();
  let k = 0;
  const h = (m) => {
    const n = m.join(".");
    for (const [I] of f)
      (I === n || I.startsWith(n + ".")) && f.delete(I);
    k++;
  }, v = {
    removeValidation: (m) => {
      m?.validationKey && B(m.validationKey);
    },
    revertToInitialState: (m) => {
      const n = t.getState().getInitialOptions(e)?.validation;
      n?.key && B(n?.key), m?.validationKey && B(m.validationKey);
      const I = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), f.clear(), k++;
      const M = s(I, []), _ = H(e), C = Z(_?.localStorage?.key) ? _?.localStorage?.key(I) : _?.localStorage?.key, D = `${u}-${e}-${C}`;
      D && localStorage.removeItem(D), te(e, M), Y(e, I);
      const g = t.getState().stateComponents.get(e);
      return g && g.components.forEach((d) => {
        d.forceUpdate();
      }), I;
    },
    updateInitialState: (m) => {
      f.clear(), k++;
      const n = ne(
        e,
        i,
        S,
        u
      ), I = t.getState().initialStateGlobal[e], M = H(e), _ = Z(M?.localStorage?.key) ? M?.localStorage?.key(I) : M?.localStorage?.key, C = `${u}-${e}-${_}`;
      return console.log("removing storage", C), localStorage.getItem(C) && localStorage.removeItem(C), Ae(() => {
        ge(e, m), te(e, n), Y(e, m);
        const D = t.getState().stateComponents.get(e);
        D && D.components.forEach((g) => {
          g.forceUpdate();
        });
      }), {
        fetchId: (D) => n.get()[D]
      };
    },
    _initialState: t.getState().initialStateGlobal[e],
    _serverState: t.getState().serverState[e],
    _isLoading: t.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const m = t.getState().serverState[e];
      return !!(m && L(m, we(e)));
    }
  };
  function s(m, n = [], I) {
    const M = n.map(String).join(".");
    f.get(M);
    const _ = function() {
      return t().getNestedState(e, n);
    };
    Object.keys(v).forEach((g) => {
      _[g] = v[g];
    });
    const C = {
      apply(g, d, X) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), t().getNestedState(e, n);
      },
      get(g, d) {
        if (d !== "then" && !d.startsWith("$") && d !== "stateMapNoRender") {
          const l = n.join("."), r = `${e}////${S}`;
          console.log(
            ".........................................................",
            l
          );
          const o = t.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (n.length > 0 || d === "get") && a.paths.add(l);
          }
        }
        if (d === "getDifferences")
          return () => he(
            t.getState().cogsStateStore[e],
            t.getState().initialStateGlobal[e]
          );
        if (d === "sync" && n.length === 0)
          return async function() {
            const l = t.getState().getInitialOptions(e), r = l?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = t.getState().getNestedState(e, []), a = l?.validation?.key;
            try {
              const c = await r.action(o);
              if (c && !c.success && c.errors && a) {
                t.getState().removeValidationError(a), c.errors.forEach((y) => {
                  const w = [a, ...y.path].join(".");
                  t.getState().addValidationError(w, y.message);
                });
                const p = t.getState().stateComponents.get(e);
                p && p.components.forEach((y) => {
                  y.forceUpdate();
                });
              }
              return c?.success && r.onSuccess ? r.onSuccess(c.data) : !c?.success && r.onError && r.onError(c.error), c;
            } catch (c) {
              return r.onError && r.onError(c), { success: !1, error: c };
            }
          };
        if (d === "_status") {
          const l = t.getState().getNestedState(e, n), r = t.getState().initialStateGlobal[e], o = q(r, n);
          return L(l, o) ? "fresh" : "stale";
        }
        if (d === "getStatus")
          return function() {
            const l = t().getNestedState(
              e,
              n
            ), r = t.getState().initialStateGlobal[e], o = q(r, n);
            return L(l, o) ? "fresh" : "stale";
          };
        if (d === "removeStorage")
          return () => {
            const l = t.getState().initialStateGlobal[e], r = H(e), o = Z(r?.localStorage?.key) ? r?.localStorage?.key(l) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (d === "showValidationErrors")
          return () => {
            const l = t.getState().getInitialOptions(e)?.validation;
            if (!l?.key)
              throw new Error("Validation key not found");
            return t.getState().getValidationErrors(l.key + "." + n.join("."));
          };
        if (Array.isArray(m)) {
          const l = () => I?.validIndices ? m.map((o, a) => ({
            item: o,
            originalIndex: I.validIndices[a]
          })) : t.getState().getNestedState(e, n).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (d === "getSelected")
            return () => {
              const r = t.getState().getSelectedIndex(e, n.join("."));
              if (r !== void 0)
                return s(
                  m[r],
                  [...n, r.toString()],
                  I
                );
            };
          if (d === "clearSelected")
            return () => {
              t.getState().clearSelectedIndex({ stateKey: e, path: n });
            };
          if (d === "getSelectedIndex")
            return () => t.getState().getSelectedIndex(e, n.join(".")) ?? -1;
          if (d === "stateSort")
            return (r) => {
              const a = [...l()].sort(
                (y, w) => r(y.item, w.item)
              ), c = a.map(({ item: y }) => y), p = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: y }) => y
                )
              };
              return s(c, n, p);
            };
          if (d === "stateFilter")
            return (r) => {
              const a = l().filter(
                ({ item: y }, w) => r(y, w)
              ), c = a.map(({ item: y }) => y), p = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: y }) => y
                )
              };
              return s(c, n, p);
            };
          if (d === "stateMap" || d === "stateMapNoRender")
            return (r) => m.map((a, c) => {
              let p;
              I?.validIndices && I.validIndices[c] !== void 0 ? p = I.validIndices[c] : p = c;
              const y = [...n, p.toString()], w = s(a, y, I);
              return r(
                a,
                w,
                c,
                m,
                s(m, n, I)
              );
            });
          if (d === "$stateMap")
            return (r) => re(De, {
              proxy: {
                _stateKey: e,
                _path: n,
                _mapFn: r
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (d === "stateFlattenOn")
            return (r) => {
              const o = m;
              f.clear(), k++;
              const a = o.flatMap(
                (c) => c[r] ?? []
              );
              return s(
                a,
                [...n, "[*]", r],
                I
              );
            };
          if (d === "index")
            return (r) => {
              const o = m[r];
              return s(o, [...n, r.toString()]);
            };
          if (d === "last")
            return () => {
              const r = t.getState().getNestedState(e, n);
              if (r.length === 0) return;
              const o = r.length - 1, a = r[o], c = [...n, o.toString()];
              return s(a, c);
            };
          if (d === "insert")
            return (r) => (h(n), se(i, r, n, e), s(
              t.getState().getNestedState(e, n),
              n
            ));
          if (d === "uniqueInsert")
            return (r, o, a) => {
              const c = t.getState().getNestedState(e, n), p = Z(r) ? r(c) : r;
              let y = null;
              if (!c.some(($) => {
                if (o) {
                  const T = o.every(
                    (V) => L($[V], p[V])
                  );
                  return T && (y = $), T;
                }
                const A = L($, p);
                return A && (y = $), A;
              }))
                h(n), se(i, p, n, e);
              else if (a && y) {
                const $ = a(y), A = c.map(
                  (T) => L(T, y) ? $ : T
                );
                h(n), Q(i, A, n);
              }
            };
          if (d === "cut")
            return (r, o) => {
              if (!o?.waitForSync)
                return h(n), K(i, n, e, r), s(
                  t.getState().getNestedState(e, n),
                  n
                );
            };
          if (d === "cutByValue")
            return (r) => {
              for (let o = 0; o < m.length; o++)
                m[o] === r && K(i, n, e, o);
            };
          if (d === "toggleByValue")
            return (r) => {
              const o = m.findIndex((a) => a === r);
              o > -1 ? K(i, n, e, o) : se(i, r, n, e);
            };
          if (d === "stateFind")
            return (r) => {
              const a = l().find(
                ({ item: p }, y) => r(p, y)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return s(a.item, c, I);
            };
          if (d === "findWith")
            return (r, o) => {
              const c = l().find(
                ({ item: y }) => y[r] === o
              );
              if (!c) return;
              const p = [...n, c.originalIndex.toString()];
              return s(c.item, p, I);
            };
        }
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const l = n.slice(0, -1), r = t.getState().getNestedState(e, l);
          if (Array.isArray(r) && d === "cut")
            return () => K(
              i,
              l,
              e,
              Number(X)
            );
        }
        if (d === "get")
          return () => t.getState().getNestedState(e, n);
        if (d === "$derive")
          return (l) => ce({
            _stateKey: e,
            _path: n,
            _effect: l.toString()
          });
        if (d === "$derive")
          return (l) => ce({
            _stateKey: e,
            _path: n,
            _effect: l.toString()
          });
        if (d === "$get")
          return () => ce({
            _stateKey: e,
            _path: n
          });
        if (d === "lastSynced") {
          const l = `${e}:${n.join(".")}`;
          return t.getState().getSyncInfo(l);
        }
        if (d == "getLocalStorage")
          return (l) => ae(u + "-" + e + "-" + l);
        if (d === "_selected") {
          const l = n.slice(0, -1), r = l.join("."), o = t.getState().getNestedState(e, l);
          return Array.isArray(o) ? Number(n[n.length - 1]) === t.getState().getSelectedIndex(e, r) : void 0;
        }
        if (d === "setSelected")
          return (l) => {
            const r = n.slice(0, -1), o = Number(n[n.length - 1]), a = r.join(".");
            l ? t.getState().setSelectedIndex(e, a, o) : t.getState().setSelectedIndex(e, a, void 0);
            const c = t.getState().getNestedState(e, [...r]);
            Q(i, c, r), h(r);
          };
        if (d === "toggleSelected")
          return () => {
            const l = n.slice(0, -1), r = Number(n[n.length - 1]), o = l.join("."), a = t.getState().getSelectedIndex(e, o);
            t.getState().setSelectedIndex(
              e,
              o,
              a === r ? void 0 : r
            );
            const c = t.getState().getNestedState(e, [...l]);
            Q(i, c, l), h(l);
          };
        if (n.length == 0) {
          if (d === "applyJsonPatch")
            return (l) => {
              const r = t.getState().cogsStateStore[e], a = be(r, l).newDocument, c = H(e), p = c?.middleware, y = t.getState().setInitialStateOptions;
              c && p && y(e, {
                ...c,
                middleware: void 0
              }), Ee(
                e,
                t.getState().initialStateGlobal[e],
                a,
                i,
                S,
                u
              ), c && p && y(e, {
                ...c,
                middleware: p
              });
              const w = t.getState().stateComponents.get(e);
              if (console.log("component update logic stateEntry", w), !w) return;
              const $ = /* @__PURE__ */ new Set();
              console.log("component update logic pathsToCheck", $), Array.isArray(r) && Array.isArray(a) && r.length !== a.length && $.add(""), console.log("component update logic pathsToCheck", $), l.forEach((A) => {
                const V = A.path.slice(1).split("/");
                if (A.op === "add" || A.op === "remove") {
                  const b = V[V.length - 1];
                  if (!isNaN(parseInt(b))) {
                    const x = V.slice(0, -1).join(".");
                    $.add(x), x === "" && $.add("");
                  }
                }
                let R = "";
                V.forEach((b, x) => {
                  x > 0 && (R += "."), R += b, $.add(R);
                }), $.add("");
              });
              for (const [
                A,
                T
              ] of w.components.entries()) {
                console.log("component update logic component", T);
                let V = !1;
                const R = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                if (!R.includes("none")) {
                  if (R.includes("all")) {
                    T.forceUpdate();
                    continue;
                  }
                  if (R.includes("component"))
                    for (const b of T.paths) {
                      if ($.has(b)) {
                        V = !0;
                        break;
                      }
                      for (const x of $)
                        if (x.startsWith(b + ".") || b === "" && x !== "") {
                          V = !0;
                          break;
                        }
                      if (V) break;
                    }
                  if (!V && R.includes("deps") && T.depsFunction) {
                    const b = T.depsFunction(a);
                    let x = !1;
                    typeof b == "boolean" ? b && (x = !0) : L(T.deps, b) || (T.deps = b, x = !0), x && (V = !0);
                  }
                  V && T.forceUpdate();
                }
              }
            };
          if (d === "validateZodSchema")
            return () => {
              const l = t.getState().getInitialOptions(e)?.validation, r = t.getState().addValidationError;
              if (!l?.zodSchema)
                throw new Error("Zod schema not found");
              if (!l?.key)
                throw new Error("Validation key not found");
              B(l.key);
              const o = t.getState().cogsStateStore[e];
              try {
                const a = t.getState().getValidationErrors(l.key);
                a && a.length > 0 && a.forEach(([p]) => {
                  p && p.startsWith(l.key) && B(p);
                });
                const c = l.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((y) => {
                  const w = y.path, $ = y.message, A = [l.key, ...w].join(".");
                  r(A, $);
                }), oe(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (d === "_componentId") return S;
          if (d === "getComponents")
            return () => t().stateComponents.get(e);
          if (d === "getAllFormRefs")
            return () => me.getState().getFormRefsByStateKey(e);
          if (d === "_initialState")
            return t.getState().initialStateGlobal[e];
          if (d === "_serverState")
            return t.getState().serverState[e];
          if (d === "_isLoading")
            return t.getState().isLoadingGlobal[e];
          if (d === "revertToInitialState")
            return v.revertToInitialState;
          if (d === "updateInitialState") return v.updateInitialState;
          if (d === "removeValidation") return v.removeValidation;
        }
        if (d === "getFormRef")
          return () => me.getState().getFormRef(e + "." + n.join("."));
        if (d === "validationWrapper")
          return ({
            children: l,
            hideMessage: r
          }) => /* @__PURE__ */ Se(
            _e,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: t.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: I?.validIndices,
              children: l
            }
          );
        if (d === "_stateKey") return e;
        if (d === "_path") return n;
        if (d === "_isServerSynced") return v._isServerSynced;
        if (d === "update")
          return (l, r) => {
            if (r?.debounce)
              Ve(() => {
                Q(i, l, n, "");
                const o = t.getState().getNestedState(e, n);
                r?.afterUpdate && r.afterUpdate(o);
              }, r.debounce);
            else {
              Q(i, l, n, "");
              const o = t.getState().getNestedState(e, n);
              r?.afterUpdate && r.afterUpdate(o);
            }
            h(n);
          };
        if (d === "formElement")
          return (l, r) => /* @__PURE__ */ Se(
            Ce,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: l,
              formOpts: r
            }
          );
        const J = [...n, d], P = t.getState().getNestedState(e, J);
        return s(P, J, I);
      }
    }, D = new Proxy(_, C);
    return f.set(M, {
      proxy: D,
      stateVersion: k
    }), D;
  }
  return s(
    t.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return re(We, { proxy: e });
}
function De({
  proxy: e,
  rebuildStateShape: i
}) {
  const S = t().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? i(
    S,
    e._path
  ).stateMapNoRender(
    (f, k, h, v, s) => e._mapFn(f, k, h, v, s)
  ) : null;
}
function We({
  proxy: e
}) {
  const i = ee(null), S = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const f = u.parentElement, h = Array.from(f.childNodes).indexOf(u);
    let v = f.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", v));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: h,
      effect: e._effect
    };
    t.getState().addSignalElement(S, m);
    const n = t.getState().getNestedState(e._stateKey, e._path);
    let I;
    if (e._effect)
      try {
        I = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (_) {
        console.error("Error evaluating effect function during mount:", _), I = n;
      }
    else
      I = n;
    I !== null && typeof I == "object" && (I = JSON.stringify(I));
    const M = document.createTextNode(String(I));
    u.replaceWith(M);
  }, [e._stateKey, e._path.join("."), e._effect]), re("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function tt(e) {
  const i = Te(
    (S) => {
      const u = t.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => t.getState().getNestedState(e._stateKey, e._path)
  );
  return re("text", {}, String(i));
}
export {
  ce as $cogsSignal,
  tt as $cogsSignalStore,
  Qe as addStateOptions,
  Ke as createCogsState,
  et as notifyComponent,
  Me as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
