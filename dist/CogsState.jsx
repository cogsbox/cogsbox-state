"use client";
import { jsx as Tt } from "react/jsx-runtime";
import { useState as tt, useRef as Z, useEffect as it, useLayoutEffect as ft, useMemo as At, createElement as ct, useSyncExternalStore as Rt, startTransition as Ft, useCallback as pt } from "react";
import { transformStateFunc as Ut, isDeepEqual as B, isFunction as X, getNestedValue as q, getDifferences as Et, debounce as Dt } from "./utility.js";
import { pushFunc as wt, updateFn as st, cutFunc as gt, ValidationWrapper as Wt, FormControlComponent as Gt } from "./Functions.jsx";
import Lt from "superjson";
import { v4 as $t } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Vt } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { applyPatch as Ht } from "fast-json-patch";
import zt from "react-use-measure";
function Nt(t, c) {
  const h = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, v = h(t) || {};
  f(t, {
    ...v,
    ...c
  });
}
function Ct({
  stateKey: t,
  options: c,
  initialOptionsPart: h
}) {
  const f = rt(t) || {}, v = h[t] || {}, k = o.getState().setInitialStateOptions, p = { ...v, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !B(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(t, p);
}
function Se(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const me = (t, c) => {
  let h = t;
  const [f, v] = Ut(h);
  (Object.keys(v).length > 0 || c && Object.keys(c).length > 0) && Object.keys(v).forEach((I) => {
    v[I] = v[I] || {}, v[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...v[I].formElements || {}
      // State-specific overrides
    }, rt(I) || o.getState().setInitialStateOptions(I, v[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const k = (I, a) => {
    const [y] = tt(a?.componentId ?? $t());
    Ct({
      stateKey: I,
      options: a,
      initialOptionsPart: v
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [G, O] = Qt(
      S,
      {
        stateKey: I,
        syncUpdate: a?.syncUpdate,
        componentId: y,
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
    Ct({ stateKey: I, options: a, initialOptionsPart: v }), a.localStorage && Zt(I, a), yt(I);
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
  removeValidationError: Y,
  setServerSyncActions: Yt
} = o.getState(), bt = (t, c, h, f, v) => {
  h?.log && console.log(
    "saving to localstorage",
    c,
    h.localStorage?.key,
    f
  );
  const k = X(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
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
      lastSyncedWithServer: v ?? I
    }, y = Lt.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(y.json)
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
  const h = o.getState().cogsStateStore[t], { sessionId: f } = Pt(), v = X(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (v && f) {
    const k = ht(
      `${f}-${t}-${v}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return et(t, k.state), yt(t), !0;
  }
  return !1;
}, Mt = (t, c, h, f, v, k) => {
  const p = {
    initialState: c,
    updaterState: mt(
      t,
      f,
      v,
      k
    ),
    state: h
  };
  kt(t, p.initialState), St(t, p.updaterState), et(t, p.state);
}, yt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, he = (t, c) => {
  const h = o.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${c}`, v = h.components.get(f);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Xt = (t, c, h, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: q(c, f),
        newValue: q(h, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(h, f)
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
  serverSync: h,
  localStorage: f,
  formElements: v,
  reactiveDeps: k,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: y,
  dependencies: n,
  serverState: S
} = {}) {
  const [G, O] = tt({}), { sessionId: R } = Pt();
  let L = !c;
  const [m] = tt(c ?? $t()), l = o.getState().stateLog[m], lt = Z(/* @__PURE__ */ new Set()), Q = Z(I ?? $t()), M = Z(
    null
  );
  M.current = rt(m) ?? null, it(() => {
    if (y && y.stateKey === m && y.path?.[0]) {
      et(m, (r) => ({
        ...r,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), it(() => {
    if (a) {
      Nt(m, {
        initialState: a
      });
      const e = M.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[m];
      if (!(i && !B(i, a) || !i) && !s)
        return;
      let u = null;
      const T = X(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && R && (u = ht(`${R}-${m}-${T}`));
      let w = a, $ = !1;
      const P = s ? Date.now() : 0, C = u?.lastUpdated || 0, _ = u?.lastSyncedWithServer || 0;
      s && P > C ? (w = e.serverState.data, $ = !0) : u && C > _ && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(m, a), Mt(
        m,
        a,
        w,
        ot,
        Q.current,
        R
      ), $ && T && R && bt(w, m, e, R, Date.now()), yt(m), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ft(() => {
    L && Nt(m, {
      serverSync: h,
      formElements: v,
      initialState: a,
      localStorage: f,
      middleware: M.current?.middleware
    });
    const e = `${m}////${Q.current}`, r = o.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, r), O({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(m));
    };
  }, []);
  const ot = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${m}-${r.join(".")}`;
      lt.current.add(u);
    }
    const g = o.getState();
    et(m, (u) => {
      const T = X(e) ? e(u) : e, w = `${m}-${r.join(".")}`;
      if (w) {
        let V = !1, N = g.signalDomElements.get(w);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const x = r.slice(0, -1), D = q(T, x);
          if (Array.isArray(D)) {
            V = !0;
            const A = `${m}-${x.join(".")}`;
            N = g.signalDomElements.get(A);
          }
        }
        if (N) {
          const x = V ? q(T, r.slice(0, -1)) : q(T, r);
          N.forEach(({ parentId: D, position: A, effect: F }) => {
            const j = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (j) {
              const E = Array.from(j.childNodes);
              if (E[A]) {
                const b = F ? new Function("state", `return (${F})(state)`)(x) : x;
                E[A].textContent = String(b);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || M.current?.validation?.key) && r && Y(
        (i || M.current?.validation?.key) + "." + r.join(".")
      );
      const $ = r.slice(0, r.length - 1);
      s.updateType === "cut" && M.current?.validation?.key && Y(
        M.current?.validation?.key + "." + $.join(".")
      ), s.updateType === "insert" && M.current?.validation?.key && Bt(
        M.current?.validation?.key + "." + $.join(".")
      ).filter(([N, x]) => {
        let D = N?.split(".").length;
        if (N == $.join(".") && D == $.length - 1) {
          let A = N + "." + $;
          Y(N), Jt(A, x);
        }
      });
      const P = g.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const V = Et(u, T), N = new Set(V), x = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          A
        ] of P.components.entries()) {
          let F = !1;
          const j = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !j.includes("none")) {
            if (j.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (j.includes("component") && ((A.paths.has(x) || A.paths.has("")) && (F = !0), !F))
              for (const E of N) {
                let b = E;
                for (; ; ) {
                  if (A.paths.has(b)) {
                    F = !0;
                    break;
                  }
                  const z = b.lastIndexOf(".");
                  if (z !== -1) {
                    const W = b.substring(
                      0,
                      z
                    );
                    if (!isNaN(
                      Number(b.substring(z + 1))
                    ) && A.paths.has(W)) {
                      F = !0;
                      break;
                    }
                    b = W;
                  } else
                    b = "";
                  if (b === "")
                    break;
                }
                if (F) break;
              }
            if (!F && j.includes("deps") && A.depsFunction) {
              const E = A.depsFunction(T);
              let b = !1;
              typeof E == "boolean" ? E && (b = !0) : B(A.deps, E) || (A.deps = E, b = !0), b && (F = !0);
            }
            F && A.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((V, N) => {
        const x = r.slice(0, -1), D = q(T, x);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : V;
      });
      const { oldValue: _, newValue: U } = Xt(
        s.updateType,
        u,
        T,
        r
      ), H = {
        timeStamp: C,
        stateKey: m,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: _,
        newValue: U
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(m, r, T);
          break;
        case "insert":
          const V = r.slice(0, -1);
          g.insertShadowArrayElement(m, V, U);
          break;
        case "cut":
          const N = r.slice(0, -1), x = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(m, N, x);
          break;
      }
      if (qt(m, (V) => {
        const x = [...V ?? [], H].reduce((D, A) => {
          const F = `${A.stateKey}:${JSON.stringify(A.path)}`, j = D.get(F);
          return j ? (j.timeStamp = Math.max(j.timeStamp, A.timeStamp), j.newValue = A.newValue, j.oldValue = j.oldValue ?? A.oldValue, j.updateType = A.updateType) : D.set(F, { ...A }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), bt(
        T,
        m,
        M.current,
        R
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: H
      }), M.current?.serverSync) {
        const V = g.serverState[m], N = M.current?.serverSync;
        Yt(m, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: T }),
          rollBackState: V,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  o.getState().updaterState[m] || (St(
    m,
    mt(
      m,
      ot,
      Q.current,
      R
    )
  ), o.getState().cogsStateStore[m] || et(m, t), o.getState().initialStateGlobal[m] || kt(m, t));
  const d = At(() => mt(
    m,
    ot,
    Q.current,
    R
  ), [m, R]);
  return [_t(m), d];
}
function mt(t, c, h, f) {
  const v = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (y) => {
    const n = y.join(".");
    for (const [S] of v)
      (S === n || S.startsWith(n + ".")) && v.delete(S);
    k++;
  }, I = {
    removeValidation: (y) => {
      y?.validationKey && Y(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Y(n?.key), y?.validationKey && Y(y.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), v.clear(), k++;
      const G = a(S, []), O = rt(t), R = X(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, L = `${f}-${t}-${R}`;
      L && localStorage.removeItem(L), St(t, G), et(t, S);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      v.clear(), k++;
      const n = mt(
        t,
        c,
        h,
        f
      ), S = o.getState().initialStateGlobal[t], G = rt(t), O = X(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, R = `${f}-${t}-${O}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Ft(() => {
        kt(t, y), o.getState().initializeShadowState(t, y), St(t, n), et(t, y);
        const L = o.getState().stateComponents.get(t);
        L && L.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (L) => n.get()[L]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = o.getState().serverState[t];
      return !!(y && B(y, _t(t)));
    }
  };
  function a(y, n = [], S) {
    const G = n.map(String).join(".");
    v.get(G);
    const O = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((m) => {
      O[m] = I[m];
    });
    const R = {
      apply(m, l, lt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
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
          const d = `${t}////${h}`, e = o.getState().stateComponents.get(t);
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
          return () => Et(
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
        if (Array.isArray(y)) {
          const d = () => S?.validIndices ? y.map((r, s) => ({
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
                  y[e],
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
              } = e, g = Z(null), [u, T] = tt({
                startIndex: 0,
                endIndex: 10
              }), [w, $] = tt(0), P = pt(
                () => $((E) => E + 1),
                []
              );
              it(() => {
                const E = setTimeout(() => {
                  P();
                }, 50);
                return () => clearTimeout(E);
              }, [P]);
              const C = Z(i), _ = Z(0), U = Z(!0), H = o().getNestedState(
                t,
                n
              ), V = H.length, { totalHeight: N, positions: x } = At(() => {
                const E = o.getState().getShadowMetadata(t, n) || [];
                let b = 0;
                const z = [];
                for (let W = 0; W < V; W++) {
                  z[W] = b;
                  const J = E[W]?.virtualizer?.itemHeight;
                  b += J || r;
                }
                return { totalHeight: b, positions: z };
              }, [V, t, n, r, w]), D = At(() => {
                const E = Math.max(0, u.startIndex), b = Math.min(V, u.endIndex), z = Array.from(
                  { length: b - E },
                  (J, dt) => E + dt
                ), W = z.map((J) => H[J]);
                return a(W, n, {
                  ...S,
                  validIndices: z
                });
              }, [u.startIndex, u.endIndex, H, V]);
              ft(() => {
                const E = g.current;
                if (!E) return;
                const b = C.current, z = V > _.current;
                _.current = V;
                const W = () => {
                  const { scrollTop: J, clientHeight: dt, scrollHeight: jt } = E;
                  C.current = jt - J - dt < 10;
                  let at = ((nt, Ot) => {
                    let ut = 0, vt = nt.length - 1;
                    for (; ut <= vt; ) {
                      const It = Math.floor((ut + vt) / 2);
                      nt[It] < Ot ? ut = It + 1 : vt = It - 1;
                    }
                    return ut;
                  })(x, J), K = at;
                  for (; K < V && x[K] < J + dt; )
                    K++;
                  at = Math.max(0, at - s), K = Math.min(V, K + s), T((nt) => nt.startIndex !== at || nt.endIndex !== K ? { startIndex: at, endIndex: K } : nt);
                };
                return E.addEventListener("scroll", W, {
                  passive: !0
                }), i && (U.current ? E.scrollTo({
                  top: E.scrollHeight,
                  behavior: "auto"
                }) : b && z && requestAnimationFrame(() => {
                  E.scrollTo({
                    top: E.scrollHeight,
                    behavior: "smooth"
                  });
                })), U.current = !1, W(), () => E.removeEventListener("scroll", W);
              }, [V, s, i, x]);
              const A = pt(
                (E = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: E
                  });
                },
                []
              ), F = pt(
                (E, b = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: x[E] || 0,
                    behavior: b
                  });
                },
                [x]
              ), j = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: { height: `${N}px`, position: "relative" }
                },
                list: {
                  style: {
                    transform: `translateY(${x[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: D,
                virtualizerProps: j,
                scrollToBottom: A,
                scrollToIndex: F
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
                    const [, P] = tt({}), C = `${h}-${n.join(".")}-${i}`;
                    ft(() => {
                      const _ = `${t}////${C}`, U = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return U.components.set(_, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), o.getState().stateComponents.set(t, U), () => {
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
            return (e) => y.map((s, i) => {
              let g;
              S?.validIndices && S.validIndices[i] !== void 0 ? g = S.validIndices[i] : g = i;
              const u = [...n, g.toString()], T = a(s, u, S);
              return e(
                s,
                T,
                i,
                y,
                a(y, n, S)
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
                const u = r[i], T = [...n, i.toString()], w = a(u, T, S), $ = `${h}-${n.join(".")}-${i}`;
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
              const r = y;
              v.clear(), k++;
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
              const r = y[e];
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
                  const P = r.every(
                    (C) => B(w[C], g[C])
                  );
                  return P && (u = w), P;
                }
                const $ = B(w, g);
                return $ && (u = w), $;
              }))
                p(n), wt(c, g, n, t);
              else if (s && u) {
                const w = s(u), $ = i.map(
                  (P) => B(P, u) ? w : P
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
              for (let r = 0; r < y.length; r++)
                y[r] === e && gt(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = y.findIndex((s) => s === e);
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
            if (S?.validIndices && Array.isArray(y)) {
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
                h,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = Et(e, s), u = new Set(g);
                for (const [
                  T,
                  w
                ] of i.components.entries()) {
                  let $ = !1;
                  const P = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (w.paths.has("") && ($ = !0), !$))
                      for (const C of u) {
                        if (w.paths.has(C)) {
                          $ = !0;
                          break;
                        }
                        let _ = C.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const U = C.substring(0, _);
                          if (w.paths.has(U)) {
                            $ = !0;
                            break;
                          }
                          const H = C.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(H))) {
                            const V = U.lastIndexOf(".");
                            if (V !== -1) {
                              const N = U.substring(
                                0,
                                V
                              );
                              if (w.paths.has(N)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          _ = U.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && P.includes("deps") && w.depsFunction) {
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
              Y(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && Y(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const T = u.path, w = u.message, $ = [d.key, ...T].join(".");
                  e($, w);
                }), yt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Vt.getState().getFormRefsByStateKey(t);
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
          return () => Vt.getState().getFormRef(t + "." + n.join("."));
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
    return v.set(G, {
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
  const h = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? c(
    h,
    t._path
  ).stateMapNoRender(
    (v, k, p, I, a) => t._mapFn(v, k, p, I, a)
  ) : null;
}
function te({
  proxy: t
}) {
  const c = Z(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return it(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const v = f.parentElement, p = Array.from(v.childNodes).indexOf(f);
    let I = v.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", I));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
      effect: t._effect
    };
    o.getState().addSignalElement(h, y);
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
    "data-signal-id": h
  });
}
function ye(t) {
  const c = Rt(
    (h) => {
      const f = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: h,
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
  itemPath: h,
  children: f
}) {
  const [, v] = tt({}), [k, p] = zt();
  return it(() => {
    p.height > 0 && o.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: p.height
      }
    });
  }, [p.height]), ft(() => {
    const I = `${t}////${c}`, a = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(I, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set([h.join(".")])
    }), o.getState().stateComponents.set(t, a), () => {
      const y = o.getState().stateComponents.get(t);
      y && y.components.delete(I);
    };
  }, [t, c, h.join(".")]), /* @__PURE__ */ Tt("div", { ref: k, children: f });
}
export {
  xt as $cogsSignal,
  ye as $cogsSignalStore,
  Se as addStateOptions,
  me as createCogsState,
  he as notifyComponent,
  Qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
