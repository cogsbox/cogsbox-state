"use client";
import { jsx as ht } from "react/jsx-runtime";
import { useState as Q, useRef as Z, useEffect as K, useLayoutEffect as lt, useMemo as vt, createElement as ot, useSyncExternalStore as Pt, startTransition as _t, useCallback as Et } from "react";
import { transformStateFunc as Mt, isDeepEqual as H, isFunction as Y, getNestedValue as B, getDifferences as yt, debounce as Rt } from "./utility.js";
import { pushFunc as mt, updateFn as rt, cutFunc as ct, ValidationWrapper as Ot, FormControlComponent as Ut } from "./Functions.jsx";
import jt from "superjson";
import { v4 as It } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as At } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import { applyPatch as Ft } from "fast-json-patch";
import Dt from "react-use-measure";
function Tt(t, i) {
  const m = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...i
  });
}
function $t({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const f = et(t) || {}, y = m[t] || {}, b = r.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (i)
    for (const a in i)
      p.hasOwnProperty(a) ? (a == "localStorage" && i[a] && p[a].key !== i[a]?.key && (I = !0, p[a] = i[a]), a == "initialState" && i[a] && p[a] !== i[a] && // Different references
      !H(p[a], i[a]) && (I = !0, p[a] = i[a])) : (I = !0, p[a] = i[a]);
  I && b(t, p);
}
function ce(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const le = (t, i) => {
  let m = t;
  const [f, y] = Mt(m);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, et(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const b = (I, a) => {
    const [v] = Q(a?.componentId ?? It());
    $t({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = r.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [L, j] = qt(
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
    return j;
  };
  function p(I, a) {
    $t({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Bt(I, a), ft(I);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: dt,
  setState: tt,
  getInitialOptions: et,
  getKeyState: Ct,
  getValidationErrors: Lt,
  setStateLog: Wt,
  updateInitialStateGlobal: pt,
  addValidationError: Gt,
  removeValidationError: J,
  setServerSyncActions: Ht
} = r.getState(), kt = (t, i, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    f
  );
  const b = Y(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const p = `${f}-${i}-${b}`;
    let I;
    try {
      I = gt(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = jt.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
    );
  }
}, gt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Bt = (t, i) => {
  const m = r.getState().cogsStateStore[t], { sessionId: f } = Nt(), y = Y(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (y && f) {
    const b = gt(
      `${f}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return tt(t, b.state), ft(t), !0;
  }
  return !1;
}, xt = (t, i, m, f, y, b) => {
  const p = {
    initialState: i,
    updaterState: ut(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  pt(t, p.initialState), dt(t, p.updaterState), tt(t, p.state);
}, ft = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, de = (t, i) => {
  const m = r.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${i}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, zt = (t, i, m, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(i, f),
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
        oldValue: B(i, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function qt(t, {
  stateKey: i,
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
  const [L, j] = Q({}), { sessionId: F } = Nt();
  let W = !i;
  const [h] = Q(i ?? It()), l = r.getState().stateLog[h], at = Z(/* @__PURE__ */ new Set()), X = Z(I ?? It()), O = Z(
    null
  );
  O.current = et(h) ?? null, K(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      tt(h, (o) => ({
        ...o,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), K(() => {
    if (a) {
      Tt(h, {
        initialState: a
      });
      const e = O.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[h];
      if (!(c && !H(c, a) || !c) && !s)
        return;
      let u = null;
      const A = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      A && F && (u = gt(`${F}-${h}-${A}`));
      let w = a, T = !1;
      const M = s ? Date.now() : 0, P = u?.lastUpdated || 0, R = u?.lastSyncedWithServer || 0;
      s && M > P ? (w = e.serverState.data, T = !0) : u && P > R && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), r.getState().initializeShadowState(h, a), xt(
        h,
        a,
        w,
        nt,
        X.current,
        F
      ), T && A && F && kt(w, h, e, F, Date.now()), ft(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || j({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), lt(() => {
    W && Tt(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: O.current?.middleware
    });
    const e = `${h}////${X.current}`, o = r.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => j({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(h, o), j({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(h));
    };
  }, []);
  const nt = (e, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${h}-${o.join(".")}`;
      at.current.add(u);
    }
    const g = r.getState();
    tt(h, (u) => {
      const A = Y(e) ? e(u) : e, w = `${h}-${o.join(".")}`;
      if (w) {
        let V = !1, C = g.signalDomElements.get(w);
        if ((!C || C.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const U = o.slice(0, -1), D = B(A, U);
          if (Array.isArray(D)) {
            V = !0;
            const $ = `${h}-${U.join(".")}`;
            C = g.signalDomElements.get($);
          }
        }
        if (C) {
          const U = V ? B(A, o.slice(0, -1)) : B(A, o);
          C.forEach(({ parentId: D, position: $, effect: E }) => {
            const k = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (k) {
              const _ = Array.from(k.childNodes);
              if (_[$]) {
                const x = E ? new Function("state", `return (${E})(state)`)(U) : U;
                _[$].textContent = String(x);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (c || O.current?.validation?.key) && o && J(
        (c || O.current?.validation?.key) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      s.updateType === "cut" && O.current?.validation?.key && J(
        O.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && O.current?.validation?.key && Lt(
        O.current?.validation?.key + "." + T.join(".")
      ).filter(([C, U]) => {
        let D = C?.split(".").length;
        if (C == T.join(".") && D == T.length - 1) {
          let $ = C + "." + T;
          J(C), Gt($, U);
        }
      });
      const M = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", M), M) {
        const V = yt(u, A), C = new Set(V), U = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of M.components.entries()) {
          let E = !1;
          const k = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !k.includes("none")) {
            if (k.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (k.includes("component") && (($.paths.has(U) || $.paths.has("")) && (E = !0), !E))
              for (const _ of C) {
                let x = _;
                for (; ; ) {
                  if ($.paths.has(x)) {
                    E = !0;
                    break;
                  }
                  const G = x.lastIndexOf(".");
                  if (G !== -1) {
                    const q = x.substring(
                      0,
                      G
                    );
                    if (!isNaN(
                      Number(x.substring(G + 1))
                    ) && $.paths.has(q)) {
                      E = !0;
                      break;
                    }
                    x = q;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (E) break;
              }
            if (!E && k.includes("deps") && $.depsFunction) {
              const _ = $.depsFunction(A);
              let x = !1;
              typeof _ == "boolean" ? _ && (x = !0) : H($.deps, _) || ($.deps = _, x = !0), x && (E = !0);
            }
            E && $.forceUpdate();
          }
        }
      }
      const P = Date.now();
      o = o.map((V, C) => {
        const U = o.slice(0, -1), D = B(A, U);
        return C === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : V;
      });
      const { oldValue: R, newValue: N } = zt(
        s.updateType,
        u,
        A,
        o
      ), z = {
        timeStamp: P,
        stateKey: h,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: R,
        newValue: N
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, o, A);
          break;
        case "insert":
          const V = o.slice(0, -1);
          g.insertShadowArrayElement(h, V, N);
          break;
        case "cut":
          const C = o.slice(0, -1), U = parseInt(o[o.length - 1]);
          g.removeShadowArrayElement(h, C, U);
          break;
      }
      if (Wt(h, (V) => {
        const U = [...V ?? [], z].reduce((D, $) => {
          const E = `${$.stateKey}:${JSON.stringify($.path)}`, k = D.get(E);
          return k ? (k.timeStamp = Math.max(k.timeStamp, $.timeStamp), k.newValue = $.newValue, k.oldValue = k.oldValue ?? $.oldValue, k.updateType = $.updateType) : D.set(E, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(U.values());
      }), kt(
        A,
        h,
        O.current,
        F
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: z
      }), O.current?.serverSync) {
        const V = g.serverState[h], C = O.current?.serverSync;
        Ht(h, {
          syncKey: typeof C.syncKey == "string" ? C.syncKey : C.syncKey({ state: A }),
          rollBackState: V,
          actionTimeStamp: Date.now() + (C.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  r.getState().updaterState[h] || (dt(
    h,
    ut(
      h,
      nt,
      X.current,
      F
    )
  ), r.getState().cogsStateStore[h] || tt(h, t), r.getState().initialStateGlobal[h] || pt(h, t));
  const d = vt(() => ut(
    h,
    nt,
    X.current,
    F
  ), [h, F]);
  return [Ct(h), d];
}
function ut(t, i, m, f) {
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
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const L = a(S, []), j = et(t), F = Y(j?.localStorage?.key) ? j?.localStorage?.key(S) : j?.localStorage?.key, W = `${f}-${t}-${F}`;
      W && localStorage.removeItem(W), dt(t, L), tt(t, S);
      const h = r.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = ut(
        t,
        i,
        m,
        f
      ), S = r.getState().initialStateGlobal[t], L = et(t), j = Y(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, F = `${f}-${t}-${j}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), _t(() => {
        pt(t, v), r.getState().initializeShadowState(t, v), dt(t, n), tt(t, v);
        const W = r.getState().stateComponents.get(t);
        W && W.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (W) => n.get()[W]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = r.getState().serverState[t];
      return !!(v && H(v, Ct(t)));
    }
  };
  function a(v, n = [], S) {
    const L = n.map(String).join(".");
    y.get(L);
    const j = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      j[h] = I[h];
    });
    const F = {
      apply(h, l, at) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
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
          const d = `${t}////${m}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const o = e.components.get(d);
            if (o && !o.paths.has("")) {
              const s = n.join(".");
              let c = !0;
              for (const g of o.paths)
                if (s.startsWith(g) && (s === g || s[g.length] === ".")) {
                  c = !1;
                  break;
                }
              c && o.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => yt(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(t, []), s = d?.validation?.key;
            try {
              const c = await e.action(o);
              if (c && !c.success && c.errors && s) {
                r.getState().removeValidationError(s), c.errors.forEach((u) => {
                  const A = [s, ...u.path].join(".");
                  r.getState().addValidationError(A, u.message);
                });
                const g = r.getState().stateComponents.get(t);
                g && g.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = B(e, n);
          return H(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = B(e, n);
            return H(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = et(t), o = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${o}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => S?.validIndices ? v.map((o, s) => ({
            item: o,
            originalIndex: S.validIndices[s]
          })) : r.getState().getNestedState(t, n).map((o, s) => ({
            item: o,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return a(
                  v[e],
                  [...n, e.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: o = 50,
                overscan: s = 6,
                stickToBottom: c = !1
              } = e, g = Z(null), [u, A] = Q({
                startIndex: 0,
                endIndex: 10
              }), w = Z(c), T = Z(0), [M, P] = Q(0);
              K(() => r.getState().subscribeToShadowState(t, () => {
                P((k) => k + 1);
              }), [t]);
              const R = r().getNestedState(
                t,
                n
              ), N = R.length, { totalHeight: z, positions: V } = vt(() => {
                const E = r.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const _ = [];
                for (let x = 0; x < N; x++) {
                  _[x] = k;
                  const G = E[x]?.virtualizer?.itemHeight;
                  k += G || o;
                }
                return { totalHeight: k, positions: _ };
              }, [
                N,
                t,
                n.join("."),
                o,
                M
              ]), C = vt(() => {
                const E = Math.max(0, u.startIndex), k = Math.min(N, u.endIndex), _ = Array.from(
                  { length: k - E },
                  (G, q) => E + q
                ), x = _.map((G) => R[G]);
                return a(x, n, {
                  ...S,
                  validIndices: _
                });
              }, [u.startIndex, u.endIndex, R, N]);
              lt(() => {
                const E = g.current, k = N > T.current;
                if (!E || !c || !w.current || !k)
                  return;
                A({
                  startIndex: Math.max(0, N - 10 - s),
                  endIndex: N
                });
                const _ = setInterval(() => {
                  const x = N - 1;
                  ((r.getState().getShadowMetadata(t, n) || [])[x]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(_), E.scrollTo({
                    top: E.scrollHeight,
                    behavior: "smooth"
                  }));
                }, 100);
                return () => clearInterval(_);
              }, [N]), K(() => {
                const E = g.current;
                if (!E) return;
                const k = () => {
                  const { scrollTop: x, clientHeight: G } = E;
                  let q = 0, st = N - 1;
                  for (; q <= st; ) {
                    const St = Math.floor((q + st) / 2);
                    V[St] < x ? q = St + 1 : st = St - 1;
                  }
                  const wt = Math.max(0, st - s);
                  let it = wt;
                  const Vt = x + G;
                  for (; it < N && V[it] < Vt; )
                    it++;
                  A({
                    startIndex: wt,
                    endIndex: Math.min(N, it + s)
                  });
                }, _ = () => {
                  E.scrollHeight - E.scrollTop - E.clientHeight < 1 || (w.current = !1), k();
                };
                return E.addEventListener("scroll", _, {
                  passive: !0
                }), k(), () => E.removeEventListener("scroll", _);
              }, [N, V]), K(() => {
                T.current = N;
              });
              const U = Et(
                (E = "smooth") => {
                  g.current && (w.current = !0, console.log("USER ACTION: Scroll lock ENABLED."), g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: E
                  }));
                },
                []
              ), D = Et(
                (E, k = "smooth") => {
                  g.current && V[E] !== void 0 && (w.current = !1, console.log("USER ACTION: Scroll lock DISABLED."), g.current.scrollTo({
                    top: V[E],
                    behavior: k
                  }));
                },
                [V]
              ), $ = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${z}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${V[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: C,
                virtualizerProps: $,
                scrollToBottom: U,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, A) => e(u.item, A.item)
              ), c = s.map(({ item: u }) => u), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, g);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, A) => e(u, A)
              ), c = s.map(({ item: u }) => u), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, g);
            };
          if (l === "stateMap")
            return (e) => {
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, g) => g)).map((c, g) => {
                const u = o[c], A = [...n, c.toString()], w = a(u, A, S);
                return e(u, w, {
                  register: () => {
                    const [, M] = Q({}), P = `${m}-${n.join(".")}-${c}`;
                    lt(() => {
                      const R = `${t}////${P}`, N = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return N.components.set(R, {
                        forceUpdate: () => M({}),
                        paths: /* @__PURE__ */ new Set([A.join(".")])
                      }), r.getState().stateComponents.set(t, N), () => {
                        const z = r.getState().stateComponents.get(t);
                        z && z.components.delete(R);
                      };
                    }, [t, P]);
                  },
                  index: g,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((s, c) => {
              let g;
              S?.validIndices && S.validIndices[c] !== void 0 ? g = S.validIndices[c] : g = c;
              const u = [...n, g.toString()], A = a(s, u, S);
              return e(
                s,
                A,
                c,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ot(Jt, {
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
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, g) => g)).map((c, g) => {
                const u = o[c], A = [...n, c.toString()], w = a(u, A, S), T = `${m}-${n.join(".")}-${c}`;
                return ot(Zt, {
                  key: c,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: A,
                  children: e(
                    u,
                    w,
                    g,
                    o,
                    a(o, n, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const o = v;
              y.clear(), b++;
              const s = o.flatMap(
                (c) => c[e] ?? []
              );
              return a(
                s,
                [...n, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const o = v[e];
              return a(o, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const o = e.length - 1, s = e[o], c = [...n, o.toString()];
              return a(s, c);
            };
          if (l === "insert")
            return (e) => (p(n), mt(i, e, n, t), a(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, s) => {
              const c = r.getState().getNestedState(t, n), g = Y(e) ? e(c) : e;
              let u = null;
              if (!c.some((w) => {
                if (o) {
                  const M = o.every(
                    (P) => H(w[P], g[P])
                  );
                  return M && (u = w), M;
                }
                const T = H(w, g);
                return T && (u = w), T;
              }))
                p(n), mt(i, g, n, t);
              else if (s && u) {
                const w = s(u), T = c.map(
                  (M) => H(M, u) ? w : M
                );
                p(n), rt(i, T, n);
              }
            };
          if (l === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return p(n), ct(i, n, t, e), a(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let o = 0; o < v.length; o++)
                v[o] === e && ct(i, n, t, o);
            };
          if (l === "toggleByValue")
            return (e) => {
              const o = v.findIndex((s) => s === e);
              o > -1 ? ct(i, n, t, o) : mt(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: g }, u) => e(g, u)
              );
              if (!s) return;
              const c = [...n, s.originalIndex.toString()];
              return a(s.item, c, S);
            };
          if (l === "findWith")
            return (e, o) => {
              const c = d().find(
                ({ item: u }) => u[e] === o
              );
              if (!c) return;
              const g = [...n, c.originalIndex.toString()];
              return a(c.item, g, S);
            };
        }
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const d = n.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ct(
              i,
              d,
              t,
              Number(X)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const d = r.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
            }
            return r.getState().getNestedState(t, n);
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
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => gt(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), o = r.getState().getNestedState(t, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), s = e.join(".");
            d ? r.getState().setSelectedIndex(t, s, o) : r.getState().setSelectedIndex(t, s, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            rt(i, c, e), p(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), o = d.join("."), s = r.getState().getSelectedIndex(t, o);
            r.getState().setSelectedIndex(
              t,
              o,
              s === e ? void 0 : e
            );
            const c = r.getState().getNestedState(t, [...d]);
            rt(i, c, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], s = Ft(e, d).newDocument;
              xt(
                t,
                r.getState().initialStateGlobal[t],
                s,
                i,
                m,
                f
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const g = yt(e, s), u = new Set(g);
                for (const [
                  A,
                  w
                ] of c.components.entries()) {
                  let T = !1;
                  const M = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!M.includes("none")) {
                    if (M.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (M.includes("component") && (w.paths.has("") && (T = !0), !T))
                      for (const P of u) {
                        if (w.paths.has(P)) {
                          T = !0;
                          break;
                        }
                        let R = P.lastIndexOf(".");
                        for (; R !== -1; ) {
                          const N = P.substring(0, R);
                          if (w.paths.has(N)) {
                            T = !0;
                            break;
                          }
                          const z = P.substring(
                            R + 1
                          );
                          if (!isNaN(Number(z))) {
                            const V = N.lastIndexOf(".");
                            if (V !== -1) {
                              const C = N.substring(
                                0,
                                V
                              );
                              if (w.paths.has(C)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          R = N.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && M.includes("deps") && w.depsFunction) {
                      const P = w.depsFunction(s);
                      let R = !1;
                      typeof P == "boolean" ? P && (R = !0) : H(w.deps, P) || (w.deps = P, R = !0), R && (T = !0);
                    }
                    T && w.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = r.getState().getInitialOptions(t)?.validation, e = r.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              J(d.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const s = r.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && J(g);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const A = u.path, w = u.message, T = [d.key, ...A].join(".");
                  e(T, w);
                }), ft(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => At.getState().getFormRefsByStateKey(t);
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
          return () => At.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ ht(
            Ot,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
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
                rt(i, d, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              rt(i, d, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ ht(
            Ut,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const O = [...n, l], nt = r.getState().getNestedState(t, O);
        return a(nt, O, S);
      }
    }, W = new Proxy(j, F);
    return y.set(L, {
      proxy: W,
      stateVersion: b
    }), W;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function bt(t) {
  return ot(Yt, { proxy: t });
}
function Jt({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (y, b, p, I, a) => t._mapFn(y, b, p, I, a)
  ) : null;
}
function Yt({
  proxy: t
}) {
  const i = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const f = i.current;
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
    r.getState().addSignalElement(m, v);
    const n = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (j) {
        console.error("Error evaluating effect function during mount:", j), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const L = document.createTextNode(String(S));
    f.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), ot("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ue(t) {
  const i = Pt(
    (m) => {
      const f = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return ot("text", {}, String(i));
}
function Zt({
  stateKey: t,
  itemComponentId: i,
  itemPath: m,
  children: f
}) {
  const [, y] = Q({}), [b, p] = Dt(), I = Z(null);
  return K(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, r.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), lt(() => {
    const a = `${t}////${i}`, v = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), r.getState().stateComponents.set(t, v), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, i, m.join(".")]), /* @__PURE__ */ ht("div", { ref: b, children: f });
}
export {
  bt as $cogsSignal,
  ue as $cogsSignalStore,
  ce as addStateOptions,
  le as createCogsState,
  de as notifyComponent,
  qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
