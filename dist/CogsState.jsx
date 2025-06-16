"use client";
import { jsx as vt } from "react/jsx-runtime";
import { useState as Q, useRef as B, useEffect as nt, useLayoutEffect as dt, useMemo as yt, createElement as st, useSyncExternalStore as _t, startTransition as Mt, useCallback as Et } from "react";
import { transformStateFunc as Rt, isDeepEqual as H, isFunction as Y, getNestedValue as z, getDifferences as It, debounce as jt } from "./utility.js";
import { pushFunc as ht, updateFn as at, cutFunc as lt, ValidationWrapper as Ot, FormControlComponent as Ut } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as pt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as At } from "./store.js";
import { useCogsConfig as Ct } from "./CogsStateClient.jsx";
import { applyPatch as Dt } from "fast-json-patch";
import Lt from "react-use-measure";
function $t(t, c) {
  const h = o.getState().getInitialOptions, S = o.getState().setInitialStateOptions, I = h(t) || {};
  S(t, {
    ...I,
    ...c
  });
}
function kt({
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
function le(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const de = (t, c) => {
  let h = t;
  const [S, I] = Rt(h);
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
    const [y] = Q(a?.componentId ?? pt());
    kt({
      stateKey: p,
      options: a,
      initialOptionsPart: I
    });
    const n = o.getState().cogsStateStore[p] || S[p], m = a?.modifyState ? a.modifyState(n) : n, [W, O] = Jt(
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
    return O;
  };
  function w(p, a) {
    kt({ stateKey: p, options: a, initialOptionsPart: I }), a.localStorage && Bt(p, a), St(p);
  }
  return { useCogsState: b, setCogsOptions: w };
}, {
  setUpdaterState: ut,
  setState: K,
  getInitialOptions: et,
  getKeyState: Vt,
  getValidationErrors: Wt,
  setStateLog: Gt,
  updateInitialStateGlobal: wt,
  addValidationError: Ht,
  removeValidationError: J,
  setServerSyncActions: zt
} = o.getState(), bt = (t, c, h, S, I) => {
  h?.log && console.log(
    "saving to localstorage",
    c,
    h.localStorage?.key,
    S
  );
  const b = Y(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (b && S) {
    const w = `${S}-${c}-${b}`;
    let p;
    try {
      p = ft(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? p
    }, y = Ft.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(y.json)
    );
  }
}, ft = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Bt = (t, c) => {
  const h = o.getState().cogsStateStore[t], { sessionId: S } = Ct(), I = Y(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (I && S) {
    const b = ft(
      `${S}-${t}-${I}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return K(t, b.state), St(t), !0;
  }
  return !1;
}, xt = (t, c, h, S, I, b) => {
  const w = {
    initialState: c,
    updaterState: gt(
      t,
      S,
      I,
      b
    ),
    state: h
  };
  wt(t, w.initialState), ut(t, w.updaterState), K(t, w.state);
}, St = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || h.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((S) => S());
  });
}, ue = (t, c) => {
  const h = o.getState().stateComponents.get(t);
  if (h) {
    const S = `${t}////${c}`, I = h.components.get(S);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, qt = (t, c, h, S) => {
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
function Jt(t, {
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
  const [W, O] = Q({}), { sessionId: U } = Ct();
  let G = !c;
  const [v] = Q(c ?? pt()), l = o.getState().stateLog[v], it = B(/* @__PURE__ */ new Set()), Z = B(p ?? pt()), R = B(
    null
  );
  R.current = et(v) ?? null, nt(() => {
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
      $t(v, {
        initialState: a
      });
      const e = R.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[v];
      if (!(i && !H(i, a) || !i) && !s)
        return;
      let g = null;
      const E = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && U && (g = ft(`${U}-${v}-${E}`));
      let T = a, $ = !1;
      const P = s ? Date.now() : 0, C = g?.lastUpdated || 0, A = g?.lastSyncedWithServer || 0;
      s && P > C ? (T = e.serverState.data, $ = !0) : g && C > A && (T = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(v, a), xt(
        v,
        a,
        T,
        rt,
        Z.current,
        U
      ), $ && E && U && bt(T, v, e, U, Date.now()), St(v), (Array.isArray(w) ? w : [w || "component"]).includes("none") || O({});
    }
  }, [
    a,
    m?.status,
    m?.data,
    ...n || []
  ]), dt(() => {
    G && $t(v, {
      serverSync: h,
      formElements: I,
      initialState: a,
      localStorage: S,
      middleware: R.current?.middleware
    });
    const e = `${v}////${Z.current}`, r = o.getState().stateComponents.get(v) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(v, r), O({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(v));
    };
  }, []);
  const rt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const g = `${v}-${r.join(".")}`;
      it.current.add(g);
    }
    const u = o.getState();
    K(v, (g) => {
      const E = Y(e) ? e(g) : e, T = `${v}-${r.join(".")}`;
      if (T) {
        let M = !1, N = u.signalDomElements.get(T);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const j = r.slice(0, -1), L = z(E, j);
          if (Array.isArray(L)) {
            M = !0;
            const f = `${v}-${j.join(".")}`;
            N = u.signalDomElements.get(f);
          }
        }
        if (N) {
          const j = M ? z(E, r.slice(0, -1)) : z(E, r);
          N.forEach(({ parentId: L, position: f, effect: k }) => {
            const V = document.querySelector(
              `[data-parent-id="${L}"]`
            );
            if (V) {
              const _ = Array.from(V.childNodes);
              if (_[f]) {
                const x = k ? new Function("state", `return (${k})(state)`)(j) : j;
                _[f].textContent = String(x);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), s.updateType === "update" && (i || R.current?.validation?.key) && r && J(
        (i || R.current?.validation?.key) + "." + r.join(".")
      );
      const $ = r.slice(0, r.length - 1);
      s.updateType === "cut" && R.current?.validation?.key && J(
        R.current?.validation?.key + "." + $.join(".")
      ), s.updateType === "insert" && R.current?.validation?.key && Wt(
        R.current?.validation?.key + "." + $.join(".")
      ).filter(([N, j]) => {
        let L = N?.split(".").length;
        if (N == $.join(".") && L == $.length - 1) {
          let f = N + "." + $;
          J(N), Ht(f, j);
        }
      });
      const P = u.stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const M = It(g, E), N = new Set(M), j = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          L,
          f
        ] of P.components.entries()) {
          let k = !1;
          const V = Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"];
          if (console.log("component", f), !V.includes("none")) {
            if (V.includes("all")) {
              f.forceUpdate();
              continue;
            }
            if (V.includes("component") && ((f.paths.has(j) || f.paths.has("")) && (k = !0), !k))
              for (const _ of N) {
                let x = _;
                for (; ; ) {
                  if (f.paths.has(x)) {
                    k = !0;
                    break;
                  }
                  const q = x.lastIndexOf(".");
                  if (q !== -1) {
                    const X = x.substring(
                      0,
                      q
                    );
                    if (!isNaN(
                      Number(x.substring(q + 1))
                    ) && f.paths.has(X)) {
                      k = !0;
                      break;
                    }
                    x = X;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (k) break;
              }
            if (!k && V.includes("deps") && f.depsFunction) {
              const _ = f.depsFunction(E);
              let x = !1;
              typeof _ == "boolean" ? _ && (x = !0) : H(f.deps, _) || (f.deps = _, x = !0), x && (k = !0);
            }
            k && f.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((M, N) => {
        const j = r.slice(0, -1), L = z(E, j);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (L.length - 1).toString() : M;
      });
      const { oldValue: A, newValue: F } = qt(
        s.updateType,
        g,
        E,
        r
      ), D = {
        timeStamp: C,
        stateKey: v,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: A,
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
          const N = r.slice(0, -1), j = parseInt(r[r.length - 1]);
          u.removeShadowArrayElement(v, N, j);
          break;
      }
      if (Gt(v, (M) => {
        const j = [...M ?? [], D].reduce((L, f) => {
          const k = `${f.stateKey}:${JSON.stringify(f.path)}`, V = L.get(k);
          return V ? (V.timeStamp = Math.max(V.timeStamp, f.timeStamp), V.newValue = f.newValue, V.oldValue = V.oldValue ?? f.oldValue, V.updateType = f.updateType) : L.set(k, { ...f }), L;
        }, /* @__PURE__ */ new Map());
        return Array.from(j.values());
      }), bt(
        E,
        v,
        R.current,
        U
      ), R.current?.middleware && R.current.middleware({
        updateLog: l,
        update: D
      }), R.current?.serverSync) {
        const M = u.serverState[v], N = R.current?.serverSync;
        zt(v, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[v] || (ut(
    v,
    gt(
      v,
      rt,
      Z.current,
      U
    )
  ), o.getState().cogsStateStore[v] || K(v, t), o.getState().initialStateGlobal[v] || wt(v, t));
  const d = yt(() => gt(
    v,
    rt,
    Z.current,
    U
  ), [v, U]);
  return [Vt(v), d];
}
function gt(t, c, h, S) {
  const I = /* @__PURE__ */ new Map();
  let b = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [m] of I)
      (m === n || m.startsWith(n + ".")) && I.delete(m);
    b++;
  }, p = {
    removeValidation: (y) => {
      y?.validationKey && J(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), y?.validationKey && J(y.validationKey);
      const m = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), I.clear(), b++;
      const W = a(m, []), O = et(t), U = Y(O?.localStorage?.key) ? O?.localStorage?.key(m) : O?.localStorage?.key, G = `${S}-${t}-${U}`;
      G && localStorage.removeItem(G), ut(t, W), K(t, m);
      const v = o.getState().stateComponents.get(t);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), m;
    },
    updateInitialState: (y) => {
      I.clear(), b++;
      const n = gt(
        t,
        c,
        h,
        S
      ), m = o.getState().initialStateGlobal[t], W = et(t), O = Y(W?.localStorage?.key) ? W?.localStorage?.key(m) : W?.localStorage?.key, U = `${S}-${t}-${O}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Mt(() => {
        wt(t, y), o.getState().initializeShadowState(t, y), ut(t, n), K(t, y);
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
    const W = n.map(String).join(".");
    I.get(W);
    const O = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(p).forEach((v) => {
      O[v] = p[v];
    });
    const U = {
      apply(v, l, it) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(v, l) {
        m?.validIndices && !Array.isArray(y) && (m = { ...m, validIndices: void 0 });
        const it = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !it.has(l)) {
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
            const d = o.getState().initialStateGlobal[t], e = et(t), r = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${S}-${t}-${r}`;
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
              } = e, u = B(null), [g, E] = Q({
                startIndex: 0,
                endIndex: 10
              }), T = B(i), [$, P] = Q(0);
              nt(() => o.getState().subscribeToShadowState(t, () => {
                P((k) => k + 1);
              }), [t]);
              const C = o().getNestedState(
                t,
                n
              ), A = C.length, { totalHeight: F, positions: D } = yt(() => {
                const f = o.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const V = [];
                for (let _ = 0; _ < A; _++) {
                  V[_] = k;
                  const x = f[_]?.virtualizer?.itemHeight;
                  k += x || r;
                }
                return { totalHeight: k, positions: V };
              }, [
                A,
                t,
                n.join("."),
                r,
                $
              ]), M = yt(() => {
                const f = Math.max(0, g.startIndex), k = Math.min(A, g.endIndex), V = Array.from(
                  { length: k - f },
                  (x, q) => f + q
                ), _ = V.map((x) => C[x]);
                return a(_, n, {
                  ...m,
                  validIndices: V
                });
              }, [g.startIndex, g.endIndex, C, A]);
              nt(() => {
                if (i && A > 0 && u.current) {
                  const f = u.current, k = Math.ceil(
                    f.clientHeight / r
                  );
                  E({
                    startIndex: Math.max(
                      0,
                      A - k - s
                    ),
                    endIndex: A
                  }), setTimeout(() => {
                    f.scrollTop = f.scrollHeight;
                  }, 100);
                }
              }, [A]), dt(() => {
                const f = u.current;
                if (!f) return;
                let k;
                const V = () => {
                  if (!f) return;
                  const { scrollTop: X } = f;
                  let ot = 0, ct = A - 1;
                  for (; ot <= ct; ) {
                    const mt = Math.floor((ot + ct) / 2);
                    D[mt] < X ? ot = mt + 1 : ct = mt - 1;
                  }
                  const Tt = Math.max(0, ct - s);
                  let tt = Tt;
                  const Pt = X + f.clientHeight;
                  for (; tt < A && D[tt] < Pt; )
                    tt++;
                  tt = Math.min(A, tt + s), E({ startIndex: Tt, endIndex: tt });
                }, _ = () => {
                  T.current = f.scrollHeight - f.scrollTop - f.clientHeight < 1, V();
                };
                f.addEventListener("scroll", _, {
                  passive: !0
                });
                const x = B(!1), q = B(0);
                if (i) {
                  const X = !x.current && A > 0, ot = x.current && A > q.current;
                  k = setTimeout(() => {
                    console.log("totalHeight", F), T.current && f.scrollTo({
                      top: 999999999,
                      behavior: ot ? "smooth" : "auto"
                      // Only smooth for NEW items after initial load
                    });
                  }, 200), X && (x.current = !0);
                }
                return q.current = A, V(), () => {
                  clearTimeout(k), f.removeEventListener("scroll", _);
                };
              }, [A, D, F, i]);
              const N = Et(
                (f = "smooth") => {
                  u.current && (T.current = !0, u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: f
                  }));
                },
                []
              ), j = Et(
                (f, k = "smooth") => {
                  u.current && D[f] !== void 0 && (T.current = !1, u.current.scrollTo({
                    top: D[f],
                    behavior: k
                  }));
                },
                [D]
              ), L = {
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
                virtualizerProps: L,
                scrollToBottom: N,
                scrollToIndex: j
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
                    const [, P] = Q({}), C = `${h}-${n.join(".")}-${i}`;
                    dt(() => {
                      const A = `${t}////${C}`, F = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(A, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, F), () => {
                        const D = o.getState().stateComponents.get(t);
                        D && D.components.delete(A);
                      };
                    }, [t, C]);
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
            return (e) => st(Yt, {
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
                const g = r[i], E = [...n, i.toString()], T = a(g, E, m), $ = `${h}-${n.join(".")}-${i}`;
                return st(Xt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: $,
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
            return (e) => (w(n), ht(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), u = Y(e) ? e(i) : e;
              let g = null;
              if (!i.some((T) => {
                if (r) {
                  const P = r.every(
                    (C) => H(T[C], u[C])
                  );
                  return P && (g = T), P;
                }
                const $ = H(T, u);
                return $ && (g = T), $;
              }))
                w(n), ht(c, u, n, t);
              else if (s && g) {
                const T = s(g), $ = i.map(
                  (P) => H(P, g) ? T : P
                );
                w(n), at(c, $, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return w(n), lt(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < y.length; r++)
                y[r] === e && lt(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = y.findIndex((s) => s === e);
              r > -1 ? lt(c, n, t, r) : ht(c, e, n, t);
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
        const Z = n[n.length - 1];
        if (!isNaN(Number(Z))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => lt(
              c,
              d,
              t,
              Number(Z)
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
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ft(S + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            at(c, i, e), w(e);
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
            at(c, i, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Dt(e, d).newDocument;
              xt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                h,
                S
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const u = It(e, s), g = new Set(u);
                for (const [
                  E,
                  T
                ] of i.components.entries()) {
                  let $ = !1;
                  const P = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (T.paths.has("") && ($ = !0), !$))
                      for (const C of g) {
                        if (T.paths.has(C)) {
                          $ = !0;
                          break;
                        }
                        let A = C.lastIndexOf(".");
                        for (; A !== -1; ) {
                          const F = C.substring(0, A);
                          if (T.paths.has(F)) {
                            $ = !0;
                            break;
                          }
                          const D = C.substring(
                            A + 1
                          );
                          if (!isNaN(Number(D))) {
                            const M = F.lastIndexOf(".");
                            if (M !== -1) {
                              const N = F.substring(
                                0,
                                M
                              );
                              if (T.paths.has(N)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          A = F.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && P.includes("deps") && T.depsFunction) {
                      const C = T.depsFunction(s);
                      let A = !1;
                      typeof C == "boolean" ? C && (A = !0) : H(T.deps, C) || (T.deps = C, A = !0), A && ($ = !0);
                    }
                    $ && T.forceUpdate();
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
                s && s.length > 0 && s.forEach(([u]) => {
                  u && u.startsWith(d.key) && J(u);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((g) => {
                  const E = g.path, T = g.message, $ = [d.key, ...E].join(".");
                  e($, T);
                }), St(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => At.getState().getFormRefsByStateKey(t);
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
          return () => At.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ vt(
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
                at(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              at(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ vt(
            Ut,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const R = [...n, l], rt = o.getState().getNestedState(t, R);
        return a(rt, R, m);
      }
    }, G = new Proxy(O, U);
    return I.set(W, {
      proxy: G,
      stateVersion: b
    }), G;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Nt(t) {
  return st(Zt, { proxy: t });
}
function Yt({
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
function Zt({
  proxy: t
}) {
  const c = B(null), h = `${t._stateKey}-${t._path.join(".")}`;
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
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), m = n;
      }
    else
      m = n;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const W = document.createTextNode(String(m));
    S.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function ge(t) {
  const c = _t(
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
  return st("text", {}, String(c));
}
function Xt({
  stateKey: t,
  itemComponentId: c,
  itemPath: h,
  children: S
}) {
  const [, I] = Q({}), [b, w] = Lt(), p = B(null);
  return nt(() => {
    w.height > 0 && w.height !== p.current && (p.current = w.height, o.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, h]), dt(() => {
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
  }, [t, c, h.join(".")]), /* @__PURE__ */ vt("div", { ref: b, children: S });
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
