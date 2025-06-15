"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as nt, useRef as q, useEffect as at, useLayoutEffect as dt, useMemo as It, createElement as st, useSyncExternalStore as Mt, startTransition as jt, useCallback as Et } from "react";
import { transformStateFunc as Ot, isDeepEqual as z, isFunction as Z, getNestedValue as B, getDifferences as pt, debounce as Rt } from "./utility.js";
import { pushFunc as vt, updateFn as ot, cutFunc as lt, ValidationWrapper as Ft, FormControlComponent as Ut } from "./Functions.jsx";
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
function kt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = et(t) || {}, y = m[t] || {}, k = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !z(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(t, p);
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
    }, et(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const k = (I, a) => {
    const [v] = nt(a?.componentId ?? wt());
    kt({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [G, F] = Yt(
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
    return F;
  };
  function p(I, a) {
    kt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Bt(I, a), St(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: ut,
  setState: tt,
  getInitialOptions: et,
  getKeyState: Vt,
  getValidationErrors: Lt,
  setStateLog: Ht,
  updateInitialStateGlobal: At,
  addValidationError: zt,
  removeValidationError: Y,
  setServerSyncActions: qt
} = o.getState(), Nt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const k = Z(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
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
  const m = o.getState().cogsStateStore[t], { sessionId: f } = Ct(), y = Z(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const k = ft(
      `${f}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return tt(t, k.state), St(t), !0;
  }
  return !1;
}, xt = (t, c, m, f, y, k) => {
  const p = {
    initialState: c,
    updaterState: gt(
      t,
      f,
      y,
      k
    ),
    state: m
  };
  At(t, p.initialState), ut(t, p.updaterState), tt(t, p.state);
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
        oldValue: B(c, f),
        newValue: B(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(m, f)
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
function Yt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: k,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [G, F] = nt({}), { sessionId: U } = Ct();
  let L = !c;
  const [h] = nt(c ?? wt()), l = o.getState().stateLog[h], it = q(/* @__PURE__ */ new Set()), X = q(I ?? wt()), j = q(
    null
  );
  j.current = et(h) ?? null, at(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      tt(h, (r) => ({
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
      if (!(i && !z(i, a) || !i) && !s)
        return;
      let u = null;
      const A = Z(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      A && U && (u = ft(`${U}-${h}-${A}`));
      let w = a, T = !1;
      const P = s ? Date.now() : 0, x = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      s && P > x ? (w = e.serverState.data, T = !0) : u && x > M && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), xt(
        h,
        a,
        w,
        rt,
        X.current,
        U
      ), T && A && U && Nt(w, h, e, U, Date.now()), St(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || F({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), dt(() => {
    L && $t(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: j.current?.middleware
    });
    const e = `${h}////${X.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => F({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), F({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const rt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      it.current.add(u);
    }
    const g = o.getState();
    tt(h, (u) => {
      const A = Z(e) ? e(u) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let b = !1, N = g.signalDomElements.get(w);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), W = B(A, O);
          if (Array.isArray(W)) {
            b = !0;
            const $ = `${h}-${O.join(".")}`;
            N = g.signalDomElements.get($);
          }
        }
        if (N) {
          const O = b ? B(A, r.slice(0, -1)) : B(A, r);
          N.forEach(({ parentId: W, position: $, effect: E }) => {
            const C = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (C) {
              const R = Array.from(C.childNodes);
              if (R[$]) {
                const _ = E ? new Function("state", `return (${E})(state)`)(O) : O;
                R[$].textContent = String(_);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && r && Y(
        (i || j.current?.validation?.key) + "." + r.join(".")
      );
      const T = r.slice(0, r.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && Y(
        j.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Lt(
        j.current?.validation?.key + "." + T.join(".")
      ).filter(([N, O]) => {
        let W = N?.split(".").length;
        if (N == T.join(".") && W == T.length - 1) {
          let $ = N + "." + T;
          Y(N), zt($, O);
        }
      });
      const P = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const b = pt(u, A), N = new Set(b), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          W,
          $
        ] of P.components.entries()) {
          let E = !1;
          const C = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !C.includes("none")) {
            if (C.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (C.includes("component") && (($.paths.has(O) || $.paths.has("")) && (E = !0), !E))
              for (const R of N) {
                let _ = R;
                for (; ; ) {
                  if ($.paths.has(_)) {
                    E = !0;
                    break;
                  }
                  const D = _.lastIndexOf(".");
                  if (D !== -1) {
                    const H = _.substring(
                      0,
                      D
                    );
                    if (!isNaN(
                      Number(_.substring(D + 1))
                    ) && $.paths.has(H)) {
                      E = !0;
                      break;
                    }
                    _ = H;
                  } else
                    _ = "";
                  if (_ === "")
                    break;
                }
                if (E) break;
              }
            if (!E && C.includes("deps") && $.depsFunction) {
              const R = $.depsFunction(A);
              let _ = !1;
              typeof R == "boolean" ? R && (_ = !0) : z($.deps, R) || ($.deps = R, _ = !0), _ && (E = !0);
            }
            E && $.forceUpdate();
          }
        }
      }
      const x = Date.now();
      r = r.map((b, N) => {
        const O = r.slice(0, -1), W = B(A, O);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (W.length - 1).toString() : b;
      });
      const { oldValue: M, newValue: V } = Jt(
        s.updateType,
        u,
        A,
        r
      ), J = {
        timeStamp: x,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: V
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, r, A);
          break;
        case "insert":
          const b = r.slice(0, -1);
          g.insertShadowArrayElement(h, b, V);
          break;
        case "cut":
          const N = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, N, O);
          break;
      }
      if (Ht(h, (b) => {
        const O = [...b ?? [], J].reduce((W, $) => {
          const E = `${$.stateKey}:${JSON.stringify($.path)}`, C = W.get(E);
          return C ? (C.timeStamp = Math.max(C.timeStamp, $.timeStamp), C.newValue = $.newValue, C.oldValue = C.oldValue ?? $.oldValue, C.updateType = $.updateType) : W.set(E, { ...$ }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Nt(
        A,
        h,
        j.current,
        U
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: J
      }), j.current?.serverSync) {
        const b = g.serverState[h], N = j.current?.serverSync;
        qt(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: A }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
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
      X.current,
      U
    )
  ), o.getState().cogsStateStore[h] || tt(h, t), o.getState().initialStateGlobal[h] || At(h, t));
  const d = It(() => gt(
    h,
    rt,
    X.current,
    U
  ), [h, U]);
  return [Vt(h), d];
}
function gt(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && Y(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Y(n?.key), v?.validationKey && Y(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const G = a(S, []), F = et(t), U = Z(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, L = `${f}-${t}-${U}`;
      L && localStorage.removeItem(L), ut(t, G), tt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const n = gt(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], G = et(t), F = Z(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, U = `${f}-${t}-${F}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), jt(() => {
        At(t, v), o.getState().initializeShadowState(t, v), ut(t, n), tt(t, v);
        const L = o.getState().stateComponents.get(t);
        L && L.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (L) => n.get()[L]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = o.getState().serverState[t];
      return !!(v && z(v, Vt(t)));
    }
  };
  function a(v, n = [], S) {
    const G = n.map(String).join(".");
    y.get(G);
    const F = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      F[h] = I[h];
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
            const d = o.getState().initialStateGlobal[t], e = et(t), r = Z(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
              } = e, g = q(null), [u, A] = nt({
                startIndex: 0,
                endIndex: 10
              }), w = q(i), T = q(0), P = q(!0), x = q(!1), M = o().getNestedState(
                t,
                n
              ), V = M.length, { totalHeight: J, positions: b } = It(() => {
                const E = o.getState().getShadowMetadata(t, n) || [];
                let C = 0;
                const R = [];
                let _ = !1;
                for (let D = 0; D < V; D++) {
                  R[D] = C;
                  const H = E[D]?.virtualizer?.itemHeight;
                  H && (_ = !0), C += H || r;
                }
                return x.current = _, { totalHeight: C, positions: R };
              }, [V, t, n.join("."), r]), N = It(() => {
                const E = Math.max(0, u.startIndex), C = Math.min(V, u.endIndex), R = Array.from(
                  { length: C - E },
                  (D, H) => E + H
                ), _ = R.map((D) => M[D]);
                return a(_, n, {
                  ...S,
                  validIndices: R
                });
              }, [u.startIndex, u.endIndex, M, V]);
              dt(() => {
                const E = g.current;
                if (!E) return;
                const C = w.current, R = V > T.current;
                T.current = V;
                const _ = () => {
                  const { scrollTop: D, clientHeight: H, scrollHeight: Pt } = E;
                  w.current = Pt - D - H < 10;
                  let mt = 0, ct = V - 1;
                  for (; mt <= ct; ) {
                    const K = Math.floor((mt + ct) / 2);
                    b[K] < D ? mt = K + 1 : ct = K - 1;
                  }
                  const ht = Math.max(0, ct - s);
                  let Q = ht;
                  const _t = D + H;
                  for (; Q < V && b[Q] < _t; )
                    Q++;
                  Q = Math.min(V, Q + s), A((K) => K.startIndex !== ht || K.endIndex !== Q ? { startIndex: ht, endIndex: Q } : K);
                };
                return E.addEventListener("scroll", _, {
                  passive: !0
                }), i && !P.current && C && R && requestAnimationFrame(() => {
                  E.scrollTo({
                    top: E.scrollHeight,
                    behavior: "smooth"
                  });
                }), _(), () => E.removeEventListener("scroll", _);
              }, [V, b, s, i]), at(() => {
                if (i && P.current && V > 0 && x.current) {
                  const E = g.current;
                  E && requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      E.scrollTo({
                        top: E.scrollHeight,
                        behavior: "auto"
                      }), P.current = !1;
                    });
                  });
                }
              }, [i, V, b]);
              const O = Et(
                (E = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: E
                  });
                },
                []
              ), W = Et(
                (E, C = "smooth") => {
                  g.current && b[E] !== void 0 && g.current.scrollTo({
                    top: b[E],
                    behavior: C
                  });
                },
                [b]
              ), $ = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${J}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${b[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: N,
                virtualizerProps: $,
                scrollToBottom: O,
                scrollToIndex: W
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
                    const [, P] = nt({}), x = `${m}-${n.join(".")}-${i}`;
                    dt(() => {
                      const M = `${t}////${x}`, V = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return V.components.set(M, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([A.join(".")])
                      }), o.getState().stateComponents.set(t, V), () => {
                        const J = o.getState().stateComponents.get(t);
                        J && J.components.delete(M);
                      };
                    }, [t, x]);
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
            return (e) => v.map((s, i) => {
              let g;
              S?.validIndices && S.validIndices[i] !== void 0 ? g = S.validIndices[i] : g = i;
              const u = [...n, g.toString()], A = a(s, u, S);
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
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const u = r[i], A = [...n, i.toString()], w = a(u, A, S), T = `${m}-${n.join(".")}-${i}`;
                return st(Qt, {
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
              const r = v;
              y.clear(), k++;
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
              const i = o.getState().getNestedState(t, n), g = Z(e) ? e(i) : e;
              let u = null;
              if (!i.some((w) => {
                if (r) {
                  const P = r.every(
                    (x) => z(w[x], g[x])
                  );
                  return P && (u = w), P;
                }
                const T = z(w, g);
                return T && (u = w), T;
              }))
                p(n), vt(c, g, n, t);
              else if (s && u) {
                const w = s(u), T = i.map(
                  (P) => z(P, u) ? w : P
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
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => lt(
              c,
              d,
              t,
              Number(X)
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
                const g = pt(e, s), u = new Set(g);
                for (const [
                  A,
                  w
                ] of i.components.entries()) {
                  let T = !1;
                  const P = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (w.paths.has("") && (T = !0), !T))
                      for (const x of u) {
                        if (w.paths.has(x)) {
                          T = !0;
                          break;
                        }
                        let M = x.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const V = x.substring(0, M);
                          if (w.paths.has(V)) {
                            T = !0;
                            break;
                          }
                          const J = x.substring(
                            M + 1
                          );
                          if (!isNaN(Number(J))) {
                            const b = V.lastIndexOf(".");
                            if (b !== -1) {
                              const N = V.substring(
                                0,
                                b
                              );
                              if (w.paths.has(N)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          M = V.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && P.includes("deps") && w.depsFunction) {
                      const x = w.depsFunction(s);
                      let M = !1;
                      typeof x == "boolean" ? x && (M = !0) : z(w.deps, x) || (w.deps = x, M = !0), M && (T = !0);
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
            Ft,
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
              Rt(() => {
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
    }, L = new Proxy(F, U);
    return y.set(G, {
      proxy: L,
      stateVersion: k
    }), L;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function bt(t) {
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
    (y, k, p, I, a) => t._mapFn(y, k, p, I, a)
  ) : null;
}
function Xt({
  proxy: t
}) {
  const c = q(null), m = `${t._stateKey}-${t._path.join(".")}`;
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
      } catch (F) {
        console.error("Error evaluating effect function during mount:", F), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const G = document.createTextNode(String(S));
    f.replaceWith(G);
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
  const [, y] = nt({}), [k, p] = Gt(), I = q(null);
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ yt("div", { ref: k, children: f });
}
export {
  bt as $cogsSignal,
  fe as $cogsSignalStore,
  de as addStateOptions,
  ue as createCogsState,
  ge as notifyComponent,
  Yt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
