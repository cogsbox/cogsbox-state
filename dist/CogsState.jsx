"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as K, useRef as Z, useEffect as nt, useLayoutEffect as dt, useMemo as Et, createElement as ot, useSyncExternalStore as kt, startTransition as Nt, useCallback as yt } from "react";
import { transformStateFunc as Vt, isDeepEqual as L, isFunction as H, getNestedValue as B, getDifferences as ut, debounce as xt } from "./utility.js";
import { pushFunc as lt, updateFn as Q, cutFunc as et, ValidationWrapper as bt, FormControlComponent as Ct } from "./Functions.jsx";
import Pt from "superjson";
import { v4 as gt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as vt } from "./store.js";
import { useCogsConfig as Tt } from "./CogsStateClient.jsx";
import { applyPatch as _t } from "fast-json-patch";
function ht(t, i) {
  const h = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, y = h(t) || {};
  f(t, {
    ...y,
    ...i
  });
}
function It({
  stateKey: t,
  options: i,
  initialOptionsPart: h
}) {
  const f = Y(t) || {}, y = h[t] || {}, A = r.getState().setInitialStateOptions, E = { ...y, ...f };
  let I = !1;
  if (i)
    for (const s in i)
      E.hasOwnProperty(s) ? (s == "localStorage" && i[s] && E[s].key !== i[s]?.key && (I = !0, E[s] = i[s]), s == "initialState" && i[s] && E[s] !== i[s] && // Different references
      !L(E[s], i[s]) && (I = !0, E[s] = i[s])) : (I = !0, E[s] = i[s]);
  I && A(t, E);
}
function Kt(t, { formElements: i, validation: h }) {
  return { initialState: t, formElements: i, validation: h };
}
const te = (t, i) => {
  let h = t;
  const [f, y] = Vt(h);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, Y(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const A = (I, s) => {
    const [v] = K(s?.componentId ?? gt());
    It({
      stateKey: I,
      options: s,
      initialOptionsPart: y
    });
    const a = r.getState().cogsStateStore[I] || f[I], S = s?.modifyState ? s.modifyState(a) : a, [D, M] = Dt(
      S,
      {
        stateKey: I,
        syncUpdate: s?.syncUpdate,
        componentId: v,
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
  function E(I, s) {
    It({ stateKey: I, options: s, initialOptionsPart: y }), s.localStorage && Ft(I, s), it(I);
  }
  return { useCogsState: A, setCogsOptions: E };
}, {
  setUpdaterState: rt,
  setState: J,
  getInitialOptions: Y,
  getKeyState: $t,
  getValidationErrors: Ot,
  setStateLog: Mt,
  updateInitialStateGlobal: ft,
  addValidationError: Rt,
  removeValidationError: z,
  setServerSyncActions: jt
} = r.getState(), pt = (t, i, h, f, y) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    f
  );
  const A = H(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (A && f) {
    const E = `${f}-${i}-${A}`;
    let I;
    try {
      I = st(E)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Pt.serialize(s);
    window.localStorage.setItem(
      E,
      JSON.stringify(v.json)
    );
  }
}, st = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Ft = (t, i) => {
  const h = r.getState().cogsStateStore[t], { sessionId: f } = Tt(), y = H(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (y && f) {
    const A = st(
      `${f}-${t}-${y}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return J(t, A.state), it(t), !0;
  }
  return !1;
}, At = (t, i, h, f, y, A) => {
  const E = {
    initialState: i,
    updaterState: at(
      t,
      f,
      y,
      A
    ),
    state: h
  };
  ft(t, E.initialState), rt(t, E.updaterState), J(t, E.state);
}, it = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, ee = (t, i) => {
  const h = r.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${i}`, y = h.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Ut = (t, i, h, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(i, f),
        newValue: B(h, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(h, f)
      };
    case "cut":
      return {
        oldValue: B(i, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Dt(t, {
  stateKey: i,
  serverSync: h,
  localStorage: f,
  formElements: y,
  reactiveDeps: A,
  reactiveType: E,
  componentId: I,
  initialState: s,
  syncUpdate: v,
  dependencies: a,
  serverState: S
} = {}) {
  const [D, M] = K({}), { sessionId: R } = Tt();
  let W = !i;
  const [m] = K(i ?? gt()), l = r.getState().stateLog[m], tt = Z(/* @__PURE__ */ new Set()), q = Z(I ?? gt()), P = Z(
    null
  );
  P.current = Y(m) ?? null, nt(() => {
    if (v && v.stateKey === m && v.path?.[0]) {
      J(m, (n) => ({
        ...n,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), nt(() => {
    if (s) {
      ht(m, {
        initialState: s
      });
      const e = P.current, o = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, s) || !c) && !o)
        return;
      let d = null;
      const k = H(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      k && R && (d = st(`${R}-${m}-${k}`));
      let p = s, $ = !1;
      const V = o ? Date.now() : 0, x = d?.lastUpdated || 0, _ = d?.lastSyncedWithServer || 0;
      o && V > x ? (p = e.serverState.data, $ = !0) : d && x > _ && (p = d.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), At(
        m,
        s,
        p,
        X,
        q.current,
        R
      ), $ && k && R && pt(p, m, e, R, Date.now()), it(m), (Array.isArray(E) ? E : [E || "component"]).includes("none") || M({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...a || []
  ]), dt(() => {
    W && ht(m, {
      serverSync: h,
      formElements: y,
      initialState: s,
      localStorage: f,
      middleware: P.current?.middleware
    });
    const e = `${m}////${q.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => M({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: A || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), M({}), () => {
      const o = `${m}////${q.current}`;
      n && (n.components.delete(o), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const X = (e, n, o, c) => {
    if (Array.isArray(n)) {
      const g = `${m}-${n.join(".")}`;
      tt.current.add(g);
    }
    J(m, (g) => {
      const d = H(e) ? e(g) : e, k = `${m}-${n.join(".")}`;
      if (k) {
        let C = !1, w = r.getState().signalDomElements.get(k);
        if ((!w || w.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const N = n.slice(0, -1), b = B(d, N);
          if (Array.isArray(b)) {
            C = !0;
            const T = `${m}-${N.join(".")}`;
            w = r.getState().signalDomElements.get(T);
          }
        }
        if (w) {
          const N = C ? B(d, n.slice(0, -1)) : B(d, n);
          w.forEach(({ parentId: b, position: T, effect: j }) => {
            const O = document.querySelector(
              `[data-parent-id="${b}"]`
            );
            if (O) {
              const G = Array.from(O.childNodes);
              if (G[T]) {
                const U = j ? new Function("state", `return (${j})(state)`)(N) : N;
                G[T].textContent = String(U);
              }
            }
          });
        }
      }
      o.updateType === "update" && (c || P.current?.validation?.key) && n && z(
        (c || P.current?.validation?.key) + "." + n.join(".")
      );
      const p = n.slice(0, n.length - 1);
      o.updateType === "cut" && P.current?.validation?.key && z(
        P.current?.validation?.key + "." + p.join(".")
      ), o.updateType === "insert" && P.current?.validation?.key && Ot(
        P.current?.validation?.key + "." + p.join(".")
      ).filter(([w, N]) => {
        let b = w?.split(".").length;
        if (w == p.join(".") && b == p.length - 1) {
          let T = w + "." + p;
          z(w), Rt(T, N);
        }
      });
      const $ = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const C = ut(g, d), w = new Set(C), N = o.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          b,
          T
        ] of $.components.entries()) {
          let j = !1;
          const O = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
          if (console.log("component", T), !O.includes("none")) {
            if (O.includes("all")) {
              T.forceUpdate();
              continue;
            }
            if (O.includes("component") && ((T.paths.has(N) || T.paths.has("")) && (j = !0), !j))
              for (const G of w) {
                let U = G;
                for (; ; ) {
                  if (T.paths.has(U)) {
                    j = !0;
                    break;
                  }
                  const ct = U.lastIndexOf(".");
                  if (ct !== -1) {
                    const St = U.substring(
                      0,
                      ct
                    );
                    if (!isNaN(
                      Number(U.substring(ct + 1))
                    ) && T.paths.has(St)) {
                      j = !0;
                      break;
                    }
                    U = St;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (j) break;
              }
            if (!j && O.includes("deps") && T.depsFunction) {
              const G = T.depsFunction(d);
              let U = !1;
              typeof G == "boolean" ? G && (U = !0) : L(T.deps, G) || (T.deps = G, U = !0), U && (j = !0);
            }
            j && T.forceUpdate();
          }
        }
      }
      const V = Date.now();
      n = n.map((C, w) => {
        const N = n.slice(0, -1), b = B(d, N);
        return w === n.length - 1 && ["insert", "cut"].includes(o.updateType) ? (b.length - 1).toString() : C;
      });
      const { oldValue: x, newValue: _ } = Ut(
        o.updateType,
        g,
        d,
        n
      ), F = {
        timeStamp: V,
        stateKey: m,
        path: n,
        updateType: o.updateType,
        status: "new",
        oldValue: x,
        newValue: _
      };
      if (Mt(m, (C) => {
        const N = [...C ?? [], F].reduce((b, T) => {
          const j = `${T.stateKey}:${JSON.stringify(T.path)}`, O = b.get(j);
          return O ? (O.timeStamp = Math.max(O.timeStamp, T.timeStamp), O.newValue = T.newValue, O.oldValue = O.oldValue ?? T.oldValue, O.updateType = T.updateType) : b.set(j, { ...T }), b;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), pt(
        d,
        m,
        P.current,
        R
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: F
      }), P.current?.serverSync) {
        const C = r.getState().serverState[m], w = P.current?.serverSync;
        jt(m, {
          syncKey: typeof w.syncKey == "string" ? w.syncKey : w.syncKey({ state: d }),
          rollBackState: C,
          actionTimeStamp: Date.now() + (w.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return d;
    });
  };
  r.getState().updaterState[m] || (rt(
    m,
    at(
      m,
      X,
      q.current,
      R
    )
  ), r.getState().cogsStateStore[m] || J(m, t), r.getState().initialStateGlobal[m] || ft(m, t));
  const u = Et(() => at(
    m,
    X,
    q.current,
    R
  ), [m, R]);
  return [$t(m), u];
}
function at(t, i, h, f) {
  const y = /* @__PURE__ */ new Map();
  let A = 0;
  const E = (v) => {
    const a = v.join(".");
    for (const [S] of y)
      (S === a || S.startsWith(a + ".")) && y.delete(S);
    A++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && z(v.validationKey);
    },
    revertToInitialState: (v) => {
      const a = r.getState().getInitialOptions(t)?.validation;
      a?.key && z(a?.key), v?.validationKey && z(v.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), A++;
      const D = s(S, []), M = Y(t), R = H(M?.localStorage?.key) ? M?.localStorage?.key(S) : M?.localStorage?.key, W = `${f}-${t}-${R}`;
      W && localStorage.removeItem(W), rt(t, D), J(t, S);
      const m = r.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), A++;
      const a = at(
        t,
        i,
        h,
        f
      ), S = r.getState().initialStateGlobal[t], D = Y(t), M = H(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, R = `${f}-${t}-${M}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Nt(() => {
        ft(t, v), rt(t, a), J(t, v);
        const W = r.getState().stateComponents.get(t);
        W && W.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (W) => a.get()[W]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = r.getState().serverState[t];
      return !!(v && L(v, $t(t)));
    }
  };
  function s(v, a = [], S) {
    const D = a.map(String).join(".");
    y.get(D);
    const M = function() {
      return r().getNestedState(t, a);
    };
    Object.keys(I).forEach((m) => {
      M[m] = I[m];
    });
    const R = {
      apply(m, l, tt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${a.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, a);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const tt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !tt.has(l)) {
          const u = `${t}////${h}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(u);
            if (n && !n.paths.has("")) {
              const o = a.join(".");
              let c = !0;
              for (const g of n.paths)
                if (o.startsWith(g) && (o === g || o[g.length] === ".")) {
                  c = !1;
                  break;
                }
              c && n.paths.add(o);
            }
          }
        }
        if (l === "getDifferences")
          return () => ut(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && a.length === 0)
          return async function() {
            const u = r.getState().getInitialOptions(t), e = u?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(t, []), o = u?.validation?.key;
            try {
              const c = await e.action(n);
              if (c && !c.success && c.errors && o) {
                r.getState().removeValidationError(o), c.errors.forEach((d) => {
                  const k = [o, ...d.path].join(".");
                  r.getState().addValidationError(k, d.message);
                });
                const g = r.getState().stateComponents.get(t);
                g && g.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const u = r.getState().getNestedState(t, a), e = r.getState().initialStateGlobal[t], n = B(e, a);
          return L(u, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              t,
              a
            ), e = r.getState().initialStateGlobal[t], n = B(e, a);
            return L(u, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = r.getState().initialStateGlobal[t], e = Y(t), n = H(e?.localStorage?.key) ? e?.localStorage?.key(u) : e?.localStorage?.key, o = `${f}-${t}-${n}`;
            o && localStorage.removeItem(o);
          };
        if (l === "showValidationErrors")
          return () => {
            const u = r.getState().getInitialOptions(t)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(u.key + "." + a.join("."));
          };
        if (Array.isArray(v)) {
          const u = () => S?.validIndices ? v.map((n, o) => ({
            item: n,
            originalIndex: S.validIndices[o]
          })) : r.getState().getNestedState(t, a).map((n, o) => ({
            item: n,
            originalIndex: o
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, a.join("."));
              if (e !== void 0)
                return s(
                  v[e],
                  [...a, e.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: a });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, a.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: n,
                overscan: o = 5,
                stickToBottom: c = !1
              } = e, g = Z(null), [d, k] = K({
                startIndex: 0,
                endIndex: 50
              }), p = Z(!0), $ = r().getNestedState(
                t,
                a
              ), V = $.length, x = Et(() => {
                const w = Array.from(
                  { length: d.endIndex - d.startIndex },
                  (b, T) => d.startIndex + T
                ).filter((b) => b < V), N = w.map((b) => $[b]);
                return s(N, a, {
                  ...S,
                  validIndices: w
                });
              }, [d.startIndex, d.endIndex, $]);
              dt(() => {
                const w = g.current;
                if (!w) return;
                const N = () => {
                  const { scrollTop: b, clientHeight: T, scrollHeight: j } = w;
                  p.current = j - b - T < 30;
                  const O = Math.max(
                    0,
                    Math.floor(b / n) - o
                  ), G = Math.min(
                    V,
                    Math.ceil((b + T) / n) + o
                  );
                  k({ startIndex: O, endIndex: G });
                };
                return w.addEventListener("scroll", N, {
                  passive: !0
                }), N(), () => w.removeEventListener("scroll", N);
              }, [V, n, o]), nt(() => {
                c && p.current && g.current && (g.current.scrollTop = g.current.scrollHeight);
              }, [V]);
              const _ = yt(
                (w = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: w
                  });
                },
                []
              ), F = yt(
                (w, N = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: w * n,
                    behavior: N
                  });
                },
                [n]
              ), C = {
                outer: {
                  ref: g,
                  style: {
                    overflowY: "auto",
                    height: "100%"
                  }
                },
                inner: {
                  style: {
                    height: `${V * n}px`
                  }
                },
                list: {
                  style: {
                    paddingTop: `${d.startIndex * n}px`
                  }
                }
              };
              return {
                virtualState: x,
                virtualizerProps: C,
                scrollToBottom: _,
                scrollToIndex: F
              };
            };
          if (l === "stateSort")
            return (e) => {
              const o = [...u()].sort(
                (d, k) => e(d.item, k.item)
              ), c = o.map(({ item: d }) => d), g = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: d }) => d
                )
              };
              return s(c, a, g);
            };
          if (l === "stateFilter")
            return (e) => {
              const o = u().filter(
                ({ item: d }, k) => e(d, k)
              ), c = o.map(({ item: d }) => d), g = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: d }) => d
                )
              };
              return s(c, a, g);
            };
          if (l === "stateMap")
            return (e) => {
              const n = r.getState().getNestedState(t, a);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (c, g) => g)).map((c, g) => {
                const d = n[c], k = [...a, c.toString()], p = s(d, k, S);
                return e(d, p, {
                  register: () => {
                    const [, V] = K({}), x = `${h}-${a.join(".")}-${c}`;
                    dt(() => {
                      const _ = `${t}////${x}`, F = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(_, {
                        forceUpdate: () => V({}),
                        paths: /* @__PURE__ */ new Set([k.join(".")])
                      }), r.getState().stateComponents.set(t, F), () => {
                        const C = r.getState().stateComponents.get(t);
                        C && C.components.delete(_);
                      };
                    }, [t, x]);
                  },
                  index: g,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${a.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((o, c) => {
              let g;
              S?.validIndices && S.validIndices[c] !== void 0 ? g = S.validIndices[c] : g = c;
              const d = [...a, g.toString()], k = s(o, d, S);
              return e(
                o,
                k,
                c,
                v,
                s(v, a, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ot(Wt, {
              proxy: {
                _stateKey: t,
                _path: a,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateFlattenOn")
            return (e) => {
              const n = v;
              y.clear(), A++;
              const o = n.flatMap(
                (c) => c[e] ?? []
              );
              return s(
                o,
                [...a, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const n = v[e];
              return s(n, [...a, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, a);
              if (e.length === 0) return;
              const n = e.length - 1, o = e[n], c = [...a, n.toString()];
              return s(o, c);
            };
          if (l === "insert")
            return (e) => (E(a), lt(i, e, a, t), s(
              r.getState().getNestedState(t, a),
              a
            ));
          if (l === "uniqueInsert")
            return (e, n, o) => {
              const c = r.getState().getNestedState(t, a), g = H(e) ? e(c) : e;
              let d = null;
              if (!c.some((p) => {
                if (n) {
                  const V = n.every(
                    (x) => L(p[x], g[x])
                  );
                  return V && (d = p), V;
                }
                const $ = L(p, g);
                return $ && (d = p), $;
              }))
                E(a), lt(i, g, a, t);
              else if (o && d) {
                const p = o(d), $ = c.map(
                  (V) => L(V, d) ? p : V
                );
                E(a), Q(i, $, a);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return E(a), et(i, a, t, e), s(
                  r.getState().getNestedState(t, a),
                  a
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < v.length; n++)
                v[n] === e && et(i, a, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = v.findIndex((o) => o === e);
              n > -1 ? et(i, a, t, n) : lt(i, e, a, t);
            };
          if (l === "stateFind")
            return (e) => {
              const o = u().find(
                ({ item: g }, d) => e(g, d)
              );
              if (!o) return;
              const c = [...a, o.originalIndex.toString()];
              return s(o.item, c, S);
            };
          if (l === "findWith")
            return (e, n) => {
              const c = u().find(
                ({ item: d }) => d[e] === n
              );
              if (!c) return;
              const g = [...a, c.originalIndex.toString()];
              return s(c.item, g, S);
            };
        }
        const q = a[a.length - 1];
        if (!isNaN(Number(q))) {
          const u = a.slice(0, -1), e = r.getState().getNestedState(t, u);
          if (Array.isArray(e) && l === "cut")
            return () => et(
              i,
              u,
              t,
              Number(q)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const u = r.getState().getNestedState(t, a);
              return S.validIndices.map((e) => u[e]);
            }
            return r.getState().getNestedState(t, a);
          };
        if (l === "$derive")
          return (u) => wt({
            _stateKey: t,
            _path: a,
            _effect: u.toString()
          });
        if (l === "$get")
          return () => wt({
            _stateKey: t,
            _path: a
          });
        if (l === "lastSynced") {
          const u = `${t}:${a.join(".")}`;
          return r.getState().getSyncInfo(u);
        }
        if (l == "getLocalStorage")
          return (u) => st(f + "-" + t + "-" + u);
        if (l === "_selected") {
          const u = a.slice(0, -1), e = u.join("."), n = r.getState().getNestedState(t, u);
          return Array.isArray(n) ? Number(a[a.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const e = a.slice(0, -1), n = Number(a[a.length - 1]), o = e.join(".");
            u ? r.getState().setSelectedIndex(t, o, n) : r.getState().setSelectedIndex(t, o, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            Q(i, c, e), E(e);
          };
        if (l === "toggleSelected")
          return () => {
            const u = a.slice(0, -1), e = Number(a[a.length - 1]), n = u.join("."), o = r.getState().getSelectedIndex(t, n);
            r.getState().setSelectedIndex(
              t,
              n,
              o === e ? void 0 : e
            );
            const c = r.getState().getNestedState(t, [...u]);
            Q(i, c, u), E(u);
          };
        if (a.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const e = r.getState().cogsStateStore[t], o = _t(e, u).newDocument;
              At(
                t,
                r.getState().initialStateGlobal[t],
                o,
                i,
                h,
                f
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const g = ut(e, o), d = new Set(g);
                for (const [
                  k,
                  p
                ] of c.components.entries()) {
                  let $ = !1;
                  const V = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!V.includes("none")) {
                    if (V.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (V.includes("component") && (p.paths.has("") && ($ = !0), !$))
                      for (const x of d) {
                        if (p.paths.has(x)) {
                          $ = !0;
                          break;
                        }
                        let _ = x.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const F = x.substring(0, _);
                          if (p.paths.has(F)) {
                            $ = !0;
                            break;
                          }
                          const C = x.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(C))) {
                            const w = F.lastIndexOf(".");
                            if (w !== -1) {
                              const N = F.substring(
                                0,
                                w
                              );
                              if (p.paths.has(N)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          _ = F.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && V.includes("deps") && p.depsFunction) {
                      const x = p.depsFunction(o);
                      let _ = !1;
                      typeof x == "boolean" ? x && (_ = !0) : L(p.deps, x) || (p.deps = x, _ = !0), _ && ($ = !0);
                    }
                    $ && p.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const u = r.getState().getInitialOptions(t)?.validation, e = r.getState().addValidationError;
              if (!u?.zodSchema)
                throw new Error("Zod schema not found");
              if (!u?.key)
                throw new Error("Validation key not found");
              z(u.key);
              const n = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(u.key);
                o && o.length > 0 && o.forEach(([g]) => {
                  g && g.startsWith(u.key) && z(g);
                });
                const c = u.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((d) => {
                  const k = d.path, p = d.message, $ = [u.key, ...k].join(".");
                  e($, p);
                }), it(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => vt.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return r.getState().serverState[t];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
        }
        if (l === "getFormRef")
          return () => vt.getState().getFormRef(t + "." + a.join("."));
        if (l === "validationWrapper")
          return ({
            children: u,
            hideMessage: e
          }) => /* @__PURE__ */ mt(
            bt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: a,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: u
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return a;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (u, e) => {
            if (e?.debounce)
              xt(() => {
                Q(i, u, a, "");
                const n = r.getState().getNestedState(t, a);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              Q(i, u, a, "");
              const n = r.getState().getNestedState(t, a);
              e?.afterUpdate && e.afterUpdate(n);
            }
            E(a);
          };
        if (l === "formElement")
          return (u, e) => /* @__PURE__ */ mt(
            Ct,
            {
              setState: i,
              stateKey: t,
              path: a,
              child: u,
              formOpts: e
            }
          );
        const P = [...a, l], X = r.getState().getNestedState(t, P);
        return s(X, P, S);
      }
    }, W = new Proxy(M, R);
    return y.set(D, {
      proxy: W,
      stateVersion: A
    }), W;
  }
  return s(
    r.getState().getNestedState(t, [])
  );
}
function wt(t) {
  return ot(Gt, { proxy: t });
}
function Wt({
  proxy: t,
  rebuildStateShape: i
}) {
  const h = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? i(
    h,
    t._path
  ).stateMapNoRender(
    (y, A, E, I, s) => t._mapFn(y, A, E, I, s)
  ) : null;
}
function Gt({
  proxy: t
}) {
  const i = Z(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, E = Array.from(y.childNodes).indexOf(f);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: E,
      effect: t._effect
    };
    r.getState().addSignalElement(h, v);
    const a = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(a);
      } catch (M) {
        console.error("Error evaluating effect function during mount:", M), S = a;
      }
    else
      S = a;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const D = document.createTextNode(String(S));
    f.replaceWith(D);
  }, [t._stateKey, t._path.join("."), t._effect]), ot("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function ne(t) {
  const i = kt(
    (h) => {
      const f = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return ot("text", {}, String(i));
}
export {
  wt as $cogsSignal,
  ne as $cogsSignalStore,
  Kt as addStateOptions,
  te as createCogsState,
  ee as notifyComponent,
  Dt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
