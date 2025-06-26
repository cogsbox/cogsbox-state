"use client";
import { jsx as St } from "react/jsx-runtime";
import { useState as tt, useRef as Q, useEffect as Z, useLayoutEffect as yt, useMemo as mt, createElement as it, useSyncExternalStore as Pt, startTransition as _t, useCallback as wt } from "react";
import { transformStateFunc as Mt, isDeepEqual as z, isFunction as X, getNestedValue as B, getDifferences as ht, debounce as jt } from "./utility.js";
import { pushFunc as ft, updateFn as at, cutFunc as lt, ValidationWrapper as Ot, FormControlComponent as Ut } from "./Functions.jsx";
import Rt from "superjson";
import { v4 as vt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Tt } from "./store.js";
import { useCogsConfig as bt } from "./CogsStateClient.jsx";
import { applyPatch as Ft } from "fast-json-patch";
import Dt from "react-use-measure";
function Et(t, c) {
  const S = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, y = S(t) || {};
  g(t, {
    ...y,
    ...c
  });
}
function kt({
  stateKey: t,
  options: c,
  initialOptionsPart: S
}) {
  const g = rt(t) || {}, y = S[t] || {}, b = o.getState().setInitialStateOptions, p = { ...y, ...g };
  let I = !1;
  if (c)
    for (const i in c)
      p.hasOwnProperty(i) ? (i == "localStorage" && c[i] && p[i].key !== c[i]?.key && (I = !0, p[i] = c[i]), i == "initialState" && c[i] && p[i] !== c[i] && // Different references
      !z(p[i], c[i]) && (I = !0, p[i] = c[i])) : (I = !0, p[i] = c[i]);
  I && b(t, p);
}
function se(t, { formElements: c, validation: S }) {
  return { initialState: t, formElements: c, validation: S };
}
const ce = (t, c) => {
  let S = t;
  const [g, y] = Mt(S);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, rt(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const b = (I, i) => {
    const [h] = tt(i?.componentId ?? vt());
    kt({
      stateKey: I,
      options: i,
      initialOptionsPart: y
    });
    const r = o.getState().cogsStateStore[I] || g[I], f = i?.modifyState ? i.modifyState(r) : r, [L, O] = Bt(
      f,
      {
        stateKey: I,
        syncUpdate: i?.syncUpdate,
        componentId: h,
        localStorage: i?.localStorage,
        middleware: i?.middleware,
        enabledSync: i?.enabledSync,
        reactiveType: i?.reactiveType,
        reactiveDeps: i?.reactiveDeps,
        initialState: i?.initialState,
        dependencies: i?.dependencies,
        serverState: i?.serverState
      }
    );
    return O;
  };
  function p(I, i) {
    kt({ stateKey: I, options: i, initialOptionsPart: y }), i.localStorage && Ht(I, i), st(I);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: dt,
  setState: et,
  getInitialOptions: rt,
  getKeyState: Nt,
  getValidationErrors: Wt,
  setStateLog: Gt,
  updateInitialStateGlobal: It,
  addValidationError: Vt,
  removeValidationError: Y,
  setServerSyncActions: Lt
} = o.getState(), At = (t, c, S, g, y) => {
  S?.log && console.log(
    "saving to localstorage",
    c,
    S.localStorage?.key,
    g
  );
  const b = X(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (b && g) {
    const p = `${g}-${c}-${b}`;
    let I;
    try {
      I = gt(p)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, h = Rt.serialize(i);
    window.localStorage.setItem(
      p,
      JSON.stringify(h.json)
    );
  }
}, gt = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Ht = (t, c) => {
  const S = o.getState().cogsStateStore[t], { sessionId: g } = bt(), y = X(c?.localStorage?.key) ? c.localStorage.key(S) : c?.localStorage?.key;
  if (y && g) {
    const b = gt(
      `${g}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return et(t, b.state), st(t), !0;
  }
  return !1;
}, Ct = (t, c, S, g, y, b) => {
  const p = {
    initialState: c,
    updaterState: ut(
      t,
      g,
      y,
      b
    ),
    state: S
  };
  It(t, p.initialState), dt(t, p.updaterState), et(t, p.state);
}, st = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const S = /* @__PURE__ */ new Set();
  c.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, le = (t, c) => {
  const S = o.getState().stateComponents.get(t);
  if (S) {
    const g = `${t}////${c}`, y = S.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, zt = (t, c, S, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(c, g),
        newValue: B(S, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(S, g)
      };
    case "cut":
      return {
        oldValue: B(c, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Bt(t, {
  stateKey: c,
  serverSync: S,
  localStorage: g,
  formElements: y,
  reactiveDeps: b,
  reactiveType: p,
  componentId: I,
  initialState: i,
  syncUpdate: h,
  dependencies: r,
  serverState: f
} = {}) {
  const [L, O] = tt({}), { sessionId: U } = bt();
  let H = !c;
  const [m] = tt(c ?? vt()), l = o.getState().stateLog[m], ct = Q(/* @__PURE__ */ new Set()), K = Q(I ?? vt()), _ = Q(
    null
  );
  _.current = rt(m) ?? null, Z(() => {
    if (h && h.stateKey === m && h.path?.[0]) {
      et(m, (n) => ({
        ...n,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), Z(() => {
    if (i) {
      Et(m, {
        initialState: i
      });
      const e = _.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, s = o.getState().initialStateGlobal[m];
      if (!(s && !z(s, i) || !s) && !a)
        return;
      let d = null;
      const w = X(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      w && U && (d = gt(`${U}-${m}-${w}`));
      let T = i, A = !1;
      const N = a ? Date.now() : 0, x = d?.lastUpdated || 0, M = d?.lastSyncedWithServer || 0;
      a && N > x ? (T = e.serverState.data, A = !0) : d && x > M && (T = d.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(m, i), Ct(
        m,
        i,
        T,
        ot,
        K.current,
        U
      ), A && w && U && At(T, m, e, U, Date.now()), st(m), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    i,
    f?.status,
    f?.data,
    ...r || []
  ]), yt(() => {
    H && Et(m, {
      serverSync: S,
      formElements: y,
      initialState: i,
      localStorage: g,
      middleware: _.current?.middleware
    });
    const e = `${m}////${K.current}`, n = o.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, n), O({}), () => {
      n && (n.components.delete(e), n.components.size === 0 && o.getState().stateComponents.delete(m));
    };
  }, []);
  const ot = (e, n, a, s) => {
    if (Array.isArray(n)) {
      const d = `${m}-${n.join(".")}`;
      ct.current.add(d);
    }
    const v = o.getState();
    et(m, (d) => {
      const w = X(e) ? e(d) : e, T = `${m}-${n.join(".")}`;
      if (T) {
        let P = !1, k = v.signalDomElements.get(T);
        if ((!k || k.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const j = n.slice(0, -1), W = B(w, j);
          if (Array.isArray(W)) {
            P = !0;
            const $ = `${m}-${j.join(".")}`;
            k = v.signalDomElements.get($);
          }
        }
        if (k) {
          const j = P ? B(w, n.slice(0, -1)) : B(w, n);
          k.forEach(({ parentId: W, position: $, effect: F }) => {
            const E = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (E) {
              const V = Array.from(E.childNodes);
              if (V[$]) {
                const C = F ? new Function("state", `return (${F})(state)`)(j) : j;
                V[$].textContent = String(C);
              }
            }
          });
        }
      }
      console.log("shadowState", v.shadowStateStore), a.updateType === "update" && (s || _.current?.validation?.key) && n && Y(
        (s || _.current?.validation?.key) + "." + n.join(".")
      );
      const A = n.slice(0, n.length - 1);
      a.updateType === "cut" && _.current?.validation?.key && Y(
        _.current?.validation?.key + "." + A.join(".")
      ), a.updateType === "insert" && _.current?.validation?.key && Wt(
        _.current?.validation?.key + "." + A.join(".")
      ).filter(([k, j]) => {
        let W = k?.split(".").length;
        if (k == A.join(".") && W == A.length - 1) {
          let $ = k + "." + A;
          Y(k), Vt($, j);
        }
      });
      const N = v.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const P = ht(d, w), k = new Set(P), j = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          W,
          $
        ] of N.components.entries()) {
          let F = !1;
          const E = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !E.includes("none")) {
            if (E.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (E.includes("component") && (($.paths.has(j) || $.paths.has("")) && (F = !0), !F))
              for (const V of k) {
                let C = V;
                for (; ; ) {
                  if ($.paths.has(C)) {
                    F = !0;
                    break;
                  }
                  const G = C.lastIndexOf(".");
                  if (G !== -1) {
                    const q = C.substring(
                      0,
                      G
                    );
                    if (!isNaN(
                      Number(C.substring(G + 1))
                    ) && $.paths.has(q)) {
                      F = !0;
                      break;
                    }
                    C = q;
                  } else
                    C = "";
                  if (C === "")
                    break;
                }
                if (F) break;
              }
            if (!F && E.includes("deps") && $.depsFunction) {
              const V = $.depsFunction(w);
              let C = !1;
              typeof V == "boolean" ? V && (C = !0) : z($.deps, V) || ($.deps = V, C = !0), C && (F = !0);
            }
            F && $.forceUpdate();
          }
        }
      }
      const x = Date.now();
      n = n.map((P, k) => {
        const j = n.slice(0, -1), W = B(w, j);
        return k === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (W.length - 1).toString() : P;
      });
      const { oldValue: M, newValue: D } = zt(
        a.updateType,
        d,
        w,
        n
      ), R = {
        timeStamp: x,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: M,
        newValue: D
      };
      switch (a.updateType) {
        case "update":
          v.updateShadowAtPath(m, n, w);
          break;
        case "insert":
          const P = n.slice(0, -1);
          v.insertShadowArrayElement(m, P, D);
          break;
        case "cut":
          const k = n.slice(0, -1), j = parseInt(n[n.length - 1]);
          v.removeShadowArrayElement(m, k, j);
          break;
      }
      if (Gt(m, (P) => {
        const j = [...P ?? [], R].reduce((W, $) => {
          const F = `${$.stateKey}:${JSON.stringify($.path)}`, E = W.get(F);
          return E ? (E.timeStamp = Math.max(E.timeStamp, $.timeStamp), E.newValue = $.newValue, E.oldValue = E.oldValue ?? $.oldValue, E.updateType = $.updateType) : W.set(F, { ...$ }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(j.values());
      }), At(
        w,
        m,
        _.current,
        U
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: R
      }), _.current?.serverSync) {
        const P = v.serverState[m], k = _.current?.serverSync;
        Lt(m, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: w }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  o.getState().updaterState[m] || (dt(
    m,
    ut(
      m,
      ot,
      K.current,
      U
    )
  ), o.getState().cogsStateStore[m] || et(m, t), o.getState().initialStateGlobal[m] || It(m, t));
  const u = mt(() => ut(
    m,
    ot,
    K.current,
    U
  ), [m, U]);
  return [Nt(m), u];
}
function ut(t, c, S, g) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const p = (h) => {
    const r = h.join(".");
    for (const [f] of y)
      (f === r || f.startsWith(r + ".")) && y.delete(f);
    b++;
  }, I = {
    removeValidation: (h) => {
      h?.validationKey && Y(h.validationKey);
    },
    revertToInitialState: (h) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && Y(r?.key), h?.validationKey && Y(h.validationKey);
      const f = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const L = i(f, []), O = rt(t), U = X(O?.localStorage?.key) ? O?.localStorage?.key(f) : O?.localStorage?.key, H = `${g}-${t}-${U}`;
      H && localStorage.removeItem(H), dt(t, L), et(t, f);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (h) => {
      y.clear(), b++;
      const r = ut(
        t,
        c,
        S,
        g
      ), f = o.getState().initialStateGlobal[t], L = rt(t), O = X(L?.localStorage?.key) ? L?.localStorage?.key(f) : L?.localStorage?.key, U = `${g}-${t}-${O}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), _t(() => {
        It(t, h), o.getState().initializeShadowState(t, h), dt(t, r), et(t, h);
        const H = o.getState().stateComponents.get(t);
        H && H.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (H) => r.get()[H]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const h = o.getState().serverState[t];
      return !!(h && z(h, Nt(t)));
    }
  };
  function i(h, r = [], f) {
    const L = r.map(String).join(".");
    y.get(L);
    const O = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(I).forEach((m) => {
      O[m] = I[m];
    });
    const U = {
      apply(m, l, ct) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, r);
      },
      get(m, l) {
        f?.validIndices && !Array.isArray(h) && (f = { ...f, validIndices: void 0 });
        const ct = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ct.has(l)) {
          const u = `${t}////${S}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(u);
            if (n && !n.paths.has("")) {
              const a = r.join(".");
              let s = !0;
              for (const v of n.paths)
                if (a.startsWith(v) && (a === v || a[v.length] === ".")) {
                  s = !1;
                  break;
                }
              s && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => ht(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && r.length === 0)
          return async function() {
            const u = o.getState().getInitialOptions(t), e = u?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = o.getState().getNestedState(t, []), a = u?.validation?.key;
            try {
              const s = await e.action(n);
              if (s && !s.success && s.errors && a) {
                o.getState().removeValidationError(a), s.errors.forEach((d) => {
                  const w = [a, ...d.path].join(".");
                  o.getState().addValidationError(w, d.message);
                });
                const v = o.getState().stateComponents.get(t);
                v && v.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return s?.success && e.onSuccess ? e.onSuccess(s.data) : !s?.success && e.onError && e.onError(s.error), s;
            } catch (s) {
              return e.onError && e.onError(s), { success: !1, error: s };
            }
          };
        if (l === "_status") {
          const u = o.getState().getNestedState(t, r), e = o.getState().initialStateGlobal[t], n = B(e, r);
          return z(u, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], n = B(e, r);
            return z(u, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = o.getState().initialStateGlobal[t], e = rt(t), n = X(e?.localStorage?.key) ? e?.localStorage?.key(u) : e?.localStorage?.key, a = `${g}-${t}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const u = o.getState().getInitialOptions(t)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(u.key + "." + r.join("."));
          };
        if (Array.isArray(h)) {
          const u = () => f?.validIndices ? h.map((n, a) => ({
            item: n,
            originalIndex: f.validIndices[a]
          })) : o.getState().getNestedState(t, r).map((n, a) => ({
            item: n,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, r.join("."));
              if (e !== void 0)
                return i(
                  h[e],
                  [...r, e.toString()],
                  f
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
                itemHeight: n = 50,
                overscan: a = 6,
                stickToBottom: s = !1,
                dependencies: v = []
              } = e, d = Q(null), [w, T] = tt({
                startIndex: 0,
                endIndex: 10
              }), A = Q(!1), N = Q(null), [x, M] = tt(0);
              Z(() => o.getState().subscribeToShadowState(t, () => {
                M((V) => V + 1);
              }), [t]);
              const D = o().getNestedState(
                t,
                r
              ), R = D.length, { totalHeight: P, positions: k } = mt(() => {
                const E = o.getState().getShadowMetadata(t, r) || [];
                let V = 0;
                const C = [];
                for (let G = 0; G < R; G++) {
                  C[G] = V;
                  const q = E[G]?.virtualizer?.itemHeight;
                  V += q || n;
                }
                return { totalHeight: V, positions: C };
              }, [
                R,
                t,
                r.join("."),
                n,
                x
              ]), j = mt(() => {
                const E = Math.max(0, w.startIndex), V = Math.min(R, w.endIndex), C = Array.from(
                  { length: V - E },
                  (q, nt) => E + nt
                ), G = C.map((q) => D[q]);
                return i(G, r, {
                  ...f,
                  validIndices: C
                });
              }, [w.startIndex, w.endIndex, D, R]);
              Z(() => {
                if (!s || !d.current || R === 0)
                  return;
                const E = d.current;
                (E.scrollHeight - E.scrollTop - E.clientHeight < 100 || !A.current) && (N.current && clearTimeout(N.current), N.current = setTimeout(() => {
                  d.current && d.current.scrollTo({
                    top: d.current.scrollHeight,
                    behavior: "smooth"
                  });
                }, 100));
              }, [R, s]), Z(() => {
                const E = d.current;
                if (!E) return;
                let V;
                const C = () => {
                  clearTimeout(V), A.current = !0, V = setTimeout(() => {
                    A.current = !1;
                  }, 150);
                  const { scrollTop: G, clientHeight: q } = E;
                  let nt = 0;
                  for (let J = 0; J < k.length; J++)
                    if (k[J] > G - n * a) {
                      nt = Math.max(0, J - 1);
                      break;
                    }
                  let pt = nt;
                  const xt = G + q;
                  for (let J = nt; J < k.length && !(k[J] > xt + n * a); J++)
                    pt = J;
                  T({
                    startIndex: Math.max(0, nt),
                    endIndex: Math.min(R, pt + 1 + a)
                  });
                };
                return E.addEventListener("scroll", C, {
                  passive: !0
                }), C(), () => {
                  E.removeEventListener("scroll", C), clearTimeout(V);
                };
              }, [k, R, n, a]), Z(() => () => {
                N.current && clearTimeout(N.current);
              }, []);
              const W = wt(
                (E = "smooth") => {
                  d.current && d.current.scrollTo({
                    top: d.current.scrollHeight,
                    behavior: E
                  });
                },
                []
              ), $ = wt(
                (E, V = "smooth") => {
                  d.current && k[E] !== void 0 && d.current.scrollTo({
                    top: k[E],
                    behavior: V
                  });
                },
                [k]
              ), F = {
                outer: {
                  ref: d,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${P}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${k[w.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: j,
                virtualizerProps: F,
                scrollToBottom: W,
                scrollToIndex: $
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...u()].sort(
                (d, w) => e(d.item, w.item)
              ), s = a.map(({ item: d }) => d), v = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: d }) => d
                )
              };
              return i(s, r, v);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = u().filter(
                ({ item: d }, w) => e(d, w)
              ), s = a.map(({ item: d }) => d), v = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: d }) => d
                )
              };
              return i(s, r, v);
            };
          if (l === "stateMap")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (f?.validIndices || Array.from({ length: n.length }, (s, v) => v)).map((s, v) => {
                const d = n[s], w = [...r, s.toString()], T = i(d, w, f);
                return e(d, T, {
                  register: () => {
                    const [, N] = tt({}), x = `${S}-${r.join(".")}-${s}`;
                    yt(() => {
                      const M = `${t}////${x}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(M, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([w.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const R = o.getState().stateComponents.get(t);
                        R && R.components.delete(M);
                      };
                    }, [t, x]);
                  },
                  index: v,
                  originalIndex: s
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${r.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => h.map((a, s) => {
              let v;
              f?.validIndices && f.validIndices[s] !== void 0 ? v = f.validIndices[s] : v = s;
              const d = [...r, v.toString()], w = i(a, d, f);
              return e(
                a,
                w,
                s,
                h,
                i(h, r, f)
              );
            });
          if (l === "$stateMap")
            return (e) => it(qt, {
              proxy: {
                _stateKey: t,
                _path: r,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateList")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (f?.validIndices || Array.from({ length: n.length }, (s, v) => v)).map((s, v) => {
                const d = n[s], w = [...r, s.toString()], T = i(d, w, f), A = `${S}-${r.join(".")}-${s}`;
                return it(Yt, {
                  key: s,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: w,
                  children: e(
                    d,
                    T,
                    { localIndex: v, originalIndex: s },
                    n,
                    i(n, r, f)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${r.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const n = h;
              y.clear(), b++;
              const a = n.flatMap(
                (s) => s[e] ?? []
              );
              return i(
                a,
                [...r, "[*]", e],
                f
              );
            };
          if (l === "index")
            return (e) => {
              const n = h[e];
              return i(n, [...r, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, r);
              if (e.length === 0) return;
              const n = e.length - 1, a = e[n], s = [...r, n.toString()];
              return i(a, s);
            };
          if (l === "insert")
            return (e) => (p(r), ft(c, e, r, t), i(
              o.getState().getNestedState(t, r),
              r
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const s = o.getState().getNestedState(t, r), v = X(e) ? e(s) : e;
              let d = null;
              if (!s.some((T) => {
                if (n) {
                  const N = n.every(
                    (x) => z(T[x], v[x])
                  );
                  return N && (d = T), N;
                }
                const A = z(T, v);
                return A && (d = T), A;
              }))
                p(r), ft(c, v, r, t);
              else if (a && d) {
                const T = a(d), A = s.map(
                  (N) => z(N, d) ? T : N
                );
                p(r), at(c, A, r);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return p(r), lt(c, r, t, e), i(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < h.length; n++)
                h[n] === e && lt(c, r, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = h.findIndex((a) => a === e);
              n > -1 ? lt(c, r, t, n) : ft(c, e, r, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = u().find(
                ({ item: v }, d) => e(v, d)
              );
              if (!a) return;
              const s = [...r, a.originalIndex.toString()];
              return i(a.item, s, f);
            };
          if (l === "findWith")
            return (e, n) => {
              const s = u().find(
                ({ item: d }) => d[e] === n
              );
              if (!s) return;
              const v = [...r, s.originalIndex.toString()];
              return i(s.item, v, f);
            };
        }
        const K = r[r.length - 1];
        if (!isNaN(Number(K))) {
          const u = r.slice(0, -1), e = o.getState().getNestedState(t, u);
          if (Array.isArray(e) && l === "cut")
            return () => lt(
              c,
              u,
              t,
              Number(K)
            );
        }
        if (l === "get")
          return () => {
            if (f?.validIndices && Array.isArray(h)) {
              const u = o.getState().getNestedState(t, r);
              return f.validIndices.map((e) => u[e]);
            }
            return o.getState().getNestedState(t, r);
          };
        if (l === "$derive")
          return (u) => $t({
            _stateKey: t,
            _path: r,
            _effect: u.toString()
          });
        if (l === "$get")
          return () => $t({
            _stateKey: t,
            _path: r
          });
        if (l === "lastSynced") {
          const u = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(u);
        }
        if (l == "getLocalStorage")
          return (u) => gt(g + "-" + t + "-" + u);
        if (l === "_selected") {
          const u = r.slice(0, -1), e = u.join("."), n = o.getState().getNestedState(t, u);
          return Array.isArray(n) ? Number(r[r.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const e = r.slice(0, -1), n = Number(r[r.length - 1]), a = e.join(".");
            u ? o.getState().setSelectedIndex(t, a, n) : o.getState().setSelectedIndex(t, a, void 0);
            const s = o.getState().getNestedState(t, [...e]);
            at(c, s, e), p(e);
          };
        if (l === "toggleSelected")
          return () => {
            const u = r.slice(0, -1), e = Number(r[r.length - 1]), n = u.join("."), a = o.getState().getSelectedIndex(t, n);
            o.getState().setSelectedIndex(
              t,
              n,
              a === e ? void 0 : e
            );
            const s = o.getState().getNestedState(t, [...u]);
            at(c, s, u), p(u);
          };
        if (r.length == 0) {
          if (l === "addValidation")
            return (u) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              Y(e.key), console.log("addValidationError", u), u.forEach((n) => {
                const a = [e.key, ...n.path].join(".");
                console.log("fullErrorPath", a), Vt(a, n.message);
              }), st(t);
            };
          if (l === "applyJsonPatch")
            return (u) => {
              const e = o.getState().cogsStateStore[t], a = Ft(e, u).newDocument;
              Ct(
                t,
                o.getState().initialStateGlobal[t],
                a,
                c,
                S,
                g
              );
              const s = o.getState().stateComponents.get(t);
              if (s) {
                const v = ht(e, a), d = new Set(v);
                for (const [
                  w,
                  T
                ] of s.components.entries()) {
                  let A = !1;
                  const N = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (T.paths.has("") && (A = !0), !A))
                      for (const x of d) {
                        if (T.paths.has(x)) {
                          A = !0;
                          break;
                        }
                        let M = x.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const D = x.substring(0, M);
                          if (T.paths.has(D)) {
                            A = !0;
                            break;
                          }
                          const R = x.substring(
                            M + 1
                          );
                          if (!isNaN(Number(R))) {
                            const P = D.lastIndexOf(".");
                            if (P !== -1) {
                              const k = D.substring(
                                0,
                                P
                              );
                              if (T.paths.has(k)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          M = D.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && N.includes("deps") && T.depsFunction) {
                      const x = T.depsFunction(a);
                      let M = !1;
                      typeof x == "boolean" ? x && (M = !0) : z(T.deps, x) || (T.deps = x, M = !0), M && (A = !0);
                    }
                    A && T.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const u = o.getState().getInitialOptions(t)?.validation, e = o.getState().addValidationError;
              if (!u?.zodSchema)
                throw new Error("Zod schema not found");
              if (!u?.key)
                throw new Error("Validation key not found");
              Y(u.key);
              const n = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(u.key);
                a && a.length > 0 && a.forEach(([v]) => {
                  v && v.startsWith(u.key) && Y(v);
                });
                const s = u.zodSchema.safeParse(n);
                return s.success ? !0 : (s.error.errors.forEach((d) => {
                  const w = d.path, T = d.message, A = [u.key, ...w].join(".");
                  e(A, T);
                }), st(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return S;
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
          return () => Tt.getState().getFormRef(t + "." + r.join("."));
        if (l === "validationWrapper")
          return ({
            children: u,
            hideMessage: e
          }) => /* @__PURE__ */ St(
            Ot,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: f?.validIndices,
              children: u
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return r;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (u, e) => {
            if (e?.debounce)
              jt(() => {
                at(c, u, r, "");
                const n = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              at(c, u, r, "");
              const n = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(n);
            }
            p(r);
          };
        if (l === "formElement")
          return (u, e) => /* @__PURE__ */ St(
            Ut,
            {
              setState: c,
              stateKey: t,
              path: r,
              child: u,
              formOpts: e
            }
          );
        const _ = [...r, l], ot = o.getState().getNestedState(t, _);
        return i(ot, _, f);
      }
    }, H = new Proxy(O, U);
    return y.set(L, {
      proxy: H,
      stateVersion: b
    }), H;
  }
  return i(
    o.getState().getNestedState(t, [])
  );
}
function $t(t) {
  return it(Jt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: c
}) {
  const S = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? c(
    S,
    t._path
  ).stateMapNoRender(
    (y, b, p, I, i) => t._mapFn(y, b, p, I, i)
  ) : null;
}
function Jt({
  proxy: t
}) {
  const c = Q(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return Z(() => {
    const g = c.current;
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
    o.getState().addSignalElement(S, h);
    const r = o.getState().getNestedState(t._stateKey, t._path);
    let f;
    if (t._effect)
      try {
        f = new Function(
          "state",
          `return (${t._effect})(state)`
        )(r);
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), f = r;
      }
    else
      f = r;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const L = document.createTextNode(String(f));
    g.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), it("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function de(t) {
  const c = Pt(
    (S) => {
      const g = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return it("text", {}, String(c));
}
function Yt({
  stateKey: t,
  itemComponentId: c,
  itemPath: S,
  children: g
}) {
  const [, y] = tt({}), [b, p] = Dt(), I = Q(null);
  return Z(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, S]), yt(() => {
    const i = `${t}////${c}`, h = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return h.components.set(i, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), o.getState().stateComponents.set(t, h), () => {
      const r = o.getState().stateComponents.get(t);
      r && r.components.delete(i);
    };
  }, [t, c, S.join(".")]), /* @__PURE__ */ St("div", { ref: b, children: g });
}
export {
  $t as $cogsSignal,
  de as $cogsSignalStore,
  se as addStateOptions,
  ce as createCogsState,
  le as notifyComponent,
  Bt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
