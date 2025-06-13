"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as le, useRef as ee, useEffect as de, useLayoutEffect as $e, useMemo as ke, createElement as re, useSyncExternalStore as Te, startTransition as Ae } from "react";
import { transformStateFunc as Ne, isDeepEqual as L, isFunction as Z, getNestedValue as q, getDifferences as he, debounce as Ve } from "./utility.js";
import { pushFunc as se, updateFn as Q, cutFunc as K, ValidationWrapper as _e, FormControlComponent as Pe } from "./Functions.jsx";
import Ce from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as t, formRefStore as me } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
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
  const u = H(e) || {}, f = S[e] || {}, $ = t.getState().setInitialStateOptions, h = { ...f, ...u };
  let v = !1;
  if (i)
    for (const s in i)
      h.hasOwnProperty(s) ? (s == "localStorage" && i[s] && h[s].key !== i[s]?.key && (v = !0, h[s] = i[s]), s == "initialState" && i[s] && h[s] !== i[s] && // Different references
      !L(h[s], i[s]) && (v = !0, h[s] = i[s])) : (v = !0, h[s] = i[s]);
  v && $(e, h);
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
  const $ = (v, s) => {
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
  return { useCogsState: $, setCogsOptions: h };
}, {
  setUpdaterState: te,
  setState: Y,
  getInitialOptions: H,
  getKeyState: pe,
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
  const $ = Z(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if ($ && u) {
    const h = `${u}-${i}-${$}`;
    let v;
    try {
      v = ae(h)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: f ?? v
    }, m = Ce.serialize(s);
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
  const S = t.getState().cogsStateStore[e], { sessionId: u } = we(), f = Z(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (f && u) {
    const $ = ae(
      `${u}-${e}-${f}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return Y(e, $.state), oe(e), !0;
  }
  return !1;
}, Ee = (e, i, S, u, f, $) => {
  const h = {
    initialState: i,
    updaterState: ne(
      e,
      u,
      f,
      $
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
  reactiveDeps: $,
  reactiveType: h,
  componentId: v,
  initialState: s,
  syncUpdate: m,
  dependencies: n,
  serverState: I
} = {}) {
  const [M, _] = le({}), { sessionId: P } = we();
  let D = !i;
  const [g] = le(i ?? ue()), l = t.getState().stateLog[g], X = ee(/* @__PURE__ */ new Set()), J = ee(v ?? ue()), C = ee(
    null
  );
  C.current = H(g) ?? null, de(() => {
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
      const o = C.current, c = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, w = t.getState().initialStateGlobal[g];
      if (!(w && !L(w, s) || !w) && !c)
        return;
      let p = null;
      const k = Z(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      k && P && (p = ae(`${P}-${g}-${k}`));
      let T = s, A = !1;
      const V = c ? Date.now() : 0, R = p?.lastUpdated || 0, b = p?.lastSyncedWithServer || 0;
      c && V > R ? (T = o.serverState.data, A = !0) : p && R > b && (T = p.state, o?.localStorage?.onChange && o?.localStorage?.onChange(T)), Ee(
        g,
        s,
        T,
        d,
        J.current,
        P
      ), A && k && P && Ie(T, g, o, P, Date.now()), oe(g), (Array.isArray(h) ? h : [h || "component"]).includes("none") || _({});
    }
  }, [
    s,
    I?.status,
    I?.data,
    ...n || []
  ]), $e(() => {
    D && ye(g, {
      serverSync: S,
      formElements: f,
      initialState: s,
      localStorage: u,
      middleware: C.current?.middleware
    });
    const o = `${g}////${J.current}`, a = t.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => _({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: h ?? ["component", "deps"]
    }), t.getState().stateComponents.set(g, a), _({}), () => {
      const c = `${g}////${J.current}`;
      a && (a.components.delete(c), a.components.size === 0 && t.getState().stateComponents.delete(g));
    };
  }, []);
  const d = (o, a, c, w) => {
    if (Array.isArray(a)) {
      const y = `${g}-${a.join(".")}`;
      X.current.add(y);
    }
    Y(g, (y) => {
      const p = Z(o) ? o(y) : o, k = `${g}-${a.join(".")}`;
      if (k) {
        let G = !1, N = t.getState().signalDomElements.get(k);
        if ((!N || N.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const j = a.slice(0, -1), W = q(p, j);
          if (Array.isArray(W)) {
            G = !0;
            const E = `${g}-${j.join(".")}`;
            N = t.getState().signalDomElements.get(E);
          }
        }
        if (N) {
          const j = G ? q(p, a.slice(0, -1)) : q(p, a);
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
      c.updateType === "update" && (w || C.current?.validation?.key) && a && B(
        (w || C.current?.validation?.key) + "." + a.join(".")
      );
      const T = a.slice(0, a.length - 1);
      c.updateType === "cut" && C.current?.validation?.key && B(
        C.current?.validation?.key + "." + T.join(".")
      ), c.updateType === "insert" && C.current?.validation?.key && xe(
        C.current?.validation?.key + "." + T.join(".")
      ).filter(([N, j]) => {
        let W = N?.split(".").length;
        if (N == T.join(".") && W == T.length - 1) {
          let E = N + "." + T;
          B(N), Fe(E, j);
        }
      });
      const A = t.getState().stateComponents.get(g);
      if (A) {
        const G = he(y, p), N = new Set(G), j = c.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          W,
          E
        ] of A.components.entries()) {
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
              const z = E.depsFunction(p);
              let U = !1;
              typeof z == "boolean" ? z && (U = !0) : L(E.deps, z) || (E.deps = z, U = !0), U && (F = !0);
            }
            F && E.forceUpdate();
          }
        }
      }
      const V = Date.now();
      a = a.map((G, N) => {
        const j = a.slice(0, -1), W = q(p, j);
        return N === a.length - 1 && ["insert", "cut"].includes(c.updateType) ? (W.length - 1).toString() : G;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        c.updateType,
        y,
        p,
        a
      );
      const { oldValue: R, newValue: b } = Ue(
        c.updateType,
        y,
        p,
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
        p,
        g,
        C.current,
        P
      ), C.current?.middleware && C.current.middleware({
        updateLog: l,
        update: x
      }), C.current?.serverSync) {
        const G = t.getState().serverState[g], N = C.current?.serverSync;
        Re(g, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: p }),
          rollBackState: G,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return p;
    });
  };
  t.getState().updaterState[g] || (te(
    g,
    ne(
      g,
      d,
      J.current,
      P
    )
  ), t.getState().cogsStateStore[g] || Y(g, e), t.getState().initialStateGlobal[g] || ge(g, e));
  const r = ke(() => ne(
    g,
    d,
    J.current,
    P
  ), [g]);
  return [pe(g), r];
}
function ne(e, i, S, u) {
  const f = /* @__PURE__ */ new Map();
  let $ = 0;
  const h = (m) => {
    const n = m.join(".");
    for (const [I] of f)
      (I === n || I.startsWith(n + ".")) && f.delete(I);
    $++;
  }, v = {
    removeValidation: (m) => {
      m?.validationKey && B(m.validationKey);
    },
    revertToInitialState: (m) => {
      const n = t.getState().getInitialOptions(e)?.validation;
      n?.key && B(n?.key), m?.validationKey && B(m.validationKey);
      const I = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), f.clear(), $++;
      const M = s(I, []), _ = H(e), P = Z(_?.localStorage?.key) ? _?.localStorage?.key(I) : _?.localStorage?.key, D = `${u}-${e}-${P}`;
      D && localStorage.removeItem(D), te(e, M), Y(e, I);
      const g = t.getState().stateComponents.get(e);
      return g && g.components.forEach((l) => {
        l.forceUpdate();
      }), I;
    },
    updateInitialState: (m) => {
      f.clear(), $++;
      const n = ne(
        e,
        i,
        S,
        u
      ), I = t.getState().initialStateGlobal[e], M = H(e), _ = Z(M?.localStorage?.key) ? M?.localStorage?.key(I) : M?.localStorage?.key, P = `${u}-${e}-${_}`;
      return console.log("removing storage", P), localStorage.getItem(P) && localStorage.removeItem(P), Ae(() => {
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
      return !!(m && L(m, pe(e)));
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
    const P = {
      apply(g, l, X) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), t().getNestedState(e, n);
      },
      get(g, l) {
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender") {
          const d = n.join("."), r = `${e}////${S}`, o = t.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (n.length > 0 || l === "get") && a.paths.add(d);
          }
        }
        if (l === "getDifferences")
          return () => he(
            t.getState().cogsStateStore[e],
            t.getState().initialStateGlobal[e]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = t.getState().getInitialOptions(e), r = d?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = t.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const c = await r.action(o);
              if (c && !c.success && c.errors && a) {
                t.getState().removeValidationError(a), c.errors.forEach((y) => {
                  const p = [a, ...y.path].join(".");
                  t.getState().addValidationError(p, y.message);
                });
                const w = t.getState().stateComponents.get(e);
                w && w.components.forEach((y) => {
                  y.forceUpdate();
                });
              }
              return c?.success && r.onSuccess ? r.onSuccess(c.data) : !c?.success && r.onError && r.onError(c.error), c;
            } catch (c) {
              return r.onError && r.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = t.getState().getNestedState(e, n), r = t.getState().initialStateGlobal[e], o = q(r, n);
          return L(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = t().getNestedState(
              e,
              n
            ), r = t.getState().initialStateGlobal[e], o = q(r, n);
            return L(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = t.getState().initialStateGlobal[e], r = H(e), o = Z(r?.localStorage?.key) ? r?.localStorage?.key(d) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = t.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return t.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(m)) {
          const d = () => I?.validIndices ? m.map((o, a) => ({
            item: o,
            originalIndex: I.validIndices[a]
          })) : t.getState().getNestedState(e, n).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const r = t.getState().getSelectedIndex(e, n.join("."));
              if (r !== void 0)
                return s(
                  m[r],
                  [...n, r.toString()],
                  I
                );
            };
          if (l === "clearSelected")
            return () => {
              t.getState().clearSelectedIndex({ stateKey: e, path: n });
            };
          if (l === "getSelectedIndex")
            return () => t.getState().getSelectedIndex(e, n.join(".")) ?? -1;
          if (l === "stateSort")
            return (r) => {
              const a = [...d()].sort(
                (y, p) => r(y.item, p.item)
              ), c = a.map(({ item: y }) => y), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: y }) => y
                )
              };
              return s(c, n, w);
            };
          if (l === "stateFilter")
            return (r) => {
              const a = d().filter(
                ({ item: y }, p) => r(y, p)
              ), c = a.map(({ item: y }) => y), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: y }) => y
                )
              };
              return s(c, n, w);
            };
          if (l === "stateMap" || l === "stateMapNoRender")
            return (r) => m.map((a, c) => {
              let w;
              I?.validIndices && I.validIndices[c] !== void 0 ? w = I.validIndices[c] : w = c;
              const y = [...n, w.toString()], p = s(a, y, I);
              return r(
                a,
                p,
                c,
                m,
                s(m, n, I)
              );
            });
          if (l === "$stateMap")
            return (r) => re(De, {
              proxy: {
                _stateKey: e,
                _path: n,
                _mapFn: r
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateFlattenOn")
            return (r) => {
              const o = m;
              f.clear(), $++;
              const a = o.flatMap(
                (c) => c[r] ?? []
              );
              return s(
                a,
                [...n, "[*]", r],
                I
              );
            };
          if (l === "index")
            return (r) => {
              const o = m[r];
              return s(o, [...n, r.toString()]);
            };
          if (l === "last")
            return () => {
              const r = t.getState().getNestedState(e, n);
              if (r.length === 0) return;
              const o = r.length - 1, a = r[o], c = [...n, o.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (r) => (h(n), se(i, r, n, e), s(
              t.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (r, o, a) => {
              const c = t.getState().getNestedState(e, n), w = Z(r) ? r(c) : r;
              let y = null;
              if (!c.some((k) => {
                if (o) {
                  const A = o.every(
                    (V) => L(k[V], w[V])
                  );
                  return A && (y = k), A;
                }
                const T = L(k, w);
                return T && (y = k), T;
              }))
                h(n), se(i, w, n, e);
              else if (a && y) {
                const k = a(y), T = c.map(
                  (A) => L(A, y) ? k : A
                );
                h(n), Q(i, T, n);
              }
            };
          if (l === "cut")
            return (r, o) => {
              if (!o?.waitForSync)
                return h(n), K(i, n, e, r), s(
                  t.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (r) => {
              for (let o = 0; o < m.length; o++)
                m[o] === r && K(i, n, e, o);
            };
          if (l === "toggleByValue")
            return (r) => {
              const o = m.findIndex((a) => a === r);
              o > -1 ? K(i, n, e, o) : se(i, r, n, e);
            };
          if (l === "stateFind")
            return (r) => {
              const a = d().find(
                ({ item: w }, y) => r(w, y)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return s(a.item, c, I);
            };
          if (l === "findWith")
            return (r, o) => {
              const c = d().find(
                ({ item: y }) => y[r] === o
              );
              if (!c) return;
              const w = [...n, c.originalIndex.toString()];
              return s(c.item, w, I);
            };
        }
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const d = n.slice(0, -1), r = t.getState().getNestedState(e, d);
          if (Array.isArray(r) && l === "cut")
            return () => K(
              i,
              d,
              e,
              Number(X)
            );
        }
        if (l === "get")
          return () => t.getState().getNestedState(e, n);
        if (l === "$derive")
          return (d) => ce({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$derive")
          return (d) => ce({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => ce({
            _stateKey: e,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${e}:${n.join(".")}`;
          return t.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ae(u + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), r = d.join("."), o = t.getState().getNestedState(e, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === t.getState().getSelectedIndex(e, r) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const r = n.slice(0, -1), o = Number(n[n.length - 1]), a = r.join(".");
            d ? t.getState().setSelectedIndex(e, a, o) : t.getState().setSelectedIndex(e, a, void 0);
            const c = t.getState().getNestedState(e, [...r]);
            Q(i, c, r), h(r);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), r = Number(n[n.length - 1]), o = d.join("."), a = t.getState().getSelectedIndex(e, o);
            t.getState().setSelectedIndex(
              e,
              o,
              a === r ? void 0 : r
            );
            const c = t.getState().getNestedState(e, [...d]);
            Q(i, c, d), h(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const r = t.getState().cogsStateStore[e], a = be(r, d).newDocument, c = H(e), w = c?.middleware, y = t.getState().setInitialStateOptions;
              c && w && y(e, {
                ...c,
                middleware: void 0
              }), Ee(
                e,
                t.getState().initialStateGlobal[e],
                a,
                i,
                S,
                u
              ), c && w && y(e, {
                ...c,
                middleware: w
              });
              const p = t.getState().stateComponents.get(e);
              if (!p) return;
              const k = /* @__PURE__ */ new Set();
              Array.isArray(r) && Array.isArray(a) && r.length !== a.length && k.add(""), d.forEach((T) => {
                const V = T.path.slice(1).split("/");
                if (T.op === "add" || T.op === "remove") {
                  const b = V[V.length - 1];
                  if (!isNaN(parseInt(b))) {
                    const x = V.slice(0, -1).join(".");
                    k.add(x), x === "" && k.add("");
                  }
                }
                let R = "";
                V.forEach((b, x) => {
                  x > 0 && (R += "."), R += b, k.add(R);
                }), k.add("");
              });
              for (const [
                T,
                A
              ] of p.components.entries()) {
                let V = !1;
                const R = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
                if (!R.includes("none")) {
                  if (R.includes("all")) {
                    A.forceUpdate();
                    continue;
                  }
                  if (R.includes("component"))
                    for (const b of A.paths) {
                      if (k.has(b)) {
                        V = !0;
                        break;
                      }
                      for (const x of k)
                        if (x.startsWith(b + ".") || b === "" && x !== "") {
                          V = !0;
                          break;
                        }
                      if (V) break;
                    }
                  if (!V && R.includes("deps") && A.depsFunction) {
                    const b = A.depsFunction(a);
                    let x = !1;
                    typeof b == "boolean" ? b && (x = !0) : L(A.deps, b) || (A.deps = b, x = !0), x && (V = !0);
                  }
                  V && A.forceUpdate();
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = t.getState().getInitialOptions(e)?.validation, r = t.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              B(d.key);
              const o = t.getState().cogsStateStore[e];
              try {
                const a = t.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(d.key) && B(w);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((y) => {
                  const p = y.path, k = y.message, T = [d.key, ...p].join(".");
                  r(T, k);
                }), oe(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return S;
          if (l === "getComponents")
            return () => t().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => me.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return t.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return t.getState().serverState[e];
          if (l === "_isLoading")
            return t.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return v.revertToInitialState;
          if (l === "updateInitialState") return v.updateInitialState;
          if (l === "removeValidation") return v.removeValidation;
        }
        if (l === "getFormRef")
          return () => me.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: r
          }) => /* @__PURE__ */ Se(
            _e,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: t.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: I?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return v._isServerSynced;
        if (l === "update")
          return (d, r) => {
            if (r?.debounce)
              Ve(() => {
                Q(i, d, n, "");
                const o = t.getState().getNestedState(e, n);
                r?.afterUpdate && r.afterUpdate(o);
              }, r.debounce);
            else {
              Q(i, d, n, "");
              const o = t.getState().getNestedState(e, n);
              r?.afterUpdate && r.afterUpdate(o);
            }
            h(n);
          };
        if (l === "formElement")
          return (d, r) => /* @__PURE__ */ Se(
            Pe,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: r
            }
          );
        const J = [...n, l], C = t.getState().getNestedState(e, J);
        return s(C, J, I);
      }
    }, D = new Proxy(_, P);
    return f.set(M, {
      proxy: D,
      stateVersion: $
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
    (f, $, h, v, s) => e._mapFn(f, $, h, v, s)
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
