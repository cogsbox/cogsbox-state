"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as X, useRef as Q, useEffect as et, useLayoutEffect as ct, useMemo as ht, createElement as ot, useSyncExternalStore as Vt, startTransition as Pt, useCallback as wt } from "react";
import { transformStateFunc as _t, isDeepEqual as z, isFunction as Y, getNestedValue as q, getDifferences as vt, debounce as Mt } from "./utility.js";
import { pushFunc as St, updateFn as rt, cutFunc as it, ValidationWrapper as Ot, FormControlComponent as Rt } from "./Functions.jsx";
import Ut from "superjson";
import { v4 as It } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as At } from "./store.js";
import { useCogsConfig as Ct } from "./CogsStateClient.jsx";
import { applyPatch as jt } from "fast-json-patch";
import Lt from "react-use-measure";
function Tt(t, i) {
  const h = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, y = h(t) || {};
  f(t, {
    ...y,
    ...i
  });
}
function Et({
  stateKey: t,
  options: i,
  initialOptionsPart: h
}) {
  const f = tt(t) || {}, y = h[t] || {}, C = r.getState().setInitialStateOptions, w = { ...y, ...f };
  let p = !1;
  if (i)
    for (const a in i)
      w.hasOwnProperty(a) ? (a == "localStorage" && i[a] && w[a].key !== i[a]?.key && (p = !0, w[a] = i[a]), a == "initialState" && i[a] && w[a] !== i[a] && // Different references
      !z(w[a], i[a]) && (p = !0, w[a] = i[a])) : (p = !0, w[a] = i[a]);
  p && C(t, w);
}
function ie(t, { formElements: i, validation: h }) {
  return { initialState: t, formElements: i, validation: h };
}
const ce = (t, i) => {
  let h = t;
  const [f, y] = _t(h);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((p) => {
    y[p] = y[p] || {}, y[p].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[p].formElements || {}
      // State-specific overrides
    }, tt(p) || r.getState().setInitialStateOptions(p, y[p]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const C = (p, a) => {
    const [I] = X(a?.componentId ?? It());
    Et({
      stateKey: p,
      options: a,
      initialOptionsPart: y
    });
    const n = r.getState().cogsStateStore[p] || f[p], m = a?.modifyState ? a.modifyState(n) : n, [G, U] = zt(
      m,
      {
        stateKey: p,
        syncUpdate: a?.syncUpdate,
        componentId: I,
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
  function w(p, a) {
    Et({ stateKey: p, options: a, initialOptionsPart: y }), a.localStorage && Ht(p, a), gt(p);
  }
  return { useCogsState: C, setCogsOptions: w };
}, {
  setUpdaterState: lt,
  setState: K,
  getInitialOptions: tt,
  getKeyState: bt,
  getValidationErrors: Dt,
  setStateLog: Ft,
  updateInitialStateGlobal: yt,
  addValidationError: Gt,
  removeValidationError: J,
  setServerSyncActions: Wt
} = r.getState(), $t = (t, i, h, f, y) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    f
  );
  const C = Y(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (C && f) {
    const w = `${f}-${i}-${C}`;
    let p;
    try {
      p = ut(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? p
    }, I = Ut.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(I.json)
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
  const h = r.getState().cogsStateStore[t], { sessionId: f } = Ct(), y = Y(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (y && f) {
    const C = ut(
      `${f}-${t}-${y}`
    );
    if (C && C.lastUpdated > (C.lastSyncedWithServer || 0))
      return K(t, C.state), gt(t), !0;
  }
  return !1;
}, Nt = (t, i, h, f, y, C) => {
  const w = {
    initialState: i,
    updaterState: dt(
      t,
      f,
      y,
      C
    ),
    state: h
  };
  yt(t, w.initialState), lt(t, w.updaterState), K(t, w.state);
}, gt = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, le = (t, i) => {
  const h = r.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${i}`, y = h.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Bt = (t, i, h, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: q(i, f),
        newValue: q(h, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(h, f)
      };
    case "cut":
      return {
        oldValue: q(i, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function zt(t, {
  stateKey: i,
  serverSync: h,
  localStorage: f,
  formElements: y,
  reactiveDeps: C,
  reactiveType: w,
  componentId: p,
  initialState: a,
  syncUpdate: I,
  dependencies: n,
  serverState: m
} = {}) {
  const [G, U] = X({}), { sessionId: j } = Ct();
  let W = !i;
  const [v] = X(i ?? It()), l = r.getState().stateLog[v], at = Q(/* @__PURE__ */ new Set()), Z = Q(p ?? It()), O = Q(
    null
  );
  O.current = tt(v) ?? null, et(() => {
    if (I && I.stateKey === v && I.path?.[0]) {
      K(v, (o) => ({
        ...o,
        [I.path[0]]: I.newValue
      }));
      const e = `${I.stateKey}:${I.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: I.timeStamp,
        userId: I.userId
      });
    }
  }, [I]), et(() => {
    if (a) {
      Tt(v, {
        initialState: a
      });
      const e = O.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[v];
      if (!(c && !z(c, a) || !c) && !s)
        return;
      let u = null;
      const T = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && j && (u = ut(`${j}-${v}-${T}`));
      let A = a, E = !1;
      const _ = s ? Date.now() : 0, x = u?.lastUpdated || 0, $ = u?.lastSyncedWithServer || 0;
      s && _ > x ? (A = e.serverState.data, E = !0) : u && x > $ && (A = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(A)), r.getState().initializeShadowState(v, a), Nt(
        v,
        a,
        A,
        nt,
        Z.current,
        j
      ), E && T && j && $t(A, v, e, j, Date.now()), gt(v), (Array.isArray(w) ? w : [w || "component"]).includes("none") || U({});
    }
  }, [
    a,
    m?.status,
    m?.data,
    ...n || []
  ]), ct(() => {
    W && Tt(v, {
      serverSync: h,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: O.current?.middleware
    });
    const e = `${v}////${Z.current}`, o = r.getState().stateComponents.get(v) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: C || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), r.getState().stateComponents.set(v, o), U({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(v));
    };
  }, []);
  const nt = (e, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${v}-${o.join(".")}`;
      at.current.add(u);
    }
    const g = r.getState();
    K(v, (u) => {
      const T = Y(e) ? e(u) : e, A = `${v}-${o.join(".")}`;
      if (A) {
        let M = !1, N = g.signalDomElements.get(A);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const R = o.slice(0, -1), D = q(T, R);
          if (Array.isArray(D)) {
            M = !0;
            const S = `${v}-${R.join(".")}`;
            N = g.signalDomElements.get(S);
          }
        }
        if (N) {
          const R = M ? q(T, o.slice(0, -1)) : q(T, o);
          N.forEach(({ parentId: D, position: S, effect: b }) => {
            const k = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (k) {
              const V = Array.from(k.childNodes);
              if (V[S]) {
                const P = b ? new Function("state", `return (${b})(state)`)(R) : R;
                V[S].textContent = String(P);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (c || O.current?.validation?.key) && o && J(
        (c || O.current?.validation?.key) + "." + o.join(".")
      );
      const E = o.slice(0, o.length - 1);
      s.updateType === "cut" && O.current?.validation?.key && J(
        O.current?.validation?.key + "." + E.join(".")
      ), s.updateType === "insert" && O.current?.validation?.key && Dt(
        O.current?.validation?.key + "." + E.join(".")
      ).filter(([N, R]) => {
        let D = N?.split(".").length;
        if (N == E.join(".") && D == E.length - 1) {
          let S = N + "." + E;
          J(N), Gt(S, R);
        }
      });
      const _ = g.stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const M = vt(u, T), N = new Set(M), R = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          D,
          S
        ] of _.components.entries()) {
          let b = !1;
          const k = Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"];
          if (console.log("component", S), !k.includes("none")) {
            if (k.includes("all")) {
              S.forceUpdate();
              continue;
            }
            if (k.includes("component") && ((S.paths.has(R) || S.paths.has("")) && (b = !0), !b))
              for (const V of N) {
                let P = V;
                for (; ; ) {
                  if (S.paths.has(P)) {
                    b = !0;
                    break;
                  }
                  const H = P.lastIndexOf(".");
                  if (H !== -1) {
                    const B = P.substring(
                      0,
                      H
                    );
                    if (!isNaN(
                      Number(P.substring(H + 1))
                    ) && S.paths.has(B)) {
                      b = !0;
                      break;
                    }
                    P = B;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (b) break;
              }
            if (!b && k.includes("deps") && S.depsFunction) {
              const V = S.depsFunction(T);
              let P = !1;
              typeof V == "boolean" ? V && (P = !0) : z(S.deps, V) || (S.deps = V, P = !0), P && (b = !0);
            }
            b && S.forceUpdate();
          }
        }
      }
      const x = Date.now();
      o = o.map((M, N) => {
        const R = o.slice(0, -1), D = q(T, R);
        return N === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : M;
      });
      const { oldValue: $, newValue: F } = Bt(
        s.updateType,
        u,
        T,
        o
      ), L = {
        timeStamp: x,
        stateKey: v,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: $,
        newValue: F
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(v, o, T);
          break;
        case "insert":
          const M = o.slice(0, -1);
          g.insertShadowArrayElement(v, M, F);
          break;
        case "cut":
          const N = o.slice(0, -1), R = parseInt(o[o.length - 1]);
          g.removeShadowArrayElement(v, N, R);
          break;
      }
      if (Ft(v, (M) => {
        const R = [...M ?? [], L].reduce((D, S) => {
          const b = `${S.stateKey}:${JSON.stringify(S.path)}`, k = D.get(b);
          return k ? (k.timeStamp = Math.max(k.timeStamp, S.timeStamp), k.newValue = S.newValue, k.oldValue = k.oldValue ?? S.oldValue, k.updateType = S.updateType) : D.set(b, { ...S }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), $t(
        T,
        v,
        O.current,
        j
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: L
      }), O.current?.serverSync) {
        const M = g.serverState[v], N = O.current?.serverSync;
        Wt(v, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: T }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  r.getState().updaterState[v] || (lt(
    v,
    dt(
      v,
      nt,
      Z.current,
      j
    )
  ), r.getState().cogsStateStore[v] || K(v, t), r.getState().initialStateGlobal[v] || yt(v, t));
  const d = ht(() => dt(
    v,
    nt,
    Z.current,
    j
  ), [v, j]);
  return [bt(v), d];
}
function dt(t, i, h, f) {
  const y = /* @__PURE__ */ new Map();
  let C = 0;
  const w = (I) => {
    const n = I.join(".");
    for (const [m] of y)
      (m === n || m.startsWith(n + ".")) && y.delete(m);
    C++;
  }, p = {
    removeValidation: (I) => {
      I?.validationKey && J(I.validationKey);
    },
    revertToInitialState: (I) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), I?.validationKey && J(I.validationKey);
      const m = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), C++;
      const G = a(m, []), U = tt(t), j = Y(U?.localStorage?.key) ? U?.localStorage?.key(m) : U?.localStorage?.key, W = `${f}-${t}-${j}`;
      W && localStorage.removeItem(W), lt(t, G), K(t, m);
      const v = r.getState().stateComponents.get(t);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), m;
    },
    updateInitialState: (I) => {
      y.clear(), C++;
      const n = dt(
        t,
        i,
        h,
        f
      ), m = r.getState().initialStateGlobal[t], G = tt(t), U = Y(G?.localStorage?.key) ? G?.localStorage?.key(m) : G?.localStorage?.key, j = `${f}-${t}-${U}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Pt(() => {
        yt(t, I), r.getState().initializeShadowState(t, I), lt(t, n), K(t, I);
        const W = r.getState().stateComponents.get(t);
        W && W.components.forEach((v) => {
          v.forceUpdate();
        });
      }), {
        fetchId: (W) => n.get()[W]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const I = r.getState().serverState[t];
      return !!(I && z(I, bt(t)));
    }
  };
  function a(I, n = [], m) {
    const G = n.map(String).join(".");
    y.get(G);
    const U = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(p).forEach((v) => {
      U[v] = p[v];
    });
    const j = {
      apply(v, l, at) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(v, l) {
        m?.validIndices && !Array.isArray(I) && (m = { ...m, validIndices: void 0 });
        const at = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !at.has(l)) {
          const d = `${t}////${h}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const o = e.components.get(d);
            if (o && !o.paths.has("")) {
              const s = n.join(".");
              let c = !0;
              for (const g of o.paths)
                if (s.startsWith(g) && (s === g || s[g.length] === ".")) {
                  c = !1;
                  break;
                }
              c && o.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => vt(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(t, []), s = d?.validation?.key;
            try {
              const c = await e.action(o);
              if (c && !c.success && c.errors && s) {
                r.getState().removeValidationError(s), c.errors.forEach((u) => {
                  const T = [s, ...u.path].join(".");
                  r.getState().addValidationError(T, u.message);
                });
                const g = r.getState().stateComponents.get(t);
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
          const d = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = q(e, n);
          return z(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = q(e, n);
            return z(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = tt(t), o = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${o}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(I)) {
          const d = () => m?.validIndices ? I.map((o, s) => ({
            item: o,
            originalIndex: m.validIndices[s]
          })) : r.getState().getNestedState(t, n).map((o, s) => ({
            item: o,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return a(
                  I[e],
                  [...n, e.toString()],
                  m
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: o = 50,
                overscan: s = 6,
                stickToBottom: c = !1
              } = e, g = Q(null), [u, T] = X({
                startIndex: 0,
                endIndex: 10
              }), A = Q(c), [E, _] = X(0);
              et(() => r.getState().subscribeToShadowState(t, () => {
                _((b) => b + 1);
              }), [t]);
              const x = r().getNestedState(
                t,
                n
              ), $ = x.length, { totalHeight: F, positions: L } = ht(() => {
                const S = r.getState().getShadowMetadata(t, n) || [];
                let b = 0;
                const k = [];
                for (let V = 0; V < $; V++) {
                  k[V] = b;
                  const P = S[V]?.virtualizer?.itemHeight;
                  b += P || o;
                }
                return { totalHeight: b, positions: k };
              }, [
                $,
                t,
                n.join("."),
                o,
                E
              ]), M = ht(() => {
                const S = Math.max(0, u.startIndex), b = Math.min($, u.endIndex), k = Array.from(
                  { length: b - S },
                  (P, H) => S + H
                ), V = k.map((P) => x[P]);
                return a(V, n, {
                  ...m,
                  validIndices: k
                });
              }, [u.startIndex, u.endIndex, x, $]);
              ct(() => {
                const S = g.current;
                if (!S || !A.current || $ === 0)
                  return;
                console.log("ALGORITHM: Starting..."), T({
                  startIndex: Math.max(0, $ - 10 - s),
                  endIndex: $
                }), console.log(
                  "ALGORITHM: Starting LOOP to wait for measurement."
                );
                let k = 0;
                const V = setInterval(() => {
                  k++, console.log(`LOOP ${k}: Checking last item...`);
                  const P = $ - 1, B = (r.getState().getShadowMetadata(t, n) || [])[P]?.virtualizer?.itemHeight || 0;
                  B > 0 ? (console.log(
                    `%cSUCCESS: Last item height is ${B}. Scrolling now.`,
                    "color: green; font-weight: bold;"
                  ), clearInterval(V), S.scrollTo({
                    top: S.scrollHeight,
                    behavior: "smooth"
                  })) : (console.log("...WAITING. Height is not ready."), k > 20 && (console.error(
                    "LOOP TIMEOUT: Last item was never measured. Stopping loop."
                  ), clearInterval(V)));
                }, 100);
                return () => {
                  console.log("ALGORITHM: Cleaning up loop."), clearInterval(V);
                };
              }, [$, ...e.dependencies ?? []]), et(() => {
                const S = g.current;
                if (!S) return;
                const b = () => {
                  const { scrollTop: V, clientHeight: P } = S;
                  let H = 0, B = $ - 1;
                  for (; H <= B; ) {
                    const ft = Math.floor((H + B) / 2);
                    L[ft] < V ? H = ft + 1 : B = ft - 1;
                  }
                  const pt = Math.max(0, B - s);
                  let st = pt;
                  const xt = V + P;
                  for (; st < $ && L[st] < xt; )
                    st++;
                  T({
                    startIndex: pt,
                    endIndex: Math.min($, st + s)
                  });
                }, k = () => {
                  S.scrollHeight - S.scrollTop - S.clientHeight < 1 || (A.current = !1, console.log("USER ACTION: Scroll lock DISABLED.")), b();
                };
                return S.addEventListener("scroll", k, {
                  passive: !0
                }), () => S.removeEventListener("scroll", k);
              }, []);
              const N = wt(
                (S = "smooth") => {
                  g.current && (A.current = !0, console.log("USER ACTION: Scroll lock ENABLED."), g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: S
                  }));
                },
                []
              ), R = wt(
                (S, b = "smooth") => {
                  g.current && L[S] !== void 0 && (A.current = !1, console.log("USER ACTION: Scroll lock DISABLED."), g.current.scrollTo({
                    top: L[S],
                    behavior: b
                  }));
                },
                [L]
              ), D = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${F}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${L[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: M,
                virtualizerProps: D,
                scrollToBottom: N,
                scrollToIndex: R
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, T) => e(u.item, T.item)
              ), c = s.map(({ item: u }) => u), g = {
                ...m,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, g);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, T) => e(u, T)
              ), c = s.map(({ item: u }) => u), g = {
                ...m,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, g);
            };
          if (l === "stateMap")
            return (e) => {
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (m?.validIndices || Array.from({ length: o.length }, (c, g) => g)).map((c, g) => {
                const u = o[c], T = [...n, c.toString()], A = a(u, T, m);
                return e(u, A, {
                  register: () => {
                    const [, _] = X({}), x = `${h}-${n.join(".")}-${c}`;
                    ct(() => {
                      const $ = `${t}////${x}`, F = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set($, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), r.getState().stateComponents.set(t, F), () => {
                        const L = r.getState().stateComponents.get(t);
                        L && L.components.delete($);
                      };
                    }, [t, x]);
                  },
                  index: g,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => I.map((s, c) => {
              let g;
              m?.validIndices && m.validIndices[c] !== void 0 ? g = m.validIndices[c] : g = c;
              const u = [...n, g.toString()], T = a(s, u, m);
              return e(
                s,
                T,
                c,
                I,
                a(I, n, m)
              );
            });
          if (l === "$stateMap")
            return (e) => ot(qt, {
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
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (m?.validIndices || Array.from({ length: o.length }, (c, g) => g)).map((c, g) => {
                const u = o[c], T = [...n, c.toString()], A = a(u, T, m), E = `${h}-${n.join(".")}-${c}`;
                return ot(Yt, {
                  key: c,
                  stateKey: t,
                  itemComponentId: E,
                  itemPath: T,
                  children: e(
                    u,
                    A,
                    g,
                    o,
                    a(o, n, m)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const o = I;
              y.clear(), C++;
              const s = o.flatMap(
                (c) => c[e] ?? []
              );
              return a(
                s,
                [...n, "[*]", e],
                m
              );
            };
          if (l === "index")
            return (e) => {
              const o = I[e];
              return a(o, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const o = e.length - 1, s = e[o], c = [...n, o.toString()];
              return a(s, c);
            };
          if (l === "insert")
            return (e) => (w(n), St(i, e, n, t), a(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, s) => {
              const c = r.getState().getNestedState(t, n), g = Y(e) ? e(c) : e;
              let u = null;
              if (!c.some((A) => {
                if (o) {
                  const _ = o.every(
                    (x) => z(A[x], g[x])
                  );
                  return _ && (u = A), _;
                }
                const E = z(A, g);
                return E && (u = A), E;
              }))
                w(n), St(i, g, n, t);
              else if (s && u) {
                const A = s(u), E = c.map(
                  (_) => z(_, u) ? A : _
                );
                w(n), rt(i, E, n);
              }
            };
          if (l === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return w(n), it(i, n, t, e), a(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let o = 0; o < I.length; o++)
                I[o] === e && it(i, n, t, o);
            };
          if (l === "toggleByValue")
            return (e) => {
              const o = I.findIndex((s) => s === e);
              o > -1 ? it(i, n, t, o) : St(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: g }, u) => e(g, u)
              );
              if (!s) return;
              const c = [...n, s.originalIndex.toString()];
              return a(s.item, c, m);
            };
          if (l === "findWith")
            return (e, o) => {
              const c = d().find(
                ({ item: u }) => u[e] === o
              );
              if (!c) return;
              const g = [...n, c.originalIndex.toString()];
              return a(c.item, g, m);
            };
        }
        const Z = n[n.length - 1];
        if (!isNaN(Number(Z))) {
          const d = n.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => it(
              i,
              d,
              t,
              Number(Z)
            );
        }
        if (l === "get")
          return () => {
            if (m?.validIndices && Array.isArray(I)) {
              const d = r.getState().getNestedState(t, n);
              return m.validIndices.map((e) => d[e]);
            }
            return r.getState().getNestedState(t, n);
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
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ut(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), o = r.getState().getNestedState(t, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), s = e.join(".");
            d ? r.getState().setSelectedIndex(t, s, o) : r.getState().setSelectedIndex(t, s, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            rt(i, c, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), o = d.join("."), s = r.getState().getSelectedIndex(t, o);
            r.getState().setSelectedIndex(
              t,
              o,
              s === e ? void 0 : e
            );
            const c = r.getState().getNestedState(t, [...d]);
            rt(i, c, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], s = jt(e, d).newDocument;
              Nt(
                t,
                r.getState().initialStateGlobal[t],
                s,
                i,
                h,
                f
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const g = vt(e, s), u = new Set(g);
                for (const [
                  T,
                  A
                ] of c.components.entries()) {
                  let E = !1;
                  const _ = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      A.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (A.paths.has("") && (E = !0), !E))
                      for (const x of u) {
                        if (A.paths.has(x)) {
                          E = !0;
                          break;
                        }
                        let $ = x.lastIndexOf(".");
                        for (; $ !== -1; ) {
                          const F = x.substring(0, $);
                          if (A.paths.has(F)) {
                            E = !0;
                            break;
                          }
                          const L = x.substring(
                            $ + 1
                          );
                          if (!isNaN(Number(L))) {
                            const M = F.lastIndexOf(".");
                            if (M !== -1) {
                              const N = F.substring(
                                0,
                                M
                              );
                              if (A.paths.has(N)) {
                                E = !0;
                                break;
                              }
                            }
                          }
                          $ = F.lastIndexOf(".");
                        }
                        if (E) break;
                      }
                    if (!E && _.includes("deps") && A.depsFunction) {
                      const x = A.depsFunction(s);
                      let $ = !1;
                      typeof x == "boolean" ? x && ($ = !0) : z(A.deps, x) || (A.deps = x, $ = !0), $ && (E = !0);
                    }
                    E && A.forceUpdate();
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
              J(d.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const s = r.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && J(g);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const T = u.path, A = u.message, E = [d.key, ...T].join(".");
                  e(E, A);
                }), gt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => At.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return r.getState().serverState[t];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return p.revertToInitialState;
          if (l === "updateInitialState") return p.updateInitialState;
          if (l === "removeValidation") return p.removeValidation;
        }
        if (l === "getFormRef")
          return () => At.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ mt(
            Ot,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: m?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Mt(() => {
                rt(i, d, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              rt(i, d, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
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
        const O = [...n, l], nt = r.getState().getNestedState(t, O);
        return a(nt, O, m);
      }
    }, W = new Proxy(U, j);
    return y.set(G, {
      proxy: W,
      stateVersion: C
    }), W;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function kt(t) {
  return ot(Jt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: i
}) {
  const h = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? i(
    h,
    t._path
  ).stateMapNoRender(
    (y, C, w, p, a) => t._mapFn(y, C, w, p, a)
  ) : null;
}
function Jt({
  proxy: t
}) {
  const i = Q(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, w = Array.from(y.childNodes).indexOf(f);
    let p = y.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", p));
    const I = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: w,
      effect: t._effect
    };
    r.getState().addSignalElement(h, I);
    const n = r.getState().getNestedState(t._stateKey, t._path);
    let m;
    if (t._effect)
      try {
        m = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (U) {
        console.error("Error evaluating effect function during mount:", U), m = n;
      }
    else
      m = n;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const G = document.createTextNode(String(m));
    f.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), ot("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function de(t) {
  const i = Vt(
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
function Yt({
  stateKey: t,
  itemComponentId: i,
  itemPath: h,
  children: f
}) {
  const [, y] = X({}), [C, w] = Lt(), p = Q(null);
  return et(() => {
    w.height > 0 && w.height !== p.current && (p.current = w.height, r.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, h]), ct(() => {
    const a = `${t}////${i}`, I = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return I.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([h.join(".")])
    }), r.getState().stateComponents.set(t, I), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, i, h.join(".")]), /* @__PURE__ */ mt("div", { ref: C, children: f });
}
export {
  kt as $cogsSignal,
  de as $cogsSignalStore,
  ie as addStateOptions,
  ce as createCogsState,
  le as notifyComponent,
  zt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
