"use client";
import { jsx as ht } from "react/jsx-runtime";
import { useState as Q, useRef as Z, useEffect as K, useLayoutEffect as lt, useMemo as vt, createElement as at, useSyncExternalStore as Pt, startTransition as _t, useCallback as Tt } from "react";
import { transformStateFunc as Mt, isDeepEqual as z, isFunction as Y, getNestedValue as B, getDifferences as yt, debounce as jt } from "./utility.js";
import { pushFunc as mt, updateFn as ot, cutFunc as ct, ValidationWrapper as Rt, FormControlComponent as Ot } from "./Functions.jsx";
import Ut from "superjson";
import { v4 as It } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Et } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import { applyPatch as Ft } from "fast-json-patch";
import Dt from "react-use-measure";
function At(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function $t({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = nt(t) || {}, y = m[t] || {}, b = o.getState().setInitialStateOptions, T = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      T.hasOwnProperty(a) ? (a == "localStorage" && c[a] && T[a].key !== c[a]?.key && (I = !0, T[a] = c[a]), a == "initialState" && c[a] && T[a] !== c[a] && // Different references
      !z(T[a], c[a]) && (I = !0, T[a] = c[a])) : (I = !0, T[a] = c[a]);
  I && b(t, T);
}
function ce(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const le = (t, c) => {
  let m = t;
  const [f, y] = Mt(m);
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
    const [v] = Q(a?.componentId ?? It());
    $t({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [W, U] = qt(
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
    return U;
  };
  function T(I, a) {
    $t({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && zt(I, a), ft(I);
  }
  return { useCogsState: b, setCogsOptions: T };
}, {
  setUpdaterState: dt,
  setState: tt,
  getInitialOptions: nt,
  getKeyState: Vt,
  getValidationErrors: Wt,
  setStateLog: Lt,
  updateInitialStateGlobal: pt,
  addValidationError: Gt,
  removeValidationError: J,
  setServerSyncActions: Ht
} = o.getState(), kt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const b = Y(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const T = `${f}-${c}-${b}`;
    let I;
    try {
      I = gt(T)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Ut.serialize(a);
    window.localStorage.setItem(
      T,
      JSON.stringify(v.json)
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
}, zt = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = Nt(), y = Y(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const b = gt(
      `${f}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return tt(t, b.state), ft(t), !0;
  }
  return !1;
}, Ct = (t, c, m, f, y, b) => {
  const T = {
    initialState: c,
    updaterState: ut(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  pt(t, T.initialState), dt(t, T.updaterState), tt(t, T.state);
}, ft = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, de = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${c}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Bt = (t, c, m, f) => {
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
function qt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: b,
  reactiveType: T,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [W, U] = Q({}), { sessionId: F } = Nt();
  let L = !c;
  const [h] = Q(c ?? It()), l = o.getState().stateLog[h], st = Z(/* @__PURE__ */ new Set()), X = Z(I ?? It()), R = Z(
    null
  );
  R.current = nt(h) ?? null, K(() => {
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
  }, [v]), K(() => {
    if (a) {
      At(h, {
        initialState: a
      });
      const e = R.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !z(i, a) || !i) && !s)
        return;
      let u = null;
      const E = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && F && (u = gt(`${F}-${h}-${E}`));
      let w = a, A = !1;
      const _ = s ? Date.now() : 0, x = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      s && _ > x ? (w = e.serverState.data, A = !0) : u && x > M && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), Ct(
        h,
        a,
        w,
        rt,
        X.current,
        F
      ), A && E && F && kt(w, h, e, F, Date.now()), ft(h), (Array.isArray(T) ? T : [T || "component"]).includes("none") || U({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), lt(() => {
    L && At(h, {
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
      reactiveType: T ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), U({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const rt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      st.current.add(u);
    }
    const g = o.getState();
    tt(h, (u) => {
      const E = Y(e) ? e(u) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let C = !1, N = g.signalDomElements.get(w);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), D = B(E, O);
          if (Array.isArray(D)) {
            C = !0;
            const $ = `${h}-${O.join(".")}`;
            N = g.signalDomElements.get($);
          }
        }
        if (N) {
          const O = C ? B(E, r.slice(0, -1)) : B(E, r);
          N.forEach(({ parentId: D, position: $, effect: p }) => {
            const k = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (k) {
              const j = Array.from(k.childNodes);
              if (j[$]) {
                const V = p ? new Function("state", `return (${p})(state)`)(O) : O;
                j[$].textContent = String(V);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || R.current?.validation?.key) && r && J(
        (i || R.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      s.updateType === "cut" && R.current?.validation?.key && J(
        R.current?.validation?.key + "." + A.join(".")
      ), s.updateType === "insert" && R.current?.validation?.key && Wt(
        R.current?.validation?.key + "." + A.join(".")
      ).filter(([N, O]) => {
        let D = N?.split(".").length;
        if (N == A.join(".") && D == A.length - 1) {
          let $ = N + "." + A;
          J(N), Gt($, O);
        }
      });
      const _ = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const C = yt(u, E), N = new Set(C), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of _.components.entries()) {
          let p = !1;
          const k = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !k.includes("none")) {
            if (k.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (k.includes("component") && (($.paths.has(O) || $.paths.has("")) && (p = !0), !p))
              for (const j of N) {
                let V = j;
                for (; ; ) {
                  if ($.paths.has(V)) {
                    p = !0;
                    break;
                  }
                  const H = V.lastIndexOf(".");
                  if (H !== -1) {
                    const q = V.substring(
                      0,
                      H
                    );
                    if (!isNaN(
                      Number(V.substring(H + 1))
                    ) && $.paths.has(q)) {
                      p = !0;
                      break;
                    }
                    V = q;
                  } else
                    V = "";
                  if (V === "")
                    break;
                }
                if (p) break;
              }
            if (!p && k.includes("deps") && $.depsFunction) {
              const j = $.depsFunction(E);
              let V = !1;
              typeof j == "boolean" ? j && (V = !0) : z($.deps, j) || ($.deps = j, V = !0), V && (p = !0);
            }
            p && $.forceUpdate();
          }
        }
      }
      const x = Date.now();
      r = r.map((C, N) => {
        const O = r.slice(0, -1), D = B(E, O);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : C;
      });
      const { oldValue: M, newValue: P } = Bt(
        s.updateType,
        u,
        E,
        r
      ), G = {
        timeStamp: x,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: P
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, r, E);
          break;
        case "insert":
          const C = r.slice(0, -1);
          g.insertShadowArrayElement(h, C, P);
          break;
        case "cut":
          const N = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, N, O);
          break;
      }
      if (Lt(h, (C) => {
        const O = [...C ?? [], G].reduce((D, $) => {
          const p = `${$.stateKey}:${JSON.stringify($.path)}`, k = D.get(p);
          return k ? (k.timeStamp = Math.max(k.timeStamp, $.timeStamp), k.newValue = $.newValue, k.oldValue = k.oldValue ?? $.oldValue, k.updateType = $.updateType) : D.set(p, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), kt(
        E,
        h,
        R.current,
        F
      ), R.current?.middleware && R.current.middleware({
        updateLog: l,
        update: G
      }), R.current?.serverSync) {
        const C = g.serverState[h], N = R.current?.serverSync;
        Ht(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: C,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[h] || (dt(
    h,
    ut(
      h,
      rt,
      X.current,
      F
    )
  ), o.getState().cogsStateStore[h] || tt(h, t), o.getState().initialStateGlobal[h] || pt(h, t));
  const d = vt(() => ut(
    h,
    rt,
    X.current,
    F
  ), [h, F]);
  return [Vt(h), d];
}
function ut(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const T = (v) => {
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
      const W = a(S, []), U = nt(t), F = Y(U?.localStorage?.key) ? U?.localStorage?.key(S) : U?.localStorage?.key, L = `${f}-${t}-${F}`;
      L && localStorage.removeItem(L), dt(t, W), tt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = ut(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], W = nt(t), U = Y(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, F = `${f}-${t}-${U}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), _t(() => {
        pt(t, v), o.getState().initializeShadowState(t, v), dt(t, n), tt(t, v);
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
    const W = n.map(String).join(".");
    y.get(W);
    const U = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      U[h] = I[h];
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
          return () => yt(
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
                  const E = [s, ...u.path].join(".");
                  o.getState().addValidationError(E, u.message);
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
                overscan: s = 6,
                // Keeping your working overscan value
                stickToBottom: i = !1
              } = e, g = Z(null), [u, E] = Q({
                startIndex: 0,
                endIndex: 10
              }), w = Z(i), A = Z(0), [_, x] = Q(0);
              K(() => o.getState().subscribeToShadowState(t, () => {
                x((k) => k + 1);
              }), [t]);
              const M = o().getNestedState(
                t,
                n
              ), P = M.length, { totalHeight: G, positions: C } = vt(() => {
                const p = o.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const j = [];
                for (let V = 0; V < P; V++) {
                  j[V] = k;
                  const H = p[V]?.virtualizer?.itemHeight;
                  k += H || r;
                }
                return { totalHeight: k, positions: j };
              }, [
                P,
                t,
                n.join("."),
                r,
                _
              ]), N = vt(() => {
                const p = Math.max(0, u.startIndex), k = Math.min(P, u.endIndex), j = Array.from(
                  { length: k - p },
                  (H, q) => p + q
                ), V = j.map((H) => M[H]);
                return a(V, n, {
                  ...S,
                  validIndices: j
                });
              }, [u.startIndex, u.endIndex, M, P]);
              lt(() => {
                const p = g.current;
                if (!p) return;
                const k = P > A.current, j = () => {
                  if (!p) return;
                  const { scrollTop: V, clientHeight: H } = p;
                  let q = 0, it = P - 1;
                  for (; q <= it; ) {
                    const St = Math.floor((q + it) / 2);
                    C[St] < V ? q = St + 1 : it = St - 1;
                  }
                  const wt = Math.max(0, it - s);
                  let et = wt;
                  const xt = V + H;
                  for (; et < P && C[et] < xt; )
                    et++;
                  et = Math.min(P, et + s), E({ startIndex: wt, endIndex: et });
                };
                if (i && k && w.current) {
                  const V = setTimeout(() => {
                    p && p.scrollTo({
                      top: p.scrollHeight,
                      behavior: "smooth"
                    });
                  }, 50);
                  return () => clearTimeout(V);
                }
                j();
              }, [
                P,
                C,
                G,
                i,
                r
              ]), K(() => {
                const p = g.current;
                if (!p) return;
                w.current && (p.scrollTop = p.scrollHeight);
                const k = () => {
                  if (!p) return;
                  p.scrollHeight - p.scrollTop - p.clientHeight < 1 || (w.current = !1);
                };
                return p.addEventListener("scroll", k, {
                  passive: !0
                }), () => p.removeEventListener("scroll", k);
              }, []), K(() => {
                A.current = P;
              });
              const O = Tt(
                (p = "smooth") => {
                  g.current && (w.current = !0, g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: p
                  }));
                },
                []
              ), D = Tt(
                (p, k = "smooth") => {
                  g.current && C[p] !== void 0 && (w.current = !1, g.current.scrollTo({
                    top: C[p],
                    behavior: k
                  }));
                },
                [C]
              ), $ = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${G}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${C[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: N,
                virtualizerProps: $,
                scrollToBottom: O,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, E) => e(u.item, E.item)
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
                ({ item: u }, E) => e(u, E)
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
                const u = r[i], E = [...n, i.toString()], w = a(u, E, S);
                return e(u, w, {
                  register: () => {
                    const [, _] = Q({}), x = `${m}-${n.join(".")}-${i}`;
                    lt(() => {
                      const M = `${t}////${x}`, P = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return P.components.set(M, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, P), () => {
                        const G = o.getState().stateComponents.get(t);
                        G && G.components.delete(M);
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
              const u = [...n, g.toString()], E = a(s, u, S);
              return e(
                s,
                E,
                i,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => at(Jt, {
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
                const u = r[i], E = [...n, i.toString()], w = a(u, E, S), A = `${m}-${n.join(".")}-${i}`;
                return at(Zt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: E,
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
            return (e) => (T(n), mt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = Y(e) ? e(i) : e;
              let u = null;
              if (!i.some((w) => {
                if (r) {
                  const _ = r.every(
                    (x) => z(w[x], g[x])
                  );
                  return _ && (u = w), _;
                }
                const A = z(w, g);
                return A && (u = w), A;
              }))
                T(n), mt(c, g, n, t);
              else if (s && u) {
                const w = s(u), A = i.map(
                  (_) => z(_, u) ? w : _
                );
                T(n), ot(c, A, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return T(n), ct(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && ct(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? ct(c, n, t, r) : mt(c, e, n, t);
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
            return () => ct(
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
          return (d) => gt(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            ot(c, i, e), T(e);
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
            ot(c, i, d), T(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Ft(e, d).newDocument;
              Ct(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = yt(e, s), u = new Set(g);
                for (const [
                  E,
                  w
                ] of i.components.entries()) {
                  let A = !1;
                  const _ = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (w.paths.has("") && (A = !0), !A))
                      for (const x of u) {
                        if (w.paths.has(x)) {
                          A = !0;
                          break;
                        }
                        let M = x.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const P = x.substring(0, M);
                          if (w.paths.has(P)) {
                            A = !0;
                            break;
                          }
                          const G = x.substring(
                            M + 1
                          );
                          if (!isNaN(Number(G))) {
                            const C = P.lastIndexOf(".");
                            if (C !== -1) {
                              const N = P.substring(
                                0,
                                C
                              );
                              if (w.paths.has(N)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          M = P.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && _.includes("deps") && w.depsFunction) {
                      const x = w.depsFunction(s);
                      let M = !1;
                      typeof x == "boolean" ? x && (M = !0) : z(w.deps, x) || (w.deps = x, M = !0), M && (A = !0);
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
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && J(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const E = u.path, w = u.message, A = [d.key, ...E].join(".");
                  e(A, w);
                }), ft(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
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
          }) => /* @__PURE__ */ ht(
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
              jt(() => {
                ot(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              ot(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            T(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ ht(
            Ot,
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
    }, L = new Proxy(U, F);
    return y.set(W, {
      proxy: L,
      stateVersion: b
    }), L;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function bt(t) {
  return at(Yt, { proxy: t });
}
function Jt({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (y, b, T, I, a) => t._mapFn(y, b, T, I, a)
  ) : null;
}
function Yt({
  proxy: t
}) {
  const c = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, T = Array.from(y.childNodes).indexOf(f);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
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
function ue(t) {
  const c = Pt(
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
function Zt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = Q({}), [b, T] = Dt(), I = Z(null);
  return K(() => {
    T.height > 0 && T.height !== I.current && (I.current = T.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: T.height
      }
    }));
  }, [T.height, t, m]), lt(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ ht("div", { ref: b, children: f });
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
