"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as tt, useRef as Z, useEffect as ut, useLayoutEffect as rt, useMemo as gt, createElement as it, useSyncExternalStore as xt, startTransition as Vt, useCallback as lt } from "react";
import { transformStateFunc as bt, isDeepEqual as L, isFunction as z, getNestedValue as B, getDifferences as ft, debounce as At } from "./utility.js";
import { pushFunc as dt, updateFn as K, cutFunc as nt, ValidationWrapper as Nt, FormControlComponent as Pt } from "./Functions.jsx";
import Ct from "superjson";
import { v4 as St } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as It } from "./store.js";
import { useCogsConfig as $t } from "./CogsStateClient.jsx";
import { applyPatch as _t } from "fast-json-patch";
function ht(t, s) {
  const I = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, v = I(t) || {};
  g(t, {
    ...v,
    ...s
  });
}
function pt({
  stateKey: t,
  options: s,
  initialOptionsPart: I
}) {
  const g = X(t) || {}, v = I[t] || {}, x = r.getState().setInitialStateOptions, E = { ...v, ...g };
  let h = !1;
  if (s)
    for (const i in s)
      E.hasOwnProperty(i) ? (i == "localStorage" && s[i] && E[i].key !== s[i]?.key && (h = !0, E[i] = s[i]), i == "initialState" && s[i] && E[i] !== s[i] && // Different references
      !L(E[i], s[i]) && (h = !0, E[i] = s[i])) : (h = !0, E[i] = s[i]);
  h && x(t, E);
}
function Kt(t, { formElements: s, validation: I }) {
  return { initialState: t, formElements: s, validation: I };
}
const te = (t, s) => {
  let I = t;
  const [g, v] = bt(I);
  (Object.keys(v).length > 0 || s && Object.keys(s).length > 0) && Object.keys(v).forEach((h) => {
    v[h] = v[h] || {}, v[h].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...v[h].formElements || {}
      // State-specific overrides
    }, X(h) || r.getState().setInitialStateOptions(h, v[h]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const x = (h, i) => {
    const [y] = tt(i?.componentId ?? St());
    pt({
      stateKey: h,
      options: i,
      initialOptionsPart: v
    });
    const o = r.getState().cogsStateStore[h] || g[h], f = i?.modifyState ? i.modifyState(o) : o, [D, R] = Dt(
      f,
      {
        stateKey: h,
        syncUpdate: i?.syncUpdate,
        componentId: y,
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
    return R;
  };
  function E(h, i) {
    pt({ stateKey: h, options: i, initialOptionsPart: v }), i.localStorage && Ft(h, i), ct(h);
  }
  return { useCogsState: x, setCogsOptions: E };
}, {
  setUpdaterState: ot,
  setState: Y,
  getInitialOptions: X,
  getKeyState: Tt,
  getValidationErrors: Ot,
  setStateLog: Mt,
  updateInitialStateGlobal: mt,
  addValidationError: Rt,
  removeValidationError: q,
  setServerSyncActions: jt
} = r.getState(), wt = (t, s, I, g, v) => {
  I?.log && console.log(
    "saving to localstorage",
    s,
    I.localStorage?.key,
    g
  );
  const x = z(I?.localStorage?.key) ? I.localStorage?.key(t) : I?.localStorage?.key;
  if (x && g) {
    const E = `${g}-${s}-${x}`;
    let h;
    try {
      h = st(E)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? h
    }, y = Ct.serialize(i);
    window.localStorage.setItem(
      E,
      JSON.stringify(y.json)
    );
  }
}, st = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Ft = (t, s) => {
  const I = r.getState().cogsStateStore[t], { sessionId: g } = $t(), v = z(s?.localStorage?.key) ? s.localStorage.key(I) : s?.localStorage?.key;
  if (v && g) {
    const x = st(
      `${g}-${t}-${v}`
    );
    if (x && x.lastUpdated > (x.lastSyncedWithServer || 0))
      return Y(t, x.state), ct(t), !0;
  }
  return !1;
}, kt = (t, s, I, g, v, x) => {
  const E = {
    initialState: s,
    updaterState: at(
      t,
      g,
      v,
      x
    ),
    state: I
  };
  mt(t, E.initialState), ot(t, E.updaterState), Y(t, E.state);
}, ct = (t) => {
  const s = r.getState().stateComponents.get(t);
  if (!s) return;
  const I = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || I.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    I.forEach((g) => g());
  });
}, ee = (t, s) => {
  const I = r.getState().stateComponents.get(t);
  if (I) {
    const g = `${t}////${s}`, v = I.components.get(g);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Ut = (t, s, I, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(s, g),
        newValue: B(I, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(I, g)
      };
    case "cut":
      return {
        oldValue: B(s, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Dt(t, {
  stateKey: s,
  serverSync: I,
  localStorage: g,
  formElements: v,
  reactiveDeps: x,
  reactiveType: E,
  componentId: h,
  initialState: i,
  syncUpdate: y,
  dependencies: o,
  serverState: f
} = {}) {
  const [D, R] = tt({}), { sessionId: j } = $t();
  let W = !s;
  const [m] = tt(s ?? St()), l = r.getState().stateLog[m], et = Z(/* @__PURE__ */ new Set()), H = Z(h ?? St()), C = Z(
    null
  );
  C.current = X(m) ?? null, ut(() => {
    if (y && y.stateKey === m && y.path?.[0]) {
      Y(m, (n) => ({
        ...n,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), ut(() => {
    if (i) {
      ht(m, {
        initialState: i
      });
      const e = C.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, i) || !c) && !a)
        return;
      let u = null;
      const k = z(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      k && j && (u = st(`${j}-${m}-${k}`));
      let p = i, T = !1;
      const A = a ? Date.now() : 0, b = u?.lastUpdated || 0, _ = u?.lastSyncedWithServer || 0;
      a && A > b ? (p = e.serverState.data, T = !0) : u && b > _ && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), kt(
        m,
        i,
        p,
        Q,
        H.current,
        j
      ), T && k && j && wt(p, m, e, j, Date.now()), ct(m), (Array.isArray(E) ? E : [E || "component"]).includes("none") || R({});
    }
  }, [
    i,
    f?.status,
    f?.data,
    ...o || []
  ]), rt(() => {
    W && ht(m, {
      serverSync: I,
      formElements: v,
      initialState: i,
      localStorage: g,
      middleware: C.current?.middleware
    });
    const e = `${m}////${H.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: x || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), R({}), () => {
      const a = `${m}////${H.current}`;
      n && (n.components.delete(a), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const Q = (e, n, a, c) => {
    if (Array.isArray(n)) {
      const S = `${m}-${n.join(".")}`;
      et.current.add(S);
    }
    Y(m, (S) => {
      const u = z(e) ? e(S) : e, k = `${m}-${n.join(".")}`;
      if (k) {
        let O = !1, V = r.getState().signalDomElements.get(k);
        if ((!V || V.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const M = n.slice(0, -1), $ = B(u, M);
          if (Array.isArray($)) {
            O = !0;
            const w = `${m}-${M.join(".")}`;
            V = r.getState().signalDomElements.get(w);
          }
        }
        if (V) {
          const M = O ? B(u, n.slice(0, -1)) : B(u, n);
          V.forEach(({ parentId: $, position: w, effect: N }) => {
            const P = document.querySelector(
              `[data-parent-id="${$}"]`
            );
            if (P) {
              const G = Array.from(P.childNodes);
              if (G[w]) {
                const U = N ? new Function("state", `return (${N})(state)`)(M) : M;
                G[w].textContent = String(U);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || C.current?.validation?.key) && n && q(
        (c || C.current?.validation?.key) + "." + n.join(".")
      );
      const p = n.slice(0, n.length - 1);
      a.updateType === "cut" && C.current?.validation?.key && q(
        C.current?.validation?.key + "." + p.join(".")
      ), a.updateType === "insert" && C.current?.validation?.key && Ot(
        C.current?.validation?.key + "." + p.join(".")
      ).filter(([V, M]) => {
        let $ = V?.split(".").length;
        if (V == p.join(".") && $ == p.length - 1) {
          let w = V + "." + p;
          q(V), Rt(w, M);
        }
      });
      const T = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", T), T) {
        const O = ft(S, u), V = new Set(O), M = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          $,
          w
        ] of T.components.entries()) {
          let N = !1;
          const P = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
          if (console.log("component", w), !P.includes("none")) {
            if (P.includes("all")) {
              w.forceUpdate();
              continue;
            }
            if (P.includes("component") && ((w.paths.has(M) || w.paths.has("")) && (N = !0), !N))
              for (const G of V) {
                let U = G;
                for (; ; ) {
                  if (w.paths.has(U)) {
                    N = !0;
                    break;
                  }
                  const J = U.lastIndexOf(".");
                  if (J !== -1) {
                    const vt = U.substring(
                      0,
                      J
                    );
                    if (!isNaN(
                      Number(U.substring(J + 1))
                    ) && w.paths.has(vt)) {
                      N = !0;
                      break;
                    }
                    U = vt;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (N) break;
              }
            if (!N && P.includes("deps") && w.depsFunction) {
              const G = w.depsFunction(u);
              let U = !1;
              typeof G == "boolean" ? G && (U = !0) : L(w.deps, G) || (w.deps = G, U = !0), U && (N = !0);
            }
            N && w.forceUpdate();
          }
        }
      }
      const A = Date.now();
      n = n.map((O, V) => {
        const M = n.slice(0, -1), $ = B(u, M);
        return V === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? ($.length - 1).toString() : O;
      });
      const { oldValue: b, newValue: _ } = Ut(
        a.updateType,
        S,
        u,
        n
      ), F = {
        timeStamp: A,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: b,
        newValue: _
      };
      if (Mt(m, (O) => {
        const M = [...O ?? [], F].reduce(($, w) => {
          const N = `${w.stateKey}:${JSON.stringify(w.path)}`, P = $.get(N);
          return P ? (P.timeStamp = Math.max(P.timeStamp, w.timeStamp), P.newValue = w.newValue, P.oldValue = P.oldValue ?? w.oldValue, P.updateType = w.updateType) : $.set(N, { ...w }), $;
        }, /* @__PURE__ */ new Map());
        return Array.from(M.values());
      }), wt(
        u,
        m,
        C.current,
        j
      ), C.current?.middleware && C.current.middleware({
        updateLog: l,
        update: F
      }), C.current?.serverSync) {
        const O = r.getState().serverState[m], V = C.current?.serverSync;
        jt(m, {
          syncKey: typeof V.syncKey == "string" ? V.syncKey : V.syncKey({ state: u }),
          rollBackState: O,
          actionTimeStamp: Date.now() + (V.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  r.getState().updaterState[m] || (ot(
    m,
    at(
      m,
      Q,
      H.current,
      j
    )
  ), r.getState().cogsStateStore[m] || Y(m, t), r.getState().initialStateGlobal[m] || mt(m, t));
  const d = gt(() => at(
    m,
    Q,
    H.current,
    j
  ), [m, j]);
  return [Tt(m), d];
}
function at(t, s, I, g) {
  const v = /* @__PURE__ */ new Map();
  let x = 0;
  const E = (y) => {
    const o = y.join(".");
    for (const [f] of v)
      (f === o || f.startsWith(o + ".")) && v.delete(f);
    x++;
  }, h = {
    removeValidation: (y) => {
      y?.validationKey && q(y.validationKey);
    },
    revertToInitialState: (y) => {
      const o = r.getState().getInitialOptions(t)?.validation;
      o?.key && q(o?.key), y?.validationKey && q(y.validationKey);
      const f = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), v.clear(), x++;
      const D = i(f, []), R = X(t), j = z(R?.localStorage?.key) ? R?.localStorage?.key(f) : R?.localStorage?.key, W = `${g}-${t}-${j}`;
      W && localStorage.removeItem(W), ot(t, D), Y(t, f);
      const m = r.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (y) => {
      v.clear(), x++;
      const o = at(
        t,
        s,
        I,
        g
      ), f = r.getState().initialStateGlobal[t], D = X(t), R = z(D?.localStorage?.key) ? D?.localStorage?.key(f) : D?.localStorage?.key, j = `${g}-${t}-${R}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Vt(() => {
        mt(t, y), ot(t, o), Y(t, y);
        const W = r.getState().stateComponents.get(t);
        W && W.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (W) => o.get()[W]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = r.getState().serverState[t];
      return !!(y && L(y, Tt(t)));
    }
  };
  function i(y, o = [], f) {
    const D = o.map(String).join(".");
    v.get(D);
    const R = function() {
      return r().getNestedState(t, o);
    };
    Object.keys(h).forEach((m) => {
      R[m] = h[m];
    });
    const j = {
      apply(m, l, et) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${o.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, o);
      },
      get(m, l) {
        f?.validIndices && !Array.isArray(y) && (f = { ...f, validIndices: void 0 });
        const et = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !et.has(l)) {
          const d = `${t}////${I}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(d);
            if (n && !n.paths.has("")) {
              const a = o.join(".");
              let c = !0;
              for (const S of n.paths)
                if (a.startsWith(S) && (a === S || a[S.length] === ".")) {
                  c = !1;
                  break;
                }
              c && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => ft(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && o.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const c = await e.action(n);
              if (c && !c.success && c.errors && a) {
                r.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const k = [a, ...u.path].join(".");
                  r.getState().addValidationError(k, u.message);
                });
                const S = r.getState().stateComponents.get(t);
                S && S.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(t, o), e = r.getState().initialStateGlobal[t], n = B(e, o);
          return L(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              o
            ), e = r.getState().initialStateGlobal[t], n = B(e, o);
            return L(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = X(t), n = z(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + o.join("."));
          };
        if (Array.isArray(y)) {
          const d = () => f?.validIndices ? y.map((n, a) => ({
            item: n,
            originalIndex: f.validIndices[a]
          })) : r.getState().getNestedState(t, o).map((n, a) => ({
            item: n,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, o.join("."));
              if (e !== void 0)
                return i(
                  y[e],
                  [...o, e.toString()],
                  f
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: o });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, o.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: n,
                overscan: a = 5,
                stickToBottom: c = !1
              } = e;
              if (typeof n != "number" || n <= 0)
                throw new Error(
                  "[cogs-state] `useVirtualView` requires a positive number for `itemHeight` option."
                );
              const S = Z(null), u = Z(!0), [k, p] = tt({
                startIndex: 0,
                endIndex: 0
              }), T = r.getState().getNestedState(t, o) || [], A = T.length, b = A * n, _ = gt(() => i(
                y,
                o,
                f
              ).stateFilter((w, N) => N >= k.startIndex && N < k.endIndex), [k.startIndex, k.endIndex, T]);
              rt(() => {
                const $ = S.current;
                if (!$) return;
                const w = () => {
                  const G = Math.max(
                    0,
                    Math.floor($.scrollTop / n) - a
                  ), U = Math.min(
                    A,
                    Math.ceil(
                      ($.scrollTop + $.clientHeight) / n
                    ) + a
                  );
                  p((J) => J.startIndex === G && J.endIndex === U ? J : { startIndex: G, endIndex: U });
                }, N = () => {
                  u.current = $.scrollHeight > 0 && $.scrollHeight - $.scrollTop - $.clientHeight < 1, w();
                };
                w(), $.addEventListener("scroll", N, {
                  passive: !0
                });
                const P = new ResizeObserver(N);
                return P.observe($), () => {
                  $.removeEventListener("scroll", N), P.disconnect();
                };
              }, [A, n, a]);
              const F = lt(
                ($, w = "auto") => S.current?.scrollTo({ top: $, behavior: w }),
                []
              ), O = lt(
                ($ = "smooth") => {
                  S.current && F(S.current.scrollHeight, $);
                },
                [F]
              ), V = lt(
                ($, w = "smooth") => F($ * n, w),
                [F, n]
              );
              rt(() => {
                c && u.current && O("auto");
              }, [T, c, O]);
              const M = gt(
                () => ({
                  outer: {
                    ref: S,
                    style: { overflowY: "auto", position: "relative" }
                  },
                  inner: {
                    style: {
                      position: "relative",
                      height: `${b}px`,
                      width: "100%"
                    }
                  },
                  list: {
                    style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${k.startIndex * n}px)`
                    }
                  }
                }),
                [b, k.startIndex, n]
              );
              return {
                virtualState: _,
                virtualizerProps: M,
                scrollToBottom: O,
                scrollToIndex: V
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, k) => e(u.item, k.item)
              ), c = a.map(({ item: u }) => u), S = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return i(c, o, S);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, k) => e(u, k)
              ), c = a.map(({ item: u }) => u), S = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return i(c, o, S);
            };
          if (l === "stateMap")
            return (e) => {
              const n = r.getState().getNestedState(t, o);
              return Array.isArray(n) ? n.map((a, c) => {
                let S;
                f?.validIndices && f.validIndices[c] !== void 0 ? S = f.validIndices[c] : S = c;
                const u = [...o, S.toString()], k = i(a, u, f);
                return e(a, k, {
                  register: () => {
                    const [, T] = tt({}), A = `${I}-${o.join(".")}-${S}`;
                    rt(() => {
                      const b = `${t}////${A}`, _ = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return _.components.set(b, {
                        forceUpdate: () => T({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), r.getState().stateComponents.set(t, _), () => {
                        const F = r.getState().stateComponents.get(t);
                        F && F.components.delete(b);
                      };
                    }, [t, A]);
                  },
                  index: c,
                  originalIndex: S
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${o.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => y.map((a, c) => {
              let S;
              f?.validIndices && f.validIndices[c] !== void 0 ? S = f.validIndices[c] : S = c;
              const u = [...o, S.toString()], k = i(a, u, f);
              return e(
                a,
                k,
                c,
                y,
                i(y, o, f)
              );
            });
          if (l === "$stateMap")
            return (e) => it(Wt, {
              proxy: {
                _stateKey: t,
                _path: o,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateFlattenOn")
            return (e) => {
              const n = y;
              v.clear(), x++;
              const a = n.flatMap(
                (c) => c[e] ?? []
              );
              return i(
                a,
                [...o, "[*]", e],
                f
              );
            };
          if (l === "index")
            return (e) => {
              const n = y[e];
              return i(n, [...o, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, o);
              if (e.length === 0) return;
              const n = e.length - 1, a = e[n], c = [...o, n.toString()];
              return i(a, c);
            };
          if (l === "insert")
            return (e) => (E(o), dt(s, e, o, t), i(
              r.getState().getNestedState(t, o),
              o
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const c = r.getState().getNestedState(t, o), S = z(e) ? e(c) : e;
              let u = null;
              if (!c.some((p) => {
                if (n) {
                  const A = n.every(
                    (b) => L(p[b], S[b])
                  );
                  return A && (u = p), A;
                }
                const T = L(p, S);
                return T && (u = p), T;
              }))
                E(o), dt(s, S, o, t);
              else if (a && u) {
                const p = a(u), T = c.map(
                  (A) => L(A, u) ? p : A
                );
                E(o), K(s, T, o);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return E(o), nt(s, o, t, e), i(
                  r.getState().getNestedState(t, o),
                  o
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < y.length; n++)
                y[n] === e && nt(s, o, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = y.findIndex((a) => a === e);
              n > -1 ? nt(s, o, t, n) : dt(s, e, o, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: S }, u) => e(S, u)
              );
              if (!a) return;
              const c = [...o, a.originalIndex.toString()];
              return i(a.item, c, f);
            };
          if (l === "findWith")
            return (e, n) => {
              const c = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!c) return;
              const S = [...o, c.originalIndex.toString()];
              return i(c.item, S, f);
            };
        }
        const H = o[o.length - 1];
        if (!isNaN(Number(H))) {
          const d = o.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => nt(
              s,
              d,
              t,
              Number(H)
            );
        }
        if (l === "get")
          return () => r.getState().getNestedState(t, o);
        if (l === "$derive")
          return (d) => Et({
            _stateKey: t,
            _path: o,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Et({
            _stateKey: t,
            _path: o
          });
        if (l === "lastSynced") {
          const d = `${t}:${o.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => st(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = o.slice(0, -1), e = d.join("."), n = r.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(o[o.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = o.slice(0, -1), n = Number(o[o.length - 1]), a = e.join(".");
            d ? r.getState().setSelectedIndex(t, a, n) : r.getState().setSelectedIndex(t, a, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            K(s, c, e), E(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = o.slice(0, -1), e = Number(o[o.length - 1]), n = d.join("."), a = r.getState().getSelectedIndex(t, n);
            r.getState().setSelectedIndex(
              t,
              n,
              a === e ? void 0 : e
            );
            const c = r.getState().getNestedState(t, [...d]);
            K(s, c, d), E(d);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], a = _t(e, d).newDocument;
              kt(
                t,
                r.getState().initialStateGlobal[t],
                a,
                s,
                I,
                g
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const S = ft(e, a), u = new Set(S);
                for (const [
                  k,
                  p
                ] of c.components.entries()) {
                  let T = !1;
                  const A = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!A.includes("none")) {
                    if (A.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (A.includes("component") && (p.paths.has("") && (T = !0), !T))
                      for (const b of u) {
                        if (p.paths.has(b)) {
                          T = !0;
                          break;
                        }
                        let _ = b.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const F = b.substring(0, _);
                          if (p.paths.has(F)) {
                            T = !0;
                            break;
                          }
                          const O = b.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(O))) {
                            const V = F.lastIndexOf(".");
                            if (V !== -1) {
                              const M = F.substring(
                                0,
                                V
                              );
                              if (p.paths.has(M)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          _ = F.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && A.includes("deps") && p.depsFunction) {
                      const b = p.depsFunction(a);
                      let _ = !1;
                      typeof b == "boolean" ? b && (_ = !0) : L(p.deps, b) || (p.deps = b, _ = !0), _ && (T = !0);
                    }
                    T && p.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = r.getState().getInitialOptions(t)?.validation, e = r.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              q(d.key);
              const n = r.getState().cogsStateStore[t];
              try {
                const a = r.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([S]) => {
                  S && S.startsWith(d.key) && q(S);
                });
                const c = d.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const k = u.path, p = u.message, T = [d.key, ...k].join(".");
                  e(T, p);
                }), ct(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return I;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => It.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return r.getState().serverState[t];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return h.revertToInitialState;
          if (l === "updateInitialState") return h.updateInitialState;
          if (l === "removeValidation") return h.removeValidation;
        }
        if (l === "getFormRef")
          return () => It.getState().getFormRef(t + "." + o.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ yt(
            Nt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: o,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: f?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return o;
        if (l === "_isServerSynced") return h._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              At(() => {
                K(s, d, o, "");
                const n = r.getState().getNestedState(t, o);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              K(s, d, o, "");
              const n = r.getState().getNestedState(t, o);
              e?.afterUpdate && e.afterUpdate(n);
            }
            E(o);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ yt(
            Pt,
            {
              setState: s,
              stateKey: t,
              path: o,
              child: d,
              formOpts: e
            }
          );
        const C = [...o, l], Q = r.getState().getNestedState(t, C);
        return i(Q, C, f);
      }
    }, W = new Proxy(R, j);
    return v.set(D, {
      proxy: W,
      stateVersion: x
    }), W;
  }
  return i(
    r.getState().getNestedState(t, [])
  );
}
function Et(t) {
  return it(Gt, { proxy: t });
}
function Wt({
  proxy: t,
  rebuildStateShape: s
}) {
  const I = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(I) ? s(
    I,
    t._path
  ).stateMapNoRender(
    (v, x, E, h, i) => t._mapFn(v, x, E, h, i)
  ) : null;
}
function Gt({
  proxy: t
}) {
  const s = Z(null), I = `${t._stateKey}-${t._path.join(".")}`;
  return ut(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const v = g.parentElement, E = Array.from(v.childNodes).indexOf(g);
    let h = v.getAttribute("data-parent-id");
    h || (h = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", h));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: h,
      position: E,
      effect: t._effect
    };
    r.getState().addSignalElement(I, y);
    const o = r.getState().getNestedState(t._stateKey, t._path);
    let f;
    if (t._effect)
      try {
        f = new Function(
          "state",
          `return (${t._effect})(state)`
        )(o);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), f = o;
      }
    else
      f = o;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const D = document.createTextNode(String(f));
    g.replaceWith(D);
  }, [t._stateKey, t._path.join("."), t._effect]), it("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": I
  });
}
function ne(t) {
  const s = xt(
    (I) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: I,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return it("text", {}, String(s));
}
export {
  Et as $cogsSignal,
  ne as $cogsSignalStore,
  Kt as addStateOptions,
  te as createCogsState,
  ee as notifyComponent,
  Dt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
