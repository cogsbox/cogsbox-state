"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as le, useRef as te, useEffect as de, useLayoutEffect as Ae, useMemo as $e, createElement as ae, useSyncExternalStore as ke, startTransition as Ne } from "react";
import { transformStateFunc as Ve, isDeepEqual as G, isFunction as J, getNestedValue as L, getDifferences as he, debounce as pe } from "./utility.js";
import { pushFunc as ee, updateFn as W, cutFunc as Y, ValidationWrapper as Te, FormControlComponent as Pe } from "./Functions.jsx";
import _e from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as t, formRefStore as me } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
function ye(e, o) {
  const I = t.getState().getInitialOptions, u = t.getState().setInitialStateOptions, m = I(e) || {};
  u(e, {
    ...m,
    ...o
  });
}
function Ie({
  stateKey: e,
  options: o,
  initialOptionsPart: I
}) {
  const u = X(e) || {}, m = I[e] || {}, k = t.getState().setInitialStateOptions, w = { ...m, ...u };
  let v = !1;
  if (o)
    for (const s in o)
      w.hasOwnProperty(s) ? (s == "localStorage" && o[s] && w[s].key !== o[s]?.key && (v = !0, w[s] = o[s]), s == "initialState" && o[s] && w[s] !== o[s] && // Different references
      !G(w[s], o[s]) && (v = !0, w[s] = o[s])) : (v = !0, w[s] = o[s]);
  v && k(e, w);
}
function Ye(e, { formElements: o, validation: I }) {
  return { initialState: e, formElements: o, validation: I };
}
const Xe = (e, o) => {
  let I = e;
  const [u, m] = Ve(I);
  (Object.keys(m).length > 0 || o && Object.keys(o).length > 0) && Object.keys(m).forEach((v) => {
    m[v] = m[v] || {}, m[v].formElements = {
      ...o?.formElements,
      // Global defaults first
      ...o?.validation,
      ...m[v].formElements || {}
      // State-specific overrides
    }, X(v) || t.getState().setInitialStateOptions(v, m[v]);
  }), t.getState().setInitialStates(u), t.getState().setCreatedState(u);
  const k = (v, s) => {
    const [y] = le(s?.componentId ?? ue());
    Ie({
      stateKey: v,
      options: s,
      initialOptionsPart: m
    });
    const n = t.getState().cogsStateStore[v] || u[v], h = s?.modifyState ? s.modifyState(n) : n, [M, P] = Me(
      h,
      {
        stateKey: v,
        syncUpdate: s?.syncUpdate,
        componentId: y,
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
    return P;
  };
  function w(v, s) {
    Ie({ stateKey: v, options: s, initialOptionsPart: m }), s.localStorage && Fe(v, s), ie(v);
  }
  return { useCogsState: k, setCogsOptions: w };
}, {
  setUpdaterState: ne,
  setState: Z,
  getInitialOptions: X,
  getKeyState: Ee,
  getValidationErrors: be,
  setStateLog: xe,
  updateInitialStateGlobal: ge,
  addValidationError: Ce,
  removeValidationError: z,
  setServerSyncActions: Oe
} = t.getState(), ve = (e, o, I, u, m) => {
  I?.log && console.log(
    "saving to localstorage",
    o,
    I.localStorage?.key,
    u
  );
  const k = J(I?.localStorage?.key) ? I.localStorage?.key(e) : I?.localStorage?.key;
  if (k && u) {
    const w = `${u}-${o}-${k}`;
    let v;
    try {
      v = oe(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: m ?? v
    }, y = _e.serialize(s);
    window.localStorage.setItem(
      w,
      JSON.stringify(y.json)
    );
  }
}, oe = (e) => {
  if (!e) return null;
  try {
    const o = window.localStorage.getItem(e);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, Fe = (e, o) => {
  const I = t.getState().cogsStateStore[e], { sessionId: u } = we(), m = J(o?.localStorage?.key) ? o.localStorage.key(I) : o?.localStorage?.key;
  if (m && u) {
    const k = oe(
      `${u}-${e}-${m}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return Z(e, k.state), ie(e), !0;
  }
  return !1;
}, je = (e, o, I, u, m, k) => {
  const w = {
    initialState: o,
    updaterState: re(
      e,
      u,
      m,
      k
    ),
    state: I
  };
  ge(e, w.initialState), ne(e, w.updaterState), Z(e, w.state);
}, ie = (e) => {
  const o = t.getState().stateComponents.get(e);
  if (!o) return;
  const I = /* @__PURE__ */ new Set();
  o.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || I.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    I.forEach((u) => u());
  });
}, Qe = (e, o) => {
  const I = t.getState().stateComponents.get(e);
  if (I) {
    const u = `${e}////${o}`, m = I.components.get(u);
    if ((m ? Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"] : null)?.includes("none"))
      return;
    m && m.forceUpdate();
  }
}, Re = (e, o, I, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: L(o, u),
        newValue: L(I, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: L(I, u)
      };
    case "cut":
      return {
        oldValue: L(o, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Me(e, {
  stateKey: o,
  serverSync: I,
  localStorage: u,
  formElements: m,
  reactiveDeps: k,
  reactiveType: w,
  componentId: v,
  initialState: s,
  syncUpdate: y,
  dependencies: n,
  serverState: h
} = {}) {
  const [M, P] = le({}), { sessionId: _ } = we();
  let U = !o;
  const [f] = le(o ?? ue()), l = t.getState().stateLog[f], Q = te(/* @__PURE__ */ new Set()), q = te(v ?? ue()), b = te(
    null
  );
  b.current = X(f) ?? null, de(() => {
    if (y && y.stateKey === f && y.path?.[0]) {
      Z(f, (a) => ({
        ...a,
        [y.path[0]]: y.newValue
      }));
      const i = `${y.stateKey}:${y.path.join(".")}`;
      t.getState().setSyncInfo(i, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), de(() => {
    if (s) {
      ye(f, {
        initialState: s
      });
      const i = b.current, c = i?.serverState?.id !== void 0 && i?.serverState?.status === "success" && i?.serverState?.data, S = t.getState().initialStateGlobal[f];
      if (!(S && !G(S, s) || !S) && !c)
        return;
      let E = null;
      const T = J(i?.localStorage?.key) ? i?.localStorage?.key(s) : i?.localStorage?.key;
      T && _ && (E = oe(`${_}-${f}-${T}`));
      let V = s, j = !1;
      const D = c ? Date.now() : 0, B = E?.lastUpdated || 0, H = E?.lastSyncedWithServer || 0;
      c && D > B ? (V = i.serverState.data, j = !0) : E && B > H && (V = E.state, i?.localStorage?.onChange && i?.localStorage?.onChange(V)), je(
        f,
        s,
        V,
        d,
        q.current,
        _
      ), j && T && _ && ve(V, f, i, _, Date.now()), ie(f), (Array.isArray(w) ? w : [w || "component"]).includes("none") || P({});
    }
  }, [
    s,
    h?.status,
    h?.data,
    ...n || []
  ]), Ae(() => {
    U && ye(f, {
      serverSync: I,
      formElements: m,
      initialState: s,
      localStorage: u,
      middleware: b.current?.middleware
    });
    const i = `${f}////${q.current}`, a = t.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(i, {
      forceUpdate: () => P({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), t.getState().stateComponents.set(f, a), P({}), () => {
      const c = `${f}////${q.current}`;
      a && (a.components.delete(c), a.components.size === 0 && t.getState().stateComponents.delete(f));
    };
  }, []);
  const d = (i, a, c, S) => {
    if (Array.isArray(a)) {
      const g = `${f}-${a.join(".")}`;
      Q.current.add(g);
    }
    Z(f, (g) => {
      const E = J(i) ? i(g) : i, T = `${f}-${a.join(".")}`;
      if (T) {
        let C = !1, N = t.getState().signalDomElements.get(T);
        if ((!N || N.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const O = a.slice(0, -1), F = L(E, O);
          if (Array.isArray(F)) {
            C = !0;
            const A = `${f}-${O.join(".")}`;
            N = t.getState().signalDomElements.get(A);
          }
        }
        if (N) {
          const O = C ? L(E, a.slice(0, -1)) : L(E, a);
          N.forEach(({ parentId: F, position: A, effect: x }) => {
            const $ = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if ($) {
              const R = Array.from($.childNodes);
              if (R[A]) {
                const p = x ? new Function("state", `return (${x})(state)`)(O) : O;
                R[A].textContent = String(p);
              }
            }
          });
        }
      }
      c.updateType === "update" && (S || b.current?.validation?.key) && a && z(
        (S || b.current?.validation?.key) + "." + a.join(".")
      );
      const V = a.slice(0, a.length - 1);
      c.updateType === "cut" && b.current?.validation?.key && z(
        b.current?.validation?.key + "." + V.join(".")
      ), c.updateType === "insert" && b.current?.validation?.key && be(
        b.current?.validation?.key + "." + V.join(".")
      ).filter(([N, O]) => {
        let F = N?.split(".").length;
        if (N == V.join(".") && F == V.length - 1) {
          let A = N + "." + V;
          z(N), Ce(A, O);
        }
      });
      const j = t.getState().stateComponents.get(f);
      if (j) {
        const C = he(g, E), N = new Set(C), O = c.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          F,
          A
        ] of j.components.entries()) {
          let x = !1;
          const $ = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (!$.includes("none")) {
            if ($.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if ($.includes("component") && ((A.paths.has(O) || A.paths.has("")) && (x = !0), !x))
              for (const R of N) {
                let p = R;
                for (; ; ) {
                  if (A.paths.has(p)) {
                    x = !0;
                    break;
                  }
                  const se = p.lastIndexOf(".");
                  if (se !== -1) {
                    const fe = p.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(p.substring(se + 1))
                    ) && A.paths.has(fe)) {
                      x = !0;
                      break;
                    }
                    p = fe;
                  } else
                    p = "";
                  if (p === "")
                    break;
                }
                if (x) break;
              }
            if (!x && $.includes("deps") && A.depsFunction) {
              const R = A.depsFunction(E);
              let p = !1;
              typeof R == "boolean" ? R && (p = !0) : G(A.deps, R) || (A.deps = R, p = !0), p && (x = !0);
            }
            x && A.forceUpdate();
          }
        }
      }
      const D = Date.now();
      a = a.map((C, N) => {
        const O = a.slice(0, -1), F = L(E, O);
        return N === a.length - 1 && ["insert", "cut"].includes(c.updateType) ? (F.length - 1).toString() : C;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        c.updateType,
        g,
        E,
        a
      );
      const { oldValue: B, newValue: H } = Re(
        c.updateType,
        g,
        E,
        a
      ), K = {
        timeStamp: D,
        stateKey: f,
        path: a,
        updateType: c.updateType,
        status: "new",
        oldValue: B,
        newValue: H
      };
      if (xe(f, (C) => {
        const O = [...C ?? [], K].reduce((F, A) => {
          const x = `${A.stateKey}:${JSON.stringify(A.path)}`, $ = F.get(x);
          return $ ? ($.timeStamp = Math.max($.timeStamp, A.timeStamp), $.newValue = A.newValue, $.oldValue = $.oldValue ?? A.oldValue, $.updateType = A.updateType) : F.set(x, { ...A }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), ve(
        E,
        f,
        b.current,
        _
      ), b.current?.middleware && b.current.middleware({
        updateLog: l,
        update: K
      }), b.current?.serverSync) {
        const C = t.getState().serverState[f], N = b.current?.serverSync;
        Oe(f, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: C,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  t.getState().updaterState[f] || (ne(
    f,
    re(
      f,
      d,
      q.current,
      _
    )
  ), t.getState().cogsStateStore[f] || Z(f, e), t.getState().initialStateGlobal[f] || ge(f, e));
  const r = $e(() => re(
    f,
    d,
    q.current,
    _
  ), [f]);
  return [Ee(f), r];
}
function re(e, o, I, u) {
  const m = /* @__PURE__ */ new Map();
  let k = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [h] of m)
      (h === n || h.startsWith(n + ".")) && m.delete(h);
    k++;
  }, v = {
    removeValidation: (y) => {
      y?.validationKey && z(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = t.getState().getInitialOptions(e)?.validation;
      n?.key && z(n?.key), y?.validationKey && z(y.validationKey);
      const h = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), m.clear(), k++;
      const M = s(h, []), P = X(e), _ = J(P?.localStorage?.key) ? P?.localStorage?.key(h) : P?.localStorage?.key, U = `${u}-${e}-${_}`;
      U && localStorage.removeItem(U), ne(e, M), Z(e, h);
      const f = t.getState().stateComponents.get(e);
      return f && f.components.forEach((l) => {
        l.forceUpdate();
      }), h;
    },
    updateInitialState: (y) => {
      m.clear(), k++;
      const n = re(
        e,
        o,
        I,
        u
      ), h = t.getState().initialStateGlobal[e], M = X(e), P = J(M?.localStorage?.key) ? M?.localStorage?.key(h) : M?.localStorage?.key, _ = `${u}-${e}-${P}`;
      return console.log("removing storage", _), localStorage.getItem(_) && localStorage.removeItem(_), Ne(() => {
        ge(e, y), ne(e, n), Z(e, y);
        const U = t.getState().stateComponents.get(e);
        U && U.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (U) => n.get()[U]
      };
    },
    _initialState: t.getState().initialStateGlobal[e],
    _serverState: t.getState().serverState[e],
    _isLoading: t.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const y = t.getState().serverState[e];
      return !!(y && G(y, Ee(e)));
    }
  };
  function s(y, n = [], h) {
    const M = n.map(String).join(".");
    m.get(M);
    const P = function() {
      return t().getNestedState(e, n);
    };
    Object.keys(v).forEach((f) => {
      P[f] = v[f];
    });
    const _ = {
      apply(f, l, Q) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), t().getNestedState(e, n);
      },
      get(f, l) {
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender") {
          const d = n.join("."), r = `${e}////${I}`, i = t.getState().stateComponents.get(e);
          if (i) {
            const a = i.components.get(r);
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
            const i = t.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const c = await r.action(i);
              if (c && !c.success && c.errors && a) {
                t.getState().removeValidationError(a), c.errors.forEach((g) => {
                  const E = [a, ...g.path].join(".");
                  t.getState().addValidationError(E, g.message);
                });
                const S = t.getState().stateComponents.get(e);
                S && S.components.forEach((g) => {
                  g.forceUpdate();
                });
              }
              return c?.success && r.onSuccess ? r.onSuccess(c.data) : !c?.success && r.onError && r.onError(c.error), c;
            } catch (c) {
              return r.onError && r.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = t.getState().getNestedState(e, n), r = t.getState().initialStateGlobal[e], i = L(r, n);
          return G(d, i) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = t().getNestedState(
              e,
              n
            ), r = t.getState().initialStateGlobal[e], i = L(r, n);
            return G(d, i) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = t.getState().initialStateGlobal[e], r = X(e), i = J(r?.localStorage?.key) ? r?.localStorage?.key(d) : r?.localStorage?.key, a = `${u}-${e}-${i}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = t.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return t.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(y)) {
          const d = () => h?.validIndices ? y.map((i, a) => ({
            item: i,
            originalIndex: h.validIndices[a]
          })) : t.getState().getNestedState(e, n).map((i, a) => ({
            item: i,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const r = t.getState().getSelectedIndex(e, n.join("."));
              if (r !== void 0)
                return s(
                  y[r],
                  [...n, r.toString()],
                  h
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
                (g, E) => r(g.item, E.item)
              ), c = a.map(({ item: g }) => g), S = {
                ...h,
                validIndices: a.map(
                  ({ originalIndex: g }) => g
                )
              };
              return s(c, n, S);
            };
          if (l === "stateFilter")
            return (r) => {
              const a = d().filter(
                ({ item: g }, E) => r(g, E)
              ), c = a.map(({ item: g }) => g), S = {
                ...h,
                validIndices: a.map(
                  ({ originalIndex: g }) => g
                )
              };
              return s(c, n, S);
            };
          if (l === "stateMap" || l === "stateMapNoRender")
            return (r) => y.map((a, c) => {
              let S;
              h?.validIndices && h.validIndices[c] !== void 0 ? S = h.validIndices[c] : S = c;
              const g = [...n, S.toString()], E = s(a, g, h);
              return r(
                a,
                E,
                c,
                y,
                s(y, n, h)
              );
            });
          if (l === "$stateMap")
            return (r) => ae(Ue, {
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
              const i = y;
              m.clear(), k++;
              const a = i.flatMap(
                (c) => c[r] ?? []
              );
              return s(
                a,
                [...n, "[*]", r],
                h
              );
            };
          if (l === "index")
            return (r) => {
              const i = y[r];
              return s(i, [...n, r.toString()]);
            };
          if (l === "last")
            return () => {
              const r = t.getState().getNestedState(e, n);
              if (r.length === 0) return;
              const i = r.length - 1, a = r[i], c = [...n, i.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (r) => (w(n), ee(o, r, n, e), s(
              t.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (r, i, a) => {
              const c = t.getState().getNestedState(e, n), S = J(r) ? r(c) : r;
              let g = null;
              if (!c.some((T) => {
                if (i) {
                  const j = i.every(
                    (D) => G(T[D], S[D])
                  );
                  return j && (g = T), j;
                }
                const V = G(T, S);
                return V && (g = T), V;
              }))
                w(n), ee(o, S, n, e);
              else if (a && g) {
                const T = a(g), V = c.map(
                  (j) => G(j, g) ? T : j
                );
                w(n), W(o, V, n);
              }
            };
          if (l === "cut")
            return (r, i) => {
              if (!i?.waitForSync)
                return w(n), Y(o, n, e, r), s(
                  t.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (r) => {
              for (let i = 0; i < y.length; i++)
                y[i] === r && Y(o, n, e, i);
            };
          if (l === "toggleByValue")
            return (r) => {
              const i = y.findIndex((a) => a === r);
              i > -1 ? Y(o, n, e, i) : ee(o, r, n, e);
            };
          if (l === "stateFind")
            return (r) => {
              const a = d().find(
                ({ item: S }, g) => r(S, g)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return s(a.item, c, h);
            };
          if (l === "findWith")
            return (r, i) => {
              const c = d().find(
                ({ item: g }) => g[r] === i
              );
              if (!c) return;
              const S = [...n, c.originalIndex.toString()];
              return s(c.item, S, h);
            };
        }
        const Q = n[n.length - 1];
        if (!isNaN(Number(Q))) {
          const d = n.slice(0, -1), r = t.getState().getNestedState(e, d);
          if (Array.isArray(r) && l === "cut")
            return () => Y(
              o,
              d,
              e,
              Number(Q)
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
          return (d) => oe(u + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), r = d.join("."), i = t.getState().getNestedState(e, d);
          return Array.isArray(i) ? Number(n[n.length - 1]) === t.getState().getSelectedIndex(e, r) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const r = n.slice(0, -1), i = Number(n[n.length - 1]), a = r.join(".");
            d ? t.getState().setSelectedIndex(e, a, i) : t.getState().setSelectedIndex(e, a, void 0);
            const c = t.getState().getNestedState(e, [...r]);
            W(o, c, r), w(r);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), r = Number(n[n.length - 1]), i = d.join("."), a = t.getState().getSelectedIndex(e, i);
            t.getState().setSelectedIndex(
              e,
              i,
              a === r ? void 0 : r
            );
            const c = t.getState().getNestedState(e, [...d]);
            W(o, c, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              d.forEach((r) => {
                const { op: i, path: a, value: c } = r, S = a.slice(1).split("/").map((g) => /^\d+$/.test(g) ? g : g.replace(/~1/g, "/").replace(/~0/g, "~"));
                switch (i) {
                  case "add":
                    const g = S.slice(0, -1), E = t.getState().getNestedState(e, g);
                    if (Array.isArray(E)) {
                      const $ = S[S.length - 1];
                      if ($ === "-" || parseInt($) === E.length)
                        ee(
                          o,
                          c,
                          g,
                          e
                        );
                      else {
                        const R = parseInt($), p = [...E];
                        p.splice(R, 0, c), W(
                          o,
                          p,
                          g
                        );
                      }
                    } else
                      W(o, c, S);
                    break;
                  case "replace":
                    W(o, c, S);
                    break;
                  case "remove":
                    const T = S.slice(0, -1), V = t.getState().getNestedState(e, T);
                    if (Array.isArray(V)) {
                      const $ = parseInt(
                        S[S.length - 1]
                      );
                      Y(
                        o,
                        T,
                        e,
                        $
                      );
                    } else
                      W(o, void 0, S);
                    break;
                  case "move":
                    const { from: j } = r, D = j.slice(1).split("/"), B = t.getState().getNestedState(e, D), H = D.slice(0, -1), K = t.getState().getNestedState(e, H);
                    if (Array.isArray(K)) {
                      const $ = parseInt(
                        D[D.length - 1]
                      );
                      Y(
                        o,
                        H,
                        e,
                        $
                      );
                    }
                    const C = S.slice(0, -1), N = t.getState().getNestedState(e, C);
                    if (Array.isArray(N)) {
                      const $ = S[S.length - 1];
                      if ($ === "-")
                        ee(
                          o,
                          B,
                          C,
                          e
                        );
                      else {
                        const R = parseInt($), p = [...N];
                        p.splice(R, 0, B), W(
                          o,
                          p,
                          C
                        );
                      }
                    }
                    break;
                  case "copy":
                    const { from: O } = r, F = O.slice(1).split("/"), A = t.getState().getNestedState(e, F);
                    W(o, A, S);
                    break;
                  case "test":
                    const x = t.getState().getNestedState(e, S);
                    if (!G(x, c))
                      throw new Error(
                        `Test operation failed at path ${a}`
                      );
                    break;
                }
              });
            };
          if (l === "validateZodSchema")
            return () => {
              const d = t.getState().getInitialOptions(e)?.validation, r = t.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              z(d.key);
              const i = t.getState().cogsStateStore[e];
              try {
                const a = t.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([S]) => {
                  S && S.startsWith(d.key) && z(S);
                });
                const c = d.zodSchema.safeParse(i);
                return c.success ? !0 : (c.error.errors.forEach((g) => {
                  const E = g.path, T = g.message, V = [d.key, ...E].join(".");
                  r(V, T);
                }), ie(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return I;
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
            Te,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: t.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: h?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return v._isServerSynced;
        if (l === "update")
          return (d, r) => {
            if (r?.debounce)
              pe(() => {
                W(o, d, n, "");
                const i = t.getState().getNestedState(e, n);
                r?.afterUpdate && r.afterUpdate(i);
              }, r.debounce);
            else {
              W(o, d, n, "");
              const i = t.getState().getNestedState(e, n);
              r?.afterUpdate && r.afterUpdate(i);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, r) => /* @__PURE__ */ Se(
            Pe,
            {
              setState: o,
              stateKey: e,
              path: n,
              child: d,
              formOpts: r
            }
          );
        const q = [...n, l], b = t.getState().getNestedState(e, q);
        return s(b, q, h);
      }
    }, U = new Proxy(P, _);
    return m.set(M, {
      proxy: U,
      stateVersion: k
    }), U;
  }
  return s(
    t.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return ae(De, { proxy: e });
}
function Ue({
  proxy: e,
  rebuildStateShape: o
}) {
  const I = t().getNestedState(e._stateKey, e._path);
  return Array.isArray(I) ? o(
    I,
    e._path
  ).stateMapNoRender(
    (m, k, w, v, s) => e._mapFn(m, k, w, v, s)
  ) : null;
}
function De({
  proxy: e
}) {
  const o = te(null), I = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = o.current;
    if (!u || !u.parentElement) return;
    const m = u.parentElement, w = Array.from(m.childNodes).indexOf(u);
    let v = m.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, m.setAttribute("data-parent-id", v));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: w,
      effect: e._effect
    };
    t.getState().addSignalElement(I, y);
    const n = t.getState().getNestedState(e._stateKey, e._path);
    let h;
    if (e._effect)
      try {
        h = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (P) {
        console.error("Error evaluating effect function during mount:", P), h = n;
      }
    else
      h = n;
    h !== null && typeof h == "object" && (h = JSON.stringify(h));
    const M = document.createTextNode(String(h));
    u.replaceWith(M);
  }, [e._stateKey, e._path.join("."), e._effect]), ae("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": I
  });
}
function Ke(e) {
  const o = ke(
    (I) => {
      const u = t.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: I,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => t.getState().getNestedState(e._stateKey, e._path)
  );
  return ae("text", {}, String(o));
}
export {
  ce as $cogsSignal,
  Ke as $cogsSignalStore,
  Ye as addStateOptions,
  Xe as createCogsState,
  Qe as notifyComponent,
  Me as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
