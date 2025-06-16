"use client";
import { jsx as ht } from "react/jsx-runtime";
import { useState as X, useRef as Q, useEffect as et, useLayoutEffect as lt, useMemo as vt, createElement as ot, useSyncExternalStore as Pt, startTransition as _t, useCallback as Tt } from "react";
import { transformStateFunc as Mt, isDeepEqual as z, isFunction as Y, getNestedValue as B, getDifferences as yt, debounce as jt } from "./utility.js";
import { pushFunc as mt, updateFn as rt, cutFunc as ct, ValidationWrapper as Rt, FormControlComponent as Ot } from "./Functions.jsx";
import Ut from "superjson";
import { v4 as It } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as Et } from "./store.js";
import { useCogsConfig as xt } from "./CogsStateClient.jsx";
import { applyPatch as Ft } from "fast-json-patch";
import Dt from "react-use-measure";
function At(t, c) {
  const m = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, y = m(t) || {};
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
  const f = tt(t) || {}, y = m[t] || {}, k = r.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !z(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(t, p);
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
    }, tt(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const k = (I, a) => {
    const [v] = X(a?.componentId ?? It());
    $t({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = r.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [W, U] = qt(
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
  function p(I, a) {
    $t({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && zt(I, a), ft(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: dt,
  setState: K,
  getInitialOptions: tt,
  getKeyState: Ct,
  getValidationErrors: Wt,
  setStateLog: Lt,
  updateInitialStateGlobal: pt,
  addValidationError: Gt,
  removeValidationError: J,
  setServerSyncActions: Ht
} = r.getState(), bt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const k = Y(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (k && f) {
    const p = `${f}-${c}-${k}`;
    let I;
    try {
      I = gt(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Ut.serialize(a);
    window.localStorage.setItem(
      p,
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
  const m = r.getState().cogsStateStore[t], { sessionId: f } = xt(), y = Y(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const k = gt(
      `${f}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return K(t, k.state), ft(t), !0;
  }
  return !1;
}, Nt = (t, c, m, f, y, k) => {
  const p = {
    initialState: c,
    updaterState: ut(
      t,
      f,
      y,
      k
    ),
    state: m
  };
  pt(t, p.initialState), dt(t, p.updaterState), K(t, p.state);
}, ft = (t) => {
  const c = r.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, de = (t, c) => {
  const m = r.getState().stateComponents.get(t);
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
  reactiveDeps: k,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [W, U] = X({}), { sessionId: F } = xt();
  let L = !c;
  const [h] = X(c ?? It()), l = r.getState().stateLog[h], at = Q(/* @__PURE__ */ new Set()), Z = Q(I ?? It()), R = Q(
    null
  );
  R.current = tt(h) ?? null, et(() => {
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
      At(h, {
        initialState: a
      });
      const e = R.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = r.getState().initialStateGlobal[h];
      if (!(i && !z(i, a) || !i) && !s)
        return;
      let g = null;
      const w = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      w && F && (g = gt(`${F}-${h}-${w}`));
      let E = a, A = !1;
      const M = s ? Date.now() : 0, P = g?.lastUpdated || 0, _ = g?.lastSyncedWithServer || 0;
      s && M > P ? (E = e.serverState.data, A = !0) : g && P > _ && (E = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(E)), r.getState().initializeShadowState(h, a), Nt(
        h,
        a,
        E,
        nt,
        Z.current,
        F
      ), A && w && F && bt(E, h, e, F, Date.now()), ft(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || U({});
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
    const e = `${h}////${Z.current}`, o = r.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(h, o), U({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(h));
    };
  }, []);
  const nt = (e, o, s, i) => {
    if (Array.isArray(o)) {
      const g = `${h}-${o.join(".")}`;
      at.current.add(g);
    }
    const u = r.getState();
    K(h, (g) => {
      const w = Y(e) ? e(g) : e, E = `${h}-${o.join(".")}`;
      if (E) {
        let N = !1, x = u.signalDomElements.get(E);
        if ((!x || x.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = o.slice(0, -1), D = B(w, O);
          if (Array.isArray(D)) {
            N = !0;
            const $ = `${h}-${O.join(".")}`;
            x = u.signalDomElements.get($);
          }
        }
        if (x) {
          const O = N ? B(w, o.slice(0, -1)) : B(w, o);
          x.forEach(({ parentId: D, position: $, effect: T }) => {
            const b = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (b) {
              const j = Array.from(b.childNodes);
              if (j[$]) {
                const C = T ? new Function("state", `return (${T})(state)`)(O) : O;
                j[$].textContent = String(C);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), s.updateType === "update" && (i || R.current?.validation?.key) && o && J(
        (i || R.current?.validation?.key) + "." + o.join(".")
      );
      const A = o.slice(0, o.length - 1);
      s.updateType === "cut" && R.current?.validation?.key && J(
        R.current?.validation?.key + "." + A.join(".")
      ), s.updateType === "insert" && R.current?.validation?.key && Wt(
        R.current?.validation?.key + "." + A.join(".")
      ).filter(([x, O]) => {
        let D = x?.split(".").length;
        if (x == A.join(".") && D == A.length - 1) {
          let $ = x + "." + A;
          J(x), Gt($, O);
        }
      });
      const M = u.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", M), M) {
        const N = yt(g, w), x = new Set(N), O = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of M.components.entries()) {
          let T = !1;
          const b = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !b.includes("none")) {
            if (b.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (b.includes("component") && (($.paths.has(O) || $.paths.has("")) && (T = !0), !T))
              for (const j of x) {
                let C = j;
                for (; ; ) {
                  if ($.paths.has(C)) {
                    T = !0;
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
                      T = !0;
                      break;
                    }
                    C = q;
                  } else
                    C = "";
                  if (C === "")
                    break;
                }
                if (T) break;
              }
            if (!T && b.includes("deps") && $.depsFunction) {
              const j = $.depsFunction(w);
              let C = !1;
              typeof j == "boolean" ? j && (C = !0) : z($.deps, j) || ($.deps = j, C = !0), C && (T = !0);
            }
            T && $.forceUpdate();
          }
        }
      }
      const P = Date.now();
      o = o.map((N, x) => {
        const O = o.slice(0, -1), D = B(w, O);
        return x === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : N;
      });
      const { oldValue: _, newValue: V } = Bt(
        s.updateType,
        g,
        w,
        o
      ), H = {
        timeStamp: P,
        stateKey: h,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: _,
        newValue: V
      };
      switch (s.updateType) {
        case "update":
          u.updateShadowAtPath(h, o, w);
          break;
        case "insert":
          const N = o.slice(0, -1);
          u.insertShadowArrayElement(h, N, V);
          break;
        case "cut":
          const x = o.slice(0, -1), O = parseInt(o[o.length - 1]);
          u.removeShadowArrayElement(h, x, O);
          break;
      }
      if (Lt(h, (N) => {
        const O = [...N ?? [], H].reduce((D, $) => {
          const T = `${$.stateKey}:${JSON.stringify($.path)}`, b = D.get(T);
          return b ? (b.timeStamp = Math.max(b.timeStamp, $.timeStamp), b.newValue = $.newValue, b.oldValue = b.oldValue ?? $.oldValue, b.updateType = $.updateType) : D.set(T, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), bt(
        w,
        h,
        R.current,
        F
      ), R.current?.middleware && R.current.middleware({
        updateLog: l,
        update: H
      }), R.current?.serverSync) {
        const N = u.serverState[h], x = R.current?.serverSync;
        Ht(h, {
          syncKey: typeof x.syncKey == "string" ? x.syncKey : x.syncKey({ state: w }),
          rollBackState: N,
          actionTimeStamp: Date.now() + (x.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
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
  const d = vt(() => ut(
    h,
    nt,
    Z.current,
    F
  ), [h, F]);
  return [Ct(h), d];
}
function ut(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const W = a(S, []), U = tt(t), F = Y(U?.localStorage?.key) ? U?.localStorage?.key(S) : U?.localStorage?.key, L = `${f}-${t}-${F}`;
      L && localStorage.removeItem(L), dt(t, W), K(t, S);
      const h = r.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const n = ut(
        t,
        c,
        m,
        f
      ), S = r.getState().initialStateGlobal[t], W = tt(t), U = Y(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, F = `${f}-${t}-${U}`;
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
      return !!(v && z(v, Ct(t)));
    }
  };
  function a(v, n = [], S) {
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
              let i = !0;
              for (const u of o.paths)
                if (s.startsWith(u) && (s === u || s[u.length] === ".")) {
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
            const d = r.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(t, []), s = d?.validation?.key;
            try {
              const i = await e.action(o);
              if (i && !i.success && i.errors && s) {
                r.getState().removeValidationError(s), i.errors.forEach((g) => {
                  const w = [s, ...g.path].join(".");
                  r.getState().addValidationError(w, g.message);
                });
                const u = r.getState().stateComponents.get(t);
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
          const d = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = B(e, n);
          return z(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = B(e, n);
            return z(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = tt(t), o = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${o}`;
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
                stickToBottom: i = !1
              } = e, u = Q(null), g = () => i ? {
                startIndex: Math.max(
                  0,
                  _.length - 10 - s
                ),
                endIndex: _.length
              } : { startIndex: 0, endIndex: 10 }, [w, E] = X(g), A = Q(i), [M, P] = X(0);
              et(() => r.getState().subscribeToShadowState(t, () => {
                P((b) => b + 1);
              }), [t]);
              const _ = r().getNestedState(
                t,
                n
              ), V = _.length, { totalHeight: H, positions: N } = vt(() => {
                const T = r.getState().getShadowMetadata(t, n) || [];
                let b = 0;
                const j = [];
                for (let C = 0; C < V; C++) {
                  j[C] = b;
                  const G = T[C]?.virtualizer?.itemHeight;
                  b += G || o;
                }
                return { totalHeight: b, positions: j };
              }, [
                V,
                t,
                n.join("."),
                o,
                M
              ]), x = vt(() => {
                const T = Math.max(0, w.startIndex), b = Math.min(V, w.endIndex), j = Array.from(
                  { length: b - T },
                  (G, q) => T + q
                ), C = j.map((G) => _[G]);
                return a(C, n, {
                  ...S,
                  validIndices: j
                });
              }, [w.startIndex, w.endIndex, _, V]);
              lt(() => {
                const T = u.current;
                if (!T || !i || !A.current)
                  return;
                const b = V - 1, j = r.getState().getShadowMetadata(t, n) || [];
                if (b >= 0 && j[b]?.virtualizer?.itemHeight > 0 || V === 0) {
                  const G = setTimeout(() => {
                    T.scrollTo({
                      top: T.scrollHeight,
                      behavior: "smooth"
                    });
                  }, 50);
                  return () => clearTimeout(G);
                }
              }, [V, H, i]), et(() => {
                const T = u.current;
                if (!T) return;
                const b = () => {
                  const { scrollTop: C, clientHeight: G } = T;
                  let q = 0, st = V - 1;
                  for (; q <= st; ) {
                    const St = Math.floor((q + st) / 2);
                    N[St] < C ? q = St + 1 : st = St - 1;
                  }
                  const wt = Math.max(0, st - s);
                  let it = wt;
                  const Vt = C + G;
                  for (; it < V && N[it] < Vt; )
                    it++;
                  E({
                    startIndex: wt,
                    endIndex: Math.min(V, it + s)
                  });
                }, j = () => {
                  T.scrollHeight - T.scrollTop - T.clientHeight < 1 || (A.current = !1), b();
                };
                return T.addEventListener("scroll", j, {
                  passive: !0
                }), b(), () => T.removeEventListener("scroll", j);
              }, [V, N]);
              const O = Tt(
                (T = "smooth") => {
                  u.current && (A.current = !0, u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: T
                  }));
                },
                []
              ), D = Tt(
                (T, b = "smooth") => {
                  u.current && N[T] !== void 0 && (A.current = !1, u.current.scrollTo({
                    top: N[T],
                    behavior: b
                  }));
                },
                [N]
              ), $ = {
                outer: {
                  ref: u,
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
                    transform: `translateY(${N[w.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: x,
                virtualizerProps: $,
                scrollToBottom: O,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (g, w) => e(g.item, w.item)
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
                ({ item: g }, w) => e(g, w)
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
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (i, u) => u)).map((i, u) => {
                const g = o[i], w = [...n, i.toString()], E = a(g, w, S);
                return e(g, E, {
                  register: () => {
                    const [, M] = X({}), P = `${m}-${n.join(".")}-${i}`;
                    lt(() => {
                      const _ = `${t}////${P}`, V = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return V.components.set(_, {
                        forceUpdate: () => M({}),
                        paths: /* @__PURE__ */ new Set([w.join(".")])
                      }), r.getState().stateComponents.set(t, V), () => {
                        const H = r.getState().stateComponents.get(t);
                        H && H.components.delete(_);
                      };
                    }, [t, P]);
                  },
                  index: u,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((s, i) => {
              let u;
              S?.validIndices && S.validIndices[i] !== void 0 ? u = S.validIndices[i] : u = i;
              const g = [...n, u.toString()], w = a(s, g, S);
              return e(
                s,
                w,
                i,
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
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (i, u) => u)).map((i, u) => {
                const g = o[i], w = [...n, i.toString()], E = a(g, w, S), A = `${m}-${n.join(".")}-${i}`;
                return ot(Zt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: w,
                  children: e(
                    g,
                    E,
                    u,
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
              y.clear(), k++;
              const s = o.flatMap(
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
            return (e) => (p(n), mt(c, e, n, t), a(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, s) => {
              const i = r.getState().getNestedState(t, n), u = Y(e) ? e(i) : e;
              let g = null;
              if (!i.some((E) => {
                if (o) {
                  const M = o.every(
                    (P) => z(E[P], u[P])
                  );
                  return M && (g = E), M;
                }
                const A = z(E, u);
                return A && (g = E), A;
              }))
                p(n), mt(c, u, n, t);
              else if (s && g) {
                const E = s(g), A = i.map(
                  (M) => z(M, g) ? E : M
                );
                p(n), rt(c, A, n);
              }
            };
          if (l === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return p(n), ct(c, n, t, e), a(
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
              const s = d().find(
                ({ item: u }, g) => e(u, g)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, S);
            };
          if (l === "findWith")
            return (e, o) => {
              const i = d().find(
                ({ item: g }) => g[e] === o
              );
              if (!i) return;
              const u = [...n, i.originalIndex.toString()];
              return a(i.item, u, S);
            };
        }
        const Z = n[n.length - 1];
        if (!isNaN(Number(Z))) {
          const d = n.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ct(
              c,
              d,
              t,
              Number(Z)
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
            const i = r.getState().getNestedState(t, [...e]);
            rt(c, i, e), p(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), o = d.join("."), s = r.getState().getSelectedIndex(t, o);
            r.getState().setSelectedIndex(
              t,
              o,
              s === e ? void 0 : e
            );
            const i = r.getState().getNestedState(t, [...d]);
            rt(c, i, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], s = Ft(e, d).newDocument;
              Nt(
                t,
                r.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = r.getState().stateComponents.get(t);
              if (i) {
                const u = yt(e, s), g = new Set(u);
                for (const [
                  w,
                  E
                ] of i.components.entries()) {
                  let A = !1;
                  const M = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!M.includes("none")) {
                    if (M.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (M.includes("component") && (E.paths.has("") && (A = !0), !A))
                      for (const P of g) {
                        if (E.paths.has(P)) {
                          A = !0;
                          break;
                        }
                        let _ = P.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const V = P.substring(0, _);
                          if (E.paths.has(V)) {
                            A = !0;
                            break;
                          }
                          const H = P.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(H))) {
                            const N = V.lastIndexOf(".");
                            if (N !== -1) {
                              const x = V.substring(
                                0,
                                N
                              );
                              if (E.paths.has(x)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          _ = V.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && M.includes("deps") && E.depsFunction) {
                      const P = E.depsFunction(s);
                      let _ = !1;
                      typeof P == "boolean" ? P && (_ = !0) : z(E.deps, P) || (E.deps = P, _ = !0), _ && (A = !0);
                    }
                    A && E.forceUpdate();
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
                s && s.length > 0 && s.forEach(([u]) => {
                  u && u.startsWith(d.key) && J(u);
                });
                const i = d.zodSchema.safeParse(o);
                return i.success ? !0 : (i.error.errors.forEach((g) => {
                  const w = g.path, E = g.message, A = [d.key, ...w].join(".");
                  e(A, E);
                }), ft(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Et.getState().getFormRefsByStateKey(t);
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
              jt(() => {
                rt(c, d, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              rt(c, d, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            p(n);
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
        const R = [...n, l], nt = r.getState().getNestedState(t, R);
        return a(nt, R, S);
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
    (y, k, p, I, a) => t._mapFn(y, k, p, I, a)
  ) : null;
}
function Yt({
  proxy: t
}) {
  const c = Q(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
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
    r.getState().addSignalElement(m, v);
    const n = r.getState().getNestedState(t._stateKey, t._path);
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
  }, [t._stateKey, t._path.join("."), t._effect]), ot("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ue(t) {
  const c = Pt(
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
  return ot("text", {}, String(c));
}
function Zt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = X({}), [k, p] = Dt(), I = Q(null);
  return et(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, r.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), lt(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ ht("div", { ref: k, children: f });
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
