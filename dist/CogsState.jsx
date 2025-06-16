"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as Q, useRef as Z, useEffect as ot, useLayoutEffect as ct, useMemo as ht, createElement as at, useSyncExternalStore as Ct, startTransition as Pt, useCallback as wt } from "react";
import { transformStateFunc as _t, isDeepEqual as H, isFunction as Y, getNestedValue as z, getDifferences as vt, debounce as Mt } from "./utility.js";
import { pushFunc as St, updateFn as rt, cutFunc as it, ValidationWrapper as jt, FormControlComponent as Rt } from "./Functions.jsx";
import Ot from "superjson";
import { v4 as yt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Tt } from "./store.js";
import { useCogsConfig as bt } from "./CogsStateClient.jsx";
import { applyPatch as Ut } from "fast-json-patch";
import Ft from "react-use-measure";
function Et(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function At({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = et(t) || {}, y = m[t] || {}, b = o.getState().setInitialStateOptions, T = { ...y, ...f };
  let p = !1;
  if (c)
    for (const s in c)
      T.hasOwnProperty(s) ? (s == "localStorage" && c[s] && T[s].key !== c[s]?.key && (p = !0, T[s] = c[s]), s == "initialState" && c[s] && T[s] !== c[s] && // Different references
      !H(T[s], c[s]) && (p = !0, T[s] = c[s])) : (p = !0, T[s] = c[s]);
  p && b(t, T);
}
function ie(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const ce = (t, c) => {
  let m = t;
  const [f, y] = _t(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((p) => {
    y[p] = y[p] || {}, y[p].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[p].formElements || {}
      // State-specific overrides
    }, et(p) || o.getState().setInitialStateOptions(p, y[p]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const b = (p, s) => {
    const [v] = Q(s?.componentId ?? yt());
    At({
      stateKey: p,
      options: s,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[p] || f[p], S = s?.modifyState ? s.modifyState(n) : n, [L, O] = Bt(
      S,
      {
        stateKey: p,
        syncUpdate: s?.syncUpdate,
        componentId: v,
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
    return O;
  };
  function T(p, s) {
    At({ stateKey: p, options: s, initialOptionsPart: y }), s.localStorage && Ht(p, s), gt(p);
  }
  return { useCogsState: b, setCogsOptions: T };
}, {
  setUpdaterState: lt,
  setState: K,
  getInitialOptions: et,
  getKeyState: Nt,
  getValidationErrors: Dt,
  setStateLog: Wt,
  updateInitialStateGlobal: It,
  addValidationError: Lt,
  removeValidationError: J,
  setServerSyncActions: Gt
} = o.getState(), $t = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const b = Y(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const T = `${f}-${c}-${b}`;
    let p;
    try {
      p = ut(T)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? p
    }, v = Ot.serialize(s);
    window.localStorage.setItem(
      T,
      JSON.stringify(v.json)
    );
  }
}, ut = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Ht = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = bt(), y = Y(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const b = ut(
      `${f}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return K(t, b.state), gt(t), !0;
  }
  return !1;
}, Vt = (t, c, m, f, y, b) => {
  const T = {
    initialState: c,
    updaterState: dt(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  It(t, T.initialState), lt(t, T.updaterState), K(t, T.state);
}, gt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, le = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${c}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, zt = (t, c, m, f) => {
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
function Bt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: b,
  reactiveType: T,
  componentId: p,
  initialState: s,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [L, O] = Q({}), { sessionId: U } = bt();
  let G = !c;
  const [h] = Q(c ?? yt()), l = o.getState().stateLog[h], st = Z(/* @__PURE__ */ new Set()), X = Z(p ?? yt()), M = Z(
    null
  );
  M.current = et(h) ?? null, ot(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      K(h, (r) => ({
        ...r,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), ot(() => {
    if (s) {
      Et(h, {
        initialState: s
      });
      const e = M.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !H(i, s) || !i) && !a)
        return;
      let g = null;
      const I = Y(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      I && U && (g = ut(`${U}-${h}-${I}`));
      let w = s, A = !1;
      const C = a ? Date.now() : 0, P = g?.lastUpdated || 0, j = g?.lastSyncedWithServer || 0;
      a && C > P ? (w = e.serverState.data, A = !0) : g && P > j && (w = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, s), Vt(
        h,
        s,
        w,
        nt,
        X.current,
        U
      ), A && I && U && $t(w, h, e, U, Date.now()), gt(h), (Array.isArray(T) ? T : [T || "component"]).includes("none") || O({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...n || []
  ]), ct(() => {
    G && Et(h, {
      serverSync: m,
      formElements: y,
      initialState: s,
      localStorage: f,
      middleware: M.current?.middleware
    });
    const e = `${h}////${X.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: T ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), O({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const nt = (e, r, a, i) => {
    if (Array.isArray(r)) {
      const g = `${h}-${r.join(".")}`;
      st.current.add(g);
    }
    const u = o.getState();
    K(h, (g) => {
      const I = Y(e) ? e(g) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let x = !1, N = u.signalDomElements.get(w);
        if ((!N || N.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const R = r.slice(0, -1), D = z(I, R);
          if (Array.isArray(D)) {
            x = !0;
            const $ = `${h}-${R.join(".")}`;
            N = u.signalDomElements.get($);
          }
        }
        if (N) {
          const R = x ? z(I, r.slice(0, -1)) : z(I, r);
          N.forEach(({ parentId: D, position: $, effect: E }) => {
            const k = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (k) {
              const _ = Array.from(k.childNodes);
              if (_[$]) {
                const V = E ? new Function("state", `return (${E})(state)`)(R) : R;
                _[$].textContent = String(V);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), a.updateType === "update" && (i || M.current?.validation?.key) && r && J(
        (i || M.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      a.updateType === "cut" && M.current?.validation?.key && J(
        M.current?.validation?.key + "." + A.join(".")
      ), a.updateType === "insert" && M.current?.validation?.key && Dt(
        M.current?.validation?.key + "." + A.join(".")
      ).filter(([N, R]) => {
        let D = N?.split(".").length;
        if (N == A.join(".") && D == A.length - 1) {
          let $ = N + "." + A;
          J(N), Lt($, R);
        }
      });
      const C = u.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const x = vt(g, I), N = new Set(x), R = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of C.components.entries()) {
          let E = !1;
          const k = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !k.includes("none")) {
            if (k.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (k.includes("component") && (($.paths.has(R) || $.paths.has("")) && (E = !0), !E))
              for (const _ of N) {
                let V = _;
                for (; ; ) {
                  if ($.paths.has(V)) {
                    E = !0;
                    break;
                  }
                  const W = V.lastIndexOf(".");
                  if (W !== -1) {
                    const q = V.substring(
                      0,
                      W
                    );
                    if (!isNaN(
                      Number(V.substring(W + 1))
                    ) && $.paths.has(q)) {
                      E = !0;
                      break;
                    }
                    V = q;
                  } else
                    V = "";
                  if (V === "")
                    break;
                }
                if (E) break;
              }
            if (!E && k.includes("deps") && $.depsFunction) {
              const _ = $.depsFunction(I);
              let V = !1;
              typeof _ == "boolean" ? _ && (V = !0) : H($.deps, _) || ($.deps = _, V = !0), V && (E = !0);
            }
            E && $.forceUpdate();
          }
        }
      }
      const P = Date.now();
      r = r.map((x, N) => {
        const R = r.slice(0, -1), D = z(I, R);
        return N === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (D.length - 1).toString() : x;
      });
      const { oldValue: j, newValue: F } = zt(
        a.updateType,
        g,
        I,
        r
      ), B = {
        timeStamp: P,
        stateKey: h,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: j,
        newValue: F
      };
      switch (a.updateType) {
        case "update":
          u.updateShadowAtPath(h, r, I);
          break;
        case "insert":
          const x = r.slice(0, -1);
          u.insertShadowArrayElement(h, x, F);
          break;
        case "cut":
          const N = r.slice(0, -1), R = parseInt(r[r.length - 1]);
          u.removeShadowArrayElement(h, N, R);
          break;
      }
      if (Wt(h, (x) => {
        const R = [...x ?? [], B].reduce((D, $) => {
          const E = `${$.stateKey}:${JSON.stringify($.path)}`, k = D.get(E);
          return k ? (k.timeStamp = Math.max(k.timeStamp, $.timeStamp), k.newValue = $.newValue, k.oldValue = k.oldValue ?? $.oldValue, k.updateType = $.updateType) : D.set(E, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), $t(
        I,
        h,
        M.current,
        U
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: B
      }), M.current?.serverSync) {
        const x = u.serverState[h], N = M.current?.serverSync;
        Gt(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: I }),
          rollBackState: x,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return I;
    });
  };
  o.getState().updaterState[h] || (lt(
    h,
    dt(
      h,
      nt,
      X.current,
      U
    )
  ), o.getState().cogsStateStore[h] || K(h, t), o.getState().initialStateGlobal[h] || It(h, t));
  const d = ht(() => dt(
    h,
    nt,
    X.current,
    U
  ), [h, U]);
  return [Nt(h), d];
}
function dt(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const T = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    b++;
  }, p = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const L = s(S, []), O = et(t), U = Y(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, G = `${f}-${t}-${U}`;
      G && localStorage.removeItem(G), lt(t, L), K(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = dt(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], L = et(t), O = Y(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, U = `${f}-${t}-${O}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Pt(() => {
        It(t, v), o.getState().initializeShadowState(t, v), lt(t, n), K(t, v);
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
      return !!(v && H(v, Nt(t)));
    }
  };
  function s(v, n = [], S) {
    const L = n.map(String).join(".");
    y.get(L);
    const O = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(p).forEach((h) => {
      O[h] = p[h];
    });
    const U = {
      apply(h, l, st) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const st = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !st.has(l)) {
          const d = `${t}////${m}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const a = n.join(".");
              let i = !0;
              for (const u of r.paths)
                if (a.startsWith(u) && (a === u || a[u.length] === ".")) {
                  i = !1;
                  break;
                }
              i && r.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => vt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const i = await e.action(r);
              if (i && !i.success && i.errors && a) {
                o.getState().removeValidationError(a), i.errors.forEach((g) => {
                  const I = [a, ...g.path].join(".");
                  o.getState().addValidationError(I, g.message);
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
            const d = o.getState().initialStateGlobal[t], e = et(t), r = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${f}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => S?.validIndices ? v.map((r, a) => ({
            item: r,
            originalIndex: S.validIndices[a]
          })) : o.getState().getNestedState(t, n).map((r, a) => ({
            item: r,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return s(
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
                overscan: a = 5,
                stickToBottom: i = !1
              } = e, u = Z(null), g = o().getNestedState(
                t,
                n
              ), I = g.length, [w, A] = Q({
                startIndex: 0,
                endIndex: 10
              }), C = Z(i), [P, j] = Q(0), F = Z(!1);
              ot(() => o.getState().subscribeToShadowState(t, () => {
                j((k) => k + 1);
              }), [t]);
              const { totalHeight: B, positions: x } = ht(() => {
                const E = o.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const _ = [];
                for (let V = 0; V < I; V++) {
                  _[V] = k;
                  const W = E[V]?.virtualizer?.itemHeight;
                  k += W || r;
                }
                return { totalHeight: k, positions: _ };
              }, [
                I,
                t,
                n.join("."),
                r,
                P
              ]), N = ht(() => {
                const E = Math.max(0, w.startIndex), k = Math.min(I, w.endIndex), _ = Array.from(
                  { length: k - E },
                  (W, q) => E + q
                ), V = _.map((W) => g[W]);
                return s(V, n, {
                  ...S,
                  validIndices: _
                });
              }, [w.startIndex, w.endIndex, g, I]);
              ct(() => {
                const E = u.current;
                if (!E) return;
                const k = () => {
                  if (!E) return;
                  const { scrollTop: V } = E;
                  let W = 0, q = I - 1;
                  for (; W <= q; ) {
                    const ft = Math.floor((W + q) / 2);
                    x[ft] < V ? W = ft + 1 : q = ft - 1;
                  }
                  const pt = Math.max(0, q - a);
                  let tt = pt;
                  const xt = V + E.clientHeight;
                  for (; tt < I && x[tt] < xt; )
                    tt++;
                  tt = Math.min(I, tt + a), A({ startIndex: pt, endIndex: tt });
                }, _ = () => {
                  C.current = E.scrollHeight - E.scrollTop - E.clientHeight < 1, k();
                };
                if (E.addEventListener("scroll", _, {
                  passive: !0
                }), i && !F.current && I > 0 && E.clientHeight > 0) {
                  F.current = !0;
                  const V = Math.ceil(
                    E.clientHeight / r
                  ), W = Math.max(
                    0,
                    I - V - a
                  );
                  A({
                    startIndex: W,
                    endIndex: I
                  }), E.scrollTop = E.scrollHeight;
                }
                return k(), () => {
                  E.removeEventListener("scroll", _);
                };
              }, [I, x, i, r, a]);
              const R = wt(
                (E = "smooth") => {
                  u.current && (C.current = !0, u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: E
                  }));
                },
                []
              ), D = wt(
                (E, k = "smooth") => {
                  u.current && x[E] !== void 0 && (C.current = !1, u.current.scrollTo({
                    top: x[E],
                    behavior: k
                  }));
                },
                [x]
              ), $ = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${B}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${x[w.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: N,
                virtualizerProps: $,
                scrollToBottom: R,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (g, I) => e(g.item, I.item)
              ), i = a.map(({ item: g }) => g), u = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: g }) => g
                )
              };
              return s(i, n, u);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: g }, I) => e(g, I)
              ), i = a.map(({ item: g }) => g), u = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: g }) => g
                )
              };
              return s(i, n, u);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, u) => u)).map((i, u) => {
                const g = r[i], I = [...n, i.toString()], w = s(g, I, S);
                return e(g, w, {
                  register: () => {
                    const [, C] = Q({}), P = `${m}-${n.join(".")}-${i}`;
                    ct(() => {
                      const j = `${t}////${P}`, F = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(j, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([I.join(".")])
                      }), o.getState().stateComponents.set(t, F), () => {
                        const B = o.getState().stateComponents.get(t);
                        B && B.components.delete(j);
                      };
                    }, [t, P]);
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
            return (e) => v.map((a, i) => {
              let u;
              S?.validIndices && S.validIndices[i] !== void 0 ? u = S.validIndices[i] : u = i;
              const g = [...n, u.toString()], I = s(a, g, S);
              return e(
                a,
                I,
                i,
                v,
                s(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => at(qt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, u) => u)).map((i, u) => {
                const g = r[i], I = [...n, i.toString()], w = s(g, I, S), A = `${m}-${n.join(".")}-${i}`;
                return at(Yt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: I,
                  children: e(
                    g,
                    w,
                    u,
                    r,
                    s(r, n, S)
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
              const a = r.flatMap(
                (i) => i[e] ?? []
              );
              return s(
                a,
                [...n, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const r = v[e];
              return s(r, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, a = e[r], i = [...n, r.toString()];
              return s(a, i);
            };
          if (l === "insert")
            return (e) => (T(n), St(c, e, n, t), s(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, a) => {
              const i = o.getState().getNestedState(t, n), u = Y(e) ? e(i) : e;
              let g = null;
              if (!i.some((w) => {
                if (r) {
                  const C = r.every(
                    (P) => H(w[P], u[P])
                  );
                  return C && (g = w), C;
                }
                const A = H(w, u);
                return A && (g = w), A;
              }))
                T(n), St(c, u, n, t);
              else if (a && g) {
                const w = a(g), A = i.map(
                  (C) => H(C, g) ? w : C
                );
                T(n), rt(c, A, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return T(n), it(c, n, t, e), s(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && it(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((a) => a === e);
              r > -1 ? it(c, n, t, r) : St(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: u }, g) => e(u, g)
              );
              if (!a) return;
              const i = [...n, a.originalIndex.toString()];
              return s(a.item, i, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = d().find(
                ({ item: g }) => g[e] === r
              );
              if (!i) return;
              const u = [...n, i.originalIndex.toString()];
              return s(i.item, u, S);
            };
        }
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => it(
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
          return (d) => ut(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, r) : o.getState().setSelectedIndex(t, a, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            rt(c, i, e), T(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), r = d.join("."), a = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              a === e ? void 0 : e
            );
            const i = o.getState().getNestedState(t, [...d]);
            rt(c, i, d), T(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Ut(e, d).newDocument;
              Vt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const u = vt(e, a), g = new Set(u);
                for (const [
                  I,
                  w
                ] of i.components.entries()) {
                  let A = !1;
                  const C = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (w.paths.has("") && (A = !0), !A))
                      for (const P of g) {
                        if (w.paths.has(P)) {
                          A = !0;
                          break;
                        }
                        let j = P.lastIndexOf(".");
                        for (; j !== -1; ) {
                          const F = P.substring(0, j);
                          if (w.paths.has(F)) {
                            A = !0;
                            break;
                          }
                          const B = P.substring(
                            j + 1
                          );
                          if (!isNaN(Number(B))) {
                            const x = F.lastIndexOf(".");
                            if (x !== -1) {
                              const N = F.substring(
                                0,
                                x
                              );
                              if (w.paths.has(N)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          j = F.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && C.includes("deps") && w.depsFunction) {
                      const P = w.depsFunction(a);
                      let j = !1;
                      typeof P == "boolean" ? P && (j = !0) : H(w.deps, P) || (w.deps = P, j = !0), j && (A = !0);
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
              J(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([u]) => {
                  u && u.startsWith(d.key) && J(u);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((g) => {
                  const I = g.path, w = g.message, A = [d.key, ...I].join(".");
                  e(A, w);
                }), gt(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
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
          }) => /* @__PURE__ */ mt(
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
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Mt(() => {
                rt(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              rt(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            T(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ mt(
            Rt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], nt = o.getState().getNestedState(t, M);
        return s(nt, M, S);
      }
    }, G = new Proxy(O, U);
    return y.set(L, {
      proxy: G,
      stateVersion: b
    }), G;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function kt(t) {
  return at(Jt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (y, b, T, p, s) => t._mapFn(y, b, T, p, s)
  ) : null;
}
function Jt({
  proxy: t
}) {
  const c = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return ot(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, T = Array.from(y.childNodes).indexOf(f);
    let p = y.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", p));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: T,
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
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const L = document.createTextNode(String(S));
    f.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), at("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function de(t) {
  const c = Ct(
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
  return at("text", {}, String(c));
}
function Yt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = Q({}), [b, T] = Ft(), p = Z(null);
  return ot(() => {
    T.height > 0 && T.height !== p.current && (p.current = T.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: T.height
      }
    }));
  }, [T.height, t, m]), ct(() => {
    const s = `${t}////${c}`, v = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(s, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, v), () => {
      const n = o.getState().stateComponents.get(t);
      n && n.components.delete(s);
    };
  }, [t, c, m.join(".")]), /* @__PURE__ */ mt("div", { ref: b, children: f });
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
