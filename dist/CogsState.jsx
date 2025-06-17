"use client";
import { jsx as Et } from "react/jsx-runtime";
import { useState as Q, useRef as J, useEffect as ot, useLayoutEffect as lt, useMemo as _t, createElement as dt, useSyncExternalStore as Rt, startTransition as Dt, useCallback as Ct } from "react";
import { transformStateFunc as Ut, isDeepEqual as q, isFunction as K, getNestedValue as Z, getDifferences as wt, debounce as jt } from "./utility.js";
import { pushFunc as pt, updateFn as ct, cutFunc as mt, ValidationWrapper as Ht, FormControlComponent as Ft } from "./Functions.jsx";
import Bt from "superjson";
import { v4 as Ot } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as $t } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { applyPatch as Wt } from "fast-json-patch";
import zt from "react-use-measure";
function kt(t, i) {
  const m = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, T = m(t) || {};
  g(t, {
    ...T,
    ...i
  });
}
function xt({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const g = rt(t) || {}, T = m[t] || {}, N = r.getState().setInitialStateOptions, p = { ...T, ...g };
  let y = !1;
  if (i)
    for (const a in i)
      p.hasOwnProperty(a) ? (a == "localStorage" && i[a] && p[a].key !== i[a]?.key && (y = !0, p[a] = i[a]), a == "initialState" && i[a] && p[a] !== i[a] && // Different references
      !q(p[a], i[a]) && (y = !0, p[a] = i[a])) : (y = !0, p[a] = i[a]);
  y && N(t, p);
}
function Se(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const me = (t, i) => {
  let m = t;
  const [g, T] = Ut(m);
  (Object.keys(T).length > 0 || i && Object.keys(i).length > 0) && Object.keys(T).forEach((y) => {
    T[y] = T[y] || {}, T[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...T[y].formElements || {}
      // State-specific overrides
    }, rt(y) || r.getState().setInitialStateOptions(y, T[y]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const N = (y, a) => {
    const [h] = Q(a?.componentId ?? Ot());
    xt({
      stateKey: y,
      options: a,
      initialOptionsPart: T
    });
    const n = r.getState().cogsStateStore[y] || g[y], S = a?.modifyState ? a.modifyState(n) : n, [F, R] = Kt(
      S,
      {
        stateKey: y,
        syncUpdate: a?.syncUpdate,
        componentId: h,
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
  function p(y, a) {
    xt({ stateKey: y, options: a, initialOptionsPart: T }), a.localStorage && Xt(y, a), vt(y);
  }
  return { useCogsState: N, setCogsOptions: p };
}, {
  setUpdaterState: It,
  setState: et,
  getInitialOptions: rt,
  getKeyState: Vt,
  getValidationErrors: qt,
  setStateLog: Jt,
  updateInitialStateGlobal: At,
  addValidationError: Yt,
  removeValidationError: X,
  setServerSyncActions: Zt
} = r.getState(), bt = (t, i, m, g, T) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const N = K(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (N && g) {
    const p = `${g}-${i}-${N}`;
    let y;
    try {
      y = Tt(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: T ?? y
    }, h = Bt.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(h.json)
    );
  }
}, Tt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Xt = (t, i) => {
  const m = r.getState().cogsStateStore[t], { sessionId: g } = Pt(), T = K(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (T && g) {
    const N = Tt(
      `${g}-${t}-${T}`
    );
    if (N && N.lastUpdated > (N.lastSyncedWithServer || 0))
      return et(t, N.state), vt(t), !0;
  }
  return !1;
}, Gt = (t, i, m, g, T, N) => {
  const p = {
    initialState: i,
    updaterState: ht(
      t,
      g,
      T,
      N
    ),
    state: m
  };
  At(t, p.initialState), It(t, p.updaterState), et(t, p.state);
}, vt = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, Ie = (t, i) => {
  const m = r.getState().stateComponents.get(t);
  if (m) {
    const g = `${t}////${i}`, T = m.components.get(g);
    if ((T ? Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"] : null)?.includes("none"))
      return;
    T && T.forceUpdate();
  }
}, Qt = (t, i, m, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: Z(i, g),
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
        oldValue: Z(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Kt(t, {
  stateKey: i,
  serverSync: m,
  localStorage: g,
  formElements: T,
  reactiveDeps: N,
  reactiveType: p,
  componentId: y,
  initialState: a,
  syncUpdate: h,
  dependencies: n,
  serverState: S
} = {}) {
  const [F, R] = Q({}), { sessionId: D } = Pt();
  let B = !i;
  const [I] = Q(i ?? Ot()), l = r.getState().stateLog[I], ut = J(/* @__PURE__ */ new Set()), tt = J(y ?? Ot()), G = J(
    null
  );
  G.current = rt(I) ?? null, ot(() => {
    if (h && h.stateKey === I && h.path?.[0]) {
      et(I, (o) => ({
        ...o,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), ot(() => {
    if (a) {
      kt(I, {
        initialState: a
      });
      const e = G.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[I];
      if (!(c && !q(c, a) || !c) && !s)
        return;
      let u = null;
      const E = K(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && D && (u = Tt(`${D}-${I}-${E}`));
      let v = a, _ = !1;
      const C = s ? Date.now() : 0, O = u?.lastUpdated || 0, b = u?.lastSyncedWithServer || 0;
      s && C > O ? (v = e.serverState.data, _ = !0) : u && O > b && (v = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(v)), r.getState().initializeShadowState(I, a), Gt(
        I,
        a,
        v,
        at,
        tt.current,
        D
      ), _ && E && D && bt(v, I, e, D, Date.now()), vt(I), (Array.isArray(p) ? p : [p || "component"]).includes("none") || R({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), lt(() => {
    B && kt(I, {
      serverSync: m,
      formElements: T,
      initialState: a,
      localStorage: g,
      middleware: G.current?.middleware
    });
    const e = `${I}////${tt.current}`, o = r.getState().stateComponents.get(I) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: N || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(I, o), R({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(I));
    };
  }, []);
  const at = (e, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${I}-${o.join(".")}`;
      ut.current.add(u);
    }
    const f = r.getState();
    et(I, (u) => {
      const E = K(e) ? e(u) : e, v = `${I}-${o.join(".")}`;
      if (v) {
        let V = !1, $ = f.signalDomElements.get(v);
        if ((!$ || $.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const M = o.slice(0, -1), A = Z(E, M);
          if (Array.isArray(A)) {
            V = !0;
            const w = `${I}-${M.join(".")}`;
            $ = f.signalDomElements.get(w);
          }
        }
        if ($) {
          const M = V ? Z(E, o.slice(0, -1)) : Z(E, o);
          $.forEach(({ parentId: A, position: w, effect: x }) => {
            const L = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (L) {
              const W = Array.from(L.childNodes);
              if (W[w]) {
                const j = x ? new Function("state", `return (${x})(state)`)(M) : M;
                W[w].textContent = String(j);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (c || G.current?.validation?.key) && o && X(
        (c || G.current?.validation?.key) + "." + o.join(".")
      );
      const _ = o.slice(0, o.length - 1);
      s.updateType === "cut" && G.current?.validation?.key && X(
        G.current?.validation?.key + "." + _.join(".")
      ), s.updateType === "insert" && G.current?.validation?.key && qt(
        G.current?.validation?.key + "." + _.join(".")
      ).filter(([$, M]) => {
        let A = $?.split(".").length;
        if ($ == _.join(".") && A == _.length - 1) {
          let w = $ + "." + _;
          X($), Yt(w, M);
        }
      });
      const C = f.stateComponents.get(I);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const V = wt(u, E), $ = new Set(V), M = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          A,
          w
        ] of C.components.entries()) {
          let x = !1;
          const L = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
          if (console.log("component", w), !L.includes("none")) {
            if (L.includes("all")) {
              w.forceUpdate();
              continue;
            }
            if (L.includes("component") && ((w.paths.has(M) || w.paths.has("")) && (x = !0), !x))
              for (const W of $) {
                let j = W;
                for (; ; ) {
                  if (w.paths.has(j)) {
                    x = !0;
                    break;
                  }
                  const st = j.lastIndexOf(".");
                  if (st !== -1) {
                    const k = j.substring(
                      0,
                      st
                    );
                    if (!isNaN(
                      Number(j.substring(st + 1))
                    ) && w.paths.has(k)) {
                      x = !0;
                      break;
                    }
                    j = k;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (x) break;
              }
            if (!x && L.includes("deps") && w.depsFunction) {
              const W = w.depsFunction(E);
              let j = !1;
              typeof W == "boolean" ? W && (j = !0) : q(w.deps, W) || (w.deps = W, j = !0), j && (x = !0);
            }
            x && w.forceUpdate();
          }
        }
      }
      const O = Date.now();
      o = o.map((V, $) => {
        const M = o.slice(0, -1), A = Z(E, M);
        return $ === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (A.length - 1).toString() : V;
      });
      const { oldValue: b, newValue: U } = Qt(
        s.updateType,
        u,
        E,
        o
      ), Y = {
        timeStamp: O,
        stateKey: I,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: b,
        newValue: U
      };
      switch (s.updateType) {
        case "update":
          f.updateShadowAtPath(I, o, E);
          break;
        case "insert":
          const V = o.slice(0, -1);
          f.insertShadowArrayElement(I, V, U);
          break;
        case "cut":
          const $ = o.slice(0, -1), M = parseInt(o[o.length - 1]);
          f.removeShadowArrayElement(I, $, M);
          break;
      }
      if (Jt(I, (V) => {
        const M = [...V ?? [], Y].reduce((A, w) => {
          const x = `${w.stateKey}:${JSON.stringify(w.path)}`, L = A.get(x);
          return L ? (L.timeStamp = Math.max(L.timeStamp, w.timeStamp), L.newValue = w.newValue, L.oldValue = L.oldValue ?? w.oldValue, L.updateType = w.updateType) : A.set(x, { ...w }), A;
        }, /* @__PURE__ */ new Map());
        return Array.from(M.values());
      }), bt(
        E,
        I,
        G.current,
        D
      ), G.current?.middleware && G.current.middleware({
        updateLog: l,
        update: Y
      }), G.current?.serverSync) {
        const V = f.serverState[I], $ = G.current?.serverSync;
        Zt(I, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: E }),
          rollBackState: V,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  r.getState().updaterState[I] || (It(
    I,
    ht(
      I,
      at,
      tt.current,
      D
    )
  ), r.getState().cogsStateStore[I] || et(I, t), r.getState().initialStateGlobal[I] || At(I, t));
  const d = _t(() => ht(
    I,
    at,
    tt.current,
    D
  ), [I, D]);
  return [Vt(I), d];
}
function ht(t, i, m, g) {
  const T = /* @__PURE__ */ new Map();
  let N = 0;
  const p = (h) => {
    const n = h.join(".");
    for (const [S] of T)
      (S === n || S.startsWith(n + ".")) && T.delete(S);
    N++;
  }, y = {
    removeValidation: (h) => {
      h?.validationKey && X(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && X(n?.key), h?.validationKey && X(h.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), T.clear(), N++;
      const F = a(S, []), R = rt(t), D = K(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, B = `${g}-${t}-${D}`;
      B && localStorage.removeItem(B), It(t, F), et(t, S);
      const I = r.getState().stateComponents.get(t);
      return I && I.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (h) => {
      T.clear(), N++;
      const n = ht(
        t,
        i,
        m,
        g
      ), S = r.getState().initialStateGlobal[t], F = rt(t), R = K(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, D = `${g}-${t}-${R}`;
      return localStorage.getItem(D) && localStorage.removeItem(D), Dt(() => {
        At(t, h), r.getState().initializeShadowState(t, h), It(t, n), et(t, h);
        const B = r.getState().stateComponents.get(t);
        B && B.components.forEach((I) => {
          I.forceUpdate();
        });
      }), {
        fetchId: (B) => n.get()[B]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const h = r.getState().serverState[t];
      return !!(h && q(h, Vt(t)));
    }
  };
  function a(h, n = [], S) {
    const F = n.map(String).join(".");
    T.get(F);
    const R = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(y).forEach((I) => {
      R[I] = y[I];
    });
    const D = {
      apply(I, l, ut) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(I, l) {
        S?.validIndices && !Array.isArray(h) && (S = { ...S, validIndices: void 0 });
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
          const d = `${t}////${m}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const o = e.components.get(d);
            if (o && !o.paths.has("")) {
              const s = n.join(".");
              let c = !0;
              for (const f of o.paths)
                if (s.startsWith(f) && (s === f || s[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && o.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => wt(
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
                  const E = [s, ...u.path].join(".");
                  r.getState().addValidationError(E, u.message);
                });
                const f = r.getState().stateComponents.get(t);
                f && f.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = Z(e, n);
          return q(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = Z(e, n);
            return q(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = rt(t), o = K(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${g}-${t}-${o}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => S?.validIndices ? h.map((o, s) => ({
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
                  h[e],
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
                stickToBottom: c = !1,
                dependencies: f = []
              } = e, u = J(!1), E = J(null), [v, _] = Q({
                startIndex: 0,
                endIndex: 10
              }), [C, O] = Q("IDLE_AT_TOP"), b = J(!1), U = J(0), Y = J(f);
              J(0);
              const [V, $] = Q(0);
              ot(() => r.getState().subscribeToShadowState(t, () => {
                $((P) => P + 1);
              }), [t]);
              const M = r().getNestedState(
                t,
                n
              ), A = M.length, { totalHeight: w, positions: x } = _t(() => {
                const k = r.getState().getShadowMetadata(t, n) || [];
                let P = 0;
                const H = [];
                for (let z = 0; z < A; z++) {
                  H[z] = P;
                  const nt = k[z]?.virtualizer?.itemHeight;
                  P += nt || o;
                }
                return { totalHeight: P, positions: H };
              }, [
                A,
                t,
                n.join("."),
                o,
                V
              ]), L = _t(() => {
                const k = Math.max(0, v.startIndex), P = Math.min(A, v.endIndex), H = Array.from(
                  { length: P - k },
                  (nt, it) => k + it
                ), z = H.map((nt) => M[nt]);
                return a(z, n, {
                  ...S,
                  validIndices: H
                });
              }, [v.startIndex, v.endIndex, M, A]);
              lt(() => {
                const k = !q(
                  f,
                  Y.current
                ), P = A > U.current;
                if (k) {
                  console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), O("IDLE_AT_TOP");
                  return;
                }
                P && C === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), O("GETTING_HEIGHTS")), U.current = A, Y.current = f;
              }, [A, ...f]), lt(() => {
                const k = E.current;
                if (!k) return;
                let P;
                if (C === "IDLE_AT_TOP" && c && A > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), O("GETTING_HEIGHTS");
                else if (C === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), _({
                    startIndex: Math.max(0, A - 10 - s),
                    endIndex: A
                  }), P = setInterval(() => {
                    const H = A - 1;
                    ((r.getState().getShadowMetadata(t, n) || [])[H]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(P), u.current || (console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), O("SCROLLING_TO_BOTTOM")));
                  }, 100);
                else if (C === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), b.current = !0;
                  const H = U.current === 0 ? "auto" : "smooth";
                  k.scrollTo({
                    top: k.scrollHeight,
                    behavior: H
                  });
                  const z = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), b.current = !1, u.current = !1, O("LOCKED_AT_BOTTOM");
                    },
                    H === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(z);
                }
                return () => {
                  P && clearInterval(P);
                };
              }, [C, A, x]), ot(() => {
                const k = E.current;
                if (!k) return;
                const P = () => {
                  if (b.current)
                    return;
                  const { scrollTop: H, clientHeight: z } = k;
                  k.scrollHeight - H - k.clientHeight < 1 ? C === "IDLE_NOT_AT_BOTTOM" && O("LOCKED_AT_BOTTOM") : C !== "IDLE_NOT_AT_BOTTOM" && O("IDLE_NOT_AT_BOTTOM");
                  let it = A - 1, yt = 0, Nt = 0;
                  for (; yt <= it; ) {
                    const St = Math.floor((yt + it) / 2);
                    x[St] < H ? (Nt = St, yt = St + 1) : it = St - 1;
                  }
                  const gt = Math.max(
                    0,
                    Nt - s
                  );
                  if (gt === v.startIndex)
                    return;
                  console.log(
                    `Index changed from ${v.startIndex} to ${gt}. Updating range.`
                  );
                  let ft = gt;
                  const Lt = H + z;
                  for (; ft < A && x[ft] < Lt; )
                    ft++;
                  _({
                    startIndex: gt,
                    endIndex: Math.min(A, ft + s)
                  });
                };
                return k.addEventListener("scroll", P, {
                  passive: !0
                }), () => k.removeEventListener("scroll", P);
              }, [A, x, C, v.startIndex]);
              const W = Ct(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), O("SCROLLING_TO_BOTTOM");
              }, []), j = Ct(
                (k, P = "smooth") => {
                  E.current && x[k] !== void 0 && (O("IDLE_NOT_AT_BOTTOM"), E.current.scrollTo({
                    top: x[k],
                    behavior: P
                  }));
                },
                [x]
              ), st = {
                outer: {
                  ref: E,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${w}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${x[v.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: L,
                virtualizerProps: st,
                scrollToBottom: W,
                scrollToIndex: j
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, E) => e(u.item, E.item)
              ), c = s.map(({ item: u }) => u), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, E) => e(u, E)
              ), c = s.map(({ item: u }) => u), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, f);
            };
          if (l === "stateMap")
            return (e) => {
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, f) => f)).map((c, f) => {
                const u = o[c], E = [...n, c.toString()], v = a(u, E, S);
                return e(u, v, {
                  register: () => {
                    const [, C] = Q({}), O = `${m}-${n.join(".")}-${c}`;
                    lt(() => {
                      const b = `${t}////${O}`, U = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return U.components.set(b, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), r.getState().stateComponents.set(t, U), () => {
                        const Y = r.getState().stateComponents.get(t);
                        Y && Y.components.delete(b);
                      };
                    }, [t, O]);
                  },
                  index: f,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => h.map((s, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...n, f.toString()], E = a(s, u, S);
              return e(
                s,
                E,
                c,
                h,
                a(h, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => dt(te, {
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
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, f) => f)).map((c, f) => {
                const u = o[c], E = [...n, c.toString()], v = a(u, E, S), _ = `${m}-${n.join(".")}-${c}`;
                return dt(ne, {
                  key: c,
                  stateKey: t,
                  itemComponentId: _,
                  itemPath: E,
                  children: e(
                    u,
                    v,
                    f,
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
              const o = h;
              T.clear(), N++;
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
              const o = h[e];
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
            return (e) => (p(n), pt(i, e, n, t), a(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, s) => {
              const c = r.getState().getNestedState(t, n), f = K(e) ? e(c) : e;
              let u = null;
              if (!c.some((v) => {
                if (o) {
                  const C = o.every(
                    (O) => q(v[O], f[O])
                  );
                  return C && (u = v), C;
                }
                const _ = q(v, f);
                return _ && (u = v), _;
              }))
                p(n), pt(i, f, n, t);
              else if (s && u) {
                const v = s(u), _ = c.map(
                  (C) => q(C, u) ? v : C
                );
                p(n), ct(i, _, n);
              }
            };
          if (l === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return p(n), mt(i, n, t, e), a(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let o = 0; o < h.length; o++)
                h[o] === e && mt(i, n, t, o);
            };
          if (l === "toggleByValue")
            return (e) => {
              const o = h.findIndex((s) => s === e);
              o > -1 ? mt(i, n, t, o) : pt(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: f }, u) => e(f, u)
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
              const f = [...n, c.originalIndex.toString()];
              return a(c.item, f, S);
            };
        }
        const tt = n[n.length - 1];
        if (!isNaN(Number(tt))) {
          const d = n.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => mt(
              i,
              d,
              t,
              Number(tt)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(h)) {
              const d = r.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
            }
            return r.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => Mt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Mt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => Tt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), o = r.getState().getNestedState(t, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), s = e.join(".");
            d ? r.getState().setSelectedIndex(t, s, o) : r.getState().setSelectedIndex(t, s, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            ct(i, c, e), p(e);
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
            ct(i, c, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], s = Wt(e, d).newDocument;
              Gt(
                t,
                r.getState().initialStateGlobal[t],
                s,
                i,
                m,
                g
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const f = wt(e, s), u = new Set(f);
                for (const [
                  E,
                  v
                ] of c.components.entries()) {
                  let _ = !1;
                  const C = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      v.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (v.paths.has("") && (_ = !0), !_))
                      for (const O of u) {
                        if (v.paths.has(O)) {
                          _ = !0;
                          break;
                        }
                        let b = O.lastIndexOf(".");
                        for (; b !== -1; ) {
                          const U = O.substring(0, b);
                          if (v.paths.has(U)) {
                            _ = !0;
                            break;
                          }
                          const Y = O.substring(
                            b + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const V = U.lastIndexOf(".");
                            if (V !== -1) {
                              const $ = U.substring(
                                0,
                                V
                              );
                              if (v.paths.has($)) {
                                _ = !0;
                                break;
                              }
                            }
                          }
                          b = U.lastIndexOf(".");
                        }
                        if (_) break;
                      }
                    if (!_ && C.includes("deps") && v.depsFunction) {
                      const O = v.depsFunction(s);
                      let b = !1;
                      typeof O == "boolean" ? O && (b = !0) : q(v.deps, O) || (v.deps = O, b = !0), b && (_ = !0);
                    }
                    _ && v.forceUpdate();
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
              X(d.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const s = r.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([f]) => {
                  f && f.startsWith(d.key) && X(f);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const E = u.path, v = u.message, _ = [d.key, ...E].join(".");
                  e(_, v);
                }), vt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => $t.getState().getFormRefsByStateKey(t);
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
          return () => $t.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ Et(
            Ht,
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
              jt(() => {
                ct(i, d, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              ct(i, d, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ Et(
            Ft,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const G = [...n, l], at = r.getState().getNestedState(t, G);
        return a(at, G, S);
      }
    }, B = new Proxy(R, D);
    return T.set(F, {
      proxy: B,
      stateVersion: N
    }), B;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function Mt(t) {
  return dt(ee, { proxy: t });
}
function te({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (T, N, p, y, a) => t._mapFn(T, N, p, y, a)
  ) : null;
}
function ee({
  proxy: t
}) {
  const i = J(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return ot(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const T = g.parentElement, p = Array.from(T.childNodes).indexOf(g);
    let y = T.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, T.setAttribute("data-parent-id", y));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: p,
      effect: t._effect
    };
    r.getState().addSignalElement(m, h);
    const n = r.getState().getNestedState(t._stateKey, t._path);
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
    const F = document.createTextNode(String(S));
    g.replaceWith(F);
  }, [t._stateKey, t._path.join("."), t._effect]), dt("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function he(t) {
  const i = Rt(
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
  return dt("text", {}, String(i));
}
function ne({
  stateKey: t,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, T] = Q({}), [N, p] = zt(), y = J(null);
  return ot(() => {
    p.height > 0 && p.height !== y.current && (y.current = p.height, r.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), lt(() => {
    const a = `${t}////${i}`, h = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return h.components.set(a, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), r.getState().stateComponents.set(t, h), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, i, m.join(".")]), /* @__PURE__ */ Et("div", { ref: N, children: g });
}
export {
  Mt as $cogsSignal,
  he as $cogsSignalStore,
  Se as addStateOptions,
  me as createCogsState,
  Ie as notifyComponent,
  Kt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
