"use client";
import { jsx as ht } from "react/jsx-runtime";
import { useState as K, useRef as Z, useEffect as nt, useLayoutEffect as lt, useMemo as vt, createElement as at, useSyncExternalStore as Pt, startTransition as _t, useCallback as At } from "react";
import { transformStateFunc as Mt, isDeepEqual as B, isFunction as Y, getNestedValue as z, getDifferences as It, debounce as Ot } from "./utility.js";
import { pushFunc as mt, updateFn as ot, cutFunc as ct, ValidationWrapper as Rt, FormControlComponent as Ut } from "./Functions.jsx";
import jt from "superjson";
import { v4 as yt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as Tt } from "./store.js";
import { useCogsConfig as bt } from "./CogsStateClient.jsx";
import { applyPatch as Lt } from "fast-json-patch";
import Dt from "react-use-measure";
function Et(t, i) {
  const m = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, I = m(t) || {};
  f(t, {
    ...I,
    ...i
  });
}
function $t({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const f = et(t) || {}, I = m[t] || {}, b = r.getState().setInitialStateOptions, p = { ...I, ...f };
  let y = !1;
  if (i)
    for (const a in i)
      p.hasOwnProperty(a) ? (a == "localStorage" && i[a] && p[a].key !== i[a]?.key && (y = !0, p[a] = i[a]), a == "initialState" && i[a] && p[a] !== i[a] && // Different references
      !B(p[a], i[a]) && (y = !0, p[a] = i[a])) : (y = !0, p[a] = i[a]);
  y && b(t, p);
}
function ce(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const le = (t, i) => {
  let m = t;
  const [f, I] = Mt(m);
  (Object.keys(I).length > 0 || i && Object.keys(i).length > 0) && Object.keys(I).forEach((y) => {
    I[y] = I[y] || {}, I[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...I[y].formElements || {}
      // State-specific overrides
    }, et(y) || r.getState().setInitialStateOptions(y, I[y]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const b = (y, a) => {
    const [v] = K(a?.componentId ?? yt());
    $t({
      stateKey: y,
      options: a,
      initialOptionsPart: I
    });
    const n = r.getState().cogsStateStore[y] || f[y], S = a?.modifyState ? a.modifyState(n) : n, [F, j] = qt(
      S,
      {
        stateKey: y,
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
  function p(y, a) {
    $t({ stateKey: y, options: a, initialOptionsPart: I }), a.localStorage && Bt(y, a), ft(y);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: dt,
  setState: tt,
  getInitialOptions: et,
  getKeyState: Nt,
  getValidationErrors: Ft,
  setStateLog: Gt,
  updateInitialStateGlobal: pt,
  addValidationError: Wt,
  removeValidationError: J,
  setServerSyncActions: Ht
} = r.getState(), kt = (t, i, m, f, I) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    f
  );
  const b = Y(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const p = `${f}-${i}-${b}`;
    let y;
    try {
      y = gt(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? y
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
  const m = r.getState().cogsStateStore[t], { sessionId: f } = bt(), I = Y(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (I && f) {
    const b = gt(
      `${f}-${t}-${I}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return tt(t, b.state), ft(t), !0;
  }
  return !1;
}, xt = (t, i, m, f, I, b) => {
  const p = {
    initialState: i,
    updaterState: ut(
      t,
      f,
      I,
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
    const f = `${t}////${i}`, I = m.components.get(f);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, zt = (t, i, m, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: z(i, f),
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
        oldValue: z(i, f),
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
  formElements: I,
  reactiveDeps: b,
  reactiveType: p,
  componentId: y,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [F, j] = K({}), { sessionId: L } = bt();
  let G = !i;
  const [h] = K(i ?? yt()), l = r.getState().stateLog[h], st = Z(/* @__PURE__ */ new Set()), X = Z(y ?? yt()), R = Z(
    null
  );
  R.current = et(h) ?? null, nt(() => {
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
  }, [v]), nt(() => {
    if (a) {
      Et(h, {
        initialState: a
      });
      const e = R.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[h];
      if (!(c && !B(c, a) || !c) && !s)
        return;
      let u = null;
      const T = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && L && (u = gt(`${L}-${h}-${T}`));
      let w = a, E = !1;
      const M = s ? Date.now() : 0, P = u?.lastUpdated || 0, O = u?.lastSyncedWithServer || 0;
      s && M > P ? (w = e.serverState.data, E = !0) : u && P > O && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), r.getState().initializeShadowState(h, a), xt(
        h,
        a,
        w,
        rt,
        X.current,
        L
      ), E && T && L && kt(w, h, e, L, Date.now()), ft(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || j({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), lt(() => {
    G && Et(h, {
      serverSync: m,
      formElements: I,
      initialState: a,
      localStorage: f,
      middleware: R.current?.middleware
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
  const rt = (e, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${h}-${o.join(".")}`;
      st.current.add(u);
    }
    const g = r.getState();
    tt(h, (u) => {
      const T = Y(e) ? e(u) : e, w = `${h}-${o.join(".")}`;
      if (w) {
        let V = !1, N = g.signalDomElements.get(w);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const U = o.slice(0, -1), D = z(T, U);
          if (Array.isArray(D)) {
            V = !0;
            const $ = `${h}-${U.join(".")}`;
            N = g.signalDomElements.get($);
          }
        }
        if (N) {
          const U = V ? z(T, o.slice(0, -1)) : z(T, o);
          N.forEach(({ parentId: D, position: $, effect: A }) => {
            const k = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (k) {
              const _ = Array.from(k.childNodes);
              if (_[$]) {
                const C = A ? new Function("state", `return (${A})(state)`)(U) : U;
                _[$].textContent = String(C);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (c || R.current?.validation?.key) && o && J(
        (c || R.current?.validation?.key) + "." + o.join(".")
      );
      const E = o.slice(0, o.length - 1);
      s.updateType === "cut" && R.current?.validation?.key && J(
        R.current?.validation?.key + "." + E.join(".")
      ), s.updateType === "insert" && R.current?.validation?.key && Ft(
        R.current?.validation?.key + "." + E.join(".")
      ).filter(([N, U]) => {
        let D = N?.split(".").length;
        if (N == E.join(".") && D == E.length - 1) {
          let $ = N + "." + E;
          J(N), Wt($, U);
        }
      });
      const M = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", M), M) {
        const V = It(u, T), N = new Set(V), U = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of M.components.entries()) {
          let A = !1;
          const k = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !k.includes("none")) {
            if (k.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (k.includes("component") && (($.paths.has(U) || $.paths.has("")) && (A = !0), !A))
              for (const _ of N) {
                let C = _;
                for (; ; ) {
                  if ($.paths.has(C)) {
                    A = !0;
                    break;
                  }
                  const W = C.lastIndexOf(".");
                  if (W !== -1) {
                    const q = C.substring(
                      0,
                      W
                    );
                    if (!isNaN(
                      Number(C.substring(W + 1))
                    ) && $.paths.has(q)) {
                      A = !0;
                      break;
                    }
                    C = q;
                  } else
                    C = "";
                  if (C === "")
                    break;
                }
                if (A) break;
              }
            if (!A && k.includes("deps") && $.depsFunction) {
              const _ = $.depsFunction(T);
              let C = !1;
              typeof _ == "boolean" ? _ && (C = !0) : B($.deps, _) || ($.deps = _, C = !0), C && (A = !0);
            }
            A && $.forceUpdate();
          }
        }
      }
      const P = Date.now();
      o = o.map((V, N) => {
        const U = o.slice(0, -1), D = z(T, U);
        return N === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : V;
      });
      const { oldValue: O, newValue: x } = zt(
        s.updateType,
        u,
        T,
        o
      ), H = {
        timeStamp: P,
        stateKey: h,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: O,
        newValue: x
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, o, T);
          break;
        case "insert":
          const V = o.slice(0, -1);
          g.insertShadowArrayElement(h, V, x);
          break;
        case "cut":
          const N = o.slice(0, -1), U = parseInt(o[o.length - 1]);
          g.removeShadowArrayElement(h, N, U);
          break;
      }
      if (Gt(h, (V) => {
        const U = [...V ?? [], H].reduce((D, $) => {
          const A = `${$.stateKey}:${JSON.stringify($.path)}`, k = D.get(A);
          return k ? (k.timeStamp = Math.max(k.timeStamp, $.timeStamp), k.newValue = $.newValue, k.oldValue = k.oldValue ?? $.oldValue, k.updateType = $.updateType) : D.set(A, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(U.values());
      }), kt(
        T,
        h,
        R.current,
        L
      ), R.current?.middleware && R.current.middleware({
        updateLog: l,
        update: H
      }), R.current?.serverSync) {
        const V = g.serverState[h], N = R.current?.serverSync;
        Ht(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: T }),
          rollBackState: V,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  r.getState().updaterState[h] || (dt(
    h,
    ut(
      h,
      rt,
      X.current,
      L
    )
  ), r.getState().cogsStateStore[h] || tt(h, t), r.getState().initialStateGlobal[h] || pt(h, t));
  const d = vt(() => ut(
    h,
    rt,
    X.current,
    L
  ), [h, L]);
  return [Nt(h), d];
}
function ut(t, i, m, f) {
  const I = /* @__PURE__ */ new Map();
  let b = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of I)
      (S === n || S.startsWith(n + ".")) && I.delete(S);
    b++;
  }, y = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), I.clear(), b++;
      const F = a(S, []), j = et(t), L = Y(j?.localStorage?.key) ? j?.localStorage?.key(S) : j?.localStorage?.key, G = `${f}-${t}-${L}`;
      G && localStorage.removeItem(G), dt(t, F), tt(t, S);
      const h = r.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      I.clear(), b++;
      const n = ut(
        t,
        i,
        m,
        f
      ), S = r.getState().initialStateGlobal[t], F = et(t), j = Y(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, L = `${f}-${t}-${j}`;
      return localStorage.getItem(L) && localStorage.removeItem(L), _t(() => {
        pt(t, v), r.getState().initializeShadowState(t, v), dt(t, n), tt(t, v);
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
  function a(v, n = [], S) {
    const F = n.map(String).join(".");
    I.get(F);
    const j = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(y).forEach((h) => {
      j[h] = y[h];
    });
    const L = {
      apply(h, l, st) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
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
          return () => It(
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
                  const T = [s, ...u.path].join(".");
                  r.getState().addValidationError(T, u.message);
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
              } = e, g = Z(null), [u, T] = K({
                startIndex: 0,
                endIndex: 10
              }), w = Z(c), E = Z(!1), [M, P] = K(0);
              nt(() => r.getState().subscribeToShadowState(t, () => {
                P((k) => k + 1);
              }), [t]);
              const O = r().getNestedState(
                t,
                n
              ), x = O.length, { totalHeight: H, positions: V } = vt(() => {
                const A = r.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const _ = [];
                for (let C = 0; C < x; C++) {
                  _[C] = k;
                  const W = A[C]?.virtualizer?.itemHeight;
                  k += W || o;
                }
                return { totalHeight: k, positions: _ };
              }, [
                x,
                t,
                n.join("."),
                o,
                M
              ]), N = vt(() => {
                const A = Math.max(0, u.startIndex), k = Math.min(x, u.endIndex), _ = Array.from(
                  { length: k - A },
                  (W, q) => A + q
                ), C = _.map((W) => O[W]);
                return a(C, n, {
                  ...S,
                  validIndices: _
                });
              }, [u.startIndex, u.endIndex, O, x]);
              lt(() => {
                const A = g.current;
                if (!A || !w.current || x === 0)
                  return;
                console.log("ALGORITHM: Starting..."), T({
                  startIndex: Math.max(0, x - 10 - s),
                  endIndex: x
                }), console.log(
                  "ALGORITHM: Starting LOOP to wait for measurement."
                );
                let _ = 0;
                const C = setInterval(() => {
                  _++, console.log(`LOOP ${_}: Checking last item...`);
                  const W = x - 1, Q = (r.getState().getShadowMetadata(t, n) || [])[W]?.virtualizer?.itemHeight || 0;
                  Q > 0 ? (console.log(
                    `%cSUCCESS: Last item height is ${Q}. Scrolling now.`,
                    "color: green; font-weight: bold;"
                  ), clearInterval(C), E.current = !0, A.scrollTo({
                    top: A.scrollHeight,
                    behavior: "smooth"
                  }), setTimeout(() => {
                    E.current = !1;
                  }, 1e3)) : (console.log("...WAITING. Height is not ready."), _ > 20 && (console.error(
                    "LOOP TIMEOUT: Last item was never measured. Stopping loop."
                  ), clearInterval(C)));
                }, 100);
                return () => {
                  console.log("ALGORITHM: Cleaning up loop."), clearInterval(C);
                };
              }, [x, H, ...e.dependencies ?? []]), nt(() => {
                const A = g.current;
                if (!A) return;
                const k = () => {
                  const { scrollTop: C, clientHeight: W } = A;
                  let q = 0, Q = x - 1;
                  for (; q <= Q; ) {
                    const St = Math.floor((q + Q) / 2);
                    V[St] < C ? q = St + 1 : Q = St - 1;
                  }
                  const wt = Math.max(0, Q - s);
                  let it = wt;
                  const Vt = C + W;
                  for (; it < x && V[it] < Vt; )
                    it++;
                  T({
                    startIndex: wt,
                    endIndex: Math.min(x, it + s)
                  });
                }, _ = () => {
                  if (E.current)
                    return;
                  A.scrollHeight - A.scrollTop - A.clientHeight < 1 || (w.current = !1, console.log("USER ACTION: Scroll lock DISABLED.")), k();
                };
                return A.addEventListener("scroll", _, {
                  passive: !0
                }), k(), () => A.removeEventListener("scroll", _);
              }, [x, V]);
              const U = At(
                (A = "smooth") => {
                  g.current && (w.current = !0, console.log("USER ACTION: Scroll lock ENABLED."), g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: A
                  }));
                },
                []
              ), D = At(
                (A, k = "smooth") => {
                  g.current && V[A] !== void 0 && (w.current = !1, console.log("USER ACTION: Scroll lock DISABLED."), g.current.scrollTo({
                    top: V[A],
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
                    height: `${H}px`,
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
                virtualState: N,
                virtualizerProps: $,
                scrollToBottom: U,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, T) => e(u.item, T.item)
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
                ({ item: u }, T) => e(u, T)
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
                const u = o[c], T = [...n, c.toString()], w = a(u, T, S);
                return e(u, w, {
                  register: () => {
                    const [, M] = K({}), P = `${m}-${n.join(".")}-${c}`;
                    lt(() => {
                      const O = `${t}////${P}`, x = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return x.components.set(O, {
                        forceUpdate: () => M({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), r.getState().stateComponents.set(t, x), () => {
                        const H = r.getState().stateComponents.get(t);
                        H && H.components.delete(O);
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
              const u = [...n, g.toString()], T = a(s, u, S);
              return e(
                s,
                T,
                c,
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
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, g) => g)).map((c, g) => {
                const u = o[c], T = [...n, c.toString()], w = a(u, T, S), E = `${m}-${n.join(".")}-${c}`;
                return at(Zt, {
                  key: c,
                  stateKey: t,
                  itemComponentId: E,
                  itemPath: T,
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
              I.clear(), b++;
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
                    (P) => B(w[P], g[P])
                  );
                  return M && (u = w), M;
                }
                const E = B(w, g);
                return E && (u = w), E;
              }))
                p(n), mt(i, g, n, t);
              else if (s && u) {
                const w = s(u), E = c.map(
                  (M) => B(M, u) ? w : M
                );
                p(n), ot(i, E, n);
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
          return (d) => Ct({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Ct({
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
            ot(i, c, e), p(e);
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
            ot(i, c, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], s = Lt(e, d).newDocument;
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
                const g = It(e, s), u = new Set(g);
                for (const [
                  T,
                  w
                ] of c.components.entries()) {
                  let E = !1;
                  const M = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!M.includes("none")) {
                    if (M.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (M.includes("component") && (w.paths.has("") && (E = !0), !E))
                      for (const P of u) {
                        if (w.paths.has(P)) {
                          E = !0;
                          break;
                        }
                        let O = P.lastIndexOf(".");
                        for (; O !== -1; ) {
                          const x = P.substring(0, O);
                          if (w.paths.has(x)) {
                            E = !0;
                            break;
                          }
                          const H = P.substring(
                            O + 1
                          );
                          if (!isNaN(Number(H))) {
                            const V = x.lastIndexOf(".");
                            if (V !== -1) {
                              const N = x.substring(
                                0,
                                V
                              );
                              if (w.paths.has(N)) {
                                E = !0;
                                break;
                              }
                            }
                          }
                          O = x.lastIndexOf(".");
                        }
                        if (E) break;
                      }
                    if (!E && M.includes("deps") && w.depsFunction) {
                      const P = w.depsFunction(s);
                      let O = !1;
                      typeof P == "boolean" ? P && (O = !0) : B(w.deps, P) || (w.deps = P, O = !0), O && (E = !0);
                    }
                    E && w.forceUpdate();
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
                  const T = u.path, w = u.message, E = [d.key, ...T].join(".");
                  e(E, w);
                }), ft(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Tt.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return r.getState().serverState[t];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return y.revertToInitialState;
          if (l === "updateInitialState") return y.updateInitialState;
          if (l === "removeValidation") return y.removeValidation;
        }
        if (l === "getFormRef")
          return () => Tt.getState().getFormRef(t + "." + n.join("."));
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
        if (l === "_isServerSynced") return y._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ot(() => {
                ot(i, d, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              ot(i, d, n, "");
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
        const R = [...n, l], rt = r.getState().getNestedState(t, R);
        return a(rt, R, S);
      }
    }, G = new Proxy(j, L);
    return I.set(F, {
      proxy: G,
      stateVersion: b
    }), G;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function Ct(t) {
  return at(Yt, { proxy: t });
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
    (I, b, p, y, a) => t._mapFn(I, b, p, y, a)
  ) : null;
}
function Yt({
  proxy: t
}) {
  const i = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const I = f.parentElement, p = Array.from(I.childNodes).indexOf(f);
    let y = I.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", y));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
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
    const F = document.createTextNode(String(S));
    f.replaceWith(F);
  }, [t._stateKey, t._path.join("."), t._effect]), at("span", {
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
  return at("text", {}, String(i));
}
function Zt({
  stateKey: t,
  itemComponentId: i,
  itemPath: m,
  children: f
}) {
  const [, I] = K({}), [b, p] = Dt(), y = Z(null);
  return nt(() => {
    p.height > 0 && p.height !== y.current && (y.current = p.height, r.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), lt(() => {
    const a = `${t}////${i}`, v = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), r.getState().stateComponents.set(t, v), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, i, m.join(".")]), /* @__PURE__ */ ht("div", { ref: b, children: f });
}
export {
  Ct as $cogsSignal,
  ue as $cogsSignalStore,
  ce as addStateOptions,
  le as createCogsState,
  de as notifyComponent,
  qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
