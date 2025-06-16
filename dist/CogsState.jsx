"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as Y, useRef as X, useEffect as tt, useLayoutEffect as lt, useMemo as ht, createElement as st, useSyncExternalStore as Pt, startTransition as Vt, useCallback as pt } from "react";
import { transformStateFunc as xt, isDeepEqual as B, isFunction as Z, getNestedValue as z, getDifferences as vt, debounce as _t } from "./utility.js";
import { pushFunc as St, updateFn as at, cutFunc as ct, ValidationWrapper as Ot, FormControlComponent as Mt } from "./Functions.jsx";
import Rt from "superjson";
import { v4 as It } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as wt } from "./store.js";
import { useCogsConfig as $t } from "./CogsStateClient.jsx";
import { applyPatch as Ut } from "fast-json-patch";
import jt from "react-use-measure";
function Et(t, c) {
  const m = r.getState().getInitialOptions, u = r.getState().setInitialStateOptions, I = m(t) || {};
  u(t, {
    ...I,
    ...c
  });
}
function At({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const u = nt(t) || {}, I = m[t] || {}, b = r.getState().setInitialStateOptions, w = { ...I, ...u };
  let p = !1;
  if (c)
    for (const a in c)
      w.hasOwnProperty(a) ? (a == "localStorage" && c[a] && w[a].key !== c[a]?.key && (p = !0, w[a] = c[a]), a == "initialState" && c[a] && w[a] !== c[a] && // Different references
      !B(w[a], c[a]) && (p = !0, w[a] = c[a])) : (p = !0, w[a] = c[a]);
  p && b(t, w);
}
function se(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const ie = (t, c) => {
  let m = t;
  const [u, I] = xt(m);
  (Object.keys(I).length > 0 || c && Object.keys(c).length > 0) && Object.keys(I).forEach((p) => {
    I[p] = I[p] || {}, I[p].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...I[p].formElements || {}
      // State-specific overrides
    }, nt(p) || r.getState().setInitialStateOptions(p, I[p]);
  }), r.getState().setInitialStates(u), r.getState().setCreatedState(u);
  const b = (p, a) => {
    const [v] = Y(a?.componentId ?? It());
    At({
      stateKey: p,
      options: a,
      initialOptionsPart: I
    });
    const n = r.getState().cogsStateStore[p] || u[p], f = a?.modifyState ? a.modifyState(n) : n, [F, U] = Bt(
      f,
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
    At({ stateKey: p, options: a, initialOptionsPart: I }), a.localStorage && Wt(p, a), ft(p);
  }
  return { useCogsState: b, setCogsOptions: w };
}, {
  setUpdaterState: dt,
  setState: et,
  getInitialOptions: nt,
  getKeyState: Nt,
  getValidationErrors: Lt,
  setStateLog: Dt,
  updateInitialStateGlobal: yt,
  addValidationError: Ft,
  removeValidationError: J,
  setServerSyncActions: Gt
} = r.getState(), Tt = (t, c, m, u, I) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    u
  );
  const b = Z(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && u) {
    const w = `${u}-${c}-${b}`;
    let p;
    try {
      p = gt(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? p
    }, v = Rt.serialize(a);
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
}, Wt = (t, c) => {
  const m = r.getState().cogsStateStore[t], { sessionId: u } = $t(), I = Z(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (I && u) {
    const b = gt(
      `${u}-${t}-${I}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return et(t, b.state), ft(t), !0;
  }
  return !1;
}, Ct = (t, c, m, u, I, b) => {
  const w = {
    initialState: c,
    updaterState: ut(
      t,
      u,
      I,
      b
    ),
    state: m
  };
  yt(t, w.initialState), dt(t, w.updaterState), et(t, w.state);
}, ft = (t) => {
  const c = r.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || m.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((u) => u());
  });
}, ce = (t, c) => {
  const m = r.getState().stateComponents.get(t);
  if (m) {
    const u = `${t}////${c}`, I = m.components.get(u);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, Ht = (t, c, m, u) => {
  switch (t) {
    case "update":
      return {
        oldValue: z(c, u),
        newValue: z(m, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: z(m, u)
      };
    case "cut":
      return {
        oldValue: z(c, u),
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
  localStorage: u,
  formElements: I,
  reactiveDeps: b,
  reactiveType: w,
  componentId: p,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: f
} = {}) {
  const [F, U] = Y({}), { sessionId: j } = $t();
  let G = !c;
  const [h] = Y(c ?? It()), l = r.getState().stateLog[h], it = X(/* @__PURE__ */ new Set()), Q = X(p ?? It()), O = X(
    null
  );
  O.current = nt(h) ?? null, tt(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      et(h, (o) => ({
        ...o,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), tt(() => {
    if (a) {
      Et(h, {
        initialState: a
      });
      const e = O.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = r.getState().initialStateGlobal[h];
      if (!(i && !B(i, a) || !i) && !s)
        return;
      let g = null;
      const A = Z(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      A && j && (g = gt(`${j}-${h}-${A}`));
      let y = a, T = !1;
      const P = s ? Date.now() : 0, C = g?.lastUpdated || 0, N = g?.lastSyncedWithServer || 0;
      s && P > C ? (y = e.serverState.data, T = !0) : g && C > N && (y = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(y)), r.getState().initializeShadowState(h, a), Ct(
        h,
        a,
        y,
        rt,
        Q.current,
        j
      ), T && A && j && Tt(y, h, e, j, Date.now()), ft(h), (Array.isArray(w) ? w : [w || "component"]).includes("none") || U({});
    }
  }, [
    a,
    f?.status,
    f?.data,
    ...n || []
  ]), lt(() => {
    G && Et(h, {
      serverSync: m,
      formElements: I,
      initialState: a,
      localStorage: u,
      middleware: O.current?.middleware
    });
    const e = `${h}////${Q.current}`, o = r.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), r.getState().stateComponents.set(h, o), U({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(h));
    };
  }, []);
  const rt = (e, o, s, i) => {
    if (Array.isArray(o)) {
      const g = `${h}-${o.join(".")}`;
      it.current.add(g);
    }
    const S = r.getState();
    et(h, (g) => {
      const A = Z(e) ? e(g) : e, y = `${h}-${o.join(".")}`;
      if (y) {
        let V = !1, k = S.signalDomElements.get(y);
        if ((!k || k.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const M = o.slice(0, -1), _ = z(A, M);
          if (Array.isArray(_)) {
            V = !0;
            const $ = `${h}-${M.join(".")}`;
            k = S.signalDomElements.get($);
          }
        }
        if (k) {
          const M = V ? z(A, o.slice(0, -1)) : z(A, o);
          k.forEach(({ parentId: _, position: $, effect: L }) => {
            const R = document.querySelector(
              `[data-parent-id="${_}"]`
            );
            if (R) {
              const H = Array.from(R.childNodes);
              if (H[$]) {
                const E = L ? new Function("state", `return (${L})(state)`)(M) : M;
                H[$].textContent = String(E);
              }
            }
          });
        }
      }
      console.log("shadowState", S.shadowStateStore), s.updateType === "update" && (i || O.current?.validation?.key) && o && J(
        (i || O.current?.validation?.key) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      s.updateType === "cut" && O.current?.validation?.key && J(
        O.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && O.current?.validation?.key && Lt(
        O.current?.validation?.key + "." + T.join(".")
      ).filter(([k, M]) => {
        let _ = k?.split(".").length;
        if (k == T.join(".") && _ == T.length - 1) {
          let $ = k + "." + T;
          J(k), Ft($, M);
        }
      });
      const P = S.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const V = vt(g, A), k = new Set(V), M = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          _,
          $
        ] of P.components.entries()) {
          let L = !1;
          const R = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !R.includes("none")) {
            if (R.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (R.includes("component") && (($.paths.has(M) || $.paths.has("")) && (L = !0), !L))
              for (const H of k) {
                let E = H;
                for (; ; ) {
                  if ($.paths.has(E)) {
                    L = !0;
                    break;
                  }
                  const x = E.lastIndexOf(".");
                  if (x !== -1) {
                    const W = E.substring(
                      0,
                      x
                    );
                    if (!isNaN(
                      Number(E.substring(x + 1))
                    ) && $.paths.has(W)) {
                      L = !0;
                      break;
                    }
                    E = W;
                  } else
                    E = "";
                  if (E === "")
                    break;
                }
                if (L) break;
              }
            if (!L && R.includes("deps") && $.depsFunction) {
              const H = $.depsFunction(A);
              let E = !1;
              typeof H == "boolean" ? H && (E = !0) : B($.deps, H) || ($.deps = H, E = !0), E && (L = !0);
            }
            L && $.forceUpdate();
          }
        }
      }
      const C = Date.now();
      o = o.map((V, k) => {
        const M = o.slice(0, -1), _ = z(A, M);
        return k === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (_.length - 1).toString() : V;
      });
      const { oldValue: N, newValue: D } = Ht(
        s.updateType,
        g,
        A,
        o
      ), q = {
        timeStamp: C,
        stateKey: h,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: N,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          S.updateShadowAtPath(h, o, A);
          break;
        case "insert":
          const V = o.slice(0, -1);
          S.insertShadowArrayElement(h, V, D);
          break;
        case "cut":
          const k = o.slice(0, -1), M = parseInt(o[o.length - 1]);
          S.removeShadowArrayElement(h, k, M);
          break;
      }
      if (Dt(h, (V) => {
        const M = [...V ?? [], q].reduce((_, $) => {
          const L = `${$.stateKey}:${JSON.stringify($.path)}`, R = _.get(L);
          return R ? (R.timeStamp = Math.max(R.timeStamp, $.timeStamp), R.newValue = $.newValue, R.oldValue = R.oldValue ?? $.oldValue, R.updateType = $.updateType) : _.set(L, { ...$ }), _;
        }, /* @__PURE__ */ new Map());
        return Array.from(M.values());
      }), Tt(
        A,
        h,
        O.current,
        j
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: q
      }), O.current?.serverSync) {
        const V = S.serverState[h], k = O.current?.serverSync;
        Gt(h, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: A }),
          rollBackState: V,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
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
      rt,
      Q.current,
      j
    )
  ), r.getState().cogsStateStore[h] || et(h, t), r.getState().initialStateGlobal[h] || yt(h, t));
  const d = ht(() => ut(
    h,
    rt,
    Q.current,
    j
  ), [h, j]);
  return [Nt(h), d];
}
function ut(t, c, m, u) {
  const I = /* @__PURE__ */ new Map();
  let b = 0;
  const w = (v) => {
    const n = v.join(".");
    for (const [f] of I)
      (f === n || f.startsWith(n + ".")) && I.delete(f);
    b++;
  }, p = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const f = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), I.clear(), b++;
      const F = a(f, []), U = nt(t), j = Z(U?.localStorage?.key) ? U?.localStorage?.key(f) : U?.localStorage?.key, G = `${u}-${t}-${j}`;
      G && localStorage.removeItem(G), dt(t, F), et(t, f);
      const h = r.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (v) => {
      I.clear(), b++;
      const n = ut(
        t,
        c,
        m,
        u
      ), f = r.getState().initialStateGlobal[t], F = nt(t), U = Z(F?.localStorage?.key) ? F?.localStorage?.key(f) : F?.localStorage?.key, j = `${u}-${t}-${U}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Vt(() => {
        yt(t, v), r.getState().initializeShadowState(t, v), dt(t, n), et(t, v);
        const G = r.getState().stateComponents.get(t);
        G && G.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = r.getState().serverState[t];
      return !!(v && B(v, Nt(t)));
    }
  };
  function a(v, n = [], f) {
    const F = n.map(String).join(".");
    I.get(F);
    const U = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(p).forEach((h) => {
      U[h] = p[h];
    });
    const j = {
      apply(h, l, it) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(h, l) {
        f?.validIndices && !Array.isArray(v) && (f = { ...f, validIndices: void 0 });
        const it = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !it.has(l)) {
          const d = `${t}////${m}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const o = e.components.get(d);
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
          return () => vt(
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
                  const A = [s, ...g.path].join(".");
                  r.getState().addValidationError(A, g.message);
                });
                const S = r.getState().stateComponents.get(t);
                S && S.components.forEach((g) => {
                  g.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = z(e, n);
          return B(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = z(e, n);
            return B(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = nt(t), o = Z(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${u}-${t}-${o}`;
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
          const d = () => f?.validIndices ? v.map((o, s) => ({
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
                stickToBottom: i = !1,
                dependencies: S = []
              } = e, [g, A] = Y(0), y = X(null), [T, P] = Y({
                startIndex: 0,
                endIndex: 10
              }), C = X(i), N = X(null), [D, q] = Y(0);
              tt(() => r.getState().subscribeToShadowState(t, () => {
                q((x) => x + 1);
              }), [t]);
              const V = r().getNestedState(
                t,
                n
              ), k = V.length, { totalHeight: M, positions: _ } = ht(() => {
                const E = r.getState().getShadowMetadata(t, n) || [];
                let x = 0;
                const W = [];
                for (let K = 0; K < k; K++) {
                  W[K] = x;
                  const ot = E[K]?.virtualizer?.itemHeight;
                  x += ot || o;
                }
                return { totalHeight: x, positions: W };
              }, [
                k,
                t,
                n.join("."),
                o,
                D
              ]), $ = ht(() => {
                const E = Math.max(0, T.startIndex), x = Math.min(k, T.endIndex), W = Array.from(
                  { length: x - E },
                  (ot, bt) => E + bt
                ), K = W.map((ot) => V[ot]);
                return a(K, n, {
                  ...f,
                  validIndices: W
                });
              }, [T.startIndex, T.endIndex, V, k]);
              lt(() => {
                const E = y.current;
                if (!E || !i || !C.current)
                  return;
                N.current && clearInterval(N.current), console.log("ALGORITHM: Starting..."), P({
                  startIndex: Math.max(0, k - 10 - s),
                  endIndex: k
                }), console.log(
                  "ALGORITHM: Starting LOOP to wait for measurement."
                );
                let x = 0;
                return N.current = setInterval(() => {
                  x++, console.log(`LOOP ${x}: Checking last item...`);
                  const W = k - 1;
                  if (W < 0) {
                    clearInterval(N.current);
                    return;
                  }
                  ((r.getState().getShadowMetadata(t, n) || [])[W]?.virtualizer?.itemHeight || 0) > 0 ? (console.log(
                    "%cSUCCESS: Last item is measured. Scrolling.",
                    "color: green; font-weight: bold;"
                  ), clearInterval(N.current), N.current = null, E.scrollTo({
                    top: E.scrollHeight,
                    behavior: "smooth"
                  })) : (console.log("...WAITING. Height is not ready."), x > 30 && (console.error("LOOP TIMEOUT. Stopping."), clearInterval(N.current), N.current = null));
                }, 100), () => {
                  N.current && clearInterval(N.current);
                };
              }, [k, ...S]), tt(() => {
                const E = y.current;
                if (!E) return;
                console.log(
                  "DEPENDENCY CHANGE: Resetting scroll lock to:",
                  i
                ), C.current = i;
                const x = () => {
                  E.scrollHeight - E.scrollTop - E.clientHeight < 1 || C.current && (console.log("USER SCROLL: Lock broken."), C.current = !1, N.current && (clearInterval(N.current), N.current = null, console.log("...Auto-scroll loop terminated by user.")));
                };
                return E.addEventListener("scroll", x, {
                  passive: !0
                }), () => E.removeEventListener("scroll", x);
              }, [k, _]), tt(() => {
                console.log(
                  "DEPENDENCY CHANGE: Resetting scroll lock and scrolling to bottom."
                ), y.current && (C.current = i, y.current.scrollTop = 0, P({ startIndex: 0, endIndex: 10 }));
              }, S);
              const L = pt(
                (E = "smooth") => {
                  y.current && (C.current = !0, console.log("USER ACTION: Scroll lock ENABLED."), y.current.scrollTo({
                    top: y.current.scrollHeight,
                    behavior: E
                  }));
                },
                []
              ), R = pt(
                (E, x = "smooth") => {
                  y.current && _[E] !== void 0 && (C.current = !1, console.log("USER ACTION: Scroll lock DISABLED."), y.current.scrollTo({
                    top: _[E],
                    behavior: x
                  }));
                },
                [_]
              ), H = {
                outer: {
                  ref: y,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${M}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${_[T.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: $,
                virtualizerProps: H,
                scrollToBottom: L,
                scrollToIndex: R
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (g, A) => e(g.item, A.item)
              ), i = s.map(({ item: g }) => g), S = {
                ...f,
                validIndices: s.map(
                  ({ originalIndex: g }) => g
                )
              };
              return a(i, n, S);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: g }, A) => e(g, A)
              ), i = s.map(({ item: g }) => g), S = {
                ...f,
                validIndices: s.map(
                  ({ originalIndex: g }) => g
                )
              };
              return a(i, n, S);
            };
          if (l === "stateMap")
            return (e) => {
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (f?.validIndices || Array.from({ length: o.length }, (i, S) => S)).map((i, S) => {
                const g = o[i], A = [...n, i.toString()], y = a(g, A, f);
                return e(g, y, {
                  register: () => {
                    const [, P] = Y({}), C = `${m}-${n.join(".")}-${i}`;
                    lt(() => {
                      const N = `${t}////${C}`, D = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(N, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([A.join(".")])
                      }), r.getState().stateComponents.set(t, D), () => {
                        const q = r.getState().stateComponents.get(t);
                        q && q.components.delete(N);
                      };
                    }, [t, C]);
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
              const g = [...n, S.toString()], A = a(s, g, f);
              return e(
                s,
                A,
                i,
                v,
                a(v, n, f)
              );
            });
          if (l === "$stateMap")
            return (e) => st(zt, {
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
                const g = o[i], A = [...n, i.toString()], y = a(g, A, f), T = `${m}-${n.join(".")}-${i}`;
                return st(Jt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: A,
                  children: e(
                    g,
                    y,
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
              I.clear(), b++;
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
            return (e) => (w(n), St(c, e, n, t), a(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, s) => {
              const i = r.getState().getNestedState(t, n), S = Z(e) ? e(i) : e;
              let g = null;
              if (!i.some((y) => {
                if (o) {
                  const P = o.every(
                    (C) => B(y[C], S[C])
                  );
                  return P && (g = y), P;
                }
                const T = B(y, S);
                return T && (g = y), T;
              }))
                w(n), St(c, S, n, t);
              else if (s && g) {
                const y = s(g), T = i.map(
                  (P) => B(P, g) ? y : P
                );
                w(n), at(c, T, n);
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
              o > -1 ? ct(c, n, t, o) : St(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: S }, g) => e(S, g)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, f);
            };
          if (l === "findWith")
            return (e, o) => {
              const i = d().find(
                ({ item: g }) => g[e] === o
              );
              if (!i) return;
              const S = [...n, i.originalIndex.toString()];
              return a(i.item, S, f);
            };
        }
        const Q = n[n.length - 1];
        if (!isNaN(Number(Q))) {
          const d = n.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ct(
              c,
              d,
              t,
              Number(Q)
            );
        }
        if (l === "get")
          return () => {
            if (f?.validIndices && Array.isArray(v)) {
              const d = r.getState().getNestedState(t, n);
              return f.validIndices.map((e) => d[e]);
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
          return (d) => gt(u + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), o = r.getState().getNestedState(t, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), s = e.join(".");
            d ? r.getState().setSelectedIndex(t, s, o) : r.getState().setSelectedIndex(t, s, void 0);
            const i = r.getState().getNestedState(t, [...e]);
            at(c, i, e), w(e);
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
            at(c, i, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], s = Ut(e, d).newDocument;
              Ct(
                t,
                r.getState().initialStateGlobal[t],
                s,
                c,
                m,
                u
              );
              const i = r.getState().stateComponents.get(t);
              if (i) {
                const S = vt(e, s), g = new Set(S);
                for (const [
                  A,
                  y
                ] of i.components.entries()) {
                  let T = !1;
                  const P = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      y.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (y.paths.has("") && (T = !0), !T))
                      for (const C of g) {
                        if (y.paths.has(C)) {
                          T = !0;
                          break;
                        }
                        let N = C.lastIndexOf(".");
                        for (; N !== -1; ) {
                          const D = C.substring(0, N);
                          if (y.paths.has(D)) {
                            T = !0;
                            break;
                          }
                          const q = C.substring(
                            N + 1
                          );
                          if (!isNaN(Number(q))) {
                            const V = D.lastIndexOf(".");
                            if (V !== -1) {
                              const k = D.substring(
                                0,
                                V
                              );
                              if (y.paths.has(k)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          N = D.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && P.includes("deps") && y.depsFunction) {
                      const C = y.depsFunction(s);
                      let N = !1;
                      typeof C == "boolean" ? C && (N = !0) : B(y.deps, C) || (y.deps = C, N = !0), N && (T = !0);
                    }
                    T && y.forceUpdate();
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
                s && s.length > 0 && s.forEach(([S]) => {
                  S && S.startsWith(d.key) && J(S);
                });
                const i = d.zodSchema.safeParse(o);
                return i.success ? !0 : (i.error.errors.forEach((g) => {
                  const A = g.path, y = g.message, T = [d.key, ...A].join(".");
                  e(T, y);
                }), ft(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => wt.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return r.getState().serverState[t];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return p.revertToInitialState;
          if (l === "updateInitialState") return p.updateInitialState;
          if (l === "removeValidation") return p.removeValidation;
        }
        if (l === "getFormRef")
          return () => wt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ mt(
            Ot,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: f?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              _t(() => {
                at(c, d, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              at(c, d, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ mt(
            Mt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const O = [...n, l], rt = r.getState().getNestedState(t, O);
        return a(rt, O, f);
      }
    }, G = new Proxy(U, j);
    return I.set(F, {
      proxy: G,
      stateVersion: b
    }), G;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function kt(t) {
  return st(qt, { proxy: t });
}
function zt({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (I, b, w, p, a) => t._mapFn(I, b, w, p, a)
  ) : null;
}
function qt({
  proxy: t
}) {
  const c = X(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return tt(() => {
    const u = c.current;
    if (!u || !u.parentElement) return;
    const I = u.parentElement, w = Array.from(I.childNodes).indexOf(u);
    let p = I.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", p));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
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
    const F = document.createTextNode(String(f));
    u.replaceWith(F);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function le(t) {
  const c = Pt(
    (m) => {
      const u = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return st("text", {}, String(c));
}
function Jt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: u
}) {
  const [, I] = Y({}), [b, w] = jt(), p = X(null);
  return tt(() => {
    w.height > 0 && w.height !== p.current && (p.current = w.height, r.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, m]), lt(() => {
    const a = `${t}////${c}`, v = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), r.getState().stateComponents.set(t, v), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, c, m.join(".")]), /* @__PURE__ */ mt("div", { ref: b, children: u });
}
export {
  kt as $cogsSignal,
  le as $cogsSignalStore,
  se as addStateOptions,
  ie as createCogsState,
  ce as notifyComponent,
  Bt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
