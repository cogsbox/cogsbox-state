"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as Q, useRef as Z, useEffect as nt, useLayoutEffect as ct, useMemo as ht, createElement as at, useSyncExternalStore as xt, startTransition as Pt, useCallback as wt } from "react";
import { transformStateFunc as _t, isDeepEqual as B, isFunction as Y, getNestedValue as q, getDifferences as vt, debounce as Mt } from "./utility.js";
import { pushFunc as St, updateFn as ot, cutFunc as it, ValidationWrapper as jt, FormControlComponent as Rt } from "./Functions.jsx";
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
  const f = et(t) || {}, y = m[t] || {}, b = o.getState().setInitialStateOptions, w = { ...y, ...f };
  let p = !1;
  if (c)
    for (const a in c)
      w.hasOwnProperty(a) ? (a == "localStorage" && c[a] && w[a].key !== c[a]?.key && (p = !0, w[a] = c[a]), a == "initialState" && c[a] && w[a] !== c[a] && // Different references
      !B(w[a], c[a]) && (p = !0, w[a] = c[a])) : (p = !0, w[a] = c[a]);
  p && b(t, w);
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
  const b = (p, a) => {
    const [v] = Q(a?.componentId ?? yt());
    At({
      stateKey: p,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[p] || f[p], S = a?.modifyState ? a.modifyState(n) : n, [W, U] = Bt(
      S,
      {
        stateKey: p,
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
    return U;
  };
  function w(p, a) {
    At({ stateKey: p, options: a, initialOptionsPart: y }), a.localStorage && Ht(p, a), gt(p);
  }
  return { useCogsState: b, setCogsOptions: w };
}, {
  setUpdaterState: lt,
  setState: K,
  getInitialOptions: et,
  getKeyState: Nt,
  getValidationErrors: Dt,
  setStateLog: Lt,
  updateInitialStateGlobal: It,
  addValidationError: Wt,
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
    const w = `${f}-${c}-${b}`;
    let p;
    try {
      p = ut(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? p
    }, v = Ot.serialize(a);
    window.localStorage.setItem(
      w,
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
  const w = {
    initialState: c,
    updaterState: dt(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  It(t, w.initialState), lt(t, w.updaterState), K(t, w.state);
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
        oldValue: q(c, f),
        newValue: q(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(m, f)
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
function Bt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: b,
  reactiveType: w,
  componentId: p,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [W, U] = Q({}), { sessionId: F } = bt();
  let G = !c;
  const [h] = Q(c ?? yt()), l = o.getState().stateLog[h], st = Z(/* @__PURE__ */ new Set()), X = Z(p ?? yt()), R = Z(
    null
  );
  R.current = et(h) ?? null, nt(() => {
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
  }, [v]), nt(() => {
    if (a) {
      Et(h, {
        initialState: a
      });
      const e = R.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !B(i, a) || !i) && !s)
        return;
      let g = null;
      const E = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && F && (g = ut(`${F}-${h}-${E}`));
      let T = a, A = !1;
      const _ = s ? Date.now() : 0, P = g?.lastUpdated || 0, M = g?.lastSyncedWithServer || 0;
      s && _ > P ? (T = e.serverState.data, A = !0) : g && P > M && (T = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(h, a), Vt(
        h,
        a,
        T,
        rt,
        X.current,
        F
      ), A && E && F && $t(T, h, e, F, Date.now()), gt(h), (Array.isArray(w) ? w : [w || "component"]).includes("none") || U({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ct(() => {
    G && Et(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: R.current?.middleware
    });
    const e = `${h}////${X.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), U({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const rt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const g = `${h}-${r.join(".")}`;
      st.current.add(g);
    }
    const u = o.getState();
    K(h, (g) => {
      const E = Y(e) ? e(g) : e, T = `${h}-${r.join(".")}`;
      if (T) {
        let x = !1, V = u.signalDomElements.get(T);
        if ((!V || V.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), D = q(E, O);
          if (Array.isArray(D)) {
            x = !0;
            const $ = `${h}-${O.join(".")}`;
            V = u.signalDomElements.get($);
          }
        }
        if (V) {
          const O = x ? q(E, r.slice(0, -1)) : q(E, r);
          V.forEach(({ parentId: D, position: $, effect: I }) => {
            const k = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (k) {
              const j = Array.from(k.childNodes);
              if (j[$]) {
                const N = I ? new Function("state", `return (${I})(state)`)(O) : O;
                j[$].textContent = String(N);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), s.updateType === "update" && (i || R.current?.validation?.key) && r && J(
        (i || R.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      s.updateType === "cut" && R.current?.validation?.key && J(
        R.current?.validation?.key + "." + A.join(".")
      ), s.updateType === "insert" && R.current?.validation?.key && Dt(
        R.current?.validation?.key + "." + A.join(".")
      ).filter(([V, O]) => {
        let D = V?.split(".").length;
        if (V == A.join(".") && D == A.length - 1) {
          let $ = V + "." + A;
          J(V), Wt($, O);
        }
      });
      const _ = u.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const x = vt(g, E), V = new Set(x), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of _.components.entries()) {
          let I = !1;
          const k = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !k.includes("none")) {
            if (k.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (k.includes("component") && (($.paths.has(O) || $.paths.has("")) && (I = !0), !I))
              for (const j of V) {
                let N = j;
                for (; ; ) {
                  if ($.paths.has(N)) {
                    I = !0;
                    break;
                  }
                  const L = N.lastIndexOf(".");
                  if (L !== -1) {
                    const H = N.substring(
                      0,
                      L
                    );
                    if (!isNaN(
                      Number(N.substring(L + 1))
                    ) && $.paths.has(H)) {
                      I = !0;
                      break;
                    }
                    N = H;
                  } else
                    N = "";
                  if (N === "")
                    break;
                }
                if (I) break;
              }
            if (!I && k.includes("deps") && $.depsFunction) {
              const j = $.depsFunction(E);
              let N = !1;
              typeof j == "boolean" ? j && (N = !0) : B($.deps, j) || ($.deps = j, N = !0), N && (I = !0);
            }
            I && $.forceUpdate();
          }
        }
      }
      const P = Date.now();
      r = r.map((x, V) => {
        const O = r.slice(0, -1), D = q(E, O);
        return V === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : x;
      });
      const { oldValue: M, newValue: C } = zt(
        s.updateType,
        g,
        E,
        r
      ), z = {
        timeStamp: P,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: C
      };
      switch (s.updateType) {
        case "update":
          u.updateShadowAtPath(h, r, E);
          break;
        case "insert":
          const x = r.slice(0, -1);
          u.insertShadowArrayElement(h, x, C);
          break;
        case "cut":
          const V = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          u.removeShadowArrayElement(h, V, O);
          break;
      }
      if (Lt(h, (x) => {
        const O = [...x ?? [], z].reduce((D, $) => {
          const I = `${$.stateKey}:${JSON.stringify($.path)}`, k = D.get(I);
          return k ? (k.timeStamp = Math.max(k.timeStamp, $.timeStamp), k.newValue = $.newValue, k.oldValue = k.oldValue ?? $.oldValue, k.updateType = $.updateType) : D.set(I, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), $t(
        E,
        h,
        R.current,
        F
      ), R.current?.middleware && R.current.middleware({
        updateLog: l,
        update: z
      }), R.current?.serverSync) {
        const x = u.serverState[h], V = R.current?.serverSync;
        Gt(h, {
          syncKey: typeof V.syncKey == "string" ? V.syncKey : V.syncKey({ state: E }),
          rollBackState: x,
          actionTimeStamp: Date.now() + (V.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[h] || (lt(
    h,
    dt(
      h,
      rt,
      X.current,
      F
    )
  ), o.getState().cogsStateStore[h] || K(h, t), o.getState().initialStateGlobal[h] || It(h, t));
  const d = ht(() => dt(
    h,
    rt,
    X.current,
    F
  ), [h, F]);
  return [Nt(h), d];
}
function dt(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const w = (v) => {
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
      const W = a(S, []), U = et(t), F = Y(U?.localStorage?.key) ? U?.localStorage?.key(S) : U?.localStorage?.key, G = `${f}-${t}-${F}`;
      G && localStorage.removeItem(G), lt(t, W), K(t, S);
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
      ), S = o.getState().initialStateGlobal[t], W = et(t), U = Y(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, F = `${f}-${t}-${U}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Pt(() => {
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
      return !!(v && B(v, Nt(t)));
    }
  };
  function a(v, n = [], S) {
    const W = n.map(String).join(".");
    y.get(W);
    const U = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(p).forEach((h) => {
      U[h] = p[h];
    });
    const F = {
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
          return () => vt(
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
                  const E = [s, ...g.path].join(".");
                  o.getState().addValidationError(E, g.message);
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
            const d = o.getState().initialStateGlobal[t], e = et(t), r = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
              } = e, u = Z(null), [g, E] = Q({
                startIndex: 0,
                endIndex: 10
              }), T = Z(i), A = Z(0), [_, P] = Q(0);
              nt(() => o.getState().subscribeToShadowState(t, () => {
                P((k) => k + 1);
              }), [t]);
              const M = o().getNestedState(
                t,
                n
              ), C = M.length, { totalHeight: z, positions: x } = ht(() => {
                const I = o.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const j = [];
                for (let N = 0; N < C; N++) {
                  j[N] = k;
                  const L = I[N]?.virtualizer?.itemHeight;
                  k += L || r;
                }
                return { totalHeight: k, positions: j };
              }, [
                C,
                t,
                n.join("."),
                r,
                _
              ]), V = ht(() => {
                const I = Math.max(0, g.startIndex), k = Math.min(C, g.endIndex), j = Array.from(
                  { length: k - I },
                  (L, H) => I + H
                ), N = j.map((L) => M[L]);
                return a(N, n, {
                  ...S,
                  validIndices: j
                });
              }, [g.startIndex, g.endIndex, M, C]);
              nt(() => {
                if (i && C > 0 && u.current) {
                  const I = u.current, k = Math.ceil(
                    I.clientHeight / r
                  );
                  E({
                    startIndex: Math.max(
                      0,
                      C - k - s
                    ),
                    endIndex: C
                  }), setTimeout(() => {
                    I.scrollTop = I.scrollHeight;
                  }, 100);
                }
              }, [C]), ct(() => {
                const I = u.current;
                if (!I) return;
                const k = () => {
                  if (!I) return;
                  const { scrollTop: N } = I;
                  let L = 0, H = C - 1;
                  for (; L <= H; ) {
                    const ft = Math.floor((L + H) / 2);
                    x[ft] < N ? L = ft + 1 : H = ft - 1;
                  }
                  const pt = Math.max(0, H - s);
                  let tt = pt;
                  const Ct = N + I.clientHeight;
                  for (; tt < C && x[tt] < Ct; )
                    tt++;
                  tt = Math.min(C, tt + s), E({ startIndex: pt, endIndex: tt });
                }, j = () => {
                  T.current = I.scrollHeight - I.scrollTop - I.clientHeight < 1, k();
                };
                if (I.addEventListener("scroll", j, {
                  passive: !0
                }), i && T.current) {
                  const N = I.scrollHeight;
                  if (N > A.current) {
                    const H = N - I.scrollTop - I.clientHeight > I.clientHeight * 2;
                    I.scrollTo({
                      top: 999999999,
                      behavior: H ? "auto" : "smooth"
                      // Instant for big jumps, smooth for small
                    }), A.current = N;
                  }
                }
                return k(), () => {
                  I.removeEventListener("scroll", j);
                };
              }, [C, x, z, i]);
              const O = wt(
                (I = "smooth") => {
                  u.current && (T.current = !0, u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: I
                  }));
                },
                []
              ), D = wt(
                (I, k = "smooth") => {
                  u.current && x[I] !== void 0 && (T.current = !1, u.current.scrollTo({
                    top: x[I],
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
                    height: `${z}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${x[g.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: V,
                virtualizerProps: $,
                scrollToBottom: O,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (g, E) => e(g.item, E.item)
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
                ({ item: g }, E) => e(g, E)
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
                const g = r[i], E = [...n, i.toString()], T = a(g, E, S);
                return e(g, T, {
                  register: () => {
                    const [, _] = Q({}), P = `${m}-${n.join(".")}-${i}`;
                    ct(() => {
                      const M = `${t}////${P}`, C = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return C.components.set(M, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, C), () => {
                        const z = o.getState().stateComponents.get(t);
                        z && z.components.delete(M);
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
            return (e) => v.map((s, i) => {
              let u;
              S?.validIndices && S.validIndices[i] !== void 0 ? u = S.validIndices[i] : u = i;
              const g = [...n, u.toString()], E = a(s, g, S);
              return e(
                s,
                E,
                i,
                v,
                a(v, n, S)
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
              rebuildStateShape: a
            });
          if (l === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, u) => u)).map((i, u) => {
                const g = r[i], E = [...n, i.toString()], T = a(g, E, S), A = `${m}-${n.join(".")}-${i}`;
                return at(Yt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: E,
                  children: e(
                    g,
                    T,
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
            return (e) => (w(n), St(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), u = Y(e) ? e(i) : e;
              let g = null;
              if (!i.some((T) => {
                if (r) {
                  const _ = r.every(
                    (P) => B(T[P], u[P])
                  );
                  return _ && (g = T), _;
                }
                const A = B(T, u);
                return A && (g = T), A;
              }))
                w(n), St(c, u, n, t);
              else if (s && g) {
                const T = s(g), A = i.map(
                  (_) => B(_, g) ? T : _
                );
                w(n), ot(c, A, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return w(n), it(c, n, t, e), a(
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
              const r = v.findIndex((s) => s === e);
              r > -1 ? it(c, n, t, r) : St(c, e, n, t);
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
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            ot(c, i, e), w(e);
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
            ot(c, i, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Ut(e, d).newDocument;
              Vt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const u = vt(e, s), g = new Set(u);
                for (const [
                  E,
                  T
                ] of i.components.entries()) {
                  let A = !1;
                  const _ = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (T.paths.has("") && (A = !0), !A))
                      for (const P of g) {
                        if (T.paths.has(P)) {
                          A = !0;
                          break;
                        }
                        let M = P.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const C = P.substring(0, M);
                          if (T.paths.has(C)) {
                            A = !0;
                            break;
                          }
                          const z = P.substring(
                            M + 1
                          );
                          if (!isNaN(Number(z))) {
                            const x = C.lastIndexOf(".");
                            if (x !== -1) {
                              const V = C.substring(
                                0,
                                x
                              );
                              if (T.paths.has(V)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          M = C.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && _.includes("deps") && T.depsFunction) {
                      const P = T.depsFunction(s);
                      let M = !1;
                      typeof P == "boolean" ? P && (M = !0) : B(T.deps, P) || (T.deps = P, M = !0), M && (A = !0);
                    }
                    A && T.forceUpdate();
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
                  const E = g.path, T = g.message, A = [d.key, ...E].join(".");
                  e(A, T);
                }), gt(t), !1);
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
                ot(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              ot(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            w(n);
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
        const R = [...n, l], rt = o.getState().getNestedState(t, R);
        return a(rt, R, S);
      }
    }, G = new Proxy(U, F);
    return y.set(W, {
      proxy: G,
      stateVersion: b
    }), G;
  }
  return a(
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
    (y, b, w, p, a) => t._mapFn(y, b, w, p, a)
  ) : null;
}
function Jt({
  proxy: t
}) {
  const c = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, w = Array.from(y.childNodes).indexOf(f);
    let p = y.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", p));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: w,
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
      } catch (U) {
        console.error("Error evaluating effect function during mount:", U), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    f.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), at("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function de(t) {
  const c = xt(
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
  const [, y] = Q({}), [b, w] = Ft(), p = Z(null);
  return nt(() => {
    w.height > 0 && w.height !== p.current && (p.current = w.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, m]), ct(() => {
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
