"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as le, useRef as K, useEffect as de, useLayoutEffect as Te, useMemo as ke, createElement as ne, useSyncExternalStore as Ne, startTransition as Ae } from "react";
import { transformStateFunc as Ve, isDeepEqual as W, isFunction as z, getNestedValue as U, getDifferences as he, debounce as pe } from "./utility.js";
import { pushFunc as se, updateFn as H, cutFunc as Q, ValidationWrapper as _e, FormControlComponent as Ce } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as t, formRefStore as me } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as be } from "fast-json-patch";
function ye(e, i) {
  const m = t.getState().getInitialOptions, u = t.getState().setInitialStateOptions, f = m(e) || {};
  u(e, {
    ...f,
    ...i
  });
}
function ve({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const u = J(e) || {}, f = m[e] || {}, T = t.getState().setInitialStateOptions, h = { ...f, ...u };
  let v = !1;
  if (i)
    for (const s in i)
      h.hasOwnProperty(s) ? (s == "localStorage" && i[s] && h[s].key !== i[s]?.key && (v = !0, h[s] = i[s]), s == "initialState" && i[s] && h[s] !== i[s] && // Different references
      !W(h[s], i[s]) && (v = !0, h[s] = i[s])) : (v = !0, h[s] = i[s]);
  v && T(e, h);
}
function Qe(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const Ke = (e, i) => {
  let m = e;
  const [u, f] = Ve(m);
  (Object.keys(f).length > 0 || i && Object.keys(i).length > 0) && Object.keys(f).forEach((v) => {
    f[v] = f[v] || {}, f[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...f[v].formElements || {}
      // State-specific overrides
    }, J(v) || t.getState().setInitialStateOptions(v, f[v]);
  }), t.getState().setInitialStates(u), t.getState().setCreatedState(u);
  const T = (v, s) => {
    const [y] = le(s?.componentId ?? ue());
    ve({
      stateKey: v,
      options: s,
      initialOptionsPart: f
    });
    const n = t.getState().cogsStateStore[v] || u[v], I = s?.modifyState ? s.modifyState(n) : n, [F, V] = Ue(
      I,
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
    return V;
  };
  function h(v, s) {
    ve({ stateKey: v, options: s, initialOptionsPart: f }), s.localStorage && je(v, s), Y(v);
  }
  return { useCogsState: T, setCogsOptions: h };
}, {
  setUpdaterState: ee,
  setState: B,
  getInitialOptions: J,
  getKeyState: Ee,
  getValidationErrors: xe,
  setStateLog: Oe,
  updateInitialStateGlobal: ge,
  addValidationError: Fe,
  removeValidationError: q,
  setServerSyncActions: Re
} = t.getState(), Ie = (e, i, m, u, f) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    u
  );
  const T = z(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (T && u) {
    const h = `${u}-${i}-${T}`;
    let v;
    try {
      v = re(h)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: f ?? v
    }, y = Pe.serialize(s);
    window.localStorage.setItem(
      h,
      JSON.stringify(y.json)
    );
  }
}, re = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, je = (e, i) => {
  const m = t.getState().cogsStateStore[e], { sessionId: u } = we(), f = z(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (f && u) {
    const T = re(
      `${u}-${e}-${f}`
    );
    if (T && T.lastUpdated > (T.lastSyncedWithServer || 0))
      return B(e, T.state), Y(e), !0;
  }
  return !1;
}, $e = (e, i, m, u, f, T) => {
  const h = {
    initialState: i,
    updaterState: te(
      e,
      u,
      f,
      T
    ),
    state: m
  };
  ge(e, h.initialState), ee(e, h.updaterState), B(e, h.state);
}, Y = (e) => {
  const i = t.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || m.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((u) => u());
  });
}, et = (e, i) => {
  const m = t.getState().stateComponents.get(e);
  if (m) {
    const u = `${e}////${i}`, f = m.components.get(u);
    if ((f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none"))
      return;
    f && f.forceUpdate();
  }
}, Me = (e, i, m, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: U(i, u),
        newValue: U(m, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: U(m, u)
      };
    case "cut":
      return {
        oldValue: U(i, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Ue(e, {
  stateKey: i,
  serverSync: m,
  localStorage: u,
  formElements: f,
  reactiveDeps: T,
  reactiveType: h,
  componentId: v,
  initialState: s,
  syncUpdate: y,
  dependencies: n,
  serverState: I
} = {}) {
  const [F, V] = le({}), { sessionId: p } = we();
  let R = !i;
  const [g] = le(i ?? ue()), c = t.getState().stateLog[g], Z = K(/* @__PURE__ */ new Set()), L = K(v ?? ue()), _ = K(
    null
  );
  _.current = J(g) ?? null, de(() => {
    if (y && y.stateKey === g && y.path?.[0]) {
      B(g, (a) => ({
        ...a,
        [y.path[0]]: y.newValue
      }));
      const o = `${y.stateKey}:${y.path.join(".")}`;
      t.getState().setSyncInfo(o, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), de(() => {
    if (s) {
      ye(g, {
        initialState: s
      });
      const o = _.current, l = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, w = t.getState().initialStateGlobal[g];
      if (!(w && !W(w, s) || !w) && !l)
        return;
      let E = null;
      const N = z(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      N && p && (E = re(`${p}-${g}-${N}`));
      let k = s, P = !1;
      const D = l ? Date.now() : 0, X = E?.lastUpdated || 0, ae = E?.lastSyncedWithServer || 0;
      l && D > X ? (k = o.serverState.data, P = !0) : E && X > ae && (k = E.state, o?.localStorage?.onChange && o?.localStorage?.onChange(k)), $e(
        g,
        s,
        k,
        d,
        L.current,
        p
      ), P && N && p && Ie(k, g, o, p, Date.now()), Y(g), (Array.isArray(h) ? h : [h || "component"]).includes("none") || V({});
    }
  }, [
    s,
    I?.status,
    I?.data,
    ...n || []
  ]), Te(() => {
    R && ye(g, {
      serverSync: m,
      formElements: f,
      initialState: s,
      localStorage: u,
      middleware: _.current?.middleware
    });
    const o = `${g}////${L.current}`, a = t.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: T || void 0,
      reactiveType: h ?? ["component", "deps"]
    }), t.getState().stateComponents.set(g, a), V({}), () => {
      const l = `${g}////${L.current}`;
      a && (a.components.delete(l), a.components.size === 0 && t.getState().stateComponents.delete(g));
    };
  }, []);
  const d = (o, a, l, w) => {
    if (Array.isArray(a)) {
      const S = `${g}-${a.join(".")}`;
      Z.current.add(S);
    }
    B(g, (S) => {
      const E = z(o) ? o(S) : o, N = `${g}-${a.join(".")}`;
      if (N) {
        let M = !1, A = t.getState().signalDomElements.get(N);
        if ((!A || A.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const x = a.slice(0, -1), j = U(E, x);
          if (Array.isArray(j)) {
            M = !0;
            const $ = `${g}-${x.join(".")}`;
            A = t.getState().signalDomElements.get($);
          }
        }
        if (A) {
          const x = M ? U(E, a.slice(0, -1)) : U(E, a);
          A.forEach(({ parentId: j, position: $, effect: b }) => {
            const C = document.querySelector(
              `[data-parent-id="${j}"]`
            );
            if (C) {
              const G = Array.from(C.childNodes);
              if (G[$]) {
                const O = b ? new Function("state", `return (${b})(state)`)(x) : x;
                G[$].textContent = String(O);
              }
            }
          });
        }
      }
      l.updateType === "update" && (w || _.current?.validation?.key) && a && q(
        (w || _.current?.validation?.key) + "." + a.join(".")
      );
      const k = a.slice(0, a.length - 1);
      l.updateType === "cut" && _.current?.validation?.key && q(
        _.current?.validation?.key + "." + k.join(".")
      ), l.updateType === "insert" && _.current?.validation?.key && xe(
        _.current?.validation?.key + "." + k.join(".")
      ).filter(([A, x]) => {
        let j = A?.split(".").length;
        if (A == k.join(".") && j == k.length - 1) {
          let $ = A + "." + k;
          q(A), Fe($, x);
        }
      });
      const P = t.getState().stateComponents.get(g);
      if (P) {
        const M = he(S, E), A = new Set(M), x = l.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          j,
          $
        ] of P.components.entries()) {
          let b = !1;
          const C = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (C.includes("component") && (($.paths.has(x) || $.paths.has("")) && (b = !0), !b))
              for (const G of A) {
                let O = G;
                for (; ; ) {
                  if ($.paths.has(O)) {
                    b = !0;
                    break;
                  }
                  const ie = O.lastIndexOf(".");
                  if (ie !== -1) {
                    const fe = O.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(O.substring(ie + 1))
                    ) && $.paths.has(fe)) {
                      b = !0;
                      break;
                    }
                    O = fe;
                  } else
                    O = "";
                  if (O === "")
                    break;
                }
                if (b) break;
              }
            if (!b && C.includes("deps") && $.depsFunction) {
              const G = $.depsFunction(E);
              let O = !1;
              typeof G == "boolean" ? G && (O = !0) : W($.deps, G) || ($.deps = G, O = !0), O && (b = !0);
            }
            b && $.forceUpdate();
          }
        }
      }
      const D = Date.now();
      a = a.map((M, A) => {
        const x = a.slice(0, -1), j = U(E, x);
        return A === a.length - 1 && ["insert", "cut"].includes(l.updateType) ? (j.length - 1).toString() : M;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        l.updateType,
        S,
        E,
        a
      );
      const { oldValue: X, newValue: ae } = Me(
        l.updateType,
        S,
        E,
        a
      ), oe = {
        timeStamp: D,
        stateKey: g,
        path: a,
        updateType: l.updateType,
        status: "new",
        oldValue: X,
        newValue: ae
      };
      if (Oe(g, (M) => {
        const x = [...M ?? [], oe].reduce((j, $) => {
          const b = `${$.stateKey}:${JSON.stringify($.path)}`, C = j.get(b);
          return C ? (C.timeStamp = Math.max(C.timeStamp, $.timeStamp), C.newValue = $.newValue, C.oldValue = C.oldValue ?? $.oldValue, C.updateType = $.updateType) : j.set(b, { ...$ }), j;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), Ie(
        E,
        g,
        _.current,
        p
      ), _.current?.middleware && _.current.middleware({
        updateLog: c,
        update: oe
      }), _.current?.serverSync) {
        const M = t.getState().serverState[g], A = _.current?.serverSync;
        Re(g, {
          syncKey: typeof A.syncKey == "string" ? A.syncKey : A.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (A.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  t.getState().updaterState[g] || (ee(
    g,
    te(
      g,
      d,
      L.current,
      p
    )
  ), t.getState().cogsStateStore[g] || B(g, e), t.getState().initialStateGlobal[g] || ge(g, e));
  const r = ke(() => te(
    g,
    d,
    L.current,
    p
  ), [g]);
  return [Ee(g), r];
}
function te(e, i, m, u) {
  const f = /* @__PURE__ */ new Map();
  let T = 0;
  const h = (y) => {
    const n = y.join(".");
    for (const [I] of f)
      (I === n || I.startsWith(n + ".")) && f.delete(I);
    T++;
  }, v = {
    removeValidation: (y) => {
      y?.validationKey && q(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = t.getState().getInitialOptions(e)?.validation;
      n?.key && q(n?.key), y?.validationKey && q(y.validationKey);
      const I = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), f.clear(), T++;
      const F = s(I, []), V = J(e), p = z(V?.localStorage?.key) ? V?.localStorage?.key(I) : V?.localStorage?.key, R = `${u}-${e}-${p}`;
      R && localStorage.removeItem(R), ee(e, F), B(e, I);
      const g = t.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), I;
    },
    updateInitialState: (y) => {
      f.clear(), T++;
      const n = te(
        e,
        i,
        m,
        u
      ), I = t.getState().initialStateGlobal[e], F = J(e), V = z(F?.localStorage?.key) ? F?.localStorage?.key(I) : F?.localStorage?.key, p = `${u}-${e}-${V}`;
      return console.log("removing storage", p), localStorage.getItem(p) && localStorage.removeItem(p), Ae(() => {
        ge(e, y), ee(e, n), B(e, y);
        const R = t.getState().stateComponents.get(e);
        R && R.components.forEach((g) => {
          g.forceUpdate();
        });
      }), {
        fetchId: (R) => n.get()[R]
      };
    },
    _initialState: t.getState().initialStateGlobal[e],
    _serverState: t.getState().serverState[e],
    _isLoading: t.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const y = t.getState().serverState[e];
      return !!(y && W(y, Ee(e)));
    }
  };
  function s(y, n = [], I) {
    const F = n.map(String).join(".");
    f.get(F);
    const V = function() {
      return t().getNestedState(e, n);
    };
    Object.keys(v).forEach((g) => {
      V[g] = v[g];
    });
    const p = {
      apply(g, c, Z) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), t().getNestedState(e, n);
      },
      get(g, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const d = n.join("."), r = `${e}////${m}`, o = t.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (n.length > 0 || c === "get") && a.paths.add(d);
          }
        }
        if (c === "getDifferences")
          return () => he(
            t.getState().cogsStateStore[e],
            t.getState().initialStateGlobal[e]
          );
        if (c === "sync" && n.length === 0)
          return async function() {
            const d = t.getState().getInitialOptions(e), r = d?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = t.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const l = await r.action(o);
              if (l && !l.success && l.errors && a) {
                t.getState().removeValidationError(a), l.errors.forEach((S) => {
                  const E = [a, ...S.path].join(".");
                  t.getState().addValidationError(E, S.message);
                });
                const w = t.getState().stateComponents.get(e);
                w && w.components.forEach((S) => {
                  S.forceUpdate();
                });
              }
              return l?.success && r.onSuccess ? r.onSuccess(l.data) : !l?.success && r.onError && r.onError(l.error), l;
            } catch (l) {
              return r.onError && r.onError(l), { success: !1, error: l };
            }
          };
        if (c === "_status") {
          const d = t.getState().getNestedState(e, n), r = t.getState().initialStateGlobal[e], o = U(r, n);
          return W(d, o) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const d = t().getNestedState(
              e,
              n
            ), r = t.getState().initialStateGlobal[e], o = U(r, n);
            return W(d, o) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const d = t.getState().initialStateGlobal[e], r = J(e), o = z(r?.localStorage?.key) ? r?.localStorage?.key(d) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const d = t.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return t.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(y)) {
          const d = () => I?.validIndices ? y.map((o, a) => ({
            item: o,
            originalIndex: I.validIndices[a]
          })) : t.getState().getNestedState(e, n).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (c === "getSelected")
            return () => {
              const r = t.getState().getSelectedIndex(e, n.join("."));
              if (r !== void 0)
                return s(
                  y[r],
                  [...n, r.toString()],
                  I
                );
            };
          if (c === "clearSelected")
            return () => {
              t.getState().clearSelectedIndex({ stateKey: e, path: n });
            };
          if (c === "getSelectedIndex")
            return () => t.getState().getSelectedIndex(e, n.join(".")) ?? -1;
          if (c === "stateSort")
            return (r) => {
              const a = [...d()].sort(
                (S, E) => r(S.item, E.item)
              ), l = a.map(({ item: S }) => S), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: S }) => S
                )
              };
              return s(l, n, w);
            };
          if (c === "stateFilter")
            return (r) => {
              const a = d().filter(
                ({ item: S }, E) => r(S, E)
              ), l = a.map(({ item: S }) => S), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: S }) => S
                )
              };
              return s(l, n, w);
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (r) => y.map((a, l) => {
              let w;
              I?.validIndices && I.validIndices[l] !== void 0 ? w = I.validIndices[l] : w = l;
              const S = [...n, w.toString()], E = s(a, S, I);
              return r(
                a,
                E,
                l,
                y,
                s(y, n, I)
              );
            });
          if (c === "$stateMap")
            return (r) => ne(De, {
              proxy: {
                _stateKey: e,
                _path: n,
                _mapFn: r
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (c === "stateFlattenOn")
            return (r) => {
              const o = y;
              f.clear(), T++;
              const a = o.flatMap(
                (l) => l[r] ?? []
              );
              return s(
                a,
                [...n, "[*]", r],
                I
              );
            };
          if (c === "index")
            return (r) => {
              const o = y[r];
              return s(o, [...n, r.toString()]);
            };
          if (c === "last")
            return () => {
              const r = t.getState().getNestedState(e, n);
              if (r.length === 0) return;
              const o = r.length - 1, a = r[o], l = [...n, o.toString()];
              return s(a, l);
            };
          if (c === "insert")
            return (r) => (h(n), se(i, r, n, e), s(
              t.getState().getNestedState(e, n),
              n
            ));
          if (c === "uniqueInsert")
            return (r, o, a) => {
              const l = t.getState().getNestedState(e, n), w = z(r) ? r(l) : r;
              let S = null;
              if (!l.some((N) => {
                if (o) {
                  const P = o.every(
                    (D) => W(N[D], w[D])
                  );
                  return P && (S = N), P;
                }
                const k = W(N, w);
                return k && (S = N), k;
              }))
                h(n), se(i, w, n, e);
              else if (a && S) {
                const N = a(S), k = l.map(
                  (P) => W(P, S) ? N : P
                );
                h(n), H(i, k, n);
              }
            };
          if (c === "cut")
            return (r, o) => {
              if (!o?.waitForSync)
                return h(n), Q(i, n, e, r), s(
                  t.getState().getNestedState(e, n),
                  n
                );
            };
          if (c === "cutByValue")
            return (r) => {
              for (let o = 0; o < y.length; o++)
                y[o] === r && Q(i, n, e, o);
            };
          if (c === "toggleByValue")
            return (r) => {
              const o = y.findIndex((a) => a === r);
              o > -1 ? Q(i, n, e, o) : se(i, r, n, e);
            };
          if (c === "stateFind")
            return (r) => {
              const a = d().find(
                ({ item: w }, S) => r(w, S)
              );
              if (!a) return;
              const l = [...n, a.originalIndex.toString()];
              return s(a.item, l, I);
            };
          if (c === "findWith")
            return (r, o) => {
              const l = d().find(
                ({ item: S }) => S[r] === o
              );
              if (!l) return;
              const w = [...n, l.originalIndex.toString()];
              return s(l.item, w, I);
            };
        }
        const Z = n[n.length - 1];
        if (!isNaN(Number(Z))) {
          const d = n.slice(0, -1), r = t.getState().getNestedState(e, d);
          if (Array.isArray(r) && c === "cut")
            return () => Q(
              i,
              d,
              e,
              Number(Z)
            );
        }
        if (c === "get")
          return () => t.getState().getNestedState(e, n);
        if (c === "$derive")
          return (d) => ce({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (c === "$derive")
          return (d) => ce({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (c === "$get")
          return () => ce({
            _stateKey: e,
            _path: n
          });
        if (c === "lastSynced") {
          const d = `${e}:${n.join(".")}`;
          return t.getState().getSyncInfo(d);
        }
        if (c == "getLocalStorage")
          return (d) => re(u + "-" + e + "-" + d);
        if (c === "_selected") {
          const d = n.slice(0, -1), r = d.join("."), o = t.getState().getNestedState(e, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === t.getState().getSelectedIndex(e, r) : void 0;
        }
        if (c === "setSelected")
          return (d) => {
            const r = n.slice(0, -1), o = Number(n[n.length - 1]), a = r.join(".");
            d ? t.getState().setSelectedIndex(e, a, o) : t.getState().setSelectedIndex(e, a, void 0);
            const l = t.getState().getNestedState(e, [...r]);
            H(i, l, r), h(r);
          };
        if (c === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), r = Number(n[n.length - 1]), o = d.join("."), a = t.getState().getSelectedIndex(e, o);
            t.getState().setSelectedIndex(
              e,
              o,
              a === r ? void 0 : r
            );
            const l = t.getState().getNestedState(e, [...d]);
            H(i, l, d), h(d);
          };
        if (n.length == 0) {
          if (c === "applyJsonPatch")
            return (d) => {
              const r = t.getState().cogsStateStore[e], a = be(r, d).newDocument, l = `${e}////${m}`, w = t.getState().stateComponents.get(e), S = w?.components.get(l), E = S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : ["component"], N = J(e), k = N?.middleware, P = t.getState().setInitialStateOptions;
              if (N && k && P(e, {
                ...N,
                middleware: void 0
              }), $e(
                e,
                t.getState().initialStateGlobal[e],
                a,
                i,
                m,
                u
              ), N && k && P(e, {
                ...N,
                middleware: k
              }), Y(e), !E.includes("none")) {
                const D = w?.components.get(l);
                D && D.forceUpdate();
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const d = t.getState().getInitialOptions(e)?.validation, r = t.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              q(d.key);
              const o = t.getState().cogsStateStore[e];
              try {
                const a = t.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(d.key) && q(w);
                });
                const l = d.zodSchema.safeParse(o);
                return l.success ? !0 : (l.error.errors.forEach((S) => {
                  const E = S.path, N = S.message, k = [d.key, ...E].join(".");
                  r(k, N);
                }), Y(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return m;
          if (c === "getComponents")
            return () => t().stateComponents.get(e);
          if (c === "getAllFormRefs")
            return () => me.getState().getFormRefsByStateKey(e);
          if (c === "_initialState")
            return t.getState().initialStateGlobal[e];
          if (c === "_serverState")
            return t.getState().serverState[e];
          if (c === "_isLoading")
            return t.getState().isLoadingGlobal[e];
          if (c === "revertToInitialState")
            return v.revertToInitialState;
          if (c === "updateInitialState") return v.updateInitialState;
          if (c === "removeValidation") return v.removeValidation;
        }
        if (c === "getFormRef")
          return () => me.getState().getFormRef(e + "." + n.join("."));
        if (c === "validationWrapper")
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
        if (c === "_stateKey") return e;
        if (c === "_path") return n;
        if (c === "_isServerSynced") return v._isServerSynced;
        if (c === "update")
          return (d, r) => {
            if (r?.debounce)
              pe(() => {
                H(i, d, n, "");
                const o = t.getState().getNestedState(e, n);
                r?.afterUpdate && r.afterUpdate(o);
              }, r.debounce);
            else {
              H(i, d, n, "");
              const o = t.getState().getNestedState(e, n);
              r?.afterUpdate && r.afterUpdate(o);
            }
            h(n);
          };
        if (c === "formElement")
          return (d, r) => /* @__PURE__ */ Se(
            Ce,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: r
            }
          );
        const L = [...n, c], _ = t.getState().getNestedState(e, L);
        return s(_, L, I);
      }
    }, R = new Proxy(V, p);
    return f.set(F, {
      proxy: R,
      stateVersion: T
    }), R;
  }
  return s(
    t.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return ne(Ge, { proxy: e });
}
function De({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = t().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? i(
    m,
    e._path
  ).stateMapNoRender(
    (f, T, h, v, s) => e._mapFn(f, T, h, v, s)
  ) : null;
}
function Ge({
  proxy: e
}) {
  const i = K(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const f = u.parentElement, h = Array.from(f.childNodes).indexOf(u);
    let v = f.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", v));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: h,
      effect: e._effect
    };
    t.getState().addSignalElement(m, y);
    const n = t.getState().getNestedState(e._stateKey, e._path);
    let I;
    if (e._effect)
      try {
        I = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), I = n;
      }
    else
      I = n;
    I !== null && typeof I == "object" && (I = JSON.stringify(I));
    const F = document.createTextNode(String(I));
    u.replaceWith(F);
  }, [e._stateKey, e._path.join("."), e._effect]), ne("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function tt(e) {
  const i = Ne(
    (m) => {
      const u = t.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => t.getState().getNestedState(e._stateKey, e._path)
  );
  return ne("text", {}, String(i));
}
export {
  ce as $cogsSignal,
  tt as $cogsSignalStore,
  Qe as addStateOptions,
  Ke as createCogsState,
  et as notifyComponent,
  Ue as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
