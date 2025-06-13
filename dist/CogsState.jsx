"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as le, useRef as Q, useEffect as de, useLayoutEffect as $e, useMemo as ke, createElement as te, useSyncExternalStore as Ne, startTransition as Ae } from "react";
import { transformStateFunc as Te, isDeepEqual as W, isFunction as q, getNestedValue as D, getDifferences as he, debounce as Ve } from "./utility.js";
import { pushFunc as se, updateFn as H, cutFunc as X, ValidationWrapper as _e, FormControlComponent as pe } from "./Functions.jsx";
import Ce from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as me } from "./store.js";
import { useCogsConfig as Ee } from "./CogsStateClient.jsx";
import { applyPatch as be } from "fast-json-patch";
function ye(e, s) {
  const y = n.getState().getInitialOptions, u = n.getState().setInitialStateOptions, S = y(e) || {};
  u(e, {
    ...S,
    ...s
  });
}
function ve({
  stateKey: e,
  options: s,
  initialOptionsPart: y
}) {
  const u = B(e) || {}, S = y[e] || {}, k = n.getState().setInitialStateOptions, E = { ...S, ...u };
  let v = !1;
  if (s)
    for (const i in s)
      E.hasOwnProperty(i) ? (i == "localStorage" && s[i] && E[i].key !== s[i]?.key && (v = !0, E[i] = s[i]), i == "initialState" && s[i] && E[i] !== s[i] && // Different references
      !W(E[i], s[i]) && (v = !0, E[i] = s[i])) : (v = !0, E[i] = s[i]);
  v && k(e, E);
}
function Qe(e, { formElements: s, validation: y }) {
  return { initialState: e, formElements: s, validation: y };
}
const Ke = (e, s) => {
  let y = e;
  const [u, S] = Te(y);
  (Object.keys(S).length > 0 || s && Object.keys(s).length > 0) && Object.keys(S).forEach((v) => {
    S[v] = S[v] || {}, S[v].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...S[v].formElements || {}
      // State-specific overrides
    }, B(v) || n.getState().setInitialStateOptions(v, S[v]);
  }), n.getState().setInitialStates(u), n.getState().setCreatedState(u);
  const k = (v, i) => {
    const [m] = le(i?.componentId ?? ue());
    ve({
      stateKey: v,
      options: i,
      initialOptionsPart: S
    });
    const t = n.getState().cogsStateStore[v] || u[v], I = i?.modifyState ? i.modifyState(t) : t, [O, T] = De(
      I,
      {
        stateKey: v,
        syncUpdate: i?.syncUpdate,
        componentId: m,
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
    return T;
  };
  function E(v, i) {
    ve({ stateKey: v, options: i, initialOptionsPart: S }), i.localStorage && Fe(v, i), re(v);
  }
  return { useCogsState: k, setCogsOptions: E };
}, {
  setUpdaterState: K,
  setState: z,
  getInitialOptions: B,
  getKeyState: we,
  getValidationErrors: xe,
  setStateLog: Pe,
  updateInitialStateGlobal: ge,
  addValidationError: Oe,
  removeValidationError: L,
  setServerSyncActions: je
} = n.getState(), Ie = (e, s, y, u, S) => {
  y?.log && console.log(
    "saving to localstorage",
    s,
    y.localStorage?.key,
    u
  );
  const k = q(y?.localStorage?.key) ? y.localStorage?.key(e) : y?.localStorage?.key;
  if (k && u) {
    const E = `${u}-${s}-${k}`;
    let v;
    try {
      v = ne(E)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: S ?? v
    }, m = Ce.serialize(i);
    window.localStorage.setItem(
      E,
      JSON.stringify(m.json)
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
}, Fe = (e, s) => {
  const y = n.getState().cogsStateStore[e], { sessionId: u } = Ee(), S = q(s?.localStorage?.key) ? s.localStorage.key(y) : s?.localStorage?.key;
  if (S && u) {
    const k = ne(
      `${u}-${e}-${S}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return z(e, k.state), re(e), !0;
  }
  return !1;
}, Ue = (e, s, y, u, S, k) => {
  const E = {
    initialState: s,
    updaterState: ee(
      e,
      u,
      S,
      k
    ),
    state: y
  };
  ge(e, E.initialState), K(e, E.updaterState), z(e, E.state);
}, re = (e) => {
  const s = n.getState().stateComponents.get(e);
  if (!s) return;
  const y = /* @__PURE__ */ new Set();
  s.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || y.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((u) => u());
  });
}, et = (e, s) => {
  const y = n.getState().stateComponents.get(e);
  if (y) {
    const u = `${e}////${s}`, S = y.components.get(u);
    if ((S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none"))
      return;
    S && S.forceUpdate();
  }
}, Re = (e, s, y, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: D(s, u),
        newValue: D(y, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: D(y, u)
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
  serverSync: y,
  localStorage: u,
  formElements: S,
  reactiveDeps: k,
  reactiveType: E,
  componentId: v,
  initialState: i,
  syncUpdate: m,
  dependencies: t,
  serverState: I
} = {}) {
  const [O, T] = le({}), { sessionId: V } = Ee();
  let j = !s;
  const [g] = le(s ?? ue()), l = n.getState().stateLog[g], Z = Q(/* @__PURE__ */ new Set()), G = Q(v ?? ue()), _ = Q(
    null
  );
  _.current = B(g) ?? null, de(() => {
    if (m && m.stateKey === g && m.path?.[0]) {
      z(g, (a) => ({
        ...a,
        [m.path[0]]: m.newValue
      }));
      const o = `${m.stateKey}:${m.path.join(".")}`;
      n.getState().setSyncInfo(o, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), de(() => {
    if (i) {
      ye(g, {
        initialState: i
      });
      const o = _.current, c = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, w = n.getState().initialStateGlobal[g];
      if (!(w && !W(w, i) || !w) && !c)
        return;
      let h = null;
      const p = q(o?.localStorage?.key) ? o?.localStorage?.key(i) : o?.localStorage?.key;
      p && V && (h = ne(`${V}-${g}-${p}`));
      let A = i, U = !1;
      const J = c ? Date.now() : 0, Y = h?.lastUpdated || 0, ae = h?.lastSyncedWithServer || 0;
      c && J > Y ? (A = o.serverState.data, U = !0) : h && Y > ae && (A = h.state, o?.localStorage?.onChange && o?.localStorage?.onChange(A)), Ue(
        g,
        i,
        A,
        d,
        G.current,
        V
      ), U && p && V && Ie(A, g, o, V, Date.now()), re(g), (Array.isArray(E) ? E : [E || "component"]).includes("none") || T({});
    }
  }, [
    i,
    I?.status,
    I?.data,
    ...t || []
  ]), $e(() => {
    j && ye(g, {
      serverSync: y,
      formElements: S,
      initialState: i,
      localStorage: u,
      middleware: _.current?.middleware
    });
    const o = `${g}////${G.current}`, a = n.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), n.getState().stateComponents.set(g, a), T({}), () => {
      const c = `${g}////${G.current}`;
      a && (a.components.delete(c), a.components.size === 0 && n.getState().stateComponents.delete(g));
    };
  }, []);
  const d = (o, a, c, w) => {
    if (Array.isArray(a)) {
      const f = `${g}-${a.join(".")}`;
      Z.current.add(f);
    }
    z(g, (f) => {
      const h = q(o) ? o(f) : o, p = `${g}-${a.join(".")}`;
      if (p) {
        let R = !1, N = n.getState().signalDomElements.get(p);
        if ((!N || N.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const x = a.slice(0, -1), F = D(h, x);
          if (Array.isArray(F)) {
            R = !0;
            const $ = `${g}-${x.join(".")}`;
            N = n.getState().signalDomElements.get($);
          }
        }
        if (N) {
          const x = R ? D(h, a.slice(0, -1)) : D(h, a);
          N.forEach(({ parentId: F, position: $, effect: b }) => {
            const C = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if (C) {
              const M = Array.from(C.childNodes);
              if (M[$]) {
                const P = b ? new Function("state", `return (${b})(state)`)(x) : x;
                M[$].textContent = String(P);
              }
            }
          });
        }
      }
      c.updateType === "update" && (w || _.current?.validation?.key) && a && L(
        (w || _.current?.validation?.key) + "." + a.join(".")
      );
      const A = a.slice(0, a.length - 1);
      c.updateType === "cut" && _.current?.validation?.key && L(
        _.current?.validation?.key + "." + A.join(".")
      ), c.updateType === "insert" && _.current?.validation?.key && xe(
        _.current?.validation?.key + "." + A.join(".")
      ).filter(([N, x]) => {
        let F = N?.split(".").length;
        if (N == A.join(".") && F == A.length - 1) {
          let $ = N + "." + A;
          L(N), Oe($, x);
        }
      });
      const U = n.getState().stateComponents.get(g);
      if (U) {
        const R = he(f, h), N = new Set(R), x = c.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          F,
          $
        ] of U.components.entries()) {
          let b = !1;
          const C = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (C.includes("component") && (($.paths.has(x) || $.paths.has("")) && (b = !0), !b))
              for (const M of N) {
                let P = M;
                for (; ; ) {
                  if ($.paths.has(P)) {
                    b = !0;
                    break;
                  }
                  const ie = P.lastIndexOf(".");
                  if (ie !== -1) {
                    const fe = P.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(P.substring(ie + 1))
                    ) && $.paths.has(fe)) {
                      b = !0;
                      break;
                    }
                    P = fe;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (b) break;
              }
            if (!b && C.includes("deps") && $.depsFunction) {
              const M = $.depsFunction(h);
              let P = !1;
              typeof M == "boolean" ? M && (P = !0) : W($.deps, M) || ($.deps = M, P = !0), P && (b = !0);
            }
            b && $.forceUpdate();
          }
        }
      }
      const J = Date.now();
      a = a.map((R, N) => {
        const x = a.slice(0, -1), F = D(h, x);
        return N === a.length - 1 && ["insert", "cut"].includes(c.updateType) ? (F.length - 1).toString() : R;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        c.updateType,
        f,
        h,
        a
      );
      const { oldValue: Y, newValue: ae } = Re(
        c.updateType,
        f,
        h,
        a
      ), oe = {
        timeStamp: J,
        stateKey: g,
        path: a,
        updateType: c.updateType,
        status: "new",
        oldValue: Y,
        newValue: ae
      };
      if (Pe(g, (R) => {
        const x = [...R ?? [], oe].reduce((F, $) => {
          const b = `${$.stateKey}:${JSON.stringify($.path)}`, C = F.get(b);
          return C ? (C.timeStamp = Math.max(C.timeStamp, $.timeStamp), C.newValue = $.newValue, C.oldValue = C.oldValue ?? $.oldValue, C.updateType = $.updateType) : F.set(b, { ...$ }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), Ie(
        h,
        g,
        _.current,
        V
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: oe
      }), _.current?.serverSync) {
        const R = n.getState().serverState[g], N = _.current?.serverSync;
        je(g, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: h }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return h;
    });
  };
  n.getState().updaterState[g] || (K(
    g,
    ee(
      g,
      d,
      G.current,
      V
    )
  ), n.getState().cogsStateStore[g] || z(g, e), n.getState().initialStateGlobal[g] || ge(g, e));
  const r = ke(() => ee(
    g,
    d,
    G.current,
    V
  ), [g]);
  return [we(g), r];
}
function ee(e, s, y, u) {
  const S = /* @__PURE__ */ new Map();
  let k = 0;
  const E = (m) => {
    const t = m.join(".");
    for (const [I] of S)
      (I === t || I.startsWith(t + ".")) && S.delete(I);
    k++;
  }, v = {
    removeValidation: (m) => {
      m?.validationKey && L(m.validationKey);
    },
    revertToInitialState: (m) => {
      const t = n.getState().getInitialOptions(e)?.validation;
      t?.key && L(t?.key), m?.validationKey && L(m.validationKey);
      const I = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), S.clear(), k++;
      const O = i(I, []), T = B(e), V = q(T?.localStorage?.key) ? T?.localStorage?.key(I) : T?.localStorage?.key, j = `${u}-${e}-${V}`;
      j && localStorage.removeItem(j), K(e, O), z(e, I);
      const g = n.getState().stateComponents.get(e);
      return g && g.components.forEach((l) => {
        l.forceUpdate();
      }), I;
    },
    updateInitialState: (m) => {
      S.clear(), k++;
      const t = ee(
        e,
        s,
        y,
        u
      ), I = n.getState().initialStateGlobal[e], O = B(e), T = q(O?.localStorage?.key) ? O?.localStorage?.key(I) : O?.localStorage?.key, V = `${u}-${e}-${T}`;
      return console.log("removing storage", V), localStorage.getItem(V) && localStorage.removeItem(V), Ae(() => {
        ge(e, m), K(e, t), z(e, m);
        const j = n.getState().stateComponents.get(e);
        j && j.components.forEach((g) => {
          g.forceUpdate();
        });
      }), {
        fetchId: (j) => t.get()[j]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const m = n.getState().serverState[e];
      return !!(m && W(m, we(e)));
    }
  };
  function i(m, t = [], I) {
    const O = t.map(String).join(".");
    S.get(O);
    const T = function() {
      return n().getNestedState(e, t);
    };
    Object.keys(v).forEach((g) => {
      T[g] = v[g];
    });
    const V = {
      apply(g, l, Z) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, t);
      },
      get(g, l) {
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender") {
          const d = t.join("."), r = `${e}////${y}`, o = n.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (t.length > 0 || l === "get") && a.paths.add(d);
          }
        }
        if (l === "getDifferences")
          return () => he(
            n.getState().cogsStateStore[e],
            n.getState().initialStateGlobal[e]
          );
        if (l === "sync" && t.length === 0)
          return async function() {
            const d = n.getState().getInitialOptions(e), r = d?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = n.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const c = await r.action(o);
              if (c && !c.success && c.errors && a) {
                n.getState().removeValidationError(a), c.errors.forEach((f) => {
                  const h = [a, ...f.path].join(".");
                  n.getState().addValidationError(h, f.message);
                });
                const w = n.getState().stateComponents.get(e);
                w && w.components.forEach((f) => {
                  f.forceUpdate();
                });
              }
              return c?.success && r.onSuccess ? r.onSuccess(c.data) : !c?.success && r.onError && r.onError(c.error), c;
            } catch (c) {
              return r.onError && r.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = n.getState().getNestedState(e, t), r = n.getState().initialStateGlobal[e], o = D(r, t);
          return W(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = n().getNestedState(
              e,
              t
            ), r = n.getState().initialStateGlobal[e], o = D(r, t);
            return W(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = n.getState().initialStateGlobal[e], r = B(e), o = q(r?.localStorage?.key) ? r?.localStorage?.key(d) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = n.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(d.key + "." + t.join("."));
          };
        if (Array.isArray(m)) {
          const d = () => I?.validIndices ? m.map((o, a) => ({
            item: o,
            originalIndex: I.validIndices[a]
          })) : n.getState().getNestedState(e, t).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const r = n.getState().getSelectedIndex(e, t.join("."));
              if (r !== void 0)
                return i(
                  m[r],
                  [...t, r.toString()],
                  I
                );
            };
          if (l === "clearSelected")
            return () => {
              n.getState().clearSelectedIndex({ stateKey: e, path: t });
            };
          if (l === "getSelectedIndex")
            return () => n.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (l === "stateSort")
            return (r) => {
              const a = [...d()].sort(
                (f, h) => r(f.item, h.item)
              ), c = a.map(({ item: f }) => f), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: f }) => f
                )
              };
              return i(c, t, w);
            };
          if (l === "stateFilter")
            return (r) => {
              const a = d().filter(
                ({ item: f }, h) => r(f, h)
              ), c = a.map(({ item: f }) => f), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: f }) => f
                )
              };
              return i(c, t, w);
            };
          if (l === "stateMap" || l === "stateMapNoRender")
            return (r) => m.map((a, c) => {
              let w;
              I?.validIndices && I.validIndices[c] !== void 0 ? w = I.validIndices[c] : w = c;
              const f = [...t, w.toString()], h = i(a, f, I);
              return r(
                a,
                h,
                c,
                m,
                i(m, t, I)
              );
            });
          if (l === "$stateMap")
            return (r) => te(Me, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: r
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateFlattenOn")
            return (r) => {
              const o = m;
              S.clear(), k++;
              const a = o.flatMap(
                (c) => c[r] ?? []
              );
              return i(
                a,
                [...t, "[*]", r],
                I
              );
            };
          if (l === "index")
            return (r) => {
              const o = m[r];
              return i(o, [...t, r.toString()]);
            };
          if (l === "last")
            return () => {
              const r = n.getState().getNestedState(e, t);
              if (r.length === 0) return;
              const o = r.length - 1, a = r[o], c = [...t, o.toString()];
              return i(a, c);
            };
          if (l === "insert")
            return (r) => (E(t), se(s, r, t, e), i(
              n.getState().getNestedState(e, t),
              t
            ));
          if (l === "uniqueInsert")
            return (r, o, a) => {
              const c = n.getState().getNestedState(e, t), w = q(r) ? r(c) : r;
              let f = null;
              if (!c.some((p) => {
                if (o) {
                  const U = o.every(
                    (J) => W(p[J], w[J])
                  );
                  return U && (f = p), U;
                }
                const A = W(p, w);
                return A && (f = p), A;
              }))
                E(t), se(s, w, t, e);
              else if (a && f) {
                const p = a(f), A = c.map(
                  (U) => W(U, f) ? p : U
                );
                E(t), H(s, A, t);
              }
            };
          if (l === "cut")
            return (r, o) => {
              if (!o?.waitForSync)
                return E(t), X(s, t, e, r), i(
                  n.getState().getNestedState(e, t),
                  t
                );
            };
          if (l === "cutByValue")
            return (r) => {
              for (let o = 0; o < m.length; o++)
                m[o] === r && X(s, t, e, o);
            };
          if (l === "toggleByValue")
            return (r) => {
              const o = m.findIndex((a) => a === r);
              o > -1 ? X(s, t, e, o) : se(s, r, t, e);
            };
          if (l === "stateFind")
            return (r) => {
              const a = d().find(
                ({ item: w }, f) => r(w, f)
              );
              if (!a) return;
              const c = [...t, a.originalIndex.toString()];
              return i(a.item, c, I);
            };
          if (l === "findWith")
            return (r, o) => {
              const c = d().find(
                ({ item: f }) => f[r] === o
              );
              if (!c) return;
              const w = [...t, c.originalIndex.toString()];
              return i(c.item, w, I);
            };
        }
        const Z = t[t.length - 1];
        if (!isNaN(Number(Z))) {
          const d = t.slice(0, -1), r = n.getState().getNestedState(e, d);
          if (Array.isArray(r) && l === "cut")
            return () => X(
              s,
              d,
              e,
              Number(Z)
            );
        }
        if (l === "get")
          return () => n.getState().getNestedState(e, t);
        if (l === "$derive")
          return (d) => ce({
            _stateKey: e,
            _path: t,
            _effect: d.toString()
          });
        if (l === "$derive")
          return (d) => ce({
            _stateKey: e,
            _path: t,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => ce({
            _stateKey: e,
            _path: t
          });
        if (l === "lastSynced") {
          const d = `${e}:${t.join(".")}`;
          return n.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ne(u + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = t.slice(0, -1), r = d.join("."), o = n.getState().getNestedState(e, d);
          return Array.isArray(o) ? Number(t[t.length - 1]) === n.getState().getSelectedIndex(e, r) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const r = t.slice(0, -1), o = Number(t[t.length - 1]), a = r.join(".");
            d ? n.getState().setSelectedIndex(e, a, o) : n.getState().setSelectedIndex(e, a, void 0);
            const c = n.getState().getNestedState(e, [...r]);
            H(s, c, r), E(r);
          };
        if (l === "toggleSelected")
          return () => {
            const d = t.slice(0, -1), r = Number(t[t.length - 1]), o = d.join("."), a = n.getState().getSelectedIndex(e, o);
            n.getState().setSelectedIndex(
              e,
              o,
              a === r ? void 0 : r
            );
            const c = n.getState().getNestedState(e, [...d]);
            H(s, c, d), E(d);
          };
        if (t.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const r = be(
                n.getState().cogsStateStore[e],
                d
              );
              z(e, r.newDocument);
              const o = /* @__PURE__ */ new Set();
              d.forEach((c) => {
                const w = c.path.slice(1).replace(/\//g, ".");
                o.add(w);
                const f = w.split(".");
                for (let h = 1; h < f.length; h++)
                  o.add(f.slice(0, h).join("."));
              });
              const a = n.getState().stateComponents.get(e);
              a && a.components.forEach((c) => {
                (c.paths.has("") || // root watchers
                Array.from(c.paths).some(
                  (f) => o.has(f) || Array.from(o).some(
                    (h) => f.startsWith(h + ".") || h.startsWith(f + ".")
                  )
                )) && c.forceUpdate();
              });
            };
          if (l === "validateZodSchema")
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
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((f) => {
                  const h = f.path, p = f.message, A = [d.key, ...h].join(".");
                  r(A, p);
                }), re(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return y;
          if (l === "getComponents")
            return () => n().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => me.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return n.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return n.getState().serverState[e];
          if (l === "_isLoading")
            return n.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return v.revertToInitialState;
          if (l === "updateInitialState") return v.updateInitialState;
          if (l === "removeValidation") return v.removeValidation;
        }
        if (l === "getFormRef")
          return () => me.getState().getFormRef(e + "." + t.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: r
          }) => /* @__PURE__ */ Se(
            _e,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: I?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return t;
        if (l === "_isServerSynced") return v._isServerSynced;
        if (l === "update")
          return (d, r) => {
            if (r?.debounce)
              Ve(() => {
                H(s, d, t, "");
                const o = n.getState().getNestedState(e, t);
                r?.afterUpdate && r.afterUpdate(o);
              }, r.debounce);
            else {
              H(s, d, t, "");
              const o = n.getState().getNestedState(e, t);
              r?.afterUpdate && r.afterUpdate(o);
            }
            E(t);
          };
        if (l === "formElement")
          return (d, r) => /* @__PURE__ */ Se(
            pe,
            {
              setState: s,
              stateKey: e,
              path: t,
              child: d,
              formOpts: r
            }
          );
        const G = [...t, l], _ = n.getState().getNestedState(e, G);
        return i(_, G, I);
      }
    }, j = new Proxy(T, V);
    return S.set(O, {
      proxy: j,
      stateVersion: k
    }), j;
  }
  return i(
    n.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return te(We, { proxy: e });
}
function Me({
  proxy: e,
  rebuildStateShape: s
}) {
  const y = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(y) ? s(
    y,
    e._path
  ).stateMapNoRender(
    (S, k, E, v, i) => e._mapFn(S, k, E, v, i)
  ) : null;
}
function We({
  proxy: e
}) {
  const s = Q(null), y = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = s.current;
    if (!u || !u.parentElement) return;
    const S = u.parentElement, E = Array.from(S.childNodes).indexOf(u);
    let v = S.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", v));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: E,
      effect: e._effect
    };
    n.getState().addSignalElement(y, m);
    const t = n.getState().getNestedState(e._stateKey, e._path);
    let I;
    if (e._effect)
      try {
        I = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (T) {
        console.error("Error evaluating effect function during mount:", T), I = t;
      }
    else
      I = t;
    I !== null && typeof I == "object" && (I = JSON.stringify(I));
    const O = document.createTextNode(String(I));
    u.replaceWith(O);
  }, [e._stateKey, e._path.join("."), e._effect]), te("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function tt(e) {
  const s = Ne(
    (y) => {
      const u = n.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: y,
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
  De as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
