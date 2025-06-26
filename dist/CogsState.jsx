"use client";
import { jsx as _t } from "react/jsx-runtime";
import { useState as K, useRef as q, useEffect as ot, useLayoutEffect as lt, useMemo as wt, createElement as dt, useSyncExternalStore as Bt, startTransition as Ft, useCallback as bt } from "react";
import { transformStateFunc as Wt, isDeepEqual as J, isFunction as tt, getNestedValue as Z, getDifferences as At, debounce as zt } from "./utility.js";
import { pushFunc as Ot, updateFn as ct, cutFunc as ht, ValidationWrapper as qt, FormControlComponent as Jt } from "./Functions.jsx";
import Yt from "superjson";
import { v4 as Nt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Mt } from "./store.js";
import { useCogsConfig as Lt } from "./CogsStateClient.jsx";
import { applyPatch as Zt } from "fast-json-patch";
import Xt from "react-use-measure";
function xt(t, c) {
  const m = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, I = m(t) || {};
  g(t, {
    ...I,
    ...c
  });
}
function Pt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const g = rt(t) || {}, I = m[t] || {}, N = o.getState().setInitialStateOptions, p = { ...I, ...g };
  let v = !1;
  if (c)
    for (const s in c)
      p.hasOwnProperty(s) ? (s == "localStorage" && c[s] && p[s].key !== c[s]?.key && (v = !0, p[s] = c[s]), s == "initialState" && c[s] && p[s] !== c[s] && // Different references
      !J(p[s], c[s]) && (v = !0, p[s] = c[s])) : (v = !0, p[s] = c[s]);
  v && N(t, p);
}
function Ie(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const ve = (t, c) => {
  let m = t;
  const [g, I] = Wt(m);
  (Object.keys(I).length > 0 || c && Object.keys(c).length > 0) && Object.keys(I).forEach((v) => {
    I[v] = I[v] || {}, I[v].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...I[v].formElements || {}
      // State-specific overrides
    }, rt(v) || o.getState().setInitialStateOptions(v, I[v]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const N = (v, s) => {
    const [T] = K(s?.componentId ?? Nt());
    Pt({
      stateKey: v,
      options: s,
      initialOptionsPart: I
    });
    const r = o.getState().cogsStateStore[v] || g[v], S = s?.modifyState ? s.modifyState(r) : r, [W, j] = re(
      S,
      {
        stateKey: v,
        syncUpdate: s?.syncUpdate,
        componentId: T,
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
  function p(v, s) {
    Pt({ stateKey: v, options: s, initialOptionsPart: I }), s.localStorage && ee(v, s), ut(v);
  }
  return { useCogsState: N, setCogsOptions: p };
}, {
  setUpdaterState: Tt,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: Rt,
  getValidationErrors: Qt,
  setStateLog: Kt,
  updateInitialStateGlobal: Ct,
  addValidationError: Dt,
  removeValidationError: Q,
  setServerSyncActions: te
} = o.getState(), Vt = (t, c, m, g, I) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    g
  );
  const N = tt(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (N && g) {
    const p = `${g}-${c}-${N}`;
    let v;
    try {
      v = vt(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? v
    }, T = Yt.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(T.json)
    );
  }
}, vt = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, ee = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: g } = Lt(), I = tt(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (I && g) {
    const N = vt(
      `${g}-${t}-${I}`
    );
    if (N && N.lastUpdated > (N.lastSyncedWithServer || 0))
      return nt(t, N.state), ut(t), !0;
  }
  return !1;
}, Ht = (t, c, m, g, I, N) => {
  const p = {
    initialState: c,
    updaterState: It(
      t,
      g,
      I,
      N
    ),
    state: m
  };
  Ct(t, p.initialState), Tt(t, p.updaterState), nt(t, p.state);
}, ut = (t) => {
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
    const g = `${t}////${c}`, I = m.components.get(g);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, ne = (t, c, m, g) => {
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
function re(t, {
  stateKey: c,
  serverSync: m,
  localStorage: g,
  formElements: I,
  reactiveDeps: N,
  reactiveType: p,
  componentId: v,
  initialState: s,
  syncUpdate: T,
  dependencies: r,
  serverState: S
} = {}) {
  const [W, j] = K({}), { sessionId: U } = Lt();
  let z = !c;
  const [h] = K(c ?? Nt()), l = o.getState().stateLog[h], gt = q(/* @__PURE__ */ new Set()), et = q(v ?? Nt()), R = q(
    null
  );
  R.current = rt(h) ?? null, ot(() => {
    if (T && T.stateKey === h && T.path?.[0]) {
      nt(h, (n) => ({
        ...n,
        [T.path[0]]: T.newValue
      }));
      const e = `${T.stateKey}:${T.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: T.timeStamp,
        userId: T.userId
      });
    }
  }, [T]), ot(() => {
    if (s) {
      xt(h, {
        initialState: s
      });
      const e = R.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !J(i, s) || !i) && !a)
        return;
      let u = null;
      const E = tt(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      E && U && (u = vt(`${U}-${h}-${E}`));
      let y = s, _ = !1;
      const C = a ? Date.now() : 0, w = u?.lastUpdated || 0, b = u?.lastSyncedWithServer || 0;
      a && C > w ? (y = e.serverState.data, _ = !0) : u && w > b && (y = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(y)), o.getState().initializeShadowState(h, s), Ht(
        h,
        s,
        y,
        at,
        et.current,
        U
      ), _ && E && U && Vt(y, h, e, U, Date.now()), ut(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || j({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...r || []
  ]), lt(() => {
    z && xt(h, {
      serverSync: m,
      formElements: I,
      initialState: s,
      localStorage: g,
      middleware: R.current?.middleware
    });
    const e = `${h}////${et.current}`, n = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => j({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: N || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, n), j({}), () => {
      n && (n.components.delete(e), n.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const at = (e, n, a, i) => {
    if (Array.isArray(n)) {
      const u = `${h}-${n.join(".")}`;
      gt.current.add(u);
    }
    const f = o.getState();
    nt(h, (u) => {
      const E = tt(e) ? e(u) : e, y = `${h}-${n.join(".")}`;
      if (y) {
        let P = !1, $ = f.signalDomElements.get(y);
        if ((!$ || $.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const D = n.slice(0, -1), V = Z(E, D);
          if (Array.isArray(V)) {
            P = !0;
            const O = `${h}-${D.join(".")}`;
            $ = f.signalDomElements.get(O);
          }
        }
        if ($) {
          const D = P ? Z(E, n.slice(0, -1)) : Z(E, n);
          $.forEach(({ parentId: V, position: O, effect: A }) => {
            const H = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if (H) {
              const G = Array.from(H.childNodes);
              if (G[O]) {
                const F = A ? new Function("state", `return (${A})(state)`)(D) : D;
                G[O].textContent = String(F);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), a.updateType === "update" && (i || R.current?.validation?.key) && n && Q(
        (i || R.current?.validation?.key) + "." + n.join(".")
      );
      const _ = n.slice(0, n.length - 1);
      a.updateType === "cut" && R.current?.validation?.key && Q(
        R.current?.validation?.key + "." + _.join(".")
      ), a.updateType === "insert" && R.current?.validation?.key && Qt(
        R.current?.validation?.key + "." + _.join(".")
      ).filter(([$, D]) => {
        let V = $?.split(".").length;
        if ($ == _.join(".") && V == _.length - 1) {
          let O = $ + "." + _;
          Q($), Dt(O, D);
        }
      });
      const C = f.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const P = At(u, E), $ = new Set(P), D = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          V,
          O
        ] of C.components.entries()) {
          let A = !1;
          const H = Array.isArray(O.reactiveType) ? O.reactiveType : [O.reactiveType || "component"];
          if (console.log("component", O), !H.includes("none")) {
            if (H.includes("all")) {
              O.forceUpdate();
              continue;
            }
            if (H.includes("component") && ((O.paths.has(D) || O.paths.has("")) && (A = !0), !A))
              for (const G of $) {
                let F = G;
                for (; ; ) {
                  if (O.paths.has(F)) {
                    A = !0;
                    break;
                  }
                  const st = F.lastIndexOf(".");
                  if (st !== -1) {
                    const ft = F.substring(
                      0,
                      st
                    );
                    if (!isNaN(
                      Number(F.substring(st + 1))
                    ) && O.paths.has(ft)) {
                      A = !0;
                      break;
                    }
                    F = ft;
                  } else
                    F = "";
                  if (F === "")
                    break;
                }
                if (A) break;
              }
            if (!A && H.includes("deps") && O.depsFunction) {
              const G = O.depsFunction(E);
              let F = !1;
              typeof G == "boolean" ? G && (F = !0) : J(O.deps, G) || (O.deps = G, F = !0), F && (A = !0);
            }
            A && O.forceUpdate();
          }
        }
      }
      const w = Date.now();
      n = n.map((P, $) => {
        const D = n.slice(0, -1), V = Z(E, D);
        return $ === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (V.length - 1).toString() : P;
      });
      const { oldValue: b, newValue: B } = ne(
        a.updateType,
        u,
        E,
        n
      ), Y = {
        timeStamp: w,
        stateKey: h,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: b,
        newValue: B
      };
      switch (a.updateType) {
        case "update":
          f.updateShadowAtPath(h, n, E);
          break;
        case "insert":
          const P = n.slice(0, -1);
          f.insertShadowArrayElement(h, P, B);
          break;
        case "cut":
          const $ = n.slice(0, -1), D = parseInt(n[n.length - 1]);
          f.removeShadowArrayElement(h, $, D);
          break;
      }
      if (Kt(h, (P) => {
        const D = [...P ?? [], Y].reduce((V, O) => {
          const A = `${O.stateKey}:${JSON.stringify(O.path)}`, H = V.get(A);
          return H ? (H.timeStamp = Math.max(H.timeStamp, O.timeStamp), H.newValue = O.newValue, H.oldValue = H.oldValue ?? O.oldValue, H.updateType = O.updateType) : V.set(A, { ...O }), V;
        }, /* @__PURE__ */ new Map());
        return Array.from(D.values());
      }), Vt(
        E,
        h,
        R.current,
        U
      ), R.current?.middleware && R.current.middleware({
        updateLog: l,
        update: Y
      }), R.current?.serverSync) {
        const P = f.serverState[h], $ = R.current?.serverSync;
        te(h, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: E }),
          rollBackState: P,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[h] || (Tt(
    h,
    It(
      h,
      at,
      et.current,
      U
    )
  ), o.getState().cogsStateStore[h] || nt(h, t), o.getState().initialStateGlobal[h] || Ct(h, t));
  const d = wt(() => It(
    h,
    at,
    et.current,
    U
  ), [h, U]);
  return [Rt(h), d];
}
function It(t, c, m, g) {
  const I = /* @__PURE__ */ new Map();
  let N = 0;
  const p = (T) => {
    const r = T.join(".");
    for (const [S] of I)
      (S === r || S.startsWith(r + ".")) && I.delete(S);
    N++;
  }, v = {
    removeValidation: (T) => {
      T?.validationKey && Q(T.validationKey);
    },
    revertToInitialState: (T) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && Q(r?.key), T?.validationKey && Q(T.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), I.clear(), N++;
      const W = s(S, []), j = rt(t), U = tt(j?.localStorage?.key) ? j?.localStorage?.key(S) : j?.localStorage?.key, z = `${g}-${t}-${U}`;
      z && localStorage.removeItem(z), Tt(t, W), nt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (T) => {
      I.clear(), N++;
      const r = It(
        t,
        c,
        m,
        g
      ), S = o.getState().initialStateGlobal[t], W = rt(t), j = tt(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, U = `${g}-${t}-${j}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Ft(() => {
        Ct(t, T), o.getState().initializeShadowState(t, T), Tt(t, r), nt(t, T);
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
      const T = o.getState().serverState[t];
      return !!(T && J(T, Rt(t)));
    }
  };
  function s(T, r = [], S) {
    const W = r.map(String).join(".");
    I.get(W);
    const j = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(v).forEach((h) => {
      j[h] = v[h];
    });
    const U = {
      apply(h, l, gt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, r);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(T) && (S = { ...S, validIndices: void 0 });
        const gt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !gt.has(l)) {
          const d = `${t}////${m}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(d);
            if (n && !n.paths.has("")) {
              const a = r.join(".");
              let i = !0;
              for (const f of n.paths)
                if (a.startsWith(f) && (a === f || a[f.length] === ".")) {
                  i = !1;
                  break;
                }
              i && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => At(
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
                  const E = [a, ...u.path].join(".");
                  o.getState().addValidationError(E, u.message);
                });
                const f = o.getState().stateComponents.get(t);
                f && f.components.forEach((u) => {
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
        if (Array.isArray(T)) {
          const d = () => S?.validIndices ? T.map((n, a) => ({
            item: n,
            originalIndex: S.validIndices[a]
          })) : o.getState().getNestedState(t, r).map((n, a) => ({
            item: n,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, r.join("."));
              if (e !== void 0)
                return s(
                  T[e],
                  [...r, e.toString()],
                  S
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
                dependencies: f = []
              } = e, u = q(!1), E = q(null), [y, _] = K({
                startIndex: 0,
                endIndex: 10
              }), [C, w] = K("IDLE_AT_TOP"), b = q(!1), B = q(0), Y = q(f), P = q(0), [$, D] = K(0), V = q(null);
              ot(() => o.getState().subscribeToShadowState(t, () => {
                D((M) => M + 1);
              }), [t]);
              const O = o().getNestedState(
                t,
                r
              ), A = O.length, { totalHeight: H, positions: G } = wt(() => {
                const k = o.getState().getShadowMetadata(t, r) || [];
                let M = 0;
                const L = [];
                for (let x = 0; x < A; x++) {
                  L[x] = M;
                  const X = k[x]?.virtualizer?.itemHeight;
                  M += X || n;
                }
                return { totalHeight: M, positions: L };
              }, [
                A,
                t,
                r.join("."),
                n,
                $
              ]), F = wt(() => {
                const k = Math.max(0, y.startIndex), M = Math.min(A, y.endIndex), L = Array.from(
                  { length: M - k },
                  (X, it) => k + it
                ), x = L.map((X) => O[X]);
                return s(x, r, {
                  ...S,
                  validIndices: L
                });
              }, [y.startIndex, y.endIndex, O, A]);
              lt(() => {
                const k = E.current;
                if (!k) return;
                const M = A > B.current;
                if (M && V.current) {
                  const { top: L, height: x } = V.current;
                  b.current = !0, k.scrollTop = L + (k.scrollHeight - x), console.log(
                    `ANCHOR RESTORED to scrollTop: ${k.scrollTop}`
                  ), setTimeout(() => {
                    b.current = !1;
                  }, 100), V.current = null;
                } else {
                  if (!J(
                    f,
                    Y.current
                  )) {
                    console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), w("IDLE_AT_TOP");
                    return;
                  }
                  M && C === "LOCKED_AT_BOTTOM" && i && (console.log(
                    "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                  ), w("GETTING_HEIGHTS"));
                }
                B.current = A, Y.current = f;
              }, [A, ...f]), lt(() => {
                const k = E.current;
                if (!k) return;
                let M;
                if (C === "IDLE_AT_TOP" && i && A > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), w("GETTING_HEIGHTS");
                else if (C === "GETTING_HEIGHTS") {
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), _({
                    startIndex: Math.max(0, A - 10 - a),
                    endIndex: A
                  });
                  let L = 0;
                  const x = 50;
                  M = setInterval(() => {
                    L++;
                    const X = A - 1, yt = (o.getState().getShadowMetadata(t, r) || [])[X]?.virtualizer?.itemHeight || 0;
                    console.log(
                      `ACTION (GETTING_HEIGHTS): attempt ${L}, lastItemHeight =`,
                      yt
                    ), yt > 0 ? (clearInterval(M), console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), w("SCROLLING_TO_BOTTOM")) : L >= x && (clearInterval(M), console.log(
                      "ACTION (GETTING_HEIGHTS): Timeout - proceeding anyway"
                    ), w("SCROLLING_TO_BOTTOM"));
                  }, 100);
                } else if (C === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), b.current = !0;
                  const L = B.current === 0 ? "auto" : "smooth";
                  k.scrollTo({
                    top: k.scrollHeight,
                    behavior: L
                  });
                  const x = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), b.current = !1, u.current = !1, w("LOCKED_AT_BOTTOM");
                    },
                    L === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(x);
                }
                return () => {
                  M && clearInterval(M);
                };
              }, [C, A, G]), ot(() => {
                const k = E.current;
                if (!k) return;
                const M = n, L = () => {
                  if (b.current)
                    return;
                  const { scrollTop: x, scrollHeight: X, clientHeight: it } = k;
                  if (X - x - it < 10 ? (C !== "LOCKED_AT_BOTTOM" && w("LOCKED_AT_BOTTOM"), V.current = null) : (C !== "IDLE_NOT_AT_BOTTOM" && w("IDLE_NOT_AT_BOTTOM"), V.current = {
                    top: x,
                    height: X
                  }), Math.abs(x - P.current) < M)
                    return;
                  console.log(
                    `Threshold passed at ${x}px. Recalculating range...`
                  );
                  let pt = A - 1, Et = 0, $t = 0;
                  for (; Et <= pt; ) {
                    const mt = Math.floor((Et + pt) / 2);
                    G[mt] < x ? ($t = mt, Et = mt + 1) : pt = mt - 1;
                  }
                  const kt = Math.max(0, $t - a);
                  let St = kt;
                  const Ut = x + it;
                  for (; St < A && G[St] < Ut; )
                    St++;
                  _({
                    startIndex: kt,
                    endIndex: Math.min(A, St + a)
                  }), P.current = x;
                };
                return k.addEventListener("scroll", L, {
                  passive: !0
                }), () => k.removeEventListener("scroll", L);
              }, [A, G, n, a, C]);
              const st = bt(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), w("SCROLLING_TO_BOTTOM");
              }, []), ft = bt(
                (k, M = "smooth") => {
                  E.current && G[k] !== void 0 && (w("IDLE_NOT_AT_BOTTOM"), E.current.scrollTo({
                    top: G[k],
                    behavior: M
                  }));
                },
                [G]
              ), jt = {
                outer: {
                  ref: E,
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
                    transform: `translateY(${G[y.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: F,
                virtualizerProps: jt,
                scrollToBottom: st,
                scrollToIndex: ft
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, E) => e(u.item, E.item)
              ), i = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(i, r, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, E) => e(u, E)
              ), i = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(i, r, f);
            };
          if (l === "stateMap")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (i, f) => f)).map((i, f) => {
                const u = n[i], E = [...r, i.toString()], y = s(u, E, S);
                return e(u, y, {
                  register: () => {
                    const [, C] = K({}), w = `${m}-${r.join(".")}-${i}`;
                    lt(() => {
                      const b = `${t}////${w}`, B = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return B.components.set(b, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, B), () => {
                        const Y = o.getState().stateComponents.get(t);
                        Y && Y.components.delete(b);
                      };
                    }, [t, w]);
                  },
                  index: f,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${r.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => T.map((a, i) => {
              let f;
              S?.validIndices && S.validIndices[i] !== void 0 ? f = S.validIndices[i] : f = i;
              const u = [...r, f.toString()], E = s(a, u, S);
              return e(
                a,
                E,
                i,
                T,
                s(T, r, S)
              );
            });
          if (l === "$stateMap")
            return (e) => dt(oe, {
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
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (i, f) => f)).map((i, f) => {
                const u = n[i], E = [...r, i.toString()], y = s(u, E, S), _ = `${m}-${r.join(".")}-${i}`;
                return dt(se, {
                  key: i,
                  stateKey: t,
                  itemComponentId: _,
                  itemPath: E,
                  children: e(
                    u,
                    y,
                    { localIndex: f, originalIndex: i },
                    n,
                    s(n, r, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${r.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const n = T;
              I.clear(), N++;
              const a = n.flatMap(
                (i) => i[e] ?? []
              );
              return s(
                a,
                [...r, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const n = T[e];
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
            return (e) => (p(r), Ot(c, e, r, t), s(
              o.getState().getNestedState(t, r),
              r
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const i = o.getState().getNestedState(t, r), f = tt(e) ? e(i) : e;
              let u = null;
              if (!i.some((y) => {
                if (n) {
                  const C = n.every(
                    (w) => J(y[w], f[w])
                  );
                  return C && (u = y), C;
                }
                const _ = J(y, f);
                return _ && (u = y), _;
              }))
                p(r), Ot(c, f, r, t);
              else if (a && u) {
                const y = a(u), _ = i.map(
                  (C) => J(C, u) ? y : C
                );
                p(r), ct(c, _, r);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return p(r), ht(c, r, t, e), s(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < T.length; n++)
                T[n] === e && ht(c, r, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = T.findIndex((a) => a === e);
              n > -1 ? ht(c, r, t, n) : Ot(c, e, r, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: f }, u) => e(f, u)
              );
              if (!a) return;
              const i = [...r, a.originalIndex.toString()];
              return s(a.item, i, S);
            };
          if (l === "findWith")
            return (e, n) => {
              const i = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!i) return;
              const f = [...r, i.originalIndex.toString()];
              return s(i.item, f, S);
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
            if (S?.validIndices && Array.isArray(T)) {
              const d = o.getState().getNestedState(t, r);
              return S.validIndices.map((e) => d[e]);
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
          return (d) => vt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = r.slice(0, -1), e = d.join("."), n = o.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(r[r.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = r.slice(0, -1), n = Number(r[r.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, n) : o.getState().setSelectedIndex(t, a, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            ct(c, i, e), p(e);
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
            ct(c, i, d), p(d);
          };
        if (r.length == 0) {
          if (l === "addValidation")
            return (d) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              Q(e.key), console.log("addValidationError", d), d.forEach((n) => {
                const a = [e.key, ...n.path].join(".");
                console.log("fullErrorPath", a), Dt(a, n.message);
              }), ut(t);
            };
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Zt(e, d).newDocument;
              Ht(
                t,
                o.getState().initialStateGlobal[t],
                a,
                c,
                m,
                g
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const f = At(e, a), u = new Set(f);
                for (const [
                  E,
                  y
                ] of i.components.entries()) {
                  let _ = !1;
                  const C = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      y.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (y.paths.has("") && (_ = !0), !_))
                      for (const w of u) {
                        if (y.paths.has(w)) {
                          _ = !0;
                          break;
                        }
                        let b = w.lastIndexOf(".");
                        for (; b !== -1; ) {
                          const B = w.substring(0, b);
                          if (y.paths.has(B)) {
                            _ = !0;
                            break;
                          }
                          const Y = w.substring(
                            b + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const P = B.lastIndexOf(".");
                            if (P !== -1) {
                              const $ = B.substring(
                                0,
                                P
                              );
                              if (y.paths.has($)) {
                                _ = !0;
                                break;
                              }
                            }
                          }
                          b = B.lastIndexOf(".");
                        }
                        if (_) break;
                      }
                    if (!_ && C.includes("deps") && y.depsFunction) {
                      const w = y.depsFunction(a);
                      let b = !1;
                      typeof w == "boolean" ? w && (b = !0) : J(y.deps, w) || (y.deps = w, b = !0), b && (_ = !0);
                    }
                    _ && y.forceUpdate();
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
              Q(d.key);
              const n = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(d.key) && Q(f);
                });
                const i = d.zodSchema.safeParse(n);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const E = u.path, y = u.message, _ = [d.key, ...E].join(".");
                  e(_, y);
                }), ut(t), !1);
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
          }) => /* @__PURE__ */ _t(
            qt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
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
                ct(c, d, r, "");
                const n = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              ct(c, d, r, "");
              const n = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(n);
            }
            p(r);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ _t(
            Jt,
            {
              setState: c,
              stateKey: t,
              path: r,
              child: d,
              formOpts: e
            }
          );
        const R = [...r, l], at = o.getState().getNestedState(t, R);
        return s(at, R, S);
      }
    }, z = new Proxy(j, U);
    return I.set(W, {
      proxy: z,
      stateVersion: N
    }), z;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function Gt(t) {
  return dt(ae, { proxy: t });
}
function oe({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (I, N, p, v, s) => t._mapFn(I, N, p, v, s)
  ) : null;
}
function ae({
  proxy: t
}) {
  const c = q(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return ot(() => {
    const g = c.current;
    if (!g || !g.parentElement) return;
    const I = g.parentElement, p = Array.from(I.childNodes).indexOf(g);
    let v = I.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", v));
    const T = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: p,
      effect: t._effect
    };
    o.getState().addSignalElement(m, T);
    const r = o.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(r);
      } catch (j) {
        console.error("Error evaluating effect function during mount:", j), S = r;
      }
    else
      S = r;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    g.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), dt("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function pe(t) {
  const c = Bt(
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
  return dt("text", {}, String(c));
}
function se({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: g
}) {
  const [, I] = K({}), [N, p] = Xt(), v = q(null);
  return ot(() => {
    p.height > 0 && p.height !== v.current && (v.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), lt(() => {
    const s = `${t}////${c}`, T = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return T.components.set(s, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, T), () => {
      const r = o.getState().stateComponents.get(t);
      r && r.components.delete(s);
    };
  }, [t, c, m.join(".")]), /* @__PURE__ */ _t("div", { ref: N, children: g });
}
export {
  Gt as $cogsSignal,
  pe as $cogsSignalStore,
  Ie as addStateOptions,
  ve as createCogsState,
  ye as notifyComponent,
  re as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
