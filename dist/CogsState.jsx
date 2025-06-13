"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as le, useRef as Q, useEffect as de, useLayoutEffect as $e, useMemo as ke, createElement as te, useSyncExternalStore as Te, startTransition as Ne } from "react";
import { transformStateFunc as Ae, isDeepEqual as G, isFunction as J, getNestedValue as W, getDifferences as ue, debounce as Ve } from "./utility.js";
import { pushFunc as se, updateFn as Y, cutFunc as X, ValidationWrapper as _e, FormControlComponent as be } from "./Functions.jsx";
import Ce from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as ye } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as Pe } from "fast-json-patch";
function ve(e, i) {
  const S = n.getState().getInitialOptions, u = n.getState().setInitialStateOptions, f = S(e) || {};
  u(e, {
    ...f,
    ...i
  });
}
function Ie({
  stateKey: e,
  options: i,
  initialOptionsPart: S
}) {
  const u = Z(e) || {}, f = S[e] || {}, T = n.getState().setInitialStateOptions, h = { ...f, ...u };
  let v = !1;
  if (i)
    for (const s in i)
      h.hasOwnProperty(s) ? (s == "localStorage" && i[s] && h[s].key !== i[s]?.key && (v = !0, h[s] = i[s]), s == "initialState" && i[s] && h[s] !== i[s] && // Different references
      !G(h[s], i[s]) && (v = !0, h[s] = i[s])) : (v = !0, h[s] = i[s]);
  v && T(e, h);
}
function Qe(e, { formElements: i, validation: S }) {
  return { initialState: e, formElements: i, validation: S };
}
const Ke = (e, i) => {
  let S = e;
  const [u, f] = Ae(S);
  (Object.keys(f).length > 0 || i && Object.keys(i).length > 0) && Object.keys(f).forEach((v) => {
    f[v] = f[v] || {}, f[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...f[v].formElements || {}
      // State-specific overrides
    }, Z(v) || n.getState().setInitialStateOptions(v, f[v]);
  }), n.getState().setInitialStates(u), n.getState().setCreatedState(u);
  const T = (v, s) => {
    const [m] = le(s?.componentId ?? ge());
    Ie({
      stateKey: v,
      options: s,
      initialOptionsPart: f
    });
    const t = n.getState().cogsStateStore[v] || u[v], I = s?.modifyState ? s.modifyState(t) : t, [M, A] = Ue(
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
    return A;
  };
  function h(v, s) {
    Ie({ stateKey: v, options: s, initialOptionsPart: f }), s.localStorage && Me(v, s), re(v);
  }
  return { useCogsState: T, setCogsOptions: h };
}, {
  setUpdaterState: K,
  setState: B,
  getInitialOptions: Z,
  getKeyState: Ee,
  getValidationErrors: xe,
  setStateLog: Oe,
  updateInitialStateGlobal: fe,
  addValidationError: Fe,
  removeValidationError: z,
  setServerSyncActions: Re
} = n.getState(), he = (e, i, S, u, f) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    u
  );
  const T = J(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (T && u) {
    const h = `${u}-${i}-${T}`;
    let v;
    try {
      v = ne(h)?.lastSyncedWithServer;
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
}, ne = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Me = (e, i) => {
  const S = n.getState().cogsStateStore[e], { sessionId: u } = we(), f = J(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (f && u) {
    const T = ne(
      `${u}-${e}-${f}`
    );
    if (T && T.lastUpdated > (T.lastSyncedWithServer || 0))
      return B(e, T.state), re(e), !0;
  }
  return !1;
}, pe = (e, i, S, u, f, T) => {
  const h = {
    initialState: i,
    updaterState: ee(
      e,
      u,
      f,
      T
    ),
    state: S
  };
  fe(e, h.initialState), K(e, h.updaterState), B(e, h.state);
}, re = (e) => {
  const i = n.getState().stateComponents.get(e);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((u) => u());
  });
}, et = (e, i) => {
  const S = n.getState().stateComponents.get(e);
  if (S) {
    const u = `${e}////${i}`, f = S.components.get(u);
    if ((f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none"))
      return;
    f && f.forceUpdate();
  }
}, je = (e, i, S, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: W(i, u),
        newValue: W(S, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: W(S, u)
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
function Ue(e, {
  stateKey: i,
  serverSync: S,
  localStorage: u,
  formElements: f,
  reactiveDeps: T,
  reactiveType: h,
  componentId: v,
  initialState: s,
  syncUpdate: m,
  dependencies: t,
  serverState: I
} = {}) {
  const [M, A] = le({}), { sessionId: V } = we();
  let j = !i;
  const [g] = le(i ?? ge()), c = n.getState().stateLog[g], H = Q(/* @__PURE__ */ new Set()), q = Q(v ?? ge()), _ = Q(
    null
  );
  _.current = Z(g) ?? null, de(() => {
    if (m && m.stateKey === g && m.path?.[0]) {
      B(g, (a) => ({
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
    if (s) {
      ve(g, {
        initialState: s
      });
      const o = _.current, l = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, w = n.getState().initialStateGlobal[g];
      if (!(w && !G(w, s) || !w) && !l)
        return;
      let E = null;
      const p = J(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      p && V && (E = ne(`${V}-${g}-${p}`));
      let k = s, b = !1;
      const P = l ? Date.now() : 0, x = E?.lastUpdated || 0, ae = E?.lastSyncedWithServer || 0;
      l && P > x ? (k = o.serverState.data, b = !0) : E && x > ae && (k = E.state, o?.localStorage?.onChange && o?.localStorage?.onChange(k)), pe(
        g,
        s,
        k,
        d,
        q.current,
        V
      ), b && p && V && he(k, g, o, V, Date.now()), re(g), (Array.isArray(h) ? h : [h || "component"]).includes("none") || A({});
    }
  }, [
    s,
    I?.status,
    I?.data,
    ...t || []
  ]), $e(() => {
    j && ve(g, {
      serverSync: S,
      formElements: f,
      initialState: s,
      localStorage: u,
      middleware: _.current?.middleware
    });
    const o = `${g}////${q.current}`, a = n.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => A({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: T || void 0,
      reactiveType: h ?? ["component", "deps"]
    }), n.getState().stateComponents.set(g, a), A({}), () => {
      const l = `${g}////${q.current}`;
      a && (a.components.delete(l), a.components.size === 0 && n.getState().stateComponents.delete(g));
    };
  }, []);
  const d = (o, a, l, w) => {
    if (Array.isArray(a)) {
      const y = `${g}-${a.join(".")}`;
      H.current.add(y);
    }
    B(g, (y) => {
      const E = J(o) ? o(y) : o, p = `${g}-${a.join(".")}`;
      if (p) {
        let D = !1, N = n.getState().signalDomElements.get(p);
        if ((!N || N.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const F = a.slice(0, -1), U = W(E, F);
          if (Array.isArray(U)) {
            D = !0;
            const $ = `${g}-${F.join(".")}`;
            N = n.getState().signalDomElements.get($);
          }
        }
        if (N) {
          const F = D ? W(E, a.slice(0, -1)) : W(E, a);
          N.forEach(({ parentId: U, position: $, effect: O }) => {
            const C = document.querySelector(
              `[data-parent-id="${U}"]`
            );
            if (C) {
              const L = Array.from(C.childNodes);
              if (L[$]) {
                const R = O ? new Function("state", `return (${O})(state)`)(F) : F;
                L[$].textContent = String(R);
              }
            }
          });
        }
      }
      l.updateType === "update" && (w || _.current?.validation?.key) && a && z(
        (w || _.current?.validation?.key) + "." + a.join(".")
      );
      const k = a.slice(0, a.length - 1);
      l.updateType === "cut" && _.current?.validation?.key && z(
        _.current?.validation?.key + "." + k.join(".")
      ), l.updateType === "insert" && _.current?.validation?.key && xe(
        _.current?.validation?.key + "." + k.join(".")
      ).filter(([N, F]) => {
        let U = N?.split(".").length;
        if (N == k.join(".") && U == k.length - 1) {
          let $ = N + "." + k;
          z(N), Fe($, F);
        }
      });
      const b = n.getState().stateComponents.get(g);
      if (b) {
        const D = ue(y, E), N = new Set(D), F = l.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          U,
          $
        ] of b.components.entries()) {
          let O = !1;
          const C = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (C.includes("component") && (($.paths.has(F) || $.paths.has("")) && (O = !0), !O))
              for (const L of N) {
                let R = L;
                for (; ; ) {
                  if ($.paths.has(R)) {
                    O = !0;
                    break;
                  }
                  const ie = R.lastIndexOf(".");
                  if (ie !== -1) {
                    const Se = R.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(R.substring(ie + 1))
                    ) && $.paths.has(Se)) {
                      O = !0;
                      break;
                    }
                    R = Se;
                  } else
                    R = "";
                  if (R === "")
                    break;
                }
                if (O) break;
              }
            if (!O && C.includes("deps") && $.depsFunction) {
              const L = $.depsFunction(E);
              let R = !1;
              typeof L == "boolean" ? L && (R = !0) : G($.deps, L) || ($.deps = L, R = !0), R && (O = !0);
            }
            O && $.forceUpdate();
          }
        }
      }
      const P = Date.now();
      a = a.map((D, N) => {
        const F = a.slice(0, -1), U = W(E, F);
        return N === a.length - 1 && ["insert", "cut"].includes(l.updateType) ? (U.length - 1).toString() : D;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        l.updateType,
        y,
        E,
        a
      );
      const { oldValue: x, newValue: ae } = je(
        l.updateType,
        y,
        E,
        a
      ), oe = {
        timeStamp: P,
        stateKey: g,
        path: a,
        updateType: l.updateType,
        status: "new",
        oldValue: x,
        newValue: ae
      };
      if (Oe(g, (D) => {
        const F = [...D ?? [], oe].reduce((U, $) => {
          const O = `${$.stateKey}:${JSON.stringify($.path)}`, C = U.get(O);
          return C ? (C.timeStamp = Math.max(C.timeStamp, $.timeStamp), C.newValue = $.newValue, C.oldValue = C.oldValue ?? $.oldValue, C.updateType = $.updateType) : U.set(O, { ...$ }), U;
        }, /* @__PURE__ */ new Map());
        return Array.from(F.values());
      }), he(
        E,
        g,
        _.current,
        V
      ), _.current?.middleware && _.current.middleware({
        updateLog: c,
        update: oe
      }), _.current?.serverSync) {
        const D = n.getState().serverState[g], N = _.current?.serverSync;
        Re(g, {
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
      d,
      q.current,
      V
    )
  ), n.getState().cogsStateStore[g] || B(g, e), n.getState().initialStateGlobal[g] || fe(g, e));
  const r = ke(() => ee(
    g,
    d,
    q.current,
    V
  ), [g]);
  return [Ee(g), r];
}
function ee(e, i, S, u) {
  const f = /* @__PURE__ */ new Map();
  let T = 0;
  const h = (m) => {
    const t = m.join(".");
    for (const [I] of f)
      (I === t || I.startsWith(t + ".")) && f.delete(I);
    T++;
  }, v = {
    removeValidation: (m) => {
      m?.validationKey && z(m.validationKey);
    },
    revertToInitialState: (m) => {
      const t = n.getState().getInitialOptions(e)?.validation;
      t?.key && z(t?.key), m?.validationKey && z(m.validationKey);
      const I = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), f.clear(), T++;
      const M = s(I, []), A = Z(e), V = J(A?.localStorage?.key) ? A?.localStorage?.key(I) : A?.localStorage?.key, j = `${u}-${e}-${V}`;
      j && localStorage.removeItem(j), K(e, M), B(e, I);
      const g = n.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), I;
    },
    updateInitialState: (m) => {
      f.clear(), T++;
      const t = ee(
        e,
        i,
        S,
        u
      ), I = n.getState().initialStateGlobal[e], M = Z(e), A = J(M?.localStorage?.key) ? M?.localStorage?.key(I) : M?.localStorage?.key, V = `${u}-${e}-${A}`;
      return console.log("removing storage", V), localStorage.getItem(V) && localStorage.removeItem(V), Ne(() => {
        fe(e, m), K(e, t), B(e, m);
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
      return !!(m && G(m, Ee(e)));
    }
  };
  function s(m, t = [], I) {
    const M = t.map(String).join(".");
    f.get(M);
    const A = function() {
      return n().getNestedState(e, t);
    };
    Object.keys(v).forEach((g) => {
      A[g] = v[g];
    }), console.log("rebuildStateShapessss", t);
    const V = {
      apply(g, c, H) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, t);
      },
      get(g, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const d = t.join("."), r = `${e}////${S}`, o = n.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (t.length > 0 || c === "get") && a.paths.add(d);
          }
        }
        if (c === "getDifferences")
          return () => ue(
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
                n.getState().removeValidationError(a), l.errors.forEach((y) => {
                  const E = [a, ...y.path].join(".");
                  n.getState().addValidationError(E, y.message);
                });
                const w = n.getState().stateComponents.get(e);
                w && w.components.forEach((y) => {
                  y.forceUpdate();
                });
              }
              return l?.success && r.onSuccess ? r.onSuccess(l.data) : !l?.success && r.onError && r.onError(l.error), l;
            } catch (l) {
              return r.onError && r.onError(l), { success: !1, error: l };
            }
          };
        if (c === "_status") {
          const d = n.getState().getNestedState(e, t), r = n.getState().initialStateGlobal[e], o = W(r, t);
          return G(d, o) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const d = n().getNestedState(
              e,
              t
            ), r = n.getState().initialStateGlobal[e], o = W(r, t);
            return G(d, o) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const d = n.getState().initialStateGlobal[e], r = Z(e), o = J(r?.localStorage?.key) ? r?.localStorage?.key(d) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
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
          if (c === "getSelected")
            return () => {
              const r = n.getState().getSelectedIndex(e, t.join("."));
              if (r !== void 0)
                return s(
                  m[r],
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
                (y, E) => r(y.item, E.item)
              ), l = a.map(({ item: y }) => y), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: y }) => y
                )
              };
              return s(l, t, w);
            };
          if (c === "stateFilter")
            return (r) => {
              const a = d().filter(
                ({ item: y }, E) => r(y, E)
              ), l = a.map(({ item: y }) => y), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: y }) => y
                )
              };
              return s(l, t, w);
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (r) => m.map((a, l) => {
              let w;
              I?.validIndices && I.validIndices[l] !== void 0 ? w = I.validIndices[l] : w = l;
              const y = [...t, w.toString()];
              console.log("stateMapstateMapstateMapstateMap", y);
              const E = s(a, y, I);
              return r(
                a,
                E,
                l,
                m,
                s(m, t, I)
              );
            });
          if (c === "$stateMap")
            return (r) => te(De, {
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
              const o = m;
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
              const o = m[r];
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
              const l = n.getState().getNestedState(e, t), w = J(r) ? r(l) : r;
              let y = null;
              if (!l.some((p) => {
                if (o) {
                  const b = o.every(
                    (P) => G(p[P], w[P])
                  );
                  return b && (y = p), b;
                }
                const k = G(p, w);
                return k && (y = p), k;
              }))
                h(t), se(i, w, t, e);
              else if (a && y) {
                const p = a(y), k = l.map(
                  (b) => G(b, y) ? p : b
                );
                h(t), Y(i, k, t);
              }
            };
          if (c === "cut")
            return (r, o) => {
              if (!o?.waitForSync)
                return h(t), X(i, t, e, r), s(
                  n.getState().getNestedState(e, t),
                  t
                );
            };
          if (c === "cutByValue")
            return (r) => {
              for (let o = 0; o < m.length; o++)
                m[o] === r && X(i, t, e, o);
            };
          if (c === "toggleByValue")
            return (r) => {
              const o = m.findIndex((a) => a === r);
              o > -1 ? X(i, t, e, o) : se(i, r, t, e);
            };
          if (c === "stateFind")
            return (r) => {
              const a = d().find(
                ({ item: w }, y) => r(w, y)
              );
              if (!a) return;
              const l = [...t, a.originalIndex.toString()];
              return s(a.item, l, I);
            };
          if (c === "findWith")
            return (r, o) => {
              const l = d().find(
                ({ item: y }) => y[r] === o
              );
              if (!l) return;
              const w = [...t, l.originalIndex.toString()];
              return s(l.item, w, I);
            };
        }
        const H = t[t.length - 1];
        if (!isNaN(Number(H))) {
          const d = t.slice(0, -1), r = n.getState().getNestedState(e, d);
          if (Array.isArray(r) && c === "cut")
            return () => X(
              i,
              d,
              e,
              Number(H)
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
          return (d) => ne(u + "-" + e + "-" + d);
        if (c === "_selected") {
          const d = t.slice(0, -1), r = d.join("."), o = n.getState().getNestedState(e, d);
          return Array.isArray(o) ? Number(t[t.length - 1]) === n.getState().getSelectedIndex(e, r) : void 0;
        }
        if (c === "setSelected")
          return (d) => {
            const r = t.slice(0, -1), o = Number(t[t.length - 1]), a = r.join(".");
            d ? n.getState().setSelectedIndex(e, a, o) : n.getState().setSelectedIndex(e, a, void 0);
            const l = n.getState().getNestedState(e, [...r]);
            Y(i, l, r), h(r);
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
            Y(i, l, d), h(d);
          };
        if (t.length == 0) {
          if (c === "applyJsonPatch")
            return (d) => {
              const r = n.getState().cogsStateStore[e], a = Pe(r, d).newDocument;
              pe(
                e,
                n.getState().initialStateGlobal[e],
                a,
                i,
                S,
                u
              );
              const l = n.getState().stateComponents.get(e);
              if (l) {
                const w = ue(r, a), y = new Set(w);
                for (const [
                  E,
                  p
                ] of l.components.entries()) {
                  let k = !1;
                  const b = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!b.includes("none")) {
                    if (b.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (b.includes("component") && (p.paths.has("") && (k = !0), !k))
                      for (const P of y) {
                        if (p.paths.has(P)) {
                          k = !0;
                          break;
                        }
                        let x = P;
                        for (; x.includes("."); )
                          if (x = x.substring(
                            0,
                            x.lastIndexOf(".")
                          ), p.paths.has(x)) {
                            k = !0;
                            break;
                          }
                        if (k) break;
                      }
                    if (!k && b.includes("deps") && p.depsFunction) {
                      const P = p.depsFunction(a);
                      let x = !1;
                      typeof P == "boolean" ? P && (x = !0) : G(p.deps, P) || (p.deps = P, x = !0), x && (k = !0);
                    }
                    k && p.forceUpdate();
                  }
                }
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const d = n.getState().getInitialOptions(e)?.validation, r = n.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              z(d.key);
              const o = n.getState().cogsStateStore[e];
              try {
                const a = n.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(d.key) && z(w);
                });
                const l = d.zodSchema.safeParse(o);
                return l.success ? !0 : (l.error.errors.forEach((y) => {
                  const E = y.path, p = y.message, k = [d.key, ...E].join(".");
                  r(k, p);
                }), re(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return S;
          if (c === "getComponents")
            return () => n().stateComponents.get(e);
          if (c === "getAllFormRefs")
            return () => ye.getState().getFormRefsByStateKey(e);
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
          return () => ye.getState().getFormRef(e + "." + t.join("."));
        if (c === "validationWrapper")
          return ({
            children: d,
            hideMessage: r
          }) => /* @__PURE__ */ me(
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
        if (c === "_stateKey") return e;
        if (c === "_path") return t;
        if (c === "_isServerSynced") return v._isServerSynced;
        if (c === "update")
          return (d, r) => {
            if (r?.debounce)
              Ve(() => {
                Y(i, d, t, "");
                const o = n.getState().getNestedState(e, t);
                r?.afterUpdate && r.afterUpdate(o);
              }, r.debounce);
            else {
              Y(i, d, t, "");
              const o = n.getState().getNestedState(e, t);
              r?.afterUpdate && r.afterUpdate(o);
            }
            h(t);
          };
        if (c === "formElement")
          return (d, r) => /* @__PURE__ */ me(
            be,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: d,
              formOpts: r
            }
          );
        const q = [...t, c], _ = n.getState().getNestedState(e, q);
        return s(_, q, I);
      }
    }, j = new Proxy(A, V);
    return f.set(M, {
      proxy: j,
      stateVersion: T
    }), j;
  }
  return s(
    n.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return te(Ge, { proxy: e });
}
function De({
  proxy: e,
  rebuildStateShape: i
}) {
  const S = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? i(
    S,
    e._path
  ).stateMapNoRender(
    (f, T, h, v, s) => e._mapFn(f, T, h, v, s)
  ) : null;
}
function Ge({
  proxy: e
}) {
  const i = Q(null), S = `${e._stateKey}-${e._path.join(".")}`;
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
    n.getState().addSignalElement(S, m);
    const t = n.getState().getNestedState(e._stateKey, e._path);
    let I;
    if (e._effect)
      try {
        I = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (A) {
        console.error("Error evaluating effect function during mount:", A), I = t;
      }
    else
      I = t;
    I !== null && typeof I == "object" && (I = JSON.stringify(I));
    const M = document.createTextNode(String(I));
    u.replaceWith(M);
  }, [e._stateKey, e._path.join("."), e._effect]), te("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function tt(e) {
  const i = Te(
    (S) => {
      const u = n.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return te("text", {}, String(i));
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
