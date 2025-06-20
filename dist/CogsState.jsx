"use client";
import { jsx as It } from "react/jsx-runtime";
import { useState as K, useRef as q, useEffect as ot, useLayoutEffect as ct, useMemo as wt, createElement as lt, useSyncExternalStore as Ft, startTransition as Bt, useCallback as kt } from "react";
import { transformStateFunc as Wt, isDeepEqual as J, isFunction as tt, getNestedValue as Z, getDifferences as _t, debounce as zt } from "./utility.js";
import { ValidationWrapper as bt, pushFunc as Ot, updateFn as it, cutFunc as ht, FormControlComponent as qt } from "./Functions.jsx";
import Jt from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Mt } from "./store.js";
import { useCogsConfig as Lt } from "./CogsStateClient.jsx";
import { applyPatch as Yt } from "fast-json-patch";
import Zt from "react-use-measure";
function xt(t, c) {
  const m = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, T = m(t) || {};
  g(t, {
    ...T,
    ...c
  });
}
function Pt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const g = rt(t) || {}, T = m[t] || {}, C = o.getState().setInitialStateOptions, E = { ...T, ...g };
  let v = !1;
  if (c)
    for (const s in c)
      E.hasOwnProperty(s) ? (s == "localStorage" && c[s] && E[s].key !== c[s]?.key && (v = !0, E[s] = c[s]), s == "initialState" && c[s] && E[s] !== c[s] && // Different references
      !J(E[s], c[s]) && (v = !0, E[s] = c[s])) : (v = !0, E[s] = c[s]);
  v && C(t, E);
}
function Te(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const ve = (t, c) => {
  let m = t;
  const [g, T] = Wt(m);
  (Object.keys(T).length > 0 || c && Object.keys(c).length > 0) && Object.keys(T).forEach((v) => {
    T[v] = T[v] || {}, T[v].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...T[v].formElements || {}
      // State-specific overrides
    }, rt(v) || o.getState().setInitialStateOptions(v, T[v]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const C = (v, s) => {
    const [I] = K(s?.componentId ?? At());
    Pt({
      stateKey: v,
      options: s,
      initialOptionsPart: T
    });
    const r = o.getState().cogsStateStore[v] || g[v], f = s?.modifyState ? s.modifyState(r) : r, [W, j] = ne(
      f,
      {
        stateKey: v,
        syncUpdate: s?.syncUpdate,
        componentId: I,
        localStorage: s?.localStorage,
        middleware: s?.middleware,
        enabledSync: s?.enabledSync,
        reactiveType: s?.reactiveType,
        reactiveDeps: s?.reactiveDeps,
        initialState: s?.initialState,
        dependencies: s?.dependencies,
        serverState: s?.serverState
      }
    );
    return j;
  };
  function E(v, s) {
    Pt({ stateKey: v, options: s, initialOptionsPart: T }), s.localStorage && te(v, s), dt(v);
  }
  return { useCogsState: C, setCogsOptions: E };
}, {
  setUpdaterState: Tt,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: Rt,
  getValidationErrors: Xt,
  setStateLog: Qt,
  updateInitialStateGlobal: Nt,
  addValidationError: Dt,
  removeValidationError: X,
  setServerSyncActions: Kt
} = o.getState(), Vt = (t, c, m, g, T) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    g
  );
  const C = tt(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (C && g) {
    const E = `${g}-${c}-${C}`;
    let v;
    try {
      v = yt(E)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: T ?? v
    }, I = Jt.serialize(s);
    window.localStorage.setItem(
      E,
      JSON.stringify(I.json)
    );
  }
}, yt = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, te = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: g } = Lt(), T = tt(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (T && g) {
    const C = yt(
      `${g}-${t}-${T}`
    );
    if (C && C.lastUpdated > (C.lastSyncedWithServer || 0))
      return nt(t, C.state), dt(t), !0;
  }
  return !1;
}, jt = (t, c, m, g, T, C) => {
  const E = {
    initialState: c,
    updaterState: vt(
      t,
      g,
      T,
      C
    ),
    state: m
  };
  Nt(t, E.initialState), Tt(t, E.updaterState), nt(t, E.state);
}, dt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, ye = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const g = `${t}////${c}`, T = m.components.get(g);
    if ((T ? Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"] : null)?.includes("none"))
      return;
    T && T.forceUpdate();
  }
}, ee = (t, c, m, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: Z(c, g),
        newValue: Z(m, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Z(m, g)
      };
    case "cut":
      return {
        oldValue: Z(c, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function ne(t, {
  stateKey: c,
  serverSync: m,
  localStorage: g,
  formElements: T,
  reactiveDeps: C,
  reactiveType: E,
  componentId: v,
  initialState: s,
  syncUpdate: I,
  dependencies: r,
  serverState: f
} = {}) {
  const [W, j] = K({}), { sessionId: U } = Lt();
  let z = !c;
  const [h] = K(c ?? At()), l = o.getState().stateLog[h], ut = q(/* @__PURE__ */ new Set()), et = q(v ?? At()), L = q(
    null
  );
  L.current = rt(h) ?? null, ot(() => {
    if (I && I.stateKey === h && I.path?.[0]) {
      nt(h, (n) => ({
        ...n,
        [I.path[0]]: I.newValue
      }));
      const e = `${I.stateKey}:${I.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: I.timeStamp,
        userId: I.userId
      });
    }
  }, [I]), ot(() => {
    if (s) {
      xt(h, {
        initialState: s
      });
      const e = L.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !J(i, s) || !i) && !a)
        return;
      let u = null;
      const y = tt(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      y && U && (u = yt(`${U}-${h}-${y}`));
      let p = s, _ = !1;
      const N = a ? Date.now() : 0, w = u?.lastUpdated || 0, k = u?.lastSyncedWithServer || 0;
      a && N > w ? (p = e.serverState.data, _ = !0) : u && w > k && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), o.getState().initializeShadowState(h, s), jt(
        h,
        s,
        p,
        at,
        et.current,
        U
      ), _ && y && U && Vt(p, h, e, U, Date.now()), dt(h), (Array.isArray(E) ? E : [E || "component"]).includes("none") || j({});
    }
  }, [
    s,
    f?.status,
    f?.data,
    ...r || []
  ]), ct(() => {
    z && xt(h, {
      serverSync: m,
      formElements: T,
      initialState: s,
      localStorage: g,
      middleware: L.current?.middleware
    });
    const e = `${h}////${et.current}`, n = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => j({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: C || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, n), j({}), () => {
      n && (n.components.delete(e), n.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const at = (e, n, a, i) => {
    if (Array.isArray(n)) {
      const u = `${h}-${n.join(".")}`;
      ut.current.add(u);
    }
    const S = o.getState();
    nt(h, (u) => {
      const y = tt(e) ? e(u) : e, p = `${h}-${n.join(".")}`;
      if (p) {
        let M = !1, $ = S.signalDomElements.get(p);
        if ((!$ || $.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const R = n.slice(0, -1), V = Z(y, R);
          if (Array.isArray(V)) {
            M = !0;
            const O = `${h}-${R.join(".")}`;
            $ = S.signalDomElements.get(O);
          }
        }
        if ($) {
          const R = M ? Z(y, n.slice(0, -1)) : Z(y, n);
          $.forEach(({ parentId: V, position: O, effect: A }) => {
            const D = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if (D) {
              const G = Array.from(D.childNodes);
              if (G[O]) {
                const B = A ? new Function("state", `return (${A})(state)`)(R) : R;
                G[O].textContent = String(B);
              }
            }
          });
        }
      }
      console.log("shadowState", S.shadowStateStore), a.updateType === "update" && (i || L.current?.validation?.key) && n && X(
        (i || L.current?.validation?.key) + "." + n.join(".")
      );
      const _ = n.slice(0, n.length - 1);
      a.updateType === "cut" && L.current?.validation?.key && X(
        L.current?.validation?.key + "." + _.join(".")
      ), a.updateType === "insert" && L.current?.validation?.key && Xt(
        L.current?.validation?.key + "." + _.join(".")
      ).filter(([$, R]) => {
        let V = $?.split(".").length;
        if ($ == _.join(".") && V == _.length - 1) {
          let O = $ + "." + _;
          X($), Dt(O, R);
        }
      });
      const N = S.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const M = _t(u, y), $ = new Set(M), R = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          V,
          O
        ] of N.components.entries()) {
          let A = !1;
          const D = Array.isArray(O.reactiveType) ? O.reactiveType : [O.reactiveType || "component"];
          if (console.log("component", O), !D.includes("none")) {
            if (D.includes("all")) {
              O.forceUpdate();
              continue;
            }
            if (D.includes("component") && ((O.paths.has(R) || O.paths.has("")) && (A = !0), !A))
              for (const G of $) {
                let B = G;
                for (; ; ) {
                  if (O.paths.has(B)) {
                    A = !0;
                    break;
                  }
                  const st = B.lastIndexOf(".");
                  if (st !== -1) {
                    const gt = B.substring(
                      0,
                      st
                    );
                    if (!isNaN(
                      Number(B.substring(st + 1))
                    ) && O.paths.has(gt)) {
                      A = !0;
                      break;
                    }
                    B = gt;
                  } else
                    B = "";
                  if (B === "")
                    break;
                }
                if (A) break;
              }
            if (!A && D.includes("deps") && O.depsFunction) {
              const G = O.depsFunction(y);
              let B = !1;
              typeof G == "boolean" ? G && (B = !0) : J(O.deps, G) || (O.deps = G, B = !0), B && (A = !0);
            }
            A && O.forceUpdate();
          }
        }
      }
      const w = Date.now();
      n = n.map((M, $) => {
        const R = n.slice(0, -1), V = Z(y, R);
        return $ === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (V.length - 1).toString() : M;
      });
      const { oldValue: k, newValue: H } = ee(
        a.updateType,
        u,
        y,
        n
      ), Y = {
        timeStamp: w,
        stateKey: h,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: k,
        newValue: H
      };
      switch (a.updateType) {
        case "update":
          S.updateShadowAtPath(h, n, y);
          break;
        case "insert":
          const M = n.slice(0, -1);
          S.insertShadowArrayElement(h, M, H);
          break;
        case "cut":
          const $ = n.slice(0, -1), R = parseInt(n[n.length - 1]);
          S.removeShadowArrayElement(h, $, R);
          break;
      }
      if (Qt(h, (M) => {
        const R = [...M ?? [], Y].reduce((V, O) => {
          const A = `${O.stateKey}:${JSON.stringify(O.path)}`, D = V.get(A);
          return D ? (D.timeStamp = Math.max(D.timeStamp, O.timeStamp), D.newValue = O.newValue, D.oldValue = D.oldValue ?? O.oldValue, D.updateType = O.updateType) : V.set(A, { ...O }), V;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), Vt(
        y,
        h,
        L.current,
        U
      ), L.current?.middleware && L.current.middleware({
        updateLog: l,
        update: Y
      }), L.current?.serverSync) {
        const M = S.serverState[h], $ = L.current?.serverSync;
        Kt(h, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: y }),
          rollBackState: M,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return y;
    });
  };
  o.getState().updaterState[h] || (Tt(
    h,
    vt(
      h,
      at,
      et.current,
      U
    )
  ), o.getState().cogsStateStore[h] || nt(h, t), o.getState().initialStateGlobal[h] || Nt(h, t));
  const d = wt(() => vt(
    h,
    at,
    et.current,
    U
  ), [h, U]);
  return [Rt(h), d];
}
function vt(t, c, m, g) {
  const T = /* @__PURE__ */ new Map();
  let C = 0;
  const E = (I) => {
    const r = I.join(".");
    for (const [f] of T)
      (f === r || f.startsWith(r + ".")) && T.delete(f);
    C++;
  }, v = {
    removeValidation: (I) => {
      I?.validationKey && X(I.validationKey);
    },
    revertToInitialState: (I) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && X(r?.key), I?.validationKey && X(I.validationKey);
      const f = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), T.clear(), C++;
      const W = s(f, []), j = rt(t), U = tt(j?.localStorage?.key) ? j?.localStorage?.key(f) : j?.localStorage?.key, z = `${g}-${t}-${U}`;
      z && localStorage.removeItem(z), Tt(t, W), nt(t, f);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (I) => {
      T.clear(), C++;
      const r = vt(
        t,
        c,
        m,
        g
      ), f = o.getState().initialStateGlobal[t], W = rt(t), j = tt(W?.localStorage?.key) ? W?.localStorage?.key(f) : W?.localStorage?.key, U = `${g}-${t}-${j}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Bt(() => {
        Nt(t, I), o.getState().initializeShadowState(t, I), Tt(t, r), nt(t, I);
        const z = o.getState().stateComponents.get(t);
        z && z.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (z) => r.get()[z]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const I = o.getState().serverState[t];
      return !!(I && J(I, Rt(t)));
    }
  };
  function s(I, r = [], f) {
    const W = r.map(String).join(".");
    T.get(W);
    const j = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(v).forEach((h) => {
      j[h] = v[h];
    });
    const U = {
      apply(h, l, ut) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, r);
      },
      get(h, l) {
        f?.validIndices && !Array.isArray(I) && (f = { ...f, validIndices: void 0 });
        const ut = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ut.has(l)) {
          const d = `${t}////${m}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(d);
            if (n && !n.paths.has("")) {
              const a = r.join(".");
              let i = !0;
              for (const S of n.paths)
                if (a.startsWith(S) && (a === S || a[S.length] === ".")) {
                  i = !1;
                  break;
                }
              i && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => _t(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && r.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = o.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const i = await e.action(n);
              if (i && !i.success && i.errors && a) {
                o.getState().removeValidationError(a), i.errors.forEach((u) => {
                  const y = [a, ...u.path].join(".");
                  o.getState().addValidationError(y, u.message);
                });
                const S = o.getState().stateComponents.get(t);
                S && S.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, r), e = o.getState().initialStateGlobal[t], n = Z(e, r);
          return J(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], n = Z(e, r);
            return J(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = rt(t), n = tt(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + r.join("."));
          };
        if (Array.isArray(I)) {
          const d = () => f?.validIndices ? I.map((n, a) => ({
            item: n,
            originalIndex: f.validIndices[a]
          })) : o.getState().getNestedState(t, r).map((n, a) => ({
            item: n,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, r.join("."));
              if (e !== void 0)
                return s(
                  I[e],
                  [...r, e.toString()],
                  f
                );
            };
          if (l === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: t, path: r });
            };
          if (l === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(t, r.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: n = 50,
                overscan: a = 6,
                stickToBottom: i = !1,
                dependencies: S = []
              } = e, u = q(!1), y = q(null), [p, _] = K({
                startIndex: 0,
                endIndex: 10
              }), [N, w] = K("IDLE_AT_TOP"), k = q(!1), H = q(0), Y = q(S), M = q(0), [$, R] = K(0), V = q(null);
              ot(() => o.getState().subscribeToShadowState(t, () => {
                R((x) => x + 1);
              }), [t]);
              const O = o().getNestedState(
                t,
                r
              ), A = O.length, { totalHeight: D, positions: G } = wt(() => {
                const b = o.getState().getShadowMetadata(t, r) || [];
                let x = 0;
                const F = [];
                for (let P = 0; P < A; P++) {
                  F[P] = x;
                  const Q = b[P]?.virtualizer?.itemHeight;
                  x += Q || n;
                }
                return { totalHeight: x, positions: F };
              }, [
                A,
                t,
                r.join("."),
                n,
                $
              ]), B = wt(() => {
                const b = Math.max(0, p.startIndex), x = Math.min(A, p.endIndex), F = Array.from(
                  { length: x - b },
                  (Q, ft) => b + ft
                ), P = F.map((Q) => O[Q]);
                return s(P, r, {
                  ...f,
                  validIndices: F
                });
              }, [p.startIndex, p.endIndex, O, A]);
              ct(() => {
                const b = y.current;
                if (!b) return;
                const x = A > H.current;
                if (x && V.current) {
                  const { top: F, height: P } = V.current;
                  k.current = !0, b.scrollTop = F + (b.scrollHeight - P), console.log(
                    `ANCHOR RESTORED to scrollTop: ${b.scrollTop}`
                  ), setTimeout(() => {
                    k.current = !1;
                  }, 100), V.current = null;
                } else {
                  if (!J(
                    S,
                    Y.current
                  )) {
                    console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), w("IDLE_AT_TOP");
                    return;
                  }
                  x && N === "LOCKED_AT_BOTTOM" && i && (console.log(
                    "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                  ), w("GETTING_HEIGHTS"));
                }
                H.current = A, Y.current = S;
              }, [A, ...S]), ct(() => {
                const b = y.current;
                if (!b) return;
                let x;
                if (N === "IDLE_AT_TOP" && i && A > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), w("GETTING_HEIGHTS");
                else if (N === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), _({
                    startIndex: Math.max(0, A - 10 - a),
                    endIndex: A
                  }), x = setInterval(() => {
                    const F = A - 1;
                    ((o.getState().getShadowMetadata(t, r) || [])[F]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(x), u.current || (console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), w("SCROLLING_TO_BOTTOM")));
                  }, 100);
                else if (N === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), k.current = !0;
                  const F = H.current === 0 ? "auto" : "smooth";
                  b.scrollTo({
                    top: b.scrollHeight,
                    behavior: F
                  });
                  const P = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), k.current = !1, u.current = !1, w("LOCKED_AT_BOTTOM");
                    },
                    F === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(P);
                }
                return () => {
                  x && clearInterval(x);
                };
              }, [N, A, G]), ot(() => {
                const b = y.current;
                if (!b) return;
                const x = n, F = () => {
                  if (k.current)
                    return;
                  const { scrollTop: P, scrollHeight: Q, clientHeight: ft } = b;
                  if (Q - P - ft < 10 ? (N !== "LOCKED_AT_BOTTOM" && w("LOCKED_AT_BOTTOM"), V.current = null) : (N !== "IDLE_NOT_AT_BOTTOM" && w("IDLE_NOT_AT_BOTTOM"), V.current = {
                    top: P,
                    height: Q
                  }), Math.abs(P - M.current) < x)
                    return;
                  console.log(
                    `Threshold passed at ${P}px. Recalculating range...`
                  );
                  let pt = A - 1, Et = 0, Ct = 0;
                  for (; Et <= pt; ) {
                    const mt = Math.floor((Et + pt) / 2);
                    G[mt] < P ? (Ct = mt, Et = mt + 1) : pt = mt - 1;
                  }
                  const $t = Math.max(0, Ct - a);
                  let St = $t;
                  const Ht = P + ft;
                  for (; St < A && G[St] < Ht; )
                    St++;
                  _({
                    startIndex: $t,
                    endIndex: Math.min(A, St + a)
                  }), M.current = P;
                };
                return b.addEventListener("scroll", F, {
                  passive: !0
                }), () => b.removeEventListener("scroll", F);
              }, [A, G, n, a, N]);
              const st = kt(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), w("SCROLLING_TO_BOTTOM");
              }, []), gt = kt(
                (b, x = "smooth") => {
                  y.current && G[b] !== void 0 && (w("IDLE_NOT_AT_BOTTOM"), y.current.scrollTo({
                    top: G[b],
                    behavior: x
                  }));
                },
                [G]
              ), Ut = {
                outer: {
                  ref: y,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${D}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${G[p.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: B,
                virtualizerProps: Ut,
                scrollToBottom: st,
                scrollToIndex: gt
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, y) => e(u.item, y.item)
              ), i = a.map(({ item: u }) => u), S = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(i, r, S);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, y) => e(u, y)
              ), i = a.map(({ item: u }) => u), S = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(i, r, S);
            };
          if (l === "stateMap")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (f?.validIndices || Array.from({ length: n.length }, (i, S) => S)).map((i, S) => {
                const u = n[i], y = [...r, i.toString()], p = s(u, y, f);
                return e(u, p, {
                  register: () => {
                    const [, N] = K({}), w = `${m}-${r.join(".")}-${i}`;
                    ct(() => {
                      const k = `${t}////${w}`, H = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return H.components.set(k, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([y.join(".")])
                      }), o.getState().stateComponents.set(t, H), () => {
                        const Y = o.getState().stateComponents.get(t);
                        Y && Y.components.delete(k);
                      };
                    }, [t, w]);
                  },
                  index: S,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${r.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => I.map((a, i) => {
              let S;
              f?.validIndices && f.validIndices[i] !== void 0 ? S = f.validIndices[i] : S = i;
              const u = [...r, S.toString()], y = s(a, u, f);
              return e(
                a,
                y,
                i,
                I,
                s(I, r, f)
              );
            });
          if (l === "$stateMap")
            return (e) => lt(re, {
              proxy: {
                _stateKey: t,
                _path: r,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateList")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (f?.validIndices || Array.from({ length: n.length }, (i, S) => S)).map((i, S) => {
                const u = n[i], y = [...r, i.toString()], p = s(u, y, f), _ = `${m}-${r.join(".")}-${i}`, N = o.getState().getInitialOptions(t), w = N?.formElements?.validation, k = e(
                  u,
                  p,
                  i,
                  // Use originalIndex here
                  n,
                  s(n, r, f)
                );
                return lt(ae, {
                  key: i,
                  stateKey: t,
                  itemComponentId: _,
                  itemPath: y,
                  children: w ? (
                    // Automatically wrap with validation wrapper
                    /* @__PURE__ */ It(
                      bt,
                      {
                        formOpts: void 0,
                        path: y,
                        validationKey: N?.validation?.key || "",
                        stateKey: t,
                        validIndices: f?.validIndices,
                        children: k
                      }
                    )
                  ) : k
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${r.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const n = I;
              T.clear(), C++;
              const a = n.flatMap(
                (i) => i[e] ?? []
              );
              return s(
                a,
                [...r, "[*]", e],
                f
              );
            };
          if (l === "index")
            return (e) => {
              const n = I[e];
              return s(n, [...r, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, r);
              if (e.length === 0) return;
              const n = e.length - 1, a = e[n], i = [...r, n.toString()];
              return s(a, i);
            };
          if (l === "insert")
            return (e) => (E(r), Ot(c, e, r, t), s(
              o.getState().getNestedState(t, r),
              r
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const i = o.getState().getNestedState(t, r), S = tt(e) ? e(i) : e;
              let u = null;
              if (!i.some((p) => {
                if (n) {
                  const N = n.every(
                    (w) => J(p[w], S[w])
                  );
                  return N && (u = p), N;
                }
                const _ = J(p, S);
                return _ && (u = p), _;
              }))
                E(r), Ot(c, S, r, t);
              else if (a && u) {
                const p = a(u), _ = i.map(
                  (N) => J(N, u) ? p : N
                );
                E(r), it(c, _, r);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return E(r), ht(c, r, t, e), s(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < I.length; n++)
                I[n] === e && ht(c, r, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = I.findIndex((a) => a === e);
              n > -1 ? ht(c, r, t, n) : Ot(c, e, r, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: S }, u) => e(S, u)
              );
              if (!a) return;
              const i = [...r, a.originalIndex.toString()];
              return s(a.item, i, f);
            };
          if (l === "findWith")
            return (e, n) => {
              const i = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!i) return;
              const S = [...r, i.originalIndex.toString()];
              return s(i.item, S, f);
            };
        }
        const et = r[r.length - 1];
        if (!isNaN(Number(et))) {
          const d = r.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ht(
              c,
              d,
              t,
              Number(et)
            );
        }
        if (l === "get")
          return () => {
            if (f?.validIndices && Array.isArray(I)) {
              const d = o.getState().getNestedState(t, r);
              return f.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, r);
          };
        if (l === "$derive")
          return (d) => Gt({
            _stateKey: t,
            _path: r,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Gt({
            _stateKey: t,
            _path: r
          });
        if (l === "lastSynced") {
          const d = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => yt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = r.slice(0, -1), e = d.join("."), n = o.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(r[r.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = r.slice(0, -1), n = Number(r[r.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, n) : o.getState().setSelectedIndex(t, a, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            it(c, i, e), E(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = r.slice(0, -1), e = Number(r[r.length - 1]), n = d.join("."), a = o.getState().getSelectedIndex(t, n);
            o.getState().setSelectedIndex(
              t,
              n,
              a === e ? void 0 : e
            );
            const i = o.getState().getNestedState(t, [...d]);
            it(c, i, d), E(d);
          };
        if (r.length == 0) {
          if (l === "addValidation")
            return (d) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              X(e.key), console.log("addValidationError", d), d.forEach((n) => {
                const a = [e.key, ...n.path].join(".");
                console.log("fullErrorPath", a), Dt(a, n.message);
              }), dt(t);
            };
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Yt(e, d).newDocument;
              jt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                c,
                m,
                g
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const S = _t(e, a), u = new Set(S);
                for (const [
                  y,
                  p
                ] of i.components.entries()) {
                  let _ = !1;
                  const N = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (p.paths.has("") && (_ = !0), !_))
                      for (const w of u) {
                        if (p.paths.has(w)) {
                          _ = !0;
                          break;
                        }
                        let k = w.lastIndexOf(".");
                        for (; k !== -1; ) {
                          const H = w.substring(0, k);
                          if (p.paths.has(H)) {
                            _ = !0;
                            break;
                          }
                          const Y = w.substring(
                            k + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const M = H.lastIndexOf(".");
                            if (M !== -1) {
                              const $ = H.substring(
                                0,
                                M
                              );
                              if (p.paths.has($)) {
                                _ = !0;
                                break;
                              }
                            }
                          }
                          k = H.lastIndexOf(".");
                        }
                        if (_) break;
                      }
                    if (!_ && N.includes("deps") && p.depsFunction) {
                      const w = p.depsFunction(a);
                      let k = !1;
                      typeof w == "boolean" ? w && (k = !0) : J(p.deps, w) || (p.deps = w, k = !0), k && (_ = !0);
                    }
                    _ && p.forceUpdate();
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
              X(d.key);
              const n = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([S]) => {
                  S && S.startsWith(d.key) && X(S);
                });
                const i = d.zodSchema.safeParse(n);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const y = u.path, p = u.message, _ = [d.key, ...y].join(".");
                  e(_, p);
                }), dt(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Mt.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return o.getState().serverState[t];
          if (l === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return v.revertToInitialState;
          if (l === "updateInitialState") return v.updateInitialState;
          if (l === "removeValidation") return v.removeValidation;
        }
        if (l === "getFormRef")
          return () => Mt.getState().getFormRef(t + "." + r.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ It(
            bt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: f?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return r;
        if (l === "_isServerSynced") return v._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              zt(() => {
                it(c, d, r, "");
                const n = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              it(c, d, r, "");
              const n = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(n);
            }
            E(r);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ It(
            qt,
            {
              setState: c,
              stateKey: t,
              path: r,
              child: d,
              formOpts: e
            }
          );
        const L = [...r, l], at = o.getState().getNestedState(t, L);
        return s(at, L, f);
      }
    }, z = new Proxy(j, U);
    return T.set(W, {
      proxy: z,
      stateVersion: C
    }), z;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function Gt(t) {
  return lt(oe, { proxy: t });
}
function re({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (T, C, E, v, s) => t._mapFn(T, C, E, v, s)
  ) : null;
}
function oe({
  proxy: t
}) {
  const c = q(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return ot(() => {
    const g = c.current;
    if (!g || !g.parentElement) return;
    const T = g.parentElement, E = Array.from(T.childNodes).indexOf(g);
    let v = T.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, T.setAttribute("data-parent-id", v));
    const I = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: E,
      effect: t._effect
    };
    o.getState().addSignalElement(m, I);
    const r = o.getState().getNestedState(t._stateKey, t._path);
    let f;
    if (t._effect)
      try {
        f = new Function(
          "state",
          `return (${t._effect})(state)`
        )(r);
      } catch (j) {
        console.error("Error evaluating effect function during mount:", j), f = r;
      }
    else
      f = r;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const W = document.createTextNode(String(f));
    g.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), lt("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function pe(t) {
  const c = Ft(
    (m) => {
      const g = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return lt("text", {}, String(c));
}
function ae({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: g
}) {
  const [, T] = K({}), [C, E] = Zt(), v = q(null);
  return ot(() => {
    E.height > 0 && E.height !== v.current && (v.current = E.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: E.height
      }
    }));
  }, [E.height, t, m]), ct(() => {
    const s = `${t}////${c}`, I = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return I.components.set(s, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, I), () => {
      const r = o.getState().stateComponents.get(t);
      r && r.components.delete(s);
    };
  }, [t, c, m.join(".")]), /* @__PURE__ */ It("div", { ref: C, children: g });
}
export {
  Gt as $cogsSignal,
  pe as $cogsSignalStore,
  Te as addStateOptions,
  ve as createCogsState,
  ye as notifyComponent,
  ne as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
