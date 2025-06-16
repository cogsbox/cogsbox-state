"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as Q, useRef as Z, useEffect as ot, useLayoutEffect as ct, useMemo as ht, createElement as at, useSyncExternalStore as xt, startTransition as Pt, useCallback as wt } from "react";
import { transformStateFunc as _t, isDeepEqual as H, isFunction as Y, getNestedValue as z, getDifferences as vt, debounce as Mt } from "./utility.js";
import { pushFunc as St, updateFn as rt, cutFunc as it, ValidationWrapper as jt, FormControlComponent as Rt } from "./Functions.jsx";
import Ot from "superjson";
import { v4 as yt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Tt } from "./store.js";
import { useCogsConfig as bt } from "./CogsStateClient.jsx";
import { applyPatch as Ut } from "fast-json-patch";
import Ft from "react-use-measure";
function Et(t, i) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...i
  });
}
function At({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const f = et(t) || {}, y = m[t] || {}, b = o.getState().setInitialStateOptions, w = { ...y, ...f };
  let I = !1;
  if (i)
    for (const a in i)
      w.hasOwnProperty(a) ? (a == "localStorage" && i[a] && w[a].key !== i[a]?.key && (I = !0, w[a] = i[a]), a == "initialState" && i[a] && w[a] !== i[a] && // Different references
      !H(w[a], i[a]) && (I = !0, w[a] = i[a])) : (I = !0, w[a] = i[a]);
  I && b(t, w);
}
function ie(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const ce = (t, i) => {
  let m = t;
  const [f, y] = _t(m);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, et(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const b = (I, a) => {
    const [v] = Q(a?.componentId ?? yt());
    At({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [W, U] = Bt(
      S,
      {
        stateKey: I,
        syncUpdate: a?.syncUpdate,
        componentId: v,
        localStorage: a?.localStorage,
        middleware: a?.middleware,
        enabledSync: a?.enabledSync,
        reactiveType: a?.reactiveType,
        reactiveDeps: a?.reactiveDeps,
        initialState: a?.initialState,
        dependencies: a?.dependencies,
        serverState: a?.serverState
      }
    );
    return U;
  };
  function w(I, a) {
    At({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Ht(I, a), gt(I);
  }
  return { useCogsState: b, setCogsOptions: w };
}, {
  setUpdaterState: lt,
  setState: K,
  getInitialOptions: et,
  getKeyState: Nt,
  getValidationErrors: Dt,
  setStateLog: Lt,
  updateInitialStateGlobal: It,
  addValidationError: Wt,
  removeValidationError: J,
  setServerSyncActions: Gt
} = o.getState(), $t = (t, i, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    f
  );
  const b = Y(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const w = `${f}-${i}-${b}`;
    let I;
    try {
      I = ut(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Ot.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(v.json)
    );
  }
}, ut = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Ht = (t, i) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = bt(), y = Y(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (y && f) {
    const b = ut(
      `${f}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return K(t, b.state), gt(t), !0;
  }
  return !1;
}, Ct = (t, i, m, f, y, b) => {
  const w = {
    initialState: i,
    updaterState: dt(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  It(t, w.initialState), lt(t, w.updaterState), K(t, w.state);
}, gt = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, le = (t, i) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${i}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, zt = (t, i, m, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: z(i, f),
        newValue: z(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: z(m, f)
      };
    case "cut":
      return {
        oldValue: z(i, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Bt(t, {
  stateKey: i,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: b,
  reactiveType: w,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [W, U] = Q({}), { sessionId: F } = bt();
  let G = !i;
  const [h] = Q(i ?? yt()), l = o.getState().stateLog[h], st = Z(/* @__PURE__ */ new Set()), X = Z(I ?? yt()), R = Z(
    null
  );
  R.current = et(h) ?? null, ot(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      K(h, (r) => ({
        ...r,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), ot(() => {
    if (a) {
      Et(h, {
        initialState: a
      });
      const e = R.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = o.getState().initialStateGlobal[h];
      if (!(c && !H(c, a) || !c) && !s)
        return;
      let u = null;
      const E = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && F && (u = ut(`${F}-${h}-${E}`));
      let p = a, $ = !1;
      const _ = s ? Date.now() : 0, x = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      s && _ > x ? (p = e.serverState.data, $ = !0) : u && x > M && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), o.getState().initializeShadowState(h, a), Ct(
        h,
        a,
        p,
        nt,
        X.current,
        F
      ), $ && E && F && $t(p, h, e, F, Date.now()), gt(h), (Array.isArray(w) ? w : [w || "component"]).includes("none") || U({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ct(() => {
    G && Et(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: R.current?.middleware
    });
    const e = `${h}////${X.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), U({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const nt = (e, r, s, c) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      st.current.add(u);
    }
    const g = o.getState();
    K(h, (u) => {
      const E = Y(e) ? e(u) : e, p = `${h}-${r.join(".")}`;
      if (p) {
        let P = !1, N = g.signalDomElements.get(p);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), L = z(E, O);
          if (Array.isArray(L)) {
            P = !0;
            const A = `${h}-${O.join(".")}`;
            N = g.signalDomElements.get(A);
          }
        }
        if (N) {
          const O = P ? z(E, r.slice(0, -1)) : z(E, r);
          N.forEach(({ parentId: L, position: A, effect: T }) => {
            const k = document.querySelector(
              `[data-parent-id="${L}"]`
            );
            if (k) {
              const j = Array.from(k.childNodes);
              if (j[A]) {
                const C = T ? new Function("state", `return (${T})(state)`)(O) : O;
                j[A].textContent = String(C);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (c || R.current?.validation?.key) && r && J(
        (c || R.current?.validation?.key) + "." + r.join(".")
      );
      const $ = r.slice(0, r.length - 1);
      s.updateType === "cut" && R.current?.validation?.key && J(
        R.current?.validation?.key + "." + $.join(".")
      ), s.updateType === "insert" && R.current?.validation?.key && Dt(
        R.current?.validation?.key + "." + $.join(".")
      ).filter(([N, O]) => {
        let L = N?.split(".").length;
        if (N == $.join(".") && L == $.length - 1) {
          let A = N + "." + $;
          J(N), Wt(A, O);
        }
      });
      const _ = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const P = vt(u, E), N = new Set(P), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          L,
          A
        ] of _.components.entries()) {
          let T = !1;
          const k = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !k.includes("none")) {
            if (k.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (k.includes("component") && ((A.paths.has(O) || A.paths.has("")) && (T = !0), !T))
              for (const j of N) {
                let C = j;
                for (; ; ) {
                  if (A.paths.has(C)) {
                    T = !0;
                    break;
                  }
                  const D = C.lastIndexOf(".");
                  if (D !== -1) {
                    const q = C.substring(
                      0,
                      D
                    );
                    if (!isNaN(
                      Number(C.substring(D + 1))
                    ) && A.paths.has(q)) {
                      T = !0;
                      break;
                    }
                    C = q;
                  } else
                    C = "";
                  if (C === "")
                    break;
                }
                if (T) break;
              }
            if (!T && k.includes("deps") && A.depsFunction) {
              const j = A.depsFunction(E);
              let C = !1;
              typeof j == "boolean" ? j && (C = !0) : H(A.deps, j) || (A.deps = j, C = !0), C && (T = !0);
            }
            T && A.forceUpdate();
          }
        }
      }
      const x = Date.now();
      r = r.map((P, N) => {
        const O = r.slice(0, -1), L = z(E, O);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (L.length - 1).toString() : P;
      });
      const { oldValue: M, newValue: V } = zt(
        s.updateType,
        u,
        E,
        r
      ), B = {
        timeStamp: x,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: V
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, r, E);
          break;
        case "insert":
          const P = r.slice(0, -1);
          g.insertShadowArrayElement(h, P, V);
          break;
        case "cut":
          const N = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, N, O);
          break;
      }
      if (Lt(h, (P) => {
        const O = [...P ?? [], B].reduce((L, A) => {
          const T = `${A.stateKey}:${JSON.stringify(A.path)}`, k = L.get(T);
          return k ? (k.timeStamp = Math.max(k.timeStamp, A.timeStamp), k.newValue = A.newValue, k.oldValue = k.oldValue ?? A.oldValue, k.updateType = A.updateType) : L.set(T, { ...A }), L;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), $t(
        E,
        h,
        R.current,
        F
      ), R.current?.middleware && R.current.middleware({
        updateLog: l,
        update: B
      }), R.current?.serverSync) {
        const P = g.serverState[h], N = R.current?.serverSync;
        Gt(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[h] || (lt(
    h,
    dt(
      h,
      nt,
      X.current,
      F
    )
  ), o.getState().cogsStateStore[h] || K(h, t), o.getState().initialStateGlobal[h] || It(h, t));
  const d = ht(() => dt(
    h,
    nt,
    X.current,
    F
  ), [h, F]);
  return [Nt(h), d];
}
function dt(t, i, m, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const w = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    b++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const W = a(S, []), U = et(t), F = Y(U?.localStorage?.key) ? U?.localStorage?.key(S) : U?.localStorage?.key, G = `${f}-${t}-${F}`;
      G && localStorage.removeItem(G), lt(t, W), K(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = dt(
        t,
        i,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], W = et(t), U = Y(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, F = `${f}-${t}-${U}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Pt(() => {
        It(t, v), o.getState().initializeShadowState(t, v), lt(t, n), K(t, v);
        const G = o.getState().stateComponents.get(t);
        G && G.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = o.getState().serverState[t];
      return !!(v && H(v, Nt(t)));
    }
  };
  function a(v, n = [], S) {
    const W = n.map(String).join(".");
    y.get(W);
    const U = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      U[h] = I[h];
    });
    const F = {
      apply(h, l, st) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const st = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !st.has(l)) {
          const d = `${t}////${m}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const s = n.join(".");
              let c = !0;
              for (const g of r.paths)
                if (s.startsWith(g) && (s === g || s[g.length] === ".")) {
                  c = !1;
                  break;
                }
              c && r.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => vt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(t, []), s = d?.validation?.key;
            try {
              const c = await e.action(r);
              if (c && !c.success && c.errors && s) {
                o.getState().removeValidationError(s), c.errors.forEach((u) => {
                  const E = [s, ...u.path].join(".");
                  o.getState().addValidationError(E, u.message);
                });
                const g = o.getState().stateComponents.get(t);
                g && g.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = z(e, n);
          return H(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = z(e, n);
            return H(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = et(t), r = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => S?.validIndices ? v.map((r, s) => ({
            item: r,
            originalIndex: S.validIndices[s]
          })) : o.getState().getNestedState(t, n).map((r, s) => ({
            item: r,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return a(
                  v[e],
                  [...n, e.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (l === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: r = 50,
                overscan: s = 5,
                stickToBottom: c = !1
              } = e, g = Z(null), [u, E] = Q({
                startIndex: 0,
                endIndex: 10
              }), p = Z(!1), [$, _] = Q(0), x = Z(0);
              ot(() => o.getState().subscribeToShadowState(t, () => {
                _((k) => k + 1);
              }), [t]);
              const M = o().getNestedState(
                t,
                n
              ), V = M.length, { totalHeight: B, positions: P } = ht(() => {
                const T = o.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const j = [];
                for (let C = 0; C < V; C++) {
                  j[C] = k;
                  const D = T[C]?.virtualizer?.itemHeight;
                  k += D || r;
                }
                return { totalHeight: k, positions: j };
              }, [
                V,
                t,
                n.join("."),
                r,
                $
              ]), N = ht(() => {
                const T = Math.max(0, u.startIndex), k = Math.min(V, u.endIndex), j = Array.from(
                  { length: k - T },
                  (D, q) => T + q
                ), C = j.map((D) => M[D]);
                return a(C, n, {
                  ...S,
                  validIndices: j
                });
              }, [u.startIndex, u.endIndex, M, V]);
              ct(() => {
                const T = g.current;
                if (!T) return;
                const k = () => {
                  if (!T) return;
                  const { scrollTop: C } = T;
                  let D = 0, q = V - 1;
                  for (; D <= q; ) {
                    const ft = Math.floor((D + q) / 2);
                    P[ft] < C ? D = ft + 1 : q = ft - 1;
                  }
                  const pt = Math.max(0, q - s);
                  let tt = pt;
                  const Vt = C + T.clientHeight;
                  for (; tt < V && P[tt] < Vt; )
                    tt++;
                  tt = Math.min(V, tt + s), E({ startIndex: pt, endIndex: tt });
                }, j = () => {
                  p.current = T.scrollHeight - T.scrollTop - T.clientHeight < 1, k();
                };
                if (T.addEventListener("scroll", j, {
                  passive: !0
                }), console.log("totalCount", V), c && V > 0) {
                  const C = x.current === 0 && V > 0, D = V > x.current;
                  console.log("isInitialLoad", C), console.log("hasNewItems", D), C ? setTimeout(() => {
                    T.scrollTop = T.scrollHeight, p.current = !0;
                  }, 1e3) : D && p.current && setTimeout(() => {
                    T.scrollTo({
                      top: T.scrollHeight,
                      behavior: "smooth"
                    });
                  }, 100);
                }
                return k(), x.current = V, () => {
                  T.removeEventListener("scroll", j);
                };
              }, [V, P, c]);
              const O = wt(
                (T = "smooth") => {
                  g.current && (p.current = !0, g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: T
                  }));
                },
                []
              ), L = wt(
                (T, k = "smooth") => {
                  g.current && P[T] !== void 0 && (p.current = !1, g.current.scrollTo({
                    top: P[T],
                    behavior: k
                  }));
                },
                [P]
              ), A = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${B}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${P[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: N,
                virtualizerProps: A,
                scrollToBottom: O,
                scrollToIndex: L
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, E) => e(u.item, E.item)
              ), c = s.map(({ item: u }) => u), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, g);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, E) => e(u, E)
              ), c = s.map(({ item: u }) => u), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, g);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, g) => g)).map((c, g) => {
                const u = r[c], E = [...n, c.toString()], p = a(u, E, S);
                return e(u, p, {
                  register: () => {
                    const [, _] = Q({}), x = `${m}-${n.join(".")}-${c}`;
                    ct(() => {
                      const M = `${t}////${x}`, V = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return V.components.set(M, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, V), () => {
                        const B = o.getState().stateComponents.get(t);
                        B && B.components.delete(M);
                      };
                    }, [t, x]);
                  },
                  index: g,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((s, c) => {
              let g;
              S?.validIndices && S.validIndices[c] !== void 0 ? g = S.validIndices[c] : g = c;
              const u = [...n, g.toString()], E = a(s, u, S);
              return e(
                s,
                E,
                c,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => at(qt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: a
            });
          if (l === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, g) => g)).map((c, g) => {
                const u = r[c], E = [...n, c.toString()], p = a(u, E, S), $ = `${m}-${n.join(".")}-${c}`;
                return at(Yt, {
                  key: c,
                  stateKey: t,
                  itemComponentId: $,
                  itemPath: E,
                  children: e(
                    u,
                    p,
                    g,
                    r,
                    a(r, n, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const r = v;
              y.clear(), b++;
              const s = r.flatMap(
                (c) => c[e] ?? []
              );
              return a(
                s,
                [...n, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const r = v[e];
              return a(r, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, s = e[r], c = [...n, r.toString()];
              return a(s, c);
            };
          if (l === "insert")
            return (e) => (w(n), St(i, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const c = o.getState().getNestedState(t, n), g = Y(e) ? e(c) : e;
              let u = null;
              if (!c.some((p) => {
                if (r) {
                  const _ = r.every(
                    (x) => H(p[x], g[x])
                  );
                  return _ && (u = p), _;
                }
                const $ = H(p, g);
                return $ && (u = p), $;
              }))
                w(n), St(i, g, n, t);
              else if (s && u) {
                const p = s(u), $ = c.map(
                  (_) => H(_, u) ? p : _
                );
                w(n), rt(i, $, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return w(n), it(i, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && it(i, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? it(i, n, t, r) : St(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: g }, u) => e(g, u)
              );
              if (!s) return;
              const c = [...n, s.originalIndex.toString()];
              return a(s.item, c, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const c = d().find(
                ({ item: u }) => u[e] === r
              );
              if (!c) return;
              const g = [...n, c.originalIndex.toString()];
              return a(c.item, g, S);
            };
        }
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => it(
              i,
              d,
              t,
              Number(X)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const d = o.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => kt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => kt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ut(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const c = o.getState().getNestedState(t, [...e]);
            rt(i, c, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), r = d.join("."), s = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              s === e ? void 0 : e
            );
            const c = o.getState().getNestedState(t, [...d]);
            rt(i, c, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Ut(e, d).newDocument;
              Ct(
                t,
                o.getState().initialStateGlobal[t],
                s,
                i,
                m,
                f
              );
              const c = o.getState().stateComponents.get(t);
              if (c) {
                const g = vt(e, s), u = new Set(g);
                for (const [
                  E,
                  p
                ] of c.components.entries()) {
                  let $ = !1;
                  const _ = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (p.paths.has("") && ($ = !0), !$))
                      for (const x of u) {
                        if (p.paths.has(x)) {
                          $ = !0;
                          break;
                        }
                        let M = x.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const V = x.substring(0, M);
                          if (p.paths.has(V)) {
                            $ = !0;
                            break;
                          }
                          const B = x.substring(
                            M + 1
                          );
                          if (!isNaN(Number(B))) {
                            const P = V.lastIndexOf(".");
                            if (P !== -1) {
                              const N = V.substring(
                                0,
                                P
                              );
                              if (p.paths.has(N)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          M = V.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && _.includes("deps") && p.depsFunction) {
                      const x = p.depsFunction(s);
                      let M = !1;
                      typeof x == "boolean" ? x && (M = !0) : H(p.deps, x) || (p.deps = x, M = !0), M && ($ = !0);
                    }
                    $ && p.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = o.getState().getInitialOptions(t)?.validation, e = o.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              J(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && J(g);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const E = u.path, p = u.message, $ = [d.key, ...E].join(".");
                  e($, p);
                }), gt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Tt.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return o.getState().serverState[t];
          if (l === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
        }
        if (l === "getFormRef")
          return () => Tt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ mt(
            jt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Mt(() => {
                rt(i, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              rt(i, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ mt(
            Rt,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const R = [...n, l], nt = o.getState().getNestedState(t, R);
        return a(nt, R, S);
      }
    }, G = new Proxy(U, F);
    return y.set(W, {
      proxy: G,
      stateVersion: b
    }), G;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function kt(t) {
  return at(Jt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (y, b, w, I, a) => t._mapFn(y, b, w, I, a)
  ) : null;
}
function Jt({
  proxy: t
}) {
  const i = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return ot(() => {
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
    o.getState().addSignalElement(m, v);
    const n = o.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (U) {
        console.error("Error evaluating effect function during mount:", U), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    f.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), at("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function de(t) {
  const i = xt(
    (m) => {
      const f = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return at("text", {}, String(i));
}
function Yt({
  stateKey: t,
  itemComponentId: i,
  itemPath: m,
  children: f
}) {
  const [, y] = Q({}), [b, w] = Ft(), I = Z(null);
  return ot(() => {
    w.height > 0 && w.height !== I.current && (I.current = w.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, m]), ct(() => {
    const a = `${t}////${i}`, v = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, v), () => {
      const n = o.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, i, m.join(".")]), /* @__PURE__ */ mt("div", { ref: b, children: f });
}
export {
  kt as $cogsSignal,
  de as $cogsSignalStore,
  ie as addStateOptions,
  ce as createCogsState,
  le as notifyComponent,
  Bt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
