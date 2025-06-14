"use client";
import { jsx as ye } from "react/jsx-runtime";
import { useState as de, useRef as te, useEffect as ue, useLayoutEffect as $e, useMemo as Ne, createElement as ae, useSyncExternalStore as Te, startTransition as Ae } from "react";
import { transformStateFunc as be, isDeepEqual as G, isFunction as B, getNestedValue as W, getDifferences as fe, debounce as Ve } from "./utility.js";
import { pushFunc as ce, updateFn as K, cutFunc as ee, ValidationWrapper as _e, FormControlComponent as Pe } from "./Functions.jsx";
import xe from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ve } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as Ce } from "fast-json-patch";
function he(e, i) {
  const y = r.getState().getInitialOptions, u = r.getState().setInitialStateOptions, g = y(e) || {};
  u(e, {
    ...g,
    ...i
  });
}
function Ie({
  stateKey: e,
  options: i,
  initialOptionsPart: y
}) {
  const u = Y(e) || {}, g = y[e] || {}, $ = r.getState().setInitialStateOptions, p = { ...g, ...u };
  let v = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (v = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !G(p[s], i[s]) && (v = !0, p[s] = i[s])) : (v = !0, p[s] = i[s]);
  v && $(e, p);
}
function Ke(e, { formElements: i, validation: y }) {
  return { initialState: e, formElements: i, validation: y };
}
const et = (e, i) => {
  let y = e;
  const [u, g] = be(y);
  (Object.keys(g).length > 0 || i && Object.keys(i).length > 0) && Object.keys(g).forEach((v) => {
    g[v] = g[v] || {}, g[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...g[v].formElements || {}
      // State-specific overrides
    }, Y(v) || r.getState().setInitialStateOptions(v, g[v]);
  }), r.getState().setInitialStates(u), r.getState().setCreatedState(u);
  const $ = (v, s) => {
    const [S] = de(s?.componentId ?? ge());
    Ie({
      stateKey: v,
      options: s,
      initialOptionsPart: g
    });
    const t = r.getState().cogsStateStore[v] || u[v], m = s?.modifyState ? s.modifyState(t) : t, [U, V] = Me(
      m,
      {
        stateKey: v,
        syncUpdate: s?.syncUpdate,
        componentId: S,
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
    return V;
  };
  function p(v, s) {
    Ie({ stateKey: v, options: s, initialOptionsPart: g }), s.localStorage && Ue(v, s), ie(v);
  }
  return { useCogsState: $, setCogsOptions: p };
}, {
  setUpdaterState: ne,
  setState: H,
  getInitialOptions: Y,
  getKeyState: Ee,
  getValidationErrors: Oe,
  setStateLog: Fe,
  updateInitialStateGlobal: Se,
  addValidationError: Re,
  removeValidationError: J,
  setServerSyncActions: je
} = r.getState(), pe = (e, i, y, u, g) => {
  y?.log && console.log(
    "saving to localstorage",
    i,
    y.localStorage?.key,
    u
  );
  const $ = B(y?.localStorage?.key) ? y.localStorage?.key(e) : y?.localStorage?.key;
  if ($ && u) {
    const p = `${u}-${i}-${$}`;
    let v;
    try {
      v = oe(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: g ?? v
    }, S = xe.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(S.json)
    );
  }
}, oe = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Ue = (e, i) => {
  const y = r.getState().cogsStateStore[e], { sessionId: u } = we(), g = B(i?.localStorage?.key) ? i.localStorage.key(y) : i?.localStorage?.key;
  if (g && u) {
    const $ = oe(
      `${u}-${e}-${g}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return H(e, $.state), ie(e), !0;
  }
  return !1;
}, ke = (e, i, y, u, g, $) => {
  const p = {
    initialState: i,
    updaterState: re(
      e,
      u,
      g,
      $
    ),
    state: y
  };
  Se(e, p.initialState), ne(e, p.updaterState), H(e, p.state);
}, ie = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const y = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || y.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((u) => u());
  });
}, tt = (e, i) => {
  const y = r.getState().stateComponents.get(e);
  if (y) {
    const u = `${e}////${i}`, g = y.components.get(u);
    if ((g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none"))
      return;
    g && g.forceUpdate();
  }
}, De = (e, i, y, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: W(i, u),
        newValue: W(y, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: W(y, u)
      };
    case "cut":
      return {
        oldValue: W(i, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Me(e, {
  stateKey: i,
  serverSync: y,
  localStorage: u,
  formElements: g,
  reactiveDeps: $,
  reactiveType: p,
  componentId: v,
  initialState: s,
  syncUpdate: S,
  dependencies: t,
  serverState: m
} = {}) {
  const [U, V] = de({}), { sessionId: _ } = we();
  let D = !i;
  const [f] = de(i ?? ge()), l = r.getState().stateLog[f], X = te(/* @__PURE__ */ new Set()), L = te(v ?? ge()), P = te(
    null
  );
  P.current = Y(f) ?? null, ue(() => {
    if (S && S.stateKey === f && S.path?.[0]) {
      H(f, (a) => ({
        ...a,
        [S.path[0]]: S.newValue
      }));
      const o = `${S.stateKey}:${S.path.join(".")}`;
      r.getState().setSyncInfo(o, {
        timeStamp: S.timeStamp,
        userId: S.userId
      });
    }
  }, [S]), ue(() => {
    if (s) {
      he(f, {
        initialState: s
      });
      const o = P.current, c = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, I = r.getState().initialStateGlobal[f];
      if (!(I && !G(I, s) || !I) && !c)
        return;
      let E = null;
      const w = B(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      w && _ && (E = oe(`${_}-${f}-${w}`));
      let k = s, x = !1;
      const C = c ? Date.now() : 0, R = E?.lastUpdated || 0, q = E?.lastSyncedWithServer || 0;
      c && C > R ? (k = o.serverState.data, x = !0) : E && R > q && (k = E.state, o?.localStorage?.onChange && o?.localStorage?.onChange(k)), ke(
        f,
        s,
        k,
        d,
        L.current,
        _
      ), x && w && _ && pe(k, f, o, _, Date.now()), ie(f), (Array.isArray(p) ? p : [p || "component"]).includes("none") || V({});
    }
  }, [
    s,
    m?.status,
    m?.data,
    ...t || []
  ]), $e(() => {
    D && he(f, {
      serverSync: y,
      formElements: g,
      initialState: s,
      localStorage: u,
      middleware: P.current?.middleware
    });
    const o = `${f}////${L.current}`, a = r.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(f, a), V({}), () => {
      const c = `${f}////${L.current}`;
      a && (a.components.delete(c), a.components.size === 0 && r.getState().stateComponents.delete(f));
    };
  }, []);
  const d = (o, a, c, I) => {
    if (Array.isArray(a)) {
      const h = `${f}-${a.join(".")}`;
      X.current.add(h);
    }
    H(f, (h) => {
      const E = B(o) ? o(h) : o, w = `${f}-${a.join(".")}`;
      if (w) {
        let F = !1, N = r.getState().signalDomElements.get(w);
        if ((!N || N.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const j = a.slice(0, -1), O = W(E, j);
          if (Array.isArray(O)) {
            F = !0;
            const b = `${f}-${j.join(".")}`;
            N = r.getState().signalDomElements.get(b);
          }
        }
        if (N) {
          const j = F ? W(E, a.slice(0, -1)) : W(E, a);
          N.forEach(({ parentId: O, position: b, effect: T }) => {
            const A = document.querySelector(
              `[data-parent-id="${O}"]`
            );
            if (A) {
              const Z = Array.from(A.childNodes);
              if (Z[b]) {
                const z = T ? new Function("state", `return (${T})(state)`)(j) : j;
                Z[b].textContent = String(z);
              }
            }
          });
        }
      }
      c.updateType === "update" && (I || P.current?.validation?.key) && a && J(
        (I || P.current?.validation?.key) + "." + a.join(".")
      );
      const k = a.slice(0, a.length - 1);
      c.updateType === "cut" && P.current?.validation?.key && J(
        P.current?.validation?.key + "." + k.join(".")
      ), c.updateType === "insert" && P.current?.validation?.key && Oe(
        P.current?.validation?.key + "." + k.join(".")
      ).filter(([N, j]) => {
        let O = N?.split(".").length;
        if (N == k.join(".") && O == k.length - 1) {
          let b = N + "." + k;
          J(N), Re(b, j);
        }
      });
      const x = r.getState().stateComponents.get(f);
      if (x) {
        const F = fe(h, E), N = new Set(F), j = c.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "", O = [];
        for (const [
          b,
          T
        ] of x.components.entries()) {
          let A = !1;
          const Z = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
          if (!Z.includes("none")) {
            if (Z.includes("all")) {
              O.push(T.forceUpdate);
              continue;
            }
            if (Z.includes("component") && ((T.paths.has(j) || T.paths.has("")) && (A = !0), !A))
              for (const z of N) {
                let M = z;
                for (; ; ) {
                  if (T.paths.has(M)) {
                    A = !0;
                    break;
                  }
                  const se = M.lastIndexOf(".");
                  if (se !== -1) {
                    const me = M.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(M.substring(se + 1))
                    ) && T.paths.has(me)) {
                      A = !0;
                      break;
                    }
                    M = me;
                  } else
                    M = "";
                  if (M === "")
                    break;
                }
                if (A) break;
              }
            if (!A && Z.includes("deps") && T.depsFunction) {
              const z = T.depsFunction(E);
              let M = !1;
              typeof z == "boolean" ? z && (M = !0) : G(T.deps, z) || (T.deps = z, M = !0), M && (A = !0);
            }
            A && O.push(T.forceUpdate);
          }
        }
        O.length > 0 && queueMicrotask(() => {
          O.forEach((b) => b());
        });
      }
      const C = Date.now();
      a = a.map((F, N) => {
        const j = a.slice(0, -1), O = W(E, j);
        return N === a.length - 1 && ["insert", "cut"].includes(c.updateType) ? (O.length - 1).toString() : F;
      });
      const { oldValue: R, newValue: q } = De(
        c.updateType,
        h,
        E,
        a
      ), Q = {
        timeStamp: C,
        stateKey: f,
        path: a,
        updateType: c.updateType,
        status: "new",
        oldValue: R,
        newValue: q
      };
      if (Fe(f, (F) => {
        const j = [...F ?? [], Q].reduce((O, b) => {
          const T = `${b.stateKey}:${JSON.stringify(b.path)}`, A = O.get(T);
          return A ? (A.timeStamp = Math.max(A.timeStamp, b.timeStamp), A.newValue = b.newValue, A.oldValue = A.oldValue ?? b.oldValue, A.updateType = b.updateType) : O.set(T, { ...b }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(j.values());
      }), pe(
        E,
        f,
        P.current,
        _
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: Q
      }), P.current?.serverSync) {
        const F = r.getState().serverState[f], N = P.current?.serverSync;
        je(f, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  r.getState().updaterState[f] || (ne(
    f,
    re(
      f,
      d,
      L.current,
      _
    )
  ), r.getState().cogsStateStore[f] || H(f, e), r.getState().initialStateGlobal[f] || Se(f, e));
  const n = Ne(() => re(
    f,
    d,
    L.current,
    _
  ), [f, _]);
  return [Ee(f), n];
}
function re(e, i, y, u) {
  const g = /* @__PURE__ */ new Map();
  let $ = 0;
  const p = (S) => {
    const t = S.join(".");
    for (const [m] of g)
      (m === t || m.startsWith(t + ".")) && g.delete(m);
    $++;
  }, v = {
    removeValidation: (S) => {
      S?.validationKey && J(S.validationKey);
    },
    revertToInitialState: (S) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && J(t?.key), S?.validationKey && J(S.validationKey);
      const m = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), g.clear(), $++;
      const U = s(m, []), V = Y(e), _ = B(V?.localStorage?.key) ? V?.localStorage?.key(m) : V?.localStorage?.key, D = `${u}-${e}-${_}`;
      D && localStorage.removeItem(D), ne(e, U), H(e, m);
      const f = r.getState().stateComponents.get(e);
      return f && f.components.forEach((l) => {
        l.forceUpdate();
      }), m;
    },
    updateInitialState: (S) => {
      g.clear(), $++;
      const t = re(
        e,
        i,
        y,
        u
      ), m = r.getState().initialStateGlobal[e], U = Y(e), V = B(U?.localStorage?.key) ? U?.localStorage?.key(m) : U?.localStorage?.key, _ = `${u}-${e}-${V}`;
      return localStorage.getItem(_) && localStorage.removeItem(_), Ae(() => {
        Se(e, S), ne(e, t), H(e, S);
        const D = r.getState().stateComponents.get(e);
        D && D.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (D) => t.get()[D]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const S = r.getState().serverState[e];
      return !!(S && G(S, Ee(e)));
    }
  };
  function s(S, t = [], m) {
    const U = t.map(String).join(".");
    g.get(U);
    const V = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(v).forEach((f) => {
      V[f] = v[f];
    });
    const _ = {
      apply(f, l, X) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(f, l) {
        if (m?.validIndices && !Array.isArray(S) && (m = { ...m, validIndices: void 0 }), !(l === "then" || l[0] === "$" || // Faster than startsWith
        l === "stateMapNoRender")) {
          const d = `${e}////${y}`, n = r.getState().stateComponents.get(e);
          if (n) {
            const o = n.components.get(d);
            if (o && !o.paths.has("")) {
              if (t.length === 0 && l === "get")
                o.paths.add("");
              else if (t.length > 0) {
                const a = t.join(".");
                if (o.paths.size === 0)
                  o.paths.add(a);
                else {
                  let c = !0;
                  for (const I of o.paths) {
                    if (I === a) {
                      c = !1;
                      break;
                    }
                    if (I.length < a.length && a[I.length] === "." && a.substring(0, I.length) === I) {
                      c = !1;
                      break;
                    }
                  }
                  c && o.paths.add(a);
                }
              }
            }
          }
        }
        if (l === "getDifferences")
          return () => fe(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (l === "sync" && t.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(e), n = d?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const c = await n.action(o);
              if (c && !c.success && c.errors && a) {
                r.getState().removeValidationError(a), c.errors.forEach((h) => {
                  const E = [a, ...h.path].join(".");
                  r.getState().addValidationError(E, h.message);
                });
                const I = r.getState().stateComponents.get(e);
                I && I.components.forEach((h) => {
                  h.forceUpdate();
                });
              }
              return c?.success && n.onSuccess ? n.onSuccess(c.data) : !c?.success && n.onError && n.onError(c.error), c;
            } catch (c) {
              return n.onError && n.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(e, t), n = r.getState().initialStateGlobal[e], o = W(n, t);
          return G(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              t
            ), n = r.getState().initialStateGlobal[e], o = W(n, t);
            return G(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[e], n = Y(e), o = B(n?.localStorage?.key) ? n?.localStorage?.key(d) : n?.localStorage?.key, a = `${u}-${e}-${o}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + t.join("."));
          };
        if (Array.isArray(S)) {
          const d = () => m?.validIndices ? S.map((o, a) => ({
            item: o,
            originalIndex: m.validIndices[a]
          })) : r.getState().getNestedState(e, t).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return s(
                  S[n],
                  [...t, n.toString()],
                  m
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: t });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (l === "stateSort")
            return (n) => {
              const a = [...d()].sort(
                (h, E) => n(h.item, E.item)
              ), c = a.map(({ item: h }) => h), I = {
                ...m,
                validIndices: a.map(
                  ({ originalIndex: h }) => h
                )
              };
              return s(c, t, I);
            };
          if (l === "stateFilter")
            return (n) => {
              const a = d().filter(
                ({ item: h }, E) => n(h, E)
              ), c = a.map(({ item: h }) => h), I = {
                ...m,
                validIndices: a.map(
                  ({ originalIndex: h }) => h
                )
              };
              return s(c, t, I);
            };
          if (l === "stateMap" || l === "stateMapNoRender")
            return (n) => S.map((a, c) => {
              let I;
              m?.validIndices && m.validIndices[c] !== void 0 ? I = m.validIndices[c] : I = c;
              const h = [...t, I.toString()], E = s(a, h, m);
              return n(
                a,
                E,
                c,
                S,
                s(S, t, m)
              );
            });
          if (l === "$stateMap")
            return (n) => ae(Ge, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateFlattenOn")
            return (n) => {
              const o = S;
              g.clear(), $++;
              const a = o.flatMap(
                (c) => c[n] ?? []
              );
              return s(
                a,
                [...t, "[*]", n],
                m
              );
            };
          if (l === "index")
            return (n) => {
              const o = S[n];
              return s(o, [...t, n.toString()]);
            };
          if (l === "last")
            return () => {
              const n = r.getState().getNestedState(e, t);
              if (n.length === 0) return;
              const o = n.length - 1, a = n[o], c = [...t, o.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (n) => (p(t), ce(i, n, t, e), s(
              r.getState().getNestedState(e, t),
              t
            ));
          if (l === "uniqueInsert")
            return (n, o, a) => {
              const c = r.getState().getNestedState(e, t), I = B(n) ? n(c) : n;
              let h = null;
              if (!c.some((w) => {
                if (o) {
                  const x = o.every(
                    (C) => G(w[C], I[C])
                  );
                  return x && (h = w), x;
                }
                const k = G(w, I);
                return k && (h = w), k;
              }))
                p(t), ce(i, I, t, e);
              else if (a && h) {
                const w = a(h), k = c.map(
                  (x) => G(x, h) ? w : x
                );
                p(t), K(i, k, t);
              }
            };
          if (l === "cut")
            return (n, o) => {
              if (!o?.waitForSync)
                return p(t), ee(i, t, e, n), s(
                  r.getState().getNestedState(e, t),
                  t
                );
            };
          if (l === "cutByValue")
            return (n) => {
              for (let o = 0; o < S.length; o++)
                S[o] === n && ee(i, t, e, o);
            };
          if (l === "toggleByValue")
            return (n) => {
              const o = S.findIndex((a) => a === n);
              o > -1 ? ee(i, t, e, o) : ce(i, n, t, e);
            };
          if (l === "stateFind")
            return (n) => {
              const a = d().find(
                ({ item: I }, h) => n(I, h)
              );
              if (!a) return;
              const c = [...t, a.originalIndex.toString()];
              return s(a.item, c, m);
            };
          if (l === "findWith")
            return (n, o) => {
              const c = d().find(
                ({ item: h }) => h[n] === o
              );
              if (!c) return;
              const I = [...t, c.originalIndex.toString()];
              return s(c.item, I, m);
            };
        }
        const X = t[t.length - 1];
        if (!isNaN(Number(X))) {
          const d = t.slice(0, -1), n = r.getState().getNestedState(e, d);
          if (Array.isArray(n) && l === "cut")
            return () => ee(
              i,
              d,
              e,
              Number(X)
            );
        }
        if (l === "get")
          return () => r.getState().getNestedState(e, t);
        if (l === "$derive")
          return (d) => le({
            _stateKey: e,
            _path: t,
            _effect: d.toString()
          });
        if (l === "$derive")
          return (d) => le({
            _stateKey: e,
            _path: t,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => le({
            _stateKey: e,
            _path: t
          });
        if (l === "lastSynced") {
          const d = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => oe(u + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = t.slice(0, -1), n = d.join("."), o = r.getState().getNestedState(e, d);
          return Array.isArray(o) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, n) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const n = t.slice(0, -1), o = Number(t[t.length - 1]), a = n.join(".");
            d ? r.getState().setSelectedIndex(e, a, o) : r.getState().setSelectedIndex(e, a, void 0);
            const c = r.getState().getNestedState(e, [...n]);
            K(i, c, n), p(n);
          };
        if (l === "toggleSelected")
          return () => {
            const d = t.slice(0, -1), n = Number(t[t.length - 1]), o = d.join("."), a = r.getState().getSelectedIndex(e, o);
            r.getState().setSelectedIndex(
              e,
              o,
              a === n ? void 0 : n
            );
            const c = r.getState().getNestedState(e, [...d]);
            K(i, c, d), p(d);
          };
        if (t.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const n = r.getState().cogsStateStore[e], a = Ce(n, d).newDocument;
              ke(
                e,
                r.getState().initialStateGlobal[e],
                a,
                i,
                y,
                u
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const I = fe(n, a), h = new Set(I);
                for (const [
                  E,
                  w
                ] of c.components.entries()) {
                  let k = !1;
                  const x = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (w.paths.has("") && (k = !0), !k))
                      for (const C of h) {
                        if (w.paths.has(C)) {
                          k = !0;
                          break;
                        }
                        let R = C.lastIndexOf(".");
                        for (; R !== -1; ) {
                          const q = C.substring(0, R);
                          if (w.paths.has(q)) {
                            k = !0;
                            break;
                          }
                          const Q = C.substring(
                            R + 1
                          );
                          if (!isNaN(Number(Q))) {
                            const F = q.lastIndexOf(".");
                            if (F !== -1) {
                              const N = q.substring(
                                0,
                                F
                              );
                              if (w.paths.has(N)) {
                                k = !0;
                                break;
                              }
                            }
                          }
                          R = q.lastIndexOf(".");
                        }
                        if (k) break;
                      }
                    if (!k && x.includes("deps") && w.depsFunction) {
                      const C = w.depsFunction(a);
                      let R = !1;
                      typeof C == "boolean" ? C && (R = !0) : G(w.deps, C) || (w.deps = C, R = !0), R && (k = !0);
                    }
                    k && w.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = r.getState().getInitialOptions(e)?.validation, n = r.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              J(d.key);
              const o = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([I]) => {
                  I && I.startsWith(d.key) && J(I);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((h) => {
                  const E = h.path, w = h.message, k = [d.key, ...E].join(".");
                  n(k, w);
                }), ie(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return y;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => ve.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return r.getState().serverState[e];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return v.revertToInitialState;
          if (l === "updateInitialState") return v.updateInitialState;
          if (l === "removeValidation") return v.removeValidation;
        }
        if (l === "getFormRef")
          return () => ve.getState().getFormRef(e + "." + t.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: n
          }) => /* @__PURE__ */ ye(
            _e,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: m?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return t;
        if (l === "_isServerSynced") return v._isServerSynced;
        if (l === "update")
          return (d, n) => {
            if (n?.debounce)
              Ve(() => {
                K(i, d, t, "");
                const o = r.getState().getNestedState(e, t);
                n?.afterUpdate && n.afterUpdate(o);
              }, n.debounce);
            else {
              K(i, d, t, "");
              const o = r.getState().getNestedState(e, t);
              n?.afterUpdate && n.afterUpdate(o);
            }
            p(t);
          };
        if (l === "formElement")
          return (d, n) => /* @__PURE__ */ ye(
            Pe,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: d,
              formOpts: n
            }
          );
        const L = [...t, l], P = r.getState().getNestedState(e, L);
        return s(P, L, m);
      }
    }, D = new Proxy(V, _);
    return g.set(U, {
      proxy: D,
      stateVersion: $
    }), D;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function le(e) {
  return ae(We, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: i
}) {
  const y = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(y) ? i(
    y,
    e._path
  ).stateMapNoRender(
    (g, $, p, v, s) => e._mapFn(g, $, p, v, s)
  ) : null;
}
function We({
  proxy: e
}) {
  const i = te(null), y = `${e._stateKey}-${e._path.join(".")}`;
  return ue(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const g = u.parentElement, p = Array.from(g.childNodes).indexOf(u);
    let v = g.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", v));
    const S = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: p,
      effect: e._effect
    };
    r.getState().addSignalElement(y, S);
    const t = r.getState().getNestedState(e._stateKey, e._path);
    let m;
    if (e._effect)
      try {
        m = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), m = t;
      }
    else
      m = t;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const U = document.createTextNode(String(m));
    u.replaceWith(U);
  }, [e._stateKey, e._path.join("."), e._effect]), ae("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function nt(e) {
  const i = Te(
    (y) => {
      const u = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: y,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return ae("text", {}, String(i));
}
export {
  le as $cogsSignal,
  nt as $cogsSignalStore,
  Ke as addStateOptions,
  et as createCogsState,
  tt as notifyComponent,
  Me as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
