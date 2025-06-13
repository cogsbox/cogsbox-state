"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as le, useRef as te, useEffect as de, useLayoutEffect as Ae, useMemo as $e, createElement as ae, useSyncExternalStore as ke, startTransition as Ne } from "react";
import { transformStateFunc as Ve, isDeepEqual as L, isFunction as J, getNestedValue as W, getDifferences as he, debounce as Pe } from "./utility.js";
import { pushFunc as ee, updateFn as D, cutFunc as Y, ValidationWrapper as Te, FormControlComponent as pe } from "./Functions.jsx";
import _e from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as t, formRefStore as me } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
function ye(e, o) {
  const I = t.getState().getInitialOptions, u = t.getState().setInitialStateOptions, S = I(e) || {};
  u(e, {
    ...S,
    ...o
  });
}
function Ie({
  stateKey: e,
  options: o,
  initialOptionsPart: I
}) {
  const u = X(e) || {}, S = I[e] || {}, $ = t.getState().setInitialStateOptions, w = { ...S, ...u };
  let v = !1;
  if (o)
    for (const s in o)
      w.hasOwnProperty(s) ? (s == "localStorage" && o[s] && w[s].key !== o[s]?.key && (v = !0, w[s] = o[s]), s == "initialState" && o[s] && w[s] !== o[s] && // Different references
      !L(w[s], o[s]) && (v = !0, w[s] = o[s])) : (v = !0, w[s] = o[s]);
  v && $(e, w);
}
function Ye(e, { formElements: o, validation: I }) {
  return { initialState: e, formElements: o, validation: I };
}
const Xe = (e, o) => {
  let I = e;
  const [u, S] = Ve(I);
  (Object.keys(S).length > 0 || o && Object.keys(o).length > 0) && Object.keys(S).forEach((v) => {
    S[v] = S[v] || {}, S[v].formElements = {
      ...o?.formElements,
      // Global defaults first
      ...o?.validation,
      ...S[v].formElements || {}
      // State-specific overrides
    }, X(v) || t.getState().setInitialStateOptions(v, S[v]);
  }), t.getState().setInitialStates(u), t.getState().setCreatedState(u);
  const $ = (v, s) => {
    const [y] = le(s?.componentId ?? ue());
    Ie({
      stateKey: v,
      options: s,
      initialOptionsPart: S
    });
    const n = t.getState().cogsStateStore[v] || u[v], h = s?.modifyState ? s.modifyState(n) : n, [R, T] = Me(
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
    return T;
  };
  function w(v, s) {
    Ie({ stateKey: v, options: s, initialOptionsPart: S }), s.localStorage && Fe(v, s), ie(v);
  }
  return { useCogsState: $, setCogsOptions: w };
}, {
  setUpdaterState: ne,
  setState: Z,
  getInitialOptions: X,
  getKeyState: Ee,
  getValidationErrors: xe,
  setStateLog: be,
  updateInitialStateGlobal: ge,
  addValidationError: Ce,
  removeValidationError: z,
  setServerSyncActions: Oe
} = t.getState(), ve = (e, o, I, u, S) => {
  I?.log && console.log(
    "saving to localstorage",
    o,
    I.localStorage?.key,
    u
  );
  const $ = J(I?.localStorage?.key) ? I.localStorage?.key(e) : I?.localStorage?.key;
  if ($ && u) {
    const w = `${u}-${o}-${$}`;
    let v;
    try {
      v = oe(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: S ?? v
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
  const I = t.getState().cogsStateStore[e], { sessionId: u } = we(), S = J(o?.localStorage?.key) ? o.localStorage.key(I) : o?.localStorage?.key;
  if (S && u) {
    const $ = oe(
      `${u}-${e}-${S}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return Z(e, $.state), ie(e), !0;
  }
  return !1;
}, je = (e, o, I, u, S, $) => {
  const w = {
    initialState: o,
    updaterState: re(
      e,
      u,
      S,
      $
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
    const u = `${e}////${o}`, S = I.components.get(u);
    if ((S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none"))
      return;
    S && S.forceUpdate();
  }
}, Re = (e, o, I, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: W(o, u),
        newValue: W(I, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: W(I, u)
      };
    case "cut":
      return {
        oldValue: W(o, u),
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
  formElements: S,
  reactiveDeps: $,
  reactiveType: w,
  componentId: v,
  initialState: s,
  syncUpdate: y,
  dependencies: n,
  serverState: h
} = {}) {
  const [R, T] = le({}), { sessionId: p } = we();
  let M = !o;
  const [f] = le(o ?? ue()), l = t.getState().stateLog[f], Q = te(/* @__PURE__ */ new Set()), q = te(v ?? ue()), _ = te(
    null
  );
  _.current = X(f) ?? null, de(() => {
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
      const i = _.current, c = i?.serverState?.id !== void 0 && i?.serverState?.status === "success" && i?.serverState?.data, m = t.getState().initialStateGlobal[f];
      if (!(m && !L(m, s) || !m) && !c)
        return;
      let A = null;
      const P = J(i?.localStorage?.key) ? i?.localStorage?.key(s) : i?.localStorage?.key;
      P && p && (A = oe(`${p}-${f}-${P}`));
      let V = s, F = !1;
      const U = c ? Date.now() : 0, B = A?.lastUpdated || 0, H = A?.lastSyncedWithServer || 0;
      c && U > B ? (V = i.serverState.data, F = !0) : A && B > H && (V = A.state, i?.localStorage?.onChange && i?.localStorage?.onChange(V)), je(
        f,
        s,
        V,
        d,
        q.current,
        p
      ), F && P && p && ve(V, f, i, p, Date.now()), ie(f), (Array.isArray(w) ? w : [w || "component"]).includes("none") || T({});
    }
  }, [
    s,
    h?.status,
    h?.data,
    ...n || []
  ]), Ae(() => {
    M && ye(f, {
      serverSync: I,
      formElements: S,
      initialState: s,
      localStorage: u,
      middleware: _.current?.middleware
    });
    const i = `${f}////${q.current}`, a = t.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(i, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), t.getState().stateComponents.set(f, a), T({}), () => {
      const c = `${f}////${q.current}`;
      a && (a.components.delete(c), a.components.size === 0 && t.getState().stateComponents.delete(f));
    };
  }, []);
  const d = (i, a, c, m) => {
    if (Array.isArray(a)) {
      const g = `${f}-${a.join(".")}`;
      Q.current.add(g);
    }
    Z(f, (g) => {
      const A = J(i) ? i(g) : i, P = `${f}-${a.join(".")}`;
      if (P) {
        let b = !1, N = t.getState().signalDomElements.get(P);
        if ((!N || N.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const k = a.slice(0, -1), x = W(A, k);
          if (Array.isArray(x)) {
            b = !0;
            const E = `${f}-${k.join(".")}`;
            N = t.getState().signalDomElements.get(E);
          }
        }
        if (N) {
          const k = b ? W(A, a.slice(0, -1)) : W(A, a);
          N.forEach(({ parentId: x, position: E, effect: O }) => {
            const C = document.querySelector(
              `[data-parent-id="${x}"]`
            );
            if (C) {
              const G = Array.from(C.childNodes);
              if (G[E]) {
                const j = O ? new Function("state", `return (${O})(state)`)(k) : k;
                G[E].textContent = String(j);
              }
            }
          });
        }
      }
      c.updateType === "update" && (m || _.current?.validation?.key) && a && z(
        (m || _.current?.validation?.key) + "." + a.join(".")
      );
      const V = a.slice(0, a.length - 1);
      c.updateType === "cut" && _.current?.validation?.key && z(
        _.current?.validation?.key + "." + V.join(".")
      ), c.updateType === "insert" && _.current?.validation?.key && xe(
        _.current?.validation?.key + "." + V.join(".")
      ).filter(([N, k]) => {
        let x = N?.split(".").length;
        if (N == V.join(".") && x == V.length - 1) {
          let E = N + "." + V;
          z(N), Ce(E, k);
        }
      });
      const F = t.getState().stateComponents.get(f);
      if (F) {
        const b = he(g, A), N = new Set(b), k = c.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          x,
          E
        ] of F.components.entries()) {
          let O = !1;
          const C = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((E.paths.has(k) || E.paths.has("")) && (O = !0), !O))
              for (const G of N) {
                let j = G;
                for (; ; ) {
                  if (E.paths.has(j)) {
                    O = !0;
                    break;
                  }
                  const se = j.lastIndexOf(".");
                  if (se !== -1) {
                    const fe = j.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(j.substring(se + 1))
                    ) && E.paths.has(fe)) {
                      O = !0;
                      break;
                    }
                    j = fe;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (O) break;
              }
            if (!O && C.includes("deps") && E.depsFunction) {
              const G = E.depsFunction(A);
              let j = !1;
              typeof G == "boolean" ? G && (j = !0) : L(E.deps, G) || (E.deps = G, j = !0), j && (O = !0);
            }
            O && E.forceUpdate();
          }
        }
      }
      const U = Date.now();
      a = a.map((b, N) => {
        const k = a.slice(0, -1), x = W(A, k);
        return N === a.length - 1 && ["insert", "cut"].includes(c.updateType) ? (x.length - 1).toString() : b;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        c.updateType,
        g,
        A,
        a
      );
      const { oldValue: B, newValue: H } = Re(
        c.updateType,
        g,
        A,
        a
      ), K = {
        timeStamp: U,
        stateKey: f,
        path: a,
        updateType: c.updateType,
        status: "new",
        oldValue: B,
        newValue: H
      };
      if (be(f, (b) => {
        const k = [...b ?? [], K].reduce((x, E) => {
          const O = `${E.stateKey}:${JSON.stringify(E.path)}`, C = x.get(O);
          return C ? (C.timeStamp = Math.max(C.timeStamp, E.timeStamp), C.newValue = E.newValue, C.oldValue = C.oldValue ?? E.oldValue, C.updateType = E.updateType) : x.set(O, { ...E }), x;
        }, /* @__PURE__ */ new Map());
        return Array.from(k.values());
      }), ve(
        A,
        f,
        _.current,
        p
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: K
      }), _.current?.serverSync) {
        const b = t.getState().serverState[f], N = _.current?.serverSync;
        Oe(f, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: A }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  t.getState().updaterState[f] || (ne(
    f,
    re(
      f,
      d,
      q.current,
      p
    )
  ), t.getState().cogsStateStore[f] || Z(f, e), t.getState().initialStateGlobal[f] || ge(f, e));
  const r = $e(() => re(
    f,
    d,
    q.current,
    p
  ), [f]);
  return [Ee(f), r];
}
function re(e, o, I, u) {
  const S = /* @__PURE__ */ new Map();
  let $ = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [h] of S)
      (h === n || h.startsWith(n + ".")) && S.delete(h);
    $++;
  }, v = {
    removeValidation: (y) => {
      y?.validationKey && z(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = t.getState().getInitialOptions(e)?.validation;
      n?.key && z(n?.key), y?.validationKey && z(y.validationKey);
      const h = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), S.clear(), $++;
      const R = s(h, []), T = X(e), p = J(T?.localStorage?.key) ? T?.localStorage?.key(h) : T?.localStorage?.key, M = `${u}-${e}-${p}`;
      M && localStorage.removeItem(M), ne(e, R), Z(e, h);
      const f = t.getState().stateComponents.get(e);
      return f && f.components.forEach((l) => {
        l.forceUpdate();
      }), h;
    },
    updateInitialState: (y) => {
      S.clear(), $++;
      const n = re(
        e,
        o,
        I,
        u
      ), h = t.getState().initialStateGlobal[e], R = X(e), T = J(R?.localStorage?.key) ? R?.localStorage?.key(h) : R?.localStorage?.key, p = `${u}-${e}-${T}`;
      return console.log("removing storage", p), localStorage.getItem(p) && localStorage.removeItem(p), Ne(() => {
        ge(e, y), ne(e, n), Z(e, y);
        const M = t.getState().stateComponents.get(e);
        M && M.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (M) => n.get()[M]
      };
    },
    _initialState: t.getState().initialStateGlobal[e],
    _serverState: t.getState().serverState[e],
    _isLoading: t.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const y = t.getState().serverState[e];
      return !!(y && L(y, Ee(e)));
    }
  };
  function s(y, n = [], h) {
    const R = n.map(String).join(".");
    S.get(R);
    const T = function() {
      return t().getNestedState(e, n);
    };
    Object.keys(v).forEach((f) => {
      T[f] = v[f];
    });
    const p = {
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
                  const A = [a, ...g.path].join(".");
                  t.getState().addValidationError(A, g.message);
                });
                const m = t.getState().stateComponents.get(e);
                m && m.components.forEach((g) => {
                  g.forceUpdate();
                });
              }
              return c?.success && r.onSuccess ? r.onSuccess(c.data) : !c?.success && r.onError && r.onError(c.error), c;
            } catch (c) {
              return r.onError && r.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = t.getState().getNestedState(e, n), r = t.getState().initialStateGlobal[e], i = W(r, n);
          return L(d, i) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = t().getNestedState(
              e,
              n
            ), r = t.getState().initialStateGlobal[e], i = W(r, n);
            return L(d, i) ? "fresh" : "stale";
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
                (g, A) => r(g.item, A.item)
              ), c = a.map(({ item: g }) => g), m = {
                ...h,
                validIndices: a.map(
                  ({ originalIndex: g }) => g
                )
              };
              return s(c, n, m);
            };
          if (l === "stateFilter")
            return (r) => {
              const a = d().filter(
                ({ item: g }, A) => r(g, A)
              ), c = a.map(({ item: g }) => g), m = {
                ...h,
                validIndices: a.map(
                  ({ originalIndex: g }) => g
                )
              };
              return s(c, n, m);
            };
          if (l === "stateMap" || l === "stateMapNoRender")
            return (r) => y.map((a, c) => {
              let m;
              h?.validIndices && h.validIndices[c] !== void 0 ? m = h.validIndices[c] : m = c;
              const g = [...n, m.toString()], A = s(a, g, h);
              return r(
                a,
                A,
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
              S.clear(), $++;
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
              const c = t.getState().getNestedState(e, n), m = J(r) ? r(c) : r;
              let g = null;
              if (!c.some((P) => {
                if (i) {
                  const F = i.every(
                    (U) => L(P[U], m[U])
                  );
                  return F && (g = P), F;
                }
                const V = L(P, m);
                return V && (g = P), V;
              }))
                w(n), ee(o, m, n, e);
              else if (a && g) {
                const P = a(g), V = c.map(
                  (F) => L(F, g) ? P : F
                );
                w(n), D(o, V, n);
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
                ({ item: m }, g) => r(m, g)
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
              const m = [...n, c.originalIndex.toString()];
              return s(c.item, m, h);
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
            D(o, c, r), w(r);
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
            D(o, c, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              d.forEach((r) => {
                const { op: i, path: a, value: c } = r, m = a.slice(1).split("/").map((g) => /^\d+$/.test(g) ? g : g.replace(/~1/g, "/").replace(/~0/g, "~"));
                switch (i) {
                  case "add":
                    const g = m.slice(0, -1), A = t.getState().getNestedState(e, g);
                    if (Array.isArray(A)) {
                      const k = m[m.length - 1];
                      if (k === "-" || parseInt(k) === A.length)
                        ee(
                          o,
                          c,
                          g,
                          e
                        );
                      else {
                        const x = parseInt(k), E = [...A];
                        E.splice(x, 0, c), D(
                          o,
                          E,
                          g
                        );
                      }
                    } else
                      D(o, c, m);
                    break;
                  case "replace":
                    D(o, c, m);
                    break;
                  case "remove":
                    const P = m.slice(0, -1), V = t.getState().getNestedState(e, P);
                    if (Array.isArray(V)) {
                      const k = parseInt(
                        m[m.length - 1]
                      );
                      Y(
                        o,
                        P,
                        e,
                        k
                      );
                    } else
                      D(o, void 0, m);
                    break;
                  case "move":
                    const { from: F } = r, U = F.slice(1).split("/"), B = t.getState().getNestedState(e, U), H = U.slice(0, -1), K = t.getState().getNestedState(e, H);
                    if (Array.isArray(K)) {
                      const k = parseInt(
                        U[U.length - 1]
                      );
                      Y(
                        o,
                        H,
                        e,
                        k
                      );
                    }
                    const b = m.slice(0, -1), N = t.getState().getNestedState(e, b);
                    if (Array.isArray(N)) {
                      const k = m[m.length - 1];
                      if (k === "-")
                        ee(
                          o,
                          B,
                          b,
                          e
                        );
                      else {
                        const x = parseInt(k), E = [...N];
                        E.splice(x, 0, B), D(
                          o,
                          E,
                          b
                        );
                      }
                    }
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
                a && a.length > 0 && a.forEach(([m]) => {
                  m && m.startsWith(d.key) && z(m);
                });
                const c = d.zodSchema.safeParse(i);
                return c.success ? !0 : (c.error.errors.forEach((g) => {
                  const A = g.path, P = g.message, V = [d.key, ...A].join(".");
                  r(V, P);
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
              Pe(() => {
                D(o, d, n, "");
                const i = t.getState().getNestedState(e, n);
                r?.afterUpdate && r.afterUpdate(i);
              }, r.debounce);
            else {
              D(o, d, n, "");
              const i = t.getState().getNestedState(e, n);
              r?.afterUpdate && r.afterUpdate(i);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, r) => /* @__PURE__ */ Se(
            pe,
            {
              setState: o,
              stateKey: e,
              path: n,
              child: d,
              formOpts: r
            }
          );
        const q = [...n, l], _ = t.getState().getNestedState(e, q);
        return s(_, q, h);
      }
    }, M = new Proxy(T, p);
    return S.set(R, {
      proxy: M,
      stateVersion: $
    }), M;
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
    (S, $, w, v, s) => e._mapFn(S, $, w, v, s)
  ) : null;
}
function De({
  proxy: e
}) {
  const o = te(null), I = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = o.current;
    if (!u || !u.parentElement) return;
    const S = u.parentElement, w = Array.from(S.childNodes).indexOf(u);
    let v = S.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", v));
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
      } catch (T) {
        console.error("Error evaluating effect function during mount:", T), h = n;
      }
    else
      h = n;
    h !== null && typeof h == "object" && (h = JSON.stringify(h));
    const R = document.createTextNode(String(h));
    u.replaceWith(R);
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
