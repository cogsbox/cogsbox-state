"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as le, useRef as K, useEffect as de, useLayoutEffect as Te, useMemo as ke, createElement as ne, useSyncExternalStore as Ne, startTransition as Ae } from "react";
import { transformStateFunc as Ve, isDeepEqual as G, isFunction as q, getNestedValue as D, getDifferences as he, debounce as _e } from "./utility.js";
import { pushFunc as se, updateFn as H, cutFunc as Q, ValidationWrapper as pe, FormControlComponent as Ce } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as me } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as be } from "fast-json-patch";
function ye(e, i) {
  const m = n.getState().getInitialOptions, u = n.getState().setInitialStateOptions, f = m(e) || {};
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
  const u = B(e) || {}, f = m[e] || {}, T = n.getState().setInitialStateOptions, h = { ...f, ...u };
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
  const [u, f] = Ve(m);
  (Object.keys(f).length > 0 || i && Object.keys(i).length > 0) && Object.keys(f).forEach((v) => {
    f[v] = f[v] || {}, f[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...f[v].formElements || {}
      // State-specific overrides
    }, B(v) || n.getState().setInitialStateOptions(v, f[v]);
  }), n.getState().setInitialStates(u), n.getState().setCreatedState(u);
  const T = (v, s) => {
    const [y] = le(s?.componentId ?? ue());
    ve({
      stateKey: v,
      options: s,
      initialOptionsPart: f
    });
    const t = n.getState().cogsStateStore[v] || u[v], I = s?.modifyState ? s.modifyState(t) : t, [O, V] = De(
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
  setState: z,
  getInitialOptions: B,
  getKeyState: Ee,
  getValidationErrors: xe,
  setStateLog: Oe,
  updateInitialStateGlobal: ge,
  addValidationError: Fe,
  removeValidationError: L,
  setServerSyncActions: Re
} = n.getState(), Ie = (e, i, m, u, f) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    u
  );
  const T = q(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
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
  const m = n.getState().cogsStateStore[e], { sessionId: u } = we(), f = q(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (f && u) {
    const T = re(
      `${u}-${e}-${f}`
    );
    if (T && T.lastUpdated > (T.lastSyncedWithServer || 0))
      return z(e, T.state), Y(e), !0;
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
  ge(e, h.initialState), ee(e, h.updaterState), z(e, h.state);
}, Y = (e) => {
  const i = n.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || m.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((u) => u());
  });
}, et = (e, i) => {
  const m = n.getState().stateComponents.get(e);
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
        oldValue: D(i, u),
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
        oldValue: D(i, u),
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
  dependencies: t,
  serverState: I
} = {}) {
  const [O, V] = le({}), { sessionId: _ } = we();
  let F = !i;
  const [g] = le(i ?? ue()), c = n.getState().stateLog[g], Z = K(/* @__PURE__ */ new Set()), W = K(v ?? ue()), p = K(
    null
  );
  p.current = B(g) ?? null, de(() => {
    if (y && y.stateKey === g && y.path?.[0]) {
      z(g, (a) => ({
        ...a,
        [y.path[0]]: y.newValue
      }));
      const o = `${y.stateKey}:${y.path.join(".")}`;
      n.getState().setSyncInfo(o, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), de(() => {
    if (s) {
      ye(g, {
        initialState: s
      });
      const o = p.current, l = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, w = n.getState().initialStateGlobal[g];
      if (!(w && !G(w, s) || !w) && !l)
        return;
      let E = null;
      const N = q(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      N && _ && (E = re(`${_}-${g}-${N}`));
      let A = s, j = !1;
      const J = l ? Date.now() : 0, X = E?.lastUpdated || 0, ae = E?.lastSyncedWithServer || 0;
      l && J > X ? (A = o.serverState.data, j = !0) : E && X > ae && (A = E.state, o?.localStorage?.onChange && o?.localStorage?.onChange(A)), $e(
        g,
        s,
        A,
        d,
        W.current,
        _
      ), j && N && _ && Ie(A, g, o, _, Date.now()), Y(g), (Array.isArray(h) ? h : [h || "component"]).includes("none") || V({});
    }
  }, [
    s,
    I?.status,
    I?.data,
    ...t || []
  ]), Te(() => {
    F && ye(g, {
      serverSync: m,
      formElements: f,
      initialState: s,
      localStorage: u,
      middleware: p.current?.middleware
    });
    const o = `${g}////${W.current}`, a = n.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: T || void 0,
      reactiveType: h ?? ["component", "deps"]
    }), n.getState().stateComponents.set(g, a), V({}), () => {
      const l = `${g}////${W.current}`;
      a && (a.components.delete(l), a.components.size === 0 && n.getState().stateComponents.delete(g));
    };
  }, []);
  const d = (o, a, l, w) => {
    if (Array.isArray(a)) {
      const S = `${g}-${a.join(".")}`;
      Z.current.add(S);
    }
    z(g, (S) => {
      const E = q(o) ? o(S) : o, N = `${g}-${a.join(".")}`;
      if (N) {
        let U = !1, k = n.getState().signalDomElements.get(N);
        if ((!k || k.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const b = a.slice(0, -1), R = D(E, b);
          if (Array.isArray(R)) {
            U = !0;
            const $ = `${g}-${b.join(".")}`;
            k = n.getState().signalDomElements.get($);
          }
        }
        if (k) {
          const b = U ? D(E, a.slice(0, -1)) : D(E, a);
          k.forEach(({ parentId: R, position: $, effect: P }) => {
            const C = document.querySelector(
              `[data-parent-id="${R}"]`
            );
            if (C) {
              const M = Array.from(C.childNodes);
              if (M[$]) {
                const x = P ? new Function("state", `return (${P})(state)`)(b) : b;
                M[$].textContent = String(x);
              }
            }
          });
        }
      }
      l.updateType === "update" && (w || p.current?.validation?.key) && a && L(
        (w || p.current?.validation?.key) + "." + a.join(".")
      );
      const A = a.slice(0, a.length - 1);
      l.updateType === "cut" && p.current?.validation?.key && L(
        p.current?.validation?.key + "." + A.join(".")
      ), l.updateType === "insert" && p.current?.validation?.key && xe(
        p.current?.validation?.key + "." + A.join(".")
      ).filter(([k, b]) => {
        let R = k?.split(".").length;
        if (k == A.join(".") && R == A.length - 1) {
          let $ = k + "." + A;
          L(k), Fe($, b);
        }
      });
      const j = n.getState().stateComponents.get(g);
      if (j) {
        const U = he(S, E), k = new Set(U), b = l.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          R,
          $
        ] of j.components.entries()) {
          let P = !1;
          const C = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (C.includes("component") && (($.paths.has(b) || $.paths.has("")) && (P = !0), !P))
              for (const M of k) {
                let x = M;
                for (; ; ) {
                  if ($.paths.has(x)) {
                    P = !0;
                    break;
                  }
                  const ie = x.lastIndexOf(".");
                  if (ie !== -1) {
                    const fe = x.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(x.substring(ie + 1))
                    ) && $.paths.has(fe)) {
                      P = !0;
                      break;
                    }
                    x = fe;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (P) break;
              }
            if (!P && C.includes("deps") && $.depsFunction) {
              const M = $.depsFunction(E);
              let x = !1;
              typeof M == "boolean" ? M && (x = !0) : G($.deps, M) || ($.deps = M, x = !0), x && (P = !0);
            }
            P && $.forceUpdate();
          }
        }
      }
      const J = Date.now();
      a = a.map((U, k) => {
        const b = a.slice(0, -1), R = D(E, b);
        return k === a.length - 1 && ["insert", "cut"].includes(l.updateType) ? (R.length - 1).toString() : U;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        l.updateType,
        S,
        E,
        a
      );
      const { oldValue: X, newValue: ae } = Ue(
        l.updateType,
        S,
        E,
        a
      ), oe = {
        timeStamp: J,
        stateKey: g,
        path: a,
        updateType: l.updateType,
        status: "new",
        oldValue: X,
        newValue: ae
      };
      if (Oe(g, (U) => {
        const b = [...U ?? [], oe].reduce((R, $) => {
          const P = `${$.stateKey}:${JSON.stringify($.path)}`, C = R.get(P);
          return C ? (C.timeStamp = Math.max(C.timeStamp, $.timeStamp), C.newValue = $.newValue, C.oldValue = C.oldValue ?? $.oldValue, C.updateType = $.updateType) : R.set(P, { ...$ }), R;
        }, /* @__PURE__ */ new Map());
        return Array.from(b.values());
      }), Ie(
        E,
        g,
        p.current,
        _
      ), p.current?.middleware && p.current.middleware({
        updateLog: c,
        update: oe
      }), p.current?.serverSync) {
        const U = n.getState().serverState[g], k = p.current?.serverSync;
        Re(g, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: E }),
          rollBackState: U,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  n.getState().updaterState[g] || (ee(
    g,
    te(
      g,
      d,
      W.current,
      _
    )
  ), n.getState().cogsStateStore[g] || z(g, e), n.getState().initialStateGlobal[g] || ge(g, e));
  const r = ke(() => te(
    g,
    d,
    W.current,
    _
  ), [g]);
  return [Ee(g), r];
}
function te(e, i, m, u) {
  const f = /* @__PURE__ */ new Map();
  let T = 0;
  const h = (y) => {
    const t = y.join(".");
    for (const [I] of f)
      (I === t || I.startsWith(t + ".")) && f.delete(I);
    T++;
  }, v = {
    removeValidation: (y) => {
      y?.validationKey && L(y.validationKey);
    },
    revertToInitialState: (y) => {
      const t = n.getState().getInitialOptions(e)?.validation;
      t?.key && L(t?.key), y?.validationKey && L(y.validationKey);
      const I = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), f.clear(), T++;
      const O = s(I, []), V = B(e), _ = q(V?.localStorage?.key) ? V?.localStorage?.key(I) : V?.localStorage?.key, F = `${u}-${e}-${_}`;
      F && localStorage.removeItem(F), ee(e, O), z(e, I);
      const g = n.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), I;
    },
    updateInitialState: (y) => {
      f.clear(), T++;
      const t = te(
        e,
        i,
        m,
        u
      ), I = n.getState().initialStateGlobal[e], O = B(e), V = q(O?.localStorage?.key) ? O?.localStorage?.key(I) : O?.localStorage?.key, _ = `${u}-${e}-${V}`;
      return console.log("removing storage", _), localStorage.getItem(_) && localStorage.removeItem(_), Ae(() => {
        ge(e, y), ee(e, t), z(e, y);
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
      const y = n.getState().serverState[e];
      return !!(y && G(y, Ee(e)));
    }
  };
  function s(y, t = [], I) {
    const O = t.map(String).join(".");
    f.get(O);
    const V = function() {
      return n().getNestedState(e, t);
    };
    Object.keys(v).forEach((g) => {
      V[g] = v[g];
    });
    const _ = {
      apply(g, c, Z) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, t);
      },
      get(g, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const d = t.join("."), r = `${e}////${m}`, o = n.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (t.length > 0 || c === "get") && a.paths.add(d);
          }
        }
        if (c === "getDifferences")
          return () => he(
            n.getState().cogsStateStore[e],
            n.getState().initialStateGlobal[e]
          );
        if (c === "sync" && t.length === 0)
          return async function() {
            const d = n.getState().getInitialOptions(e), r = d?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = n.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const l = await r.action(o);
              if (l && !l.success && l.errors && a) {
                n.getState().removeValidationError(a), l.errors.forEach((S) => {
                  const E = [a, ...S.path].join(".");
                  n.getState().addValidationError(E, S.message);
                });
                const w = n.getState().stateComponents.get(e);
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
          const d = n.getState().getNestedState(e, t), r = n.getState().initialStateGlobal[e], o = D(r, t);
          return G(d, o) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const d = n().getNestedState(
              e,
              t
            ), r = n.getState().initialStateGlobal[e], o = D(r, t);
            return G(d, o) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const d = n.getState().initialStateGlobal[e], r = B(e), o = q(r?.localStorage?.key) ? r?.localStorage?.key(d) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const d = n.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(d.key + "." + t.join("."));
          };
        if (Array.isArray(y)) {
          const d = () => I?.validIndices ? y.map((o, a) => ({
            item: o,
            originalIndex: I.validIndices[a]
          })) : n.getState().getNestedState(e, t).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (c === "getSelected")
            return () => {
              const r = n.getState().getSelectedIndex(e, t.join("."));
              if (r !== void 0)
                return s(
                  y[r],
                  [...t, r.toString()],
                  I
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
              const a = [...d()].sort(
                (S, E) => r(S.item, E.item)
              ), l = a.map(({ item: S }) => S), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: S }) => S
                )
              };
              return s(l, t, w);
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
              return s(l, t, w);
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (r) => y.map((a, l) => {
              let w;
              I?.validIndices && I.validIndices[l] !== void 0 ? w = I.validIndices[l] : w = l;
              const S = [...t, w.toString()], E = s(a, S, I);
              return r(
                a,
                E,
                l,
                y,
                s(y, t, I)
              );
            });
          if (c === "$stateMap")
            return (r) => ne(Me, {
              proxy: {
                _stateKey: e,
                _path: t,
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
                [...t, "[*]", r],
                I
              );
            };
          if (c === "index")
            return (r) => {
              const o = y[r];
              return s(o, [...t, r.toString()]);
            };
          if (c === "last")
            return () => {
              const r = n.getState().getNestedState(e, t);
              if (r.length === 0) return;
              const o = r.length - 1, a = r[o], l = [...t, o.toString()];
              return s(a, l);
            };
          if (c === "insert")
            return (r) => (h(t), se(i, r, t, e), s(
              n.getState().getNestedState(e, t),
              t
            ));
          if (c === "uniqueInsert")
            return (r, o, a) => {
              const l = n.getState().getNestedState(e, t), w = q(r) ? r(l) : r;
              let S = null;
              if (!l.some((N) => {
                if (o) {
                  const j = o.every(
                    (J) => G(N[J], w[J])
                  );
                  return j && (S = N), j;
                }
                const A = G(N, w);
                return A && (S = N), A;
              }))
                h(t), se(i, w, t, e);
              else if (a && S) {
                const N = a(S), A = l.map(
                  (j) => G(j, S) ? N : j
                );
                h(t), H(i, A, t);
              }
            };
          if (c === "cut")
            return (r, o) => {
              if (!o?.waitForSync)
                return h(t), Q(i, t, e, r), s(
                  n.getState().getNestedState(e, t),
                  t
                );
            };
          if (c === "cutByValue")
            return (r) => {
              for (let o = 0; o < y.length; o++)
                y[o] === r && Q(i, t, e, o);
            };
          if (c === "toggleByValue")
            return (r) => {
              const o = y.findIndex((a) => a === r);
              o > -1 ? Q(i, t, e, o) : se(i, r, t, e);
            };
          if (c === "stateFind")
            return (r) => {
              const a = d().find(
                ({ item: w }, S) => r(w, S)
              );
              if (!a) return;
              const l = [...t, a.originalIndex.toString()];
              return s(a.item, l, I);
            };
          if (c === "findWith")
            return (r, o) => {
              const l = d().find(
                ({ item: S }) => S[r] === o
              );
              if (!l) return;
              const w = [...t, l.originalIndex.toString()];
              return s(l.item, w, I);
            };
        }
        const Z = t[t.length - 1];
        if (!isNaN(Number(Z))) {
          const d = t.slice(0, -1), r = n.getState().getNestedState(e, d);
          if (Array.isArray(r) && c === "cut")
            return () => Q(
              i,
              d,
              e,
              Number(Z)
            );
        }
        if (c === "get")
          return () => n.getState().getNestedState(e, t);
        if (c === "$derive")
          return (d) => ce({
            _stateKey: e,
            _path: t,
            _effect: d.toString()
          });
        if (c === "$derive")
          return (d) => ce({
            _stateKey: e,
            _path: t,
            _effect: d.toString()
          });
        if (c === "$get")
          return () => ce({
            _stateKey: e,
            _path: t
          });
        if (c === "lastSynced") {
          const d = `${e}:${t.join(".")}`;
          return n.getState().getSyncInfo(d);
        }
        if (c == "getLocalStorage")
          return (d) => re(u + "-" + e + "-" + d);
        if (c === "_selected") {
          const d = t.slice(0, -1), r = d.join("."), o = n.getState().getNestedState(e, d);
          return Array.isArray(o) ? Number(t[t.length - 1]) === n.getState().getSelectedIndex(e, r) : void 0;
        }
        if (c === "setSelected")
          return (d) => {
            const r = t.slice(0, -1), o = Number(t[t.length - 1]), a = r.join(".");
            d ? n.getState().setSelectedIndex(e, a, o) : n.getState().setSelectedIndex(e, a, void 0);
            const l = n.getState().getNestedState(e, [...r]);
            H(i, l, r), h(r);
          };
        if (c === "toggleSelected")
          return () => {
            const d = t.slice(0, -1), r = Number(t[t.length - 1]), o = d.join("."), a = n.getState().getSelectedIndex(e, o);
            n.getState().setSelectedIndex(
              e,
              o,
              a === r ? void 0 : r
            );
            const l = n.getState().getNestedState(e, [...d]);
            H(i, l, d), h(d);
          };
        if (t.length == 0) {
          if (c === "applyJsonPatch")
            return (d) => {
              const r = n.getState().cogsStateStore[e], a = be(r, d).newDocument, l = `${e}////${m}`, w = n.getState().stateComponents.get(e), S = w?.components.get(l), E = S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : ["component"];
              if ($e(
                e,
                n.getState().initialStateGlobal[e],
                // Keep existing initial state
                a,
                i,
                m,
                u
              ), Y(e), !E.includes("none")) {
                const N = w?.components.get(l);
                N && N.forceUpdate();
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const d = n.getState().getInitialOptions(e)?.validation, r = n.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              L(d.key);
              const o = n.getState().cogsStateStore[e];
              try {
                const a = n.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(d.key) && L(w);
                });
                const l = d.zodSchema.safeParse(o);
                return l.success ? !0 : (l.error.errors.forEach((S) => {
                  const E = S.path, N = S.message, A = [d.key, ...E].join(".");
                  r(A, N);
                }), Y(e), !1);
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
            return v.revertToInitialState;
          if (c === "updateInitialState") return v.updateInitialState;
          if (c === "removeValidation") return v.removeValidation;
        }
        if (c === "getFormRef")
          return () => me.getState().getFormRef(e + "." + t.join("."));
        if (c === "validationWrapper")
          return ({
            children: d,
            hideMessage: r
          }) => /* @__PURE__ */ Se(
            pe,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: I?.validIndices,
              children: d
            }
          );
        if (c === "_stateKey") return e;
        if (c === "_path") return t;
        if (c === "_isServerSynced") return v._isServerSynced;
        if (c === "update")
          return (d, r) => {
            if (r?.debounce)
              _e(() => {
                H(i, d, t, "");
                const o = n.getState().getNestedState(e, t);
                r?.afterUpdate && r.afterUpdate(o);
              }, r.debounce);
            else {
              H(i, d, t, "");
              const o = n.getState().getNestedState(e, t);
              r?.afterUpdate && r.afterUpdate(o);
            }
            h(t);
          };
        if (c === "formElement")
          return (d, r) => /* @__PURE__ */ Se(
            Ce,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: d,
              formOpts: r
            }
          );
        const W = [...t, c], p = n.getState().getNestedState(e, W);
        return s(p, W, I);
      }
    }, F = new Proxy(V, _);
    return f.set(O, {
      proxy: F,
      stateVersion: T
    }), F;
  }
  return s(
    n.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return ne(Ge, { proxy: e });
}
function Me({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = n().getNestedState(e._stateKey, e._path);
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
    n.getState().addSignalElement(m, y);
    const t = n.getState().getNestedState(e._stateKey, e._path);
    let I;
    if (e._effect)
      try {
        I = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), I = t;
      }
    else
      I = t;
    I !== null && typeof I == "object" && (I = JSON.stringify(I));
    const O = document.createTextNode(String(I));
    u.replaceWith(O);
  }, [e._stateKey, e._path.join("."), e._effect]), ne("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function tt(e) {
  const i = Ne(
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
  return ne("text", {}, String(i));
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
