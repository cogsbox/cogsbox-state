"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as et, useRef as J, useEffect as ut, useLayoutEffect as ft, useMemo as Tt, createElement as st, useSyncExternalStore as xt, startTransition as Nt, useCallback as vt } from "react";
import { transformStateFunc as Vt, isDeepEqual as L, isFunction as H, getNestedValue as B, getDifferences as gt, debounce as Ct } from "./utility.js";
import { pushFunc as dt, updateFn as tt, cutFunc as rt, ValidationWrapper as bt, FormControlComponent as Pt } from "./Functions.jsx";
import _t from "superjson";
import { v4 as St } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ht } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import { applyPatch as Mt } from "fast-json-patch";
function It(t, i) {
  const h = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, y = h(t) || {};
  f(t, {
    ...y,
    ...i
  });
}
function pt({
  stateKey: t,
  options: i,
  initialOptionsPart: h
}) {
  const f = X(t) || {}, y = h[t] || {}, k = r.getState().setInitialStateOptions, w = { ...y, ...f };
  let I = !1;
  if (i)
    for (const s in i)
      w.hasOwnProperty(s) ? (s == "localStorage" && i[s] && w[s].key !== i[s]?.key && (I = !0, w[s] = i[s]), s == "initialState" && i[s] && w[s] !== i[s] && // Different references
      !L(w[s], i[s]) && (I = !0, w[s] = i[s])) : (I = !0, w[s] = i[s]);
  I && k(t, w);
}
function te(t, { formElements: i, validation: h }) {
  return { initialState: t, formElements: i, validation: h };
}
const ee = (t, i) => {
  let h = t;
  const [f, y] = Vt(h);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, X(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const k = (I, s) => {
    const [v] = et(s?.componentId ?? St());
    pt({
      stateKey: I,
      options: s,
      initialOptionsPart: y
    });
    const a = r.getState().cogsStateStore[I] || f[I], g = s?.modifyState ? s.modifyState(a) : a, [G, j] = Gt(
      g,
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
    return j;
  };
  function w(I, s) {
    pt({ stateKey: I, options: s, initialOptionsPart: y }), s.localStorage && Ut(I, s), ct(I);
  }
  return { useCogsState: k, setCogsOptions: w };
}, {
  setUpdaterState: at,
  setState: Y,
  getInitialOptions: X,
  getKeyState: $t,
  getValidationErrors: Ot,
  setStateLog: jt,
  updateInitialStateGlobal: mt,
  addValidationError: Ft,
  removeValidationError: z,
  setServerSyncActions: Rt
} = r.getState(), wt = (t, i, h, f, y) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    f
  );
  const k = H(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (k && f) {
    const w = `${f}-${i}-${k}`;
    let I;
    try {
      I = it(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = _t.serialize(s);
    window.localStorage.setItem(
      w,
      JSON.stringify(v.json)
    );
  }
}, it = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Ut = (t, i) => {
  const h = r.getState().cogsStateStore[t], { sessionId: f } = At(), y = H(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (y && f) {
    const k = it(
      `${f}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return Y(t, k.state), ct(t), !0;
  }
  return !1;
}, kt = (t, i, h, f, y, k) => {
  const w = {
    initialState: i,
    updaterState: ot(
      t,
      f,
      y,
      k
    ),
    state: h
  };
  mt(t, w.initialState), at(t, w.updaterState), Y(t, w.state);
}, ct = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, ne = (t, i) => {
  const h = r.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${i}`, y = h.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Dt = (t, i, h, f) => {
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
function Gt(t, {
  stateKey: i,
  serverSync: h,
  localStorage: f,
  formElements: y,
  reactiveDeps: k,
  reactiveType: w,
  componentId: I,
  initialState: s,
  syncUpdate: v,
  dependencies: a,
  serverState: g
} = {}) {
  const [G, j] = et({}), { sessionId: F } = At();
  let W = !i;
  const [m] = et(i ?? St()), l = r.getState().stateLog[m], nt = J(/* @__PURE__ */ new Set()), q = J(I ?? St()), M = J(
    null
  );
  M.current = X(m) ?? null, ut(() => {
    if (v && v.stateKey === m && v.path?.[0]) {
      Y(m, (n) => ({
        ...n,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), ut(() => {
    if (s) {
      It(m, {
        initialState: s
      });
      const e = M.current, o = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, s) || !c) && !o)
        return;
      let u = null;
      const N = H(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      N && F && (u = it(`${F}-${m}-${N}`));
      let p = s, $ = !1;
      const C = o ? Date.now() : 0, A = u?.lastUpdated || 0, O = u?.lastSyncedWithServer || 0;
      o && C > A ? (p = e.serverState.data, $ = !0) : u && A > O && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), kt(
        m,
        s,
        p,
        Q,
        q.current,
        F
      ), $ && N && F && wt(p, m, e, F, Date.now()), ct(m), (Array.isArray(w) ? w : [w || "component"]).includes("none") || j({});
    }
  }, [
    s,
    g?.status,
    g?.data,
    ...a || []
  ]), ft(() => {
    W && It(m, {
      serverSync: h,
      formElements: y,
      initialState: s,
      localStorage: f,
      middleware: M.current?.middleware
    });
    const e = `${m}////${q.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => j({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), j({}), () => {
      const o = `${m}////${q.current}`;
      n && (n.components.delete(o), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const Q = (e, n, o, c) => {
    if (Array.isArray(n)) {
      const S = `${m}-${n.join(".")}`;
      nt.current.add(S);
    }
    Y(m, (S) => {
      const u = H(e) ? e(S) : e, N = `${m}-${n.join(".")}`;
      if (N) {
        let P = !1, x = r.getState().signalDomElements.get(N);
        if ((!x || x.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const T = n.slice(0, -1), _ = B(u, T);
          if (Array.isArray(_)) {
            P = !0;
            const E = `${m}-${T.join(".")}`;
            x = r.getState().signalDomElements.get(E);
          }
        }
        if (x) {
          const T = P ? B(u, n.slice(0, -1)) : B(u, n);
          x.forEach(({ parentId: _, position: E, effect: b }) => {
            const V = document.querySelector(
              `[data-parent-id="${_}"]`
            );
            if (V) {
              const U = Array.from(V.childNodes);
              if (U[E]) {
                const R = b ? new Function("state", `return (${b})(state)`)(T) : T;
                U[E].textContent = String(R);
              }
            }
          });
        }
      }
      o.updateType === "update" && (c || M.current?.validation?.key) && n && z(
        (c || M.current?.validation?.key) + "." + n.join(".")
      );
      const p = n.slice(0, n.length - 1);
      o.updateType === "cut" && M.current?.validation?.key && z(
        M.current?.validation?.key + "." + p.join(".")
      ), o.updateType === "insert" && M.current?.validation?.key && Ot(
        M.current?.validation?.key + "." + p.join(".")
      ).filter(([x, T]) => {
        let _ = x?.split(".").length;
        if (x == p.join(".") && _ == p.length - 1) {
          let E = x + "." + p;
          z(x), Ft(E, T);
        }
      });
      const $ = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const P = gt(S, u), x = new Set(P), T = o.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          _,
          E
        ] of $.components.entries()) {
          let b = !1;
          const V = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !V.includes("none")) {
            if (V.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (V.includes("component") && ((E.paths.has(T) || E.paths.has("")) && (b = !0), !b))
              for (const U of x) {
                let R = U;
                for (; ; ) {
                  if (E.paths.has(R)) {
                    b = !0;
                    break;
                  }
                  const Z = R.lastIndexOf(".");
                  if (Z !== -1) {
                    const K = R.substring(
                      0,
                      Z
                    );
                    if (!isNaN(
                      Number(R.substring(Z + 1))
                    ) && E.paths.has(K)) {
                      b = !0;
                      break;
                    }
                    R = K;
                  } else
                    R = "";
                  if (R === "")
                    break;
                }
                if (b) break;
              }
            if (!b && V.includes("deps") && E.depsFunction) {
              const U = E.depsFunction(u);
              let R = !1;
              typeof U == "boolean" ? U && (R = !0) : L(E.deps, U) || (E.deps = U, R = !0), R && (b = !0);
            }
            b && E.forceUpdate();
          }
        }
      }
      const C = Date.now();
      n = n.map((P, x) => {
        const T = n.slice(0, -1), _ = B(u, T);
        return x === n.length - 1 && ["insert", "cut"].includes(o.updateType) ? (_.length - 1).toString() : P;
      });
      const { oldValue: A, newValue: O } = Dt(
        o.updateType,
        S,
        u,
        n
      ), D = {
        timeStamp: C,
        stateKey: m,
        path: n,
        updateType: o.updateType,
        status: "new",
        oldValue: A,
        newValue: O
      };
      if (jt(m, (P) => {
        const T = [...P ?? [], D].reduce((_, E) => {
          const b = `${E.stateKey}:${JSON.stringify(E.path)}`, V = _.get(b);
          return V ? (V.timeStamp = Math.max(V.timeStamp, E.timeStamp), V.newValue = E.newValue, V.oldValue = V.oldValue ?? E.oldValue, V.updateType = E.updateType) : _.set(b, { ...E }), _;
        }, /* @__PURE__ */ new Map());
        return Array.from(T.values());
      }), wt(
        u,
        m,
        M.current,
        F
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: D
      }), M.current?.serverSync) {
        const P = r.getState().serverState[m], x = M.current?.serverSync;
        Rt(m, {
          syncKey: typeof x.syncKey == "string" ? x.syncKey : x.syncKey({ state: u }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (x.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  r.getState().updaterState[m] || (at(
    m,
    ot(
      m,
      Q,
      q.current,
      F
    )
  ), r.getState().cogsStateStore[m] || Y(m, t), r.getState().initialStateGlobal[m] || mt(m, t));
  const d = Tt(() => ot(
    m,
    Q,
    q.current,
    F
  ), [m, F]);
  return [$t(m), d];
}
function ot(t, i, h, f) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const w = (v) => {
    const a = v.join(".");
    for (const [g] of y)
      (g === a || g.startsWith(a + ".")) && y.delete(g);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && z(v.validationKey);
    },
    revertToInitialState: (v) => {
      const a = r.getState().getInitialOptions(t)?.validation;
      a?.key && z(a?.key), v?.validationKey && z(v.validationKey);
      const g = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const G = s(g, []), j = X(t), F = H(j?.localStorage?.key) ? j?.localStorage?.key(g) : j?.localStorage?.key, W = `${f}-${t}-${F}`;
      W && localStorage.removeItem(W), at(t, G), Y(t, g);
      const m = r.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), g;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const a = ot(
        t,
        i,
        h,
        f
      ), g = r.getState().initialStateGlobal[t], G = X(t), j = H(G?.localStorage?.key) ? G?.localStorage?.key(g) : G?.localStorage?.key, F = `${f}-${t}-${j}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Nt(() => {
        mt(t, v), at(t, a), Y(t, v);
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
  function s(v, a = [], g) {
    const G = a.map(String).join(".");
    y.get(G);
    const j = function() {
      return r().getNestedState(t, a);
    };
    Object.keys(I).forEach((m) => {
      j[m] = I[m];
    });
    const F = {
      apply(m, l, nt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${a.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, a);
      },
      get(m, l) {
        g?.validIndices && !Array.isArray(v) && (g = { ...g, validIndices: void 0 });
        const nt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !nt.has(l)) {
          const d = `${t}////${h}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(d);
            if (n && !n.paths.has("")) {
              const o = a.join(".");
              let c = !0;
              for (const S of n.paths)
                if (o.startsWith(S) && (o === S || o[S.length] === ".")) {
                  c = !1;
                  break;
                }
              c && n.paths.add(o);
            }
          }
        }
        if (l === "getDifferences")
          return () => gt(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && a.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(t, []), o = d?.validation?.key;
            try {
              const c = await e.action(n);
              if (c && !c.success && c.errors && o) {
                r.getState().removeValidationError(o), c.errors.forEach((u) => {
                  const N = [o, ...u.path].join(".");
                  r.getState().addValidationError(N, u.message);
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
          const d = r.getState().getNestedState(t, a), e = r.getState().initialStateGlobal[t], n = B(e, a);
          return L(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              a
            ), e = r.getState().initialStateGlobal[t], n = B(e, a);
            return L(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = X(t), n = H(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, o = `${f}-${t}-${n}`;
            o && localStorage.removeItem(o);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + a.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => g?.validIndices ? v.map((n, o) => ({
            item: n,
            originalIndex: g.validIndices[o]
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
                  g
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
              } = e, S = J(null), [u, N] = et({
                startIndex: 0,
                endIndex: 10
              }), p = J(c), $ = J(0), C = r().getNestedState(
                t,
                a
              ), A = C.length, O = Tt(() => {
                const T = Math.max(0, u.startIndex), _ = Math.min(A, u.endIndex), E = Array.from(
                  { length: _ - T },
                  (V, U) => T + U
                ), b = E.map((V) => C[V]);
                return s(b, a, {
                  ...g,
                  validIndices: E
                });
              }, [u.startIndex, u.endIndex, C, A]);
              ft(() => {
                const T = S.current;
                if (!T) return;
                const _ = p.current, E = A > $.current;
                $.current = A;
                const b = () => {
                  const { scrollTop: V, clientHeight: U, scrollHeight: R } = T;
                  p.current = R - V - U < 30;
                  const Z = Math.max(
                    0,
                    Math.floor(V / n) - o
                  ), K = Math.min(
                    A,
                    Math.ceil((V + U) / n) + o
                  );
                  N((lt) => lt.startIndex !== Z || lt.endIndex !== K ? { startIndex: Z, endIndex: K } : lt);
                };
                return T.addEventListener("scroll", b, {
                  passive: !0
                }), c && _ && E && requestAnimationFrame(() => {
                  T.scrollTop = T.scrollHeight;
                }), b(), () => T.removeEventListener("scroll", b);
              }, [A, n, o, c]);
              const D = vt(
                (T = "smooth") => {
                  S.current && S.current.scrollTo({
                    top: S.current.scrollHeight,
                    behavior: T
                  });
                },
                []
              ), P = vt(
                (T, _ = "smooth") => {
                  S.current && S.current.scrollTo({
                    top: T * n,
                    behavior: _
                  });
                },
                [n]
              ), x = {
                outer: {
                  ref: S,
                  style: {
                    overflowY: "auto",
                    height: "100%"
                    // Ensure the container has a defined height to scroll within
                  }
                },
                inner: {
                  style: {
                    height: `${A * n}px`,
                    position: "relative"
                    // Added for containment
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${u.startIndex * n}px)`
                    // Use transform for better performance
                  }
                }
              };
              return {
                virtualState: O,
                virtualizerProps: x,
                scrollToBottom: D,
                scrollToIndex: P
              };
            };
          if (l === "stateSort")
            return (e) => {
              const o = [...d()].sort(
                (u, N) => e(u.item, N.item)
              ), c = o.map(({ item: u }) => u), S = {
                ...g,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, a, S);
            };
          if (l === "stateFilter")
            return (e) => {
              const o = d().filter(
                ({ item: u }, N) => e(u, N)
              ), c = o.map(({ item: u }) => u), S = {
                ...g,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, a, S);
            };
          if (l === "stateMap")
            return (e) => {
              const n = r.getState().getNestedState(t, a);
              return Array.isArray(n) ? (g?.validIndices || Array.from({ length: n.length }, (c, S) => S)).map((c, S) => {
                const u = n[c], N = [...a, c.toString()], p = s(u, N, g);
                return e(u, p, {
                  register: () => {
                    const [, C] = et({}), A = `${h}-${a.join(".")}-${c}`;
                    ft(() => {
                      const O = `${t}////${A}`, D = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(O, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([N.join(".")])
                      }), r.getState().stateComponents.set(t, D), () => {
                        const P = r.getState().stateComponents.get(t);
                        P && P.components.delete(O);
                      };
                    }, [t, A]);
                  },
                  index: S,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${a.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((o, c) => {
              let S;
              g?.validIndices && g.validIndices[c] !== void 0 ? S = g.validIndices[c] : S = c;
              const u = [...a, S.toString()], N = s(o, u, g);
              return e(
                o,
                N,
                c,
                v,
                s(v, a, g)
              );
            });
          if (l === "$stateMap")
            return (e) => st(Wt, {
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
              y.clear(), k++;
              const o = n.flatMap(
                (c) => c[e] ?? []
              );
              return s(
                o,
                [...a, "[*]", e],
                g
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
            return (e) => (w(a), dt(i, e, a, t), s(
              r.getState().getNestedState(t, a),
              a
            ));
          if (l === "uniqueInsert")
            return (e, n, o) => {
              const c = r.getState().getNestedState(t, a), S = H(e) ? e(c) : e;
              let u = null;
              if (!c.some((p) => {
                if (n) {
                  const C = n.every(
                    (A) => L(p[A], S[A])
                  );
                  return C && (u = p), C;
                }
                const $ = L(p, S);
                return $ && (u = p), $;
              }))
                w(a), dt(i, S, a, t);
              else if (o && u) {
                const p = o(u), $ = c.map(
                  (C) => L(C, u) ? p : C
                );
                w(a), tt(i, $, a);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return w(a), rt(i, a, t, e), s(
                  r.getState().getNestedState(t, a),
                  a
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < v.length; n++)
                v[n] === e && rt(i, a, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = v.findIndex((o) => o === e);
              n > -1 ? rt(i, a, t, n) : dt(i, e, a, t);
            };
          if (l === "stateFind")
            return (e) => {
              const o = d().find(
                ({ item: S }, u) => e(S, u)
              );
              if (!o) return;
              const c = [...a, o.originalIndex.toString()];
              return s(o.item, c, g);
            };
          if (l === "findWith")
            return (e, n) => {
              const c = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!c) return;
              const S = [...a, c.originalIndex.toString()];
              return s(c.item, S, g);
            };
        }
        const q = a[a.length - 1];
        if (!isNaN(Number(q))) {
          const d = a.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => rt(
              i,
              d,
              t,
              Number(q)
            );
        }
        if (l === "get")
          return () => {
            if (g?.validIndices && Array.isArray(v)) {
              const d = r.getState().getNestedState(t, a);
              return g.validIndices.map((e) => d[e]);
            }
            return r.getState().getNestedState(t, a);
          };
        if (l === "$derive")
          return (d) => Et({
            _stateKey: t,
            _path: a,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Et({
            _stateKey: t,
            _path: a
          });
        if (l === "lastSynced") {
          const d = `${t}:${a.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => it(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = a.slice(0, -1), e = d.join("."), n = r.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(a[a.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = a.slice(0, -1), n = Number(a[a.length - 1]), o = e.join(".");
            d ? r.getState().setSelectedIndex(t, o, n) : r.getState().setSelectedIndex(t, o, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            tt(i, c, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = a.slice(0, -1), e = Number(a[a.length - 1]), n = d.join("."), o = r.getState().getSelectedIndex(t, n);
            r.getState().setSelectedIndex(
              t,
              n,
              o === e ? void 0 : e
            );
            const c = r.getState().getNestedState(t, [...d]);
            tt(i, c, d), w(d);
          };
        if (a.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], o = Mt(e, d).newDocument;
              kt(
                t,
                r.getState().initialStateGlobal[t],
                o,
                i,
                h,
                f
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const S = gt(e, o), u = new Set(S);
                for (const [
                  N,
                  p
                ] of c.components.entries()) {
                  let $ = !1;
                  const C = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (p.paths.has("") && ($ = !0), !$))
                      for (const A of u) {
                        if (p.paths.has(A)) {
                          $ = !0;
                          break;
                        }
                        let O = A.lastIndexOf(".");
                        for (; O !== -1; ) {
                          const D = A.substring(0, O);
                          if (p.paths.has(D)) {
                            $ = !0;
                            break;
                          }
                          const P = A.substring(
                            O + 1
                          );
                          if (!isNaN(Number(P))) {
                            const x = D.lastIndexOf(".");
                            if (x !== -1) {
                              const T = D.substring(
                                0,
                                x
                              );
                              if (p.paths.has(T)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          O = D.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && C.includes("deps") && p.depsFunction) {
                      const A = p.depsFunction(o);
                      let O = !1;
                      typeof A == "boolean" ? A && (O = !0) : L(p.deps, A) || (p.deps = A, O = !0), O && ($ = !0);
                    }
                    $ && p.forceUpdate();
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
              z(d.key);
              const n = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(d.key);
                o && o.length > 0 && o.forEach(([S]) => {
                  S && S.startsWith(d.key) && z(S);
                });
                const c = d.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const N = u.path, p = u.message, $ = [d.key, ...N].join(".");
                  e($, p);
                }), ct(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => ht.getState().getFormRefsByStateKey(t);
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
          return () => ht.getState().getFormRef(t + "." + a.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ yt(
            bt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: a,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: g?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return a;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ct(() => {
                tt(i, d, a, "");
                const n = r.getState().getNestedState(t, a);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              tt(i, d, a, "");
              const n = r.getState().getNestedState(t, a);
              e?.afterUpdate && e.afterUpdate(n);
            }
            w(a);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ yt(
            Pt,
            {
              setState: i,
              stateKey: t,
              path: a,
              child: d,
              formOpts: e
            }
          );
        const M = [...a, l], Q = r.getState().getNestedState(t, M);
        return s(Q, M, g);
      }
    }, W = new Proxy(j, F);
    return y.set(G, {
      proxy: W,
      stateVersion: k
    }), W;
  }
  return s(
    r.getState().getNestedState(t, [])
  );
}
function Et(t) {
  return st(Lt, { proxy: t });
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
    (y, k, w, I, s) => t._mapFn(y, k, w, I, s)
  ) : null;
}
function Lt({
  proxy: t
}) {
  const i = J(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return ut(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, w = Array.from(y.childNodes).indexOf(f);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: t._effect
    };
    r.getState().addSignalElement(h, v);
    const a = r.getState().getNestedState(t._stateKey, t._path);
    let g;
    if (t._effect)
      try {
        g = new Function(
          "state",
          `return (${t._effect})(state)`
        )(a);
      } catch (j) {
        console.error("Error evaluating effect function during mount:", j), g = a;
      }
    else
      g = a;
    g !== null && typeof g == "object" && (g = JSON.stringify(g));
    const G = document.createTextNode(String(g));
    f.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function re(t) {
  const i = xt(
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
  return st("text", {}, String(i));
}
export {
  Et as $cogsSignal,
  re as $cogsSignalStore,
  te as addStateOptions,
  ee as createCogsState,
  ne as notifyComponent,
  Gt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
