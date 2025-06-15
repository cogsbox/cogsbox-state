"use client";
import { jsx as ht } from "react/jsx-runtime";
import { useState as nt, useRef as H, useEffect as gt, useLayoutEffect as ft, useMemo as Tt, createElement as it, useSyncExternalStore as Nt, startTransition as Vt, useCallback as vt } from "react";
import { transformStateFunc as bt, isDeepEqual as L, isFunction as J, getNestedValue as B, getDifferences as St, debounce as Pt } from "./utility.js";
import { pushFunc as ut, updateFn as et, cutFunc as at, ValidationWrapper as Ct, FormControlComponent as _t } from "./Functions.jsx";
import Mt from "superjson";
import { v4 as mt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as It } from "./store.js";
import { useCogsConfig as $t } from "./CogsStateClient.jsx";
import { applyPatch as Ot } from "fast-json-patch";
function pt(t, i) {
  const v = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = v(t) || {};
  g(t, {
    ...y,
    ...i
  });
}
function wt({
  stateKey: t,
  options: i,
  initialOptionsPart: v
}) {
  const g = Q(t) || {}, y = v[t] || {}, k = r.getState().setInitialStateOptions, p = { ...y, ...g };
  let I = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (I = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !L(p[s], i[s]) && (I = !0, p[s] = i[s])) : (I = !0, p[s] = i[s]);
  I && k(t, p);
}
function ee(t, { formElements: i, validation: v }) {
  return { initialState: t, formElements: i, validation: v };
}
const ne = (t, i) => {
  let v = t;
  const [g, y] = bt(v);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, Q(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const k = (I, s) => {
    const [h] = nt(s?.componentId ?? mt());
    wt({
      stateKey: I,
      options: s,
      initialOptionsPart: y
    });
    const a = r.getState().cogsStateStore[I] || g[I], S = s?.modifyState ? s.modifyState(a) : a, [D, R] = Wt(
      S,
      {
        stateKey: I,
        syncUpdate: s?.syncUpdate,
        componentId: h,
        localStorage: s?.localStorage,
        middleware: s?.middleware,
        enabledSync: s?.enabledSync,
        reactiveType: s?.reactiveType,
        reactiveDeps: s?.reactiveDeps,
        initialState: s?.initialState,
        dependencies: s?.dependencies,
        serverState: s?.serverState
      }
    );
    return R;
  };
  function p(I, s) {
    wt({ stateKey: I, options: s, initialOptionsPart: y }), s.localStorage && Dt(I, s), lt(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: ot,
  setState: Z,
  getInitialOptions: Q,
  getKeyState: kt,
  getValidationErrors: Rt,
  setStateLog: Ft,
  updateInitialStateGlobal: yt,
  addValidationError: Ut,
  removeValidationError: z,
  setServerSyncActions: jt
} = r.getState(), Et = (t, i, v, g, y) => {
  v?.log && console.log(
    "saving to localstorage",
    i,
    v.localStorage?.key,
    g
  );
  const k = J(v?.localStorage?.key) ? v.localStorage?.key(t) : v?.localStorage?.key;
  if (k && g) {
    const p = `${g}-${i}-${k}`;
    let I;
    try {
      I = ct(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, h = Mt.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(h.json)
    );
  }
}, ct = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Dt = (t, i) => {
  const v = r.getState().cogsStateStore[t], { sessionId: g } = $t(), y = J(i?.localStorage?.key) ? i.localStorage.key(v) : i?.localStorage?.key;
  if (y && g) {
    const k = ct(
      `${g}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return Z(t, k.state), lt(t), !0;
  }
  return !1;
}, xt = (t, i, v, g, y, k) => {
  const p = {
    initialState: i,
    updaterState: st(
      t,
      g,
      y,
      k
    ),
    state: v
  };
  yt(t, p.initialState), ot(t, p.updaterState), Z(t, p.state);
}, lt = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const v = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || v.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((g) => g());
  });
}, re = (t, i) => {
  const v = r.getState().stateComponents.get(t);
  if (v) {
    const g = `${t}////${i}`, y = v.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Gt = (t, i, v, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(i, g),
        newValue: B(v, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(v, g)
      };
    case "cut":
      return {
        oldValue: B(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Wt(t, {
  stateKey: i,
  serverSync: v,
  localStorage: g,
  formElements: y,
  reactiveDeps: k,
  reactiveType: p,
  componentId: I,
  initialState: s,
  syncUpdate: h,
  dependencies: a,
  serverState: S
} = {}) {
  const [D, R] = nt({}), { sessionId: F } = $t();
  let G = !i;
  const [f] = nt(i ?? mt()), l = r.getState().stateLog[f], rt = H(/* @__PURE__ */ new Set()), Y = H(I ?? mt()), O = H(
    null
  );
  O.current = Q(f) ?? null, gt(() => {
    if (h && h.stateKey === f && h.path?.[0]) {
      Z(f, (n) => ({
        ...n,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), gt(() => {
    if (s) {
      pt(f, {
        initialState: s
      });
      const e = O.current, o = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[f];
      if (!(c && !L(c, s) || !c) && !o)
        return;
      let d = null;
      const N = J(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      N && F && (d = ct(`${F}-${f}-${N}`));
      let w = s, T = !1;
      const P = o ? Date.now() : 0, x = d?.lastUpdated || 0, V = d?.lastSyncedWithServer || 0;
      o && P > x ? (w = e.serverState.data, T = !0) : d && x > V && (w = d.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), r.getState().initializeShadowState(f, s), xt(
        f,
        s,
        w,
        K,
        Y.current,
        F
      ), T && N && F && Et(w, f, e, F, Date.now()), lt(f), (Array.isArray(p) ? p : [p || "component"]).includes("none") || R({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...a || []
  ]), ft(() => {
    G && pt(f, {
      serverSync: v,
      formElements: y,
      initialState: s,
      localStorage: g,
      middleware: O.current?.middleware
    });
    const e = `${f}////${Y.current}`, n = r.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(f, n), R({}), () => {
      n && (n.components.delete(e), n.components.size === 0 && r.getState().stateComponents.delete(f));
    };
  }, []);
  const K = (e, n, o, c) => {
    if (Array.isArray(n)) {
      const m = `${f}-${n.join(".")}`;
      rt.current.add(m);
    }
    Z(f, (m) => {
      const d = J(e) ? e(m) : e, N = `${f}-${n.join(".")}`;
      if (N) {
        let C = !1, $ = r.getState().signalDomElements.get(N);
        if ((!$ || $.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const A = n.slice(0, -1), _ = B(d, A);
          if (Array.isArray(_)) {
            C = !0;
            const E = `${f}-${A.join(".")}`;
            $ = r.getState().signalDomElements.get(E);
          }
        }
        if ($) {
          const A = C ? B(d, n.slice(0, -1)) : B(d, n);
          $.forEach(({ parentId: _, position: E, effect: M }) => {
            const b = document.querySelector(
              `[data-parent-id="${_}"]`
            );
            if (b) {
              const j = Array.from(b.childNodes);
              if (j[E]) {
                const U = M ? new Function("state", `return (${M})(state)`)(A) : A;
                j[E].textContent = String(U);
              }
            }
          });
        }
      }
      (() => {
        const C = r.getState();
        switch (o.updateType) {
          case "update":
            C.updateShadowAtPath(f, n, d);
            break;
          case "insert":
            const $ = n.slice(0, -1);
            C.insertShadowArrayElement(f, $);
            break;
          case "cut":
            const A = n.slice(0, -1), _ = parseInt(n[n.length - 1]);
            C.removeShadowArrayElement(f, A, _);
            break;
        }
      })(), console.log("shadowState", r.getState().shadowStateStore), o.updateType === "update" && (c || O.current?.validation?.key) && n && z(
        (c || O.current?.validation?.key) + "." + n.join(".")
      );
      const T = n.slice(0, n.length - 1);
      o.updateType === "cut" && O.current?.validation?.key && z(
        O.current?.validation?.key + "." + T.join(".")
      ), o.updateType === "insert" && O.current?.validation?.key && Rt(
        O.current?.validation?.key + "." + T.join(".")
      ).filter(([$, A]) => {
        let _ = $?.split(".").length;
        if ($ == T.join(".") && _ == T.length - 1) {
          let E = $ + "." + T;
          z($), Ut(E, A);
        }
      });
      const P = r.getState().stateComponents.get(f);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const C = St(m, d), $ = new Set(C), A = o.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          _,
          E
        ] of P.components.entries()) {
          let M = !1;
          const b = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !b.includes("none")) {
            if (b.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (b.includes("component") && ((E.paths.has(A) || E.paths.has("")) && (M = !0), !M))
              for (const j of $) {
                let U = j;
                for (; ; ) {
                  if (E.paths.has(U)) {
                    M = !0;
                    break;
                  }
                  const X = U.lastIndexOf(".");
                  if (X !== -1) {
                    const tt = U.substring(
                      0,
                      X
                    );
                    if (!isNaN(
                      Number(U.substring(X + 1))
                    ) && E.paths.has(tt)) {
                      M = !0;
                      break;
                    }
                    U = tt;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (M) break;
              }
            if (!M && b.includes("deps") && E.depsFunction) {
              const j = E.depsFunction(d);
              let U = !1;
              typeof j == "boolean" ? j && (U = !0) : L(E.deps, j) || (E.deps = j, U = !0), U && (M = !0);
            }
            M && E.forceUpdate();
          }
        }
      }
      const x = Date.now();
      n = n.map((C, $) => {
        const A = n.slice(0, -1), _ = B(d, A);
        return $ === n.length - 1 && ["insert", "cut"].includes(o.updateType) ? (_.length - 1).toString() : C;
      });
      const { oldValue: V, newValue: W } = Gt(
        o.updateType,
        m,
        d,
        n
      ), q = {
        timeStamp: x,
        stateKey: f,
        path: n,
        updateType: o.updateType,
        status: "new",
        oldValue: V,
        newValue: W
      };
      if (Ft(f, (C) => {
        const A = [...C ?? [], q].reduce((_, E) => {
          const M = `${E.stateKey}:${JSON.stringify(E.path)}`, b = _.get(M);
          return b ? (b.timeStamp = Math.max(b.timeStamp, E.timeStamp), b.newValue = E.newValue, b.oldValue = b.oldValue ?? E.oldValue, b.updateType = E.updateType) : _.set(M, { ...E }), _;
        }, /* @__PURE__ */ new Map());
        return Array.from(A.values());
      }), Et(
        d,
        f,
        O.current,
        F
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: q
      }), O.current?.serverSync) {
        const C = r.getState().serverState[f], $ = O.current?.serverSync;
        jt(f, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: d }),
          rollBackState: C,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return d;
    });
  };
  r.getState().updaterState[f] || (ot(
    f,
    st(
      f,
      K,
      Y.current,
      F
    )
  ), r.getState().cogsStateStore[f] || Z(f, t), r.getState().initialStateGlobal[f] || yt(f, t));
  const u = Tt(() => st(
    f,
    K,
    Y.current,
    F
  ), [f, F]);
  return [kt(f), u];
}
function st(t, i, v, g) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (h) => {
    const a = h.join(".");
    for (const [S] of y)
      (S === a || S.startsWith(a + ".")) && y.delete(S);
    k++;
  }, I = {
    removeValidation: (h) => {
      h?.validationKey && z(h.validationKey);
    },
    revertToInitialState: (h) => {
      const a = r.getState().getInitialOptions(t)?.validation;
      a?.key && z(a?.key), h?.validationKey && z(h.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const D = s(S, []), R = Q(t), F = J(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, G = `${g}-${t}-${F}`;
      G && localStorage.removeItem(G), ot(t, D), Z(t, S);
      const f = r.getState().stateComponents.get(t);
      return f && f.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (h) => {
      y.clear(), k++;
      const a = st(
        t,
        i,
        v,
        g
      ), S = r.getState().initialStateGlobal[t], D = Q(t), R = J(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, F = `${g}-${t}-${R}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Vt(() => {
        yt(t, h), ot(t, a), Z(t, h);
        const G = r.getState().stateComponents.get(t);
        G && G.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (G) => a.get()[G]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const h = r.getState().serverState[t];
      return !!(h && L(h, kt(t)));
    }
  };
  function s(h, a = [], S) {
    const D = a.map(String).join(".");
    y.get(D);
    const R = function() {
      return r().getNestedState(t, a);
    };
    Object.keys(I).forEach((f) => {
      R[f] = I[f];
    });
    const F = {
      apply(f, l, rt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${a.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, a);
      },
      get(f, l) {
        S?.validIndices && !Array.isArray(h) && (S = { ...S, validIndices: void 0 });
        const rt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !rt.has(l)) {
          const u = `${t}////${v}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(u);
            if (n && !n.paths.has("")) {
              const o = a.join(".");
              let c = !0;
              for (const m of n.paths)
                if (o.startsWith(m) && (o === m || o[m.length] === ".")) {
                  c = !1;
                  break;
                }
              c && n.paths.add(o);
            }
          }
        }
        if (l === "getDifferences")
          return () => St(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && a.length === 0)
          return async function() {
            const u = r.getState().getInitialOptions(t), e = u?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(t, []), o = u?.validation?.key;
            try {
              const c = await e.action(n);
              if (c && !c.success && c.errors && o) {
                r.getState().removeValidationError(o), c.errors.forEach((d) => {
                  const N = [o, ...d.path].join(".");
                  r.getState().addValidationError(N, d.message);
                });
                const m = r.getState().stateComponents.get(t);
                m && m.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const u = r.getState().getNestedState(t, a), e = r.getState().initialStateGlobal[t], n = B(e, a);
          return L(u, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              t,
              a
            ), e = r.getState().initialStateGlobal[t], n = B(e, a);
            return L(u, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = r.getState().initialStateGlobal[t], e = Q(t), n = J(e?.localStorage?.key) ? e?.localStorage?.key(u) : e?.localStorage?.key, o = `${g}-${t}-${n}`;
            o && localStorage.removeItem(o);
          };
        if (l === "showValidationErrors")
          return () => {
            const u = r.getState().getInitialOptions(t)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(u.key + "." + a.join("."));
          };
        if (Array.isArray(h)) {
          const u = () => S?.validIndices ? h.map((n, o) => ({
            item: n,
            originalIndex: S.validIndices[o]
          })) : r.getState().getNestedState(t, a).map((n, o) => ({
            item: n,
            originalIndex: o
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, a.join("."));
              if (e !== void 0)
                return s(
                  h[e],
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
                overscan: o = 5,
                stickToBottom: c = !1
              } = e, m = H(null), [d, N] = nt({
                startIndex: 0,
                endIndex: 10
              }), w = H(c), T = H(0), P = H(!0), x = r().getNestedState(
                t,
                a
              ), V = x.length, W = Tt(() => {
                const A = Math.max(0, d.startIndex), _ = Math.min(V, d.endIndex), E = Array.from(
                  { length: _ - A },
                  (b, j) => A + j
                ), M = E.map((b) => x[b]);
                return s(M, a, {
                  ...S,
                  validIndices: E
                });
              }, [d.startIndex, d.endIndex, x, V]);
              ft(() => {
                const A = m.current;
                if (!A) return;
                const _ = w.current, E = V > T.current;
                T.current = V;
                const M = () => {
                  const { scrollTop: b, clientHeight: j, scrollHeight: U } = A;
                  w.current = U - b - j < 10;
                  const X = Math.max(
                    0,
                    Math.floor(b / n) - o
                  ), tt = Math.min(
                    V,
                    Math.ceil((b + j) / n) + o
                  );
                  N((dt) => dt.startIndex !== X || dt.endIndex !== tt ? { startIndex: X, endIndex: tt } : dt);
                };
                return A.addEventListener("scroll", M, {
                  passive: !0
                }), c && (P.current ? A.scrollTo({
                  top: A.scrollHeight,
                  behavior: "auto"
                }) : _ && E && requestAnimationFrame(() => {
                  A.scrollTo({
                    top: A.scrollHeight,
                    behavior: "smooth"
                  });
                })), P.current = !1, M(), () => A.removeEventListener("scroll", M);
              }, [V, n, o, c]);
              const q = vt(
                (A = "smooth") => {
                  m.current && m.current.scrollTo({
                    top: m.current.scrollHeight,
                    behavior: A
                  });
                },
                []
              ), C = vt(
                (A, _ = "smooth") => {
                  m.current && m.current.scrollTo({
                    top: A * n,
                    behavior: _
                  });
                },
                [n]
              ), $ = {
                outer: {
                  ref: m,
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
                virtualState: W,
                virtualizerProps: $,
                scrollToBottom: q,
                scrollToIndex: C
              };
            };
          if (l === "stateSort")
            return (e) => {
              const o = [...u()].sort(
                (d, N) => e(d.item, N.item)
              ), c = o.map(({ item: d }) => d), m = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: d }) => d
                )
              };
              return s(c, a, m);
            };
          if (l === "stateFilter")
            return (e) => {
              const o = u().filter(
                ({ item: d }, N) => e(d, N)
              ), c = o.map(({ item: d }) => d), m = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: d }) => d
                )
              };
              return s(c, a, m);
            };
          if (l === "stateMap")
            return (e) => {
              const n = r.getState().getNestedState(t, a);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (c, m) => m)).map((c, m) => {
                const d = n[c], N = [...a, c.toString()], w = s(d, N, S);
                return e(d, w, {
                  register: () => {
                    const [, P] = nt({}), x = `${v}-${a.join(".")}-${c}`;
                    ft(() => {
                      const V = `${t}////${x}`, W = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return W.components.set(V, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([N.join(".")])
                      }), r.getState().stateComponents.set(t, W), () => {
                        const q = r.getState().stateComponents.get(t);
                        q && q.components.delete(V);
                      };
                    }, [t, x]);
                  },
                  index: m,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${a.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => h.map((o, c) => {
              let m;
              S?.validIndices && S.validIndices[c] !== void 0 ? m = S.validIndices[c] : m = c;
              const d = [...a, m.toString()], N = s(o, d, S);
              return e(
                o,
                N,
                c,
                h,
                s(h, a, S)
              );
            });
          if (l === "$stateMap")
            return (e) => it(Lt, {
              proxy: {
                _stateKey: t,
                _path: a,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateFlattenOn")
            return (e) => {
              const n = h;
              y.clear(), k++;
              const o = n.flatMap(
                (c) => c[e] ?? []
              );
              return s(
                o,
                [...a, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const n = h[e];
              return s(n, [...a, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, a);
              if (e.length === 0) return;
              const n = e.length - 1, o = e[n], c = [...a, n.toString()];
              return s(o, c);
            };
          if (l === "insert")
            return (e) => (p(a), ut(i, e, a, t), s(
              r.getState().getNestedState(t, a),
              a
            ));
          if (l === "uniqueInsert")
            return (e, n, o) => {
              const c = r.getState().getNestedState(t, a), m = J(e) ? e(c) : e;
              let d = null;
              if (!c.some((w) => {
                if (n) {
                  const P = n.every(
                    (x) => L(w[x], m[x])
                  );
                  return P && (d = w), P;
                }
                const T = L(w, m);
                return T && (d = w), T;
              }))
                p(a), ut(i, m, a, t);
              else if (o && d) {
                const w = o(d), T = c.map(
                  (P) => L(P, d) ? w : P
                );
                p(a), et(i, T, a);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return p(a), at(i, a, t, e), s(
                  r.getState().getNestedState(t, a),
                  a
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < h.length; n++)
                h[n] === e && at(i, a, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = h.findIndex((o) => o === e);
              n > -1 ? at(i, a, t, n) : ut(i, e, a, t);
            };
          if (l === "stateFind")
            return (e) => {
              const o = u().find(
                ({ item: m }, d) => e(m, d)
              );
              if (!o) return;
              const c = [...a, o.originalIndex.toString()];
              return s(o.item, c, S);
            };
          if (l === "findWith")
            return (e, n) => {
              const c = u().find(
                ({ item: d }) => d[e] === n
              );
              if (!c) return;
              const m = [...a, c.originalIndex.toString()];
              return s(c.item, m, S);
            };
        }
        const Y = a[a.length - 1];
        if (!isNaN(Number(Y))) {
          const u = a.slice(0, -1), e = r.getState().getNestedState(t, u);
          if (Array.isArray(e) && l === "cut")
            return () => at(
              i,
              u,
              t,
              Number(Y)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(h)) {
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
          return (u) => ct(g + "-" + t + "-" + u);
        if (l === "_selected") {
          const u = a.slice(0, -1), e = u.join("."), n = r.getState().getNestedState(t, u);
          return Array.isArray(n) ? Number(a[a.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const e = a.slice(0, -1), n = Number(a[a.length - 1]), o = e.join(".");
            u ? r.getState().setSelectedIndex(t, o, n) : r.getState().setSelectedIndex(t, o, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            et(i, c, e), p(e);
          };
        if (l === "toggleSelected")
          return () => {
            const u = a.slice(0, -1), e = Number(a[a.length - 1]), n = u.join("."), o = r.getState().getSelectedIndex(t, n);
            r.getState().setSelectedIndex(
              t,
              n,
              o === e ? void 0 : e
            );
            const c = r.getState().getNestedState(t, [...u]);
            et(i, c, u), p(u);
          };
        if (a.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const e = r.getState().cogsStateStore[t], o = Ot(e, u).newDocument;
              xt(
                t,
                r.getState().initialStateGlobal[t],
                o,
                i,
                v,
                g
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const m = St(e, o), d = new Set(m);
                for (const [
                  N,
                  w
                ] of c.components.entries()) {
                  let T = !1;
                  const P = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (w.paths.has("") && (T = !0), !T))
                      for (const x of d) {
                        if (w.paths.has(x)) {
                          T = !0;
                          break;
                        }
                        let V = x.lastIndexOf(".");
                        for (; V !== -1; ) {
                          const W = x.substring(0, V);
                          if (w.paths.has(W)) {
                            T = !0;
                            break;
                          }
                          const q = x.substring(
                            V + 1
                          );
                          if (!isNaN(Number(q))) {
                            const C = W.lastIndexOf(".");
                            if (C !== -1) {
                              const $ = W.substring(
                                0,
                                C
                              );
                              if (w.paths.has($)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          V = W.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && P.includes("deps") && w.depsFunction) {
                      const x = w.depsFunction(o);
                      let V = !1;
                      typeof x == "boolean" ? x && (V = !0) : L(w.deps, x) || (w.deps = x, V = !0), V && (T = !0);
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
              z(u.key);
              const n = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(u.key);
                o && o.length > 0 && o.forEach(([m]) => {
                  m && m.startsWith(u.key) && z(m);
                });
                const c = u.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((d) => {
                  const N = d.path, w = d.message, T = [u.key, ...N].join(".");
                  e(T, w);
                }), lt(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (l === "_componentId") return v;
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
          }) => /* @__PURE__ */ ht(
            Ct,
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
              Pt(() => {
                et(i, u, a, "");
                const n = r.getState().getNestedState(t, a);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              et(i, u, a, "");
              const n = r.getState().getNestedState(t, a);
              e?.afterUpdate && e.afterUpdate(n);
            }
            p(a);
          };
        if (l === "formElement")
          return (u, e) => /* @__PURE__ */ ht(
            _t,
            {
              setState: i,
              stateKey: t,
              path: a,
              child: u,
              formOpts: e
            }
          );
        const O = [...a, l], K = r.getState().getNestedState(t, O);
        return s(K, O, S);
      }
    }, G = new Proxy(R, F);
    return y.set(D, {
      proxy: G,
      stateVersion: k
    }), G;
  }
  return s(
    r.getState().getNestedState(t, [])
  );
}
function At(t) {
  return it(Bt, { proxy: t });
}
function Lt({
  proxy: t,
  rebuildStateShape: i
}) {
  const v = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(v) ? i(
    v,
    t._path
  ).stateMapNoRender(
    (y, k, p, I, s) => t._mapFn(y, k, p, I, s)
  ) : null;
}
function Bt({
  proxy: t
}) {
  const i = H(null), v = `${t._stateKey}-${t._path.join(".")}`;
  return gt(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, p = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
      effect: t._effect
    };
    r.getState().addSignalElement(v, h);
    const a = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(a);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), S = a;
      }
    else
      S = a;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const D = document.createTextNode(String(S));
    g.replaceWith(D);
  }, [t._stateKey, t._path.join("."), t._effect]), it("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function ae(t) {
  const i = Nt(
    (v) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: v,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return it("text", {}, String(i));
}
export {
  At as $cogsSignal,
  ae as $cogsSignalStore,
  ee as addStateOptions,
  ne as createCogsState,
  re as notifyComponent,
  Wt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
