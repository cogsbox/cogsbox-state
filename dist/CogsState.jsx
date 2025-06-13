"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as ue, useRef as re, useEffect as ge, useLayoutEffect as Ae, useMemo as $e, createElement as se, useSyncExternalStore as ke, startTransition as Ve } from "react";
import { transformStateFunc as Ne, isDeepEqual as L, isFunction as Z, getNestedValue as _, getDifferences as pe, updateNestedProperty as J, debounce as Te } from "./utility.js";
import { pushFunc as le, updateFn as te, cutFunc as ne, ValidationWrapper as Pe, FormControlComponent as _e } from "./Functions.jsx";
import be from "superjson";
import { v4 as fe } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ye } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
function ve(e, i) {
  const v = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, m = v(e) || {};
  g(e, {
    ...m,
    ...i
  });
}
function Ie({
  stateKey: e,
  options: i,
  initialOptionsPart: v
}) {
  const g = K(e) || {}, m = v[e] || {}, $ = r.getState().setInitialStateOptions, w = { ...m, ...g };
  let I = !1;
  if (i)
    for (const s in i)
      w.hasOwnProperty(s) ? (s == "localStorage" && i[s] && w[s].key !== i[s]?.key && (I = !0, w[s] = i[s]), s == "initialState" && i[s] && w[s] !== i[s] && // Different references
      !L(w[s], i[s]) && (I = !0, w[s] = i[s])) : (I = !0, w[s] = i[s]);
  I && $(e, w);
}
function Xe(e, { formElements: i, validation: v }) {
  return { initialState: e, formElements: i, validation: v };
}
const Qe = (e, i) => {
  let v = e;
  const [g, m] = Ne(v);
  (Object.keys(m).length > 0 || i && Object.keys(i).length > 0) && Object.keys(m).forEach((I) => {
    m[I] = m[I] || {}, m[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...m[I].formElements || {}
      // State-specific overrides
    }, K(I) || r.getState().setInitialStateOptions(I, m[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const $ = (I, s) => {
    const [y] = ue(s?.componentId ?? fe());
    Ie({
      stateKey: I,
      options: s,
      initialOptionsPart: m
    });
    const n = r.getState().cogsStateStore[I] || g[I], h = s?.modifyState ? s.modifyState(n) : n, [M, b] = Me(
      h,
      {
        stateKey: I,
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
    return b;
  };
  function w(I, s) {
    Ie({ stateKey: I, options: s, initialOptionsPart: m }), s.localStorage && je(I, s), ce(I);
  }
  return { useCogsState: $, setCogsOptions: w };
}, {
  setUpdaterState: ae,
  setState: H,
  getInitialOptions: K,
  getKeyState: Ee,
  getValidationErrors: Ce,
  setStateLog: xe,
  updateInitialStateGlobal: Se,
  addValidationError: Fe,
  removeValidationError: B,
  setServerSyncActions: Oe
} = r.getState(), he = (e, i, v, g, m) => {
  v?.log && console.log(
    "saving to localstorage",
    i,
    v.localStorage?.key,
    g
  );
  const $ = Z(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if ($ && g) {
    const w = `${g}-${i}-${$}`;
    let I;
    try {
      I = ie(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: m ?? I
    }, y = be.serialize(s);
    window.localStorage.setItem(
      w,
      JSON.stringify(y.json)
    );
  }
}, ie = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, je = (e, i) => {
  const v = r.getState().cogsStateStore[e], { sessionId: g } = we(), m = Z(i?.localStorage?.key) ? i.localStorage.key(v) : i?.localStorage?.key;
  if (m && g) {
    const $ = ie(
      `${g}-${e}-${m}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return H(e, $.state), ce(e), !0;
  }
  return !1;
}, Ue = (e, i, v, g, m, $) => {
  const w = {
    initialState: i,
    updaterState: oe(
      e,
      g,
      m,
      $
    ),
    state: v
  };
  Se(e, w.initialState), ae(e, w.updaterState), H(e, w.state);
}, ce = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const v = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || v.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((g) => g());
  });
}, Ke = (e, i) => {
  const v = r.getState().stateComponents.get(e);
  if (v) {
    const g = `${e}////${i}`, m = v.components.get(g);
    if ((m ? Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"] : null)?.includes("none"))
      return;
    m && m.forceUpdate();
  }
}, Re = (e, i, v, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: _(i, g),
        newValue: _(v, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: _(v, g)
      };
    case "cut":
      return {
        oldValue: _(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Me(e, {
  stateKey: i,
  serverSync: v,
  localStorage: g,
  formElements: m,
  reactiveDeps: $,
  reactiveType: w,
  componentId: I,
  initialState: s,
  syncUpdate: y,
  dependencies: n,
  serverState: h
} = {}) {
  const [M, b] = ue({}), { sessionId: C } = we();
  let W = !i;
  const [S] = ue(i ?? fe()), l = r.getState().stateLog[S], ee = re(/* @__PURE__ */ new Set()), z = re(I ?? fe()), x = re(
    null
  );
  x.current = K(S) ?? null, ge(() => {
    if (y && y.stateKey === S && y.path?.[0]) {
      H(S, (a) => ({
        ...a,
        [y.path[0]]: y.newValue
      }));
      const o = `${y.stateKey}:${y.path.join(".")}`;
      r.getState().setSyncInfo(o, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), ge(() => {
    if (s) {
      ve(S, {
        initialState: s
      });
      const o = x.current, c = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, p = r.getState().initialStateGlobal[S];
      if (!(p && !L(p, s) || !p) && !c)
        return;
      let f = null;
      const V = Z(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      V && C && (f = ie(`${C}-${S}-${V}`));
      let N = s, R = !1;
      const q = c ? Date.now() : 0, Y = f?.lastUpdated || 0, X = f?.lastSyncedWithServer || 0;
      c && q > Y ? (N = o.serverState.data, R = !0) : f && Y > X && (N = f.state, o?.localStorage?.onChange && o?.localStorage?.onChange(N)), Ue(
        S,
        s,
        N,
        d,
        z.current,
        C
      ), R && V && C && he(N, S, o, C, Date.now()), ce(S), (Array.isArray(w) ? w : [w || "component"]).includes("none") || b({});
    }
  }, [
    s,
    h?.status,
    h?.data,
    ...n || []
  ]), Ae(() => {
    W && ve(S, {
      serverSync: v,
      formElements: m,
      initialState: s,
      localStorage: g,
      middleware: x.current?.middleware
    });
    const o = `${S}////${z.current}`, a = r.getState().stateComponents.get(S) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => b({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), r.getState().stateComponents.set(S, a), b({}), () => {
      const c = `${S}////${z.current}`;
      a && (a.components.delete(c), a.components.size === 0 && r.getState().stateComponents.delete(S));
    };
  }, []);
  const d = (o, a, c, p) => {
    if (Array.isArray(a)) {
      const u = `${S}-${a.join(".")}`;
      ee.current.add(u);
    }
    H(S, (u) => {
      const f = Z(o) ? o(u) : o, V = `${S}-${a.join(".")}`;
      if (V) {
        let j = !1, k = r.getState().signalDomElements.get(V);
        if ((!k || k.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const O = a.slice(0, -1), U = _(f, O);
          if (Array.isArray(U)) {
            j = !0;
            const A = `${S}-${O.join(".")}`;
            k = r.getState().signalDomElements.get(A);
          }
        }
        if (k) {
          const O = j ? _(f, a.slice(0, -1)) : _(f, a);
          k.forEach(({ parentId: U, position: A, effect: F }) => {
            const E = document.querySelector(
              `[data-parent-id="${U}"]`
            );
            if (E) {
              const P = Array.from(E.childNodes);
              if (P[A]) {
                const T = F ? new Function("state", `return (${F})(state)`)(O) : O;
                P[A].textContent = String(T);
              }
            }
          });
        }
      }
      c.updateType === "update" && (p || x.current?.validation?.key) && a && B(
        (p || x.current?.validation?.key) + "." + a.join(".")
      );
      const N = a.slice(0, a.length - 1);
      c.updateType === "cut" && x.current?.validation?.key && B(
        x.current?.validation?.key + "." + N.join(".")
      ), c.updateType === "insert" && x.current?.validation?.key && Ce(
        x.current?.validation?.key + "." + N.join(".")
      ).filter(([k, O]) => {
        let U = k?.split(".").length;
        if (k == N.join(".") && U == N.length - 1) {
          let A = k + "." + N;
          B(k), Fe(A, O);
        }
      });
      const R = r.getState().stateComponents.get(S);
      if (R) {
        const j = pe(u, f), k = new Set(j), O = c.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          U,
          A
        ] of R.components.entries()) {
          let F = !1;
          const E = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (!E.includes("none")) {
            if (E.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (E.includes("component") && ((A.paths.has(O) || A.paths.has("")) && (F = !0), !F))
              for (const P of k) {
                let T = P;
                for (; ; ) {
                  if (A.paths.has(T)) {
                    F = !0;
                    break;
                  }
                  const D = T.lastIndexOf(".");
                  if (D !== -1) {
                    const G = T.substring(
                      0,
                      D
                    );
                    if (!isNaN(
                      Number(T.substring(D + 1))
                    ) && A.paths.has(G)) {
                      F = !0;
                      break;
                    }
                    T = G;
                  } else
                    T = "";
                  if (T === "")
                    break;
                }
                if (F) break;
              }
            if (!F && E.includes("deps") && A.depsFunction) {
              const P = A.depsFunction(f);
              let T = !1;
              typeof P == "boolean" ? P && (T = !0) : L(A.deps, P) || (A.deps = P, T = !0), T && (F = !0);
            }
            F && A.forceUpdate();
          }
        }
      }
      const q = Date.now();
      a = a.map((j, k) => {
        const O = a.slice(0, -1), U = _(f, O);
        return k === a.length - 1 && ["insert", "cut"].includes(c.updateType) ? (U.length - 1).toString() : j;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        c.updateType,
        u,
        f,
        a
      );
      const { oldValue: Y, newValue: X } = Re(
        c.updateType,
        u,
        f,
        a
      ), Q = {
        timeStamp: q,
        stateKey: S,
        path: a,
        updateType: c.updateType,
        status: "new",
        oldValue: Y,
        newValue: X
      };
      if (xe(S, (j) => {
        const O = [...j ?? [], Q].reduce((U, A) => {
          const F = `${A.stateKey}:${JSON.stringify(A.path)}`, E = U.get(F);
          return E ? (E.timeStamp = Math.max(E.timeStamp, A.timeStamp), E.newValue = A.newValue, E.oldValue = E.oldValue ?? A.oldValue, E.updateType = A.updateType) : U.set(F, { ...A }), U;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), he(
        f,
        S,
        x.current,
        C
      ), x.current?.middleware && x.current.middleware({
        updateLog: l,
        update: Q
      }), x.current?.serverSync) {
        const j = r.getState().serverState[S], k = x.current?.serverSync;
        Oe(S, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: f }),
          rollBackState: j,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return f;
    });
  };
  r.getState().updaterState[S] || (ae(
    S,
    oe(
      S,
      d,
      z.current,
      C
    )
  ), r.getState().cogsStateStore[S] || H(S, e), r.getState().initialStateGlobal[S] || Se(S, e));
  const t = $e(() => oe(
    S,
    d,
    z.current,
    C
  ), [S]);
  return [Ee(S), t];
}
function oe(e, i, v, g) {
  const m = /* @__PURE__ */ new Map();
  let $ = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [h] of m)
      (h === n || h.startsWith(n + ".")) && m.delete(h);
    $++;
  }, I = {
    removeValidation: (y) => {
      y?.validationKey && B(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = r.getState().getInitialOptions(e)?.validation;
      n?.key && B(n?.key), y?.validationKey && B(y.validationKey);
      const h = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), m.clear(), $++;
      const M = s(h, []), b = K(e), C = Z(b?.localStorage?.key) ? b?.localStorage?.key(h) : b?.localStorage?.key, W = `${g}-${e}-${C}`;
      W && localStorage.removeItem(W), ae(e, M), H(e, h);
      const S = r.getState().stateComponents.get(e);
      return S && S.components.forEach((l) => {
        l.forceUpdate();
      }), h;
    },
    updateInitialState: (y) => {
      m.clear(), $++;
      const n = oe(
        e,
        i,
        v,
        g
      ), h = r.getState().initialStateGlobal[e], M = K(e), b = Z(M?.localStorage?.key) ? M?.localStorage?.key(h) : M?.localStorage?.key, C = `${g}-${e}-${b}`;
      return console.log("removing storage", C), localStorage.getItem(C) && localStorage.removeItem(C), Ve(() => {
        Se(e, y), ae(e, n), H(e, y);
        const W = r.getState().stateComponents.get(e);
        W && W.components.forEach((S) => {
          S.forceUpdate();
        });
      }), {
        fetchId: (W) => n.get()[W]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const y = r.getState().serverState[e];
      return !!(y && L(y, Ee(e)));
    }
  };
  function s(y, n = [], h) {
    const M = n.map(String).join(".");
    m.get(M);
    const b = function() {
      return r().getNestedState(e, n);
    };
    Object.keys(I).forEach((S) => {
      b[S] = I[S];
    });
    const C = {
      apply(S, l, ee) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, n);
      },
      get(S, l) {
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender") {
          const d = n.join("."), t = `${e}////${v}`, o = r.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(t);
            a && (n.length > 0 || l === "get") && a.paths.add(d);
          }
        }
        if (l === "getDifferences")
          return () => pe(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(e), t = d?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const c = await t.action(o);
              if (c && !c.success && c.errors && a) {
                r.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const f = [a, ...u.path].join(".");
                  r.getState().addValidationError(f, u.message);
                });
                const p = r.getState().stateComponents.get(e);
                p && p.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && t.onSuccess ? t.onSuccess(c.data) : !c?.success && t.onError && t.onError(c.error), c;
            } catch (c) {
              return t.onError && t.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(e, n), t = r.getState().initialStateGlobal[e], o = _(t, n);
          return L(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              n
            ), t = r.getState().initialStateGlobal[e], o = _(t, n);
            return L(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[e], t = K(e), o = Z(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, a = `${g}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(y)) {
          const d = () => h?.validIndices ? y.map((o, a) => ({
            item: o,
            originalIndex: h.validIndices[a]
          })) : r.getState().getNestedState(e, n).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const t = r.getState().getSelectedIndex(e, n.join("."));
              if (t !== void 0)
                return s(
                  y[t],
                  [...n, t.toString()],
                  h
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: n });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, n.join(".")) ?? -1;
          if (l === "stateSort")
            return (t) => {
              const a = [...d()].sort(
                (u, f) => t(u.item, f.item)
              ), c = a.map(({ item: u }) => u), p = {
                ...h,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, n, p);
            };
          if (l === "stateFilter")
            return (t) => {
              const a = d().filter(
                ({ item: u }, f) => t(u, f)
              ), c = a.map(({ item: u }) => u), p = {
                ...h,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, n, p);
            };
          if (l === "stateMap" || l === "stateMapNoRender")
            return (t) => y.map((a, c) => {
              let p;
              h?.validIndices && h.validIndices[c] !== void 0 ? p = h.validIndices[c] : p = c;
              const u = [...n, p.toString()], f = s(a, u, h);
              return t(
                a,
                f,
                c,
                y,
                s(y, n, h)
              );
            });
          if (l === "$stateMap")
            return (t) => se(We, {
              proxy: {
                _stateKey: e,
                _path: n,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateFlattenOn")
            return (t) => {
              const o = y;
              m.clear(), $++;
              const a = o.flatMap(
                (c) => c[t] ?? []
              );
              return s(
                a,
                [...n, "[*]", t],
                h
              );
            };
          if (l === "index")
            return (t) => {
              const o = y[t];
              return s(o, [...n, t.toString()]);
            };
          if (l === "last")
            return () => {
              const t = r.getState().getNestedState(e, n);
              if (t.length === 0) return;
              const o = t.length - 1, a = t[o], c = [...n, o.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (t) => (w(n), le(i, t, n, e), s(
              r.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, o, a) => {
              const c = r.getState().getNestedState(e, n), p = Z(t) ? t(c) : t;
              let u = null;
              if (!c.some((V) => {
                if (o) {
                  const R = o.every(
                    (q) => L(V[q], p[q])
                  );
                  return R && (u = V), R;
                }
                const N = L(V, p);
                return N && (u = V), N;
              }))
                w(n), le(i, p, n, e);
              else if (a && u) {
                const V = a(u), N = c.map(
                  (R) => L(R, u) ? V : R
                );
                w(n), te(i, N, n);
              }
            };
          if (l === "cut")
            return (t, o) => {
              if (!o?.waitForSync)
                return w(n), ne(i, n, e, t), s(
                  r.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let o = 0; o < y.length; o++)
                y[o] === t && ne(i, n, e, o);
            };
          if (l === "toggleByValue")
            return (t) => {
              const o = y.findIndex((a) => a === t);
              o > -1 ? ne(i, n, e, o) : le(i, t, n, e);
            };
          if (l === "stateFind")
            return (t) => {
              const a = d().find(
                ({ item: p }, u) => t(p, u)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return s(a.item, c, h);
            };
          if (l === "findWith")
            return (t, o) => {
              const c = d().find(
                ({ item: u }) => u[t] === o
              );
              if (!c) return;
              const p = [...n, c.originalIndex.toString()];
              return s(c.item, p, h);
            };
        }
        const ee = n[n.length - 1];
        if (!isNaN(Number(ee))) {
          const d = n.slice(0, -1), t = r.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => ne(
              i,
              d,
              e,
              Number(ee)
            );
        }
        if (l === "get")
          return () => r.getState().getNestedState(e, n);
        if (l === "$derive")
          return (d) => de({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$derive")
          return (d) => de({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => de({
            _stateKey: e,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${e}:${n.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ie(g + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), t = d.join("."), o = r.getState().getNestedState(e, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const t = n.slice(0, -1), o = Number(n[n.length - 1]), a = t.join(".");
            d ? r.getState().setSelectedIndex(e, a, o) : r.getState().setSelectedIndex(e, a, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            te(i, c, t), w(t);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), t = Number(n[n.length - 1]), o = d.join("."), a = r.getState().getSelectedIndex(e, o);
            r.getState().setSelectedIndex(
              e,
              o,
              a === t ? void 0 : t
            );
            const c = r.getState().getNestedState(e, [...d]);
            te(i, c, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              let t = r.getState().cogsStateStore[e];
              d.forEach((a) => {
                const { op: c, path: p, value: u } = a, f = p.slice(1).split("/").map((V) => V.replace(/~1/g, "/").replace(/~0/g, "~"));
                switch (c) {
                  case "add":
                    if (f.length === 0)
                      t = u;
                    else {
                      const E = f.slice(0, -1), P = f[f.length - 1], T = _(t, E);
                      if (Array.isArray(T)) {
                        const D = P === "-" ? T.length : parseInt(P), G = [...T];
                        G.splice(D, 0, u), t = J(
                          E,
                          t,
                          G
                        );
                      } else {
                        const D = { ...T, [P]: u };
                        t = J(
                          E,
                          t,
                          D
                        );
                      }
                    }
                    break;
                  case "replace":
                    t = J(
                      f,
                      t,
                      u
                    );
                    break;
                  case "remove":
                    if (f.length === 0)
                      t = void 0;
                    else {
                      const E = f.slice(0, -1), P = f[f.length - 1], T = _(t, E);
                      if (Array.isArray(T)) {
                        const D = parseInt(P), G = [...T];
                        G.splice(D, 1), t = J(
                          E,
                          t,
                          G
                        );
                      } else {
                        const { [P]: D, ...G } = T;
                        t = J(
                          E,
                          t,
                          G
                        );
                      }
                    }
                    break;
                  case "move":
                    const { from: V } = a, N = V.slice(1).split("/").map(
                      (E) => E.replace(/~1/g, "/").replace(/~0/g, "~")
                    ), R = _(t, N), q = N.slice(0, -1), Y = N[N.length - 1], X = _(
                      t,
                      q
                    );
                    if (Array.isArray(X)) {
                      const E = [...X];
                      E.splice(parseInt(Y), 1), t = J(
                        q,
                        t,
                        E
                      );
                    }
                    const Q = f.slice(0, -1), j = f[f.length - 1], k = _(t, Q);
                    if (Array.isArray(k)) {
                      const E = j === "-" ? k.length : parseInt(j), P = [...k];
                      P.splice(E, 0, R), t = J(
                        Q,
                        t,
                        P
                      );
                    }
                    break;
                  case "copy":
                    const { from: O } = a, U = O.slice(1).split("/").map(
                      (E) => E.replace(/~1/g, "/").replace(/~0/g, "~")
                    ), A = _(
                      t,
                      U
                    );
                    t = J(
                      f,
                      t,
                      A
                    );
                    break;
                  case "test":
                    const F = _(t, f);
                    if (!L(F, u))
                      throw new Error(
                        `Test operation failed at path ${p}`
                      );
                    break;
                }
              }), H(e, t);
              const o = r.getState().stateComponents.get(e);
              if (o) {
                const a = /* @__PURE__ */ new Set();
                d.forEach((c) => {
                  const p = c.path.slice(1).split("/").map(
                    (u) => u.replace(/~1/g, "/").replace(/~0/g, "~")
                  );
                  for (let u = 0; u <= p.length; u++)
                    a.add(p.slice(0, u).join("."));
                }), o.components.forEach((c, p) => {
                  Array.from(c.paths).some(
                    (f) => Array.from(a).some((V) => f === V || f.startsWith(V + ".") || V.startsWith(f + "."))
                  ) && c.forceUpdate();
                });
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = r.getState().getInitialOptions(e)?.validation, t = r.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              B(d.key);
              const o = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([p]) => {
                  p && p.startsWith(d.key) && B(p);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const f = u.path, V = u.message, N = [d.key, ...f].join(".");
                  t(N, V);
                }), ce(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return v;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => ye.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return r.getState().serverState[e];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
        }
        if (l === "getFormRef")
          return () => ye.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ me(
            Pe,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: h?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, t) => {
            if (t?.debounce)
              Te(() => {
                te(i, d, n, "");
                const o = r.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(o);
              }, t.debounce);
            else {
              te(i, d, n, "");
              const o = r.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(o);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ me(
            _e,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: t
            }
          );
        const z = [...n, l], x = r.getState().getNestedState(e, z);
        return s(x, z, h);
      }
    }, W = new Proxy(b, C);
    return m.set(M, {
      proxy: W,
      stateVersion: $
    }), W;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function de(e) {
  return se(De, { proxy: e });
}
function We({
  proxy: e,
  rebuildStateShape: i
}) {
  const v = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(v) ? i(
    v,
    e._path
  ).stateMapNoRender(
    (m, $, w, I, s) => e._mapFn(m, $, w, I, s)
  ) : null;
}
function De({
  proxy: e
}) {
  const i = re(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return ge(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const m = g.parentElement, w = Array.from(m.childNodes).indexOf(g);
    let I = m.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, m.setAttribute("data-parent-id", I));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: e._effect
    };
    r.getState().addSignalElement(v, y);
    const n = r.getState().getNestedState(e._stateKey, e._path);
    let h;
    if (e._effect)
      try {
        h = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (b) {
        console.error("Error evaluating effect function during mount:", b), h = n;
      }
    else
      h = n;
    h !== null && typeof h == "object" && (h = JSON.stringify(h));
    const M = document.createTextNode(String(h));
    g.replaceWith(M);
  }, [e._stateKey, e._path.join("."), e._effect]), se("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function et(e) {
  const i = ke(
    (v) => {
      const g = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: v,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return se("text", {}, String(i));
}
export {
  de as $cogsSignal,
  et as $cogsSignalStore,
  Xe as addStateOptions,
  Qe as createCogsState,
  Ke as notifyComponent,
  Me as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
