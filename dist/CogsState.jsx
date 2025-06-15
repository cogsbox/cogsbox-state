"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as rt, useRef as Y, useEffect as st, useLayoutEffect as dt, useMemo as vt, createElement as it, useSyncExternalStore as bt, startTransition as xt, useCallback as mt } from "react";
import { transformStateFunc as Pt, isDeepEqual as H, isFunction as Z, getNestedValue as z, getDifferences as It, debounce as _t } from "./utility.js";
import { pushFunc as ht, updateFn as at, cutFunc as lt, ValidationWrapper as Mt, FormControlComponent as Ot } from "./Functions.jsx";
import jt from "superjson";
import { v4 as pt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Et } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import { applyPatch as Rt } from "fast-json-patch";
import Ut from "react-use-measure";
function Tt(t, i) {
  const h = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, v = h(t) || {};
  f(t, {
    ...v,
    ...i
  });
}
function At({
  stateKey: t,
  options: i,
  initialOptionsPart: h
}) {
  const f = nt(t) || {}, v = h[t] || {}, k = o.getState().setInitialStateOptions, w = { ...v, ...f };
  let I = !1;
  if (i)
    for (const a in i)
      w.hasOwnProperty(a) ? (a == "localStorage" && i[a] && w[a].key !== i[a]?.key && (I = !0, w[a] = i[a]), a == "initialState" && i[a] && w[a] !== i[a] && // Different references
      !H(w[a], i[a]) && (I = !0, w[a] = i[a])) : (I = !0, w[a] = i[a]);
  I && k(t, w);
}
function se(t, { formElements: i, validation: h }) {
  return { initialState: t, formElements: i, validation: h };
}
const ie = (t, i) => {
  let h = t;
  const [f, v] = Pt(h);
  (Object.keys(v).length > 0 || i && Object.keys(i).length > 0) && Object.keys(v).forEach((I) => {
    v[I] = v[I] || {}, v[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...v[I].formElements || {}
      // State-specific overrides
    }, nt(I) || o.getState().setInitialStateOptions(I, v[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const k = (I, a) => {
    const [y] = rt(a?.componentId ?? pt());
    At({
      stateKey: I,
      options: a,
      initialOptionsPart: v
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [W, R] = zt(
      S,
      {
        stateKey: I,
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
  function w(I, a) {
    At({ stateKey: I, options: a, initialOptionsPart: v }), a.localStorage && Lt(I, a), St(I);
  }
  return { useCogsState: k, setCogsOptions: w };
}, {
  setUpdaterState: ut,
  setState: K,
  getInitialOptions: nt,
  getKeyState: Ct,
  getValidationErrors: Ft,
  setStateLog: Dt,
  updateInitialStateGlobal: wt,
  addValidationError: Wt,
  removeValidationError: J,
  setServerSyncActions: Gt
} = o.getState(), $t = (t, i, h, f, v) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    f
  );
  const k = Z(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (k && f) {
    const w = `${f}-${i}-${k}`;
    let I;
    try {
      I = ft(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? I
    }, y = jt.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(y.json)
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
}, Lt = (t, i) => {
  const h = o.getState().cogsStateStore[t], { sessionId: f } = Nt(), v = Z(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (v && f) {
    const k = ft(
      `${f}-${t}-${v}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return K(t, k.state), St(t), !0;
  }
  return !1;
}, Vt = (t, i, h, f, v, k) => {
  const w = {
    initialState: i,
    updaterState: gt(
      t,
      f,
      v,
      k
    ),
    state: h
  };
  wt(t, w.initialState), ut(t, w.updaterState), K(t, w.state);
}, St = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, ce = (t, i) => {
  const h = o.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${i}`, v = h.components.get(f);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Ht = (t, i, h, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: z(i, f),
        newValue: z(h, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: z(h, f)
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
function zt(t, {
  stateKey: i,
  serverSync: h,
  localStorage: f,
  formElements: v,
  reactiveDeps: k,
  reactiveType: w,
  componentId: I,
  initialState: a,
  syncUpdate: y,
  dependencies: n,
  serverState: S
} = {}) {
  const [W, R] = rt({}), { sessionId: U } = Nt();
  let G = !i;
  const [m] = rt(i ?? pt()), l = o.getState().stateLog[m], ct = Y(/* @__PURE__ */ new Set()), X = Y(I ?? pt()), O = Y(
    null
  );
  O.current = nt(m) ?? null, st(() => {
    if (y && y.stateKey === m && y.path?.[0]) {
      K(m, (r) => ({
        ...r,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), st(() => {
    if (a) {
      Tt(m, {
        initialState: a
      });
      const e = O.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = o.getState().initialStateGlobal[m];
      if (!(c && !H(c, a) || !c) && !s)
        return;
      let u = null;
      const T = Z(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && U && (u = ft(`${U}-${m}-${T}`));
      let E = a, $ = !1;
      const P = s ? Date.now() : 0, x = u?.lastUpdated || 0, N = u?.lastSyncedWithServer || 0;
      s && P > x ? (E = e.serverState.data, $ = !0) : u && x > N && (E = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(E)), o.getState().initializeShadowState(m, a), Vt(
        m,
        a,
        E,
        ot,
        X.current,
        U
      ), $ && T && U && $t(E, m, e, U, Date.now()), St(m), (Array.isArray(w) ? w : [w || "component"]).includes("none") || R({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), dt(() => {
    G && Tt(m, {
      serverSync: h,
      formElements: v,
      initialState: a,
      localStorage: f,
      middleware: O.current?.middleware
    });
    const e = `${m}////${X.current}`, r = o.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, r), R({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(m));
    };
  }, []);
  const ot = (e, r, s, c) => {
    if (Array.isArray(r)) {
      const u = `${m}-${r.join(".")}`;
      ct.current.add(u);
    }
    const g = o.getState();
    K(m, (u) => {
      const T = Z(e) ? e(u) : e, E = `${m}-${r.join(".")}`;
      if (E) {
        let b = !1, C = g.signalDomElements.get(E);
        if ((!C || C.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const j = r.slice(0, -1), D = z(T, j);
          if (Array.isArray(D)) {
            b = !0;
            const A = `${m}-${j.join(".")}`;
            C = g.signalDomElements.get(A);
          }
        }
        if (C) {
          const j = b ? z(T, r.slice(0, -1)) : z(T, r);
          C.forEach(({ parentId: D, position: A, effect: p }) => {
            const V = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (V) {
              const _ = Array.from(V.childNodes);
              if (_[A]) {
                const M = p ? new Function("state", `return (${p})(state)`)(j) : j;
                _[A].textContent = String(M);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (c || O.current?.validation?.key) && r && J(
        (c || O.current?.validation?.key) + "." + r.join(".")
      );
      const $ = r.slice(0, r.length - 1);
      s.updateType === "cut" && O.current?.validation?.key && J(
        O.current?.validation?.key + "." + $.join(".")
      ), s.updateType === "insert" && O.current?.validation?.key && Ft(
        O.current?.validation?.key + "." + $.join(".")
      ).filter(([C, j]) => {
        let D = C?.split(".").length;
        if (C == $.join(".") && D == $.length - 1) {
          let A = C + "." + $;
          J(C), Wt(A, j);
        }
      });
      const P = g.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const b = It(u, T), C = new Set(b), j = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          A
        ] of P.components.entries()) {
          let p = !1;
          const V = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !V.includes("none")) {
            if (V.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (V.includes("component") && ((A.paths.has(j) || A.paths.has("")) && (p = !0), !p))
              for (const _ of C) {
                let M = _;
                for (; ; ) {
                  if (A.paths.has(M)) {
                    p = !0;
                    break;
                  }
                  const B = M.lastIndexOf(".");
                  if (B !== -1) {
                    const tt = M.substring(
                      0,
                      B
                    );
                    if (!isNaN(
                      Number(M.substring(B + 1))
                    ) && A.paths.has(tt)) {
                      p = !0;
                      break;
                    }
                    M = tt;
                  } else
                    M = "";
                  if (M === "")
                    break;
                }
                if (p) break;
              }
            if (!p && V.includes("deps") && A.depsFunction) {
              const _ = A.depsFunction(T);
              let M = !1;
              typeof _ == "boolean" ? _ && (M = !0) : H(A.deps, _) || (A.deps = _, M = !0), M && (p = !0);
            }
            p && A.forceUpdate();
          }
        }
      }
      const x = Date.now();
      r = r.map((b, C) => {
        const j = r.slice(0, -1), D = z(T, j);
        return C === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : b;
      });
      const { oldValue: N, newValue: F } = Ht(
        s.updateType,
        u,
        T,
        r
      ), L = {
        timeStamp: x,
        stateKey: m,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: N,
        newValue: F
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(m, r, T);
          break;
        case "insert":
          const b = r.slice(0, -1);
          g.insertShadowArrayElement(m, b, F);
          break;
        case "cut":
          const C = r.slice(0, -1), j = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(m, C, j);
          break;
      }
      if (Dt(m, (b) => {
        const j = [...b ?? [], L].reduce((D, A) => {
          const p = `${A.stateKey}:${JSON.stringify(A.path)}`, V = D.get(p);
          return V ? (V.timeStamp = Math.max(V.timeStamp, A.timeStamp), V.newValue = A.newValue, V.oldValue = V.oldValue ?? A.oldValue, V.updateType = A.updateType) : D.set(p, { ...A }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(j.values());
      }), $t(
        T,
        m,
        O.current,
        U
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: L
      }), O.current?.serverSync) {
        const b = g.serverState[m], C = O.current?.serverSync;
        Gt(m, {
          syncKey: typeof C.syncKey == "string" ? C.syncKey : C.syncKey({ state: T }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (C.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  o.getState().updaterState[m] || (ut(
    m,
    gt(
      m,
      ot,
      X.current,
      U
    )
  ), o.getState().cogsStateStore[m] || K(m, t), o.getState().initialStateGlobal[m] || wt(m, t));
  const d = vt(() => gt(
    m,
    ot,
    X.current,
    U
  ), [m, U]);
  return [Ct(m), d];
}
function gt(t, i, h, f) {
  const v = /* @__PURE__ */ new Map();
  let k = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [S] of v)
      (S === n || S.startsWith(n + ".")) && v.delete(S);
    k++;
  }, I = {
    removeValidation: (y) => {
      y?.validationKey && J(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), y?.validationKey && J(y.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), v.clear(), k++;
      const W = a(S, []), R = nt(t), U = Z(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, G = `${f}-${t}-${U}`;
      G && localStorage.removeItem(G), ut(t, W), K(t, S);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      v.clear(), k++;
      const n = gt(
        t,
        i,
        h,
        f
      ), S = o.getState().initialStateGlobal[t], W = nt(t), R = Z(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, U = `${f}-${t}-${R}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), xt(() => {
        wt(t, y), o.getState().initializeShadowState(t, y), ut(t, n), K(t, y);
        const G = o.getState().stateComponents.get(t);
        G && G.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = o.getState().serverState[t];
      return !!(y && H(y, Ct(t)));
    }
  };
  function a(y, n = [], S) {
    const W = n.map(String).join(".");
    v.get(W);
    const R = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((m) => {
      R[m] = I[m];
    });
    const U = {
      apply(m, l, ct) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
        const ct = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ct.has(l)) {
          const d = `${t}////${h}`, e = o.getState().stateComponents.get(t);
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
          return () => It(
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
                  const T = [s, ...u.path].join(".");
                  o.getState().addValidationError(T, u.message);
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
            const d = o.getState().initialStateGlobal[t], e = nt(t), r = Z(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(y)) {
          const d = () => S?.validIndices ? y.map((r, s) => ({
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
                  y[e],
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
                // Default/estimated height
                overscan: s = 5,
                stickToBottom: c = !1
              } = e, g = Y(null), [u, T] = rt({
                startIndex: 0,
                endIndex: 10
              }), E = Y(c), $ = Y(0), P = Y(!1), x = o().getNestedState(
                t,
                n
              ), N = x.length, F = mt(
                (p) => o.getState().getShadowMetadata(t, [...n, p.toString()])?.virtualizer?.itemHeight || r,
                [r, t, n]
              ), { totalHeight: L, positions: b } = vt(() => {
                let p = 0;
                const V = [];
                for (let _ = 0; _ < N; _++)
                  V[_] = p, p += F(_);
                return console.log("totalHeight", p), { totalHeight: p, positions: V };
              }, [N, F]), C = vt(() => {
                const p = Math.max(0, u.startIndex), V = Math.min(N, u.endIndex), _ = Array.from(
                  { length: V - p },
                  (B, tt) => p + tt
                ), M = _.map((B) => x[B]);
                return a(M, n, {
                  ...S,
                  validIndices: _
                });
              }, [u.startIndex, u.endIndex, x, N]);
              dt(() => {
                const p = g.current;
                p && P.current && (P.current = !1, E.current && (p.scrollTop = p.scrollHeight));
              }, [L]), st(() => {
                const p = g.current;
                if (!p) return;
                let V = N;
                const _ = () => {
                  if (!p) return;
                  const { scrollTop: M, clientHeight: B, scrollHeight: tt } = p;
                  E.current = tt - M - B < 10, $.current = M;
                  let et = 0;
                  for (let q = 0; q < b.length; q++)
                    if (b[q] >= M) {
                      et = q;
                      break;
                    }
                  let Q = et;
                  for (; Q < N && b[Q] < M + B; )
                    Q++;
                  et = Math.max(0, et - s), Q = Math.min(N, Q + s), T((q) => q.startIndex !== et || q.endIndex !== Q ? { startIndex: et, endIndex: Q } : q);
                };
                return N > V && (P.current = !0), V = N, p.addEventListener("scroll", _, {
                  passive: !0
                }), _(), () => p.removeEventListener("scroll", _);
              }, [N, s, b]);
              const j = mt(
                (p = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: p
                  });
                },
                []
              ), D = mt(
                (p, V = "smooth") => {
                  g.current && b[p] !== void 0 && g.current.scrollTo({
                    top: b[p],
                    behavior: V
                  });
                },
                [b]
              ), A = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: { height: `${L}px`, position: "relative" }
                },
                list: {
                  style: {
                    transform: `translateY(${b[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: C,
                virtualizerProps: A,
                scrollToBottom: j,
                scrollToIndex: D
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
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, g) => g)).map((c, g) => {
                const u = r[c], T = [...n, c.toString()], E = a(u, T, S);
                return e(u, E, {
                  register: () => {
                    const [, P] = rt({}), x = `${h}-${n.join(".")}-${c}`;
                    dt(() => {
                      const N = `${t}////${x}`, F = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(N, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), o.getState().stateComponents.set(t, F), () => {
                        const L = o.getState().stateComponents.get(t);
                        L && L.components.delete(N);
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
            return (e) => y.map((s, c) => {
              let g;
              S?.validIndices && S.validIndices[c] !== void 0 ? g = S.validIndices[c] : g = c;
              const u = [...n, g.toString()], T = a(s, u, S);
              return e(
                s,
                T,
                c,
                y,
                a(y, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => it(Bt, {
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
                const u = r[c], T = [...n, c.toString()], E = a(u, T, S), $ = `${h}-${n.join(".")}-${c}`;
                return it(Jt, {
                  key: c,
                  stateKey: t,
                  itemComponentId: $,
                  itemPath: T,
                  children: e(
                    u,
                    E,
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
              const r = y;
              v.clear(), k++;
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
              const r = y[e];
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
            return (e) => (w(n), ht(i, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const c = o.getState().getNestedState(t, n), g = Z(e) ? e(c) : e;
              let u = null;
              if (!c.some((E) => {
                if (r) {
                  const P = r.every(
                    (x) => H(E[x], g[x])
                  );
                  return P && (u = E), P;
                }
                const $ = H(E, g);
                return $ && (u = E), $;
              }))
                w(n), ht(i, g, n, t);
              else if (s && u) {
                const E = s(u), $ = c.map(
                  (P) => H(P, u) ? E : P
                );
                w(n), at(i, $, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return w(n), lt(i, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < y.length; r++)
                y[r] === e && lt(i, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = y.findIndex((s) => s === e);
              r > -1 ? lt(i, n, t, r) : ht(i, e, n, t);
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
            return () => lt(
              i,
              d,
              t,
              Number(X)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(y)) {
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
          return (d) => ft(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const c = o.getState().getNestedState(t, [...e]);
            at(i, c, e), w(e);
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
            at(i, c, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Rt(e, d).newDocument;
              Vt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                i,
                h,
                f
              );
              const c = o.getState().stateComponents.get(t);
              if (c) {
                const g = It(e, s), u = new Set(g);
                for (const [
                  T,
                  E
                ] of c.components.entries()) {
                  let $ = !1;
                  const P = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (E.paths.has("") && ($ = !0), !$))
                      for (const x of u) {
                        if (E.paths.has(x)) {
                          $ = !0;
                          break;
                        }
                        let N = x.lastIndexOf(".");
                        for (; N !== -1; ) {
                          const F = x.substring(0, N);
                          if (E.paths.has(F)) {
                            $ = !0;
                            break;
                          }
                          const L = x.substring(
                            N + 1
                          );
                          if (!isNaN(Number(L))) {
                            const b = F.lastIndexOf(".");
                            if (b !== -1) {
                              const C = F.substring(
                                0,
                                b
                              );
                              if (E.paths.has(C)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          N = F.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && P.includes("deps") && E.depsFunction) {
                      const x = E.depsFunction(s);
                      let N = !1;
                      typeof x == "boolean" ? x && (N = !0) : H(E.deps, x) || (E.deps = x, N = !0), N && ($ = !0);
                    }
                    $ && E.forceUpdate();
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
                  const T = u.path, E = u.message, $ = [d.key, ...T].join(".");
                  e($, E);
                }), St(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Et.getState().getFormRefsByStateKey(t);
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
          return () => Et.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ yt(
            Mt,
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
              _t(() => {
                at(i, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              at(i, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ yt(
            Ot,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const O = [...n, l], ot = o.getState().getNestedState(t, O);
        return a(ot, O, S);
      }
    }, G = new Proxy(R, U);
    return v.set(W, {
      proxy: G,
      stateVersion: k
    }), G;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function kt(t) {
  return it(qt, { proxy: t });
}
function Bt({
  proxy: t,
  rebuildStateShape: i
}) {
  const h = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? i(
    h,
    t._path
  ).stateMapNoRender(
    (v, k, w, I, a) => t._mapFn(v, k, w, I, a)
  ) : null;
}
function qt({
  proxy: t
}) {
  const i = Y(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return st(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const v = f.parentElement, w = Array.from(v.childNodes).indexOf(f);
    let I = v.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", I));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(h, y);
    const n = o.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    f.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), it("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function le(t) {
  const i = bt(
    (h) => {
      const f = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return it("text", {}, String(i));
}
function Jt({
  stateKey: t,
  itemComponentId: i,
  itemPath: h,
  children: f
}) {
  const [, v] = rt({}), [k, w] = Ut();
  return st(() => {
    w.height > 0 && o.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: w.height
      }
    });
  }, [w.height]), dt(() => {
    const I = `${t}////${i}`, a = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(I, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set([h.join(".")])
    }), o.getState().stateComponents.set(t, a), () => {
      const y = o.getState().stateComponents.get(t);
      y && y.components.delete(I);
    };
  }, [t, i, h.join(".")]), /* @__PURE__ */ yt("div", { ref: k, children: f });
}
export {
  kt as $cogsSignal,
  le as $cogsSignalStore,
  se as addStateOptions,
  ie as createCogsState,
  ce as notifyComponent,
  zt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
