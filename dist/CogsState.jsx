"use client";
import { jsx as ht } from "react/jsx-runtime";
import { useState as Z, useRef as X, useEffect as ot, useLayoutEffect as lt, useMemo as vt, createElement as at, useSyncExternalStore as Pt, startTransition as _t, useCallback as Tt } from "react";
import { transformStateFunc as Mt, isDeepEqual as H, isFunction as q, getNestedValue as z, getDifferences as yt, debounce as jt } from "./utility.js";
import { pushFunc as mt, updateFn as rt, cutFunc as ct, ValidationWrapper as Ot, FormControlComponent as Rt } from "./Functions.jsx";
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
  const S = et(t) || {}, I = h[t] || {}, $ = o.getState().setInitialStateOptions, w = { ...I, ...S };
  let p = !1;
  if (c)
    for (const a in c)
      w.hasOwnProperty(a) ? (a == "localStorage" && c[a] && w[a].key !== c[a]?.key && (p = !0, w[a] = c[a]), a == "initialState" && c[a] && w[a] !== c[a] && // Different references
      !H(w[a], c[a]) && (p = !0, w[a] = c[a])) : (p = !0, w[a] = c[a]);
  p && $(t, w);
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
  const $ = (p, a) => {
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
  return { useCogsState: $, setCogsOptions: w };
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
  const $ = q(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if ($ && S) {
    const w = `${S}-${c}-${$}`;
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
    const $ = gt(
      `${S}-${t}-${I}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return Q(t, $.state), ft(t), !0;
  }
  return !1;
}, Ct = (t, c, h, S, I, $) => {
  const w = {
    initialState: c,
    updaterState: ut(
      t,
      S,
      I,
      $
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
  reactiveDeps: $,
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
  j.current = et(v) ?? null, ot(() => {
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
  }, [y]), ot(() => {
    if (a) {
      At(v, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[v];
      if (!(i && !H(i, a) || !i) && !s)
        return;
      let u = null;
      const E = q(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && U && (u = gt(`${U}-${v}-${E}`));
      let T = a, A = !1;
      const P = s ? Date.now() : 0, N = u?.lastUpdated || 0, V = u?.lastSyncedWithServer || 0;
      s && P > N ? (T = e.serverState.data, A = !0) : u && N > V && (T = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(v, a), Ct(
        v,
        a,
        T,
        nt,
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
      depsFunction: $ || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(v, r), R({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(v));
    };
  }, []);
  const nt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${v}-${r.join(".")}`;
      st.current.add(u);
    }
    const g = o.getState();
    Q(v, (u) => {
      const E = q(e) ? e(u) : e, T = `${v}-${r.join(".")}`;
      if (T) {
        let M = !1, k = g.signalDomElements.get(T);
        if ((!k || k.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), W = z(E, O);
          if (Array.isArray(W)) {
            M = !0;
            const f = `${v}-${O.join(".")}`;
            k = g.signalDomElements.get(f);
          }
        }
        if (k) {
          const O = M ? z(E, r.slice(0, -1)) : z(E, r);
          k.forEach(({ parentId: W, position: f, effect: b }) => {
            const C = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (C) {
              const _ = Array.from(C.childNodes);
              if (_[f]) {
                const x = b ? new Function("state", `return (${b})(state)`)(O) : O;
                _[f].textContent = String(x);
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
      ).filter(([k, O]) => {
        let W = k?.split(".").length;
        if (k == A.join(".") && W == A.length - 1) {
          let f = k + "." + A;
          B(k), Gt(f, O);
        }
      });
      const P = g.stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const M = yt(u, E), k = new Set(M), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          W,
          f
        ] of P.components.entries()) {
          let b = !1;
          const C = Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"];
          if (console.log("component", f), !C.includes("none")) {
            if (C.includes("all")) {
              f.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((f.paths.has(O) || f.paths.has("")) && (b = !0), !b))
              for (const _ of k) {
                let x = _;
                for (; ; ) {
                  if (f.paths.has(x)) {
                    b = !0;
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
                    ) && f.paths.has(K)) {
                      b = !0;
                      break;
                    }
                    x = K;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (b) break;
              }
            if (!b && C.includes("deps") && f.depsFunction) {
              const _ = f.depsFunction(E);
              let x = !1;
              typeof _ == "boolean" ? _ && (x = !0) : H(f.deps, _) || (f.deps = _, x = !0), x && (b = !0);
            }
            b && f.forceUpdate();
          }
        }
      }
      const N = Date.now();
      r = r.map((M, k) => {
        const O = r.slice(0, -1), W = z(E, O);
        return k === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (W.length - 1).toString() : M;
      });
      const { oldValue: V, newValue: D } = Bt(
        s.updateType,
        u,
        E,
        r
      ), F = {
        timeStamp: N,
        stateKey: v,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: V,
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
          const k = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(v, k, O);
          break;
      }
      if (Lt(v, (M) => {
        const O = [...M ?? [], F].reduce((W, f) => {
          const b = `${f.stateKey}:${JSON.stringify(f.path)}`, C = W.get(b);
          return C ? (C.timeStamp = Math.max(C.timeStamp, f.timeStamp), C.newValue = f.newValue, C.oldValue = C.oldValue ?? f.oldValue, C.updateType = f.updateType) : W.set(b, { ...f }), W;
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
        const M = g.serverState[v], k = j.current?.serverSync;
        Ht(v, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
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
      nt,
      J.current,
      U
    )
  ), o.getState().cogsStateStore[v] || Q(v, t), o.getState().initialStateGlobal[v] || pt(v, t));
  const d = vt(() => ut(
    v,
    nt,
    J.current,
    U
  ), [v, U]);
  return [Vt(v), d];
}
function ut(t, c, h, S) {
  const I = /* @__PURE__ */ new Map();
  let $ = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [m] of I)
      (m === n || m.startsWith(n + ".")) && I.delete(m);
    $++;
  }, p = {
    removeValidation: (y) => {
      y?.validationKey && B(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && B(n?.key), y?.validationKey && B(y.validationKey);
      const m = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), I.clear(), $++;
      const L = a(m, []), R = et(t), U = q(R?.localStorage?.key) ? R?.localStorage?.key(m) : R?.localStorage?.key, G = `${S}-${t}-${U}`;
      G && localStorage.removeItem(G), dt(t, L), Q(t, m);
      const v = o.getState().stateComponents.get(t);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), m;
    },
    updateInitialState: (y) => {
      I.clear(), $++;
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
                o.getState().removeValidationError(s), i.errors.forEach((u) => {
                  const E = [s, ...u.path].join(".");
                  o.getState().addValidationError(E, u.message);
                });
                const g = o.getState().stateComponents.get(t);
                g && g.components.forEach((u) => {
                  u.forceUpdate();
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
              } = e, g = X(null), [u, E] = Z({
                startIndex: 0,
                endIndex: 10
              }), T = X(i), [A, P] = Z(0);
              ot(() => o.getState().subscribeToShadowState(t, () => {
                P((b) => b + 1);
              }), [t]);
              const N = o().getNestedState(
                t,
                n
              ), V = N.length, { totalHeight: D, positions: F } = vt(() => {
                const f = o.getState().getShadowMetadata(t, n) || [];
                let b = 0;
                const C = [];
                for (let _ = 0; _ < V; _++) {
                  C[_] = b;
                  const x = f[_]?.virtualizer?.itemHeight;
                  b += x || r;
                }
                return { totalHeight: b, positions: C };
              }, [
                V,
                t,
                n.join("."),
                r,
                A
              ]), M = vt(() => {
                const f = Math.max(0, u.startIndex), b = Math.min(V, u.endIndex), C = Array.from(
                  { length: b - f },
                  (x, Y) => f + Y
                ), _ = C.map((x) => N[x]);
                return a(_, n, {
                  ...m,
                  validIndices: C
                });
              }, [u.startIndex, u.endIndex, N, V]);
              lt(() => {
                const f = g.current;
                if (!f) return;
                const b = f.scrollHeight - f.scrollTop - f.clientHeight < r, C = () => {
                  if (!f) return;
                  const { scrollTop: x, clientHeight: Y } = f;
                  let K = 0, it = V - 1;
                  for (; K <= it; ) {
                    const St = Math.floor((K + it) / 2);
                    F[St] < x ? K = St + 1 : it = St - 1;
                  }
                  const wt = Math.max(0, it - s);
                  let tt = wt;
                  const xt = x + Y;
                  for (; tt < V && F[tt] < xt; )
                    tt++;
                  tt = Math.min(V, tt + s), E({ startIndex: wt, endIndex: tt });
                }, _ = () => {
                  T.current = f.scrollHeight - f.scrollTop - f.clientHeight < 1, C();
                };
                return f.addEventListener("scroll", _, {
                  passive: !0
                }), i && (T.current || b) && (f.scrollTop = f.scrollHeight), C(), () => {
                  f.removeEventListener("scroll", _);
                };
              }, [V, F, D, i]);
              const k = Tt(
                (f = "smooth") => {
                  g.current && (T.current = !0, g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: f
                  }));
                },
                []
              ), O = Tt(
                (f, b = "smooth") => {
                  g.current && F[f] !== void 0 && (T.current = !1, g.current.scrollTo({
                    top: F[f],
                    behavior: b
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
                    transform: `translateY(${F[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: M,
                virtualizerProps: W,
                scrollToBottom: k,
                scrollToIndex: O
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, E) => e(u.item, E.item)
              ), i = s.map(({ item: u }) => u), g = {
                ...m,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(i, n, g);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, E) => e(u, E)
              ), i = s.map(({ item: u }) => u), g = {
                ...m,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(i, n, g);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (m?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const u = r[i], E = [...n, i.toString()], T = a(u, E, m);
                return e(u, T, {
                  register: () => {
                    const [, P] = Z({}), N = `${h}-${n.join(".")}-${i}`;
                    lt(() => {
                      const V = `${t}////${N}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(V, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const F = o.getState().stateComponents.get(t);
                        F && F.components.delete(V);
                      };
                    }, [t, N]);
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
              const u = [...n, g.toString()], E = a(s, u, m);
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
                const u = r[i], E = [...n, i.toString()], T = a(u, E, m), A = `${h}-${n.join(".")}-${i}`;
                return at(Zt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: E,
                  children: e(
                    u,
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
              I.clear(), $++;
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
              let u = null;
              if (!i.some((T) => {
                if (r) {
                  const P = r.every(
                    (N) => H(T[N], g[N])
                  );
                  return P && (u = T), P;
                }
                const A = H(T, g);
                return A && (u = T), A;
              }))
                w(n), mt(c, g, n, t);
              else if (s && u) {
                const T = s(u), A = i.map(
                  (P) => H(P, u) ? T : P
                );
                w(n), rt(c, A, n);
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
                ({ item: g }, u) => e(g, u)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, m);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = d().find(
                ({ item: u }) => u[e] === r
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
            rt(c, i, e), w(e);
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
            rt(c, i, d), w(d);
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
                const g = yt(e, s), u = new Set(g);
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
                      for (const N of u) {
                        if (T.paths.has(N)) {
                          A = !0;
                          break;
                        }
                        let V = N.lastIndexOf(".");
                        for (; V !== -1; ) {
                          const D = N.substring(0, V);
                          if (T.paths.has(D)) {
                            A = !0;
                            break;
                          }
                          const F = N.substring(
                            V + 1
                          );
                          if (!isNaN(Number(F))) {
                            const M = D.lastIndexOf(".");
                            if (M !== -1) {
                              const k = D.substring(
                                0,
                                M
                              );
                              if (T.paths.has(k)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          V = D.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && P.includes("deps") && T.depsFunction) {
                      const N = T.depsFunction(s);
                      let V = !1;
                      typeof N == "boolean" ? N && (V = !0) : H(T.deps, N) || (T.deps = N, V = !0), V && (A = !0);
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
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const E = u.path, T = u.message, A = [d.key, ...E].join(".");
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
                rt(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              rt(c, d, n, "");
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
        const j = [...n, l], nt = o.getState().getNestedState(t, j);
        return a(nt, j, m);
      }
    }, G = new Proxy(R, U);
    return I.set(L, {
      proxy: G,
      stateVersion: $
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
    (I, $, w, p, a) => t._mapFn(I, $, w, p, a)
  ) : null;
}
function Yt({
  proxy: t
}) {
  const c = X(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return ot(() => {
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
  const [, I] = Z({}), [$, w] = Dt(), p = X(null);
  return ot(() => {
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
  }, [t, c, h.join(".")]), /* @__PURE__ */ ht("div", { ref: $, children: S });
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
