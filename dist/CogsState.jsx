"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as et, useRef as B, useEffect as lt, useLayoutEffect as dt, useMemo as It, createElement as ot, useSyncExternalStore as _t, startTransition as Mt, useCallback as At } from "react";
import { transformStateFunc as jt, isDeepEqual as H, isFunction as Y, getNestedValue as z, getDifferences as pt, debounce as Ot } from "./utility.js";
import { pushFunc as vt, updateFn as rt, cutFunc as ct, ValidationWrapper as Rt, FormControlComponent as Ft } from "./Functions.jsx";
import Ut from "superjson";
import { v4 as wt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Tt } from "./store.js";
import { useCogsConfig as Ct } from "./CogsStateClient.jsx";
import { applyPatch as Dt } from "fast-json-patch";
import Wt from "react-use-measure";
function $t(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function kt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = tt(t) || {}, y = m[t] || {}, $ = o.getState().setInitialStateOptions, w = { ...y, ...f };
  let p = !1;
  if (c)
    for (const a in c)
      w.hasOwnProperty(a) ? (a == "localStorage" && c[a] && w[a].key !== c[a]?.key && (p = !0, w[a] = c[a]), a == "initialState" && c[a] && w[a] !== c[a] && // Different references
      !H(w[a], c[a]) && (p = !0, w[a] = c[a])) : (p = !0, w[a] = c[a]);
  p && $(t, w);
}
function le(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const de = (t, c) => {
  let m = t;
  const [f, y] = jt(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((p) => {
    y[p] = y[p] || {}, y[p].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[p].formElements || {}
      // State-specific overrides
    }, tt(p) || o.getState().setInitialStateOptions(p, y[p]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const $ = (p, a) => {
    const [v] = et(a?.componentId ?? wt());
    kt({
      stateKey: p,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[p] || f[p], S = a?.modifyState ? a.modifyState(n) : n, [G, R] = Jt(
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
    return R;
  };
  function w(p, a) {
    kt({ stateKey: p, options: a, initialOptionsPart: y }), a.localStorage && Bt(p, a), St(p);
  }
  return { useCogsState: $, setCogsOptions: w };
}, {
  setUpdaterState: ut,
  setState: K,
  getInitialOptions: tt,
  getKeyState: Vt,
  getValidationErrors: Gt,
  setStateLog: Lt,
  updateInitialStateGlobal: Et,
  addValidationError: Ht,
  removeValidationError: J,
  setServerSyncActions: zt
} = o.getState(), Nt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const $ = Y(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if ($ && f) {
    const w = `${f}-${c}-${$}`;
    let p;
    try {
      p = ft(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? p
    }, v = Ut.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(v.json)
    );
  }
}, ft = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Bt = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = Ct(), y = Y(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const $ = ft(
      `${f}-${t}-${y}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return K(t, $.state), St(t), !0;
  }
  return !1;
}, xt = (t, c, m, f, y, $) => {
  const w = {
    initialState: c,
    updaterState: gt(
      t,
      f,
      y,
      $
    ),
    state: m
  };
  Et(t, w.initialState), ut(t, w.updaterState), K(t, w.state);
}, St = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, ue = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${c}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, qt = (t, c, m, f) => {
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
function Jt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: $,
  reactiveType: w,
  componentId: p,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [G, R] = et({}), { sessionId: F } = Ct();
  let L = !c;
  const [h] = et(c ?? wt()), l = o.getState().stateLog[h], at = B(/* @__PURE__ */ new Set()), Z = B(p ?? wt()), j = B(
    null
  );
  j.current = tt(h) ?? null, lt(() => {
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
  }, [v]), lt(() => {
    if (a) {
      $t(h, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !H(i, a) || !i) && !s)
        return;
      let g = null;
      const A = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      A && F && (g = ft(`${F}-${h}-${A}`));
      let E = a, T = !1;
      const x = s ? Date.now() : 0, b = g?.lastUpdated || 0, k = g?.lastSyncedWithServer || 0;
      s && x > b ? (E = e.serverState.data, T = !0) : g && b > k && (E = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(E)), o.getState().initializeShadowState(h, a), xt(
        h,
        a,
        E,
        nt,
        Z.current,
        F
      ), T && A && F && Nt(E, h, e, F, Date.now()), St(h), (Array.isArray(w) ? w : [w || "component"]).includes("none") || R({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), dt(() => {
    L && $t(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: j.current?.middleware
    });
    const e = `${h}////${Z.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), R({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const nt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const g = `${h}-${r.join(".")}`;
      at.current.add(g);
    }
    const u = o.getState();
    K(h, (g) => {
      const A = Y(e) ? e(g) : e, E = `${h}-${r.join(".")}`;
      if (E) {
        let M = !1, N = u.signalDomElements.get(E);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), D = z(A, O);
          if (Array.isArray(D)) {
            M = !0;
            const I = `${h}-${O.join(".")}`;
            N = u.signalDomElements.get(I);
          }
        }
        if (N) {
          const O = M ? z(A, r.slice(0, -1)) : z(A, r);
          N.forEach(({ parentId: D, position: I, effect: C }) => {
            const V = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (V) {
              const _ = Array.from(V.childNodes);
              if (_[I]) {
                const P = C ? new Function("state", `return (${C})(state)`)(O) : O;
                _[I].textContent = String(P);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && r && J(
        (i || j.current?.validation?.key) + "." + r.join(".")
      );
      const T = r.slice(0, r.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && J(
        j.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Gt(
        j.current?.validation?.key + "." + T.join(".")
      ).filter(([N, O]) => {
        let D = N?.split(".").length;
        if (N == T.join(".") && D == T.length - 1) {
          let I = N + "." + T;
          J(N), Ht(I, O);
        }
      });
      const x = u.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", x), x) {
        const M = pt(g, A), N = new Set(M), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          I
        ] of x.components.entries()) {
          let C = !1;
          const V = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (console.log("component", I), !V.includes("none")) {
            if (V.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (V.includes("component") && ((I.paths.has(O) || I.paths.has("")) && (C = !0), !C))
              for (const _ of N) {
                let P = _;
                for (; ; ) {
                  if (I.paths.has(P)) {
                    C = !0;
                    break;
                  }
                  const q = P.lastIndexOf(".");
                  if (q !== -1) {
                    const st = P.substring(
                      0,
                      q
                    );
                    if (!isNaN(
                      Number(P.substring(q + 1))
                    ) && I.paths.has(st)) {
                      C = !0;
                      break;
                    }
                    P = st;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (C) break;
              }
            if (!C && V.includes("deps") && I.depsFunction) {
              const _ = I.depsFunction(A);
              let P = !1;
              typeof _ == "boolean" ? _ && (P = !0) : H(I.deps, _) || (I.deps = _, P = !0), P && (C = !0);
            }
            C && I.forceUpdate();
          }
        }
      }
      const b = Date.now();
      r = r.map((M, N) => {
        const O = r.slice(0, -1), D = z(A, O);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : M;
      });
      const { oldValue: k, newValue: W } = qt(
        s.updateType,
        g,
        A,
        r
      ), U = {
        timeStamp: b,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: k,
        newValue: W
      };
      switch (s.updateType) {
        case "update":
          u.updateShadowAtPath(h, r, A);
          break;
        case "insert":
          const M = r.slice(0, -1);
          u.insertShadowArrayElement(h, M, W);
          break;
        case "cut":
          const N = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          u.removeShadowArrayElement(h, N, O);
          break;
      }
      if (Lt(h, (M) => {
        const O = [...M ?? [], U].reduce((D, I) => {
          const C = `${I.stateKey}:${JSON.stringify(I.path)}`, V = D.get(C);
          return V ? (V.timeStamp = Math.max(V.timeStamp, I.timeStamp), V.newValue = I.newValue, V.oldValue = V.oldValue ?? I.oldValue, V.updateType = I.updateType) : D.set(C, { ...I }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Nt(
        A,
        h,
        j.current,
        F
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: U
      }), j.current?.serverSync) {
        const M = u.serverState[h], N = j.current?.serverSync;
        zt(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: A }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  o.getState().updaterState[h] || (ut(
    h,
    gt(
      h,
      nt,
      Z.current,
      F
    )
  ), o.getState().cogsStateStore[h] || K(h, t), o.getState().initialStateGlobal[h] || Et(h, t));
  const d = It(() => gt(
    h,
    nt,
    Z.current,
    F
  ), [h, F]);
  return [Vt(h), d];
}
function gt(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let $ = 0;
  const w = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    $++;
  }, p = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), $++;
      const G = a(S, []), R = tt(t), F = Y(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, L = `${f}-${t}-${F}`;
      L && localStorage.removeItem(L), ut(t, G), K(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), $++;
      const n = gt(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], G = tt(t), R = Y(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, F = `${f}-${t}-${R}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Mt(() => {
        Et(t, v), o.getState().initializeShadowState(t, v), ut(t, n), K(t, v);
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
      return !!(v && H(v, Vt(t)));
    }
  };
  function a(v, n = [], S) {
    const G = n.map(String).join(".");
    y.get(G);
    const R = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(p).forEach((h) => {
      R[h] = p[h];
    });
    const F = {
      apply(h, l, at) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
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
          return () => pt(
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
                  const A = [s, ...g.path].join(".");
                  o.getState().addValidationError(A, g.message);
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
            const d = o.getState().initialStateGlobal[t], e = tt(t), r = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
              } = e, u = B(null), [g, A] = et({
                startIndex: 0,
                endIndex: 10
              }), E = B(i), T = B(0), x = B(!0), b = o().getNestedState(
                t,
                n
              ), k = b.length, { totalHeight: W, positions: U } = It(() => {
                const I = o.getState().getShadowMetadata(t, n) || [];
                let C = 0;
                const V = [];
                for (let _ = 0; _ < k; _++) {
                  V[_] = C;
                  const P = I[_]?.virtualizer?.itemHeight;
                  C += P || r;
                }
                return { totalHeight: C, positions: V };
              }, [k, t, n.join("."), r]), M = It(() => {
                const I = Math.max(0, g.startIndex), C = Math.min(k, g.endIndex), V = Array.from(
                  { length: C - I },
                  (P, q) => I + q
                ), _ = V.map((P) => b[P]);
                return a(_, n, {
                  ...S,
                  validIndices: V
                });
              }, [g.startIndex, g.endIndex, b, k]);
              dt(() => {
                const I = u.current;
                if (!I) return;
                const C = E.current, V = k > T.current;
                T.current = k;
                const _ = () => {
                  const { scrollTop: P, clientHeight: q, scrollHeight: st } = I;
                  E.current = st - P - q < 10;
                  let mt = 0, it = k - 1;
                  for (; mt <= it; ) {
                    const Q = Math.floor((mt + it) / 2);
                    U[Q] < P ? mt = Q + 1 : it = Q - 1;
                  }
                  const ht = Math.max(0, it - s);
                  let X = ht;
                  const Pt = P + q;
                  for (; X < k && U[X] < Pt; )
                    X++;
                  X = Math.min(k, X + s), A((Q) => Q.startIndex !== ht || Q.endIndex !== X ? { startIndex: ht, endIndex: X } : Q);
                };
                return I.addEventListener("scroll", _, {
                  passive: !0
                }), i ? x.current && k > 0 ? (setTimeout(() => {
                  u.current && u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: "auto"
                  });
                }, 0), x.current = !1) : C && V && requestAnimationFrame(() => {
                  I.scrollTo({
                    top: I.scrollHeight,
                    behavior: "smooth"
                  });
                }) : x.current = !1, _(), () => I.removeEventListener("scroll", _);
              }, [k, U, s, i]);
              const N = At(
                (I = "smooth") => {
                  u.current && u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: I
                  });
                },
                []
              ), O = At(
                (I, C = "smooth") => {
                  u.current && U[I] !== void 0 && u.current.scrollTo({
                    top: U[I],
                    behavior: C
                  });
                },
                [U]
              ), D = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${W}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${U[g.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: M,
                virtualizerProps: D,
                scrollToBottom: N,
                scrollToIndex: O
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (g, A) => e(g.item, A.item)
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
                ({ item: g }, A) => e(g, A)
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
                const g = r[i], A = [...n, i.toString()], E = a(g, A, S);
                return e(g, E, {
                  register: () => {
                    const [, x] = et({}), b = `${m}-${n.join(".")}-${i}`;
                    dt(() => {
                      const k = `${t}////${b}`, W = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return W.components.set(k, {
                        forceUpdate: () => x({}),
                        paths: /* @__PURE__ */ new Set([A.join(".")])
                      }), o.getState().stateComponents.set(t, W), () => {
                        const U = o.getState().stateComponents.get(t);
                        U && U.components.delete(k);
                      };
                    }, [t, b]);
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
              const g = [...n, u.toString()], A = a(s, g, S);
              return e(
                s,
                A,
                i,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ot(Yt, {
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
                const g = r[i], A = [...n, i.toString()], E = a(g, A, S), T = `${m}-${n.join(".")}-${i}`;
                return ot(Xt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: A,
                  children: e(
                    g,
                    E,
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
              y.clear(), $++;
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
            return (e) => (w(n), vt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), u = Y(e) ? e(i) : e;
              let g = null;
              if (!i.some((E) => {
                if (r) {
                  const x = r.every(
                    (b) => H(E[b], u[b])
                  );
                  return x && (g = E), x;
                }
                const T = H(E, u);
                return T && (g = E), T;
              }))
                w(n), vt(c, u, n, t);
              else if (s && g) {
                const E = s(g), T = i.map(
                  (x) => H(x, g) ? E : x
                );
                w(n), rt(c, T, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return w(n), ct(c, n, t, e), a(
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
              r > -1 ? ct(c, n, t, r) : vt(c, e, n, t);
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
        const Z = n[n.length - 1];
        if (!isNaN(Number(Z))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
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
          return (d) => ft(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            rt(c, i, e), w(e);
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
            rt(c, i, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Dt(e, d).newDocument;
              xt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const u = pt(e, s), g = new Set(u);
                for (const [
                  A,
                  E
                ] of i.components.entries()) {
                  let T = !1;
                  const x = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (E.paths.has("") && (T = !0), !T))
                      for (const b of g) {
                        if (E.paths.has(b)) {
                          T = !0;
                          break;
                        }
                        let k = b.lastIndexOf(".");
                        for (; k !== -1; ) {
                          const W = b.substring(0, k);
                          if (E.paths.has(W)) {
                            T = !0;
                            break;
                          }
                          const U = b.substring(
                            k + 1
                          );
                          if (!isNaN(Number(U))) {
                            const M = W.lastIndexOf(".");
                            if (M !== -1) {
                              const N = W.substring(
                                0,
                                M
                              );
                              if (E.paths.has(N)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          k = W.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && x.includes("deps") && E.depsFunction) {
                      const b = E.depsFunction(s);
                      let k = !1;
                      typeof b == "boolean" ? b && (k = !0) : H(E.deps, b) || (E.deps = b, k = !0), k && (T = !0);
                    }
                    T && E.forceUpdate();
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
                  const A = g.path, E = g.message, T = [d.key, ...A].join(".");
                  e(T, E);
                }), St(t), !1);
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
          }) => /* @__PURE__ */ yt(
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
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ot(() => {
                rt(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              rt(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ yt(
            Ft,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const j = [...n, l], nt = o.getState().getNestedState(t, j);
        return a(nt, j, S);
      }
    }, L = new Proxy(R, F);
    return y.set(G, {
      proxy: L,
      stateVersion: $
    }), L;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function bt(t) {
  return ot(Zt, { proxy: t });
}
function Yt({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (y, $, w, p, a) => t._mapFn(y, $, w, p, a)
  ) : null;
}
function Zt({
  proxy: t
}) {
  const c = B(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return lt(() => {
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
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const G = document.createTextNode(String(S));
    f.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), ot("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ge(t) {
  const c = _t(
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
  return ot("text", {}, String(c));
}
function Xt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = et({}), [$, w] = Wt(), p = B(null);
  return lt(() => {
    w.height > 0 && w.height !== p.current && (p.current = w.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, m]), dt(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ yt("div", { ref: $, children: f });
}
export {
  bt as $cogsSignal,
  ge as $cogsSignalStore,
  le as addStateOptions,
  de as createCogsState,
  ue as notifyComponent,
  Jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
