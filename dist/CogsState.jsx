"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as st, useRef as J, useEffect as nt, useLayoutEffect as xt, useMemo as It, createElement as lt, useSyncExternalStore as Mt, startTransition as Ot, useCallback as ft } from "react";
import { transformStateFunc as jt, isDeepEqual as q, isFunction as K, getNestedValue as Y, getDifferences as wt, debounce as Ut } from "./utility.js";
import { pushFunc as vt, updateFn as ct, cutFunc as gt, ValidationWrapper as Ft, FormControlComponent as Dt } from "./Functions.jsx";
import Lt from "superjson";
import { v4 as pt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as kt } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import { applyPatch as Gt } from "fast-json-patch";
import Wt from "react-use-measure";
function At(t, i) {
  const S = o.getState().getInitialOptions, u = o.getState().setInitialStateOptions, h = S(t) || {};
  u(t, {
    ...h,
    ...i
  });
}
function bt({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const u = at(t) || {}, h = S[t] || {}, V = o.getState().setInitialStateOptions, I = { ...h, ...u };
  let y = !1;
  if (i)
    for (const s in i)
      I.hasOwnProperty(s) ? (s == "localStorage" && i[s] && I[s].key !== i[s]?.key && (y = !0, I[s] = i[s]), s == "initialState" && i[s] && I[s] !== i[s] && // Different references
      !q(I[s], i[s]) && (y = !0, I[s] = i[s])) : (y = !0, I[s] = i[s]);
  y && V(t, I);
}
function de(t, { formElements: i, validation: S }) {
  return { initialState: t, formElements: i, validation: S };
}
const ue = (t, i) => {
  let S = t;
  const [u, h] = jt(S);
  (Object.keys(h).length > 0 || i && Object.keys(i).length > 0) && Object.keys(h).forEach((y) => {
    h[y] = h[y] || {}, h[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...h[y].formElements || {}
      // State-specific overrides
    }, at(y) || o.getState().setInitialStateOptions(y, h[y]);
  }), o.getState().setInitialStates(u), o.getState().setCreatedState(u);
  const V = (y, s) => {
    const [m] = st(s?.componentId ?? pt());
    bt({
      stateKey: y,
      options: s,
      initialOptionsPart: h
    });
    const n = o.getState().cogsStateStore[y] || u[y], g = s?.modifyState ? s.modifyState(n) : n, [D, j] = Yt(
      g,
      {
        stateKey: y,
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
    return j;
  };
  function I(y, s) {
    bt({ stateKey: y, options: s, initialOptionsPart: h }), s.localStorage && qt(y, s), dt(y);
  }
  return { useCogsState: V, setCogsOptions: I };
}, {
  setUpdaterState: St,
  setState: rt,
  getInitialOptions: at,
  getKeyState: Pt,
  getValidationErrors: Ht,
  setStateLog: zt,
  updateInitialStateGlobal: Et,
  addValidationError: Ct,
  removeValidationError: X,
  setServerSyncActions: Bt
} = o.getState(), Vt = (t, i, S, u, h) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    u
  );
  const V = K(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (V && u) {
    const I = `${u}-${i}-${V}`;
    let y;
    try {
      y = ht(I)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: h ?? y
    }, m = Lt.serialize(s);
    window.localStorage.setItem(
      I,
      JSON.stringify(m.json)
    );
  }
}, ht = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, qt = (t, i) => {
  const S = o.getState().cogsStateStore[t], { sessionId: u } = Nt(), h = K(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (h && u) {
    const V = ht(
      `${u}-${t}-${h}`
    );
    if (V && V.lastUpdated > (V.lastSyncedWithServer || 0))
      return rt(t, V.state), dt(t), !0;
  }
  return !1;
}, _t = (t, i, S, u, h, V) => {
  const I = {
    initialState: i,
    updaterState: mt(
      t,
      u,
      h,
      V
    ),
    state: S
  };
  Et(t, I.initialState), St(t, I.updaterState), rt(t, I.state);
}, dt = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((u) => u());
  });
}, ge = (t, i) => {
  const S = o.getState().stateComponents.get(t);
  if (S) {
    const u = `${t}////${i}`, h = S.components.get(u);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
}, Jt = (t, i, S, u) => {
  switch (t) {
    case "update":
      return {
        oldValue: Y(i, u),
        newValue: Y(S, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Y(S, u)
      };
    case "cut":
      return {
        oldValue: Y(i, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Yt(t, {
  stateKey: i,
  serverSync: S,
  localStorage: u,
  formElements: h,
  reactiveDeps: V,
  reactiveType: I,
  componentId: y,
  initialState: s,
  syncUpdate: m,
  dependencies: n,
  serverState: g
} = {}) {
  const [D, j] = st({}), { sessionId: U } = Nt();
  let W = !i;
  const [f] = st(i ?? pt()), l = o.getState().stateLog[f], ut = J(/* @__PURE__ */ new Set()), tt = J(y ?? pt()), O = J(
    null
  );
  O.current = at(f) ?? null, nt(() => {
    if (m && m.stateKey === f && m.path?.[0]) {
      rt(f, (r) => ({
        ...r,
        [m.path[0]]: m.newValue
      }));
      const e = `${m.stateKey}:${m.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), nt(() => {
    if (s) {
      At(f, {
        initialState: s
      });
      const e = O.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = o.getState().initialStateGlobal[f];
      if (!(c && !q(c, s) || !c) && !a)
        return;
      let v = null;
      const k = K(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      k && U && (v = ht(`${U}-${f}-${k}`));
      let E = s, b = !1;
      const _ = a ? Date.now() : 0, C = v?.lastUpdated || 0, R = v?.lastSyncedWithServer || 0;
      a && _ > C ? (E = e.serverState.data, b = !0) : v && C > R && (E = v.state, e?.localStorage?.onChange && e?.localStorage?.onChange(E)), o.getState().initializeShadowState(f, s), _t(
        f,
        s,
        E,
        it,
        tt.current,
        U
      ), b && k && U && Vt(E, f, e, U, Date.now()), dt(f), (Array.isArray(I) ? I : [I || "component"]).includes("none") || j({});
    }
  }, [
    s,
    g?.status,
    g?.data,
    ...n || []
  ]), xt(() => {
    W && At(f, {
      serverSync: S,
      formElements: h,
      initialState: s,
      localStorage: u,
      middleware: O.current?.middleware
    });
    const e = `${f}////${tt.current}`, r = o.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => j({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: V || void 0,
      reactiveType: I ?? ["component", "deps"]
    }), o.getState().stateComponents.set(f, r), j({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(f));
    };
  }, []);
  const it = (e, r, a, c) => {
    if (Array.isArray(r)) {
      const v = `${f}-${r.join(".")}`;
      ut.current.add(v);
    }
    const w = o.getState();
    rt(f, (v) => {
      const k = K(e) ? e(v) : e, E = `${f}-${r.join(".")}`;
      if (E) {
        let T = !1, $ = w.signalDomElements.get(E);
        if ((!$ || $.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const x = r.slice(0, -1), G = Y(k, x);
          if (Array.isArray(G)) {
            T = !0;
            const A = `${f}-${x.join(".")}`;
            $ = w.signalDomElements.get(A);
          }
        }
        if ($) {
          const x = T ? Y(k, r.slice(0, -1)) : Y(k, r);
          $.forEach(({ parentId: G, position: A, effect: F }) => {
            const M = document.querySelector(
              `[data-parent-id="${G}"]`
            );
            if (M) {
              const z = Array.from(M.childNodes);
              if (z[A]) {
                const p = F ? new Function("state", `return (${F})(state)`)(x) : x;
                z[A].textContent = String(p);
              }
            }
          });
        }
      }
      console.log("shadowState", w.shadowStateStore), a.updateType === "update" && (c || O.current?.validation?.key) && r && X(
        (c || O.current?.validation?.key) + "." + r.join(".")
      );
      const b = r.slice(0, r.length - 1);
      a.updateType === "cut" && O.current?.validation?.key && X(
        O.current?.validation?.key + "." + b.join(".")
      ), a.updateType === "insert" && O.current?.validation?.key && Ht(
        O.current?.validation?.key + "." + b.join(".")
      ).filter(([$, x]) => {
        let G = $?.split(".").length;
        if ($ == b.join(".") && G == b.length - 1) {
          let A = $ + "." + b;
          X($), Ct(A, x);
        }
      });
      const _ = w.stateComponents.get(f);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const T = wt(v, k), $ = new Set(T), x = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          G,
          A
        ] of _.components.entries()) {
          let F = !1;
          const M = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !M.includes("none")) {
            if (M.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (M.includes("component") && ((A.paths.has(x) || A.paths.has("")) && (F = !0), !F))
              for (const z of $) {
                let p = z;
                for (; ; ) {
                  if (A.paths.has(p)) {
                    F = !0;
                    break;
                  }
                  const N = p.lastIndexOf(".");
                  if (N !== -1) {
                    const P = p.substring(
                      0,
                      N
                    );
                    if (!isNaN(
                      Number(p.substring(N + 1))
                    ) && A.paths.has(P)) {
                      F = !0;
                      break;
                    }
                    p = P;
                  } else
                    p = "";
                  if (p === "")
                    break;
                }
                if (F) break;
              }
            if (!F && M.includes("deps") && A.depsFunction) {
              const z = A.depsFunction(k);
              let p = !1;
              typeof z == "boolean" ? z && (p = !0) : q(A.deps, z) || (A.deps = z, p = !0), p && (F = !0);
            }
            F && A.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((T, $) => {
        const x = r.slice(0, -1), G = Y(k, x);
        return $ === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (G.length - 1).toString() : T;
      });
      const { oldValue: R, newValue: H } = Jt(
        a.updateType,
        v,
        k,
        r
      ), Q = {
        timeStamp: C,
        stateKey: f,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: R,
        newValue: H
      };
      switch (a.updateType) {
        case "update":
          w.updateShadowAtPath(f, r, k);
          break;
        case "insert":
          const T = r.slice(0, -1);
          w.insertShadowArrayElement(f, T, H);
          break;
        case "cut":
          const $ = r.slice(0, -1), x = parseInt(r[r.length - 1]);
          w.removeShadowArrayElement(f, $, x);
          break;
      }
      if (zt(f, (T) => {
        const x = [...T ?? [], Q].reduce((G, A) => {
          const F = `${A.stateKey}:${JSON.stringify(A.path)}`, M = G.get(F);
          return M ? (M.timeStamp = Math.max(M.timeStamp, A.timeStamp), M.newValue = A.newValue, M.oldValue = M.oldValue ?? A.oldValue, M.updateType = A.updateType) : G.set(F, { ...A }), G;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), Vt(
        k,
        f,
        O.current,
        U
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: Q
      }), O.current?.serverSync) {
        const T = w.serverState[f], $ = O.current?.serverSync;
        Bt(f, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: k }),
          rollBackState: T,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return k;
    });
  };
  o.getState().updaterState[f] || (St(
    f,
    mt(
      f,
      it,
      tt.current,
      U
    )
  ), o.getState().cogsStateStore[f] || rt(f, t), o.getState().initialStateGlobal[f] || Et(f, t));
  const d = It(() => mt(
    f,
    it,
    tt.current,
    U
  ), [f, U]);
  return [Pt(f), d];
}
function mt(t, i, S, u) {
  const h = /* @__PURE__ */ new Map();
  let V = 0;
  const I = (m) => {
    const n = m.join(".");
    for (const [g] of h)
      (g === n || g.startsWith(n + ".")) && h.delete(g);
    V++;
  }, y = {
    removeValidation: (m) => {
      m?.validationKey && X(m.validationKey);
    },
    revertToInitialState: (m) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && X(n?.key), m?.validationKey && X(m.validationKey);
      const g = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), h.clear(), V++;
      const D = s(g, []), j = at(t), U = K(j?.localStorage?.key) ? j?.localStorage?.key(g) : j?.localStorage?.key, W = `${u}-${t}-${U}`;
      W && localStorage.removeItem(W), St(t, D), rt(t, g);
      const f = o.getState().stateComponents.get(t);
      return f && f.components.forEach((l) => {
        l.forceUpdate();
      }), g;
    },
    updateInitialState: (m) => {
      h.clear(), V++;
      const n = mt(
        t,
        i,
        S,
        u
      ), g = o.getState().initialStateGlobal[t], D = at(t), j = K(D?.localStorage?.key) ? D?.localStorage?.key(g) : D?.localStorage?.key, U = `${u}-${t}-${j}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Ot(() => {
        Et(t, m), o.getState().initializeShadowState(t, m), St(t, n), rt(t, m);
        const W = o.getState().stateComponents.get(t);
        W && W.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (W) => n.get()[W]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const m = o.getState().serverState[t];
      return !!(m && q(m, Pt(t)));
    }
  };
  function s(m, n = [], g) {
    const D = n.map(String).join(".");
    h.get(D);
    const j = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(y).forEach((f) => {
      j[f] = y[f];
    });
    const U = {
      apply(f, l, ut) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(f, l) {
        g?.validIndices && !Array.isArray(m) && (g = { ...g, validIndices: void 0 });
        const ut = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ut.has(l)) {
          const d = `${t}////${S}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const a = n.join(".");
              let c = !0;
              for (const w of r.paths)
                if (a.startsWith(w) && (a === w || a[w.length] === ".")) {
                  c = !1;
                  break;
                }
              c && r.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => wt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const c = await e.action(r);
              if (c && !c.success && c.errors && a) {
                o.getState().removeValidationError(a), c.errors.forEach((v) => {
                  const k = [a, ...v.path].join(".");
                  o.getState().addValidationError(k, v.message);
                });
                const w = o.getState().stateComponents.get(t);
                w && w.components.forEach((v) => {
                  v.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = Y(e, n);
          return q(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = Y(e, n);
            return q(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = at(t), r = K(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${u}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(m)) {
          const d = () => g?.validIndices ? m.map((r, a) => ({
            item: r,
            originalIndex: g.validIndices[a]
          })) : o.getState().getNestedState(t, n).map((r, a) => ({
            item: r,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return s(
                  m[e],
                  [...n, e.toString()],
                  g
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
                overscan: a = 6,
                stickToBottom: c = !1,
                dependencies: w = []
              } = e, v = J(null), [k, E] = st({
                startIndex: 0,
                endIndex: 10
              }), [b, _] = st(0), C = J(!0), R = J(!1), H = J(0);
              nt(() => o.getState().subscribeToShadowState(t, () => {
                _((N) => N + 1);
              }), [t]);
              const Q = o().getNestedState(
                t,
                n
              ), T = Q.length, { totalHeight: $, positions: x } = It(() => {
                const p = o.getState().getShadowMetadata(t, n) || [];
                let N = 0;
                const P = [];
                for (let L = 0; L < T; L++) {
                  P[L] = N;
                  const B = p[L]?.virtualizer?.itemHeight;
                  N += B || r;
                }
                return { totalHeight: N, positions: P };
              }, [
                T,
                t,
                n.join("."),
                r,
                b
              ]), G = It(() => {
                const p = Math.max(0, k.startIndex), N = Math.min(T, k.endIndex), P = Array.from(
                  { length: N - p },
                  (B, ot) => p + ot
                ), L = P.map((B) => Q[B]);
                return s(L, n, {
                  ...g,
                  validIndices: P
                });
              }, [k.startIndex, k.endIndex, Q, T]), A = ft(() => {
                const p = o.getState().getShadowMetadata(t, n) || [], N = T - 1;
                if (N >= 0) {
                  const P = p[N];
                  if (P?.virtualizer?.domRef) {
                    const L = P.virtualizer.domRef;
                    if (L && L.scrollIntoView)
                      return L.scrollIntoView({
                        behavior: "auto",
                        block: "end",
                        inline: "nearest"
                      }), !0;
                  }
                }
                return !1;
              }, [t, n, T]);
              nt(() => {
                if (!c || T === 0) return;
                const p = T > H.current, N = H.current === 0 && T > 0;
                if ((p || N) && C.current && !R.current) {
                  const P = Math.ceil(
                    (v.current?.clientHeight || 0) / r
                  ), L = {
                    startIndex: Math.max(
                      0,
                      T - P - a
                    ),
                    endIndex: T
                  };
                  E(L);
                  const B = setTimeout(() => {
                    M(T - 1, "smooth");
                  }, 50);
                  return () => clearTimeout(B);
                }
                H.current = T;
              }, [T, r, a]), nt(() => {
                const p = v.current;
                if (!p) return;
                const N = () => {
                  const { scrollTop: P, scrollHeight: L, clientHeight: B } = p, ot = L - P - B;
                  C.current = ot < 5, ot > 100 && (R.current = !0), ot < 5 && (R.current = !1);
                  let et = 0;
                  for (let Z = 0; Z < x.length; Z++)
                    if (x[Z] > P - r * a) {
                      et = Math.max(0, Z - 1);
                      break;
                    }
                  let Tt = et;
                  const Rt = P + B;
                  for (let Z = et; Z < x.length && !(x[Z] > Rt + r * a); Z++)
                    Tt = Z;
                  E({
                    startIndex: Math.max(0, et),
                    endIndex: Math.min(T, Tt + 1 + a)
                  });
                };
                if (p.addEventListener("scroll", N, {
                  passive: !0
                }), c && T > 0 && !R.current) {
                  const { scrollTop: P } = p;
                  P === 0 && (p.scrollTop = p.scrollHeight, C.current = !0);
                }
                return N(), () => {
                  p.removeEventListener("scroll", N);
                };
              }, [x, T, r, a, c]);
              const F = ft(() => {
                C.current = !0, R.current = !1, !A() && v.current && (v.current.scrollTop = v.current.scrollHeight);
              }, [A]), M = ft(
                (p, N = "smooth") => {
                  const P = v.current;
                  if (!P) return;
                  if (p === T - 1) {
                    P.scrollTo({
                      top: P.scrollHeight,
                      behavior: N
                    });
                    return;
                  }
                  const et = (o.getState().getShadowMetadata(t, n) || [])[p]?.virtualizer?.domRef;
                  et ? et.scrollIntoView({
                    behavior: N,
                    block: "center"
                  }) : x[p] !== void 0 && P.scrollTo({
                    top: x[p],
                    behavior: N
                  });
                },
                [x, t, n, T]
                // Add totalCount to the dependencies
              ), z = {
                outer: {
                  ref: v,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${$}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${x[k.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: G,
                virtualizerProps: z,
                scrollToBottom: F,
                scrollToIndex: M
              };
            };
          if (l === "stateMapNoRender")
            return (e) => m.map((a, c) => {
              let w;
              g?.validIndices && g.validIndices[c] !== void 0 ? w = g.validIndices[c] : w = c;
              const v = [...n, w.toString()], k = s(a, v, g);
              return e(
                a,
                k,
                c,
                m,
                s(m, n, g)
              );
            });
          if (l === "$stateMap")
            return (e) => lt(Zt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (g?.validIndices || Array.from({ length: r.length }, (c, w) => w)).map((c, w) => {
                const v = r[c], k = [...n, c.toString()], E = s(v, k, g), b = `${S}-${n.join(".")}-${c}`;
                return lt(Qt, {
                  key: c,
                  stateKey: t,
                  itemComponentId: b,
                  itemPath: k,
                  children: e(
                    v,
                    E,
                    { localIndex: w, originalIndex: c },
                    r,
                    s(r, n, g)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const r = m;
              h.clear(), V++;
              const a = r.flatMap(
                (c) => c[e] ?? []
              );
              return s(
                a,
                [...n, "[*]", e],
                g
              );
            };
          if (l === "index")
            return (e) => {
              const r = m[e];
              return s(r, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, a = e[r], c = [...n, r.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (e) => (I(n), vt(i, e, n, t), s(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, a) => {
              const c = o.getState().getNestedState(t, n), w = K(e) ? e(c) : e;
              let v = null;
              if (!c.some((E) => {
                if (r) {
                  const _ = r.every(
                    (C) => q(E[C], w[C])
                  );
                  return _ && (v = E), _;
                }
                const b = q(E, w);
                return b && (v = E), b;
              }))
                I(n), vt(i, w, n, t);
              else if (a && v) {
                const E = a(v), b = c.map(
                  (_) => q(_, v) ? E : _
                );
                I(n), ct(i, b, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return I(n), gt(i, n, t, e), s(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < m.length; r++)
                m[r] === e && gt(i, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = m.findIndex((a) => a === e);
              r > -1 ? gt(i, n, t, r) : vt(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: w }, v) => e(w, v)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return s(a.item, c, g);
            };
          if (l === "findWith")
            return (e, r) => {
              const c = d().find(
                ({ item: v }) => v[e] === r
              );
              if (!c) return;
              const w = [...n, c.originalIndex.toString()];
              return s(c.item, w, g);
            };
        }
        const tt = n[n.length - 1];
        if (!isNaN(Number(tt))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => gt(
              i,
              d,
              t,
              Number(tt)
            );
        }
        if (l === "get")
          return () => {
            if (g?.validIndices && Array.isArray(m)) {
              const d = o.getState().getNestedState(t, n);
              return g.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => $t({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => $t({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ht(u + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, r) : o.getState().setSelectedIndex(t, a, void 0);
            const c = o.getState().getNestedState(t, [...e]);
            ct(i, c, e), I(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), r = d.join("."), a = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              a === e ? void 0 : e
            );
            const c = o.getState().getNestedState(t, [...d]);
            ct(i, c, d), I(d);
          };
        if (n.length == 0) {
          if (l === "addValidation")
            return (d) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              X(e.key), console.log("addValidationError", d), d.forEach((r) => {
                const a = [e.key, ...r.path].join(".");
                console.log("fullErrorPath", a), Ct(a, r.message);
              }), dt(t);
            };
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Gt(e, d).newDocument;
              _t(
                t,
                o.getState().initialStateGlobal[t],
                a,
                i,
                S,
                u
              );
              const c = o.getState().stateComponents.get(t);
              if (c) {
                const w = wt(e, a), v = new Set(w);
                for (const [
                  k,
                  E
                ] of c.components.entries()) {
                  let b = !1;
                  const _ = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (E.paths.has("") && (b = !0), !b))
                      for (const C of v) {
                        if (E.paths.has(C)) {
                          b = !0;
                          break;
                        }
                        let R = C.lastIndexOf(".");
                        for (; R !== -1; ) {
                          const H = C.substring(0, R);
                          if (E.paths.has(H)) {
                            b = !0;
                            break;
                          }
                          const Q = C.substring(
                            R + 1
                          );
                          if (!isNaN(Number(Q))) {
                            const T = H.lastIndexOf(".");
                            if (T !== -1) {
                              const $ = H.substring(
                                0,
                                T
                              );
                              if (E.paths.has($)) {
                                b = !0;
                                break;
                              }
                            }
                          }
                          R = H.lastIndexOf(".");
                        }
                        if (b) break;
                      }
                    if (!b && _.includes("deps") && E.depsFunction) {
                      const C = E.depsFunction(a);
                      let R = !1;
                      typeof C == "boolean" ? C && (R = !0) : q(E.deps, C) || (E.deps = C, R = !0), R && (b = !0);
                    }
                    b && E.forceUpdate();
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
              X(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(d.key) && X(w);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((v) => {
                  const k = v.path, E = v.message, b = [d.key, ...k].join(".");
                  e(b, E);
                }), dt(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return S;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => kt.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return o.getState().serverState[t];
          if (l === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return y.revertToInitialState;
          if (l === "updateInitialState") return y.updateInitialState;
          if (l === "removeValidation") return y.removeValidation;
        }
        if (l === "getFormRef")
          return () => kt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ yt(
            Ft,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: g?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return y._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ut(() => {
                ct(i, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              ct(i, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            I(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ yt(
            Dt,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const O = [...n, l], it = o.getState().getNestedState(t, O);
        return s(it, O, g);
      }
    }, W = new Proxy(j, U);
    return h.set(D, {
      proxy: W,
      stateVersion: V
    }), W;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function $t(t) {
  return lt(Xt, { proxy: t });
}
function Zt({
  proxy: t,
  rebuildStateShape: i
}) {
  const S = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? i(
    S,
    t._path
  ).stateMapNoRender(
    (h, V, I, y, s) => t._mapFn(h, V, I, y, s)
  ) : null;
}
function Xt({
  proxy: t
}) {
  const i = J(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const h = u.parentElement, I = Array.from(h.childNodes).indexOf(u);
    let y = h.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, h.setAttribute("data-parent-id", y));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: I,
      effect: t._effect
    };
    o.getState().addSignalElement(S, m);
    const n = o.getState().getNestedState(t._stateKey, t._path);
    let g;
    if (t._effect)
      try {
        g = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (j) {
        console.error("Error evaluating effect function during mount:", j), g = n;
      }
    else
      g = n;
    g !== null && typeof g == "object" && (g = JSON.stringify(g));
    const D = document.createTextNode(String(g));
    u.replaceWith(D);
  }, [t._stateKey, t._path.join("."), t._effect]), lt("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function fe(t) {
  const i = Mt(
    (S) => {
      const u = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return lt("text", {}, String(i));
}
function Qt({
  stateKey: t,
  itemComponentId: i,
  itemPath: S,
  children: u
}) {
  const [, h] = st({}), [V, I] = Wt(), y = J(null), s = J(null), m = ft(
    (n) => {
      V(n), y.current = n;
    },
    [V]
  );
  return nt(() => {
    I.height > 0 && I.height !== s.current && (s.current = I.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: I.height,
        domRef: y.current
        // Store the actual DOM element reference
      }
    }));
  }, [I.height, t, S]), xt(() => {
    const n = `${t}////${i}`, g = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return g.components.set(n, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), o.getState().stateComponents.set(t, g), () => {
      const D = o.getState().stateComponents.get(t);
      D && D.components.delete(n);
    };
  }, [t, i, S.join(".")]), /* @__PURE__ */ yt("div", { ref: m, children: u });
}
export {
  $t as $cogsSignal,
  fe as $cogsSignalStore,
  de as addStateOptions,
  ue as createCogsState,
  ge as notifyComponent,
  Yt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
