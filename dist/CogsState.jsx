"use client";
import { jsx as ht } from "react/jsx-runtime";
import { useState as Z, useRef as X, useEffect as nt, useLayoutEffect as lt, useMemo as vt, createElement as at, useSyncExternalStore as Pt, startTransition as _t, useCallback as Tt } from "react";
import { transformStateFunc as Mt, isDeepEqual as H, isFunction as q, getNestedValue as z, getDifferences as yt, debounce as jt } from "./utility.js";
import { pushFunc as mt, updateFn as ot, cutFunc as ct, ValidationWrapper as Ot, FormControlComponent as Rt } from "./Functions.jsx";
import Ut from "superjson";
import { v4 as It } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Et } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import { applyPatch as Ft } from "fast-json-patch";
import Dt from "react-use-measure";
function At(t, c) {
  const h = o.getState().getInitialOptions, S = o.getState().setInitialStateOptions, I = h(t) || {};
  S(t, {
    ...I,
    ...c
  });
}
function $t({
  stateKey: t,
  options: c,
  initialOptionsPart: h
}) {
  const S = et(t) || {}, I = h[t] || {}, b = o.getState().setInitialStateOptions, w = { ...I, ...S };
  let p = !1;
  if (c)
    for (const a in c)
      w.hasOwnProperty(a) ? (a == "localStorage" && c[a] && w[a].key !== c[a]?.key && (p = !0, w[a] = c[a]), a == "initialState" && c[a] && w[a] !== c[a] && // Different references
      !H(w[a], c[a]) && (p = !0, w[a] = c[a])) : (p = !0, w[a] = c[a]);
  p && b(t, w);
}
function ce(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const le = (t, c) => {
  let h = t;
  const [S, I] = Mt(h);
  (Object.keys(I).length > 0 || c && Object.keys(c).length > 0) && Object.keys(I).forEach((p) => {
    I[p] = I[p] || {}, I[p].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...I[p].formElements || {}
      // State-specific overrides
    }, et(p) || o.getState().setInitialStateOptions(p, I[p]);
  }), o.getState().setInitialStates(S), o.getState().setCreatedState(S);
  const b = (p, a) => {
    const [y] = Z(a?.componentId ?? It());
    $t({
      stateKey: p,
      options: a,
      initialOptionsPart: I
    });
    const n = o.getState().cogsStateStore[p] || S[p], m = a?.modifyState ? a.modifyState(n) : n, [L, R] = qt(
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
    $t({ stateKey: p, options: a, initialOptionsPart: I }), a.localStorage && zt(p, a), ft(p);
  }
  return { useCogsState: b, setCogsOptions: w };
}, {
  setUpdaterState: dt,
  setState: Q,
  getInitialOptions: et,
  getKeyState: Vt,
  getValidationErrors: Wt,
  setStateLog: Lt,
  updateInitialStateGlobal: pt,
  addValidationError: Gt,
  removeValidationError: B,
  setServerSyncActions: Ht
} = o.getState(), kt = (t, c, h, S, I) => {
  h?.log && console.log(
    "saving to localstorage",
    c,
    h.localStorage?.key,
    S
  );
  const b = q(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (b && S) {
    const w = `${S}-${c}-${b}`;
    let p;
    try {
      p = gt(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? p
    }, y = Ut.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(y.json)
    );
  }
}, gt = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, zt = (t, c) => {
  const h = o.getState().cogsStateStore[t], { sessionId: S } = Nt(), I = q(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (I && S) {
    const b = gt(
      `${S}-${t}-${I}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return Q(t, b.state), ft(t), !0;
  }
  return !1;
}, Ct = (t, c, h, S, I, b) => {
  const w = {
    initialState: c,
    updaterState: ut(
      t,
      S,
      I,
      b
    ),
    state: h
  };
  pt(t, w.initialState), dt(t, w.updaterState), Q(t, w.state);
}, ft = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || h.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((S) => S());
  });
}, de = (t, c) => {
  const h = o.getState().stateComponents.get(t);
  if (h) {
    const S = `${t}////${c}`, I = h.components.get(S);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, Bt = (t, c, h, S) => {
  switch (t) {
    case "update":
      return {
        oldValue: z(c, S),
        newValue: z(h, S)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: z(h, S)
      };
    case "cut":
      return {
        oldValue: z(c, S),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function qt(t, {
  stateKey: c,
  serverSync: h,
  localStorage: S,
  formElements: I,
  reactiveDeps: b,
  reactiveType: w,
  componentId: p,
  initialState: a,
  syncUpdate: y,
  dependencies: n,
  serverState: m
} = {}) {
  const [L, R] = Z({}), { sessionId: U } = Nt();
  let G = !c;
  const [v] = Z(c ?? It()), l = o.getState().stateLog[v], st = X(/* @__PURE__ */ new Set()), J = X(p ?? It()), j = X(
    null
  );
  j.current = et(v) ?? null, nt(() => {
    if (y && y.stateKey === v && y.path?.[0]) {
      Q(v, (r) => ({
        ...r,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), nt(() => {
    if (a) {
      At(v, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[v];
      if (!(i && !H(i, a) || !i) && !s)
        return;
      let f = null;
      const E = q(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && U && (f = gt(`${U}-${v}-${E}`));
      let T = a, A = !1;
      const P = s ? Date.now() : 0, V = f?.lastUpdated || 0, $ = f?.lastSyncedWithServer || 0;
      s && P > V ? (T = e.serverState.data, A = !0) : f && V > $ && (T = f.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(v, a), Ct(
        v,
        a,
        T,
        rt,
        J.current,
        U
      ), A && E && U && kt(T, v, e, U, Date.now()), ft(v), (Array.isArray(w) ? w : [w || "component"]).includes("none") || R({});
    }
  }, [
    a,
    m?.status,
    m?.data,
    ...n || []
  ]), lt(() => {
    G && At(v, {
      serverSync: h,
      formElements: I,
      initialState: a,
      localStorage: S,
      middleware: j.current?.middleware
    });
    const e = `${v}////${J.current}`, r = o.getState().stateComponents.get(v) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(v, r), R({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(v));
    };
  }, []);
  const rt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const f = `${v}-${r.join(".")}`;
      st.current.add(f);
    }
    const g = o.getState();
    Q(v, (f) => {
      const E = q(e) ? e(f) : e, T = `${v}-${r.join(".")}`;
      if (T) {
        let M = !1, N = g.signalDomElements.get(T);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), W = z(E, O);
          if (Array.isArray(W)) {
            M = !0;
            const u = `${v}-${O.join(".")}`;
            N = g.signalDomElements.get(u);
          }
        }
        if (N) {
          const O = M ? z(E, r.slice(0, -1)) : z(E, r);
          N.forEach(({ parentId: W, position: u, effect: k }) => {
            const C = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (C) {
              const _ = Array.from(C.childNodes);
              if (_[u]) {
                const x = k ? new Function("state", `return (${k})(state)`)(O) : O;
                _[u].textContent = String(x);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && r && B(
        (i || j.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && B(
        j.current?.validation?.key + "." + A.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Wt(
        j.current?.validation?.key + "." + A.join(".")
      ).filter(([N, O]) => {
        let W = N?.split(".").length;
        if (N == A.join(".") && W == A.length - 1) {
          let u = N + "." + A;
          B(N), Gt(u, O);
        }
      });
      const P = g.stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const M = yt(f, E), N = new Set(M), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          W,
          u
        ] of P.components.entries()) {
          let k = !1;
          const C = Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"];
          if (console.log("component", u), !C.includes("none")) {
            if (C.includes("all")) {
              u.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((u.paths.has(O) || u.paths.has("")) && (k = !0), !k))
              for (const _ of N) {
                let x = _;
                for (; ; ) {
                  if (u.paths.has(x)) {
                    k = !0;
                    break;
                  }
                  const Y = x.lastIndexOf(".");
                  if (Y !== -1) {
                    const K = x.substring(
                      0,
                      Y
                    );
                    if (!isNaN(
                      Number(x.substring(Y + 1))
                    ) && u.paths.has(K)) {
                      k = !0;
                      break;
                    }
                    x = K;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (k) break;
              }
            if (!k && C.includes("deps") && u.depsFunction) {
              const _ = u.depsFunction(E);
              let x = !1;
              typeof _ == "boolean" ? _ && (x = !0) : H(u.deps, _) || (u.deps = _, x = !0), x && (k = !0);
            }
            k && u.forceUpdate();
          }
        }
      }
      const V = Date.now();
      r = r.map((M, N) => {
        const O = r.slice(0, -1), W = z(E, O);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (W.length - 1).toString() : M;
      });
      const { oldValue: $, newValue: D } = Bt(
        s.updateType,
        f,
        E,
        r
      ), F = {
        timeStamp: V,
        stateKey: v,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: $,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(v, r, E);
          break;
        case "insert":
          const M = r.slice(0, -1);
          g.insertShadowArrayElement(v, M, D);
          break;
        case "cut":
          const N = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(v, N, O);
          break;
      }
      if (Lt(v, (M) => {
        const O = [...M ?? [], F].reduce((W, u) => {
          const k = `${u.stateKey}:${JSON.stringify(u.path)}`, C = W.get(k);
          return C ? (C.timeStamp = Math.max(C.timeStamp, u.timeStamp), C.newValue = u.newValue, C.oldValue = C.oldValue ?? u.oldValue, C.updateType = u.updateType) : W.set(k, { ...u }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), kt(
        E,
        v,
        j.current,
        U
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: F
      }), j.current?.serverSync) {
        const M = g.serverState[v], N = j.current?.serverSync;
        Ht(v, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[v] || (dt(
    v,
    ut(
      v,
      rt,
      J.current,
      U
    )
  ), o.getState().cogsStateStore[v] || Q(v, t), o.getState().initialStateGlobal[v] || pt(v, t));
  const d = vt(() => ut(
    v,
    rt,
    J.current,
    U
  ), [v, U]);
  return [Vt(v), d];
}
function ut(t, c, h, S) {
  const I = /* @__PURE__ */ new Map();
  let b = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [m] of I)
      (m === n || m.startsWith(n + ".")) && I.delete(m);
    b++;
  }, p = {
    removeValidation: (y) => {
      y?.validationKey && B(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && B(n?.key), y?.validationKey && B(y.validationKey);
      const m = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), I.clear(), b++;
      const L = a(m, []), R = et(t), U = q(R?.localStorage?.key) ? R?.localStorage?.key(m) : R?.localStorage?.key, G = `${S}-${t}-${U}`;
      G && localStorage.removeItem(G), dt(t, L), Q(t, m);
      const v = o.getState().stateComponents.get(t);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), m;
    },
    updateInitialState: (y) => {
      I.clear(), b++;
      const n = ut(
        t,
        c,
        h,
        S
      ), m = o.getState().initialStateGlobal[t], L = et(t), R = q(L?.localStorage?.key) ? L?.localStorage?.key(m) : L?.localStorage?.key, U = `${S}-${t}-${R}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), _t(() => {
        pt(t, y), o.getState().initializeShadowState(t, y), dt(t, n), Q(t, y);
        const G = o.getState().stateComponents.get(t);
        G && G.components.forEach((v) => {
          v.forceUpdate();
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
      return !!(y && H(y, Vt(t)));
    }
  };
  function a(y, n = [], m) {
    const L = n.map(String).join(".");
    I.get(L);
    const R = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(p).forEach((v) => {
      R[v] = p[v];
    });
    const U = {
      apply(v, l, st) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(v, l) {
        m?.validIndices && !Array.isArray(y) && (m = { ...m, validIndices: void 0 });
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
          const d = `${t}////${h}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const s = n.join(".");
              let i = !0;
              for (const g of r.paths)
                if (s.startsWith(g) && (s === g || s[g.length] === ".")) {
                  i = !1;
                  break;
                }
              i && r.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => yt(
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
              const i = await e.action(r);
              if (i && !i.success && i.errors && s) {
                o.getState().removeValidationError(s), i.errors.forEach((f) => {
                  const E = [s, ...f.path].join(".");
                  o.getState().addValidationError(E, f.message);
                });
                const g = o.getState().stateComponents.get(t);
                g && g.components.forEach((f) => {
                  f.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
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
            const d = o.getState().initialStateGlobal[t], e = et(t), r = q(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${S}-${t}-${r}`;
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
          const d = () => m?.validIndices ? y.map((r, s) => ({
            item: r,
            originalIndex: m.validIndices[s]
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
                  m
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
                stickToBottom: i = !1
              } = e, g = X(null), [f, E] = Z({
                startIndex: 0,
                endIndex: 10
              }), T = X(i), [A, P] = Z(0);
              nt(() => o.getState().subscribeToShadowState(t, () => {
                P((k) => k + 1);
              }), [t]);
              const V = o().getNestedState(
                t,
                n
              ), $ = V.length, { totalHeight: D, positions: F } = vt(() => {
                const u = o.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const C = [];
                for (let _ = 0; _ < $; _++) {
                  C[_] = k;
                  const x = u[_]?.virtualizer?.itemHeight;
                  k += x || r;
                }
                return { totalHeight: k, positions: C };
              }, [
                $,
                t,
                n.join("."),
                r,
                A
              ]), M = vt(() => {
                const u = Math.max(0, f.startIndex), k = Math.min($, f.endIndex), C = Array.from(
                  { length: k - u },
                  (x, Y) => u + Y
                ), _ = C.map((x) => V[x]);
                return a(_, n, {
                  ...m,
                  validIndices: C
                });
              }, [f.startIndex, f.endIndex, V, $]);
              nt(() => {
                if (i && $ > 0 && g.current) {
                  const u = g.current, k = Math.ceil(
                    u.clientHeight / r
                  );
                  E({
                    startIndex: Math.max(
                      0,
                      $ - k - s
                    ),
                    endIndex: $
                  }), setTimeout(() => {
                    u.scrollTop = u.scrollHeight;
                  }, 100);
                }
              }, [$]), lt(() => {
                const u = g.current;
                if (!u) return;
                const k = u.scrollHeight - u.scrollTop - u.clientHeight < 1, C = () => {
                  if (!u) return;
                  const { scrollTop: x, clientHeight: Y } = u;
                  let K = 0, it = $ - 1;
                  for (; K <= it; ) {
                    const St = Math.floor((K + it) / 2);
                    F[St] < x ? K = St + 1 : it = St - 1;
                  }
                  const wt = Math.max(0, it - s);
                  let tt = wt;
                  const xt = x + Y;
                  for (; tt < $ && F[tt] < xt; )
                    tt++;
                  tt = Math.min($, tt + s), E({ startIndex: wt, endIndex: tt });
                }, _ = () => {
                  T.current = u.scrollHeight - u.scrollTop - u.clientHeight < 1, C();
                };
                return u.addEventListener("scroll", _, {
                  passive: !0
                }), i && (T.current || k) && (u.scrollTop = u.scrollHeight), C(), () => {
                  u.removeEventListener("scroll", _);
                };
              }, [$, F, D, i]);
              const N = Tt(
                (u = "smooth") => {
                  g.current && (T.current = !0, g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: u
                  }));
                },
                []
              ), O = Tt(
                (u, k = "smooth") => {
                  g.current && F[u] !== void 0 && (T.current = !1, g.current.scrollTo({
                    top: F[u],
                    behavior: k
                  }));
                },
                [F]
              ), W = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${D}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${F[f.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: M,
                virtualizerProps: W,
                scrollToBottom: N,
                scrollToIndex: O
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (f, E) => e(f.item, E.item)
              ), i = s.map(({ item: f }) => f), g = {
                ...m,
                validIndices: s.map(
                  ({ originalIndex: f }) => f
                )
              };
              return a(i, n, g);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: f }, E) => e(f, E)
              ), i = s.map(({ item: f }) => f), g = {
                ...m,
                validIndices: s.map(
                  ({ originalIndex: f }) => f
                )
              };
              return a(i, n, g);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (m?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const f = r[i], E = [...n, i.toString()], T = a(f, E, m);
                return e(f, T, {
                  register: () => {
                    const [, P] = Z({}), V = `${h}-${n.join(".")}-${i}`;
                    lt(() => {
                      const $ = `${t}////${V}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set($, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const F = o.getState().stateComponents.get(t);
                        F && F.components.delete($);
                      };
                    }, [t, V]);
                  },
                  index: g,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => y.map((s, i) => {
              let g;
              m?.validIndices && m.validIndices[i] !== void 0 ? g = m.validIndices[i] : g = i;
              const f = [...n, g.toString()], E = a(s, f, m);
              return e(
                s,
                E,
                i,
                y,
                a(y, n, m)
              );
            });
          if (l === "$stateMap")
            return (e) => at(Jt, {
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
              return Array.isArray(r) ? (m?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const f = r[i], E = [...n, i.toString()], T = a(f, E, m), A = `${h}-${n.join(".")}-${i}`;
                return at(Zt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: E,
                  children: e(
                    f,
                    T,
                    g,
                    r,
                    a(r, n, m)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const r = y;
              I.clear(), b++;
              const s = r.flatMap(
                (i) => i[e] ?? []
              );
              return a(
                s,
                [...n, "[*]", e],
                m
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
              const r = e.length - 1, s = e[r], i = [...n, r.toString()];
              return a(s, i);
            };
          if (l === "insert")
            return (e) => (w(n), mt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = q(e) ? e(i) : e;
              let f = null;
              if (!i.some((T) => {
                if (r) {
                  const P = r.every(
                    (V) => H(T[V], g[V])
                  );
                  return P && (f = T), P;
                }
                const A = H(T, g);
                return A && (f = T), A;
              }))
                w(n), mt(c, g, n, t);
              else if (s && f) {
                const T = s(f), A = i.map(
                  (P) => H(P, f) ? T : P
                );
                w(n), ot(c, A, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return w(n), ct(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < y.length; r++)
                y[r] === e && ct(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = y.findIndex((s) => s === e);
              r > -1 ? ct(c, n, t, r) : mt(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: g }, f) => e(g, f)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, m);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = d().find(
                ({ item: f }) => f[e] === r
              );
              if (!i) return;
              const g = [...n, i.originalIndex.toString()];
              return a(i.item, g, m);
            };
        }
        const J = n[n.length - 1];
        if (!isNaN(Number(J))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ct(
              c,
              d,
              t,
              Number(J)
            );
        }
        if (l === "get")
          return () => {
            if (m?.validIndices && Array.isArray(y)) {
              const d = o.getState().getNestedState(t, n);
              return m.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
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
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => gt(S + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            ot(c, i, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), r = d.join("."), s = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              s === e ? void 0 : e
            );
            const i = o.getState().getNestedState(t, [...d]);
            ot(c, i, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Ft(e, d).newDocument;
              Ct(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                h,
                S
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = yt(e, s), f = new Set(g);
                for (const [
                  E,
                  T
                ] of i.components.entries()) {
                  let A = !1;
                  const P = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (T.paths.has("") && (A = !0), !A))
                      for (const V of f) {
                        if (T.paths.has(V)) {
                          A = !0;
                          break;
                        }
                        let $ = V.lastIndexOf(".");
                        for (; $ !== -1; ) {
                          const D = V.substring(0, $);
                          if (T.paths.has(D)) {
                            A = !0;
                            break;
                          }
                          const F = V.substring(
                            $ + 1
                          );
                          if (!isNaN(Number(F))) {
                            const M = D.lastIndexOf(".");
                            if (M !== -1) {
                              const N = D.substring(
                                0,
                                M
                              );
                              if (T.paths.has(N)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          $ = D.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && P.includes("deps") && T.depsFunction) {
                      const V = T.depsFunction(s);
                      let $ = !1;
                      typeof V == "boolean" ? V && ($ = !0) : H(T.deps, V) || (T.deps = V, $ = !0), $ && (A = !0);
                    }
                    A && T.forceUpdate();
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
              B(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && B(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((f) => {
                  const E = f.path, T = f.message, A = [d.key, ...E].join(".");
                  e(A, T);
                }), ft(t), !1);
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
            return p.revertToInitialState;
          if (l === "updateInitialState") return p.updateInitialState;
          if (l === "removeValidation") return p.removeValidation;
        }
        if (l === "getFormRef")
          return () => Et.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ ht(
            Ot,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
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
              jt(() => {
                ot(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              ot(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ ht(
            Rt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const j = [...n, l], rt = o.getState().getNestedState(t, j);
        return a(rt, j, m);
      }
    }, G = new Proxy(R, U);
    return I.set(L, {
      proxy: G,
      stateVersion: b
    }), G;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function bt(t) {
  return at(Yt, { proxy: t });
}
function Jt({
  proxy: t,
  rebuildStateShape: c
}) {
  const h = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? c(
    h,
    t._path
  ).stateMapNoRender(
    (I, b, w, p, a) => t._mapFn(I, b, w, p, a)
  ) : null;
}
function Yt({
  proxy: t
}) {
  const c = X(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const S = c.current;
    if (!S || !S.parentElement) return;
    const I = S.parentElement, w = Array.from(I.childNodes).indexOf(S);
    let p = I.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", p));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(h, y);
    const n = o.getState().getNestedState(t._stateKey, t._path);
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
    S.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), at("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function ue(t) {
  const c = Pt(
    (h) => {
      const S = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return at("text", {}, String(c));
}
function Zt({
  stateKey: t,
  itemComponentId: c,
  itemPath: h,
  children: S
}) {
  const [, I] = Z({}), [b, w] = Dt(), p = X(null);
  return nt(() => {
    w.height > 0 && w.height !== p.current && (p.current = w.height, o.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, h]), lt(() => {
    const a = `${t}////${c}`, y = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return y.components.set(a, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([h.join(".")])
    }), o.getState().stateComponents.set(t, y), () => {
      const n = o.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, c, h.join(".")]), /* @__PURE__ */ ht("div", { ref: b, children: S });
}
export {
  bt as $cogsSignal,
  ue as $cogsSignalStore,
  ce as addStateOptions,
  le as createCogsState,
  de as notifyComponent,
  qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
