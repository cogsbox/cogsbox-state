"use client";
import { jsx as ve } from "react/jsx-runtime";
import { useState as ee, useRef as Y, useEffect as oe, useLayoutEffect as ge, useMemo as Ee, createElement as ie, useSyncExternalStore as be, startTransition as ke, useCallback as de } from "react";
import { transformStateFunc as xe, isDeepEqual as L, isFunction as z, getNestedValue as H, getDifferences as fe, debounce as Ve } from "./utility.js";
import { pushFunc as ue, updateFn as K, cutFunc as re, ValidationWrapper as Ne, FormControlComponent as Pe } from "./Functions.jsx";
import Ce from "superjson";
import { v4 as Se } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ye } from "./store.js";
import { useCogsConfig as Te } from "./CogsStateClient.jsx";
import { applyPatch as _e } from "fast-json-patch";
function he(e, i) {
  const h = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, y = h(e) || {};
  f(e, {
    ...y,
    ...i
  });
}
function Ie({
  stateKey: e,
  options: i,
  initialOptionsPart: h
}) {
  const f = Z(e) || {}, y = h[e] || {}, b = r.getState().setInitialStateOptions, E = { ...y, ...f };
  let p = !1;
  if (i)
    for (const s in i)
      E.hasOwnProperty(s) ? (s == "localStorage" && i[s] && E[s].key !== i[s]?.key && (p = !0, E[s] = i[s]), s == "initialState" && i[s] && E[s] !== i[s] && // Different references
      !L(E[s], i[s]) && (p = !0, E[s] = i[s])) : (p = !0, E[s] = i[s]);
  p && b(e, E);
}
function Ke(e, { formElements: i, validation: h }) {
  return { initialState: e, formElements: i, validation: h };
}
const et = (e, i) => {
  let h = e;
  const [f, y] = xe(h);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((p) => {
    y[p] = y[p] || {}, y[p].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[p].formElements || {}
      // State-specific overrides
    }, Z(p) || r.getState().setInitialStateOptions(p, y[p]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const b = (p, s) => {
    const [m] = ee(s?.componentId ?? Se());
    Ie({
      stateKey: p,
      options: s,
      initialOptionsPart: y
    });
    const o = r.getState().cogsStateStore[p] || f[p], S = s?.modifyState ? s.modifyState(o) : o, [W, M] = De(
      S,
      {
        stateKey: p,
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
    return M;
  };
  function E(p, s) {
    Ie({ stateKey: p, options: s, initialOptionsPart: y }), s.localStorage && Fe(p, s), le(p);
  }
  return { useCogsState: b, setCogsOptions: E };
}, {
  setUpdaterState: ae,
  setState: J,
  getInitialOptions: Z,
  getKeyState: $e,
  getValidationErrors: Oe,
  setStateLog: Re,
  updateInitialStateGlobal: me,
  addValidationError: Me,
  removeValidationError: q,
  setServerSyncActions: je
} = r.getState(), pe = (e, i, h, f, y) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    f
  );
  const b = z(h?.localStorage?.key) ? h.localStorage?.key(e) : h?.localStorage?.key;
  if (b && f) {
    const E = `${f}-${i}-${b}`;
    let p;
    try {
      p = ce(E)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? p
    }, m = Ce.serialize(s);
    window.localStorage.setItem(
      E,
      JSON.stringify(m.json)
    );
  }
}, ce = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Fe = (e, i) => {
  const h = r.getState().cogsStateStore[e], { sessionId: f } = Te(), y = z(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (y && f) {
    const b = ce(
      `${f}-${e}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return J(e, b.state), le(e), !0;
  }
  return !1;
}, Ae = (e, i, h, f, y, b) => {
  const E = {
    initialState: i,
    updaterState: se(
      e,
      f,
      y,
      b
    ),
    state: h
  };
  me(e, E.initialState), ae(e, E.updaterState), J(e, E.state);
}, le = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, tt = (e, i) => {
  const h = r.getState().stateComponents.get(e);
  if (h) {
    const f = `${e}////${i}`, y = h.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Ue = (e, i, h, f) => {
  switch (e) {
    case "update":
      return {
        oldValue: H(i, f),
        newValue: H(h, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: H(h, f)
      };
    case "cut":
      return {
        oldValue: H(i, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function De(e, {
  stateKey: i,
  serverSync: h,
  localStorage: f,
  formElements: y,
  reactiveDeps: b,
  reactiveType: E,
  componentId: p,
  initialState: s,
  syncUpdate: m,
  dependencies: o,
  serverState: S
} = {}) {
  const [W, M] = ee({}), { sessionId: j } = Te();
  let G = !i;
  const [v] = ee(i ?? Se()), l = r.getState().stateLog[v], te = Y(/* @__PURE__ */ new Set()), B = Y(p ?? Se()), C = Y(
    null
  );
  C.current = Z(v) ?? null, oe(() => {
    if (m && m.stateKey === v && m.path?.[0]) {
      J(v, (n) => ({
        ...n,
        [m.path[0]]: m.newValue
      }));
      const t = `${m.stateKey}:${m.path.join(".")}`;
      r.getState().setSyncInfo(t, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), oe(() => {
    if (s) {
      he(v, {
        initialState: s
      });
      const t = C.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[v];
      if (!(c && !L(c, s) || !c) && !a)
        return;
      let u = null;
      const $ = z(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      $ && j && (u = ce(`${j}-${v}-${$}`));
      let w = s, A = !1;
      const x = a ? Date.now() : 0, N = u?.lastUpdated || 0, _ = u?.lastSyncedWithServer || 0;
      a && x > N ? (w = t.serverState.data, A = !0) : u && N > _ && (w = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(w)), Ae(
        v,
        s,
        w,
        X,
        B.current,
        j
      ), A && $ && j && pe(w, v, t, j, Date.now()), le(v), (Array.isArray(E) ? E : [E || "component"]).includes("none") || M({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...o || []
  ]), ge(() => {
    G && he(v, {
      serverSync: h,
      formElements: y,
      initialState: s,
      localStorage: f,
      middleware: C.current?.middleware
    });
    const t = `${v}////${B.current}`, n = r.getState().stateComponents.get(v) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(t, {
      forceUpdate: () => M({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(v, n), M({}), () => {
      const a = `${v}////${B.current}`;
      n && (n.components.delete(a), n.components.size === 0 && r.getState().stateComponents.delete(v));
    };
  }, []);
  const X = (t, n, a, c) => {
    if (Array.isArray(n)) {
      const g = `${v}-${n.join(".")}`;
      te.current.add(g);
    }
    J(v, (g) => {
      const u = z(t) ? t(g) : t, $ = `${v}-${n.join(".")}`;
      if ($) {
        let F = !1, k = r.getState().signalDomElements.get($);
        if ((!k || k.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const O = n.slice(0, -1), T = H(u, O);
          if (Array.isArray(T)) {
            F = !0;
            const I = `${v}-${O.join(".")}`;
            k = r.getState().signalDomElements.get(I);
          }
        }
        if (k) {
          const O = F ? H(u, n.slice(0, -1)) : H(u, n);
          k.forEach(({ parentId: T, position: I, effect: P }) => {
            const V = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (V) {
              const R = Array.from(V.childNodes);
              if (R[I]) {
                const U = P ? new Function("state", `return (${P})(state)`)(O) : O;
                R[I].textContent = String(U);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || C.current?.validation?.key) && n && q(
        (c || C.current?.validation?.key) + "." + n.join(".")
      );
      const w = n.slice(0, n.length - 1);
      a.updateType === "cut" && C.current?.validation?.key && q(
        C.current?.validation?.key + "." + w.join(".")
      ), a.updateType === "insert" && C.current?.validation?.key && Oe(
        C.current?.validation?.key + "." + w.join(".")
      ).filter(([k, O]) => {
        let T = k?.split(".").length;
        if (k == w.join(".") && T == w.length - 1) {
          let I = k + "." + w;
          q(k), Me(I, O);
        }
      });
      const A = r.getState().stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", A), A) {
        const F = fe(g, u), k = new Set(F), O = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          T,
          I
        ] of A.components.entries()) {
          let P = !1;
          const V = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (console.log("component", I), !V.includes("none")) {
            if (V.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (V.includes("component") && ((I.paths.has(O) || I.paths.has("")) && (P = !0), !P))
              for (const R of k) {
                let U = R;
                for (; ; ) {
                  if (I.paths.has(U)) {
                    P = !0;
                    break;
                  }
                  const Q = U.lastIndexOf(".");
                  if (Q !== -1) {
                    const ne = U.substring(
                      0,
                      Q
                    );
                    if (!isNaN(
                      Number(U.substring(Q + 1))
                    ) && I.paths.has(ne)) {
                      P = !0;
                      break;
                    }
                    U = ne;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (P) break;
              }
            if (!P && V.includes("deps") && I.depsFunction) {
              const R = I.depsFunction(u);
              let U = !1;
              typeof R == "boolean" ? R && (U = !0) : L(I.deps, R) || (I.deps = R, U = !0), U && (P = !0);
            }
            P && I.forceUpdate();
          }
        }
      }
      const x = Date.now();
      n = n.map((F, k) => {
        const O = n.slice(0, -1), T = H(u, O);
        return k === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (T.length - 1).toString() : F;
      });
      const { oldValue: N, newValue: _ } = Ue(
        a.updateType,
        g,
        u,
        n
      ), D = {
        timeStamp: x,
        stateKey: v,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: N,
        newValue: _
      };
      if (Re(v, (F) => {
        const O = [...F ?? [], D].reduce((T, I) => {
          const P = `${I.stateKey}:${JSON.stringify(I.path)}`, V = T.get(P);
          return V ? (V.timeStamp = Math.max(V.timeStamp, I.timeStamp), V.newValue = I.newValue, V.oldValue = V.oldValue ?? I.oldValue, V.updateType = I.updateType) : T.set(P, { ...I }), T;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), pe(
        u,
        v,
        C.current,
        j
      ), C.current?.middleware && C.current.middleware({
        updateLog: l,
        update: D
      }), C.current?.serverSync) {
        const F = r.getState().serverState[v], k = C.current?.serverSync;
        je(v, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: u }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  r.getState().updaterState[v] || (ae(
    v,
    se(
      v,
      X,
      B.current,
      j
    )
  ), r.getState().cogsStateStore[v] || J(v, e), r.getState().initialStateGlobal[v] || me(v, e));
  const d = Ee(() => se(
    v,
    X,
    B.current,
    j
  ), [v, j]);
  return [$e(v), d];
}
function se(e, i, h, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const E = (m) => {
    const o = m.join(".");
    for (const [S] of y)
      (S === o || S.startsWith(o + ".")) && y.delete(S);
    b++;
  }, p = {
    removeValidation: (m) => {
      m?.validationKey && q(m.validationKey);
    },
    revertToInitialState: (m) => {
      const o = r.getState().getInitialOptions(e)?.validation;
      o?.key && q(o?.key), m?.validationKey && q(m.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), b++;
      const W = s(S, []), M = Z(e), j = z(M?.localStorage?.key) ? M?.localStorage?.key(S) : M?.localStorage?.key, G = `${f}-${e}-${j}`;
      G && localStorage.removeItem(G), ae(e, W), J(e, S);
      const v = r.getState().stateComponents.get(e);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (m) => {
      y.clear(), b++;
      const o = se(
        e,
        i,
        h,
        f
      ), S = r.getState().initialStateGlobal[e], W = Z(e), M = z(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, j = `${f}-${e}-${M}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), ke(() => {
        me(e, m), ae(e, o), J(e, m);
        const G = r.getState().stateComponents.get(e);
        G && G.components.forEach((v) => {
          v.forceUpdate();
        });
      }), {
        fetchId: (G) => o.get()[G]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const m = r.getState().serverState[e];
      return !!(m && L(m, $e(e)));
    }
  };
  function s(m, o = [], S) {
    const W = o.map(String).join(".");
    y.get(W);
    const M = function() {
      return r().getNestedState(e, o);
    };
    Object.keys(p).forEach((v) => {
      M[v] = p[v];
    });
    const j = {
      apply(v, l, te) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${o.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, o);
      },
      get(v, l) {
        S?.validIndices && !Array.isArray(m) && (S = { ...S, validIndices: void 0 });
        const te = /* @__PURE__ */ new Set([
          "insert",
          "cut",
          "cutByValue",
          "toggleByValue",
          "uniqueInsert",
          "update",
          "applyJsonPatch",
          "setSelected",
          "toggleSelected",
          "clearSelected",
          "sync",
          "validateZodSchema",
          "revertToInitialState",
          "updateInitialState",
          "removeValidation",
          "setValidation",
          "removeStorage",
          "middleware",
          "_componentId",
          "_stateKey",
          "getComponents"
        ]);
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !te.has(l)) {
          const d = `${e}////${h}`, t = r.getState().stateComponents.get(e);
          if (t) {
            const n = t.components.get(d);
            if (n && !n.paths.has("")) {
              const a = o.join(".");
              let c = !0;
              for (const g of n.paths)
                if (a.startsWith(g) && (a === g || a[g.length] === ".")) {
                  c = !1;
                  break;
                }
              c && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => fe(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (l === "sync" && o.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(e), t = d?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const c = await t.action(n);
              if (c && !c.success && c.errors && a) {
                r.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const $ = [a, ...u.path].join(".");
                  r.getState().addValidationError($, u.message);
                });
                const g = r.getState().stateComponents.get(e);
                g && g.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && t.onSuccess ? t.onSuccess(c.data) : !c?.success && t.onError && t.onError(c.error), c;
            } catch (c) {
              return t.onError && t.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(e, o), t = r.getState().initialStateGlobal[e], n = H(t, o);
          return L(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              o
            ), t = r.getState().initialStateGlobal[e], n = H(t, o);
            return L(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[e], t = Z(e), n = z(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, a = `${f}-${e}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + o.join("."));
          };
        if (Array.isArray(m)) {
          const d = () => S?.validIndices ? m.map((n, a) => ({
            item: n,
            originalIndex: S.validIndices[a]
          })) : r.getState().getNestedState(e, o).map((n, a) => ({
            item: n,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const t = r.getState().getSelectedIndex(e, o.join("."));
              if (t !== void 0)
                return s(
                  m[t],
                  [...o, t.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: o });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, o.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (t) => {
              const {
                itemHeight: n,
                overscan: a = 5,
                stickToBottom: c = !1
              } = t;
              if (typeof n != "number" || n <= 0)
                throw new Error(
                  "[cogs-state] `useVirtualView` requires a positive number for `itemHeight` option."
                );
              const g = Y(null), u = Y(!0), [$, w] = ee({
                startIndex: 0,
                endIndex: Math.min(20, m.length)
              }), x = r().getNestedState(
                e,
                o
              ).length, N = x * n, _ = Ee(() => {
                const T = Array.from(
                  { length: $.endIndex - $.startIndex },
                  (P, V) => $.startIndex + V
                ).filter((P) => P < x);
                return s(m, o, {
                  ...S,
                  validIndices: T
                }).stateFilter((P, V) => V >= $.startIndex && V < $.endIndex);
              }, [$.startIndex, $.endIndex, x]);
              ge(() => {
                const T = g.current;
                if (!T) return;
                const I = () => {
                  if (!T) return;
                  const R = T.scrollTop, U = T.clientHeight, Q = Math.max(
                    0,
                    Math.floor(R / n) - a
                  ), ne = Math.min(
                    x,
                    Math.ceil((R + U) / n) + a
                  );
                  w({ startIndex: Q, endIndex: ne });
                }, P = () => {
                  const R = g.current;
                  R && (u.current = R.scrollHeight - R.scrollTop - R.clientHeight < 2, I());
                };
                I(), c && (T.scrollTop = T.scrollHeight), T.addEventListener("scroll", P, {
                  passive: !0
                });
                const V = new ResizeObserver(() => {
                  I();
                });
                return V.observe(T), () => {
                  T.removeEventListener("scroll", P), V.disconnect();
                };
              }, [x, n, a, c]), oe(() => {
                c && u.current && g.current && (g.current.scrollTop = g.current.scrollHeight);
              }, [x]);
              const D = de(
                (T, I = "auto") => {
                  g.current?.scrollTo({ top: T, behavior: I });
                },
                []
              ), F = de(
                (T = "smooth") => {
                  const I = g.current;
                  I && I.scrollTo({
                    top: I.scrollHeight,
                    behavior: T
                  });
                },
                []
              ), k = de(
                (T, I = "smooth") => {
                  D(T * n, I);
                },
                [D, n]
              ), O = {
                outer: {
                  ref: g,
                  style: {
                    overflowY: "auto",
                    position: "relative",
                    height: "100%"
                  }
                },
                inner: {
                  style: {
                    position: "relative",
                    height: `${N}px`,
                    width: "100%"
                  }
                },
                list: {
                  style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${$.startIndex * n}px)`
                  }
                }
              };
              return {
                virtualState: _,
                virtualizerProps: O,
                scrollToBottom: F,
                scrollToIndex: k
              };
            };
          if (l === "stateSort")
            return (t) => {
              const a = [...d()].sort(
                (u, $) => t(u.item, $.item)
              ), c = a.map(({ item: u }) => u), g = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, o, g);
            };
          if (l === "stateFilter")
            return (t) => {
              const a = d().filter(
                ({ item: u }, $) => t(u, $)
              ), c = a.map(({ item: u }) => u), g = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, o, g);
            };
          if (l === "stateMap")
            return (t) => {
              const n = r.getState().getNestedState(e, o);
              return Array.isArray(n) ? n.map((a, c) => {
                let g;
                S?.validIndices && S.validIndices[c] !== void 0 ? g = S.validIndices[c] : g = c;
                const u = [...o, g.toString()], $ = s(a, u, S);
                return t(a, $, {
                  register: () => {
                    const [, A] = ee({}), x = `${h}-${o.join(".")}-${g}`;
                    ge(() => {
                      const N = `${e}////${x}`, _ = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return _.components.set(N, {
                        forceUpdate: () => A({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), r.getState().stateComponents.set(e, _), () => {
                        const D = r.getState().stateComponents.get(e);
                        D && D.components.delete(N);
                      };
                    }, [e, x]);
                  },
                  index: c,
                  originalIndex: g
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${o.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (t) => m.map((a, c) => {
              let g;
              S?.validIndices && S.validIndices[c] !== void 0 ? g = S.validIndices[c] : g = c;
              const u = [...o, g.toString()], $ = s(a, u, S);
              return t(
                a,
                $,
                c,
                m,
                s(m, o, S)
              );
            });
          if (l === "$stateMap")
            return (t) => ie(We, {
              proxy: {
                _stateKey: e,
                _path: o,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateFlattenOn")
            return (t) => {
              const n = m;
              y.clear(), b++;
              const a = n.flatMap(
                (c) => c[t] ?? []
              );
              return s(
                a,
                [...o, "[*]", t],
                S
              );
            };
          if (l === "index")
            return (t) => {
              const n = m[t];
              return s(n, [...o, t.toString()]);
            };
          if (l === "last")
            return () => {
              const t = r.getState().getNestedState(e, o);
              if (t.length === 0) return;
              const n = t.length - 1, a = t[n], c = [...o, n.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (t) => (E(o), ue(i, t, o, e), s(
              r.getState().getNestedState(e, o),
              o
            ));
          if (l === "uniqueInsert")
            return (t, n, a) => {
              const c = r.getState().getNestedState(e, o), g = z(t) ? t(c) : t;
              let u = null;
              if (!c.some((w) => {
                if (n) {
                  const x = n.every(
                    (N) => L(w[N], g[N])
                  );
                  return x && (u = w), x;
                }
                const A = L(w, g);
                return A && (u = w), A;
              }))
                E(o), ue(i, g, o, e);
              else if (a && u) {
                const w = a(u), A = c.map(
                  (x) => L(x, u) ? w : x
                );
                E(o), K(i, A, o);
              }
            };
          if (l === "cut")
            return (t, n) => {
              if (!n?.waitForSync)
                return E(o), re(i, o, e, t), s(
                  r.getState().getNestedState(e, o),
                  o
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let n = 0; n < m.length; n++)
                m[n] === t && re(i, o, e, n);
            };
          if (l === "toggleByValue")
            return (t) => {
              const n = m.findIndex((a) => a === t);
              n > -1 ? re(i, o, e, n) : ue(i, t, o, e);
            };
          if (l === "stateFind")
            return (t) => {
              const a = d().find(
                ({ item: g }, u) => t(g, u)
              );
              if (!a) return;
              const c = [...o, a.originalIndex.toString()];
              return s(a.item, c, S);
            };
          if (l === "findWith")
            return (t, n) => {
              const c = d().find(
                ({ item: u }) => u[t] === n
              );
              if (!c) return;
              const g = [...o, c.originalIndex.toString()];
              return s(c.item, g, S);
            };
        }
        const B = o[o.length - 1];
        if (!isNaN(Number(B))) {
          const d = o.slice(0, -1), t = r.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => re(
              i,
              d,
              e,
              Number(B)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(m)) {
              const d = r.getState().getNestedState(e, o);
              return S.validIndices.map((t) => d[t]);
            }
            return r.getState().getNestedState(e, o);
          };
        if (l === "$derive")
          return (d) => we({
            _stateKey: e,
            _path: o,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => we({
            _stateKey: e,
            _path: o
          });
        if (l === "lastSynced") {
          const d = `${e}:${o.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ce(f + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = o.slice(0, -1), t = d.join("."), n = r.getState().getNestedState(e, d);
          return Array.isArray(n) ? Number(o[o.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const t = o.slice(0, -1), n = Number(o[o.length - 1]), a = t.join(".");
            d ? r.getState().setSelectedIndex(e, a, n) : r.getState().setSelectedIndex(e, a, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            K(i, c, t), E(t);
          };
        if (l === "toggleSelected")
          return () => {
            const d = o.slice(0, -1), t = Number(o[o.length - 1]), n = d.join("."), a = r.getState().getSelectedIndex(e, n);
            r.getState().setSelectedIndex(
              e,
              n,
              a === t ? void 0 : t
            );
            const c = r.getState().getNestedState(e, [...d]);
            K(i, c, d), E(d);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = r.getState().cogsStateStore[e], a = _e(t, d).newDocument;
              Ae(
                e,
                r.getState().initialStateGlobal[e],
                a,
                i,
                h,
                f
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const g = fe(t, a), u = new Set(g);
                for (const [
                  $,
                  w
                ] of c.components.entries()) {
                  let A = !1;
                  const x = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (w.paths.has("") && (A = !0), !A))
                      for (const N of u) {
                        if (w.paths.has(N)) {
                          A = !0;
                          break;
                        }
                        let _ = N.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const D = N.substring(0, _);
                          if (w.paths.has(D)) {
                            A = !0;
                            break;
                          }
                          const F = N.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(F))) {
                            const k = D.lastIndexOf(".");
                            if (k !== -1) {
                              const O = D.substring(
                                0,
                                k
                              );
                              if (w.paths.has(O)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          _ = D.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && x.includes("deps") && w.depsFunction) {
                      const N = w.depsFunction(a);
                      let _ = !1;
                      typeof N == "boolean" ? N && (_ = !0) : L(w.deps, N) || (w.deps = N, _ = !0), _ && (A = !0);
                    }
                    A && w.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = r.getState().getInitialOptions(e)?.validation, t = r.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              q(d.key);
              const n = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([g]) => {
                  g && g.startsWith(d.key) && q(g);
                });
                const c = d.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const $ = u.path, w = u.message, A = [d.key, ...$].join(".");
                  t(A, w);
                }), le(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return h;
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
            return p.revertToInitialState;
          if (l === "updateInitialState") return p.updateInitialState;
          if (l === "removeValidation") return p.removeValidation;
        }
        if (l === "getFormRef")
          return () => ye.getState().getFormRef(e + "." + o.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ ve(
            Ne,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: o,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return o;
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, t) => {
            if (t?.debounce)
              Ve(() => {
                K(i, d, o, "");
                const n = r.getState().getNestedState(e, o);
                t?.afterUpdate && t.afterUpdate(n);
              }, t.debounce);
            else {
              K(i, d, o, "");
              const n = r.getState().getNestedState(e, o);
              t?.afterUpdate && t.afterUpdate(n);
            }
            E(o);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ ve(
            Pe,
            {
              setState: i,
              stateKey: e,
              path: o,
              child: d,
              formOpts: t
            }
          );
        const C = [...o, l], X = r.getState().getNestedState(e, C);
        return s(X, C, S);
      }
    }, G = new Proxy(M, j);
    return y.set(W, {
      proxy: G,
      stateVersion: b
    }), G;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function we(e) {
  return ie(Ge, { proxy: e });
}
function We({
  proxy: e,
  rebuildStateShape: i
}) {
  const h = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(h) ? i(
    h,
    e._path
  ).stateMapNoRender(
    (y, b, E, p, s) => e._mapFn(y, b, E, p, s)
  ) : null;
}
function Ge({
  proxy: e
}) {
  const i = Y(null), h = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, E = Array.from(y.childNodes).indexOf(f);
    let p = y.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", p));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: E,
      effect: e._effect
    };
    r.getState().addSignalElement(h, m);
    const o = r.getState().getNestedState(e._stateKey, e._path);
    let S;
    if (e._effect)
      try {
        S = new Function(
          "state",
          `return (${e._effect})(state)`
        )(o);
      } catch (M) {
        console.error("Error evaluating effect function during mount:", M), S = o;
      }
    else
      S = o;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    f.replaceWith(W);
  }, [e._stateKey, e._path.join("."), e._effect]), ie("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function nt(e) {
  const i = be(
    (h) => {
      const f = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(e._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => f.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return ie("text", {}, String(i));
}
export {
  we as $cogsSignal,
  nt as $cogsSignalStore,
  Ke as addStateOptions,
  et as createCogsState,
  tt as notifyComponent,
  De as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
