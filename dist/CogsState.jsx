"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as K, useRef as q, useEffect as st, useLayoutEffect as it, useMemo as Tt, createElement as rt, useSyncExternalStore as Ct, startTransition as Vt, useCallback as ft } from "react";
import { transformStateFunc as bt, isDeepEqual as L, isFunction as J, getNestedValue as z, getDifferences as ht, debounce as xt } from "./utility.js";
import { pushFunc as St, updateFn as nt, cutFunc as ot, ValidationWrapper as Pt, FormControlComponent as _t } from "./Functions.jsx";
import Mt from "superjson";
import { v4 as yt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as It } from "./store.js";
import { useCogsConfig as $t } from "./CogsStateClient.jsx";
import { applyPatch as jt } from "fast-json-patch";
import Ot from "react-use-measure";
function pt(t, c) {
  const h = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, v = h(t) || {};
  g(t, {
    ...v,
    ...c
  });
}
function wt({
  stateKey: t,
  options: c,
  initialOptionsPart: h
}) {
  const g = Q(t) || {}, v = h[t] || {}, $ = r.getState().setInitialStateOptions, p = { ...v, ...g };
  let I = !1;
  if (c)
    for (const o in c)
      p.hasOwnProperty(o) ? (o == "localStorage" && c[o] && p[o].key !== c[o]?.key && (I = !0, p[o] = c[o]), o == "initialState" && c[o] && p[o] !== c[o] && // Different references
      !L(p[o], c[o]) && (I = !0, p[o] = c[o])) : (I = !0, p[o] = c[o]);
  I && $(t, p);
}
function ae(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const oe = (t, c) => {
  let h = t;
  const [g, v] = bt(h);
  (Object.keys(v).length > 0 || c && Object.keys(c).length > 0) && Object.keys(v).forEach((I) => {
    v[I] = v[I] || {}, v[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...v[I].formElements || {}
      // State-specific overrides
    }, Q(I) || r.getState().setInitialStateOptions(I, v[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const $ = (I, o) => {
    const [y] = K(o?.componentId ?? yt());
    wt({
      stateKey: I,
      options: o,
      initialOptionsPart: v
    });
    const a = r.getState().cogsStateStore[I] || g[I], S = o?.modifyState ? o.modifyState(a) : a, [D, O] = Lt(
      S,
      {
        stateKey: I,
        syncUpdate: o?.syncUpdate,
        componentId: y,
        localStorage: o?.localStorage,
        middleware: o?.middleware,
        enabledSync: o?.enabledSync,
        reactiveType: o?.reactiveType,
        reactiveDeps: o?.reactiveDeps,
        initialState: o?.initialState,
        dependencies: o?.dependencies,
        serverState: o?.serverState
      }
    );
    return O;
  };
  function p(I, o) {
    wt({ stateKey: I, options: o, initialOptionsPart: v }), o.localStorage && Wt(I, o), ut(I);
  }
  return { useCogsState: $, setCogsOptions: p };
}, {
  setUpdaterState: ct,
  setState: Z,
  getInitialOptions: Q,
  getKeyState: kt,
  getValidationErrors: Ut,
  setStateLog: Rt,
  updateInitialStateGlobal: vt,
  addValidationError: Ft,
  removeValidationError: H,
  setServerSyncActions: Dt
} = r.getState(), Et = (t, c, h, g, v) => {
  h?.log && console.log(
    "saving to localstorage",
    c,
    h.localStorage?.key,
    g
  );
  const $ = J(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if ($ && g) {
    const p = `${g}-${c}-${$}`;
    let I;
    try {
      I = dt(p)?.lastSyncedWithServer;
    } catch {
    }
    const o = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? I
    }, y = Mt.serialize(o);
    window.localStorage.setItem(
      p,
      JSON.stringify(y.json)
    );
  }
}, dt = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Wt = (t, c) => {
  const h = r.getState().cogsStateStore[t], { sessionId: g } = $t(), v = J(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (v && g) {
    const $ = dt(
      `${g}-${t}-${v}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return Z(t, $.state), ut(t), !0;
  }
  return !1;
}, Nt = (t, c, h, g, v, $) => {
  const p = {
    initialState: c,
    updaterState: lt(
      t,
      g,
      v,
      $
    ),
    state: h
  };
  vt(t, p.initialState), ct(t, p.updaterState), Z(t, p.state);
}, ut = (t) => {
  const c = r.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || h.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((g) => g());
  });
}, se = (t, c) => {
  const h = r.getState().stateComponents.get(t);
  if (h) {
    const g = `${t}////${c}`, v = h.components.get(g);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Gt = (t, c, h, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: z(c, g),
        newValue: z(h, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: z(h, g)
      };
    case "cut":
      return {
        oldValue: z(c, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Lt(t, {
  stateKey: c,
  serverSync: h,
  localStorage: g,
  formElements: v,
  reactiveDeps: $,
  reactiveType: p,
  componentId: I,
  initialState: o,
  syncUpdate: y,
  dependencies: a,
  serverState: S
} = {}) {
  const [D, O] = K({}), { sessionId: U } = $t();
  let W = !c;
  const [m] = K(c ?? yt()), l = r.getState().stateLog[m], at = q(/* @__PURE__ */ new Set()), Y = q(I ?? yt()), j = q(
    null
  );
  j.current = Q(m) ?? null, st(() => {
    if (y && y.stateKey === m && y.path?.[0]) {
      Z(m, (n) => ({
        ...n,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), st(() => {
    if (o) {
      pt(m, {
        initialState: o
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = r.getState().initialStateGlobal[m];
      if (!(i && !L(i, o) || !i) && !s)
        return;
      let d = null;
      const k = J(e?.localStorage?.key) ? e?.localStorage?.key(o) : e?.localStorage?.key;
      k && U && (d = dt(`${U}-${m}-${k}`));
      let w = o, T = !1;
      const x = s ? Date.now() : 0, C = d?.lastUpdated || 0, V = d?.lastSyncedWithServer || 0;
      s && x > C ? (w = e.serverState.data, T = !0) : d && C > V && (w = d.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), r.getState().initializeShadowState(m, o), Nt(
        m,
        o,
        w,
        tt,
        Y.current,
        U
      ), T && k && U && Et(w, m, e, U, Date.now()), ut(m), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    o,
    S?.status,
    S?.data,
    ...a || []
  ]), it(() => {
    W && pt(m, {
      serverSync: h,
      formElements: v,
      initialState: o,
      localStorage: g,
      middleware: j.current?.middleware
    });
    const e = `${m}////${Y.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), O({}), () => {
      n && (n.components.delete(e), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const tt = (e, n, s, i) => {
    if (Array.isArray(n)) {
      const f = `${m}-${n.join(".")}`;
      at.current.add(f);
    }
    Z(m, (f) => {
      const d = J(e) ? e(f) : e, k = `${m}-${n.join(".")}`;
      if (k) {
        let _ = !1, N = r.getState().signalDomElements.get(k);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const A = n.slice(0, -1), P = z(d, A);
          if (Array.isArray(P)) {
            _ = !0;
            const E = `${m}-${A.join(".")}`;
            N = r.getState().signalDomElements.get(E);
          }
        }
        if (N) {
          const A = _ ? z(d, n.slice(0, -1)) : z(d, n);
          N.forEach(({ parentId: P, position: E, effect: M }) => {
            const b = document.querySelector(
              `[data-parent-id="${P}"]`
            );
            if (b) {
              const F = Array.from(b.childNodes);
              if (F[E]) {
                const R = M ? new Function("state", `return (${M})(state)`)(A) : A;
                F[E].textContent = String(R);
              }
            }
          });
        }
      }
      (() => {
        const _ = r.getState();
        switch (s.updateType) {
          case "update":
            _.updateShadowAtPath(m, n, d);
            break;
          case "insert":
            const N = n.slice(0, -1);
            _.insertShadowArrayElement(m, N);
            break;
          case "cut":
            const A = n.slice(0, -1), P = parseInt(n[n.length - 1]);
            _.removeShadowArrayElement(m, A, P);
            break;
        }
      })(), console.log("shadowState", r.getState().shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && n && H(
        (i || j.current?.validation?.key) + "." + n.join(".")
      );
      const T = n.slice(0, n.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && H(
        j.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Ut(
        j.current?.validation?.key + "." + T.join(".")
      ).filter(([N, A]) => {
        let P = N?.split(".").length;
        if (N == T.join(".") && P == T.length - 1) {
          let E = N + "." + T;
          H(N), Ft(E, A);
        }
      });
      const x = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", x), x) {
        const _ = ht(f, d), N = new Set(_), A = s.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          P,
          E
        ] of x.components.entries()) {
          let M = !1;
          const b = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !b.includes("none")) {
            if (b.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (b.includes("component") && ((E.paths.has(A) || E.paths.has("")) && (M = !0), !M))
              for (const F of N) {
                let R = F;
                for (; ; ) {
                  if (E.paths.has(R)) {
                    M = !0;
                    break;
                  }
                  const X = R.lastIndexOf(".");
                  if (X !== -1) {
                    const et = R.substring(
                      0,
                      X
                    );
                    if (!isNaN(
                      Number(R.substring(X + 1))
                    ) && E.paths.has(et)) {
                      M = !0;
                      break;
                    }
                    R = et;
                  } else
                    R = "";
                  if (R === "")
                    break;
                }
                if (M) break;
              }
            if (!M && b.includes("deps") && E.depsFunction) {
              const F = E.depsFunction(d);
              let R = !1;
              typeof F == "boolean" ? F && (R = !0) : L(E.deps, F) || (E.deps = F, R = !0), R && (M = !0);
            }
            M && E.forceUpdate();
          }
        }
      }
      const C = Date.now();
      n = n.map((_, N) => {
        const A = n.slice(0, -1), P = z(d, A);
        return N === n.length - 1 && ["insert", "cut"].includes(s.updateType) ? (P.length - 1).toString() : _;
      });
      const { oldValue: V, newValue: G } = Gt(
        s.updateType,
        f,
        d,
        n
      ), B = {
        timeStamp: C,
        stateKey: m,
        path: n,
        updateType: s.updateType,
        status: "new",
        oldValue: V,
        newValue: G
      };
      if (Rt(m, (_) => {
        const A = [..._ ?? [], B].reduce((P, E) => {
          const M = `${E.stateKey}:${JSON.stringify(E.path)}`, b = P.get(M);
          return b ? (b.timeStamp = Math.max(b.timeStamp, E.timeStamp), b.newValue = E.newValue, b.oldValue = b.oldValue ?? E.oldValue, b.updateType = E.updateType) : P.set(M, { ...E }), P;
        }, /* @__PURE__ */ new Map());
        return Array.from(A.values());
      }), Et(
        d,
        m,
        j.current,
        U
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: B
      }), j.current?.serverSync) {
        const _ = r.getState().serverState[m], N = j.current?.serverSync;
        Dt(m, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: d }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return d;
    });
  };
  r.getState().updaterState[m] || (ct(
    m,
    lt(
      m,
      tt,
      Y.current,
      U
    )
  ), r.getState().cogsStateStore[m] || Z(m, t), r.getState().initialStateGlobal[m] || vt(m, t));
  const u = Tt(() => lt(
    m,
    tt,
    Y.current,
    U
  ), [m, U]);
  return [kt(m), u];
}
function lt(t, c, h, g) {
  const v = /* @__PURE__ */ new Map();
  let $ = 0;
  const p = (y) => {
    const a = y.join(".");
    for (const [S] of v)
      (S === a || S.startsWith(a + ".")) && v.delete(S);
    $++;
  }, I = {
    removeValidation: (y) => {
      y?.validationKey && H(y.validationKey);
    },
    revertToInitialState: (y) => {
      const a = r.getState().getInitialOptions(t)?.validation;
      a?.key && H(a?.key), y?.validationKey && H(y.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), v.clear(), $++;
      const D = o(S, []), O = Q(t), U = J(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, W = `${g}-${t}-${U}`;
      W && localStorage.removeItem(W), ct(t, D), Z(t, S);
      const m = r.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      v.clear(), $++;
      const a = lt(
        t,
        c,
        h,
        g
      ), S = r.getState().initialStateGlobal[t], D = Q(t), O = J(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, U = `${g}-${t}-${O}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Vt(() => {
        vt(t, y), r.getState().initializeShadowState(t, y), ct(t, a), Z(t, y);
        const W = r.getState().stateComponents.get(t);
        W && W.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (W) => a.get()[W]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = r.getState().serverState[t];
      return !!(y && L(y, kt(t)));
    }
  };
  function o(y, a = [], S) {
    const D = a.map(String).join(".");
    v.get(D);
    const O = function() {
      return r().getNestedState(t, a);
    };
    Object.keys(I).forEach((m) => {
      O[m] = I[m];
    });
    const U = {
      apply(m, l, at) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${a.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, a);
      },
      get(m, l) {
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
          const u = `${t}////${h}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(u);
            if (n && !n.paths.has("")) {
              const s = a.join(".");
              let i = !0;
              for (const f of n.paths)
                if (s.startsWith(f) && (s === f || s[f.length] === ".")) {
                  i = !1;
                  break;
                }
              i && n.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => ht(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && a.length === 0)
          return async function() {
            const u = r.getState().getInitialOptions(t), e = u?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(t, []), s = u?.validation?.key;
            try {
              const i = await e.action(n);
              if (i && !i.success && i.errors && s) {
                r.getState().removeValidationError(s), i.errors.forEach((d) => {
                  const k = [s, ...d.path].join(".");
                  r.getState().addValidationError(k, d.message);
                });
                const f = r.getState().stateComponents.get(t);
                f && f.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const u = r.getState().getNestedState(t, a), e = r.getState().initialStateGlobal[t], n = z(e, a);
          return L(u, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              t,
              a
            ), e = r.getState().initialStateGlobal[t], n = z(e, a);
            return L(u, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = r.getState().initialStateGlobal[t], e = Q(t), n = J(e?.localStorage?.key) ? e?.localStorage?.key(u) : e?.localStorage?.key, s = `${g}-${t}-${n}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const u = r.getState().getInitialOptions(t)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(u.key + "." + a.join("."));
          };
        if (Array.isArray(y)) {
          const u = () => S?.validIndices ? y.map((n, s) => ({
            item: n,
            originalIndex: S.validIndices[s]
          })) : r.getState().getNestedState(t, a).map((n, s) => ({
            item: n,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, a.join("."));
              if (e !== void 0)
                return o(
                  y[e],
                  [...a, e.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: a });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, a.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: n,
                overscan: s = 5,
                stickToBottom: i = !1
              } = e, f = q(null), [d, k] = K({
                startIndex: 0,
                endIndex: 10
              });
              ft((A) => r.getState().getShadowMetadata(t, [...a, A.toString()])?.virtualizer?.itemHeight || e.itemHeight, []);
              const w = q(i), T = q(0), x = q(!0), C = r().getNestedState(
                t,
                a
              ), V = C.length, G = Tt(() => {
                const A = Math.max(0, d.startIndex), P = Math.min(V, d.endIndex), E = Array.from(
                  { length: P - A },
                  (b, F) => A + F
                ), M = E.map((b) => C[b]);
                return o(M, a, {
                  ...S,
                  validIndices: E
                });
              }, [d.startIndex, d.endIndex, C, V]);
              it(() => {
                const A = f.current;
                if (!A) return;
                const P = w.current, E = V > T.current;
                T.current = V;
                const M = () => {
                  const { scrollTop: b, clientHeight: F, scrollHeight: R } = A;
                  w.current = R - b - F < 10;
                  const X = Math.max(
                    0,
                    Math.floor(b / n) - s
                  ), et = Math.min(
                    V,
                    Math.ceil((b + F) / n) + s
                  );
                  k((gt) => gt.startIndex !== X || gt.endIndex !== et ? { startIndex: X, endIndex: et } : gt);
                };
                return A.addEventListener("scroll", M, {
                  passive: !0
                }), i && (x.current ? A.scrollTo({
                  top: A.scrollHeight,
                  behavior: "auto"
                }) : P && E && requestAnimationFrame(() => {
                  A.scrollTo({
                    top: A.scrollHeight,
                    behavior: "smooth"
                  });
                })), x.current = !1, M(), () => A.removeEventListener("scroll", M);
              }, [V, n, s, i]);
              const B = ft(
                (A = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: f.current.scrollHeight,
                    behavior: A
                  });
                },
                []
              ), _ = ft(
                (A, P = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: A * n,
                    behavior: P
                  });
                },
                [n]
              ), N = {
                outer: {
                  ref: f,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${V * n}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${d.startIndex * n}px)`
                  }
                }
              };
              return {
                virtualState: G,
                virtualizerProps: N,
                scrollToBottom: B,
                scrollToIndex: _
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...u()].sort(
                (d, k) => e(d.item, k.item)
              ), i = s.map(({ item: d }) => d), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: d }) => d
                )
              };
              return o(i, a, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = u().filter(
                ({ item: d }, k) => e(d, k)
              ), i = s.map(({ item: d }) => d), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: d }) => d
                )
              };
              return o(i, a, f);
            };
          if (l === "stateMap")
            return (e) => {
              const n = r.getState().getNestedState(t, a);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (i, f) => f)).map((i, f) => {
                const d = n[i], k = [...a, i.toString()], w = o(d, k, S);
                return e(d, w, {
                  register: () => {
                    const [, x] = K({}), C = `${h}-${a.join(".")}-${i}`;
                    it(() => {
                      const V = `${t}////${C}`, G = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return G.components.set(V, {
                        forceUpdate: () => x({}),
                        paths: /* @__PURE__ */ new Set([k.join(".")])
                      }), r.getState().stateComponents.set(t, G), () => {
                        const B = r.getState().stateComponents.get(t);
                        B && B.components.delete(V);
                      };
                    }, [t, C]);
                  },
                  index: f,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${a.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => y.map((s, i) => {
              let f;
              S?.validIndices && S.validIndices[i] !== void 0 ? f = S.validIndices[i] : f = i;
              const d = [...a, f.toString()], k = o(s, d, S);
              return e(
                s,
                k,
                i,
                y,
                o(y, a, S)
              );
            });
          if (l === "$stateMap")
            return (e) => rt(zt, {
              proxy: {
                _stateKey: t,
                _path: a,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: o
            });
          if (l === "stateList")
            return (e) => {
              const n = r.getState().getNestedState(t, a);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (i, f) => f)).map((i, f) => {
                const d = n[i], k = [...a, i.toString()], w = o(d, k, S), T = `${h}-${a.join(".")}-${i}`;
                return rt(Ht, {
                  key: i,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: k,
                  children: e(
                    d,
                    w,
                    f,
                    n,
                    o(n, a, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${a.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const n = y;
              v.clear(), $++;
              const s = n.flatMap(
                (i) => i[e] ?? []
              );
              return o(
                s,
                [...a, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const n = y[e];
              return o(n, [...a, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, a);
              if (e.length === 0) return;
              const n = e.length - 1, s = e[n], i = [...a, n.toString()];
              return o(s, i);
            };
          if (l === "insert")
            return (e) => (p(a), St(c, e, a, t), o(
              r.getState().getNestedState(t, a),
              a
            ));
          if (l === "uniqueInsert")
            return (e, n, s) => {
              const i = r.getState().getNestedState(t, a), f = J(e) ? e(i) : e;
              let d = null;
              if (!i.some((w) => {
                if (n) {
                  const x = n.every(
                    (C) => L(w[C], f[C])
                  );
                  return x && (d = w), x;
                }
                const T = L(w, f);
                return T && (d = w), T;
              }))
                p(a), St(c, f, a, t);
              else if (s && d) {
                const w = s(d), T = i.map(
                  (x) => L(x, d) ? w : x
                );
                p(a), nt(c, T, a);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return p(a), ot(c, a, t, e), o(
                  r.getState().getNestedState(t, a),
                  a
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < y.length; n++)
                y[n] === e && ot(c, a, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = y.findIndex((s) => s === e);
              n > -1 ? ot(c, a, t, n) : St(c, e, a, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = u().find(
                ({ item: f }, d) => e(f, d)
              );
              if (!s) return;
              const i = [...a, s.originalIndex.toString()];
              return o(s.item, i, S);
            };
          if (l === "findWith")
            return (e, n) => {
              const i = u().find(
                ({ item: d }) => d[e] === n
              );
              if (!i) return;
              const f = [...a, i.originalIndex.toString()];
              return o(i.item, f, S);
            };
        }
        const Y = a[a.length - 1];
        if (!isNaN(Number(Y))) {
          const u = a.slice(0, -1), e = r.getState().getNestedState(t, u);
          if (Array.isArray(e) && l === "cut")
            return () => ot(
              c,
              u,
              t,
              Number(Y)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(y)) {
              const u = r.getState().getNestedState(t, a);
              return S.validIndices.map((e) => u[e]);
            }
            return r.getState().getNestedState(t, a);
          };
        if (l === "$derive")
          return (u) => At({
            _stateKey: t,
            _path: a,
            _effect: u.toString()
          });
        if (l === "$get")
          return () => At({
            _stateKey: t,
            _path: a
          });
        if (l === "lastSynced") {
          const u = `${t}:${a.join(".")}`;
          return r.getState().getSyncInfo(u);
        }
        if (l == "getLocalStorage")
          return (u) => dt(g + "-" + t + "-" + u);
        if (l === "_selected") {
          const u = a.slice(0, -1), e = u.join("."), n = r.getState().getNestedState(t, u);
          return Array.isArray(n) ? Number(a[a.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const e = a.slice(0, -1), n = Number(a[a.length - 1]), s = e.join(".");
            u ? r.getState().setSelectedIndex(t, s, n) : r.getState().setSelectedIndex(t, s, void 0);
            const i = r.getState().getNestedState(t, [...e]);
            nt(c, i, e), p(e);
          };
        if (l === "toggleSelected")
          return () => {
            const u = a.slice(0, -1), e = Number(a[a.length - 1]), n = u.join("."), s = r.getState().getSelectedIndex(t, n);
            r.getState().setSelectedIndex(
              t,
              n,
              s === e ? void 0 : e
            );
            const i = r.getState().getNestedState(t, [...u]);
            nt(c, i, u), p(u);
          };
        if (a.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const e = r.getState().cogsStateStore[t], s = jt(e, u).newDocument;
              Nt(
                t,
                r.getState().initialStateGlobal[t],
                s,
                c,
                h,
                g
              );
              const i = r.getState().stateComponents.get(t);
              if (i) {
                const f = ht(e, s), d = new Set(f);
                for (const [
                  k,
                  w
                ] of i.components.entries()) {
                  let T = !1;
                  const x = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (w.paths.has("") && (T = !0), !T))
                      for (const C of d) {
                        if (w.paths.has(C)) {
                          T = !0;
                          break;
                        }
                        let V = C.lastIndexOf(".");
                        for (; V !== -1; ) {
                          const G = C.substring(0, V);
                          if (w.paths.has(G)) {
                            T = !0;
                            break;
                          }
                          const B = C.substring(
                            V + 1
                          );
                          if (!isNaN(Number(B))) {
                            const _ = G.lastIndexOf(".");
                            if (_ !== -1) {
                              const N = G.substring(
                                0,
                                _
                              );
                              if (w.paths.has(N)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          V = G.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && x.includes("deps") && w.depsFunction) {
                      const C = w.depsFunction(s);
                      let V = !1;
                      typeof C == "boolean" ? C && (V = !0) : L(w.deps, C) || (w.deps = C, V = !0), V && (T = !0);
                    }
                    T && w.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const u = r.getState().getInitialOptions(t)?.validation, e = r.getState().addValidationError;
              if (!u?.zodSchema)
                throw new Error("Zod schema not found");
              if (!u?.key)
                throw new Error("Validation key not found");
              H(u.key);
              const n = r.getState().cogsStateStore[t];
              try {
                const s = r.getState().getValidationErrors(u.key);
                s && s.length > 0 && s.forEach(([f]) => {
                  f && f.startsWith(u.key) && H(f);
                });
                const i = u.zodSchema.safeParse(n);
                return i.success ? !0 : (i.error.errors.forEach((d) => {
                  const k = d.path, w = d.message, T = [u.key, ...k].join(".");
                  e(T, w);
                }), ut(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => It.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return r.getState().serverState[t];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
        }
        if (l === "getFormRef")
          return () => It.getState().getFormRef(t + "." + a.join("."));
        if (l === "validationWrapper")
          return ({
            children: u,
            hideMessage: e
          }) => /* @__PURE__ */ mt(
            Pt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: a,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: u
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return a;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (u, e) => {
            if (e?.debounce)
              xt(() => {
                nt(c, u, a, "");
                const n = r.getState().getNestedState(t, a);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              nt(c, u, a, "");
              const n = r.getState().getNestedState(t, a);
              e?.afterUpdate && e.afterUpdate(n);
            }
            p(a);
          };
        if (l === "formElement")
          return (u, e) => /* @__PURE__ */ mt(
            _t,
            {
              setState: c,
              stateKey: t,
              path: a,
              child: u,
              formOpts: e
            }
          );
        const j = [...a, l], tt = r.getState().getNestedState(t, j);
        return o(tt, j, S);
      }
    }, W = new Proxy(O, U);
    return v.set(D, {
      proxy: W,
      stateVersion: $
    }), W;
  }
  return o(
    r.getState().getNestedState(t, [])
  );
}
function At(t) {
  return rt(Bt, { proxy: t });
}
function zt({
  proxy: t,
  rebuildStateShape: c
}) {
  const h = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? c(
    h,
    t._path
  ).stateMapNoRender(
    (v, $, p, I, o) => t._mapFn(v, $, p, I, o)
  ) : null;
}
function Bt({
  proxy: t
}) {
  const c = q(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return st(() => {
    const g = c.current;
    if (!g || !g.parentElement) return;
    const v = g.parentElement, p = Array.from(v.childNodes).indexOf(g);
    let I = v.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", I));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
      effect: t._effect
    };
    r.getState().addSignalElement(h, y);
    const a = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(a);
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), S = a;
      }
    else
      S = a;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const D = document.createTextNode(String(S));
    g.replaceWith(D);
  }, [t._stateKey, t._path.join("."), t._effect]), rt("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function ie(t) {
  const c = Ct(
    (h) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return rt("text", {}, String(c));
}
function Ht({
  stateKey: t,
  itemComponentId: c,
  itemPath: h,
  children: g
}) {
  const [, v] = K({}), [$, p] = Ot();
  return st(() => {
    p.height > 0 && r.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: p.height
      }
    });
  }, [p.height]), it(() => {
    const I = `${t}////${c}`, o = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(I, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set([h.join(".")])
    }), r.getState().stateComponents.set(t, o), () => {
      const y = r.getState().stateComponents.get(t);
      y && y.components.delete(I);
    };
  }, [t, c, h.join(".")]), /* @__PURE__ */ mt("div", { ref: $, children: g });
}
export {
  At as $cogsSignal,
  ie as $cogsSignalStore,
  ae as addStateOptions,
  oe as createCogsState,
  se as notifyComponent,
  Lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
