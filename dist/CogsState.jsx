"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as rt, useRef as Z, useEffect as lt, useLayoutEffect as dt, useMemo as vt, createElement as st, useSyncExternalStore as Vt, startTransition as Pt, useCallback as mt } from "react";
import { transformStateFunc as _t, isDeepEqual as z, isFunction as X, getNestedValue as B, getDifferences as It, debounce as Mt } from "./utility.js";
import { pushFunc as ht, updateFn as at, cutFunc as ct, ValidationWrapper as jt, FormControlComponent as Ot } from "./Functions.jsx";
import Rt from "superjson";
import { v4 as pt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Et } from "./store.js";
import { useCogsConfig as xt } from "./CogsStateClient.jsx";
import { applyPatch as Ft } from "fast-json-patch";
import Ut from "react-use-measure";
function At(t, c) {
  const h = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, v = h(t) || {};
  f(t, {
    ...v,
    ...c
  });
}
function Tt({
  stateKey: t,
  options: c,
  initialOptionsPart: h
}) {
  const f = nt(t) || {}, v = h[t] || {}, k = o.getState().setInitialStateOptions, p = { ...v, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !z(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(t, p);
}
function ie(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const ce = (t, c) => {
  let h = t;
  const [f, v] = _t(h);
  (Object.keys(v).length > 0 || c && Object.keys(c).length > 0) && Object.keys(v).forEach((I) => {
    v[I] = v[I] || {}, v[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...v[I].formElements || {}
      // State-specific overrides
    }, nt(I) || o.getState().setInitialStateOptions(I, v[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const k = (I, a) => {
    const [y] = rt(a?.componentId ?? pt());
    Tt({
      stateKey: I,
      options: a,
      initialOptionsPart: v
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [W, F] = Bt(
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
    return F;
  };
  function p(I, a) {
    Tt({ stateKey: I, options: a, initialOptionsPart: v }), a.localStorage && Ht(I, a), St(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: ut,
  setState: et,
  getInitialOptions: nt,
  getKeyState: Nt,
  getValidationErrors: Dt,
  setStateLog: Wt,
  updateInitialStateGlobal: wt,
  addValidationError: Gt,
  removeValidationError: Y,
  setServerSyncActions: Lt
} = o.getState(), $t = (t, c, h, f, v) => {
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
      I = ft(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? I
    }, y = Rt.serialize(a);
    window.localStorage.setItem(
      p,
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
}, Ht = (t, c) => {
  const h = o.getState().cogsStateStore[t], { sessionId: f } = xt(), v = X(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (v && f) {
    const k = ft(
      `${f}-${t}-${v}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return et(t, k.state), St(t), !0;
  }
  return !1;
}, bt = (t, c, h, f, v, k) => {
  const p = {
    initialState: c,
    updaterState: gt(
      t,
      f,
      v,
      k
    ),
    state: h
  };
  wt(t, p.initialState), ut(t, p.updaterState), et(t, p.state);
}, St = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, le = (t, c) => {
  const h = o.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${c}`, v = h.components.get(f);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, zt = (t, c, h, f) => {
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
function Bt(t, {
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
  const [W, F] = rt({}), { sessionId: U } = xt();
  let G = !c;
  const [m] = rt(c ?? pt()), l = o.getState().stateLog[m], it = Z(/* @__PURE__ */ new Set()), Q = Z(I ?? pt()), O = Z(
    null
  );
  O.current = nt(m) ?? null, lt(() => {
    if (y && y.stateKey === m && y.path?.[0]) {
      et(m, (r) => ({
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
      At(m, {
        initialState: a
      });
      const e = O.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[m];
      if (!(i && !z(i, a) || !i) && !s)
        return;
      let u = null;
      const A = X(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      A && U && (u = ft(`${U}-${m}-${A}`));
      let w = a, T = !1;
      const V = s ? Date.now() : 0, C = u?.lastUpdated || 0, _ = u?.lastSyncedWithServer || 0;
      s && V > C ? (w = e.serverState.data, T = !0) : u && C > _ && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(m, a), bt(
        m,
        a,
        w,
        ot,
        Q.current,
        U
      ), T && A && U && $t(w, m, e, U, Date.now()), St(m), (Array.isArray(p) ? p : [p || "component"]).includes("none") || F({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), dt(() => {
    G && At(m, {
      serverSync: h,
      formElements: v,
      initialState: a,
      localStorage: f,
      middleware: O.current?.middleware
    });
    const e = `${m}////${Q.current}`, r = o.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => F({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, r), F({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(m));
    };
  }, []);
  const ot = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${m}-${r.join(".")}`;
      it.current.add(u);
    }
    const g = o.getState();
    et(m, (u) => {
      const A = X(e) ? e(u) : e, w = `${m}-${r.join(".")}`;
      if (w) {
        let b = !1, x = g.signalDomElements.get(w);
        if ((!x || x.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const R = r.slice(0, -1), D = B(A, R);
          if (Array.isArray(D)) {
            b = !0;
            const $ = `${m}-${R.join(".")}`;
            x = g.signalDomElements.get($);
          }
        }
        if (x) {
          const R = b ? B(A, r.slice(0, -1)) : B(A, r);
          x.forEach(({ parentId: D, position: $, effect: E }) => {
            const N = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (N) {
              const M = Array.from(N.childNodes);
              if (M[$]) {
                const j = E ? new Function("state", `return (${E})(state)`)(R) : R;
                M[$].textContent = String(j);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || O.current?.validation?.key) && r && Y(
        (i || O.current?.validation?.key) + "." + r.join(".")
      );
      const T = r.slice(0, r.length - 1);
      s.updateType === "cut" && O.current?.validation?.key && Y(
        O.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && O.current?.validation?.key && Dt(
        O.current?.validation?.key + "." + T.join(".")
      ).filter(([x, R]) => {
        let D = x?.split(".").length;
        if (x == T.join(".") && D == T.length - 1) {
          let $ = x + "." + T;
          Y(x), Gt($, R);
        }
      });
      const V = g.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", V), V) {
        const b = It(u, A), x = new Set(b), R = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of V.components.entries()) {
          let E = !1;
          const N = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !N.includes("none")) {
            if (N.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (N.includes("component") && (($.paths.has(R) || $.paths.has("")) && (E = !0), !E))
              for (const M of x) {
                let j = M;
                for (; ; ) {
                  if ($.paths.has(j)) {
                    E = !0;
                    break;
                  }
                  const H = j.lastIndexOf(".");
                  if (H !== -1) {
                    const K = j.substring(
                      0,
                      H
                    );
                    if (!isNaN(
                      Number(j.substring(H + 1))
                    ) && $.paths.has(K)) {
                      E = !0;
                      break;
                    }
                    j = K;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (E) break;
              }
            if (!E && N.includes("deps") && $.depsFunction) {
              const M = $.depsFunction(A);
              let j = !1;
              typeof M == "boolean" ? M && (j = !0) : z($.deps, M) || ($.deps = M, j = !0), j && (E = !0);
            }
            E && $.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((b, x) => {
        const R = r.slice(0, -1), D = B(A, R);
        return x === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : b;
      });
      const { oldValue: _, newValue: P } = zt(
        s.updateType,
        u,
        A,
        r
      ), L = {
        timeStamp: C,
        stateKey: m,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: _,
        newValue: P
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(m, r, A);
          break;
        case "insert":
          const b = r.slice(0, -1);
          g.insertShadowArrayElement(m, b, P);
          break;
        case "cut":
          const x = r.slice(0, -1), R = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(m, x, R);
          break;
      }
      if (Wt(m, (b) => {
        const R = [...b ?? [], L].reduce((D, $) => {
          const E = `${$.stateKey}:${JSON.stringify($.path)}`, N = D.get(E);
          return N ? (N.timeStamp = Math.max(N.timeStamp, $.timeStamp), N.newValue = $.newValue, N.oldValue = N.oldValue ?? $.oldValue, N.updateType = $.updateType) : D.set(E, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), $t(
        A,
        m,
        O.current,
        U
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: L
      }), O.current?.serverSync) {
        const b = g.serverState[m], x = O.current?.serverSync;
        Lt(m, {
          syncKey: typeof x.syncKey == "string" ? x.syncKey : x.syncKey({ state: A }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (x.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  o.getState().updaterState[m] || (ut(
    m,
    gt(
      m,
      ot,
      Q.current,
      U
    )
  ), o.getState().cogsStateStore[m] || et(m, t), o.getState().initialStateGlobal[m] || wt(m, t));
  const d = vt(() => gt(
    m,
    ot,
    Q.current,
    U
  ), [m, U]);
  return [Nt(m), d];
}
function gt(t, c, h, f) {
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
      const W = a(S, []), F = nt(t), U = X(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, G = `${f}-${t}-${U}`;
      G && localStorage.removeItem(G), ut(t, W), et(t, S);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      v.clear(), k++;
      const n = gt(
        t,
        c,
        h,
        f
      ), S = o.getState().initialStateGlobal[t], W = nt(t), F = X(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, U = `${f}-${t}-${F}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Pt(() => {
        wt(t, y), o.getState().initializeShadowState(t, y), ut(t, n), et(t, y);
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
      return !!(y && z(y, Nt(t)));
    }
  };
  function a(y, n = [], S) {
    const W = n.map(String).join(".");
    v.get(W);
    const F = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((m) => {
      F[m] = I[m];
    });
    const U = {
      apply(m, l, it) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
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
                o.getState().removeValidationError(s), i.errors.forEach((u) => {
                  const A = [s, ...u.path].join(".");
                  o.getState().addValidationError(A, u.message);
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
          return z(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = B(e, n);
            return z(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = nt(t), r = X(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
                stickToBottom: i = !1
              } = e, g = Z(null), [u, A] = rt({
                startIndex: 0,
                endIndex: 10
              }), w = mt(
                (E) => o.getState().getShadowMetadata(t, [...n, E.toString()])?.virtualizer?.itemHeight || r,
                [r, t, n]
              ), T = Z(i), V = Z(0), C = Z(!0), _ = o().getNestedState(
                t,
                n
              ), P = _.length, { totalHeight: L, positions: b } = vt(() => {
                let E = 0;
                const N = [];
                for (let M = 0; M < P; M++)
                  N[M] = E, E += w(M);
                return { totalHeight: E, positions: N };
              }, [P, w]), x = vt(() => {
                const E = Math.max(0, u.startIndex), N = Math.min(P, u.endIndex), M = Array.from(
                  { length: N - E },
                  (H, K) => E + K
                ), j = M.map((H) => _[H]);
                return a(j, n, {
                  ...S,
                  validIndices: M
                });
              }, [u.startIndex, u.endIndex, _, P]);
              dt(() => {
                const E = g.current;
                if (!E) return;
                const N = T.current, M = P > V.current;
                V.current = P;
                const j = () => {
                  const { scrollTop: H, clientHeight: K, scrollHeight: Ct } = E;
                  T.current = Ct - H - K < 10;
                  let tt = 0;
                  for (let J = 0; J < b.length; J++)
                    if (b[J] >= H) {
                      tt = J;
                      break;
                    }
                  let q = tt;
                  for (; q < P && b[q] < H + K; )
                    q++;
                  tt = Math.max(0, tt - s), q = Math.min(P, q + s), console.log(
                    "startIndex",
                    tt,
                    "endIndex",
                    q,
                    "totalHeight",
                    L
                  ), A((J) => J.startIndex !== tt || J.endIndex !== q ? { startIndex: tt, endIndex: q } : J);
                };
                return E.addEventListener("scroll", j, {
                  passive: !0
                }), i && (C.current ? E.scrollTo({
                  top: E.scrollHeight,
                  behavior: "auto"
                }) : N && M && requestAnimationFrame(() => {
                  E.scrollTo({
                    top: E.scrollHeight,
                    behavior: "smooth"
                  });
                })), C.current = !1, j(), () => E.removeEventListener("scroll", j);
              }, [P, s, i, b]);
              const R = mt(
                (E = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: E
                  });
                },
                []
              ), D = mt(
                (E, N = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: b[E] || 0,
                    // Use the calculated position
                    behavior: N
                  });
                },
                [b]
                // Dependency is now `positions`
              ), $ = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${L}px`,
                    // Use calculated dynamic height
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${b[u.startIndex] || 0}px)`
                    // Use calculated position
                  }
                }
              };
              return {
                virtualState: x,
                virtualizerProps: $,
                scrollToBottom: R,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, A) => e(u.item, A.item)
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
                ({ item: u }, A) => e(u, A)
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
                const u = r[i], A = [...n, i.toString()], w = a(u, A, S);
                return e(u, w, {
                  register: () => {
                    const [, V] = rt({}), C = `${h}-${n.join(".")}-${i}`;
                    dt(() => {
                      const _ = `${t}////${C}`, P = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return P.components.set(_, {
                        forceUpdate: () => V({}),
                        paths: /* @__PURE__ */ new Set([A.join(".")])
                      }), o.getState().stateComponents.set(t, P), () => {
                        const L = o.getState().stateComponents.get(t);
                        L && L.components.delete(_);
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
              const u = [...n, g.toString()], A = a(s, u, S);
              return e(
                s,
                A,
                i,
                y,
                a(y, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => st(qt, {
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
                const u = r[i], A = [...n, i.toString()], w = a(u, A, S), T = `${h}-${n.join(".")}-${i}`;
                return st(Yt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: A,
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
            return (e) => (p(n), ht(c, e, n, t), a(
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
                    (C) => z(w[C], g[C])
                  );
                  return V && (u = w), V;
                }
                const T = z(w, g);
                return T && (u = w), T;
              }))
                p(n), ht(c, g, n, t);
              else if (s && u) {
                const w = s(u), T = i.map(
                  (V) => z(V, u) ? w : V
                );
                p(n), at(c, T, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), ct(c, n, t, e), a(
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
              r > -1 ? ct(c, n, t, r) : ht(c, e, n, t);
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
            return () => ct(
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
            const i = o.getState().getNestedState(t, [...e]);
            at(c, i, e), p(e);
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
            at(c, i, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Ft(e, d).newDocument;
              bt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                h,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = It(e, s), u = new Set(g);
                for (const [
                  A,
                  w
                ] of i.components.entries()) {
                  let T = !1;
                  const V = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!V.includes("none")) {
                    if (V.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (V.includes("component") && (w.paths.has("") && (T = !0), !T))
                      for (const C of u) {
                        if (w.paths.has(C)) {
                          T = !0;
                          break;
                        }
                        let _ = C.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const P = C.substring(0, _);
                          if (w.paths.has(P)) {
                            T = !0;
                            break;
                          }
                          const L = C.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(L))) {
                            const b = P.lastIndexOf(".");
                            if (b !== -1) {
                              const x = P.substring(
                                0,
                                b
                              );
                              if (w.paths.has(x)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          _ = P.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && V.includes("deps") && w.depsFunction) {
                      const C = w.depsFunction(s);
                      let _ = !1;
                      typeof C == "boolean" ? C && (_ = !0) : z(w.deps, C) || (w.deps = C, _ = !0), _ && (T = !0);
                    }
                    T && w.forceUpdate();
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
                  const A = u.path, w = u.message, T = [d.key, ...A].join(".");
                  e(T, w);
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
            jt,
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
              Mt(() => {
                at(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              at(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ yt(
            Ot,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const O = [...n, l], ot = o.getState().getNestedState(t, O);
        return a(ot, O, S);
      }
    }, G = new Proxy(F, U);
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
  return st(Jt, { proxy: t });
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
    (v, k, p, I, a) => t._mapFn(v, k, p, I, a)
  ) : null;
}
function Jt({
  proxy: t
}) {
  const c = Z(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return lt(() => {
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
      } catch (F) {
        console.error("Error evaluating effect function during mount:", F), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    f.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function de(t) {
  const c = Vt(
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
  return st("text", {}, String(c));
}
function Yt({
  stateKey: t,
  itemComponentId: c,
  itemPath: h,
  children: f
}) {
  const [, v] = rt({}), [k, p] = Ut();
  return lt(() => {
    p.height > 0 && o.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: p.height
      }
    });
  }, [p.height]), dt(() => {
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
  }, [t, c, h.join(".")]), /* @__PURE__ */ yt("div", { ref: k, children: f });
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
