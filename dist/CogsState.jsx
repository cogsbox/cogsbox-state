"use client";
import { jsx as wt } from "react/jsx-runtime";
import { useState as ot, useRef as Z, useEffect as gt, useLayoutEffect as ft, useMemo as xt, createElement as ct, useSyncExternalStore as Rt, startTransition as Ft, useCallback as dt } from "react";
import { transformStateFunc as Ut, isDeepEqual as B, isFunction as X, getNestedValue as q, getDifferences as Et, debounce as Dt } from "./utility.js";
import { pushFunc as pt, updateFn as it, cutFunc as ut, ValidationWrapper as Wt, FormControlComponent as Gt } from "./Functions.jsx";
import Lt from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as kt } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { applyPatch as Ht } from "fast-json-patch";
import zt from "react-use-measure";
function Nt(t, c) {
  const h = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, v = h(t) || {};
  f(t, {
    ...v,
    ...c
  });
}
function bt({
  stateKey: t,
  options: c,
  initialOptionsPart: h
}) {
  const f = rt(t) || {}, v = h[t] || {}, k = o.getState().setInitialStateOptions, p = { ...v, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !B(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(t, p);
}
function fe(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const Se = (t, c) => {
  let h = t;
  const [f, v] = Ut(h);
  (Object.keys(v).length > 0 || c && Object.keys(c).length > 0) && Object.keys(v).forEach((I) => {
    v[I] = v[I] || {}, v[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...v[I].formElements || {}
      // State-specific overrides
    }, rt(I) || o.getState().setInitialStateOptions(I, v[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const k = (I, a) => {
    const [y] = ot(a?.componentId ?? At());
    bt({
      stateKey: I,
      options: a,
      initialOptionsPart: v
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [L, O] = Qt(
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
    return O;
  };
  function p(I, a) {
    bt({ stateKey: I, options: a, initialOptionsPart: v }), a.localStorage && Zt(I, a), yt(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: St,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: _t,
  getValidationErrors: Bt,
  setStateLog: qt,
  updateInitialStateGlobal: Tt,
  addValidationError: Jt,
  removeValidationError: Y,
  setServerSyncActions: Yt
} = o.getState(), Ct = (t, c, h, f, v) => {
  h?.log && console.log(
    "saving to localstorage",
    c,
    h.localStorage?.key,
    f
  );
  const k = X(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (k && f) {
    const p = `${f}-${c}-${k}`;
    let I;
    try {
      I = ht(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? I
    }, y = Lt.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(y.json)
    );
  }
}, ht = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Zt = (t, c) => {
  const h = o.getState().cogsStateStore[t], { sessionId: f } = Pt(), v = X(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (v && f) {
    const k = ht(
      `${f}-${t}-${v}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return nt(t, k.state), yt(t), !0;
  }
  return !1;
}, Mt = (t, c, h, f, v, k) => {
  const p = {
    initialState: c,
    updaterState: mt(
      t,
      f,
      v,
      k
    ),
    state: h
  };
  Tt(t, p.initialState), St(t, p.updaterState), nt(t, p.state);
}, yt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, me = (t, c) => {
  const h = o.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${c}`, v = h.components.get(f);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Xt = (t, c, h, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: q(c, f),
        newValue: q(h, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(h, f)
      };
    case "cut":
      return {
        oldValue: q(c, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Qt(t, {
  stateKey: c,
  serverSync: h,
  localStorage: f,
  formElements: v,
  reactiveDeps: k,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: y,
  dependencies: n,
  serverState: S
} = {}) {
  const [L, O] = ot({}), { sessionId: R } = Pt();
  let H = !c;
  const [m] = ot(c ?? At()), l = o.getState().stateLog[m], lt = Z(/* @__PURE__ */ new Set()), Q = Z(I ?? At()), _ = Z(
    null
  );
  _.current = rt(m) ?? null, gt(() => {
    if (y && y.stateKey === m && y.path?.[0]) {
      nt(m, (r) => ({
        ...r,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), gt(() => {
    if (a) {
      Nt(m, {
        initialState: a
      });
      const e = _.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[m];
      if (!(i && !B(i, a) || !i) && !s)
        return;
      let u = null;
      const E = X(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && R && (u = ht(`${R}-${m}-${E}`));
      let w = a, A = !1;
      const V = s ? Date.now() : 0, C = u?.lastUpdated || 0, x = u?.lastSyncedWithServer || 0;
      s && V > C ? (w = e.serverState.data, A = !0) : u && C > x && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(m, a), Mt(
        m,
        a,
        w,
        at,
        Q.current,
        R
      ), A && E && R && Ct(w, m, e, R, Date.now()), yt(m), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ft(() => {
    H && Nt(m, {
      serverSync: h,
      formElements: v,
      initialState: a,
      localStorage: f,
      middleware: _.current?.middleware
    });
    const e = `${m}////${Q.current}`, r = o.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, r), O({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(m));
    };
  }, []);
  const at = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${m}-${r.join(".")}`;
      lt.current.add(u);
    }
    const g = o.getState();
    nt(m, (u) => {
      const E = X(e) ? e(u) : e, w = `${m}-${r.join(".")}`;
      if (w) {
        let P = !1, N = g.signalDomElements.get(w);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const M = r.slice(0, -1), W = q(E, M);
          if (Array.isArray(W)) {
            P = !0;
            const T = `${m}-${M.join(".")}`;
            N = g.signalDomElements.get(T);
          }
        }
        if (N) {
          const M = P ? q(E, r.slice(0, -1)) : q(E, r);
          N.forEach(({ parentId: W, position: T, effect: F }) => {
            const j = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (j) {
              const $ = Array.from(j.childNodes);
              if ($[T]) {
                const b = F ? new Function("state", `return (${F})(state)`)(M) : M;
                $[T].textContent = String(b);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || _.current?.validation?.key) && r && Y(
        (i || _.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      s.updateType === "cut" && _.current?.validation?.key && Y(
        _.current?.validation?.key + "." + A.join(".")
      ), s.updateType === "insert" && _.current?.validation?.key && Bt(
        _.current?.validation?.key + "." + A.join(".")
      ).filter(([N, M]) => {
        let W = N?.split(".").length;
        if (N == A.join(".") && W == A.length - 1) {
          let T = N + "." + A;
          Y(N), Jt(T, M);
        }
      });
      const V = g.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", V), V) {
        const P = Et(u, E), N = new Set(P), M = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          W,
          T
        ] of V.components.entries()) {
          let F = !1;
          const j = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
          if (console.log("component", T), !j.includes("none")) {
            if (j.includes("all")) {
              T.forceUpdate();
              continue;
            }
            if (j.includes("component") && ((T.paths.has(M) || T.paths.has("")) && (F = !0), !F))
              for (const $ of N) {
                let b = $;
                for (; ; ) {
                  if (T.paths.has(b)) {
                    F = !0;
                    break;
                  }
                  const G = b.lastIndexOf(".");
                  if (G !== -1) {
                    const z = b.substring(
                      0,
                      G
                    );
                    if (!isNaN(
                      Number(b.substring(G + 1))
                    ) && T.paths.has(z)) {
                      F = !0;
                      break;
                    }
                    b = z;
                  } else
                    b = "";
                  if (b === "")
                    break;
                }
                if (F) break;
              }
            if (!F && j.includes("deps") && T.depsFunction) {
              const $ = T.depsFunction(E);
              let b = !1;
              typeof $ == "boolean" ? $ && (b = !0) : B(T.deps, $) || (T.deps = $, b = !0), b && (F = !0);
            }
            F && T.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((P, N) => {
        const M = r.slice(0, -1), W = q(E, M);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (W.length - 1).toString() : P;
      });
      const { oldValue: x, newValue: U } = Xt(
        s.updateType,
        u,
        E,
        r
      ), D = {
        timeStamp: C,
        stateKey: m,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: x,
        newValue: U
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(m, r, E);
          break;
        case "insert":
          const P = r.slice(0, -1);
          g.insertShadowArrayElement(m, P, U);
          break;
        case "cut":
          const N = r.slice(0, -1), M = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(m, N, M);
          break;
      }
      if (qt(m, (P) => {
        const M = [...P ?? [], D].reduce((W, T) => {
          const F = `${T.stateKey}:${JSON.stringify(T.path)}`, j = W.get(F);
          return j ? (j.timeStamp = Math.max(j.timeStamp, T.timeStamp), j.newValue = T.newValue, j.oldValue = j.oldValue ?? T.oldValue, j.updateType = T.updateType) : W.set(F, { ...T }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(M.values());
      }), Ct(
        E,
        m,
        _.current,
        R
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: D
      }), _.current?.serverSync) {
        const P = g.serverState[m], N = _.current?.serverSync;
        Yt(m, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[m] || (St(
    m,
    mt(
      m,
      at,
      Q.current,
      R
    )
  ), o.getState().cogsStateStore[m] || nt(m, t), o.getState().initialStateGlobal[m] || Tt(m, t));
  const d = xt(() => mt(
    m,
    at,
    Q.current,
    R
  ), [m, R]);
  return [_t(m), d];
}
function mt(t, c, h, f) {
  const v = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (y) => {
    const n = y.join(".");
    for (const [S] of v)
      (S === n || S.startsWith(n + ".")) && v.delete(S);
    k++;
  }, I = {
    removeValidation: (y) => {
      y?.validationKey && Y(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Y(n?.key), y?.validationKey && Y(y.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), v.clear(), k++;
      const L = a(S, []), O = rt(t), R = X(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, H = `${f}-${t}-${R}`;
      H && localStorage.removeItem(H), St(t, L), nt(t, S);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      v.clear(), k++;
      const n = mt(
        t,
        c,
        h,
        f
      ), S = o.getState().initialStateGlobal[t], L = rt(t), O = X(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, R = `${f}-${t}-${O}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Ft(() => {
        Tt(t, y), o.getState().initializeShadowState(t, y), St(t, n), nt(t, y);
        const H = o.getState().stateComponents.get(t);
        H && H.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (H) => n.get()[H]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = o.getState().serverState[t];
      return !!(y && B(y, _t(t)));
    }
  };
  function a(y, n = [], S) {
    const L = n.map(String).join(".");
    v.get(L);
    const O = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((m) => {
      O[m] = I[m];
    });
    const R = {
      apply(m, l, lt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
        const lt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !lt.has(l)) {
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
          return () => Et(
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
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = q(e, n);
          return B(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = q(e, n);
            return B(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = rt(t), r = X(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
                // Now optional with default
                overscan: s = 5,
                stickToBottom: i = !1
              } = e, g = Z(null), [u, E] = ot({
                startIndex: 0,
                endIndex: 10
              }), w = dt(
                ($) => o.getState().getShadowMetadata(t, [...n, $.toString()])?.virtualizer?.itemHeight || r,
                [r]
              ), A = dt(() => {
                const $ = o.getState().getNestedState(t, n);
                let b = 0;
                const G = [];
                for (let z = 0; z < $.length; z++)
                  G[z] = b, b += w(z);
                return { totalHeight: b, positions: G };
              }, [w]), V = Z(i), C = Z(0), x = Z(!0), U = o().getNestedState(
                t,
                n
              ), D = U.length, P = xt(() => {
                const $ = Math.max(0, u.startIndex), b = Math.min(D, u.endIndex), G = Array.from(
                  { length: b - $ },
                  (K, st) => $ + st
                ), z = G.map((K) => U[K]);
                return a(z, n, {
                  ...S,
                  validIndices: G
                });
              }, [u.startIndex, u.endIndex, U, D]);
              ft(() => {
                const $ = g.current;
                if (!$) return;
                const b = V.current, G = D > C.current;
                C.current = D;
                const { totalHeight: z, positions: K } = A(), st = () => {
                  const { scrollTop: vt, clientHeight: $t, scrollHeight: jt } = $;
                  V.current = jt - vt - $t < 10;
                  let J = 0, It = K.length - 1;
                  for (; J < It; ) {
                    const et = Math.floor((J + It) / 2);
                    K[et] < vt ? J = et + 1 : It = et;
                  }
                  J = Math.max(0, J - s);
                  const Ot = vt + $t;
                  let tt = J;
                  for (; tt < K.length && K[tt] < Ot; )
                    tt++;
                  tt = Math.min(D, tt + s), E((et) => et.startIndex !== J || et.endIndex !== tt ? { startIndex: J, endIndex: tt } : et);
                };
                return $.addEventListener("scroll", st, {
                  passive: !0
                }), i && (x.current ? $.scrollTo({
                  top: $.scrollHeight,
                  behavior: "auto"
                }) : b && G && requestAnimationFrame(() => {
                  $.scrollTo({
                    top: $.scrollHeight,
                    behavior: "smooth"
                  });
                })), x.current = !1, st(), () => $.removeEventListener("scroll", st);
              }, [D, A, s, i]);
              const N = dt(
                ($ = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: $
                  });
                },
                []
              ), M = dt(
                ($, b = "smooth") => {
                  if (g.current) {
                    const { positions: G } = A();
                    g.current.scrollTo({
                      top: G[$] || 0,
                      behavior: b
                    });
                  }
                },
                [A]
              ), {
                totalHeight: W,
                positions: T
              } = A(), F = T[u.startIndex] || 0, j = {
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
                    transform: `translateY(${F}px)`
                  }
                }
              };
              return {
                virtualState: P,
                virtualizerProps: j,
                scrollToBottom: N,
                scrollToIndex: M
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
                const u = r[i], E = [...n, i.toString()], w = a(u, E, S);
                return e(u, w, {
                  register: () => {
                    const [, V] = ot({}), C = `${h}-${n.join(".")}-${i}`;
                    ft(() => {
                      const x = `${t}////${C}`, U = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return U.components.set(x, {
                        forceUpdate: () => V({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, U), () => {
                        const D = o.getState().stateComponents.get(t);
                        D && D.components.delete(x);
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
            return (e) => ct(Kt, {
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
                const u = r[i], E = [...n, i.toString()], w = a(u, E, S), A = `${h}-${n.join(".")}-${i}`;
                return ct(ee, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: E,
                  children: e(
                    u,
                    w,
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
            return (e) => (p(n), pt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = X(e) ? e(i) : e;
              let u = null;
              if (!i.some((w) => {
                if (r) {
                  const V = r.every(
                    (C) => B(w[C], g[C])
                  );
                  return V && (u = w), V;
                }
                const A = B(w, g);
                return A && (u = w), A;
              }))
                p(n), pt(c, g, n, t);
              else if (s && u) {
                const w = s(u), A = i.map(
                  (V) => B(V, u) ? w : V
                );
                p(n), it(c, A, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), ut(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < y.length; r++)
                y[r] === e && ut(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = y.findIndex((s) => s === e);
              r > -1 ? ut(c, n, t, r) : pt(c, e, n, t);
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
        const Q = n[n.length - 1];
        if (!isNaN(Number(Q))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ut(
              c,
              d,
              t,
              Number(Q)
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
          return (d) => Vt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Vt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ht(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            it(c, i, e), p(e);
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
            it(c, i, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Ht(e, d).newDocument;
              Mt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                h,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = Et(e, s), u = new Set(g);
                for (const [
                  E,
                  w
                ] of i.components.entries()) {
                  let A = !1;
                  const V = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!V.includes("none")) {
                    if (V.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (V.includes("component") && (w.paths.has("") && (A = !0), !A))
                      for (const C of u) {
                        if (w.paths.has(C)) {
                          A = !0;
                          break;
                        }
                        let x = C.lastIndexOf(".");
                        for (; x !== -1; ) {
                          const U = C.substring(0, x);
                          if (w.paths.has(U)) {
                            A = !0;
                            break;
                          }
                          const D = C.substring(
                            x + 1
                          );
                          if (!isNaN(Number(D))) {
                            const P = U.lastIndexOf(".");
                            if (P !== -1) {
                              const N = U.substring(
                                0,
                                P
                              );
                              if (w.paths.has(N)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          x = U.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && V.includes("deps") && w.depsFunction) {
                      const C = w.depsFunction(s);
                      let x = !1;
                      typeof C == "boolean" ? C && (x = !0) : B(w.deps, C) || (w.deps = C, x = !0), x && (A = !0);
                    }
                    A && w.forceUpdate();
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
              Y(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && Y(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const E = u.path, w = u.message, A = [d.key, ...E].join(".");
                  e(A, w);
                }), yt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
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
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
        }
        if (l === "getFormRef")
          return () => kt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ wt(
            Wt,
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
              Dt(() => {
                it(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              it(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ wt(
            Gt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const _ = [...n, l], at = o.getState().getNestedState(t, _);
        return a(at, _, S);
      }
    }, H = new Proxy(O, R);
    return v.set(L, {
      proxy: H,
      stateVersion: k
    }), H;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Vt(t) {
  return ct(te, { proxy: t });
}
function Kt({
  proxy: t,
  rebuildStateShape: c
}) {
  const h = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? c(
    h,
    t._path
  ).stateMapNoRender(
    (v, k, p, I, a) => t._mapFn(v, k, p, I, a)
  ) : null;
}
function te({
  proxy: t
}) {
  const c = Z(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return gt(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const v = f.parentElement, p = Array.from(v.childNodes).indexOf(f);
    let I = v.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", I));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
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
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const L = document.createTextNode(String(S));
    f.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), ct("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function he(t) {
  const c = Rt(
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
  return ct("text", {}, String(c));
}
function ee({
  stateKey: t,
  itemComponentId: c,
  itemPath: h,
  children: f
}) {
  const [, v] = ot({}), [k, p] = zt();
  return gt(() => {
    p.height > 0 && o.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: p.height
      }
    });
  }, [p.height]), ft(() => {
    const I = `${t}////${c}`, a = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(I, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set([h.join(".")])
    }), o.getState().stateComponents.set(t, a), () => {
      const y = o.getState().stateComponents.get(t);
      y && y.components.delete(I);
    };
  }, [t, c, h.join(".")]), /* @__PURE__ */ wt("div", { ref: k, children: f });
}
export {
  Vt as $cogsSignal,
  he as $cogsSignalStore,
  fe as addStateOptions,
  Se as createCogsState,
  me as notifyComponent,
  Qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
