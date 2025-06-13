"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as le, useRef as ee, useEffect as de, useLayoutEffect as Ae, useMemo as Te, createElement as re, useSyncExternalStore as Ne, startTransition as Ve } from "react";
import { transformStateFunc as _e, isDeepEqual as L, isFunction as Z, getNestedValue as q, getDifferences as pe, debounce as Ce } from "./utility.js";
import { pushFunc as se, updateFn as Q, cutFunc as K, ValidationWrapper as Pe, FormControlComponent as be } from "./Functions.jsx";
import xe from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as t, formRefStore as ye } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as Oe } from "fast-json-patch";
function ve(e, i) {
  const S = t.getState().getInitialOptions, u = t.getState().setInitialStateOptions, f = S(e) || {};
  u(e, {
    ...f,
    ...i
  });
}
function he({
  stateKey: e,
  options: i,
  initialOptionsPart: S
}) {
  const u = H(e) || {}, f = S[e] || {}, k = t.getState().setInitialStateOptions, I = { ...f, ...u };
  let v = !1;
  if (i)
    for (const s in i)
      I.hasOwnProperty(s) ? (s == "localStorage" && i[s] && I[s].key !== i[s]?.key && (v = !0, I[s] = i[s]), s == "initialState" && i[s] && I[s] !== i[s] && // Different references
      !L(I[s], i[s]) && (v = !0, I[s] = i[s])) : (v = !0, I[s] = i[s]);
  v && k(e, I);
}
function et(e, { formElements: i, validation: S }) {
  return { initialState: e, formElements: i, validation: S };
}
const tt = (e, i) => {
  let S = e;
  const [u, f] = _e(S);
  (Object.keys(f).length > 0 || i && Object.keys(i).length > 0) && Object.keys(f).forEach((v) => {
    f[v] = f[v] || {}, f[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...f[v].formElements || {}
      // State-specific overrides
    }, H(v) || t.getState().setInitialStateOptions(v, f[v]);
  }), t.getState().setInitialStates(u), t.getState().setCreatedState(u);
  const k = (v, s) => {
    const [m] = le(s?.componentId ?? ue());
    he({
      stateKey: v,
      options: s,
      initialOptionsPart: f
    });
    const n = t.getState().cogsStateStore[v] || u[v], h = s?.modifyState ? s.modifyState(n) : n, [M, _] = We(
      h,
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
    return _;
  };
  function I(v, s) {
    he({ stateKey: v, options: s, initialOptionsPart: f }), s.localStorage && Me(v, s), oe(v);
  }
  return { useCogsState: k, setCogsOptions: I };
}, {
  setUpdaterState: te,
  setState: Y,
  getInitialOptions: H,
  getKeyState: Ee,
  getValidationErrors: Fe,
  setStateLog: je,
  updateInitialStateGlobal: ge,
  addValidationError: Re,
  removeValidationError: B,
  setServerSyncActions: Ue
} = t.getState(), Ie = (e, i, S, u, f) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    u
  );
  const k = Z(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (k && u) {
    const I = `${u}-${i}-${k}`;
    let v;
    try {
      v = ae(I)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: f ?? v
    }, m = xe.serialize(s);
    window.localStorage.setItem(
      I,
      JSON.stringify(m.json)
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
}, Me = (e, i) => {
  const S = t.getState().cogsStateStore[e], { sessionId: u } = we(), f = Z(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (f && u) {
    const k = ae(
      `${u}-${e}-${f}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return Y(e, k.state), oe(e), !0;
  }
  return !1;
}, ke = (e, i, S, u, f, k) => {
  const I = {
    initialState: i,
    updaterState: ne(
      e,
      u,
      f,
      k
    ),
    state: S
  };
  ge(e, I.initialState), te(e, I.updaterState), Y(e, I.state);
}, oe = (e) => {
  const i = t.getState().stateComponents.get(e);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((u) => u());
  });
}, nt = (e, i) => {
  const S = t.getState().stateComponents.get(e);
  if (S) {
    const u = `${e}////${i}`, f = S.components.get(u);
    if ((f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none"))
      return;
    f && f.forceUpdate();
  }
}, De = (e, i, S, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: q(i, u),
        newValue: q(S, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(S, u)
      };
    case "cut":
      return {
        oldValue: q(i, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function We(e, {
  stateKey: i,
  serverSync: S,
  localStorage: u,
  formElements: f,
  reactiveDeps: k,
  reactiveType: I,
  componentId: v,
  initialState: s,
  syncUpdate: m,
  dependencies: n,
  serverState: h
} = {}) {
  const [M, _] = le({}), { sessionId: C } = we();
  let D = !i;
  const [g] = le(i ?? ue()), l = t.getState().stateLog[g], X = ee(/* @__PURE__ */ new Set()), J = ee(v ?? ue()), P = ee(
    null
  );
  P.current = H(g) ?? null, de(() => {
    if (m && m.stateKey === g && m.path?.[0]) {
      Y(g, (a) => ({
        ...a,
        [m.path[0]]: m.newValue
      }));
      const o = `${m.stateKey}:${m.path.join(".")}`;
      t.getState().setSyncInfo(o, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), de(() => {
    if (s) {
      ve(g, {
        initialState: s
      });
      const o = P.current, c = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, p = t.getState().initialStateGlobal[g];
      if (!(p && !L(p, s) || !p) && !c)
        return;
      let w = null;
      const $ = Z(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      $ && C && (w = ae(`${C}-${g}-${$}`));
      let T = s, A = !1;
      const N = c ? Date.now() : 0, O = w?.lastUpdated || 0, b = w?.lastSyncedWithServer || 0;
      c && N > O ? (T = o.serverState.data, A = !0) : w && O > b && (T = w.state, o?.localStorage?.onChange && o?.localStorage?.onChange(T)), ke(
        g,
        s,
        T,
        d,
        J.current,
        C
      ), A && $ && C && Ie(T, g, o, C, Date.now()), oe(g), (Array.isArray(I) ? I : [I || "component"]).includes("none") || _({});
    }
  }, [
    s,
    h?.status,
    h?.data,
    ...n || []
  ]), Ae(() => {
    D && ve(g, {
      serverSync: S,
      formElements: f,
      initialState: s,
      localStorage: u,
      middleware: P.current?.middleware
    });
    const o = `${g}////${J.current}`, a = t.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => _({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: I ?? ["component", "deps"]
    }), t.getState().stateComponents.set(g, a), _({}), () => {
      const c = `${g}////${J.current}`;
      a && (a.components.delete(c), a.components.size === 0 && t.getState().stateComponents.delete(g));
    };
  }, []);
  const d = (o, a, c, p) => {
    if (Array.isArray(a)) {
      const y = `${g}-${a.join(".")}`;
      X.current.add(y);
    }
    Y(g, (y) => {
      const w = Z(o) ? o(y) : o, $ = `${g}-${a.join(".")}`;
      if ($) {
        let R = !1, V = t.getState().signalDomElements.get($);
        if ((!V || V.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const W = a.slice(0, -1), G = q(w, W);
          if (Array.isArray(G)) {
            R = !0;
            const E = `${g}-${W.join(".")}`;
            V = t.getState().signalDomElements.get(E);
          }
        }
        if (V) {
          const W = R ? q(w, a.slice(0, -1)) : q(w, a);
          V.forEach(({ parentId: G, position: E, effect: j }) => {
            const x = document.querySelector(
              `[data-parent-id="${G}"]`
            );
            if (x) {
              const z = Array.from(x.childNodes);
              if (z[E]) {
                const U = j ? new Function("state", `return (${j})(state)`)(W) : W;
                z[E].textContent = String(U);
              }
            }
          });
        }
      }
      c.updateType === "update" && (p || P.current?.validation?.key) && a && B(
        (p || P.current?.validation?.key) + "." + a.join(".")
      );
      const T = a.slice(0, a.length - 1);
      c.updateType === "cut" && P.current?.validation?.key && B(
        P.current?.validation?.key + "." + T.join(".")
      ), c.updateType === "insert" && P.current?.validation?.key && Fe(
        P.current?.validation?.key + "." + T.join(".")
      ).filter(([V, W]) => {
        let G = V?.split(".").length;
        if (V == T.join(".") && G == T.length - 1) {
          let E = V + "." + T;
          B(V), Re(E, W);
        }
      });
      const A = t.getState().stateComponents.get(g);
      if (A) {
        const R = pe(y, w), V = new Set(R), W = c.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          G,
          E
        ] of A.components.entries()) {
          let j = !1;
          const x = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (!x.includes("none")) {
            if (x.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (x.includes("component") && ((E.paths.has(W) || E.paths.has("")) && (j = !0), !j))
              for (const z of V) {
                let U = z;
                for (; ; ) {
                  if (E.paths.has(U)) {
                    j = !0;
                    break;
                  }
                  const ie = U.lastIndexOf(".");
                  if (ie !== -1) {
                    const Se = U.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(U.substring(ie + 1))
                    ) && E.paths.has(Se)) {
                      j = !0;
                      break;
                    }
                    U = Se;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (j) break;
              }
            if (!j && x.includes("deps") && E.depsFunction) {
              const z = E.depsFunction(w);
              let U = !1;
              typeof z == "boolean" ? z && (U = !0) : L(E.deps, z) || (E.deps = z, U = !0), U && (j = !0);
            }
            j && E.forceUpdate();
          }
        }
      }
      const N = Date.now();
      let O = [...a], b = { ...c };
      if (c.updateType === "insert") {
        const R = q(w, a);
        Array.isArray(R) && R.length > 0 && O.push((R.length - 1).toString());
      }
      const { oldValue: F, newValue: $e } = De(
        b.updateType,
        y,
        w,
        O
        // Use the correctly determined path for logging
      ), fe = {
        timeStamp: N,
        stateKey: g,
        path: a,
        updateType: c.updateType,
        status: "new",
        oldValue: F,
        newValue: $e
      };
      if (je(g, (R) => {
        const W = [...R ?? [], fe].reduce((G, E) => {
          const j = `${E.stateKey}:${JSON.stringify(E.path)}`, x = G.get(j);
          return x ? (x.timeStamp = Math.max(x.timeStamp, E.timeStamp), x.newValue = E.newValue, x.oldValue = x.oldValue ?? E.oldValue, x.updateType = E.updateType) : G.set(j, { ...E }), G;
        }, /* @__PURE__ */ new Map());
        return Array.from(W.values());
      }), Ie(
        w,
        g,
        P.current,
        C
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: fe
      }), P.current?.serverSync) {
        const R = t.getState().serverState[g], V = P.current?.serverSync;
        Ue(g, {
          syncKey: typeof V.syncKey == "string" ? V.syncKey : V.syncKey({ state: w }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (V.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  t.getState().updaterState[g] || (te(
    g,
    ne(
      g,
      d,
      J.current,
      C
    )
  ), t.getState().cogsStateStore[g] || Y(g, e), t.getState().initialStateGlobal[g] || ge(g, e));
  const r = Te(() => ne(
    g,
    d,
    J.current,
    C
  ), [g]);
  return [Ee(g), r];
}
function ne(e, i, S, u) {
  const f = /* @__PURE__ */ new Map();
  let k = 0;
  const I = (m) => {
    const n = m.join(".");
    for (const [h] of f)
      (h === n || h.startsWith(n + ".")) && f.delete(h);
    k++;
  }, v = {
    removeValidation: (m) => {
      m?.validationKey && B(m.validationKey);
    },
    revertToInitialState: (m) => {
      const n = t.getState().getInitialOptions(e)?.validation;
      n?.key && B(n?.key), m?.validationKey && B(m.validationKey);
      const h = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), f.clear(), k++;
      const M = s(h, []), _ = H(e), C = Z(_?.localStorage?.key) ? _?.localStorage?.key(h) : _?.localStorage?.key, D = `${u}-${e}-${C}`;
      D && localStorage.removeItem(D), te(e, M), Y(e, h);
      const g = t.getState().stateComponents.get(e);
      return g && g.components.forEach((l) => {
        l.forceUpdate();
      }), h;
    },
    updateInitialState: (m) => {
      f.clear(), k++;
      const n = ne(
        e,
        i,
        S,
        u
      ), h = t.getState().initialStateGlobal[e], M = H(e), _ = Z(M?.localStorage?.key) ? M?.localStorage?.key(h) : M?.localStorage?.key, C = `${u}-${e}-${_}`;
      return console.log("removing storage", C), localStorage.getItem(C) && localStorage.removeItem(C), Ve(() => {
        ge(e, m), te(e, n), Y(e, m);
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
      const m = t.getState().serverState[e];
      return !!(m && L(m, Ee(e)));
    }
  };
  function s(m, n = [], h) {
    const M = n.map(String).join(".");
    f.get(M);
    const _ = function() {
      return t().getNestedState(e, n);
    };
    Object.keys(v).forEach((g) => {
      _[g] = v[g];
    });
    const C = {
      apply(g, l, X) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), t().getNestedState(e, n);
      },
      get(g, l) {
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender") {
          const d = n.join("."), r = `${e}////${S}`, o = t.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (n.length > 0 || l === "get") && a.paths.add(d);
          }
        }
        if (l === "getDifferences")
          return () => pe(
            t.getState().cogsStateStore[e],
            t.getState().initialStateGlobal[e]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = t.getState().getInitialOptions(e), r = d?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = t.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const c = await r.action(o);
              if (c && !c.success && c.errors && a) {
                t.getState().removeValidationError(a), c.errors.forEach((y) => {
                  const w = [a, ...y.path].join(".");
                  t.getState().addValidationError(w, y.message);
                });
                const p = t.getState().stateComponents.get(e);
                p && p.components.forEach((y) => {
                  y.forceUpdate();
                });
              }
              return c?.success && r.onSuccess ? r.onSuccess(c.data) : !c?.success && r.onError && r.onError(c.error), c;
            } catch (c) {
              return r.onError && r.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = t.getState().getNestedState(e, n), r = t.getState().initialStateGlobal[e], o = q(r, n);
          return L(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = t().getNestedState(
              e,
              n
            ), r = t.getState().initialStateGlobal[e], o = q(r, n);
            return L(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = t.getState().initialStateGlobal[e], r = H(e), o = Z(r?.localStorage?.key) ? r?.localStorage?.key(d) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = t.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return t.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(m)) {
          const d = () => h?.validIndices ? m.map((o, a) => ({
            item: o,
            originalIndex: h.validIndices[a]
          })) : t.getState().getNestedState(e, n).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const r = t.getState().getSelectedIndex(e, n.join("."));
              if (r !== void 0)
                return s(
                  m[r],
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
                (y, w) => r(y.item, w.item)
              ), c = a.map(({ item: y }) => y), p = {
                ...h,
                validIndices: a.map(
                  ({ originalIndex: y }) => y
                )
              };
              return s(c, n, p);
            };
          if (l === "stateFilter")
            return (r) => {
              const a = d().filter(
                ({ item: y }, w) => r(y, w)
              ), c = a.map(({ item: y }) => y), p = {
                ...h,
                validIndices: a.map(
                  ({ originalIndex: y }) => y
                )
              };
              return s(c, n, p);
            };
          if (l === "stateMap" || l === "stateMapNoRender")
            return (r) => m.map((a, c) => {
              let p;
              h?.validIndices && h.validIndices[c] !== void 0 ? p = h.validIndices[c] : p = c;
              const y = [...n, p.toString()], w = s(a, y, h);
              return r(
                a,
                w,
                c,
                m,
                s(m, n, h)
              );
            });
          if (l === "$stateMap")
            return (r) => re(Ge, {
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
              const o = m;
              f.clear(), k++;
              const a = o.flatMap(
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
              const o = m[r];
              return s(o, [...n, r.toString()]);
            };
          if (l === "last")
            return () => {
              const r = t.getState().getNestedState(e, n);
              if (r.length === 0) return;
              const o = r.length - 1, a = r[o], c = [...n, o.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (r) => (I(n), se(i, r, n, e), s(
              t.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (r, o, a) => {
              const c = t.getState().getNestedState(e, n), p = Z(r) ? r(c) : r;
              let y = null;
              if (!c.some(($) => {
                if (o) {
                  const A = o.every(
                    (N) => L($[N], p[N])
                  );
                  return A && (y = $), A;
                }
                const T = L($, p);
                return T && (y = $), T;
              }))
                I(n), se(i, p, n, e);
              else if (a && y) {
                const $ = a(y), T = c.map(
                  (A) => L(A, y) ? $ : A
                );
                I(n), Q(i, T, n);
              }
            };
          if (l === "cut")
            return (r, o) => {
              if (!o?.waitForSync)
                return I(n), K(i, n, e, r), s(
                  t.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (r) => {
              for (let o = 0; o < m.length; o++)
                m[o] === r && K(i, n, e, o);
            };
          if (l === "toggleByValue")
            return (r) => {
              const o = m.findIndex((a) => a === r);
              o > -1 ? K(i, n, e, o) : se(i, r, n, e);
            };
          if (l === "stateFind")
            return (r) => {
              const a = d().find(
                ({ item: p }, y) => r(p, y)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return s(a.item, c, h);
            };
          if (l === "findWith")
            return (r, o) => {
              const c = d().find(
                ({ item: y }) => y[r] === o
              );
              if (!c) return;
              const p = [...n, c.originalIndex.toString()];
              return s(c.item, p, h);
            };
        }
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const d = n.slice(0, -1), r = t.getState().getNestedState(e, d);
          if (Array.isArray(r) && l === "cut")
            return () => K(
              i,
              d,
              e,
              Number(X)
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
          return (d) => ae(u + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), r = d.join("."), o = t.getState().getNestedState(e, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === t.getState().getSelectedIndex(e, r) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const r = n.slice(0, -1), o = Number(n[n.length - 1]), a = r.join(".");
            d ? t.getState().setSelectedIndex(e, a, o) : t.getState().setSelectedIndex(e, a, void 0);
            const c = t.getState().getNestedState(e, [...r]);
            Q(i, c, r), I(r);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), r = Number(n[n.length - 1]), o = d.join("."), a = t.getState().getSelectedIndex(e, o);
            t.getState().setSelectedIndex(
              e,
              o,
              a === r ? void 0 : r
            );
            const c = t.getState().getNestedState(e, [...d]);
            Q(i, c, d), I(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const r = t.getState().cogsStateStore[e], a = Oe(r, d).newDocument, c = H(e), p = c?.middleware, y = t.getState().setInitialStateOptions;
              c && p && y(e, {
                ...c,
                middleware: void 0
              }), ke(
                e,
                t.getState().initialStateGlobal[e],
                a,
                i,
                S,
                u
              ), c && p && y(e, {
                ...c,
                middleware: p
              });
              const w = t.getState().stateComponents.get(e);
              if (console.log("component update logic stateEntry", w), !w) return;
              const $ = /* @__PURE__ */ new Set();
              console.log("component update logic pathsToCheck", $), Array.isArray(r) && Array.isArray(a) && r.length !== a.length && $.add(""), console.log("component update logic pathsToCheck", $), d.forEach((T) => {
                const N = T.path.slice(1).split("/");
                if (T.op === "add" || T.op === "remove") {
                  const b = N[N.length - 1];
                  if (!isNaN(parseInt(b))) {
                    const F = N.slice(0, -1).join(".");
                    $.add(F), F === "" && $.add("");
                  }
                }
                let O = "";
                N.forEach((b, F) => {
                  F > 0 && (O += "."), O += b, $.add(O);
                }), $.add("");
              });
              for (const [
                T,
                A
              ] of w.components.entries()) {
                console.log("component update logic component", A);
                let N = !1;
                const O = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
                if (!O.includes("none")) {
                  if (O.includes("all")) {
                    A.forceUpdate();
                    continue;
                  }
                  if (O.includes("component"))
                    for (const b of A.paths) {
                      if ($.has(b)) {
                        N = !0;
                        break;
                      }
                      for (const F of $)
                        if (F.startsWith(b + ".") || b === "" && F !== "") {
                          N = !0;
                          break;
                        }
                      if (N) break;
                    }
                  if (!N && O.includes("deps") && A.depsFunction) {
                    const b = A.depsFunction(a);
                    let F = !1;
                    typeof b == "boolean" ? b && (F = !0) : L(A.deps, b) || (A.deps = b, F = !0), F && (N = !0);
                  }
                  N && A.forceUpdate();
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = t.getState().getInitialOptions(e)?.validation, r = t.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              B(d.key);
              const o = t.getState().cogsStateStore[e];
              try {
                const a = t.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([p]) => {
                  p && p.startsWith(d.key) && B(p);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((y) => {
                  const w = y.path, $ = y.message, T = [d.key, ...w].join(".");
                  r(T, $);
                }), oe(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return S;
          if (l === "getComponents")
            return () => t().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => ye.getState().getFormRefsByStateKey(e);
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
          return () => ye.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: r
          }) => /* @__PURE__ */ me(
            Pe,
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
              Ce(() => {
                Q(i, d, n, "");
                const o = t.getState().getNestedState(e, n);
                r?.afterUpdate && r.afterUpdate(o);
              }, r.debounce);
            else {
              Q(i, d, n, "");
              const o = t.getState().getNestedState(e, n);
              r?.afterUpdate && r.afterUpdate(o);
            }
            I(n);
          };
        if (l === "formElement")
          return (d, r) => /* @__PURE__ */ me(
            be,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: r
            }
          );
        const J = [...n, l], P = t.getState().getNestedState(e, J);
        return s(P, J, h);
      }
    }, D = new Proxy(_, C);
    return f.set(M, {
      proxy: D,
      stateVersion: k
    }), D;
  }
  return s(
    t.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return re(Le, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: i
}) {
  const S = t().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? i(
    S,
    e._path
  ).stateMapNoRender(
    (f, k, I, v, s) => e._mapFn(f, k, I, v, s)
  ) : null;
}
function Le({
  proxy: e
}) {
  const i = ee(null), S = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const f = u.parentElement, I = Array.from(f.childNodes).indexOf(u);
    let v = f.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", v));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: I,
      effect: e._effect
    };
    t.getState().addSignalElement(S, m);
    const n = t.getState().getNestedState(e._stateKey, e._path);
    let h;
    if (e._effect)
      try {
        h = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (_) {
        console.error("Error evaluating effect function during mount:", _), h = n;
      }
    else
      h = n;
    h !== null && typeof h == "object" && (h = JSON.stringify(h));
    const M = document.createTextNode(String(h));
    u.replaceWith(M);
  }, [e._stateKey, e._path.join("."), e._effect]), re("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function rt(e) {
  const i = Ne(
    (S) => {
      const u = t.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => t.getState().getNestedState(e._stateKey, e._path)
  );
  return re("text", {}, String(i));
}
export {
  ce as $cogsSignal,
  rt as $cogsSignalStore,
  et as addStateOptions,
  tt as createCogsState,
  nt as notifyComponent,
  We as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
