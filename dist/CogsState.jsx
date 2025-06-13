"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as le, useRef as ee, useEffect as de, useLayoutEffect as $e, useMemo as Te, createElement as re, useSyncExternalStore as ke, startTransition as Ne } from "react";
import { transformStateFunc as Ae, isDeepEqual as G, isFunction as B, getNestedValue as W, getDifferences as ue, debounce as Ve } from "./utility.js";
import { pushFunc as se, updateFn as Q, cutFunc as K, ValidationWrapper as _e, FormControlComponent as be } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as t, formRefStore as ye } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as Ce } from "fast-json-patch";
function ve(e, i) {
  const m = t.getState().getInitialOptions, u = t.getState().setInitialStateOptions, f = m(e) || {};
  u(e, {
    ...f,
    ...i
  });
}
function Ie({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const u = Z(e) || {}, f = m[e] || {}, T = t.getState().setInitialStateOptions, h = { ...f, ...u };
  let v = !1;
  if (i)
    for (const s in i)
      h.hasOwnProperty(s) ? (s == "localStorage" && i[s] && h[s].key !== i[s]?.key && (v = !0, h[s] = i[s]), s == "initialState" && i[s] && h[s] !== i[s] && // Different references
      !G(h[s], i[s]) && (v = !0, h[s] = i[s])) : (v = !0, h[s] = i[s]);
  v && T(e, h);
}
function Qe(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const Ke = (e, i) => {
  let m = e;
  const [u, f] = Ae(m);
  (Object.keys(f).length > 0 || i && Object.keys(i).length > 0) && Object.keys(f).forEach((v) => {
    f[v] = f[v] || {}, f[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...f[v].formElements || {}
      // State-specific overrides
    }, Z(v) || t.getState().setInitialStateOptions(v, f[v]);
  }), t.getState().setInitialStates(u), t.getState().setCreatedState(u);
  const T = (v, s) => {
    const [y] = le(s?.componentId ?? ge());
    Ie({
      stateKey: v,
      options: s,
      initialOptionsPart: f
    });
    const n = t.getState().cogsStateStore[v] || u[v], I = s?.modifyState ? s.modifyState(n) : n, [U, V] = De(
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
    Ie({ stateKey: v, options: s, initialOptionsPart: f }), s.localStorage && je(v, s), oe(v);
  }
  return { useCogsState: T, setCogsOptions: h };
}, {
  setUpdaterState: te,
  setState: H,
  getInitialOptions: Z,
  getKeyState: pe,
  getValidationErrors: xe,
  setStateLog: Oe,
  updateInitialStateGlobal: fe,
  addValidationError: Fe,
  removeValidationError: J,
  setServerSyncActions: Re
} = t.getState(), he = (e, i, m, u, f) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    u
  );
  const T = B(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (T && u) {
    const h = `${u}-${i}-${T}`;
    let v;
    try {
      v = ae(h)?.lastSyncedWithServer;
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
}, ae = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, je = (e, i) => {
  const m = t.getState().cogsStateStore[e], { sessionId: u } = we(), f = B(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (f && u) {
    const T = ae(
      `${u}-${e}-${f}`
    );
    if (T && T.lastUpdated > (T.lastSyncedWithServer || 0))
      return H(e, T.state), oe(e), !0;
  }
  return !1;
}, Ee = (e, i, m, u, f, T) => {
  const h = {
    initialState: i,
    updaterState: ne(
      e,
      u,
      f,
      T
    ),
    state: m
  };
  fe(e, h.initialState), te(e, h.updaterState), H(e, h.state);
}, oe = (e) => {
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
}, Ue = (e, i, m, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: W(i, u),
        newValue: W(m, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: W(m, u)
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
function De(e, {
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
  const [U, V] = le({}), { sessionId: _ } = we();
  let D = !i;
  const [g] = le(i ?? ge()), c = t.getState().stateLog[g], Y = ee(/* @__PURE__ */ new Set()), q = ee(v ?? ge()), b = ee(
    null
  );
  b.current = Z(g) ?? null, de(() => {
    if (y && y.stateKey === g && y.path?.[0]) {
      H(g, (a) => ({
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
      ve(g, {
        initialState: s
      });
      const o = b.current, d = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, w = t.getState().initialStateGlobal[g];
      if (!(w && !G(w, s) || !w) && !d)
        return;
      let p = null;
      const A = B(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      A && _ && (p = ae(`${_}-${g}-${A}`));
      let N = s, R = !1;
      const z = d ? Date.now() : 0, X = p?.lastUpdated || 0, P = p?.lastSyncedWithServer || 0;
      d && z > X ? (N = o.serverState.data, R = !0) : p && X > P && (N = p.state, o?.localStorage?.onChange && o?.localStorage?.onChange(N)), Ee(
        g,
        s,
        N,
        l,
        q.current,
        _
      ), R && A && _ && he(N, g, o, _, Date.now()), oe(g), (Array.isArray(h) ? h : [h || "component"]).includes("none") || V({});
    }
  }, [
    s,
    I?.status,
    I?.data,
    ...n || []
  ]), $e(() => {
    D && ve(g, {
      serverSync: m,
      formElements: f,
      initialState: s,
      localStorage: u,
      middleware: b.current?.middleware
    });
    const o = `${g}////${q.current}`, a = t.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: T || void 0,
      reactiveType: h ?? ["component", "deps"]
    }), t.getState().stateComponents.set(g, a), V({}), () => {
      const d = `${g}////${q.current}`;
      a && (a.components.delete(d), a.components.size === 0 && t.getState().stateComponents.delete(g));
    };
  }, []);
  const l = (o, a, d, w) => {
    if (Array.isArray(a)) {
      const S = `${g}-${a.join(".")}`;
      Y.current.add(S);
    }
    H(g, (S) => {
      const p = B(o) ? o(S) : o, A = `${g}-${a.join(".")}`;
      if (A) {
        let C = !1, $ = t.getState().signalDomElements.get(A);
        if ((!$ || $.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const k = a.slice(0, -1), x = W(p, k);
          if (Array.isArray(x)) {
            C = !0;
            const E = `${g}-${k.join(".")}`;
            $ = t.getState().signalDomElements.get(E);
          }
        }
        if ($) {
          const k = C ? W(p, a.slice(0, -1)) : W(p, a);
          $.forEach(({ parentId: x, position: E, effect: F }) => {
            const O = document.querySelector(
              `[data-parent-id="${x}"]`
            );
            if (O) {
              const L = Array.from(O.childNodes);
              if (L[E]) {
                const j = F ? new Function("state", `return (${F})(state)`)(k) : k;
                L[E].textContent = String(j);
              }
            }
          });
        }
      }
      d.updateType === "update" && (w || b.current?.validation?.key) && a && J(
        (w || b.current?.validation?.key) + "." + a.join(".")
      );
      const N = a.slice(0, a.length - 1);
      d.updateType === "cut" && b.current?.validation?.key && J(
        b.current?.validation?.key + "." + N.join(".")
      ), d.updateType === "insert" && b.current?.validation?.key && xe(
        b.current?.validation?.key + "." + N.join(".")
      ).filter(([$, k]) => {
        let x = $?.split(".").length;
        if ($ == N.join(".") && x == N.length - 1) {
          let E = $ + "." + N;
          J($), Fe(E, k);
        }
      });
      const R = t.getState().stateComponents.get(g);
      if (R) {
        const C = ue(S, p), $ = new Set(C), k = d.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          x,
          E
        ] of R.components.entries()) {
          let F = !1;
          const O = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (!O.includes("none")) {
            if (O.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (O.includes("component") && ((E.paths.has(k) || E.paths.has("")) && (F = !0), !F))
              for (const L of $) {
                let j = L;
                for (; ; ) {
                  if (E.paths.has(j)) {
                    F = !0;
                    break;
                  }
                  const ie = j.lastIndexOf(".");
                  if (ie !== -1) {
                    const Se = j.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(j.substring(ie + 1))
                    ) && E.paths.has(Se)) {
                      F = !0;
                      break;
                    }
                    j = Se;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (F) break;
              }
            if (!F && O.includes("deps") && E.depsFunction) {
              const L = E.depsFunction(p);
              let j = !1;
              typeof L == "boolean" ? L && (j = !0) : G(E.deps, L) || (E.deps = L, j = !0), j && (F = !0);
            }
            F && E.forceUpdate();
          }
        }
      }
      const z = Date.now();
      a = a.map((C, $) => {
        const k = a.slice(0, -1), x = W(p, k);
        return $ === a.length - 1 && ["insert", "cut"].includes(d.updateType) ? (x.length - 1).toString() : C;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        d.updateType,
        S,
        p,
        a
      );
      const { oldValue: X, newValue: P } = Ue(
        d.updateType,
        S,
        p,
        a
      ), M = {
        timeStamp: z,
        stateKey: g,
        path: a,
        updateType: d.updateType,
        status: "new",
        oldValue: X,
        newValue: P
      };
      if (Oe(g, (C) => {
        const k = [...C ?? [], M].reduce((x, E) => {
          const F = `${E.stateKey}:${JSON.stringify(E.path)}`, O = x.get(F);
          return O ? (O.timeStamp = Math.max(O.timeStamp, E.timeStamp), O.newValue = E.newValue, O.oldValue = O.oldValue ?? E.oldValue, O.updateType = E.updateType) : x.set(F, { ...E }), x;
        }, /* @__PURE__ */ new Map());
        return Array.from(k.values());
      }), he(
        p,
        g,
        b.current,
        _
      ), b.current?.middleware && b.current.middleware({
        updateLog: c,
        update: M
      }), b.current?.serverSync) {
        const C = t.getState().serverState[g], $ = b.current?.serverSync;
        Re(g, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: p }),
          rollBackState: C,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
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
      l,
      q.current,
      _
    )
  ), t.getState().cogsStateStore[g] || H(g, e), t.getState().initialStateGlobal[g] || fe(g, e));
  const r = Te(() => ne(
    g,
    l,
    q.current,
    _
  ), [g]);
  return [pe(g), r];
}
function ne(e, i, m, u) {
  const f = /* @__PURE__ */ new Map();
  let T = 0;
  const h = (y) => {
    const n = y.join(".");
    for (const [I] of f)
      (I === n || I.startsWith(n + ".")) && f.delete(I);
    T++;
  }, v = {
    removeValidation: (y) => {
      y?.validationKey && J(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = t.getState().getInitialOptions(e)?.validation;
      n?.key && J(n?.key), y?.validationKey && J(y.validationKey);
      const I = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), f.clear(), T++;
      const U = s(I, []), V = Z(e), _ = B(V?.localStorage?.key) ? V?.localStorage?.key(I) : V?.localStorage?.key, D = `${u}-${e}-${_}`;
      D && localStorage.removeItem(D), te(e, U), H(e, I);
      const g = t.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), I;
    },
    updateInitialState: (y) => {
      f.clear(), T++;
      const n = ne(
        e,
        i,
        m,
        u
      ), I = t.getState().initialStateGlobal[e], U = Z(e), V = B(U?.localStorage?.key) ? U?.localStorage?.key(I) : U?.localStorage?.key, _ = `${u}-${e}-${V}`;
      return console.log("removing storage", _), localStorage.getItem(_) && localStorage.removeItem(_), Ne(() => {
        fe(e, y), te(e, n), H(e, y);
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
      const y = t.getState().serverState[e];
      return !!(y && G(y, pe(e)));
    }
  };
  function s(y, n = [], I) {
    const U = n.map(String).join(".");
    f.get(U);
    const V = function() {
      return t().getNestedState(e, n);
    };
    Object.keys(v).forEach((g) => {
      V[g] = v[g];
    });
    const _ = {
      apply(g, c, Y) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), t().getNestedState(e, n);
      },
      get(g, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const l = n.join("."), r = `${e}////${m}`, o = t.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (n.length > 0 || c === "get") && a.paths.add(l);
          }
        }
        if (c === "getDifferences")
          return () => ue(
            t.getState().cogsStateStore[e],
            t.getState().initialStateGlobal[e]
          );
        if (c === "sync" && n.length === 0)
          return async function() {
            const l = t.getState().getInitialOptions(e), r = l?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = t.getState().getNestedState(e, []), a = l?.validation?.key;
            try {
              const d = await r.action(o);
              if (d && !d.success && d.errors && a) {
                t.getState().removeValidationError(a), d.errors.forEach((S) => {
                  const p = [a, ...S.path].join(".");
                  t.getState().addValidationError(p, S.message);
                });
                const w = t.getState().stateComponents.get(e);
                w && w.components.forEach((S) => {
                  S.forceUpdate();
                });
              }
              return d?.success && r.onSuccess ? r.onSuccess(d.data) : !d?.success && r.onError && r.onError(d.error), d;
            } catch (d) {
              return r.onError && r.onError(d), { success: !1, error: d };
            }
          };
        if (c === "_status") {
          const l = t.getState().getNestedState(e, n), r = t.getState().initialStateGlobal[e], o = W(r, n);
          return G(l, o) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const l = t().getNestedState(
              e,
              n
            ), r = t.getState().initialStateGlobal[e], o = W(r, n);
            return G(l, o) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const l = t.getState().initialStateGlobal[e], r = Z(e), o = B(r?.localStorage?.key) ? r?.localStorage?.key(l) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const l = t.getState().getInitialOptions(e)?.validation;
            if (!l?.key)
              throw new Error("Validation key not found");
            return t.getState().getValidationErrors(l.key + "." + n.join("."));
          };
        if (Array.isArray(y)) {
          const l = () => I?.validIndices ? y.map((o, a) => ({
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
              const a = [...l()].sort(
                (S, p) => r(S.item, p.item)
              ), d = a.map(({ item: S }) => S), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: S }) => S
                )
              };
              return s(d, n, w);
            };
          if (c === "stateFilter")
            return (r) => {
              const a = l().filter(
                ({ item: S }, p) => r(S, p)
              ), d = a.map(({ item: S }) => S), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: S }) => S
                )
              };
              return s(d, n, w);
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (r) => y.map((a, d) => {
              let w;
              I?.validIndices && I.validIndices[d] !== void 0 ? w = I.validIndices[d] : w = d;
              const S = [...n, w.toString()], p = s(a, S, I);
              return r(
                a,
                p,
                d,
                y,
                s(y, n, I)
              );
            });
          if (c === "$stateMap")
            return (r) => re(Me, {
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
                (d) => d[r] ?? []
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
              const o = r.length - 1, a = r[o], d = [...n, o.toString()];
              return s(a, d);
            };
          if (c === "insert")
            return (r) => (h(n), se(i, r, n, e), s(
              t.getState().getNestedState(e, n),
              n
            ));
          if (c === "uniqueInsert")
            return (r, o, a) => {
              const d = t.getState().getNestedState(e, n), w = B(r) ? r(d) : r;
              let S = null;
              if (!d.some((A) => {
                if (o) {
                  const R = o.every(
                    (z) => G(A[z], w[z])
                  );
                  return R && (S = A), R;
                }
                const N = G(A, w);
                return N && (S = A), N;
              }))
                h(n), se(i, w, n, e);
              else if (a && S) {
                const A = a(S), N = d.map(
                  (R) => G(R, S) ? A : R
                );
                h(n), Q(i, N, n);
              }
            };
          if (c === "cut")
            return (r, o) => {
              if (!o?.waitForSync)
                return h(n), K(i, n, e, r), s(
                  t.getState().getNestedState(e, n),
                  n
                );
            };
          if (c === "cutByValue")
            return (r) => {
              for (let o = 0; o < y.length; o++)
                y[o] === r && K(i, n, e, o);
            };
          if (c === "toggleByValue")
            return (r) => {
              const o = y.findIndex((a) => a === r);
              o > -1 ? K(i, n, e, o) : se(i, r, n, e);
            };
          if (c === "stateFind")
            return (r) => {
              const a = l().find(
                ({ item: w }, S) => r(w, S)
              );
              if (!a) return;
              const d = [...n, a.originalIndex.toString()];
              return s(a.item, d, I);
            };
          if (c === "findWith")
            return (r, o) => {
              const d = l().find(
                ({ item: S }) => S[r] === o
              );
              if (!d) return;
              const w = [...n, d.originalIndex.toString()];
              return s(d.item, w, I);
            };
        }
        const Y = n[n.length - 1];
        if (!isNaN(Number(Y))) {
          const l = n.slice(0, -1), r = t.getState().getNestedState(e, l);
          if (Array.isArray(r) && c === "cut")
            return () => K(
              i,
              l,
              e,
              Number(Y)
            );
        }
        if (c === "get")
          return () => t.getState().getNestedState(e, n);
        if (c === "$derive")
          return (l) => ce({
            _stateKey: e,
            _path: n,
            _effect: l.toString()
          });
        if (c === "$derive")
          return (l) => ce({
            _stateKey: e,
            _path: n,
            _effect: l.toString()
          });
        if (c === "$get")
          return () => ce({
            _stateKey: e,
            _path: n
          });
        if (c === "lastSynced") {
          const l = `${e}:${n.join(".")}`;
          return t.getState().getSyncInfo(l);
        }
        if (c == "getLocalStorage")
          return (l) => ae(u + "-" + e + "-" + l);
        if (c === "_selected") {
          const l = n.slice(0, -1), r = l.join("."), o = t.getState().getNestedState(e, l);
          return Array.isArray(o) ? Number(n[n.length - 1]) === t.getState().getSelectedIndex(e, r) : void 0;
        }
        if (c === "setSelected")
          return (l) => {
            const r = n.slice(0, -1), o = Number(n[n.length - 1]), a = r.join(".");
            l ? t.getState().setSelectedIndex(e, a, o) : t.getState().setSelectedIndex(e, a, void 0);
            const d = t.getState().getNestedState(e, [...r]);
            Q(i, d, r), h(r);
          };
        if (c === "toggleSelected")
          return () => {
            const l = n.slice(0, -1), r = Number(n[n.length - 1]), o = l.join("."), a = t.getState().getSelectedIndex(e, o);
            t.getState().setSelectedIndex(
              e,
              o,
              a === r ? void 0 : r
            );
            const d = t.getState().getNestedState(e, [...l]);
            Q(i, d, l), h(l);
          };
        if (n.length == 0) {
          if (c === "applyJsonPatch")
            return (l) => {
              const r = t.getState().cogsStateStore[e], a = Ce(r, l).newDocument, d = `${e}////${m}`, w = t.getState().stateComponents.get(e), S = w?.components.get(d);
              S && (Array.isArray(S.reactiveType) ? S.reactiveType : S.reactiveType);
              const p = Z(e), A = p?.middleware, N = t.getState().setInitialStateOptions;
              p && A && N(e, {
                ...p,
                middleware: void 0
              }), Ee(
                e,
                t.getState().initialStateGlobal[e],
                a,
                i,
                m,
                u
              ), p && A && N(e, {
                ...p,
                middleware: A
              });
              const R = ue(r, a), z = new Set(R);
              if (w)
                for (const [
                  X,
                  P
                ] of w.components.entries()) {
                  let M = !1;
                  const C = Array.isArray(P.reactiveType) ? P.reactiveType : [P.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      P.forceUpdate();
                      continue;
                    }
                    if (C.includes("component"))
                      for (const $ of z) {
                        let k = $;
                        for (; ; ) {
                          if (P.paths.has(k)) {
                            M = !0;
                            break;
                          }
                          const x = k.lastIndexOf(".");
                          if (x !== -1) {
                            const E = k.substring(
                              0,
                              x
                            );
                            if (!isNaN(
                              Number(
                                k.substring(x + 1)
                              )
                            ) && P.paths.has(E)) {
                              M = !0;
                              break;
                            }
                            k = E;
                          } else
                            k = "";
                          if (k === "") {
                            P.paths.has("") && (M = !0);
                            break;
                          }
                        }
                        if (M) break;
                      }
                    if (!M && C.includes("deps") && P.depsFunction) {
                      const $ = P.depsFunction(a);
                      let k = !1;
                      typeof $ == "boolean" ? $ && (k = !0) : G(P.deps, $) || (P.deps = $, k = !0), k && (M = !0);
                    }
                    M && P.forceUpdate();
                  }
                }
            };
          if (c === "validateZodSchema")
            return () => {
              const l = t.getState().getInitialOptions(e)?.validation, r = t.getState().addValidationError;
              if (!l?.zodSchema)
                throw new Error("Zod schema not found");
              if (!l?.key)
                throw new Error("Validation key not found");
              J(l.key);
              const o = t.getState().cogsStateStore[e];
              try {
                const a = t.getState().getValidationErrors(l.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(l.key) && J(w);
                });
                const d = l.zodSchema.safeParse(o);
                return d.success ? !0 : (d.error.errors.forEach((S) => {
                  const p = S.path, A = S.message, N = [l.key, ...p].join(".");
                  r(N, A);
                }), oe(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return m;
          if (c === "getComponents")
            return () => t().stateComponents.get(e);
          if (c === "getAllFormRefs")
            return () => ye.getState().getFormRefsByStateKey(e);
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
          return () => ye.getState().getFormRef(e + "." + n.join("."));
        if (c === "validationWrapper")
          return ({
            children: l,
            hideMessage: r
          }) => /* @__PURE__ */ me(
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
        if (c === "_stateKey") return e;
        if (c === "_path") return n;
        if (c === "_isServerSynced") return v._isServerSynced;
        if (c === "update")
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
        if (c === "formElement")
          return (l, r) => /* @__PURE__ */ me(
            be,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: l,
              formOpts: r
            }
          );
        const q = [...n, c], b = t.getState().getNestedState(e, q);
        return s(b, q, I);
      }
    }, D = new Proxy(V, _);
    return f.set(U, {
      proxy: D,
      stateVersion: T
    }), D;
  }
  return s(
    t.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return re(Ge, { proxy: e });
}
function Me({
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
  const i = ee(null), m = `${e._stateKey}-${e._path.join(".")}`;
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
    const U = document.createTextNode(String(I));
    u.replaceWith(U);
  }, [e._stateKey, e._path.join("."), e._effect]), re("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function tt(e) {
  const i = ke(
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
  return re("text", {}, String(i));
}
export {
  ce as $cogsSignal,
  tt as $cogsSignalStore,
  Qe as addStateOptions,
  Ke as createCogsState,
  et as notifyComponent,
  De as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
