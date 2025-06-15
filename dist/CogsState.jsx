"use client";
import { jsx as St } from "react/jsx-runtime";
import { useState as K, useRef as H, useEffect as st, useLayoutEffect as it, useMemo as Tt, createElement as rt, useSyncExternalStore as Ct, startTransition as Vt, useCallback as vt } from "react";
import { transformStateFunc as bt, isDeepEqual as L, isFunction as J, getNestedValue as z, getDifferences as mt, debounce as xt } from "./utility.js";
import { pushFunc as gt, updateFn as nt, cutFunc as at, ValidationWrapper as Pt, FormControlComponent as _t } from "./Functions.jsx";
import Mt from "superjson";
import { v4 as ht } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as It } from "./store.js";
import { useCogsConfig as $t } from "./CogsStateClient.jsx";
import { applyPatch as jt } from "fast-json-patch";
import Ot from "react-use-measure";
function pt(t, c) {
  const h = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, v = h(t) || {};
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
  const g = Q(t) || {}, v = h[t] || {}, k = o.getState().setInitialStateOptions, p = { ...v, ...g };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !L(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(t, p);
}
function oe(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const ae = (t, c) => {
  let h = t;
  const [g, v] = bt(h);
  (Object.keys(v).length > 0 || c && Object.keys(c).length > 0) && Object.keys(v).forEach((I) => {
    v[I] = v[I] || {}, v[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...v[I].formElements || {}
      // State-specific overrides
    }, Q(I) || o.getState().setInitialStateOptions(I, v[I]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const k = (I, a) => {
    const [y] = K(a?.componentId ?? ht());
    wt({
      stateKey: I,
      options: a,
      initialOptionsPart: v
    });
    const r = o.getState().cogsStateStore[I] || g[I], S = a?.modifyState ? a.modifyState(r) : r, [W, O] = Lt(
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
    wt({ stateKey: I, options: a, initialOptionsPart: v }), a.localStorage && Wt(I, a), ut(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: ct,
  setState: Z,
  getInitialOptions: Q,
  getKeyState: kt,
  getValidationErrors: Rt,
  setStateLog: Ft,
  updateInitialStateGlobal: yt,
  addValidationError: Ut,
  removeValidationError: q,
  setServerSyncActions: Dt
} = o.getState(), Et = (t, c, h, g, v) => {
  h?.log && console.log(
    "saving to localstorage",
    c,
    h.localStorage?.key,
    g
  );
  const k = J(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (k && g) {
    const p = `${g}-${c}-${k}`;
    let I;
    try {
      I = dt(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? I
    }, y = Mt.serialize(a);
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
  const h = o.getState().cogsStateStore[t], { sessionId: g } = $t(), v = J(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (v && g) {
    const k = dt(
      `${g}-${t}-${v}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return Z(t, k.state), ut(t), !0;
  }
  return !1;
}, Nt = (t, c, h, g, v, k) => {
  const p = {
    initialState: c,
    updaterState: lt(
      t,
      g,
      v,
      k
    ),
    state: h
  };
  yt(t, p.initialState), ct(t, p.updaterState), Z(t, p.state);
}, ut = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || h.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((g) => g());
  });
}, se = (t, c) => {
  const h = o.getState().stateComponents.get(t);
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
  reactiveDeps: k,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: y,
  dependencies: r,
  serverState: S
} = {}) {
  const [W, O] = K({}), { sessionId: R } = $t();
  let G = !c;
  const [m] = K(c ?? ht()), l = o.getState().stateLog[m], ot = H(/* @__PURE__ */ new Set()), Y = H(I ?? ht()), j = H(
    null
  );
  j.current = Q(m) ?? null, st(() => {
    if (y && y.stateKey === m && y.path?.[0]) {
      Z(m, (n) => ({
        ...n,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), st(() => {
    if (a) {
      pt(m, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[m];
      if (!(i && !L(i, a) || !i) && !s)
        return;
      let u = null;
      const E = J(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && R && (u = dt(`${R}-${m}-${E}`));
      let w = a, T = !1;
      const x = s ? Date.now() : 0, C = u?.lastUpdated || 0, V = u?.lastSyncedWithServer || 0;
      s && x > C ? (w = e.serverState.data, T = !0) : u && C > V && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(m, a), Nt(
        m,
        a,
        w,
        tt,
        Y.current,
        R
      ), T && E && R && Et(w, m, e, R, Date.now()), ut(m), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...r || []
  ]), it(() => {
    G && pt(m, {
      serverSync: h,
      formElements: v,
      initialState: a,
      localStorage: g,
      middleware: j.current?.middleware
    });
    const e = `${m}////${Y.current}`, n = o.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, n), O({}), () => {
      n && (n.components.delete(e), n.components.size === 0 && o.getState().stateComponents.delete(m));
    };
  }, []);
  const tt = (e, n, s, i) => {
    if (Array.isArray(n)) {
      const u = `${m}-${n.join(".")}`;
      ot.current.add(u);
    }
    const f = o.getState();
    Z(m, (u) => {
      const E = J(e) ? e(u) : e, w = `${m}-${n.join(".")}`;
      if (w) {
        let _ = !1, N = f.signalDomElements.get(w);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const $ = n.slice(0, -1), M = z(E, $);
          if (Array.isArray(M)) {
            _ = !0;
            const A = `${m}-${$.join(".")}`;
            N = f.signalDomElements.get(A);
          }
        }
        if (N) {
          const $ = _ ? z(E, n.slice(0, -1)) : z(E, n);
          N.forEach(({ parentId: M, position: A, effect: P }) => {
            const b = document.querySelector(
              `[data-parent-id="${M}"]`
            );
            if (b) {
              const U = Array.from(b.childNodes);
              if (U[A]) {
                const F = P ? new Function("state", `return (${P})(state)`)($) : $;
                U[A].textContent = String(F);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && n && q(
        (i || j.current?.validation?.key) + "." + n.join(".")
      );
      const T = n.slice(0, n.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && q(
        j.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Rt(
        j.current?.validation?.key + "." + T.join(".")
      ).filter(([N, $]) => {
        let M = N?.split(".").length;
        if (N == T.join(".") && M == T.length - 1) {
          let A = N + "." + T;
          q(N), Ut(A, $);
        }
      });
      const x = f.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", x), x) {
        const _ = mt(u, E), N = new Set(_), $ = s.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          M,
          A
        ] of x.components.entries()) {
          let P = !1;
          const b = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !b.includes("none")) {
            if (b.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (b.includes("component") && ((A.paths.has($) || A.paths.has("")) && (P = !0), !P))
              for (const U of N) {
                let F = U;
                for (; ; ) {
                  if (A.paths.has(F)) {
                    P = !0;
                    break;
                  }
                  const X = F.lastIndexOf(".");
                  if (X !== -1) {
                    const et = F.substring(
                      0,
                      X
                    );
                    if (!isNaN(
                      Number(F.substring(X + 1))
                    ) && A.paths.has(et)) {
                      P = !0;
                      break;
                    }
                    F = et;
                  } else
                    F = "";
                  if (F === "")
                    break;
                }
                if (P) break;
              }
            if (!P && b.includes("deps") && A.depsFunction) {
              const U = A.depsFunction(E);
              let F = !1;
              typeof U == "boolean" ? U && (F = !0) : L(A.deps, U) || (A.deps = U, F = !0), F && (P = !0);
            }
            P && A.forceUpdate();
          }
        }
      }
      const C = Date.now();
      n = n.map((_, N) => {
        const $ = n.slice(0, -1), M = z(E, $);
        return N === n.length - 1 && ["insert", "cut"].includes(s.updateType) ? (M.length - 1).toString() : _;
      });
      const { oldValue: V, newValue: D } = Gt(
        s.updateType,
        u,
        E,
        n
      ), B = {
        timeStamp: C,
        stateKey: m,
        path: n,
        updateType: s.updateType,
        status: "new",
        oldValue: V,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          f.updateShadowAtPath(m, n, E);
          break;
        case "insert":
          const _ = n.slice(0, -1);
          f.insertShadowArrayElement(m, _, D);
          break;
        case "cut":
          const N = n.slice(0, -1), $ = parseInt(n[n.length - 1]);
          f.removeShadowArrayElement(m, N, $);
          break;
      }
      if (Ft(m, (_) => {
        const $ = [..._ ?? [], B].reduce((M, A) => {
          const P = `${A.stateKey}:${JSON.stringify(A.path)}`, b = M.get(P);
          return b ? (b.timeStamp = Math.max(b.timeStamp, A.timeStamp), b.newValue = A.newValue, b.oldValue = b.oldValue ?? A.oldValue, b.updateType = A.updateType) : M.set(P, { ...A }), M;
        }, /* @__PURE__ */ new Map());
        return Array.from($.values());
      }), Et(
        E,
        m,
        j.current,
        R
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: B
      }), j.current?.serverSync) {
        const _ = f.serverState[m], N = j.current?.serverSync;
        Dt(m, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[m] || (ct(
    m,
    lt(
      m,
      tt,
      Y.current,
      R
    )
  ), o.getState().cogsStateStore[m] || Z(m, t), o.getState().initialStateGlobal[m] || yt(m, t));
  const d = Tt(() => lt(
    m,
    tt,
    Y.current,
    R
  ), [m, R]);
  return [kt(m), d];
}
function lt(t, c, h, g) {
  const v = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (y) => {
    const r = y.join(".");
    for (const [S] of v)
      (S === r || S.startsWith(r + ".")) && v.delete(S);
    k++;
  }, I = {
    removeValidation: (y) => {
      y?.validationKey && q(y.validationKey);
    },
    revertToInitialState: (y) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && q(r?.key), y?.validationKey && q(y.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), v.clear(), k++;
      const W = a(S, []), O = Q(t), R = J(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, G = `${g}-${t}-${R}`;
      G && localStorage.removeItem(G), ct(t, W), Z(t, S);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      v.clear(), k++;
      const r = lt(
        t,
        c,
        h,
        g
      ), S = o.getState().initialStateGlobal[t], W = Q(t), O = J(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, R = `${g}-${t}-${O}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Vt(() => {
        yt(t, y), o.getState().initializeShadowState(t, y), ct(t, r), Z(t, y);
        const G = o.getState().stateComponents.get(t);
        G && G.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (G) => r.get()[G]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = o.getState().serverState[t];
      return !!(y && L(y, kt(t)));
    }
  };
  function a(y, r = [], S) {
    const W = r.map(String).join(".");
    v.get(W);
    const O = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(I).forEach((m) => {
      O[m] = I[m];
    });
    const R = {
      apply(m, l, ot) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, r);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
        const ot = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ot.has(l)) {
          const d = `${t}////${h}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(d);
            if (n && !n.paths.has("")) {
              const s = r.join(".");
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
          return () => mt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && r.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = o.getState().getNestedState(t, []), s = d?.validation?.key;
            try {
              const i = await e.action(n);
              if (i && !i.success && i.errors && s) {
                o.getState().removeValidationError(s), i.errors.forEach((u) => {
                  const E = [s, ...u.path].join(".");
                  o.getState().addValidationError(E, u.message);
                });
                const f = o.getState().stateComponents.get(t);
                f && f.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, r), e = o.getState().initialStateGlobal[t], n = z(e, r);
          return L(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], n = z(e, r);
            return L(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = Q(t), n = J(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${g}-${t}-${n}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + r.join("."));
          };
        if (Array.isArray(y)) {
          const d = () => S?.validIndices ? y.map((n, s) => ({
            item: n,
            originalIndex: S.validIndices[s]
          })) : o.getState().getNestedState(t, r).map((n, s) => ({
            item: n,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, r.join("."));
              if (e !== void 0)
                return a(
                  y[e],
                  [...r, e.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: t, path: r });
            };
          if (l === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(t, r.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: n,
                overscan: s = 5,
                stickToBottom: i = !1
              } = e, f = H(null), [u, E] = K({
                startIndex: 0,
                endIndex: 10
              }), w = H(i), T = H(0), x = H(!0), C = o().getNestedState(
                t,
                r
              ), V = C.length, D = Tt(() => {
                const $ = Math.max(0, u.startIndex), M = Math.min(V, u.endIndex), A = Array.from(
                  { length: M - $ },
                  (b, U) => $ + U
                ), P = A.map((b) => C[b]);
                return a(P, r, {
                  ...S,
                  validIndices: A
                });
              }, [u.startIndex, u.endIndex, C, V]);
              it(() => {
                const $ = f.current;
                if (!$) return;
                const M = w.current, A = V > T.current;
                T.current = V;
                const P = () => {
                  const { scrollTop: b, clientHeight: U, scrollHeight: F } = $;
                  w.current = F - b - U < 10;
                  const X = Math.max(
                    0,
                    Math.floor(b / n) - s
                  ), et = Math.min(
                    V,
                    Math.ceil((b + U) / n) + s
                  );
                  E((ft) => ft.startIndex !== X || ft.endIndex !== et ? { startIndex: X, endIndex: et } : ft);
                };
                return $.addEventListener("scroll", P, {
                  passive: !0
                }), i && (x.current ? $.scrollTo({
                  top: $.scrollHeight,
                  behavior: "auto"
                }) : M && A && requestAnimationFrame(() => {
                  $.scrollTo({
                    top: $.scrollHeight,
                    behavior: "smooth"
                  });
                })), x.current = !1, P(), () => $.removeEventListener("scroll", P);
              }, [V, n, s, i]);
              const B = vt(
                ($ = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: f.current.scrollHeight,
                    behavior: $
                  });
                },
                []
              ), _ = vt(
                ($, M = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: $ * n,
                    behavior: M
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
                    transform: `translateY(${u.startIndex * n}px)`
                  }
                }
              };
              return {
                virtualState: D,
                virtualizerProps: N,
                scrollToBottom: B,
                scrollToIndex: _
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, E) => e(u.item, E.item)
              ), i = s.map(({ item: u }) => u), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(i, r, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, E) => e(u, E)
              ), i = s.map(({ item: u }) => u), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(i, r, f);
            };
          if (l === "stateMap")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (i, f) => f)).map((i, f) => {
                const u = n[i], E = [...r, i.toString()], w = a(u, E, S);
                return e(u, w, {
                  register: () => {
                    const [, x] = K({}), C = `${h}-${r.join(".")}-${i}`;
                    it(() => {
                      const V = `${t}////${C}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(V, {
                        forceUpdate: () => x({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const B = o.getState().stateComponents.get(t);
                        B && B.components.delete(V);
                      };
                    }, [t, C]);
                  },
                  index: f,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${r.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => y.map((s, i) => {
              let f;
              S?.validIndices && S.validIndices[i] !== void 0 ? f = S.validIndices[i] : f = i;
              const u = [...r, f.toString()], E = a(s, u, S);
              return e(
                s,
                E,
                i,
                y,
                a(y, r, S)
              );
            });
          if (l === "$stateMap")
            return (e) => rt(zt, {
              proxy: {
                _stateKey: t,
                _path: r,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: a
            });
          if (l === "stateList")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (i, f) => f)).map((i, f) => {
                const u = n[i], E = [...r, i.toString()], w = a(u, E, S), T = `${h}-${r.join(".")}-${i}`;
                return rt(qt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: E,
                  children: e(
                    u,
                    w,
                    f,
                    n,
                    a(n, r, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${r.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const n = y;
              v.clear(), k++;
              const s = n.flatMap(
                (i) => i[e] ?? []
              );
              return a(
                s,
                [...r, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const n = y[e];
              return a(n, [...r, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, r);
              if (e.length === 0) return;
              const n = e.length - 1, s = e[n], i = [...r, n.toString()];
              return a(s, i);
            };
          if (l === "insert")
            return (e) => (p(r), gt(c, e, r, t), a(
              o.getState().getNestedState(t, r),
              r
            ));
          if (l === "uniqueInsert")
            return (e, n, s) => {
              const i = o.getState().getNestedState(t, r), f = J(e) ? e(i) : e;
              let u = null;
              if (!i.some((w) => {
                if (n) {
                  const x = n.every(
                    (C) => L(w[C], f[C])
                  );
                  return x && (u = w), x;
                }
                const T = L(w, f);
                return T && (u = w), T;
              }))
                p(r), gt(c, f, r, t);
              else if (s && u) {
                const w = s(u), T = i.map(
                  (x) => L(x, u) ? w : x
                );
                p(r), nt(c, T, r);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return p(r), at(c, r, t, e), a(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < y.length; n++)
                y[n] === e && at(c, r, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = y.findIndex((s) => s === e);
              n > -1 ? at(c, r, t, n) : gt(c, e, r, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: f }, u) => e(f, u)
              );
              if (!s) return;
              const i = [...r, s.originalIndex.toString()];
              return a(s.item, i, S);
            };
          if (l === "findWith")
            return (e, n) => {
              const i = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!i) return;
              const f = [...r, i.originalIndex.toString()];
              return a(i.item, f, S);
            };
        }
        const Y = r[r.length - 1];
        if (!isNaN(Number(Y))) {
          const d = r.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => at(
              c,
              d,
              t,
              Number(Y)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(y)) {
              const d = o.getState().getNestedState(t, r);
              return S.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, r);
          };
        if (l === "$derive")
          return (d) => At({
            _stateKey: t,
            _path: r,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => At({
            _stateKey: t,
            _path: r
          });
        if (l === "lastSynced") {
          const d = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => dt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = r.slice(0, -1), e = d.join("."), n = o.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(r[r.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = r.slice(0, -1), n = Number(r[r.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, n) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            nt(c, i, e), p(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = r.slice(0, -1), e = Number(r[r.length - 1]), n = d.join("."), s = o.getState().getSelectedIndex(t, n);
            o.getState().setSelectedIndex(
              t,
              n,
              s === e ? void 0 : e
            );
            const i = o.getState().getNestedState(t, [...d]);
            nt(c, i, d), p(d);
          };
        if (r.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = jt(e, d).newDocument;
              Nt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                h,
                g
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const f = mt(e, s), u = new Set(f);
                for (const [
                  E,
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
                      for (const C of u) {
                        if (w.paths.has(C)) {
                          T = !0;
                          break;
                        }
                        let V = C.lastIndexOf(".");
                        for (; V !== -1; ) {
                          const D = C.substring(0, V);
                          if (w.paths.has(D)) {
                            T = !0;
                            break;
                          }
                          const B = C.substring(
                            V + 1
                          );
                          if (!isNaN(Number(B))) {
                            const _ = D.lastIndexOf(".");
                            if (_ !== -1) {
                              const N = D.substring(
                                0,
                                _
                              );
                              if (w.paths.has(N)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          V = D.lastIndexOf(".");
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
              const d = o.getState().getInitialOptions(t)?.validation, e = o.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              q(d.key);
              const n = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([f]) => {
                  f && f.startsWith(d.key) && q(f);
                });
                const i = d.zodSchema.safeParse(n);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const E = u.path, w = u.message, T = [d.key, ...E].join(".");
                  e(T, w);
                }), ut(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => It.getState().getFormRefsByStateKey(t);
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
          return () => It.getState().getFormRef(t + "." + r.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ St(
            Pt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return r;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              xt(() => {
                nt(c, d, r, "");
                const n = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              nt(c, d, r, "");
              const n = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(n);
            }
            p(r);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ St(
            _t,
            {
              setState: c,
              stateKey: t,
              path: r,
              child: d,
              formOpts: e
            }
          );
        const j = [...r, l], tt = o.getState().getNestedState(t, j);
        return a(tt, j, S);
      }
    }, G = new Proxy(O, R);
    return v.set(W, {
      proxy: G,
      stateVersion: k
    }), G;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function At(t) {
  return rt(Bt, { proxy: t });
}
function zt({
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
function Bt({
  proxy: t
}) {
  const c = H(null), h = `${t._stateKey}-${t._path.join(".")}`;
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
    o.getState().addSignalElement(h, y);
    const r = o.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(r);
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), S = r;
      }
    else
      S = r;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    g.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), rt("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function ie(t) {
  const c = Ct(
    (h) => {
      const g = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return rt("text", {}, String(c));
}
function qt({
  stateKey: t,
  itemComponentId: c,
  itemPath: h,
  children: g
}) {
  const [, v] = K({}), [k, p] = Ot();
  return st(() => {
    p.height > 0 && o.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: p.height
      }
    });
  }, [p.height]), it(() => {
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
  }, [t, c, h.join(".")]), /* @__PURE__ */ St("div", { ref: k, children: g });
}
export {
  At as $cogsSignal,
  ie as $cogsSignalStore,
  oe as addStateOptions,
  ae as createCogsState,
  se as notifyComponent,
  Lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
