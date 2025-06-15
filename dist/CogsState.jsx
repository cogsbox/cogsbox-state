"use client";
import { jsx as pt } from "react/jsx-runtime";
import { useState as et, useRef as q, useEffect as it, useLayoutEffect as gt, useMemo as wt, createElement as ct, useSyncExternalStore as Rt, startTransition as Ut, useCallback as kt } from "react";
import { transformStateFunc as Ft, isDeepEqual as z, isFunction as X, getNestedValue as J, getDifferences as Tt, debounce as Gt } from "./utility.js";
import { pushFunc as It, updateFn as st, cutFunc as ut, ValidationWrapper as Dt, FormControlComponent as Wt } from "./Functions.jsx";
import Lt from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as bt } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { applyPatch as Ht } from "fast-json-patch";
import Bt from "react-use-measure";
function Nt(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function Ct({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = rt(t) || {}, y = m[t] || {}, b = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !z(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && b(t, p);
}
function fe(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const Se = (t, c) => {
  let m = t;
  const [f, y] = Ft(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, rt(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const b = (I, a) => {
    const [v] = et(a?.componentId ?? At());
    Ct({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [D, O] = Qt(
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
    return O;
  };
  function p(I, a) {
    Ct({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Zt(I, a), ht(I);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: ft,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: _t,
  getValidationErrors: zt,
  setStateLog: qt,
  updateInitialStateGlobal: Et,
  addValidationError: Jt,
  removeValidationError: Z,
  setServerSyncActions: Yt
} = o.getState(), Vt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const b = X(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const p = `${f}-${c}-${b}`;
    let I;
    try {
      I = mt(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Lt.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
    );
  }
}, mt = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Zt = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = Pt(), y = X(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const b = mt(
      `${f}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return nt(t, b.state), ht(t), !0;
  }
  return !1;
}, Mt = (t, c, m, f, y, b) => {
  const p = {
    initialState: c,
    updaterState: St(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  Et(t, p.initialState), ft(t, p.updaterState), nt(t, p.state);
}, ht = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, me = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${c}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Xt = (t, c, m, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: J(c, f),
        newValue: J(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: J(m, f)
      };
    case "cut":
      return {
        oldValue: J(c, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Qt(t, {
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
  const [D, O] = et({}), { sessionId: R } = Pt();
  let W = !c;
  const [h] = et(c ?? At()), l = o.getState().stateLog[h], lt = q(/* @__PURE__ */ new Set()), Q = q(I ?? At()), _ = q(
    null
  );
  _.current = rt(h) ?? null, it(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      nt(h, (r) => ({
        ...r,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), it(() => {
    if (a) {
      Nt(h, {
        initialState: a
      });
      const e = _.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !z(i, a) || !i) && !s)
        return;
      let u = null;
      const T = X(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && R && (u = mt(`${R}-${h}-${T}`));
      let w = a, A = !1;
      const P = s ? Date.now() : 0, V = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      s && P > V ? (w = e.serverState.data, A = !0) : u && V > M && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), Mt(
        h,
        a,
        w,
        ot,
        Q.current,
        R
      ), A && T && R && Vt(w, h, e, R, Date.now()), ht(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), gt(() => {
    W && Nt(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: _.current?.middleware
    });
    const e = `${h}////${Q.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), O({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const ot = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      lt.current.add(u);
    }
    const g = o.getState();
    nt(h, (u) => {
      const T = X(e) ? e(u) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let N = !1, k = g.signalDomElements.get(w);
        if ((!k || k.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const x = r.slice(0, -1), F = J(T, x);
          if (Array.isArray(F)) {
            N = !0;
            const E = `${h}-${x.join(".")}`;
            k = g.signalDomElements.get(E);
          }
        }
        if (k) {
          const x = N ? J(T, r.slice(0, -1)) : J(T, r);
          k.forEach(({ parentId: F, position: E, effect: U }) => {
            const j = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if (j) {
              const $ = Array.from(j.childNodes);
              if ($[E]) {
                const C = U ? new Function("state", `return (${U})(state)`)(x) : x;
                $[E].textContent = String(C);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || _.current?.validation?.key) && r && Z(
        (i || _.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      s.updateType === "cut" && _.current?.validation?.key && Z(
        _.current?.validation?.key + "." + A.join(".")
      ), s.updateType === "insert" && _.current?.validation?.key && zt(
        _.current?.validation?.key + "." + A.join(".")
      ).filter(([k, x]) => {
        let F = k?.split(".").length;
        if (k == A.join(".") && F == A.length - 1) {
          let E = k + "." + A;
          Z(k), Jt(E, x);
        }
      });
      const P = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const N = Tt(u, T), k = new Set(N), x = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          F,
          E
        ] of P.components.entries()) {
          let U = !1;
          const j = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !j.includes("none")) {
            if (j.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (j.includes("component") && ((E.paths.has(x) || E.paths.has("")) && (U = !0), !U))
              for (const $ of k) {
                let C = $;
                for (; ; ) {
                  if (E.paths.has(C)) {
                    U = !0;
                    break;
                  }
                  const L = C.lastIndexOf(".");
                  if (L !== -1) {
                    const B = C.substring(
                      0,
                      L
                    );
                    if (!isNaN(
                      Number(C.substring(L + 1))
                    ) && E.paths.has(B)) {
                      U = !0;
                      break;
                    }
                    C = B;
                  } else
                    C = "";
                  if (C === "")
                    break;
                }
                if (U) break;
              }
            if (!U && j.includes("deps") && E.depsFunction) {
              const $ = E.depsFunction(T);
              let C = !1;
              typeof $ == "boolean" ? $ && (C = !0) : z(E.deps, $) || (E.deps = $, C = !0), C && (U = !0);
            }
            U && E.forceUpdate();
          }
        }
      }
      const V = Date.now();
      r = r.map((N, k) => {
        const x = r.slice(0, -1), F = J(T, x);
        return k === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (F.length - 1).toString() : N;
      });
      const { oldValue: M, newValue: G } = Xt(
        s.updateType,
        u,
        T,
        r
      ), H = {
        timeStamp: V,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: G
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, r, T);
          break;
        case "insert":
          const N = r.slice(0, -1);
          g.insertShadowArrayElement(h, N, G);
          break;
        case "cut":
          const k = r.slice(0, -1), x = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, k, x);
          break;
      }
      if (qt(h, (N) => {
        const x = [...N ?? [], H].reduce((F, E) => {
          const U = `${E.stateKey}:${JSON.stringify(E.path)}`, j = F.get(U);
          return j ? (j.timeStamp = Math.max(j.timeStamp, E.timeStamp), j.newValue = E.newValue, j.oldValue = j.oldValue ?? E.oldValue, j.updateType = E.updateType) : F.set(U, { ...E }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), Vt(
        T,
        h,
        _.current,
        R
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: H
      }), _.current?.serverSync) {
        const N = g.serverState[h], k = _.current?.serverSync;
        Yt(h, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: T }),
          rollBackState: N,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  o.getState().updaterState[h] || (ft(
    h,
    St(
      h,
      ot,
      Q.current,
      R
    )
  ), o.getState().cogsStateStore[h] || nt(h, t), o.getState().initialStateGlobal[h] || Et(h, t));
  const d = wt(() => St(
    h,
    ot,
    Q.current,
    R
  ), [h, R]);
  return [_t(h), d];
}
function St(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    b++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && Z(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Z(n?.key), v?.validationKey && Z(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const D = a(S, []), O = rt(t), R = X(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, W = `${f}-${t}-${R}`;
      W && localStorage.removeItem(W), ft(t, D), nt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = St(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], D = rt(t), O = X(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, R = `${f}-${t}-${O}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Ut(() => {
        Et(t, v), o.getState().initializeShadowState(t, v), ft(t, n), nt(t, v);
        const W = o.getState().stateComponents.get(t);
        W && W.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (W) => n.get()[W]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = o.getState().serverState[t];
      return !!(v && z(v, _t(t)));
    }
  };
  function a(v, n = [], S) {
    const D = n.map(String).join(".");
    y.get(D);
    const O = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      O[h] = I[h];
    });
    const R = {
      apply(h, l, lt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const lt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !lt.has(l)) {
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
          return () => Tt(
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
                  const T = [s, ...u.path].join(".");
                  o.getState().addValidationError(T, u.message);
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
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = J(e, n);
          return z(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = J(e, n);
            return z(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = rt(t), r = X(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
              } = e, g = q(null), [u, T] = et({
                startIndex: 0,
                endIndex: 10
              }), w = q(i), A = q(0), P = q(!0), V = q(0), [M, G] = et(0);
              it(() => o.getState().subscribeToShadowState(t, () => {
                G((C) => C + 1);
              }), [t]);
              const H = o().getNestedState(
                t,
                n
              ), N = H.length, { totalHeight: k, positions: x } = wt(() => {
                const $ = o.getState().getShadowMetadata(t, n) || [];
                let C = 0;
                const L = [];
                for (let B = 0; B < N; B++) {
                  L[B] = C;
                  const Y = $[B]?.virtualizer?.itemHeight;
                  C += Y || r;
                }
                return { totalHeight: C, positions: L };
              }, [
                N,
                t,
                n.join("."),
                r,
                M
              ]);
              console.log("height", k);
              const F = wt(() => {
                const $ = Math.max(0, u.startIndex), C = Math.min(N, u.endIndex), L = Array.from(
                  { length: C - $ },
                  (Y, at) => $ + at
                ), B = L.map((Y) => H[Y]);
                return a(B, n, {
                  ...S,
                  validIndices: L
                });
              }, [u.startIndex, u.endIndex, H, N]);
              gt(() => {
                const $ = g.current;
                if (!$) return;
                const C = w.current, L = N > A.current, B = k > V.current;
                A.current = N, V.current = k;
                const Y = () => {
                  const { scrollTop: at, clientHeight: $t, scrollHeight: jt } = $;
                  w.current = jt - at - $t < 30;
                  let vt = 0, dt = N - 1;
                  for (; vt <= dt; ) {
                    const tt = Math.floor((vt + dt) / 2);
                    x[tt] < at ? vt = tt + 1 : dt = tt - 1;
                  }
                  const yt = Math.max(0, dt - s);
                  let K = yt;
                  const Ot = at + $t;
                  for (; K < N && x[K] < Ot; )
                    K++;
                  K = Math.min(N, K + s), T((tt) => tt.startIndex !== yt || tt.endIndex !== K ? { startIndex: yt, endIndex: K } : tt);
                };
                return $.addEventListener("scroll", Y, {
                  passive: !0
                }), i && (P.current ? (console.log(
                  "stickToBottom initial mount",
                  $.scrollHeight
                ), $.scrollTo({
                  top: $.scrollHeight,
                  behavior: "auto"
                }), P.current = !1) : C && (L || B) && (console.log(
                  "stickToBottom wasAtBottom && listGrew",
                  $.scrollHeight
                ), requestAnimationFrame(() => {
                  $.scrollTo({
                    top: $.scrollHeight,
                    behavior: "smooth"
                  });
                }))), console.log("wasAtBottom && listGrew", C, L), Y(), () => $.removeEventListener("scroll", Y);
              }, [N, x, s, i]);
              const E = kt(
                ($ = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: $
                  });
                },
                []
              ), U = kt(
                ($, C = "smooth") => {
                  g.current && x[$] !== void 0 && g.current.scrollTo({
                    top: x[$],
                    behavior: C
                  });
                },
                [x]
              ), j = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${k}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${x[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: F,
                virtualizerProps: j,
                scrollToBottom: E,
                scrollToIndex: U
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, T) => e(u.item, T.item)
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
                ({ item: u }, T) => e(u, T)
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
                const u = r[i], T = [...n, i.toString()], w = a(u, T, S);
                return e(u, w, {
                  register: () => {
                    const [, P] = et({}), V = `${m}-${n.join(".")}-${i}`;
                    gt(() => {
                      const M = `${t}////${V}`, G = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return G.components.set(M, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), o.getState().stateComponents.set(t, G), () => {
                        const H = o.getState().stateComponents.get(t);
                        H && H.components.delete(M);
                      };
                    }, [t, V]);
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
              const u = [...n, g.toString()], T = a(s, u, S);
              return e(
                s,
                T,
                i,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ct(Kt, {
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
                const u = r[i], T = [...n, i.toString()], w = a(u, T, S), A = `${m}-${n.join(".")}-${i}`;
                return ct(ee, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: T,
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
            return (e) => (p(n), It(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = X(e) ? e(i) : e;
              let u = null;
              if (!i.some((w) => {
                if (r) {
                  const P = r.every(
                    (V) => z(w[V], g[V])
                  );
                  return P && (u = w), P;
                }
                const A = z(w, g);
                return A && (u = w), A;
              }))
                p(n), It(c, g, n, t);
              else if (s && u) {
                const w = s(u), A = i.map(
                  (P) => z(P, u) ? w : P
                );
                p(n), st(c, A, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), ut(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && ut(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? ut(c, n, t, r) : It(c, e, n, t);
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
        const Q = n[n.length - 1];
        if (!isNaN(Number(Q))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ut(
              c,
              d,
              t,
              Number(Q)
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
          return (d) => xt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => xt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => mt(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            st(c, i, e), p(e);
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
            st(c, i, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Ht(e, d).newDocument;
              Mt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = Tt(e, s), u = new Set(g);
                for (const [
                  T,
                  w
                ] of i.components.entries()) {
                  let A = !1;
                  const P = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (w.paths.has("") && (A = !0), !A))
                      for (const V of u) {
                        if (w.paths.has(V)) {
                          A = !0;
                          break;
                        }
                        let M = V.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const G = V.substring(0, M);
                          if (w.paths.has(G)) {
                            A = !0;
                            break;
                          }
                          const H = V.substring(
                            M + 1
                          );
                          if (!isNaN(Number(H))) {
                            const N = G.lastIndexOf(".");
                            if (N !== -1) {
                              const k = G.substring(
                                0,
                                N
                              );
                              if (w.paths.has(k)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          M = G.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && P.includes("deps") && w.depsFunction) {
                      const V = w.depsFunction(s);
                      let M = !1;
                      typeof V == "boolean" ? V && (M = !0) : z(w.deps, V) || (w.deps = V, M = !0), M && (A = !0);
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
              Z(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && Z(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const T = u.path, w = u.message, A = [d.key, ...T].join(".");
                  e(A, w);
                }), ht(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => bt.getState().getFormRefsByStateKey(t);
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
          return () => bt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ pt(
            Dt,
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
              Gt(() => {
                st(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              st(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ pt(
            Wt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const _ = [...n, l], ot = o.getState().getNestedState(t, _);
        return a(ot, _, S);
      }
    }, W = new Proxy(O, R);
    return y.set(D, {
      proxy: W,
      stateVersion: b
    }), W;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function xt(t) {
  return ct(te, { proxy: t });
}
function Kt({
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
function te({
  proxy: t
}) {
  const c = q(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return it(() => {
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
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const D = document.createTextNode(String(S));
    f.replaceWith(D);
  }, [t._stateKey, t._path.join("."), t._effect]), ct("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function he(t) {
  const c = Rt(
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
  return ct("text", {}, String(c));
}
function ee({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = et({}), [b, p] = Bt(), I = q(null);
  return it(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), gt(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ pt("div", { ref: b, children: f });
}
export {
  xt as $cogsSignal,
  he as $cogsSignalStore,
  fe as addStateOptions,
  Se as createCogsState,
  me as notifyComponent,
  Qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
