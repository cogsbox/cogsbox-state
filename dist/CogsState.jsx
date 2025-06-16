"use client";
import { jsx as ht } from "react/jsx-runtime";
import { useState as X, useRef as Q, useEffect as et, useLayoutEffect as lt, useMemo as vt, createElement as ot, useSyncExternalStore as Pt, startTransition as _t, useCallback as Tt } from "react";
import { transformStateFunc as Mt, isDeepEqual as z, isFunction as Y, getNestedValue as B, getDifferences as yt, debounce as jt } from "./utility.js";
import { pushFunc as mt, updateFn as rt, cutFunc as ct, ValidationWrapper as Rt, FormControlComponent as Ot } from "./Functions.jsx";
import Ut from "superjson";
import { v4 as It } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as At } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import { applyPatch as Ft } from "fast-json-patch";
import Dt from "react-use-measure";
function Et(t, c) {
  const m = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = m(t) || {};
  g(t, {
    ...y,
    ...c
  });
}
function $t({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const g = tt(t) || {}, y = m[t] || {}, k = r.getState().setInitialStateOptions, w = { ...y, ...g };
  let I = !1;
  if (c)
    for (const a in c)
      w.hasOwnProperty(a) ? (a == "localStorage" && c[a] && w[a].key !== c[a]?.key && (I = !0, w[a] = c[a]), a == "initialState" && c[a] && w[a] !== c[a] && // Different references
      !z(w[a], c[a]) && (I = !0, w[a] = c[a])) : (I = !0, w[a] = c[a]);
  I && k(t, w);
}
function ce(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const le = (t, c) => {
  let m = t;
  const [g, y] = Mt(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, tt(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const k = (I, a) => {
    const [v] = X(a?.componentId ?? It());
    $t({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = r.getState().cogsStateStore[I] || g[I], f = a?.modifyState ? a.modifyState(n) : n, [W, U] = qt(
      f,
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
  function w(I, a) {
    $t({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && zt(I, a), ft(I);
  }
  return { useCogsState: k, setCogsOptions: w };
}, {
  setUpdaterState: dt,
  setState: K,
  getInitialOptions: tt,
  getKeyState: xt,
  getValidationErrors: Wt,
  setStateLog: Lt,
  updateInitialStateGlobal: pt,
  addValidationError: Gt,
  removeValidationError: J,
  setServerSyncActions: Ht
} = r.getState(), bt = (t, c, m, g, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    g
  );
  const k = Y(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (k && g) {
    const w = `${g}-${c}-${k}`;
    let I;
    try {
      I = gt(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Ut.serialize(a);
    window.localStorage.setItem(
      w,
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
  const m = r.getState().cogsStateStore[t], { sessionId: g } = Nt(), y = Y(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && g) {
    const k = gt(
      `${g}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return K(t, k.state), ft(t), !0;
  }
  return !1;
}, Ct = (t, c, m, g, y, k) => {
  const w = {
    initialState: c,
    updaterState: ut(
      t,
      g,
      y,
      k
    ),
    state: m
  };
  pt(t, w.initialState), dt(t, w.updaterState), K(t, w.state);
}, ft = (t) => {
  const c = r.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, de = (t, c) => {
  const m = r.getState().stateComponents.get(t);
  if (m) {
    const g = `${t}////${c}`, y = m.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Bt = (t, c, m, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(c, g),
        newValue: B(m, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(m, g)
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
function qt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: g,
  formElements: y,
  reactiveDeps: k,
  reactiveType: w,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: f
} = {}) {
  const [W, U] = X({}), { sessionId: F } = Nt();
  let L = !c;
  const [h] = X(c ?? It()), l = r.getState().stateLog[h], at = Q(/* @__PURE__ */ new Set()), Z = Q(I ?? It()), j = Q(
    null
  );
  j.current = tt(h) ?? null, et(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      K(h, (o) => ({
        ...o,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), et(() => {
    if (a) {
      Et(h, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = r.getState().initialStateGlobal[h];
      if (!(i && !z(i, a) || !i) && !s)
        return;
      let d = null;
      const A = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      A && F && (d = gt(`${F}-${h}-${A}`));
      let p = a, b = !1;
      const V = s ? Date.now() : 0, _ = d?.lastUpdated || 0, R = d?.lastSyncedWithServer || 0;
      s && V > _ ? (p = e.serverState.data, b = !0) : d && _ > R && (p = d.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), r.getState().initializeShadowState(h, a), Ct(
        h,
        a,
        p,
        nt,
        Z.current,
        F
      ), b && A && F && bt(p, h, e, F, Date.now()), ft(h), (Array.isArray(w) ? w : [w || "component"]).includes("none") || U({});
    }
  }, [
    a,
    f?.status,
    f?.data,
    ...n || []
  ]), lt(() => {
    L && Et(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: g,
      middleware: j.current?.middleware
    });
    const e = `${h}////${Z.current}`, o = r.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), r.getState().stateComponents.set(h, o), U({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(h));
    };
  }, []);
  const nt = (e, o, s, i) => {
    if (Array.isArray(o)) {
      const d = `${h}-${o.join(".")}`;
      at.current.add(d);
    }
    const S = r.getState();
    K(h, (d) => {
      const A = Y(e) ? e(d) : e, p = `${h}-${o.join(".")}`;
      if (p) {
        let C = !1, N = S.signalDomElements.get(p);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = o.slice(0, -1), D = B(A, O);
          if (Array.isArray(D)) {
            C = !0;
            const $ = `${h}-${O.join(".")}`;
            N = S.signalDomElements.get($);
          }
        }
        if (N) {
          const O = C ? B(A, o.slice(0, -1)) : B(A, o);
          N.forEach(({ parentId: D, position: $, effect: T }) => {
            const E = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (E) {
              const M = Array.from(E.childNodes);
              if (M[$]) {
                const x = T ? new Function("state", `return (${T})(state)`)(O) : O;
                M[$].textContent = String(x);
              }
            }
          });
        }
      }
      console.log("shadowState", S.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && o && J(
        (i || j.current?.validation?.key) + "." + o.join(".")
      );
      const b = o.slice(0, o.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && J(
        j.current?.validation?.key + "." + b.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Wt(
        j.current?.validation?.key + "." + b.join(".")
      ).filter(([N, O]) => {
        let D = N?.split(".").length;
        if (N == b.join(".") && D == b.length - 1) {
          let $ = N + "." + b;
          J(N), Gt($, O);
        }
      });
      const V = S.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", V), V) {
        const C = yt(d, A), N = new Set(C), O = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of V.components.entries()) {
          let T = !1;
          const E = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !E.includes("none")) {
            if (E.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (E.includes("component") && (($.paths.has(O) || $.paths.has("")) && (T = !0), !T))
              for (const M of N) {
                let x = M;
                for (; ; ) {
                  if ($.paths.has(x)) {
                    T = !0;
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
                      T = !0;
                      break;
                    }
                    x = q;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (T) break;
              }
            if (!T && E.includes("deps") && $.depsFunction) {
              const M = $.depsFunction(A);
              let x = !1;
              typeof M == "boolean" ? M && (x = !0) : z($.deps, M) || ($.deps = M, x = !0), x && (T = !0);
            }
            T && $.forceUpdate();
          }
        }
      }
      const _ = Date.now();
      o = o.map((C, N) => {
        const O = o.slice(0, -1), D = B(A, O);
        return N === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : C;
      });
      const { oldValue: R, newValue: P } = Bt(
        s.updateType,
        d,
        A,
        o
      ), H = {
        timeStamp: _,
        stateKey: h,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: R,
        newValue: P
      };
      switch (s.updateType) {
        case "update":
          S.updateShadowAtPath(h, o, A);
          break;
        case "insert":
          const C = o.slice(0, -1);
          S.insertShadowArrayElement(h, C, P);
          break;
        case "cut":
          const N = o.slice(0, -1), O = parseInt(o[o.length - 1]);
          S.removeShadowArrayElement(h, N, O);
          break;
      }
      if (Lt(h, (C) => {
        const O = [...C ?? [], H].reduce((D, $) => {
          const T = `${$.stateKey}:${JSON.stringify($.path)}`, E = D.get(T);
          return E ? (E.timeStamp = Math.max(E.timeStamp, $.timeStamp), E.newValue = $.newValue, E.oldValue = E.oldValue ?? $.oldValue, E.updateType = $.updateType) : D.set(T, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), bt(
        A,
        h,
        j.current,
        F
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: H
      }), j.current?.serverSync) {
        const C = S.serverState[h], N = j.current?.serverSync;
        Ht(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: A }),
          rollBackState: C,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
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
      Z.current,
      F
    )
  ), r.getState().cogsStateStore[h] || K(h, t), r.getState().initialStateGlobal[h] || pt(h, t));
  const u = vt(() => ut(
    h,
    nt,
    Z.current,
    F
  ), [h, F]);
  return [xt(h), u];
}
function ut(t, c, m, g) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const w = (v) => {
    const n = v.join(".");
    for (const [f] of y)
      (f === n || f.startsWith(n + ".")) && y.delete(f);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const f = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const W = a(f, []), U = tt(t), F = Y(U?.localStorage?.key) ? U?.localStorage?.key(f) : U?.localStorage?.key, L = `${g}-${t}-${F}`;
      L && localStorage.removeItem(L), dt(t, W), K(t, f);
      const h = r.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const n = ut(
        t,
        c,
        m,
        g
      ), f = r.getState().initialStateGlobal[t], W = tt(t), U = Y(W?.localStorage?.key) ? W?.localStorage?.key(f) : W?.localStorage?.key, F = `${g}-${t}-${U}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), _t(() => {
        pt(t, v), r.getState().initializeShadowState(t, v), dt(t, n), K(t, v);
        const L = r.getState().stateComponents.get(t);
        L && L.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (L) => n.get()[L]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = r.getState().serverState[t];
      return !!(v && z(v, xt(t)));
    }
  };
  function a(v, n = [], f) {
    const W = n.map(String).join(".");
    y.get(W);
    const U = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      U[h] = I[h];
    });
    const F = {
      apply(h, l, at) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(h, l) {
        f?.validIndices && !Array.isArray(v) && (f = { ...f, validIndices: void 0 });
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
          const u = `${t}////${m}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const o = e.components.get(u);
            if (o && !o.paths.has("")) {
              const s = n.join(".");
              let i = !0;
              for (const S of o.paths)
                if (s.startsWith(S) && (s === S || s[S.length] === ".")) {
                  i = !1;
                  break;
                }
              i && o.paths.add(s);
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
            const u = r.getState().getInitialOptions(t), e = u?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(t, []), s = u?.validation?.key;
            try {
              const i = await e.action(o);
              if (i && !i.success && i.errors && s) {
                r.getState().removeValidationError(s), i.errors.forEach((d) => {
                  const A = [s, ...d.path].join(".");
                  r.getState().addValidationError(A, d.message);
                });
                const S = r.getState().stateComponents.get(t);
                S && S.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const u = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = B(e, n);
          return z(u, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = B(e, n);
            return z(u, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = r.getState().initialStateGlobal[t], e = tt(t), o = Y(e?.localStorage?.key) ? e?.localStorage?.key(u) : e?.localStorage?.key, s = `${g}-${t}-${o}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const u = r.getState().getInitialOptions(t)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(u.key + "." + n.join("."));
          };
        if (Array.isArray(v)) {
          const u = () => f?.validIndices ? v.map((o, s) => ({
            item: o,
            originalIndex: f.validIndices[s]
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
                  f
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
                stickToBottom: i = !1
              } = e, S = r().getNestedState(
                t,
                n
              ), d = Q(null), A = () => {
                const T = r.getState().getNestedState(t, n);
                return i ? {
                  startIndex: Math.max(
                    0,
                    T.length - 10 - s
                  ),
                  endIndex: T.length
                } : { startIndex: 0, endIndex: 10 };
              }, [p, b] = X(A), V = Q(i), [_, R] = X(0);
              et(() => r.getState().subscribeToShadowState(t, () => {
                R((E) => E + 1);
              }), [t]);
              const P = S.length, { totalHeight: H, positions: C } = vt(() => {
                const T = r.getState().getShadowMetadata(t, n) || [];
                let E = 0;
                const M = [];
                for (let x = 0; x < P; x++) {
                  M[x] = E;
                  const G = T[x]?.virtualizer?.itemHeight;
                  E += G || o;
                }
                return { totalHeight: E, positions: M };
              }, [
                P,
                t,
                n.join("."),
                o,
                _
              ]), N = vt(() => {
                const T = Math.max(0, p.startIndex), E = Math.min(P, p.endIndex), M = Array.from(
                  { length: E - T },
                  (G, q) => T + q
                ), x = M.map((G) => S[G]);
                return a(x, n, {
                  ...f,
                  validIndices: M
                });
              }, [p.startIndex, p.endIndex, S, P]);
              lt(() => {
                const T = d.current;
                if (!T || !i || !V.current)
                  return;
                const E = P - 1, M = r.getState().getShadowMetadata(t, n) || [];
                if (E >= 0 && M[E]?.virtualizer?.itemHeight > 0 || P === 0) {
                  const G = setTimeout(() => {
                    T.scrollTo({
                      top: T.scrollHeight,
                      behavior: "smooth"
                    });
                  }, 50);
                  return () => clearTimeout(G);
                }
              }, [P, H, i]), et(() => {
                const T = d.current;
                if (!T) return;
                const E = () => {
                  const { scrollTop: x, clientHeight: G } = T;
                  let q = 0, st = P - 1;
                  for (; q <= st; ) {
                    const St = Math.floor((q + st) / 2);
                    C[St] < x ? q = St + 1 : st = St - 1;
                  }
                  const wt = Math.max(0, st - s);
                  let it = wt;
                  const Vt = x + G;
                  for (; it < P && C[it] < Vt; )
                    it++;
                  b({
                    startIndex: wt,
                    endIndex: Math.min(P, it + s)
                  });
                }, M = () => {
                  T.scrollHeight - T.scrollTop - T.clientHeight < 1 || (V.current = !1), E();
                };
                return T.addEventListener("scroll", M, {
                  passive: !0
                }), E(), () => T.removeEventListener("scroll", M);
              }, [P, C]);
              const O = Tt(
                (T = "smooth") => {
                  d.current && (V.current = !0, d.current.scrollTo({
                    top: d.current.scrollHeight,
                    behavior: T
                  }));
                },
                []
              ), D = Tt(
                (T, E = "smooth") => {
                  d.current && C[T] !== void 0 && (V.current = !1, d.current.scrollTo({
                    top: C[T],
                    behavior: E
                  }));
                },
                [C]
              ), $ = {
                outer: {
                  ref: d,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${H}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${C[p.startIndex] || 0}px)`
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
              const s = [...u()].sort(
                (d, A) => e(d.item, A.item)
              ), i = s.map(({ item: d }) => d), S = {
                ...f,
                validIndices: s.map(
                  ({ originalIndex: d }) => d
                )
              };
              return a(i, n, S);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = u().filter(
                ({ item: d }, A) => e(d, A)
              ), i = s.map(({ item: d }) => d), S = {
                ...f,
                validIndices: s.map(
                  ({ originalIndex: d }) => d
                )
              };
              return a(i, n, S);
            };
          if (l === "stateMap")
            return (e) => {
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (f?.validIndices || Array.from({ length: o.length }, (i, S) => S)).map((i, S) => {
                const d = o[i], A = [...n, i.toString()], p = a(d, A, f);
                return e(d, p, {
                  register: () => {
                    const [, V] = X({}), _ = `${m}-${n.join(".")}-${i}`;
                    lt(() => {
                      const R = `${t}////${_}`, P = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return P.components.set(R, {
                        forceUpdate: () => V({}),
                        paths: /* @__PURE__ */ new Set([A.join(".")])
                      }), r.getState().stateComponents.set(t, P), () => {
                        const H = r.getState().stateComponents.get(t);
                        H && H.components.delete(R);
                      };
                    }, [t, _]);
                  },
                  index: S,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((s, i) => {
              let S;
              f?.validIndices && f.validIndices[i] !== void 0 ? S = f.validIndices[i] : S = i;
              const d = [...n, S.toString()], A = a(s, d, f);
              return e(
                s,
                A,
                i,
                v,
                a(v, n, f)
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
              return Array.isArray(o) ? (f?.validIndices || Array.from({ length: o.length }, (i, S) => S)).map((i, S) => {
                const d = o[i], A = [...n, i.toString()], p = a(d, A, f), b = `${m}-${n.join(".")}-${i}`;
                return ot(Zt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: b,
                  itemPath: A,
                  children: e(
                    d,
                    p,
                    S,
                    o,
                    a(o, n, f)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const o = v;
              y.clear(), k++;
              const s = o.flatMap(
                (i) => i[e] ?? []
              );
              return a(
                s,
                [...n, "[*]", e],
                f
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
              const o = e.length - 1, s = e[o], i = [...n, o.toString()];
              return a(s, i);
            };
          if (l === "insert")
            return (e) => (w(n), mt(c, e, n, t), a(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, s) => {
              const i = r.getState().getNestedState(t, n), S = Y(e) ? e(i) : e;
              let d = null;
              if (!i.some((p) => {
                if (o) {
                  const V = o.every(
                    (_) => z(p[_], S[_])
                  );
                  return V && (d = p), V;
                }
                const b = z(p, S);
                return b && (d = p), b;
              }))
                w(n), mt(c, S, n, t);
              else if (s && d) {
                const p = s(d), b = i.map(
                  (V) => z(V, d) ? p : V
                );
                w(n), rt(c, b, n);
              }
            };
          if (l === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return w(n), ct(c, n, t, e), a(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let o = 0; o < v.length; o++)
                v[o] === e && ct(c, n, t, o);
            };
          if (l === "toggleByValue")
            return (e) => {
              const o = v.findIndex((s) => s === e);
              o > -1 ? ct(c, n, t, o) : mt(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = u().find(
                ({ item: S }, d) => e(S, d)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, f);
            };
          if (l === "findWith")
            return (e, o) => {
              const i = u().find(
                ({ item: d }) => d[e] === o
              );
              if (!i) return;
              const S = [...n, i.originalIndex.toString()];
              return a(i.item, S, f);
            };
        }
        const Z = n[n.length - 1];
        if (!isNaN(Number(Z))) {
          const u = n.slice(0, -1), e = r.getState().getNestedState(t, u);
          if (Array.isArray(e) && l === "cut")
            return () => ct(
              c,
              u,
              t,
              Number(Z)
            );
        }
        if (l === "get")
          return () => {
            if (f?.validIndices && Array.isArray(v)) {
              const u = r.getState().getNestedState(t, n);
              return f.validIndices.map((e) => u[e]);
            }
            return r.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (u) => kt({
            _stateKey: t,
            _path: n,
            _effect: u.toString()
          });
        if (l === "$get")
          return () => kt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const u = `${t}:${n.join(".")}`;
          return r.getState().getSyncInfo(u);
        }
        if (l == "getLocalStorage")
          return (u) => gt(g + "-" + t + "-" + u);
        if (l === "_selected") {
          const u = n.slice(0, -1), e = u.join("."), o = r.getState().getNestedState(t, u);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), s = e.join(".");
            u ? r.getState().setSelectedIndex(t, s, o) : r.getState().setSelectedIndex(t, s, void 0);
            const i = r.getState().getNestedState(t, [...e]);
            rt(c, i, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const u = n.slice(0, -1), e = Number(n[n.length - 1]), o = u.join("."), s = r.getState().getSelectedIndex(t, o);
            r.getState().setSelectedIndex(
              t,
              o,
              s === e ? void 0 : e
            );
            const i = r.getState().getNestedState(t, [...u]);
            rt(c, i, u), w(u);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const e = r.getState().cogsStateStore[t], s = Ft(e, u).newDocument;
              Ct(
                t,
                r.getState().initialStateGlobal[t],
                s,
                c,
                m,
                g
              );
              const i = r.getState().stateComponents.get(t);
              if (i) {
                const S = yt(e, s), d = new Set(S);
                for (const [
                  A,
                  p
                ] of i.components.entries()) {
                  let b = !1;
                  const V = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!V.includes("none")) {
                    if (V.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (V.includes("component") && (p.paths.has("") && (b = !0), !b))
                      for (const _ of d) {
                        if (p.paths.has(_)) {
                          b = !0;
                          break;
                        }
                        let R = _.lastIndexOf(".");
                        for (; R !== -1; ) {
                          const P = _.substring(0, R);
                          if (p.paths.has(P)) {
                            b = !0;
                            break;
                          }
                          const H = _.substring(
                            R + 1
                          );
                          if (!isNaN(Number(H))) {
                            const C = P.lastIndexOf(".");
                            if (C !== -1) {
                              const N = P.substring(
                                0,
                                C
                              );
                              if (p.paths.has(N)) {
                                b = !0;
                                break;
                              }
                            }
                          }
                          R = P.lastIndexOf(".");
                        }
                        if (b) break;
                      }
                    if (!b && V.includes("deps") && p.depsFunction) {
                      const _ = p.depsFunction(s);
                      let R = !1;
                      typeof _ == "boolean" ? _ && (R = !0) : z(p.deps, _) || (p.deps = _, R = !0), R && (b = !0);
                    }
                    b && p.forceUpdate();
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
              J(u.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const s = r.getState().getValidationErrors(u.key);
                s && s.length > 0 && s.forEach(([S]) => {
                  S && S.startsWith(u.key) && J(S);
                });
                const i = u.zodSchema.safeParse(o);
                return i.success ? !0 : (i.error.errors.forEach((d) => {
                  const A = d.path, p = d.message, b = [u.key, ...A].join(".");
                  e(b, p);
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
            children: u,
            hideMessage: e
          }) => /* @__PURE__ */ ht(
            Rt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: f?.validIndices,
              children: u
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (u, e) => {
            if (e?.debounce)
              jt(() => {
                rt(c, u, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              rt(c, u, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            w(n);
          };
        if (l === "formElement")
          return (u, e) => /* @__PURE__ */ ht(
            Ot,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: u,
              formOpts: e
            }
          );
        const j = [...n, l], nt = r.getState().getNestedState(t, j);
        return a(nt, j, f);
      }
    }, L = new Proxy(U, F);
    return y.set(W, {
      proxy: L,
      stateVersion: k
    }), L;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function kt(t) {
  return ot(Yt, { proxy: t });
}
function Jt({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (y, k, w, I, a) => t._mapFn(y, k, w, I, a)
  ) : null;
}
function Yt({
  proxy: t
}) {
  const c = Q(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
    const g = c.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, w = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: t._effect
    };
    r.getState().addSignalElement(m, v);
    const n = r.getState().getNestedState(t._stateKey, t._path);
    let f;
    if (t._effect)
      try {
        f = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (U) {
        console.error("Error evaluating effect function during mount:", U), f = n;
      }
    else
      f = n;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const W = document.createTextNode(String(f));
    g.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), ot("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ue(t) {
  const c = Pt(
    (m) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return ot("text", {}, String(c));
}
function Zt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: g
}) {
  const [, y] = X({}), [k, w] = Dt(), I = Q(null);
  return et(() => {
    w.height > 0 && w.height !== I.current && (I.current = w.height, r.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, m]), lt(() => {
    const a = `${t}////${c}`, v = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), r.getState().stateComponents.set(t, v), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, c, m.join(".")]), /* @__PURE__ */ ht("div", { ref: k, children: g });
}
export {
  kt as $cogsSignal,
  ue as $cogsSignalStore,
  ce as addStateOptions,
  le as createCogsState,
  de as notifyComponent,
  qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
