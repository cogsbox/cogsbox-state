"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as tt, useRef as B, useEffect as at, useLayoutEffect as dt, useMemo as It, createElement as st, useSyncExternalStore as Mt, startTransition as jt, useCallback as Et } from "react";
import { transformStateFunc as Ot, isDeepEqual as H, isFunction as Y, getNestedValue as z, getDifferences as pt, debounce as Ft } from "./utility.js";
import { pushFunc as vt, updateFn as ot, cutFunc as lt, ValidationWrapper as Rt, FormControlComponent as Ut } from "./Functions.jsx";
import Dt from "superjson";
import { v4 as wt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Tt } from "./store.js";
import { useCogsConfig as Ct } from "./CogsStateClient.jsx";
import { applyPatch as Wt } from "fast-json-patch";
import Gt from "react-use-measure";
function $t(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function bt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = nt(t) || {}, y = m[t] || {}, b = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !H(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && b(t, p);
}
function de(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const ue = (t, c) => {
  let m = t;
  const [f, y] = Ot(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, nt(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const b = (I, a) => {
    const [v] = tt(a?.componentId ?? wt());
    bt({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [W, R] = Yt(
      S,
      {
        stateKey: I,
        syncUpdate: a?.syncUpdate,
        componentId: v,
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
  function p(I, a) {
    bt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Bt(I, a), St(I);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: ut,
  setState: et,
  getInitialOptions: nt,
  getKeyState: Vt,
  getValidationErrors: Lt,
  setStateLog: Ht,
  updateInitialStateGlobal: At,
  addValidationError: zt,
  removeValidationError: J,
  setServerSyncActions: qt
} = o.getState(), kt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const b = Y(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const p = `${f}-${c}-${b}`;
    let I;
    try {
      I = ft(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Dt.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
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
  const m = o.getState().cogsStateStore[t], { sessionId: f } = Ct(), y = Y(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const b = ft(
      `${f}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return et(t, b.state), St(t), !0;
  }
  return !1;
}, xt = (t, c, m, f, y, b) => {
  const p = {
    initialState: c,
    updaterState: gt(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  At(t, p.initialState), ut(t, p.updaterState), et(t, p.state);
}, St = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, ge = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${c}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Jt = (t, c, m, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: z(c, f),
        newValue: z(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: z(m, f)
      };
    case "cut":
      return {
        oldValue: z(c, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Yt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: b,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [W, R] = tt({}), { sessionId: U } = Ct();
  let G = !c;
  const [h] = tt(c ?? wt()), l = o.getState().stateLog[h], it = B(/* @__PURE__ */ new Set()), Z = B(I ?? wt()), j = B(
    null
  );
  j.current = nt(h) ?? null, at(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      et(h, (r) => ({
        ...r,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), at(() => {
    if (a) {
      $t(h, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !H(i, a) || !i) && !s)
        return;
      let g = null;
      const A = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      A && U && (g = ft(`${U}-${h}-${A}`));
      let w = a, T = !1;
      const _ = s ? Date.now() : 0, C = g?.lastUpdated || 0, M = g?.lastSyncedWithServer || 0;
      s && _ > C ? (w = e.serverState.data, T = !0) : g && C > M && (w = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), xt(
        h,
        a,
        w,
        rt,
        Z.current,
        U
      ), T && A && U && kt(w, h, e, U, Date.now()), St(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || R({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), dt(() => {
    G && $t(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: j.current?.middleware
    });
    const e = `${h}////${Z.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), R({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const rt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const g = `${h}-${r.join(".")}`;
      it.current.add(g);
    }
    const u = o.getState();
    et(h, (g) => {
      const A = Y(e) ? e(g) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let V = !1, k = u.signalDomElements.get(w);
        if ((!k || k.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), D = z(A, O);
          if (Array.isArray(D)) {
            V = !0;
            const $ = `${h}-${O.join(".")}`;
            k = u.signalDomElements.get($);
          }
        }
        if (k) {
          const O = V ? z(A, r.slice(0, -1)) : z(A, r);
          k.forEach(({ parentId: D, position: $, effect: E }) => {
            const N = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (N) {
              const F = Array.from(N.childNodes);
              if (F[$]) {
                const x = E ? new Function("state", `return (${E})(state)`)(O) : O;
                F[$].textContent = String(x);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && r && J(
        (i || j.current?.validation?.key) + "." + r.join(".")
      );
      const T = r.slice(0, r.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && J(
        j.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Lt(
        j.current?.validation?.key + "." + T.join(".")
      ).filter(([k, O]) => {
        let D = k?.split(".").length;
        if (k == T.join(".") && D == T.length - 1) {
          let $ = k + "." + T;
          J(k), zt($, O);
        }
      });
      const _ = u.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const V = pt(g, A), k = new Set(V), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of _.components.entries()) {
          let E = !1;
          const N = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !N.includes("none")) {
            if (N.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (N.includes("component") && (($.paths.has(O) || $.paths.has("")) && (E = !0), !E))
              for (const F of k) {
                let x = F;
                for (; ; ) {
                  if ($.paths.has(x)) {
                    E = !0;
                    break;
                  }
                  const L = x.lastIndexOf(".");
                  if (L !== -1) {
                    const X = x.substring(
                      0,
                      L
                    );
                    if (!isNaN(
                      Number(x.substring(L + 1))
                    ) && $.paths.has(X)) {
                      E = !0;
                      break;
                    }
                    x = X;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (E) break;
              }
            if (!E && N.includes("deps") && $.depsFunction) {
              const F = $.depsFunction(A);
              let x = !1;
              typeof F == "boolean" ? F && (x = !0) : H($.deps, F) || ($.deps = F, x = !0), x && (E = !0);
            }
            E && $.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((V, k) => {
        const O = r.slice(0, -1), D = z(A, O);
        return k === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : V;
      });
      const { oldValue: M, newValue: P } = Jt(
        s.updateType,
        g,
        A,
        r
      ), q = {
        timeStamp: C,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: P
      };
      switch (s.updateType) {
        case "update":
          u.updateShadowAtPath(h, r, A);
          break;
        case "insert":
          const V = r.slice(0, -1);
          u.insertShadowArrayElement(h, V, P);
          break;
        case "cut":
          const k = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          u.removeShadowArrayElement(h, k, O);
          break;
      }
      if (Ht(h, (V) => {
        const O = [...V ?? [], q].reduce((D, $) => {
          const E = `${$.stateKey}:${JSON.stringify($.path)}`, N = D.get(E);
          return N ? (N.timeStamp = Math.max(N.timeStamp, $.timeStamp), N.newValue = $.newValue, N.oldValue = N.oldValue ?? $.oldValue, N.updateType = $.updateType) : D.set(E, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), kt(
        A,
        h,
        j.current,
        U
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: q
      }), j.current?.serverSync) {
        const V = u.serverState[h], k = j.current?.serverSync;
        qt(h, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: A }),
          rollBackState: V,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  o.getState().updaterState[h] || (ut(
    h,
    gt(
      h,
      rt,
      Z.current,
      U
    )
  ), o.getState().cogsStateStore[h] || et(h, t), o.getState().initialStateGlobal[h] || At(h, t));
  const d = It(() => gt(
    h,
    rt,
    Z.current,
    U
  ), [h, U]);
  return [Vt(h), d];
}
function gt(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    b++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const W = a(S, []), R = nt(t), U = Y(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, G = `${f}-${t}-${U}`;
      G && localStorage.removeItem(G), ut(t, W), et(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = gt(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], W = nt(t), R = Y(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, U = `${f}-${t}-${R}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), jt(() => {
        At(t, v), o.getState().initializeShadowState(t, v), ut(t, n), et(t, v);
        const G = o.getState().stateComponents.get(t);
        G && G.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = o.getState().serverState[t];
      return !!(v && H(v, Vt(t)));
    }
  };
  function a(v, n = [], S) {
    const W = n.map(String).join(".");
    y.get(W);
    const R = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      R[h] = I[h];
    });
    const U = {
      apply(h, l, it) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
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
          const d = `${t}////${m}`, e = o.getState().stateComponents.get(t);
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
                o.getState().removeValidationError(s), i.errors.forEach((g) => {
                  const A = [s, ...g.path].join(".");
                  o.getState().addValidationError(A, g.message);
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
            const d = o.getState().initialStateGlobal[t], e = nt(t), r = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => S?.validIndices ? v.map((r, s) => ({
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
                  v[e],
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
              } = e, u = B(null), [g, A] = tt({
                startIndex: 0,
                endIndex: 10
              }), [, w] = tt({}), T = B(i), _ = B(0), C = B(!0);
              at(() => o.getState().subscribeToShadowState(t, () => w({})), [t]);
              const M = o().getNestedState(
                t,
                n
              ), P = M.length, { totalHeight: q, positions: V } = It(() => {
                const E = o.getState().getShadowMetadata(t, n) || [];
                let N = 0;
                const F = [];
                for (let x = 0; x < P; x++) {
                  F[x] = N;
                  const L = E[x]?.virtualizer?.itemHeight;
                  N += L || r;
                }
                return { totalHeight: N, positions: F };
              }, [P, t, n.join("."), r]), k = It(() => {
                const E = Math.max(0, g.startIndex), N = Math.min(P, g.endIndex), F = Array.from(
                  { length: N - E },
                  (L, X) => E + X
                ), x = F.map((L) => M[L]);
                return a(x, n, {
                  ...S,
                  validIndices: F
                });
              }, [g.startIndex, g.endIndex, M, P]);
              dt(() => {
                const E = u.current;
                if (!E) return;
                const N = T.current, F = P > _.current;
                _.current = P;
                const x = () => {
                  const { scrollTop: L, clientHeight: X, scrollHeight: Pt } = E;
                  T.current = Pt - L - X < 10;
                  let mt = 0, ct = P - 1;
                  for (; mt <= ct; ) {
                    const K = Math.floor((mt + ct) / 2);
                    V[K] < L ? mt = K + 1 : ct = K - 1;
                  }
                  const ht = Math.max(0, ct - s);
                  let Q = ht;
                  const _t = L + X;
                  for (; Q < P && V[Q] < _t; )
                    Q++;
                  Q = Math.min(P, Q + s), A((K) => K.startIndex !== ht || K.endIndex !== Q ? { startIndex: ht, endIndex: Q } : K);
                };
                return E.addEventListener("scroll", x, {
                  passive: !0
                }), i && (C.current && P > 0 ? requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    u.current && (u.current.scrollTo({
                      top: u.current.scrollHeight,
                      behavior: "auto"
                    }), C.current = !1);
                  });
                }) : !C.current && N && F && requestAnimationFrame(() => {
                  E.scrollTo({
                    top: E.scrollHeight,
                    behavior: "smooth"
                  });
                })), x(), () => E.removeEventListener("scroll", x);
              }, [P, V, s, i]);
              const O = Et(
                (E = "smooth") => {
                  u.current && u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: E
                  });
                },
                []
              ), D = Et(
                (E, N = "smooth") => {
                  u.current && V[E] !== void 0 && u.current.scrollTo({
                    top: V[E],
                    behavior: N
                  });
                },
                [V]
              ), $ = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${q}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${V[g.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: k,
                virtualizerProps: $,
                scrollToBottom: O,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (g, A) => e(g.item, A.item)
              ), i = s.map(({ item: g }) => g), u = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: g }) => g
                )
              };
              return a(i, n, u);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: g }, A) => e(g, A)
              ), i = s.map(({ item: g }) => g), u = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: g }) => g
                )
              };
              return a(i, n, u);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, u) => u)).map((i, u) => {
                const g = r[i], A = [...n, i.toString()], w = a(g, A, S);
                return e(g, w, {
                  register: () => {
                    const [, _] = tt({}), C = `${m}-${n.join(".")}-${i}`;
                    dt(() => {
                      const M = `${t}////${C}`, P = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return P.components.set(M, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([A.join(".")])
                      }), o.getState().stateComponents.set(t, P), () => {
                        const q = o.getState().stateComponents.get(t);
                        q && q.components.delete(M);
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
            return (e) => v.map((s, i) => {
              let u;
              S?.validIndices && S.validIndices[i] !== void 0 ? u = S.validIndices[i] : u = i;
              const g = [...n, u.toString()], A = a(s, g, S);
              return e(
                s,
                A,
                i,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => st(Zt, {
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
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, u) => u)).map((i, u) => {
                const g = r[i], A = [...n, i.toString()], w = a(g, A, S), T = `${m}-${n.join(".")}-${i}`;
                return st(Qt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: A,
                  children: e(
                    g,
                    w,
                    u,
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
              const r = v;
              y.clear(), b++;
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
              const r = v[e];
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
            return (e) => (p(n), vt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), u = Y(e) ? e(i) : e;
              let g = null;
              if (!i.some((w) => {
                if (r) {
                  const _ = r.every(
                    (C) => H(w[C], u[C])
                  );
                  return _ && (g = w), _;
                }
                const T = H(w, u);
                return T && (g = w), T;
              }))
                p(n), vt(c, u, n, t);
              else if (s && g) {
                const w = s(g), T = i.map(
                  (_) => H(_, g) ? w : _
                );
                p(n), ot(c, T, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), lt(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && lt(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? lt(c, n, t, r) : vt(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: u }, g) => e(u, g)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = d().find(
                ({ item: g }) => g[e] === r
              );
              if (!i) return;
              const u = [...n, i.originalIndex.toString()];
              return a(i.item, u, S);
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
            if (S?.validIndices && Array.isArray(v)) {
              const d = o.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
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
            ot(c, i, e), p(e);
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
            ot(c, i, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Wt(e, d).newDocument;
              xt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const u = pt(e, s), g = new Set(u);
                for (const [
                  A,
                  w
                ] of i.components.entries()) {
                  let T = !1;
                  const _ = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (w.paths.has("") && (T = !0), !T))
                      for (const C of g) {
                        if (w.paths.has(C)) {
                          T = !0;
                          break;
                        }
                        let M = C.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const P = C.substring(0, M);
                          if (w.paths.has(P)) {
                            T = !0;
                            break;
                          }
                          const q = C.substring(
                            M + 1
                          );
                          if (!isNaN(Number(q))) {
                            const V = P.lastIndexOf(".");
                            if (V !== -1) {
                              const k = P.substring(
                                0,
                                V
                              );
                              if (w.paths.has(k)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          M = P.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && _.includes("deps") && w.depsFunction) {
                      const C = w.depsFunction(s);
                      let M = !1;
                      typeof C == "boolean" ? C && (M = !0) : H(w.deps, C) || (w.deps = C, M = !0), M && (T = !0);
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
              J(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([u]) => {
                  u && u.startsWith(d.key) && J(u);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((g) => {
                  const A = g.path, w = g.message, T = [d.key, ...A].join(".");
                  e(T, w);
                }), St(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
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
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
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
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ft(() => {
                ot(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              ot(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ yt(
            Ut,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const j = [...n, l], rt = o.getState().getNestedState(t, j);
        return a(rt, j, S);
      }
    }, G = new Proxy(R, U);
    return y.set(W, {
      proxy: G,
      stateVersion: b
    }), G;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Nt(t) {
  return st(Xt, { proxy: t });
}
function Zt({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (y, b, p, I, a) => t._mapFn(y, b, p, I, a)
  ) : null;
}
function Xt({
  proxy: t
}) {
  const c = B(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return at(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, p = Array.from(y.childNodes).indexOf(f);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
      effect: t._effect
    };
    o.getState().addSignalElement(m, v);
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
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function fe(t) {
  const c = Mt(
    (m) => {
      const f = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return st("text", {}, String(c));
}
function Qt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = tt({}), [b, p] = Gt(), I = B(null);
  return at(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), dt(() => {
    const a = `${t}////${c}`, v = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, v), () => {
      const n = o.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, c, m.join(".")]), /* @__PURE__ */ yt("div", { ref: b, children: f });
}
export {
  Nt as $cogsSignal,
  fe as $cogsSignalStore,
  de as addStateOptions,
  ue as createCogsState,
  ge as notifyComponent,
  Yt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
