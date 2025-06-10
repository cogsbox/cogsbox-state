"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as le, useRef as X, useEffect as de, useLayoutEffect as $e, useMemo as Ne, createElement as ee, useSyncExternalStore as he, startTransition as ke } from "react";
import { transformStateFunc as Ve, isDeepEqual as G, isFunction as q, getNestedValue as D, getDifferences as we, debounce as Ae } from "./utility.js";
import { pushFunc as se, updateFn as Z, cutFunc as Y, ValidationWrapper as xe, FormControlComponent as Te } from "./Functions.jsx";
import Ce from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as me } from "./store.js";
import { useCogsConfig as Ee } from "./CogsStateClient.jsx";
function ye(e, s) {
  const m = r.getState().getInitialOptions, u = r.getState().setInitialStateOptions, g = m(e) || {};
  u(e, {
    ...g,
    ...s
  });
}
function ve({
  stateKey: e,
  options: s,
  initialOptionsPart: m
}) {
  const u = B(e) || {}, g = m[e] || {}, w = r.getState().setInitialStateOptions, I = { ...g, ...u };
  let y = !1;
  if (s)
    for (const i in s)
      I.hasOwnProperty(i) ? (i == "localStorage" && s[i] && I[i].key !== s[i]?.key && (y = !0, I[i] = s[i]), i == "initialState" && s[i] && I[i] !== s[i] && // Different references
      !G(I[i], s[i]) && (y = !0, I[i] = s[i])) : (y = !0, I[i] = s[i]);
  y && w(e, I);
}
function Ye(e, { formElements: s, validation: m }) {
  return { initialState: e, formElements: s, validation: m };
}
const Xe = (e, s) => {
  let m = e;
  const [u, g] = Ve(m);
  (Object.keys(g).length > 0 || s && Object.keys(s).length > 0) && Object.keys(g).forEach((y) => {
    g[y] = g[y] || {}, g[y].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...g[y].formElements || {}
      // State-specific overrides
    }, B(y) || r.getState().setInitialStateOptions(y, g[y]);
  }), r.getState().setInitialStates(u), r.getState().setCreatedState(u);
  const w = (y, i) => {
    const [S] = le(i?.componentId ?? ue());
    ve({
      stateKey: y,
      options: i,
      initialOptionsPart: g
    });
    const t = r.getState().cogsStateStore[y] || u[y], v = i?.modifyState ? i.modifyState(t) : t, [F, V] = De(
      v,
      {
        stateKey: y,
        syncUpdate: i?.syncUpdate,
        componentId: S,
        localStorage: i?.localStorage,
        middleware: i?.middleware,
        enabledSync: i?.enabledSync,
        reactiveType: i?.reactiveType,
        reactiveDeps: i?.reactiveDeps,
        initialState: i?.initialState,
        dependencies: i?.dependencies,
        serverState: i?.serverState
      }
    );
    return V;
  };
  function I(y, i) {
    ve({ stateKey: y, options: i, initialOptionsPart: g }), i.localStorage && Oe(y, i), ne(y);
  }
  return { useCogsState: w, setCogsOptions: I };
}, {
  setUpdaterState: Q,
  setState: z,
  getInitialOptions: B,
  getKeyState: _e,
  getValidationErrors: be,
  setStateLog: Pe,
  updateInitialStateGlobal: ge,
  addValidationError: je,
  removeValidationError: W,
  setServerSyncActions: Fe
} = r.getState(), Ie = (e, s, m, u, g) => {
  m?.log && console.log(
    "saving to localstorage",
    s,
    m.localStorage?.key,
    u
  );
  const w = q(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (w && u) {
    const I = `${u}-${s}-${w}`;
    let y;
    try {
      y = te(I)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: g ?? y
    }, S = Ce.serialize(i);
    window.localStorage.setItem(
      I,
      JSON.stringify(S.json)
    );
  }
}, te = (e) => {
  if (!e) return null;
  try {
    const s = window.localStorage.getItem(e);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Oe = (e, s) => {
  const m = r.getState().cogsStateStore[e], { sessionId: u } = Ee(), g = q(s?.localStorage?.key) ? s.localStorage.key(m) : s?.localStorage?.key;
  if (g && u) {
    const w = te(
      `${u}-${e}-${g}`
    );
    if (w && w.lastUpdated > (w.lastSyncedWithServer || 0))
      return z(e, w.state), ne(e), !0;
  }
  return !1;
}, Re = (e, s, m, u, g, w) => {
  const I = {
    initialState: s,
    updaterState: K(
      e,
      u,
      g,
      w
    ),
    state: m
  };
  ge(e, I.initialState), Q(e, I.updaterState), z(e, I.state);
}, ne = (e) => {
  const s = r.getState().stateComponents.get(e);
  if (!s) return;
  const m = /* @__PURE__ */ new Set();
  s.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || m.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((u) => u());
  });
}, Qe = (e, s) => {
  const m = r.getState().stateComponents.get(e);
  if (m) {
    const u = `${e}////${s}`, g = m.components.get(u);
    if ((g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none"))
      return;
    g && g.forceUpdate();
  }
}, Ue = (e, s, m, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: D(s, u),
        newValue: D(m, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: D(m, u)
      };
    case "cut":
      return {
        oldValue: D(s, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function De(e, {
  stateKey: s,
  serverSync: m,
  localStorage: u,
  formElements: g,
  reactiveDeps: w,
  reactiveType: I,
  componentId: y,
  initialState: i,
  syncUpdate: S,
  dependencies: t,
  serverState: v
} = {}) {
  const [F, V] = le({}), { sessionId: A } = Ee();
  let O = !s;
  const [f] = le(s ?? ue()), l = r.getState().stateLog[f], J = X(/* @__PURE__ */ new Set()), p = X(y ?? ue()), x = X(
    null
  );
  x.current = B(f) ?? null, de(() => {
    if (S && S.stateKey === f && S.path?.[0]) {
      z(f, (a) => ({
        ...a,
        [S.path[0]]: S.newValue
      }));
      const c = `${S.stateKey}:${S.path.join(".")}`;
      r.getState().setSyncInfo(c, {
        timeStamp: S.timeStamp,
        userId: S.userId
      });
    }
  }, [S]), de(() => {
    if (i) {
      ye(f, {
        initialState: i
      });
      const c = x.current, d = c?.serverState?.id !== void 0 && c?.serverState?.status === "success" && c?.serverState?.data, E = r.getState().initialStateGlobal[f];
      if (!(E && !G(E, i) || !E) && !d)
        return;
      let _ = null;
      const b = q(c?.localStorage?.key) ? c?.localStorage?.key(i) : c?.localStorage?.key;
      b && A && (_ = te(`${A}-${f}-${b}`));
      let h = i, L = !1;
      const re = d ? Date.now() : 0, H = _?.lastUpdated || 0, ae = _?.lastSyncedWithServer || 0;
      d && re > H ? (h = c.serverState.data, L = !0) : _ && H > ae && (h = _.state, c?.localStorage?.onChange && c?.localStorage?.onChange(h)), Re(
        f,
        i,
        h,
        n,
        p.current,
        A
      ), L && b && A && Ie(h, f, c, A, Date.now()), ne(f), (Array.isArray(I) ? I : [I || "component"]).includes("none") || V({});
    }
  }, [
    i,
    v?.status,
    v?.data,
    ...t || []
  ]), $e(() => {
    O && ye(f, {
      serverSync: m,
      formElements: g,
      initialState: i,
      localStorage: u,
      middleware: x.current?.middleware
    });
    const c = `${f}////${p.current}`, a = r.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(c, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: w || void 0,
      reactiveType: I ?? ["component", "deps"]
    }), r.getState().stateComponents.set(f, a), V({}), () => {
      const d = `${f}////${p.current}`;
      a && (a.components.delete(d), a.components.size === 0 && r.getState().stateComponents.delete(f));
    };
  }, []);
  const n = (c, a, d, E) => {
    if (Array.isArray(a)) {
      const k = `${f}-${a.join(".")}`;
      J.current.add(k);
    }
    z(f, (k) => {
      const _ = q(c) ? c(k) : c, b = `${f}-${a.join(".")}`;
      if (b) {
        let U = !1, N = r.getState().signalDomElements.get(b);
        if ((!N || N.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const P = a.slice(0, -1), R = D(_, P);
          if (Array.isArray(R)) {
            U = !0;
            const $ = `${f}-${P.join(".")}`;
            N = r.getState().signalDomElements.get($);
          }
        }
        if (N) {
          const P = U ? D(_, a.slice(0, -1)) : D(_, a);
          N.forEach(({ parentId: R, position: $, effect: C }) => {
            const T = document.querySelector(
              `[data-parent-id="${R}"]`
            );
            if (T) {
              const M = Array.from(T.childNodes);
              if (M[$]) {
                const j = C ? new Function("state", `return (${C})(state)`)(P) : P;
                M[$].textContent = String(j);
              }
            }
          });
        }
      }
      d.updateType === "update" && (E || x.current?.validation?.key) && a && W(
        (E || x.current?.validation?.key) + "." + a.join(".")
      );
      const h = a.slice(0, a.length - 1);
      d.updateType === "cut" && x.current?.validation?.key && W(
        x.current?.validation?.key + "." + h.join(".")
      ), d.updateType === "insert" && x.current?.validation?.key && be(
        x.current?.validation?.key + "." + h.join(".")
      ).filter(([N, P]) => {
        let R = N?.split(".").length;
        if (N == h.join(".") && R == h.length - 1) {
          let $ = N + "." + h;
          W(N), je($, P);
        }
      });
      const L = r.getState().stateComponents.get(f);
      if (L) {
        const U = we(k, _), N = new Set(U), P = d.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          R,
          $
        ] of L.components.entries()) {
          let C = !1;
          const T = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (!T.includes("none")) {
            if (T.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (T.includes("component") && (($.paths.has(P) || $.paths.has("")) && (C = !0), !C))
              for (const M of N) {
                let j = M;
                for (; ; ) {
                  if ($.paths.has(j)) {
                    C = !0;
                    break;
                  }
                  const ie = j.lastIndexOf(".");
                  if (ie !== -1) {
                    const fe = j.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(j.substring(ie + 1))
                    ) && $.paths.has(fe)) {
                      C = !0;
                      break;
                    }
                    j = fe;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (C) break;
              }
            if (!C && T.includes("deps") && $.depsFunction) {
              const M = $.depsFunction(_);
              let j = !1;
              typeof M == "boolean" ? M && (j = !0) : G($.deps, M) || ($.deps = M, j = !0), j && (C = !0);
            }
            C && $.forceUpdate();
          }
        }
      }
      const re = Date.now();
      a = a.map((U, N) => {
        const P = a.slice(0, -1), R = D(_, P);
        return N === a.length - 1 && ["insert", "cut"].includes(d.updateType) ? (R.length - 1).toString() : U;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        d.updateType,
        k,
        _,
        a
      );
      const { oldValue: H, newValue: ae } = Ue(
        d.updateType,
        k,
        _,
        a
      ), oe = {
        timeStamp: re,
        stateKey: f,
        path: a,
        updateType: d.updateType,
        status: "new",
        oldValue: H,
        newValue: ae
      };
      if (Pe(f, (U) => {
        const P = [...U ?? [], oe].reduce((R, $) => {
          const C = `${$.stateKey}:${JSON.stringify($.path)}`, T = R.get(C);
          return T ? (T.timeStamp = Math.max(T.timeStamp, $.timeStamp), T.newValue = $.newValue, T.oldValue = T.oldValue ?? $.oldValue, T.updateType = $.updateType) : R.set(C, { ...$ }), R;
        }, /* @__PURE__ */ new Map());
        return Array.from(P.values());
      }), Ie(
        _,
        f,
        x.current,
        A
      ), x.current?.middleware && x.current.middleware({
        updateLog: l,
        update: oe
      }), x.current?.serverSync) {
        const U = r.getState().serverState[f], N = x.current?.serverSync;
        Fe(f, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: _ }),
          rollBackState: U,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return _;
    });
  };
  r.getState().updaterState[f] || (Q(
    f,
    K(
      f,
      n,
      p.current,
      A
    )
  ), r.getState().cogsStateStore[f] || z(f, e), r.getState().initialStateGlobal[f] || ge(f, e));
  const o = Ne(() => K(
    f,
    n,
    p.current,
    A
  ), [f]);
  return [_e(f), o];
}
function K(e, s, m, u) {
  const g = /* @__PURE__ */ new Map();
  let w = 0;
  const I = (S) => {
    const t = S.join(".");
    for (const [v] of g)
      (v === t || v.startsWith(t + ".")) && g.delete(v);
    w++;
  }, y = {
    removeValidation: (S) => {
      S?.validationKey && W(S.validationKey);
    },
    revertToInitialState: (S) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && W(t?.key), S?.validationKey && W(S.validationKey);
      const v = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), g.clear(), w++;
      const F = i(v, []), V = B(e), A = q(V?.localStorage?.key) ? V?.localStorage?.key(v) : V?.localStorage?.key, O = `${u}-${e}-${A}`;
      O && localStorage.removeItem(O), Q(e, F), z(e, v);
      const f = r.getState().stateComponents.get(e);
      return f && f.components.forEach((l) => {
        l.forceUpdate();
      }), v;
    },
    updateInitialState: (S) => {
      g.clear(), w++;
      const t = K(
        e,
        s,
        m,
        u
      ), v = r.getState().initialStateGlobal[e], F = B(e), V = q(F?.localStorage?.key) ? F?.localStorage?.key(v) : F?.localStorage?.key, A = `${u}-${e}-${V}`;
      return console.log("removing storage", A), localStorage.getItem(A) && localStorage.removeItem(A), ke(() => {
        ge(e, S), Q(e, t), z(e, S);
        const O = r.getState().stateComponents.get(e);
        O && O.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (O) => t.get()[O]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const S = r.getState().serverState[e];
      return !!(S && G(S, _e(e)));
    }
  };
  function i(S, t = [], v) {
    const F = t.map(String).join(".");
    g.get(F);
    const V = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(y).forEach((f) => {
      V[f] = y[f];
    });
    const A = {
      apply(f, l, J) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(f, l) {
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender") {
          const n = t.join("."), o = `${e}////${m}`, c = r.getState().stateComponents.get(e);
          if (c) {
            const a = c.components.get(o);
            a && (t.length > 0 || l === "get") && a.paths.add(n);
          }
        }
        if (l === "getDifferences")
          return () => we(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (l === "sync" && t.length === 0)
          return async function() {
            const n = r.getState().getInitialOptions(e), o = n?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const c = r.getState().getNestedState(e, []), a = n?.validation?.key;
            try {
              const d = await o.action(c);
              if (d && !d.success && d.errors && a) {
                r.getState().removeValidationError(a), d.errors.forEach((k) => {
                  const _ = [a, ...k.path].join(".");
                  r.getState().addValidationError(_, k.message);
                });
                const E = r.getState().stateComponents.get(e);
                E && E.components.forEach((k) => {
                  k.forceUpdate();
                });
              }
              return d?.success && o.onSuccess ? o.onSuccess(d.data) : !d?.success && o.onError && o.onError(d.error), d;
            } catch (d) {
              return o.onError && o.onError(d), { success: !1, error: d };
            }
          };
        if (l === "_status") {
          const n = r.getState().getNestedState(e, t), o = r.getState().initialStateGlobal[e], c = D(o, t);
          return G(n, c) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), o = r.getState().initialStateGlobal[e], c = D(o, t);
            return G(n, c) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], o = B(e), c = q(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, a = `${u}-${e}-${c}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(S)) {
          if (l === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return i(
                  S[n],
                  [...t, n.toString()],
                  v
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
              const a = [...r.getState().getNestedState(e, t).map((d, E) => ({
                ...d,
                __origIndex: E.toString()
              }))].sort(n);
              return g.clear(), w++, i(a, t, {
                filtered: [...v?.filtered || [], t],
                validIndices: a.map(
                  (d) => parseInt(d.__origIndex)
                )
              });
            };
          if (l === "stateMap" || l === "stateMapNoRender")
            return (n) => {
              const o = v?.filtered?.some(
                (a) => a.join(".") === t.join(".")
              ), c = o ? S : r.getState().getNestedState(e, t);
              return l !== "stateMapNoRender" && (g.clear(), w++), c.map((a, d) => {
                const E = o && a.__origIndex ? a.__origIndex : d, k = i(
                  a,
                  [...t, E.toString()],
                  v
                );
                return n(
                  a,
                  k,
                  d,
                  S,
                  i(S, t, v)
                );
              });
            };
          if (l === "$stateMap")
            return (n) => ee(Me, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateFlattenOn")
            return (n) => {
              const c = v?.filtered?.some(
                (d) => d.join(".") === t.join(".")
              ) ? S : r.getState().getNestedState(e, t);
              g.clear(), w++;
              const a = c.flatMap(
                (d, E) => d[n] ?? []
              );
              return i(
                a,
                [...t, "[*]", n],
                v
              );
            };
          if (l === "findWith")
            return (n, o) => {
              const c = S.findIndex((E) => E[n] === o);
              if (c === -1) return;
              const a = S[c], d = [...t, c.toString()];
              return g.clear(), w++, i(a, d);
            };
          if (l === "index")
            return (n) => {
              const o = S[n];
              return i(o, [...t, n.toString()]);
            };
          if (l === "last")
            return () => {
              const n = r.getState().getNestedState(e, t);
              if (n.length === 0) return;
              const o = n.length - 1, c = n[o], a = [...t, o.toString()];
              return i(c, a);
            };
          if (l === "insert")
            return (n) => (I(t), se(s, n, t, e), i(
              r.getState().getNestedState(e, t),
              t
            ));
          if (l === "uniqueInsert")
            return (n, o, c) => {
              const a = r.getState().getNestedState(e, t), d = q(n) ? n(a) : n;
              let E = null;
              if (!a.some((_) => {
                if (o) {
                  const h = o.every(
                    (L) => G(_[L], d[L])
                  );
                  return h && (E = _), h;
                }
                const b = G(_, d);
                return b && (E = _), b;
              }))
                I(t), se(s, d, t, e);
              else if (c && E) {
                const _ = c(E), b = a.map(
                  (h) => G(h, E) ? _ : h
                );
                I(t), Z(s, b, t);
              }
            };
          if (l === "cut")
            return (n, o) => {
              if (!o?.waitForSync)
                return I(t), Y(s, t, e, n), i(
                  r.getState().getNestedState(e, t),
                  t
                );
            };
          if (l === "cutByValue")
            return (n) => {
              for (let o = 0; o < S.length; o++)
                S[o] === n && Y(s, t, e, o);
            };
          if (l === "toggleByValue")
            return (n) => {
              const o = S.findIndex((c) => c === n);
              o > -1 ? Y(s, t, e, o) : se(s, n, t, e);
            };
          if (l === "stateFind")
            return (n) => {
              const o = r.getState().getNestedState(e, t), c = o.findIndex(n);
              if (c === -1)
                return;
              const a = o[c], d = [...t, c.toString()];
              return i(a, d);
            };
          if (l === "stateFilter")
            return (n) => {
              const c = r.getState().getNestedState(e, t).filter((a, d) => {
                const E = { ...a, __origIndex: d.toString() };
                return n(E, d);
              });
              return g.clear(), w++, i(c, t, {
                filtered: [...v?.filtered || [], t],
                validIndices: c.map(
                  (a) => parseInt(a.__origIndex)
                )
              });
            };
        }
        const J = t[t.length - 1];
        if (!isNaN(Number(J))) {
          const n = t.slice(0, -1), o = r.getState().getNestedState(e, n);
          if (Array.isArray(o) && l === "cut")
            return () => Y(
              s,
              n,
              e,
              Number(J)
            );
        }
        if (l === "get")
          return () => r.getState().getNestedState(e, t);
        if (l === "$derive")
          return (n) => ce({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (l === "$derive")
          return (n) => ce({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (l === "$get")
          return () => ce({
            _stateKey: e,
            _path: t
          });
        if (l === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (l == "getLocalStorage")
          return (n) => te(u + "-" + e + "-" + n);
        if (l === "_selected") {
          const n = t.slice(0, -1), o = n.join("."), c = r.getState().getNestedState(e, n);
          return Array.isArray(c) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, o) : void 0;
        }
        if (l === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), c = Number(t[t.length - 1]), a = o.join(".");
            n ? r.getState().setSelectedIndex(e, a, c) : r.getState().setSelectedIndex(e, a, void 0);
            const d = r.getState().getNestedState(e, [...o]);
            Z(s, d, o), I(o);
          };
        if (l === "toggleSelected")
          return () => {
            const n = t.slice(0, -1), o = Number(t[t.length - 1]), c = n.join("."), a = r.getState().getSelectedIndex(e, c);
            r.getState().setSelectedIndex(
              e,
              c,
              a === o ? void 0 : o
            );
            const d = r.getState().getNestedState(e, [...n]);
            Z(s, d, n), I(n);
          };
        if (t.length == 0) {
          if (l === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(e)?.validation, o = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              W(n.key);
              const c = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(n.key);
                a && a.length > 0 && a.forEach(([E]) => {
                  E && E.startsWith(n.key) && W(E);
                });
                const d = n.zodSchema.safeParse(c);
                return d.success ? !0 : (d.error.errors.forEach((k) => {
                  const _ = k.path, b = k.message, h = [n.key, ..._].join(".");
                  o(h, b);
                }), ne(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => me.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return r.getState().serverState[e];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return y.revertToInitialState;
          if (l === "updateInitialState") return y.updateInitialState;
          if (l === "removeValidation") return y.removeValidation;
        }
        if (l === "getFormRef")
          return () => me.getState().getFormRef(e + "." + t.join("."));
        if (l === "validationWrapper")
          return ({
            children: n,
            hideMessage: o
          }) => /* @__PURE__ */ Se(
            xe,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: v?.validIndices,
              children: n
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return t;
        if (l === "_isServerSynced") return y._isServerSynced;
        if (l === "update")
          return (n, o) => {
            if (o?.debounce)
              Ae(() => {
                Z(s, n, t, "");
                const c = r.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(c);
              }, o.debounce);
            else {
              Z(s, n, t, "");
              const c = r.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(c);
            }
            I(t);
          };
        if (l === "formElement")
          return (n, o) => /* @__PURE__ */ Se(
            Te,
            {
              setState: s,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const p = [...t, l], x = r.getState().getNestedState(e, p);
        return i(x, p, v);
      }
    }, O = new Proxy(V, A);
    return g.set(F, {
      proxy: O,
      stateVersion: w
    }), O;
  }
  return i(
    r.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return ee(Ge, { proxy: e });
}
function Me({
  proxy: e,
  rebuildStateShape: s
}) {
  const m = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? s(
    m,
    e._path
  ).stateMapNoRender(
    (g, w, I, y, i) => e._mapFn(g, w, I, y, i)
  ) : null;
}
function Ge({
  proxy: e
}) {
  const s = X(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = s.current;
    if (!u || !u.parentElement) return;
    const g = u.parentElement, I = Array.from(g.childNodes).indexOf(u);
    let y = g.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", y));
    const S = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: I,
      effect: e._effect
    };
    r.getState().addSignalElement(m, S);
    const t = r.getState().getNestedState(e._stateKey, e._path);
    let v;
    if (e._effect)
      try {
        v = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), v = t;
      }
    else
      v = t;
    v !== null && typeof v == "object" && (v = JSON.stringify(v));
    const F = document.createTextNode(String(v));
    u.replaceWith(F);
  }, [e._stateKey, e._path.join("."), e._effect]), ee("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Ke(e) {
  const s = he(
    (m) => {
      const u = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return ee("text", {}, String(s));
}
export {
  ce as $cogsSignal,
  Ke as $cogsSignalStore,
  Ye as addStateOptions,
  Xe as createCogsState,
  Qe as notifyComponent,
  De as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
