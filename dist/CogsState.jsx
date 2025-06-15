"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as K, useRef as Y, useEffect as at, useLayoutEffect as dt, useMemo as It, createElement as st, useSyncExternalStore as _t, startTransition as Mt, useCallback as Tt } from "react";
import { transformStateFunc as jt, isDeepEqual as H, isFunction as J, getNestedValue as z, getDifferences as pt, debounce as Ot } from "./utility.js";
import { pushFunc as vt, updateFn as ot, cutFunc as lt, ValidationWrapper as Ut, FormControlComponent as Rt } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as wt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as At } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
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
  const f = nt(t) || {}, y = m[t] || {}, b = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !H(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && b(t, p);
}
function le(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const de = (t, c) => {
  let m = t;
  const [f, y] = jt(m);
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
    const [v] = K(a?.componentId ?? wt());
    kt({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [W, R] = Jt(
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
    return R;
  };
  function p(I, a) {
    kt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Bt(I, a), St(I);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: ut,
  setState: tt,
  getInitialOptions: nt,
  getKeyState: Ct,
  getValidationErrors: Lt,
  setStateLog: Gt,
  updateInitialStateGlobal: Et,
  addValidationError: Ht,
  removeValidationError: q,
  setServerSyncActions: zt
} = o.getState(), bt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const b = J(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const p = `${f}-${c}-${b}`;
    let I;
    try {
      I = ft(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Ft.serialize(a);
    window.localStorage.setItem(
      p,
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
  const m = o.getState().cogsStateStore[t], { sessionId: f } = Vt(), y = J(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const b = ft(
      `${f}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return tt(t, b.state), St(t), !0;
  }
  return !1;
}, xt = (t, c, m, f, y, b) => {
  const p = {
    initialState: c,
    updaterState: gt(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  Et(t, p.initialState), ut(t, p.updaterState), tt(t, p.state);
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
  reactiveDeps: b,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [W, R] = K({}), { sessionId: F } = Vt();
  let L = !c;
  const [h] = K(c ?? wt()), l = o.getState().stateLog[h], it = Y(/* @__PURE__ */ new Set()), Z = Y(I ?? wt()), O = Y(
    null
  );
  O.current = nt(h) ?? null, at(() => {
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
  }, [v]), at(() => {
    if (a) {
      $t(h, {
        initialState: a
      });
      const e = O.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !H(i, a) || !i) && !s)
        return;
      let u = null;
      const E = J(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && F && (u = ft(`${F}-${h}-${E}`));
      let w = a, T = !1;
      const _ = s ? Date.now() : 0, x = u?.lastUpdated || 0, j = u?.lastSyncedWithServer || 0;
      s && _ > x ? (w = e.serverState.data, T = !0) : u && x > j && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), xt(
        h,
        a,
        w,
        rt,
        Z.current,
        F
      ), T && E && F && bt(w, h, e, F, Date.now()), St(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || R({});
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
      middleware: O.current?.middleware
    });
    const e = `${h}////${Z.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), R({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const rt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      it.current.add(u);
    }
    const g = o.getState();
    tt(h, (u) => {
      const E = J(e) ? e(u) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let V = !1, N = g.signalDomElements.get(w);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const U = r.slice(0, -1), D = z(E, U);
          if (Array.isArray(D)) {
            V = !0;
            const $ = `${h}-${U.join(".")}`;
            N = g.signalDomElements.get($);
          }
        }
        if (N) {
          const U = V ? z(E, r.slice(0, -1)) : z(E, r);
          N.forEach(({ parentId: D, position: $, effect: A }) => {
            const k = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (k) {
              const P = Array.from(k.childNodes);
              if (P[$]) {
                const C = A ? new Function("state", `return (${A})(state)`)(U) : U;
                P[$].textContent = String(C);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || O.current?.validation?.key) && r && q(
        (i || O.current?.validation?.key) + "." + r.join(".")
      );
      const T = r.slice(0, r.length - 1);
      s.updateType === "cut" && O.current?.validation?.key && q(
        O.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && O.current?.validation?.key && Lt(
        O.current?.validation?.key + "." + T.join(".")
      ).filter(([N, U]) => {
        let D = N?.split(".").length;
        if (N == T.join(".") && D == T.length - 1) {
          let $ = N + "." + T;
          q(N), Ht($, U);
        }
      });
      const _ = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const V = pt(u, E), N = new Set(V), U = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of _.components.entries()) {
          let A = !1;
          const k = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !k.includes("none")) {
            if (k.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (k.includes("component") && (($.paths.has(U) || $.paths.has("")) && (A = !0), !A))
              for (const P of N) {
                let C = P;
                for (; ; ) {
                  if ($.paths.has(C)) {
                    A = !0;
                    break;
                  }
                  const G = C.lastIndexOf(".");
                  if (G !== -1) {
                    const et = C.substring(
                      0,
                      G
                    );
                    if (!isNaN(
                      Number(C.substring(G + 1))
                    ) && $.paths.has(et)) {
                      A = !0;
                      break;
                    }
                    C = et;
                  } else
                    C = "";
                  if (C === "")
                    break;
                }
                if (A) break;
              }
            if (!A && k.includes("deps") && $.depsFunction) {
              const P = $.depsFunction(E);
              let C = !1;
              typeof P == "boolean" ? P && (C = !0) : H($.deps, P) || ($.deps = P, C = !0), C && (A = !0);
            }
            A && $.forceUpdate();
          }
        }
      }
      const x = Date.now();
      r = r.map((V, N) => {
        const U = r.slice(0, -1), D = z(E, U);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : V;
      });
      const { oldValue: j, newValue: M } = qt(
        s.updateType,
        u,
        E,
        r
      ), B = {
        timeStamp: x,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: j,
        newValue: M
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, r, E);
          break;
        case "insert":
          const V = r.slice(0, -1);
          g.insertShadowArrayElement(h, V, M);
          break;
        case "cut":
          const N = r.slice(0, -1), U = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, N, U);
          break;
      }
      if (Gt(h, (V) => {
        const U = [...V ?? [], B].reduce((D, $) => {
          const A = `${$.stateKey}:${JSON.stringify($.path)}`, k = D.get(A);
          return k ? (k.timeStamp = Math.max(k.timeStamp, $.timeStamp), k.newValue = $.newValue, k.oldValue = k.oldValue ?? $.oldValue, k.updateType = $.updateType) : D.set(A, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(U.values());
      }), bt(
        E,
        h,
        O.current,
        F
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: B
      }), O.current?.serverSync) {
        const V = g.serverState[h], N = O.current?.serverSync;
        zt(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: V,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[h] || (ut(
    h,
    gt(
      h,
      rt,
      Z.current,
      F
    )
  ), o.getState().cogsStateStore[h] || tt(h, t), o.getState().initialStateGlobal[h] || Et(h, t));
  const d = It(() => gt(
    h,
    rt,
    Z.current,
    F
  ), [h, F]);
  return [Ct(h), d];
}
function gt(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    b++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && q(n?.key), v?.validationKey && q(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const W = a(S, []), R = nt(t), F = J(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, L = `${f}-${t}-${F}`;
      L && localStorage.removeItem(L), ut(t, W), tt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = gt(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], W = nt(t), R = J(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, F = `${f}-${t}-${R}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Mt(() => {
        Et(t, v), o.getState().initializeShadowState(t, v), ut(t, n), tt(t, v);
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
      return !!(v && H(v, Ct(t)));
    }
  };
  function a(v, n = [], S) {
    const W = n.map(String).join(".");
    y.get(W);
    const R = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      R[h] = I[h];
    });
    const F = {
      apply(h, l, it) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
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
            const d = o.getState().initialStateGlobal[t], e = nt(t), r = J(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
              } = e, g = Y(null), [u, E] = K({
                startIndex: 0,
                endIndex: 10
              }), w = Y(i), T = Y(!0), [_, x] = K(0);
              at(() => o.getState().subscribeToShadowState(t, () => {
                x((k) => k + 1);
              }), [t]);
              const j = o().getNestedState(
                t,
                n
              ), M = j.length, { totalHeight: B, positions: V } = It(() => {
                const A = o.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const P = [];
                for (let C = 0; C < M; C++) {
                  P[C] = k;
                  const G = A[C]?.virtualizer?.itemHeight;
                  k += G || r;
                }
                return { totalHeight: k, positions: P };
              }, [
                M,
                t,
                n.join("."),
                r,
                _
              ]), N = It(() => {
                const A = Math.max(0, u.startIndex), k = Math.min(M, u.endIndex), P = Array.from(
                  { length: k - A },
                  (G, et) => A + et
                ), C = P.map((G) => j[G]);
                return a(C, n, {
                  ...S,
                  validIndices: P
                });
              }, [u.startIndex, u.endIndex, j, M]);
              dt(() => {
                const A = g.current;
                if (!A) return;
                const k = () => {
                  const { scrollTop: P, clientHeight: C, scrollHeight: G } = A, et = G - P - C < 1;
                  w.current = et;
                  let mt = 0, ct = M - 1;
                  for (; mt <= ct; ) {
                    const Q = Math.floor((mt + ct) / 2);
                    V[Q] < P ? mt = Q + 1 : ct = Q - 1;
                  }
                  const ht = Math.max(0, ct - s);
                  let X = ht;
                  const Pt = P + C;
                  for (; X < M && V[X] < Pt; )
                    X++;
                  X = Math.min(M, X + s), E((Q) => Q.startIndex !== ht || Q.endIndex !== X ? { startIndex: ht, endIndex: X } : Q);
                };
                if (A.addEventListener("scroll", k, {
                  passive: !0
                }), i && w.current) {
                  const P = T.current ? "auto" : "smooth";
                  A.scrollTo({
                    top: A.scrollHeight,
                    behavior: P
                  });
                }
                return queueMicrotask(() => {
                  T.current && (T.current = !1);
                }), k(), () => A.removeEventListener("scroll", k);
              }, [M, V, s, i]);
              const U = Tt(
                (A = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: A
                  });
                },
                []
              ), D = Tt(
                (A, k = "smooth") => {
                  g.current && V[A] !== void 0 && g.current.scrollTo({
                    top: V[A],
                    behavior: k
                  });
                },
                [V]
              ), $ = {
                outer: {
                  ref: g,
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
                    const [, _] = K({}), x = `${m}-${n.join(".")}-${i}`;
                    dt(() => {
                      const j = `${t}////${x}`, M = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return M.components.set(j, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, M), () => {
                        const B = o.getState().stateComponents.get(t);
                        B && B.components.delete(j);
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
            return (e) => st(Yt, {
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
                const u = r[i], E = [...n, i.toString()], w = a(u, E, S), T = `${m}-${n.join(".")}-${i}`;
                return st(Xt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: T,
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
            return (e) => (p(n), vt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = J(e) ? e(i) : e;
              let u = null;
              if (!i.some((w) => {
                if (r) {
                  const _ = r.every(
                    (x) => H(w[x], g[x])
                  );
                  return _ && (u = w), _;
                }
                const T = H(w, g);
                return T && (u = w), T;
              }))
                p(n), vt(c, g, n, t);
              else if (s && u) {
                const w = s(u), T = i.map(
                  (_) => H(_, u) ? w : _
                );
                p(n), ot(c, T, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), lt(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && lt(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? lt(c, n, t, r) : vt(c, e, n, t);
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
        const Z = n[n.length - 1];
        if (!isNaN(Number(Z))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => lt(
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
          return (d) => Nt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Nt({
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
            ot(c, i, e), p(e);
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
            ot(c, i, d), p(d);
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
                const g = pt(e, s), u = new Set(g);
                for (const [
                  E,
                  w
                ] of i.components.entries()) {
                  let T = !1;
                  const _ = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (w.paths.has("") && (T = !0), !T))
                      for (const x of u) {
                        if (w.paths.has(x)) {
                          T = !0;
                          break;
                        }
                        let j = x.lastIndexOf(".");
                        for (; j !== -1; ) {
                          const M = x.substring(0, j);
                          if (w.paths.has(M)) {
                            T = !0;
                            break;
                          }
                          const B = x.substring(
                            j + 1
                          );
                          if (!isNaN(Number(B))) {
                            const V = M.lastIndexOf(".");
                            if (V !== -1) {
                              const N = M.substring(
                                0,
                                V
                              );
                              if (w.paths.has(N)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          j = M.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && _.includes("deps") && w.depsFunction) {
                      const x = w.depsFunction(s);
                      let j = !1;
                      typeof x == "boolean" ? x && (j = !0) : H(w.deps, x) || (w.deps = x, j = !0), j && (T = !0);
                    }
                    T && w.forceUpdate();
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
              q(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && q(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const E = u.path, w = u.message, T = [d.key, ...E].join(".");
                  e(T, w);
                }), St(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => At.getState().getFormRefsByStateKey(t);
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
          return () => At.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ yt(
            Ut,
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
              Ot(() => {
                ot(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              ot(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ yt(
            Rt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const O = [...n, l], rt = o.getState().getNestedState(t, O);
        return a(rt, O, S);
      }
    }, L = new Proxy(R, F);
    return y.set(W, {
      proxy: L,
      stateVersion: b
    }), L;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Nt(t) {
  return st(Zt, { proxy: t });
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
    (y, b, p, I, a) => t._mapFn(y, b, p, I, a)
  ) : null;
}
function Zt({
  proxy: t
}) {
  const c = Y(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return at(() => {
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
    const W = document.createTextNode(String(S));
    f.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
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
  return st("text", {}, String(c));
}
function Xt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = K({}), [b, p] = Wt(), I = Y(null);
  return at(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), dt(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ yt("div", { ref: b, children: f });
}
export {
  Nt as $cogsSignal,
  ge as $cogsSignalStore,
  le as addStateOptions,
  de as createCogsState,
  ue as notifyComponent,
  Jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
