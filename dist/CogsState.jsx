"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as ot, useRef as J, useEffect as et, useLayoutEffect as xt, useMemo as It, createElement as ct, useSyncExternalStore as Mt, startTransition as Ot, useCallback as ft } from "react";
import { transformStateFunc as jt, isDeepEqual as q, isFunction as K, getNestedValue as Y, getDifferences as wt, debounce as Ut } from "./utility.js";
import { pushFunc as vt, updateFn as st, cutFunc as gt, ValidationWrapper as Ft, FormControlComponent as Dt } from "./Functions.jsx";
import Lt from "superjson";
import { v4 as pt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as kt } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import { applyPatch as Gt } from "fast-json-patch";
import Wt from "react-use-measure";
function At(t, s) {
  const S = o.getState().getInitialOptions, u = o.getState().setInitialStateOptions, v = S(t) || {};
  u(t, {
    ...v,
    ...s
  });
}
function bt({
  stateKey: t,
  options: s,
  initialOptionsPart: S
}) {
  const u = rt(t) || {}, v = S[t] || {}, V = o.getState().setInitialStateOptions, I = { ...v, ...u };
  let y = !1;
  if (s)
    for (const i in s)
      I.hasOwnProperty(i) ? (i == "localStorage" && s[i] && I[i].key !== s[i]?.key && (y = !0, I[i] = s[i]), i == "initialState" && s[i] && I[i] !== s[i] && // Different references
      !q(I[i], s[i]) && (y = !0, I[i] = s[i])) : (y = !0, I[i] = s[i]);
  y && V(t, I);
}
function de(t, { formElements: s, validation: S }) {
  return { initialState: t, formElements: s, validation: S };
}
const ue = (t, s) => {
  let S = t;
  const [u, v] = jt(S);
  (Object.keys(v).length > 0 || s && Object.keys(s).length > 0) && Object.keys(v).forEach((y) => {
    v[y] = v[y] || {}, v[y].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...v[y].formElements || {}
      // State-specific overrides
    }, rt(y) || o.getState().setInitialStateOptions(y, v[y]);
  }), o.getState().setInitialStates(u), o.getState().setCreatedState(u);
  const V = (y, i) => {
    const [h] = ot(i?.componentId ?? pt());
    bt({
      stateKey: y,
      options: i,
      initialOptionsPart: v
    });
    const n = o.getState().cogsStateStore[y] || u[y], g = i?.modifyState ? i.modifyState(n) : n, [L, U] = Yt(
      g,
      {
        stateKey: y,
        syncUpdate: i?.syncUpdate,
        componentId: h,
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
    return U;
  };
  function I(y, i) {
    bt({ stateKey: y, options: i, initialOptionsPart: v }), i.localStorage && qt(y, i), lt(y);
  }
  return { useCogsState: V, setCogsOptions: I };
}, {
  setUpdaterState: St,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: Pt,
  getValidationErrors: zt,
  setStateLog: Ht,
  updateInitialStateGlobal: Et,
  addValidationError: Ct,
  removeValidationError: X,
  setServerSyncActions: Bt
} = o.getState(), Vt = (t, s, S, u, v) => {
  S?.log && console.log(
    "saving to localstorage",
    s,
    S.localStorage?.key,
    u
  );
  const V = K(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (V && u) {
    const I = `${u}-${s}-${V}`;
    let y;
    try {
      y = ht(I)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? y
    }, h = Lt.serialize(i);
    window.localStorage.setItem(
      I,
      JSON.stringify(h.json)
    );
  }
}, ht = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, qt = (t, s) => {
  const S = o.getState().cogsStateStore[t], { sessionId: u } = Nt(), v = K(s?.localStorage?.key) ? s.localStorage.key(S) : s?.localStorage?.key;
  if (v && u) {
    const V = ht(
      `${u}-${t}-${v}`
    );
    if (V && V.lastUpdated > (V.lastSyncedWithServer || 0))
      return nt(t, V.state), lt(t), !0;
  }
  return !1;
}, _t = (t, s, S, u, v, V) => {
  const I = {
    initialState: s,
    updaterState: mt(
      t,
      u,
      v,
      V
    ),
    state: S
  };
  Et(t, I.initialState), St(t, I.updaterState), nt(t, I.state);
}, lt = (t) => {
  const s = o.getState().stateComponents.get(t);
  if (!s) return;
  const S = /* @__PURE__ */ new Set();
  s.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((u) => u());
  });
}, ge = (t, s) => {
  const S = o.getState().stateComponents.get(t);
  if (S) {
    const u = `${t}////${s}`, v = S.components.get(u);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Jt = (t, s, S, u) => {
  switch (t) {
    case "update":
      return {
        oldValue: Y(s, u),
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
        oldValue: Y(s, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Yt(t, {
  stateKey: s,
  serverSync: S,
  localStorage: u,
  formElements: v,
  reactiveDeps: V,
  reactiveType: I,
  componentId: y,
  initialState: i,
  syncUpdate: h,
  dependencies: n,
  serverState: g
} = {}) {
  const [L, U] = ot({}), { sessionId: F } = Nt();
  let z = !s;
  const [f] = ot(s ?? pt()), l = o.getState().stateLog[f], dt = J(/* @__PURE__ */ new Set()), tt = J(y ?? pt()), M = J(
    null
  );
  M.current = rt(f) ?? null, et(() => {
    if (h && h.stateKey === f && h.path?.[0]) {
      nt(f, (r) => ({
        ...r,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), et(() => {
    if (i) {
      At(f, {
        initialState: i
      });
      const e = M.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = o.getState().initialStateGlobal[f];
      if (!(c && !q(c, i) || !c) && !a)
        return;
      let m = null;
      const k = K(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      k && F && (m = ht(`${F}-${f}-${k}`));
      let p = i, b = !1;
      const _ = a ? Date.now() : 0, P = m?.lastUpdated || 0, R = m?.lastSyncedWithServer || 0;
      a && _ > P ? (p = e.serverState.data, b = !0) : m && P > R && (p = m.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), o.getState().initializeShadowState(f, i), _t(
        f,
        i,
        p,
        at,
        tt.current,
        F
      ), b && k && F && Vt(p, f, e, F, Date.now()), lt(f), (Array.isArray(I) ? I : [I || "component"]).includes("none") || U({});
    }
  }, [
    i,
    g?.status,
    g?.data,
    ...n || []
  ]), xt(() => {
    z && At(f, {
      serverSync: S,
      formElements: v,
      initialState: i,
      localStorage: u,
      middleware: M.current?.middleware
    });
    const e = `${f}////${tt.current}`, r = o.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: V || void 0,
      reactiveType: I ?? ["component", "deps"]
    }), o.getState().stateComponents.set(f, r), U({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(f));
    };
  }, []);
  const at = (e, r, a, c) => {
    if (Array.isArray(r)) {
      const m = `${f}-${r.join(".")}`;
      dt.current.add(m);
    }
    const w = o.getState();
    nt(f, (m) => {
      const k = K(e) ? e(m) : e, p = `${f}-${r.join(".")}`;
      if (p) {
        let T = !1, $ = w.signalDomElements.get(p);
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
          $.forEach(({ parentId: G, position: A, effect: D }) => {
            const O = document.querySelector(
              `[data-parent-id="${G}"]`
            );
            if (O) {
              const B = Array.from(O.childNodes);
              if (B[A]) {
                const E = D ? new Function("state", `return (${D})(state)`)(x) : x;
                B[A].textContent = String(E);
              }
            }
          });
        }
      }
      console.log("shadowState", w.shadowStateStore), a.updateType === "update" && (c || M.current?.validation?.key) && r && X(
        (c || M.current?.validation?.key) + "." + r.join(".")
      );
      const b = r.slice(0, r.length - 1);
      a.updateType === "cut" && M.current?.validation?.key && X(
        M.current?.validation?.key + "." + b.join(".")
      ), a.updateType === "insert" && M.current?.validation?.key && zt(
        M.current?.validation?.key + "." + b.join(".")
      ).filter(([$, x]) => {
        let G = $?.split(".").length;
        if ($ == b.join(".") && G == b.length - 1) {
          let A = $ + "." + b;
          X($), Ct(A, x);
        }
      });
      const _ = w.stateComponents.get(f);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const T = wt(m, k), $ = new Set(T), x = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          G,
          A
        ] of _.components.entries()) {
          let D = !1;
          const O = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !O.includes("none")) {
            if (O.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (O.includes("component") && ((A.paths.has(x) || A.paths.has("")) && (D = !0), !D))
              for (const B of $) {
                let E = B;
                for (; ; ) {
                  if (A.paths.has(E)) {
                    D = !0;
                    break;
                  }
                  const N = E.lastIndexOf(".");
                  if (N !== -1) {
                    const C = E.substring(
                      0,
                      N
                    );
                    if (!isNaN(
                      Number(E.substring(N + 1))
                    ) && A.paths.has(C)) {
                      D = !0;
                      break;
                    }
                    E = C;
                  } else
                    E = "";
                  if (E === "")
                    break;
                }
                if (D) break;
              }
            if (!D && O.includes("deps") && A.depsFunction) {
              const B = A.depsFunction(k);
              let E = !1;
              typeof B == "boolean" ? B && (E = !0) : q(A.deps, B) || (A.deps = B, E = !0), E && (D = !0);
            }
            D && A.forceUpdate();
          }
        }
      }
      const P = Date.now();
      r = r.map((T, $) => {
        const x = r.slice(0, -1), G = Y(k, x);
        return $ === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (G.length - 1).toString() : T;
      });
      const { oldValue: R, newValue: H } = Jt(
        a.updateType,
        m,
        k,
        r
      ), Q = {
        timeStamp: P,
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
      if (Ht(f, (T) => {
        const x = [...T ?? [], Q].reduce((G, A) => {
          const D = `${A.stateKey}:${JSON.stringify(A.path)}`, O = G.get(D);
          return O ? (O.timeStamp = Math.max(O.timeStamp, A.timeStamp), O.newValue = A.newValue, O.oldValue = O.oldValue ?? A.oldValue, O.updateType = A.updateType) : G.set(D, { ...A }), G;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), Vt(
        k,
        f,
        M.current,
        F
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: Q
      }), M.current?.serverSync) {
        const T = w.serverState[f], $ = M.current?.serverSync;
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
      at,
      tt.current,
      F
    )
  ), o.getState().cogsStateStore[f] || nt(f, t), o.getState().initialStateGlobal[f] || Et(f, t));
  const d = It(() => mt(
    f,
    at,
    tt.current,
    F
  ), [f, F]);
  return [Pt(f), d];
}
function mt(t, s, S, u) {
  const v = /* @__PURE__ */ new Map();
  let V = 0;
  const I = (h) => {
    const n = h.join(".");
    for (const [g] of v)
      (g === n || g.startsWith(n + ".")) && v.delete(g);
    V++;
  }, y = {
    removeValidation: (h) => {
      h?.validationKey && X(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && X(n?.key), h?.validationKey && X(h.validationKey);
      const g = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), v.clear(), V++;
      const L = i(g, []), U = rt(t), F = K(U?.localStorage?.key) ? U?.localStorage?.key(g) : U?.localStorage?.key, z = `${u}-${t}-${F}`;
      z && localStorage.removeItem(z), St(t, L), nt(t, g);
      const f = o.getState().stateComponents.get(t);
      return f && f.components.forEach((l) => {
        l.forceUpdate();
      }), g;
    },
    updateInitialState: (h) => {
      v.clear(), V++;
      const n = mt(
        t,
        s,
        S,
        u
      ), g = o.getState().initialStateGlobal[t], L = rt(t), U = K(L?.localStorage?.key) ? L?.localStorage?.key(g) : L?.localStorage?.key, F = `${u}-${t}-${U}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Ot(() => {
        Et(t, h), o.getState().initializeShadowState(t, h), St(t, n), nt(t, h);
        const z = o.getState().stateComponents.get(t);
        z && z.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (z) => n.get()[z]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const h = o.getState().serverState[t];
      return !!(h && q(h, Pt(t)));
    }
  };
  function i(h, n = [], g) {
    const L = n.map(String).join(".");
    v.get(L);
    const U = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(y).forEach((f) => {
      U[f] = y[f];
    });
    const F = {
      apply(f, l, dt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(f, l) {
        g?.validIndices && !Array.isArray(h) && (g = { ...g, validIndices: void 0 });
        const dt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !dt.has(l)) {
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
                o.getState().removeValidationError(a), c.errors.forEach((m) => {
                  const k = [a, ...m.path].join(".");
                  o.getState().addValidationError(k, m.message);
                });
                const w = o.getState().stateComponents.get(t);
                w && w.components.forEach((m) => {
                  m.forceUpdate();
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
            const d = o.getState().initialStateGlobal[t], e = rt(t), r = K(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${u}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => g?.validIndices ? h.map((r, a) => ({
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
                return i(
                  h[e],
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
              } = e, m = J(null), [k, p] = ot({
                startIndex: 0,
                endIndex: 10
              }), [b, _] = ot(0), P = J(!0), R = J(!1), H = J(0);
              et(() => o.getState().subscribeToShadowState(t, () => {
                _((N) => N + 1);
              }), [t]);
              const Q = o().getNestedState(
                t,
                n
              ), T = Q.length, { totalHeight: $, positions: x } = It(() => {
                const E = o.getState().getShadowMetadata(t, n) || [];
                let N = 0;
                const C = [];
                for (let j = 0; j < T; j++) {
                  C[j] = N;
                  const W = E[j]?.virtualizer?.itemHeight;
                  N += W || r;
                }
                return { totalHeight: N, positions: C };
              }, [
                T,
                t,
                n.join("."),
                r,
                b
              ]), G = It(() => {
                const E = Math.max(0, k.startIndex), N = Math.min(T, k.endIndex), C = Array.from(
                  { length: N - E },
                  (W, it) => E + it
                ), j = C.map((W) => Q[W]);
                return i(j, n, {
                  ...g,
                  validIndices: C
                });
              }, [k.startIndex, k.endIndex, Q, T]), A = ft(() => {
                const E = o.getState().getShadowMetadata(t, n) || [], N = T - 1;
                if (N >= 0) {
                  const C = E[N];
                  if (C?.virtualizer?.domRef) {
                    const j = C.virtualizer.domRef;
                    if (j && j.scrollIntoView)
                      return j.scrollIntoView({
                        behavior: "auto",
                        block: "end",
                        inline: "nearest"
                      }), !0;
                  }
                }
                return !1;
              }, [t, n, T]);
              et(() => {
                if (!c || T === 0) return;
                const E = T > H.current, N = H.current === 0 && T > 0;
                if ((E || N) && P.current && !R.current) {
                  const C = Math.ceil(
                    (m.current?.clientHeight || 0) / r
                  ), j = {
                    startIndex: Math.max(
                      0,
                      T - C - a
                    ),
                    endIndex: T
                  };
                  p(j);
                  const W = setTimeout(() => {
                    m.current && (m.current.scrollTop = m.current.scrollHeight);
                  }, 50);
                  return () => clearTimeout(W);
                }
                H.current = T;
              }, [T, r, a]), et(() => {
                const E = m.current;
                if (!E) return;
                const N = () => {
                  const { scrollTop: C, scrollHeight: j, clientHeight: W } = E, it = j - C - W;
                  P.current = it < 5, it > 100 && (R.current = !0), it < 5 && (R.current = !1);
                  let ut = 0;
                  for (let Z = 0; Z < x.length; Z++)
                    if (x[Z] > C - r * a) {
                      ut = Math.max(0, Z - 1);
                      break;
                    }
                  let Tt = ut;
                  const Rt = C + W;
                  for (let Z = ut; Z < x.length && !(x[Z] > Rt + r * a); Z++)
                    Tt = Z;
                  p({
                    startIndex: Math.max(0, ut),
                    endIndex: Math.min(T, Tt + 1 + a)
                  });
                };
                if (E.addEventListener("scroll", N, {
                  passive: !0
                }), c && T > 0 && !R.current) {
                  const { scrollTop: C } = E;
                  C === 0 && (E.scrollTop = E.scrollHeight, P.current = !0);
                }
                return N(), () => {
                  E.removeEventListener("scroll", N);
                };
              }, [x, T, r, a, c]);
              const D = ft(() => {
                P.current = !0, R.current = !1, !A() && m.current && (m.current.scrollTop = m.current.scrollHeight);
              }, [A]), O = ft(
                (E, N = "smooth") => {
                  const j = (o.getState().getShadowMetadata(t, n) || [])[E];
                  if (j?.virtualizer?.domRef) {
                    const W = j.virtualizer.domRef;
                    if (W && W.scrollIntoView) {
                      W.scrollIntoView({ behavior: N, block: "center" });
                      return;
                    }
                  }
                  m.current && x[E] !== void 0 && m.current.scrollTo({
                    top: x[E],
                    behavior: N
                  });
                },
                [x, t, n]
              ), B = {
                outer: {
                  ref: m,
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
                virtualizerProps: B,
                scrollToBottom: D,
                scrollToIndex: O
              };
            };
          if (l === "stateMapNoRender")
            return (e) => h.map((a, c) => {
              let w;
              g?.validIndices && g.validIndices[c] !== void 0 ? w = g.validIndices[c] : w = c;
              const m = [...n, w.toString()], k = i(a, m, g);
              return e(
                a,
                k,
                c,
                h,
                i(h, n, g)
              );
            });
          if (l === "$stateMap")
            return (e) => ct(Zt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (g?.validIndices || Array.from({ length: r.length }, (c, w) => w)).map((c, w) => {
                const m = r[c], k = [...n, c.toString()], p = i(m, k, g), b = `${S}-${n.join(".")}-${c}`;
                return ct(Qt, {
                  key: c,
                  stateKey: t,
                  itemComponentId: b,
                  itemPath: k,
                  children: e(
                    m,
                    p,
                    { localIndex: w, originalIndex: c },
                    r,
                    i(r, n, g)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const r = h;
              v.clear(), V++;
              const a = r.flatMap(
                (c) => c[e] ?? []
              );
              return i(
                a,
                [...n, "[*]", e],
                g
              );
            };
          if (l === "index")
            return (e) => {
              const r = h[e];
              return i(r, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, a = e[r], c = [...n, r.toString()];
              return i(a, c);
            };
          if (l === "insert")
            return (e) => (I(n), vt(s, e, n, t), i(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, a) => {
              const c = o.getState().getNestedState(t, n), w = K(e) ? e(c) : e;
              let m = null;
              if (!c.some((p) => {
                if (r) {
                  const _ = r.every(
                    (P) => q(p[P], w[P])
                  );
                  return _ && (m = p), _;
                }
                const b = q(p, w);
                return b && (m = p), b;
              }))
                I(n), vt(s, w, n, t);
              else if (a && m) {
                const p = a(m), b = c.map(
                  (_) => q(_, m) ? p : _
                );
                I(n), st(s, b, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return I(n), gt(s, n, t, e), i(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < h.length; r++)
                h[r] === e && gt(s, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = h.findIndex((a) => a === e);
              r > -1 ? gt(s, n, t, r) : vt(s, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: w }, m) => e(w, m)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return i(a.item, c, g);
            };
          if (l === "findWith")
            return (e, r) => {
              const c = d().find(
                ({ item: m }) => m[e] === r
              );
              if (!c) return;
              const w = [...n, c.originalIndex.toString()];
              return i(c.item, w, g);
            };
        }
        const tt = n[n.length - 1];
        if (!isNaN(Number(tt))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => gt(
              s,
              d,
              t,
              Number(tt)
            );
        }
        if (l === "get")
          return () => {
            if (g?.validIndices && Array.isArray(h)) {
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
            st(s, c, e), I(e);
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
            st(s, c, d), I(d);
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
              }), lt(t);
            };
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Gt(e, d).newDocument;
              _t(
                t,
                o.getState().initialStateGlobal[t],
                a,
                s,
                S,
                u
              );
              const c = o.getState().stateComponents.get(t);
              if (c) {
                const w = wt(e, a), m = new Set(w);
                for (const [
                  k,
                  p
                ] of c.components.entries()) {
                  let b = !1;
                  const _ = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (p.paths.has("") && (b = !0), !b))
                      for (const P of m) {
                        if (p.paths.has(P)) {
                          b = !0;
                          break;
                        }
                        let R = P.lastIndexOf(".");
                        for (; R !== -1; ) {
                          const H = P.substring(0, R);
                          if (p.paths.has(H)) {
                            b = !0;
                            break;
                          }
                          const Q = P.substring(
                            R + 1
                          );
                          if (!isNaN(Number(Q))) {
                            const T = H.lastIndexOf(".");
                            if (T !== -1) {
                              const $ = H.substring(
                                0,
                                T
                              );
                              if (p.paths.has($)) {
                                b = !0;
                                break;
                              }
                            }
                          }
                          R = H.lastIndexOf(".");
                        }
                        if (b) break;
                      }
                    if (!b && _.includes("deps") && p.depsFunction) {
                      const P = p.depsFunction(a);
                      let R = !1;
                      typeof P == "boolean" ? P && (R = !0) : q(p.deps, P) || (p.deps = P, R = !0), R && (b = !0);
                    }
                    b && p.forceUpdate();
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
                return c.success ? !0 : (c.error.errors.forEach((m) => {
                  const k = m.path, p = m.message, b = [d.key, ...k].join(".");
                  e(b, p);
                }), lt(t), !1);
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
                st(s, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              st(s, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            I(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ yt(
            Dt,
            {
              setState: s,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], at = o.getState().getNestedState(t, M);
        return i(at, M, g);
      }
    }, z = new Proxy(U, F);
    return v.set(L, {
      proxy: z,
      stateVersion: V
    }), z;
  }
  return i(
    o.getState().getNestedState(t, [])
  );
}
function $t(t) {
  return ct(Xt, { proxy: t });
}
function Zt({
  proxy: t,
  rebuildStateShape: s
}) {
  const S = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? s(
    S,
    t._path
  ).stateMapNoRender(
    (v, V, I, y, i) => t._mapFn(v, V, I, y, i)
  ) : null;
}
function Xt({
  proxy: t
}) {
  const s = J(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
    const u = s.current;
    if (!u || !u.parentElement) return;
    const v = u.parentElement, I = Array.from(v.childNodes).indexOf(u);
    let y = v.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", y));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: I,
      effect: t._effect
    };
    o.getState().addSignalElement(S, h);
    const n = o.getState().getNestedState(t._stateKey, t._path);
    let g;
    if (t._effect)
      try {
        g = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (U) {
        console.error("Error evaluating effect function during mount:", U), g = n;
      }
    else
      g = n;
    g !== null && typeof g == "object" && (g = JSON.stringify(g));
    const L = document.createTextNode(String(g));
    u.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), ct("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function fe(t) {
  const s = Mt(
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
  return ct("text", {}, String(s));
}
function Qt({
  stateKey: t,
  itemComponentId: s,
  itemPath: S,
  children: u
}) {
  const [, v] = ot({}), [V, I] = Wt(), y = J(null), i = J(null), h = ft(
    (n) => {
      V(n), y.current = n;
    },
    [V]
  );
  return et(() => {
    I.height > 0 && I.height !== i.current && (i.current = I.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: I.height,
        domRef: y.current
        // Store the actual DOM element reference
      }
    }));
  }, [I.height, t, S]), xt(() => {
    const n = `${t}////${s}`, g = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return g.components.set(n, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), o.getState().stateComponents.set(t, g), () => {
      const L = o.getState().stateComponents.get(t);
      L && L.components.delete(n);
    };
  }, [t, s, S.join(".")]), /* @__PURE__ */ yt("div", { ref: h, children: u });
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
