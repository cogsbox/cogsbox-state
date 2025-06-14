"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as le, useRef as Q, useEffect as de, useLayoutEffect as $e, useMemo as ke, createElement as te, useSyncExternalStore as Te, startTransition as Ae } from "react";
import { transformStateFunc as Ne, isDeepEqual as G, isFunction as J, getNestedValue as W, getDifferences as ue, debounce as Ve } from "./utility.js";
import { pushFunc as se, updateFn as Y, cutFunc as X, ValidationWrapper as _e, FormControlComponent as be } from "./Functions.jsx";
import Ce from "superjson";
import { v4 as fe } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as ye } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as Pe } from "fast-json-patch";
function ve(e, i) {
  const y = n.getState().getInitialOptions, u = n.getState().setInitialStateOptions, g = y(e) || {};
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
  const u = Z(e) || {}, g = y[e] || {}, T = n.getState().setInitialStateOptions, h = { ...g, ...u };
  let v = !1;
  if (i)
    for (const s in i)
      h.hasOwnProperty(s) ? (s == "localStorage" && i[s] && h[s].key !== i[s]?.key && (v = !0, h[s] = i[s]), s == "initialState" && i[s] && h[s] !== i[s] && // Different references
      !G(h[s], i[s]) && (v = !0, h[s] = i[s])) : (v = !0, h[s] = i[s]);
  v && T(e, h);
}
function Qe(e, { formElements: i, validation: y }) {
  return { initialState: e, formElements: i, validation: y };
}
const Ke = (e, i) => {
  let y = e;
  const [u, g] = Ne(y);
  (Object.keys(g).length > 0 || i && Object.keys(i).length > 0) && Object.keys(g).forEach((v) => {
    g[v] = g[v] || {}, g[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...g[v].formElements || {}
      // State-specific overrides
    }, Z(v) || n.getState().setInitialStateOptions(v, g[v]);
  }), n.getState().setInitialStates(u), n.getState().setCreatedState(u);
  const T = (v, s) => {
    const [S] = le(s?.componentId ?? fe());
    Ie({
      stateKey: v,
      options: s,
      initialOptionsPart: g
    });
    const t = n.getState().cogsStateStore[v] || u[v], m = s?.modifyState ? s.modifyState(t) : t, [j, N] = De(
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
    return N;
  };
  function h(v, s) {
    Ie({ stateKey: v, options: s, initialOptionsPart: g }), s.localStorage && je(v, s), re(v);
  }
  return { useCogsState: T, setCogsOptions: h };
}, {
  setUpdaterState: K,
  setState: B,
  getInitialOptions: Z,
  getKeyState: Ee,
  getValidationErrors: xe,
  setStateLog: Oe,
  updateInitialStateGlobal: ge,
  addValidationError: Fe,
  removeValidationError: z,
  setServerSyncActions: Re
} = n.getState(), he = (e, i, y, u, g) => {
  y?.log && console.log(
    "saving to localstorage",
    i,
    y.localStorage?.key,
    u
  );
  const T = J(y?.localStorage?.key) ? y.localStorage?.key(e) : y?.localStorage?.key;
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
      lastSyncedWithServer: g ?? v
    }, S = Ce.serialize(s);
    window.localStorage.setItem(
      h,
      JSON.stringify(S.json)
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
}, je = (e, i) => {
  const y = n.getState().cogsStateStore[e], { sessionId: u } = we(), g = J(i?.localStorage?.key) ? i.localStorage.key(y) : i?.localStorage?.key;
  if (g && u) {
    const T = ne(
      `${u}-${e}-${g}`
    );
    if (T && T.lastUpdated > (T.lastSyncedWithServer || 0))
      return B(e, T.state), re(e), !0;
  }
  return !1;
}, pe = (e, i, y, u, g, T) => {
  const h = {
    initialState: i,
    updaterState: ee(
      e,
      u,
      g,
      T
    ),
    state: y
  };
  ge(e, h.initialState), K(e, h.updaterState), B(e, h.state);
}, re = (e) => {
  const i = n.getState().stateComponents.get(e);
  if (!i) return;
  const y = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || y.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((u) => u());
  });
}, et = (e, i) => {
  const y = n.getState().stateComponents.get(e);
  if (y) {
    const u = `${e}////${i}`, g = y.components.get(u);
    if ((g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none"))
      return;
    g && g.forceUpdate();
  }
}, Ue = (e, i, y, u) => {
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
function De(e, {
  stateKey: i,
  serverSync: y,
  localStorage: u,
  formElements: g,
  reactiveDeps: T,
  reactiveType: h,
  componentId: v,
  initialState: s,
  syncUpdate: S,
  dependencies: t,
  serverState: m
} = {}) {
  const [j, N] = le({}), { sessionId: b } = we();
  let U = !i;
  const [f] = le(i ?? fe()), c = n.getState().stateLog[f], H = Q(/* @__PURE__ */ new Set()), q = Q(v ?? fe()), V = Q(
    null
  );
  V.current = Z(f) ?? null, de(() => {
    if (S && S.stateKey === f && S.path?.[0]) {
      B(f, (a) => ({
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
    if (s) {
      ve(f, {
        initialState: s
      });
      const o = V.current, d = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, w = n.getState().initialStateGlobal[f];
      if (!(w && !G(w, s) || !w) && !d)
        return;
      let E = null;
      const p = J(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      p && b && (E = ne(`${b}-${f}-${p}`));
      let k = s, _ = !1;
      const P = d ? Date.now() : 0, x = E?.lastUpdated || 0, ae = E?.lastSyncedWithServer || 0;
      d && P > x ? (k = o.serverState.data, _ = !0) : E && x > ae && (k = E.state, o?.localStorage?.onChange && o?.localStorage?.onChange(k)), pe(
        f,
        s,
        k,
        l,
        q.current,
        b
      ), _ && p && b && he(k, f, o, b, Date.now()), re(f), (Array.isArray(h) ? h : [h || "component"]).includes("none") || N({});
    }
  }, [
    s,
    m?.status,
    m?.data,
    ...t || []
  ]), $e(() => {
    U && ve(f, {
      serverSync: y,
      formElements: g,
      initialState: s,
      localStorage: u,
      middleware: V.current?.middleware
    });
    const o = `${f}////${q.current}`, a = n.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => N({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: T || void 0,
      reactiveType: h ?? ["component", "deps"]
    }), n.getState().stateComponents.set(f, a), N({}), () => {
      const d = `${f}////${q.current}`;
      a && (a.components.delete(d), a.components.size === 0 && n.getState().stateComponents.delete(f));
    };
  }, []);
  const l = (o, a, d, w) => {
    if (Array.isArray(a)) {
      const I = `${f}-${a.join(".")}`;
      H.current.add(I);
    }
    B(f, (I) => {
      const E = J(o) ? o(I) : o, p = `${f}-${a.join(".")}`;
      if (p) {
        let M = !1, A = n.getState().signalDomElements.get(p);
        if ((!A || A.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const F = a.slice(0, -1), D = W(E, F);
          if (Array.isArray(D)) {
            M = !0;
            const $ = `${f}-${F.join(".")}`;
            A = n.getState().signalDomElements.get($);
          }
        }
        if (A) {
          const F = M ? W(E, a.slice(0, -1)) : W(E, a);
          A.forEach(({ parentId: D, position: $, effect: O }) => {
            const C = document.querySelector(
              `[data-parent-id="${D}"]`
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
      d.updateType === "update" && (w || V.current?.validation?.key) && a && z(
        (w || V.current?.validation?.key) + "." + a.join(".")
      );
      const k = a.slice(0, a.length - 1);
      d.updateType === "cut" && V.current?.validation?.key && z(
        V.current?.validation?.key + "." + k.join(".")
      ), d.updateType === "insert" && V.current?.validation?.key && xe(
        V.current?.validation?.key + "." + k.join(".")
      ).filter(([A, F]) => {
        let D = A?.split(".").length;
        if (A == k.join(".") && D == k.length - 1) {
          let $ = A + "." + k;
          z(A), Fe($, F);
        }
      });
      const _ = n.getState().stateComponents.get(f);
      if (_) {
        const M = ue(I, E), A = new Set(M), F = d.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of _.components.entries()) {
          let O = !1;
          const C = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (C.includes("component") && (($.paths.has(F) || $.paths.has("")) && (O = !0), !O))
              for (const L of A) {
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
      a = a.map((M, A) => {
        const F = a.slice(0, -1), D = W(E, F);
        return A === a.length - 1 && ["insert", "cut"].includes(d.updateType) ? (D.length - 1).toString() : M;
      });
      const { oldValue: x, newValue: ae } = Ue(
        d.updateType,
        I,
        E,
        a
      ), oe = {
        timeStamp: P,
        stateKey: f,
        path: a,
        updateType: d.updateType,
        status: "new",
        oldValue: x,
        newValue: ae
      };
      if (Oe(f, (M) => {
        const F = [...M ?? [], oe].reduce((D, $) => {
          const O = `${$.stateKey}:${JSON.stringify($.path)}`, C = D.get(O);
          return C ? (C.timeStamp = Math.max(C.timeStamp, $.timeStamp), C.newValue = $.newValue, C.oldValue = C.oldValue ?? $.oldValue, C.updateType = $.updateType) : D.set(O, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(F.values());
      }), he(
        E,
        f,
        V.current,
        b
      ), V.current?.middleware && V.current.middleware({
        updateLog: c,
        update: oe
      }), V.current?.serverSync) {
        const M = n.getState().serverState[f], A = V.current?.serverSync;
        Re(f, {
          syncKey: typeof A.syncKey == "string" ? A.syncKey : A.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (A.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  n.getState().updaterState[f] || (K(
    f,
    ee(
      f,
      l,
      q.current,
      b
    )
  ), n.getState().cogsStateStore[f] || B(f, e), n.getState().initialStateGlobal[f] || ge(f, e));
  const r = ke(() => ee(
    f,
    l,
    q.current,
    b
  ), [f]);
  return [Ee(f), r];
}
function ee(e, i, y, u) {
  const g = /* @__PURE__ */ new Map();
  let T = 0;
  const h = (S) => {
    const t = S.join(".");
    for (const [m] of g)
      (m === t || m.startsWith(t + ".")) && g.delete(m);
    T++;
  }, v = {
    removeValidation: (S) => {
      S?.validationKey && z(S.validationKey);
    },
    revertToInitialState: (S) => {
      const t = n.getState().getInitialOptions(e)?.validation;
      t?.key && z(t?.key), S?.validationKey && z(S.validationKey);
      const m = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), g.clear(), T++;
      const j = s(m, []), N = Z(e), b = J(N?.localStorage?.key) ? N?.localStorage?.key(m) : N?.localStorage?.key, U = `${u}-${e}-${b}`;
      U && localStorage.removeItem(U), K(e, j), B(e, m);
      const f = n.getState().stateComponents.get(e);
      return f && f.components.forEach((c) => {
        c.forceUpdate();
      }), m;
    },
    updateInitialState: (S) => {
      g.clear(), T++;
      const t = ee(
        e,
        i,
        y,
        u
      ), m = n.getState().initialStateGlobal[e], j = Z(e), N = J(j?.localStorage?.key) ? j?.localStorage?.key(m) : j?.localStorage?.key, b = `${u}-${e}-${N}`;
      return localStorage.getItem(b) && localStorage.removeItem(b), Ae(() => {
        ge(e, S), K(e, t), B(e, S);
        const U = n.getState().stateComponents.get(e);
        U && U.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (U) => t.get()[U]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const S = n.getState().serverState[e];
      return !!(S && G(S, Ee(e)));
    }
  };
  function s(S, t = [], m) {
    const j = t.map(String).join(".");
    g.get(j);
    const N = function() {
      return n().getNestedState(e, t);
    };
    Object.keys(v).forEach((f) => {
      N[f] = v[f];
    });
    const b = {
      apply(f, c, H) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, t);
      },
      get(f, c) {
        if (m?.validIndices && !Array.isArray(S) && (m = { ...m, validIndices: void 0 }), c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const l = t.join("."), r = `${e}////${y}`, o = n.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (t.length > 0 || c === "get") && a.paths.add(l);
          }
        }
        if (c === "getDifferences")
          return () => ue(
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
          const l = n.getState().getNestedState(e, t), r = n.getState().initialStateGlobal[e], o = W(r, t);
          return G(l, o) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const l = n().getNestedState(
              e,
              t
            ), r = n.getState().initialStateGlobal[e], o = W(r, t);
            return G(l, o) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const l = n.getState().initialStateGlobal[e], r = Z(e), o = J(r?.localStorage?.key) ? r?.localStorage?.key(l) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const l = n.getState().getInitialOptions(e)?.validation;
            if (!l?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(l.key + "." + t.join("."));
          };
        if (Array.isArray(S)) {
          const l = () => m?.validIndices ? S.map((o, a) => ({
            item: o,
            originalIndex: m.validIndices[a]
          })) : n.getState().getNestedState(e, t).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (c === "getSelected")
            return () => {
              const r = n.getState().getSelectedIndex(e, t.join("."));
              if (r !== void 0)
                return s(
                  S[r],
                  [...t, r.toString()],
                  m
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
                ...m,
                validIndices: a.map(
                  ({ originalIndex: I }) => I
                )
              };
              return s(d, t, w);
            };
          if (c === "stateFilter")
            return (r) => {
              const a = l().filter(
                ({ item: I }, E) => r(I, E)
              ), d = a.map(({ item: I }) => I), w = {
                ...m,
                validIndices: a.map(
                  ({ originalIndex: I }) => I
                )
              };
              return s(d, t, w);
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (r) => S.map((a, d) => {
              let w;
              m?.validIndices && m.validIndices[d] !== void 0 ? w = m.validIndices[d] : w = d;
              const I = [...t, w.toString()], E = s(a, I, m);
              return r(
                a,
                E,
                d,
                S,
                s(S, t, m)
              );
            });
          if (c === "$stateMap")
            return (r) => te(Me, {
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
              const o = S;
              g.clear(), T++;
              const a = o.flatMap(
                (d) => d[r] ?? []
              );
              return s(
                a,
                [...t, "[*]", r],
                m
              );
            };
          if (c === "index")
            return (r) => {
              const o = S[r];
              return s(o, [...t, r.toString()]);
            };
          if (c === "last")
            return () => {
              const r = n.getState().getNestedState(e, t);
              if (r.length === 0) return;
              const o = r.length - 1, a = r[o], d = [...t, o.toString()];
              return s(a, d);
            };
          if (c === "insert")
            return (r) => (h(t), se(i, r, t, e), s(
              n.getState().getNestedState(e, t),
              t
            ));
          if (c === "uniqueInsert")
            return (r, o, a) => {
              const d = n.getState().getNestedState(e, t), w = J(r) ? r(d) : r;
              let I = null;
              if (!d.some((p) => {
                if (o) {
                  const _ = o.every(
                    (P) => G(p[P], w[P])
                  );
                  return _ && (I = p), _;
                }
                const k = G(p, w);
                return k && (I = p), k;
              }))
                h(t), se(i, w, t, e);
              else if (a && I) {
                const p = a(I), k = d.map(
                  (_) => G(_, I) ? p : _
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
              for (let o = 0; o < S.length; o++)
                S[o] === r && X(i, t, e, o);
            };
          if (c === "toggleByValue")
            return (r) => {
              const o = S.findIndex((a) => a === r);
              o > -1 ? X(i, t, e, o) : se(i, r, t, e);
            };
          if (c === "stateFind")
            return (r) => {
              const a = l().find(
                ({ item: w }, I) => r(w, I)
              );
              if (!a) return;
              const d = [...t, a.originalIndex.toString()];
              return s(a.item, d, m);
            };
          if (c === "findWith")
            return (r, o) => {
              const d = l().find(
                ({ item: I }) => I[r] === o
              );
              if (!d) return;
              const w = [...t, d.originalIndex.toString()];
              return s(d.item, w, m);
            };
        }
        const H = t[t.length - 1];
        if (!isNaN(Number(H))) {
          const l = t.slice(0, -1), r = n.getState().getNestedState(e, l);
          if (Array.isArray(r) && c === "cut")
            return () => X(
              i,
              l,
              e,
              Number(H)
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
            Y(i, d, r), h(r);
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
            Y(i, d, l), h(l);
          };
        if (t.length == 0) {
          if (c === "applyJsonPatch")
            return (l) => {
              const r = n.getState().cogsStateStore[e], a = Pe(r, l).newDocument;
              pe(
                e,
                n.getState().initialStateGlobal[e],
                a,
                i,
                y,
                u
              );
              const d = n.getState().stateComponents.get(e);
              if (d) {
                const w = ue(r, a), I = new Set(w);
                for (const [
                  E,
                  p
                ] of d.components.entries()) {
                  let k = !1;
                  const _ = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (p.paths.has("") && (k = !0), !k))
                      for (const P of I) {
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
                    if (!k && _.includes("deps") && p.depsFunction) {
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
              const l = n.getState().getInitialOptions(e)?.validation, r = n.getState().addValidationError;
              if (!l?.zodSchema)
                throw new Error("Zod schema not found");
              if (!l?.key)
                throw new Error("Validation key not found");
              z(l.key);
              const o = n.getState().cogsStateStore[e];
              try {
                const a = n.getState().getValidationErrors(l.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(l.key) && z(w);
                });
                const d = l.zodSchema.safeParse(o);
                return d.success ? !0 : (d.error.errors.forEach((I) => {
                  const E = I.path, p = I.message, k = [l.key, ...E].join(".");
                  r(k, p);
                }), re(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return y;
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
            children: l,
            hideMessage: r
          }) => /* @__PURE__ */ me(
            _e,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: m?.validIndices,
              children: l
            }
          );
        if (c === "_stateKey") return e;
        if (c === "_path") return t;
        if (c === "_isServerSynced") return v._isServerSynced;
        if (c === "update")
          return (l, r) => {
            if (r?.debounce)
              Ve(() => {
                Y(i, l, t, "");
                const o = n.getState().getNestedState(e, t);
                r?.afterUpdate && r.afterUpdate(o);
              }, r.debounce);
            else {
              Y(i, l, t, "");
              const o = n.getState().getNestedState(e, t);
              r?.afterUpdate && r.afterUpdate(o);
            }
            h(t);
          };
        if (c === "formElement")
          return (l, r) => /* @__PURE__ */ me(
            be,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: l,
              formOpts: r
            }
          );
        const q = [...t, c], V = n.getState().getNestedState(e, q);
        return s(V, q, m);
      }
    }, U = new Proxy(N, b);
    return g.set(j, {
      proxy: U,
      stateVersion: T
    }), U;
  }
  return s(
    n.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return te(Ge, { proxy: e });
}
function Me({
  proxy: e,
  rebuildStateShape: i
}) {
  const y = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(y) ? i(
    y,
    e._path
  ).stateMapNoRender(
    (g, T, h, v, s) => e._mapFn(g, T, h, v, s)
  ) : null;
}
function Ge({
  proxy: e
}) {
  const i = Q(null), y = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const g = u.parentElement, h = Array.from(g.childNodes).indexOf(u);
    let v = g.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", v));
    const S = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: h,
      effect: e._effect
    };
    n.getState().addSignalElement(y, S);
    const t = n.getState().getNestedState(e._stateKey, e._path);
    let m;
    if (e._effect)
      try {
        m = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (N) {
        console.error("Error evaluating effect function during mount:", N), m = t;
      }
    else
      m = t;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const j = document.createTextNode(String(m));
    u.replaceWith(j);
  }, [e._stateKey, e._path.join("."), e._effect]), te("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function tt(e) {
  const i = Te(
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
  return te("text", {}, String(i));
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
