"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as et, useRef as z, useEffect as lt, useLayoutEffect as dt, useMemo as It, createElement as ot, useSyncExternalStore as _t, startTransition as Mt, useCallback as Et } from "react";
import { transformStateFunc as jt, isDeepEqual as H, isFunction as Y, getNestedValue as B, getDifferences as pt, debounce as Ot } from "./utility.js";
import { pushFunc as vt, updateFn as rt, cutFunc as ct, ValidationWrapper as Rt, FormControlComponent as Ft } from "./Functions.jsx";
import Ut from "superjson";
import { v4 as wt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Tt } from "./store.js";
import { useCogsConfig as Ct } from "./CogsStateClient.jsx";
import { applyPatch as Dt } from "fast-json-patch";
import Gt from "react-use-measure";
function $t(t, c) {
  const h = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, I = h(t) || {};
  f(t, {
    ...I,
    ...c
  });
}
function kt({
  stateKey: t,
  options: c,
  initialOptionsPart: h
}) {
  const f = tt(t) || {}, I = h[t] || {}, $ = o.getState().setInitialStateOptions, w = { ...I, ...f };
  let p = !1;
  if (c)
    for (const a in c)
      w.hasOwnProperty(a) ? (a == "localStorage" && c[a] && w[a].key !== c[a]?.key && (p = !0, w[a] = c[a]), a == "initialState" && c[a] && w[a] !== c[a] && // Different references
      !H(w[a], c[a]) && (p = !0, w[a] = c[a])) : (p = !0, w[a] = c[a]);
  p && $(t, w);
}
function le(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const de = (t, c) => {
  let h = t;
  const [f, I] = jt(h);
  (Object.keys(I).length > 0 || c && Object.keys(c).length > 0) && Object.keys(I).forEach((p) => {
    I[p] = I[p] || {}, I[p].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...I[p].formElements || {}
      // State-specific overrides
    }, tt(p) || o.getState().setInitialStateOptions(p, I[p]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const $ = (p, a) => {
    const [y] = et(a?.componentId ?? wt());
    kt({
      stateKey: p,
      options: a,
      initialOptionsPart: I
    });
    const n = o.getState().cogsStateStore[p] || f[p], S = a?.modifyState ? a.modifyState(n) : n, [W, R] = Jt(
      S,
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
    kt({ stateKey: p, options: a, initialOptionsPart: I }), a.localStorage && zt(p, a), St(p);
  }
  return { useCogsState: $, setCogsOptions: w };
}, {
  setUpdaterState: ut,
  setState: K,
  getInitialOptions: tt,
  getKeyState: Vt,
  getValidationErrors: Wt,
  setStateLog: Lt,
  updateInitialStateGlobal: At,
  addValidationError: Ht,
  removeValidationError: J,
  setServerSyncActions: Bt
} = o.getState(), Nt = (t, c, h, f, I) => {
  h?.log && console.log(
    "saving to localstorage",
    c,
    h.localStorage?.key,
    f
  );
  const $ = Y(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if ($ && f) {
    const w = `${f}-${c}-${$}`;
    let p;
    try {
      p = ft(w)?.lastSyncedWithServer;
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
}, ft = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, zt = (t, c) => {
  const h = o.getState().cogsStateStore[t], { sessionId: f } = Ct(), I = Y(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (I && f) {
    const $ = ft(
      `${f}-${t}-${I}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return K(t, $.state), St(t), !0;
  }
  return !1;
}, xt = (t, c, h, f, I, $) => {
  const w = {
    initialState: c,
    updaterState: gt(
      t,
      f,
      I,
      $
    ),
    state: h
  };
  At(t, w.initialState), ut(t, w.updaterState), K(t, w.state);
}, St = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, ue = (t, c) => {
  const h = o.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${c}`, I = h.components.get(f);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, qt = (t, c, h, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(c, f),
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
        oldValue: B(c, f),
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
  localStorage: f,
  formElements: I,
  reactiveDeps: $,
  reactiveType: w,
  componentId: p,
  initialState: a,
  syncUpdate: y,
  dependencies: n,
  serverState: S
} = {}) {
  const [W, R] = et({}), { sessionId: F } = Ct();
  let L = !c;
  const [v] = et(c ?? wt()), l = o.getState().stateLog[v], at = z(/* @__PURE__ */ new Set()), Z = z(p ?? wt()), j = z(
    null
  );
  j.current = tt(v) ?? null, lt(() => {
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
  }, [y]), lt(() => {
    if (a) {
      $t(v, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[v];
      if (!(i && !H(i, a) || !i) && !s)
        return;
      let u = null;
      const E = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && F && (u = ft(`${F}-${v}-${E}`));
      let A = a, T = !1;
      const P = s ? Date.now() : 0, C = u?.lastUpdated || 0, k = u?.lastSyncedWithServer || 0;
      s && P > C ? (A = e.serverState.data, T = !0) : u && C > k && (A = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(A)), o.getState().initializeShadowState(v, a), xt(
        v,
        a,
        A,
        nt,
        Z.current,
        F
      ), T && E && F && Nt(A, v, e, F, Date.now()), St(v), (Array.isArray(w) ? w : [w || "component"]).includes("none") || R({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), dt(() => {
    L && $t(v, {
      serverSync: h,
      formElements: I,
      initialState: a,
      localStorage: f,
      middleware: j.current?.middleware
    });
    const e = `${v}////${Z.current}`, r = o.getState().stateComponents.get(v) || {
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
      at.current.add(u);
    }
    const g = o.getState();
    K(v, (u) => {
      const E = Y(e) ? e(u) : e, A = `${v}-${r.join(".")}`;
      if (A) {
        let M = !1, N = g.signalDomElements.get(A);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), G = B(E, O);
          if (Array.isArray(G)) {
            M = !0;
            const m = `${v}-${O.join(".")}`;
            N = g.signalDomElements.get(m);
          }
        }
        if (N) {
          const O = M ? B(E, r.slice(0, -1)) : B(E, r);
          N.forEach(({ parentId: G, position: m, effect: b }) => {
            const V = document.querySelector(
              `[data-parent-id="${G}"]`
            );
            if (V) {
              const _ = Array.from(V.childNodes);
              if (_[m]) {
                const x = b ? new Function("state", `return (${b})(state)`)(O) : O;
                _[m].textContent = String(x);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && r && J(
        (i || j.current?.validation?.key) + "." + r.join(".")
      );
      const T = r.slice(0, r.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && J(
        j.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Wt(
        j.current?.validation?.key + "." + T.join(".")
      ).filter(([N, O]) => {
        let G = N?.split(".").length;
        if (N == T.join(".") && G == T.length - 1) {
          let m = N + "." + T;
          J(N), Ht(m, O);
        }
      });
      const P = g.stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const M = pt(u, E), N = new Set(M), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          G,
          m
        ] of P.components.entries()) {
          let b = !1;
          const V = Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"];
          if (console.log("component", m), !V.includes("none")) {
            if (V.includes("all")) {
              m.forceUpdate();
              continue;
            }
            if (V.includes("component") && ((m.paths.has(O) || m.paths.has("")) && (b = !0), !b))
              for (const _ of N) {
                let x = _;
                for (; ; ) {
                  if (m.paths.has(x)) {
                    b = !0;
                    break;
                  }
                  const q = x.lastIndexOf(".");
                  if (q !== -1) {
                    const st = x.substring(
                      0,
                      q
                    );
                    if (!isNaN(
                      Number(x.substring(q + 1))
                    ) && m.paths.has(st)) {
                      b = !0;
                      break;
                    }
                    x = st;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (b) break;
              }
            if (!b && V.includes("deps") && m.depsFunction) {
              const _ = m.depsFunction(E);
              let x = !1;
              typeof _ == "boolean" ? _ && (x = !0) : H(m.deps, _) || (m.deps = _, x = !0), x && (b = !0);
            }
            b && m.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((M, N) => {
        const O = r.slice(0, -1), G = B(E, O);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (G.length - 1).toString() : M;
      });
      const { oldValue: k, newValue: D } = qt(
        s.updateType,
        u,
        E,
        r
      ), U = {
        timeStamp: C,
        stateKey: v,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: k,
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
        const O = [...M ?? [], U].reduce((G, m) => {
          const b = `${m.stateKey}:${JSON.stringify(m.path)}`, V = G.get(b);
          return V ? (V.timeStamp = Math.max(V.timeStamp, m.timeStamp), V.newValue = m.newValue, V.oldValue = V.oldValue ?? m.oldValue, V.updateType = m.updateType) : G.set(b, { ...m }), G;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Nt(
        E,
        v,
        j.current,
        F
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: U
      }), j.current?.serverSync) {
        const M = g.serverState[v], N = j.current?.serverSync;
        Bt(v, {
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
      nt,
      Z.current,
      F
    )
  ), o.getState().cogsStateStore[v] || K(v, t), o.getState().initialStateGlobal[v] || At(v, t));
  const d = It(() => gt(
    v,
    nt,
    Z.current,
    F
  ), [v, F]);
  return [Vt(v), d];
}
function gt(t, c, h, f) {
  const I = /* @__PURE__ */ new Map();
  let $ = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [S] of I)
      (S === n || S.startsWith(n + ".")) && I.delete(S);
    $++;
  }, p = {
    removeValidation: (y) => {
      y?.validationKey && J(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), y?.validationKey && J(y.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), I.clear(), $++;
      const W = a(S, []), R = tt(t), F = Y(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, L = `${f}-${t}-${F}`;
      L && localStorage.removeItem(L), ut(t, W), K(t, S);
      const v = o.getState().stateComponents.get(t);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      I.clear(), $++;
      const n = gt(
        t,
        c,
        h,
        f
      ), S = o.getState().initialStateGlobal[t], W = tt(t), R = Y(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, F = `${f}-${t}-${R}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Mt(() => {
        At(t, y), o.getState().initializeShadowState(t, y), ut(t, n), K(t, y);
        const L = o.getState().stateComponents.get(t);
        L && L.components.forEach((v) => {
          v.forceUpdate();
        });
      }), {
        fetchId: (L) => n.get()[L]
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
  function a(y, n = [], S) {
    const W = n.map(String).join(".");
    I.get(W);
    const R = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(p).forEach((v) => {
      R[v] = p[v];
    });
    const F = {
      apply(v, l, at) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(v, l) {
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
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
          return () => pt(
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
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = B(e, n);
          return H(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = B(e, n);
            return H(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = tt(t), r = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
                overscan: s = 5,
                stickToBottom: i = !1
              } = e, g = z(null), [u, E] = et({
                startIndex: 0,
                endIndex: 10
              }), A = z(i), T = z(0), P = z(!0), C = o().getNestedState(
                t,
                n
              ), k = C.length, { totalHeight: D, positions: U } = It(() => {
                const m = o.getState().getShadowMetadata(t, n) || [];
                let b = 0;
                const V = [];
                for (let _ = 0; _ < k; _++) {
                  V[_] = b;
                  const x = m[_]?.virtualizer?.itemHeight;
                  b += x || r;
                }
                return { totalHeight: b, positions: V };
              }, [k, t, n.join("."), r]);
              console.log("height", D);
              const M = It(() => {
                const m = Math.max(0, u.startIndex), b = Math.min(k, u.endIndex), V = Array.from(
                  { length: b - m },
                  (x, q) => m + q
                ), _ = V.map((x) => C[x]);
                return a(_, n, {
                  ...S,
                  validIndices: V
                });
              }, [u.startIndex, u.endIndex, C, k]);
              dt(() => {
                const m = g.current;
                if (!m) return;
                const b = A.current, V = k > T.current;
                T.current = k;
                const _ = () => {
                  const { scrollTop: x, clientHeight: q, scrollHeight: st } = m;
                  A.current = st - x - q < 10;
                  let mt = 0, it = k - 1;
                  for (; mt <= it; ) {
                    const Q = Math.floor((mt + it) / 2);
                    U[Q] < x ? mt = Q + 1 : it = Q - 1;
                  }
                  const ht = Math.max(0, it - s);
                  let X = ht;
                  const Pt = x + q;
                  for (; X < k && U[X] < Pt; )
                    X++;
                  X = Math.min(k, X + s), E((Q) => Q.startIndex !== ht || Q.endIndex !== X ? { startIndex: ht, endIndex: X } : Q);
                };
                return m.addEventListener("scroll", _, {
                  passive: !0
                }), i && (P.current ? (console.log(
                  "stickToBottom initial mount",
                  m.scrollHeight
                ), m.scrollTo({
                  top: m.scrollHeight,
                  behavior: "auto"
                }), P.current = !1) : b && V && (console.log(
                  "stickToBottom wasAtBottom && listGrew",
                  m.scrollHeight
                ), requestAnimationFrame(() => {
                  m.scrollTo({
                    top: m.scrollHeight,
                    behavior: "smooth"
                  });
                }))), console.log("wasAtBottom && listGrew", b, V), _(), () => m.removeEventListener("scroll", _);
              }, [k, U, s, i]);
              const N = Et(
                (m = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: m
                  });
                },
                []
              ), O = Et(
                (m, b = "smooth") => {
                  g.current && U[m] !== void 0 && g.current.scrollTo({
                    top: U[m],
                    behavior: b
                  });
                },
                [U]
              ), G = {
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
                    transform: `translateY(${U[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: M,
                virtualizerProps: G,
                scrollToBottom: N,
                scrollToIndex: O
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, E) => e(u.item, E.item)
              ), i = s.map(({ item: u }) => u), g = {
                ...S,
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
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(i, n, g);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const u = r[i], E = [...n, i.toString()], A = a(u, E, S);
                return e(u, A, {
                  register: () => {
                    const [, P] = et({}), C = `${h}-${n.join(".")}-${i}`;
                    dt(() => {
                      const k = `${t}////${C}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(k, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const U = o.getState().stateComponents.get(t);
                        U && U.components.delete(k);
                      };
                    }, [t, C]);
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
              S?.validIndices && S.validIndices[i] !== void 0 ? g = S.validIndices[i] : g = i;
              const u = [...n, g.toString()], E = a(s, u, S);
              return e(
                s,
                E,
                i,
                y,
                a(y, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ot(Yt, {
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
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const u = r[i], E = [...n, i.toString()], A = a(u, E, S), T = `${h}-${n.join(".")}-${i}`;
                return ot(Xt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: E,
                  children: e(
                    u,
                    A,
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
              I.clear(), $++;
              const s = r.flatMap(
                (i) => i[e] ?? []
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
              const r = e.length - 1, s = e[r], i = [...n, r.toString()];
              return a(s, i);
            };
          if (l === "insert")
            return (e) => (w(n), vt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = Y(e) ? e(i) : e;
              let u = null;
              if (!i.some((A) => {
                if (r) {
                  const P = r.every(
                    (C) => H(A[C], g[C])
                  );
                  return P && (u = A), P;
                }
                const T = H(A, g);
                return T && (u = A), T;
              }))
                w(n), vt(c, g, n, t);
              else if (s && u) {
                const A = s(u), T = i.map(
                  (P) => H(P, u) ? A : P
                );
                w(n), rt(c, T, n);
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
              r > -1 ? ct(c, n, t, r) : vt(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: g }, u) => e(g, u)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = d().find(
                ({ item: u }) => u[e] === r
              );
              if (!i) return;
              const g = [...n, i.originalIndex.toString()];
              return a(i.item, g, S);
            };
        }
        const Z = n[n.length - 1];
        if (!isNaN(Number(Z))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ct(
              c,
              d,
              t,
              Number(Z)
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
          return (d) => ft(f + "-" + t + "-" + d);
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
              const e = o.getState().cogsStateStore[t], s = Dt(e, d).newDocument;
              xt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                h,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = pt(e, s), u = new Set(g);
                for (const [
                  E,
                  A
                ] of i.components.entries()) {
                  let T = !1;
                  const P = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      A.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (A.paths.has("") && (T = !0), !T))
                      for (const C of u) {
                        if (A.paths.has(C)) {
                          T = !0;
                          break;
                        }
                        let k = C.lastIndexOf(".");
                        for (; k !== -1; ) {
                          const D = C.substring(0, k);
                          if (A.paths.has(D)) {
                            T = !0;
                            break;
                          }
                          const U = C.substring(
                            k + 1
                          );
                          if (!isNaN(Number(U))) {
                            const M = D.lastIndexOf(".");
                            if (M !== -1) {
                              const N = D.substring(
                                0,
                                M
                              );
                              if (A.paths.has(N)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          k = D.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && P.includes("deps") && A.depsFunction) {
                      const C = A.depsFunction(s);
                      let k = !1;
                      typeof C == "boolean" ? C && (k = !0) : H(A.deps, C) || (A.deps = C, k = !0), k && (T = !0);
                    }
                    T && A.forceUpdate();
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
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const E = u.path, A = u.message, T = [d.key, ...E].join(".");
                  e(T, A);
                }), St(t), !1);
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
          }) => /* @__PURE__ */ yt(
            Rt,
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
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ot(() => {
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
          return (d, e) => /* @__PURE__ */ yt(
            Ft,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const j = [...n, l], nt = o.getState().getNestedState(t, j);
        return a(nt, j, S);
      }
    }, L = new Proxy(R, F);
    return I.set(W, {
      proxy: L,
      stateVersion: $
    }), L;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function bt(t) {
  return ot(Zt, { proxy: t });
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
    (I, $, w, p, a) => t._mapFn(I, $, w, p, a)
  ) : null;
}
function Zt({
  proxy: t
}) {
  const c = z(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return lt(() => {
    const f = c.current;
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
  }, [t._stateKey, t._path.join("."), t._effect]), ot("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function ge(t) {
  const c = _t(
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
  return ot("text", {}, String(c));
}
function Xt({
  stateKey: t,
  itemComponentId: c,
  itemPath: h,
  children: f
}) {
  const [, I] = et({}), [$, w] = Gt(), p = z(null);
  return lt(() => {
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
  }, [t, c, h.join(".")]), /* @__PURE__ */ yt("div", { ref: $, children: f });
}
export {
  bt as $cogsSignal,
  ge as $cogsSignalStore,
  le as addStateOptions,
  de as createCogsState,
  ue as notifyComponent,
  Jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
