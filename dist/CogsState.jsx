"use client";
import { jsx as ft } from "react/jsx-runtime";
import { useState as Q, useRef as Z, useEffect as et, useLayoutEffect as it, useMemo as St, createElement as ot, useSyncExternalStore as Nt, startTransition as bt, useCallback as yt } from "react";
import { transformStateFunc as Vt, isDeepEqual as B, isFunction as Y, getNestedValue as z, getDifferences as mt, debounce as Pt } from "./utility.js";
import { pushFunc as gt, updateFn as rt, cutFunc as st, ValidationWrapper as xt, FormControlComponent as _t } from "./Functions.jsx";
import Ot from "superjson";
import { v4 as ht } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as It } from "./store.js";
import { useCogsConfig as Tt } from "./CogsStateClient.jsx";
import { applyPatch as Mt } from "fast-json-patch";
import Rt from "react-use-measure";
function pt(t, c) {
  const m = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = m(t) || {};
  g(t, {
    ...y,
    ...c
  });
}
function wt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const g = tt(t) || {}, y = m[t] || {}, N = r.getState().setInitialStateOptions, p = { ...y, ...g };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !B(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && N(t, p);
}
function oe(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const ae = (t, c) => {
  let m = t;
  const [g, y] = Vt(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, tt(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const N = (I, a) => {
    const [v] = Q(a?.componentId ?? ht());
    wt({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = r.getState().cogsStateStore[I] || g[I], f = a?.modifyState ? a.modifyState(n) : n, [G, U] = Wt(
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
  function p(I, a) {
    wt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Ft(I, a), ut(I);
  }
  return { useCogsState: N, setCogsOptions: p };
}, {
  setUpdaterState: ct,
  setState: K,
  getInitialOptions: tt,
  getKeyState: kt,
  getValidationErrors: Ut,
  setStateLog: jt,
  updateInitialStateGlobal: vt,
  addValidationError: Lt,
  removeValidationError: J,
  setServerSyncActions: Dt
} = r.getState(), Et = (t, c, m, g, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    g
  );
  const N = Y(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (N && g) {
    const p = `${g}-${c}-${N}`;
    let I;
    try {
      I = dt(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Ot.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
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
}, Ft = (t, c) => {
  const m = r.getState().cogsStateStore[t], { sessionId: g } = Tt(), y = Y(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && g) {
    const N = dt(
      `${g}-${t}-${y}`
    );
    if (N && N.lastUpdated > (N.lastSyncedWithServer || 0))
      return K(t, N.state), ut(t), !0;
  }
  return !1;
}, $t = (t, c, m, g, y, N) => {
  const p = {
    initialState: c,
    updaterState: lt(
      t,
      g,
      y,
      N
    ),
    state: m
  };
  vt(t, p.initialState), ct(t, p.updaterState), K(t, p.state);
}, ut = (t) => {
  const c = r.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, se = (t, c) => {
  const m = r.getState().stateComponents.get(t);
  if (m) {
    const g = `${t}////${c}`, y = m.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Gt = (t, c, m, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: z(c, g),
        newValue: z(m, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: z(m, g)
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
function Wt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: g,
  formElements: y,
  reactiveDeps: N,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: f
} = {}) {
  const [G, U] = Q({}), { sessionId: j } = Tt();
  let W = !c;
  const [h] = Q(c ?? ht()), l = r.getState().stateLog[h], at = Z(/* @__PURE__ */ new Set()), X = Z(I ?? ht()), _ = Z(
    null
  );
  _.current = tt(h) ?? null, et(() => {
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
      pt(h, {
        initialState: a
      });
      const e = _.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = r.getState().initialStateGlobal[h];
      if (!(i && !B(i, a) || !i) && !s)
        return;
      let d = null;
      const w = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      w && j && (d = dt(`${j}-${h}-${w}`));
      let E = a, T = !1;
      const k = s ? Date.now() : 0, P = d?.lastUpdated || 0, O = d?.lastSyncedWithServer || 0;
      s && k > P ? (E = e.serverState.data, T = !0) : d && P > O && (E = d.state, e?.localStorage?.onChange && e?.localStorage?.onChange(E)), r.getState().initializeShadowState(h, a), $t(
        h,
        a,
        E,
        nt,
        X.current,
        j
      ), T && w && j && Et(E, h, e, j, Date.now()), ut(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || U({});
    }
  }, [
    a,
    f?.status,
    f?.data,
    ...n || []
  ]), it(() => {
    W && pt(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: g,
      middleware: _.current?.middleware
    });
    const e = `${h}////${X.current}`, o = r.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: N || void 0,
      reactiveType: p ?? ["component", "deps"]
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
      const w = Y(e) ? e(d) : e, E = `${h}-${o.join(".")}`;
      if (E) {
        let x = !1, C = S.signalDomElements.get(E);
        if ((!C || C.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const R = o.slice(0, -1), F = z(w, R);
          if (Array.isArray(F)) {
            x = !0;
            const $ = `${h}-${R.join(".")}`;
            C = S.signalDomElements.get($);
          }
        }
        if (C) {
          const R = x ? z(w, o.slice(0, -1)) : z(w, o);
          C.forEach(({ parentId: F, position: $, effect: L }) => {
            const A = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if (A) {
              const b = Array.from(A.childNodes);
              if (b[$]) {
                const V = L ? new Function("state", `return (${L})(state)`)(R) : R;
                b[$].textContent = String(V);
              }
            }
          });
        }
      }
      console.log("shadowState", S.shadowStateStore), s.updateType === "update" && (i || _.current?.validation?.key) && o && J(
        (i || _.current?.validation?.key) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      s.updateType === "cut" && _.current?.validation?.key && J(
        _.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && _.current?.validation?.key && Ut(
        _.current?.validation?.key + "." + T.join(".")
      ).filter(([C, R]) => {
        let F = C?.split(".").length;
        if (C == T.join(".") && F == T.length - 1) {
          let $ = C + "." + T;
          J(C), Lt($, R);
        }
      });
      const k = S.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", k), k) {
        const x = mt(d, w), C = new Set(x), R = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          F,
          $
        ] of k.components.entries()) {
          let L = !1;
          const A = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !A.includes("none")) {
            if (A.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (A.includes("component") && (($.paths.has(R) || $.paths.has("")) && (L = !0), !L))
              for (const b of C) {
                let V = b;
                for (; ; ) {
                  if ($.paths.has(V)) {
                    L = !0;
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
                      L = !0;
                      break;
                    }
                    V = q;
                  } else
                    V = "";
                  if (V === "")
                    break;
                }
                if (L) break;
              }
            if (!L && A.includes("deps") && $.depsFunction) {
              const b = $.depsFunction(w);
              let V = !1;
              typeof b == "boolean" ? b && (V = !0) : B($.deps, b) || ($.deps = b, V = !0), V && (L = !0);
            }
            L && $.forceUpdate();
          }
        }
      }
      const P = Date.now();
      o = o.map((x, C) => {
        const R = o.slice(0, -1), F = z(w, R);
        return C === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (F.length - 1).toString() : x;
      });
      const { oldValue: O, newValue: D } = Gt(
        s.updateType,
        d,
        w,
        o
      ), M = {
        timeStamp: P,
        stateKey: h,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: O,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          S.updateShadowAtPath(h, o, w);
          break;
        case "insert":
          const x = o.slice(0, -1);
          S.insertShadowArrayElement(h, x, D);
          break;
        case "cut":
          const C = o.slice(0, -1), R = parseInt(o[o.length - 1]);
          S.removeShadowArrayElement(h, C, R);
          break;
      }
      if (jt(h, (x) => {
        const R = [...x ?? [], M].reduce((F, $) => {
          const L = `${$.stateKey}:${JSON.stringify($.path)}`, A = F.get(L);
          return A ? (A.timeStamp = Math.max(A.timeStamp, $.timeStamp), A.newValue = $.newValue, A.oldValue = A.oldValue ?? $.oldValue, A.updateType = $.updateType) : F.set(L, { ...$ }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), Et(
        w,
        h,
        _.current,
        j
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: M
      }), _.current?.serverSync) {
        const x = S.serverState[h], C = _.current?.serverSync;
        Dt(h, {
          syncKey: typeof C.syncKey == "string" ? C.syncKey : C.syncKey({ state: w }),
          rollBackState: x,
          actionTimeStamp: Date.now() + (C.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  r.getState().updaterState[h] || (ct(
    h,
    lt(
      h,
      nt,
      X.current,
      j
    )
  ), r.getState().cogsStateStore[h] || K(h, t), r.getState().initialStateGlobal[h] || vt(h, t));
  const u = St(() => lt(
    h,
    nt,
    X.current,
    j
  ), [h, j]);
  return [kt(h), u];
}
function lt(t, c, m, g) {
  const y = /* @__PURE__ */ new Map();
  let N = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [f] of y)
      (f === n || f.startsWith(n + ".")) && y.delete(f);
    N++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const f = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), N++;
      const G = a(f, []), U = tt(t), j = Y(U?.localStorage?.key) ? U?.localStorage?.key(f) : U?.localStorage?.key, W = `${g}-${t}-${j}`;
      W && localStorage.removeItem(W), ct(t, G), K(t, f);
      const h = r.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (v) => {
      y.clear(), N++;
      const n = lt(
        t,
        c,
        m,
        g
      ), f = r.getState().initialStateGlobal[t], G = tt(t), U = Y(G?.localStorage?.key) ? G?.localStorage?.key(f) : G?.localStorage?.key, j = `${g}-${t}-${U}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), bt(() => {
        vt(t, v), r.getState().initializeShadowState(t, v), ct(t, n), K(t, v);
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
      return !!(v && B(v, kt(t)));
    }
  };
  function a(v, n = [], f) {
    const G = n.map(String).join(".");
    y.get(G);
    const U = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      U[h] = I[h];
    });
    const j = {
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
          return () => mt(
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
                  const w = [s, ...d.path].join(".");
                  r.getState().addValidationError(w, d.message);
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
          const u = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = z(e, n);
          return B(u, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = z(e, n);
            return B(u, o) ? "fresh" : "stale";
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
                stickToBottom: i = !1,
                dependencies: S = []
              } = e, d = Z(null), [w, E] = Q({
                startIndex: 0,
                endIndex: 10
              }), T = Z(i), k = Z(null), [P, O] = Q(0);
              et(() => r.getState().subscribeToShadowState(t, () => {
                O((b) => b + 1);
              }), [t]);
              const D = r().getNestedState(
                t,
                n
              ), M = D.length, { totalHeight: x, positions: C } = St(() => {
                const A = r.getState().getShadowMetadata(t, n) || [];
                let b = 0;
                const V = [];
                for (let H = 0; H < M; H++) {
                  V[H] = b;
                  const q = A[H]?.virtualizer?.itemHeight;
                  b += q || o;
                }
                return { totalHeight: b, positions: V };
              }, [
                M,
                t,
                n.join("."),
                o,
                P
              ]), R = St(() => {
                const A = Math.max(0, w.startIndex), b = Math.min(M, w.endIndex), V = Array.from(
                  { length: b - A },
                  (q, Ct) => A + Ct
                ), H = V.map((q) => D[q]);
                return a(H, n, {
                  ...f,
                  validIndices: V
                });
              }, [w.startIndex, w.endIndex, D, M]);
              it(() => {
                const A = d.current;
                if (!A || !i || !T.current)
                  return;
                k.current && clearInterval(k.current), console.log("ALGORITHM: Starting..."), E({
                  startIndex: Math.max(0, M - 10 - s),
                  endIndex: M
                }), console.log(
                  "ALGORITHM: Starting LOOP to wait for measurement."
                );
                let b = 0;
                return k.current = setInterval(() => {
                  b++, console.log(`LOOP ${b}: Checking last item...`);
                  const V = M - 1;
                  if (V < 0) {
                    clearInterval(k.current);
                    return;
                  }
                  ((r.getState().getShadowMetadata(t, n) || [])[V]?.virtualizer?.itemHeight || 0) > 0 ? (console.log(
                    "%cSUCCESS: Last item is measured. Scrolling.",
                    "color: green; font-weight: bold;"
                  ), clearInterval(k.current), k.current = null, A.scrollTo({
                    top: A.scrollHeight,
                    behavior: "smooth"
                  })) : (console.log("...WAITING. Height is not ready."), b > 30 && (console.error("LOOP TIMEOUT. Stopping."), clearInterval(k.current), k.current = null));
                }, 100), () => {
                  k.current && clearInterval(k.current);
                };
              }, [M, ...S]), et(() => {
                const A = d.current;
                if (!A) return;
                console.log(
                  "DEPENDENCY CHANGE: Resetting scroll lock to:",
                  i
                ), T.current = i;
                const b = () => {
                  A.scrollHeight - A.scrollTop - A.clientHeight < 1 || T.current && (console.log("USER SCROLL: Lock broken."), T.current = !1, k.current && (clearInterval(k.current), k.current = null, console.log("...Auto-scroll loop terminated by user.")));
                };
                return A.addEventListener("scroll", b, {
                  passive: !0
                }), () => A.removeEventListener("scroll", b);
              }, [M, C, ...S]);
              const F = yt(
                (A = "smooth") => {
                  d.current && (T.current = !0, console.log("USER ACTION: Scroll lock ENABLED."), d.current.scrollTo({
                    top: d.current.scrollHeight,
                    behavior: A
                  }));
                },
                []
              ), $ = yt(
                (A, b = "smooth") => {
                  d.current && C[A] !== void 0 && (T.current = !1, console.log("USER ACTION: Scroll lock DISABLED."), d.current.scrollTo({
                    top: C[A],
                    behavior: b
                  }));
                },
                [C]
              ), L = {
                outer: {
                  ref: d,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${x}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${C[w.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: R,
                virtualizerProps: L,
                scrollToBottom: F,
                scrollToIndex: $
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...u()].sort(
                (d, w) => e(d.item, w.item)
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
                ({ item: d }, w) => e(d, w)
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
                const d = o[i], w = [...n, i.toString()], E = a(d, w, f);
                return e(d, E, {
                  register: () => {
                    const [, k] = Q({}), P = `${m}-${n.join(".")}-${i}`;
                    it(() => {
                      const O = `${t}////${P}`, D = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(O, {
                        forceUpdate: () => k({}),
                        paths: /* @__PURE__ */ new Set([w.join(".")])
                      }), r.getState().stateComponents.set(t, D), () => {
                        const M = r.getState().stateComponents.get(t);
                        M && M.components.delete(O);
                      };
                    }, [t, P]);
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
              const d = [...n, S.toString()], w = a(s, d, f);
              return e(
                s,
                w,
                i,
                v,
                a(v, n, f)
              );
            });
          if (l === "$stateMap")
            return (e) => ot(Ht, {
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
                const d = o[i], w = [...n, i.toString()], E = a(d, w, f), T = `${m}-${n.join(".")}-${i}`;
                return ot(zt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: w,
                  children: e(
                    d,
                    E,
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
              y.clear(), N++;
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
            return (e) => (p(n), gt(c, e, n, t), a(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, s) => {
              const i = r.getState().getNestedState(t, n), S = Y(e) ? e(i) : e;
              let d = null;
              if (!i.some((E) => {
                if (o) {
                  const k = o.every(
                    (P) => B(E[P], S[P])
                  );
                  return k && (d = E), k;
                }
                const T = B(E, S);
                return T && (d = E), T;
              }))
                p(n), gt(c, S, n, t);
              else if (s && d) {
                const E = s(d), T = i.map(
                  (k) => B(k, d) ? E : k
                );
                p(n), rt(c, T, n);
              }
            };
          if (l === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return p(n), st(c, n, t, e), a(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let o = 0; o < v.length; o++)
                v[o] === e && st(c, n, t, o);
            };
          if (l === "toggleByValue")
            return (e) => {
              const o = v.findIndex((s) => s === e);
              o > -1 ? st(c, n, t, o) : gt(c, e, n, t);
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
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const u = n.slice(0, -1), e = r.getState().getNestedState(t, u);
          if (Array.isArray(e) && l === "cut")
            return () => st(
              c,
              u,
              t,
              Number(X)
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
          return (u) => At({
            _stateKey: t,
            _path: n,
            _effect: u.toString()
          });
        if (l === "$get")
          return () => At({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const u = `${t}:${n.join(".")}`;
          return r.getState().getSyncInfo(u);
        }
        if (l == "getLocalStorage")
          return (u) => dt(g + "-" + t + "-" + u);
        if (l === "_selected") {
          const u = n.slice(0, -1), e = u.join("."), o = r.getState().getNestedState(t, u);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), s = e.join(".");
            u ? r.getState().setSelectedIndex(t, s, o) : r.getState().setSelectedIndex(t, s, void 0);
            const i = r.getState().getNestedState(t, [...e]);
            rt(c, i, e), p(e);
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
            rt(c, i, u), p(u);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const e = r.getState().cogsStateStore[t], s = Mt(e, u).newDocument;
              $t(
                t,
                r.getState().initialStateGlobal[t],
                s,
                c,
                m,
                g
              );
              const i = r.getState().stateComponents.get(t);
              if (i) {
                const S = mt(e, s), d = new Set(S);
                for (const [
                  w,
                  E
                ] of i.components.entries()) {
                  let T = !1;
                  const k = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!k.includes("none")) {
                    if (k.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (k.includes("component") && (E.paths.has("") && (T = !0), !T))
                      for (const P of d) {
                        if (E.paths.has(P)) {
                          T = !0;
                          break;
                        }
                        let O = P.lastIndexOf(".");
                        for (; O !== -1; ) {
                          const D = P.substring(0, O);
                          if (E.paths.has(D)) {
                            T = !0;
                            break;
                          }
                          const M = P.substring(
                            O + 1
                          );
                          if (!isNaN(Number(M))) {
                            const x = D.lastIndexOf(".");
                            if (x !== -1) {
                              const C = D.substring(
                                0,
                                x
                              );
                              if (E.paths.has(C)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          O = D.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && k.includes("deps") && E.depsFunction) {
                      const P = E.depsFunction(s);
                      let O = !1;
                      typeof P == "boolean" ? P && (O = !0) : B(E.deps, P) || (E.deps = P, O = !0), O && (T = !0);
                    }
                    T && E.forceUpdate();
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
                  const w = d.path, E = d.message, T = [u.key, ...w].join(".");
                  e(T, E);
                }), ut(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
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
          return () => It.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: u,
            hideMessage: e
          }) => /* @__PURE__ */ ft(
            xt,
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
              Pt(() => {
                rt(c, u, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              rt(c, u, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            p(n);
          };
        if (l === "formElement")
          return (u, e) => /* @__PURE__ */ ft(
            _t,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: u,
              formOpts: e
            }
          );
        const _ = [...n, l], nt = r.getState().getNestedState(t, _);
        return a(nt, _, f);
      }
    }, W = new Proxy(U, j);
    return y.set(G, {
      proxy: W,
      stateVersion: N
    }), W;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function At(t) {
  return ot(Bt, { proxy: t });
}
function Ht({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (y, N, p, I, a) => t._mapFn(y, N, p, I, a)
  ) : null;
}
function Bt({
  proxy: t
}) {
  const c = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
    const g = c.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, p = Array.from(y.childNodes).indexOf(g);
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
    const G = document.createTextNode(String(f));
    g.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), ot("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ie(t) {
  const c = Nt(
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
function zt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: g
}) {
  const [, y] = Q({}), [N, p] = Rt(), I = Z(null);
  return et(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, r.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), it(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ ft("div", { ref: N, children: g });
}
export {
  At as $cogsSignal,
  ie as $cogsSignalStore,
  oe as addStateOptions,
  ae as createCogsState,
  se as notifyComponent,
  Wt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
