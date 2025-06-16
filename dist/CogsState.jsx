"use client";
import { jsx as vt } from "react/jsx-runtime";
import { useState as Q, useRef as Z, useEffect as et, useLayoutEffect as dt, useMemo as yt, createElement as at, useSyncExternalStore as _t, startTransition as Mt, useCallback as At } from "react";
import { transformStateFunc as jt, isDeepEqual as H, isFunction as Y, getNestedValue as z, getDifferences as It, debounce as Rt } from "./utility.js";
import { pushFunc as ht, updateFn as ot, cutFunc as lt, ValidationWrapper as Ot, FormControlComponent as Ut } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as pt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as Et } from "./store.js";
import { useCogsConfig as xt } from "./CogsStateClient.jsx";
import { applyPatch as Dt } from "fast-json-patch";
import Wt from "react-use-measure";
function $t(t, i) {
  const m = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...i
  });
}
function kt({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const f = tt(t) || {}, y = m[t] || {}, k = r.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (i)
    for (const a in i)
      p.hasOwnProperty(a) ? (a == "localStorage" && i[a] && p[a].key !== i[a]?.key && (I = !0, p[a] = i[a]), a == "initialState" && i[a] && p[a] !== i[a] && // Different references
      !H(p[a], i[a]) && (I = !0, p[a] = i[a])) : (I = !0, p[a] = i[a]);
  I && k(t, p);
}
function le(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const de = (t, i) => {
  let m = t;
  const [f, y] = jt(m);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, tt(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const k = (I, a) => {
    const [v] = Q(a?.componentId ?? pt());
    kt({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = r.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [L, U] = Jt(
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
  function p(I, a) {
    kt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Bt(I, a), St(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: ut,
  setState: K,
  getInitialOptions: tt,
  getKeyState: Vt,
  getValidationErrors: Lt,
  setStateLog: Gt,
  updateInitialStateGlobal: wt,
  addValidationError: Ht,
  removeValidationError: J,
  setServerSyncActions: zt
} = r.getState(), bt = (t, i, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    f
  );
  const k = Y(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (k && f) {
    const p = `${f}-${i}-${k}`;
    let I;
    try {
      I = ft(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Ft.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
    );
  }
}, ft = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Bt = (t, i) => {
  const m = r.getState().cogsStateStore[t], { sessionId: f } = xt(), y = Y(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (y && f) {
    const k = ft(
      `${f}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return K(t, k.state), St(t), !0;
  }
  return !1;
}, Ct = (t, i, m, f, y, k) => {
  const p = {
    initialState: i,
    updaterState: gt(
      t,
      f,
      y,
      k
    ),
    state: m
  };
  wt(t, p.initialState), ut(t, p.updaterState), K(t, p.state);
}, St = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, ue = (t, i) => {
  const m = r.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${i}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, qt = (t, i, m, f) => {
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
function Jt(t, {
  stateKey: i,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: k,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [L, U] = Q({}), { sessionId: F } = xt();
  let G = !i;
  const [h] = Q(i ?? pt()), l = r.getState().stateLog[h], st = Z(/* @__PURE__ */ new Set()), X = Z(I ?? pt()), j = Z(
    null
  );
  j.current = tt(h) ?? null, et(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      K(h, (o) => ({
        ...o,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), et(() => {
    if (a) {
      $t(h, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[h];
      if (!(c && !H(c, a) || !c) && !s)
        return;
      let u = null;
      const T = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && F && (u = ft(`${F}-${h}-${T}`));
      let w = a, E = !1;
      const _ = s ? Date.now() : 0, P = u?.lastUpdated || 0, R = u?.lastSyncedWithServer || 0;
      s && _ > P ? (w = e.serverState.data, E = !0) : u && P > R && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), r.getState().initializeShadowState(h, a), Ct(
        h,
        a,
        w,
        nt,
        X.current,
        F
      ), E && T && F && bt(w, h, e, F, Date.now()), St(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || U({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), dt(() => {
    G && $t(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: j.current?.middleware
    });
    const e = `${h}////${X.current}`, o = r.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(h, o), U({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(h));
    };
  }, []);
  const nt = (e, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${h}-${o.join(".")}`;
      st.current.add(u);
    }
    const g = r.getState();
    K(h, (u) => {
      const T = Y(e) ? e(u) : e, w = `${h}-${o.join(".")}`;
      if (w) {
        let V = !1, N = g.signalDomElements.get(w);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = o.slice(0, -1), W = z(T, O);
          if (Array.isArray(W)) {
            V = !0;
            const $ = `${h}-${O.join(".")}`;
            N = g.signalDomElements.get($);
          }
        }
        if (N) {
          const O = V ? z(T, o.slice(0, -1)) : z(T, o);
          N.forEach(({ parentId: W, position: $, effect: A }) => {
            const b = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (b) {
              const M = Array.from(b.childNodes);
              if (M[$]) {
                const C = A ? new Function("state", `return (${A})(state)`)(O) : O;
                M[$].textContent = String(C);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (c || j.current?.validation?.key) && o && J(
        (c || j.current?.validation?.key) + "." + o.join(".")
      );
      const E = o.slice(0, o.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && J(
        j.current?.validation?.key + "." + E.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Lt(
        j.current?.validation?.key + "." + E.join(".")
      ).filter(([N, O]) => {
        let W = N?.split(".").length;
        if (N == E.join(".") && W == E.length - 1) {
          let $ = N + "." + E;
          J(N), Ht($, O);
        }
      });
      const _ = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const V = It(u, T), N = new Set(V), O = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          W,
          $
        ] of _.components.entries()) {
          let A = !1;
          const b = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !b.includes("none")) {
            if (b.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (b.includes("component") && (($.paths.has(O) || $.paths.has("")) && (A = !0), !A))
              for (const M of N) {
                let C = M;
                for (; ; ) {
                  if ($.paths.has(C)) {
                    A = !0;
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
                    ) && $.paths.has(q)) {
                      A = !0;
                      break;
                    }
                    C = q;
                  } else
                    C = "";
                  if (C === "")
                    break;
                }
                if (A) break;
              }
            if (!A && b.includes("deps") && $.depsFunction) {
              const M = $.depsFunction(T);
              let C = !1;
              typeof M == "boolean" ? M && (C = !0) : H($.deps, M) || ($.deps = M, C = !0), C && (A = !0);
            }
            A && $.forceUpdate();
          }
        }
      }
      const P = Date.now();
      o = o.map((V, N) => {
        const O = o.slice(0, -1), W = z(T, O);
        return N === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (W.length - 1).toString() : V;
      });
      const { oldValue: R, newValue: x } = qt(
        s.updateType,
        u,
        T,
        o
      ), B = {
        timeStamp: P,
        stateKey: h,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: R,
        newValue: x
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, o, T);
          break;
        case "insert":
          const V = o.slice(0, -1);
          g.insertShadowArrayElement(h, V, x);
          break;
        case "cut":
          const N = o.slice(0, -1), O = parseInt(o[o.length - 1]);
          g.removeShadowArrayElement(h, N, O);
          break;
      }
      if (Gt(h, (V) => {
        const O = [...V ?? [], B].reduce((W, $) => {
          const A = `${$.stateKey}:${JSON.stringify($.path)}`, b = W.get(A);
          return b ? (b.timeStamp = Math.max(b.timeStamp, $.timeStamp), b.newValue = $.newValue, b.oldValue = b.oldValue ?? $.oldValue, b.updateType = $.updateType) : W.set(A, { ...$ }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), bt(
        T,
        h,
        j.current,
        F
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: B
      }), j.current?.serverSync) {
        const V = g.serverState[h], N = j.current?.serverSync;
        zt(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: T }),
          rollBackState: V,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  r.getState().updaterState[h] || (ut(
    h,
    gt(
      h,
      nt,
      X.current,
      F
    )
  ), r.getState().cogsStateStore[h] || K(h, t), r.getState().initialStateGlobal[h] || wt(h, t));
  const d = yt(() => gt(
    h,
    nt,
    X.current,
    F
  ), [h, F]);
  return [Vt(h), d];
}
function gt(t, i, m, f) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const L = a(S, []), U = tt(t), F = Y(U?.localStorage?.key) ? U?.localStorage?.key(S) : U?.localStorage?.key, G = `${f}-${t}-${F}`;
      G && localStorage.removeItem(G), ut(t, L), K(t, S);
      const h = r.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const n = gt(
        t,
        i,
        m,
        f
      ), S = r.getState().initialStateGlobal[t], L = tt(t), U = Y(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, F = `${f}-${t}-${U}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Mt(() => {
        wt(t, v), r.getState().initializeShadowState(t, v), ut(t, n), K(t, v);
        const G = r.getState().stateComponents.get(t);
        G && G.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = r.getState().serverState[t];
      return !!(v && H(v, Vt(t)));
    }
  };
  function a(v, n = [], S) {
    const L = n.map(String).join(".");
    y.get(L);
    const U = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      U[h] = I[h];
    });
    const F = {
      apply(h, l, st) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
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
          const d = `${t}////${m}`, e = r.getState().stateComponents.get(t);
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
          return () => It(
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
          const d = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = z(e, n);
          return H(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = z(e, n);
            return H(d, o) ? "fresh" : "stale";
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
        if (Array.isArray(v)) {
          const d = () => S?.validIndices ? v.map((o, s) => ({
            item: o,
            originalIndex: S.validIndices[s]
          })) : r.getState().getNestedState(t, n).map((o, s) => ({
            item: o,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return a(
                  v[e],
                  [...n, e.toString()],
                  S
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
              } = e, g = Z(null), [u, T] = Q({
                startIndex: 0,
                endIndex: 10
              }), w = r().getNestedState(
                t,
                n
              ), E = Z(c), _ = Z(w.length), [P, R] = Q(0);
              et(() => r.getState().subscribeToShadowState(t, () => {
                R((b) => b + 1);
              }), [t]);
              const x = w.length, { totalHeight: B, positions: V } = yt(() => {
                const A = r.getState().getShadowMetadata(t, n) || [];
                let b = 0;
                const M = [];
                for (let C = 0; C < x; C++) {
                  M[C] = b;
                  const D = A[C]?.virtualizer?.itemHeight;
                  b += D || o;
                }
                return { totalHeight: b, positions: M };
              }, [
                x,
                t,
                n.join("."),
                o,
                P
              ]), N = yt(() => {
                const A = Math.max(0, u.startIndex), b = Math.min(x, u.endIndex), M = Array.from(
                  { length: b - A },
                  (D, q) => A + q
                ), C = M.map((D) => w[D]);
                return a(C, n, {
                  ...S,
                  validIndices: M
                });
              }, [u.startIndex, u.endIndex, w, x]);
              dt(() => {
                const A = g.current;
                if (!A) return;
                const b = x > _.current, M = () => {
                  const { scrollTop: D, clientHeight: q } = A;
                  let it = 0, rt = x - 1;
                  for (; it <= rt; ) {
                    const mt = Math.floor((it + rt) / 2);
                    V[mt] < D ? it = mt + 1 : rt = mt - 1;
                  }
                  const Tt = Math.max(0, rt - s);
                  let ct = Tt;
                  const Pt = D + q;
                  for (; ct < x && V[ct] < Pt; )
                    ct++;
                  T({
                    startIndex: Tt,
                    endIndex: Math.min(x, ct + s)
                  });
                };
                if (b && E.current) {
                  T({
                    startIndex: Math.max(0, x - 10 - s),
                    endIndex: x
                  });
                  const D = setInterval(() => {
                    const q = x - 1;
                    ((r.getState().getShadowMetadata(t, n) || [])[q]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(D), A.scrollTo({
                      top: A.scrollHeight,
                      behavior: "smooth"
                    }));
                  }, 100);
                  return () => clearInterval(D);
                }
                const C = () => {
                  A.scrollHeight - A.scrollTop - A.clientHeight < 1 || (E.current = !1), M();
                };
                return A.addEventListener("scroll", C, {
                  passive: !0
                }), M(), () => A.removeEventListener("scroll", C);
              }, [x, V]), et(() => {
                _.current = x;
              });
              const O = At(
                (A = "smooth") => {
                  g.current && (E.current = !0, g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: A
                  }));
                },
                []
              ), W = At(
                (A, b = "smooth") => {
                  g.current && V[A] !== void 0 && (E.current = !1, g.current.scrollTo({
                    top: V[A],
                    behavior: b
                  }));
                },
                [V]
              ), $ = {
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
                    transform: `translateY(${V[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: N,
                virtualizerProps: $,
                scrollToBottom: O,
                scrollToIndex: W
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, T) => e(u.item, T.item)
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
                ({ item: u }, T) => e(u, T)
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
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, g) => g)).map((c, g) => {
                const u = o[c], T = [...n, c.toString()], w = a(u, T, S);
                return e(u, w, {
                  register: () => {
                    const [, _] = Q({}), P = `${m}-${n.join(".")}-${c}`;
                    dt(() => {
                      const R = `${t}////${P}`, x = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return x.components.set(R, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), r.getState().stateComponents.set(t, x), () => {
                        const B = r.getState().stateComponents.get(t);
                        B && B.components.delete(R);
                      };
                    }, [t, P]);
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
            return (e) => v.map((s, c) => {
              let g;
              S?.validIndices && S.validIndices[c] !== void 0 ? g = S.validIndices[c] : g = c;
              const u = [...n, g.toString()], T = a(s, u, S);
              return e(
                s,
                T,
                c,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => at(Yt, {
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
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, g) => g)).map((c, g) => {
                const u = o[c], T = [...n, c.toString()], w = a(u, T, S), E = `${m}-${n.join(".")}-${c}`;
                return at(Xt, {
                  key: c,
                  stateKey: t,
                  itemComponentId: E,
                  itemPath: T,
                  children: e(
                    u,
                    w,
                    g,
                    o,
                    a(o, n, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const o = v;
              y.clear(), k++;
              const s = o.flatMap(
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
              const o = v[e];
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
            return (e) => (p(n), ht(i, e, n, t), a(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, s) => {
              const c = r.getState().getNestedState(t, n), g = Y(e) ? e(c) : e;
              let u = null;
              if (!c.some((w) => {
                if (o) {
                  const _ = o.every(
                    (P) => H(w[P], g[P])
                  );
                  return _ && (u = w), _;
                }
                const E = H(w, g);
                return E && (u = w), E;
              }))
                p(n), ht(i, g, n, t);
              else if (s && u) {
                const w = s(u), E = c.map(
                  (_) => H(_, u) ? w : _
                );
                p(n), ot(i, E, n);
              }
            };
          if (l === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return p(n), lt(i, n, t, e), a(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let o = 0; o < v.length; o++)
                v[o] === e && lt(i, n, t, o);
            };
          if (l === "toggleByValue")
            return (e) => {
              const o = v.findIndex((s) => s === e);
              o > -1 ? lt(i, n, t, o) : ht(i, e, n, t);
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
            return (e, o) => {
              const c = d().find(
                ({ item: u }) => u[e] === o
              );
              if (!c) return;
              const g = [...n, c.originalIndex.toString()];
              return a(c.item, g, S);
            };
        }
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const d = n.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => lt(
              i,
              d,
              t,
              Number(X)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const d = r.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
            }
            return r.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => Nt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Nt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ft(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), o = r.getState().getNestedState(t, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), s = e.join(".");
            d ? r.getState().setSelectedIndex(t, s, o) : r.getState().setSelectedIndex(t, s, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            ot(i, c, e), p(e);
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
            ot(i, c, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], s = Dt(e, d).newDocument;
              Ct(
                t,
                r.getState().initialStateGlobal[t],
                s,
                i,
                m,
                f
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const g = It(e, s), u = new Set(g);
                for (const [
                  T,
                  w
                ] of c.components.entries()) {
                  let E = !1;
                  const _ = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (w.paths.has("") && (E = !0), !E))
                      for (const P of u) {
                        if (w.paths.has(P)) {
                          E = !0;
                          break;
                        }
                        let R = P.lastIndexOf(".");
                        for (; R !== -1; ) {
                          const x = P.substring(0, R);
                          if (w.paths.has(x)) {
                            E = !0;
                            break;
                          }
                          const B = P.substring(
                            R + 1
                          );
                          if (!isNaN(Number(B))) {
                            const V = x.lastIndexOf(".");
                            if (V !== -1) {
                              const N = x.substring(
                                0,
                                V
                              );
                              if (w.paths.has(N)) {
                                E = !0;
                                break;
                              }
                            }
                          }
                          R = x.lastIndexOf(".");
                        }
                        if (E) break;
                      }
                    if (!E && _.includes("deps") && w.depsFunction) {
                      const P = w.depsFunction(s);
                      let R = !1;
                      typeof P == "boolean" ? P && (R = !0) : H(w.deps, P) || (w.deps = P, R = !0), R && (E = !0);
                    }
                    E && w.forceUpdate();
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
                  const T = u.path, w = u.message, E = [d.key, ...T].join(".");
                  e(E, w);
                }), St(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Et.getState().getFormRefsByStateKey(t);
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
          return () => Et.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ vt(
            Ot,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
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
              Rt(() => {
                ot(i, d, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              ot(i, d, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ vt(
            Ut,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const j = [...n, l], nt = r.getState().getNestedState(t, j);
        return a(nt, j, S);
      }
    }, G = new Proxy(U, F);
    return y.set(L, {
      proxy: G,
      stateVersion: k
    }), G;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function Nt(t) {
  return at(Zt, { proxy: t });
}
function Yt({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (y, k, p, I, a) => t._mapFn(y, k, p, I, a)
  ) : null;
}
function Zt({
  proxy: t
}) {
  const i = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, p = Array.from(y.childNodes).indexOf(f);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
      effect: t._effect
    };
    r.getState().addSignalElement(m, v);
    const n = r.getState().getNestedState(t._stateKey, t._path);
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
    const L = document.createTextNode(String(S));
    f.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), at("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ge(t) {
  const i = _t(
    (m) => {
      const f = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return at("text", {}, String(i));
}
function Xt({
  stateKey: t,
  itemComponentId: i,
  itemPath: m,
  children: f
}) {
  const [, y] = Q({}), [k, p] = Wt(), I = Z(null);
  return et(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, r.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), dt(() => {
    const a = `${t}////${i}`, v = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), r.getState().stateComponents.set(t, v), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, i, m.join(".")]), /* @__PURE__ */ vt("div", { ref: k, children: f });
}
export {
  Nt as $cogsSignal,
  ge as $cogsSignalStore,
  le as addStateOptions,
  de as createCogsState,
  ue as notifyComponent,
  Jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
