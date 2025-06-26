"use client";
import { jsx as ft } from "react/jsx-runtime";
import { useState as et, useRef as Y, useEffect as Q, useLayoutEffect as kt, useMemo as St, createElement as at, useSyncExternalStore as xt, startTransition as Pt, useCallback as mt } from "react";
import { transformStateFunc as Ct, isDeepEqual as B, isFunction as Z, getNestedValue as q, getDifferences as ht, debounce as _t } from "./utility.js";
import { pushFunc as gt, updateFn as rt, cutFunc as st, ValidationWrapper as Mt, FormControlComponent as Rt } from "./Functions.jsx";
import Ot from "superjson";
import { v4 as yt } from "uuid";
import "zod";
import { getGlobalStore as a, formRefStore as It } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import { applyPatch as jt } from "fast-json-patch";
import Ut from "react-use-measure";
function pt(t, s) {
  const S = a.getState().getInitialOptions, u = a.getState().setInitialStateOptions, h = S(t) || {};
  u(t, {
    ...h,
    ...s
  });
}
function wt({
  stateKey: t,
  options: s,
  initialOptionsPart: S
}) {
  const u = tt(t) || {}, h = S[t] || {}, $ = a.getState().setInitialStateOptions, I = { ...h, ...u };
  let v = !1;
  if (s)
    for (const o in s)
      I.hasOwnProperty(o) ? (o == "localStorage" && s[o] && I[o].key !== s[o]?.key && (v = !0, I[o] = s[o]), o == "initialState" && s[o] && I[o] !== s[o] && // Different references
      !B(I[o], s[o]) && (v = !0, I[o] = s[o])) : (v = !0, I[o] = s[o]);
  v && $(t, I);
}
function oe(t, { formElements: s, validation: S }) {
  return { initialState: t, formElements: s, validation: S };
}
const ie = (t, s) => {
  let S = t;
  const [u, h] = Ct(S);
  (Object.keys(h).length > 0 || s && Object.keys(s).length > 0) && Object.keys(h).forEach((v) => {
    h[v] = h[v] || {}, h[v].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...h[v].formElements || {}
      // State-specific overrides
    }, tt(v) || a.getState().setInitialStateOptions(v, h[v]);
  }), a.getState().setInitialStates(u), a.getState().setCreatedState(u);
  const $ = (v, o) => {
    const [m] = et(o?.componentId ?? yt());
    wt({
      stateKey: v,
      options: o,
      initialOptionsPart: h
    });
    const n = a.getState().cogsStateStore[v] || u[v], g = o?.modifyState ? o.modifyState(n) : n, [F, R] = Ht(
      g,
      {
        stateKey: v,
        syncUpdate: o?.syncUpdate,
        componentId: m,
        localStorage: o?.localStorage,
        middleware: o?.middleware,
        enabledSync: o?.enabledSync,
        reactiveType: o?.reactiveType,
        reactiveDeps: o?.reactiveDeps,
        initialState: o?.initialState,
        dependencies: o?.dependencies,
        serverState: o?.serverState
      }
    );
    return R;
  };
  function I(v, o) {
    wt({ stateKey: v, options: o, initialOptionsPart: h }), o.localStorage && Lt(v, o), ot(v);
  }
  return { useCogsState: $, setCogsOptions: I };
}, {
  setUpdaterState: ct,
  setState: K,
  getInitialOptions: tt,
  getKeyState: bt,
  getValidationErrors: Ft,
  setStateLog: Dt,
  updateInitialStateGlobal: vt,
  addValidationError: $t,
  removeValidationError: J,
  setServerSyncActions: Gt
} = a.getState(), Et = (t, s, S, u, h) => {
  S?.log && console.log(
    "saving to localstorage",
    s,
    S.localStorage?.key,
    u
  );
  const $ = Z(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if ($ && u) {
    const I = `${u}-${s}-${$}`;
    let v;
    try {
      v = dt(I)?.lastSyncedWithServer;
    } catch {
    }
    const o = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: h ?? v
    }, m = Ot.serialize(o);
    window.localStorage.setItem(
      I,
      JSON.stringify(m.json)
    );
  }
}, dt = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Lt = (t, s) => {
  const S = a.getState().cogsStateStore[t], { sessionId: u } = At(), h = Z(s?.localStorage?.key) ? s.localStorage.key(S) : s?.localStorage?.key;
  if (h && u) {
    const $ = dt(
      `${u}-${t}-${h}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return K(t, $.state), ot(t), !0;
  }
  return !1;
}, Vt = (t, s, S, u, h, $) => {
  const I = {
    initialState: s,
    updaterState: lt(
      t,
      u,
      h,
      $
    ),
    state: S
  };
  vt(t, I.initialState), ct(t, I.updaterState), K(t, I.state);
}, ot = (t) => {
  const s = a.getState().stateComponents.get(t);
  if (!s) return;
  const S = /* @__PURE__ */ new Set();
  s.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((u) => u());
  });
}, se = (t, s) => {
  const S = a.getState().stateComponents.get(t);
  if (S) {
    const u = `${t}////${s}`, h = S.components.get(u);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
}, Wt = (t, s, S, u) => {
  switch (t) {
    case "update":
      return {
        oldValue: q(s, u),
        newValue: q(S, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(S, u)
      };
    case "cut":
      return {
        oldValue: q(s, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Ht(t, {
  stateKey: s,
  serverSync: S,
  localStorage: u,
  formElements: h,
  reactiveDeps: $,
  reactiveType: I,
  componentId: v,
  initialState: o,
  syncUpdate: m,
  dependencies: n,
  serverState: g
} = {}) {
  const [F, R] = et({}), { sessionId: O } = At();
  let L = !s;
  const [f] = et(s ?? yt()), c = a.getState().stateLog[f], it = Y(/* @__PURE__ */ new Set()), X = Y(v ?? yt()), _ = Y(
    null
  );
  _.current = tt(f) ?? null, Q(() => {
    if (m && m.stateKey === f && m.path?.[0]) {
      K(f, (r) => ({
        ...r,
        [m.path[0]]: m.newValue
      }));
      const e = `${m.stateKey}:${m.path.join(".")}`;
      a.getState().setSyncInfo(e, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), Q(() => {
    if (o) {
      pt(f, {
        initialState: o
      });
      const e = _.current, i = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, d = a.getState().initialStateGlobal[f];
      if (!(d && !B(d, o) || !d) && !i)
        return;
      let y = null;
      const E = Z(e?.localStorage?.key) ? e?.localStorage?.key(o) : e?.localStorage?.key;
      E && O && (y = dt(`${O}-${f}-${E}`));
      let w = o, b = !1;
      const P = i ? Date.now() : 0, x = y?.lastUpdated || 0, j = y?.lastSyncedWithServer || 0;
      i && P > x ? (w = e.serverState.data, b = !0) : y && x > j && (w = y.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), a.getState().initializeShadowState(f, o), Vt(
        f,
        o,
        w,
        nt,
        X.current,
        O
      ), b && E && O && Et(w, f, e, O, Date.now()), ot(f), (Array.isArray(I) ? I : [I || "component"]).includes("none") || R({});
    }
  }, [
    o,
    g?.status,
    g?.data,
    ...n || []
  ]), kt(() => {
    L && pt(f, {
      serverSync: S,
      formElements: h,
      initialState: o,
      localStorage: u,
      middleware: _.current?.middleware
    });
    const e = `${f}////${X.current}`, r = a.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: I ?? ["component", "deps"]
    }), a.getState().stateComponents.set(f, r), R({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && a.getState().stateComponents.delete(f));
    };
  }, []);
  const nt = (e, r, i, d) => {
    if (Array.isArray(r)) {
      const y = `${f}-${r.join(".")}`;
      it.current.add(y);
    }
    const p = a.getState();
    K(f, (y) => {
      const E = Z(e) ? e(y) : e, w = `${f}-${r.join(".")}`;
      if (w) {
        let C = !1, k = p.signalDomElements.get(w);
        if ((!k || k.size === 0) && (i.updateType === "insert" || i.updateType === "cut")) {
          const M = r.slice(0, -1), G = q(E, M);
          if (Array.isArray(G)) {
            C = !0;
            const T = `${f}-${M.join(".")}`;
            k = p.signalDomElements.get(T);
          }
        }
        if (k) {
          const M = C ? q(E, r.slice(0, -1)) : q(E, r);
          k.forEach(({ parentId: G, position: T, effect: U }) => {
            const A = document.querySelector(
              `[data-parent-id="${G}"]`
            );
            if (A) {
              const V = Array.from(A.childNodes);
              if (V[T]) {
                const N = U ? new Function("state", `return (${U})(state)`)(M) : M;
                V[T].textContent = String(N);
              }
            }
          });
        }
      }
      console.log("shadowState", p.shadowStateStore), i.updateType === "update" && (d || _.current?.validation?.key) && r && J(
        (d || _.current?.validation?.key) + "." + r.join(".")
      );
      const b = r.slice(0, r.length - 1);
      i.updateType === "cut" && _.current?.validation?.key && J(
        _.current?.validation?.key + "." + b.join(".")
      ), i.updateType === "insert" && _.current?.validation?.key && Ft(
        _.current?.validation?.key + "." + b.join(".")
      ).filter(([k, M]) => {
        let G = k?.split(".").length;
        if (k == b.join(".") && G == b.length - 1) {
          let T = k + "." + b;
          J(k), $t(T, M);
        }
      });
      const P = p.stateComponents.get(f);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const C = ht(y, E), k = new Set(C), M = i.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          G,
          T
        ] of P.components.entries()) {
          let U = !1;
          const A = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
          if (console.log("component", T), !A.includes("none")) {
            if (A.includes("all")) {
              T.forceUpdate();
              continue;
            }
            if (A.includes("component") && ((T.paths.has(M) || T.paths.has("")) && (U = !0), !U))
              for (const V of k) {
                let N = V;
                for (; ; ) {
                  if (T.paths.has(N)) {
                    U = !0;
                    break;
                  }
                  const H = N.lastIndexOf(".");
                  if (H !== -1) {
                    const z = N.substring(
                      0,
                      H
                    );
                    if (!isNaN(
                      Number(N.substring(H + 1))
                    ) && T.paths.has(z)) {
                      U = !0;
                      break;
                    }
                    N = z;
                  } else
                    N = "";
                  if (N === "")
                    break;
                }
                if (U) break;
              }
            if (!U && A.includes("deps") && T.depsFunction) {
              const V = T.depsFunction(E);
              let N = !1;
              typeof V == "boolean" ? V && (N = !0) : B(T.deps, V) || (T.deps = V, N = !0), N && (U = !0);
            }
            U && T.forceUpdate();
          }
        }
      }
      const x = Date.now();
      r = r.map((C, k) => {
        const M = r.slice(0, -1), G = q(E, M);
        return k === r.length - 1 && ["insert", "cut"].includes(i.updateType) ? (G.length - 1).toString() : C;
      });
      const { oldValue: j, newValue: W } = Wt(
        i.updateType,
        y,
        E,
        r
      ), D = {
        timeStamp: x,
        stateKey: f,
        path: r,
        updateType: i.updateType,
        status: "new",
        oldValue: j,
        newValue: W
      };
      switch (i.updateType) {
        case "update":
          p.updateShadowAtPath(f, r, E);
          break;
        case "insert":
          const C = r.slice(0, -1);
          p.insertShadowArrayElement(f, C, W);
          break;
        case "cut":
          const k = r.slice(0, -1), M = parseInt(r[r.length - 1]);
          p.removeShadowArrayElement(f, k, M);
          break;
      }
      if (Dt(f, (C) => {
        const M = [...C ?? [], D].reduce((G, T) => {
          const U = `${T.stateKey}:${JSON.stringify(T.path)}`, A = G.get(U);
          return A ? (A.timeStamp = Math.max(A.timeStamp, T.timeStamp), A.newValue = T.newValue, A.oldValue = A.oldValue ?? T.oldValue, A.updateType = T.updateType) : G.set(U, { ...T }), G;
        }, /* @__PURE__ */ new Map());
        return Array.from(M.values());
      }), Et(
        E,
        f,
        _.current,
        O
      ), _.current?.middleware && _.current.middleware({
        updateLog: c,
        update: D
      }), _.current?.serverSync) {
        const C = p.serverState[f], k = _.current?.serverSync;
        Gt(f, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: E }),
          rollBackState: C,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  a.getState().updaterState[f] || (ct(
    f,
    lt(
      f,
      nt,
      X.current,
      O
    )
  ), a.getState().cogsStateStore[f] || K(f, t), a.getState().initialStateGlobal[f] || vt(f, t));
  const l = St(() => lt(
    f,
    nt,
    X.current,
    O
  ), [f, O]);
  return [bt(f), l];
}
function lt(t, s, S, u) {
  const h = /* @__PURE__ */ new Map();
  let $ = 0;
  const I = (m) => {
    const n = m.join(".");
    for (const [g] of h)
      (g === n || g.startsWith(n + ".")) && h.delete(g);
    $++;
  }, v = {
    removeValidation: (m) => {
      m?.validationKey && J(m.validationKey);
    },
    revertToInitialState: (m) => {
      const n = a.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), m?.validationKey && J(m.validationKey);
      const g = a.getState().initialStateGlobal[t];
      a.getState().clearSelectedIndexesForState(t), h.clear(), $++;
      const F = o(g, []), R = tt(t), O = Z(R?.localStorage?.key) ? R?.localStorage?.key(g) : R?.localStorage?.key, L = `${u}-${t}-${O}`;
      L && localStorage.removeItem(L), ct(t, F), K(t, g);
      const f = a.getState().stateComponents.get(t);
      return f && f.components.forEach((c) => {
        c.forceUpdate();
      }), g;
    },
    updateInitialState: (m) => {
      h.clear(), $++;
      const n = lt(
        t,
        s,
        S,
        u
      ), g = a.getState().initialStateGlobal[t], F = tt(t), R = Z(F?.localStorage?.key) ? F?.localStorage?.key(g) : F?.localStorage?.key, O = `${u}-${t}-${R}`;
      return localStorage.getItem(O) && localStorage.removeItem(O), Pt(() => {
        vt(t, m), a.getState().initializeShadowState(t, m), ct(t, n), K(t, m);
        const L = a.getState().stateComponents.get(t);
        L && L.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (L) => n.get()[L]
      };
    },
    _initialState: a.getState().initialStateGlobal[t],
    _serverState: a.getState().serverState[t],
    _isLoading: a.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const m = a.getState().serverState[t];
      return !!(m && B(m, bt(t)));
    }
  };
  function o(m, n = [], g) {
    const F = n.map(String).join(".");
    h.get(F);
    const R = function() {
      return a().getNestedState(t, n);
    };
    Object.keys(v).forEach((f) => {
      R[f] = v[f];
    });
    const O = {
      apply(f, c, it) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), a().getNestedState(t, n);
      },
      get(f, c) {
        g?.validIndices && !Array.isArray(m) && (g = { ...g, validIndices: void 0 });
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !it.has(c)) {
          const l = `${t}////${S}`, e = a.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(l);
            if (r && !r.paths.has("")) {
              const i = n.join(".");
              let d = !0;
              for (const p of r.paths)
                if (i.startsWith(p) && (i === p || i[p.length] === ".")) {
                  d = !1;
                  break;
                }
              d && r.paths.add(i);
            }
          }
        }
        if (c === "getDifferences")
          return () => ht(
            a.getState().cogsStateStore[t],
            a.getState().initialStateGlobal[t]
          );
        if (c === "sync" && n.length === 0)
          return async function() {
            const l = a.getState().getInitialOptions(t), e = l?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = a.getState().getNestedState(t, []), i = l?.validation?.key;
            try {
              const d = await e.action(r);
              if (d && !d.success && d.errors && i) {
                a.getState().removeValidationError(i), d.errors.forEach((y) => {
                  const E = [i, ...y.path].join(".");
                  a.getState().addValidationError(E, y.message);
                });
                const p = a.getState().stateComponents.get(t);
                p && p.components.forEach((y) => {
                  y.forceUpdate();
                });
              }
              return d?.success && e.onSuccess ? e.onSuccess(d.data) : !d?.success && e.onError && e.onError(d.error), d;
            } catch (d) {
              return e.onError && e.onError(d), { success: !1, error: d };
            }
          };
        if (c === "_status") {
          const l = a.getState().getNestedState(t, n), e = a.getState().initialStateGlobal[t], r = q(e, n);
          return B(l, r) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const l = a().getNestedState(
              t,
              n
            ), e = a.getState().initialStateGlobal[t], r = q(e, n);
            return B(l, r) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const l = a.getState().initialStateGlobal[t], e = tt(t), r = Z(e?.localStorage?.key) ? e?.localStorage?.key(l) : e?.localStorage?.key, i = `${u}-${t}-${r}`;
            i && localStorage.removeItem(i);
          };
        if (c === "showValidationErrors")
          return () => {
            const l = a.getState().getInitialOptions(t)?.validation;
            if (!l?.key)
              throw new Error("Validation key not found");
            return a.getState().getValidationErrors(l.key + "." + n.join("."));
          };
        if (Array.isArray(m)) {
          const l = () => g?.validIndices ? m.map((r, i) => ({
            item: r,
            originalIndex: g.validIndices[i]
          })) : a.getState().getNestedState(t, n).map((r, i) => ({
            item: r,
            originalIndex: i
          }));
          if (c === "getSelected")
            return () => {
              const e = a.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return o(
                  m[e],
                  [...n, e.toString()],
                  g
                );
            };
          if (c === "clearSelected")
            return () => {
              a.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (c === "getSelectedIndex")
            return () => a.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (c === "useVirtualView")
            return (e) => {
              const {
                itemHeight: r = 50,
                overscan: i = 6,
                stickToBottom: d = !1,
                dependencies: p = []
              } = e, y = Y(null), [E, w] = et({
                startIndex: 0,
                endIndex: 10
              }), [b, P] = et(0), x = Y(!1), j = Y(0);
              Q(() => a.getState().subscribeToShadowState(t, () => {
                P((V) => V + 1);
              }), []);
              const W = a().getNestedState(
                t,
                n
              ), D = W.length, { totalHeight: C, positions: k } = St(() => {
                const A = a.getState().getShadowMetadata(t, n) || [];
                let V = 0;
                const N = [];
                for (let H = 0; H < D; H++) {
                  N[H] = V;
                  const z = A[H]?.virtualizer?.itemHeight;
                  V += z || r;
                }
                return { totalHeight: V, positions: N };
              }, [D, r, b]), M = St(() => {
                const A = Math.max(0, E.startIndex), V = Math.min(D, E.endIndex), N = Array.from(
                  { length: V - A },
                  (z, ut) => A + ut
                ), H = N.map((z) => W[z]);
                return o(H, n, {
                  ...g,
                  validIndices: N
                });
              }, [E.startIndex, E.endIndex, W]);
              Q(() => {
                if (!d || D === 0) return;
                if (D > j.current && x.current && j.current > 0) {
                  const V = y.current;
                  if (!V) return;
                  const N = Math.ceil(
                    V.clientHeight / r
                  );
                  w({
                    startIndex: Math.max(
                      0,
                      D - N - i
                    ),
                    endIndex: D
                  }), setTimeout(() => {
                    V.scrollTop = V.scrollHeight;
                  }, 50);
                }
                j.current = D;
              }, [D]), Q(() => {
                const A = y.current;
                if (!A) return;
                const V = () => {
                  const { scrollTop: N, scrollHeight: H, clientHeight: z } = A;
                  x.current = H - N - z < 100;
                  const ut = Math.floor(N / r), Nt = Math.ceil(
                    (N + z) / r
                  );
                  w({
                    startIndex: Math.max(0, ut - i),
                    endIndex: Math.min(D, Nt + i)
                  });
                };
                return A.addEventListener("scroll", V, {
                  passive: !0
                }), V(), () => A.removeEventListener("scroll", V);
              }, [k]);
              const G = mt(() => {
                y.current && (y.current.scrollTop = y.current.scrollHeight, x.current = !0);
              }, []), T = mt(
                (A, V = "smooth") => {
                  y.current && k[A] !== void 0 && y.current.scrollTo({
                    top: k[A],
                    behavior: V
                  });
                },
                [k]
              ), U = {
                outer: {
                  ref: y,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${C}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${k[E.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: M,
                virtualizerProps: U,
                scrollToBottom: G,
                scrollToIndex: T
              };
            };
          if (c === "stateMapNoRender")
            return (e) => m.map((i, d) => {
              let p;
              g?.validIndices && g.validIndices[d] !== void 0 ? p = g.validIndices[d] : p = d;
              const y = [...n, p.toString()], E = o(i, y, g);
              return e(
                i,
                E,
                d,
                m,
                o(m, n, g)
              );
            });
          if (c === "$stateMap")
            return (e) => at(zt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: o
            });
          if (c === "stateList")
            return (e) => {
              const r = a.getState().getNestedState(t, n);
              return Array.isArray(r) ? (g?.validIndices || Array.from({ length: r.length }, (d, p) => p)).map((d, p) => {
                const y = r[d], E = [...n, d.toString()], w = o(y, E, g), b = `${S}-${n.join(".")}-${d}`;
                return at(qt, {
                  key: d,
                  stateKey: t,
                  itemComponentId: b,
                  itemPath: E,
                  children: e(
                    y,
                    w,
                    { localIndex: p, originalIndex: d },
                    r,
                    o(r, n, g)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (c === "stateFlattenOn")
            return (e) => {
              const r = m;
              h.clear(), $++;
              const i = r.flatMap(
                (d) => d[e] ?? []
              );
              return o(
                i,
                [...n, "[*]", e],
                g
              );
            };
          if (c === "index")
            return (e) => {
              const r = m[e];
              return o(r, [...n, e.toString()]);
            };
          if (c === "last")
            return () => {
              const e = a.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, i = e[r], d = [...n, r.toString()];
              return o(i, d);
            };
          if (c === "insert")
            return (e) => (I(n), gt(s, e, n, t), o(
              a.getState().getNestedState(t, n),
              n
            ));
          if (c === "uniqueInsert")
            return (e, r, i) => {
              const d = a.getState().getNestedState(t, n), p = Z(e) ? e(d) : e;
              let y = null;
              if (!d.some((w) => {
                if (r) {
                  const P = r.every(
                    (x) => B(w[x], p[x])
                  );
                  return P && (y = w), P;
                }
                const b = B(w, p);
                return b && (y = w), b;
              }))
                I(n), gt(s, p, n, t);
              else if (i && y) {
                const w = i(y), b = d.map(
                  (P) => B(P, y) ? w : P
                );
                I(n), rt(s, b, n);
              }
            };
          if (c === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return I(n), st(s, n, t, e), o(
                  a.getState().getNestedState(t, n),
                  n
                );
            };
          if (c === "cutByValue")
            return (e) => {
              for (let r = 0; r < m.length; r++)
                m[r] === e && st(s, n, t, r);
            };
          if (c === "toggleByValue")
            return (e) => {
              const r = m.findIndex((i) => i === e);
              r > -1 ? st(s, n, t, r) : gt(s, e, n, t);
            };
          if (c === "stateFind")
            return (e) => {
              const i = l().find(
                ({ item: p }, y) => e(p, y)
              );
              if (!i) return;
              const d = [...n, i.originalIndex.toString()];
              return o(i.item, d, g);
            };
          if (c === "findWith")
            return (e, r) => {
              const d = l().find(
                ({ item: y }) => y[e] === r
              );
              if (!d) return;
              const p = [...n, d.originalIndex.toString()];
              return o(d.item, p, g);
            };
        }
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const l = n.slice(0, -1), e = a.getState().getNestedState(t, l);
          if (Array.isArray(e) && c === "cut")
            return () => st(
              s,
              l,
              t,
              Number(X)
            );
        }
        if (c === "get")
          return () => {
            if (g?.validIndices && Array.isArray(m)) {
              const l = a.getState().getNestedState(t, n);
              return g.validIndices.map((e) => l[e]);
            }
            return a.getState().getNestedState(t, n);
          };
        if (c === "$derive")
          return (l) => Tt({
            _stateKey: t,
            _path: n,
            _effect: l.toString()
          });
        if (c === "$get")
          return () => Tt({
            _stateKey: t,
            _path: n
          });
        if (c === "lastSynced") {
          const l = `${t}:${n.join(".")}`;
          return a.getState().getSyncInfo(l);
        }
        if (c == "getLocalStorage")
          return (l) => dt(u + "-" + t + "-" + l);
        if (c === "_selected") {
          const l = n.slice(0, -1), e = l.join("."), r = a.getState().getNestedState(t, l);
          return Array.isArray(r) ? Number(n[n.length - 1]) === a.getState().getSelectedIndex(t, e) : void 0;
        }
        if (c === "setSelected")
          return (l) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), i = e.join(".");
            l ? a.getState().setSelectedIndex(t, i, r) : a.getState().setSelectedIndex(t, i, void 0);
            const d = a.getState().getNestedState(t, [...e]);
            rt(s, d, e), I(e);
          };
        if (c === "toggleSelected")
          return () => {
            const l = n.slice(0, -1), e = Number(n[n.length - 1]), r = l.join("."), i = a.getState().getSelectedIndex(t, r);
            a.getState().setSelectedIndex(
              t,
              r,
              i === e ? void 0 : e
            );
            const d = a.getState().getNestedState(t, [...l]);
            rt(s, d, l), I(l);
          };
        if (n.length == 0) {
          if (c === "addValidation")
            return (l) => {
              const e = a.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              J(e.key), console.log("addValidationError", l), l.forEach((r) => {
                const i = [e.key, ...r.path].join(".");
                console.log("fullErrorPath", i), $t(i, r.message);
              }), ot(t);
            };
          if (c === "applyJsonPatch")
            return (l) => {
              const e = a.getState().cogsStateStore[t], i = jt(e, l).newDocument;
              Vt(
                t,
                a.getState().initialStateGlobal[t],
                i,
                s,
                S,
                u
              );
              const d = a.getState().stateComponents.get(t);
              if (d) {
                const p = ht(e, i), y = new Set(p);
                for (const [
                  E,
                  w
                ] of d.components.entries()) {
                  let b = !1;
                  const P = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (w.paths.has("") && (b = !0), !b))
                      for (const x of y) {
                        if (w.paths.has(x)) {
                          b = !0;
                          break;
                        }
                        let j = x.lastIndexOf(".");
                        for (; j !== -1; ) {
                          const W = x.substring(0, j);
                          if (w.paths.has(W)) {
                            b = !0;
                            break;
                          }
                          const D = x.substring(
                            j + 1
                          );
                          if (!isNaN(Number(D))) {
                            const C = W.lastIndexOf(".");
                            if (C !== -1) {
                              const k = W.substring(
                                0,
                                C
                              );
                              if (w.paths.has(k)) {
                                b = !0;
                                break;
                              }
                            }
                          }
                          j = W.lastIndexOf(".");
                        }
                        if (b) break;
                      }
                    if (!b && P.includes("deps") && w.depsFunction) {
                      const x = w.depsFunction(i);
                      let j = !1;
                      typeof x == "boolean" ? x && (j = !0) : B(w.deps, x) || (w.deps = x, j = !0), j && (b = !0);
                    }
                    b && w.forceUpdate();
                  }
                }
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const l = a.getState().getInitialOptions(t)?.validation, e = a.getState().addValidationError;
              if (!l?.zodSchema)
                throw new Error("Zod schema not found");
              if (!l?.key)
                throw new Error("Validation key not found");
              J(l.key);
              const r = a.getState().cogsStateStore[t];
              try {
                const i = a.getState().getValidationErrors(l.key);
                i && i.length > 0 && i.forEach(([p]) => {
                  p && p.startsWith(l.key) && J(p);
                });
                const d = l.zodSchema.safeParse(r);
                return d.success ? !0 : (d.error.errors.forEach((y) => {
                  const E = y.path, w = y.message, b = [l.key, ...E].join(".");
                  e(b, w);
                }), ot(t), !1);
              } catch (i) {
                return console.error("Zod schema validation failed", i), !1;
              }
            };
          if (c === "_componentId") return S;
          if (c === "getComponents")
            return () => a().stateComponents.get(t);
          if (c === "getAllFormRefs")
            return () => It.getState().getFormRefsByStateKey(t);
          if (c === "_initialState")
            return a.getState().initialStateGlobal[t];
          if (c === "_serverState")
            return a.getState().serverState[t];
          if (c === "_isLoading")
            return a.getState().isLoadingGlobal[t];
          if (c === "revertToInitialState")
            return v.revertToInitialState;
          if (c === "updateInitialState") return v.updateInitialState;
          if (c === "removeValidation") return v.removeValidation;
        }
        if (c === "getFormRef")
          return () => It.getState().getFormRef(t + "." + n.join("."));
        if (c === "validationWrapper")
          return ({
            children: l,
            hideMessage: e
          }) => /* @__PURE__ */ ft(
            Mt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: a.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: g?.validIndices,
              children: l
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return n;
        if (c === "_isServerSynced") return v._isServerSynced;
        if (c === "update")
          return (l, e) => {
            if (e?.debounce)
              _t(() => {
                rt(s, l, n, "");
                const r = a.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              rt(s, l, n, "");
              const r = a.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            I(n);
          };
        if (c === "formElement")
          return (l, e) => /* @__PURE__ */ ft(
            Rt,
            {
              setState: s,
              stateKey: t,
              path: n,
              child: l,
              formOpts: e
            }
          );
        const _ = [...n, c], nt = a.getState().getNestedState(t, _);
        return o(nt, _, g);
      }
    }, L = new Proxy(R, O);
    return h.set(F, {
      proxy: L,
      stateVersion: $
    }), L;
  }
  return o(
    a.getState().getNestedState(t, [])
  );
}
function Tt(t) {
  return at(Bt, { proxy: t });
}
function zt({
  proxy: t,
  rebuildStateShape: s
}) {
  const S = a().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? s(
    S,
    t._path
  ).stateMapNoRender(
    (h, $, I, v, o) => t._mapFn(h, $, I, v, o)
  ) : null;
}
function Bt({
  proxy: t
}) {
  const s = Y(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return Q(() => {
    const u = s.current;
    if (!u || !u.parentElement) return;
    const h = u.parentElement, I = Array.from(h.childNodes).indexOf(u);
    let v = h.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, h.setAttribute("data-parent-id", v));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: I,
      effect: t._effect
    };
    a.getState().addSignalElement(S, m);
    const n = a.getState().getNestedState(t._stateKey, t._path);
    let g;
    if (t._effect)
      try {
        g = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), g = n;
      }
    else
      g = n;
    g !== null && typeof g == "object" && (g = JSON.stringify(g));
    const F = document.createTextNode(String(g));
    u.replaceWith(F);
  }, [t._stateKey, t._path.join("."), t._effect]), at("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function ce(t) {
  const s = xt(
    (S) => {
      const u = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
    },
    () => a.getState().getNestedState(t._stateKey, t._path)
  );
  return at("text", {}, String(s));
}
function qt({
  stateKey: t,
  itemComponentId: s,
  itemPath: S,
  children: u
}) {
  const [, h] = et({}), [$, I] = Ut(), v = Y(null), o = Y(null), m = mt(
    (n) => {
      $(n), v.current = n;
    },
    [$]
  );
  return Q(() => {
    I.height > 0 && I.height !== o.current && (o.current = I.height, a.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: I.height,
        domRef: v.current
        // Store the actual DOM element reference
      }
    }));
  }, [I.height, t, S]), kt(() => {
    const n = `${t}////${s}`, g = a.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return g.components.set(n, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), a.getState().stateComponents.set(t, g), () => {
      const F = a.getState().stateComponents.get(t);
      F && F.components.delete(n);
    };
  }, [t, s, S.join(".")]), /* @__PURE__ */ ft("div", { ref: m, children: u });
}
export {
  Tt as $cogsSignal,
  ce as $cogsSignalStore,
  oe as addStateOptions,
  ie as createCogsState,
  se as notifyComponent,
  Ht as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
