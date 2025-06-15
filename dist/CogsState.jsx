"use client";
import { jsx as Tt } from "react/jsx-runtime";
import { useState as tt, useRef as J, useEffect as it, useLayoutEffect as ft, useMemo as Et, createElement as ct, useSyncExternalStore as Rt, startTransition as Ut, useCallback as pt } from "react";
import { transformStateFunc as Ft, isDeepEqual as B, isFunction as X, getNestedValue as q, getDifferences as At, debounce as Dt } from "./utility.js";
import { pushFunc as wt, updateFn as st, cutFunc as gt, ValidationWrapper as Wt, FormControlComponent as Gt } from "./Functions.jsx";
import Lt from "superjson";
import { v4 as $t } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as bt } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { applyPatch as Ht } from "fast-json-patch";
import zt from "react-use-measure";
function Vt(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function Nt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = rt(t) || {}, y = m[t] || {}, k = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !B(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(t, p);
}
function Se(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const me = (t, c) => {
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
  const k = (I, a) => {
    const [v] = tt(a?.componentId ?? $t());
    Nt({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [G, O] = Qt(
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
    Nt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Zt(I, a), vt(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: St,
  setState: et,
  getInitialOptions: rt,
  getKeyState: _t,
  getValidationErrors: Bt,
  setStateLog: qt,
  updateInitialStateGlobal: kt,
  addValidationError: Jt,
  removeValidationError: Z,
  setServerSyncActions: Yt
} = o.getState(), Ct = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const k = X(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (k && f) {
    const p = `${f}-${c}-${k}`;
    let I;
    try {
      I = ht(p)?.lastSyncedWithServer;
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
}, ht = (t) => {
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
    const k = ht(
      `${f}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return et(t, k.state), vt(t), !0;
  }
  return !1;
}, Mt = (t, c, m, f, y, k) => {
  const p = {
    initialState: c,
    updaterState: mt(
      t,
      f,
      y,
      k
    ),
    state: m
  };
  kt(t, p.initialState), St(t, p.updaterState), et(t, p.state);
}, vt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, he = (t, c) => {
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
function Qt(t, {
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
  const [G, O] = tt({}), { sessionId: R } = Pt();
  let L = !c;
  const [h] = tt(c ?? $t()), l = o.getState().stateLog[h], lt = J(/* @__PURE__ */ new Set()), Q = J(I ?? $t()), M = J(
    null
  );
  M.current = rt(h) ?? null, it(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      et(h, (r) => ({
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
      Vt(h, {
        initialState: a
      });
      const e = M.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !B(i, a) || !i) && !s)
        return;
      let u = null;
      const T = X(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && R && (u = ht(`${R}-${h}-${T}`));
      let w = a, $ = !1;
      const x = s ? Date.now() : 0, C = u?.lastUpdated || 0, _ = u?.lastSyncedWithServer || 0;
      s && x > C ? (w = e.serverState.data, $ = !0) : u && C > _ && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), Mt(
        h,
        a,
        w,
        ot,
        Q.current,
        R
      ), $ && T && R && Ct(w, h, e, R, Date.now()), vt(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ft(() => {
    L && Vt(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: M.current?.middleware
    });
    const e = `${h}////${Q.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
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
    et(h, (u) => {
      const T = X(e) ? e(u) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let V = !1, b = g.signalDomElements.get(w);
        if ((!b || b.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const P = r.slice(0, -1), D = q(T, P);
          if (Array.isArray(D)) {
            V = !0;
            const E = `${h}-${P.join(".")}`;
            b = g.signalDomElements.get(E);
          }
        }
        if (b) {
          const P = V ? q(T, r.slice(0, -1)) : q(T, r);
          b.forEach(({ parentId: D, position: E, effect: U }) => {
            const j = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (j) {
              const A = Array.from(j.childNodes);
              if (A[E]) {
                const N = U ? new Function("state", `return (${U})(state)`)(P) : P;
                A[E].textContent = String(N);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || M.current?.validation?.key) && r && Z(
        (i || M.current?.validation?.key) + "." + r.join(".")
      );
      const $ = r.slice(0, r.length - 1);
      s.updateType === "cut" && M.current?.validation?.key && Z(
        M.current?.validation?.key + "." + $.join(".")
      ), s.updateType === "insert" && M.current?.validation?.key && Bt(
        M.current?.validation?.key + "." + $.join(".")
      ).filter(([b, P]) => {
        let D = b?.split(".").length;
        if (b == $.join(".") && D == $.length - 1) {
          let E = b + "." + $;
          Z(b), Jt(E, P);
        }
      });
      const x = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", x), x) {
        const V = At(u, T), b = new Set(V), P = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          E
        ] of x.components.entries()) {
          let U = !1;
          const j = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !j.includes("none")) {
            if (j.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (j.includes("component") && ((E.paths.has(P) || E.paths.has("")) && (U = !0), !U))
              for (const A of b) {
                let N = A;
                for (; ; ) {
                  if (E.paths.has(N)) {
                    U = !0;
                    break;
                  }
                  const z = N.lastIndexOf(".");
                  if (z !== -1) {
                    const W = N.substring(
                      0,
                      z
                    );
                    if (!isNaN(
                      Number(N.substring(z + 1))
                    ) && E.paths.has(W)) {
                      U = !0;
                      break;
                    }
                    N = W;
                  } else
                    N = "";
                  if (N === "")
                    break;
                }
                if (U) break;
              }
            if (!U && j.includes("deps") && E.depsFunction) {
              const A = E.depsFunction(T);
              let N = !1;
              typeof A == "boolean" ? A && (N = !0) : B(E.deps, A) || (E.deps = A, N = !0), N && (U = !0);
            }
            U && E.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((V, b) => {
        const P = r.slice(0, -1), D = q(T, P);
        return b === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : V;
      });
      const { oldValue: _, newValue: F } = Xt(
        s.updateType,
        u,
        T,
        r
      ), H = {
        timeStamp: C,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: _,
        newValue: F
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, r, T);
          break;
        case "insert":
          const V = r.slice(0, -1);
          g.insertShadowArrayElement(h, V, F);
          break;
        case "cut":
          const b = r.slice(0, -1), P = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, b, P);
          break;
      }
      if (qt(h, (V) => {
        const P = [...V ?? [], H].reduce((D, E) => {
          const U = `${E.stateKey}:${JSON.stringify(E.path)}`, j = D.get(U);
          return j ? (j.timeStamp = Math.max(j.timeStamp, E.timeStamp), j.newValue = E.newValue, j.oldValue = j.oldValue ?? E.oldValue, j.updateType = E.updateType) : D.set(U, { ...E }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(P.values());
      }), Ct(
        T,
        h,
        M.current,
        R
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: H
      }), M.current?.serverSync) {
        const V = g.serverState[h], b = M.current?.serverSync;
        Yt(h, {
          syncKey: typeof b.syncKey == "string" ? b.syncKey : b.syncKey({ state: T }),
          rollBackState: V,
          actionTimeStamp: Date.now() + (b.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  o.getState().updaterState[h] || (St(
    h,
    mt(
      h,
      ot,
      Q.current,
      R
    )
  ), o.getState().cogsStateStore[h] || et(h, t), o.getState().initialStateGlobal[h] || kt(h, t));
  const d = Et(() => mt(
    h,
    ot,
    Q.current,
    R
  ), [h, R]);
  return [_t(h), d];
}
function mt(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && Z(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Z(n?.key), v?.validationKey && Z(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const G = a(S, []), O = rt(t), R = X(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, L = `${f}-${t}-${R}`;
      L && localStorage.removeItem(L), St(t, G), et(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const n = mt(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], G = rt(t), O = X(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, R = `${f}-${t}-${O}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Ut(() => {
        kt(t, v), o.getState().initializeShadowState(t, v), St(t, n), et(t, v);
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
      return !!(v && B(v, _t(t)));
    }
  };
  function a(v, n = [], S) {
    const G = n.map(String).join(".");
    y.get(G);
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
          return () => At(
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
                // Default/estimated height
                overscan: s = 5,
                stickToBottom: i = !1
              } = e, g = J(null), [u, T] = tt({
                startIndex: 0,
                endIndex: 10
              }), [w, $] = tt(0), x = pt(
                () => $((A) => A + 1),
                []
              );
              it(() => {
                const A = o.getState().subscribeToShadowState(t, x), N = setTimeout(x, 50);
                return () => {
                  A(), clearTimeout(N);
                };
              }, [t, x]);
              const C = J(i), _ = J(0), F = J(!0), H = o().getNestedState(
                t,
                n
              ), V = H.length, { totalHeight: b, positions: P } = Et(() => {
                const A = o.getState().getShadowMetadata(t, n) || [];
                let N = 0;
                const z = [];
                for (let W = 0; W < V; W++) {
                  z[W] = N;
                  const Y = A[W]?.virtualizer?.itemHeight;
                  N += Y || r;
                }
                return { totalHeight: N, positions: z };
              }, [V, t, n, r, w]), D = Et(() => {
                const A = Math.max(0, u.startIndex), N = Math.min(V, u.endIndex), z = Array.from(
                  { length: N - A },
                  (Y, dt) => A + dt
                ), W = z.map((Y) => H[Y]);
                return a(W, n, {
                  ...S,
                  validIndices: z
                });
              }, [u.startIndex, u.endIndex, H]);
              ft(() => {
                const A = g.current;
                if (!A) return;
                const N = C.current, z = V > _.current;
                _.current = V;
                const W = () => {
                  const { scrollTop: Y, clientHeight: dt, scrollHeight: jt } = A;
                  C.current = jt - Y - dt < 10;
                  let at = ((nt, Ot) => {
                    let ut = 0, yt = nt.length - 1;
                    for (; ut <= yt; ) {
                      const It = Math.floor((ut + yt) / 2);
                      nt[It] < Ot ? ut = It + 1 : yt = It - 1;
                    }
                    return ut;
                  })(P, Y), K = at;
                  for (; K < V && P[K] < Y + dt; )
                    K++;
                  at = Math.max(0, at - s), K = Math.min(V, K + s), T((nt) => nt.startIndex !== at || nt.endIndex !== K ? { startIndex: at, endIndex: K } : nt);
                };
                return A.addEventListener("scroll", W, {
                  passive: !0
                }), i && (F.current ? A.scrollTo({
                  top: A.scrollHeight,
                  behavior: "auto"
                }) : N && z && A.scrollTo({
                  top: A.scrollHeight,
                  behavior: "auto"
                })), F.current = !1, W(), () => A.removeEventListener("scroll", W);
              }, [V, s, i, P]);
              const E = pt(
                (A = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: A
                  });
                },
                []
              ), U = pt(
                (A, N = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: P[A] || 0,
                    behavior: N
                  });
                },
                [P]
              ), j = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: { height: `${b}px`, position: "relative" }
                },
                list: {
                  style: {
                    transform: `translateY(${P[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: D,
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
                    const [, x] = tt({}), C = `${m}-${n.join(".")}-${i}`;
                    ft(() => {
                      const _ = `${t}////${C}`, F = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(_, {
                        forceUpdate: () => x({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), o.getState().stateComponents.set(t, F), () => {
                        const H = o.getState().stateComponents.get(t);
                        H && H.components.delete(_);
                      };
                    }, [t, C]);
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
                const u = r[i], T = [...n, i.toString()], w = a(u, T, S), $ = `${m}-${n.join(".")}-${i}`;
                return ct(ee, {
                  key: i,
                  stateKey: t,
                  itemComponentId: $,
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
              y.clear(), k++;
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
            return (e) => (p(n), wt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = X(e) ? e(i) : e;
              let u = null;
              if (!i.some((w) => {
                if (r) {
                  const x = r.every(
                    (C) => B(w[C], g[C])
                  );
                  return x && (u = w), x;
                }
                const $ = B(w, g);
                return $ && (u = w), $;
              }))
                p(n), wt(c, g, n, t);
              else if (s && u) {
                const w = s(u), $ = i.map(
                  (x) => B(x, u) ? w : x
                );
                p(n), st(c, $, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), gt(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && gt(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? gt(c, n, t, r) : wt(c, e, n, t);
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
            return () => gt(
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
          return (d) => ht(f + "-" + t + "-" + d);
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
                const g = At(e, s), u = new Set(g);
                for (const [
                  T,
                  w
                ] of i.components.entries()) {
                  let $ = !1;
                  const x = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (w.paths.has("") && ($ = !0), !$))
                      for (const C of u) {
                        if (w.paths.has(C)) {
                          $ = !0;
                          break;
                        }
                        let _ = C.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const F = C.substring(0, _);
                          if (w.paths.has(F)) {
                            $ = !0;
                            break;
                          }
                          const H = C.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(H))) {
                            const V = F.lastIndexOf(".");
                            if (V !== -1) {
                              const b = F.substring(
                                0,
                                V
                              );
                              if (w.paths.has(b)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          _ = F.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && x.includes("deps") && w.depsFunction) {
                      const C = w.depsFunction(s);
                      let _ = !1;
                      typeof C == "boolean" ? C && (_ = !0) : B(w.deps, C) || (w.deps = C, _ = !0), _ && ($ = !0);
                    }
                    $ && w.forceUpdate();
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
                  const T = u.path, w = u.message, $ = [d.key, ...T].join(".");
                  e($, w);
                }), vt(t), !1);
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
          }) => /* @__PURE__ */ Tt(
            Wt,
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
              Dt(() => {
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
          return (d, e) => /* @__PURE__ */ Tt(
            Gt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], ot = o.getState().getNestedState(t, M);
        return a(ot, M, S);
      }
    }, L = new Proxy(O, R);
    return y.set(G, {
      proxy: L,
      stateVersion: k
    }), L;
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
    (y, k, p, I, a) => t._mapFn(y, k, p, I, a)
  ) : null;
}
function te({
  proxy: t
}) {
  const c = J(null), m = `${t._stateKey}-${t._path.join(".")}`;
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
    const G = document.createTextNode(String(S));
    f.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), ct("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ve(t) {
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
  const [, y] = tt({}), [k, p] = zt(), I = J(null);
  return it(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), ft(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ Tt("div", { ref: k, children: f });
}
export {
  xt as $cogsSignal,
  ve as $cogsSignalStore,
  Se as addStateOptions,
  me as createCogsState,
  he as notifyComponent,
  Qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
