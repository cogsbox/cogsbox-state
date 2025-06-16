"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as X, useRef as Q, useEffect as et, useLayoutEffect as ct, useMemo as ht, createElement as ot, useSyncExternalStore as Vt, startTransition as Pt, useCallback as wt } from "react";
import { transformStateFunc as _t, isDeepEqual as z, isFunction as Y, getNestedValue as B, getDifferences as vt, debounce as Mt } from "./utility.js";
import { pushFunc as St, updateFn as rt, cutFunc as it, ValidationWrapper as jt, FormControlComponent as Ot } from "./Functions.jsx";
import Rt from "superjson";
import { v4 as yt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as Tt } from "./store.js";
import { useCogsConfig as kt } from "./CogsStateClient.jsx";
import { applyPatch as Ut } from "fast-json-patch";
import Ft from "react-use-measure";
function At(t, i) {
  const h = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, I = h(t) || {};
  f(t, {
    ...I,
    ...i
  });
}
function Et({
  stateKey: t,
  options: i,
  initialOptionsPart: h
}) {
  const f = tt(t) || {}, I = h[t] || {}, k = r.getState().setInitialStateOptions, w = { ...I, ...f };
  let p = !1;
  if (i)
    for (const a in i)
      w.hasOwnProperty(a) ? (a == "localStorage" && i[a] && w[a].key !== i[a]?.key && (p = !0, w[a] = i[a]), a == "initialState" && i[a] && w[a] !== i[a] && // Different references
      !z(w[a], i[a]) && (p = !0, w[a] = i[a])) : (p = !0, w[a] = i[a]);
  p && k(t, w);
}
function ie(t, { formElements: i, validation: h }) {
  return { initialState: t, formElements: i, validation: h };
}
const ce = (t, i) => {
  let h = t;
  const [f, I] = _t(h);
  (Object.keys(I).length > 0 || i && Object.keys(i).length > 0) && Object.keys(I).forEach((p) => {
    I[p] = I[p] || {}, I[p].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...I[p].formElements || {}
      // State-specific overrides
    }, tt(p) || r.getState().setInitialStateOptions(p, I[p]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const k = (p, a) => {
    const [y] = X(a?.componentId ?? yt());
    Et({
      stateKey: p,
      options: a,
      initialOptionsPart: I
    });
    const n = r.getState().cogsStateStore[p] || f[p], m = a?.modifyState ? a.modifyState(n) : n, [L, R] = Bt(
      m,
      {
        stateKey: p,
        syncUpdate: a?.syncUpdate,
        componentId: y,
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
    return R;
  };
  function w(p, a) {
    Et({ stateKey: p, options: a, initialOptionsPart: I }), a.localStorage && Ht(p, a), gt(p);
  }
  return { useCogsState: k, setCogsOptions: w };
}, {
  setUpdaterState: lt,
  setState: K,
  getInitialOptions: tt,
  getKeyState: Ct,
  getValidationErrors: Dt,
  setStateLog: Wt,
  updateInitialStateGlobal: It,
  addValidationError: Lt,
  removeValidationError: J,
  setServerSyncActions: Gt
} = r.getState(), $t = (t, i, h, f, I) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    f
  );
  const k = Y(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (k && f) {
    const w = `${f}-${i}-${k}`;
    let p;
    try {
      p = ut(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? p
    }, y = Rt.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(y.json)
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
  const h = r.getState().cogsStateStore[t], { sessionId: f } = kt(), I = Y(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (I && f) {
    const k = ut(
      `${f}-${t}-${I}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return K(t, k.state), gt(t), !0;
  }
  return !1;
}, xt = (t, i, h, f, I, k) => {
  const w = {
    initialState: i,
    updaterState: dt(
      t,
      f,
      I,
      k
    ),
    state: h
  };
  It(t, w.initialState), lt(t, w.updaterState), K(t, w.state);
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
    const f = `${t}////${i}`, I = h.components.get(f);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, zt = (t, i, h, f) => {
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
function Bt(t, {
  stateKey: i,
  serverSync: h,
  localStorage: f,
  formElements: I,
  reactiveDeps: k,
  reactiveType: w,
  componentId: p,
  initialState: a,
  syncUpdate: y,
  dependencies: n,
  serverState: m
} = {}) {
  const [L, R] = X({}), { sessionId: U } = kt();
  let G = !i;
  const [v] = X(i ?? yt()), l = r.getState().stateLog[v], at = Q(/* @__PURE__ */ new Set()), Z = Q(p ?? yt()), j = Q(
    null
  );
  j.current = tt(v) ?? null, et(() => {
    if (y && y.stateKey === v && y.path?.[0]) {
      K(v, (o) => ({
        ...o,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), et(() => {
    if (a) {
      At(v, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[v];
      if (!(c && !z(c, a) || !c) && !s)
        return;
      let u = null;
      const A = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      A && U && (u = ut(`${U}-${v}-${A}`));
      let T = a, E = !1;
      const _ = s ? Date.now() : 0, N = u?.lastUpdated || 0, $ = u?.lastSyncedWithServer || 0;
      s && _ > N ? (T = e.serverState.data, E = !0) : u && N > $ && (T = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), r.getState().initializeShadowState(v, a), xt(
        v,
        a,
        T,
        nt,
        Z.current,
        U
      ), E && A && U && $t(T, v, e, U, Date.now()), gt(v), (Array.isArray(w) ? w : [w || "component"]).includes("none") || R({});
    }
  }, [
    a,
    m?.status,
    m?.data,
    ...n || []
  ]), ct(() => {
    G && At(v, {
      serverSync: h,
      formElements: I,
      initialState: a,
      localStorage: f,
      middleware: j.current?.middleware
    });
    const e = `${v}////${Z.current}`, o = r.getState().stateComponents.get(v) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), r.getState().stateComponents.set(v, o), R({}), () => {
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
      const A = Y(e) ? e(u) : e, T = `${v}-${o.join(".")}`;
      if (T) {
        let M = !1, x = g.signalDomElements.get(T);
        if ((!x || x.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = o.slice(0, -1), D = B(A, O);
          if (Array.isArray(D)) {
            M = !0;
            const S = `${v}-${O.join(".")}`;
            x = g.signalDomElements.get(S);
          }
        }
        if (x) {
          const O = M ? B(A, o.slice(0, -1)) : B(A, o);
          x.forEach(({ parentId: D, position: S, effect: b }) => {
            const C = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (C) {
              const V = Array.from(C.childNodes);
              if (V[S]) {
                const P = b ? new Function("state", `return (${b})(state)`)(O) : O;
                V[S].textContent = String(P);
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
      ), s.updateType === "insert" && j.current?.validation?.key && Dt(
        j.current?.validation?.key + "." + E.join(".")
      ).filter(([x, O]) => {
        let D = x?.split(".").length;
        if (x == E.join(".") && D == E.length - 1) {
          let S = x + "." + E;
          J(x), Lt(S, O);
        }
      });
      const _ = g.stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const M = vt(u, A), x = new Set(M), O = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          D,
          S
        ] of _.components.entries()) {
          let b = !1;
          const C = Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"];
          if (console.log("component", S), !C.includes("none")) {
            if (C.includes("all")) {
              S.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((S.paths.has(O) || S.paths.has("")) && (b = !0), !b))
              for (const V of x) {
                let P = V;
                for (; ; ) {
                  if (S.paths.has(P)) {
                    b = !0;
                    break;
                  }
                  const H = P.lastIndexOf(".");
                  if (H !== -1) {
                    const q = P.substring(
                      0,
                      H
                    );
                    if (!isNaN(
                      Number(P.substring(H + 1))
                    ) && S.paths.has(q)) {
                      b = !0;
                      break;
                    }
                    P = q;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (b) break;
              }
            if (!b && C.includes("deps") && S.depsFunction) {
              const V = S.depsFunction(A);
              let P = !1;
              typeof V == "boolean" ? V && (P = !0) : z(S.deps, V) || (S.deps = V, P = !0), P && (b = !0);
            }
            b && S.forceUpdate();
          }
        }
      }
      const N = Date.now();
      o = o.map((M, x) => {
        const O = o.slice(0, -1), D = B(A, O);
        return x === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : M;
      });
      const { oldValue: $, newValue: W } = zt(
        s.updateType,
        u,
        A,
        o
      ), F = {
        timeStamp: N,
        stateKey: v,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: $,
        newValue: W
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(v, o, A);
          break;
        case "insert":
          const M = o.slice(0, -1);
          g.insertShadowArrayElement(v, M, W);
          break;
        case "cut":
          const x = o.slice(0, -1), O = parseInt(o[o.length - 1]);
          g.removeShadowArrayElement(v, x, O);
          break;
      }
      if (Wt(v, (M) => {
        const O = [...M ?? [], F].reduce((D, S) => {
          const b = `${S.stateKey}:${JSON.stringify(S.path)}`, C = D.get(b);
          return C ? (C.timeStamp = Math.max(C.timeStamp, S.timeStamp), C.newValue = S.newValue, C.oldValue = C.oldValue ?? S.oldValue, C.updateType = S.updateType) : D.set(b, { ...S }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), $t(
        A,
        v,
        j.current,
        U
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: F
      }), j.current?.serverSync) {
        const M = g.serverState[v], x = j.current?.serverSync;
        Gt(v, {
          syncKey: typeof x.syncKey == "string" ? x.syncKey : x.syncKey({ state: A }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (x.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  r.getState().updaterState[v] || (lt(
    v,
    dt(
      v,
      nt,
      Z.current,
      U
    )
  ), r.getState().cogsStateStore[v] || K(v, t), r.getState().initialStateGlobal[v] || It(v, t));
  const d = ht(() => dt(
    v,
    nt,
    Z.current,
    U
  ), [v, U]);
  return [Ct(v), d];
}
function dt(t, i, h, f) {
  const I = /* @__PURE__ */ new Map();
  let k = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [m] of I)
      (m === n || m.startsWith(n + ".")) && I.delete(m);
    k++;
  }, p = {
    removeValidation: (y) => {
      y?.validationKey && J(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), y?.validationKey && J(y.validationKey);
      const m = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), I.clear(), k++;
      const L = a(m, []), R = tt(t), U = Y(R?.localStorage?.key) ? R?.localStorage?.key(m) : R?.localStorage?.key, G = `${f}-${t}-${U}`;
      G && localStorage.removeItem(G), lt(t, L), K(t, m);
      const v = r.getState().stateComponents.get(t);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), m;
    },
    updateInitialState: (y) => {
      I.clear(), k++;
      const n = dt(
        t,
        i,
        h,
        f
      ), m = r.getState().initialStateGlobal[t], L = tt(t), R = Y(L?.localStorage?.key) ? L?.localStorage?.key(m) : L?.localStorage?.key, U = `${f}-${t}-${R}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Pt(() => {
        It(t, y), r.getState().initializeShadowState(t, y), lt(t, n), K(t, y);
        const G = r.getState().stateComponents.get(t);
        G && G.components.forEach((v) => {
          v.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = r.getState().serverState[t];
      return !!(y && z(y, Ct(t)));
    }
  };
  function a(y, n = [], m) {
    const L = n.map(String).join(".");
    I.get(L);
    const R = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(p).forEach((v) => {
      R[v] = p[v];
    });
    const U = {
      apply(v, l, at) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(v, l) {
        m?.validIndices && !Array.isArray(y) && (m = { ...m, validIndices: void 0 });
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
                  const A = [s, ...u.path].join(".");
                  r.getState().addValidationError(A, u.message);
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
          const d = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = B(e, n);
          return z(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = B(e, n);
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
        if (Array.isArray(y)) {
          const d = () => m?.validIndices ? y.map((o, s) => ({
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
                  y[e],
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
              } = e, g = Q(null), [u, A] = X({
                startIndex: 0,
                endIndex: 10
              }), T = Q(c), [E, _] = X(0);
              et(() => r.getState().subscribeToShadowState(t, () => {
                _((b) => b + 1);
              }), [t]);
              const N = r().getNestedState(
                t,
                n
              ), $ = N.length, { totalHeight: W, positions: F } = ht(() => {
                const S = r.getState().getShadowMetadata(t, n) || [];
                let b = 0;
                const C = [];
                for (let V = 0; V < $; V++) {
                  C[V] = b;
                  const P = S[V]?.virtualizer?.itemHeight;
                  b += P || o;
                }
                return { totalHeight: b, positions: C };
              }, [
                $,
                t,
                n.join("."),
                o,
                E
              ]), M = ht(() => {
                const S = Math.max(0, u.startIndex), b = Math.min($, u.endIndex), C = Array.from(
                  { length: b - S },
                  (P, H) => S + H
                ), V = C.map((P) => N[P]);
                return a(V, n, {
                  ...m,
                  validIndices: C
                });
              }, [u.startIndex, u.endIndex, N, $]);
              ct(() => {
                const S = g.current;
                if (!S || !T.current || $ === 0)
                  return;
                A({
                  startIndex: Math.max(0, $ - 10 - s),
                  endIndex: $
                });
                let C = 0;
                const V = setInterval(() => {
                  C++;
                  const P = $ - 1;
                  ((r.getState().getShadowMetadata(t, n) || [])[P]?.virtualizer?.itemHeight || 0) > 0 ? (clearInterval(V), S.scrollTo({
                    top: S.scrollHeight,
                    behavior: "smooth"
                  })) : C > 20 && clearInterval(V);
                }, 100);
                return () => clearInterval(V);
              }, [$]), et(() => {
                const S = g.current;
                if (!S) return;
                const b = () => {
                  const { scrollTop: V, clientHeight: P } = S;
                  let H = 0, q = $ - 1;
                  for (; H <= q; ) {
                    const ft = Math.floor((H + q) / 2);
                    F[ft] < V ? H = ft + 1 : q = ft - 1;
                  }
                  const pt = Math.max(0, q - s);
                  let st = pt;
                  const Nt = V + P;
                  for (; st < $ && F[st] < Nt; )
                    st++;
                  A({
                    startIndex: pt,
                    endIndex: Math.min($, st + s)
                  });
                }, C = () => {
                  S.scrollHeight - S.scrollTop - S.clientHeight < 1 || (T.current = !1), b();
                };
                return S.addEventListener("scroll", C, {
                  passive: !0
                }), b(), () => S.removeEventListener("scroll", C);
              }, [$, F]);
              const x = wt(
                (S = "smooth") => {
                  g.current && (T.current = !0, g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: S
                  }));
                },
                []
              ), O = wt(
                (S, b = "smooth") => {
                  g.current && F[S] !== void 0 && (T.current = !1, g.current.scrollTo({
                    top: F[S],
                    behavior: b
                  }));
                },
                [F]
              ), D = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${W}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${F[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: M,
                virtualizerProps: D,
                scrollToBottom: x,
                scrollToIndex: O
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, A) => e(u.item, A.item)
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
                ({ item: u }, A) => e(u, A)
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
                const u = o[c], A = [...n, c.toString()], T = a(u, A, m);
                return e(u, T, {
                  register: () => {
                    const [, _] = X({}), N = `${h}-${n.join(".")}-${c}`;
                    ct(() => {
                      const $ = `${t}////${N}`, W = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return W.components.set($, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([A.join(".")])
                      }), r.getState().stateComponents.set(t, W), () => {
                        const F = r.getState().stateComponents.get(t);
                        F && F.components.delete($);
                      };
                    }, [t, N]);
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
            return (e) => y.map((s, c) => {
              let g;
              m?.validIndices && m.validIndices[c] !== void 0 ? g = m.validIndices[c] : g = c;
              const u = [...n, g.toString()], A = a(s, u, m);
              return e(
                s,
                A,
                c,
                y,
                a(y, n, m)
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
                const u = o[c], A = [...n, c.toString()], T = a(u, A, m), E = `${h}-${n.join(".")}-${c}`;
                return ot(Yt, {
                  key: c,
                  stateKey: t,
                  itemComponentId: E,
                  itemPath: A,
                  children: e(
                    u,
                    T,
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
              const o = y;
              I.clear(), k++;
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
              const o = y[e];
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
              if (!c.some((T) => {
                if (o) {
                  const _ = o.every(
                    (N) => z(T[N], g[N])
                  );
                  return _ && (u = T), _;
                }
                const E = z(T, g);
                return E && (u = T), E;
              }))
                w(n), St(i, g, n, t);
              else if (s && u) {
                const T = s(u), E = c.map(
                  (_) => z(_, u) ? T : _
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
              for (let o = 0; o < y.length; o++)
                y[o] === e && it(i, n, t, o);
            };
          if (l === "toggleByValue")
            return (e) => {
              const o = y.findIndex((s) => s === e);
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
            if (m?.validIndices && Array.isArray(y)) {
              const d = r.getState().getNestedState(t, n);
              return m.validIndices.map((e) => d[e]);
            }
            return r.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => bt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => bt({
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
              const e = r.getState().cogsStateStore[t], s = Ut(e, d).newDocument;
              xt(
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
                  A,
                  T
                ] of c.components.entries()) {
                  let E = !1;
                  const _ = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (T.paths.has("") && (E = !0), !E))
                      for (const N of u) {
                        if (T.paths.has(N)) {
                          E = !0;
                          break;
                        }
                        let $ = N.lastIndexOf(".");
                        for (; $ !== -1; ) {
                          const W = N.substring(0, $);
                          if (T.paths.has(W)) {
                            E = !0;
                            break;
                          }
                          const F = N.substring(
                            $ + 1
                          );
                          if (!isNaN(Number(F))) {
                            const M = W.lastIndexOf(".");
                            if (M !== -1) {
                              const x = W.substring(
                                0,
                                M
                              );
                              if (T.paths.has(x)) {
                                E = !0;
                                break;
                              }
                            }
                          }
                          $ = W.lastIndexOf(".");
                        }
                        if (E) break;
                      }
                    if (!E && _.includes("deps") && T.depsFunction) {
                      const N = T.depsFunction(s);
                      let $ = !1;
                      typeof N == "boolean" ? N && ($ = !0) : z(T.deps, N) || (T.deps = N, $ = !0), $ && (E = !0);
                    }
                    E && T.forceUpdate();
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
                  const A = u.path, T = u.message, E = [d.key, ...A].join(".");
                  e(E, T);
                }), gt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Tt.getState().getFormRefsByStateKey(t);
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
            Ot,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const j = [...n, l], nt = r.getState().getNestedState(t, j);
        return a(nt, j, m);
      }
    }, G = new Proxy(R, U);
    return I.set(L, {
      proxy: G,
      stateVersion: k
    }), G;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function bt(t) {
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
    (I, k, w, p, a) => t._mapFn(I, k, w, p, a)
  ) : null;
}
function Jt({
  proxy: t
}) {
  const i = Q(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const I = f.parentElement, w = Array.from(I.childNodes).indexOf(f);
    let p = I.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", p));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: w,
      effect: t._effect
    };
    r.getState().addSignalElement(h, y);
    const n = r.getState().getNestedState(t._stateKey, t._path);
    let m;
    if (t._effect)
      try {
        m = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), m = n;
      }
    else
      m = n;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const L = document.createTextNode(String(m));
    f.replaceWith(L);
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
  const [, I] = X({}), [k, w] = Ft(), p = Q(null);
  return et(() => {
    w.height > 0 && w.height !== p.current && (p.current = w.height, r.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, h]), ct(() => {
    const a = `${t}////${i}`, y = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return y.components.set(a, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([h.join(".")])
    }), r.getState().stateComponents.set(t, y), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, i, h.join(".")]), /* @__PURE__ */ mt("div", { ref: k, children: f });
}
export {
  bt as $cogsSignal,
  de as $cogsSignalStore,
  ie as addStateOptions,
  ce as createCogsState,
  le as notifyComponent,
  Bt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
