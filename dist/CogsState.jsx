"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as X, useRef as Q, useEffect as nt, useLayoutEffect as ct, useMemo as ht, createElement as at, useSyncExternalStore as xt, startTransition as Pt, useCallback as wt } from "react";
import { transformStateFunc as _t, isDeepEqual as H, isFunction as J, getNestedValue as z, getDifferences as vt, debounce as Mt } from "./utility.js";
import { pushFunc as St, updateFn as ot, cutFunc as it, ValidationWrapper as jt, FormControlComponent as Ot } from "./Functions.jsx";
import Rt from "superjson";
import { v4 as yt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Tt } from "./store.js";
import { useCogsConfig as bt } from "./CogsStateClient.jsx";
import { applyPatch as Ut } from "fast-json-patch";
import Ft from "react-use-measure";
function Et(t, c) {
  const h = o.getState().getInitialOptions, S = o.getState().setInitialStateOptions, I = h(t) || {};
  S(t, {
    ...I,
    ...c
  });
}
function At({
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
function ie(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const ce = (t, c) => {
  let h = t;
  const [S, I] = _t(h);
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
    const [y] = X(a?.componentId ?? yt());
    At({
      stateKey: p,
      options: a,
      initialOptionsPart: I
    });
    const n = o.getState().cogsStateStore[p] || S[p], m = a?.modifyState ? a.modifyState(n) : n, [L, R] = Bt(
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
    At({ stateKey: p, options: a, initialOptionsPart: I }), a.localStorage && Ht(p, a), gt(p);
  }
  return { useCogsState: b, setCogsOptions: w };
}, {
  setUpdaterState: lt,
  setState: K,
  getInitialOptions: et,
  getKeyState: Nt,
  getValidationErrors: Dt,
  setStateLog: Wt,
  updateInitialStateGlobal: It,
  addValidationError: Lt,
  removeValidationError: q,
  setServerSyncActions: Gt
} = o.getState(), $t = (t, c, h, S, I) => {
  h?.log && console.log(
    "saving to localstorage",
    c,
    h.localStorage?.key,
    S
  );
  const b = J(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (b && S) {
    const w = `${S}-${c}-${b}`;
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
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Ht = (t, c) => {
  const h = o.getState().cogsStateStore[t], { sessionId: S } = bt(), I = J(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (I && S) {
    const b = ut(
      `${S}-${t}-${I}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return K(t, b.state), gt(t), !0;
  }
  return !1;
}, Vt = (t, c, h, S, I, b) => {
  const w = {
    initialState: c,
    updaterState: dt(
      t,
      S,
      I,
      b
    ),
    state: h
  };
  It(t, w.initialState), lt(t, w.updaterState), K(t, w.state);
}, gt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || h.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((S) => S());
  });
}, le = (t, c) => {
  const h = o.getState().stateComponents.get(t);
  if (h) {
    const S = `${t}////${c}`, I = h.components.get(S);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, zt = (t, c, h, S) => {
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
function Bt(t, {
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
  const [L, R] = X({}), { sessionId: U } = bt();
  let G = !c;
  const [v] = X(c ?? yt()), l = o.getState().stateLog[v], st = Q(/* @__PURE__ */ new Set()), Y = Q(p ?? yt()), j = Q(
    null
  );
  j.current = et(v) ?? null, nt(() => {
    if (y && y.stateKey === v && y.path?.[0]) {
      K(v, (r) => ({
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
      Et(v, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[v];
      if (!(i && !H(i, a) || !i) && !s)
        return;
      let g = null;
      const E = J(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && U && (g = ut(`${U}-${v}-${E}`));
      let T = a, A = !1;
      const P = s ? Date.now() : 0, V = g?.lastUpdated || 0, k = g?.lastSyncedWithServer || 0;
      s && P > V ? (T = e.serverState.data, A = !0) : g && V > k && (T = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(v, a), Vt(
        v,
        a,
        T,
        rt,
        Y.current,
        U
      ), A && E && U && $t(T, v, e, U, Date.now()), gt(v), (Array.isArray(w) ? w : [w || "component"]).includes("none") || R({});
    }
  }, [
    a,
    m?.status,
    m?.data,
    ...n || []
  ]), ct(() => {
    G && Et(v, {
      serverSync: h,
      formElements: I,
      initialState: a,
      localStorage: S,
      middleware: j.current?.middleware
    });
    const e = `${v}////${Y.current}`, r = o.getState().stateComponents.get(v) || {
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
      const g = `${v}-${r.join(".")}`;
      st.current.add(g);
    }
    const u = o.getState();
    K(v, (g) => {
      const E = J(e) ? e(g) : e, T = `${v}-${r.join(".")}`;
      if (T) {
        let M = !1, N = u.signalDomElements.get(T);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), W = z(E, O);
          if (Array.isArray(W)) {
            M = !0;
            const f = `${v}-${O.join(".")}`;
            N = u.signalDomElements.get(f);
          }
        }
        if (N) {
          const O = M ? z(E, r.slice(0, -1)) : z(E, r);
          N.forEach(({ parentId: W, position: f, effect: $ }) => {
            const C = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (C) {
              const _ = Array.from(C.childNodes);
              if (_[f]) {
                const x = $ ? new Function("state", `return (${$})(state)`)(O) : O;
                _[f].textContent = String(x);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && r && q(
        (i || j.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && q(
        j.current?.validation?.key + "." + A.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Dt(
        j.current?.validation?.key + "." + A.join(".")
      ).filter(([N, O]) => {
        let W = N?.split(".").length;
        if (N == A.join(".") && W == A.length - 1) {
          let f = N + "." + A;
          q(N), Lt(f, O);
        }
      });
      const P = u.stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const M = vt(g, E), N = new Set(M), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          W,
          f
        ] of P.components.entries()) {
          let $ = !1;
          const C = Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"];
          if (console.log("component", f), !C.includes("none")) {
            if (C.includes("all")) {
              f.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((f.paths.has(O) || f.paths.has("")) && ($ = !0), !$))
              for (const _ of N) {
                let x = _;
                for (; ; ) {
                  if (f.paths.has(x)) {
                    $ = !0;
                    break;
                  }
                  const B = x.lastIndexOf(".");
                  if (B !== -1) {
                    const Z = x.substring(
                      0,
                      B
                    );
                    if (!isNaN(
                      Number(x.substring(B + 1))
                    ) && f.paths.has(Z)) {
                      $ = !0;
                      break;
                    }
                    x = Z;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if ($) break;
              }
            if (!$ && C.includes("deps") && f.depsFunction) {
              const _ = f.depsFunction(E);
              let x = !1;
              typeof _ == "boolean" ? _ && (x = !0) : H(f.deps, _) || (f.deps = _, x = !0), x && ($ = !0);
            }
            $ && f.forceUpdate();
          }
        }
      }
      const V = Date.now();
      r = r.map((M, N) => {
        const O = r.slice(0, -1), W = z(E, O);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (W.length - 1).toString() : M;
      });
      const { oldValue: k, newValue: F } = zt(
        s.updateType,
        g,
        E,
        r
      ), D = {
        timeStamp: V,
        stateKey: v,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: k,
        newValue: F
      };
      switch (s.updateType) {
        case "update":
          u.updateShadowAtPath(v, r, E);
          break;
        case "insert":
          const M = r.slice(0, -1);
          u.insertShadowArrayElement(v, M, F);
          break;
        case "cut":
          const N = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          u.removeShadowArrayElement(v, N, O);
          break;
      }
      if (Wt(v, (M) => {
        const O = [...M ?? [], D].reduce((W, f) => {
          const $ = `${f.stateKey}:${JSON.stringify(f.path)}`, C = W.get($);
          return C ? (C.timeStamp = Math.max(C.timeStamp, f.timeStamp), C.newValue = f.newValue, C.oldValue = C.oldValue ?? f.oldValue, C.updateType = f.updateType) : W.set($, { ...f }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), $t(
        E,
        v,
        j.current,
        U
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: D
      }), j.current?.serverSync) {
        const M = u.serverState[v], N = j.current?.serverSync;
        Gt(v, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[v] || (lt(
    v,
    dt(
      v,
      rt,
      Y.current,
      U
    )
  ), o.getState().cogsStateStore[v] || K(v, t), o.getState().initialStateGlobal[v] || It(v, t));
  const d = ht(() => dt(
    v,
    rt,
    Y.current,
    U
  ), [v, U]);
  return [Nt(v), d];
}
function dt(t, c, h, S) {
  const I = /* @__PURE__ */ new Map();
  let b = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [m] of I)
      (m === n || m.startsWith(n + ".")) && I.delete(m);
    b++;
  }, p = {
    removeValidation: (y) => {
      y?.validationKey && q(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && q(n?.key), y?.validationKey && q(y.validationKey);
      const m = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), I.clear(), b++;
      const L = a(m, []), R = et(t), U = J(R?.localStorage?.key) ? R?.localStorage?.key(m) : R?.localStorage?.key, G = `${S}-${t}-${U}`;
      G && localStorage.removeItem(G), lt(t, L), K(t, m);
      const v = o.getState().stateComponents.get(t);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), m;
    },
    updateInitialState: (y) => {
      I.clear(), b++;
      const n = dt(
        t,
        c,
        h,
        S
      ), m = o.getState().initialStateGlobal[t], L = et(t), R = J(L?.localStorage?.key) ? L?.localStorage?.key(m) : L?.localStorage?.key, U = `${S}-${t}-${R}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Pt(() => {
        It(t, y), o.getState().initializeShadowState(t, y), lt(t, n), K(t, y);
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
      return !!(y && H(y, Nt(t)));
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
              for (const u of r.paths)
                if (s.startsWith(u) && (s === u || s[u.length] === ".")) {
                  i = !1;
                  break;
                }
              i && r.paths.add(s);
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
              const i = await e.action(r);
              if (i && !i.success && i.errors && s) {
                o.getState().removeValidationError(s), i.errors.forEach((g) => {
                  const E = [s, ...g.path].join(".");
                  o.getState().addValidationError(E, g.message);
                });
                const u = o.getState().stateComponents.get(t);
                u && u.components.forEach((g) => {
                  g.forceUpdate();
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
            const d = o.getState().initialStateGlobal[t], e = et(t), r = J(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${S}-${t}-${r}`;
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
              } = e, u = Q(null), [g, E] = X({
                startIndex: 0,
                endIndex: 10
              }), T = Q(i), [A, P] = X(0);
              nt(() => o.getState().subscribeToShadowState(t, () => {
                P(($) => $ + 1);
              }), [t]);
              const V = o().getNestedState(
                t,
                n
              ), k = V.length, { totalHeight: F, positions: D } = ht(() => {
                const f = o.getState().getShadowMetadata(t, n) || [];
                let $ = 0;
                const C = [];
                for (let _ = 0; _ < k; _++) {
                  C[_] = $;
                  const x = f[_]?.virtualizer?.itemHeight;
                  $ += x || r;
                }
                return { totalHeight: $, positions: C };
              }, [
                k,
                t,
                n.join("."),
                r,
                A
              ]), M = ht(() => {
                const f = Math.max(0, g.startIndex), $ = Math.min(k, g.endIndex), C = Array.from(
                  { length: $ - f },
                  (x, B) => f + B
                ), _ = C.map((x) => V[x]);
                return a(_, n, {
                  ...m,
                  validIndices: C
                });
              }, [g.startIndex, g.endIndex, V, k]);
              nt(() => {
                if (i && k > 0 && u.current) {
                  const f = u.current, $ = Math.ceil(
                    f.clientHeight / r
                  );
                  E({
                    startIndex: Math.max(
                      0,
                      k - $ - s
                    ),
                    endIndex: k
                  }), setTimeout(() => {
                    f.scrollTop = f.scrollHeight;
                  }, 100);
                }
              }, [k]), ct(() => {
                const f = u.current;
                if (!f) return;
                let $;
                const C = () => {
                  if (!f) return;
                  const { scrollTop: x } = f;
                  let B = 0, Z = k - 1;
                  for (; B <= Z; ) {
                    const ft = Math.floor((B + Z) / 2);
                    D[ft] < x ? B = ft + 1 : Z = ft - 1;
                  }
                  const pt = Math.max(0, Z - s);
                  let tt = pt;
                  const Ct = x + f.clientHeight;
                  for (; tt < k && D[tt] < Ct; )
                    tt++;
                  tt = Math.min(k, tt + s), E({ startIndex: pt, endIndex: tt });
                }, _ = () => {
                  T.current = f.scrollHeight - f.scrollTop - f.clientHeight < 1, C();
                };
                return f.addEventListener("scroll", _, {
                  passive: !0
                }), i && ($ = setTimeout(() => {
                  console.log("totalHeight", F), T.current && f.scrollTo({
                    top: 999999999,
                    behavior: "auto"
                    // ALWAYS 'auto' for an instant, correct jump.
                  });
                }, 1e3)), C(), () => {
                  clearTimeout($), f.removeEventListener("scroll", _);
                };
              }, [k, D, F, i]);
              const N = wt(
                (f = "smooth") => {
                  u.current && (T.current = !0, u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: f
                  }));
                },
                []
              ), O = wt(
                (f, $ = "smooth") => {
                  u.current && D[f] !== void 0 && (T.current = !1, u.current.scrollTo({
                    top: D[f],
                    behavior: $
                  }));
                },
                [D]
              ), W = {
                outer: {
                  ref: u,
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
                    transform: `translateY(${D[g.startIndex] || 0}px)`
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
                (g, E) => e(g.item, E.item)
              ), i = s.map(({ item: g }) => g), u = {
                ...m,
                validIndices: s.map(
                  ({ originalIndex: g }) => g
                )
              };
              return a(i, n, u);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: g }, E) => e(g, E)
              ), i = s.map(({ item: g }) => g), u = {
                ...m,
                validIndices: s.map(
                  ({ originalIndex: g }) => g
                )
              };
              return a(i, n, u);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (m?.validIndices || Array.from({ length: r.length }, (i, u) => u)).map((i, u) => {
                const g = r[i], E = [...n, i.toString()], T = a(g, E, m);
                return e(g, T, {
                  register: () => {
                    const [, P] = X({}), V = `${h}-${n.join(".")}-${i}`;
                    ct(() => {
                      const k = `${t}////${V}`, F = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(k, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, F), () => {
                        const D = o.getState().stateComponents.get(t);
                        D && D.components.delete(k);
                      };
                    }, [t, V]);
                  },
                  index: u,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => y.map((s, i) => {
              let u;
              m?.validIndices && m.validIndices[i] !== void 0 ? u = m.validIndices[i] : u = i;
              const g = [...n, u.toString()], E = a(s, g, m);
              return e(
                s,
                E,
                i,
                y,
                a(y, n, m)
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
              return Array.isArray(r) ? (m?.validIndices || Array.from({ length: r.length }, (i, u) => u)).map((i, u) => {
                const g = r[i], E = [...n, i.toString()], T = a(g, E, m), A = `${h}-${n.join(".")}-${i}`;
                return at(Yt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: E,
                  children: e(
                    g,
                    T,
                    u,
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
            return (e) => (w(n), St(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), u = J(e) ? e(i) : e;
              let g = null;
              if (!i.some((T) => {
                if (r) {
                  const P = r.every(
                    (V) => H(T[V], u[V])
                  );
                  return P && (g = T), P;
                }
                const A = H(T, u);
                return A && (g = T), A;
              }))
                w(n), St(c, u, n, t);
              else if (s && g) {
                const T = s(g), A = i.map(
                  (P) => H(P, g) ? T : P
                );
                w(n), ot(c, A, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return w(n), it(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < y.length; r++)
                y[r] === e && it(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = y.findIndex((s) => s === e);
              r > -1 ? it(c, n, t, r) : St(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: u }, g) => e(u, g)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, m);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = d().find(
                ({ item: g }) => g[e] === r
              );
              if (!i) return;
              const u = [...n, i.originalIndex.toString()];
              return a(i.item, u, m);
            };
        }
        const Y = n[n.length - 1];
        if (!isNaN(Number(Y))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => it(
              c,
              d,
              t,
              Number(Y)
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
          return (d) => ut(S + "-" + t + "-" + d);
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
              const e = o.getState().cogsStateStore[t], s = Ut(e, d).newDocument;
              Vt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                h,
                S
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const u = vt(e, s), g = new Set(u);
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
                      for (const V of g) {
                        if (T.paths.has(V)) {
                          A = !0;
                          break;
                        }
                        let k = V.lastIndexOf(".");
                        for (; k !== -1; ) {
                          const F = V.substring(0, k);
                          if (T.paths.has(F)) {
                            A = !0;
                            break;
                          }
                          const D = V.substring(
                            k + 1
                          );
                          if (!isNaN(Number(D))) {
                            const M = F.lastIndexOf(".");
                            if (M !== -1) {
                              const N = F.substring(
                                0,
                                M
                              );
                              if (T.paths.has(N)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          k = F.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && P.includes("deps") && T.depsFunction) {
                      const V = T.depsFunction(s);
                      let k = !1;
                      typeof V == "boolean" ? V && (k = !0) : H(T.deps, V) || (T.deps = V, k = !0), k && (A = !0);
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
              q(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([u]) => {
                  u && u.startsWith(d.key) && q(u);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((g) => {
                  const E = g.path, T = g.message, A = [d.key, ...E].join(".");
                  e(A, T);
                }), gt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
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
              Mt(() => {
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
          return (d, e) => /* @__PURE__ */ mt(
            Ot,
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
function kt(t) {
  return at(Jt, { proxy: t });
}
function qt({
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
function Jt({
  proxy: t
}) {
  const c = Q(null), h = `${t._stateKey}-${t._path.join(".")}`;
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
function de(t) {
  const c = xt(
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
function Yt({
  stateKey: t,
  itemComponentId: c,
  itemPath: h,
  children: S
}) {
  const [, I] = X({}), [b, w] = Ft(), p = Q(null);
  return nt(() => {
    w.height > 0 && w.height !== p.current && (p.current = w.height, o.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, h]), ct(() => {
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
  }, [t, c, h.join(".")]), /* @__PURE__ */ mt("div", { ref: b, children: S });
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
