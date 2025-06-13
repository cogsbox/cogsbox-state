"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as le, useRef as Q, useEffect as de, useLayoutEffect as $e, useMemo as ke, createElement as te, useSyncExternalStore as Ne, startTransition as Te } from "react";
import { transformStateFunc as Ve, isDeepEqual as W, isFunction as q, getNestedValue as M, getDifferences as he, debounce as Ae } from "./utility.js";
import { pushFunc as se, updateFn as H, cutFunc as X, ValidationWrapper as _e, FormControlComponent as Ce } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as me } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as be } from "fast-json-patch";
function ye(e, s) {
  const m = n.getState().getInitialOptions, u = n.getState().setInitialStateOptions, f = m(e) || {};
  u(e, {
    ...f,
    ...s
  });
}
function ve({
  stateKey: e,
  options: s,
  initialOptionsPart: m
}) {
  const u = B(e) || {}, f = m[e] || {}, k = n.getState().setInitialStateOptions, h = { ...f, ...u };
  let y = !1;
  if (s)
    for (const i in s)
      h.hasOwnProperty(i) ? (i == "localStorage" && s[i] && h[i].key !== s[i]?.key && (y = !0, h[i] = s[i]), i == "initialState" && s[i] && h[i] !== s[i] && // Different references
      !W(h[i], s[i]) && (y = !0, h[i] = s[i])) : (y = !0, h[i] = s[i]);
  y && k(e, h);
}
function Qe(e, { formElements: s, validation: m }) {
  return { initialState: e, formElements: s, validation: m };
}
const Ke = (e, s) => {
  let m = e;
  const [u, f] = Ve(m);
  (Object.keys(f).length > 0 || s && Object.keys(s).length > 0) && Object.keys(f).forEach((y) => {
    f[y] = f[y] || {}, f[y].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...f[y].formElements || {}
      // State-specific overrides
    }, B(y) || n.getState().setInitialStateOptions(y, f[y]);
  }), n.getState().setInitialStates(u), n.getState().setCreatedState(u);
  const k = (y, i) => {
    const [S] = le(i?.componentId ?? ue());
    ve({
      stateKey: y,
      options: i,
      initialOptionsPart: f
    });
    const t = n.getState().cogsStateStore[y] || u[y], v = i?.modifyState ? i.modifyState(t) : t, [O, V] = Me(
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
  function h(y, i) {
    ve({ stateKey: y, options: i, initialOptionsPart: f }), i.localStorage && je(y, i), re(y);
  }
  return { useCogsState: k, setCogsOptions: h };
}, {
  setUpdaterState: K,
  setState: z,
  getInitialOptions: B,
  getKeyState: Ee,
  getValidationErrors: xe,
  setStateLog: pe,
  updateInitialStateGlobal: ge,
  addValidationError: Oe,
  removeValidationError: L,
  setServerSyncActions: Fe
} = n.getState(), Ie = (e, s, m, u, f) => {
  m?.log && console.log(
    "saving to localstorage",
    s,
    m.localStorage?.key,
    u
  );
  const k = q(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (k && u) {
    const h = `${u}-${s}-${k}`;
    let y;
    try {
      y = ne(h)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: f ?? y
    }, S = Pe.serialize(i);
    window.localStorage.setItem(
      h,
      JSON.stringify(S.json)
    );
  }
}, ne = (e) => {
  if (!e) return null;
  try {
    const s = window.localStorage.getItem(e);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, je = (e, s) => {
  const m = n.getState().cogsStateStore[e], { sessionId: u } = we(), f = q(s?.localStorage?.key) ? s.localStorage.key(m) : s?.localStorage?.key;
  if (f && u) {
    const k = ne(
      `${u}-${e}-${f}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return z(e, k.state), re(e), !0;
  }
  return !1;
}, Re = (e, s, m, u, f, k) => {
  const h = {
    initialState: s,
    updaterState: ee(
      e,
      u,
      f,
      k
    ),
    state: m
  };
  ge(e, h.initialState), K(e, h.updaterState), z(e, h.state);
}, re = (e) => {
  const s = n.getState().stateComponents.get(e);
  if (!s) return;
  const m = /* @__PURE__ */ new Set();
  s.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || m.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((u) => u());
  });
}, et = (e, s) => {
  const m = n.getState().stateComponents.get(e);
  if (m) {
    const u = `${e}////${s}`, f = m.components.get(u);
    if ((f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none"))
      return;
    f && f.forceUpdate();
  }
}, De = (e, s, m, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: M(s, u),
        newValue: M(m, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: M(m, u)
      };
    case "cut":
      return {
        oldValue: M(s, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Me(e, {
  stateKey: s,
  serverSync: m,
  localStorage: u,
  formElements: f,
  reactiveDeps: k,
  reactiveType: h,
  componentId: y,
  initialState: i,
  syncUpdate: S,
  dependencies: t,
  serverState: v
} = {}) {
  const [O, V] = le({}), { sessionId: A } = we();
  let F = !s;
  const [g] = le(s ?? ue()), c = n.getState().stateLog[g], Z = Q(/* @__PURE__ */ new Set()), G = Q(y ?? ue()), _ = Q(
    null
  );
  _.current = B(g) ?? null, de(() => {
    if (S && S.stateKey === g && S.path?.[0]) {
      z(g, (a) => ({
        ...a,
        [S.path[0]]: S.newValue
      }));
      const o = `${S.stateKey}:${S.path.join(".")}`;
      n.getState().setSyncInfo(o, {
        timeStamp: S.timeStamp,
        userId: S.userId
      });
    }
  }, [S]), de(() => {
    if (i) {
      ye(g, {
        initialState: i
      });
      const o = _.current, d = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, w = n.getState().initialStateGlobal[g];
      if (!(w && !W(w, i) || !w) && !d)
        return;
      let E = null;
      const C = q(o?.localStorage?.key) ? o?.localStorage?.key(i) : o?.localStorage?.key;
      C && A && (E = ne(`${A}-${g}-${C}`));
      let T = i, R = !1;
      const J = d ? Date.now() : 0, Y = E?.lastUpdated || 0, ae = E?.lastSyncedWithServer || 0;
      d && J > Y ? (T = o.serverState.data, R = !0) : E && Y > ae && (T = E.state, o?.localStorage?.onChange && o?.localStorage?.onChange(T)), Re(
        g,
        i,
        T,
        l,
        G.current,
        A
      ), R && C && A && Ie(T, g, o, A, Date.now()), re(g), (Array.isArray(h) ? h : [h || "component"]).includes("none") || V({});
    }
  }, [
    i,
    v?.status,
    v?.data,
    ...t || []
  ]), $e(() => {
    F && ye(g, {
      serverSync: m,
      formElements: f,
      initialState: i,
      localStorage: u,
      middleware: _.current?.middleware
    });
    const o = `${g}////${G.current}`, a = n.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: h ?? ["component", "deps"]
    }), n.getState().stateComponents.set(g, a), V({}), () => {
      const d = `${g}////${G.current}`;
      a && (a.components.delete(d), a.components.size === 0 && n.getState().stateComponents.delete(g));
    };
  }, []);
  const l = (o, a, d, w) => {
    if (Array.isArray(a)) {
      const I = `${g}-${a.join(".")}`;
      Z.current.add(I);
    }
    z(g, (I) => {
      const E = q(o) ? o(I) : o, C = `${g}-${a.join(".")}`;
      if (C) {
        let D = !1, N = n.getState().signalDomElements.get(C);
        if ((!N || N.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const x = a.slice(0, -1), j = M(E, x);
          if (Array.isArray(j)) {
            D = !0;
            const $ = `${g}-${x.join(".")}`;
            N = n.getState().signalDomElements.get($);
          }
        }
        if (N) {
          const x = D ? M(E, a.slice(0, -1)) : M(E, a);
          N.forEach(({ parentId: j, position: $, effect: b }) => {
            const P = document.querySelector(
              `[data-parent-id="${j}"]`
            );
            if (P) {
              const U = Array.from(P.childNodes);
              if (U[$]) {
                const p = b ? new Function("state", `return (${b})(state)`)(x) : x;
                U[$].textContent = String(p);
              }
            }
          });
        }
      }
      d.updateType === "update" && (w || _.current?.validation?.key) && a && L(
        (w || _.current?.validation?.key) + "." + a.join(".")
      );
      const T = a.slice(0, a.length - 1);
      d.updateType === "cut" && _.current?.validation?.key && L(
        _.current?.validation?.key + "." + T.join(".")
      ), d.updateType === "insert" && _.current?.validation?.key && xe(
        _.current?.validation?.key + "." + T.join(".")
      ).filter(([N, x]) => {
        let j = N?.split(".").length;
        if (N == T.join(".") && j == T.length - 1) {
          let $ = N + "." + T;
          L(N), Oe($, x);
        }
      });
      const R = n.getState().stateComponents.get(g);
      if (R) {
        const D = he(I, E), N = new Set(D), x = d.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          j,
          $
        ] of R.components.entries()) {
          let b = !1;
          const P = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (!P.includes("none")) {
            if (P.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (P.includes("component") && (($.paths.has(x) || $.paths.has("")) && (b = !0), !b))
              for (const U of N) {
                let p = U;
                for (; ; ) {
                  if ($.paths.has(p)) {
                    b = !0;
                    break;
                  }
                  const ie = p.lastIndexOf(".");
                  if (ie !== -1) {
                    const fe = p.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(p.substring(ie + 1))
                    ) && $.paths.has(fe)) {
                      b = !0;
                      break;
                    }
                    p = fe;
                  } else
                    p = "";
                  if (p === "")
                    break;
                }
                if (b) break;
              }
            if (!b && P.includes("deps") && $.depsFunction) {
              const U = $.depsFunction(E);
              let p = !1;
              typeof U == "boolean" ? U && (p = !0) : W($.deps, U) || ($.deps = U, p = !0), p && (b = !0);
            }
            b && $.forceUpdate();
          }
        }
      }
      const J = Date.now();
      a = a.map((D, N) => {
        const x = a.slice(0, -1), j = M(E, x);
        return N === a.length - 1 && ["insert", "cut"].includes(d.updateType) ? (j.length - 1).toString() : D;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        d.updateType,
        I,
        E,
        a
      );
      const { oldValue: Y, newValue: ae } = De(
        d.updateType,
        I,
        E,
        a
      ), oe = {
        timeStamp: J,
        stateKey: g,
        path: a,
        updateType: d.updateType,
        status: "new",
        oldValue: Y,
        newValue: ae
      };
      if (pe(g, (D) => {
        const x = [...D ?? [], oe].reduce((j, $) => {
          const b = `${$.stateKey}:${JSON.stringify($.path)}`, P = j.get(b);
          return P ? (P.timeStamp = Math.max(P.timeStamp, $.timeStamp), P.newValue = $.newValue, P.oldValue = P.oldValue ?? $.oldValue, P.updateType = $.updateType) : j.set(b, { ...$ }), j;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), Ie(
        E,
        g,
        _.current,
        A
      ), _.current?.middleware && _.current.middleware({
        updateLog: c,
        update: oe
      }), _.current?.serverSync) {
        const D = n.getState().serverState[g], N = _.current?.serverSync;
        Fe(g, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: D,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  n.getState().updaterState[g] || (K(
    g,
    ee(
      g,
      l,
      G.current,
      A
    )
  ), n.getState().cogsStateStore[g] || z(g, e), n.getState().initialStateGlobal[g] || ge(g, e));
  const r = ke(() => ee(
    g,
    l,
    G.current,
    A
  ), [g]);
  return [Ee(g), r];
}
function ee(e, s, m, u) {
  const f = /* @__PURE__ */ new Map();
  let k = 0;
  const h = (S) => {
    const t = S.join(".");
    for (const [v] of f)
      (v === t || v.startsWith(t + ".")) && f.delete(v);
    k++;
  }, y = {
    removeValidation: (S) => {
      S?.validationKey && L(S.validationKey);
    },
    revertToInitialState: (S) => {
      const t = n.getState().getInitialOptions(e)?.validation;
      t?.key && L(t?.key), S?.validationKey && L(S.validationKey);
      const v = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), f.clear(), k++;
      const O = i(v, []), V = B(e), A = q(V?.localStorage?.key) ? V?.localStorage?.key(v) : V?.localStorage?.key, F = `${u}-${e}-${A}`;
      F && localStorage.removeItem(F), K(e, O), z(e, v);
      const g = n.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), v;
    },
    updateInitialState: (S) => {
      f.clear(), k++;
      const t = ee(
        e,
        s,
        m,
        u
      ), v = n.getState().initialStateGlobal[e], O = B(e), V = q(O?.localStorage?.key) ? O?.localStorage?.key(v) : O?.localStorage?.key, A = `${u}-${e}-${V}`;
      return console.log("removing storage", A), localStorage.getItem(A) && localStorage.removeItem(A), Te(() => {
        ge(e, S), K(e, t), z(e, S);
        const F = n.getState().stateComponents.get(e);
        F && F.components.forEach((g) => {
          g.forceUpdate();
        });
      }), {
        fetchId: (F) => t.get()[F]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const S = n.getState().serverState[e];
      return !!(S && W(S, Ee(e)));
    }
  };
  function i(S, t = [], v) {
    const O = t.map(String).join(".");
    f.get(O);
    const V = function() {
      return n().getNestedState(e, t);
    };
    Object.keys(y).forEach((g) => {
      V[g] = y[g];
    });
    const A = {
      apply(g, c, Z) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, t);
      },
      get(g, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const l = t.join("."), r = `${e}////${m}`, o = n.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (t.length > 0 || c === "get") && a.paths.add(l);
          }
        }
        if (c === "getDifferences")
          return () => he(
            n.getState().cogsStateStore[e],
            n.getState().initialStateGlobal[e]
          );
        if (c === "sync" && t.length === 0)
          return async function() {
            const l = n.getState().getInitialOptions(e), r = l?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = n.getState().getNestedState(e, []), a = l?.validation?.key;
            try {
              const d = await r.action(o);
              if (d && !d.success && d.errors && a) {
                n.getState().removeValidationError(a), d.errors.forEach((I) => {
                  const E = [a, ...I.path].join(".");
                  n.getState().addValidationError(E, I.message);
                });
                const w = n.getState().stateComponents.get(e);
                w && w.components.forEach((I) => {
                  I.forceUpdate();
                });
              }
              return d?.success && r.onSuccess ? r.onSuccess(d.data) : !d?.success && r.onError && r.onError(d.error), d;
            } catch (d) {
              return r.onError && r.onError(d), { success: !1, error: d };
            }
          };
        if (c === "_status") {
          const l = n.getState().getNestedState(e, t), r = n.getState().initialStateGlobal[e], o = M(r, t);
          return W(l, o) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const l = n().getNestedState(
              e,
              t
            ), r = n.getState().initialStateGlobal[e], o = M(r, t);
            return W(l, o) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const l = n.getState().initialStateGlobal[e], r = B(e), o = q(r?.localStorage?.key) ? r?.localStorage?.key(l) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const l = n.getState().getInitialOptions(e)?.validation;
            if (!l?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(l.key + "." + t.join("."));
          };
        if (Array.isArray(S)) {
          const l = () => v?.validIndices ? S.map((o, a) => ({
            item: o,
            originalIndex: v.validIndices[a]
          })) : n.getState().getNestedState(e, t).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (c === "getSelected")
            return () => {
              const r = n.getState().getSelectedIndex(e, t.join("."));
              if (r !== void 0)
                return i(
                  S[r],
                  [...t, r.toString()],
                  v
                );
            };
          if (c === "clearSelected")
            return () => {
              n.getState().clearSelectedIndex({ stateKey: e, path: t });
            };
          if (c === "getSelectedIndex")
            return () => n.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (c === "stateSort")
            return (r) => {
              const a = [...l()].sort(
                (I, E) => r(I.item, E.item)
              ), d = a.map(({ item: I }) => I), w = {
                ...v,
                validIndices: a.map(
                  ({ originalIndex: I }) => I
                )
              };
              return i(d, t, w);
            };
          if (c === "stateFilter")
            return (r) => {
              const a = l().filter(
                ({ item: I }, E) => r(I, E)
              ), d = a.map(({ item: I }) => I), w = {
                ...v,
                validIndices: a.map(
                  ({ originalIndex: I }) => I
                )
              };
              return i(d, t, w);
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (r) => S.map((a, d) => {
              let w;
              v?.validIndices && v.validIndices[d] !== void 0 ? w = v.validIndices[d] : w = d;
              const I = [...t, w.toString()], E = i(a, I, v);
              return r(
                a,
                E,
                d,
                S,
                i(S, t, v)
              );
            });
          if (c === "$stateMap")
            return (r) => te(Ue, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: r
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (c === "stateFlattenOn")
            return (r) => {
              const o = S;
              f.clear(), k++;
              const a = o.flatMap(
                (d) => d[r] ?? []
              );
              return i(
                a,
                [...t, "[*]", r],
                v
              );
            };
          if (c === "index")
            return (r) => {
              const o = S[r];
              return i(o, [...t, r.toString()]);
            };
          if (c === "last")
            return () => {
              const r = n.getState().getNestedState(e, t);
              if (r.length === 0) return;
              const o = r.length - 1, a = r[o], d = [...t, o.toString()];
              return i(a, d);
            };
          if (c === "insert")
            return (r) => (h(t), se(s, r, t, e), i(
              n.getState().getNestedState(e, t),
              t
            ));
          if (c === "uniqueInsert")
            return (r, o, a) => {
              const d = n.getState().getNestedState(e, t), w = q(r) ? r(d) : r;
              let I = null;
              if (!d.some((C) => {
                if (o) {
                  const R = o.every(
                    (J) => W(C[J], w[J])
                  );
                  return R && (I = C), R;
                }
                const T = W(C, w);
                return T && (I = C), T;
              }))
                h(t), se(s, w, t, e);
              else if (a && I) {
                const C = a(I), T = d.map(
                  (R) => W(R, I) ? C : R
                );
                h(t), H(s, T, t);
              }
            };
          if (c === "cut")
            return (r, o) => {
              if (!o?.waitForSync)
                return h(t), X(s, t, e, r), i(
                  n.getState().getNestedState(e, t),
                  t
                );
            };
          if (c === "cutByValue")
            return (r) => {
              for (let o = 0; o < S.length; o++)
                S[o] === r && X(s, t, e, o);
            };
          if (c === "toggleByValue")
            return (r) => {
              const o = S.findIndex((a) => a === r);
              o > -1 ? X(s, t, e, o) : se(s, r, t, e);
            };
          if (c === "stateFind")
            return (r) => {
              const a = l().find(
                ({ item: w }, I) => r(w, I)
              );
              if (!a) return;
              const d = [...t, a.originalIndex.toString()];
              return i(a.item, d, v);
            };
          if (c === "findWith")
            return (r, o) => {
              const d = l().find(
                ({ item: I }) => I[r] === o
              );
              if (!d) return;
              const w = [...t, d.originalIndex.toString()];
              return i(d.item, w, v);
            };
        }
        const Z = t[t.length - 1];
        if (!isNaN(Number(Z))) {
          const l = t.slice(0, -1), r = n.getState().getNestedState(e, l);
          if (Array.isArray(r) && c === "cut")
            return () => X(
              s,
              l,
              e,
              Number(Z)
            );
        }
        if (c === "get")
          return () => n.getState().getNestedState(e, t);
        if (c === "$derive")
          return (l) => ce({
            _stateKey: e,
            _path: t,
            _effect: l.toString()
          });
        if (c === "$derive")
          return (l) => ce({
            _stateKey: e,
            _path: t,
            _effect: l.toString()
          });
        if (c === "$get")
          return () => ce({
            _stateKey: e,
            _path: t
          });
        if (c === "lastSynced") {
          const l = `${e}:${t.join(".")}`;
          return n.getState().getSyncInfo(l);
        }
        if (c == "getLocalStorage")
          return (l) => ne(u + "-" + e + "-" + l);
        if (c === "_selected") {
          const l = t.slice(0, -1), r = l.join("."), o = n.getState().getNestedState(e, l);
          return Array.isArray(o) ? Number(t[t.length - 1]) === n.getState().getSelectedIndex(e, r) : void 0;
        }
        if (c === "setSelected")
          return (l) => {
            const r = t.slice(0, -1), o = Number(t[t.length - 1]), a = r.join(".");
            l ? n.getState().setSelectedIndex(e, a, o) : n.getState().setSelectedIndex(e, a, void 0);
            const d = n.getState().getNestedState(e, [...r]);
            H(s, d, r), h(r);
          };
        if (c === "toggleSelected")
          return () => {
            const l = t.slice(0, -1), r = Number(t[t.length - 1]), o = l.join("."), a = n.getState().getSelectedIndex(e, o);
            n.getState().setSelectedIndex(
              e,
              o,
              a === r ? void 0 : r
            );
            const d = n.getState().getNestedState(e, [...l]);
            H(s, d, l), h(l);
          };
        if (t.length == 0) {
          if (c === "applyJsonPatch")
            return (l) => {
              const r = n.getState().cogsStateStore[e], o = be(r, l);
              n.getState().setState(e, o.newDocument);
            };
          if (c === "validateZodSchema")
            return () => {
              const l = n.getState().getInitialOptions(e)?.validation, r = n.getState().addValidationError;
              if (!l?.zodSchema)
                throw new Error("Zod schema not found");
              if (!l?.key)
                throw new Error("Validation key not found");
              L(l.key);
              const o = n.getState().cogsStateStore[e];
              try {
                const a = n.getState().getValidationErrors(l.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(l.key) && L(w);
                });
                const d = l.zodSchema.safeParse(o);
                return d.success ? !0 : (d.error.errors.forEach((I) => {
                  const E = I.path, C = I.message, T = [l.key, ...E].join(".");
                  r(T, C);
                }), re(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return m;
          if (c === "getComponents")
            return () => n().stateComponents.get(e);
          if (c === "getAllFormRefs")
            return () => me.getState().getFormRefsByStateKey(e);
          if (c === "_initialState")
            return n.getState().initialStateGlobal[e];
          if (c === "_serverState")
            return n.getState().serverState[e];
          if (c === "_isLoading")
            return n.getState().isLoadingGlobal[e];
          if (c === "revertToInitialState")
            return y.revertToInitialState;
          if (c === "updateInitialState") return y.updateInitialState;
          if (c === "removeValidation") return y.removeValidation;
        }
        if (c === "getFormRef")
          return () => me.getState().getFormRef(e + "." + t.join("."));
        if (c === "validationWrapper")
          return ({
            children: l,
            hideMessage: r
          }) => /* @__PURE__ */ Se(
            _e,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: v?.validIndices,
              children: l
            }
          );
        if (c === "_stateKey") return e;
        if (c === "_path") return t;
        if (c === "_isServerSynced") return y._isServerSynced;
        if (c === "update")
          return (l, r) => {
            if (r?.debounce)
              Ae(() => {
                H(s, l, t, "");
                const o = n.getState().getNestedState(e, t);
                r?.afterUpdate && r.afterUpdate(o);
              }, r.debounce);
            else {
              H(s, l, t, "");
              const o = n.getState().getNestedState(e, t);
              r?.afterUpdate && r.afterUpdate(o);
            }
            h(t);
          };
        if (c === "formElement")
          return (l, r) => /* @__PURE__ */ Se(
            Ce,
            {
              setState: s,
              stateKey: e,
              path: t,
              child: l,
              formOpts: r
            }
          );
        const G = [...t, c], _ = n.getState().getNestedState(e, G);
        return i(_, G, v);
      }
    }, F = new Proxy(V, A);
    return f.set(O, {
      proxy: F,
      stateVersion: k
    }), F;
  }
  return i(
    n.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return te(We, { proxy: e });
}
function Ue({
  proxy: e,
  rebuildStateShape: s
}) {
  const m = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? s(
    m,
    e._path
  ).stateMapNoRender(
    (f, k, h, y, i) => e._mapFn(f, k, h, y, i)
  ) : null;
}
function We({
  proxy: e
}) {
  const s = Q(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = s.current;
    if (!u || !u.parentElement) return;
    const f = u.parentElement, h = Array.from(f.childNodes).indexOf(u);
    let y = f.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", y));
    const S = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: h,
      effect: e._effect
    };
    n.getState().addSignalElement(m, S);
    const t = n.getState().getNestedState(e._stateKey, e._path);
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
    const O = document.createTextNode(String(v));
    u.replaceWith(O);
  }, [e._stateKey, e._path.join("."), e._effect]), te("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function tt(e) {
  const s = Ne(
    (m) => {
      const u = n.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return te("text", {}, String(s));
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
